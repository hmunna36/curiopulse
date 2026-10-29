"""Was Cleopatra Closer to the Pyramids or the MOON Landing? 🚀 Short: sound design, score and mix, cue-locked to timeline.json.

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

SFX_LEVEL = -10.0   # the whole sfx bus; the gags against each other are in G
G = dict(shutter=-12, shutlow=-16, whip=-16, weed=-15, wind=-20, beckon=-20, rope=-22, ding=-14, crash=-24, whee=-18,
         swish=-24, slide=-14, glow=-15, boing=-11, zip=-22, rewind=-20, thud=-9, wipe=-18, trumpet=-10, sad=-12,
         peer=-13, glint=-22, inflate=-24, pop=-6, beep=-26)


# ================================================================= this Short's atoms
def soft_clip(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


def top_only(y, f=5200):
    return filt(y, "highpass", f)


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


def desert_wind(n, seed=0):
    """a desert wind at dusk (stereo): a soft roar under ~400 Hz that breathes, and a thin whistle above 5 kHz"""
    t = ar(n)
    g = 0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t + 1.1) * np.sin(2 * np.pi * 0.11 * t)
    lo = filt(brown(n, seed), "lowpass", 400) * g
    hi = top_only(white(n, seed + 1), 5800) * (0.3 + 0.7 * g) * 0.1
    l = lo / (np.abs(lo).max() + 1e-9) + hi
    r = np.roll(lo, int(0.013 * SR)) / (np.abs(lo).max() + 1e-9) + np.roll(hi, int(0.006 * SR))
    return np.stack([l, r]) * 0.5


def space_hum(n, seed=0):
    """the Moon / space: a very low hum with a slow swell (all under 160 Hz; stereo)"""
    y = filt(brown(n, seed), "lowpass", 160) * (0.75 + 0.25 * np.sin(2 * np.pi * (2 / DUR) * tt[:n]))
    return pan_st(y / (np.abs(y).max() + 1e-9) * 0.6, 0)


def frame_drum(mus, t0, t1, bpm, gain=0.0, seed=0):
    """a doumbek under the riff: DUM (low, under 200 Hz) and tek (a dry click above 4 kHz): D - T T D T - (maqsum-ish)"""
    beat = 60.0 / bpm
    pat = [(0.0, "D"), (1.0, "T"), (1.5, "T"), (2.0, "D"), (3.0, "T")]
    b0 = t0
    k = 0
    while b0 < t1:
        for bt, kind in pat:
            tb = b0 + bt * beat
            if tb >= t1:
                break
            n = int(0.22 * SR)
            if kind == "D":
                y = np.sin(2 * np.pi * np.cumsum(95 + 70 * np.exp(-ar(n) / 0.02)) / SR) * expdecay(n, 0.12)
                mus.add(pan_st(fade(y, 0.001, 0.03), 0), tb, db(-13 + gain))
            else:
                y = top_only(white(n // 3, seed + k), 3800) * expdecay(n // 3, 0.012)
                mus.add(pan_st(fade(y / (np.abs(y).max() + 1e-9), 0.0005, 0.01), 0.2 * (-1) ** k), tb, db(-24 + gain))
            k += 1
        b0 += 4 * beat


def snake_riff(mus, t0, t1, bpm, gain=0.0, seed=0):
    """a plucked line in E phrygian dominant (E F G# A B C D): the cartoon 'ancient Egypt' (pizzicato, eighths)"""
    E3 = 52
    scale = {"E": 0, "F": 1, "G#": 4, "A": 5, "B": 7, "C": 8, "D": 10}
    line_ = ["E", "F", "G#", "A", "G#", "F", "E", "-", "B", "A", "G#", "F", "G#", "F", "E", "-"]
    step = 60.0 / bpm / 2
    i = 0
    tb = t0
    while tb < t1:
        nm = line_[i % len(line_)]
        if nm != "-":
            m = E3 + 12 + scale[nm]
            mus.add(pizz(mtof(m), 0.38, seed + i) * 1.1, tb, db(-14 + gain), pan=0.15)
            mus.add(harpsi(mtof(m + 12), 0.2, seed + i), tb + 0.004, db(-27 + gain), pan=-0.2)
        tb += step
        i += 1
    drone(mus, t0, t1, [40, 47], cutoff=300, gain=-24 + gain)


def rope_creak(dur, seed=0):
    """a rope taking weight: a slow creak, mostly under 300 Hz with a little grit on top"""
    n = int(dur * SR)
    t = ar(n)
    f = 70 + 30 * np.sin(2 * np.pi * 1.7 * t)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * t) ** 2)
    y = filt(y + 0.3 * filt(brown(n, seed), "lowpass", 260), "lowpass", 300)
    return fade(y / (np.abs(y).max() + 1e-9), 0.05, 0.1)


def tape_rewind(dur, seed=0):
    """time running backwards: a warbling tone that falls, low-passed under ~420 Hz, with a whir above 5 kHz"""
    n = int(dur * SR)
    t = ar(n)
    f = 360 * np.exp(-t / (dur * 0.9)) + 110 + 25 * np.sin(2 * np.pi * 13 * t)
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 + np.sin(2 * np.pi * np.cumsum(f) / SR)
    y = filt(y, "lowpass", 420) + 0.25 * top_only(white(n, seed), 5600) * (0.5 + 0.5 * np.sin(2 * np.pi * 21 * t))
    return fade(y / (np.abs(y).max() + 1e-9), 0.03, 0.08)


def mammoth_trumpet(dur=0.3, seed=0):
    """a short brassy trumpet that swoops up and cracks: an elephant's call, cartoon size (speech band: a pause)"""
    n = int(dur * SR)
    t = ar(n)
    f = 330 + 260 * np.sin(np.pi * np.minimum(1, t / (dur * 0.7))) + 12 * np.sin(2 * np.pi * 31 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) / k ** 0.9 for k in range(1, 12))
    y = filt(np.tanh(1.8 * y), "bandpass", [250, 3800]) * attack_decay(n, 0.02, dur * 0.5)
    y += 0.25 * filt(white(n, seed), "bandpass", [900, 2600]) * attack_decay(n, 0.01, dur * 0.3)
    return soft_clip(fade(y, 0.005, 0.04), 2.0)


def gum_pop(seed=0):
    """a gum bubble bursting: a wet snap with a tiny low thump (0.12 s; speech band: after the word)"""
    n = int(0.12 * SR)
    t = ar(n)
    y = filt(white(n, seed), "bandpass", [900, 6000]) * np.exp(-t / 0.008)
    y += 0.8 * np.sin(2 * np.pi * np.cumsum(220 * np.exp(-t / 0.02) + 90) / SR) * np.exp(-t / 0.03)
    return soft_clip(fade(y, 0.0003, 0.02), 2.6)


def pause_spans(t0, t1, min_gap=0.2):
    out = []
    for a, b in zip(WORDS[:-1], WORDS[1:]):
        if t0 < a["end"] < t1 and b["start"] - a["end"] >= min_gap:
            out.append((a["end"] + 0.03, b["start"] - a["end"] - 0.1))
    return out


# ================================================================= the beds
moon_on = gate(N, [(0, SHOT["giza"]), (SHOT["button"], DUR)])
amb.x += space_hum(N, 3) * moon_on
giza_on = gate(N, [(SHOT["giza"], SHOT["climb"] + 1.2)])
amb.x += desert_wind(N, 5) * giza_on * 0.9
rush = np.interp(tt, [SHOT["climb"], c["up1"], c["up1"] + 0.6, c["reach1"] - 0.3, c["reach1"], c["up2"], c["up2"] + 0.5,
                      c["reach2"] - 0.3, c["reach2"], c["reach2"] + 0.6], [0.3, 0.3, 1, 1, 0.4, 0.4, 1, 1, 0.3, 0])
climb_on = gate(N, [(SHOT["climb"], SHOT["payoff"] + 0.4)])
w = filt(brown(N, 21), "lowpass", 380)
amb.x += pan_st(w / (np.abs(w).max() + 1e-9) * 0.7, 0) * climb_on * rush
amb.x += space_hum(N, 23) * gate(N, [(c["space"], SHOT["past"] + 0.3)]) * 0.8
arc_on = gate(N, [(c["split"], SHOT["button"])])
sea = filt(brown(N, 31), "lowpass", 300) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.31 * tt) ** 2)
amb.x += pan_st(sea / (np.abs(sea).max() + 1e-9) * 0.6, 0.3) * arc_on
amb.x += desert_wind(N, 33) * gate(N, [(c["land"], c["split"] + 0.3)]) * 0.6

# ================================================================= the hook: the selfie. Two soft focus beeps, then the flash
for k, (tp, g) in enumerate(pause_spans(2.6, c["nope"] + 0.05, 0.3)[:1]):
    sfx.add(pan_st(beep(2600.0, 0.05), -0.5), tp + 0.02, db(G["beep"]))
    sfx.add(pan_st(beep(2600.0, 0.05), -0.5), tp + 0.14, db(G["beep"]))
sh_ = shutter()
bed.add(pan_st(top_only(sh_, 4600), -0.4), c["flash"], db(G["shutter"]))           # on "Nope.": only the click's top
bed.add(pan_st(low_thud(1, 120.0, 0.16), -0.2), c["flash"], db(G["shutlow"]))
sfx.add(pan_st(shutter(), -0.4), c["nope_end"] + 0.03, db(G["shutter"] + 2))       # and the whole shutter after the word

# ================================================================= Giza: the whip down to Egypt, the tumbleweed
bed.add(pan_st(low_whoosh(0.5, 10), 0), SHOT["giza"] - 0.12, db(G["whip"]))
bed.add(pan_st(top_swish(0.4, 11), 0), SHOT["giza"] - 0.1, db(G["whip"] - 6))
wd = pause_spans(c["history"], c["climb"] + 0.05, 0.25)
bed.add(pan_st(rustle(1.4, 12) * 0.6 + 0.4 * top_only(white(int(1.4 * SR), 13), 5200)[:len(rustle(1.4, 12))], 0.2), c["weed"], db(G["weed"] - 6))
if wd:
    sfx.add(pan_st(rustle(min(0.45, wd[0][1]), 14), 0.3), wd[0][0], db(G["weed"]))
    sfx.add(pan_st(top_only(white(int(0.5 * SR), 15), 5000) * np.sin(np.pi * ar(int(0.5 * SR)) / 0.5) ** 2, 0.4), wd[0][0], db(G["wind"]))

# ================================================================= the climb: up we go, the counts land with a ding
bed.add(pan_st(low_whoosh(0.7, 30), 0), SHOT["climb"] - 0.1, db(G["whip"]))
bed.add(pan_st(top_swish(0.3, 31), 0.3), c["beckon"], db(G["beckon"]))
bed.add(pan_st(rope_creak(c["reach1"] - c["up1"], 32), -0.2), c["up1"], db(G["rope"]))
bed.add(pan_st(rope_creak(c["reach2"] - c["up2"], 33), -0.2), c["up2"], db(G["rope"]))
for i in range(int((c["reach1"] - c["up1"]) / 0.32)):                                  # hand over hand: dry ticks above 5 kHz
    bed.add(pan_st(top_swish(0.05, 40 + i), -0.3 + 0.2 * (i % 2)), c["up1"] + 0.1 + i * 0.32, db(G["swish"]))
for i in range(int((c["reach2"] - c["up2"]) / 0.26)):
    bed.add(pan_st(top_swish(0.05, 80 + i), -0.3 + 0.2 * (i % 2)), c["up2"] + 0.08 + i * 0.26, db(G["swish"]))
sfx.add(pan_st(ding(84, 0.16, 50, 1.2), 0.2), c["ding1"], db(G["ding"]))
sfx.add(pan_st(ding(88, 0.16, 51, 1.2), 0.2), c["ding2"], db(G["ding"]))
sfx.add(pan_st(ding(91, 0.12, 52, 1.0), 0.2), c["ding2"] + 0.09, db(G["ding"] - 3))

# ================================================================= the payoff: the pull-back, the brackets, the slide, 500
bed.add(pan_st(low_whoosh(1.2, 60), 0), c["pull"], db(G["whip"] - 2))
bed.add(pan_st(top_swish(0.9, 61), 0), c["pull"] + 0.1, db(G["swish"] + 2))
bed.add(pan_st(top_swish(0.3, 62), 0.4), c["brackets"], db(G["swish"] + 4))
bed.add(pan_st(top_swish(0.5, 63), 0.4), c["slide500"], db(G["swish"] + 4))
sfx.add(pan_st(ding(91, 0.14, 64, 1.0), 0.4), c["years2_end"] + 0.03, db(G["glow"]))
sfx.add(pan_st(ding(96, 0.18, 65, 1.0), 0.4), c["years2_end"] + 0.12, db(G["glow"] - 3))

# ================================================================= the past: hop, slide down the rope, rewind, land; the Arctic
hop = pause_spans(c["weirder"], c["while"] + 0.05, 0.25)
if hop:
    sfx.add(pan_st(boing(min(0.34, hop[0][1]), 260.0, 70), 0.1), hop[0][0], db(G["boing"]))
bed.add(pan_st(tape_rewind(c["land"] - c["jump"] - 0.1, 71), 0), c["jump"] + 0.12, db(G["rewind"]))
nz = int((c["land"] - c["jump"]) * SR)
bed.add(pan_st(top_only(white(nz, 72), 5400) * (0.5 + 0.5 * np.sin(2 * np.pi * 17 * ar(nz))), 0.2), c["jump"] + 0.1, db(G["zip"]))
bed.add(pan_st(low_thud(73, 70.0, 0.4), 0), c["land"], db(G["thud"]))
bed.add(pan_st(low_whoosh(0.4, 74), 0), c["split"] - 0.1, db(G["wipe"]))
bed.add(pan_st(top_swish(0.3, 75), 0.6), c["split"], db(G["wipe"] - 2))
sfx.add(pan_st(mammoth_trumpet(0.3, 76), 0.5), c["trumpet"], db(G["trumpet"]))
isl = pause_spans(c["island"], c["so"] + 0.05, 0.3)
if isl:
    sfx.add(pan_st(slide(392.0, 262.0, min(0.42, isl[0][1]), vib=5.0, top=None, harm=6), -0.2), isl[0][0] + 0.02, db(G["sad"]))

# ================================================================= the button: the glasses, the gum, POP
bed.add(pan_st(low_whoosh(0.45, 90), 0), SHOT["button"] - 0.1, db(G["whip"]))
pr = pause_spans(c["cleo5"], c["practically"] + 0.05, 0.25)
if pr:
    sfx.add(pan_st(slide(1800.0, 1100.0, min(0.22, pr[0][1]), vib=0.0, top=None, harm=3), 0.3), pr[0][0], db(G["peer"]))
bed.add(pan_st(glint(6400.0, 0.12, 91), 0.3), c["shades_up"] + 0.05, db(G["glint"]))
ni = int((c["pop"] - c["bubble"]) * SR)
bed.add(pan_st(filt(brown(ni, 92), "lowpass", 260) * np.linspace(0.2, 1, ni), 0.3), c["bubble"], db(G["inflate"]))
sfx.add(pan_st(gum_pop(93), 0.3), c["pop"], db(G["pop"]))

# ================================================================= score (drops out for every punchline)
LOFI = ["Am", "F", "C", "G"]
groove(mus, 0.0, c["nope"] - 0.04, 92, LOFI, gain=-12, seed=10, kick_on=False, snaps=True, cutoff=1100)          # the selfie
snake_riff(mus, c["to_her"] + 0.1, c["ancient"] - 0.06, 112, gain=-10, seed=20)                                    # Egypt
frame_drum(mus, c["to_her"] + 0.1, c["ancient"] - 0.06, 112, gain=-4, seed=21)
mus.add(pan_st(riser(c["years1_end"] - c["pyramid3"], 30, 160, 1300), 0), c["pyramid3"], db(-30))
groove(mus, c["climb"] + 0.1, c["years1_end"] - 0.04, 126, ["Em", "C", "D", "B"], gain=-10, seed=30, kick_on=True, snaps=True,
       cutoff=1300)                                                                                                # the climb
frame_drum(mus, c["climb"] + 0.1, c["years1_end"] - 0.04, 126, gain=-8, seed=31)
crash(mus, c["ding1"], gain=-26, seed=4)
groove(mus, c["cleo4"] + 0.12, c["thousand2_end"] - 0.02, 132, ["Em", "C", "D", "B"], gain=-10, seed=32, kick_on=True, snaps=True,
       cutoff=1500)                                                                                                # higher, faster
mus.add(pan_st(riser(c["thousand2_end"] - c["cleo4"], 33, 200, 1600), 0), c["cleo4"], db(-30))
crash(mus, c["ding2"], gain=-24, seed=5)
drone(mus, c["shes"] + 0.05, c["years2_end"] + 0.3, [45, 52, 57, 64], cutoff=650, gain=-20, swell=0.6)          # the whole rope: wonder
groove(mus, c["by"] + 0.12, c["hundred"] - 0.04, 92, ["F", "C", "G", "Am"], gain=-13, seed=40, kick_on=False, snaps=False,
       bass=False, cutoff=1500)
groove(mus, c["woolly"] + 0.15, c["alive"] - 0.06, 100, ["Am", "Em", "F", "E"], gain=-12, seed=50, kick_on=False, snaps=True,
       cutoff=900)                                                                                                 # meanwhile, a mammoth
groove(mus, c["practically"] + 0.12, c["modern"] - 0.05, 92, LOFI, gain=-12, seed=60, kick_on=False, snaps=True, cutoff=1100)
groove(mus, c["pop"] + 0.2, DUR, 92, LOFI, gain=-12, seed=10, kick_on=False, snaps=True, cutoff=1100)               # into the loop
silence(mus, [(c["nope"] - 0.04, c["to_her"] + 0.1),               # Nope. (flash)
              (c["ancient"] - 0.06, c["climb"] + 0.1),              # ancient history. (the tumbleweed)
              (c["hundred"] - 0.04, c["woolly"] + 0.15),            # hundred years. (ding) Weirder: (boing, the rewind)
              (c["alive"] - 0.06, c["practically"] + 0.12),         # alive. (TOOT) On one island. (sad slide) So Cleopatra?
              (c["modern"] - 0.05, c["pop"] + 0.2)])                # modern. (POP)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
