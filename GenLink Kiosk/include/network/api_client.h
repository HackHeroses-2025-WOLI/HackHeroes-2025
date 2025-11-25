#pragma once

#include <Arduino.h>
#include "ProjectConfig.h" // provide API_BASE_URL default

class NetworkManager;

/**
 * Simple API client that performs HTTP requests using NetworkManager
 * Base URL configured via ProjectConfig.h -> API_BASE_URL
 */
class ApiClient
{
public:
    explicit ApiClient(NetworkManager *net, const String &base_url = String(API_BASE_URL));

    // Perform an HTTP GET against base_url + path. Returns true on success.
    bool get(const String &path, String &out_body, int &out_status, int timeout_ms = 5000);

    // Perform an HTTP POST with payload (JSON or form). Returns true on success.
    bool post(const String &path, const String &payload, String &out_body, int &out_status, int timeout_ms = 5000);

private:
    NetworkManager *net_;
    String base_url_;
};
