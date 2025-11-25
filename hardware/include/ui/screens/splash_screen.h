#pragma once

#include "ui/screen.h"

class ConfigurationScreen;

/**
 * @brief Splash screen shown at boot/initialization
 *
 * Minimal placeholder screen — shows app name and version. Implement
 * animations, progress or branding as needed later.
 */
class SplashScreen : public Screen
{
public:
    SplashScreen();
    ~SplashScreen() override;

    void on_enter() override;
    void on_draw() override;
    void on_update() override;

private:
    bool has_min_display_time_elapsed() const;
    void check_admin_card_override();
    void enter_configuration_mode();
    void update_phase_if_needed();

    static constexpr unsigned long MIN_DISPLAY_MS = 5000;
    unsigned long enter_time_ms_;
    bool admin_override_active_;
    ConfigurationScreen *configuration_screen_;
    bool transitioned_;
    String last_phase_name_;
    bool init_failure_pending_;
    bool init_success_pending_;
};
