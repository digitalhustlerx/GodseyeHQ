#!/usr/bin/env bash
# Wire the Polar webhook secret into the Godseye API and restart it.
# Usage:  ./scripts/wire-polar-webhook.sh '<YOUR_POLAR_WEBHOOK_SECRET>'
set -euo pipefail

SECRET="${1:-}"
if [ -z "$SECRET" ] || [[ "$SECRET" == *$'\n'* || "$SECRET" == *$'\r'* ]]; then
  echo "ERROR: provide a non-empty, single-line Polar webhook secret as arg 1:"
  echo "  ./scripts/wire-polar-webhook.sh '<secret>'"
  exit 1
fi

REPO=/root/godseye-repo
ENVFILE="$REPO/.env"

# Set the secret in .env without shell/sed interpolation surprises.
SECRET="$SECRET" ENVFILE="$ENVFILE" python3 - <<'PY'
from pathlib import Path
import os

path = Path(os.environ["ENVFILE"])
secret = os.environ["SECRET"]
text = path.read_text() if path.exists() else ""
lines = text.splitlines()
replacement = f"POLAR_WEBHOOK_SECRET={secret}"
found = False
out = []
for line in lines:
    if line.startswith("POLAR_WEBHOOK_SECRET="):
        if not found:
            out.append(replacement)
            found = True
    else:
        out.append(line)
if not found:
    out.extend(["", replacement])
path.write_text("\n".join(out) + "\n")
PY
echo "secret written to $ENVFILE"

# Restart API so it picks up the env var
systemctl restart godseye-landing-api
sleep 2
systemctl is-active godseye-landing-api

echo "VERIFY (should be 200):"
curl -s -o /dev/null -w "stats: %{http_code}\n" https://api.godseyes.digitalhustlerx.com/api/waitlist/stats
echo "DONE — payments will now auto-fulfill. Post to Polar: URL=https://api.godseyes.digitalhustlerx.com/api/polar-webhook, events = checkout.completed + order.created"
