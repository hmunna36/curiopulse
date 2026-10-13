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
    ("the rub, frame 1 (before 'You')", 0.0, YOU - 0.01),
    ("a glass run (after 'stars.')", c["stars_end"] + 0.04, c["stars_end"] + 0.4),
    ("the phone, first ring (after 'brain.')", c["ring1"], c["ring1"] + 0.2),
    ("the phone, second ring", c["ring2"], c["ring2"] + 0.2),
    ("picked up", c["ring2"] + 0.2, c["ring2"] + 0.3),
    ("two light up (after 'sensors')", c["sensors_end"] + 0.06, c["sensors_end"] + 0.32),
    ("they breathe in (before 'LIGHT!')", c["word_end"] + 0.03, c["word_end"] + 0.25),
    ("light! light! (after 'LIGHT!')", c["echo"][0], c["echo"][1] + 0.14),
    ("a squashed squeak (after 'squished...')", c["squished_end"] + 0.02, c["squished_end"] + 0.13),
    ("light! light! light! (after 'anyway.')", c["chorus"][0], c["chorus"][2] + 0.11),
    ("hm? (after 'check,')", c["check_end"] + 0.04, c["check_end"] + 0.18),
    ("fireworks (after 'fireworks.')", c["pops"][0], c["pops"][2] + 0.2),
    ("eep (after 'eyeball...')", c["poke"], c["poke"] + 0.13),
    ("the rings (after 'rings.')", c["rings_end"] + 0.06, c["rings_end"] + 0.52),
    ("the tune stops (before 'Do')", SHOT["dont"] - 0.01, SHOT["dont"] + 0.1),
    ("wah (after 'that.')", c["that_end"] + 0.04, c["that_end"] + 0.34),
    ("the bodkin on the floor", c["that_end"] + 0.36, c["that_end"] + 0.52),
    ("a ray (after 'shut...')", c["zip1"], c["zip1"] + 0.14),
    ("a ray (after 'rays,')", c["zip2"], c["zip2"] + 0.14),
    ("the same call, first ring (after 'call.')", c["ring3"], c["ring3"] + 0.2),
    ("the same call, second ring", c["ring4"], c["ring4"] + 0.2),
    ("three small stars (after 'gently...')", c["twinkle"], c["twinkle"] + 0.28),
    ("wah (after 'upgrade.')", c["upgrade_end"] + 0.05, c["upgrade_end"] + 0.3),
    ("his yawn", c["yawn"] + 0.2, c["yawn"] + 0.7),
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
