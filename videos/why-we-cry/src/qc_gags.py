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
GAGS = [
    ("the sniff, frame 1 (before 'You're')", 0.0, 0.11),
    ("the sob (after 'leak!')", c["sob"], c["sob"] + 0.30),
    ("the dog: hm? (after 'backup.')", c["huh"], c["huh"] + 0.30),
    ("the bell's ring (after 'brain,')", c["brain_end"] + 0.03, c["brain_end"] + 0.14),
    ("the gush (after 'eye.')", c["gush"], c["gush"] + 0.26),
    ("glug glug (after 'eye')", c["in_each"] + 0.82, c["in_each"] + 1.09),
    ("the gurgle (after 'nose...')", c["gurgle"], c["gurgle"] + 0.30),
    ("HONK (after 'too.')", c["honk"], c["honk"] + 0.44),
    ("the spotlight (after 'face,')", c["spot"], c["spot"] + 0.12),
    ("the shutter (after 'it.')", c["shutter"], c["shutter"] + 0.12),
    ("the eraser pops up (after 'works.')", c["snap"], c["snap"] + 0.10),
    ("needle 1 (after 'sadness...')", c["drop1"], c["drop1"] + 0.28),
    ("needle 2 (after 'helping.')", c["drop2"], c["drop2"] + 0.26),
    ("the elephant (before 'As')", SHOT["only"] + 0.05, SHOT["only"] + 0.25),
    ("the tissue (after 'feelings.')", c["trunk"] + 0.1, c["trunk"] + 0.5),
    ("the dog's whine (after 'most...')", c["whine"] + 0.1, c["whine"] + 0.44),
    ("ding (after 'up.')", c["ding"], c["ding"] + 0.3),
    ("the lick (before 'Some')", c["lick"], c["lick"] + 0.34),
    ("subscribe click (under 'backup.')", c["sub_tap"], c["sub_tap"] + 0.09),
    ("two notes (after 'backup.')", c["backup3_end"] + 0.42, c["backup3_end"] + 1.1),
]
ws = tl["words"]
sp = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in ws])
print(f"narration while speaking: {db(sp):.1f} dB")
for name, a, b in GAGS:
    seg = x[int(a * sr):int(b * sr)]
    v = db(seg)
    words = [w["word"] for w in ws if w["start"] < b - 0.01 and w["end"] > a + 0.01]
    flag = "" if -25 <= v <= -15 else ("  << quiet" if v < -25 else "  << loud")
    print(f"{name:38s} {a:6.2f}-{b:6.2f}  {v:6.1f} dB{flag}" + (f"   (narration in the window: {' '.join(words)})" if words else ""))
