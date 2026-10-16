"""Why Does This Dot VANISH? (Find Your Blind Spot) Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
"""
import json
import os
import sys

import numpy as np  # noqa: F401

import sfxlib as L
from sfxkit import *  # noqa: F401,F403
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()

SFX_LEVEL = -11.0   # the whole sfx bus (house: -5); the gags against each other are in G
# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(slap=-26, riser=-27, jolt=-24, poof=-21, window=-24, dun=-21, dive=-21, hum=-31, clunk=-20, click=-23, squeeze=-27,
         wave=-28, xhit=-25, plip=-19, cricket=-21, pop=-21, swish=-29, sparkle=-25, splash=-20, bloop=-20, zip=-28,
         tick=-23, shades=-24, rimshot=-19, lift=-24)


def thud_low(seed=0, f=70.0):
    """a soft landing heard through the body: all of it under ~250 Hz (it can sit on a word; mono, 0.3 s)"""
    n = int(0.3 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def top_swish(dur=0.12, seed=0):
    """a brush stroke / a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0):
    for i in range(n):
        bus.add(pan_st(glint(5600 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


# ================================================================= ambience
bed_on = gate(N, [(0, SHOT["inside"] + 0.3), (SHOT["loop"] - 0.05, DUR)])
amb.x += pan_st(filt(brown(N, 3), "lowpass", 200), 0) * 0.42 * bed_on                         # the bedroom at midnight
crickets(0.0, SHOT["inside"] + 0.2, bed, db(-36), seed=5, f=4900, rate=0.9)                    # outside the window
eye_on = gate(N, [(SHOT["inside"] + 0.2, SHOT["paint"] + 0.05)])
amb.x += pan_st(filt(brown(N, 7), "lowpass", 150), 0) * 0.5 * eye_on                           # inside the eye: a low hum
room_on = gate(N, [(SHOT["paint"], SHOT["octopus"] + 0.05)])
amb.x += pan_st(filt(brown(N, 8), "lowpass", 170), 0) * 0.45 * room_on                         # the brain's room
sea_on = gate(N, [(SHOT["octopus"], SHOT["loop"])])
amb.x += pan_st(filt(brown(N, 9), "lowpass", 260), 0) * 0.55 * sea_on                          # under the sea

# ================================================================= the hook: the test
bed.add(pan_st(thud_low(11, 62.0), 0.25), 0.0, db(G["slap"]))                                   # frame 0: his palm lands on his eye
bed.add(pan_st(filt(riser(1.8, 12, 2600, 7600), "highpass", 5200), 0), C["bring"] - 0.05, db(G["riser"]))   # the phone comes closer
bed.add(pan_st(thud_low(13, 80.0), 0), C["the_dot"] - 0.08, db(G["jolt"]))   # he jolts back (all under 250 Hz: under "The dot")
sfx.add(pan_st(pew(0.14, 14, 2600, 900), 0.4), C["vanished_end"] + 0.03, db(G["poof"]))         # pff: gone (in the pause after "vanished?")
sparkle(C["vanished_end"] + 0.02, bed, G["sparkle"], seed=15, n=3, pan=0.45)
bed.add(pan_st(glint(6100, 0.12, 18), -0.3), C["your_eye"] + 0.02, db(G["window"]))             # the window opens on his eye
bed.add(pan_st(glint(7000, 0.1, 19), -0.3), C["your_eye"] + 0.12, db(G["window"] - 2))
bed.add(pan_st(thud_low(20, 48.0), -0.2), C["hole1"] - 0.02, db(G["dun"]))                       # HOLE: a low dun under the word
sfx.add(pan_st(whoosh(0.36, 300, 2600, 21, 0.85), 0), C["it1_end"] + 0.02, db(G["dive"]))       # into his eye (in the gap)

# ================================================================= inside the eye: the cable, the plug, nobody
bed.add(pan_st(buzz_hi(C["plugs_end"] - C["cable"] + 0.2, 34.0, 22), 0.3), C["cable"] - 0.05, db(G["hum"]))   # the cable hums with signals
plugT = C["plugs_end"] + 0.12
sfx.add(pan_st(lock_snap(23), 0.35), plugT - 0.02, db(G["click"]))                               # the plug goes home: click...
bed.add(pan_st(thud_low(24, 56.0), 0.35), plugT, db(G["clunk"]))                                 # ...CLUNK
bed.add(pan_st(top_swish(0.1, 25), 0.4), C["room"] + 0.05, db(G["squeeze"]))                     # a sensor tries to squeeze in
bed.add(pan_st(top_swish(0.08, 26), 0.4), C["room"] + 0.32, db(G["squeeze"]))
for i in range(5):                                                                                # the sensors wave down the wall
    bed.add(pan_st(glint(5400 + 450 * i, 0.06, 27 + i), -0.3 + 0.15 * i), C["light"] + 0.06 * i, db(G["wave"]))
bed.add(pan_st(glint(7400, 0.1, 33), -0.2), C["so"] + 0.42, db(G["xhit"]))                       # the X's light lands: X!
bed.add(pan_st(glint(8200, 0.08, 34), -0.2), C["so"] + 0.5, db(G["xhit"] - 2))
sfx.add(pan_st(drip(35, 1500.0), 0.3), C["landed_end"] + 0.04, db(G["plip"]))                    # plip: the dot lands (in the pause)
sfx.add(pan_st(cricket(36, 3, 4600.0), 0.5), C["nobody_end"] + 0.03, db(G["cricket"]))           # ...and nobody. A cricket.
sfx.add(pan_st(cricket(37, 2, 4500.0), 0.5), C["nobody_end"] + 0.3, db(G["cricket"] - 3))

# ================================================================= the brain paints it over
sfx.add(pan_st(whoosh(0.22, 400, 2400, 40, 0.8), 0), SHOT["paint"] - 0.2, db(-25))
bed.add(pan_st(thud_low(41, 66.0), 0.3), SHOT["paint"] + 0.12, db(G["dun"] - 3))                 # the hole on the screen
bed.add(pan_st(glint(6600, 0.1, 42), 0.3), C["hole2"] - 0.02, db(G["window"]))
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 43, 0.6), "lowpass", 320), 0.2), C["because"] - 0.05, db(-26))   # the brush comes up
for i in range(9):                                                                                # brush strokes
    t0 = C["paints"] + 0.08 + 0.19 * i
    if t0 < C["it2_end"]:
        bed.add(pan_st(top_swish(0.13, 44 + i), 0.3 if i % 2 else 0.45), t0, db(G["swish"]))
sparkle(C["it2_end"] + 0.04, bed, G["sparkle"] + 2, seed=60, n=4, pan=0.3)                       # done: nothing to see here

# ================================================================= the octopus
sfx.add(pan_st(splash(0.4, 70), 0), SHOT["octopus"] - 0.3, db(G["splash"]))                      # into the sea (in the gap)
sfx.add(pan_st(bloop(170, 60, 0.35), 0), SHOT["octopus"] + 0.08, db(G["bloop"]))                 # the octopus pops in (low: under "An")
sfx.add(pan_st(whoosh(0.2, 400, 2400, 71, 0.8), 0), C["its"] - 0.34, db(-25))                   # the split (ends before "Its")
bed.add(pan_st(ratchet(C["behind_end"] - C["wired"], 18.0, 34.0, 72, edges=True), 0.2), C["wired"] - 0.05, db(G["zip"]))   # the wires draw on
sparkle(C["behind"] + 0.05, bed, G["sparkle"] - 2, seed=73, n=3, pan=0.2)
sfx.add(pan_st(ding(84, 0.13, 76), 0.2), C["all_end"] + 0.04, db(G["tick"]))                     # the tick (after "all.")
sfx.add(pan_st(ding(91, 0.16, 77), 0.2), C["all_end"] + 0.17, db(G["tick"] - 2))

# ================================================================= the button and the loop
sfx.add(pan_st(bloop(200, 70, 0.3), 0), SHOT["button"] + 0.02, db(G["bloop"] - 2))
sparkle(C["show"] - 0.45, bed, G["shades"], seed=80, n=4, pan=0.1)                               # the shades slide down
sfx.add(rimshot(81), C["show_end"] + 0.06, db(G["rimshot"]))                                     # ba-dum tss
sfx.add(pan_st(whoosh(0.4, 300, 2200, 82, 0.7), 0.3), DUR - 0.45, db(G["lift"]))                 # his palm rises to frame 0

# ================================================================= score (drops out for every punchline)
BPM = 104
groove(mus, 0.35, C["the_dot"] - 0.05, BPM, ["Am", "F", "C", "G"], gain=-12, seed=10, kick_on=False, snaps=False)
drone(mus, C["your_eye"] + 0.05, C["it1_end"] + 0.1, [45, 52, 57], cutoff=420, gain=-18)
groove(mus, SHOT["inside"] + 0.3, C["landed_end"] - 0.05, BPM, ["Am", "Dm", "F", "E"], gain=-6, seed=20, arp=True)
groove(mus, SHOT["paint"] + 0.3, C["it2_end"], BPM, ["F", "C", "Dm", "G"], gain=-7, seed=30, kick_on=False, snaps=True)
groove(mus, SHOT["octopus"] + 0.3, C["all_end"], BPM, ["Am", "Em", "F", "G"], gain=-6, seed=40)
groove(mus, SHOT["button"] + 0.2, C["show"] - 0.1, BPM, ["F", "G"], gain=-9, seed=50, kick_on=False, snaps=False)
silence(mus, [(C["the_dot"] - 0.05, C["your_eye"] + 0.05),        # the dot vanished
              (C["landed_end"] - 0.05, SHOT["paint"] + 0.3),       # plip... nobody... cricket
              (C["it2_end"], SHOT["octopus"] + 0.3),               # painted over: sparkle, splash
              (C["all_end"], SHOT["button"] + 0.2),                # the tick
              (C["show"] - 0.1, DUR)])                             # "Show-off.", ba-dum tss, into the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
