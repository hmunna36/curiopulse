"""How loud is each joke sound in the mix? RMS of mix.wav in the gag's own window (a pause of the narration).
A sound that carries a joke wants about -19 ... -24 dB in its gap (the voice is about -16). Only gags that have a pause
to themselves are listed: a window with narration in it measures the narrator.
Usage: python3 qc_gags.py <work_dir>  (breathe-swallow: the gags of this Short)"""
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
    ("frame 0: the swallow (before 'Can')", 0.0, ws[0]["start"] - 0.01),
    ("BONK: the second puffs (before 'Can't')", c["gulp2"] + 0.42, c["cant"] - 0.01),
    ("HEY! squeak (after 'line.')", c["hey"], c["one"] - 0.02),
    ("SLAM (after 'slams')", c["slam"], c["shut"] - 0.01),
    ("WHOOSH: the air back (after 'SHUT.')", c["reopen"], c["ever"] - 0.02),
    ("KOFF! (after 'pipe?')", c["cough"], nxt(c["cough"]) - 0.01),
    ("KOFF! the drop blasted out (after 'LATE.')", c["blast"], c["stop"] - 0.02),
    ("the whistle (after 'thinking.')", c["thinking1_end"] + 0.04, c["now"] - 0.26),
    ("the record scratch (before 'Now')", c["now"] - 0.24, c["now"] - 0.01),
    ("GULP by hand (before 'Sorry.')", c["gulp_b"], c["sorry"] - 0.01),
    ("the tail: the swallow into frame 0 (after 'Sorry.')", c["sorry_end"] + 0.02, DUR),
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
