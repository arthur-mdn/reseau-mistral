#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/toulon.pmtiles"
if command -v pmtiles >/dev/null 2>&1; then
  pmtiles convert "$ROOT" "$OUT"
else
  npx --yes pmtiles convert "$ROOT" "$OUT"
fi
echo "Écrit: $OUT"