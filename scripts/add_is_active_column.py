#!/usr/bin/env python3
"""Migration helper: ensure the konta table has the is_active column.

Usage:
  python scripts/add_is_active_column.py path/to/users.db

A timestamped backup of the database will be created before applying the ALTER.
"""
from __future__ import annotations

import shutil
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path


def backup(db_path: Path) -> Path:
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_path = db_path.with_suffix(f".bak.{ts}")
    shutil.copy2(db_path, backup_path)
    return backup_path


def column_exists(conn: sqlite3.Connection, table: str, column: str) -> bool:
    cur = conn.execute(f"PRAGMA table_info('{table}')")
    return any(row[1] == column for row in cur.fetchall())


def ensure_is_active(conn: sqlite3.Connection) -> bool:
    if column_exists(conn, "konta", "is_active"):
        print("Column 'is_active' already present on 'konta' — nothing to do.")
        return False

    print("Adding column 'is_active' to table 'konta' with default FALSE")
    conn.execute("ALTER TABLE konta ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 0;")
    conn.commit()
    return True


def migrate(db_path: Path) -> None:
    if not db_path.exists():
        raise SystemExit(f"DB not found: {db_path}")

    print(f"Backing up DB: {db_path}")
    bak = backup(db_path)
    print(f"Backup created: {bak}")

    conn = sqlite3.connect(str(db_path))
    try:
        changed = ensure_is_active(conn)
        if changed:
            print("Column added successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/add_is_active_column.py path/to/db.sqlite")
        raise SystemExit(2)

    migrate(Path(sys.argv[1]))
