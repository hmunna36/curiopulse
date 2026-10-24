"""Why Does This Lake Turn Animals to STONE? 🦩 Short: sound design, score and mix, cue-locked to timeline.json.

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
G = dict(tick=-27, knock=-17, yank=-20, wipe=-27, ew=-18, fizz=-30, splash=-24, hiss=-20, hiss_top=-27, swish=-25, plip=-19,
         drops=-29, crystals=-27, ding=-19, poof=-21, thumb=-20, wade=-27, honk=-25, gurgle=-22, heart=-27, crane=-26,
         flutter=-30, peep=-19, pop=-28, step=-28, sizzle=-24, yelp=-20, wing=-29, nope=-21, creak=-34)


def end_of(cue):
    """the end of the word that starts at cue time C[cue]"""
    t0 = C[cue]
    w = min(WORDS, key=lambda w: abs(w["start"] - t0))
    return w["end"]


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def stone_knock(seed=0):
    """a knuckle on a stone statue: a hard click with a short hollow body (mono, 0.14 s; speech band: for a pause)"""
    n = int(0.14 * SR)
    t = ar(n)
    body = np.sin(2 * np.pi * 430 * t) * np.exp(-t / 0.025) + 0.6 * np.sin(2 * np.pi * 980 * t) * np.exp(-t / 0.012)
    click = filt(white(n, seed), "bandpass", (1800, 5200)) * np.exp(-t / 0.004)
    y = 0.7 * body + click
    y = y / (np.abs(y).max() + 1e-9)
    y = np.tanh(3.2 * y) / np.tanh(3.2)     # soft-clipped: the same peak, much more body (the sfx bus is peak-normalised)
    return fade(y, 0.0005, 0.03)


def steam_hiss(dur=0.8, seed=0, edges=False, swell=0.1):
    """steam off hot brine: a hiss that swells and dies. edges=True keeps only what is above 5.2 kHz (under a word)"""
    n = int(dur * SR)
    t = ar(n)
    y = filt(white(n, seed), "highpass", 2400 if not edges else 5200)
    y *= np.minimum(1, t / max(0.01, swell)) * np.exp(-np.maximum(0, t - swell) / (dur * 0.45))
    y *= 1 + 0.25 * np.sin(2 * np.pi * 31 * t)
    return fade(y / (np.abs(y).max() + 1e-9), 0.005, 0.08)


def fizz(dur, seed=0, rate=40.0):
    """a soda fizz: tiny pops above 4 kHz, random (can run under words)"""
    n = int(dur * SR)
    y = np.zeros(n)
    rng = np.random.default_rng(seed)
    for _ in range(int(dur * rate)):
        i = int(rng.uniform(0, n - 400))
        k = int(rng.uniform(60, 300))
        y[i:i + k] += rng.uniform(0.3, 1.0) * filt(white(k, int(rng.integers(1e6))), "highpass", 4200) * np.exp(-np.arange(k) / (k * 0.25))
    return fade(y / (np.abs(y).max() + 1e-9), 0.05, 0.1)


def low_thud(seed=0, f=80.0, dur=0.28):
    """a soft landing heard low: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.08)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0, f0=5600):
    for i in range(n):
        bus.add(pan_st(glint(f0 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


def crystals(t0, t1, bus, gain, seed=0):
    """crystals growing: a rising run of glass glints above 5 kHz, faster and higher as it goes (under words)"""
    k = 0
    t = t0
    while t < t1:
        u = (t - t0) / max(0.01, t1 - t0)
        bus.add(pan_st(glint(5400 + 2600 * u + 300 * (k % 3), 0.07, seed + k), 0.5 * np.sin(k * 1.7)), t, db(gain + 3 * u))
        t += 0.11 - 0.06 * u
        k += 1


def wing_flutter(dur, seed=0, rate=7.0):
    """wingbeats: soft low whumps, rate a second (bed; under 300 Hz)"""
    n = int(dur * SR)
    y = np.zeros(n)
    for i in range(int(dur * rate)):
        t0 = int(i / rate * SR)
        m = min(int(0.09 * SR), n - t0)
        if m <= 0:
            break
        y[t0:t0 + m] += filt(brown(m, seed + i), "lowpass", 300) * np.sin(np.pi * np.linspace(0, 1, m))
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def hijaz(t0, t1, bpm, gain, seed=0):
    """an 'Egyptian' line: D phrygian dominant (D Eb F# G A Bb C) in eighths on pizzicato, a frame drum under it"""
    scale = [62, 63, 66, 67, 69, 70, 72, 74]
    line_ = [0, 1, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 2, 1, 0, -1]
    e = 60.0 / bpm / 2
    k = 0
    t = t0
    while t < t1:
        i = line_[k % len(line_)]
        m = scale[i] if i >= 0 else 61
        mus.add(pizz(mtof(m), 0.32, seed + k), t, db(-15 + gain), pan=0.3 * (-1) ** k)
        if k % 2 == 0:
            mus.add(marimba(mtof(m + 12), 0.35, seed + k), t, db(-22 + gain))
        if k % 4 == 0:
            mus.add(kick(0.7), t, db(-17 + gain))                       # the frame drum: doum ...
        if k % 4 == 3 or k % 8 == 6:
            mus.add(snap(seed + k), t, db(-19 + gain), pan=-0.2)        # ... tek
        t += e
        k += 1
    mus.add(pad([mtof(50), mtof(57), mtof(62)], t1 - t0 + 0.1, 0.2, 900, seed), t0, db(-27 + gain))


def sneak(t0, t1, bpm, gain, seed=0):
    """a tiptoe: staccato low pizzicato steps under 320 Hz with a tick above 5 kHz on each (a sneaking predator)"""
    notes = [38, 41, 43, 41, 38, 45, 43, 41]
    e = 60.0 / bpm / 2
    k = 0
    t = t0
    while t < t1:
        y = filt(pizz(mtof(notes[k % len(notes)]), 0.22, seed + k), "lowpass", 320)
        mus.add(y, t, db(-12 + gain))
        mus.add(filt(glint(6400, 0.03, seed + k), "highpass", 5200), t, db(-26 + gain))
        t += 2 * e if k % 2 else e
        k += 1


# ================================================================= the lake (ambience under every lake shot)
lake_on = gate(N, [(0, SHOT["why"] + 0.05), (SHOT["why"] - 0.05, DUR)])
wind = filt(brown(N, 3), "lowpass", 260) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * tt))
lap = filt(brown(N, 4), "bandpass", (120, 420)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.42 * tt) ** 2)
amb.x += pan_st(wind * 0.5 + lap * 0.35, 0) * lake_on
# the colony far away: honks, low-passed, only where nobody speaks (pause_mask)
mask = pause_mask(WORDS, N)
rng = np.random.default_rng(12)
colony = np.zeros(N)
for _ in range(int(DUR * 5)):
    t0 = rng.uniform(0, DUR - 0.4)
    h = filt(honk(rng.uniform(0.16, 0.28), rng.uniform(380, 560), rng.uniform(300, 420), int(rng.integers(1e6))), "lowpass", 900)
    i = int(t0 * SR)
    colony[i:i + len(h)] += h * rng.uniform(0.3, 1.0)
amb.add(pan_st(colony * mask * 0.5, 0.3), 0.0, db(-6))
# the canoe creaks as it rocks (on the picture's own roll clock: loopW(1.1))
W_ROLL = 2 * np.pi * max(1, round(1.1 * DUR / (2 * np.pi))) / DUR
for k in range(int(DUR * W_ROLL / np.pi) + 1):
    tc = (k * np.pi + np.pi / 2 - 0.6) / W_ROLL
    if 0.2 < tc < DUR - 0.4 and not (SHOT["why"] - 0.2 < tc < END["why"]) and not (SHOT["wide"] < tc < END["wide"]):
        bed.add(pan_st(creak(0.3, 30 + k, 60, 150), 0.2 * (-1) ** k), tc, db(G["creak"]))

# ================================================================= the hook: you see that bird? ... STONE.
bed.add(pan_st(glint(6800, 0.05, 1), 0.2), 0.02, db(G["tick"]))                                  # frame 1: his fingertip on stone
for i, tp in enumerate([0.38, 0.82]):                                                             # the little pokes (top only)
    bed.add(pan_st(glint(7200 - 300 * i, 0.04, 2 + i), 0.2), tp, db(G["tick"]))
kn1, kn2 = C["stone_end"] + 0.02, C["stone_end"] + 0.24
sfx.add(pan_st(stone_knock(5), 0.15), kn1, db(G["knock"]))                                       # STONE. ... tok
sfx.add(pan_st(stone_knock(6), 0.15), kn2, db(G["knock"] - 1))                                   # ... tok
sfx.add(pan_st(whoosh(0.18, 500, 2400, 7, 0.7), 0.2), C["mummy_end"] + 0.02, db(G["yank"]))      # MUMMY. ... the finger leaves it
sfx.add(pan_st(squelch(0.16, 8), 0), C["mummy_end"] + 0.12, db(G["ew"]))                         # eww
bed.add(pan_st(filt(rustle(0.7, 9), "highpass", 5000), 0.1), C["mummy_end"] + 0.22, db(G["wipe"]))   # wiping it on his shirt (top only)

# ================================================================= the soda: hot washing soda. It BURNS.
bed.add(pan_st(fizz(C["it2"] - C["hot"] + 0.4, 20, 34), 0), C["hot"] - 0.1, db(G["fizz"]))         # the water fizzes (top only)
bed.add(pan_st(top_swish(0.2, 21), -0.4), C["it2"] + 0.05, db(G["swish"]))                        # the blade goes in (top)
bed.add(pan_st(low_thud(22, 90.0), -0.4), C["it2"] + 0.12, db(G["splash"]))                       # ... and its body, low
bed.add(pan_st(steam_hiss(1.0, 23, edges=True, swell=0.15), -0.3), C["burns"] - 0.04, db(G["hiss_top"]))   # TSSS under BURNS (top)
sfx.add(pan_st(steam_hiss(0.55, 24, swell=0.03), -0.3), C["burns_end"] + 0.0, db(G["hiss"]))     # ... and whole, in the pause after it

# ================================================================= the crust: whatever falls in gets dried out... and crusted over.
bed.add(pan_st(top_swish(0.5, 30), -0.6), C["whatever"] + 0.05, db(G["swish"]))                  # the swallow dives in (top)
bed.add(pan_st(low_thud(31, 110.0, 0.2), 0), C["in1"] + 0.0, db(G["plip"]))                       # PLIP (low under "in")
bed.add(pan_st(filt(splash(0.5, 32, 0.6), "highpass", 5000), 0), C["in1"] + 0.02, db(G["plip"] - 3))   # ... and its spray (top)
k = 0
for t0 in np.arange(C["gets"], C["out_end"] + 0.1, 0.085):                                       # drops leaving it, rising (top)
    bed.add(pan_st(glint(5600 + 220 * (k % 9), 0.05, 40 + k), 0.4 * np.sin(k)), t0, db(G["drops"]))
    k += 1
crystals(C["and1"] - 0.05, C["over"] + 0.25, bed, G["crystals"], seed=50)                        # crust growing (top)
sfx.add(pan_st(ding(91, 0.14, 60, bright=1.4), 0), C["over_end"] + 0.04, db(G["ding"]))           # over. ... ting: a statue
sparkle(C["over_end"] + 0.08, bed, G["crystals"] + 2, seed=61, n=3)

# ================================================================= the payoff: Egyptians made mummies with the same salt
bed.add(pan_st(low_thud(70, 70.0, 0.35), 0), C["egyptians"] - 0.02, db(G["poof"]))                # poof (low)
bed.add(pan_st(top_swish(0.4, 71), -0.3), C["egyptians"] - 0.02, db(G["swish"]))
bed.add(pan_st(filt(splash(0.4, 72, 0.4), "highpass", 5000), -0.4), C["made"] + 0.35, db(G["splash"]))   # the scoop (top)
sfx.add(pan_st(ding(84, 0.12, 73, bright=1.2), -0.3), C["salt_end"] + 0.04, db(G["thumb"]))       # salt. ... ting (thumbs up)

# ================================================================= flamingos: they LOVE it
for i in range(3):                                                                                # it wades up (low steps)
    bed.add(pan_st(low_thud(80 + i, 120.0, 0.16), -0.5), C["and2"] - 0.05 + 0.26 * i, db(G["wade"]))
sfx.add(pan_st(honk(0.22, 520.0, 400.0, 81), -0.4), C["flamingos_end"] + 0.06, db(G["honk"]))      # flamingos? ... honk
sfx.add(pan_st(gurgle(0.28, 82, 22), -0.4), C["love_end"] + 0.02, db(G["gurgle"]))                # it. ... blub-blub (head under)
bed.add(pan_st(glint(6000, 0.06, 83), -0.3), C["love"] + 0.3, db(G["heart"]))                     # hearts (top)
bed.add(pan_st(glint(6600, 0.06, 84), -0.2), C["love"] + 0.48, db(G["heart"]))

# ================================================================= the wide: most of the world's lesser flamingos hatch right here...
bed.add(pan_st(top_swish(1.2, 90), 0), C["most"] - 0.05, db(G["crane"]))                         # the camera rises (top)
bed.add(pan_st(wing_flutter(2.6, 91, 6.5), 0.4), C["most"] + 0.2, db(G["flutter"]))              # the flock's wingbeats (low)
bed.add(pan_st(glint(5800, 0.06, 92), 0), C["lesser"] - 0.03, db(G["pop"]))                       # the tag pops (top)
sfx.add(pan_st(tweet(93, 4200.0), -0.3), C["here_end"] + 0.0, db(G["peep"]))                     # here... peep (a chick)

# ================================================================= why: because nothing dares wade in after them.
for i in range(5):                                                                                # the hyena trots up (low)
    bed.add(pan_st(low_thud(100 + i, 140.0, 0.12), 0.4), C["because"] + 0.18 * i, db(G["step"]))
bed.add(pan_st(sniff(0.2, 105, edges=True), 0.4), C["dares"] + 0.1, db(G["step"]))               # sniff (top)
bed.add(pan_st(steam_hiss(0.9, 106, edges=True, swell=0.05), 0.3), C["wade"] + 0.08, db(G["sizzle"]))   # its paw in: TSSS (top)
sfx.add(pan_st(whimper(107), 0.3), C["them_end"] + 0.03, db(G["yelp"]))                          # them. ... YIP (in the pause)

# ================================================================= the button: if a flamingo says the water's lovely... don't.
bed.add(pan_st(top_swish(0.3, 110), -0.4), C["so"] + 0.05, db(G["wing"]))                        # its wing waves (top)
bed.add(pan_st(top_swish(0.3, 111), -0.4), C["says"] + 0.1, db(G["wing"]))
sfx.add(pan_st(slide(520, 820, 0.24, vib=7.0), -0.4), C["lovely_end"] + 0.04, db(G["nope"] - 3))   # lovely... ~ (come in!)
sfx.add(pan_st(slide(260, 196, 0.22, vib=0.0), 0.1), C["dont_end"] + 0.06, db(G["nope"]))        # don't. ... nuh-uh (the shake)
bed.add(pan_st(glint(6800, 0.05, 112), 0.2), DUR - 0.05, db(G["tick"]))                         # his fingertip back on the stone: into the loop

# ================================================================= score (drops out for every punchline)
BPM = 100
groove(mus, 0.24, C["stone"] - 0.04, BPM, ["Dm", "Bb"], gain=-9, seed=10, kick_on=False, snaps=True)           # the hook: curious
drone(mus, C["not"] + 0.05, C["mummy"] - 0.05, [38, 45, 50, 53], cutoff=520, gain=-19)                         # Not stone, actually...
groove(mus, C["water"] + 0.12, C["burns"] - 0.05, BPM, ["Gm", "Eb"], gain=-9, seed=20, kick_on=False, snaps=True, sixteen=True)
drone(mus, C["whatever"] + 0.2, C["over"] - 0.05, [41, 48, 53, 56], cutoff=650, gain=-18)                      # the crust: suspense
mus.add(pan_st(riser(C["over"] - C["and1"] + 0.1, 33, 300, 2400), 0), C["and1"] - 0.05, db(-28))
hijaz(C["egyptians"] + 0.12, C["salt_end"] - 0.05, BPM, gain=-8, seed=40)                                       # the mummy: "Egyptian"
groove(mus, C["and2"] + 0.12, C["love"] - 0.04, BPM, ["F", "C"], gain=-9, seed=50, kick_on=False, snaps=True)   # flamingos: happy
groove(mus, C["most"] + 0.1, C["here_end"] + 0.05, BPM, ["F", "Dm", "Bb", "C"], gain=-7, seed=60, half=True, sixteen=True)   # the wide: big
mus.add(pan_st(riser(1.6, 61, 260, 2000), 0), C["hatch"] - 1.5, db(-27))
crash(mus, C["here_end"] - 0.02, gain=-26)
sneak(C["because"] + 0.12, C["them"] - 0.05, BPM, gain=-8, seed=70)                                             # the hyena sneaks up
groove(mus, C["so"] + 0.12, DUR, BPM, ["Dm", "Bb"], gain=-9, seed=10, kick_on=False, snaps=True)                # the hook's groove: into the loop
silence(mus, [(C["stone"] - 0.04, C["not"] + 0.05),        # STONE. tok tok
              (C["mummy"] - 0.05, C["water"] + 0.12),      # MUMMY. ew
              (C["burns"] - 0.05, C["whatever"] + 0.2),    # BURNS. TSSS
              (C["over"] - 0.05, C["egyptians"] + 0.12),   # over. ting
              (C["salt_end"] - 0.05, C["and2"] + 0.12),    # salt. ting
              (C["love"] - 0.04, C["most"] + 0.1),         # LOVE it. blub
              (C["them"] - 0.05, C["so"] + 0.12)])         # them. yip

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
