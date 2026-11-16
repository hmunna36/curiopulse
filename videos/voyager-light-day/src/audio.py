"""Your Text to VOYAGER 1 Would Take a Whole DAY Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
"""
import json
import os
import sys

import numpy as np

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

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(whoosh=-21, send=-18, glint=-28, pop=-21, eta=-17, lift=-27, cricket=-27, dots=-31, launch=-14, rumble=-17,
         moon=-15, tick=-30, ding=-19, wave=-22, snore=-26, bonk=-11, stamp=-15, typing=-31, buzz=-19, ping=-18,
         zoom=-24, star=-25, keys=-27, tap=-24)


def low_whoosh(dur, seed, cut=340):
    """a move of the camera, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def top_only(x, f=5200.0):
    """keep what is above f: a sound that can sit under a word"""
    return filt(x, "highpass", f)


def send_fwip(seed=0):
    """a message going out: a quick rising 'fwip' with a soft low body (0.09 s: it ends before the first word)"""
    n = int(0.09 * SR)
    u = np.linspace(0, 1, n)
    f = 520 * (1500 / 520) ** u
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * u) ** 0.8
    y += 0.5 * filt(white(n, 90 + seed), "bandpass", [2500, 7000]) * np.sin(np.pi * u)
    return fade(y / (np.abs(y).max() + 1e-9), 0.002, 0.015)


def rocket(dur, seed=0):
    """a rocket's roar, all under the voice band (it can run under a line)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    y = filt(brown(n, seed), "lowpass", 260) * (0.4 + 0.6 * np.minimum(1, u * 6)) * (1 - u) ** 0.7
    y += 0.4 * filt(white(n, seed + 1), "lowpass", 180) * (1 - u)
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.1)


def snore(dur, seed=0):
    """one sleepy snore in and a puff out, all under 320 Hz (it can sit under a word)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    rasp = np.sin(2 * np.pi * 38 * ar(n)) * 0.5 + 0.5
    y = filt(pink(n, seed), "bandpass", [70, 320]) * (np.sin(np.pi * np.clip(u / 0.65, 0, 1)) ** 1.5) * (0.55 + 0.45 * rasp)
    return fade(y / (np.abs(y).max() + 1e-9), 0.03, 0.08)


def vibrate(dur=0.32, seed=0):
    """a phone buzzing on the rail: a 150 Hz rattle in two pulses (under the voice band)"""
    n = int(dur * SR)
    t = ar(n)
    gate_ = ((t % 0.16) < 0.11).astype(float)
    y = (np.sign(np.sin(2 * np.pi * 150 * t)) * 0.5 + np.sin(2 * np.pi * 150 * t)) * gate_
    return fade(filt(y, "lowpass", 300), 0.004, 0.02)


def notif(seed=0):
    """the phone's message tone: two quick round notes going up (in a pause)"""
    out = np.zeros(int(0.22 * SR))
    for k, (f, d) in enumerate(((1318.5, 0.07), (1975.5, 0.12))):
        n = int(d * SR)
        y = np.sin(2 * np.pi * f * ar(n)) + 0.25 * np.sin(2 * np.pi * 2 * f * ar(n))
        y = fade(y * attack_decay(n, 0.003, d * 0.5), 0.002, 0.02)
        i = int(k * 0.085 * SR)
        out[i:i + n] += y[: len(out) - i]
    return out / (np.abs(out).max() + 1e-9)


# ================================================================= ambience: the porch at night, deep space
porch = [(0, c["light"] + 0.2), (SHOT["beep"], SHOT["weird"]), (SHOT["button"], DUR)]
porch_on = gate(N, porch, smooth=0.05)
amb.x += pan_st(filt(brown(N, 1), "lowpass", 200), -0.2) * 0.5 * porch_on                         # a soft night breeze, low
space_on = gate(N, [(c["light"] + 0.2, SHOT["beep"]), (SHOT["weird"], SHOT["button"])], smooth=0.05)
amb.x += pan_st(filt(brown(N, 3), "lowpass", 110), 0.0) * 0.7 * space_on                        # the hum of space
amb.x += pan_st(filt(white(N, 4), "highpass", 7200) * 0.022 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.21 * tt)), 0.3) * space_on

# ================================================================= hook: SEND (frame 1), the ETA, the bubble lifts off
sfx.add(pan_st(send_fwip(5), 0.25), 0.0, db(G["send"]))                                           # fwip! on frame 1
bed.add(pan_st(glint(6600, 0.06, 6), 0.3), 0.05, db(G["glint"]))                                  # the bubble pops in (top)
sfx.add(pan_st(filt(kick(0.9), "lowpass", 220), 0.0), c["day"] + 0.02, db(G["eta"]))               # ETA lands (low: on the word)
bed.add(pan_st(glint(5600, 0.08, 7), 0.2), c["day"] + 0.03, db(G["glint"] + 2))
bed.add(pan_st(top_only(riser(0.6, 8, 400, 2400), 5200.0), 0.3), c["arrive"] - 0.1, db(G["lift"]))  # it lifts off (top)
# the loop's own press: his thumb lands on SEND 0.08 s before the end (frame 1's fwip follows on the restart)
bed.add(pan_st(top_only(key_click(9), 4800.0), 0.25), DUR - 0.09, db(G["tap"]))

# ================================================================= answer: SENDING...; the left-on-read crickets; LIGHT: launch
sfx.add(pan_st(whoosh(0.3, 300, 2600, 20, 0.9), -0.4), SHOT["answer"] - 0.3, db(G["whoosh"]))       # the whip (in the pause)
for i in range(3):
    bed.add(pan_st(glint(5400 + 400 * i, 0.05, 21 + i), 0.3), SHOT["answer"] + 0.25 + 0.18 * i, db(G["dots"]))   # . . . (top)
crickets(c["you2"] + 0.25, c["even"] - 0.08, sfx, db(G["cricket"]), seed=22, f=4700, rate=3.0)   # the awkward silence
sfx.add(pan_st(low_whoosh(0.4, 23), 0.0), c["even"] - 0.1, db(G["whoosh"] + 2))                    # it dips to his hands (low)
sfx.add(pan_st(whoosh(0.5, 200, 3600, 24, 0.85), 0.2), c["light"] - 0.12, db(G["launch"]))          # LAUNCH
sfx.add(pan_st(rocket(1.3, 25), 0.0), c["light"], db(G["rumble"]))                                 # the roar (low)
bed.add(pan_st(top_only(riser(c["zips"] - c["light"] - 0.05, 26, 600, 3000), 5200.0), 0.2), c["light"] + 0.05, db(-26))

# ================================================================= race: whip to space; the Moon in a second; Pluto; the clock
sfx.add(pan_st(whoosh(0.32, 260, 2800, 30, 0.9), 0.4), SHOT["race"] - 0.24, db(G["whoosh"]))
bed.add(pan_st(top_only(L.whoosh(END["race"] - SHOT["race"], 3000, 9000, 31, 0.5), 5600.0), 0.0), SHOT["race"], db(-30))   # light speed (top)
sfx.add(pan_st(filt(whoosh(0.75, 120, 700, 32, 0.8), "lowpass", 330), 0.6), c["moon"] - 0.38, db(G["moon"]))   # the Moon goes by (low)
sfx.add(pan_st(ding(91, 0.12, 33), 0.3), c["second_end"] + 0.04, db(G["ding"]))                   # ding: one second (pause)
bed.add(pan_st(ratchet(c["hours"] - c["second_end"] - 0.15, 22.0, 70.0, 34, edges=True, f=6200.0), 0.3), c["second_end"] + 0.18, db(G["tick"]))   # the clock races (top)
sfx.add(pan_st(filt(whoosh(0.9, 140, 600, 35, 0.8), "lowpass", 320), 0.5), c["pluto"] - 0.4, db(G["moon"] - 3))   # Pluto drifts by (low)
sfx.add(pan_st(fade(slide(mtof(76), mtof(81), 0.14, vib=0.0, top=2600), 0.004, 0.03), 0.4), c["hours_end"] + 0.05, db(G["wave"]))   # "hi!" (pause)

# ================================================================= tomorrow: he dozes; the clock spins to a day; BONK
bed.add(pan_st(snore(0.5, 40), -0.1), c["voyager2_end"] + 0.02, db(G["snore"]))                    # a snore in the pause
bed.add(pan_st(ratchet(c["bonk"] - SHOT["tomorrow"] - 0.1, 30.0, 90.0, 41, edges=True, f=6600.0), 0.3), SHOT["tomorrow"] + 0.05, db(G["tick"]))
_th = c["bonk"] + 0.02                                                                              # the hitstop (CAMERA["hit"])
sfx.add(pan_st(bonk(), 0.2), c["bonk"], db(G["bonk"]))                                            # BONK (the word's tail is out)
sfx.add(pan_st(filt(snap(42), "highpass", 1800), 0.0), _th, db(-20))
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-17))
sfx.add(cymbal(43, 0.45), _th + 0.01, db(-31))
sfx.add(pan_st(filt(kick(1.0), "lowpass", 240), 0.0), c["bonk"] + 0.2, db(G["stamp"]))            # the stamp: ka-CHUNK (low)
bed.add(pan_st(glint(6200, 0.08, 44), 0.0), c["bonk"] + 0.22, db(G["glint"] + 3))                  # DELIVERED (top)

# ================================================================= reply: whip; the typing dots; another whole day
sfx.add(pan_st(whoosh(0.3, 280, 2500, 50, 0.9), -0.4), SHOT["reply"] - 0.24, db(G["whoosh"]))
pops([SHOT["reply"] + 0.05], sfx, db(-24), seed=51)                                                # the reply pops out
tk = SHOT["reply"] + 0.3
while tk < END["reply"] - 0.2:
    for i in range(3):
        bed.add(pan_st(glint(5600 + 300 * i, 0.04, int(tk * 10) + i), -0.2), tk + 0.12 * i, db(G["dots"]))   # . . . typing (top)
    tk += 0.75
bed.add(pan_st(ratchet(c["day2_end"] - c["another"], 18.0, 40.0, 52, edges=True, f=6000.0), 0.3), c["another"], db(G["tick"] - 2))

# ================================================================= beep: the phone buzzes, the message tone, "Beep.", a cricket
sfx.add(pan_st(vibrate(0.32, 60), -0.3), SHOT["beep"] + 0.01, db(G["buzz"]))                       # bzz-bzz on the rail (low)
sfx.add(pan_st(notif(61), -0.3), c["ping"] - 0.1, db(G["ping"]))                                  # the message tone (before the word)
crickets(c["beep_end"] + 0.12, SHOT["weird"] - 0.1, sfx, db(G["cricket"] + 1), seed=62, f=4800, rate=4.0)

# ================================================================= weird: whip; the years tick by; the zoom out to the star
sfx.add(pan_st(whoosh(0.3, 300, 2600, 70, 0.9), 0.5), SHOT["weird"] - 0.24, db(G["whoosh"]))
bed.add(pan_st(ratchet(c["far_end"] - c["forty"], 10.0, 24.0, 71, edges=True, f=5800.0), -0.2), c["forty"], db(G["tick"] - 1))   # the years (top)
bed.add(pan_st(top_only(riser(c["farther_end"] - c["zoom"], 72, 300, 2600), 5200.0), 0.0), c["zoom"], db(G["zoom"]))           # the zoom out (top)
sfx.add(pan_st(filt(whoosh(c["farther_end"] - c["zoom"], 90, 420, 73, 0.6), "lowpass", 330), 0.0), c["zoom"], db(G["zoom"] + 1))   # (low)
for i in range(5):
    bed.add(pan_st(glint(6000 + 350 * i, 0.12, 74 + i), -0.4 + 0.2 * i), c["fifteen"] + 0.05 + 0.07 * i, db(G["star"]))      # the star (top)
sfx.add(pan_st(ding(95, 0.16, 79), 0.0), c["farther_end"] + 0.06, db(G["ding"] + 1))               # ding (in the gap)

# ================================================================= button: typing fast; the thumb to SEND
tk, k = c["better"] - 0.05, 0
while tk < c["now"] - 0.05:
    bed.add(pan_st(top_only(key_click(80 + k), 4800.0), 0.2 * (-1) ** k), tk, db(G["keys"]))         # tap-tap-tap (top)
    tk += 0.085 + 0.03 * ((k * 7) % 3) / 2
    k += 1

# ================================================================= score (drops out for every punchline)
PORCH = ["F", "Dm", "Bb", "C"]
SPACE = ["Dm", "Bb", "F", "C"]
groove(mus, 0.12, c["day"] - 0.04, 112, PORCH, gain=-2, seed=10, cutoff=1500)                       # the porch: light, playful
groove(mus, c["ignoring"] + 0.02, c["you2"] + 0.2, 112, PORCH, gain=-4, seed=11, cutoff=1300, kick_on=False)
groove(mus, c["zips"] + 0.08, c["and"] - 0.12, 128, SPACE, gain=-3, seed=12, cutoff=1400, sixteen=True)   # the race
for i, m in enumerate((79, 76, 72)):                                                                # a lullaby in the pause: he dozes
    tm = c["voyager2_end"] + 0.04 + 0.16 * i
    if tm < c["tomorrow"] - 0.12:
        sfx.add(pan_st(fade(music_box(mtof(m), 0.5, 90 + i)[: int(0.3 * SR)], 0.002, 0.08), 0.2), tm, db(-24))
groove(mus, c["another"] + 0.05, SHOT["beep"] - 0.02, 56, SPACE, gain=-5, seed=13, cutoff=900, half=True)      # the long way back
drone(mus, SHOT["weird"] + 0.1, c["zoom"], [50, 57, 62, 66], cutoff=900, gain=-23, seed=14)          # 1977 -> now: wonder
drone(mus, c["zoom"], END["weird"] - 0.05, [45, 52, 57, 64, 69], cutoff=1100, gain=-25, seed=15, swell=0.6)    # the zoom: it opens up
groove(mus, SHOT["button"] + 0.05, DUR, 112, PORCH, gain=-2, seed=10, cutoff=1500)                   # back on the porch (the loop)
silence(mus, [(c["day"] - 0.04, c["arrive"] + 0.05),        # a whole DAY
              (c["you2"] + 0.2, c["zips"] + 0.08),          # the crickets, LIGHT, the launch
              (c["tomorrow"] - 0.1, c["another"] + 0.05),  # TOMORROW, BONK
              (SHOT["beep"] - 0.02, SHOT["weird"] + 0.1)])  # Beep.

# the loop: the porch groove eases down over the last 0.6 s, so the restart (music in again 0.12 s in) is one move
i0 = int((DUR - 0.6) * SR)
mus.x[:, i0:] *= np.linspace(1.0, 0.45, mus.x.shape[1] - i0)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13, "sfx": -12.0}, duck={"music": 0.72})
