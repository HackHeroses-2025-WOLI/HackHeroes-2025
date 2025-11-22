#pragma once

#include <Arduino.h>
#include <vector>

class Screen;
class DisplayManager;
class TouchManager;
struct TouchPoint;

/**
 * @brief Manages UI screens and navigation
 * 
 * Handles screen transitions, rendering, and touch event dispatch.
 */
class UIManager {
public:
    UIManager();
    ~UIManager();
    
    bool initialize();
    void update();
    
    // Screen management
    void register_screen(Screen* screen);
    void set_active_screen(const char* screen_name);
    void set_active_screen(Screen* screen);
    Screen* get_active_screen();
    Screen* find_screen(const char* name);
    
    // Rendering
    void draw();
    void force_redraw();
    
private:
    void dispatch_touch_events();
    void handle_screen_transition(Screen* new_screen);
    
    std::vector<Screen*> screens_;
    Screen* active_screen_;
    Screen* pending_screen_;
    
    DisplayManager* display_;
    TouchManager* touch_;
    
    bool initialized_;
    bool last_touch_state_;
    TouchPoint last_touch_point_;
};
