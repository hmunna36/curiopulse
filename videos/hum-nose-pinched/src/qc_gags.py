"""How loud is each joke sound in the mix? RMS of mix.wav in the gag's own window (a pause of the narration).
A sound that carries a joke wants about -19 ... -24 dB in its gap (the voice is about -16). Only gags that have a pause
to themselves are listed: a window with narration in it measures the narrator.
Usage: python3 qc_gags.py <work_dir>  (hum-nose-pinched: the gags of this Short)"""
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
    ("his hum, frame 1 (before 'Hum')", 0.0, ws[0]["start"] - 0.01),
    ("the hum, after 'me...' (with her 'mmm' next)", c["mmm"] - 0.28, c["mmm"] - 0.02),
    ("mmMP! the choke + the cheeks balloon (after 'nose.')", c["choke"], c["gone"] - 0.02),
    ("the padlock springs off, pfff (after 'door.')", c["letgo"], c["hum2"] - 0.02),
    ("zip! (after 'shut.')", c["zip"], nxt(c["zip"]) - 0.01),
    ("the nose squeaks (after 'it,')", c["squeak"], nxt(c["squeak"]) - 0.01),
    ("the cheeks balloon (after 'puff...')", c["balloon"], c["till"] - 0.02),
    ("ding: = (after 'lungs.')", c["lungs_end"] + 0.03, c["noflow"] - 0.02),
    ("the air freezes (after 'flow...')", c["freeze"], c["nobuzz"] - 0.02),
    ("the silence, then pfff (after 'buzz.')", c["stop"], c["weirder"] - 0.02),
    ("a curious pluck (after 'Weirder?')", c["weirder"] + 0.52, nxt(c["weirder"] + 0.52) - 0.01),
    ("clean: sparkle (after 'face.')", c["face1_end"] + 0.02, c["breathing"] - 0.02),
    ("the tape runs back (after 'Breathing?')", c["rewind"], c["barely"] - 0.02),
    ("the bunny snores (after 'them.')", c["snore"], c["encore_in"] - 0.02),
    ("the encore: hum, pop, wheee (after 'encore.')", c["blast"], DUR),
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
