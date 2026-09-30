#!/bin/bash
# Renders cover.jpg from SC.cover (a one-shot copy of the timeline: one 1 s "cover" shot, no captions, no subscribe cue).
set -e
cd "$(dirname "$0")"
. ~/.claude/skills/cp/bin/cp-env.sh 2>/dev/null || true
W=../.work
"${PYTHON:-python3}" - "$W" <<'PY'
import json, sys
w = sys.argv[1]
d = json.load(open(f"{w}/timeline.json"))
d["shots"] = [{"id": "cover", "start": 0, "end": 1}]; d["captions"] = []; d["duration"] = 1
for k in ("sub_in", "sub_tap"): d["cues"].pop(k, None)
json.dump(d, open(f"{w}/timeline_cover.json", "w"))
PY
node render.js "$W/timeline_cover.json" "$W/cover" "15"
ffmpeg -v error -y -i "$W/cover/f_0015.png" -q:v 3 ../cover.jpg
echo "cover.jpg written"
