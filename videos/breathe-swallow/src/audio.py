"""Why Can't You Breathe and SWALLOW at the Same Time? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The swallow is the instrument: a low glug on every gulp (under 300 Hz, so it can sit under words), two puffs of air that
whoosh in above the words and bonk off his nose, a squeak for HEY!, the score itself PAUSES when the brain hits pause
(only a low dread under "and the lid slams"), a SLAM in the gap before "SHUT.", the air whooshing back with the groove,
a cough (KOFF!) in its own pause, an alarm clock above the words, a day of clicking swallows, a whistle he does not
notice, a record scratch, the switch to MANUAL, and one big comic GULP before "Sorry.". What sits on a word is kept
under 300 Hz or above 5.2 kHz; what carries a joke gets a pause to itself.
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
PAUSE = pause_mask(WORDS, N)                       # 1 where nobody is speaking, 0 under words


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def air(t0, t1, gain, seed, shape=None, pan=0.0):
    """air on the move: it can run under words, because it is only above 5.2 kHz"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(filt(white(n, seed), "highpass", 5200, 4) * env, 0.004, 0.03), pan), t0, db(gain))


def glug(t, gain, seed, bus=None):
    """a swallow, all of it under 300 Hz with a wet tick on top: it can sit under a word"""
    if t >= DUR:
        return
    (bus or bed).add(pan_st(fade(glug_low(seed), 0.004, 0.04), 0.0), max(0.0, t), db(gain))


def cough(t, gain, seed=0, pan=0.0):
    """KOFF!: two quick barks, a burst of breath through a closing throat over a low chest knock"""
    for i, (dt, g) in enumerate(((0.0, 0.0), (0.17, -4.0))):
        n = int(0.16 * SR)
        u = np.linspace(0, 1, n)
        env = np.minimum(1, u / 0.012) * (1 - u) ** 2.2
        y = filt(white(n, seed + i), "bandpass", [380, 2600]) * env
        ph = 2 * np.pi * np.cumsum(170 * (1.1 - 0.25 * u)) / SR
        y += 0.5 * filt(np.sign(np.sin(ph)) * env, "lowpass", 1400, 2)
        sfx.add(pan_st(fade(norm(y) * 0.8, 0.002, 0.03), pan), t + dt, db(gain + g))
        low_thud(t + dt, gain - 2, 110.0, 0.16, 0.05, sfx)


def whistle(t0, notes, step, gain, seed=0):
    """he whistles without noticing: a thin pure tune with a wobble (speech band, so in a pause)"""
    for i, m in enumerate(notes):
        f = L.mtof(m)
        n = int(step * 0.92 * SR)
        u = np.linspace(0, 1, n)
        ph = 2 * np.pi * np.cumsum(f * (1 + 0.012 * np.sin(2 * np.pi * 6.0 * u * step))) / SR
        y = np.sin(ph) + 0.08 * filt(white(n, seed + i), "bandpass", [f * 0.9, f * 1.1])
        sfx.add(pan_st(fade(y * 0.5, 0.02, 0.04), 0.1), t0 + i * step, db(gain))


def switch_click(t, gain, seed=0):
    """a toggle switch thrown: a hard click with a little body"""
    hi_tick(t, gain, seed, 0.0)
    m = int(0.05 * SR)
    sfx.add(pan_st(filt(white(m, 70 + seed), "bandpass", [1800, 4200]) * expdecay(m, 0.006), 0.0), t + 0.005, db(gain - 6))


# ================================================================= ambience: the summit (wind, birds) and inside (muffled)
wind = norm(filt(brown(N, 1), "lowpass", 320) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * tt) * np.sin(2 * np.pi * 0.07 * tt + 1)))
outside = gate(N, [(0.0, SHOT["inside"] + 0.05), (SHOT["drink"] - 0.05, SHOT["late"] + 0.05), (SHOT["day"] - 0.05, DUR)])
amb.x += pan_st(wind, 0) * 0.3 * outside
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.32 * gate(N, [(SHOT["inside"] - 0.05, SHOT["drink"] + 0.05), (SHOT["late"] - 0.05, SHOT["day"] + 0.05)])
for i, tb in enumerate((c["time_end"] + 0.06, c["hey"] + 0.18)):                     # a bird or two, in the pauses outside
    if tb < SHOT["inside"]:
        sfx.add(pan_st(fade(tweet(30 + i, 3600.0), 0.005, 0.03), 0.6), tb, db(-27))

# ================================================================= 1. the hook: the test
glug(0.0, -13, 1)                                                                     # frame 0: the swallow is under way
air(c["breathe"] - 0.05, c["bounce1"] + 0.02, -17, 2, lambda u: u ** 1.5, pan=0.0)    # the puffs whoosh in (above the words)
low_thud(c["bounce1"], -12, 190.0, 0.14, 0.04)                                        # ... bonk! (low: it sits on "at the")
hi_tick(c["bounce1"] + 0.005, -13, 3, -0.4)
hi_tick(c["bounce1"] + 0.02, -14, 4, 0.4)
glug(c["gulp2"] - 0.06, -10, 5)                                                       # "Try it.": he swallows again
air(c["gulp2"] + 0.05, c["gulp2"] + 0.42, -18, 6, lambda u: u ** 1.5)
bk = bonk()
sfx.add(pan_st(fade(bk, 0.001, 0.03), 0.0), c["gulp2"] + 0.42, db(-18))               # BONK, in the gap before "Can't"
sfx.add(pan_st(fade(bloop(240.0, 90.0, 0.3), 0.003, 0.05), 0.0), c["win_open"] + 0.02, db(-17))   # the window opens on his throat
wd = whoosh(0.5, 300.0, 2600.0, 7)
sfx.add(pan_st(fade(filt(wd, "highpass", 4800), 0.01, 0.05), 0.0), SHOT["inside"] - 0.42, db(-15))   # the dive (above the words)

# ================================================================= 2. inside: the queue, the tunnel, the lid
air(c["spit"] - 0.02, c["cut"] + 0.08, -16, 10, lambda u: np.sin(np.pi * u) ** 0.5, pan=0.2)   # the spit zips in ...
low_thud(c["cut"] + 0.06, -14, 160.0, 0.16, 0.05)                                     # ... and lands in the tunnel, ahead
sq = squeak(0.12, 1500, 2400)
sfx.add(pan_st(fade(sq, 0.003, 0.03), -0.2), c["hey"], db(-16))                       # HEY! (after "line.")
for i in range(6):                                                                    # ONE TUNNEL lights up (above the words)
    bed.add(pan_st(glint(5600 + 400 * i, 0.08, 11 + i), -0.3 + 0.12 * i), c["tunnel"] + 0.03 * i, db(-24))
bed.add(pan_st(glint(6100, 0.09, 12), -0.5), c["feel"] - 0.04, db(-22))                 # his window pops in (above the word)
glug(c["jump"] - 0.15, -11, 13)                                                       # he swallows in the window
bed.add(pan_st(glint(6400, 0.1, 14), 0.2), c["voice"] + 0.02, db(-21))                 # the voice box lights
bg = boing(0.28, 230.0, 15)
bed.add(pan_st(fade(filt(bg, "lowpass", 300), 0.002, 0.04), 0.0), c["hopping"] - 0.03, db(-13))   # it hops (low: on "hopping")
hi_tick(c["hopping"] + 0.02, -16, 16)
bed.add(pan_st(glint(6900, 0.1, 17), -0.2), c["lid1"] + 0.02, db(-21))                 # the lid lights
switch_click(c["pause"] + 0.02, -12, 18)                                              # the brain hits PAUSE: a hard click ...
low_thud(c["pause"] + 0.03, -12, 120.0, 0.2, 0.06)
air(c["pause"] + 0.05, c["pause"] + 0.6, -21, 19, lambda u: (1 - u) ** 3)             # ... the air stops dead (a tail of hiss)
bed.add(pan_st(fade(filt(riser(c["slams_end"] - c["lid2"] + 0.1, 20, 60, 240), "lowpass", 280), 0.05, 0.02), 0.0), c["lid2"] - 0.1, db(-21))   # the lid winds up (low)
low_thud(c["slam"], -6, 140.0, 0.36, 0.1, sfx)                                        # SLAM! (in the gap before "SHUT.")
ck = crack(0.16, 22, 0.025, 600)
sfx.add(pan_st(fade(ck, 0.001, 0.05), 0.0), c["slam"], db(-12))
glug(c["slam"] + 0.12, -9, 23)                                                        # the spit slides over the lid (low, under "SHUT.")
air(c["reopen"] + 0.02, END["inside"] + 0.12, -17, 24, lambda u: np.sin(np.pi * u) ** 0.4)   # WHOOSH: the air rushes back in

# ================================================================= 3. the drink, the late lid
glug(c["water"] + 0.4, -11, 30)                                                       # gulp, gulp
glug(c["water"] + 0.85, -11, 31)
cough(c["cough"], -10, 32, 0.1)                                                       # KOFF! (in the pause after "pipe?")
bed.add(pan_st(alarm_ring(0.75, 34, 26.0, 2350.0, True), 0.2), c["late"] - 0.02, db(-19))         # its alarm clock (above "LATE")
cough(c["blast"], -10, 35, -0.1)                                                       # the cough blasts the drop back out

# ================================================================= 4. one whole day: a click per swallow
for i, tk in enumerate(c["ticks"]):
    hi_tick(tk, -19 + (2 if i % 5 == 0 else 0), 40 + i, (-1) ** i * 0.25)
    if i % 4 == 0:
        glug(tk, -18, 100 + i)
crickets(c["breathing2"] + 1.2, c["hundreds_end"] + 0.3, bed, -30, 41)                 # the night (above the words)
whistle(c["thinking1_end"] + 0.04, [79, 76, 81], 0.12, -18, 42)                         # he whistles, not noticing (after "thinking.")

# ================================================================= 5. the button
sfx.add(pan_st(fade(scratch(0.22, 50), 0.003, 0.03), 0.0), c["now"] - 0.24, db(-14))    # record scratch: the whistle stops (before "Now")
switch_click(c["thinking2"] + 0.06, -13, 51)                                           # AUTO -> MANUAL (a click above the word)
gp = gulp(52)
sfx.add(pan_st(fade(gp, 0.003, 0.05), 0.0), c["gulp_b"], db(-12))                       # one big, deliberate GULP (before "Sorry.")
glug(DUR - 0.25, -13, 1)                                                               # the swallow that frame 0 is in the middle of

# ================================================================= score (it drops out for every punchline, and it PAUSES with the brain)
BPM = 112
groove(mus, 0.3, c["right"] - 0.05, BPM, ["C", "F"], gain=-11, seed=10, kick_on=False)                      # the test: light pizzicato
groove(mus, c["spit"] + 0.1, c["line_end"] - 0.04, BPM, ["Am", "E"], gain=-12, seed=11, kick_on=False, padv=False)   # the spit sneaks in
groove(mus, c["one"] + 0.25, c["pause"] - 0.02, BPM, ["Dm", "Gm", "Dm", "A"], gain=-15, seed=12, kick_on=False)    # the mechanism: curious
drone(mus, c["lid2"] - 0.1, c["slam"] - 0.02, [38, 45, 50], cutoff=420, gain=-25, seed=13, swell=0.7)       # dread under "the lid slams"
groove(mus, c["reopen"] + 0.05, END["drink"] - 0.4, BPM, ["C", "G", "Am", "F"], gain=-11, seed=14, kick_on=False)   # the air is back; the summit
drone(mus, SHOT["late"] + 0.1, c["blast"] - 0.02, [40, 47, 52], cutoff=600, gain=-21, seed=15, swell=0.5)   # the late lid: tense
groove(mus, c["stop"] + 0.2, c["thinking1_end"] - 0.04, 124, ["F", "C", "Dm", "Bb"], gain=-11, seed=16, kick_on=True)   # a day in seconds
silence(mus, [(c["right"] - 0.06, c["spit"] + 0.06), (c["line_end"] - 0.03, c["one"] + 0.2), (c["pause"] - 0.02, c["lid2"] - 0.1),
              (c["slam"] - 0.02, c["reopen"] + 0.04), (c["cough"] - 0.03, SHOT["late"] + 0.08), (c["blast"] - 0.03, c["stop"] + 0.18),
              (c["thinking1_end"] - 0.03, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -8.0}, duck={"music": 0.72})
