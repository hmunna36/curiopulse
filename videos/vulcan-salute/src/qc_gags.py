"""How loud is each joke sound in the mix? RMS of mix.wav in the gag's own window (a pause of the narration).
A sound that carries a joke wants about -19 ... -24 dB in its gap (the voice is about -16). Only gags that have a pause
to themselves are listed: a window with narration in it measures the narrator.
Usage: python3 qc_gags.py <work_dir>  (vulcan-salute: the gags of this Short)"""
import json
import sys

import numpy as np
import soundfile as sf

W = sys.argv[1]
x, sr = sf.read(f"{W}/mix.wav")
x = x.mean(axis=1)
tl = json.load(open(f"{W}/timeline.json"))
c = tl["cues"]
END = {s["id"]: s["end"] for s in tl["shots"]}
SHOT = {s["id"]: s["start"] for s in tl["shots"]}
DUR = tl["duration"]
db = lambda y: 20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-9)  # noqa: E731
ws = tl["words"]
YOU = ws[0]["start"]
nxt = lambda t: min([w["start"] for w in ws if w["start"] > t + 0.005] + [DUR])   # the next word after t
GAGS = [
    ("sproing: jazz hands (after 'fingers,')", c["fingers1"] + 0.6, c["two1"] - 0.01),
    ("NOPE buzzer (after 'two')", c["two1"] + 0.28, c["and1"] - 0.01),
    ("BONK: they give up (after 'TWO.')", c["two2_end"] + 0.06, c["cant"] - 0.01),
    ("whoosh: he turns it round (after 'Can't?')", c["cant_end"] + 0.02, c["your_mid"] - 0.01),
    ("the heart: two notes (after 'hands...')", c["hands_end"] + 0.02, c["under"] - 0.01),
    ("TWANG: the strap (after 'strap.')", c["strap_end"] + 0.03, c["and_brain"] - 0.01),
    ("TEAM ta-da (after 'team.')", c["team_end"] + 0.02, c["in_lab"] - 0.01),
    ("bwomp: the worst two (after 'alone.')", c["alone_end"] + 0.05, c["the_ring"] - 0.01),
    ("hmm? (after 'finger?')", c["ringq_end"] + 0.03, c["dead"] - 0.01),
    ("sad slide (after 'last.')", c["last_end"] + 0.03, c["even"] - 0.01),
    ("the V clicks (after 'hand...')", c["hand1_end"] + 0.03, c["off"] - 0.01),
    ("ding + deflate (after 'camera.')", c["camera_end"] + 0.03, c["using"] - 0.2),
    ("record scratch (before 'Using')", c["using"] - 0.22, c["using"] - 0.01),
    ("let go + boing (after 'you?')", c["you_end"] + 0.12, c["you_end"] + 0.6),
]
sp = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in ws])
print(f"narration while speaking: {db(sp):.1f} dB")
for name, a, b in GAGS:
    if b <= a:
        print(f"{name:50s} no room ({a:.2f}-{b:.2f})")
        continue
    seg = x[int(a * sr):int(b * sr)]
    v = db(seg)
    words = [w["word"] for w in ws if w["start"] < b - 0.01 and w["end"] > a + 0.01]
    flag = "" if -25 <= v <= -15 else ("  << quiet" if v < -25 else "  << loud")
    print(f"{name:50s} {a:6.2f}-{b:6.2f}  {v:6.1f} dB{flag}" + (f"   (narration in the window: {' '.join(words)})" if words else ""))
