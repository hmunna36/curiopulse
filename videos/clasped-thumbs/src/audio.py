"""Which THUMB Is On Top When You Clasp Your Hands? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

Rain at night (a low roar under 300 Hz and a hiss and patter above 5 kHz, so it never sits on a word), a hymn-like pad while
he prays, his fingers sliding together (skin swishes above 5.2 kHz and a soft clap under 250 Hz), the swap, the lightning in
the gap before "Feels" (the crack inside the pause, the thunder low), the faces popping open (glints), a sneaky groove for the
seats, a sly "hmm" after "one seat over.", bliss sparkles at home, a creak as everyone turns, a cricket after "strangers.",
the coin's ping, its whirr, the THUP in the mud and its wobble, the 1 % pop, the twin sliding in, a standoff "dun" after
"thumbs", the 4-in-10 pops, and the sun: the rain stops, a major swell, birds, then the clouds close with a womp and the rain
is back for the loop. What sits on a word is kept under 250 Hz or above 5.2 kHz; what carries a joke gets a pause.
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def swish(t, dur, gain, seed=0, pan=0.0):
    """skin sliding on skin: a soft brush of air, all of it above 5.2 kHz (it can sit on a word)"""
    m = int(dur * SR)
    y = filt(white(m, 1300 + seed), "highpass", 5200) * np.sin(np.linspace(0, np.pi, m)) ** 1.5
    bed.add(pan_st(fade(y, 0.01, 0.02), pan), t, db(gain))


def shuffle(t, gain, seed=0):
    """a swap: out (swish), one row over, back in (a soft clap under 250 Hz)"""
    swish(t, 0.22, gain, seed, -0.15)
    swish(t + 0.26, 0.2, gain - 1, seed + 1, 0.15)
    low_thud(t + 0.44, gain + 2, 170.0, 0.18, 0.05)


def glints(t, n, gain, seed=0, step=0.045, f0=5800.0, df=320.0, pan=0.0):
    for i in range(n):
        bed.add(pan_st(glint(f0 + df * i, 0.08, seed + i), pan - 0.25 + 0.5 * i / max(1, n - 1)), t + step * i, db(gain))


def soft_clip(y, k=3.0):
    return np.tanh(k * norm(y)) / np.tanh(k)


def thunder_low(t, dur, gain, seed=0):
    bed.add(pan_st(fade(filt(thunder(dur, seed), "lowpass", 240), 0.05, 0.3), 0.1), t, db(gain))


# ================================================================= ambience: rain at night (gone while the sun is out)
sun_off = gate(N, [(c["sun"] + 0.1, c["close"] + 0.3)], 0.25)
rain_on = 1.0 - sun_off
roar = norm(filt(brown(N, 11), "lowpass", 280) * (0.9 + 0.1 * np.sin(2 * np.pi * 0.17 * tt)))
hiss = norm(filt(pink(N, 12), "highpass", 5600))
patter = norm(crackle(N, 38.0, 13, 5400, 11000))
amb.x += pan_st(roar * rain_on, -0.1) * 0.30
amb.x += pan_st(hiss * rain_on, 0.2) * 0.16
bed.x += pan_st(patter * rain_on, 0.25) * db(-29)
thunder_low(0.25, 2.4, -17, 20)                                                      # far off, under the first words
thunder_low(c["everyone"], 2.0, -21, 21)
thunder_low(SHOT["button"] + 0.05, 2.2, -15, 22)                                    # the button: the storm again

# ================================================================= 1. the hook: the clasp, the swap, the sky disapproves
swish(0.02, 0.36, -17, 30)                                                           # frame 1: fingers sliding together
low_thud(c["clasped"], -17, 190.0, 0.16, 0.04)                                       # ...and closed (under "your")
low_thud(c["think"] + 0.05, -20, 150.0, 0.2, 0.06)                                   # a little squeeze on "think"
shuffle(c["swap1"], -16, 31)                                                         # the swap
bed.add(pan_st(fade(filt(creak(0.5, 32, 60, 120), "lowpass", 230), 0.03, 0.08), 0.1), c["cringe"], db(-19))   # fingers squirm (low)
crk = L.crack(0.2, 33) if hasattr(L, "crack") else filt(white(int(0.2 * SR), 33), "bandpass", [900, 6000]) * expdecay(int(0.2 * SR), 0.03)
sfx.add(pan_st(fade(soft_clip(filt(crk, "highpass", 600), 2.5), 0.001, 0.04), 0.4), c["bolt"], db(-12))   # the crack (inside the pause)
thunder_low(c["bolt"] + 0.04, 2.6, -9, 34)                                           # the thunder rolls on under "Feels" (low)

# ================================================================= 2. the seats
bed.add(pan_st(fade(filt(whoosh(0.5, 60, 300, 40), "lowpass", 380), 0.05, 0.1), 0.0), c["push"], db(-14))   # the push into his hands
glints(c["faces"], 7, -19, 41, 0.03)                                                 # ten little faces pop open
shuffle(c["replay0"], -18, 42)                                                       # the move replayed
shuffle(c["replay1"], -16, 44)
hm = slide(392.0, 311.0, 0.24, 0.0, None, 5)
sfx.add(pan_st(fade(soft_clip(hm, 2.0), 0.01, 0.05), 0.1), c["over_end"] + 0.03, db(-15))            # a sly "hmm" (in the pause after "over.")
shuffle(c["swapb"], -16, 46)                                                         # home
glints(c["bliss"] + 0.05, 6, -20, 48, 0.07, 6400.0, 250.0)                           # bliss sparkles (above 5 kHz)
shuffle(c["swapc"], -16, 50)                                                         # and away again
bed.add(pan_st(fade(filt(creak(c["snapeye"] - c["turn"], 52, 40, 80), "lowpass", 220), 0.05, 0.05), 0.0), c["turn"], db(-16))   # heads turning (low)
swish(c["snapeye"], 0.12, -16, 53)                                                   # the side-eye snaps
crk1 = cricket(54, 3, 4900)
sfx.add(pan_st(fade(crk1, 0.003, 0.03), 0.3), c["strangers_end"] + 0.03, db(-15))    # one cricket (in the pause after "strangers.")

# ================================================================= 3. the coin
sfx.add(pan_st(whoosh(0.18, 250, 1500, 60), 0.0), SHOT["coin"] - 0.2, db(-24))       # into the shot (ends before "So")
bed.add(pan_st(glint(7200, 0.12, 61), 0.3), c["flick"], db(-14))                     # the flick: ting (above 5 kHz)
bed.add(pan_st(fade(buzz_hi(c["land"] - c["flick"] - 0.05, 46.0, 62), 0.05, 0.05), 0.2), c["flick"] + 0.03, db(-24))   # it spins
glints(c["pct"], 2, -19, 63, 0.18, 6100.0, 600.0)                                    # 55 % / 44 %
low_thud(c["land"], -9, 120.0, 0.3, 0.07, bus=sfx)                                   # THUP in the mud (after "toss.")
bed.add(pan_st(fade(filt(squelch(0.3, 64), "lowpass", 280), 0.01, 0.08), 0.1), c["land"] + 0.01, db(-14))
for i, dt in enumerate((0.09, 0.2, 0.29, 0.36)):                                     # it wobbles upright: tink tink tink
    tk = glass_tink(65 + i, 3100.0 + 120 * i, 0.08)
    sfx.add(pan_st(fade(soft_clip(tk, 2.2), 0.001, 0.03), 0.1), c["land"] + dt, db(-17 - 2.5 * i))
bed.add(pan_st(glint(7800, 0.12, 69), 0.0), c["onepct"], db(-15))                    # 1 %: NO FAVOURITE
sfx.add(pan_st(whoosh(0.18, 250, 1500, 70), 0.0), SHOT["twins"] - 0.18, db(-24))     # into the twins (ends before "Even")

# ================================================================= 4. the twins
bed.add(pan_st(fade(filt(whoosh(0.4, 60, 300, 80), "lowpass", 380), 0.03, 0.1), 0.5), c["twin_in"], db(-14))   # he slides in
bed.add(pan_st(glint(6900, 0.12, 81), 0.0), c["dnatag"], db(-16))                    # SAME DNA
glints(c["rings"], 2, -16, 82, 0.15, 6300.0, 900.0)                                  # the two rings
dun = pizz(98.0, 0.5, 83)
sfx.add(pan_st(fade(filt(dun, "lowpass", 300), 0.002, 0.1), 0.0), c["thumbs"] + 0.38, db(-10))   # the standoff: dun (after "thumbs")
for i in range(10):                                                                  # 4 IN 10: the pairs pop in
    bed.add(pan_st(glint(5800 + 140 * (i % 5), 0.05, 84 + i), -0.4 + 0.08 * i), c["grid"] + 0.12 + 0.045 * i, db(-24))
sfx.add(pan_st(whoosh(0.2, 250, 1500, 95), 0.0), SHOT["button"] - 0.22, db(-24))     # back to him (ends before "So")

# ================================================================= 5. the button: his own thumb, the sun, the clouds close
bed.add(pan_st(fade(filt(creak(c["swapd"] - c["so2"], 100, 50, 90), "lowpass", 220), 0.1, 0.1), 0.0), c["so2"], db(-18))   # squirming fingers (low)
shuffle(c["swapd"], -15, 101)                                                        # his own way again
glints(c["sun"], 9, -18, 102, 0.05, 5600.0, 300.0)                                   # the clouds part
for i, dt in enumerate((0.03, 0.17)):                                                # birds (in the pause after "thumb.")
    sfx.add(pan_st(fade(tweet(103 + i, 3600.0 + 300 * i), 0.002, 0.02), 0.5 - 0.6 * i), c["thumb2_end"] + dt, db(-21))
bed.add(pan_st(glint(8000, 0.12, 105), 0.0), c["wink"] + 0.05, db(-16))              # the smug little grin: ting
thunder_low(c["close"] - 0.05, 1.6, -9, 106)                                         # the clouds slam shut
bwomp(mus, c["case_end"] + 0.06, 33, -12)                                            # womp (after "case.")

# ================================================================= score (drops out for every punchline)
drone(mus, 0.05, c["bolt"] - 0.05, [48, 55, 60, 64], cutoff=900, gain=-24, seed=200, swell=0.5)          # a hymn while he prays
groove(mus, c["feels"] + 0.25, c["over"] - 0.1, 108, ["Dm", "G", "C", "A"], gain=-13, seed=201, kick_on=False, snaps=True)   # sneaky
groove(mus, c["swap2"] + 0.3, c["home_end"], 96, ["F", "C"], gain=-15, seed=202, kick_on=False, snaps=False, padv=True)      # home
drone(mus, c["swap3"] + 0.25, c["strangers"] - 0.05, [38, 45, 50, 53], cutoff=520, gain=-23, seed=203, swell=0.6)             # uh-oh
groove(mus, c["so1"] + 0.2, c["land"] - 0.05, 116, ["C", "Am", "F", "G"], gain=-14, seed=204, kick_on=False, snaps=True, arp=True)
groove(mus, c["even"] + 0.2, c["thumbs"] + 0.3, 104, ["Am", "E"], gain=-14, seed=205, kick_on=False, snaps=True)           # standoff
groove(mus, c["four"] + 0.15, c["ten_end"], 104, ["Am", "E"], gain=-16, seed=206, kick_on=False, snaps=False)
drone(mus, c["so2"] + 0.1, c["sun"] - 0.05, [48, 55, 60, 63], cutoff=800, gain=-24, seed=207, swell=0.4)                   # the hymn, uneasy
drone(mus, c["sun"], c["just"] - 0.04, [48, 55, 60, 64, 67, 72], cutoff=1900, gain=-19, seed=208, swell=0.5)                  # the sun: a major swell
silence(mus, [(c["bolt"] - 0.05, c["feels"] + 0.25), (c["over"] - 0.1, c["swap2"] + 0.3), (c["home_end"], c["swap3"] + 0.25),
              (c["strangers"] - 0.05, c["so1"] + 0.2), (c["land"] - 0.05, c["even"] + 0.2), (c["thumbs"] + 0.3, c["four"] + 0.15),
              (c["ten_end"], c["so2"] + 0.1), (c["just"] - 0.04, c["case_end"] + 0.06)])
silence(mus, [(c["case_end"] + 0.6, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -11.5, "sfx": -12.0}, duck={"music": 0.72})
