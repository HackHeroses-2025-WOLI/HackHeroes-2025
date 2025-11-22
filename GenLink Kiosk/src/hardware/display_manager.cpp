#include "hardware/display_manager.h"
#include "core/logger.h"
#include "ProjectConfig.h"

DisplayManager::DisplayManager()
    : tft_(nullptr)
    , initialized_(false) {
}

DisplayManager::~DisplayManager() {
    delete tft_;
}

bool DisplayManager::initialize() {
    if (initialized_) {
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

void DisplayManager::clear_screen(uint16_t color) {
    if (!initialized_) return;
    tft_->fillScreen(color);
}

void DisplayManager::fill_screen(uint16_t color) {
    if (!initialized_) return;
    tft_->fillScreen(color);
}

void DisplayManager::set_rotation(uint8_t rotation) {
    if (!initialized_) return;
    tft_->setRotation(rotation);
}

uint8_t DisplayManager::get_rotation() const {
    if (!initialized_) return 0;
    return tft_->getRotation();
}

int16_t DisplayManager::get_width() const {
    if (!initialized_) return 0;
    return tft_->width();
}

int16_t DisplayManager::get_height() const {
    if (!initialized_) return 0;
    return tft_->height();
}

void DisplayManager::draw_pixel(int16_t x, int16_t y, uint16_t color) {
    if (!initialized_) return;
    tft_->drawPixel(x, y, color);
}

void DisplayManager::draw_line(int16_t x0, int16_t y0, int16_t x1, int16_t y1, uint16_t color) {
    if (!initialized_) return;
    tft_->drawLine(x0, y0, x1, y1, color);
}

void DisplayManager::draw_rect(int16_t x, int16_t y, int16_t w, int16_t h, uint16_t color) {
    if (!initialized_) return;
    tft_->drawRect(x, y, w, h, color);
}

void DisplayManager::fill_rect(int16_t x, int16_t y, int16_t w, int16_t h, uint16_t color) {
    if (!initialized_) return;
    tft_->fillRect(x, y, w, h, color);
}

void DisplayManager::draw_circle(int16_t x0, int16_t y0, int16_t r, uint16_t color) {
    if (!initialized_) return;
    tft_->drawCircle(x0, y0, r, color);
}

void DisplayManager::fill_circle(int16_t x0, int16_t y0, int16_t r, uint16_t color) {
    if (!initialized_) return;
    tft_->fillCircle(x0, y0, r, color);
}

void DisplayManager::draw_triangle(int16_t x0, int16_t y0, int16_t x1, int16_t y1, int16_t x2, int16_t y2, uint16_t color) {
    if (!initialized_) return;
    tft_->drawTriangle(x0, y0, x1, y1, x2, y2, color);
}

void DisplayManager::fill_triangle(int16_t x0, int16_t y0, int16_t x1, int16_t y1, int16_t x2, int16_t y2, uint16_t color) {
    if (!initialized_) return;
    tft_->fillTriangle(x0, y0, x1, y1, x2, y2, color);
}

void DisplayManager::draw_round_rect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, uint16_t color) {
    if (!initialized_) return;
    tft_->drawRoundRect(x, y, w, h, r, color);
}

void DisplayManager::fill_round_rect(int16_t x, int16_t y, int16_t w, int16_t h, int16_t r, uint16_t color) {
    if (!initialized_) return;
    tft_->fillRoundRect(x, y, w, h, r, color);
}

void DisplayManager::set_cursor(int16_t x, int16_t y) {
    if (!initialized_) return;
    tft_->setCursor(x, y);
}

void DisplayManager::set_text_color(uint16_t color) {
    if (!initialized_) return;
    tft_->setTextColor(color);
}

void DisplayManager::set_text_color(uint16_t color, uint16_t bg_color) {
    if (!initialized_) return;
    tft_->setTextColor(color, bg_color);
}

void DisplayManager::set_text_size(uint8_t size) {
    if (!initialized_) return;
    tft_->setTextSize(size);
}

void DisplayManager::set_text_wrap(bool wrap) {
    if (!initialized_) return;
    tft_->setTextWrap(wrap);
}

void DisplayManager::print_text(const char* text) {
    if (!initialized_) return;
    tft_->print(text);
}

void DisplayManager::print_text(const String& text) {
    if (!initialized_) return;
    tft_->print(text);
}

uint16_t DisplayManager::color_rgb(uint8_t r, uint8_t g, uint8_t b) {
    if (!initialized_) return 0;
    return tft_->color565(r, g, b);
}

Adafruit_ILI9341* DisplayManager::get_tft() {
    return tft_;
}
