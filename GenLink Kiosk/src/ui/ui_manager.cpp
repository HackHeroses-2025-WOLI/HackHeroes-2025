#include "ui/ui_manager.h"
#include "ui/screen.h"
#include "core/logger.h"
#include "hardware/display_manager.h"
#include "hardware/touch_manager.h"
#include "core/system_manager.h"

UIManager::UIManager()
    : active_screen_(nullptr)
    , pending_screen_(nullptr)
    , display_(nullptr)
    , touch_(nullptr)
    , initialized_(false)
    , last_touch_state_(false) {
}

UIManager::~UIManager() {
    // Screens are owned by user code, not deleted here
    screens_.clear();
}

bool UIManager::initialize() {
    if (initialized_) {
        return true;
    }
    
    // Get references to managers
    SystemManager& sys = SystemManager::get_instance();
    display_ = sys.get_display_manager();
    touch_ = sys.get_touch_manager();
    
    if (!display_ || !touch_) {
        Logger::error("UI requires display and touch managers");
        return false;
    }
    
    initialized_ = true;
    Logger::info("UI Manager initialized");
    return true;
}

void UIManager::update() {
    if (!initialized_) {
        return;
    }
    
    // Handle screen transitions
    if (pending_screen_) {
        handle_screen_transition(pending_screen_);
        pending_screen_ = nullptr;
    }
    
    // Update active screen
    if (active_screen_) {
        active_screen_->on_update();
        
        // Handle touch input
        dispatch_touch_events();
        
        // Render if needed
        if (active_screen_->needs_redraw()) {
            draw();
        }
    }
}

void UIManager::register_screen(Screen* screen) {
    if (!screen) {
        return;
    }
    
    // Inject manager references
    screen->display_ = display_;
    screen->touch_ = touch_;
    
    screens_.push_back(screen);
    Logger::printf("Registered screen: %s\n", screen->get_name());
}

void UIManager::set_active_screen(const char* screen_name) {
    Screen* screen = find_screen(screen_name);
    if (screen) {
        set_active_screen(screen);
    }
}

void UIManager::set_active_screen(Screen* screen) {
    if (screen == active_screen_) {
        return;
    }
    
    pending_screen_ = screen;
}

Screen* UIManager::get_active_screen() {
    return active_screen_;
}

Screen* UIManager::find_screen(const char* name) {
    for (Screen* screen : screens_) {
        if (strcmp(screen->get_name(), name) == 0) {
            return screen;
        }
    }
    return nullptr;
}

void UIManager::draw() {
    if (!active_screen_) {
        return;
    }
    
    active_screen_->on_draw();
    active_screen_->clear_dirty();
}

void UIManager::force_redraw() {
    if (active_screen_) {
        active_screen_->mark_dirty();
    }
}

void UIManager::dispatch_touch_events() {
    if (!active_screen_ || !touch_) {
        return;
    }
    
    bool current_touch = touch_->is_touched();
    TouchPoint point = touch_->get_touch_point();
    
    // Touch down (transition from not touched to touched)
    if (current_touch && !last_touch_state_) {
        active_screen_->on_touch_down(point);
    }
    // Touch up (transition from touched to not touched)
    else if (!current_touch && last_touch_state_) {
        active_screen_->on_touch_up(last_touch_point_);
    }
    // Touch move (still touching, position changed)
    else if (current_touch && last_touch_state_) {
        if (point.x != last_touch_point_.x || point.y != last_touch_point_.y) {
            active_screen_->on_touch_move(point);
        }
    }
    
    last_touch_state_ = current_touch;
    if (current_touch) {
        last_touch_point_ = point;
    }
}

void UIManager::handle_screen_transition(Screen* new_screen) {
    if (!new_screen) {
        return;
    }
    
    // Exit old screen
    if (active_screen_) {
        active_screen_->on_exit();
    }
    
    // Enter new screen
    active_screen_ = new_screen;
    active_screen_->on_enter();
    active_screen_->mark_dirty();
    
    Logger::printf("Screen transition to: %s\n", new_screen->get_name());
}
