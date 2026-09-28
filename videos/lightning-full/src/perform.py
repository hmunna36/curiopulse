"""Directed narration: phrase-by-phrase takes, auditioned and assembled like a voice session.

Usage: python3 perform.py <model_dir> <out_dir> <performance.json>
Writes narration.wav (24 kHz), words.json (word timings + breath/gasp events) and takes.json
(the chosen take per phrase plus every candidate with its measurements).

Same voice (af_heart) throughout. For every phrase we render takes across the voice's own
style rows, small pace offsets and optional punctuation variants ("alts"), then keep the take
whose measured delivery best matches the direction: pitch placement (low/mid/high), phrase
ending (rise for curiosity, fall for conclusions), liveliness, and length (so the cut stays in
sync). Emphasised words get a gentle lift; breaths and the gasp are built from the narrator's
own /h/ aspiration.

Every take is cached in <out_dir>/takes_cache/, so re-scoring or re-directing only renders what
is new. A phrase can pin a take with "pick": {"row": .., "mult": .., "text": ..}.
"""
import hashlib
import json
import os
import sys

import numpy as np
import soundfile as sf
from scipy import signal

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

SR = 24000
ROWS = [None, 18, 30, 45, 70, 110, 160, 230]
MORE_ROWS = ROWS + [8, 12, 24, 38, 56, 90, 130, 195, 300]   # wider search for lines that are hard to land
MULTS = [0.96, 1.0, 1.05]
TARGET = 54.8          # total narration length (s) the edit is cut to
TONE_PCT = {"low": 25, "mid": 50, "high": 80}   # pitch placement as percentiles of this voice's takes


# ---------------------------------------------------------------- take rendering (cached)
class Session:
    def __init__(self, model_dir, cache, voice):
        self.model_dir, self.cache, self.voice = model_dir, cache, voice
        self.k = None
        os.makedirs(cache, exist_ok=True)

    def kokoro(self):
        if self.k is None:
            from kokoro_onnx import Kokoro
            self.k = Kokoro(os.path.join(self.model_dir, "kokoro-timed.onnx"),
                            os.path.join(self.model_dir, "voices-v1.0.bin"))
            self.default_style = self.k._style_for
        return self.k

    def take(self, text, row, speed):
        key = hashlib.sha1(f"{self.voice}|{text}|{row}|{speed:.4f}".encode()).hexdigest()[:16]
        path = os.path.join(self.cache, key + ".npz")
        if os.path.exists(path):
            d = np.load(path, allow_pickle=True)
            return d["a"], list(d["words"])
        from tts import word_timings
        k = self.kokoro()
        k._style_for = self.default_style if row is None else (lambda r: (lambda v, n: v[r]))(row)
        try:
            a, _, spoken = k.create_timed(text, voice=self.voice, speed=speed, lang="en-us",
                                          sentence_pause=0.1, clause_pause=0.05)
        finally:
            k._style_for = self.default_style
        words = word_timings(k, text, spoken)
        np.savez(path, a=a.astype(np.float32), words=np.array(words, dtype=object))
        return a.astype(np.float32), words

    def grains(self):
        path = os.path.join(self.cache, "grains.npz")
        if os.path.exists(path):
            return list(np.load(path, allow_pickle=True)["g"])
        g = harvest(self.kokoro(), self.voice)
        arr = np.empty(len(g), dtype=object)
        arr[:] = g
        np.savez(path, g=arr)
        return g


# ---------------------------------------------------------------- measurement
def f0_track(x, sr=SR, fmin=110, fmax=480, hop=0.01, win=0.035):
    """Window-normalised autocorrelation pitch (Boersma-style) with a small octave cost, then
    cleaned of octave spikes. One value per 10 ms, NaN where unvoiced."""
    n, h = int(win * sr), int(hop * sr)
    if len(x) < n + h:
        return np.array([])
    idx = np.arange(0, len(x) - n, h)
    w = np.hanning(n)
    fr = np.stack([x[i:i + n] for i in idx]) * w
    rms = np.sqrt((fr ** 2).mean(1))
    nfft = 1 << (2 * n - 1).bit_length()
    ac = np.fft.irfft(np.abs(np.fft.rfft(fr, nfft)) ** 2, nfft)[:, :n]
    wac = np.fft.irfft(np.abs(np.fft.rfft(w, nfft)) ** 2, nfft)[:n]
    lo, hi = int(sr / fmax), int(sr / fmin)
    lags = np.arange(lo, hi + 1)
    out = np.full(len(idx), np.nan)
    for j in range(len(idx)):
        if rms[j] < 0.006 or ac[j, 0] <= 0:
            continue
        r = ac[j, lo:hi + 1] / ac[j, 0] / wac[lo:hi + 1] * wac[0]
        if r.max() < 0.45:
            continue
        pk = np.where((r[1:-1] >= r[:-2]) & (r[1:-1] >= r[2:]))[0] + 1
        if not len(pk):
            continue
        cost = r[pk] - 0.03 * np.log2(lags[pk] / lo)       # prefer the higher candidate on near-ties
        k = pk[np.argmax(cost)]
        a, b, c = r[k - 1], r[k], r[k + 1]
        den = a - 2 * b + c
        d = 0.5 * (a - c) / den if den != 0 else 0.0
        out[j] = sr / (lags[k] + d)
    # clean octave jumps / stray frames against a running median
    v = ~np.isnan(out)
    if v.sum() >= 5:
        st = 12 * np.log2(np.where(v, out, 1.0))
        med = np.array([np.nanmedian(np.where(v[max(0, i - 3):i + 4], st[max(0, i - 3):i + 4], np.nan))
                        if v[i] else np.nan for i in range(len(out))])
        out[v & (np.abs(st - med) > 4.0)] = np.nan
    return out


def voiced_runs(f, min_len=3):
    """Drop voiced islands shorter than min_len frames (clicks, creak, breath noise)."""
    f = f.copy()
    v = ~np.isnan(f)
    i = 0
    while i < len(f):
        if v[i]:
            j = i
            while j < len(f) and v[j]:
                j += 1
            if j - i < min_len:
                f[i:j] = np.nan
            i = j
        else:
            i += 1
    return f


def features(audio, words=None):
    f = voiced_runs(f0_track(audio))
    if words:  # only what is inside the spoken words (timings run ~40 ms late, so this keeps the last syllable)
        f[int(words[-1]["end"] * 100) + 2:] = np.nan
    v = f[~np.isnan(f)]
    if len(v) < 6:
        return None
    med = float(np.median(v))
    st = 12 * np.log2(v / med)
    rng = float(np.percentile(st, 95) - np.percentile(st, 5))
    # phrase ending, measured over the last ~40 % of voiced frames
    nt = int(min(len(st), max(10, 0.4 * len(st))))
    tail = st[-nt:]
    q = max(3, len(tail) // 4)
    slope = float(np.median(tail[-q:]) - np.median(tail[:q]))
    endp = float(np.median(st[-min(4, len(st)):]))           # where the phrase lands, vs its own median
    # the last word's own movement: climb out of its low point / drop from its high point
    lw = st[-nt:]
    if words:
        fl = f.copy()
        fl[:int(words[-1]["start"] * 100)] = np.nan
        lv = fl[~np.isnan(fl)]
        if len(lv) >= 5:
            lw = 12 * np.log2(lv / med)
    rise = float(endp - np.min(lw[:-2])) if len(lw) > 3 else 0.0
    fall = float(endp - np.max(lw[:-2])) if len(lw) > 3 else 0.0
    return {"med": round(med, 1), "range": round(rng, 2), "slope": round(slope, 2), "endp": round(endp, 2),
            "rise": round(rise, 2), "fall": round(fall, 2)}


def score(ft, dur, base_dur, seg, tone_hz, prev_med):
    if ft is None:
        return 99.0
    tgt = tone_hz[seg.get("tone", "mid")]
    s = max(0.0, abs(12 * np.log2(ft["med"] / tgt)) - 0.75) * 0.8
    end = seg.get("end", "any")
    if end == "rise":        # curiosity: the line has to go up at the end
        s += max(0.0, 3.0 - ft["slope"]) * 1.3 + max(0.0, 3.5 - ft["rise"]) * 0.5
    elif end == "fall":      # conclusion: firm, downward landing
        s += max(0.0, ft["slope"] + 2.0) * 1.0 + max(0.0, ft["endp"] + 1.0) * 0.5 + max(0.0, ft["fall"] + 2.5) * 0.4
    s += max(0.0, 6.5 - ft["range"]) * 0.3
    tgt_dur = seg.get("dur", base_dur)
    s += 6.0 * max(0.0, abs(dur / tgt_dur - 1) - 0.12) + 0.8 * abs(dur / tgt_dur - 1)
    if prev_med is not None and abs(ft["med"] - prev_med) < 4:
        s += 0.4  # avoid a monotone run of phrases at the same pitch
    return float(s)


def emphasize(audio, words, targets, db=2.2):
    g = np.ones(len(audio))
    ramp = int(0.025 * SR)
    for w in words:
        if w["word"].lower().strip("'") in targets:
            a, b = int(w["start"] * SR), min(len(audio), int(w["end"] * SR))
            if b <= a:
                continue
            env = np.ones(b - a) * (10 ** (db / 20))
            r = min(ramp, (b - a) // 2)
            if r > 0:
                env[:r] = np.linspace(1, env[0], r)
                env[-r:] = np.linspace(env[0], 1, r)
            g[a:b] = np.maximum(g[a:b], env)
    return audio * g


def trim_edges(a, words, lead=0.02, tail=0.05, thr_db=-42):
    """Cut the take's own leading/trailing silence (the phrase gaps come from the direction, not
    from whatever padding the model left), keeping a short margin and a 10 ms fade."""
    env = np.sqrt(np.convolve(a.astype(np.float64) ** 2, np.ones(240) / 240, "same"))
    idx = np.where(env > env.max() * 10 ** (thr_db / 20))[0]
    if not len(idx):
        return a, words
    i0 = max(0, idx[0] - int(lead * SR))
    i1 = min(len(a), idx[-1] + int(tail * SR))
    out = a[i0:i1].astype(np.float32).copy()
    f = int(0.01 * SR)
    out[:f] *= np.linspace(0, 1, f)
    out[-f:] *= np.linspace(1, 0, f)
    sh = i0 / SR
    end = len(out) / SR
    w2 = [{"word": w["word"], "start": round(min(end, max(0.0, w["start"] - sh)), 3),
           "end": round(min(end + 0.04, max(0.0, w["end"] - sh)), 3)} for w in words]
    return out, w2


# ---------------------------------------------------------------- breaths from the narrator's own aspiration
def harvest(k, voice="af_heart"):
    grains = []
    for ph in ("hhhhhɑː", "hʌ", "hhhhhhhh"):
        a, sr, _ = k.create_timed(ph, voice=voice, speed=0.5, lang="en-us", is_phonemes=True, trim=False)
        hop = int(0.005 * SR)
        noisy = []
        for i in range(0, len(a) - hop, hop):
            fr = a[i:i + hop]
            rms = np.sqrt((fr ** 2).mean())
            zcr = np.mean(np.abs(np.diff(np.sign(fr)))) / 2
            noisy.append(rms > 0.003 and zcr > 0.22)
        best, cur, start = (0, 0), 0, 0
        for i, nz in enumerate(noisy + [False]):
            if nz:
                if cur == 0:
                    start = i
                cur += 1
            else:
                if cur > best[1] - best[0]:
                    best = (start, start + cur)
                cur = 0
        seg = a[best[0] * hop:best[1] * hop]
        if len(seg) > int(0.05 * SR):
            grains.append(seg / (np.sqrt((seg ** 2).mean()) + 1e-9))
    return grains


def make_breath(grains, dur, kind, seed):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    g = int(0.05 * SR)
    win = np.hanning(g)
    out = np.zeros(n + g)
    for pos in range(0, n, g // 3):
        src = grains[rng.integers(len(grains))]
        st = rng.integers(0, max(1, len(src) - g))
        piece = src[st:st + g]
        if len(piece) < g:
            continue
        out[pos:pos + g] += piece * win * (0.8 + 0.4 * rng.random())
    out = out[:n]
    t = np.linspace(0, 1, n)
    if kind == "gasp":
        # short involuntary intake: the throat snaps open (the vocal-tract colour glides up from a
        # closed, darker band to an open, brighter one), fast swell, caught short at the glottis
        sos = signal.butter(2, [450, 7000], btype="bandpass", fs=SR, output="sos")
        broad = signal.sosfilt(sos, out)
        closed = signal.sosfilt(signal.butter(2, [700, 1700], btype="bandpass", fs=SR, output="sos"), out)
        opened = signal.sosfilt(signal.butter(2, [1400, 3400], btype="bandpass", fs=SR, output="sos"), out)
        k = np.clip(t / 0.7, 0, 1)
        out = 0.55 * broad + 0.9 * ((1 - k) * closed + k * opened)
        env = np.minimum(1, t / 0.14) ** 1.3 * (0.8 + 0.2 * t) * np.where(t > 0.88, np.clip((1 - t) / 0.12, 0, 1), 1)
        out = out * env
        catch = int(0.010 * SR)
        click = np.random.default_rng(seed + 1).standard_normal(catch) * np.hanning(catch) * 0.25
        out[-catch - int(0.004 * SR):-int(0.004 * SR)] += click
    else:
        # relaxed inhale before a phrase
        sos = signal.butter(2, [260, 6000], btype="bandpass", fs=SR, output="sos")
        out = signal.sosfilt(sos, out)
        env = np.sin(np.pi * np.clip(t / 0.8, 0, 1) / 2) ** 2 * np.where(t > 0.8, (1 - t) / 0.2, 1)
        out = out * env
    return out / (np.sqrt((out[np.abs(out) > 1e-6] ** 2).mean()) + 1e-9)


# ---------------------------------------------------------------- selection
def audition(sess, spec):
    """Render (or load) every candidate take and measure it."""
    table = []
    total = sum((len(s.get("alts", [])) + 1) * (len(MORE_ROWS) if s.get("rows") == "more" else len(s.get("rows", ROWS)))
                for s in spec["segments"])
    done = 0
    for si, seg in enumerate(spec["segments"]):
        texts = [seg["t"]] + seg.get("alts", [])
        if seg.get("rows") == "more":
            seg["rows"] = MORE_ROWS
        mults = seg.get("mults", MULTS)
        cands, base = [], None
        for text in texts:
            for row in seg.get("rows", ROWS):
                for m in mults:
                    a, words = trim_edges(*sess.take(text, row, seg["speed"] * m))
                    cands.append({"text": text, "row": row, "mult": m, "dur": round(len(a) / SR, 3),
                                  "ft": features(a, words), "_a": a, "_w": words})
                    if text == seg["t"] and row is None and m == 1.0:
                        base = len(a) / SR
                done += 1
                print(f"\r  auditioned {done}/{total}", end="", flush=True)
        if base is None:
            base = float(np.median([c["dur"] for c in cands if c["text"] == seg["t"]]))
        table.append({"seg": seg, "base": base, "cands": cands})
    print()
    return table


def select(table, lam):
    """Best take per phrase for a given duration pressure lam (score units per second)."""
    meds = [c["ft"]["med"] for p in table for c in p["cands"] if c["ft"]]
    tone_hz = {k: float(np.percentile(meds, q)) for k, q in TONE_PCT.items()}
    chosen, prev_med = [], None
    for p in table:
        seg = p["seg"]
        med_dur = {}
        for c in p["cands"]:
            med_dur.setdefault(c["text"], []).append(c["dur"])
        med_dur = {k: float(np.median(v)) for k, v in med_dur.items()}
        for c in p["cands"]:
            c["score"] = score(c["ft"], c["dur"], p["base"], seg, tone_hz, prev_med) + lam * c["dur"]
            # a take far quicker than this line's typical read sounds rushed/clipped, not natural
            c["score"] += 10.0 * max(0.0, 0.86 - c["dur"] / med_dur[c["text"]])
            if c["text"] != seg["t"]:
                c["score"] += seg.get("alt_cost", 0.3)       # the written line is preferred on a tie
        pick = seg.get("pick")
        if pick:
            best = next(c for c in p["cands"] if c["row"] == pick.get("row") and abs(c["mult"] - pick.get("mult", 1.0)) < 1e-6
                        and c["text"] == pick.get("text", seg["t"]))
        else:
            best = min(p["cands"], key=lambda c: c["score"])
        chosen.append(best)
        prev_med = best["ft"]["med"] if best["ft"] else prev_med
    return chosen, tone_hz


def planned_length(spec, chosen):
    t = 0.0
    for seg, c in zip(spec["segments"], chosen):
        t += c["dur"] + max(0.06, seg.get("pause", 0.0))
    return t


# ---------------------------------------------------------------- session
def main():
    model_dir, out_dir, spec_path = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(out_dir, exist_ok=True)
    spec = json.load(open(spec_path))
    voice = spec.get("voice", "af_heart")
    target = spec.get("target", TARGET)
    sess = Session(model_dir, os.path.join(out_dir, "takes_cache"), voice)
    grains = sess.grains()
    table = audition(sess, spec)

    # duration pressure: the smallest lam that brings the read inside the target length
    lam = 0.0
    chosen, tone_hz = select(table, lam)
    while planned_length(spec, chosen) + 0.5 > target and lam < 4.0:
        lam += 0.05
        chosen, tone_hz = select(table, lam)
    print(f"tone targets {', '.join(f'{k} {v:.0f} Hz' for k, v in tone_hz.items())}; duration pressure {lam:.2f}")
    for si, (p, c) in enumerate(zip(table, chosen)):
        ft = c["ft"] or {}
        print(f"{si:2d} row={str(c['row']):>4} x{c['mult']:.2f} {c['dur']:4.2f}s (base {p['base']:4.2f}) "
              f"med {ft.get('med', 0):5.0f}Hz slope {ft.get('slope', 0):+5.1f} rise {ft.get('rise', 0):4.1f} "
              f"fall {ft.get('fall', 0):+5.1f} rng {ft.get('range', 0):4.1f} [{p['seg'].get('end', 'any')}] "
              f"{'*' if c['text'] != p['seg']['t'] else ' '}{c['text'][:44]}")

    # reference loudness of the spoken takes
    ref = np.sqrt(np.mean(np.concatenate([c["_a"] for c in chosen]) ** 2))
    parts, words_out, events, t = [], [], [], 0.0
    for i, (p, c) in enumerate(zip(table, chosen)):
        seg = p["seg"]
        breath = seg.get("breath")
        if breath:
            bl = 0.34 if breath == "soft" else 0.42
            lvl = -21 if breath == "soft" else -17
            b = make_breath(grains, bl, "soft", 100 + i) * ref * 10 ** (lvl / 20)
            lead = np.zeros(int(0.06 * SR))
            # the breath sits in the gap before the phrase (extending it only if the gap is too short)
            if parts:
                prev_gap = parts[-1]
                need = len(b) + len(lead) + int(0.04 * SR)
                if len(prev_gap) < need:
                    parts[-1] = np.zeros(need)
                    t += (need - len(prev_gap)) / SR
                gap = parts[-1]
                gap[len(gap) - len(lead) - len(b):len(gap) - len(lead)] += b
                events.append({"type": "breath", "t": round(t - (len(lead) + len(b)) / SR, 3), "dur": bl})
            else:
                parts.append(np.concatenate([b, lead]))
                events.append({"type": "breath", "t": 0.0, "dur": bl})
                t += (len(b) + len(lead)) / SR
        a = emphasize(c["_a"].astype(np.float64), c["_w"], set(w.lower() for w in seg.get("emph", [])),
                      seg.get("emph_db", 2.2))
        a = a * 10 ** (seg.get("gain", 0.0) / 20)
        for w in c["_w"]:
            words_out.append({"word": w["word"], "start": round(w["start"] + t, 3), "end": round(w["end"] + t, 3)})
        parts.append(a)
        t += len(a) / SR
        pause = max(0.06, seg.get("pause", 0.0))
        if seg.get("gasp_after"):
            gd = seg.get("gasp_dur", 0.24)
            pre = np.zeros(int(seg.get("gasp_pre", 0.1) * SR))
            gasp = make_breath(grains, gd, "gasp", 500 + i) * ref * 10 ** (seg.get("gasp_db", -12) / 20)
            post = np.zeros(int(max(0.12, pause - len(pre) / SR - gd) * SR))
            events.append({"type": "gasp", "t": round(t + len(pre) / SR, 3), "dur": gd})
            gap = np.concatenate([pre, gasp, post])
        else:
            gap = np.zeros(int(pause * SR))
        parts.append(gap)
        t += len(gap) / SR
    audio = np.concatenate(parts)
    sf.write(os.path.join(out_dir, "narration.wav"), audio.astype(np.float32), SR)
    text = " ".join(c["text"] for c in chosen)
    json.dump({"voice": voice, "sr": SR, "duration": len(audio) / SR, "text": text, "words": words_out, "events": events},
              open(os.path.join(out_dir, "words.json"), "w"), indent=1)

    def row(c):
        return {"text": c["text"], "row": c["row"], "mult": c["mult"], "dur": c["dur"], "score": round(c["score"], 2), "ft": c["ft"]}
    json.dump({"tone_hz": tone_hz, "lam": lam, "duration": len(audio) / SR,
               "phrases": [{"t": p["seg"]["t"], "base": round(p["base"], 3), "chosen": row(c),
                            "candidates": sorted((row(x) for x in p["cands"]), key=lambda r: r["score"])}
                           for p, c in zip(table, chosen)]},
              open(os.path.join(out_dir, "takes.json"), "w"), indent=1)
    print(f"narration {len(audio) / SR:.2f}s, {len(words_out)} words, {len(events)} breath events")


if __name__ == "__main__":
    main()
