#include "ui/elements/widget.h"
#include "hardware/display_manager.h"

using namespace ui::elements;

Widget::Widget(int16_t x, int16_t y, uint16_t w, uint16_t h)
    : x_(x), y_(y), w_(w), h_(h) {}

Widget::~Widget() {}

bool Widget::on_touch_down(const TouchPoint &p) { return false; }
bool Widget::on_touch_up(const TouchPoint &p) { return false; }
bool Widget::on_touch_move(const TouchPoint &p) { return false; }

bool Widget::contains_point(int16_t x, int16_t y) const
{
    return x >= x_ && x <= (x_ + (int16_t)w_) && y >= y_ && y <= (y_ + (int16_t)h_);
}

int16_t Widget::x() const { return x_; }
int16_t Widget::y() const { return y_; }
uint16_t Widget::w() const { return w_; }
uint16_t Widget::h() const { return h_; }
