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


GAGS = [
    ("move? ... hm?", end_of("move") + 0.08, end_of("move") + 0.3),
    ("Nope. ... nuh-uh", end_of("nope") + 0.06, end_of("nope") + 0.3),
    ("smear... a wobbly woo", end_of("smear") + 0.02, end_of("smear") + 0.32),
    ("so, ... snip (the left cut)", c["so1_end"] + 0.02, c["so1_end"] + 0.16),
    ("SNIP. ... SNIP (the right cut)", c["snip_end"] + 0.05, c["snip_end"] + 0.22),
    ("snip. ... ting! THERE", c["snip2_end"] + 0.04, c["snip2_end"] + 0.17),
    ("hole. ... ting", c["hole_end"] + 0.04, c["hole_end"] + 0.17),
    ("the 1st tick (in 'this clock')", c["tick1"], c["tick1"] + 0.05),
    ("the 3rd tick", c["tick3"], c["tick3"] + 0.05),
    ("right? ... squeak", end_of("right2") + 0.08, end_of("right2") + 0.18),
    ("convinced? ... hmm?", end_of("convinced") + 0.06, end_of("convinced") + 0.32),
]
voice = [db(x[int(w["start"] * sr):int(w["end"] * sr)]) for w in ws if w["end"] - w["start"] > 0.15]
print(f"voice (median word): {np.median(voice):.1f} dB")
for name, a, b in GAGS:
    seg = x[int(a * sr):int(min(b, DUR) * sr)]
    print(f"{name:38s} {a:6.2f}-{b:6.2f}  {db(seg):6.1f} dB")
