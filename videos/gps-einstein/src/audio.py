"""Your Phone's GPS Needs EINSTEIN Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The score: a curious synth groove at the lake (D minor, 112 bpm) that comes back for the loop; a cold space drone; the
groove dragged to half speed for "Dragging"; the groove back up in orbit; a light pizzicato on the jetty; a slow 1970s
drone with a computer's beeps for 1977. It drops out for every punchline (FASTER, Dragging, tiny?, A DAY, He wasn't).
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

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(whoosh=-21, glint=-28, poof=-16, whir=-26, ding=-19, wub=-24, tock=-20, tick=-29, tap=-16, wah=-17, pop=-22,
         step=-22, err=-30, hm=-19, splash=-12, bloop=-21, beep=-30, buzz=-19, slap=-22, clunk=-13, power=-20, cricket=-31)


def low_whoosh(dur, seed, cut=340):
    """a move of the camera, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def top_only(x, f=5200.0):
    """keep what is above f: a sound that can sit under a word"""
    return filt(x, "highpass", f)


def tock(seed=0, f=180.0):
    """a heavy clock tock, all under the voice band (the slow clock down here)"""
    n = int(0.16 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.035) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t / 0.02)
    return fade(filt(y, "lowpass", 300), 0.001, 0.02)


def hum_wub(dur, f=55.0, rate=2.2):
    """gravity's low pull: a sine that throbs (under 160 Hz: it can sit under the words)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * f * t) * (0.6 + 0.4 * np.sin(2 * np.pi * rate * t)) + 0.4 * np.sin(2 * np.pi * f * 2 * t)
    return fade(filt(y, "lowpass", 160), 0.08, 0.15)


# ================================================================= ambience: the lake at dusk, orbit
lake_on = gate(N, [(0, SHOT["answer"]), (SHOT["drag"], SHOT["gain"]), (SHOT["payoff"], SHOT["weird"]), (SHOT["loop"], DUR)], smooth=0.04)
water = filt(pink(N, 1), "lowpass", 260) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.31 * tt) * np.sin(2 * np.pi * 0.17 * tt + 1))
amb.x += pan_st(water, -0.2) * 0.75 * lake_on
amb.x += pan_st(filt(brown(N, 2), "lowpass", 140), 0.2) * 0.35 * lake_on                       # the breeze, low
space_on = gate(N, [(SHOT["answer"], SHOT["drag"]), (SHOT["gain"], SHOT["payoff"]), (SHOT["weird"], SHOT["loop"])], smooth=0.04)
amb.x += pan_st(filt(brown(N, 3), "lowpass", 110), 0.0) * 0.6 * space_on                        # the station hum of space
amb.x += pan_st(filt(white(N, 4), "highpass", 7000) * 0.025 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * tt)), 0.3) * space_on
# crickets at dusk, in the pauses only
for t0_, t1_, sd in ((2.66, 3.02, 5), (19.0, 19.12, 6), (16.52, 16.73, 7)):
    crickets(t0_, t1_, sfx, db(G["cricket"]), seed=sd, f=4700, rate=2.0)

# ================================================================= hook: the phone, the beam to the satellite, EINSTEIN (the poof)
bed.add(pan_st(glint(6400, 0.06, 10), 0.3), 0.02, db(G["glint"]))                               # the map's ping on frame 1 (top)
for i in range(4):                                                                              # the beam climbs: little top blips
    bed.add(pan_st(glint(5600 + 350 * i, 0.05, 11 + i), 0.2 + 0.12 * i), c["beam"] + 0.12 * i, db(G["glint"] - 1))
bed.add(pan_st(top_only(riser(c["poof"] - c["beam"], 12, 500, 2600), 5200.0), 0.3), c["beam"], db(-30))
sfx.add(pan_st(filt(kick(1.0), "lowpass", 220), 0.0), c["poof"], db(G["poof"]))                 # POOF (low: it sits on the word)
bed.add(pan_st(top_only(crumple(0.35, 13), 5200.0), 0.0), c["poof"] + 0.01, db(G["poof"] - 8))  # the fluff (top)
for i in range(3):
    bed.add(pan_st(glint(6800 + 400 * i, 0.07, 14 + i), -0.3 + 0.3 * i), c["poof"] + 0.06 + 0.06 * i, db(G["glint"]))

# ================================================================= answer: whip up to orbit; the clock whirls on FASTER
sfx.add(pan_st(whoosh(0.3, 300, 2600, 20, 0.9), -0.4), SHOT["answer"] - 0.3, db(G["whoosh"]))   # the whip (in the pause)
sfx.add(pan_st(filt(L.whoosh(0.5, 90, 300, 21, 0.7), "lowpass", 260), 0.0), SHOT["answer"] + 0.02, db(G["whoosh"] + 3))
for i in range(5):
    bed.add(pan_st(glint(5800 + 500 * (i % 3), 0.08, 22 + i), -0.5 + 0.25 * i), c["space"] + 0.1 + 0.11 * i, db(G["glint"] - 1))
bed.add(pan_st(ratchet(c["faster_end"] - c["whirl"], 30.0, 60.0, 23, edges=True, f=6000.0), 0.3), c["whirl"], db(G["whir"]))   # the hands whirring (top)
_th = c["faster_end"] + 0.03                                                                     # the hitstop (CAMERA["hit"]): a layered hit
sfx.add(pan_st(filt(snap(51), "highpass", 1800), 0.0), _th, db(-20))
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-17))
sfx.add(cymbal(52, 0.45), _th + 0.01, db(-31))
sfx.add(pan_st(ding(84, 0.16, 24), 0.3), _th + 0.12, db(G["ding"]))                              # ding! (in the gap before "Gravity")

# ================================================================= gravity: the rings pull; the low clock tocks, the high one ticks
sfx.add(pan_st(low_whoosh(0.3, 30), 0.2), SHOT["gravity"] - 0.12, db(G["whoosh"]))
bed.add(pan_st(hum_wub(END["gravity"] - SHOT["gravity"] + 0.1), 0.0), SHOT["gravity"], db(G["wub"]))
for k in range(4):
    bed.add(pan_st(tock(31 + k, 150.0), -0.4), SHOT["gravity"] + 0.15 + 0.48 * k, db(G["tock"] - 2))   # slow, low (under the words)
tk = SHOT["gravity"] + 0.1
while tk < END["gravity"] - 0.05:
    bed.add(pan_st(glint(7400, 0.03, int(tk * 100)), 0.5), tk, db(G["tick"]))                          # fast, high (top)
    tk += 0.12

# ================================================================= drag: whip down; tock... tock; tap tap; Dragging -> waah
sfx.add(pan_st(whoosh(0.28, 260, 2200, 40, 0.9), 0.4), SHOT["drag"] - 0.18, db(G["whoosh"]))        # the whip (in the pause)
for k in range(5):
    bed.add(pan_st(tock(41 + k, 120.0), 0.0), SHOT["drag"] + 0.2 + 0.62 * k, db(G["tock"]))          # the second hand trudging (low)
for k in range(2):
    sfx.add(pan_st(glass_tink(42 + k, 3100.0, 0.08), 0.3), c["tap"] + 0.05 + 0.15 * k, db(G["tap"]))  # tap tap (in the pause)
sfx.add(pan_st(fade(slide(mtof(55), mtof(48), 0.3, vib=0.01, top=2200), 0.005, 0.06), 0.0), c["dragging_end"] + 0.02, db(G["wah"]))   # waah (in the gap)

# ================================================================= gain: whip up; the counter pops; three days roll
sfx.add(pan_st(whoosh(0.3, 300, 2600, 50, 0.9), -0.3), SHOT["gain"] - 0.24, db(G["whoosh"]))
bed.add(pan_st(glint(6200, 0.07, 51), 0.0), c["count"] + 0.02, db(G["glint"] + 3))               # the counter pops (top)
days_t = [c["days"] + (END["gain"] - 0.15 - c["days"]) * k / 3 for k in (1, 2, 3)]
for k, td in enumerate(days_t):
    bed.add(pan_st(top_only(whoosh(0.22, 2000, 7000, 52 + k, 0.6), 5000.0), 0.4 * (-1) ** k), td - 0.15, db(-28))
    bed.add(pan_st(glint(6000 + 500 * k, 0.06, 55 + k), 0.2), td, db(G["glint"] + 2))
sfx.add(pan_st(ding(88, 0.14, 58), 0.2), c["day_end"] + 0.05, db(G["ding"]))                    # ding (in the gap before "Sounds")

# ================================================================= payoff: tiny? (hm); the map pops; footsteps; the dot slides; A DAY -> SPLASH
sfx.add(pan_st(fade(slide(mtof(67), mtof(72), 0.18, vib=0.0, top=2400), 0.004, 0.04), 0.1), c["tiny_end"] + 0.02, db(G["hm"]))   # hm? (gap)
bed.add(pan_st(glint(5800, 0.06, 60), 0.0), c["map"], db(G["pop"]))                             # the map pops up (top)
sfx.add(pan_st(filt(bloop(160, 90, 0.18), "lowpass", 300), 0.0), c["map"], db(G["pop"]))       # (low)
tk, k = c["thats"] + 0.05, 0
while tk < c["step"]:
    bed.add(pan_st(filt(kick(0.7), "lowpass", 260), 0.2 * (-1) ** k), tk, db(G["step"]))           # boots on planks (low)
    tk += 0.36
    k += 1
bed.add(pan_st(buzz_hi(c["error_end"] - c["drift"], 31.0, 61), 0.2), c["drift"], db(G["err"]))  # the error buzz (top)
bed.add(pan_st(top_only(slide_whistle(c["splash"] - c["step"], 2600, 900), 3000.0), 0.0), c["step"], db(-26))   # the fall (top)
sfx.add(pan_st(splash(0.9, 62, 1.3), 0.2), c["splash"], db(G["splash"]))                       # SPLASH (in the gap)
_th = c["splash"] + 0.04                                                                        # the hitstop: a layered hit
sfx.add(pan_st(filt(snap(63), "highpass", 1800), 0.0), _th, db(-21))
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-18))
for k in range(2):
    sfx.add(pan_st(bloop(260 - 40 * k, 120, 0.12), 0.3), c["splash"] + 0.36 + 0.13 * k, db(G["bloop"]))   # blub blub
bed.add(pan_st(glint(6600, 0.06, 64), 0.4), c["splash"] + 0.42, db(G["glint"] + 3))             # the phone, high and dry (top)

# ================================================================= weird: whip to 1977; beeps; OFF (bzzt); the note slaps on
sfx.add(pan_st(whoosh(0.3, 280, 2400, 70, 0.9), 0.5), SHOT["weird"] - 0.26, db(G["whoosh"]))
bed.add(pan_st(top_only(L.crackle(int(5.2 * SR), 7.0, 71, 5400, 9000)), -0.3), SHOT["weird"] + 0.05, db(-31))   # old radio crackle (top)
tk, k = SHOT["weird"] + 0.3, 0
while tk < c["wrong_end"]:
    bed.add(pan_st(top_only(beep(5600 if k % 2 else 6400, 0.05), 5200.0), 0.4), tk, db(G["beep"]))   # the 1977 computer's beeps (top)
    tk += 0.42
    k += 1
sfx.add(pan_st(buzzer(0.14), 0.0), c["off_end"] + 0.02, db(G["buzz"]))                          # bzzt (in the pause after OFF)
bed.add(pan_st(top_only(page_rip(0.1, 72), 5000.0), 0.3), c["note"], db(G["slap"]))              # the note slaps on (top: on the word)

# ================================================================= button: He wasn't. -> CLUNK, the lamp powers up green
sfx.add(pan_st(filt(kick(1.0), "lowpass", 230), 0.0), c["flip"], db(G["clunk"]))                # CLUNK (low: on the word)
bed.add(pan_st(top_only(lock_snap(80), 5000.0), 0.0), c["flip"] + 0.005, db(G["clunk"] - 6))     # the switch's click (top)
sfx.add(pan_st(fade(slide(mtof(72), mtof(84), 0.2, vib=0.0, top=3000), 0.004, 0.05), 0.2), c["wasnt_end"] + 0.03, db(G["power"]))   # power up (gap)

# ================================================================= score (drops out for every punchline)
CURIOUS = ["Dm", "Bb", "F", "C"]
groove(mus, 0.12, SHOT["answer"] - 0.06, 112, CURIOUS, gain=-1, seed=10, cutoff=1500)
drone(mus, SHOT["answer"] + 0.1, c["faster"] - 0.08, [50, 57, 62, 65], cutoff=900, gain=-24, seed=11)    # orbit: cold, wide
drone(mus, SHOT["gravity"] + 0.05, END["gravity"], [38, 45, 50], cutoff=420, gain=-23, seed=12)          # gravity: heavy, low
groove(mus, SHOT["drag"] + 0.1, c["dragging"] - 0.06, 56, CURIOUS, gain=-5, seed=13, cutoff=900)         # the groove, dragged
groove(mus, c["up2"] + 0.08, c["day_end"], 112, CURIOUS, gain=-3, seed=14, cutoff=1500)                  # back up in orbit
groove(mus, c["thats"] + 0.1, c["a"] - 0.06, 120, ["F", "C", "Dm", "Bb"], gain=-4, seed=15, kick_on=False, arp=False, cutoff=1300)   # the jetty
drone(mus, SHOT["weird"] + 0.15, c["wrong_end"], [43, 50, 55, 58], cutoff=700, gain=-25, seed=16)        # 1977
groove(mus, SHOT["loop"], DUR, 112, CURIOUS, gain=-1, seed=10, cutoff=1500)                              # back at the lake (the loop)
silence(mus, [(c["faster"] - 0.08, SHOT["gravity"] + 0.05),     # FASTER, the hitstop, ding
              (c["dragging"] - 0.06, c["up2"] + 0.08),          # Dragging, waah
              (c["day_end"], c["thats"] + 0.1),                 # ding, "Sounds tiny?" hm
              (c["a"] - 0.06, SHOT["weird"] + 0.15),            # A DAY, the fall, SPLASH
              (c["wrong_end"], SHOT["loop"])])                  # the hush, "He wasn't.", CLUNK

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": -12.0}, duck={"music": 0.74})
