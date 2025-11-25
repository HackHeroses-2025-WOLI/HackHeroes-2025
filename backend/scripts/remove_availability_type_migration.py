#!/usr/bin/env python3
"""Migration helper: remove availability_type column and AvailabilityType table from a SQLite DB.

This script is intentionally simple and destructive: it recreates the `konta` table
without the `availability_type` column and drops the `typ_dostepnosci` table.

Usage (development):
  python scripts/remove_availability_type_migration.py path/to/users.db

It will create a timestamped backup before modifying the database.
"""
from __future__ import annotations

import shutil
import sqlite3
import sys
from datetime import datetime
from pathlib import Path


def backup(db_path: Path) -> Path:
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    backup_path = db_path.with_suffix(f".bak.{ts}")
    shutil.copy2(db_path, backup_path)
    return backup_path


def table_exists(conn: sqlite3.Connection, name: str) -> bool:
    cur = conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (name,))
    return cur.fetchone() is not None


def get_create_sql(conn: sqlite3.Connection, table: str) -> str | None:
    cur = conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (table,))
    row = cur.fetchone()
    return row[0] if row else None


def remove_availability_type_from_create_sql(sql: str) -> str:
    # crude but effective: remove the column definition mentioning availability_type
    import re

    # Match the column entry which may include constraints and commas.
    pattern = re.compile(r"\s*,?\s*availability_type\b[^,)]*(,)?", re.IGNORECASE)
    new_sql = re.sub(pattern, lambda m: "," if m.group(1) else "", sql)

    # Fix potential trailing commas before closing parenthesis
    new_sql = re.sub(r",\s*\)", ")", new_sql)

    return new_sql


def migrate(db_file: Path) -> None:
    if not db_file.exists():
        raise SystemExit(f"DB not found: {db_file}")

    print(f"Backing up DB: {db_file}")
    bak = backup(db_file)
    print(f"Backup created: {bak}")

    conn = sqlite3.connect(str(db_file))
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.cursor()

        if not table_exists(conn, "konta"):
            print("No table 'konta' found — nothing to do.")
            return

        create_sql = get_create_sql(conn, "konta")
        if not create_sql:
            raise RuntimeError("Could not read CREATE statement for konta")

        if "availability_type" not in create_sql:
            print("'availability_type' does not appear in the current 'konta' CREATE statement; no action needed")
            # still attempt to drop typ_dostepnosci if present
            if table_exists(conn, "typ_dostepnosci"):
                print("Dropping table 'typ_dostepnosci' (no longer used)")
                cur.execute("DROP TABLE IF EXISTS typ_dostepnosci")
                conn.commit()
            return

        # Build new CREATE TABLE SQL from PRAGMA metadata to avoid fragile
        # string manipulation of the original CREATE statement.
        print("Building new CREATE TABLE statement using PRAGMA table_info...")
        cols_info = list(conn.execute("PRAGMA table_info('konta')"))
        if not cols_info:
            raise RuntimeError("PRAGMA table_info('konta') returned no columns")

        # Collect columns excluding availability_type
        new_cols_defs = []
        copy_cols = []
        pk_cols = []
        for col in cols_info:
            cid, name, ctype, notnull, dflt_value, pk = col
            if name == "availability_type":
                continue
            # construct column definition
            part = f"{name} {ctype or 'TEXT'}"
            if notnull:
                part += " NOT NULL"
            if dflt_value is not None:
                part += f" DEFAULT {dflt_value}"
            # if single-column primary key, attach PK here; otherwise list later
            if pk and pk == 1:
                part += " PRIMARY KEY"
            if pk:
                pk_cols.append((pk, name))
            new_cols_defs.append(part)
            copy_cols.append(name)

        # If there are multi-column primary key entries (pk values >1), create table-level PK
        table_constraints = []
        multi_pk = [n for pos,n in sorted(pk_cols) if len(pk_cols) > 1]
        if multi_pk:
            table_constraints.append(f"PRIMARY KEY ({', '.join(multi_pk)})")

        # Recreate foreign keys but skip any FK referencing availability_type
        fk_rows = list(conn.execute("PRAGMA foreign_key_list('konta')"))
        for fk in fk_rows:
            id_, seq, table_ref, from_col, to_col, on_update, on_delete, match = fk
            if from_col == "availability_type":
                continue
            fk_sql = f"FOREIGN KEY({from_col}) REFERENCES {table_ref}({to_col})"
            if on_delete:
                fk_sql += f" ON DELETE {on_delete}"
            table_constraints.append(fk_sql)

        new_table_sql = "CREATE TABLE konta_new (\n    " + ",\n    ".join(new_cols_defs + table_constraints) + "\n)"

        print("Creating new table without 'availability_type'...")
        conn.execute("PRAGMA foreign_keys=OFF")
        conn.execute(new_table_sql)

        # copy columns except availability_type
        col_list = ",".join(copy_cols)
        copy_sql = f"INSERT INTO konta_new ({col_list}) SELECT {col_list} FROM konta"
        print("Copying data (excluding availability_type)")
        conn.execute(copy_sql)

        print("Dropping old table and renaming new table")
        conn.execute("DROP TABLE konta")
        conn.execute("ALTER TABLE konta_new RENAME TO konta")

        # drop the availability type table (typ_dostepnosci) if it exists
        if table_exists(conn, "typ_dostepnosci"):
            print("Dropping table typ_dostepnosci")
            conn.execute("DROP TABLE IF EXISTS typ_dostepnosci")

        conn.execute("PRAGMA foreign_keys=ON")
        conn.commit()
        print("Migration finished successfully — 'availability_type' removed.")

    finally:
        conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/remove_availability_type_migration.py path/to/db.sqlite")
        raise SystemExit(2)

    db_path = Path(sys.argv[1])
    migrate(db_path)
