"""Narration: local Kokoro-82M TTS with word-level timings.

Usage: python3 tts.py <model_dir> <out_dir> <voice> <speed> [text | spec.json]\n(spec.json: phrase-by-phrase delivery; <speed> then acts as a global multiplier)
Writes <out_dir>/narration.wav (24 kHz mono) and <out_dir>/words.json.
The model needs a "duration" output (see patch in build notes) so every
phoneme gets an exact start/end time; words are rebuilt from those.
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

_SCRIPT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.txt")
SCRIPT = open(_SCRIPT_PATH).read().strip() if os.path.exists(_SCRIPT_PATH) else ""


STRESS = "ˈˌː"


def word_timings(k, text, spoken):
    """Map phoneme timings back to text words.

    The phonemizer merges neighbours ("from the" -> one group), so words are
    phonemized one by one and aligned to the spoken phoneme stream at the
    character level (difflib); a word spans its matched phonemes.
    """
    import difflib
    S, St = [], []
    for t in spoken:
        for ch in t.phoneme:
            if ch.isspace() or ch in STRESS or not (ch.isalpha() or ord(ch) > 127):
                continue
            S.append(ch)
            St.append((t.start, t.end))
    words = [w.strip(".,!?;:\u2014-\"'") for w in text.replace("\u2014", " ").split()]
    words = [w for w in words if w]
    T, lab = [], []
    for i, w in enumerate(words):
        ph = k.tokenizer.phonemize(w, "en-us")
        for ch in ph:
            if ch.isspace() or ch in STRESS or not (ch.isalpha() or ord(ch) > 127):
                continue
            T.append(ch)
            lab.append(i)
    sm = difflib.SequenceMatcher(None, S, T, autojunk=False)
    span = [[None, None] for _ in words]
    for blk in sm.get_matching_blocks():
        for q in range(blk.size):
            si, ti = blk.a + q, blk.b + q
            w = lab[ti]
            st, en = St[si]
            span[w][0] = st if span[w][0] is None else min(span[w][0], st)
            span[w][1] = en if span[w][1] is None else max(span[w][1], en)
    # words with no matched phonemes: interpolate between neighbours
    for i, sp in enumerate(span):
        if sp[0] is None:
            prev = next((span[j][1] for j in range(i - 1, -1, -1) if span[j][1] is not None), 0.0)
            nxt = next((span[j][0] for j in range(i + 1, len(span)) if span[j][0] is not None), prev + 0.2)
            sp[0], sp[1] = prev, max(prev + 0.05, nxt)
    return [{"word": w, "start": round(span[i][0], 3), "end": round(span[i][1], 3)} for i, w in enumerate(words)]


def render_segments(k, spec, voice, speed_scale=1.0):
    """Phrase-by-phrase delivery: own speed + punctuation per phrase, held silence after it."""
    parts, words, t = [], [], 0.0
    sr = 24000
    for seg in spec["segments"]:
        audio, sr, spoken = k.create_timed(seg["t"], voice=voice, speed=seg["speed"] * speed_scale, lang="en-us",
                                           sentence_pause=0.12, clause_pause=0.05)
        audio = audio * 10 ** (seg.get("gain", 0.0) / 20)
        for w in word_timings(k, seg["t"], spoken):
            words.append({"word": w["word"], "start": round(w["start"] + t, 3), "end": round(w["end"] + t, 3)})
        gap = np.zeros(int(max(0.06, seg.get("pause", 0.0)) * sr), dtype=np.float32)
        parts += [audio.astype(np.float32), gap]
        t += (len(audio) + len(gap)) / sr
    return np.concatenate(parts), sr, words


def main():
    model_dir, out_dir, voice, speed = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    text = sys.argv[5] if len(sys.argv) > 5 else SCRIPT
    os.makedirs(out_dir, exist_ok=True)
    k = Kokoro(os.path.join(model_dir, "kokoro-timed.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    if text.endswith(".json"):
        spec = json.load(open(text))
        audio, sr, out = render_segments(k, spec, voice, speed)
        text = " ".join(seg["t"] for seg in spec["segments"])
    else:
        audio, sr, spoken = k.create_timed(text, voice=voice, speed=speed, lang="en-us",
                                           sentence_pause=0.12, clause_pause=0.05)
        out = word_timings(k, text, spoken)
    sf.write(os.path.join(out_dir, "narration.wav"), audio, sr)
    json.dump({"voice": voice, "speed": speed, "sr": sr, "duration": len(audio) / sr,
               "text": text, "words": out},
              open(os.path.join(out_dir, "words.json"), "w"), indent=1)
    print(f"{voice} dur={len(audio)/sr:.2f}s words={len(out)}")


if __name__ == "__main__":
    main()
