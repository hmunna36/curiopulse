"""RMS of mix.wav in each gag's own window (reference/sound.md: a sound that carries a joke wants about -19...-24 dB
in its gap; the voice is about -16 in its words). Usage: python3 qc_gags.py <work_dir>"""
import json, sys
import numpy as np, soundfile as sf
W = sys.argv[1]
c = json.load(open(f"{W}/timeline.json"))["cues"]
x, sr = sf.read(f"{W}/mix.wav")
x = x.mean(axis=1)
D = len(x) / sr
G = [("tap (frame 1)", 0.0, 0.05), ("phone voice, under her", 0.6, 0.5), ("phone voice, solo", c["gib1"] + 0.03, c["gib1_end"] - c["gib1"] - 0.06),
     ("phone's last word", c["that_end"] + 0.1, 0.3), ("name ping", c["news_end"] + 0.1, 0.2), ("sad blat", c["you_end"] + 0.02, 0.26),
     ("TWICE ticks", c["twice_end"] + 0.02, 0.18), ("air arrives", c["air_end"] + 0.02, 0.08), ("SKULL knock", c["skull_end"] + 0.02, 0.2),
     ("fat wave swell", c["deeper_end"] + 0.03, c["like"] - c["deeper_end"] - 0.06), ("her deep voice", c["deeper"], c["deeper_end"] - c["deeper"]),
     ("her deep 'movie trailer'", c["movie"], c["trailer_end"] - c["movie"]), ("DUN", c["trailer_end"] + 0.02, 0.22), ("buzzer", c["part_end"] + 0.02, 0.15),
     ("song in gap 1", c["recording_end"] + 0.03, c["iswhat"] - c["recording_end"] - 0.06), ("song in gap 3", c["has"] + 0.2, c["always"] - c["has"] - 0.23),
     ("record scratch", c["realise"], 0.24), ("cricket", c["heard_end"] + 0.03, 0.25), ("hum, across the room (gap)", c["hum_end"] + 0.02, c["thatboom"] - c["hum_end"] - 0.04),
     ("the BOOM (gap)", c["boom_end"] + 0.02, c["yourskull"] - c["boom_end"] - 0.05), ("boom tail", c["skull2_end"] + 0.02, 0.15),
     ("ta-da", c["ownv_end"] + 0.03, 0.22), ("five stars", c["theirs_end"] + 0.03, 0.27), ("! pluck", c["more_end"] + 0.02, 0.1),
     ("phone voice, replay", c["replay"] + 0.02, c["replay_end"] - c["replay"] - 0.04), ("mm-hm", c["voice2_end"] + 0.06, 0.3), ("heart pop", c["you2_end"] + 0.03, 0.2),
     ("small hic", c["hic1"], 0.1), ("subscribe click", c["sub_tap"], 0.06), ("HIC!", c["hic"], 0.12), ("toss whistle", c["hic"] + 0.2, 0.4), ("catch", c["play2"], 0.08)]
for name, t0, d in G:
    seg = x[int(t0 * sr):int((t0 + d) * sr)]
    print(f"{name:28s} {t0:6.2f}s  {10 * np.log10((seg ** 2).mean() + 1e-12):6.1f} dB")
