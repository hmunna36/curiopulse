"""Brain-freeze Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
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


def st(sig):
    return pan_st(sig, 0)


# ================================================================= ambience
diner = gate(N, [(0, SHOT["name"]), (c["fh2"] - 0.07, END["twist"]), (SHOT["final"], DUR)])
room = st(filt(brown(N, 1), "lowpass", 240)) * 0.3 + np.stack([filt(pink(N, s), "bandpass", [250, 1400]) for s in (2, 3)]) * 0.04
fridge = st(buzz(N, 60, 4, 0.2)) * 0.05
rain = np.stack([filt(pink(N, s), "bandpass", [2500, 9000]) for s in (5, 6)]) * 0.05
amb.x += (room + fridge + rain) * diner * 0.5
icy = gate(N, [(SHOT["name"], END["fine"])])
wind = np.stack([svf_bp(pink(N, s), 500 + 300 * np.sin(2 * np.pi * 0.2 * tt + s), 0.6) for s in (7, 8)])
amb.x += wind / (np.abs(wind).max() + 1e-9) * 0.14 * icy
inside = gate(N, [(SHOT["how"], END["twist"] if c["fh2"] > END["twist"] else c["fh2"] - 0.07), (SHOT["fix"], END["fix"])], 0.2)
pulse = 0.55 + 0.45 * np.maximum(0, np.sin(2 * np.pi * 1.25 * tt)) ** 4
flow = st(filt(pink(N, 12), "bandpass", [70, 380]) * pulse) * 0.9
amb.x += flow * inside * 0.45
gym = gate(N, [(SHOT["kid"], END["result"])])
amb.x += (st(filt(brown(N, 13), "lowpass", 300)) * 0.25 + np.stack([filt(pink(N, s), "bandpass", [300, 2000]) for s in (14, 15)]) * 0.03) * gym * 0.5

# ================================================================= 1. hook: mid-slurp, then the forehead
sfx.add(st(whoosh(0.3, 300, 2400, 20, 0.9)), 0.0, db(-14))
sl = slurp(c["and_then"] + 0.2, 21)
sfx.add(st(filt(sl, "highpass", 900)), 0.0, db(-22))
for k in range(5):
    sfx.add(bloop(700 + 80 * k, 300, 0.12), 0.35 + k * 0.55, db(-26), pan=0.4)
sfx.add(blip(600, 1200, 0.1, 22, 0.04), c["one"] - 0.02, db(-22))
n = int((c["freezes"] - c["forehead"] + 0.1) * SR)
ris = glide(400, 1600, n / SR, 1.5) * np.linspace(0, 1, n) ** 2 * 0.4
sfx.add(st(fade(ris, 0.05, 0.01)), c["forehead"], db(-26))
sfx.add(st(filt(crackle(n, np.linspace(10, 400, n), 23, 3000, 9000), "highpass", 2500) * np.linspace(0, 1, n)), c["forehead"], db(-26))
# 2. FREEZES
fz = c["freezes"]
sfx.add(st(ice_crack(1.2, 24)), fz - 0.02, db(-5))
sfx.add(thump(0.8, 140, 40, 0.25), fz - 0.02, db(-7))
sfx.add(st(whoosh(0.25, 3000, 600, 25, 0.3)), fz - 0.2, db(-16))
for k in range(6):
    sfx.add(bell(mtof(96 + (k * 5) % 12), 0.6, 0.15) * 0.4, fz + 0.1 + k * 0.07, db(-26), pan=(-1) ** k * 0.5)

# ================================================================= 3. the deadpan
sfx.add(blip(1500, 1500, 0.06, 30, 0.03), c["fh1"] + 0.05, db(-22), pan=-0.4)
sfx.add(pan_st(slide_whistle(0.9, 700, 1500), 0.3), c["milkshake2"] + 0.1, db(-26))
sfx.add(blip(900, 1400, 0.08, 31, 0.04), c["mouth1"] + 0.02, db(-20), pan=0.5)
sfx.add(springs(32, 0.7), c["mouth1"] + 0.5, db(-17), pan=0.4)
sfx.add(cricket(33, 3), c["mouth1"] + 0.75, db(-24), pan=-0.6)
drp = SHOT["stare"] + 0.8
while drp < END["stare"] - 0.2:
    sfx.add(drip(int(drp * 10), 1500), drp, db(-26), pan=0.5)
    drp += 1.3

# ================================================================= 4-5. the name
sfx.add(st(whoosh(0.35, 2400, 400, 40, 0.6)), SHOT["name"] - 0.3, db(-15))
sfx.add(st(ice_crack(0.3, 41)), c["thats"] - 0.3, db(-20))
for j, m in enumerate((91, 96)):
    sfx.add(bell(mtof(m), 0.7, 0.2) * 0.4, c["doctors"] - 0.25 + j * 0.06, db(-28))
sfx.add(st(whoosh(0.3, 500, 2600, 42, 0.8)), c["doctors"] - 0.2, db(-18))
for word, t0, dur in (("sphen", c["sphen"], 1.1), ("gang", c["gang"], 1.2)):
    n_letters = 14 if word == "sphen" else 16
    for k in range(n_letters):
        sfx.add(pen_tick(50 + k + (20 if word == "gang" else 0)), t0 + k * dur / n_letters, db(-24), pan=0.2)
sfx.add(pan_st(slide_whistle(0.8, 1400, 500), -0.3), c["gang_end"] + 0.05, db(-22))
sfx.add(np.stack([crumple(0.5, 60), crumple(0.5, 61)]), c["sigh"] + 0.15, db(-17))
sfx.add(pan_st(whoosh(0.4, 600, 2400, 62, 0.7), np.linspace(0, 0.8, int(0.4 * SR))), c["sigh"] + 0.55, db(-19))
sfx.add(bonk(), c["lets"] + 0.85, db(-12), pan=0.7)
sfx.add(thump(0.5, 160, 60, 0.1), c["brain2"], db(-8))
sfx.add(st(ice_crack(0.5, 63)), c["brain2"] + 0.02, db(-20))

# ================================================================= 6. how: inside the head
sfx.add(st(whoosh(0.5, 3000, 200, 70, 0.7, 0.8)), SHOT["how"] - 0.45, db(-17))
sfx.add(bloop(120, 45, 0.5), SHOT["how"] - 0.1, db(-18))
n = int(1.4 * SR)
sfx.add(st(fade(filt(white(n, 71), "bandpass", [3000, 9000]) * np.linspace(1, 0.2, n), 0.05, 0.2)), c["cold"] + 0.1, db(-26))
sfx.add(st(ice_crack(0.6, 72)), c["roof"] + 0.15, db(-20))
for k in range(6):
    sfx.add(heartbeat(73 + k, 0.8), c["blood1"] + k * 0.42, db(-21), pan=0.1)
for k in range(8):
    sfx.add(blip(1400 + 150 * (k % 3), 1900, 0.05, 80 + k, 0.02), c["panic"] + 0.05 + k * 0.08, db(-24), pan=(-1) ** k * 0.5)
sfx.add(st(creak(0.3, 85, 90, 200, (500, 1100, 2200))), c["tight"] + 0.45, db(-22))
sfx.add(st(fade(glide(320, 110, 0.6, 0.7) * attack_decay(int(0.6 * SR), 0.02, 0.3), 0.01, 0.05)), c["tight"] + 0.4, db(-18))
sfx.add(st(whoosh(0.35, 300, 2600, 86, 0.8)), c["fling"] - 0.3, db(-14))
sfx.add(bloop(90, 40, 0.9), c["fling"], db(-8))
sfx.add(thump(0.6, 110, 40, 0.2), c["fling"] + 0.02, db(-9))

# ================================================================= 7. rush: the artery, the traces
n = int((c["rush_end"] - c["rushing"] + 0.8) * SR)
env = np.minimum(1, np.linspace(0, 3, n)) * np.linspace(1, 0.3, n)
rsh = np.stack([svf_bp(pink(n, 90 + s), np.linspace(300, 900, n), 0.6) for s in (0, 1)])
sfx.add(rsh / (np.abs(rsh).max() + 1e-9) * env * 0.6, c["rushing"] - 0.1, db(-23))
sfx.add(shutter(), c["study"] + 0.55, db(-19), pan=-0.3)
n = int((c["rush_end"] + 0.3 - c["blood2"]) * SR)
u = np.linspace(0, 1, n)
env_b = np.where((u > 0.12) & (u < 0.88), np.sin(np.pi * np.clip((u - 0.12) / 0.76, 0, 1)) ** 0.7, 0)
beep = np.sin(2 * np.pi * np.cumsum(500 + 700 * env_b) / SR) * (0.5 + 0.5 * (np.sin(2 * np.pi * 6 * ar(n)) > 0))
sfx.add(st(fade(beep * 0.25, 0.02, 0.05)), c["blood2"] - 0.2, db(-30))
for j, m in enumerate((84, 88, 91)):
    sfx.add(bell(mtof(m), 1.0, 0.3) * 0.5, c["rush"] + 0.05 + j * 0.05, db(-24), pan=(j - 1) * 0.3)

# ================================================================= 8. why: warm blood... overdoes it
sfx.add(thump(0.4, 170, 80, 0.08), c["scientists"] - 0.03, db(-14))
n = int(2.2 * SR)
sfx.add(st(fade(filt(pink(n, 100), "lowpass", 900) * np.linspace(0, 1, n) ** 0.5, 0.2, 0.3)), c["flooding"], db(-22))
sfx.add(bell(mtof(88), 0.8, 0.3) * 0.5, c["protect"] + 0.05, db(-25), pan=0.4)
n = int((c["overdoes"] - c["itjust"]) * SR)
sfx.add(st(fade(filt(creak(n / SR, 101, 60, 140, (400, 900, 1700)), "lowpass", 700) * np.linspace(0.1, 1, n) ** 2, 0.05, 0.02)), c["itjust"], db(-26))
sfx.add(st(klaxon(0.4, 102)), c["overdoes_end"] + 0.02, db(-20))
sfx.add(st(fade(filt(white(int(1.3 * SR), 103), "bandpass", [2000, 7000]) * np.linspace(1, 0, int(1.3 * SR)) ** 2, 0.01, 0.2)), c["overdoes_end"] + 0.1, db(-24))

# ================================================================= 9. twist: the nerve, the wrong spot
n = int((c["face"] + 0.5 - c["travels"]) * SR)
zp = glide(500, 2200, n / SR, 0.8) * 0.4 + crackle(n, 1200, 110, 1500, 8000) * 0.5
sfx.add(pan_st(fade(filt(zp, "highpass", 1200) * 0.8, 0.02, 0.1), np.linspace(0.6, -0.6, n)), c["travels"], db(-24))
ring = np.concatenate([bell(1400, 0.08, 0.05) for _ in range(8)])
for k in range(2):
    sfx.add(st(ring) * 0.5, c["brain4"] + k * 0.5, db(-26))
sfx.add(pan_st(whoosh(0.3, 2600, 400, 111, 0.6), 0.3), c["wrong"] - 0.25, db(-18))
sfx.add(thump(0.4, 200, 90, 0.07), c["wrong"] + 0.12, db(-12), pan=0.3)
sfx.add(st(buzzer(0.4)), c["fh2"] - 0.45, db(-17))
sfx.add(st(scratch(0.3, 112)), c["fh2"] - 0.1, db(-18))
sfx.add(cricket(113, 3), c["fh2"] + 0.6, db(-24), pan=-0.5)

# ================================================================= 10-11. the kid's experiment
sfx.add(st(whoosh(0.3, 400, 2400, 120, 0.8)), SHOT["kid"] - 0.3, db(-20))
for j, m in enumerate((72, 76, 79, 84)):
    sfx.add(bell(mtof(m), 1.0, 0.35) * 0.5, c["kid"] + 0.02 + j * 0.07, db(-21), pan=(j - 1.5) * 0.3)
sfx.add(thump(0.4, 170, 80, 0.08), c["tested"] + 0.05, db(-11))
sfx.add(st(whoosh(0.3, 2400, 400, 121, 0.6)), c["icecream"] - 0.25, db(-16))
clock_ticks(c["five"], c["five"] + 0.9, sfx, db(-22))
ticking(c["five"], c["five"] + 0.9, sfx, db(-22), 12, 24, 122)
for k in range(5):
    sfx.add(bloop(260 - 20 * k, 90, 0.18), c["five"] + 0.15 + k * 0.16, db(-17), pan=-0.5)
sfx.add(st(slurp(0.6, 123)), c["five"] + 0.1, db(-21))
tk_ = c["thirty"] + 0.6
while tk_ < SHOT["result"]:
    sfx.add(pen_tick(int(tk_ * 13)), tk_, db(-22), pan=0.5)
    tk_ += 0.5
fzL = c["gulpers"]
sfx.add(st(filt(ice_crack(0.6, 130), "highpass", 4500)), fzL + 0.02, db(-17))
for k, (a_, b_) in enumerate(((600, 1400), (500, 900))):
    sfx.add(st(fade(glide(a_, b_, 0.5, 0.8) * 0.3, 0.02, 0.1)), c["twice"] - 0.05 + k * 0.05, db(-26))
sfx.add(thump(0.4, 180, 90, 0.06), c["twice"] + 0.28, db(-12))
sfx.add(st(whoosh(0.3, 500, 2600, 131, 0.8)), c["published"] - 0.35, db(-16))
sfx.add(thump(0.6, 120, 45, 0.18), c["published"] - 0.03, db(-9))
sfx.add(thump(0.4, 170, 80, 0.08), c["published"] + 0.4, db(-12))

# ================================================================= 12. fix
sfx.add(st(whoosh(0.5, 3000, 200, 140, 0.7, 0.8)), SHOT["fix"] - 0.45, db(-19))
sfx.add(st(squelch(0.5, 141)), c["tongue"] + 0.3, db(-18))
n = int((c["up_end"] + 0.6 - c["warmup"]) * SR)
sfx.add(st(fade(glide(300, 700, n / SR, 0.8) * 0.25, 0.1, 0.2)), c["warmup"], db(-26))
sfx.add(st(fade(filt(white(n, 142), "bandpass", [1500, 6000]) * 0.4, 0.2, 0.2)), c["warmup"], db(-28))
for k in range(5):
    sfx.add(drip(150 + k, 1300 + 90 * k), c["warmup"] + 0.3 + k * 0.33, db(-22), pan=(-1) ** k * 0.4)

# ================================================================= 13. final: slow down... SLURP... freeze
sfx.add(st(whoosh(0.4, 2400, 400, 160, 0.6)), SHOT["final"] - 0.3, db(-17))
sfx.add(st(slurp(0.25, 161)) * 0.6, c["down_end"] - 0.2, db(-24))
sfx.add(blip(500, 800, 0.1, 162, 0.05), c["eye_shake"], db(-20), pan=0.4)
sfx.add(st(slurp(c["freeze2"] - c["slurp2"] + 0.05, 163, 20)), c["slurp2"], db(-10))
f2 = c["freeze2"]
sfx.add(st(ice_crack(1.0, 164)), f2 - 0.02, db(-5))
sfx.add(thump(0.7, 140, 40, 0.25), f2 - 0.02, db(-7))

# whooshes on cuts that have no transition sound of their own
for wi, sid in enumerate(("stare", "fine", "rush", "why", "twist", "result")):
    sfx.add(st(whoosh(0.24, 400 + 150 * (wi % 4), 2400, 500 + wi)), SHOT[sid] - 0.26, db(-25))

# ================================================================= score
BPM = 116
groove(mus, 0.0, c["gasp"], BPM, ["F", "Dm", "Bb", "C"], gain=-6, seed=10, sixteen=True)   # jukebox diner
crash(mus, fz, -18, 11)
drone(mus, fz, fz + 1.4, [79, 84, 88], 3000, -24, 12, 0.05)
# the name: icy wonder, then a light bounce under the endless word
drone(mus, c["brain1"] + 0.45, c["doctors"], [72, 76, 79, 84], 2600, -28, 20, 0.2)
for j, m in enumerate((84, 88, 91, 96)):
    mus.add(music_box(mtof(m), 1.4, 21 + j), c["brain1"] + 0.5 + j * 0.09, db(-24), pan=(j - 1.5) * 0.3)
groove(mus, c["doctors"] + 0.1, c["sigh"], 104, ["F", "C"], gain=-7, seed=22, kick_on=False, snaps=False, padv=False)
groove(mus, c["brain2"], SHOT["how"] - 0.1, 116, ["F", "Bb"], gain=-6, seed=23, kick_on=False)
crash(mus, c["brain2"], -24, 24)
# the mechanism: a minor drive, then the rush
groove(mus, SHOT["how"], c["fling"], 120, ["Dm", "Bb", "F", "C"], gain=-4, seed=30, snaps=False)
drone(mus, c["squeeze"], c["fling"], [38, 45], 400, -24, 31, 0.3)
crash(mus, c["fling"], -25, 32)
groove(mus, c["fling"] + 0.1, c["itjust"] + 0.2, 120, ["Dm", "Bb", "Gm", "A"], gain=-4, seed=33, sixteen=True, cutoff=1800)
bwomp(mus, c["overdoes_end"] + 0.03, 33, -18)
# the twist: whisper-dark
drone(mus, SHOT["twist"], c["fh2"] - 0.1, [38, 45, 50], 380, -26, 40, 0.6)
for k in range(int((c["fh2"] - SHOT["twist"]) / 0.55)):
    mus.add(pizz(mtof([50, 53, 57, 55][k % 4]), 0.35, 41 + k), SHOT["twist"] + 0.3 + k * 0.55, db(-24))
# the experiment: a sneaky bounce, a triumphant chord on "published"
groove(mus, SHOT["kid"] + 0.05, c["published"] - 0.05, 112, ["F", "Bb", "C", "F"], gain=-4, seed=50)
crash(mus, c["published"], -19, 51)
for j, m in enumerate((53, 60, 65, 69, 72)):
    mus.add(pad([mtof(m)], 2.4, 0.02, 2200, 52 + j), c["published"], db(-21), pan=(j - 2) * 0.25)
groove(mus, c["journal"] + 0.4, SHOT["fix"], 112, ["F", "C"], gain=-7, seed=53, kick_on=False)
# the fix: warm resolution
groove(mus, SHOT["fix"] + 0.2, c["chuckle"], 100, ["F", "Am", "Bb", "C"], gain=-5, seed=60, kick_on=False, snaps=False)
# the button: a sneaky two-note pizz, then the freeze
for k, m in enumerate((41, 40)):
    mus.add(pizz(mtof(m), 0.5, 70 + k) * 1.3, c["eye_shake"] + 0.05 + k * 0.22, db(-15))
crash(mus, f2, -17, 71)
drone(mus, f2, DUR, [79, 84, 88], 3000, -23, 72, 0.05)
# comedy stops: the gasp + deadpan, "It just...", "Your forehead.", the chuckle
silence(mus, [(c["gasp"], fz - 0.02), (fz + 1.2, SHOT["name"] + 0.35), (c["sigh"], c["brain2"] - 0.02),
              (c["itjust"] + 0.2, c["overdoes_end"] + 0.04), (c["fh2"] - 0.1, SHOT["kid"] + 0.05),
              (c["chuckle"], c["eye_shake"]), (SHOT["rush"] - 0.1, c["blood2"] - 0.05)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
