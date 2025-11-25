#pragma once

#include "ui/screen.h"

class ErrorScreen : public Screen
{
public:
    ErrorScreen(const String &title = "Error", const String &details = "");
    ~ErrorScreen() override;

    void set_error(const String &title, const String &details);

    void on_enter() override;
    void on_draw() override;

private:
    String title_;
    String details_;
};
