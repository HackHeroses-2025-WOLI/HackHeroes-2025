#include "hardware/network_manager.h"
#include "core/logger.h"
#include "ProjectConfig.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ctype.h>
#include <math.h>

namespace
{
    constexpr const char *REPORTS_ENDPOINT = API_BASE_URL "/api/v1/reports/";
    constexpr const char *REPORT_TYPES_ENDPOINT = API_BASE_URL "/api/v1/types/report_types";
    constexpr const char *REPORT_METRICS_ENDPOINT = API_BASE_URL "/api/v1/reports/metrics/avg-response-time";
}

NetworkManager::NetworkManager()
    : initialized_(false), last_connect_attempt_ms_(0), reconnect_interval_ms_(10000) {}

NetworkManager::~NetworkManager() {}

bool NetworkManager::initialize()
{
    if (initialized_)
        return true;
    // Leave WiFi off until explicitly asked to connect
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    initialized_ = true;
    Logger::info("NetworkManager initialized");
    return true;
}

bool NetworkManager::connect(const char *ssid, const char *password, uint32_t timeout_ms)
{
    if (!initialized_)
        initialize();

    if (is_connected())
    {
        return true;
    }

    Logger::printf("Connecting to WiFi '%s'...\n", ssid);
    WiFi.begin(ssid, password);

    unsigned long start = millis();
    while (millis() - start < timeout_ms)
    {
        if (WiFi.status() == WL_CONNECTED)
        {
            // Connected — fetch current DHCP values and explicitly set DNS while
            // keeping current IP/gateway/subnet. This helps if the DHCP-provided
            // DNS is not propagated correctly to the stack.
            IPAddress ip = WiFi.localIP();
            IPAddress gw = WiFi.gatewayIP();
            IPAddress nm = WiFi.subnetMask();
            IPAddress dns1(8, 8, 8, 8); // Google
            IPAddress dns2(1, 1, 1, 1); // Cloudflare

            bool cfg_ok = WiFi.config(ip, gw, nm, dns1, dns2);
            if (!cfg_ok)
            {
                Logger::warning("NetworkManager: WiFi.config failed to set DNS — continuing with DHCP defaults");
            }

            Logger::printf("WiFi connected, IP: %s\n", ip.toString().c_str());
            Logger::printf("DNS configured: %s, %s (config_ok=%d)\n", dns1.toString().c_str(), dns2.toString().c_str(), cfg_ok ? 1 : 0);
            return true;
        }
        delay(200);
    }

    Logger::warning("WiFi connection timed out");
    return false;
}

void NetworkManager::disconnect()
{
    WiFi.disconnect(true);
}

bool NetworkManager::is_connected() const
{
    return WiFi.status() == WL_CONNECTED;
}

IPAddress NetworkManager::local_ip() const
{
    return WiFi.localIP();
}

int32_t NetworkManager::rssi() const
{
    if (!is_connected())
        return 0;
    return WiFi.RSSI();
}

void NetworkManager::update()
{
    // Attempt reconnect periodically if disconnected
    if (!is_connected())
    {
        unsigned long now = millis();
        if (now - last_connect_attempt_ms_ >= reconnect_interval_ms_)
        {
            last_connect_attempt_ms_ = now;
            if (WiFi.SSID() != "")
            {
                // try reconnect using last configured credentials
                WiFi.reconnect();
            }
        }
    }
}

bool NetworkManager::http_get(const char *url, String &response, uint32_t timeout_ms)
{
    if (!url || !*url)
    {
        Logger::warning("NetworkManager::http_get called with empty URL");
        return false;
    }
    if (!is_connected())
    {
        Logger::println("NetworkManager::http_get attempting to connect...");
        if (!connect())
        {
            Logger::warning("NetworkManager::http_get aborted, WiFi disconnected");
            return false;
        }
        // Give DNS time to stabilize after fresh connection
        delay(500);
    }

    Logger::printf("NetworkManager::http_get URL: %s\n", url);

    HTTPClient http;
    http.setTimeout(timeout_ms);
    const bool is_https = strncmp(url, "https://", 8) == 0;

    if (is_https)
    {
        WiFiClientSecure client;
        client.setInsecure();
        if (!http.begin(client, url))
        {
            Logger::warning("NetworkManager::http_get failed to begin TLS session");
            return false;
        }

        const int status = http.GET();
        bool success = false;
        if (status > 0)
        {
            response = http.getString();
            success = (status >= 200 && status < 300);
            if (!success)
            {
                Logger::printf("NetworkManager::http_get HTTP %d, body: %s\n", status, response.c_str());
            }
            else
            {
                Logger::printf("NetworkManager::http_get HTTP %d OK\n", status);
            }
        }
        else
        {
            Logger::printf("NetworkManager::http_get request error: %d\n", status);
        }

        http.end();
        return success;
    }

    // plain http
    WiFiClient client;
    if (!http.begin(client, url))
    {
        Logger::warning("NetworkManager::http_get failed to begin session");
        return false;
    }

    const int status = http.GET();
    bool success = false;
    if (status > 0)
    {
        response = http.getString();
        success = (status >= 200 && status < 300);
        if (!success)
        {
            Logger::printf("NetworkManager::http_get HTTP %d, body: %s\n", status, response.c_str());
        }
        else
        {
            Logger::printf("NetworkManager::http_get HTTP %d OK\n", status);
        }
    }
    else
    {
        Logger::printf("NetworkManager::http_get request error: %d\n", status);
    }

    http.end();
    return success;
}

bool NetworkManager::http_post(const char *url, const String &body, String &response, const char *content_type, uint32_t timeout_ms)
{
    if (!url || !*url)
    {
        Logger::warning("NetworkManager::http_post called with empty URL");
        return false;
    }
    if (!is_connected())
    {
        Logger::println("NetworkManager::http_post attempting to connect...");
        if (!connect())
        {
            Logger::warning("NetworkManager::http_post aborted, WiFi disconnected");
            return false;
        }
        // Give DNS time to stabilize after fresh connection
        delay(500);
    }

    Logger::printf("NetworkManager::http_post URL: %s\n", url);

    HTTPClient http;
    http.setTimeout(timeout_ms);
    const bool is_https = strncmp(url, "https://", 8) == 0;

    if (is_https)
    {
        WiFiClientSecure client;
        client.setInsecure();
        if (!http.begin(client, url))
        {
            Logger::warning("NetworkManager::http_post failed to begin TLS session");
            return false;
        }

        if (content_type && *content_type)
        {
            http.addHeader("Content-Type", content_type);
        }

        const int status = http.POST(body);
        bool success = false;
        if (status > 0)
        {
            response = http.getString();
            success = (status >= 200 && status < 300);
            if (!success)
            {
                Logger::printf("NetworkManager::http_post HTTP %d, body: %s\n", status, response.c_str());
            }
            else
            {
                Logger::printf("NetworkManager::http_post HTTP %d OK\n", status);
            }
        }
        else
        {
            Logger::printf("NetworkManager::http_post request error: %d\n", status);
        }

        http.end();
        return success;
    }

    // plain HTTP
    WiFiClient client;
    if (!http.begin(client, url))
    {
        Logger::warning("NetworkManager::http_post failed to begin session");
        return false;
    }

    if (content_type && *content_type)
    {
        http.addHeader("Content-Type", content_type);
    }

    const int status = http.POST(body);
    bool success = false;
    if (status > 0)
    {
        response = http.getString();
        success = (status >= 200 && status < 300);
        if (!success)
        {
            Logger::printf("NetworkManager::http_post HTTP %d, body: %s\n", status, response.c_str());
        }
        else
        {
            Logger::printf("NetworkManager::http_post HTTP %d OK\n", status);
        }
    }
    else
    {
        Logger::printf("NetworkManager::http_post request error: %d\n", status);
    }

    http.end();
    return success;
}

bool NetworkManager::submit_report(const char *full_name, const char *phone, String *response, uint32_t timeout_ms)
{
    const char *safe_name = (full_name && *full_name) ? full_name : "";
    const char *safe_phone = (phone && *phone) ? phone : "";

    String payload;
    payload.reserve(256);
    payload += "{\"full_name\":\"";
    payload += safe_name;
    payload += "\",\"phone\":\"";
    payload += safe_phone;
    payload += "\",\"age\":1";
    payload += ",\"address\":\"";
    payload += BUILDING_ADDRESS;
    payload += "\",\"city\":\"";
    payload += LOCATION;
    payload += "\",\"problem\":\"[GenLink Kiosk]\"";
    payload += ",\"contact_ok\":true";
    payload += ",\"report_type_id\":1";
    payload += ",\"report_details\":\"Zgloszenie zlozone z GenLink Kiosk\"}";

    String local_response;
    String &target_response = response ? *response : local_response;
    const bool ok = http_post(REPORTS_ENDPOINT, payload, target_response, "application/json", timeout_ms);
    if (!ok)
    {
        Logger::warning("NetworkManager::submit_report failed");
    }
    return ok;
}

bool NetworkManager::fetch_report_types(String &response, uint32_t timeout_ms)
{
    const bool ok = http_get(REPORT_TYPES_ENDPOINT, response, timeout_ms);
    if (!ok)
    {
        Logger::warning("NetworkManager::fetch_report_types failed");
    }
    return ok;
}

bool NetworkManager::fetch_avg_response_time(int &out_minutes, uint32_t timeout_ms)
{
    out_minutes = -1;
    String response;
    if (!http_get(REPORT_METRICS_ENDPOINT, response, timeout_ms))
    {
        Logger::warning("NetworkManager::fetch_avg_response_time failed to GET metrics");
        return false;
    }
    // The server may respond with a plain number or with JSON like
    // {"average_response_minutes": 7.8} or {"average_response_minutes": null}

    // Find the key if JSON, else try parsing the entire response
    String trimmed = response;
    trimmed.trim();

    // Helper to parse a numeric substring into minutes (round to nearest)
    auto parse_number = [&](const String &s) -> long
    {
        // use toFloat to support fractional values
        float f = s.toFloat();
        if (isnan(f) || f <= 0.0f)
            return -1;
        long rounded = static_cast<long>(f + 0.5f);
        return rounded > 0 ? rounded : -1;
    };

    // If JSON-like, try to find the key
    int key_pos = trimmed.indexOf("average_response_minutes");
    if (key_pos >= 0)
    {
        int colon = trimmed.indexOf(':', key_pos);
        if (colon < 0)
        {
            Logger::warning("NetworkManager::fetch_avg_response_time malformed JSON (no colon)");
            return false;
        }

        int value_start = colon + 1;
        // skip spaces
        while (value_start < (int)trimmed.length() && isspace(trimmed.charAt(value_start)))
            ++value_start;

        if (value_start >= (int)trimmed.length())
        {
            Logger::warning("NetworkManager::fetch_avg_response_time missing value");
            return false;
        }

        // If 'null' -> treat as unavailable
        if (trimmed.startsWith("null", value_start) || trimmed.startsWith("NULL", value_start))
        {
            Logger::printf("NetworkManager::fetch_avg_response_time -> null\n");
            return false;
        }

        // Extract a token that could be a number (digits, optional sign, decimal, exponent)
        int end = value_start;
        bool seen_digit = false;
        while (end < (int)trimmed.length())
        {
            char c = trimmed.charAt(end);
            if ((c >= '0' && c <= '9') || c == '+' || c == '-' || c == '.' || c == 'e' || c == 'E')
            {
                seen_digit = true;
                ++end;
                continue;
            }
            // stop at a delimiter
            if (seen_digit)
                break;
            if (c == '"' || c == ',' || c == '}' || isspace(c))
                break;
            ++end;
        }

        String token = trimmed.substring(value_start, end);
        token.trim();
        long val = parse_number(token);
        if (val <= 0)
        {
            Logger::warning("NetworkManager::fetch_avg_response_time could not parse numeric value from JSON");
            return false;
        }

        out_minutes = static_cast<int>(val);
        Logger::printf("NetworkManager::fetch_avg_response_time -> %d minutes\n", out_minutes);
        return true;
    }

    // Fallback: try to parse the whole response as number
    long val = parse_number(trimmed);
    if (val <= 0)
    {
        Logger::warning("NetworkManager::fetch_avg_response_time could not parse minutes from response");
        return false;
    }

    out_minutes = static_cast<int>(val);
    Logger::printf("NetworkManager::fetch_avg_response_time -> %d minutes\n", out_minutes);
    return true;
}
