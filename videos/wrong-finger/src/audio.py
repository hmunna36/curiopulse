"""Why Does the WRONG Finger Move? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

A campsite at night: a low fire rumble with crackle kept above 5 kHz, crickets now and then. His hands cross (a sleeve
swish, top only), the fingers lock (a wooden clack: low knock + a high tick, it sits on "clasp"), the knot rolls in (a
whoosh and a low whum). The raccoon's paw points (a glint), the wrong twin pops (a cork pop and a little boing in the pause
after "finger!"), the raccoon snickers in the pause after "one?". The flash-forward (a whoosh in, a thud out), OTHER HAND
(the hitstop's layered hit after "hand."), two more twins pop (pops in the pauses), the raccoon laughs (a snicker after
"one!"). The x-ray hum (under 200 Hz), LEFT (a glint), the call up his left arm (an old phone bell, its edges under the
line), the red X (a low thud), the blue twin (a pop after "them."). Then FULL SILENCE, only the night: the paw creeps in
(soft low steps), touches (a low boop on "TOUCHES"), and in the pause after "it..." the RIGHT finger pops: the biggest hit
of the Short (layered hit, a cork pop, a chime, a cymbal). The jaw drop (a low clunk), the skin's glow (glints), his eyes
dart (ticks), the "?" (a glint), the button (he points: a swish; the raccoon's own twin pops). The score is a sneaky
night groove on the loop grid (the bar line falls on the loop) with five dead stops; his test motif on the marimba, the
raccoon's motif a low tiptoe pizzicato. What sits on a word is kept under 300 Hz or above 5 kHz.
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
DUR = TL["duration"]
N = int(round(DUR * SR))
L.set_length(N)
tt = ar(N)

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.3, tau=0.1, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def glints(t, gain, n=7, seed=0, pan=0.0, step=0.05, f0=5600):
    """a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(f0 + 330 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def tick(t, gain, seed=0, pan=0.0, f=1600):
    """a dry high tick (above 1.6 kHz; on a word only when quiet)"""
    sfx.add(pan_st(fade(filt(snap(seed), "highpass", f), 0.001, 0.03), pan), t, db(gain))


def pop(t, gain, seed=0, pan=0.0, f=620.0, low=False):
    """a finger popping up: a cork pop (low = only its body under 300 Hz, for under a word)"""
    y = np.tanh(3.2 * norm(cork_pop(seed, f))) / np.tanh(3.2)    # soft-clipped: the same peak, more body (sound.md)
    if low:
        y = filt(y, "lowpass", 300)                     # after the clip, so its new harmonics stay out of the speech band
    sfx.add(pan_st(fade(y, 0.002, 0.05), pan), t, db(gain))


def layered_hit(t, gain, seed=0):
    """a hitstop's hit (sound.md, Hitstops): a crisp transient, a body at 300-950 Hz, a short bright tail"""
    sfx.add(pan_st(filt(snap(seed), "highpass", 1800), 0.0), t, db(gain - 3))
    sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), t + 0.004, db(gain))
    sfx.add(cymbal(seed + 1, 0.35), t + 0.01, db(gain - 14))


def tiptoe(bus, notes, t0, step, gain, seed=0):
    """the raccoon's motif: a sneaky low pizzicato (under 320 Hz) with a tick above 5 kHz on each step"""
    for i, m in enumerate(notes):
        tn = t0 + i * step
        bus.add(pan_st(filt(pizz(mtof(m), 0.3, seed + i), "lowpass", 320) * 1.6, -0.25), tn, db(gain))
        bus.add(pan_st(fade(filt(white(int(0.02 * SR), seed + 50 + i), "highpass", 5200) * expdecay(int(0.02 * SR), 0.006), 0.001, 0.005), -0.25), tn, db(gain - 10))


def ring_bell(t, dur, gain, seed=0, edges=True):
    """an old phone bell (the call up his arm): only its edges under the line"""
    sfx.add(pan_st(fade(alarm_ring(dur, seed, 27.0, 1480.0, edges=edges), 0.01, 0.05), -0.3), t, db(gain))


# ================================================================= ambience: the campsite at night
fire = norm(filt(brown(N, 3), "lowpass", 240) * (0.8 + 0.2 * np.sin(2 * np.pi * (round(0.2 * DUR) / DUR) * tt)))
amb.x += pan_st(fire, 0.35) * 0.4
crk = norm(crackle(N, 18, 5, lo=5200, hi=9000))
amb.x += pan_st(crk, 0.4) * 0.12
crickets(0.6, DUR - 0.8, bed, -33, seed=7, f=5200, rate=0.8)

# ================================================================= 1. the hook: cross, clasp, roll them in
sw = whoosh(0.3, 500, 4200, 1, 0.7)
bed.add(pan_st(fade(filt(sw, "highpass", 5000), 0.005, 0.06), 0.0), 0.02, db(-24))            # the sleeves swish (top only)
low_thud(c["clack"], -15, 170.0, 0.18, 0.05)                                                   # the fingers lock: a knock...
tick(c["clack"] + 0.004, -26, 11, 0.0, 5200)                                                   # ...and a high tick (on "clasp")
rw = whoosh(0.8, 300, 5600, 12, 0.6)
bed.add(pan_st(fade(filt(rw, "highpass", 5000), 0.01, 0.1), 0.0), c["roll"] - 0.02, db(-22))  # the roll: top whoosh...
low_thud(c["rollmid"], -16, 110.0, 0.4, 0.14)                                                  # ...and a low whum
low_thud(c["rolled"], -15, 160.0, 0.16, 0.05)                                                  # it lands

# ================================================================= 2. the dare: the paw points, the TWIN pops
glints(c["point1"] - 0.06, -24, 3, 20, -0.1, 0.04, 6200)                                       # the paw arrives (a glint)
pop(c["pop1"] + 0.06, -12, 21, 0.2, 640.0)                                                     # the twin pops (as "finger!" ends)
bo = boing(0.28, 170.0, 22)
sfx.add(pan_st(fade(np.tanh(2.5 * norm(bo)) / np.tanh(2.5), 0.003, 0.05), 0.2), c["pop1"] + 0.12, db(-16))                         # ...with a little boing in the pause
sn = snicker(23, 260.0, 3)
sfx.add(pan_st(fade(sn, 0.004, 0.04), -0.2), c["one1_end"] + 0.05, db(-10))                    # the raccoon snickers (after "one?")

# ================================================================= 3. the answer: you moved its twin... on the OTHER hand
sfx.add(pan_st(fade(filt(whoosh(0.2, 600, 5400, 30), "highpass", 4800), 0.004, 0.04), -0.1), SHOT["answer"] - 0.18, db(-23))   # the whip
# the flash-forward: a whoosh in (top only, it sits under "twin..."), a soft thud out
sfx.add(pan_st(fade(filt(whoosh(0.22, 800, 5200, 31, 0.7), "highpass", 5000), 0.004, 0.05), -0.2), c["ff"], db(-23))
low_thud(c["ff"] + 0.58, -18, 140.0, 0.18, 0.05)
glints(c["glowB"], -25, 5, 32, 0.25, 0.04, 5800)                                               # the blue hand lights up
low_thud(c["slam2"], -11, 120.0, 0.28, 0.08, bus=sfx)                                          # OTHER HAND lands (after "hand.")
layered_hit(c["slam2"] + 0.01, -16, 33)

# ================================================================= 4. again: this one, and THIS one (the raccoon laughs)
sfx.add(pan_st(fade(filt(whoosh(0.2, 600, 5400, 40), "highpass", 4800), 0.004, 0.04), 0.2), SHOT["again"] - 0.18, db(-23))   # the whip
glints(c["point3"] - 0.05, -26, 2, 41, -0.1, 0.04, 6400)
pop(c["one3_end"] - 0.03, -14, 42, 0.25, 700.0, low=True)                                      # twin 2 pops (its body under 300 Hz...)
tick(c["one3_end"] + 0.01, -22, 46, 0.25, 5200)                                               # ...and a high tick, after "one."
glints(c["point3b"] - 0.05, -26, 2, 43, -0.1, 0.04, 6600)
pop(c["one3b_end"] + 0.0, -15, 44, -0.2, 760.0)                                                 # twin 3 pops (after "one!")
sn2 = snicker(45, 240.0, 4)
sfx.add(pan_st(fade(sn2, 0.004, 0.04), -0.2), c["laugh"] + 0.02, db(-17))                      # the raccoon falls back laughing

# ================================================================= 5. the mechanism: it's on your LEFT... you crossed them
bed.add(pan_st(fade(norm(filt(brown(int(4.7 * SR), 50), "lowpass", 170)), 0.2, 0.4), 0.0), c["glowA"], db(-24))   # the x-ray hum
glints(c["glowA"], -24, 5, 51, -0.25, 0.04, 5600)                                              # the orange hand lights up
glints(c["left4"] + 0.1, -25, 3, 52, -0.3, 0.05, 6800)                                         # LEFT
ring_bell(c["call"], 1.3, -20, 53, edges=True)                                                 # the call: a phone bell (edges)
ring_bell(c["hand5_end"] + 0.01, 0.15, -26, 54, edges=False)                                   # ...a real ring in the tiny pause after "hand."
low_thud(c["xslam"], -12, 100.0, 0.3, 0.1)                                                     # the red X (low, on "crossed")
pop(c["pop6"] + 0.02, -9, 55, 0.25, 600.0)                                                    # the blue twin pops (after "them.")

# ================================================================= 6. the payoff: (silence) if someone TOUCHES it... POP. you almost never miss.
for i in range(6):                                                                             # the paw creeps in: soft low steps
    tn = c["creep"] + 0.15 + i * 0.27
    if tn < c["contact"] - 0.1:
        bed.add(pan_st(filt(pizz(mtof(38 + (i % 2) * 2), 0.25, 60 + i), "lowpass", 300) * 1.4, -0.1), tn, db(-22))
low_thud(c["contact"], -14, 200.0, 0.14, 0.04)                                                 # boop: the touch (low, on "TOUCHES")
pop(c["popright"] + 0.02, -10, 61, 0.0, 560.0)                                                 # the RIGHT finger pops: the biggest hit
layered_hit(c["popright"] + 0.03, -11, 62)
sfx.add(pan_st(fade(chime(1046.5, 0.24), 0.002, 0.08), 0.1), c["popright"] + 0.05, db(-18))
sfx.add(cymbal(63, 0.32), c["popright"] + 0.04, db(-27))
low_thud(c["jaw"], -13, 90.0, 0.3, 0.1)                                                        # the raccoon's jaw drops (low clunk)
sfx.add(pan_st(fade(filt(whoosh(0.2, 600, 5400, 64), "highpass", 4800), 0.004, 0.04), -0.2), SHOT["miss"] - 0.16, db(-25))   # the whip

# ================================================================= 7. the sting: your skin knows. your eyes just guess.
glints(c["glow8"], -23, 7, 70, 0.1, 0.05, 5600)                                                # the skin lights up
for i in range(4):                                                                             # his eyes dart (ticks above 5 kHz)
    bed.add(pan_st(glint(6400 + 300 * (i % 2), 0.05, 71 + i), -0.3 + 0.2 * i), c["cut_eyes"] + 0.15 + i * 0.22, db(-24))
glints(c["q1"], -24, 2, 75, 0.0, 0.08, 7000)                                                   # the question marks
sl = slide_whistle(0.3, 1300, 500)
sfx.add(pan_st(fade(sl, 0.004, 0.05), 0.1), c["guess_end"] + 0.03, db(-18))                     # a deflating whistle (after "guess.")

# ================================================================= 8. the button: now try it on a friend
fw = whoosh(0.16, 500, 2400, 80, 0.6)
bed.add(pan_st(fade(filt(fw, "highpass", 5000), 0.004, 0.04), -0.3), c["point9"], db(-21))       # he points (top only)
pop(c["pop9"] + 0.02, -15, 81, -0.3, 700.0, low=True)                                           # the raccoon's own twin pops (low, on "friend")
tick(c["friend_end"] + 0.03, -22, 82, -0.3, 2400)                                              # ...and its tick, after the word

# ================================================================= score: a sneaky night groove on the loop grid
BPM, BEAT, BARS = loop_groove(mus, DUR, ["Dm", "Bb", "Gm", "A"], gain=-5, seed=10, kick_on=False, cutoff=1200)
# his test motif (the marimba) over the dare and the tries; the raccoon's tiptoe on its moves
riff(mus, [(0, 74), (0.5, 77), (1, 81), (2, 79), (2.5, 77), (3, 76), (4, 74), (4.5, 77), (5, 81), (6, 82), (6.5, 81), (7, 77)],
     BEAT, t0=bar_at(c["now1"], BEAT), t1=c["its"], every=8, gain=-22, inst=lambda m, d, s: marimba(mtof(m), d, s), octave=None)
tiptoe(mus, [38, 41, 43, 45], c["now1"] - 0.3, BEAT / 2, -18, 90)
tiptoe(mus, [38, 40, 41, 43, 45, 46], c["creep"] + 0.1, BEAT / 2, -19, 91)
shaker(mus, bar_at(c["try3"], BEAT), c["them_end"], BEAT)
# the dead stops (direction.md rule 16): the twin, OTHER HAND, the laugh, full silence before the RIGHT finger, the guess
silence(mus, [(c["finger1_end"] - 0.02, c["you2"] + 0.1),
              (c["other"] - 0.03, c["try3"] + 0.1),
              (c["one3b_end"] - 0.02, c["its"] + 0.12),
              (c["them_end"] - 0.02, c["you7"] + 0.12),
              (c["guess_end"] - 0.02, c["now9"] + 0.12)])
for k, m in enumerate((74, 77)):                                                               # two pickup notes into bar 1 (the loop)
    mus.add(pan_st(marimba(mtof(m), 0.25, 95 + k), 0.1), DUR - BEAT + k * BEAT / 2, db(-15))
print(f"score: {BARS} bars at {BPM:.1f} BPM (beat {BEAT:.3f} s) = {BARS * 4 * BEAT:.2f} s, the Short {DUR:.2f} s")

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
