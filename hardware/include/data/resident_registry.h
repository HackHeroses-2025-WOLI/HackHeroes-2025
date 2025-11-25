#pragma once

#include <Arduino.h>
// Registry is a simple in-memory table; no persistent storage required

struct ResidentRecord
{
    // 4-byte UID is fixed for all records
    uint8_t nfc_uid[4];
    char imie_nazwisko[30];
    char nr_telefonu[10];
    uint16_t nr_mieszkania;
    bool active;
};

/**
 * @brief In-memory resident registry
 *
 * This registry stores up to MAX_RECORDS entries in RAM. Entries are
 * pre-populated from a compile-time table in the implementation file.
 * There is no persistent storage backing this registry.
 */
class ResidentRegistry
{
public:
    /**
     * @brief Get the singleton instance of the ResidentRegistry
     * @return reference to the global ResidentRegistry
     */
    static ResidentRegistry &get_instance();

    /**
     * @brief Add a resident record to the first available slot
     * @param record ResidentRecord to add (copied into the table)
     * @return true if the record was added, false if the registry is full
     */
    bool add_record(const ResidentRecord &record);
    // Lookup using a 4-byte UID buffer. The registry assumes UIDs are 4 bytes.
    /**
     * @brief Lookup a resident record by 4-byte UID
     * @param uid Pointer to 4-byte UID buffer
     * @return pointer to ResidentRecord when found, nullptr otherwise
     */
    const ResidentRecord *find_by_uid(const uint8_t *uid) const;

    // For convenience: clear the in-memory table and replace with the
    // built-in sample entries. This does not persist anywhere and only
    // affects runtime memory.
    /**
     * @brief Clear the runtime registry and populate it with built-in samples
     *
     * Useful for development or factory-reset scenarios. This only affects
     * the in-memory table and does not persist.
     */
    void clear_and_seed_with_sample();

private:
    /**
     * @brief Construct a ResidentRegistry and seed the runtime table
     */
    ResidentRegistry();
    /** @brief Populate the runtime table from the built-in compile-time list */
    void seed_defaults();

    /** @brief Clear a single slot in the runtime table */
    void clear_slot(size_t index);

    static constexpr size_t MAX_RECORDS = 100;
    ResidentRecord records_[MAX_RECORDS];
    // no persistent storage — runtime-only table
};
