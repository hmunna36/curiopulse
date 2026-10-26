"""Sharks Are Older Than TREES 🦈 Short: sound design, score and mix, cue-locked to timeline.json.

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

SFX_LEVEL = -12.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(creak=-26, pip=-10, plip=-22, tink=-20, slap=-6, chatter=-29, rewind_low=-22, ungrow=-24, flomp=-6, dust=-24, wind=-30,
         tagpop=-28, sproing=-12, whip=-17, fin=-27, surface=-24, splash1=-12, hello=-14, burst=-18, rumble=-24, rustle=-31,
         ff=-30, blink=-24, step=-16, sniff=-14, fire=-25, boom=-5, crack=-12, scratch=-26, shades=-22, cool=-22, splash2=-3,
         flutter=-22)


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


def fit_n(x):
    return np.pad(x, (0, max(0, N - len(x))))[:N]


def waves(n, seed=0, rate=0.11):
    """the sea against the shore: a slow swell under ~400 Hz and a wash of foam above 5.5 kHz (no speech band; stereo)"""
    t = ar(n)
    sw = 0.55 + 0.45 * np.sin(2 * np.pi * rate * t + 1.3) ** 2
    lo = filt(brown(n, seed), "lowpass", 400)
    hi = filt(white(n, seed + 1), "highpass", 5500)
    lo = lo / (np.abs(lo).max() + 1e-9) * sw
    hi = hi / (np.abs(hi).max() + 1e-9) * sw ** 3 * 0.35
    return np.stack([lo + hi * 0.9, lo * 0.92 + hi])


def tape_chatter(dur, seed=0):
    """a tape rewinding: a chatter that speeds up, all above 5.2 kHz, and a low wow under 300 Hz (it runs under the words)"""
    top = ratchet(dur, 22.0, 75.0, seed, edges=True)
    n = len(top)
    t = ar(n)
    f = 70 + 120 * (t / dur) + 18 * np.sin(2 * np.pi * 5.0 * t)
    wow = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.2) * np.minimum(1, (dur - t) / 0.2)
    y = top / (np.abs(top).max() + 1e-9) + 0.5 * filt(wow, "lowpass", 300)
    return fade(y / (np.abs(y).max() + 1e-9), 0.02, 0.08)


def ff_chatter(dur, seed=0):
    """fast-forward: the same tape chatter, brighter and steady (top only)"""
    y = ratchet(dur, 60.0, 80.0, seed, edges=True)
    return fade(y / (np.abs(y).max() + 1e-9), 0.03, 0.1)


# ================================================================= the beds
# the shore of today: waves and a little wind; 450 million years ago: the same sea, a colder wind, no life on land
today = gate(N, [(0, SHOT["rewind"] + 1.0), (SHOT["button"] - 0.2, DUR)])
old = gate(N, [(SHOT["rewind"] + 1.0, SHOT["button"] - 0.2)])
wv = waves(N, 3)
amb.x += wv * 0.8
wind = filt(brown(N, 5), "lowpass", 300) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * tt) ** 2)
amb.x += pan_st(wind / (np.abs(wind).max() + 1e-9) * 0.5, -0.2) * old
whistle = filt(white(N, 6), "highpass", 5600) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * tt) ** 4)
amb.x += pan_st(whistle / (np.abs(whistle).max() + 1e-9) * 0.12, 0.3) * gate(N, [(SHOT["ankle"], SHOT["payoff"])])
# a few birds of today, only in the pauses (they live in the speech band)
for t0, f in [(C["trees1_end"] + 0.06, 3600.0), (SHOT["button"] - 0.05, 3300.0), (C["tree5_end"] + 0.08, 3800.0)]:
    sfx.add(pan_st(tweet(int(t0 * 10), f), 0.6), t0, db(-30))

# ================================================================= the hook + the answer
bed.add(pan_st(filt(creak(0.7, 11, 40, 110), "lowpass", 280), -0.2), 0.05, db(G["creak"]))            # the hug: the bark creaks (low)
bed.add(pan_st(filt(creak(0.5, 12, 40, 110), "lowpass", 280), -0.2), C["trees1"], db(G["creak"]))       # the squeeze (low)
sfx.add(pan_st(drip(13, 1700), 0.4), C["sharks1_end"] + 0.02, db(G["plip"]))                           # sharks, ... plip (the shark tilts)
sfx.add(pan_st(lamp_pip(1500, 0.12, 14, 0.08), -0.2), C["heart"], db(G["pip"]))                        # TREES? ... the heart pops
for i in range(3):                                                                                       # Sharks. ... the grin glints
    sfx.add(pan_st(glint(6400 + 600 * i, 0.08, 15 + i), 0.4), C["sharks2_end"] + 0.03 + 0.05 * i, db(G["tink"]))
sfx.add(pan_st(soft_clip(slap_hit(16)), -0.1), C["slap"], db(G["slap"]))                               # kids. ... SLAP (the sticker)

# ================================================================= the rewind
bed.add(pan_st(tape_chatter(C["years1"] - C["rewind"] + 0.1, 20), 0), C["rewind"] - 0.05, db(G["chatter"]))
bed.add(pan_st(low_whoosh(C["years1"] - C["rewind"], 21), 0), C["rewind"], db(G["rewind_low"]))
bed.add(pan_st(low_whoosh(0.55, 22), -0.1), C["billion"] - 0.02, db(G["ungrow"]))                     # his tree un-grows (low)
sfx.add(pan_st(low_thud(23, 60.0, 0.4), -0.3), C["flomp"], db(G["flomp"]))                            # FLOMP (in the gap)
sfx.add(pan_st(filt(rustle(0.25, 24), "highpass", 2000), -0.3), C["flomp"] + 0.02, db(G["dust"]))

# ================================================================= no trees anywhere; the tallest plant
bed.add(pan_st(glint(6800, 0.07, 30), 0.1), C["tagT"], db(G["tagpop"]))                               # the tag pops (top)
bed.add(pan_st(glint(7400, 0.05, 32), 0.1), C["tag1"], db(G["tagpop"] - 2))                          # the ankle line (top)
sfx.add(pan_st(boing(0.24, 380.0, 31), 0.2), C["ankle_end"] + 0.03, db(G["sproing"]))                 # ankle. ... sproing (the little plant)

# ================================================================= the sea already had sharks
sfx.add(pan_st(whoosh(0.22, 400, 3000, 40), 0.3), SHOT["sea"] - 0.16, db(G["whip"]))                  # the whip pan
for i in range(4):                                                                                      # fins cutting the water (low + top)
    bed.add(pan_st(low_whoosh(0.5, 41 + i), 0.5 * (-1) ** i), SHOT["sea"] + 0.3 + 0.45 * i, db(G["fin"]))
bed.add(pan_st(low_whoosh(0.5, 46), 0), C["already"] - 0.15, db(G["surface"]))                         # it rises (low, under "already")
sfx.add(pan_st(splash(0.4, 47, 0.6), -0.1), C["sharks3_end"] + 0.0, db(G["splash1"]))                  # sharks. ... splash (the water settling)
sfx.add(pan_st(slide_whistle(0.2, 900, 1700), -0.1), C["wave"] + 0.08, db(G["hello"]))                 # ... the fin waves: whee

# ================================================================= about sixty million years later: the first trees
for k, (x, by, h, seed, delay) in enumerate([(-120, 1250, 1350, 11, 0.35), (160, 1330, 1650, 12, 0.15), (300, 1500, 1950, 13, 0.0),
                                                (-420, 1180, 1150, 15, 0.5), (-640, 1300, 1500, 16, 0.55), (60, 1610, 2100, 17, 0.1),
                                                (-260, 1450, 1750, 18, 0.3)]):
    t0 = C["trees4"] - 0.15 + (delay * 0.45) * (C["later"] + 0.25 - C["trees4"])
    bed.add(pan_st(low_thud(50 + k, 70.0 + 6 * k, 0.32), np.clip(x / 900, -0.8, 0.8)), t0, db(G["burst"] - 1.5 * (k % 3)))
bed.add(pan_st(filt(brown(int(2.6 * SR), 58), "lowpass", 160) * np.sin(np.pi * np.linspace(0, 1, int(2.6 * SR))), 0), C["trees4"] - 0.1, db(G["rumble"]))
bed.add(pan_st(filt(rustle(1.3, 59), "highpass", 5200), 0), C["million"] - 0.1, db(G["rustle"]))       # the fronds unroll (top)
bed.add(pan_st(ff_chatter(C["later_end"] - C["trees4"] + 0.1, 60), 0), C["trees4"] - 0.05, db(G["ff"]))
bed.add(pan_st(glint(6600, 0.07, 61), -0.1), C["million"] + 0.05, db(G["tagpop"]))

# ================================================================= and the sharks watched (a deadpan: three blinks)
for i in range(3):
    sfx.add(pan_st(lamp_pip(900 + 80 * i, 0.05, 70 + i, 0.0), -0.4 + 0.4 * i), C["turn"] + 0.2 + 0.05 * i, db(G["blink"]))

# ================================================================= dinosaurs came... and went
for i, ts in enumerate(np.arange(SHOT["dinos"] + 0.05, C["came2_end"] - 0.05, 0.44)):                 # its steps (low)
    bed.add(pan_st(low_thud(80 + i, 48.0, 0.36), -0.5 + 0.1 * i), ts, db(G["step"]))
sfx.add(pan_st(sniff(0.22, 85), 0.1), C["came2_end"] + 0.06, db(G["sniff"]))                          # came... sniff (nose to nose)
bed.add(pan_st(low_whoosh(C["went_end"] - C["and2"] + 0.15, 86), -0.4), C["and2"] - 0.1, db(G["fire"]))     # the fireball (low)
bed.add(pan_st(filt(fire_rumble(C["went_end"] - C["and2"] + 0.1, 87), "highpass", 5200), -0.4), C["and2"] - 0.05, db(G["fire"] - 3))
boom = filt(thunder(1.8, 88), "lowpass", 300)
sfx.add(pan_st(boom, 0), C["boom"], db(G["boom"]))                                                     # went. ... BOOM (low, long)
sfx.add(pan_st(fade(crack(0.16, 89), 0.001, 0.06), 0), C["boom"], db(G["crack"]))                     # its crack (short, in the gap)

# ================================================================= five mass extinctions. Still swimming.
for i, tk in enumerate(C["tally"]):
    bed.add(pan_st(nail_scratch(0.16, 90 + i, 9.0, edges=True), -0.4), tk, db(G["scratch"]))           # the tally marks (top)
    bed.add(pan_st(low_thud(95 + i, 140.0, 0.12), -0.4), tk, db(G["scratch"] + 4))
sfx.add(pan_st(lamp_pip(1100, 0.05, 99, 0.0), 0.2), C["sharks5_end"] + 0.12, db(G["blink"] - 3))           # Sharks? ... blink
bed.add(pan_st(glint(7000, 0.1, 100), 0.2), C["shades"] + 0.25, db(G["shades"]))                       # the shades land (top)
bed.add(pan_st(low_whoosh(0.4, 102), 0.3), C["shades"] + 0.3, db(G["fin"] + 4))                          # it turns round and cruises off (low)
bed.add(pan_st(glint(7600, 0.08, 101), 0.2), C["shades"] + 0.33, db(G["shades"] - 2))

# ================================================================= the button: his tree again; the shark pops back up: SPLASH
bed.add(pan_st(filt(creak(0.6, 110, 40, 110), "lowpass", 280), -0.2), C["hug"], db(G["creak"]))
sfx.add(pan_st(splash(0.9, 111, 1.0), 0.2), C["pop"] - 0.02, db(G["splash2"]))                         # kid. ... SPLASH
sfx.add(pan_st(flutter(0.3, 112), -0.2), C["pop"] + 0.12, db(G["flutter"]))                            # the sticker flies off

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.0, C["trees1_end"] - 0.05, BPM, ["C", "F", "G", "C"], gain=-10, seed=10, kick_on=True, snaps=True)          # the hug: a sunny bounce
groove(mus, C["trees2"] + 0.12, C["kids_end"] - 0.04, BPM, ["F", "G"], gain=-11, seed=11, kick_on=True, snaps=True)
drone(mus, C["rewind"] + 0.1, C["years1_end"], [43, 50, 55, 58], cutoff=520, gain=-19)                                     # the rewind: tension
mus.add(pan_st(riser(C["years1"] - C["rewind"], 12, 1400, 240), 0), C["rewind"] + 0.05, db(-26))                            # a falling riser (back in time)
drone(mus, C["no"] + 0.15, C["ankle_end"] - 0.02, [38, 45, 50, 53, 57], cutoff=380, gain=-22)                             # an empty world
for i, (tp, m) in enumerate([(C["anywhere"] + 0.2, 69), (C["tallest"] + 0.1, 72), (C["came1"], 76), (C["your"], 74)]):     # a lonely music box
    mus.add(pan_st(music_box(mtof(m), 0.7, 120 + i), 0.3), tp, db(-24))
groove(mus, C["but"] + 0.12, C["sharks3_end"] - 0.03, 104, ["Am", "E"], gain=-12, seed=20, kick_on=False, snaps=True, cutoff=1100)   # sharks: sneaky
drone(mus, C["trees4"] + 0.1, C["later_end"] + 0.1, [48, 55, 60, 64, 67], cutoff=900, gain=-20)                             # the first trees: wonder
mus.add(pan_st(riser(C["million"] - C["trees4"] + 0.2, 21, 220, 2200), 0), C["trees4"], db(-25))
crash(mus, C["million"] + 0.02, gain=-26, seed=22)
drone(mus, C["and1"] + 0.1, C["watched"] - 0.05, [45, 52, 57], cutoff=420, gain=-24)
groove(mus, C["dinosaurs"] + 0.12, C["came2_end"] - 0.02, 92, ["C", "G"], gain=-11, seed=30, kick_on=True, snaps=False, cutoff=900)   # the stroll (a tuba-ish walk)
drone(mus, C["and2"] + 0.05, C["went_end"] - 0.05, [36, 43, 48], cutoff=300, gain=-20)
groove(mus, C["still"] + 0.12, C["swimming_end"] + 0.25, 96, ["Dm", "G"], gain=-12, seed=40, kick_on=False, snaps=True)      # cool
groove(mus, C["so"] + 0.12, C["kid_end"] - 0.04, BPM, ["C", "F", "G", "C"], gain=-11, seed=50, kick_on=True, snaps=True)     # the bounce again
silence(mus, [(C["trees1_end"] - 0.05, C["trees2"] + 0.12),   # TREES? (the heart) Sharks. (the glint)
              (C["kids_end"] - 0.04, C["rewind"] + 0.1),      # kids. SLAP
              (C["years1_end"] - 0.02, C["no"] + 0.15),       # years. FLOMP
              (C["ankle_end"] - 0.02, C["but"] + 0.12),       # ankle. sproing
              (C["sharks3_end"] - 0.03, C["trees4"] + 0.1),   # sharks. splash, whee
              (C["watched"] - 0.05, C["dinosaurs"] + 0.12),   # watched. (deadpan)
              (C["went_end"] - 0.05, C["still"] + 0.12),      # went. BOOM. Sharks? Five mass extinctions. (bare)
              (C["kid_end"] - 0.04, DUR)])                    # kid. SPLASH, the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
