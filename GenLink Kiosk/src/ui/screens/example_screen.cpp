#include "ui/screens/example_screen.h"
#include "core/logger.h"
#include "hardware/display_manager.h"
#include <Adafruit_ILI9341.h>
#include "core/system_manager.h"
#include "hardware/network_manager.h"
#include "network/api_client.h"

ExampleScreen::ExampleScreen()
    : Screen("example"), button_state_(false), button_(BUTTON_X, BUTTON_Y, BUTTON_W, BUTTON_H, String("OFF"))
{
    // assign a click callback that toggles state and requests redraw
    button_.set_on_click([this]()
                         {
        button_state_ = !button_state_;
        // update label immediately so next draw shows new state
        button_.set_label(button_state_ ? String("ON") : String("OFF"));
        if (display_) {
            // redraw this screen to reflect state
            this->on_draw();
        } });
}

ExampleScreen::~ExampleScreen()
{
}

void ExampleScreen::on_enter()
{
    Screen::on_enter();
    button_state_ = false;
    // Attempt to connect to WiFi and fetch a simple endpoint to demonstrate ApiClient
    NetworkManager *net = SystemManager::get_instance().get_network_manager();
    if (net)
    {
        if (!net->is_connected())
        {
            net->connect();
        }
        if (net->is_connected())
        {
            ApiClient client(net);
            String body;
            int status = 0;
            // query root path to check connectivity (may be overwritten in ProjectConfig)
            if (client.get("", body, status))
            {
                Logger::printf("ApiClient GET %d -> %s\n", status, body.c_str());
            }
            else
            {
                Logger::printf("ApiClient GET failed: %d\n", status);
            }
        }
    }
}

void ExampleScreen::on_draw()
{
    if (!display_)
    {
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

    // Draw widget button
    button_.draw(display_);
}

void ExampleScreen::on_touch_down(const TouchPoint &point)
{
    if (!display_)
        return;
    if (button_.on_touch_down(point))
    {
        // redraw to show press state
        button_.draw(display_);
    }
}

void ExampleScreen::on_touch_up(const TouchPoint &point)
{
    if (!display_)
        return;
    if (button_.on_touch_up(point))
    {
        Logger::printf("Button toggled: %s\n", button_state_ ? "ON" : "OFF");
    }
}

// removed custom draw_button/is_point_in_button in favour of ui::elements::Button
