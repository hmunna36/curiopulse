"""The Planet Where It Rains GLASS Sideways ☔ Short: sound design, score and mix, cue-locked to timeline.json.

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
G = dict(tink=-17, glint=-27, rip=-10, riptop=-24, flap=-26, pull=-18, twinkle=-24, swing=-14, whoom=-12, roar=-20,
         push=-16, steam=-24, rainrun=-16, gust=-9, gusttop=-22, whizz=-24, zing=-15, shield=-18, pings=-13,
         up=-14, shimmer=-20, sniff=-14, gurgle=-18, clonk=-7, bonk=-12, ding=-16, swish=-22, fwump=-13, burner=-28)


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


def wind_bed(n, seed=0):
    """the planet's wind (stereo): a roar that gusts, all of its body under ~420 Hz, and a thin whistle above 5 kHz"""
    t = ar(n)
    gust = 0.6 + 0.4 * np.sin(2 * np.pi * (4 / DUR) * t + 1.3) * np.sin(2 * np.pi * (7 / DUR) * t)
    lo = filt(brown(n, seed), "lowpass", 420) * gust
    hi = top_only(white(n, seed + 1), 5600) * (0.4 + 0.6 * gust) * 0.12
    l = lo / (np.abs(lo).max() + 1e-9) + hi
    r = np.roll(lo, int(0.011 * SR)) / (np.abs(lo).max() + 1e-9) + np.roll(hi, int(0.007 * SR))
    return np.stack([l, r]) * 0.5


def fabric_rip(dur=0.32, seed=0):
    """cloth tearing: a fast ragged run of noise bursts (speech band: for the pause after the word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = filt(white(n, seed), "bandpass", [700, 5200])
    rng = np.random.RandomState(seed)
    clicks = np.zeros(n)
    for k in range(int(dur * 70)):
        i = int(rng.rand() * (n - 200))
        clicks[i:i + 120] += np.exp(-np.arange(120) / 20) * (0.5 + rng.rand())
    env = (0.3 + clicks) * np.minimum(1, t / 0.01) * np.exp(-np.maximum(0, t - dur * 0.6) / 0.05)
    return fade(soft_clip(y * env, 2.0), 0.002, 0.03)


def umbrella_fwump(seed=0):
    """an umbrella popping open: a low cloth thump (under ~300 Hz) and a snap of fabric on top (mono, 0.3 s)"""
    n = int(0.3 * SR)
    t = ar(n)
    body = np.sin(2 * np.pi * np.cumsum(150 * np.exp(-t / 0.05) + 60) / SR) * np.exp(-t / 0.07)
    snap = top_only(white(n, seed), 4200) * np.exp(-t / 0.015)
    y = body + 0.5 * snap / (np.abs(snap).max() + 1e-9)
    return soft_clip(fade(y, 0.0005, 0.05), 2.2)


def rising_hiss(dur=1.2, seed=0):
    """vapour rising: noise whose band climbs, all of it above 5 kHz (it runs under words; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = top_only(white(n, seed), 5400) * np.sin(np.pi * t / dur) ** 0.8 * (0.5 + 0.5 * t / dur)
    return fade(y / (np.abs(y).max() + 1e-9), 0.05, 0.1)


def fit_n(x):
    return np.pad(x, (0, max(0, N - len(x))))[:N]


def pause_spans(t0, t1, min_gap=0.2):
    """the silences between words inside (t0, t1): [(start, length)]"""
    out = []
    for a, b in zip(WORDS[:-1], WORDS[1:]):
        if t0 < a["end"] < t1 and b["start"] - a["end"] >= min_gap:
            out.append((a["end"] + 0.03, b["start"] - a["end"] - 0.1))
    return out


# ================================================================= the beds
sky_spans = [(0, SHOT["space"] + 0.5), (SHOT["eggs"], DUR)]
sky_on = gate(N, sky_spans)
wind_k = np.interp(tt, [0, c["gust"] - 0.1, c["gust"] + 0.3, SHOT["space"], SHOT["eggs"], DUR], [0.55, 0.55, 1.0, 1.0, 0.6, 0.6])
amb.x += wind_bed(N, 3) * sky_on * wind_k
space_on = gate(N, [(SHOT["space"] + 0.5, SHOT["eggs"])])
sp = filt(brown(N, 11), "lowpass", 150) * (0.7 + 0.3 * np.sin(2 * np.pi * (2 / DUR) * tt))
amb.x += pan_st(sp * 0.12, 0) * space_on
# the burner: a soft low roar now and then (under 260 Hz)
for tb in [0.0, 6.0, 12.8, 19.5, 31.4]:
    if tb < DUR - 1:
        bed.add(pan_st(fire_rumble(1.4, int(tb * 10) + 5, 240.0), 0.0), tb, db(G["burner"]))
# the glass rain: a constant fall of tiny glints (all above 5 kHz: under every word), in the sky shots
rng = np.random.RandomState(42)
tg = 0.02
while tg < DUR - 0.1:
    if any(a <= tg < b for a, b in sky_spans):
        bed.add(pan_st(glint(5600 + 2400 * rng.rand(), 0.05, int(tg * 100)), rng.rand() * 1.6 - 0.8), tg,
                db(G["glint"] - 6 * rng.rand() + (3 if tg > c["gust"] else 0)))
    tg += 0.07 + 0.09 * rng.rand()
# glass pinging off the canopy: whole tinks in the pauses of the hook (speech band), and in the loop's last frames
for k, (tp, g) in enumerate(pause_spans(0.0, c["tear"] + 0.2, 0.16)):
    for j in range(max(1, int(g / 0.09))):
        sfx.add(pan_st(glass_tink(10 + k * 7 + j, 2600.0 + 500 * ((k + j) % 3), 0.1), -0.5 + 0.25 * j), tp + 0.08 * j, db(G["tink"] - 2 * j))
sfx.add(pan_st(glass_tink(3, 3100.0, 0.08), -0.4), 0.0, db(G["tink"]))                        # frame 1: the first ping
for j in range(3):
    sfx.add(pan_st(glass_tink(70 + j, 2800.0 + 300 * j, 0.09), -0.4 + 0.2 * j), c["pop"] + 0.12 + 0.09 * j, db(G["tink"] - 1))

# ================================================================= the hook: "Shredded." -> the rip, the rags flap
bed.add(pan_st(top_only(fabric_rip(0.3, 5), 5200), -0.3), c["tear"], db(G["riptop"]))            # on the word: the top only
sfx.add(pan_st(fabric_rip(0.22, 6), -0.3), c["shredded_end"] + 0.03, db(G["rip"]))               # after it: the whole rip
bed.add(pan_st(flutter(0.5, 7, edges=True), 0.3), c["shredded_end"] + 0.1, db(G["flap"]))

# ================================================================= the sky: the pull-back, the factory's glitter
bed.add(pan_st(low_whoosh(0.9, 20), 0), SHOT["sky"] - 0.05, db(G["pull"]))
bed.add(pan_st(top_swish(0.8, 21), 0), SHOT["sky"], db(G["pull"] - 8))
for i in range(5):                                                                                   # factory. ... ting-ting-ting
    sfx.add(pan_st(glass_tink(30 + i, 2600.0 * (1.122 ** i), 0.09), -0.5 + 0.25 * i), c["factory_end"] + 0.03 + 0.05 * i, db(G["twinkle"] + 9))
for i in range(6):
    bed.add(pan_st(glint(6200 + 380 * i, 0.08, 40 + i), 0.4 * (-1) ** i), c["glass2"] + 0.1 + 0.09 * i, db(G["twinkle"]))

# ================================================================= the furnace: the whip to the star, WHOOM, the roar; rock steam; glass
sfx.add(pan_st(whoosh(0.5, 200, 2600, 50), 0.4), c["swing"] - 0.12, db(G["swing"]))
sfx.add(pan_st(soft_clip(filt(fire_whoosh(0.9, 51, 1.0), "lowpass", 300), 1.6), 0.2), c["star_hit"] - 0.02, db(G["whoom"]))   # WHOOM, low only (on "star")
bed.add(pan_st(fire_rumble(4.5, 52, 260.0), 0.2), c["star_hit"], db(G["roar"]))
bed.add(pan_st(low_thud(53, 64.0, 0.4), 0), c["right"], db(G["push"]))
bed.add(pan_st(rising_hiss(2.0, 54), 0), c["steam_in"], db(G["steam"]))
bed.add(pan_st(low_whoosh(1.6, 55), 0), c["steam_in"] + 0.1, db(G["steam"] + 2))
for i in range(4):                                                                                  # glass. ... tink tink
    sfx.add(pan_st(glass_tink(60 + i, 3000.0 - 260 * i, 0.09), 0.3 - 0.2 * i), c["glass3_end"] + 0.03 + 0.06 * i, db(G["rainrun"]))

# ================================================================= the wind: the gust, the bullet, the bead that passes it
sfx.add(pan_st(low_whoosh(0.9, 80), -0.3), c["gust"] - 0.08, db(G["gust"]))
bed.add(pan_st(top_swish(0.9, 81), -0.4), c["gust"], db(G["gusttop"]))
bed.add(pan_st(top_swish(1.4, 82), 0.0), c["bullet_in"] + 0.1, db(G["whizz"]))                 # the bullet crossing (top only)
sfx.add(pan_st(pew(0.14, 83, 4200.0, 1600.0), 0.5), c["bullet_end"] + 0.03, db(G["zing"]))      # bullet. ... ZING: the bead passes it

# ================================================================= SIDEWAYS: the shield, the beads through it, pings on the helmet
bed.add(pan_st(low_whoosh(0.5, 90), -0.3), c["shield"], db(G["shield"]))
for j in range(3):
    sfx.add(pan_st(glass_tink(91 + j, 3300.0 - 200 * j, 0.07), 0.1), c["sideways_end"] + 0.02 + 0.055 * j, db(G["pings"] - 2 * j))

# ================================================================= space: up and away, the shimmer before BLUE, the hush
bed.add(pan_st(top_swish(0.7, 100), 0), c["pull"] - 0.05, db(G["up"] - 6))
bed.add(pan_st(low_whoosh(0.8, 101), 0), c["pull"], db(G["up"] - 2))
pb = [w for w in WORDS if w["start"] < c["blue"] and w["end"] > c["blue"] - 0.8]
t_sh = (pb[-2]["end"] + 0.03) if len(pb) >= 2 else c["blue"] - 0.35
for i in range(5):                                                                                  # makes it... (shimmer) BLUE
    sfx.add(pan_st(glass_tink(110 + i, 2200.0 * (1.189 ** i), 0.12), -0.4 + 0.2 * i), t_sh + 0.055 * i, db(G["shimmer"]))

# ================================================================= the eggs: a sniff, the gurgle of stink, CLONK
sn = [s for s in pause_spans(c["stinks"], c["rotten"], 0.25)]
if sn:
    sfx.add(pan_st(sniff(0.2, 120), 0.1), sn[0][0] + 0.02, db(G["sniff"]))
    if sn[0][1] > 0.42:
        sfx.add(pan_st(sniff(0.18, 121), 0.1), sn[0][0] + 0.24, db(G["sniff"] - 2))
bed.add(pan_st(filt(brown(int(1.2 * SR), 122), "lowpass", 240) * np.sin(np.pi * ar(int(1.2 * SR)) / 1.2), 0.2), c["sniff"], db(G["gurgle"]))
sfx.add(pan_st(soft_clip(glass_tink(130, 1900.0, 0.2) + 0.8 * low_thud(131, 90.0, 0.2)[:int(0.2 * SR)], 2.0), 0.1), c["clonk"], db(G["clonk"]))
sfx.add(pan_st(bonk(), 0.1), c["clonk"] + 0.09, db(G["bonk"]))

# ================================================================= the button: a ding for the thumbs-up; the umbrella out; FWUMP
sfx.add(pan_st(ding(84, 0.12, 140, 1.0), 0.3), c["planet_end"] + 0.04, db(G["ding"]))
bed.add(pan_st(top_swish(0.3, 141), -0.3), c["pull_out"], db(G["swish"]))
sfx.add(pan_st(umbrella_fwump(142), -0.3), c["pop"], db(G["fwump"]))

# ================================================================= subscribe cue: none (the no-pill arm; nobody says "subscribe")

# ================================================================= score (drops out for every punchline)
STORM = ["Dm", "Bb", "F", "C"]
groove(mus, 0.05, c["shredded"] - 0.06, 104, STORM, gain=-10, seed=10, kick_on=False, snaps=True)                 # the glass rain
groove(mus, SHOT["sky"] + 0.1, c["factory"] - 0.06, 104, STORM, gain=-11, seed=12, kick_on=False, snaps=True, cutoff=1300)
drone(mus, c["the_furnace"] + 0.05, c["star_hit"] + 0.1, [38, 45, 50], cutoff=420, gain=-20, swell=0.8)           # the build to the star
mus.add(pan_st(riser(c["star_hit"] - c["the_furnace"] - 0.1, 150, 180, 1200), 0), c["the_furnace"] + 0.05, db(-30))
crash(mus, c["star_hit"], gain=-22, seed=3)
groove(mus, c["star_end"] + 0.1, c["glass3"] - 0.06, 96, ["Am", "F", "C", "G"], gain=-12, seed=20, kick_on=False, snaps=False,
       cutoff=1100)                                                                                               # the furnace: awe
drone(mus, c["star_end"] + 0.1, c["glass3"] - 0.06, [45, 52, 57], cutoff=380, gain=-22)
groove(mus, c["hits"] + 0.12, c["bullet"] - 0.06, 120, ["Dm", "Bb", "Gm", "A"], gain=-10, seed=30, kick_on=True, snaps=False,
       cutoff=1200)                                                                                               # the wind: a drive
groove(mus, c["so"] + 0.1, c["sideways"] - 0.06, 120, ["Dm", "Bb", "Gm", "A"], gain=-11, seed=31, kick_on=True, snaps=False,
       cutoff=1100)
drone(mus, c["pull"] + 0.4, c["pretty"] + 0.9, [41, 48, 53, 57, 64], cutoff=700, gain=-19, swell=0.6)              # space: wonder
groove(mus, c["space"] + 0.2, c["makes"] - 0.06, 84, ["F", "Am", "Bb", "C"], gain=-13, seed=40, kick_on=False, snaps=False,
       bass=False, cutoff=1500)
groove(mus, c["blue_end"] + 0.05, c["stinks"] - 0.06, 84, ["F", "Am", "Bb", "C"], gain=-12, seed=41, kick_on=False, snaps=False,
       bass=False, cutoff=1500)
groove(mus, c["lovely"] + 0.12, c["planet_end"] - 0.02, 104, STORM, gain=-11, seed=50, kick_on=False, snaps=True)   # deadpan
groove(mus, c["pack"] + 0.15, DUR, 104, STORM, gain=-10, seed=10, kick_on=False, snaps=True)                       # into the loop
silence(mus, [(c["shredded"] - 0.06, SHOT["sky"] + 0.1),          # Shredded. (the rip)
              (c["factory"] - 0.06, c["the_furnace"] + 0.05),  # GLASS factory. (ting ting)
              (c["glass3"] - 0.06, c["hits"] + 0.12),          # ...comes down as glass. (tinks) Then the wind hits.
              (c["bullet"] - 0.06, c["so"] + 0.1),             # bullet. (ZING)
              (c["sideways"] - 0.06, c["space"] + 0.2),        # SIDEWAYS. (pings)
              (c["makes"] - 0.06, c["blue_end"] + 0.05),       # makes it... BLUE. (shimmer)
              (c["stinks"] - 0.06, c["lovely"] + 0.12),        # It also stinks... of rotten EGGS. (sniff, CLONK)
              (c["planet_end"] - 0.02, c["pack"] + 0.15)])     # Lovely planet. (ding)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
