"""Can You Make a Tongue CLOVER? ☘️ Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The bathroom in the morning: a soft room tone under 230 Hz and a little air above 6 kHz. The tongue's strain (a low wet
creak under the words), the tip flicking up (a BOING in the long pause after "UP."), the roll squelching back; the taco
toppings sprinkling in (the pause after "Taco?"), the club card flapping in and its membership DING (the pause after
"club."); the spotlight on the one in seven (glints) and the six tacos drooping (a slide whistle down, in the pause after
"can."); the sides flopping (a low BWOMP on "sides", a short sad trombone in the pause after "flop?"); the x-ray (a hum)
and the wiring (a fizz above 5.2 kHz and a low buzz); the gymnastics hall (a drumroll under the run-up, the landing
thud, a crash and the score cards' clicks); the champ's tricks (ticks above 6 kHz, a marimba ta-da for the clover in the
pause after "too."); the rimshot after "SHOW-offs."; the tip flicking first in the button. What sits on a word is kept
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def shimmer(t, gain, n=7, seed=0, pan=0.0, step=0.05):
    """a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(5600 + 360 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def strain(t, dur, gain, seed=0):
    """the tongue straining: a low wet creak (under 240 Hz: it can sit under the words)"""
    y = creak(dur, seed, 45, 110)
    bed.add(pan_st(fade(filt(y, "lowpass", 240), 0.04, 0.05), 0.1), t, db(gain))


def squish(t, gain, dur=0.22, seed=0, pan=0.1, low=False):
    """a wet tongue squelch (in a pause; low=True keeps it under 250 Hz for a word)"""
    y = squelch(dur, seed)
    if low:
        y = filt(y, "lowpass", 250)
    (bed if low else sfx).add(pan_st(fade(y, 0.004, 0.05), pan), t, db(gain))


def whip(t, gain, seed=0, pan=0.0):
    """the whip pan's whoosh, ending at the cut"""
    sfx.add(pan_st(whoosh(0.22, 300, 2400, seed), pan), t - 0.22, db(gain))


# ================================================================= ambience: the bathroom in the morning
room = norm(filt(brown(N, 3), "lowpass", 230) * (0.9 + 0.1 * np.sin(2 * np.pi * 0.13 * tt)))
air = norm(filt(white(N, 5), "highpass", 6200))
amb.x += pan_st(room, 0.0) * 0.3
bed.x += pan_st(air, 0.2) * db(-44)

# ================================================================= 1. the hook: roll it, then flip the tip UP
bed.add(pan_st(fade(filt(whoosh(0.2, 500, 2600, 0, 0.6), "highpass", 5200), 0.004, 0.05), 0.1), 0.0, db(-26))   # frame 1: already trying (a soft fwip, high)
strain(c["roll1"] - 0.05, c["up1_end"] - c["roll1"] + 0.1, -15, 1)                       # the strain (low, under the words)
squish(c["it1_end"] + 0.01, -21, 0.12, 2, low=True)                                       # the roll firms up
bo = boing(0.36, 170.0, 3)
sfx.add(pan_st(fade(bo, 0.003, 0.08), 0.1), c["up1_end"] + 0.03, db(-13))               # BOING: the tip flicks up (in the pause)
squish(c["up1_end"] + 0.45, -16, 0.26, 4)                                                 # ...and the roll squelches back
whip(SHOT["answer"], -21, 5, 0.2)

# ================================================================= 2. the answer: Taco? Join the club.
pops([c["taco_end"] + 0.03 + 0.045 * i for i in range(6)], sfx, db(-21), 6)                   # the toppings sprinkle in (in the pause)
shimmer(c["taco_end"] + 0.05, -24, 5, 7, 0.1, 0.05)
pf = filt(white(int(0.14 * SR), 8), "bandpass", [700, 2600]) * expdecay(int(0.14 * SR), 0.03)
sfx.add(pan_st(fade(pf, 0.004, 0.05), 0.35), c["join"] - 0.16, db(-25))                  # the card flaps in (just before "Join")
for i, m in enumerate((84, 88)):                                                          # DING: membership granted (after "club.")
    sfx.add(pan_st(fade(ding(m, 0.18, 9 + i, 1.3), 0.001, 0.06), 0.3), c["club_end"] + 0.03 + 0.07 * i, db(-15))
low_thud(c["club"] + 0.02, -15, 140.0, 0.22, 0.06)                                        # the card lands (low, on "club")

# ================================================================= 3. the line-up: only one in seven can
sfx.add(pan_st(whoosh(0.18, 400, 2200, 10, 0.6), 0.0), SHOT["crowd"] - 0.1, db(-24))     # the cut to the stage
shimmer(c["one"] - 0.02, -21, 7, 11, 0.15, 0.04)                                          # the spotlight on the one (high)
low_thud(c["seven"] + 0.02, -13, 120.0, 0.3, 0.08)                                        # 1 IN 7 lands (low)
sw = slide_whistle(0.32, 1500, 520)
sfx.add(pan_st(fade(sw, 0.01, 0.06), -0.1), c["can1_end"] + 0.02, db(-21))               # the six tacos droop (in the pause)

# ================================================================= 4. try again: tip up... sides flop?
strain(c["try"], c["up2_end"] - c["try"], -15, 20)                                         # the try (low)
rs = filt(riser(0.7, 21, 90, 220), "lowpass", 240)
bed.add(pan_st(fade(rs, 0.05, 0.08), 0.0), c["tip2"], db(-16))                             # the tip goes up (a low rise under "Tip up")
bwomp(bed, c["sides"] + 0.03, 33, -14)                                                    # the sides flop (low)
sq = filt(squelch(0.3, 22), "lowpass", 250)
bed.add(pan_st(fade(sq, 0.004, 0.05), 0.0), c["sides"] + 0.05, db(-16))
ww = wahwah(23)[: int(0.36 * SR)]
sfx.add(pan_st(fade(ww, 0.005, 0.08), 0.0), c["flop_end"] + 0.02, db(-18))               # wah (a short sad trombone, in the pause)

# ================================================================= 5. the wiring: the same muscles, different wiring
sfx.add(pan_st(whoosh(0.3, 200, 1800, 30, 0.7), 0.0), SHOT["wiring"] - 0.2, db(-24))     # the dive into the board
bz = filt(zap(c["different_end"] - c["wiring"] + 0.1, 31, 96.0), "lowpass", 240)
bed.add(pan_st(fade(bz, 0.05, 0.12), -0.2), c["wiring"] - 0.02, db(-17))                  # the tangle buzzes (low)
bed.add(pan_st(fade(buzz_hi(c["different_end"] - c["wiring"], 37.0, 32, 5600), 0.03, 0.08), -0.25), c["wiring"], db(-24))   # and fizzes (high)
low_thud(c["same"] + 0.02, -15, 150.0, 0.24, 0.06)                                        # SAME MUSCLES lands (low)
shimmer(c["every"] + 0.05, -24, 6, 33, 0.0, 0.05)                                         # the tongues turn to glass (high)
for i in range(3):
    bed.add(pan_st(glint(6400 + 500 * i, 0.08, 34 + i), 0.25), c["different"] + 0.05 + 0.08 * i, db(-20))   # her neat wires light
bed.add(pan_st(glint(7800, 0.1, 38), 0.3), c["different_end"] + 0.05, db(-18))             # the tick

# ================================================================= 6. the gymnast: scientists suspect...
whip(SHOT["gym"], -21, 40, -0.2)
crowd_n = filt(brown(int((END["gym"] - SHOT["gym"]) * SR), 41), "lowpass", 220)
bed.add(pan_st(fade(norm(crowd_n), 0.2, 0.3), 0.0), SHOT["gym"], db(-26))                   # the hall's murmur (low)
dr = filt(drumroll(c["tongue4"] - c["thats"] + 0.1, 42), "lowpass", 240)
bed.add(pan_st(fade(dr, 0.05, 0.02), 0.0), c["thats"] - 0.05, db(-14))                     # the drumroll under the run-up (low)
fl = whoosh(0.4, 600, 3000, 43, 0.7)
bed.add(pan_st(fade(filt(fl, "highpass", 5200), 0.01, 0.06), 0.1), c["tongue4"] + 0.02, db(-18))   # the flip (high)
low_thud(c["gymnast"] + 0.01, -10, 110.0, 0.32, 0.08)                                       # the landing (low, on "gymnast")
crash(mus, c["gymnast_end"] + 0.02, -17, 44)                                                # the crash (after "gymnast.")
for i in range(3):
    bed.add(pan_st(glint(7000 + 400 * i, 0.07, 45 + i), -0.3 + 0.3 * i), c["gymnast"] + 0.2 + 0.12 * i, db(-19))   # 10, 10, 10 (high)
shimmer(c["gymnast_end"] + 0.04, -21, 6, 48, 0.0, 0.04)

# ================================================================= 7. the champ's tricks: roll, fold, twist, twist... clover
whip(SHOT["tricks"], -21, 50, 0.2)
for i, k in enumerate(("people", "most", "tongue5", "tricks")):
    bed.add(pan_st(glint(6600 + 300 * i, 0.08, 51 + i), -0.4 + 0.25 * i), c[k] + 0.06, db(-18))   # each tick (high)
    sq = filt(squelch(0.16, 55 + i), "lowpass", 240)
    bed.add(pan_st(fade(sq, 0.003, 0.04), 0.0), c[k] - 0.03, db(-19))                     # each move (low)
for i, m in enumerate((72, 76, 79, 84)):                                                    # ta-da: the clover (after "too.")
    sfx.add(pan_st(fade(marimba(L.mtof(m), 0.3, 60 + i), 0.001, 0.05), 0.2 - 0.12 * i), c["too_end"] + 0.04 + 0.055 * i, db(-16))
shimmer(c["too_end"] + 0.06, -21, 6, 64, 0.1, 0.035)

# ================================================================= 8. the sting: SHOW-offs. (ba-dum tss)
sfx.add(pan_st(whoosh(0.16, 500, 2400, 70, 0.6), -0.1), SHOT["sting"] - 0.12, db(-25))
sfx.add(rimshot(71), c["show_end"] + 0.02, db(-15))

# ================================================================= 9. the button: now flip the tip FIRST (into frame 1)
strain(c["flip3"], c["first_end"] - c["flip3"], -15, 80)
bed.add(pan_st(fade(filt(boing(0.3, 170.0, 81), "lowpass", 250), 0.003, 0.06), 0.1), c["tip3"] + 0.05, db(-14))   # the tip goes up first (low)
squish(c["first_end"] + 0.04, -18, 0.2, 82)                                                 # the sides try... squelch (after "FIRST.")

# ================================================================= score (a bouncy morning groove; out for every punchline)
BPM = 112
groove(mus, 0.0, c["up1_end"] - 0.02, BPM, ["F", "Dm"], gain=-12.5, seed=10, kick_on=False)
groove(mus, c["taco_end"] + 0.4, c["can1_end"] - 0.02, BPM, ["Bb", "C"], gain=-13.0, seed=11, kick_on=False)
drone(mus, c["try"] - 0.05, c["flop_end"] - 0.02, [41, 48, 53], cutoff=480, gain=-23, seed=12, swell=0.4)
drone(mus, SHOT["wiring"] + 0.05, c["different_end"] - 0.02, [45, 52, 57, 64], cutoff=700, gain=-22, seed=13, swell=0.5)
groove(mus, SHOT["gym"] + 0.05, c["thats"] - 0.05, 120, ["F", "C"], gain=-13.5, seed=14, kick_on=False)
groove(mus, c["gymnast_end"] + 0.3, c["too"] - 0.05, 120, ["Bb", "F", "C", "F"], gain=-13.0, seed=15, kick_on=False)
groove(mus, c["now"] - 0.02, DUR, BPM, ["F", "Dm"], gain=-12.5, seed=16, kick_on=False)
silence(mus, [(c["up1_end"] - 0.02, c["taco_end"] + 0.4), (c["can1_end"] - 0.02, c["try"] - 0.05),
              (c["flop_end"] - 0.02, SHOT["wiring"] + 0.05), (c["different_end"] - 0.02, SHOT["gym"] + 0.05),
              (c["thats"] - 0.05, c["gymnast_end"] + 0.02), (c["too"] - 0.05, c["now"] - 0.02)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
