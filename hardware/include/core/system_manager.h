#pragma once

#include <Arduino.h>
#include <vector>

class DisplayManager;
class TouchManager;
class UIManager;
class PreferencesManager;
class NfcManager;
class NetworkManager;

/**
 * @brief Central system manager - coordinates all subsystems
 *
 * Singleton pattern - manages initialization order and provides
 * global access to all major subsystems.
 */
/**
 * @brief Central system manager coordinating subsystems and initialization
 *
 * Singleton that owns major subsystems (display, touch, NFC, network, UI)
 * and performs the multi-phase initialization sequence. Screens use the
 * SystemManager to obtain subsystem pointers.
 */
class SystemManager
{
public:
    /**
     * @brief Access the global SystemManager singleton
     * @return reference to the SystemManager instance
     */
    static SystemManager &get_instance();

    // Lifecycle
    // Synchronous initialize (compat)
    /**
     * @brief Synchronous, blocking initialization of the system
     *
     * Initializes all subsystems in a single call. Returns true when
     * initialization succeeded.
     */
    bool initialize();
    // Start non-blocking iterative initialization. SplashScreen can monitor progress.
    /**
     * @brief Start a non-blocking, iterative initialization sequence
     *
     * Callers may use the splash screen to observe progress while this
     * method steps through subsystems over multiple update() calls.
     */
    void start_initialization();
    /** @return true when iterative initialization has started */
    bool is_initialization_started() const;
    /** @return true when system initialization has finished successfully */
    bool is_initialization_complete() const;
    /** @return true when iterative initialization failed */
    bool is_initialization_failed() const;
    /** @return textual error (if any) describing why initialization failed */
    const char *get_initialization_error() const;
    /** @return current initialization phase name (Preferences, Display, NFC, UI, Network, Completed) */
    const char *get_initialization_phase_name() const;
    void shutdown();
    /** @brief Periodic update called from main loop to drive iterative initialization and managers */
    void update();

    // Subsystem access
    /** @return pointer to display manager (or nullptr) */
    DisplayManager *get_display_manager();
    /** @return pointer to touch manager (or nullptr) */
    TouchManager *get_touch_manager();
    /** @return pointer to UI manager (or nullptr) */
    UIManager *get_ui_manager();
    /** @return pointer to Preferences manager (or nullptr) */
    PreferencesManager *get_preferences_manager();
    /** @return pointer to NFC manager (or nullptr) */
    NfcManager *get_nfc_manager();
    /** @return pointer to Network manager (or nullptr) */
    NetworkManager *get_network_manager();
    /** @return true when report type names have been loaded from backend */
    bool has_report_type_names() const;
    /** @return reference to the loaded report-type names */
    const std::vector<String> &get_report_type_names() const;

    // System info
    /** @return application name (compile-time constant) */
    const char *get_app_name() const;
    /** @return application version string (compile-time constant) */
    const char *get_app_version() const;
    /** @return milliseconds since the SystemManager recorded its start time */
    unsigned long get_uptime_ms() const;

private:
    SystemManager();
    ~SystemManager();
    SystemManager(const SystemManager &) = delete;
    SystemManager &operator=(const SystemManager &) = delete;

    DisplayManager *display_manager_;
    TouchManager *touch_manager_;
    UIManager *ui_manager_;
    PreferencesManager *preferences_manager_;
    NfcManager *nfc_manager_;
    NetworkManager *network_manager_;
    std::vector<String> report_type_names_;
    bool report_types_loaded_;
    bool report_types_requested_;
    unsigned long last_report_type_attempt_ms_;

    bool initialized_;
    unsigned long start_time_ms_;
    // Iterative initialization state
    bool init_started_;
    bool init_failed_;
    String init_error_;
    enum class InitPhase
    {
        NotStarted,
        Preferences,
        Display,
        Touch,
        NFC,
        UI,
        Network,
        Completed
    } init_phase_;

    void fetch_report_types_once();
    bool parse_report_type_names(const String &json, std::vector<String> &out_names);
};
