#pragma once

#include <Arduino.h>

class DisplayManager;
class TouchManager;
class UIManager;
class PreferencesManager;
class NfcManager;

/**
 * @brief Central system manager - coordinates all subsystems
 * 
 * Singleton pattern - manages initialization order and provides
 * global access to all major subsystems.
 */
class SystemManager {
public:
    static SystemManager& get_instance();
    
    // Lifecycle
    bool initialize();
    void shutdown();
    void update();
    
    // Subsystem access
    DisplayManager* get_display_manager();
    TouchManager* get_touch_manager();
    UIManager* get_ui_manager();
    PreferencesManager* get_preferences_manager();
    NfcManager* get_nfc_manager();
    
    // System info
    const char* get_app_name() const;
    const char* get_app_version() const;
    unsigned long get_uptime_ms() const;
    
private:
    SystemManager();
    ~SystemManager();
    SystemManager(const SystemManager&) = delete;
    SystemManager& operator=(const SystemManager&) = delete;
    
    DisplayManager* display_manager_;
    TouchManager* touch_manager_;
    UIManager* ui_manager_;
    PreferencesManager* preferences_manager_;
    NfcManager* nfc_manager_;
    
    bool initialized_;
    unsigned long start_time_ms_;
};
