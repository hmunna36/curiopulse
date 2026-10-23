"""What Happens If You Stop Eating? (Day by Day) (long-form): sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example (a Short, the same kit): skill/cp/reference/examples/audio.finger-wrinkles.py in this repo.
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
# quiet on purpose: it sits under the spoken subscribe line and must not mask the word.
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-20))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-22))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-16))
        sfx.add(pan_st(bell(1760, 1.2, 0.5), 0), c["sub_tap"] + 0.08, db(-22))

# ================================================================= score: the reward rhythm (the every-second rule, 15 Oct 2026)
# The music follows the scene table instead of sitting under it (reference/long-form.md, "The every-second rule"):
# - SECTIONS: one entry per stretch, each with its own energy (chords, half time, arp or not, cutoff, gain); a change
#   at least every 30 s (qa.py flags 30 s of flat music). Stretches may overlap a beat for a crossfade.
# - every cue named "pay_*" gets a short riser into it and a bright hit on it; every "big_*" a long riser, 0.6 s of
#   held breath (the score drops out) and then a crash and a low boom. Tune the gains by ear; keep the voice clear.
# - on_beat(t): the nearest beat of the score's grid. Time the cuts and the big visual events to it in
#   make_timeline.py (the shot phrases and `special`), so the edit lands on the music.
BPM = 112
BEAT = 60.0 / BPM
T0 = 0.5                                             # the score's first beat
on_beat = lambda t: T0 + round((t - T0) / BEAT) * BEAT  # noqa: E731
SECTIONS = [  # (start, end, groove keyword arguments): REPLACE from the scene table, one row per stretch
    (T0, DUR - 0.2, dict(chords=["F", "Bb", "C", "F"], gain=-4)),
]
for i_, (a_, b_, kw_) in enumerate(SECTIONS):
    groove(mus, a_, b_, BPM, seed=10 + i_, **kw_)
PAYOFFS = sorted((t_, k_) for k_, t_ in C.items() if isinstance(t_, (int, float)) and k_.startswith(("pay_", "big_")))
held = []
for t_, k_ in PAYOFFS:
    big_ = k_.startswith("big_")
    r_ = 2.6 if big_ else 0.9                        # the build: long into the big ones, short into the small ones
    sfx.add(pan_st(riser(r_, seed=int(t_ * 7), f0=180 if big_ else 400, f1=1800 if big_ else 2400), 0), t_ - r_, db(-21 if big_ else -27))
    if big_:
        held.append((t_ - 0.6, t_ - 0.02))           # the held breath before the biggest moments
    else:
        sfx.add(pan_st(bell(1568 + 196 * (int(t_) % 3), 0.5, 0.25), 0), t_, db(-26))   # a bright little reward
silence(mus, held + [])  # + the punchlines: [(C["punch"], C["punch_end"] + 0.5), ...]
for t_, k_ in PAYOFFS:                               # the hits go in AFTER the silences, so they are never muted
    if k_.startswith("big_"):
        crash(mus, t_, gain=-16, seed=int(t_))
        mus.add(pan_st(thump(0.9, 90, 38, 0.35, seed=int(t_)), 0), t_, db(-12))
    else:
        mus.add(kick(0.8), t_, db(-18))

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
