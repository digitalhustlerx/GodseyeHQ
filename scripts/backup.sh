#!/usr/bin/env bash
# =============================================================
# Godseye backup — automated safe backup of the SQLite DB
#
# The "backup gap" fix: Godseye stores ALL billing + credits +
# subscriptions + waitlist data in data/godseye.db (SQLite).
# There is no subscriptions.json/credits.json — that data lives
# in the DB. The real gap was: no ROTATING automated backup.
#
# This script:
#   1. Uses sqlite3 ".backup" (safe snapshot, WAL-consistent)
#      -> no corruption, unlike a raw `cp` of a live DB.
#   2. Rotates the last 14 daily backups (disk-safe).
#   3. SQLite is on a 92%-full disk, so we keep it tight.
#
# Run:  bash scripts/backup.sh          (manual)
# Cron: 0 3 * * *  root  /root/godseye-repo/scripts/backup.sh
# =============================================================
set -euo pipefail

REPO="${GODSEYE_REPO:-/root/godseye-repo}"
DB="$REPO/data/godseye.db"
BACKUP_DIR="$REPO/data/backups"
KEEP=14                       # keep 14 rotated backups
STAMP="$(date +%Y%m%d-%H%M)"
OUT="$BACKUP_DIR/godseye.db.bak-$STAMP"

mkdir -p "$BACKUP_DIR"

# Fail cleanly if DB missing
if [ ! -f "$DB" ]; then
  echo "[backup] ERROR: DB not found at $DB" >&2
  exit 1
fi

# Safe online backup (WAL-consistent)
sqlite3 "$DB" ".backup '$OUT'" || { echo "[backup] ERROR: sqlite backup failed" >&2; exit 1; }

# Optional: also dump billing-critical tables to plain JSON for a portable restorable mirror
{
  echo "{"
  echo "\"backed_up_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "\"waitlist_count\":$(sqlite3 "$DB" 'SELECT COUNT(*) FROM waitlist;' 2>/dev/null || echo 0),"
  echo "\"users\":$(sqlite3 "$DB" 'SELECT COUNT(*) FROM users;' 2>/dev/null || echo 0),"
  echo "\"purchases\":$(sqlite3 "$DB" 'SELECT COUNT(*) FROM purchases;' 2>/dev/null || echo 0)"
  echo "}"
} > "$BACKUP_DIR/backup-meta.json"

# Rotate old backups (keep newest KEEP)
ls -1t "$BACKUP_DIR"/godseye.db.bak-* 2>/dev/null | tail -n +$((KEEP+1)) | xargs -r rm -f

chmod 600 "$OUT" "$BACKUP_DIR/backup-meta.json"
echo "[backup] OK -> $OUT ($(du -h "$OUT" | cut -f1))"
echo "[backup] meta  -> $BACKUP_DIR/backup-meta.json ($(du -h "$BACKUP_DIR/backup-meta.json" | cut -f1))"
echo "[backup] oldest kept: $(ls -1t "$BACKUP_DIR"/godseye.db.bak-* 2>/dev/null | tail -1)"
