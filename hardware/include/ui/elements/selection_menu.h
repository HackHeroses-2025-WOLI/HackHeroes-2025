#pragma once

#include "ui/elements/widget.h"
#include <Arduino.h>
#include <vector>

class DisplayManager;

namespace ui::elements
{

    class SelectionMenu : public Widget
    {
    public:
        SelectionMenu(int16_t x, int16_t y, uint16_t w, uint16_t h);
        ~SelectionMenu() override;

        void draw(DisplayManager *display) override;

        bool on_touch_down(const TouchPoint &p) override;

        void set_items(const std::vector<String> &items);
        int get_selected() const;
        void clear_selection();
        bool has_selection() const;
        String get_selected_label() const;
        void force_redraw();
        void mark_row_dirty(int index);

    private:
        void draw_options(DisplayManager *display);
        void draw_row(DisplayManager *display, int index);
        int16_t get_row_y(int index) const;
        int16_t get_row_height() const;
        bool is_row_visible(int index) const;

        std::vector<String> items_;
        int selected_index_;
        bool frame_dirty_;
        bool options_dirty_;
        bool selection_redraw_pending_;
        int dirty_rows_[2];
        uint8_t dirty_rows_count_;
    };

} // namespace ui::elements
