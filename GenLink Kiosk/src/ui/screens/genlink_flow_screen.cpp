#include "ui/screens/genlink_flow_screen.h"
#include "hardware/display_manager.h"
#include "core/system_manager.h"
#include "core/logger.h"
#include "hardware/network_manager.h"
#include "hardware/nfc_manager.h"
#include "data/resident_registry.h"
#include <Adafruit_ILI9341.h>

using ui::elements::Button;
using ui::elements::SelectionMenu;

namespace
{
    constexpr int16_t DEFAULT_SCREEN_WIDTH = 320;

    void draw_centered_text(DisplayManager *display, const String &text, int16_t y, uint8_t size, uint16_t color)
    {
        if (!display)
            return;
        Adafruit_GFX *gfx = display->get_gfx();
        if (!gfx)
            return;
        int16_t x1, y1;
        uint16_t w, h;
        gfx->setTextSize(size);
        gfx->setTextColor(color);
        gfx->getTextBounds(text.c_str(), 0, 0, &x1, &y1, &w, &h);
        int16_t width = display->get_width();
        if (width <= 0)
        {
            width = DEFAULT_SCREEN_WIDTH;
        }
        int16_t x = (width - static_cast<int16_t>(w)) / 2;
        if (x < 0)
        {
            x = 0;
        }
        display->set_text_size(size);
        display->set_text_color(color);
        display->set_cursor(x, y);
        display->print_text(text);
    }
}

GenLinkFlowScreen::GenLinkFlowScreen()
    : Screen("genlink_flow"),
      state_(FlowState::Welcome),
      start_button_(70, 170, 180, 60, String("Rozpocznij")),
      issue_next_button_(211, 205, 90, 32, String("Dalej")),
      issue_back_button_(18, 205, 90, 32, String("Wstecz")),
      nfc_back_button_(105, 185, 115, 45, String("Wstecz")),
      confirm_send_button_(180, 170, 120, 45, String("Wyslij")),
      confirm_cancel_button_(20, 170, 120, 45, String("Anuluj")),
      finish_button_(75, 180, 175, 45, String("Zakoncz")),
      selection_menu_(20, 30, 280, 170),
      nfc_verified_(false),
      last_detected_uid_(),
      user_apartment_(0),
      backend_options_loaded_(false),
      predicted_wait_minutes_(15)
{
    problem_options_ = {String("Wideo"), String("Bank"), String("E-recepta"), String("Aplikacje"), String("Inne")};
    selection_menu_.set_items(problem_options_);
    selection_menu_.clear_selection();
    selection_menu_.force_redraw();
    if (selection_menu_.has_selection())
    {
        selected_issue_ = selection_menu_.get_selected_label();
    }

    try_update_problem_options_from_backend();

    start_button_.set_on_click([this]()
                               { transition_to(FlowState::ProblemSelection); });

    issue_back_button_.set_on_click([this]()
                                    { transition_to(FlowState::Welcome); });

    issue_next_button_.set_on_click([this]()
                                    { handle_issue_confirm(); });

    nfc_back_button_.set_on_click([this]()
                                  {
                                      nfc_verified_ = false;
                                      last_detected_uid_.clear();
                                      transition_to(FlowState::ProblemSelection); });

    confirm_send_button_.set_on_click([this]()
                                      {
                                          if (!nfc_verified_)
                                              return;

                                          // Show sending status on-screen before doing network work
                                          if (display_)
                                          {
                                              display_->fill_screen(ILI9341_WHITE);
                                              draw_centered_text(display_, String("Wysylanie..."), 120, 2, ILI9341_BLACK);
                                          }

                                          // Attempt to submit report to backend (synchronous)
                                          SystemManager &sys = SystemManager::get_instance();
                                          NetworkManager *net = sys.get_network_manager();
                                          if (net)
                                          {
                                              String api_resp;
                                              bool ok = net->submit_report(user_name_.c_str(), user_phone_.c_str(), &api_resp);
                                              if (!ok)
                                              {
                                                  // Log backend rejection / error body for debugging
                                                  char msg[256] = {};
                                                  snprintf(msg, sizeof(msg), "Report submit failed: %s", api_resp.c_str());
                                                  Logger::warning(msg);
                                              }
                                              else
                                              {
                                                  // Try to fetch average response time immediately after a successful submit
                                                  int minutes = 0;
                                                  if (net->fetch_avg_response_time(minutes))
                                                  {
                                                      // sanity check
                                                      if (minutes > 0 && minutes < 60 * 24)
                                                          predicted_wait_minutes_ = minutes;
                                                      else
                                                          predicted_wait_minutes_ = -1;
                                                  }
                                                  else
                                                  {
                                                      // response was null or unparsable — show placeholder
                                                      predicted_wait_minutes_ = -1;
                                                  }
                                                  Logger::println("Report submitted successfully");
                                              }
                                          }

                                          transition_to(FlowState::SubmissionComplete); });

    confirm_cancel_button_.set_on_click([this]()
                                        {
                                            reset_session();
                                            transition_to(FlowState::Welcome); });

    finish_button_.set_on_click([this]()
                                {
                                    reset_session();
                                    transition_to(FlowState::Welcome); });
}

GenLinkFlowScreen::~GenLinkFlowScreen() = default;

void GenLinkFlowScreen::on_enter()
{
    Screen::on_enter();
    try_update_problem_options_from_backend();
    mark_dirty();
}

void GenLinkFlowScreen::on_draw()
{
    if (!display_)
        return;

    switch (state_)
    {
    case FlowState::Welcome:
        draw_welcome();
        break;
    case FlowState::ProblemSelection:
        draw_problem_selection();
        break;
    case FlowState::NfcPrompt:
        draw_nfc_prompt();
        break;
    case FlowState::IdentityConfirm:
        draw_identity_confirmation();
        break;
    case FlowState::SubmissionComplete:
        draw_submission_confirmation();
        break;
    }

    clear_dirty();
}

void GenLinkFlowScreen::on_update()
{
    Screen::on_update();
    try_update_problem_options_from_backend();
    handle_nfc_detection();
}

void GenLinkFlowScreen::on_touch_down(const TouchPoint &point)
{
    switch (state_)
    {
    case FlowState::Welcome:
        handle_touch_down_button(start_button_, point);
        break;
    case FlowState::ProblemSelection:
    {
        int previous_index = selection_menu_.get_selected();
        if (selection_menu_.on_touch_down(point))
        {
            if (display_)
            {
                selection_menu_.draw(display_);
            }
            if (selection_menu_.get_selected() != previous_index)
            {
                selected_issue_ = selection_menu_.get_selected_label();
            }
        }
        handle_touch_down_button(issue_back_button_, point);
        handle_touch_down_button(issue_next_button_, point);
        break;
    }
    case FlowState::NfcPrompt:
        handle_touch_down_button(nfc_back_button_, point);
        break;
    case FlowState::IdentityConfirm:
        handle_touch_down_button(confirm_cancel_button_, point);
        handle_touch_down_button(confirm_send_button_, point);
        break;
    case FlowState::SubmissionComplete:
        handle_touch_down_button(finish_button_, point);
        break;
    }
}

void GenLinkFlowScreen::on_touch_up(const TouchPoint &point)
{
    switch (state_)
    {
    case FlowState::Welcome:
        handle_touch_up_button(start_button_, point);
        break;
    case FlowState::ProblemSelection:
        handle_touch_up_button(issue_back_button_, point);
        handle_touch_up_button(issue_next_button_, point);
        break;
    case FlowState::NfcPrompt:
        handle_touch_up_button(nfc_back_button_, point);
        break;
    case FlowState::IdentityConfirm:
        handle_touch_up_button(confirm_cancel_button_, point);
        handle_touch_up_button(confirm_send_button_, point);
        break;
    case FlowState::SubmissionComplete:
        handle_touch_up_button(finish_button_, point);
        break;
    }
}

void GenLinkFlowScreen::transition_to(FlowState next_state)
{
    if (state_ == next_state)
        return;

    if (next_state == FlowState::ProblemSelection)
    {
        if (state_ == FlowState::Welcome)
        {
            reset_session();
        }
        selection_menu_.force_redraw();
        if (selection_menu_.has_selection())
        {
            selected_issue_ = selection_menu_.get_selected_label();
        }
    }

    if (next_state == FlowState::Welcome)
    {
        selection_menu_.clear_selection();
        if (selection_menu_.has_selection())
        {
            selected_issue_ = selection_menu_.get_selected_label();
        }
    }

    state_ = next_state;
    mark_dirty();
}

void GenLinkFlowScreen::reset_session()
{
    selected_issue_.clear();
    user_name_.clear();
    user_phone_.clear();
    user_apartment_ = 0;
    nfc_verified_ = false;
    last_detected_uid_.clear();
    selection_menu_.clear_selection();
    selection_menu_.force_redraw();
    if (selection_menu_.has_selection())
    {
        selected_issue_ = selection_menu_.get_selected_label();
    }
}

void GenLinkFlowScreen::handle_issue_confirm()
{
    if (!selection_menu_.has_selection())
        return;

    selected_issue_ = selection_menu_.get_selected_label();
    transition_to(FlowState::NfcPrompt);
}

void GenLinkFlowScreen::handle_nfc_detection()
{
    if (state_ != FlowState::NfcPrompt)
    {
        return;
    }

    SystemManager &sys = SystemManager::get_instance();
    NfcManager *nfc = sys.get_nfc_manager();
    if (!nfc || !nfc->is_initialized() || !nfc->is_card_present())
    {
        return;
    }

    const NfcCard card = nfc->get_last_card();
    String uid = card.get_uid_string();
    uid.toUpperCase();
    if (uid.isEmpty() || uid == last_detected_uid_)
    {
        return;
    }

    last_detected_uid_ = uid;

    // UIDs for residents are fixed to 4 bytes — we match the first 4 bytes of the card UID
    const ResidentRecord *record = ResidentRegistry::get_instance().find_by_uid(card.uid);
    if (record)
    {
        user_name_ = String(record->imie_nazwisko);
        user_phone_ = String(record->nr_telefonu);
        user_apartment_ = record->nr_mieszkania;
    }
    else
    {
        // Unknown card — show a generic label and omit the raw UID from the UI
        user_name_ = String("Uzytkownik");
        user_phone_ = String("Brak telefonu");
        user_apartment_ = 0;
    }

    nfc_verified_ = true;
    transition_to(FlowState::IdentityConfirm);
}

void GenLinkFlowScreen::try_update_problem_options_from_backend()
{
    if (backend_options_loaded_)
    {
        return;
    }

    SystemManager &sys = SystemManager::get_instance();
    if (!sys.has_report_type_names())
    {
        return;
    }

    apply_problem_options(sys.get_report_type_names());
    backend_options_loaded_ = true;
    mark_dirty();
}

void GenLinkFlowScreen::apply_problem_options(const std::vector<String> &options)
{
    if (options.empty())
    {
        return;
    }

    problem_options_ = options;
    selection_menu_.set_items(problem_options_);
    selection_menu_.clear_selection();
    selection_menu_.force_redraw();
    if (selection_menu_.has_selection())
    {
        selected_issue_ = selection_menu_.get_selected_label();
    }
}

void GenLinkFlowScreen::draw_welcome()
{
    display_->fill_screen(ILI9341_NAVY);
    display_->set_text_color(ILI9341_WHITE);
    display_->set_text_size(4);
    display_->set_cursor(15, 15);
    display_->print_text("GenLink");
    display_->set_cursor(193, 15);
    display_->print_text("Kiosk");
    draw_centered_text(display_, "Dotknij aby rozpoczac", 130, 2, ILI9341_CYAN);
    start_button_.draw(display_);
}

void GenLinkFlowScreen::draw_problem_selection()
{
    display_->fill_screen(ILI9341_BLACK);
    draw_centered_text(display_, "Wybierz rodzaj pomocy", 5, 2, ILI9341_WHITE);
    selection_menu_.force_redraw();
    selection_menu_.draw(display_);

    issue_back_button_.draw(display_);
    issue_next_button_.draw(display_);
}

void GenLinkFlowScreen::draw_nfc_prompt()
{
    display_->fill_screen(ILI9341_DARKCYAN);
    draw_centered_text(display_, "Przyloz karte NFC", 40, 3, ILI9341_WHITE);
    draw_centered_text(display_, "Przyloz swoja karte", 120, 2, ILI9341_WHITE);
    draw_centered_text(display_, "do czytnika", 145, 2, ILI9341_WHITE);
    nfc_back_button_.draw(display_);
}

void GenLinkFlowScreen::draw_identity_confirmation()
{
    display_->fill_screen(ILI9341_WHITE);
    draw_centered_text(display_, "Potwierdz dane", 10, 3, ILI9341_BLACK);

    display_->set_text_color(ILI9341_DARKCYAN);
    display_->set_text_size(2);
    display_->set_cursor(20, 70);
    display_->print_text(user_name_);

    display_->set_cursor(20, 90);
    display_->print_text(String("Telefon: ") + user_phone_);

    display_->set_cursor(20, 110);
    display_->print_text(String("Problem: "));
    display_->set_cursor(20, 130);
    display_->print_text(String(selected_issue_));

    confirm_cancel_button_.draw(display_);
    confirm_send_button_.draw(display_);
}

void GenLinkFlowScreen::draw_submission_confirmation()
{
    display_->fill_screen(ILI9341_WHITE);
    draw_centered_text(display_, "Zgloszenie", 15, 3, ILI9341_DARKGREEN);
    draw_centered_text(display_, "wyslane!", 42, 3, ILI9341_DARKGREEN);
    display_->set_text_size(2);
    display_->set_text_color(ILI9341_BLACK);
    display_->set_cursor(25, 125);
    draw_centered_text(display_, "Dziekujemy!", 90, 2, ILI9341_BLACK);
    display_->set_cursor(25, 125);
    display_->print_text(String("Przewidywany czas"));
    display_->set_cursor(25, 145);
    if (predicted_wait_minutes_ <= 0)
    {
        display_->print_text(String("oczekiwania: -- minut"));
    }
    else
    {
        display_->print_text(String("oczekiwania: ") + String(predicted_wait_minutes_) + String(" minut"));
    }
    finish_button_.draw(display_);
}

void GenLinkFlowScreen::handle_touch_down_button(Button &button, const TouchPoint &point)
{
    if (button.on_touch_down(point) && display_)
    {
        button.draw(display_);
    }
}

void GenLinkFlowScreen::handle_touch_up_button(Button &button, const TouchPoint &point)
{
    if (button.on_touch_up(point) && display_)
    {
        button.draw(display_);
    }
}
