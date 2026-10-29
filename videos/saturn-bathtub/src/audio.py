"""Would SATURN Float in Your Bathtub? 🪐 Short: sound design, score and mix, cue-locked to timeline.json.

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

SFX_LEVEL = -10.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(lift=-30, drop=-24, splash=-11, under=-24, bubbles=-30, pop=-12, popsp=-26, slap=-14, take=-28, squeak=-18,
         pull=-16, wonder=-28, dip=-20, scoop=-22, clink=-18, boing=-14, tag=-30, knock=-16, poof=-11, scan=-26, fizz=-27,
         cut=-18, plop=-15, clunk=-12, whistle=-17, jupsplash=-9, bloop=-16, plinks=-28, plands=-24, fanfare=-30,
         scratch=-11, rumble=-16, crack=-28, coredrop=-20, coreclunk=-14, erupt=-13, eruptlow=-12, blink=-30, pops=-24,
         paddle=-30, duckq=-15, brush=-26, rimshot=-9, relift=-24, slosh=-30)


# ================================================================= this Short's atoms
def soft_clip(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


def top_only(y, f=5200):
    return filt(y, "highpass", f)


def low_only(y, f=280):
    return filt(y, "lowpass", f)


def norm(y):
    return y / (np.abs(y).max() + 1e-9)


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
    y = filt(brown(n, seed), "lowpass", 380) * env
    return fade(norm(y), 0.01, 0.05)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(norm(y), 0.003, 0.02)


def short_splash(dur=0.34, seed=0, big=1.0):
    """a splash cut short so it ends inside a pause: a wet crack and a spray (speech band: pauses only; mono)"""
    y = splash(dur, seed, big)
    n = len(y)
    return fade(y * np.exp(-ar(n) / (0.12 * big)), 0.0005, 0.06)


def splash_low(dur=0.6, seed=0):
    """the body of a splash under ~300 Hz: it can run on under the next word (mono)"""
    n = int(dur * SR)
    y = filt(brown(n, seed), "lowpass", 300) * attack_decay(n, 0.004, 0.18)
    y += 0.6 * np.sin(2 * np.pi * np.cumsum(90 + 120 * np.exp(-ar(n) / 0.03)) / SR) * expdecay(n, 0.09)
    return fade(norm(y), 0.0008, 0.06)


def pop_up(seed=0):
    """Saturn popping up out of the water: a hollow 'bloop' upward, all under ~300 Hz, and a fizz above 5 kHz: it can sit
    on the word FLOATS (mono)"""
    n = int(0.42 * SR)
    t = ar(n)
    body = np.sin(2 * np.pi * np.cumsum(70 + 160 * (1 - np.exp(-t / 0.08))) / SR) * attack_decay(n, 0.01, 0.14)
    fz = top_only(white(n, seed), 5600) * np.exp(-t / 0.1)
    return soft_clip(fade(norm(low_only(body, 320)) + 0.4 * norm(fz), 0.0008, 0.06), 2.2)


def slap(seed=0):
    """something flat slapping water (the rings settling): a wet crack and a spray (mono; for a pause)"""
    n = int(0.22 * SR)
    t = ar(n)
    y = filt(white(n, seed), "bandpass", [600, 6000]) * np.exp(-t / 0.03)
    y += 0.5 * crackle(n, 3200 * np.exp(-t / 0.06), seed + 1, 2000, 9000, 0.001)
    y += 0.7 * low_only(brown(n, seed + 2), 260) * np.exp(-t / 0.05)
    return fade(norm(y), 0.0004, 0.04)


def water_lap(n, seed=0):
    """water lapping in a tub (stereo): soft low sloshes on a whole number of cycles in the Short (the loop holds), under
    ~500 Hz, with a faint trickle above 5 kHz"""
    per = DUR / max(1, round(DUR / 2.3))
    ph = (ar(n) % per) / per
    env = 0.4 + 0.6 * np.sin(np.pi * ph) ** 2
    lo = filt(brown(n, seed), "lowpass", 480) * env
    hi = filt(white(n, seed + 1), "highpass", 5600) * (0.04 + 0.05 * env)
    l = norm(lo) + hi
    r = np.roll(norm(lo), int(0.011 * SR)) + np.roll(hi, int(0.007 * SR))
    return np.stack([l, r]) * 0.5


def space_hum(n, seed=0):
    """deep space (stereo): a low airy hum that breathes, under ~180 Hz"""
    y = filt(brown(n, seed), "lowpass", 170) * (0.75 + 0.25 * np.sin(2 * np.pi * (3 / DUR) * ar(n)))
    return pan_st(norm(y), 0)


def underwater(n, seed=0):
    """under water (stereo): a muffled low rumble that swells, and soft clicks of bubbles above 5 kHz"""
    t = ar(n)
    lo = filt(brown(n, seed), "lowpass", 260) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.35 * t))
    clicks = top_only(crackle(n, 40 + 30 * np.sin(2 * np.pi * 0.2 * t) ** 2, seed + 1, 5200, 9000, 0.0015), 5200)
    l = norm(lo) + 0.25 * norm(clicks)
    return np.stack([l, np.roll(l, int(0.009 * SR))]) * 0.5


def puff(seed=0, dur=0.2):
    """POOF: a soft breathy puff of cloud (a filtered breath, 200 Hz-2.5 kHz; for a pause; mono)"""
    n = int(dur * SR)
    y = filt(pink(n, seed), "bandpass", [200, 2500]) * attack_decay(n, 0.008, 0.06)
    y += 0.5 * low_only(brown(n, seed + 1), 200) * attack_decay(n, 0.005, 0.05)
    return fade(norm(y), 0.001, 0.04)


def scanner(dur=0.6, seed=0):
    """a scan wipe: a thin rising whistle above 5 kHz with a low hum under it (it can run under words; mono)"""
    n = int(dur * SR)
    t = ar(n)
    hi = np.sin(2 * np.pi * np.cumsum(5600 + 2200 * t / dur) / SR) * np.sin(np.pi * t / dur) ** 0.8
    lo = np.sin(2 * np.pi * 95 * t) * np.sin(np.pi * t / dur)
    return fade(0.6 * hi + 0.5 * lo, 0.01, 0.05)


def fizz_top(dur=1.0, seed=0):
    """fizzing bubbles above 5 kHz (soda in a glass): it runs under the words (mono)"""
    n = int(dur * SR)
    y = top_only(crackle(n, 900 * np.ones(n), seed, 5200, 10000, 0.0009), 5200) * np.sin(np.pi * ar(n) / dur) ** 0.6
    return fade(norm(y), 0.01, 0.06)


def clunk(seed=0):
    """a small heavy ball hitting an enamel floor under water: a dull knock, a low thud, soft-clipped (mono; for a pause)"""
    n = int(0.3 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * 410 * t) * np.exp(-t / 0.035) + 0.6 * np.sin(2 * np.pi * 980 * t) * np.exp(-t / 0.015)
    y += 0.9 * np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.08)
    y = filt(y, "lowpass", 2600)
    return soft_clip(fade(y, 0.0004, 0.05), 2.4)


def clunk_edges(seed=0):
    """the same CLUNK with only what is under 300 Hz and above 5 kHz: it can sit on the start of a word (mono)"""
    y = clunk(seed)
    return soft_clip(fade(norm(low_only(y, 300)) + 0.5 * norm(top_only(y + 0.3 * white(len(y), seed) * np.exp(-ar(len(y)) / 0.01), 5200)), 0.0004, 0.05), 2.0)


def sad_bloop(seed=0):
    """Jupiter settling on the floor: a slow sad bloop, mostly under 300 Hz (mono)"""
    y = bloop(160, 48, 0.55)
    return fade(norm(low_only(y, 340)), 0.002, 0.06)


def plink(f=6400.0, seed=0):
    """a small planet dropping in: a tiny glassy plink above 5 kHz (it can sit on a word; mono)"""
    return glint(f, 0.08, seed)


def rumble(dur=1.2, seed=0):
    """Saturn shuddering: a trembling rumble under ~200 Hz (it runs under words; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = filt(brown(n, seed), "lowpass", 190) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / dur) ** 0.5
    return fade(norm(y), 0.02, 0.1)


def foam_rush(dur=0.8, seed=0):
    """the foam erupting: a rising rush above 5 kHz (under the words) - the low part is eruptlow (mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = top_only(white(n, seed), 5400) * np.minimum(1, t / 0.08) * np.exp(-np.maximum(0, t - 0.25) / 0.3)
    y += 0.6 * top_only(crackle(n, 2400 * np.ones(n), seed + 1, 5400, 10000, 0.0008), 5400) * np.exp(-t / 0.4)
    return fade(norm(y), 0.004, 0.08)


def fit_n(x):
    return np.pad(x, (0, max(0, N - len(x))))[:N]


# ================================================================= the beds
front_on = gate(N, [(0, SHOT["planets"]), (SHOT["fizz"], DUR)])
tank_on = gate(N, [(SHOT["planets"], SHOT["fizz"])])
amb.x += water_lap(N, 3) * 0.8 * front_on
amb.x += space_hum(N, 5) * 0.45 * front_on
amb.x += underwater(N, 7) * 0.9 * tank_on

# ================================================================= the hook: the drop, the plunge, the POP
bed.add(pan_st(top_swish(0.16, 1), 0.2), c["drop"] + 0.05, db(G["lift"]))                 # frame 1: he lifts it a little
bed.add(pan_st(top_swish(0.3, 2), 0.25), c["let_go"], db(G["drop"]))                     # it falls (top only, under "Sink")
sfx.add(pan_st(short_splash(0.32, 3, 1.0), 0.15), c["splash"], db(G["splash"]))          # SPLASH in the pause after "Sink..."
bed.add(pan_st(splash_low(0.6, 4), 0.1), c["splash"], db(G["splash"] - 4))
bed.add(pan_st(low_only(gurgle(1.0, 5, 10), 300), 0.2), c["splash"] + 0.3, db(G["under"]))   # under: low glugs
for k in range(5):                                                                          # bubbles at the surface (top)
    bed.add(pan_st(glint(5600 + 500 * k, 0.05, 10 + k), 0.2), c["splash"] + 0.35 + 0.28 * k, db(G["bubbles"]))
sfx.add(pan_st(pop_up(6), 0.15), c["pop"], db(G["pop"]))                                   # POP (low + top: on "FLOATS")
for i in range(5):
    bed.add(pan_st(glint(6000 + 450 * i, 0.07, 20 + i), 0.1 * i), c["pop"] + 0.05 + 0.05 * i, db(G["popsp"]))
sfx.add(pan_st(slap(7), 0.15), c["floats_end"] + 0.03, db(G["slap"]))                      # the rings slap down (the pause)
for k, dt in enumerate([0.0, 0.24, 0.44]):                                                  # the duck's double take (top swishes)
    bed.add(pan_st(top_swish(0.08, 30 + k), -0.4), c["double_take"] + dt, db(G["take"]))
sfx.add(pan_st(squeak(0.13, 2100, 3000), -0.4), c["duck_squeak"], db(G["squeak"]))          # SQUEAK (after "duck.")
bed.add(pan_st(low_whoosh(1.6, 40), 0), c["pull_back"], db(G["pull"]))                     # the pull back (low)
bed.add(pan_st(top_swish(1.2, 41), 0), c["pull_back"] + 0.2, db(G["pull"] - 12))

# ================================================================= the cup: the scoop, the clink, the balance swings
bed.add(pan_st(low_thud(50, 110.0, 0.2), 0.3), c["dip"] + 0.2, db(G["dip"]))               # into Saturn's top (low)
bed.add(pan_st(top_swish(0.25, 51), 0.3), c["lift_cup"], db(G["scoop"]))                  # ...and out, heaped (top)
sfx.add(pan_st(glass_tink(52, 3000.0, 0.13), 0.2), c["saturn2_end"] + 0.02, db(G["clink"]))  # clink (the pause before "it's")
bed.add(pan_st(low_only(boing(0.6, 120.0, 53), 300), 0.3), c["tip"], db(G["boing"]))       # the balance swings (low, on LIGHTER)
bed.add(pan_st(glint(7000, 0.1, 54), 0.2), c["tag30"], db(G["tag"]))                       # 30% LIGHTER (top)

# ================================================================= why: the knock, POOF, the scan, the fizz
bed.add(pan_st(low_thud(60, 150.0, 0.12), 0.25), c["knock"] + 0.04, db(G["knock"]))       # the knock (low, soft: no rock)
sfx.add(pan_st(puff(61, 0.2), 0.2), c["poof"], db(G["poof"]))                              # POOF (the pause after "rock.")
bed.add(pan_st(scanner(0.65, 62), 0.1), c["scan"], db(G["scan"]))                          # the scan wipe (top + low)
bed.add(pan_st(fizz_top(1.6, 63), 0.1), c["scan"] + 0.4, db(G["fizz"]))                    # the gas fizzing inside it (top)

# ================================================================= the planets: Earth CLUNK, Jupiter bloop, five plinks
sfx.add(pan_st(whoosh(0.4, 200, 2600, 70), 0), SHOT["planets"] - 0.25, db(G["cut"]))       # the dive to the waterline
p_earth_splash = c["earth_drop"] + 0.66
sfx.add(pan_st(slide_whistle(0.36, 1900, 700), 0.3), c["earth_end"] + 0.04, db(G["whistle"]))   # it falls (the pause after "Earth?")
bed.add(pan_st(top_only(splash(0.3, 71, 0.6), 5000), 0.3), p_earth_splash, db(G["plop"] - 4))   # a little plop (top)
sfx.add(pan_st(clunk(72), 0.3), c["earth_hit"], db(G["clunk"]))                            # CLUNK (after "Sinks.")
bed.add(pan_st(top_swish(0.3, 73), -0.3), c["jup_drop"], db(G["drop"]))                    # Jupiter comes in (top)
sfx.add(pan_st(short_splash(0.36, 74, 1.4), -0.3), c["jup_splash"], db(G["jupsplash"]))     # SPLASH (after "Jupiter?")
bed.add(pan_st(splash_low(0.7, 75), -0.3), c["jup_splash"], db(G["jupsplash"] - 3))
bed.add(pan_st(low_only(gurgle(1.0, 76, 7), 320), -0.3), c["jup_splash"] + 0.3, db(G["under"] + 2))   # it sinks... slowly
sfx.add(pan_st(sad_bloop(77), -0.3), c["jup_land"], db(G["bloop"]))                        # bloop. (after "Sinks.")
for k, f0 in enumerate(c["five_drops"]):                                                    # five more: plink (top) ... land (low)
    bed.add(pan_st(plink(6200 + 420 * k, 80 + k), 0.3 * (-1) ** k), f0 + 0.3, db(G["plinks"]))
    bed.add(pan_st(low_thud(85 + k, 120.0 + 12 * k, 0.12), 0.2), f0 + 0.85 + 0.12 * (k > 2), db(G["plands"]))
for i in range(4):                                                                          # FLOATS (top sparkle)
    bed.add(pan_st(glint(6600 + 380 * i, 0.08, 90 + i), 0.2), c["float_tag"] + 0.06 * i, db(G["fanfare"]))

# ================================================================= the catch: the scratch, the shudder, the core CLUNK
sfx.add(pan_st(scratch(0.26, 100), 0), c["scratch"] - 0.2, db(G["scratch"]))               # the record scratch (before "Catch?")
bed.add(pan_st(rumble(1.3, 101), 0), c["shudder"], db(G["rumble"]))                        # it shudders (low)
bed.add(pan_st(top_only(crackle(int(0.8 * SR), 600 * np.ones(int(0.8 * SR)), 102, 5200, 9000, 0.001), 5200), 0),
        c["shudder"] + 0.15, db(G["crack"]))                                               # the cracks (top)
bed.add(pan_st(low_only(bloop(220, 60, 0.7), 300), 0), c["core_drop"], db(G["coredrop"]))  # the core drops (low)
sfx.add(pan_st(clunk_edges(103), 0), c["core_hit"], db(G["coreclunk"]))                    # CLUNK (low + top: it meets "the gas")

# ================================================================= the fizz: the gas goes UP
bed.add(pan_st(foam_rush(0.9, 110), 0), c["erupt"], db(G["erupt"]))                        # the rush (top, under "fizzes")
bed.add(pan_st(low_whoosh(0.8, 111), 0), c["erupt"], db(G["eruptlow"]))                    # ...and its body (low)
bed.add(pan_st(top_only(glint(7600, 0.05, 112), 5000), 0), c["blink"], db(G["blink"]))     # a deadpan blink (tick)

# ================================================================= the rings: the foam pops, the duck paddles in
bed.add(pan_st(top_only(crackle(int(0.6 * SR), 900 * np.ones(int(0.6 * SR)), 120, 5200, 9500, 0.0012), 5200), 0),
        c["foam_pop"], db(G["pops"]))
for k in range(4):                                                                          # little paddles (top)
    bed.add(pan_st(top_swish(0.07, 125 + k), -0.2), c["duck_in"] - 0.7 + 0.16 * k, db(G["paddle"]))
sfx.add(pan_st(squeak(0.12, 2200, 3100), 0.2), c["duck_in"] + 0.02, db(G["duckq"]))         # squeak (the pause after "rings?")

# ================================================================= the button: the brush, ba-dum tss, the lift
bed.add(pan_st(top_swish(0.14, 130), 0.3), c["brush"], db(G["brush"]))
sfx.add(rimshot(131), c["rimshot"], db(G["rimshot"]))                                       # after "RING."
bed.add(pan_st(low_only(splash(0.4, 132, 0.5), 300), 0.1), c["relift"] + 0.1, db(G["relift"]))   # a fresh Saturn out of the water

# ================================================================= subscribe cue: no sound
# The pill of the pill test (25 Oct-8 Nov 2026, the 23:30 slots; timeline_lib.py sets its cues) is SILENT: no pop, no
# click, no bell, and nobody says "subscribe" (user, 24 Oct 2026: "silent subscribe button"). Both arms sound the same.

# ================================================================= score (drops out for every punchline)
BATH = ["F", "Dm", "Bb", "C"]                    # bath time: bouncy, bubbly
groove(mus, 0.04, c["let_go"] + 0.05, 108, BATH, gain=-9, seed=10, kick_on=False, snaps=True)
drone(mus, c["splash"] + 0.25, c["pop"] - 0.02, [41, 48, 53], cutoff=360, gain=-24, swell=0.6)          # under... suspense
groove(mus, c["pop"] + 0.02, c["like"] - 0.04, 108, BATH, gain=-7, seed=12, kick_on=True, snaps=True)   # IT FLOATS! (a hit)
crash(mus, c["pop"] + 0.02, gain=-26)
groove(mus, c["giant"] + 0.1, c["duck"] - 0.06, 108, ["Bb", "C"], gain=-12, seed=14, kick_on=False, snaps=False, bass=False)
drone(mus, c["pull_back"], c["duck_end"] + 0.3, [53, 60, 65, 69], cutoff=900, gain=-28, swell=0.6)     # the reveal: wonder
groove(mus, c["scoop"] + 0.1, c["tip"] - 0.04, 108, BATH, gain=-11, seed=16, kick_on=False, snaps=True)  # the cup
groove(mus, c["than"] + 0.05, SHOT["planets"] - 0.1, 108, BATH, gain=-12, seed=18, kick_on=False, snaps=True)
groove(mus, SHOT["planets"] + 0.1, c["floats2_end"] + 0.1, 96, ["Am", "F", "C", "G"], gain=-13, seed=20, kick_on=False,
       snaps=False, cutoff=900)                                                                          # under water
drone(mus, SHOT["planets"] + 0.1, c["floats2_end"] + 0.1, [45, 52, 57], cutoff=320, gain=-26)
drone(mus, c["catch_end"] + 0.05, c["core_hit"], [38, 45, 50], cutoff=340, gain=-22, swell=0.8)          # the catch: tension
groove(mus, c["and"] + 0.1, c["so"] - 0.04, 100, ["F", "Bb", "C", "F"], gain=-12, seed=24, kick_on=False, snaps=True)   # the rings
groove(mus, c["relift"] - 0.05, DUR, 108, BATH, gain=-9, seed=10, kick_on=False, snaps=True)            # into the loop
silence(mus, [(c["let_go"] + 0.05, c["splash"] + 0.25),       # Sink... SPLASH
              (c["like"] - 0.04, c["giant"] + 0.1),           # "Like a"
              (c["duck"] - 0.06, c["scoop"] + 0.1),           # rubber duck. (SQUEAK)
              (c["tip"] - 0.04, c["than"] + 0.05),            # LIGHTER (the balance swings)
              (c["rock"] - 0.04, c["its2"] + 0.05),           # not rock. POOF
              (c["gas"] - 0.04, SHOT["planets"] + 0.1),       # GAS. (the fizz)
              (c["floats2_end"] + 0.1, c["catch_end"] + 0.05),  # the scratch, "Catch?"
              (c["core_hit"], c["and"] + 0.1),                # CLUNK, the eruption, the blink
              (c["so"] - 0.04, c["relift"] - 0.05)])          # So yes... it leaves a RING. (ba-dum tss)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
