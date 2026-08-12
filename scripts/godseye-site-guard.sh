#!/usr/bin/env bash
# Godseye Site Guard — consolidated health check. Silent when healthy.
# Replaces: canonical site health checker + godseye-opensaas-watcher.
# Runs via cron every 10m (no_agent).
set -uo pipefail

ALERT=""
ROOT_URL="https://godseye.digitalhustlerx.com/"

# 1. Canonical root serves multi-hero dist/index.html (not waitlist).
if ! curl -fsSL "$ROOT_URL" | grep -qi "GodsEye"; then
  ALERT="$ALERT\n[ROOT] Canonical landing page not serving GodsEye content at $ROOT_URL"
fi

# 2. Backend API responsive.
if ! curl -fsS -o /dev/null -w '' "https://api.godseyes.digitalhustlerx.com/api/waitlist/stats" 2>/dev/null && ! curl -fsS -o /dev/null "http://127.0.0.1:3000/api/waitlist/stats"; then
  ALERT="$ALERT\n[API] Backend (127.0.0.1:3000 / api.godseyes...) not responding"
fi

# 3. OpenSaaS backend (port 3101).
if ! curl -fsS -o /dev/null "http://127.0.0.1:3101/"; then
  ALERT="$ALERT\n[OPENSAAS] Backend not responding on :3101"
fi

# 4. Nginx serving /agents/setup funnel.
if ! curl -fsS -o /dev/null "https://godseye.digitalhustlerx.com/agents/setup/"; then
  ALERT="$ALERT\n[FUNNEL] /agents/setup/ not serving"
fi

# 5. Polar webhook guard is running (crontab entry).
if ! crontab -l 2>/dev/null | grep -q "polar-webhook-guard.sh"; then
  ALERT="$ALERT\n[POLAR] polar-webhook-guard.sh no longer in crontab"
fi

if [ -n "$ALERT" ]; then
  echo -e "Godseye Site Guard ALERTS:${ALERT}"
fi
# Empty stdout = silent (healthy).
