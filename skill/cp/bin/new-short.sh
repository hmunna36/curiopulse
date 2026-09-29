#!/bin/sh
# Create a CurioPulse Short from the cp skill's template.
# usage: new-short.sh <slug> "<Title>"      e.g. new-short.sh brain-freeze "Why Does Ice Cream Give You Brain Freeze?"
# Result: ~/Desktop/curiopulse/videos/<slug>/ inside the light local checkout of github.com/hmunna36/curiopulse
# (blobless + sparse: old videos cost no disk), with src/ (engine + skeletons), README.md, publish.json, fonts.
set -e
SLUG="$1"
TITLE="$2"
if [ -z "$SLUG" ] || [ -z "$TITLE" ]; then echo 'usage: new-short.sh <slug> "<Title>"'; exit 2; fi
case "$SLUG" in *[!a-z0-9-]*) echo "slug must be lowercase letters, digits and dashes"; exit 2;; esac
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${CP_REPO:-$HOME/Desktop/curiopulse}"
CACHE="$HOME/.cache/cp"

# 1. the repo checkout
if [ ! -d "$REPO/.git" ]; then
  git clone --filter=blob:none --sparse git@github.com:hmunna36/curiopulse.git "$REPO"
  # commit identity: the same one the user's other video repo uses (kept out of this public script)
  for k in user.name user.email; do
    v=$(git -C "$HOME/Desktop/visualalgo" config --local "$k" 2>/dev/null || true)
    [ -n "$v" ] && git -C "$REPO" config "$k" "$v"
  done
fi
git -C "$REPO" pull --ff-only -q 2>/dev/null || echo "note: could not pull (offline?) — continuing"
DEST="$REPO/videos/$SLUG"
if [ -e "$DEST" ]; then echo "$DEST already exists (resume it instead)"; exit 1; fi
if [ -n "$(git -C "$REPO" ls-tree -d HEAD "videos/$SLUG")" ]; then
  echo "videos/$SLUG is already in the repo; bring it back with: git -C $REPO sparse-checkout add videos/$SLUG"; exit 1
fi
git -C "$REPO" sparse-checkout add "videos/$SLUG"

# 2. the template, with the names filled in
mkdir -p "$DEST"
cp -R "$SKILL/template/." "$DEST/"
find "$DEST" -name '.DS_Store' -delete
node -e '
const fs = require("fs"), path = require("path");
const [dir, slug, title] = process.argv.slice(1);
const walk = (d) => fs.readdirSync(d, {withFileTypes: true}).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(dir).filter((f) => /\.(md|json|py|sh|txt|js|html)$/.test(f))) {
  const s = fs.readFileSync(f, "utf8");
  const t = s.split("__SLUG__").join(slug).split("__TITLE__").join(title);
  if (t !== s) fs.writeFileSync(f, t);
}' "$DEST" "$SLUG" "$TITLE"
mv "$DEST/src/build.sh" "$DEST/src/build.sh.tmp" && mv "$DEST/src/build.sh.tmp" "$DEST/src/build.sh" && chmod +x "$DEST/src/build.sh"
mkdir -p "$DEST/.work" "$DEST/src/fonts"
cp "$CACHE/fonts/"*.ttf "$DEST/src/fonts/" 2>/dev/null || echo "note: no cached fonts; build.sh downloads them"

# 3. checks
ok=1
[ -x "$CACHE/venv/bin/python3" ] || { echo "MISSING: $CACHE/venv (python venv: numpy scipy soundfile pyloudnorm pillow certifi)"; ok=0; }
[ -d "$CACHE/node/node_modules/playwright-core" ] || { echo "MISSING: $CACHE/node/node_modules/playwright-core"; ok=0; }
"$CACHE/bin/ffmpeg" -hide_banner -version >/dev/null 2>&1 || { echo "MISSING: a working $CACHE/bin/ffmpeg (it wraps ~/.cache/va's Remotion compositor)"; ok=0; }
[ -s "$CACHE/models/ggml-base.en.bin" ] || echo "note: no whisper model; qa.py skips the transcript check"
[ -f "$HOME/.config/va/elevenlabs.env" ] || { echo "MISSING: ElevenLabs keys in ~/.config/va/elevenlabs.env"; ok=0; }
df -h "$HOME" | awk 'NR==2 {print "disk: " $4 " free"}'
[ $ok = 1 ] && echo "created $DEST" || { echo "created $DEST, but fix the MISSING items first"; exit 1; }
