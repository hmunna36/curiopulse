"""How Much Does a Teaspoon of NEUTRON Star Weigh? 🥄 Short: sound design, score and mix, cue-locked to timeline.json.

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

WORDS = TL["words"]
sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C

SFX_LEVEL = -11.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(glint=-29, twang=-24, snap=-20, tap=-31, whip=-17, thoom=-6, crack=-14, clang=-22, tink=-20, riser=-27, whoom=-16,
         vwoom=-25, tick=-33, roar=-22, suck=-15, crunch=-12, pling=-20, rustle=-29, cricket=-20, echo=-27, creak=-22,
         squeak=-18, pack=-29, heave=-27, plop=-5, boing=-13, hum=-26, crackle=-30, throb=-22, boom=-4, ring=-34, debris=-24,
         chirp=-22, brr=-27, puff=-17, clink=-24)


def low_thud(seed=0, f=80.0, dur=0.28):
    """a soft hit heard low: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.08)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def low_whoosh(dur=0.6, seed=0):
    """a big move, all of it under ~380 Hz (it can run under a word; mono)"""
    n = int(dur * SR)
    env = np.sin(np.pi * ar(n) / dur) ** 1.2
    y = filt(brown(n, seed), "lowpass", 380) * env
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def soft_clip(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


def thoom(seed=0, dur=0.9):
    """a weight like a mountain landing: a sub drop, a body slam and the table's wood cracking (for a pause; mono)"""
    n = int(dur * SR)
    t = ar(n)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.35)
    body = filt(brown(n, seed), "lowpass", 300) * np.exp(-t / 0.12)
    wood = crack(0.25, seed + 1, 0.04, 1200)
    y = sub + 0.8 * body / (np.abs(body).max() + 1e-9)
    y[:len(wood)] += 0.55 * wood / (np.abs(wood).max() + 1e-9)
    return soft_clip(fade(y, 0.0005, 0.08), 2.5)


def boom(seed=0, dur=1.8):
    """the explosion: a crack, a huge low blast and a long rumble with debris on top (for its own pause; mono)"""
    n = int(dur * SR)
    t = ar(n)
    blast = filt(white(n, seed), "lowpass", 2200) * np.exp(-t / 0.18)
    sub = np.sin(2 * np.pi * np.cumsum(32 + 70 * np.exp(-t / 0.09)) / SR) * np.exp(-t / 0.6)
    roll = filt(brown(n, seed + 1), "lowpass", 160) * np.exp(-t / 0.7)
    y = 0.9 * blast / (np.abs(blast).max() + 1e-9) + sub + 0.9 * roll / (np.abs(roll).max() + 1e-9)
    cr = crack(0.12, seed + 2, 0.03, 900)
    y[:len(cr)] += 0.8 * cr / (np.abs(cr).max() + 1e-9)
    return soft_clip(fade(y, 0.0004, 0.2), 2.2)


def ring(dur=2.0, f=6300.0):
    """the ears ringing after a bang: a thin high tone that fades (above 5 kHz: it can sit under the next line)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.7) * np.minimum(1, t / 0.05)
    return fade(y, 0.01, 0.2)


def vwoom(seed=0, dur=0.32):
    """a lighthouse beam sweeping past: a soft low swell (all under ~320 Hz) with air on top (it can run under a word)"""
    n = int(dur * SR)
    env = np.sin(np.pi * ar(n) / dur) ** 2
    lo = filt(brown(n, seed), "lowpass", 320) * env
    hi = filt(white(n, seed + 1), "highpass", 5600) * env * 0.25
    y = lo / (np.abs(lo).max() + 1e-9) + hi / (np.abs(hi).max() + 1e-9) * 0.4
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.04)


def suck(dur=0.9, seed=0):
    """an implosion: a reversed whoosh, rising and cut off sharp (for a pause; mono)"""
    w = whoosh(dur, 2400, 200, seed, 0.8)
    w = w[::-1] * np.linspace(0.2, 1, len(w)) ** 2
    return fade(w / (np.abs(w).max() + 1e-9), 0.05, 0.005)


def fit_n(x):
    return np.pad(x, (0, max(0, N - len(x))))[:N]


# ================================================================= the beds
camp_on = gate(N, [(0, SHOT["star"]), (SHOT["payoff"], SHOT["blast"]), (SHOT["blast"] + 0.42, DUR)])
space_on = gate(N, [(SHOT["star"], SHOT["atoms"])])
stad_on = gate(N, [(SHOT["atoms"], SHOT["payoff"])])
# camp at dusk: a breeze under 300 Hz and crickets (they loop with the Short)
amb.x += pan_st(filt(brown(N, 1), "lowpass", 260) * 0.35 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.17 * tt)), 0) * camp_on
crickets(0.2, DUR - 0.3, bed, db(G["cricket"]), seed=3, f=4700, rate=0.9)
# space: a cosmic hum
hum = sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(55.0, 0.5), (82.5, 0.25), (110.0, 0.12)]) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.3 * tt))
amb.x += pan_st(hum * 0.22, 0) * space_on
# the Sun's roar (low), while it is the Sun
sun_on = gate(N, [(SHOT["sun"], c["size"] + 0.2)])
amb.x += pan_st(filt(brown(N, 5), "lowpass", 200) * 0.9 * (0.85 + 0.15 * np.sin(2 * np.pi * 0.6 * tt)), 0) * sun_on
# the empty stadium: wind in the stands, with a long echo
amb.x += pan_st(filt(brown(N, 7), "lowpass", 300) * 0.5 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.25 * tt)), 0) * stad_on

# ================================================================= the hook: the spoon out of the jar, its string, the weighing
for i in range(4):                                                                                    # sparkles off the heap (top)
    bed.add(pan_st(glint(6000 + 450 * i, 0.08, 1 + i), 0.3), 0.05 + 0.13 * i, db(G["glint"]))
bed.add(pan_st(filt(slide(300, 520, 0.4, 0.0, 300), "lowpass", 300), 0.2), 0.0, db(G["twang"]))       # the string stretching (low)
bed.add(pan_st(glint(7200, 0.06, 9), 0.3), 0.5, db(G["snap"]))                                         # ...and it snaps (top)
for k in range(4):                                                                                    # the weighing bounces: soft taps (low)
    bed.add(pan_st(low_thud(10 + k, 150.0, 0.12), 0.25), c["about"] + 0.12 + k * (2 * np.pi / 11), db(G["tap"]))
bed.add(pan_st(top_swish(0.3, 14), 0), c["a_mtn"] - 0.12, db(G["whip"] - 6))                          # the whip up to the mountain (top)
bed.add(pan_st(low_whoosh(0.4, 15), 0), c["a_mtn"] - 0.12, db(G["whip"]))

# ================================================================= the crash: THOOM through the table; the mug, the jar
sfx.add(pan_st(thoom(20), 0), SHOT["crash"] + 0.06, db(G["thoom"]))                                   # MOUNTAIN. ... THOOM
sfx.add(pan_st(crack(0.2, 21, 0.05, 1500), 0.2), SHOT["crash"] + 0.1, db(G["crack"]))                   # the wood
bed.add(pan_st(top_swish(0.25, 22), -0.4), SHOT["crash"] + 0.12, db(G["whip"] - 8))                     # the mug flying (top)
bed.add(pan_st(filt(glass_tink(23, 2600.0, 0.2), "highpass", 4800), 0.4), SHOT["crash"] + 0.58, db(G["tink"]))   # the jar lands (top)
bed.add(pan_st(filt(ding(64, 0.18, 24, bright=0.6), "highpass", 4500), -0.5), SHOT["crash"] + 0.92, db(G["clang"]))   # the mug lands (top)
mus.add(pan_st(filt(riser(SHOT["star"] - c["scoop"], 25, 300, 3000), "highpass", 4800), 0), c["scoop"], db(G["riser"]))   # into the glow
sfx.add(pan_st(whoosh(0.5, 200, 3000, 26), 0), SHOT["star"] - 0.25, db(G["whoom"]))                    # the dive into the star
bed.add(pan_st(low_whoosh(0.6, 27), 0), SHOT["star"] - 0.2, db(G["whip"]))

# ================================================================= space: the beams sweeping past, the field crackling
spin = 1.7
for i, tb in enumerate(np.arange(SHOT["star"] + 0.05, SHOT["sun"] - 0.05, 1 / (2 * spin))):
    bed.add(pan_st(vwoom(30 + i), 0.3 * (-1) ** i), tb, db(G["vwoom"]))
for i, tb in enumerate(np.arange(c["size"], SHOT["atoms"] - 0.1, 1 / (2 * spin))):
    bed.add(pan_st(vwoom(40 + i), 0.3 * (-1) ** i), tb, db(G["vwoom"] - 2))
bed.add(pan_st(filt(crackle(int(1.4 * SR), 30, 50, 5200, 9000), "highpass", 5200), 0), SHOT["star"], db(G["tick"]))
# the Sun caves in: a reversed rush into a crunch, a bright pling as it becomes the small ball
sfx.add(pan_st(suck(0.8, 60), 0), c["crushed"] - 0.55, db(G["suck"] - 6))
bed.add(pan_st(low_thud(61, 60.0, 0.4), 0), c["crushed"] + 0.25, db(G["crunch"]))
bed.add(pan_st(filt(crumple(0.3, 62), "highpass", 5000), 0), c["crushed"] + 0.25, db(G["crunch"] - 12))
for i in range(3):
    bed.add(pan_st(glint(6400 + 600 * i, 0.12, 63 + i), 0.2 * (-1) ** i), c["size"] + 0.05 + 0.07 * i, db(G["pling"] - 6))
sfx.add(pan_st(ding(84, 0.16, 66, bright=1.2), 0.3), c["city_end"] + 0.08, db(G["pling"]))            # city. ... ding (the measure)

# ================================================================= the stadium: empty, a tumbleweed, an echo
bed.add(pan_st(filt(rustle(1.6, 70), "highpass", 4800), -0.5), c["mostly"] - 0.2, db(G["rustle"]))      # the tumbleweed (top)
sfx.add(pan_st(cricket(71, 2, 4400), 0.4), c["space1_end"] + 0.02, db(G["cricket"]))                    # space... (one cricket)
# the squeeze: creaks, a rising rumble, the crunch, his squeak
bed.add(pan_st(filt(creak(1.4, 72, 40, 110), "lowpass", 300), 0), c["crush2"] + 0.2, db(G["creak"]))
bed.add(pan_st(low_whoosh(1.0, 73), 0), c["squeezes"] - 0.1, db(G["creak"] + 2))
bed.add(pan_st(low_thud(74, 70.0, 0.35), 0), c["empty2"] + 0.3, db(G["crunch"]))
bed.add(pan_st(filt(crumple(0.35, 75), "highpass", 5000), 0), c["empty2"] + 0.28, db(G["crunch"] - 12))
bed.add(pan_st(filt(squeak(0.12, 4800, 6400), "highpass", 4600), 0.2), c["empty2"] + 0.24, db(G["squeak"]))
# the pull-back: packed solid, twinkling
bed.add(pan_st(low_whoosh(1.2, 76), 0), c["empty2"] + 0.4, db(G["whip"] - 2))
for i, tp in enumerate(np.arange(c["empty2"] + 0.6, c["out_end"] + 0.1, 0.09)):
    bed.add(pan_st(glint(5600 + 380 * (i % 6), 0.07, 80 + i), 0.5 * np.sin(i * 1.3)), tp, db(G["pack"]))

# ================================================================= the spoon will not budge; he sits down hard
for k, th in enumerate(np.arange(SHOT["payoff"] + 0.1, c["mountain2_end"] - 0.1, 2 * np.pi / 7.5)):
    bed.add(pan_st(filt(creak(0.5, 90 + k, 60, 140), "lowpass", 300), 0.2), th, db(G["heave"]))
sfx.add(pan_st(low_thud(95, 90.0, 0.3), -0.2), c["mountain2_end"] + 0.06, db(G["plop"]))               # mountain. ... THUMP (his bottom)
sfx.add(pan_st(boing(0.35, 160.0, 96), -0.2), c["mountain2_end"] + 0.1, db(G["boing"]))

# ================================================================= it swells: a hum that climbs, crackles, a throb that speeds up
w0, w1 = SHOT["weird"], SHOT["blast"]
nw = int((w1 - w0) * SR)
tw = ar(nw)
fw = 70 + 70 * (tw / (w1 - w0)) ** 2
humw = np.sin(2 * np.pi * np.cumsum(fw) / SR) * (0.3 + 0.7 * (tw / (w1 - w0)) ** 1.5)
bed.add(pan_st(fade(humw, 0.3, 0.05), 0), w0, db(G["hum"]))
for i, tb in enumerate([w0 + 0.6 + x for x in np.cumsum([0.62 * 0.9 ** k for k in range(14)])]):
    if tb < w1 - 0.1:
        bed.add(pan_st(low_thud(100 + i, 70.0, 0.18), 0), tb, db(G["throb"] + 0.4 * i))
bed.add(pan_st(filt(crackle(int((w1 - c["stay"]) * SR), 60, 110, 5200, 9000), "highpass", 5200), 0), c["stay"], db(G["crackle"]))
mus.add(pan_st(filt(riser(w1 - c["would"], 112, 200, 2600), "highpass", 4800), 0), c["would"], db(G["riser"] + 2))

# ================================================================= BOOM; the ringing; one cricket; the soot shaken off
sfx.add(pan_st(boom(120), 0), SHOT["blast"] + 0.01, db(G["boom"]))
bed.add(pan_st(ring(2.4), 0), SHOT["blast"] + 0.3, db(G["ring"]))
for i in range(10):                                                                                     # debris pattering down (top)
    bed.add(pan_st(filt(crack(0.04, 130 + i, 0.01, 5200), "highpass", 5200), 0.6 * np.sin(i)), SHOT["blast"] + 0.5 + 0.11 * i, db(G["debris"]))
sfx.add(pan_st(cricket(140, 1, 4600), 0.3), SHOT["blast"] + 0.72, db(G["chirp"]))                       # ...chirp. (deadpan)
bed.add(pan_st(flutter(0.5, 141, edges=True), 0), SHOT["button"] + 0.08, db(G["brr"]))                 # he shakes the soot off (top)
bed.add(pan_st(low_thud(142, 110.0, 0.2), 0), SHOT["button"] + 0.25, db(G["puff"]))                    # puff (low)
bed.add(pan_st(filt(glass_tink(143, 3200.0, 0.14), "highpass", 4600), 0.3), DUR - 1.55, db(G["clink"]))   # the spoon in the jar (top)
for i in range(3):                                                                                      # the heap's sparkle again: into the loop
    bed.add(pan_st(glint(6000 + 450 * i, 0.08, 150 + i), 0.3), DUR - 0.4 + 0.13 * i, db(G["glint"]))

# ================================================================= subscribe cue: no sound
# The pill of the pill test (25 Oct-8 Nov 2026, the 23:30 slots; timeline_lib.py sets its cues) is SILENT: no pop, no
# click, no bell, and nobody says "subscribe" (user, 24 Oct 2026: "silent subscribe button"). Both arms sound the same.

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.05, c["mountain"] - 0.1, BPM, ["F", "Bb", "C", "F"], gain=-9, seed=10, kick_on=False, snaps=True)   # curious tiptoe
drone(mus, SHOT["star"] + 0.1, c["crushed"] - 0.1, [41, 48, 53, 57, 60], cutoff=600, gain=-25)                       # space: wonder
drone(mus, c["crushed"] + 0.4, SHOT["atoms"] - 0.05, [45, 52, 57, 61, 64], cutoff=900, gain=-23)                     # the bright ball
groove(mus, c["atoms"] + 0.12, c["space1_end"] - 0.05, 96, ["Dm"], gain=-13, seed=30, kick_on=False, snaps=True, cutoff=800)   # empty
drone(mus, c["crush2"] + 0.1, c["empty2"] + 0.25, [38, 45, 50, 53], cutoff=420, gain=-19)                           # the squeeze
drone(mus, c["empty2"] + 0.5, SHOT["payoff"] - 0.05, [53, 57, 60, 65], cutoff=1200, gain=-24)                       # packed: shimmer
groove(mus, c["spoonful"] + 0.2, c["mountain2"] - 0.1, 84, ["F", "C"], gain=-11, seed=40, kick_on=True, snaps=False, half=True, cutoff=700)   # heave-ho
drone(mus, c["oh"] + 0.2, c["explode"] - 0.05, [36, 43, 48, 51], cutoff=480, gain=-21)                              # uh-oh
groove(mus, c["one_spoon"] + 0.1, DUR, BPM, ["F", "Bb", "C", "F"], gain=-9, seed=10, kick_on=False, snaps=True)   # back to the tiptoe: the loop
silence(mus, [(c["mountain"] - 0.1, SHOT["star"] + 0.1),      # a MOUNTAIN. ... THOOM (the whip, the crash)
              (c["crushed"] - 0.1, c["crushed"] + 0.4),       # the cave-in
              (c["space1_end"] - 0.05, c["crush2"] + 0.1),     # space... (a cricket)
              (c["mountain2"] - 0.1, c["oh"] + 0.2),            # weighs a mountain. THUMP
              (c["explode"] - 0.05, c["one_spoon"] + 0.1)])     # EXPLODE. BOOM ... chirp ... Anyway...

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
