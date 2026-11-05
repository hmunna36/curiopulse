"""Could Every PLANET Fit Between You and the Moon? 🌕 Short: sound design, score and mix, cue-locked to timeline.json.

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

SFX_LEVEL = -9.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(jet=-26, jethi=-34, grind=-24, click=-14, clicklow=-16, capoff=-30, pull=-18, pullhi=-32, fit=-30, hops=-31,
         wob=-20, wobtop=-30, flyin=-22, puff=-22, tape=-30, ping23=-29, snap=-24, snaplow=-22, grab=-30, tug=-24,
         yank=-12, eek=-20.5, cut=-20, moon=-31, far=-17, lift=-21, squish=-20, ghost=-30, fitding=-15, groan=-19,
         pop=-10, poplow=-15, land=-20, thud=-17, cap=-30, snore=-17, loopjet=-26)


# ================================================================= this Short's atoms
def soft_clip(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


def norm(y):
    return y / (np.abs(y).max() + 1e-9)


def top_only(y, f=5200):
    return filt(y, "highpass", f)


def low_only(y, f=280):
    return filt(y, "lowpass", f)


def low_thud(seed=0, f=80.0, dur=0.28):
    """a soft hit heard low: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.08)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(norm(y), 0.0008, 0.04)


def low_whoosh(dur=0.6, seed=0):
    """a big move, all of it under ~380 Hz (it can run under a word; mono)"""
    n = int(dur * SR)
    env = np.sin(np.pi * ar(n) / dur) ** 1.2
    return fade(norm(filt(brown(n, seed), "lowpass", 380) * env), 0.01, 0.05)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(norm(y), 0.003, 0.02)


def space_hum(n, seed=0):
    """deep space (stereo): a low airy hum that breathes on a whole number of cycles (the loop holds), under ~180 Hz"""
    y = filt(brown(n, seed), "lowpass", 170) * (0.75 + 0.25 * np.sin(2 * np.pi * (3 / DUR) * ar(n)))
    return pan_st(norm(y), 0)


def jet_rumble(dur, seed=0):
    """his jetpack: a throaty rumble under ~260 Hz that flutters (it runs under words; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = filt(brown(n, seed), "lowpass", 260) * (0.75 + 0.25 * np.sin(2 * np.pi * 17 * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 2.1 * t))
    return fade(norm(y), 0.05, 0.12)


def jet_hiss(dur, seed=0):
    """the jet's hiss above 5 kHz (it runs under words; mono)"""
    n = int(dur * SR)
    return fade(norm(top_only(white(n, seed), 5400) * (0.7 + 0.3 * np.sin(2 * np.pi * 13 * ar(n)))), 0.05, 0.1)


def grind(dur=0.5, seed=0):
    """a planet scraping along: a low rubbery groan under ~300 Hz with a gritty top (it can sit under words; mono)"""
    n = int(dur * SR)
    t = ar(n)
    body = np.sin(2 * np.pi * np.cumsum(55 + 25 * np.sin(2 * np.pi * 3 * t)) / SR)
    body = low_only(np.tanh(2.2 * body) + 0.4 * brown(n, seed), 300) * np.sin(np.pi * t / dur) ** 0.7
    grit = top_only(crackle(n, 500 * np.ones(n), seed + 1, 5200, 9000, 0.001), 5200) * np.sin(np.pi * t / dur)
    return fade(norm(body) + 0.3 * norm(grit), 0.01, 0.05)


def latch_click(seed=0):
    """CLICK: a planet locking into its slot: a bright latch tick and a hollow knock (speech band: a pause; mono)"""
    n = int(0.16 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * 2350 * t) * np.exp(-t / 0.006) + 0.8 * np.sin(2 * np.pi * 620 * t) * np.exp(-t / 0.025)
    y += 0.5 * filt(white(n, seed), "bandpass", [1500, 6000]) * np.exp(-t / 0.004)
    return soft_clip(fade(y, 0.0003, 0.03), 2.0)


def wobble_low(dur=1.0, seed=0):
    """the tower wobbling: a slow low wub under ~250 Hz that dies away (it runs under words; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(70 + 18 * np.sin(2 * np.pi * 2.1 * t)) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.1 * t)) * np.exp(-t / 0.45)
    return fade(norm(low_only(y, 250)), 0.01, 0.08)


def inflate_low(dur=0.35, seed=0):
    """the giants puffing up: a rising low swell under ~300 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(60 + 80 * t / dur) / SR) * np.minimum(1, t / 0.05) * np.exp(-np.maximum(0, t - dur * 0.7) / 0.05)
    y += 0.5 * low_only(brown(n, seed), 260) * np.sin(np.pi * t / dur)
    return fade(norm(y), 0.004, 0.05)


def snore(seed=0, dur=0.42):
    """a little snore: a buzzy breath in that rattles (a pause, or the tail; mono)"""
    n = int(dur * SR)
    t = ar(n)
    f = 74 + 10 * t / dur
    buzz = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * t))
    y = filt(buzz, "bandpass", [140, 1600]) + 0.6 * filt(pink(n, seed), "bandpass", [400, 2600])
    return fade(norm(y) * np.sin(np.pi * t / dur) ** 1.4, 0.01, 0.06)


def sparkle(t0, freqs, gap, gain, seed=0, bus=None):
    """a run of tiny glints above 5 kHz (it can sit on a word)"""
    for k, f in enumerate(freqs):
        (bus or bed).add(pan_st(glint(f, 0.07, seed + k), 0.3 * (-1) ** k), t0 + gap * k, db(gain))


# ================================================================= the beds
amb.x += space_hum(N, 5) * 0.55

# ================================================================= the hook: the shove, the CLICK, the pull-back
bed.add(pan_st(jet_rumble(c["click"] + 0.1, 11), 0.25), 0.0, db(G["jet"]))                 # frame 1: the jetpack is on
bed.add(pan_st(jet_hiss(c["click"] + 0.1, 12), 0.25), 0.0, db(G["jethi"]))
p_den = c["click"] + 0.9
for k, p in enumerate((1 / 6, 1 / 2, 5 / 6)):                                                # three shoves: Neptune grinds along
    ts = p * p_den - 0.9 - 0.18
    if ts > -0.05:
        bed.add(pan_st(grind(0.5, 20 + k), -0.1), max(0.0, ts), db(G["grind"]))
sfx.add(pan_st(latch_click(30), -0.05), c["click"], db(G["click"]))                          # CLICK (the pause before "Yep!")
bed.add(pan_st(low_thud(31, 95.0, 0.24), -0.05), c["click"], db(G["clicklow"]))
bed.add(pan_st(top_swish(0.16, 32), 0.35), c["click"] + 0.06, db(G["capoff"]))               # the nightcap flies off (top)
bed.add(pan_st(low_whoosh(2.0, 40), 0), c["pull0"], db(G["pull"]))                           # the pull-back (low)
bed.add(pan_st(top_swish(1.3, 41), 0), c["pull0"] + 0.25, db(G["pullhi"]))
sparkle(c["fit"] + 0.04, [6400, 7200, 8000], 0.06, G["fit"], 50)                             # FIT (top)
for k in range(7):                                                                           # side by side: each planet hops
    bed.add(pan_st(glint(5400 + 420 * k, 0.06, 60 + k), 0.12 * (k - 3) / 3), c["side0"] - 0.05 + 0.13 * k + 0.1, db(G["hops"]))
bed.add(pan_st(wobble_low(1.2, 70), 0), c["barely"] + 0.05, db(G["wob"]))                    # Barely: the tower wobbles (low)
for k in range(3):
    bed.add(pan_st(top_only(glass_tink(71 + k, 6200.0, 0.08), 5200), 0.3 * (-1) ** k), c["barely_end"] + 0.06 + 0.17 * k, db(G["wobtop"]))

# ================================================================= the giants: he jets in, they puff up, the tape, the YANK
bed.add(pan_st(jet_rumble(0.7, 80), 0.3), SHOT["giants"], db(G["flyin"]))
bed.add(pan_st(top_swish(0.45, 81), 0.3), SHOT["giants"] + 0.05, db(G["flyin"] - 8))
bed.add(pan_st(inflate_low(0.32, 82), 0), c["hog"], db(G["puff"]))                           # hog: the giants puff up (low)
bed.add(pan_st(ratchet(c["thirds"] + 0.14 - (c["hog"] - 0.05), 22.0, 46.0, 83, edges=True), 0.25), c["hog"] - 0.05, db(G["tape"]))   # the tape pays out (top)
sparkle(c["thirds"] + 0.02, [7000, 7800], 0.07, G["ping23"], 84)                             # 2/3 (top)
bed.add(pan_st(ratchet(0.22, 60.0, 80.0, 85, edges=True), 0.25), c["and2"] - 0.1, db(G["snap"]))   # it snaps back in (top)
bed.add(pan_st(low_thud(86, 120.0, 0.14), 0.25), c["and2"] + 0.12, db(G["snaplow"]))
bed.add(pan_st(jet_rumble(c["take"] + 0.1 - c["and2"], 87), 0.3), c["and2"], db(G["flyin"] - 2))    # over to the rings
bed.add(pan_st(top_only(glass_tink(88, 5600.0, 0.08), 5200), 0.35), c["rings"] + 0.02, db(G["grab"]))   # his fists on the rings
bed.add(pan_st(low_only(creak(0.3, 89, 60, 140), 280), 0.35), c["off"] - 0.18, db(G["tug"]))    # the tug (low)
off_end = c["off_end"]
sfx.add(pan_st(whoosh(0.5, 300, 3800, 90), 0.5), off_end + 0.03, db(G["yank"]))              # the rings fly off (the pause)
sfx.add(pan_st(squeak(0.11, 2300, 3300), -0.4), off_end + 0.5, db(G["eek"]))                  # Saturn: eek!

# ================================================================= the catch: FAR, the drift, a whole Neptune
sfx.add(pan_st(whoosh(0.22, 400, 2400, 100), 0), SHOT["catch"] - 0.12, db(G["cut"]))
sparkle(c["moon2"] + 0.05, [7400], 0.05, G["moon"], 101)
sfx.add(pan_st(slide_whistle(0.16, 900, 1900), 0.0), c["far_end"] + 0.02, db(G["far"]))       # FAR: whee, up (the pause)
dr0, dr1 = c["inout"] - 0.05, c["month_end"] + 0.1
n_dr = int((dr1 - dr0) * SR)
td = ar(n_dr)
lift_f = 85 - 30 * np.sin(np.pi * np.clip(td / (dr1 - dr0), 0, 1))                             # the Moon-elevator: down, then up (low)
bed.add(pan_st(fade(norm(low_only(np.sin(2 * np.pi * np.cumsum(lift_f) / SR) * (0.6 + 0.4 * np.sin(np.pi * td / (dr1 - dr0))), 260)), 0.05, 0.1), 0), dr0, db(G["lift"]))
bed.add(pan_st(grind(0.6, 102), -0.2), c["out1"] - 0.25, db(G["squish"]))                    # Neptune squished (low)
bed.add(pan_st(top_swish(0.4, 103), 0.4), c["whole"] - 0.05, db(G["ghost"]))                 # the ghost slides in (top)
sfx.add(pan_st(ding(84, 0.22, 104), 0.35), c["nep_end"] + 0.05, db(G["fitding"]))             # ding: a perfect fit (the pause)

# ================================================================= the button: the close night, the POP, asleep outside
bed.add(pan_st(grind(1.2, 110), 0), c["so"] + 0.2, db(G["groan"]))                           # the squeeze (low)
sfx.add(pan_st(cork_pop(111, 540.0), 0.3), c["pop"], db(G["pop"]))                           # POP (the pause after "night...")
bed.add(pan_st(low_thud(112, 70.0, 0.3), 0.3), c["pop"], db(G["poplow"]))
bed.add(pan_st(low_thud(113, 85.0, 0.26), 0), c["pop"] + 0.42, db(G["thud"]))                # the Moon drops into the slot (low)
bed.add(pan_st(low_thud(114, 110.0, 0.2), 0.4), c["pop"] + 0.55, db(G["land"]))             # Neptune lands outside (low)
bed.add(pan_st(top_swish(0.12, 115), 0.4), c["sleeps"] - 0.05, db(G["cap"]))                 # the nightcap pops on (top)
sfx.add(pan_st(snore(116), 0.35), c["out_end"] + 0.06, db(G["snore"]))                       # a little snore (the tail)
bed.add(pan_st(jet_rumble(DUR - c["loop"] + 0.05, 11), 0.25), c["loop"], db(G["loopjet"]))  # the loop: his jetpack again

# ================================================================= subscribe cue: no sound (no pill in this Short's arm)

# ================================================================= score (drops out for every punchline)
SPACE = ["C", "Am", "F", "G"]                     # cosmic bowling: bouncy, bright
groove(mus, 0.04, c["click"] - 0.05, 112, SPACE, gain=-10, seed=10, kick_on=False, snaps=True)
groove(mus, c["all"] + 0.15, c["barely"] - 0.05, 112, SPACE, gain=-8, seed=12, kick_on=True, snaps=True)
crash(mus, c["all"] + 0.15, gain=-28)
groove(mus, c["sat1"] + 0.05, c["off"] - 0.05, 112, ["F", "G", "C", "Am"], gain=-10, seed=14, kick_on=True, snaps=True)
drone(mus, c["one"] + 0.05, c["far_end"], [45, 52, 57], cutoff=420, gain=-25, swell=0.6)               # the catch
groove(mus, c["drifts"] + 0.1, c["month_end"] + 0.1, 112, ["C", "G"], gain=-12, seed=16, kick_on=False, snaps=False, bass=True)
drone(mus, c["by"] + 0.05, c["nep_end"] + 0.04, [48, 55, 60, 64], cutoff=900, gain=-28, swell=0.6)       # a whole Neptune: wonder
drone(mus, c["so"] + 0.05, c["pop"] - 0.03, [38, 45, 50], cutoff=320, gain=-22, swell=0.9)              # a close night: uh-oh
groove(mus, c["nep2"] + 0.15, c["loop"] - 0.02, 84, ["F", "C"], gain=-13, seed=18, kick_on=False, snaps=False, arp=True, bass=False)   # a lullaby
groove(mus, c["loop"], DUR, 112, SPACE, gain=-10, seed=10, kick_on=False, snaps=True)                    # into the loop
silence(mus, [(c["click"] - 0.05, c["all"] + 0.15),      # CLICK. Yep!
              (c["barely"] - 0.05, c["sat1"] + 0.05),    # Barely. (the wobble)
              (c["off"] - 0.05, c["one"] + 0.05),        # OFF. (the yank, eek)
              (c["far_end"], c["drifts"] + 0.1),         # FAR. (whee)
              (c["nep_end"] + 0.04, c["so"] + 0.05),     # NEPTUNE. (ding)
              (c["pop"] - 0.03, c["nep2"] + 0.15)])      # POP

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
