"""Can You Bend Just the TIP of Your Finger? 👆 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The trail cafe at dusk: a warm room tone under 250 Hz and the wood stove's crackle above 5.4 kHz. The try (a low strain
creak under "Now bend only the TIP"), the middle joint folding along (a rubbery BOING in the pause after "TIP."), the ring
on the joint (a glint), the menu card (a paper flap) and the COMBO ONLY stamp (a low thud), the cash register CHA-CHING in
the pause after "COMBO." (the running gag: it comes back after "the combo's back."), the glass (glints), the string
(a pluck), the puller pulling (a low creak; a twang when it is tight), his other hand taking hold (a soft pat), the tip
bending alone (a small creak) and the ta-da in the pause where the viewer tries it, IT BENDS! (a pop), "Congrats." (a party
popper in the pause after it), the head mirror (a ting), the stamp (a low thud), "Let go" (a fwip). What sits on a word is
kept under 250 Hz or above 5.2 kHz; what carries a joke gets a pause to itself.
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def shimmer(t, gain, n=7, seed=0, pan=0.0, step=0.05):
    """glass: a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(5600 + 360 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def strain(t, dur, gain, seed=0):
    """a finger straining: a low rubbery creak (under 240 Hz: it can sit under the words)"""
    y = creak(dur, seed, 50, 120)
    bed.add(pan_st(fade(filt(y, "lowpass", 240), 0.04, 0.05), 0.15), t, db(gain))


def cha_ching(t, gain, seed=0):
    """the cafe's cash register: the drawer's rattle, then two bright bells (in a pause)"""
    r = ratchet(0.07, 30.0, 44.0, seed, True)
    sfx.add(pan_st(fade(r, 0.003, 0.02), 0.2), t, db(gain - 6))
    sfx.add(pan_st(fade(ding(88, 0.22, seed + 1, 1.3), 0.001, 0.06), 0.15), t + 0.05, db(gain))
    sfx.add(pan_st(fade(ding(93, 0.26, seed + 2, 1.3), 0.001, 0.1), 0.25), t + 0.12, db(gain + 1))   # gone 0.4 s after t:
    low_thud(t + 0.05, gain + 1, 110.0, 0.2, 0.06, bus=sfx)                                          # clear of the next word


# ================================================================= ambience: the cafe at dusk
room = norm(filt(brown(N, 3), "lowpass", 230) * (0.9 + 0.1 * np.sin(2 * np.pi * 0.11 * tt)))
stove = norm(crackle(N, 9.0, 4, 5400, 11000))
amb.x += pan_st(room, 0.0) * 0.32
bed.x += pan_st(stove, -0.3) * db(-35)

# ================================================================= 1. the hook: point, bend only the tip... and the middle joint folds
sfx.add(pan_st(whoosh(0.2, 500, 2600, 0, 0.6), 0.15), 0.0, db(-25))                    # frame 1: the finger already up (a soft fwip)
strain(c["bend1"] - 0.05, c["tip1_end"] - c["bend1"] + 0.05, -14, 1)                    # the try (low, under the words)
bo = boing(0.38, 120.0, 2)
sfx.add(pan_st(fade(bo, 0.003, 0.08), 0.2), c["tip1_end"] + 0.04, db(-13))             # BOING: the middle joint came too (in the pause)
bed.add(pan_st(glint(7200, 0.1, 3), 0.25), c["tip1_end"] + 0.1, db(-21))                # the "?" pops
sfx.add(pan_st(whoosh(0.24, 300, 2200, 4), -0.1), SHOT["answer"] - 0.2, db(-21))       # the whip to the answer

# ================================================================= 2. the answer: middle joint bent too? Sorry. A COMBO.
bed.add(pan_st(glint(6600, 0.1, 10), 0.2), c["middle2"] + 0.02, db(-20))               # the ring on the middle joint
strain(c["comes"] - 0.05, c["combo"] - c["comes"] + 0.15, -16, 11)                      # he tries again (low)
pf = filt(white(int(0.16 * SR), 12), "bandpass", [600, 2400]) * expdecay(int(0.16 * SR), 0.03)
sfx.add(pan_st(fade(pf, 0.004, 0.05), -0.2), c["the2"] - 0.14, db(-26))                # the menu card flaps in (just before "The")
low_thud(c["combo"] + 0.02, -12, 135.0, 0.26, 0.07)                                     # the COMBO ONLY stamp (low, on "COMBO")
cha_ching(c["combo_end"] + 0.02, -14, 13)                                               # CHA-CHING (in the pause after "COMBO.")
sfx.add(pan_st(whoosh(0.24, 260, 2000, 14), 0.1), SHOT["string"] - 0.26, db(-22))      # the whip into the hand (gone by the cut: "See" follows at once)

# ================================================================= 3. the string: one string pulls the tip AND the middle joint
shimmer(c["see"] - 0.06, -23, 7, 20, 0.1)                                               # the hand turns to glass
pk = pizz(196.0, 0.35, 21)
sfx.add(pan_st(fade(pk, 0.002, 0.1), 0.1), c["string3_end"] + 0.03, db(-15))          # the string, plucked (in the pause after "string?")
strain(c["pulls"] - 0.05, c["joint3_end"] - c["pulls"] + 0.05, -13, 22)                 # the puller pulls (low)
low_thud(c["tip3"] + 0.02, -15, 160.0, 0.2, 0.05)                                       # the tip folds (low)
low_thud(c["middle3"] + 0.02, -14, 120.0, 0.24, 0.06)                                   # the middle joint folds (low)
tw = pizz(110.0, 0.4, 23)
sfx.add(pan_st(fade(tw, 0.002, 0.1), 0.1), c["joint3_end"] + 0.03, db(-15))           # TWANG: pulled tight (in the pause)

# ================================================================= 4. the pin: hold the middle joint still, bend the tip
fw = whoosh(0.16, 500, 2400, 30, 0.6)
sfx.add(pan_st(fade(fw, 0.004, 0.04), -0.3), SHOT["pin"] - 0.04, db(-24))             # his other hand comes in
low_thud(c["middle4"] + 0.05, -14, 170.0, 0.18, 0.04)                                   # it takes hold (a soft pat, low)
strain(c["bend4"] - 0.05, c["tip4_end"] - c["bend4"] + 0.15, -14, 31)                   # the puller pulls, only the tip goes (low)
for i, m in enumerate((72, 76, 79, 84)):                                                # ta-da: it bends! (in the pause where they try)
    sfx.add(pan_st(fade(marimba(L.mtof(m), 0.32, 32 + i), 0.001, 0.05), 0.25 - 0.12 * i), c["tip4_end"] + 0.18 + 0.06 * i, db(-16))
shimmer(c["tip4_end"] + 0.2, -22, 6, 40, 0.1, 0.035)
cp = cork_pop(41, 560.0)
bed.add(pan_st(fade(filt(cp, "lowpass", 250), 0.002, 0.05), 0.15), c["goes"] - 0.02, db(-14))   # IT BENDS! pops (low part only, on the word)
sfx.add(pan_st(whoosh(0.24, 260, 2000, 42), 0.0), SHOT["doctors"] - 0.2, db(-22))      # the whip out

# ================================================================= 5. the doctors: Congrats.
bed.add(pan_st(glint(7600, 0.12, 50), -0.1), c["congrats"] + 0.02, db(-19))            # the head mirror: ting (high)
ph = party_horn(0.3, 51, 520.0)
sfx.add(pan_st(fade(ph, 0.004, 0.05), 0.2), c["congrats_end"] + 0.02, db(-18))        # a party horn (in the pause after "Congrats.")
shimmer(c["congrats_end"] + 0.05, -23, 5, 52, 0.2, 0.04)
low_thud(c["hand5"] + 0.02, -12, 140.0, 0.26, 0.07)                                     # the stamp (low, on "hand doctors")
bed.add(pan_st(glint(6900, 0.1, 53), 0.2), c["string5"] + 0.05, db(-21))               # the string glows

# ================================================================= 6. the button: let go, and the combo's back
fw2 = whoosh(0.16, 500, 2400, 60, 0.6)
bed.add(pan_st(fade(filt(fw2, "highpass", 5200), 0.004, 0.04), -0.3), c["letgo"] + 0.05, db(-20))   # the hand lets go (top only)
strain(c["and6"] - 0.02, c["back"] - c["and6"], -15, 61)
cha_ching(c["back_end"] + 0.02, -15, 62)                                                # CHA-CHING again (the callback), into the loop

# ================================================================= score (drops out for every punchline)
BPM = 108
groove(mus, 0.0, c["tip1_end"] - 0.02, BPM, ["F", "Dm"], gain=-12.5, seed=10, kick_on=False)
groove(mus, c["middle2"] + 0.05, c["combo"] - 0.02, BPM, ["Bb", "C"], gain=-13.5, seed=11, kick_on=False, arp=False)
drone(mus, c["see"] - 0.05, c["joint3_end"] - 0.02, [45, 52, 57], cutoff=520, gain=-23, seed=12, swell=0.5)
groove(mus, c["string3_end"] + 0.25, c["joint3_end"] - 0.04, 100, ["Am", "F"], gain=-14.5, seed=13, kick_on=False, snaps=False)
groove(mus, SHOT["pin"] + 0.05, c["tip4_end"] + 0.1, 100, ["Dm", "Bb"], gain=-14.5, seed=14, kick_on=False, snaps=False)
groove(mus, c["goes_end"] + 0.1, c["congrats"] - 0.02, 116, ["F", "C"], gain=-13, seed=15, kick_on=False)
groove(mus, c["thats"] + 0.05, c["string5_end"] - 0.02, 112, ["F", "C", "Dm", "Bb"], gain=-13.5, seed=16, kick_on=False)
groove(mus, c["letgo"] + 0.02, c["back"] - 0.02, BPM, ["F", "Dm"], gain=-13.5, seed=17, kick_on=False)
silence(mus, [(c["tip1_end"] - 0.02, c["middle2"] + 0.05), (c["combo"] - 0.02, c["see"] - 0.05),
              (c["joint3_end"] - 0.04, SHOT["pin"] + 0.05), (c["tip4_end"] + 0.1, c["goes_end"] + 0.1),
              (c["congrats"] - 0.02, c["thats"] + 0.05), (c["string5_end"] - 0.02, c["letgo"] + 0.02),
              (c["back"] - 0.02, c["end"])])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
