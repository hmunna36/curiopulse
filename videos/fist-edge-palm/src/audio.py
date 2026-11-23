"""Can You Do Fist, EDGE, Palm? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

An alpine meadow in the afternoon (wind under 280 Hz, grasshoppers above 5 kHz, a sparrow in the pauses): every tap of
his hand on the planks has its own knock (the fist a deep BONK, the edge a sharp CHOP, the palm a flat SLAP; under 250 Hz
with a crisp top, so they can sit on the words that name them); FAST, and the jam: a wrong BONK and a tire screech in
the pause after "FAST!"; the STOP sign slamming up on "BRAKES" (a low slam on the word, the sign's metal wobble in the
pause after "aren't."); an air brake's psssh at every STOP flash (all above 5 kHz); the sign sputtering out on "stop,"
(an electric fizzle's edges); the ninja's tiptoes (pizzicato in the pauses, ticks above 5 kHz) and its blade-swish into
the hand; BONK... BONK! (the hitstop's hit, low, on the word); full silence, then the clinic's DUN; the goat's clipboard
clack, its hoof clop-clop-clop, its smug bleat in the pause after "brain."; a relieved exhale; the glasses' ting; its fast
clops and the CLONK, then a sad trombone in the pause after "help."; the button's palm, edge and the fist that lands on
the loop. The score is the loop score: a whole number of bars from frame 0 to the loop; a bright tapping groove (his
motif: three notes up, fist-edge-palm), a sneaky pizzicato walk for the ninja, a warm clinic groove for the goat doctor,
the tapping groove again for the button; it stops dead four times.
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


def tap(t, kind, gain=0.0, full=None):
    """a hand landing on the planks: F a deep BONK, E a sharp CHOP, P a flat SLAP. Under 250 Hz plus a crisp top (it can
    sit on a word); full=True adds the wooden 'tok' in the speech band (only in a pause)"""
    if full is None:
        full = not in_word(t)
    if kind == "F":
        body, top, tok = thump(0.22, 150, 55, 0.06), high(crack(0.04, 11, 0.008, 3000), 5200), 900.0
    elif kind == "E":
        body, top, tok = thump(0.16, 230, 90, 0.035), high(crack(0.035, 12, 0.006, 3000), 5200), 1400.0
    else:
        body, top, tok = thump(0.18, 120, 50, 0.045), high(white(int(0.05 * SR), 13) * expdecay(int(0.05 * SR), 0.012), 4800), 700.0
    bed.add(pan_st(fade(low(body, 240), 0.001, 0.04), 0.05), t, db(-12 + gain))
    bed.add(pan_st(fade(top, 0.0005, 0.02), 0.08), t, db(-20 + gain))
    if full:
        n = int(0.09 * SR)
        y = np.sin(2 * np.pi * tok * ar(n)) * expdecay(n, 0.02) + 0.35 * filt(white(n, int(tok)), "bandpass", [600, 3000]) * expdecay(n, 0.006)
        sfx.add(pan_st(fade(y, 0.0005, 0.02), 0.05), t, db(-21 + gain))


def tire_squeal(dur=0.3, seed=0, f0=1750.0):
    """a tire screech: a rough tonal squeal near f0 with jitter and a noise band (speech band: in a pause)"""
    n = int(dur * SR)
    r = np.random.default_rng(seed)
    jit = np.cumsum(r.normal(0, 1, n)) / SR * 40.0
    f = f0 * (1 + 0.05 * np.sin(2 * np.pi * 23 * ar(n))) + jit * 30
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.45 * np.sin(2 * ph + 0.3) + 0.25 * np.sin(3 * ph)
    y = y * (0.7 + 0.3 * np.abs(np.sin(2 * np.pi * 37 * ar(n)))) + 0.35 * filt(white(n, seed), "bandpass", [1200, 4200])
    env = np.minimum(1, ar(n) / 0.02) * np.exp(-ar(n) / (dur * 0.7))
    return fade(norm(y * env), 0.004, 0.05)


def bleat(dur=0.42, f0=430.0, seed=0):
    """a goat's 'meh-eh-eh': a buzzy tone with a deep 7 Hz wobble through two vowel formants (speech band: in a pause)"""
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (1 + 0.07 * np.sin(2 * np.pi * 7.5 * t)) * (1 - 0.08 * t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) / k ** 0.8 for k in range(1, 16))
    y = filt(y, "bandpass", [550, 900]) + 0.7 * filt(y, "bandpass", [1500, 2300])
    y = y * (0.65 + 0.35 * np.abs(np.sin(2 * np.pi * 7.5 * t)))
    return fade(norm(y), 0.02, 0.08)


def air_brake(dur=0.32, seed=0):
    """an air brake's psssh: all of it above 5 kHz (it can sit on a word)"""
    n = int(dur * SR)
    y = high(white(n, seed), 5200) * (np.minimum(1, ar(n) / 0.01) * np.exp(-ar(n) / 0.12))
    return fade(norm(y), 0.002, 0.06)


def metal_wobble(dur=0.32, seed=0):
    """a road sign's wobble: a sheet of metal ringing and warbling (speech band: in a pause)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.zeros(n)
    for f, a in ((310.0, 1.0), (745.0, 0.6), (1290.0, 0.4), (2210.0, 0.25)):
        y += a * np.sin(2 * np.pi * f * t * (1 + 0.03 * np.sin(2 * np.pi * 11 * t)))
    return fade(norm(y * np.exp(-t / 0.12)), 0.001, 0.05)


def layered_hit(t, mid=True, gain=0.0):
    """the hitstop's hit (sound.md, "Hitstops"); mid=False keeps the body out of the speech band (it sits on a word)"""
    sfx.add(pan_st(filt(snap(51), "highpass", 1800 if mid else 5200), 0.0), t, db(-20 + gain))
    if mid:
        sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), t + 0.004, db(-17 + gain))
        sfx.add(cymbal(52, 0.35), t + 0.01, db(-31 + gain))
    else:
        sfx.add(pan_st(filt(kick(0.9), "lowpass", 240), 0.0), t + 0.004, db(-13 + gain))


def clop(t, gain=0.0, seed=0, pan=0.25):
    """a hoof on the planks: a hollow clop (under 250 Hz + a crisp top on a word, the whole clop in a pause)"""
    n = int(0.08 * SR)
    y = np.sin(2 * np.pi * 820 * ar(n)) * expdecay(n, 0.014) + 0.4 * filt(white(n, seed), "bandpass", [700, 2600]) * expdecay(n, 0.005)
    if in_word(t):
        bed.add(pan_st(fade(low(thump(0.12, 200, 80, 0.03), 240), 0.001, 0.03), pan), t, db(-15 + gain))
        bed.add(pan_st(fade(high(y, 5200), 0.0005, 0.02), pan), t, db(-18 + gain))
    else:
        sfx.add(pan_st(fade(y, 0.0005, 0.02), pan), t, db(-17 + gain))


# ================================================================= ambience: the meadow (wind, grasshoppers, a sparrow)
meadow_on = gate(N, [(0, DUR)])
wind = norm(filt(pink(N, 3), "lowpass", 280) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.09 * tt) + 0.1 * np.sin(2 * np.pi * 0.23 * tt)))
amb.x += pan_st(wind, 0.0) * 0.3 * meadow_on
crickets(0.3, DUR - 0.4, bed, -33, seed=4, f=5600, rate=0.8)
sfx.add(pan_st(fade(tweet(5, 3600.0), 0.005, 0.05), -0.5), c["again_end"] + 0.12, db(-27))

# ================================================================= 1. the hook: Tap your table: fist, edge, palm... now FAST!
TAPS = [(0.0, "F"), (0.36, "E"), (0.72, "P"), (c["fist1"], "F"), (c["edge1"], "E"), (c["palm1"], "P")]
n1 = c["now1"]
TAPS += [(n1 + 0.04, "F"), (n1 + 0.24, "E"), (n1 + 0.44, "P"), (n1 + 0.64, "F")]
for t_, k_ in TAPS:
    tap(t_, k_, -1.0)
# the jam: a wrong BONK and the fist skidding (in the pause after "FAST!")
sfx.add(pan_st(fade(bonk(), 0.0005, 0.03), 0.05), c["jam"], db(-17))
low_b = thump(0.25, 150, 50, 0.07)
bed.add(pan_st(fade(low(low_b, 240), 0.001, 0.04), 0.0), c["jam"], db(-11))
sq = tire_squeal(min(0.24, c["mixed"] - c["jam"] - 0.08), 7)
sfx.add(pan_st(sq, 0.15), c["jam"] + 0.04, db(-19))
sfx.add(pan_st(whoosh(0.2, 300, 2200, 4), -0.1), SHOT["jam"] - 0.18, db(-24))            # the whip to the POV
bed.add(pan_st(glint(7400, 0.1, 7), 0.35), c["ff"], db(-22))                               # the flash window pops
bed.add(pan_st(glint(6900, 0.08, 8), 0.35), c["ff"] + 0.5, db(-24))

# ================================================================= 2. the answer: Mixed them up? Your hand's fine. Your BRAKES aren't.
low_b = thump(0.3, 120, 40, 0.09)
bed.add(pan_st(fade(low(low_b, 220), 0.001, 0.05), 0.0), c["slam"], db(-10))               # the STOP sign slams up (low, on "BRAKES")
layered_hit(c["slam"] + 0.01, mid=False, gain=0.0)
bed.add(pan_st(air_brake(0.3, 21), -0.2), c["slam"] + 0.04, db(-17))                       # psssh (high)
mw = metal_wobble(min(0.28, c["go"] - c["arent_end"] - 0.06), 22)
sfx.add(pan_st(mw, 0.2), c["arent_end"] + 0.02, db(-14))                                    # the sign's metal wobble (in the pause)

# ================================================================= 3. again, slow: each shape has to STOP before the next one starts
for t_, k_ in ((c["go"] + 0.02, "F"), (c["again"] + 0.22, "E"), (c["stop1"] + 0.02, "P"), (c["starts"] + 0.02, "F")):
    tap(t_, k_, 0.0)
for t_ in (c["again"] + 0.22, c["stop1"] + 0.02, c["starts"] + 0.02):                       # a psssh at every STOP flash (high)
    bed.add(pan_st(air_brake(0.28, int(t_ * 10)), -0.15), t_ + 0.02, db(-19))
    for i in range(3):                                                                       # the old shape fading (glints, high)
        bed.add(pan_st(glint(6200 + 500 * i, 0.07, int(t_ * 10) + i), 0.2 - 0.1 * i), t_ + 0.08 + 0.06 * i, db(-26))

# ================================================================= 4. the sneak: Miss one stop, and the old one sneaks back in. Fist... FIST!
zz = zap(0.42, 31, 118.0, edges=True)
bed.add(pan_st(fade(zz, 0.01, 0.06), -0.15), c["stop2"] - 0.06, db(-17))                     # the sign sputters out (edges)
bed.add(pan_st(fade(thump(0.12, 90, 40, 0.05), 0.001, 0.04), 0.0), c["stop2_end"] + 0.02, db(-18))   # ...and dies
# the ninja's tiptoes: pizzicato in the pauses, ticks above 5 kHz under the words
k = 0
t_ = c["old"] - 0.1
while t_ < c["in_end"] - 0.05:
    if in_word(t_, 0.02, 0.04):
        bed.add(pan_st(glint(6800 + 400 * (k % 2), 0.04, 300 + k), 0.3 - 0.06 * k), t_, db(-24))
    else:
        sfx.add(pan_st(fade(pizz(L.mtof([69, 72][k % 2]), 0.12, 300 + k), 0.001, 0.03), 0.3 - 0.06 * k), t_, db(-21))
    t_ += 0.19
    k += 1
sh = high(whoosh(0.22, 2000, 7000, 41, 0.5), 5000)
bed.add(pan_st(fade(sh, 0.01, 0.05), -0.2), c["in_end"] - 0.12, db(-18))                     # the blade-swish as it slips in (high)
sfx.add(pan_st(fade(bloop(300.0, 160.0, 0.16), 0.002, 0.04), 0.0), c["in_end"] + 0.05, db(-17))   # poof (in the pause)
tap(c["fist2"] + 0.02, "F", 1.0)                                                             # BONK...
tap(c["bonk3"], "F", 2.5)                                                                    # ...BONK! (the hitstop)
layered_hit(c["bonk3"] + 0.005, mid=False, gain=1.5)

# ================================================================= 5. the payoff: full silence, then DUN: the goat doctor
sfx.add(pan_st(whoosh(0.18, 300, 2400, 50), 0.1), SHOT["doctor"] - 0.16, db(-25))
dun_t = max(SHOT["doctor"] - 0.04, c["fist3_end"] + 0.24)
nd = int(0.32 * SR)
dun = sum(L.saw(L.mtof(m), nd, 0.004, 500 + m) for m in (53, 60, 65, 69))
dun = filt(dun, "lowpass", 2400) * np.exp(-ar(len(dun)) / 0.1)
dun = norm(dun); dun = np.tanh(2.8 * dun) / np.tanh(2.8)
sfx.add(pan_st(fade(dun, 0.002, 0.06), 0.0), dun_t, db(-12))                                 # DUN (the biggest hit)
layered_hit(dun_t + 0.004, mid=True, gain=1.0)
bed.add(pan_st(glint(7800, 0.14, 51), -0.1), c["doctors"] + 0.05, db(-20))                   # the head mirror glints (high)
bed.add(pan_st(fade(low(thump(0.14, 260, 110, 0.03), 260), 0.001, 0.03), 0.3), c["use"] + 0.02, db(-16))   # the clipboard up (low)
for i in range(3):                                                                           # clop, clop, clop: perfect
    clop(c["clop"] + 0.24 * i, 1.0, 60 + i, 0.25 - 0.1 * i)
bl = bleat(min(0.42, c["relax"] - c["brain_end"] - 0.06), 440.0, 61)
sfx.add(pan_st(bl, 0.2), c["brain_end"] + 0.03, db(-19))                                     # its smug "meh-eh" (in the pause)

# ================================================================= 6. the sting: Relax. In one study, being smart didn't help.
sfx.add(pan_st(fade(breath(0.4, 70, exhale=True), 0.02, 0.1), -0.1), c["relax_end"] - 0.05, db(-24))   # his exhale
bed.add(pan_st(glint(7200, 0.1, 71), 0.1), c["in2"] + 0.02, db(-20))                         # the glasses (ting, high)
bed.add(pan_st(glint(8100, 0.08, 72), -0.1), c["in2"] + 0.11, db(-22))
for i, d in enumerate((-0.05, 0.15, 0.35, 0.55)):                                              # its fast clops
    clop(c["being"] + d, 0.0, 80 + i, 0.2)
clop(c["clonk"], 3.0, 85, 0.2)                                                                 # CLONK (the mix-up)
bed.add(pan_st(fade(low(thump(0.2, 160, 60, 0.05), 240), 0.001, 0.04), 0.2), c["clonk"] + 0.01, db(-12))
ww = wahwah(90)
gap = c["now2"] - c["help_end"]
sfx.add(pan_st(fade(ww[: int(max(0.2, gap - 0.08) * SR)], 0.005, 0.08), 0.1), c["help_end"] + 0.02, db(-20))   # sad trombone

# ================================================================= 7. the button: Now do it... BACKWARDS. (palm, edge, and the fist on the loop)
sfx.add(pan_st(whoosh(0.2, 300, 2200, 90), -0.1), SHOT["button"] - 0.18, db(-25))
bed.add(pan_st(fade(low(thump(0.12, 200, 90, 0.03), 240), 0.001, 0.03), -0.1), c["now2"] + 0.4, db(-20))   # the goat picks its daisy back up
tap(c["backwards"] + 0.04, "P", 0.0)
tap(c["backwards"] + 0.8, "E", 0.0)
# (the fist lands on the loop: frame 0's BONK, at the start of the file)

# ================================================================= score: the loop score (a whole number of bars), stopping dead
BPM, BEAT, BARS = fit_loop(DUR, 100, 128, bars=14)
bS = bar_at(c["miss"], BEAT, 1)          # the sneak begins on the beat nearest "Miss"
bD = bar_at(SHOT["doctor"], BEAT, 1)     # the clinic on the beat nearest its cut
bB = bar_at(SHOT["button"], BEAT)        # the button on a BAR line: whole bars to the loop
print(f"loop score: {BARS} bars at {BPM:.1f} BPM (beat {BEAT:.3f} s; bars x 4 x beat = {BARS * 4 * BEAT:.3f} s = DUR {DUR:.3f} s); "
      f"sections at {bS:.2f}, {bD:.2f}, {bB:.2f} s")
groove(mus, 0.0, bS, BPM, ["C", "F", "G", "C"], gain=-12.5, seed=10, kick_on=True)             # the tapping groove
MOTIF = [(0, 72), (0.5, 76), (1, 79), (2, 72), (2.5, 76), (3, 79), (3.5, 84)]                  # his motif: three up, fist-edge-palm
riff(mus, MOTIF, BEAT, 0.0, bS, every=8, gain=-21, octave=None)
groove(mus, bS, bD, BPM, ["Am", "Am", "E", "Am"], gain=-15.0, seed=11, kick_on=False, snaps=False, padv=False, arp=False, half=True)   # the sneak
groove(mus, bD, bB, BPM, ["F", "C", "Dm", "Bb"], gain=-12.5, seed=12, kick_on=True, padv=True)   # the clinic: warm
riff(mus, [(0, 81), (1, 77), (2, 81), (2.5, 84), (3, 81)], BEAT, bD, bB, every=8, inst=steel_pan, gain=-22, octave=None)   # the goat's motif
groove(mus, bB, DUR - 1e-4, BPM, ["C", "F", "G", "C"], gain=-12.0, seed=13, kick_on=True)       # the button: the tapping groove
riff(mus, MOTIF, BEAT, bB, DUR - 0.05, every=8, gain=-21, octave=None)
shaker(mus, bB, DUR, BEAT)
# the last beat leads into bar 1 (two pickup notes, gone before the loop)
mus.add(pan_st(fade(marimba(L.mtof(76), 0.2, 400), 0.002, 0.05), 0.2), DUR - BEAT, db(-19))
mus.add(pan_st(fade(marimba(L.mtof(79), 0.2, 401), 0.002, 0.08), -0.2), DUR - BEAT / 2, db(-19))
# the dead stops (direction.md rule 16): the jam, the punchline BRAKES, full silence before the payoff (the goat doctor),
# the goat's CLONK
silence(mus, [(0.0, c["table_end"] + 0.05),                         # the music enters after the first words
              (c["jam"] - 0.03, c["up_end"] + 0.15),
              (c["brakes"] - 0.05, c["arent_end"] + 0.25),
              (c["fist3"] - 0.05, dun_t + 0.02),
              (c["clonk"] - 0.04, c["now2"] + 0.12)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -11.5}, duck={"music": 0.72})
