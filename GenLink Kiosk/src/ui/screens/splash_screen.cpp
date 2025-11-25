#include "ui/screens/splash_screen.h"
#include "hardware/display_manager.h"
#include <Adafruit_ILI9341.h>
#include "core/system_manager.h"
#include "hardware/nfc_manager.h"
#include "ui/screens/error_screen.h"
#include "ui/screens/configuration_screen.h"
#include "ui/ui_manager.h"
#include "ProjectConfig.h"

namespace
{
    constexpr uint8_t ADMIN_CARD_UID_BYTES = 4;
}

SplashScreen::SplashScreen()
    : Screen("splash"), enter_time_ms_(0), admin_override_active_(false), configuration_screen_(nullptr), transitioned_(false), last_phase_name_(), init_failure_pending_(false), init_success_pending_(false)
{
}

SplashScreen::~SplashScreen() {}

void SplashScreen::on_enter()
{
    Screen::on_enter();
    enter_time_ms_ = millis();
    admin_override_active_ = false;
    transitioned_ = false;
    last_phase_name_.clear();
    init_failure_pending_ = false;
    init_success_pending_ = false;
    mark_dirty();
}

void SplashScreen::on_update()
{
    SystemManager &sys = SystemManager::get_instance();

    if (!sys.is_initialization_started())
    {
        sys.start_initialization();
        update_phase_if_needed();
        mark_dirty();
        return;
    }

    update_phase_if_needed();

    if (!transitioned_)
    {
        check_admin_card_override();
    }

    if (sys.is_initialization_failed())
    {
        init_failure_pending_ = true;
    }

    if (sys.is_initialization_complete())
    {
        init_success_pending_ = true;
    }

    if (init_failure_pending_ && !transitioned_ && has_min_display_time_elapsed())
    {
        ErrorScreen *err = new ErrorScreen("Initialization Error", String(sys.get_initialization_error()));
        UIManager *ui = SystemManager::get_instance().get_ui_manager();
        if (ui)
        {
            ui->register_screen(err);
            ui->set_active_screen(err);
        }
        transitioned_ = true;
        return;
    }

    if (init_success_pending_ && !transitioned_ && has_min_display_time_elapsed())
    {
        UIManager *ui = SystemManager::get_instance().get_ui_manager();
        if (ui)
        {
            ui->set_active_screen("genlink_flow");
        }
        transitioned_ = true;
    }
}

void SplashScreen::on_draw()
{
    if (!display_)
        return;

    display_->fill_screen(ILI9341_WHITE);

    display_->set_text_size(3);
    display_->set_text_color(ILI9341_BLACK);
    display_->set_cursor(45, 200);
    display_->print_text(SystemManager::get_instance().get_app_name());

    display_->set_text_size(1);
    display_->set_cursor(45, 227);
    display_->print_text("v");
    display_->print_text(SystemManager::get_instance().get_app_version());

    // Show current initialization phase
    if (!transitioned_ && SystemManager::get_instance().is_initialization_started())
    {
        display_->set_text_size(2);
        display_->set_text_color(ILI9341_CYAN);
        display_->set_cursor(10, 280);
        String phase_label = last_phase_name_.isEmpty() ? String("...") : last_phase_name_;
        display_->print_text(String("Initializing: ") + phase_label);
    }

    clear_dirty();
}

bool SplashScreen::has_min_display_time_elapsed() const
{
    return (millis() - enter_time_ms_) >= MIN_DISPLAY_MS;
}

void SplashScreen::check_admin_card_override()
{
    if (transitioned_ || admin_override_active_)
    {
        return;
    }

    if (has_min_display_time_elapsed())
    {
        // Admin override is only available during the initial splash window
        return;
    }

    SystemManager &sys = SystemManager::get_instance();
    NfcManager *nfc = sys.get_nfc_manager();
    if (!nfc || !nfc->is_initialized() || !nfc->is_card_present())
    {
        return;
    }

    const NfcCard card = nfc->get_last_card();
    if (card.uid_length != ADMIN_CARD_UID_BYTES)
    {
        return;
    }

    String uid = card.get_uid_string();
    if (uid.length() == 0)
    {
        return;
    }

    String expected = String(ADMIN_CARD_UID);
    expected.toUpperCase();
    if (uid.equalsIgnoreCase(expected))
    {
        enter_configuration_mode();
    }
}

void SplashScreen::enter_configuration_mode()
{
    UIManager *ui = SystemManager::get_instance().get_ui_manager();
    if (!ui)
    {
        return;
    }

    if (!configuration_screen_)
    {
        configuration_screen_ = new ConfigurationScreen();
        ui->register_screen(configuration_screen_);
    }

    ui->set_active_screen(configuration_screen_);

    // Switch UI to configuration screen when admin card detected.
    // and let the configuration screen handle any further actions.
    admin_override_active_ = true;
    transitioned_ = true;
}

void SplashScreen::update_phase_if_needed()
{
    SystemManager &sys = SystemManager::get_instance();
    if (!sys.is_initialization_started())
    {
        if (!last_phase_name_.isEmpty())
        {
            last_phase_name_.clear();
            mark_dirty();
        }
        return;
    }

    const char *phase = sys.get_initialization_phase_name();
    if (!phase)
    {
        return;
    }

    if (last_phase_name_.equals(phase))
    {
        return;
    }

    last_phase_name_ = phase;
    mark_dirty();
}
