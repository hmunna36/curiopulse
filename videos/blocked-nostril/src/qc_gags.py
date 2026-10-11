"""How loud is each joke sound in the mix? RMS of mix.wav in the gag's own window (a pause of the narration).
A sound that carries a joke wants about -19 ... -24 dB in its gap (the voice is about -16). Only gags that have a pause
to themselves are listed: a window with narration in it measures the narrator.
Usage: python3 qc_gags.py <work_dir>"""
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
GAGS = [
    ("the finger and the sniff, frame 1 (before 'You')", 0.0, YOU - 0.01),
    ("a stuffed honk (after 'blocked.')", c["honk"], c["honk"] + 0.2),
    ("air through the other one (after 'Relax,')", c["relax_end"] + 0.015, c["your"] - 0.03),
    ("the shop bell (after 'shifts,')", c["shifts_end"] + 0.02, c["shifts_end"] + 0.13),
    ("a snore (after 'break.')", c["snore"], c["snore"] + 0.24),
    ("the balloon squeak (after 'shut,')", c["squeak"], c["squeak"] + 0.17),
    ("air goes through (after 'wide.')", c["wide_end"] + 0.03, c["wide_end"] + 0.22),
    ("the clock, wound on (after 'hours...')", c["hours_end"] + 0.02, c["they"] - 0.05),
    ("the shift bell (after 'swap.')", c["ding"], c["ding"] + 0.26),
    ("a sniffle (before 'You mostly')", SHOT["cold"] + 0.015, SHOT["cold"] + 0.125),
    ("wah wah (after 'both.')", c["gasp"], c["gasp"] + 0.38),
    ("the jar (after 'Weirder:')", c["weirder_end"] + 0.02, c["weirder_end"] + 0.15),
    ("zip (after 'fast,')", c["fast_end"] + 0.02, c["fast_end"] + 0.11),
    ("a lazy slide (after 'slow,')", c["slow_end"] + 0.03, c["slow_end"] + 0.2),
    ("mint, then petrol (after 'differently.')", c["yuck"], c["yuck"] + 0.36),
    ("two taps on his nose (after 'Go on...')", c["on_end"] + 0.07, c["on_end"] + 0.43),
    ("the shift bell again (after 'now.')", c["now_end"] + 0.08, c["now_end"] + 0.34),
    ("subscribe click", c["sub_tap"], c["sub_tap"] + 0.09),
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
