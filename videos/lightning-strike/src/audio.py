"""Sound design + score + mix, fully synthesized (numpy/scipy), synced to timeline.json.

Usage: python3 audio.py <work_dir>
Reads <work_dir>/timeline.json and narration.wav; writes <work_dir>/mix.wav
(48 kHz stereo, exactly 10.000 s, -14 LUFS integrated, peaks <= -1 dBTP) plus
stems/ for inspection.
"""
import json
import os
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal

SR = 48000
DUR = 10.0
N = int(SR * DUR)
WORK = sys.argv[1]
TL = json.load(open(os.path.join(WORK, "timeline.json")))
CUE = TL["cues"]
SHOT = {s["id"]: s["start"] for s in TL["shots"]}


# ---------------------------------------------------------------- basics
def ar(n):
    return np.arange(n) / SR


def white(n, seed):
    return np.random.default_rng(seed).standard_normal(n)


def pink(n, seed):
    X = np.fft.rfft(white(n, seed))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    y = np.fft.irfft(X / np.sqrt(f), n)
    return y / (np.std(y) + 1e-9)


def brown(n, seed):
    y = np.cumsum(white(n, seed))
    y = filt(y, "highpass", 18)
    return y / (np.std(y) + 1e-9)


def filt(x, kind, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype=kind, fs=SR, output="sos"), x)


def expdecay(n, tau):
    return np.exp(-ar(n) / tau)


def attack_decay(n, att, tau):
    t = ar(n)
    return np.minimum(1, t / max(att, 1e-4)) * np.exp(-np.maximum(0, t - att) / tau)


def fade(x, fin=0.002, fout=0.01):
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[..., :a] *= np.linspace(0, 1, a)
    if b:
        x[..., -b:] *= np.linspace(1, 0, b)
    return x


def svf_bp(x, fc, q=0.8):
    """time-varying band-pass (Chamberlin SVF); fc is an array (Hz)"""
    y = np.empty_like(x)
    low = band = 0.0
    fcs = (2 * np.sin(np.pi * np.minimum(fc, SR / 7) / SR)).tolist()
    xs = x.tolist()
    for i in range(len(xs)):
        f = fcs[i]
        high = xs[i] - low - q * band
        band += f * high
        low += f * band
        y[i] = band
    return y


def pan_st(x, pan):
    """equal-power pan; pan scalar or array in [-1, 1]"""
    p = (np.asarray(pan) + 1) * np.pi / 4
    return np.stack([x * np.cos(p), x * np.sin(p)])


class Bus:
    def __init__(self):
        self.x = np.zeros((2, N))

    def add(self, sig, t0, gain=1.0, pan=0.0):
        s = sig if sig.ndim == 2 else pan_st(sig, pan)
        i0 = int(round(t0 * SR))
        if i0 < 0:
            s = s[:, -i0:]
            i0 = 0
        n = min(s.shape[1], N - i0)
        if n > 0:
            self.x[:, i0:i0 + n] += gain * s[:, :n]


def db(v):
    return 10 ** (v / 20)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- sfx atoms
def crackle(n, density, seed, lo=1800, hi=9000, grain=0.0015):
    """random electric crackle; density = events/s (scalar or array)"""
    r = np.random.default_rng(seed)
    dens = np.broadcast_to(np.asarray(density, float), (n,))
    ev = r.random(n) < dens / SR
    imp = np.zeros(n)
    imp[ev] = (r.random(ev.sum()) ** 2) * np.sign(r.random(ev.sum()) - 0.5)
    k = white(int(grain * SR * 4), seed + 1) * expdecay(int(grain * SR * 4), grain)
    y = signal.fftconvolve(imp, k)[:n]
    y = filt(y, "bandpass", [lo, hi])
    return y / (np.max(np.abs(y)) + 1e-9)


def buzz(n, f0, seed, flutter=0.5):
    t = ar(n)
    y = np.zeros(n)
    for k in range(1, 28):
        if k * f0 > 9000:
            break
        y += np.sin(2 * np.pi * k * f0 * t + k * 1.3) / k
    mod = 1 - flutter + flutter * np.abs(filt(white(n, seed), "lowpass", 35) * 3)
    y = np.tanh(2.5 * y * mod)
    y = filt(y, "bandpass", [140, 5200])
    return y / (np.max(np.abs(y)) + 1e-9)


def whoosh(dur, f0, f1, seed, peak=0.72, q=0.55):
    n = int(dur * SR)
    t = ar(n) / dur
    fc = f0 * (f1 / f0) ** np.clip(t / peak, 0, 1)
    env = np.where(t < peak, (t / peak) ** 2.2, np.exp(-(t - peak) * dur / 0.06))
    y = svf_bp(pink(n, seed), fc, q) * env
    return fade(y / (np.max(np.abs(y)) + 1e-9), 0.001, 0.02)


def thump(dur, f_hi, f_lo, tau, seed=0):
    n = int(dur * SR)
    t = ar(n)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * attack_decay(n, 0.002, tau)
    return fade(y, 0.0005, 0.01)


def crack(dur, seed, tau=0.05, hp=900):
    n = int(dur * SR)
    y = white(n, seed) * attack_decay(n, 0.0008, tau)
    y = filt(y, "highpass", hp) + 0.5 * crackle(n, 900 * expdecay(n, tau * 2), seed + 5)
    return fade(y / (np.max(np.abs(y)) + 1e-9), 0.0003, 0.01)


def thunder(dur, seed, rolls=((0, 1.0), (0.35, 0.7), (0.9, 0.5), (1.5, 0.35))):
    n = int(dur * SR)
    t = ar(n)
    env = np.zeros(n)
    for t0, a in rolls:
        env += a * np.where(t >= t0, (1 - np.exp(-(t - t0) / 0.04)) * np.exp(-np.maximum(0, t - t0) / 0.55), 0)
    y = filt(brown(n, seed), "lowpass", 260) * env
    y += 0.12 * filt(pink(n, seed + 1), "bandpass", [150, 700]) * env ** 1.5
    return fade(y / (np.max(np.abs(y)) + 1e-9), 0.001, 0.2)


def blip(f0, f1, dur, seed=0, tau=0.05):
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (f1 / f0) ** np.clip(t / 0.03, 0, 1)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * attack_decay(n, 0.001, tau)
    y += 0.3 * filt(white(n, seed), "highpass", 3000) * attack_decay(n, 0.0005, 0.004)
    return fade(y, 0.0005, 0.01)


def bell(freq, dur, tau=0.6):
    n = int(dur * SR)
    t = ar(n)
    y = np.zeros(n)
    for ratio, amp, tt in ((1, 1, 1), (2.01, 0.5, 0.6), (3.02, 0.25, 0.4), (4.17, 0.18, 0.3), (5.43, 0.1, 0.2)):
        y += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / (tau * tt))
    return fade(y * np.minimum(1, t / 0.002), 0.0005, 0.05)


def hiss(dur, seed, tau=0.12):
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 3800) * attack_decay(n, 0.01, tau)
    return fade(y, 0.001, 0.02)


def reverb_ir(rt=1.3, seed=3):
    n = int(rt * SR)
    t = ar(n)
    ir = np.stack([white(n, seed), white(n, seed + 1)]) * np.exp(-t * 6.9 / rt)
    ir = np.stack([filt(c, "lowpass", 5500) for c in ir])
    ir[:, : int(0.012 * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))


# ---------------------------------------------------------------- SFX bus
sfx = Bus()  # short impacts
bed = Bus()  # sustained sfx beds (ducked harder under the voice)
amb = Bus()

# storm ambience: rain (decorrelated pink noise) + low wind; level follows the shot
rain = np.stack([filt(filt(pink(N, s), "highpass", 500), "lowpass", 9000) for s in (11, 12)])
drops = np.stack([crackle(N, 38, s, 2500, 11000, 0.0006) for s in (13, 14)])
wind = filt(brown(N, 15), "lowpass", 220)
tt = ar(N)
lvl = np.interp(tt, [0, SHOT["amps"] - 0.05, SHOT["amps"] + 0.1, SHOT["flash"], SHOT["flash"] + 0.1, SHOT["fern"],
                     SHOT["fern"] + 0.1, SHOT["survive"], SHOT["survive"] + 0.15, 10],
                [0.75, 0.75, 0.08, 0.08, 0.35, 0.35, 0.12, 0.12, 0.5, 0.9])
amb.x += (0.10 * rain + 0.05 * drops) * lvl + pan_st(0.07 * wind * lvl, 0)

# --- S1 hook: leader sizzle, the strike, buzz on the body
st = CUE["strike"]
n = int(st * SR)
lead = crackle(n + 400, np.linspace(200, 3500, n + 400), 21) * np.linspace(0.3, 1, n + 400)
sweep = np.sin(2 * np.pi * np.cumsum(np.linspace(700, 3200, n + 400)) / SR) * np.linspace(0, 0.25, n + 400)
bed.add(fade(lead * 0.5 + sweep * 0.3, 0.001, 0.005), 0.0, db(-8))
sfx.add(np.stack([crack(0.3, 31, 0.035), crack(0.3, 32, 0.04)]), st - 0.01, db(-1))
sfx.add(thump(1.2, 110, 34, 0.45), st, db(-2))
sfx.add(filt(white(int(1.2 * SR), 33), "lowpass", 300) * attack_decay(int(1.2 * SR), 0.003, 0.35), st, db(-6))
bed.add(np.stack([thunder(2.2, 34), thunder(2.2, 35)]), st + 0.05, db(-7))
bz_n = int((SHOT["amps"] - st) * SR)
I = np.interp(ar(bz_n) + st, [st, st + 0.15, CUE["restrike"][0], CUE["restrike"][0] + 0.05, CUE["restrike"][1],
                              CUE["restrike"][1] + 0.05, SHOT["amps"]], [1, 0.55, 0.45, 0.9, 0.5, 0.8, 0.4])
body = buzz(bz_n, 118, 41) * I * 0.5 + crackle(bz_n, 1400 * I, 42) * I * 0.8
bed.add(fade(body, 0.002, 0.03), st, db(-13), pan=0.0)
for i, rs in enumerate(CUE["restrike"]):
    sfx.add(np.stack([crack(0.25, 50 + i, 0.03, 1500), crack(0.25, 60 + i, 0.03, 1500)]), rs, db(-7))

# --- transitions
sfx.add(pan_st(whoosh(0.34, 350, 3200, 70), np.linspace(-0.2, 0.2, int(0.34 * SR))), SHOT["amps"] - 0.25, db(-9))
sfx.add(pan_st(whoosh(0.30, 200, 1400, 71, q=0.8), 0), SHOT["heat"] - 0.22, db(-8))
sfx.add(thump(0.35, 90, 45, 0.1), SHOT["heat"], db(-9))
sfx.add(pan_st(whoosh(0.34, 400, 3600, 72), np.linspace(0.8, -0.8, int(0.34 * SR))), SHOT["flash"] - 0.25, db(-9))
sfx.add(pan_st(whoosh(0.26, 300, 2200, 73, q=0.7), 0), SHOT["heart"] - 0.18, db(-10))
sfx.add(pan_st(whoosh(0.32, 500, 4000, 74), np.linspace(-0.6, 0.7, int(0.32 * SR))), SHOT["fern"] - 0.23, db(-9))
sfx.add(pan_st(whoosh(0.36, 3000, 250, 75, q=0.6), 0), SHOT["survive"] - 0.26, db(-9))

# --- S2 amps: counter ticks accelerating into the needle slam
c0, sl = CUE["count_start"], CUE["slam"]
tk, rate = c0 + 0.03, 11.0
k = 0
while tk < sl - 0.02:
    prog = (tk - c0) / (sl - c0)
    sfx.add(blip(2400 + 900 * prog, 2000 + 700 * prog, 0.03, 80 + k, 0.008), tk, db(-19 + 5 * prog), pan=0.25 * (-1) ** k)
    tk += 1.0 / (rate + 34 * prog ** 1.5)
    k += 1
hum_n = int((sl - c0) * SR)
hf = np.linspace(55, 150, hum_n)
hum = sum(np.sin(2 * np.pi * np.cumsum(hf * h) / SR) / h for h in range(1, 7)) * np.linspace(0.1, 1, hum_n)
bed.add(fade(filt(hum, "lowpass", 1400), 0.02, 0.01), c0, db(-17))
clank = sum(np.sin(2 * np.pi * f * ar(int(0.5 * SR))) * np.exp(-ar(int(0.5 * SR)) / d) * a
            for f, d, a in ((523, 0.25, 1), (1344, 0.12, 0.6), (2271, 0.08, 0.45), (3657, 0.05, 0.3)))
sfx.add(fade(clank / 2.3, 0.0005, 0.02), sl - 0.03, db(-15), pan=0.3)
sfx.add(thump(0.6, 120, 42, 0.22), sl, db(-3))
sfx.add(np.stack([crack(0.4, 90, 0.03), crack(0.4, 91, 0.03)]), sl - 0.03, db(-14))
bed.add(crackle(int(0.45 * SR), 2600 * expdecay(int(0.45 * SR), 0.15), 92), sl + 0.02, db(-15), pan=0.35)

# --- S3 heat: warm rise vs electric rise, then the 5x stamp
n = int(0.5 * SR)
warm = filt(pink(n, 100), "lowpass", 900) * np.linspace(0, 1, n) ** 1.5 + \
    0.4 * np.sin(2 * np.pi * np.cumsum(np.linspace(110, 220, n)) / SR) * np.linspace(0, 1, n)
bed.add(fade(warm, 0.01, 0.08), CUE["sun_rise"], db(-16), pan=-0.35)
br_n = int((CUE["stamp"] - CUE["bolt_rise"]) * SR)
rise = np.sin(2 * np.pi * np.cumsum(np.geomspace(260, 2600, br_n)) / SR) * np.linspace(0.2, 1, br_n)
rise = 0.5 * rise + crackle(br_n, np.linspace(300, 4000, br_n), 101) * np.linspace(0.2, 1, br_n)
bed.add(fade(rise, 0.01, 0.01), CUE["bolt_rise"], db(-14), pan=0.35)
sfx.add(thump(0.5, 140, 50, 0.16), CUE["stamp"], db(-5))
sfx.add(np.stack([crack(0.25, 110, 0.02, 2000), crack(0.25, 111, 0.02, 2000)]), CUE["stamp"], db(-19))
sfx.add(bell(2637, 0.9, 0.3) * 0.5, CUE["stamp"] + 0.01, db(-22))

# --- S4 x-ray: scan, current flowing over the skin, the tag pop, heartbeats
n = int(0.38 * SR)
scan = np.sign(np.sin(2 * np.pi * np.cumsum(np.linspace(1500, 900, n)) / SR)) * (0.6 + 0.4 * np.sin(2 * np.pi * 32 * ar(n)))
sfx.add(fade(filt(scan, "bandpass", [600, 4000]) * np.hanning(n), 0.005, 0.02), CUE["scan"], db(-24),
        pan=np.linspace(-0.3, 0.3, n))
f0, f1 = SHOT["flash"] + 0.3, SHOT["fern"]
n = int((f1 - f0) * SR)
cur_env = np.minimum(1, ar(n) / 0.15)
flow = np.stack([crackle(n, 2200, 120 + s, 2500, 11000, 0.0009) for s in (0, 1)]) * 0.55
flow += np.stack([filt(pink(n, 130 + s), "bandpass", [3000, 9000]) for s in (0, 1)]) * 0.18
flow += pan_st(buzz(n, 100, 140, 0.3) * 0.22, 0)
bed.add(flow * cur_env * np.stack([0.8 + 0.2 * np.sin(ar(n) * 9), 0.8 + 0.2 * np.cos(ar(n) * 9)]), f0, db(-15))
sfx.add(blip(880, 1320, 0.12, 150, 0.04), CUE["label_flash"], db(-17), pan=-0.4)
for b in CUE["beats"]:
    for dt, g in ((0, 0), (0.17, -4)):
        sfx.add(thump(0.25, 75, 42, 0.07), b + dt, db(-6 + g))
        sfx.add(filt(white(int(0.08 * SR), 160), "lowpass", 180) * expdecay(int(0.08 * SR), 0.02), b + dt, db(-14 + g))

# --- S5 Lichtenberg figure: spreading crackle, shimmer, steam puffs, tag pop
g0 = CUE["fern_grow"]
n = int(1.45 * SR)
dens = 3500 * np.sin(np.pi * np.clip(ar(n) / 1.35, 0, 1)) ** 0.6 + 50
fern = np.stack([crackle(n, dens, 170 + s, 1500, 10000, 0.0012) for s in (0, 1)])
bed.add(fade(fern, 0.005, 0.1), g0, db(-15))
t_ = ar(n)
shim = sum(np.sin(2 * np.pi * f * (1 + 0.004 * k) * t_) for k, f in enumerate((660, 990, 1320, 1760)))
shim *= np.sin(np.pi * np.clip(t_ / 1.4, 0, 1)) ** 2
bed.add(fade(shim / 4, 0.02, 0.1), g0, db(-30))
rr = np.random.default_rng(5)
for i in range(9):
    sfx.add(hiss(0.3, 180 + i, 0.08), g0 + 0.1 + i * 0.12 + rr.random() * 0.05, db(-24), pan=rr.uniform(-0.6, 0.6))
sfx.add(blip(1046, 1568, 0.12, 190, 0.04), CUE["label_fern"], db(-17))

# --- S6 survivor: icon pops, lit chime run, the "survive" sparkle; embers sizzle
ic = CUE["icons"]
for i in range(10):
    sfx.add(blip(1400, 2000, 0.05, 200 + i, 0.015), ic + i * 0.03, db(-28), pan=(i - 4.5) / 6)
notes = [86, 88, 90, 91, 93, 95, 97, 98, 100]  # D major run, above the voice
for i, m in enumerate(notes):
    sfx.add(bell(mtof(m), 0.5, 0.15) * 0.6, ic + 0.22 + i * 0.028, db(-25), pan=(i - 4.5) / 6)
sfx.add(thump(0.3, 160, 70, 0.08), ic + 0.5, db(-16), pan=0.75)  # the 10th icon greys out
sv = CUE["survive"]
for j, m in enumerate((98, 102, 105, 110)):
    sfx.add(bell(mtof(m), 1.2, 0.4) * 0.5, sv + j * 0.035, db(-25), pan=(j - 1.5) * 0.3)
sfx.add(blip(2200, 3000, 0.1, 210, 0.03), sv + 0.12, db(-26), pan=0.3)
n = int((10 - SHOT["survive"]) * SR)
bed.add(np.stack([crackle(n, 60, 220 + s, 1200, 7000, 0.002) for s in (0, 1)]), SHOT["survive"], db(-30))

# --- S7 the next storm: rumble crescendo, final crack at the flash
fs_ = CUE["final_strike"]
n = int((fs_ - SHOT["final"] + 0.1) * SR)
rum = filt(brown(n, 230), "lowpass", 200) * np.linspace(0.2, 1, n) ** 2
bed.add(pan_st(fade(rum, 0.05, 0.02), 0), SHOT["final"] - 0.1, db(-6))
sfx.add(np.stack([crack(0.4, 240, 0.08), crack(0.4, 241, 0.08)]), fs_, db(0))
sfx.add(thump(0.5, 110, 36, 0.3), fs_, db(-2))

# ---------------------------------------------------------------- score
mus = Bus()
BPM_BEAT = (SHOT["survive"] - SHOT["amps"]) / 16.0  # four 4/4 bars land exactly on the payoff cut
m0 = SHOT["amps"]
CHORDS = [(50, [50, 53, 57, 62]), (46, [46, 50, 53, 58]), (43, [43, 46, 50, 55]), (45, [45, 49, 52, 57])]  # Dm Bb Gm A


def saw(freq, n, detune=0.0, seed=0):
    t = ar(n)
    y = np.zeros(n)
    ph = np.random.default_rng(seed).random() * 6
    f = freq * (1 + detune)
    for k in range(1, int(8000 / f)):
        y += np.sin(2 * np.pi * k * f * t + ph * k) / k
    return y * 0.6


def note(freq, dur, att, tau, cutoff, voices=1, seed=0):
    n = int(dur * SR)
    y = sum(saw(freq, n, d, seed + i) for i, d in enumerate(np.linspace(-0.006, 0.006, voices) if voices > 1 else [0]))
    y = filt(y / voices, "lowpass", cutoff)
    return fade(y * attack_decay(n, att, tau), 0.001, min(0.05, dur / 3))


for bar, (root, tones) in enumerate(CHORDS):
    b0 = m0 + bar * 4 * BPM_BEAT
    # pad
    for j, m in enumerate(tones[:3]):
        pad = note(mtof(m), 4 * BPM_BEAT + 0.15, 0.25, 3.0, 900 + 300 * bar, voices=3, seed=bar * 10 + j)
        mus.add(pad, b0, db(-25), pan=(j - 1) * 0.5)
    # bass: 8ths with pumping envelope
    for e in range(8):
        n8 = int(BPM_BEAT / 2 * SR)
        bs = np.sin(2 * np.pi * mtof(root - 12) * ar(n8)) + 0.45 * filt(saw(mtof(root - 12), n8), "lowpass", 380)
        env = np.minimum(1, ar(n8) / 0.01) * np.exp(-ar(n8) / 0.16)
        mus.add(fade(bs * env, 0.002, 0.01), b0 + e * BPM_BEAT / 2, db(-16))
    # arp: 16ths, filter opening bar by bar
    pat = [0, 1, 2, 3, 2, 1, 2, 3]
    for s16 in range(16):
        m = tones[pat[s16 % 8]] + 12
        ap = note(mtof(m), BPM_BEAT / 4 * 0.95, 0.003, 0.07, 1100 + 650 * bar + 300 * (s16 % 4 == 0), seed=s16)
        mus.add(ap, b0 + s16 * BPM_BEAT / 4, db(-24), pan=0.45 * (-1) ** s16)
    # drums
    for bt in range(4):
        tb = b0 + bt * BPM_BEAT
        if bt in (0, 2) or bar >= 2:
            mus.add(thump(0.3, 150, 48, 0.12), tb, db(-17))
        hats = 4 if bar >= 1 else 2
        for h in range(hats):
            th = tb + h * BPM_BEAT / hats
            if hats == 2 and h == 0:
                continue
            hh = filt(white(int(0.04 * SR), int(th * 1000)), "highpass", 7500) * expdecay(int(0.04 * SR), 0.012)
            mus.add(hh, th, db(-27 if h % 2 else -31), pan=0.3)
# snare roll + noise riser into the payoff
roll_t0 = m0 + 15 * BPM_BEAT
for i in range(8):
    n = int(0.08 * SR)
    sn = filt(white(n, 300 + i), "bandpass", [300, 6000]) * expdecay(n, 0.03) + 0.4 * np.sin(2 * np.pi * 190 * ar(n)) * expdecay(n, 0.02)
    mus.add(sn, roll_t0 + i * BPM_BEAT / 8, db(-30 + i * 1.0))
n = int(1.2 * SR)
riser = filt(white(n, 310), "highpass", 1500) * np.linspace(0, 1, n) ** 3
mus.add(pan_st(fade(riser, 0.01, 0.005), 0), SHOT["survive"] - 1.2, db(-25))
# payoff: D major lift (relief), crash, bright arp
p0 = SHOT["survive"]
pd = SHOT["final"] - p0
crash = filt(white(int(1.6 * SR), 320), "highpass", 4500) * attack_decay(int(1.6 * SR), 0.002, 0.5)
mus.add(np.stack([crash, filt(white(int(1.6 * SR), 321), "highpass", 4500) * attack_decay(int(1.6 * SR), 0.002, 0.5)]), p0, db(-20))
mus.add(thump(0.4, 140, 45, 0.18), p0, db(-12))
for j, m in enumerate([62, 66, 69, 74]):
    mus.add(note(mtof(m), pd + 0.1, 0.05, 2.5, 2200, voices=3, seed=400 + j), p0, db(-25), pan=(j - 1.5) * 0.4)
pat = [74, 78, 81, 86, 81, 78]
for s16 in range(int(pd / (BPM_BEAT / 4))):
    ap = note(mtof(pat[s16 % 6]), BPM_BEAT / 4 * 0.9, 0.003, 0.08, 3800, seed=500 + s16)
    mus.add(ap, p0 + s16 * BPM_BEAT / 4, db(-26), pan=0.5 * (-1) ** s16)
for e in range(int(pd / (BPM_BEAT / 2))):
    n8 = int(BPM_BEAT / 2 * SR)
    mus.add(fade(np.sin(2 * np.pi * mtof(38) * ar(n8)) * np.exp(-ar(n8) / 0.18), 0.002, 0.01), p0 + e * BPM_BEAT / 2, db(-16))
# tension drone into the final flash, cut dead at the strike
f0 = SHOT["final"]
n = int((CUE["final_strike"] - f0) * SR)
dr = sum(note(mtof(m), n / SR, 0.08, 9, 700, voices=2, seed=600 + i) for i, m in enumerate((38, 45, 51)))
mus.add(pan_st(dr * np.linspace(0.4, 1.2, n), 0), f0, db(-18))
# low drone under the hook (after the strike)
n = int((m0 - CUE["strike"]) * SR)
mus.add(pan_st(note(mtof(38), n / SR, 0.3, 9, 400, voices=2, seed=700), 0), CUE["strike"] + 0.05, db(-24))

# ---------------------------------------------------------------- voice + mix
vo, vsr = sf.read(os.path.join(WORK, "narration.wav"))
vo = signal.resample_poly(vo, SR, vsr) if vsr != SR else vo
vo = filt(vo, "highpass", 90)
# presence lift (~3 kHz) + light compression
vo = vo + 0.35 * filt(vo, "bandpass", [2200, 5000])
env = np.sqrt(filt(vo ** 2, "lowpass", 20).clip(1e-12))
gr = np.minimum(1, (env / (np.percentile(env, 90) * 0.7)) ** -0.35)
vo = vo * gr
voice = np.zeros(N)
voice[: min(N, len(vo))] = vo[:N]
voice /= np.max(np.abs(voice)) + 1e-9

# sidechain: duck music/ambience under the voice
venv = np.abs(voice)
venv = signal.lfilter([1 - np.exp(-1 / (0.12 * SR))], [1, -np.exp(-1 / (0.12 * SR))], venv)
venv /= venv.max() + 1e-9
duck = 1 - 0.55 * np.clip(venv * 4, 0, 1)

ir = reverb_ir(1.2)
fx = sfx.x * (1 - 0.3 * np.clip(venv * 4, 0, 1)) + bed.x * (1 - 0.62 * np.clip(venv * 4, 0, 1))
wet = np.stack([signal.fftconvolve(fx[c], ir[c])[:N] for c in range(2)])
mus_wet = np.stack([signal.fftconvolve(mus.x[c], ir[1 - c])[:N] for c in range(2)])

sfx_bus = fx + 0.22 * wet
mus_bus = (mus.x + 0.18 * mus_wet) * duck
amb_bus = amb.x * (0.6 + 0.4 * duck)

voice_st = pan_st(voice, 0) * db(-3)
sfx_st = sfx_bus / (np.max(np.abs(sfx_bus)) + 1e-9) * db(-4)
mus_st = mus_bus / (np.max(np.abs(mus_bus)) + 1e-9) * db(-10)
amb_st = amb_bus / (np.max(np.abs(amb_bus)) + 1e-9) * db(-18)
mix = voice_st + sfx_st + mus_st + amb_st

os.makedirs(os.path.join(WORK, "stems"), exist_ok=True)
for name, x in (("voice", voice_st), ("sfx", sfx_st), ("music", mus_st), ("amb", amb_st)):
    sf.write(os.path.join(WORK, "stems", f"{name}.wav"), x.T, SR)


def true_peak_limit(x, ceiling_db=-1.0):
    """look-ahead peak limiter driven by a 4x oversampled (true-peak) detector"""
    from scipy.ndimage import minimum_filter1d
    ceil = db(ceiling_db)
    up = signal.resample_poly(x, 4, 1, axis=1)
    pk = np.abs(up).max(axis=0)[: 4 * x.shape[1]].reshape(-1, 4).max(axis=1)
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    g = minimum_filter1d(g, size=2 * int(0.003 * SR) + 1)  # gain drops before the peak arrives
    rel = np.exp(-1 / (0.06 * SR))
    out = np.empty_like(g)
    cur = 1.0
    for i, v in enumerate(g.tolist()):
        cur = v if v < cur else v + (cur - v) * rel
        out[i] = cur
    return x * out


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
