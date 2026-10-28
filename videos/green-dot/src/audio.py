"""Why Do You See a GREEN Dot That Isn't There? 👁️ Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

The test (0-13.5 s and the button) has a hypnotic score: a soft pad and a music box going round four notes a lap, one
lap of the dots (12 steps of 4 frames = 1.6 s) per bar, so the sound circles with the gap. The button's score runs on
the same clock counted back from the end, so the loop goes round without a seam.
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

SFX_LEVEL = -11.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(shim=-30, q=-22, dun=-22, wah=-20, squeak=-24, fade=-29, rush=-20, snore=-22, pip=-22, roll=-21, horn=-19,
         yawn=-21, stamp=-19, swish=-29, thwop=-18, thwop_top=-27, poof=-21, tick=-26, ding=-21, blink=-23, ping=-28,
         happy=-24, proj=-31, open=-24)
LAP = 1.6                       # one lap of the dots (cues lc_step x lc_n frames)


# ---------------------------------------------------------------- small sounds of this Short
def top_swish(dur=0.12, seed=0, lo=5200):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", lo) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def thud_low(seed=0, f=70.0, dur=0.3):
    """a soft knock heard through the body: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def soft_clip(y, k=3.0):
    y = y / (np.abs(y).max() + 1e-9)
    return np.tanh(k * y) / np.tanh(k)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0, f0=5600, down=False):
    for i in range(n):
        f = f0 + 700 * ((n - 1 - i) if down else i)
        bus.add(pan_st(glint(f, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


def roller_swish(seed=0, dur=0.16):
    """a paint roller passing over a dot: a soft wet 'shk', top band with a little low body (can sit under a word)"""
    y = top_swish(dur, seed, 4600)
    n = len(y)
    body = filt(brown(n, seed + 5), "lowpass", 240) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return fade((y + 0.4 * body / (np.abs(body).max() + 1e-9)) / 1.4, 0.004, 0.03)


def suction_thwop(seed=0):
    """THWOP: a rubber cup slapped onto something wet: a low pok (under 300 Hz) + a squelchy top (both can sit on a word)"""
    lo = soft_clip(thud_low(seed, 95.0, 0.24), 2.4)
    top = filt(squelch(0.2, seed + 1), "highpass", 5000)
    return lo, fade(top / (np.abs(top).max() + 1e-9), 0.002, 0.04)


def test_theme(t0, t1, gain, phase_from_end=False, seed=0):
    """the test's score: a soft A-minor pad and a music box going round four notes a lap (E5 A5 B5 C6 ...)"""
    if t1 - t0 < 0.1:
        return
    drone(mus, t0, t1, [45, 52, 59, 64], cutoff=700, gain=gain - 8, seed=seed)
    step = LAP / 4
    figure = [76, 81, 83, 84, 76, 81, 83, 79]
    k0 = int(np.floor((t0 - (DUR if phase_from_end else 0.0)) / step))
    k = k0
    while True:
        tk = (DUR if phase_from_end else 0.0) + k * step
        if tk >= t1 - 0.05:
            break
        if tk >= t0 - 1e-6 and tk > 0.2:                     # nothing on "Keep", the first word
            m = figure[k % len(figure)]
            mus.add(pan_st(music_box(mtof(m), 0.75, seed + (k % 16)), 0.35 * np.sin(k * np.pi / 2)), tk, db(gain))
        k += 1


# ================================================================= ambience (one bed per world, gated to its shots)
fog = [(0, SHOT["eye"] + 0.45), (SHOT["button"] - 0.03, DUR)]
inside = [(SHOT["eye"] + 0.3, END["eye"])]
office = [(SHOT["paint"], END["paint"])]
lab = [(SHOT["weird"], END["weird"])]
wind = filt(pink(N, 1), "lowpass", 280) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * tt))
amb.x += pan_st(wind, 0) * 0.32 * gate(N, fog)                                          # the fog: a soft wind, low
amb.x += pan_st(filt(brown(N, 3), "lowpass", 160) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.1 * tt) ** 2), 0) * 0.42 * gate(N, inside)   # inside the eye: a warm throb
amb.x += pan_st(filt(brown(N, 4), "lowpass", 200) + 0.015 * np.sin(2 * np.pi * 60 * tt), 0) * 0.30 * gate(N, office)    # the brain's office: hum
amb.x += pan_st(filt(pink(N, 5), "lowpass", 340), 0) * 0.20 * gate(N, lab)                # the lab: a quiet big room
bed.add(pan_st(fade(projector(int((END["weird"] - SHOT["weird"]) * SR), 7), 0.08, 0.1), 0), SHOT["weird"], db(G["proj"]))   # old film

# ================================================================= the hook: the test
sparkle(0.0, bed, G["shim"], seed=1, n=4, step=0.06, pan=0.2, f0=5600)                  # frame 1: a shimmer as the ring runs
sfx.add(pan_st(slide(420.0, 760.0, 0.15, harm=4), 0.2), C["round_end"] + 0.05, db(G["q"]))   # "running round?" bwip? (pause)
for i, m in enumerate((45, 44)):                                                          # "...on your screen." dun-dun (pause)
    sfx.add(pan_st(marimba(mtof(m + 12), 0.28, 20 + i, bright=0.6), 0), C["screen_end"] + 0.03 + 0.13 * i, db(G["dun"]))
sfx.add(pan_st(slide(560.0, 300.0, 0.3, vib=6.0, harm=5), -0.2), C["faking_end"] + 0.04, db(G["wah"]))   # "faking it." waah (pause)
for i in range(2):                                                                        # his lids twitch (pause after "blink...")
    sfx.add(pan_st(squeak(0.07, 2500 - 300 * i, 2100 - 300 * i), 0.3 * (-1) ** i), C["blink1_end"] + 0.04 + 0.11 * i, db(G["squeak"]))
sparkle(C["fade"] + 0.05, bed, G["fade"], seed=31, n=6, step=0.09, pan=0.0, f0=5400, down=True)   # "fade away": stars going out (top)
sfx.add(pan_st(whoosh(0.34, 300, 2600, 41, 0.85), 0), C["away_end"] + 0.02, db(G["rush"]))      # the dive into his eye (pause)

# ================================================================= inside the eye
bed.add(pan_st(thud_low(50, 130.0, 0.18), 0), SHOT["eye"] + 0.42, db(G["open"]))        # the window lands (low)
sn_t = C["pink2_end"] + 0.05
while sn_t < END["eye"] - 0.3:                                                             # the pink team snores (low)
    s = snore(0.42, int(sn_t * 10), 62.0)
    bed.add(pan_st(fade(s / (np.abs(s).max() + 1e-9), 0.02, 0.06), -0.25), sn_t, db(G["snore"]))
    sn_t += 1.25
sfx.add(pan_st(fade(slide(1500.0, 520.0, 0.14, harm=3), 0.003, 0.03), 0.25), C["off_end"] + 0.03, db(G["pip"]))   # pip: the dot goes off (pause)
dr = fade(filt(white(int(0.26 * SR), 61), "bandpass", [180, 900]) * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * ar(int(0.26 * SR)))), 0.02, 0.03)
sfx.add(pan_st(dr / (np.abs(dr).max() + 1e-9), 0), C["opposite_end"] + 0.02, db(G["horn"] - 3))   # a drumroll into GREEN (pause)
sfx.add(pan_st(party_horn(0.3, 62, 523.0), 0.2), C["green3_end"] + 0.03, db(G["horn"]))   # the green team's horn (pause after "GREEN.")

# ================================================================= the brain paints them over
y = yawn_voice(0.3, 330.0, 190.0, 70)
sfx.add(pan_st(fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05), -0.1), C["change_end"] + 0.0, db(G["yawn"]))   # the brain yawns (pause)
bed.add(pan_st(soft_clip(thud_low(71, 80.0, 0.22), 2.2), 0.1), C["change_end"] + 0.02, db(G["stamp"]))       # BORING: the stamp (low)
bed.add(pan_st(top_swish(0.09, 72), 0.1), C["change_end"] + 0.02, db(G["swish"]))
t0p, t1p = C["paints"] - 0.05, C["them_end"] + 0.35
for i in range(12):                                                                        # the roller over each dot (top + low)
    bed.add(pan_st(roller_swish(80 + i), 0.3 * np.sin(i * 0.52)), t0p + i * (t1p - t0p) / 12, db(G["roll"]))
sfx.add(pan_st(marimba(mtof(79), 0.3, 90), 0.2), C["them_end"] + 0.05, db(G["happy"]))  # done: a smug little note (pause)

# ================================================================= the suction cup (1950s)
lo, top = suction_thwop(100)
bed.add(pan_st(lo, 0.2), C["cupped"] + 0.12, db(G["thwop"]))                             # THWOP (low + top: it can sit on the word)
bed.add(pan_st(top, 0.2), C["cupped"] + 0.12, db(G["thwop_top"]))
for i in range(3):                                                                         # the cup wobbles: boing (low)
    bed.add(pan_st(thud_low(101 + i, 150.0 - 20 * i, 0.12), 0.2), C["cupped"] + 0.32 + 0.14 * i, db(G["thwop"] - 6 - 3 * i))
sfx.add(pan_st(pew(0.2, 102, 2400.0, 500.0), -0.3), C["gone_end"] + 0.03, db(G["poof"]))  # the picture's gone: pew (pause)
for i in range(3):                                                                         # the stopwatch ticks (top)
    bed.add(pan_st(key_click(110 + i), 0.4), C["in_seconds"] + 0.05 + 0.25 * i, db(G["tick"]))
sfx.add(pan_st(ding(91, 0.12, 4), 0.35), C["seconds_end"] + 0.06, db(G["ding"]))         # ding (pause after "seconds.")

# ================================================================= the button: blink, they're back, now...
bed.add(pan_st(top_swish(0.08, 120, 4800), 0), C["blink3"] + 0.02, db(G["blink"]))        # the lids slam shut (top, on "blink")
bed.add(pan_st(thud_low(121, 140.0, 0.1), 0), C["blink3"] + 0.02, db(G["blink"]))
sparkle(C["theyre"] - 0.06, bed, G["ping"], seed=122, n=4, step=0.05, pan=0.0, f0=5800)  # ping: eyes open, the ring is back (top)
for i, m in enumerate((72, 76, 79)):                                                       # a happy little arpeggio (pause after "back.")
    sfx.add(pan_st(marimba(mtof(m), 0.3, 130 + i), 0.2 * (i - 1)), C["back_end"] + 0.04 + 0.09 * i, db(G["happy"] - 2 * (i == 0)))

# ================================================================= subscribe cue: no sound
# The pill of the pill test (25 Oct-8 Nov 2026, the 23:30 slots; timeline_lib.py sets its cues) is SILENT; this Short is
# in the no-pill arm (an 11:30 slot) anyway, and nobody says "subscribe".

# ================================================================= score (drops out for every punchline)
test_theme(0.0, C["faking"] - 0.15, -27, seed=10)                                            # the test: round and round
drone(mus, C["keep2"] - 0.05, SHOT["eye"] + 0.1, [45, 57, 64], cutoff=520, gain=-36, seed=12)   # don't blink: a held high tension
tk_t, k = C["dont"], 0                                                                     # a soft clock, faster as he strains (top only)
while tk_t < C["away_end"]:
    bed.add(pan_st(fade(filt(white(int(0.015 * SR), 140 + k), "highpass", 5200) * expdecay(int(0.015 * SR), 0.003), 0.0005, 0.004), 0.4 * (-1) ** k), tk_t, db(-30))
    tk_t += 1.0 / (3 + 4 * (tk_t - C["dont"]) / max(0.1, C["away_end"] - C["dont"]))
    k += 1
groove(mus, C["sick"] + 0.1, C["opposite_end"], 112, ["Am", "F", "C", "G"], gain=-8, seed=20, kick_on=False, snaps=True)   # the seers at work
groove(mus, C["blurry"] + 0.1, C["change_end"], 84, ["Dm", "Am"], gain=-10, seed=30, kick_on=False, snaps=False, half=True)   # bored
groove(mus, C["your_brain"] + 0.1, C["them_end"] + 0.4, 124, ["C", "F", "G", "C"], gain=-8, seed=40, kick_on=True, snaps=True)   # painting
rag(mus, C["scientist"] + 0.12, C["gone"] - 0.02, bpm=118, gain=-3, seed=50)              # the 1950s: an old upright piano
test_theme(C["now_end"] + 0.02, DUR, -27, phase_from_end=True, seed=60)                        # the button runs into the hook's theme
silence(mus, [(C["screen_end"], C["eyes1"] + 0.05),            # dun-dun
              (C["faking_end"], C["keep2"] + 0.1),             # waah
              (C["away_end"], C["sick"] + 0.1),                # the dive
              (C["opposite_end"], C["green3_end"] + 0.45),     # drumroll, GREEN., the horn
              (C["change_end"], C["your_brain"] + 0.1),        # the yawn, BORING
              (C["them_end"] + 0.4, C["scientist"] + 0.12),    # the smug note
              (C["gone"] - 0.02, C["so"]),                     # "Gone... in seconds." pew, ticks, ding
              (C["so"], C["now_end"] + 0.02)])                     # blink, ping, the happy notes

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
