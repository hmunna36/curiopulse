"""Why Can You Read While Shaking Your HEAD? 👀 Short: sound design, score and mix, cue-locked to timeline.json.

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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice

SFX_LEVEL = -12.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(swing=-27, head=-31, ding=-21, glass=-27, pop=-24, beep=-20, tick=-31, whoosh=-24, zip=-22, rush=-27,
         stop=-21, snore=-23, wah=-20, stamp=-20, clank=-19, clank_top=-27, heart=-17, flap=-31, nod=-28, yes=-21,
         proj=-30)


# ---------------------------------------------------------------- small sounds of this Short
def top_swish(dur=0.12, seed=0, lo=5200):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", lo) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def thud_low(seed=0, f=70.0, dur=0.3):
    """a soft knock heard through the body: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def air_swing(seed=0, dur=0.13, lo=4800):
    """the phone (or his head) cutting the air: a short top-band swish with a little low body (can sit under words)"""
    y = top_swish(dur, seed, lo)
    n = len(y)
    body = filt(brown(n, seed + 3), "lowpass", 200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    y = y + 0.35 * body / (np.abs(body).max() + 1e-9)
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0, f0=5600):
    for i in range(n):
        bus.add(pan_st(glint(f0 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


def metal_clank(seed=0):
    """iron bars squeezing a head: a low knock (under 250 Hz) plus a ring above 5 kHz (both can sit on a word)"""
    lo = thud_low(seed, 58.0, 0.34)
    n = int(0.5 * SR)
    t = ar(n)
    ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d in ((5400.0, 0.12), (6900.0, 0.08), (8300.0, 0.05)))
    ring = filt(ring, "highpass", 5000)
    lo = np.pad(lo, (0, max(0, n - len(lo))))[:n]
    return lo / (np.abs(lo).max() + 1e-9), fade(ring / (np.abs(ring).max() + 1e-9), 0.001, 0.05)


def soft_clip(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


# ================================================================= ambience (one bed per world, gated to its shots)
bedroom = [(0, SHOT["speed"] + 0.03), (SHOT["payoff"] - 0.03, SHOT["weird"] + 0.03), (SHOT["button"] - 0.03, DUR)]
inside = [(SHOT["speed"], END["speed"])]
ward = [(SHOT["weird"], END["weird"])]
hum = filt(brown(N, 1), "lowpass", 220) + 0.02 * np.sin(2 * np.pi * 60 * tt)
amb.x += pan_st(hum, 0) * 0.30 * gate(N, bedroom)                                   # his bedroom at midnight: room tone
crickets(0.6, SHOT["speed"] - 0.2, bed, db(-40), seed=3, f=4800, rate=0.8)          # a cricket outside, very far (top only)
throb = 0.6 + 0.4 * np.sin(2 * np.pi * 1.2 * tt) ** 2
amb.x += pan_st(filt(brown(N, 3), "lowpass", 170) * throb, 0) * 0.40 * gate(N, inside)   # inside his ear: a warm throb
amb.x += pan_st(filt(pink(N, 5), "lowpass", 360), 0) * 0.20 * gate(N, ward)        # 1948: a big quiet ward
bed.add(pan_st(fade(projector(int((END["weird"] - SHOT["weird"]) * SR), 7), 0.08, 0.1), 0), SHOT["weird"], db(G["proj"]))   # old film

# ================================================================= the hook: shake your phone, then your head
sfx.add(pan_st(whoosh(0.24, 300, 2400, 20, 0.9), 0), 0.0, db(G["whoosh"]))           # frame 1: the swing is already going
for i, ts in enumerate(C["swings1"]):                                                 # the phone swinging (top: runs under the words)
    bed.add(pan_st(air_swing(30 + i), 0.35 if i % 2 else -0.35), ts - 0.05, db(G["swing"]))
for i, ts in enumerate(C["heads"]):                                                   # his head swinging "no" (softer, top)
    bed.add(pan_st(air_swing(60 + i, 0.16, 5600), 0.25 if i % 2 else -0.25), ts - 0.07, db(G["head"]))
sfx.add(pan_st(ding(91, 0.12, 4), 0.2), C["head1_end"] + 0.05, db(G["ding"]))       # focus: a bright ding (pause after "HEAD.")
sparkle(C["sharp"] - 0.02, bed, G["glass"], seed=5, n=3, step=0.05, pan=0.3, f0=6200)   # SHARP! pops (top, on the word)

# ================================================================= ears: the window, the driver, the cords
bed.add(pan_st(thud_low(10, 120.0, 0.2), -0.4), C["ears"], db(G["pop"]))            # the window pops open (low, on "EARS")
sparkle(C["ears"] + 0.02, bed, G["glass"], seed=11, n=4, step=0.05, pan=-0.4, f0=5800)
bed.add(pan_st(fade(buzz_hi(0.4, 26.0, 12, lo=5600), 0.03, 0.08), -0.3), C["steering"], db(G["tick"]))   # the cords zip out (top)
for i in range(2):                                                                     # meep meep: the driver's horn (pause after "eyes.")
    sfx.add(pan_st(fade(beep(1240.0 + 160 * i, 0.075), 0.004, 0.02), -0.35), C["eyes1_end"] + 0.04 + 0.12 * i, db(G["beep"]))
ratchet_y = ratchet(END["again"] - C["steering"] - 0.3, 14.0, 20.0, 13, edges=True)  # the wheel's clicks as it turns (top)
bed.add(pan_st(fade(ratchet_y, 0.1, 0.1), -0.3), C["steering"] + 0.2, db(G["tick"] - 3))

# ================================================================= again: HEAD right, EYES left
bed.add(pan_st(fade(filt(whoosh(0.4, 120, 380, 20, 0.8), "lowpass", 380), 0.01, 0.08), 0.3), C["turn_right"] - 0.25, db(G["whoosh"]))   # the turn (low)
bed.add(pan_st(air_swing(70, 0.3, 5200), 0.4), C["turn_right"] - 0.2, db(G["head"] + 3))
sparkle(C["rolls"] + 0.05, bed, G["glass"] - 2, seed=21, n=4, step=0.07, pan=0.0, f0=6400)   # the spark runs down the cords (top)
sfx.add(pan_st(slide(820.0, 380.0, 0.16, vib=0.0, harm=4), -0.2), C["left_end"] + 0.02, db(G["zip"]))   # zip: the eyes roll (pause after "LEFT.")
sfx.add(pan_st(whoosh(0.3, 500, 3200, 22, 0.8), 0), SHOT["speed"] - 0.24, db(G["rush"]))   # the dive into the window

# ================================================================= speed: 0.01 s
bed.add(pan_st(fade(ratchet(END["speed"] - SHOT["speed"] - 0.1, 26.0, 40.0, 30, edges=True), 0.05, 0.1), 0), SHOT["speed"] + 0.05, db(G["tick"] + 2))   # the wheel, flat out (top)
bed.add(pan_st(fade(buzz_hi(END["speed"] - SHOT["speed"] - 0.2, 38.0, 31, lo=5400), 0.08, 0.1), 0.2), SHOT["speed"] + 0.1, db(G["tick"]))
bed.add(pan_st(key_click(32), 0.4), C["hundredth"], db(G["stamp"] - 4))             # the stopwatch's click (on "HUNDREDTH")
sfx.add(pan_st(ding(96, 0.14, 33), 0.3), C["second_end"] + 0.04, db(G["ding"]))     # ding! (pause after "second!")

# ================================================================= payoff: the phone again, the ear dozes, too slow
for i, ts in enumerate(C["swings2"]):
    bed.add(pan_st(air_swing(100 + i), 0.35 if i % 2 else -0.35), ts - 0.05, db(G["swing"] + (1 if ts > C["chase"] else 0)))
sn = snore(0.24, 110, 70.0)
sfx.add(pan_st(fade(sn / (np.abs(sn).max() + 1e-9), 0.01, 0.04), -0.4), C["nothing_end"] + 0.03, db(G["snore"]))   # the driver snores (pause after "nothing,")
st = scratch(0.18, 111)
sfx.add(pan_st(fade(st, 0.003, 0.03), 0), C["too"] - 0.2, db(G["stop"] - 4))        # the shaking stops dead (the pause before "Too")
sfx.add(pan_st(slide(392.0, 196.0, 0.32, vib=5.0, harm=5), 0), C["slow_end"] + 0.03, db(G["wah"]))   # waah (pause after "slow.")

# ================================================================= weird: 1948
bed.add(pan_st(thud_low(120, 64.0, 0.26), 0), C["doctor"] + 0.02, db(G["stamp"]))   # the 1948 stamp lands (low, on "doctor")
bed.add(pan_st(top_swish(0.08, 121), 0), C["doctor"] + 0.02, db(G["stamp"] - 6))
lo, ring = metal_clank(122)
bed.add(pan_st(lo, 0), C["jammed"] + 0.05, db(G["clank"]))                           # CLANK: the bars squeeze (on "jammed": low + top)
bed.add(pan_st(ring, 0), C["jammed"] + 0.05, db(G["clank_top"]))
for i, b in enumerate(C["beats"]):                                                    # his heartbeat; the page jumps on each
    bed.add(pan_st(soft_clip(heartbeat(130 + i)), 0), b - 0.02, db(G["heart"]))
    bed.add(pan_st(top_swish(0.1, 140 + i), 0), b + 0.01, db(G["flap"]))

# ================================================================= the button: still reading? nod yes
for i, tn in enumerate(C["nods"]):                                                    # each nod: a soft knock (low)
    bed.add(pan_st(thud_low(150 + i, 110.0, 0.14), 0), tn - 0.03, db(G["nod"]))
sfx.add(pan_st(marimba(mtof(84), 0.4, 151), 0.2), C["yes_end"] + 0.04, db(G["yes"]))   # a happy "yes" note (after "yes.")
sfx.add(pan_st(marimba(mtof(88), 0.4, 152), 0.25), C["yes_end"] + 0.14, db(G["yes"] - 2))
for i, ts in enumerate(C["swings_loop"]):                                             # the loop: the hook's swings start again
    bed.add(pan_st(air_swing(30 + i), 0.35 if i % 2 else -0.35), ts - 0.05, db(G["swing"]))

# ================================================================= subscribe cue: no sound
# The pill of the pill test (25 Oct-8 Nov 2026, the 23:30 slots; timeline_lib.py sets its cues) is SILENT: no pop, no
# click, no bell, and nobody says "subscribe" (user, 24 Oct 2026: "silent subscribe button"). Both arms sound the same.

# ================================================================= score (drops out for every punchline)
BPM = 114
groove(mus, 0.12, C["now"], 132, ["Am", "E"], gain=-12, seed=10, kick_on=False, snaps=True, sixteen=True)   # the shaky phone: jittery
groove(mus, C["sharp"] + 0.1, C["eyes1_end"], BPM, ["C", "G"], gain=-12, seed=20, kick_on=False, snaps=True)   # sharp again: the answer
groove(mus, C["keep"] + 0.1, C["left_end"], BPM, ["Dm", "Bb"], gain=-11, seed=30, kick_on=True, snaps=True)    # how: the steering
groove(mus, SHOT["speed"] + 0.08, C["second_end"], 152, ["Am", "E"], gain=-10, seed=40, kick_on=True, snaps=True, sixteen=True)   # flat out
groove(mus, C["phone2_end"] + 0.05, C["too"] - 0.2, 132, ["Am", "E"], gain=-12, seed=50, kick_on=False, snaps=True, sixteen=True)   # the chase
rag(mus, C["doctor"] + 0.15, END["weird"] - 0.05, bpm=118, gain=-8, seed=60)       # 1948: an old upright piano
groove(mus, C["still"] + 0.1, DUR, 124, ["C", "F"], gain=-13, seed=70, kick_on=False, snaps=True)   # the button, into the loop
silence(mus, [(C["now"] - 0.02, C["sharp"] + 0.1),          # "Now gently shake your HEAD.": the head swings and the ding alone
              (C["eyes1_end"], C["keep"] + 0.1),             # meep meep
              (C["left_end"], SHOT["speed"] + 0.08),         # zip, the dive
              (C["second_end"], C["phone2_end"] + 0.05),     # ding
              (C["too"] - 0.2, C["doctor"] + 0.15),          # the stop, "Too slow.", waah
              (C["yes_end"], C["yes_end"] + 0.35)])          # the "yes" notes

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
