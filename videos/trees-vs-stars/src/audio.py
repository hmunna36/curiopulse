"""Earth Has More TREES Than Our Galaxy Has STARS 🌲 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Rules (reference/sound.md): a gag's sound goes in the pause after its word; under a word only what lives under ~300 Hz or
above 5 kHz; the score drops out for every punchline.
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

SFX_LEVEL = -12.0   # the whole sfx bus; the gags against each other are in G
G = dict(click=-24, shimmer=-24, board=-17, flip=-15, cheer=-23, rustle=-27, clunk=-12, tink=-27, land=-25, bonk=-6, ding=-15,
         aww=-21, crane=-20, tag=-16, beep=-20, servo=-26, readout=-22, wobble=-22, level=-16, stamp=-10, dive=-15, bird=-27,
         count=-25, tick=-24, slap=-4, plots=-20, pull=-16, slam=-9, boom=-13, rewind=-24, swell=-24, x2=-10, tap=-14, glance=-24,
         loop=-22)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


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
    t = ar(n) / dur
    y = filt(brown(n, seed), "lowpass", 380) * np.sin(np.pi * t) ** 1.2
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def soft_clip(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


def counter_click(seed=0):
    """a tally counter's click: a tiny steel snap, all of it above 4.6 kHz (it can sit under a word; mono)"""
    n = int(0.03 * SR)
    y = filt(white(n, seed), "bandpass", (4600, 9800)) * expdecay(n, 0.0035)
    y2 = np.sin(2 * np.pi * 6800 * ar(n)) * expdecay(n, 0.006) * 0.5
    return fade((y / (np.abs(y).max() + 1e-9)) + y2, 0.0003, 0.01)


def crowd(dur, seed=0):
    """a far stadium crowd roaring (a swell of band noise; most of it low, a hiss on top; mono)"""
    n = int(dur * SR)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7
    y = filt(pink(n, seed), "bandpass", (180, 900)) * (0.8 + 0.2 * np.sin(2 * np.pi * 5.3 * ar(n)))
    y = y / (np.abs(y).max() + 1e-9) + 0.35 * filt(white(n, seed + 1), "highpass", 5200)
    return fade(y * env / (np.abs(y * env).max() + 1e-9), 0.04, 0.12)


def flap(seed=0):
    """a scoreboard digit flipping: three quick flaps (top) over a low knock"""
    n = int(0.22 * SR)
    y = np.zeros(n)
    for k in range(3):
        p = int((0.02 + 0.055 * k) * SR)
        m = int(0.025 * SR)
        y[p:p + m] += filt(white(m, seed + k), "highpass", 4800) * expdecay(m, 0.004) * (1 - 0.2 * k)
    y += 0.6 * low_thud(seed + 9, 140.0, 0.22)[:n]
    return fade(y / (np.abs(y).max() + 1e-9), 0.0005, 0.03)


def fit_n(x):
    return np.pad(x, (0, max(0, N - len(x))))[:N]


hill = gate(N, [(0, SHOT["tie"]), (SHOT["button"], DUR)])
space = gate(N, [(SHOT["tie"], SHOT["ground"]), (SHOT["three"], SHOT["button"])])
day = gate(N, [(SHOT["ground"], SHOT["three"])])

# ================================================================= the beds
# the hill at night: crickets (top), a soft wind (low) and leaves in it (top)
wind = filt(brown(N, 3), "lowpass", 260) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * tt) ** 2)
amb.x += pan_st(wind / (np.abs(wind).max() + 1e-9) * 0.65, -0.1) * hill
leaves = filt(white(N, 5), "highpass", 5200) * (0.35 + 0.65 * np.sin(2 * np.pi * 0.23 * tt) ** 4)
amb.x += pan_st(leaves / (np.abs(leaves).max() + 1e-9) * 0.1, 0.3) * hill
crickets(0.0, SHOT["tie"], bed, -30, seed=11, rate=1.0)
crickets(SHOT["button"], DUR, bed, -30, seed=11, rate=1.0)
# space: a low hum and a faint shimmer
hum = filt(brown(N, 6), "lowpass", 140) + 0.15 * np.sin(2 * np.pi * 49 * tt)
amb.x += pan_st(hum / (np.abs(hum).max() + 1e-9) * 0.55, 0) * space
# the forest by day: leaves (top), birds in the pauses
amb.x += pan_st(leaves / (np.abs(leaves).max() + 1e-9) * 0.16, -0.2) * day

# ================================================================= the hook
for i, tc in enumerate(C["click"]):                                                                      # his counter (top: under the words)
    bed.add(pan_st(counter_click(20 + i), 0.35), tc + 0.05, db(G["click"] - (2 if i % 2 else 0)))
bed.add(pan_st(low_whoosh(0.9, 21), 0), C["trees1"] - 0.1, db(G["crane"] - 4))                        # the pull back (low)
bed.add(pan_st(filt(riser(0.9, 22, 1200, 5200), "highpass", 5000), 0), C["galaxy"] - 0.15, db(G["crane"] - 6))   # the tilt up (top)
for i in range(14):                                                                                      # STARS: every star flares (top)
    bed.add(pan_st(glint(5600 + 190 * (i % 9), 0.07, 30 + i), -0.6 + 0.09 * i), C["shimmer"] + 0.035 * i, db(G["shimmer"] - (i % 3)))
bed.add(pan_st(low_whoosh(0.7, 23), 0), C["close"] - 0.15, db(G["crane"] - 6))                         # back down to him (low)

# ================================================================= the score: TREES 7 : STARS 1
bed.add(pan_st(low_whoosh(0.7, 40), 0.2), C["board"] - 0.15, db(G["board"]))                           # the board shoots up (low)
bed.add(pan_st(filt(ratchet(0.45, 22.0, 40.0, 41), "highpass", 5000), 0.2), C["board"], db(G["board"] - 8))
sfx.add(pan_st(crowd(1.2, 42), 0), C["win_end"] - 0.25, db(G["cheer"]))                                 # win... the forest cheers
for i in range(10):                                                                                      # the wave: a rustle sweeping left to right (top)
    bed.add(pan_st(top_swish(0.16, 43 + i), -0.8 + 0.18 * i), C["wave"] + 0.09 * i, db(G["rustle"]))
sfx.add(pan_st(flap(44), 0.2), C["flip7"], db(G["flip"]))                                                # SEVEN: flap-flap
sfx.add(pan_st(flap(45), 0.3), C["flip1"], db(G["flip"]))                                                # one: flap-flap
sfx.add(pan_st(soft_clip(low_thud(46, 110.0, 0.2), 2.0), 0.2), C["clunk"], db(G["clunk"]))              # one. ... his counter drops (clunk)
sfx.add(pan_st(glass_tink(47, 3600.0, 0.09), 0.2), C["clunk"] + 0.01, db(G["tink"] + 4))

# ================================================================= the give: every star onto a tree
r = np.random.default_rng(50)
t0, t1 = C["pour"] + 0.25, C["pour"] + 2.6
for k in range(70):                                                                                      # stars landing everywhere (top)
    ts = t0 + (t1 - t0) * (k / 70) + r.uniform(-0.03, 0.03)
    bed.add(pan_st(glint(5400 + r.uniform(0, 2800), 0.06, 60 + k), r.uniform(-0.8, 0.8)), ts, db(G["land"] - r.uniform(0, 6)))
bed.add(pan_st(filt(riser(2.4, 51, 300, 2400), "highpass", 5000), 0), C["pour"], db(G["land"] - 4))
sfx.add(pan_st(soft_clip(bonk(), 2.5), 0), C["bonk"], db(G["bonk"]))                                   # tree... BONK, on his head
sfx.add(pan_st(ding(88, 0.14, 52), 0.1), C["bonk"] + 0.08, db(G["ding"]))

# ================================================================= the left: the island
sfx.add(pan_st(slide(520.0, 300.0, 0.3, vib=4.0, top=2400.0, harm=3), -0.4), C["bonk"] + 0.24, db(G["aww"]))   # the sapling droops (in the pause)
bed.add(pan_st(low_whoosh(2.4, 70), 0), C["crane"], db(G["crane"]))                                    # the crane (low)
bed.add(pan_st(filt(riser(2.2, 71, 600, 3600), "highpass", 5000), 0), C["crane"] + 0.2, db(G["crane"] - 4))
sfx.add(pan_st(low_thud(72, 90.0, 0.25), 0), C["tag2"], db(G["tag"]))                                   # 2 TRILLION+ lands (low)
bed.add(pan_st(glint(6600, 0.1, 73), 0), C["tag2"] + 0.02, db(G["tag"] - 8))

# ================================================================= the tie: from orbit
for i, ts in enumerate([SHOT["tie"] + 0.25, C["thing_end"] + 0.02]):                                   # the satellite's beeps (the pauses)
    sfx.add(pan_st(beep(2600.0 if i == 0 else 3100.0, 0.06), 0.3), ts, db(G["beep"]))
bed.add(pan_st(servo(0.4, 300.0, 520.0, 80, edges=True), 0.2), C["squint"], db(G["servo"]))             # the lens racks out and squints (top)
bed.add(pan_st(glint(7000, 0.08, 81), 0.1), C["readout"], db(G["readout"]))                              # the old count pops up (top)
bed.add(pan_st(filt(creak(0.9, 82, 60, 130), "lowpass", 260), 0), C["scale"] + 0.05, db(G["wobble"]))   # the balance wobbles (low)
sfx.add(pan_st(ding(91, 0.16, 83), 0), C["level"], db(G["level"]))                                     # TIE. ... level: ding
sfx.add(pan_st(soft_clip(low_thud(84, 70.0, 0.3)), 0), C["level"] + 0.12, db(G["stamp"]))                # the stamp (low)

# ================================================================= the ground: he counts by day
sfx.add(pan_st(whoosh(0.32, 300, 2600, 90), 0), C["dive"] - 0.12, db(G["dive"]))                        # the dive (in the pause)
bed.add(pan_st(low_whoosh(0.5, 91), 0), C["dive"] - 0.05, db(G["dive"] - 4))
for i, ts in enumerate([C["dive"] + 0.45, C["counted_end"] + 0.12]):                                     # birds (the pauses)
    sfx.add(pan_st(tweet(92 + i, 3500.0 + 300 * i), 0.5 - 0.6 * i), ts, db(G["bird"]))
for i, tc in enumerate(C["counts"]):                                                                    # his counter (top) and a tick on each trunk (top)
    bed.add(pan_st(counter_click(100 + i), 0.3), tc, db(G["count"]))
    bed.add(pan_st(glint(6000 + 300 * i, 0.06, 105 + i), -0.2 + 0.1 * i), tc + 0.08, db(G["tick"]))
bed.add(pan_st(glint(7400, 0.1, 110), 0), C["plots"], db(G["plots"]))                                   # 430,000 PLOTS pops up (top)
sfx.add(pan_st(soft_clip(slap_hit(111), 2.2), 0.3), C["slap"], db(G["slap"]))                          # GROUND. ... SLAP on the trunk

# ================================================================= the three: the real number
sfx.add(pan_st(whoosh(0.3, 2600, 300, 120), 0), C["pull"] - 0.1, db(G["pull"]))                        # the pull out to orbit
bed.add(pan_st(low_whoosh(0.5, 121), 0), C["pull"] - 0.05, db(G["pull"] - 4))
bed.add(pan_st(filt(riser(C["slam"] - C["three"] - 0.05, 122, 400, 3000), "highpass", 5000), 0), C["three"], db(G["pull"] - 6))
bed.add(pan_st(ratchet(C["slam"] - C["three"] - 0.1, 14.0, 44.0, 130, edges=True), 0.1), C["three"] + 0.05, db(G["rewind"]))   # the number rolls up (top)
sfx.add(pan_st(soft_clip(low_thud(123, 60.0, 0.5), 2.5), 0), C["slam"], db(G["slam"]))                 # TRILLION. ... SLAM
sfx.add(pan_st(filt(thunder(0.9, 124), "lowpass", 240), 0), C["slam"], db(G["boom"]))
sfx.add(pan_st(whoosh(0.35, 1800, 500, 125), 0.6), C["slam"] + 0.05, db(G["pull"] - 3))                 # the old card flies off
bed.add(pan_st(ratchet(0.7, 40.0, 14.0, 126, edges=True), -0.2), C["before"] - 0.05, db(G["rewind"]))  # before farming? the clock runs back (top)
bed.add(pan_st(filt(riser(1.0, 127, 500, 3000), "highpass", 5000), 0.2), C["green"], db(G["swell"]))    # the land greens over (top)
sfx.add(pan_st(soft_clip(low_thud(128, 75.0, 0.3)), 0.1), C["x2"], db(G["x2"]))                         # that. ... ALMOST 2x (stamp)
sfx.add(pan_st(ding(84, 0.12, 129), 0.1), C["x2"] + 0.06, db(G["ding"] - 2))

# ================================================================= the button: the sapling taps him... he goes back to the stars
for i, ts in enumerate(C["tap"]):                                                                        # tap, tap (low)
    sfx.add(pan_st(low_thud(140 + i, 170.0, 0.1), -0.4), ts, db(G["tap"]))
    bed.add(pan_st(top_swish(0.05, 142 + i), -0.4), ts, db(G["tap"] - 10))
bed.add(pan_st(top_swish(0.12, 144), -0.2), C["glance"], db(G["glance"]))                                # his head turns (top)
back = [x for x in np.arange(C["back"] + 0.2, DUR - 0.05, 0.26)]
for i, tc in enumerate(back):                                                                            # click, click: back to the stars
    bed.add(pan_st(counter_click(150 + i), 0.35), tc + 0.05, db(G["click"]))
bed.add(pan_st(low_whoosh(0.5, 160), 0), C["loop0"] - 0.05, db(G["loop"]))                              # the push to frame 1 (low)

# ================================================================= score (drops out for every punchline)
groove(mus, 0.25, C["close"] - 0.15, 96, ["F", "C", "Dm", "Bb"], gain=-13, seed=10, kick_on=False, snaps=False, cutoff=1500)  # starry and curious
drone(mus, C["galaxy"] - 0.1, C["stars1_end"] + 0.3, [65, 69, 72, 76], cutoff=1200, gain=-22)                                  # the Milky Way
groove(mus, C["trees_win"] + 0.15, C["one"] - 0.05, 120, ["F", "Bb", "C", "F"], gain=-11, seed=11, kick_on=True, snaps=True)  # the stadium
crash(mus, C["trees_win"] + 0.15, gain=-21, seed=12)
drone(mus, C["give"] + 0.15, C["tree_end"] - 0.05, [60, 64, 67, 71, 74], cutoff=950, gain=-24)                               # the stars come down
mus.add(pan_st(riser(C["tree_end"] - C["give"] - 0.3, 13, 300, 1600), 0), C["give"] + 0.2, db(-28))
drone(mus, C["and2"] + 0.15, C["one2_end"] + 0.1, [41, 48, 53, 57], cutoff=520, gain=-23)                                      # the dark sea of trees
groove(mus, C["funny"] + 0.12, C["tie"] - 0.08, 104, ["Am", "Dm", "E", "Am"], gain=-13, seed=14, kick_on=False, snaps=True, cutoff=1100)   # orbit: sneaky
groove(mus, C["then"] + 0.25, C["ground"] - 0.06, 116, ["C", "G", "Am", "F"], gain=-12, seed=15, kick_on=True, snaps=True, cutoff=1400)   # counting
drone(mus, C["three"] + 0.1, C["trillion2_end"] - 0.02, [48, 55, 60, 64], cutoff=900, gain=-23)                                # the real number
crash(mus, C["slam"], gain=-21, seed=16)
drone(mus, C["before"] + 0.1, C["that_end"] - 0.02, [53, 60, 65, 69, 72], cutoff=800, gain=-24)                               # before farming: green
groove(mus, C["stargazers"] + 0.1, DUR - 0.1, 96, ["F", "C", "Dm", "Bb"], gain=-14, seed=17, kick_on=False, snaps=False, cutoff=1400)  # the hook's groove again
silence(mus, [(C["close"] - 0.15, C["trees_win"] + 0.15),   # And it's not close. (bare)
              (C["one"] - 0.05, C["give"] + 0.15),           # one. clunk
              (C["tree_end"] - 0.05, C["and2"] + 0.15),      # tree... BONK
              (C["one2_end"] + 0.1, C["funny"] + 0.12),
              (C["tie"] - 0.08, C["then"] + 0.25),           # TIE. ding, stamp
              (C["ground"] - 0.06, C["three"] + 0.1),        # GROUND. SLAP
              (C["that_end"] - 0.02, C["stargazers"] + 0.1),  # that. ALMOST 2x
              (C["wrong"] - 0.1, C["back"] + 0.05)])          # the wrong way. (bare: the glance)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -12, "sfx": SFX_LEVEL}, duck={"music": 0.74})
