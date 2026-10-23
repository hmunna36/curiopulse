"""Why Can't You See Your Own EYES Move in a Mirror? 👀 Short: sound design, score and mix, cue-locked to timeline.json.

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

SFX_LEVEL = -13.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(jump=-27, hm=-20, nope=-21, window=-25, snipw=-25, dive=-24, stop=-24, smear=-13, snip=-9, snip_small=-14,
         fall=-24, land=-22, grin=-24, phone=-27, tick_late=-31, snip_ph=-26, slide=-25, there=-22, hole=-22, stamp=-20,
         sparkle=-15, pop=-26, tick=-22, snap=-27, drip=-23, snip_b=-27, sus=-21, loop=-27)


def end_of(cue):
    """the end of the word that starts at cue time C[cue]"""
    t0 = C[cue]
    w = min(WORDS, key=lambda w: abs(w["start"] - t0))
    return w["end"]


def thud_low(seed=0, f=70.0):
    """a soft landing heard through the body: all of it under ~250 Hz (it can sit on a word; mono, 0.3 s)"""
    n = int(0.3 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def snip(seed=0, edges=False, size=1.0):
    """scissors closing: the blades sliding shut (a short metallic "shhk" that swells) and the click where they meet,
    with a little ring (mono, 0.16 s). Dense, so it reads at a sane peak. edges=True keeps only what is above 5.2 kHz,
    so it can sit under a word"""
    n = int(0.16 * SR)
    t = ar(n)
    sw = np.minimum(1, t / 0.035) * np.exp(-np.maximum(0, t - 0.035) / 0.03)          # the slide: swells for 35 ms, dies away
    y = filt(white(n, seed), "bandpass", (2600, 8000)) * sw * 0.8
    i = int(0.04 * SR)
    m = n - i
    y[i:] += filt(white(m, seed + 1), "bandpass", (2000, 9000)) * expdecay(m, 0.01)     # the click where they meet
    y[i:] += 0.5 * (np.sin(2 * np.pi * 4300 * t[:m]) + 0.6 * np.sin(2 * np.pi * 6150 * t[:m])) * expdecay(m, 0.05)
    y[i:] += 0.5 * size * filt(white(m, seed + 2), "lowpass", 380) * expdecay(m, 0.025)   # a little weight
    if edges:
        y = filt(y, "highpass", 5200) * 1.8
    y = y / (np.abs(y).max() + 1e-9)
    y = np.tanh(3.2 * y) / np.tanh(3.2)        # soft-clipped: the same peak, much more body (the bus is peak-normalised)
    return fade(y, 0.001, 0.03)


def tick_clock(seed=0):
    """a wall clock's tick: a hard little click, mostly above 3 kHz, with a wooden knock under 300 Hz (mono, 0.05 s)"""
    n = int(0.05 * SR)
    y = filt(white(n, seed), "bandpass", (3000, 9000)) * expdecay(n, 0.0035)
    y += 0.45 * np.sin(2 * np.pi * 180 * ar(n)) * expdecay(n, 0.012)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0004, 0.01)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0):
    for i in range(n):
        bus.add(pan_st(glint(5600 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


# ================================================================= the test, the answer (the mirror)
# every jump of his eyes in the mirror: a tiny dry tick above 5 kHz (it sits on words); no swish: they don't travel
JUMPS = [C["left"], C["right"], C["see"] + 0.06, C["move"] - 0.03, C["nope"] - 0.04, C["every"] - 0.02, C["jump"] - 0.02, C["like"] - 0.03]
for k, tj in enumerate(JUMPS):
    bed.add(pan_st(glint(7200 - 300 * (k % 3), 0.05, 200 + k), 0.35 * (-1) ** k), tj, db(G["jump"]))
sfx.add(pan_st(slide(300, 420, 0.22, vib=0.0), 0), end_of("move") + 0.08, db(G["hm"]))           # move? ... hm? (a squint)
sfx.add(pan_st(slide(330, 230, 0.24, vib=0.0), 0), end_of("nope") + 0.06, db(G["nope"]))         # Nope. ... nuh-uh (a head shake)
bed.add(pan_st(top_swish(0.22, 11), 0), C["your2"] - 0.04, db(G["window"]))                      # the window opens on his forehead
bed.add(pan_st(glint(6400, 0.1, 12), 0), C["your2"] + 0.14, db(G["window"] - 2))
for k, tj in enumerate([C["cuts"], C["every"] - 0.02, C["jump"] - 0.02]):                         # in the window: a snip at every jump
    bed.add(pan_st(snip(20 + k, edges=True), 0.1), tj + 0.02, db(G["snipw"]))
bed.add(pan_st(top_swish(0.34, 13), 0), C["sneaky"] - 0.05, db(G["dive"]))                       # ...and we dive through it

# ================================================================= the editing room: the film runs, stops, blur, SNIP
proj = projector(N, seed=30, fps=18)
edit_on = gate(N, [(C["your2"], END["edit"]), (SHOT["patch"], END["patch"])])
run_on = gate(N, [(C["your2"], C["mid"] + 0.05)])
amb.x += pan_st(filt(proj, "lowpass", 380), 0) * 0.30 * edit_on                                   # the projector's motor, low
bed.x += pan_st(filt(proj, "highpass", 5200), 0) * 0.05 * run_on                                  # the film's clatter while it runs (top only)
bed.add(pan_st(ratchet(0.32, 26.0, 6.0, 31, edges=True), 0), C["mid"] - 0.12, db(G["stop"]))     # Mid-jump: the film winds to a stop
sfx.add(pan_st(slide(520, 380, 0.3, vib=7.0, top=None), 0), end_of("smear") + 0.02, db(G["smear"]))   # smear... a wobbly woo
sfx.add(pan_st(snip(40, size=0.8), -0.35), C["so1_end"] + 0.02, db(G["snip_small"]))            # so, ... snip (the left cut)
sfx.add(pan_st(snip(41, size=1.2), 0.3), C["snip_end"] + 0.05, db(G["snip"]))                   # SNIP. ... SNIP (the right cut: clear of the word's tail, so the duck has let go)
sfx.add(pan_st(snip(44, size=0.7), 0.3), C["snip_end"] + 0.13, db(G["snip"] - 6))               # ...and the blades' little second bite
sfx.add(pan_st(whoosh(0.3, 1800, 500, 42, 0.6), 0), C["snip_end"] + 0.08, db(G["fall"]))        # the smeared frames drop
bed.add(pan_st(top_swish(0.22, 43), 0), SHOT["selfie"] - 0.16, db(G["dive"]))                    # out to the phone (top only)

# ================================================================= the selfie camera: late, so the jump shows
bed.add(pan_st(glint(5800, 0.08, 50), 0.2), SHOT["selfie"] + 0.05, db(G["phone"]))               # the camera app opens
for k, t0 in enumerate(np.arange(C["late"] + 0.02, END["selfie"] - 0.1, 0.25)):                   # the stopwatch, ticking (top only)
    bed.add(pan_st(filt(tick_clock(60 + k), "highpass", 5200), 0.45), t0, db(G["tick_late"]))
bed.add(pan_st(snip(61, edges=True), -0.3), C["so2"] + 0.02, db(G["snip_ph"]))                   # his brain's snip, first (under "so")
for k in range(5):                                                                                # ...then the late picture slides across
    bed.add(pan_st(glint(5400 + 450 * k, 0.06, 70 + k), -0.4 + 0.2 * k), C["jump2"] + 0.07 * k, db(G["slide"]))
sfx.add(pan_st(ding(88, 0.13, 75, bright=1.3), 0.2), C["snip2_end"] + 0.04, db(G["there"]))     # snip. ... ting! THERE

# ================================================================= the patch: the next picture stretched back over the hole
bed.add(pan_st(top_swish(0.22, 80), 0), SHOT["patch"] - 0.14, db(G["dive"]))
bed.add(pan_st(thud_low(81, 66.0), 0), SHOT["patch"] + 0.12, db(G["hole"]))                      # the hole (low)
for k, t0 in enumerate([C["patches"] + 0.18, C["patches"] + 0.42]):                              # the copies land: stamp, stamp
    bed.add(pan_st(thud_low(82 + k, 92.0 + 10 * k), 0), t0, db(G["stamp"]))
    bed.add(pan_st(glint(6100 + 500 * k, 0.08, 84 + k), 0.2 * k), t0 + 0.02, db(G["sparkle"]))
sfx.add(pan_st(ding(91, 0.12, 86, bright=1.3), -0.2), C["hole_end"] + 0.04, db(G["sparkle"]))   # hole. ... ting: the patch holds
sparkle(C["hole_end"] + 0.06, bed, G["sparkle"] - 4, seed=87, n=3)

# ================================================================= the clock: snap your eyes to it; the ticks, alone
bed.add(pan_st(glint(5600, 0.07, 90), 0.4), C["clock_on"], db(G["pop"]))                          # the clock pops up (top only)
bed.add(pan_st(top_swish(0.08, 91), 0.3), C["clock_on"] + 0.1, db(G["snap"]))                    # his eyes snap to it
for k, f in enumerate([C["tick1"], C["tick2"], C["tick3"]]):                                      # the ticks: the viewer's own test
    sfx.add(pan_st(tick_clock(92 + k), 0.4), f, db(G["tick"]))
sfx.add(pan_st(squeak(0.1, 1700, 1300), 0.2), end_of("right2") + 0.08, db(G["drip"]))            # right? ... a nervous squeak (the sweat drop)

# ================================================================= the button: three times a second; not convinced?
bed.add(pan_st(top_swish(0.2, 100), 0), SHOT["button"] - 0.14, db(G["dive"]))
bed.add(pan_st(glint(6400, 0.1, 101), 0), SHOT["button"] + 0.05, db(G["window"] - 2))            # the window again
JB = [C["it"] + 0.12 + k / 3 for k in range(8) if C["it"] + 0.12 + k / 3 <= C["second_end"] + 0.05]
for k, tj in enumerate(JB):                                                                       # a snip with every jump
    bed.add(pan_st(snip(110 + k, edges=True), 0.4 * (-1) ** k), tj + 0.02, db(G["snip_b"]))
sfx.add(pan_st(slide(220, 262, 0.26, vib=0.0), 0), end_of("convinced") + 0.06, db(G["sus"]))     # convinced? ... hmm? (the squint)
bed.add(pan_st(top_swish(0.18, 120), 0), DUR - 0.42, db(G["loop"]))                              # he leans back in: into the loop

# ================================================================= ambience (one bed per world, gated to its shots)
bath_on = gate(N, [(0, SHOT["edit"] + 0.05), (SHOT["selfie"] - 0.05, SHOT["patch"] + 0.05), (SHOT["clock"] - 0.05, DUR)])
amb.x += pan_st(filt(brown(N, 1), "lowpass", 230), 0) * 0.32 * bath_on                          # the bathroom: room tone
amb.x += pan_st(filt(proj, "lowpass", 380), 0) * 0.22 * gate(N, [(SHOT["button"], C["not"])])  # the projector in the button's window

# ================================================================= score (drops out for every punchline and for the clock)
BPM = 112
groove(mus, 0.24, C["move_end"] + 0.05, BPM, ["F", "Dm"], gain=-9, seed=10, kick_on=False, snaps=True)   # after "Look"
groove(mus, C["brain"] + 0.05, C["mid"], BPM, ["Bb", "C"], gain=-10, seed=11, kick_on=False, snaps=True)
groove(mus, C["mid"] + 0.3, C["so1"], BPM, ["Dm", "Bb", "C", "A"], gain=-9, seed=20, snaps=True)   # the blur: a sneaky drive
groove(mus, C["camera"] + 0.05, C["snip2"] - 0.05, BPM, ["F", "C", "Dm", "Bb"], gain=-9, seed=30, kick_on=False, snaps=True)
drone(mus, SHOT["patch"] + 0.05, C["hole_end"], [41, 48, 53, 57], cutoff=560, gain=-18)          # the patch: a held, curious chord
groove(mus, C["does"] if "does" in C else C["it"] + 0.3, DUR, BPM, ["F", "Dm"], gain=-9, seed=10, kick_on=False, snaps=True)   # the hook's groove again: into the loop
silence(mus, [(C["move_end"] + 0.05, C["brain"] + 0.05),     # See them move? ... Nope.
              (C["so1"] - 0.02, C["camera"] + 0.05),        # so, SNIP. (and the frames dropping)
              (C["snip2"] - 0.05, SHOT["patch"] + 0.05),    # ...after the snip. ting
              (C["hole_end"], C["it"] + 0.3)])              # the clock: the ticks alone

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
