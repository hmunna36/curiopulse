"""Why Can't You TICKLE Yourself? (long-form): sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The score has ONE theme, "the feather tune" (two bars in F major: C A C F | E C D C), stated alone on a music box
in the hook (he is alone, nothing works), bounced on pizzicato for Pip, turned minor and slow while he trains,
played on marimba over the lab groove, played LATE (an echo a beat behind) for his delay machine, warm on piano for
the family photos, silent when the door opens on Sunday (the biggest moment gets the quietest sound), and resolved
on the tonic (... D E F) as the feather lands on his chest in the final image.
"""
import json
import os
import sys

import numpy as np

import sfxlib as L
from sfxkit import *  # noqa: F401,F403
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
WORDS = TL["words"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()


def shots(*ids):
    return [(SHOT[i], END[i]) for i in ids]


# ================================================================= small atoms for this film
def swish(dur=0.22, seed=0, f0=4200, f1=7600):
    """a feather brushing skin: a soft band-passed noise sweep"""
    n = int(dur * SR)
    fc = np.linspace(f0, f1, n)
    y = svf_bp(white(n, seed), fc, 1.4) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y, 0.002, 0.02)


def poke():
    """a cartoon poke: a short rising boop"""
    n = int(0.12 * SR)
    return fade(glide(380, 900, 0.12) * attack_decay(n, 0.004, 0.05), 0.001, 0.02)


def servo(dur, seed=0, f=520.0):
    """a small robot motor whine with a wobble"""
    n = int(dur * SR)
    fr = f * (1 + 0.08 * np.sin(2 * np.pi * 2.2 * ar(n)))
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(fr) / SR)
    y = filt(y * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 2.2 * ar(n)))), "lowpass", 1800)
    return fade(y, 0.05, 0.1)


def doorbell():
    """ding... dong"""
    return np.concatenate([bell(1318.5, 0.55, 0.5)[: int(0.5 * SR)], bell(1046.5, 1.4, 0.7)])


def rain(n, seed=0):
    """soft rain on a window: low-passed pink noise with sparse ticks (stereo)"""
    y = filt(pink(n, seed), "lowpass", 900) * 0.5 + crackle(n, 14, seed + 1, 5000, 9000) * 0.15
    return np.stack([y, filt(pink(n, seed + 7), "lowpass", 900) * 0.5 + crackle(n, 14, seed + 2, 5000, 9000) * 0.15])


THEME = [(72, 0.5), (69, 0.5), (72, 0.5), (77, 0.5), (76, 0.5), (72, 0.5), (74, 0.5), (72, 1.5)]
THEME_END = [(72, 0.5), (69, 0.5), (72, 0.5), (77, 0.5), (76, 0.5), (72, 0.5), (74, 0.5), (76, 0.5), (77, 2.5)]
MINOR = {69: 68, 76: 75, 74: 73}


def theme(t0, bpm, inst="box", gain=-14.0, tr=0, minor=False, notes=THEME, pan=0.0, echo=0.0, seed=0):
    """play the feather tune from t0; beat = 60/bpm; inst: box | pizz | marimba | piano. echo > 0: a late copy."""
    beat = 60.0 / bpm
    t = t0
    for k, (m, d) in enumerate(notes):
        m = MINOR.get(m, m) if minor else m
        f = mtof(m + tr)
        ln = max(0.4, d * beat + 0.3)
        sig = {"box": lambda: music_box(f, max(1.2, ln), seed + k), "pizz": lambda: pizz(f, 0.5, seed + k),
               "marimba": lambda: marimba(f, 0.7, seed + k), "piano": lambda: piano(f, max(0.8, ln), seed + k)}[inst]()
        mus.add(sig, t, db(gain), pan=pan)
        if echo:
            mus.add(sig, t + echo, db(gain - 7), pan=-pan - 0.3)
        t += d * beat
    return t


# ================================================================= ambience (one bed per world, gated to its shots)
night = shots("hook", "else", "plan", "days", "stare", "surprise", "rehook1", "machine", "turn")
amb.x += rain(N, 3) * gate(N, night, 0.3) * 0.5
amb.x += pan_st(filt(brown(N, 4), "lowpass", 160), 0) * 0.35 * gate(N, night, 0.3)              # room tone
amb.x += pan_st(filt(brown(N, 5), "lowpass", 260) + 0.02 * np.sin(2 * np.pi * 120 * tt), 0) * 0.35 * gate(N, shots("lab", "sync", "fool", "rats"), 0.2)
day = shots("pip", "fight", "sunday", "end")
amb.x += pan_st(filt(brown(N, 6), "lowpass", 200), 0) * 0.25 * gate(N, day, 0.3)
for k, t in enumerate(np.arange(SHOT["pip"] + 0.6, END["pip"], 1.7)):
    sfx.add(tweet(k, 3200 + 300 * (k % 3)), t, db(-30), pan=-0.5)
amb.x += pan_st(filt(pink(N, 9), "bandpass", (180, 520)) * 0.3, 0) * gate(N, shots("brain", "predict"), 0.3) * 0.6   # the inside hum
amb.x += pan_st(filt(brown(N, 10), "lowpass", 120), 0) * 0.4 * gate(N, shots("press", "escalate"), 0.3)     # the spotlight hum

# ================================================================= whooshes into every cut (not the hard comedy cuts)
for s in TL["shots"][1:]:
    if s["id"] in ("days", "stare", "machine", "sunday", "end", "turn"):
        continue
    sfx.add(pan_st(whoosh(0.3, 500, 2600, 600 + int(s["start"])), 0), s["start"] - 0.26, db(-28))

# ================================================================= hook: the feather on his chin; nothing
for k, t in enumerate(np.arange(0.0, c["nothing"] - 0.3, 0.33)):
    sfx.add(swish(0.2, k), t, db(-32 + (4 if 2.85 < t < 4.0 else 0)), pan=0.1)
_nothing_end = [w["end"] for w in WORDS if w["block"] == "nothing"][-1]
sfx.add(cricket(1, 3), _nothing_end + 0.12, db(-24), pan=0.4)
theme(0.2, 92, "box", gain=-22, seed=1)

# ================================================================= else: the poke, the fall, the freeze
sfx.add(poke(), c["poke"] + 0.13, db(-20), pan=0.3)
sfx.add(springs(2, 0.5), c["apart"] - 0.6, db(-34))
for k, t in enumerate(np.arange(c["poke"] + 0.1, c["why"] - 0.1, 0.28)):
    sfx.add(swish(0.18, 40 + k), t, db(-34), pan=0.3)
sfx.add(slide_whistle(0.4, 1500, 500), [w["end"] for w in WORDS if w["word"].startswith("apart")][0] - 0.05, db(-30))
sfx.add(thump(0.35, 160, 50, 0.08, 3), c["apart"] + 0.5, db(-18))
_apart_end = [w["end"] for w in WORDS if w["word"].startswith("apart")][0]
sfx.add(scratch(0.28, 1), max(_apart_end + 0.03, c["why"] - 0.36), db(-24))
groove(mus, c["poke"] - 0.05, c["why"] - 0.3, 132, ["F", "Bb", "C", "F"], gain=-12, seed=2, padv=False)

# ================================================================= future: the fortune-teller brain
drone(mus, SHOT["future"], END["future"], [53, 60, 65, 69], cutoff=500, gain=-33)
for k in range(6):
    sfx.add(bell(2093 * (1.0 + 0.12 * (k % 3)), 0.9, 0.4), SHOT["future"] + 0.2 + 0.55 * k, db(-40), pan=0.6 - 0.24 * k)
sfx.add(bell(1760, 1.4, 0.6), [w["end"] for w in WORDS if w["word"].startswith("future")][0] + 0.05, db(-26))

# ================================================================= pip: last Sunday
theme(SHOT["pip"] + 0.25, 128, "pizz", gain=-19, seed=3)
_undef_end = [w["end"] for w in WORDS if w["word"].startswith("undefeated")][0]
sfx.add(bell(1568, 1.2, 0.5), _undef_end + 0.05, db(-22))                 # the medal glints
sfx.add(bell(2093, 1.0, 0.4), _undef_end + 0.17, db(-26))
mus.add(pad([mtof(x) for x in (65, 69, 72, 77)], 1.3, 0.05, 2400, 3), _undef_end + 0.05, db(-20))

# ================================================================= plan: headband, the red circle, the feather "sword"
sfx.add(snap(4), SHOT["plan"] + 0.75, db(-22))
_plan_end = [w["end"] for w in WORDS if w["word"].startswith("plan")][0]
sfx.add(squeak(0.4, 1500, 2300), _plan_end + 0.02, db(-28), pan=0.4)
sfx.add(glide(1800, 3600, 0.25) * attack_decay(int(0.25 * SR), 0.005, 0.1), c["tickle_day"] + 0.3, db(-32))
theme(SHOT["plan"] + 0.4, 104, "marimba", gain=-20, seed=4)

# ================================================================= days: three tries, nothing (the theme turns minor)
for k, t in enumerate([SHOT["days"]] + c["day_cuts"]):
    sfx.add(thump(0.25, 120, 60, 0.05, k), t - 0.2, db(-24))
clock_ticks(c["day6"], END["days"], sfx, db(-30))
theme(SHOT["days"] + 0.1, 76, "box", gain=-31, minor=True, seed=5)

# ================================================================= stare (wordless): rain, one clock tick, one low note
sfx.add(pen_tick(1), SHOT["stare"] + 0.5, db(-28))
sfx.add(pen_tick(2), SHOT["stare"] + 1.5, db(-28))
mus.add(music_box(mtof(65), 2.2, 9), SHOT["stare"] + 0.9, db(-20))

# ================================================================= brain: order, copy, cerebellum
sfx.add(pan_st(whoosh(0.5, 200, 1800, 701), 0), SHOT["brain"] - 0.55, db(-24))
drone(mus, SHOT["brain"], END["predict"], [50, 57, 62, 65], cutoff=700, gain=-28)
groove(mus, c["move"], END["predict"] - 0.2, 104, ["Dm", "Bb", "C", "Dm"], gain=-15, seed=6, kick_on=False, snaps=False, padv=False, bass=True)
sfx.add(glide(300, 900, 0.9) * attack_decay(int(0.9 * SR), 0.05, 0.6), c["order"], db(-30))
sfx.add(glide(600, 1500, 0.8) * attack_decay(int(0.8 * SR), 0.05, 0.5), c["copy"] + 0.05, db(-30), pan=-0.4)
_cereb_end = [w["end"] for w in WORDS if w["word"].startswith("cerebellum")][0]
sfx.add(blip(900, 1800, 0.1, 11), _cereb_end + 0.02, db(-24))

# ================================================================= predict: the forecast, on schedule, turned down, SPOILER
sfx.add(blip(500, 1200, 0.12, 12), c["predict"] + 0.05, db(-26))
clock_ticks(c["predict"] + 0.4, c["schedule"] + 0.6, sfx, db(-30))
for k in range(5):
    sfx.add(blip(1400 - 200 * k, 1200 - 200 * k, 0.06, 20 + k), c["turns_down"] + 0.12 * k, db(-30), pan=-0.3)
_alert_end = [w["end"] for w in WORDS if w["word"].startswith("alert")][0]
sfx.add(thump(0.3, 200, 60, 0.07, 9), _alert_end + 0.05, db(-14))
silence(mus, [(_alert_end - 0.1, c["knew"] + 0.7)])

# ================================================================= surprise: sneaking up on himself
for k, t in enumerate(np.arange(SHOT["surprise"] + 0.3, c["and_you"], 0.42)):
    mus.add(pizz(mtof([53, 56, 58, 60][k % 4]), 0.4, k), t, db(-17))
sfx.add(glide(1500, 1900, 0.9) * 0.4 * attack_decay(int(0.9 * SR), 0.1, 0.5), SHOT["surprise"] + 0.8, db(-34))
sfx.add(poke(), c["and_you"] - 0.4, db(-22))
_yourself2_end = [w["end"] for w in WORDS if w["block"] == "surprise"][-1]
sfx.add(cricket(2, 3), _yourself2_end + 0.15, db(-21), pan=-0.4)

# ================================================================= rehook1: the idea
_could_end = [w["end"] for w in WORDS if w["word"].startswith("could")][0]
sfx.add(bell(2637, 0.8, 0.3), _could_end + 0.05, db(-24))

# ================================================================= lab: the robot; in sync; the delay; FOOLED
groove(mus, c["london"] + 0.75, END["fool"] - 0.1, 112, ["F", "Dm", "Bb", "C"], gain=-15, seed=7, arp=False)
theme(c["london"] + 0.75 + 4 * 60 / 112, 112, "marimba", gain=-21, seed=8)
theme(SHOT["sync"] + 0.2, 112, "marimba", gain=-22, seed=9)
sfx.add(servo(END["sync"] - c["handle"], 3), c["handle"], db(-42))
for k, t in enumerate(np.arange(c["strokes"], END["fool"], 0.455)):
    sfx.add(swish(0.2, 100 + k), t, db(-36), pan=0.4)
sfx.add(blip(800, 800, 0.08, 31), c["delay"] - 0.05, db(-28))
sfx.add(blip(1200, 1200, 0.08, 32), c["delay"] + 0.07, db(-28))
sfx.add(riser(0.9, 5, 300, 1400), c["comes_back"] - 0.9, db(-40))
_fool_word_end = [w["end"] for w in WORDS if w["word"].startswith("prediction")][1]
crash(mus, _fool_word_end + 0.05, gain=-24)

# ================================================================= machine: the late feather, the realization, the X
for k, t in enumerate(np.arange(SHOT["machine"] + 0.1, c["realize"], 0.13)):
    sfx.add(pen_tick(k), t, db(-30), pan=-0.4)                                      # the crank's ratchet
for k, t in enumerate(np.arange(c["built"], END["machine"], 0.13)):
    sfx.add(pen_tick(50 + k), t, db(-34), pan=-0.4)
theme(SHOT["machine"] + 0.15, 132, "pizz", gain=-16, echo=60 / 132, seed=10)       # the tune and its late echo
sfx.add(scratch(0.3, 4), c["realize"], db(-22))
silence(mus, [(c["realize"], END["machine"])])
_him_end = [w["end"] for w in WORDS if w["block"] == "congrats"][-1]
sfx.add(buzzer(0.4), _him_end + 0.08, db(-28))
for k, t in enumerate(np.arange(c["built"] + 0.4, END["machine"], 0.3)):
    sfx.add(swish(0.18, 140 + k), t, db(-32), pan=0.3)

# ================================================================= press: the spotlight; your own push; two people
_all_end = [w["end"] for w in WORDS if w["block"] == "rehook2"][-1]
sfx.add(pan_st(whoosh(0.4, 900, 3500, 801), 0.5), _all_end + 0.05, db(-24))       # the feather flicked away
drone(mus, SHOT["press"], END["escalate"], [41, 48, 53], cutoff=420, gain=-26)
for k, t in enumerate(np.arange(c["pushes"] - 2.4, c["experiment"] - 0.4, 1.256)):
    sfx.add(thump(0.2, 110, 55, 0.05, 20 + k), t, db(-24))
for k, t in enumerate(np.arange(c["two_people"], END["press"], 0.9)):
    sfx.add(thump(0.2, 130 + 10 * (k % 2), 60, 0.05, 30 + k), t + 0.25, db(-26), pan=-0.5 if k % 2 == 0 else 0.5)

# ================================================================= escalate: every push bigger
for k, t in enumerate(c["turns"]):
    sfx.add(thump(0.25, 100 + 25 * k, 50, 0.05 + 0.01 * k, 40 + k), t, db(-26 + 1.6 * k), pan=0.4 * (-1) ** k)
    mus.add(pizz(mtof(41 + [0, 2, 4, 5, 7, 9, 11][k]), 0.4, k), t, db(-15))
_percent_end = [w["end"] for w in WORDS if w["word"].startswith("percent")][0]
sfx.add(thump(0.35, 220, 60, 0.08, 49), _percent_end + 0.05, db(-15))

# ================================================================= fight: shoves; the painting
groove(mus, SHOT["fight"] + 0.2, c["history"] - 0.1, 140, ["F", "C", "Bb", "C"], gain=-15, seed=12, arp=False, padv=False)
for k, t in enumerate(c["shoves"]):
    if t < c["history"]:
        sfx.add(thump(0.18, 180, 70, 0.04, 60 + k), t + 0.05, db(-27 + 0.8 * k), pan=0.3 * (-1) ** k)
_hist_end = [w["end"] for w in WORDS if w["word"].startswith("history")][0]
silence(mus, [(c["history"] - 0.1, END["fight"])])
mus.add(pad([mtof(x) for x in (53, 57, 60, 65, 69)], 1.6, 0.04, 2200, 5), _hist_end + 0.05, db(-10))
sfx.add(crackle(int(1.4 * SR), 30, 7, 1500, 6000), c["history"], db(-34))

# ================================================================= rats: the tickle, the chirps (pitched down so we hear them), the jump
groove(mus, SHOT["rats"] + 0.3, END["rats"] - 0.1, 120, ["F", "Bb", "F", "C"], gain=-16, seed=13, kick_on=False, padv=False)
for k, t in enumerate(np.arange(c["chirps"] + 0.1, END["rats"], 0.36)):
    if c["sound"] - 0.05 < t < c["sound"] + 0.6:
        continue
    sfx.add(glide(2400, 3600, 0.07) * attack_decay(int(0.07 * SR), 0.004, 0.03), t, db(-30), pan=0.2)
for k in range(3):
    sfx.add(springs(10 + k, 0.4), c["chase"] + 0.3 + k * 0.62, db(-30))

# ================================================================= play: the photos, warm
theme([w["end"] for w in WORDS if w["block"] == "play" and w["word"].startswith("for")][0] + 0.1, 84, "piano", gain=-20, seed=14)
mus.add(pad([mtof(x) for x in (53, 60, 65, 69)], END["play"] - SHOT["play"], 1.2, 1600, 15), SHOT["play"], db(-23))
_bond_end = [w["end"] for w in WORDS if w["word"].startswith("bond")][0]
for k in range(3):
    sfx.add(bell(1760 + 220 * k, 0.8, 0.3), _bond_end + 0.05 + 0.12 * k, db(-30), pan=-0.4 + 0.4 * k)

# ================================================================= turn: alone; the feather put down
mus.add(pad([mtof(x) for x in (50, 57, 62, 65)], c["there"] - SHOT["turn"], 1.0, 1100, 16), SHOT["turn"], db(-25))
theme(c["bug"] + 0.35, 66, "piano", gain=-25, notes=THEME[:6], seed=15)

# ================================================================= sunday: SILENCE, then the doorbell and the door
sfx.add(doorbell(), c["bell"], db(-21))
sfx.add(creak(0.9, 3, 90, 200), c["door"], db(-28))
for k, t in enumerate(np.arange(c["door"] + 0.5, END["sunday"], 1.3)):
    sfx.add(tweet(20 + k, 3600), t, db(-32), pan=0.6)
sfx.add(snap(9), c["quit"] + 0.15, db(-30))
for k, t in enumerate(np.arange(c["quit"] + 0.3, END["sunday"], 0.15)):
    sfx.add(thump(0.1, 160, 90, 0.03, 80 + k), t, db(-42), pan=0.5)                # her running feet

# ================================================================= end: the laugh, the feather drifting down, the resolution
for k, t in enumerate(np.arange(SHOT["end"], c["final"], 0.27)):
    sfx.add(swish(0.18, 200 + k), t, db(-36), pan=0.2)
mus.add(pad([mtof(x) for x in (53, 60, 65, 69, 72)], DUR - SHOT["end"], 1.5, 1200, 17), SHOT["end"] + 0.2, db(-27))
theme(c["final"] + 0.3, 92, "box", gain=-16, notes=THEME_END, seed=17)             # resolves on F as the feather lands
mus.add(pad([mtof(x) for x in (41, 53, 57, 60, 65)], DUR - c["final"] - 2.9, 1.2, 1100, 18), c["final"] + 2.9, db(-27))

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-22))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-24))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-18))
        sfx.add(pan_st(bell(1760, 0.6, 0.25), 0), c["sub_tap"] + 0.05, db(-30))

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -20.0, "sfx": -7.0})
