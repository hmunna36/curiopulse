"""Why Can't Some People SNAP Their Fingers? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The campsite at night (the fire's low rumble, its crackle above 5 kHz), his SNAP (a crisp snap, the fire's whoosh, and a
cool finger-snap groove that his snap seems to start), the barely-touching snap (a sad "pfff", the groove gone), the glass
(glints), the string appearing (a low twang), the puppeteer snoring (under 240 Hz) and jolting awake (a squeak), the haul (a
ratchet above 5.2 kHz, rope creak below 250 Hz, a rising drone), FULL (a ding), the macro's grip... grip... (rubber squeaks in
the pauses), SLIP! (the snap, after the word), the slow-motion whip (a low whoosh and an airy riser) and the impact (a deep
slowed snap, a boom, a crash), the puppeteer's tumble (a tiny "oof"), a crisp snap after "snap.", the race (a driving groove,
a rocket's air, a ding at the top, a glove's pop after "arm!"), the villain (low thunder and an organ drone, a shing, then
the steel "tink" in the pause and a sad trombone after "VILLAINS."), and the slow snap (a long low creak, then nothing: the
loop starts on silence). What sits on a word is kept under 250 Hz or above 5.2 kHz; what carries a joke gets a pause.
"""
import json
import os
import sys

import numpy as np  # noqa: F401

import sfxlib as L
from sfxkit import *  # noqa: F401,F403
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


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def shimmer(t, gain, n=7, seed=0, pan=0.0, step=0.05):
    """glass: a run of tiny high glints (all above 5 kHz: it can sit on a word)"""
    for i in range(n):
        bed.add(pan_st(glint(5600 + 360 * i, 0.08, seed + i), pan - 0.2 + 0.07 * i), t + step * i, db(gain))


def tiny_voice(t, gain, dur=0.22, seed=0, f0=820.0, rate=24.0, pan=0.0):
    """the puppeteer says something tiny with no words (a pause to itself)"""
    y = gibber(dur, seed, f0, True, 0.0, rate)
    env = np.sin(np.linspace(0, np.pi, len(y))) ** 0.6
    sfx.add(pan_st(fade(y * env, 0.01, 0.04), pan), t, db(gain))


def twang(t, gain, f=98.0, seed=0, bus=None):
    """a string pulled tight: a low pluck, almost all of it under 300 Hz"""
    y = pizz(f, 0.5, seed)
    (bus or bed).add(pan_st(fade(filt(y, "lowpass", 300), 0.002, 0.08), 0.15), t, db(gain))


def big_snap(t, gain, seed=0, pan=0.15, body=1.0):
    """a crisp finger snap with a little body: the snap itself plus a short palm thud (in a pause)"""
    y = snap(seed)
    m = int(0.09 * SR)
    clk = filt(white(m, 400 + seed), "bandpass", [2200, 6500]) * expdecay(m, 0.006)
    yy = np.zeros(m)
    yy[:len(y)] += y
    yy += 0.55 * clk
    yy = np.tanh(2.4 * norm(yy)) / np.tanh(2.4)
    sfx.add(pan_st(fade(yy, 0.0003, 0.01), pan), t, db(gain))
    low_thud(t, gain - 2, 180.0, 0.16, 0.035 * body, bus=sfx)


def slowmo_snap(t, gain, seed=0, gap=0.15):
    """the slow-motion impact: a deep THWACK (its mid band only inside the pause), a boom under 250 Hz after it"""
    m = int(gap * SR)
    y = filt(white(m, 600 + seed), "bandpass", [380, 1500]) * attack_decay(m, 0.002, 0.03)
    y = np.tanh(2.0 * norm(y)) / np.tanh(2.0)
    sfx.add(pan_st(fade(y, 0.0005, 0.02), 0.1), t, db(gain))
    m2 = int(0.7 * SR)
    boom = filt(white(m2, 610 + seed), "lowpass", 190, order=4) * attack_decay(m2, 0.003, 0.22)
    bed.add(pan_st(fade(np.tanh(2.0 * norm(boom)) / np.tanh(2.0), 0.001, 0.1), 0.0), t, db(gain - 1))
    low_thud(t, gain + 1, 110.0, 0.6, 0.2)


def pfff(t, gain, dur=0.36, seed=0):
    """the fizzle: a soft breathy slide of air that sags (in a pause)"""
    m = int(dur * SR)
    y = white(m, 700 + seed)
    f = np.linspace(2600, 900, m)
    out = np.zeros(m)
    blk = int(0.02 * SR)
    for i in range(0, m, blk):      # a falling band, block by block
        seg = y[i:i + blk]
        out[i:i + len(seg)] = filt(seg, "bandpass", [max(200.0, f[i] * 0.6), f[i] * 1.3])
    out *= attack_decay(m, 0.03, dur * 0.45)
    sfx.add(pan_st(fade(norm(out), 0.01, 0.06), 0.2), t, db(gain))


def rubber_squeak(t, gain, f0, f1, dur=0.13, pan=0.1):
    sq = squeak(dur, f0, f1)
    sfx.add(pan_st(fade(sq, 0.003, 0.03), pan), t, db(gain))


def air_rise(t0, t1, gain, seed=0):
    """a riser of air only (above 5.2 kHz): it can run under a line"""
    rs = riser(t1 - t0, seed, 400, 1800)
    bed.add(pan_st(fade(filt(rs, "highpass", 5200), 0.05, 0.02), 0.0), t0, db(gain))


def low_whoosh(t, dur, gain, seed=0):
    """a big slow move, all of it under 380 Hz (it can sit under a word)"""
    y = whoosh(dur, 60, 340, seed)
    bed.add(pan_st(fade(filt(y, "lowpass", 380), 0.05, 0.08), 0.0), t, db(gain))


# ================================================================= ambience: the campfire at night
rumble = norm(filt(brown(N, 1), "lowpass", 200) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * tt)))
crk = norm(crackle(N, 9.0, 2, 5400, 11000))
night = norm(filt(pink(N, 3), "bandpass", [140, 380])) * 0.25
camp_on = gate(N, [(0, SHOT["macro"]), (END["macro"], SHOT["race"]), (SHOT["villain"], DUR)])
amb.x += pan_st((rumble * 0.9 + night) * camp_on, 0.1) * 0.26
amb.x += pan_st(rumble * (1 - camp_on), 0.1) * 0.10                               # the macro and the chart: the fire far off
bed.x += pan_st(crk * camp_on, 0.3) * db(-31)
crickets(SHOT["hook"] + 0.1, SHOT["glass"], bed, -33, seed=5, f=5600, rate=0.8)

# ================================================================= 1. the hook: SNAP, then barely touching: pfff
big_snap(c["snap1"], -10, 11)                                                          # SNAP (in the pause after "fingers.")
fw = fire_whoosh(0.3, 12, 0.8)
sfx.add(pan_st(fade(fw, 0.004, 0.12), 0.35), c["snap1"] + 0.03, db(-17))             # the fire flares (ends before "Now")
hi_tick(c["touching"] + 0.05, -20, 13, 0.2)                                            # the fingertip set down, ever so lightly
pfff(c["snap2_end"] + 0.03, -12, 0.38, 14)                                             # the limp slide: pfff (after "snap.")
sad0 = slide(311.0, 233.0, 0.22, 0.0, None, 5)
sfx.add(pan_st(fade(sad0, 0.01, 0.05), 0.1), c["snap2_end"] + 0.42, db(-20))          # a sad little "wah" (ends before "Fizzled?")

# ================================================================= 2. the glass: a catapult nobody loaded
shimmer(c["glass_in"] + 0.02, -23, 8, 20, 0.1)                                         # the hand turns to glass (above 5 kHz)
low_thud(c["glass_in"] + 0.06, -19, 110.0, 0.4, 0.15)
twang(c["string_in"] + 0.02, -14, 82.0, 21)                                            # the string appears (low, on "catapult")
for i, ts in enumerate((c["never"] + 0.3, c["loaded"] + 0.5)):                       # the puppeteer snores (low)
    bed.add(pan_st(fade(filt(snore(0.6, 22 + i, 56.0), "lowpass", 240), 0.05, 0.1), 0.1), ts, db(-15))
hi_tick(c["meter_in"] + 0.02, -18, 23, -0.2)                                           # LOAD: 0% (above 5 kHz)
bed.add(pan_st(glint(7400, 0.1, 24), -0.2), c["meter_in"] + 0.06, db(-19))

# ================================================================= 3. press HARD: the puppeteer hauls, the catapult loads
rubber_squeak(c["loaded_end"] + 0.05, -17, 1500, 2600, 0.11, 0.1)                      # he jolts awake (in the pause before "Press")
tiny_voice(c["loaded_end"] + 0.17, -19, 0.1, 30, 760.0, 30.0, 0.1)                     # "huh!"
bed.add(pan_st(ratchet(c["full"] - c["haul"], 12.0, 30.0, 31, True), 0.15), c["haul"], db(-17))   # hand over hand (above 5.2 kHz)
bed.add(pan_st(fade(filt(creak(c["full"] - c["haul"], 32, 45, 110), "lowpass", 220), 0.05, 0.05), 0.15), c["haul"], db(-14))   # the rope (low)
air_rise(c["haul"], c["full"], -21, 33)                                                # the load building (air only)
ding_full = ding(84, 0.18, 34, 1.3)
sfx.add(pan_st(fade(ding_full, 0.002, 0.05), 0.0), c["loading_end"] + 0.03, db(-15))  # FULL (after "loading.")

# ================================================================= 4. the macro: grip... grip... SLIP!
bed.add(pan_st(fade(filt(squelch(0.4, 41), "lowpass", 280), 0.02, 0.08), 0.0), c["squishy"] + 0.02, db(-13))   # the squish (low, on "squishy")
rubber_squeak(c["grip1"] + 0.46, -19, 1300, 1700, 0.12)                                # the pads creep: squeak (after "grip...")
rubber_squeak(c["grip2_end"] + 0.04, -16, 1450, 2000, 0.15)                            # again, louder
big_snap(c["slip_end"] + 0.07, -5, 42, 0.2)                                            # SLIP! ... SNAP (after the word)
sfx.add(pan_st(whoosh(0.2, 600, 3200, 43), -0.3), c["slip_end"] + 0.06, db(-20))

# ================================================================= 5. the slam: slow motion into the palm
low_whoosh(c["whip"], c["impact"] - c["whip"] + 0.1, -12, 50)                         # the slow whip (low)
air_rise(c["whip"], c["impact"], -18, 51)                                              # air building into the hit
slowmo_snap(c["impact"], -9, 52, 0.1)                                                  # THWACK (inside the 0.16 s pause after "palm..."), a boom under "and"
bed.add(cymbal(53, 1.4), c["impact"] + 0.02, db(-25))                                # a crash (above 5 kHz)
bed.add(pan_st(fade(filt(boing(0.3, 75.0, 54), "lowpass", 200, order=4), 0.003, 0.06), 0.2), c["tumble"], db(-15))   # the puppeteer goes over (low)
shimmer(c["burst"] + 0.02, -24, 5, 55, 0.2, 0.04)                                      # SNAP! (above 5 kHz, on "slap")
big_snap(c["snapw_end"] + 0.04, -11, 56)                                               # a crisp snap after "snap."

# ================================================================= 6. the race: SPEED-UP
sfx.add(pan_st(whoosh(0.2, 250, 1600, 60), 0.0), SHOT["race"] - 0.18, db(-22))        # into the chart (ends before "The")
air_rise(c["bar1"], c["bar1"] + 0.45, -16, 61)                                         # the snap's bar rockets up (air)
low_thud(c["bar1"] + 0.45, -15, 140.0, 0.3, 0.08)
bed.add(pan_st(glint(7800, 0.12, 62), 0.3), c["bar1"] + 0.48, db(-16))
bed.add(pan_st(fade(filt(whoosh(0.4, 200, 900, 63), "highpass", 5200), 0.02, 0.05), -0.3), c["bar2"], db(-18))   # the pitch (air)
gp = slap_hit(64, False)
sfx.add(pan_st(np.tanh(3.0 * norm(gp)) / np.tanh(3.0), -0.25), c["arm_end"] + 0.04, db(-11))   # the glove's pop (after "arm!")
bed.add(pan_st(glint(8400, 0.12, 65), 0.0), c["x26"] + 0.02, db(-17))                 # x2.6

# ================================================================= 7. the villain: steel can't squish
bed.add(pan_st(fade(filt(thunder(1.6, 70), "lowpass", 240), 0.05, 0.3), 0.0), c["cape"] + 0.02, db(-12))   # low thunder
bed.add(pan_st(glint(6800, 0.14, 71), 0.25), c["pose"] + 0.03, db(-15))               # the dramatic raise: shing (above 5 kHz)
air_rise(c["pose"], c["tink"], -21, 72)
tk = glass_tink(73, 3400.0, 0.14)
sfx.add(pan_st(fade(np.tanh(2.5 * norm(tk)) / np.tanh(2.5), 0.001, 0.05), 0.2), c["tink"] + 0.02, db(-9))   # tink. (in the pause after "squish...")
bed.add(pan_st(fade(filt(boing(0.4, 90.0, 74), "lowpass", 250), 0.005, 0.1), 0.2), c["flops"], db(-14))   # the flop (low, on "flops.")
trom = slide(294.0, 196.0, 0.42, 5.0, None, 7)
sfx.add(pan_st(fade(trom, 0.01, 0.08), 0.0), c["villains_end"] + 0.03, db(-15))      # a sad trombone (after "VILLAINS.")

# ================================================================= 8. the button: a SLOW snap
sfx.add(pan_st(whoosh(0.18, 250, 1500, 80), 0.0), c["now3"] - 0.2, db(-23))           # back to him (ends before "Now")
bed.add(pan_st(fade(filt(creak(c["snap3_end"] - c["slowstart"] + 0.1, 81, 40, 90), "lowpass", 230), 0.05, 0.08), 0.2), c["slowstart"], db(-14))   # the slow slide (low)
pfff(c["snap3_end"] + 0.05, -20, 0.26, 82)                                            # ...and nothing (a tiny pfff)

# ================================================================= score (drops out for every punchline)
groove(mus, c["snap1"] + 0.02, c["snap2"], 116, ["Dm", "G"], gain=-12, seed=10, kick_on=False)            # his snap starts the band
groove(mus, c["catapult1"] + 0.1, c["loaded_end"], 100, ["Am", "F"], gain=-14, seed=11, kick_on=False, snaps=False, padv=False)
drone(mus, c["haul"] + 0.05, c["loading_end"], [45, 52, 57], cutoff=520, gain=-24, seed=12, swell=1.6)
drone(mus, c["feel"] + 0.2, c["loading_end"], [50, 57, 62], cutoff=560, gain=-26, seed=13, swell=1.2)
drone(mus, c["squishy"] + 0.1, c["slip"] - 0.02, [40, 47, 52], cutoff=420, gain=-25, seed=14, swell=0.5)
groove(mus, SHOT["race"] + 0.12, c["arm_end"], 128, ["C", "G", "Am", "F"], gain=-12, seed=15, kick_on=True, snaps=True)
drone(mus, c["cape"] + 0.08, c["tink"], [38, 45, 50, 53], cutoff=700, gain=-23, seed=16, swell=0.4)
groove(mus, c["now3"] + 0.25, c["snap3"] - 0.05, 116, ["Dm", "G"], gain=-15, seed=17, kick_on=False, arp=False, padv=False)
silence(mus, [(c["snap2"], c["catapult1"] + 0.1), (c["loaded_end"], c["haul"] + 0.05), (c["loading_end"], c["squishy"] + 0.1),
              (c["slip"] - 0.02, SHOT["race"] + 0.12), (c["arm_end"], c["cape"] + 0.08), (c["tink"], c["now3"] + 0.25),
              (c["snap3"] - 0.05, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -12.0}, duck={"music": 0.72})
