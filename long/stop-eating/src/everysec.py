"""The every-second measurements for qa.py (the user, 15 Oct 2026: "every second should be interesting in the longform
video with dopamine releasing visuals, explaination, music"; reference/long-form.md, "The every-second rule").

Pure numpy: qa.py hands it the decoded frames (small greyscale) and the stems, and gets back per-second rows and the
stretches to look at. The thresholds are first guesses (15 Oct 2026): when one flags a stretch that is honestly
gripping, say so in ship-review.md and change the number here with a dated comment.
"""
import numpy as np

STILL_SECOND = 1.0     # mean change (0-255 grey, 96x54) between a second's first and last frame below this: nothing moved
EVENT_ABS = 3.0        # a frame-to-frame change above this AND
EVENT_REL = 4.0        # this many times the local baseline (2 s median) is a visual event: a cut, a flash, a big arrival
EVENT_GAP = 5.0        # seconds without a visual event, or without a sound event, worth a look
ONSET_DB = 9.0         # a sound event: the 10 ms level jumps this far over the previous 150 ms...
ONSET_FLOOR = 45.0     # ...and is within this many dB of the stem's loudest moment
MUSIC_WIN, MUSIC_HOP, MUSIC_RANGE = 30.0, 10.0, 4.0   # a 30 s stretch whose music level moves less than 4 dB: flat


def _merge(times, gap=0.3):
    out = []
    for t in sorted(times):
        if not out or t - out[-1] > gap:
            out.append(t)
    return out


def visual(frames, fps=30):
    """frames: list of 2-D float arrays (greyscale). Returns (per-second net change, visual event times)."""
    if len(frames) < 2:
        return [], []
    d = np.array([0.0] + [float(np.abs(frames[i] - frames[i - 1]).mean()) for i in range(1, len(frames))])
    k = 2 * fps + 1
    pad = np.pad(d, (k // 2, k // 2), mode="edge")
    base = np.array([np.median(pad[i:i + k]) for i in range(len(d))])
    ev = [i / fps for i in range(1, len(d)) if d[i] > max(EVENT_ABS, EVENT_REL * base[i])]
    n_sec = len(frames) // fps
    sec = [float(np.abs(frames[min(len(frames) - 1, s * fps + fps - 1)] - frames[s * fps]).mean()) for s in range(n_sec)]
    return sec, _merge(ev)


def env_db(y, sr=48000, hop_s=0.01):
    hop = int(sr * hop_s)
    n = len(y) // hop
    if n == 0:
        return np.array([])
    r = np.sqrt((np.asarray(y[:n * hop], dtype=np.float64).reshape(n, hop) ** 2).mean(axis=1)) + 1e-9
    return 20 * np.log10(r)


def onsets(y, sr=48000):
    """sound events in a stem: the times where its 10 ms level jumps ONSET_DB over the previous 150 ms"""
    e = env_db(y, sr)
    if not len(e):
        return []
    lin = 10 ** (e / 20)
    prev = np.array([lin[max(0, i - 15):i].mean() if i > 0 else lin[0] for i in range(len(lin))])
    prev_db = 20 * np.log10(prev + 1e-9)
    top = e.max()
    hits = [i * 0.01 for i in range(1, len(e)) if e[i] - prev_db[i] > ONSET_DB and e[i] > top - ONSET_FLOOR]
    return _merge(hits, 0.15)


def voice_fraction(y, n_sec, sr=48000):
    """the share of each second in which the narrator is speaking (10 ms frames within 30 dB of the loudest)"""
    e = env_db(y, sr)
    if not len(e):
        return [0.0] * n_sec
    on = e > e.max() - 30
    return [float(on[s * 100:(s + 1) * 100].mean()) if s * 100 < len(on) else 0.0 for s in range(n_sec)]


def music_flat(y, dur, sr=48000):
    """30 s windows (every 10 s) in which the music's level, in 0.5 s steps, moves less than MUSIC_RANGE dB"""
    e = env_db(y, sr)
    if not len(e):
        return []
    half = e[: len(e) // 50 * 50].reshape(-1, 50)
    lvl = 10 * np.log10((10 ** (half / 10)).mean(axis=1) + 1e-12)   # 0.5 s power average, in dB
    out, t = [], 2.0
    while t + MUSIC_WIN <= dur - 2.0:
        w = lvl[int(t * 2):int((t + MUSIC_WIN) * 2)]
        w = w[w > lvl.max() - 60]
        rng = float(w.max() - w.min()) if len(w) else 0.0
        if rng < MUSIC_RANGE:
            out.append((t, t + MUSIC_WIN, rng))
        t += MUSIC_HOP
    return out


def gaps(times, dur, limit=EVENT_GAP):
    """stretches longer than `limit` seconds between events (from the start, to the end)"""
    pts = [0.0] + [t for t in times if 0 <= t <= dur] + [dur]
    return sorted(((b - a, a, b) for a, b in zip(pts, pts[1:]) if b - a > limit), reverse=True)


def seconds_table(sec_motion, vis_ev, snd_ev, voice_frac):
    """one row per second; 'dead' = nothing moved, no visual or sound event, and no voice"""
    rows = []
    for s, m in enumerate(sec_motion):
        ve = sum(1 for t in vis_ev if s <= t < s + 1)
        se = sum(1 for t in snd_ev if s <= t < s + 1)
        vf = voice_frac[s] if s < len(voice_frac) else 0.0
        dead = m < STILL_SECOND * 2 and ve == 0 and se == 0 and vf < 0.3
        rows.append({"second": s, "motion": round(m, 2), "visual_events": ve, "sound_events": se,
                     "voice": round(vf, 2), "dead": int(dead)})
    return rows


def fmt_t(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"
