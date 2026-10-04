#!/usr/bin/env bash
# Create a long-form video folder from the skill's template.
# usage: new-long.sh <slug> "<Title>"     e.g. new-long.sh tickle-yourself "Why Can't You TICKLE Yourself?"
# Result: long/<slug>/ in this repo, with src/ (the landscape engine + skeletons), README.md, publish.json, fonts.
set -euo pipefail
SLUG="${1:-}"; TITLE="${2:-}"
if [ -z "$SLUG" ] || [ -z "$TITLE" ]; then echo 'usage: new-long.sh <slug> "<Title>"'; exit 2; fi
case "$SLUG" in *[!a-z0-9-]*) echo "slug must be lowercase letters, digits and dashes"; exit 2;; esac
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$SKILL/../../.." && pwd)"
DEST="$REPO/long/$SLUG"
if [ -e "$DEST" ]; then echo "$DEST already exists (resume it instead)"; exit 1; fi
git -C "$REPO" sparse-checkout list >/dev/null 2>&1 && git -C "$REPO" config core.sparseCheckout >/dev/null 2>&1 && git -C "$REPO" sparse-checkout add "long/$SLUG" assets/sfx >/dev/null 2>&1 || true
mkdir -p "$DEST"
cp -R "$SKILL/template/." "$DEST/"
find "$DEST" -name '.DS_Store' -delete
node -e '
const fs = require("fs"), path = require("path");
const [dir, slug, title] = process.argv.slice(1);
const walk = (d) => fs.readdirSync(d, {withFileTypes: true}).flatMap((e) => e.isDirectory() ? (e.name === "vendor" ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
for (const f of walk(dir).filter((f) => /\.(md|json|py|sh|txt|js|html)$/.test(f))) {
  const s = fs.readFileSync(f, "utf8");
  const t = s.split("__SLUG__").join(slug).split("__TITLE__").join(title);
  if (t !== s) fs.writeFileSync(f, t);
}' "$DEST" "$SLUG" "$TITLE"
chmod +x "$DEST/src/build.sh"
mkdir -p "$DEST/.work" "$DEST/src/fonts"
cp "$SKILL/fonts/"*.ttf "$DEST/src/fonts/"
echo "created $DEST"
