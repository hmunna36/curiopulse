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
    ("the record scratch (after 'hand.')", c["hand1_end"] + 0.04, c["hand1_end"] + 0.34),
    ("wah (after 'foot.')", c["foot2_end"] + 0.03, c["foot2_end"] + 0.31),
    ("ONE BOSS ding (after 'boss...')", c["boss_end"] + 0.04, c["boss_end"] + 0.19),
    ("SAME WAY ding (after 'way,')", c["way_end"] + 0.03, c["way_end"] + 0.15),
    ("the belt squeals (after 'six')", c["six2_end"] + 0.03, c["six2_end"] + 0.17),
    ("YOINK (after 'along.')", c["along_end"] + 0.03, c["along_end"] + 0.25),
    ("STILL CLOCKWISE tick (after 'hand.')", c["hand4_end"] + 0.03, c["hand4_end"] + 0.17),
    ("TWO BOSSES ding dong (after 'Easier,')", c["easier_end"] + 0.03, c["easier_end"] + 0.27),
    ("2023 STUDY page (after 'study,')", c["study_end"] + 0.04, c["study_end"] + 0.3),
    ("the fumble (after 'it.')", c["it_end"] + 0.04, c["it_end"] + 0.36),
    ("NOT BROKEN tick (after 'broken.')", c["broken_end"] + 0.03, c["broken_end"] + 0.17),
    ("meow (after 'copycat.')", c["meow"], c["meow"] + 0.4),
]
for name, a, b in GAGS:
    print(f"{name:42s} {db(x[int(a * sr):int(b * sr)]):6.1f} dB   ({a:.2f}-{b:.2f} s)")
