#!/usr/bin/env bash
# Daily compressed Postgres backup with 14 days of history.
# Edit CONTAINER / DB / DB_USER below, copy to the database VM and run it from cron (see postgres-harden.md).
set -euo pipefail

CONTAINER="${CONTAINER:-pg}"
DB="${DB:-postgres}"
DB_USER="${DB_USER:-postgres}"
DIR="${BACKUP_DIR:-$HOME/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$DIR/${DB}-${STAMP}.sql.gz"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" --no-owner --format=plain "$DB" | gzip -9 > "$OUT.partial"
# A dump that is suspiciously small means something failed: keep the previous good ones, do not rotate.
if [ "$(stat -c %s "$OUT.partial")" -lt 1024 ]; then
  echo "$(date -u) backup too small, not keeping it" >&2
  rm -f "$OUT.partial"
  exit 1
fi
mv "$OUT.partial" "$OUT"
find "$DIR" -name "${DB}-*.sql.gz" -mtime "+$KEEP_DAYS" -delete
echo "$(date -u) wrote $OUT ($(du -h "$OUT" | cut -f1))"
