"""Which EYE is your boss? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()
c = C

SFX_LEVEL = -11.0   # the whole sfx bus (house: -5); the gags against each other are in G
# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(arrive=-21, tink=-24, blink=-27, swap=-24, boing=-18, pop=-24, tada=-19, clip=-22, wah=-21, dive=-23, crt=-27,
         neq=-23, lock=-27, powerdown=-22, ding=-21, slam=-15, rattle=-23, riser=-25, whoomp=-19, jump=-23, pen=-27,
         buzzer=-23, flip=-26, wink=-19, lift=-23)


def swap_flick(seed=0):
    """the eyes swapping: a tiny dry flick, almost all of it above 5 kHz (it can sit under a word; mono, 0.07 s)"""
    n = int(0.07 * SR)
    y = filt(white(n, seed), "highpass", 5200) * expdecay(n, 0.012)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0005, 0.01)


def thud_low(seed=0, f=70.0):
    """a heavy landing heard through the floor: all of it under ~250 Hz (it can sit on a word; mono, 0.3 s)"""
    n = int(0.3 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


# ================================================================= ambience: the hill at night, the control room
hill_on = gate(N, [(0, SHOT["inside"] + 0.5), (SHOT["stats"] - 0.05, DUR)])
amb.x += pan_st(filt(brown(N, 3), "lowpass", 240), 0) * 0.45 * hill_on                    # the wind on the hill
crickets(0.0, SHOT["inside"] + 0.4, bed, db(-31), seed=5, f=4700, rate=1.1)
crickets(SHOT["stats"], DUR, bed, db(-31), seed=6, f=4700, rate=1.1)
room_on = gate(N, [(SHOT["inside"] + 0.4, C["picture_end"])])
amb.x += pan_st(filt(brown(N, 7), "lowpass", 160), 0) * 0.5 * room_on                    # the hum of the control room
pov_on = gate(N, [(C["picture_end"], SHOT["stats"])])
amb.x += pan_st(filt(brown(N, 8), "lowpass", 240), 0) * 0.4 * pov_on

# ================================================================= the hook: the finger at the moon, one eye shut
bed.add(pan_st(filt(whoosh(0.16, 600, 9000, 11, 0.9), "highpass", 5200), -0.3), 0.0, db(G["arrive"]))   # frame 0: the arm lands
bed.add(pan_st(glint(6400, 0.1, 12), -0.4), C["something"] + 0.02, db(G["tink"]))       # the fingertip meets the moon
bed.add(pan_st(glint(7300, 0.08, 13), -0.4), C["something"] + 0.09, db(G["tink"] - 3))
bed.add(pan_st(swap_flick(14), 0.2), C["shut1"] + 0.05, db(G["blink"]))                  # one eye shuts
sfx.add(pan_st(whoosh(0.26, 500, 2600, 15, 0.8), 0), SHOT["pov"] - 0.2, db(-22))          # into his eyes

# ================================================================= what he sees: the finger jumps
swaps = [C["now"] + 0.16, C["jumped_end"] - 0.42, C["jumped_end"] + 0.02]
for i, s in enumerate(swaps):
    bed.add(pan_st(swap_flick(20 + i), 0), s - 0.04, db(G["swap"]))
sfx.add(pan_st(filt(boing(0.22, 260.0, 23), "highpass", 4800), 0.2), swaps[0] + 0.02, db(G["swap"]))   # the first jump: a thin zip under "the other"
sfx.add(pan_st(blip(600, 1400, 0.07, 24, 0.02), 0.3), C["jumped"] - 0.04, db(G["pop"] - 4))   # JUMP! pops on
sfx.add(pan_st(boing(0.32, 200.0, 25), 0.2), C["jumped_end"] + 0.05, db(G["boing"]))      # after "JUMPED!": boing (the last swap)

# ================================================================= the answer: boss and intern
sfx.add(pan_st(whoosh(0.28, 400, 2200, 30, 0.8), 0), SHOT["boss"] - 0.18, db(-23))
sfx.add(pan_st(filt(whoosh(0.4, 200, 800, 31, 0.6), "lowpass", 300), -0.3), C["relax"] + 0.05, db(-24))   # the arm comes down
bed.add(pan_st(glint(6800, 0.1, 32), -0.3), C["boss1"] + 0.05, db(G["tink"]))            # the crown lands
for i, m in enumerate((72, 76, 79)):                                                      # ta-da, in the pause after "boss"
    sfx.add(pan_st(piano(mtof(m), 0.32, 33 + i, 1.1), -0.2), C["boss1_end"] + 0.03 + 0.06 * i, db(G["tada"] - 2))
sfx.add(pan_st(piano(mtof(84), 0.5, 37, 1.1), -0.2), C["boss1_end"] + 0.21, db(G["tada"]))
sfx.add(pan_st(lock_snap(38), 0.3), C["intern1_end"] + 0.03, db(G["clip"]))              # the badge clips on
sfx.add(pan_st(slide(300, 250, 0.34, vib=0.5, harm=5), 0.2), C["intern1_end"] + 0.12, db(G["wah"]))   # the intern: hmm

# ================================================================= inside: two pictures, the brain aims with one
sfx.add(pan_st(filt(whoosh(0.8, 200, 900, 40, 0.8), "lowpass", 320), 0), SHOT["inside"] - 0.05, db(G["dive"]))   # the dive (low: under the words)
bed.add(pan_st(glint(5900, 0.12, 41), -0.4), C["sees"] - 0.1, db(G["crt"]))              # the screens come on
bed.add(pan_st(glint(6300, 0.12, 42), 0.4), C["sees"] + 0.08, db(G["crt"]))
bed.add(pan_st(filt(tv_static(0.12, 43), "highpass", 5200), 0), C["sees"] - 0.08, db(G["crt"] - 3))
sfx.add(pan_st(ding(79, 0.12, 44), 0), C["spot_end"] + 0.02, db(G["neq"]))              # the not-equal sign, in the gap
for i in range(3):                                                                         # the reticle tightens on the boss
    bed.add(pan_st(glint(6000 + 500 * i, 0.06, 45 + i), -0.4), C["aims"] + 0.06 + 0.08 * i, db(G["lock"]))
sfx.add(pan_st(slide(520, 180, 0.32, vib=0.0, harm=4), 0.4), C["one2_end"] + 0.03, db(G["powerdown"]))   # the intern's screen dims
sfx.add(pan_st(ding(84, 0.13, 49), -0.2), C["boss2_end"] + 0.03, db(G["ding"]))           # thumbs up

# ================================================================= the payoff: SLAM, the intern's picture, jump
slamT = C["shut2"] + 0.2
bed.add(pan_st(ratchet(0.2, 30.0, 60.0, 50, edges=True), -0.3), C["shut2"] - 0.02, db(G["rattle"]))   # the shutter rolls down
sfx.add(pan_st(thud_low(51), -0.3), slamT, db(G["slam"]))                                 # SLAM (low: it sits on "the boss")
bed.add(pan_st(jingle(0.3, 52, 30), -0.3), C["boss3_end"] + 0.0, db(-29))                  # the CLOSED sign swings
bed.add(pan_st(glint(6200, 0.1, 53), 0.4), C["and_get"] + 0.1, db(G["crt"]))              # the intern wakes up
bed.add(pan_st(riser(1.0, 54, 1500, 6000), 0), C["interns"] - 0.02, db(G["riser"]))   # the push into the screen
sfx.add(pan_st(whoosh(0.3, 300, 3000, 55, 0.9), 0), C["picture_end"] - 0.06, db(G["whoomp"]))   # into the picture (in the gap)
sfx.add(pan_st(slide_whistle(0.22, 700, 1700), 0.2), C["jump_end"] + 0.02, db(G["jump"]))   # after "jump.": the finger leaps
sfx.add(pan_st(boing(0.3, 180.0, 56), 0.2), C["jump_end"] + 0.22, db(G["boing"] - 2))

# ================================================================= two in three: the line-up
sfx.add(pan_st(whoosh(0.24, 400, 2400, 60, 0.8), 0), SHOT["stats"] - 0.3, db(-24))
for i, tp in enumerate((C["two"] - 0.05, C["two"] + 0.12, C["three"])):                    # three of us pop in (quiet, on words)
    bed.add(pan_st(glint(5800 + 500 * i, 0.07, 61 + i), -0.5 + 0.5 * i), tp, db(G["pop"] - 2))
for i, tc in enumerate((C["right"] - 0.05, C["right"] + 0.15, C["boss4"] - 0.05)):         # crowns land
    bed.add(pan_st(glint(6400 + 400 * i, 0.09, 64 + i), -0.5 + 0.5 * i), tc + 0.2, db(G["tink"]))
sfx.add(pan_st(ding(76, 0.12, 67), -0.4), C["boss4_end"] + 0.03, db(G["ding"] - 1))       # ding, ding... dong (the odd one out)
sfx.add(pan_st(ding(76, 0.12, 68), 0.0), C["boss4_end"] + 0.16, db(G["ding"] - 1))
sfx.add(pan_st(ding(69, 0.18, 69), 0.4), C["boss4_end"] + 0.30, db(G["ding"]))
for i in range(3):                                                                         # the pencils
    bed.add(pan_st(pen_tick(70 + i), -0.5 + 0.5 * i), C["match"] - 0.1 + 0.2 * i + 0.15, db(G["pen"]))
hk = C["hand_end"] + 0.02                                                                  # tick, BZZT, tick
sfx.add(pan_st(ding(84, 0.1, 73), -0.5), hk, db(G["ding"]))
sfx.add(pan_st(buzzer(0.2), 0), hk + 0.14, db(G["buzzer"]))
sfx.add(pan_st(ding(84, 0.1, 74), 0.5), hk + 0.42, db(G["ding"]))

# ================================================================= the button and the loop
sfx.add(pan_st(whoosh(0.22, 400, 2400, 80, 0.8), 0), SHOT["button"] - 0.3, db(-24))
bed.add(pan_st(swap_flick(81), 0.3), C["still"] + 0.12, db(G["flip"]))                   # the badge turns over
sfx.add(pan_st(ding(88, 0.12, 82), 0.3), C["depth_end"] + 0.03, db(G["ding"] - 1))        # DEPTH
for i, f in enumerate((5600, 6400, 7200, 8000)):                                          # the wink: a sparkle, after the word
    bed.add(pan_st(glint(f, 0.09, 83 + i), 0.35), C["winking_end"] + 0.02 + 0.045 * i, db(G["wink"] - 4))
sfx.add(pan_st(ding(91, 0.16, 88, 1.4), 0.35), C["winking_end"] + 0.04, db(G["wink"]))
sfx.add(pan_st(whoosh(0.5, 300, 2400, 90, 0.7), -0.3), DUR - 0.62, db(G["lift"]))         # the arm rises into frame 0

# ================================================================= score (drops out for every punchline)
BPM = 108
CH = ["Am", "F", "C", "G"]
# the answer: a light pizzicato/marimba groove from after "Relax." (no score under the hook or the jump)
groove(mus, C["relax_end"] + 0.1, C["intern1_end"] + 0.05, BPM, CH, gain=-6, seed=10, kick_on=False)
# inside: fuller, from "Each eye"
groove(mus, C["each"] + 0.3, C["boss2_end"] + 0.4, BPM, CH, gain=-5, seed=20, arp=False)
# the line-up: a sneaky walk
groove(mus, C["two"] + 0.4, C["hand_end"], BPM, ["Am", "Dm", "E", "Am"], gain=-7, seed=30, kick_on=False, snaps=True)
# the button: thinner, out before the wink
groove(mus, SHOT["button"] + 0.25, C["and_wink"] - 0.1, BPM, ["F", "C"], gain=-9, seed=40, kick_on=False, snaps=False)
silence(mus, [(C["boss1_end"] - 0.05, C["others"] + 0.15),          # ta-da
              (C["intern1_end"] - 0.05, C["each"] + 0.3),           # the badge, then the dive
              (C["boss2_end"] - 0.05, C["shut2"] + 0.1),            # thumbs up
              (C["picture_end"] - 0.1, C["two"] + 0.4),             # the jump
              (C["boss4_end"] - 0.05, C["and_it"] + 0.1),           # ding ding dong
              (C["hand_end"] - 0.05, SHOT["button"] + 0.25),        # tick BZZT tick
              (C["and_wink"] - 0.1, DUR)])                          # the wink, into the loop
bwomp(mus, C["boss3"] + 0.05, m=33, gain=-18)                       # the boss is shut: a low blat under the slam

# ================================================================= voice + mix
# the gags sat at -15...-18 dB in their gaps with the voice at -16.5 (round 1); the house target is -19...-24
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
