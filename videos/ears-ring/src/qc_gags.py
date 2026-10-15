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
    ("the band, frame 1 (before 'You')", 0.0, YOU - 0.01),
    ("the last chord (after 'concert,')", c["stop"], c["stop"] + 0.09),
    ("the ring alone (before 'and now'... after the chord)", c["concert_end"] + 0.45, c["concert_end"] + 0.5),
    ("finger squelch (after 'RINGING.')", c["poke"] + 0.02, c["poke"] + 0.26),
    ("the ring in the pause (after 'ears...')", c["ears2_end"] + 0.05, c["ears2_end"] + 0.3),
    ("feedback squeal (after 'ELEVEN.')", c["eleven_end"] + 0.03, c["eleven_end"] + 0.33),
    ("tap tap (after 'DOWN?')", c["tap"][0], c["tap"][1] + 0.12),
    ("static (after 'static.')", c["static_end"] + 0.03, c["thats"] - 0.1),
    ("the ring out of the amp (after 'ring.')", c["ring2_end"] + 0.05, c["ring2_end"] + 0.4),
    ("the silent room (after 'me?')", c["believe_end"] + 0.05, c["put"] - 0.03),
    ("sad slide (after 'die.')", c["die_end"] + 0.03, c["die_end"] + 0.35),
    ("bok bok BAGAWK (after 'theirs.')", c["theirs_end"] + 0.02, c["so2"] - 0.07),
    ("squish squish (after 'earplugs...')", c["earplugs_end"] + 0.03, c["earplugs_end"] + 0.3),
    ("the band again (after 'chicken.')", c["bang"], DUR),
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
