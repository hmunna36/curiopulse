"""Narration QC in the speech band: which words sit well under the rest between 300 Hz and 4 kHz?
A phone's speaker has little below 300 Hz, so a word that drops into the chest (a deadpan sentence ending) can read
fine on a full-band meter and still be faint. Lists the words more than 7 dB under the narration's median in that band,
and prints the band's level in 0.1 s frames for any block named on the command line.
Usage: python3 qc_inband.py <work_dir> [block id ...]      (after voice.py: reads narration.wav + words.json)
A flagged word with a window under ~0.12 s ("You", "So", a drawn-out first word) is the alignment, not the voice."""
import json
import sys

import numpy as np
import soundfile as sf
from scipy import signal

W = sys.argv[1]
x, sr = sf.read(f"{W}/narration.wav")
m = json.load(open(f"{W}/words.json"))
sos = signal.butter(4, [300, 4000], btype="bandpass", fs=sr, output="sos")
xb = signal.sosfiltfilt(sos, x)
d = lambda y: 10 * np.log10((y ** 2).mean() + 1e-12)  # noqa: E731
lv = [d(xb[int(w["start"] * sr):int(w["end"] * sr)]) for w in m["words"]]
med = float(np.median(lv))
print(f"median word level, 300-4000 Hz: {med:.1f} dB; words more than 7 dB under it:")
for w, v in zip(m["words"], lv):
    if v < med - 7:
        a, b = int(w["start"] * sr), int(w["end"] * sr)
        short = "  (short window: check the alignment)" if w["end"] - w["start"] < 0.12 else ""
        print(f'  {w["block"]:8s} {w["start"]:6.2f} {w["word"]:14s} in band {v:6.1f}  full band {d(x[a:b]):6.1f}{short}')
for bid in sys.argv[2:]:
    blk = next(b for b in m["blocks"] if b["id"] == bid)
    hop = int(0.1 * sr)
    seg = xb[int(blk["start"] * sr):int(blk["end"] * sr)]
    fr = seg[: len(seg) // hop * hop].reshape(-1, hop)
    print(f'{bid} ({blk["start"]:.2f}-{blk["end"]:.2f} s), 0.1 s frames:', " ".join(f"{10 * np.log10((f ** 2).mean() + 1e-12):.0f}" for f in fr))
