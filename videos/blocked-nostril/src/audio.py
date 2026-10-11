"""Why Is One Nostril ALWAYS Blocked? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The nose is the instrument: a sniff that turns into a thin whistle where nothing gets through, a stuffed honk when it
stops dead, a shop bell for the signs, a snore from the nostril on its break, a rubber squeak as one side swells, the
shift bell when they swap. What sits on a word is kept under 250 Hz or above 5.2 kHz; what carries a joke gets a
pause of the narration to itself.
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
WORDS = TL["words"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C
PAUSE = pause_mask(WORDS, N)                       # 1 where nobody is speaking, 0 under words


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def cut(t, seed, gain=-22.0, f0=400, f1=2000, top=2200):
    """the whoosh into a cut: kept dull, so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def air(t0, t1, gain, seed, shape=None, pan=0.0):
    """air on the move: it can run under words, because it is only above 5.2 kHz"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(filt(white(n, seed), "highpass", 5200, 4) * env, 0.004, 0.03), pan), t0, db(gain))


def sniff_at(t, dur, gain, seed, blocked=0.0, rise=1.0, pan=0.0, under=-5.0):
    """a sniff from t: all of it in the pauses of the narration, only its top (above 5.2 kHz) under the words"""
    y = sniff(dur, seed, blocked, False, rise)
    i0 = int(t * SR)
    pm = PAUSE[i0:i0 + len(y)]
    pm = np.pad(pm, (0, len(y) - len(pm)))
    sfx.add(pan_st(y * pm, pan), t, db(gain))
    bed.add(pan_st(sniff(dur, seed, blocked, True, rise), pan), t, db(gain + under))


MIRROR = ("hook", "weird", "button", "loop")

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
amb.x += pan_st(room, 0) * 0.24 * gate(N, on(*MIRROR))                               # the bathroom in the morning
amb.x += pan_st(room, 0) * 0.2 * gate(N, on("cold"))                                 # ... and in the evening
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.4 * gate(N, on("mech", "swap"))                       # inside his nose: muffled, breathing
breeze = norm(filt(white(N, 5), "highpass", 5600, 4) * (0.35 + 0.65 * np.sin(2 * np.pi * 0.5 * tt) ** 2))
amb.x += pan_st(breeze, 0) * 0.05 * gate(N, on("mech", "swap"))                      # ... and the air going through, above the words

# ================================================================= 1. hook: a finger on one nostril, a sniff, nothing
low_thud(0.0, -15, 190.0, 0.12, 0.04, sfx)                                           # the finger lands (before "You")
sniff_at(0.0, 0.62, -13, 2, blocked=0.45, rise=0.6)                                  # he breathes in ...
sniff_at(0.78, 0.72, -13, 3, blocked=0.7, rise=1.0)                                  # ... harder: it whistles ...
sniff_at(1.66, 0.74, -12, 4, blocked=0.95, rise=1.5)                                 # ... and harder
low_thud(c["blocked"], -12, 105.0, 0.3, 0.1)                                         # it stops dead
hi_tick(c["blocked"] + 0.03, -13, 6, -0.2)                                           # no entry
hk = honk(0.2, 300.0, 236.0, 7)
sfx.add(pan_st(fade(hk, 0.006, 0.05), -0.1), c["honk"], db(-12))                      # a stuffed honk, alone (after "blocked.")
sniff_at(c["relax_end"] + 0.015, 0.15, -11, 8, blocked=0.0, pan=0.2)                 # the other one: air (after "Relax,")
air(c["your"] + 0.05, c["shifts"] - 0.05, -18, 9, lambda u: 0.35 + 0.65 * np.sin(np.pi * u * 2) ** 2, 0.2)   # easy breathing
hi_tick(c["shifts"], -12, 10, -0.3)                                                  # two signs drop out of his nose
low_thud(c["shifts"] + 0.02, -15, 150.0, 0.14, 0.05)
hi_tick(c["shifts"] + 0.11, -13, 11, 0.3)
sfx.add(pan_st(fade(ding(88, 0.1, 12, 1.3), 0.001, 0.03), 0.0), c["shifts_end"] + 0.02, db(-19))   # a shop bell (after "shifts,")
hi_tick(c["break"] - 0.02, -14, 13, 0.0)                                             # a window opens on his nose
sn = snore(0.24, 14, 78.0)
sn = filt(sn, "lowpass", 900) + 0.6 * fade(filt(white(len(sn), 15), "bandpass", [450, 1500]) * np.sin(np.pi * np.linspace(0, 1, len(sn))) ** 2, 0.01, 0.05)
sfx.add(pan_st(sn, -0.25), c["snore"], db(-13))                                      # the one on its break, snoring (after "break.")
cut(SHOT["mech"] + 0.05, 20, -19, 300, 1500, 1900)                                   # into his nose

# ================================================================= 2. mech: one side fills with blood and swells
hi_tick(c["spongy"] + 0.05, -14, 21, 0.3)                                            # the label
for i in range(6):                                                                   # the six shelves bounce as they are named (low, under the words)
    low_thud(c["spongy"] + 0.04 + 0.075 * i, -17, 150.0 + 14 * i, 0.1, 0.035)
for i, t0 in enumerate((c["fills"], c["blood"], c["swells"])):                       # blood comes in: a pulse, under the words
    low_thud(t0, -12, 72.0, 0.26, 0.09)
    low_thud(t0 + 0.17, -15, 60.0, 0.22, 0.08)
hi_tick(c["blood"] - 0.03, -14, 22, -0.4)                                            # BLOOD IN
sw_n = c["shut2_end"] - c["swells"]
bed.add(pan_st(fade(filt(creak(sw_n, 23, 60, 150), "lowpass", 200), 0.05, 0.08), -0.3), c["swells"], db(-14))   # rubber stretching, low
air(c["swells"], c["shut2_end"], -19, 24, lambda u: u ** 1.5, -0.3)
sq = squeak(0.17, 1250, 2500)
sfx.add(pan_st(fade(sq, 0.004, 0.03), -0.3), c["squeak"], db(-20))                    # ... a balloon's squeak (after "shut,")
air(c["opens"] - 0.1, c["wide_end"], -17, 25, lambda u: (1 - u) ** 0.8, 0.3)         # the other side lets go
hi_tick(c["wide"], -13, 26, 0.4)                                                     # the hard hat
br = breath(0.2, 27, True)
sfx.add(pan_st(fade(filt(br, "highpass", 500), 0.01, 0.06), 0.3), c["wide_end"] + 0.03, db(-18))   # air goes through (after "wide.")
cut(SHOT["swap"] + 0.02, 30, -24, 400, 1600, 2000)

# ================================================================= 3. swap: the clock spins, the shift bell rings
tk_t, t0 = [], c["every"]
while t0 < c["hours_end"] - 0.02:                                                    # the clock, faster and faster (above the words)
    tk_t.append(t0)
    t0 += 0.17 - 0.1 * (t0 - c["every"]) / (c["hours_end"] - c["every"])
for i, t0 in enumerate(tk_t):
    hi_tick(t0, -15, 31 + i, 0.3 if i % 2 else -0.3)
rt = ratchet(c["they"] - c["hours_end"] - 0.07, 20.0, 46.0, 32)
sfx.add(pan_st(fade(rt, 0.004, 0.03), 0), c["hours_end"] + 0.02, db(-19))             # ... and heard, in the pause after "hours..."
low_thud(c["swap"], -11, 88.0, 0.36, 0.12)                                           # they swap
air(c["swap"] - 0.04, c["swap_end"], -15, 33, lambda u: np.sin(np.pi * u) ** 0.5)
hi_tick(c["swap"] + 0.1, -13, 34, -0.3)                                              # the signs turn over
hi_tick(c["swap"] + 0.2, -13, 35, 0.3)
for i, (m, dt) in enumerate(((84, 0.0), (88, 0.12))):                                # the shift bell (after "swap.")
    sfx.add(pan_st(fade(ding(m, 0.13, 36 + i, 1.4), 0.001, 0.04), 0.0), c["ding"] + dt, db(-20))

# ================================================================= 4. cold: both sides swell
cut(SHOT["cold"] + 0.02, 40, -25, 300, 1300, 1700)
sniff_at(SHOT["cold"] + 0.015, 0.11, -15, 41, blocked=0.6, rise=0.4)                 # a sniffle (before "You")
hi_tick(c["cold"], -13, 42, 0.4)                                                     # the germ
hi_tick(c["both"], -12, 43, -0.3)                                                    # the second sign turns over too
low_thud(c["both"] + 0.02, -13, 95.0, 0.3, 0.1)
sfx.add(pan_st(slide(294.0, 232.0, 0.15, 0.0, None, 7), 0.0), c["gasp"], db(-16))    # wah ... (after "both.")
sfx.add(pan_st(slide(247.0, 170.0, 0.2, 0.02, None, 7), 0.0), c["gasp"] + 0.17, db(-15))   # ... wah

# ================================================================= 5. weird: a jar, a fast lane and a slow lane
cut(SHOT["weird"] + 0.02, 50, -26, 300, 1300, 1700)
tk = glass_tink(51, 2400.0, 0.13)
sfx.add(pan_st(fade(tk, 0.0005, 0.03), -0.3), c["weirder_end"] + 0.02, db(-13))       # the jar (after "Weirder:")
air(c["one1"], c["fast_end"], -15, 52, lambda u: u ** 0.5 * np.minimum(1, (1 - u) / 0.08), 0.3)   # fast: a rush (above the words)
hi_tick(c["fast"], -13, 53, 0.4)
zp = squeak(0.09, 1100, 2600)
sfx.add(pan_st(fade(zp, 0.003, 0.02), 0.3), c["fast_end"] + 0.02, db(-21))            # zip (after "fast,")
hi_tick(c["slow"], -13, 54, -0.4)
sfx.add(pan_st(slide(230.0, 168.0, 0.17, 0.0, None, 6), -0.3), c["slow_end"] + 0.03, db(-15))   # a lazy slide (after "slow,")
sniff_at(c["so"] - 0.02, 0.4, -17, 55, blocked=0.0, under=-2.0)                      # he smells the jar ...
sniff_at(c["smells"] - 0.02, 0.42, -17, 56, blocked=0.0, under=-2.0)                 # ... twice
hi_tick(c["differently"], -12, 57, 0.4)                                              # two thoughts
hi_tick(c["differently"] + 0.2, -12, 58, -0.4)
sfx.add(pan_st(fade(ding(91, 0.13, 59, 1.4), 0.001, 0.04), 0.4), c["yuck"], db(-17))  # mint: a bright note (after "differently.") ...
sfx.add(pan_st(slide(185.0, 112.0, 0.2, 0.03, None, 8), -0.4), c["yuck"] + 0.16, db(-14))   # ... petrol: a sour one

# ================================================================= 6. button: go on, check
cut(SHOT["button"] + 0.02, 60, -25, 300, 1400, 1800)
for i, dt in enumerate((0.07, 0.27)):                                                # he taps his nose, twice (after "Go on...")
    sfx.add(pan_st(cork_pop(61 + i, 540.0 + 90 * i), 0.2), c["on_end"] + dt, db(-17))
air(c["check"] - 0.14, c["check"] + 0.05, -17, 63, None, -0.2)                       # the finger goes across
sniff_at(c["check"] + 0.1, 0.5, -18, 64, blocked=0.0, under=-2.0, pan=0.2)           # through the other one: air
hi_tick(c["whos"], -13, 65, 0.3)                                                     # a tick
bed.add(pan_st(fade(ding(96, 0.06, 66, 1.0), 0.001, 0.02), 0.3), c["whos"] + 0.02, db(-27))
for i, (m, dt) in enumerate(((84, 0.0), (91, 0.13))):                                # the shift bell again (after "now.")
    sfx.add(pan_st(fade(ding(m, 0.13, 67 + i, 1.4), 0.001, 0.04), 0.0), c["now_end"] + 0.08 + dt, db(-20))
tw = tweet(69, 3300.0)
sfx.add(pan_st(fade(tw, 0.004, 0.03), -0.5), c["now_end"] + 0.5, db(-24))             # a sparrow outside the window

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is silent (nobody says "subscribe", 9 Oct 2026) and plays under the button line, so
# these three sounds sit under spoken words. Nothing here may mask one (qa.py lists weak words).
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-25))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-27))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-21))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-32))

# ================================================================= score (drops out for every punchline)
BPM = 108
# the morning: a light pizzicato groove. It starts after "You", and stops when the sniff does
groove(mus, 0.36, c["blocked"] - 0.06, BPM, ["C", "F"], gain=-9, seed=10, kick_on=False)
# ... comes back under "your nostrils work in shifts", and leaves the bell, the last words and the snore alone
groove(mus, c["nostrils"], c["shifts_end"] - 0.05, BPM, ["Am", "F"], gain=-10, seed=11, kick_on=False, snaps=False)
# inside: a curious minor loop
groove(mus, c["tissue"], c["shut2_end"] - 0.08, 112, ["Dm", "Gm", "Dm", "A"], gain=-13, seed=12, kick_on=False)
groove(mus, c["while"] + 0.2, c["wide_end"] - 0.05, 112, ["Dm", "A"], gain=-14, seed=13, kick_on=False, snaps=False)
# the clock: quick and bright, cut off for the ratchet and the bell
groove(mus, c["few"], c["hours_end"] - 0.03, 132, ["F", "C"], gain=-12, seed=14, kick_on=False, sixteen=True)
# the cold: slow and sorry for itself
groove(mus, c["mostly"] + 0.15, c["both"] - 0.1, 78, ["Am", "F"], gain=-9, seed=15, kick_on=False, snaps=False, arp=False, cutoff=900)
# the jar: a sneaky walk (bass and snaps), with holes for the zip and the lazy slide
groove(mus, c["one1"] + 0.1, c["differently_end"] - 0.08, 96, ["Dm", "A"], gain=-9, seed=16, arp=False, padv=False, kick_on=False)
# the button: the morning groove again under "check who's on shift now", and a last chord
groove(mus, c["check"] + 0.1, c["now_end"], BPM, ["C", "F"], gain=-11, seed=17, kick_on=False)
drone(mus, c["now_end"] + 0.4, c["loop"] - 0.05, [48, 55, 60, 64], cutoff=700, gain=-27, seed=18, swell=0.25)
silence(mus, [(c["blocked"] - 0.05, c["nostrils"] - 0.02), (c["shifts_end"] - 0.04, c["tissue"] - 0.02), (c["shut2_end"] - 0.06, c["while"] + 0.18),
              (c["wide_end"] - 0.04, c["few"] - 0.02), (c["hours_end"] - 0.02, c["mostly"] + 0.1), (c["both"] - 0.08, c["one1"] + 0.08),
              (c["fast_end"] - 0.02, c["one2"] + 0.04), (c["slow_end"] - 0.02, c["so"] + 0.04), (c["differently_end"] - 0.06, c["check"] + 0.08),
              (c["now_end"] + 0.02, c["now_end"] + 0.38), (c["loop"] - 0.03, DUR)])

# ================================================================= voice + mix
# the music bus is scaled to its loudest moment, whatever the grooves' own gains: it sits 3 dB lower than the house
# level, because this narration's line endings are soft ("shifts,", "hours...", "now.")
master(WORK, sfx, bed, mus, amb, levels={"music": -14.0}, duck={"music": 0.74})
