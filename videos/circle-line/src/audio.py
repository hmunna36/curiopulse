"""Why Can't You Draw a Circle and a Line at the SAME Time? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Rule of the house (sound.md): a sound that lives in the speech band goes in a pause ("say it on the word, do it in the
pause"); under a word only what is under ~250 Hz or above ~5.2 kHz.
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

SFX_LEVEL = -13.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(swish=-31, glint=-25, shimmer=-37, wobble=-19, huh=-21, fly=-29, stamp=-20, beep=-22, cord=-33, lit=-21, dive=-19.5,
         chat=-14, pop=-26, plank=-21, roll=-31, boing=-19, ding=-21, snip=-24, droop=-20, tick=-20, buzzer=-23, spooky=-21,
         poof=-21, ghost=-28, oooo=-21, psst=-20)


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


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0, f0=5600):
    for i in range(n):
        bus.add(pan_st(glint(f0 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


P_DRAW = 1.0 / C.get("draw_hz", 1.05)   # one cycle of both hands


def hand_swishes(t0, t1, seed=0, gain=0.0):
    """a soft air swish on every stroke of each hand (top only: it runs under the words); the circle on the left, the
    line on the right"""
    k, tk = 0, t0
    while tk < t1:
        bed.add(pan_st(top_swish(0.14, seed + k), -0.35), tk, db(G["swish"] + gain))
        bed.add(pan_st(top_swish(0.1, seed + 50 + k), 0.35), tk + P_DRAW / 2, db(G["swish"] + gain - 2))
        tk += P_DRAW
        k += 1


def shimmer(t0, t1, seed=0, gain=0.0, pan=0.0):
    """the glowing trails: a faint fizz above 5.2 kHz"""
    if t1 <= t0:
        return
    bed.add(pan_st(fade(buzz_hi(t1 - t0, 44.0, seed, lo=6000), 0.08, 0.15), pan), t0, db(G["shimmer"] + gain))


def wobble(dur=0.36, seed=0, f0=520.0, f1=300.0):
    """a wobbly brassy dip: the line going round (speech band: for a pause)"""
    return slide(f0, f1, dur, vib=11.0)


def ooo(dur=0.45, f0=520.0, f1=440.0):
    """a ghostly 'oooo': a soft slide with a wide slow vibrato and air on it (speech band: for a pause)"""
    n = int(dur * SR)
    y = slide(f0, f1, dur, vib=5.5, harm=2)
    y = y[:n] if len(y) >= n else np.pad(y, (0, n - len(y)))
    y = y + 0.25 * filt(white(n, 3), "bandpass", (500, 1600)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return fade(y / (np.abs(y).max() + 1e-9), 0.08, 0.12)


# ================================================================= ambience (one bed per world, gated to its shots)
inside = [(SHOT["leak"] + 0.3, END["payoff"])]
office_on = gate(N, [(0, SHOT["leak"] + 0.35), (END["payoff"] - 0.05, DUR)])
hum = filt(brown(N, 1), "lowpass", 220) + 0.035 * np.sin(2 * np.pi * 100 * tt) + 0.02 * np.sin(2 * np.pi * 200 * tt)
amb.x += pan_st(hum, 0) * 0.30 * office_on                                      # the office at night: room tone + a light's hum
brain_on = gate(N, inside)
throb = 0.6 + 0.4 * np.sin(2 * np.pi * 0.9 * tt) ** 2
amb.x += pan_st(filt(brown(N, 3), "lowpass", 170) * throb, 0) * 0.42 * brain_on  # inside his head: a warm, slow throb

# ================================================================= the test: the circle and the line
sfx.add(pan_st(top_swish(0.2, 2), -0.3), 0.0, db(G["swish"] + 6))                 # frame 1: the hands are already going
hand_swishes(0.1, SHOT["leak"] + 0.5, seed=10)
shimmer(0.0, SHOT["leak"] + 0.4, seed=12)
# the line bends: a low thud under "right." as it starts... and the wobble in the pause before "Bent,"
bed.add(pan_st(thud_low(13, 82.0), 0.3), C["bend0"] + 0.05, db(G["stamp"] - 2))
sfx.add(pan_st(wobble(0.36, 14), 0.3), C["bent"] - 0.47, db(G["wobble"]))          # ends 0.1 s before "Bent"
sfx.add(pan_st(slide(330, 470, 0.2, vib=0.0), 0.2), C["right"] + 0.32, db(G["huh"]))   # ?! : a quick "huh?" (pause after "right?")
# the copy flies across (top only, under "Your hands are"), COPIED! lands on "copying" (low), the copier beeps after "homework."
bed.add(pan_st(fade(buzz_hi(0.62, 26.0, 15, lo=5600), 0.05, 0.1), 0.0), C["your1"] - 0.02, db(G["fly"]))
bed.add(pan_st(thud_low(16, 60.0), 0.2), C["copy"] + 0.04, db(G["stamp"]))
bed.add(pan_st(top_swish(0.12, 17), 0.2), C["copy"] + 0.04, db(G["swish"] + 8))
sfx.add(pan_st(beep(2600.0, 0.07), 0.25), C["homework_end"] + 0.04, db(G["beep"]))  # beep...
sfx.add(pan_st(beep(2600.0, 0.07), 0.25), C["homework_end"] + 0.17, db(G["beep"]))  # ...beep (ends 0.15 s before "Each")

# ================================================================= each hand, its own half
bed.add(pan_st(glint(6400, 0.1, 40), -0.4), C["hand1"] + 0.05, db(G["glint"]))    # both hands light up
bed.add(pan_st(glint(5600, 0.1, 41), 0.4), C["hand1"] + 0.1, db(G["glint"]))
sparkle(C["own"] - 0.2, bed, G["glint"] - 3, seed=42, n=4, step=0.06, f0=6200)    # his head turns to glass
bed.add(pan_st(thud_low(43, 72.0), 0), C["half"] + 0.03, db(G["lit"]))            # the halves light up (low, on "half")
bed.add(pan_st(fade(buzz_hi(C["brain_end"] - C["half"], 30.0, 44, lo=5400), 0.1, 0.1), 0), C["half"], db(G["cord"]))   # the cords grow
sfx.add(pan_st(whoosh(0.22, 300, 2600, 45, 0.85), 0), C["brain_end"] + 0.02, db(G["dive"]))   # into his head (ends before "But")

# ================================================================= the halves chat over a bridge; the circle leaks across
for i, tb in enumerate((C["chat"] - 0.08 + 0.42 * j for j in range(4))):        # the bubbles pop (top only, under the words)
    bed.add(pan_st(glint(6800 - 300 * (i % 2), 0.06, 50 + i), 0.3 if i % 2 == 0 else -0.3), tb, db(G["pop"]))
sfx.add(pan_st(fade(gibber(0.2, 51, 700.0, thin=True), 0.01, 0.04), 0.3), C["bridge_end"] + 0.02, db(G["chat"]))   # a tiny voice (pause after "bridge...")
bed.add(pan_st(thud_low(52, 96.0), 0), C["bridge"] + 0.02, db(G["plank"]))        # the bridge's planks land (low)
sparkle(C["bridge"] + 0.1, bed, G["glint"] - 2, seed=53, n=3, step=0.08, f0=5800)
r0, r1 = C["circle2"] - 0.12, C["across_end"] - 0.05
bed.add(pan_st(ratchet(r1 - r0, 16.0, 24.0, 54, edges=True), 0.0), r0, db(G["roll"]))   # the circle rolls across (top only)
sfx.add(pan_st(boing(0.3, 130.0, 55), -0.2), C["across_end"] + 0.03, db(G["boing"]))   # it lands; the line goes round (low boing, pause)

# ================================================================= the proof: the bridge cut, both shapes clean
sfx.add(pan_st(ding(84, 0.14, 60), 0), C["proof_end"] + 0.06, db(G["ding"]))      # Proof? ding (in the pause)
bed.add(pan_st(glint(7000, 0.08, 61), 0), C["two"] - 0.05, db(G["glint"]))         # the scissors appear
bed.add(pan_st(top_swish(0.07, 62), 0), C["cut"] + 0.08, db(G["snip"] + 10))       # snip (top only, on "cut")
bed.add(pan_st(glint(7600, 0.05, 63), 0), C["cut"] + 0.1, db(G["snip"] + 4))
bed.add(pan_st(thud_low(64, 66.0), 0), C["cut_end"] + 0.12, db(G["droop"]))        # the bridge's halves drop (low, under "drew")
for i, tk in enumerate((C["shapes"] + 0.02, C["shapes"] + 0.2)):                   # two ticks (top only)
    bed.add(pan_st(glint(6600 + 500 * i, 0.08, 65 + i), -0.3 if i == 0 else 0.3), tk, db(G["tick"]))

# ================================================================= "better than YOU."
hand_swishes(SHOT["you"] + 0.05, END["you"], seed=70)
shimmer(SHOT["you"], END["you"], seed=71)
bed.add(pan_st(thud_low(72, 58.0), 0.3), C["you"] + 0.04, db(G["stamp"]))          # the red X (low, on "YOU")
sfx.add(pan_st(buzzer(0.32), 0), C["you_end"] + 0.03, db(G["buzzer"]))            # wrong answer (pause after "YOU.")

# ================================================================= the weirdest fact: a ghost arm
hand_swishes(SHOT["weird"] + 0.05, C["weirder_end"], seed=80)
sfx.add(pan_st(slide(392, 523, 0.3, vib=7.0), 0), C["weirder_end"] + 0.04, db(G["spooky"]))   # Weirder? (pause)
bed.add(pan_st(thud_low(81, 90.0), -0.3), C["missing"] + 0.03, db(G["poof"]))       # POOF: his arm is gone (low...
bed.add(pan_st(top_swish(0.3, 82), -0.3), C["missing"] + 0.03, db(G["swish"] + 9))  # ...and air on top)
sparkle(C["arm"] - 0.05, bed, G["glint"] - 2, seed=83, n=4, step=0.07, pan=-0.3)    # the ghost arm appears
shimmer(C["arm"], END["weird"], seed=84, gain=4, pan=-0.3)
k, tk = 0, C["arm"] + 0.1                                                          # the ghost's circles: a breathy top whoosh
while tk < END["weird"] - 0.2:
    bed.add(pan_st(top_swish(0.22, 85 + k), -0.35), tk, db(G["ghost"]))
    tk += P_DRAW
    k += 1
hand_swishes(C["bend2"] - 0.2, END["weird"], seed=90, gain=-1)                       # the real right hand draws again
sfx.add(pan_st(wobble(0.34, 91, 560.0, 330.0), 0.3), C["line2_end"] + 0.04, db(G["wobble"] - 1))   # it bends (pause after "line...")
sfx.add(pan_st(ooo(0.46), -0.2), C["hand_end"] + 0.04, db(G["oooo"]))              # oooo (pause after "hand.")

# ================================================================= the button: not clumsy, cheating
hand_swishes(SHOT["button"] + 0.05, DUR + 0.5, seed=100)
shimmer(SHOT["button"], DUR, seed=101)
sfx.add(pan_st(ding(91, 0.14, 102), 0), C["clumsy_end"] + 0.03, db(G["tick"]))    # NOT CLUMSY, tick (pause after "clumsy.")
sfx.add(pan_st(shush(0.32, 103), -0.3), C["cheating_end"] + 0.03, db(G["psst"]))   # psst (after "cheating.")

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, C["circle_w"] + 0.15, C["bend0"], BPM, ["F", "Bb"], gain=-12, seed=10, kick_on=False, snaps=True)   # the test
groove(mus, C["your1"] + 0.15, C["copy_end"], BPM, ["Dm", "Bb"], gain=-10, seed=20, kick_on=False, snaps=True)    # sneaky: copying
drone(mus, C["each"] + 0.1, C["brain_end"] + 0.02, [41, 48, 53, 60], cutoff=420, gain=-28)                        # a curious held chord
groove(mus, C["chat"] + 0.2, C["bridge_end"], BPM, ["Dm", "C"], gain=-9, seed=21, kick_on=False, snaps=True)      # the chat
groove(mus, C["circle2"] + 0.1, C["across_end"], BPM, ["Dm", "Bb", "C"], gain=-9, seed=30, snaps=True)            # the sneak across
groove(mus, C["drew"] + 0.15, C["better"], BPM, ["F", "Bb", "C"], gain=-8, seed=41, snaps=True)                  # both shapes, clean
# the ghost: an eerie held chord, high and thin
mus.add(pad([mtof(m) for m in (62, 65, 69, 74)], C["hand_end"] - C["missing"], att=0.6, cutoff=1800, seed=50), C["missing"], db(-20))
groove(mus, C["your2"] + 0.2, C["clumsy_end"], BPM, ["F", "Bb"], gain=-9, seed=10, kick_on=False, snaps=True)      # the hook's groove again
groove(mus, C["cheating_end"] + 0.4, DUR, BPM, ["F", "Bb"], gain=-10, seed=10, kick_on=False, snaps=True)         # ...into the loop
silence(mus, [(C["bend0"], C["your1"] + 0.15),           # the bend, the wobble, "Bent, right?" ?!
              (C["copy_end"], C["each"] + 0.1),          # COPIED... "homework." beep beep
              (C["bridge_end"], C["circle2"] + 0.1),     # the tiny voice
              (C["across_end"], C["drew"] + 0.15),       # it lands: boing; Proof? ding; the scissors and the snip, in the quiet
              (C["better"], C["missing"]),               # better than YOU: buzzer; Weirder? (spooky slide)
              (C["clumsy_end"], C["cheating_end"] + 0.4)])  # tick; "They're cheating." psst

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
