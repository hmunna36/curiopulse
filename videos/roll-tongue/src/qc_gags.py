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
could_end = max(w["end"] for w in ws if w["start"] < c["one2"] - 0.05)
GAGS = [
    ("a blep (after 'tongue?')", c["tongue1_end"] + 0.04, c["tongue1_end"] + 0.15),
    ("the tries (after 'now.')", c["now1_end"] + 0.05, c["cant"] - 0.05),
    ("Can't? wah + thud (after 'Can't?')", c["cant_end"] + 0.04, c["cant_end"] + 0.38),
    ("Mum and Dad look away (after 'parents.')", c["parents1_end"] + 0.05, c["parents1_end"] + 0.34),
    ("bonk: no bone (after 'bones.')", c["bones_end"] + 0.03, c["bones_end"] + 0.2),
    ("the octopus curls (after 'arm.')", c["arm_end"] + 0.02, c["arm_end"] + 0.18),
    ("TUBE! ding (after 'ONCE.')", c["once_end"] + 0.03, c["once_end"] + 0.18),
    ("his flops: wah (after 'ONCE.')", c["once_end"] + 0.2, c["once_end"] + 0.46),
    ("ONE GENE: ding (after 'parents.')", c["parents2_end"] + 0.03, c["parents2_end"] + 0.15),
    ("twins: boing boing (after 'twins?')", c["twins_end"] + 0.03, c["twins_end"] + 0.3),
    ("one could: fwip (after 'could,')", could_end + 0.03, could_end + 0.12),
    ("one couldn't: wah-wah (after 'couldn't.')", c["couldnt_end"] + 0.03, c["couldnt_end"] + 0.33),
    ("SEND (after 'ADOPTED.')", c["adopted_end"] - 0.0, c["adopted_end"] + 0.45),
    ("sent: ding", c["adopted_end"] + 0.42, c["adopted_end"] + 0.54),
    ("aww (after 'not.')", c["not_end"] + 0.03, c["not_end"] + 0.26),
    ("try again: the tries (after 'again.')", c["again_end"] + 0.05, DUR - 0.05),
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
