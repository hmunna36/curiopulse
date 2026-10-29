"""Can You Say MIT's HARDEST Tongue Twister? 👅 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The world: TWISTER NIGHT (a club: room tone, a murmur under 400 Hz, a bouncy 132 BPM groove that loops), his mouth in
section (the pops are the drums: a P is a round low "puh", a K a dry click; whole in the gaps, only their edges under
words), a speech lab (a booth hum, the score gone for the silence, one cricket).
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
c = C
words = TL["words"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
PAUSE = pause_mask(words, N)                       # 1 where nobody speaks


def edges(y, lo=250.0, hi=5200.0):
    """only what a phone plays round a word: the thump under lo and the click over hi"""
    return filt(y, "lowpass", lo, 2) + filt(y, "highpass", hi, 2)


def p_pop(seed=0):
    """a P: the lips burst open, a round low 'puh' with a breath on it (mono, 0.14 s)"""
    y = cork_pop(seed, 360.0)
    n = int(0.12 * SR)
    puff = filt(white(n, seed + 3), "bandpass", [300, 2400]) * attack_decay(n, 0.003, 0.03)
    th = thump(0.12, 220, 70, 0.035, seed)
    out = np.zeros(int(0.16 * SR))
    for s in (y * 0.8, puff * 0.5, th * 0.9):
        out[: len(s)] += s[: len(out)]
    return fade(out / (np.abs(out).max() + 1e-9), 0.0005, 0.02)


def k_pop(seed=0):
    """a K: the back of the tongue lets go, a dry, higher click with a short hiss (mono, 0.12 s)"""
    y = cork_pop(seed + 5, 1150.0) * 0.7
    n = int(0.09 * SR)
    hs = filt(white(n, seed + 9), "bandpass", [2400, 7000]) * attack_decay(n, 0.002, 0.018)
    out = np.zeros(int(0.12 * SR))
    for s in (y, hs * 0.8):
        out[: len(s)] += s[: len(out)]
    return fade(out / (np.abs(out).max() + 1e-9), 0.0005, 0.015)


def both_pop(seed=0, kk=0.8):
    """a P and a K at the same instant (mono)"""
    a, b = p_pop(seed), k_pop(seed + 1) * kk
    out = np.zeros(max(len(a), len(b)))
    out[: len(a)] += a
    out[: len(b)] += b
    return out / (np.abs(out).max() + 1e-9)


def twang(dur=0.3, seed=0):
    """a rubber band plucked: the tongue snapping into a knot (mono)"""
    y = boing(dur, 240.0, seed)
    n = len(y)
    zz = filt(white(n, seed + 2), "bandpass", [1800, 5200]) * attack_decay(n, 0.002, 0.03) * 0.35
    return fade((y + zz) / (np.abs(y + zz).max() + 1e-9), 0.001, 0.05)


def slurp(dur=0.17, seed=0):
    """a noodle sucked back in: wet noise whose band sweeps up (mono)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    y = svf_bp(white(n, seed), 500 + 2600 * u ** 1.5, 0.5) * np.sin(np.pi * u) ** 0.7
    y += 0.4 * np.sin(2 * np.pi * np.cumsum(260 + 700 * u) / SR) * np.sin(np.pi * u)
    return fade(y / (np.abs(y).max() + 1e-9), 0.005, 0.03)


def crowd_ooh(dur=0.42, seed=0):
    """a small crowd going 'ooooh' as something falls apart: five voices gliding down (mono)"""
    out = np.zeros(int(dur * SR))
    for i, f in enumerate((185, 214, 247, 276, 312)):
        v = yawn_voice(dur, f * 1.06, f * 0.82, seed + i, 0.45, ((420, 300), (900, 700)))
        out[: len(v)] += v[: len(out)] * (0.8 + 0.2 * (i % 2))
    return fade(filt(out / (np.abs(out).max() + 1e-9), "lowpass", 2200), 0.03, 0.08)


def crowd_cheer(dur=0.4, seed=0):
    """a short cheer: a swell of breathy noise and two 'woo' glides (mono)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    y = filt(pink(n, seed), "bandpass", [700, 3800]) * np.sin(np.pi * u ** 0.6) ** 1.2
    for f0, f1, k in ((520, 760, 0.5), (640, 900, 0.4)):
        y += k * slide(f0, f1, dur, 0.0, None, 5)[:n] * np.sin(np.pi * u)
    return fade(y / (np.abs(y).max() + 1e-9), 0.02, 0.06)


# ================================================================= ambience (one bed per world, gated to its shots)
stage_on = gate(N, [(0, SHOT["section"]), (SHOT["payoff"], SHOT["lab"]), (SHOT["button"], DUR)], 0.05)
sec_on = gate(N, [(SHOT["section"], SHOT["payoff"])], 0.05)
lab_on = gate(N, [(SHOT["lab"], SHOT["button"])], 0.05)
# the club: room tone and the crowd's murmur, all under 400 Hz (no words in it)
room = filt(brown(N, 1), "lowpass", 260) * 0.5
murmur = sum(filt(gibber(DUR, 40 + i, 150 + 25 * i, thin=False, t0=0.3 * i, rate=13 + 2 * i), "lowpass", 380) for i in range(4)) * 0.18
amb.x += pan_st(room + murmur, 0) * stage_on
# inside the head: a soft low hum
amb.x += pan_st(filt(brown(N, 5), "lowpass", 180) * 0.45 + 0.05 * np.sin(2 * np.pi * 55 * tt), 0) * sec_on
# the booth: an air conditioner's hum
amb.x += pan_st(filt(pink(N, 7), "lowpass", 340) * 0.35 + 0.05 * np.sin(2 * np.pi * 120 * tt), 0) * lab_on

# ================================================================= the hook
sfx.add(pan_st(edges(whoosh(0.28, 300, 2400, 20, 0.9), 300, 4500), 0), 0.0, db(-15))
sfx.add(pan_st(edges(thump(0.2, 180, 60, 0.06, 3), 160, 7000), 0), 0.0, db(-16))  # the mic up on frame 1
# his rattle: a soft lip tick on every P he says (his own clock, 4.5 words a second), only the edges under her words
for k in range(0, 40):
    tp = (k * 2) / 4.5 - 0.006                                                      # P words: every other word
    if tp < 0 or tp > c["knot"] - 0.05:
        continue
    bed.add(edges(p_pop(k)), tp, db(-24), pan=0.2)
# the knot: a twang in the gap after "fast."
sfx.add(twang(0.3, 4), c["fast_end"] + 0.01, db(-14), pan=0.1)
# the knot slurps back in, before "Your"
sfx.add(slurp(0.17, 6), c["untie"] - 0.2, db(-18))
# P and K squeezing out at once: a rubbery squeak, its edges
bed.add(edges(squeak(0.16, 1500, 2600)), c["jam"], db(-22))
bed.add(edges(squeak(0.12, 1700, 2900)), c["two"] + 0.05, db(-24))
# PK!: edges on "once", the window's bloop and the dive after it
sfx.add(edges(both_pop(11)), c["pk_out"], db(-14))
sfx.add(pan_st(blip(500, 1300, 0.09, 3), 0), c["once_end"] + 0.02, db(-22))
sfx.add(pan_st(whoosh(0.3, 250, 2600, 31, 0.9), 0), c["once_end"] + 0.02, db(-17))

# ================================================================= the side view: the pops are the drums
for i, f in enumerate(c["pops_p"]):
    sfx.add(p_pop(20 + i), f, db(-14), pan=0.25)
for i, f in enumerate(c["pops_k"]):
    sfx.add(k_pop(30 + i), f, db(-13), pan=-0.2)
# speed up: the pops run under the words as their edges (a P a low knock, a K a high tick); the tip's d a tiny tick
for i, f in enumerate(c["fast_p"]):
    bed.add(edges(p_pop(40 + i)), f, db(-14), pan=0.25)
for i, f in enumerate(c["fast_k"]):
    bed.add(edges(k_pop(60 + i)), f, db(-16), pan=-0.2)
for i, f in enumerate(c["fast_d"]):
    bed.add(edges(k_pop(80 + i), 150, 7000), f, db(-30))
for i, f in enumerate(c["fast_both"]):
    bed.add(edges(both_pop(90 + i, 1.0)), f, db(-13))
# a riser into BOTH, then the big PK! whole in the gap after "BOTH."
sfx.add(pan_st(edges(riser(c["both"] - c["speed"], 7, 200, 1800), 300, 4000), 0), c["speed"], db(-26))
sfx.add(both_pop(110, 1.0), c["pk_big"], db(-9))
crash(mus, c["pk_big"], gain=-20, seed=4)

# ================================================================= the payoff: five tries
for i, f in enumerate(c["tries"]):
    bed.add(edges(blip(900 + 120 * i, 1600 + 150 * i, 0.06, i)), f, db(-24))
sfx.add(pan_st(ding(84, 0.12, 2, 1.2), 0), c["easy_end"] + 0.03, db(-22))           # the tick on the first, in the pause
# the fifth falls apart: a little slide down in the gap after "apart.", the letters clatter, the crowd goes "ooh"
sfx.add(pan_st(slide_whistle(0.3, 1600, 420), 0), c["apart_end"] + 0.02, db(-26))
for j in range(6):
    sfx.add(pan_st(pen_tick(j), 0.3 * (-1) ** j), c["falls"] + 0.12 + 0.11 * j, db(-30) if j < 4 else db(-26))
sfx.add(pan_st(crowd_ooh(0.36, 3), 0), c["apart_end"] + 0.02, db(-30))
sfx.add(pan_st(whoosh(0.26, 300, 2200, 41, 0.8), 0), SHOT["lab"] - 0.2, db(-20))

# ================================================================= the lab: talking... then nothing
sfx.add(pan_st(edges(beep(1900, 0.06)), 0), SHOT["lab"] + 0.15, db(-30))
for k in range(2):
    sfx.add(pan_st(cricket(5 + k, 3, 4600), 0.3), c["talking_end"] + 0.06 + 0.2 * k, db(-25))

# ================================================================= the button
sfx.add(pan_st(edges(whoosh(0.24, 400, 2600, 51, 0.8), 300, 4500), 0), SHOT["button"] - 0.16, db(-18))
sfx.add(pan_st(crowd_cheer(0.34, 2), 0), c["talking2"] + 0.52, db(-24))
bed.add(pan_st(edges(drumroll(c["faster"] - c["then"] + 0.1, 3)), 0), c["then"], db(-22))

# ================================================================= subscribe cue: no sound
# The pill of the pill test (25 Oct-8 Nov 2026, the 23:30 slots; timeline_lib.py sets its cues) is SILENT: no pop, no
# click, no bell, and nobody says "subscribe" (user, 24 Oct 2026: "silent subscribe button"). Both arms sound the same.

# ================================================================= score (drops out for every punchline)
BPM = 132
BAR = 4 * 60.0 / BPM
# the club groove from frame 1 (a crash on frame 1), out at the knot
crash(mus, 0.0, gain=-27, seed=1)
groove(mus, 0.0, c["fast_end"] + 0.02, BPM, ["F", "Bb", "C", "F"], gain=-3, seed=10)
# a sneaky walk under "Your mouth tried to say TWO sounds at once"
for i in range(10):
    tb = c["your_mouth"] + i * 0.3
    if tb > c["once_end"]:
        break
    mus.add(pizz(mtof([41, 44, 48, 44, 41, 39, 41, 46, 48, 53][i]), 0.4, 70 + i) * 1.2, tb, db(-17))
# inside: a low pad while it goes slow, then the build with the pops
drone(mus, SHOT["section"], c["speed"], [41, 48, 53, 57], cutoff=600, gain=-26, seed=3)
drone(mus, c["speed"], c["both"], [41, 48, 53, 58, 60], cutoff=900, gain=-25, seed=4, swell=1.5)
# the payoff: the club groove again, cut on "falls"
groove(mus, SHOT["payoff"], c["falls"], BPM, ["F", "Bb", "C", "F"], gain=-7, seed=12, arp=False)
# the lab: a calm lab pad, then nothing from "just"
drone(mus, SHOT["lab"], c["flat"], [45, 52, 57, 60], cutoff=700, gain=-27, seed=6)
# the button: the groove comes back and lands on a bar line exactly at the end, so the loop rolls into frame 1's bar
g0 = DUR - BAR
groove(mus, g0, DUR, BPM, ["C"], gain=-5, seed=14)
silence(mus, [(c["fast_end"] + 0.02, c["your_mouth"] - 0.05), (c["flat"], g0 - 0.02)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
