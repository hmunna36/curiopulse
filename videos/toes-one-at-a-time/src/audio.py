"""Why Won't Your TOES Move One at a Time? 🦶 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The lake at sunset (water lapping at the dock, crickets), the big toe lifting (a small rubbery creak), a smug ding, the
strain, the four small toes springing up together (a low thunk under the word, then the BOING in the pause), their eyes
popping open, the puppet string dropping from the sky and yanked, its twang; the glass shimmer, the muscles' plucks (an
orange note, a cyan note), the four lifted as one (a thunk and a boing); the curl (a squelchy creak); the brain's room
hum, the key slapped, the scan card, the smudge, the brain's shrug (two low notes); the brush strokes; the four keys
lighting (glints) and a little fanfare; his scrunch and tremble; the big toe up and a sparkle into the loop. What sits on
a word is kept under 250 Hz or above 5.2 kHz; what carries a joke gets a pause to itself.
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None, seed=0):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau, seed), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def shimmer(t, gain, n=7, seed=0, pan=0.0, step=0.05):
    """glass: a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(5600 + 360 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def toe_creak(t, gain, seed=0, dur=0.22):
    """a toe bending: a small rubbery creak, low (it may sit under a word)"""
    y = creak(dur, seed, 70, 150)
    bed.add(pan_st(fade(filt(y, "lowpass", 260), 0.02, 0.04), 0.15), t, db(gain))


def brush(t, gain, seed=0, dur=0.35):
    """a brush stroke on canvas: a soft high swish (above 5 kHz)"""
    n = int(dur * SR)
    y = filt(white(n, 300 + seed), "bandpass", [5400, 9500]) * np.sin(np.linspace(0, np.pi, n)) ** 1.5
    bed.add(pan_st(norm(y), -0.3), t, db(gain))


# ================================================================= ambience (one bed per place, gated to its shots)
lake_on = gate(N, [(0, SHOT["brain"]), (SHOT["button"], DUR)])
lap = filt(brown(N, 1), "lowpass", 380) * (0.65 + 0.35 * np.sin(2 * np.pi * 0.31 * tt) * np.sin(2 * np.pi * 0.07 * tt + 1.0))
amb.x += pan_st(norm(lap), 0) * 0.26 * lake_on
crickets(0.4, SHOT["brain"] - 0.2, amb, -31, 2, 4700, 0.8)
crickets(SHOT["button"] + 0.2, DUR, amb, -31, 3, 4700, 0.8)
brain_on = gate(N, [(SHOT["brain"], SHOT["paint"]), (SHOT["every"], SHOT["button"])])
hum = filt(white(N, 4), "lowpass", 300) * 0.5 + np.sin(2 * np.pi * 110 * tt) * 0.25 + np.sin(2 * np.pi * 165 * tt) * 0.1
amb.x += pan_st(norm(hum), 0) * 0.12 * brain_on
studio_on = gate(N, [(SHOT["paint"], SHOT["every"])])
amb.x += pan_st(norm(filt(brown(N, 5), "lowpass", 240)), 0) * 0.2 * studio_on

# ================================================================= 1. the hook: the big toe, "Easy.", the four together
toe_creak(0.0, -16, 3, 0.26)                                                          # frame 1: the big toe already lifting (low)
hi_tick(0.12, -19, 4, 0.2)
for i, m in enumerate((88, 95)):                                                      # "Easy.": a smug little ding (in the gap after it)
    sfx.add(pan_st(fade(ding(m, 0.16, 10 + i), 0.002, 0.06), 0.3), c["ding"] + 0.06 * i, db(-18))
shimmer(c["ding"] + 0.02, -24, 4, 12, 0.3, 0.035)
low_thud(c["bigdown"] + 0.12, -19, 120.0, 0.2, 0.06)                                  # the big toe back down (low, under "Now")
bed.add(pan_st(fade(filt(creak(0.7, 14, 60, 120), "lowpass", 240), 0.05, 0.1), 0.0), c["strain"], db(-16))   # the strain (low)
bed.add(pan_st(fade(filt(drip(15, 1500), "highpass", 5200), 0.001, 0.02), 0.35), c["strain"] + 0.35, db(-18))  # a sweat drop (high)
low_thud(c["gangup"], -12, 140.0, 0.22, 0.07)                                         # THE STRANGE THING: the four spring up together (low, on "next")
hi_tick(c["gangup"] + 0.01, -15, 16, -0.2)
sfx.add(pan_st(fade(boing(0.36, 170.0, 17), 0.002, 0.06), -0.15), c["one_end"] + 0.03, db(-15))   # ...and the BOING in the pause after "one."
for i in range(4):                                                                     # their eyes pop open (high ticks on "The whole")
    bed.add(pan_st(glint(6400 + 500 * i, 0.06, 20 + i), -0.3 + 0.12 * i), c["eyes"] + 0.05 * i, db(-19))
bed.add(pan_st(whoosh(0.4, 4200, 9000, 22, 0.8), 0.3), c["drop"], db(-22))             # the string drops from the sky (high, on "They")
low_thud(c["drop"] + 0.4, -18, 180.0, 0.16, 0.05)                                     # the handle swings in (low)
bed.add(pan_st(fade(filt(creak(0.35, 24, 50, 110), "lowpass", 230), 0.02, 0.06), 0.2), c["yank"], db(-13))    # the yank (low, on "ONE")
low_thud(c["yank"] + 0.04, -14, 120.0, 0.18, 0.06)
for i, f in enumerate((196.0, 247.0)):                                                 # the string twangs in the gap after "string."
    sfx.add(pan_st(fade(pizz(f, 0.32, 26 + i), 0.002, 0.08), 0.2), c["twang"] + 0.02 * i, db(-14))

# ================================================================= 2. the glass: the big toe's own muscle, the four's ONE
shimmer(c["glass_in"] + 0.04, -22, 8, 30, 0.1)                                        # the leg turns to glass (high)
low_thud(c["glass_in"] + 0.08, -18, 100.0, 0.4, 0.15)
bed.add(pan_st(fade(filt(creak(0.4, 32, 50, 120), "lowpass", 230), 0.02, 0.06), 0.25), c["bigpull"], db(-15))  # the orange muscle squeezes (low)
sfx.add(pan_st(fade(pizz(L.mtof(67), 0.2, 33), 0.002, 0.06), 0.3), c["muscle1_end"] + 0.03, db(-16))           # its pluck (after "muscle.")
for i in range(4):                                                                     # the four look up (high)
    hi_tick(c["jiggle"] + 0.05 * i, -19, 34 + i, -0.3 + 0.15 * i)
bed.add(pan_st(glint(7200, 0.1, 38), -0.2), c["cyan_on"] + 0.04, db(-17))             # the cyan muscle lights (high)
for i in range(4):                                                                     # its string splits into four (high, on "four strings")
    bed.add(pan_st(glint(5800 + 420 * i, 0.07, 40 + i), -0.35 + 0.18 * i), c["split"] + 0.06 * i, db(-19))
low_thud(c["fourpull"], -13, 130.0, 0.2, 0.06)                                        # ONE squeeze: all four rise (after "strings.")
for i, m in enumerate((60, 64, 67, 72)):                                               # the four strings plucked as one chord
    sfx.add(pan_st(fade(pizz(L.mtof(m), 0.22, 44 + i), 0.002, 0.06), -0.3 + 0.2 * i), c["fourpull"] + 0.02 + 0.012 * i, db(-18))

# ================================================================= 3. curl: the same underneath
sfx.add(pan_st(whoosh(0.22, 300, 2200, 50), 0.2), SHOT["curl"] - 0.22, db(-20))       # the swing round to the side (ends before "Now")
bed.add(pan_st(fade(filt(squelch(0.4, 51), "lowpass", 250), 0.02, 0.08), 0.0), c["curl_go"], db(-14))        # the toes scrunch (low)
bed.add(pan_st(glint(6900, 0.1, 52), 0.25), c["violet_on"] + 0.04, db(-17))           # the violet muscle and strings light (high)
sfx.add(pan_st(fade(squeak(0.12, 1500, 900), 0.002, 0.03), 0.0), c["curl2"] + 0.02, db(-21))                  # it squeezes: the four curl again (after "underneath.")
low_thud(c["curl2"] + 0.03, -15, 120.0, 0.2, 0.06)

# ================================================================= 4. the brain's desk: no neat spot for each toe
sfx.add(pan_st(whoosh(0.2, 500, 2600, 60), 0.0), SHOT["brain"] - 0.2, db(-20))        # the cut to the brain (ends before "Your")
hi_tick(c["slap"], -14, 61, 0.2)                                                      # it slaps the ONE wide key (high click, on "help")
low_thud(c["slap"] + 0.01, -12, 150.0, 0.18, 0.05)
low_thud(c["slap"] + 0.16, -17, 110.0, 0.2, 0.06)                                     # the four jump on the wall screen (low)
bed.add(pan_st(whoosh(0.25, 5200, 9000, 63, 0.8), 0.0), c["card"], db(-21))            # the scan card pops in (high)
bed.add(pan_st(fade(filt(squelch(0.45, 64), "lowpass", 240), 0.03, 0.1), 0.2), c["smudge"], db(-16))           # the toes' patches melt into one (low)
for i, f in enumerate((233.0, 196.0)):                                                 # the brain's shrug: two low notes (after "toe.")
    sfx.add(pan_st(fade(bloop(f, f * 0.92, 0.16), 0.004, 0.05), 0.0), c["shrug"] + 0.15 * i, db(-15))

# ================================================================= 5. the foot artists: the brush
sfx.add(pan_st(whoosh(0.2, 400, 2400, 70), 0.0), SHOT["paint"] - 0.2, db(-20))
brush(c["stroke1"], -18, 71, 0.6)
brush(c["stroke2"], -19, 72, 0.5)
brush(c["stroke3"], -19, 73, 0.4)

# ================================================================= 6. a spot for EVERY toe
sfx.add(pan_st(whoosh(0.2, 500, 2600, 80), 0.0), SHOT["every"] - 0.2, db(-20))
for i, k in enumerate(c["keys"] + [c["keys"][3] + 0.13]):                             # the five toe patches light one by one (high, on "EVERY toe")
    bed.add(pan_st(glint(5600 + 500 * i, 0.09, 81 + i), -0.4 + 0.2 * i), k + 0.02, db(-16))
for i, m in enumerate((72, 76, 79, 84)):                                               # a little fanfare in the gap after "toe."
    sfx.add(pan_st(fade(ding(m, 0.2, 86 + i), 0.002, 0.08), -0.2 + 0.13 * i), c["every_end"] + 0.04 + 0.07 * i, db(-17))
low_thud(c["jaw"] + 0.02, -15, 90.0, 0.3, 0.1)                                        # the brain's jaw drops (low)

# ================================================================= 7. the button: practise, big toe first
sfx.add(pan_st(whoosh(0.2, 400, 2200, 90), 0.0), SHOT["button"] - 0.2, db(-20))
bed.add(pan_st(fade(filt(creak(0.5, 91, 55, 110), "lowpass", 230), 0.03, 0.08), 0.0), c["scrunch"], db(-16))   # he scrunches up (low)
tr = filt(white(int(0.75 * SR), 92), "lowpass", 220) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * np.arange(int(0.75 * SR)) / SR)))
bed.add(pan_st(fade(norm(tr), 0.03, 0.1), 0.0), c["tremble"], db(-20))               # the toes tremble (low)
low_thud(c["big3up"], -14, 140.0, 0.2, 0.06)                                          # the big toe up (low, on "Big")
hi_tick(c["big3up"] + 0.02, -16, 93, 0.25)
shimmer(c["grin"] + 0.02, -21, 5, 94, 0.2, 0.035)                                     # his grin sparkles (after "first.")
toe_creak(c["loop_in"] + 0.15, -17, 95, 0.25)                                         # into the loop: the big toe starts lifting again

# ================================================================= score (drops out for every punchline)
BPM = 108
groove(mus, 0.22, c["easy_end"] - 0.02, BPM, ["C", "G"], gain=-12, seed=10, kick_on=False)
groove(mus, c["now"] + 0.05, c["one_end"] - 0.02, BPM, ["Am", "F"], gain=-13, seed=11, kick_on=False, arp=False)
drone(mus, c["strain"], c["gangup"] - 0.02, [45, 52, 57], cutoff=520, gain=-24, seed=12, swell=0.6)
groove(mus, c["whole"] + 0.05, c["right_end"], BPM, ["F", "C"], gain=-13.5, seed=13, kick_on=False, arp=False)
groove(mus, c["they"] - 0.02, c["string_end"] - 0.02, BPM, ["Dm", "G"], gain=-13, seed=14, kick_on=False)
groove(mus, c["glass_in"] + 0.25, c["strings_end"] - 0.02, 100, ["Am", "F", "C", "G"], gain=-12, seed=15, kick_on=False)
groove(mus, c["curl"] - 0.05, c["under_end"] - 0.02, 100, ["F", "G"], gain=-13, seed=16, kick_on=False, arp=False)
groove(mus, c["brains"] + 0.05, c["each_end"] - 0.02, 96, ["Am", "Dm"], gain=-12, seed=17, kick_on=True, snaps=False)
groove(mus, c["but"] - 0.02, c["every"] - 0.06, 100, ["C", "Am", "F", "G"], gain=-12.5, seed=18, kick_on=False)
groove(mus, c["every"] - 0.05, c["every_end"] - 0.02, 100, ["C", "G"], gain=-12, seed=19, kick_on=True)
groove(mus, c["so"] - 0.02, c["first_end"] - 0.02, BPM, ["Am", "F"], gain=-13, seed=20, kick_on=False, arp=False)
groove(mus, c["grin"] + 0.02, DUR, BPM, ["C", "G"], gain=-12, seed=21, kick_on=False)       # after the punchline, into the loop
silence(mus, [(c["easy_end"] - 0.02, c["now"] + 0.04), (c["one_end"] - 0.02, c["whole"] + 0.04), (c["right_end"], c["they"] - 0.03),
              (c["string_end"] - 0.02, c["glass_in"] + 0.24), (c["strings_end"] - 0.02, c["curl"] - 0.06),
              (c["under_end"] - 0.02, c["brains"] + 0.04), (c["each_end"] - 0.02, c["but"] - 0.03),
              (c["every_end"] - 0.02, c["so"] - 0.03), (c["first_end"] - 0.02, c["grin"] + 0.01)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
