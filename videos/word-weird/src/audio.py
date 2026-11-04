"""Why Does a Word Go WEIRD When You Repeat It? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The chant has a clock: one "spoon" every DT s (the cue list `reps`), and every rep gets a soft tok the viewer can chant to
(a knock under 250 Hz and a tick above 5.2 kHz, so it can sit on any word). The score's groove runs at the same tempo, its
marimba eighths landing on the reps. The campfire at night (a low rumble, crackle above 5 kHz) under the hook, the window
shots and the button; inside his head a low hum; the exam hall's room tone with pencils (above 5.2 kHz) under the study.
Gags, each in a pause of its own: the word cracks (a glass crack after "word."), the meaning leaves (tiny steps and the
bubble's pop after "out."), the door's angry "WHAT?!" (a tiny voice after "answers."), the frantic doorbell (DING-DING-DING
after "in?"), one cricket after "home.", the wire's spark (a zap after "worn out."), the pencils dropping (a clatter after
"quit..."), the whip and the jelly door (a whoosh and a boing after "WRONG."), YOUR NAME wobbling (a slide whistle after
"NAME."). The music drops out for every punchline and is gone for the last second, so the loop starts on the toks alone.
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
c = C
REPS = c["reps"]
DT = (c["thirty"] - c["spoonw"]) / 29
BPM = 60.0 / DT                       # the chant's tempo (one rep an eighth note in a half-time bar)

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0, dur=0.03):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(dur * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def tok(t, gain, seed=0):
    """the chant's beat: a woodblock with its middle taken out (a knock under 250 Hz + a tick above 5.2 kHz)"""
    low_thud(t, gain, 210.0, 0.09, 0.025)
    hi_tick(t, gain - 3, seed, 0.15 * (-1) ** seed, 0.025)


def tiny_voice(t, gain, dur=0.24, seed=0, f0=820.0, rate=24.0, pan=0.0):
    """the little spoon says something with no words (a pause to itself)"""
    y = gibber(dur, seed, f0, True, 0.0, rate)
    env = np.sin(np.linspace(0, np.pi, len(y))) ** 0.6
    sfx.add(pan_st(fade(y * env, 0.01, 0.04), pan), t, db(gain))


def soft_clip(y, k=2.6):
    return np.tanh(k * norm(y)) / np.tanh(k)


def low_whoosh(t, dur, gain, seed=0):
    """a move or a cut, all of it under 380 Hz (it can sit under a word)"""
    y = whoosh(dur, 60, 340, seed)
    bed.add(pan_st(fade(filt(y, "lowpass", 380), 0.05, 0.08), 0.0), t, db(gain))


def air_rise(t0, t1, gain, seed=0):
    """a riser of air only (above 5.2 kHz): it can run under a line"""
    rs = riser(t1 - t0, seed, 400, 1800)
    bed.add(pan_st(fade(filt(rs, "highpass", 5200), 0.05, 0.02), 0.0), t0, db(gain))


# ================================================================= ambience
rumble = norm(filt(brown(N, 1), "lowpass", 200) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * tt)))
crk = norm(crackle(N, 9.0, 2, 5400, 11000))
night = norm(filt(pink(N, 3), "bandpass", [140, 380])) * 0.25
camp_on = gate(N, [(0, END["nobody"]), (SHOT["button"], DUR)])
amb.x += pan_st((rumble * 0.9 + night) * camp_on, 0.1) * 0.26
bed.x += pan_st(crk * camp_on, 0.3) * db(-31)
crickets(SHOT["hook"] + 0.2, c["thirty"], bed, -36, seed=5, f=5600, rate=0.6)            # far crickets (above 5 kHz)
head_on = gate(N, [(SHOT["wire"], END["wire"])])
hum = norm(filt(brown(N, 7), "lowpass", 160)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.5 * tt))
amb.x += pan_st(hum * head_on, 0.0) * 0.22                                               # inside his head: a low hum
hall_on = gate(N, [(SHOT["page"], END["door"])])
room = norm(filt(pink(N, 11), "lowpass", 300)) * 0.5
amb.x += pan_st(room * hall_on, -0.1) * 0.2
writing = gate(N, [(SHOT["page"], c["seven"] + 0.3)])
scr = norm(filt(scribble(DUR, 12, 6.0), "highpass", 5200))
bed.x += pan_st(scr[:N] * writing, 0.1) * db(-30)                                        # pencils on paper (above 5.2 kHz)

# ================================================================= the chant's toks (every rep; they run on into the button)
for i, r in enumerate(REPS):
    if r < c["nobody"] - 0.1:
        tok(r, -25 if i >= c["counted0"] else -27, i)
# the button: the chant again, on the loop's clock (its toks run straight into frame 1's)
loop_reps = [REPS[0] + DUR - k * DT for k in range(1, 12)]
for k, r in enumerate(sorted(x for x in loop_reps if x > c["name_end"] - 0.02)):
    tok(r, -26, 200 + k)
for r in sorted(x for x in loop_reps if c["now"] + 0.25 <= x < c["name_end"] - 0.02):
    tok(r, -30, 300)

# ================================================================= 1. the hook: the word cracks; the meaning walks out
gc = glass_tink(21, 4200.0, 0.12)
sfx.add(pan_st(fade(soft_clip(gc, 2.4), 0.001, 0.04), -0.1), c["word_end"] + 0.03, db(-14))        # crack (after "word.")
hi_tick(c["crack"] + 0.02, -18, 22, -0.2, 0.06)                                                   # the crack starts (on "break": top only)
bed.add(pan_st(glint(6900, 0.1, 23), 0.0), c["thump"] + 0.01, db(-22))                           # the word thumps on "SPOON" (top only)
for k in range(4):                                                                                # tiny steps out (after "out.")
    hi_tick(c["out"] + 0.05 + 0.07 * k, -17, 30 + k, 0.4, 0.02)
    low_thud(c["out"] + 0.05 + 0.07 * k, -20, 260.0, 0.05, 0.015)
pp = cork_pop(31, 700.0)
sfx.add(pan_st(fade(soft_clip(pp, 2.0), 0.001, 0.04), 0.4), c["gone"], db(-15))                 # the empty bubble pops (ends before "Each")
low_whoosh(SHOT["bell"] - 0.15, 0.5, -15, 32)                                                    # the dive into his head (low)

# ================================================================= 2. the bell: every spoon rings it; then WHAT?!
for r in REPS:
    if SHOT["bell"] + 0.05 < r < c["in_end"]:
        bed.add(pan_st(glint(7400, 0.08, int(r * 100)), 0.25), r + 0.01, db(-24))               # ting (top only, on the words)
tiny_voice(c["answers_end"] + 0.04, -14, 0.24, 40, 900.0, 26.0, 0.2)                             # "WHAT?!" (after "answers.")
bed.add(pan_st(fade(filt(creak(0.3, 41, 60, 130), "lowpass", 240), 0.03, 0.06), 0.2), c["yes"], db(-18))   # the door (low)
air_rise(c["thirty"], c["in_end"], -19, 42)                                                     # thirty rings: the pressure builds (air)
for k in range(4):                                                                                # DING-DING-DING-DING (after "in?")
    dg = ding(88 - (k % 2) * 4, 0.07, 43 + k, 1.3)
    sfx.add(pan_st(fade(dg, 0.001, 0.02), 0.15), c["frantic"] + 0.075 * k, db(-15))
sfx.add(pan_st(fade(cricket(44, 3, 4600), 0.002, 0.02), -0.3), c["cricket"], db(-14))         # one cricket (after "home.")
sfx.add(pan_st(fade(cricket(45, 2, 4500), 0.002, 0.02), -0.3), c["cricket"] + 0.17, db(-17))
low_whoosh(SHOT["wire"] - 0.12, 0.45, -16, 46)                                                   # into the circuit (low)

# ================================================================= 3. the wire: SOUND fine, MEANING fine, the WIRE worn out
low_thud(c["soundw"] + 0.05, -16, 180.0, 0.12, 0.03)                                             # the button pressed (low, on "sound,")
hi_tick(c["soundw"] + 0.05, -20, 50, -0.3)
for k, tk in enumerate((c["tick1"], c["tick2"])):                                                # the ticks on the card (top only)
    bed.add(pan_st(glint(7800 + 400 * k, 0.12, 51 + k), 0.2), tk + 0.01, db(-18))
bed.add(pan_st(buzz_hi(c["worn_end"] - c["between"], 33.0, 52), 0.0), c["between"], db(-26))   # the frayed wire fizzes (top only)
zp = zap(0.3, 53, 118.0, False, 0.0)
sfx.add(pan_st(fade(soft_clip(zp, 2.2), 0.003, 0.05), 0.0), c["worn_end"] + 0.03, db(-16))      # ZAP (after "worn out.")
low_whoosh(SHOT["page"] - 0.12, 0.4, -17, 54)

# ================================================================= 4. the study
sc = scribble(0.3, 60, 9.0)
sfx.add(pan_st(fade(sc, 0.01, 0.05), 0.2), c["over_end"] + 0.02, db(-20))                       # a last scribble (after "over.")
for k in range(7):                                                                                # seven pencils put down (top only)
    j = c["seven"] - 0.05 + (c["quit"] - c["seven"] + 0.05) * k / 6
    hi_tick(j + 0.03, -17, 61 + k, -0.4 + 0.13 * k, 0.04)
for k in range(3):                                                                                # the clatter (after "quit...")
    sfx.add(pan_st(fade(soft_clip(knuckle_crack(70 + k, 1, 0.0, 2400.0 + 300 * k, 0.4), 2.0), 0.001, 0.02), -0.2 + 0.2 * k),
            c["quit_end"] + 0.02 + 0.04 * k, db(-12))
sfx.add(pan_st(whoosh(0.16, 300, 1900, 72), 0.3), c["wrong_end"] + 0.02, db(-19))              # the whip (after "WRONG.")
bo = boing(0.45, 120.0, 73)
sfx.add(pan_st(fade(bo, 0.003, 0.06), 0.35), c["jelly"] + 0.02, db(-14))                         # the jelly door: boing
low_whoosh(SHOT["button"] - 0.1, 0.35, -18, 74)

# ================================================================= 5. the button: YOUR NAME wobbles
sw = slide(620.0, 880.0, 0.36, 9.0, None, 4)
sfx.add(pan_st(fade(sw, 0.01, 0.06), 0.0), c["name_end"] + 0.04, db(-19))                        # wobbly whistle (after "NAME.")
bed.add(pan_st(glint(6400, 0.1, 81), 0.0), c["tagname"] + 0.02, db(-22))                        # YOUR NAME pops in (top only)

# ================================================================= score (the chant's tempo; drops out for every punchline)
g1 = REPS[c["counted0"] + 7]                                   # the rep after "Keep going."
groove(mus, g1, c["walks"] - 0.05, BPM, ["F", "C", "Dm", "Bb"], gain=-12, seed=10, kick_on=True, snaps=False, half=True)
g2 = min(r for r in REPS if r > c["each"] + 0.3)               # back after "Each spoon"
groove(mus, g2, c["answers_end"], BPM, ["F", "C", "Dm", "Bb"], gain=-12, seed=11, kick_on=True, snaps=True, half=True)
drone(mus, c["thirty"] + 0.1, c["in_end"], [41, 48, 53, 56], cutoff=620, gain=-24, seed=12, swell=1.4)
groove(mus, c["lab"] + 0.35, c["fray"], 100, ["Am", "Dm", "E", "Am"], gain=-14, seed=13, kick_on=False, snaps=True, padv=False)
drone(mus, c["fray"], c["worn"], [38, 45, 50, 51], cutoff=700, gain=-23, seed=14, swell=0.9)
g3 = c["scientists"] + 0.3
groove(mus, g3, c["seven"] - 0.05, BPM, ["C", "C", "Am", "Am"], gain=-14, seed=15, kick_on=False, snaps=False, bass=True, padv=False, half=True)
drone(mus, c["seven"], c["quit_end"], [45, 52, 55], cutoff=500, gain=-26, seed=16, swell=0.6)
g4 = c["with"] + 0.05
groove(mus, g4, c["name"] - 0.05, BPM, ["F", "C"], gain=-15, seed=17, kick_on=False, snaps=False, padv=False, half=True)
silence(mus, [(c["walks"] - 0.05, g2), (c["answers_end"], c["thirty"] + 0.1), (c["in_end"], c["lab"] + 0.35),
              (c["worn"], g3), (c["seven"] - 0.05, c["seven"]), (c["quit_end"], g4), (c["name"] - 0.05, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
