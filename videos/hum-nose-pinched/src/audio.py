"""Why Can't You HUM With Your Nose Pinched? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

His hum is the instrument: a closed-mouth hum (sfxkit.hum_voice) that runs under the whole hook, heard whole in the
narration's pauses and only below 250 Hz under her words; when the nose is pinched it goes dark and strained and chokes
off (mmMP!), the cheeks balloon, a padlock clicks, a zipper runs, the air piles up as a low groan, the buzz dies into
real silence, a tape runs back, a dust bunny snores, and the encore hum blows it out of his nose, straight into frame 0's
hum. What sits on a word is kept under 250 Hz or above 5.2 kHz; what carries a joke gets a pause to itself.
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

F0 = 130.8                                         # his hum: C3, the key of the groove


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


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


def hum_span(t0, t1, gain, seed, f0=F0, dark=None, under=-6.0, fade_in=0.05, fade_out=0.06, pan=0.0):
    """his hum from t0 to t1: whole in the narration's pauses (sfx bus), only its body under 250 Hz under her words (bed
    bus, `under` dB lower). dark: an array 0..1 over the span (the nose pinched: the hum goes muffled and strains upward)."""
    n = int(round((t1 - t0) * SR))
    if n <= 0:
        return
    u = np.linspace(0, 1, n)
    d = np.zeros(n) if dark is None else dark(u)
    f = f0 * (1 + 0.07 * d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = sum(np.sin(k * ph) / k ** 1.15 for k in range(1, 22)) * (1 + 0.01 * np.sin(2 * np.pi * 5.1 * u * (t1 - t0)))
    open_ = filt(src, "bandpass", [140, 1300])                    # the hum through an open nose: nasal, with its buzz
    shut = filt(src, "lowpass", 520, 2) * 1.3                       # through the cheeks: dull, boomy
    y = norm((1 - d) * open_ + d * shut) * 0.5
    y = fade(y, fade_in, fade_out)
    i0 = int(round(t0 * SR))
    pm = PAUSE[i0:i0 + n]
    pm = np.pad(pm, (0, n - len(pm)), constant_values=1)
    sfx.add(pan_st(y * pm, pan), t0, db(gain))
    bed.add(pan_st(filt(y, "lowpass", 250, 4) * (1 - pm), pan), t0, db(gain + under))


def choke(t, gain, seed=0):
    """mmMP! the hum strains up and is cut off dead, with a little squeak where the air tries the nose"""
    n = int(0.16 * SR)
    u = np.linspace(0, 1, n)
    f = F0 * (1.06 + 0.22 * u ** 1.6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    src = sum(np.sin(k * ph) / k for k in range(1, 18))
    y = norm(filt(src, "lowpass", 700, 2)) * (0.55 + 0.45 * u) * (u < 0.9)
    y = fade(y, 0.01, 0.004)
    sq = squeak(0.06, 2300, 2800)
    sfx.add(pan_st(y, 0), t, db(gain))
    sfx.add(pan_st(fade(sq, 0.002, 0.02), 0.1), t + 0.14, db(gain - 7))


def pfff(t, dur, gain, seed, pan=0.0):
    """air let out between pressed lips / a nose: a breathy hiss that dies away"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    y = filt(white(n, seed), "bandpass", [900, 4200]) * (1 - u) ** 1.4 * np.minimum(1, u / 0.06)
    y += 0.35 * filt(white(n, seed + 1), "bandpass", [300, 900]) * (1 - u) ** 2
    sfx.add(pan_st(fade(norm(y) * 0.6, 0.004, 0.03), pan), t, db(gain))


def zipper(t, dur, gain, seed):
    """a zipper: a run of small hard clicks, quick, rising"""
    y = ratchet(dur, 70.0, 140.0, seed, False, 3600.0)
    y = filt(y, "highpass", 1200)
    sfx.add(pan_st(fade(norm(y) * 0.7, 0.003, 0.02), 0.0), t, db(gain))


def rewind(t, dur, gain, seed):
    """a tape running back: a warbling squeal that falls, with hiss"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = 2400 - 1300 * u + 300 * np.sin(2 * np.pi * 23 * u * dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = 0.6 * np.sin(ph) * (0.5 + 0.5 * np.sin(2 * np.pi * 37 * u * dur)) + 0.25 * filt(white(n, seed), "highpass", 3000)
    sfx.add(pan_st(fade(norm(y) * 0.55, 0.01, 0.04), 0.0), t, db(gain))


# ================================================================= ambience: the bathroom (a soft room tone, a drip far off)
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
amb.x += pan_st(room, 0) * 0.22
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.3 * gate(N, [(c["voice"], c["blast"] + 0.4)])          # inside the glass: muffled, close

# ================================================================= 1. the hook: he hums with her, pinches, it dies
hum_span(0.0, c["nose1"], -13, 1, fade_in=0.004)                                     # he hums from frame 0, at the encore's level (the loop hands him over humming)
hum_span(c["nose1"], c["choke"] + 0.01, -15, 2, dark=lambda u: np.minimum(1, u * 2.5), fade_in=0.02, fade_out=0.01)   # pinched: dull, straining ...
choke(c["choke"], -11, 3)                                                             # ... mmMP! (after "nose.")
bi = balloon_inflate(0.2, 4)
sfx.add(pan_st(fade(bi, 0.004, 0.03), 0.0), c["puff1"], db(-14))                      # the cheeks balloon
low_thud(c["puff1"] + 0.02, -15, 120.0, 0.18, 0.06, sfx)
hi_tick(c["gone"] + 0.25, -15, 5, -0.3)                                               # his eyes dart (on "Gone?", above the word)
hi_tick(c["gone"] + 0.55, -15, 6, 0.3)
hi_tick(c["lock_click"], -11, 7, 0.0)                                                 # the padlock snaps shut: a click ...
low_thud(c["lock_click"] + 0.01, -13, 210.0, 0.1, 0.03)                               # ... with a little weight
for i in range(8):                                                                    # his head turns to glass: a shimmer above the words
    bed.add(pan_st(glint(5600 + 380 * i, 0.08, 10 + i), -0.4 + 0.1 * i), c["voice"] - 0.05 + 0.06 * i, db(-24))
hum_span(c["room"] - 0.2, c["door_end"], -18, 11, dark=lambda u: np.ones_like(u), under=-3.0)   # still humming, trapped: dull, low
for i, dt in enumerate((0.05, 0.42, 0.78, 1.05)):                                     # notes bonk off the walls (low, under the words)
    low_thud(c["room"] + dt, -16, 170.0 + 30 * i, 0.12, 0.04)
    hi_tick(c["room"] + dt + 0.005, -17, 12 + i, (-1) ** i * 0.4)
bg = boing(0.24, 210.0, 13)
sfx.add(pan_st(fade(bg, 0.002, 0.04), 0.25), c["letgo"], db(-16))                     # the padlock springs off (after "door.")
pfff(c["letgo"] + 0.06, 0.3, -15, 14)                                                 # ... and the trapped air goes pfff
hum_span(c["letgo"] + 0.12, c["letgo"] + 0.4, -16, 15, fade_in=0.03, fade_out=0.05)  # a happy little hum, free again

# ================================================================= 2. inside: the road of a hum, then the pinch again
hum_span(c["hum2"] - 0.05, c["pinch2"] + 0.25, -16, 20)                               # he hums the whole way up
bed.add(pan_st(buzz_hi(0.55, 31.0, 21), 0.0), c["buzzing"], db(-19))                   # the voice box buzzing (above the word)
air(c["outnose"] - 0.1, c["lips"] - 0.05, -19, 22)                                    # out of his nose
zipper(c["zip"], 0.2, -15, 23)                                                        # zip! (after "shut.")
sq = squeak(0.12, 1300, 2500)
sfx.add(pan_st(fade(sq, 0.003, 0.03), 0.2), c["squeak"], db(-15))                     # the nose squeaks under the pinch (after "it,")
hum_span(c["pinch2"] + 0.25, c["stop"] + 0.02, -18, 24, dark=lambda u: np.minimum(1, u * 6), under=-3.0, fade_in=0.02, fade_out=0.02)   # the strained hum, pinched
bed.add(pan_st(fade(filt(creak(c["up_end"] - c["piles"], 25, 50, 120), "lowpass", 200), 0.05, 0.08), 0.0), c["piles"], db(-14))   # the air piling up: a low groan
bi2 = balloon_inflate(0.32, 26)
sfx.add(pan_st(fade(bi2, 0.004, 0.04), 0.0), c["balloon"], db(-14))                   # the cheeks balloon (after "puff...")
bed.add(pan_st(fade(filt(creak(c["lungs_end"] - c["pushes"], 27, 40, 90), "lowpass", 180), 0.1, 0.1), 0.0), c["pushes"], db(-13))   # the push builds
sfx.add(pan_st(fade(ding(84, 0.14, 28, 1.3), 0.001, 0.04), 0.0), c["lungs_end"] + 0.03, db(-19))   # =: they match (after "lungs.")
tk = glass_tink(29, 2600.0, 0.12)
sfx.add(pan_st(fade(tk, 0.0005, 0.03), -0.2), c["freeze"], db(-15))                   # the air stops dead (after "flow...")
hi_tick(c["freeze"] + 0.04, -14, 30, 0.2)
pfff(c["stop"] + 0.32, 0.28, -16, 31)                                                 # he lets go: pfff (in the silence)

# ================================================================= 3. the caves
for i, m in enumerate((79, 84)):                                                      # a curious little pluck (after "Weirder?")
    sfx.add(pan_st(fade(pizz(L.mtof(m), 0.18, 40 + i), 0.002, 0.04), 0.0), c["weirder"] + 0.55 + 0.11 * i, db(-17))
hum_span(c["airs"] - 0.05, c["face1_end"] + 0.06, -17, 41)                            # he hums: the caves air out
air(c["caves"] + 0.25, c["face1_end"] - 0.05, -16, 42, lambda u: np.sin(np.pi * u) ** 0.4)   # the fog swirls out (above the words)
for i in range(6):                                                                    # clean: sparkle (after "face.")
    sfx.add(pan_st(glint(5800 + 420 * i, 0.07, 43 + i), -0.3 + 0.12 * i), c["face1_end"] + 0.02 + 0.035 * i, db(-19))
rewind(c["rewind"], 0.2, -15, 50)                                                     # the tape runs back (after "Breathing?")
air(c["barely"] - 0.05, c["them_end"], -17, 51, lambda u: 0.4 + 0.6 * np.sin(np.pi * u * 2) ** 2)   # a plain breath zips past
sn = snore(0.3, 52, 140.0)
sfx.add(pan_st(fade(filt(sn, "highpass", 120), 0.01, 0.05), -0.3), c["snore"], db(-15))   # the dust bunny snores on (after "them.")

# ================================================================= 4. the encore
hum_span(c["blast"], DUR, -14, 60, fade_in=0.03, fade_out=0.004)                      # the encore: he hums, straight into frame 0's hum
cp = cork_pop(61, 700.0)
sfx.add(pan_st(fade(cp, 0.001, 0.03), -0.4), c["blast"] + 0.28, db(-15))              # the bunny pops out of his nose ...
wh = gibber(0.42, 62, 820.0, True, 0.0, 26.0)
sfx.add(pan_st(fade(wh, 0.01, 0.06), -0.6), c["blast"] + 0.32, db(-21))               # ... wheee (a tiny voice, flying off)

# ================================================================= score (drops out for every punchline)
BPM = 108
# the hook: a light pizzicato groove in C, the key of his hum; it stops when the hum chokes
groove(mus, 0.36, c["nose1_end"] - 0.06, BPM, ["C", "F"], gain=-10, seed=10, kick_on=False)
# the answer: a sneaky low walk under "locked ... in a room with no door"
groove(mus, c["locked"] + 0.1, c["door_end"] - 0.04, 96, ["Am", "E"], gain=-13, seed=11, kick_on=False, arp=False, padv=False, snaps=False)
# inside: a curious loop, with holes for the zip and the squeak
groove(mus, c["hum2"] + 0.2, c["shut_end"] - 0.04, 112, ["Dm", "Gm", "Dm", "A"], gain=-13, seed=12, kick_on=False)
groove(mus, c["piles"], c["puff_end"] - 0.04, 112, ["Dm", "A"], gain=-13, seed=13, kick_on=False, snaps=False)
# the push: a tense drone that climbs, cut dead at "no buzz"
drone(mus, c["till"] + 0.1, c["nobuzz"] - 0.02, [38, 45, 50], cutoff=600, gain=-22, seed=14, swell=0.6)
# the caves: a sneaky walk, with holes for the rewind and the snore
groove(mus, c["airs"] + 0.15, c["breathing_end"] - 0.04, 100, ["Am", "F", "C", "G"], gain=-12, seed=15, kick_on=False, padv=False)
groove(mus, c["barely"] + 0.1, c["them_end"] - 0.04, 100, ["Am", "E"], gain=-14, seed=16, kick_on=False, arp=False, padv=False, snaps=False)
# the encore: the hook's groove again, bright, running on into frame 0
groove(mus, c["encore_in"] + 0.15, DUR, BPM, ["C", "F"], gain=-11, seed=17, kick_on=False)
silence(mus, [(c["nose1_end"] - 0.05, c["locked"] + 0.08), (c["door_end"] - 0.03, c["hum2"] + 0.18),
              (c["shut_end"] - 0.03, c["piles"] - 0.02), (c["puff_end"] - 0.03, c["till"] + 0.08),
              (c["nobuzz"] - 0.03, c["airs"] + 0.12), (c["breathing_end"] - 0.03, c["barely"] + 0.08),
              (c["them_end"] - 0.03, c["encore_in"] + 0.12)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0}, duck={"music": 0.72})
