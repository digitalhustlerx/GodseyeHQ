#!/bin/bash
# Godseye production deploy: build SPA, then restore static SEO/organic assets
# that vite build would otherwise wipe from dist/.
set -e
cd /root/godseye-repo

echo "[1/3] Building SPA (dist recreated, SEO tree auto-restored)..."
npm run build 2>&1 | tail -8
# NOTE: `npm run build` ends with scripts/restore-seo-assets.sh, which rebuilds
# the plugin zip AND restores the full waitlist/blog/SEO tree + normalizes perms
# (no wipe hazard). The call below is explicit + idempotent for safety/visibility.
echo "[2/3] Restoring SEO + organic asset tree (idempotent)..."
bash ./scripts/restore-seo-assets.sh

echo "[3/3] Restarting backend service (godseye-landing-api)..."
systemctl restart godseye-landing-api
sleep 2
systemctl is-active godseye-landing-api || { echo "backend restart FAILED"; exit 1; }

# The root domain is the canonical multi-hero public site. Fail closed if the
# deployed root is not the built SPA or if its key markers are missing.
live_hash=$(curl -fsSL https://godseye.digitalhustlerx.com/ | sha256sum | cut -d' ' -f1)
local_hash=$(sha256sum dist/index.html | cut -d' ' -f1)
if [ "$live_hash" != "$local_hash" ]; then
  echo "ROOT DOMAIN DRIFT: live root does not match dist/index.html" >&2
  exit 1
fi
if ! grep -q "GodsEye — AI Agents for Your Business" dist/index.html; then
  echo "CANONICAL ROOT CHECK FAILED: multi-hero title missing from dist/index.html" >&2
  exit 1
fi
if ! grep -q "Previous slide\|Next slide" dist/index.html; then
  echo "CANONICAL ROOT CHECK FAILED: hero slider markers missing from dist/index.html" >&2
  exit 1
fi

echo "Verifying key URLs..."
for u in "" "robots.txt" "sitemap.xml" "token-wrapped.png" "token-visualization.html" \
         "godseye-plugin.zip" "api/purchase/status?tx_ref=none" \
         "blog/" "blog/autopilot-wordpress/" "blog/manage-wordpress-from-telegram/" \
         "blog/wordpress-site-health-checklist/"; do
  printf "  /%-42s -> %s  %sB  %s\n" "$u" \
    "$(curl -s -o /dev/null -w '%{http_code}' "https://godseye.digitalhustlerx.com/$u")" \
    "$(curl -s -o /dev/null -w '%{size_download}' "https://godseye.digitalhustlerx.com/$u")" \
    "$(curl -s -o /dev/null -w '%{content_type}' "https://godseye.digitalhustlerx.com/$u")"
done
echo "DEPLOY OK"
