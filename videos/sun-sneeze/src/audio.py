"""Why Does the SUN Make You SNEEZE? Short: sound design, score and mix, cue-locked to timeline.json.

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


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def achoo(t, seed, f0=290.0, gain=-2.0, pan=0.0, hit=-10.0):
    """ah-CHOO with its CHOO landing at t (the atom's burst sits 0.13 s in), and a chest thump under it"""
    sfx.add(pan_st(sneeze(seed, f0), pan), t - 0.13, db(gain))
    if hit is not None:
        sfx.add(thump(0.25, 160, 60, 0.07), t + 0.01, db(hit))


STREET = ("hook", "bless", "onein4", "button")
INSIDE = ("why", "mech", "fire")

# ================================================================= ambience (one bed per world, gated to its shots)
# the street: a far city hum, all under ~400 Hz, and sparrows only in the gaps
hum = filt(brown(N, 1), "lowpass", 380)
amb.x += pan_st(hum / (np.abs(hum).max() + 1e-9), 0) * 0.5 * gate(N, on(*STREET))
# inside his head: muffled, a slow warm pulse
pulse = filt(pink(N, 4), "bandpass", [45, 260]) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.9 * tt) ** 2)
amb.x += pan_st(pulse / (np.abs(pulse).max() + 1e-9), 0) * 0.55 * gate(N, on(*INSIDE))
# the living room and the doctor's office: a quiet room, and (the office) a wall clock
room = filt(brown(N, 7), "lowpass", 200)
amb.x += pan_st(room / (np.abs(room).max() + 1e-9), 0) * 0.3 * gate(N, on("family", "card"))

# ================================================================= 1. hook: the door bursts open; the sun; ah ... ah ... ACHOO, ACHOO
sfx.add(thump(0.3, 150, 52, 0.09), 0.0, db(-9))                                        # frame 1: the door flies open
sfx.add(pan_st(filt(whoosh(0.3, 300, 1800, 10, 0.8), "lowpass", 2200), -0.2), 0.0, db(-18))
film = pad([mtof(m) for m in (50, 57, 62, 66)], 1.3, 0.02, 520, 11)                    # the film's last chord, leaking out of the foyer
sfx.add(pan_st(fade(film * np.linspace(1, 0, len(film)) ** 1.5, 0.005, 0.2), -0.3), 0.0, db(-22))
# the light: a thin shimmer that climbs while she says "into the sun, and—"
sfx.add(pan_st(riser(c["achoo1"] - c["into"] + 0.05, 12, 500, 2400), 0.2), c["into"] - 0.05, db(-30))
sfx.add(pan_st(bell(2093, 0.5, 0.2) * 0.5, 0.2), c["prickle"], db(-30))                # the prickle in his nose
sfx.add(pan_st(bell(2349, 0.4, 0.16) * 0.5, 0.2), c["tingle"], db(-30))
for k, tk in enumerate((c["windup"], c["windup"] + 0.3)):                              # ah ... ah ...
    sfx.add(pan_st(filt(breath(0.2, 13 + k), "highpass", 900), 0), tk, db(-31 + 3 * k))
achoo(c["achoo1"], 15, 290, -2.0)
pops(c["achoo1"] + 0.08 + np.array([0.0, 0.07, 0.15, 0.26]), sfx, db(-18), 16)         # the popcorn goes up
for k, tk in enumerate((c["achoo2"] - 0.42, c["achoo2"] - 0.22)):
    sfx.add(pan_st(filt(breath(0.14, 17 + k), "highpass", 900), 0), tk, db(-27))
achoo(c["achoo2"], 19, 268, -1.0, hit=-8.0)
pops(c["achoo2"] + 0.07 + np.array([0.0, 0.05, 0.11, 0.2, 0.31, 0.44]), sfx, db(-17), 20)
sfx.add(pan_st(filt(buzz(int(0.35 * SR), 110, 21, 0.7), "lowpass", 900), -0.4), c["achoo2"] + 0.1, db(-30))   # the neon sign flickers

# ================================================================= 2. bless: the stare ... "Bless you." ... it's not a cold
sfx.add(pan_st(tweet(22), 0.5), SHOT["bless"] + 0.06, db(-27))                         # silence, and one sparrow
sfx.add(pan_st(filt(breath(0.16, 23), "highpass", 900), 0), SHOT["bless"] + 0.3, db(-24))   # sniff
sfx.add(pan_st(blip(420, 760, 0.09, 24, 0.04), -0.4), c["germ"], db(-15))              # the germ pops up (in the pause before "It's")
sfx.add(pan_st(buzzer(0.2), -0.3), c["buzz"], db(-17))                                 # ... and is crossed out (after "cold.")
sfx.add(thump(0.2, 200, 80, 0.05), c["buzz"], db(-14))

# ================================================================= 3. one in four
for k, tk in enumerate((c["one"], c["one"] + 0.12, c["one"] + 0.24, c["four"])):       # a marker over each head
    sfx.add(pan_st(blip(600 + 90 * k, 900 + 130 * k, 0.05, 30 + k, 0.02), 0.4 - 0.25 * k), tk, db(-31 if k < 3 else -29))
sfx.add(pan_st(riser(c["achoo3"] - c["sudden"], 34, 500, 2200), 0.2), c["sudden"], db(-32))   # he walks into the light
for k, tk in enumerate((c["achoo3"] - 0.4, c["achoo3"] - 0.2)):
    sfx.add(pan_st(filt(breath(0.14, 35 + k), "highpass", 900), 0), tk, db(-32))
achoo(c["achoo3"], 37, 290, -2.5)                                                      # ACHOO (in the pause after "light.")

# ================================================================= 4. why: into his head; two wires
sfx.add(pan_st(filt(whoosh(0.34, 300, 2400, 40, 0.85), "lowpass", 3200), 0.2), SHOT["why"] - 0.27, db(-14))
sfx.add(thump(0.3, 130, 50, 0.09), SHOT["why"], db(-15))
for j, m in enumerate((67, 74)):                                                       # "Why?": a little question, after the word
    sfx.add(pizz(mtof(m), 0.25, 41 + j), c["why_end"] + 0.03 + j * 0.11, db(-16), pan=0.2)
sfx.add(pan_st(glide(520, 880, 0.5) * np.hanning(int(0.5 * SR)) * 0.5, 0.4), c["scientists"], db(-34))   # the eye's wire draws on
sfx.add(pan_st(glide(390, 660, 0.5) * np.hanning(int(0.5 * SR)) * 0.5, -0.2), c["think"] + 0.05, db(-34))  # ... and the nose's
ncr = int((c["wires_end"] - c["crossed"]) * SR)
bed.add(pan_st(crackle(ncr, 60, 43, 1500, 7000), 0.1), c["crossed"] + 0.05, db(-26))   # they spark where they cross (low, under the words)
sfx.add(thump(0.22, 190, 70, 0.06), c["guess"], db(-12))                               # BEST GUESS, stamped (after "wires.")
sfx.add(pan_st(snap(44), -0.3), c["guess"], db(-18))

# ================================================================= 5. mech: eye's nerve, how close, nose's nerve; light floods in, fires one, spills into the other
sfx.add(pan_st(filt(whoosh(0.5, 400, 1300, 50, 0.6), "lowpass", 1500), 0.2), c["nerve1"] - 0.1, db(-28))   # the camera rides in to the eye
sfx.add(pan_st(blip(700, 1100, 0.06, 51, 0.03), -0.3), c["nerve1"], db(-30))           # label
for j, m in enumerate((88, 89)):                                                       # "close": two notes a hair apart (tiny: "to the nerve" follows at once)
    sfx.add(bell(mtof(m), 0.12, 0.03) * 0.5, c["close"] + 0.04 + j * 0.06, db(-34), pan=0.2)
sfx.add(pan_st(blip(520, 820, 0.06, 52, 0.03), -0.3), c["nerve2"], db(-30))            # label
sfx.add(pan_st(blip(900, 1500, 0.06, 53, 0.03), 0.4), c["guards"], db(-31))            # the shield
for j, m in enumerate((84, 91)):
    sfx.add(bell(mtof(m), 0.16, 0.045) * 0.5, c["nose_end"] + 0.02 + j * 0.04, db(-24), pan=0.4)   # ... shing (after "nose.", gone before "A sudden")
sfx.add(pan_st(riser(c["fires"] - c["sudden2"] + 0.1, 54, 400, 2600), 0.4), c["sudden2"] - 0.05, db(-27))   # the light floods in
tk, k = c["fires"], 0
while tk < c["one_end"] - 0.05:                                                        # the eye's nerve fires: tick tick tick (out before "and spills")
    bed.add(pan_st(blip(1500, 1900, 0.025, 55 + k, 0.008), 0.3 - 0.06 * k), tk, db(-28))
    tk += 0.13
    k += 1
ncr = int((c["other_end"] - c["spills"]) * SR)
bed.add(pan_st(crackle(ncr, 90, 56, 1400, 7000), -0.1), c["spills"], db(-21))          # ... and spills across (crackle, under the words)
sfx.add(pan_st(fade(crackle(int(0.22 * SR), 160, 57, 1200, 8000), 0.002, 0.08), 0), c["other_end"] + 0.02, db(-6))   # ZAP (after "other.")
sfx.add(thump(0.2, 220, 70, 0.05), c["other_end"] + 0.02, db(-14))

# ================================================================= 6. fire: the brain hears something's up the nose. FIRE!
sfx.add(pan_st(blip(480, 700, 0.08, 60, 0.04), 0), c["so"] + 0.02, db(-30))            # the brain's face
kx = klaxon(0.28, 61)
sfx.add(pan_st(kx, 0.3), c["hears_end"] + 0.03, db(-13))                               # NOSE ALERT (in the pause after "hears:")
tk, k = c["alert"] + 0.05, 0
while tk < c["fire"] - 0.1:                                                            # the alarm keeps pulsing, far down under her
    bed.add(pan_st(filt(alarm_bell(0.12, 62 + k), "highpass", 2500), 0.4), tk, db(-30))
    tk += 0.26
    k += 1
sfx.add(pan_st(blip(700, 1200, 0.06, 66, 0.03), -0.2), c["upthe"] - 0.08, db(-29))     # the big red button
sfx.add(thump(0.3, 140, 46, 0.1), c["slam"], db(-8))                                   # SLAM (low, under "FIRE!")
sfx.add(pan_st(filt(breath(0.3, 67), "highpass", 700), 0), c["fire_end"] - 0.34, db(-28))   # the whole head breathes in ...

# ================================================================= 7. family: gran, him, the kid, a beat apart; "It runs in families."
achoo(c["fam1"], 70, 232, -4.0, pan=-0.45, hit=-13.0)                                  # gran (low)
achoo(c["fam2"], 71, 290, -2.5, pan=0.0, hit=-10.0)                                    # him
achoo(c["fam3"], 72, 410, -4.0, pan=0.45, hit=None)                                    # the kid (squeaky)
sfx.add(np.stack([jingle(0.3, 73, 30), jingle(0.3, 74, 30)]) * 0.5, c["fam2"] + 0.06, db(-31))   # the frame rattles on its nail
for j, m in enumerate((72, 76, 79)):                                                   # passed down: gran -> him -> the kid (soft, under the line)
    mus.add(pan_st(fade(music_box(mtof(m), 0.5, 75 + j), 0.002, 0.2), -0.4 + 0.4 * j), c["itruns"] + 0.12 + j * 0.3, db(-33))

# ================================================================= 8. card: the chart; drumroll; A C H O O; syndrome; the blat; the stare
sfx.add(pan_st(filt(whoosh(0.3, 700, 250, 80, 0.5), "lowpass", 1400), 0), SHOT["card"], db(-24))   # the chart drops in
sfx.add(pan_st(filt(thump(0.2, 180, 80, 0.05), "lowpass", 400), 0), SHOT["card"] + 0.22, db(-20))
dr = drumroll(c["achoo"] - c["name_end"] - 0.04, 81)
sfx.add(pan_st(dr, 0), c["name_end"] + 0.03, db(-12))                                  # drumroll in the pause before the name
for i in range(5):                                                                     # the letters, typed on as she says it (quiet)
    sfx.add(pan_st(key_click(82 + i), -0.4 + 0.2 * i), c["achoo"] + (c["achoo_end"] - 0.2 - c["achoo"]) * i / 4, db(-27))
bwomp(sfx, c["bwomp"], 36, -9.0)                                                       # ... syndrome. (the blat, after the word)
for i in range(5):                                                                     # each letter spelled out: five quick flicks
    sfx.add(pan_st(pen_tick(87 + i), 0.3), c["syndrome_end"] + 0.16 + i * 0.09, db(-25))
clock_ticks(c["stare"] - 0.6, c["purpose_end"] + 0.3, bed, db(-27))                    # the stare: the wall clock
sfx.add(thump(0.2, 200, 80, 0.05), c["real"], db(-8))                                  # REAL. SINCE 1978. (after "purpose.")
sfx.add(pan_st(snap(92), 0.3), c["real"], db(-12))

# ================================================================= 9. button: sunglasses; the foot; subscribe; he peeks ... ACHOO ... again; back inside
sfx.add(pan_st(tweet(100, 3100), -0.5), c["helps_end"] + 0.06, db(-27))                # the street again: a sparrow, in the pause after "helps?"
sfx.add(pan_st(slide_whistle(0.22, 1500, 620), 0.1), c["shades"] - 0.06, db(-21))      # they drop out of the sky (in the pause)
sfx.add(pan_st(key_click(101), 0.1), c["shades"] + 0.17, db(-20))                      # ... and land on his nose
for j, m in enumerate((96, 103)):                                                      # ting (after "Sunglasses.")
    sfx.add(bell(mtof(m), 0.5, 0.16) * 0.5, c["ting"] + j * 0.05, db(-17), pan=0.3)
nf = int((c["asleep_end"] - c["foot"]) * SR)
bed.add(pan_st(crackle(nf, 45, 102, 2500, 9000), -0.4), c["foot"], db(-25))            # pins and needles (fizz, under the words)
sfx.add(pan_st(fade(crackle(int(0.2 * SR), 110, 103, 2200, 9000), 0.002, 0.08), -0.4), c["asleep_end"] + 0.04, db(-13))   # ... bzzt (after "asleep.")
sfx.add(pan_st(riser(c["achoo4"] - c["peek"], 104, 600, 2600), 0.3), c["peek"], db(-27))   # he lifts them: the light
achoo(c["achoo4"], 105, 290, -1.5)
sfx.add(pan_st(slide_whistle(0.28, 700, 1900), -0.3), c["achoo4"] + 0.07, db(-24))     # the shades leave
sfx.add(pan_st(filt(breath(0.16, 106), "highpass", 900), 0), c["bless2"] - 0.22, db(-27))   # sniff
achoo(c["achoo5"], 107, 300, -2.5, hit=-12.0)                                          # ... again (in the pause before "again.")
sfx.add(pan_st(filt(breath(0.3, 108, exhale=True), "highpass", 500), 0), c["again_end"] + 0.03, db(-19))   # he sighs
sfx.add(pan_st(whoosh(0.36, 1600, 400, 109, 0.5), -0.3), c["dash"], db(-13))           # zip: back into the dark
tk, k = c["dash"] + 0.02, 0
while tk < c["dash"] + 0.4:                                                            # his feet
    sfx.add(pan_st(filt(thump(0.05, 300, 140, 0.012), "highpass", 150), 0.2 - 0.12 * k), tk, db(-20))
    tk += 0.07
    k += 1
SLAM = c["slamdoor"]
sfx.add(thump(0.4, 170, 46, 0.11), SLAM, db(-5))                                       # the door slams
sfx.add(pan_st(crack(0.1, 110, 0.025, 700), -0.3), SLAM, db(-17))
sfx.add(np.stack([jingle(0.4, 111, 34), jingle(0.4, 112, 34)]) * 0.5, SLAM + 0.04, db(-28))   # the bulbs rattle
film2 = pad([mtof(m) for m in (50, 57, 62, 66)], DUR - SLAM - 0.08, 0.25, 520, 11)     # the film's chord again, behind the door: straight into frame 1
sfx.add(pan_st(fade(film2, 0.1, 0.01), -0.3), SLAM + 0.08, db(-23))
# subscribe cue: the pop in the pause before "Subscribe!", the click in the pause after it, before the sneeze
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-21))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-23))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-3))
        sfx.add(pan_st(key_click(73), 0), c["sub_tap"] + 0.004, db(-10))
        sfx.add(pan_st(bell(1760, 0.5, 0.2), 0.3), c["sub_tap"] + 0.05, db(-27))

# ================================================================= score (drops out for every punchline)
# hook + bless: no score (the door, the light, the sneezes, the silence).
# one in four: the bouncy mystery groove, in after her first words, out for the sneeze
groove(mus, c["one"] - 0.1, c["light_end"] - 0.05, 112, ["F", "Bb", "C", "F"], gain=-12, seed=10, snaps=False, cutoff=1200)
# why: wonder. A held chord while the wires draw on
drone(mus, c["scientists"] - 0.1, c["wires_end"], [57, 64, 69, 72], cutoff=800, gain=-30, seed=11, swell=0.5)
# mech: the mechanism drive, in after "The nerve from", out as the light floods in; then a climbing cluster into the spill
groove(mus, c["eyes"] - 0.25, c["nose_end"] + 0.05, 108, ["Am", "F", "C", "G"], gain=-12, seed=20, snaps=False, cutoff=1100)
drone(mus, c["flood"], c["other_end"], [45, 52, 57, 63], cutoff=600, gain=-34, seed=21, swell=1.5)
# fire: a low cluster that tightens until FIRE!
drone(mus, c["so"], c["fire"] - 0.05, [38, 44, 45, 51], cutoff=380, gain=-30, seed=30, swell=0.7)
# family, card: nothing but the gags (the drumroll, the blat, the clock).
# button: the smug strut (snaps and bass), in after "Sunglasses." + ting, out when he lifts them
groove(mus, c["ting"] + 0.18, c["peek"], 100, ["Dm", "G", "C", "A"], gain=-13, seed=40, snaps=True, arp=False, cutoff=1000)
silence(mus, [(c["light_end"] - 0.02, SHOT["why"] + 0.2), (c["nose_end"] + 0.1, c["flood"]), (c["peek"] + 0.02, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -15.0})
