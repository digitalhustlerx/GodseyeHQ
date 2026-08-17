#!/usr/bin/env bash
# Polar webhook guard — RATE-LIMIT-FRIENDLY + NO-BLIND-SPOT version (2026-08-17).
#
# HISTORY:
#   2026-08-12 v1: ran every minute, called Polar API every run (~1,440/day).
#                 Polar rate-limited/abused it and disabled the endpoint.
#   2026-08-17 v2: every-3h cron. Bug: short-circuited (exit 0) when local DB
#                 had ANY 'paid' row in last 30 days -> if Polar externally
#                 disabled the webhook during a sales window, the guard never
#                 checked and orders were silently swallowed (strikes #10-#12).
#   2026-08-17 v3 (this): ALWAYS does ONE Polar API GET per run (max 8/day —
#                 negligible versus the 1,440/day that caused the original
#                 ban). Local paid-row count no longer skips the check; it only
#                 escalates the WARN severity (missed orders possible).
#
# Idempotent and safe to re-run.

set -uo pipefail

REPO=/root/godseye-repo
LOG="${REPO}/logs/polar-webhook-guard.log"
TMP="${REPO}/logs/.polar-endpoints.json"
TARGET_ID="639653fe-e485-470d-8a5e-df0da929e0af"
DB="${REPO}/data/godseye.db"
mkdir -p "$(dirname "$LOG")"

# --- Step 1: LOCAL health signal (no API call) -----------------------------
# Confirmed-paid rows in last 30 days. Used ONLY to warn loudly if the webhook
# is found disabled during an active sales window — never to skip the check.
RECENT_PAID=$(sqlite3 "$DB" "SELECT COUNT(*) FROM purchases WHERE created_at >= datetime('now','-30 days') AND status='paid';" 2>/dev/null || echo "0")
PAID_24H=$(sqlite3 "$DB" "SELECT COUNT(*) FROM purchases WHERE created_at >= datetime('now','-1 day') AND status='paid';" 2>/dev/null || echo "0")
SEV=""
if [ "$RECENT_PAID" != "0" ]; then
  SEV=" [CAUTION: ${RECENT_PAID} paid orders in last 30d (${PAID_24H} in 24h) — disabled webhook = missed-order risk]"
fi

# --- Step 2: ONE Polar API GET per run — ALWAYS. ----------------------------
# v3 fix: the old version skipped this whenever RECENT_PAID>0, which let an
# externally disabled webhook go unnoticed for up to 30 days.
KEY=$(python3 -c "import json;print(json.load(open('${REPO}/polar-config.json'))['api_key'])" 2>/dev/null || true)
if [ -z "$KEY" ]; then
  echo "$(date -Is) ERROR: no Polar API key in polar-config.json" | tee -a "$LOG"
  exit 1
fi

curl -sL -H "Authorization: Bearer $KEY" "https://api.polar.sh/v1/webhooks/endpoints" -o "$TMP" 2>/dev/null || true
ENABLED=$(python3 - "$TMP" "$TARGET_ID" <<'PYEOF'
import json,sys
try:
    d=json.load(open(sys.argv[1]))
    for e in d.get('items',[]):
        if e.get('id')==sys.argv[2]:
            print(str(e.get('enabled')).lower()); break
except Exception:
    pass
PYEOF
)

if [ "$ENABLED" = "true" ]; then
  echo "$(date -Is) OK: webhook ${TARGET_ID} enabled (recent_paid_30d=${RECENT_PAID})" | tee -a "$LOG"
  exit 0
fi

echo "$(date -Is) WARN: webhook ${TARGET_ID} enabled=${ENABLED:-UNKNOWN} — RE-ENABLING${SEV}" | tee -a "$LOG"

# --- Step 3: re-enable + verify (preserves URL + secret + events) -----------
RESP=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"enabled": true}' \
  "https://api.polar.sh/v1/webhooks/endpoints/${TARGET_ID}" 2>/dev/null || true)

echo "$(date -Is) PATCH re-enable HTTP ${RESP}" | tee -a "$LOG"
if [ "$RESP" != "200" ] && [ "$RESP" != "204" ]; then
  echo "$(date -Is) ERROR: re-enable failed HTTP ${RESP} — needs manual check" | tee -a "$LOG"
  exit 1
fi

# Verify the patch actually took (defense against silent no-op).
curl -sL -H "Authorization: Bearer $KEY" "https://api.polar.sh/v1/webhooks/endpoints" -o "$TMP" 2>/dev/null || true
NOW_ENABLED=$(python3 - "$TMP" "$TARGET_ID" <<'PYEOF'
import json,sys
try:
    d=json.load(open(sys.argv[1]))
    for e in d.get('items',[]):
        if e.get('id')==sys.argv[2]:
            print(str(e.get('enabled')).lower()); break
except Exception:
    pass
PYEOF
)

if [ "$NOW_ENABLED" = "true" ]; then
  echo "$(date -Is) RESOLVED: webhook re-enabled and verified${SEV}" | tee -a "$LOG"
  exit 0
else
  echo "$(date -Is) ERROR: webhook still enabled=${NOW_ENABLED:-UNKNOWN} after PATCH 200 — manual check" | tee -a "$LOG"
  exit 1
fi
