"""The measurable half of the CurioPulse ship bar, run on the delivered MP4. It writes <work>/qa/report.md.

Usage: python3 qa.py <work_dir> <file.mp4> [--no-transcribe]
Needs ffmpeg/ffprobe on PATH (~/.cache/cp/bin), whisper-cli + ~/.cache/cp/models/ggml-base.en.bin
for the transcript check, and the stems from audio.py.

Checks (FAIL blocks the upload; WARN is for the review):
- Streams: H.264 High, 1080x1920, 30 fps, yuv420p, AAC 48 kHz stereo, faststart.
- Length and file size: the band of the Short's length arm, read from ../publish.json "length" (`yt.mjs next-slot`
  says which; the length test of 5 Oct 2026). standard: 43-50 s passes, over 55 s fails, anything else warns.
  short: 30-35 s passes, over 37 s fails, anything else warns. The MP4 under 95 MB (GitHub's per-file limit is 100 MB).
- Opening (5 Oct 2026, from the channel's retention curves): the `answer` block starts by 5.0 s (warns to 6.0, fails
  later or when there is no such block); the first word is "You"/"Your" (a warning only).
- Subscribe aside: the word "subscribe" of the `sub` block lands at 50-70 % of the runtime (warns at 40-80 %, fails
  outside or when it is missing) and the aside is 45 characters or less (warns to 60).
- Delivered audio: integrated -14 +/- 0.5 LUFS; true peak <= -1.0 dBTP after AAC.
- Picture:
  - the first frame is not black;
  - it moves in the first 0.5 s;
  - there is no frozen stretch over 1.5 s (sampled every 0.25 s).
- Voice: speech-band SNR >= 10 dB on all but 3 words (from the stems).
- Intelligibility: whisper's transcript of the final mix vs the script, word error rate <= 8 %.
- Captions: every word is captioned, chunks are 1-5 words, and none stays on screen under 0.25 s.
It also writes contact sheets every 0.5 s (qa/sheet_*.png) for the visual review, and qa/safe_sheet.png: the hook,
every shot, the subscribe cue and the last frame with the Shorts safe-area mask on them (bin/safe-area.py; red =
covered by the YouTube UI or cropped, green = the key-content zone). Read them all.
The true peak is ITU-R BS.1770's: the largest sample after 4x oversampling (scipy), measured next to pyloudnorm's
integrated loudness on the AAC decoded from the MP4; the report names the moment of the peak.
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
# the length this Short was built for: "length": {"arm": "short" | "standard"} in publish.json, next to the MP4
ARMS = {"standard": (43.0, 50.0, 55.0), "short": (30.0, 35.0, 37.0)}   # passes from, passes to, fails above
try:
    arm = (json.load(open(os.path.join(os.path.dirname(os.path.abspath(MP4)), "publish.json"))).get("length") or {}).get("arm")
except Exception:
    arm = None
arm = arm if arm in ARMS else "standard"
lo, hi, top = ARMS[arm]
check(lo <= dur <= hi, f"length {lo:.0f}-{hi:.0f} s ({arm} arm)", f"{dur:.2f} s", warn=dur <= top)
check(size < 95e6, "file under 95 MB", f"{size / 1e6:.1f} MB")

# ---------------------------------------------------------------- delivered loudness / true peak
wav = os.path.join(QA, "_mix.wav")
run("ffmpeg", "-v", "error", "-y", "-i", MP4, "-vn", "-c:a", "pcm_s24le", wav)
x, sr = sf.read(wav)
loud = pyln.Meter(sr).integrated_loudness(x)
up = np.abs(signal.resample_poly(x, 4, 1, axis=0))                     # BS.1770 true peak: 4x oversampled
tpi, tpc = np.unravel_index(np.argmax(up), up.shape)
tp = 20 * np.log10(up[tpi, tpc] + 1e-12)
check(abs(loud + 14) <= 0.5, "loudness -14 LUFS", f"{loud:.2f} LUFS")
check(tp <= -1.0, "true peak <= -1 dBTP (after AAC)", f"{tp:.2f} dBTP at {tpi / (4 * sr):.2f} s ({'LR'[tpc] if up.shape[1] == 2 else tpc})")

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
# every decoded frame, then every 15th (output "-r 2" picks frames ~0.6 s late, so the labels drifted)
run("ffmpeg", "-v", "error", "-i", MP4, "-vf", "scale=216:384", "-f", "image2", os.path.join(sh_dir, "s_%05d.png"))
frames = sorted(os.listdir(sh_dir))
thumbs = [(k / 30, Image.open(os.path.join(sh_dir, frames[k])).convert("RGB")) for k in range(0, len(frames), 15)]
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

# ---------------------------------------------------------------- safe-area sheet (informational; ship-bar item 7b)
safe_note = ""
try:
    tl_ = json.load(open(os.path.join(WORK, "timeline.json")))
    cues_ = tl_.get("cues", {})
    times = [0.1, 1.0, 2.0] + [s_["start"] + min(0.6, (s_["end"] - s_["start"]) / 2) for s_ in tl_["shots"][1:]]
    for k_ in ("sub_in", "sub_tap", "sub_out"):   # the pill popping in, SUBSCRIBED, and the frame after it has gone
        if isinstance(cues_.get(k_), (int, float)):
            times.append(cues_[k_] + 0.3)
    times = sorted({round(min(max(0.0, t_), dur - 0.05), 2) for t_ in times + [dur - 0.05]})[:24]
    tool = next((p_ for p_ in (os.environ.get("CP_SAFE_AREA", ""), os.path.expanduser("~/.claude/skills/cp/bin/safe-area.py"),
                               os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "skill", "cp", "bin", "safe-area.py"))
                 if p_ and os.path.isfile(p_)), None)
    if tool:
        sa_dir = os.path.join(QA, "_safe")
        shutil.rmtree(sa_dir, ignore_errors=True)
        os.makedirs(sa_dir)
        for t_ in times:
            run("ffmpeg", "-v", "error", "-y", "-ss", f"{t_:.3f}", "-i", MP4, "-frames:v", "1", "-vf", "scale=540:960",
                os.path.join(sa_dir, f"t_{t_:06.2f}.png"))
        stills = sorted(os.path.join(sa_dir, f) for f in os.listdir(sa_dir))
        run(sys.executable, tool, "overlay", *stills, "--out", sa_dir)
        tiles = [(os.path.basename(p_)[2:8], Image.open(p_[:-4] + ".safe.png").convert("RGB").resize((270, 480))) for p_ in stills]
        cols_ = 6
        sheet = Image.new("RGB", (cols_ * 270, ((len(tiles) + cols_ - 1) // cols_) * 500), (25, 25, 25))
        d_ = ImageDraw.Draw(sheet)
        for i_, (lab, im) in enumerate(tiles):
            xx, yy = (i_ % cols_) * 270, (i_ // cols_) * 500
            sheet.paste(im, (xx, yy + 20))
            d_.text((xx + 4, yy + 4), f"{float(lab):.2f}s", fill=(255, 255, 0))
        sheet.save(os.path.join(QA, "safe_sheet.png"))
        shutil.rmtree(sa_dir)
        safe_note = f"Safe-area sheet: safe_sheet.png ({len(tiles)} frames: hook, every shot, the subscribe cue, the end)"
    else:
        safe_note = "Safe-area sheet: skipped (bin/safe-area.py not found)"
except Exception as e:  # never let the review sheet break the gate
    safe_note = f"Safe-area sheet: skipped ({e})"

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
# one word, two spellings: whisper writes the American one whatever the script uses (spicy-food, 7 Oct 2026: four
# "chilli" in 70 words would have cost 5.7 % WER for a word it heard every time). Both sides are mapped to one spelling.
SPELL = {"chili": "chilli", "chilis": "chillies", "chilies": "chillies", "chiles": "chillies", "color": "colour",
         "colors": "colours", "flavor": "flavour", "odor": "odour", "gray": "grey", "fiber": "fibre", "fibers": "fibres",
         "liter": "litre", "meter": "metre", "meters": "metres", "tumor": "tumour", "mold": "mould",
         # whisper writes a spoken number as digits ("number 10", "30 feet", "100 times"): the word was said right
         "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
         "10": "ten", "11": "eleven", "12": "twelve", "20": "twenty", "30": "thirty", "40": "forty", "50": "fifty",
         "100": "hundred", "1000": "thousand", "smelier": "smellier"}
_spell = lambda ws: [SPELL.get(w, w) for w in ws]  # noqa: E731
ref = _spell(norm(" ".join(w["word"] for w in words)).split())
whisper = shutil.which("whisper-cli")
if TRANSCRIBE and whisper and os.path.exists(MODEL):
    w16 = os.path.join(QA, "_16k.wav")
    # whisper drops the words that straddle its fixed 30 s windows ("In one study" at 29.4 s in brain-freeze),
    # so transcribe in pieces of <= 28 s cut in the pauses between words, and join the text
    gaps = [(words[k]["end"] + words[k + 1]["start"]) / 2 for k in range(len(words) - 1)
            if words[k + 1]["start"] - words[k]["end"] >= 0.2]
    cuts, start = [0.0], 0.0
    while dur - start > 28:
        ok_ = [g for g in gaps if start + 5 < g <= start + 28]
        start = ok_[-1] if ok_ else start + 28
        cuts.append(start)
    cuts.append(dur + 1)
    text = []
    for k in range(len(cuts) - 1):
        run("ffmpeg", "-v", "error", "-y", "-ss", f"{cuts[k]:.3f}", "-t", f"{cuts[k + 1] - cuts[k]:.3f}", "-i", MP4,
            "-vn", "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", w16)
        run(whisper, "-m", MODEL, "-f", w16, "-l", "en", "-nt", "-otxt", "-of", os.path.join(QA, "_piece"))
        text.append(open(os.path.join(QA, "_piece.txt")).read().strip())
    os.remove(w16); os.remove(os.path.join(QA, "_piece.txt"))
    open(os.path.join(QA, "transcript.txt"), "w").write("\n".join(text) + "\n")
    hyp = _spell(norm(" ".join(text)).split())
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

# ---------------------------------------------------------------- the opening and the subscribe aside (story.md, narration.md)
said = lambda ws: " ".join(w["word"] for w in ws)  # noqa: E731
first = re.sub(r"[^a-z']", "", words[0]["word"].lower())
check(first in ("you", "your", "you're", "you've", "you'll"), 'opens with "You..." + a physical action',
      f'first words: "{said(words[:7])}"', warn=True)
ans = [w for w in words if w.get("block") == "answer"]
if ans:
    check(ans[0]["start"] <= 5.0, "the answer starts by 5 s", f'"{said(ans)[:70]}" starts at {ans[0]["start"]:.2f} s',
          warn=ans[0]["start"] <= 6.0)
else:
    check(False, "the answer starts by 5 s", "script.txt has no `## answer` block (the answer line, started by 5.0 s)")
subw = [w for w in words if w.get("block") == "sub"]
sub_t = next((w["start"] for w in subw if "subscrib" in w["word"].lower()), None)
if sub_t is not None and isinstance(tl.get("cues", {}).get("sub_in"), (int, float)):
    k = sub_t / dur
    check(0.50 <= k <= 0.70, 'subscribe aside in the middle (the word at 50-70 % of the runtime)',
          f'"subscribe" at {sub_t:.2f} s = {100 * k:.0f} % of {dur:.2f} s; the pill pops in at {tl["cues"]["sub_in"]:.2f} s',
          warn=0.40 <= k <= 0.80)
    check(len(said(subw)) <= 45, "subscribe aside is 45 characters or less", f'{len(said(subw))}: "{said(subw)}"',
          warn=len(said(subw)) <= 60)
else:
    check(False, "subscribe aside in the middle (the word at 50-70 % of the runtime)",
          'no `## sub` block that says "subscribe", or no sub_in cue in the timeline')

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
lines += ["", "Contact sheets: " + ", ".join(os.path.basename(p) for p in sheets)] + ([safe_note] if safe_note else [])
open(os.path.join(QA, "report.md"), "w").write("\n".join(lines) + "\n")
print("\n".join(lines))
sys.exit(1 if fails else 0)
