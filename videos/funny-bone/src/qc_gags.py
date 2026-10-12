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
    ("the bang, frame 1 (before 'You')", 0.0, YOU - 0.02),
    ("the zap (after 'ZAP!')", c["zap_end"] + 0.03, c["zap_end"] + 0.36),
    ("wrong (after 'funny,')", c["notfunny_end"] + 0.03, c["notfunny_end"] + 0.21),
    ("wrong again (after 'bone,')", c["nota_end"] + 0.03, c["nota_end"] + 0.22),
    ("it answers to its name (after 'NERVE!')", c["nerve_end"] + 0.02, c["nerve_end"] + 0.17),
    ("the scratch (before 'except')", c["arm2_end"] + 0.02, c["arm2_end"] + 0.14),
    ("knock knock: bone (after 'bone,')", c["bone3_end"] + 0.03, c["bone3_end"] + 0.24),
    ("eep (after 'skin.')", c["skin_end"] + 0.03, c["skin_end"] + 0.12),
    ("a squashed toy (after 'it,')", c["squash_end"] + 0.012, c["squash_end"] + 0.09),
    ("the tingle (after 'PINKY,')", c["pinky_end"] + 0.02, c["pinky_end"] + 0.22),
    ("the end of it (after 'ends.')", c["ends_end"] + 0.03, c["ends_end"] + 0.18),
    ("ba-dum tss (after 'Humorous.')", c["rimshot"], c["rimshot"] + 0.42),
    ("a cricket (after 'the joke.')", c["joke_end"] + 0.09, c["joke_end"] + 0.4),
    ("wah (after 'LAUGHING.')", c["laughing_end"] + 0.06, c["laughing_end"] + 0.5),
    ("two steps, into the loop", c["loop"] + 0.04, DUR - 0.02),
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
