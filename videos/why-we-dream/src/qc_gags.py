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
    ("the alarm, frame 1 (before 'You')", 0.0, 0.09),
    ("the snicker (after 'pajamas!')", c["snick"] - 0.02, c["snick"] + 0.30),
    ("the whistle (after 'drill.')", c["whistle"], c["whistle"] + 0.17),
    ("CLUNK (after 'off.')", c["clunk"], c["clunk"] + 0.12),
    ("the cricket (after the clunk)", c["clunk"] + 0.13, c["clunk"] + 0.30),
    ("the penguin (after 'pajamas.')", c["squeak"], c["squeak"] + 0.17),
    ("two notes (after 'higher.')", c["tada"], c["tada"] + 0.26),
    ("subscribe click", c["sub_tap"], c["sub_tap"] + 0.09),
    ("the padlocks (after 'legs,')", c["locks"], c["locks"] + 0.20),
    ("the snore (after 'head.')", c["head_end"] + 0.10, c["head_end"] + 0.44),
    ("the spring (after 'Usually.')", c["pop"], c["pop"] + 0.30),
    ("the alarm, rising", c["rise"] + 0.2, c["loop"]),
    ("the alarm, the dream again", c["loop"], DUR - 0.02),
]
ws = tl["words"]
sp = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in ws])
print(f"narration while speaking: {db(sp):.1f} dB")
for name, a, b in GAGS:
    seg = x[int(a * sr):int(b * sr)]
    v = db(seg)
    flag = "" if -25 <= v <= -15 else ("  << quiet" if v < -25 else "  << loud")
    print(f"{name:36s} {a:6.2f}-{b:6.2f}  {v:6.1f} dB{flag}")
