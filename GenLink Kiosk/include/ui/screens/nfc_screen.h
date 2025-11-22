#pragma once

#include "ui/screen.h"
#include "hardware/nfc_manager.h"

/**
 * @brief Example screen demonstrating NFC card reading
 * 
 * Shows detected NFC cards and their UIDs in real-time.
 */
class NfcScreen : public Screen {
public:
    NfcScreen();
    virtual ~NfcScreen();
    
    void on_enter() override;
    void on_exit() override;
    void on_draw() override;
    void on_update() override;
    
private:
    void draw_status();
    void draw_card_info();
    
    // Static callback wrapper (required for C callback)
    static void on_card_detected_wrapper(const NfcCard& card);
    static void on_card_removed_wrapper(const NfcCard& card);
    
    static NfcScreen* instance_;  // For callback access
    
    void on_card_detected(const NfcCard& card);
    void on_card_removed(const NfcCard& card);
    
    NfcManager* nfc_;
    NfcCard last_detected_card_;
    bool card_present_;
    unsigned long last_draw_time_;
    
    static const unsigned long DRAW_INTERVAL_MS = 100;
};
