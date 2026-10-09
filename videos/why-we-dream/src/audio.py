"""Why Do We DREAM? 💭 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

The rule of this mix: every loud sound (the alarm's full ring, the snicker, the whistle, the switch's clunk, a cricket,
the penguin, the two dings, the padlocks, a snore, the spring) sits in a pause of the narration. What happens ON a word
is on the bed bus, either under 250 Hz (the slap, the cards, the lever, the bars, the locks) or above 5 kHz (the
alarm under "You", pencils, the bubble, his feet in the dream), so the word stays clear.
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


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def air(t0, t1, gain, seed, shape=None, pan=0.0):
    """breath, wind or a shimmer that can run under words: only above 5.2 kHz"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(filt(white(n, seed), "highpass", 5200, 4) * env, 0.004, 0.03), pan), t0, db(gain))


def patter(t0, t1, gain, seed, rate=11.0, pan=-0.4):
    """his feet in the dream: a quick pitter-patter above the words"""
    if t1 - t0 > 0.1:
        bed.add(pan_st(filt(ratchet(t1 - t0, rate, rate, seed, edges=True), "highpass", 6000), pan), t0, db(gain))


HALL = ("hook", "pajamas")
NIGHT = ("answer", "bed", "weird", "stays")
MIND = ("warden", "fears", "payoff")
LOOP = c["loop"]

# ================================================================= ambience (one bed per world, gated to its shots)
hall = norm(filt(brown(N, 1), "lowpass", 200))
amb.x += pan_st(hall, 0) * 0.26 * gate(N, on(*HALL) + [(LOOP, DUR)], 0.05)                          # the hall: a big, quiet room
night = norm(filt(brown(N, 2), "lowpass", 240) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.3 * tt)))
amb.x += pan_st(night, 0) * 0.34 * gate(N, on(*NIGHT) + [(SHOT["button"], LOOP)], 0.05)             # his bedroom at night
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.44 * gate(N, on(*MIND))                                              # inside his head: muffled, a slow pulse
# pencils: the whole hall is writing (above the words), until everyone looks up; and again in the pajamas shot
for k, (t0, t1, g) in enumerate(((0.3, c["hall"] + 0.3, -27), (SHOT["pajamas"] + 0.1, END["pajamas"] - 0.25, -25))):
    sc = filt(scribble(t1 - t0, 5 + k, 8.0), "highpass", 5200, 4)
    bed.add(pan_st(fade(sc, 0.05, 0.15), -0.3 + 0.6 * k), t0, db(g))

# ================================================================= 1. hook: the alarm, the slap, the hall, the pajamas
# the ring comes round from the end of the Short: full for the first tenth of a second, then only its top until his
# hand lands (it is under "You slap")
ring0 = alarm_ring(c["slap"] + 0.02, 11)
sfx.add(pan_st(ring0 * np.clip(1 - (ar(len(ring0)) - 0.04) / 0.06, 0, 1), 0.2), 0.0, db(-9))
bed.add(pan_st(alarm_ring(c["slap"] + 0.02, 11, edges=True), 0.2), 0.0, db(-12))
bed.add(pan_st(slap_hit(12, edges=True), 0.2), c["slap"], db(-5))                                   # the slap (on "slap": its top and its thud)
low_thud(c["slap"], -7, 120.0, 0.30, 0.09)
bed.add(pan_st(filt(bell(2350, 0.12, 0.02), "highpass", 5200), 0.2), c["slap"] + 0.01, db(-20))     # the bells, choked
sfx.add(pan_st(filt(whoosh(0.34, 300, 1700, 13, 0.8), "lowpass", 2000), 0), c["hall"] - 0.08, db(-17))   # the camera lets go
low_thud(c["exam"] + 0.02, -9, 86.0, 0.5, 0.18)                                                     # the hall, all of it (under "exam")
air(c["exam"], c["hall_end"], -19, 14)                                                              # ... and everybody turning round
low_thud(c["in_your"] + 0.06, -11, 140.0, 0.2, 0.06)                                                # he is on his feet (his chair, under "in your")
hi_tick(c["in_your"] + 0.06, -15, 15, 0.1)
for k, (f0, pan) in enumerate(((255.0, -0.45), (330.0, 0.5))):                                      # somebody snickers; somebody else joins in
    sn = snicker(16 + k, f0, 2)
    sfx.add(pan_st(fade(sn, 0.002, 0.06), pan), c["snick"] - 0.02 + 0.03 * k, db(-7 - 2 * k))

# ================================================================= 2. answer: the hall closes down into a bubble; he is asleep
bed.add(pan_st(bloop(190, 70, 0.34), -0.2), SHOT["answer"] - 0.02, db(-9))                          # the dream pops into its bubble (low: under "Relax")
air(SHOT["answer"], SHOT["answer"] + 0.42, -15, 20, lambda u: (1 - u) ** 0.7)

# ================================================================= 3. warden: the brain runs a fire drill
cut(SHOT["warden"], 30, -19, 300, 1500, 1900)
low_thud(c["fire"] - 0.02, -8, 96.0, 0.42, 0.14)                                                    # the sign comes on (under "fire")
hi_tick(c["fire"] - 0.02, -14, 31, 0.0)
buzz_n = int((END["fears"] - c["fire"]) * SR)                                                        # ... and hums, with the beacon going round
hum = norm(np.sin(2 * np.pi * 100 * ar(buzz_n)) + 0.4 * np.sin(2 * np.pi * 200 * ar(buzz_n))) * (0.55 + 0.45 * np.cos(9 * ar(buzz_n)) ** 2)
bed.add(pan_st(fade(hum, 0.05, 0.3), -0.2), c["fire"], db(-19))
wh = pea_whistle(0.17, 32, 2850.0)
sfx.add(pan_st(wh, 0.15), c["whistle"], db(-10))                                                      # one blast on its whistle, after "drill."

# ================================================================= 4. fears: one card after another; the LOGIC switch
for i, tc in enumerate(c["cards"]):                                                                  # a new fear on the screen (on the words: a tick and a thud)
    hi_tick(tc, -13, 40 + i, -0.2 + 0.2 * i)
    low_thud(tc, -15, 190.0 - 20 * i, 0.12, 0.04)
low_thud(c["switched"] + 0.2, -8, 110.0, 0.34, 0.11)                                                 # the lever starts down (under "switched")
nd = int(0.5 * SR)
down = np.sin(2 * np.pi * np.cumsum(np.linspace(210, 46, nd)) / SR) * np.linspace(1, 0, nd) ** 0.6   # the lights wind down (low: under "off")
bed.add(pan_st(fade(filt(down, "lowpass", 260), 0.01, 0.1), -0.3), c["off"] - 0.02, db(-9))
sfx.add(pan_st(key_click(41), -0.3), c["clunk"], db(-7))                                             # CLUNK, in the pause after "off."
low_thud(c["clunk"], -9, 100.0, 0.24, 0.08, sfx)
sfx.add(pan_st(cricket(42, 2, 4700), 0.4), c["clunk"] + 0.13, db(-15))                               # ... and a cricket: nobody is in charge

# ================================================================= 5. pajamas: the hall again; nobody minds
clock_ticks(SHOT["pajamas"] + 0.1, END["pajamas"] - 0.2, bed, db(-27))
low_thud(c["pj2"], -14, 170.0, 0.14, 0.04)                                                           # the thumb goes up (under "pajamas")
pg = honk(0.17, 690.0, 560.0, 50)
sfx.add(pan_st(fade(pg, 0.004, 0.05), 0.4), c["squeak"], db(-11))                                    # the penguin approves, after "pajamas."

# ================================================================= 6. payoff: two sleepers, two bars
cut(SHOT["payoff"], 60, -20, 400, 1800, 2200)
for i, (tk, pan) in enumerate(((c["students"], -0.3), (c["students"] + 0.1, 0.3), (c["dreamed"], -0.4), (c["of_their"], 0.3))):
    hi_tick(tk, -15, 61 + i, pan)                                                                    # they pop up: ticks (on the words)
    low_thud(tk, -18, 210.0, 0.1, 0.03)
nb = c["higher"] - c["scored"]
rise = norm(filt(brown(int(nb * SR), 62), "lowpass", 230)) * np.linspace(0.2, 1, int(nb * SR)) ** 1.4
bed.add(pan_st(fade(rise, 0.04, 0.04), 0), c["scored"], db(-12))                                     # the bars come up: a low swell (under "scored")
bed.add(pan_st(ratchet(0.62, 22, 34, 63, edges=True), -0.2), c["scored"], db(-17))
low_thud(c["higher"], -8, 130.0, 0.3, 0.1)                                                           # ... and the taller one wins (under "higher")
for j, m in enumerate((88, 93)):                                                                     # two notes, in the pause after it
    sfx.add(bell(mtof(m), 0.17, 0.05) * 0.5, c["tada"] + 0.09 * j, db(-9), pan=-0.3)

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is mid-video, so the narration carries on right after the word "subscribe".
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-22))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-24))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-10))
        sfx.add(pan_st(bell(1760, 0.12, 0.04), 0), c["sub_tap"] + 0.02, db(-22))   # short: "it gets" follows 0.14 s later
patter(SHOT["bed"] + 0.1, SHOT["weird"], -24, 70, 11.0)                                              # the dream goes on: his feet, far away

# ================================================================= 7. weird: the lever, the order, the padlocks
low_thud(c["paralyzes"] + 0.2, -6, 100.0, 0.4, 0.13)                                                 # the brain's lever comes down (under "paralyzes")
air(c["paralyzes"] + 0.16, c["legs"], -17, 80, lambda u: 0.4 + 0.6 * u)                              # the order on its way down his arms and legs
for i, (tk, pan) in enumerate(((c["arms"], -0.5), (c["arms"] + 0.05, 0.5), (c["legs"], -0.2), (c["legs"] + 0.05, 0.2))):
    bed.add(pan_st(lock_snap(81 + i, edges=True), pan), tk, db(-6))                                  # the locks, on the words: their thud and their top
for i, pan in enumerate((-0.4, 0.4)):                                                                # ... and aloud, twice, in the pause after "legs,"
    sfx.add(pan_st(lock_snap(85 + i), pan), c["locks"] + 0.09 * i, db(-7))
patter(c["so"], c["out_end"], -21, 86, 14.0)                                                         # he runs for it, in there
for k in range(3):                                                                                   # the locks rattle; nothing gives (above the words)
    hi_tick(c["cant"] + 0.3 * k, -17, 87 + k, -0.4 + 0.4 * k)

# ================================================================= 8. stays: the drill stays in his head
patter(c["the_drill"], c["head_end"], -22, 90, 16.0)
sfx.add(pan_st(snore(0.34, 91), 0.1), c["head_end"] + 0.10, db(-9))                                  # one snore, in the pause after "head."

# ================================================================= 9. button: a padlock springs open; the alarm goes off; frame 1
sfx.add(pan_st(cork_pop(92, 760.0), 0.4), c["pop"], db(-8))                                          # the lock gives
sfx.add(pan_st(fade(boing(0.3, 210.0, 93), 0.001, 0.08), 0.4), c["pop"] + 0.03, db(-11))
sfx.add(pan_st(lock_snap(94), 0.6), c["pop"] + 0.62, db(-13))                                        # ... and lands on the floor
nr = DUR - (c["rise"] + 0.05)
ring = alarm_ring(nr, 11)
swell = np.clip((ar(len(ring)) + 0.05) / 0.5, 0.25, 1.0)                                             # the alarm: far away at first (it is morning)
sfx.add(pan_st(ring * swell, 0.2), c["rise"] + 0.05, db(-9))
sfx.add(pan_st(filt(whoosh(0.3, 300, 1800, 95, 0.9), "lowpass", 2200), 0), LOOP - 0.24, db(-15))     # into the dream again

# ================================================================= score (it stops for every reveal and every punchline)
# hook: nothing but the alarm, pencils and the room until the hall is there; then a sneaky little walk under "in your"
groove(mus, c["hall_w"] - 0.05, c["pj"] - 0.03, 116, ["Dm", "A"], gain=-12, seed=3, kick_on=False, padv=False, cutoff=1100)
# ... which stops dead for "pajamas!" and the snicker
# answer: a lullaby, after "Relax,"
groove(mus, c["youre"] + 0.06, c["and"] - 0.02, 84, ["F", "C"], gain=-13, seed=10, kick_on=False, snaps=False, cutoff=900)
# warden: a march; it stops for "a fire drill" and the whistle
groove(mus, c["brain1"] + 0.1, c["fire"] - 0.14, 120, ["Dm", "Bb"], gain=-15, seed=11, padv=False, cutoff=1300)
# fears: a minor drive under "rehearses your fears"; it stops for "with the logic center switched off" (the take swallows
# "with", and the line is drier without it)
groove(mus, c["rehearses"] + 0.1, c["with"] - 0.06, 124, ["Am", "E"], gain=-11, seed=12, kick_on=False, cutoff=1200)
# pajamas: nothing (a clock, pencils, a penguin): that is the joke
# payoff: the proof, light; it stops for "scored... higher"
groove(mus, c["study"] + 0.16, c["scored"] - 0.08, 104, ["F", "Dm"], gain=-13, seed=20, kick_on=False, snaps=False, cutoff=1200)
# the aside: a held breath, then low strings into the weird fact; they stop for the lever
drone(mus, c["gets"] + 0.05, c["paralyzes"] - 0.04, [38, 45, 50], cutoff=420, gain=-30, seed=30, swell=0.4)
# after the locks: a tiptoe under "so you can't act dreams out"
groove(mus, c["so"] + 0.16, c["out_end"] - 0.02, 100, ["Dm", "A"], gain=-13, seed=31, kick_on=False, snaps=False, padv=False, cutoff=1000)
# stays: the lullaby again, for one bar
groove(mus, c["drill2"] + 0.1, c["head_end"] - 0.02, 84, ["F", "C"], gain=-17, seed=10, kick_on=False, snaps=False, cutoff=900)
# button: silence, a spring, the alarm

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -15.0})
