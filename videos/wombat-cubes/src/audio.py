"""Why Do Wombats Poop CUBES? 🟫 Short: sound design, score and mix, cue-locked to timeline.json.

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
c = C

SFX_LEVEL = -11.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(freeze=-30, rise=-24, thunk=-9, stamp=-14, scribble=-30, glare=-30, xray=-22, dive=-16, squelch=-15,
         stretch=-26, ding=-17, plop=-16, fwip=-24, note=-16, pat=-22, rollr=-24, bonk=-13, splash=-11, cricket=-15,
         clank=-8, chop=-9, hiss=-28, hat=-18, plops=-25, count=-33, ding100=-18, crunch=-4, swish=-27, pick=-24,
         tweet=-27, glint=-31, wobble=-26, blat=-15)


# ================================================================= this Short's atoms
def low_thud(seed=0, f=80.0, dur=0.28):
    """a soft hit heard low: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.08)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def low_whoosh(dur=0.6, seed=0):
    """a big move, all of it under ~380 Hz (it can run under a word; mono)"""
    n = int(dur * SR)
    env = np.sin(np.pi * ar(n) / dur) ** 1.2
    y = filt(brown(n, seed), "lowpass", 380) * env
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def soft_clip(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


def top_only(y, f=5200):
    return filt(y, "highpass", f)


def cube_thunk(seed=0):
    """a small dense block landing flat on wood and STAYING: a dry knock, a low body, no roll, no bounce (mono; for a pause)"""
    n = int(0.22 * SR)
    t = ar(n)
    body = np.sin(2 * np.pi * np.cumsum(120 + 90 * np.exp(-t / 0.012)) / SR) * np.exp(-t / 0.045)
    knock = filt(white(n, seed), "bandpass", [700, 2600]) * np.exp(-t / 0.008)
    wood = sum(np.sin(2 * np.pi * f * t) * a * np.exp(-t / d) for f, a, d in [(410, 0.5, 0.05), (690, 0.3, 0.035), (1130, 0.15, 0.02)])
    y = body + 0.7 * knock / (np.abs(knock).max() + 1e-9) + 0.6 * wood
    return soft_clip(fade(y, 0.0004, 0.03), 2.6)


def squelch_low(dur=0.32, seed=0):
    """a gut squeezing: a wet, rubbery squelch kept under ~300 Hz with a wet tick on top (it can sit under a word)"""
    n = int(dur * SR)
    t = ar(n)
    f = 70 + 80 * np.sin(np.pi * t / dur) ** 2
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 1.5
    y += 0.6 * filt(brown(n, seed), "lowpass", 260) * np.sin(np.pi * t / dur)
    y = y / (np.abs(y).max() + 1e-9)
    tick = top_only(white(n, seed + 1), 5400) * np.exp(-np.maximum(0, t - dur * 0.55) / 0.01) * (t > dur * 0.55)
    y += 0.25 * tick / (np.abs(tick).max() + 1e-9)
    return fade(y, 0.01, 0.05)


def stamp_thump(seed=0):
    """a rubber stamp hitting paper: a low pat and a paper slap on top (mono)"""
    n = int(0.16 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(140 + 120 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.04)
    y += 0.4 * top_only(white(n, seed), 4800) * np.exp(-t / 0.006)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0005, 0.03)


def paper_fwip(seed=0, dur=0.14):
    """a little note popping out: a paper flick, all above 4.5 kHz (mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = top_only(white(n, seed), 4500) * (t / dur) ** 0.5 * np.exp(-t / (dur * 0.5))
    return fade(y / (np.abs(y).max() + 1e-9), 0.002, 0.02)


def roll_rumble(dur=0.7, seed=0):
    """a soft ball rolling on stone: a grainy low rumble that speeds up (under ~300 Hz, a few top grains; mono)"""
    n = int(dur * SR)
    t = ar(n)
    rate = 8 + 26 * (t / dur)
    grain = (np.sin(2 * np.pi * np.cumsum(rate) / SR) > 0.6).astype(float)
    y = filt(brown(n, seed), "lowpass", 280) * (0.6 + 0.4 * grain) * np.minimum(1, t / 0.08)
    y += 0.15 * top_only(white(n, seed + 1), 5600) * grain
    return fade(y / (np.abs(y).max() + 1e-9), 0.02, 0.05)


def clank(seed=0):
    """a press stamping a cube: a heavy low slam, a short steel ring, a hiss (mono; for a pause, 0.22 s)"""
    n = int(0.22 * SR)
    t = ar(n)
    slam = np.sin(2 * np.pi * np.cumsum(55 + 140 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.06)
    ring_ = sum(np.sin(2 * np.pi * f * t) * a * np.exp(-t / d) for f, a, d in [(880, 0.5, 0.06), (1347, 0.35, 0.05), (2173, 0.25, 0.04), (3460, 0.15, 0.03)])
    hit = filt(white(n, seed), "bandpass", [400, 4000]) * np.exp(-t / 0.006)
    y = slam + 0.6 * ring_ + 0.5 * hit / (np.abs(hit).max() + 1e-9)
    return soft_clip(fade(y, 0.0003, 0.04), 2.4)


def chop(seed=0):
    """a blade coming down: a short swish into a thick crack and a thump (mono; for a pause, 0.18 s)"""
    n = int(0.18 * SR)
    t = ar(n)
    sw = filt(white(n, seed), "bandpass", [2500, 8000]) * np.exp(-((t - 0.03) / 0.018) ** 2)
    cr = filt(white(n, seed + 1), "bandpass", [600, 3000]) * np.exp(-np.maximum(0, t - 0.05) / 0.01) * (t > 0.05)
    th = np.sin(2 * np.pi * np.cumsum(90 + 80 * np.exp(-np.maximum(0, t - 0.05) / 0.01)) / SR) * np.exp(-np.maximum(0, t - 0.05) / 0.04) * (t > 0.05)
    y = 0.5 * sw / (np.abs(sw).max() + 1e-9) + cr / (np.abs(cr).max() + 1e-9) + 0.8 * th
    return soft_clip(fade(y, 0.002, 0.03), 2.2)


def lettuce_crunch(seed=0, dur=0.3):
    """a big bite of lettuce: a wet crisp crunch, two or three cracks in a row (mono; for a pause)"""
    n = int(dur * SR)
    y = np.zeros(n)
    for k, (t0, a) in enumerate([(0.0, 1.0), (0.05, 0.7), (0.11, 0.5), (0.17, 0.3)]):
        cr = crack(0.08, seed + k, 0.012, 1500)
        i = int(t0 * SR)
        y[i:i + len(cr)] += a * cr[: n - i] / (np.abs(cr).max() + 1e-9)
    y += 0.3 * filt(crumple(dur, seed + 9), "bandpass", [1800, 7000]) / 1.0
    return soft_clip(fade(y, 0.001, 0.05), 2.0)


def blat(m=34, dur=0.45):
    """a comedic low brass blat that sags (sfxkit's bwomp as a signal, for the sfx bus: the score is silent here; mono)"""
    n = int(dur * SR)
    f = mtof(m) * (1 - 0.08 * np.minimum(1, ar(n) / (dur * 0.8)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) / k for k in range(1, 16))
    return fade(filt(np.tanh(1.5 * y), "lowpass", 900) * attack_decay(n, 0.02, dur * 0.5), 0.005, 0.08)


def dough_pat(seed=0):
    """a dough ball set down: a soft low pat (all under ~250 Hz; mono)"""
    return low_thud(seed, 140.0, 0.12)


def fit_n(x):
    return np.pad(x, (0, max(0, N - len(x))))[:N]


def pause_starts(t0, t1, min_gap=0.32):
    """the starts of the silences between words inside (t0, t1) that last at least min_gap (for tweets)"""
    out = []
    for a, b in zip(WORDS[:-1], WORDS[1:]):
        if t0 < a["end"] < t1 and b["start"] - a["end"] >= min_gap:
            out.append((a["end"] + 0.03, b["start"] - a["end"]))
    return out


# ================================================================= the beds
bush_on = gate(N, [(0, SHOT["gut"] + 0.15), (SHOT["notes"], SHOT["factory"]), (SHOT["button"], DUR)])
gut_on = gate(N, [(SHOT["gut"], SHOT["notes"])])
fact_on = gate(N, [(SHOT["factory"], SHOT["button"])])
# the bush at golden hour: a breeze under 260 Hz that breathes (it loops with the Short), crickets far off (top)
amb.x += pan_st(filt(brown(N, 1), "lowpass", 260) * 0.38 * (0.8 + 0.2 * np.sin(2 * np.pi * (2 / DUR) * tt)), 0) * bush_on
crickets(0.3, DUR - 0.2, bed, db(-34), seed=3, f=5200, rate=0.7)
# inside the gut: a slow wet rumble (under 200 Hz) that swells with each squeeze
gr = filt(brown(N, 5), "lowpass", 190) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.9 * tt))
amb.x += pan_st(gr * 0.8, 0) * gut_on
# the factory: a machine hum (60/120/180 Hz) and the belt's rattle on top
hum = sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(60.0, 0.5), (120.0, 0.28), (180.0, 0.14)])
amb.x += pan_st(hum * 0.32, 0) * fact_on
bed.add(pan_st(top_only(crackle(int((END["belt"] - SHOT["factory"]) * SR), 45, 120, 5400, 9000), 5400), 0.2), SHOT["factory"], db(-31))

# birds of the bush: a tweet in the longer silences of the bush shots only (they sit in the speech band)
for k, (tp, g) in enumerate(pause_starts(SHOT["notes"], SHOT["factory"] - 0.2, 0.34) + pause_starts(SHOT["answer"], SHOT["gut"] - 0.2, 0.34)):
    if g >= 0.34:
        bed.add(pan_st(tweet(40 + k, 3600.0 + 300 * (k % 3)), 0.6 * (-1) ** k), tp, db(G["tweet"]))

# ================================================================= the hook: the freeze, the wombat rising, POOP, the cube lands flat
bed.add(pan_st(top_swish(0.08, 2), 0.1), c["freeze"], db(G["freeze"]))                 # the freeze (top)
bed.add(pan_st(low_whoosh(0.5, 3), 0.4), c["rise"], db(G["rise"]))                      # the wombat comes up behind the log (low)
bed.add(pan_st(top_swish(0.18, 4), 0.4), c["rise"] + 0.1, db(G["rise"] - 4))
sfx.add(pan_st(cube_thunk(6), -0.15), c["thunk"], db(G["thunk"]))                      # POOP. ... thunk (flat, it stays)
# (no blat on his face: the score stops on "POOP." and the thunk of the cube landing flat is the beat)

# ================================================================= the answer: ROUND, the glare, the lens goes x-ray, the dive
bed.add(pan_st(top_only(scribble(0.26), 5000), 0.2), c["ring"] - 0.02, db(G["scribble"]))    # the dotted circle drawn (top)
sfx.add(pan_st(stamp_thump(8), 0.15), c["ring"] + 0.2, db(G["stamp"]))                  # ROUND (stamp)
bed.add(pan_st(low_thud(9, 160.0, 0.1), -0.3), c["glare"], db(G["glare"]))              # the wombat's head turns (low)
bed.add(pan_st(low_whoosh(0.35, 10), 0.1), c["lens_move"], db(G["xray"] + 4))           # the lens slides to the belly (low)
bed.add(pan_st(top_only(riser(0.35, 11, 2000, 9000), 5000), 0.1), c["xray"] - 0.05, db(G["xray"]))   # x-ray on (top)
sfx.add(pan_st(whoosh(0.55, 150, 2600, 12), 0), SHOT["gut"] - 0.32, db(G["dive"]))      # the dive into the lens
bed.add(pan_st(low_whoosh(0.6, 13), 0), SHOT["gut"] - 0.3, db(G["dive"] + 2))

# ================================================================= the gut: each squeeze, a squelch; the corners pinch; ding
for k, sq in enumerate(c["squeezes"]):
    bed.add(pan_st(squelch_low(0.34, 20 + k), 0.15 * (-1) ** k), sq - 0.04, db(G["squelch"] + 1.5 * k))
    bed.add(pan_st(filt(creak(0.3, 30 + k, 60, 140), "lowpass", 300), 0), sq, db(G["stretch"]))
for i in range(4):                                                                       # four corners, four glints (top)
    bed.add(pan_st(glint(6100 + 420 * i, 0.07, 40 + i), 0.5 * (-1) ** i), c["pinch"] + 0.06 + 0.07 * i, db(G["glint"]))
sfx.add(pan_st(ding(84, 0.12, 44, bright=1.1), 0.2), c["corners2_end"] + 0.02, db(G["ding"]))   # corners. ... ding

# ================================================================= the notes: a cube on the rock, the note pops out
bed.add(pan_st(low_thud(50, 120.0, 0.16), -0.2), c["plop1"], db(G["plop"]))              # the cube set down (low)
bed.add(pan_st(top_only(crack(0.03, 51, 0.006, 5200), 5200), -0.2), c["plop1"] + 0.01, db(G["plop"] - 10))
bed.add(pan_st(paper_fwip(52), 0.2), c["note"] - 0.03, db(G["fwip"]))                    # the note pops out (top)
sfx.add(pan_st(lamp_pip(1980.0, 0.08, 53), 0.2), c["notes1_end"] + 0.03, db(G["note"]))   # notes. ... pip

# ================================================================= the roll: pat, the roll, over the edge, bonk, plop; one cricket
bed.add(pan_st(dough_pat(60), 0.1), c["place"], db(G["pat"]))
bed.add(pan_st(roll_rumble(c["edge"] - c["go"] + 0.05, 61), 0.2), c["go"], db(G["rollr"]))
sfx.add(pan_st(bonk(), 0.35), c["bonk1"], db(G["bonk"]))                                  # notes... bonk
sfx.add(pan_st(splash(0.26, 62, 0.5), 0.45), c["splash"], db(G["splash"]))                # ...plop into the creek
sfx.add(pan_st(bloop(240, 90, 0.2), 0.45), c["splash"] + 0.02, db(G["splash"] - 6))
sfx.add(pan_st(cricket(63, 2, 4500), -0.3), c["off_end"] + 0.06, db(G["cricket"]))      # would roll off. ... (one cricket)

# ================================================================= the factory: CLANK on molds, CHOP on knives, the belt
sfx.add(pan_st(clank(70), -0.2), c["press"], db(G["clank"]))                      # molds. CLANK (in the pause)
bed.add(pan_st(top_only(white(int(0.3 * SR), 71), 6000) * np.exp(-ar(int(0.3 * SR)) / 0.08), -0.2), c["press"] + 0.08, db(G["hiss"]))
sfx.add(pan_st(chop(72), 0.25), c["chop"], db(G["chop"]))                          # knives. CHOP
bed.add(pan_st(top_only(ratchet(0.6, 14.0, 14.0, 73, edges=True), 5200), 0.3), c["cubes3"], db(G["hiss"] + 2))   # the belt moves on (top)
sfx.add(pan_st(ding(79, 0.1, 74, bright=0.9), 0.0), c["hat"] + 0.02, db(G["hat"]))       # the wombat on the belt: ding
for k, tp in enumerate(c["plops"]):                                                       # a cube a beat: out (a top flick), onto the pile (a low pat + a tick)
    bed.add(pan_st(top_swish(0.07, 200 + k), -0.2), tp, db(G["plops"] - 6))
    bed.add(pan_st(low_thud(80 + k, 130.0, 0.09), -0.35), tp + 0.22, db(G["plops"]))
    bed.add(pan_st(top_only(crack(0.02, 120 + k, 0.004, 5400), 5400), -0.35), tp + 0.22, db(G["plops"] - 8))
    bed.add(pan_st(top_only(crack(0.015, 160 + k, 0.003, 6000), 6000), 0.1), tp + 0.05, db(G["count"]))   # the counter ticks
sfx.add(pan_st(ding(86, 0.12, 90, bright=1.3), 0), c["count100"] + 0.02, db(G["ding100"]))   # 100 (in the pause)
sfx.add(pan_st(lettuce_crunch(91), 0.1), c["crunch"], db(G["crunch"]))                    # salad. CRUNCH

# ================================================================= the button: a shifty look left, right; he picks it up; into the loop
bed.add(pan_st(top_swish(0.12, 95), -0.4), c["look_l"], db(G["swish"]))
bed.add(pan_st(top_swish(0.12, 96), 0.4), c["look_r"], db(G["swish"]))
bed.add(pan_st(top_only(crack(0.02, 97, 0.004, 5000), 5000), 0), c["pick"] + 0.12, db(G["pick"]))
bed.add(pan_st(low_thud(98, 160.0, 0.08), 0), c["pick"] + 0.12, db(G["pick"]))

# ================================================================= subscribe cue: no sound
# The pill of the pill test (25 Oct-8 Nov 2026, the 23:30 slots; timeline_lib.py sets its cues) is SILENT: no pop, no
# click, no bell, and nobody says "subscribe". Both arms sound the same.

# ================================================================= score (drops out for every punchline)
BPM = 112
TIPTOE = ["F", "Bb", "C", "F"]
groove(mus, 0.05, c["poop"] - 0.05, BPM, TIPTOE, gain=-9, seed=10, kick_on=False, snaps=True)            # golden hour: curious tiptoe
groove(mus, c["no"] + 0.18, c["corners1_end"] + 0.05, 104, ["Dm", "Bb", "Dm", "C"], gain=-11, seed=20, kick_on=False, snaps=True, cutoff=1000)   # the rump, sneaky
drone(mus, SHOT["gut"] + 0.1, c["pinch"] - 0.05, [38, 45, 50, 53], cutoff=360, gain=-23)                  # inside: wonder (kept under the speech band)
groove(mus, c["cubes1_end"] + 0.12, c["notes2"] - 0.08, 108, ["F", "C", "Dm", "Bb"], gain=-10, seed=30, kick_on=False, snaps=True, cutoff=1200)   # the rock
groove(mus, c["need"], c["cubes3_end"] + 0.1, 120, ["Dm", "Bb", "F", "C"], gain=-10, seed=40, kick_on=True, snaps=False, sixteen=True, cutoff=900)   # the factory
groove(mus, c["up"] + 0.12, c["day_end"] + 0.05, 128, ["F", "C", "F", "C"], gain=-10, seed=50, kick_on=True, snaps=True, cutoff=1200)   # the belt: a jaunty march
groove(mus, c["so_end"] + 0.05, DUR, BPM, TIPTOE, gain=-9, seed=10, kick_on=False, snaps=True)            # back to the tiptoe: the loop
silence(mus, [(c["poop"] - 0.05, c["no"] + 0.18),                 # It's wombat POOP. (the hold, the drop, thunk)
              (c["square_end"] - 0.02, c["ring"] + 0.45),          # isn't square. (ROUND)
              (c["corners2"] - 0.1, c["corners2_end"] + 0.2),      # pinch corners. (ding)
              (c["notes2"] - 0.08, c["off_end"] + 0.4),            # round notes... bonk, plop... would roll off. (cricket)
              (c["wombats2"] - 0.1, c["up"] + 0.12),               # Wombats? (ding)
              (c["day_end"] + 0.05, c["so_end"] + 0.05)])          # 100 ... from salad. CRUNCH ... So...

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
