#pragma once

#include <Arduino.h>
#include "ui/touch_point.h"

class DisplayManager;

namespace ui::elements
{

    class Widget
    {
    public:
        Widget(int16_t x, int16_t y, uint16_t w, uint16_t h);
        virtual ~Widget();

        // Draw this widget using the provided display manager
        virtual void draw(DisplayManager *display) = 0;

        // Touch handlers return true if the event was handled
        virtual bool on_touch_down(const TouchPoint &p);
        virtual bool on_touch_up(const TouchPoint &p);
        virtual bool on_touch_move(const TouchPoint &p);

        bool contains_point(int16_t x, int16_t y) const;

        // Getters
        int16_t x() const;
        int16_t y() const;
        uint16_t w() const;
        uint16_t h() const;

    protected:
        int16_t x_;
        int16_t y_;
        uint16_t w_;
        uint16_t h_;
    };

} // namespace ui::elements
