"""Narration: local Kokoro-82M TTS with word-level timings.

Usage: python3 tts.py <model_dir> <out_dir> <voice> <speed> [text]  (default text: script.txt)
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

SCRIPT = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.txt")).read().strip()


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


def main():
    model_dir, out_dir, voice, speed = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    text = sys.argv[5] if len(sys.argv) > 5 else SCRIPT
    os.makedirs(out_dir, exist_ok=True)
    k = Kokoro(os.path.join(model_dir, "kokoro-timed.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    audio, sr, spoken = k.create_timed(text, voice=voice, speed=speed, lang="en-us",
                                       sentence_pause=0.12, clause_pause=0.05)
    sf.write(os.path.join(out_dir, "narration.wav"), audio, sr)
    out = word_timings(k, text, spoken)
    json.dump({"voice": voice, "speed": speed, "sr": sr, "duration": len(audio) / sr,
               "text": text, "words": out},
              open(os.path.join(out_dir, "words.json"), "w"), indent=1)
    print(f"{voice} speed={speed} dur={len(audio)/sr:.2f}s words={len(out)}")


if __name__ == "__main__":
    main()
