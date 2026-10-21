"""Why Can't You TICKLE Yourself? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
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
c = C

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(scritch=-27, scritchE=-30, cricket=-24, pop=-23, page=-24, slap=-17, bwomp=-11, copier=-22, paper=-27, glint=-24,
         ding=-21, blip=-22, click=-29, powerdown=-21, swish=-25, boop=-21, squeak=-26, alarm=-23, alarmE=-30, laugh=-18,
         giggle=-21, thud=-17, servo=-27, servoE=-31, handle=-33, tick=-30, roll=-30, crash=-18, bubble=-22, buzzer=-24,
         shrug=-24, whoosh=-21)


def low_thud(seed=0):
    """a heavy low thump, all of it under ~220 Hz (it can sit on a word)"""
    return filt(kick(1.0), "lowpass", 220)


def nail_scratch(dur, seed=0, rate=7.3, edges=False):
    """fingernails scribbling on skin: short dry strokes of filtered noise, `rate` a second (the picture's wiggle goes
    round 3.66 times a second, two strokes a turn). edges=True keeps what is above 5.2 kHz, so it can run under a line."""
    n = int(dur * SR)
    y = np.zeros(n)
    k, t0 = 0, 0.0
    rng = np.random.default_rng(seed)
    while t0 < dur - 0.02:
        m = int((0.05 + 0.03 * rng.random()) * SR)
        s = filt(white(m, seed + k), "bandpass", [2600 + 600 * (k % 2), 8200]) * attack_decay(m, 0.008, 0.03)
        s *= 0.7 + 0.3 * rng.random()
        i = int(t0 * SR)
        y[i:i + m] += s[: max(0, min(m, n - i))]
        t0 += 1.0 / rate * (0.85 + 0.3 * rng.random())
        k += 1
    if edges:
        y = filt(y, "highpass", 5200)
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.03)


def copier(dur, seed=0):
    """an office copier printing: a motor hum under 280 Hz and the paper running out on top (above 5 kHz): it can run
    under a line"""
    n = int(dur * SR)
    t = ar(n)
    hum = filt(np.sign(np.sin(2 * np.pi * 96 * t)) * 0.5 + np.sin(2 * np.pi * 48 * t), "lowpass", 280) * (0.75 + 0.25 * np.sin(2 * np.pi * 9 * t))
    paper = filt(white(n, seed), "highpass", 5600) * (0.4 + 0.6 * np.clip(np.sin(2 * np.pi * 2.2 * t), 0, 1))
    y = 0.8 * hum + 0.35 * paper
    return fade(y / (np.abs(y).max() + 1e-9), 0.04, 0.08)


def servo(dur, f0=240.0, f1=420.0, seed=0, edges=False):
    """a robot arm's servo: a buzzy whine that glides (speech band: whole in a pause; edges=True keeps what is under
    260 Hz and above 5.2 kHz, for under a line)"""
    n = int(dur * SR)
    t = ar(n)
    f = f0 + (f1 - f0) * np.clip(t / dur, 0, 1) ** 0.7
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(j * ph) / j for j in range(1, 18)) + 0.25 * filt(white(n, seed), "highpass", 6000)
    if edges:
        y = filt(y, "lowpass", 260) + filt(y, "highpass", 5200)
    y *= np.clip(t / 0.05, 0, 1) * np.clip((dur - t) / 0.08, 0, 1)
    return y / (np.abs(y).max() + 1e-9)


def tiptoe(bus, t0, t1, bpm, gain, seed=0):
    """a sneaky pizzicato tiptoe: staccato notes of a creeping minor line, low-passed under 320 Hz so it can run under a
    line (an open pizzicato in the speech band put "someone" 2.7 dB over it), with a tiny tick above 5 kHz on each step"""
    line_ = [62, 65, 69, 68, 67, 66, 65, 64]   # D F A G# G F# F E
    beat = 60 / bpm
    k, tk = 0, t0
    while tk < t1 - 0.05:
        m = line_[k % len(line_)]
        bus.add(pan_st(filt(pizz(mtof(m - 12), 0.22, seed + k), "lowpass", 320), -0.2 + 0.4 * (k % 2)), tk, db(gain))
        bus.add(pan_st(glint(6800 + 300 * (k % 3), 0.04, seed + 90 + k), 0.3 * (-1) ** k), tk, db(gain - 12))
        if k % 2 == 0:
            bus.add(pan_st(filt(pizz(mtof(m - 24), 0.3, seed + 50 + k), "lowpass", 260), 0), tk, db(gain - 2))
        tk += beat / 2
        k += 1


# ================================================================= ambience (one bed per world, gated to its shots)
room_on = gate(N, [(0, SHOT["brain"] + 0.45), (SHOT["payoff"] - 0.05, SHOT["lab"] + 0.05), (SHOT["button"] - 0.05, DUR)])
amb.x += pan_st(filt(brown(N, 1), "lowpass", 220), 0) * 0.5 * room_on                            # the living room
amb.x += pan_st(filt(white(N, 2), "highpass", 7000), 0.25) * 0.015 * room_on                      # the TV's faint hiss
brain_on = gate(N, [(SHOT["brain"] + 0.35, SHOT["payoff"])])
amb.x += pan_st(filt(brown(N, 3), "lowpass", 170), 0) * 0.42 * brain_on                           # a low hush inside his head
lab_on = gate(N, [(SHOT["lab"], SHOT["button"])])
amb.x += pan_st(filt(brown(N, 4), "lowpass", 300), 0) * 0.4 * lab_on                              # the lab's fans

# ================================================================= the hook: he tickles his own palm... nothing
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 5, 0.8), "lowpass", 260), 0), 0.0, db(G["whoosh"]))    # frame 1 lands
bed.add(pan_st(nail_scratch(c["nothing"] - 0.05, 6, 7.3, edges=True), 0.25), 0.0, db(G["scritchE"]))   # under the line: only its top
for a, b in [(c["palm_end"] + 0.03, c["right1"] - 0.08), (c["now_end"] + 0.04, c["nothing"] - 0.1)]:   # whole in the pauses
    if b - a > 0.08:
        sfx.add(pan_st(nail_scratch(b - a, 7 + int(a * 10), 8.5), 0.25), a, db(G["scritch"]))
sfx.add(pan_st(cricket(8, 3, 4700), 0.4), c["right2_end"] + 0.06, db(G["cricket"]))              # "Nothing, right?" ... cricket
sfx.add(pan_st(cork_pop(9, 700.0), 0), c["your1"] - 0.12, db(G["pop"]))                           # the window on his forehead
bed.add(pan_st(filt(page_rip(0.14, 10), "highpass", 4000), -0.1), c["read"] + 0.05, db(G["page"]))  # a page turns (top only)
sfx.add(pan_st(slap_hit(11), 0), c["spoiler_end"] + 0.01, db(G["slap"]))                          # SPOILERS slaps onto the cover
bwomp(mus, c["spoiler_end"] + 0.03, m=34, gain=G["bwomp"])                                         # ...bwomp

# ================================================================= the brain's room: a copy of every move, the forecast
sfx.add(pan_st(filt(whoosh(0.55, 150, 700, 20, 0.9), "lowpass", 280), 0), SHOT["brain"] + 0.02, db(G["whoosh"]))   # the dive
bed.add(pan_st(copier(c["move_end"] - c["keeps"] + 0.1, 21), -0.3), c["keeps"], db(G["copier"]))  # the copier runs
for k in range(3):                                                                                # copies fly out
    bed.add(pan_st(filt(rustle(0.16, 22 + k), "highpass", 4800), -0.4 + 0.2 * k), c["every"] + 0.28 * k, db(G["paper"]))
sfx.add(pan_st(rustle(0.2, 25), -0.3), c["move_end"] + 0.04, db(G["paper"] + 2))                  # the stack settles (pause)
for i in range(4):                                                                                # the forecast ring lands
    bed.add(pan_st(glint(5600 + 450 * i, 0.1, 26 + i), 0.1 * i), c["exactly"] + 0.04 * i, db(G["glint"]))
sfx.add(pan_st(ding(88, 0.09, 30), 0.15), c["lands_end"] + 0.01, db(G["ding"] - 2))               # the finger lands on it: tick

# ================================================================= the knob: no surprise, so it turns the feeling down
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 31, 0.8), "lowpass", 280), 0), SHOT["knob"] - 0.12, db(G["whoosh"] - 3))
bed.add(pan_st(glint(6000, 0.08, 32), 0.3), c["surprise"] + 0.1, db(G["glint"]))                  # the touch runs down the cable
sfx.add(pan_st(lamp_pip(1500.0, 0.09, 33, 0.05), 0.3), c["surprise_end"] + 0.03, db(G["blip"]))   # and arrives: pip (pause)
bed.add(pan_st(ratchet(c["down"] - c["turns"], 26.0, 12.0, 34, edges=True), 0.3), c["turns"], db(G["click"]))   # the knob clicks down
sfx.add(pan_st(slide(392, 150, 0.36, vib=0.5, harm=5), 0.2), c["down_end"] + 0.02, db(G["powerdown"]))   # ...and the feeling powers down

# ================================================================= Pip's finger: no warning... and he falls apart
sfx.add(pan_st(filt(whoosh(0.3, 300, 1800, 40, 0.7), "highpass", 5000), 0.5), c["but"] - 0.05, db(G["swish"]))   # she leans in (top only)
sfx.add(pan_st(bloop(520, 900, 0.12), 0.3), c["finger2_end"] + 0.05, db(G["boop"]))               # boop: her finger lands
sfx.add(pan_st(squeak(0.12, 2100, 3100), 0.1), c["finger2_end"] + 0.2, db(G["squeak"]))           # his jolt
sfx.add(pan_st(cork_pop(41, 760.0), -0.2), c["no2"] - 0.14, db(G["pop"]))                         # the window pops open
bed.add(pan_st(alarm_ring(c["warning_end"] - c["no2"], 42, 26.0, 2350.0, edges=True), -0.2), c["no2"], db(G["alarmE"]))   # the alarm
sfx.add(pan_st(alarm_ring(c["and_you"] - c["warning_end"] - 0.16, 43, 26.0, 2350.0), -0.2), c["warning_end"] + 0.01, db(G["alarm"]))
sfx.add(pan_st(low_thud(44), 0), c["apart"] + 0.25, db(G["thud"]))                                # he crumples (low: it can sit on "apart")
sfx.add(pan_st(snicker(45, 205.0, 4), -0.2), c["apart_end"] + 0.03, db(G["laugh"]))               # HA HA HA HA
sfx.add(pan_st(snicker(46, 430.0, 3), 0.45), c["apart_end"] + 0.12, db(G["giggle"]))              # Pip: hee hee

# ================================================================= the lab: the robot copies his tickle, a fifth of a second late
sfx.add(pan_st(filt(whoosh(0.4, 200, 900, 50, 0.8), "lowpass", 300), 0), SHOT["lab"] - 0.1, db(G["whoosh"]))
bed.add(pan_st(servo(c["robot1"] + 0.5 - c["scientists"], 230.0, 410.0, 51, edges=True), 0.4), c["scientists"], db(G["servoE"]))   # it swings in
bed.add(pan_st(nail_scratch(c["tickle2_end"] - c["copy2"] + 0.2, 52, 4.0, edges=True), 0.1), c["copy2"], db(G["scritchE"]))   # the foam at 2 Hz
ticks = [c["fifth"] + 0.2, c["second"] + 0.15]                                                     # DELAY 0.1, 0.2
for i, tk in enumerate(ticks):
    bed.add(pan_st(glint(6400 + 600 * i, 0.08, 53 + i), 0.2), tk, db(G["tick"] + 4))
sfx.add(pan_st(beep(2400.0, 0.05), 0.2), c["late_end"] + 0.04, db(G["blip"] - 2))                 # 0.2 s: set (pause)
ticking(c["and_sud"] - 0.05, c["it3"] - 0.03, bed, db(G["roll"]), r0=5, r1=24, seed=55)             # the tension: ticks that speed up
sfx.add(pan_st(snicker(56, 235.0, 4), -0.1), c["tickled_end"] + 0.04, db(G["laugh"]))             # he giggles helplessly
sfx.add(pan_st(snicker(57, 270.0, 2), 0.15), c["tickled_end"] + 0.3, db(G["laugh"] - 3))       # (ends before "No")
crash(mus, c["tickled_end"] + 0.02, gain=G["crash"], seed=58)

# ================================================================= the button: no robot? good luck. Back to tickling (the loop)
sfx.add(pan_st(filt(whoosh(0.3, 200, 900, 60, 0.7), "lowpass", 300), 0), SHOT["button"] - 0.1, db(G["whoosh"]))
for i in range(2):                                                                                # the thought bubble pops up
    bed.add(pan_st(glint(6200 + 700 * i, 0.07, 61 + i), -0.3), c["no3"] - 0.13 + 0.05 * i, db(G["glint"]))
sfx.add(pan_st(buzzer(0.12), -0.2), c["robot2_end"] + 0.02, db(G["buzzer"]))                     # crossed out
sfx.add(pan_st(boing(0.18, 260.0, 62), 0.1), c["luck_end"] + 0.06, db(G["shrug"]))                # the shrug
sfx.add(pan_st(nail_scratch(DUR - c["luck_end"] - 0.42, 63, 8.5), 0.25), c["luck_end"] + 0.36, db(G["scritch"]))   # back at it: the loop

# ================================================================= score (it drops out for every punchline)
BPM = 112
# the brain's room: a curious marimba/pizzicato groove from "Your brain keeps" to the tick
groove(mus, c["your2"] + 0.16, c["lands_end"], BPM, ["Am", "F", "C", "G"], gain=-6, seed=10, kick_on=False)
# the knob: the same, thinner, until "down"
groove(mus, c["no1"] + 0.1, c["down"] - 0.05, BPM, ["Am", "F"], gain=-9, seed=12, kick_on=False, half=True, arp=False)
# Pip sneaks in: a pizzicato tiptoe
tiptoe(mus, c["but"] + 0.12, c["finger2_end"] - 0.02, BPM, -9, 70)
# the lab: a brighter groove until "And suddenly", then the ticks; after the giggle it comes back
groove(mus, c["scientists"] + 0.18, c["and_sud"] - 0.12, 116, ["Em", "C", "G", "D"], gain=-8, seed=20, kick_on=False, snaps=True)
groove(mus, c["tickled_end"] + 0.05, SHOT["button"] - 0.05, 116, ["G", "D"], gain=-8, seed=22, kick_on=False, snaps=True)
silence(mus, [(c["lands_end"] - 0.02, c["no1"] + 0.1),          # the tick
              (c["down"] - 0.05, c["but"] + 0.1),               # "down." and the power-down
              (c["finger2_end"] - 0.02, c["scientists"] + 0.15),  # the boop, the alarm, the laugh
              (c["and_sud"] - 0.12, c["tickled_end"] + 0.02),   # "And suddenly... it TICKLED!" (the ticks carry it)
              (SHOT["button"] - 0.05, DUR)])                    # the button is dry, and the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": -8.0}, duck={"music": 0.74})
