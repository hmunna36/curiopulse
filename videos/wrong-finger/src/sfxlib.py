"""Synthesis atoms shared with the 10 s reference (numpy/scipy only)."""
import numpy as np
from scipy import signal

SR = 48000
N = 0  # set by the caller via set_length()


def set_length(n):
    global N
    N = n


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
    def __init__(self, n=None):
        self.x = np.zeros((2, n or N))

    def add(self, sig, t0, gain=1.0, pan=0.0):
        s = sig if sig.ndim == 2 else pan_st(sig, pan)
        i0 = int(round(t0 * SR))
        if i0 < 0:
            s = s[:, -i0:]
            i0 = 0
        n = min(s.shape[1], self.x.shape[1] - i0)
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




def true_peak_limit(x, ceiling_db=-1.0):
    """look-ahead peak limiter driven by a 4x oversampled (true-peak) detector"""
    from scipy.ndimage import minimum_filter1d
    ceil = db(ceiling_db)
    up = signal.resample_poly(x, 4, 1, axis=1)
    pk = np.abs(up).max(axis=0)[: 4 * x.shape[1]].reshape(-1, 4).max(axis=1)
    g = np.minimum(1, ceil / np.maximum(pk, 1e-9))
    g = minimum_filter1d(g, size=2 * int(0.003 * SR) + 1)
    rel = np.exp(-1 / (0.06 * SR))
    out = np.empty_like(g)
    cur = 1.0
    for i, v in enumerate(g.tolist()):
        cur = v if v < cur else v + (cur - v) * rel
        out[i] = cur
    return x * out
