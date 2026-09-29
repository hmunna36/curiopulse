#!/usr/bin/env bash
# Rebuild videos/hypnic-jerk/hypnic-jerk-short.mp4 from scratch.
# Toolchain: python3 (numpy scipy soundfile pyloudnorm pillow certifi), node + playwright-core
# driving an installed Chrome (or CHROME_PATH), ffmpeg with libx264/aac on PATH.
# The narration takes are committed in src/voice/, so no API call is needed unless a line of
# src/script.txt changes (then set ELEVENLABS_API_KEY and pass --synth, see voice.py).
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$SRC/../.work}"
OUT="$SRC/../hypnic-jerk-short.mp4"
PY="${PYTHON:-python3}"
mkdir -p "$WORK" "$SRC/fonts"

# 1. fonts (Google Fonts, SIL OFL 1.1)
if [ ! -s "$SRC/fonts/Montserrat-900.ttf" ]; then
  curl -fsS "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Anton&display=swap" |
    "$PY" -c '
import re, subprocess, sys
for b in re.findall(r"@font-face\s*{([^}]*)}", sys.stdin.read()):
    fam = re.search(r"font-family: .([^\x27]+).", b).group(1).replace(" ", "")
    w = re.search(r"font-weight: (\d+)", b).group(1)
    url = re.search(r"url\(([^)]+)\)", b).group(1)
    subprocess.run(["curl", "-fsS", "-o", f"'"$SRC"'/fonts/{fam}-{w}.ttf", url], check=True)'
fi

# 2. narration: ElevenLabs eleven_v3 takes (cached in src/voice/) -> trimmed, paced, word-timed
"$PY" "$SRC/voice.py" "$WORK" "$@"

# 3. edit timeline: shots anchored to phrases, caption chunks, cues
"$PY" "$SRC/make_timeline.py" "$WORK"

# 4. sound design, score, mix (-14 LUFS, <= -1 dBTP)
(cd "$SRC" && "$PY" audio.py "$WORK")

# 5. picture: ~2,160 canvas frames streamed straight into the encoder, muxed with the mix
node "$SRC/render.js" "$WORK/timeline.json" "$OUT" --audio "$WORK/mix.wav"
echo "done: $OUT"
