#pragma once

#include "ui/screen.h"

/**
 * @brief Example screen demonstrating the framework
 * 
 * Shows a simple ON/OFF button toggle. Use as template for
 * building custom screens.
 */
class ExampleScreen : public Screen {
public:
    ExampleScreen();
    virtual ~ExampleScreen();
    
    void on_enter() override;
    void on_draw() override;
    void on_touch_down(const TouchPoint& point) override;
    
private:
    void draw_button();
    bool is_point_in_button(int16_t x, int16_t y) const;
    
    // Button state
    bool button_state_;  // false = OFF, true = ON
    
    // Button layout
    static const int16_t BUTTON_X = 110;
    static const int16_t BUTTON_Y = 90;
    static const int16_t BUTTON_W = 100;
    static const int16_t BUTTON_H = 60;
};
