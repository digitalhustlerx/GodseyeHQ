#!/usr/bin/env bash
#
# =============================================================================
#  GODSEYE x POLAR — WIRE THE WORDPRESS PLUGIN ZIP AS A PAID DOWNLOADABLE
# =============================================================================
#  PREP-ONLY ARTIFACT. Run ONLY when Digital Viking says "go".
#  This does THREE things so a $9 Starter purchase truly DELIVERS the plugin:
#
#    1. Creates a "downloadables" BENEFIT on Polar.
#    2. Uploads dist/godseye-plugin.zip as a Polar FILE (S3-backed asset).
#    3. ATTACHES that benefit to the 3 subscription products (Starter/Pro/Agency)
#       AND auto-attaches it to any credit-pack products discovered by name.
#
#  Auth: uses POLAR_ACCESS_TOKEN + POLAR_ORGANIZATION_ID from the repo `.env`.
#        Token is `polar_oat_...` = Organization Access Token  ->  Bearer scheme.
#  Base: https://api.polar.sh  (production)
#
#  API shapes verified against https://api.polar.sh/openapi.json (2026):
#    POST /v1/benefits/                   BenefitDownloadablesCreate
#    POST /v1/files/                      DownloadableFileCreate  -> FileUpload(201)
#    PUT  <presigned s3 url>              upload chunk bytes (from upload.parts[])
#    POST /v1/files/{id}/uploaded         FileUploadCompleted     -> FileRead
#    POST /v1/products/{id}/benefits      ProductBenefitsUpdate   -> Product
# =============================================================================

set -euo pipefail

# ---- 0. CONFIG --------------------------------------------------------------
# Override these env vars at runtime to change behaviour. Defaults read .env.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$REPO_DIR/.env}"

PLUGIN_ZIP="${PLUGIN_ZIP:-$REPO_DIR/dist/godseye-plugin.zip}"
# BENEFIT_NAME is the ONLY label field (Polar's downloadables benefit has a
# single 'description' field, max 42 chars). Keep it short & unique so re-runs
# reuse it instead of duplicating.
BENEFIT_NAME="${BENEFIT_NAME:-Godseye WordPress plugin}"
API_BASE="${API_BASE:-https://api.polar.sh}"

# The three known subscription products (context-vetted today).
PRODUCT_STARTER="bc746111-be41-4f7e-8e75-ed3d7eb1e7e3"
PRODUCT_PRO="a31bba8d-5ef6-4033-93c4-24acdb46a30f"
PRODUCT_AGENCY="b13480b8-f4ae-4051-aa1c-36ac31303ce7"
# Credit-pack products are DISCOVERED by name (matches "credit" or "pack"),
# OR you may hard-specify extra product IDs here (space separated) and they'll
# also get the benefit attached:
EXTRA_PRODUCT_IDS="${EXTRA_PRODUCT_IDS:-}"

# ---- 0.1 Load token + org from .env -----------------------------------------
if [[ -f "$ENV_FILE" ]]; then
  set -a; source "$ENV_FILE"; set +a
fi

TOKEN="${POLAR_ACCESS_TOKEN:?Set POLAR_ACCESS_TOKEN (in .env or export).}"
ORG_ID="${POLAR_ORGANIZATION_ID:?Set POLAR_ORGANIZATION_ID (in .env or export).}"

# Polar uses the standard Bearer scheme on ALL authenticated endpoints.
AUTH_HDR="Authorization: Bearer ${TOKEN}"

# ---- 0.2 Preflight ----------------------------------------------------------
command -v curl >/dev/null || { echo "❌ curl missing"; exit 1; }
command -v jq   >/dev/null || { echo "❌ jq missing";    exit 1; }
command -v sha256sum >/dev/null || { echo "❌ sha256sum missing"; exit 1; }

[[ -f "$PLUGIN_ZIP" ]] || { echo "❌ plugin zip not found: $PLUGIN_ZIP"; exit 1; }

FILE_SIZE=$(stat -c %s "$PLUGIN_ZIP")          # bytes
SHA_B64=$(openssl dgst -sha256 -binary "$PLUGIN_ZIP" | base64 -w0)  # base64 sha256
ZIP_NAME=$(basename "$PLUGIN_ZIP")

echo "✅ Plugin: $PLUGIN_ZIP"
echo "   size  = ${FILE_SIZE} bytes"
echo "   sha256(base64) = ${SHA_B64}"
echo "   org   = $ORG_ID"
echo

# Safely pull a JSON value out of a response body via stdin.
jqget() { jq -r "$1" 2>/dev/null; }

# =============================================================================
# STEP A — CREATE / REUSE THE DOWNLOADABLES BENEFIT
# =============================================================================
echo "=== STEP A: ensure '$BENEFIT_NAME' downloadables benefit exists ==="

# Reuse if one with this exact name already exists (idempotent re-runs).
BENEFIT_ID="$(curl -s -H "$AUTH_HDR" "$API_BASE/v1/benefits?organization_id=$ORG_ID&limit=100" \
  | jq -r --arg n "$BENEFIT_NAME" \
    '.items[]? | select(.type=="downloadables" and .description==$n) | .id' | head -1)"

if [[ -n "$BENEFIT_ID" ]]; then
  echo "  ♻️  Reusing existing benefit $BENEFIT_ID"
else
  BENEFIT_JSON=$(cat <<JSON
{
  "type": "downloadables",
  "description": "$BENEFIT_NAME",
  "organization_id": "$ORG_ID",
  "properties": {}
}
JSON
)
  # NOTE: properties.files is filled in AFTER we upload the file (STEP B/C).
  BENEFIT_RESP="$(curl -s -w '\n%{http_code}' -X POST "$API_BASE/v1/benefits/" \
    -H "$AUTH_HDR" -H "Content-Type: application/json" -d "$BENEFIT_JSON")"
  BENEFIT_BODY="${BENEFIT_RESP%$'\n'*}"
  BENEFIT_CODE="${BENEFIT_RESP##*$'\n'}"
  [[ "$BENEFIT_CODE" == "201" ]] || { echo "❌ create benefit failed (HTTP $BENEFIT_CODE):"; echo "$BENEFIT_BODY"; exit 1; }
  BENEFIT_ID="$(echo "$BENEFIT_BODY" | jqget '.id')"
  echo "  ✅ Created benefit $BENEFIT_ID"
fi
echo

# =============================================================================
# STEP B — CREATE THE FILE (S3 multipart plan, single part = whole zip)
# =============================================================================
echo "=== STEP B: create file '$ZIP_NAME' on Polar ==="

# Single part covering the entire file (zip is ~9.5 KB; well under any part cap).
FILE_JSON=$(cat <<JSON
{
  "name": "$ZIP_NAME",
  "mime_type": "application/zip",
  "size": $FILE_SIZE,
  "checksum_sha256_base64": "$SHA_B64",
  "service": "downloadable",
  "organization_id": "$ORG_ID",
  "upload": {
    "parts": [
      { "number": 1, "chunk_start": 0, "chunk_end": $FILE_SIZE }
    ]
  }
}
JSON
)

CREATE_RESP="$(curl -s -w '\n%{http_code}' -X POST "$API_BASE/v1/files/" \
  -H "$AUTH_HDR" -H "Content-Type: application/json" -d "$FILE_JSON")"
CREATE_BODY="${CREATE_RESP%$'\n'*}"
CREATE_CODE="${CREATE_RESP##*$'\n'}"
[[ "$CREATE_CODE" == "201" ]] || { echo "❌ create file failed (HTTP $CREATE_CODE):"; echo "$CREATE_BODY"; exit 1; }

FILE_ID="$(echo "$CREATE_BODY" | jqget '.id')"
UPLOAD_PATH="$(echo "$CREATE_BODY" | jqget '.path')"
PART_URL="$(echo "$CREATE_BODY" | jqget '.upload.parts[0].url')"
declare -A PART_HEADERS=()
# Pull dynamic S3 headers (e.g. x-amz-checksum, Content-Type) into an array.
while IFS=$'\t' read -r k v; do
  [[ -n "$k" && -n "$v" ]] && PART_HEADERS["$k"]="$v"
done < <(echo "$CREATE_BODY" | jq -r '.upload.parts[0].headers | to_entries[] | [.key,.value] | @tsv')

echo "  ✅ File $FILE_ID created (path: $UPLOAD_PATH)"
echo "  🔗 presigned URL: ${PART_URL:0:60}..."

# =============================================================================
# STEP C — UPLOAD THE BYTES + COMPLETE
# =============================================================================
echo "=== STEP C: upload bytes + complete ==="

# Build header args for the signed PUT.
HDR_ARGS=()
for k in "${!PART_HEADERS[@]}"; do
  HDR_ARGS+=( -H "$k: ${PART_HEADERS[$k]}" )
done
[[ ${#HDR_ARGS[@]} -eq 0 ]] && HDR_ARGS=( -H "Content-Type: application/zip" )

# PUT the full zip to the presigned URL. Capture the response ETag header.
ETAG="$(curl -s -D - -o /dev/null \
  -X PUT -T "$PLUGIN_ZIP" "${HDR_ARGS[@]}" "$PART_URL" \
  | tr -d '\r' | awk -F': ' 'tolower($1)=="etag"{gsub(/"/,"",$2); print $2; exit}')"
[[ -n "$ETAG" ]] || { echo "❌ S3 PUT returned no ETag"; exit 1; }
echo "  ✅ Uploaded part 1, ETag=$ETAG"

# Complete the multipart upload so Polar finalizes the file.
COMPLETE_JSON=$(cat <<JSON
{
  "id": "$FILE_ID",
  "path": "$UPLOAD_PATH",
  "parts": [
    {
      "number": 1,
      "checksum_etag": "$ETAG",
      "checksum_sha256_base64": "$SHA_B64"
    }
  ]
}
JSON
)
COMPLETE_RESP="$(curl -s -w '\n%{http_code}' -X POST "$API_BASE/v1/files/$FILE_ID/uploaded" \
  -H "$AUTH_HDR" -H "Content-Type: application/json" -d "$COMPLETE_JSON")"
COMPLETE_BODY="${COMPLETE_RESP%$'\n'*}"
COMPLETE_CODE="${COMPLETE_RESP##*$'\n'}"
[[ "$COMPLETE_CODE" == "200" ]] || { echo "❌ complete upload failed (HTTP $COMPLETE_CODE):"; echo "$COMPLETE_BODY"; exit 1; }
echo "  ✅ File upload completed: $FILE_ID"
echo

# =============================================================================
# STEP D — PIN THE FILE INTO THE BENEFIT (properties.files)
# =============================================================================
echo "=== STEP D: attach uploaded file to the benefit ==="

BENEFIT_PATCH=$(cat <<JSON
{
  "properties": { "files": [ "$FILE_ID" ] }
}
JSON
)
PATCH_RESP="$(curl -s -w '\n%{http_code}' -X PATCH "$API_BASE/v1/benefits/$BENEFIT_ID" \
  -H "$AUTH_HDR" -H "Content-Type: application/json" -d "$BENEFIT_PATCH")"
PATCH_BODY="${PATCH_RESP%$'\n'*}"
PATCH_CODE="${PATCH_RESP##*$'\n'}"
[[ "$PATCH_CODE" == "200" ]] || { echo "❌ update benefit failed (HTTP $PATCH_CODE):"; echo "$PATCH_BODY"; exit 1; }
echo "  ✅ Benefit $BENEFIT_ID now grants file $FILE_ID"
echo

# =============================================================================
# STEP E — ATTACH BENEFIT TO ALL PRODUCTS
# =============================================================================
echo "=== STEP E: attach benefit to subscription + credit-pack products ==="

# Assemble the target product list: known 3 + extra + any credit packs discovered.
PRODUCTS="$PRODUCT_STARTER $PRODUCT_PRO $PRODUCT_AGENCY $EXTRA_PRODUCT_IDS"

# Discover credit packs: any product whose name contains "credit" or "pack".
DISCOVERED="$(curl -s -H "$AUTH_HDR" "$API_BASE/v1/products?organization_id=$ORG_ID&limit=100" \
  | jq -r '.items[]? | select((.name | ascii_downcase | contains("credit")) or (.name | ascii_downcase | contains("pack"))) | .id')"
if [[ -n "$DISCOVERED" ]]; then
  echo "  🧩 Credit-pack products discovered by name:"
  while IFS= read -r pid; do [[ -n "$pid" ]] && { echo "     - $pid"; PRODUCTS="$PRODUCTS $pid"; }; done <<<"$DISCOVERED"
else
  echo "  ℹ️  No credit-pack products discovered by name (credit packs may be separate one-off products, not in list) — use EXTRA_PRODUCT_IDS if needed."
fi

echo "  Target product IDs:"
for pid in $PRODUCTS; do echo "     - $pid"; done
echo

FAILED=0
for PRODUCT_ID in $(echo "$PRODUCTS" | tr ' ' '\n' | sort -u); do
  [[ -n "$PRODUCT_ID" ]] || continue
  ATTACH_JSON=$(cat <<JSON
{ "benefits": [ "$BENEFIT_ID" ] }
JSON
)
  RESP="$(curl -s -w '\n%{http_code}' -X POST "$API_BASE/v1/products/$PRODUCT_ID/benefits" \
    -H "$AUTH_HDR" -H "Content-Type: application/json" -d "$ATTACH_JSON")"
  CODE="${RESP##*$'\n'}"
  case "$CODE" in
    200)
      NAME="$(echo "${RESP%$'\n'*}" | jqget '.name // "?"')"
      echo "  ✅ $PRODUCT_ID ($NAME) -> benefit attached"
      ;;
    403) echo "  ⚠️  403 on $PRODUCT_ID — token lacks perms or product on different org; SKIP"; FAILED=1;;
    404) echo "  ⚠️  404 on $PRODUCT_ID — product not found; SKIP"; FAILED=1;;
    *)   echo "  ⚠️  HTTP $CODE on $PRODUCT_ID:"; echo "${RESP%$'\n'*}"; FAILED=1;;
  esac
done
echo

# =============================================================================
# STEP F — VERIFY
# =============================================================================
echo "=== STEP F: verify benefit attached to each product ==="
for PRODUCT_ID in $(echo "$PRODUCTS" | tr ' ' '\n' | sort -u); do
  [[ -n "$PRODUCT_ID" ]] || continue
  P="$(curl -s -H "$AUTH_HDR" "$API_BASE/v1/products/$PRODUCT_ID")"
  NAME="$(echo "$P" | jqget '.name // "?"')"
  HAS_BENEFIT="$(echo "$P" | jq --arg b "$BENEFIT_ID" '[.benefits[]? | select(.id==$b)] | length')"
  if [[ "$HAS_BENEFIT" == "1" ]]; then
    echo "  ✅ $NAME ($PRODUCT_ID): benefit present"
  else
    echo "  ❌ $NAME ($PRODUCT_ID): benefit MISSING"
    FAILED=1
  fi
done
echo

# =============================================================================
# DONE
# =============================================================================
cat <<DONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
  Benefit  : $BENEFIT_ID  ('$BENEFIT_NAME')
  File     : $FILE_ID
  Plugin   : $PLUGIN_ZIP
  Products : see Step F output above

  A $9 Starter checkout will now grant the customer a download of
  '$ZIP_NAME' automatically (Polar grants the benefit on payment).
DONE

[[ "$FAILED" == "1" ]] && { echo; echo "⚠️  Some steps failed — review above before celebrating."; exit 1; }
echo "🎉 All wired. Run a $9 test checkout to confirm the download appears."
