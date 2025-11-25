# GenLink Kiosk

ESP32 kiosk firmware — touchscreen UI and PN532 NFC reader for a small 'report help' flow.

This project is a minimal prototype for a local kiosk where residents can select a problem category, tap an NFC card to identify themselves, and submit a report to a backend service.

Project overview
----------------
- Platform: ESP32 (PlatformIO)
- Display: ILI9341 TFT with XPT2046 touch controller
- NFC reader: PN532 (I2C)
- Main features: multi-screen UI, NFC-based resident lookup (compile-time), backend integration (report submission + metrics)

Build & upload (PlatformIO)
---------------------------
Prerequisites:
- PlatformIO (VSCode recommended) or pio CLI

Build and upload:

```powershell
# build
pio run

# upload (connect board to USB first)
pio run -t upload

# serial monitor (115200 baud)
pio device monitor --baud 115200
```

Configuration
-------------
All compile-time application settings live in `include/ProjectConfig.h`.
Do NOT commit production secrets directly into source; for production prefer overriding values using `platformio.ini` build_flags.

Key values:
- WIFI_SSID / WIFI_PASSWORD — WiFi credentials
- API_BASE_URL — backend URL for submitting reports
- DEBUG — set to 0 to disable Serial logging

Example (platformio.ini override)

```ini
[env:esp32dev]
build_flags = -D WIFI_SSID=\"MySSID\" -D WIFI_PASSWORD=\"MySecret\"
```

Managing residents & NFC cards
-----------------------------
Current design uses a compile-time resident table. To add or change residents:

1. Edit `src/data/resident_registry.cpp`.
2. Modify the `BUILTIN_RESIDENTS` array — each entry is a 4-byte UID, a name string, a phone number and an apartment number.
3. Rebuild and upload the firmware.

Example entry:

```cpp
    {{0x04, 0xA1, 0xB2, 0xC3}, "Jan Kowalski", "600000001", 12, true}
```

Runtime management note
-----------------------
This firmware does not persist resident records. If you need to add/remove cards without rebuilding, we can add a persistent storage layer (ESP32 NVS / Preferences) and a small admin UI.

Device maintenance (short guide)
-------------------------------
- To change WiFi credentials: modify `include/ProjectConfig.h` or provide build_flags in `platformio.ini`.
- To add residents: update `src/data/resident_registry.cpp` as described and re-flash.
- To view logs: use `pio device monitor` (115200 by default).

Developer notes
---------------
- Code is organized under `src/` and `include/` following subsystem boundaries: `core`, `hardware`, `ui`, `data`.
- Logger behaviour is controlled by `DEBUG` define: set `DEBUG=0` for no logging.
- The resident registry is non-persistent and limited to 100 slots (configurable in the header).

If you want funding for adding secure admin UI or runtime persistence for users, I can implement that next (NVS-backed registry and password-protected admin flows).

# GenLink Kiosk - Professional Architecture

ESP32-based kiosk system with ILI9341 TFT display, XPT2046 touch controller, and PN532 NFC reader.

### Core System (`src/core/`, `include/core/`)

- **SystemManager**: Singleton coordinator managing all subsystems
- **PreferencesManager**: Persistent storage using ESP32 NVS
- **Logger**: Conditional debug logging (zero overhead when `DEBUG=0`)

### Hardware Abstraction (`src/hardware/`, `include/hardware/`)

- **DisplayManager**: ILI9341 TFT wrapper with snake_case API
- **TouchManager**: XPT2046 touch with calibration and debouncing
- **NfcManager**: PN532 NFC/RFID reader with event callbacks

### UI Framework (`src/ui/`, `include/ui/`)

- **UIManager**: Screen navigation and touch event dispatch
- **Screen**: Base class with lifecycle hooks (`on_enter`, `on_draw`, `on_touch_*`)
- **ExampleScreen**: Reference implementation

## Hardware Wiring (default, can be changed in `config.h`)

```
TFT Display (ILI9341):
  CS   -> GPIO10
  DC   -> GPIO9
  RST  -> GPIO8
  MOSI -> GPIO11
  SCK  -> GPIO12
  MISO -> GPIO13
  LED  -> 3V3 (330Ω resistor)

Touch Controller (XPT2046):
  T_CLK -> GPIO12 (shared with TFT)
  T_CS  -> GPIO4
  T_DIN -> GPIO11 (shared with TFT)
  T_DO  -> GPIO13 (shared with TFT)
  T_IRQ -> GPIO5

PN532 NFC Reader:
  SDA -> GPIO7
  SCL -> GPIO6
```

## Quick Start

```cpp
#include "core/system_manager.h"
#include "ui/screens/example_screen.h"

SystemManager* sys = nullptr;

void setup() {
    sys = &SystemManager::get_instance();
    if (!sys->initialize()) {
        Logger::error("Init failed!");
        while(1) delay(1000);
    }
    
    auto screen = new ExampleScreen();
    sys->get_ui_manager()->register_screen(screen);
    sys->get_ui_manager()->set_active_screen(screen);
}

void loop() {
    sys->update();
    delay(10);
}
```

## NFC Usage

```cpp
#include "hardware/nfc_manager.h"

// Callback function
void on_card_detected(const NfcCard& card) {
    Logger::printf("Card: %s\n", card.get_uid_string().c_str());
    // card.uid[] - raw bytes
    // card.uid_length - number of bytes
}

void setup() {
    // ... system initialization ...
    
    NfcManager* nfc = sys->get_nfc_manager();
    if (nfc && nfc->is_initialized()) {
        nfc->set_card_detected_callback(on_card_detected);
        Logger::info("NFC ready!");
    }
}
```

See `NfcScreen` class for complete example with UI integration.

## Logger Usage

```cpp
#include "core/logger.h"

Logger::init();                          // In setup()
Logger::info("App started");             // [INFO] message
Logger::printf("Value: %d\n", 42);      // Formatted
Logger::error("Something failed");       // [ERROR] message
```

Set `DEBUG 0` in `config.h` to disable all logging (zero runtime cost).

## Configuration

Edit `include/config.h`:

```cpp
#define DEBUG 1              // Enable/disable logging
#define SERIAL_BAUD 115200   // Serial speed
#define TFT_DC   9           // Display pins
#define TOUCH_CS 4           // Touch pins
```

Override per environment in `platformio.ini`:

```ini
build_flags = 
    -D DEBUG=0
    -D TFT_DC=5
```

## Building

```bash
pio run              # Compile
pio run -t upload    # Upload to ESP32
pio device monitor   # Serial monitor
```

## Documentation

See code comments and examples in:

- `src/main.cpp` - Application entry
- `src/ui/screens/example_screen.cpp` - Screen example
- `src/ui/screens/nfc_screen.cpp` - NFC reader example with callbacks
- `include/core/logger.h` - Logger API
- `include/core/preferences_manager.h` - NVS storage
- `include/hardware/nfc_manager.h` - NFC card detection

## License

MIT