"""What If You Hold Your Breath TOO Long? (Second by Second) (long-form): sound design, score and mix, cue-locked to
timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The score has ONE theme, a breath that cannot let go: a rising arpeggio D F# A, then a long E above it that should fall
to D and never does (a suspension: a held breath). It opens on a music box and is cut off on "now"; over the real-time
seconds it is a high glass tone held over a low drone that turns more dissonant as the exhaust piles up, with a tick on
every real second; it bounces on pizzicato for Pip's nose and the viewer's breath; turns jittery for the panting trick
and is stopped dead by the whistle; goes glassy and slow under the cold water and the seal; plays on an old upright
piano for 1960s London; swells wide for the records and slow and low for the whale; drops out for the blackout; and
the candles of the breath count each light on one of its notes. Only on the final image, when Pip blows out her
candles, does the E fall to D and the exhale line play out.
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


BPM = 120
BEAT = 60.0 / BPM
T0 = c["now"]                                          # the score's grid starts on "now": the ticks sit on its beats
on_beat = lambda t: T0 + round((t - T0) / BEAT) * BEAT  # noqa: E731

# ---------------------------------------------------------------- the theme
RISE = [(62, 1), (66, 1), (69, 1)]                     # D F# A: the breath in
HELD = RISE + [(76, 6)]                                # ...and the E it cannot let go of
RESOLVE = RISE + [(76, 3), (74, 2), (69, 1), (66, 1), (62, 5)]   # E falls to D, the exhale line


def inst(name, f, ln, seed):
    if name == "box":
        return music_box(f, max(1.4, ln), seed)
    if name == "marimba":
        return marimba(f, 0.9, seed)
    if name == "pizz":
        return pizz(f, 0.5, seed)
    if name == "piano":
        return piano(f, max(0.9, ln), seed)
    if name == "glass":                                # a sine with a slow swell: a glass harmonica
        n = int(max(0.6, ln) * SR)
        e = np.minimum(1, ar(n) / 0.12) * np.exp(-ar(n) / max(0.6, ln * 0.7))
        return fade(np.sin(2 * np.pi * f * ar(n)) * e + 0.3 * np.sin(4 * np.pi * f * ar(n)) * e ** 2, 0.002, 0.15)
    raise ValueError(name)


def theme(t0, notes, bpm=96, name="box", gain=-16.0, tr=0, pan=0.0, upto=None, seed=0):
    beat = 60.0 / bpm
    t = t0
    for k, (m, d) in enumerate(notes):
        if upto is not None and t >= upto:
            break
        ln = d * beat + 0.4
        if upto is not None:
            ln = min(ln, upto - t + 0.05)
        mus.add(inst(name, mtof(m + tr), ln, seed + k), t, db(gain), pan=pan)
        t += d * beat
    return t


def held_tone(t0, t1, m, gain, seed=0, vib=0.004):
    """a held glass tone that swells in and can be cut dead at t1"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    f = mtof(m) * (1 + vib * np.sin(2 * np.pi * 5.2 * ar(n)))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    e = np.minimum(1, ar(n) / 0.8)
    mus.add(pan_st(fade(y * e, 0.01, 0.03), 0), t0, db(gain))


# ---------------------------------------------------------------- sounds made for this film
def pea_whistle(dur=0.85, seed=0, f0=2950.0, gain=1.0):
    """a referee's pea whistle: a shrill tone warbled by the pea (~38 Hz), breath on top"""
    n = int(dur * SR)
    t = ar(n)
    warble = 1 + 0.035 * np.sin(2 * np.pi * 38 * t) + 0.01 * np.sin(2 * np.pi * 61 * t)
    f = f0 * warble * (1 + 0.02 * np.minimum(1, t / 0.05))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.35 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    am = 0.75 + 0.25 * np.sign(np.sin(2 * np.pi * 38 * t))
    env = np.minimum(1, t / 0.02) * np.minimum(1, (dur - t) / 0.08)
    y = y * am * env + 0.15 * filt(white(n, seed), "bandpass", [1800, 6000]) * env
    return fade(y / (np.abs(y).max() + 1e-9) * gain, 0.002, 0.02)


def big_exhale(dur=0.55, seed=0):
    """PAAAH: a held breath let go all at once (lips burst, then a rush of air)"""
    n = int(dur * SR)
    t = ar(n)
    rush = filt(white(n, seed), "bandpass", [240, 1900]) * np.exp(-t / 0.22) * np.minimum(1, t / 0.008)
    lips = thump(0.12, 180, 70, 0.03, seed) * 0.8
    y = rush
    y[: len(lips)] += lips
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.05)


def inhale(dur=0.9, seed=0, edges=False):
    n = int(dur * SR)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.4 * np.linspace(0.6, 1, n)
    y = filt(white(n, seed), "bandpass", [600, 3600] if not edges else [5200, 9000]) * env
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def nose_whistle(dur=0.5, seed=0):
    """a tiny whistle through a nostril"""
    n = int(dur * SR)
    t = ar(n)
    f = 2300 + 260 * np.sin(np.pi * t / dur)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 2
    y += 0.4 * filt(white(n, seed), "bandpass", [2000, 5000]) * np.sin(np.pi * t / dur)
    return fade(y / (np.abs(y).max() + 1e-9), 0.005, 0.03)


def candle_out(seed=0):
    """fwip: a flame blown out"""
    n = int(0.25 * SR)
    y = filt(white(n, seed), "bandpass", [500, 4000]) * attack_decay(n, 0.01, 0.06)
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.02)


def match_strike(seed=0):
    """a match: the scratch, the flare"""
    n = int(0.42 * SR)
    t = ar(n)
    scr = filt(white(n, seed), "bandpass", [1500, 7000]) * np.where(t < 0.12, 1, 0) * np.minimum(1, t / 0.005)
    flare = filt(white(n, seed + 1), "lowpass", 2200) * attack_decay(n, 0.13, 0.12) * (t > 0.11)
    y = scr * 0.7 + flare
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.04)


def monitor_beep(f=1250.0):
    n = int(0.11 * SR)
    return fade(np.sin(2 * np.pi * f * ar(n)) * np.minimum(1, ar(n) / 0.004), 0.002, 0.02)


def soft_tick(seed=0, bright=1.0):
    n = int(0.05 * SR)
    y = filt(white(n, seed), "bandpass", [2500, 7000]) * np.exp(-ar(n) / 0.006) * bright
    y += 0.5 * np.sin(2 * np.pi * 1800 * ar(n)) * np.exp(-ar(n) / 0.01)
    return fade(y, 0.0005, 0.01)


def knife_clunk(seed=0):
    y = thump(0.3, 220, 60, 0.07, seed)
    y[: int(0.05 * SR)] += 0.6 * crack(0.05, seed + 3)
    return y / (np.abs(y).max() + 1e-9)


def whale_moan(dur=2.4, f0=180.0, f1=95.0, seed=0):
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (f1 / f0) ** (t / dur) * (1 + 0.02 * np.sin(2 * np.pi * 3 * t))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    y = filt(y, "lowpass", 900) * np.sin(np.pi * t / dur) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.02, 0.2)


def ventilator(n, rate=14, t0=0.0):
    """a 1960s ventilator: a bellows hiss in and out at `rate` a minute"""
    t = ar(n) + t0
    ph = (t * rate / 60) % 1
    env = np.where(ph < 0.45, np.sin(np.pi * ph / 0.45), 0.4 * np.sin(np.pi * (ph - 0.45) / 0.55))
    y = filt(white(n, 77), "bandpass", [400, 2400]) * env ** 2
    return y


# ================================================================= ambience (one bed per world, gated to its shots)
kitchen_day = shots("hook", "ten", "bet", "tense", "thirty", "shake", "out", "smoke", "pip", "breathe", "round2", "whistle",
                    "sixty", "splat", "ninety", "hurt", "best", "cake", "human", "toolong")
kitchen_dusk = shots("rules", "land", "count", "candles", "counted", "fight", "turn", "button", "final")
amb.x += pan_st(filt(brown(N, 4), "lowpass", 170), 0) * 0.14 * gate(N, kitchen_day + kitchen_dusk, 0.25)
amb.x += pan_st(0.025 * np.sin(2 * np.pi * 60 * tt) + 0.012 * np.sin(2 * np.pi * 120 * tt), 0.4) * gate(N, kitchen_day, 0.3)   # the fridge
for k, t in enumerate(np.arange(SHOT["hook"] + 3.0, END["breathe"], 3.7)):
    if not any(a - 0.3 < t < b for a, b in shots("tense", "shake", "smoke")):
        sfx.add(tweet(k, 3200 + 280 * (k % 3)), t, db(-38), pan=0.7)
crickets(SHOT["land"], END["final"], amb, 0.05, seed=3)
body = shots("blood", "twenty", "alarm", "sensor", "belly", "spleen", "ninety", "land", "fight")
amb.x += pan_st(filt(pink(N, 9), "bandpass", (110, 420)) * 0.35, 0) * gate(N, body, 0.3)
stage = shots("result", "tank", "early", "dont", "dive", "six", "drain")
amb.x += pan_st(filt(brown(N, 6), "lowpass", 90) * 0.5, 0) * gate(N, stage, 0.2)
sea = shots("seal", "whale", "whale2", "dark")
amb.x += pan_st(filt(brown(N, 11), "lowpass", 300) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.12 * tt)), 0) * 0.55 * gate(N, sea, 0.4)
pool = shots("glimpse", "record", "oxygen", "water")
amb.x += pan_st(filt(pink(N, 12), "bandpass", (200, 900)) * 0.12 + filt(brown(N, 13), "lowpass", 160) * 0.2, 0) * gate(N, pool, 0.3)
lab = shots("proof", "proof2")
amb.x += projector(N, 3) * gate(N, lab, 0.3) * 0.16
vent = ventilator(N, 14)
vent_gate = gate(N, [(SHOT["proof"], c["proof2"] + 0.2), (c["doctor"] + 0.1, END["proof2"])], 0.08)
bed.add(pan_st(vent * vent_gate, -0.2), 0, db(-24))
space = shots("sub")
amb.x += pan_st(filt(pink(N, 21), "highpass", 4000) * 0.03, 0) * gate(N, space, 0.5)

# ================================================================= whooshes into the cuts that move (not the comedy cuts)
for s in TL["shots"][1:]:
    if s["id"] in ("ten", "smoke", "whistle", "splat", "cake", "off", "final", "sub", "candles", "dark", "tense", "shake", "out", "rules"):
        continue
    sfx.add(pan_st(whoosh(0.32, 500, 2800, 600 + int(s["start"])), 0), s["start"] - 0.28, db(-30))

# ================================================================= the clock: a tick on every real second; flips on jumps
for k in range(0, int(c["tickStop"] - c["now"]) + 1):
    t = c["now"] + k
    if t > c["tickStop"] + 0.05:
        break
    loud = k in (10, 20, 30, 45)
    sfx.add(soft_tick(k, 1.4 if loud else 1.0), t, db(-25 if loud else -29), pan=-0.55)
for k, (t, *_r) in enumerate(c["clock"][2:], 2):
    sfx.add(pan_st(blip(1400, 900, 0.05, 30 + k, 0.02), -0.6), t, db(-25))
    sfx.add(thump(0.18, 160, 70, 0.04, k), t + 0.02, db(-25))
# the countdown of the breath count: soft ticks
for k in range(15):
    sfx.add(soft_tick(200 + k, 0.8), c["countFrom"] + k, db(-34), pan=-0.55)

# ================================================================= ACT 1
# the hook: a big breath in, cheeks closing on "now"; the theme rises and is cut on "now"
sfx.add(inhale(1.45, 1, edges=True), 0.02, db(-22))                     # the breath in: only its top under the words
sfx.add(inhale(0.42, 2), 0.82, db(-21))                                 # ...and whole in the gap after "breath."
sfx.add(pan_st(thump(0.12, 300, 120, 0.03, 2), 0), c["now"] - 0.02, db(-24))
theme(0.05, RISE, bpm=150, name="box", gain=-23, upto=c["now"] + 0.15, seed=1)
# the glimpse: a digital timer beeping
for k in range(4):
    sfx.add(monitor_beep(2100), SHOT["glimpse"] + 0.3 + 0.45 * k, db(-31))
# "Loser gets no cake": a sad slide after "cake."
we = next(w["end"] for w in WORDS if w["word"] == "cake.")
sfx.add(pan_st(slide_whistle(0.45, 900, 380), 0.2), we + 0.05, db(-27))
# the dive into his chest: a whoosh down and a bubble
sfx.add(pan_st(whoosh(1.4, 300, 3000, 41), 0), SHOT["blood"] + 0.9, db(-22))
sfx.add(bloop(240, 70, 0.5), SHOT["blood"] + 2.35, db(-22))
# inside: a heartbeat under the chest shots
for t in np.arange(SHOT["blood"] + 1.5, SHOT["tense"], 60 / 72):
    bed.add(pan_st(heartbeat(int(t * 10), 0.7), 0), t, db(-20))
# the oxygen sweep: a shimmer; the exhaust appearing: bloops; the lock
sfx.add(pan_st(riser(1.0, 3, 900, 4200), 0.3), c["oxy"] - 0.6, db(-31))
for k, t in enumerate(np.arange(c["exhaust"], c["nowhere"] + 0.8, 0.42)):
    bed.add(pan_st(bloop(300 + 40 * (k % 4), 120, 0.25), (-1) ** k * 0.4), t, db(-33))
sfx.add(pan_st(knife_clunk(5) * 0.5 + 0, 0.5), END["twenty"] - 0.25, db(-24))
# the tense wordless stretch: heartbeat louder and faster
for t in np.arange(SHOT["tense"], SHOT["thirty"] + 0.4, 60 / 96):
    bed.add(pan_st(heartbeat(int(t * 10) + 3, 1.0), 0), t, db(-16))
# the burn: a low sizzle
bed.add(pan_st(filt(white(int(2.4 * SR), 8), "bandpass", [3000, 8000]) * attack_decay(int(2.4 * SR), 0.4, 0.9), 0), c["burn"] - 0.2, db(-30))
# the lemon: a squeaky pop; the sensor's lick; the alarm (a bell, quiet under the words, loud in the gap after)
sfx.add(pan_st(blip(900, 1800, 0.12, 9, 0.05), 0.3), c["sour"] + 0.5, db(-24))
sfx.add(pan_st(slurp(0.35, 4), 0), c["tastes"] + 0.05, db(-30))
sfx.add(pan_st(alarm_bell(1.4, 3, 30.0, 2300.0), 0.1), c["pulls"] + 0.25, db(-25))
ae = next(w["end"] for w in WORDS if w["word"] == "alarm." and w["block"] == "alarm")
sfx.add(pan_st(alarm_bell(c["out"] - ae - 0.2, 4, 30.0, 2300.0), 0.1), ae + 0.1, db(-19))
for t in np.arange(ae + 0.1, c["out"] - 0.1, 60 / 140):
    bed.add(pan_st(heartbeat(int(t * 10) + 7, 1.0), 0), t, db(-14))
# the blast: PAAAH, seven flames blown out, the hat hops
sfx.add(pan_st(big_exhale(0.5, 3), 0), c["out"], db(-6))
for i in range(7):
    sfx.add(pan_st(candle_out(30 + i), 0.15 + 0.06 * i), c["out"] + 0.12 + 0.03 * i, db(-22))
sfx.add(pan_st(springs(2, 0.5), -0.2), c["out"] + 0.15, db(-30))
# the smoke beat: almost nothing, a faint hiss of the wicks
bed.add(pan_st(hiss(1.6, 5, 0.6), 0.2), SHOT["smoke"] + 0.1, db(-36))
# Pip's nose: a tiny whistle after "nose."
ne = next(w["end"] for w in WORDS if w["word"] == "nose." and w["block"] == "nose2")
sfx.add(pan_st(nose_whistle(0.45, 6), 0.4), ne + 0.08, db(-15))
# "Breathe.": the viewer's big breath, and the release chord
sfx.add(inhale(0.9, 9), c["breathe"] + 0.45, db(-22))
# the ruler: pops for HIM and YOU; the gauges: the stamp, the bell, the needle
sfx.add(pan_st(blip(600, 1200, 0.08, 11, 0.03), 0), SHOT["result"] + 0.5, db(-26))
sfx.add(pan_st(blip(800, 1500, 0.08, 12, 0.03), 0.3), SHOT["result"] + 0.9, db(-27))
sfx.add(pan_st(thump(0.22, 200, 70, 0.05, 13), 0), c["ninetyPct"] + 0.05, db(-20))
sfx.add(pan_st(alarm_bell(1.6, 5, 30.0, 2300.0), 0.3), SHOT["tank"] + 1.3, db(-29))
sfx.add(pan_st(slide_whistle(0.5, 600, 1800), 0.4), c["faster"] - 0.1, db(-30))
for k, t in enumerate(np.arange(c["rings"], c["rings"] + 1.4, 0.09)):                 # the exhaust needle racing
    sfx.add(soft_tick(70 + k, 1.1), t, db(-31), pan=0.45)
for k in range(3):                                                                       # the oxygen, barely moving
    sfx.add(pan_st(blip(520, 500, 0.12, 80 + k, 0.04), -0.4), c["faster"] + 0.2 + 0.9 * k, db(-30))

# ================================================================= ROUND TWO
sfx.add(pan_st(blip(500, 300, 0.06, 15, 0.02), -0.2), c["round2"] + 0.4, db(-27))       # goggles snap
for k, t in enumerate(np.arange(c["pant0"], c["whistleT"] - 0.1, 0.24)):              # panting (edges only under the words)
    sfx.add(inhale(0.18, 40 + k, edges=True), t, db(-26))
sfx.add(pan_st(pea_whistle(0.85, 2), 0.3), c["whistleT"], db(-16))
sfx.add(pan_st(scratch(0.3, 3), 0), c["whistleT"] - 0.05, db(-24))
sfx.add(pan_st(buzzer(0.35), 0), c["noadd"] + 0.6, db(-34))
sfx.add(pan_st(slide_whistle(0.9, 1500, 300), -0.3), c["blows"] + 0.2, db(-30))
sfx.add(pan_st(thump(1.0, 90, 34, 0.4, 17), 0), c["toolate"] + 0.45, db(-12))
for k, t in enumerate((c["late"] + 0.25, c["late"] + 1.6)):                          # the alarm dozing: soft snores
    sfx.add(pan_st(filt(brown(int(0.55 * SR), 60 + k), "lowpass", 260) * np.sin(np.pi * ar(int(0.55 * SR)) / 0.55) * 0.9, 0.2), t, db(-27))

# ================================================================= ACT 2
# the belly test: a long breath in, then out
sfx.add(inhale(1.4, 19), c["breathein"] + 0.15, db(-27))
sfx.add(pan_st(blip(700, 1300, 0.08, 20, 0.01), 0.3), c["diaph"] + 0.05, db(-22))
sfx.add(pan_st(blip(300, 520, 0.1, 21, 0.01), 0), c["pushout"] + 0.05, db(-21))
sfx.add(pan_st(thump(0.3, 260, 120, 0.08, 22), 0), c["dome"] + 0.1, db(-22))            # the dome glows
sfx.add(pan_st(thump(0.12, 420, 200, 0.03, 23), 0.1), c["bellyIn"] + 0.3, db(-22))      # the hand lands on the belly
sfx.add(pan_st(bell(2093, 0.7, 0.3), 0.3), c["remember"] - 0.05, db(-31))
# sixty: the stopwatch click and a little ding; the cloth's drips
sfx.add(pan_st(soft_tick(50, 1.6), 0.4), c["sixty"] - 0.1, db(-22))
sfx.add(pan_st(bell(1568, 0.5, 0.25), 0.3), c["record"] + 0.3, db(-28))
for k in range(5):
    bed.add(pan_st(drip(k, 1400 + 120 * k), 0.4), c["clothUp"] + 0.4 + 0.3 * k, db(-30))
# SPLAT
sp = filt(white(int(0.3 * SR), 3), "lowpass", 3000) * attack_decay(int(0.3 * SR), 0.003, 0.06)
sfx.add(pan_st(sp / np.abs(sp).max(), 0), c["splat"], db(-8))
sfx.add(squelch(0.4, 2), c["splat"] + 0.04, db(-18))
# the dive switch: a heavy clunk and sparks; the monitor beeping, slowing
sfx.add(pan_st(knife_clunk(8), -0.2), c["switchw"] + 0.35, db(-12))
sfx.add(pan_st(crackle(int(0.4 * SR), 900, 4), -0.2), c["switchw"] + 0.4, db(-30))
bt = c["dive"] + 0.5
while bt < END["dive"] - 0.1:
    rate = 78 - 8 * min(1, max(0, (bt - (c["slows"] - 0.3)) / 2.3))
    bed.add(pan_st(monitor_beep(2600), 0.4), bt, db(-31))
    bt += 60 / rate
# the seal: bubbles and a slow, deep heartbeat
for k in range(8):
    bed.add(pan_st(bloop(400 + 60 * (k % 3), 180, 0.2), 0.5), SHOT["seal"] + 0.3 + 0.4 * k, db(-30))
for t in np.arange(SHOT["seal"] + 0.3, END["seal"], 60 / 26):
    bed.add(pan_st(heartbeat(int(t * 10) + 9, 1.0), 0), t, db(-14))
# the spleen: a squelchy squeeze and popping cells
sfx.add(squelch(0.5, 6), c["squeezes"] + 0.1, db(-22))
for k in range(9):
    bed.add(pan_st(bloop(520 + 50 * (k % 4), 260, 0.15), 0.3 * (-1) ** k), c["squeezes"] + 0.5 + 0.22 * k, db(-30))
sfx.add(heartbeat(41, 1.0), c["ninety"] + 0.55, db(-22))
sfx.add(heartbeat(42, 1.1), c["herecomes"] + 0.15, db(-21))
# the kicks: each a hard low thud with a hiccup-ish squeak on top (edges only when a word is near)
for k, t in enumerate(c["kicks"]):
    sfx.add(pan_st(thump(0.25, 140, 48, 0.07, 60 + k), 0), t, db(-14))
    bed.add(pan_st(filt(white(int(0.06 * SR), 61 + k), "highpass", 5200) * np.exp(-ar(int(0.06 * SR)) / 0.015), 0), t, db(-26))
# 1960s London: the drip bag pops in; the machine stops (a click), the wall clock races, the doctor; ARGUED
sfx.add(pan_st(blip(600, 300, 0.08, 70, 0.03), -0.4), c["drug"] - 0.2, db(-28))
sfx.add(pan_st(knife_clunk(71) * 0.6, -0.1), c["proof2"] + 0.2, db(-20))
sfx.add(pan_st(knife_clunk(73) * 0.6, -0.2), c["doctor"] + 0.1, db(-21))                # back ON
for k, t in enumerate(np.arange(c["fourmin"] - 0.6, c["calm"] + 0.4, 0.09)):
    sfx.add(soft_tick(80 + k, 0.7), t, db(-32), pan=0.3)
sfx.add(pan_st(thump(0.22, 220, 80, 0.05, 72), 0), c["argue"] + 0.15, db(-20))
bwomp(mus, c["argue"] + 0.9, m=36, gain=-16)
# his best: PAAAH, the cloth whooshes off, a crash; the bars rise
sfx.add(pan_st(big_exhale(0.5, 21), 0), c["best"], db(-7))
sfx.add(pan_st(whoosh(0.5, 400, 2400, 22), 0.4), c["best"] + 0.1, db(-22))
sfx.add(pan_st(riser(1.1, 23, 300, 1800), 0), c["nearly"] - 0.4, db(-28))
# the two tries side by side: TRY 1 pops up, TRY 2 grows past it, 1:52 lands
sfx.add(pan_st(blip(500, 900, 0.08, 24, 0.01), -0.5), c["nearly"] - 0.15, db(-20))
sfx.add(pan_st(slide_whistle(0.6, 420, 1400), -0.3), c["nearly"] - 0.1, db(-26))
sfx.add(pan_st(bell(1568, 0.7, 0.3), -0.3), c["nearly"] + 0.5, db(-23))
# the cake: a chomp after "cake."
ce = next(w["end"] for w in WORDS if w["word"] == "cake." and w["block"] == "cake")
sfx.add(chomp(4), ce + 0.15, db(-10))
sfx.add(chomp(5), ce + 0.55, db(-13))

# ================================================================= ACT 3
sfx.add(pan_st(blip(700, 1400, 0.08, 90, 0.03), 0.3), SHOT["human"] + 0.5, db(-27))             # the thought bubble
# the record timer racing: beeps that speed up, then hold
for k, t in enumerate(np.arange(c["official"], c["thirtyfive"] + 0.6, 0.16)):
    sfx.add(soft_tick(300 + k, 0.9), t, db(-33), pan=0.2)
sfx.add(pan_st(bell(1760, 0.8, 0.4), 0.2), c["thirtyfive"] + 0.65, db(-27))
sfx.add(pan_st(gas_hiss(1.2, 3), 0.6), c["pure"] - 0.1, db(-28))
for k, t in enumerate(np.arange(c["croatia"] - 0.4, c["t29"] + 0.8, 0.11)):
    sfx.add(soft_tick(400 + k, 0.9), t, db(-33), pan=0.2)
for i in range(7):
    sfx.add(pan_st(blip(700 + 80 * i, 1400 + 80 * i, 0.07, 100 + i, 0.03), -0.6 + 0.2 * i), c["six"] + 0.15 + i * 0.32 + (0.35 if i == 6 else 0), db(-27))
# the whale: a long low moan, then the dark
sfx.add(pan_st(whale_moan(2.6, 190, 96, 2), -0.3), SHOT["whale"] + 0.6, db(-15))
sfx.add(pan_st(whale_moan(2.2, 150, 80, 3), 0.3), SHOT["dark"] - 0.2, db(-17))
sfx.add(pan_st(bell(2637, 1.2, 0.5), 0.4), c["how"] + 0.2, db(-30))
for k, t in enumerate(np.arange(SHOT["whale"] + 0.2, END["dark"], 1.9)):               # sonar pings, fainter as it goes down
    sfx.add(pan_st(bell(1318, 1.4, 0.6) * 0.6, 0.5 - 0.15 * k), t, db(-30 - 1.5 * k))
for k, t in enumerate(np.arange(c["hours"] - 0.05, c["pay_342"] - 0.05, 0.1)):         # its time racing up
    sfx.add(soft_tick(500 + k, 0.9), t, db(-33), pan=0.2)
m342 = next(w["end"] for w in WORDS if w["word"] == "minutes." and w["start"] >= c["pay_342"] - 0.01)
sfx.add(pan_st(bell(1760, 0.8, 0.4), 0.2), m342 + 0.03, db(-28))                        # after the word, not on it
# too long: the whistle again, short; the tank draining; the power going down; silence
sfx.add(pan_st(pea_whistle(0.45, 9, 2950, 0.8), 0.3), c["remember2"] + 0.85, db(-12))
for k, t in enumerate(np.arange(c["fastfirst"], c["fastfirst"] + 1.1, 0.22)):
    sfx.add(inhale(0.16, 140 + k, edges=True), t, db(-27))
sfx.add(gurgle(2.6, 3), c["runout"] - 0.2, db(-30))
dn = slide_whistle(1.1, 900, 120)
sfx.add(pan_st(dn, 0), c["off"] - 0.05, db(-24))
# the water: three low knocks for the three rules
for i in range(9):   # the bubble trail: each one reaches the surface with a soft blub, further and further apart
    tb = c["water"] + 0.05 + 0.22 * i + 0.025 * i * i + 1.53
    if tb < SHOT["rules"] - 0.05:
        sfx.add(pan_st(drip(240 + i, 520 - 18 * i), -0.35), tb, db(-29 - 0.6 * i))
for i, t in enumerate(c["tweets"]):                                                      # Pip's whistle: a short blast before each rule
    sfx.add(pan_st(pea_whistle(0.22, 130 + i, 3050, 0.8), -0.2), t, db(-20))
for i, k in enumerate(("never1", "never2", "never3")):
    sfx.add(pan_st(thump(0.3, 120, 50, 0.08, 120 + i), 0), c[k] + 0.05, db(-20))
# on land: the lifeguard's whistle (soft) and the breath in
sfx.add(pan_st(pea_whistle(0.35, 11, 2700, 0.6), 0.3), c["takes"] + 0.45, db(-21))
sfx.add(inhale(1.0, 23), c["breathesfor"] + 0.6, db(-22))
sfx.add(pan_st(blip(600, 1300, 0.09, 150, 0.03), 0.4), c["fifteen"] + 0.02, db(-26))
sfx.add(pan_st(whoosh(0.45, 2400, 600, 151), -0.5), c["cnow"] - 0.55, db(-30))
sfx.add(pan_st(soft_tick(152, 1.6), -0.5), next(w["end"] for w in WORDS if w["word"] == "seconds." and w["start"] > c["fifteen"]) + 0.1, db(-22))   # the stopwatch, ready
sfx.add(inhale(0.7, 153), next(w["end"] for w in WORDS if w["word"].startswith("Starting")) + 0.08, db(-26))           # he breathes in, ready
# the breath count: his breaths, the matches; each candle lights on a note of the theme
for k, t in enumerate(c["breaths"]):
    sfx.add(inhale(1.4, 160 + k), t, db(-30))
NOTES = [62, 66, 69, 74, 76, 78, 81]
for i, t in enumerate(c["lights"]):
    sfx.add(pan_st(match_strike(170 + i), 0.15), t - 0.2, db(-25))
    mus.add(inst("box", mtof(NOTES[i]), 1.6, 180 + i), t + 0.05, db(-15), pan=-0.3 + 0.1 * i)
sfx.add(pan_st(bell(1568, 0.9, 0.4), 0.3), c["fourw"] + 0.05, db(-27))
for i in range(4):
    sfx.add(pan_st(filt(white(int(0.16 * SR), 210 + i), "bandpass", (900, 3000)) * np.exp(-ar(int(0.16 * SR)) / 0.05), 0.2 + 0.1 * i), c["fourw"] + 0.3 + 0.16 * i, db(-31))
fe = next(w["end"] for w in WORDS if w["word"] == "fighting?")
sfx.add(pan_st(alarm_bell(0.22, 7, 28.0, 2100.0), 0.2), fe + 0.02, db(-29))
sfx.add(pan_st(chime(1174.7, 1.2), 0.1), c["lifeB"] - 0.12, db(-30))
for k, t in enumerate((c["lifeB"] + 0.6, c["lifeB"] + 2.2)):
    sfx.add(inhale(1.2, 220 + k), t, db(-31))
pb_end = next(w["end"] for w in WORDS if w["word"].startswith("breath") and w["start"] > c["pipBreath"])
sfx.add(pan_st(inhale(0.9, 230), 0.4), pb_end + 0.05, db(-25))                          # Pip's big breath, after the word
# the final blow: Pip's breath, seven flames out
sfx.add(pan_st(big_exhale(0.7, 33), 0.2), c["blow"] - 0.05, db(-12))
for i in range(7):
    sfx.add(pan_st(candle_out(190 + i), -0.2 + 0.07 * i), c["blow"] + 0.15 + 0.05 * i, db(-24))
# the subscribe cue: pop, click, bell (quiet: it sits under the words)
sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-26))
sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-22))
sfx.add(pan_st(bell(1760, 1.2, 0.5), 0), c["sub_tap"] + 0.08, db(-28))

# ================================================================= the score, section by section
# 0: the hook's music box is in the theme() above. 1: the held breath (now -> the blast): the held E over a low D drone
held_tone(c["now"] + 0.4, c["out"] - 0.02, 76, -30, seed=1)
drone(mus, c["now"] + 0.3, c["twenty"], [38, 50], cutoff=320, gain=-22, seed=2)
drone(mus, c["twenty"], c["thirty"], [38, 50, 57], cutoff=420, gain=-21, seed=3)
held_tone(c["twenty"] + 0.3, c["out"] - 0.02, 77, -37, seed=2)                       # F against the E: it starts to ache
drone(mus, c["thirty"], c["out"] - 0.02, [38, 50, 56], cutoff=420, gain=-21, seed=4)  # the tritone: the alarm
held_tone(c["sensor"], c["out"] - 0.02, 70, -36, seed=3)
# 2: after the blast: silence for the smoke, then pizzicato for Pip's nose and the viewer's breath
theme(c["pipq"] - 0.05, RISE + [(74, 2)], bpm=150, name="pizz", gain=-15, upto=c["nose2"] - 0.1, seed=5)
mus.add(pad([mtof(62), mtof(66), mtof(69), mtof(74)], 3.2, 0.25, 1600, 6), c["breathe"] + 0.2, db(-17))
# 3: the result and the gauges: a curious marimba groove, half time
groove(mus, on_beat(c["result"]), c["round2"] - 0.1, BPM, ["D", "Bm", "G", "A"], gain=-6, seed=7, kick_on=False, snaps=False, half=True, cutoff=1200)
# 4: round two: jittery fast pizzicato, cut dead by the whistle
groove(mus, on_beat(c["round2"]), c["whistleT"] - 0.02, 150, ["D", "D", "G", "A"], gain=-12, seed=8, kick_on=True, snaps=False, arp=True, padv=False, sixteen=True)
# 5: "too late": a low ominous drone
drone(mus, c["right"] + 0.2, c["belly"], [38, 45, 51], cutoff=380, gain=-20, seed=9)
# 6: the slow way: a calm pad that breathes in and out
for k, t in enumerate(np.arange(c["belly"], c["sixty"] - 0.5, 4.0)):
    mus.add(pad([mtof(62), mtof(69), mtof(76)], 4.2, 1.6, 900, 10 + k), t, db(-19))
# 7: his second try: glassy and slow under the cold water and the seal
theme(c["sixty"] + 0.2, HELD, bpm=70, name="glass", gain=-23, upto=c["splat"] - 0.05, seed=11)
theme(c["dive"] + 0.3, HELD, bpm=56, name="glass", gain=-24, tr=-12, upto=SHOT["spleen"], seed=12)
drone(mus, SHOT["seal"], SHOT["ninety"], [38, 45, 50], cutoff=300, gain=-21, seed=13)
theme(c["spleen"] + 0.2, RISE + [(76, 4)], bpm=110, name="marimba", gain=-16, upto=SHOT["ninety"], seed=14)
# 8: the kicks: a tense drone; the hurt
drone(mus, SHOT["ninety"], SHOT["proof"], [38, 44, 50], cutoff=500, gain=-19, seed=15)
# 9: 1960s London: the theme on an old upright, slow
theme(SHOT["proof"] + 0.3, HELD, bpm=72, name="piano", gain=-15, seed=16)
theme(c["proof2"] + 0.3, RISE + [(74, 3), (76, 6)], bpm=72, name="piano", gain=-16, upto=c["argue"] + 0.6, seed=17)
# 10: his best: a bright hit, the theme on marimba, then a dead stop for the cake
crash(mus, c["best"] + 0.02, gain=-18, seed=3)
theme(c["nearly"] + 0.2, RISE + [(76, 2), (78, 2)], bpm=160, name="marimba", gain=-17, upto=c["cake"] - 0.1, seed=18)
# 11: the records: wide pads that climb; a big hit on 29
for k, (t0_, ch) in enumerate([(c["human"], [62, 69, 74]), (c["official"], [59, 66, 74]), (c["trickO2"], [55, 62, 71]), (c["six"], [57, 64, 73])]):
    mus.add(pad([mtof(m) for m in ch], 6.5, 1.0, 1300, 20 + k), t0_, db(-17))
for t in np.arange(c["official"], c["whale"] - 0.3, BEAT * 2):
    mus.add(kick(0.7), t, db(-22))
crash(mus, c["t29"] + 0.02, gain=-19, seed=5)
# 12: the whale: the theme slow and low, glassy
theme(c["whale"] + 0.2, HELD, bpm=44, name="glass", gain=-22, tr=-12, seed=21)
drone(mus, c["whale"], END["dark"], [33, 40, 45], cutoff=260, gain=-20, seed=22)
# 13: too long: tension rising into the blackout; then nothing at all
drone(mus, SHOT["toolong"], c["off"], [38, 44, 50, 51], cutoff=420, gain=-21, seed=23)
for t in np.arange(SHOT["drain"], c["off"] - 0.2, 60 / 110):
    bed.add(pan_st(heartbeat(int(t * 10) + 11, 1.0), 0), t, db(-15))
# 14: the water: one low, sparse chord
drone(mus, SHOT["water"] + 0.4, SHOT["land"], [38, 45, 50], cutoff=240, gain=-22, seed=24)
# 15: on land: a warm swell (relief)
mus.add(pad([mtof(62), mtof(66), mtof(69), mtof(74)], 6.4, 1.2, 1500, 25), c["land"] + 0.2, db(-15))
# 16: the count: a soft pulse (the candles add the theme's notes above)
for t in np.arange(c["countFrom"], c["counted"], 1.0):
    mus.add(kick(0.45), t, db(-27))
# 17: counted, the turn, the button: the theme on piano, warm, still held
theme(c["counted"] + 0.4, HELD, bpm=80, name="piano", gain=-19, upto=c["button"] - 0.2, seed=26)
theme(c["turn"] + 0.6, RISE + [(76, 6)], bpm=80, name="box", gain=-21, upto=c["blow"] - 0.1, seed=27)
# 18: the final image: the E finally falls to D, and the exhale line plays out
theme(c["blow"] + 0.05, [(76, 1), (74, 1), (69, 0.5), (66, 0.5), (62, 4)], bpm=120, name="box", gain=-14, seed=28)
mus.add(pad([mtof(50), mtof(62), mtof(66), mtof(69)], 3.0, 0.6, 1400, 29), c["blow"] + 0.05, db(-17))
# 19: the sign-off: a spacey shimmer over the stars
for k, t in enumerate(np.arange(SHOT["sub"] + 2.4, DUR - 0.5, 0.45)):
    sfx.add(pan_st(glint(5600 + 400 * (k % 4), 0.3, k) if "glint" in globals() else bell(5274 + 330 * (k % 4), 0.4, 0.2), -0.5 + 0.25 * (k % 5)), t, db(-38))
mus.add(pad([mtof(50), mtof(57), mtof(62)], DUR - SHOT["sub"] - 2.0, 1.5, 700, 30), SHOT["sub"] + 2.0, db(-23))

# ================================================================= payoffs: a build into each, a hit on it (the every-second rule)
PAY = sorted((t_, k_) for k_, t_ in C.items() if isinstance(t_, (int, float)) and k_.startswith(("pay_", "big_")))
held = []
for t_, k_ in PAY:
    big_ = k_.startswith("big_")
    r_ = 2.2 if big_ else 0.8
    sfx.add(pan_st(riser(r_, seed=int(t_ * 7), f0=180 if big_ else 500, f1=1800 if big_ else 2600), 0), t_ - r_, db(-30 if big_ else -36))
    if big_:
        held.append((t_ - 0.5, t_ - 0.02))
    else:
        sfx.add(pan_st(bell(1568 + 196 * (int(t_) % 3), 0.45, 0.22), 0.2), t_, db(-34))
# the music drops out: before each big payoff (held breath), for the punchlines, the smoke, and the blackout
punch = [(c["now"] + 0.12, c["now"] + 0.38), (c["out"] - 0.02, c["pipq"] - 0.1), (c["nose2"] - 0.1, c["you"] - 0.1), (c["whistleT"] - 0.02, c["right"] + 0.2),
         (c["splat"] - 0.05, c["dive"] + 0.3), (c["cake"] - 0.1, c["human"] + 0.1), (c["switchoff"] + 0.1, c["water"] + 0.4)]
silence(mus, held + punch)
for t_, k_ in PAY:   # the hits go in AFTER the silences, so they are never muted
    if k_.startswith("big_") and k_ not in ("big_off",):
        mus.add(pan_st(thump(0.8, 90, 38, 0.3, seed=int(t_)), 0), t_, db(-17))

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -20, "music": -8})
