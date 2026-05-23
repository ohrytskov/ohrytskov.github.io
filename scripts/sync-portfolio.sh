#!/usr/bin/env bash
# Sync portfolio content from /var/www/hello/my/portfolio-area/portfolio-upwork/
# into this site repo:
#   - info.md  → src/content/portfolio/<slug>/info.md
#   - images   → public/portfolio/<slug>/<filename>
#
# portfolio-area stays the canonical source — this script just copies the
# subset needed for the build. Run before `pnpm build` (or commit) when
# you've updated portfolio-area.

set -euo pipefail
cd "$(dirname "$0")/.."

SRC_ROOT=/var/www/hello/my/portfolio-area/portfolio-upwork
DEST_CONTENT=src/content/portfolio
DEST_PUBLIC=public/portfolio

if [ ! -d "$SRC_ROOT" ]; then
  echo "[sync-portfolio] source dir not found: $SRC_ROOT" >&2
  exit 1
fi

# Wipe destinations so deleted/renamed projects don't linger.
rm -rf "$DEST_CONTENT" "$DEST_PUBLIC"
mkdir -p "$DEST_CONTENT" "$DEST_PUBLIC"

count=0
for project_dir in "$SRC_ROOT"/*/; do
  slug=$(basename "$project_dir")
  [ "$slug" = "_archive" ] && continue
  if [ ! -f "$project_dir/info.md" ]; then
    echo "[sync-portfolio] skipping $slug (no info.md)" >&2
    continue
  fi

  mkdir -p "$DEST_CONTENT/$slug" "$DEST_PUBLIC/$slug"

  # info.md goes into src/content (read at build time).
  cp "$project_dir/info.md" "$DEST_CONTENT/$slug/info.md"

  # Images and GIFs go into public/ (served as static assets).
  shopt -s nullglob
  for img in "$project_dir"/*.png "$project_dir"/*.jpg "$project_dir"/*.jpeg "$project_dir"/*.webp "$project_dir"/*.gif; do
    cp "$img" "$DEST_PUBLIC/$slug/"
  done
  shopt -u nullglob

  count=$((count + 1))
  echo "[sync-portfolio] $slug"
done

echo "[sync-portfolio] synced $count project(s)"
