#include "ui/elements/selection_menu.h"
#include "hardware/display_manager.h"

using namespace ui::elements;

namespace
{
    constexpr uint8_t FRAME_RADIUS = 6;
    constexpr uint8_t ROW_HEIGHT = 26;
    constexpr uint8_t TEXT_SIZE = 2;
    constexpr uint8_t INNER_PADDING_TOP = 12;
    constexpr uint8_t INNER_PADDING_BOTTOM = 4;
}

SelectionMenu::SelectionMenu(int16_t x, int16_t y, uint16_t w, uint16_t h)
    : Widget(x, y, w, h), selected_index_(-1), frame_dirty_(true), options_dirty_(true), selection_redraw_pending_(false), dirty_rows_{-1, -1}, dirty_rows_count_(0)
{
}

SelectionMenu::~SelectionMenu() {}

void SelectionMenu::draw(DisplayManager *display)
{
    if (!display)
        return;

    if (frame_dirty_)
    {
        display->fill_round_rect(x_, y_, w_, h_, FRAME_RADIUS, ILI9341_DARKGREY);
        display->draw_round_rect(x_, y_, w_, h_, FRAME_RADIUS, ILI9341_WHITE);
        frame_dirty_ = false;
        options_dirty_ = true; // ensure contents refresh after frame repaint
        selection_redraw_pending_ = false;
        dirty_rows_count_ = 0;
    }

    if (options_dirty_)
    {
        draw_options(display);
        return;
    }

    if (selection_redraw_pending_)
    {
        for (uint8_t i = 0; i < dirty_rows_count_; ++i)
        {
            draw_row(display, dirty_rows_[i]);
        }
        selection_redraw_pending_ = false;
        dirty_rows_count_ = 0;
    }
}

void SelectionMenu::draw_options(DisplayManager *display)
{
    if (!display)
        return;

    // Clear inner area so only menu contents redraw
    display->fill_round_rect(x_ + 2, y_ + 2, w_ - 4, h_ - 4, FRAME_RADIUS - 2, ILI9341_DARKGREY);

    int16_t start_y = y_ + INNER_PADDING_TOP;
    display->set_text_size(TEXT_SIZE);

    for (size_t i = 0; i < items_.size(); ++i)
    {
        if (!is_row_visible(i))
        {
            break;
        }
        draw_row(display, i);
    }

    options_dirty_ = false;
    selection_redraw_pending_ = false;
    dirty_rows_count_ = 0;
}

bool SelectionMenu::on_touch_down(const TouchPoint &p)
{
    if (!contains_point(p.x, p.y))
        return false;

    int index = (p.y - (y_ + INNER_PADDING_TOP)) / ROW_HEIGHT;
    if (index < 0 || (size_t)index >= items_.size())
    {
        return false;
    }

    int previous = selected_index_;
    if (previous == index)
    {
        return true;
    }
    selected_index_ = index;
    mark_row_dirty(previous);
    mark_row_dirty(index);
    return true;
}

void SelectionMenu::set_items(const std::vector<String> &items)
{
    items_ = items;
    selected_index_ = items_.empty() ? -1 : 0;
    frame_dirty_ = true;
    options_dirty_ = true;
    selection_redraw_pending_ = false;
    dirty_rows_count_ = 0;
}

int SelectionMenu::get_selected() const { return selected_index_; }

void SelectionMenu::clear_selection()
{
    selected_index_ = items_.empty() ? -1 : 0;
    options_dirty_ = true;
    selection_redraw_pending_ = false;
    dirty_rows_count_ = 0;
}

bool SelectionMenu::has_selection() const
{
    return selected_index_ >= 0 && (size_t)selected_index_ < items_.size();
}

String SelectionMenu::get_selected_label() const
{
    if (!has_selection())
    {
        return String("");
    }
    return items_[selected_index_];
}

void SelectionMenu::force_redraw()
{
    frame_dirty_ = true;
    options_dirty_ = true;
    selection_redraw_pending_ = false;
    dirty_rows_count_ = 0;
}

void SelectionMenu::draw_row(DisplayManager *display, int index)
{
    if (!display || index < 0 || (size_t)index >= items_.size() || !is_row_visible(index))
    {
        return;
    }

    int16_t row_y = get_row_y(index);
    int16_t row_height = get_row_height();
    uint16_t bg = (index == selected_index_) ? ILI9341_BLUE : ILI9341_DARKGREY;

    display->fill_round_rect(x_ + 4, row_y - 4, w_ - 8, row_height, 4, bg);
    display->set_cursor(x_ + 12, row_y);
    display->set_text_color(ILI9341_WHITE);
    display->set_text_size(TEXT_SIZE);
    display->print_text(items_[index]);
}

int16_t SelectionMenu::get_row_y(int index) const
{
    return static_cast<int16_t>(y_ + INNER_PADDING_TOP + index * ROW_HEIGHT);
}

int16_t SelectionMenu::get_row_height() const
{
    return ROW_HEIGHT - 4;
}

bool SelectionMenu::is_row_visible(int index) const
{
    if (index < 0 || (size_t)index >= items_.size())
    {
        return false;
    }
    int16_t row_end = get_row_y(index) + get_row_height();
    return row_end <= y_ + h_ - INNER_PADDING_BOTTOM;
}

void SelectionMenu::mark_row_dirty(int index)
{
    if (index < 0 || (size_t)index >= items_.size())
    {
        return;
    }

    for (uint8_t i = 0; i < dirty_rows_count_; ++i)
    {
        if (dirty_rows_[i] == index)
        {
            return;
        }
    }

    if (dirty_rows_count_ < 2)
    {
        dirty_rows_[dirty_rows_count_++] = index;
    }
    else
    {
        dirty_rows_[1] = index;
    }

    selection_redraw_pending_ = true;
}
