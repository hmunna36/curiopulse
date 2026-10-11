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
    ("the screech, frame 1 (before 'You')", 0.0, YOU - 0.02),
    ("brrr (after 'cringe.')", c["cringe_end"] + 0.04, c["cringe_end"] + 0.44),
    ("the screech again (before 'LOUDER')", c["screech_end"] + 0.03, c["louder"] - 0.09),
    ("... LOUDER (after it)", c["louder_end"] + 0.04, c["louder_end"] + 0.36),
    ("boosted (after 'that band.')", c["band2_end"] + 0.05, c["band2_end"] + 0.33),
    ("the bottle's note (after 'across.')", c["toot"], c["toot"] + 0.3),
    ("the siren (after 'knob...')", c["knob_end"] + 0.05, c["cranks"] - 0.1),
    ("the loudest screech (after 'UP.')", c["up_end"] + 0.05, c["up_end"] + 0.35),
    ("the SAME scrape, band muted (after 'band...')", c["scrape2"], c["scrape2"] + 0.3),
    ("no big deal (after 'mind.')", c["mind_end"] + 0.05, c["mind_end"] + 0.3),
    ("? (after 'band?')", c["why_end"] + 0.03, c["why_end"] + 0.14),
    ("a scream (after 'live.')", c["live_end"] + 0.06, c["live_end"] + 0.48),
    ("modern music: four notes (after 'music...')", c["music_end"] + 0.06, c["music_end"] + 0.5),
    ("not bad at all (after 'less.')", c["less_end"] + 0.05, c["less_end"] + 0.3),
    ("the meter complains (after 'sweated.')", c["sweated_end"] + 0.07, c["sweated_end"] + 0.42),
    ("the brain claps (after 'it.')", c["bought_end"] + 0.05, c["bought_end"] + 0.32),
    ("the spring (after 'not.')", c["sproing"], c["sproing"] + 0.5),
    ("the screech, into the loop", c["loop"] + 0.02, DUR - 0.02),
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
