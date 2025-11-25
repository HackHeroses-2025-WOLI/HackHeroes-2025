#pragma once

#include <Arduino.h>
#include "ProjectConfig.h" // provide WIFI_SSID / WIFI_PASSWORD defaults

/**
 * NetworkManager - manages WiFi connection on ESP32
 *
 * Lightweight helper to connect/reconnect and provide connection info.
 */
class NetworkManager
{
public:
    NetworkManager();
    ~NetworkManager();

    // Initialize internal state (does not connect yet)
    bool initialize();

    // Connect with provided credentials (defaults come from ProjectConfig.h)
    bool connect(const char *ssid = WIFI_SSID, const char *password = WIFI_PASSWORD, uint32_t timeout_ms = 10000);
    void disconnect();

    // Connection status
    bool is_connected() const;
    IPAddress local_ip() const;
    int32_t rssi() const;

    // Call periodically to keep connection alive / attempt reconnect
    void update();

    // Basic HTTP helpers
    bool http_get(const char *url, String &response, uint32_t timeout_ms = 5000);
    bool http_post(const char *url, const String &body, String &response, const char *content_type = "application/json", uint32_t timeout_ms = 5000);

    // Convenience helpers for GenLink backend
    bool submit_report(const char *full_name, const char *phone, String *response = nullptr, uint32_t timeout_ms = 5000);
    bool fetch_report_types(String &response, uint32_t timeout_ms = 15000);
    // Fetch average response time in minutes from metrics API. Returns true on success
    // and writes parsed integer minutes to out_minutes.
    bool fetch_avg_response_time(int &out_minutes, uint32_t timeout_ms = 5000);

private:
    bool initialized_;
    unsigned long last_connect_attempt_ms_;
    uint32_t reconnect_interval_ms_;
};
