#!/usr/bin/env python3
"""Create a consistent local SQLite backup for the OVH whole-server backup."""

from __future__ import annotations

import os
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path


DATABASE_PATH = Path(
    os.environ.get(
        "REGISTRATION_STORE_DB_PATH",
        "/var/lib/gpformation-registration-store/registrations.sqlite3",
    )
)
BACKUP_DIRECTORY = DATABASE_PATH.parent / "backups"
RETENTION_DAYS = 14


def main() -> None:
    if not DATABASE_PATH.exists():
        return

    BACKUP_DIRECTORY.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    temporary_path = BACKUP_DIRECTORY / f"registrations-{timestamp}.sqlite3.tmp"
    backup_path = BACKUP_DIRECTORY / f"registrations-{timestamp}.sqlite3"

    with sqlite3.connect(DATABASE_PATH) as source:
        with sqlite3.connect(temporary_path) as destination:
            source.backup(destination)

    temporary_path.chmod(0o600)
    temporary_path.replace(backup_path)

    cutoff = time.time() - RETENTION_DAYS * 24 * 60 * 60
    for candidate in BACKUP_DIRECTORY.glob("registrations-*.sqlite3"):
        if candidate.stat().st_mtime < cutoff:
            candidate.unlink()


if __name__ == "__main__":
    main()
