"""Can Your THUMB Bend Back Like a Hitchhiker's? 👍 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

A desert highway at golden hour: a low wind under 300 Hz and a far bird above 5 kHz. The thumb's strain (a low creak),
the fail (a deflated squeak in the pause after "BACK."), the flash-forward (a whoosh in, a thud out), the first car passing
him (an engine kept under 300 Hz plus an air rush above 5 kHz, so "Barely moved?" stays clear), the seatbelt (its CLICK and
the hitstop's layered hit in the pause after "SEATBELT."), the catch (a short twang in the pause after "catch?"), the lock
(a clunk in the pause after "locked."), her hook (a slide whistle up after "Hers?"), the bungee (a BOING after "more"), the
car that stops for her (low rumble and a high hiss under "BUNGEE cord.", the honk after it), full silence before "Myth."
and the biggest hit after it (the stamp), the light box (a ka-chunk), the sweep of x-rays (high glints), the protractor
(a slide and ticks), the 50 line (a high zip), the 1953 card (a paper flap), his other thumb (a pop) and the car that
finally stops for him (a honk after "thumb!"). The score is a sunny road-trip groove on the loop grid (the bar line falls
on the loop), with five dead stops. What sits on a word is kept under 300 Hz or above 5 kHz.
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


def low_thud(t, gain, f=150.0, dur=0.3, tau=0.1, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def glints(t, gain, n=7, seed=0, pan=0.0, step=0.05, f0=5600):
    """a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(f0 + 330 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def strain(t, dur, gain, seed=0):
    """a thumb straining: a low rubbery creak (under 240 Hz)"""
    y = creak(dur, seed, 50, 120)
    bed.add(pan_st(fade(filt(y, "lowpass", 240), 0.04, 0.05), 0.15), t, db(gain))


def car_pass(t, dur, gain, pan0, pan1, seed=0):
    """a car going by: the engine under 300 Hz and the air rush above 5 kHz (the words stay clear)"""
    n = int(dur * SR)
    e = filt(engine(dur, seed), "lowpass", 300)
    air = filt(white(n, seed + 1), "highpass", 5000) * np.sin(np.pi * np.clip(ar(n) / dur, 0, 1)) ** 2
    pan = np.linspace(pan0, pan1, n)
    for y, g in ((norm(e), 0.0), (norm(air), -6.0)):
        st = np.stack([y * np.sqrt(np.clip((1 - pan) / 2, 0, 1)), y * np.sqrt(np.clip((1 + pan) / 2, 0, 1))], 0)
        sfx.add(fade(st, 0.05, 0.12), t, db(gain + g))


def skid(t, dur, gain, seed=0):
    """brakes: a low rumble and a high hiss (no squeal in the speech band: it runs under words)"""
    n = int(dur * SR)
    env = np.sin(np.pi * np.clip(ar(n) / dur, 0, 1)) ** 0.7
    lo = filt(brown(n, seed), "lowpass", 260) * env
    hi = filt(white(n, seed + 1), "highpass", 5400) * env
    sfx.add(pan_st(fade(norm(lo), 0.02, 0.1), 0.0), t, db(gain))
    sfx.add(pan_st(fade(norm(hi), 0.02, 0.1), 0.1), t, db(gain - 8))


def layered_hit(t, gain, seed=0):
    """a hitstop's hit (sound.md, Hitstops): a crisp transient, a body at 300-950 Hz, a short bright tail"""
    sfx.add(pan_st(filt(snap(seed), "highpass", 1800), 0.0), t, db(gain - 3))
    sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), t + 0.004, db(gain))
    sfx.add(cymbal(seed + 1, 0.35), t + 0.01, db(gain - 14))


# ================================================================= ambience: the desert at golden hour
wind = norm(filt(brown(N, 3), "lowpass", 280) * (0.75 + 0.25 * np.sin(2 * np.pi * (round(0.13 * DUR) / DUR) * tt)))
amb.x += pan_st(wind, 0.0) * 0.36
for i, bt in enumerate(np.arange(1.7, DUR - 1.0, 6.3)):                                 # a far bird now and then (above 5 kHz)
    bed.add(pan_st(fade(glide(5600, 6400, 0.09), 0.005, 0.03), -0.5 + 0.3 * (i % 3)), bt, db(-33))
    bed.add(pan_st(fade(glide(6100, 5400, 0.08), 0.005, 0.03), -0.5 + 0.3 * (i % 3)), bt + 0.14, db(-34))

# ================================================================= 1. the hook: thumbs up, bend the tip back... barely
sfx.add(pan_st(fade(filt(cork_pop(1, 420.0), "lowpass", 260), 0.002, 0.05), 0.2), c["up"] + 0.02, db(-16))   # the thumb pumps (low)
strain(c["bend1"] - 0.05, c["back1_end"] - c["bend1"] + 0.05, -14, 2)                   # the strain (low, under the words)
sq = slide_whistle(0.26, 900, 420)
sfx.add(pan_st(fade(sq, 0.004, 0.05), 0.2), c["back1_end"] + 0.03, db(-22))            # a deflated squeak in the pause
bed.add(pan_st(glint(7200, 0.1, 3), 0.25), c["back1_end"] + 0.12, db(-21))              # the "?" pops
# the flash-forward: a whoosh in, the score dipped, a soft thud out (all in the gap before "Barely")
sfx.add(pan_st(fade(filt(whoosh(0.22, 800, 5200, 5, 0.7), "highpass", 2200), 0.004, 0.05), -0.2), c["ff"], db(-23))
low_thud(c["ff"] + 0.5, -18, 140.0, 0.18, 0.05)

# ================================================================= 2. the answer: barely moved? (a car passes) ... a SEATBELT
car_pass(c["car1"] - 0.45, 1.3, -12, 0.9, -0.9, 6)                                      # the car goes by without stopping
sfx.add(pan_st(fade(filt(whoosh(0.2, 600, 5400, 7), "highpass", 4800), 0.004, 0.04), -0.1), SHOT["answer"] - 0.18, db(-22))   # the whip
# the seatbelt: it flies in on the word; CLICK and the hitstop's hit in the pause after "SEATBELT."
bed.add(pan_st(fade(filt(whoosh(0.3, 900, 6000, 8, 0.8), "highpass", 5000), 0.01, 0.06), 0.1), c["seatbelt"] + 0.1, db(-24))
sfx.add(pan_st(fade(filt(snap(9), "highpass", 1200), 0.001, 0.03), 0.1), c["click"], db(-15))
sfx.add(pan_st(fade(filt(snap(10), "highpass", 2400), 0.001, 0.03), 0.1), c["click"] + 0.07, db(-17))
layered_hit(c["click"] + 0.02, -17, 11)

# ================================================================= 3. the belt: feel it catch? ... just locked.
glints(c["feel"] - 0.12, -24, 7, 20, 0.1)                                                # the thumb turns to glass
strain(c["feel"], c["catch_end"] - c["feel"], -15, 21)
tw = twang(196.0, 0.22, 22, 0.4)
sfx.add(pan_st(fade(tw, 0.002, 0.06), 0.1), c["catch_end"] + 0.02, db(-17))             # TWANG: it caught (in the pause)
low_thud(c["lock"] + 0.0, -12, 120.0, 0.22, 0.06)                                        # the lock: a clunk (low part)...
sfx.add(pan_st(fade(filt(snap(23), "highpass", 1500), 0.001, 0.03), 0.0), c["lock"] + 0.03, db(-17))   # ...and its click, in the pause

# ================================================================= 4. the rival: hers? a hook. Less seatbelt... more BUNGEE cord.
sfx.add(pan_st(fade(filt(whoosh(0.2, 600, 5400, 30), "highpass", 4800), 0.004, 0.04), 0.2), SHOT["rival"] - 0.18, db(-22))   # the whip
sw = slide_whistle(0.32, 700, 1500)
sfx.add(pan_st(fade(sw, 0.004, 0.05), -0.2), c["hers_end"] + 0.03, db(-21))             # her tip swoops back (after "Hers?")
glints(c["less"] - 0.12, -25, 6, 31, -0.1)                                               # her thumb turns to glass
bo = boing(0.3, 110.0, 32)
sfx.add(pan_st(fade(bo, 0.003, 0.06), -0.1), c["boing"], db(-15))                       # BOING: the bungee (in the pause after "more")
car_pass(c["shot_rival_c"] - 0.25, 1.05, -13, 0.9, -0.2, 33)                             # the car comes in...
skid(c["skid"], 0.75, -14, 34)                                                           # ...and brakes for her
sfx.add(pan_st(fade(honk(0.18, 470.0, 400.0, 35), 0.004, 0.04), -0.2), c["cord_end"] + 0.03, db(-16))   # beep (after "cord.")

# ================================================================= 5. the payoff: so, straight or hitchhiker's? (silence) MYTH.
sfx.add(pan_st(fade(filt(whoosh(0.22, 500, 5200, 40), "highpass", 4600), 0.004, 0.04), -0.2), SHOT["chart"] - 0.2, db(-22))   # the whip
low_thud(c["slam"], -9, 110.0, 0.32, 0.09, bus=sfx)                                      # MYTH: the biggest hit of the Short
layered_hit(c["slam"] + 0.01, -12, 41)
sfx.add(cymbal(42, 0.6), c["slam"] + 0.02, db(-26))
# the light box: a ka-chunk on the flip, a hum under 200 Hz, the sweep of glints
low_thud(SHOT["xrays"] + 0.05, -15, 150.0, 0.2, 0.05)
bed.add(pan_st(fade(norm(filt(brown(int(2.6 * SR), 44), "lowpass", 160)), 0.1, 0.3), 0.0), SHOT["xrays"] + 0.1, db(-26))
for i in range(7):
    bed.add(pan_st(glint(5600 + 250 * i, 0.09, 45 + i), -0.4 + 0.13 * i), c["found"] - 0.05 + i * (c["between5"] + 0.2 - c["found"]) / 7.6, db(-22))

# ================================================================= 6. the weird fact: the line? Fifty degrees... picked in 1953
bed.add(pan_st(fade(filt(whoosh(0.28, 500, 6000, 50, 0.7), "highpass", 5000), 0.01, 0.05), 0.0), c["theline"] - 0.1, db(-23))   # the protractor slides on
for i in range(5):
    bed.add(pan_st(glint(6800 - 200 * (i % 2), 0.05, 51 + i), 0.1), c["theline"] + 0.25 + i * 0.26, db(-27))   # the needle hunts (ticks)
bed.add(pan_st(fade(filt(glide(5200, 9000, 0.22), "highpass", 5000), 0.005, 0.04), 0.0), c["line50"], db(-22))   # the 50 line: zip (high)
pf = filt(white(int(0.16 * SR), 56), "bandpass", [600, 2400]) * expdecay(int(0.16 * SR), 0.03)
sfx.add(pan_st(fade(pf, 0.004, 0.05), 0.2), c["degrees_end"] + 0.03, db(-24))           # the 1953 card flaps in (in the pause)
low_thud(c["picked"] + 0.02, -15, 130.0, 0.22, 0.06)

# ================================================================= 7. the button: now try your OTHER thumb! (a car stops for him)
fw = whoosh(0.16, 500, 2400, 60, 0.6)
bed.add(pan_st(fade(filt(fw, "highpass", 5000), 0.004, 0.04), -0.3), c["try"], db(-21))   # the hands swap (top only)
sfx.add(pan_st(fade(filt(cork_pop(61, 520.0), "lowpass", 260), 0.002, 0.05), -0.2), c["other"] + 0.02, db(-15))   # his other thumb pops up (low)
skid(c["brake9"] - 0.3, 0.6, -15, 62)                                                    # a car brakes behind him (under "thumb!")
sfx.add(pan_st(fade(honk(0.16, 500.0, 430.0, 63), 0.004, 0.03), 0.4), c["thumb9_end"] + 0.03, db(-16))   # beep beep! (after "thumb!")
sfx.add(pan_st(fade(honk(0.14, 500.0, 430.0, 64), 0.004, 0.03), 0.4), c["thumb9_end"] + 0.23, db(-17))

# ================================================================= score: a sunny road-trip groove on the loop grid
BPM, BEAT, BARS = loop_groove(mus, DUR, ["F", "Bb", "C", "F"], gain=-4, seed=10, kick_on=False)
riff(mus, [(0, 77), (0.75, 81), (1.5, 84), (2.5, 82), (3, 81), (3.5, 77), (4, 79), (4.75, 82), (5.5, 86), (6.5, 84), (7, 82), (7.5, 79)],
     BEAT, t0=bar_at(c["feel"], BEAT), t1=c["hitch_end"], every=8, gain=-21)
shaker(mus, bar_at(c["seatbelt_end"], BEAT), c["hitch_end"], BEAT)
# the dead stops (direction.md rule 16): the fail, the seatbelt, the lock, full silence before MYTH, the honk
silence(mus, [(c["back1_end"] - 0.02, c["your2"] + 0.1),
              (c["seatbelt"] - 0.02, c["feel"] + 0.15),
              (c["locked"] - 0.02, c["hers_end"] + 0.1),
              (c["hitch_end"] - 0.02, c["xrays"] + 0.15),
              (c["degrees_end"] - 0.02, c["picked"] + 0.12),
              (c["thumb9_end"] - 0.02, DUR - BEAT)])
for k, m in enumerate((84, 88)):                                                         # two pickup notes into bar 1 (the loop)
    mus.add(pan_st(steel_pan(m, 0.22, 70 + k), 0.1), DUR - BEAT + k * BEAT / 2, db(-14))

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
