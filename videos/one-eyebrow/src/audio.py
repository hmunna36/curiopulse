"""Why Can't You Raise Just ONE Eyebrow? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

He strains for one brow (a low creak and a trembling buzz above the words), both brows spring up (BOING), a wooden puppet
handle knocks down on its strings and yanks (a whistle up), his forehead turns to glass (a shimmer), each half of his brain
tugs (a knock and a tick), a sly half smile (ting), one half goes dark (a soft low power-down, no joke), the doctor's ticks,
the glass goes, and the lone brow pops up (DING) into the loop. What sits on a word is kept under 250 Hz or above 5.2 kHz;
what carries a joke gets a pause to itself.
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


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.3, tau=0.09, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def shimmer(t, gain, n=7, up=True, seed=0):
    """glass appearing (or going): a run of tiny glass notes above the speech band"""
    for i in range(n):
        f = 5600 + 380 * (i if up else n - 1 - i)
        bed.add(pan_st(glint(f, 0.08, seed + i), -0.4 + 0.8 * i / max(1, n - 1)), t + 0.045 * i, db(gain))


def strain(t0, t1, gain, seed):
    """him straining for one brow: a low creak (under 220 Hz) and a trembling buzz (above 5.2 kHz); both can sit under words"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    u = np.linspace(0, 1, n)
    cr = filt(creak(t1 - t0, seed, 34, 70), "lowpass", 220)[:n]
    bz = buzz_hi(t1 - t0, 27.0, seed + 1)[:n]
    env = 0.55 + 0.45 * u
    bed.add(pan_st(fade(norm(cr) * env, 0.02, 0.05), 0.0), t0, db(gain))
    bed.add(pan_st(fade(norm(bz) * env, 0.02, 0.05), 0.15), t0, db(gain - 4))


# ================================================================= ambience: the bathroom (a soft room tone), and inside the glass
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
amb.x += pan_st(room, 0) * 0.22
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.3 * gate(N, [(c["each"] - 0.05, c["still"] + 0.2)])

# ================================================================= 1. the hook: he strains for ONE brow, both spring up
strain(0.0, c["eyebrows_end"] + 0.12, -17, 1)                                        # from frame 0 (the loop hands him over straining)
hi_tick(c["one"] - 0.02, -17, 2, 0.3)                                                # his finger pokes the brow ("one")
bg = boing(0.42, 250.0, 3)
sfx.add(pan_st(fade(bg, 0.002, 0.05), 0.0), c["pop"], db(-15))                       # BOING: both brows up (after "eyebrows.")
cp = cork_pop(4, 900.0)
sfx.add(pan_st(fade(cp, 0.001, 0.02), 0.0), c["pop"] - 0.01, db(-17))
strain(c["right_end"] - 0.15, c["pop2"], -17, 5)                                     # he tries again ...
bg2 = boing(0.3, 280.0, 6)
sfx.add(pan_st(fade(bg2, 0.002, 0.04), 0.0), c["pop2"], db(-15))                     # ... boing (after "right?")

# ================================================================= 2. the answer: the puppet handle
bed.add(pan_st(ratchet(0.32, 40.0, 16.0, 7, True), 0.0), c["drop"] - 0.05, db(-16))   # the strings unspool (above the word)
low_thud(c["drop"] + 0.28, -13, 190.0, 0.18, 0.05, sfx)                               # the handle lands on its strings: a wooden knock
hi_tick(c["drop"] + 0.29, -15, 8, 0.0)
sw = slide_whistle(0.17, 900, 1900)
sfx.add(pan_st(fade(sw, 0.004, 0.03), 0.0), c["yank"], db(-16))                      # the yank: a whistle up (after "string.")
low_thud(c["yank"] + 0.01, -13, 210.0, 0.14, 0.04, sfx)

# ================================================================= 3. the glass: each half holds a string to BOTH brows
shimmer(c["each"] - 0.1, -22, 7, True, 10)                                           # his forehead turns to glass
for i, k in enumerate(("each", "brain")):                                            # the halves pop on
    low_thud(c[k] + 0.18, -17, 230.0 - 20 * i, 0.1, 0.03)
    hi_tick(c[k] + 0.19, -18, 11 + i, -0.3 + 0.6 * i)
bed.add(pan_st(ratchet(c["tied"] + 0.3 - c["holds"], 22.0, 34.0, 13, True), 0.0), c["holds"] - 0.05, db(-22))   # the strings drawn on
for i, t in enumerate((c["both2"] - 0.08, c["brows_end"] + 0.02)):                   # each half tugs: a knock and a tick
    low_thud(t, -14, 170.0, 0.16, 0.05)
    hi_tick(t + 0.005, -15, 14 + i, (-1) ** i * 0.35)
sfx.add(pan_st(fade(ding(84, 0.12, 16, 1.2), 0.001, 0.03), 0.2), c["brows_end"] + 0.1, db(-19))   # both brows up: ding (after "brows.")

# ================================================================= 4. the half smile, one string per side
sfx.add(pan_st(fade(ding(91, 0.09, 17, 1.4), 0.001, 0.03), 0.3), c["smirk"], db(-20))  # a sly ting (after "smile.")
for i, t in enumerate((c["oneside"] - 0.06, c["per"] - 0.06)):                        # a corner each
    low_thud(t, -16, 200.0 + 30 * i, 0.12, 0.04)
    hi_tick(t + 0.005, -16, 18 + i, (-1) ** i * 0.4)

# ================================================================= 5. the stroke: one half goes dark (gently); the other still lifts both
n = int(0.7 * SR)
u = np.linspace(0, 1, n)
pd = np.sin(2 * np.pi * np.cumsum(170 - 110 * u) / SR) * (1 - u) ** 1.5
bed.add(pan_st(fade(norm(filt(pd, "lowpass", 240)) * 0.8, 0.02, 0.1), 0.0), c["dim"], db(-15))   # a soft low power-down
hi_tick(c["doctors"] + 0.02, -20, 20, 0.0)                                             # the check comes up
low_thud(c["lifts"] - 0.12, -14, 170.0, 0.16, 0.05)                                    # the lit half tugs
hi_tick(c["lifts"] - 0.115, -15, 21, 0.35)
bed.add(pan_st(glint(6400, 0.09, 22), -0.4), c["lifts"] + 0.12, db(-19))               # a tick by each brow
bed.add(pan_st(glint(7000, 0.09, 23), 0.4), c["bothsides"] - 0.03, db(-19))
for i, m in enumerate((84, 88)):                                                       # BOTH: ding-ding (after "sides.")
    sfx.add(pan_st(fade(ding(m, 0.11, 24 + i, 1.2), 0.001, 0.03), -0.2 + 0.4 * i), c["check"] + 0.1 * i, db(-19))

# ================================================================= 6. the button: hold one down, the other rises alone
shimmer(c["still"] - 0.1, -23, 6, False, 30)                                           # the glass goes
low_thud(c["press"] + 0.02, -15, 230.0, 0.12, 0.04)                                    # the finger presses the brow down (under "down")
sfx.add(pan_st(fade(ding(88, 0.14, 31, 1.4), 0.001, 0.04), -0.3), c["sly"], db(-18))   # DING: the lone brow (after "down.")
for i in range(5):
    bed.add(pan_st(glint(6000 + 450 * i, 0.07, 32 + i), -0.4 + 0.15 * i), c["sly"] + 0.03 + 0.04 * i, db(-21))
for i, dt in enumerate((0.0, 0.32, 0.64)):                                             # his eyes dart (above the words)
    hi_tick(c["nobody"] + 0.1 + dt, -19, 37 + i, (-1) ** i * 0.4)
tk = glass_tink(40, 2600.0, 0.1)
sfx.add(pan_st(fade(tk, 0.0005, 0.03), 0.3), c["wink"], db(-18))                      # the wink (after "know.")
strain(DUR - 0.33, DUR, -17, 41)                                                       # into frame 0: straining again

# ================================================================= score (drops out for every punchline)
BPM = 108
# the hook: a light pizzicato groove in C while he strains; it stops for the BOING
groove(mus, 0.42, c["eyebrows_end"] - 0.06, BPM, ["C", "F"], gain=-13, seed=10, kick_on=False, snaps=False)
# the answer: a sneaky puppet-show walk under "your eyebrows are on one puppet string"
groove(mus, c["your_eb"] + 0.05, c["string_end"] - 0.04, 96, ["Am", "E"], gain=-13, seed=11, kick_on=False, padv=False, snaps=False)
# inside the glass: a curious marimba loop, holes for the tugs' ding and the smirk
groove(mus, c["each"] + 0.25, c["brows_end"] - 0.04, 112, ["Dm", "Gm", "Dm", "A"], gain=-13, seed=12, kick_on=False)
groove(mus, c["now"] + 0.2, c["smile_end"] - 0.04, 112, ["F", "C"], gain=-13, seed=13, kick_on=False, snaps=False)
groove(mus, c["mouth"] + 0.15, c["side_end"] - 0.04, 112, ["F", "C", "G", "C"], gain=-13, seed=14, kick_on=False)
# the stroke: no groove, a warm soft drone; it lifts on "lifts"
drone(mus, c["thats"] + 0.1, c["lifts"] - 0.05, [45, 52, 57], cutoff=420, gain=-25, seed=15, swell=0.4)
drone(mus, c["lifts"] - 0.05, c["sides_end"] - 0.03, [48, 55, 60, 64], cutoff=480, gain=-25, seed=16, swell=0.3)
# the button: a sneaky walk to the DING, then the hook's groove again, bright, running on into frame 0
groove(mus, c["still"] + 0.15, c["down_end"] - 0.04, 96, ["Am", "E"], gain=-14, seed=17, kick_on=False, arp=False, padv=False, snaps=False)
groove(mus, c["know_end"] + 0.1, DUR, BPM, ["C", "F"], gain=-12, seed=18, kick_on=False)   # "Nobody has to know." is said in silence
silence(mus, [(c["eyebrows_end"] - 0.05, c["your_eb"] + 0.03), (c["string_end"] - 0.03, c["each"] + 0.2),
              (c["brows_end"] - 0.03, c["now"] + 0.18), (c["smile_end"] - 0.03, c["mouth"] + 0.12),
              (c["side_end"] - 0.03, c["thats"] + 0.08), (c["sides_end"] - 0.02, c["still"] + 0.12),
              (c["down_end"] - 0.03, c["know_end"] + 0.08)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -13.5}, duck={"music": 0.72})
