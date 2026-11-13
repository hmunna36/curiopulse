"""Dinosaurs Are Older Than FLOWERS Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The score: a bouncy marimba groove in the flowering glade (F major, 116 bpm) that comes back for the button and the loop;
a falling drone while the clock rewinds; a lazy, hazy groove in the Jurassic valley; a bright fanfare-groove when the
valley bursts into bloom; a dreamy pad on the time road. It drops out for every punchline (the CHOMP, the T. rex's stomp,
"than to Stegosaurus!", "Tiny arms.").
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
G = dict(whoosh=-21, sniff=-17, snort=-15, pop=-22, glint=-28, step=-17, bigstep=-12, stamp=-14, swish=-24, chomp=-10,
         chew=-22, rewind=-27, ff=-27, ding=-20, sparkle=-27, rustle=-24, flap=-25, sad=-19, tweet=-30, buzz=-33)


def low_whoosh(dur, seed, cut=340):
    """a move of the camera, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def top_only(x, f=5200.0):
    """keep what is above f: a sound that can sit under a word"""
    return filt(x, "highpass", f)


def dino_step(seed=0, f=70.0, big=1.0):
    """a heavy footfall: a low thud (the body sits round 300-600 Hz so a phone hears it) and a dusty scuff"""
    n = int(0.42 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * (f + 40 * np.exp(-t / 0.05)) * t) * np.exp(-t / (0.09 * big))
    body = filt(filt(white(n, seed), "lowpass", 900), "highpass", 260) * np.exp(-t / 0.05) * 0.5
    scuff = filt(white(n, seed + 1), "highpass", 2500) * np.exp(-t / 0.03) * 0.15
    return fade(y + body + scuff, 0.001, 0.05)


def snort(seed=0):
    """a big nostril blast (the T. rex sniffing the flowers): a rush of air that cuts off"""
    n = int(0.36 * SR)
    t = ar(n)
    env = np.minimum(1.0, t / 0.03) * np.exp(-np.maximum(0, t - 0.06) / 0.09)
    return fade(filt(filt(white(n, seed), "bandpass" if False else "lowpass", 1800), "highpass", 250) * env, 0.002, 0.04)


def rewind_tape(dur, seed=0, up=False):
    """a tape spooling (the YEARS AGO counter): a chattering whir that climbs (fast-forward) or falls (rewind); above 5 kHz"""
    x = ratchet(dur, 30.0 if not up else 20.0, 60.0 if not up else 70.0, seed, edges=True, f=6400.0)
    return x


# ================================================================= ambience: the flowering glade, the Jurassic valley, the road
glade_on = gate(N, [(0, SHOT["answer"]), (SHOT["rex"], SHOT["closer"]), (SHOT["button"], DUR)], smooth=0.04)
jur_on = gate(N, [(SHOT["answer"], SHOT["rex"])], smooth=0.06)
road_on = gate(N, [(SHOT["closer"], SHOT["button"])], smooth=0.05)
breeze = filt(pink(N, 1), "lowpass", 300) * (0.65 + 0.35 * np.sin(2 * np.pi * 0.21 * tt) * np.sin(2 * np.pi * 0.13 * tt + 1))
amb.x += pan_st(breeze, -0.15) * 0.6 * glade_on
amb.x += pan_st(top_only(white(N, 2), 6500.0) * 0.03 * (0.6 + 0.4 * np.sin(2 * np.pi * 7.0 * tt)), 0.35) * glade_on   # insects
amb.x += pan_st(filt(brown(N, 3), "lowpass", 120), 0.0) * 0.7 * jur_on                                                 # the volcano's far rumble
amb.x += pan_st(filt(pink(N, 4), "lowpass", 260) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.17 * tt)), 0.2) * 0.55 * jur_on    # warm, humid air
amb.x += pan_st(top_only(white(N, 5), 7200.0) * 0.022 * (0.5 + 0.5 * np.sin(2 * np.pi * 11.0 * tt)), -0.4) * jur_on    # a dragonfly's buzz
amb.x += pan_st(filt(brown(N, 6), "lowpass", 140), 0.0) * 0.45 * road_on
for t0_, t1_, sd in ((SHOT["closer"] + 0.1, c["and3"] - 0.06, 7), (c["you_end"] + 0.2, c["than"] - 0.14, 8)):
    if t1_ > t0_ + 0.08:
        crickets(t0_, t1_, sfx, db(-31), seed=sd, f=4700, rate=2.0)
# birds (avian dinosaurs!) chirp in the glade's pauses
for tb, sd in ((c["older_end"] + 0.01, 1), (c["flowers_end"] + 0.12, 2), (c["everywhere_end"] - 0.05, 3), (c["then_end"] + 0.1, 4)):
    sfx.add(pan_st(tweet(sd, 3400.0 + 300 * sd), 0.5 - 0.3 * (sd % 2)), tb, db(G["tweet"]))

# ================================================================= hook: the T. rex sniffing the bouquet; the snort on "dinosaurs..."
bed.add(pan_st(sniff(0.24, 10, edges=True), 0.3), 0.02, db(G["sniff"]))                           # frame 1: sniff (top, on the word)
bed.add(pan_st(filt(sniff(0.2, 11), "lowpass", 300), 0.3), 0.02, db(G["sniff"] + 2))              # (and its low half)
for k, ts in enumerate((0.95, 1.65)):
    bed.add(pan_st(sniff(0.2, 12 + k, edges=True), 0.35), ts, db(G["sniff"] - 2))
sfx.add(pan_st(snort(13), 0.3), c["dinos"] + 0.05, db(G["snort"]))                                 # the snort (on "dinosaurs")
bed.add(pan_st(top_only(crumple(0.4, 14), 5000.0), 0.1), c["dinos"] + 0.1, db(G["rustle"]))        # petals flutter (top)
sfx.add(pan_st(ding(84, 0.18, 15), 0.0), c["flowers_end"] + 0.06, db(G["ding"]))                   # ding? (the question, in the gap)

# ================================================================= answer: whip; the counter rewinds; the flowers shrink away
sfx.add(pan_st(whoosh(0.3, 300, 2600, 20, 0.9), -0.4), SHOT["answer"] - 0.3, db(G["whoosh"]))       # the whip (in the pause)
sfx.add(pan_st(filt(L.whoosh(0.5, 90, 300, 21, 0.7), "lowpass", 260), 0.0), SHOT["answer"] + 0.02, db(G["whoosh"] + 3))
bed.add(pan_st(rewind_tape(c["land"] - c["rewind"], 22), 0.25), c["rewind"], db(G["rewind"]))     # the counter rewinding (top)
bed.add(pan_st(glint(6400, 0.07, 23), -0.3), c["tag_dino"], db(G["glint"] + 3))                   # the tags pop (top)
bed.add(pan_st(glint(6900, 0.07, 24), 0.3), c["tag_flower"], db(G["glint"] + 3))
for k in range(7):                                                                                # the flowers sink: little pops (top)
    tk = c["rewind"] + 0.25 + (c["tag_flower"] - c["rewind"] - 0.2) * k / 7
    bed.add(pan_st(top_only(blip(3200 - 200 * k, 1800 - 100 * k, 0.06, 25 + k), 2600.0), -0.5 + 0.15 * k), tk, db(G["pop"]))
sfx.add(pan_st(filt(kick(0.9), "lowpass", 240), 0.0), c["land"], db(-17))                       # the counter lands (low)
sfx.add(pan_st(ding(77, 0.2, 26), 0.1), c["land"] + 0.02, db(G["ding"] - 2))

# ================================================================= green: the Stego plods in; NO FLOWERS; he looks round; the sniff
ph_steps = []
tk = c["amble"] + 0.15
while tk < c["one_end"] + 0.2:
    ph_steps.append(tk)
    tk += 0.6
for k, ts in enumerate(ph_steps):
    sfx.add(pan_st(dino_step(30 + k, 62.0, 1.0), 0.4 - 0.05 * k), ts, db(G["step"] - (2 if k % 2 else 0)))
sfx.add(pan_st(filt(kick(1.0), "lowpass", 230), 0.0), c["never"] + 0.02, db(G["stamp"]))          # the stamp lands (low)
bed.add(pan_st(top_only(lock_snap(40), 5000.0), 0.0), c["never"] + 0.03, db(G["stamp"] - 8))      # (its slap, top)
for k, key in enumerate(("look1", "look2", "look3")):                                            # his head whips round (top)
    bed.add(pan_st(top_only(whoosh(0.16, 1800, 6000, 41 + k, 0.7), 4200.0), 0.5 * (-1) ** k), c[key], db(G["swish"]))
bed.add(pan_st(sniff(0.3, 44, edges=True), 0.3), c["sniff"], db(G["sniff"] - 1))                  # the Stego sniffs (top)
sfx.add(pan_st(fade(slide(mtof(72), mtof(79), 0.16, vib=0.0, top=2600), 0.004, 0.04), 0.3), c["green2_end"] + 0.04, db(G["ding"]))   # hm? (gap)

# ================================================================= eat: CHOMP (hitstop); chewing
sfx.add(pan_st(whoosh(0.22, 300, 2200, 50, 0.9), 0.3), SHOT["eat"] - 0.18, db(G["whoosh"] - 2))
sfx.add(pan_st(chomp(51), 0.2), c["chomp"], db(G["chomp"]))
_th = c["chomp"] + 0.05                                                                          # the hitstop (CAMERA["hit"]): a layered hit
sfx.add(pan_st(filt(snap(52), "highpass", 1800), 0.0), _th, db(-20))
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-17))
sfx.add(cymbal(53, 0.45), _th + 0.01, db(-31))
bed.add(pan_st(top_only(crumple(0.5, 54), 4800.0), 0.2), c["chomp"] + 0.04, db(G["rustle"] + 2))  # the paper (top)
tk, k = c["chew"], 0
while tk < SHOT["rex"] - 0.15:
    bed.add(pan_st(top_only(crumple(0.12, 60 + k), 5000.0), 0.3), tk, db(G["chew"]))             # munch munch (top: on the words)
    bed.add(pan_st(filt(chomp(70 + k), "lowpass", 320), 0.3), tk, db(G["chew"] + 2))              # (and low)
    tk += 0.19
    k += 1

# ================================================================= rex: fast-forward; the valley bursts into bloom; STOMP (hitstop)
sfx.add(pan_st(whoosh(0.3, 280, 2600, 80, 0.9), 0.5), SHOT["rex"] - 0.26, db(G["whoosh"]))
bed.add(pan_st(rewind_tape(c["trex_end"] - c["ff"], 81, up=True), -0.2), c["ff"], db(G["ff"]))     # fast-forward (top)
for k in range(9):                                                                                # the bloom: sparkles climbing (top)
    tk = c["bloom"] + 0.08 * k
    bed.add(pan_st(glint(5600 + 220 * k, 0.07, 82 + k), -0.6 + 0.15 * k), tk, db(G["sparkle"]))
for k, ts in enumerate((c["ff"] + 0.5, c["ff"] + 0.95, c["stomp"] - 0.5)):                       # its footsteps, getting closer (low)
    if ts < c["stomp"] - 0.2:
        sfx.add(pan_st(dino_step(90 + k, 52.0, 1.3), 0.6 - 0.15 * k), ts, db(G["bigstep"] - 6 + 2 * k))
sfx.add(pan_st(dino_step(95, 46.0, 1.8), 0.2), c["stomp"], db(G["bigstep"]))                       # STOMP
_th = c["stomp"] + 0.05                                                                           # the hitstop: a layered hit
sfx.add(pan_st(filt(snap(96), "highpass", 1800), 0.0), _th, db(-21))
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-17))
bed.add(pan_st(filt(L.whoosh(0.6, 120, 500, 97, 0.6), "lowpass", 600), 0.2), c["stomp"] + 0.05, db(-22))   # the dust (low)
bed.add(pan_st(sniff(0.3, 98, edges=True), 0.3), c["everywhere"] - 0.1, db(G["sniff"] - 2))         # it sniffs a blossom (top)

# ================================================================= closer: whip up to the road; the brackets pop; the sad Stego
sfx.add(pan_st(whoosh(0.3, 300, 2800, 100, 0.9), -0.3), SHOT["closer"] - 0.24, db(G["whoosh"]))
bed.add(pan_st(top_only(glint(6000, 0.1, 101), 4500.0), 0.3), c["br_you"] + 0.02, db(G["glint"] + 4))
sfx.add(pan_st(ding(81, 0.14, 102), 0.3), c["you_end"] + 0.02, db(G["ding"]))                      # ding (gap after YOU)
bed.add(pan_st(top_only(whoosh(0.3, 1500, 6000, 103, 0.7), 4200.0), -0.2), c["br_stego"] - 0.1, db(G["swish"]))   # the pull back (top)
bed.add(pan_st(top_only(whoosh(0.18, 2000, 6500, 104, 0.7), 4200.0), 0.0), c["stego2"] - 0.08, db(G["swish"]))  # the T. rex turns (top)
sfx.add(pan_st(wahwah(105), -0.4), c["stego2_end"] + 0.03, db(G["sad"]))                           # wah-wah: the far, sad Stego (gap)

# ================================================================= button: "So..."; the offer (paper rustle); TINY ARMS (flap flap)
sfx.add(pan_st(filt(L.whoosh(0.4, 120, 500, 110, 0.7), "lowpass", 400), 0.0), SHOT["button"] + 0.02, db(G["whoosh"]))
bed.add(pan_st(top_only(crumple(0.3, 111), 5000.0), 0.1), c["offer"], db(G["rustle"]))
bed.add(pan_st(sniff(0.26, 112, edges=True), 0.3), c["offer"] + 0.3, db(G["sniff"] - 1))
tk, k = c["flail"], 0
while tk < c["arms_end"] + 0.05:
    bed.add(pan_st(top_only(squeak(0.05, 2600 + 300 * (k % 2), 3300), 2400.0), 0.45), tk, db(G["flap"]))   # little arms flapping
    tk += 0.075
    k += 1

# ================================================================= score (drops out for every punchline)
GLADE = ["F", "C", "Dm", "Bb"]
groove(mus, 0.12, SHOT["answer"] - 0.06, 116, GLADE, gain=-2, seed=10, cutoff=1500)
drone(mus, SHOT["answer"] + 0.1, c["land"], [65, 60, 57, 53], cutoff=900, gain=-23, seed=11)             # the rewind: falling, hazy
groove(mus, SHOT["green"] + 0.05, c["sniff"] - 0.1, 92, ["Dm", "Am", "Bb", "C"], gain=-5, seed=12, kick_on=False, cutoff=1100)   # the Jurassic: lazy
groove(mus, c["bloom"], c["stomp"] - 0.06, 128, ["F", "Bb", "C", "F"], gain=-2, seed=13, cutoff=1700)    # the bloom: bright
groove(mus, c["stomp"] + 0.3, SHOT["closer"] - 0.05, 128, ["Bb", "C", "F", "F"], gain=-4, seed=14, cutoff=1600)
drone(mus, SHOT["closer"] + 0.05, c["stego2"] - 0.05, [53, 60, 65, 69], cutoff=1000, gain=-24, seed=15)   # the time road: dreamy
groove(mus, SHOT["button"] + 0.3, c["flail"] - 0.06, 116, GLADE, gain=-3, seed=16, cutoff=1400)          # back in the glade
groove(mus, SHOT["loop"], DUR, 116, GLADE, gain=-2, seed=10, cutoff=1500)                                 # the loop (the hook's groove)
silence(mus, [(c["sniff"] - 0.1, SHOT["rex"]),                 # the sniff, CHOMP, the hitstop, chewing
              (c["stomp"] - 0.06, c["stomp"] + 0.3),            # STOMP
              (c["stego2"] - 0.05, SHOT["button"] + 0.3),       # "than to Stegosaurus!", wah-wah
              (c["flail"] - 0.06, SHOT["loop"])])               # "Tiny arms."

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": -12.0}, duck={"music": 0.74})
