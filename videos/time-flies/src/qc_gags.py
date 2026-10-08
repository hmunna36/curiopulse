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
    ("the party horn (after 'again!')", c["horn"], c["horn"] + 0.4),
    ("the dive into his head", SHOT["brain"] - 0.28, SHOT["brain"] - 0.02),
    ("shutter (after 'memories.')", c["snap_snd"], c["snap_snd"] + 0.12),
    ("shutter (after 'kid,')", c["first_snd"][0], c["first_snd"][0] + 0.12),
    ("bike bell (after 'new...')", c["is_new_end"] + 0.02, c["is_new_end"] + 0.12),
    ("shutter + the frog", c["first_snd"][1], c["first_snd"][1] + 0.22),
    ("shutter 3", c["first_snd"][2], c["first_snd"][2] + 0.12),
    ("record scratch (after 'forever.')", c["forever_end"] + 0.03, c["forever_end"] + 0.23),
    ("page torn off (after 'Now?')", c["now_end"] + 0.05, c["now_end"] + 0.2),
    ("page 2 (after 'desk,')", c["desk_end"] + 0.03, c["desk_end"] + 0.14),
    ("the bite (after 'lunch...')", c["lunch_end"] + 0.03, c["lunch_end"] + 0.2),
    ("the snore (after 'bother.')", c["snore"], c["snore"] + 0.26),
    ("the tape is tugged (before 'tiny')", c["looks_end"] + 0.03, c["looks_end"] + 0.3),
    ("plink + cricket (after 'tiny.')", c["plink"], c["plink"] + 0.3),
    ("subscribe click", c["sub_tap"], c["sub_tap"] + 0.09),
    ("helmet strap (after 'weirder.')", c["strap"], c["strap"] + 0.1),
    ("the net (after 'tower...')", c["net"], c["net"] + 0.2),
    ("+36 % rings (after 'longer.')", c["ding"], c["ding"] + 0.3),
    ("shutter (after 'new.')", c["click3"], c["click3"] + 0.12),
    ("candle notes (after 'Or...')", c["tune"][0], c["tune"][1] + 0.3),
    ("the tune's end (after 'birthday.')", c["tune"][2], c["tune"][5] + 0.3),
    ("he breathes in (the loop)", c["loop"] + 0.05, DUR - 0.03),
]
ws = tl["words"]
sp = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in ws])
print(f"narration while speaking: {db(sp):.1f} dB")
for name, a, b in GAGS:
    seg = x[int(a * sr):int(b * sr)]
    v = db(seg)
    flag = "" if -25 <= v <= -15 else ("  << quiet" if v < -25 else "  << loud")
    print(f"{name:36s} {a:6.2f}-{b:6.2f}  {v:6.1f} dB{flag}")
