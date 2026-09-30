"""CurioPulse sound kit: the synthesized SFX and instrument atoms every Short reuses, plus score helpers.

Everything is numpy/scipy synthesis (no samples). Import it from a video's audio.py:
    from sfxkit import *            # atoms + score helpers + everything sfxlib exports
Atoms return mono arrays (or (2, n) stereo where noted); place them with Bus.add(sig, t, gain, pan).
Score helpers take the music bus first: groove(mus, t0, t1, bpm, chords, ...), drone(mus, ...),
crash(mus, t), bwomp(mus, t). Grown over the hypnic-jerk and finger-wrinkles Shorts; add new atoms here
(not in a video's audio.py) when they are reusable.
"""
import numpy as np

import sfxlib as L
from sfxlib import (SR, Bus, ar, attack_decay, bell, blip, brown, buzz, crack, crackle, db, expdecay, fade, filt,  # noqa: F401
                    hiss, mtof, note, pan_st, pink, reverb_ir, saw, svf_bp, thump, thunder, true_peak_limit, white,
                    whoosh)


# ================================================================= atoms
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
    n = int(round(dur * SR))
    dur = n / SR
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


# ================================================================= timing helpers
def span(a, b):
    """seconds -> sample index pair"""
    return int(a * SR), int(b * SR)


def gate(n, spans, smooth=0.12):
    """0/1 mask that is on inside the given (t0, t1) spans, with smoothed edges (for ambience beds)"""
    m = np.zeros(n)
    for a, b in spans:
        i0, i1 = span(a, b)
        m[max(0, i0):max(0, i1)] = 1
    k = max(1, int(smooth * SR))
    return np.convolve(m, np.ones(k) / k, "same")


# ================================================================= score helpers (music bus first)
ROOTS = {"C": 48, "C#": 49, "Db": 49, "D": 50, "Eb": 51, "E": 52, "F": 53, "F#": 54, "Gb": 54, "G": 55, "Ab": 56,
         "A": 57, "Bb": 58, "B": 59}


def groove(mus, t0, t1, bpm, chords, gain=0.0, seed=0, kick_on=True, snaps=True, arp=True, bass=True, padv=True,
           half=False, cutoff=1400, sixteen=False):
    """a bouncy pad + pizzicato bass + marimba arpeggio + kick/snap/hat groove over a chord loop
    (one chord per bar, e.g. ["F", "Bb", "C", "F"], "m" suffix = minor)"""
    beat = 60.0 / bpm * (2 if half else 1)
    bars = int(np.ceil((t1 - t0) / (4 * beat)))
    for bar in range(bars):
        b0 = t0 + bar * 4 * beat
        if b0 >= t1:
            break
        name = chords[bar % len(chords)]
        minor = name.endswith("m")
        r = ROOTS[name.rstrip("m")]
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


def drone(mus, t0, t1, notes, cutoff=500, gain=-24.0, seed=0, swell=0.3):
    """sustained detuned-saw chord (MIDI notes) for tension or wonder"""
    dur = t1 - t0
    y = sum(note(mtof(m), dur, swell, 9, cutoff, voices=2, seed=seed + i) for i, m in enumerate(notes))
    mus.add(pan_st(fade(y, 0.05, 0.08), 0), t0, db(gain))


def crash(mus, t, gain=-20.0, seed=0):
    mus.add(cymbal(seed, 1.6), t, db(gain))


def bwomp(mus, t, m=34, gain=-10.0):
    """a comedic low brass-ish blat (MIDI note m)"""
    n = int(0.6 * SR)
    f = mtof(m) * (1 - 0.06 * np.minimum(1, ar(n) / 0.5))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) / k for k in range(1, 16))
    mus.add(pan_st(fade(filt(np.tanh(1.5 * y), "lowpass", 900) * attack_decay(n, 0.02, 0.3), 0.005, 0.08), 0), t, db(gain))


def silence(bus, spans):
    """hard-mute a bus inside (t0, t1) spans: the comedy stops (the score drops out for a punchline)"""
    for a, b in spans:
        i0, i1 = span(a, b)
        bus.x[:, max(0, i0):max(0, i1)] *= 0


# ================================================================= ice + drinks (brain-freeze)
def ice_crack(dur=0.9, seed=0):
    """freezing over: a sharp crack, glassy high shimmer and a crackling frost tail (mono)"""
    n = int(dur * SR)
    y = np.zeros(n)
    c = crack(min(dur, 0.3), seed, 0.035, 1500)
    y[:len(c)] += c * 0.8
    y += 0.5 * crackle(n, 1400 * expdecay(n, dur * 0.35), seed + 3, 2500, 10000)
    r = np.random.default_rng(seed)
    for k in range(5):
        b = bell(r.uniform(2600, 5200), dur - 0.02, 0.18) * 0.12
        i0 = int(r.uniform(0.0, 0.12) * SR)
        y[i0:i0 + len(b)] += b[: n - i0]
    return fade(y / (np.max(np.abs(y)) + 1e-9), 0.0005, 0.05)


def slurp(dur=0.8, seed=0, rate=14.0):
    """a straw slurp: a wobbling band of noise with bubbly gargle and a rising pitch (mono)"""
    n = int(dur * SR)
    t = ar(n)
    fc = np.linspace(500, 1300, n) * (1 + 0.25 * np.sin(2 * np.pi * rate * t))
    y = svf_bp(pink(n, seed), fc, 0.9)
    trem = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * rate * 0.5 * t + np.sin(2 * np.pi * 3 * t)))
    y = y / (np.max(np.abs(y)) + 1e-9) * trem * np.minimum(1, t / 0.04)
    return fade(y, 0.005, 0.08)


# ================================================================= kitchen + chemistry (onion-tears)
def chop(seed=0, wood=1.0):
    """a knife hitting a wooden cutting board: a woody knock plus a short blade click"""
    n = int(0.16 * SR)
    knock = thump(0.16, 520, 180, 0.03) * 0.8 * wood
    body = filt(white(n, seed), "bandpass", [600, 1400]) * attack_decay(n, 0.0008, 0.018) * 0.7
    click = filt(white(n, seed + 3), "highpass", 3500) * attack_decay(n, 0.0004, 0.006) * 0.5
    y = knock + body + click
    return fade(y / (np.max(np.abs(y)) + 1e-9), 0.0003, 0.02)


def chomp(seed=0):
    """a cartoon munch: two quick wet clicks with a low body (the enzymes eating molecules)"""
    y = np.zeros(int(0.22 * SR))
    for k, t0 in enumerate((0.0, 0.09)):
        s = thump(0.1, 380 - 60 * k, 160, 0.02) * 0.7 + filt(white(int(0.1 * SR), seed + k), "bandpass", [1200, 4000]) * attack_decay(int(0.1 * SR), 0.001, 0.01) * 0.6
        i = int(t0 * SR)
        y[i:i + len(s)] += s[:len(y) - i]
    return fade(y / (np.max(np.abs(y)) + 1e-9), 0.0005, 0.02)


def gas_hiss(dur=1.2, seed=0):
    """a soft rising fizz for gas or spray escaping"""
    n = int(dur * SR)
    y = filt(white(n, seed), "bandpass", [2500, 7000]) * np.linspace(0.2, 1, n) ** 1.5 + 0.4 * crackle(n, 400, seed + 1, 3000, 9000)
    return fade(y / (np.max(np.abs(y)) + 1e-9) * np.linspace(1, 0.7, n), 0.05, 0.15)
