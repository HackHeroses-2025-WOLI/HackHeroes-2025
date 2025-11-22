#include "ui/screen.h"
#include "core/logger.h"
#include "hardware/display_manager.h"
#include "hardware/touch_manager.h"

Screen::Screen(const char* name)
    : name_(name)
    , active_(false)
    , dirty_(true)
    , display_(nullptr)
    , touch_(nullptr) {
}

Screen::~Screen() {
}

void Screen::on_enter() {
    active_ = true;
    dirty_ = true;
    Logger::printf("Screen '%s' entered\n", name_);
}

void Screen::on_exit() {
    active_ = false;
    Logger::printf("Screen '%s' exited\n", name_);
}

void Screen::on_draw() {
    // Override in derived classes
}

void Screen::on_update() {
    // Override in derived classes
}

void Screen::on_touch_down(const TouchPoint& point) {
    // Override in derived classes
}

void Screen::on_touch_up(const TouchPoint& point) {
    // Override in derived classes
}

void Screen::on_touch_move(const TouchPoint& point) {
    // Override in derived classes
}

const char* Screen::get_name() const {
    return name_;
}

bool Screen::is_active() const {
    return active_;
}

void Screen::set_active(bool active) {
    active_ = active;
}

bool Screen::needs_redraw() const {
    return dirty_;
}

void Screen::mark_dirty() {
    dirty_ = true;
}

void Screen::clear_dirty() {
    dirty_ = false;
}
