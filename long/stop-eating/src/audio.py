"""What Happens If You Stop Eating? (Day by Day) (long-form): sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The score has ONE theme, five notes that ask a question and never answer it (C D E G | F...): it hangs on the F, the
way he hangs on to Pip's chocolate. A music box states it over the storm in the hook; a bouncy pizzicato and marimba
carry the first day's comedy (the growl, the alarm clock, the fox); the body's machinery gets a clockwork tick; the
days get colder and the theme thinner and lower; 1944 and 1965 get an old upright piano; the viewer's pulse gets
almost nothing (a soft pad, no beat, so they can count); the edge gets a low drone; midnight on day six gets only the
wind, the candle and a heartbeat (the quietest moment, for the biggest choice); the storm breaking gets the theme warm
on strings; and at home, after the snap of the bar, the theme finally comes down to its E and C on the final image.
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
    return [(SHOT[i], END[i]) for i in ids if i in SHOT]


def word_end(word, after=0.0):
    return next(w["end"] for w in WORDS if w["word"] == word and w["start"] >= after - 0.01)


BPM = 112
BEAT = 60.0 / BPM
T0 = 0.3
on_beat = lambda t: T0 + round((t - T0) / BEAT) * BEAT  # noqa: E731

# ---------------------------------------------------------------- the theme
ASK = [(72, 1), (74, 1), (76, 1), (79, 2), (77, 3)]                       # C D E G | F... (it hangs)
HOME = [(72, 1), (74, 1), (76, 1), (79, 2), (77, 1), (76, 1), (74, 1), (72, 5)]   # ...F E D C: home


def inst(name, f, ln, seed):
    if name == "box":
        return music_box(f, max(1.4, ln), seed)
    if name == "marimba":
        return marimba(f, 0.9, seed)
    if name == "pizz":
        return pizz(f, 0.5, seed)
    if name == "piano":
        return piano(f, max(0.9, ln), seed)
    if name == "glass":
        n = int(max(0.6, ln) * SR)
        e = np.minimum(1, ar(n) / 0.12) * np.exp(-ar(n) / max(0.6, ln * 0.7))
        return fade(np.sin(2 * np.pi * f * ar(n)) * e + 0.3 * np.sin(4 * np.pi * f * ar(n)) * e ** 2, 0.002, 0.15)
    if name == "strings":
        n = int(max(0.8, ln + 0.4) * SR)
        t = ar(n)
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t)
        y = sum(np.sin(2 * np.pi * f * h * vib * t + h) / h for h in (1, 2, 3, 4))
        env = np.minimum(1, t / 0.25) * np.minimum(1, (n / SR - t) / 0.35)
        return fade(filt(y * env, "lowpass", 2400), 0.01, 0.1)
    raise ValueError(name)


def theme(t0, notes, bpm=96, name="box", gain=-16.0, tr=0, pan=0.0, upto=None, seed=0, bus=None):
    bus = bus or mus
    beat = 60.0 / bpm
    t = t0
    for k, (m, d) in enumerate(notes):
        if upto is not None and t >= upto:
            break
        ln = d * beat + 0.4
        if upto is not None:
            ln = min(ln, upto - t + 0.05)
        bus.add(inst(name, mtof(m + tr), ln, seed + k), t, db(gain), pan=pan)
        t += d * beat
    return t


# ---------------------------------------------------------------- sounds made for this film
def norm(y):
    return y / (np.abs(y).max() + 1e-9)


def soft_tick(seed=0, g=1.0):
    n = int(0.03 * SR)
    y = filt(white(n, seed), "bandpass", [2500, 7000]) * np.exp(-ar(n) / 0.004)
    return norm(y) * g


def tape_rewind(dur=0.6, seed=0):
    n = int(dur * SR)
    t = ar(n)
    f = 900 + 2600 * t / dur
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + filt(white(n, seed), "bandpass", [1500, 6000]) * 0.6
    y *= np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.08)
    return fade(norm(y), 0.005, 0.03)


def monitor_beep(f=1500.0):
    n = int(0.09 * SR)
    t = ar(n)
    return np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.004) * np.minimum(1, (0.09 - t) / 0.02) * 0.7


def wind(n, seed=0, howl=1.0):
    """the storm against the hut: a low roar with slow gusts (under ~450 Hz), and a thin whistle high above the voice"""
    t = ar(n)
    g = filt(brown(n, seed + 1), "lowpass", 0.6)
    g = 0.65 + 0.35 * np.tanh(norm(g) * 2.5)
    low = filt(brown(n, seed), "lowpass", 420) * g
    whistle = filt(white(n, seed + 2), "bandpass", [3800, 6200]) * (g ** 3) * 0.08 * howl
    st = np.stack([low + whistle, np.roll(low, int(0.013 * SR)) + whistle * 0.8])
    return st / (np.abs(st).max() + 1e-9)


def fire(n, seed=0):
    """the stove: soft crackles above the voice band and a low breathing roar"""
    y = crackle(n, 7.0, seed, lo=4200, hi=9000) * 0.6 + filt(brown(n, seed + 3), "lowpass", 180) * 0.5
    return pan_st(norm(y), -0.5)


def rotor(dur, seed=0):
    """a helicopter: a low chop at about 11 blade beats a second, a whine above"""
    n = int(dur * SR)
    t = ar(n)
    chop = (0.5 + 0.5 * np.cos(2 * np.pi * 11 * t)) ** 6
    y = filt(brown(n, seed), "lowpass", 260) * (0.3 + chop) + 0.08 * filt(white(n, seed + 1), "bandpass", [5200, 8000])
    env = np.minimum(1, t / (dur * 0.5)) * np.minimum(1, (dur - t) / 0.6)
    return fade(norm(y) * env, 0.02, 0.2)


def flush(dur=1.6, seed=0):
    """a toilet flush: a rush of water that swirls down"""
    n = int(dur * SR)
    t = ar(n)
    fc = 2200 * np.exp(-t / (dur * 0.45)) + 250
    y = svf_bp(white(n, seed), fc, 1.2)
    y = y * np.minimum(1, t / 0.05) * np.exp(-t / (dur * 0.6)) + 0.4 * gurgle(dur, seed + 1)[:n]
    return fade(norm(y), 0.005, 0.2)


def fox_yip(seed=0):
    n = int(0.22 * SR)
    t = ar(n)
    f = 900 + 900 * np.sin(np.pi * np.minimum(1, t / 0.22)) ** 0.6
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09) + 0.2 * filt(white(n, seed), "bandpass", [1500, 4000]) * np.exp(-t / 0.05)
    return fade(norm(y), 0.002, 0.03)


def crunch(seed=0):
    n = int(0.12 * SR)
    y = filt(white(n, seed), "bandpass", [700, 3800]) * np.exp(-ar(n) / 0.035) * (0.6 + 0.4 * (white(n, seed + 1) > 0.6))
    return norm(y)


def static(dur, seed=0):
    n = int(dur * SR)
    y = filt(white(n, seed), "bandpass", [1200, 5200]) * 0.4 + crackle(n, 30.0, seed + 1, lo=2000, hi=7000)
    return fade(norm(y), 0.01, 0.05)


def page_flip(seed=0):
    n = int(0.16 * SR)
    t = ar(n)
    y = filt(white(n, seed), "bandpass", [1800, 7000]) * np.sin(np.pi * t / 0.16) ** 2
    return norm(y)


def heart_lub(seed=0):
    return heartbeat(seed, 1.0)


def ffdrone(mus, t0, t1, notes, cutoff=500, gain=-24.0, seed=0, swell=0.3):
    """sfxkit's drone (a detuned saw chord, low-passed) made fast: a naive saw per voice instead of additive
    synthesis (the low-pass removes what would alias); the same sound, a hundred times quicker for long low notes"""
    dur = t1 - t0
    n = int(dur * SR)
    t = ar(n)
    y = np.zeros(n)
    for i, m in enumerate(notes):
        for v, d in enumerate((-0.006, 0.006)):
            ph = np.random.default_rng(seed + i * 7 + v).random()
            y += 2 * ((mtof(m) * (1 + d) * t + ph) % 1.0) - 1
    y = filt(y / (2 * len(notes)), "lowpass", cutoff)
    y = fade(y * attack_decay(n, swell, 9) * 0.6, 0.001, min(0.05, dur / 3))
    mus.add(pan_st(fade(y, 0.05, 0.08), 0), t0, db(gain))


def fdrone(mus, t0, t1, notes, cutoff=500, gain=-24.0, seed=0, swell=0.3):
    """sfxkit's drone (a detuned saw chord, low-passed) made fast: a naive saw per voice instead of additive
    synthesis (the low-pass removes what would alias); the same sound, a hundred times quicker for long low notes"""
    dur = t1 - t0
    n = int(dur * SR)
    t = ar(n)
    y = np.zeros(n)
    for i, m in enumerate(notes):
        for v, d in enumerate((-0.006, 0.006)):
            ph = np.random.default_rng(seed + i * 7 + v).random()
            y += 2 * ((mtof(m) * (1 + d) * t + ph) % 1.0) - 1
    y = filt(y / (2 * len(notes)), "lowpass", cutoff)
    y = fade(y * attack_decay(n, swell, 9) * 0.6, 0.001, min(0.05, dur / 3))
    mus.add(pan_st(fade(y, 0.05, 0.08), 0), t0, db(gain))


# ================================================================= ambience (one bed per world)
HUT = ["hook", "bite", "water", "never", "lemon", "radio", "growl", "echo", "alarm", "fist", "hangry", "borrow", "borrow2", "breath",
       "day5", "pip2", "pulse", "day6", "wrap", "rescue", "lunch", "quiet2"]
HUT_SPANS = shots(*HUT)
storm_end = c["sunUp"]
# the hangry shot opens on the diagram; the hut part starts at the argument; the rescue's hut part ends at the sun
HUT_SPANS = [(a, b) if a != SHOT["hangry"] else (c["argument"] - 0.15, b) for a, b in HUT_SPANS]
in_hut = gate(N, [(a, min(b, storm_end)) for a, b in HUT_SPANS if a < storm_end], smooth=0.25)
storm_k = np.ones(N)
for k_, t_ in enumerate((c["d1"], c["d2"], c["d3"], c["d5"], c["d6"])):   # the storm grows, day by day
    storm_k += 0.12 * (tt >= t_)
amb.x += wind(N, 11, 0.7) * in_hut * 0.55 * storm_k
amb.x += wind(N, 13, 1.0) * gate(N, shots("storm", "door", "foxsnout", "stolen", "easy"), smooth=0.2) * 1.1
amb.x += fire(N, 15) * in_hut * 0.45 * np.interp(tt, [0, c["d2"], c["d5"], c["d6"], DUR], [1.0, 0.8, 0.55, 0.35, 0.35])
# inside the body: a low hum
amb.x += pan_st(norm(filt(brown(N, 17), "lowpass", 160) + 0.3 * np.sin(2 * np.pi * 48 * tt)), 0) * gate(N, shots("ready", "clean", "clean2", "pantry", "borrow", "lever", "switch", "ruler", "heart", "limit2")) * 0.5
# old film: a projector whirr under 1944 and 1965
amb.x += pan_st(projector(N, 19), 0) * gate(N, shots("p382", "minnesota", "minnesota2", "obsessed", "barbieri", "barbieri2", "toilet", "egg") + [(SHOT["heart"], c["isMuscle"] - 0.1)]) * 0.45
# day seven: the wind drops away; birds; Pip's kitchen: a warm room and birds outside the window
day_spans = [(storm_end, DUR)]
for t in np.arange(storm_end + 1.2, DUR - 1.0, 2.3):
    sfx.add(pan_st(tweet(int(t * 10), 3400 + 300 * np.sin(t)), 0.6), t, db(-36))

# ================================================================= the hook: the lemon
sfx.add(pan_st(chomp(1), 0), 0.02, db(-15))
sfx.add(pan_st(squelch(0.35, 2), 0.1), 0.08, db(-20))
for k in range(3):
    sfx.add(pan_st(drip(3 + k, 1800 + 300 * k), 0.3), 0.25 + 0.12 * k, db(-27))
_t, _k = SHOT["p382"] + 0.15, 0
while _t < c["n382end"] - 0.05:
    u = (_t - SHOT["p382"]) / max(0.1, c["n382end"] - SHOT["p382"])
    sfx.add(pan_st(page_flip(500 + _k), 0.4), _t, db(-33))
    _t += 0.3 * (1 - 0.8 * u) + 0.05
    _k += 1
sfx.add(pan_st(thump(0.3, 300, 90, 0.06, 4), 0.3), c["d382hook"] + 0.06, db(-14))     # NO FOOD: the rubber stamp
sfx.add(pan_st(crack(0.05, 5, 0.01, 1600), 0.3), c["d382hook"] + 0.06, db(-24))
sfx.add(pan_st(blip(800, 1400, 0.09, 6, 0.03), 0.6), c["bite"] - 0.05, db(-21))
sfx.add(pan_st(chomp(7), 0), c["now"] + 0.02, db(-13))
sfx.add(pan_st(squelch(0.4, 8), 0), word_end("Now.", c["now"]) + 0.02, db(-18))
for k in range(4):
    sfx.add(pan_st(drip(9 + k, 1600 + 250 * k), -0.3 + 0.2 * k), word_end("Now.", c["now"]) + 0.12 + 0.09 * k, db(-25))
# the taps turn on: a squeak, then water running
sfx.add(pan_st(squeak(0.14, 1300, 1900), 0.4), c["watered"] - 0.12, db(-23))
sfx.add(pan_st(gurgle(1.2, 10, 22), 0.4), c["watered"] + 0.15, db(-27))
sfx.add(pan_st(drip(11, 1500), 0.1), word_end("right?", c["watered"]) + 0.05, db(-20))
# READY: a chime on the stomach, a little growl of expectation
sfx.add(pan_st(chime(1318.5, 0.9), 0.3), c["ready"] + 0.5, db(-24))
sfx.add(stomach_growl(0.8, 12), c["thought"] - 0.6, db(-27))
sfx.add(pan_st(blip(600, 1200, 0.1, 13, 0.03), 0.3), c["thought"] - 0.1, db(-22))
# never: the pull-back into the storm (a low whoosh), the clock appears (a click)
sfx.add(pan_st(whoosh(1.4, 1600, 200, 14, 0.6), 0), c["imagine"], db(-21))
sfx.add(pan_st(key_click(15), -0.6), c["h0"] - 0.03, db(-15))

# ================================================================= the want (that morning) and the fox
sfx.add(pan_st(tape_rewind(0.45, 16), 0), SHOT["want"] - 0.55, db(-21))
for t in (SHOT["want"] + 0.9, SHOT["want"] + 2.6, SHOT["want"] + 4.4):
    sfx.add(pan_st(tweet(int(t * 7), 3600), -0.5), t, db(-30))
sfx.add(pan_st(bell(2637, 0.6, 0.25), 0.3), SHOT["want"] + 0.5, db(-27))           # the shop's door bell
sfx.add(pan_st(bell(2093, 0.6, 0.25), 0.3), SHOT["want"] + 0.68, db(-28))
sfx.add(pan_st(page_flip(17), -0.5), c["pipsFav"] + 0.05, db(-22))
for k in range(4):
    sfx.add(pan_st(bell(2093 + 262 * k, 0.4, 0.2), 0.3), word_end("chocolate,", c["pipsFav"]) + 0.03 + 0.06 * k, db(-30))
# the storm: the wind slams in, his steps crunch, the door creaks and bangs; the fox's paws, the grab, its yip
sfx.add(pan_st(whoosh(1.0, 200, 1500, 18, 0.5), 0), SHOT["storm"] - 0.1, db(-17))
for k, t in enumerate(np.arange(SHOT["storm"] + 0.3, c["hut"] + 1.0, 0.42)):
    bed.add(pan_st(crunch(20 + k), -0.2), t, db(-27))
sfx.add(pan_st(creak(0.7, 21, 90, 200), 0.3), SHOT["door"] + 0.1, db(-26))
sfx.add(pan_st(thump(0.3, 220, 70, 0.07, 22), 0.3), c["hut"] + 1.55, db(-17))
for k, t in enumerate(np.arange(c["foxW"] - 0.4, c["grab"], 0.09)):
    bed.add(pan_st(soft_tick(30 + k, 0.7), 0.5), t, db(-31))
sfx.add(pan_st(fox_yip(31), 0.3), c["grab"] + 0.08, db(-17))
sfx.add(pan_st(whoosh(0.5, 800, 2600, 32), -0.4), c["grab"] + 0.2, db(-19))
for k, t in enumerate(np.arange(c["grab"] + 0.2, c["grab"] + 1.4, 0.07)):
    bed.add(pan_st(soft_tick(40 + k, 0.8), -0.6), t, db(-30))
sfx.add(pan_st(thump(0.3, 280, 90, 0.06, 33), 0), c["grab"] + 0.32, db(-16))           # STOLEN!
# the lemon: deadpan; a sad little slide after the word
sfx.add(pan_st(slide_whistle(0.55, 900, 420), 0), word_end("lemon.", c["lemonW"]) + 0.1, db(-24))
# the radio: static, a squelch, Pip's bubble
sfx.add(pan_st(static(0.5, 34), 0.3), SHOT["radio"] - 0.65, db(-25))
sfx.add(pan_st(static(0.4, 35), 0.3), c["chocOK"] - 0.45, db(-25))
sfx.add(pan_st(blip(900, 1500, 0.08, 36, 0.03), 0.3), c["chocOK"] - 0.2, db(-20))
sfx.add(pan_st(thump(0.25, 260, 90, 0.05, 37), 0.4), c["week"] + 0.05, db(-17))

# ================================================================= ACT 1: the first day
# the growl, its echo round the hut; the fox's ears
sfx.add(stomach_growl(1.4, 40), c["growls"] + 0.02, db(-15))
sfx.add(pan_st(squeak(0.1, 1800, 2400), 0.6), c["growls"] + 0.7, db(-26))
sfx.add(pan_st(squelch(0.5, 41), 0), word_end("cleaning.", c["cleaning"]) + 0.03, db(-22))
sfx.add(pan_st(whoosh(0.9, 300, 1200, 42, 0.6), 0.2), c["every"] + 0.1, db(-24))
pops(list(np.arange(c["squeezes"], c["squeezes"] + 1.0, 0.16)), bed, db(-30), seed=43)
for k, t in enumerate(np.arange(SHOT["clean2"] + 0.1, c["squeezes"] - 0.1, 0.11)):
    bed.add(pan_st(soft_tick(600 + k, 0.8), -0.4), t, db(-34))
for k, (dl, g) in enumerate(((0.0, -15), (0.38, -21), (0.76, -26), (1.14, -31))):
    sfx.add(filt(stomach_growl(1.1, 44 + k), "lowpass", 900 - 150 * k), word_end("echoes.", c["echoes"]) + 0.05 + dl, db(g), pan=0.4 * (-1) ** k)
# lunchtime: a clock tick, the alarm clock rings in the pause after "right on time."
sfx.add(pan_st(key_click(48), -0.6), c["h6"] - 0.05, db(-17))
sfx.add(pan_st(alarm_bell(0.55, 49), 0.4), word_end("time.", c["onTime"]) + 0.04, db(-21))
# the gauge pops in, the X slams it; the alarm clock bounces in ringing; the three meal times pop
sfx.add(pan_st(blip(500, 900, 0.1, 50, 0.03), -0.4), SHOT["clock"] - 0.12, db(-26))
sfx.add(pan_st(thump(0.25, 260, 80, 0.05, 51), -0.4), c["gaugeEnd"] + 0.08, db(-15))
sfx.add(pan_st(crack(0.12, 52, 0.03, 1200), -0.4), c["gaugeEnd"] + 0.08, db(-24))
sfx.add(pan_st(alarm_bell(0.35, 53), 0.4), c["alarmW"] + 0.05, db(-27))
for k in range(3):
    sfx.add(pan_st(blip(700 + 200 * k, 1300 + 200 * k, 0.08, 54 + k, 0.03), -0.4 + 0.4 * k), word_end("eat.", c["learned"]) + 0.03 + 0.12 * k, db(-23))
# snooze: a little snore (a low burr) in the pause, then dinner: one short ring
for k in range(2):
    sfx.add(pan_st(norm(filt(brown(int(0.5 * SR), 57 + k), "lowpass", 300)) * np.sin(np.pi * np.linspace(0, 1, int(0.5 * SR))), 0), c["goesQuiet"] + 0.7 + 0.9 * k, db(-22))
sfx.add(pan_st(alarm_bell(0.25, 59), 0), word_end("dinner.", c["dinner"]) + 0.05, db(-20))
# the fist: a leather creak, a knuckle pop; the padlock clicks; the jars clink; the brain sips through its straw
sfx.add(pan_st(blip(800, 1400, 0.09, 60, 0.03), 0.6), c["fistW"] - 0.05, db(-21))
sfx.add(pan_st(creak(0.5, 61, 120, 260), 0.2), c["squeeze"] + 0.05, db(-22))
sfx.add(pan_st(crack(0.06, 62, 0.012, 1500), 0.2), word_end("Squeeze.", c["squeeze"]) + 0.05, db(-20))
sfx.add(pan_st(key_click(63), -0.3), c["muscles"] + 0.45, db(-17))
for k in range(4):
    sfx.add(pan_st(bell(2637 + 196 * k, 0.25, 0.08), -0.4), c["liverW"] + 0.1 + 0.11 * k, db(-30))
sfx.add(pan_st(slurp(0.7, 64, 12), 0), word_end("liver...", c["liverW"]) + 0.05, db(-24))
# hour eighteen: the straw sucks at an empty jar; the argument; a wah-wah when he loses
sfx.add(pan_st(slurp(0.9, 65, 20), 0), c["almost"] + 0.4, db(-21))
sfx.add(pan_st(fox_yip(66), 0.5), word_end("argument...", c["argument"]) + 0.05, db(-26))
sfx.add(pan_st(wahwah(67), 0.2), word_end("fox.", c["withFox"]) + 0.1, db(-21))
# day one: the storm, the easy part (a low roll of thunder)
sfx.add(pan_st(whoosh(1.4, 180, 900, 68, 0.6), 0), SHOT["easy"] - 0.1, db(-18))
sfx.add(pan_st(norm(filt(thunder(2.2, 69), "lowpass", 260)), 0), c["easyPart"] + 0.2, db(-15))

# ================================================================= ACT 2: day two to day five
sfx.add(shiver(0.6, 70), SHOT["borrow"] + 0.4, db(-24))
for k in range(8):
    bed.add(pan_st(bloop(600 + 40 * (k % 4), 300, 0.12), -0.5 + 0.12 * k), c["makes"] + 0.2 + 0.25 * k, db(-31))
sfx.add(pan_st(thump(0.3, 280, 90, 0.06, 71), 0.4), c["borrowing"] + 0.2, db(-16))
sfx.add(pan_st(bell(1046.5, 0.6, 0.25), 0.4), c["borrowing"] + 0.24, db(-27))
# the switch: a lever clunk, a power-up, green sparkles
sfx.add(pan_st(thump(0.2, 400, 150, 0.04, 72), 0), c["bigSwitch"] + 0.05, db(-15))
sfx.add(pan_st(key_click(73), 0), c["bigSwitch"] + 0.08, db(-17))
sfx.add(pan_st(riser(1.4, 74, 300, 2400), 0), c["fatW"] + 0.2, db(-27))
sfx.add(pan_st(bloop(760, 380, 0.12), -0.3), word_end("fuel...", c["newFuel"]) + 0.05, db(-22))   # the first drop of new fuel
sfx.add(pan_st(blip(900, 1600, 0.1, 621, 0.03), 0.3), word_end("it.", c["running"]) + 0.04, db(-23))     # the brain goes green
for k in range(6):
    sfx.add(pan_st(bell(2093 + 196 * k, 0.4, 0.2), -0.5 + 0.2 * k), c["running"] + 0.3 + 0.07 * k, db(-30))
# the packed lunch: lunchboxes clicking on, one after another; the ruler; 1/10: a tiny ding and a deflating slide
pops(list(np.arange(c["packed"] + 0.1, c["packed"] + 1.1, 0.08)), bed, db(-28), seed=75)
sfx.add(pan_st(chime(1568.0, 0.9), 0), c["weeks"] + 0.1, db(-25))
sfx.add(pan_st(whoosh(0.6, 600, 2000, 76), 0), c["chocBarW"] - 0.1, db(-22))
sfx.add(pan_st(blip(500, 900, 0.1, 620, 0.03), 0), c["chocBarW"] - 0.25, db(-27))
bed.add(pan_st(bloop(520, 260, 0.14), -0.4), c["tenth"] + 0.02, db(-29))
sfx.add(pan_st(slide_whistle(0.5, 1200, 500), 0.2), word_end("day.", c["tenth"]) + 0.08, db(-23))
# the breath: a breath out into the hand, a sniff; the nail polish bottle pops; the fox faints: a boing and a thud
sfx.add(pan_st(breath(0.4, 77, exhale=True), 0), word_end("hand.", c["breatheHand"]) + 0.12, db(-23))
sfx.add(pan_st(hiss(0.25, 78, 0.06), 0), word_end("it.", c["smell"]) + 0.03, db(-21))
sfx.add(pan_st(cork_pop(79, 620.0), 0.5), word_end("remover?", c["polish"]) + 0.03, db(-19))
sfx.add(pan_st(squeak(0.12, 2200, 1400), 0.5), c["hisBreath"] + 0.9, db(-23))
sfx.add(pan_st(slide_whistle(0.4, 1500, 300), 0.5), word_end("might.", c["hisBreath"]) + 0.06, db(-20))
sfx.add(pan_st(thump(0.25, 200, 70, 0.06, 80), 0.5), word_end("might.", c["hisBreath"]) + 0.5, db(-15))
# the hunger goes quiet: the knob's ratchet, the bell fading out
for k in range(9):
    sfx.add(pan_st(soft_tick(81 + k, 0.8), 0.3), c["quieter"] - 0.4 + 0.07 * k, db(-27))
for k in range(3):
    sfx.add(pan_st(alarm_bell(0.3, 90 + k), -0.3), SHOT["quiet"] + 0.2 + 0.55 * k, db(-30 - 4 * k))
# 1944: a camera's whirr is the bed; the months flip; the scale's needle sinks; TO FEED EUROPE
for k in range(6):
    sfx.add(pan_st(page_flip(95 + k), 0.2), c["sixMonths"] - 0.3 + 0.27 * k, db(-26))
sfx.add(pan_st(creak(1.2, 101, 60, 120), 0.4), SHOT["minnesota2"] + 0.2, db(-25))
sfx.add(pan_st(bell(1760, 0.25, 0.06), 0.2), c["halfFood"] - 0.12, db(-30))
sfx.add(pan_st(thump(0.3, 240, 80, 0.06, 102), 0), c["europe"] + 0.05, db(-16))
# their minds: pages turning, a thought bubble pops, gum chewed, packs piling up
sfx.add(pan_st(page_flip(103), -0.3), c["cookbooks"] + 0.1, db(-22))
sfx.add(pan_st(blip(600, 1200, 0.1, 104, 0.03), 0.3), c["dreamed"] + 0.15, db(-22))
for k in range(6):
    bed.add(pan_st(chomp(105 + k), 0.4), c["gum"] + 0.1 + 0.2 * k, db(-30))
pops(list(np.arange(c["gum"] + 0.3, c["gum"] + 1.5, 0.1)), bed, db(-29), seed=111)
# day five: the wrapper crinkles; 11x; he reads to the fox (a little tilt squeak)
sfx.add(pan_st(crumple(0.6, 112), -0.2), SHOT["day5"] + 0.6, db(-23))
sfx.add(pan_st(thump(0.25, 280, 90, 0.05, 113), 0.4), c["eleven"] + 0.05, db(-17))
sfx.add(pan_st(squeak(0.12, 1500, 2100), 0.5), word_end("fox.", c["toFox"]) + 0.15, db(-24))
# Pip again: static, her bubble; the bar lifted
sfx.add(pan_st(static(0.35, 114), 0.3), SHOT["pip2"] - 0.45, db(-25))
sfx.add(pan_st(blip(900, 1500, 0.08, 115, 0.03), 0.5), c["chocOK2"] - 0.25, db(-20))
sfx.add(pan_st(crumple(0.4, 116), -0.2), END["pip2"] - 0.6, db(-25))

# ================================================================= ACT 3: the edge
sfx.add(pan_st(thunder(2.0, 120), 0), SHOT["edge"] + 0.05, db(-19))
for k in range(9):
    sfx.add(pan_st(blip(300 + 40 * k, 500 + 40 * k, 0.06, 121 + k, 0.02), 0), SHOT["edge"] + 0.12 * k, db(-30))
sfx.add(pan_st(thump(0.4, 200, 60, 0.1, 130), 0), c["nobody"] + 0.3, db(-14))
sfx.add(pan_st(crack(0.15, 131, 0.04, 900), 0), c["nobody"] + 0.3, db(-22))
# the pulse: the badge; six soft ticks while the viewer counts (no beat, so it never fights their own); a ding at the end
sfx.add(pan_st(blip(800, 1400, 0.09, 132, 0.03), 0.6), c["findPulse"] - 0.05, db(-21))
sfx.add(pan_st(blip(600, 1100, 0.08, 133, 0.03), 0.5), c["findPulse"] + 0.9, db(-28))
for k in range(6):
    sfx.add(pan_st(soft_tick(133 + k, 0.7), 0.4), c["go"] + 0.4 + k * 1.0, db(-34))
sfx.add(pan_st(bell(1568, 0.8, 0.3), 0.4), c["go"] + 6.05, db(-24))
# x10, the band; 37: a slow monitor; the heart shrinks
sfx.add(pan_st(thump(0.25, 280, 90, 0.05, 140), 0), c["addZero"] + 0.05, db(-16))
sfx.add(pan_st(whoosh(0.8, 400, 1800, 141), 0), c["range"] - 0.4, db(-24))
sfx.add(pan_st(chime(1318.5, 0.9), 0), c["range"] + 0.6, db(-26))
for k, t in enumerate(np.arange(SHOT["heart"] + 0.3, c["isMuscle"] - 0.2, 60 / 37)):
    bed.add(pan_st(monitor_beep(1250), 0.3), t, db(-30))
sfx.add(pan_st(thump(0.3, 240, 80, 0.06, 142), 0.3), c["t35"] + 0.05, db(-16))
for k, t in enumerate(np.arange(c["isMuscle"], END["heart"], 60 / 40)):
    bed.add(pan_st(heart_lub(143 + k), 0), t, db(-23))
sfx.add(pan_st(balloon_inflate(0.6, 150)[::-1].copy(), 0), word_end("muscle.", c["eatsMuscle"]) + 0.05, db(-25))
# the limit: the ruler draws, the band pops, fat and protein, the heart cracks
sfx.add(pan_st(whoosh(0.7, 300, 1500, 151), 0), SHOT["limit"] + 0.05, db(-23))
sfx.add(pan_st(chime(1046.5, 0.8), 0), word_end("months.", c["months"]) + 0.03, db(-26))
sfx.add(pan_st(blip(700, 1100, 0.09, 152, 0.03), -0.4), c["fatRuns"] + 0.05, db(-22))
for k in range(6):
    bed.add(pan_st(bloop(700 - 50 * k, 300, 0.1), -0.3 + 0.12 * k), c["fatRuns"] + 0.3 + 0.22 * k, db(-32))
sfx.add(pan_st(blip(500, 800, 0.09, 153, 0.03), 0.4), c["ownProtein"] + 0.05, db(-22))
sfx.add(pan_st(crack(0.2, 154, 0.05, 700), 0.4), c["theHeart"] + 0.35, db(-19))
sfx.add(pan_st(thump(0.6, 120, 40, 0.2, 155), 0), c["theHeart"] + 0.4, db(-16))
# 1965: the scale groans under him; the clipboard; the calendar's pages, faster and faster; 382 lands
sfx.add(pan_st(whoosh(0.25, 700, 2600, 630, 0.8), 0), c["angus"] - 0.3, db(-27))
sfx.add(pan_st(whoosh(0.2, 400, 2200, 631, 0.8), 0), c["kilos200"] - 0.2, db(-27))
sfx.add(pan_st(creak(0.9, 160, 50, 100), -0.3), c["kilos200"] + 0.1, db(-22))
sfx.add(pan_st(cork_pop(632, 900.0), -0.5), c["flashBulb"] - 0.02, db(-20))
sfx.add(pan_st(norm(filt(white(int(0.25 * SR), 633), "highpass", 5000)) * np.exp(-np.linspace(0, 10, int(0.25 * SR))), -0.5), c["flashBulb"], db(-34))
sfx.add(pan_st(springs(161, 0.6), -0.3), c["kilos200"] + 0.3, db(-26))
sfx.add(pan_st(page_flip(162), -0.4), c["doctors"] + 0.05, db(-22))
sfx.add(pan_st(cork_pop(163, 540.0), 0.2), c["vitamins"] + 0.3, db(-22))
_t = c["vitamins"] + 0.1
_k = 0
while _t < c["d382end"]:
    u = (_t - (c["vitamins"] - 0.2)) / max(0.1, c["d382end"] - (c["vitamins"] - 0.2))
    sfx.add(pan_st(page_flip(170 + _k), 0.4), _t, db(-32))
    _t += 0.28 * (1 - 0.8 * u) + 0.05
    _k += 1
sfx.add(pan_st(thump(0.4, 240, 70, 0.1, 199), 0.4), c["d382end"] + 0.27, db(-13))
# he slims: the needle swings back (a slide down); -125 KG: a ding; BY THE END; the toilet flushes in the pause
sfx.add(pan_st(slide_whistle(0.5, 1100, 350), -0.3), word_end("kilos.", c["lost"]) + 0.03, db(-25))
sfx.add(pan_st(bell(1568, 0.6, 0.25), -0.3), c["lost"] + 1.05, db(-25))
sfx.add(pan_st(flush(1.1, 200), 0.3), word_end("days.", c["forty"]) + 0.06, db(-17))
# the egg: a ta-da on the bells, the cup's clink
sfx.add(pan_st(bell(2637, 0.3, 0.1), 0.3), c["papers"] - 0.25, db(-27))
for k, m in enumerate((72, 76, 79, 84)):
    sfx.add(pan_st(bell(mtof(m + 12), 0.6, 0.3), 0.3), word_end("egg.", c["eggW"]) + 0.05 + 0.08 * k, db(-25))

# ================================================================= DAY SIX: midnight
# only the wind (louder), the candle, the paper, his heartbeat
sfx.add(pan_st(whoosh(1.6, 150, 700, 210, 0.5), 0), SHOT["day6"] - 0.1, db(-19))
sfx.add(pan_st(crumple(1.2, 211), -0.1), c["unwraps"] + 0.4, db(-23))
sfx.add(pan_st(crumple(0.9, 212), -0.1), c["unwraps"] + 1.8, db(-27))
for k, t in enumerate(np.arange(c["unwraps"] + 1.0, c["wrapsBack"] + 0.2, 60 / 66)):
    bed.add(pan_st(heart_lub(213 + k), 0), t, db(-19))
sfx.add(pan_st(crumple(0.8, 230), -0.1), c["wrapsBack"] + 0.1, db(-23))
for k in range(2):
    sfx.add(pan_st(thump(0.08, 300, 140, 0.02, 231 + k), 0), c["wrapsBack"] + 1.55 + 0.22 * k, db(-22))

# ================================================================= DAY SEVEN: the rescue
# the wind cuts out on the sun; a bright swell; the helicopter comes in
sfx.add(pan_st(chime(1568, 1.2), 0), c["sunUp"] + 0.05, db(-22))
sfx.add(pan_st(rotor(END["rescue"] - c["sunUp"] - 0.35, 240), 0.3), c["sunUp"] + 0.2, db(-19))
sfx.add(pan_st(whoosh(0.8, 300, 1600, 241), 0), c["breaks"] - 0.15, db(-21))
# the soup: the door, the mug set down, the steam; the taps again; his mouth: a drip
sfx.add(pan_st(creak(0.5, 242, 90, 200), 0.4), SHOT["soup"] - 0.55, db(-26))
sfx.add(pan_st(bell(1760, 0.3, 0.08), 0.2), word_end("soup.", c["soupW"]) + 0.03, db(-24))
sfx.add(pan_st(hiss(0.6, 243, 0.3), 0.2), c["soupW"] + 0.7, db(-31))
sfx.add(pan_st(squeak(0.14, 1300, 1900), 0.4), c["wateredAgain"] - 0.1, db(-24))
sfx.add(pan_st(gurgle(1.0, 244, 22), 0.4), c["wateredAgain"] + 0.3, db(-28))
sfx.add(pan_st(drip(245, 1500), 0), word_end("his.", c["soDid"]) + 0.05, db(-19))
# start small: the X on the feast, then the cup, the bowl, the plate pop in (rising)
sfx.add(pan_st(thump(0.25, 260, 80, 0.05, 246), 0), c["justCup"] + 0.55, db(-17))
for k in range(3):
    sfx.add(pan_st(blip(600 + 250 * k, 1000 + 300 * k, 0.09, 247 + k, 0.03), -0.4 + 0.4 * k), c["startSmall"] - 0.3 + 0.3 * k, db(-21))

# ================================================================= HOME
sfx.add(pan_st(whoosh(0.8, 300, 1500, 250, 0.6), 0), SHOT["home"] - 0.15, db(-22))
sfx.add(pan_st(crumple(0.5, 251), 0.2), c["hands"] + 0.5, db(-25))
sfx.add(pan_st(chime(1318.5, 1.0), 0.2), c["notOne"] + 0.4, db(-25))
sfx.add(pan_st(static(0.5, 252), 0.4), c["everyNight"] + 0.2, db(-33))
# the snap: in silence, a crisp crack of chocolate and a scatter of crumbs; then nothing but the room
sfx.add(pan_st(crack(0.1, 253, 0.02, 1800), 0.2), c["snap"], db(-12))
sfx.add(pan_st(thump(0.12, 500, 200, 0.03, 254), 0.2), c["snap"], db(-19))
pops([c["snap"] + 0.08 + 0.05 * k for k in range(5)], bed, db(-31), seed=255)
# the final image: a soft shimmer
for k, t in enumerate(np.arange(c["final"] + 0.3, DUR - 0.5, 0.45)):
    sfx.add(pan_st(bell(4186 + 330 * (k % 4), 0.4, 0.2), -0.5 + 0.25 * (k % 5)), t, db(-38))
# the subscribe cue: pop, click, bell (quiet: it sits under the words)
sfx.add(pan_st(blip(700, 1500, 0.09, 260, 0.03), 0), c["sub_in"], db(-26))
sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-22))
sfx.add(pan_st(bell(1760, 0.45, 0.15), 0), c["sub_tap"] + 0.08, db(-33))
sfx.add(pan_st(chomp(300), -0.4), c["eatW"] + 0.06, db(-16))
pops([c["eatW"] + 0.12 + 0.05 * k for k in range(4)], bed, db(-31), seed=301)
sfx.add(pan_st(chomp(302), 0.3), c["eatW"] + 0.43, db(-18))

# a whoosh into every cut (ending on the cut), quiet, in the pause before the phrase
for i_, s_ in enumerate(TL["shots"][1:]):
    if s_["id"] in ("half", "final", "sub", "wrap"):
        continue
    sfx.add(pan_st(whoosh(0.22, 500 + 120 * (i_ % 5), 2600, 400 + i_, 0.8), 0.2 * (-1) ** i_), s_["start"] - 0.2, db(-27))

# ================================================================= the clock: a tick on every new hour or day it shows
for e in C["clock"]:
    if len(e) >= 7 and e[5] > e[4]:
        t0_, n0, n1, dt = e[0], e[4], e[5], e[6]
        for j in range(1, int(n1 - n0) + 1):
            t = t0_ + dt * j / (n1 - n0)
            if t < DUR - 0.2:
                sfx.add(soft_tick(1000 + int(t * 10), 0.9), t, db(-30), pan=-0.6)
    else:
        sfx.add(pan_st(blip(700, 1200, 0.07, int(e[0] * 13), 0.02), -0.6), e[0] + 0.05, db(-25))
for k_ in ("d1", "d2", "d3", "d5", "d6", "d7"):          # each new day: a knife scratches a tally mark on the wall
    sfx.add(pan_st(scratch(0.25, int(C[k_] * 10)), 0.5), C[k_] + 0.35, db(-26))

# ================================================================= the score, section by section
S = SHOT
# 0: the hook: the theme on a music box over the storm, hanging on its F; it stops for the bite
theme(word_end("eating?") + 0.08, ASK, bpm=112, name="box", gain=-24, upto=c["now"] - 0.4, seed=1)
# 1: the mouth and the body getting ready: a curious marimba; then the pull-back into the storm (a low drone)
groove(mus, on_beat(c["watered"] + 0.1), c["imagine"] - 0.05, BPM, ["C", "Am", "F", "G"], gain=-11, seed=2, kick_on=False, snaps=True, arp=True, half=True, cutoff=1300)
fdrone(mus, c["imagine"], S["want"] - 0.1, [41, 48, 53], cutoff=380, gain=-21, seed=3)
# 2: that morning: bright and bouncy (the theme on pizzicato), cut by the storm
theme(S["want"] + 0.4, ASK + [(79, 1), (81, 1), (79, 2)], bpm=150, name="pizz", gain=-15, upto=S["storm"] - 0.2, seed=4)
groove(mus, on_beat(S["want"] + 0.3), S["storm"] - 0.15, 132, ["F", "C", "G", "C"], gain=-13, seed=5, kick_on=True, snaps=True, arp=False, padv=False)
# 3: the storm and the fox: a dark low pulse; a sting on the grab
groove(mus, on_beat(S["storm"] + 0.2), c["grab"] - 0.05, 120, ["Dm", "Dm", "Bb", "A"], gain=-12, seed=6, kick_on=True, snaps=False, arp=False, half=True, cutoff=700)
crash(mus, c["grab"] + 0.3, gain=-19, seed=7)
# 4: the lemon: nothing (deadpan); the radio: a soft pad, then Pip's music box (the theme, small and high)
mus.add(pad([mtof(57), mtof(64), mtof(69)], S["growl"] - S["radio"], 0.8, 1000, 8), S["radio"] + 0.3, db(-21))
theme(c["question"], ASK, bpm=120, name="box", gain=-19, tr=12, upto=S["growl"] - 0.1, seed=9)
# 5: the first day: a bouncy marimba groove for the growl and the cleaning
groove(mus, on_beat(c["growls"] + 1.0), S["echo"] - 0.1, BPM, ["C", "F", "C", "G"], gain=-10, seed=10, kick_on=True, snaps=True, arp=True)
# 6: lunchtime and the alarm clock: brighter, a key up, with snaps
groove(mus, on_beat(S["alarm"] + 0.2), c["ignore"] - 0.1, 120, ["D", "G", "D", "A"], gain=-10, seed=11, kick_on=True, snaps=True, arp=True, sixteen=True)
# 7: the snooze: half time, a lazy pad
groove(mus, on_beat(c["ignore"] + 0.3), S["fist"] - 0.1, 90, ["G", "Em", "C", "D"], gain=-13, seed=12, kick_on=False, snaps=False, arp=True, half=True, cutoff=1000)
# 8: the fist and the pantry: clockwork (a ticking arp)
groove(mus, on_beat(c["squeeze"] + 0.6), S["hangry"] - 0.1, 116, ["Am", "F", "C", "G"], gain=-11, seed=13, kick_on=True, snaps=False, arp=True, sixteen=True, cutoff=1500)
# 9: hour eighteen: a cranky pizzicato for the argument (stopped for the punchline)
groove(mus, on_beat(S["hangry"] + 0.2), c["withFox"] - 0.1, 104, ["Dm", "Dm", "A", "Dm"], gain=-12, seed=14, kick_on=False, snaps=False, arp=False, padv=False)
# 10: day one, the easy part: a low drone and the storm
fdrone(mus, S["easy"], S["borrow"] + 0.3, [38, 45, 50], cutoff=360, gain=-19, seed=15)
# 11: day two: colder, a minor pulse, half time
groove(mus, on_beat(S["borrow"] + 0.3), S["switch"] - 0.1, 100, ["Am", "Am", "F", "E"], gain=-12, seed=16, kick_on=True, snaps=False, arp=True, half=True, cutoff=900)
# 12: day three, the switch: wonder (a rising arpeggio, a key lift into the packed lunch)
groove(mus, on_beat(c["bigSwitch"] + 0.3), S["lunch"] - 0.05, 112, ["F", "G", "Am", "C"], gain=-10, seed=17, kick_on=True, snaps=True, arp=True, sixteen=True, cutoff=1800)
groove(mus, on_beat(S["lunch"] + 0.1), c["chocBarW"] - 0.1, 112, ["G", "A", "Bm", "D"], gain=-10, seed=18, kick_on=True, snaps=True, arp=True, sixteen=True, cutoff=2000)
# 13: the breath: playful pizzicato; the hunger going quiet: a calm pad
theme(S["breath"] + 0.3, ASK, bpm=150, name="pizz", gain=-16, upto=c["hisBreath"] - 0.1, seed=19)
mus.add(pad([mtof(55), mtof(62), mtof(67), mtof(71)], S["minnesota"] - S["quiet"], 0.8, 1300, 20), S["quiet"] + 0.2, db(-18))
# 14: 1944: the theme on an old upright piano, darker chords under the minds
theme(S["minnesota"] + 0.3, ASK, bpm=84, name="piano", gain=-15, upto=S["obsessed"], seed=21)
theme(S["obsessed"] + 0.2, [(64, 1), (67, 1), (72, 1), (77, 4)], bpm=96, name="piano", gain=-16, upto=S["day5"], seed=22)
rag(mus, on_beat(c["gum"] - 0.2), S["day5"] - 0.1, bpm=126, gain=-6, seed=23)
# 15: day five: thin and lonely (the theme on glass, an octave down), Pip's music box again
theme(S["day5"] + 0.3, ASK, bpm=80, name="glass", gain=-21, upto=S["pip2"], seed=24)
theme(word_end("radio:", c["pip2"]) + 0.05, ASK, bpm=120, name="box", gain=-21, tr=12, upto=S["edge"] - 0.1, seed=25)
# 16: the edge: a low drone; the pulse: only a soft pad, no beat (they are counting)
fdrone(mus, S["edge"], S["pulse"] + 0.5, [36, 43, 48], cutoff=330, gain=-18, seed=26)
mus.add(pad([mtof(50), mtof(57), mtof(62)], S["zero"] - S["pulse"], 1.5, 700, 27), S["pulse"] + 0.3, db(-22))
# 17: x10 and 37: the old trace; the heart and the limit: a slow dark drone, the theme low on glass
theme(S["zero"] + 0.3, [(72, 1), (74, 1), (76, 2)], bpm=110, name="marimba", gain=-17, upto=S["heart"], seed=28)
fdrone(mus, S["heart"], S["barbieri"], [36, 43, 48, 51], cutoff=420, gain=-19, seed=29)
theme(S["heart"] + 0.4, ASK, bpm=54, name="glass", gain=-23, tr=-12, upto=S["barbieri"], seed=30)
# 18: 1965: piano, then a rag that speeds up with the calendar; the toilet: a bwomp; the egg: ta-da
theme(S["barbieri"] + 0.3, ASK, bpm=96, name="piano", gain=-15, upto=S["barbieri2"], seed=31)
rag(mus, on_beat(S["barbieri2"] + 0.1), c["d382end"] + 0.2, bpm=144, gain=-6, seed=32)
groove(mus, on_beat(S["toilet"] + 0.3), c["forty"] - 0.1, 120, ["C", "G", "C", "G"], gain=-13, seed=33, kick_on=False, snaps=True, arp=False, padv=False)
theme(word_end("egg.", c["eggW"]) + 0.12, [(72, 1), (76, 1), (79, 1), (84, 3)], bpm=150, name="box", gain=-17, upto=S["day6"], seed=34)
# 19: midnight, day six: only a held note under the wind; nothing at all in the wordless beat (above: the heartbeat)
mus.add(pad([mtof(45), mtof(52)], c["unwraps"] + 0.4 - S["day6"], 1.0, 500, 35), S["day6"] + 0.2, db(-23))
# the wrap: the theme, alone, very quiet, on the music box, still hanging
theme(c["wrapsBack"] + 0.9, ASK, bpm=80, name="box", gain=-20, upto=S["rescue"] - 0.1, seed=36)
# 20: the storm breaks: the theme warm on strings over a big major pad
mus.add(pad([mtof(48), mtof(55), mtof(60), mtof(64), mtof(67)], S["soup"] + 0.3 - c["sunUp"], 0.6, 1800, 37), c["sunUp"] + 0.05, db(-19))
theme(c["sunUp"] + 0.4, ASK, bpm=90, name="strings", gain=-19, upto=S["soup"] + 0.2, seed=38)
# 21: the soup and starting small: a gentle warm groove
groove(mus, on_beat(c["soupW"] + 0.6), S["home"] - 0.1, 100, ["C", "F", "Am", "G"], gain=-12, seed=39, kick_on=False, snaps=True, arp=True, half=True, cutoff=1400)
# 22: home and Pip: the theme slow and warm on piano, still hanging on its F; a pad under the reveal
theme(S["home"] + 0.4, ASK, bpm=84, name="piano", gain=-15, upto=S["reveal"] + 0.2, seed=40)
mus.add(pad([mtof(53), mtof(60), mtof(65), mtof(69)], c["snap"] - 0.3 - S["reveal"], 1.0, 1500, 41), S["reveal"] + 0.2, db(-17))
theme(c["because"], ASK, bpm=72, name="strings", gain=-21, upto=c["soWas"] - 0.15, seed=42)
# 23: the snap in silence; the bigger half; the final image: the theme finally comes home (F E D C)
HOME2 = [(72, 1), (74, 1), (76, 1), (79, 1), (77, 1), (76, 1), (74, 1), (72, 3)]
theme(c["bigger"] + 0.6, HOME2, bpm=108, name="box", gain=-18, seed=43)
theme(c["bigger"] + 0.6, HOME2, bpm=108, name="piano", gain=-21, tr=-12, seed=44)
mus.add(pad([mtof(48), mtof(55), mtof(60), mtof(64)], DUR - c["bigger"] - 0.6, 1.2, 1300, 45), c["bigger"] + 0.6, db(-20))

# ================================================================= payoffs: a build into each, a hit on it (the every-second rule)
PAY = sorted((t_, k_) for k_, t_ in C.items() if isinstance(t_, (int, float)) and k_.startswith(("pay_", "big_")))


def off_word(t_):
    on_w = [w for w in WORDS if w["start"] - 0.05 <= t_ <= w["end"]]
    return on_w[0]["end"] + 0.03 if on_w else t_


PAY = [(off_word(t_), k_) for t_, k_ in PAY]
held = []
for t_, k_ in PAY:
    big_ = k_.startswith("big_")
    r_ = 2.0 if big_ else 0.8
    sfx.add(pan_st(riser(r_, seed=int(t_ * 7), f0=180 if big_ else 500, f1=1800 if big_ else 2600), 0), t_ - r_, db(-32 if big_ else -37))
    if big_:
        held.append((t_ - 0.5, t_ - 0.02))
    else:   # the bright little reward lands just after the word it sits on, never on it
        on_w = [w for w in WORDS if w["start"] - 0.05 <= t_ <= w["end"]]
        tb = on_w[0]["end"] + 0.03 if on_w else t_
        sfx.add(pan_st(bell(1568 + 196 * (int(t_) % 3), 0.45, 0.22), 0.2), tb, db(-35))
# the music drops out: before each big payoff (held breath) and for the punchlines
punch = [(c["now"] - 0.4, c["now"] + 0.5), (word_end("lemon.", c["lemonW"]) - 0.6, S["radio"] + 0.2),
         (c["withFox"] - 0.1, S["easy"]), (c["tenth"] - 0.1, S["breath"] + 0.2), (c["hisBreath"] - 0.1, S["quiet"] + 0.1),
         (c["toFox"] - 0.1, S["pip2"]), (c["forty"] + 0.1, word_end("days.", c["forty"]) + 1.15), (c["papers"] - 0.1, word_end("egg.", c["eggW"]) + 0.1),
         (c["unwraps"] + 0.4, c["wrapsBack"] + 0.9), (c["snap"] - 0.3, c["bigger"] + 0.6), (c["dinner"] - 0.1, S["fist"]), (c["soWas"] - 0.15, c["snap"] - 0.3)]
silence(mus, held + punch)
for t_, k_ in PAY:   # the hits go in AFTER the silences, so they are never muted
    if k_.startswith("big_") and k_ not in ("big_unwrap", "big_wrap", "big_snap", "big_final", "big_soWas"):
        mus.add(pan_st(thump(0.8, 90, 38, 0.3, seed=int(t_)), 0), t_, db(-17))
mus.x *= (1 - (1 - db(-8)) * gate(N, [(c["sub"] - 0.2, DUR + 1)], smooth=0.3))[None, :]
# midnight: the effects bus quiet in the wordless beat except the paper and the heartbeat (bed); the wind stays
silence(amb, [(c["sunUp"] - 0.05, c["sunUp"] + 0.4)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21, "music": -10})
