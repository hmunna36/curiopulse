"""CurioPulse mix + master: voice first, everything else ducks under it, -14 LUFS, true peak <= -1 dBTP after AAC.

    from mixlib import master
    master(WORK, sfx, bed, mus, amb)        # buses from sfxlib.Bus, all the video's length

Steps:
- The narration (WORK/voice.wav) goes through a high-pass, a touch of presence, and a slow leveler, so
  whispers come up and shouts come down (attack 60 ms, release 300 ms).
- Then a gentle compressor.
- SFX and the bed duck 50 % / 75 % under speech, the music 68 %; ambience rides along.
- One room reverb, and a 16 kHz low-pass on the SFX bus: AAC drops that band anyway, and sharp cracks
  ring up there.
- Each bus is peak-normalised to its level (voice -3, sfx -5, music -11, amb -17 dB).
- Stems go to WORK/stems/ for qc_audio.py; the mix is looped to -14 LUFS with a -1.9 dBTP
  true-peak limiter (AAC overshoots by ~0.6 dB) and written as WORK/mix.wav.

Tuning per video: pass levels={"music": -12, ...} or duck={"music": 0.75, ...}. Never lower the voice
to fix a mix; turn the offending cue down (qc_audio.py names the masked words).
"""
import os

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal

from sfxlib import SR, filt, pan_st, reverb_ir, true_peak_limit, db

LEVELS = {"voice": -3.0, "sfx": -5.0, "music": -11.0, "amb": -17.0}
DUCK = {"sfx": 0.5, "bed": 0.75, "music": 0.68}


def level_voice(vo):
    vo = filt(vo, "highpass", 80)
    vo = vo + 0.25 * filt(vo, "bandpass", [2500, 6000])                # a touch of presence
    hop = int(0.02 * SR)
    frm = vo[: len(vo) // hop * hop].reshape(-1, hop)
    rms = np.sqrt((frm ** 2).mean(axis=1) + 1e-12)
    act = rms > np.max(rms) * 10 ** (-42 / 20)
    target = np.percentile(rms[act], 70)
    gain_f = np.ones_like(rms)
    gain_f[act] = np.clip(target / rms[act], 0.7, 3.2) ** 0.85
    sm = np.empty_like(gain_f)
    cur = 1.0
    for i, gv in enumerate(gain_f.tolist()):                         # attack 60 ms, release 300 ms
        k = 1 - np.exp(-1 / (3 if gv < cur else 15))
        cur += (gv - cur) * k
        sm[i] = cur
    gain_s = np.repeat(sm, hop)
    vo = vo[: len(gain_s)] * gain_s
    env = np.sqrt(filt(vo ** 2, "lowpass", 15).clip(1e-12))
    gr = np.minimum(1, (env / (np.percentile(env[env > 1e-4], 85) * 0.9)) ** -0.3)
    return vo * gr


def master(work, sfx, bed, mus, amb, levels=None, duck=None, lufs=-14.0, ceiling=-1.9):
    lv = dict(LEVELS, **(levels or {}))
    dk = dict(DUCK, **(duck or {}))
    n = sfx.x.shape[1]
    vo, vsr = sf.read(os.path.join(work, "voice.wav"))
    vo = signal.resample_poly(vo, SR, vsr) if vsr != SR else vo
    if vo.ndim > 1:
        vo = vo.mean(axis=1)
    vo = level_voice(vo)
    voice = np.zeros(n)
    voice[: min(n, len(vo))] = vo[:n]
    voice /= np.max(np.abs(voice)) + 1e-9

    venv = np.abs(voice)
    venv = signal.lfilter([1 - np.exp(-1 / (0.12 * SR))], [1, -np.exp(-1 / (0.12 * SR))], venv)
    venv /= venv.max() + 1e-9
    vk = np.clip(venv * 4, 0, 1)
    duck_m = 1 - dk["music"] * vk

    ir = reverb_ir(1.1)
    fx = sfx.x * (1 - dk["sfx"] * vk) + bed.x * (1 - dk["bed"] * vk)
    wet = np.stack([signal.fftconvolve(fx[ch], ir[ch])[:n] for ch in range(2)])
    mus_wet = np.stack([signal.fftconvolve(mus.x[ch], ir[1 - ch])[:n] for ch in range(2)])
    sfx_bus = np.stack([filt(ch, "lowpass", 16000, 4) for ch in fx + 0.2 * wet])
    mus_bus = (mus.x + 0.25 * mus_wet) * duck_m
    amb_bus = amb.x * (0.4 + 0.6 * duck_m)

    voice_st = pan_st(voice, 0) * db(lv["voice"])
    sfx_st = sfx_bus / (np.max(np.abs(sfx_bus)) + 1e-9) * db(lv["sfx"])
    mus_st = mus_bus / (np.max(np.abs(mus_bus)) + 1e-9) * db(lv["music"])
    amb_st = amb_bus / (np.max(np.abs(amb_bus)) + 1e-9) * db(lv["amb"])
    mix = voice_st + sfx_st + mus_st + amb_st

    os.makedirs(os.path.join(work, "stems"), exist_ok=True)
    for name, x in (("voice", voice_st), ("sfx", sfx_st), ("music", mus_st), ("amb", amb_st)):
        sf.write(os.path.join(work, "stems", f"{name}.wav"), x.T, SR)

    meter = pyln.Meter(SR)
    for _ in range(3):
        loud = meter.integrated_loudness(mix.T)
        mix = mix * db(lufs - loud)
        mix = true_peak_limit(mix, ceiling)
    loud = meter.integrated_loudness(mix.T)
    mix[:, -int(0.012 * SR):] *= np.linspace(1, 0, int(0.012 * SR))
    sf.write(os.path.join(work, "mix.wav"), mix.T, SR, subtype="PCM_24")
    up = signal.resample_poly(mix, 4, 1, axis=1)
    tp = 20 * np.log10(np.abs(up).max())
    print(f"mix.wav: {mix.shape[1] / SR:.3f}s  integrated {loud:.2f} LUFS  true-peak {tp:.2f} dBTP")
    return loud, tp
