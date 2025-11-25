#include "ui/elements/button.h"
#include "hardware/display_manager.h"
#include "core/logger.h"

using namespace ui::elements;

Button::Button(int16_t x, int16_t y, uint16_t w, uint16_t h, const String &label)
    : Widget(x, y, w, h), label_(label), pressed_(false), cb_(nullptr) {}

Button::~Button() {}

void Button::draw(DisplayManager *display)
{
    if (!display)
        return;

    // Use centralized display helper to keep look consistent
    display->draw_button(x_, y_, w_, h_, label_, pressed_, ILI9341_WHITE, ILI9341_BLUE);
}

bool Button::on_touch_down(const TouchPoint &p)
{
    if (!contains_point(p.x, p.y))
        return false;
    pressed_ = true;
    return true;
}

bool Button::on_touch_up(const TouchPoint &p)
{
    if (!pressed_)
        return false;
    pressed_ = false;
    if (contains_point(p.x, p.y) && cb_)
    {
        cb_();
    }
    return true;
}

void Button::set_label(const String &label)
{
    label_ = label;
}

void Button::set_on_click(std::function<void()> cb)
{
    cb_ = std::move(cb);
}

bool Button::is_pressed() const { return pressed_; }
