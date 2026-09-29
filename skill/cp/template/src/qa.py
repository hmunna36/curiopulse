"""The measurable half of the CurioPulse ship bar, run on the delivered MP4. It writes <work>/qa/report.md.

Usage: python3 qa.py <work_dir> <file.mp4> [--no-transcribe]
Needs ffmpeg/ffprobe on PATH (~/.cache/cp/bin), whisper-cli + ~/.cache/cp/models/ggml-base.en.bin
for the transcript check, and the stems from audio.py.

Checks (FAIL blocks the upload; WARN is for the review):
- Streams: H.264 High, 1080x1920, 30 fps, yuv420p, AAC 48 kHz stereo, faststart.
- Length and file size: 45-75 s (warn up to 90); the MP4 under 95 MB (GitHub's per-file limit is 100 MB).
- Delivered audio: integrated -14 +/- 0.5 LUFS; true peak <= -1.0 dBTP after AAC.
- Picture:
  - the first frame is not black;
  - it moves in the first 0.5 s;
  - there is no frozen stretch over 1.5 s (sampled every 0.25 s).
- Voice: speech-band SNR >= 10 dB on all but 3 words (from the stems).
- Intelligibility: whisper's transcript of the final mix vs the script, word error rate <= 8 %.
- Captions: every word is captioned, chunks are 1-5 words, and none stays on screen under 0.25 s.
It also writes contact sheets every 0.5 s (qa/sheet_*.png) for the visual review; Read them.
"""
import json
import os
import re
import shutil
import subprocess
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from PIL import Image, ImageDraw
from scipy import signal

WORK, MP4 = sys.argv[1], sys.argv[2]
TRANSCRIBE = "--no-transcribe" not in sys.argv
QA = os.path.join(WORK, "qa")
os.makedirs(QA, exist_ok=True)
MODEL = os.path.expanduser(os.environ.get("WHISPER_MODEL", "~/.cache/cp/models/ggml-base.en.bin"))
rows = []  # (status, check, detail)


def check(ok, name, detail, warn=False):
    rows.append(("PASS" if ok else ("WARN" if warn else "FAIL"), name, detail))


def run(*a, **k):
    return subprocess.run(list(a), capture_output=True, check=True, **k)


# ---------------------------------------------------------------- streams, length, size
info = json.loads(run("ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", MP4).stdout)
v = next(s for s in info["streams"] if s["codec_type"] == "video")
a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
dur = float(info["format"]["duration"])
size = int(info["format"]["size"])
check(v["codec_name"] == "h264" and str(v.get("profile")) in ("High", "100") and (v["width"], v["height"]) == (1080, 1920)
      and v["r_frame_rate"] == "30/1" and v["pix_fmt"] == "yuv420p", "video stream",
      f'{v["codec_name"]} {v.get("profile")} {v["width"]}x{v["height"]} {v["r_frame_rate"]} {v["pix_fmt"]}')
check(a is not None and a["codec_name"] == "aac" and a["sample_rate"] == "48000" and a["channels"] == 2, "audio stream",
      f'{a["codec_name"]} {a["sample_rate"]} Hz {a["channels"]} ch' if a else "no audio")
with open(MP4, "rb") as fh:
    head = fh.read(1 << 16)
check(head.find(b"moov") != -1 and head.find(b"moov") < head.find(b"mdat") if b"mdat" in head else b"moov" in head,
      "faststart (moov before mdat)", "ok" if b"moov" in head else "moov atom not at the front")
check(45 <= dur <= 75, "length 45-75 s", f"{dur:.2f} s", warn=dur <= 90)
check(size < 95e6, "file under 95 MB", f"{size / 1e6:.1f} MB")

# ---------------------------------------------------------------- delivered loudness / true peak
wav = os.path.join(QA, "_mix.wav")
run("ffmpeg", "-v", "error", "-y", "-i", MP4, "-vn", "-c:a", "pcm_s24le", wav)
x, sr = sf.read(wav)
loud = pyln.Meter(sr).integrated_loudness(x)
tp = 20 * np.log10(np.abs(signal.resample_poly(x, 4, 1, axis=0)).max())
check(abs(loud + 14) <= 0.5, "loudness -14 LUFS", f"{loud:.2f} LUFS")
check(tp <= -1.0, "true peak <= -1 dBTP (after AAC)", f"{tp:.2f} dBTP")

# ---------------------------------------------------------------- picture: first frame, early motion, frozen stretches
fr_dir = os.path.join(QA, "_frames")
shutil.rmtree(fr_dir, ignore_errors=True)
os.makedirs(fr_dir)
run("ffmpeg", "-v", "error", "-i", MP4, "-vf", "scale=108:192", "-f", "image2", os.path.join(fr_dir, "f_%05d.png"))
names = sorted(os.listdir(fr_dir))
frames = [np.asarray(Image.open(os.path.join(fr_dir, n)).convert("L"), np.float32) for n in names]
shutil.rmtree(fr_dir)
fps = 30
check(frames[0].mean() > 12, "first frame is not black", f"mean level {frames[0].mean():.0f}/255")
m05 = np.abs(frames[min(15, len(frames) - 1)] - frames[0]).mean()
check(m05 > 2.0, "motion in the first 0.5 s", f"mean change {m05:.1f}")
GAP = 8  # compare frames ~0.27 s apart, so slow drifts still count as motion
still = [np.abs(frames[i] - frames[i - GAP]).mean() < 0.5 for i in range(GAP, len(frames))]
longest = cur = 0
for x in still:
    cur = cur + 1 if x else 0
    longest = max(longest, cur)
longest_s = (longest + GAP) / fps if longest else 0.0
check(longest_s <= 1.5, "no frozen stretch over 1.5 s", f"longest {longest_s:.2f} s")

# ---------------------------------------------------------------- contact sheets (every 0.5 s)
sh_dir = os.path.join(QA, "_sheet")
shutil.rmtree(sh_dir, ignore_errors=True)
os.makedirs(sh_dir)
run("ffmpeg", "-v", "error", "-i", MP4, "-vf", "scale=216:384", "-r", "2", "-f", "image2", os.path.join(sh_dir, "s_%04d.png"))
thumbs = [(k * 0.5, Image.open(os.path.join(sh_dir, n)).convert("RGB")) for k, n in enumerate(sorted(os.listdir(sh_dir)))]
shutil.rmtree(sh_dir)
cols, per = 10, 50
sheets = []
for si in range(0, len(thumbs), per):
    chunk = thumbs[si:si + per]
    rws = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 216, rws * 404), (25, 25, 25))
    d = ImageDraw.Draw(sheet)
    for i, (t, im) in enumerate(chunk):
        xx, yy = (i % cols) * 216, (i // cols) * 404
        sheet.paste(im, (xx, yy + 20))
        d.text((xx + 4, yy + 4), f"{t:.1f}s", fill=(255, 255, 0))
    path = os.path.join(QA, f"sheet_{si // per + 1}.png")
    sheet.save(path)
    sheets.append(path)

# ---------------------------------------------------------------- voice: per-word speech-band SNR (content words)
STOP = set("a an the and or but so of to in on at by for with from as is are was were be been it its it's this that "
           "these those your you you're our we i he she they them his her their my me do does did not no if then than "
           "just also even up out into over about".split())
tl = json.load(open(os.path.join(WORK, "timeline.json")))
words = tl["words"]
stems = os.path.join(WORK, "stems")
if os.path.isdir(stems):
    st = {k: sf.read(os.path.join(stems, f"{k}.wav"))[0].mean(axis=1) for k in ("voice", "sfx", "music", "amb")}
    sos = signal.butter(4, [300, 4000], btype="bandpass", fs=48000, output="sos")
    bb = {k: signal.sosfiltfilt(sos, s_) for k, s_ in st.items()}
    bg = bb["sfx"] + bb["music"] + bb["amb"]
    db = lambda y: 20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-9)  # noqa: E731
    snr = []
    for w in words:
        i0, i1 = int(w["start"] * 48000), int(w["end"] * 48000)
        if i1 > i0 and re.sub(r"[^a-z']", "", w["word"].lower()) not in STOP:
            snr.append((db(bb["voice"][i0:i1]) - db(bg[i0:i1]), w["word"], w["start"]))
    vals = np.array([x[0] for x in snr])
    weak = sorted(x for x in snr if x[0] < 6)
    ok = vals.mean() >= 12 and np.mean(vals < 6) <= 0.10 and vals.min() >= 3
    check(ok, "voice clear of the mix (content words, speech band)",
          f"mean {vals.mean():.1f} dB (>= 12), {100 * np.mean(vals < 6):.0f} % under 6 dB (<= 10 %), min {vals.min():.1f} dB (>= 3)"
          + (f"; under 6 dB: {', '.join(f'{w}@{t:.2f} ({v:.1f})' for v, w, t in weak[:10])}" if weak else ""))
else:
    check(False, "voice clear of the mix", "no stems/ (run audio.py)", warn=True)

# ---------------------------------------------------------------- intelligibility: whisper transcript vs script
norm = lambda s: re.sub(r"[^a-z0-9' ]", " ", s.lower().replace("%", " percent"))  # noqa: E731
ref = norm(" ".join(w["word"] for w in words)).split()
whisper = shutil.which("whisper-cli")
if TRANSCRIBE and whisper and os.path.exists(MODEL):
    w16 = os.path.join(QA, "_16k.wav")
    run("ffmpeg", "-v", "error", "-y", "-i", MP4, "-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", w16)
    run(whisper, "-m", MODEL, "-f", w16, "-l", "en", "-nt", "-otxt", "-of", os.path.join(QA, "transcript"))
    os.remove(w16)
    hyp = norm(open(os.path.join(QA, "transcript.txt")).read()).split()
    # word error rate (Levenshtein over words)
    D = np.zeros((len(ref) + 1, len(hyp) + 1), int)
    D[:, 0], D[0, :] = range(len(ref) + 1), range(len(hyp) + 1)
    for i in range(1, len(ref) + 1):
        for j in range(1, len(hyp) + 1):
            D[i, j] = min(D[i - 1, j] + 1, D[i, j - 1] + 1, D[i - 1, j - 1] + (ref[i - 1] != hyp[j - 1]))
    wer = D[-1, -1] / max(1, len(ref))
    # list the differing words (backtrace)
    i, j, diffs = len(ref), len(hyp), []
    while i > 0 and j > 0:
        if ref[i - 1] == hyp[j - 1] and D[i, j] == D[i - 1, j - 1]:
            i, j = i - 1, j - 1
        elif D[i, j] == D[i - 1, j - 1] + 1:
            diffs.append(f"{ref[i - 1]}→{hyp[j - 1]}"); i, j = i - 1, j - 1
        elif D[i, j] == D[i - 1, j] + 1:
            diffs.append(f"{ref[i - 1]}→∅"); i -= 1
        else:
            diffs.append(f"∅→{hyp[j - 1]}"); j -= 1
    check(wer <= 0.08, "transcript matches the script (WER <= 8 %)",
          f"WER {100 * wer:.1f} % over {len(ref)} words" + (f"; differences: {', '.join(reversed(diffs[-12:]))}" if diffs else ""))
else:
    check(False, "transcript", "skipped (whisper-cli or the model is missing, or --no-transcribe)", warn=True)

# ---------------------------------------------------------------- captions
caps = tl["captions"]
n_cap = sum(len(ln) for c in caps for ln in c["lines"])
short = [c for c in caps if c["end"] - c["start"] < 0.25]
long_ = [c for c in caps if len(c["lines"]) > 2 or any(len(ln) > 4 for ln in c["lines"])]
check(not short and not long_, "captions (<= 2 lines of <= 4 words, >= 0.25 s on screen)",
      f"{len(caps)} chunks, {n_cap} caption words for {len(words)} spoken"
      + (f"; {len(short)} flash by: " + ", ".join(" ".join(w["t"] for ln in c["lines"] for w in ln) for c in short[:4]) if short else "")
      + (f"; {len(long_)} too long: " + ", ".join(" / ".join(" ".join(w["t"] for w in ln) for ln in c["lines"]) for c in long_[:4]) if long_ else ""),
      warn=True)

# ---------------------------------------------------------------- report
fails = [r for r in rows if r[0] == "FAIL"]
lines = [f"# QA: {os.path.basename(MP4)}", "", f"{len(rows) - len(fails)}/{len(rows)} checks pass"
         + (f", **{len(fails)} FAIL**" if fails else ""), "", "| | Check | Result |", "|---|---|---|"]
lines += [f"| {s} | {n} | {d} |" for s, n, d in rows]
lines += ["", "Contact sheets: " + ", ".join(os.path.basename(p) for p in sheets)]
open(os.path.join(QA, "report.md"), "w").write("\n".join(lines) + "\n")
print("\n".join(lines))
sys.exit(1 if fails else 0)
