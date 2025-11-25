#!/usr/bin/env python3
"""Ensure table 'konta' has the integer column 'genpoints'.

Usage:
  python scripts/add_genpoints_column.py path/to/users.db

A timestamped backup of the database will be created before altering the table.
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


def ensure_genpoints(conn: sqlite3.Connection) -> bool:
    if column_exists(conn, "konta", "genpoints"):
        print("Column 'genpoints' already present on 'konta' — nothing to do.")
        return False

    print("Adding column 'genpoints' to table 'konta' with default 0")
    conn.execute("ALTER TABLE konta ADD COLUMN genpoints INTEGER NOT NULL DEFAULT 0;")
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
        changed = ensure_genpoints(conn)
        if changed:
            print("Column added successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/add_genpoints_column.py path/to/db.sqlite")
        raise SystemExit(2)

    migrate(Path(sys.argv[1]))
