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
c = json.load(open(f"{W}/timeline.json"))["cues"]
db = lambda y: 20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-9)  # noqa: E731
GAGS = [
    ("the wobble (before 'Bent,')", c["bent"] - 0.47, c["bent"] - 0.11),
    ("huh? (after 'right?')", c["right"] + 0.32, c["right"] + 0.52),
    ("copier beep beep (after 'homework.')", c["homework_end"] + 0.04, c["homework_end"] + 0.24),
    ("into his head (after 'brain.')", c["brain_end"] + 0.02, c["brain_end"] + 0.24),
    ("a tiny voice (after 'bridge...')", c["bridge_end"] + 0.03, c["bridge_end"] + 0.23),
    ("it lands: boing (after 'across.')", c["across_end"] + 0.03, c["across_end"] + 0.33),
    ("Proof? ding (after 'Proof?')", c["proof_end"] + 0.06, c["proof_end"] + 0.2),
    ("wrong-answer buzzer (after 'YOU.')", c["you_end"] + 0.03, c["you_end"] + 0.35),
    ("Weirder? spooky slide", c["weirder_end"] + 0.04, c["weirder_end"] + 0.34),
    ("the wobble (after 'line...')", c["line2_end"] + 0.04, c["line2_end"] + 0.38),
    ("oooo (after 'hand.')", c["hand_end"] + 0.04, c["hand_end"] + 0.5),
    ("NOT CLUMSY tick (after 'clumsy.')", c["clumsy_end"] + 0.03, c["clumsy_end"] + 0.17),
    ("psst (after 'cheating.')", c["cheating_end"] + 0.03, c["cheating_end"] + 0.35),
]
for name, a, b in GAGS:
    print(f"{name:42s} {db(x[int(a * sr):int(b * sr)]):6.1f} dB   ({a:.2f}-{b:.2f} s)")
