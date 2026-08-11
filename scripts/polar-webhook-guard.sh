#!/usr/bin/env bash
# Polar webhook guard — prevent the silent revenue-critical regression.
#
# The Godseye primary Polar webhook endpoint (Hermes, /api/polar-webhook,
# id 639653fe-e485-470d-8a5e-df0da929e0af) has been silently DISABLED twice
# (see polar-webhook-status.md). When disabled, paid checkouts never flip to
# "paid" and no license/credits are issued — a #1 revenue blocker.
#
# This guard lists the endpoints and re-enables the Godseye primary one if it
# has gone enabled:false. Logs every run so we can audit who/what toggled it.
#
# Intended to run via cron (e.g. every 6h). Safe to re-run; idempotent.
set -euo pipefail

REPO=/root/godseye-repo
LOG="${REPO}/logs/polar-webhook-guard.log"
TARGET_ID="639653fe-e485-470d-8a5e-df0da929e0af"
mkdir -p "$(dirname "$LOG")"

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
  echo "$(date -Is) OK: Godseye primary Polar webhook ${TARGET_ID} is enabled (order.created/order.paid path live)" | tee -a "$LOG"
  exit 0
fi

echo "$(date -Is) WARN: Godseye primary Polar webhook ${TARGET_ID} enabled=${ENABLED:-UNKNOWN} — RE-ENABLING" | tee -a "$LOG"

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
