#include "data/resident_registry.h"
ResidentRegistry &ResidentRegistry::get_instance()
{
    static ResidentRegistry instance;
    return instance;
}

#include "core/logger.h"
#include <string.h>

// Simple in-memory resident registry. We keep a fixed-size table (MAX_RECORDS)
// which is populated with a couple of sample entries — edit this file to add
// or change users.

// Built-in, editable list of resident records. Keep entries here if you want
// to define residents at compile time — up to MAX_RECORDS entries are allowed.
// Edit or add entries directly below.
static const ResidentRecord BUILTIN_RESIDENTS[] = {
    // uid (4 bytes), name, phone (max 9 digits), apt, active
    {{0x04, 0xA1, 0xB2, 0xC3}, "Jan Kowalski", "600000001", 12, true},
    {{0x04, 0xDE, 0xAD, 0xBE}, "Anna Nowak", "600000002", 34, true},
};

ResidentRegistry::ResidentRegistry()
{
    // Start with all slots cleared
    memset(records_, 0, sizeof(records_));
    // Populate runtime table from the BUILTIN_RESIDENTS table above.
    seed_defaults();
}

bool ResidentRegistry::add_record(const ResidentRecord &record)
{
    for (size_t i = 0; i < MAX_RECORDS; ++i)
    {
        if (!records_[i].active)
        {
            records_[i] = record;
            records_[i].active = true;
            return true;
        }
    }
    return false;
}

const ResidentRecord *ResidentRegistry::find_by_uid(const uint8_t *uid) const
{
    if (!uid)
    {
        return nullptr;
    }

    for (size_t i = 0; i < MAX_RECORDS; ++i)
    {
        const ResidentRecord &rec = records_[i];
        if (!rec.active)
        {
            continue;
        }
        // Compare only the fixed 4-byte UID
        if (memcmp(rec.nfc_uid, uid, 4) == 0)
        {
            return &rec;
        }
    }
    return nullptr;
}

void ResidentRegistry::seed_defaults()
{
    // Copy from the compile-time table so people can edit the list in one place
    Logger::info("ResidentRegistry: seeding built-in sample records from table");
    size_t num = sizeof(BUILTIN_RESIDENTS) / sizeof(BUILTIN_RESIDENTS[0]);
    for (size_t i = 0; i < num && i < MAX_RECORDS; ++i)
    {
        records_[i] = BUILTIN_RESIDENTS[i];
    }
}

void ResidentRegistry::clear_slot(size_t index)
{
    if (index >= MAX_RECORDS)
    {
        return;
    }
    memset(&records_[index], 0, sizeof(ResidentRecord));
}

void ResidentRegistry::clear_and_seed_with_sample()
{
    Logger::info("ResidentRegistry: clearing runtime registry and re-seeding built-in samples");

    // Clear everything
    for (size_t i = 0; i < MAX_RECORDS; ++i)
    {
        clear_slot(i);
    }

    seed_defaults();
}
