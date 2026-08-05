#!/bin/bash
# Godseye production deploy: build SPA, then restore static SEO/organic assets
# that vite build would otherwise wipe from dist/.
set -e
cd /root/godseye-repo

echo "[1/5] Building SPA (dist recreated)..."
npm run build 2>&1 | tail -8

echo "[2/5] Rebuilding plugin zip into dist/ (pay-before-download payload)..."
(cd wp-plugin && rm -f /root/godseye-repo/dist/godseye-plugin.zip \
  && zip -r -q /root/godseye-repo/dist/godseye-plugin.zip godseye-bridge/ -x '*.git*')

echo "[3/5] Restoring static SEO + organic asset tree into dist/..."
# token visualisation
cp /root/godseye-repo/seo-assets/token-wrapped.png        dist/token-wrapped.png
cp /root/godseye-repo/seo-assets/token-visualization.html dist/token-visualization.html
# proof docs (from labs/main)
git show labs/main:docs/GODSEYE-INSIGHT-REPORT.md > dist/Godseye-Insight-Report.md 2>/dev/null || true
git show labs/main:docs/GODSEYE-TIER-MATRIX.md    > dist/Godseye-Tier-Matrix.md    2>/dev/null || true
git show labs/main:docs/GODSEYE-CASE-STUDY.md     > dist/Godseye-Case-Study.md     2>/dev/null || true
# SEO fundamentals
cp /root/godseye-repo/seo-assets/robots.txt   dist/robots.txt
cp /root/godseye-repo/seo-assets/sitemap.xml  dist/sitemap.xml
# blog tree
mkdir -p dist/blog
cp -r /root/godseye-repo/seo-assets/blog/*    dist/blog/

echo "[4/5] Normalizing permissions (644 files / 755 dirs)..."
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;

echo "[5/5] Restarting backend service (godseye-landing-api)..."
systemctl restart godseye-landing-api
sleep 2
systemctl is-active godseye-landing-api || { echo "backend restart FAILED"; exit 1; }

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
