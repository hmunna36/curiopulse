#!/usr/bin/env bash
# The cover (cover.jpg: the YouTube thumbnail and the Instagram cover) is a frame of its own, SC.cover in web/scenes.js,
# rendered from a one-shot copy of the timeline. Run it after build.sh (it needs .work/timeline.json).
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$SRC/../.work}"
CP_CACHE="${CP_CACHE:-$HOME/.cache/cp}"
if [ -d "$CP_CACHE" ]; then
  export PATH="$CP_CACHE/bin:$PATH"
  export NODE_PATH="${NODE_PATH:-$CP_CACHE/node/node_modules}"
  PY="${PYTHON:-$CP_CACHE/venv/bin/python3}"
else
  PY="${PYTHON:-python3}"
fi
"$PY" - "$WORK" <<'PY'
import json, sys
w = sys.argv[1]
tl = json.load(open(f"{w}/timeline.json"))
tl.update(duration=1 / tl["fps"] * 2, shots=[{"id": "cover", "start": 0, "end": 1}], captions=[])
json.dump(tl, open(f"{w}/cover_tl.json", "w"))
PY
node "$SRC/render.js" "$WORK/cover_tl.json" "$WORK/cover" "0"
ffmpeg -v error -y -i "$WORK/cover/f_0000.png" -q:v 3 "$SRC/../cover.jpg"
echo "done: $SRC/../cover.jpg"
