#pragma once

#include <Arduino.h>
#include <Adafruit_PN532.h>
#include <Wire.h>

/**
 * @brief NFC card data structure
 */
struct NfcCard
{
    uint8_t uid[7];
    uint8_t uid_length;
    unsigned long detected_time_ms;

    NfcCard() : uid_length(0), detected_time_ms(0)
    {
        memset(uid, 0, sizeof(uid));
    }

    /**
     * @brief Get UID as hex string
     */
    String get_uid_string() const
    {
        String result = "";
        for (uint8_t i = 0; i < uid_length; i++)
        {
            if (uid[i] < 0x10)
                result += "0";
            result += String(uid[i], HEX);
            if (i < uid_length - 1)
                result += ":";
        }
        result.toUpperCase();
        return result;
    }

    /**
     * @brief Check if two cards have the same UID
     */
    bool equals(const NfcCard &other) const
    {
        if (uid_length != other.uid_length)
            return false;
        return memcmp(uid, other.uid, uid_length) == 0;
    }
};

/**
 * @brief Callback type for NFC card detection
 */
typedef void (*NfcCardCallback)(const NfcCard &card);

/**
 * @brief Hardware abstraction for PN532 NFC reader
 *
 * Handles NFC card detection with debouncing and callback system.
 */
class NfcManager
{
public:
    NfcManager();
    ~NfcManager();

    bool initialize();
    void update();

    // Card detection
    bool is_card_present() const;
    NfcCard get_last_card() const;

    // Callbacks
    void set_card_detected_callback(NfcCardCallback callback);
    void set_card_removed_callback(NfcCardCallback callback);

    // Firmware info
    String get_firmware_version() const;
    bool is_initialized() const;

    // Direct access (use sparingly)
    Adafruit_PN532 *get_nfc();

private:
    void check_for_card();

    Adafruit_PN532 *nfc_;
    NfcCard last_card_;
    NfcCard current_card_;

    bool initialized_;
    bool card_present_;
    bool last_card_present_;
    unsigned long last_read_time_;

    NfcCardCallback on_card_detected_;
    NfcCardCallback on_card_removed_;

    uint16_t firmware_version_major_;
    uint16_t firmware_version_minor_;

    static const unsigned long READ_INTERVAL_MS = 100; // Poll every 100ms
    static const unsigned long DEBOUNCE_MS = 50;
};
