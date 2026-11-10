"""Your HONEY Could Outlive You 🍯 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The score: a bouncy breakfast groove (C major, 112 bpm) that comes back for the loop; a warm drone inside the jar with a
slide-guitar twang after "DESERT"; a sneaky pizzicato walk under the slurp; the breakfast groove sped up for the
time-lapse and stopped like a tape on "Way longer"; a low drone and a reverent swell in the tomb; a three-note fanfare
after "PYRAMIDS". It drops out for every punchline.
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

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(whoosh=-22, tink=-13, glint=-28, twang=-15, bloop=-17, slurp=-13, gulp=-18, swish=-20, clink=-19, clunk=-14,
         ratchet=-28, tick=-27, page=-27, tape=-22, ding=-19, brush=-29, swell=-21, fanfare=-17, squelch=-22, fly=-19,
         bird=-30, buzz=-31)


def low_whoosh(dur, seed, cut=340):
    """a move of the camera, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def top_only(x, f=5200.0):
    """keep what is above f: a sound that can sit under a word"""
    return filt(x, "highpass", f)


def twang(f0=196.0, dur=0.6, seed=0):
    """a lazy slide-guitar twang: a plucked string that bends down a little, with a wobble (speech band: for a pause)"""
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (1 - 0.06 * np.minimum(1, t / 0.35)) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) * (0.8 ** k) for k in range(1, 9))
    y = filt(y, "lowpass", 2600) * expdecay(n, dur * 0.45)
    return fade(y / (np.abs(y).max() + 1e-9), 0.002, 0.06)


def tape_stop(dur=0.55, seed=0, f0=330.0):
    """the score stopping like a tape: a chord whose pitch falls to nothing (in a pause)"""
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (1 - np.minimum(1, t / dur)) ** 1.6 + 20
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.5 * np.sin(1.5 * ph) + 0.35 * np.sin(2 * ph)
    return fade(filt(y, "lowpass", 1400) * (1 - t / dur) ** 0.5, 0.005, 0.05)


def page_flutter(t0, t1, bus, gain, r0=3.0, r1=14.0, seed=0):
    """calendar pages tearing off faster and faster: short papery rips above 4.5 kHz (they can run under a line)"""
    tk, k = t0, 0
    while tk < t1:
        p = (tk - t0) / max(1e-6, t1 - t0)
        bus.add(top_only(page_rip(0.09, seed + k), 4500.0), tk, gain, pan=0.5 * (-1) ** k)
        tk += 1.0 / (r0 + (r1 - r0) * p)
        k += 1


# ================================================================= ambience: the kitchen, inside the jar, the tomb, the desert
kitchen_on = gate(N, [(0, SHOT["desert"]), (SHOT["lid"], SHOT["tomb"]), (SHOT["loop"], DUR)], smooth=0.04)
room = filt(brown(N, 1), "lowpass", 220) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.13 * tt))
amb.x += pan_st(room, -0.1) * 0.45 * kitchen_on
amb.x += pan_st(filt(np.sin(2 * np.pi * 60.0 * tt), "lowpass", 140) * 0.05, 0.2) * kitchen_on   # the fridge
jar_on = gate(N, [(SHOT["desert"], SHOT["lid"])], smooth=0.04)
air = filt(pink(N, 2), "lowpass", 300) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.21 * tt + 0.4))
amb.x += pan_st(air, 0.2) * 0.8 * jar_on
amb.x += pan_st(filt(white(N, 3), "highpass", 6500) * 0.05 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.37 * tt)), -0.3) * jar_on   # heat haze hiss
tomb_on = gate(N, [(SHOT["tomb"], SHOT["pyramid"]), (SHOT["button"], SHOT["loop"])], smooth=0.04)
amb.x += pan_st(filt(brown(N, 4), "lowpass", 160), 0.0) * 0.7 * tomb_on                        # the cave's low air
fire = fire_rumble(DUR, 5, top=240.0)
amb.x += pan_st(fire[:N] if len(fire) >= N else np.pad(fire, (0, N - len(fire))), -0.4) * 0.6 * tomb_on
amb.x += pan_st(L.crackle(N, 9.0, 6, 5400, 9000) * 0.12, 0.4) * tomb_on                           # torch crackle (top)
dunes_on = gate(N, [(SHOT["pyramid"], SHOT["button"])], smooth=0.04)
wind = filt(pink(N, 7), "lowpass", 340) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.19 * tt + 1.0))
amb.x += pan_st(wind, 0.3) * 0.9 * dunes_on
# birds outside the kitchen window, in the pauses
for t_b, sd in ((0.0, 1), (12.6, 3), (25.44, 4)):
    if t_b < DUR - 0.2:
        sfx.add(pan_st(tweet(sd, 3600.0 + 180 * sd), -0.6), t_b, db(G["bird"]))

# ================================================================= the hook: the drizzle; bread, banana, HONEY? -> Honey. TING
bed.add(pan_st(filt(gurgle(1.2, 10, rate=6), "lowpass", 300), 0.1), 0.05, db(-30))                 # honey pouring (low)
for i, (cue, m) in enumerate((("bread", 84), ("banana", 86), ("honey1", 91))):
    bed.add(pan_st(glint(5600 + 400 * i, 0.06, 11 + i), -0.3 + 0.3 * i), c[cue] + 0.02, db(G["glint"]))   # the camera lands on each (top)
sfx.add(pan_st(low_whoosh(0.3, 12), -0.3), c["banana"] - 0.25, db(G["whoosh"] + 2))
sfx.add(pan_st(low_whoosh(0.3, 13), 0.4), c["honey1"] - 0.3, db(G["whoosh"] + 2))
sfx.add(pan_st(glass_tink(14, 3300.0, 0.16), 0.3), c["honey2_end"] + 0.04, db(G["tink"]))            # TING: the jar (in the pause)
for i in range(3):
    bed.add(pan_st(glint(6400 + 500 * i, 0.08, 15 + i), 0.35), c["honey2_end"] + 0.1 + 0.05 * i, db(G["glint"] + 2))

# ================================================================= desert: the whip into the jar; it's a DESERT (twang)
sfx.add(pan_st(whoosh(0.28, 300, 2400, 20, 0.9), 0.5), SHOT["desert"] - 0.32, db(G["whoosh"]))   # the whip (in the pause before "To")
sfx.add(pan_st(filt(L.whoosh(0.5, 90, 300, 21, 0.7), "lowpass", 260), 0.0), SHOT["desert"] + 0.05, db(G["whoosh"] + 3))
bed.add(pan_st(top_only(L.crackle(int(2.4 * SR), 26.0, 22, 5400, 9500)), -0.2), SHOT["desert"] + 0.1, db(-30))   # the heat (top)
sfx.add(pan_st(twang(196.0, 0.44, 23), -0.2), c["desert_end"] + 0.03, db(G["twang"]))               # twaaang (in the gap before "All")
for i in range(3):
    bed.add(pan_st(filt(breath(0.16, 24 + i), "highpass", 5000), 0.3), c["germs"] + 0.35 * i, db(-32))  # the germ pants (top)

# ================================================================= slurp: grains pop up; SLURPS; the germ shrivels; the canteen
for i, d in enumerate((-0.05, 0.12, 0.28)):
    sfx.add(pan_st(bloop(170, 60, 0.32), -0.3 + 0.3 * i), c["sugar"] + d, db(G["bloop"]))          # plop (low)
    bed.add(pan_st(glint(6000 + 600 * i, 0.06, 30 + i), -0.3 + 0.3 * i), c["sugar"] + d + 0.08, db(G["glint"]))
bed.add(pan_st(top_only(squeak(0.1, 5400, 6800), 5200.0), 0.2), c["slurps"] - 0.12, db(G["glint"] + 2))   # straws in (top)
# the slurping under the words: only its fizz above 5.2 kHz, and low glugs as the water goes up the straws
bed.add(pan_st(top_only(slurp(c["in_it_end"] - c["slurps"], 31, rate=12.0), 5200.0), 0.1), c["slurps"], db(G["slurp"] - 6))
for i in range(4):
    sfx.add(pan_st(glug_low(32 + i), -0.2 + 0.15 * i), c["slurps"] + 0.55 + 0.62 * i, db(G["gulp"]))
bed.add(pan_st(top_only(crumple(0.9, 33), 5000.0), 0.0), c["germ"], db(-27))                        # the germ crinkles up (top)
# the last big SLUUURP in the gap after "in it.", then the canteen whisked behind his back
sfx.add(pan_st(slurp(0.36, 34, rate=16.0), 0.1), c["in_it_end"] + 0.03, db(G["slurp"]))
sfx.add(pan_st(low_whoosh(0.2, 35, 380), -0.4), c["spy"] + 0.08, db(G["swish"]))

# ================================================================= lid: clink, the thread, clunk
sfx.add(pan_st(low_whoosh(0.24, 40), 0.2), SHOT["lid"] - 0.1, db(G["whoosh"]))
bed.add(pan_st(glass_tink(41, 5400.0, 0.08), 0.0), c["lid"] + 0.04, db(G["clink"]))                 # the lid meets the rim (top)
bed.add(pan_st(ratchet(c["clunk"] - c["lid"] - 0.05, 22.0, 30.0, 42, edges=True, f=6000.0), 0.0), c["lid"] + 0.06, db(G["ratchet"]))
sfx.add(pan_st(filt(kick(1.0), "lowpass", 230), 0.0), c["clunk"], db(G["clunk"]))                    # clunk (low, on "on")

# ================================================================= aging: the time-lapse (ticks, pages, the groove at speed) ... tape stop
sfx.add(pan_st(low_whoosh(0.3, 50), -0.3), SHOT["aging"] - 0.12, db(G["whoosh"]))
ticking(c["lapse"], c["way"] - 0.1, bed, db(G["tick"]), r0=5, r1=26, seed=51)
page_flutter(c["lapse"] + 0.2, c["way"] - 0.15, bed, db(G["page"]), seed=52)
bed.add(pan_st(top_only(riser(c["centuries_end"] - c["lapse"], 53, 400, 2400), 5000.0), 0.0), c["lapse"], db(-28))
bed.add(pan_st(top_only(mosquito_whine(1.2, 54, 640.0, 0.0, edges=True), 5200.0), -0.4), c["centuries"] - 0.4, db(G["buzz"]))   # flies on the banana
sfx.add(pan_st(tape_stop(0.5, 55, 320.0), 0.0), c["centuries_end"] + 0.03, db(G["tape"]))          # the lapse winds down (in the gap)
sfx.add(pan_st(glass_tink(56, 3500.0, 0.18), 0.3), c["you_end"] + 0.05, db(G["tink"]))              # TING: the jar, still new (pause)
for i in range(2):
    bed.add(pan_st(glint(6600 + 500 * i, 0.08, 57 + i), 0.35), c["you_end"] + 0.12 + 0.06 * i, db(G["glint"] + 2))

# ================================================================= tomb: the whip; the brush; the lift; a reverent swell
sfx.add(pan_st(whoosh(0.28, 280, 2200, 60, 0.9), -0.5), SHOT["tomb"] - 0.3, db(G["whoosh"]))       # the whip (in the pause)
bed.add(pan_st(nail_scratch(c["found"] - 0.1 - c["the"], 61, rate=6.0, edges=True), 0.3), c["the"], db(G["brush"]))   # brushing (top)
sfx.add(pan_st(filt(L.whoosh(0.4, 80, 260, 62, 0.6), "lowpass", 240), 0.2), c["found"] - 0.1, db(G["whoosh"] + 2))     # the lift (low)
swell = pad([mtof(m) for m in (62, 66, 69, 74)], 0.62, 0.12, 2400, 63)
sfx.add(pan_st(fade(swell, 0.02, 0.18), 0.0), c["found_end"] + 0.02, db(G["swell"]))               # aaah (in the gap)
for i in range(4):
    bed.add(pan_st(glint(5800 + 450 * i, 0.08, 64 + i), -0.3 + 0.2 * i), c["found_end"] + 0.05 + 0.08 * i, db(G["glint"]))

# ================================================================= pyramid: the whip; the tags; ta-da
sfx.add(pan_st(whoosh(0.3, 260, 2000, 70, 0.9), 0.5), SHOT["pyramid"] - 0.18, db(G["whoosh"]))
bed.add(pan_st(glint(6200, 0.07, 71), -0.3), c["tag1"] + 0.02, db(G["glint"] + 3))                 # the tags pop (top)
bed.add(pan_st(glint(6800, 0.07, 72), 0.3), c["tag2"] + 0.02, db(G["glint"] + 3))
for i, m in enumerate((67, 72, 76)):                                                                 # da-da-DAA (in the gap)
    sfx.add(pan_st(fade(slide(mtof(m) * 0.985, mtof(m), 0.2 if i < 2 else 0.34, vib=0.004, top=3200), 0.004, 0.05), 0.1), c["pyramids_end"] + 0.04 + 0.12 * i, db(G["fanfare"] - (2 if i < 2 else 0)))

# ================================================================= button: the scoop (squelch, low); the fly; the loop
sfx.add(pan_st(low_whoosh(0.22, 80), -0.2), SHOT["button"] - 0.08, db(G["whoosh"]))
sfx.add(pan_st(filt(squelch(0.4, 81), "lowpass", 300), 0.2), c["scoop"], db(G["squelch"]))       # the crust lifts (low)
bed.add(pan_st(top_only(mosquito_whine(c["one_end"] - c["maybe"], 82, 520.0, 0.0, edges=True), 5200.0), 0.4), c["maybe"], db(G["buzz"] + 2))
sfx.add(pan_st(mosquito_whine(0.26, 83, 560.0, 0.15), 0.5), c["one_end"] + 0.01, db(G["fly"]))     # bzzz (the gap before the loop)

# ================================================================= score (drops out for every punchline)
BREAKFAST = ["C", "Am", "F", "G"]
groove(mus, 0.15, c["honey1_end"] - 0.05, 112, BREAKFAST, gain=-1, seed=10, cutoff=1500)
drone(mus, SHOT["desert"] + 0.2, c["desert"] - 0.1, [50, 57, 62], cutoff=700, gain=-26, seed=11)          # the warm jar
groove(mus, c["all"] + 0.1, c["in_it_end"], 100, ["Dm", "Dm", "A", "Dm"], gain=-4, seed=12, kick_on=False, arp=False, cutoff=1100)   # sneaky walk
groove(mus, c["and"] + 0.05, c["centuries_end"], 168, BREAKFAST, gain=-5, seed=13, sixteen=True, cutoff=1600)   # the lapse, at speed
drone(mus, c["way"] + 0.1, SHOT["tomb"] - 0.02, [48, 55, 60], cutoff=520, gain=-28, seed=14)              # the old man's quiet
drone(mus, SHOT["tomb"] + 0.05, c["found_end"], [38, 45, 50, 53], cutoff=600, gain=-24, seed=15)        # the tomb (D minor, low)
drone(mus, SHOT["pyramid"] + 0.1, c["pyramids_end"], [43, 50, 55, 59], cutoff=800, gain=-25, seed=16)   # dusk
groove(mus, SHOT["loop"], DUR, 112, BREAKFAST, gain=-1, seed=10, cutoff=1500)                            # back to breakfast (the loop)
silence(mus, [(c["honey1_end"] - 0.05, SHOT["desert"] + 0.2),     # "Honey." TING
              (c["desert"] - 0.1, c["all"] + 0.1),                 # DESERT, twang
              (c["in_it_end"], c["and"] + 0.05),                   # the last slurp, the lid
              (c["centuries_end"], c["way"] + 0.1),                # the tape stop
              (c["found_end"], SHOT["pyramid"] + 0.1),             # aaah
              (c["pyramids_end"], SHOT["loop"])])                  # ta-da, "Maybe don't eat THAT one", bzzz

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": -12.0}, duck={"music": 0.74})
