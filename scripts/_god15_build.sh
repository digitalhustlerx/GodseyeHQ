#!/bin/bash
cd /root/godseye-repo
echo "[vite]"
npx vite build; v=$?
echo "vite exit: $v"
echo "[esbuild]"
npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs; e=$?
echo "esbuild exit: $e"
ls -la dist/server.cjs dist/assets/*.js 2>/dev/null | grep -E "server.cjs|index" | head
echo "DONE vit=$v esb=$e"
exit 0
