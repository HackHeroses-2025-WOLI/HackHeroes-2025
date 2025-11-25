#pragma once

#include "ui/screen.h"
#include "ui/elements/button.h"
#include <Arduino.h>
#include <functional>

/**
 * @brief Simple maintenance screen for administrator access
 */
class ConfigurationScreen : public Screen
{
public:
    ConfigurationScreen();
    ~ConfigurationScreen() override = default;

    void on_enter() override;
    void on_draw() override;
    void on_touch_down(const TouchPoint &point) override;
    void on_touch_up(const TouchPoint &point) override;

    void set_message(const String &message);
    void set_pre_restart_hook(std::function<void()> hook);

private:
    void trigger_restart();

    String message_;
    ui::elements::Button save_button_;
    std::function<void()> pre_restart_hook_;
};
