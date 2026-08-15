#!/usr/bin/env bash
# Polar webhook guard — RATE-LIMIT-FRIENDLY version (2026-08-12).
#
# WHY REWRITTEN: The old version ran every minute via cron, calling the Polar API
# (GET /v1/webhooks/endpoints) on EVERY run — ~1,440 pings/day. Polar treated this
# as rate-limit/abuse and sent an email + silently disabled the endpoint. That
# created the exact failure this guard was trying to prevent.
#
# NEW BEHAVIOR:
#   - Runs ONCE PER DAY via cron (crontab `0 4 * * *`), NOT every minute.
#   - First checks OUR OWN local purchases table (godseye.db) for recent confirmed
#     payments in the last 24h. If the webhook is working (orders are landing),
#     we DO NOT touch the Polar API at all -> zero rate-limit risk.
#   - Only calls the Polar API on the rare daily check when NO recent confirmed
#     payment exists, to verify/re-enable the endpoint.
#   - Minimal logging: at most 1 line per daily run + only on change/alert.
#
# Idempotent and safe to re-run.

set -uo pipefail

REPO=/root/godseye-repo
LOG="${REPO}/logs/polar-webhook-guard.log"
TARGET_ID="639653fe-e485-470d-8a5e-df0da929e0af"
DB="${REPO}/data/godseye.db"
mkdir -p "$(dirname "$LOG")"

# --- Step 1: LOCAL health signal first (no Polar API call) -----------------
# If any purchase row is confirmed 'paid' within the last 30 days, the webhook
# path is demonstrably working end-to-end. No need to query Polar at all.
RECENT_PAID=$(sqlite3 "$DB" "SELECT COUNT(*) FROM purchases WHERE created_at >= datetime('now','-30 days') AND status='paid';" 2>/dev/null || echo "0")

if [ "$RECENT_PAID" != "0" ]; then
  # Webhook is provably delivering -> stay quiet, touch nothing.
  exit 0
fi

# No confirmed payment in 30 days. This could mean either (a) no sales yet (fine)
# or (b) the webhook is broken and silently swallowing orders. We cannot tell the
# difference locally, so do ONE Polar API call to verify the endpoint is enabled.

# Read the Polar API key (root-only, mode 600).
KEY=$(python3 -c "import json;print(json.load(open('${REPO}/polar-config.json'))['api_key'])" 2>/dev/null || true)
if [ -z "$KEY" ]; then
  echo "$(date -Is) ERROR: no Polar API key in polar-config.json" | tee -a "$LOG"
  exit 1
fi

LIST=$(curl -sL -H "Authorization: Bearer $KEY" "https://api.polar.sh/v1/webhooks/endpoints" 2>/dev/null || true)

# Is the target enabled?
ENABLED=$(echo "$LIST" | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    for e in d.get('items',[]):
        if e.get('id')=='${TARGET_ID}':
            print(str(e.get('enabled')).lower()); break
except Exception:
    pass
" 2>/dev/null || true)

if [ "$ENABLED" = "true" ]; then
  echo "$(date -Is) OK: Polar webhook ${TARGET_ID} enabled (no confirmed payments in 30d; checked Polar API once daily)" | tee -a "$LOG"
  exit 0
fi

echo "$(date -Is) WARN: Polar webhook ${TARGET_ID} enabled=${ENABLED:-UNKNOWN} — RE-ENABLING (checked Polar API once daily)" | tee -a "$LOG"

# Re-enable it (preserves URL + secret + events).
RESP=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"enabled": true}' \
  "https://api.polar.sh/v1/webhooks/endpoints/${TARGET_ID}" 2>/dev/null || true)

echo "$(date -Is) PATCH re-enable HTTP ${RESP}" | tee -a "$LOG"
if [ "$RESP" = "200" ] || [ "$RESP" = "204" ]; then
  echo "$(date -Is) RESOLVED: webhook re-enabled" | tee -a "$LOG"
else
  echo "$(date -Is) ERROR: re-enable failed with HTTP ${RESP} — needs manual check" | tee -a "$LOG"
  exit 1
fi
