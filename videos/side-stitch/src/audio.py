"""Why Do You Get a STITCH When You Run? Short: sound design, score and mix, cue-locked to timeline.json.

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

RACE = [(0, SHOT["chafe"]), (SHOT["spot"], SHOT["weird"]), (SHOT["button"], DUR)]
XRAY = [(SHOT["chafe"], SHOT["spot"]), (SHOT["weird"], SHOT["ride"])]
DESERT = [(SHOT["ride"], SHOT["bard"])]
BARD = [(SHOT["bard"], SHOT["button"])]


def low_thud(seed=0, f=70.0, dur=0.22):
    """a hit heard through the body: under 200 Hz, so it can sit on a word"""
    n = int(dur * SR)
    x = np.sin(2 * np.pi * np.cumsum(np.linspace(f * 1.8, f, n)) / SR) * np.exp(-np.linspace(0, 7, n))
    return filt(x, "lowpass", 190)


def hi_tick(seed=0, f=6500.0):
    """a needle's tick above the speech band"""
    n = int(0.05 * SR)
    return filt(white(n, seed), "highpass", f) * np.exp(-np.linspace(0, 9, n)) * 0.8


def camel_groan(dur=0.42, seed=0):
    """a camel's bored groan: a rough low voice that sags"""
    n = int(dur * SR)
    f = np.linspace(190, 120, n) * (1 + 0.05 * np.sin(2 * np.pi * 23 * np.arange(n) / SR))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sign(np.sin(ph)) * 0.5 + np.sin(ph) + 0.4 * np.sin(2 * ph)
    x = filt(x, "lowpass", 1500) * (0.7 + 0.3 * np.sin(2 * np.pi * 31 * np.arange(n) / SR))
    env = np.minimum(1, np.arange(n) / (0.05 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.12 * SR))
    return x * env * 0.5


# ================================================================= ambience (one bed per world, gated to its shots)
amb.x += pan_st(filt(brown(N, 1), "lowpass", 260), 0) * 0.34 * gate(N, RACE)          # the crowd, far off, low
amb.x += pan_st(filt(pink(N, 5), "highpass", 6000), 0) * 0.016 * gate(N, RACE)        # a little air on top
amb.x += pan_st(filt(brown(N, 2), "lowpass", 150), 0) * 0.3 * gate(N, XRAY)           # inside the body: a low hum
amb.x += pan_st(filt(pink(N, 3), "lowpass", 330), 0) * 0.16 * gate(N, DESERT)         # desert wind, low
amb.x += pan_st(filt(pink(N, 7), "highpass", 6500), 0) * 0.012 * gate(N, DESERT)
amb.x += pan_st(filt(brown(N, 4), "lowpass", 200), 0) * 0.22 * gate(N, BARD)          # a quiet room
for k in range(14):                                                                  # the candle spits
    tk = SHOT["bard"] + 0.3 + k * 0.36 + 0.1 * np.sin(k * 7.1)
    bed.add(pan_st(hi_tick(40 + k, 5200), -0.4), tk, db(-30))

# ================================================================= the hook: feet, the needle, the stab
step = np.pi / 12.5                       # two footfalls a cycle of runPose
k = 0
while k * step < c["stab"] + 0.5:
    g = (-15 if k > 1 else -24) if k * step < c["stab"] else -21
    bed.add(pan_st(low_thud(k, 62 + 8 * (k % 2), 0.16), 0.25 * (-1) ** k), k * step + 0.02, db(g))
    k += 1
for i, p in enumerate(c["pokes"]):
    bed.add(pan_st(hi_tick(i), -0.3), p, db(-20))
bed.add(pan_st(low_thud(9, 84, 0.3), -0.2), c["stab"], db(-7))                    # the stab itself, under the word
sfx.add(pan_st(hi_tick(8, 5000), -0.3), c["stab"] + 0.01, db(-16))
sfx.add(pan_st(slide_whistle(0.36, 1500, 520), -0.1), c["ribs_end"] + 0.06, db(-27))   # he folds up, in the pause
for j in range(2):
    bed.add(pan_st(heartbeat(j, 0.9), 0), c["ribs_end"] + 0.05 + j * 0.3, db(-19))

# ================================================================= the answer
sfx.add(pan_st(buzzer(0.22), 0.2), c["cramp"] + 0.05, db(-25))                     # CRAMP? crossed out
bed.add(pan_st(low_thud(3, 90, 0.2), 0.2), c["not"] + 0.02, db(-12))
sfx.add(pan_st(blip(900, 1500, 0.07, 5, 0.03), 0), c["guess_end"] + 0.04, db(-24))
sfx.add(pan_st(riser(0.5, 3, 160, 900), 0), SHOT["chafe"] - 0.5, db(-25))
sfx.add(pan_st(squeak(0.12, 1500, 2300), -0.3), c["chafing_end"] + 0.04, db(-23))      # the rub, after the word
bed.add(pan_st(low_thud(4, 80, 0.25), 0), c["chafing"], db(-10))

# ================================================================= the lining, the bounce, lunch, the rub
bed.add(pan_st(bell(5200, 0.5, 0.4), 0.3), c["slippery"] - 0.02, db(-34))
bed.add(pan_st(low_thud(11, 96, 0.16), -0.4), c["wall"] - 0.6, db(-14))
bed.add(pan_st(low_thud(12, 110, 0.16), 0.3), c["around"] + 0.1, db(-14))
kb = 0
while SHOT["bounce"] + 0.3 + kb * step < c["layers"]:                                # organs thumping about, low
    bed.add(pan_st(low_thud(20 + kb, 58 + 14 * (kb % 2), 0.18), 0.2 * (-1) ** kb), SHOT["bounce"] + 0.3 + kb * step, db(-18))
    kb += 1
sfx.add(pan_st(springs(3, 0.42), 0), c["bounce_end"] + 0.04, db(-26))                 # BOING, in the pause
bed.add(pan_st(bloop(170, 60, 0.3), 0.2), c["full"] - 0.05, db(-19))                  # lunch lands
bed.add(pan_st(bloop(150, 55, 0.3), 0.2), c["full"] + 0.25, db(-19))
sfx.add(pan_st(gulp(2)[: int(0.16 * SR)] * np.linspace(1, 0, int(0.16 * SR)), 0.2), c["stomach_end"] + 0.03, db(-21))
sfx.add(pan_st(squeak(0.12, 1400, 2200), -0.3), c["rub_end"] + 0.03, db(-23))
bed.add(pan_st(low_thud(14, 80, 0.25), -0.3), c["rub"], db(-10))

# ================================================================= the nerves; one spot; it stops
bed.add(pan_st(low_thud(15, 90, 0.3), -0.3), c["sharp"], db(-8))
sfx.add(pan_st(buzz(int(0.2 * SR), 130, 16), -0.3), c["pain_end"] + 0.04, db(-22))             # the nerves fire, after "pain."
sfx.add(pan_st(hi_tick(16, 4200), -0.3), c["pain_end"] + 0.04, db(-16))
sfx.add(pan_st(beep(2400, 0.07), -0.2), c["spot_end"] + 0.03, db(-27))               # the reticle locks
sfx.add(pan_st(beep(3000, 0.07), -0.2), c["spot_end"] + 0.13, db(-27))
sfx.add(pan_st(blip(700, 1400, 0.1, 31, 0.03), 0.2), c["stop_end"] + 0.03, db(-23))    # PAIN: GONE

# ================================================================= the camel
sfx.add(pan_st(camel_groan(0.3, 1), 0.4), c["involved_end"] + 0.03, db(-22))
bed.add(pan_st(low_thud(17, 70, 0.2), 0.4), c["camel1"] - 0.5, db(-12))

# ================================================================= not the breathing muscle
sfx.add(pan_st(low_thud(18, 100, 0.2), 0), c["either_end"] + 0.03, db(-9))            # the stamp
sfx.add(pan_st(blip(800, 1300, 0.08, 33, 0.03), 0), c["either_end"] + 0.05, db(-23))

# ================================================================= the desert: a horse, a camel
hs = 2 * np.pi / 9.5 / 2
kh = 0
while SHOT["ride"] + kh * hs < c["sitting"]:                                          # hooves, soft and low
    th = SHOT["ride"] + kh * hs
    bed.add(pan_st(low_thud(50 + kh, 120 + 30 * (kh % 2), 0.09), -0.2), th, db(-17))
    bed.add(pan_st(hi_tick(60 + kh, 5600), -0.2), th, db(-31))
    kh += 1
sfx.add(pan_st(squeak(0.12, 1300, 2500), -0.2), c["horses_end"] + 0.05, db(-24))      # OW, after "horses..."
sfx.add(pan_st(whoosh(0.3, 500, 2600, 41, 0.9), 0), c["camels"] - 0.34, db(-28))
sfx.add(pan_st(squeak(0.12, 1300, 2500), -0.2), c["camels_end"] + 0.04, db(-24))
sfx.add(pan_st(camel_groan(0.3, 2), 0.3), c["sitting_end"] + 0.08, db(-22))           # the camel's opinion

# ================================================================= Shakespeare
bed.add(pan_st(scribble(1.2, 3), 0.3) * 0.5, c["wrote"], db(-34))
LUTE = [62, 65, 69, 67, 65, 62]
for j, m in enumerate(LUTE):
    mus.add(pizz(mtof(m), 0.5, j), SHOT["bard"] + 0.05 + j * 0.33, db(-27), pan=0.2 * (-1) ** j)
bed.add(pan_st(low_thud(19, 90, 0.3), 0), c["still"], db(-8))                          # the stamp lands, low
sfx.add(pan_st(wahwah(2)[: int(0.5 * SR)] * np.linspace(1, 0, int(0.5 * SR)), 0), c["sure_end"] + 0.05, db(-22))

# ================================================================= the finish: the camel takes the race
sfx.add(pan_st(blip(700, 1400, 0.08, 51, 0.03), -0.3), c["slow"] + 0.75, db(-25))
sfx.add(pan_st(blip(900, 1700, 0.08, 52, 0.03), 0.3), c["forward_end"] + 0.03, db(-23))
hg = np.pi / 16
kg = 0
while c["never"] - 0.15 + kg * hg < c["camel3"] + 0.35:                                # the gallop, under the words
    bed.add(pan_st(low_thud(70 + kg, 90 + 25 * (kg % 3), 0.1), -0.6 + 1.2 * kg * hg / 1.6), c["never"] - 0.15 + kg * hg, db(-19))
    kg += 1
sfx.add(cymbal(5, 0.7) * 0.6, c["end_word"] + 0.04, db(-25))
sfx.add(pan_st(camel_groan(0.34, 3), 0.3), c["end_word"] + 0.12, db(-21))
sfx.add(pan_st(whoosh(0.3, 400, 2600, 77, 0.9), 0), DUR - 0.62, db(-19))               # the whip back to frame 1

# ================================================================= per shot: a soft whoosh into the cuts
for i, s in enumerate(TL["shots"][1:]):
    if s["id"] in ("answer", "subcam", "full", "lining", "nerve", "button", "bounce"):
        continue
    sfx.add(pan_st(whoosh(0.24, 400 + 150 * (i % 4), 2200, 500 + i), 0), s["start"] - 0.2, db(-24))

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-24))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"] - 0.04, db(-20))
        sfx.add(pan_st(bell(1760, 0.22, 0.2), 0), c["sub_tap"] + 0.0, db(-33))

# ================================================================= score (drops out for every punchline)
groove(mus, 0.42, c["stab"], 150, ["F", "Bb"], gain=-5, seed=10)                          # the run
groove(mus, c["guess"] + 0.5, SHOT["lining"], 100, ["Dm"], gain=-8, seed=11, kick_on=False, snaps=False)
groove(mus, SHOT["lining"] + 0.45, c["rub"] - 0.1, 112, ["Dm", "Bb", "F", "C"], gain=-7, seed=12)
groove(mus, SHOT["nerve"] + 0.5, c["sharp"] - 0.1, 112, ["Gm"], gain=-7, seed=13, kick_on=False)
groove(mus, SHOT["spot"] + 0.4, c["stops"] + 0.2, 112, ["Dm", "C"], gain=-6, seed=14)
drone(mus, c["stops"] + 0.3, SHOT["weird"], [53, 60, 65], cutoff=700, gain=-30)
groove(mus, SHOT["weird"] + 0.4, c["either"] - 0.05, 112, ["Bb"], gain=-7, seed=15, kick_on=False)
groove(mus, SHOT["ride"] + 0.4, c["sitting"] - 0.1, 104, ["Dm", "Eb"], gain=-5, seed=16, sixteen=True)
drone(mus, SHOT["bard"] + 2.0, c["still"], [50, 57, 62], cutoff=600, gain=-27)
groove(mus, SHOT["button"] + 0.4, c["camel3"] - 0.05, 120, ["F", "Bb", "C", "F"], gain=-9, seed=17)
silence(mus, [(c["stab"], c["guess"] + 0.4), (c["chafing"] - 0.05, SHOT["lining"] + 0.4), (c["rub"] - 0.1, SHOT["nerve"] + 0.45),
              (c["sharp"] - 0.1, SHOT["spot"] + 0.35), (c["either"] - 0.05, SHOT["ride"] + 0.35), (c["sitting"] - 0.1, SHOT["bard"]),
              (c["still"], SHOT["button"] + 0.35), (c["camel3"] - 0.05, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
