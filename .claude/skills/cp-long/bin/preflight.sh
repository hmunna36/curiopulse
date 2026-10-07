#!/usr/bin/env bash
# The gate at the start of every long-form run: installs the toolchain (cloud), then checks everything the run
# needs and prints one report. Exit 0 = go. Exit 2 = a blocker only the user can clear (keys, network setting,
# quota): report it and stop. Exit 1 = the toolchain is broken: try to fix it, then report.
# It never prints a key: only whether each variable is set.
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../../.." && pwd)"
echo "== machine"
echo "  $(uname -sm), $( (nproc 2>/dev/null || sysctl -n hw.ncpu) ) CPUs, $(df -h "$REPO" | awk 'NR==2 {print $4}') free disk, user $(id -un)"
echo "== toolchain"
"$HERE/cloud-setup.sh" || exit 1
. "$HERE/env.sh"
rc=0
echo "== render test (the template, 1920x1080)"
T="$(mktemp -d)"; cp -R "$CPL_SKILL/template/src" "$T/src"; mkdir -p "$T/src/fonts" "$T/work"; cp "$CPL_SKILL/fonts/"*.ttf "$T/src/fonts/"
"$PYTHON" - "$T/work/timeline.json" <<'PYEOF'
import json, sys
json.dump({"fps": 30, "duration": 6.0, "width": 1920, "height": 1080,
           "shots": [{"id": "hook", "start": 0, "end": 3}, {"id": "button", "start": 3, "end": 6}],
           "captions": [{"start": 0.2, "end": 2.8, "lines": [[{"t": "render", "c": "#FFFFFF", "at": 0.2}, {"t": "TEST", "c": "#FFD447", "at": 0.5}]]}],
           "cues": {"sub_in": 3.4, "sub_tap": 4.6}, "words": [], "events": []}, open(sys.argv[1], "w"))
PYEOF
if (cd "$T/src" && node render.js "$T/work/timeline.json" "$T/work/test.mp4" "0-59" >"$T/work/render.log" 2>&1) && [ -s "$T/work/test.mp4" ]; then
  echo "  ok: $(grep -o 'rendered .*' "$T/work/render.log" | tail -1) (one browser; a full video runs $RENDER_JOBS side by side)"
  ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate -of csv=p=0 "$T/work/test.mp4" | sed 's/^/  /'
else
  echo "  FAILED:"; tail -15 "$T/work/render.log" | sed 's/^/    /'; rc=1
fi
rm -rf "$T"
echo "== keys (set or not; never printed)"
for v in ELEVENLABS_API_KEY YT_CLIENT_ID YT_CLIENT_SECRET YT_REFRESH_TOKEN; do
  if [ -n "${!v:-}" ]; then echo "  $v: set"; else echo "  $v: NOT SET"; [ "$(uname -s)" = "Linux" ] && rc=2; fi
done
echo "== network"
for u in https://api.elevenlabs.io/v1/models https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest https://oauth2.googleapis.com/token https://en.wikipedia.org/wiki/Main_Page https://pubmed.ncbi.nlm.nih.gov/; do
  code="$(curl -s -o /dev/null -m 20 -w '%{http_code}' "$u" || true)"
  case "$code" in 000|403|407) echo "  $u: BLOCKED ($code)"; case "$u" in *elevenlabs*|*googleapis*) rc=2;; esac;; *) echo "  $u: reachable ($code)";; esac
done
echo "== ElevenLabs"
node "$HERE/quota.mjs" 7000 | sed 's/^/  /'; [ "${PIPESTATUS[0]}" = 0 ] || rc=2
echo "== YouTube"
node "$HERE/yt.mjs" whoami 2>&1 | sed 's/^/  /'; [ "${PIPESTATUS[0]}" = 0 ] || rc=2
[ $rc = 2 ] || node "$HERE/yt.mjs" upcoming 2>&1 | sed 's/^/  /'
echo "== git"
echo "  branch $(git -C "$REPO" rev-parse --abbrev-ref HEAD), $(git -C "$REPO" log --oneline -1 | cut -c1-70)"
if git -C "$REPO" push --dry-run origin HEAD:refs/heads/main >/dev/null 2>&1; then echo "  push to main: allowed"; else echo "  push to main: NOT allowed (push.sh falls back to a claude/ branch)"; fi
case $rc in 0) echo "PREFLIGHT: GO";; 2) echo "PREFLIGHT: BLOCKED (needs the user: see NOT SET / BLOCKED / NOT ENOUGH above)";; *) echo "PREFLIGHT: TOOLCHAIN BROKEN";; esac
exit $rc
