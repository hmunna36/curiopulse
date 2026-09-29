"""Hypnic-jerk Short: sound design, score and mix, cue-locked to timeline.json.

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
    n = int(dur * SR)
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


# ================================================================= buses
sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()
c = C


def span(a, b):
    return int(a * SR), int(b * SR)


# ---------------------------------------------------------------- ambience beds
room = pan_st(filt(brown(N, 1), "lowpass", 180), 0) * 0.35 + np.stack([filt(pink(N, s), "bandpass", [200, 1200]) for s in (2, 3)]) * 0.04
bedroom_on = np.zeros(N)
for a, b in ((0, SHOT["title"]), (SHOT["hiccups"], DUR)):
    i0, i1 = span(a, b)
    bedroom_on[i0:i1] = 1
bedroom_on = np.convolve(bedroom_on, np.ones(int(0.15 * SR)) / int(0.15 * SR), "same")
amb.x += room * bedroom_on
crickets(0.3, c["gasp"], amb, db(-12), seed=1)
crickets(SHOT["hiccups"] + 0.3, c["final_jolt"], amb, db(-12), seed=2, rate=0.9)
clock_ticks(0.2, c["gasp"], amb, db(-9))
clock_ticks(c["goodnight"] + 0.4, c["final_jolt"], amb, db(-9))
# sleepy breathing in the hook
for k, tb in enumerate(np.arange(0.25, c["gasp"] - 0.3, 2.6)):
    sfx.add(breath(1.1, 50 + k), tb, db(-31))
    sfx.add(breath(1.3, 60 + k, True), tb + 1.15, db(-33))
# city at night
i0, i1 = span(SHOT["common"], SHOT["dive"] + 0.4)
city = np.stack([filt(pink(i1 - i0, s), "bandpass", [80, 700]) for s in (5, 6)]) * np.sin(np.pi * np.linspace(0, 1, i1 - i0)) ** 0.3
amb.add(city * 0.5, SHOT["common"])
crickets(SHOT["common"], SHOT["dive"], amb, db(-12), seed=3)
# inside the head: a warm low hum + soft pulse, dive -> reality
i0, i1 = span(SHOT["dive"] + 0.4, SHOT["trees"])
n_ = i1 - i0
inner = filt(brown(n_, 7), "lowpass", 120) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.1 * ar(n_)))
inner += 0.15 * filt(pink(n_, 8), "bandpass", [2000, 6000]) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * ar(n_)))
amb.add(pan_st(fade(inner, 0.3, 0.3), 0) * 0.9, SHOT["dive"] + 0.4)
# jungle night
i0, i1 = span(SHOT["trees"], SHOT["triggers"] + 0.2)
amb.add(np.stack([filt(pink(i1 - i0, s), "bandpass", [300, 3000]) for s in (9, 10)]) * 0.12 * np.sin(np.pi * np.linspace(0, 1, i1 - i0)) ** 0.2, SHOT["trees"])
crickets(SHOT["trees"], SHOT["triggers"], amb, db(-4), seed=4, f=5600, rate=2.2)
frogs(SHOT["trees"] + 0.2, SHOT["triggers"], amb, db(-16), seed=5)
sfx.add(owl(6), SHOT["trees"] + 0.7, db(-20), pan=-0.5)

# ================================================================= the hook
g = c["gasp"]
sfx.add(scratch(0.22, 11), g - 0.06, db(-15))
jolt_hit(sfx, bed, g, 1.0, 0)
sfx.add(pan_st(whoosh(0.4, 3000, 400, 12, 0.2), 0), g + 0.02, db(-12))           # the camera whip-back
n = int((c["jumps"] - g) * SR)
sfx.add(pan_st(fade(filt(white(n, 13), "highpass", 2500) * np.linspace(0.2, 1, n) ** 2, 0.02, 0.01), 0), g + 0.1, db(-26))
j = c["jumps"]
sfx.add(thump(0.9, 110, 34, 0.3), j, db(0))
sfx.add(springs(14, 1.3), j + 0.01, db(-9))
bed.add(pan_st(creak(0.7, 15, 60, 140), -0.2), j + 0.03, db(-10))
sfx.add(pan_st(whoosh(0.5, 400, 1800, 16, 0.2), 0), j, db(-16))
for k in range(4):
    sfx.add(filt(white(int(0.2 * SR), 17 + k), "bandpass", [2000, 8000]) * attack_decay(int(0.2 * SR), 0.03, 0.08), j + 0.15 + k * 0.22, db(-30), pan=(-1) ** k * 0.5)
# the awkward silence: pounding heart + one lone cricket
for k, tb in enumerate(c["heartbeats"]):
    sfx.add(heartbeat(80 + k), tb, db(-8 - 1.2 * k))
sfx.add(cricket(90, 3, 4600), c["wow"] + 0.62, db(-14), pan=-0.4)
sfx.add(cricket(91, 3, 4650), c["wow"] + 0.62 + 0.55, db(-17), pan=-0.3)

# ================================================================= title + the city
sfx.add(pan_st(whoosh(0.35, 300, 2600, 20, 0.8), 0), SHOT["title"] - 0.25, db(-11))
sfx.add(thump(0.5, 150, 50, 0.14), SHOT["title"] + 0.05, db(-8))
jt = c["hypnic"] + 0.42
z = glide(180, 1400, 0.18, 0.7) * attack_decay(int(0.18 * SR), 0.002, 0.08)
sfx.add(fade(np.tanh(3 * z), 0.001, 0.02), jt - 0.02, db(-12))
sfx.add(thump(0.6, 130, 40, 0.2), jt, db(-4))
sfx.add(springs(21, 1.0), jt + 0.02, db(-13))
sfx.add(pan_st(whoosh(0.5, 3000, 300, 22, 0.25), 0), SHOT["common"] - 0.2, db(-13))
# windows jolting all over the building (same schedule as the picture: 70 % of 23 windows)
pops(c["window_jolts"], sfx, db(-20), seed=23)
for k in range(12):
    sfx.add(blip(2200 + 60 * k, 2000 + 60 * k, 0.03, 30 + k, 0.008), c["seventy"] - 0.1 + k * 0.055, db(-28), pan=0.3)
# the dive into the head
sfx.add(pan_st(riser(SHOT["handover"] - SHOT["dive"], 31, 300, 2400), 0), SHOT["dive"], db(-22))
sfx.add(pan_st(whoosh(0.7, 200, 3200, 32, 0.85, 0.7), 0), SHOT["dive"] + 0.05, db(-14))
sfx.add(thump(1.0, 90, 30, 0.4), SHOT["dive"] + 0.8, db(-6))
for j_, m in enumerate((84, 88, 91, 96, 100)):
    sfx.add(bell(mtof(m), 1.4, 0.4) * 0.5, SHOT["dive"] + 0.82 + j_ * 0.05, db(-24), pan=(j_ - 2) * 0.3)

# ================================================================= handover
for tp, f in ((c["handover"] - 0.05, 700), (c["handover"] + 0.2, 900)):
    sfx.add(blip(f, f * 1.5, 0.08, 40, 0.03), tp, db(-17))
    sfx.add(pan_st(whoosh(0.25, 600, 2400, 41, 0.7), 0), tp - 0.15, db(-20))
sfx.add(blip(520, 780, 0.1, 42, 0.04), c["stay"] - 0.05, db(-18), pan=0.5)
fl0, fl1 = c["passes"], c["sleepsys"] + 0.1
n = int((fl1 - fl0) * SR)
orb_s = glide(600, 1500, fl1 - fl0, 1.2) * 0.3 + filt(white(n, 43), "bandpass", [2500, 8000]) * 0.4
sfx.add(pan_st(fade(orb_s * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.5, 0.02, 0.05), np.linspace(0.6, -0.6, n)), fl0, db(-20))
for k in range(8):
    sfx.add(bell(mtof(88 + [0, 2, 4, 7, 9, 12, 14, 16][k]), 0.8, 0.25) * 0.4, fl0 + k * (fl1 - fl0) / 8, db(-26), pan=0.6 - 1.2 * k / 7)
for j_, m in enumerate((72, 76, 79, 83)):
    sfx.add(bell(mtof(m), 2.0, 0.7) * 0.5, c["sleepsys"] + 0.1 + j_ * 0.04, db(-22), pan=-0.4 + j_ * 0.1)

# ================================================================= relax
sfx.add(pan_st(whoosh(0.3, 2500, 400, 45, 0.6), 0), SHOT["relax"] - 0.2, db(-14))
n = int(1.4 * SR)
pd_ = glide(900, 120, 1.4, 0.6) * np.linspace(0.8, 0.1, n)
sfx.add(pan_st(fade(pd_, 0.01, 0.2), 0), c["slow"] + 0.2, db(-24))
n = int(1.2 * SR)
defl = filt(pink(n, 46), "lowpass", 1200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
sfx.add(pan_st(fade(filt(defl, "lowpass", 900), 0.02, 0.2), 0), c["muscles"], db(-20))

# ================================================================= glitch -> burst -> BAM
gl = c["glitch"]
sfx.add(np.stack([glitch_burst(0.55, 50), glitch_burst(0.55, 51)]), gl - 0.02, db(-12))
sfx.add(np.stack([crackle(int(0.8 * SR), 2500, 52, 1500, 10000), crackle(int(0.8 * SR), 2500, 53, 1500, 10000)]) * np.linspace(1, 0, int(0.8 * SR)), gl, db(-20))
sfx.add(pan_st(riser(c["burst"] - (gl + 0.5), 54, 150, 900), 0), gl + 0.5, db(-15))
n = int((c["burst"] - gl - 0.5) * SR)
bed.add(pan_st(fade(crackle(n, np.linspace(50, 3000, n), 55, 2000, 11000) * np.linspace(0.2, 1, n), 0.05, 0.005), 0), gl + 0.5, db(-22))
b0 = c["burst"]
sfx.add(np.stack([filt(crack(0.35, 60, 0.04), "lowpass", 9000), filt(crack(0.35, 61, 0.04), "lowpass", 9000)]), b0, db(-7))
sfx.add(thump(0.7, 120, 40, 0.25), b0, db(-6))
n = int((c["spine"] + 0.6 - b0) * SR)
zipd = glide(2600, 200, n / SR, 0.8) * 0.4 + 0.6 * crackle(n, 1800, 62, 1500, 9000)
bed.add(pan_st(fade(filt(zipd, "highpass", 3500) * np.linspace(1, 0.4, n), 0.01, 0.1), 0), b0 + 0.05, db(-20))
for k in range(10):
    sfx.add(blip(1500 - 100 * k, 1200 - 90 * k, 0.05, 63 + k, 0.015), b0 + 0.35 + k * 0.33, db(-26), pan=0.3 * (-1) ** k)
bm = c["bam"]
sfx.add(thump(1.2, 110, 30, 0.45), bm, db(1))
sfx.add(np.stack([crack(0.5, 70, 0.06), crack(0.5, 71, 0.06)]), bm, db(-3))
sfx.add(pan_st(whoosh(0.35, 3000, 500, 72, 0.15), 0), bm, db(-10))
n = int(2.4 * SR)
tw = np.tanh(3 * buzz(n, 95, 73, 0.9)) * attack_decay(n, 0.005, 0.5) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * ar(n))))
bed.add(pan_st(fade(tw, 0.002, 0.2), 0), bm + 0.02, db(-16))
sfx.add(springs(74, 1.2), bm + 0.03, db(-15))

# ================================================================= the falling feeling
d0 = SHOT["dream"]
n = int((SHOT["panic"] - d0 + 0.25) * SR)
wind = np.stack([svf_bp(pink(n, 80 + s), 500 + 400 * np.sin(2 * np.pi * 0.9 * ar(n) + s), 0.6) for s in (0, 1)])
wind /= np.abs(wind).max() + 1e-9
sfx.add(fade(wind * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.4, 0.05, 0.1), d0 - 0.1, db(-19))
sfx.add(pan_st(slide_whistle(1.3, 1900, 520), 0), c["feeling"] - 0.05, db(-25))

# ================================================================= the panic
p0 = SHOT["panic"]
n = int((c["limp"] + 0.5 - c["idea"]) * SR)
sfx.add(pan_st(fade(glide(700, 250, n / SR, 0.7) * np.sin(2 * np.pi * 7 * ar(n)) * 0.2 + glide(700, 250, n / SR, 0.7) * 0.3, 0.05, 0.1), 0.2), c["idea"] + 0.1, db(-27))
for k in range(int((c["panics"] - p0) / 0.5)):
    sfx.add(blip(1800, 1800, 0.02, 90 + k, 0.005), p0 + 0.2 + k * 0.5, db(-30), pan=0.4)
pa = c["panics"]
stab = sum(note(mtof(m), 0.9, 0.005, 0.35, 3000, voices=3, seed=100 + i) for i, m in enumerate((45, 46, 51, 52, 57)))
sfx.add(pan_st(fade(stab / 3, 0.002, 0.2), 0), pa - 0.03, db(-20))
sfx.add(thump(0.6, 100, 38, 0.2), pa, db(-8))
sf0 = pa + 0.1
sl = c["slams"]
bed.add(pan_st(siren(END["panic"] - sf0 + 0.3, 101), 0.1), sf0, db(-28))
sfx.add(pan_st(scratch(0.18, 102), 0), c["wait"] - 0.05, db(-22))
sfx.add(pan_st(whoosh(0.3, 400, 3000, 103, 0.9), 0), c["fallingq"] - 0.1, db(-16))
# the button: cover flips, fist drops, SLAM + klaxon
bt = sl - 0.4
sfx.add(filt(white(int(0.03 * SR), 104), "bandpass", [2000, 7000]) * expdecay(int(0.03 * SR), 0.005), bt + 0.05, db(-14))
sfx.add(blip(1200, 800, 0.08, 105, 0.03), bt + 0.1, db(-20))
sfx.add(pan_st(whoosh(0.32, 300, 2600, 106, 0.95), 0), sl - 0.3, db(-10))
sfx.add(thump(1.0, 100, 30, 0.4), sl, db(2))
sfx.add(np.stack([crack(0.3, 107, 0.04, 1500), crack(0.3, 108, 0.04, 1500)]), sl, db(-6))
sfx.add(pan_st(klaxon(0.36, 109), 0), sl + 0.02, db(-13))

# ================================================================= reality (split screen)
r0 = SHOT["reality"]
n = int((SHOT["trees"] - r0) * SR)
muff = np.stack([filt(pink(n, 120 + s), "bandpass", [300, 1200]) for s in (0, 1)]) * 0.5
sfx.add(fade(muff, 0.05, 0.1), r0, db(-22))
crickets(r0 + 0.1, SHOT["trees"], amb, db(-8), seed=121)
rj = c["happening"] + 0.45
sfx.add(thump(0.4, 110, 45, 0.1), rj, db(-10))
sfx.add(springs(122, 0.7), rj, db(-18))
bed.add(pan_st(creak(0.35, 123), 0), rj + 0.02, db(-18))

# ================================================================= the tree theory
tr = c["tree"]
bed.add(pan_st(creak(1.4, 130, 40, 90, (300, 650, 1300)), 0.3), c["reflex"] - 0.1, db(-23))
bed.add(pan_st(creak(0.45, 131, 60, 160, (300, 650, 1300)), 0.3), tr - 0.45, db(-26))
sfx.add(thump(0.6, 100, 40, 0.2), tr, db(-4))
sfx.add(np.stack([rustle(1.3, 132), rustle(1.3, 133)]), tr, db(-9))
sfx.add(pan_st(squeak(0.12, 2000, 3000), -0.3), tr + 0.05, db(-15))
sfx.add(pan_st(squeak(0.1, 2400, 3300), -0.3), tr + 0.22, db(-17))
for k in range(6):
    sfx.add(filt(white(int(0.25 * SR), 134 + k), "bandpass", [2000, 7000]) * attack_decay(int(0.25 * SR), 0.05, 0.1), tr + 0.3 + k * 0.28, db(-28), pan=np.sin(k) * 0.6)
up = c["unproven"]
sfx.add(thump(0.5, 160, 60, 0.12), up - 0.02, db(-5))
sfx.add(filt(white(int(0.08 * SR), 140), "bandpass", [800, 4000]) * expdecay(int(0.08 * SR), 0.02), up - 0.02, db(-10))

# ================================================================= triggers
for k, (tp, f) in enumerate(((c["stress"], 440), (c["caffeine"], 550), (c["short"], 660))):
    sfx.add(pan_st(whoosh(0.25, 800, 3000, 150 + k, 0.8), np.linspace(0.7, 0, int(0.25 * SR))), tp - 0.2, db(-23))
    sfx.add(blip(f, f * 1.5, 0.1, 155 + k, 0.04), tp, db(-15))
n = int(0.4 * SR)
ring_ = np.sin(2 * np.pi * 2100 * ar(n)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 28 * ar(n)))) * expdecay(n, 0.2)
sfx.add(fade(ring_, 0.002, 0.05), c["short"] + 0.15, db(-24), pan=0.2)
n = int(1.0 * SR)
sfx.add(pan_st(fade(glide(300, 1100, 1.0, 1.3) * np.linspace(0.3, 1, n), 0.01, 0.05), 0), c["likely"] - 0.35, db(-26))
hl = c["harmless"]
sfx.add(pan_st(whoosh(0.4, 3000, 600, 160, 0.3), 0), hl - 0.2, db(-18))
for j_, m in enumerate((76, 79, 84, 88, 91)):
    sfx.add(bell(mtof(m), 1.6, 0.5) * 0.5, hl + j_ * 0.05, db(-20), pan=(j_ - 2) * 0.3)

# ================================================================= the hiccup reveal
sfx.add(pan_st(whoosh(0.3, 2400, 300, 170, 0.5), 0), SHOT["hiccups"] - 0.2, db(-15))
sfx.add(bell(mtof(93), 1.0, 0.25) * 0.6, c["fact"] - 0.05, db(-18))
sfx.add(bell(mtof(100), 1.0, 0.25) * 0.4, c["fact"] + 0.03, db(-22))
dr0, hc = c["twitch"] - 0.2, c["hiccups"]
sfx.add(pan_st(drumroll(hc - dr0, 171), 0.1), dr0, db(-14))
sfx.add(cymbal(172, 2.2), hc + 0.02, db(-17))
sfx.add(thump(0.4, 180, 70, 0.08), hc + 0.02, db(-10))
for k, th in enumerate((hc + 0.1, hc + 0.72)):
    sfx.add(fade(glide(380, 900, 0.07, 0.6) * attack_decay(int(0.07 * SR), 0.002, 0.03), 0.001, 0.01), th, db(-12 - 3 * k), pan=-0.3)
    sfx.add(snap(173 + k), th, db(-14 - 3 * k), pan=-0.3)
    sfx.add(thump(0.25, 160, 80, 0.05), th, db(-14 - 3 * k))

# ================================================================= goodnight ... probably ... JOLT
lie = c["goodnight"] - 0.55
bed.add(pan_st(creak(0.6, 180, 50, 110), -0.2), lie - 0.1, db(-16))
sfx.add(pan_st(fade(filt(pink(int(0.7 * SR), 181), "bandpass", [600, 5000]) * np.sin(np.pi * np.linspace(0, 1, int(0.7 * SR))), 0.01, 0.05), 0), lie, db(-22))
off = c["goodnight"] + 0.3
for k, f in enumerate((1800, 1200)):
    sfx.add(filt(white(int(0.012 * SR), 182 + k), "bandpass", [f, 6000]) * expdecay(int(0.012 * SR), 0.002), off - 0.02 + k * 0.025, db(-10), pan=0.6)
for k, tb in enumerate(np.arange(c["probably_end"] + 0.1, c["final_jolt"] - 0.4, 2.6)):
    sfx.add(breath(0.9, 185 + k), tb, db(-30))
fj = c["final_jolt"]
sfx.add(scratch(0.3, 200), fj - 0.04, db(-9))
jolt_hit(sfx, bed, fj, 1.1, 5)
bl = c["black"]
sfx.add(thump(0.9, 90, 30, 0.35), bl, db(-2))

# generic whooshes on the cuts that don't have their own transition sound
for wi, (sid, f_lo, f_hi) in enumerate((("stare", 2400, 400), ("handover", 300, 1800), ("glitch", 500, 2400), ("burst", 2400, 300),
                                         ("bam", 300, 2200), ("trees", 300, 1800), ("night", 2000, 400))):
    sfx.add(pan_st(whoosh(0.28, f_lo, f_hi, 500 + wi), 0), SHOT[sid] - 0.2, db(-17))


# ================================================================= score
BRAHMS = [  # (beat, midi, beats) — Brahms' Wiegenlied (1868, public domain), our own music-box arrangement, C major
    (0, 76, 0.5), (0.5, 76, 0.5), (1, 79, 1.5), (2.5, 76, 0.5), (3, 76, 0.5), (3.5, 79, 1.5),
    (5, 76, 0.5), (5.5, 79, 0.5), (6, 84, 1), (7, 83, 1), (8, 81, 1), (9, 81, 1), (10, 79, 1),
]


def lullaby(t0, t1, beat=0.46, gain=-20.0, start=0):
    for b, m, lb in BRAHMS[start:]:
        tn = t0 + (b - BRAHMS[start][0]) * beat
        if tn >= t1 - 0.05:
            break
        mus.add(music_box(mtof(m), 2.2, int(m + b * 10)), tn, db(gain), pan=0.15 * np.sin(b))
        # soft accompaniment: root + fifth an octave down on the downbeats
        if abs(b - round(b)) < 1e-6 and int(round(b)) % 3 == 0:
            for mm in (48, 55):
                mus.add(music_box(mtof(mm + 12), 2.5, int(mm + b)) * 0.45, tn, db(gain - 4), pan=-0.3)


def groove(t0, t1, bpm, chords, gain=0.0, seed=0, kick_on=True, snaps=True, arp=True, bass=True, padv=True, half=False, cutoff=1400):
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
            mus.add(pad([mtof(x) for x in tones[:3]], bl + 0.05, 0.3, cutoff, seed + bar), b0, db(-24 + gain), pan=0.0)
        if bass:
            for e, (bt, ln) in enumerate(((0, 1.5), (1.5, 0.5), (2, 1.5), (3.5, 0.5))):
                tb = b0 + bt * beat
                if tb >= t1:
                    break
                mus.add(pizz(mtof(r - 12), 0.5, seed + e) * 1.2, tb, db(-15 + gain))
        if arp:
            pat = [0, 2, 1, 3, 2, 1, 3, 2]
            for s8 in range(8):
                ta = b0 + s8 * beat / 2
                if ta >= t1:
                    break
                mus.add(marimba(mtof(tones[pat[s8]] + 12), 0.6, seed + s8), ta, db(-21 + gain), pan=0.4 * (-1) ** s8)
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


BPM = 108
lullaby(0.3, g + 0.01, 0.42, -25)
groove(SHOT["title"], SHOT["handover"], BPM, ["Am", "F", "C", "G"], seed=10)
crash(SHOT["title"], -24, 11)
groove(SHOT["handover"], SHOT["glitch"] + 0.5, BPM, ["F", "Em", "Dm", "C"], gain=-2, seed=20, kick_on=False, snaps=False, bass=True, half=True, cutoff=1000)
drone(SHOT["relax"], SHOT["glitch"] + 0.5, [41, 48], 350, -26, 21, 0.8)
riser_n = int((c["burst"] - (gl + 0.3)) * SR)
mus.add(pan_st(riser(riser_n / SR, 22, 100, 700), 0), gl + 0.3, db(-24))
groove(c["burst"], c["bam"], BPM * 1.0, ["Am"], gain=-1, seed=30, kick_on=True, snaps=False, arp=True, bass=True, padv=False)
for k in range(int((c["bam"] - c["burst"]) / (60 / BPM / 4))):   # driving 16th-note bass ostinato
    tb = c["burst"] + k * 60 / BPM / 4
    mus.add(pizz(mtof(45), 0.2, k) * (0.4 + 0.6 * k / 60), tb, db(-18))
crash(c["bam"], -18, 31)
groove(c["bam"], SHOT["dream"], BPM, ["Am", "F"], gain=0, seed=40)
drone(SHOT["dream"], SHOT["panic"] + 0.3, [57, 60, 64], 700, -27, 41, 0.3)
drone(SHOT["panic"], c["panics"], [33, 34], 300, -21, 50, 0.6)
drone(c["panics"], sl, [33, 34, 40], 450, -20, 51, 0.1)
crash(sl, -17, 52)
lullaby(SHOT["reality"] + 0.2, SHOT["trees"], 0.4, -28)
groove(SHOT["trees"], c["unproven"] - 0.05, 96, ["C", "Am", "F", "G"], gain=-2, seed=60, kick_on=False, snaps=True)
mus.add(thump(0.5, 160, 60, 0.12), c["unproven"], db(-12))
for k, m in enumerate((48, 52, 55, 57, 55)):                     # "...but cool": a little bass lick
    mus.add(pizz(mtof(m), 0.4, 70 + k) * 1.3, c["cool"] - 0.05 + k * 0.14, db(-14))
groove(c["cool"] + 0.65, SHOT["triggers"] + 0.1, 96, ["C"], gain=-4, seed=71, kick_on=False)
groove(SHOT["triggers"], hl - 0.1, 112, ["Am", "Dm", "E"], gain=-2, seed=80)
drone(hl - 0.1, SHOT["hiccups"] + 0.3, [48, 52, 55, 60, 64], 1600, -22, 81, 0.2)
groove(SHOT["hiccups"], c["twitch"] - 0.2, 104, ["F", "G"], gain=-5, seed=90, kick_on=False, snaps=True, padv=False)
for j_, m in enumerate((60, 64, 67, 72)):
    mus.add(pad([mtof(m)], 1.6, 0.01, 2400, 91 + j_), hc + 0.02, db(-22), pan=(j_ - 1.5) * 0.3)
lullaby(off + 0.15, fj, 0.46, -27)

# the jolt cuts: the score (and room) drop out on the hook's jolt, stop dead on the final one
i0, i1 = span(g, SHOT["title"])
mus.x[:, i0:i1] *= 0
i0 = int(fj * SR)
mus.x[:, i0:] *= 0
amb.x[:, int(bl * SR):] *= np.linspace(1, 0, N - int(bl * SR)) ** 4
# glitch: the score stutters for a moment
a = int(gl * SR)
sl_ = int(0.05 * SR)
seg = mus.x[:, a - sl_:a].copy()
for k in range(8):
    i = a + k * sl_
    mus.x[:, i:i + sl_] = seg * (0.9 - 0.08 * k)
mus.x[:, a + 8 * sl_:int((gl + 0.5) * SR)] *= 0.2

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
    mix = true_peak_limit(mix, -1.6)
loud = meter.integrated_loudness(mix.T)
mix[:, -int(0.012 * SR):] *= np.linspace(1, 0, int(0.012 * SR))
sf.write(os.path.join(WORK, "mix.wav"), mix.T, SR, subtype="PCM_24")
up = signal.resample_poly(mix, 4, 1, axis=1)
print(f"mix.wav: {mix.shape[1] / SR:.3f}s  integrated {loud:.2f} LUFS  true-peak {20 * np.log10(np.abs(up).max()):.2f} dBTP")
