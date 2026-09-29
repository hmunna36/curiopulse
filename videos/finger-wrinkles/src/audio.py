"""Finger-wrinkles Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized here (numpy/scipy); the only recorded sound is the narration.
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
                    hiss, mtof, note, pan_st, pink, reverb_ir, saw, svf_bp, thump, true_peak_limit, white, whoosh)

WORK = sys.argv[1]
TL = json.load(open(os.path.join(WORK, "timeline.json")))
C = TL["cues"]
SHOT = {s["id"]: s["start"] for s in TL["shots"]}
END = {s["id"]: s["end"] for s in TL["shots"]}
DUR = TL["duration"]
N = int(round(DUR * SR))
L.set_length(N)
tt = ar(N)


# ================================================================= atoms
def tone(freq, dur, att=0.005, rel=0.02):
    n = int(dur * SR)
    return fade(np.sin(2 * np.pi * freq * ar(n)) * np.minimum(1, ar(n) / att), 0, rel)


def glide(f0, f1, dur, shape=1.0):
    n = int(round(dur * SR))
    f = f0 * (f1 / f0) ** (np.linspace(0, 1, n) ** shape)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def music_box(freq, dur=1.6, seed=0):
    """plucked comb + bell partials: bright attack, long shimmer"""
    n = int(dur * SR)
    t = ar(n)
    y = np.zeros(n)
    for ratio, amp, tau in ((1, 1.0, 0.9), (2.0, 0.35, 0.5), (3.0, 0.12, 0.3), (5.1, 0.08, 0.12), (8.2, 0.05, 0.05)):
        y += amp * np.sin(2 * np.pi * freq * ratio * t + ratio) * np.exp(-t / tau)
    y += 0.25 * filt(white(n, seed), "highpass", 5000) * np.exp(-t / 0.004)
    return fade(y * np.minimum(1, t / 0.0015), 0.0005, 0.08)


def marimba(freq, dur=0.7, seed=0, bright=1.0):
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.28) + 0.35 * bright * np.sin(2 * np.pi * freq * 4.0 * t) * np.exp(-t / 0.05)
    y += 0.12 * bright * np.sin(2 * np.pi * freq * 9.2 * t) * np.exp(-t / 0.015)
    return fade(y * np.minimum(1, t / 0.002), 0.0005, 0.04)


def pizz(freq, dur=0.5, seed=0):
    n = int(dur * SR)
    t = ar(n)
    y = sum(np.sin(2 * np.pi * freq * k * t + k) / k ** 1.2 * np.exp(-t / (0.22 / k ** 0.5)) for k in range(1, 9) if freq * k < 9000)
    return fade(filt(y, "lowpass", 3500) * np.minimum(1, t / 0.003), 0.0005, 0.03)


def pad(freqs, dur, att=0.5, cutoff=1200, seed=0, voices=3):
    n = int(dur * SR)
    y = sum(note(f, dur, att, 20, cutoff, voices=voices, seed=seed + i) for i, f in enumerate(freqs))
    env = np.minimum(1, ar(n) / att) * np.minimum(1, (dur - ar(n)) / 0.4)
    return fade(y * env / len(freqs), 0.01, 0.05)


def kick(g=1.0):
    return thump(0.35, 140, 48, 0.12) * g


def snare(seed=0, dur=0.18):
    n = int(dur * SR)
    return fade(filt(white(n, seed), "bandpass", [1500, 7000]) * expdecay(n, 0.05) + 0.5 * np.sin(2 * np.pi * 190 * ar(n)) * expdecay(n, 0.03), 0.0005, 0.02)


def hat(seed=0, tau=0.012):
    n = int(0.05 * SR)
    return filt(white(n, seed), "highpass", 7500) * expdecay(n, tau)


def snap(seed=0):
    n = int(0.06 * SR)
    return fade(filt(white(n, seed), "bandpass", [1800, 5000]) * expdecay(n, 0.008), 0.0003, 0.01)


def cymbal(seed=0, dur=2.0):
    n = int(dur * SR)
    return np.stack([filt(white(n, seed + i), "highpass", 5000) * attack_decay(n, 0.002, 0.6) for i in (0, 1)])


def creak(dur, seed, f0=70, f1=180, res=(420, 950, 1800)):
    """wooden stick-slip creak: a jittery impulse train through a few resonances"""
    n = int(dur * SR)
    r = np.random.default_rng(seed)
    f = np.linspace(f0, f1, n) * (1 + 0.25 * filt(r.standard_normal(n), "lowpass", 8))
    ph = np.cumsum(f) / SR
    imp = np.zeros(n)
    idx = np.where(np.diff(np.floor(ph)) > 0)[0]
    imp[idx] = r.uniform(0.5, 1.0, len(idx))
    y = sum(filt(imp, "bandpass", [fr * 0.9, fr * 1.1]) * a for fr, a in zip(res, (1.0, 0.7, 0.4)))
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6
    return fade(y * env / (np.abs(y).max() + 1e-9), 0.005, 0.03)


def springs(seed=0, dur=0.9):
    """mattress springs: detuned metallic twangs with a wobbling pitch"""
    n = int(dur * SR)
    t = ar(n)
    y = np.zeros(n)
    for f, a, tau in ((210, 1.0, 0.35), (523, 0.5, 0.2), (1370, 0.25, 0.1), (2600, 0.12, 0.05)):
        fm = f * (1 + 0.06 * np.exp(-t / 0.15) * np.sin(2 * np.pi * 22 * t))
        y += a * np.sin(2 * np.pi * np.cumsum(fm) / SR) * np.exp(-t / tau)
    return fade(y * np.minimum(1, t / 0.002), 0.0005, 0.05)


def scratch(dur=0.32, seed=0):
    """record scratch: back-and-forth pitch warble through a moving band"""
    n = int(dur * SR)
    t = ar(n) / dur
    mod = np.sin(2 * np.pi * (1.5 * t + 0.8 * t * t))
    fc = 900 + 700 * mod
    y = svf_bp(pink(n, seed), np.abs(fc) + 300, 0.35)
    tone_ = glide(700, 1400, dur, 1.0) * (0.5 + 0.5 * mod)
    y = y / (np.abs(y).max() + 1e-9) + 0.35 * tone_
    return fade(y * np.sin(np.pi * np.clip(t * 1.1, 0, 1)) ** 0.5, 0.002, 0.03)


def cricket(seed=0, pulses=3, f=4700):
    y = np.zeros(int(0.12 * SR))
    for k in range(pulses):
        n = int(0.014 * SR)
        p = np.sin(2 * np.pi * f * ar(n)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
        i = int(k * 0.024 * SR)
        y[i:i + n] += p
    return y


def crickets(t0, t1, bus, gain, seed=0, f=4700, rate=1.1):
    r = np.random.default_rng(seed)
    tk = t0 + r.uniform(0, 0.4)
    while tk < t1:
        bus.add(cricket(r.integers(1000), r.integers(2, 5), f * r.uniform(0.97, 1.03)), tk, gain * r.uniform(0.5, 1.0), pan=r.uniform(-0.8, 0.8))
        tk += r.uniform(0.35, 1.0) / rate


def clock_ticks(t0, t1, bus, gain):
    k, tk = 0, np.ceil(t0)
    while tk < t1:
        n = int(0.02 * SR)
        y = filt(white(n, 700 + k), "bandpass", [1800 if k % 2 else 2400, 6000]) * expdecay(n, 0.003)
        bus.add(y, tk, gain, pan=0.5)
        tk += 1.0
        k += 1


def breath(dur, seed, exhale=False):
    n = int(dur * SR)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** (1.6 if not exhale else 0.9)
    y = filt(white(n, seed), "bandpass", [350, 2400] if not exhale else [220, 1500]) * env
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def heartbeat(seed=0, g=1.0):
    out = np.zeros(int(0.45 * SR))
    for dt, gg in ((0, 1.0), (0.16, 0.65)):
        th = thump(0.26, 82, 42, 0.07) * gg
        th += 0.35 * gg * filt(white(len(th), seed), "lowpass", 180) * expdecay(len(th), 0.02)
        i = int(dt * SR)
        out[i:i + len(th)] += th[: len(out) - i]
    return out * g


def jolt_hit(bus, bed, t, big=1.0, seed=0):
    """the hypnic jerk itself: sub kick + bed creak + duvet whoosh + springs"""
    bus.add(thump(0.8, 120, 36, 0.22), t, db(-2) * big)
    bus.add(np.stack([crack(0.16, 40 + seed, 0.02, 2200), crack(0.16, 41 + seed, 0.02, 2200)]), t, db(-14) * big)
    bus.add(pan_st(whoosh(0.35, 500, 2500, 42 + seed, 0.3), 0), t - 0.02, db(-11) * big)
    bed.add(pan_st(creak(0.55, 43 + seed), 0.2), t + 0.02, db(-17) * big)
    bus.add(springs(44 + seed), t + 0.01, db(-21) * big, pan=-0.1)


def pops(times, bus, gain, seed=0):
    r = np.random.default_rng(seed)
    for i, ti in enumerate(times):
        f = r.uniform(500, 1300)
        bus.add(blip(f, f * 1.6, 0.07, 800 + i, 0.02), ti, gain, pan=r.uniform(-0.7, 0.7))
        bus.add(springs(900 + i, 0.4) * 0.5, ti + 0.01, gain * db(-8), pan=r.uniform(-0.7, 0.7))


def siren(dur, seed=0):
    n = int(dur * SR)
    t = ar(n)
    f = 620 + 280 * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 1.6 * t)))
    f = filt(f, "lowpass", 30)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR)
    y = np.tanh(2.2 * y) + 0.3 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR)
    return fade(filt(y, "bandpass", [300, 4000]), 0.02, 0.05)


def klaxon(dur=0.7, seed=0):
    """comedic 'awooga': a buzzy saw that swoops up, through a vowel-ish band"""
    n = int(dur * SR)
    t = ar(n) / dur
    f = 180 + 260 * np.clip(t * 1.6, 0, 1) ** 0.7
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) / k for k in range(1, 18))
    fc = 700 + 900 * np.clip(t * 1.6, 0, 1)
    y = 0.6 * filt(y, "bandpass", [500, 2600]) + 0.4 * np.tanh(1.5 * y)
    return fade(y * np.minimum(1, ar(n) / 0.02) * np.where(t > 0.85, (1 - t) / 0.15, 1), 0.005, 0.02)


def squeak(dur=0.14, f0=1900, f1=2900):
    n = int(dur * SR)
    t = ar(n)
    f = np.linspace(f0, f1, n) * (1 + 0.03 * np.sin(2 * np.pi * 38 * t))
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7, 0.002, 0.02)


def owl(seed=0):
    out = np.zeros(int(1.2 * SR))
    for dt, f in ((0, 410), (0.45, 380)):
        n = int(0.32 * SR)
        y = np.sin(2 * np.pi * np.cumsum(np.linspace(f * 1.05, f, n)) / SR) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
        y += 0.2 * filt(white(n, seed), "bandpass", [300, 800]) * np.sin(np.pi * np.linspace(0, 1, n))
        out[int(dt * SR):int(dt * SR) + n] += y
    return out


def frogs(t0, t1, bus, gain, seed=0):
    r = np.random.default_rng(seed)
    tk = t0 + r.uniform(0, 0.3)
    while tk < t1:
        n = int(r.uniform(0.12, 0.25) * SR)
        t = ar(n)
        y = np.sin(2 * np.pi * r.uniform(260, 420) * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * r.uniform(18, 26) * t)))
        bus.add(fade(filt(y, "lowpass", 1800) * np.sin(np.pi * np.linspace(0, 1, n)), 0.005, 0.02), tk, gain * r.uniform(0.5, 1), pan=r.uniform(-0.9, 0.9))
        tk += r.uniform(0.4, 1.2)


def rustle(dur, seed):
    n = int(dur * SR)
    r = np.random.default_rng(seed)
    gate = (filt(r.standard_normal(n), "lowpass", 30) > 0.3).astype(float)
    gate = filt(gate, "lowpass", 60)
    return fade(filt(white(n, seed), "bandpass", [1500, 9000]) * gate * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.5, 0.01, 0.05)


def glitch_burst(dur, seed):
    n = int(dur * SR)
    r = np.random.default_rng(seed)
    y = np.zeros(n)
    i = 0
    while i < n:
        L_ = int(r.uniform(0.01, 0.05) * SR)
        kind = r.integers(3)
        seg = np.sin(2 * np.pi * r.uniform(200, 2400) * ar(L_)) if kind == 0 else white(L_, int(r.integers(1_000_000)))
        if kind == 2:
            seg = np.round(buzz(L_, r.uniform(60, 200), int(r.integers(1_000_000))) * 4) / 4
        y[i:i + L_] = seg[: n - i] * r.uniform(0.3, 1.0)
        i += L_ + int(r.uniform(0, 0.02) * SR)
    return fade(filt(y, "highpass", 150), 0.002, 0.02)


def riser(dur, seed=0, f0=200, f1=1600):
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 1500) * np.linspace(0, 1, n) ** 3 + 0.3 * glide(f0, f1, dur, 1.5) * np.linspace(0, 1, n) ** 2
    return fade(y, 0.01, 0.005)


def slide_whistle(dur, f0=1900, f1=500):
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (f1 / f0) ** (t / dur) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.1 * filt(white(n, 5), "bandpass", [800, 3000])
    return fade(y * np.minimum(1, t / 0.05), 0.01, 0.1)


def drumroll(dur, seed=0):
    n = int(dur * SR)
    y = np.zeros(n)
    tk, k = 0.0, 0
    while tk < dur - 0.02:
        s = snare(seed + k, 0.08) * (0.25 + 0.75 * (tk / dur) ** 1.4)
        i = int(tk * SR)
        y[i:i + len(s)] += s[: n - i]
        tk += 1.0 / (14 + 12 * tk / dur)
        k += 1
    return y


# ================================================================= new atoms (water, comedy, props)
def splash(dur=0.9, seed=0, big=1.0):
    n = int(dur * SR)
    t = ar(n)
    y = filt(white(n, seed), "bandpass", [300, 7000]) * attack_decay(n, 0.004, 0.16 * big)
    y += 0.6 * crackle(n, 2600 * expdecay(n, 0.25), seed + 1, 1500, 9000, 0.0012)
    y += 0.5 * filt(pink(n, seed + 2), "lowpass", 900) * attack_decay(n, 0.01, 0.3)
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.08)


def bloop(f0=180, f1=55, dur=0.5):
    n = int(dur * SR)
    return fade(glide(f0, f1, dur, 0.5) * attack_decay(n, 0.004, 0.14), 0.001, 0.05)


def drip(seed=0, f=1500):
    n = int(0.12 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f * (1 - 0.35 * np.minimum(1, t / 0.03))) / SR) * attack_decay(n, 0.001, 0.035)
    return fade(y + 0.2 * filt(white(n, seed), "highpass", 4000) * expdecay(n, 0.003), 0.0005, 0.02)


def gurgle(dur, seed=0, rate=18):
    n = int(dur * SR)
    y = np.zeros(n)
    r = np.random.default_rng(seed)
    tk = 0.0
    while tk < dur - 0.06:
        m = int(r.uniform(0.02, 0.05) * SR)
        f0 = r.uniform(250, 600)
        b = glide(f0, f0 * r.uniform(1.6, 2.6), m / SR, 0.6) * np.sin(np.pi * np.linspace(0, 1, m))
        i = int(tk * SR)
        y[i:i + m] += b[: n - i] * r.uniform(0.4, 1)
        tk += r.exponential(1 / rate)
    return fade(y, 0.005, 0.02)


def squelch(dur=0.5, seed=0):
    n = int(dur * SR)
    t = ar(n) / dur
    fc = 300 + 1200 * np.abs(np.sin(np.pi * t * 1.5))
    y = svf_bp(pink(n, seed), fc, 0.35)
    y = y / (np.abs(y).max() + 1e-9) * np.sin(np.pi * t) ** 0.6 * (0.7 + 0.3 * np.sin(2 * np.pi * 14 * ar(n)))
    return fade(y, 0.005, 0.03)


def buzzer(dur=0.45):
    n = int(dur * SR)
    t = ar(n)
    y = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.6 + np.sign(np.sin(2 * np.pi * 164 * t)) * 0.4
    return fade(filt(y, "lowpass", 2200) * np.minimum(1, t / 0.01), 0.002, 0.04)


def wahwah(seed=0):
    out = np.zeros(int(1.2 * SR))
    for k, (m, d) in enumerate(((58, 0.34), (57, 0.62))):
        n = int(d * SR)
        t = ar(n)
        f = mtof(m) * (1 + (0.02 * np.sin(2 * np.pi * 6 * t) if k == 1 else 0))
        ph = 2 * np.pi * np.cumsum(np.full(n, 1.0) * f) / SR
        y = sum(np.sin(j * ph) / j for j in range(1, 14))
        cut = 300 + 1500 * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.7
        z = np.zeros(n)
        for i0 in range(0, n, 480):  # piecewise filter sweep (the mute opening and closing)
            seg = y[i0:i0 + 480]
            z[i0:i0 + len(seg)] = filt(seg, "lowpass", float(cut[i0]))
        i = int((0 if k == 0 else 0.38) * SR)
        out[i:i + n] += fade(z * np.minimum(1, t / 0.03), 0.01, 0.06)
    return out


def bonk():
    n = int(0.25 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * 520 * t) * np.exp(-t / 0.05) + 0.5 * np.sin(2 * np.pi * 1310 * t) * np.exp(-t / 0.02)
    return fade(y + 0.3 * filt(white(n, 5), "highpass", 3000) * expdecay(n, 0.002), 0.0005, 0.02)


def engine(dur=1.0, seed=0):
    n = int(dur * SR)
    t = ar(n) / dur
    f = 55 + 120 * np.sin(np.pi * np.clip(t * 1.2, 0, 1)) ** 0.8
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph + k) / k for k in range(1, 22)) * (0.8 + 0.2 * np.sin(2 * np.pi * 31 * ar(n)))
    return fade(filt(np.tanh(1.8 * y), "lowpass", 1400) * np.sin(np.pi * np.clip(t, 0, 1)) ** 0.5, 0.02, 0.1)


def jingle(dur=1.2, seed=0, rate=40):
    n = int(dur * SR)
    y = np.zeros(n)
    r = np.random.default_rng(seed)
    tk = 0.0
    while tk < dur - 0.1:
        f = r.uniform(3000, 6200)
        m = int(0.09 * SR)
        b = sum(np.sin(2 * np.pi * f * q * ar(m)) * a for q, a in ((1, 1), (1.47, 0.5), (2.09, 0.3))) * expdecay(m, 0.03)
        i = int(tk * SR)
        y[i:i + m] += b[: n - i] * r.uniform(0.3, 1)
        tk += r.exponential(1 / rate)
    return fade(y / (np.abs(y).max() + 1e-9), 0.005, 0.1)


def pen_tick(seed=0):
    n = int(0.09 * SR)
    return fade(filt(white(n, seed), "bandpass", [1800, 6000]) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.8, 0.002, 0.01)


def shutter():
    y = np.zeros(int(0.12 * SR))
    for dt in (0, 0.05):
        n = int(0.02 * SR)
        i = int(dt * SR)
        y[i:i + n] += filt(white(n, int(dt * 100)), "bandpass", [1500, 7000]) * expdecay(n, 0.004)
    return y


def crumple(dur=0.6, seed=0):
    n = int(dur * SR)
    dens = 2500 * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 + 100
    y = crackle(n, dens, seed, 800, 6000, 0.0015)
    return fade(y * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.4, 0.005, 0.05)


def ticking(t0, t1, bus, gain, r0=4, r1=22, seed=0):
    tk, k = t0, 0
    while tk < t1:
        p = (tk - t0) / max(1e-6, t1 - t0)
        n = int(0.015 * SR)
        bus.add(filt(white(n, seed + k), "bandpass", [2200 if k % 2 else 3000, 7000]) * expdecay(n, 0.003), tk, gain, pan=0.4 * (-1) ** k)
        tk += 1.0 / (r0 + (r1 - r0) * p)
        k += 1


# ================================================================= buses
sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()
c = C


def span(a, b):
    return int(a * SR), int(b * SR)


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
def groove(t0, t1, bpm, chords, gain=0.0, seed=0, kick_on=True, snaps=True, arp=True, bass=True, padv=True, half=False, cutoff=1400, sixteen=False):
    beat = 60.0 / bpm * (2 if half else 1)
    bars = int(np.ceil((t1 - t0) / (4 * beat)))
    roots = {"C": 48, "D": 50, "E": 52, "F": 53, "G": 55, "A": 57, "B": 59, "Bb": 58}
    for bar in range(bars):
        b0 = t0 + bar * 4 * beat
        if b0 >= t1:
            break
        name = chords[bar % len(chords)]
        minor = name.endswith("m")
        r = roots[name.rstrip("m")]
        tones = [r, r + (3 if minor else 4), r + 7, r + 12]
        bl = min(4 * beat, t1 - b0)
        if padv:
            mus.add(pad([mtof(x) for x in tones[:3]], bl + 0.05, 0.3, cutoff, seed + bar), b0, db(-25 + gain))
        if bass:
            for e, bt in enumerate((0, 1.5, 2, 3, 3.5)):
                tb = b0 + bt * beat
                if tb >= t1:
                    break
                mus.add(pizz(mtof(r - 12 + (7 if bt == 3 else 0)), 0.45, seed + e) * 1.2, tb, db(-15 + gain))
        if arp:
            pat = [0, 2, 1, 3, 2, 1, 3, 2]
            steps = 16 if sixteen else 8
            for s8 in range(steps):
                ta = b0 + s8 * beat * (4 / steps)
                if ta >= t1:
                    break
                mus.add(marimba(mtof(tones[pat[s8 % 8]] + 12), 0.5, seed + s8), ta, db(-21 + gain), pan=0.4 * (-1) ** s8)
        for bt in range(4):
            tb = b0 + bt * beat
            if tb >= t1:
                break
            if kick_on and bt in (0, 2):
                mus.add(kick(), tb, db(-16 + gain))
            if snaps and bt in (1, 3):
                mus.add(snap(int(tb * 100)), tb, db(-18 + gain), pan=0.25)
            mus.add(hat(int(tb * 1000) % 100000), tb + beat / 2, db(-30 + gain), pan=-0.3)


def drone(t0, t1, notes, cutoff=500, gain=-24.0, seed=0, swell=0.3):
    dur = t1 - t0
    y = sum(note(mtof(m), dur, swell, 9, cutoff, voices=2, seed=seed + i) for i, m in enumerate(notes))
    mus.add(pan_st(fade(y, 0.05, 0.08), 0), t0, db(gain))


def crash(t, gain=-20.0, seed=0):
    mus.add(cymbal(seed, 1.6), t, db(gain))


def bwomp(t, m=34, gain=-10.0):  # a comedic low brass-ish blat
    n = int(0.6 * SR)
    f = mtof(m) * (1 - 0.06 * np.minimum(1, ar(n) / 0.5))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) / k for k in range(1, 16))
    mus.add(pan_st(fade(filt(np.tanh(1.5 * y), "lowpass", 900) * attack_decay(n, 0.02, 0.3), 0.005, 0.08), 0), t, db(gain))


BPM = 112
groove(0.55, 2.15, BPM, ["F", "Bb"], gain=-3, seed=10, kick_on=False, snaps=False, padv=False, sixteen=True)
drone(2.15, c["into_end"], [65, 72, 77], 2200, -27, 11, 0.8)
bwomp(c["raisins"], 34, -12)
groove(SHOT["myth"] + 0.05, c["chuckle"], BPM, ["F", "Bb", "C", "F"], gain=-3, seed=20)
drone(SHOT["purpose"], END["purpose"], [50, 57, 64], 900, -25, 30, 0.8)
crash(c["purpose"], -22, 31)
groove(SHOT["pores"], c["buckles"] + 0.2, BPM, ["Dm", "Bb", "F", "C"], gain=-3, seed=40, snaps=False)
drone(c["squeeze"], c["buckles"] + 0.2, [38, 45], 400, -24, 41, 0.5)
bwomp(c["raisin2"] + 0.02, 31, -13)
for k in range(int((SHOT["grip"] - SHOT["proof"]) / (60 / 104))):     # sneaky detective walk (after the question)
    tb = c["know"] + 0.45 + k * 60 / 104
    if tb > c["doctors"] - 0.1:
        break
    mus.add(pizz(mtof([38, 41, 45, 44, 43, 41, 40, 41][k % 8]), 0.35, 200 + k) * 1.3, tb, db(-17))
    if k % 2:
        mus.add(snap(300 + k), tb, db(-20), pan=0.3)
for j, m in enumerate((53, 57, 60, 65)):
    mus.add(pad([mtof(m + 12)], 2.2, 0.02, 2600, 210 + j), c["doctors"] + 0.3, db(-24), pan=(j - 1.5) * 0.3)
groove(c["idea"] - 0.15, SHOT["meh"], 120, ["F", "C", "Bb", "C"], gain=-2, seed=60)
groove(SHOT["meh"], c["meh"], BPM, ["Bb", "F"], gain=-5, seed=70, kick_on=False)
groove(SHOT["pattern"] + 0.3, c["exact"] + 0.2, 120, ["Am", "F", "G", "Am"], gain=-4, seed=80, snaps=False, sixteen=True, cutoff=2200)
drone(c["exact"] + 0.2, SHOT["final"] + 0.3, [60, 64, 67, 72], 2400, -23, 81, 0.2)
groove(SHOT["final"], c["dive_back"], BPM, ["F", "Bb", "C", "F"], gain=-6, seed=90)
crash(c["snow"], -20, 91)
crash(c["dive_back"], -20, 92)
for j, m in enumerate((53, 60, 65, 69)):
    mus.add(pad([mtof(m)], 1.6, 0.01, 1800, 95 + j), c["dive_back"], db(-21), pan=(j - 1.5) * 0.3)
# comedy stops: the score drops out for the "Nope" beat, the "meh" payoff and "Science."
for a_, b_ in ((c["chuckle"], c["nope_end"] + 0.5), (c["meh"] + 0.02, SHOT["pattern"] + 0.25), (c["into_end"], c["raisins"] - 0.02)):
    i0, i1 = span(a_, b_)
    mus.x[:, i0:i1] *= 0

# ================================================================= voice + mix
vo, vsr = sf.read(os.path.join(WORK, "voice.wav"))
vo = signal.resample_poly(vo, SR, vsr) if vsr != SR else vo
if vo.ndim > 1:
    vo = vo.mean(axis=1)
vo = filt(vo, "highpass", 80)
vo = vo + 0.25 * filt(vo, "bandpass", [2500, 6000])                # a touch of presence
hop = int(0.02 * SR)
frm = vo[: len(vo) // hop * hop].reshape(-1, hop)
rms = np.sqrt((frm ** 2).mean(axis=1) + 1e-12)
act = rms > np.max(rms) * 10 ** (-42 / 20)
target = np.percentile(rms[act], 70)
gain_f = np.ones_like(rms)
gain_f[act] = np.clip(target / rms[act], 0.7, 3.2) ** 0.85
sm = np.empty_like(gain_f)
cur = 1.0
for i, gv in enumerate(gain_f.tolist()):                         # attack 60 ms, release 300 ms
    k = 1 - np.exp(-1 / (3 if gv < cur else 15))
    cur += (gv - cur) * k
    sm[i] = cur
gain_s = np.repeat(sm, hop)
vo = vo[: len(gain_s)] * gain_s
env = np.sqrt(filt(vo ** 2, "lowpass", 15).clip(1e-12))
gr = np.minimum(1, (env / (np.percentile(env[env > 1e-4], 85) * 0.9)) ** -0.3)
vo = vo * gr
voice = np.zeros(N)
voice[: min(N, len(vo))] = vo[:N]
voice /= np.max(np.abs(voice)) + 1e-9

venv = np.abs(voice)
venv = signal.lfilter([1 - np.exp(-1 / (0.12 * SR))], [1, -np.exp(-1 / (0.12 * SR))], venv)
venv /= venv.max() + 1e-9
vk = np.clip(venv * 4, 0, 1)
duck = 1 - 0.68 * vk

ir = reverb_ir(1.1)
fx = sfx.x * (1 - 0.5 * vk) + bed.x * (1 - 0.75 * vk)
wet = np.stack([signal.fftconvolve(fx[ch], ir[ch])[:N] for ch in range(2)])
mus_wet = np.stack([signal.fftconvolve(mus.x[ch], ir[1 - ch])[:N] for ch in range(2)])
sfx_bus = np.stack([filt(ch, "lowpass", 16000, 4) for ch in fx + 0.2 * wet])   # AAC drops this band anyway; sharp cracks up there ring
mus_bus = (mus.x + 0.25 * mus_wet) * duck
amb_bus = amb.x * (0.4 + 0.6 * duck)

voice_st = pan_st(voice, 0) * db(-3)
sfx_st = sfx_bus / (np.max(np.abs(sfx_bus)) + 1e-9) * db(-5)
mus_st = mus_bus / (np.max(np.abs(mus_bus)) + 1e-9) * db(-11)
amb_st = amb_bus / (np.max(np.abs(amb_bus)) + 1e-9) * db(-17)
mix = voice_st + sfx_st + mus_st + amb_st

os.makedirs(os.path.join(WORK, "stems"), exist_ok=True)
for name, x in (("voice", voice_st), ("sfx", sfx_st), ("music", mus_st), ("amb", amb_st)):
    sf.write(os.path.join(WORK, "stems", f"{name}.wav"), x.T, SR)

meter = pyln.Meter(SR)
for _ in range(3):
    loud = meter.integrated_loudness(mix.T)
    mix = mix * db(-14.0 - loud)
    mix = true_peak_limit(mix, -1.9)
loud = meter.integrated_loudness(mix.T)
mix[:, -int(0.012 * SR):] *= np.linspace(1, 0, int(0.012 * SR))
sf.write(os.path.join(WORK, "mix.wav"), mix.T, SR, subtype="PCM_24")
up = signal.resample_poly(mix, 4, 1, axis=1)
print(f"mix.wav: {mix.shape[1] / SR:.3f}s  integrated {loud:.2f} LUFS  true-peak {20 * np.log10(np.abs(up).max()):.2f} dBTP")
