"""Can You Make a W With Your FINGERS? 🖐️ Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()
c = C

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(creak=-24, pok=-17, glint=-24, strain=-25, whoosh=-22, shutter=-17, buzzer=-24, hmm=-22, card=-23, ding=-27,
         tick=-31, bubble=-24, sad=-23, scan=-30, spring=-24, stretch=-26, pop=-23, slam=-16, pew=-27, arrive=-25,
         thread=-25, hum=-27, zap=-26, bulbs=-25, snicker=-21, rim=-18, fizz=-27, cricket=-30, slow=-29, boing=-20)


def low_thud(seed=0, cut=220):
    """a heavy low thump, all of it under ~220 Hz (it can sit on a word)"""
    return filt(kick(1.0), "lowpass", cut)


def pok(seed=0):
    """a finger popping into place: a soft low knock (under 300 Hz) with a tiny tick on top (above 5 kHz)"""
    k = filt(kick(0.6), "lowpass", 300)[: int(0.16 * SR)]
    g = glint(6400 + 300 * (seed % 3), 0.05, seed)
    k[: len(g)] += 0.35 * g[: len(k)]
    return k * np.clip((len(k) - np.arange(len(k))) / (0.03 * SR), 0, 1)


# ================================================================= ambience: wind on the summit (under the speech band)
wind = filt(pink(N, 3), "lowpass", 380) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * tt + 0.4))
amb.x += pan_st(wind, -0.1) * 0.55
amb.x += pan_st(filt(white(N, 4), "highpass", 6200) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * tt)) ** 2, 0.3) * 0.03   # a thin whistle
flag = filt(filt(brown(N, 7), "highpass", 90), "lowpass", 220) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.9 * tt))
amb.x += pan_st(filt(flag, "lowpass", 260), 0.6) * 0.12                                          # the flag, far right
inside = gate(N, [(SHOT["own"] + 0.1, END["own"])])
amb.x += pan_st(filt(brown(N, 9), "lowpass", 170), 0) * 0.25 * inside                            # the scan's low hush

# ================================================================= the hook: one, TWO... one -- 1, 1, 2
sfx.add(pan_st(knuckle_crack(1, 2, 0.06, 1300.0, 0.5, edges=True), 0.2), 0.0, db(G["creak"]))    # frame 0: straining
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 2, 0.8), "lowpass", 260), 0), 0.0, db(-20))
sfx.add(pan_st(pok(10), 0.25), c["one1"] + 0.02, db(G["pok"]))                                     # the pointer pops out
bed.add(pan_st(glint(6600, 0.1, 11), 0.25), c["one1"] + 0.05, db(G["glint"]))                      # its badge
bed.add(pan_st(ratchet(0.7, 14.0, 30.0, 12, edges=True), 0.2), c["two"] + 0.05, db(G["strain"]))  # middle + ring pressed
bed.add(pan_st(glint(7000, 0.1, 13), 0.2), c["two"] + 0.05, db(G["glint"]))
bed.add(pan_st(glint(7400, 0.1, 14), 0.25), c["two"] + 0.14, db(G["glint"]))
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 15, 0.8), "lowpass", 300), 0.3), c["one2"] - 0.02, db(G["whoosh"]))  # pinky AND ring out
sfx.add(pan_st(pok(16), 0.3), c["one2"] + 0.06, db(G["pok"] - 2))
sfx.add(pan_st(shutter(), -0.2), c["one2_end"] + 0.02, db(G["shutter"]))                          # the selfie catches it
bed.add(pan_st(buzz_hi(0.2, 34.0, 17), 0.15), c["one2_end"] + 0.08, db(G["buzzer"]))               # BZZT (above 5.2 kHz: "Stuck?" stays clear)
sfx.add(pan_st(slide(260, 340, 0.3, vib=0.3, harm=5), 0.1), c["stuck_end"] + 0.03, db(G["hmm"]))  # stuck? hmm?
# the chat card pops up; the members pop in; a notification ding in the pause after "chat."
sfx.add(pan_st(filt(whoosh(0.3, 300, 1200, 17, 0.7), "lowpass", 320), -0.2), c["group"] - 0.12, db(G["card"]))
for i in range(4):
    bed.add(pan_st(glint(6000 + 380 * i, 0.08, 18 + i), -0.3 + 0.2 * i), c["group"] + 0.1 * i, db(G["glint"]))
sfx.add(pan_st(ding(88, 0.12, 22), -0.1), c["chat_end"] + 0.03, db(G["ding"]))
sfx.add(pan_st(ding(93, 0.12, 23), -0.1), c["chat_end"] + 0.13, db(G["ding"] - 2))

# ================================================================= the chat: BRAIN texts the pinky... and the ring reads it
bed.add(pan_st(glint(6800, 0.08, 30), -0.3), c["your_b"], db(G["glint"]))                       # BRAIN joins
for i in range(7):                                                                              # typing (ticks above 5 kHz)
    bed.add(pan_st(glint(5600 + 240 * (i % 3), 0.04, 31 + i), -0.25), c["brain1"] + 0.045 * i, db(G["tick"]))
bed.add(pan_st(glint(7600, 0.1, 40), -0.2), c["texts"] + 0.06, db(G["glint"]))                   # the message lands
sfx.add(pan_st(bloop(520, 900, 0.12), -0.2), c["pinky_end"] + 0.04, db(G["bubble"]))           # its sent-bloop, in the pause
sfx.add(pan_st(filt(whoosh(0.28, 200, 900, 41, 0.8), "lowpass", 300), 0.3), c["out"] - 0.04, db(G["whoosh"]))   # the pinky goes OUT
bed.add(pan_st(glint(6900, 0.08, 42), 0.3), c["out_end"] + 0.02, db(G["glint"]))                # seen by Pinky
bed.add(pan_st(glint(7300, 0.08, 43), 0.2), c["reads"] - 0.02, db(G["glint"]))                  # seen by... Ring
sfx.add(pan_st(filt(whoosh(0.28, 200, 900, 44, 0.8), "lowpass", 300), 0.3), c["reads"] + 0.0, db(G["whoosh"]))  # the ring goes too
sfx.add(pan_st(slide(330, 210, 0.26, vib=0.8, harm=5), 0.1), c["too_end"] + 0.03, db(G["sad"]))    # betrayed

# ================================================================= the own springs: the scan, four springs, MINE
bed.add(pan_st(buzz_hi(0.9, 26.0, 50), 0), SHOT["own"] + 0.05, db(G["scan"]))                     # the scan sweeps on
for i in range(4):                                                                              # a spring pops on each finger
    t0 = c["each"] + (c["has"] - c["each"]) * i / 3
    bed.add(pan_st(glint(5800 + 420 * i, 0.1, 51 + i), 0.1 + 0.1 * i), t0, db(G["spring"]))
    sfx.add(pan_st(filt(boing(0.12, 260.0 + 30 * i, 55 + i), "lowpass", 300), 0.1 + 0.1 * i), t0 + 0.02, db(G["spring"] + 2))
for i in range(4):                                                                              # MINE x4
    bed.add(pan_st(glint(7200 + 300 * i, 0.06, 60 + i), -0.3 + 0.2 * i), c["own"] - 0.06 + 0.09 * i, db(G["pop"]))
bed.add(pan_st(ratchet(0.5, 30.0, 12.0, 64, edges=True), 0.2), c["spreading"] - 0.02, db(G["stretch"]))   # all four stretch

# ================================================================= the brain: oversharing
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 70, 0.7), "lowpass", 300), -0.3), c["its"] - 0.14, db(G["card"]))    # the thought pops up
for i in range(10):                                                                             # thumbs on the phone
    bed.add(pan_st(glint(5700 + 200 * (i % 4), 0.035, 71 + i), -0.3), c["its"] + 0.15 + 0.07 * i, db(G["tick"]))
sfx.add(pan_st(low_thud(80), -0.2), c["over"] + 0.04, db(G["slam"]))                              # SEND TO ALL (low: on the word)
for i in range(4):                                                                              # four messages fly out...
    sfx.add(pan_st(pew(0.12, 81 + i, 3000 - 300 * i, 1200 - 150 * i), -0.2 + 0.2 * i), c["over_end"] + 0.02 + 0.05 * i, db(G["pew"]))
    bed.add(pan_st(glint(6400 + 350 * i, 0.07, 85 + i), 0.1 + 0.15 * i), c["over_end"] - 0.16 + 0.05 * i + 0.24, db(G["arrive"]))

# ================================================================= the nerve: they ALL run on ONE nerve... your funny bone
for i in range(4):                                                                              # four threads draw on
    bed.add(pan_st(glint(6000 + 300 * i, 0.1, 90 + i), 0.2), c["all"] + 0.08 * i, db(G["thread"]))
hum_n = int((c["nerve_end"] - c["one_n"] + 0.6) * SR)
hum = filt(np.sin(2 * np.pi * 110 * ar(hum_n)) + 0.5 * np.sin(2 * np.pi * 220 * ar(hum_n)), "lowpass", 240) * attack_decay(hum_n, 0.3, 0.5)
bed.add(pan_st(hum, 0.2), c["one_n"] - 0.1, db(G["hum"]))                                         # the one nerve hums on
sfx.add(pan_st(zap(0.3, 95, edges=True), 0.2), c["nerve"] + 0.05, db(G["zap"]))
for i in range(6):                                                                              # the marquee's bulbs light up
    bed.add(pan_st(glint(6800 + 150 * (i % 3), 0.05, 100 + i), -0.2 + 0.08 * i), c["funny"] + 0.04 * i, db(G["bulbs"]))
sfx.add(pan_st(snicker(110, 520.0, 3), 0.25), c["bone_end"] + 0.06, db(G["snicker"]))            # the jester: heh-heh-heh

# ================================================================= the sting: Hilarious.
sfx.add(rimshot(120), c["hil_end"] + 0.05, db(G["rim"]))                              # ba-dum tss
for i in range(6):                                                                              # the bulbs fizzle, one by one
    bed.add(pan_st(glint(5400 + 120 * i, 0.04, 121 + i), 0.0), c["hil_end"] + 0.1 + 0.1 * i, db(G["fizz"]))
sfx.add(pan_st(cricket(130, 2), 0.3), c["hil_end"] + 0.62, db(G["cricket"]))                      # one cricket on the summit

# ================================================================= the button: now try it SLOWER, and the loop
bed.add(pan_st(ratchet(c["slower_end"] - c["try"], 6.0, 4.0, 140, edges=True), 0.2), c["try"], db(G["slow"]))   # slow clicks
sfx.add(pan_st(boing(0.2, 300.0, 141), 0.2), c["slower_end"] + 0.05, db(G["boing"]))             # it all springs back
sfx.add(pan_st(knuckle_crack(142, 2, 0.06, 1300.0, 0.5, edges=True), 0.2), DUR - 0.3, db(G["creak"] - 2))   # straining again: the loop

# ================================================================= score (drops out for every punchline)
BPM = 112
# the mystery: a light pizzicato/marimba groove from "your fingers" (no score under the test and its fail)
groove(mus, c["your_f"] + 0.12, SHOT["own"] - 0.05, BPM, ["C", "Am", "F", "G"], gain=-6, seed=10, kick_on=False)
# inside the hand: half-time, thinner
groove(mus, c["part_end"] + 0.1, c["muscles_end"] + 0.05, BPM, ["Am", "F", "C", "G"], gain=-8, seed=20, kick_on=False, half=True, arp=False)
# the brain and the nerve: a tighter drive
groove(mus, c["its"] + 0.12, c["over"] - 0.05, BPM, ["Dm", "G"], gain=-9, seed=30, kick_on=False, snaps=True)
groove(mus, c["all"] + 0.1, c["bone"] - 0.05, BPM, ["Am", "Dm", "E", "Am"], gain=-8, seed=40, kick_on=False, snaps=True)
# the button: thin
groove(mus, c["now"] + 0.15, c["slower_end"] - 0.02, BPM, ["C", "G"], gain=-11, seed=50, kick_on=False, snaps=False)
silence(mus, [(c["too_end"] - 0.05, SHOT["own"] + 0.25),            # betrayed (the sad slide)
              (c["over"] - 0.05, SHOT["nerve"] + 0.3),               # SEND TO ALL and the four pews
              (c["bone"] - 0.05, c["now"] + 0.1),                    # your funny bone ... Hilarious ... ba-dum tss ... cricket
              (c["slower_end"] - 0.05, DUR)])                        # the spring back, into the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": -8.0}, duck={"music": 0.74})
