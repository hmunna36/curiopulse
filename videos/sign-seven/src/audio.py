"""Can You Make a 7 in SIGN Language? 🤟 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The trail cafe at dusk (a warm room tone under 230 Hz, the stove's crackle above 5.4 kHz): the hand already up (a soft
fwip), the thumb landing on the ring fingertip (a low tap), three fingers UP (glints climbing), the pinky straining (a low
creak) and sinking (a slide whistle down, in the pause after "UP."), the whip to the marmot cook, its "eep?" (the
marmot's motif, in the pause after "Congrats."), the flash-forward's snick (high), the pan's flick and SLAP-SLAP: two
pancakes, after "TWO." (the hitstop's layered hit with them); the slow bend (a long low creak) and the pinky following
(two marimba notes, in the pause after "slowly."), the pancake on his head (SPLAT, in the pause after "follow?"); the hand
turning to glass (glints), the reins (leather creaking), the knot (a zip and a gold clink), the charioteer popping in,
"REINS!" (a leather snap, low), then a WHIP CRACK in the pause; the stage (a hall's air), the scissors sliding in (a
shing, high), full silence, the SNIP (the biggest hit, soft-clipped: a crack above 4 kHz and a thud under 250 Hz, so it
can sit on the word "snip"), little snips on "every tie..."; a harp running up in the pause before "Free fingers!" and
sparkles; the typewriter's clatter (its tops under the words, whole in the pauses) and its DING; the whip back to the
cafe and the marmot flipping pancakes like a machine (low flaps under the words, whole in the pause, its panicked
"EEP!"). The score is the loop score: a whole number of bars from frame 0 to the loop, a folk cafe groove (the steel pan
hook is his motif), a pizzicato-and-harpsichord stage for the violinist, a bright run for the free fingers and the
typing, the cafe groove again, frantic, for the button; it stops dead five times.
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


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low(y, f=250.0):
    return filt(y, "lowpass", f)


def high(y, f=5200.0):
    return filt(y, "highpass", f)


def low_thud(t, gain, f=150.0, dur=0.3, tau=0.1, bus=None):
    """a knock under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def strain(t, dur, gain, seed=0):
    """a finger straining: a low rubbery creak (under 240 Hz: it can sit under the words)"""
    y = creak(dur, seed, 50, 120)
    bed.add(pan_st(fade(filt(y, "lowpass", 240), 0.04, 0.05), 0.15), t, db(gain))


def shimmer(t, gain, n=7, seed=0, pan=0.0, step=0.05):
    """glass: a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(5600 + 360 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def splat(seed=0, dur=0.2):
    """a pancake landing: a wet flap (noise through a falling band) over a soft low thump"""
    n = int(dur * SR)
    y = filt(white(n, seed), "bandpass", [260, 2600]) * expdecay(n, 0.035)
    y = y + 0.8 * thump(dur, 190, 70, 0.05)[:n]
    return fade(norm(y), 0.002, 0.05)


def flap_low(seed=0):
    """a pancake landing, only under 250 Hz and above 5.2 kHz (it can sit on a word)"""
    y = splat(seed, 0.16)
    return low(y, 250) + 0.5 * high(y, 5200)


def eep(t, gain, f0=2300.0, f1=3300.0, dur=0.2, seed=0, pan=-0.3):
    """the marmot's whistle: a short squeaky rise (speech band: in a pause)"""
    y = squeak(dur, f0, f1)
    sfx.add(pan_st(fade(y, 0.004, 0.05), pan), t, db(gain))


def woodblock(t, gain, f=1150.0, seed=0, pan=-0.3, bus=None):
    """the marmot's woodblock tok (a hollow knock)"""
    n = int(0.09 * SR)
    y = np.sin(2 * np.pi * f * ar(n)) * expdecay(n, 0.018) + 0.3 * filt(white(n, seed), "bandpass", [800, 3000]) * expdecay(n, 0.006)
    (bus or sfx).add(pan_st(fade(y, 0.001, 0.02), pan), t, db(gain))


def layered_hit(t, mid=True, gain=0.0):
    """the hitstop's hit: a crisp transient, a body, a short bright tail (sound.md, "Hitstops"); mid=False keeps the body
    out of the speech band (for a hit that sits on a word)"""
    sfx.add(pan_st(filt(snap(51), "highpass", 1800 if mid else 5200), 0.0), t, db(-20 + gain))
    if mid:
        sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), t + 0.004, db(-17 + gain))
    else:
        sfx.add(pan_st(filt(kick(0.9), "lowpass", 240), 0.0), t + 0.004, db(-13 + gain))
    sfx.add(cymbal(52, 0.35) * (1.0 if mid else 0.0) + 0.0, t + 0.01, db(-31 + gain)) if mid else None


# ================================================================= ambience (one bed per world, gated to its shots)
cafe_on = gate(N, [(0, SHOT["violin"]), (SHOT["button"], DUR)])
stage_on = gate(N, [(SHOT["violin"], SHOT["type"])])
desk_on = gate(N, [(SHOT["type"], SHOT["button"])])
room = norm(filt(brown(N, 3), "lowpass", 230) * (0.9 + 0.1 * np.sin(2 * np.pi * 0.11 * tt)))
stove = norm(crackle(N, 9.0, 4, 5400, 11000))
hall = norm(filt(pink(N, 5), "lowpass", 260) + 0.3 * high(pink(N, 6), 6500))
amb.x += pan_st(room, 0.0) * 0.32 * cafe_on
bed.x += pan_st(stove, -0.3) * db(-35) * cafe_on
amb.x += pan_st(hall, 0.0) * 0.26 * stage_on
amb.x += pan_st(room, 0.1) * 0.22 * desk_on
for k in range(int((SHOT["button"] - SHOT["type"]) / 0.5)):            # the desk's clock: ticks above 5 kHz
    bed.add(pan_st(glint(6400 + 300 * (k % 2), 0.03, 900 + k), 0.4), SHOT["type"] + 0.1 + 0.5 * k, db(-31))

# ================================================================= 1. the hook: sign a seven... three fingers UP... the pinky sinks
sfx.add(pan_st(fade(whoosh(0.14, 500, 2600, 0, 0.6), 0.002, 0.04), 0.15), 0.0, db(-29))   # frame 1: the hand already moving (gone before "Can")
low_thud(c["ring1"] + 0.1, -17, 170.0, 0.18, 0.04)                                       # the thumb lands on the ring fingertip
for i in range(3):                                                                        # three fingers UP: glints climbing
    bed.add(pan_st(glint(5800 + 700 * i, 0.07, 10 + i), 0.1 + 0.1 * i), c["three"] + 0.05 + 0.07 * i, db(-22))
low_thud(c["fingers1"] + 0.12, -18, 200.0, 0.16, 0.04)
strain(c["fingers1"] + 0.1, c["sinking_end"] - c["fingers1"] + 0.1, -15, 1)               # the pinky straining (low)
sw = slide_whistle(0.42, 1500, 520)
sfx.add(pan_st(fade(sw, 0.01, 0.06), 0.2), c["up_end"] + 0.04, db(-17))                   # the pinky sinks (in the pause after "UP.")

# ================================================================= 2. the answer: Pinky sinking? Congrats. You just signed... TWO.
sfx.add(pan_st(whoosh(0.2, 300, 2200, 4), -0.1), SHOT["marmot"] - 0.18, db(-22))         # the whip to the marmot
woodblock(SHOT["marmot"] + 0.12, -23, 1150.0, 5)                                          # the marmot's tok as it squints
eep(c["congrats_end"] + 0.03, -17, 2200.0, 3100.0, 0.2, 6)                                # its "eep?" (in the pause after "Congrats.")
bed.add(pan_st(glint(7400, 0.1, 7), -0.35), c["congrats_end"] - 0.01, db(-21))           # the flash window pops
bed.add(pan_st(fade(high(crack(0.06, 8, 0.01, 900), 5200), 0.001, 0.02), -0.35), c["congrats_end"] + 0.2, db(-19))   # its snip (high)
fl = whoosh(0.18, 600, 3000, 9, 0.6)
bed.add(pan_st(fade(high(fl), 0.004, 0.04), -0.2), c["two"] - 0.05, db(-20))            # the pan flicks (high, on "TWO")
for i, dt in enumerate((0.0, 0.09)):                                                      # SLAP-SLAP: two pancakes (after "TWO.")
    sfx.add(pan_st(splat(11 + i), -0.15 + 0.1 * i), c["slap1"] + dt, db(-12.5))
layered_hit(c["slap1"] + 0.01)                                                            # the hitstop's hit
woodblock(c["slap1"] + 0.22, -21, 1300.0, 12)                                             # the marmot's smug tok

# ================================================================= 3. the slow try: bend the ring finger slowly... the pinky follows
strain(c["bend"] - 0.05, c["slowly_end"] - c["bend"] + 0.1, -15, 21)                       # the slow bend (low)
sfx.add(pan_st(fade(marimba(L.mtof(69), 0.15, 22), 0.001, 0.05), 0.1), c["slowly_end"] + 0.0, db(-16))    # the ring finger...
sfx.add(pan_st(fade(marimba(L.mtof(76), 0.14, 23), 0.001, 0.05), 0.35), c["slowly_end"] + 0.09, db(-17))   # ...and the pinky follows
strain(c["feel"] - 0.05, c["follow_end"] - c["feel"] + 0.05, -16, 24)
pw = slide_whistle(0.3, 900, 2200)
bed.add(pan_st(fade(high(pw, 5200), 0.01, 0.04), -0.4), c["slap2"] - 0.4, db(-20))        # a pancake flies in (its top only)
sfx.add(pan_st(splat(25, 0.22), 0.05), c["slap2"], db(-13))                               # SPLAT on his head (in the pause)
sfx.add(pan_st(fade(boing(0.2, 260.0, 26), 0.002, 0.06), 0.05), c["slap2"] + 0.06, db(-22))

# ================================================================= 4. inside: the cords are tied together... like chariot REINS!
shimmer(SHOT["inside"] + 0.04, -22, 7, 30, 0.1)                                           # the hand turns to glass
cr = creak(0.6, 31, 60, 140)
bed.add(pan_st(fade(low(cr, 240), 0.04, 0.08), 0.1), c["cords"] - 0.05, db(-17))         # the reins: leather creaking (low)
rz = ratchet(0.22, 30.0, 60.0, 32, True)
bed.add(pan_st(fade(rz, 0.004, 0.04), -0.1), c["tied"] - 0.02, db(-21))                   # the knot pulled tight (zip, high)
bed.add(pan_st(glint(6900, 0.12, 33), -0.15), c["tied"] + 0.18, db(-19))                 # the gold knot: clink (high)
strain(c["tied"], c["together_end"] - c["tied"], -16, 34)                                 # the pull (low)
sfx.add(pan_st(fade(bloop(240.0, 120.0, 0.18), 0.002, 0.04), 0.15), c["together_end"] + 0.02, db(-19))   # the charioteer pops in
low_thud(c["reins"] + 0.04, -14, 140.0, 0.22, 0.06)                                       # the yank (low, on "REINS")
cl = crack(0.12, 36, 0.03, 1400)
sfx.add(pan_st(fade(cl, 0.001, 0.03), 0.2), c["reins_end"] + 0.04, db(-14))               # WHIP CRACK (in the pause)
sfx.add(pan_st(fade(twang(147.0, 0.3, 37, -0.04), 0.002, 0.06), 0.1), c["reins_end"] + 0.1, db(-19))

# ================================================================= 5. the violinist: a surgeon SNIPS every tie... in BOTH hands
sfx.add(pan_st(whoosh(0.22, 260, 2000, 40), 0.1), SHOT["violin"] - 0.2, db(-23))         # the whip to the stage
sh = high(whoosh(0.3, 1800, 7000, 41, 0.5), 5200)
bed.add(pan_st(fade(sh, 0.01, 0.05), 0.4), c["surgeon"] - 0.08, db(-19))                  # the scissors slide in (shing, high)
# SNIP: the biggest hit of the Short, soft-clipped for body; a crack above 4 kHz and a thud under 250 Hz (it sits on "snip")
sn = high(crack(0.08, 42, 0.012, 3000), 4000)
sn = norm(sn); sn = np.tanh(3.2 * sn) / np.tanh(3.2)
sfx.add(pan_st(fade(sn, 0.0005, 0.03), 0.15), c["snipcut"], db(-9))
layered_hit(c["snipcut"] + 0.005, mid=False, gain=2.0)
for i, dt in enumerate((0.3, 0.52, 0.76, 1.0)):                                          # snip, snip, snip... every tie (high)
    s2 = high(crack(0.05, 43 + i, 0.01, 3000), 5200)
    bed.add(pan_st(fade(s2, 0.0005, 0.02), 0.3 - 0.15 * i), c["every"] + dt, db(-17))
bed.add(pan_st(glint(6100, 0.1, 50), 0.0), c["both"] + 0.02, db(-21))                   # BOTH HANDS
bed.add(pan_st(glint(7300, 0.1, 51), 0.1), c["hands"] + 0.02, db(-21))                  # 1979 - 1988

# ================================================================= 6. the sting: Free fingers! He could type... SUPER fast.
for i, m in enumerate((65, 69, 72, 77, 81, 84)):                                         # a harp runs up (in the pause before "Free")
    tn = c["hands_end"] + 0.02 + 0.058 * i
    dn = min(0.2, c["free"] - 0.04 - tn)
    if dn > 0.05:
        sfx.add(pan_st(fade(pizz(L.mtof(m), dn, 60 + i), 0.001, 0.05), -0.3 + 0.1 * i), tn, db(-16.5))
shimmer(c["fingers2"] + 0.05, -22, 8, 70, 0.0, 0.06)                                      # sparkles on the free fingers
sfx.add(pan_st(whoosh(0.18, 400, 2400, 71, 0.6), -0.1), SHOT["type"] - 0.14, db(-24))    # into the typewriter
# the typewriter: clicks whose rate climbs; only their tops under the words, the whole click in the pauses
words = [(w["start"], w["end"]) for w in TL["words"]]
def in_word(t):
    return any(a - 0.03 <= t <= b + 0.08 for a, b in words)
t_ = SHOT["type"] + 0.05
k = 0
while t_ < c["fast_end"] - 0.02:
    rate = 6.0 + 22.0 * min(1.0, max(0.0, (t_ - c["type"]) / 0.6))
    y = key_click(80 + k)
    if in_word(t_):
        bed.add(pan_st(high(y, 5200), 0.25 * ((-1) ** k)), t_, db(-14))
    else:
        sfx.add(pan_st(y, 0.25 * ((-1) ** k)), t_, db(-19))
    t_ += 1.0 / rate
    k += 1
sfx.add(pan_st(fade(bell(2637.0, 0.36, 0.12), 0.001, 0.08), 0.3), c["fast_end"] + 0.02, db(-12))   # DING (in the pause)

# ================================================================= 7. the button: Now sign your seven... FAST. (the marmot loses it)
sfx.add(pan_st(whoosh(0.2, 300, 2200, 90), -0.1), SHOT["button"] - 0.18, db(-25))        # the whip back to the cafe
for i in range(12):                                                                       # the machine-gun pancakes
    tl = c["now2"] - 0.1 + i * 0.21 + 0.24
    if tl > DUR - 0.7:
        break
    if in_word(tl):
        bed.add(pan_st(flap_low(100 + i), -0.3 + 0.05 * i), tl, db(-15))
    else:
        sfx.add(pan_st(splat(100 + i, 0.16), -0.3 + 0.05 * i), tl, db(-17))
    bed.add(pan_st(high(key_click(120 + i), 5200), -0.35), tl - 0.12, db(-22))           # the pan's rattle (high)
eep(c["seven2_end"] + 0.05, -16, 2600.0, 3900.0, 0.24, 130, -0.35)                         # its panicked EEP! (in the pause)
strain(c["now2"], c["fast2_end"] - c["now2"], -16, 131)                                    # his fast sevens (low)

# ================================================================= score: the loop score (a whole number of bars), stopping dead
BPM, BEAT, BARS = fit_loop(DUR, 100, 128, bars=14)   # 14 bars: a lively cafe tempo (about 118 BPM)
bA = bar_at(SHOT["violin"], BEAT, 1)   # the stage begins on the beat nearest its cut (the tempo grid runs on)
bB = bar_at(SHOT["free"], BEAT, 1)     # the free fingers and the typing (on the beat nearest the cut)
bC = bar_at(SHOT["button"], BEAT)      # the cafe again, frantic: on a BAR line, so the last section is whole bars to the loop
print(f"loop score: {BARS} bars at {BPM:.1f} BPM (beat {BEAT:.3f} s; bars x 4 x beat = {BARS * 4 * BEAT:.3f} s = DUR {DUR:.3f} s); "
      f"sections at {bA:.2f}, {bB:.2f}, {bC:.2f} s")
groove(mus, 0.0, bA, BPM, ["F", "Bb", "C", "F"], gain=-12.5, seed=10, kick_on=False)            # the cafe: a folk groove
riff(mus, [(0, 77), (0.75, 81), (1.5, 84), (2.5, 82), (3, 81), (3.5, 77), (4, 79), (4.75, 82), (5.5, 86), (6.5, 84), (7, 82), (7.5, 79)],
     BEAT, 0.0, bA, every=8, gain=-21, octave=None)                                               # his steel pan hook
groove(mus, bA, bB, BPM, ["Dm", "Gm", "A", "Dm"], gain=-14.5, seed=11, kick_on=False, snaps=False, padv=True, arp=False)   # the stage
k = 0
while bA + k * BEAT < bB - 0.05:                                                                   # harpsichord eighths on the stage
    m = [62, 65, 69, 74, 69, 65, 62, 57][k % 8]
    mus.add(pan_st(fade(harpsi(L.mtof(m), 0.28, 300 + k), 0.002, 0.05), 0.2 * ((-1) ** k)), bA + k * BEAT / 2, db(-22))
    k += 1
groove(mus, bB, bC, BPM, ["F", "C", "Dm", "Bb"], gain=-12.5, seed=12, kick_on=True, sixteen=True)   # free fingers, typing: bright
claps(mus, bB, bC, BEAT)
groove(mus, bC, DUR - 1e-4, BPM, ["F", "Bb", "C", "C"], gain=-12.0, seed=13, kick_on=True)        # the button: the cafe, frantic
riff(mus, [(0, 77), (0.5, 81), (1, 84), (1.5, 81), (2, 79), (2.5, 82), (3, 86), (3.5, 84)], BEAT, bC, DUR - 0.05, every=4, gain=-21, octave=None)
shaker(mus, bC, DUR, BEAT)
# the last beat leads into bar 1 (two pickup notes, gone before the loop)
mus.add(pan_st(fade(steel_pan(84, 0.2, 400), 0.002, 0.05), 0.2), DUR - BEAT, db(-20))
mus.add(pan_st(fade(steel_pan(81, 0.2, 401), 0.002, 0.08), -0.2), DUR - BEAT / 2, db(-21))
# the dead stops (direction.md rule 16): the pinky sinking, the punchline TWO, full silence before the SNIP (the payoff),
# the harp before "Free fingers!", the DING
silence(mus, [(0.0, c["you0_end"] + 0.05),                              # the music enters after the first words
              (c["up_end"] - 0.02, c["sinking_end"] + 0.15),
              (c["together_end"] - 0.02, c["chariot"] + 0.05),                # a beat before "like chariot REINS!"
              (c["signed"] + 0.1, c["now"] + 0.3),
              (c["surgeon"] - 0.05, c["both"] + 0.15),
              (c["hands_end"] - 0.05, c["fingers2"] + 0.2),
              (c["fast_end"] - 0.02, c["now2"] + 0.15)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -11.5}, duck={"music": 0.72})
