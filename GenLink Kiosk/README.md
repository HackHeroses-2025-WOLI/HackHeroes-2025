# GenLink Kiosk - Professional Architecture

ESP32-based kiosk system with ILI9341 TFT display, XPT2046 touch controller, and PN532 NFC reader.

## Architecture Overview

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

## Hardware Wiring

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