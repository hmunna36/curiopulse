#!/usr/bin/env bash
# Rebuild videos/lightning-strike/lightning-strike-short.mp4 from scratch.
# Needs: python3 (numpy scipy pillow soundfile onnx kokoro-onnx pyloudnorm),
# node + playwright (Chromium), ffmpeg with libx264. Network only for the
# one-time font + TTS model downloads.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$SRC/../.work}"
MODELS="${MODELS:-$WORK/models}"
OUT="$SRC/../lightning-strike-short.mp4"
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

# 2. narration model: Kokoro-82M (Apache-2.0), patched to report phoneme durations
REL=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -s "$MODELS/voices-v1.0.bin" ] || curl -fsSL -o "$MODELS/voices-v1.0.bin" "$REL/voices-v1.0.bin"
[ -s "$MODELS/kokoro-v1.0.onnx" ] || curl -fsSL -o "$MODELS/kokoro-v1.0.onnx" "$REL/kokoro-v1.0.onnx"
[ -s "$MODELS/kokoro-timed.onnx" ] || python3 "$SRC/patch_kokoro.py" "$MODELS/kokoro-v1.0.onnx" "$MODELS/kokoro-timed.onnx"

# 3. voice + word timings -> edit timeline
python3 "$SRC/tts.py" "$MODELS" "$WORK" af_heart 1.25
python3 "$SRC/make_timeline.py" "$WORK"

# 4. picture: 300 frames from the canvas scenes
rm -rf "$WORK/frames"
node "$SRC/render.js" "$WORK/timeline.json" "$WORK/frames"

# 5. sound design, score, mix (-14 LUFS, -1.2 dBTP)
python3 "$SRC/audio.py" "$WORK"

# 6. encode
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$WORK/frames/f_%04d.png" -i "$WORK/mix.wav" \
  -vf "noise=alls=2:allf=t,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -crf 17 -profile:v high -level 4.2 -g 30 -bf 2 -r 30 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 256k -ar 48000 -ac 2 -t 10 -movflags +faststart "$OUT"
echo "done: $OUT"
