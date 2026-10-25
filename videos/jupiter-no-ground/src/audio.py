"""If You Fell Into JUPITER, You'd Never Hit the Ground 🪐 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.
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
WORDS = TL["words"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice

SFX_LEVEL = -12.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(shutter=-7, swish=-27, glint=-29, dive=-24, rush=-25, poof=-5, poof3=-12, shaft=-30, thunder=-18, crackle=-31, gauge=-24,
         splat=-9, bloop=-15, sizzle=-31, inhale=-16, plip=-21, cricket=-23, chute=-27, pip=-31, tick=-31, creak=-24, crunch=-13,
         sad=-19, deepwhoosh=-24, tinkle=-30, tink=-15, stamp=-24, box=-27, ding=-21, whip=-18, click=-12)
# T_SW: the cut from space into the cloud tops (scenes.js hookTimes().sw)
T_SW = C["hit"] + 0.1


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def low_thud(seed=0, f=80.0, dur=0.28):
    """a soft hit heard low: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.08)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def low_whoosh(dur=0.6, seed=0, rise=True):
    """a big move, all of it under ~380 Hz (it can run under a word; mono)"""
    n = int(dur * SR)
    t = ar(n) / dur
    env = np.sin(np.pi * t) ** 1.2
    y = filt(brown(n, seed), "lowpass", 380) * env
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def poof(seed=0, big=1.0, dur=0.34):
    """a cloud bursting round something that went through it: a breathy puff with a soft low thump (for a pause)"""
    n = int(dur * SR)
    t = ar(n)
    env = np.minimum(1, t / 0.012) * np.exp(-t / (0.09 + 0.05 * big))
    air = svf_bp(pink(n, seed), np.full(n, 520 + 260 * big) * (1 + 0.6 * np.exp(-t / 0.05)), 0.5) * env
    body = np.sin(2 * np.pi * np.cumsum(95 + 120 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.07)
    y = air / (np.abs(air).max() + 1e-9) + 0.55 * big * body
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.06)


def sad_beep(seed=0):
    """a little machine's last 'boo-oop', falling (for a pause)"""
    a = glide(1800, 1500, 0.08) * attack_decay(int(0.08 * SR), 0.003, 0.05)
    b = glide(1500, 380, 0.26, 0.7) * attack_decay(int(0.26 * SR), 0.004, 0.14)
    y = np.concatenate([a, np.zeros(int(0.03 * SR)), b])
    return fade(y / (np.abs(y).max() + 1e-9), 0.002, 0.05)


def shutter_click():
    """the phone's camera click, soft-clipped so a short click has some body (for a pause)"""
    y = shutter()
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(3.0 * y) / np.tanh(3.0)


def fall_wind(n, seed=0):
    """the rush of a fall: a roar under ~420 Hz and a flutter of air above 5.2 kHz (no speech band; mono)"""
    lo = filt(brown(n, seed), "lowpass", 420)
    hi = filt(white(n, seed + 1), "highpass", 5200) * (0.7 + 0.3 * np.sin(2 * np.pi * 7.0 * ar(n)))
    return lo / (np.abs(lo).max() + 1e-9) + 0.35 * hi / (np.abs(hi).max() + 1e-9)


def fall_speed():
    """how fast he falls (0..1), sampled per frame from the picture's keys (scenes.js fallY), as a gain curve"""
    keys = [(T_SW, 10.5), (C["ground_end"], 1.7), (C["no"] - 0.07, 0.38), (C["poof1"], -4.3), (C["poof1"] + 0.38, -6.5),
            (C["poof2"] - 0.4, -14.6), (C["poof2"], -19.3), (C["poof2"] + 0.38, -21.7), (C["poof3"] - 0.4, -29.6), (C["poof3"], -34.3),
            (C["poof3"] + 0.4, -36.9)]
    ts = np.array([k[0] for k in keys])
    ys = np.array([k[1] for k in keys])
    v = np.abs(np.gradient(ys, ts))
    g = np.interp(tt, ts, np.clip(v / 22.0, 0.15, 1.0))
    g = np.where(tt < T_SW, 0.0, g)
    after = tt > ts[-1]                                          # slowing in the thick gas
    g = np.where(after, 0.35 * np.exp(-(tt - ts[-1]) * 0.7), g)
    return filt(g, "lowpass", 3.0)


def fit_n(x):
    """trim or pad a whole-length signal to exactly N samples"""
    return np.pad(x, (0, max(0, N - len(x))))[:N]


def flashes_thick():
    return [C["the"] + 0.1, C["thicker"] + 0.35, C["gets"] + 0.2]


def flashes_deep():
    return [C["oh_end"] + 0.05, C["scientists"] + 0.1, C["rain_end"] - 0.05, C["diamonds"] + 0.15, C["want"] + 0.05]


def low_thunder(dur, seed):
    """a far roll of thunder, all of it under ~240 Hz (it can sit under a word)"""
    return filt(thunder(dur, seed), "lowpass", 240)


# ================================================================= the beds
# space: almost nothing, a soft cosmic hum; in the clouds: the fall's wind, as loud as he is fast
space_on = gate(N, [(0, T_SW), (C["whip"] + 0.2, DUR)])
hum = sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(55.0, 0.5), (82.5, 0.25), (110.0, 0.12)]) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.3 * tt))
amb.x += pan_st(hum * 0.2, 0) * space_on
wind = fall_wind(N, 3) * fall_speed()
amb.x += pan_st(wind * 0.8, 0)
# the thickening: a slow low swell; the soup bubbles; the syrup's slow bloops; the ocean's heat roar
gas_on = gate(N, [(SHOT["thick"], SHOT["ladder"] + 0.4), (SHOT["probe"], SHOT["weird"])])
amb.x += pan_st(filt(brown(N, 7), "lowpass", 160) * 0.5, 0) * gas_on
soup_on = gate(N, [(C["like"] - 0.2, C["then1"] + 0.2)])
amb.x += pan_st(fit_n(filt(gurgle(DUR, 8, 9), "lowpass", 300)) * 0.5, 0.2) * soup_on
ocean_on = gate(N, [(C["then2"], SHOT["probe"]), (SHOT["weird"], C["whip"] + 0.2)])
roar = filt(brown(N, 9), "lowpass", 140) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * tt))
amb.x += pan_st(roar * 0.9, 0) * ocean_on

# ================================================================= the hook: the selfie, the whole planet, the dive
bed.add(pan_st(top_swish(0.6, 1), 0), C["jupiter"] + 0.02, db(G["swish"]))                       # the whip out (top)
sfx.add(pan_st(shutter_click(), -0.3), C["jupiter_end"] + 0.05, db(G["shutter"]))                         # Jupiter, ... click (the selfie)
for i in range(3):                                                                                  # YOU pops (top)
    bed.add(pan_st(glint(6200 + 500 * i, 0.07, 2 + i), 0.4), C["jupiter_end"] - 0.06 + 0.04 * i, db(G["glint"]))
bed.add(pan_st(low_whoosh(T_SW - C["youd"] + 0.2, 4), 0), C["youd"], db(G["dive"]))               # the dive (low)
bed.add(pan_st(top_swish(0.45, 5), 0), T_SW - 0.3, db(G["swish"] + 3))                             # into the cloud (top)

# ================================================================= the answer: POOF, POOF, ...pf
sfx.add(pan_st(poof(10, 1.0), 0), C["poof1"], db(G["poof"]))                                       # floor. ... POOF
sfx.add(pan_st(poof(11, 1.0), 0.1), C["poof2"], db(G["poof"] - 1))                                 # sky... POOF
sfx.add(pan_st(poof(12, 0.35, 0.2), 0), C["poof3"], db(G["poof3"]))                                # sky. ... pf (he did not even try)
for k, p in enumerate([C["poof1"], C["poof2"], C["poof3"]]):                                        # the light through his hole (top)
    for i in range(3):
        bed.add(pan_st(glint(5600 + 700 * i, 0.12, 20 + 3 * k + i), 0.3 * (-1) ** i), p + 0.25 + 0.06 * i, db(G["shaft"]))

# ================================================================= thicker: thunder in the deck above, the gauge, the slowdown
for k, f in enumerate(flashes_thick()):
    bed.add(pan_st(low_thunder(1.6, 30 + k), 0.3 * (-1) ** k), f + 0.08, db(G["thunder"] - 2 * k))
    bed.add(pan_st(filt(crack(0.12, 40 + k), "highpass", 5200), 0.3), f, db(G["crackle"]))
bed.add(pan_st(low_thud(45, 120.0, 0.2), -0.5), C["thicker"] - 0.05, db(G["gauge"]))                # the gauge pops in (low)

# ================================================================= soup, syrup, a hot dark ocean... still no splash
sfx.add(pan_st(squelch(0.28, 50), 0.15), C["soup_end"] + 0.04, db(G["splat"]))                      # soup... splat (the noodle)
sfx.add(pan_st(bloop(140, 52, 0.26), -0.1), C["syrup_end"] + 0.03, db(G["bloop"]))                   # syrup... bloop
bed.add(pan_st(filt(gas_hiss(1.4, 53), "highpass", 5200), 0), C["hot"] - 0.05, db(G["sizzle"]))     # hot... (a sizzle, top)
sfx.add(pan_st(breath(0.3, 54), 0), C["ocean_end"] + 0.05, db(G["inhale"]))                        # ocean. ... a big breath in (brace)
sfx.add(pan_st(drip(55, 1900), 0.2), C["splash_end"] + 0.08, db(G["plip"]))                          # splash. ... plip
sfx.add(pan_st(cricket(56, 2, 4600), 0.5), C["splash_end"] + 0.3, db(G["cricket"]))                  # ... a cricket. (silence is a sound)

# ================================================================= the probe: in on its parachute, 58 minutes, CRUNCH
bed.add(pan_st(rustle(0.9, 60), -0.4), C["nasa"] - 0.05, db(G["chute"]))                            # the parachute fluttering in
for i, tp in enumerate(np.arange(C["probe"], C["crunch"] - 0.1, 0.5)):                              # its lamp pips (top)
    bed.add(pan_st(glint(6800, 0.05, 61 + i), -0.4), tp, db(G["pip"]))
bed.add(pan_st(ratchet(C["minutes_end"] - C["lasted"], 6.0, 16.0, 62, edges=True), -0.3), C["lasted"], db(G["tick"]))   # the clock (top)
bed.add(pan_st(filt(creak(1.2, 63, 40, 110), "lowpass", 300), -0.3), C["minutes"] - 0.2, db(G["creak"]))  # the squeeze (low)
sfx.add(pan_st(crumple(0.34, 64), -0.3), C["crunch"], db(G["crunch"]))                             # crushed. ... CRUNCH
bed.add(pan_st(low_thud(65, 70.0, 0.3), -0.3), C["crunch"], db(G["crunch"] - 6))
sfx.add(pan_st(sad_beep(66), -0.3), C["crunch"] + 0.15, db(G["sad"]))                                # boo-oop

# ================================================================= deeper: thunder far above; the diamonds
bed.add(pan_st(low_whoosh(0.7, 70), 0), SHOT["weird"] - 0.05, db(G["deepwhoosh"]))                 # down, fast (low)
for k, f in enumerate(flashes_deep()):
    bed.add(pan_st(low_thunder(1.4, 71 + k), 0.4 * (-1) ** k), f + 0.1, db(G["thunder"] - 7 - k))
for i, tp in enumerate(np.arange(C["rain"] - 0.3, C["tink"] - 0.05, 0.11)):                         # the first glints, then the shower (top)
    bed.add(pan_st(glint(5600 + 400 * (i % 5), 0.08, 80 + i), 0.6 * np.sin(i * 1.7)), tp, db(G["tinkle"] + (3 if tp > C["diamonds"] else 0)))
bed.add(pan_st(low_thud(90, 90.0, 0.2), 0.3), C["diamonds"] + 0.47, db(G["stamp"]))                 # MAYBE (the stamp, low)
for i in range(4):                                                                                  # the soot sparkling into diamonds (top)
    bed.add(pan_st(glint(6600 + 350 * i, 0.06, 98 + i), -0.5 + 0.3 * i), C["scientists"] + 0.1 + 0.8 + 0.14 * i, db(G["tinkle"] - 1))
sfx.add(pan_st(glass_tink(91, 3100.0, 0.2), 0.1), C["tink"], db(G["tink"]))                         # DIAMONDS. ... TINK (his helmet)
for i, m in enumerate([76, 79, 83, 88]):                                                            # ...and a sparkle (a music box run)
    t0 = C["tink"] + 0.12 + 0.07 * i
    if t0 + 0.1 < C["still2"]:
        sfx.add(pan_st(fade(music_box(mtof(m), max(0.08, min(0.3, C["still2"] - 0.06 - t0)), 92 + i), 0.002, 0.04), 0.2), t0, db(G["box"]))

# ================================================================= the button: yes (ding), the whip up, CLICK, the loop
sfx.add(pan_st(ding(91, 0.1, 95, bright=1.4), 0.2), C["nod"] + 0.02, db(G["ding"]))                # jump? ... ding (he nods)
sfx.add(pan_st(whoosh(0.5, 300, 2400, 96), 0), C["whip"] - 0.02, db(G["whip"]))                   # the whip up
bed.add(pan_st(low_whoosh(0.5, 97), 0), C["whip"], db(G["whip"] - 4))
sfx.add(pan_st(shutter_click(), -0.3), C["loop"] + 0.12, db(G["click"]))                                  # CLICK: the selfie (then the loop)

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.3, C["jupiter_end"] - 0.02, BPM, ["D", "G"], gain=-9, seed=10, kick_on=True, snaps=True)            # the jump: a bright bounce
drone(mus, C["jupiter_end"] + 0.15, C["youd"] + 0.3, [50, 57, 62, 66, 69], cutoff=600, gain=-26)                  # the whole planet: wonder
mus.add(pan_st(riser(T_SW - C["youd"], 11, 220, 2400), 0), C["youd"], db(-26))                                     # the dive
groove(mus, T_SW + 0.05, C["floor_end"] - 0.05, BPM, ["D", "A", "Bm", "G"], gain=-10, seed=20, kick_on=True, snaps=False)   # the cloud tops
groove(mus, C["just"] + 0.15, C["sky1_end"] - 0.05, BPM, ["G", "A"], gain=-11, seed=21, kick_on=True, snaps=False)
groove(mus, C["and"] + 0.15, C["sky2_end"] - 0.05, BPM * 0.5, ["Em"], gain=-12, seed=22, kick_on=False, snaps=False, half=True)   # meh
drone(mus, C["the"] + 0.12, C["gets_end"] + 0.1, [38, 45, 50, 53], cutoff=420, gain=-20)                             # thicker: down, dark
groove(mus, C["like"] + 0.15, C["soup_end"] - 0.05, 96, ["Dm", "A"], gain=-11, seed=30, kick_on=False, snaps=True, cutoff=900)   # soup (a stew)
groove(mus, C["then1"] + 0.12, C["syrup_end"] - 0.05, 48, ["Dm"], gain=-12, seed=31, kick_on=False, snaps=False, half=True, cutoff=600)   # syrup: slow motion
drone(mus, C["then2"] + 0.1, C["ocean_end"] - 0.05, [26, 33, 38, 41], cutoff=300, gain=-18)                          # the ocean: heat
groove(mus, C["nasa"] + 0.15, C["in_end"] - 0.02, 100, ["C", "Am"], gain=-12, seed=40, kick_on=False, snaps=True)   # the probe
drone(mus, C["it"] + 0.1, C["crushed"] - 0.05, [36, 43, 48, 51], cutoff=520, gain=-20)                              # the squeeze
mus.add(pan_st(filt(riser(C["crushed"] - C["minutes"], 41, 200, 2000), "highpass", 4800), 0), C["minutes"], db(-27))
drone(mus, C["oh_end"] + 0.15, C["diamonds"] - 0.05, [40, 47, 52, 55, 59], cutoff=480, gain=-25)                   # deeper: mystery
groove(mus, C["still2"] + 0.12, C["jump_end"] - 0.05, BPM, ["D", "G"], gain=-11, seed=60, kick_on=True, snaps=True)  # the button: the bounce
silence(mus, [(C["jupiter_end"] - 0.02, C["jupiter_end"] + 0.15),     # Jupiter, ... click
              (C["floor_end"] - 0.05, C["just"] + 0.15),             # floor. POOF
              (C["sky1_end"] - 0.05, C["and"] + 0.15),               # sky... POOF
              (C["sky2_end"] - 0.05, C["the"] + 0.12),               # sky. pf
              (C["soup_end"] - 0.05, C["then1"] + 0.12),             # soup... splat
              (C["syrup_end"] - 0.05, C["then2"] + 0.1),             # syrup... bloop
              (C["ocean_end"] - 0.05, C["nasa"] + 0.15),             # ocean. ... Still no splash. (silence; plip; a cricket)
              (C["in_end"] - 0.02, C["it"] + 0.1),
              (C["crushed"] - 0.05, C["oh_end"] + 0.15),             # crushed. CRUNCH, boo-oop
              (C["diamonds"] - 0.05, C["still2"] + 0.12),            # DIAMONDS. TINK, sparkle
              (C["jump_end"] - 0.05, DUR)])                          # jump? ding, whip, click

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
