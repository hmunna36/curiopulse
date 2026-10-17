"""Why Do You Feel TWO Noses? (Cross Your Fingers) 🤞 Short: sound design, score and mix, cue-locked to timeline.json.

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

SFX_LEVEL = -13.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(rub=-27, pop=-22, dun=-22, swish=-27, badge=-25, swap=-21, window=-24, snore=-21, dive=-21, wake=-22, hum=-31,
         tink=-22, ding=-25, cross=-22, boop=-23, boing=-21, bubble=-23, rip=-27, tick=-31, bulb=-23, sparkle=-25,
         wah=-22, luck=-24, lift=-25)


def thud_low(seed=0, f=70.0):
    """a soft landing heard through the body: all of it under ~250 Hz (it can sit on a word; mono, 0.3 s)"""
    n = int(0.3 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0):
    for i in range(n):
        bus.add(pan_st(glint(5600 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


# ================================================================= the rub: fingertips on skin, on the picture's clock
# The picture moves his hand by amp * sin(w t) with w = loopW(2 pi 2.6) (scenes.js); the sound is the speed of that
# (|cos|), a soft skin hiss above 5.2 kHz, so it can run under the words. Envelope per stretch of the Short.
W_RUB = 2 * np.pi * max(1, round(C.get("rub_hz", 2.6) * DUR)) / DUR
env = np.zeros(N)
for a, b, g in [(0.0, C["your_f"], 1.0), (C["your_f"], C["brain1_end"], 0.45), (C["touch"], C["so"], 0.55),
                (C["on_end"], END["months"], 0.65), (SHOT["button"], C["keep"], 0.9), (END["button"], DUR, 0.8)]:
    i0, i1 = int(a * SR), int(min(DUR, b) * SR)
    ramp_n = int(0.08 * SR)
    seg = np.full(i1 - i0, g)
    seg[:ramp_n] *= np.linspace(0, 1, min(ramp_n, len(seg)))[: len(seg[:ramp_n])]
    seg[-ramp_n:] *= np.linspace(1, 0, min(ramp_n, len(seg)))[: len(seg[-ramp_n:])]
    env[i0:i1] = np.maximum(env[i0:i1], seg)
rub_tex = filt(white(N, 5), "highpass", 5600) * 0.6 + filt(white(N, 6), "bandpass", [5300, 9000]) * 0.4
rub = rub_tex * np.abs(np.cos(W_RUB * tt)) ** 1.4 * env
bed.add(pan_st(rub / (np.abs(rub).max() + 1e-9), 0.1), 0.0, db(G["rub"]))

# ================================================================= ambience (one bed per world, gated to its shots)
bath_on = gate(N, [(0, SHOT["room"] + 0.62), (SHOT["macro"], DUR)])
amb.x += pan_st(filt(brown(N, 1), "lowpass", 230), 0) * 0.32 * bath_on                       # the bathroom: room tone
room_on = gate(N, [(SHOT["room"] + 0.5, SHOT["macro"] + 0.05)])
amb.x += pan_st(filt(brown(N, 8), "lowpass", 170), 0) * 0.48 * room_on                       # the brain's room: a low hum

# ================================================================= the claim and the test
bed.add(pan_st(thud_low(11, 64.0), 0), 0.0, db(G["dun"] + 2))                                 # frame 0: his hand is already at it
bed.add(pan_st(thud_low(12, 52.0), -0.3), C["two1"] - 0.01, db(G["dun"]))                     # TWO: a low dun under the word
sparkle(C["two1"] + 0.06, bed, G["sparkle"], seed=13, n=3, pan=-0.4)                          # the felt nose pops on (all above 5 kHz)
sfx.add(pan_st(cork_pop(14, 520.0), -0.4), C["noses1_end"] + 0.03, db(G["pop"]))              # ...pop (in the pause after "noses.")
bed.add(pan_st(top_swish(0.16, 15), 0.2), C["cross1"] - 0.02, db(G["swish"]))                 # the arrow: the middle goes over
bed.add(pan_st(top_swish(0.12, 16), 0.3), C["cross1"] + 0.16, db(G["swish"] - 2))

# ================================================================= the answer: they swapped seats; nobody told your brain
for i, d in enumerate((0.0, 0.08)):                                                            # the two badges pop in
    bed.add(pan_st(glint(6000 + 900 * i, 0.08, 20 + i), -0.4 + 0.8 * i), C["your_f"] + d, db(G["badge"]))
bed.add(pan_st(ratchet(C["seats_end"] - C["swapped"], 14.0, 26.0, 22, edges=True), 0), C["swapped"] - 0.03, db(G["swish"]))   # they slide past each other
sfx.add(pan_st(slide(620, 880, 0.14, top=None), 0.2), C["seats_end"] + 0.03, db(G["swap"]))   # ...and land (in the pause)
bed.add(pan_st(glint(6400, 0.12, 24), 0), C["nobody"] + 0.02, db(G["window"]))                # the window opens on his forehead
bed.add(pan_st(glint(7300, 0.1, 25), 0), C["nobody"] + 0.12, db(G["window"] - 2))
bed.add(pan_st(snore(0.62, 26, 56.0), 0), C["told"] - 0.05, db(G["snore"]))                   # the brain, asleep (under 420 Hz)
sfx.add(pan_st(whoosh(0.3, 300, 2600, 27, 0.85), 0), C["brain1_end"] + 0.02, db(G["dive"]))   # into his head (in the gap)

# ================================================================= the brain's room
sfx.add(pan_st(bloop(260, 90, 0.22), 0), C["thinks"] - 0.3, db(G["wake"]))                    # the brain wakes (low, before "thinks")
bed.add(pan_st(buzz_hi(C["edges1"] + 0.4 - C["outside"], 30.0, 30), -0.2), C["outside"] - 0.05, db(G["hum"]))   # the edges light up
sfx.add(pan_st(glass_tink(31, 2600.0, 0.12), -0.4), C["once_end"] + 0.02, db(G["tink"]))      # two marbles, at once (in the pause)
sfx.add(pan_st(glass_tink(32, 3100.0, 0.12), 0.4), C["once_end"] + 0.04, db(G["tink"] - 1))
sfx.add(pan_st(ding(79, 0.15, 33), 0), C["things_end"] + 0.03, db(G["ding"]))                 # 2 THINGS (after "things.")
sfx.add(pan_st(ding(84, 0.14, 34), 0), C["things_end"] + 0.13, db(G["ding"] - 2))

# ================================================================= back on his hand: one nose, two noses
sfx.add(pan_st(whoosh(0.24, 400, 2400, 40, 0.8), 0), SHOT["macro"] - 0.24, db(-25))          # out of his head (ends before "Cross")
sfx.add(pan_st(squeak(0.09, 1700, 2500), 0.2), C["them_end"] + 0.02, db(G["cross"]))         # the fingers cross (in the pause after "them,")
bed.add(pan_st(thud_low(41, 74.0), 0), C["touch"] + 0.1, db(G["dun"] + 1))                   # they land on his nose (low: under "touch")
for i in range(2):                                                                              # ONE nose: a glint (top only, on the word)
    bed.add(pan_st(glint(6600 + 900 * i, 0.1, 45 + i), 0.3), C["one"] + 0.04 + 0.07 * i, db(G["boop"] - i))
sfx.add(pan_st(boing(0.26, 150.0, 42), -0.3), C["two3_end"] + 0.05, db(G["boing"]))           # two noses: boing...
sfx.add(pan_st(boing(0.26, 190.0, 43), 0.3), C["two3_end"] + 0.3, db(G["boing"] - 1))        # ...boing (both in the pause)
bed.add(pan_st(top_swish(0.18, 44), 0), C["so"] - 0.1, db(G["bubble"]))                      # the thought bubble puffs open

# ================================================================= six months
sfx.add(pan_st(whoosh(0.3, 300, 2200, 50, 0.8), 0), SHOT["months"] - 0.28, db(-25))
flips = [C["kept"], C["two4"] + 0.1, C["crossed1"], C["upto"], C["six"]]
for i, f in enumerate(flips):                                                                  # a page tears off each month (top only: on words)
    bed.add(pan_st(filt(page_rip(0.16, 51 + i), "highpass", 5200), -0.5), f, db(G["rip"]))
ticking(C["volunteers"], C["until"] - 0.1, bed, db(G["tick"]), r0=3, r1=9, seed=55)          # time passing
sfx.add(pan_st(riser(0.9, 56, 300, 2400), 0), C["until"] - 0.1, db(-30))                     # ...until
bed.add(pan_st(glint(6800, 0.12, 57), 0), C["until"] + 0.02, db(G["window"]))                 # the window opens again
sfx.add(pan_st(ding(88, 0.2, 58, bright=1.6), 0), C["on_end"] + 0.04, db(G["bulb"]))         # the light comes on: ding! (after "on.")
sparkle(C["on_end"] + 0.12, bed, G["sparkle"] + 1, seed=59, n=4, pan=0.2)
sfx.add(pan_st(ding(91, 0.14, 60), 0.3), C["on_end"] + 0.42, db(G["ding"] - 1))              # the tick: one nose

# ================================================================= the button and the loop
sfx.add(pan_st(whoosh(0.22, 400, 2400, 70, 0.8), 0), SHOT["button"] - 0.22, db(-26))
sparkle(C["two5"] + 0.04, bed, G["sparkle"], seed=71, n=3, pan=-0.4)                          # the felt nose again
sfx.add(pan_st(slide(330, 230, 0.3, vib=4.0), -0.2), C["two5_end"] + 0.05, db(G["wah"]))     # deadpan: wah (in the pause after "two?")
bed.add(pan_st(top_swish(0.2, 72), 0.4), C["keep"] - 0.08, db(G["luck"]))                    # the crossed fingers go up
sparkle(C["crossed2_end"] + 0.05, bed, G["luck"], seed=73, n=5, step=0.06, pan=0.4)          # for luck
sfx.add(pan_st(whoosh(0.4, 300, 2200, 74, 0.7), 0.2), DUR - 0.45, db(G["lift"]))              # the hand comes back down to frame 0

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.0, C["noses1_end"] - 0.02, BPM, ["F", "Bb"], gain=-10, seed=10, kick_on=False, snaps=False)
groove(mus, C["cross1"] + 0.15, C["gap_end"] + 0.12, BPM, ["F", "Bb", "C", "F"], gain=-7, seed=11, snaps=True)
groove(mus, C["swapped"] + 0.05, C["nobody"] - 0.05, BPM, ["Bb", "C"], gain=-8, seed=12, kick_on=False, snaps=True)   # back after the answer's first words
drone(mus, C["nobody"], C["brain1_end"] + 0.1, [41, 48, 53], cutoff=380, gain=-18)
groove(mus, SHOT["room"] + 0.62, C["things_end"], BPM, ["Dm", "Bb", "F", "C"], gain=-6, seed=20, arp=True)
groove(mus, C["cross2"] + 0.25, C["counts"] - 0.05, BPM, ["F", "C", "Dm", "Bb"], gain=-7, seed=30, kick_on=False, snaps=True)
groove(mus, SHOT["months"] + 0.15, C["until"] - 0.1, 124, ["F", "Bb", "Gm", "C"], gain=-6, seed=40, snaps=True)
drone(mus, C["until"], C["on_end"] + 0.05, [41, 48, 53, 57], cutoff=520, gain=-20)
groove(mus, SHOT["button"] + 0.25, C["keep"] - 0.12, BPM, ["Bb", "C"], gain=-11, seed=50, kick_on=False, snaps=False)
silence(mus, [(C["noses1_end"] - 0.02, C["cross1"] + 0.15),      # two noses... pop
              (C["things_end"], SHOT["macro"] + 0.25),            # 2 THINGS: ding
              (C["counts"] - 0.05, SHOT["months"] + 0.15),        # counts TWO: boing boing
              (C["on_end"] + 0.05, SHOT["button"] + 0.25),        # ding! one nose
              (C["keep"] - 0.12, DUR)])                           # "Keep your fingers crossed.": luck, and into the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
