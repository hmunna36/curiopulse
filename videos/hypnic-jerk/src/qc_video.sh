#!/usr/bin/env bash
# QC for an exported Short: container/streams, exact frame count, frozen/black segments, loudness.
# Usage: qc_video.sh <file.mp4> <expected_frames>
set -euo pipefail
F="$1"; EXP="${2:-}"
ffmpeg -hide_banner -i "$F" 2>&1 | grep -E "Duration|Stream" || true
FR=$(ffmpeg -hide_banner -i "$F" -map 0:v -f null - 2>&1 | grep -oE 'frame= *[0-9]+' | tail -1 | grep -oE '[0-9]+')
AT=$(ffmpeg -hide_banner -i "$F" -map 0:a -f null - 2>&1 | grep -oE 'time=[0-9:.]+' | tail -1)
echo "video frames: $FR ${EXP:+(expected $EXP)}   audio $AT"
echo "--- static (>0.5 s) / black segments"
ffmpeg -hide_banner -i "$F" -vf "freezedetect=n=0.002:d=0.5,blackdetect=d=0.2:pix_th=0.08" -an -f null - 2>&1 |
  grep -E "freeze_start|freeze_duration|black_start" || echo "none"
echo "--- loudness"
ffmpeg -hide_banner -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):"
