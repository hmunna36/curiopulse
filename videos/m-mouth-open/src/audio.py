"""Why Can't You Say "M" With Your Mouth OPEN? 👄 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The dentist's room: a soft room tone under 230 Hz, a little air above 6 kHz, waiting-room bossa on the score. His try at
"Mmm" with the mirror in comes out a goofy "Aaah" (in the pause before "Can't?"); the mirror slides out (a tink, high), his
lips close (a small smack in the pause), he hums under the words (all under 300 Hz) and the M's burst out of his nose on
NOSE (a low thud and glints on the word, the hitstop's crisp top) with a HONK in the pause after it. The buzz: his hum
under the words, a fizz above 5.2 kHz, a BZZT in the pause after "buzz?", the dive's whoosh. Inside: the head's own hum
(low), the lips POP open in the pause after "up...", a low glug as the hum spills, tiny glints as the A's pour out, the
NO M! stamp (low) and a wrong-answer buzzer in the pause after "instead.". The dentist: the bubble's pop (high), the
punch-in thud (low), his "ah-AAH!" in the pause after "dentist." with the hitstop's layered hit. The stage: a crowd
murmur (low), the spotlight's clunk, the dummy's wooden jaw (ticks above 3 kHz), the M's flipping to N's (high), a
rimshot after "N.". The button: his "nana?" in the pause after "mama...", the sweat drop, the mirror's tink as he opens
wide, and the bossa running back into frame 1 on the same bar line (the loop).
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


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11):
    """a knock heard under a word: almost all of it under 200 Hz"""
    bed.add(thump(dur, f, f * 0.3, tau), t, db(gain))


def shimmer(t, gain, n=7, seed=0, pan=0.0, step=0.05):
    """a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(5600 + 360 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def whip(t, gain, seed=0, pan=0.0):
    """the whip pan's whoosh, ending at the cut"""
    sfx.add(pan_st(whoosh(0.22, 300, 2400, seed), pan), t - 0.22, db(gain))


def hum_low(t0, t1, gain, seed=0, inside=0.4, f0=124.0):
    """his closed-mouth hum under the words: only what is under 300 Hz"""
    y = hum_voice(t1 - t0, f0, seed, inside, t0)
    bed.add(pan_st(fade(filt(y, "lowpass", 300), 0.06, 0.08), 0.0), t0, db(gain))


def vowel_a(dur, f0, f1, seed=0):
    """a short open 'aah' (any length): a buzzy source through the 'a' formants, the pitch gliding f0 -> f1"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = f0 * (f1 / f0) ** u * (1 + 0.02 * np.sin(2 * np.pi * 5.5 * ar(n)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = sum(np.sin(k * ph) / k for k in range(1, 28))
    y = svf_bp(src, np.full(n, 780.0), 0.22) + 0.55 * svf_bp(src, np.full(n, 1220.0), 0.28) + 0.2 * svf_bp(src, np.full(n, 2600.0), 0.3)
    y = y / (np.abs(y).max() + 1e-9) + 0.12 * filt(white(n, seed), "bandpass", [400, 3000])
    env = np.clip(np.minimum(ar(n) / 0.015, (dur - ar(n)) / 0.04), 0, 1)
    return y * env


def hit_layers(th, g=0.0):
    """the hitstop's layered hit (sound.md, "Hitstops"): a crisp top, a body a phone plays, a short bright tail"""
    sfx.add(pan_st(filt(snap(51), "highpass", 1800), 0.0), th, db(-20 + g))
    sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), th + 0.004, db(-17 + g))
    sfx.add(cymbal(52, 0.45), th + 0.01, db(-31 + g))


# ================================================================= ambience
room = norm(filt(brown(N, 3), "lowpass", 230) * (0.9 + 0.1 * np.sin(2 * np.pi * 0.13 * tt)))
air = norm(filt(white(N, 5), "highpass", 6200))
clinic = [(0.0, END["buzz"]), (SHOT["dentist"], END["dentist"]), (SHOT["loop"], DUR)]
amb.x += pan_st(room * gate(N, clinic), 0.0) * 0.3
bed.x += pan_st(air * gate(N, clinic), 0.2) * db(-44)
inside = norm(filt(hum_voice(END["spill"] - SHOT["spill"], 96.0, 7, 1.0), "lowpass", 220))
amb.add(pan_st(fade(inside, 0.1, 0.12), 0.0), SHOT["spill"], 0.15)                       # inside his head: the hum's own body
murmur = norm(filt(brown(int((END["vent"] - SHOT["vent"]) * SR), 9), "lowpass", 260))
amb.add(pan_st(fade(murmur, 0.12, 0.15), 0.0), SHOT["vent"], 0.34)                       # the club's crowd (low)

# ================================================================= 1. the hook: open wide... now say "Mmm."
bed.add(pan_st(glass_tink(1, 6200.0, 0.12), 0.25), 0.02, db(-24))                      # frame 1: the mirror taps a tooth (high)
bed.add(pan_st(fade(filt(creak(c["mmm_end"] - c["mmm"] + 0.2, 2, 45, 110), "lowpass", 240), 0.04, 0.06), 0.0), c["mmm"], db(-17))   # the strain (low)
aah = vowel_a(0.4, 168.0, 182.0, 3)
sfx.add(pan_st(fade(aah, 0.02, 0.08), -0.15), c["mmm_end"] + 0.04, db(-15))             # his try: "Aaah?" (in the pause before "Can't?")
whip(SHOT["answer"], -22, 4, 0.2)

# ================================================================= 2. the answer: Can't? M is a hum... out your NOSE
bed.add(pan_st(glass_tink(5, 5800.0, 0.14), 0.4), c["cant"] + 0.06, db(-22))           # the mirror slides out (high)
smack = fade(filt(cork_pop(6, 300.0), "lowpass", 1400), 0.001, 0.02)
sfx.add(pan_st(smack, 0.0), c["cant_end"] + 0.06, db(-22))                             # his lips close: mp (in the pause)
hum_low(c["hum1"] - 0.05, c["nose_end"], -14, 8, 0.45)                                   # his hum, under the words
shimmer(c["nose"] + 0.02, -22, 7, 9, 0.0, 0.035)                                         # the M's burst out (high)
low_thud(c["nose"] + 0.04, -12, 120.0, 0.3, 0.08)                                       # (low)
sfx.add(pan_st(filt(snap(10), "highpass", 4200), 0.0), c["m_pop"], db(-20))             # the hitstop's crisp top (on the word: top only)
hk = honk(0.22, 520.0, 380.0, 11)
sfx.add(pan_st(fade(hk, 0.004, 0.05), 0.1), c["nose_end"] + 0.03, db(-11))              # HONK (the pause after "NOSE.")
sfx.add(pan_st(whoosh(0.16, 400, 2200, 12, 0.6), 0.0), SHOT["buzz"] - 0.12, db(-26))

# ================================================================= 3. the buzz: shut your lips and hum; feel your nose buzz?
hum_low(c["hum2"] - 0.05, c["buzz_end"], -13, 13, 0.55)
bed.add(pan_st(fade(buzz_hi(c["buzz_end"] - c["nose2"], 33.0, 14, 5400), 0.03, 0.06), -0.2), c["nose2"], db(-24))   # the nose fizzes (high)
bz = zap(0.2, 15, 118.0)
sfx.add(pan_st(fade(bz, 0.004, 0.05), 0.15), c["buzz_end"] + 0.02, db(-16))            # BZZT (the pause after "buzz?")
bed.add(pan_st(fade(filt(blip(400, 1400, 0.14, 16), "highpass", 5000), 0.003, 0.04), 0.0), c["win"] + 0.02, db(-22))   # the window opens (high)
sfx.add(pan_st(whoosh(0.32, 200, 1800, 17, 0.7), 0.0), SHOT["spill"] - 0.3, db(-24))  # the dive

# ================================================================= 4. inside: now open up... the hum spills out your MOUTH
pp = cork_pop(18, 520.0)
sfx.add(pan_st(fade(pp, 0.0006, 0.02), 0.2), c["up_end"] + 0.03, db(-15))              # the lips POP open (the pause after "up...")
bed.add(pan_st(glug_low(19), 0.1), c["spills"] - 0.02, db(-14))                         # the hum spills (low)
for i in range(9):
    bed.add(pan_st(glint(5800 + 300 * (i % 4), 0.06, 20 + i), 0.3), c["spills"] + 0.1 + 0.24 * i, db(-26))   # each A pours out (high)
low_thud(c["instead"] + 0.12, -12, 130.0, 0.26, 0.07)                                   # NO M! is stamped (low)
sfx.add(pan_st(fade(buzzer(0.26), 0.002, 0.05), 0.0), c["instead_end"] + 0.03, db(-20))   # eh-eh: wrong (the pause after "instead.")
whip(SHOT["dentist"], -21, 30, -0.2)

# ================================================================= 5. the dentist: that's why you can't answer your dentist
bed.add(pan_st(fade(filt(blip(600, 1800, 0.12, 31), "highpass", 5000), 0.003, 0.04), 0.2), c["thats"] + 0.02, db(-22))   # FLOSSING? pops up (high)
low_thud(c["dentist_w"] - 0.02, -14, 140.0, 0.22, 0.06)                                 # the punch-in (low)
a1 = vowel_a(0.14, 150.0, 140.0, 32)
a2 = vowel_a(0.2, 175.0, 225.0, 33)
sfx.add(pan_st(fade(a1, 0.01, 0.03), -0.1), c["dentist_end"] + 0.04, db(-14))         # "ah-
sfx.add(pan_st(fade(a2, 0.01, 0.05), -0.1), c["dentist_end"] + 0.2, db(-13))          #  -AAH!" (the pause after "dentist.")
hit_layers(c["aah_pop"], -2.0)
whip(SHOT["vent"], -21, 34, 0.2)

# ================================================================= 6. the stage: they fake it with an N
low_thud(SHOT["vent"] + 0.06, -15, 90.0, 0.3, 0.09)                                     # the spotlight's clunk (low)
for k0, k1 in ((c["say3"] - 0.2, c["either"] + 0.45), (c["n_w"] - 0.25, c["n_end"] + 0.25)):
    w = 24.0
    tk = k0 + ((np.pi * 1.5 - w * k0) % (2 * np.pi)) / w                                   # the jaw shuts where sin(24 t) bottoms out
    i = 0
    while tk < k1:
        bed.add(pan_st(filt(pen_tick(40 + i), "highpass", 3000), 0.3), tk, db(-27))       # its wooden jaw clacks (high)
        tk += 2 * np.pi / w
        i += 1
for j, tf in enumerate((c["fake"] + 0.08, c["fake"] + 0.22)):
    bed.add(pan_st(fade(ratchet(0.08, 40.0, 60.0, 50 + j, True), 0.002, 0.02), 0.25), tf, db(-20))   # an M flips to an N (high)
sfx.add(rimshot(55), c["n_end"] + 0.01, db(-13))                                       # ba-dum tss (after "N.")
ch = norm(filt(brown(int(0.55 * SR), 56), "lowpass", 420)) * np.sin(np.pi * np.linspace(0, 1, int(0.55 * SR)))
bed.add(pan_st(ch, 0.0), c["n_end"] - 0.05, db(-20))                                   # the crowd laughs (low)
sfx.add(pan_st(whoosh(0.16, 400, 2200, 57, 0.6), 0.0), SHOT["loop"] - 0.12, db(-26))

# ================================================================= 7. the button: now say "mama"... without moving your lips
def nana(seed=0, f0=168.0):
    """'na-na?' with the lips still: a nasal hum into an open vowel, twice, the second one up (a question)"""
    out = []
    for k, (fa, fb) in enumerate(((f0, f0 * 1.02), (f0 * 1.1, f0 * 1.32))):
        hn = fade(filt(hum_voice(0.16, fa, seed + k, 0.0), "bandpass", [200, 2400])[int(0.04 * SR):int(0.1 * SR)], 0.01, 0.005)
        vw = vowel_a(0.075 if k == 0 else 0.1, fa, fb, seed + 5 + k)
        out += [norm(hn) * 0.6, vw, np.zeros(int(0.02 * SR))]
    return fade(np.concatenate(out), 0.005, 0.03)


sfx.add(pan_st(nana(60), 0.15), c["mama_end"] + 0.03, db(-15))                         # "na-na?" (the pause after "mama...")
bed.add(pan_st(fade(buzz_hi(c["lips3_end"] - c["without"], 29.0, 61, 5600), 0.05, 0.06), 0.1), c["without"], db(-27))   # the strain (high)
bed.add(pan_st(glint(7200, 0.08, 62), 0.3), c["without"] + 0.15, db(-21))              # the sweat drop (high)
bed.add(pan_st(glass_tink(63, 6200.0, 0.12), 0.25), c["reopen"] + 0.2, db(-24))        # the mirror is back in (high): as on frame 1

# ================================================================= score: waiting-room bossa; out for every punchline
BPM = 104
BAR = 4 * 60.0 / BPM
groove(mus, 0.0, c["mmm"] - 0.05, BPM, ["F", "Dm"], gain=-12.5, seed=10, kick_on=False)
groove(mus, c["cant_end"] + 0.3, c["nose"] - 0.05, BPM, ["Bb", "C"], gain=-13.0, seed=11, kick_on=False)
groove(mus, SHOT["buzz"] + 0.05, c["buzz_end"], BPM, ["Gm", "C"], gain=-13.5, seed=12, kick_on=False, arp=False)
drone(mus, SHOT["spill"] + 0.05, c["instead"] - 0.05, [45, 52, 57, 64], cutoff=560, gain=-26, seed=13, swell=0.5)
groove(mus, c["thats"] + 0.3, c["dentist_w"] - 0.05, BPM, ["F", "Dm"], gain=-13.0, seed=14, kick_on=False)
groove(mus, SHOT["vent"] + 0.1, c["n_w"] - 0.05, 120, ["Bb", "F", "C", "F"], gain=-13.0, seed=15, kick_on=False)
_t0 = DUR - 2 * BAR                                                                      # the button's bossa ends on a bar line: frame 1's starts on one
groove(mus, _t0, DUR, BPM, ["F", "Dm"], gain=-12.5, seed=16, kick_on=False)
silence(mus, [(c["mmm"] - 0.05, c["cant_end"] + 0.3), (c["nose"] - 0.05, SHOT["buzz"] + 0.05), (c["buzz_end"], SHOT["spill"] + 0.05),
              (c["instead"] - 0.05, c["thats"] + 0.3), (c["dentist_w"] - 0.05, SHOT["vent"] + 0.1), (c["n_w"] - 0.05, c["now3"] - 0.02)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
