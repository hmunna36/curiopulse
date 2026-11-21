"""This Whole Forest Is ONE Tree 🌳 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The places: a quaking-aspen forest (leaves that rustle like rain, birds in the pauses), the ground opened on glowing
roots (a low rumble), the mountainside from the air (wind), a meadow with a giant balance. The score: a sunny
marimba and steel-pan groove fitted to 16 bars so it is on bar 1 again when the picture loops; the forest's motif is a
music box (the eyes opening, the gold). Rule: a sound that lives in the speech band goes in a pause; on a word only
what is under 250 Hz or above 5.2 kHz.
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
WORDS = TL["words"]


def edges(y, lo=250, hi=5200):
    """only what is under `lo` Hz and above `hi` Hz: a sound that can sit on a spoken word"""
    return filt(y, "lowpass", lo) + filt(y, "highpass", hi)


def hi_only(y, f=5200):
    return filt(y, "highpass", f)


def shimmer(t0, t1, bus, gain, seed=0, rate=26.0, lo=5600, hi=8600):
    """a run of glints (all above 5 kHz): a sparkle that can sit on words"""
    r = np.random.default_rng(seed)
    k = 0
    t = t0
    while t < t1:
        bus.add(glint(float(r.uniform(lo, hi)), 0.08, seed + k), t, gain * float(r.uniform(0.6, 1.0)), pan=float(r.uniform(-0.6, 0.6)))
        t += float(r.exponential(1.0 / rate))
        k += 1


# ================================================================= ambience (one bed per world, gated to its shots)
forest = [(0, END["hook"]), (SHOT["answer"], END["answer"]), (SHOT["dna"], END["all"]), (SHOT["gold"], END["gold"]),
          (SHOT["button"], DUR)]
under = [(SHOT["roots"], END["sprout"])]
land = [(SHOT["rise"], END["rise"]), (SHOT["count"], END["count"]), (SHOT["valley"], END["flip"])]
meadow = [(SHOT["weigh"], END["bark"])]
# the leaves of a quaking aspen rustle like light rain: a gated hiss above 5 kHz (it can run under the words), and a
# soft wind under 260 Hz
leaves = np.zeros(N)
for k, (a, b) in enumerate(forest):
    n0, n1 = span(a, b)
    seg = hi_only(rustle(max(0.1, b - a + 0.2), 700 + k), 5000)
    leaves[n0:n0 + len(seg)][:max(0, min(len(seg), N - n0))] += seg[:max(0, min(len(seg), N - n0))]
amb.x += pan_st(leaves, -0.2) * 0.55 * gate(N, forest)
amb.x += pan_st(filt(brown(N, 3), "lowpass", 260), 0.1) * 0.5 * gate(N, forest + land + meadow)
amb.x += pan_st(filt(brown(N, 5), "lowpass", 140), 0) * 0.9 * gate(N, under)                 # the soil: a low rumble
amb.x += pan_st(hi_only(pink(N, 9), 6500), 0.3) * 0.08 * gate(N, land + meadow)              # high open air
# full silence before the payoff: the beds drop away too (they come back with the gold leaves)
quiet = gate(N, [(c["at"] - 0.25, c["boom"] + 0.05)], smooth=0.12)
amb.x *= (1 - 0.85 * quiet)

# birds in the pauses (tweets live in the speech band, so only where nobody is speaking)
for t_, f_, g_ in ((c["tree1_end"] + 0.08, 3600, -27), (c["them_end"] + 0.05, 3300, -29), (c["time_end"] + 0.05, 3500, -28),
                   (c["huggers_end"] + 0.12, 3800, -30)):
    sfx.add(tweet(int(t_ * 10), f_), t_, db(g_), pan=0.5)

# ================================================================= the hook: he hugs, the bark eye peeks
sfx.add(pan_st(edges(creak(0.35, 4, 60, 140)), -0.1), 0.0, db(-20))          # a squeeze of the bark (frame 1)
sfx.add(pan_st(hi_only(whoosh(0.4, 3000, 9000, 11), 5000), 0.2), 0.0, db(-22))
bed.add(glint(7200, 0.12, 1), c["peek"], db(-16), pan=0.2)                       # the eye opens (above the voice band)
bed.add(glint(6400, 0.1, 2), c["peek"] + 0.06, db(-20), pan=0.2)
bed.add(glint(5900, 0.08, 3), c["peek_end"], db(-18), pan=0.2)                   # and shuts

# ================================================================= the crane up and the lasso
sfx.add(pan_st(whoosh(0.22, 500, 3200, 21), 0), SHOT["rise"] - 0.26, db(-21))
shimmer(c["lasso"], c["lasso"] + 0.45, bed, db(-20), seed=30, rate=30)
sfx.add(pan_st(ding(96, 0.12, 31), 0), c["tag1"], db(-25))                       # 1 TREE pops in the gap before "tree"
# the flash-forward: in and out
sfx.add(pan_st(hi_only(whoosh(0.22, 2000, 9000, 41), 3000), 0), c["ff"] - 0.1, db(-20))
shimmer(c["ff"], c["ff"] + 0.36, bed, db(-22), seed=42, rate=24)

# ================================================================= the answer: the ground opens on one root network
sfx.add(pan_st(whoosh(0.2, 400, 2400, 51), 0), SHOT["roots"] - 0.24, db(-24))
sfx.add(pan_st(filt(L.thunder(1.2, 52) if hasattr(L, "thunder") else brown(int(1.2 * SR), 52), "lowpass", 200), 0), c["open"], db(-12))
sfx.add(pan_st(hi_only(crumple(0.5, 53), 5200), -0.3), c["open"], db(-22))
shimmer(c["glow"], c["under_end"], bed, db(-19), seed=54, rate=34)              # the light runs out along the roots
# the hitstop after "UNDERGROUND": the whole network lit (crisp transient, body, bright tail) and a warm bloom
_th = c["under_end"] + 0.04
sfx.add(pan_st(filt(snap(51), "highpass", 1800), 0.0), _th, db(-20))
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-17))
sfx.add(cymbal(52, 0.45), _th + 0.01, db(-31))
sfx.add(pan_st(fade(pad([mtof(65), mtof(69), mtof(72)], 0.42, 0.04, 2400, 55), 0.01, 0.2), 0), _th + 0.02, db(-24))

# ================================================================= the sprout
sfx.add(pan_st(edges(ratchet(c["pop"] - SHOT["sprout"], 10, 30, 61, edges=True)), 0.2), SHOT["sprout"] + 0.05, db(-24))
sfx.add(pan_st(fade(cork_pop(62, 520)[:int(0.16 * SR)], 0.001, 0.04), 0.2), c["pop"], db(-20))                       # it breaks the surface, in the pause
sfx.add(pan_st(edges(riser(c["grown"] - c["pop"], 63, 300, 2400)), 0.2), c["pop"] + 0.02, db(-17))
sfx.add(pan_st(filt(thump(0.2, 140, 55, 0.09), "lowpass", 220), 0.2), c["grown"], db(-15))
bed.add(glint(6800, 0.1, 64), c["tag2"], db(-16), pan=-0.2)                      # the tag slaps on
sfx.add(pan_st(filt(snare(65, 0.1), "highpass", 1200), -0.2), c["sprout_end"] + 0.03, db(-24))   # its slap, after the word

# ================================================================= the count
sfx.add(pan_st(whoosh(0.24, 500, 2600, 71), 0), SHOT["count"] - 0.16, db(-24))
sfx.add(pan_st(ratchet(c["cut_thou"] - c["about"], 6, 40, 72, edges=True), 0), c["about"], db(-19))   # the ticks speed up
sfx.add(pan_st(hi_only(whoosh(0.3, 2000, 8000, 73), 4000), 0), c["cut_thou"] - 0.1, db(-22))
shimmer(c["thousand_end"] - 0.05, c["thousand_end"] + 0.25, bed, db(-18), seed=74, rate=40)   # the counter lands
for k, m in enumerate((84, 88, 91)):                                            # ka-ching in the pause after "them."
    sfx.add(pan_st(ding(m, 0.16, 75 + k, 1.4), 0.15 * (k - 1)), c["them_end"] + 0.03 + 0.04 * k, db(-24))

# ================================================================= same roots, same DNA: the scanner
sfx.add(pan_st(buzz_hi(END["dna"] - SHOT["dna"] - 0.1, 31, 81), 0.3), SHOT["dna"] + 0.05, db(-30))
for t_ in (SHOT["dna"] + 0.08, c["scan1"], c["same2"] - 0.1):
    bed.add(glint(6100, 0.07, int(t_ * 10)), t_, db(-19), pan=0.3)
shimmer(c["scan1"], c["scan1"] + 0.45, bed, db(-22), seed=82, rate=22, lo=5400, hi=7000)      # the shared root lights
bed.add(glint(7600, 0.1, 83), c["match"], db(-15), pan=-0.3)
bed.add(glint(7000, 0.1, 84), c["match"] + 0.08, db(-15), pan=0.3)
for k, m in enumerate((79, 84)):                                                # MATCH: two dings after "DNA."
    sfx.add(pan_st(ding(m, 0.15, 85 + k, 1.3), 0.3 * (k * 2 - 1)), c["dna_end"] + 0.03 + 0.09 * k, db(-23))

# ================================================================= hug one... you've hugged them ALL
sfx.add(pan_st(whoosh(0.24, 500, 2200, 91), 0), SHOT["hugone"] - 0.16, db(-25))
sfx.add(pan_st(edges(creak(0.3, 92, 60, 150)), 0.2), c["squeeze"], db(-19))
bed.add(glint(6600, 0.12, 93), c["squeeze"] + 0.1, db(-17), pan=0.4)            # the heart pops
sfx.add(pan_st(whoosh(0.22, 600, 2600, 94), 0), SHOT["all"] - 0.15, db(-25))
shimmer(c["eyes"], c["eyes"] + 0.3, bed, db(-15), seed=95, rate=60, lo=6000, hi=8800)   # every eye blinks open
for k, m in enumerate((84, 88, 91, 96)):                                        # the hearts: a music box run up,
    sfx.add(pan_st(fade(music_box(mtof(m), 0.2, 96 + k), 0.002, 0.06), 0.4 * (-1) ** k), c["hearts"] + 0.05 * k, db(-29))   # in the pause

# ================================================================= autumn: the valley, then the whole clone flips gold
sfx.add(pan_st(whoosh(0.22, 400, 2800, 101), 0), SHOT["valley"] - 0.3, db(-21))
sfx.add(pan_st(filt(pink(int(2.2 * SR), 102), "lowpass", 200) * np.sin(np.pi * np.linspace(0, 1, int(2.2 * SR))), 0), c["season"], db(-26))
shimmer(c["p1"], c["p1"] + 1.2, bed, db(-26), seed=103, rate=8)                   # other clones turn, crown by crown
shimmer(c["p2"], c["p2"] + 1.6, bed, db(-27), seed=104, rate=6)
shimmer(c["outline"], c["outline"] + 0.5, bed, db(-20), seed=105, rate=28)
sfx.add(pan_st(whoosh(0.24, 500, 2400, 106), 0), SHOT["flip"] - 0.16, db(-25))
# on "SAME": only the edges (a sparkle storm above 5 kHz, a sub drop); the full hit in the pause after the word
shimmer(c["flipgold"], c["flipgold"] + 0.55, bed, db(-13), seed=107, rate=90, lo=5400, hi=9000)
sfx.add(pan_st(filt(thump(0.5, 90, 38, 0.25), "lowpass", 160), 0), c["flipgold"], db(-10))
_tb = c["boom"]
sfx.add(pan_st(np.tanh(3.0 * whoosh(0.26, 700, 6000, 108, peak=0.25)) / np.tanh(3.0), 0), _tb, db(-12))
for k, m in enumerate((65, 69, 72, 77)):
    sfx.add(pan_st(steel_pan(m + 12, 0.3, 109 + k), 0.3 * (k - 1.5)), _tb + 0.01 * k, db(-15))
sfx.add(cymbal(110, 0.35), _tb, db(-24))
# the gold leaves raining on him
sfx.add(pan_st(hi_only(rustle(END["gold"] - SHOT["gold"], 111), 5000), 0.3), SHOT["gold"], db(-16))

# ================================================================= the balance: the forest against forty blue whales
sfx.add(pan_st(whoosh(0.3, 400, 2600, 121), 0), SHOT["weigh"] - 0.2, db(-19))
sfx.add(pan_st(edges(creak(1.2, 122, 50, 110)), -0.4), SHOT["weigh"] + 0.1, db(-22))
sfx.add(pan_st(hi_only(whoosh(0.22, 2500, 8000, 123), 4000), 0), c["cut_tonnes"] - 0.08, db(-22))
# the slam lands ON "TONNES": a sub drop and a dry knock kept short, the chains and the creak after the word
sfx.add(pan_st(filt(thump(0.45, 80, 32, 0.22), "lowpass", 170), -0.3), c["slam"], db(-8))
sfx.add(pan_st(hi_only(crumple(0.35, 124), 5200), -0.3), c["slam"] + 0.02, db(-18))
sfx.add(pan_st(chain_jingle(0.25, 125, edges=True), -0.3), c["slam"] + 0.05, db(-20))
sfx.add(pan_st(creak(0.22, 126, 70, 160), -0.3), c["tonnes_end"] + 0.02, db(-21))
# the whales drop in: a patter of soft low plops with a splashy top, then a ding as the beam levels
r = np.random.default_rng(130)
for k in range(40):
    t_ = c["drop0"] + (k + 4) / 44 * (c["level"] - c["drop0"])
    sfx.add(pan_st(filt(thump(0.12, 160, 70, 0.05, k), "lowpass", 230), float(r.uniform(-0.4, 0.6))), t_, db(-24))
    bed.add(glint(float(r.uniform(5600, 7600)), 0.05, 131 + k), t_, db(-27), pan=float(r.uniform(-0.4, 0.6)))
sfx.add(pan_st(ding(91, 0.18, 132, 1.3), 0.3), c["whales_end"] + 0.03, db(-22))
sfx.add(pan_st(fade(glide(420, 240, 0.18) * 0.8, 0.02, 0.06), 0.4), c["whales_end"] + 0.06, db(-30))   # a little whale call
# ...of tree: the whale turns to bark, its aspen eye opens, it blinks
sfx.add(pan_st(whoosh(0.22, 600, 2600, 141), 0), SHOT["bark"] - 0.15, db(-25))
sfx.add(pan_st(edges(crumple(0.3, 142)), 0.2), c["barkon"], db(-20))
shimmer(c["barkon"], c["barkon"] + 0.25, bed, db(-21), seed=143, rate=30)
bed.add(glint(5900, 0.08, 144), c["blink"], db(-16), pan=-0.1)
sfx.add(pan_st(edges(creak(0.25, 145, 70, 160)), -0.1), c["blink"] + 0.04, db(-22))

# ================================================================= the button: he tries to hug the whole forest
sfx.add(pan_st(whoosh(0.26, 500, 2400, 151), 0), SHOT["button"] - 0.18, db(-22))
sfx.add(pan_st(edges(slide(180, 520, 0.9, 0.0, None, 6), lo=170), 0), c["stretch"], db(-26))      # the arms stretch (edges)
sfx.add(pan_st(slide(260, 700, 0.32, 0.02, None, 6), 0), c["huggers_end"] + 0.06, db(-22))   # ...and strain, in the pause
sfx.add(pan_st(hi_only(whoosh(0.22, 2500, 8000, 152), 4000), 0), c["cut_arms"] - 0.08, db(-24))
sweat = c["cut_arms"] + 0.35
bed.add(glint(6300, 0.06, 153), sweat, db(-22), pan=0.3)
sfx.add(pan_st(twang(150.0, 0.55, 154, -0.08), 0), c["arms_end"] + 0.01, db(-14))         # TWANG: the arms snap back
sfx.add(pan_st(filt(thump(0.16, 130, 60, 0.07), "lowpass", 220), 0), c["arms_end"] + 0.05, db(-20))

# ================================================================= subscribe cue: no sound
# The pill of the pill test (25 Oct-8 Nov 2026, the 23:30 slots) is SILENT; this Short has no pill (arm "none").

# ================================================================= the score: the loop grid (16 bars at about 113 BPM)
BPM, BEAT, BARS = fit_loop(DUR, bars=16)
BAR = 4 * BEAT
CH = ["F", "C", "Dm", "Bb"]
b = lambda t: bar_at(t, BEAT)                                     # noqa: E731
s_under, s_main, s_fall, s_bal, s_btn = b(c["under"]), b(SHOT["sprout"]), b(SHOT["valley"]), b(SHOT["weigh"]), b(SHOT["button"])
# A: the hook, light (no kick under the first words), the forest's music-box motif on top
groove(mus, 0.0, s_under, BPM, CH, gain=-5, seed=10, kick_on=False, snaps=True)
# the ground opens: a low drone and the bass alone
drone(mus, s_under, s_main, [41, 48, 53, 57], cutoff=520, gain=-18, seed=12, swell=0.4)
groove(mus, s_under, s_main, BPM, ["Dm", "Bb"], gain=-8, seed=13, kick_on=False, snaps=False, arp=False, padv=False)
# B: the main groove (sprout, count, scan, hug, eyes), a steel-pan hook for the forest
groove(mus, s_main, s_fall, BPM, CH, gain=-4, seed=14)
riff(mus, [(0, 77), (0.75, 81), (1.5, 84), (2.5, 81), (3, 79), (3.5, 77), (4, 76), (4.75, 79), (5.5, 84), (6.5, 81), (7, 79), (7.5, 76)],
     BEAT, t0=s_main, t1=s_fall, every=8, gain=-21)
shaker(mus, s_main, s_fall, BEAT)
# C: autumn, warm and half-time, into full silence before the payoff
groove(mus, s_fall, s_bal, BPM, ["Bb", "F", "C", "F"], gain=-6, seed=16, half=True, cutoff=1100)
# D: the balance: the same groove with a heavier bottom
groove(mus, s_bal, s_btn, BPM, CH, gain=-4, seed=18, cutoff=1200)
claps(mus, s_bal, s_btn, BEAT, gain=-27)
# E: the button: the hook's light groove again, and a pickup into bar 1
groove(mus, s_btn, DUR - 1e-4, BPM, CH, gain=-8, seed=20, kick_on=False)
for k, m in enumerate((72, 76)):
    mus.add(pan_st(music_box(mtof(m + 12), 0.25, 200 + k), 0.2), DUR - BEAT + k * BEAT / 2, db(-22))
# the forest's motif: a music box on the hook's first bar and on the eyes opening
for k, m in enumerate((84, 88, 91, 89)):
    mus.add(pan_st(music_box(mtof(m), 0.5, 210 + k), 0.3), 0.05 + k * BEAT / 2, db(-26))
# the dead stops (each 0.25 s or more): the answer's punch word and its hitstop, full silence before the payoff and its
# hit, "of tree.", the button
silence(mus, [(c["under"] - 0.05, c["under_end"] + 0.35),
              (c["at"] - 0.25, c["time_end"] + 0.12),
              (c["of"] - 0.08, c["tree3_end"] + 0.3),
              (c["longer"] - 0.05, c["arms_end"] + 0.03)])

# the score dips under the flash-forward (and under the answer's first word right after it)
_i0, _i1 = span(c["ff"] - 0.02, c["real"])
mus.x[:, _i0:_i1] *= 0.35

print(f"score: {BARS} bars at {BPM:.1f} BPM, beat {BEAT:.4f} s, bars x 4 x beat = {BARS * 4 * BEAT:.3f} s (duration {DUR:.3f})")

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
