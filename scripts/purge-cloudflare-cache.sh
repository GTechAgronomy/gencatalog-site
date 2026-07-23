#!/usr/bin/env bash
set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN to a zone-scoped token with Cache Purge permission.}"

CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID:-350a449e1c3a41ba26430432004acef4}"

response="$(
  curl --fail-with-body --silent --show-error \
    --request POST \
    "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
    --header "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    --header "Content-Type: application/json" \
    --data '{"purge_everything":true}'
)"

if ! printf "%s" "$response" | jq -e '.success == true' >/dev/null; then
  printf "Cloudflare purge failed:\n%s\n" "$response" >&2
  exit 1
fi

printf "Cloudflare cache purge completed for zone %s.\n" "$CLOUDFLARE_ZONE_ID"
