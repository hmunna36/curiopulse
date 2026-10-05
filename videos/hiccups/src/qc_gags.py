"""RMS of mix.wav in each gag's own window (reference/sound.md: a sound that carries a joke wants about -19...-24 dB
in its gap; the voice is about -16 in its words). Usage: python3 qc_gags.py <work_dir>"""
import json, sys
import numpy as np, soundfile as sf
W = sys.argv[1]
c = json.load(open(f"{W}/timeline.json"))["cues"]
x, sr = sf.read(f"{W}/mix.wav")
x = x.mean(axis=1)
G = [("gulp (frame 1)", 0.0, 0.2), ("aah", c["aah"], 0.18), ("HIC 1", c["hic1"], 0.12), ("candle pff", c["hic1"] + 0.11, 0.12), ("chin drip", c["smooth_end"] if False else 4.46, 0.08),
     ("door slam 1 (under a word)", c["slam1"], 0.2), ("sign ding", c["sign"] + 0.02, 0.2), ("breath bonk", c["bump1"], 0.16),
     ("poke 3", c["poke3"], 0.12), ("muscle grunt", c["grunt"], 0.16), ("jerk thud (under a word)", c["jerk"], 0.25), ("air rush (under words)", c["jerk"] + 0.9, 1.0),
     ("door slam 2 (under a word)", c["slam2"], 0.2), ("HIC 2", c["hic2"], 0.12), ("subscribe pop", c["sub_in"], 0.15), ("subscribe click", c["sub_tap"], 0.06),
     ("tadpole comes up (under words)", c["peek"], 0.3), ("squelch", c["squelch"], 0.2), ("two hics", c["hicpair"], 0.2), ("tadpole hic", c["tadhic"], 0.12),
     ("phew", c["phew"], 0.18), ("poof", c["poof"], 0.2), ("ribbit", c["croak"], 0.34), ("HIC 3", c["hic3"], 0.12), ("last gulp", c["loop"] + 0.1, 0.25)]
for name, t0, d in G:
    seg = x[int(t0 * sr):int((t0 + d) * sr)]
    print(f"{name:32s} {t0:6.2f}s  {10 * np.log10((seg ** 2).mean() + 1e-12):6.1f} dB")
