"""Why Can't You Move Just ONE Eye? 👀 Short: sound design, score and mix, cue-locked to timeline.json.

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
G = dict(hop=-27, strain=-27, flap=-31, whoosh=-22, wah=-21, pop=-20, zip=-25, clink=-22, tug=-21, yank=-19, both=-18,
         lid=-24, tap=-22, roll=-24, ring=-29, mask=-17, servo=-27, swivel=-25, buzz=-29, buzzlo=-24, land=-27, thwip=-18,
         snapg=-15, gulp=-23, bird=-33)


def low_thud(seed=0, cut=220):
    """a heavy low thump, all of it under ~220 Hz (it can sit on a word)"""
    return filt(kick(1.0), "lowpass", cut)


def pok(seed=0):
    """a soft low knock (under 300 Hz) with a tiny tick on top (above 5 kHz)"""
    k = filt(kick(0.6), "lowpass", 300)[: int(0.16 * SR)]
    g = glint(6400 + 300 * (seed % 3), 0.05, seed)
    k[: len(g)] += 0.35 * g[: len(k)]
    return k * np.clip((len(k) - np.arange(len(k))) / (0.03 * SR), 0, 1)


def low_whoosh(dur, seed, cut=320):
    """a move of the camera or a yank, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def eye_tick(seed=0):
    """an eye's jump: one tiny glass tick above 5 kHz (on the bed bus, it can sit on a word)"""
    return glint(6600 + 350 * (seed % 4), 0.06, seed)


def fly_buzz(dur, seed=0):
    """a housefly: a low buzz under 250 Hz (wing beat) and a fizz above 5.2 kHz, so it can fly in under a line"""
    n = int(dur * SR)
    t = ar(n)
    f = 190 + 25 * np.sin(2 * np.pi * 3.1 * t + seed) + 12 * np.sin(2 * np.pi * 7.3 * t)
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.6
    lo = filt(y, "lowpass", 250)
    hi = buzz_hi(dur, 190.0, seed)
    m = min(len(lo), len(hi))
    return (lo[:m] * 0.9 + 0.5 * hi[:m]) * attack_decay(m, 0.05, 0.08)


# ================================================================= ambience: a warm, breezy day in the meadow
wind = filt(pink(N, 3), "lowpass", 340) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.09 * tt + 0.4))
amb.x += pan_st(wind, -0.1) * 0.45
amb.x += pan_st(filt(white(N, 4), "highpass", 6400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.37 * tt)) ** 4, 0.35) * 0.018   # a far cicada
for i, t0 in enumerate([c["go1_end"] + 0.05, c["lid_end"] + 0.03, c["back_end"] + 0.05]):                      # a far bird in a pause
    bed.add(pan_st(tweet(200 + i, 3600 + 200 * (i % 2)), -0.5 + 0.4 * i), t0, db(G["bird"]))

# ================================================================= the hook: trying to move ONE eye (and the loop)
for i, h in enumerate(c["hops"]):                                                     # every jump of both eyes: tick
    bed.add(pan_st(eye_tick(i), -0.25 if i % 2 else 0.25), h + 0.02, db(G["hop"]))
bed.add(pan_st(ratchet(c["go1"] - 0.1, 8.0, 14.0, 2, edges=True, f=5600.0), 0.0), 0.0, db(G["strain"]))   # the strain
for i, (t0, sd) in enumerate([(0.0, -0.6), (0.05, 0.6)]):                            # the butterflies' wings (only the top)
    bed.add(pan_st(flutter(c["go1_end"] - t0, 10 + i, edges=True), sd), t0, db(G["flap"]))
sfx.add(pan_st(squeak(0.12, 2200, 3100), 0.1), c["go1_end"] + 0.06, db(G["strain"] + 2))   # the last hard try (in the pause)

# ================================================================= the answer: Can't? ... your eyes are on ONE leash.
sfx.add(pan_st(low_whoosh(0.26, 20), -0.3), SHOT["answer"] - 0.12, db(G["whoosh"]))     # the whip
sfx.add(pan_st(slide(330.0, 210.0, 0.3, 0.0, 300), 0.0), c["cant_end"] + 0.03, db(G["wah"]))   # a little "nope" (under 300 Hz)
sfx.add(pan_st(cork_pop(21, 640.0), 0.0), max(c["cant_end"] + 0.18, c["your_e"] - 0.22), db(G["pop"]))   # the brain pops up
bed.add(pan_st(ratchet(c["leash"] - c["on"] + 0.1, 30.0, 46.0, 22, edges=True, f=5600.0), 0.0), c["on"] - 0.05, db(G["zip"]))   # the lead zips down
for i, sd in enumerate([-0.3, 0.3]):                                                  # the two clips snap on
    bed.add(pan_st(glint(7400 + 400 * i, 0.1, 23 + i), sd), c["leash"] + 0.04 + 0.05 * i, db(G["clink"]))
sfx.add(pan_st(glass_tink(25, 2900.0, 0.12), 0.0), c["leash_end"] + 0.03, db(G["clink"]))   # clink (in the pause)
sfx.add(pan_st(filt(boing(0.16, 230.0, 26), "lowpass", 300), 0.0), c["leash_end"] + 0.12, db(G["tug"] - 2))   # a test tug

# ================================================================= the tug: look left, look right, one tug, BOTH go
for i, g in enumerate(c["tugs"][:2]):
    sfx.add(pan_st(low_whoosh(0.2, 30 + i), -0.4 if i == 0 else 0.4), g - 0.02, db(G["tug"]))
    bed.add(pan_st(eye_tick(30 + i), -0.4 if i == 0 else 0.4), g + 0.06, db(G["hop"] + 2))
sfx.add(pan_st(filt(boing(0.3, 160.0, 33), "lowpass", 300), -0.4), c["tugs"][2] - 0.01, db(G["yank"]))   # the big yank
sfx.add(pan_st(low_whoosh(0.34, 34), 0.5), c["tugs"][3] - 0.03, db(G["both"]))         # BOTH go: whoosh
bed.add(pan_st(eye_tick(35), 0.5), c["tugs"][3] + 0.08, db(G["hop"] + 3))
bed.add(pan_st(eye_tick(36), 0.5), c["tugs"][3] + 0.12, db(G["hop"] + 3))

# ================================================================= close one eye, fingertip on the lid
sfx.add(pan_st(low_whoosh(0.24, 40), 0.4), SHOT["close"] - 0.12, db(G["whoosh"]))      # the whip
sfx.add(pan_st(filt(bloop(200, 120, 0.16), "lowpass", 300), -0.2), c["eye_c_end"] + 0.02, db(G["lid"]))   # the lid shuts
sfx.add(pan_st(pok(41), -0.2), c["lid_end"] + 0.04, db(G["tap"]))                     # the fingertip lands (in the pause)

# ================================================================= feel it: the shut eye rolls under the finger
for i, f in enumerate([c["around"] - 0.02, c["around"] + 0.3, c["that"], c["walking"], c["walking_end"], c["blind"]]):
    sfx.add(pan_st(filt(bloop(150 + 20 * (i % 3), 95, 0.14), "lowpass", 260), -0.15), f, db(G["roll"]))   # the roll under the lid
    bed.add(pan_st(glint(6900 + 200 * (i % 3), 0.07, 50 + i), -0.2), f + 0.03, db(G["ring"]))            # the ring at the fingertip
sfx.add(pan_st(cork_pop(56, 760.0), 0.0), c["blind_end"] + 0.03, db(G["mask"]))       # the sleep mask pops on (in the pause)

# ================================================================= the chameleon: two leashes
sfx.add(pan_st(low_whoosh(0.28, 60), -0.4), SHOT["weird"] - 0.12, db(G["whoosh"]))     # the whip
sfx.add(pan_st(cork_pop(61, 700.0), 0.3), c["two"] - 0.14, db(G["pop"] - 3))           # its tiny brain pops up
bed.add(pan_st(servo(c["one_f"] - c["chameleon"], 380.0, 520.0, 62, edges=True), 0.35), c["chameleon"], db(G["servo"]))   # roaming eyes
bed.add(pan_st(servo(0.4, 300.0, 620.0, 63, edges=True), 0.2), c["forward"] - 0.08, db(G["swivel"]))      # one eye forward
bed.add(pan_st(servo(0.4, 620.0, 300.0, 64, edges=True), 0.5), c["back"] - 0.08, db(G["swivel"]))         # one eye back
for i in range(6):                                                                    # his eyes trying to copy: hop, hop
    bed.add(pan_st(eye_tick(65 + i), -0.4), [c["one_f"], c["forward"] + 0.25, c["one_b"], c["back"] + 0.2, c["back_end"] + 0.35, c["back_end"] + 0.75][i] + 0.02, db(G["hop"]))

# ================================================================= the fly, the snap, the gulp
sfx.add(pan_st(fly_buzz(c["fly_land"] - c["fly_in"] + 0.05, 70), 0.4), c["fly_in"], db(G["buzzlo"]))
bed.add(pan_st(buzz_hi(c["fly_land"] - c["fly_in"], 190.0, 71), 0.3), c["fly_in"], db(G["buzz"]))
bed.add(pan_st(glint(7900, 0.06, 72), 0.0), c["fly_land"] + 0.02, db(G["land"]))      # it lands on his nose
bed.add(pan_st(buzz_hi(c["snap"] - c["fly_land"], 60.0, 73), 0.0), c["fly_land"] + 0.06, db(G["buzz"] - 5))   # rubbing its hands
sfx.add(pan_st(pew(0.1, 74, 2600.0, 900.0), 0.3), c["snap"] - 0.02, db(G["thwip"]))   # THWIP (in the pause after "fly.")
sfx.add(pan_st(snap(75), 0.0), c["snap"] + 0.06, db(G["snapg"]))                      # SNAP
sfx.add(pan_st(gulp(76), 0.4), c["gulp"] - 0.06, db(G["gulp"]))                       # gulp

# ================================================================= the button: now try the RIGHT one, and the loop
sfx.add(pan_st(low_whoosh(0.26, 80), 0.0), SHOT["button"] - 0.1, db(G["whoosh"] - 1))
for i, (t0, sd) in enumerate([(SHOT["button"], -0.6), (SHOT["button"] + 0.05, 0.6)]):   # the butterflies flutter in again
    bed.add(pan_st(flutter(DUR - t0, 81 + i, edges=True), sd), t0, db(G["flap"]))
bed.add(pan_st(ratchet(DUR - (c["right2"] - 0.1), 8.0, 12.0, 83, edges=True, f=5600.0), 0.0), c["right2"] - 0.1, db(G["strain"]))
for i, h in enumerate([-1.25, -0.55]):                                                # the button's two hops (scenes.js OE_NEG_HOPS)
    bed.add(pan_st(eye_tick(84 + i), 0.25 if i % 2 else -0.25), DUR + h + 0.02, db(G["hop"]))

# ================================================================= score (a sunny pizzicato/marimba groove; drops for punchlines)
BPM = 116
# no score under the test and its fail; it starts on "Your eyes"
groove(mus, c["your_e"] - 0.05, c["leash"] - 0.05, BPM, ["C", "G", "Am", "F"], gain=-7, seed=10, kick_on=False)
groove(mus, c["look_l"] + 0.05, c["both"] - 0.08, BPM, ["F", "C", "G", "C"], gain=-8, seed=20, kick_on=False, snaps=True)
groove(mus, c["now_c"] + 0.05, c["blind"] - 0.08, BPM, ["Am", "F", "C", "G"], gain=-9, seed=30, kick_on=False, half=True)
groove(mus, c["a_ch"] + 0.1, c["fly_end"], BPM, ["F", "G", "Am", "G"], gain=-8, seed=40, kick_on=False, snaps=True)
groove(mus, c["now_b"] + 0.05, DUR, BPM, ["C", "G"], gain=-11, seed=50, kick_on=False)
silence(mus, [(c["leash"] - 0.05, c["look_l"] + 0.05),           # ONE leash (the clips, the clink)
              (c["both"] - 0.08, c["now_c"] + 0.05),            # BOTH go: the whoosh alone
              (c["blind"] - 0.08, c["a_ch"] + 0.1),             # blindfolded: the mask pops
              (c["fly_end"] - 0.05, c["now_b"] + 0.05),         # THWIP, SNAP, gulp
              (c["forward_end"] - 0.02, c["one_b"] + 0.3),      # stop-time: "...forward... one eye back" (a soft "one")
              (DUR - 0.25, DUR)])                               # into the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": -12.0}, duck={"music": 0.74})
