"""Why Do Your Ears RUMBLE When You Yawn? 👂 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Rule of the house (sound.md): a sound that lives in the speech band goes in a pause ("say it on the word, do it in the
pause"); under a word only what is under ~250 Hz or above ~5.2 kHz. The rumble itself is a low buzz whose harmonics
reach up to ~260 Hz (a phone speaker plays nothing under ~200 Hz), so it can sit under the words; in the pauses (the two
YES rumbles) it gets its growl in the low mids as well.
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
G = dict(rumble=-17, rumble_full=-18, yawn=-24, breath=-30, whoosh=-22, horn=-12, confetti=-31, glint=-29, squeak=-15,
         tick=-31, nope=-24, ding=-17, strain=-30, raspberry=-12, dive=-28, creak=-27, tok=-16, crunch=-8,
         crunch_small=-17, ratchet=-29, cam=-29, scan=-34, beep=-25, hi=-20, yes=-20, chirp=-33, pop=-25)


# ---------------------------------------------------------------- small sounds of this Short
def ear_rumble(dur, seed=0, full=False, f0=31.0):
    """the ear's rumble: a low buzz near 30 Hz (the muscle's own shudder) saturated so its harmonics reach ~260 Hz,
    rolling like far-off thunder. full=True adds a growl at 300-700 Hz (for a pause only). Mono."""
    n = int(dur * SR)
    t = ar(n)
    u = np.linspace(0, 1, n)
    f = f0 * (1 + 0.06 * np.sin(2 * np.pi * 3.1 * t + seed) + 0.03 * np.sin(2 * np.pi * 7.7 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.tanh(2.8 * (np.sin(ph) + 0.5 * np.sin(2 * ph + 0.3) + 0.3 * np.sin(3 * ph + 1.1)))
    y = filt(y, "lowpass", 270)
    roll = filt(brown(n, seed), "lowpass", 200)
    y = y / (np.abs(y).max() + 1e-9) + 0.55 * roll / (np.abs(roll).max() + 1e-9)
    if full:
        g = filt(pink(n, seed + 3), "bandpass", [280, 700]) * (0.6 + 0.4 * np.abs(np.sin(ph * 0.5)))
        y = y / (np.abs(y).max() + 1e-9) + 0.35 * g / (np.abs(g).max() + 1e-9)
    env = np.minimum(1, u * dur / 0.07) * np.minimum(1, (1 - u) * dur / 0.14)
    return fade(y * env / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def rumble_at(span, seed, gain=0.0, full=False, pan=0.0):
    a, b = span
    bed.add(pan_st(ear_rumble(b - a + 0.16, seed, full), pan), a, db(G["rumble_full" if full else "rumble"] + gain))


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0, f0=5600):
    for i in range(n):
        bus.add(pan_st(glint(f0 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


def raspberry(dur=0.3, seed=0, f0=86.0):
    """a tongue-out raspberry (pbbbt): a flapping low buzz with spit noise on top; speech band, so in a pause"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = f0 * (1 + 0.25 * np.sin(2 * np.pi * 9 * ar(n)) + 0.15 * u)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sign(np.sin(ph)) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 23 * ar(n))))
    y = filt(y, "bandpass", [70, 1800]) + 0.25 * filt(white(n, seed), "bandpass", [1500, 5000]) * np.abs(np.sin(ph))
    env = np.minimum(1, u / 0.06) * (1 - u) ** 0.6
    return fade(np.tanh(2.0 * y / (np.abs(y).max() + 1e-9)) * env, 0.004, 0.03)


def tom_tok(seed=0, f=210.0):
    """a tight drum skin hit once: a short pitched tok with a stick click (0.14 s; for a pause)"""
    n = int(0.16 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t / 0.01))) / SR) * expdecay(n, 0.05)
    y += 0.5 * filt(white(n, seed), "bandpass", [1800, 6000]) * expdecay(n, 0.006)
    y = np.tanh(2.4 * y / (np.abs(y).max() + 1e-9)) / np.tanh(2.4)
    return fade(y, 0.0005, 0.03)


def crisp_crunch(seed=0, dur=0.24, small=False):
    """a crisp crunched: a burst of dry snaps over a bite thud (speech band: in a pause)"""
    n = int(dur * SR)
    y = crackle(n, 1800 if not small else 900, seed, 900, 8000, 0.0012) * expdecay(n, 0.09 if not small else 0.05)
    y += 0.7 * filt(white(n, seed + 1), "bandpass", [1200, 5200]) * expdecay(n, 0.03)
    y += 0.5 * filt(brown(n, seed + 2), "lowpass", 300) * expdecay(n, 0.04)
    y = np.tanh(2.6 * y / (np.abs(y).max() + 1e-9)) / np.tanh(2.6)
    return fade(y, 0.001, 0.03)


def muscle_creak(dur=0.4, seed=0):
    """a rope pulled taut: a slow low creak (under 260 Hz) with a dry top (above 5.2 kHz); it can run under a line"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = 55 + 40 * u
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = filt(np.sign(np.sin(ph)) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 17 * ar(n)))), "lowpass", 260)
    y = y / (np.abs(y).max() + 1e-9) + 0.25 * filt(white(n, seed), "highpass", 5600) * np.abs(np.sin(2 * np.pi * 17 * ar(n)))
    return fade(y * np.sin(np.pi * u) ** 0.5 / (np.abs(y).max() + 1e-9), 0.01, 0.05)


# ================================================================= ambience (one bed per world, gated to its shots)
camp_spans = [(0, SHOT["drum"] + 0.45), (SHOT["payoff"], DUR)]
inside_spans = [(SHOT["drum"] + 0.35, END["drum"])]
# the campsite at night: a low fire rumble and its crackle (top), a breeze, crickets far off
fire = fire_rumble(DUR, 7, top=200.0)
fire = np.pad(fire, (0, max(0, N - len(fire))))[:N]
breeze = filt(pink(N, 8), "lowpass", 300) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * tt))
camp_bed = 0.55 * fire + 0.35 * breeze
# while he rumbles, the world goes muffled: the camp bed dips (what a tensed eardrum does to low sounds)
rk = np.zeros(N)
for a, b in C["rumbles"]:
    rk = np.maximum(rk, np.clip(np.minimum((tt - a) / 0.08, (b + 0.16 - tt) / 0.16), 0, 1))
muff = 1 - 0.55 * rk
amb.x += pan_st(camp_bed * muff, 0) * 0.42 * gate(N, camp_spans)
crickets(0.2, SHOT["drum"] + 0.3, amb, db(-37), seed=11, f=4900, rate=0.9)
crickets(SHOT["payoff"] + 0.1, DUR - 0.2, amb, db(-37), seed=12, f=4900, rate=0.9)
throb = 0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt) ** 2
amb.x += pan_st(filt(brown(N, 3), "lowpass", 170) * throb, 0) * 0.24 * gate(N, inside_spans)   # inside the ear: a warm throb

# ================================================================= the test: the yawn, the rumble
sfx.add(pan_st(fade(whoosh(0.22, 260, 2000, 20, 0.9), 0.002, 0.05), 0), 0.0, db(G["whoosh"]))        # frame 1 moves
yv = filt(yawn_voice(1.9, 150.0, 82.0, 21, breathy=0.5), "lowpass", 300)                            # his yawn, low (under the words)
bed.add(pan_st(yv / (np.abs(yv).max() + 1e-9), 0), 0.0, db(G["yawn"]))
bed.add(pan_st(fade(filt(white(int(1.6 * SR), 22), "highpass", 5400) * np.sin(np.pi * np.linspace(0, 1, int(1.6 * SR))), 0.05, 0.2), 0), 0.05, db(G["breath"]))   # his breath (top)
for i, span in enumerate(C["rumbles"][:4]):
    rumble_at(span, 30 + i, gain=(0 if i != 1 else -3))                                             # the rumbles under the lines
sfx.add(pan_st(fade(slide(300.0, 620.0, 0.16, vib=0.0, harm=4), 0.005, 0.03), 0.1), C["right_end"] + 0.06, db(G["squeak"] - 3))   # "?!" (pause after "right?")

# ================================================================= Congrats: a party horn, confetti; the flex
sfx.add(pan_st(party_horn(0.3, 40, 470.0), -0.3), C["congrats_end"] + 0.02, db(G["horn"]))           # (pause after "Congrats.")
bed.add(pan_st(fade(crackle(int(0.5 * SR), 700, 41, 5400, 11000, 0.0008), 0.01, 0.1), -0.4), C["confetti"], db(G["confetti"]))   # confetti (top)
sparkle(C["window_in"], bed, G["glint"], seed=42, n=4, step=0.05, pan=-0.4, f0=6000)                 # the window opens (top)
sfx.add(pan_st(squeak(0.13, 1300, 2600), -0.3), C["ear_end"] + 0.04, db(G["squeak"]))               # the flex: a rubbery squeak (pause after "EAR.")

# ================================================================= without the yawn
bed.add(pan_st(top_swish(0.1, 50), 0.3), C["no_yawn"], db(G["tick"]))                                # the badge pops (top)
bed.add(pan_st(muscle_creak(0.5, 51), 0), C["without"] + 0.2, db(G["strain"]))                        # straining (low + top)
sfx.add(pan_st(ding(84, 0.12, 52, 1.2), 0.3), C["can_end"] + 0.04, db(G["ding"]))                   # CAN ✓ (pause after "can.")
sfx.add(pan_st(raspberry(0.3, 53, 90.0), 0.3), C["face_end"] + 0.03, db(G["raspberry"]))             # pbbbt (pause after "face.")
bed.add(pan_st(muscle_creak(0.6, 54), 0.3), C["strain"] + 0.1, db(G["strain"]))                      # the friend strains

# ================================================================= inside: the muscle pulls the drum tight; a drumstick
bed.add(pan_st(top_swish(0.45, 60), 0), C["dive"], db(G["dive"]))                                    # the dive (top)
sfx.add(pan_st(fade(whoosh(0.3, 140, 900, 61, 0.7), 0.01, 0.06), 0), C["dive"] - 0.05, db(G["whoosh"] - 4))
bed.add(pan_st(muscle_creak(0.5, 62), 0.2), C["pull"], db(G["creak"]))                               # it pulls (low + top)
sfx.add(pan_st(tom_tok(63, 230.0), -0.2), C["tap"], db(G["tok"]))                                     # TOK (pause after "drum.")

# ================================================================= the payoff: CRUNCH, the knob, crunch
cr1 = filt(crisp_crunch(70, 0.2), "lowpass", 900)                                                   # crnch under the earmuffs: muffled
sfx.add(pan_st(fade(cr1 / (np.abs(cr1).max() + 1e-9), 0.002, 0.03), 0.15), C["crunch1"], db(G["crunch_small"]))   # (pause after "muffled?")
cr2 = crisp_crunch(72, 0.3)
cr2 = cr2 * np.clip(1 - 0.8 * np.clip((ar(len(cr2)) - 0.05) / 0.2, 0, 1), 0.2, 1)                   # CRUNCH, turned down as it sounds
sfx.add(pan_st(cr2, 0.15), C["crunch2"], db(G["crunch"]))                                            # (pause after "chewing.")
for i in range(5):                                                                                     # the knob's clicks as it turns (top)
    bed.add(pan_st(fade(filt(white(int(0.012 * SR), 71 + i), "highpass", 5600), 0.0005, 0.005), 0.35), C["turn"] + 0.055 * i, db(G["ratchet"]))

# ================================================================= the ear camera and the keyboard
sparkle(C["cam_in"], bed, G["cam"], seed=80, n=3, step=0.05, pan=-0.3, f0=6400)                      # its light comes on (top)
scan_t = C["key_h"] - 7 * 0.16 - 0.08
while scan_t < C["key_i"]:                                                                             # the scan highlight steps (top ticks)
    bed.add(pan_st(fade(filt(white(int(0.01 * SR), int(scan_t * 100)), "highpass", 6000), 0.0005, 0.004), 0.4), scan_t, db(G["scan"]))
    scan_t += 0.16
rumble_at(C["rumbles"][4], 81, gain=-2, pan=-0.2)                                                      # H
sfx.add(pan_st(beep(1760.0, 0.05), 0.4), C["key_h"], db(G["beep"]))                                   # (pause after "move...")
rumble_at(C["rumbles"][5], 82, gain=-2, pan=-0.2)                                                      # I
bed.add(pan_st(glint(6800, 0.08, 83), 0.4), C["key_i"], db(G["glint"]))                               # (top, on "rumble")
for i, m in enumerate((84, 88)):                                                                       # HI: a happy ding-ding (pause after "rumble.")
    sfx.add(pan_st(ding(m, 0.12, 84 + i, 1.2), 0.4), C["hi_ding"] + 0.11 * i, db(G["hi"]))

# ================================================================= the button: rumble twice for YES
rumble_at(C["rumbles"][6], 90, full=True, pan=-0.2)
rumble_at(C["rumbles"][7], 91, full=True, pan=-0.2)
for i, m in enumerate((84, 88, 91)):                                                                   # YES ✓ (no words left)
    sfx.add(pan_st(ding(m, 0.14, 92 + i, 1.3), 0.35), C["yes_lit"] + 0.07 * i, db(G["yes"] - 2 * (i == 2)))
# the loop: frame 1's whoosh and the yawn's first breath land again just before the cut back to frame 1
bed.add(pan_st(top_swish(0.35, 99), 0), SHOT["loop"] + 0.05, db(G["dive"]))
yv2 = filt(yawn_voice(0.6, 170.0, 150.0, 98, breathy=0.6), "lowpass", 300)
bed.add(pan_st(yv2 / (np.abs(yv2).max() + 1e-9), 0), SHOT["loop"], db(G["yawn"] - 2))

# ================================================================= score (drops out for every punchline)
BPM = 104
groove(mus, 0.1, C["right_end"], BPM, ["F", "Bb"], gain=-13, seed=10, kick_on=False, snaps=False)        # the yawn: lazy
groove(mus, C["you"] + 0.1, C["ear_end"], BPM, ["F", "C"], gain=-12, seed=11, kick_on=True, snaps=True)  # you flexed your ear
groove(mus, C["now"] + 0.1, C["can_end"], BPM, ["Dm", "Bb"], gain=-12, seed=20, kick_on=False, snaps=True)   # try it: sneaky
groove(mus, C["rest"] + 0.1, C["face_end"], BPM, ["Dm", "A"], gain=-12, seed=21, kick_on=False, snaps=True)
groove(mus, C["muscle"] + 0.05, C["drum_end"], BPM, ["Am", "F"], gain=-13, seed=30, kick_on=True, snaps=True, sixteen=True)   # inside
groove(mus, C["its"] + 0.08, C["chewing_end"], BPM, ["C", "F"], gain=-12, seed=40, kick_on=True, snaps=True)   # the knob
mus.add(pad([mtof(m) for m in (53, 57, 60, 65)], C["hi_ding"] - C["scientists"], att=0.7, cutoff=1000, seed=50), C["scientists"] + 0.05, db(-21))   # the ear camera: warm
groove(mus, C["on_end"] + 0.1, C["yes_end"], BPM, ["F", "Bb"], gain=-13, seed=60, kick_on=False, snaps=True)   # rumble twice...
silence(mus, [(C["right_end"], C["you"] + 0.1),          # ?! and Congrats: the party horn
              (C["ear_end"], C["now"] + 0.1),             # the flex squeak
              (C["can_end"], C["rest"] + 0.1),            # CAN ✓
              (C["face_end"], C["muscle"] + 0.05),        # pbbbt
              (C["drum_end"], C["its"] + 0.08),           # TOK, crnch
              (C["chewing_end"], C["scientists"] + 0.05),  # CRUNCH, turned down
              (C["yes_end"], DUR)])                       # the two rumbles, YES

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
