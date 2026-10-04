"""RMS of mix.wav in each gag's own window (reference/sound.md: a sound that carries a joke wants about -19...-24 dB
in its gap; the voice is about -16 in its words). Usage: python3 qc_gags.py <work_dir>"""
import json, sys
import numpy as np, soundfile as sf
W = sys.argv[1]
c = json.load(open(f"{W}/timeline.json"))["cues"]
x, sr = sf.read(f"{W}/mix.wav")
x = x.mean(axis=1)
D = len(x) / sr
G = [("gong", c["crash"], 0.6), ("gong tail before 'Your'", c["yourleg"] - 0.5, 0.25), ("halo ting", c["om"], 0.25), ("leg thud", c["drop"] + 0.12, 0.25),
     ("fizz hiss", c["fizz_end"] + 0.06, c["pins"] - c["fizz_end"] - 0.1), ("zap", c["title"], 0.2), 
     ("NERVE pluck", c["nerve_end"] + 0.02, 0.14), ("? pluck", c["find_end"] + 0.03, 0.25), ("ERROR buzz", c["badly_end"] + 0.02, 0.15),
     ("300 ding", c["second_end"] + 0.03, 0.22), ("0 pins ding", c["skin_end"] + 0.05, 0.25), ("static burst", c["static_end"] + 0.06, c["andyour"] - c["static_end"] - 0.12),
     ("hmm plucks", c["guesses_end"] + 0.06, 0.42), ("best-guess stamp + blat", c["needles2_end"] + 0.02, 0.34), ("harmless ding", c["harmless_end"] + 0.03, 0.25),
     ("toe squeak", c["toes_end"] + 0.02, 0.1), ("harp", c["enlightened_end"] + 0.03, 0.3), ("phone warble", c["weird_end"] + 0.02, 0.2),
     ("subscribe click", c["sub_tap"], 0.06), ("shh", c["quietly"] - 0.26, 0.22), ("quietly (the whisper)", c["quietly"], c["quietly_end"] - c["quietly"]),
     ("last zap", c["zap2"], 0.24), ("slide", c["zap2"] + 0.3, 0.3), ("gong 2", c["gong2"], D - c["gong2"] - 0.02)]
for name, t0, d in G:
    seg = x[int(t0 * sr):int((t0 + d) * sr)]
    print(f"{name:28s} {t0:6.2f}s  {10 * np.log10((seg ** 2).mean() + 1e-12):6.1f} dB")
