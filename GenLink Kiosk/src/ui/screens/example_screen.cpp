#include "ui/screens/example_screen.h"
#include "core/logger.h"
#include "hardware/display_manager.h"
#include <Adafruit_ILI9341.h>

ExampleScreen::ExampleScreen()
    : Screen("example")
    , button_state_(false) {
}

ExampleScreen::~ExampleScreen() {
}

void ExampleScreen::on_enter() {
    Screen::on_enter();
    button_state_ = false;
}

void ExampleScreen::on_draw() {
    if (!display_) {
        return;
    }
    
    // Clear background
    display_->fill_screen(ILI9341_BLACK);
    
    // Title
    display_->set_cursor(80, 20);
    display_->set_text_size(2);
    display_->set_text_color(ILI9341_WHITE);
    display_->print_text("GenLink Kiosk");
    
    display_->set_cursor(90, 45);
    display_->set_text_size(1);
    display_->set_text_color(ILI9341_CYAN);
    display_->print_text("Example Screen - Touch Button");
    
    // Draw button
    draw_button();
}

void ExampleScreen::on_touch_down(const TouchPoint& point) {
    if (!display_) {
        return;
    }
    
    // Check if button was touched
    if (is_point_in_button(point.x, point.y)) {
        button_state_ = !button_state_;
        Logger::printf("Button toggled: %s\n", button_state_ ? "ON" : "OFF");
        
        // Redraw button only (optimization - could mark_dirty() for full redraw)
        draw_button();
    }
}

void ExampleScreen::draw_button() {
    if (!display_) {
        return;
    }
    
    // Button colors
    uint16_t bg_color = button_state_ ? ILI9341_GREEN : ILI9341_RED;
    uint16_t text_color = ILI9341_WHITE;
    
    // Draw filled rectangle
    display_->fill_round_rect(BUTTON_X, BUTTON_Y, BUTTON_W, BUTTON_H, 8, bg_color);
    
    // Draw border
    display_->draw_round_rect(BUTTON_X, BUTTON_Y, BUTTON_W, BUTTON_H, 8, ILI9341_WHITE);
    
    // Draw text
    const char* label = button_state_ ? "ON" : "OFF";
    int16_t text_x = BUTTON_X + (BUTTON_W / 2) - (button_state_ ? 12 : 16);
    int16_t text_y = BUTTON_Y + (BUTTON_H / 2) - 8;
    
    display_->set_cursor(text_x, text_y);
    display_->set_text_size(2);
    display_->set_text_color(text_color);
    display_->print_text(label);
}

bool ExampleScreen::is_point_in_button(int16_t x, int16_t y) const {
    return (x >= BUTTON_X && x <= (BUTTON_X + BUTTON_W) &&
            y >= BUTTON_Y && y <= (BUTTON_Y + BUTTON_H));
}
