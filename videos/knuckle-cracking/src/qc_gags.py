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
    ("last small tick (push, | and)", c["crk"][5], c["crk"][5] + 0.05),
    ("the door bangs open", c["door"], c["door"] + 0.13),
    ("Mom, scolding", c["mom"], c["no"] - 0.07),
    ("the verdict's ding", c["tick"], c["tick"] + 0.26),
    ("psst (after 'soda.')", c["psst"], c["psst"] + 0.36),
    ("fizz (after 'gas.')", c["gas_end"] + 0.03, c["gas_end"] + 0.28),
    ("stretch squeak (after 'it...')", c["stretch_end"] + 0.03, c["stretch_end"] + 0.2),
    ("the needle (after 'drops...')", c["drops_end"] + 0.02, c["drops_end"] + 0.25),
    ("the pop (after 'POP!')", c["pop_snd"], c["pop_snd"] + 0.16),
    ("the bubble's ding", c["bubble_end"] + 0.04, c["bubble_end"] + 0.3),
    ("the winch, last clicks (after 'MRI...')", c["ratchet"], c["ratchet"] + 0.16),
    ("the scan's crack (after 'crack.')", c["on_crack_end"] + 0.03, c["on_crack_end"] + 0.15),
    ("subscribe click", c["sub_tap"], c["sub_tap"] + 0.09),
    ("doctor's crack 1 (after 'far.')", c["dcrack_snd"][0], c["dcrack_snd"][0] + 0.14),
    ("doctor's crack 2 (after 'hand,')", c["dcrack_snd"][1], c["dcrack_snd"][1] + 0.13),
    ("doctor's crack 3 (after 'years.')", c["dcrack_snd"][2], c["dcrack_snd"][2] + 0.14),
    ("drum roll in the pause", c["arth_end"] + 0.03, c["neither"] - 0.03),
    ("the all-clear (after 'hand.')", c["neither_end"] + 0.04, c["neither_end"] + 0.36),
    ("the MYTH stamp", SHOT["button"] + 0.3, SHOT["button"] + 0.42),
    ("Mom: hmph", c["hmph"], c["hmph"] + 0.2),
    ("the door shuts", c["loop"] + 0.14, c["loop"] + 0.27),
    ("his fingers lock again", DUR - 0.3, DUR - 0.02),
]
ws = tl["words"]
sp = np.concatenate([x[int(w["start"] * sr):int(w["end"] * sr)] for w in ws])
print(f"narration while speaking: {db(sp):.1f} dB")
a0, b0 = int(c["crack"] * sr), int((c["crack"] + 0.12) * sr)
print(f'{"THE CRACK (on the word, first 120 ms)":34s} {c["crack"]:6.2f}-{c["crack"] + 0.12:6.2f}  {db(x[a0:b0]):6.1f} dB')
for name, a, b in GAGS:
    seg = x[int(a * sr):int(b * sr)]
    v = db(seg)
    flag = "" if -25 <= v <= -15 else ("  << quiet" if v < -25 else "  << loud")
    print(f"{name:34s} {a:6.2f}-{b:6.2f}  {v:6.1f} dB{flag}")
