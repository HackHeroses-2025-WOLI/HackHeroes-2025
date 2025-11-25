#include "network/api_client.h"
#include "hardware/network_manager.h"
#include "core/logger.h"
#include <HTTPClient.h>
#include <WiFi.h>

static String join_url(const String &base, const String &path)
{
    if (path.length() == 0)
        return base;
    if (base.endsWith("/"))
    {
        if (path.startsWith("/"))
            return base + path.substring(1);
        return base + path;
    }
    if (path.startsWith("/"))
        return base + path;
    return base + "/" + path;
}

ApiClient::ApiClient(NetworkManager *net, const String &base_url)
    : net_(net), base_url_(base_url) {}

bool ApiClient::get(const String &path, String &out_body, int &out_status, int timeout_ms)
{
    if (!net_)
        return false;
    if (!net_->is_connected())
    {
        Logger::println("ApiClient: not connected, trying to connect...");
        if (!net_->connect())
        {
            Logger::warning("ApiClient: cannot connect to network");
            return false;
        }
    }

    HTTPClient http;
    String url = join_url(base_url_, path);
    http.begin(url);
    http.setTimeout(timeout_ms);
    int code = http.GET();
    out_status = code;
    if (code > 0 && (code >= 200 && code < 300))
    {
        out_body = http.getString();
        http.end();
        return true;
    }
    Logger::printf("ApiClient GET failed: %d (%s)\n", code, url.c_str());
    out_body = http.getString();
    http.end();
    return false;
}

bool ApiClient::post(const String &path, const String &payload, String &out_body, int &out_status, int timeout_ms)
{
    if (!net_)
        return false;
    if (!net_->is_connected())
    {
        Logger::println("ApiClient: not connected, trying to connect...");
        if (!net_->connect())
        {
            Logger::warning("ApiClient: cannot connect to network");
            return false;
        }
    }

    HTTPClient http;
    String url = join_url(base_url_, path);
    http.begin(url);
    http.setTimeout(timeout_ms);
    http.addHeader("Content-Type", "application/json");
    int code = http.POST(payload);
    out_status = code;
    if (code > 0 && (code >= 200 && code < 300))
    {
        out_body = http.getString();
        http.end();
        return true;
    }
    Logger::printf("ApiClient POST failed: %d (%s)\n", code, url.c_str());
    out_body = http.getString();
    http.end();
    return false;
}
