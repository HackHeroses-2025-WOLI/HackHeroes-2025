#include "hardware/nfc_manager.h"
#include "core/logger.h"
#include "config.h"

NfcManager::NfcManager()
    : nfc_(nullptr)
    , initialized_(false)
    , card_present_(false)
    , last_card_present_(false)
    , last_read_time_(0)
    , on_card_detected_(nullptr)
    , on_card_removed_(nullptr)
    , firmware_version_major_(0)
    , firmware_version_minor_(0) {
}

NfcManager::~NfcManager() {
    delete nfc_;
}

bool NfcManager::initialize() {
    if (initialized_) {
        return true;
    }
    
    // Initialize I2C
    Wire.begin(PN532_SDA_PIN, PN532_SCL_PIN);
    
    // Initialize PN532
    nfc_ = new Adafruit_PN532(PN532_IRQ, PN532_RESET, &Wire);
    nfc_->begin();
    
    // Get firmware version
    uint32_t versiondata = nfc_->getFirmwareVersion();
    if (!versiondata) {
        Logger::error("PN532 not found - check wiring!");
        delete nfc_;
        nfc_ = nullptr;
        return false;
    }
    
    firmware_version_major_ = (versiondata >> 16) & 0xFF;
    firmware_version_minor_ = (versiondata >> 8) & 0xFF;
    
    Logger::printf("PN532 firmware v%d.%d detected\n", 
                   firmware_version_major_, firmware_version_minor_);
    
    // Configure to read RFID tags
    nfc_->SAMConfig();
    
    initialized_ = true;
    Logger::info("NFC Manager initialized");
    return true;
}

void NfcManager::update() {
    if (!initialized_) {
        return;
    }
    
    unsigned long now = millis();
    
    // Throttle reads to avoid overwhelming the sensor
    if (now - last_read_time_ < READ_INTERVAL_MS) {
        return;
    }
    
    last_read_time_ = now;
    check_for_card();
}

void NfcManager::check_for_card() {
    uint8_t uid[7];
    uint8_t uid_length;
    
    // Non-blocking read with short timeout
    bool success = nfc_->readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uid_length, 50);
    
    last_card_present_ = card_present_;
    
    if (success) {
        // Card detected
        current_card_.uid_length = uid_length;
        memcpy(current_card_.uid, uid, uid_length);
        current_card_.detected_time_ms = millis();
        
        // Check if it's a new card
        if (!card_present_ || !current_card_.equals(last_card_)) {
            last_card_ = current_card_;
            card_present_ = true;
            
            Logger::printf("NFC card detected: %s\n", current_card_.get_uid_string().c_str());
            
            // Trigger callback
            if (on_card_detected_) {
                on_card_detected_(current_card_);
            }
        }
        
        card_present_ = true;
    } else {
        // No card detected
        if (card_present_) {
            // Card was just removed
            Logger::printf("NFC card removed: %s\n", last_card_.get_uid_string().c_str());
            
            if (on_card_removed_) {
                on_card_removed_(last_card_);
            }
        }
        
        card_present_ = false;
    }
}

bool NfcManager::is_card_present() const {
    return card_present_;
}

NfcCard NfcManager::get_last_card() const {
    return last_card_;
}

void NfcManager::set_card_detected_callback(NfcCardCallback callback) {
    on_card_detected_ = callback;
}

void NfcManager::set_card_removed_callback(NfcCardCallback callback) {
    on_card_removed_ = callback;
}

String NfcManager::get_firmware_version() const {
    if (!initialized_) {
        return "N/A";
    }
    return String(firmware_version_major_) + "." + String(firmware_version_minor_);
}

bool NfcManager::is_initialized() const {
    return initialized_;
}

Adafruit_PN532* NfcManager::get_nfc() {
    return nfc_;
}
