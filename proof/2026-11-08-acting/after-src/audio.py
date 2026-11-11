"""Why Can't You Lick Your ELBOW? 💪 Short: sound design, score and mix, cue-locked to timeline.json.

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
G = dict(strain=-25, plip=-24, stretch=-27, gap=-27, whoosh=-22, snapback=-21, tick=-24, tape=-24, stamp=-16, squeeze=-24,
         scan=-30, tok=-19, pin=-15, pinglint=-25, scribble=-27, chomp=-15, swoosh=-20, ding=-27, orbit=-24, dizzy=-27,
         poof=-23, stretchup=-25, shrink=-22, slurp=-17, sparkle=-28, toss=-23, catch=-19, bird=-33)


def low_thud(seed=0, cut=220):
    """a heavy low thump, all of it under ~220 Hz (it can sit on a word)"""
    return filt(kick(1.0), "lowpass", cut)


def pok(seed=0):
    """a soft low knock (under 300 Hz) with a tiny tick on top (above 5 kHz)"""
    k = filt(kick(0.6), "lowpass", 300)[: int(0.16 * SR)]
    g = glint(6400 + 300 * (seed % 3), 0.05, seed)
    k[: len(g)] += 0.35 * g[: len(k)]
    return k * np.clip((len(k) - np.arange(len(k))) / (0.03 * SR), 0, 1)


# ================================================================= ambience: a hot, still day on the trail
wind = filt(pink(N, 3), "lowpass", 340) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.09 * tt + 0.4))
amb.x += pan_st(wind, -0.1) * 0.45
amb.x += pan_st(filt(white(N, 4), "highpass", 6400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.37 * tt)) ** 4, 0.35) * 0.018   # a far cicada
for i, t0 in enumerate([1.2, 9.0, 17.6, 24.2]):                                                  # a far bird now and then
    bed.add(pan_st(tweet(200 + i, 3600 + 200 * (i % 2)), -0.5 + 0.3 * i), t0, db(G["bird"]))

# ================================================================= the hook: straining for the drip
sfx.add(pan_st(knuckle_crack(1, 2, 0.07, 1300.0, 0.5, edges=True), 0.3), 0.0, db(G["strain"]))     # frame 0: straining
bed.add(pan_st(ratchet(1.2, 6.0, 9.0, 2, edges=True, f=5600.0), 0.3), 0.05, db(G["stretch"]))     # the tongue creaks out
sfx.add(pan_st(drip(3, 1700), 0.4), c["elbow1"] + 0.05, db(G["plip"]))                            # the drop wobbles
bed.add(pan_st(ratchet(c["on_end"] - c["go"] + 0.2, 10.0, 22.0, 4, edges=True, f=5900.0), 0.3), c["go"] - 0.05, db(G["stretch"] + 2))  # harder
sfx.add(pan_st(knuckle_crack(5, 2, 0.06, 1200.0, 0.5, edges=True), 0.3), c["on_end"] + 0.03, db(G["strain"] + 1))
bed.add(pan_st(glint(6900, 0.12, 6), 0.2), c["gently"] - 0.02, db(G["gap"]))                      # the gap marker
sfx.add(pan_st(drip(7, 1500), 0.4), c["gently_end"] + 0.06, db(G["plip"]))                        # plip

# ================================================================= the answer: Can't? ... your ARM's too long.
sfx.add(pan_st(filt(whoosh(0.22, 200, 800, 10, 0.8), "lowpass", 300), -0.2), SHOT["answer"] - 0.06, db(G["whoosh"]))   # the cut
sfx.add(pan_st(filt(boing(0.18, 240.0, 11), "lowpass", 320), -0.1), c["cant"] + 0.02, db(G["snapback"]))        # tongue snaps in
bed.add(pan_st(glint(7200, 0.12, 12), 0.2), c["tongue"] + 0.08, db(G["tick"]))                     # the tick on the tongue
bed.add(pan_st(glint(7700, 0.1, 13), 0.25), c["tongue"] + 0.16, db(G["tick"] - 2))
sfx.add(pan_st(ratchet(c["long"] - c["arms"] + 0.05, 34.0, 50.0, 14, edges=True, f=5400.0), -0.25), c["arms"] - 0.08, db(G["tape"]))   # the tape zips out
sfx.add(pan_st(low_thud(15), 0.0), c["long"] - 0.02, db(G["stamp"]))                               # TOO LONG (low: on the word)
bed.add(pan_st(glint(6200, 0.1, 16), 0.0), c["long"] + 0.01, db(G["tick"]))

# ================================================================= feel: one stiff bone, pinned at your shoulder
sfx.add(pan_st(squeak(0.14, 1900, 2700), 0.2), c["arm_f_end"] + 0.04, db(G["squeeze"]))             # the squeeze (in the pause)
sfx.add(pan_st(squeak(0.12, 2000, 2900), 0.2), c["arm_f_end"] + 0.32, db(G["squeeze"] - 2))
bed.add(pan_st(buzz_hi(0.7, 24.0, 20), -0.2), c["one"] - 0.1, db(G["scan"]))                       # the x-ray sweeps on
sfx.add(pan_st(pok(21), -0.2), c["stiff"] + 0.02, db(G["tok"]))                                    # tok
sfx.add(pan_st(pok(22), -0.2), c["bone"] + 0.02, db(G["tok"]))                                     # tok
sfx.add(pan_st(low_thud(23, 200), -0.3), c["pinned"] + 0.06, db(G["pin"]))                         # THUNK (low: on the word)
bed.add(pan_st(glint(7000, 0.14, 24), -0.3), c["pinned"] + 0.08, db(G["pinglint"]))

# ================================================================= the swing: the compass
sfx.add(pan_st(filt(whoosh(0.5, 150, 700, 30, 0.7), "lowpass", 300), -0.3), c["swing"] - 0.05, db(G["swoosh"] - 2))
bed.add(pan_st(scribble(c["mouth1_end"] - c["swing"] + 0.1, 31, 9.0), -0.2), c["swing"], db(G["scribble"]))    # the gold trail draws
sfx.add(pan_st(filt(whoosh(0.32, 200, 1000, 32, 0.9), "lowpass", 340), 0.2), c["past"] - 0.2, db(G["swoosh"]))  # it sails PAST
sfx.add(pan_st(chomp(33), 0.1), c["past"] + 0.04, db(G["chomp"]))                                  # CHOMP (on the word: its body is low)
bed.add(pan_st(scribble(0.5, 34, 11.0), 0.2), c["sails"], db(G["scribble"]))

# ================================================================= the payoff: INSIDE its circle; round and round
bed.add(pan_st(scribble(c["inside"] - c["your_m"] + 0.1, 40, 10.0), -0.1), c["your_m"], db(G["scribble"]))     # the circle closes
sfx.add(pan_st(ding(84, 0.14, 41), 0.0), c["inside_end"] + 0.04, db(G["ding"]))                    # INSIDE (in the pause after it)
for i in range(3):                                                                                # each pass of the windmill
    t0 = c["orbit_0"] + (c["orbit_1"] - c["orbit_0"]) * (0.18 + 0.32 * i)
    sfx.add(pan_st(filt(whoosh(0.3, 180, 800, 42 + i, 0.8), "lowpass", 300), -0.4 + 0.4 * i), t0, db(G["orbit"]))
bed.add(pan_st(slide_whistle(0.5, 2600, 1800), 0.2), c["round_end"] + 0.03, db(G["dizzy"]))       # dizzy (above the voice band)

# ================================================================= the rare few: long tongues... short arms.
sfx.add(pan_st(cork_pop(50, 600.0), 0.0), c["can2_end"] + 0.02, db(G["poof"]))                     # POOF
_sd = c["tongues_end"] - c["long_t"]                                                              # the tongue stretches: a low rising
_sn = int(_sd * SR)                                                                                 # wooomp under the voice band, and a
_st = filt(np.sin(2 * np.pi * np.cumsum(np.linspace(70, 190, _sn)) / SR), "lowpass", 280) * attack_decay(_sn, 0.15, 0.3)   # glint at the tip
sfx.add(pan_st(_st, -0.2), c["long_t"], db(G["stretchup"] + 4))
bed.add(pan_st(glint(7400, 0.1, 49), -0.3), c["tongues_end"] - 0.05, db(G["sparkle"] + 2))
sfx.add(pan_st(filt(boing(0.3, 200.0, 51), "lowpass", 300), -0.3), c["short"] + 0.02, db(G["shrink"]))         # the arm shrinks
sfx.add(pan_st(slurp(0.4, 52, 16.0), -0.1), c["arms2_end"] + 0.02, db(G["slurp"]))                  # SLURP (in the pause)
for i in range(4):
    bed.add(pan_st(glint(6800 + 300 * i, 0.08, 53 + i), -0.3 + 0.2 * i), c["arms2_end"] + 0.05 + 0.07 * i, db(G["sparkle"]))

# ================================================================= the button: now try the OTHER elbow, and the loop
sfx.add(pan_st(cork_pop(60, 520.0), 0.0), c["now_b"] - 0.03, db(G["poof"]))                        # POOF, back to normal
sfx.add(pan_st(filt(whoosh(0.5, 200, 900, 61, 0.8), "lowpass", 320), 0.0), c["toss_0"], db(G["toss"]))        # the cone flies over
sfx.add(pan_st(pok(62), 0.3), c["toss_1"], db(G["catch"]))                                          # caught
sfx.add(pan_st(knuckle_crack(63, 2, 0.07, 1300.0, 0.5, edges=True), 0.3), DUR - 0.3, db(G["strain"] - 1))   # straining again: the loop
bed.add(pan_st(ratchet(0.3, 6.0, 9.0, 64, edges=True, f=5600.0), 0.3), DUR - 0.3, db(G["stretch"]))

# ================================================================= score (a summer ukulele-ish groove; drops out on punchlines)
BPM = 116
# no score under the test and its fail; it starts on "Your tongue's fine"
groove(mus, c["tongue"] - 0.05, c["long"] - 0.05, BPM, ["C", "G", "Am", "F"], gain=-7, seed=10, kick_on=False)
groove(mus, c["feel"] + 0.05, c["past"] - 0.1, BPM, ["F", "C", "G", "C"], gain=-8, seed=20, kick_on=False, snaps=True)
groove(mus, c["your_m"] + 0.1, c["round_end"] + 0.05, BPM, ["Am", "F", "C", "G"], gain=-8, seed=30, kick_on=False, half=True)
groove(mus, c["rare_the"] + 0.1, c["arms2_end"], BPM, ["F", "G", "Am", "G"], gain=-8, seed=40, kick_on=False, snaps=True)
groove(mus, c["now_b"] + 0.05, DUR, BPM, ["C", "G"], gain=-11, seed=50, kick_on=False)
silence(mus, [(c["long"] - 0.05, c["feel"] + 0.05),              # TOO LONG (the stamp)
              (c["shoulder_end"] + 0.05, c["swing"] + 0.12),     # a breath before "Now swing": the instruction alone
              (c["past"] - 0.1, c["your_m"] + 0.1),              # CHOMP, and the miss
              (c["arms2_end"] - 0.02, c["now_b"] + 0.05),        # SLURP
              (DUR - 0.25, DUR)])                                # into the loop

# ================================================================= voice + mix
# the hitstops' layered hits (8 Nov 2026, the video-quality research): a crisp transient, a body a phone speaker can play
# (300-950 Hz, above where phones roll off), a short bright tail, on the frame the picture freezes
for _th in (c["long"] + 0.06, c["past"] + 0.08):
    sfx.add(pan_st(filt(snap(51), "highpass", 1800), 0.0), _th, db(-20))
    sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-17))
    sfx.add(cymbal(52, 0.45), _th + 0.01, db(-31))                       # (cymbal() is already stereo)
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": -9.0}, duck={"music": 0.74})
