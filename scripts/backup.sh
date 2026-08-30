#!/bin/bash
set -euo pipefail

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/tmp/byte-backups}"
S3_BACKUP_URI="${S3_BACKUP_URI:-}"
mkdir -p "$BACKUP_DIR"

pg_dump --format=custom --file="$BACKUP_DIR/byteapp-$DATE.dump" "${DATABASE_URL}"

if [[ -n "$S3_BACKUP_URI" ]]; then
	aws s3 cp "$BACKUP_DIR/byteapp-$DATE.dump" "$S3_BACKUP_URI/byteapp-$DATE.dump" --sse AES256
fi

echo "Backup created at $BACKUP_DIR/byteapp-$DATE.dump"
