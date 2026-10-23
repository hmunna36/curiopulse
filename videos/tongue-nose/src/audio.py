"""Why Can't Your Tongue Touch Your NOSE? 👅 Short: sound design, score and mix, cue-locked to timeline.json.

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

SFX_LEVEL = -13.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(blep=-22, lunge=-24, tink=-26, clip=-25, jingle=-27, yank=-20, boing=-21, creak=-30, dive=-24, twang=-21,
         glint=-26, xray=-31, bonk=-21, squeeze=-31, stretch=-21, pointy=-19, pop=-29, win=-17, sparkle=-25, stamp=-16,
         clipboard=-24, flip=-12, bendy=-21, hmm=-19, side=-21, out=-25)


def end_of(cue):
    """the end of the word that starts at cue time C[cue]"""
    t0 = C[cue]
    w = min(WORDS, key=lambda w: abs(w["start"] - t0))
    return w["end"]


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


def blep(seed=0, edges=False):
    """a tiny wet tongue noise (a 'blep'): a short squelch. edges=True keeps what is under 300 Hz and above 5.2 kHz,
    so it can sit under a word (mono, 0.09 s)"""
    y = squelch(0.09, seed)
    if edges:
        y = filt(y, "lowpass", 300) * 1.4 + filt(y, "highpass", 5200) * 2.2
    return fade(y / (np.abs(y).max() + 1e-9), 0.002, 0.02)


def twang(f=82.0, dur=0.45, seed=0):
    """a rope pulled tight: a low plucked string that bends up a little as it rings (mono; mostly under 400 Hz)"""
    n = int(dur * SR)
    t = ar(n)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.06 * (1 - np.exp(-t / 0.05)))) / SR
    y = (np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * expdecay(n, 0.16)
    y += 0.25 * filt(white(n, seed), "bandpass", (600, 1300)) * expdecay(n, 0.01)
    y = filt(y, "lowpass", 1400)
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.05)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0):
    for i in range(n):
        bus.add(pan_st(glint(5600 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


# ================================================================= the strain: a low tremble while he tries (bed, under 220 Hz)
# on the picture's clock: loopW(2 pi strain_hz) (scenes.js), so the last frames tremble like the first
W_STR = 2 * np.pi * max(1, round(C.get("strain_hz", 7.0) * DUR)) / DUR
trem = 0.5 + 0.5 * np.sin(W_STR * tt)
strain_on = gate(N, [(0.0, C["your2"] - 0.1), (C["lift"], C["under"]), (C["thats"], END["pointy"]), (C["try2"] - 0.1, DUR)])
bed.x += pan_st(filt(brown(N, 90), "lowpass", 200), 0) * 0.06 * trem * strain_on

# ================================================================= the test, the answer
sfx.add(pan_st(blep(1), 0), 0.0, db(G["blep"]))                                                 # frame 1: the tongue's out
bed.add(pan_st(blep(2, edges=True), 0.15), 0.62, db(G["blep"] - 2))                            # the little lunges (under words)
bed.add(pan_st(blep(3, edges=True), -0.15), 1.36, db(G["blep"] - 2))
sfx.add(pan_st(blep(4), 0), C["tongue1"] + 0.48, db(G["blep"]))                                # in the pause after "tongue?"
sfx.add(pan_st(slide(300, 640, 0.36, vib=6.0), 0), C["try1_end"] + 0.04, db(G["lunge"]))      # Try it. ... the big lunge: wee-up
bed.add(pan_st(glint(6800, 0.08, 5), 0.2), C["close"] - 0.02, db(G["tink"]))                    # the measuring mark
sfx.add(pan_st(squeak(0.12, 1500, 1200), 0.1), end_of("right") + 0.06, db(G["tink"]))           # so close: a tiny strained squeak
bed.add(pan_st(glint(5200, 0.12, 6), 0), C["your2"], db(G["clip"]))                             # the leash's clip: snick
bed.add(pan_st(thud_low(7, 110.0), 0), C["your2"] + 0.02, db(G["clip"]))
bed.add(pan_st(filt(jingle(0.4, 8, rate=26), "highpass", 5000), 0), C["your2"] + 0.08, db(G["jingle"]))   # a dog tag's jingle (top only)
sfx.add(pan_st(whoosh(0.2, 600, 2600, 9, 0.6), 0), C["leash_end"] + 0.02, db(G["yank"]))       # LEASH. ... yank!
sfx.add(pan_st(boing(0.32, 120.0, 10), 0), C["leash_end"] + 0.08, db(G["boing"]))              # ...and the tongue springs back
bed.add(pan_st(creak(0.28, 11, 90, 200), 0), C["lift_tongue"] + 0.42, db(G["creak"]))          # Lift your tongue... it creaks up (pause)
bed.add(pan_st(thud_low(12, 64.0), 0), C["tug"] + 0.02, db(G["twang"] - 4))                    # tug (low, on the word)
bed.add(pan_st(glint(6400, 0.1, 13), 0), C["tug"] + 0.1, db(G["glint"]))                       # the strap lights up
bed.add(pan_st(top_swish(0.22, 14), -0.4), C["under"] - 0.04, db(G["dive"]))                    # the window opens on his cheek
bed.add(pan_st(top_swish(0.3, 15), 0), C["under_end"] - 0.02, db(G["dive"]))                   # ...and we dive through it

# ================================================================= the side view: tied down, front and back; no bones; squeeze
amb_side = gate(N, [(SHOT["side"], END["side"])])
amb.x += pan_st(filt(brown(N, 20), "lowpass", 160), 0) * 0.42 * amb_side                        # inside: a low hum
bed.add(pan_st(ratchet(0.5, 12.0, 30.0, 21, edges=True), 0), C["tied"], db(G["squeeze"]))       # tied: the ties pull tight
sfx.add(pan_st(twang(98.0, 0.42, 22), 0.25), end_of("down") + 0.08, db(G["twang"]))            # down, ... twang (the front tie)
bed.add(pan_st(glint(6100, 0.1, 23), 0.3), C["front"] + 0.02, db(G["glint"]))                  # FRONT lights up
bed.add(pan_st(glint(5700, 0.1, 24), -0.3), C["back"] + 0.02, db(G["glint"]))                  # BACK lights up
sfx.add(pan_st(twang(73.0, 0.44, 25), -0.25), C["back_end"] + 0.06, db(G["twang"]))            # back. ... twang (the back tie)
bed.add(pan_st(buzz_hi(C["inside_end"] - C["no"] + 0.1, 24.0, 26), 0), C["no"] - 0.15, db(G["xray"]))   # the dashed bone hums on
sfx.add(pan_st(bonk(), 0), C["inside_end"] + 0.04, db(G["bonk"]))                               # inside, ... bonk: no bone
k = 0
for t0 in np.arange(C["stretches"], C["skinny_end"] - 0.1, 0.23):                                # the rings squeeze, one after another
    bed.add(pan_st(filt(squelch(0.08, 30 + k), "highpass", 5200), 0.3 * ((k % 3) - 1)), t0, db(G["squeeze"]))
    k += 1
sfx.add(pan_st(slide(220, 560, 0.3, vib=5.0), 0), C["skinny_end"] + 0.02, db(G["stretch"]))   # skinny. ... it stretches: boi-oing up
bed.add(pan_st(top_swish(0.24, 31), 0), SHOT["pointy"] - 0.12, db(G["dive"]))                    # back to the mirror (top only: "That's")

# ================================================================= pointy
bed.add(pan_st(filt(squeak(0.3, 2400, 3600), "highpass", 5000), 0), C["yours"], db(G["squeeze"]))   # the sides squeeze in (top only)
sfx.add(pan_st(ding(91, 0.13, 40, bright=1.4), 0), C["pointy_end"] + 0.03, db(G["pointy"]))   # POINTY. ... ting!
sfx.add(pan_st(whoosh(0.22, 500, 2600, 41, 0.75), 0), SHOT["crowd"] - 0.18, db(G["dive"] - 2))

# ================================================================= the crowd: one in ten; born super-bendy
for i in range(10):                                                                              # ten faces pop in (top only)
    bed.add(pan_st(glint(5400 + 260 * i, 0.06, 50 + i), -0.6 + 0.13 * i), SHOT["crowd"] + 0.05 + 0.045 * i, db(G["pop"]))
make_end = max(w["end"] for w in WORDS if w["start"] < C["about"] - 0.05)
sfx.add(pan_st(ding(84, 0.16, 60, bright=1.2), 0.3), make_end + 0.03, db(G["win"]))           # make it... ding: one made it
sparkle(make_end + 0.08, bed, G["sparkle"], seed=61, n=3, pan=0.3)
bed.add(pan_st(thud_low(62, 72.0), 0), C["one10"] + 0.02, db(G["stamp"]))                       # 1 IN 10 lands (low)
sfx.add(pan_st(ding(79, 0.14, 63), 0), C["ten_end"] + 0.04, db(G["stamp"]))                    # ten. ... ding
bed.add(pan_st(thud_low(64, 96.0), 0), C["doctors"] - 0.08, db(G["clipboard"]))                # the clipboard's clip snaps on (low)
bed.add(pan_st(glint(6600, 0.1, 65), 0), C["named"] + 0.05, db(G["glint"]))                    # GORLIN'S SIGN
sfx.add(pan_st(page_rip(0.14, 66), 0), C["named_end"] + 0.03, db(G["flip"]))                   # it! ... the cards flip
for j in range(5):                                                                               # can. ... five of them make it
    tj = C["can2_end"] + 0.06 + 0.07 * j
    sfx.add(pan_st(boing(0.18, 150.0 + 18 * j, 70 + j), -0.6 + 0.3 * j), tj, db(G["bendy"] - 1.5 * (j > 0)))
sparkle(C["can2_end"] + 0.1, bed, G["sparkle"], seed=76, n=4, step=0.06)

# ================================================================= the button
sfx.add(pan_st(whoosh(0.22, 400, 2400, 80, 0.8), 0), SHOT["button"] - 0.2, db(G["dive"] - 2))
sfx.add(pan_st(slide(300, 262, 0.2, vib=0.0), 0), C["made_end"] + 0.12, db(G["hmm"]))          # Made it? ... hm?
sfx.add(pan_st(slide(220, 175, 0.26, vib=0.0), 0), C["showoff_end"] + 0.08, db(G["side"]))     # Show-off. ... hmph (the squint)
bed.add(pan_st(blep(81, edges=True), 0), C["try2"] + 0.02, db(G["out"]))                        # out comes the tongue again
sfx.add(pan_st(blep(82), 0), C["try2_end"] + 0.06, db(G["blep"]))                              # try. ... blep (into the loop)

# ================================================================= ambience (one bed per world, gated to its shots)
bath_on = gate(N, [(0, SHOT["side"] + 0.05), (SHOT["pointy"] - 0.05, SHOT["crowd"] + 0.05), (SHOT["button"] - 0.05, DUR)])
amb.x += pan_st(filt(brown(N, 1), "lowpass", 230), 0) * 0.32 * bath_on                          # the bathroom: room tone
crowd_on = gate(N, [(SHOT["crowd"], SHOT["button"])])
amb.x += pan_st(filt(brown(N, 3), "lowpass", 300), 0) * 0.26 * crowd_on                         # the chart: a quiet room

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.24, C["close"] - 0.04, BPM, ["F", "Bb"], gain=-9, seed=10, kick_on=False, snaps=True)   # after "Can"
groove(mus, C["lift"] + 0.05, C["under_end"] - 0.1, BPM, ["Dm", "Bb"], gain=-10, seed=11, kick_on=False, snaps=True)
drone(mus, SHOT["side"] + 0.05, C["no"], [38, 45, 50, 57], cutoff=520, gain=-17)                # inside: a held, curious chord
groove(mus, C["so"] + 0.05, C["skinny_end"], BPM, ["Dm", "Bb", "C", "C"], gain=-8, seed=20, snaps=True)   # the squeeze: a drive
groove(mus, C["thats"] + 0.1, C["pointy"] - 0.05, BPM, ["Bb", "C"], gain=-9, seed=21, kick_on=False, snaps=True)
groove(mus, C["only"] + 0.05, C["ten"] - 0.05, BPM, ["F", "C", "Bb", "F"], gain=-8, seed=30, snaps=True)
groove(mus, C["doctors"] + 0.25, C["can2"] - 0.04, BPM, ["Dm", "Bb", "C"], gain=-8, seed=31, kick_on=False, snaps=True)
mus.add(pan_st(riser(0.8, 32, 300, 2200), 0), C["can2"] - 0.8, db(-27))
groove(mus, C["didnt"] + 0.1, DUR, BPM, ["F", "Bb"], gain=-9, seed=10, kick_on=False, snaps=True)   # the hook's groove again: into the loop
silence(mus, [(make_end - 0.02, C["about"]),               # make it... ding
              (C["one10"] - 0.04, C["doctors"] + 0.25),   # one in ten. ding
              (C["can2"] - 0.04, C["didnt"] + 0.1)])        # can. five boings; Made it? Show-off.

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
