// Project-wide configuration and pin mapping
// Put shared pin defines / configuration here. PlatformIO will
// automatically add `include/` to the compiler search path.
//
// You can override any value per-environment in `platformio.ini` with build_flags,
// e.g. in platformio.ini:
// [env:esp32dev]
// build_flags =
//   -D TFT_DC=5
//   -D TFT_CS=15
// This file provides sensible defaults if no build_flags are set.

#pragma once

#include <Arduino.h>

// ==================== TFT Display Pins ====================
#ifndef TFT_DC
#define TFT_DC 9
#endif

#ifndef TFT_CS
#define TFT_CS 10
#endif

#ifndef TFT_RST
#define TFT_RST 8
#endif

// ==================== Touch Pins ====================
#ifndef TOUCH_CS
#define TOUCH_CS 4
#endif

#ifndef TOUCH_IRQ
#define TOUCH_IRQ 5
#endif

// ==================== Touch Calibration ====================
#ifndef TS_MIN_X
#define TS_MIN_X 200
#endif

#ifndef TS_MAX_X
#define TS_MAX_X 3800
#endif

#ifndef TS_MIN_Y
#define TS_MIN_Y 200
#endif

#ifndef TS_MAX_Y
#define TS_MAX_Y 3800
#endif

// ==================== Display Settings ====================
#ifndef DISPLAY_ROTATION
#define DISPLAY_ROTATION 1  // Landscape
#endif

#ifndef TOUCH_ROTATION
#define TOUCH_ROTATION 3  // Adjust to match display orientation
#endif

// ==================== Serial Settings ====================
#ifndef SERIAL_BAUD
#define SERIAL_BAUD 115200
#endif

// ==================== Application Settings ====================
#ifndef APP_NAME
#define APP_NAME "GenLink Kiosk"
#endif

#ifndef APP_VERSION
#define APP_VERSION "1.0.0"
#endif
