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


# ================================================================= yawns, buses, bellies (yawning-contagious)
def yawn_voice(dur=1.2, f0=260.0, f1=120.0, seed=0, breathy=0.55, formants=((820, 380), (1250, 820))):
    """a cartoon yawn: a breathy vowel whose pitch sags and whose formants slide from 'aah' to 'ooh' (mono).
    f0 -> f1 is the pitch glide (a dog: 700 -> 380; a big man: 170 -> 85)."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = f0 * (f1 / f0) ** (u ** 0.8) * (1 + 0.035 * np.sin(2 * np.pi * 5.5 * ar(n)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = sum(np.sin(k * ph) / k for k in range(1, 28))
    (a1, b1), (a2, b2) = formants
    y = svf_bp(src, a1 + (b1 - a1) * u, 0.22) + 0.55 * svf_bp(src, a2 + (b2 - a2) * u, 0.28)
    y /= np.abs(y).max() + 1e-9
    nz = filt(white(n, seed), "bandpass", [300, 3200])
    nz = svf_bp(nz, a1 + (b1 - a1) * u + 300, 0.5)
    nz /= np.abs(nz).max() + 1e-9
    env = np.sin(np.pi * u) ** 0.6 * np.minimum(1, u / 0.18)
    return fade(((1 - breathy) * y + breathy * nz) * env, 0.02, 0.12)


def stomach_growl(dur=1.0, seed=0):
    """a low hungry rumble: a sagging 70 -> 45 Hz buzz, wobbling, with gurgles on top (mono)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = 72 * (45 / 72) ** u * (1 + 0.08 * np.sin(2 * np.pi * 7 * ar(n)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.tanh(2.2 * sum(np.sin(k * ph) / k for k in range(1, 12)))
    y = filt(y, "lowpass", 420) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 3.3 * ar(n))))
    y = y / (np.abs(y).max() + 1e-9) + 0.25 * filt(gurgle(dur, seed, 10), "lowpass", 700)
    return fade(y * np.sin(np.pi * u) ** 0.5, 0.03, 0.1)


def bus_hum(n, seed=0):
    """a city bus at speed: a low diesel hum that breathes, road roar and a few rattles (stereo, n samples)"""
    t = ar(n)
    f = 46 + 3 * np.sin(2 * np.pi * 0.13 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    hum = sum(np.sin(k * ph + k) / k ** 1.3 for k in range(1, 9)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.31 * t))
    road = np.stack([filt(pink(n, seed + s), "bandpass", [80, 420]) for s in (1, 2)])   # kept under the speech band
    road /= np.abs(road).max() + 1e-9
    out = pan_st(filt(hum, "lowpass", 260), 0) * 0.55 + road * 0.35
    r = np.random.default_rng(seed)
    tk = 0.4
    while tk < n / SR - 0.1:   # loose window rattles
        m = int(0.05 * SR)
        rat = filt(white(m, int(tk * 100)), "bandpass", [1800, 5200]) * expdecay(m, 0.008) * 0.12
        i = int(tk * SR)
        out[:, i:i + m] += pan_st(rat, r.uniform(-0.8, 0.8))[:, : n - i]
        tk += r.uniform(0.9, 2.4)
    return out


# ================================================================= recorded CC0 one-shots (Kenney's audio packs)
# The curiopulse repo keeps ONE shared, CC0-only sound folder: assets/sfx/kenney/{impact,interface,ui,rpg}/*.ogg
# (assets/sfx/CREDITS.md lists the packs). Videos don't copy it: cc0() finds it in the repo checkout, sparse-checks it
# out on first use (git sparse-checkout add assets/sfx), and decodes into memory (nothing is written into the repo,
# so cleanup.sh stays happy). If the folder can't be had (offline, not pushed yet), cc0() warns once and returns a
# synthesized stand-in, so audio.py never breaks. Families (reference/sound.md): impact/impactWood_heavy,
# impact/impactSoft_medium, impact/impactGlass_light, impact/impactPunch_medium, impact/footstep_wood,
# interface/drop, interface/pluck, interface/select, interface/maximize, ui/click, ui/switch, rpg/chop,
# rpg/knifeSlice, rpg/cloth, rpg/creak, rpg/bookFlip, rpg/footstep ...
import glob as _glob
import os as _os
import re as _re
import subprocess as _sp
import sys as _sys
from fractions import Fraction as _Fraction

try:
    import pedalboard as _pb          # optional (GPL-3.0 tool, used to process audio; never shipped with a video)
except ImportError:
    _pb = None

_SFX_DIR = None
_CC0_CACHE = {}
_CC0_WARNED = set()


def _cc0_warn(msg):
    if msg not in _CC0_WARNED:
        _CC0_WARNED.add(msg)
        print(f"sfxkit: {msg}", file=_sys.stderr)


def sfx_dir():
    """the repo's shared assets/sfx folder (checked out on demand), or None"""
    global _SFX_DIR
    if _SFX_DIR is not None:
        return _SFX_DIR or None
    here = _os.path.dirname(_os.path.abspath(__file__))
    in_repo = _os.path.normpath(_os.path.join(here, "..", "..", ".."))            # videos/<slug>/src -> the repo
    repo_env = _os.environ.get("CP_REPO", _os.path.expanduser("~/Desktop/curiopulse"))
    cands = [_os.environ.get("CP_SFX"), _os.path.join(in_repo, "assets", "sfx"), _os.path.join(repo_env, "assets", "sfx")]
    found = next((c for c in cands if c and _os.path.isdir(_os.path.join(c, "kenney"))), None)
    if not found:
        for repo in (in_repo, repo_env):
            if _os.path.isdir(_os.path.join(repo, ".git")):
                r = _sp.run(["git", "-C", repo, "sparse-checkout", "add", "assets/sfx"], capture_output=True, text=True)
                if r.returncode == 0 and _os.path.isdir(_os.path.join(repo, "assets", "sfx", "kenney")):
                    found = _os.path.join(repo, "assets", "sfx")
                    break
    _SFX_DIR = found or ""
    if not found:
        _cc0_warn("assets/sfx isn't available (not on GitHub yet, or offline): cc0() plays synthesized stand-ins")
    return found


def cc0_list(pattern="*"):
    """names of the recorded sounds matching a glob, e.g. cc0_list('impact/impactWood*')"""
    d = sfx_dir()
    if not d:
        return []
    root = _os.path.join(d, "kenney")
    return sorted(_os.path.relpath(p, root)[:-4] for p in _glob.glob(_os.path.join(root, pattern + ".ogg")))


def _cc0_standin(name, seed):
    n = name.lower()
    if "footstep" in n:
        return thump(0.14, 170, 60, 0.03) * 0.8 + 0.2 * filt(white(int(0.14 * SR), seed), "bandpass", [700, 3000]) * attack_decay(int(0.14 * SR), 0.001, 0.02)
    if "knife" in n:
        return crack(0.16, seed, 0.03, 3000)
    if "chop" in n:
        return chop(seed)
    if any(k in n for k in ("glass", "bell", "bong", "pluck", "confirmation")):
        return bell(1300 + 200 * (seed % 5), 0.6, 0.2)
    if any(k in n for k in ("impact", "drop", "book", "door", "punch", "plank", "wood", "plate", "metal", "tin", "mining", "soft")):
        return thump(0.3, 240, 70, 0.07) + 0.25 * np.concatenate([crack(0.06, seed, 0.01, 1500), np.zeros(int(0.24 * SR))])
    if any(k in n for k in ("click", "switch", "select", "tick", "toggle", "rollover", "scroll", "latch", "mouse")):
        return snap(seed)
    if any(k in n for k in ("maximize", "minimize", "open", "close", "back")):
        return whoosh(0.25, 600, 3000, seed)
    if any(k in n for k in ("cloth", "leather", "belt", "scratch", "coins")):
        return rustle(0.4, seed)
    if "creak" in n:
        return creak(0.5, seed)
    if "error" in n or "glitch" in n:
        return glitch_burst(0.25, seed)
    return blip(800, 1600, 0.08, seed)


def cc0(name, seed=0, pitch=1.0, gain=1.0, stereo=False, room=0.0):
    """A recorded CC0 one-shot at 48 kHz, peak-normalised to `gain`.
    name: one file ('impact/impactWood_heavy_002') or a family ('impact/impactWood_heavy': the variant is picked by seed,
    so repeated hits differ). pitch: playback rate (1.06 = a little higher and shorter; vary it per hit). stereo: keep
    the file's stereo image as (2, n) (else mono, which Bus.add pans). room: 0..1, a small pedalboard room around the
    dry, close-miked recording (needs pedalboard; ignored without it). Place it like any atom:
        sfx.add(cc0('rpg/chop', seed=k, pitch=0.97 + 0.02 * k), c['chop'] + 0.05, db(-14), pan=0.2)"""
    key = (name, seed, round(pitch, 4), stereo, round(room, 3))
    if key not in _CC0_CACHE:
        d = sfx_dir()
        path = None
        if d:
            root = _os.path.join(d, "kenney")
            exact = _os.path.join(root, name + ".ogg")
            if _os.path.isfile(exact):
                path = exact
            else:
                fam = [p for p in _glob.glob(_os.path.join(root, name + "*.ogg"))
                       if _re.fullmatch(_re.escape(_os.path.basename(name)) + r"_?\d+", _os.path.basename(p)[:-4])]
                if fam:
                    path = sorted(fam)[np.random.default_rng(seed).integers(len(fam))]
                else:
                    _cc0_warn(f"no recorded sound '{name}' in {root}: using a synthesized stand-in")
        if path:
            import soundfile as _sf
            x, sr = _sf.read(path, always_2d=True)
            x = x.T.astype(np.float64)                                   # (ch, n)
            if x.shape[0] == 1:
                x = np.vstack([x, x])
            ratio = _Fraction(SR / (sr * pitch)).limit_denominator(2000)  # resample to 48 kHz and change the rate
            if ratio != 1:
                from scipy import signal as _signal
                x = _signal.resample_poly(x, ratio.numerator, ratio.denominator, axis=1)
            if room > 0 and _pb is not None:
                rv = _pb.Pedalboard([_pb.Reverb(room_size=0.22, damping=0.6, wet_level=0.45 * room, dry_level=1.0, width=0.8)])
                tail = np.zeros((2, int(0.35 * SR)))
                x = rv(np.hstack([x, tail]).astype(np.float32), SR).astype(np.float64)
            y = x if stereo else x.mean(axis=0)
        else:
            y = _cc0_standin(name, seed)
            if stereo:
                y = np.vstack([y, y])
        y = fade(y / (np.max(np.abs(y)) + 1e-9), 0.0005, 0.01)
        _CC0_CACHE[key] = y
    return _CC0_CACHE[key] * gain


def phys_hits(work, name=None, min_speed=60.0):
    """impacts from the baked physics (bake_physics.js -> <work>/physics.json), loudest first per moment:
    [(t, speed px/s, body a, body b)] sorted by time. Sound every bounce:
        for t, v, a, b in phys_hits(WORK, 'drop'):
            sfx.add(cc0('impact/impactWood_light', seed=int(t * 100), pitch=0.95 + v / 8000), t, hit_gain(v))"""
    import json as _json
    p = _os.path.join(work, "physics.json")
    if not _os.path.exists(p):
        return []
    data = _json.load(open(p))
    out = []
    for nm, sim in data.items():
        if name and nm != name:
            continue
        out += [(h["t"], h["speed"], h["a"], h["b"]) for h in sim["hits"] if h["speed"] >= min_speed]
    return sorted(out)


def hit_gain(speed, loud=1500.0, top_db=-10.0, range_db=18.0):
    """gain for an impact at `speed` px/s: top_db at `loud` px/s or faster, range_db quieter for a 10x slower hit"""
    return db(top_db - range_db * min(1.0, max(0.0, np.log10(loud / max(speed, 1e-3)))))


# ================================================================= exam halls, guts, 1912 labs (stomach-growl)
def scribble(dur=1.0, seed=0, rate=7.0):
    """pencil on paper: bursts of grainy friction (mono)"""
    n = int(dur * SR)
    t = ar(n)
    am = np.clip(np.sin(2 * np.pi * rate * t + 1.3 * np.sin(2 * np.pi * 1.7 * t)), 0, None) ** 1.5
    y = filt(white(n, seed), "bandpass", [2500, 8000]) * am
    y = y / (np.abs(y).max() + 1e-9) + 0.4 * crackle(n, 300, seed + 1, 3000, 9000) * am
    return fade(y, 0.01, 0.05)


def gulp(seed=0):
    """a cartoon swallow: a wet click, then a pitch drop (mono)"""
    n = int(0.34 * SR)
    y = np.zeros(n)
    m = int(0.02 * SR)
    y[:m] += filt(white(m, seed), "bandpass", [800, 3000]) * expdecay(m, 0.004)
    b = bloop(420, 140, 0.26)
    i = int(0.05 * SR)
    y[i:i + len(b)] += b[: n - i]
    return fade(y, 0.001, 0.03)


def balloon_inflate(dur=0.4, seed=0):
    """a rubber balloon stretching as it fills: a rising squeaky glide with a breath of air (mono)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = 300 * 3.2 ** (u ** 1.3) * (1 + 0.03 * np.sin(2 * np.pi * 23 * ar(n)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = svf_bp(0.3 * np.sign(np.sin(ph)) + np.sin(ph), np.full(n, 1400.0), 0.5)
    air = filt(white(n, seed), "bandpass", [1500, 6000])
    y = y / (np.abs(y).max() + 1e-9) + 0.25 * air / (np.abs(air).max() + 1e-9)
    return fade(y * np.sin(np.pi * u) ** 0.3, 0.01, 0.05)


def bagpipe_sound(dur=0.8, seed=0, chanter=(880.0,), drone_f=110.0):
    """a bagpipe: buzzy drones (A2 + A3) under a reedy chanter; every chanter note opens with a quick grace note (mono)"""
    n = int(dur * SR)
    t = ar(n)

    def reed(f):
        ph = 2 * np.pi * np.cumsum(f) / SR
        return sum(np.sin(k * ph) / k ** 0.7 for k in range(1, 18))

    dr = reed(np.full(n, drone_f) * (1 + 0.002 * np.sin(2 * np.pi * 4.5 * t))) + 0.6 * reed(np.full(n, 2 * drone_f))
    dr = filt(dr, "lowpass", 2200)
    f = np.zeros(n)
    seg = n // max(1, len(chanter))
    for i, fc in enumerate(chanter):
        a, b = i * seg, (n if i == len(chanter) - 1 else (i + 1) * seg)
        f[a:b] = fc
        f[a:min(b, a + int(0.035 * SR))] = fc * 1.12
    ch = reed(f * (1 + 0.004 * np.sin(2 * np.pi * 6 * t)))
    ch = filt(ch, "bandpass", [700, 4200]) + 0.3 * filt(ch, "highpass", 600)
    y = 0.55 * dr / (np.abs(dr).max() + 1e-9) + 0.6 * ch / (np.abs(ch).max() + 1e-9)
    return fade(np.tanh(1.4 * y) * np.minimum(1, t / 0.03), 0.01, 0.06)


def vacuum_whine(dur=0.6, seed=0):
    """a vacuum cleaner spinning up: motor buzz + rushing air + a rising whine (mono)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = 140 + 60 * np.minimum(1, u / 0.3)
    ph = 2 * np.pi * np.cumsum(f) / SR
    motor = sum(np.sin(k * ph) / k for k in range(1, 10))
    air = filt(white(n, seed), "bandpass", [700, 3200])
    whine = np.sin(2 * np.pi * np.cumsum(900 + 500 * np.minimum(1, u / 0.3)) / SR)
    y = 0.5 * motor / (np.abs(motor).max() + 1e-9) + 0.6 * air / (np.abs(air).max() + 1e-9) + 0.15 * whine
    return fade(y * np.minimum(1, u / 0.08), 0.01, 0.08)


def piano(freq, dur=0.6, seed=0, bright=1.0):
    """an old upright piano (honky-tonk): decaying partials on two strings a few cents apart (mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.zeros(n)
    for det in (1.0, 1.0045):
        for k in range(1, 9):
            fk = freq * k * det * (1 + 0.0004 * k * k)
            if fk > 9000:
                break
            y += np.sin(2 * np.pi * fk * t) * np.exp(-t * (1.5 + 1.2 * k) / max(0.3, bright)) / k ** 1.1
    y *= np.minimum(1, t / 0.002)
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.05)


RAG = {"C": (48, [64, 67, 72]), "A7": (45, [61, 64, 67]), "D7": (50, [66, 69, 72]), "G7": (43, [65, 67, 71]), "F": (41, [65, 69, 72])}


def rag(mus, t0, t1, bpm=126, gain=0.0, seed=0, chords=("C", "A7", "D7", "G7"), melody=True):
    """a silent-film stride piano: bass on 1 and 3, a chord on 2 and 4, a swung melody on top (music bus)"""
    beat = 60.0 / bpm
    mel = [76, 79, 81, 79, 76, 72, 74, 76]
    bars = int(np.ceil((t1 - t0) / (4 * beat)))
    for bar in range(bars):
        b0 = t0 + bar * 4 * beat
        root, ch = RAG[chords[bar % len(chords)]]
        for bt in range(4):
            tb = b0 + bt * beat
            if tb >= t1:
                break
            if bt % 2 == 0:
                mus.add(piano(mtof(root - 12 + (7 if bt == 2 else 0)), 0.5, seed + bt), tb, db(-14 + gain))
            else:
                for m in ch:
                    mus.add(piano(mtof(m - 12), 0.35, seed + m), tb, db(-20 + gain))
        if melody:
            sh = (root - 48) % 12
            sh = sh - 12 if sh >= 6 else sh
            for i, m in enumerate(mel):
                tm = b0 + i * beat * 0.5 + (0.08 * beat if i % 2 else 0)
                if tm >= t1:
                    break
                mus.add(piano(mtof(m + sh), 0.3, seed + i, 1.3), tm, db(-19 + gain), pan=0.2)


def key_click(seed=0):
    """a telegraph key: a metal click down, a softer one up (mono)"""
    n = int(0.12 * SR)
    y = np.zeros(n)
    for dt, g in ((0.0, 1.0), (0.07, 0.5)):
        m, i = int(0.012 * SR), int(dt * SR)
        y[i:i + m] += (filt(white(m, seed + int(dt * 100)), "bandpass", [1500, 6000]) * expdecay(m, 0.002)
                       + 0.4 * np.sin(2 * np.pi * 2400 * ar(m)) * expdecay(m, 0.003)) * g
    return y


def projector(n, seed=0, fps=18):
    """an old film projector: a soft shutter clatter + a little motor hum (mono bed, n samples)"""
    t = ar(n)
    y = np.zeros(n)
    m = int(0.008 * SR)
    for k, i in enumerate(range(0, n - m, int(SR / fps))):
        y[i:i + m] += filt(white(m, seed + k), "bandpass", [600, 2500]) * expdecay(m, 0.002) * (0.6 + 0.4 * (k % 2))
    y = filt(y, "lowpass", 1600)
    return y / (np.abs(y).max() + 1e-9) + 0.12 * np.sin(2 * np.pi * 50 * t) + 0.06 * np.sin(2 * np.pi * 100 * t)


def shush(dur=0.6, seed=0):
    """a long "SHHHH" (mono)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    y = filt(white(n, seed), "bandpass", [1800, 7000])
    return fade(y * np.sin(np.pi * u) ** 0.5 * np.minimum(1, u / 0.1), 0.02, 0.1)


# ================================================================= goosebumps: goose, cat, dog, hairs, a jump scare
def honk(dur=0.24, f0=470.0, f1=350.0, seed=0):
    """a goose honk: a buzzy reed through two nasal formants, the pitch dropping (mono)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = f0 * (f1 / f0) ** (u ** 0.6) * (1 + 0.035 * np.sin(2 * np.pi * 31 * ar(n)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = sum(np.sin(k * ph) / k ** 0.7 for k in range(1, 18))
    y = svf_bp(src, np.full(n, 1150.0), 0.25) + 0.7 * svf_bp(src, np.full(n, 2500.0), 0.3) + 0.15 * src
    y = np.tanh(1.6 * y / (np.abs(y).max() + 1e-9))
    return fade(y * attack_decay(n, 0.012, dur * 0.8), 0.004, 0.04)


def meow(dur=0.4, f0=620.0, f1=880.0, f2=520.0, seed=0):
    """a cat's 'mrrow': the pitch goes up and comes down, the mouth opens and closes (mono)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = np.where(u < 0.35, f0 + (f1 - f0) * (u / 0.35), f1 + (f2 - f1) * ((u - 0.35) / 0.65)) * (1 + 0.02 * np.sin(2 * np.pi * 7 * ar(n)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = sum(np.sin(k * ph) / k for k in range(1, 16))
    y = svf_bp(src, 900 + 900 * np.sin(np.pi * u), 0.25) + 0.5 * svf_bp(src, 2400 + 600 * np.sin(np.pi * u), 0.3)
    y /= np.abs(y).max() + 1e-9
    return fade(y * np.sin(np.pi * u) ** 0.7, 0.02, 0.08)


def cat_hiss(dur=0.5, seed=0):
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    y = filt(white(n, seed), "bandpass", [2600, 9000]) * (0.75 + 0.25 * np.sin(2 * np.pi * 38 * ar(n)))
    return fade(y / (np.abs(y).max() + 1e-9) * np.minimum(1, u / 0.06) * (1 - u) ** 0.6, 0.004, 0.08)


def purr(dur, seed=0, rate=25.0):
    """a purr: low noise chopped ~25 times a second (60-330 Hz: under the speech band, but a phone speaker still plays it)"""
    n = int(dur * SR)
    y = filt(brown(n, seed), "bandpass", [60, 330]) * (0.5 + 0.5 * np.sin(2 * np.pi * rate * ar(n))) ** 2
    return fade(y / (np.abs(y).max() + 1e-9), 0.15, 0.2)


def growl(dur, seed=0, f0=62.0):
    """a dog's low growl (under the speech band)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = f0 * (1 + 0.12 * np.sin(2 * np.pi * 3.1 * ar(n)) + 0.1 * u)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.tanh(2.5 * sum(np.sin(k * ph) / k for k in range(1, 14))) * (0.55 + 0.45 * np.sin(2 * np.pi * 27 * ar(n)) ** 2)
    y = filt(y, "lowpass", 420)
    return fade(y / (np.abs(y).max() + 1e-9) * np.sin(np.pi * u) ** 0.4, 0.05, 0.12)


def whimper(seed=0):
    """a dog's whimper: two little falling whines"""
    out = np.zeros(int(0.42 * SR))
    for dt, a, b in ((0, 1250, 820), (0.2, 1100, 700)):
        w = glide(a, b, 0.17, 0.7)
        w = w * np.sin(np.pi * np.linspace(0, 1, len(w))) ** 0.7
        i = int(dt * SR)
        out[i:i + len(w)] += w
    return fade(out, 0.002, 0.03)


def hair_zip(dur=0.45, up=True, seed=0, n_ticks=22):
    """hairs standing up (or lying back down): a quick run of tiny ticks sliding up (down) in pitch"""
    n = int(dur * SR) + int(0.05 * SR)
    y = np.zeros(n)
    r = np.random.default_rng(seed)
    m = int(0.022 * SR)
    for i in range(n_ticks):
        u = i / max(1, n_ticks - 1)
        f = 2200 * (2.4 ** (u if up else 1 - u))
        tk = np.sin(2 * np.pi * f * ar(m)) * expdecay(m, 0.005) + 0.4 * filt(white(m, seed + i), "highpass", 5000) * expdecay(m, 0.002)
        j = int((u * dur + r.uniform(0, 0.008)) * SR)
        y[j:j + m] += tk[: n - j] * r.uniform(0.6, 1)
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.02)


def shiver(dur=0.5, seed=0):
    """brrr: a tremolo of soft air, like a shudder"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    y = filt(white(n, seed), "bandpass", [500, 2600]) * (0.5 + 0.5 * np.sin(2 * np.pi * 17 * ar(n))) ** 2 * np.sin(np.pi * u) ** 0.8
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def horror_stab(dur=0.55, seed=0):
    """a jump-scare sting: a dissonant string cluster over a sub hit, with a shriek on top (mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = sum(saw(mtof(m), n, 0.3, seed + i) for i, m in enumerate((50, 56, 61, 62, 69, 74, 75)))
    y = filt(y, "lowpass", 3800) * attack_decay(n, 0.004, dur * 0.32)
    shr = glide(1500, 2300, n / SR, 0.4)[:n] * (1 + 0.3 * np.sin(2 * np.pi * 23 * t)) * attack_decay(n, 0.01, dur * 0.25)
    th = thump(min(dur, 0.5), 110, 38, 0.16)
    out = y / (np.abs(y).max() + 1e-9) + 0.35 * shr
    out[: min(n, len(th))] += 0.9 * th[: min(n, len(th))]
    return fade(out / (np.abs(out).max() + 1e-9), 0.001, 0.06)


def alarm_bell(dur=0.5, seed=0, rate=28.0, f=2100.0):
    """an old alarm bell: a hammer rattling on a bell, `rate` hits a second"""
    n = int(dur * SR)
    y = np.zeros(n)
    m = int(0.08 * SR)
    k = 0
    while k / rate < dur - 0.05:
        b = sum(np.sin(2 * np.pi * f * q * ar(m)) * a for q, a in ((1, 1), (2.4, 0.5), (3.9, 0.3))) * expdecay(m, 0.025)
        i = int(k / rate * SR)
        y[i:i + m] += b[: n - i]
        k += 1
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.08)


# ================================================================= cabin / ears / baby (ears-pop, 4 Oct 2026)
def cork_pop(seed=0, f=620.0):
    """an ear (or a cork) popping: a hollow 'pok' whose pitch drops, with a tiny puff of air (mono, 0.16 s)"""
    n = int(0.16 * SR)
    t = ar(n)
    fr = f * (0.42 + 0.58 * np.exp(-t / 0.012))
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.028)
    y += 0.5 * np.sin(2 * np.pi * np.cumsum(fr * 2.4) / SR) * np.exp(-t / 0.012)
    m = int(0.03 * SR)
    y[:m] += 0.35 * filt(white(m, seed), "bandpass", [1200, 5000]) * expdecay(m, 0.006)
    return fade(y, 0.0006, 0.02)


def burp(dur=0.24, seed=0, f0=92.0):
    """a small cartoon burp: a rough low buzz whose 'mouth' opens and closes (mono)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    t = ar(n)
    f = f0 * (1 + 0.25 * np.sin(np.pi * u) - 0.2 * u) * (1 + 0.05 * np.sin(2 * np.pi * 31 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = np.tanh(2.5 * sum(np.sin(k * ph + 0.3 * k) / k for k in range(1, 30)))
    src *= 0.65 + 0.35 * np.sign(np.sin(2 * np.pi * 27 * t + 1))                      # the flutter
    y = svf_bp(src, 420 + 420 * np.sin(np.pi * u) ** 0.8, 0.3) + 0.5 * svf_bp(src, 1050 + 300 * np.sin(np.pi * u), 0.35)
    y /= np.abs(y).max() + 1e-9
    return fade(y * np.sin(np.pi * u) ** 0.4, 0.008, 0.04)


def cabin_bed(n, seed=0):
    """a jet cabin from inside (stereo bed): the engines' low roar and the air system, all under ~420 Hz"""
    t = ar(n)
    out = []
    for ch in (0, 1):
        roar = filt(brown(n, seed + ch), "lowpass", 180)
        air = filt(pink(n, seed + 10 + ch), "bandpass", [140, 420]) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.23 * t + ch))
        hum = 0.05 * np.sin(2 * np.pi * 86 * t + ch) + 0.03 * np.sin(2 * np.pi * 172.6 * t + 2 * ch)
        out.append(roar / (np.abs(roar).max() + 1e-9) + 0.45 * air / (np.abs(air).max() + 1e-9) + hum)
    y = np.stack(out)
    return y / (np.abs(y).max() + 1e-9)


def chime(freq=880.0, dur=0.9):
    """the cabin's 'bing': a soft tone with two quick partials that rings out (mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t / 0.12)
         + 0.12 * np.sin(2 * np.pi * 3.01 * freq * t) * np.exp(-t / 0.06)) * np.exp(-t / 0.32)
    return fade(y, 0.004, 0.05)


def baby_cry(dur=0.8, seed=0, f0=440.0, rough=0.5):
    """a baby's 'waah': the pitch jumps up, wavers and sags; nasal formants and a rasp (mono).
    A grown man's comic sob: f0=230."""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    t = ar(n)
    f = f0 * (1 + 0.28 * np.sin(np.pi * np.clip(u * 1.25, 0, 1)) ** 0.7 - 0.12 * u) * (1 + 0.03 * np.sin(2 * np.pi * 7.5 * t + seed))
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = sum(np.sin(k * ph) / k for k in range(1, 24))
    src = np.tanh(1.6 * src * (1 + rough * (0.5 + 0.5 * np.sin(2 * np.pi * 62 * t))))  # the rasp
    y = (svf_bp(src, 1050.0 + 250 * np.sin(np.pi * u), 0.25) + 0.7 * svf_bp(src, np.full(n, 2700.0), 0.3)
         + 0.25 * svf_bp(src, np.full(n, 3600.0), 0.3))
    y /= np.abs(y).max() + 1e-9
    env = np.minimum(1, u / 0.06) * np.sin(np.pi * np.clip(u, 0, 1)) ** 0.35
    return fade(y * env, 0.01, 0.08)


def sneeze(seed=0, f0=300.0):
    """ah-CHOO: a quick gasp in, a burst of spray, a falling 'oo' (mono, ~0.56 s)"""
    out = np.zeros(int(0.56 * SR))
    n1 = int(0.12 * SR)
    gasp = filt(white(n1, seed), "bandpass", [500, 2600]) * np.linspace(0, 1, n1) ** 1.5
    out[:n1] += 0.5 * gasp / (np.abs(gasp).max() + 1e-9)
    n2, i2 = int(0.2 * SR), int(0.13 * SR)
    burst = filt(white(n2, seed + 1), "bandpass", [1600, 7000]) * attack_decay(n2, 0.004, 0.05)
    out[i2:i2 + n2] += burst / (np.abs(burst).max() + 1e-9)
    n3, i3 = int(0.3 * SR), int(0.17 * SR)
    u3 = np.linspace(0, 1, n3)
    f = f0 * 1.25 * 0.55 ** u3
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = sum(np.sin(k * ph) / k for k in range(1, 20))
    oo = svf_bp(src, np.full(n3, 420.0), 0.3) + 0.5 * svf_bp(src, np.full(n3, 900.0), 0.3)
    oo = oo / (np.abs(oo).max() + 1e-9) * attack_decay(n3, 0.02, 0.11)
    out[i3:i3 + n3] += 0.8 * oo[: len(out) - i3]
    return fade(out, 0.004, 0.04)


# ================================================================= daylight (sun-sneeze)
def tweet(seed=0, f=3400.0):
    """a sparrow: two or three quick upward chirps (mono, ~0.25 s). For the silences of a daytime scene: put it in a
    pause, never on a word (it sits right in the speech band)."""
    r = np.random.default_rng(seed)
    k = int(r.integers(2, 4))
    y = np.zeros(int((0.09 * k + 0.05) * SR))
    for i in range(k):
        b = blip(f * r.uniform(0.9, 1.1), f * r.uniform(1.25, 1.5), 0.06, seed + i, 0.03)
        j = int(i * 0.09 * SR)
        y[j:j + len(b)] += b[: len(y) - j]
    return y


# ================================================================= pins-needles: the studio's gong and bowl, a TV's static
def gong(dur=3.0, seed=0, f0=98.0):
    """a bronze gong struck hard: a low thud, inharmonic partials that bloom a moment after the hit and beat slowly,
    and a wash of shimmer on top (mono)"""
    n = int(dur * SR)
    t = ar(n)
    rng = np.random.default_rng(seed)
    y = np.zeros(n)
    for i, ratio in enumerate((1.0, 1.52, 2.0, 2.47, 2.98, 3.61, 4.2, 5.33, 6.1, 7.4, 8.9)):
        f = f0 * ratio * (1 + 0.004 * rng.standard_normal())
        tau = 1.8 / (1 + 0.35 * i)
        bloom = 1 - np.exp(-t / (0.02 + 0.03 * i))            # the higher partials come in a moment later
        beat = 1 + 0.25 * np.sin(2 * np.pi * (0.7 + 0.5 * rng.random()) * t + rng.random() * 6)
        y += (1.0 / (1 + 0.45 * i)) * np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t / tau) * bloom * beat
    sh = filt(white(n, seed + 1), "bandpass", [1800, 7000]) * (1 - np.exp(-t / 0.12)) * np.exp(-t / 0.5)
    y = y / (np.abs(y).max() + 1e-9) + 0.22 * sh / (np.abs(sh).max() + 1e-9)
    m = min(n, int(0.2 * SR))
    y[:m] += 0.9 * np.sin(2 * np.pi * np.cumsum(np.linspace(130, 60, m)) / SR) * expdecay(m, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.08)


def singing_bowl(freq=392.0, dur=2.5):
    """a singing bowl: a pure tone with a close twin (they beat slowly) and one bright partial (mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = (np.sin(2 * np.pi * freq * t) + 0.8 * np.sin(2 * np.pi * freq * 1.006 * t)
         + 0.3 * np.sin(2 * np.pi * freq * 2.71 * t) * np.exp(-t / 0.5)) * np.exp(-t / (dur * 0.45))
    return fade(y * np.minimum(1, t / 0.01) / 2.1, 0.002, 0.2)


def tv_static(dur=1.0, seed=0):
    """an untuned TV: white noise above the speech band, with a slow flutter (mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = filt(white(n, seed), "highpass", 2800) * (0.8 + 0.2 * np.sin(2 * np.pi * 11 * t) * np.sin(2 * np.pi * 0.7 * t))
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.03)
