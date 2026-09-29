"""Narration: a performed ElevenLabs eleven_v3 read, one take per script block.

Usage: python3 voice.py <work_dir> [--synth] [--redo id,id] [--seed N]

Takes are cached in src/voice/<id>.mp3 + <id>.json (committed, so a rebuild needs no API
call). A block is sent to ElevenLabs only when its text changed, or when --redo names it.
--synth needs ELEVENLABS_API_KEY, or ELEVENLABS_ENV_FILE pointing at a .env that has it.

Each take is trimmed at the edges; pauses inside it longer than TIGHT_MAX are cut down to
TIGHT_KEEP (unless the block says tighten=0), and the blocks are laid end to end with their
own gap before each one.
Writes <work>/narration.wav (48 kHz mono) and <work>/words.json:
  {"words": [{"word", "start", "end", "block"}], "blocks": [...], "events": [{"type", "t", "end", "block"}]}
"""
import base64
import hashlib
import io
import json
import os
import re
import ssl
import subprocess
import sys
import urllib.error
import urllib.request

import numpy as np
import soundfile as sf

SRC = os.path.dirname(os.path.abspath(__file__))
VOICE_ID = "cgSgspJ2msm6clMCkdW9"   # Jessica
MODEL = "eleven_v3"
STABILITY = 0.0                     # "creative": the most expressive v3 setting
SR = 48000
TIGHT_MAX, TIGHT_KEEP = 0.42, 0.30  # s
SIL_DB = -46.0                      # frame level treated as silence (dBFS)
EDGE = 0.035                        # silence kept at each end of a take (s)


def parse(path):
    blocks, cur = [], None
    for line in open(path):
        line = line.rstrip("\n")
        if line.startswith("## "):
            bid, *opts = line[3:].split()
            o = dict(x.split("=") for x in opts)
            cur = {"id": bid, "gap": float(o.get("gap", 0.4)), "tighten": o.get("tighten", "1") != "0",
                   "tempo": float(o.get("tempo", 1.0)), "trim_db": float(o.get("trim", SIL_DB)), "text": ""}
            blocks.append(cur)
        elif line.startswith("#") or not line.strip():
            continue
        elif cur is not None:
            cur["text"] = (cur["text"] + " " + line.strip()).strip()
    return blocks


def key_of(b):
    return hashlib.sha1(f"{VOICE_ID}|{MODEL}|{STABILITY}|{b['text']}".encode()).hexdigest()[:12]


def api_keys():
    """ELEVENLABS_API_KEY if set; else every ELEVENLABS_API_KEY* line of ELEVENLABS_ENV_FILE, in file order
    (the va and cp skills share ~/.config/va/elevenlabs.env). Keys are never printed."""
    if os.environ.get("ELEVENLABS_API_KEY"):
        return [os.environ["ELEVENLABS_API_KEY"]]
    keys = []
    if os.environ.get("ELEVENLABS_ENV_FILE"):
        for ln in open(os.path.expanduser(os.environ["ELEVENLABS_ENV_FILE"])):
            m = re.match(r"\s*ELEVENLABS_API_KEY\w*\s*=\s*[\"']?([^\"'\s]+)", ln)
            if m and m.group(1) not in keys:
                keys.append(m.group(1))
    if not keys:
        sys.exit("voice.py: set ELEVENLABS_API_KEY (or ELEVENLABS_ENV_FILE) to synthesize")
    return keys


def synth(text, seed):
    """one take; tries each account in turn when one is out of characters (or its key is rejected)"""
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps?output_format=mp3_44100_128"
    body = {"text": text, "model_id": MODEL, "voice_settings": {"stability": STABILITY}}
    if seed is not None:
        body["seed"] = seed
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
    errors = []
    for i, key in enumerate(api_keys(), 1):
        req = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST",
                                     headers={"xi-api-key": key, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=240, context=ctx) as r:
                res = json.load(r)
            return base64.b64decode(res["audio_base64"]), res["alignment"]
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            errors.append(f"account {i}: {e.code} {msg}")
            if e.code in (401, 402, 403, 429) or "quota" in msg.lower():
                continue  # out of characters / key rejected: try the next account
            break
    sys.exit("voice.py: ElevenLabs refused the take on every account:\n  " + "\n  ".join(errors))


def decode(mp3):
    # 24-bit wav via a temp file: the bundled ffmpeg has no raw/float PCM muxers or encoders
    tmp = mp3 + ".tmp.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s24le", tmp], check=True)
    x, sr = sf.read(tmp, dtype="float64")
    os.remove(tmp)
    assert sr == SR
    return x


def stretch(x, tempo):
    """speed a take up/down without changing pitch (ffmpeg atempo, WSOLA)"""
    if abs(tempo - 1) < 1e-3:
        return x
    a, b = "_st_in.wav", "_st_out.wav"
    sf.write(a, x, SR, subtype="PCM_24")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a, "-af", f"atempo={tempo}", "-c:a", "pcm_s24le", b], check=True)
    y, _ = sf.read(b, dtype="float64")
    os.remove(a), os.remove(b)
    return y


def frame_db(x, hop=0.01):
    n = int(hop * SR)
    f = x[: len(x) // n * n].reshape(-1, n)
    return 10 * np.log10((f ** 2).mean(axis=1) + 1e-12), n


def words_of(al):
    chars, s0, s1 = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    text = "".join(chars)
    tag = np.zeros(len(text), bool)
    events = []
    for m in re.finditer(r"\[([^\]]+)\]", text):
        tag[m.start():m.end()] = True
        events.append({"type": m.group(1), "t": s0[m.start()], "end": s1[m.end() - 1]})
    words = []
    for m in re.finditer(r"\S+", text):
        idx = [i for i in range(m.start(), m.end()) if not tag[i]]
        w = "".join(text[i] for i in idx)
        if idx and re.search(r"[A-Za-z0-9]", w):
            words.append({"word": w, "start": s0[idx[0]], "end": s1[idx[-1]]})
    return words, events


def snap_onsets(words, x, speech_db=-37.0, hop=0.01):
    """v3's alignment hands the breath/pause before a word to that word, so its start can run
    ~0.5 s early. If a word 'starts' in quiet, move the start to the real onset (and pull a
    word's end back out of trailing quiet), never past the neighbouring words."""
    db, n = frame_db(x, hop)
    loud = db > speech_db
    F = len(loud)
    for i, w in enumerate(words):
        a = int(w["start"] / hop)
        lim = int(min(w["end"] - 0.04, words[i + 1]["start"] if i + 1 < len(words) else w["end"]) / hop)
        if a < F and not loud[a]:
            j = a
            while j < min(lim, F) and not loud[j]:
                j += 1
            if j < min(lim, F):
                w["start"] = round(max(w["start"], j * hop - 0.02), 3)
        e = int(w["end"] / hop)
        k = min(e, F - 1)
        while k > int(w["start"] / hop) + 5 and not loud[k]:
            k -= 1
        w["end"] = round(max(w["start"] + 0.08, min(w["end"], (k + 1) * hop + 0.03)), 3)


def f0_median(x):
    """rough median pitch of voiced 40 ms frames (autocorrelation), for spotting drift between takes"""
    n, out = int(0.04 * SR), []
    for i in range(0, len(x) - n, n):
        f = x[i:i + n] * np.hanning(n)
        if np.sqrt((f ** 2).mean()) < 0.02:
            continue
        ac = np.correlate(f, f, "full")[n - 1:]
        lo, hi = SR // 400, SR // 90
        j = lo + int(np.argmax(ac[lo:hi]))
        if ac[j] > 0.45 * ac[0]:
            out.append(SR / j)
    return float(np.median(out)) if out else 0.0


def main():
    work = sys.argv[1]
    args = sys.argv[2:]
    do_synth = "--synth" in args
    redo = set(args[args.index("--redo") + 1].split(",")) if "--redo" in args else set()
    only = set(args[args.index("--only") + 1].split(",")) if "--only" in args else None
    seed = int(args[args.index("--seed") + 1]) if "--seed" in args else None
    blocks = parse(os.path.join(SRC, "script.txt"))
    vdir = os.path.join(SRC, "voice")
    os.makedirs(vdir, exist_ok=True)

    spent, missing = 0, []
    for b in blocks:
        meta_p = os.path.join(vdir, b["id"] + ".json")
        fresh = os.path.exists(meta_p) and json.load(open(meta_p)).get("key") == key_of(b)
        if fresh and b["id"] not in redo:
            continue
        if not do_synth or (only is not None and b["id"] not in only):
            missing.append(b["id"])
            continue
        audio, al = synth(b["text"], seed)
        spent += len(b["text"])
        open(os.path.join(vdir, b["id"] + ".mp3"), "wb").write(audio)
        json.dump({"key": key_of(b), "text": b["text"], "voice": VOICE_ID, "model": MODEL, "stability": STABILITY,
                   "seed": seed, "alignment": al}, open(meta_p, "w"))
        print(f"  synthesized {b['id']} ({len(b['text'])} chars)")
    if spent:
        print(f"ElevenLabs characters spent this run: {spent}")
    if missing:
        sys.exit(f"voice.py: no take yet for the current text of: {', '.join(missing)} (run with --synth)")

    out, words, events, info, t = [], [], [], [], 0.0
    for b in blocks:
        meta = json.load(open(os.path.join(vdir, b["id"] + ".json")))
        x = decode(os.path.join(vdir, b["id"] + ".mp3"))
        ws, evs = words_of(meta["alignment"])
        db, hop = frame_db(x)
        loud = np.where(db > b["trim_db"])[0]
        # drop isolated clicks at either edge (< 30 ms, > 150 ms away from the speech)
        runs = np.split(loud, np.where(np.diff(loud) > 1)[0] + 1)
        while len(runs) > 1 and len(runs[-1]) < 3 and runs[-1][0] - runs[-2][-1] > 15:
            runs.pop()
        while len(runs) > 1 and len(runs[0]) < 3 and runs[1][0] - runs[0][-1] > 15:
            runs.pop(0)
        a = max(0, runs[0][0] * hop - int(EDGE * SR))
        e = min(len(x), (runs[-1][-1] + 1) * hop + int(EDGE * SR))
        x = x[a:e].copy()
        nf = int(0.008 * SR)
        x[:nf] *= np.linspace(0, 1, nf)
        x[-nf:] *= np.linspace(1, 0, nf)
        shift = [(0.0, a / SR)]            # (from time, subtract) pieces, applied in order
        cuts = []
        if b["tighten"]:
            db, hop = frame_db(x)
            quiet = db < SIL_DB
            i = 0
            while i < len(quiet):
                if not quiet[i]:
                    i += 1
                    continue
                j = i
                while j < len(quiet) and quiet[j]:
                    j += 1
                L = (j - i) * hop / SR
                if L > TIGHT_MAX and i > 0 and j < len(quiet):
                    c0 = i * hop / SR + TIGHT_KEEP / 2
                    cuts.append((c0, c0 + L - TIGHT_KEEP))
                i = j
        if cuts:
            keep, pos = [], 0
            for c0, c1 in cuts:
                keep.append(x[pos:int(c0 * SR)])
                pos = int(c1 * SR)
            keep.append(x[pos:])
            fadeN = int(0.004 * SR)
            y = keep[0]
            for k in keep[1:]:
                if len(y) > fadeN and len(k) > fadeN:
                    r = np.linspace(0, 1, fadeN)
                    y = np.concatenate([y[:-fadeN], y[-fadeN:] * (1 - r) + k[:fadeN] * r, k[fadeN:]])
                else:
                    y = np.concatenate([y, k])
            x = y

        x = stretch(x, b["tempo"])

        def moved(tt):
            tt -= a / SR
            for c0, c1 in cuts:
                if tt >= c1:
                    tt -= c1 - c0
                elif tt > c0:
                    tt = c0
            return max(0.0, tt) / b["tempo"]

        t += b["gap"]
        for w in ws:
            words.append({"word": w["word"], "start": round(t + moved(w["start"]), 3), "end": round(t + moved(w["end"]), 3), "block": b["id"]})
        for ev in evs:
            events.append({"type": ev["type"], "t": round(t + moved(ev["t"]), 3), "end": round(t + moved(ev["end"]), 3), "block": b["id"]})
        dur = len(x) / SR
        rms = 20 * np.log10(np.sqrt((x[np.abs(x) > 1e-4] ** 2).mean()) + 1e-12)
        info.append({"id": b["id"], "start": round(t, 3), "end": round(t + dur, 3), "gap": b["gap"],
                     "wpm": round(len(ws) / dur * 60), "rms_db": round(float(rms), 1), "f0": round(f0_median(x)),
                     "cut": round(sum(c1 - c0 for c0, c1 in cuts), 2)})
        out.append(np.zeros(int(round(b["gap"] * SR))))
        out.append(x)
        t += dur
    voice = np.concatenate(out)
    snap_onsets(words, voice)
    sf.write(os.path.join(work, "narration.wav"), voice, SR, subtype="FLOAT")
    json.dump({"words": words, "blocks": info, "events": events}, open(os.path.join(work, "words.json"), "w"), indent=1)
    print(f"{'block':9s} {'start':>6s} {'end':>6s}  wpm  rms   f0  cut")
    for i in info:
        print(f"{i['id']:9s} {i['start']:6.2f} {i['end']:6.2f}  {i['wpm']:3d} {i['rms_db']:5.1f} {i['f0']:4d} {i['cut']:4.2f}")
    print(f"narration {len(voice) / SR:.2f}s, {len(words)} words, events: " + ", ".join(f"{e['type']}@{e['t']:.2f}" for e in events))


if __name__ == "__main__":
    main()
