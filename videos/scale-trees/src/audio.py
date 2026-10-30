"""The Tree That Wore SNAKESKIN (Then Became Coal) 🐍 Short: sound design, score and mix, cue-locked to timeline.json.

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

SFX_LEVEL = -12.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(tap=-14, swish=-17, fwip=-22, crane=-24, tick=-26, pull=-24, tape=-27, ding=-15, sparkle=-27, pop=-4, flop=-22,
         groan=-24, thud=-14, splash=-13, buzz=-30, crash=-9, boom=-9, flash=-20, flump=-16, sand=-30, stomp=-10, squeeze=-24,
         glint=-18, toot=-17, chuff=-26, clack=-30, scrape=-30, fire=-12, rumble=-16, clatter=-12, drip=-24, grind=-22,
         trickle=-30, drop=-20, bonk=-3, boing=-15, iconpop=-26, pat=-14, box=-20, loop=-22)


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


def chuffs(t0, t1, bus, gain, rate=4.4, seed=0):
    """a steam engine working: a chuff of steam on every beat (under 600 Hz and above 5 kHz: it runs under the words)"""
    k = 0
    for ts in np.arange(t0, t1, 1.0 / rate):
        n = int(0.2 * SR)
        y = filt(white(n, seed + k), "lowpass", 600) * expdecay(n, 0.06)
        y = y / (np.abs(y).max() + 1e-9) + 0.4 * filt(white(n, seed + 50 + k), "highpass", 5200) * expdecay(n, 0.04)
        bus.add(pan_st(fade(y, 0.002, 0.03), -0.3), ts, db(gain - (3 if k % 2 else 0)))
        k += 1


def clatter(dur, seed=0, density=60.0):
    """lumps of coal tumbling: a heap of small dry knocks over a low rumble (mono)"""
    n = int(dur * SR)
    y = 0.6 * filt(brown(n, seed), "lowpass", 260) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6
    r = np.random.default_rng(seed)
    for k in range(int(dur * density)):
        p = int(r.uniform(0, n - 2400))
        m = int(0.03 * SR)
        knock = filt(white(m, seed + k + 3), "bandpass", (r.uniform(700, 2400), r.uniform(2600, 5200))) * expdecay(m, 0.006)
        y[p:p + m] += knock * r.uniform(0.3, 1.0)
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.08)


def fit_n(x):
    return np.pad(x, (0, max(0, N - len(x))))[:N]


# ================================================================= the beds
swamp = gate(N, [(0, SHOT["coal"])])
cut = gate(N, [(SHOT["coal"], SHOT["trains"])])
train = gate(N, [(SHOT["trains"], SHOT["mine"])])
mine = gate(N, [(SHOT["mine"], DUR - 0.17)])
loopg = gate(N, [(DUR - 0.17, DUR)])
# the swamp: still water lapping (low), insects above 5 kHz, a breath of wind in the leaves (top)
lap = filt(brown(N, 3), "lowpass", 240) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.21 * tt) ** 2)
amb.x += pan_st(lap / (np.abs(lap).max() + 1e-9) * 0.7, -0.1) * (swamp + loopg)
ins = filt(white(N, 4), "bandpass", (5600, 9000)) * (0.5 + 0.5 * np.sin(2 * np.pi * 7.1 * tt) ** 8) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * tt))
amb.x += pan_st(ins / (np.abs(ins).max() + 1e-9) * 0.16, 0.4) * (swamp + loopg)
leaves = filt(white(N, 5), "highpass", 5000) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.31 * tt) ** 4)
amb.x += pan_st(leaves / (np.abs(leaves).max() + 1e-9) * 0.12, -0.3) * (swamp + loopg)
# under the ground: a deep rumble; the train: the rails' rhythm and a hiss; the mine: a low hum and a far drip
earth = filt(brown(N, 6), "lowpass", 120)
amb.x += pan_st(earth / (np.abs(earth).max() + 1e-9) * 0.6, 0) * cut
rails = filt(brown(N, 7), "lowpass", 300) * (0.7 + 0.3 * np.sin(2 * np.pi * 2.2 * tt) ** 6)
amb.x += pan_st(rails / (np.abs(rails).max() + 1e-9) * 0.75, 0.1) * train
cave = filt(brown(N, 8), "lowpass", 160) + 0.2 * np.sin(2 * np.pi * 55 * tt)
amb.x += pan_st(cave / (np.abs(cave).max() + 1e-9) * 0.55, 0) * mine
chuffs(SHOT["trains"], SHOT["mine"] - 0.05, bed, G["chuff"], 4.4, 300)
for ts in np.arange(SHOT["trains"] + 0.1, SHOT["mine"], 0.45):                                          # the rail joints (top)
    bed.add(pan_st(top_swish(0.04, int(ts * 100)), 0.2), ts, db(G["clack"]))

# ================================================================= the hook: the guess
sfx.add(pan_st(low_thud(10, 90.0, 0.22), 0.3), 0.0, db(G["tap"]))                                      # his palm on the bark (frame 1, low)
bed.add(pan_st(filt(rustle(0.3, 11), "highpass", 4200), 0.3), 0.02, db(G["swish"] - 6))
bed.add(pan_st(top_swish(0.18, 12), -0.4), C["flick"] - 0.05, db(G["swish"]))                         # snake... the leaf swishes across his face
sfx.add(pan_st(slide(700.0, 1500.0, 0.12, harm=3), -0.2), C["flick"] + 0.04, db(G["fwip"]))            # fwip (in the pause)
bed.add(pan_st(low_whoosh(1.0, 13), 0), C["tree"] - 0.05, db(G["crane"]))                             # TREE? the camera rockets up (low)
bed.add(pan_st(filt(riser(1.0, 14, 1200, 5200), "highpass", 5000), 0), C["tree"], db(G["crane"] - 4))
for i in range(2):                                                                                       # two seconds: ticks (top)
    bed.add(pan_st(glint(6900, 0.05, 15 + i), 0.2), C["youve"] + 0.25 + 0.9 * i, db(G["tick"]))
bed.add(pan_st(low_whoosh(1.4, 16), 0), C["a_tree"] - 0.05, db(G["pull"]))                            # the pull back to the whole tree (low)
bed.add(pan_st(ratchet(C["tall_end"] - C["forty"] + 0.1, 20.0, 34.0, 17, edges=True), -0.3), C["forty"], db(G["tape"]))   # the measure runs up (top)
bed.add(pan_st(low_whoosh(1.0, 18), 0), C["tall_end"] + 0.05, db(G["pull"]))                          # the dive back down to him
sfx.add(pan_st(ding(84, 0.12, 19), 0.3), C["snakeskin_end"] + 0.05, db(G["ding"]))                    # snakeskin. ... ding (his thumbs-up)

# ================================================================= the leaf: every diamond is where a leaf fell off
for i in range(5):                                                                                       # the diamonds light up (top)
    bed.add(pan_st(glint(6200 + 350 * i, 0.06, 30 + i), -0.3), C["diamond"] + 0.06 * i, db(G["sparkle"]))
bed.add(pan_st(filt(creak(0.35, 31, 120, 260), "lowpass", 300), -0.3), C["fell1"], db(G["groan"]))   # the leaf stretches (low)
sfx.add(pan_st(soft_clip(cork_pop(32, 560.0)), -0.3), C["pop"], db(G["pop"]))                        # off. ... POP

# ================================================================= the swamp falls
sfx.add(pan_st(low_thud(40, 120.0, 0.16), -0.3), C["pop"] + 1.45, db(G["flop"]))                       # the leaf drops on the mud
bed.add(pan_st(filt(creak(1.2, 41, 40, 110), "lowpass", 260), -0.2), C["whole"] - 0.45, db(G["groan"]))   # the forest groans (low)
bed.add(pan_st(buzz_hi(1.1, 34.0, 42), 0.1), C["whole"] - 0.35, db(G["buzz"]))                        # the giant dragonfly zips past (top)
for i, tp in enumerate(C["topple"]):                                                                     # each trunk hits the water (low + top)
    th = tp + 0.72
    bed.add(pan_st(low_thud(50 + i, 60.0 + 5 * i, 0.4), -0.6 + 0.3 * i), th, db(G["thud"] - 2 * (i % 2)))
    bed.add(pan_st(filt(splash(0.6, 55 + i, 0.8), "highpass", 4800), -0.6 + 0.3 * i), th, db(G["splash"] - 4))
sfx.add(pan_st(soft_clip(splash(1.1, 60, 1.6)), 0.3), C["crash"], db(G["crash"]))                      # over... the big one: SPLASH
sfx.add(pan_st(filt(thunder(1.0, 61), "lowpass", 220), 0.2), C["crash"], db(G["boom"]))

# ================================================================= buried, squashed: coal
sfx.add(pan_st(whoosh(0.3, 300, 2600, 70), 0), SHOT["coal"] - 0.1, db(G["flash"]))
pour = [C["got"] + 0.08, C["buried"] - 0.02, C["buried"] + 0.24, C["buried_end"] + 0.02]
for i, tp in enumerate(pour):                                                                            # each layer lands (low) with a hiss of sand (top)
    bed.add(pan_st(low_thud(71 + i, 70.0 + 8 * i, 0.32), 0), tp + 0.12, db(G["flump"]))
    bed.add(pan_st(filt(white(int(0.3 * SR), 75 + i), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, int(0.3 * SR))), 0.1 * i), tp, db(G["sand"]))
for i, ts in enumerate(C["stomp"]):                                                                      # his stomps (low, can sit on words)
    sfx.add(pan_st(low_thud(80 + i, 64.0, 0.3), 0), ts, db(G["stomp"]))
bed.add(pan_st(filt(creak(0.9, 84, 40, 90), "lowpass", 240), 0), C["squashed"] + 0.1, db(G["squeeze"]))   # the peat squeezes (low)
sfx.add(pan_st(glint(7200, 0.18, 85), 0.3), C["glint"], db(G["glint"]))                               # COAL. ... the shine (top)
sfx.add(pan_st(glint(8100, 0.12, 86), 0.4), C["glint"] + 0.07, db(G["glint"] - 3))
for i, (f, d) in enumerate([(392.0, 0.11), (330.0, 0.12)]):                                             # toot-toot: the train is coming (before "Steam")
    sfx.add(pan_st(bottle_toot(d, f, 87 + i), -0.2), C["coal_end"] + 0.08 + 0.13 * i, db(G["toot"]))

# ================================================================= the steam engine
for i, ts in enumerate([SHOT["trains"] + 0.35, C["steam"] + 0.55]):                                    # the shovel bites the heap (top)
    bed.add(pan_st(nail_scratch(0.18, 90 + i, 14.0, edges=True), 0.3), ts, db(G["scrape"]))
sfx.add(pan_st(fire_whoosh(0.24, 91, 1.0), -0.4), C["whoosh_fire"], db(G["fire"]))                     # them... the fire roars (in the pause)
bed.add(pan_st(filt(fire_rumble(1.2, 92), "lowpass", 260), -0.4), C["whoosh_fire"], db(G["fire"] - 8))
bed.add(pan_st(low_whoosh(0.6, 93), 0.3), C["ton"] + 0.03, db(G["rumble"]))                            # TON: the heap starts to slide (low)
sfx.add(pan_st(clatter(0.55, 94), 0.2), C["ton_end"] + 0.0, db(G["clatter"]))                          # ...and lands on him (in the pause)

# ================================================================= the mine
sfx.add(pan_st(drip(100, 1400.0), 0.5), C["ceiling1_end"] + 0.05, db(G["drip"]))                       # a drip (in a pause)
bed.add(pan_st(filt(creak(0.8, 101, 30, 70), "lowpass", 200), 0), C["wiggle"], db(G["grind"]))         # the stump grinds in the roof (low)
bed.add(pan_st(filt(rustle(1.2, 102), "highpass", 5000), 0), C["wiggle"] + 0.1, db(G["trickle"]))     # dust trickles (top)
bed.add(pan_st(low_whoosh(0.3, 103), 0), C["drop"], db(G["drop"]))                                     # it drops (low)
sfx.add(pan_st(soft_clip(bonk(), 2.5), 0), C["bonk"], db(G["bonk"]))                                   # FALL. ... BONK
sfx.add(pan_st(boing(0.22, 220.0, 104), 0), C["bonk"] + 0.14, db(G["boing"]))

# ================================================================= the button: the stump's career
for i, k in enumerate(["b_snake", "b_tree", "b_coal", "b_ceiling"]):                                    # each icon pops (top)
    bed.add(pan_st(glint(6400 + 400 * i, 0.07, 110 + i), -0.3 + 0.2 * i), C[k] - 0.02, db(G["iconpop"]))
for i in range(2):                                                                                       # two respectful pats (low)
    sfx.add(pan_st(low_thud(115 + i, 150.0, 0.12), 0.3), C["pat"] + 0.11 * i, db(G["pat"]))
sfx.add(pan_st(music_box(mtof(81), 0.45, 117), 0.2), C["career_end"] + 0.08, db(G["box"]))            # career. ... one tiny chime
bed.add(pan_st(low_whoosh(0.5, 118), 0), C["loop0"], db(G["loop"]))                                    # the push into its diamonds -> frame 1
bed.add(pan_st(top_swish(0.3, 119), 0), C["loop0"] + 0.2, db(G["swish"] - 4))

# ================================================================= score (drops out for every punchline)
groove(mus, 0.1, C["tree"] - 0.08, 100, ["Am", "E"], gain=-12, seed=10, kick_on=False, snaps=True, cutoff=1100)    # the guess: sneaky
drone(mus, C["tree"] - 0.05, C["a_tree"] - 0.08, [53, 57, 60, 64, 67], cutoff=450, gain=-23)                      # the crane: wonder
mus.add(pan_st(riser(C["youve"] - C["tree"] - 0.1, 20, 300, 1800), 0), C["tree"], db(-27))
groove(mus, C["forty"] + 0.1, C["snakeskin_end"] - 0.04, 112, ["F", "C", "Bb", "C"], gain=-11, seed=11, kick_on=True, snaps=True)   # the giant: proud bounce
groove(mus, C["every"] + 0.12, C["off_end"] - 0.05, 112, ["C", "G"], gain=-12, seed=12, kick_on=False, snaps=True, cutoff=1300)       # the pluck
drone(mus, C["three"] + 0.1, C["over_end"] - 0.05, [38, 45, 50, 53], cutoff=420, gain=-18)                                          # deep time
for i, tb in enumerate(np.arange(C["whole"], C["over_end"] - 0.1, 60.0 / 92)):                         # a slow drum under the falls (low)
    mus.add(pan_st(low_thud(130 + i, 55.0, 0.35), 0), tb, db(-21))
groove(mus, C["got"] + 0.1, C["coal_end"] - 0.04, 96, ["Dm", "A"], gain=-12, seed=13, kick_on=True, snaps=False, cutoff=900)        # the squeeze: heavy
rag(mus, C["steam"] + 0.12, C["ton"] - 0.06, 132, gain=-8, seed=14)                                                                 # the steam age: a stride piano
drone(mus, C["miners"] + 0.1, C["fall"] - 0.05, [40, 47, 52, 55], cutoff=340, gain=-21)                                              # the mine: low and still
mus.add(pan_st(filt(riser(C["fall"] - C["sometimes"] + 0.1, 21, 200, 900), "lowpass", 300), 0), C["sometimes"], db(-24))
groove(mus, C["b_snake"] + 0.12, C["what"] - 0.06, 104, ["C", "Am", "F", "G"], gain=-13, seed=15, kick_on=False, snaps=True, cutoff=1200)   # the career: a gentle walk
silence(mus, [(C["tree"] - 0.08, C["tree"] - 0.05),
              (C["a_tree"] - 0.08, C["forty"] + 0.1),            # A tree. (bare)
              (C["snakeskin_end"] - 0.04, C["every"] + 0.12),   # snakeskin. ding
              (C["off_end"] - 0.05, C["three"] + 0.1),          # off. POP
              (C["over_end"] - 0.05, C["got"] + 0.1),           # over... SPLASH
              (C["coal_end"] - 0.04, C["steam"] + 0.12),        # COAL. glint, toot-toot
              (C["ton"] - 0.06, C["miners"] + 0.1),             # TON. the avalanche
              (C["fall"] - 0.05, C["b_snake"] + 0.12),          # FALL. BONK
              (C["what"] - 0.06, DUR)])                         # What a career. (bare), the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
