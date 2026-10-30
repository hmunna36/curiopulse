"""Why Can't You NOT Think of a White Bear? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The worlds: the campfire at night (the fire's rumble under 260 Hz and crackle over 5 kHz, crickets in the pauses), the
1987 study room (an air conditioner under 320 Hz, desk bells), 2 a.m. at the tent (crickets, a far owl). The countdown
ticks above 5 kHz under the hook. Speech-band gags sit in the pauses; under a word only their edges play.
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


def in_pause(t, dur):
    """is [t, t + dur] free of words (with a little air either side)?"""
    return all(not (w["start"] - 0.04 < t + dur and t < w["end"] + 0.06) for w in words)


def deskbell(seed=0, dur=0.7):
    """a service bell on a desk: a bright inharmonic ring with a tiny strike click (mono)"""
    n = int(dur * SR)
    u = ar(n)
    r = np.random.default_rng(seed)
    f0 = 2650.0 * r.uniform(0.98, 1.02)
    y = np.zeros(n)
    for k, (m, a, tau) in enumerate(((1.0, 1.0, 0.45), (2.76, 0.55, 0.22), (5.4, 0.25, 0.09), (1.003, 0.6, 0.5))):
        y += a * np.sin(2 * np.pi * f0 * m * u + k) * np.exp(-u / tau)
    y += 0.4 * filt(white(n, seed + 3), "highpass", 4000) * expdecay(n, 0.004)
    return fade(norm(y), 0.0005, 0.05)


def car_horn(dur=0.16, seed=0):
    """a small car's horn: two detuned buzzy tones a minor third apart (mono, speech band: for a pause)"""
    n = int(dur * SR)
    u = ar(n)
    y = np.zeros(n)
    for f in (415.0, 494.0):
        ph = 2 * np.pi * f * u
        y += np.tanh(2.2 * (np.sin(ph) + 0.5 * np.sin(2 * ph + 0.3) + 0.3 * np.sin(3 * ph)))
    y = filt(y, "bandpass", [300, 3600], 2)
    return fade(norm(y), 0.006, 0.03)


def paper(dur=0.5, seed=0):
    """paper being unfolded: soft crinkles (mono)"""
    n = int(dur * SR)
    y = crackle(n, 120, seed, 1500, 8000, 0.003) * (0.6 + 0.4 * np.sin(np.pi * np.linspace(0, 1, n)))
    y += 0.4 * filt(white(n, seed + 1), "bandpass", [2000, 7000]) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return fade(norm(y), 0.01, 0.06)


def projector_clunk(seed=0):
    """a slide projector's clunk: a click and a low thud (mono, 0.18 s)"""
    n = int(0.18 * SR)
    y = 0.8 * thump(0.16, 140, 60, 0.04, seed)[:n]
    y = np.pad(y, (0, n - len(y)))
    y += 0.5 * filt(white(n, seed + 2), "bandpass", [1800, 6000]) * expdecay(n, 0.006)
    return fade(norm(y), 0.0005, 0.03)


# ================================================================= ambience (one bed per world, gated to its shots)
camp_on = gate(N, [(0, SHOT["lab"]), (SHOT["button"], DUR)], 0.06)
lab_on = gate(N, [(SHOT["lab"], SHOT["night"])], 0.06)
night_on = gate(N, [(SHOT["night"], SHOT["button"])], 0.06)
# the campfire: its rumble under 260 Hz and crackle over 5 kHz, all the way under the words
fire = fire_rumble(DUR, 3, 240)
amb.x += pan_st(fire, 0.35) * camp_on * 0.8
# the study room: an air conditioner
amb.x += pan_st(filt(pink(N, 7), "lowpass", 320) * 0.35 + 0.04 * np.sin(2 * np.pi * 120 * tt), 0) * lab_on
# 2 a.m.: the fire nearly out, a low breeze
amb.x += pan_st(filt(brown(N, 9), "lowpass", 200) * 0.5, -0.2) * night_on
# crickets in the night's pauses (they are above 4 kHz, but keep them to the gaps)
crk = Bus()
crickets(0.2, SHOT["lab"] - 0.1, crk, db(-27), seed=4, f=4600, rate=0.9)
crickets(SHOT["night"], SHOT["button"], crk, db(-24), seed=5, f=4800, rate=1.4)
crickets(SHOT["button"], DUR, crk, db(-27), seed=6, f=4600, rate=0.9)
bed.x += crk.x * PAUSE

# ================================================================= the hook
# frame 1: he's already straining: a tense tick-tock above 5 kHz until "Too late."
tick = Bus()
for k in range(int((c["too"] - 0.0) / 0.5)):
    n = int(0.02 * SR)
    tick.add(filt(white(n, 700 + k), "highpass", 5000) * expdecay(n, 0.003), 0.02 + 0.5 * k, db(-20), pan=0.4 * (-1) ** k)
bed.x += tick.x
# the bear pops into the bubble on "white": the pop's edges under the word, a sparkle above 5 kHz
sfx.add(pan_st(edges(cork_pop(3, 820.0)), 0.3), c["white"] + 0.02, db(-12))
for k in range(5):
    bed.add(pan_st(glint(5600 + 420 * k, 0.08, k), 0.35), c["white"] + 0.05 + 0.05 * k, db(-24))
# "Go!": a start beep in the gap after it
sfx.add(pan_st(beep(1760.0, 0.07), -0.2), c["go"] + 0.38, db(-24))
# "Too late.": the fail buzzer in the gap after it
sfx.add(pan_st(buzzer(0.32), -0.2), c["late_end"] + 0.04, db(-23))

# ================================================================= the guard
# the lookout springs out of his hair on "hired": a boing's edges under the words, a ratchet's top as it climbs
sfx.add(pan_st(edges(boing(0.5, 140.0, 2)), 0), c["hired"] - 0.04, db(-11))
bed.add(pan_st(ratchet(0.3, 30.0, 60.0, 3, edges=True), 0), c["hired"] - 0.02, db(-20))
# the salute: a glint run
for k in range(3):
    bed.add(pan_st(glint(6200 + 500 * k, 0.08, 10 + k), -0.2), c["hired"] + 0.35 + 0.06 * k, db(-25))
# the binoculars up on "watch": a click's top
bed.add(pan_st(filt(key_click(4), "highpass", 4500), 0), c["watch"] - 0.12, db(-18))
# "Keep trying.": the head shake (a shiver's edges), the bear poofs in the gap after "trying." (a puff of air)
sfx.add(pan_st(edges(shiver(0.4, 5)), 0), c["keep"] + 0.05, db(-15))
sfx.add(pan_st(filt(whoosh(0.22, 600, 3000, 6, 0.7), "bandpass", [500, 4500]), 0.3), c["keep"] + 0.42, db(-22))
# the sweeps: soft low whooshes as he turns
for k, f in enumerate((c["every"] + 0.05, c["every"] + 0.75, c["every"] + 1.45)):
    bed.add(pan_st(filt(whoosh(0.3, 200, 900, 20 + k, 0.6), "lowpass", 500), 0.4 * (-1) ** k), f, db(-22))
# "any bears?" (whispered): nothing but a cricket after it
bed.add(pan_st(cricket(7, 3, 4700), 0.5), c["bears2_end"] + 0.06, db(-22))

# ================================================================= the poster
# he unfolds it: paper under "But to spot one", only its top
bed.add(pan_st(filt(paper(0.6, 3), "highpass", 5000), 0.1), c["but"] + 0.1, db(-17))
bed.add(pan_st(filt(paper(0.4, 4), "highpass", 5000), 0.1), c["spot_one"] + 0.1, db(-18))
# each pop: the projector's clunk (its edges on a word, whole in a pause), the bear's pop, a sparkle
for k, f in enumerate(c["pops"]):
    clunk = projector_clunk(30 + k)
    pop = cork_pop(40 + k, 760.0 + 90 * k)
    whole = in_pause(f, 0.18)
    sfx.add(pan_st(clunk if whole else edges(clunk), 0.1), f - 0.03, db(-16))
    sfx.add(pan_st(pop if whole else edges(pop), 0.35), f + 0.03, db(-14 if whole else -11))
    for j in range(4):
        bed.add(pan_st(glint(5800 + 500 * j, 0.07, 50 + k * 4 + j), 0.35), f + 0.06 + 0.04 * j, db(-19))
# into the study room
sfx.add(pan_st(whoosh(0.26, 300, 2200, 61, 0.8), 0), SHOT["lab"] - 0.2, db(-19))

# ================================================================= the study: the bells
for k, (f, who) in enumerate(zip(c["dings"], c["ding_who"])):
    b = deskbell(70 + k)
    pan = (-0.45, 0.0, 0.45)[who]
    if in_pause(f, 0.22):
        nxt = min([w["start"] for w in words if w["start"] > f] + [DUR])
        ring = max(0.12, min(0.7, nxt - f - 0.06))           # the ring ends before the next word
        sfx.add(pan_st(fade(b[: int(ring * SR)], 0.0005, 0.05), pan), f, db(-17))
    else:
        bed.add(pan_st(filt(b, "highpass", 5200), pan), f, db(-14))
        sfx.add(pan_st(edges(thump(0.08, 300, 120, 0.02, k)), pan), f, db(-22))   # the palm on the plunger
# "over once a minute!": the verdict's stamp, its thud on "once"
sfx.add(pan_st(edges(thump(0.16, 170, 60, 0.05, 7), 220, 6000), 0), c["once"] - 0.02, db(-15))
# into 2 a.m.
sfx.add(pan_st(filt(whoosh(0.22, 200, 1400, 71, 0.7), "lowpass", 900), 0), SHOT["night"] - 0.3, db(-19))

# ================================================================= 2 a.m.
# the replay rewinds on "replays": a scratch's edges under the word
sfx.add(pan_st(edges(scratch(0.28, 3)), 0), c["replays"], db(-13))
bed.add(pan_st(ratchet(0.26, 60.0, 20.0, 8, edges=True), 0), c["replays"] + 0.02, db(-19))
# the cringe: a little wah-wah whole in the gap after "two a.m."
am_end = [w for w in words if w["block"] == "weird"][-1]["end"]
sfx.add(pan_st(fade(wahwah(3)[: int(0.34 * SR)], 0.005, 0.08), 0), am_end + 0.03, db(-25))   # its first 'wah' only: the gap is 0.4 s
# into the button
sfx.add(pan_st(edges(whoosh(0.24, 400, 2600, 81, 0.8), 300, 4500), 0), SHOT["button"] - 0.16, db(-18))

# ================================================================= the button
# the peek: a sly glint in the gap after "The trick?"
for k in range(3):
    bed.add(pan_st(glint(6400 + 400 * k, 0.08, 90 + k), 0.3), c["trick"] + 0.5 + 0.05 * k, db(-23))
sfx.add(pan_st(bloop(520, 760, 0.12), 0.3), c["trick"] + 0.52, db(-24))
# the red car drives into the bubble: an engine's edges under "red car", a squeak's top as it parks
sfx.add(pan_st(edges(engine(0.9, 4)), 0.4), c["red"] - 0.08, db(-14))
bed.add(pan_st(filt(squeak(0.16, 2400, 3200), "highpass", 5000), 0.3), c["car"] + 0.33, db(-18))
# the tick: a glint on "instead"
for k in range(3):
    bed.add(pan_st(glint(6000 + 600 * k, 0.08, 100 + k), 0.3), c["instead"] + 0.05 + 0.05 * k, db(-23))
# the bear at the wheel: a pop, then the horn twice, whole, after "Ready?"
sfx.add(pan_st(cork_pop(9, 900.0), 0.3), c["bear_car"], db(-17))
sfx.add(pan_st(car_horn(0.13, 1), 0.3), c["honk"], db(-15))
sfx.add(pan_st(car_horn(0.16, 2), 0.3), c["honk"] + 0.19, db(-15))
# the loop: the car and the bear poof out, the tension tick starts again (frame 1's)
sfx.add(pan_st(filt(whoosh(0.2, 700, 3200, 91, 0.6), "bandpass", [500, 5000]), 0), c["loop"] + 0.02, db(-22))
n = int(0.02 * SR)
bed.add(pan_st(filt(white(n, 999), "highpass", 5000) * expdecay(n, 0.003), 0.4), DUR - 0.48, db(-20))

# ================================================================= score (drops out for every punchline)
BPM = 112
BAR = 4 * 60.0 / BPM
# the hook: a held, tense low pad (he's straining), a soft pizz heartbeat; out for "Too late."
drone(mus, 0.0, c["too"] - 0.05, [38, 45, 50, 53], cutoff=420, gain=-24, seed=2, swell=0.5)
for k in range(int((c["too"] - 0.1) / 0.536) + 1):
    tb = 0.02 + k * 0.536
    if tb > c["too"] - 0.1:
        break
    mus.add(filt(pizz(mtof(38 if k % 2 == 0 else 45), 0.35, k), "lowpass", 600) * 1.2, tb, db(-17))
# the guard: a sneaky ranger patrol (pizzicato + marimba groove, low-passed), from "Your brain"
groove(mus, c["brain"] + 0.15, c["any"] - 0.05, BPM, ["Dm", "Bb", "C", "A"], gain=-8, seed=10, kick_on=False, cutoff=900)
# "any bears?": nothing; then a curious pad as he unfolds the poster
drone(mus, c["but"] + 0.1, c["picture"] - 0.05, [50, 57, 62, 65], cutoff=600, gain=-25, seed=3, swell=0.8)
# the pops: a comedic low blat after each (in their pauses only)
for k, f in enumerate(c["pops"]):
    if in_pause(f + 0.15, 0.2):
        bwomp(mus, f + 0.15, m=34 + 3 * k, gain=-14)
# the study: a bright, busy marimba groove
groove(mus, SHOT["lab"] + 0.15, SHOT["night"] - 0.05, BPM, ["F", "C", "Dm", "Bb"], gain=-8, seed=20)
# 2 a.m.: a slow, wistful pad and a few music-box notes in the pauses
drone(mus, SHOT["night"], am_end, [53, 57, 60, 64], cutoff=520, gain=-25, seed=5, swell=0.6)
mb = Bus()
for i, m in enumerate([81, 79, 77, 76, 77, 79]):
    mb.add(music_box(mtof(m), 0.8, 30 + i) * 0.6, SHOT["night"] + 0.1 + 0.55 * i, db(-21))
mus.x += mb.x * PAUSE
# the button: the groove comes back under "Picture a red car", out after "Ready?" for the gag, and the loop's own tension
g0 = c["picture2"] + 0.12
groove(mus, g0, c["ready_end"] + 0.05, BPM, ["F", "C"], gain=-7, seed=30)
silence(mus, [(c["too"] - 0.05, c["brain"] + 0.15), (c["keep"] - 0.05, c["every"] + 0.15), (c["any"] - 0.05, c["but"] + 0.1),
              (am_end, SHOT["button"] + 0.05), (c["ready_end"] + 0.05, DUR)])
# the loop's last 0.45 s: the hook's pad again, so the join is the same sound on both sides
drone(mus, c["loop"], DUR, [38, 45, 50, 53], cutoff=420, gain=-24, seed=2, swell=0.5)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"sfx": -7.0, "music": -13.0})
