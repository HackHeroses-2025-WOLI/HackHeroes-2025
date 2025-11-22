#pragma once

#include "config.h"
#include <Arduino.h>

/**
 * @brief Logger class with conditional compilation based on DEBUG flag
 * 
 * When DEBUG is enabled, logging functions output to Serial.
 * When DEBUG is disabled, all logging calls are compiled out (zero overhead).
 * 
 * Usage:
 *   Logger::init();                    // Call once in setup()
 *   Logger::print("Hello");            // Only outputs if DEBUG=1
 *   Logger::println("World");
 *   Logger::printf("Value: %d\n", 42);
 */
class Logger {
public:
    /**
     * @brief Initialize serial communication for logging
     * @param baud_rate Baud rate for Serial (default: SERIAL_BAUD from config)
     */
    static void init(unsigned long baud_rate = SERIAL_BAUD) {
#ifdef DEBUG
        Serial.begin(baud_rate);
        // Wait for serial to be ready (useful for native USB boards)
        unsigned long start = millis();
        while (!Serial && (millis() - start < 2000)) {
            delay(10);
        }
#endif
    }
    
    /**
     * @brief Print without newline
     */
    template<typename T>
    static inline void print(const T& msg) {
#ifdef DEBUG
        Serial.print(msg);
#else
        (void)msg;  // Suppress unused variable warning
#endif
    }
    
    /**
     * @brief Print with newline
     */
    template<typename T>
    static inline void println(const T& msg) {
#ifdef DEBUG
        Serial.println(msg);
#else
        (void)msg;
#endif
    }
    
    /**
     * @brief Print newline only
     */
    static inline void println() {
#ifdef DEBUG
        Serial.println();
#endif
    }
    
    /**
     * @brief Printf-style formatted output
     */
    template<typename... Args>
    static inline void printf(const char* format, Args... args) {
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
    template<typename T>
    static inline void info(const T& msg) {
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
    template<typename T>
    static inline void warning(const T& msg) {
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
    template<typename T>
    static inline void error(const T& msg) {
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
    template<typename T>
    static inline void debug(const T& msg) {
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
    static inline void separator(char c = '=', int length = 40) {
#ifdef DEBUG
        for (int i = 0; i < length; i++) {
            Serial.print(c);
        }
        Serial.println();
#else
        (void)c;
        (void)length;
#endif
    }
};
