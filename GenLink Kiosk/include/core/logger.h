#pragma once

#include "ProjectConfig.h"
#include <Arduino.h>

/**
 * @brief Lightweight logger that compiles to Serial output when DEBUG is enabled
 *
 * This logger is intentionally minimal and uses preprocessor guards so that
 * when DEBUG is not defined all logging calls are compiled out. When DEBUG
 * is set, the methods forward to the Hardware Serial instance.
 *
 * Usage:
 *   Logger::init();                    // Call once in setup()
 *   Logger::print("Hello");          // Only outputs when compiled with DEBUG
 *   Logger::println("World");
 *   Logger::printf("Value: %d\n", 42);
 */
class Logger
{
public:
        /**
         * @brief Initialize serial communication for logging
         * @param baud_rate Baud rate for Serial (default: SERIAL_BAUD from config)
         */
        /**
         * @brief Initialize Serial logging (no-op when DEBUG is not defined)
         * @param baud_rate baud rate used to configure Serial
         */
        static void init(unsigned long baud_rate = SERIAL_BAUD)
        {
#ifdef DEBUG
                Serial.begin(baud_rate);
                // Wait for serial to be ready (useful for native USB boards)
                unsigned long start = millis();
                while (!Serial && (millis() - start < 2000))
                {
                        delay(10);
                }
#endif
        }

        // No runtime toggles here — logging is controlled at compile-time
        // by the DEBUG flag. Keep the interface minimal and efficient.

        /**
         * @brief Print without newline
         */
        /** @brief Print without newline (no-op when DEBUG not set) */
        template <typename T>
        static inline void print(const T &msg)
        {
#ifdef DEBUG
                Serial.print(msg);
#else
                (void)msg; // Suppress unused variable warning
#endif
        }

        /**
         * @brief Print with newline
         */
        /** @brief Print with newline (no-op when DEBUG not set) */
        template <typename T>
        static inline void println(const T &msg)
        {
#ifdef DEBUG
                Serial.println(msg);
#else
                (void)msg;
#endif
        }

        /**
         * @brief Print newline only
         */
        /** @brief Emit newline (no-op when DEBUG not set) */
        static inline void println()
        {
#ifdef DEBUG
                Serial.println();
#endif
        }

        /**
         * @brief Printf-style formatted output
         */
        /** @brief printf-style formatted output (no-op when DEBUG not set) */
        template <typename... Args>
        static inline void printf(const char *format, Args... args)
        {
#ifdef DEBUG
                Serial.printf(format, args...);
#else
                (void)format;
                // Suppress warnings for unused args
                (void)sizeof...(args);
#endif
        }

        /**
         * @brief Print with prefix [INFO]
         */
        /** @brief Print message with [INFO] prefix */
        template <typename T>
        static inline void info(const T &msg)
        {
#ifdef DEBUG
                Serial.print("[INFO] ");
                Serial.println(msg);
#else
                (void)msg;
#endif
        }

        /**
         * @brief Print with prefix [WARNING]
         */
        /** @brief Print message with [WARNING] prefix */
        template <typename T>
        static inline void warning(const T &msg)
        {
#ifdef DEBUG
                Serial.print("[WARNING] ");
                Serial.println(msg);
#else
                (void)msg;
#endif
        }

        /**
         * @brief Print with prefix [ERROR]
         */
        /** @brief Print message with [ERROR] prefix */
        template <typename T>
        static inline void error(const T &msg)
        {
#ifdef DEBUG
                Serial.print("[ERROR] ");
                Serial.println(msg);
#else
                (void)msg;
#endif
        }

        /**
         * @brief Print with prefix [DEBUG]
         */
        /** @brief Print message with [DEBUG] prefix */
        template <typename T>
        static inline void debug(const T &msg)
        {
#ifdef DEBUG
                Serial.print("[DEBUG] ");
                Serial.println(msg);
#else
                (void)msg;
#endif
        }

        /**
         * @brief Print separator line
         */
        /** @brief Print a separator line composed of 'c' characters */
        static inline void separator(char c = '=', int length = 40)
        {
#ifdef DEBUG
                for (int i = 0; i < length; i++)
                {
                        Serial.print(c);
                }
                Serial.println();
#else
                (void)c;
                (void)length;
#endif
        }

private:
};
