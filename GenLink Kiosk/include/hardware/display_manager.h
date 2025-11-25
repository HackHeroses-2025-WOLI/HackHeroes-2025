#pragma once

#include <Arduino.h>
#include <Adafruit_ILI9341.h>
#include <Adafruit_GFX.h>

/**
 * @brief Hardware abstraction for ILI9341 TFT display
 *
 * Wraps Adafruit_ILI9341 and provides high-level drawing operations
 * with consistent naming conventions.
 */
class DisplayManager
{
public:
    DisplayManager();
    ~DisplayManager();

    bool initialize();

    // Screen operations
    void clear_screen(uint16_t color = 0x0000);
    void fill_screen(uint16_t color);
    void set_rotation(uint8_t rotation);
    uint8_t get_rotation() const;

    // Dimensions
    int16_t get_width() const;
    int16_t get_height() const;

    // Basic drawing primitives
    void draw_pixel(int16_t x, int16_t y, uint16_t color);
    void draw_line(int16_t x0, int16_t y0, int16_t x1, int16_t y1, uint16_t color);
    void draw_rect(int16_t x, int16_t y, int16_t w, int16_t h, uint16_t color);
    void fill_rect(int16_t x, int16_t y, int16_t w, int16_t h, uint16_t color);
    void draw_circle(int16_t x0, int16_t y0, int16_t r, uint16_t color);
    void fill_circle(int16_t x0, int16_t y0, int16_t r, uint16_t color);
    void draw_triangle(int16_t x0, int16_t y0, int16_t x1, int16_t y1, int16_t x2, int16_t y2, uint16_t color);
    void fill_triangle(int16_t x0, int16_t y0, int16_t x1, int16_t y1, int16_t x2, int16_t y2, uint16_t color);
    void draw_round_rect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, uint16_t color);
    void fill_round_rect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, uint16_t color);

    // Text operations
    void set_cursor(int16_t x, int16_t y);
    void set_text_color(uint16_t color);
    void set_text_color(uint16_t color, uint16_t bg_color);
    void set_text_size(uint8_t size);
    void set_text_wrap(bool wrap);
    void print_text(const char *text);
    void print_text(const String &text);

    // Color utilities
    uint16_t color_rgb(uint8_t r, uint8_t g, uint8_t b);

    // Direct access (use sparingly)
    Adafruit_ILI9341 *get_tft();
    // Access via the Adafruit_GFX abstraction (recommended for generic drawing)
    Adafruit_GFX *get_gfx();

    // High-level UI helper to render a rounded button
    // Draw a rounded button with label. border_thickness controls the frame width in pixels.
    void draw_button(int16_t x, int16_t y, uint16_t w, uint16_t h,
                     const String &label, bool pressed = false,
                     uint16_t fg_color = ILI9341_WHITE, uint16_t bg_color = ILI9341_BLUE,
                     uint8_t border_thickness = 2);

private:
    Adafruit_ILI9341 *tft_;
    bool initialized_;
};
