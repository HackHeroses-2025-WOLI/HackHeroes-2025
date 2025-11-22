#pragma once

#include <Arduino.h>

class DisplayManager;
class TouchManager;
struct TouchPoint;

/**
 * @brief Base class for all UI screens
 * 
 * Screens are full-screen views that handle drawing and touch input.
 * Override virtual methods to implement custom behavior.
 */
class Screen {
public:
    Screen(const char* name);
    virtual ~Screen();
    
    // Lifecycle
    virtual void on_enter();   // Called when screen becomes active
    virtual void on_exit();    // Called when screen becomes inactive
    virtual void on_draw();    // Called to render the screen
    virtual void on_update();  // Called every frame (before draw)
    
    // Touch handling
    virtual void on_touch_down(const TouchPoint& point);
    virtual void on_touch_up(const TouchPoint& point);
    virtual void on_touch_move(const TouchPoint& point);
    
    // Properties
    const char* get_name() const;
    bool is_active() const;
    void set_active(bool active);
    
    // Dirty flag for redraw optimization
    bool needs_redraw() const;
    void mark_dirty();
    void clear_dirty();
    
protected:
    // Helper access to managers (set by UIManager)
    DisplayManager* display_;
    TouchManager* touch_;
    
    friend class UIManager;
    
private:
    const char* name_;
    bool active_;
    bool dirty_;
};
