#!/usr/bin/env python3
"""Ensure table 'zgloszenia' has the datetime column 'accepted_at'.

Usage:
  python scripts/add_accepted_at_column.py path/to/users.db

Creates a timestamped backup before applying the schema change.
"""

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


def ensure_accepted_at(conn: sqlite3.Connection) -> bool:
    if column_exists(conn, "zgloszenia", "accepted_at"):
        print("Column 'accepted_at' already present on 'zgloszenia' — nothing to do.")
        return False

    print("Adding column 'accepted_at' to table 'zgloszenia' (nullable DATETIME)")
    conn.execute("ALTER TABLE zgloszenia ADD COLUMN accepted_at DATETIME;")
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
        changed = ensure_accepted_at(conn)
        if changed:
            print("Column added successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/add_accepted_at_column.py path/to/db.sqlite")
        raise SystemExit(2)

    migrate(Path(sys.argv[1]))
