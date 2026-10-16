"""Re-time the narration's words with whisper's word timestamps, where ElevenLabs' alignment is off.

Usage: python3 realign.py <work_dir>
Reads <work>/words.json + narration.wav (voice.py); writes <work>/align.json: [{"start", "end"}] per word, in the
order of words.json. make_timeline.py uses it when it is there and has the same number of words.

Why: v3's alignment can crowd a phrase into the pause before it (space-without-suit, 16 Oct 2026: "The last thing he"
was placed 0.3 s early, in silence), so its captions pop early and qa.py measures those words in silence (SNR -40 dB:
a FAIL). Whisper (faster-whisper, base.en) hears where each word really is; the script's words are matched to whisper's
by sequence alignment, and the unmatched ones (numerals: "1960" for "nineteen sixty") are spread over the gap between
their matched neighbours by length. Each block is transcribed on its own, so an error cannot drift past its block.
"""
import difflib
import json
import re
import sys

import numpy as np
import soundfile as sf

WORK = sys.argv[1]
meta = json.load(open(f"{WORK}/words.json"))
words, blocks = meta["words"], meta["blocks"]
audio, sr = sf.read(f"{WORK}/narration.wav")
if audio.ndim > 1:
    audio = audio.mean(axis=1)


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())


from faster_whisper import WhisperModel  # noqa: E402

model = WhisperModel("base.en", device="cpu", compute_type="int8")
out = [{"start": w["start"], "end": w["end"]} for w in words]
for b in blocks:
    idx = [i for i, w in enumerate(words) if w.get("block") == b["id"]]
    if not idx:
        continue
    t0, t1 = max(0.0, b["start"] - 0.05), min(len(audio) / sr, b["end"] + 0.15)
    seg = audio[int(t0 * sr):int(t1 * sr)].astype(np.float32)
    if sr != 16000:
        from scipy.signal import resample_poly
        seg = resample_poly(seg, 16000, sr).astype(np.float32)
    text = " ".join(words[i]["word"] for i in idx)
    segs, _ = model.transcribe(seg, beam_size=5, word_timestamps=True, language="en", initial_prompt=text, vad_filter=False)
    hw = [(norm(x.word), t0 + x.start, t0 + x.end) for s_ in segs for x in (s_.words or [])]
    hw = [x for x in hw if x[0]]
    a = [norm(words[i]["word"]) for i in idx]
    sm = difflib.SequenceMatcher(a=a, b=[x[0] for x in hw], autojunk=False)
    got = {}
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                got[i1 + k] = (hw[j1 + k][1], hw[j1 + k][2])
        elif tag == "replace" and (i2 - i1) == (j2 - j1):
            for k in range(i2 - i1):
                got[i1 + k] = (hw[j1 + k][1], hw[j1 + k][2])
    # fill the unmatched words: spread them over the gap between matched neighbours, by length
    n = len(idx)
    k = 0
    while k < n:
        if k in got:
            k += 1
            continue
        j = k
        while j < n and j not in got:
            j += 1
        lo = got[k - 1][1] if k - 1 in got else b["start"]
        hi = got[j][0] if j in got else b["end"]
        if hi <= lo:
            hi = lo + 0.05 * (j - k)
        lens = [max(1, len(a[m])) for m in range(k, j)]
        tot = sum(lens)
        acc = lo
        for m in range(k, j):
            d = (hi - lo) * lens[m - k] / tot
            got[m] = (acc, acc + d)
            acc += d
        k = j
    # monotonic, inside the block, at least 60 ms each
    prev = b["start"] - 0.05
    for m in range(n):
        s, e = got[m]
        s = max(s, prev, b["start"] - 0.05)
        e = min(max(e, s + 0.06), b["end"] + 0.1)
        got[m] = (s, e)
        prev = s + 0.02
    for m, i in enumerate(idx):   # block-relative too, so a later change of gaps (free) keeps it valid
        out[i] = {"start": round(got[m][0], 3), "end": round(got[m][1], 3), "block": b["id"], "b0": round(b["start"], 3)}
    moved = [abs(out[i]["start"] - words[i]["start"]) for i in idx]
    print(f"{b['id']:10s} {len(idx):3d} words, matched {sum(1 for m in range(n) if m in got)}, mean shift {np.mean(moved):.3f}s, max {max(moved):.3f}s")
json.dump(out, open(f"{WORK}/align.json", "w"))
print(f"wrote {WORK}/align.json ({len(out)} words)")
