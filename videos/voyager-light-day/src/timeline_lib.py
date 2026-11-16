"""CurioPulse timeline builder: shots, caption chunks and cues, all anchored to the narration's word timings.

A video's make_timeline.py only declares SHOTS, CHUNKS, COLOR (and DISPLAY) and its cues:

    from timeline_lib import Timeline, PALETTE as P
    T = Timeline(sys.argv[1])                       # reads narration.wav + words.json from voice.py
    shots = T.shots(SHOTS, special={"stare": T.E("JUMPS") + 0.06})
    caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
    cues = {"gasp": T.ev("gasps")["t"], "bam": T.W("BAM"), ...}
    T.write(shots, caps, cues)                      # writes voice.wav (padded) + timeline.json

Timing rules:
- A cut lands LEAD (0.07 s) before the phrase it illustrates.
- A caption word pops 0.03 s before it is spoken.
- A caption chunk ends 0.55 s after its last word, or at the next chunk or cut, whichever is first.
- The video ends TAIL seconds after the last word (a held beat and the button).
Phrases are matched on normalized words (lowercase, punctuation stripped), so "That's a hypnic" finds
the words "That's", "a", "hypnic." in the narration.
"""
import json
import os
import re

import numpy as np
import soundfile as sf

FPS = 30
LEAD = 0.07

# caption colours (the channel palette): white base, colour only the words that carry the idea
PALETTE = dict(Y="#FFD447", O="#FF9A3C", C="#7FE9FF", R="#FF5A6E", P="#FF86A6", G="#4DFFB4", W="#FFFFFF",
               B="#8FB8FF", V="#C8A8FF", S="#BFF0FF")


def norm(w):
    return re.sub(r"[^a-z0-9'%-]", "", w.lower())


def fr(t):
    """snap a time to the frame grid"""
    return round(t * FPS) / FPS


def _publish(work):
    """The video's publish.json: beside the work folder (the usual ../.work), else beside this src/ folder, so a rebuild
    into a work folder elsewhere (WORK=/tmp/x src/build.sh) keeps the Short's look and pill arm (27 Oct 2026: such a
    rebuild silently dropped the pill)."""
    for d in (os.path.dirname(os.path.abspath(work)), os.path.dirname(os.path.dirname(os.path.abspath(__file__)))):
        try:
            return json.load(open(os.path.join(d, "publish.json")))
        except (OSError, ValueError):
            continue
    return {}


def video_look(work):
    """The picture's look: 'cine' (cinematic lighting, the house look since 8 Oct 2026; web/look.js) unless the
    video's publish.json says "look": "classic" (the picture as it was before). render.js falls back to classic by
    itself when the graphics chip is not available, and says so."""
    look = _publish(work).get("look", "cine")
    return look if look in ("cine", "classic") else "cine"


def video_subscribe(work):
    """The Short's subscribe arm from its publish.json "subscribe" (`yt.mjs next-slot`, written by new-short.sh): 'pill'
    for a 23:30 slot of the pill test (25 Oct-8 Nov 2026; reference/analytics.md, the pill test), else 'none' (no
    pill, the Short ends on the button and loops, as since 16 Oct 2026)."""
    arm = (_publish(work).get("subscribe") or {}).get("arm")
    return "pill" if arm == "pill" else "none"


# the pill of the pill test, timed from the end (seconds before the end of the Short): it pops in 2.4 s before the
# end, the cursor clicks 0.7 s later, it pops out 0.85 s before the end and has gone 0.6 s before it, so the cut back
# to frame 1 is clean. About 1.8 s on screen (the pill of 9-15 Oct: 2.8 s from 3.4 s before the end).
PILL_IN, PILL_TAP, PILL_OUT = 2.4, 1.7, 0.85


def pill_cues(dur):
    return {"sub_in": fr(dur - PILL_IN), "sub_tap": fr(dur - PILL_TAP), "sub_out": fr(dur - PILL_OUT)}


# ---- the cinema kit (7 Nov 2026; web/cinema.js, reference/visual.md "Camera and light craft"): the camera and light plan
MOODS = ("day", "shade", "dusk", "night", "storm", "warm", "cold", "spot")
FG_KINDS = ("grass-b", "grass-bl", "grass-br", "leaves-tl", "leaves-tr", "branch-tl", "branch-tr", "rock-bl", "rock-br",
            "post-l", "post-r", "bars-l", "bars-r", "bokeh-l", "bokeh-r", "bokeh-t", "frame")
AIR_KINDS = ("dust", "pollen", "haze", "embers", "sparkle", "snow", "rain", "drizzle", "spray")
LOOP_CLEAR = 0.5          # the last half second shows the picture of frame 1: no punch-in or tilt may still be on


def camera_plan(camera, shots, dur):
    """Check a Short's CAMERA plan (make_timeline.py) and return it ready for timeline.json, with one summary line.
    Whips snap to the nearest cut (within 0.2 s); a punch or tilt that is still on in the loop's last half second, a
    mood at the end that differs from frame 1's, an unknown shot, mood, foreground or particle kind: all raise."""
    cam = dict(camera or {})
    ids = [s["id"] for s in shots]
    starts = [s["start"] for s in shots[1:]]
    for key in ("hand", "fg", "air"):
        v = cam.get(key)
        if isinstance(v, dict):
            bad = [k for k in v if k not in ids]
            assert not bad, f"CAMERA[{key!r}] names shots that do not exist: {bad} (shots: {ids})"
    for sid, h in (cam.get("hand") or {}).items() if isinstance(cam.get("hand"), dict) else []:
        assert 0 <= h <= 1, f"CAMERA['hand'][{sid!r}] = {h}: handheld runs 0 (locked off) to 1 (chaos); 0.25 calm, 0.35 tense, 0.6 chaos"

    def kinds(v, allowed, what):
        for x in v if isinstance(v, list) else [v]:
            k = x if isinstance(x, str) else (x or {}).get("kind")
            assert k in allowed, f"CAMERA[{what!r}]: unknown kind {k!r} (kinds: {', '.join(allowed)})"
    for sid, v in (cam.get("fg") or {}).items():
        kinds(v, FG_KINDS, "fg")
    for sid, v in (cam.get("air") or {}).items():
        kinds(v, AIR_KINDS, "air")
    whips = []
    for w in cam.get("whip") or []:
        t, d = float(w[0]), int(w[1]) if len(w) > 1 else 1
        near = min(starts, key=lambda b: abs(b - t)) if starts else None
        assert near is not None and abs(near - t) <= 0.2, f"CAMERA whip at {t:.2f} s is not at a cut (cuts: {[round(b, 2) for b in starts]})"
        assert d in (1, -1), f"CAMERA whip at {t:.2f} s: direction must be 1 (swing right) or -1 (swing left)"
        assert near >= 1.5, f"CAMERA whip at {near:.2f} s: the first 1.5 s hold the tight opening (story.md, the first picture)"
        whips.append([round(near, 3), d] + ([int(w[2])] if len(w) > 2 else []))
    cam["whip"] = whips
    punches = []
    for p in cam.get("punch") or []:
        t, k = float(p[0]), float(p[1]) if len(p) > 1 else 1.2
        t1 = float(p[2]) if len(p) > 2 and p[2] is not None else next((b for b in starts if b > t + 0.01), dur)
        assert 1.05 <= k <= 1.4, f"CAMERA punch at {t:.2f} s: zoom {k} (1.12-1.3 reads as a punch; 1.05-1.4 allowed)"
        assert t1 <= dur - LOOP_CLEAR + 1e-6, f"CAMERA punch at {t:.2f} s is still on in the last {LOOP_CLEAR} s (the loop needs frame 1's picture): end it earlier"
        punches.append([round(t, 3), k] + ([round(float(p[2]), 3)] if len(p) > 2 and p[2] is not None else []))
    cam["punch"] = punches
    tilts = []
    for p in cam.get("tilt") or []:
        t0, t1, deg = float(p[0]), float(p[1]), float(p[2]) if len(p) > 2 else 3.0
        assert t1 > t0, f"CAMERA tilt {t0:.2f}-{t1:.2f} s ends before it starts"
        assert abs(deg) <= 6, f"CAMERA tilt {t0:.2f} s: {deg} degrees (2-5 reads as a dutch tilt; at most 6)"
        assert t1 + 0.25 <= dur - LOOP_CLEAR + 1e-6, f"CAMERA tilt {t0:.2f}-{t1:.2f} s is still on near the loop: end it by {dur - LOOP_CLEAR - 0.25:.2f} s"
        tilts.append([round(t0, 3), round(t1, 3), deg])
    cam["tilt"] = tilts
    hits = []
    for h in cam.get("hit") or []:
        t0, n = float(h[0]), int(h[1]) if len(h) > 1 else 4
        assert 2 <= n <= 6, f"CAMERA hit at {t0:.2f} s: {n} frames (2-6; 4 reads as a hitstop)"
        assert t0 >= 1.5 and t0 + n / FPS <= dur - LOOP_CLEAR, f"CAMERA hit at {t0:.2f} s: not in the first 1.5 s or the loop's last {LOOP_CLEAR} s"
        cut = [b for b in starts if t0 < b < t0 + n / FPS + 0.02]
        assert not cut, f"CAMERA hit at {t0:.2f} s runs into the cut at {cut[0]:.2f} s: a freeze stays inside its shot"
        hits.append([round(t0, 3), n])
    cam["hit"] = hits
    act = dict(cam.get("act") or {})
    for key in ("brow", "blink"):
        v = sorted(float(x) for x in act.get(key) or [])
        assert all(0 <= x < dur for x in v), f"CAMERA act {key}: times must be inside the Short (0-{dur:.2f} s)"
        act[key] = [round(x, 3) for x in v]
    cam["act"] = act
    moods = sorted([[float(m[0]), m[1]] + list(m[2:]) for m in cam.get("mood") or []], key=lambda m: m[0])
    for m in moods:
        assert m[1] in MOODS, f"CAMERA mood {m[1]!r} at {m[0]:.2f} s: moods are {', '.join(MOODS)}"
    if moods:
        assert moods[0][0] <= 0.05, f"CAMERA mood: the first one must start at 0 (frame 1), not {moods[0][0]:.2f} s"
        assert moods[-1][1] == moods[0][1] and moods[-1][0] + (moods[-1][2] if len(moods[-1]) > 2 else 0.45) <= dur - LOOP_CLEAR + 1e-6, (
            f"CAMERA mood: the Short ends in {moods[-1][1]!r} but frame 1 is {moods[0][1]!r} (the loop): come back to "
            f"{moods[0][1]!r} by {dur - LOOP_CLEAR - 0.45:.2f} s")
    cam["mood"] = [[round(m[0], 3)] + m[1:] for m in moods]
    hand = cam.get("hand")
    hand_s = (f"{hand:g} on every shot" if isinstance(hand, (int, float)) else
              ("0.3 on every shot" if not hand else ", ".join(f"{k} {v:g}" for k, v in hand.items()) + ", 0.3 elsewhere"))
    mood_s = " -> ".join(m[1] for m in cam["mood"]) or "none (the place's own light only)"
    fg_n = len(cam.get("fg") or {}); air_n = len(cam.get("air") or {})
    summary = (f"camera: {len(whips)} whip pan(s), {len(punches)} punch-in(s), {len(tilts)} tilt(s), {len(hits)} hitstop(s), "
               f"{len(act.get('brow', []))} brow beat(s); mood {mood_s}; "
               f"handheld {hand_s}; foreground layer in {fg_n} of {len(ids)} shots, particles in {air_n}")
    return cam, summary


class Timeline:
    def __init__(self, work, tail=1.5):
        self.work = work
        meta = json.load(open(f"{work}/words.json"))
        self.words, self.events = meta["words"], meta["events"]
        self.blocks = meta.get("blocks", [])
        self.audio, self.sr = sf.read(f"{work}/narration.wav")
        self.toks = [norm(w["word"]) for w in self.words]
        self.ws = [w["start"] for w in self.words]
        self.we = [w["end"] for w in self.words]
        self.tail = tail

    # ---- lookups
    def find(self, phrase, start=0):
        """index of the first word of `phrase` at or after word index `start`"""
        p = [norm(x) for x in phrase.split()]
        for i in range(start, len(self.toks) - len(p) + 1):
            if self.toks[i:i + len(p)] == p:
                return i
        raise ValueError(f"phrase not in the narration: {phrase!r} (from word {start})")

    def W(self, phrase, k=0, s=0):
        """start time of word k of `phrase` (searching from word index s)"""
        return self.ws[self.find(phrase, s) + k]

    def E(self, phrase, k=0, s=0):
        """end time of word k of `phrase`"""
        return self.we[self.find(phrase, s) + k]

    def ev(self, kind, nth=0):
        """a performance event from the take ([gasps], [chuckles], [sighs]...): {"type", "t", "end", "block"}"""
        hits = [e for e in self.events if e["type"] == kind]
        if not hits:
            raise ValueError(f"no [{kind}] event in the narration")
        return hits[nth]

    def block(self, bid):
        return next(b for b in self.blocks if b["id"] == bid)

    def first_loud(self, t0, thr=-37.0, hop=0.01, span=1.5):
        """first moment at or after t0 where the narration is louder than thr dBFS: a take's real onset.
        v3 sometimes gives a tag's time to the take's first word (ears-pop: "[deadpan] Landing" started 0.27 s
        late in the alignment). Compare first_loud(self.block(id)["start"]) with that word's start; if the word
        is late, move it: i = T.find("Landing is"); T.ws[i] = T.words[i]["start"] = T.first_loud(...).
        (A [chuckles] or [sighs] tag makes a real sound before the first word: leave those alone.)"""
        t = t0
        while t < t0 + span:
            seg = self.audio[int(t * self.sr):int((t + hop) * self.sr)]
            if len(seg) and 10 * np.log10((seg ** 2).mean() + 1e-12) > thr:
                return round(t, 3)
            t += hop
        return t0

    def bursts(self, t0, t1, thr=-34.0, hop=0.01, gap=0.02, min_len=0.03):
        """runs of speech-band energy (300-4000 Hz above thr dB) between t0 and t1: [[start, end], ...]. One run per
        word when the words are separated by stops or breaths (tongue-nose, 24 Oct 2026)."""
        from scipy.signal import butter, sosfilt
        x = self.audio.mean(1) if self.audio.ndim > 1 else self.audio
        y = sosfilt(butter(4, [300, 4000], btype="band", fs=self.sr, output="sos"), x)
        runs, cur, t = [], None, t0
        while t < t1:
            seg = y[int(t * self.sr):int((t + hop) * self.sr)]
            loud = len(seg) and 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-12) > thr
            if loud:
                cur = [t, t + hop] if cur is None else [cur[0], t + hop]
            elif cur is not None:
                runs.append(cur); cur = None
            t += hop
        if cur is not None:
            runs.append(cur)
        merged = []
        for r in runs:
            if merged and r[0] - merged[-1][1] < gap:
                merged[-1][1] = r[1]
            else:
                merged.append(list(r))
        return [r for r in merged if r[1] - r[0] >= min_len]

    def retime(self, phrase, t0, t1, **kw):
        """v3's alignment can run up to 0.6 s early inside a block after a tightened pause (tongue-nose, 24 Oct 2026:
        "It's tied down, front and back."). If the bursts between t0 and t1 are exactly one per word of `phrase`,
        move those words onto them (start 0.04 s before each burst, for the consonant) and return True."""
        i, n = self.find(phrase), len(phrase.split())
        b = self.bursts(t0, t1, **kw)
        if len(b) != n:
            print(f"retime {phrase!r}: {len(b)} bursts for {n} words, left as it was")
            return False
        for k, (a, e) in enumerate(b):
            self.ws[i + k] = self.words[i + k]["start"] = round(a - 0.04, 3)
            self.we[i + k] = self.words[i + k]["end"] = round(e, 3)
        return True

    @property
    def duration(self):
        return fr(self.we[-1] + self.tail)

    # ---- shots
    def shots(self, spec, special=None, lead=LEAD):
        """spec: [(shot_id, opening phrase or None)]; the first shot starts at 0; a None shot needs a time
        in special={shot_id: t}. Returns [{"id", "start", "end"}] on the frame grid."""
        special = special or {}
        starts = []
        for i, (sid, ph) in enumerate(spec):
            if i == 0:
                starts.append(0.0)
            elif sid in special:
                starts.append(fr(special[sid]))
            elif ph is None:
                raise ValueError(f"shot {sid!r} has no phrase and no special time")
            else:
                starts.append(fr(self.W(ph) - lead))
        dur = self.duration
        out = [{"id": sid, "start": starts[i], "end": starts[i + 1] if i + 1 < len(spec) else dur}
               for i, (sid, _) in enumerate(spec)]
        for s in out:
            assert s["end"] > s["start"], f"shot {s['id']} is empty or out of order ({s['start']} -> {s['end']})"
        return out

    # ---- captions
    def captions(self, chunks, color, shots, display=None, hold=0.55):
        """chunks: exact consecutive word runs covering the whole narration, "/" splits lines.
        color: {normalized word: hex}. display: {"seventy percent": ["70%"]} shows figures for spoken words."""
        display = display or {}
        W_ = PALETTE["W"]
        words, toks, ws, we = self.words, self.toks, self.ws, self.we
        caps, wi = [], 0
        for spec in chunks:
            lines = []
            for part in spec.split("/"):
                n = len(part.split())
                first = self.find(part, wi)
                assert first == wi, f"caption chunk {spec!r} skips words: expected {toks[wi]!r} at word {wi}"
                key = " ".join(toks[first:first + n])
                disp = display.get(key)
                line = []
                if disp:
                    idx = [first + round(k * (n - 1) / max(1, len(disp) - 1)) for k in range(len(disp))]
                    for d, j in zip(disp, idx):
                        line.append({"t": d, "c": color.get(norm(d), W_), "at": round(ws[j] - 0.03, 3)})
                else:
                    for j in range(first, first + n):
                        txt = re.sub(r"[.,;:…?!—\"]+", "", words[j]["word"]).upper()
                        line.append({"t": txt, "c": color.get(toks[j], W_), "at": round(ws[j] - 0.03, 3)})
                lines.append(line)
                wi = first + n
            caps.append({"start": lines[0][0]["at"], "lines": lines, "last": wi - 1})
        assert wi == len(words), f"captions cover {wi} of {len(words)} words; next uncaptioned: {toks[wi]!r}"
        dur = self.duration
        bounds = [s["start"] for s in shots[1:]] + [dur]
        for i, c in enumerate(caps):
            nxt = caps[i + 1]["start"] if i + 1 < len(caps) else dur
            end = min(nxt, we[c.pop("last")] + hold)
            crossing = [b for b in bounds if c["start"] + 0.05 < b < end]
            c["end"] = round(min([end] + crossing), 3)
        return caps

    # ---- output
    def write(self, shots, caps, cues, **extra):
        dur = self.duration
        # the subscribe arm decides the pill, never make_timeline.py: the pill arm gets its cues here, the other arm none
        sub = video_subscribe(self.work)
        cues = {k: v for k, v in cues.items() if k not in ("sub_in", "sub_tap", "sub_out")}
        if sub == "pill":
            cues.update(pill_cues(dur))
        n = int(dur * self.sr)
        voice = np.pad(self.audio, (0, max(0, n - len(self.audio))))[:n]
        sf.write(f"{self.work}/voice.wav", voice, self.sr, subtype="FLOAT")
        # the cinema kit is on for every Short made from this template (7 Nov 2026): handheld drift by default, and the
        # rest of the plan (whips, punch-ins, tilts, moods, foreground, particles) from make_timeline.py's CAMERA
        cam_summary = None
        if "camera" in extra:
            extra["camera"], cam_summary = camera_plan(extra["camera"], shots, dur)
        tl = {"fps": FPS, "duration": dur, "shots": shots, "captions": caps, "cues": cues, "words": self.words,
              "events": self.events, "look": video_look(self.work), "subscribe": sub, "cinema": True, **extra}
        json.dump(tl, open(f"{self.work}/timeline.json", "w"), indent=1)
        for s in shots:
            print(f'{s["id"]:10s} {s["start"]:6.2f} -> {s["end"]:6.2f}  ({s["end"] - s["start"]:.2f}s)')
        print(f"duration {dur:.2f}s, {len(caps)} caption chunks, {len(self.words)} words")
        print(cam_summary or "camera: no CAMERA plan (handheld 0.3 on every shot, nothing else): plan the whips, punch-ins and moods in make_timeline.py")
        print(f"subscribe arm: {sub}" + (f' (the pill: in {cues["sub_in"]:.2f} s, click {cues["sub_tap"]:.2f} s, out {cues["sub_out"]:.2f} s)' if sub == "pill" else " (no pill; the Short loops)"))
        return tl
