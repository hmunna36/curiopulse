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
    ("the lid lands (before 'You')", c["clap"], c["clap"] + 0.06),
    ("two pips (after 'glows!')", c["blinks"][0], c["blinks"][1] + 0.1),
    ("the stick pops up (after 'stick...')", c["stick_end"] + 0.06, c["stick_end"] + 0.28),
    ("its buzz (after 'wings.')", c["buzz"], c["buzz"] + 0.2),
    ("SNAP (after 'trick.')", c["crack"], c["crack"] + 0.1),
    ("the lamp is on (after 'glow.')", c["glow_end"] + 0.04, c["glow_end"] + 0.28),
    ("the buzzer (after 'flame.')", c["cross"], c["cross"] + 0.2),
    ("the thermometer's ping (after 'heat.')", c["cool"], c["cool"] + 0.12),
    ("DING (after 'him.')", c["ding"], c["ding"] + 0.28),
    ("two pips (after 'blinking?')", c["pips"][0], c["pips"][1] + 0.09),
    ("the tap opens (after 'oxygen.')", c["reopen"], c["reopen"] + 0.2),
    ("two pips (after 'code.')", c["code_end"] + 0.05, c["code_end"] + 0.27),
    ("the long flash (after 'own...')", c["own_end"] + 0.04, c["own_end"] + 0.16),
    ("his two flashes (after 'flashes,')", c["hisflash"][0], c["hisflash"][1] + 0.08),
    ("her flash (after 'back.')", c["herflash"], c["herflash"] + 0.2),
    ("subscribe click", c["sub_tap"], c["sub_tap"] + 0.09),
    ("the switch + a cricket (after 'dark.')", c["dark_end"] + 0.03, c["dark_end"] + 0.3),
    ("the fake flash (after 'answer.')", c["fakeflash"], c["fakeflash"] + 0.11),
    ("hearts (after 'date...')", c["date_end"] + 0.05, c["date_end"] + 0.35),
    ("she chews (after 'him.')", c["crunch"], c["crunch"] + 0.2),
    ("the burp", c["burp"], c["burp"] + 0.16),
    ("hm (after 'Why?')", c["why_end"] + 0.04, c["why_end"] + 0.2),
    ("the lick (after 'tastes')", c["slurp"], c["slurp"] + 0.2),
    ("ptooey (after 'spiders.')", c["yuck"], c["yuck"] + 0.24),
    ("tiptoe (after 'Now...')", c["now_end"] + 0.05, c["now_end"] + 0.44),
    ("it leaves (after 'she.')", c["nope"], c["nope"] + 0.3),
    ("fork on the glass (after 'jar?')", c["taps"][0], c["taps"][2] + 0.12),
    ("hmph (after 'night.')", c["huff"], c["huff"] + 0.24),
    ("two notes at the end", c["huff"] + 0.34, c["huff"] + 0.9),
]
ws = tl["words"]
sp = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in ws])
print(f"narration while speaking: {db(sp):.1f} dB")
for name, a, b in GAGS:
    seg = x[int(a * sr):int(b * sr)]
    v = db(seg)
    flag = "" if -25 <= v <= -15 else ("  << quiet" if v < -25 else "  << loud")
    print(f"{name:40s} {a:6.2f}-{b:6.2f}  {v:6.1f} dB{flag}")
