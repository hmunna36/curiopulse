"""Why Does an Octopus Have THREE Hearts? 🐙 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The world is four metres under water: a low swell with bubbles, the octopus's ba-dum running under everything (it stops
when its big heart stops), a playful marimba-and-pizzicato score that drops out for every punchline.
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
WORDS = TL["words"]
PM = pause_mask(WORDS, N)        # 1 in the pauses, 0 under the words


def edges(y, lo=250, hi=5200):
    """only what a word can sit on: under `lo` Hz and over `hi` Hz"""
    return filt(y, "lowpass", lo) + filt(y, "highpass", hi)


def soft(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


# ================================================================= the water (one bed for the whole Short)
swell = 0.75 + 0.25 * np.sin(2 * np.pi * tt * (round(DUR * 0.18) / DUR))
water = filt(brown(N, 1), "lowpass", 210) * swell + 0.25 * filt(pink(N, 2), "bandpass", [6000, 11000]) * (0.6 + 0.4 * np.sin(2 * np.pi * tt * 0.31))
amb.x += pan_st(water, 0) * 0.35
# far bubbles: tiny high ticks all through (above 5.2 kHz, they can sit on words)
rng = np.random.default_rng(7)
for k in range(46):
    ti = rng.uniform(0.2, DUR - 0.3)
    bed.add(pan_st(filt(drip(k, rng.uniform(5800, 7800)), "highpass", 5200), rng.uniform(-0.7, 0.7)), ti, db(-30))

# ================================================================= the octopus's hearts: ba-dum on every beat, low
for b in C["beats"]:
    if b < SHOT["hook"] + 0.1:
        continue
    loud = -21 if (SHOT["xray"] <= b < END["third"] or SHOT["swim"] <= b < END["swim"]) else -27
    bed.add(pan_st(heartbeat(int(b * 10) % 97, 1.0), 0.15), b - 0.12, db(loud - 3))     # the gill hearts, a hair early
    bed.add(pan_st(heartbeat(int(b * 10) % 89, 1.0), -0.1), b, db(loud))                # the big heart

# ================================================================= the hook
sfx.add(pan_st(edges(whoosh(0.28, 300, 2400, 20, 0.9), 300, 5200), 0), 0.0, db(-14))
sfx.add(pan_st(heartbeat(3, 1.2), -0.3), c["one"] + 0.05, db(-12))            # his ONE heart (low: it sits on the word)
sfx.add(pan_st(filt(pew(0.10, 3, 7400, 5600), "highpass", 5200), -0.3), c["one"] + 0.08, db(-24))
hk = [c["has"] - 0.05 + 0.16, c["has"] + 0.38 + 0.16, c["three"] - 0.12 + 0.16]
for i, tk in enumerate(hk):                                                    # each raised arm brings a heart: thump + a glint
    sfx.add(pan_st(heartbeat(11 + i, 1.0), 0.3), tk, db(-13 + i))
    sfx.add(pan_st(glint(6000 + 600 * i, 0.09, i), 0.3), tk + 0.02, db(-22))
# ta-da in the gap after THREE
for j, m in enumerate((72, 76, 79, 84)):
    sfx.add(pan_st(fade(marimba(mtof(m), 0.26, 40 + j), 0.001, 0.08), 0.1 * (j - 1.5)), c["three_end"] + 0.01 + 0.04 * j, db(-15))
sfx.add(pan_st(filt(np.asarray(cymbal(5, 0.5))[0], "highpass", 5200), 0.2), c["three_end"] + 0.18, db(-26))

# ================================================================= the glass octopus
sfx.add(pan_st(edges(whoosh(0.3, 500, 3000, 31), 300, 5200), 0), SHOT["xray"] - 0.22, db(-15))
for i in range(9):                                                             # the x-ray shimmer (all above 5.2 kHz)
    sfx.add(pan_st(glint(5600 + 300 * i, 0.08, 50 + i), 0.5 * np.sin(i)), SHOT["xray"] + 0.03 * i, db(-24))
for i, tk in enumerate((c["just"], c["just"] + 0.12)):                         # GILL HEART tags
    sfx.add(pan_st(glint(6400 - 400 * i, 0.08, 60 + i), (-0.4, 0.4)[i]), tk, db(-21))
sfx.add(pan_st(glint(7000, 0.1, 70), 0), c["blue"], db(-22))                   # COPPER tag
# the squeeze: a wet squelch in the pause after "gills..."
sq_t = c["gills2_end"] + 0.06
sfx.add(pan_st(soft(squelch(0.34, 3), 2.2), -0.2), sq_t, db(-15) * 1.0)
sfx.add(pan_st(filt(gurgle(0.6, 4, 26), "highpass", 5200), -0.2), c["squeezes"], db(-24))   # under "squeezes through"
# floppy: a sad deflating slide just after the word, and a low bwomp
sfx.add(pan_st(slide(520, 190, 0.22, 0.0, None, 5), 0.1), c["floppy_end"] + 0.02, db(-17))
sfx.add(pan_st(bloop(150, 50, 0.22), 0), c["floppy_end"] + 0.0, db(-12))

# ================================================================= heart number three: the PUNCH
sfx.add(pan_st(whoosh(0.28, 400, 2600, 33), 0), SHOT["third"] - 0.2, db(-19))
boom = soft(thump(0.9, 110, 34, 0.25, 3) + 0.4 * filt(white(int(0.9 * SR), 4), "lowpass", 160) * expdecay(int(0.9 * SR), 0.06), 2.4)
sfx.add(pan_st(boom, 0), c["pumps"] - 0.01, db(-6))
sfx.add(pan_st(edges(whoosh(0.7, 200, 3000, 34, 0.25), 300, 5200), 0), c["pumps"] + 0.02, db(-12))
for i in range(8):                                                             # blood arriving at each arm tip
    sfx.add(pan_st(glint(5800 + 250 * i, 0.07, 80 + i), -0.8 + 0.23 * i), c["pumps"] + 0.25 + 0.04 * i, db(-24))
sfx.add(pan_st(soft(thump(0.5, 100, 40, 0.15, 5), 2.0), 0), c["again"] - 0.02, db(-11))
sfx.add(pan_st(filt(gurgle(0.45, 9, 30), "highpass", 5200), 0.3), c["pumps"] + 0.15, db(-25))   # his bubbles

# ================================================================= you do this too
sfx.add(pan_st(whoosh(0.26, 380, 2200, 41), 0), SHOT["you"] - 0.2, db(-19))
sfx.add(pan_st(bloop(240, 120, 0.18), 0.2), c["too"] - 0.05, db(-16))          # the poke (low: it can sit under "too")
for i in range(5):
    sfx.add(pan_st(glint(6200 + 300 * i, 0.08, 90 + i), 0), c["too"] + 0.02 * i, db(-24))   # the window opens
sfx.add(pan_st(heartbeat(13, 1.0), -0.2), c["pumps2"] - 0.05, db(-15))          # his own ba-dum
TAPE = C["tape"]
sfx.add(pan_st(soft(thump(0.16, 260, 90, 0.035, 7), 2.0), 0), TAPE, db(-13))       # the tape SLAP, in the pause before "glued"
sfx.add(pan_st(filt(white(int(0.16 * SR), 8), "highpass", 5200) * expdecay(int(0.16 * SR), 0.04), 0), TAPE, db(-20))

# ================================================================= when it swims: the jet, the stop, the restart
sfx.add(pan_st(whoosh(0.26, 380, 2200, 51), 0), SHOT["swim"] - 0.2, db(-19))
sfx.add(pan_st(filt(balloon_inflate(0.6, 5), "lowpass", 380), 0.2), c["octo2"] - 0.05, db(-14))
jet = edges(whoosh(1.0, 120, 3200, 52, 0.15, 0.4), 380, 5200)
sfx.add(pan_st(jet, 0.4), c["swims"] - 0.02, db(-8))
sfx.add(pan_st(whoosh(0.24, 300, 2600, 53, 0.2), 0.5), c["swims_end"] + 0.02, db(-16))          # whole, in the gap
# the monitor's beeps on each big-heart beat while it shows, none while it is stopped
for b in C["beats"]:
    if c["heart_s"] - 0.2 <= b < END["swim"] and not (C["pause0"] <= b < C["restart"]):
        sfx.add(pan_st(fade(np.sin(2 * np.pi * 1760 * ar(int(0.07 * SR))), 0.003, 0.02), 0.3), b, db(-27))
flat_t0, flat_t1 = c["stops"] + 0.05, c["for"] - 0.04                      # the flatline, thin and quiet
fl = np.sin(2 * np.pi * 1760 * ar(int((flat_t1 - flat_t0) * SR)))
sfx.add(pan_st(fade(fl, 0.01, 0.03), 0.3), flat_t0, db(-31))
sfx.add(pan_st(filt(gurgle(0.14, 12, 40), "bandpass", [300, 3000]), -0.3), c["stops_end"] + 0.01, db(-18))   # his gasp, in the gap
sfx.add(pan_st(soft(thump(0.6, 120, 38, 0.18, 9), 2.4), 0), c["restart"], db(-7))                     # THUMP: it's back
sfx.add(pan_st(fade(np.sin(2 * np.pi * 1760 * ar(int(0.07 * SR))), 0.003, 0.02), 0.3), c["moment_end"] + 0.03, db(-22))

# ================================================================= it would rather walk: tiptoes
sfx.add(pan_st(whoosh(0.24, 380, 2000, 61), 0), SHOT["walk"] - 0.2, db(-20))
step = np.pi / 9.5
k = 0
while SHOT["walk"] + (k + 0.5) * step < END["walk"]:
    ts = SHOT["walk"] + (k + 0.5) * step
    p = filt(pizz(mtof(43 + (k % 2) * 3), 0.25, k), "lowpass", 320) * 1.4
    sfx.add(pan_st(p, -0.4 + 0.8 * (k / 6)), ts, db(-15))
    sfx.add(pan_st(filt(glint(6600 - 300 * (k % 2), 0.05, k), "highpass", 5200), -0.4 + 0.8 * (k / 6)), ts, db(-21))
    k += 1

# ================================================================= the button: three lazy hearts, the crab's cardio, ba-dum tss
sfx.add(pan_st(whoosh(0.24, 380, 2000, 71), 0), SHOT["button"] - 0.2, db(-20))
for i in range(3):
    sfx.add(pan_st(heartbeat(21 + i, 0.8), -0.2 + 0.2 * i), c["three3"] + 0.12 * i + 0.02, db(-17))
tm = filt(saw(62, int((END["button"] - SHOT["button"]) * SR)), "lowpass", 300) * 0.5 + 0.3 * filt(white(int((END["button"] - SHOT["button"]) * SR), 6), "highpass", 6000)
amb.add(pan_st(fade(tm, 0.2, 0.2), 0.5), SHOT["button"], db(-24))     # the treadmill's motor (the crab is jogging)
sfx.add(rimshot(3), c["cardio_end"] + 0.04, db(-11))
# the loop: a soft whoosh into frame 1's picture
sfx.add(pan_st(whoosh(0.22, 400, 2200, 81, 0.5), 0), C["loop_in"] - 0.12, db(-22))

# ================================================================= score (drops out for every punchline)
BPM = 116
groove(mus, c["heart1_end"], c["three"] - 0.05, BPM, ["Dm", "Bb"], gain=-6, seed=10, kick_on=False, snaps=False)
groove(mus, c["two"] + 0.2, c["floppy"] - 0.1, BPM, ["Dm", "Bb", "F", "C"], gain=-3, seed=20)
drone(mus, c["so3"], c["pumps"], [50, 57, 62], cutoff=700, gain=-24, seed=3)            # the wind-up to the punch
groove(mus, c["pumps"] + 0.25, END["third"], BPM, ["F", "C"], gain=-2, seed=30)
groove(mus, c["you2"] + 0.2, c["together_end"], BPM, ["Bb", "F", "C", "F"], gain=-5, seed=40, kick_on=False)
drone(mus, c["but"] + 0.1, c["stops"], [45, 52, 57, 60], cutoff=600, gain=-27, seed=5)  # the jet, the suspense
groove(mus, c["restart"] + 0.15, END["walk"] - 0.05, 100, ["Dm", "A"], gain=-4, seed=50, kick_on=False, padv=False)   # the sneaky walk
groove(mus, c["three3"] + 0.3, c["cardio"] - 0.05, 92, ["Bb", "F"], gain=-6, seed=60, kick_on=False, snaps=False)     # lazy
silence(mus, [(c["three"] - 0.05, c["two"] + 0.2), (c["floppy"] + 0.05, c["so3"]), (c["stops"], c["restart"] + 0.15),
              (c["walk"] - 0.02, END["walk"]), (c["cardio"] - 0.05, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.5})
