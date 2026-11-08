"""Make a Duck Hand. Can You SPREAD Your Fingers? 🦆 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

His tent at night in the rain (a soft patter under 400 Hz, drops above 5.4 kHz). The duck QUACKS in three pauses (after
"hand.", after "duck mode,", after "again."): the running gag. The knuckles bending (a low creak), the strain of the spread
that will not go (a low creak under the words, a rubbery squeak in the pause), "Stuck?" (a deflating wah in the pause), the
seatbelt sliding across the knuckles (webbing above 5.2 kHz under "buckled them in") and its CLICK in the pause after the
line, the glass (glints), the straps appearing (glints), the dive into the close-up (a low whoosh), the BUMP (a low bonk),
the finger bending (a low creak) and the strap pulled tight (a TWANG in the pause), the hand unfolding (a fwip), the slack
straps (a floppy boing), "spread!" (a fan whoosh and a marimba ta-da in the pause), the cast going on (a low fwump and
glints) and popping off (a pok and a puff), "Buckled." (the CLICK again, then the belt zipping back into the loop). What sits
on a word is kept under 250 Hz or above 5.2 kHz; what carries a joke gets a pause to itself.
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


def shimmer(t, gain, n=7, seed=0, pan=0.0, step=0.05):
    """glass: a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(5600 + 360 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def knuckle_creak(t, gain, seed=0, dur=0.3):
    """knuckles bending: a small rubbery creak, low (it may sit under a word)"""
    y = creak(dur, seed, 55, 130)
    bed.add(pan_st(fade(filt(y, "lowpass", 240), 0.02, 0.05), 0.2), t, db(gain))


def quack(t, gain, seed=0, f0=520.0, f1=430.0, dur=0.13, pan=0.2):
    """the duck: a short nasal quack (a goose honk pitched up and cut short); speech band, so only in a pause"""
    y = honk(dur, f0, f1, seed)
    sfx.add(pan_st(fade(y, 0.004, 0.03), pan), t, db(gain))


def click(t, gain, seed=0):
    """the seatbelt's buckle snapping shut: the click, a smaller one, a low clunk (in a pause)"""
    sfx.add(pan_st(lock_snap(seed, False), 0.15), t, db(gain))
    low_thud(t + 0.005, gain + 2, 120.0, 0.22, 0.06, bus=sfx)


# ================================================================= ambience: rain on the tent at night
patter = norm(filt(pink(N, 1), "lowpass", 380) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.17 * tt)))
drops = norm(crackle(N, 14.0, 2, 5400, 11000))
amb.x += pan_st(patter, 0.0) * 0.3
bed.x += pan_st(drops, -0.2) * db(-33)

# ================================================================= 1. the hook: the duck, the spread that will not go
sfx.add(pan_st(whoosh(0.22, 500, 2600, 0, 0.6), 0.15), 0.0, db(-24))                    # frame 1: the hand already moving (a soft fwip)
knuckle_creak(0.0, -18, 0, 0.3)
quack(c["hand1_end"] - 0.01, -13, 1, 540.0, 450.0, 0.10)                                                  # the duck says hello (after "hand.")
knuckle_creak(c["bent"] - 0.04, -15, 2, 0.45)                                         # "Knuckles bent" (low)
r1 = ratchet(c["straight_end"] - c["straight"] + 0.05, 30.0, 34.0, 3, True)
bed.add(pan_st(fade(r1, 0.01, 0.03), 0.2), c["straight"] - 0.02, db(-24))             # the ruler along the fingers (above 5.2 kHz)
bed.add(pan_st(fade(filt(creak(c["them1_end"] - c["spread1"] + 0.05, 4, 45, 105), "lowpass", 230), 0.05, 0.05), 0.2), c["spread1"], db(-14))   # the strain (low)
sq = squeak(0.12, 1500, 1750)
sfx.add(pan_st(fade(sq, 0.003, 0.03), 0.25), c["them1_end"] + 0.03, db(-20))         # the rubbery squeak of fingers that won't go (in the pause)
sfx.add(pan_st(whoosh(0.24, 300, 2200, 5), 0.0), SHOT["answer"] - 0.2, db(-20))       # the whip to the back of his hand (ends at the cut)

# ================================================================= 2. the answer: "Stuck?", buckled in
wah = slide(330.0, 220.0, 0.24, 0.0, None, 5)
sfx.add(pan_st(fade(wah, 0.01, 0.05), 0.1), c["stuck_end"] + 0.02, db(-19))          # a deflating wah (in the pause after "Stuck?")
web = ratchet(c["in_end"] - c["buckled"] + 0.05, 26.0, 40.0, 10, True)
bed.add(pan_st(fade(web, 0.03, 0.02), 0.25), c["buckled"] - 0.08, db(-21))            # the webbing sliding across (above 5.2 kHz)
click(c["in_end"] + 0.02, -12, 11)                                                    # CLICK (in the pause after "them in.")
shimmer(c["in_end"] + 0.08, -24, 4, 12, 0.2, 0.04)

# ================================================================= 3. the straps: glass, the close-up, the bump, TIGHT
shimmer(c["each"] - 0.05, -23, 8, 20, 0.1)                                            # the hand turns to glass
for i in range(4):                                                                    # the straps pop on, knuckle by knuckle
    bed.add(pan_st(glint(6800 + 300 * i, 0.07, 21 + i), 0.3 - 0.15 * i), c["two"] + 0.08 * i, db(-19))
lw = filt(whoosh(0.55, 120, 380, 22), "lowpass", 380)
bed.add(pan_st(fade(lw, 0.05, 0.08), 0.0), c["bend"] - 0.12, db(-11))                 # the dive into the close-up (low)
low_thud(c["bump"] + 0.02, -12, 130.0, 0.26, 0.07)                                    # the BUMP (low, on "bump")
bed.add(pan_st(glint(7400, 0.1, 23), 0.0), c["bump"] + 0.04, db(-19))
knuckle_creak(c["pulls"] - 0.1, -14, 24, c["tight_end"] - c["pulls"] + 0.05)          # the finger bends round the bump (low)
tw = pizz(110.0, 0.45, 25)
sfx.add(pan_st(fade(tw, 0.002, 0.12), 0.1), c["tight_end"] + 0.02, db(-13))          # TWANG: the strap pulled tight (in the pause)
low_thud(c["tight_end"] + 0.02, -15, 98.0, 0.3, 0.1, bus=sfx)
sfx.add(pan_st(whoosh(0.24, 260, 2000, 26), 0.0), SHOT["flat"] - 0.2, db(-21))        # the whip out to the wide

# ================================================================= 4. flatten: slack, and they spread
knuckle_creak(c["flatten_w"], -16, 30, 0.5)                                           # the knuckles unbend (low)
fw = whoosh(0.18, 600, 3000, 31, 0.6)
sfx.add(pan_st(fade(fw, 0.005, 0.05), 0.2), c["hand3_end"] + 0.03, db(-21))          # the hand unfolds (fwip, in the pause)
bo = boing(0.22, 95.0, 32)
sfx.add(pan_st(fade(bo, 0.003, 0.06), 0.1), c["straps2_end"] + 0.01, db(-15))        # the slack straps: a floppy boing (in the pause)
rs = riser(c["spread2"] - c["and3"], 33, 300, 1800)
bed.add(pan_st(fade(filt(rs, "highpass", 5200), 0.05, 0.02), 0.0), c["and3"], db(-21))   # air rising into "spread!"
fan = whoosh(0.2, 900, 4200, 34, 0.7)
bed.add(pan_st(fade(filt(fan, "highpass", 5200), 0.005, 0.05), 0.2), c["spread2"] - 0.02, db(-19))   # the fingers fan out (top only, on the word)
for i, m in enumerate((72, 76, 79, 84)):                                              # ta-da (in the pause after "spread!")
    sfx.add(pan_st(fade(marimba(L.mtof(m), 0.3, 35 + i), 0.001, 0.05), 0.25 - 0.12 * i), c["spread2_end"] + 0.02 + 0.055 * i, db(-17 - (0 if i < 3 else -1)))
shimmer(c["spread2_end"] + 0.05, -22, 6, 40, 0.1, 0.035)
sfx.add(pan_st(whoosh(0.22, 260, 2000, 41), 0.0), SHOT["splint"] - 0.2, db(-23))      # the whip to the splint

# ================================================================= 5. duck mode: the cast
low_thud(c["splint"] + 0.03, -12, 140.0, 0.3, 0.09)                                   # the cast goes on: fwump (low, on "splint")
shimmer(c["splint"] + 0.06, -23, 5, 50, 0.2, 0.04)
quack(c["mode_end"] + 0.02, -13, 51, 540.0, 450.0, 0.13, 0.25)                        # "...in duck mode," quack (in the pause)
bed.add(pan_st(glint(7800, 0.09, 52), 0.25), c["so"] + 0.05, db(-20))                 # STAYS LONG pops
pk = cork_pop(53, 520.0)
sfx.add(pan_st(fade(pk, 0.002, 0.04), 0.2), c["shrink_end"] + 0.2, db(-15))          # the cast pops off (in the pause after "shrink.")
pf = filt(white(int(0.25 * SR), 54), "bandpass", [700, 3000]) * expdecay(int(0.25 * SR), 0.06)
sfx.add(pan_st(fade(pf, 0.005, 0.08), 0.2), c["shrink_end"] + 0.22, db(-24))         # its puff

# ================================================================= 6. the button: duck again, Buckled.
knuckle_creak(c["now4"] + 0.05, -17, 60, 0.35)
quack(c["again_end"] + 0.02, -12, 61, 500.0, 410.0, 0.14, 0.2)                       # quack (in the pause after "again.")
web2 = ratchet(c["buckled2_end"] - c["buckled2"] + 0.1, 30.0, 44.0, 62, True)
bed.add(pan_st(fade(web2, 0.02, 0.02), 0.25), c["buckled2"] - 0.1, db(-22))           # the belt again (above 5.2 kHz)
click(c["buckled2_end"] + 0.02, -12, 63)                                              # CLICK (after "Buckled.")
zp = hair_zip(0.22, False, 64, 14)
sfx.add(pan_st(fade(zp, 0.005, 0.04), 0.3), c["end"] - 0.42, db(-21))               # it zips back into the loop

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, c["hand1_end"] + 0.14, c["them1_end"] - 0.03, BPM, ["F", "Dm"], gain=-11.5, seed=10, kick_on=False)   # after the first quack
groove(mus, c["your2"] + 0.15, c["in_end"] - 0.02, BPM, ["Bb", "C"], gain=-13, seed=11, kick_on=False, arp=False)
drone(mus, c["each"] + 0.05, c["tight_end"] - 0.02, [45, 52, 57], cutoff=520, gain=-23, seed=12, swell=0.5)
groove(mus, c["two"] + 0.2, c["tight_end"] - 0.04, 104, ["Am", "F"], gain=-14, seed=13, kick_on=False, snaps=False)
groove(mus, c["hand3_end"] + 0.1, c["spread2_end"] - 0.02, 116, ["F", "C", "Dm", "Bb"], gain=-12, seed=14, kick_on=False)
groove(mus, c["splint"] + 0.15, c["mode_end"] - 0.02, 100, ["F", "Am"], gain=-14, seed=15, kick_on=False, snaps=False)
groove(mus, c["so"] + 0.15, c["shrink_end"] - 0.02, 100, ["Bb", "C"], gain=-14, seed=16, kick_on=False, snaps=False)
groove(mus, c["now4"] + 0.12, c["again_end"] - 0.02, BPM, ["F", "Dm"], gain=-13, seed=17, kick_on=False)
silence(mus, [(c["them1_end"] - 0.03, c["your2"] + 0.12), (c["in_end"] - 0.02, c["each"] + 0.04), (c["tight_end"] - 0.04, c["hand3_end"] + 0.08),
              (c["spread2_end"] - 0.02, c["splint"] + 0.12), (c["mode_end"] - 0.02, c["so"] + 0.12), (c["shrink_end"] - 0.02, c["now4"] + 0.1),
              (c["again_end"] - 0.02, c["end"])])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
