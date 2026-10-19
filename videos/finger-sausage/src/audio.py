"""Why Is There a SAUSAGE Between Your Fingers? 🌭 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.
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

SFX_LEVEL = -14.0   # the whole sfx bus (house: -5); the gags against each other are in G
# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(arrive=-22, boop=-24, focus=-25, bloop=-19.3, glow=-27, pop=-17.3, horn=-17.3, tag=-27, dive=-23, crt=-27, slideA=-24,
         boing=-21.1, click=-22, rail=-24, clunk=-18.6, shrug=-21, push=-25, shimmer=-27, tada=-20.6, wink=-24, squeak=-19.8,
         scoot=-20.8, poof=-18.7, wah=-24.1, double=-19.6, ding=-22, blip=-26, shh=-21.1, drawer=-23, spring=-17.4, slam=-15.6,
         rattle=-25, lift=-23)


def thud_low(seed=0, f=70.0):
    """a heavy landing heard through the floor: all of it under ~250 Hz (it can sit on a word; mono, 0.3 s)"""
    n = int(0.3 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def tick_hi(seed=0, dur=0.07):
    """a tiny dry flick, almost all of it above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * expdecay(n, 0.012)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0005, 0.01)


def puff(seed=0, dur=0.16):
    """a soft puff of smoke: a breath of noise, low and high only (mono)"""
    n = int(dur * SR)
    y = filt(pink(n, seed), "lowpass", 380) + 0.5 * filt(white(n, seed + 1), "highpass", 5400)
    y *= attack_decay(n, 0.01, 0.07)
    return fade(y / (np.abs(y).max() + 1e-9), 0.002, 0.04)


def trim(y, dur):
    """cut a sound to dur seconds with a short fade (so its tail never rings into the next word)"""
    n = int(dur * SR)
    y = y[..., :n].copy()
    k = min(int(0.04 * SR), y.shape[-1])
    y[..., -k:] *= np.linspace(1, 0, k)
    return y


# ================================================================= ambience: the night bus, the brain's room
bus_spans = [(0, SHOT["room"] + 0.55), (SHOT["wink"] - 0.05, SHOT["button"] + 0.05), (SHOT["loop"] - 0.05, DUR)]
amb.x += bus_hum(N, 3) * 0.9 * gate(N, bus_spans)
room_on = gate(N, [(SHOT["room"] + 0.45, SHOT["wink"]), (SHOT["button"], SHOT["loop"])])
amb.x += pan_st(filt(brown(N, 7), "lowpass", 160), 0) * 0.5 * room_on

# ================================================================= the hook: fingertips together, look PAST them
bed.add(pan_st(filt(whoosh(0.16, 600, 9000, 11, 0.9), "highpass", 5200), 0), 0.0, db(G["arrive"]))   # frame 0: the hands are up
bed.add(pan_st(glint(6800, 0.08, 12), 0), C["together"] + 0.04, db(G["boop"]))                # the tips touch: boop
bed.add(pan_st(glint(8000, 0.06, 13), 0), C["together"] + 0.09, db(G["boop"] - 3))
sfx.add(pan_st(filt(whoosh(0.3, 500, 6000, 14, 0.8), "highpass", 4800), 0), SHOT["pov"] - 0.12, db(-25))   # into his eyes (on "and")
bed.add(pan_st(ratchet(0.4, 30.0, 70.0, 15, edges=True), 0), C["past"] - 0.05, db(G["focus"]))   # the focus pulls to the far side
sfx.add(pan_st(bloop(260, 520, 0.24), 0), C["them_end"] + 0.03, db(G["bloop"]))              # the sausage appears (in the gap)
for i, f in enumerate((5600, 6400, 7300)):                                                  # and shimmers
    bed.add(pan_st(glint(f, 0.08, 16 + i), -0.2 + 0.2 * i), C["them_end"] + 0.12 + 0.05 * i, db(G["glow"]))

# ================================================================= the answer: that floating sausage? congrats... seeing double
for i, f in enumerate((6100, 6900)):                                                        # the outline lights up (quiet, on words)
    bed.add(pan_st(glint(f, 0.07, 20 + i), 0), C["floating"] + 0.05 + 0.08 * i, db(G["glow"]))
sfx.add(pan_st(cork_pop(21, 700.0), -0.5), C["congrats_end"] - 0.02, db(G["pop"]))          # the party popper, after "Congrats..."
sfx.add(pan_st(trim(party_horn(0.2, 22, 460.0), 0.2), -0.4), C["congrats_end"] + 0.03, db(G["horn"]))
bed.add(pan_st(glint(6000, 0.06, 23), -0.4), C["you_are"] + 0.06, db(G["tag"]))           # LEFT EYE pops on
bed.add(pan_st(glint(7200, 0.06, 24), 0.4), C["you_are"] + 0.31, db(G["tag"]))            # RIGHT EYE

# ================================================================= the room: each eye from its own side; the views split; STACK
sfx.add(pan_st(filt(whoosh(0.8, 200, 900, 30, 0.8), "lowpass", 320), 0), SHOT["room"] - 0.05, db(G["dive"]))   # the dive (low)
bed.add(pan_st(filt(tv_static(0.12, 31), "highpass", 5200), -0.4), C["each"] - 0.1, db(G["crt"] - 3))   # the screens come on
bed.add(pan_st(glint(5900, 0.12, 32), -0.4), C["each"] - 0.05, db(G["crt"]))
bed.add(pan_st(glint(6300, 0.12, 33), 0.4), C["sees"] - 0.05, db(G["crt"]))
bed.add(pan_st(filt(whoosh(0.5, 900, 7000, 34, 0.7), "highpass", 4800), 0), C["look2"] + 0.05, db(G["slideA"]))   # the fingers slide apart
sfx.add(pan_st(trim(boing(0.2, 210.0, 35), 0.2), 0), C["split_end"] + 0.02, db(G["boing"]))   # after "split.": boing
sfx.add(pan_st(key_click(36), 0.3), C["stacks"] - 0.06, db(G["click"]))                     # the brain hits STACK
bed.add(pan_st(ratchet(0.36, 40.0, 70.0, 37, edges=True), 0), C["stacks"], db(G["rail"]))   # the monitors run along the rail
sfx.add(pan_st(thud_low(38), 0), C["stacks"] + 0.36, db(G["clunk"]))                        # CLUNK (low: it sits on "them")
sfx.add(pan_st(slide(330, 262, 0.22, vib=0.6, harm=5), 0.2), C["anyway_end"] + 0.02, db(G["shrug"]))   # the shrug, after "anyway..."
sfx.add(pan_st(filt(whoosh(0.4, 200, 700, 39, 0.8), "lowpass", 300), 0), C["anyway_end"] - 0.05, db(G["push"]))   # the push in
for i in range(5):                                                                          # the overlap glows (on the line: above 5 kHz)
    bed.add(pan_st(glint(5500 + 450 * i, 0.07, 40 + i), -0.3 + 0.15 * i), C["overlap"] + 0.08 * i, db(G["shimmer"]))
for i, m in enumerate((72, 76, 79)):                                                        # ta-da, in the pause after "sausage."
    sfx.add(pan_st(piano(mtof(m), 0.3, 45 + i, 1.1), 0.1), C["sausage2_end"] + 0.03 + 0.06 * i, db(G["tada"] - 2))
sfx.add(pan_st(piano(mtof(84), 0.34, 48, 1.1), 0.1), C["sausage2_end"] + 0.21, db(G["tada"]))

# ================================================================= the payoff: close one eye... sausage gone
sfx.add(pan_st(whoosh(0.22, 400, 2400, 50, 0.8), 0), SHOT["wink"] - 0.18, db(-26))
for i, f in enumerate((5600, 6400, 7200)):                                                  # the wink sparkles (after the word)
    bed.add(pan_st(glint(f, 0.08, 51 + i), -0.2), C["eye3_end"] + 0.0 + 0.04 * i, db(G["wink"]))
sfx.add(pan_st(squeak(0.12, 1500, 2100), 0.5), C["eye3_end"] + 0.06, db(G["squeak"]))       # the granny scoots away down the bench
sfx.add(pan_st(filt(whoosh(0.3, 300, 1800, 54, 0.7), "lowpass", 1400), 0.6), C["eye3_end"] + 0.12, db(G["scoot"]))
sfx.add(pan_st(puff(55), 0), C["gone_s"] - 0.15, db(G["poof"]))                              # the sausage goes poof (in the pause)
sfx.add(pan_st(trim(wahwah(56), 0.6), 0.1), C["gone_end"] + 0.03, db(G["wah"]))              # after "gone.": wah-wah

# ================================================================= the weirdest fact: everything behind your phone is double
sfx.add(pan_st(whoosh(0.24, 400, 2400, 60, 0.8), 0), SHOT["phone"] - 0.2, db(-26))
bed.add(pan_st(filt(whoosh(0.6, 1200, 8000, 61, 0.7), "highpass", 5000), 0), C["everything"] - 0.05, db(G["slideA"]))   # the room goes double
sfx.add(pan_st(ding(84, 0.06, 62, 1.3), -0.4), C["double2_end"] + 0.0, db(G["double"]))     # ding-ding: double (a short gap)
sfx.add(pan_st(ding(84, 0.05, 63, 1.3), 0.4), C["double2_end"] + 0.065, db(G["double"] - 1))
bed.add(pan_st(blip(900, 1400, 0.06, 64, 0.02), -0.5), C["brain3"] - 0.08, db(G["blip"]))   # the brain's window pops open
sfx.add(pan_st(trim(shush(0.5, 65), 0.5), -0.4), C["mention_end"] + 0.04, db(G["shh"]))     # SHH!, after "it."

# ================================================================= the button: hiding sausages your whole life
sfx.add(pan_st(filt(whoosh(0.5, 200, 900, 70, 0.8), "lowpass", 400), 0), SHOT["button"] - 0.25, db(-25))
sfx.add(pan_st(creak(0.3, 71, 90, 200), 0), C["hiding"] - 0.12, db(G["drawer"]))            # the drawer slides open (low creak)
sfx.add(pan_st(trim(boing(0.2, 260.0, 72), 0.2), 0.3), C["sausages"] + 0.7, db(G["spring"]))   # a sausage springs out (after the word)
bed.add(pan_st(ratchet(0.12, 60.0, 80.0, 73, edges=True), 0), C["life_end"] - 0.02, db(G["rattle"]))   # shoved shut
sfx.add(pan_st(thud_low(74, 60.0), 0), C["life_end"] + 0.12, db(G["slam"]))                  # SLAM
bed.add(pan_st(jingle(0.3, 75, 30), 0.3), C["life_end"] + 0.16, db(-28))                     # the lamps rattle
sfx.add(pan_st(filt(whoosh(0.5, 300, 2400, 76, 0.7), "highpass", 1200), 0), DUR - 0.55, db(G["lift"]))   # the hands rise into frame 0

# ================================================================= score (drops out for every punchline)
BPM = 112
CH = ["C", "Am", "F", "G"]
# his view: a light pizzicato/marimba groove from after the sausage appears (no score under the instruction)
groove(mus, C["them_end"] + 0.25, C["double1_end"] + 0.3, BPM, CH, gain=-7, seed=10, kick_on=False)
# the room: fuller, from "Each eye"
groove(mus, C["each"] + 0.35, C["sausage2_end"], BPM, CH, gain=-5, seed=20, arp=True)
# the phone: a sneaky walk
groove(mus, C["right_now"] + 0.3, C["mention_end"], BPM, ["Am", "Dm", "E", "Am"], gain=-7, seed=30, kick_on=False, snaps=True)
# the button: thinner, out before the slam
groove(mus, C["hiding"] + 0.3, C["life_end"] - 0.1, BPM, ["F", "C"], gain=-9, seed=40, kick_on=False, snaps=False)
silence(mus, [(C["sausage1_end"] - 0.05, C["you_are"] + 0.15),     # congrats, deadpan
              (C["and_the"] - 0.12, C["and_the"] + 0.2),           # a snap sat on "and"
              (C["split_end"] - 0.05, C["stack"] + 0.3),            # boing
              (C["stacks"] - 0.1, C["stacks"] + 0.6),               # STACK, CLUNK
              (C["anyway_end"] - 0.05, C["tips2"]),                 # the shrug
              (C["double2_end"] - 0.05, C["brain3"] + 0.25),        # ding-ding
              (C["life_end"] - 0.1, DUR)])                          # the slam, into the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -15.5, "sfx": SFX_LEVEL}, duck={"music": 0.8})
