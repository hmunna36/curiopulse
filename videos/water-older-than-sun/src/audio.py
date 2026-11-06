"""Is Your Water Older Than the SUN? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
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

SFX_LEVEL = -12.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(glug=-24, sunglint=-30, ding=-19, tension=-27, spraylow=-20, spraytop=-28, slap=-26, slaplow=-24,
         tape=-25, tapetop=-34, sunout=-20, suitpop=-22, suittop=-31, clink=-27, crack=-20, crackpause=-17,
         chatter=-30, shiver=-18, hop=-22, land=-18, creep=-31, boing=-21, uhoh=-18, suck=-27, babyglint=-29,
         squeak=-22, fill=-22, filltop=-32, stars=-29, beard=-23, beardtop=-31, poof=-12, loopglug=-24, whoosh=-21)


# ================================================================= this Short's atoms
def norm(y):
    return y / (np.abs(y).max() + 1e-9)


def soft_clip(y, k=3.0):
    y = norm(y)
    return np.tanh(k * y) / np.tanh(k)


def top_only(y, f=5200):
    return filt(y, "highpass", f)


def low_only(y, f=280):
    return filt(y, "lowpass", f)


def low_thud(seed=0, f=80.0, dur=0.28):
    """a soft hit heard low: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.08)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(norm(y), 0.0008, 0.04)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(norm(y), 0.003, 0.02)


def breeze(n, seed=0):
    """a mountain breeze (stereo): soft air under ~420 Hz that swells on a whole number of cycles (the loop holds)"""
    y = filt(pink(n, seed), "lowpass", 420) * (0.7 + 0.3 * np.sin(2 * np.pi * (2 / DUR) * ar(n)))
    return pan_st(norm(y), 0)


def cold_hum(n, seed=0):
    """the cold cloud: a deep airy hum under ~200 Hz with a faint glassy shimmer above 6 kHz (stereo)"""
    t = ar(n)
    low = filt(brown(n, seed), "lowpass", 190) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.31 * t))
    hi = filt(white(n, seed + 1), "bandpass", [6200, 9000]) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * t)) ** 2
    return pan_st(norm(low) + 0.06 * norm(hi), 0)


def tape_whirr(dur, seed=0, edges=True):
    """a tape spooling back fast: a motor whirr that climbs (under 300 Hz) and a chirpy chatter above 5.2 kHz"""
    n = int(dur * SR)
    t = ar(n)
    f = 60 + 140 * (t / dur) ** 1.5
    motor = low_only(np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sign(np.sin(2 * np.pi * np.cumsum(f * 2) / SR)), 300)
    chat = top_only(white(n, seed) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * np.cumsum(30 + 90 * t / dur) / SR))), 5200)
    y = norm(motor) + 0.5 * norm(chat)
    return fade(norm(y), 0.04, 0.08)


def spray_parts(seed=0, dur=0.5):
    """a spit-take spray: the low burst (under 280 Hz) and the hiss (above 5.2 kHz), so it can sit under a word"""
    n = int(dur * SR)
    t = ar(n)
    env = np.minimum(1, t / 0.01) * np.exp(-t / 0.14)
    noise = white(n, seed) * env
    return fade(norm(low_only(brown(n, seed + 1) * env, 280)), 0.002, 0.05), fade(norm(top_only(noise, 5200)), 0.002, 0.08)


def chatter(dur, seed=0, rate=22.0):
    """teeth chattering: tiny dry clicks above 5.2 kHz at `rate` a second (it runs under a line)"""
    n = int(dur * SR)
    y = np.zeros(n)
    rng = np.random.default_rng(seed)
    k = 0.0
    while k < dur - 0.02:
        i = int(k * SR)
        m = int(0.012 * SR)
        y[i:i + m] += white(m, seed + i) * np.exp(-ar(m) / 0.002)
        k += 1.0 / rate * (0.8 + 0.4 * rng.random())
    return fade(norm(top_only(y, 5200)), 0.01, 0.05)


def sparkle(t0, freqs, gap, gain, seed=0, bus=None):
    """a run of tiny glints above 5 kHz (it can sit on a word)"""
    for k, f in enumerate(freqs):
        (bus or bed).add(pan_st(glint(f, 0.07, seed + k), 0.3 * (-1) ** k), t0 + gap * k, db(gain))


# ================================================================= the beds
hook_end, cloud_on, btn = SHOT["rewind"], SHOT["cloud"], SHOT["button"]
amb.x += breeze(N, 5) * gate(N, [(0, hook_end + 0.6), (btn, DUR)]) * 0.55
amb.x += cold_hum(N, 7) * gate(N, [(c["born"], btn + 0.1)]) * 0.75

# ================================================================= the hook: glugs, the Sun, the ding, the freeze, the spit
for k, g in enumerate(c["glugs"]):
    bed.add(pan_st(glug_low(10 + k), 0.12), g + 0.04, db(G["glug"]))
sparkle(c["sun1"] + 0.02, [7600, 8400], 0.06, G["sunglint"], 20)                                   # the Sun (top)
sfx.add(pan_st(ding(84, 0.13, 21), 0.2), c["water2_end"] + 0.05, db(G["ding"]))                    # ding: right answer (the pause)
sfx.add(pan_st(ding(91, 0.16, 22), 0.2), c["water2_end"] + 0.19, db(G["ding"] - 1.5))
sfx.add(pan_st(top_only(glass_tink(23, 6600.0, 0.07), 5200), 0.1), c["freeze"] + 0.02, db(G["tension"]))   # the freeze (top)
sl, st = spray_parts(30)
bed.add(pan_st(sl, 0), c["spit"], db(G["spraylow"]))                                               # PFFT, under "leftovers"
bed.add(pan_st(st, 0), c["spit"], db(G["spraytop"]))
bed.add(pan_st(top_swish(0.09, 31), 0.35), c["spit"] + 0.28, db(G["slap"]))                         # the note slaps on
bed.add(pan_st(low_thud(32, 140.0, 0.12), 0.35), c["spit"] + 0.3, db(G["slaplow"]))

# ================================================================= the rewind
bed.add(pan_st(tape_whirr(c["gone"] - SHOT["rewind"] + 0.1, 40), 0), SHOT["rewind"] - 0.05, db(G["tape"]))
bed.add(pan_st(low_only(slide(420, 70, 0.5), 300), 0.3), c["gone"] - 0.1, db(G["sunout"]))         # the Sun goes out (low)
bed.add(pan_st(low_thud(41, 100.0, 0.22), 0), c["gone"] + 0.04, db(G["suitpop"]))                  # the suit pops on
bed.add(pan_st(top_swish(0.16, 42), 0), c["gone"] + 0.04, db(G["suittop"]))
sfx.add(pan_st(whoosh(0.35, 300, 2600, 43), 0), c["born_end"] + 0.02, db(G["whoosh"]))             # into the cloud (the pause)

# ================================================================= the cloud: clinks, the ice, the cold
for k, tk in enumerate(c["clinks"]):
    bed.add(pan_st(top_only(glass_tink(50 + k, 6000.0 + 500 * k, 0.09), 5200), 0.35), tk, db(G["clink"]))
bed.add(pan_st(top_only(ice_crack(0.5, 55), 5200), 0.3), c["ice"] + 0.05, db(G["crack"] - 6))     # it freezes (top, on "ice")
sfx.add(pan_st(ice_crack(0.18, 56), 0.3), c["ice_end"] + 0.02, db(G["crackpause"]))                # crack (the pause after "ice...")
bed.add(pan_st(chatter(c["cloud_end"] - c["freezing"] + 0.1, 57), 0.05), c["freezing"], db(G["chatter"]))
sfx.add(pan_st(shiver(0.3, 58), 0.0), c["cloud_end"] + 0.02, db(G["shiver"]))                      # brrr (the pause after "cloud.")

# ================================================================= the scale: the hop, HEAVY, the baby Sun
bed.add(pan_st(low_only(boing(0.35, 120.0, 60), 300), -0.2), c["how"] - 0.05, db(G["hop"]))
bed.add(pan_st(low_thud(61, 90.0, 0.26), 0.1), c["know"], db(G["land"]))                           # it lands on the scale (low)
bed.add(pan_st(ratchet(c["too"] + 0.1 - c["teeny"], 14.0, 30.0, 62, edges=True), 0.1), c["teeny"], db(G["creep"]))   # the needle creeps
sfx.add(pan_st(soft_clip(boing(0.26, 95.0, 63), 2.0), 0.1), c["heavy_end"] + 0.02, db(G["boing"]))  # BOING: the needle hits HEAVY
sfx.add(pan_st(slide(520, 300, 0.2, vib=6.0), 0.1), c["heavy_end"] + 0.06, db(G["uhoh"]))           # uh-oh (the pause)
bed.add(pan_st(sniff(0.16, 64, edges=True), 0.1), c["heavy"] + 0.2, db(G["suck"]))                 # it sucks its belly in (top)
sparkle(c["baby"] + 0.02, [6800, 7600, 8400], 0.07, G["babyglint"], 65)                            # the baby Sun pops in (top)
sfx.add(pan_st(squeak(0.08, 2100, 2800), 0.45), c["make_end"] + 0.04, db(G["squeak"]))             # nuh-uh: the dummy squeaks
sfx.add(pan_st(squeak(0.08, 2600, 1900), 0.45), c["make_end"] + 0.2, db(G["squeak"] - 1))

# ================================================================= the button: the fill, the stars, the beard, the loop
bed.add(pan_st(low_only(gurgle(c["water3_end"] - c["and"], 70, rate=14), 300), 0), c["and"] + 0.1, db(G["fill"]))
bed.add(pan_st(top_only(gurgle(c["water3_end"] - c["and"], 71, rate=14), 5200), 0), c["and"] + 0.1, db(G["filltop"]))
sparkle(c["bits"] + 0.05, [6200, 7000, 7800, 8600], 0.09, G["stars"], 72)
sparkle(c["you"] + 0.02, [7200, 8200], 0.06, G["stars"] + 2, 76)
bed.add(pan_st(low_thud(80, 75.0, 0.3), 0), c["beard"], db(G["beard"]))                            # the beard: POOF (under "older")
bed.add(pan_st(top_swish(0.18, 81), 0), c["beard"], db(G["beardtop"]))
sfx.add(pan_st(cork_pop(82, 480.0), 0), c["sun4_end"] + 0.02, db(G["poof"]))                       # the beard leaves (the tail)
bed.add(pan_st(glug_low(83), 0.12), DUR - 0.12, db(G["loopglug"]))                                 # the loop: he sips again

# ================================================================= score (drops out for every punchline)
HOOK = ["C", "F", "G", "C"]                       # a sunny trail: bouncy
groove(mus, 0.04, c["ans"] - 0.06, 108, HOOK, gain=-10, seed=10, kick_on=False, snaps=True)
groove(mus, c["youve"] + 0.12, c["freeze"], 108, ["F", "G"], gain=-11, seed=12, kick_on=False, snaps=True)
drone(mus, SHOT["rewind"] + 0.05, c["born_end"], [48, 55, 60], cutoff=600, gain=-22, swell=0.4)        # the rewind: a held breath
groove(mus, c["up"] + 0.12, c["ice"], 84, ["Am", "Em"], gain=-12, seed=14, kick_on=False, snaps=False, arp=True, bass=False)   # glassy, cold
drone(mus, c["ice_end"] + 0.05, c["cloud_end"], [45, 52, 57, 64], cutoff=500, gain=-22, swell=0.5)      # the cold
groove(mus, c["know"] + 0.1, c["heavy"] - 0.05, 112, ["Dm", "A"], gain=-10, seed=16, kick_on=False, snaps=True, bass=True)    # sneaky: the weigh-in
groove(mus, c["baby"] + 0.12, c["make"], 84, ["F", "C"], gain=-13, seed=18, kick_on=False, snaps=False, arp=True, bass=False)  # a lullaby
groove(mus, c["mostly"] + 0.05, c["beard"] - 0.04, 104, ["C", "G", "Am", "F"], gain=-10, seed=20, kick_on=True, snaps=True)
drone(mus, c["beard"] + 0.15, c["sun4_end"], [48, 55, 64], cutoff=900, gain=-24, swell=0.5)             # wise old man
groove(mus, c["loop"], DUR, 108, HOOK, gain=-10, seed=10, kick_on=False, snaps=True)                    # into the loop
silence(mus, [(c["ans"] - 0.06, c["youve"] + 0.12),       # The WATER. (ding)
              (c["freeze"], SHOT["rewind"] + 0.05),         # the freeze, the spit
              (c["heavy"] - 0.05, c["baby"] + 0.12),         # HEAVY (boing, uh-oh)
              (c["make"], c["mostly"] + 0.05),               # nuh-uh (the dummy)
              (c["sun4_end"], c["loop"])])                   # the beard leaves

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
