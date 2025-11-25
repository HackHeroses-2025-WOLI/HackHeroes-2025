#!/usr/bin/env python3
"""Ensure table 'zgloszenia' has completed_at and completed_by_email columns.

Usage:
  python scripts/add_completed_columns.py path/to/users.db

Creates a timestamped backup before applying the schema changes.
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


def ensure_completed_columns(conn: sqlite3.Connection) -> bool:
    changed = False
    if not column_exists(conn, "zgloszenia", "completed_at"):
        print("Adding column 'completed_at' to table 'zgloszenia'")
        conn.execute("ALTER TABLE zgloszenia ADD COLUMN completed_at DATETIME;")
        changed = True
    else:
        print("Column 'completed_at' already present.")

    if not column_exists(conn, "zgloszenia", "completed_by_email"):
        print("Adding column 'completed_by_email' to table 'zgloszenia'")
        conn.execute("ALTER TABLE zgloszenia ADD COLUMN completed_by_email VARCHAR;")
        changed = True
    else:
        print("Column 'completed_by_email' already present.")

    if changed:
        conn.commit()
    return changed


def migrate(db_path: Path) -> None:
    if not db_path.exists():
        raise SystemExit(f"DB not found: {db_path}")

    print(f"Backing up DB: {db_path}")
    bak = backup(db_path)
    print(f"Backup created: {bak}")

    conn = sqlite3.connect(str(db_path))
    try:
        changed = ensure_completed_columns(conn)
        if changed:
            print("Columns added successfully.")
        else:
            print("No changes needed.")
    finally:
        conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/add_completed_columns.py path/to/db.sqlite")
        raise SystemExit(2)

    migrate(Path(sys.argv[1]))
