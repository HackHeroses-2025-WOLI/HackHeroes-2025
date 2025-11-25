#pragma once

#include <Arduino.h>
#include <Preferences.h>

/**
 * @brief Manages persistent configuration using ESP32 NVS (Non-Volatile Storage)
 * 
 * Provides type-safe access to stored preferences with default fallbacks.
 * All keys use snake_case naming convention.
 */
class PreferencesManager {
public:
    PreferencesManager();
    ~PreferencesManager();
    
    bool initialize();
    
    // Generic get/set with defaults
    String get_string(const char* key, const String& default_value = "");
    bool set_string(const char* key, const String& value);
    
    int get_int(const char* key, int default_value = 0);
    bool set_int(const char* key, int value);
    
    bool get_bool(const char* key, bool default_value = false);
    bool set_bool(const char* key, bool value);
    
    float get_float(const char* key, float default_value = 0.0f);
    bool set_float(const char* key, float value);
    
    // Bulk operations
    bool clear_all();
    bool remove_key(const char* key);
    bool exists(const char* key);
    
    // Save/commit changes (if using delayed writes)
    bool commit();
    
private:
    Preferences preferences_;
    bool initialized_;
    static const char* NAMESPACE;
};
