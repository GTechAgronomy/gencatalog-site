#!/usr/bin/env bash
# GenCatalog site version updater.
#
#   scripts/update-version.sh --check        verify all version surfaces agree
#                                            and the artifacts are downloadable
#   scripts/update-version.sh 5.16.11        bump every version surface, after
#                                            verifying the 5.16.11 artifacts
#                                            return HTTP 200
#
# Surfaces covered: index.html (JSON-LD softwareVersion, hero badge, footer),
# get.html (VERSION const that builds download URLs), sitemap.xml lastmod for
# / and /release-notes. The release-notes.html entry itself is written by hand;
# this script only verifies one exists for the target version.
#
# llms.txt intentionally links /get instead of a versioned file — nothing to
# bump there. Keep it that way.

set -euo pipefail
cd "$(dirname "$0")/.."

BASE="https://downloads.gencatalog.app"

current_versions() {
  {
    sed -n "s/.*var VERSION = '\([0-9.]*\)'.*/get.html \1/p" get.html
    sed -n 's/.*GenCatalog \([0-9.]*\) <b>Mac + Windows<\/b>.*/get.html(kicker) \1/p' get.html
    sed -n 's/.*"softwareVersion": "\([0-9.]*\)".*/index.html(json-ld) \1/p' index.html
    sed -n 's/.*<span>GenCatalog \([0-9.]*\)<\/span>.*/index.html(hero) \1/p' index.html
    grep -o 'v[0-9][0-9.]*</span>' index.html | tail -1 | sed 's/^v/index.html(footer) /; s/<\/span>//'
  }
}

check_artifacts() {
  local v="$1" ok=1
  for f in "GenCatalog-${v}-universal.dmg" "GenCatalog-${v}-Setup.exe"; do
    code=$(curl -s -o /dev/null -w '%{http_code}' -I "${BASE}/${f}")
    if [ "$code" = "200" ]; then
      echo "  200 ${BASE}/${f}"
    else
      echo "  ${code} ${BASE}/${f}  <-- NOT DOWNLOADABLE"
      ok=0
    fi
  done
  [ "$ok" = "1" ]
}

if [ "${1:-}" = "--check" ]; then
  echo "Version surfaces:"
  current_versions | sed 's/^/  /'
  distinct=$(current_versions | awk '{print $2}' | sort -u)
  count=$(echo "$distinct" | grep -c . || true)
  if [ "$count" != "1" ]; then
    echo "FAIL: version surfaces disagree: $(echo $distinct | tr '\n' ' ')"
    exit 1
  fi
  v=$(echo "$distinct" | head -1)
  if ! grep -q "GenCatalog ${v}" release-notes.html; then
    echo "FAIL: release-notes.html has no entry for ${v}"
    exit 1
  fi
  echo "Artifacts for ${v}:"
  if ! check_artifacts "$v"; then
    echo "FAIL: site says ${v} but artifacts are not live. Do not deploy."
    exit 1
  fi
  echo "OK: all surfaces at ${v}, release notes present, artifacts live."
  exit 0
fi

NEW="${1:?usage: update-version.sh <new-version> | --check}"
case "$NEW" in
  [0-9]*.[0-9]*.[0-9]*) ;;
  *) echo "Refusing: '$NEW' does not look like a version"; exit 1 ;;
esac

OLD=$(sed -n "s/.*var VERSION = '\([0-9.]*\)'.*/\1/p" get.html)
echo "Bumping ${OLD} -> ${NEW}"

echo "Verifying ${NEW} artifacts are downloadable first (AGENTS.md rule):"
if ! check_artifacts "$NEW"; then
  echo "Refusing to bump: upload the artifacts first."
  exit 1
fi

TODAY=$(date +%Y-%m-%d)
sed -i '' "s/var VERSION = '${OLD}'/var VERSION = '${NEW}'/" get.html
sed -i '' "s/GenCatalog ${OLD} <b>Mac + Windows/GenCatalog ${NEW} <b>Mac + Windows/" get.html
sed -i '' "s/\"softwareVersion\": \"${OLD}\"/\"softwareVersion\": \"${NEW}\"/" index.html
sed -i '' "s/>GenCatalog ${OLD}</>GenCatalog ${NEW}</" index.html
sed -i '' "s/>v${OLD}</>v${NEW}</g" index.html

# sitemap lastmod for / and /release-notes
perl -0pi -e "s{(<loc>https://gencatalog\.app/</loc>\s*<lastmod>)[0-9-]+}{\${1}${TODAY}}" sitemap.xml
perl -0pi -e "s{(<loc>https://gencatalog\.app/release-notes</loc>\s*<lastmod>)[0-9-]+}{\${1}${TODAY}}" sitemap.xml

if ! grep -q "GenCatalog ${NEW}" release-notes.html; then
  echo "NOTE: release-notes.html has no entry for ${NEW} yet — write one (customer-facing) before deploying."
fi

echo "Done. Surfaces now:"
current_versions | sed 's/^/  /'
echo "Re-run with --check before pushing."
