#!/bin/bash
# restore-seo-assets.sh
# Restore the static SEO / organic asset tree into dist/ after a vite build.
#
# WHY THIS EXISTS:
# `vite build` (step 1 of `npm run build`) RECREATES dist/ from scratch and would
# otherwise WIPE dist/waitlist.html + robots.txt + sitemap.xml + blog/ + token pages
# + the plugin zip. That regression has bitten TWICE (commit 5b79d88, and the
# 2026-08-15 completion-coach run where the main-domain root briefly served the
# 615-byte SPA shell instead of the 11.7KB waitlist page).
#
# This script is idempotent and safe to re-run. It is wired into both:
#   - ./scripts/deploy.sh  (full deploy: build -> restore -> restart backend)
#   - make `npm run build` restore too, so a bare build can no longer wipe the tree.
#
# source of truth for these files is seo-assets/ (AGENTS.md + deploy.sh).

set -e
cd /root/godseye-repo

echo "[restore-seo] Rebuilding plugin zip into dist/ (pay-before-download payload)..."
(cd wp-plugin && rm -f /root/godseye-repo/dist/godseye-plugin.zip \
  && zip -r -q /root/godseye-repo/dist/godseye-plugin.zip godseye-bridge/ -x '*.git*')

echo "[restore-seo] Restoring static SEO + organic asset tree into dist/..."
# social / open-graph share image (referenced by index.html og:image + twitter:image)
cp /root/godseye-repo/seo-assets/og-image.png            dist/og-image.png
# token visualisation
cp /root/godseye-repo/seo-assets/token-wrapped.png        dist/token-wrapped.png
cp /root/godseye-repo/seo-assets/token-visualization.html dist/token-visualization.html
cp /root/godseye-repo/seo-assets/token-wrapped.html       dist/token-wrapped.html
# brand/launch HTML pages (human-readable; .md legacy is redirect-only)
cp /root/godseye-repo/seo-assets/godseye-tiers.html          dist/godseye-tiers.html
cp /root/godseye-repo/seo-assets/godseye-insight-report.html dist/godseye-insight-report.html
cp /root/godseye-repo/seo-assets/godseye-launch-posts.html   dist/godseye-launch-posts.html
# DISABLED: waitlist.html was being served instead of React SPA index.html
# cp /root/godseye-repo/seo-assets/waitlist.html               dist/waitlist.html
cp /root/godseye-repo/seo-assets/tracker.js                  dist/tracker.js
# SEO fundamentals
cp /root/godseye-repo/seo-assets/robots.txt   dist/robots.txt
cp /root/godseye-repo/seo-assets/sitemap.xml  dist/sitemap.xml
# blog tree
mkdir -p dist/blog
cp -r /root/godseye-repo/seo-assets/blog/*    dist/blog/

echo "[restore-seo] Normalizing permissions (644 files / 755 dirs)..."
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;

echo "[restore-seo] OK — dist waitlist md5: $(md5sum dist/waitlist.html | awk '{print $1}')"
