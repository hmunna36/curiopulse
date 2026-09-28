"""Directed narration: phrase-by-phrase takes, auditioned and assembled like a voice session.

Usage: python3 perform.py <model_dir> <out_dir> <performance.json>
Writes narration.wav (24 kHz), words.json (word timings + breath/gasp events) and takes.json.

Same voice (af_heart) throughout. For every phrase we render takes across the voice's own
style rows and small pace offsets, then keep the take whose measured delivery best matches
the direction: pitch placement (low/mid/high), phrase ending (rise for curiosity, fall for
conclusions), liveliness, and length (so the cut stays in sync). Emphasised words get a
gentle lift; breaths and the gasp are built from the narrator's own /h/ aspiration.
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from scipy import signal

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tts import word_timings  # noqa: E402

SR = 24000
ROWS = [None, 18, 30, 45, 70, 110, 160, 230]
MULTS = [1.0, 1.05]
TONE_HZ = {"low": 172.0, "mid": 186.0, "high": 200.0}


def f0_track(x, sr=SR, fmin=110, fmax=480, hop=0.01, win=0.035):
    n, h = int(win * sr), int(hop * sr)
    out = []
    lo, hi = int(sr / fmax), int(sr / fmin)
    for i in range(0, len(x) - n, h):
        fr = x[i:i + n] * np.hanning(n)
        if np.sqrt((fr ** 2).mean()) < 0.015:
            out.append(np.nan)
            continue
        ac = np.correlate(fr, fr, "full")[n - 1:]
        k = lo + np.argmax(ac[lo:hi])
        out.append(sr / k if ac[k] > 0.35 * ac[0] else np.nan)
    return np.array(out)


def features(audio, words):
    f = f0_track(audio)
    v = f[~np.isnan(f)]
    if len(v) < 5:
        return None
    med = float(np.median(v))
    st = 12 * np.log2(v / med)
    rng = float(np.percentile(st, 95) - np.percentile(st, 5))
    # phrase ending: pitch movement across the last word (or last 350 ms)
    t0 = words[-1]["start"] if words else len(audio) / SR - 0.35
    a = int(max(0, t0) * 100)
    tail = f[a:]
    tv = tail[~np.isnan(tail)]
    if len(tv) < 4:
        tv = v[-8:]
    q = max(1, len(tv) // 3)
    slope = float(12 * np.log2(np.median(tv[-q:]) / np.median(tv[:q])))
    return {"med": med, "range": rng, "slope": slope}


def score(ft, dur, base_dur, seg, prev_med):
    if ft is None:
        return 99.0
    s = abs(12 * np.log2(ft["med"] / TONE_HZ[seg.get("tone", "mid")])) * 0.9
    end = seg.get("end", "any")
    if end == "rise":
        s += max(0.0, 1.5 - ft["slope"]) * 0.8
    elif end == "fall":
        s += max(0.0, ft["slope"] + 2.5) * 0.6
    s += max(0.0, 7.0 - ft["range"]) * 0.3
    s += 6.0 * max(0.0, abs(dur / base_dur - 1) - 0.06)
    if prev_med is not None and abs(ft["med"] - prev_med) < 4:
        s += 0.5  # avoid a monotone run of phrases at the same pitch
    return s


def emphasize(audio, words, targets, db=2.2):
    g = np.ones(len(audio))
    ramp = int(0.025 * SR)
    for w in words:
        if w["word"].lower().strip("'") in targets:
            a, b = int(w["start"] * SR), int(w["end"] * SR)
            env = np.ones(b - a) * (10 ** (db / 20))
            r = min(ramp, (b - a) // 2)
            if r > 0:
                env[:r] = np.linspace(1, env[0], r)
                env[-r:] = np.linspace(env[0], 1, r)
            g[a:b] = np.maximum(g[a:b], env)
    return audio * g


# ---------------------------------------------------------------- breaths from the narrator's own aspiration
def harvest(k):
    grains = []
    for ph in ("hhhhhɑː", "hʌ", "hhhhhhhh"):
        a, sr, _ = k.create_timed(ph, voice="af_heart", speed=0.5, lang="en-us", is_phonemes=True, trim=False)
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
    sos = signal.butter(2, [260, 7000], btype="bandpass", fs=SR, output="sos")
    out = signal.sosfilt(sos, out)
    t = np.linspace(0, 1, n)
    if kind == "gasp":
        # sharp involuntary intake: fast swell, brief peak, caught short
        env = np.minimum(1, t / 0.18) ** 1.5 * np.where(t > 0.9, (1 - t) / 0.1, 1)
        out = out * env
        catch = int(0.012 * SR)
        click = np.random.default_rng(seed + 1).standard_normal(catch) * np.hanning(catch) * 0.35
        out[-catch:] += click
    else:
        # relaxed inhale before a phrase
        env = np.sin(np.pi * np.clip(t / 0.8, 0, 1) / 2) ** 2 * np.where(t > 0.8, (1 - t) / 0.2, 1)
        out = out * env
    return out / (np.sqrt((out[np.abs(out) > 1e-6] ** 2).mean()) + 1e-9)


# ---------------------------------------------------------------- session
def main():
    model_dir, out_dir, spec_path = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(out_dir, exist_ok=True)
    spec = json.load(open(spec_path))
    voice = spec.get("voice", "af_heart")
    k = Kokoro(os.path.join(model_dir, "kokoro-timed.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    default_style = k._style_for
    grains = harvest(k)

    chosen, prev_med = [], None
    for si, seg in enumerate(spec["segments"]):
        takes = []
        base = None
        for row in ROWS:
            k._style_for = default_style if row is None else (lambda r: (lambda v, n: v[r]))(row)
            for m in MULTS:
                a, sr, spoken = k.create_timed(seg["t"], voice=voice, speed=seg["speed"] * m, lang="en-us",
                                               sentence_pause=0.1, clause_pause=0.05)
                words = word_timings(k, seg["t"], spoken)
                dur = len(a) / sr
                if row is None and m == 1.0:
                    base = dur
                takes.append((row, m, a, words, dur))
        k._style_for = default_style
        scored = []
        for row, m, a, words, dur in takes:
            ft = features(a, words)
            scored.append((score(ft, dur, base, seg, prev_med), row, m, a, words, dur, ft))
        scored.sort(key=lambda x: x[0])
        s, row, m, a, words, dur, ft = scored[0]
        prev_med = ft["med"] if ft else prev_med
        chosen.append({"seg": seg, "audio": a, "words": words, "row": row, "mult": m, "score": s, "ft": ft})
        print(f"{si:2d} row={str(row):>4} x{m:.2f} {dur:4.2f}s (base {base:4.2f}) med {ft['med'] if ft else 0:5.0f}Hz "
              f"slope {ft['slope'] if ft else 0:+5.1f} range {ft['range'] if ft else 0:4.1f}  {seg['t'][:48]}")

    # reference loudness of the spoken takes
    ref = np.sqrt(np.mean(np.concatenate([c["audio"] for c in chosen]) ** 2))
    parts, words_out, events, t = [], [], [], 0.0
    for i, c in enumerate(chosen):
        seg = c["seg"]
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
        a = emphasize(c["audio"], c["words"], set(w.lower() for w in seg.get("emph", [])))
        a = a * 10 ** (seg.get("gain", 0.0) / 20)
        for w in c["words"]:
            words_out.append({"word": w["word"], "start": round(w["start"] + t, 3), "end": round(w["end"] + t, 3)})
        parts.append(a.astype(np.float64))
        t += len(a) / SR
        pause = max(0.06, seg.get("pause", 0.0))
        if seg.get("gasp_after"):
            pre = np.zeros(int(0.1 * SR))
            gasp = make_breath(grains, 0.26, "gasp", 500 + i) * ref * 10 ** (-9 / 20)
            post = np.zeros(int(max(0.12, pause - 0.36) * SR))
            events.append({"type": "gasp", "t": round(t + len(pre) / SR, 3), "dur": 0.26})
            gap = np.concatenate([pre, gasp, post])
        else:
            gap = np.zeros(int(pause * SR))
        parts.append(gap)
        t += len(gap) / SR
    audio = np.concatenate(parts)
    sf.write(os.path.join(out_dir, "narration.wav"), audio.astype(np.float32), SR)
    text = " ".join(s["t"] for s in spec["segments"])
    json.dump({"voice": voice, "sr": SR, "duration": len(audio) / SR, "text": text, "words": words_out, "events": events},
              open(os.path.join(out_dir, "words.json"), "w"), indent=1)
    json.dump([{"t": c["seg"]["t"], "row": c["row"], "mult": c["mult"], "score": round(c["score"], 2), "ft": c["ft"]} for c in chosen],
              open(os.path.join(out_dir, "takes.json"), "w"), indent=1)
    print(f"narration {len(audio) / SR:.2f}s, {len(words_out)} words, {len(events)} breath events")


if __name__ == "__main__":
    main()
