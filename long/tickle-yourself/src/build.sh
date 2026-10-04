#!/usr/bin/env bash
# Rebuild long/tickle-yourself/tickle-yourself.mp4 from scratch (1920x1080, 3 minutes at most).
# Toolchain: python3 (numpy scipy soundfile pyloudnorm pillow certifi; pedalboard optional), node + playwright-core
# driving a Chrome or Chromium (CHROME_PATH), ffmpeg with libx264/aac on PATH. The skill's bin/env.sh finds it:
# on the cloud machine in ~/.cache/cpl (installed by bin/cloud-setup.sh), on the /cp Mac in ~/.cache/cp.
# The narration takes are committed in src/voice/, so no API call is needed unless a line of
# src/script.txt changes (then pass --synth; see voice.py). Extra args go to voice.py.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$SRC/../.work}"
OUT="$SRC/../tickle-yourself.mp4"
SKILL="$SRC/../../../.claude/skills/cp-long"
# shellcheck disable=SC1091
[ -f "$SKILL/bin/env.sh" ] && . "$SKILL/bin/env.sh"
PY="${PYTHON:-python3}"
CP_CACHE="${CP_CACHE:-$HOME/.cache/cp}"
mkdir -p "$WORK" "$SRC/fonts"

# 1. fonts (Google Fonts, SIL OFL 1.1; the skill carries the four files)
if [ ! -s "$SRC/fonts/Montserrat-900.ttf" ]; then cp "$SKILL/fonts/"*.ttf "$SRC/fonts/"; fi

# 2. narration: ElevenLabs eleven_v3 takes (cached in src/voice/) -> trimmed, paced, word-timed
"$PY" "$SRC/voice.py" "$WORK" "$@"

# 3. edit timeline: shots anchored to phrases, caption chunks, cues
(cd "$SRC" && "$PY" make_timeline.py "$WORK")

# 3b. baked 2D physics (only when src/physics.js exists): matter-js at 240 Hz -> $WORK/physics.json
if [ -f "$SRC/physics.js" ]; then node "$SRC/bake_physics.js" "$WORK"; fi

# 4. sound design, score, mix (-14 LUFS, <= -1 dBTP; pedalboard's studio chain when it is installed)
(cd "$SRC" && "$PY" audio.py "$WORK")

# 5. picture: several headless browsers side by side (one run of shots each), joined and muxed with the mix
node "$SRC/render_par.js" "$WORK/timeline.json" "$OUT" --audio "$WORK/mix.wav"

# 6. English captions (SRT) for YouTube, from the caption chunks
(cd "$SRC" && "$PY" make_srt.py "$WORK/timeline.json" "$SRC/../tickle-yourself.srt")
echo "done: $OUT"
