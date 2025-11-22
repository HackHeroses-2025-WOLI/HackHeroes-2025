#include "core/system_manager.h"
#include "core/logger.h"
#include "hardware/display_manager.h"
#include "hardware/touch_manager.h"
#include "hardware/nfc_manager.h"
#include "ui/ui_manager.h"
#include "core/preferences_manager.h"
#include "ProjectConfig.h"

SystemManager& SystemManager::get_instance() {
    static SystemManager instance;
    return instance;
}

SystemManager::SystemManager()
    : display_manager_(nullptr)
    , touch_manager_(nullptr)
    , ui_manager_(nullptr)
    , preferences_manager_(nullptr)
    , nfc_manager_(nullptr)
    , initialized_(false)
    , start_time_ms_(0) {
}

SystemManager::~SystemManager() {
    shutdown();
}

bool SystemManager::initialize() {
    if (initialized_) {
        return true;
    }
    
    Logger::init(SERIAL_BAUD);
    Logger::separator();
    Logger::printf("%s v%s\n", APP_NAME, APP_VERSION);
    Logger::separator();
    
    start_time_ms_ = millis();
    
    // Initialize subsystems in order
    Logger::println("Initializing preferences...");
    preferences_manager_ = new PreferencesManager();
    if (!preferences_manager_->initialize()) {
        Logger::error("Failed to initialize preferences");
        return false;
    }
    
    Logger::println("Initializing display...");
    display_manager_ = new DisplayManager();
    if (!display_manager_->initialize()) {
        Logger::error("Failed to initialize display");
        return false;
    }
    
    Logger::println("Initializing touch...");
    touch_manager_ = new TouchManager();
    if (!touch_manager_->initialize()) {
        Logger::error("Failed to initialize touch");
        return false;
    }
    
    Logger::println("Initializing NFC...");
    nfc_manager_ = new NfcManager();
    if (!nfc_manager_->initialize()) {
        Logger::warning("NFC initialization failed - continuing without NFC");
        // Don't fail completely if NFC is not available
    }
    
    Logger::println("Initializing UI...");
    ui_manager_ = new UIManager();
    if (!ui_manager_->initialize()) {
        Logger::error("Failed to initialize UI");
        return false;
    }
    
    initialized_ = true;
    Logger::info("System initialization complete!");
    return true;
}

void SystemManager::shutdown() {
    if (!initialized_) {
        return;
    }
    
    delete ui_manager_;
    delete touch_manager_;
    delete display_manager_;
    delete preferences_manager_;
    delete nfc_manager_;
    
    ui_manager_ = nullptr;
    touch_manager_ = nullptr;
    display_manager_ = nullptr;
    preferences_manager_ = nullptr;
    nfc_manager_ = nullptr;
    
    initialized_ = false;
}

void SystemManager::update() {
    if (!initialized_) {
        return;
    }
    
    // Update subsystems
    touch_manager_->update();
    if (nfc_manager_) {
        nfc_manager_->update();
    }
    ui_manager_->update();
}

DisplayManager* SystemManager::get_display_manager() {
    return display_manager_;
}

TouchManager* SystemManager::get_touch_manager() {
    return touch_manager_;
}

UIManager* SystemManager::get_ui_manager() {
    return ui_manager_;
}

PreferencesManager* SystemManager::get_preferences_manager() {
    return preferences_manager_;
}

NfcManager* SystemManager::get_nfc_manager() {
    return nfc_manager_;
}

const char* SystemManager::get_app_name() const {
    return APP_NAME;
}

const char* SystemManager::get_app_version() const {
    return APP_VERSION;
}

unsigned long SystemManager::get_uptime_ms() const {
    return millis() - start_time_ms_;
}
