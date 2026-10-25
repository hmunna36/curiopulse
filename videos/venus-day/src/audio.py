"""Why Is a Day on Venus LONGER Than Its Year? 🎂 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.
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

SFX_LEVEL = -12.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(breath=-24, fog=-31, swish=-27, flap=-30, boing=-19, whoosh=-25, rush=-27, shimmer=-29, snore=-16, step=-27,
         creak=-14, plip=-30, tick=-32, yay=-20, ding=-20, ding_year=-17, pop=-19, confetti=-30, horn=-16, rip=-16, tap=-27,
         clink=-15, scratch=-19, globe=-30, choir=-21, shades=-26, box=-21, wah=-21, inhale=-26)

# the picture's clocks, in seconds of the video (scenes.js)
LAP0, LAP1 = C["laps"], C["days_end"] - 0.08          # lapDays: 0 -> 224.7 Earth days
YEAR_D, DAY_D = 224.7, 243.0


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def low_thud(seed=0, f=80.0, dur=0.28):
    """a soft landing heard low: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.08)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def helmet_blow(dur=0.6, seed=0):
    """a breath blown at the inside of a glass helmet: a low, boxy whoomf under 320 Hz and a thin hiss above 5.2 kHz
    (no speech band: it runs under "On Venus"; mono)"""
    n = int(dur * SR)
    t = ar(n)
    env = np.minimum(1, t / 0.06) * np.exp(-np.maximum(0, t - 0.08) / (dur * 0.45))
    lo = filt(brown(n, seed), "lowpass", 320) * env
    hi = filt(white(n, seed + 1), "highpass", 5200) * env * 0.5
    y = lo / (np.abs(lo).max() + 1e-9) + hi / (np.abs(hi).max() + 1e-9) * 0.45
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.06)


def snore(dur=0.42, seed=0):
    """a planet snoring: a slow rattle under 380 Hz (in a pause)"""
    n = int(dur * SR)
    t = ar(n)
    rat = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 26 * t))
    y = filt(brown(n, seed), "lowpass", 380) * rat * np.sin(np.pi * np.minimum(1, t / dur)) ** 0.8
    return fade(y / (np.abs(y).max() + 1e-9), 0.03, 0.08)


def odometer(t0, t1, d0, d1, bus, gain, seed=0, fn=None, f=6400.0):
    """a tick above 5 kHz each time the day counter turns over (fn maps time -> days); it runs under the words"""
    last = None
    k = 0
    for t in np.arange(t0, t1, 1 / 240):
        d = int(round(fn(t)))
        if last is not None and d != last:
            bus.add(pan_st(glint(f + 400 * (k % 3), 0.025, seed + k), 0.3 * np.sin(k)), t, db(gain))
            k += 1
        last = d


def ease_io(x):
    return -(np.cos(np.pi * np.clip(x, 0, 1)) - 1) / 2


def choir(dur, freqs, seed=0):
    """a soft "aah": detuned vowel-ish pad (formants near 700 / 1200 Hz), swelling (for a pause)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.zeros(n)
    for i, f in enumerate(freqs):
        for d in (-0.4, 0.0, 0.5):
            ph = 2 * np.pi * np.cumsum(np.full(n, f * (1 + d / 100) * (1 + 0.004 * np.sin(2 * np.pi * (5 + i) * t)))) / SR
            y += sum(np.sin(k * ph) / k ** 1.3 for k in range(1, 9))
    y = filt(y, "bandpass", (300, 2600))
    y *= np.minimum(1, t / (dur * 0.35)) * np.minimum(1, (dur - t) / 0.12)
    return fade(y / (np.abs(y).max() + 1e-9), 0.02, 0.1)


# ================================================================= the beds
surf_on = gate(N, [(0, SHOT["rise"] + 0.45), (SHOT["payoff"], DUR)])
space_on = gate(N, [(SHOT["rise"] + 0.4, SHOT["payoff"])])
# Venus: a slow, heavy wind (the air is ninety times thicker than ours) and a far rumble, all under 300 Hz
wind = filt(brown(N, 3), "lowpass", 230) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.09 * tt) ** 2)
rum = filt(brown(N, 4), "lowpass", 90) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.05 * tt + 1))
amb.x += pan_st(wind * 0.55 + rum * 0.5, 0) * surf_on
# space: almost nothing; a low hum of the Sun
hum = sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(55.0, 0.5), (82.5, 0.25), (110.0, 0.12)]) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.3 * tt))
amb.x += pan_st(hum * 0.18, 0) * space_on

# ================================================================= the hook: blowing at a bulb in a glass helmet; the year flips by
bed.add(pan_st(helmet_blow(0.42, 1), 0), 0.0, db(G["breath"]))                                    # pfff (frame 1)
bed.add(pan_st(helmet_blow(0.32, 2), 0), 0.5, db(G["breath"] - 2))                                # pff
bed.add(pan_st(top_swish(0.5, 3), 0.2), C["one"] - 0.12, db(G["swish"]))                          # the camera eases back (top)
bed.add(pan_st(ratchet(C["year_end"] - C["whole"] + 0.1, 9.0, 16.0, 5, edges=True), -0.5), C["whole"] - 0.06, db(G["flap"]))   # JAN..DEC (top)
sfx.add(pan_st(boing(0.3, 210.0, 6), 0.2), C["year_end"] + 0.02, db(G["boing"]))                  # YEAR. ... boing (his hat)

# ================================================================= the rise: straight up through the cloud, out into space
bed.add(pan_st(top_swish(0.55, 10), 0), SHOT["rise"] - 0.05, db(G["whoosh"]))                     # whoosh (top)
bed.add(pan_st(low_thud(11, 60.0, 0.5), 0), SHOT["rise"] + 0.3, db(G["rush"]))                     # through the cloud (low)
for i in range(4):                                                                                 # out into the stars (glints)
    bed.add(pan_st(glint(5600 + 600 * i, 0.12, 12 + i), 0.5 * (-1) ** i), SHOT["rise"] + 0.45 + 0.07 * i, db(G["shimmer"]))
sfx.add(pan_st(snore(0.4, 13), 0.4), C["planet_end"] + 0.03, db(G["snore"]))                       # planet... (the planet snores)
for i in range(9):                                                                                 # he walks it like a log (low)
    bed.add(pan_st(low_thud(20 + i, 150.0, 0.1), 0), C["it1"] + 0.06 + 0.15 * i, db(G["step"]))
sfx.add(pan_st(creak(0.26, 30, 55, 120), 0), C["spins_end"] + 0.02, db(G["creak"]))                # spins. ... creeeak (it moved a hair)
bed.add(pan_st(drip(31, 6200), 0.3), C["spins_end"] + 0.12, db(G["plip"]))                          # a sweat drop (top)

# ================================================================= the lap: 225 days in four seconds
bed.add(pan_st(top_swish(0.8, 40), 0), SHOT["orbit"] - 0.02, db(G["whoosh"]))                     # the camera pulls out (top)
lap_d = lambda t: YEAR_D * ease_io((t - LAP0) / (LAP1 - LAP0))   # noqa: E731
odometer(LAP0, LAP1 + 0.05, 0, YEAR_D, bed, G["tick"], 41, lap_d)                                  # the counter, every day (top)
sfx.add(pan_st(ding(84, 0.12, 42, bright=1.5), 0), C["days_end"] - 0.02, db(G["ding_year"]))           # days... ding: 1 YEAR (in the gap)
bed.add(pan_st(low_thud(43, 70.0, 0.3), 0), C["days_end"] - 0.02, db(G["pop"] - 4))                # and its pop (low)
for i in range(5):
    bed.add(pan_st(glint(6000 + 500 * i, 0.06, 44 + i), 0.6 * np.sin(i)), C["days_end"] + 0.03 + 0.04 * i, db(G["confetti"]))

# ================================================================= the turn: 18 more days to get round once
bed.add(pan_st(top_swish(0.7, 50), 0), SHOT["spin"] - 0.02, db(G["whoosh"]))                      # the camera pushes in (top)
spin_d = lambda t: YEAR_D + (DAY_D - YEAR_D) * ease_io((t - (C["two2"] - 0.25)) / (C["once"] - 0.02 - (C["two2"] - 0.25)))   # noqa: E731
odometer(C["two2"] - 0.25, C["once"], YEAR_D, DAY_D, bed, G["tick"] + 2, 51, spin_d, f=5800.0)    # slower ticks (top)
for k, tp in enumerate(np.arange(SHOT["spin"] + 0.6, C["turn"] - 0.2, 0.42)):                      # he taps his foot (low)
    bed.add(pan_st(low_thud(60 + k, 170.0, 0.08), 0.2), tp, db(G["tap"]))
sfx.add(pan_st(ding(88, 0.12, 61, bright=1.6), 0), C["once_end"] + 0.03, db(G["ding"]))           # ONCE. ... ding: 1 DAY
sfx.add(pan_st(party_horn(0.36, 62, 470.0), 0.2), C["once_end"] + 0.16, db(G["horn"]))            # ... and a feeble toot
for i in range(4):
    bed.add(pan_st(glint(6200 + 450 * i, 0.06, 63 + i), 0.5 * np.sin(i + 1)), C["once_end"] + 0.05 + 0.05 * i, db(G["confetti"]))

# ================================================================= the payoff: a year older (POP)... not a day older (rrrip: MONDAY)
bed.add(pan_st(top_swish(0.35, 70), -0.2), SHOT["payoff"] - 0.04, db(G["whoosh"] + 2))            # back down (top)
pop_t = C["older_end"] + 0.03
sfx.add(pan_st(cork_pop(71, 900.0), 0.3), pop_t, db(G["pop"]))                                    # older... POP (the popper)
for i in range(6):
    bed.add(pan_st(glint(5800 + 400 * i, 0.07, 72 + i), 0.4 * np.sin(i)), pop_t + 0.04 + 0.05 * i, db(G["confetti"]))
sfx.add(pan_st(page_rip(0.2, 73), -0.4), C["older2_end"] + 0.04, db(G["rip"]))                     # older. ... rrrip
bwomp(mus, C["older2_end"] + 0.36, m=31, gain=-9)                                                  # MONDAY again: bwomp

# ================================================================= the weird fact: it spins backwards; the Sun comes up in the WEST
bed.add(pan_st(top_swish(0.3, 80), 0), SHOT["weird"] - 0.04, db(G["whoosh"] + 2))
clink_t = C["oh_end"] + 0.02
sfx.add(pan_st(glass_tink(81, 3300.0, 0.18), 0.1), clink_t, db(G["clink"]))                       # Oh, ... CLINK (the mug on his helmet)
for i, tp in enumerate([C["spins2"] - 0.12, C["spins2"] - 0.02]):                                  # the little globes pop in (top)
    bed.add(pan_st(glint(6400 + 300 * i, 0.06, 82 + i), -0.4 + 0.8 * i), tp, db(G["globe"]))
sfx.add(pan_st(scratch(0.3, 84), 0), C["backwards_end"] + 0.04, db(G["scratch"]))                 # BACKWARDS... wikka (a record backwards)
sfx.add(pan_st(choir(C["west_end"] + 0.7 - C["west"], [mtof(64), mtof(67), mtof(71)], 85), 0.3), C["west_end"] + 0.02, db(G["choir"]))   # WEST. ... aaah
bed.add(pan_st(top_swish(0.12, 86), 0), C["west"] - 0.06, db(G["shades"]))                       # the shades flip up (top)

# ================================================================= the button: happy birthday; it's still... Monday
_box_end = C["its"] - 0.1                                                                          # the tune must be over before "It's"
for i, (m, d) in enumerate([(67, 0.0), (67, 0.1), (69, 0.2), (67, 0.32)]):                         # birthday. ... a music box (public domain tune)
    t0 = C["birthday_end"] + 0.04 + d
    nb = music_box(mtof(m + 12), max(0.08, min(0.34, _box_end - t0)), 90 + i)
    sfx.add(pan_st(fade(nb, 0.002, 0.05), 0.15), t0, db(G["box"]))
sfx.add(pan_st(wahwah(91), 0), C["monday_end"] + 0.06, db(G["wah"]))                               # Monday. ... wah-wah
bed.add(pan_st(breath(0.6, 92), 0), DUR - 0.66, db(G["inhale"]))                                   # he breathes in to blow: into the loop

# ================================================================= score (drops out for every punchline)
BPM = 104
groove(mus, 0.24, C["year"] - 0.05, BPM, ["C", "F", "G", "C"], gain=-9, seed=10, kick_on=False, snaps=True)          # the hook: a birthday bounce
mus.add(pan_st(riser(SHOT["rise"] + 0.45 - (C["year_end"] + 0.25), 15, 240, 2200), 0), C["year_end"] + 0.25, db(-27))   # up through the cloud
drone(mus, SHOT["rise"] + 0.45, C["it1"] - 0.05, [45, 52, 57, 64], cutoff=650, gain=-23)                               # space: wonder
groove(mus, C["it1"] + 0.1, C["spins_end"] - 0.05, BPM, ["Am", "F"], gain=-10, seed=20, kick_on=True, snaps=False)     # he walks it
groove(mus, LAP0 + 0.1, C["days_end"] - 0.06, BPM * 1.2, ["Am", "F", "C", "G"], gain=-11, seed=30, sixteen=True, cutoff=900)   # the time-lapse: drive
crash(mus, C["days_end"] - 0.04, gain=-26)
drone(mus, C["but"] + 0.12, C["once"] - 0.05, [33, 40, 45, 48], cutoff=480, gain=-21)                                   # waiting for the line
mus.add(pan_st(filt(riser(C["once"] - C["two2"], 31, 260, 1800), "highpass", 4800), 0), C["two2"], db(-27))
groove(mus, C["so"] + 0.1, C["older_end"] - 0.03, BPM, ["C", "F"], gain=-9, seed=40, kick_on=False, snaps=True)       # the payoff: the bounce again
groove(mus, C["oh_end"] + 0.3, C["backwards_end"] + 0.03, BPM * 0.8, ["Fm", "Bb"], gain=-11, seed=50, kick_on=False, snaps=True, half=True)   # the lounge
drone(mus, C["so2"] + 0.1, C["west"] - 0.05, [40, 47, 52, 56], cutoff=520, gain=-22)                                   # dawn, behind him
groove(mus, C["happy"] + 0.15, C["its"] - 0.05, BPM, ["C", "F"], gain=-11, seed=60, kick_on=False, snaps=False)       # happy birthday
silence(mus, [(C["year"] - 0.05, C["year_end"] + 0.25),           # YEAR. boing
              (C["planet_end"] - 0.05, C["it1"] + 0.1),          # planet... (snore)
              (C["spins_end"] - 0.05, LAP0 + 0.1),               # spins. creak
              (C["days_end"] - 0.06, C["but"] + 0.12),           # days. ding
              (C["once"] - 0.05, C["so"] + 0.1),                 # ONCE. ding, toot
              (C["older_end"] - 0.03, C["oh_end"] + 0.3),            # POP / rip / bwomp
              (C["backwards_end"] + 0.03, C["so2"] + 0.1),       # scratch
              (C["west"] - 0.05, C["happy"] + 0.15),             # WEST. aaah, his look
              (C["its"] - 0.05, DUR)])                           # It's still... Monday.

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
