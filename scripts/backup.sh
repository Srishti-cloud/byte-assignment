#!/bin/bash
set -euo pipefail

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/tmp/byte-backups}"
mkdir -p "$BACKUP_DIR"

# Example: RDS snapshot or PostgreSQL dump
# Replace with your real backup command in a production environment.
pg_dump "${DATABASE_URL}" > "$BACKUP_DIR/byteapp-$DATE.sql"

echo "Backup created at $BACKUP_DIR/byteapp-$DATE.sql"
