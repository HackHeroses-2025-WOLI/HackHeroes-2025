#pragma once

#include <Arduino.h>
#include <XPT2046_Touchscreen.h>
#include "ui/touch_point.h"

/**
 * @brief Hardware abstraction for XPT2046 touch controller
 *
 * Handles touch input with calibration and debouncing.
 */
class TouchManager
{
public:
    TouchManager();
    ~TouchManager();

    bool initialize();
    void update();

    // Touch state
    bool is_touched() const;
    TouchPoint get_touch_point() const;

    // Calibration
    void set_calibration(int16_t min_x, int16_t max_x, int16_t min_y, int16_t max_y);
    void get_calibration(int16_t &min_x, int16_t &max_x, int16_t &min_y, int16_t &max_y) const;

    // Settings
    void set_rotation(uint8_t rotation);
    uint8_t get_rotation() const;

    // Direct access (use sparingly)
    XPT2046_Touchscreen *get_ts();

private:
    XPT2046_Touchscreen *ts_;
    TouchPoint current_point_;
    TouchPoint last_point_;
    uint8_t rotation_;

    int16_t cal_min_x_;
    int16_t cal_max_x_;
    int16_t cal_min_y_;
    int16_t cal_max_y_;

    int16_t screen_width_;
    int16_t screen_height_;

    bool initialized_;
    bool touched_;
    unsigned long last_touch_time_;
    static const unsigned long DEBOUNCE_MS = 50;
};
