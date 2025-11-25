#include "ui/screens/error_screen.h"
#include "hardware/display_manager.h"
#include <Adafruit_ILI9341.h>

ErrorScreen::ErrorScreen(const String &title, const String &details)
    : Screen("error"), title_(title), details_(details) {}

ErrorScreen::~ErrorScreen() {}

void ErrorScreen::set_error(const String &title, const String &details)
{
    title_ = title;
    details_ = details;
    mark_dirty();
}

void ErrorScreen::on_enter()
{
    Screen::on_enter();
    mark_dirty();
}

void ErrorScreen::on_draw()
{
    if (!display_)
        return;

    display_->fill_screen(ILI9341_RED);
    display_->set_text_color(ILI9341_WHITE);
    display_->set_text_size(2);
    display_->set_cursor(10, 20);
    display_->print_text(title_);

    display_->set_text_size(1);
    display_->set_cursor(10, 60);
    display_->print_text(details_);

    clear_dirty();
}
