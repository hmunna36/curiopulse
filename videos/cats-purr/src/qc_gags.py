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
    ("mrrp, frame 1 (before 'You')", 0.0, 0.12),
    ("the purr alone (after 'purrs.')", c["purrs_end"] + 0.04, c["happy"] - 0.13),
    ("the purr (after 'RIGHT?')", c["right_end"] + 0.04, c["maybe"] - 0.13),
    ("... stopped (after 'Maybe,')", c["maybe_end"] + 0.02, c["but"] - 0.03),
    ("the purr (after 'means...')", c["means_end"] + 0.04, c["look"] - 0.13),
    ("the breath in (after 'in')", c["in_end"] + 0.03, c["and"] - 0.1),
    ("the breath out (after 'out.')", c["out_end"] + 0.03, c["kittens"] - 0.1),
    ("kittens purring (after 'birth,')", c["birth_end"] + 0.04, c["eyes"] - 0.13),
    ("mew! (after 'shut.')", c["mew"], c["mew"] + 0.2),
    ("the purr at the vet's (after 'happy...')", c["happy2_end"] + 0.04, c["or"] - 0.13),
    ("the purr in the cone (after 'HURT.')", c["hurt_end"] + 0.04, c["and_hungry"] - 0.13),
    ("a snore (after 'hungry?')", c["hungry_end"] + 0.03, c["she2"] - 0.1),
    ("the cry in the purr (after 'it,')", c["it_end"] + 0.03, c["pitched"] - 0.1),
    ("the cry, alone (after 'baby's.')", c["wah"], c["wah"] + 0.44),
    ("the bowl (after 'cat.')", c["serve"] + 0.06, c["serve"] + 0.2),
    ("ta-da (after 'staff.')", c["fanfare"], c["fanfare"] + 0.34),
    ("munching and purring", c["munch"], c["loop"] - 0.05),
    ("subscribe click", c["sub_tap"], c["sub_tap"] + 0.09),
]
ws = tl["words"]
sp = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in ws])
print(f"narration while speaking: {db(sp):.1f} dB")
for name, a, b in GAGS:
    if b <= a:
        print(f"{name:42s} no room ({a:.2f}-{b:.2f})")
        continue
    seg = x[int(a * sr):int(b * sr)]
    v = db(seg)
    words = [w["word"] for w in ws if w["start"] < b - 0.01 and w["end"] > a + 0.01]
    flag = "" if -25 <= v <= -15 else ("  << quiet" if v < -25 else "  << loud")
    print(f"{name:42s} {a:6.2f}-{b:6.2f}  {v:6.1f} dB{flag}" + (f"   (narration in the window: {' '.join(words)})" if words else ""))
