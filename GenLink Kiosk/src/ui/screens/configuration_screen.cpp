#include "ui/screens/configuration_screen.h"
#include "hardware/display_manager.h"
#include <Adafruit_ILI9341.h>

namespace
{
    constexpr int16_t BUTTON_X = 60;
    constexpr int16_t BUTTON_Y = 180;
    constexpr uint16_t BUTTON_W = 200;
    constexpr uint16_t BUTTON_H = 60;
}

ConfigurationScreen::ConfigurationScreen()
    : Screen("configuration"),
      message_(String("Otwórz skrypt GenLink Kiosk Manager\nna komputerze i połącz\nsię z urządzeniem wybierając\noodpowiedni port urządzenia.")),
      save_button_(BUTTON_X, BUTTON_Y, BUTTON_W, BUTTON_H, String("Zapisz")),
      pre_restart_hook_(nullptr)
{
    save_button_.set_on_click([this]()
                              { trigger_restart(); });
}

void ConfigurationScreen::on_enter()
{
    Screen::on_enter();
    mark_dirty();
}

void ConfigurationScreen::on_draw()
{
    if (!display_)
        return;

    display_->fill_screen(ILI9341_BLACK);
    display_->set_text_color(ILI9341_YELLOW);
    display_->set_text_size(3);
    display_->set_cursor(35, 20);
    display_->print_text("Tryb serwisowy");

    display_->set_text_size(1);
    display_->set_text_color(ILI9341_WHITE);
    int16_t cursor_y = 85;
    int16_t cursor_x = 40;

    int start = 0;
    while (start <= message_.length())
    {
        int newline = message_.indexOf('\n', start);
        String line;
        if (newline == -1)
        {
            line = message_.substring(start);
            start = message_.length() + 1;
        }
        else
        {
            line = message_.substring(start, newline);
            start = newline + 1;
        }
        display_->set_cursor(cursor_x, cursor_y);
        display_->print_text(line);
        cursor_y += 18;
    }

    save_button_.draw(display_);

    clear_dirty();
}

void ConfigurationScreen::set_message(const String &message)
{
    message_ = message;
    mark_dirty();
}

void ConfigurationScreen::set_pre_restart_hook(std::function<void()> hook)
{
    pre_restart_hook_ = std::move(hook);
}

void ConfigurationScreen::on_touch_down(const TouchPoint &point)
{
    if (save_button_.on_touch_down(point) && display_)
    {
        save_button_.draw(display_);
    }
}

void ConfigurationScreen::on_touch_up(const TouchPoint &point)
{
    if (save_button_.on_touch_up(point) && display_)
    {
        save_button_.draw(display_);
    }
}

void ConfigurationScreen::trigger_restart()
{
    if (pre_restart_hook_)
    {
        pre_restart_hook_();
    }

    delay(50);
    ESP.restart();
}
