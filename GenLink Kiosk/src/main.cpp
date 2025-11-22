/**
 * GenLink Kiosk - Main Entry Point
 * 
 * Professional architecture with:
 * - SystemManager: Central coordinator for all subsystems
 * - DisplayManager: Hardware abstraction for ILI9341 TFT
 * - TouchManager: Hardware abstraction for XPT2046 touch
 * - UIManager: Screen management and navigation
 * - PreferencesManager: Persistent NVS storage
 */

#include <Arduino.h>
#include "core/system_manager.h"
#include "core/logger.h"
#include "ui/ui_manager.h"
#include "ui/screens/example_screen.h"

// Global system manager
SystemManager* system_manager = nullptr;

// Application screens
ExampleScreen* example_screen = nullptr;

void setup() {
    // Initialize system
    system_manager = &SystemManager::get_instance();
    
    if (!system_manager->initialize()) {
        Logger::error("FATAL: System initialization failed!");
        while (1) {
            delay(1000);
        }
    }
    
    // Create and register screens
    example_screen = new ExampleScreen();
    system_manager->get_ui_manager()->register_screen(example_screen);
    
    // Set initial screen
    system_manager->get_ui_manager()->set_active_screen(example_screen);
    
    Logger::info("Application started successfully!");
}

void loop() {
    // Main update loop - delegates to all subsystems
    system_manager->update();
    
    // Add small delay to prevent overwhelming the system
    delay(10);
}
