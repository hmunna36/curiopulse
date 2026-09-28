#!/usr/bin/env bash
# Rebuild videos/lightning-full/lightning-full-short.mp4 from scratch.
# Same toolchain as ../../lightning-strike (python3: numpy scipy pillow soundfile onnx kokoro-onnx
# pyloudnorm; node + playwright/Chromium; ffmpeg with libx264). Network only for fonts + TTS model.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$SRC/../.work}"
MODELS="${MODELS:-$WORK/models}"
OUT="$SRC/../lightning-full-short.mp4"
mkdir -p "$WORK" "$MODELS" "$SRC/fonts"

# 1. fonts (Google Fonts, SIL OFL 1.1)
if [ ! -s "$SRC/fonts/Montserrat-900.ttf" ]; then
  curl -fsS "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Anton&display=swap" |
    python3 -c '
import re, subprocess, sys
for b in re.findall(r"@font-face\s*{([^}]*)}", sys.stdin.read()):
    fam = re.search(r"font-family: .([^\x27]+).", b).group(1).replace(" ", "")
    w = re.search(r"font-weight: (\d+)", b).group(1)
    url = re.search(r"url\(([^)]+)\)", b).group(1)
    subprocess.run(["curl", "-fsS", "-o", f"'"$SRC"'/fonts/{fam}-{w}.ttf", url], check=True)'
fi

# 2. narrator: Kokoro-82M (Apache-2.0), patched to report phoneme durations — same voice as the 10 s cut
REL=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -s "$MODELS/voices-v1.0.bin" ] || curl -fsSL -o "$MODELS/voices-v1.0.bin" "$REL/voices-v1.0.bin"
[ -s "$MODELS/kokoro-v1.0.onnx" ] || curl -fsSL -o "$MODELS/kokoro-v1.0.onnx" "$REL/kokoro-v1.0.onnx"
[ -s "$MODELS/kokoro-timed.onnx" ] || python3 "$SRC/patch_kokoro.py" "$MODELS/kokoro-v1.0.onnx" "$MODELS/kokoro-timed.onnx"

# 3. narration (directed phrase-by-phrase read, takes auditioned and cached) → voice + edit timeline
python3 "$SRC/perform.py" "$MODELS" "$WORK" "$SRC/performance.json"
python3 "$SRC/make_timeline.py" "$WORK"

# 4. picture: ~1,700 frames of canvas motion graphics
rm -rf "$WORK/frames"
node "$SRC/render.js" "$WORK/timeline.json" "$WORK/frames"

# 5. sound design, score, mix
python3 "$SRC/audio.py" "$WORK"

# 6. encode
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$WORK/frames/f_%04d.png" -i "$WORK/mix.wav" \
  -vf "noise=alls=2:allf=t,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 19 -profile:v high -level 4.2 -g 30 -bf 2 -r 30 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -shortest -movflags +faststart "$OUT"
echo "done: $OUT"
