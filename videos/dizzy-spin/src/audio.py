"""Why Do You Get DIZZY When You Spin? 💫 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The chair carries the hook: a rumble and a swish on every turn (low and above 5 kHz, so they sit under the first
words), a caster squeal after "stop.", and a dizzy wobble after "DOESN'T!". Every joke sound has a pause of the
narration to itself: the "wheee" after "DIDN'T!", the tiny chorus after "TURNING!", the brake after "Stop,", the
megaphone after "SPINNING...", the buzzer after "NOPE.", the power-down after "DOWN.", the chair's gas lift after
"sit down...", the party horn after "lap.". The last 0.4 s spin up again into frame 1.
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
PAUSE = pause_mask(WORDS, N)


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.3, tau=0.1, bus=None):
    """a knock that can sit under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def cut(t, seed, gain=-22.0, f0=300, f1=1500, top=1800):
    """the whoosh into a cut, kept dull so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


def twinkle(t0, t1, gain, seed, rate=9.0):
    """a sprinkle of tiny glass notes above 5 kHz (stars round a head): it can sit on words"""
    r = np.random.default_rng(seed)
    t = t0
    while t < t1:
        bed.add(pan_st(glint(r.uniform(5400, 8200), 0.08, int(r.integers(0, 999))), r.uniform(-0.5, 0.5)), t, db(gain + r.uniform(-3, 0)))
        t += r.exponential(1 / rate)


def mega(t, dur, seed, f0=420.0, gain=-8.0, pan=0.0):
    """a tiny voice shouting through a megaphone (gibberish, band-limited and a little crunchy): for a pause"""
    y = gibber(dur, seed, f0, True)
    y = np.tanh(2.4 * filt(y, "bandpass", [700, 3600], 2))
    sfx.add(pan_st(fade(y, 0.005, 0.03), pan), t, db(gain))


OFFICE = ("hook", "ears", "button", "loop")

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 220) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.17 * tt)))
amb.x += pan_st(room, 0) * 0.22 * gate(N, on(*OFFICE))                                # the office at night
inside = norm(filt(pink(N, 4), "bandpass", [45, 240]) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.9 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.42 * gate(N, on("canal"))                             # inside the ear: muffled, a slow slosh
hall = norm(filt(brown(N, 7), "lowpass", 300))
amb.x += pan_st(hall, 0) * 0.18 * gate(N, on("stage"))                               # an empty theatre

# ================================================================= the chair: a rumble and a swish every turn
# how fast it turns (0..1): the hook until "stop.", and the last 0.4 s (it spins up into frame 1, the loop)
spin = np.zeros(N)
i_stop = int(c["stop"] * SR)
spin[:i_stop] = 1.0
i_loop = int((DUR - 0.4) * SR)
spin[i_loop:] = 0.2 + 0.8 * (0.5 - 0.5 * np.cos(np.pi * np.linspace(0, 1, N - i_loop)))
spin[i_stop:i_stop + int(0.06 * SR)] *= np.linspace(1, 0, min(int(0.06 * SR), N - i_stop))
W0 = 7.4
ph = np.cumsum(W0 * spin) / SR                               # the turn so far (rad): its last value meets frame 1's
rev = 0.5 + 0.5 * np.cos(ph)                                 # once a turn the chair's back passes the camera
rumble = filt(brown(N, 11), "lowpass", 180, 4) * (0.6 + 0.4 * rev) * spin
bed.x += pan_st(norm(rumble), 0) * db(-9)
swish = filt(white(N, 12), "highpass", 5600, 4) * rev ** 3 * spin
bed.x += pan_st(norm(swish) * (0.4 + 0.6 * rev), np.sin(ph) * 0.4) * db(-19)
for k in range(int(ph[-1] / (np.pi / 2)) + 1):              # the casters tick four times a turn (above the words)
    i = np.searchsorted(ph, k * np.pi / 2)
    if 0 < i < N and spin[i] > 0.15:
        hi_tick(i / SR, -21 - 3 * (k % 2), 30 + k % 7, 0.2 if k % 2 else -0.2)

# ================================================================= 1. hook: he stops, the room does not
low_thud(c["stop"], -9, 110.0, 0.32, 0.1)                                            # his feet slam down (under "stop.")
hi_tick(c["stop"], -12, 1, 0.0)
sfx.add(pan_st(fade(squeak(0.17, 2900, 1700), 0.004, 0.03), 0.2), c["stop_end"] + 0.012, db(-17))   # the casters squeal (after "stop.")
twinkle(c["room"] + 0.3, c["window"] - 0.1, -24, 2, 7.0)                             # stars round his head
wob = slide(980, 420, 0.36, vib=0.09, harm=4)
sfx.add(pan_st(wob, 0), c["doesnt_end"] + 0.025, db(-16))                            # woo-oo-oo (after "DOESN'T!")
low_thud(c["window"], -16, 190.0, 0.12, 0.04)                                        # a window opens on his ear
hi_tick(c["window"] + 0.01, -14, 3, 0.4)
bed.add(pan_st(filt(gurgle(c["didnt"] - c["liquid"], 4, 16), "lowpass", 280), 0.3), c["liquid"], db(-16))   # the liquid in it (low)
sfx.add(pan_st(slide_whistle(0.28, 950, 2100), 0.35), c["didnt_end"] + 0.02, db(-17))   # wheee (after "DIDN'T!")
bed.add(pan_st(filt(whoosh(c["sloshes"] - c["dive"], 160, 700, 5, 0.9), "lowpass", 300), 0), c["dive"], db(-12))   # into the window (low)

# ================================================================= 2. canal: three loops, the bulge, TURNING!, Stop
cut(SHOT["canal"] + 0.02, 6, -26)
bed.add(pan_st(filt(gurgle(2.4, 7, 14), "lowpass", 300), 0), c["sloshes"], db(-14))   # sloshing round (low)
for i, f in enumerate(("three", "tiny", "loops")):                                    # the loops light up, one by one
    bed.add(pan_st(glint(6000 + 700 * i, 0.12, 8 + i), (-0.3, 0.4, 0.0)[i]), c[f], db(-15))
    low_thud(c[f], -17, 170.0 + 20 * i, 0.12, 0.04)
low_thud(c["bending"] - 0.06, -14, 120.0, 0.24, 0.08)                                 # into the bulge
bed.add(pan_st(filt(creak(0.7, 9, 60, 140), "lowpass", 320), 0.0), c["bending"] + 0.1, db(-13))   # the jelly flap bends (low)
bed.add(pan_st(buzz_hi(c["stop2"] - c["tell"], 26.0, 10), 0.1), c["tell"], db(-22))   # the signal goes up the nerve (above the words)
low_thud(c["turning"], -12, 96.0, 0.3, 0.1)                                           # TURNING! (low, under the word)
hi_tick(c["turning"], -11, 11, 0.0)
mega(c["turning_end"] + 0.02, 0.14, 12, 640.0, -20.0, -0.2)                           # the hair cells, a tiny chorus (after "TURNING!")
mega(c["turning_end"] + 0.04, 0.12, 13, 700.0, -23.0, 0.25)
low_thud(c["stop2"], -12, 84.0, 0.36, 0.12)                                            # Stop, (the walls jolt, low)
hi_tick(c["stop2"], -14, 14, 0.0)
sfx.add(pan_st(fade(squeak(0.3, 3100, 1900), 0.004, 0.04), -0.2), c["stop2"] + 0.35, db(-16))   # the brakes (after "Stop,")
bed.add(pan_st(filt(gurgle(1.3, 15, 11), "lowpass", 300), 0), c["keeps"] - 0.1, db(-12))   # ... and it keeps sloshing (low)
bed.add(pan_st(filt(splash(0.5, 16, 0.6), "lowpass", 300), 0), c["sloshing_end"] - 0.12, db(-14))

# ================================================================= 3. ears: SPINNING! vs NOPE!
cut(SHOT["ears"] + 0.02, 17, -26)
for f in ("yell1", "yell2"):                                                           # the megaphones pop up (low + top)
    low_thud(c[f], -16, 200.0, 0.1, 0.035)
    hi_tick(c[f] + 0.01, -13, 18, -0.4 if f == "yell1" else 0.4)
mega(c["spinning_end"] + 0.03, min(0.3, c["eyes_word"] - c["spinning_end"] - 0.14), 19, 520.0, -16.0, -0.45)                            # the ear's cell, through its megaphone (after "SPINNING...")
sfx.add(pan_st(fade(buzzer(0.18), 0.004, 0.03), 0.45), c["nope_end"] + 0.02, db(-16))  # NOPE (after "NOPE.")
twinkle(c["nope"] + 0.25, END["ears"] - 0.05, -23, 20, 10.0)                           # the brain's stars
by = filt(boing(0.32, 140.0, 21), "lowpass", 300)
bed.add(pan_st(by, 0), c["nope_end"] + 0.18, db(-12))                                  # the brain goes boing (low)

# ================================================================= 4. stage: a pirouette, a perfect stop, the dial goes DOWN
cut(SHOT["stage"] + 0.02, 22, -27)
t_stop = c["may"] - 0.12
spin2 = np.zeros(N)
a0, a1 = int((c["ballet"] - 0.3) * SR), int(t_stop * SR)
spin2[a0:a1] = 1.0
ph2 = np.cumsum(2 * np.pi * 1.9 * spin2) / SR
rev2 = (0.5 + 0.5 * np.cos(ph2)) ** 3
bed.x += pan_st(norm(filt(white(N, 23), "highpass", 5600, 4)) * rev2 * spin2, 0) * db(-21)   # tutu swish (above the words)
bed.x += pan_st(norm(filt(brown(N, 24), "lowpass", 200, 4)) * rev2 * spin2, 0) * db(-17)
low_thud(t_stop, -14, 160.0, 0.18, 0.06)                                               # the stop: crisp
for i, f in enumerate((6400, 7600, 8800)):
    bed.add(pan_st(glint(f, 0.14, 25 + i), (-0.3, 0, 0.3)[i]), t_stop + 0.02 * i, db(-14))
bed.add(pan_st(ratchet(0.4, 30.0, 14.0, 26, True), 0.3), c["down"] - 0.3, db(-14))     # the dial turns (above the word)
pd = slide(640, 130, 0.38, vib=0.0, harm=5)
sfx.add(pan_st(pd, 0.2), c["down_end"] + 0.03, db(-15))                                # power-down (after "DOWN.")

# ================================================================= 5. button: sit down, let the lap finish, and off again
cut(SHOT["button"] + 0.02, 27, -27)
sfx.add(pan_st(fade(gas_hiss(0.26, 28), 0.01, 0.05), -0.1), c["sitdown_end"] + 0.03, db(-5))   # the chair's gas lift sinks (after "down...")
low_thud(c["sitdown_end"] + 0.02, -15, 150.0, 0.14, 0.05)
low_thud(c["and_let"] - 0.05, -17, 190.0, 0.12, 0.04)                                  # the window opens
hi_tick(c["and_let"] - 0.04, -15, 29, 0.4)
bed.add(pan_st(buzz_hi(c["lap"] - c["and_let"], 18.0, 30), 0.4), c["and_let"], db(-24))   # the droplet racing round (above the words)
bed.add(pan_st(glint(7400, 0.14, 31), 0.4), c["lap"], db(-13))                          # it crosses the line
sfx.add(pan_st(party_horn(0.34, 32, 520.0), 0.4), c["lap_end"] + 0.03, db(-14))        # a party horn (after "lap.")
low_thud(c["loop"] - 0.12, -13, 140.0, 0.16, 0.05)                                     # he grabs the armrests and pushes off

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
def waltz(t0, t1, bpm, chords, gain, seed):
    """a music-box waltz: a pizzicato bass on 1, two chord tones on 2 and 3 (music bus)"""
    beat = 60.0 / bpm
    names = {"C": [60, 64, 67], "G7": [59, 62, 65, 67], "F": [57, 60, 65], "Am": [57, 60, 64], "Dm": [62, 65, 69]}
    roots = {"C": 48, "G7": 43, "F": 41, "Am": 45, "Dm": 50}
    t, bar = t0, 0
    while t < t1 - 0.05:
        ch = chords[bar % len(chords)]
        mus.add(pan_st(pizz(mtof(roots[ch]), 0.5, seed + bar), 0), t, db(gain - 2))
        for b in (1, 2):
            if t + b * beat >= t1:
                break
            for j, m in enumerate(names[ch][1:3]):
                mus.add(pan_st(music_box(mtof(m + 12), 0.5, seed + 10 * bar + b + j), (-0.25, 0.25)[j]), t + b * beat, db(gain - 6))
        t += 3 * beat
        bar += 1


# the answer: a curious pizzicato walk; out for "DIDN'T!" and the wheee
groove(mus, c["head"] + 0.1, c["didnt"] - 0.08, 104, ["Dm", "A"], gain=-12, seed=40, kick_on=False, padv=False)
# the loops: a minor drive, out for TURNING!
groove(mus, c["sloshes"] + 0.08, c["turning"] - 0.06, 116, ["Am", "F", "C", "E"], gain=-12, seed=41, kick_on=False, sixteen=True)
# after "Stop,": a held, uneasy chord while it keeps sloshing
drone(mus, c["keeps"] - 0.05, c["sloshing_end"], [45, 52, 56, 60], cutoff=600, gain=-26, seed=42, swell=0.4)
# the shouting match: a bouncy back-and-forth, out for NOPE
groove(mus, c["ears2"] + 0.1, c["nope"] - 0.06, 120, ["F", "C"], gain=-12, seed=43, kick_on=False)
# the stage: a music-box waltz, out for DOWN
waltz(c["ballet"] + 0.06, c["down"] - 0.1, 156, ["C", "G7", "C", "G7", "F", "C"], -23, 44)
# the button: a small resolving tune, out for "lap"
groove(mus, c["and_let"] + 0.1, c["lap"] - 0.06, 104, ["F", "C"], gain=-13, seed=45, kick_on=False, snaps=False)
silence(mus, [(0.0, c["head"] + 0.08), (c["didnt"] - 0.07, c["sloshes"] + 0.06), (c["turning"] - 0.05, c["keeps"] - 0.06),
              (c["sloshing_end"] + 0.01, c["ears2"] + 0.08), (c["nope"] - 0.05, c["ballet"] + 0.05), (c["may"] - 0.17, c["may"] + 0.42),
              (c["down"] - 0.09, c["and_let"] + 0.08),
              (c["lap"] - 0.05, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -8.0}, duck={"music": 0.72})
