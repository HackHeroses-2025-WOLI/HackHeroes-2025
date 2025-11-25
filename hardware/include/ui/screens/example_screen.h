#pragma once

#include "ui/screen.h"
#include "ui/elements/button.h"

/**
 * @brief Example screen demonstrating the framework
 *
 * Shows a simple ON/OFF button toggle. Use as template for
 * building custom screens.
 */
class ExampleScreen : public Screen
{
public:
    ExampleScreen();
    virtual ~ExampleScreen();

    void on_enter() override;
    void on_draw() override;
    void on_touch_down(const TouchPoint &point) override;
    void on_touch_up(const TouchPoint &point) override;

private:
    // UI widgets
    ui::elements::Button button_;

    // Button state
    bool button_state_; // false = OFF, true = ON

    // Button layout
    static const int16_t BUTTON_X = 20;
    static const int16_t BUTTON_Y = 50;
    static const int16_t BUTTON_W = 100;
    static const int16_t BUTTON_H = 60;
};
