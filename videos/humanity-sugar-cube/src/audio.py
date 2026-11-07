"""All of HUMANITY Fits in a Sugar Cube ☕ Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Rules (reference/sound.md): a sound for every beat, the punchline SFX in the pause AFTER the word, the score drops out
for every punchline, anything in the speech band sits in a pause; under a word only what is under ~300 Hz or above 5.2 kHz.
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
c = C

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(tick=-27, glint=-27, whoosh=-22, squeak=-21, thump=-20, puff=-27, cricket=-30, pop=-25, swell=-24, boing=-21,
         poke=-22, ting=-20, clap=-19, squish=-21, bead=-22, murmur=-26, count=-28, clank=-21, zip=-25, formed=-21,
         whistle=-27, clink=-17, thud=-15, slide=-27, tickup=-29, crunch=-17, crunchlo=-16, creak=-24, beep=-23, pick=-25)


def low_thud(cut=220):
    """a heavy low thump, all of it under ~220 Hz (it can sit on a word)"""
    return filt(kick(1.0), "lowpass", cut)


def low_whoosh(dur, seed, cut=320):
    """a move of the camera or a yank, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def tongs_tick(seed=0):
    """the sugar tongs: one tiny metal tick above 5 kHz (bed bus: it can sit on a word)"""
    return glint(6800 + 400 * (seed % 3), 0.06, seed)


def air_puff(dur, seed=0):
    """a soft puff of air, only above 5.2 kHz (the fluff poofing out of his coat, under the word)"""
    n = int(dur * SR)
    return fade(filt(white(n, 900 + seed), "highpass", 5400) * attack_decay(n, 0.01, dur * 0.4), 0.002, 0.03)


def whistle_hi(dur, seed=0, f0=7400.0, f1=5600.0):
    """a falling bomb whistle kept above 5.2 kHz, so it can fall under a line"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = f0 * (f1 / f0) ** u
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.35 + 0.65 * u)
    return fade(y, 0.05, 0.02)


def crowd_murmur(dur, seed=0):
    """eight billion people, far away: a dense murmur of gibber voices low-passed under 420 Hz plus a little air on top"""
    y = sum(gibber(dur, seed + i, 150.0 + 35 * i, False, 0.0, 9.0 + 1.3 * i) for i in range(6))
    lo = filt(y, "lowpass", 420)
    hi = filt(white(len(lo), seed + 50), "highpass", 6000) * 0.06
    return fade((lo + hi) * attack_decay(len(lo), 0.25, dur * 0.5), 0.2, 0.15)


# ================================================================= ambience: the hut cafe (a stove ticking, wind outside)
cafe_on = gate(N, [(0, SHOT["world"]), (SHOT["cube"], DUR)])
stove = filt(brown(N, 3), "lowpass", 260) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * tt))
amb.x += pan_st(stove, -0.35) * 0.4 * cafe_on
amb.x += pan_st(L.crackle(N, 3.0, 5, 5600, 9000), -0.45) * 0.05 * cafe_on          # the fire's crackle (above 5.6 kHz)
amb.x += pan_st(filt(pink(N, 4), "lowpass", 330) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tt + 1.0)), 0.4) * 0.3 * cafe_on   # wind on the window
space_on = gate(N, [(SHOT["world"], SHOT["cube"])])
amb.x += pan_st(filt(pink(N, 6), "lowpass", 240), 0.0) * 0.35 * space_on              # the hush up high

# ================================================================= the hook: the cube over the coffee (and the loop)
bed.add(pan_st(tongs_tick(1), -0.3), 0.0, db(G["tick"]))                               # frame 1: the tongs tick
bed.add(pan_st(tongs_tick(2), -0.3), c["how"] + 0.12, db(G["tick"] - 2))              # it stops
for i in range(5):                                                                     # it rises to his eye: a sparkle
    bed.add(pan_st(glint(5600 + 450 * i, 0.07, 3 + i), -0.2), c["fit1"] + 0.18 * i, db(G["glint"] - 2))

# ================================================================= the answer: All of them, because you're mostly... nothing.
sfx.add(pan_st(low_whoosh(0.26, 20), -0.3), SHOT["answer"] - 0.12, db(G["whoosh"]))     # the whip
sfx.add(pan_st(low_whoosh(0.2, 21, 280), -0.5), c["all1"] - 0.04, db(G["whoosh"] + 1))  # the yank (all low)
sfx.add(pan_st(squeak(0.12, 2300, 3300), -0.4), c["them_end"] + 0.04, db(G["squeak"]))   # yikes (in the pause)
sfx.add(pan_st(cricket(22, 2, 4700), 0.4), c["mostly_end"] + 0.06, db(G["cricket"]))      # the gap before "nothing."
sfx.add(pan_st(low_thud(), 0.1), c["poof"] - 0.02, db(G["thump"]))                      # the pat on his chest (low)
bed.add(pan_st(air_puff(0.35, 23), 0.3), c["poof"], db(G["puff"]))                       # the fluff poofs out (top only)

# ================================================================= the atom: cotton candy, all fluff, one tiny speck
sfx.add(pan_st(filt(riser(0.4, 30, 200, 900), "lowpass", 300), 0.0), SHOT["atom"] - 0.25, db(G["swell"]))   # the dive
bed.add(pan_st(glint(7200, 0.08, 31), -0.3), c["atom"] + 0.02, db(G["pop"]))           # the "1 ATOM" tag pops
sfx.add(pan_st(filt(boing(0.5, 90.0, 32), "lowpass", 260), -0.2), c["swell"], db(G["swell"]))   # the fluff swells (low)
for i in range(6):                                                                     # ... sparkling as it grows
    bed.add(pan_st(glint(5800 + 380 * (i % 4), 0.07, 33 + i), -0.3 + 0.1 * i), c["swell"] + 0.12 * i, db(G["glint"]))
sfx.add(pan_st(filt(boing(0.22, 120.0, 34), "lowpass", 280), 0.3), c["poke"], db(G["poke"]))   # the poke (low, on the word)
sfx.add(pan_st(boing(0.2, 260.0, 35), 0.3), c["fluff1_end"] + 0.03, db(G["boing"]))     # boing (in the pause)
bed.add(pan_st(ratchet(c["speck1"] - c["one1"], 14.0, 34.0, 36, edges=True, f=6000.0), 0.0), c["one1"], db(G["zip"]))   # the push in
bed.add(pan_st(glint(8000, 0.14, 37), 0.0), c["speck1"] - 0.03, db(G["ting"] - 3))     # the speck lights up
sfx.add(pan_st(ding(91, 0.14, 38), 0.0), c["speck1_end"] + 0.04, db(G["ting"]))         # ting (in the pause)

# ================================================================= the squash: CLAP... a bead
sfx.add(pan_st(slap_hit(40, edges=True), 0.0), c["clap"], db(G["clap"]))               # the clap (low + top: on the word)
sfx.add(pan_st(low_thud(240), 0.0), c["clap"] + 0.01, db(G["thump"]))
bed.add(pan_st(air_puff(0.3, 41), -0.5), c["clap"] + 0.02, db(G["puff"]))
bed.add(pan_st(air_puff(0.3, 42), 0.5), c["clap"] + 0.04, db(G["puff"]))
sfx.add(pan_st(squelch(0.22, 43), 0.0), c["fluff2_end"] + 0.03, db(G["squish"]))        # squish (in the pause)
bed.add(pan_st(glint(7600, 0.1, 44), 0.0), c["bead"] + 0.05, db(G["bead"]))            # the bead glints

# ================================================================= the world: all eight billion of us... into one cube
sfx.add(pan_st(low_whoosh(0.34, 50), 0.4), SHOT["world"] - 0.14, db(G["whoosh"] + 2))   # the whip out to the planet
sfx.add(pan_st(crowd_murmur(END["world"] - SHOT["world"] - 0.3, 51), 0.0), SHOT["world"], db(G["murmur"]))
bed.add(pan_st(ratchet(c["billion"] + 0.35 - c["eight"], 30.0, 12.0, 52, edges=True, f=5800.0), 0.0), c["eight"], db(G["count"]))   # the counter
sfx.add(pan_st(low_whoosh(0.5, 53, 260), 0.0), c["tongs_in"], db(G["whoosh"] + 3))      # the giant tongs come down (low)
bed.add(pan_st(buzz_hi(c["formed"] - c["pinch"], 44.0, 54), 0.0), c["pinch"], db(G["zip"]))   # the squeeze (top)
sfx.add(pan_st(filt(riser(c["formed"] - c["pinch"], 55, 60, 240), "lowpass", 300), 0.0), c["pinch"], db(G["zip"] + 4))   # (low)
sfx.add(pan_st(ding(96, 0.12, 56, 1.4), 0.0), c["fit2_end"] + 0.05, db(G["formed"]))   # TING: one cube (in the pause)

# ================================================================= the cube: it whistles down and lands on his saucer
bed.add(pan_st(whistle_hi(c["clink"] - c["in_one"] - 0.05, 60), 0.0), c["in_one"], db(G["whistle"]))
sfx.add(pan_st(glass_tink(61, 3100.0, 0.16), 0.0), c["clink"], db(G["clink"]))         # CLINK (in the gap)
sfx.add(pan_st(low_thud(180), 0.0), c["clink"] + 0.01, db(G["thud"]))                  # ...and a THUD (it weighs everyone)
bed.add(pan_st(glint(7000, 0.12, 62), 0.0), c["clink"] + 0.12, db(G["pop"]))           # the ALL OF US tag

# ================================================================= the weird fact: just you? a speck... as much as you.
sfx.add(pan_st(low_whoosh(0.26, 70), -0.4), SHOT["weird"] - 0.12, db(G["whoosh"]))     # the whip
bed.add(pan_st(filt(white(int(0.3 * SR), 71), "highpass", 5600) * attack_decay(int(0.3 * SR), 0.08, 0.12), 0.4), c["glass"], db(G["slide"]))   # the magnifier slides in
bed.add(pan_st(glint(7300, 0.08, 72), 0.2), c["speck2"] + 0.03, db(G["pop"]))          # the YOU tag
bed.add(pan_st(ratchet(c["you2"] - c["count"], 10.0, 40.0, 73, edges=True, f=6200.0), 0.3), c["count"], db(G["tickup"]))   # the reading climbs
sfx.add(pan_st(low_thud(200), 0.2), c["crunch"], db(G["crunchlo"]))                    # the plate gives (low, on "you.")
sfx.add(pan_st(crumple(0.4, 74), 0.25), c["you2_end"] + 0.03, db(G["crunch"]))          # CRUNCH (in the pause)
sfx.add(pan_st(creak(0.32, 75, 60, 140), 0.3), c["you2_end"] + 0.18, db(G["creak"]))    # the table creaks
sfx.add(pan_st(beep(2600.0, 0.07), 0.3), c["you2_end"] + 0.46, db(G["beep"]))           # the scale gives up: beep...
sfx.add(pan_st(beep(1300.0, 0.12), 0.3), c["you2_end"] + 0.56, db(G["beep"]))           # ...boop

# ================================================================= the button: still want sugar? (and the loop)
sfx.add(pan_st(low_whoosh(0.24, 80), 0.0), SHOT["button"] - 0.1, db(G["whoosh"] - 2))
bed.add(pan_st(tongs_tick(81), -0.3), DUR - 1.42, db(G["pick"]))                        # the tongs close on the cube
bed.add(pan_st(tongs_tick(82), -0.3), DUR - 0.45, db(G["pick"]))                        # ...and it is over the mug again

# ================================================================= score: a cosy hut-cafe groove (drops for punchlines)
BPM = 104
groove(mus, c["how"], c["mostly_end"] - 0.05, BPM, ["F", "C", "Dm", "Bb"], gain=-8, seed=10, kick_on=False)
groove(mus, c["every"] + 0.05, c["speck1"] - 0.08, BPM, ["Dm", "Bb", "F", "C"], gain=-9, seed=20, kick_on=False, half=True)
drone(mus, SHOT["world"] + 0.02, c["fit2_end"] + 0.02, [41, 48, 53, 57, 60], cutoff=900, gain=-20, seed=30, swell=0.5)
groove(mus, c["just"] + 0.1, c["you2"] - 0.05, BPM, ["Dm", "A", "Dm", "A"], gain=-12, seed=40, kick_on=False, snaps=False, half=True)
groove(mus, c["want"], DUR, BPM, ["F", "C"], gain=-10, seed=50, kick_on=False)
silence(mus, [(c["mostly_end"] - 0.05, c["every"] + 0.05),       # the gap and "nothing." (the bwomp is put back below)
              (c["speck1"] - 0.08, c["squash"] + 0.05),         # the speck: the ting alone
              (c["fit2_end"], c["just"] + 0.1),                 # TING, the whistle, CLINK, THUD
              (c["you2"] - 0.05, c["want"]),                    # CRUNCH, creak, beep-boop
              (DUR - 0.2, DUR)])                                # into the loop
bwomp(sfx, c["nothing_end"] + 0.03, m=36, gain=-22)              # a gag, so on the sfx bus (sound.md: a tune is a gag)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -18, "sfx": -12.0}, duck={"music": 0.74})
