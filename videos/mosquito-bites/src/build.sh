#!/usr/bin/env bash
# Rebuild videos/mosquito-bites/mosquito-bites-short.mp4 from scratch.
# Toolchain: python3 (numpy scipy soundfile pyloudnorm pillow certifi; pedalboard optional), node + playwright-core
# driving an installed Chrome (or CHROME_PATH), ffmpeg with libx264/aac on PATH. On the /cp Mac all of it
# lives in ~/.cache/cp (picked up automatically below).
# The narration takes are committed in src/voice/, so no API call is needed unless a line of
# src/script.txt changes (then pass --synth; see voice.py). Extra args go to voice.py.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$SRC/../.work}"
OUT="$SRC/../mosquito-bites-short.mp4"
CP_CACHE="${CP_CACHE:-$HOME/.cache/cp}"
if [ -d "$CP_CACHE" ]; then
  export PATH="$CP_CACHE/bin:$PATH"
  export NODE_PATH="${NODE_PATH:-$CP_CACHE/node/node_modules}"
  export ELEVENLABS_ENV_FILE="${ELEVENLABS_ENV_FILE:-$HOME/.config/va/elevenlabs.env}"
  PY="${PYTHON:-$CP_CACHE/venv/bin/python3}"
else
  PY="${PYTHON:-python3}"
fi
mkdir -p "$WORK" "$SRC/fonts"

# 1. fonts (Google Fonts, SIL OFL 1.1)
if [ ! -s "$SRC/fonts/Montserrat-900.ttf" ]; then
  if [ -s "$CP_CACHE/fonts/Montserrat-900.ttf" ]; then cp "$CP_CACHE/fonts/"*.ttf "$SRC/fonts/"
  else
    curl -fsS "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Anton&display=swap" |
      "$PY" -c '
import re, subprocess, sys
for b in re.findall(r"@font-face\s*{([^}]*)}", sys.stdin.read()):
    fam = re.search(r"font-family: .([^\x27]+).", b).group(1).replace(" ", "")
    w = re.search(r"font-weight: (\d+)", b).group(1)
    url = re.search(r"url\(([^)]+)\)", b).group(1)
    subprocess.run(["curl", "-fsS", "-o", f"'"$SRC"'/fonts/{fam}-{w}.ttf", url], check=True)'
  fi
fi

# 2. narration: ElevenLabs eleven_v3 takes (cached in src/voice/) -> trimmed, paced, word-timed
"$PY" "$SRC/voice.py" "$WORK" "$@"

# 3. edit timeline: shots anchored to phrases, caption chunks, cues
(cd "$SRC" && "$PY" make_timeline.py "$WORK")

# 3b. baked 2D physics (only when src/physics.js exists): matter-js at 240 Hz -> $WORK/physics.json
if [ -f "$SRC/physics.js" ]; then node "$SRC/bake_physics.js" "$WORK"; fi

# 4. sound design, score, mix (-14 LUFS, <= -1 dBTP; pedalboard's studio chain when it is installed)
(cd "$SRC" && "$PY" audio.py "$WORK")

# 5. picture: every canvas frame streamed straight into the encoder, muxed with the mix
node "$SRC/render.js" "$WORK/timeline.json" "$OUT" --audio "$WORK/mix.wav"

# 6. English captions (SRT) for YouTube, from the caption chunks
(cd "$SRC" && "$PY" make_srt.py "$WORK/timeline.json" "$SRC/../mosquito-bites.srt")
echo "done: $OUT"
