"""Why Can't You Make a FIST With Your Wrist Bent? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The campsite at night (the fire's low rumble and its crackle above 5 kHz), the wrist bending (a low creak), the feeble fist (a
toy squeak in the pause), MUSCLES: 0 (a low thud and a glint), the strings appearing (glints) and the fingers' little
puppet-show jig (pizzicato, in the pause), the glass, the forearm's bulge, the puppeteer's "hi!" (a tiny gibber), the strings
going slack (a sad slide), the hand-over-hand haul (a ratchet above 5.2 kHz and rope creaks below 250 Hz), his panting, the
strings snapping tight (a low twang), the CLAMP (a thud on the word, the vise's clank after it), his snores (under 120 Hz),
the stick landing (a wooden tok), the grip (a creak and glints), the cut back (a whoosh), the flop (a floppy boing and a
falling whistle in the pause) and the FWOOSH as the marshmallow hits the fire. What sits on a word is kept under 250 Hz or
above 5.2 kHz; what carries a joke gets a pause to itself.
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


def wrist_creak(t, gain, seed=0, dur=0.3):
    """the wrist bending: a small rubbery creak, low (it may sit under a word)"""
    y = creak(dur, seed, 60, 140)
    bed.add(pan_st(fade(filt(y, "lowpass", 250), 0.02, 0.05), 0.25), t, db(gain))


def jig(t, gain, seed=0):
    """the fingers dance on their strings: a quick puppet-show figure, pizzicato (in the pause after "puppets.")"""
    for i, (m, d) in enumerate(((72, 0.07), (76, 0.07), (79, 0.07), (84, 0.12))):
        sfx.add(pan_st(fade(pizz(L.mtof(m), 0.16, seed + i), 0.002, 0.04), 0.25 - 0.1 * i), t + 0.075 * i, db(gain - (1.5 if i == 3 else 0)))


def tiny_voice(t, gain, dur=0.22, seed=0, f0=820.0, rate=24.0, pan=0.0):
    """the puppeteer says something tiny with no words (a pause to itself)"""
    y = gibber(dur, seed, f0, True, 0.0, rate)
    env = np.sin(np.linspace(0, np.pi, len(y))) ** 0.6
    sfx.add(pan_st(fade(y * env, 0.01, 0.04), pan), t, db(gain))


def twang(t, gain, f=98.0, seed=0, bus=None):
    """a string pulled tight: a low pluck, almost all of it under 300 Hz"""
    y = pizz(f, 0.5, seed)
    (bus or bed).add(pan_st(fade(filt(y, "lowpass", 300), 0.002, 0.08), 0.15), t, db(gain))


# ================================================================= ambience: the campfire at night
rumble = norm(filt(brown(N, 1), "lowpass", 200) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * tt)))
crk = norm(crackle(N, 9.0, 2, 5400, 11000))
night = norm(filt(pink(N, 3), "bandpass", [140, 380])) * 0.25
amb.x += pan_st(rumble * 0.9 + night, 0.1) * 0.26
bed.x += pan_st(crk, 0.3) * db(-31)

# ================================================================= 1. the hook: wrist down, the fist that won't close
wrist_creak(0.02, -15, 3, 0.5)                                                       # frame 1: the wrist bending down (low, under "Bend")
wrist_creak(c["down1"] - 0.2, -18, 4, 0.35)                                          # "...all the way down"
bed.add(pan_st(fade(filt(creak(c["fist_end"] - c["squeeze1"], 5, 50, 110), "lowpass", 230), 0.05, 0.06), 0.2), c["squeeze1"], db(-14))   # the strain (low)
sq = squeak(0.13, 1500, 1900)
sfx.add(pan_st(fade(sq, 0.003, 0.04), 0.25), c["fist_end"] + 0.06, db(-19))          # the feeble fist: a toy squeak (in the pause before "Can't?")
low_thud(c["tag0"], -15, 140.0, 0.25, 0.08)                                           # MUSCLES: 0 pops (low, on "muscles")
bed.add(pan_st(glint(7200, 0.1, 10), 0.3), c["tag0"] + 0.02, db(-17))
shimmer(c["strings_in"], -22, 6, 20, 0.25, 0.045)                                     # the strings appear on the fingertips (above 5 kHz)
jig(c["jig"] + 0.03, -16, 30)                                                         # the fingers jig on their strings (after "puppets.")

# ================================================================= 2. the puppeteer
wrist_creak(c["squeeze2"] - 0.05, -17, 40, 0.4)                                      # "Squeeze again": the fingers curl (low)
shimmer(c["glass_in"] + 0.03, -23, 8, 41, 0.1)                                        # the forearm turns to glass
low_thud(c["glass_in"] + 0.08, -18, 110.0, 0.4, 0.15)
bed.add(pan_st(fade(filt(boing(0.3, 70.0, 42), "lowpass", 260), 0.005, 0.06), 0.1), c["bulge"], db(-15))   # the forearm bulges (low, on "move?")
tiny_voice(c["puppeteer_end"] + 0.04, -14, 0.2, 43, 880.0, 26.0, 0.1)               # the puppeteer: "hi!" (after "puppeteer.")
bed.add(pan_st(glint(8000, 0.1, 44), 0.1), c["wake"] + 0.03, db(-18))                 # his eyes pop open (above 5 kHz)

# ================================================================= 3. slack: no pull left
wrist_creak(c["wrist2"] - 0.05, -15, 50, 0.5)                                        # the wrist goes all the way down
sad = slide(392.0, 262.0, 0.26, 0.0, None, 5)
sfx.add(pan_st(fade(sad, 0.01, 0.06), 0.1), c["slack_end"] + 0.02, db(-16))          # a sad slide (in the pause after "slack.")
bed.add(pan_st(ratchet(c["bottom"] - c["reel"], 14.0, 22.0, 51, True), 0.15), c["reel"], db(-17))   # hand over hand (above 5.2 kHz)
bed.add(pan_st(fade(filt(creak(c["bottom"] - c["reel"], 52, 45, 100), "lowpass", 220), 0.03, 0.05), 0.15), c["reel"], db(-15))   # the rope (low)
low_thud(c["bottom"], -14, 120.0, 0.3, 0.09)                                          # the bar hits his belly
for i in range(3):                                                                    # he pants: hah hah hah (in the pause after "left.")
    tiny_voice(c["pant"] + 0.15 * i, -18 - i, 0.1, 55 + i, 620.0, 18.0, 0.1)

# ================================================================= 4. tip it back: CLAMP
wrist_creak(c["tip"], -15, 60, 0.6)                                                   # the wrist tips back (low)
twang(c["yank"], -12, 98.0, 61)                                                       # the strings snap tight (low)
shimmer(c["yank"] + 0.02, -23, 6, 62, 0.15, 0.035)
low_thud(c["snap"], -11, 130.0, 0.3, 0.08)                                            # the fist slams shut (low, on "Clamp!")
cl = lock_snap(63, False)
sfx.add(pan_st(cl, 0.15), c["clamp_end"] + 0.03, db(-14))                             # the vise's clank (after the word)
low_thud(c["clamp_end"] + 0.03, -12, 90.0, 0.4, 0.13, bus=sfx)
shimmer(c["clamp_end"] + 0.12, -21, 6, 64, 0.1, 0.04)

# ================================================================= 5. grab: the sleeping puppeteer, the stick, the grip
t_s = c["sleep"] + 0.1
while t_s < c["unglass"] - 0.6:                                                       # his snores (low: under the words)
    bed.add(pan_st(fade(filt(snore(0.7, int(t_s * 10), 58.0), "lowpass", 240), 0.05, 0.1), 0.1), t_s, db(-15))
    t_s += 1.45
low_thud(c["stick"] + 0.12, -15, 170.0, 0.18, 0.05)                                    # the stick lands in his hand: tok (low + a tick)
hi_tick(c["stick"] + 0.12, -16, 70, 0.2)
wrist_creak(c["grip"], -15, 71, 0.6)                                                  # wrist back
shimmer(c["grip"] + 0.3, -22, 8, 72, 0.15, 0.05)                                      # the strings tighten, the fingers close (above 5 kHz)
low_thud(c["grip"] + 0.65, -16, 150.0, 0.2, 0.06)
bed.add(pan_st(glint(7600, 0.12, 73), 0.0), c["label"] + 0.02, db(-16))              # WRIST BACK = GRIP

# ================================================================= 6. the button: bend it down again, the puppet flops
sfx.add(pan_st(whoosh(0.22, 200, 1700, 80), -0.1), c["unglass"] - 0.22, db(-21))     # the cut back to him (ends before "Now")
wrist_creak(c["bend3"], -15, 81, 0.9)
bf = boing(0.28, 120.0, 82)
bed.add(pan_st(fade(filt(bf, "lowpass", 260), 0.003, 0.06), 0.2), c["slip"], db(-13))   # the fingers flop open (low, on "flop.")
sw = slide_whistle(0.24, 1700, 600)
sfx.add(pan_st(fade(sw, 0.005, 0.04), 0.25), c["flop_end"] + 0.03, db(-19))         # the stick falls (after "flop.")
fw = fire_whoosh(0.75, 83, 1.0)
sfx.add(pan_st(fade(fw, 0.005, 0.25), 0.2), c["fwoosh"], db(-12))                     # FWOOSH: it hits the fire
cb = crackle(int(0.6 * SR), 60.0, 84, 2500, 9000)
sfx.add(pan_st(fade(cb * expdecay(len(cb), 0.2), 0.002, 0.1), 0.25), c["fwoosh"] + 0.04, db(-20))
wrist_creak(c["loop_in"] + 0.05, -18, 85, 0.3)                                       # into the loop: the wrist starts bending again

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.30, c["fist_end"] + 0.05, BPM, ["C", "Am"], gain=-11.5, seed=10, kick_on=False)
groove(mus, c["fingers"] + 0.1, c["muscles_end"] - 0.02, BPM, ["F", "G"], gain=-13, seed=11, kick_on=False, arp=False)
groove(mus, c["squeeze2"] + 0.25, c["puppeteer"] - 0.04, 104, ["Am", "F", "C", "G"], gain=-12, seed=12, kick_on=False)
drone(mus, c["strings1"] + 0.1, c["slack_end"] - 0.02, [45, 52, 57], cutoff=520, gain=-24, seed=13, swell=0.6)
drone(mus, c["nopull"] + 0.05, c["left_end"] + 0.02, [43, 50, 55], cutoff=480, gain=-25, seed=14, swell=0.4)
rs = riser(c["snap"] - c["tip"], 15, 180, 1400)
bed.add(pan_st(fade(filt(rs, "highpass", 5200), 0.05, 0.02), 0.0), c["tip"], db(-20))  # the rise into the CLAMP (air only: it runs under the line)
groove(mus, c["people"] + 0.2, c["them_end"] - 0.02, 96, ["C", "F", "G", "C"], gain=-14, seed=16, kick_on=False, snaps=False)
groove(mus, c["now3"] + 0.15, c["again3_end"] - 0.02, BPM, ["Am", "F"], gain=-13, seed=17, kick_on=False, arp=False)
groove(mus, c["fwoosh"] + 0.15, c["loop_in"] + 0.38, BPM, ["C", "Am"], gain=-13, seed=18, kick_on=False)   # after the punchline
silence(mus, [(c["fist_end"] + 0.04, c["fingers"] + 0.05), (c["muscles_end"] - 0.02, c["squeeze2"] + 0.2), (c["puppeteer"] - 0.03, c["wrist2"] + 0.05),
              (c["slack_end"] - 0.02, c["nopull"]), (c["wrist2"], c["strings1"] + 0.1), (c["left_end"] + 0.02, c["tip"] - 0.02), (c["snap"] - 0.02, c["people"] + 0.15),
              (c["them_end"] - 0.02, c["now3"] + 0.1), (c["again3_end"] - 0.02, c["fwoosh"] + 0.1)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
