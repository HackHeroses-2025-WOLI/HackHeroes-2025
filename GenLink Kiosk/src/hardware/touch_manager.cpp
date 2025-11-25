#include "hardware/touch_manager.h"
#include "core/logger.h"
#include "ProjectConfig.h"

TouchManager::TouchManager()
    : ts_(nullptr), cal_min_x_(TS_MIN_X), cal_max_x_(TS_MAX_X), cal_min_y_(TS_MIN_Y), cal_max_y_(TS_MAX_Y), screen_width_(320), screen_height_(240), rotation_(0), initialized_(false), touched_(false), last_touch_time_(0)
{
}

TouchManager::~TouchManager()
{
    delete ts_;
}

bool TouchManager::initialize()
{
    if (initialized_)
    {
        return true;
    }

    ts_ = new XPT2046_Touchscreen(TOUCH_CS, TOUCH_IRQ);

    if (!ts_->begin())
    {
        Logger::error("Touch controller not found");
        return false;
    }

    ts_->setRotation(TOUCH_ROTATION);
    // store configured rotation locally — the XPT2046_Touchscreen lib does not expose a getter
    rotation_ = TOUCH_ROTATION;

    initialized_ = true;
    Logger::printf("Touch initialized (rotation: %d, cal: %d-%d, %d-%d)\n",
                   TOUCH_ROTATION, cal_min_x_, cal_max_x_, cal_min_y_, cal_max_y_);
    return true;
}

void TouchManager::update()
{
    if (!initialized_)
    {
        return;
    }

    // Debouncing
    unsigned long now = millis();
    if (now - last_touch_time_ < DEBOUNCE_MS)
    {
        return;
    }

    last_point_ = current_point_;

    if (ts_->touched())
    {
        TS_Point p = ts_->getPoint();

        current_point_.raw_x = p.x;
        current_point_.raw_y = p.y;
        current_point_.x = map(p.x, cal_min_x_, cal_max_x_, 0, screen_width_);
        current_point_.y = map(p.y, cal_min_y_, cal_max_y_, 0, screen_height_);
        current_point_.pressed = true;

        touched_ = true;
        last_touch_time_ = now;
    }
    else
    {
        current_point_.pressed = false;
        touched_ = false;
    }
}

bool TouchManager::is_touched() const
{
    return touched_;
}

TouchPoint TouchManager::get_touch_point() const
{
    return current_point_;
}

void TouchManager::set_calibration(int16_t min_x, int16_t max_x, int16_t min_y, int16_t max_y)
{
    cal_min_x_ = min_x;
    cal_max_x_ = max_x;
    cal_min_y_ = min_y;
    cal_max_y_ = max_y;

    Logger::printf("Touch calibration updated: %d-%d, %d-%d\n",
                   cal_min_x_, cal_max_x_, cal_min_y_, cal_max_y_);
}

void TouchManager::get_calibration(int16_t &min_x, int16_t &max_x, int16_t &min_y, int16_t &max_y) const
{
    min_x = cal_min_x_;
    max_x = cal_max_x_;
    min_y = cal_min_y_;
    max_y = cal_max_y_;
}

void TouchManager::set_rotation(uint8_t rotation)
{
    // Always store chosen rotation; apply to hardware if already initialized.
    rotation_ = rotation;
    if (initialized_)
    {
        ts_->setRotation(rotation);
    }
}

uint8_t TouchManager::get_rotation() const
{
    // No getter in the underlying library, so return locally stored value.
    return rotation_;
}

XPT2046_Touchscreen *TouchManager::get_ts()
{
    return ts_;
}
