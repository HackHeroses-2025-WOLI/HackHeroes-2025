#pragma once

#include "ui/elements/widget.h"
#include <Arduino.h>
#include <functional>

class DisplayManager;

namespace ui::elements
{

    class Button : public Widget
    {
    public:
        Button(int16_t x, int16_t y, uint16_t w, uint16_t h, const String &label);
        ~Button() override;

        void draw(DisplayManager *display) override;

        bool on_touch_down(const TouchPoint &p) override;
        bool on_touch_up(const TouchPoint &p) override;

        void set_label(const String &label);
        void set_on_click(std::function<void()> cb);

        bool is_pressed() const;

    private:
        String label_;
        bool pressed_;
        std::function<void()> cb_;
    };

} // namespace ui::elements
