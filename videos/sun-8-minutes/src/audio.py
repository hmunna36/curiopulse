"""What If the Sun VANISHED Right Now? ☀️ Short: sound design, score and mix, cue-locked to timeline.json.

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
G = dict(window=-26, click=-8, pop=-10, popsp=-24, glug=-20, slam=-12, tick=-34, letter=-30, land=-33, stop=-22, stamp=-10,
         cut=-16, rattle=-24, travel=-18, last=-26, arrive=-30, rope=-20, whoom=-22, wind=-15, tumble=-24, beep=-19,
         chunk=-6, powerdown=-13, specs=-30, twang=-12, flyby=-14, speed=-26, sip=-20, clink=-12, sunback=-22, gull=-26,
         hmm=-14)


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


def sun_pop(seed=0):
    """the Sun popping out of existence: a round low 'bwup' (under ~300 Hz) and a fizz of sparkle on top (above 5 kHz):
    it can sit on the word 'vanished' (mono, 0.4 s)"""
    n = int(0.4 * SR)
    t = ar(n)
    body = np.sin(2 * np.pi * np.cumsum(240 * np.exp(-t / 0.05) + 55) / SR) * np.exp(-t / 0.07)
    fizz = top_only(white(n, seed), 5600) * np.exp(-t / 0.12) * (0.6 + 0.4 * np.sin(2 * np.pi * 37 * t))
    y = body + 0.35 * fizz / (np.abs(fizz).max() + 1e-9)
    return soft_clip(fade(y, 0.0005, 0.06), 2.2)


def switch_click(seed=0):
    """a wall light switch: a hard plastic click (20 ms; mono; for a gap between words)"""
    n = int(0.05 * SR)
    t = ar(n)
    y = filt(white(n, seed), "bandpass", [1800, 6500]) * np.exp(-t / 0.004)
    y += 0.6 * np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.006)
    y += 0.5 * np.sin(2 * np.pi * np.cumsum(180 + 200 * np.exp(-t / 0.004)) / SR) * np.exp(-t / 0.01)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0002, 0.01)


def waves(n, seed=0, night=False):
    """the sea on a beach (stereo): slow swells that break and wash up the sand every ~5.6 s (a whole number of them in the
    Short, so the loop holds), all of the body under ~600 Hz; the wash's hiss on top, quiet"""
    t = ar(n)
    per = DUR / max(1, round(DUR / 5.6))
    ph = (t % per) / per
    env = np.where(ph < 0.35, (ph / 0.35) ** 2, np.exp(-(ph - 0.35) / 0.22))
    lo = filt(brown(n, seed), "lowpass", 420 if night else 600) * (0.35 + 0.65 * env)
    hi = filt(white(n, seed + 1), "highpass", 4200) * (0.15 + 0.85 * env ** 2) * (0.05 if night else 0.11)
    l = lo / (np.abs(lo).max() + 1e-9) + hi
    r = np.roll(lo, int(0.013 * SR)) / (np.abs(lo).max() + 1e-9) + np.roll(hi, int(0.009 * SR))
    return np.stack([l, r]) * 0.5


def gull(seed=0, f=1650.0):
    """a seagull far off: two falling 'kyow' calls (speech band: for pauses only; mono)"""
    out = []
    for k in range(2):
        n = int(0.16 * SR)
        t = ar(n)
        fr = f * (1.15 - 0.45 * t / 0.16) * (1 + 0.02 * k)
        ph = 2 * np.pi * np.cumsum(fr) / SR
        y = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * np.sin(np.pi * t / 0.16) ** 0.7
        y += 0.15 * filt(white(n, seed + k), "bandpass", [1500, 3500]) * np.sin(np.pi * t / 0.16)
        out.append(y)
        out.append(np.zeros(int(0.07 * SR)))
    y = np.concatenate(out)
    return fade(filt(y, "lowpass", 4200) / (np.abs(y).max() + 1e-9), 0.005, 0.03)


def stamp_thump(seed=0):
    """a rubber stamp hitting paper: a low pat and a paper slap on top (mono)"""
    n = int(0.16 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(140 + 120 * np.exp(-t / 0.01)) / SR) * np.exp(-t / 0.04)
    y += 0.4 * top_only(white(n, seed), 4800) * np.exp(-t / 0.006)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0005, 0.03)


def wind_whistle(dur=0.5, seed=0):
    """an empty-desert wind: a hollow whistle sweeping through a resonance (speech band: for the pause after 'nothing.')"""
    n = int(dur * SR)
    t = ar(n)
    fc = 700 + 500 * np.sin(np.pi * t / dur)
    y = svf_bp(white(n, seed), fc, 0.12)
    y = y * np.sin(np.pi * t / dur) ** 1.4
    return fade(y / (np.abs(y).max() + 1e-9), 0.03, 0.08)


def chunk(seed=0):
    """the power going off: a heavy breaker CHUNK: a sub thump, a big mechanical clack on top (mono; 0.35 s)"""
    n = int(0.35 * SR)
    t = ar(n)
    sub = np.sin(2 * np.pi * np.cumsum(46 + 70 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.12)
    clack = top_only(white(n, seed), 4800) * np.exp(-t / 0.01)
    y = sub + 0.4 * clack / (np.abs(clack).max() + 1e-9)
    return soft_clip(fade(y, 0.0004, 0.06), 2.6)


def power_down(dur=0.42, seed=0):
    """everything winding down: a low hum that sags and dies (under ~400 Hz; mono)"""
    n = int(dur * SR)
    t = ar(n)
    f = 120 * (1 - 0.7 * (t / dur) ** 0.8)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * (1 - t / dur) ** 1.2
    return fade(filt(y, "lowpass", 420) / (np.abs(y).max() + 1e-9), 0.005, 0.05)


def rope_twang(seed=0):
    """the rope of the pull snapping: a low string twang that drops in pitch, and a crack on top (mono; it can sit on a word)"""
    n = int(0.5 * SR)
    t = ar(n)
    f = 98 * (1 - 0.35 * (1 - np.exp(-t / 0.08)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * np.exp(-t / 0.16)
    y = filt(y, "lowpass", 380)
    cr = top_only(white(n, seed), 5000) * np.exp(-t / 0.012)
    y = y / (np.abs(y).max() + 1e-9) + 0.45 * cr / (np.abs(cr).max() + 1e-9)
    return soft_clip(fade(y, 0.0004, 0.08), 2.0)


def hum_on(dur=0.5, f=110.0):
    """the rope lighting up: a soft low hum that swells in (under ~350 Hz; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / 0.12) * np.exp(-np.maximum(0, t - 0.2) / 0.25)
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.06)


def fit_n(x):
    return np.pad(x, (0, max(0, N - len(x))))[:N]


def pause_starts(t0, t1, min_gap=0.32):
    """the starts of the silences between words inside (t0, t1) that last at least min_gap"""
    out = []
    for a, b in zip(WORDS[:-1], WORDS[1:]):
        if t0 < a["end"] < t1 and b["start"] - a["end"] >= min_gap:
            out.append((a["end"] + 0.03, b["start"] - a["end"]))
    return out


# ================================================================= the beds
day_on = gate(N, [(0, SHOT["road"]), (SHOT["dark"], c["snap"]), (SHOT["button"], DUR)])
night_on = gate(N, [(c["snap"], SHOT["fly"]), (SHOT["feel"], SHOT["button"])])
space_on = gate(N, [(SHOT["road"], SHOT["dark"]), (SHOT["fly"], SHOT["feel"])])
amb.x += waves(N, 3) * day_on
amb.x += waves(N, 7, night=True) * 0.55 * night_on
# space: a low hum that breathes (under 200 Hz)
sp = filt(brown(N, 11), "lowpass", 160) * (0.7 + 0.3 * np.sin(2 * np.pi * (3 / DUR) * tt))
amb.x += pan_st(sp * 0.55, 0) * space_on
# gulls in the beach shots' longer silences (speech band: pauses only)
for k, (tp, g) in enumerate(pause_starts(0.3, SHOT["road"] - 0.2, 0.36) + pause_starts(SHOT["button"], DUR, 0.36)):
    if g >= 0.36 and tp < DUR - 0.6:
        bed.add(pan_st(gull(40 + k, 1550.0 + 160 * (k % 3)), 0.7 * (-1) ** k), tp, db(G["gull"]))

# ================================================================= the hook: the window, the switch, the POP; he sips on
bed.add(pan_st(top_swish(0.14, 1), -0.5), c["window"], db(G["window"]))                  # the window on space pops up (top)
bed.add(pan_st(low_thud(2, 130.0, 0.1), -0.5), c["window"] + 0.05, db(G["window"] + 2))
sfx.add(pan_st(switch_click(3), -0.45), c["flip"], db(G["click"]))                       # click (between "Sun" and "vanished")
sfx.add(pan_st(sun_pop(4), -0.4), c["pop"], db(G["pop"]))                                # POP (low + top: on the word)
for i in range(5):
    bed.add(pan_st(glint(5800 + 500 * i, 0.08, 5 + i), -0.4 + 0.1 * i), c["pop"] + 0.08 + 0.06 * i, db(G["popsp"]))
bed.add(pan_st(glug_low(6), 0.1), 0.05, db(G["glug"]))                                   # frame 1: a sip (low)
bed.add(pan_st(glug_low(7), 0.1), c["now_end"] + 0.05, db(G["glug"] - 2))
sfx.add(pan_st(low_thud(8, 70.0, 0.3), 0), c["timer_in"], db(G["slam"]))                 # the countdown slams in on "EIGHT" (low)
bed.add(pan_st(top_only(crack(0.03, 9, 0.006, 5200), 5200), 0), c["timer_in"] + 0.01, db(G["slam"] - 6))
# the clock ticks (top only: under every word) from the slam to 0:00
tk = c["timer_in"] + 0.5
while tk < c["count3"] - 0.1:
    bed.add(pan_st(top_only(crack(0.012, int(tk * 100), 0.002, 6000), 6000), 0.3 * (-1) ** int(tk * 2)), tk, db(G["tick"]))
    tk += 0.5

# ================================================================= the delivery: envelopes landing, the stopper, THUD
for i in range(14):
    t0 = c["letters"] + i * 0.2
    if t0 > SHOT["road"] - 0.4:
        break
    bed.add(pan_st(top_swish(0.18, 20 + i), 0.6), t0 + 0.2, db(G["letter"]))
    bed.add(pan_st(glint(6400 + 300 * (i % 4), 0.06, 40 + i), 0.2 * (-1) ** i), t0 + 0.55, db(G["land"]))
sfx.add(pan_st(whoosh(0.4, 300, 3200, 60), 0.5), c["stopper"], db(G["stop"]))           # the one that stops (a pause before "delivery")
sfx.add(pan_st(stamp_thump(61), -0.3), c["stamp"], db(G["stamp"]))                      # THUD: SENT 8 MIN AGO (low + top)
bed.add(pan_st(top_swish(0.1, 62), -0.2), c["read"], db(G["specs"]))                    # the sunglasses pushed up

# ================================================================= the road: the cut to space, the rattle, the travel, LAST, arriving
sfx.add(pan_st(whoosh(0.5, 150, 2400, 70), 0), SHOT["road"] - 0.3, db(G["cut"]))
bed.add(pan_st(low_whoosh(0.5, 71), 0), SHOT["road"] - 0.28, db(G["cut"] - 2))
bed.add(pan_st(top_only(switch_click(72), 5000), 0.4), c["click"], db(G["rattle"]))      # the switch rattles (top)
bed.add(pan_st(low_whoosh(1.4, 73), 0), c["travel"], db(G["travel"]))                    # the long travel down the road (low)
bed.add(pan_st(top_swish(1.2, 74), 0), c["travel"] + 0.1, db(G["travel"] - 10))
bed.add(pan_st(glint(7200, 0.12, 75), -0.2), c["last_tag"], db(G["last"]))              # LAST (top)
for i in range(6):
    bed.add(pan_st(glint(6000 + 350 * (i % 3), 0.07, 80 + i), 0.3 * (-1) ** i), c["land"] + 0.12 * i, db(G["arrive"]))

# ================================================================= the pull: the rope hums on; the ring; nothing... the wind
bed.add(pan_st(hum_on(0.6, 110.0), 0.2), c["rope"], db(G["rope"]))
bed.add(pan_st(low_whoosh(0.9, 90), 0), c["ring_tag"] - 0.1, db(G["whoom"]))
sfx.add(pan_st(wind_whistle(0.5, 91), -0.3), c["nothing_end"] + 0.02, db(G["wind"]))   # nothing. ... (the wind, the tumbleweed)
bed.add(pan_st(top_only(crumple(0.5, 92), 4800), -0.2), c["nothing_end"] + 0.05, db(G["tumble"]))

# ================================================================= the dark: three beeps, CHUNK on "out", the power dies
for k, tb in enumerate([c["count3"], c["count2"], c["count1"]]):
    sfx.add(pan_st(beep(1760.0 + 120 * k, 0.07), 0), tb, db(G["beep"] + k))               # in the pause between "Then..." and "lights"
sfx.add(pan_st(chunk(100), 0), c["snap"], db(G["chunk"]))                               # OUT (sub + top: on the word)
sfx.add(pan_st(power_down(0.42, 101), 0), c["out_end"] + 0.02, db(G["powerdown"]))     # ...the hum dies in the gap
bed.add(pan_st(top_swish(0.09, 102), -0.3), c["glasses_up"], db(G["specs"]))            # the sunglasses up...
bed.add(pan_st(top_swish(0.09, 103), -0.3), c["glasses_down"], db(G["specs"]))          # ...and down

# ================================================================= the fly: the rope snaps, Earth goes, 30 KM/S
sfx.add(pan_st(rope_twang(110), 0.2), c["snap_rope"], db(G["twang"]))
bed.add(pan_st(low_whoosh(1.1, 111), 0.3), c["snap_rope"] + 0.08, db(G["flyby"]))
bed.add(pan_st(top_swish(0.9, 112), 0.4), c["snap_rope"] + 0.15, db(G["flyby"] - 12))
bed.add(pan_st(glint(6900, 0.1, 113), 0.3), c["speed_tag"], db(G["speed"]))

# ================================================================= the feel: the night beach, a sip, the clink
bed.add(pan_st(glug_low(120), 0), c["sip_dark"], db(G["sip"]))
sfx.add(pan_st(glass_tink(121, 3100.0, 0.18), 0.15), c["clink"], db(G["clink"]))       # it. ... clink (in the pause)

# ================================================================= the button: the sun is back; "Probably." ... hmm
bed.add(pan_st(top_swish(0.3, 130), 0), c["sun_back"], db(G["sunback"]))
for i in range(4):
    bed.add(pan_st(glint(6200 + 400 * i, 0.08, 131 + i), 0.5), c["sun_back"] + 0.05 * i, db(G["sunback"] - 6))
sfx.add(pan_st(slide(196.0, 147.0, 0.32, vib=0.3, top=900), 0), c["probably_end"] + 0.04, db(G["hmm"]))   # Probably. ... (a doubtful low "hmm")

# ================================================================= subscribe cue: none (the no-pill arm; nobody says "subscribe")

# ================================================================= score (drops out for every punchline)
SUNNY = ["C", "Am", "F", "G"]
groove(mus, 0.05, c["eight"] - 0.06, 100, SUNNY, gain=-9, seed=10, kick_on=False, snaps=True)                 # the beach: carefree
groove(mus, c["sunshine"] + 0.1, c["sent"] - 0.06, 100, SUNNY, gain=-10, seed=12, kick_on=False, snaps=True)   # the delivery
groove(mus, SHOT["road"] + 0.05, c["arriving_end"] + 0.2, 92, ["Am", "F", "C", "G"], gain=-12, seed=20, kick_on=False, snaps=False,
       bass=False, cutoff=1300)                                                                                  # space: wonder
drone(mus, SHOT["road"] + 0.05, c["arriving_end"] + 0.2, [45, 52, 57, 64], cutoff=420, gain=-24)
groove(mus, c["even"] + 0.15, c["nothing"] - 0.06, 112, ["Dm", "Bb", "Gm", "A"], gain=-11, seed=30, kick_on=True, snaps=False,
       cutoff=1000)                                                                                              # the pull: tension
drone(mus, c["then"] + 0.1, c["snap"], [38, 45, 50, 53], cutoff=380, gain=-20, swell=0.8)                       # the last seconds
mus.add(pan_st(riser(c["count1"] + 0.2 - c["then_end"], 140, 200, 1400), 0), c["then_end"] + 0.05, db(-30))
drone(mus, c["earth2"] + 0.1, c["second_end"] + 0.25, [33, 40, 45], cutoff=360, gain=-19)                        # Earth flies off
groove(mus, c["relax_end"] + 0.05, c["probably"] - 0.06, 100, SUNNY, gain=-9, seed=10, kick_on=False, snaps=True)   # the sun is back
groove(mus, c["resip"] - 0.1, DUR, 100, SUNNY, gain=-9, seed=10, kick_on=False, snaps=True)                      # into the loop
silence(mus, [(c["eight"] - 0.06, c["sunshine"] + 0.1),        # for EIGHT minutes. (the countdown slams in)
              (c["sent"] - 0.06, SHOT["road"] + 0.05),         # sent eight minutes ago. (THUD)
              (c["nothing"] - 0.06, c["then"] + 0.1),           # nothing. (the wind)
              (c["snap"], c["earth2"] + 0.1),                   # lights OUT
              (c["second_end"] + 0.25, c["relax_end"] + 0.05),  # ...and you wouldn't even feel it. (clink)
              (c["probably"] - 0.06, c["resip"] - 0.1)])        # Probably. (hmm)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
