"""Why Is the Vulcan Salute So HARD? 🖖 Short: sound design, score and mix, cue-locked to timeline.json.

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
G = dict(creak=-24, sproing=-21, buzzer=-26, bonk=-18, flip=-21, glint=-23, pop=-21, heart=-26, glass=-23, pluck=-23,
         stretch=-25, twang=-23, dive=-21, clunk=-17, tada=-24, beep=-25, tick=-30, rows=-23, hmm=-22, thud=-18, sad=-23,
         clack=-17, motor=1.0, rustle=-26, lock=-18, drop=-24, ding=-24, deflate=-24, scratch=-24, letgo=-24, snap=-19)


def theremin(notes, t0, beat, gain, bus):
    """a 1960s sci-fi theremin: a sine that glides between notes, with a wide slow vibrato (on the music bus)"""
    for i, (m, b) in enumerate(notes):
        d = b * beat
        n = int((d + 0.12) * SR)
        t = ar(n)
        m0 = notes[i - 1][0] if i else m
        f = mtof(m0) + (mtof(m) - mtof(m0)) * (1 - np.exp(-t / 0.06))
        f = f * (1 + 0.018 * np.sin(2 * np.pi * 5.6 * t) * np.clip(t / 0.25, 0, 1))
        ph = 2 * np.pi * np.cumsum(f) / SR
        y = (np.sin(ph) + 0.18 * np.sin(2 * ph)) * attack_decay(n, 0.04, 0.35) if False else (np.sin(ph) + 0.18 * np.sin(2 * ph))
        y *= np.clip(t / 0.05, 0, 1) * np.clip((d + 0.12 - t) / 0.12, 0, 1)
        bus.add(pan_st(y * 0.6, 0.1), t0 + sum(bb for _, bb in notes[:i]) * beat, db(gain))


def low_thud(seed=0):
    """a heavy low thump, all of it under ~220 Hz (it can sit on a word)"""
    return filt(kick(1.0), "lowpass", 220)


# ================================================================= ambience: the living room by the TV, the brain, the lab, the studio
room_on = gate(N, [(0, SHOT["brain"] + 0.5), (SHOT["button"] - 0.05, DUR)])
amb.x += pan_st(filt(brown(N, 3), "lowpass", 240), 0) * 0.5 * room_on                         # the room
amb.x += pan_st(filt(white(N, 4), "highpass", 7000), 0.25) * 0.02 * room_on                    # the TV's faint hiss
amb.x += pan_st(filt(pad([mtof(45), mtof(52)], DUR, 1.0, 380, 7), "lowpass", 300), 0) * 0.25 * room_on if False else 0
brain_on = gate(N, [(SHOT["brain"] + 0.4, SHOT["lab"])])
amb.x += pan_st(filt(brown(N, 5), "lowpass", 170), 0) * 0.45 * brain_on                        # a low hush inside his head
lab_on = gate(N, [(SHOT["lab"], SHOT["studio"])])
amb.x += pan_st(filt(brown(N, 6), "lowpass", 300), 0) * 0.4 * lab_on                           # the lab's fans
studio_on = gate(N, [(SHOT["studio"], SHOT["button"])])
amb.x += pan_st(filt(brown(N, 8), "lowpass", 200), 0) * 0.5 * studio_on                        # the studio
motor = filt(np.sin(2 * np.pi * 100 * tt) + 0.4 * np.sin(2 * np.pi * 200 * tt), "lowpass", 240) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * tt))
amb.x += pan_st(motor * 0.05 * G["motor"], -0.4) * studio_on                                    # the old camera's motor

# ================================================================= the hook: the split goes wrong twice
sfx.add(pan_st(knuckle_crack(1, 2, 0.06, 1300.0, 0.5, edges=True), 0.2), 0.0, db(G["creak"]))     # frame 0: knuckles straining
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 2, 0.8), "lowpass", 260), 0), 0.0, db(-20))
sfx.add(pan_st(boing(0.14, 420.0, 3), 0.2), c["fingers1"] + 0.6, db(G["sproing"]))               # jazz hands (in the pause)
sfx.add(pan_st(buzzer(0.2), 0.2), c["two1"] + 0.28, db(G["buzzer"]))                             # NOPE: the little finger alone
sfx.add(pan_st(bonk(), 0.15), c["two2_end"] + 0.07, db(G["bonk"]))                              # they give up
sfx.add(pan_st(whoosh(0.3, 500, 2600, 5, 0.7), 0.2), c["cant_end"] + 0.02, db(G["flip"]))       # he turns it round
for k, key in enumerate(("middle", "ring1")):                                                    # the two fingers light up
    bed.add(pan_st(glint(6200 + 500 * k, 0.12, 10 + k), 0.2), c[key] + 0.05, db(G["glint"]))
for k in range(2):                                                                               # faces pop on the nails
    bed.add(pan_st(glint(7000 + 400 * k, 0.1, 12 + k), 0.25), c["holding"] + 0.04 + 0.09 * k, db(G["pop"]))
sfx.add(pan_st(marimba(mtof(84), 0.16, 14), 0.2), c["hands_end"] + 0.02, db(G["heart"]))          # the heart: two little notes
sfx.add(pan_st(marimba(mtof(88), 0.16, 15), 0.2), c["hands_end"] + 0.12, db(G["heart"]))
for i in range(10):                                                                              # the skin turns to glass
    bed.add(pan_st(glint(5500 + 300 * i, 0.12, 20 + i), -0.3 + 0.08 * i), c["under"] + 0.05 * i, db(G["glass"]))

# ================================================================= the cords and the strap
sfx.add(pan_st(filt(whoosh(0.6, 200, 900, 30, 0.8), "lowpass", 300), 0), SHOT["cords"] - 0.05, db(-21))
for k in range(4):                                                                               # the four cords: plucks
    bed.add(pan_st(filt(pizz(mtof(76 + 2 * k), 0.4, 31 + k), "highpass", 5000), -0.3 + 0.2 * k), c["cords"] + 0.05 + 0.06 * k, db(G["pluck"] + 3))
bed.add(pan_st(ratchet(0.7, 12.0, 30.0, 33, edges=True), 0.1), c["tied"], db(G["stretch"]))       # he tries again: it stretches
sfx.add(pan_st(boing(0.26, 240.0, 34), 0.1), c["strap_end"] + 0.03, db(G["twang"]))              # the strap: twang

# ================================================================= the brain: one order for both
sfx.add(pan_st(filt(whoosh(0.6, 150, 700, 40, 0.9), "lowpass", 280), 0), SHOT["brain"] + 0.05, db(G["dive"]))
sfx.add(pan_st(low_thud(41), 0), c["moves"] + 0.08, db(G["clunk"]))                               # the levers: clunk (low)
bed.add(pan_st(glint(5800, 0.1, 42), -0.2), c["moves"] + 0.1, db(G["glint"]))
sfx.add(pan_st(marimba(mtof(79), 0.14, 43), -0.1), c["team_end"] + 0.02, db(G["tada"]))           # TEAM: ta-da (short: the
sfx.add(pan_st(marimba(mtof(84), 0.16, 44), 0.1), c["team_end"] + 0.12, db(G["tada"] - 2))          # reverb tail must die before "In")
sfx.add(pan_st(low_thud(45), 0), c["team"] + 0.25, db(G["clunk"] - 4))                            # the levers swing again

# ================================================================= the lab
sfx.add(pan_st(beep(2600.0, 0.04), 0.1), c["team_end"] + 0.42, db(G["beep"]))                       # the monitor comes on
bed.add(pan_st(buzz_hi(c["dead"] - SHOT["lab"] - 0.4, 22.0, 50), 0.15) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.07 * ar(int((c["dead"] - SHOT["lab"] - 0.4) * SR)))) ** 2,
        SHOT["lab"] + 0.3, db(G["tick"]))                                                         # the glove's sensors as it wiggles
for i in range(5):                                                                                # the ranking pops in
    bed.add(pan_st(glint(5600 + 450 * i, 0.1, 51 + i), 0.3), c["theyre"] - 0.1 + 0.11 * i, db(G["rows"]))
bwomp(mus, c["alone_end"] + 0.05, m=33, gain=-10)                                                  # the worst two
sfx.add(pan_st(slide(260, 340, 0.3, vib=0.3, harm=5), 0.2), c["ringq_end"] + 0.03, db(G["hmm"]))  # "the ring finger?" hmm?
sfx.add(pan_st(low_thud(56), 0), c["dead"] + 0.08, db(G["thud"]))                                  # the stamp lands (low)
sfx.add(pan_st(slide(330, 196, 0.42, vib=0.9, harm=5), 0), c["last_end"] + 0.03, db(G["sad"]))    # dead last: a sad slide down

# ================================================================= the 1960s studio
sfx.add(pan_st(knuckle_crack(60, 1, 0.0, 2200.0, 0.8, edges=True), 0.1), SHOT["studio"] + 0.16, db(G["clack"]))   # the clapper
bed.add(pan_st(rustle(0.4, 61), -0.2), c["set"] - 0.2, db(G["rustle"]))                           # the other hand comes up
bed.add(pan_st(ratchet(0.9, 10.0, 26.0, 62, edges=True), 0.1), c["fingers3"] - 0.05, db(G["stretch"]))   # prising the fingers over
sfx.add(pan_st(lock_snap(63), 0.15), c["hand1_end"] + 0.03, db(G["lock"]))                         # the V clicks into place
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 64, 0.7), "lowpass", 300), -0.2), c["off"] - 0.05, db(G["drop"]))   # the hand ducks out
sfx.add(pan_st(ding(88, 0.15, 65), 0.15), c["camera_end"] + 0.03, db(G["ding"]))                  # perfect, on camera: ding
sfx.add(pan_st(slide(300, 180, 0.3, vib=0.4, harm=5), 0.15), c["camera_end"] + 0.36, db(G["deflate"]))   # ...and it creeps shut
sfx.add(pan_st(scratch(0.15, 66), 0), SHOT["button"] - 0.17, db(G["scratch"]))                    # caught

# ================================================================= the button and the loop
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 70, 0.7), "lowpass", 320), -0.2), c["you_end"] + 0.12, db(G["letgo"]))   # he lets go
sfx.add(pan_st(boing(0.2, 300.0, 71), 0.2), c["you_end"] + 0.33, db(G["snap"]))                   # the fingers spring back
sfx.add(pan_st(knuckle_crack(72, 2, 0.06, 1300.0, 0.5, edges=True), 0.2), DUR - 0.3, db(G["creak"] - 2))   # straining again: the loop

# ================================================================= score (drops out for every punchline)
BPM = 110
beat = 60 / BPM
# the mystery: a light pizzicato/marimba groove from "Your middle" (no score under the hook and its jokes)
groove(mus, c["your_mid"] + 0.12, SHOT["lab"] - 0.05, BPM, ["Am", "F", "C", "G"], gain=-6, seed=10, kick_on=False)
# the lab: half-time, thinner
groove(mus, c["in_lab"] + 0.15, c["alone_end"] - 0.02, BPM, ["Am", "Dm", "Am", "E"], gain=-8, seed=20, kick_on=False, half=True, arp=False)
# the 1960s studio: a retro sci-fi groove and a theremin
groove(mus, c["star"] + 0.1, c["camera_end"] + 0.1, BPM, ["Dm", "Bb", "C", "A"], gain=-11, seed=30, kick_on=False, snaps=True)
# the button: thin
groove(mus, c["other2"] + 0.05, c["you_end"] + 0.05, BPM, ["Am", "F"], gain=-10, seed=40, kick_on=False, snaps=False)
silence(mus, [(c["hands_end"] - 0.05, c["skin_end"] + 0.1),      # the heart, and "under your skin" (soft words)
              (c["strap_end"] - 0.05, SHOT["brain"] + 0.2),         # twang
              (c["team"] - 0.08, c["in_lab"] + 0.1),                # "team." (a soft word) and TEAM
              (c["ringq_end"] - 0.05, c["dead"] + 0.05),            # the ring finger? ... dead last
              (c["last_end"] - 0.05, SHOT["studio"] + 0.2),         # the sad slide
              (c["camera_end"] - 0.02, SHOT["button"] + 0.2),       # perfect... and it creeps shut
              (c["you_end"] + 0.05, DUR)])                          # the button's last beat, into the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": -8.0}, duck={"music": 0.74})
