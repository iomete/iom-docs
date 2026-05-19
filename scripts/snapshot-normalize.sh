#!/usr/bin/env bash
#
# snapshot-normalize.sh — strip build-to-build non-determinism from a Docusaurus
# build directory so that two identical builds diff to empty.
#
# Three passes:
#   1. Webpack content hashes:   `main.a1b2c3d4.js` → `main.HASH.js`
#   2. Sourcemap URL comments:   `//# sourceMappingURL=...` lines deleted
#   3. JSON-LD `dateModified`:   build-time ISO timestamp → `NORMALIZED`
#      (Docusaurus injects build-time `dateModified` into schema.org metadata
#       in <script type="application/ld+json"> blocks on doc pages)
#
# Used by .github/workflows/snapshot-gate.yaml to prepare base and head
# builds for `diff -r`. Idempotent — safe to re-run on the same directory.
set -euo pipefail

DIR="${1:?usage: snapshot-normalize.sh <build-dir>}"

if [ ! -d "$DIR" ]; then
  echo "Error: $DIR is not a directory" >&2
  exit 1
fi

# Normalize HTML files in place. `-i.bak` form works on both BSD (macOS) and
# GNU (Linux) sed. `-exec ... {} +` batches files per sed invocation.
find "$DIR" -type f -name "*.html" -exec sed -i.bak \
  -e 's/\.[a-f0-9]\{8,20\}\.\(js\|css\|map\)/.HASH.\1/g' \
  -e '/^\/\/[#@] sourceMappingURL=/d' \
  -e 's/"dateModified":"[^"]*"/"dateModified":"NORMALIZED"/g' \
  {} +

# Clean up sed backup files
find "$DIR" -type f -name "*.html.bak" -delete

# Report
count=$(find "$DIR" -type f -name "*.html" | wc -l | tr -d ' ')
echo "Normalized $count HTML files in $DIR"
