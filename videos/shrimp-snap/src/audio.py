"""Can a Shrimp's Snap Get as HOT as the SUN? 🦐 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Four metres under water: a low swell with far bubbles; his snap is a sad little "tk", the shrimp's is a BANG (a crack
and a boom, in the gap before the next line); the slow motion is a pitched-down world with the claw's slam as a deep thud
and the bubble's collapse as a reverse suck into a second BANG; the reef of shrimp crackles like frying bacon (under the
words only its top) and the 1943 sub's sonar pings in the gaps. A playful marimba-and-pizzicato score drops out for every
punchline.
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
WORDS = TL["words"]
PM = pause_mask(WORDS, N)        # 1 in the pauses, 0 under the words


def edges(y, lo=250, hi=5200):
    """only what a word can sit on: under `lo` Hz and over `hi` Hz"""
    return filt(y, "lowpass", lo) + filt(y, "highpass", hi)


def soft(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


def bang(seed, big=1.0):
    """the snap's BANG: a hard crack over a deep boom and a fizz of bubbles (0.6 s; only the first 0.2 s is in the
    speech band, the boom under 250 Hz rings on)"""
    n = int(0.6 * SR)
    cr = L.crack(0.2, seed, 0.03, 700)
    cr = np.pad(cr, (0, n - len(cr)))
    boom = thump(0.6, 140, 38, 0.2, seed + 1)
    boom = np.pad(boom, (0, max(0, n - len(boom))))[:n]
    fz = filt(white(n, seed + 2), "highpass", 4500) * expdecay(n, 0.12) * 0.35
    return soft(cr * 1.0 + boom * 1.2 * big + fz, 2.6)


def ping(f=1180.0, dur=0.42):
    """a submarine sonar ping: a pure tone with a fast attack and a long tail"""
    n = int(dur * SR)
    x = np.sin(2 * np.pi * f * ar(n)) * expdecay(n, 0.11)
    return fade(x, 0.004, 0.06)


# ================================================================= the water (one bed for the whole Short)
swell = 0.75 + 0.25 * np.sin(2 * np.pi * tt * (round(DUR * 0.18) / DUR))
water = filt(brown(N, 1), "lowpass", 210) * swell + 0.25 * filt(pink(N, 2), "bandpass", [6000, 11000]) * (0.6 + 0.4 * np.sin(2 * np.pi * tt * 0.31))
amb.x += pan_st(water, 0) * 0.35
rng = np.random.default_rng(7)
for k in range(40):                    # far bubbles: tiny high ticks (above 5.2 kHz, they can sit on words)
    ti = rng.uniform(0.2, DUR - 0.3)
    bed.add(pan_st(filt(drip(k, rng.uniform(5800, 7800)), "highpass", 5200), rng.uniform(-0.7, 0.7)), ti, db(-30))

# ================================================================= the hook: his snap, "Cute.", the shrimp's BANG
sfx.add(pan_st(edges(whoosh(0.28, 300, 2400, 20, 0.9), 300, 5200), 0), 0.0, db(-16))
tk = filt(snap(3), "lowpass", 2600)                                            # his snap under water: a sad little "tk"
sfx.add(pan_st(tk, 0.25), c["snap1"], db(-17))
sfx.add(pan_st(bloop(520, 300, 0.09), 0.25), c["snap1"] + 0.05, db(-24))       # one tiny bubble
sfx.add(pan_st(ratchet(0.16, 30, 12, 4, edges=True), 0.4), c["cock"], db(-17))  # the claw cocks (on "Cute": edges only)
sfx.add(pan_st(bang(11), 0.35), c["bang0"], db(-8))                            # BANG (in the gap before "This")
sfx.add(pan_st(edges(whoosh(0.6, 200, 3000, 12, 0.2), 300, 5200), 0.2), c["bang0"] + 0.02, db(-12))
sfx.add(pan_st(filt(gurgle(0.9, 13, 30), "highpass", 5200), -0.2), c["bang0"] + 0.1, db(-21))    # his bubbles, blown back
for i in range(4):                                                             # the "smoke" off the barrel: little bubbles
    sfx.add(pan_st(filt(drip(30 + i, 6400 + 300 * i), "highpass", 5200), 0.4), c["bang0"] + 0.6 + 0.14 * i, db(-24))
sfx.add(pan_st(riser(1.2, 5, 3000, 9000), 0.3), c["gets"], db(-27))            # the thermometer climbs (top only)
for i, m in enumerate((84, 88, 91)):                                           # the Sun pops on top: a bright little chord
    sfx.add(pan_st(fade(marimba(mtof(m), 0.22, 60 + i, 1.4), 0.001, 0.06), 0.3), c["sun_end"] + 0.02 + 0.035 * i, db(-17))
sfx.add(pan_st(glint(7200, 0.12, 9), 0.3), c["sun_end"] + 0.03, db(-20))

# ================================================================= SLOW-MO: everything pitched down
sfx.add(pan_st(slide(420, 70, 0.32, 0.0, None, 5), 0), SHOT["slowmo"] - 0.1, db(-17))   # the tape slows (in the gap)
sfx.add(pan_st(filt(whoosh(0.5, 1800, 200, 21, 0.4), "highpass", 5200) + filt(whoosh(0.5, 1800, 200, 21, 0.4), "lowpass", 250), 0), SHOT["slowmo"] - 0.12, db(-14))
slam1 = soft(thump(1.0, 70, 26, 0.35, 22), 2.0)                                # the claw shutting, in slow motion (all low)
sfx.add(pan_st(slam1, 0.2), c["bangw"] + 0.35, db(-9))
sfx.add(pan_st(buzzer(0.16), 0), c["claw_end"] + 0.02, db(-19))               # NOPE (in the pause after "claw.")
sfx.add(pan_st(bloop(260, 120, 0.2), 0), c["bubble_end"] + 0.03, db(-14))       # bloop, after "BUBBLE."
sfx.add(pan_st(edges(whoosh(0.4, 3000, 400, 23, 0.6), 300, 5200), 0), c["the_claw"] - 0.03, db(-16))   # the rewind
sfx.add(pan_st(ratchet(0.38, 40, 14, 24, edges=True), 0), c["the_claw"], db(-20))
slam2 = soft(thump(0.8, 80, 28, 0.3, 25), 2.0)
sfx.add(pan_st(slam2, 0.2), c["slams"] + 0.12, db(-9))
jet = edges(whoosh(1.1, 300, 4000, 26, 0.25, 0.4), 250, 5200)                  # the jet (only its edges: under "so fast")
sfx.add(pan_st(jet, -0.3), c["slams"] + 0.2, db(-10))
sfx.add(pan_st(whoosh(0.22, 800, 3400, 27, 0.3), -0.3), c["fast"] + 0.62, db(-17))      # whole, in the pause before "it rips"
tear = filt(brown(int(1.4 * SR), 28), "lowpass", 230) * np.linspace(0.3, 1.0, int(1.4 * SR))   # the water tearing open
sfx.add(pan_st(fade(tear, 0.05, 0.2), 0), c["rips"] - 0.05, db(-10))
sfx.add(pan_st(filt(gurgle(1.2, 29, 45), "highpass", 5200), -0.2), c["rips"], db(-22))

# ================================================================= the bubble crushes itself: BANG; nearly 5,000 degrees
suck = edges(glide(180, 900, 1.0) * np.linspace(0.2, 1.0, int(1.0 * SR)), 250, 5200)
sfx.add(pan_st(suck, 0), c["collapse"] - 1.0, db(-14))                         # the reverse suck as it crushes (edges)
sfx.add(pan_st(riser(1.05, 31, 5400, 11000), 0), c["collapse"] - 1.05, db(-22))
sfx.add(pan_st(bang(33, 1.3), 0), c["collapse"], db(-6))                       # BANG (in the pause after "itself.")
sfx.add(pan_st(filt(cymbal(34, 1.4)[0], "highpass", 5200), 0), c["collapse"] + 0.02, db(-21))
sfx.add(pan_st(soft(thump(1.2, 60, 24, 0.5, 35), 2.0), 0), c["collapse"] + 0.01, db(-13))   # the boom rolls on (low)
sfx.add(pan_st(ratchet(2.2, 18, 46, 36, edges=True), 0.2), c["nearly2"], db(-23))           # the readout counting up
sfx.add(pan_st(filt(white(int(0.3 * SR), 37), "highpass", 5600) * expdecay(int(0.3 * SR), 0.08), 0.2), c["degrees_end"] + 0.03, db(-19))   # tss

# ================================================================= it even flashes; SHRIMPOLUMINESCENCE
sfx.add(pan_st(edges(whoosh(0.3, 500, 3000, 41), 300, 5200), 0), SHOT["flash"] - 0.2, db(-17))
sfx.add(pan_st(soft(thump(0.3, 160, 60, 0.08, 42), 2.0), 0.3), c["flashes"] - 0.03, db(-13))   # a little snap (low)
sfx.add(pan_st(glint(7600, 0.12, 43), 0.3), c["flashes"] + 0.03, db(-19))
sfx.add(pan_st(shutter(), 0.2), c["flashes_end"] + 0.03, db(-19))              # the shades go on (in the pause)
sfx.add(pan_st(glint(6800, 0.1, 44), -0.2), c["flashes_end"] + 0.2, db(-21))
sfx.add(pan_st(buzz_hi(1.5, 50.0, 45), 0), c["shrimpo"], db(-26))              # the neon buzz (top only, under the word)
for i, m in enumerate((72, 76, 79, 84)):                                       # ta-da in the gap after the word (ends before "In")
    sfx.add(pan_st(fade(marimba(mtof(m), 0.15, 46 + i), 0.001, 0.05), 0.1 * (i - 1.5)), c["shrimpo_end"] + 0.01 + 0.03 * i, db(-16))

# ================================================================= World War Two: the sub, its sonar, the crackle
sfx.add(pan_st(edges(whoosh(0.5, 300, 2800, 51, 0.3), 300, 5200), 0), SHOT["navy"] - 0.25, db(-15))
eng = filt(engine(END["navy"] - SHOT["navy"] + 0.5, 52), "lowpass", 200)       # the sub's engine, low
amb.add(pan_st(fade(eng, 0.4, 0.4), 0.4), SHOT["navy"], db(-22))
sfx.add(pan_st(ping(), 0.4), c["two_end"] + 0.03, db(-14))                     # PING (in the gap after "Two,")
sfx.add(pan_st(ping(1120, 0.3), 0.4), c["sonar_end"] + 0.04, db(-16))          # ...ping? (after "sonar.")
# the crackle: every snap of the reef a tiny pop; under the words only its top
crk = np.zeros(N)
for i, tc in enumerate(c["crackles"]):
    p = filt(white(int(0.02 * SR), 100 + i), "bandpass", [1500, 9000]) * expdecay(int(0.02 * SR), 0.003)
    j = int(tc * SR)
    crk[j:j + len(p)] += p[:max(0, min(len(p), N - j))] * (0.6 + 0.4 * ((i * 7) % 5) / 4)
crk = crk / (np.abs(crk).max() + 1e-9)
crk_top = filt(crk, "highpass", 5200)
bed.add(pan_st(crk * PM + crk_top * (1 - PM), 0.1), 0.0, db(-15))
static = filt(white(int((END["navy"] - c["scrambled"]) * SR), 53), "highpass", 5400) * np.linspace(0.2, 1.0, int((END["navy"] - c["scrambled"]) * SR))
sfx.add(pan_st(fade(static, 0.1, 0.15), -0.4), c["scrambled"], db(-25))        # the scrambled sonar's hiss (top only)
for i in range(6):                                                             # a snare roll for 1943, low and soft
    sfx.add(pan_st(filt(snare(60 + i, 0.12), "lowpass", 240) + filt(snare(60 + i, 0.12), "highpass", 5200), 0), c["ww"] + 0.12 * i, db(-22))

# ================================================================= the button: the stand-off, the gulp, the loop
sfx.add(pan_st(edges(whoosh(0.3, 400, 2400, 61), 300, 5200), 0), SHOT["button"] - 0.2, db(-17))
sfx.add(pan_st(slide(196, 147, 0.3, 4.0, None, 7), -0.3), c["so"] + 0.66, db(-15))     # a western twang (in the pause after "So...")
sfx.add(pan_st(ratchet(0.3, 30, 10, 62, edges=True), 0.4), c["challenge"], db(-18))    # it cocks (edges: under the words)
sfx.add(pan_st(gulp(63), 0), c["snapoff_end"] + 0.06, db(-13))                         # his gulp
sfx.add(pan_st(whoosh(0.22, 400, 2200, 64, 0.5), 0), C["loop_in"] - 0.12, db(-22))     # into frame 1

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, c["this"] + 0.15, c["hot"] + 0.35, BPM, ["Em", "C"], gain=-7, seed=10, kick_on=False, snaps=False)
drone(mus, c["bang"] + 0.15, c["the_claw"] - 0.05, [40, 47, 52], cutoff=520, gain=-22, seed=3)        # the slow-motion hush
groove(mus, c["slams"] + 0.3, c["open_end"], BPM, ["Em", "C", "D", "B"], gain=-4, seed=20, kick_on=False)
drone(mus, c["then"], c["crushes"] + 0.25, [40, 46, 52, 55], cutoff=700, gain=-22, seed=5)          # the crush: suspense
drone(mus, c["nearly2"], c["degrees_end"], [45, 52, 57], cutoff=600, gain=-26, seed=6)
groove(mus, c["even"] + 0.12, c["named"], BPM, ["C", "G", "Am", "F"], gain=-5, seed=30, snaps=False)
groove(mus, c["two_end"] + 0.4, c["sonar"] - 0.05, 104, ["Em", "B"], gain=-5, seed=40, kick_on=True, snaps=False, arp=False)
groove(mus, c["never"] + 0.1, c["snapoff"] - 0.08, 88, ["Em", "B"], gain=-10, seed=50, kick_on=False, snaps=False, padv=False)
silence(mus, [(c["hot"] + 0.35, c["bang"] + 0.15), (c["the_claw"] - 0.05, c["slams"] + 0.3), (c["crushes"] + 0.25, c["nearly2"]),
              (c["degrees"] - 0.15, c["even"] + 0.12), (c["named"], c["ww"] + 0.1), (c["sonar"] - 0.05, c["never"] + 0.1),
              (c["snapoff"] - 0.08, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.5, "sfx": -8.0})
