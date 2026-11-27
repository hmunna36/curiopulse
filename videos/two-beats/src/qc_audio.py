"""Mix QC: per-shot stem levels and per-word speech-band SNR (voice vs everything else).
Usage: python3 qc_audio.py <work_dir>"""
import json, sys
import numpy as np, soundfile as sf
from scipy import signal
W = sys.argv[1]
SR = 48000
st = {k: sf.read(f"{W}/stems/{k}.wav")[0].mean(axis=1) for k in ("voice", "sfx", "music", "amb")}
tl = json.load(open(f"{W}/timeline.json"))
db = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print("shot        voice    sfx   music    amb")
for s in tl["shots"]:
    a, b = int(s["start"] * SR), int(s["end"] * SR)
    print(f'{s["id"]:10s}' + "".join(f"{db(st[k][a:b]):7.1f}" for k in st))
sos = signal.butter(4, [300, 4000], btype="bandpass", fs=SR, output="sos")
bb = {k: signal.sosfiltfilt(sos, v) for k, v in st.items()}
act = np.zeros(len(st["voice"]), bool)
for w in tl["words"]:
    act[int(w["start"] * SR):int(w["end"] * SR)] = True
bg = bb["sfx"] + bb["music"] + bb["amb"]
print(f"speech-active, speech band: voice {db(bb['voice'][act]):.1f}  bg {db(bg[act]):.1f}  music {db(bb['music'][act]):.1f}  sfx {db(bb['sfx'][act]):.1f}")
low = []
for w in tl["words"]:
    a, e = int(w["start"] * SR), int(w["end"] * SR)
    v, g = db(bb["voice"][a:e]), db(bg[a:e])
    if v - g < 10 and v > -45:
        low.append(f'{w["word"]}@{w["start"]:.2f} snr {v - g:.1f} (voice {v:.1f}, bg {g:.1f})')
print(f"{len(low)} words under 10 dB:"); print("\n".join(low))
