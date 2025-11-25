#pragma once

#include "ui/screen.h"
#include "ui/elements/button.h"
#include "ui/elements/selection_menu.h"
#include <Arduino.h>
#include <vector>

/**
 * @brief Multi-step kiosk flow for GenLink MVP
 *
 * Implements the full senior journey: welcome -> problem selection ->
 * NFC prompt -> identity confirmation -> submission confirmation.
 * NFC/network logic is stubbed and simulated for now.
 */
class GenLinkFlowScreen : public Screen
{
public:
    GenLinkFlowScreen();
    ~GenLinkFlowScreen() override;

    void on_enter() override;
    void on_draw() override;
    void on_update() override;
    void on_touch_down(const TouchPoint &point) override;
    void on_touch_up(const TouchPoint &point) override;

private:
    enum class FlowState
    {
        Welcome,
        ProblemSelection,
        NfcPrompt,
        IdentityConfirm,
        SubmissionComplete
    };

    void transition_to(FlowState next_state);
    void reset_session();
    void handle_issue_confirm();
    void handle_nfc_detection();

    // Rendering helpers per state
    void draw_welcome();
    void draw_problem_selection();
    void draw_nfc_prompt();
    void draw_identity_confirmation();
    void draw_submission_confirmation();
    void try_update_problem_options_from_backend();
    void apply_problem_options(const std::vector<String> &options);

    // Shared touch helpers
    void handle_touch_down_button(ui::elements::Button &button, const TouchPoint &point);
    void handle_touch_up_button(ui::elements::Button &button, const TouchPoint &point);

    FlowState state_;

    // UI elements reused across states
    ui::elements::Button start_button_;
    ui::elements::Button issue_next_button_;
    ui::elements::Button issue_back_button_;
    ui::elements::Button nfc_back_button_;
    ui::elements::Button confirm_send_button_;
    ui::elements::Button confirm_cancel_button_;
    ui::elements::Button finish_button_;
    ui::elements::SelectionMenu selection_menu_;

    std::vector<String> problem_options_;
    String selected_issue_;
    String user_name_;
    String user_phone_;
    bool nfc_verified_;
    String last_detected_uid_;
    uint16_t user_apartment_;
    bool backend_options_loaded_;
    int predicted_wait_minutes_;
};
