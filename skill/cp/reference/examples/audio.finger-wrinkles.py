"""Finger-wrinkles Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized here (numpy/scipy); the only recorded sound is the narration.
"""
import json
import os
import sys

import numpy as np

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




# ---------------------------------------------------------------- ambience
bath_on = np.zeros(N)
for sid in ("raisins", "purpose", "meh", "final"):
    i0, i1 = span(SHOT[sid], END[sid])
    bath_on[i0:i1] = 1
i0, i1 = span(SHOT["grip"], c["idea"] - 0.15)
bath_on[i0:i1] = 1
bath_on = np.convolve(bath_on, np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")
room = pan_st(filt(brown(N, 1), "lowpass", 220), 0) * 0.3 + np.stack([filt(pink(N, s), "bandpass", [300, 2500]) for s in (2, 3)]) * 0.05
lap = np.stack([filt(pink(N, s), "bandpass", [200, 900]) for s in (4, 5)]) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * tt))
amb.x += (room + 0.25 * lap) * bath_on
r_ = np.random.default_rng(6)
tk = 0.3
while tk < DUR:  # a leaky faucet, only audible in the bathroom shots
    k_ = int(tk * SR)
    if bath_on[min(k_, N - 1)] > 0.5:
        amb.add(drip(int(tk * 10), r_.uniform(1300, 1700)), tk, db(-10) * bath_on[k_], pan=-0.6)
    tk += r_.uniform(1.1, 2.3)
# underwater / inside beds
under = np.zeros(N)
for a_, b_ in ((0.26, c["stay"] + 1.9), (SHOT["proof"], END["proof"]), (c["dive_back"], DUR)):
    i0, i1 = span(a_, b_)
    under[i0:i1] = 1
under = np.convolve(under, np.ones(int(0.1 * SR)) / int(0.1 * SR), "same")
amb.x += pan_st(filt(brown(N, 7), "lowpass", 160) * 0.6, 0) * under
amb.add(np.stack([gurgle(END["hook"] - 0.3, 8, 22), gurgle(END["hook"] - 0.3, 9, 22)]) * 0.5, 0.3)
amb.add(np.stack([gurgle(END["proof"] - SHOT["proof"], 10, 8), gurgle(END["proof"] - SHOT["proof"], 11, 8)]) * 0.35, SHOT["proof"])
inside = np.zeros(N)
i0, i1 = span(SHOT["pores"], END["buckle"])
inside[i0:i1] = 1
inside = np.convolve(inside, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same")
flow = filt(pink(N, 12), "bandpass", [80, 400]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt))
amb.x += pan_st(flow * inside, 0) * 0.9

# ================================================================= the hook
sfx.add(pan_st(whoosh(0.28, 300, 2400, 20, 0.9), 0), 0.0, db(-12))
sfx.add(np.stack([splash(0.9, 21), splash(0.9, 22)]), 0.25, db(-4))
sfx.add(bloop(170, 50, 0.6), 0.28, db(-8))
ticking(0.6, 2.1, sfx, db(-20), 6, 26, 30)
n = int(1.5 * SR)
ffw = glide(400, 1800, 1.5, 1.4) * 0.25 + filt(pink(n, 31), "bandpass", [1500, 5000]) * np.linspace(0.3, 1, n) * 0.3
sfx.add(pan_st(fade(ffw * np.linspace(0.2, 1, n), 0.05, 0.05), 0), 0.6, db(-22))
sfx.add(np.stack([splash(0.7, 32, 0.6), splash(0.7, 33, 0.6)]), 2.02, db(-18))
for k in range(6):
    sfx.add(drip(40 + k, 1400 + 60 * k), 2.6 + k * 0.33, db(-22), pan=(-1) ** k * 0.4)
n = int((c["into_end"] - 2.3) * SR)
sus = glide(700, 900, n / SR, 1) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * ar(n))) * np.linspace(0, 1, n) ** 2
sfx.add(pan_st(fade(sus, 0.05, 0.03), 0), 2.3, db(-30))

# ================================================================= "...raisins."
rz = c["raisins"]
sfx.add(pan_st(slide_whistle(0.28, 1800, 700), 0.4), rz - 0.27, db(-20))
sfx.add(thump(0.5, 160, 70, 0.1), rz, db(-8))
sfx.add(springs(50, 0.9), rz + 0.01, db(-15), pan=0.4)
for k in range(2):
    sfx.add(thump(0.25, 170, 90, 0.05), rz + 0.2 + k * 0.17, db(-18 - 5 * k), pan=0.4)

# ================================================================= the myth, NOPE
for k in range(6):
    sfx.add(drip(60 + k, 1200 + 90 * k), c["soaks"] - 0.1 + k * 0.28, db(-20), pan=-0.5 + 0.2 * k)
sfx.add(pan_st(whoosh(0.3, 500, 2600, 61, 0.8), np.linspace(0.8, 0, int(0.3 * SR))), c["sponge"] - 0.45, db(-15))
sfx.add(pan_st(squelch(0.6, 62), 0), c["sponge"] - 0.1, db(-14))
sfx.add(pan_st(squelch(0.35, 63), 0), c["chuckle"] + 0.1, db(-20))
nt = c["nope"]
sfx.add(pan_st(buzzer(0.45), 0), c["nope_end"] + 0.02, db(-13))
sfx.add(thump(0.5, 130, 50, 0.12), nt - 0.03, db(-9))
sfx.add(pan_st(squelch(0.4, 64), 0), nt + 0.05, db(-16))

# ================================================================= on purpose
n = int((END["purpose"] - c["purpose"] + 0.2) * SR)
hum = buzz(n, 120, 70, 0.3) * (0.6 + 0.4 * (np.sin(2 * np.pi * 7 * ar(n)) > -0.6))
sfx.add(pan_st(fade(hum, 0.02, 0.1), 0.3), c["purpose"] - 0.05, db(-30))
sfx.add(pan_st(whoosh(0.5, 300, 3000, 71, 0.85), 0), c["purpose"] - 0.45, db(-17))
sfx.add(thump(0.8, 100, 34, 0.3), c["purpose"], db(-8))
for j, m in enumerate((74, 81, 86)):
    sfx.add(bell(mtof(m), 1.4, 0.5) * 0.5, c["purpose"] + 0.02 + j * 0.04, db(-24), pan=(j - 1) * 0.3)

# ================================================================= inside the fingertip
sfx.add(pan_st(whoosh(0.6, 3000, 200, 80, 0.7, 0.8), 0), SHOT["pores"] - 0.35, db(-12))
sfx.add(bloop(120, 45, 0.7), SHOT["pores"] + 0.05, db(-10))
sfx.add(np.stack([gurgle(1.6, 81, 26), gurgle(1.6, 82, 26)]), c["seeps"], db(-23))
for k in range(5):
    sfx.add(blip(900 - 80 * k, 600 - 60 * k, 0.07, 83 + k, 0.03), c["sweat"] + 0.1 + k * 0.12, db(-24), pan=-0.6 + 0.3 * k)
n = int(0.9 * SR)
zipo = glide(700, 2400, 0.9, 0.8) * 0.4 + crackle(n, 1500, 84, 1500, 8000) * 0.6
sfx.add(pan_st(fade(filt(zipo, "highpass", 2500) * np.linspace(1, 0.3, n), 0.01, 0.1), np.linspace(0.2, -0.9, n)), c["nerves"], db(-19))
zipb = glide(2400, 900, 1.1, 0.8) * 0.4 + crackle(int(1.1 * SR), 1500, 85, 1500, 8000) * 0.6
sfx.add(pan_st(fade(filt(zipb, "highpass", 2500) * np.linspace(0.4, 1, int(1.1 * SR)), 0.01, 0.1), np.linspace(-0.9, 0.5, int(1.1 * SR))), c["tell"], db(-20))
sq = c["squeeze"]
sfx.add(pan_st(creak(0.7, 86, 90, 200, (500, 1100, 2200)), 0), sq - 0.05, db(-15))
sfx.add(pan_st(fade(glide(320, 110, 0.6, 0.7) * attack_decay(int(0.6 * SR), 0.02, 0.3), 0.01, 0.05), 0), sq, db(-14))
n = int(2.0 * SR)
hiss_ = filt(white(n, 90), "bandpass", [700, 3000]) * np.linspace(1, 0.1, n) ** 1.5
sfx.add(pan_st(fade(hiss_, 0.05, 0.1), 0), c["less"], db(-24))
sfx.add(pan_st(fade(glide(500, 150, 1.8, 0.6) * np.linspace(0.8, 0.1, int(1.8 * SR)), 0.02, 0.1), 0), c["volume"] - 0.3, db(-26))
sfx.add(np.stack([crumple(0.8, 91), crumple(0.8, 92)]), c["buckles"] - 0.1, db(-13))
sfx.add(thump(0.4, 120, 60, 0.1), c["buckles"] + 0.25, db(-12))

# ================================================================= grape -> raisin
sfx.add(blip(600, 900, 0.1, 100, 0.05), SHOT["grape"] + 0.05, db(-16))
sfx.add(pan_st(squelch(0.45, 101), 0), c["raisin2"] - 0.02, db(-19))
sfx.add(pan_st(fade(glide(900, 300, 0.4, 0.8) * attack_decay(int(0.4 * SR), 0.01, 0.2), 0.005, 0.05), 0), c["raisin2"], db(-18))
sfx.add(np.stack([crumple(0.5, 102), crumple(0.5, 103)]), c["raisin2"] + 0.05, db(-21))

# ================================================================= proof
sfx.add(pan_st(whoosh(0.35, 400, 2400, 110, 0.8), 0), SHOT["proof"] - 0.3, db(-20))
sfx.add(bell(mtof(88), 0.9, 0.3) * 0.5, c["know"] + 0.32, db(-24))
n = int(0.9 * SR)
fizz_ = crackle(n, np.linspace(2500, 50, n), 111, 2000, 9000) * np.linspace(1, 0, n)
sfx.add(pan_st(fade(fizz_, 0.01, 0.05), -0.3), c["damaged"] + 0.1, db(-20))
sfx.add(pan_st(fade(glide(600, 200, 0.5) * np.linspace(0.6, 0, int(0.5 * SR)), 0.01, 0.05), -0.3), c["nerves2"], db(-24))
for j, m in enumerate((91, 98)):
    sfx.add(bell(mtof(m), 0.8, 0.2) * 0.5, c["dont"] + 0.2 + j * 0.06, db(-22), pan=-0.4)
sfx.add(pan_st(whoosh(0.3, 600, 2800, 112, 0.8), np.linspace(0.8, 0.3, int(0.3 * SR))), c["doctors"] - 0.25, db(-17))
for k in range(4):
    sfx.add(pen_tick(113 + k), c["doctors"] + 0.35 + 0.2 * k, db(-14 - (0 if k else 2)), pan=0.5)
    sfx.add(blip(1600 if k else 400, 1600 if k else 300, 0.06, 117 + k, 0.02), c["doctors"] + 0.38 + 0.2 * k, db(-24), pan=0.5)

# ================================================================= grip
sfx.add(pan_st(slide_whistle(0.4, 500, 1100), 0.3), c["bother"] - 0.15, db(-21))
tA = c["idea"] - 0.15
n = int((c["wrinkles"] - 0.1 - tA) * SR)
rain = np.stack([filt(pink(n, 120 + s_), "bandpass", [2000, 9000]) for s_ in (0, 1)]) * 0.5
sfx.add(fade(rain, 0.05, 0.1), tA, db(-18))
n = int(1.2 * SR)
skid = svf_bp(pink(n, 121), 900 + 500 * np.sin(2 * np.pi * 3 * ar(n)), 0.3)
sfx.add(pan_st(fade(skid / (np.abs(skid).max() + 1e-9) * np.linspace(1, 0.3, n), 0.05, 0.1), 0), tA + 0.25, db(-20))
sfx.add(pan_st(engine(1.2, 122) * 0.6, 0), tA + 0.6, db(-22))
sfx.add(pan_st(whoosh(0.35, 2400, 300, 123, 0.6), 0), c["wrinkles"] - 0.3, db(-15))
sfx.add(np.stack([gurgle(2.2, 124, 30), gurgle(2.2, 125, 30)]), c["pushing"] - 0.3, db(-25))

# ================================================================= meh: the studies, then the soap
sfx.add(pan_st(whoosh(0.3, 800, 3000, 130, 0.8), np.linspace(-0.6, 0, int(0.3 * SR))), c["helps"] - 0.4, db(-17))
sfx.add(thump(0.3, 180, 90, 0.06), c["helps"] - 0.1, db(-12))
for j, m in enumerate((84, 88, 91)):
    sfx.add(bell(mtof(m), 0.8, 0.25) * 0.5, c["helps"] - 0.05 + j * 0.05, db(-23), pan=-0.4)
sfx.add(pan_st(whoosh(0.3, 800, 3000, 131, 0.8), np.linspace(0.6, 0, int(0.3 * SR))), c["another"] - 0.2, db(-17))
sfx.add(thump(0.3, 150, 80, 0.06), c["meh"] - 0.02, db(-12))
sfx.add(pan_st(wahwah(132), 0.2), c["meh"] + 0.52, db(-14))
tS = c["sigh"] - 0.25
sfx.add(pan_st(squeak(0.13, 1700, 2600), -0.4), tS + 0.25, db(-16))
sfx.add(pan_st(whoosh(0.55, 500, 2500, 133, 0.6), np.linspace(-0.5, 0.6, int(0.55 * SR))), tS + 0.3, db(-15))
sfx.add(bonk(), tS + 0.85, db(-6), pan=0.5)
sfx.add(pan_st(squeak(0.12, 1100, 1600) + 0.3 * filt(white(int(0.12 * SR), 134), "bandpass", [800, 3000]), 0.5), tS + 0.9, db(-14))
sfx.add(pan_st(squeak(0.1, 1250, 1750), 0.5), tS + 1.06, db(-17))
for k in range(3):
    sfx.add(bell(mtof(96 + 3 * k), 0.5, 0.15) * 0.4, tS + 1.0 + k * 0.18, db(-26), pan=0.5)

# ================================================================= the same pattern, every time
p0 = SHOT["pattern"]
sfx.add(pan_st(whoosh(0.35, 2400, 400, 140, 0.6), 0), p0 - 0.3, db(-20))
n = int(1.1 * SR)
for a_ in (c["found"] - 0.3, c["exact"] - 0.4):
    sc_ = glide(600, 1600, 1.1, 1.0) * 0.3 * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 12 * ar(n))))
    sfx.add(pan_st(fade(sc_, 0.05, 0.1), 0), a_, db(-28))
sfx.add(shutter(), c["found"] + 0.3, db(-12), pan=-0.4)
sfx.add(pan_st(whoosh(0.4, 3000, 500, 141, 0.5), 0), c["back"] - 0.25, db(-19))
sfx.add(np.stack([splash(0.5, 142, 0.5), splash(0.5, 143, 0.5)]), c["back"] + 0.15, db(-27))
for k in range(8):
    sfx.add(blip(1800 + 120 * k, 2000 + 120 * k, 0.03, 144 + k, 0.01), c["exact"] + 0.3 + k * 0.07, db(-28), pan=0.3)
for j, m in enumerate((84, 88, 91, 96)):
    sfx.add(bell(mtof(m), 1.2, 0.35) * 0.5, c["exact"] + 0.9 + j * 0.05, db(-27), pan=(j - 1.5) * 0.3)
for k, rt in enumerate((c["every"] - 0.1, c["every"] + 0.25, c["time"] + 0.2, c["time"] + 0.55)):
    sfx.add(blip(1200 + 200 * k, 1600 + 200 * k, 0.08, 150 + k, 0.03), rt, db(-18), pan=-0.4 + 0.25 * k)

# ================================================================= snow tires, then back into the water
for k in range(2):
    sfx.add(thump(0.25, 180, 90, 0.05), c["raisin3"] - 0.1 + k * 0.05, db(-16), pan=(-1) ** k * 0.4)
    sfx.add(springs(160 + k, 0.5) * 0.6, c["raisin3"] - 0.08 + k * 0.05, db(-20), pan=(-1) ** k * 0.4)
sfx.add(pan_st(engine(1.1, 161), 0), c["tires_end"] - 0.25, db(-15))
sfx.add(np.stack([jingle(1.4, 162), jingle(1.4, 163)]), c["snow"] - 0.05, db(-22))
db_ = c["dive_back"]
sfx.add(pan_st(whoosh(0.35, 400, 2600, 170, 0.9), 0), db_ - 0.3, db(-12))
sfx.add(np.stack([filt(splash(0.9, 171), "lowpass", 9000), filt(splash(0.9, 172), "lowpass", 9000)]), db_, db(-6))
sfx.add(bloop(170, 50, 0.6), db_ + 0.03, db(-8))

# generic whooshes on cuts without their own transition sound
for wi, (sid, f_lo, f_hi) in enumerate((("raisins", 2400, 400), ("myth", 300, 2000), ("buckle", 500, 2000), ("grape", 2200, 400),
                                         ("meh", 300, 2000), ("final", 2400, 400))):
    sfx.add(pan_st(whoosh(0.28, f_lo, f_hi, 500 + wi), 0), SHOT[sid] - 0.2, db(-18))


# ================================================================= score
BPM = 112
groove(mus, 0.55, 2.15, BPM, ["F", "Bb"], gain=-3, seed=10, kick_on=False, snaps=False, padv=False, sixteen=True)
drone(mus, 2.15, c["into_end"], [65, 72, 77], 2200, -27, 11, 0.8)
bwomp(mus, c["raisins"], 34, -12)
groove(mus, SHOT["myth"] + 0.05, c["chuckle"], BPM, ["F", "Bb", "C", "F"], gain=-3, seed=20)
drone(mus, SHOT["purpose"], END["purpose"], [50, 57, 64], 900, -25, 30, 0.8)
crash(mus, c["purpose"], -22, 31)
groove(mus, SHOT["pores"], c["buckles"] + 0.2, BPM, ["Dm", "Bb", "F", "C"], gain=-3, seed=40, snaps=False)
drone(mus, c["squeeze"], c["buckles"] + 0.2, [38, 45], 400, -24, 41, 0.5)
bwomp(mus, c["raisin2"] + 0.02, 31, -13)
for k in range(int((SHOT["grip"] - SHOT["proof"]) / (60 / 104))):     # sneaky detective walk (after the question)
    tb = c["know"] + 0.45 + k * 60 / 104
    if tb > c["doctors"] - 0.1:
        break
    mus.add(pizz(mtof([38, 41, 45, 44, 43, 41, 40, 41][k % 8]), 0.35, 200 + k) * 1.3, tb, db(-17))
    if k % 2:
        mus.add(snap(300 + k), tb, db(-20), pan=0.3)
for j, m in enumerate((53, 57, 60, 65)):
    mus.add(pad([mtof(m + 12)], 2.2, 0.02, 2600, 210 + j), c["doctors"] + 0.3, db(-24), pan=(j - 1.5) * 0.3)
groove(mus, c["idea"] - 0.15, SHOT["meh"], 120, ["F", "C", "Bb", "C"], gain=-2, seed=60)
groove(mus, SHOT["meh"], c["meh"], BPM, ["Bb", "F"], gain=-5, seed=70, kick_on=False)
groove(mus, SHOT["pattern"] + 0.3, c["exact"] + 0.2, 120, ["Am", "F", "G", "Am"], gain=-4, seed=80, snaps=False, sixteen=True, cutoff=2200)
drone(mus, c["exact"] + 0.2, SHOT["final"] + 0.3, [60, 64, 67, 72], 2400, -23, 81, 0.2)
groove(mus, SHOT["final"], c["dive_back"], BPM, ["F", "Bb", "C", "F"], gain=-6, seed=90)
crash(mus, c["snow"], -20, 91)
crash(mus, c["dive_back"], -20, 92)
for j, m in enumerate((53, 60, 65, 69)):
    mus.add(pad([mtof(m)], 1.6, 0.01, 1800, 95 + j), c["dive_back"], db(-21), pan=(j - 1.5) * 0.3)
# comedy stops: the score drops out for the "Nope" beat, the "meh" payoff and "Science."
for a_, b_ in ((c["chuckle"], c["nope_end"] + 0.5), (c["meh"] + 0.02, SHOT["pattern"] + 0.25), (c["into_end"], c["raisins"] - 0.02)):
    i0, i1 = span(a_, b_)
    mus.x[:, i0:i1] *= 0

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
