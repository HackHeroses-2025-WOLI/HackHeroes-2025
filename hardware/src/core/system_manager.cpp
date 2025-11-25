#include "core/system_manager.h"
#include "core/logger.h"
#include "hardware/display_manager.h"
#include "hardware/touch_manager.h"
#include "hardware/nfc_manager.h"
#include "hardware/network_manager.h"
#include "ui/ui_manager.h"
#include "core/preferences_manager.h"
#include "ProjectConfig.h"
#include "data/resident_registry.h"

namespace
{
    constexpr unsigned long REPORT_TYPES_RETRY_INTERVAL_MS = 30000UL;
}

SystemManager &SystemManager::get_instance()
{
    static SystemManager instance;
    return instance;
}

SystemManager::SystemManager()
    : display_manager_(nullptr), touch_manager_(nullptr), ui_manager_(nullptr), preferences_manager_(nullptr), nfc_manager_(nullptr), network_manager_(nullptr), report_type_names_(), report_types_loaded_(false), report_types_requested_(false), last_report_type_attempt_ms_(0), initialized_(false), start_time_ms_(0), init_started_(false), init_failed_(false), init_phase_(InitPhase::NotStarted)
{
}

SystemManager::~SystemManager()
{
    shutdown();
}

bool SystemManager::initialize()
{
    if (initialized_)
    {
        return true;
    }

    Logger::init(SERIAL_BAUD);
    Logger::separator();
    Logger::printf("%s v%s\n", APP_NAME, APP_VERSION);
    Logger::separator();

    start_time_ms_ = millis();

    // Initialize subsystems in order
    Logger::println("Initializing preferences...");
    preferences_manager_ = new PreferencesManager();
    if (!preferences_manager_->initialize())
    {
        Logger::error("Failed to initialize preferences");
        return false;
    }

    Logger::println("Initializing display...");
    display_manager_ = new DisplayManager();
    if (!display_manager_->initialize())
    {
        Logger::error("Failed to initialize display");
        return false;
    }

    Logger::println("Initializing touch...");
    touch_manager_ = new TouchManager();
    if (!touch_manager_->initialize())
    {
        Logger::error("Failed to initialize touch");
        return false;
    }

    Logger::println("Initializing NFC...");
    nfc_manager_ = new NfcManager();
    if (!nfc_manager_->initialize())
    {
        Logger::warning("NFC initialization failed - continuing without NFC");
        // Don't fail completely if NFC is not available
    }

    Logger::println("Initializing UI...");
    ui_manager_ = new UIManager();
    if (!ui_manager_->initialize())
    {
        Logger::error("Failed to initialize UI");
        return false;
    }

    Logger::println("Initializing network...");
    network_manager_ = new NetworkManager();
    if (!network_manager_->initialize())
    {
        Logger::warning("NetworkManager initialization failed - continuing without network");
        // don't fail hard
    }
    else
    {
        last_report_type_attempt_ms_ = millis();
        fetch_report_types_once();
    }

    initialized_ = true;
    Logger::info("System initialization complete!");
    return true;
}

void SystemManager::start_initialization()
{
    if (initialized_ || init_started_)
        return;

    Logger::init(SERIAL_BAUD);
    Logger::separator();
    Logger::printf("%s v%s\n", APP_NAME, APP_VERSION);
    Logger::separator();

    start_time_ms_ = millis();
    init_started_ = true;
    init_failed_ = false;
    init_error_.clear();
    init_phase_ = InitPhase::Preferences;

    Logger::println("Starting non-blocking system initialization...");
    // Create UI manager early so user code can register screens before UI init
    if (!ui_manager_)
    {
        ui_manager_ = new UIManager();
    }
}

bool SystemManager::is_initialization_started() const { return init_started_; }
bool SystemManager::is_initialization_complete() const { return initialized_; }
bool SystemManager::is_initialization_failed() const { return init_failed_; }
const char *SystemManager::get_initialization_error() const { return init_error_.c_str(); }

const char *SystemManager::get_initialization_phase_name() const
{
    switch (init_phase_)
    {
    case InitPhase::NotStarted:
        return "NotStarted";
    case InitPhase::Preferences:
        return "Preferences";
    case InitPhase::Display:
        return "Display";
    case InitPhase::Touch:
        return "Touch";
    case InitPhase::NFC:
        return "NFC";
    case InitPhase::UI:
        return "UI";
    case InitPhase::Network:
        return "Network";
    case InitPhase::Completed:
        return "Completed";
    }
    return "Unknown";
}

void SystemManager::shutdown()
{
    if (!initialized_)
    {
        return;
    }

    delete ui_manager_;
    delete touch_manager_;
    delete display_manager_;
    delete preferences_manager_;
    delete nfc_manager_;
    delete network_manager_;

    ui_manager_ = nullptr;
    touch_manager_ = nullptr;
    display_manager_ = nullptr;
    preferences_manager_ = nullptr;
    nfc_manager_ = nullptr;
    network_manager_ = nullptr;

    initialized_ = false;
}

void SystemManager::update()
{
    // (no serial-based admin handshake)
    // If we are doing iterative initialization, perform one step per update
    if (!initialized_ && init_started_ && !init_failed_)
    {
        switch (init_phase_)
        {
        case InitPhase::Preferences:
            Logger::println("Initializing preferences...");
            preferences_manager_ = new PreferencesManager();
            if (!preferences_manager_->initialize())
            {
                Logger::error("Failed to initialize preferences");
                init_failed_ = true;
                init_error_ = "Preferences initialization failed";
            }
            else
            {
                // for testing: clear registry and seed with two sample records
                ResidentRegistry::get_instance().clear_and_seed_with_sample();
                init_phase_ = InitPhase::Display;
            }
            break;

        case InitPhase::Display:
            Logger::println("Initializing display...");
            display_manager_ = new DisplayManager();
            if (!display_manager_->initialize())
            {
                Logger::error("Failed to initialize display");
                init_failed_ = true;
                init_error_ = "Display initialization failed";
            }
            else
            {
                init_phase_ = InitPhase::Touch;
            }
            break;

        case InitPhase::Touch:
            Logger::println("Initializing touch...");
            touch_manager_ = new TouchManager();
            if (!touch_manager_->initialize())
            {
                Logger::error("Failed to initialize touch");
                init_failed_ = true;
                init_error_ = "Touch initialization failed";
            }
            else
            {
                init_phase_ = InitPhase::NFC;
            }
            break;

        case InitPhase::NFC:
            Logger::println("Initializing NFC...");
            nfc_manager_ = new NfcManager();
            if (!nfc_manager_->initialize())
            {
                Logger::warning("NFC initialization failed - continuing without NFC");
                delete nfc_manager_;
                nfc_manager_ = nullptr;
            }
            init_phase_ = InitPhase::UI;
            break;

        case InitPhase::UI:
            Logger::println("Initializing UI...");
            if (!ui_manager_)
                ui_manager_ = new UIManager();
            if (!ui_manager_->initialize())
            {
                Logger::error("Failed to initialize UI");
                init_failed_ = true;
                init_error_ = "UI initialization failed";
            }
            else
            {
                // UIManager::initialize will inject manager pointers into previously registered screens
                init_phase_ = InitPhase::Network;
            }
            break;

        case InitPhase::Network:
            Logger::println("Initializing network...");
            network_manager_ = new NetworkManager();
            if (!network_manager_->initialize())
            {
                Logger::warning("NetworkManager initialization failed - continuing without network");
                // proceed, not fatal
            }
            else
            {
                last_report_type_attempt_ms_ = millis();
                fetch_report_types_once();
            }
            // finished initialization
            init_phase_ = InitPhase::Completed;
            initialized_ = true;
            Logger::info("System initialization complete (iterative)");
            break;

        default:
            break;
        }

        // run any partial updates for managers already initialized so UI can react
        if (touch_manager_)
            touch_manager_->update();
        if (network_manager_)
        {
            network_manager_->update();
            if (!report_types_loaded_)
            {
                unsigned long now = millis();
                if (now - last_report_type_attempt_ms_ >= REPORT_TYPES_RETRY_INTERVAL_MS)
                {
                    last_report_type_attempt_ms_ = now;
                    fetch_report_types_once();
                }
            }
        }
        if (nfc_manager_)
            nfc_manager_->update();

        // If UI manager is initialized then update it (this will call screen on_update)
        if (ui_manager_)
            ui_manager_->update();

        return;
    }

    if (!initialized_)
    {
        // Not yet initialized and no start requested, nothing to do
        return;
    }

    // Normal steady-state updates once initialized
    if (touch_manager_)
        touch_manager_->update();
    if (network_manager_)
    {
        network_manager_->update();
        if (!report_types_loaded_)
        {
            unsigned long now = millis();
            if (now - last_report_type_attempt_ms_ >= REPORT_TYPES_RETRY_INTERVAL_MS)
            {
                last_report_type_attempt_ms_ = now;
                fetch_report_types_once();
            }
        }
    }
    if (nfc_manager_)
        nfc_manager_->update();
    if (ui_manager_)
        ui_manager_->update();
}

DisplayManager *SystemManager::get_display_manager()
{
    return display_manager_;
}

TouchManager *SystemManager::get_touch_manager()
{
    return touch_manager_;
}

UIManager *SystemManager::get_ui_manager()
{
    return ui_manager_;
}

PreferencesManager *SystemManager::get_preferences_manager()
{
    return preferences_manager_;
}

NfcManager *SystemManager::get_nfc_manager()
{
    return nfc_manager_;
}

NetworkManager *SystemManager::get_network_manager()
{
    return network_manager_;
}

bool SystemManager::has_report_type_names() const
{
    return !report_type_names_.empty();
}

const std::vector<String> &SystemManager::get_report_type_names() const
{
    return report_type_names_;
}

const char *SystemManager::get_app_name() const
{
    return APP_NAME;
}

const char *SystemManager::get_app_version() const
{
    return APP_VERSION;
}

unsigned long SystemManager::get_uptime_ms() const
{
    return millis() - start_time_ms_;
}

void SystemManager::fetch_report_types_once()
{
    if (report_types_loaded_ || report_types_requested_ || !network_manager_)
    {
        return;
    }

    report_types_requested_ = true;

    String response;
    if (!network_manager_->fetch_report_types(response))
    {
        Logger::warning("SystemManager: failed to fetch report types");
        report_types_requested_ = false;
        return;
    }

    std::vector<String> parsed;
    if (!parse_report_type_names(response, parsed))
    {
        Logger::warning("SystemManager: unable to parse report types");
        report_types_requested_ = false;
        return;
    }

    report_type_names_ = parsed;
    report_types_loaded_ = true;
    report_types_requested_ = false;
    Logger::printf("SystemManager: loaded %d report types\n", static_cast<int>(report_type_names_.size()));
}

bool SystemManager::parse_report_type_names(const String &json, std::vector<String> &out_names)
{
    out_names.clear();
    if (json.length() == 0)
    {
        return false;
    }

    auto normalize_polish = [](const String &in) -> String
    {
        String out;
        out.reserve(in.length());
        const unsigned char *bytes = reinterpret_cast<const unsigned char *>(in.c_str());
        size_t len = in.length();
        size_t i = 0;
        while (i < len)
        {
            unsigned char b = bytes[i];
            if (b < 0x80)
            {
                out += (char)b;
                ++i;
                continue;
            }

            // handle two-byte UTF-8 sequences common for Polish characters
            if (i + 1 < len)
            {
                unsigned char b2 = bytes[i + 1];
                // C4 xx and C5 xx sequences hold most Polish diacritics
                if (b == 0xC4)
                {
                    switch (b2)
                    {
                    case 0x85:
                        out += 'a';
                        break; // ą
                    case 0x84:
                        out += 'A';
                        break; // Ą
                    case 0x87:
                        out += 'c';
                        break; // ć
                    case 0x86:
                        out += 'C';
                        break; // Ć
                    case 0x99:
                        out += 'e';
                        break; // ę
                    case 0x98:
                        out += 'E';
                        break; // Ę
                    case 0xB9:
                        out += 'Z';
                        break; // Ź
                    case 0xBA:
                        out += 'z';
                        break; // ź
                    default:
                        // unknown C4 sequence - skip
                        break;
                    }
                    i += 2;
                    continue;
                }

                if (b == 0xC5)
                {
                    switch (b2)
                    {
                    case 0x82:
                        out += 'l';
                        break; // ł
                    case 0x81:
                        out += 'L';
                        break; // Ł
                    case 0x84:
                        out += 'n';
                        break; // ń
                    case 0x83:
                        out += 'N';
                        break; // Ń
                    case 0x9B:
                        out += 's';
                        break; // ś
                    case 0x9A:
                        out += 'S';
                        break; // Ś
                    case 0xBB:
                        out += 'Z';
                        break; // Ż
                    case 0xBC:
                        out += 'z';
                        break; // ż
                    default:
                        // unknown C5 - skip
                        break;
                    }
                    i += 2;
                    continue;
                }

                if (b == 0xC3)
                {
                    // ó / Ó
                    if (b2 == 0xB3)
                        out += 'o';
                    else if (b2 == 0x93)
                        out += 'O';
                    i += 2;
                    continue;
                }
            }

            // Fallback: skip unknown multibyte sequence (consume one byte)
            ++i;
        }

        return out;
    };

    int search_pos = 0;
    while (true)
    {
        int name_pos = json.indexOf("\"name\"", search_pos);
        if (name_pos < 0)
        {
            break;
        }

        int colon_pos = json.indexOf(':', name_pos);
        if (colon_pos < 0)
        {
            break;
        }

        int value_start = json.indexOf('"', colon_pos + 1);
        if (value_start < 0)
        {
            break;
        }

        int value_end = value_start;
        bool found_end = false;
        while (!found_end)
        {
            value_end = json.indexOf('"', value_end + 1);
            if (value_end < 0)
            {
                break;
            }
            if (value_end == value_start + 1 || json.charAt(value_end - 1) != '\\')
            {
                found_end = true;
            }
        }

        if (!found_end)
        {
            break;
        }

        String raw = json.substring(value_start + 1, value_end);
        String normalized = normalize_polish(raw);
        // If normalization produced an empty string (very unlikely), fall back to raw
        out_names.push_back(normalized.length() ? normalized : raw);
        search_pos = value_end + 1;
    }

    return !out_names.empty();
}
