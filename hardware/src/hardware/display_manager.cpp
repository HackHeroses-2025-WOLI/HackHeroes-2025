#include "hardware/display_manager.h"
#include "core/logger.h"
#include "ProjectConfig.h"

DisplayManager::DisplayManager()
    : tft_(nullptr), initialized_(false)
{
}

DisplayManager::~DisplayManager()
{
    delete tft_;
}

bool DisplayManager::initialize()
{
    if (initialized_)
    {
        return true;
    }

    tft_ = new Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RST);
    tft_->begin();
    tft_->setRotation(DISPLAY_ROTATION);
    tft_->fillScreen(ILI9341_BLACK);

    initialized_ = true;
    Logger::printf("Display initialized (%dx%d, rotation: %d)\n",
                   tft_->width(), tft_->height(), DISPLAY_ROTATION);
    return true;
}

void DisplayManager::clear_screen(uint16_t color)
{
    if (!initialized_)
        return;
    tft_->fillScreen(color);
}

void DisplayManager::fill_screen(uint16_t color)
{
    if (!initialized_)
        return;
    tft_->fillScreen(color);
}

void DisplayManager::set_rotation(uint8_t rotation)
{
    if (!initialized_)
        return;
    tft_->setRotation(rotation);
}

uint8_t DisplayManager::get_rotation() const
{
    if (!initialized_)
        return 0;
    return tft_->getRotation();
}

int16_t DisplayManager::get_width() const
{
    if (!initialized_)
        return 0;
    return tft_->width();
}

int16_t DisplayManager::get_height() const
{
    if (!initialized_)
        return 0;
    return tft_->height();
}

void DisplayManager::draw_pixel(int16_t x, int16_t y, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->drawPixel(x, y, color);
}

void DisplayManager::draw_line(int16_t x0, int16_t y0, int16_t x1, int16_t y1, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->drawLine(x0, y0, x1, y1, color);
}

void DisplayManager::draw_rect(int16_t x, int16_t y, int16_t w, int16_t h, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->drawRect(x, y, w, h, color);
}

void DisplayManager::fill_rect(int16_t x, int16_t y, int16_t w, int16_t h, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->fillRect(x, y, w, h, color);
}

void DisplayManager::draw_circle(int16_t x0, int16_t y0, int16_t r, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->drawCircle(x0, y0, r, color);
}

void DisplayManager::fill_circle(int16_t x0, int16_t y0, int16_t r, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->fillCircle(x0, y0, r, color);
}

void DisplayManager::draw_triangle(int16_t x0, int16_t y0, int16_t x1, int16_t y1, int16_t x2, int16_t y2, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->drawTriangle(x0, y0, x1, y1, x2, y2, color);
}

void DisplayManager::fill_triangle(int16_t x0, int16_t y0, int16_t x1, int16_t y1, int16_t x2, int16_t y2, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->fillTriangle(x0, y0, x1, y1, x2, y2, color);
}

void DisplayManager::draw_round_rect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->drawRoundRect(x, y, w, h, r, color);
}

void DisplayManager::fill_round_rect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, uint16_t color)
{
    if (!initialized_)
        return;
    tft_->fillRoundRect(x, y, w, h, r, color);
}

void DisplayManager::set_cursor(int16_t x, int16_t y)
{
    if (!initialized_)
        return;
    tft_->setCursor(x, y);
}

void DisplayManager::set_text_color(uint16_t color)
{
    if (!initialized_)
        return;
    tft_->setTextColor(color);
}

void DisplayManager::set_text_color(uint16_t color, uint16_t bg_color)
{
    if (!initialized_)
        return;
    tft_->setTextColor(color, bg_color);
}

void DisplayManager::set_text_size(uint8_t size)
{
    if (!initialized_)
        return;
    tft_->setTextSize(size);
}

void DisplayManager::set_text_wrap(bool wrap)
{
    if (!initialized_)
        return;
    tft_->setTextWrap(wrap);
}

void DisplayManager::print_text(const char *text)
{
    if (!initialized_)
        return;
    tft_->print(text);
}

void DisplayManager::print_text(const String &text)
{
    if (!initialized_)
        return;
    tft_->print(text);
}

uint16_t DisplayManager::color_rgb(uint8_t r, uint8_t g, uint8_t b)
{
    if (!initialized_)
        return 0;
    return tft_->color565(r, g, b);
}

Adafruit_ILI9341 *DisplayManager::get_tft()
{
    return tft_;
}

Adafruit_GFX *DisplayManager::get_gfx()
{
    // Safe to cast because Adafruit_ILI9341 inherits Adafruit_GFX
    return static_cast<Adafruit_GFX *>(tft_);
}

void DisplayManager::draw_button(int16_t x, int16_t y, uint16_t w, uint16_t h,
                                 const String &label, bool pressed,
                                 uint16_t fg_color, uint16_t bg_color,
                                 uint8_t border_thickness)
{
    if (!initialized_)
        return;

    uint16_t face = pressed ? color_rgb(30, 30, 30) : bg_color;
    uint16_t outline = pressed ? color_rgb(80, 80, 80) : color_rgb(40, 40, 40);

    // Clamp border thickness to reasonable value
    uint8_t th = border_thickness;
    if (th < 1)
        th = 1;
    // Ensure inner dimensions stay valid
    if ((int)w - 2 * th <= 0 || (int)h - 2 * th <= 0)
    {
        // Fall back to single-line border if button too small
        tft_->fillRoundRect(x, y, w, h, 6, face);
        tft_->drawRoundRect(x, y, w, h, 6, outline);
    }
    else
    {
        // Draw outer filled rounded rect as outline color, then draw inner face to create a thick border
        const int16_t radius = 6;
        // Outer (outline) filled rect
        tft_->fillRoundRect(x, y, w, h, radius, outline);
        // Inner face inset by thickness
        int16_t inner_x = x + th;
        int16_t inner_y = y + th;
        uint16_t inner_w = w - 2 * th;
        uint16_t inner_h = h - 2 * th;
        int16_t inner_radius = radius - th;
        if (inner_radius < 0)
            inner_radius = 0;
        tft_->fillRoundRect(inner_x, inner_y, inner_w, inner_h, inner_radius, face);
    }

    // Draw centered label (approximation based on char width)
    uint8_t txt_size = 2;
    tft_->setTextSize(txt_size);
    tft_->setTextColor(fg_color);
    int16_t text_w = (int)label.length() * 6 * txt_size; // approximation
    int16_t text_x = x + (w - text_w) / 2;
    int16_t text_y = y + (h / 2) - (8 * txt_size / 2);
    tft_->setCursor(text_x, text_y);
    tft_->print(label);
}
