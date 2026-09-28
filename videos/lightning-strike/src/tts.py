"""Narration: local Kokoro-82M TTS with word-level timings.

Usage: python3 tts.py <model_dir> <out_dir> <voice> <speed> [text]
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

SCRIPT = ("Lightning just hit him! Thirty thousand amps... hotter than the Sun's surface. "
          "But most of it skims over his skin, not through him, leaving fern-shaped marks. "
          "Nine in ten survive.")


def word_timings(text, spoken):
    """Group phoneme timings into words (spaces separate words)."""
    words, cur = [], None
    for t in spoken:
        if t.phoneme == " ":
            if cur:
                words.append(cur)
            cur = None
            continue
        if not any(ch.isalpha() or ch in "ˈˌːʰ" or ord(ch) > 127 for ch in t.phoneme):
            continue  # punctuation token
        if cur is None:
            cur = {"ph": "", "start": t.start, "end": t.end}
        cur["ph"] += t.phoneme
        cur["end"] = t.end
    if cur:
        words.append(cur)
    tokens = [w.strip(".,!?;:—-") for w in text.replace("—", " ").split()]
    tokens = [w for w in tokens if w]
    return words, tokens


def main():
    model_dir, out_dir, voice, speed = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
    text = sys.argv[5] if len(sys.argv) > 5 else SCRIPT
    os.makedirs(out_dir, exist_ok=True)
    k = Kokoro(os.path.join(model_dir, "kokoro-timed.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    audio, sr, spoken = k.create_timed(text, voice=voice, speed=speed, lang="en-us",
                                       sentence_pause=0.12, clause_pause=0.05)
    sf.write(os.path.join(out_dir, "narration.wav"), audio, sr)
    words, tokens = word_timings(text, spoken)
    out = []
    for i, w in enumerate(words):
        out.append({"word": tokens[i] if i < len(tokens) else "?", "ph": w["ph"],
                    "start": round(w["start"], 3), "end": round(w["end"], 3)})
    json.dump({"voice": voice, "speed": speed, "sr": sr, "duration": len(audio) / sr,
               "text": text, "words": out, "n_tokens": len(tokens)},
              open(os.path.join(out_dir, "words.json"), "w"), indent=1)
    print(f"{voice} speed={speed} dur={len(audio)/sr:.2f}s words={len(words)} tokens={len(tokens)}")


if __name__ == "__main__":
    main()
