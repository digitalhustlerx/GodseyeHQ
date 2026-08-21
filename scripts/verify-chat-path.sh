#!/usr/bin/env bash
# Completion-agent live verification: chat path through the real backend.
set -u

ENVFILE="${1:-/etc/godseye/telegram.env}"
API_URL=$(grep -oP '(?<=^GODSEYE_API_BASE_URL=).*' "$ENVFILE" | tr -d '"' | tr -d "'")
KEY=$(grep -oP '(?<=^GODSEYE_BOT_INTERNAL_KEY=).*' "$ENVFILE" | tr -d '"' | tr -d "'")
TESTID="completion-$(date +%s)"

echo "API_URL=$API_URL"
echo "TESTID=$TESTID"

if [ -z "$API_URL" ] || [ -z "$KEY" ]; then
  echo "FAIL: missing GODSEYE_API_BASE_URL or GODSEYE_BOT_INTERNAL_KEY in $ENVFILE"
  exit 1
fi

echo "--- chat POST ---"
curl -s -m 60 -X POST "${API_URL%/}/api/chat" \
  -H "x-godseye-bot-key: $KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"telegramId\":\"$TESTID\",\"messages\":[{\"role\":\"user\",\"content\":\"Reply with exactly: CHAT_OK\"}]}" \
  -o /tmp/chat_out.txt -w 'http:%{http_code} time:%{time_total}s\n'
echo "--- response head ---"
head -c 1200 /tmp/chat_out.txt
echo ""
echo "--- response tail ---"
tail -c 400 /tmp/chat_out.txt
echo ""
echo "DONE"