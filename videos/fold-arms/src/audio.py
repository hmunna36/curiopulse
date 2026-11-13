"""Fold Your Arms the OTHER Way. Feels WRONG? 🙅 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The summit: wind under 380 Hz with slow gusts, prayer flags flapping above 5 kHz, the self-timer's tick (high). Frame 1:
the jacket's swish as his arms fold. "Now fold them the OTHER way": the swish back, a fumble of rubbery creaks (low),
then in the pause after "way." the knot ties itself (a BOING and a squeak) and the self-timer's shutter goes. The
answer: a hatch clunk (low) as the window opens, the dive's whoosh, the cockpit's hum (low), the alarm (a klaxon cut
to its edges under the words, whole in the pause after "autopilot."), the OFF switch's CLUNK with the hitstop's layered
hit, the coffee splashing in the pause. Back: the knot pops (a cork), the fold snaps (a soft thud), a warm chime after
"Ahh.", a ding for the green sign after "Autopilot.". The cockpit at rest: lounge score, the FOLDS counter ratcheting
(high), the levers' servo hum (edges). By hand: the alarm again, lever clunks (low) on every yank, servo whines
(edges), the knot's boing after "hand.". The twins: the whip, pops for the pills (high), a thud for 46%, the shutter
after "ways.", a gust for the deadpan stare. The pilots: two window pops (high), two dings after "pilot." (one each).
The button: the whirl (fast whooshes), the super-pretzel BOING with the hitstop after "FASTER.", the knot springing
open and the swish into frame 1 (the loop).
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


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11):
    """a knock heard under a word: almost all of it under 200 Hz"""
    bed.add(thump(dur, f, f * 0.3, tau), t, db(gain))


def swish(t, gain, seed=0, pan=0.0, dur=0.22):
    """his jacket's sleeves sweeping: air above 5 kHz with a soft body under 300 Hz (both can sit on a word)"""
    hi = filt(whoosh(dur, 3000, 9000, seed, 0.6), "highpass", 5000)
    lo = filt(whoosh(dur, 120, 400, seed + 1, 0.6), "lowpass", 300)
    bed.add(pan_st(fade(hi + 0.6 * lo, 0.01, 0.05), pan), t, db(gain))


def whip(t, gain, seed=0, pan=0.0):
    """the whip pan's whoosh, ending at the cut"""
    sfx.add(pan_st(whoosh(0.22, 300, 2400, seed), pan), t - 0.22, db(gain))


def tick_hi(t, gain, seed=0, pan=0.3):
    """the self-timer's tick: all above 5 kHz"""
    bed.add(pan_st(fade(filt(beep(5600.0, 0.03), "highpass", 5000), 0.001, 0.01), pan), t, db(gain))


def hit_layers(th, g=0.0):
    """the hitstop's layered hit (sound.md, "Hitstops"): a crisp top, a body a phone plays, a short bright tail"""
    sfx.add(pan_st(filt(snap(51), "highpass", 1800), 0.0), th, db(-20 + g))
    sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), th + 0.004, db(-17 + g))
    sfx.add(cymbal(52, 0.45), th + 0.01, db(-31 + g))


def plus(*xs):
    """add one-shots of different lengths (the shorter ones padded with silence)"""
    n = max(x.shape[-1] for x in xs)
    out = np.zeros(xs[0].shape[:-1] + (n,))
    for x in xs:
        out[..., :x.shape[-1]] += x
    return out


def soft_clip(y, k=3.2):
    y = norm(y)
    return np.tanh(k * y) / np.tanh(k)


# ================================================================= ambience
summit = [(0.0, c["dive0"] + 0.2), (SHOT["back"], END["back"]), (SHOT["twins"], DUR)]
cockpit = [(c["dive0"], END["answer"]), (SHOT["usual"], END["hand"])]
wind = norm(filt(pink(N, 3), "lowpass", 380) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * tt) + 0.15 * np.sin(2 * np.pi * 0.37 * tt + 1)))
amb.x += pan_st(wind * gate(N, summit), -0.1) * 0.34
flap = norm(filt(white(N, 4), "highpass", 5200)) * (0.5 + 0.5 * np.clip(np.sin(2 * np.pi * 3.1 * tt), 0, 1) ** 3)
bed.x += pan_st(flap * gate(N, summit), 0.25) * db(-40)                                 # prayer flags (high)
hum = norm(filt(brown(N, 6), "lowpass", 180) + 0.3 * np.sin(2 * np.pi * 60 * tt))
amb.x += pan_st(hum * gate(N, cockpit), 0.0) * 0.26                                     # the cockpit's hum (low)
for i, tk in enumerate(np.arange(0.12, c["flash"] - 0.05, 0.5)):
    tick_hi(tk, -30, 10 + i)                                                             # the self-timer ticking (high)

# ================================================================= 1. the hook: fold your arms... now the OTHER way
swish(0.0, -14, 1, -0.1, 0.3)                                                            # frame 1: the sleeves fold
low_thud(0.32, -18, 140.0, 0.2, 0.05)                                                    # arms land (low)
swish(c["now1"] - 0.02, -16, 3, 0.1, 0.24)                                               # unfold
for i, tk in enumerate((c["fold2"] + 0.05, c["other"] + 0.02, c["way1"] - 0.05)):
    bed.add(pan_st(fade(filt(creak(0.18, 20 + i, 70, 150), "lowpass", 260), 0.02, 0.05), 0.2 * (i - 1)), tk, db(-16))   # the fumble (low)
bo = boing(0.42, 150.0, 7)
sfx.add(pan_st(fade(bo, 0.003, 0.08), 0.0), c["knot"] + 0.01, db(-13))                # BOING: the knot (the pause after "way.")
sfx.add(pan_st(fade(squeak(0.12, 2100, 2900), 0.003, 0.03), 0.15), c["knot"] + 0.12, db(-22))
sfx.add(pan_st(shutter(), 0.45), c["flash"], db(-17))                                  # the self-timer goes off

# ================================================================= 2. the answer: feels wrong? you just switched OFF your autopilot
low_thud(c["win"], -14, 110.0, 0.28, 0.08)                                              # the hatch opens (low)
bed.add(pan_st(glint(6400.0, 0.1, 30), 0.0), c["win"] + 0.08, db(-24))
sfx.add(pan_st(whoosh(0.5, 200, 1800, 31, 0.7), 0.0), c["dive0"], db(-22))              # the dive
kl = klaxon(0.9, 32)
bed.add(pan_st(fade(filt(kl, "highpass", 5200), 0.02, 0.1), 0.0), c["dive0"] + 0.2, db(-26))   # the alarm, its top under the words
clunk = soft_clip(plus(thump(0.3, 220.0, 70.0, 0.06), 0.4 * filt(snap(33), "highpass", 2500)))
sfx.add(pan_st(clunk, 0.0), c["off"] + 0.03, db(-14))                                  # OFF: the switch clunks
hit_layers(c["off"] + 0.03, -1.0)
sp = splash(0.5, 34, 0.5)
gapA = c["switch"] - c["auto1_end"]                                                     # the pause before "Switch" (about 0.3 s)
sfx.add(pan_st(fade(sp[: int(max(0.12, gapA - 0.06) * SR)], 0.005, 0.06), 0.25), c["auto1_end"] + 0.0, db(-18))   # the coffee splashes (the pause)
sfx.add(pan_st(fade(kl[: int(max(0.1, gapA - 0.12) * SR)], 0.01, 0.05), 0.0), c["auto1_end"] + 0.04, db(-22))   # one whole blast in the pause, gone before "Switch"
whip(SHOT["back"], -21, 35, 0.2)

# ================================================================= 3. back: switch back... ahh. autopilot.
sfx.add(pan_st(filt(fade(cork_pop(36, 520.0), 0.0006, 0.02), "highpass", 4500), 0.0), c["switch"] + 0.02, db(-12))   # the knot pops open: the click above the voice (high)
low_thud(c["switch"] + 0.02, -17, 110.0, 0.16, 0.04)                                    # ...and its body under it (low)
swish(c["back"] - 0.04, -15, 37, -0.1, 0.22)
low_thud(c["back"] + 0.22, -15, 150.0, 0.2, 0.05)                                       # the fold snaps home (low)
for j, m in enumerate((79, 84, 88, 91)):
    bed.add(pan_st(fade(glint(5600 + 380 * j, 0.12, 40 + j), 0.002, 0.05), 0.1 * j - 0.15), c["ahh_end"] + 0.03 + 0.05 * j, db(-24))   # warm sparkle (high)
sfx.add(pan_st(ding(84, 0.2, 41), 0.1), c["auto2_end"] + 0.03, db(-19))               # ding: the sign is green again

# ================================================================= 4. usual: thousands of times... it flies itself
bed.add(pan_st(fade(ratchet(c["times_end"] - c["thousands"] + 0.1, 18.0, 46.0, 42, True), 0.02, 0.06), 0.2), c["thousands"] - 0.05, db(-22))   # FOLDS rolling (high)
sfx.add(pan_st(ding(91, 0.12, 43, 1.4), 0.2), c["times_end"] + 0.0, db(-25))          # 9,999+ (the pause)
bed.add(pan_st(filt(fade(servo(c["itself_end"] - c["flies1"] + 0.3, 240.0, 330.0, 44, True), 0.05, 0.1), "highpass", 4800), -0.2), c["flies1"] - 0.2, db(-20))   # the levers move by themselves (high)
bed.add(pan_st(gulp(45), 0.1), c["itself_end"] + 0.06, db(-18))                         # the pilot sips (low)

# ================================================================= 5. hand: the other way? your brain flies it... by hand
bed.add(pan_st(fade(filt(klaxon(c["hand_end"] - c["the_other"] + 0.3, 46), "highpass", 5200), 0.03, 0.1), 0.0), c["the_other"], db(-26))
for i, tk in enumerate(np.arange(c["brain"], c["hand"] - 0.05, 0.22)):
    low_thud(tk, -16, 120.0 + 12 * (i % 3), 0.16, 0.04)                                  # lever clunks (low)
bed.add(pan_st(fade(servo(c["hand"] - c["brain"], 300.0, 520.0, 47, True), 0.03, 0.06), 0.2), c["brain"], db(-24))
bo2 = boing(0.36, 170.0, 48)
sfx.add(pan_st(fade(bo2, 0.003, 0.07), 0.0), c["hand_end"] + 0.03, db(-15))          # the knot on the monitor
whip(SHOT["twins"], -21, 49, -0.2)

# ================================================================= 6. the twins: identical twins... almost half fold opposite ways
bed.add(pan_st(fade(filt(blip(600, 1800, 0.12, 50), "highpass", 5000), 0.003, 0.04), 0.0), c["identical"] + 0.02, db(-22))   # the pill pops (high)
low_thud(c["almost"] + 0.02, -14, 130.0, 0.24, 0.07)                                     # 46% lands (low)
swish(c["fold3"] - 0.03, -15, 51, -0.3, 0.22)
swish(c["fold3"] - 0.01, -15, 52, 0.3, 0.22)
bed.add(pan_st(fade(filt(blip(700, 2000, 0.12, 53), "highpass", 5000), 0.003, 0.04), 0.0), c["opposite"] + 0.02, db(-22))
sfx.add(pan_st(shutter(), 0.45), c["ways_end"] + 0.05, db(-17))                       # the self-timer catches them
gust = norm(filt(pink(int(0.9 * SR), 54), "lowpass", 420)) * np.sin(np.pi * np.linspace(0, 1, int(0.9 * SR)))
bed.add(pan_st(gust, -0.3), c["ways_end"] + 0.15, db(-19))                               # the deadpan stare: a gust

# ================================================================= 7. the pilots: same DNA... different pilot
for j, tk in enumerate((c["different"] - 0.02, c["different"] + 0.08)):
    bed.add(pan_st(fade(filt(blip(500 + 200 * j, 1600 + 300 * j, 0.1, 55 + j), "highpass", 5000), 0.003, 0.04), -0.3 + 0.6 * j), tk, db(-21))
sfx.add(pan_st(ding(79, 0.12, 57), -0.3), c["pilot_end"] + 0.0, db(-19))              # two salutes: ding...
sfx.add(pan_st(ding(86, 0.1, 58), 0.3), c["pilot_end"] + 0.08, db(-21))               # ...dong (rung out before "Now")
whip(SHOT["loop"] - 0.06, -22, 59, 0.2)                                                # ends just before "Now"

# ================================================================= 8. the button: now try the wrong way... FASTER.
swish(c["try"] - 0.04, -16, 60, 0.1, 0.22)
for i, tk in enumerate(np.arange(c["wrong2"], c["faster"] - 0.05, 0.11)):
    bed.add(pan_st(fade(filt(whoosh(0.1, 3000, 8000, 61 + i, 0.6), "highpass", 5000), 0.005, 0.03), 0.3 * (-1) ** i), tk, db(-24))   # the whirl (high)
bo3 = boing(0.5, 120.0, 70)
sfx.add(pan_st(fade(bo3, 0.003, 0.08), 0.0), c["faster_end"] + 0.02, db(-12))        # the super-pretzel (the pause after FASTER.)
hit_layers(c["faster"] + 0.07, -1.0)
sfx.add(pan_st(fade(cork_pop(71, 480.0), 0.0006, 0.02), 0.0), DUR - 0.62, db(-17))     # it springs open
swish(DUR - 0.3, -14, 1, -0.1, 0.3)                                                     # and folds into frame 1 (the loop)

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.25, c["win"], BPM, ["F", "Bb", "C", "F"], gain=-4, seed=10)          # the test runs on the groove...
drone(mus, c["win"], END["answer"], [38, 45, 50], cutoff=420, gain=-18, seed=11)    # ...the answer line on a low drone (the window opens)
groove(mus, SHOT["back"] + 0.1, END["back"], BPM, ["F", "C"], gain=-6, seed=12, kick_on=False)
groove(mus, SHOT["usual"] + 0.15, END["usual"], 92, ["Bb", "Gm", "C", "F"], gain=-6, seed=13, kick_on=False, snaps=False, half=True)
groove(mus, SHOT["hand"] + 0.05, END["hand"], 128, ["Dm", "Dm", "Bb", "A"], gain=-5, seed=14, sixteen=True)
groove(mus, SHOT["twins"] + 0.1, DUR + 0.5, BPM, ["F", "Bb", "C", "F"], gain=-4, seed=15)
silence(mus, [(c["knot"] - 0.05, c["knot"] + 0.45), (c["off"] - 0.05, c["off"] + 0.35), (c["ahh"] - 0.05, c["ahh_end"] + 0.3),
              (c["ways_end"] - 0.02, c["ways_end"] + 0.7), (c["pilot"] - 0.05, c["pilot_end"] + 0.45),
              (c["faster"] - 0.05, DUR + 0.5)])   # the score stays out from FASTER to the loop: frame 1 brings the groove back

master(WORK, sfx, bed, mus, amb)
