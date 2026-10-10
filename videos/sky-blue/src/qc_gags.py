"""How loud is each joke sound in the mix? RMS of mix.wav over the gag's own window (it has a pause to itself).
A sound that carries a joke wants about -19 ... -24 dB there (the narrator is about -16).
Usage: python3 qc_gags.py <work_dir>"""
import json, sys
import numpy as np, soundfile as sf
W = sys.argv[1]
x, sr = sf.read(f"{W}/mix.wav"); x = x.mean(axis=1)
tl = json.load(open(f"{W}/timeline.json")); c = tl["cues"]; S = {s["id"]: s["start"] for s in tl["shots"]}
b = c["bonks"]
G = [("power-down after 'black.'", c["black_end"] + 0.03, 0.36), ("crash, heard (after 'air.')", [t for t in c["crashes"] if t > c["air1_end"]][0], 0.1),
     ("six notes after 'once.'", c["once_end"] + 0.035, 0.32), ("red's lazy wah", c["waves_end"] + 0.05, 0.25), ("hm? (shrug)", c["past_end"] + 0.04, 0.14),
     ("bzzt after 'waves.'", c["twaves_end"] + 0.02, 0.13), ("bumper after 'molecules...'", b[2], 0.1), ("last bumper", b[-1], 0.1),
     ("bird after 'sky.'", c["sky_end"] + 0.03, 0.25), ("radio beep", c["air_m_end"] + 0.035, 0.06), ("TINK", c["tink"], 0.17), ("hmph", c["tink"] + 0.2, 0.17),
     ("red's hey after 'leftovers.'", c["leftovers_end"] + 0.06, 0.3), ("boo-wip after 'Mars?'", c["mars_end"] + 0.035, 0.1),
     ("rover beeps", c["backwards_end"] + 0.04, 0.16), ("pip after 'sunset.'", c["bsun_end"] + 0.03, 0.1), ("rover rattle", c["dust_end"] + 0.035, 0.16),
     ("bird (button)", S["button"] + 0.07, 0.25), ("GULP", c["gulp"], 0.3), ("ahh", c["ahh"], 0.42)]
db = lambda v: 20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-9)
act = np.zeros(len(x), bool)
for w in tl["words"]:
    act[int(w["start"] * sr):int(w["end"] * sr)] = True
print(f"narrator while speaking: {db(x[act]):.1f} dB")
for name, t, d in G:
    seg = x[int(t * sr):int((t + d) * sr)]
    nxt = min([w["start"] for w in tl["words"] if w["start"] >= t - 0.01] + [tl["duration"]])
    flag = "" if -24.5 <= db(seg) <= -18.5 else ("  <-- quiet" if db(seg) < -24.5 else "  <-- loud")
    clash = "  (RUNS INTO THE NEXT WORD)" if t + d > nxt - 0.08 else ""
    print(f"{name:32s} {t:6.2f}-{t + d:6.2f}  {db(seg):6.1f} dB{flag}{clash}")
