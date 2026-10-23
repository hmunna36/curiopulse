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
DUR = tl["duration"]
db = lambda y: 20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-9)  # noqa: E731
ws = tl["words"]


def end_of(cue):
    return min(ws, key=lambda w: abs(w["start"] - c[cue]))["end"]


make_end = max(w["end"] for w in ws if w["start"] < c["about"] - 0.05)
GAGS = [
    ("a blep (after 'tongue?')", c["tongue1"] + 0.48, c["tongue1"] + 0.6),
    ("the big lunge: wee-up (after 'Try it.')", c["try1_end"] + 0.04, c["try1_end"] + 0.4),
    ("so close: squeak (after 'right?')", end_of("right") + 0.06, end_of("right") + 0.18),
    ("LEASH: yank + boing", c["leash_end"] + 0.02, c["leash_end"] + 0.4),
    ("tied: twang (after 'down,')", end_of("down") + 0.08, end_of("down") + 0.4),
    ("back: twang (after 'back.')", c["back_end"] + 0.06, c["back_end"] + 0.4),
    ("bonk: no bone (after 'inside,')", c["inside_end"] + 0.04, c["inside_end"] + 0.3),
    ("it stretches: boi-oing (after 'skinny.')", c["skinny_end"] + 0.02, c["skinny_end"] + 0.3),
    ("POINTY: ting", c["pointy_end"] + 0.03, c["pointy_end"] + 0.16),
    ("one made it: ding (after 'make it...')", make_end + 0.03, make_end + 0.26),
    ("1 IN 10: ding (after 'ten.')", c["ten_end"] + 0.04, c["ten_end"] + 0.18),
    ("the cards flip (after 'named it!')", c["named_end"] + 0.03, c["named_end"] + 0.17),
    ("five boings (after 'can.')", c["can2_end"] + 0.06, c["can2_end"] + 0.5),
    ("Made it? ... hm?", c["made_end"] + 0.12, c["made_end"] + 0.32),
    ("Show-off. ... hmph", c["showoff_end"] + 0.08, c["showoff_end"] + 0.34),
    ("try. ... blep, into the loop", c["try2_end"] + 0.06, c["try2_end"] + 0.15),
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
