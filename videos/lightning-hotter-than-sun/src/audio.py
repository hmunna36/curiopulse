"""Lightning Is 5x HOTTER Than the Sun's Surface ⚡ Short: sound design, score and mix, cue-locked to timeline.json.

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

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(whoosh=-22, sizzle=-27, catch=-21, crack=-17, roll=-19, tick=-28, riser=-24, stamp=-18, cricket=-29, shiver=-20,
         buzz=-30, ding=-20, glow=-26, blast=-15, boom=-16.5, ring=-31, strike=-17, glass=-11, sparkle=-27, yank=-22,
         crumble=-27, pop=-17, thud=-19)


def low_thud(cut=220):
    """a heavy low thump, all of it under ~220 Hz (it can sit on a word)"""
    return filt(kick(1.0), "lowpass", cut)


def low_whoosh(dur, seed, cut=320):
    """a move of the camera, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def top_only(x, f=5200.0):
    """keep what is above f: a sound that can sit under a word"""
    return filt(x, "highpass", f)


def sizzle(dur, seed=0):
    """a marshmallow (or the air) frying: crackle above 5 kHz with a soft hiss"""
    n = int(dur * SR)
    y = L.crackle(n, 60.0, seed, 5200, 10000) + 0.25 * filt(white(n, seed + 1), "highpass", 6000)
    return fade(y, 0.05, 0.08)


def bolt_buzz(dur, seed=0):
    """the bolt that never stops: a low mains hum under 230 Hz and a fizz above 5.4 kHz (it runs under the words)"""
    n = int(dur * SR)
    t_ = np.arange(n) / SR
    hum = (np.sin(2 * np.pi * 60 * t_) + 0.5 * np.sin(2 * np.pi * 120 * t_) + 0.3 * np.sin(2 * np.pi * 180 * t_)) * (0.8 + 0.2 * np.sin(2 * np.pi * 7.3 * t_))
    fizz = L.crackle(n, 26.0, seed, 5400, 10000) * 0.8
    return fade(filt(hum, "lowpass", 230) * 0.5 + fizz, 0.1, 0.1)


def thunder_low(dur, seed, cut=260):
    """a thunder roll kept under the voice band (it can lie under a line)"""
    return filt(L.thunder(dur, seed), "lowpass", cut)


def ear_ring(dur, f=6400.0):
    """tinnitus after the bang: one thin tone above 5 kHz that fades"""
    n = int(dur * SR)
    t_ = np.arange(n) / SR
    return fade(np.sin(2 * np.pi * f * t_) * np.exp(-t_ / (dur * 0.55)), 0.01, 0.2)


# ================================================================= ambience: the summit in the rain; the desert wind
summit_on = gate(N, [(0, SHOT["dune"]), (SHOT["button"], DUR)])
rain_lo = filt(pink(N, 3), "lowpass", 380) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * tt))
rain_hi = filt(white(N, 4), "highpass", 6200) * 0.10
amb.x += pan_st(rain_lo, -0.15) * 0.42 * summit_on + pan_st(rain_hi, 0.2) * 0.42 * summit_on
wind = filt(pink(N, 5), "lowpass", 300) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.09 * tt + 0.7))
amb.x += pan_st(wind, 0.35) * 0.25 * summit_on
desert_on = gate(N, [(SHOT["dune"], SHOT["button"])])
amb.x += pan_st(filt(pink(N, 6), "lowpass", 280) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * tt)), -0.3) * 0.4 * desert_on
amb.x += pan_st(filt(white(N, 7), "highpass", 6500) * 0.06, 0.3) * desert_on                    # sand hissing over the crest
# the bolt itself, wherever it is on screen (the summit shots)
bolt_on = gate(N, [(0, SHOT["thunder"]), (SHOT["button"], DUR)], smooth=0.05)
bed.x += pan_st(bolt_buzz(DUR, 11), 0.35) * db(G["buzz"]) * bolt_on

# ================================================================= the hook: roasting a marshmallow in the bolt
bed.add(pan_st(sizzle(c["hotter"] - 0.0, 12), 0.45), 0.0, db(G["sizzle"]))                    # it toasts (top only)
sfx.add(pan_st(fire_rumble(1.2, 13, 240), 0.4), c["hotter"] - 0.02, db(G["catch"]))           # it catches (low, on the word)
bed.add(pan_st(sizzle(2.0, 14), 0.45), c["hotter"], db(G["sizzle"] + 3))          # ...and burns (top)
_surface_end = TL["words"][[w["word"] for w in TL["words"]].index("surface.")]["end"]
sfx.add(pan_st(L.crack(0.22, 15, 0.04, 900), 0.2), _surface_end + 0.03, db(G["crack"]))   # CRACK in the gap

# ================================================================= the reveal: Lightning.
sfx.add(pan_st(low_whoosh(0.26, 20), 0.3), SHOT["reveal"] - 0.12, db(G["whoosh"]))
sfx.add(pan_st(thunder_low(1.6, 21), 0.0), c["lightning"], db(G["roll"]))                      # the roll under the word

# ================================================================= the thermometers: up to five times hotter
bed.add(pan_st(ratchet(c["five"] - c["upto"], 14.0, 30.0, 30, edges=True, f=6000.0), -0.4), c["upto"], db(G["tick"]))   # the Sun's column
bed.add(pan_st(ratchet(c["hotter2"] - c["five"], 20.0, 60.0, 31, edges=True, f=6400.0), 0.3), c["five"], db(G["tick"]))  # lightning's, faster
sfx.add(pan_st(filt(riser(c["hotter2"] - c["five"], 32, 80, 260), "lowpass", 300), 0.2), c["five"], db(G["riser"]))     # (low)
sfx.add(pan_st(low_thud(240), 0.2), c["hotter2"], db(G["thud"]))                              # the column bursts out (low)
for i in range(5):
    bed.add(pan_st(glint(5800 + 500 * i, 0.07, 33 + i), 0.3 - 0.1 * i), c["hotter2"] + 0.05 * i, db(G["sparkle"]))
sfx.add(pan_st(ding(91, 0.14, 34, 1.4), 0.0), c["hotter2_end"] + 0.04, db(G["stamp"]))         # the 5x stamp (in the pause)
sfx.add(pan_st(cricket(35, 2, 4700), -0.3), TL["words"][[w["word"] for w in TL["words"]].index("basically...")]["end"] + 0.05, db(G["cricket"]))
sfx.add(pan_st(shiver(0.28, 36), -0.2), c["luke_end"] + 0.04, db(G["shiver"]))                # brrr (in the gap)

# ================================================================= the thumb: a giant zap... thin as your thumb
sfx.add(pan_st(low_whoosh(0.3, 40), -0.3), SHOT["thumb"] - 0.12, db(G["whoosh"]))
sfx.add(pan_st(filt(L.whoosh(c["thin"] - c["giant"], 900, 160, 41, 0.6), "lowpass", 300), 0.0), c["giant"], db(G["whoosh"] + 2))  # the dive down the bolt (low)
bed.add(pan_st(zap(c["thumb"] - c["zap"], 42, 118.0, edges=True), 0.2), c["zap"], db(G["buzz"] + 4))                           # the zap runs (edges)
sfx.add(pan_st(ding(84, 0.12, 43, 1.1), -0.2), c["thumb_end"] + 0.04, db(G["ding"]))            # boop: the same width (in the pause)

# ================================================================= the boom: the air cooks, then EXPLODES
bed.add(pan_st(sizzle(c["explodes"] - c["cooks"], 50), -0.3), c["cooks"], db(G["glow"]))       # the air fries (top)
sfx.add(pan_st(fire_rumble(c["explodes"] - c["cooks"], 51, 220), -0.3), c["cooks"], db(G["glow"] + 2))   # (low)
sfx.add(pan_st(low_thud(200), -0.2), c["explodes"], db(G["blast"]))                           # the blast (low, on the word)
sfx.add(pan_st(top_only(L.crack(0.3, 52, 0.06, 900)), -0.2), c["explodes"], db(G["blast"] - 6))
sfx.add(pan_st(fade(L.thunder(0.6, 53), 0.005, 0.12), 0.0), c["explodes_end"] + 0.02, db(G["boom"]))   # BOOM in the gap
sfx.add(pan_st(thunder_low(1.6, 54, 240), 0.0), c["explodes_end"] + 0.4, db(G["roll"]))        # its tail, under "That BOOM?"

# ================================================================= the thunder face: ears ringing
bed.add(pan_st(ear_ring(1.6), 0.0), SHOT["thunder"] + 0.05, db(G["ring"]))
sfx.add(pan_st(thunder_low(1.4, 60, 250), 0.0), c["thunder"], db(G["roll"]))

# ================================================================= the dune: a strike in the sand, glass
sfx.add(pan_st(low_whoosh(0.3, 70), 0.4), SHOT["dune"] - 0.12, db(G["whoosh"]))
sfx.add(pan_st(low_thud(200), 0.2), c["hits"], db(G["strike"]))                              # the strike (low)
bed.add(pan_st(top_only(L.crack(0.3, 71, 0.05, 900)), 0.2), c["hits"], db(G["strike"] - 4))   # (top)
sfx.add(pan_st(thunder_low(1.5, 72, 260), 0.1), c["hits"] + 0.1, db(G["roll"]))
sfx.add(pan_st(fire_rumble(c["glass"] - c["melt"] + 0.2, 73, 220), 0.1), c["melt"] - 0.1, db(G["glow"] + 2))   # it melts (low)
bed.add(pan_st(sizzle(c["glass"] - c["melt"], 74), 0.1), c["melt"], db(G["glow"]))                         # (top)
for i in range(6):
    bed.add(pan_st(glint(6000 + 400 * (i % 4), 0.08, 75 + i), -0.3 + 0.12 * i), c["glass"] + 0.1 + 0.11 * i, db(G["sparkle"]))
sfx.add(pan_st(glass_tink(76, 3200.0, 0.16), 0.0), c["glass_end"] + 0.04, db(G["glass"]))       # tink (in the pause)
sfx.add(pan_st(low_whoosh(0.4, 77, 300), -0.2), c["glass_end"] - 0.75, db(G["yank"]))          # the yank (low)

# ================================================================= the button: thunder, glass, one crispy marshmallow; the loop
sfx.add(pan_st(low_whoosh(0.26, 80), -0.3), SHOT["button"] - 0.12, db(G["whoosh"]))
sfx.add(pan_st(thunder_low(1.3, 81, 240), 0.0), c["b_thunder"], db(G["roll"]))
for i in range(3):
    bed.add(pan_st(glint(6400 + 600 * i, 0.07, 82 + i), -0.4), c["b_glass"] + 0.05 * i, db(G["sparkle"]))
bed.add(pan_st(top_only(crumple(0.5, 85), 5000.0), 0.4), c["crispy"] + 0.1, db(G["crumble"]))   # the charcoal crumbles (top)
sfx.add(pan_st(cork_pop(86, 640.0), 0.4), c["loop_pop"], db(G["pop"]))                        # a fresh one pops on (after the words)
bed.add(pan_st(sizzle(DUR - c["loop_pop"], 87), 0.45), c["loop_pop"] + 0.05, db(G["sizzle"]))  # ...toasting again (into frame 1)

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.1, SHOT["reveal"] - 0.05, BPM, ["Am", "F", "C", "G"], gain=-9, seed=10, kick_on=False)
crash(mus, c["lightning"] + 0.02, gain=-24, seed=11)
groove(mus, c["upto"] + 0.4, c["sun2"], BPM, ["Am", "F", "C", "G"], gain=-8, seed=20)
groove(mus, c["giant"] + 0.05, c["explodes"] - 0.02, BPM, ["Am", "Am", "F", "E"], gain=-8, seed=30, half=True)
drone(mus, SHOT["dune"] + 0.05, c["glass"] - 0.05, [38, 45, 50, 53], cutoff=500, gain=-23, seed=40, swell=0.5)
groove(mus, c["hits"] + 0.3, c["glass"] - 0.05, BPM, ["Dm", "Bb", "F", "C"], gain=-14, seed=41, kick_on=False, snaps=False, half=True)
groove(mus, c["b_thunder"] + 0.1, DUR, BPM, ["Am", "F", "C", "G"], gain=-9, seed=50, kick_on=False)
silence(mus, [(c["sun2"] - 0.02, c["giant"] + 0.05),            # "The Sun's basically... lukewarm." brr
              (c["explodes"] - 0.02, c["hits"] + 0.3),          # the blast, BOOM, the ringing ears, the strike
              (c["glass"] - 0.05, c["b_thunder"] + 0.1),        # GLASS, the tink
              (DUR - 0.15, DUR)])                               # into the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -15, "sfx": -12.0}, duck={"music": 0.74})
