#include "core/preferences_manager.h"
#include "core/logger.h"

const char* PreferencesManager::NAMESPACE = "genlink";

PreferencesManager::PreferencesManager()
    : initialized_(false) {
}

PreferencesManager::~PreferencesManager() {
    if (initialized_) {
        preferences_.end();
    }
}

bool PreferencesManager::initialize() {
    if (initialized_) {
        return true;
    }
    
    // Open preferences with namespace
    if (!preferences_.begin(NAMESPACE, false)) {
        Logger::error("Failed to open preferences namespace");
        return false;
    }
    
    initialized_ = true;
    Logger::printf("Preferences initialized (namespace: %s)\n", NAMESPACE);
    return true;
}

String PreferencesManager::get_string(const char* key, const String& default_value) {
    if (!initialized_) {
        return default_value;
    }
    return preferences_.getString(key, default_value);
}

bool PreferencesManager::set_string(const char* key, const String& value) {
    if (!initialized_) {
        return false;
    }
    return preferences_.putString(key, value) > 0;
}

int PreferencesManager::get_int(const char* key, int default_value) {
    if (!initialized_) {
        return default_value;
    }
    return preferences_.getInt(key, default_value);
}

bool PreferencesManager::set_int(const char* key, int value) {
    if (!initialized_) {
        return false;
    }
    return preferences_.putInt(key, value) > 0;
}

bool PreferencesManager::get_bool(const char* key, bool default_value) {
    if (!initialized_) {
        return default_value;
    }
    return preferences_.getBool(key, default_value);
}

bool PreferencesManager::set_bool(const char* key, bool value) {
    if (!initialized_) {
        return false;
    }
    return preferences_.putBool(key, value) > 0;
}

float PreferencesManager::get_float(const char* key, float default_value) {
    if (!initialized_) {
        return default_value;
    }
    return preferences_.getFloat(key, default_value);
}

bool PreferencesManager::set_float(const char* key, float value) {
    if (!initialized_) {
        return false;
    }
    return preferences_.putFloat(key, value) > 0;
}

bool PreferencesManager::clear_all() {
    if (!initialized_) {
        return false;
    }
    return preferences_.clear();
}

bool PreferencesManager::remove_key(const char* key) {
    if (!initialized_) {
        return false;
    }
    return preferences_.remove(key);
}

bool PreferencesManager::exists(const char* key) {
    if (!initialized_) {
        return false;
    }
    return preferences_.isKey(key);
}

bool PreferencesManager::commit() {
    // ESP32 Preferences auto-commit, but provided for API compatibility
    return initialized_;
}
