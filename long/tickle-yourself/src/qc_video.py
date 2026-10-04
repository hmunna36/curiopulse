"""QC for the exported video: streams, frame count, loudness/true peak of the file's own audio,
static stretches, and labelled review sheets. Needs ffmpeg + ffprobe on PATH.

Usage: python3 qc_video.py <file.mp4> <out_dir> [step_s=0.5]
"""
import json
import os
import subprocess
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from PIL import Image, ImageDraw
from scipy import signal

F, OUT = sys.argv[1], sys.argv[2]
STEP = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
os.makedirs(OUT, exist_ok=True)

info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", F],
                                 capture_output=True, check=True).stdout)
for s in info["streams"]:
    if s["codec_type"] == "video":
        print(f"video: {s['codec_name']} {s.get('profile')} {s['width']}x{s['height']} {s['r_frame_rate']} fps, "
              f"{s.get('nb_frames')} frames, pix {s['pix_fmt']}, {s.get('color_space')}")
    else:
        print(f"audio: {s['codec_name']} {s['sample_rate']} Hz {s['channels']} ch, {float(s['duration']):.3f}s")
dur = float(info["format"]["duration"])
print(f"container: {dur:.3f}s, {int(info['format']['size']) / 1e6:.1f} MB")

# loudness of the delivered audio
wav = os.path.join(OUT, "_qc.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", F, "-vn", "-c:a", "pcm_s24le", wav], check=True)
x, sr = sf.read(wav)
os.remove(wav)
loud = pyln.Meter(sr).integrated_loudness(x)
tp = 20 * np.log10(np.abs(signal.resample_poly(x, 4, 1, axis=0)).max())
print(f"loudness: {loud:.2f} LUFS integrated, true peak {tp:.2f} dBTP")

# frames every STEP s -> static check + review sheets
ts = np.arange(STEP / 2, dur, STEP)
thumbs, prev, static = [], None, []
for t in ts:
    p = os.path.join(OUT, "_f.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", F, "-frames:v", "1", "-vf", "scale=216:384", p], check=True)
    im = Image.open(p).convert("RGB")
    a = np.asarray(im, dtype=np.float32)
    if prev is not None and np.abs(a - prev).mean() < 0.6:
        static.append(round(t, 2))
    prev = a
    thumbs.append((t, im.copy()))
os.remove(p)
print(f"sampled {len(ts)} frames every {STEP}s; near-identical to the previous sample at: {static or 'none'}")
cols, per = 10, 50
for si in range(0, len(thumbs), per):
    chunk = thumbs[si:si + per]
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 216, rows * 404), (25, 25, 25))
    d = ImageDraw.Draw(sheet)
    for i, (t, im) in enumerate(chunk):
        x, y = (i % cols) * 216, (i // cols) * 404
        sheet.paste(im, (x, y + 20))
        d.text((x + 4, y + 4), f"{t:.1f}s", fill=(255, 255, 0))
    path = os.path.join(OUT, f"sheet_{si // per + 1}.png")
    sheet.save(path)
    print(path)
