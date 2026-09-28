"""Full Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
"""
import json
import os
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal

import sfxlib as L
from sfxlib import (SR, Bus, ar, attack_decay, bell, blip, brown, buzz, crack, crackle, db, expdecay, fade, filt,
                    hiss, mtof, note, pan_st, pink, reverb_ir, saw, svf_bp, thump, thunder, true_peak_limit, white,
                    whoosh)

WORK = sys.argv[1]
TL = json.load(open(os.path.join(WORK, "timeline.json")))
C = TL["cues"]
SHOT = {s["id"]: s["start"] for s in TL["shots"]}
END = {s["id"]: s["end"] for s in TL["shots"]}
DUR = TL["duration"]
N = int(round(DUR * SR))
L.set_length(N)
INSIDE = ["stat", "flashover", "wetskin", "fern", "nerves", "neuron", "brain", "heart", "restart"]


# ---------------------------------------------------------------- new atoms
def tone(freq, dur, att=0.005, rel=0.02):
    n = int(dur * SR)
    return fade(np.sin(2 * np.pi * freq * ar(n)) * np.minimum(1, ar(n) / att), 0, rel)


def sweep(f0, f1, dur, shape=1.0):
    n = int(dur * SR)
    f = f0 * (f1 / f0) ** (np.linspace(0, 1, n) ** shape)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def tape_rewind(dur, seed):
    n = int(dur * SR)
    t = ar(n)
    fc = 1800 + 1400 * np.sin(2 * np.pi * 11 * t) * np.sin(2 * np.pi * 0.7 * t)
    y = svf_bp(pink(n, seed), np.abs(fc) + 400, 0.4)
    warble = sweep(900, 2600, dur, 0.6) * (0.5 + 0.5 * np.sin(2 * np.pi * 17 * t))
    y = y / (np.abs(y).max() + 1e-9) + 0.25 * warble
    return fade(y * np.minimum(1, t / 0.05), 0.01, 0.05)


def power_down(dur):
    n = int(dur * SR)
    y = sweep(900, 50, dur, 0.5) * np.linspace(1, 0.2, n)
    return fade(y + 0.2 * filt(white(n, 3), "lowpass", 600) * np.linspace(1, 0, n), 0.002, 0.03)


def inhale(dur, seed, exhale=False):
    n = int(dur * SR)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** (1.6 if not exhale else 0.8)
    y = filt(white(n, seed), "bandpass", [350, 2600] if not exhale else [250, 1800]) * env
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def heartbeat_pair(seed=0):
    out = np.zeros(int(0.45 * SR))
    for dt, g in ((0, 1.0), (0.17, 0.62)):
        th = thump(0.26, 78, 40, 0.075) * g
        th += 0.4 * g * filt(white(len(th), seed), "lowpass", 160) * expdecay(len(th), 0.02)
        i = int(dt * SR)
        out[i:i + len(th)] += th[: len(out) - i]
    return out


def ticks(t0, t1, rate0, rate1, fn, bus, gain, pan=0.0):
    tk, k = t0, 0
    while tk < t1:
        p = (tk - t0) / max(1e-6, t1 - t0)
        bus.add(fn(k, p), tk, gain, pan=pan * (-1) ** k)
        tk += 1.0 / (rate0 + (rate1 - rate0) * p)
        k += 1


def strike(bus, bed, t, big=1.0, seed=0):
    bus.add(np.stack([crack(0.3, 31 + seed, 0.035), crack(0.3, 32 + seed, 0.04)]), t - 0.01, db(-1) * big)
    bus.add(thump(1.2, 110, 34, 0.45), t, db(-2) * big)
    bus.add(filt(white(int(1.2 * SR), 33 + seed), "lowpass", 300) * attack_decay(int(1.2 * SR), 0.003, 0.35), t, db(-6) * big)
    bed.add(np.stack([thunder(2.2, 34 + seed), thunder(2.2, 35 + seed)]), t + 0.05, db(-7) * big)


sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()
tt = ar(N)

# ---------------------------------------------------------------- ambience: outdoors vs inside the body
rain = np.stack([filt(filt(pink(N, s), "highpass", 500), "lowpass", 9000) for s in (11, 12)])
drops = np.stack([crackle(N, 38, s, 2500, 11000, 0.0006) for s in (13, 14)])
wind = filt(brown(N, 15), "lowpass", 220)
inside = np.zeros(N)
for sid in INSIDE:
    a, b = int(SHOT[sid] * SR), int(END[sid] * SR)
    inside[a:b] = 1
inside = np.convolve(inside, np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")
out_lvl = (1 - inside) * np.where(tt < SHOT["approach"], 0.7, 0.9)
amb.x += (0.10 * rain + 0.05 * drops) * out_lvl + pan_st(0.07 * wind * out_lvl, 0)
muffled = np.stack([filt(r, "lowpass", 700) for r in rain])
blood = filt(brown(N, 16), "lowpass", 140) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.2 * tt))
amb.x += 0.08 * muffled * inside + pan_st(0.16 * blood * inside, 0)

# ---------------------------------------------------------------- 1. tease: strike, freeze, flatline
ts = C["tease_strike"]
n = int(ts * SR) + 400
sfx.add(fade(crackle(n, np.linspace(300, 3500, n), 21) * np.linspace(0.3, 1, n) * 0.5, 0.001, 0.005), 0.0, db(-9))
strike(sfx, bed, ts)
bz = int((C["freeze"] - ts) * SR)
bed.add(fade(buzz(bz, 118, 41) * 0.5 + crackle(bz, 1400, 42) * 0.8, 0.002, 0.02), ts, db(-13))
# the freeze: shutter click + sub drop, sound collapses to a dark hum
sfx.add(blip(3000, 2600, 0.05, 43, 0.01), C["freeze"], db(-12))
sfx.add(thump(0.9, 70, 28, 0.4), C["freeze"], db(-6))
fz = int((SHOT["rewind"] - C["freeze"]) * SR)
bed.add(pan_st(fade(note(mtof(26), fz / SR, 0.1, 9, 300, voices=2, seed=44), 0.05, 0.05), 0), C["freeze"], db(-14))
sfx.add(tone(1000, 0.12), C["flatline1"] + 0.09, db(-18))
bed.add(fade(tone(1000, SHOT["rewind"] + 0.05 - C["flatline1"] - 0.3, 0.01, 0.01), 0.01, 0.12), C["flatline1"] + 0.3, db(-19))

# ---------------------------------------------------------------- 2. rewind → play
rw = C["rewind_end"] - C["rewind"]
bed.add(pan_st(tape_rewind(rw, 50), 0.1 * np.sin(np.linspace(0, 20, int(rw * SR)))), C["rewind"], db(-18))
sfx.add(thump(0.2, 200, 90, 0.04), C["rewind_end"], db(-14))
sfx.add(blip(1800, 1800, 0.04, 51, 0.01), C["rewind_end"] + 0.05, db(-16))

# ---------------------------------------------------------------- 3-6. the storm, the leader, the streamer, the strike
sfx.add(pan_st(whoosh(0.6, 200, 1600, 60, 0.8), np.linspace(-0.6, 0.4, int(0.6 * SR))), SHOT["approach"] - 0.2, db(-12))
bed.add(np.stack([thunder(2.5, 61, ((0, 0.6), (0.6, 1.0), (1.4, 0.5))), thunder(2.5, 62, ((0, 0.6), (0.6, 1.0), (1.4, 0.5)))]),
        SHOT["approach"] + 0.1, db(-12))
leader_t0 = C["leader"] - 0.45
step = (C["connect"] - leader_t0) / 26
for k in range(26):
    p = k / 25
    sfx.add(crackle(int(0.08 * SR), 5000 * expdecay(int(0.08 * SR), 0.02), 70 + k), leader_t0 + k * step, db(-26 + 7 * p), pan=0.3 * np.sin(k))
n = int((C["connect"] - C["streamer"]) * SR)
fizz = filt(white(n, 80), "highpass", 4000) * np.linspace(0.1, 1, n) ** 2 + 0.6 * crackle(n, np.linspace(200, 2500, n), 81, 3000, 12000, 0.0008)
bed.add(pan_st(fade(fizz, 0.05, 0.005), 0), C["streamer"], db(-20))
strike(sfx, bed, C["connect"], 1.0, 10)
bz = int((SHOT["stat"] - C["connect"]) * SR)
bed.add(fade(buzz(bz, 118, 90) * 0.5 + crackle(bz, 1600, 91) * 0.8, 0.002, 0.03), C["connect"], db(-12))

# ---------------------------------------------------------------- 7. stats
sfx.add(pan_st(whoosh(0.3, 300, 2600, 100, 0.8), 0), SHOT["stat"] - 0.22, db(-12))
ticks(C["count"], C["count_end"] - 0.02, 12, 45, lambda k, p: blip(2400 + 900 * p, 2000 + 700 * p, 0.03, 101 + k, 0.008), sfx, db(-20), 0.25)
sfx.add(thump(0.6, 120, 42, 0.22), C["count_end"], db(-5))
clank = sum(np.sin(2 * np.pi * f * ar(int(0.5 * SR))) * np.exp(-ar(int(0.5 * SR)) / d) * a
            for f, d, a in ((523, 0.25, 1), (1344, 0.12, 0.6), (2271, 0.08, 0.45), (3657, 0.05, 0.3)))
sfx.add(fade(clank / 2.3, 0.0005, 0.02), C["count_end"] - 0.03, db(-16), pan=0.3)
n = int(0.5 * SR)
sfx.add(fade(filt(pink(n, 110), "lowpass", 900) * np.linspace(0, 1, n) ** 1.5, 0.01, 0.08), C["hotter"], db(-16), pan=-0.4)
sfx.add(thump(0.5, 140, 50, 0.16), C["hotter"] + 0.85, db(-7))
sfx.add(bell(2637, 0.9, 0.3) * 0.5, C["hotter"] + 0.86, db(-23))

# ---------------------------------------------------------------- 8-10. flash-over, wet skin, the shoe
sfx.add(pan_st(whoosh(0.34, 400, 3600, 120), np.linspace(0.8, -0.8, int(0.34 * SR))), SHOT["flashover"] - 0.24, db(-11))
n = int(0.4 * SR)
scan = np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(1500, 900, n)) / SR)) * (0.6 + 0.4 * np.sin(2 * np.pi * 32 * ar(n)))
sfx.add(fade(filt(scan, "bandpass", [600, 4000]) * np.hanning(n), 0.005, 0.02), C["scan"], db(-25))
f0, f1 = SHOT["flashover"] + 0.3, SHOT["shoes"]
n = int((f1 - f0) * SR)
flow = np.stack([crackle(n, 2200, 121 + s, 2500, 11000, 0.0009) for s in (0, 1)]) * 0.55
flow += np.stack([filt(pink(n, 131 + s), "bandpass", [3000, 9000]) for s in (0, 1)]) * 0.18
bed.add(flow * np.minimum(1, ar(n) / 0.15), f0, db(-15))
sfx.add(blip(880, 1320, 0.12, 140, 0.04), C["inside"] - 0.4, db(-18), pan=-0.4)
rr = np.random.default_rng(3)
for i in range(10):
    sfx.add(crack(0.12, 150 + i, 0.015, 2500), SHOT["wetskin"] + 0.1 + i * 0.14, db(-20), pan=rr.uniform(-0.6, 0.6))
    sfx.add(hiss(0.25, 160 + i, 0.06), SHOT["wetskin"] + 0.15 + i * 0.14, db(-26), pan=rr.uniform(-0.6, 0.6))
n = int(1.3 * SR)
steam = filt(white(n, 170), "highpass", 2500) * attack_decay(n, 0.02, 0.45) + 0.4 * crackle(n, 900 * expdecay(n, 0.4), 171)
sfx.add(np.stack([steam, filt(white(n, 172), "highpass", 2500) * attack_decay(n, 0.02, 0.45)]), C["steam"], db(-11))
sfx.add(thump(0.35, 220, 70, 0.07), C["shoe"], db(-6))
sfx.add(np.stack([crack(0.2, 173, 0.02, 1200), crack(0.2, 174, 0.02, 1200)]), C["shoe"], db(-13))
sfx.add(pan_st(whoosh(0.8, 500, 3000, 175, 0.4), np.linspace(0, -0.8, int(0.8 * SR))), C["shoe"], db(-12))
sfx.add(thump(0.25, 150, 60, 0.05), C["shoe"] + 0.85, db(-10), pan=-0.6)
sfx.add(thump(0.2, 170, 70, 0.04), C["shoe"] + 1.05, db(-17), pan=-0.7)

# ---------------------------------------------------------------- 11. fern
g0 = C["fern"]
sfx.add(pan_st(whoosh(0.32, 500, 4000, 180), np.linspace(-0.6, 0.7, int(0.32 * SR))), SHOT["fern"] - 0.23, db(-11))
n = int(1.45 * SR)
dens = 3500 * np.sin(np.pi * np.clip(ar(n) / 1.35, 0, 1)) ** 0.6 + 50
bed.add(fade(np.stack([crackle(n, dens, 181 + s, 1500, 10000, 0.0012) for s in (0, 1)]), 0.005, 0.1), g0, db(-15))
sfx.add(blip(1046, 1568, 0.12, 190, 0.04), g0 + 0.75, db(-18))

# ---------------------------------------------------------------- 12-15. into the nervous system
sfx.add(pan_st(whoosh(0.5, 3000, 200, 200, 0.7), 0), SHOT["nerves"] - 0.3, db(-10))
sfx.add(np.stack([crack(0.3, 201, 0.03, 1500), crack(0.3, 202, 0.03, 1500)]), SHOT["nerves"] + 0.05, db(-12))
for k in range(9):
    z = sweep(300, 3200, 0.22, 0.7) * attack_decay(int(0.22 * SR), 0.005, 0.08)
    z = z + 0.4 * crackle(len(z), 3000, 210 + k, 2000, 9000)
    sfx.add(fade(z, 0.002, 0.02), C["races"] + k * 0.16, db(-21), pan=0.7 * np.sin(k * 1.7))
for i in range(4):
    t0 = C["tiny"] - 0.2 + i * 0.42
    for h in range(8):
        sfx.add(blip(1900 + 60 * h, 2100, 0.03, 220 + i * 10 + h, 0.006), t0 + h * (84 / 620), db(-27), pan=-0.5 + h * 0.14)
n = int(1.2 * SR)
over = np.tanh(6 * (filt(pink(n, 230), "bandpass", [200, 6000]) + buzz(n, 90, 231, 0.8))) * expdecay(n, 0.5)
bed.add(np.stack([over, np.roll(over, 300)]) * 0.8, C["surge"], db(-11))
sfx.add(thump(0.6, 130, 38, 0.25), C["surge"], db(-4))
for k in range(6):
    sfx.add(crackle(int(0.05 * SR), 9000, 240 + k, 800, 12000, 0.0005), C["surge"] + 0.15 + k * 0.07, db(-14), pan=0.6 * (-1) ** k)
sfx.add(thump(0.4, 90, 40, 0.12), SHOT["limp"] + 0.35, db(-9))
sfx.add(pan_st(power_down(0.6), 0), C["limp"], db(-18))
ticks(C["hours"], SHOT["brain"] - 0.05, 8, 22, lambda k, p: filt(white(int(0.012 * SR), 250 + k), "bandpass", [2500, 5000]) * expdecay(int(0.012 * SR), 0.002), sfx, db(-20), 0.4)
b0 = SHOT["brain"]
for k in range(3):
    tb = b0 + 0.1 + k * 0.75
    if tb + 0.3 < C["shutdown"]:
        sfx.add(inhale(0.35, 260 + k), tb, db(-24))
        sfx.add(inhale(0.4, 270 + k, True), tb + 0.38, db(-26))
bed.add(pan_st(power_down(0.7), 0), C["shutdown"], db(-15))
for k in range(4):
    sfx.add(crack(0.05, 280 + k, 0.008, 3000), C["shutdown"] + k * 0.07, db(-20))

# ---------------------------------------------------------------- 16-17. the heart: beats, jolt, flatline, restart
beat0, period = C["beat_ok"] - 0.3, 0.75
k = 0
while beat0 + k * period < C["defib"] - 0.1:
    tb = beat0 + k * period
    if tb >= SHOT["heart"] - 0.05:
        sfx.add(heartbeat_pair(300 + k), tb + 0.2, db(-6))
        sfx.add(tone(1000, 0.07), tb + 0.3 * period, db(-24))
    k += 1
d = C["defib"]
sfx.add(np.stack([crack(0.4, 310, 0.05), crack(0.4, 311, 0.05)]), d, db(0))
sfx.add(thump(0.9, 90, 30, 0.35), d, db(0))
sfx.add(pan_st(fade(sweep(3000, 6000, 0.5) * np.linspace(0.6, 0, int(0.5 * SR)), 0.01, 0.05), 0), d, db(-22))
for k, dt in enumerate((0.55, 1.05, 1.5)):
    sfx.add(thump(0.2, 70, 40, 0.05), d + dt, db(-14 - 5 * k))
flat_a = d + 0.18 + 0.9 * (C["stop"] - d - 0.18)
bed.add(tone(1000, C["restart"] - flat_a, 0.02, 0.01), flat_a, db(-19))
r0 = C["restart"]
k = 0
while r0 + k * 0.82 < SHOT["cpr"]:
    tb = r0 + k * 0.82
    sfx.add(heartbeat_pair(320 + k), tb + 0.2, db(-6 - (3 if k == 0 else 0)))
    sfx.add(tone(1000, 0.07), tb + 0.3 * 0.82, db(-24))
    k += 1
sfx.add(np.stack([crack(0.15, 330, 0.02, 3000), crack(0.15, 331, 0.02, 3000)]), r0, db(-16))
sfx.add(pan_st(whoosh(0.5, 2500, 300, 332, 0.6), 0), C["breath_fail"] - 0.1, db(-16))

# ---------------------------------------------------------------- 18-19. CPR + safe to touch
tc = C["cpr"] - 0.5
while tc < SHOT["touch"] - 0.1:
    sfx.add(thump(0.2, 95, 50, 0.05), tc + 0.25, db(-9))
    sfx.add(filt(white(int(0.12 * SR), int(tc * 100)), "lowpass", 500) * attack_decay(int(0.12 * SR), 0.01, 0.04), tc + 0.25, db(-18))
    tc += 0.5
sfx.add(pan_st(whoosh(0.5, 300, 1800, 340, 0.7), np.linspace(0.8, 0, int(0.5 * SR))), C["no_charge"] - 0.3, db(-15))
sfx.add(blip(520, 520, 0.18, 341, 0.06), C["no_charge"], db(-15))
for j, m in enumerate((93, 98, 102)):
    sfx.add(bell(mtof(m), 1.0, 0.3) * 0.5, C["touch"] + 0.3 + j * 0.05, db(-24), pan=(j - 1) * 0.3)
sfx.add(inhale(0.5, 342), C["touch"] + 0.35, db(-17))

# ---------------------------------------------------------------- 20. survive (icons)
ic = C["icons"]
sfx.add(pan_st(whoosh(0.36, 3000, 250, 350, q=0.6), 0), SHOT["survive"] - 0.26, db(-11))
for i in range(10):
    sfx.add(blip(1400, 2000, 0.05, 351 + i, 0.015), ic + i * 0.03, db(-28), pan=(i - 4.5) / 6)
for i, m in enumerate([86, 88, 90, 91, 93, 95, 97, 98, 100]):
    sfx.add(bell(mtof(m), 0.5, 0.15) * 0.6, ic + 0.22 + i * 0.028, db(-25), pan=(i - 4.5) / 6)
sfx.add(thump(0.3, 160, 70, 0.08), ic + 0.5, db(-16), pan=0.75)
for j, m in enumerate((98, 102, 105, 110)):
    sfx.add(bell(mtof(m), 1.2, 0.4) * 0.5, C["survive"] + j * 0.035, db(-25), pan=(j - 1.5) * 0.3)

# ---------------------------------------------------------------- 21. the ranger: seven strikes
for k, th in enumerate(C["ranger_strikes"]):
    g = 0.55 + 0.07 * k
    sfx.add(np.stack([crack(0.25, 400 + k, 0.03), crack(0.25, 410 + k, 0.03)]), th, db(-4) * g)
    sfx.add(thump(0.5, 120, 36, 0.2), th, db(-4) * g)
    sfx.add(blip(1200 + 150 * k, 1500 + 150 * k, 0.06, 420 + k, 0.02), th + 0.02, db(-22))
bed.add(np.stack([thunder(2.2, 430), thunder(2.2, 431)]), C["ranger_strikes"][-1] + 0.1, db(-12))
st = C["stamp"]
sfx.add(thump(0.6, 140, 45, 0.2), st, db(-5))
for j, m in enumerate((74, 78, 81, 86)):
    sfx.add(bell(mtof(m + 12), 1.5, 0.6) * 0.5, st + j * 0.03, db(-22), pan=(j - 1.5) * 0.3)

# ---------------------------------------------------------------- 22. the final strike
fs_ = C["final_strike"]
n = int((fs_ - SHOT["final"] + 0.05) * SR)
rum = filt(brown(n, 440), "lowpass", 200) * np.linspace(0.15, 1, n) ** 2
bed.add(pan_st(fade(rum, 0.05, 0.02), 0), SHOT["final"], db(-5))
sfx.add(np.stack([crack(0.5, 441, 0.08), crack(0.5, 442, 0.08)]), fs_, db(0))
sfx.add(thump(0.6, 110, 34, 0.35), fs_, db(-1))
sfx.add(np.stack([thunder(1.0, 443), thunder(1.0, 444)]), fs_ + 0.03, db(-6))

# generic whooshes on the remaining cuts
for wi, (sid, f_lo, f_hi) in enumerate((("leader", 300, 2000), ("streamer", 2500, 400), ("wetskin", 400, 3000), ("shoes", 300, 2200),
                        ("neuron", 3000, 300), ("limp", 300, 2400), ("brain", 2000, 300), ("heart", 300, 1800),
                        ("cpr", 2600, 300), ("ranger", 300, 2600), ("final", 400, 3000))):
    sfx.add(pan_st(whoosh(0.3, f_lo, f_hi, 500 + wi), 0), SHOT[sid] - 0.22, db(-14))


# ---------------------------------------------------------------- score
def chord_tones(name):
    roots = {"D": 50, "E": 52, "F": 53, "G": 43, "A": 45, "B": 47, "Bb": 46, "C": 48}
    minor = name.endswith("m")
    r = roots[name[:-1] if minor else name]
    return r, [r, r + (3 if minor else 4), r + 7, r + 12]


def groove(t0, t1, bpm, chords, kick="half", hats=2, arp=True, arp_cut=(1200, 2600), bass=True, pad=True,
           gain=0.0, arp_oct=12, seed=0):
    beat = 60.0 / bpm
    bars = int(np.ceil((t1 - t0) / (4 * beat)))
    for bar in range(bars):
        b0 = t0 + bar * 4 * beat
        if b0 >= t1:
            break
        root, tones = chord_tones(chords[bar % len(chords)])
        prog = bar / max(1, bars - 1)
        bl = min(4 * beat, t1 - b0)
        if pad:
            for j, m in enumerate(tones[:3]):
                mus.add(note(mtof(m), bl + 0.1, 0.2, 3.0, 900 + 500 * prog, voices=3, seed=seed + bar * 10 + j), b0, db(-26 + gain), pan=(j - 1) * 0.5)
        if bass:
            for e in range(8):
                te = b0 + e * beat / 2
                if te >= t1:
                    break
                n8 = int(beat / 2 * SR)
                bs = np.sin(2 * np.pi * mtof(root - 12) * ar(n8)) + 0.45 * filt(saw(mtof(root - 12), n8), "lowpass", 380)
                mus.add(fade(bs * np.minimum(1, ar(n8) / 0.01) * np.exp(-ar(n8) / 0.16), 0.002, 0.01), te, db(-17 + gain))
        if arp:
            pat = [0, 1, 2, 3, 2, 1, 2, 3]
            for s16 in range(16):
                ta = b0 + s16 * beat / 4
                if ta >= t1:
                    break
                cut = arp_cut[0] + (arp_cut[1] - arp_cut[0]) * prog
                ap = note(mtof(tones[pat[s16 % 8]] + arp_oct), beat / 4 * 0.95, 0.003, 0.07, cut + 300 * (s16 % 4 == 0), seed=seed + s16)
                mus.add(ap, ta, db(-25 + gain), pan=0.45 * (-1) ** s16)
        for bt in range(4):
            tb = b0 + bt * beat
            if tb >= t1:
                break
            if kick == "four" or (kick == "half" and bt in (0, 2)):
                mus.add(thump(0.3, 150, 48, 0.12), tb, db(-17 + gain))
            for h in range(hats):
                th = tb + h * beat / hats
                if hats == 2 and h == 0:
                    continue
                hh = filt(white(int(0.04 * SR), int(th * 1000) % 100000), "highpass", 7500) * expdecay(int(0.04 * SR), 0.012)
                mus.add(hh, th, db((-28 if h % 2 else -32) + gain), pan=0.3)


def drone(t0, t1, notes, cutoff=500, gain=-24.0, seed=0, swell=0.3):
    dur = t1 - t0
    y = sum(note(mtof(m), dur, swell, 9, cutoff, voices=2, seed=seed + i) for i, m in enumerate(notes))
    mus.add(pan_st(fade(y, 0.05, 0.08), 0), t0, db(gain))


def riser(t0, t1, gain=-24.0, seed=0):
    n = int((t1 - t0) * SR)
    y = filt(white(n, seed), "highpass", 1500) * np.linspace(0, 1, n) ** 3 + 0.3 * sweep(200, 1200, t1 - t0, 1.5) * np.linspace(0, 1, n) ** 2
    mus.add(pan_st(fade(y, 0.01, 0.005), 0), t0, db(gain))


def crash(t, gain=-20.0, seed=0):
    n = int(1.6 * SR)
    mus.add(np.stack([filt(white(n, seed + i), "highpass", 4500) * attack_decay(n, 0.002, 0.5) for i in (0, 1)]), t, db(gain))


BPM = 140.5
drone(C["tease_strike"] + 0.05, C["freeze"], [38, 45], 400, -24, 1)
drone(C["freeze"], SHOT["rewind"], [37, 44], 300, -22, 2)                     # darker, detuned while frozen
riser(SHOT["rewind"], C["rewind_end"], -26, 3)
groove(C["rewind_end"] + 0.05, C["connect"], BPM, ["Dm", "Bb", "Gm", "A"], kick=None, hats=0, arp=True, arp_cut=(600, 1600), gain=-2, seed=10)
groove(SHOT["leader"], C["connect"], BPM, ["Dm", "Bb", "Gm", "A"], kick="half", hats=2, arp=False, pad=False, bass=False, gain=-3, seed=20)
riser(C["connect"] - 1.6, C["connect"], -23, 4)
crash(C["connect"], -18, 5)
groove(C["connect"], SHOT["nerves"], BPM, ["Dm", "Bb", "Gm", "A"], kick="four", hats=4, arp=True, arp_cut=(1800, 3200), seed=30)
groove(SHOT["nerves"], C["surge"], BPM, ["Dm", "F", "C", "Gm"], kick="half", hats=2, arp=True, arp_cut=(2200, 3600), arp_oct=24, gain=-2, seed=40)
drone(C["surge"] + 0.4, C["shutdown"] + 0.2, [38, 44, 45], 450, -23, 50, 0.6)
drone(SHOT["heart"], C["defib"], [38, 45, 53], 600, -25, 60, 0.4)
crash(C["defib"], -19, 6)
drone(C["restart"] + 0.1, C["cpr"], [50, 54, 57, 62], 1400, -24, 70, 0.8)       # warm D major swell
groove(C["cpr"] + 0.25, SHOT["survive"], 120, ["D", "Bm", "G", "A"], kick="four", hats=2, arp=True, arp_cut=(1600, 2800), gain=-2, seed=80)
riser(SHOT["survive"] - 0.9, SHOT["survive"], -24, 7)
crash(SHOT["survive"], -20, 8)
groove(SHOT["survive"], SHOT["ranger"], BPM, ["D", "Bm", "G", "A"], kick="half", hats=4, arp=True, arp_cut=(2600, 3600), gain=-1, seed=90)
drone(SHOT["ranger"], C["stamp"], [45, 52, 57], 900, -23, 100, 0.3)
for th in C["ranger_strikes"]:
    mus.add(thump(0.4, 110, 45, 0.15), th, db(-12))
crash(C["stamp"], -18, 9)
for j, m in enumerate([50, 54, 57, 62, 66]):
    mus.add(note(mtof(m), SHOT["final"] - C["stamp"] + 0.3, 0.02, 2.5, 2600, voices=3, seed=110 + j), C["stamp"], db(-25), pan=(j - 2) * 0.35)
drone(SHOT["final"], C["final_strike"], [38, 44, 51], 700, -18, 120, 0.4)
# surge stutter: the score chops itself up for a moment
a = int(C["surge"] * SR)
sl = int(0.06 * SR)
seg = mus.x[:, a - sl:a].copy()
for k in range(7):
    i = a + k * sl
    mus.x[:, i:i + sl] = seg * (0.9 - 0.1 * k)
mus.x[:, a + 7 * sl:int((C["surge"] + 0.45) * SR)] *= 0.15
# silence the score while the heart is stopped, and after the final strike
for (x0, x1) in ((C["defib"] + 0.9, C["restart"] + 0.05), (C["final_strike"], DUR)):
    i0, i1 = int(x0 * SR), int(x1 * SR)
    mus.x[:, i0:i1] *= np.linspace(1, 0, i1 - i0) ** 8 if x0 == C["defib"] + 0.9 else 0

# ---------------------------------------------------------------- voice + mix
vo, vsr = sf.read(os.path.join(WORK, "voice.wav"))
vo = signal.resample_poly(vo, SR, vsr) if vsr != SR else vo
vo = filt(vo, "highpass", 90)
vo = vo + 0.35 * filt(vo, "bandpass", [2200, 5000])
env = np.sqrt(filt(vo ** 2, "lowpass", 20).clip(1e-12))
gr = np.minimum(1, (env / (np.percentile(env, 90) * 0.7)) ** -0.35)
vo = vo * gr
voice = np.zeros(N)
voice[: min(N, len(vo))] = vo[:N]
voice /= np.max(np.abs(voice)) + 1e-9

venv = np.abs(voice)
venv = signal.lfilter([1 - np.exp(-1 / (0.12 * SR))], [1, -np.exp(-1 / (0.12 * SR))], venv)
venv /= venv.max() + 1e-9
vk = np.clip(venv * 4, 0, 1)
duck = 1 - 0.55 * vk

ir = reverb_ir(1.2)
fx = sfx.x * (1 - 0.3 * vk) + bed.x * (1 - 0.62 * vk)
wet = np.stack([signal.fftconvolve(fx[c], ir[c])[:N] for c in range(2)])
mus_wet = np.stack([signal.fftconvolve(mus.x[c], ir[1 - c])[:N] for c in range(2)])
sfx_bus = fx + 0.22 * wet
mus_bus = (mus.x + 0.18 * mus_wet) * duck
amb_bus = amb.x * (0.6 + 0.4 * duck)

voice_st = pan_st(voice, 0) * db(-3)
sfx_st = sfx_bus / (np.max(np.abs(sfx_bus)) + 1e-9) * db(-5.5)
mus_st = mus_bus / (np.max(np.abs(mus_bus)) + 1e-9) * db(-10)
amb_st = amb_bus / (np.max(np.abs(amb_bus)) + 1e-9) * db(-18)
mix = voice_st + sfx_st + mus_st + amb_st

os.makedirs(os.path.join(WORK, "stems"), exist_ok=True)
for name, x in (("voice", voice_st), ("sfx", sfx_st), ("music", mus_st), ("amb", amb_st)):
    sf.write(os.path.join(WORK, "stems", f"{name}.wav"), x.T, SR)

meter = pyln.Meter(SR)
for _ in range(3):
    loud = meter.integrated_loudness(mix.T)
    mix = mix * db(-14.0 - loud)
    mix = true_peak_limit(mix, -1.2)
loud = meter.integrated_loudness(mix.T)
mix[:, -int(0.012 * SR):] *= np.linspace(1, 0, int(0.012 * SR))
sf.write(os.path.join(WORK, "mix.wav"), mix.T, SR, subtype="PCM_24")
up = signal.resample_poly(mix, 4, 1, axis=1)
print(f"mix.wav: {mix.shape[1] / SR:.3f}s  integrated {loud:.2f} LUFS  true-peak {20 * np.log10(np.abs(up).max()):.2f} dBTP")
