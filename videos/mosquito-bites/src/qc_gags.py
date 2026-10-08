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
SHOT = {s["id"]: s["start"] for s in tl["shots"]}
DUR = tl["duration"]
db = lambda y: 20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-9)  # noqa: E731
GAGS = [
    ("frame 1: the whine at his cheek", 0.0, 0.1),
    ("the swarm (after 'bites!')", c["bites_end"] + 0.1, c["bites_end"] + 0.44),
    ("buzzer (after 'blood.')", c["blood_end"] + 0.06, c["blood_end"] + 0.26),
    ("the guest flies in (after 'like...')", c["like_end"] + 0.08, c["like_end"] + 0.48),
    ("service bell (after 'dinner.')", c["dinner_end"] + 0.04, c["dinner_end"] + 0.3),
    ("sonar ping (after 'breath')", c["breath_end"] + 0.06, c["breath_end"] + 0.3),
    ("locked on + take-off (after 'away.')", c["away_end"] + 0.03, c["away_end"] + 0.28),
    ("dun-dun (after 'suspect?')", c["suspect_end"] + 0.02, c["suspect_end"] + 0.26),
    ("sparkle (after 'acids...')", c["acids_end"] + 0.02, c["acids_end"] + 0.2),
    ("wind-up (before 'WAY')", c["way"] - 0.27, c["way"] - 0.03),
    ("they pour in (after 'more.')", c["more_end"] + 0.04, c["more_end"] + 0.34),
    ("the gate (after 'study,')", c["study_end"] + 0.1, c["study_end"] + 0.22),
    ("drum roll (after 'was')", c["volunteer_end"] + 0.33, c["volunteer_end"] + 0.69),
    ("wah-wah (after 'years.')", c["years_end"] + 0.04, c["years_end"] + 0.38),
    ("subscribe click", c["sub_tap"], c["sub_tap"] + 0.09),
    ("pee-yew (after 'smellier.')", c["smellier_end"] + 0.04, c["smellier_end"] + 0.32),
    ("a prize (after 'experiment,')", c["exp_end"] + 0.04, c["exp_end"] + 0.32),
    ("the cage opens (after 'mosquitoes')", c["mosq2_end"] + 0.01, c["mosq2_end"] + 0.18),
    ("mwah, mwah (after 'cheese')", c["cheese2_end"] + 0.06, c["cheese2_end"] + 0.3),
    ("ding-ding (after 'feet.')", c["feet_end"] + 0.06, c["feet_end"] + 0.5),
    ("buzzer (after 'sweet.')", c["sweet2_end"] + 0.07, c["sweet2_end"] + 0.27),
    ("drum roll (after \"You're...\")", c["youre_end"] + 0.06, c["youre_end"] + 0.46),
    ("the button: springs, cutlery, bwomp", c["board_end"] + 0.03, c["board_end"] + 0.5),
    ("the stare: one cricket", c["board_end"] + 0.62, c["board_end"] + 0.74),
    ("the whine back into frame 1", DUR - 0.3, DUR - 0.01),
]
ws = tl["words"]
sp = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in ws])
print(f"narration while speaking: {db(sp):.1f} dB")
a0, b0 = int(c["slap"] * sr), int((c["slap"] + 0.1) * sr)
print(f'{"THE SLAP (on the word, first 100 ms)":38s} {c["slap"]:6.2f}-{c["slap"] + 0.1:6.2f}  {db(x[a0:b0]):6.1f} dB')
for name, a, b in GAGS:
    seg = x[int(a * sr):int(b * sr)]
    v = db(seg)
    flag = "" if -25 <= v <= -15 else ("  << quiet" if v < -25 else "  << loud")
    print(f"{name:38s} {a:6.2f}-{b:6.2f}  {v:6.1f} dB{flag}")
