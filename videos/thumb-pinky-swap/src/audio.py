"""Can You SWAP Your Thumb and Pinky? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: fist-edge-palm's audio.py (the last hand test) and the skill's reference/examples/audio.finger-wrinkles.py.
"""
import json
import os
import sys

import numpy as np  # noqa: F401

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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C
words = [(w["start"], w["end"]) for w in TL["words"]]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low(y, f=250.0):
    return filt(y, "lowpass", f)


def high(y, f=5200.0):
    return filt(y, "highpass", f)


def in_word(t, pre=0.03, post=0.06):
    return any(a - pre <= t <= b + post for a, b in words)


def pop(t, kind, gain=0.0, full=None):
    """a finger popping out of a fist: T the thumb (a round 'tok'), P the little finger (a higher 'tik'), F tucking in
    (a soft thud). Under 250 Hz plus a crisp top on a word; the whole pop in a pause."""
    if full is None:
        full = not in_word(t)
    f = {"T": 520.0, "P": 980.0, "F": 300.0}[kind]
    bed.add(pan_st(fade(low(thump(0.12, 210 if kind != "F" else 140, 80, 0.03), 240), 0.001, 0.03), 0.05), t, db(-17 + gain))
    bed.add(pan_st(fade(high(crack(0.03, 11, 0.005, 3000), 5200), 0.0005, 0.015), 0.1), t, db(-23 + gain))
    if full and kind != "F":
        n = int(0.08 * SR)
        y = np.sin(2 * np.pi * f * ar(n) * (1 + 0.25 * np.exp(-ar(n) / 0.01))) * expdecay(n, 0.018)
        sfx.add(pan_st(fade(y, 0.0005, 0.02), 0.08 if kind == "T" else -0.08), t, db(-22 + gain))


def pops_for(keys):
    """one pop per finger that changes between the swap keys [(time, R, L)]"""
    prev = keys[0]
    for k in keys[1:]:
        for col in (1, 2):
            if k[col] != prev[col]:
                pop(k[0] + (0.0 if col == 1 else 0.015), k[col] if k[col] in "TP" else "F")
        prev = k


def layered_hit(t, mid=True, gain=0.0):
    """the hitstop's hit (sound.md, "Hitstops"); mid=False keeps the body out of the speech band (it sits on a word)"""
    sfx.add(pan_st(filt(snap(51), "highpass", 1800 if mid else 5200), 0.0), t, db(-20 + gain))
    if mid:
        sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), t + 0.004, db(-17 + gain))
        sfx.add(cymbal(52, 0.35), t + 0.01, db(-31 + gain))
    else:
        sfx.add(pan_st(filt(kick(0.9), "lowpass", 240), 0.0), t + 0.004, db(-13 + gain))


def honk(dur=0.26, seed=0):
    """a wrong-answer double honk: two buzzy notes falling (speech band: in a pause)"""
    out = np.zeros(int(dur * SR))
    for i, (f0, t0) in enumerate(((330.0, 0.0), (247.0, dur * 0.45))):
        n = int(dur * 0.5 * SR)
        y = sum(np.sin(2 * np.pi * f0 * k * ar(n)) / k for k in range(1, 9))
        y = filt(y, "lowpass", 2200) * (np.minimum(1, ar(n) / 0.008) * np.exp(-ar(n) / 0.09))
        a = int(t0 * SR)
        out[a:a + n] += y[: len(out) - a]
    return fade(norm(out), 0.002, 0.03)


def squeak(f0=1900.0, dur=0.09, seed=0):
    """a squeaky toy (a kid's hands): a quick pitch rise (above 1.5 kHz; short)"""
    n = int(dur * SR)
    f = f0 * (1 + 0.35 * ar(n) / dur)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * ar(n) / dur)
    return fade(norm(y), 0.003, 0.02)


def bead_whistle(dur, seed=0):
    """the bead running down the string: a soft slide whistle, all above 4.5 kHz (it can sit under words)"""
    n = int(dur * SR)
    f = 4800 + 2600 * (ar(n) / dur)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(np.pi * ar(n) / dur))
    return fade(high(norm(y), 4500), 0.02, 0.05)


# ================================================================= ambience: the lake (lapping water, a far loon, birds)
lake_on = gate(N, [(0, DUR)])
LAPF = max(1, round(0.55 * DUR)) / DUR                                    # a lapping rate that divides the Short (loop-safe)
lap = norm(filt(brown(N, 5), "lowpass", 260) * (0.6 + 0.4 * np.abs(np.sin(np.pi * LAPF * tt))))
amb.x += pan_st(lap, 0.0) * 0.32 * lake_on
crickets(0.3, DUR - 0.4, bed, -36, seed=6, f=6400, rate=0.45)              # birds and insects far off, all high
sfx.add(pan_st(fade(tweet(4, 3700.0), 0.005, 0.05), 0.5), c["hand_end"] + 0.04, db(-29))
sfx.add(pan_st(fade(tweet(9, 4100.0), 0.005, 0.05), -0.5), c["grow_end"] + 0.06, db(-30))

# ================================================================= 1. the hook: Your right thumb out, left pinky out... can you SWAP them? Faster!
KEYS = [(-9, "T", "P"), (c["swap1"], "P", "T"), (c["faster"] + 0.02, "T", "P"), (c["faster"] + 0.26, "P", "T"),
        (c["fail"], "T", "T"), (c["keep"] + 0.05, "T", "P"), (c["keep"] + 0.45, "P", "T"), (c["every"] + 0.05, "T", "P"),
        (c["twin_w"] - 0.12, "T", "T"), (c["move"] - 0.3, "F", "F"), (c["move"] + 0.02, "T", "F"), (c["yank"], "T", "T"),
        (c["pinks1"], "P", "F"), (c["pinks2"], "P", "P"),
        (c["kids"] + 0.05, "T", "T"), (c["kids"] + 0.45, "P", "P"), (c["kids"] + 0.85, "T", "T"), (c["kids"] + 1.25, "P", "P"),
        (c["way"] + 0.1, "T", "T"), (c["way"] + 0.5, "P", "P"), (c["fades"], "F", "F"),
        (c["now"] + 0.05, "T", "P"), (c["swap2"] + 0.08, "P", "T"), (c["slow1"], "T", "P")]
pops_for(KEYS)
# frame 0: the two fingers already out; a soft double tok so picture and sound start together
pop(0.0, "T", -2.0, full=False)
# the THUMB and PINKY tags pop (high ticks)
bed.add(pan_st(glint(7000, 0.07, 1), 0.2), c["thumb1"], db(-25))
bed.add(pan_st(glint(7600, 0.07, 2), -0.2), c["pinky1"], db(-25))
# the fail: two thumbs, and a wrong-answer honk in the pause after "Faster!"
hk = honk(min(0.28, c["two"] - c["fail"] - 0.04), 3)
sfx.add(pan_st(hk, 0.0), c["fail"] + 0.02, db(-17))
bed.add(pan_st(fade(low(thump(0.2, 150, 50, 0.06), 240), 0.001, 0.04), 0.0), c["fail"], db(-12))
sfx.add(pan_st(whoosh(0.2, 300, 2200, 4), 0.1), SHOT["fast"] - 0.16, db(-25))            # the cut to his face
bed.add(pan_st(glint(7400, 0.1, 7), 0.35), c["ff"], db(-22))                                # the flash window pops
bed.add(pan_st(glint(6900, 0.08, 8), 0.35), c["ff"] + 0.55, db(-24))
bed.add(pan_st(fade(high(chain_jingle(0.2, 9, True), 5000), 0.005, 0.04), 0.35), c["ff"] + 0.15, db(-24))   # a jingle in the window

# ================================================================= 2. the answer: Two thumbs? Your hands are... COPYCATS.
sfx.add(pan_st(whoosh(0.22, 400, 2600, 12), 0.2), SHOT["copycat"] - 0.18, db(-21))         # the whip to the cat
layered_hit(c["copycats"] + 0.1, mid=False, gain=0.0)                                       # the hitstop on her paws
bed.add(pan_st(glint(8200, 0.12, 13), 0.0), c["copycats"] + 0.08, db(-20))
mw = meow(min(0.3, c["keep"] - c["copycats_end"] - 0.04), 760.0, 980.0, 560.0, 14)
sfx.add(pan_st(fade(mw, 0.01, 0.05), 0.1), c["copycats_end"] + 0.02, db(-19))               # her "mew" (in the pause)

# ================================================================= 3. the twins: Keep swapping. Every finger's got a TWIN on the other hand.
for i in range(3):                                                                          # the strings pop on "TWIN" (high)
    bed.add(pan_st(glint(6600 + 600 * i, 0.08, 20 + i), -0.2 + 0.2 * i), c["twin_w"] - 0.05 + 0.05 * i, db(-21))
tw = twang(392.0, min(0.24, c["move"] - c["hand_end"] - 0.02), 21, -0.03)
sfx.add(pan_st(fade(tw, 0.003, 0.05), -0.1), c["hand_end"] + 0.01, db(-20))                # the strings twang (in the pause)

# ================================================================= 4. Move one... and its twin wants to move too.
sfx.add(pan_st(whoosh(0.2, 300, 2200, 30), -0.2), SHOT["want"] - 0.16, db(-25))
bw = bead_whistle(c["yank"] - c["move"] - 0.1, 31)
bed.add(pan_st(bw, 0.0), c["move"] + 0.08, db(-24))                                         # the bead runs the string (high)
bo = boing(0.42, 150.0, 32)
bed.add(pan_st(fade(low(bo, 260), 0.002, 0.06), 0.15), c["yank"], db(-12))                  # BOING (low: it sits on "wants")
bed.add(pan_st(fade(high(crack(0.03, 33, 0.005, 3000), 5200), 0.0005, 0.02), 0.15), c["yank"], db(-20))
bo2 = boing(min(0.36, c["kids"] - c["pinks2"] - 0.04), 210.0, 34)
sfx.add(pan_st(fade(bo2, 0.002, 0.06), -0.15), c["pinks2"] + 0.01, db(-17))                 # the little finger's boing (in the pause)

# ================================================================= 5. Kids' hands copy WAY more... it fades as you grow.
for i, d in enumerate((0.05, 0.45, 0.85, 1.25)):                                             # a toy squeak on every copy (high)
    bed.add(pan_st(squeak(2100 + 300 * (i % 2), 0.08, 40 + i), 0.3 - 0.2 * (i % 2)), c["kids"] + d, db(-24))
for i, d in enumerate((0.1, 0.5)):
    bed.add(pan_st(squeak(2300 + 300 * i, 0.08, 45 + i), -0.2 + 0.4 * i), c["way"] + d, db(-24))
sfx.add(pan_st(fade(marimba(L.mtof(84), 0.2, 47), 0.002, 0.05), 0.2), c["kids"] - 0.08, db(-24))   # AGE 4: a toy note
rs = riser(0.5, 48, 300, 1200)
bed.add(pan_st(fade(high(rs, 4000), 0.05, 0.1), 0.0), c["fades"] - 0.05, db(-26))           # growing up: a soft riser (high)

# ================================================================= 6. In some families, one faulty gene keeps it... for LIFE.
sfx.add(pan_st(whoosh(0.22, 400, 2600, 50), 0.2), SHOT["gene"] - 0.18, db(-22))            # the whip to the wide shot
bed.add(pan_st(glint(7200, 0.09, 51), 0.25), c["wave0"] + 0.05, db(-23))                    # the wave (twinkles, high)
bed.add(pan_st(glint(7700, 0.09, 52), -0.25), c["wave0"] + 0.2, db(-23))
bed.add(pan_st(fade(high(chain_jingle(0.3, 53, True), 4800), 0.005, 0.05), 0.0), c["gene_w"] + 0.02, db(-18))   # the strings turn to chain
bed.add(pan_st(fade(high(chain_jingle(0.22, 54, True), 4800), 0.005, 0.05), -0.2), c["keeps"] + 0.05, db(-21))
# full silence before the payoff ("keeps it..." to LIFE), then the biggest hit: the padlock snaps shut
lock_t = c["lock"]
ls = lock_snap(55, edges=False)
sfx.add(pan_st(fade(ls, 0.0005, 0.05), 0.0), max(c["it2_end"] + 0.05, lock_t - 0.02), db(-13))
nd = int(0.34 * SR)
dun = sum(L.saw(L.mtof(m), nd, 0.004, 560 + m) for m in (45, 52, 57, 60))
dun = filt(dun, "lowpass", 220) * np.exp(-ar(len(dun)) / 0.12)
dun = norm(dun)
bed.add(pan_st(fade(np.tanh(2.6 * dun) / np.tanh(2.6), 0.002, 0.08), 0.0), lock_t, db(-10))   # the low DUN under "LIFE"
layered_hit(lock_t + 0.004, mid=False, gain=1.5)

# ================================================================= 7. the button: Now swap them... SLOWLY. (the cat's paws: pat... pat)
sfx.add(pan_st(whoosh(0.2, 300, 2200, 70), -0.1), SHOT["button"] - 0.18, db(-25))
for i, d in enumerate((0.3, 0.9, 1.5)):
    tq = c["now"] + d
    bed.add(pan_st(fade(low(thump(0.1, 220, 100, 0.025), 240), 0.001, 0.03), 0.3 - 0.2 * i), tq, db(-21))
# (the loop: frame 0's double tok at the start of the file)

# ================================================================= score: the loop score (a whole number of bars), stopping dead
BPM, BEAT, BARS = fit_loop(DUR, 100, 128, want=112)
bM = bar_at(c["keep"], BEAT, 1)          # the twins on the beat nearest "Keep"
bK = bar_at(c["kids"], BEAT, 1)          # the toy box on the beat nearest "Kids'"
bG = bar_at(SHOT["gene"], BEAT, 1)       # the families on the beat nearest its cut
bB = bar_at(SHOT["button"], BEAT)        # the button on a BAR line: whole bars to the loop
print(f"loop score: {BARS} bars at {BPM:.1f} BPM (beat {BEAT:.3f} s; bars x 4 x beat = {BARS * 4 * BEAT:.3f} s = DUR {DUR:.3f} s); "
      f"sections at {bM:.2f}, {bK:.2f}, {bG:.2f}, {bB:.2f} s")
groove(mus, 0.0, bM, BPM, ["G", "C", "D", "G"], gain=-12.5, seed=20, kick_on=True)           # the swap groove: bright
SWAP = [(0, 79), (0.5, 74), (1, 74), (1.5, 79), (2, 79), (2.5, 74), (3, 74), (3.5, 79)]          # his motif: high-low, low-high (the swap)
riff(mus, SWAP, BEAT, 0.0, bM, every=8, gain=-22, octave=None)
groove(mus, bM, bK, BPM, ["Em", "C", "G", "D"], gain=-14.0, seed=21, kick_on=False, snaps=False, padv=False, arp=True)   # the strings: lighter
groove(mus, bK, bG, BPM, ["C", "F", "G", "C"], gain=-14.5, seed=22, kick_on=False, padv=False)   # the toy box
riff(mus, [(0, 84), (0.5, 88), (1, 91), (2, 88)], BEAT, bK, bG, every=4, inst=steel_pan, gain=-24, octave=None)   # a toy-piano run
groove(mus, bG, bB, BPM, ["Am", "F", "C", "G"], gain=-13.0, seed=23, kick_on=True, padv=True)   # the families: warm
riff(mus, [(0, 76), (1, 79), (2, 81), (3, 79)], BEAT, bG, bB, every=8, inst=marimba, gain=-23, octave=None)   # the cat's motif
groove(mus, bB, DUR - 1e-4, BPM, ["G", "C", "D", "G"], gain=-12.5, seed=24, kick_on=True)        # the button: the swap groove
riff(mus, SWAP, BEAT, bB, DUR - 0.05, every=8, gain=-22, octave=None)
shaker(mus, bB, DUR, BEAT)
shaker(mus, 0.0, bM, BEAT, gain=-33.0)
# the last beat leads into bar 1 (two pickup notes, gone before the loop)
mus.add(pan_st(fade(marimba(L.mtof(74), 0.2, 400), 0.002, 0.05), 0.2), DUR - BEAT, db(-20))
mus.add(pan_st(fade(marimba(L.mtof(79), 0.2, 401), 0.002, 0.08), -0.2), DUR - BEAT / 2, db(-20))
# the dead stops (direction.md rule 16): the fail (two thumbs), the punchline COPYCATS, the BOING, full silence before
# the payoff (the padlock on LIFE)
silence(mus, [(0.0, c["thumb1"] + 0.05),                                 # the music enters after the first word
              (c["fail"] - 0.03, c["thumbs_end"] + 0.1),
              (c["copycats"] - 0.05, c["copycats_end"] + 0.3),
              (c["yank"] - 0.03, c["yank"] + 0.4),
              (c["it2_end"] - 0.25, lock_t + 0.25),
              (c["swap2"] + 0.3, c["slowly"] + 0.08)])                   # "...them..." held in silence before SLOWLY

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.5, "sfx": -11.5}, duck={"music": 0.72})
