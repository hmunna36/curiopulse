"""Why Can't You Lift Your RING FINGER? 💍 Short: sound design, score and mix, cue-locked to timeline.json.

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
c = C

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(slap=-11, tuck=-24, strain=-25, jingle=-20, yank=-18, boing=-19, glass=-22, pluck=-23, ding=-22, buzzer=-25,
         twang=-21, slide=-23, lock=-18, snip=-14, spring=-22, flourish=-19, tada=-19, lift=-24)


def snip(seed=0):
    """scissors closing: two quick metal clicks with a ring (mono, 0.14 s)"""
    n = int(0.14 * SR)
    t = ar(n)
    y = np.zeros(n)
    for dt, g in ((0.0, 1.0), (0.028, 0.75)):
        i = int(dt * SR)
        m = n - i
        y[i:] += (filt(white(m, seed + i), "bandpass", [2500, 9000]) * expdecay(m, 0.004) * g
                  + 0.35 * np.sin(2 * np.pi * 4300 * ar(m)) * expdecay(m, 0.02) * g)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0005, 0.02)


def wood_knock(seed=0):
    """a palm landing flat on a wooden table: a slap over a hollow low knock (mono, 0.25 s)"""
    n = int(0.25 * SR)
    t = ar(n)
    body = np.sin(2 * np.pi * np.cumsum(95 + 60 * np.exp(-t / 0.02)) / SR) * expdecay(n, 0.06)
    knock = filt(white(n, seed), "bandpass", [180, 900]) * expdecay(n, 0.02)
    y = 0.9 * body + 0.5 * knock
    s = slap_hit(seed)
    y[:len(s)] += 0.8 * s
    return fade(y / (np.abs(y).max() + 1e-9), 0.0004, 0.03)


# ================================================================= ambience: the café, the 1880s parlour
cafe_on = gate(N, [(0, SHOT["inside"] + 0.6), (SHOT["button"] - 0.05, DUR)])
amb.x += pan_st(filt(brown(N, 3), "lowpass", 260), 0) * 0.55 * cafe_on                       # the room
amb.x += pan_st(filt(white(N, 4), "highpass", 6500), 0.3) * 0.035 * cafe_on                   # rain on the window
inside_on = gate(N, [(SHOT["inside"] + 0.3, SHOT["past"])])
amb.x += pan_st(filt(brown(N, 5), "lowpass", 160), 0) * 0.45 * inside_on                      # a low hush inside the hand
past_on = gate(N, [(SHOT["past"], SHOT["button"])])
amb.x += pan_st(projector(N, 6) * 0.6, 0) * past_on                                           # an old film projector

# ================================================================= the hook
sfx.add(pan_st(wood_knock(1), -0.1), 0.0, db(G["slap"]))                       # frame 0: the hand slaps flat
sfx.add(pan_st(knuckle_crack(2, 1, 0.0, 900.0, 0.6, edges=True), -0.1), c["under_end"] + 0.02, db(G["tuck"]))   # the tuck
sfx.add(pan_st(slide(330, 300, 0.32, vib=0.6, top=None, harm=5), -0.1), c["hook_end"] + 0.03, db(G["strain"]))   # nnngh
sfx.add(pan_st(bonk(), 0), c["stuck_end"] + 0.06, db(G["boing"] - 4))                    # the finger gives up
sfx.add(pan_st(jingle(0.36, 7, 34), 0.15), c["leash_end"] + 0.03, db(G["jingle"]))     # a dog tag: it's on a leash
sfx.add(pan_st(knuckle_crack(9, 2, 0.05, 1500.0, 0.4, edges=True), 0.1), c["held"] - 0.05, db(G["tuck"] - 2))   # tied on
yk = c["answer_end"] + 0.05
sfx.add(pan_st(whoosh(0.16, 900, 3800, 11, 0.9), 0), yk - 0.06, db(G["yank"] - 4))      # YANK
sfx.add(pan_st(slap_hit(12), 0), yk + 0.06, db(G["yank"]))
sfx.add(pan_st(boing(0.2, 120.0, 13), 0), yk + 0.08, db(G["boing"]))

# ================================================================= inside the hand
sfx.add(pan_st(filt(whoosh(0.7, 200, 900, 20, 0.8), "lowpass", 300), 0), c["see"] - 0.1, db(-21))   # the camera rises (low: under "See the cords")
for i in range(9):                                                                         # the skin turns to glass
    bed.add(pan_st(glint(5600 + 330 * i, 0.12, 30 + i), -0.6 + 0.15 * i), c["see"] + 0.05 + 0.055 * i, db(G["glass"]))
for k, tl in ((0, c["they_lift"] + 0.1), (1, c["fingers"] + 0.1)):                       # the cords pull: string plucks
    bed.add(pan_st(filt(pizz(mtof(76 + 3 * k), 0.4, 40 + k), "highpass", 5000), 0.2 * (1 - 2 * k)), tl, db(G["pluck"] + 3))
sfx.add(pan_st(pizz(mtof(76), 0.35, 44), -0.2), c["fingers_end"] + 0.02, db(G["pluck"]))
sfx.add(pan_st(ding(84, 0.13, 50), -0.25), c["each_end"] + 0.03, db(G["ding"]))          # two spares: ding ding
sfx.add(pan_st(ding(88, 0.13, 51), 0.25), c["each_end"] + 0.17, db(G["ding"]))
sfx.add(pan_st(slide(260, 340, 0.3, vib=0.3, harm=5), 0), c["ringq_end"] + 0.04, db(G["slide"] - 2))   # "Ring finger?" hmm?
sfx.add(pan_st(buzzer(0.26), 0), c["nope_end"] + 0.02, db(G["buzzer"]))                 # NOPE
sfx.add(pan_st(boing(0.28, 240.0, 61), 0), c["one_end"] + 0.06, db(G["twang"]))           # the strap: twang
sfx.add(pan_st(slide_whistle(0.2, 1500, 700), 0), c["mdown_end"] + 0.0, db(G["slide"]))  # middle down
sfx.add(pan_st(lock_snap(63), 0), c["rdown_end"] + 0.04, db(G["lock"]))                   # ring down: locked
bwomp(mus, c["rdown_end"] + 0.1, m=33, gain=-16)

# ================================================================= the 1880s
sfx.add(pan_st(scratch(0.2, 70), 0), c["rdown_end"] + 0.17, db(-22))                       # into the old film
snipT = c["snipped"] + 0.32
sfx.add(pan_st(snip(71), 0.2), snipT - 0.01, db(G["snip"]))                                # SNIP
sfx.add(pan_st(filt(boing(0.4, 200.0, 72), "lowpass", 280), 0), snipT + 0.18, db(G["spring"]))   # the finger springs up
for i, m in enumerate([72, 76, 79, 84]):                                                  # a little run on the piano
    sfx.add(pan_st(piano(mtof(m), 0.18, 80 + i, 1.2), -0.3 + 0.2 * i), c["pianists_end"] + 0.02 + 0.05 * i, db(G["flourish"]))
for m in (60, 64, 67, 72):                                                                # ta-da
    sfx.add(pan_st(piano(mtof(m), 0.7, 90 + m, 1.1), 0), c["purpose_end"] + 0.05, db(G["tada"] - 3))

# ================================================================= the button and the loop
sfx.add(pan_st(slide(310, 290, 0.3, vib=0.7, harm=5), -0.1), c["you_end"] + 0.12, db(G["strain"] - 2))   # still nnngh
sfx.add(pan_st(whoosh(0.3, 500, 2600, 95, 0.7), 0), DUR - 0.42, db(G["lift"]))           # the hand lifts for the slap

# ================================================================= score (drops out for every punchline)
BPM = 112
beat = 60 / BPM
# the mystery: a light pizzicato/marimba groove from "Relax" (no score under the hook)
g0 = c["relax"] + 0.2
groove(mus, g0, c["answer_end"] + 0.02, BPM, ["Dm", "Bb", "F", "C"], gain=-6, seed=10, kick_on=False)
# inside: the same key, fuller, from "cords"
groove(mus, c["cords"] + 0.15, SHOT["past"] - 0.1, BPM, ["Dm", "Bb", "F", "C"], gain=-5, seed=20, arp=False)
# the 1880s: a silent-film stride piano, under the old projector
rag(mus, SHOT["past"] + 0.15, SHOT["button"] - 0.1, bpm=132, gain=-9, seed=30, chords=("F", "D7", "G7", "C"))
# the button: back to the café groove, thinner
groove(mus, SHOT["button"] + 0.25, DUR - 0.5, BPM, ["Dm", "Bb"], gain=-9, seed=40, kick_on=False, snaps=False)
silence(mus, [(c["answer_end"] - 0.05, c["cords"] + 0.1),                 # the yank
              (c["nope"] - 0.1, c["strap"] + 0.15),                        # NOPE
              (c["rdown"] - 0.05, SHOT["past"] + 0.12),                    # ring down, locked
              (snipT - 0.15, snipT + 0.45),                                # SNIP
              (c["pianists_end"] - 0.05, c["purpose"] + 0.15),             # the piano run
              (c["purpose_end"] - 0.05, SHOT["button"] + 0.25),            # ta-da
              (c["you_end"] + 0.05, DUR)])                                 # the button's last beat, into the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14}, duck={"music": 0.74})
