"""Why Do Onions Make You CRY? Short: sound design, score and mix, cue-locked to timeline.json.

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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C

# ================================================================= ambience (one bed per world, gated to its shots)
kitchen = [(0, SHOT["trap"] + 0.9), (SHOT["bless"], END["bless"]), (SHOT["eyes"], c["lands"] + 0.35), (SHOT["rinse"], END["rinse"]), (SHOT["blunt"], DUR)]
k_on = gate(N, kitchen)
room = pan_st(filt(brown(N, 1), "lowpass", 220), 0) * 0.3 + np.stack([filt(pink(N, s), "bandpass", [300, 1800]) for s in (2, 3)]) * 0.03
k_on = k_on * (1 - 0.6 * gate(N, [(c["tomorrow"] - 0.3, DUR)]))
amb.x += room * 0.6 * k_on
fridge = buzz(N, 60, 4, 0.2) * 0.04
amb.x += pan_st(filt(fridge, "lowpass", 400), -0.5) * k_on
cell_on = gate(N, [(SHOT["trap"] + 0.9, END["name"])])
goo = filt(pink(N, 12), "bandpass", [60, 300]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * tt))
amb.x += pan_st(goo, 0) * 0.45 * cell_on
eye_on = gate(N, [(c["lands"] + 0.35, END["brain"])])
amb.x += pan_st(filt(brown(N, 14), "lowpass", 140), 0) * 0.22 * eye_on
lab_on = gate(N, [(SHOT["spray"], END["spray"])])
amb.x += pan_st(filt(pink(N, 15), "bandpass", [80, 900]) * 0.18 + buzz(N, 120, 16, 0.1) * 0.03, 0) * lab_on

# ================================================================= 1. the hook: TV-chef chopping (sound on frame 1)
sfx.add(pan_st(whoosh(0.2, 300, 2400, 20, 0.9), 0), 0.0, db(-21))
hits = [0.12, 0.5, 0.88, 1.26, 1.64, 2.0] + list(c["chops"])
rate = 3.2
tk = 0.3
while tk < c["suddenly"] - 0.05:                     # the continuous knife rhythm under the words
    r_ = 3.2 if tk < c["chops"][0] else 4.2
    sfx.add(chop(int(tk * 100)), tk + 0.35 / r_ * 0.9, db(-21), pan=0.25)
    tk += 1 / r_
for k, h in enumerate(c["chops"]):                   # the three spoken chops land hard, after each word
    sfx.add(chop(300 + k, 1.4), h + 0.18, db(-11), pan=0.2)
sfx.add(pan_st(slide_whistle(0.25, 700, 1900), 0.2), c["chef"] + 0.5, db(-25))      # the chef hat: after "chef"
sfx.add(blip(900, 1600, 0.08, 31, 0.03), c["chef"] + 0.72, db(-22))
n = int((c["sobbing"] - 2.4) * SR)
sniff = filt(white(n, 33), "bandpass", [2000, 6000]) * (np.sin(2 * np.pi * 2.2 * ar(n)) > 0.6) * np.linspace(0, 1, n)
sfx.add(pan_st(fade(sniff, 0.05, 0.05), 0), 2.4, db(-30))
sfx.add(pan_st(riser(c["sobbing"] - c["suddenly"] + 0.1, 34, 300, 1500), 0), c["suddenly"] - 0.1, db(-28))

# ================================================================= 2. SOBBING
sb = SHOT["sob"]
sfx.add(thump(0.6, 150, 45, 0.2), sb, db(-8))
sfx.add(np.stack([splash(1.0, 40, 0.9), splash(1.0, 41, 0.9)]), c["sobbing_end"] + 0.02, db(-12))
for k in range(8):
    sfx.add(drip(42 + k, 1300 + 90 * k), c["sobbing_end"] + 0.1 + k * 0.14, db(-22), pan=(-1) ** k * 0.5)

# ================================================================= 3. it's an onion. nobody died.
sfx.add(pan_st(scratch(0.3, 50), 0), SHOT["react"] - 0.3, db(-20))                # record scratch into the deadpan
crickets(c["died_end"] + 0.1, END["react"], amb, db(-22), 51)
for k in range(3):
    sfx.add(drip(52 + k, 1500), SHOT["react"] + 0.3 + k * 0.6, db(-21), pan=-0.2)
sfx.add(blip(1400, 1900, 0.06, 53, 0.02), c["died_end"] + 0.15, db(-19))           # the onion winks: a tiny ting
sfx.add(bell(mtof(96), 0.6, 0.2) * 0.5, c["died_end"] + 0.17, db(-24))

# ================================================================= 4. booby trap
tp = SHOT["trap"]
dive = c["every"] - 0.15
sfx.add(pan_st(whoosh(0.7, 2600, 200, 60, 0.8, 0.7), 0), dive - 0.55, db(-12))
sfx.add(bloop(150, 45, 0.6), dive, db(-10))
sfx.add(pan_st(riser(0.7, 61, 200, 700), 0), c["heres"] - 0.05, db(-26))             # the evil onion grin
for k in range(4):
    sfx.add(blip(1800, 1800, 0.05, 62 + k, 0.02), c["booby"] + 0.15 + k * 0.22, db(-22), pan=(-1) ** k * 0.4)  # warning lights
n = int(0.8 * SR)
fuse = crackle(n, 1800, 66, 2500, 9000) * np.linspace(1, 0.5, n)
sfx.add(pan_st(fade(fuse, 0.02, 0.1), 0), c["tiny"], db(-24))

# ================================================================= 5. two rooms, the knife smashes the wall
sfx.add(bell(mtof(81), 0.8, 0.3) * 0.5, c["separate"] - 0.5, db(-29), pan=-0.4)
sfx.add(bell(mtof(84), 0.8, 0.3) * 0.5, c["chemicals"] + 0.35, db(-24), pan=0.4)
sfx.add(pan_st(whoosh(0.5, 400, 3000, 70, 0.8), 0), c["knife1"] - 0.1, db(-14))
sm = c["smashes"] + 0.12
sfx.add(thump(0.7, 130, 40, 0.25), sm, db(-6))
sfx.add(pan_st(crack(0.5, 71, 0.07, 700), 0), sm + 0.01, db(-16))
sfx.add(np.stack([squelch(0.6, 72), squelch(0.6, 73)]), sm + 0.03, db(-14))
sfx.add(np.stack([splash(0.8, 74, 0.6), splash(0.8, 75, 0.6)]), sm + 0.1, db(-20))

# ================================================================= 6. the enzymes: chomp -> sulfur compound, then #2 -> tear gas
for k in range(3):
    sfx.add(chomp(80 + k), c["enzyme1"] + 0.35 + k * 0.33, db(-17 - 2 * k), pan=-0.3)
sfx.add(blip(500, 1100, 0.12, 84, 0.05), c["compound"] + 0.55, db(-20))
sfx.add(pan_st(slide_whistle(0.3, 600, 1500), 0.5), c["second"] - 0.15, db(-22))      # enzyme #2 skids in
sfx.add(thump(0.35, 200, 90, 0.08), c["second"] + 0.25, db(-13), pan=0.4)
for k in range(4):
    sfx.add(chomp(90 + k), c["turns"] + 0.05 + k * 0.25, db(-18), pan=0.3)
sfx.add(pan_st(gas_hiss(1.6, 95), 0), c["into"] + 0.1, db(-20))
tg = c["gas"] + 0.35                                    # the TEAR GAS sting, after the word
sfx.add(thump(0.5, 110, 40, 0.2), c["tear"] - 0.02, db(-12))

# ================================================================= 7. the long name, bless you
nm = SHOT["name"]
sfx.add(pan_st(whoosh(0.35, 2400, 400, 100, 0.7), 0), nm - 0.25, db(-18))
for k in range(18):                                      # typewriter keys while she says it
    sfx.add(pen_tick(101 + k), c["prop"] - 0.05 + k * (c["soxide_end"] - c["prop"]) / 18, db(-24), pan=-0.3 + 0.6 * (k % 3) / 2)
sfx.add(bell(mtof(88), 0.9, 0.3) * 0.4, c["soxide_end"] + 0.1, db(-24))
bl = SHOT["bless"]
sfx.add(blip(300, 700, 0.12, 110, 0.05), bl + 0.02, db(-17))                          # tissue box slides up
sfx.add(np.stack([rustle(0.3, 111), rustle(0.3, 112)]), c["bless_end"] + 0.05, db(-15))  # fwip: the tissue pops

# ================================================================= 8/9. gas floats up, lands, pings, DANGER, flood
sfx.add(pan_st(gas_hiss(1.4, 120), np.linspace(-0.2, 0.2, int(1.4 * SR))), c["floats"] - 0.1, db(-22))
sfx.add(pan_st(whoosh(0.4, 3000, 300, 121, 0.7, 0.8), 0), c["lands"] + 0.05, db(-15))
for k in range(5):
    sfx.add(blip(1600 + 120 * k, 1400 + 120 * k, 0.05, 122 + k, 0.02), c["lands"] + 0.45 + k * 0.1, db(-23), pan=-0.4 + 0.2 * k)
n = int(1.1 * SR)
zap = glide(900, 2600, 1.1, 0.8) * 0.35 + crackle(n, 1500, 128, 1500, 8000) * 0.6
sfx.add(pan_st(fade(filt(zap, "highpass", 2000) * np.linspace(1, 0.3, n), 0.01, 0.1), np.linspace(0, -0.8, n)), c["pings"] + 0.1, db(-19))
for k in range(3):
    sfx.add(blip(2400, 2400, 0.05, 129 + k, 0.02), c["pings"] + 0.05 + k * 0.12, db(-21))
sfx.add(pan_st(filt(siren(c["floods"] - c["yells"] + 0.1, 130), "lowpass", 1400), 0), c["yells"] - 0.05, db(-33))
sfx.add(pan_st(klaxon(0.35, 131), 0), c["danger"] + 0.5, db(-24))                      # after the word
fl = c["floods"]
sfx.add(np.stack([gurgle(1.6, 132, 20), gurgle(1.6, 133, 20)]), fl + 0.05, db(-28))
sfx.add(np.stack([splash(1.2, 134, 0.8), splash(1.2, 135, 0.8)]), c["wash"] + 0.1, db(-19))

# ================================================================= 10. you're... rinsing (washing-machine gag)
ri = c["rinsing"]
n = int(max(0.3, SHOT["spray"] + 0.05 - (ri + 0.55)) * SR)
wash_ = svf_bp(pink(n, 140), 400 + 250 * np.sin(2 * np.pi * 2.5 * ar(n)), 0.4)
sfx.add(pan_st(fade(wash_ / (np.abs(wash_).max() + 1e-9) * 0.6, 0.1, 0.3), 0), ri + 0.55, db(-20))
sfx.add(np.stack([gurgle(0.4, 141, 28), gurgle(0.4, 142, 28)]), ri + 0.55, db(-24))
for j, m in enumerate((84, 88, 91)):                                                     # the machine's done-jingle
    sfx.add(bell(mtof(m), 0.4, 0.08) * 0.5, c["rinsing_end"] + 0.02 + j * 0.09, db(-28))

# ================================================================= 11. high-speed camera: the droplet outburst
sp = SHOT["spray"]
sfx.add(pan_st(whoosh(0.3, 400, 2800, 150, 0.8), 0), sp - 0.3, db(-19))
sfx.add(shutter(), c["weirder"] + 0.6, db(-19), pan=0.3)
n = int((c["spraying"] - c["highspeed"]) * SR)
motor = buzz(n, 90, 151, 0.2) * np.linspace(0.3, 1, n)
sfx.add(pan_st(fade(filt(motor, "lowpass", 600), 0.1, 0.05), 0), c["highspeed"], db(-28))
hit = c["spraying"] - 0.1
sfx.add(thump(0.8, 90, 30, 0.35), hit, db(-10))                                          # slow-motion impact
sfx.add(pan_st(filt(gas_hiss(2.4, 152), "lowpass", 5000), 0), hit + 0.05, db(-18))
for k in range(10):
    sfx.add(drip(153 + k, 900 + 70 * k), hit + 0.4 + k * 0.28, db(-24), pan=(-1) ** k * 0.4)
sfx.add(pan_st(riser(c["sixty"] - hit + 0.2, 160, 250, 1400), 0), hit, db(-25))
sfx.add(bell(mtof(91), 1.2, 0.4) * 0.5, c["high"] + 0.45, db(-20))                      # the record: after "high!"
sfx.add(thump(0.4, 180, 90, 0.08), c["high"] + 0.45, db(-15))

# ================================================================= 12. blunt knife squish, then the TV chef again
sfx.add(pan_st(whoosh(0.3, 2400, 400, 170, 0.7), 0), SHOT["blunt"] - 0.25, db(-18))
sfx.add(np.stack([squelch(0.3, 171), squelch(0.3, 172)]), c["or_chop"] - 0.34, db(-16))
sfx.add(pan_st(creak(0.6, 173, 80, 160), 0), c["blunt"] + 0.1, db(-20))
tk = c["or_chop"] + 0.3
while tk < c["more"] + 0.3:
    sfx.add(chop(int(tk * 100) + 7), tk, db(-22), pan=0.25)
    tk += 1 / 6
sfx.add(pan_st(gas_hiss(1.6, 174), 0), c["sprays"], db(-22))
sfx.add(np.stack([splash(1.0, 175, 1.0), splash(1.0, 176, 1.0)]), c["more"] + 0.45, db(-11))  # after MORE

# ================================================================= 13. button: sharp knife, slow cuts... the onion wins
bt = SHOT["button"]
sfx.add(pan_st(scratch(0.3, 180), 0), bt - 0.1, db(-19))
for j, m in enumerate((96, 100, 103)):                                                     # the knife gleam
    sfx.add(bell(mtof(m), 0.7, 0.2) * 0.4, c["sharp"] + 0.25 + j * 0.05, db(-23), pan=0.3)
sfx.add(chop(181, 0.6), c["cuts"] + 0.45, db(-16), pan=0.2)                                # one slow, careful cut
sfx.add(np.stack([splash(0.9, 182, 0.7), splash(0.9, 183, 0.7)]), c["or_just"] + 0.25, db(-18))  # he gives up: tears
sfx.add(pan_st(drumroll(max(0.3, c["win"] - c["onion_win"] + 0.2), 184), 0), c["onion_win"] - 0.2, db(-24))

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# quiet on purpose: it sits under the spoken subscribe line and must not mask the word.
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-20))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-22))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-22))
        sfx.add(pan_st(bell(1760, 1.2, 0.5), 0), c["sub_tap"] + 0.08, db(-27))

# generic whooshes on cuts without their own transition sound
for wi, sid in enumerate(("rooms", "mix", "eyes", "brain", "rinse")):
    sfx.add(pan_st(whoosh(0.28, 400 + 150 * (wi % 4), 2400, 500 + wi), 0), SHOT[sid] - (0.4 if sid == "rooms" else 0.2), db(-19 - (4 if sid == "rooms" else 0)))

# ================================================================= score (drops out for every punchline)
BPM = 116
groove(mus, 0.0, c["suddenly"], BPM, ["C", "F", "G", "C"], gain=-6, seed=10)                      # bouncy cooking-show
drone(mus, c["suddenly"] - 0.1, SHOT["sob"] + 0.2, [48, 55, 60], 1400, -25, 11, 0.4)
crash(mus, SHOT["sob"], -18, 12)
drone(mus, SHOT["sob"], END["sob"], [52, 55, 59, 64], 1800, -22, 13, 0.1)                          # the sob sting
groove(mus, SHOT["trap"] + 0.4, c["trap_w"] + 0.3, 104, ["Am", "F", "E", "Am"], gain=-5, seed=20, kick_on=False, snaps=True)  # sneaky
groove(mus, c["chemicals"] + 0.5, c["smashes"], 104, ["Am", "Dm", "E", "Am"], gain=-5, seed=30, kick_on=False)
crash(mus, c["smashes"] + 0.12, -16, 31)
groove(mus, SHOT["mix"] + 0.2, c["tear"] - 0.05, 120, ["Dm", "Bb", "C", "A"], gain=-7, seed=40, sixteen=True)   # the chemistry drive
drone(mus, c["tear"] - 0.05, END["mix"], [38, 45, 50], 700, -21, 41, 0.1)
bwomp(mus, c["gas"] + 0.35, 31, -13)
groove(mus, SHOT["name"] + 0.1, c["soxide_end"] + 0.1, 100, ["F", "Dm"], gain=-8, seed=50, kick_on=False, snaps=False, bass=False)
groove(mus, SHOT["eyes"] + 0.3, c["yells"] - 0.1, 112, ["Em", "C", "D", "B"], gain=-7, seed=60, snaps=False)
drone(mus, c["yells"] - 0.1, c["floods"], [40, 47, 52], 900, -21, 61, 0.1)
drone(mus, c["floods"], END["brain"], [60, 64, 67, 72], 2400, -24, 62, 0.4)                          # relief as it washes
groove(mus, c["highspeed"] + 0.4, c["high"] + 0.4, 96, ["Am", "F", "C", "G"], gain=-7, seed=70, kick_on=False, snaps=False, cutoff=2400)
crash(mus, c["high"] + 0.45, -19, 71)
groove(mus, SHOT["blunt"] + 0.1, c["more"], 132, ["C", "F", "G", "C"], gain=-7, seed=80)                # the frantic chef
groove(mus, SHOT["button"] + 0.2, c["or_just"], 108, ["F", "C"], gain=-6, seed=90, kick_on=False, snaps=False)
crash(mus, c["win"] + 0.35, -18, 91)
for j, m in enumerate((60, 64, 67, 72)):                                                            # fanfare for the onion
    mus.add(pad([mtof(m)], 1.4, 0.01, 2400, 92 + j), c["win"] + 0.35 + j * 0.02, db(-21), pan=(j - 1.5) * 0.3)
groove(mus, c["yawning"] + 1.4, DUR - 0.1, 112, ["C", "F", "G", "C"], gain=-13, seed=100, kick_on=False)   # quiet under the sub line
# comedy stops: the score drops out for "Nobody died", "Bless you", "rinsing", "MORE" and "let the onion win"
silence(mus, [(SHOT["react"] - 0.05, END["react"]), (c["soxide_end"] + 0.1, END["bless"]), (c["youre2"] - 0.1, c["rinsing_end"] + 0.4),
              (c["more"] - 0.1, END["blunt"]), (c["or_just"], c["win"] + 0.33)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
