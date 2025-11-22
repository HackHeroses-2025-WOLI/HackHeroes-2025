#ifndef CONFIG_H
#define CONFIG_H

/* =================== Debug Settings =================== */

#ifndef DEBUG
#define DEBUG 1  // Set to 0 to disable debug logging
#endif

#ifndef SERIAL_BAUD
#define SERIAL_BAUD 115200
#endif

/* =================== Display =================== */

#define TFT_DC  9
#define TFT_CS  10
#define TFT_RST 8

#define TOUCH_CS  4
#define TOUCH_IRQ 5

/* =========== PN532 (RFID/NFC sensor) =========== */

#define PN532_SDA_PIN 7
#define PN532_SCL_PIN 6
#define PN532_IRQ    -1
#define PN532_RESET  -1

/* =================== Application Info =================== */

#ifndef APP_NAME
#define APP_NAME "GenLink Kiosk"
#endif

#ifndef APP_VERSION
#define APP_VERSION "1.0.0"
#endif

#endif // CONFIG_H