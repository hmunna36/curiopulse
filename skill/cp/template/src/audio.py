"""__TITLE__ Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.
"""
import json
import os
import sys

import numpy as np  # noqa: F401

import sfxlib as L
from sfxkit import *  # noqa: F401,F403  (atoms, groove/drone/crash/bwomp/silence, span/gate, Bus, db, pan_st...)
from mixlib import master

WORK = sys.argv[1]
TL = json.load(open(os.path.join(WORK, "timeline.json")))
C = TL["cues"]
SHOT = {s["id"]: s["start"] for s in TL["shots"]}
END = {s["id"]: s["end"] for s in TL["shots"]}
DUR = TL["duration"]
N = int(round(DUR * SR))
L.set_length(N)
tt = ar(N)

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C

# ================================================================= ambience (one bed per world, gated to its shots)
room_on = gate(N, [(0, DUR)])
amb.x += pan_st(filt(brown(N, 1), "lowpass", 220), 0) * 0.3 * room_on

# ================================================================= the hook (motion + sound on frame 1)
sfx.add(pan_st(whoosh(0.28, 300, 2400, 20, 0.9), 0), 0.0, db(-12))

# ================================================================= per shot: whooshes on cuts, hits on reveals
for i, s in enumerate(TL["shots"][1:]):
    sfx.add(pan_st(whoosh(0.28, 400 + 150 * (i % 4), 2400, 500 + i), 0), s["start"] - 0.2, db(-18))

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is mid-video now, so the narration carries on right after the word "subscribe".
# The click sits in the pause after the word (cues["sub_tap"]); nothing here may mask a word (qa.py lists weak words).
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-22))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-24))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-18))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-30))

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.5, DUR - 0.2, BPM, ["F", "Bb", "C", "F"], gain=-4, seed=10)
silence(mus, [])  # [(C["punch"], C["punch_end"] + 0.5), ...]

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
