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

Studio processing (on by default when Spotify's pedalboard is installed in the venv; GPL-3.0, used here as a tool,
never shipped; CP_STUDIO=0 or master(..., studio=False) turns it off, and without pedalboard the classic chain above
runs unchanged):
- the voice's static gain curve becomes a real compressor (3:1, attack 4 ms, release 110 ms, from 6 dB under the
  loudest syllables) plus a look-ahead shave of its rarest transients (<= 3 dB), so the voice bus is normalised on its
  words: on onion tears' mix the content words came out 2.3 dB clearer (mean speech-band SNR 15.4 -> 17.7 dB, words
  under 10 dB 16 -> 6) at the same -14 LUFS;
- a gentle glue compressor on the whole mix (1.6:1, attack 30 ms, release 250 ms) before the loudness loop;
- pedalboard's look-ahead true-peak brick-wall limiter in the loop, with the old limiter left as a safety net: the
  true peak after AAC came out -1.79 dBTP instead of -1.19 (more margin under the -1.0 gate);
- the reverb stays the convolution room (smoother on clicks and hits than a comb-filter reverb); sfxkit.cc0(room=)
  uses pedalboard's Reverb to place a dry recorded one-shot in a small room.
- true_peak_db() is the 4x-oversampled (BS.1770) true-peak meter used here and by qa.py.

voice_fx=fn (5 Oct 2026): fn(levelled mono voice) -> processed voice, for the rare Short where the narrator's own
sound is the demonstration (voice-recording's "inside the head" EQ on one line). Crossfade in and out, and keep
the processed stretch's peak at or under the rest of the voice, or the whole voice bus is normalised down.

Tuning per video: pass levels={"music": -12, ...} or duck={"music": 0.75, ...}. Never lower the voice
to fix a mix; turn the offending cue down (qc_audio.py names the masked words).
"""
import os

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal

from sfxlib import SR, filt, pan_st, reverb_ir, true_peak_limit, db

try:
    import pedalboard as pb       # optional studio processing (see above)
except ImportError:
    pb = None

LEVELS = {"voice": -3.0, "sfx": -5.0, "music": -11.0, "amb": -17.0}
DUCK = {"sfx": 0.5, "bed": 0.75, "music": 0.68}


def studio_on(studio=None):
    """True when the studio chain will run: pedalboard importable and not switched off (CP_STUDIO=0)"""
    if studio is None:
        studio = os.environ.get("CP_STUDIO", "1") != "0"
    return bool(studio) and pb is not None


def true_peak_db(x, sr=SR, oversample=4):
    """ITU-R BS.1770 true peak: the largest |sample| after 4x oversampling. x: (n,) or (ch, n).
    Returns (dBTP, time in s, channel) of the peak."""
    x = np.atleast_2d(np.asarray(x, dtype=np.float64))
    if x.shape[0] > x.shape[1]:
        x = x.T
    up = np.abs(signal.resample_poly(x, oversample, 1, axis=1))
    ch, i = np.unravel_index(np.argmax(up), up.shape)
    return 20 * np.log10(up[ch, i] + 1e-12), i / (sr * oversample), int(ch)


def level_voice(vo, studio=False):
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
    if studio:
        # a broadcast-style compressor instead of the static curve below: 3:1 from 6 dB under the loudest syllables
        # (the 95th percentile of the speech's 10 ms peaks), attack 4 ms, release 110 ms; then the rarest transients
        # (above the 99.9th percentile of those peaks, at most 3 dB) are shaved by a look-ahead limiter, so the voice
        # bus is peak-normalised on its words, not on a plosive: words sit ~2 dB further above the score.
        pk = np.abs(vo[: len(vo) // 480 * 480]).reshape(-1, 480).max(axis=1)
        ref = np.percentile(pk[pk > np.max(pk) * 10 ** (-40 / 20)], 95)
        comp = pb.Pedalboard([pb.Compressor(threshold_db=20 * np.log10(ref) - 6, ratio=3.0, attack_ms=4, release_ms=110)])
        vo = comp(vo.astype(np.float32), SR).astype(np.float64)
        pk = np.abs(vo[: len(vo) // 480 * 480]).reshape(-1, 480).max(axis=1)
        ceil = max(20 * np.log10(np.percentile(pk[pk > np.max(pk) * 10 ** (-40 / 20)], 99.9)), 20 * np.log10(np.max(pk)) - 3)
        shave = pb.Pedalboard([pb.BrickwallLimiter(ceiling_db=ceil, release_ms=40, lookahead_ms=3, true_peak=False)])
        return shave(vo.astype(np.float32), SR).astype(np.float64)
    env = np.sqrt(filt(vo ** 2, "lowpass", 15).clip(1e-12))
    gr = np.minimum(1, (env / (np.percentile(env[env > 1e-4], 85) * 0.9)) ** -0.3)
    return vo * gr


def master(work, sfx, bed, mus, amb, levels=None, duck=None, lufs=-14.0, ceiling=-1.9, studio=None, voice_fx=None):
    studio = studio_on(studio)
    lv = dict(LEVELS, **(levels or {}))
    dk = dict(DUCK, **(duck or {}))
    n = sfx.x.shape[1]
    vo, vsr = sf.read(os.path.join(work, "voice.wav"))
    vo = signal.resample_poly(vo, SR, vsr) if vsr != SR else vo
    if vo.ndim > 1:
        vo = vo.mean(axis=1)
    vo = level_voice(vo, studio)
    if voice_fx is not None:      # the narrator demonstrates a sound (voice-recording: her "inside the head" voice):
        vo = voice_fx(vo)         # fn(levelled mono voice at SR) -> same length; keep its peaks at or under the rest
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
    if studio:
        # glue: 1.6:1 from 8 dB under the mix's loud moments (95th percentile of its 10 ms peaks)
        pk = np.abs(mix[:, : n // 480 * 480]).max(axis=0).reshape(-1, 480).max(axis=1)
        ref = np.percentile(pk[pk > np.max(pk) * 10 ** (-40 / 20)], 95)
        glue = pb.Pedalboard([pb.Compressor(threshold_db=20 * np.log10(ref) - 8, ratio=1.6, attack_ms=30, release_ms=250)])
        mix = glue(mix.astype(np.float32), SR).astype(np.float64)
        limiter = pb.Pedalboard([pb.BrickwallLimiter(ceiling_db=ceiling, release_ms=60, lookahead_ms=5, true_peak=True)])
    for _ in range(3):
        loud = meter.integrated_loudness(mix.T)
        mix = mix * db(lufs - loud)
        if studio:
            mix = limiter(mix.astype(np.float32), SR, reset=True).astype(np.float64)
            if true_peak_db(mix)[0] > ceiling:           # safety net: the sample-accurate true-peak limiter
                mix = true_peak_limit(mix, ceiling)
        else:
            mix = true_peak_limit(mix, ceiling)
    loud = meter.integrated_loudness(mix.T)
    mix[:, -int(0.012 * SR):] *= np.linspace(1, 0, int(0.012 * SR))
    sf.write(os.path.join(work, "mix.wav"), mix.T, SR, subtype="PCM_24")
    tp, tpt, _ = true_peak_db(mix)
    print(f"mix.wav: {mix.shape[1] / SR:.3f}s  integrated {loud:.2f} LUFS  true-peak {tp:.2f} dBTP (at {tpt:.2f} s)"
          f"  [{'studio chain (pedalboard)' if studio else 'classic chain'}]")
    return loud, tp
