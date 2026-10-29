"""Does Your Finger Move When You Bend Your THUMB? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The living room at night (wrist-tendon's room tone and the TV's hiss), the pointer that curls (a soft rubbery creak and a
pluck), a ring that dings, the sidekick's eyes popping open and its bubble, a heart; the glass shimmer, two strings
plucked (an orange note and a cyan note), the strap buckling on (a click and a zip), the thumb's pull (a rope creak), the
pointer's BOING and its tiny "whee", the strap gone (a poof), a spotlight's clunk and a little rock riff for the SOLO,
the gorilla (a low grunt, a hoo-hoo, its chest drum), the other hand's ding and a sparkle. What sits on a word is kept
under 250 Hz or above 5.2 kHz; what carries a joke gets a pause to itself.
"""
import json
import os
import sys

import numpy as np  # noqa: F401

import sfxlib as L
from sfxkit import *  # noqa: F401,F403
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


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def shimmer(t, gain, n=7, seed=0, pan=0.0, step=0.05):
    """glass: a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(5600 + 360 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def curl_creak(t, gain, seed=0, dur=0.22):
    """a finger bending: a small rubbery creak, low (it may sit under a word)"""
    y = creak(dur, seed, 70, 150)
    bed.add(pan_st(fade(filt(y, "lowpass", 260), 0.02, 0.04), 0.2), t, db(gain))


def riff(t, gain, seed=0):
    """the thumb's SOLO: three quick notes of a fuzzy little rock guitar with a bend on the last (in a pause)"""
    notes = [(76, 0.07), (79, 0.07), (83, 0.18)]
    pos = 0.0
    for i, (m, d) in enumerate(notes):
        n = int(d * SR)
        f = L.mtof(m)
        ph = np.cumsum(np.full(n, f) * (1 + (0.03 * np.linspace(0, 1, n) if i == 2 else 0)) / SR)
        y = 2 * (ph % 1) - 1
        y = np.tanh(3.0 * y) * expdecay(n, d * 0.9)
        y = filt(y, "lowpass", 3800)
        sfx.add(pan_st(fade(y, 0.002, 0.02), 0.2), t + pos, db(gain))
        pos += d * 0.92


def chest_drum(t0, gain, hits=4, seed=0):
    """the gorilla drums its chest: hollow low thumps, alternating hands (almost all under 250 Hz)"""
    for i in range(hits):
        y = thump(0.16, 128 - 6 * (i % 2), 46, 0.05, seed + i)
        sfx.add(pan_st(y, -0.35 + 0.1 * (i % 2)), t0 + 0.085 * i, db(gain - 1.5 * (i % 2)))


# ================================================================= ambience
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
tvhiss = norm(filt(white(N, 2), "highpass", 6000)) * 0.18
amb.x += pan_st(room + tvhiss, 0) * 0.24

# ================================================================= 1. the hook: the thumb bends, the pointer curls, a ring
curl_creak(0.02, -15, 3, 0.26)                                                       # frame 1: the thumb folding in (low, under "Bend")
hi_tick(c["curl0"], -15, 4, 0.2)                                                     # ...and the pointer's tip goes with it (above the word)
curl_creak(c["across"] - 0.05, -17, 5, 0.3)                                          # "...across your palm": again
bed.add(pan_st(glint(6800, 0.1, 6), -0.1), c["ring"] + 0.02, db(-17))               # the ring pops round the pointer (on "move?": above 5 kHz)

# ================================================================= 2. the answer: the sidekick opens its eyes
sfx.add(pan_st(fade(bloop(520, 760, 0.1), 0.002, 0.03), -0.1), c["eyes"], db(-17))  # its eyes pop open (after "Moved?")
sfx.add(pan_st(fade(bloop(600, 880, 0.08), 0.002, 0.03), -0.1), c["eyes"] + 0.1, db(-19))
curl_creak(c["clingy"] - 0.15, -18, 7, 0.3)                                          # it bends along (low, under "clingy")
pp = cork_pop(8, 980.0)
bed.add(pan_st(fade(filt(pp, "highpass", 4500), 0.001, 0.03), 0.3), c["clingy"] + 0.15, db(-18))   # ME TOO! pops up (high, on the word)
for i, f in enumerate((1568.0, 2093.0, 2637.0)):                                     # the heart (after "SIDEKICK.")
    sfx.add(pan_st(fade(tone(f, 0.12), 0.003, 0.07) * 0.5, -0.2), c["heart"] + 0.05 * i, db(-21))

# ================================================================= 3. the glass, the strings, the strap
shimmer(c["glass_in"] + 0.05, -23, 8, 20, 0.2)                                       # the hand turns to glass (above the words)
low_thud(c["glass_in"] + 0.1, -18, 110.0, 0.4, 0.15)
for i, (m, pn) in enumerate(((64, -0.3), (71, 0.3))):                                 # the two strings, plucked (after "strings?", done before "A")
    sfx.add(pan_st(fade(pizz(L.mtof(m), 0.15, 30 + i), 0.002, 0.05), pn), c["strings_end"] + 0.02 + 0.07 * i, db(-17))
cl = lock_snap(32, True)
bed.add(pan_st(cl, 0.2), c["strap_pop"], db(-15))                                    # the strap buckles on (edges only: on "strap")
low_thud(c["strap_pop"] + 0.02, -15, 160.0, 0.14, 0.05)
bed.add(pan_st(ratchet(0.18, 30.0, 60.0, 33, True), 0.2), c["strap_pop"] + 0.06, db(-22))   # a quick zip (above 5.2 kHz)
shimmer(c["together"] + 0.05, -25, 5, 34, 0.1, 0.04)                                 # it glows on "together"

# ================================================================= 4. thumb pulls... pointer follows
bed.add(pan_st(fade(filt(creak(c["drag"] - c["tug"], 40, 50, 120), "lowpass", 230), 0.04, 0.06), 0.2), c["tug"], db(-14))   # the rope pulls (low)
bg = boing(0.24, 210.0, 41)
sfx.add(pan_st(fade(bg, 0.002, 0.05), -0.2), c["pulls_end"] + 0.03, db(-17))        # the strap tugs the pointer: boing (in the pause after "pulls...")
whee = gibber(0.28, 42, 760.0, True, 0.0, 22.0)
wenv = np.linspace(0.6, 1.0, len(whee)) * np.sin(np.linspace(0, np.pi, len(whee))) ** 0.5
sfx.add(pan_st(fade(whee * wenv, 0.01, 0.05), -0.2), c["whee"], db(-19))            # the sidekick's tiny whee (after "follows.")

# ================================================================= 5. no strap: the thumb goes solo
pf = norm(filt(white(int(0.25 * SR), 50), "bandpass", [5400, 9000]) * expdecay(int(0.25 * SR), 0.06))
bed.add(pan_st(pf, 0.1), c["ghost"] + 0.04, db(-19))                                 # the strap vanishes: a poof (above 5 kHz, on the word)
low_thud(c["spot"], -13, 95.0, 0.3, 0.1)                                              # the spotlight clunks on (low, under "solo")
riff(c["riff"], -17, 51)                                                              # the little rock riff (after "solo.")

# ================================================================= 6. the gorilla: one string that forks
sfx.add(pan_st(whoosh(0.24, 220, 1800, 60), -0.3), SHOT["gorilla"] - 0.26, db(-19))  # the cut to the gorilla (ends before "Gorillas?")
gr = growl(0.5, 61, 70.0)
bed.add(pan_st(fade(gr, 0.03, 0.12), -0.3), SHOT["gorilla"] + 0.02, db(-11))        # its low grunt (under 300 Hz: under the word)
shimmer(c["fork"] + 0.02, -24, 6, 62, -0.3)                                          # the thumb's branch grows out of the pointer's string
for i in range(2):                                                                   # it bends: both fold at once, boop-boop (after "pointer's.")
    sfx.add(pan_st(fade(bloop(300 - 40 * i, 150, 0.12), 0.002, 0.03), -0.3), c["fold"] + 0.03 + 0.12 * i, db(-17))
hoo = gibber(0.34, 63, 300.0, False, 0.0, 7.0)
sfx.add(pan_st(fade(hoo, 0.02, 0.08), -0.3), c["fold"] + 0.3, db(-22))               # hoo-hoo

# ================================================================= 7. leftover ape: the chest drum
shimmer(c["glow3"] + 0.02, -24, 5, 70, 0.2, 0.04)                                    # his strap glows again
sfx.add(pan_st(whoosh(0.3, 180, 1400, 71), 0.0), c["maybe"] - 0.1, db(-24))          # the pull back to the two of them (quiet)
chest_drum(c["drum"], -13.5, 4, 72)                                                     # the chest drum (after "ape.")

# ================================================================= 8. the button: the other hand, less ape
bed.add(pan_st(glint(7000, 0.12, 81), -0.3), c["solo2"] + 0.02, db(-15))              # its thumb bends alone: a bright glint (above 5 kHz)
bed.add(pan_st(glint(7800, 0.1, 85), -0.3), c["solo2"] + 0.08, db(-17))
gh = growl(0.3, 82, 64.0)
bed.add(pan_st(fade(gh, 0.02, 0.08), -0.35), c["less"] + 0.05, db(-14))             # the gorilla's huff (low, under "less")
shimmer(c["grin"] + 0.02, -22, 5, 83, 0.1, 0.035)                                     # his grin sparkles
curl_creak(c["loop_in"] - 0.05, -17, 84, 0.3)                                        # into the loop: the thumb starts folding again

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.30, c["palm_end"] + 0.06, BPM, ["C", "Am"], gain=-11.5, seed=10, kick_on=False)
groove(mus, c["did"] + 0.2, c["move_end"] - 0.02, BPM, ["F", "G"], gain=-13, seed=11, kick_on=False, arp=False)
groove(mus, c["thumbs"] + 0.08, c["sidekick"] - 0.06, BPM, ["F", "C"], gain=-14, seed=19, kick_on=False, arp=False)
groove(mus, c["glass_in"] + 0.25, c["together_end"] - 0.03, 104, ["Am", "F", "C", "G"], gain=-12, seed=12, kick_on=False)
drone(mus, c["tug"] - 0.02, c["follows"] - 0.05, [45, 52, 57], cutoff=520, gain=-24, seed=13, swell=0.6)
groove(mus, c["nostrap"] + 0.2, c["solo"] - 0.04, 100, ["Dm", "Am"], gain=-13, seed=14, kick_on=False, arp=False, snaps=False)
groove(mus, SHOT["gorilla"] + 0.2, c["ptrs_end"] - 0.04, 92, ["Em", "C"], gain=-11, seed=15, kick_on=True, snaps=False)
groove(mus, c["so"] + 0.15, c["leftover_end"] - 0.04, 96, ["Am", "Dm"], gain=-13, seed=16, kick_on=False)
groove(mus, c["other"] + 0.05, c["hand_end"] - 0.02, BPM, ["C", "Am"], gain=-12, seed=17, kick_on=False)
groove(mus, c["ape2_end"] + 0.05, c["loop_in"] + 0.38, BPM, ["C", "Am"], gain=-12, seed=18, kick_on=False)   # after the punchline
silence(mus, [(c["palm_end"] + 0.05, c["did"] + 0.15), (c["move_end"] - 0.02, c["thumbs"] + 0.05), (c["sidekick"] - 0.05, c["glass_in"] + 0.2), (c["together_end"] - 0.02, c["tug"]),
              (c["follows"] - 0.04, c["nostrap"] + 0.15), (c["solo"] - 0.03, SHOT["gorilla"] + 0.15), (c["ptrs_end"] - 0.03, c["so"] + 0.1),
              (c["leftover_end"] - 0.03, c["other"] + 0.02), (c["hand_end"] - 0.02, c["ape2_end"] + 0.04)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
