"""Why Does Your Mouth Water When You Imagine a LEMON? 🍋 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The worlds: a lemon grove over the sea at noon (a soft sea wash under 450 Hz, cicadas above 5 kHz, sparrows in the
pauses, a sunny 112 BPM groove that loops), his head as glass (a low hum, the spit taps running: a gush under 400 Hz and
a hiss above 5 kHz, bubbles), the lab (an air conditioner's hum, the TV's crunch through a small speaker, drips into the
cups). Speech-band gags sit in the pauses; under a word only their edges (under 250 Hz and over 5.2 kHz) play.
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
c = C
words = TL["words"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
PAUSE = pause_mask(words, N)                       # 1 where nobody speaks


def edges(y, lo=250.0, hi=5200.0):
    """only what a phone plays round a word: the thump under lo and the sizzle over hi"""
    return filt(y, "lowpass", lo, 2) + filt(y, "highpass", hi, 2)


def norm(y):
    return y / (np.abs(y).max() + 1e-9)


def crunch(seed=0, juicy=1.0):
    """a bite into a lemon wedge: the teeth through the rind (a short crackle), a wet squish, a low thud (mono, 0.3 s)"""
    n = int(0.3 * SR)
    u = np.linspace(0, 1, n)
    cr = crackle(n, 900, seed, 1800, 9000) * attack_decay(n, 0.002, 0.07)
    sq = svf_bp(white(n, seed + 3), 700 + 1800 * u, 0.6) * attack_decay(n, 0.01, 0.12) * juicy
    th = thump(0.2, 150, 55, 0.05, seed)
    out = 0.8 * cr + 0.7 * sq
    out[: len(th)] += 0.9 * th[:n]
    return fade(norm(out), 0.001, 0.05)


def spritz(dur=0.35, seed=0):
    """juice squirting out: a fast hiss that falls away, nearly all above 4 kHz (mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 4200) * attack_decay(n, 0.004, dur * 0.35)
    y += 0.5 * crackle(n, 700, seed + 1, 5000, 11000) * attack_decay(n, 0.002, dur * 0.25)
    return fade(norm(y), 0.001, 0.04)


def gush(dur, seed=0, top=400.0):
    """a tap running: a wash of water noise with a slow wobble (mono); keep it under `top` Hz under the words"""
    n = int(dur * SR)
    u = ar(n)
    y = filt(pink(n, seed), "lowpass", top) * (0.75 + 0.25 * np.sin(2 * np.pi * 3.1 * u))
    return fade(norm(y), 0.08, 0.15)


def aww(dur=0.5, seed=0):
    """a small crowd going 'awww': four breathy voices, up then down (mono)"""
    out = np.zeros(int(dur * SR))
    for i, f in enumerate((240, 280, 320, 360)):
        a = yawn_voice(dur * 0.45, f * 0.95, f * 1.12, seed + i, 0.5, ((800, 380), (1150, 900)))
        b = yawn_voice(dur * 0.55, f * 1.12, f * 0.86, seed + 10 + i, 0.5, ((800, 380), (1150, 900)))
        v = np.concatenate([a, b])[: len(out)]
        out[: len(v)] += v
    return fade(filt(norm(out), "lowpass", 2600), 0.04, 0.1)


def tv(y):
    """a sound out of a small TV speaker: no lows, no highs (mono)"""
    return filt(y, "bandpass", [420, 3600], 2)


# ================================================================= ambience (one bed per world, gated to its shots)
grove_on = gate(N, [(0, SHOT["section"]), (SHOT["button"], DUR)], 0.06)
head_on = gate(N, [(SHOT["section"], SHOT["lab"])], 0.06)
lab_on = gate(N, [(SHOT["lab"], SHOT["button"])], 0.06)
# the grove: the sea's wash (slow swells, under 450 Hz) and cicadas (a shimmer above 5 kHz)
swell = 0.7 + 0.3 * np.sin(2 * np.pi * tt / (DUR / round(DUR / 4.2)))
sea = filt(pink(N, 1), "lowpass", 450) * swell * 0.55
cic = filt(white(N, 2), "bandpass", [5600, 7800]) * (0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 21 * tt))) * 0.10
amb.x += pan_st(sea, -0.1) * grove_on + pan_st(cic, 0.3) * grove_on
# inside the head: a soft low hum
amb.x += pan_st(filt(brown(N, 5), "lowpass", 180) * 0.45 + 0.05 * np.sin(2 * np.pi * 55 * tt), 0) * head_on
# the lab: an air conditioner
amb.x += pan_st(filt(pink(N, 7), "lowpass", 320) * 0.35 + 0.04 * np.sin(2 * np.pi * 120 * tt), 0) * lab_on
# sparrows in the grove's pauses
for k, t0 in enumerate((2.24, 3.84, SHOT["button"] + 0.02, c["drooling_end"] + 0.1, c["drooling2_end"] + 0.05)):
    sfx.add(pan_st(tweet(30 + k, 3300 + 180 * k), 0.4 * (-1) ** k), t0, db(-30))

# ================================================================= the hook
# frame 1: the teeth already in the wedge: a squish's edges and the juice's hiss under "Imagine"
sfx.add(pan_st(edges(crunch(1, 1.2)), 0.15), 0.0, db(-15))
sfx.add(pan_st(spritz(0.3, 2), 0.3), 0.0, db(-20))
# the bite on "biting": its edges under the word; the squirt on "juicy"
sfx.add(pan_st(edges(crunch(4, 1.0)), 0.15), c["chomp"], db(-12))
sfx.add(pan_st(spritz(0.4, 5), 0.35), c["chomp"] + 0.02, db(-17))
sfx.add(pan_st(spritz(0.5, 6), 0.4), c["squirt"], db(-15))
# the sour shudder in the gap after "lemon."
sfx.add(pan_st(shiver(0.3, 3), 0), c["lemon_end"] + 0.02, db(-17))
# the drool: a drip as the drop lets go (after "right?"), the gulp before "There's"
sfx.add(pan_st(drip(4, 1900), 0.2), c["right_end"] + 0.02, db(-24))
sfx.add(pan_st(gulp(2), 0), c["gulp"] - 0.04, db(-18))
# the ghost lemon pops: a puff's edges on "lemon...", a sparkle over it
sfx.add(pan_st(edges(cork_pop(3, 900.0)), 0.25), c["poof"], db(-14))
for k in range(5):
    bed.add(pan_st(glint(5600 + 420 * k, 0.08, k), 0.3), c["poof"] + 0.04 + 0.05 * k, db(-26))
# the window on his forehead: a bloop in the gap after "lemon...", a glint
sfx.add(pan_st(bloop(420, 900, 0.16), -0.2), c["lemon2_end"] + 0.04, db(-22))
# the PRACTICE stamp: its thud under the word; the brain's CHOMP whole in the gap after "bite."
sfx.add(pan_st(edges(thump(0.16, 170, 60, 0.05, 7), 220, 6000), 0), c["practice"] + 0.02, db(-16))
sfx.add(pan_st(chomp(5), 0), c["brain_chomp"], db(-12))
# the dive into his head
sfx.add(pan_st(filt(whoosh(0.24, 200, 1500, 21, 0.9), "lowpass", 700), 0), c["brain_chomp"] + 0.12, db(-19))

# ================================================================= the glass head: the taps, the flood, the lick
# the signal down the cord: a soft rising pip in the gap before "Feel"? (no gap): a glint run above 5 kHz
for k in range(4):
    bed.add(pan_st(glint(6000 + 300 * k, 0.07, 40 + k), 0), c["feel"] + 0.06 + 0.07 * k, db(-27))
# the taps open: two handle squeaks' edges, then the water: a gush under 400 Hz, a hiss above 5 kHz, gurgles
bed.add(pan_st(edges(squeak(0.12, 1800, 2600)), -0.2), c["taps"], db(-24))
bed.add(pan_st(edges(squeak(0.12, 2000, 2900)), 0.2), c["taps"] + 0.1, db(-24))
run0, run1 = c["taps"] + 0.12, SHOT["lab"] - 0.1
bed.add(pan_st(gush(run1 - run0, 3, 260), 0), run0, db(-17))
bed.add(pan_st(sprinkler_tss(run1 - run0, 4, 14.0, False), 0), run0, db(-27))
for k in range(9):
    tb = c["under"] + 0.4 * k
    if tb > c["slowly_end"]:
        break
    bed.add(pan_st(filt(gurgle(0.2, 50 + k, 22), "lowpass", 240), 0), tb, db(-22))
# the ghost lemon appears: a glint run on "Now"
for k in range(3):
    bed.add(pan_st(glint(6400 + 500 * k, 0.08, 60 + k), 0.4), c["now"] + 0.03 * k, db(-25))
# the lick: a wet slurp whole in the gap after "licking it.", then the slow stretch under "Slowly." (only its edges)
sfx.add(pan_st(slurp(0.32, 7, 22.0), 0.25), c["licking_end"] + 0.25, db(-17))
bed.add(pan_st(edges(creak(0.8, 9, 90, 160)), 0.2), c["slowly"] + 0.05, db(-20))
# full blast: a splash whole in the gap after "Slowly.", a drip off his lip
sfx.add(pan_st(splash(0.4, 11, 0.6), 0), c["slowly_end"] + 0.03, db(-22))
sfx.add(pan_st(drip(12, 1500), 0.3), c["slowly_end"] + 0.28, db(-22))

# ================================================================= ACID: the alarm, the button, the hose, the fizz
sfx.add(pan_st(edges(thump(0.2, 140, 55, 0.05, 13), 220, 6000), 0), c["acid"] - 0.02, db(-13))
sfx.add(pan_st(alarm_bell(0.24, 14, 28.0, 2100.0), -0.3), c["acid_end"] + 0.02, db(-26))
# the brain slaps the SPIT button: its edges under "so your brain"
sfx.add(pan_st(edges(slap_hit(15)), -0.3), c["so"] + 0.14, db(-12))
# the hose: the hiss above 5 kHz under "hoses your teeth"
bed.add(pan_st(sprinkler_tss(c["early_end"] - c["hoses"], 16, 9.0, False), 0.1), c["hoses"], db(-20))
# the teeth shine: glints
for k in range(4):
    bed.add(pan_st(glint(5800 + 600 * k, 0.09, 70 + k), 0.2 * (-1) ** k), c["teeth"] + 0.05 + 0.09 * k, db(-24))
# the acid drops fizzle out on wet teeth (a hiss above 5 kHz), and the tick
for k, f in enumerate((c["down"] - 0.05, c["early"] + 0.08, c["early_end"] + 0.05)):
    bed.add(pan_st(filt(gas_hiss(0.3, 80 + k), "highpass", 5200), 0.3), f, db(-21))
sfx.add(pan_st(ding(88, 0.12, 3, 1.2), 0), c["early_end"] + 0.06, db(-24))
sfx.add(pan_st(whoosh(0.26, 300, 2200, 41, 0.8), 0), SHOT["lab"] - 0.2, db(-19))

# ================================================================= the lab: people drooled watching a man eat a lemon
# the TV: his bites through a small speaker (only the edges under a word)
for k, f in enumerate((c["in_lab"] + 0.25, c["drooled"] + 0.2, c["eat"] + 0.02)):
    bed.add(pan_st(edges(tv(crunch(90 + k, 1.0)), 230, 3400), -0.35), f, db(-20))
# the drips into the cups: a tiny plink each (high, quiet)
for k, f in enumerate(c["drips"]):
    bed.add(pan_st(edges(drip(100 + k, 2400 + 150 * (k % 3))), 0.3 * ((k % 3) - 1)), f + 0.45, db(-22))
sfx.add(pan_st(whoosh(0.22, 320, 2100, 51, 0.7), 0), SHOT["caring"] - 0.16, db(-23))

# ================================================================= the caring: the hearts pop, "awww"
for k, f in enumerate(c["hearts"][:3]):
    bed.add(pan_st(glint(5600 + 500 * k, 0.1, 110 + k), 0.3 * (k - 1)), f + 0.02, db(-23))
    bed.add(pan_st(edges(bloop(220 + 60 * k, 120, 0.14)), 0.3 * (k - 1)), f + 0.02, db(-22))
sfx.add(pan_st(aww(0.5, 4), 0), c["others_end"] + 0.03, db(-21))

# ================================================================= the button
sfx.add(pan_st(edges(whoosh(0.24, 400, 2600, 61, 0.8), 300, 4500), 0), SHOT["button"] - 0.16, db(-18))
# the rosette slaps onto the lens on "nice" (its edges), a ding in the gap after it
sfx.add(pan_st(edges(slap_hit(17)), -0.3), c["rosette"], db(-11))
sfx.add(pan_st(ding(91, 0.14, 5, 1.3), -0.2), c["nice_end"] + 0.03, db(-23))
# it peels off and falls: a slide down whole in the gap after "drooling?"
sfx.add(pan_st(slide_whistle(0.3, 1500, 480), -0.3), c["drooling2_end"] + 0.03, db(-26))
# he lifts a new wedge: a soft whoosh after "again."
sfx.add(pan_st(filt(whoosh(0.3, 250, 1600, 71, 0.7), "lowpass", 1400), 0.2), c["again_end"] + 0.05, db(-22))

# ================================================================= subscribe cue: none (the 11:30 arm; nobody says "subscribe")

# ================================================================= score (drops out for every punchline)
BPM = 112
BAR = 4 * 60.0 / BPM
# the grove: a sunny groove from frame 1 (a crash on frame 1), out for "There's no lemon..."
crash(mus, 0.0, gain=-28, seed=1)
groove(mus, 0.0, c["theres"] - 0.05, BPM, ["F", "C", "Dm", "Bb"], gain=-5, seed=10)
# the brain's practice bite: a low, curious pad under the answer line (nothing in the speech band)
drone(mus, c["your_brain"] - 0.05, c["bite_end"], [41, 48, 53], cutoff=420, gain=-26, seed=2, swell=0.6)
# one music-box note in the gap before "your brain" (the window opening)
mus.add(music_box(mtof(84), 0.5, 21) * 0.8, c["lemon2_end"] + 0.06, db(-17))
# inside: a watery pad with a marimba drip line, gone under "Slowly."
drone(mus, SHOT["section"], c["slowly"] - 0.05, [53, 60, 65, 69], cutoff=520, gain=-25, seed=3)
# a marimba drip line, its notes only in the pauses
drip_line = Bus()
for i in range(12):
    tb = c["flood"] + i * 0.27
    if tb > c["slowly"] - 0.1:
        break
    drip_line.add(marimba(mtof([77, 81, 84, 81, 79, 84, 86, 84, 81, 79, 77, 81][i]), 0.5, 30 + i) * 0.7, tb, db(-19))
mus.x += drip_line.x * PAUSE
# ACID: a tense pulse, then a lift as the brain hoses the teeth, resolved on "early"
drone(mus, c["lemon3"] - 0.05, c["so"], [50, 57, 62, 65], cutoff=800, gain=-25, seed=5, swell=1.2)
for i in range(8):
    tb = c["acid"] + i * 0.18
    if tb > c["so"] - 0.05:
        break
    mus.add(pizz(mtof(38), 0.3, 40 + i) * 1.2, tb, db(-17))
drone(mus, c["so"], c["early_end"] + 0.25, [53, 60, 65, 69, 72], cutoff=1100, gain=-24, seed=6, swell=1.0)
# the lab: a sneaky pizzicato walk
for i in range(14):
    tb = SHOT["lab"] + 0.08 + i * 0.32
    if tb > c["lemon4_end"]:
        break
    mus.add(filt(pizz(mtof([41, 45, 48, 45, 43, 46, 50, 46, 41, 45, 48, 52, 53, 48][i]), 0.4, 50 + i), "lowpass", 900) * 1.2, tb, db(-16))
# the caring: a warm pad and a music box for the hearts
drone(mus, SHOT["caring"], SHOT["button"] - 0.05, [53, 57, 60, 64, 69], cutoff=600, gain=-25, seed=7, swell=0.8)
# (the hearts' own sounds are glints above 5 kHz: the words "cared about others" sit on them)
# the button: the groove comes back and lands on a bar line exactly at the end, so the loop rolls into frame 1's bar
g0 = DUR - 2 * BAR
groove(mus, g0, DUR, BPM, ["Dm", "Bb"], gain=-7, seed=14)
silence(mus, [(c["theres"] - 0.05, c["your_brain"] - 0.05), (c["bite_end"] - 0.05, SHOT["section"] + 0.1),
              (c["slowly"] - 0.05, c["slowly_end"] + 0.25), (c["lemon4_end"], SHOT["caring"]),
              (SHOT["button"] - 0.05, g0 - 0.02)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"sfx": -7.0})   # the gags 2 dB under the house level: they sit 1-6 dB under her in their gaps
