#pragma once

#include <Arduino.h>

/**
 * Simple POD for touch events shared between hardware and UI layers
 */
struct TouchPoint
{
    int16_t x;
    int16_t y;
    int16_t raw_x;
    int16_t raw_y;
    bool pressed;

    TouchPoint() : x(0), y(0), raw_x(0), raw_y(0), pressed(false) {}
};
