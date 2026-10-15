"""Why Does a Doorknob SHOCK You? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The zap carries it: a crack of top and a low hit on frame 11 (on "touch"), the full buzz only in the narration's pauses,
and the big one alone after "jump.". Electrons are glints above 5 kHz (they can sit on words); the carpet is a scuff of
air above 5 kHz; the bolt is thunder kept under 250 Hz until "lightning." has been said, then a crack in the pause.
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
c = C
PAUSE = pause_mask(WORDS, N)                       # 1 where nobody is speaking, 0 under words


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a hit heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a crack that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def cut(t, seed, gain=-22.0, f0=400, f1=2000, top=2200):
    """the whoosh into a cut: kept dull, so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


def zap_at(t, dur, gain, seed, f0=118.0, rise=0.0, under=-6.0, pan=0.0, env=None):
    """a zap from t: all of it in the pauses of the narration, only its edges (under 250 Hz, above 5.2 kHz) under words"""
    y, e = zap(dur, seed, f0, False, rise), zap(dur, seed, f0, True, rise)
    if env is not None:
        k = env(np.linspace(0, 1, len(y)))
        y, e = y * k, e * k
    i0 = int(t * SR)
    pm = PAUSE[i0:i0 + len(y)]
    pm = np.pad(pm, (0, len(y) - len(pm)))
    sfx.add(pan_st(y * pm, pan), t, db(gain))
    bed.add(pan_st(e, pan), t, db(gain + under))


def twinkle(t0, t1, gain, seed, rate=22.0):
    """a sprinkle of glints above 5 kHz (electrons appearing): it can run under a line"""
    r = np.random.default_rng(seed)
    t = t0
    while t < t1:
        bed.add(pan_st(glint(r.uniform(5400, 8200), 0.08, int(r.integers(1, 999))), r.uniform(-0.5, 0.5)), t, db(gain + r.uniform(-3, 0)))
        t += r.exponential(1.0 / rate)


def scuff(t, dur, gain, seed, pan=0.0):
    """a sole scuffing a carpet: a swell of air above 5 kHz"""
    m = int(dur * SR)
    bed.add(pan_st(fade(filt(white(m, 60 + seed), "highpass", 5200, 4) * np.sin(np.pi * np.linspace(0, 1, m)) ** 1.5, 0.004, 0.03), pan), t, db(gain))


HALL = ("hook", "pile", "dry", "jump", "button", "loop")

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 220) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.17 * tt)))
amb.x += pan_st(room, 0) * 0.22 * gate(N, on(*HALL))                                 # the hallway, a winter evening
rug = norm(filt(pink(N, 3), "bandpass", [50, 240]))
amb.x += pan_st(rug, 0) * 0.28 * gate(N, on("steps"))                                 # down on the carpet: close and woolly
wind = norm(filt(pink(N, 5), "lowpass", 260) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.31 * tt) ** 2))
amb.x += pan_st(wind, 0) * 0.45 * gate(N, on("payoff"))                               # the storm
sea = norm(filt(pink(N, 7), "lowpass", 240) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.23 * tt) ** 2))
amb.x += pan_st(sea, 0) * 0.3 * gate(N, on("weird"))                                  # a shore in Greece
amb.x += pan_st(room, 0) * 0.14 * gate(N, on("debate"))                               # a classroom

# ================================================================= 1. hook: the finger, the knob, ZAP on frame 11
z = c["zap"]
scuff(0.0, 0.3, -24, 1, 0.2)                                                          # his sleeve, reaching (air)
low_thud(z, -7, 110.0, 0.36, 0.11)                                                    # ZAP: a low hit and a crack of top, on "touch"
hi_tick(z, -6, 2, 0.3)
hi_tick(z + 0.03, -10, 3, 0.25)
zap_at(z, 0.62, -6, 4, 128.0, 0.0, -5.0, 0.25, lambda u: (1 - u) ** 0.8)             # the buzz: in the gaps, its edges under the words
bed.add(pan_st(filt(zap(0.3, 6, 140.0, True), "lowpass", 250), 0.2), c["zapped"], db(-16))   # the word itself crackles (low only: its "z" is top)
hi_tick(c["thousands"] - 0.04, -16, 7, 0.0)                                            # THOUSANDS OF VOLTS pops
low_thud(c["thousands"], -16, 170.0, 0.12, 0.04)
# the answer: the music stops, then a tiny spark off his fingers on "spark"
hi_tick(c["spark"] + 0.02, -14, 8, 0.3)
bed.add(pan_st(zap(0.18, 9, 160.0, True), 0.3), c["spark"], db(-17))
twinkle(c["you"] - 0.3, c["you"] + 0.45, -20, 10)                                     # ... and on "YOU" the electrons come out all over him
low_thud(c["you"], -15, 90.0, 0.3, 0.1)
sfx.add(pan_st(filt(whoosh(0.45, 300, 1200, 11, 0.7), "lowpass", 1300), 0), c["you_end"] + 0.05, db(-22))   # the camera drops to his shoes
cut(SHOT["steps"] + 0.03, 12, -22, 300, 1300, 1600)

# ================================================================= 2. steps: the sneaker on the carpet, electrons hop on
for i in range(4):
    scuff(SHOT["steps"] + 0.05 + 0.85 * i, 0.6, -15 - (i % 2), 13 + i, -0.2 + 0.15 * i)
    low_thud(SHOT["steps"] + 0.08 + 0.85 * i, -20, 95.0, 0.2, 0.07)
for i in range(16):                                                                    # each electron that hops on: a glint (scenes.js STEP_E)
    x = 180 + i * 62
    tp = SHOT["steps"] + (x + 10 - 330) / 150.0
    if SHOT["steps"] < tp < END["steps"] - 0.05:
        bed.add(pan_st(glint(5600 + 160 * (i % 9), 0.07, 20 + i), -0.4 + 0.05 * i), tp + 0.08, db(-19))
hi_tick(c["electrons"] - 0.05, -17, 40, 0.0)                                          # the ELECTRONS tag

# ================================================================= 3. pile: they pile on, the charge climbs
cut(SHOT["pile"] - 0.12, 41, -30, 250, 900, 900)
for i in range(4):
    low_thud(SHOT["pile"] + 0.1 + 0.35 * i, -21, 120.0, 0.12, 0.04)                    # his steps
pn = END["pile"] - SHOT["pile"]
bed.add(pan_st(buzz_hi(pn, 26.0, 42) * np.linspace(0.3, 1.0, int(pn * SR)), 0.0), SHOT["pile"], db(-22))   # the charge, above the words
hum = tone(55.0, pn) * np.linspace(0.2, 1.0, int(pn * SR)) ** 2
bed.add(pan_st(fade(hum, 0.05, 0.1), 0), SHOT["pile"], db(-20))                       # ... and under them
twinkle(c["pile"], c["onto"] + 0.3, -21, 43, 16.0)

# ================================================================= 4. dry: they try to leave and bonk off the air
for i in range(5):
    t0 = SHOT["dry"] + 0.15 + i * 0.32 + 0.35                                         # scenes.js: the wall is hit at t0 + 0.35
    hi_tick(t0, -13, 50 + i, -0.4 + 0.2 * i)
    low_thud(t0, -18, 180.0 + 20 * i, 0.1, 0.03)
sq = squeak(0.1, 2200, 1500)
sfx.add(pan_st(fade(sq, 0.004, 0.02), 0.1), c["escape_end"] + 0.02, db(-17))           # the last one gives up (after "escape...")

# ================================================================= 5. jump: slow motion, then they ALL jump
jn = c["jump"] - c["finger"]
rs = riser(jn, 60, 300, 2200)
bed.add(pan_st(filt(rs, "highpass", 5200, 4), 0), c["finger"], db(-15))               # the build, above the words
for k, t0 in enumerate(np.arange(c["finger"] - 0.3, c["jump"] - 0.2, 0.62)):          # a heartbeat under it, slow motion
    bed.add(pan_st(filt(heartbeat(61 + k, 0.9), "lowpass", 200), 0), t0, db(-17))
bed.add(pan_st(zap(jn, 62, 90.0, True, 0.6) * np.linspace(0.2, 1, int(jn * SR)), 0.2), c["finger"], db(-19))   # the fingertip charging
hi_tick(c["metal"] - 0.05, -17, 63, 0.3)                                               # METAL
low_thud(c["jump"], -6, 85.0, 0.42, 0.13)                                              # ZAP on "jump.": the hit and the crack ...
hi_tick(c["jump"], -6, 64, 0.2)
hi_tick(c["jump"] + 0.04, -9, 65, 0.3)
zap_at(c["jump_end"] + 0.02, 0.42, -4, 66, 124.0, 0.0, -10.0, 0.2, lambda u: (1 - u) ** 0.6)   # ... and the buzz alone, after it

# ================================================================= 6. payoff: the spark up close, then a bolt on a giant knob
bed.add(pan_st(zap(c["bolt"] - SHOT["payoff"], 70, 150.0, True), 0.0), SHOT["payoff"], db(-15))   # the spark crackles (edges)
th = thunder(2.2, 71)
bed.add(pan_st(filt(th, "lowpass", 240), 0), c["bolt"] - 0.05, db(-9))                 # the strike under "bolt of lightning" (low only)
hi_tick(c["bolt"] - 0.05, -9, 72, 0.0)
crk = crack(0.35, 73, 0.07, 900)
sfx.add(pan_st(fade(crk, 0.001, 0.05) * 0.8, 0.0), c["lightning_end"] + 0.03, db(-12))   # the crack, in the pause after "lightning."

# ================================================================= 7. weird: Greece, amber, fur, feathers
cut(SHOT["weird"] + 0.02, 80, -25, 300, 1200, 1500)
for i in range(int((c["years"] - SHOT["weird"]) / 0.21)):                              # the fur rubbing the amber (air)
    scuff(SHOT["weird"] + 0.05 + 0.21 * i, 0.18, -21, 81 + i, 0.15)
twinkle(c["years"], c["ago_end"] + 0.2, -22, 82, 12.0)                                 # the feathers fly up and stick
for i in range(5):
    bed.add(pan_st(glint(6400 + 300 * i, 0.09, 83 + i), -0.3 + 0.15 * i), c["ago_end"] - 0.25 + 0.06 * i, db(-17))

# ================================================================= 8. debate: STILL DEBATED, and a shrug
cut(SHOT["debate"] + 0.02, 90, -25, 300, 1200, 1500)
low_thud(c["still"], -9, 95.0, 0.3, 0.1)                                               # the stamp lands (low, on "STILL")
hi_tick(c["still"], -10, 91, 0.0)
for i in range(3):
    hi_tick(SHOT["debate"] + 0.1 + 0.18 * i, -18, 92 + i, -0.3)                         # chalk
sfx.add(pan_st(fade(slide(392, 262, 0.34, 0.0, None, 5), 0.01, 0.06), 0.1), c["it_end"] + 0.05, db(-17))   # wah: a shrug (after "it.")

# ================================================================= 9. button: the doorknob is the victim
cut(SHOT["button"] + 0.02, 100, -25, 300, 1200, 1500)
hs = hiss(1.6, 101, 0.8)
bed.add(pan_st(filt(hs, "highpass", 5200, 4), 0.3), SHOT["button"] + 0.1, db(-26))   # it smokes
sq2 = squeak(0.12, 1500, 1050)
sfx.add(pan_st(fade(sq2, 0.004, 0.03), 0.3), c["victim_end"] + 0.06, db(-18))           # a tiny sob from the knob (after "VICTIM.")
low_thud(SHOT["loop"] + 0.05, -20, 140.0, 0.12, 0.04, sfx)                             # and his hand is on its way again

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is silent (nobody says "subscribe", 9 Oct 2026) and plays under the button line, so
# these three sounds sit under spoken words. Nothing here may mask one (qa.py lists weak words).
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-25))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-27))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-21))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-32))

# ================================================================= score (drops out for every punchline)
# the hallway: a light pizzicato groove after the zap, out for the answer
groove(mus, 1.35, c["volts_end"] + 0.05, 116, ["C", "F"], gain=-12, seed=10, kick_on=False)
drone(mus, c["spark"] - 0.1, c["you"] - 0.05, [50, 57, 62], cutoff=600, gain=-26, seed=11, swell=0.3)
# the mechanism: a curious minor groove, out in the slow motion
groove(mus, SHOT["steps"] + 0.05, c["escape_end"] + 0.05, 112, ["Dm", "Gm", "Dm", "A"], gain=-11, seed=12, kick_on=False)
drone(mus, c["finger"] - 0.1, c["jump"] - 0.08, [38, 45, 50, 53], cutoff=320, gain=-28, seed=13, swell=0.6)
drone(mus, c["tiny"], c["lightning_end"] - 0.02, [33, 40, 45], cutoff=380, gain=-25, seed=14, swell=0.3)
# Greece: a plucked tune in a mode that sounds old
groove(mus, SHOT["weird"] + 0.05, c["ago_end"] + 0.05, 100, ["Am", "G", "Am", "Em"], gain=-12, seed=15, kick_on=False, snaps=False)
groove(mus, c["still"] + 0.2, c["it_end"] - 0.02, 96, ["Dm", "A"], gain=-13, seed=16, arp=False, padv=False, kick_on=False)
# the button: a small sorry chord under "So technically...", nothing under the last words
drone(mus, c["so"] - 0.05, c["technically_end"] + 0.1, [48, 55, 60, 63], cutoff=520, gain=-27, seed=17, swell=0.4)
silence(mus, [(c["volts_end"] + 0.05, c["spark"] - 0.1), (c["pile"] - 0.42, c["pile"] - 0.04), (c["you"] - 0.05, SHOT["steps"] + 0.05), (c["escape_end"] + 0.05, c["finger"] - 0.1),
              (c["jump"] - 0.08, c["tiny"]), (c["lightning_end"] - 0.02, SHOT["weird"] + 0.05), (c["ago_end"] + 0.05, c["still"] + 0.2),
              (c["it_end"] - 0.02, c["so"] - 0.05), (c["technically_end"] + 0.1, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
