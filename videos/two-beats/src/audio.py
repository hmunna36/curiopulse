"""Can Your Hands Tap Two DIFFERENT Beats? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The pots are the test: his LEFT hand on the big blue pot (a low BONG), his RIGHT on the small orange one (a higher TONK),
one sound per hit from timeline.json's hitsL / hitsR, so the viewer HEARS the two beats glue into one. On a word only the
pot's low body and its slap's top are kept (the speech band stays the narrator's); in a pause the whole pot rings.
Worked example: limp-fingertip's audio.py and the skill's reference/examples/audio.finger-wrinkles.py.
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


def low(y, f=300.0):
    return filt(y, "lowpass", f)


def high(y, f=5200.0):
    return filt(y, "highpass", f)


def soft(y, k=3.2):
    """soft-clip a peak-normalised transient: the same peak, more body (sound.md: the SNIP)"""
    y = norm(y)
    return np.tanh(k * y) / np.tanh(k)


def in_word(t, pre=0.03, post=0.05):
    return any(a - pre <= t <= b + post for a, b in words)


def next_word(t):
    nxt = [a for a, b in words if a > t]
    return min(nxt) if nxt else DUR


def pot(seed, f0, ring=0.22, slap=1.0, dur=0.42):
    """an open palm on an upturned enamel pot: the slap (a noise burst), the pot's body (four inharmonic partials that
    ring and die), a soft thud under it"""
    n = int(dur * SR)
    t = ar(n)
    parts = [(1.0, 1.0), (2.32, 0.55), (3.91, 0.32), (5.43, 0.2)]
    body = sum(a * np.sin(2 * np.pi * f0 * r * t + 0.7 * seed * k) * np.exp(-t / (ring / (1 + 0.7 * k)))
               for k, (r, a) in enumerate(parts))
    sl = filt(filt(white(n, seed), "highpass", 900), "lowpass", 6500) * expdecay(n, 0.011)
    th = np.zeros(n)
    tk = thump(0.12, 230, 95, 0.03, seed)
    th[: len(tk)] += tk[:n]
    y = 0.85 * norm(body) + 0.75 * slap * norm(sl) + 0.5 * norm(th)
    return fade(norm(y), 0.0006, 0.04)


POT = {"L": (147.0, 0.28, 0.0), "R": (294.0, 0.2, 0.0)}    # f0, ring, pan (D3 bong / D4 tonk: an octave apart, both under 300 Hz)


def pot_hit(side, t, gain=0.0, seed=0):
    f0, ring, pn = POT[side]
    p = pot(seed, f0, ring)
    pan = -0.28 if side == "L" else 0.28
    if in_word(t):
        # on a word: the pot's own note (under 300 Hz: D3 for the big pot, D4 for the small one) and the slap's top
        # (over 5.2 kHz), so the narrator keeps the speech band; the two pots stay an octave apart, so the beats are heard
        q = p if side == "L" else pot(seed, 220.0, 0.2)        # the small pot sings A3 on a word (a fifth over the big one's D3)
        body = low(low(q, 280), 280)
        y = norm(body) * 1.0 + norm(high(p, 5200)) * 0.55
        sfx.add(pan_st(fade(y, 0.0006, 0.04), pan), t, db(-14 + gain))
    else:
        room = next_word(t) - t - 0.06
        p = p[: max(int(0.08 * SR), int(min(0.42, room) * SR))]
        sfx.add(pan_st(fade(p, 0.0006, 0.03), pan), t, db(-17 + gain))


def layered_hit(t, mid=True, gain=0.0):
    """the hitstop's hit (sound.md, "Hitstops"); mid=False keeps the body out of the speech band (it sits on a word)"""
    sfx.add(pan_st(filt(snap(51), "highpass", 1800 if mid else 5200), 0.0), t, db(-20 + gain))
    if mid:
        sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), t + 0.004, db(-17 + gain))
        sfx.add(cymbal(52, 0.35), t + 0.01, db(-31 + gain))
    else:
        sfx.add(pan_st(filt(kick(0.9), "lowpass", 240), 0.0), t + 0.004, db(-13 + gain))


def kettle_whistle(dur=0.42, seed=0):
    """a kettle coming to the boil and whistling: a breathy whistle that slides up and wavers, with steam on it"""
    n = int(dur * SR)
    t = ar(n)
    f = (1550 + 520 * np.minimum(1, t / (0.35 * dur))) * (1 + 0.012 * np.sin(2 * np.pi * 7.5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.25 * np.sin(2 * ph)
    br = filt(filt(white(n, seed), "highpass", 1400), "lowpass", 3600) * 0.35
    env = np.minimum(1, t / 0.06) * np.minimum(1, (dur - t) / 0.08)
    return fade(norm((y + br) * env), 0.003, 0.03)


def pour(dur, seed=0, edges=False):
    """tea poured into a tin mug: a burbling stream that rises in pitch as the mug fills"""
    n = int(dur * SR)
    t = ar(n)
    g = gurgle(dur, seed, 22)[:n]
    stream = filt(filt(white(n, seed + 1), "highpass", 700), "lowpass", 4200) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t)))
    y = norm(g) * 0.6 + norm(stream) * 0.5
    y = fade(norm(y), 0.02, 0.06)
    return high(y, 5200) * 1.6 if edges else y


# ================================================================= ambience: the campfire at dusk (crackle, crickets, a breeze)
fire_on = gate(N, [(0, DUR)])
amb.x += pan_st(norm(fire_rumble(DUR, 3, 240.0))[:N], -0.15) * 0.32 * fire_on
amb.x += pan_st(norm(high(crackle(N, 9, 4, 2500, 9000), 4800))[:N], -0.2) * 0.12 * fire_on
crickets(0.3, DUR - 0.4, bed, -36, seed=6, f=6100, rate=0.45)
BRF = max(1, round(0.25 * DUR)) / DUR
amb.x += pan_st(norm(filt(pink(N, 7), "lowpass", 380)) * (0.6 + 0.4 * np.sin(np.pi * BRF * tt) ** 2), 0.2) * 0.16

# ================================================================= the pots: every hit of both hands
for i, h in enumerate(c["hitsL"]):
    pot_hit("L", h, 0.0, 100 + i)
for i, h in enumerate(c["hitsR"]):
    pot_hit("R", h, -1.0, 300 + i)

# ================================================================= 1. the hook and GO (the beats glue together)
bed.add(pan_st(glint(7400, 0.1, 7), 0.35), c["ff"], db(-22))                                  # the flash-forward window in
wh_ff = kettle_whistle(0.3, 8)
bed.add(pan_st(fade(high(wh_ff, 1500), 0.01, 0.05), 0.35), c["ff"] + 0.12, db(-27))          # the kettle's whistle in it (small)
bed.add(pan_st(glint(6900, 0.08, 9), 0.35), c["ff"] + 0.48, db(-24))
gap_go = next_word(c["go_end"]) - c["go_end"]
# GO: a tiny "uh-oh" slide down after the third merged double hit (both pots together), in the pause before "Same"
sw_t = c["merged"][2] + 0.08
if next_word(sw_t) - sw_t > 0.3:
    sfx.add(pan_st(fade(slide_whistle(0.26, 1300, 700), 0.005, 0.05), 0.3), sw_t, db(-26))

# ================================================================= 2. the answer: Same beat? Your hands only have ONE drummer.
sfx.add(pan_st(whoosh(0.2, 300, 2400, 10), 0.0), SHOT["answer"] - 0.16, db(-25))             # the whip to the front
bed.add(pan_st(fade(low(thump(0.08, 260, 120, 0.02, 11), 260), 0.001, 0.02), 0.0), c["win"], db(-19))   # the window pops open (low)
bed.add(pan_st(glint(7900, 0.12, 11), -0.1), c["win"] + 0.08, db(-22))
# ONE: the little drummer slams his bass drum, both mallets: BOOM (low, it sits on "ONE") + the hitstop's hit
_k = filt(kick(1.0), "lowpass", 180)
_t = low(thump(0.3, 140, 50, 0.12, 12), 200)
_n = max(len(_k), len(_t))
boom = soft(np.pad(_k, (0, _n - len(_k))) + 0.4 * np.pad(_t, (0, _n - len(_t))), 2.4)
bed.add(pan_st(fade(boom, 0.001, 0.08), 0.0), c["slam"], db(-8))
layered_hit(c["slam"] + 0.004, mid=False, gain=0.5)
sfx.add(pan_st(filt(snare(13, 0.16), "highpass", 4800), 0.0), c["slam"], db(-20))
# the drummer's motif: a snare ruff (high, under words) after ONE
for k in range(3):
    bed.add(pan_st(filt(snare(14 + k, 0.06), "highpass", 5000), 0.15), c["drummer_end"] + 0.04 + 0.05 * k, db(-25 + 2 * k))

# ================================================================= 3. easy / two and three / He PANICS
sfx.add(pan_st(whoosh(0.18, 300, 2200, 20), -0.1), SHOT["easy"] - 0.15, db(-27))
bed.add(pan_st(glint(8200, 0.1, 21), 0.3), c["easy1"] + 0.1, db(-21))                         # the green tick
sfx.add(pan_st(whoosh(0.16, 300, 2000, 22), 0.1), SHOT["easyok"] - 0.13, db(-29))
# the drummer tangles: a frantic snare roll (high, under "He PANICS"), a cymbal tumble in the pause after it
dr = drumroll(c["panics_end"] - c["panic_on"], 23)
bed.add(pan_st(fade(filt(dr, "highpass", 5000), 0.02, 0.05), 0.2), c["panic_on"], db(-23))
gap_p = next_word(c["panics_end"]) - c["panics_end"] - 0.06
if gap_p > 0.15:
    cy = cymbal(24, 0.6)[:, : int(gap_p * SR)]
    sfx.add(fade(cy, 0.002, 0.05), c["panics_end"] + 0.02, db(-21))
    sfx.add(pan_st(fade(bonk(), 0.001, 0.04)[: int(gap_p * SR)], -0.2), c["panics_end"] + 0.05, db(-23))
# the kettle boils over (the device escalates): steam hiss (high), lid rattles in the pauses
steam_len = c["boil_end"] - c["boil"]
bed.add(pan_st(fade(high(hiss(steam_len, 25, 4.0), 5000), 0.2, 0.3), -0.3), c["boil"], db(-25))
for k in range(9):
    tk = c["boil"] + 0.33 * k
    if not in_word(tk):
        sfx.add(pan_st(fade(glass_tink(26 + k, 3100.0, 0.09), 0.001, 0.03), -0.35), tk, db(-27))

# ================================================================= 4. Speed up... he falls back to an EASY beat
sfx.add(pan_st(whoosh(0.22, 400, 2800, 30), 0.2), SHOT["faster"] - 0.17, db(-22))
bed.add(pan_st(fade(high(riser(c["and"] - c["speed"] + 0.1, 31, 900, 3400), 3000), 0.05, 0.08), 0.0), c["speed"], db(-26))
bwomp(bed, c["flop"] + 0.02, m=33, gain=-13)                                                   # the drummer flops (low)
gap_b = next_word(c["beat2_end"]) - c["beat2_end"] - 0.08
if gap_b > 0.2:
    sfx.add(pan_st(fade(slide_whistle(min(0.4, gap_b), 900, 380), 0.005, 0.05), 0.1), c["beat2_end"] + 0.03, db(-24))

# ================================================================= 5. So drummers cheat. They glue both into ONE rhythm.
sfx.add(pan_st(whoosh(0.2, 300, 2400, 40), -0.2), SHOT["cheat"] - 0.16, db(-24))
bed.add(pan_st(glint(8400, 0.12, 41), 0.1), c["wink"] + 0.06, db(-20))                        # the wink: ting
bed.add(pan_st(fade(high(crack(0.03, 42, 0.006, 2500), 4500), 0.0005, 0.02), 0.2), c["card"] + 0.02, db(-21))   # the card: flick
sfx.add(pan_st(whoosh(0.16, 300, 2000, 43), 0.1), SHOT["glue"] - 0.13, db(-28))
bed.add(pan_st(fade(low(squelch(0.4, 44), 300), 0.01, 0.06), 0.3), c["squeeze"], db(-15))     # the bottle squeezes (low splorch)
bed.add(pan_st(fade(high(squeak(0.16, 3000, 4200), 3000), 0.004, 0.04), 0.3), c["squeeze"] + 0.02, db(-24))
bed.add(pan_st(fade(low(thump(0.14, 180, 70, 0.05, 45), 240), 0.001, 0.04), 0.0), c["stick"], db(-14))   # the rows stick
for k in range(3):                                                                             # ONE row: a little shimmer
    bed.add(pan_st(glint(6400 + 700 * k, 0.1, 46 + k), -0.2 + 0.2 * k), c["merge1"] + 0.06 * k, db(-23))

# ================================================================= 6. the trick and the payoff: Nice... cup of tea. (the kettle WHISTLES)
# (the pots alone in full silence from "Nice", then the biggest hit of the Short: the kettle's whistle with a chord stab)
wh = kettle_whistle(max(0.25, min(0.44, c["now"] - c["whistle"] - 0.03)), 50)
sfx.add(pan_st(wh, -0.3), c["whistle"], db(-15))
layered_hit(c["sting"], mid=True, gain=1.0)
pr_len = c["pour1"] - c["pour0"]
bed.add(pan_st(pour(pr_len, 51, edges=True), -0.25), c["pour0"], db(-18))

# ================================================================= 7. the button: Now you. Nice... cup of tea.
sfx.add(pan_st(whoosh(0.2, 400, 2600, 60), 0.2), SHOT["button"] - 0.18, db(-23))
bed.add(pan_st(glint(7600, 0.1, 61), 0.0), c["now"] + 0.12, db(-22))                         # the hands come up: ting
sfx.add(pan_st(whoosh(0.16, 300, 2000, 62), -0.1), SHOT["button2"] - 0.13, db(-29))
# (the loop: the hook's state at the end; its first hit is at the top of the file)

# ================================================================= score: the loop score (12 bars), stopping dead
BPM, BEAT, BARS = fit_loop(DUR, 96, 124, want=108)
b1 = bar_at(SHOT["answer"] - 0.3, BEAT)          # the march starts with the drummer
b2 = bar_at(c["two2"], BEAT)                      # the minor drive (two and three)
b3 = bar_at(c["speed"] + 0.4, BEAT)               # deflated (half time)
b4 = bar_at(SHOT["glue"], BEAT)                   # the build
b5 = bar_at(c["nice1"] - 0.6, BEAT)               # (silence: the pots alone)
b6 = bar_at(c["whistle"], BEAT)                   # the resolution
b7 = bar_at(c["nice2"], BEAT)                     # the last bars: the pots and the night (as at frame 1)
print(f"loop score: {BARS} bars at {BPM:.1f} BPM (beat {BEAT:.3f} s; bars x 4 x beat = {BARS * 4 * BEAT:.3f} s = DUR {DUR:.3f} s); "
      f"sections at {b1:.2f}, {b2:.2f}, {b3:.2f}, {b4:.2f}, {b5:.2f}, {b6:.2f}, {b7:.2f} s")
# the night under the test: a soft G pad (no beat: the pots are the rhythm), at the start and the end (the loop)
drone(mus, 0.0, b1, [43, 50, 55, 59], cutoff=600, gain=-30, seed=70)
drone(mus, b7, DUR - 1e-3, [43, 50, 55, 59], cutoff=600, gain=-33, seed=71)
# the march: his motif on pizzicato, the drummer's ruff
groove(mus, b1, b2, BPM, ["G", "C", "D", "G"], gain=-12.5, seed=72, kick_on=True, snaps=True, padv=True)
HOOK = [(0, 79), (0.5, 83), (1, 86), (2, 83), (2.5, 81), (3, 79)]
PZ = lambda m, d, s: pizz(L.mtof(m), d, s)
riff(mus, HOOK, BEAT, b1, b2, every=8, inst=PZ, gain=-21, octave=None)
for k in range(int((b2 - b1) / (4 * BEAT))):
    t0 = b1 + (4 * k + 3.5) * BEAT
    mus.add(pan_st(filt(snare(80 + k, 0.08), "highpass", 2500), 0.1), t0, db(-26))
groove(mus, b2, b3, BPM, ["Em", "C", "Em", "B"], gain=-12.0, seed=73, kick_on=True, snaps=True, sixteen=True, padv=True)
groove(mus, b3, b4, BPM, ["G", "Em", "C", "D"], gain=-14.0, seed=74, kick_on=True, snaps=False, half=True, arp=False, cutoff=900)
groove(mus, b4, b5, BPM, ["C", "D"], gain=-12.5, seed=75, kick_on=True, snaps=True, padv=True)
mus.add(pan_st(fade(riser(b5 - b4, 76, 300, 2400), 0.1, 0.1), 0.0), b4, db(-24))
groove(mus, b6, b7, BPM, ["G", "C", "D", "G"], gain=-12.0, seed=77, kick_on=False, snaps=True, padv=True)
riff(mus, HOOK, BEAT, b6, b7, every=8, inst=steel_pan, gain=-22, octave=None)
# the payoff's chord stab on the whistle (G major, bright), and a toot of steel pan
for m in (67, 71, 74, 79):
    mus.add(pan_st(fade(steel_pan(m, 0.5, 90 + m), 0.002, 0.08), 0.0), c["sting"], db(-17))
# the dead stops (direction.md rule 16): ONE drummer, He PANICS, the EASY beat, full silence before the payoff (from
# "Nice" to the whistle), "Now you"
silence(mus, [(c["one1"] - 0.08, c["drummer_end"] + 0.25),
              (c["two2"] - 0.06, c["two2"] + 0.3),
              (c["he"] - 0.06, c["panics_end"] + 0.3),
              (c["beat2"] - 0.05, c["beat2_end"] + 0.35),
              (c["nice1"] - 0.5, c["whistle"] - 0.02),
              (c["now"] - 0.04, c["you_end"] + 0.1)])
# the night steps back for the payoff's silence too
amb.x *= (1 - 0.6 * gate(N, [(c["nice1"] - 0.3, c["whistle"])], smooth=0.12))

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -11.0}, duck={"music": 0.72})
