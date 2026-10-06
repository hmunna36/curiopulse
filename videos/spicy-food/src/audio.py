"""Why Does Spicy Food BURN? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

The rule of this mix: every loud sound (the crunch, the fire's whoosh, the alarm bell, the click, the sprinkler, the
mouse) sits in a pause of the narration. What happens ON a word is on the bed bus, either under 300 Hz (thuds, the
fire's rumble) or above 5 kHz (sizzle, the sprinkler's tss), so the word stays clear.
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


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))
    (bus or bed).add(pan_st(filt(bonk(), "lowpass", 600), 0), t, db(gain - 10))


def cut(t, seed, gain=-20.0, f0=400, f1=2200, top=2600):
    """the whoosh into a cut: kept dull, so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


STALL = ("hook", "calm", "sweat", "button")
MOUTH = ("alarm", "sensor", "key")

# ================================================================= ambience (one bed per world, gated to its shots)
hush = norm(filt(brown(N, 1), "lowpass", 240))                                           # the night market: a hush ...
amb.x += pan_st(hush, 0) * 0.3 * gate(N, on(*STALL))
crowd = norm(filt(pink(N, 2), "bandpass", [150, 420]) * (0.6 + 0.4 * norm(filt(white(N, 3), "lowpass", 2))))
amb.x += pan_st(crowd, 0) * 0.42 * gate(N, on(*STALL))                                   # ... and a crowd, far off (under the speech band)
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.2 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.5 * gate(N, on(*MOUTH))                                   # inside his mouth: muffled, a slow pulse
hum = norm(np.sin(2 * np.pi * 100 * tt) + 0.5 * np.sin(2 * np.pi * 200 * tt) + 0.2 * filt(brown(N, 5), "lowpass", 200))
amb.x += pan_st(hum, 0) * 0.34 * gate(N, on("brain"))                                    # the brain's control room: mains hum
dusk = norm(filt(brown(N, 6), "lowpass", 300) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * tt)))
amb.x += pan_st(dusk, 0) * 0.4 * gate(N, on("garden"))                                   # the garden: a little wind
crickets(SHOT["garden"] + 0.1, END["garden"] - 0.2, bed, db(-33), seed=7, f=5200, rate=1.6)   # ... and crickets (above the words)

# ================================================================= 1. hook: CRUNCH ... mmm ... uh-oh ... FIRE
sfx.add(pan_st(chomp(1), 0.1), c["bite"], db(-3))                                        # the crunch, on frame 1 (the gap before "You")
sfx.add(pan_st(fade(crack(0.09, 2, 0.02, 1400), 0.0005, 0.03), 0.15), c["bite"] + 0.012, db(-8))
for k in range(4):                                                                       # he chews (low: it is under "bite one chilli")
    bed.add(pan_st(bloop(240 - 20 * (k % 2), 120, 0.1), 0.1), c["you_bite"] + 0.2 + 0.24 * k, db(-17))
low_thud(c["flush"], -9, 120.0, 0.3, 0.1)                                                # uh-oh: his heart drops (under "chilli")
nz = int((c["fire"] - c["lick"]) * SR)                                                   # the sizzle climbs with the red (above the words)
bed.add(pan_st(norm(filt(white(nz, 3), "highpass", 5600)) * np.linspace(0.1, 1, nz) ** 1.6, 0), c["lick"], db(-22))
kettle = np.sin(2 * np.pi * np.cumsum(np.linspace(6200, 7400, nz)) / SR) * np.linspace(0, 1, nz) ** 2   # steam from his ears: a kettle (above the words)
bed.add(pan_st(fade(kettle, 0.05, 0.02), -0.3), c["lick"], db(-27))
nr = c["fire_end"] - c["fire"]
bed.add(pan_st(fire_rumble(nr + 0.5, 4, 240), 0.1), c["fire"], db(-3))                   # the blast under "FIRE!": rumble and crackle only
low_thud(c["fire"], -3, 110.0, 0.5, 0.2)
sfx.add(pan_st(fire_whoosh(0.62, 5), 0.2), c["fire_end"] - 0.04, db(-2))                  # ... and the roar, in the pause after it

# ================================================================= 2. calm: nothing is burning. Beep-beep: 37
sfx.add(pan_st(fade(hiss(0.2, 10, 0.06), 0.002, 0.08), 0), SHOT["calm"] - 0.02, db(-16)) # the flames are gone: pff
for k in range(2):
    sfx.add(pan_st(beep(2500, 0.075), 0.2), c["tick"] + 0.13 * k, db(-7))                # the thermometer (the pause after "burning.")
sfx.add(bell(mtof(96), 0.22, 0.07) * 0.5, c["tick"] + 0.3, db(-15), pan=0.2)

# ================================================================= 3. alarm: the chilli struts up ... and pulls it
cut(SHOT["alarm"], 20, -19, 300, 1500, 1800)
bed.add(thump(0.3, 120, 44, 0.1), SHOT["alarm"], db(-9))                                 # we are inside his mouth
for k in range(5):                                                                       # its little feet (low taps under "That chilli just")
    ts = c["strut"] - 0.02 + 0.15 * k
    if ts < c["pull"] - 0.3:
        bed.add(thump(0.06, 330 - 40 * (k % 2), 150, 0.018), ts, db(-15), pan=-0.4 + 0.15 * k)
low_thud(c["pull"] + 0.12, -5, 170.0, 0.3, 0.09)                                         # clunk: the handle (under "pulled")
nb = c["alarm_end"] - c["ring"]
bed.add(pan_st(alarm_bell(nb, 21, 26.0, 2300.0), 0.25), c["ring"], db(-25))              # the bell, far back under "your fire alarm" ...
sfx.add(pan_st(alarm_bell(END["alarm"] - c["alarm_end"] - 0.02, 22, 26.0, 2100.0), 0.25), c["alarm_end"] + 0.03, db(-5))   # ... and right here in the pause

# ================================================================= 4. sensor: the alarms in his tongue; scalding soup sets them off
cut(SHOT["sensor"], 30, -19)
bed.add(pan_st(blip(600, 900, 0.06, 31, 0.03), 0), c["sensors"] - 0.05, db(-25))         # label
bed.add(pan_st(blip(700, 1000, 0.06, 32, 0.03), 0), c["heat"] - 0.05, db(-26))
sfx.add(bell(mtof(91), 0.3, 0.09) * 0.5, c["spoon"] - 0.2, db(-13), pan=0.3)             # the spoon: ting (the pause after "heat...")
sfx.add(pan_st(filt(whoosh(0.24, 1500, 500, 33, 0.6), "lowpass", 2400), 0.3), c["spoon"] - 0.24, db(-19))
ns = int((END["sensor"] - c["spoon"]) * SR)
sizz = norm(filt(white(ns, 34), "highpass", 5400) * (0.7 + 0.3 * norm(filt(white(ns, 35), "lowpass", 9))))
bed.add(pan_st(sizz * np.minimum(1, np.linspace(0, 5, ns)), 0.2), c["spoon"], db(-19))   # sizzle (above "like scalding soup")
for j, d in enumerate((0.0, 0.16, 0.3)):                                                 # one, two, three: the handles drop (low, under "scalding soup")
    low_thud(c["scald"] + 0.12 + d, -8, 180.0 - 15 * j, 0.22, 0.07)
bed.add(pan_st(alarm_bell(c["soup_end"] - c["scald"] - 0.1, 36, 30.0, 2300.0), 0), c["scald"] + 0.14, db(-27))
sfx.add(pan_st(alarm_bell(END["sensor"] - c["soup_end"] - 0.04, 37, 30.0, 2100.0), 0), c["soup_end"] + 0.03, db(-7))   # all three, in the pause

# ================================================================= 5. key: no heat. The key slides in ... turns ... CLICK
cut(SHOT["key"] - 0.1, 40, -22, 900, 300, 1400)                                           # it cools (early: "A" is the first word)
for j, m in enumerate((84, 88, 91, 96)):                                                 # the key floats over: a glint (quiet, high)
    bed.add(bell(mtof(m), 0.24, 0.08) * 0.4, c["molecule"] + 0.16 * j, db(-27), pan=-0.3 + 0.2 * j)
bed.add(pan_st(filt(whoosh(0.3, 3000, 6000, 41, 0.8), "highpass", 4500), 0), c["fits"] - 0.02, db(-21))   # it slides in (above "fits")
for k in range(4):                                                                       # the turn: a ratchet, low (under "them...")
    bed.add(thump(0.05, 300, 160, 0.014), c["turn"] + 0.08 + 0.1 * k, db(-16))
sfx.add(pan_st(snap(43), 0.0), c["click_snd"], db(-1))                                   # CLICK (the pause after "them...")
sfx.add(pan_st(key_click(44), 0.0), c["click_snd"] + 0.004, db(-3))
sfx.add(thump(0.2, 200, 70, 0.06), c["click_snd"] + 0.01, db(-7))
nk = c["key_end"] - c["like"]
bed.add(pan_st(alarm_bell(nk + 0.1, 45, 28.0, 2300.0), 0.1), c["like"] - 0.06, db(-26))  # the same alarm, far back under "like a key" ...
sfx.add(pan_st(alarm_bell(END["key"] - c["key_end"] - 0.06, 46, 28.0, 2100.0), 0.1), c["key_end"] + 0.03, db(-7))   # ... and right here after it: no heat

# ================================================================= 6. brain: FIRE on its screen. It pulls the lever
cut(SHOT["brain"], 50, -19, 1500, 400, 2000)
for k in range(5):                                                                       # the signal comes up the nerve: zips (high, quiet)
    bed.add(pan_st(blip(2600 + 300 * k, 4200, 0.04, 51 + k, 0.02), -0.6 + 0.1 * k), SHOT["brain"] + 0.04 + 0.13 * k, db(-25))
bed.add(pan_st(filt(norm(siren(c["fire2_end"] - c["brain_fire"] + 0.5, 56)), "highpass", 4200), 0), c["brain_fire"], db(-26))
low_thud(c["brain_fire"], -4, 130.0, 0.4, 0.14)                                          # FIRE! (under the word: a thud)
sfx.add(pan_st(fade(klaxon(0.2, 57), 0.004, 0.04), -0.2), c["fire2_end"] + 0.02, db(-11)) # the alarm (the pause after "FIRE...")
sfx.add(pan_st(fade(crack(0.12, 58, 0.03, 1800), 0.0005, 0.04), -0.6), c["fire2_end"] + 0.04, db(-13))   # ... and its mug, somewhere
low_thud(c["lever"] + 0.17, -4, 160.0, 0.3, 0.09)                                        # ka-chunk (under "turns on")
bed.add(pan_st(filt(creak(0.2, 59), "lowpass", 500), 0.4), c["lever"], db(-16))

# ================================================================= 7. sweat: tss-tss-tss. The subscribe aside. The chilli snickers
low_thud(SHOT["sweat"], -6, 210.0, 0.2, 0.06)                                            # pop: the sprinkler is out (low: it is under "the sprinklers")
bed.add(pan_st(cork_pop(60, 520.0), 0), SHOT["sweat"], db(-20))
n1 = c["spr_end"] - SHOT["sweat"]
bed.add(pan_st(sprinkler_tss(n1, 61, 9.0), 0), SHOT["sweat"] + 0.05, db(-15))            # tss-tss under the word (above 5 kHz) ...
sfx.add(pan_st(sprinkler_tss(c["sub_in"] - c["spr_end"] + 0.22, 62, 9.0, True), 0), c["spr_end"] + 0.02, db(-6))   # ... and loud in the pause after it
n3 = c["meant_end"] - c["sub_w"]
bed.add(pan_st(sprinkler_tss(n3, 63, 9.0) * np.linspace(0.8, 0.4, int(n3 * SR)), 0), c["sub_w"], db(-22))
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-21))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-23))
    sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-4))                                    # the click, in the pause after "Subscribe..."
    sfx.add(pan_st(key_click(73), 0), c["sub_tap"] + 0.004, db(-6))
    sfx.add(pan_st(bell(1760, 0.3, 0.07) * 0.5, 0.2), c["sub_tap"] + 0.05, db(-20))
bed.add(bell(mtof(100), 0.18, 0.05) * 0.4, c["meant"] + 0.03, db(-24), pan=0.4)          # its wink: a tiny glint (high, quiet)
sfx.add(pan_st(snicker(74, 300.0, 3), 0.35), c["meant_end"] + 0.03, db(-6))              # heh-heh-heh (the pause after "meant it.")

# ================================================================= 8. garden: the bird feels nothing; the plant takes aim
cut(SHOT["garden"], 80, -22, 500, 1500, 2000)
for k in range(3):                                                                       # its beak: tiny clicks (low level, between words)
    bed.add(pan_st(filt(key_click(81 + k), "highpass", 2000), 0.3), SHOT["garden"] + 0.12 + 0.238 * k, db(-25))
sfx.add(pan_st(tweet(84, 3300.0), 0.3), c["feel_end"] + 0.03, db(-9))                    # the bird, pleased (the pause after "feel it.")
bed.add(pan_st(filt(creak(0.22, 85, 60, 140), "lowpass", 420), -0.2), c["plant_w"] - 0.08, db(-14))   # the plant's eyes open (low)
for k, dt in enumerate((0.0, 0.22, 0.4)):                                                # the crosshair: quiet pips under "aims it" ...
    bed.add(pan_st(beep(5200, 0.04), -0.2), c["aims"] + dt, db(-25))
sfx.add(pan_st(beep(2100, 0.05), -0.3), c["it_end"] + 0.04, db(-15))                     # ... once more in the pause ...
sfx.add(pan_st(chomp(86), -0.4), c["at"] - 0.4, db(-10))                                 # the mouse bites
sfx.add(pan_st(beep(2900, 0.09), -0.3), c["at"] - 0.22, db(-14))                          # ... locked
nm = c["mammals_end"] - c["mammals"]
bed.add(pan_st(fire_rumble(nm + 0.3, 87, 240), -0.3), c["mammals"], db(-7))              # its mouth is on fire (rumble under "mammals")
sfx.add(pan_st(squeak(0.16, 2300, 3300), -0.4), c["mammals_end"] + 0.04, db(-10))         # EEK (the pause after "mammals.")
sfx.add(pan_st(fire_whoosh(0.34, 88, 0.7), -0.4), c["mammals_end"] + 0.03, db(-12))
for k in range(5):                                                                       # ... and it is gone
    sfx.add(thump(0.045, 420, 200, 0.012), c["mammals_end"] + 0.2 + 0.05 * k, db(-17 - 2 * k), pan=-0.5 - 0.1 * k)

# ================================================================= 9. button: the crosshair finds him. The heap. One more bite
cut(SHOT["button"], 90, -22, 500, 1500, 2000)
bed.add(pan_st(beep(5200, 0.04), 0), c["you"] - 0.1, db(-25))
sfx.add(pan_st(beep(2900, 0.1), 0), c["you_end"] + 0.04, db(-13))                         # locked (the pause after "you...")
sfx.add(pan_st(gulp(91), 0.0), c["you_end"] + 0.3, db(-15))                              # he swallows
low_thud(c["ordered"] + 0.06, -2, 140.0, 0.4, 0.13)                                      # the heap lands (under "ordered")
bed.add(pan_st(filt(rustle(0.3, 92), "highpass", 4500), 0.3), c["ordered"] + 0.08, db(-20))
sfx.add(pan_st(springs(93, 0.4), 0.3), c["extra_end"] + 0.03, db(-10))                   # the placard: boing (after "extra.")
for j, m in enumerate((79, 84)):                                                         # ta-da
    sfx.add(bell(mtof(m), 0.3, 0.1) * 0.5, c["extra_end"] + 0.08 + 0.11 * j, db(-12), pan=0.1 + 0.2 * j)
sfx.add(pan_st(filt(whoosh(0.42, 400, 2200, 94, 0.9), "lowpass", 2600), 0.1), DUR - 0.44, db(-13))   # the chilli goes up: back to frame 1

# ================================================================= score (it stops for the fire, the alarms, the click, the snicker)
STRUT = ["Am", "Dm", "E", "Am"]
# hook: a cheeky night-market strut; it stops dead for FIRE
groove(mus, c["you_bite"] + 0.4, c["fire"] - 0.06, 112, STRUT, gain=-12, seed=3, kick_on=False, padv=False, cutoff=1100)
# alarm: a sneaky walk while the chilli struts in; it stops when the handle comes down
groove(mus, c["strut"] + 0.3, c["pull"] + 0.1, 96, ["Dm", "A"], gain=-12, seed=20, kick_on=False, snaps=False, arp=False, padv=False)
# sensor: the curious mechanism groove (after "Your tongue"); it stops when the spoon arrives
groove(mus, c["tongue"] + 0.5, c["spoon"] - 0.28, 108, ["F", "Dm", "Bb", "C"], gain=-12, seed=10, snaps=False, cutoff=1200)
_rz = riser(c["scald"] + 0.1 - c["spoon"], 12, 200, 1200)
mus.add(pan_st(filt(_rz, "lowpass", 1400), 0), c["spoon"], db(-28))
# key: a heist: low held notes and a plucked bass; dead silent for the turn and the click
drone(mus, SHOT["key"] + 0.06, c["click"] - 0.05, [38, 45, 50], cutoff=380, gain=-27, seed=30, swell=0.3)
groove(mus, c["achilli"] + 0.4, c["click"] - 0.05, 100, ["Dm", "Gm"], gain=-14, seed=31, kick_on=False, snaps=False, arp=False, padv=False)
# brain: a held breath, then panic (after "FIRE"); the lever stops it
drone(mus, c["so"] + 0.2, c["brain_fire"] - 0.02, [45, 52], cutoff=420, gain=-27, seed=40, swell=0.25)
groove(mus, c["and_turns"] + 0.04, c["lever"] + 0.14, 138, ["Dm", "A"], gain=-13, seed=41, kick_on=False, snaps=False, sixteen=True, padv=False, cutoff=1300)
# the aside: the strut again, light, under "the chilli meant it"
groove(mus, c["the_chilli"] + 0.42, c["meant_end"] - 0.02, 112, ["Am", "E"], gain=-14, seed=3, kick_on=False, padv=False, cutoff=1100)
# garden: gentle and a little smug; it stops for the lock
groove(mus, c["birds"] + 0.3, c["it_end"] - 0.02, 92, ["C", "Am", "F", "G"], gain=-13, seed=50, kick_on=False, snaps=False, cutoff=1000)
# button: silence for "And you...", then the strut comes back as he reaches for another: into the loop
groove(mus, c["extra_end"] + 0.42, DUR, 112, STRUT, gain=-12, seed=3, kick_on=False, padv=False, cutoff=1100)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -13.0})
