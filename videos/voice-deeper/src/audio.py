"""Why Does Your Voice Sound DEEPER With Fingers in Your Ears? 👂 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

This Short is about what plugged ears do to sound, so the sound plays it:
- while his fingers are in, the score and the room are heard as he hears them: muffled (low-passed), with the bass
  kept; the one stretch where his fingers come out ("Normally... leaks out your ears") the room opens up;
- the narrator's own "Hellooo?" goes through `deep_voice` (mixlib's voice_fx hook): more 120-450 Hz body, less top, a
  close little room: an illustration of the occluded voice, not a measurement (the pitch is not changed);
- a bass line comes in on "singing bass." (the skull sings it); the trapped hum is a throb that grows into the BOOM
  on the drum; the muscles buzz 25 times a second; the subwoofer thumps after its word.
"""
import json
import os
import sys

import numpy as np  # noqa: F401

import sfxlib as L
from sfxkit import *  # noqa: F401,F403  (atoms, groove/drone/crash/bwomp/silence, span/gate, Bus, db, pan_st...)
from mixlib import master

WORK = sys.argv[1]
TL = json.load(open(os.path.join(WORK, "timeline.json")))
C = TL["cues"]
SHOT = {s["id"]: s["start"] for s in TL["shots"]}
END = {s["id"]: s["end"] for s in TL["shots"]}
DUR = TL["duration"]
N = int(round(DUR * SR))
L.set_length(N)
tt = ar(N)

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C


def env_at(points):
    """a piecewise-linear envelope over the whole Short from [(t, v), ...]"""
    ts, vs = zip(*points)
    return np.interp(tt, ts, vs)


# how plugged his ears are (1 = fingers in, 0.5 = earbuds): the room and the score are heard through it
PLUG = env_at([(0, 1), (c["plugout"] - 0.05, 1), (c["plugout"] + 0.2, 0), (c["plugin"] - 0.05, 0), (c["plugin"] + 0.08, 1),
               (SHOT["buds"] - 0.05, 1), (SHOT["buds"] + 0.1, 0.55), (c["press"] - 0.4, 0.55), (c["press"] - 0.2, 1), (DUR, 1)])


def muffle(bus, cut=650.0, keep=0.18):
    """what plugged ears let through: the lows stay, the top goes (crossfaded by PLUG over time)"""
    x = bus.x
    m = np.stack([filt(x[i], "lowpass", cut, 2) for i in range(2)])
    bus.x = x * (keep + (1 - keep) * (1 - PLUG)) + m * PLUG


# ================================================================= ambience: his room at night (a hush, a far fridge hum)
room = filt(brown(N, 1), "lowpass", 380) * 0.35 + 0.05 * np.sin(2 * np.pi * 60 * tt) + 0.03 * np.sin(2 * np.pi * 120 * tt)
amb.x += pan_st(room, 0)
amb.x += pan_st(filt(white(N, 2), "bandpass", [1800, 6000]) * 0.03, 0.2)      # the open room's air: only heard unplugged
canal_on = gate(N, [(SHOT["canal"], END["canal"])], 0.08)
amb.x += pan_st(filt(brown(N, 3), "lowpass", 160) * 0.9 * (0.75 + 0.25 * np.sin(2 * np.pi * 1.1 * tt)), 0) * canal_on   # inside the head
amb.x[:, :] = amb.x * (1 - 0.5 * canal_on)[None, :] + 0.5 * canal_on[None, :] * pan_st(filt(brown(N, 3), "lowpass", 160), 0)
muffle(amb, 420, 0.25)

# ================================================================= the hook: fingers in on frame 1
plup = lambda: fade(thump(0.16, 240, 95, 0.045) + 0.25 * filt(white(int(0.16 * SR), 4), "lowpass", 900) * expdecay(int(0.16 * SR), 0.01), 0.0005, 0.03)
for d, p in ((0.0, -0.5), (0.03, 0.5)):
    sfx.add(filt(plup(), "lowpass", 300), 0.0 + d, db(-14), pan=p)   # under "Stick": only its low thud
sfx.add(pan_st(filt(whoosh(0.16, 300, 1800, 20, 0.9), "highpass", 4800), 0), 0.0, db(-24))
# Hellooo?: a sub-bass bloom under the deep voice, then a bum-bum after "right?"
n = int(1.25 * SR)
bloom = (np.sin(2 * np.pi * np.cumsum(np.linspace(58, 50, n)) / SR) + 0.45 * np.sin(2 * np.pi * np.cumsum(np.linspace(116, 100, n)) / SR)) * attack_decay(n, 0.12, 0.6)
sfx.add(pan_st(fade(bloom, 0.02, 0.2), 0), c["hello"] - 0.02, db(-11))
for i, (m, d) in enumerate(((40, 0.0), (35, 0.16))):
    sfx.add(pan_st(fade(note(mtof(m), 0.2, 0.004, 0.12, 700, voices=2, seed=60 + i) * 0.9, 0.002, 0.05), 0), c["right_end"] + 0.05 + d, db(-12))

# ================================================================= the glass head
def shing(t, gain):
    sfx.add(pan_st(whoosh(0.32, 2200, 6400, 31, 0.5), 0), t, db(gain))
    for j, f in enumerate((5400, 6700, 7900)):
        sfx.add(pan_st(fade(tone(f, 0.18, 0.002, 0.14) * expdecay(int(0.18 * SR), 0.05), 0.0005, 0.05), 0.3 * (-1) ** j), t + 0.04 * j, db(gain - 6))


shing(c["skull"] - 0.12, -17)
# bones: a knock on the skull, then it hums (a low 'mmm' in the gap after "hum.")
def tok(t, gain=-15.0, f=380.0):
    n2 = int(0.14 * SR)
    y = np.sin(2 * np.pi * f * ar(n2)) * expdecay(n2, 0.028) + 0.4 * np.sin(2 * np.pi * f * 2.7 * ar(n2)) * expdecay(n2, 0.012)
    sfx.add(pan_st(fade(y + 0.2 * filt(white(n2, 9), "highpass", 2500) * expdecay(n2, 0.003), 0.0005, 0.02), 0), t, db(gain))


tok(c["bones"] - 0.02, -17)
tok(c["bones"] + 0.12, -20, 330.0)
hm = hum_voice(0.62, 110.0, 5, 1.0, c["hum1_end"], 3.1)
sfx.add(pan_st(filt(hm, "lowpass", 900), 0), c["hum1_end"] - 0.12, db(-15))

# ================================================================= fingers out: the hum leaks away; fingers in: a low plup
pop_out = lambda seed: fade(cork_pop(seed, 760.0) * 0.8, 0.0005, 0.02)
sfx.add(pop_out(1), c["plugout"] - 0.16, db(-17), pan=-0.5)
sfx.add(pop_out(2), c["plugout"] - 0.12, db(-17), pan=0.5)
for i, p in enumerate((-0.8, 0.8)):
    sfx.add(pan_st(filt(whoosh(0.9, 300, 900, 40 + i, 0.6), "lowpass", 1400), p), c["low"] - 0.2 + 0.1 * i, db(-24))
    sfx.add(pan_st(filt(whoosh(0.5, 300, 900, 44 + i, 0.7), "lowpass", 1400), p), c["ears2_end"] + 0.02 + 0.06 * i, db(-19))
for d, p in ((0.0, -0.5), (0.025, 0.5)):
    sfx.add(plup(), c["plugin"] + d, db(-13), pan=p)
# the window and the dive into the canal
sfx.add(pan_st(whoosh(0.26, 500, 2600, 52, 0.85), 0), c["in2_end"] + 0.02, db(-21))
n = int(0.5 * SR)
sfx.add(pan_st(fade(glide(160, 55, 0.5) * attack_decay(n, 0.01, 0.2), 0.001, 0.08), 0), c["dive"] - 0.04, db(-14))

# ================================================================= the canal: trapped, throbbing, then BOOM on the drum
n = int((c["boom"] - SHOT["canal"]) * SR)
u = np.linspace(0, 1, n)
th = np.sin(2 * np.pi * 62 * ar(n)) + 0.5 * np.sin(2 * np.pi * 124 * ar(n)) + 0.25 * np.sin(2 * np.pi * 186 * ar(n))
th *= (0.15 + 0.85 * u ** 1.6) * (0.55 + 0.45 * np.sin(2 * np.pi * 3.1 * (SHOT["canal"] + ar(n))))
bed.add(pan_st(fade(filt(th, "lowpass", 200), 0.08, 0.02), 0), SHOT["canal"], db(-17))
sfx.add(pan_st(fade(thump(0.9, 90, 32, 0.32) + 0.6 * thump(0.9, 180, 70, 0.12), 0.0005, 0.1), 0), c["boom"], db(-9))
sfx.add(pan_st(filt(white(int(0.7 * SR), 77), "lowpass", 2400) * expdecay(int(0.7 * SR), 0.14), 0), c["boom"], db(-24))
crash(mus, c["boom"] + 0.01, gain=-24, seed=3)
# the drum: dum-dum in the gap after "eardrum."
for i, d in enumerate((0.0, 0.17)):
    sfx.add(pan_st(fade(thump(0.3, 150, 75, 0.09) * (1 - 0.3 * i), 0.0005, 0.04), 0), c["eardrum_end"] + 0.04 + d, db(-12))

# ================================================================= earbuds: a call connecting, his voice booming back
for j, f in enumerate((880, 1320)):
    sfx.add(pan_st(fade(tone(f, 0.09, 0.003, 0.05) * expdecay(int(0.09 * SR), 0.04), 0.001, 0.03), 0), SHOT["buds"] - 0.01 + 0.09 * j, db(-26))
n = int(0.5 * SR)
sfx.add(pan_st(fade((np.sin(2 * np.pi * 70 * ar(n)) + 0.4 * np.sin(2 * np.pi * 140 * ar(n))) * attack_decay(n, 0.05, 0.2), 0.01, 0.1), 0), c["boomy"] - 0.05, db(-14))
sfx.add(pan_st(fade(snap(12) * 0.6, 0.0005, 0.02), 0.6), c["earbuds_end"] + 0.02, db(-22))

# ================================================================= the rumble: fingers in, press harder ... his muscles buzz 25 a second
for d, p in ((0.0, -0.5), (0.025, 0.5)):
    sfx.add(plup(), c["press"] - 0.26 + d, db(-14), pan=p)
n = int((c["muscles"] - c["faint"] + 0.6) * SR)
rum = filt(brown(n, 21), "lowpass", 140) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 12.5 * ar(n))))
rum += 0.5 * np.sin(2 * np.pi * 50 * ar(n)) * (0.5 + 0.5 * np.sin(2 * np.pi * 25 * ar(n)))
bed.add(pan_st(fade(rum / (np.abs(rum).max() + 1e-9), 0.3, 0.4), 0), c["faint"] - 0.1, db(-13))
sfx.add(pan_st(fade(thunder(1.0, 23, ((0, 0.8), (0.3, 0.5))) * 1.0, 0.05, 0.2), 0), c["rumble_end"] + 0.02, db(-21))
shing(c["own"] - 0.12, -19)
n = int((c["second_end"] - c["muscles_end"] + 0.12) * SR)
bz = np.sin(2 * np.pi * 100 * ar(n)) + 0.6 * np.sin(2 * np.pi * 200 * ar(n)) + 0.3 * np.sin(2 * np.pi * 50 * ar(n))
bz *= 0.5 + 0.5 * np.sin(2 * np.pi * 25 * ar(n))           # 25 pulses a second
bz = filt(np.tanh(1.6 * bz), "lowpass", 260)
hi = filt(white(n, 31), "highpass", 5400) * (0.5 + 0.5 * np.sin(2 * np.pi * 25 * ar(n))) * 0.5
bed.add(pan_st(fade(bz / (np.abs(bz).max() + 1e-9) + hi, 0.05, 0.08), 0), c["muscles_end"] - 0.02, db(-14))
sfx.add(pan_st(fade(buzz(int(0.32 * SR), 25 * 4, 33, 0.4) * attack_decay(int(0.32 * SR), 0.02, 0.2), 0.005, 0.05), 0), c["muscles_end"] + 0.02, db(-22))

# ================================================================= the button: a walking subwoofer (after the word: thumps)
sfx.add(pan_st(fade(boing(0.32, 120.0, 4) * 0.7, 0.001, 0.05), 0), c["subwoofer"] + 0.06, db(-26))
for i, t0 in enumerate(c["thump"]):
    sfx.add(pan_st(fade(kick(1.0) + 0.7 * thump(0.35, 75, 38, 0.16), 0.0005, 0.05), 0), t0, db(-10 - 1.5 * i))

# ================================================================= score (heard through his ears: muffled while they are plugged)
# 1. the hook: a sneaky bass walk; it stops for Hellooo
groove(mus, 0.36, c["hello"] - 0.03, 104, ["Am", "F", "G", "Am"], gain=-3, seed=10, snaps=False, arp=True, padv=False, cutoff=900)
# 2. "singing bass.": the skull's bass line comes in after the word, and the groove rides the mechanism
BPM = 104
beat = 60.0 / BPM
t0 = c["bass_end"] + 0.03
groove(mus, t0, c["boom"] - 0.02, BPM, ["Dm", "Dm", "Bb", "C"], gain=-2, seed=20, snaps=True, arp=False, padv=True, cutoff=1100)
riff = [(0, 38), (0.75, 38), (1.5, 50), (2, 41), (2.5, 43), (3, 45), (3.5, 38)]
bar = 0
while t0 + bar * 4 * beat < c["boom"] - 0.1:
    for bt, m in riff:
        tb = t0 + (bar * 4 + bt) * beat
        if tb >= c["boom"] - 0.1:
            break
        y = note(mtof(m + (5 if bar % 4 == 2 else 7 if bar % 4 == 3 else 0)), 0.24, 0.004, 0.16, 900, voices=2, seed=70 + bar)
        mus.add(pan_st(fade(y, 0.002, 0.04), 0), tb, db(-9))
    bar += 1
# 3. earbuds: a light call groove (it comes in after the first word)
groove(mus, c["same"] + 0.22, c["earbuds_end"] + 0.25, 112, ["F", "C", "G", "F"], gain=-6, seed=30, kick_on=True, snaps=True, arp=True, padv=False, cutoff=1000)
# 4. the rumble: no groove, a low held note under it
drone(mus, c["press"] - 0.1, c["second_end"] + 0.2, [38, 45], cutoff=300, gain=-23, seed=40)
# 5. the button: silence for the line, the thumps play it out; the hook's walk takes over on the loop
muffle(mus, 700, 0.2)
silence(mus, [(c["hello"] - 0.02, c["hello_end"] + 0.05), (c["skull_end"] - 0.05, c["bass_end"] + 0.02), (c["boom"] - 0.01, c["eardrum_end"] + 0.4),
              (c["youre"] - 0.12, DUR)])


# ================================================================= the narrator, inside a plugged head
def deep_voice(vo):
    """her "Hellooo?" heard with fingers in the ears: more low-mid body (120-450 Hz), less top (above 1.6 kHz), a close
    little room. Crossfaded in and out over 50 ms; its peak stays at the level of the rest of the voice."""
    a, b, x = int((c["hello"] - 0.04) * SR), int((c["hello_end"] + 0.06) * SR), int(0.05 * SR)
    a0, b0 = max(0, a - SR // 2), min(len(vo), b + SR // 2)
    seg = vo[a0:b0]
    y = seg + 2.4 * filt(seg, "bandpass", [120, 450], 2)
    y = 0.3 * y + 0.7 * filt(y, "lowpass", 1600, 2)
    y = y + 0.28 * np.roll(filt(y, "bandpass", [160, 800]), int(0.012 * SR))
    pk = np.abs(y[a - a0:b - a0]).max()
    if pk > np.abs(vo).max() * 0.97:
        y *= np.abs(vo).max() * 0.97 / (pk + 1e-9)
    w = np.zeros(len(seg))
    w[a - a0:b - a0] = 1.0
    w[a - a0 - x:a - a0] = np.linspace(0, 1, x)
    w[b - a0:b - a0 + x] = np.linspace(1, 0, x)
    out = vo.copy()
    out[a0:b0] = (1 - w) * seg + w * y
    return out


# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -19.0, "music": -13.0}, voice_fx=deep_voice)
