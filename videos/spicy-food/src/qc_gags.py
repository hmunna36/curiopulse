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
db = lambda y: 20 * np.log10(np.sqrt((y ** 2).mean()) + 1e-9)  # noqa: E731
GAGS = [
    ("the crunch (frame 1)", c["bite"], c["bite"] + 0.13),
    ("the fire's roar (after FIRE!)", c["fire_end"], c["fire_end"] + 0.42),
    ("thermometer beeps", c["tick"], c["tick"] + 0.24),
    ("the alarm bell (after 'alarm.')", c["alarm_end"] + 0.03, END["alarm"]),
    ("spoon ting", c["spoon"] - 0.2, c["spoon"] - 0.04),
    ("three alarms (after 'soup.')", c["soup_end"] + 0.03, END["sensor"]),
    ("CLICK (after 'them...')", c["click_snd"], c["click_snd"] + 0.09),
    ("the alarm, no heat (after 'key.')", c["key_end"] + 0.03, END["key"]),
    ("klaxon (after 'FIRE...')", c["fire2_end"] + 0.02, c["fire2_end"] + 0.2),
    ("sprinkler pop", SHOT["sweat"] - 0.03, SHOT["sweat"] + 0.05),
    ("tss-tss (after 'sprinklers.')", c["spr_end"] + 0.03, c["sub_in"] - 0.02),
    ("subscribe click", c["sub_tap"], c["sub_tap"] + 0.09),
    ("the chilli's snicker", c["meant_end"] + 0.03, c["meant_end"] + 0.36),
    ("the bird's tweet", c["feel_end"] + 0.03, c["feel_end"] + 0.24),
    ("the mouse bites", c["at"] - 0.4, c["at"] - 0.24),
    ("crosshair lock (mouse)", c["at"] - 0.22, c["at"] - 0.12),
    ("EEK + whoosh", c["mammals_end"] + 0.04, c["mammals_end"] + 0.3),
    ("crosshair lock (him)", c["you_end"] + 0.04, c["you_end"] + 0.14),
    ("his gulp", c["you_end"] + 0.3, c["you_end"] + 0.5),
    ("boing + ta-da", c["extra_end"] + 0.03, c["extra_end"] + 0.4),
]
ws = tl["words"]
sp = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in ws])
print(f"narration while speaking: {db(sp):.1f} dB")
for name, a, b in GAGS:
    seg = x[int(a * sr):int(b * sr)]
    v = db(seg)
    flag = "" if -25 <= v <= -15 else ("  << quiet" if v < -25 else "  << loud")
    print(f"{name:34s} {a:6.2f}-{b:6.2f}  {v:6.1f} dB{flag}")
