#include "ui/screens/nfc_screen.h"
#include "core/system_manager.h"
#include "core/logger.h"
#include "hardware/display_manager.h"
#include <Adafruit_ILI9341.h>

// Static instance for callbacks
NfcScreen* NfcScreen::instance_ = nullptr;

NfcScreen::NfcScreen()
    : Screen("nfc_screen")
    , nfc_(nullptr)
    , card_present_(false)
    , last_draw_time_(0) {
    instance_ = this;
}

NfcScreen::~NfcScreen() {
    if (instance_ == this) {
        instance_ = nullptr;
    }
}

void NfcScreen::on_enter() {
    Screen::on_enter();
    
    // Get NFC manager
    SystemManager& sys = SystemManager::get_instance();
    nfc_ = sys.get_nfc_manager();
    
    if (nfc_) {
        // Register callbacks
        nfc_->set_card_detected_callback(on_card_detected_wrapper);
        nfc_->set_card_removed_callback(on_card_removed_wrapper);
        Logger::info("NFC screen - callbacks registered");
    } else {
        Logger::warning("NFC manager not available");
    }
    
    card_present_ = false;
}

void NfcScreen::on_exit() {
    // Unregister callbacks
    if (nfc_) {
        nfc_->set_card_detected_callback(nullptr);
        nfc_->set_card_removed_callback(nullptr);
    }
    
    Screen::on_exit();
}

void NfcScreen::on_draw() {
    if (!display_) {
        return;
    }
    
    // Clear background
    display_->fill_screen(ILI9341_BLACK);
    
    // Title
    display_->set_cursor(80, 10);
    display_->set_text_size(2);
    display_->set_text_color(ILI9341_CYAN);
    display_->print_text("NFC Reader");
    
    // Draw current status
    draw_status();
    
    // Draw card info if present
    if (card_present_) {
        draw_card_info();
    }
}

void NfcScreen::on_update() {
    // Redraw periodically to show status
    unsigned long now = millis();
    if (now - last_draw_time_ >= DRAW_INTERVAL_MS) {
        last_draw_time_ = now;
        
        // Check if card presence changed
        bool current_presence = nfc_ && nfc_->is_card_present();
        if (current_presence != card_present_) {
            card_present_ = current_presence;
            mark_dirty();
        }
    }
}

void NfcScreen::draw_status() {
    if (!display_) {
        return;
    }
    
    display_->set_text_size(1);
    
    // NFC status
    display_->set_cursor(10, 40);
    if (nfc_ && nfc_->is_initialized()) {
        display_->set_text_color(ILI9341_GREEN);
        display_->print_text("NFC: Ready");
        
        display_->set_cursor(10, 55);
        display_->set_text_color(ILI9341_WHITE);
        display_->print_text("FW: v");
        display_->print_text(nfc_->get_firmware_version());
    } else {
        display_->set_text_color(ILI9341_RED);
        display_->print_text("NFC: Not Available");
    }
    
    // Card status
    display_->set_cursor(10, 75);
    display_->set_text_size(2);
    if (card_present_) {
        display_->set_text_color(ILI9341_GREEN);
        display_->print_text("CARD PRESENT");
    } else {
        display_->set_text_color(ILI9341_YELLOW);
        display_->print_text("Waiting...");
    }
}

void NfcScreen::draw_card_info() {
    if (!display_ || !card_present_) {
        return;
    }
    
    // Draw separator
    display_->draw_line(10, 110, 310, 110, ILI9341_WHITE);
    
    // Card UID
    display_->set_cursor(10, 120);
    display_->set_text_size(1);
    display_->set_text_color(ILI9341_CYAN);
    display_->print_text("Card UID:");
    
    display_->set_cursor(10, 135);
    display_->set_text_size(2);
    display_->set_text_color(ILI9341_WHITE);
    display_->print_text(last_detected_card_.get_uid_string());
    
    // UID length
    display_->set_cursor(10, 160);
    display_->set_text_size(1);
    display_->set_text_color(ILI9341_LIGHTGREY);
    display_->print_text("Length: ");
    display_->print_text(String(last_detected_card_.uid_length));
    display_->print_text(" bytes");
    
    // Detection time
    unsigned long elapsed = (millis() - last_detected_card_.detected_time_ms) / 1000;
    display_->set_cursor(10, 175);
    display_->print_text("Detected: ");
    display_->print_text(String(elapsed));
    display_->print_text("s ago");
}

void NfcScreen::on_card_detected_wrapper(const NfcCard& card) {
    if (instance_) {
        instance_->on_card_detected(card);
    }
}

void NfcScreen::on_card_removed_wrapper(const NfcCard& card) {
    if (instance_) {
        instance_->on_card_removed(card);
    }
}

void NfcScreen::on_card_detected(const NfcCard& card) {
    last_detected_card_ = card;
    card_present_ = true;
    mark_dirty();
    
    Logger::printf("Screen: Card detected - %s\n", card.get_uid_string().c_str());
}

void NfcScreen::on_card_removed(const NfcCard& card) {
    card_present_ = false;
    mark_dirty();
    
    Logger::printf("Screen: Card removed - %s\n", card.get_uid_string().c_str());
}
