#include <Arduino.h>
#include "core/system_manager.h"
#include "core/logger.h"
#include "ui/ui_manager.h"
#include "ui/screens/genlink_flow_screen.h"
#include "ui/screens/splash_screen.h"

SystemManager *system_manager = nullptr;
SplashScreen *splash_screen = nullptr;
GenLinkFlowScreen *flow_screen = nullptr;

void setup()
{
    Logger::info("Device booting...");

    system_manager = &SystemManager::get_instance();
    system_manager->start_initialization();

    splash_screen = new SplashScreen();
    UIManager *ui = system_manager->get_ui_manager();
    if (ui)
    {
        flow_screen = new GenLinkFlowScreen();
        ui->register_screen(flow_screen);

        ui->register_screen(splash_screen);
        ui->set_active_screen(splash_screen);
    }
    else
    {
        Logger::error("UI Manager unavailable during setup");
    }

    Logger::info("Application started successfully!");
}

void loop()
{
    system_manager->update();
    delay(10);
}
