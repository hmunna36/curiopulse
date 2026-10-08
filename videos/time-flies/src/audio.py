"""Why Does Time FLY as You Get Older? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

The rule of this mix: every loud sound (the party horn, the shutters, the frog, the torn page, the bite, the snore, the
plink, the net, the dings) sits in a pause of the narration. What happens ON a word is on the bed bus, either under
250 Hz (cakes landing, the lever, thuds) or above 5 kHz (his breath on the candles, the tape's ratchet, the burst of
the brain's camera), so the word stays clear.
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
    """breath or wind that can run under words: only above 5.2 kHz"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(filt(white(n, seed), "highpass", 5200, 4) * env, 0.004, 0.03), pan), t0, db(gain))


def click_flash(t, gain=-9.0, pan=-0.5, seed=0):
    """the brain's instant camera, in a pause: the shutter, and the little whine of the flash"""
    sfx.add(pan_st(shutter(), pan), t, db(gain))
    n = int(0.16 * SR)
    wh = np.sin(2 * np.pi * np.cumsum(np.linspace(2400, 5200, n)) / SR) * np.linspace(0.2, 1, n) ** 2 * expdecay(n, 0.1)
    sfx.add(pan_st(fade(wh, 0.004, 0.03), pan), t + 0.03, db(gain - 14))


PARTY = ("hook", "button")
MIND = ("brain", "payoff")
FAIR = ("drop", "felt", "new")

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 220))
amb.x += pan_st(room, 0) * 0.3 * gate(N, on(*PARTY))                                              # the party: a warm, quiet room
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.46 * gate(N, on(*MIND))                                            # inside his head: muffled, a slow pulse
meadow = norm(filt(pink(N, 5), "bandpass", [70, 380]) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.23 * tt)))
amb.x += pan_st(meadow, 0) * 0.34 * gate(N, on("kid"))                                            # the meadow: a breeze, kept low
hum = norm(np.sin(2 * np.pi * 100 * tt) + 0.45 * np.sin(2 * np.pi * 200 * tt) + 0.3 * filt(brown(N, 8), "lowpass", 200))
amb.x += pan_st(hum, 0) * 0.34 * gate(N, on("now"), 0.05)                                         # the office: strip lights and air conditioning
night = norm(filt(brown(N, 9), "lowpass", 260) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.31 * tt)))
amb.x += pan_st(night, 0) * 0.36 * gate(N, on(*FAIR))                                             # the fair, far below: night air

# ================================================================= 1. hook: he blows; cake 30; he blows; cake 31; a party horn
air(0.0, c["out1"] + 0.04, -15, 2, lambda u: 0.55 + 0.45 * np.sin(np.pi * u) ** 0.5)                # his breath on the candles (above the words)
low_thud(0.0, -15, 110.0, 0.22, 0.06)                                                              # frame 1: a soft thump with the breath
bed.add(pan_st(bloop(170, 90, 0.14), 0), c["out1"], db(-17))                                        # the flames go out: a low puff (under "out")
for k, (t0, big) in enumerate(((c["slam2"], 0.0), (c["slam3"], 1.0))):                             # each cake lands: a plate on the table
    low_thud(t0, -8 + 4 * big, 120.0 - 20 * big, 0.34, 0.11)
    hi_tick(t0, -17 + 3 * big, 11 + k, 0.2)
    bed.add(pan_st(filt(rustle(0.3, 13 + k), "highpass", 5200), 0.0), t0 + 0.02, db(-21 + 3 * big))    # confetti (above the words)
air(c["out2"] - 0.2, c["out2"] + 0.03, -16, 3)                                                    # the second, quicker breath
bed.add(pan_st(bloop(170, 90, 0.12), 0), c["out2"], db(-19))
sfx.add(pan_st(party_horn(0.40, 4, 430.0), 0.15), c["horn"], db(-7))                               # the horn: in the pause after "again!"
sfx.add(pan_st(cork_pop(5, 700.0), -0.3), c["horn"] - 0.03, db(-15))
bed.add(pan_st(bloop(240, 120, 0.12), 0.1), c["relax_end"] + 0.22, db(-13))                         # the horn falls out of his mouth (after "Relax.")
sfx.add(pan_st(filt(whoosh(0.3, 300, 1800, 6, 0.9), "lowpass", 2200), 0), SHOT["brain"] - 0.3, db(-15))   # into his head

# ================================================================= 2. brain: the tape comes out of the TIME case; a photo per snap
nr = c["time_end"] - c["measures"] + 0.1
bed.add(pan_st(ratchet(nr, 16, 44, 20, edges=True), -0.2), c["measures"] - 0.08, db(-15))          # the tape pays out (above the words)
whirr = norm(filt(buzz(int(nr * SR), 72, 21, 0.3), "lowpass", 240)) * np.linspace(0.3, 1, int(nr * SR))
bed.add(pan_st(fade(whirr, 0.03, 0.06), -0.2), c["measures"] - 0.08, db(-17))                      # ... and its low whirr
low_thud(c["time_end"] + 0.04, -14, 170.0, 0.14, 0.04)                                             # it locks
for i, ts in enumerate(c["snaps"][:-1]):                                                           # photos land on the tape (on the words: ticks)
    hi_tick(ts, -15, 22 + i, -0.3 + 0.2 * i)
    low_thud(ts, -19, 200.0, 0.1, 0.03)
click_flash(c["snap_snd"], -4, 0.3)                                                                 # ... and one aloud, after "memories."

# ================================================================= 3. kid: a bike, a frog, a kite, a wasp, a ball; the brain cannot keep up
cut(SHOT["kid"], 30, -19, 500, 2400, 2800)
nk = END["kid"] - SHOT["kid"]
fw = ratchet(nk - 0.2, 13, 15, 31, edges=True)                                                     # the bike's freewheel (above the words)
bed.add(pan_st(fw, 0.0), SHOT["kid"] + 0.05, db(-27))
snd = set(round(x, 3) for x in c["first_snd"])
for i, tf in enumerate(c["firsts"]):
    if round(tf, 3) in snd:
        continue
    hi_tick(tf, -14, 32 + i, -0.5)                                                                 # the brain's camera, on the words: a tick
for i, tf in enumerate(c["first_snd"]):
    click_flash(tf, -9 - (1 if i else 0), -0.5, i)                                                 # ... and aloud in the pauses
sfx.add(bell(mtof(88), 0.16, 0.07) * 0.6, c["is_new_end"] + 0.02, db(-12), pan=0.2)                # his bell, ding
rb = ribbit(33, 430.0)[: int(0.2 * SR)]
sfx.add(pan_st(fade(rb, 0.002, 0.04), 0.0), c["is_new_end"] + 0.17, db(-12))                       # the frog has an opinion (one croak: "one" follows)
wz0, wz1 = c["firsts"][3] - 0.34, c["one"] + 0.1
wz = norm(filt(buzz(int((wz1 - wz0) * SR), 190, 34, 0.9), "lowpass", 250)) * (0.6 + 0.4 * np.sin(2 * np.pi * 6.5 * ar(int((wz1 - wz0) * SR))))
bed.add(pan_st(fade(wz, 0.08, 0.1), 0.3), wz0, db(-16))                                            # the wasp (low: under "is new")
npour = c["forever_end"] - c["lasts"]
bed.add(pan_st(ratchet(npour, 20, 60, 35, edges=True), -0.3), c["lasts"], db(-13))                 # the tape pours out: faster and faster
sfx.add(pan_st(scratch(0.2, 36), 0), c["forever_end"] + 0.03, db(-11))                             # the record stops: back to the present

# ================================================================= 4. now: a clock, a keyboard, a calendar, a sandwich, a snore
clock_ticks(SHOT["now"] + 0.1, END["now"] - 0.2, bed, db(-27))
ny = END["now"] - SHOT["now"] - 0.3
ty = filt(ratchet(ny, 9, 9, 40, edges=True), "highpass", 6000)                                     # typing (above the words)
bed.add(pan_st(ty, 0.1), SHOT["now"] + 0.15, db(-25))
sfx.add(pan_st(page_rip(0.15, 41), -0.5), c["now_end"] + 0.05, db(-9))                            # a page comes off the calendar (after "Now?")
sfx.add(pan_st(page_rip(0.11, 42), -0.5), c["desk_end"] + 0.03, db(-11))                           # ... and another (after "desk,")
for i, tf in enumerate(c["flips"][2:]):                                                            # ... and two more under words: a tick each
    hi_tick(tf, -15, 45 + i, -0.5)
low_thud(c["lunch"] + 0.05, -13, 160.0, 0.16, 0.05)                                                # the bite (under "lunch")
sfx.add(pan_st(chomp(43), -0.1), c["lunch_end"] + 0.03, db(-10))                                   # ... and aloud after it
sn = int(0.26 * SR)
snore = norm(filt(buzz(sn, 58, 44, 0.5), "lowpass", 420) * np.sin(np.pi * np.linspace(0, 1, sn)) ** 0.7)
sfx.add(pan_st(fade(snore, 0.02, 0.05), -0.5), c["snore"], db(-10))                                # the brain, asleep (after "bother.")

# ================================================================= 5. payoff: one long tape, one very short one
bed.add(pan_st(ratchet(0.62, 30, 50, 50, edges=True), -0.2), SHOT["payoff"] + 0.05, db(-17))       # the summer runs out across the frame
tug0 = c["looks_end"] + 0.03
for k in range(2):                                                                                 # the brain pulls at last year's tape (the pause before "tiny")
    sfx.add(pan_st(creak(0.11, 51 + k, 150, 300, (480, 1000, 1900)), -0.3), tug0 + 0.15 * k, db(-13))
low_thud(c["tiny"], -15, 190.0, 0.12, 0.03)                                                        # out it comes (under "tiny")
sfx.add(bell(mtof(96), 0.22, 0.07) * 0.5, c["plink"], db(-12), pan=-0.3)                            # plink: that is all of it
sfx.add(pan_st(cricket(52, 3, 4700), 0.4), c["plink"] + 0.1, db(-17))

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is mid-video, so the narration carries on right after the word "subscribe".
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-22))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-24))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-7))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-30))
low_thud(c["gets"] + 0.3, -14, 150.0, 0.2, 0.06)                                                   # the helmet goes on (under "gets weirder")
sfx.add(pan_st(key_click(60), 0.3), c["strap"], db(-9))                                            # its strap clicks (after "weirder.")

# ================================================================= 6. drop: the lever, the fall, the camera on burst, the net
cut(SHOT["drop"], 61, -18, 300, 1500, 1900)
low_thud(c["dropped"] + 0.02, -6, 110.0, 0.36, 0.12)                                               # the lever comes down (under "dropped")
hi_tick(c["release"], -13, 62, 0.4)                                                                # the harness lets go
nf = c["net"] - c["release"]
air(c["release"], c["net"], -9, 63, lambda u: 0.15 + 0.85 * u ** 1.3)                               # the air past him: it grows (above the words)
rumble = norm(filt(brown(int(nf * SR), 64), "lowpass", 180)) * np.linspace(0.1, 1, int(nf * SR)) ** 1.5
bed.add(pan_st(fade(rumble, 0.05, 0.03), 0), c["release"], db(-13))                                # ... and a rumble under it
for i, b in enumerate(c["burst"]):                                                                 # the brain's camera, on burst (above the words)
    hi_tick(b, -15, 65 + i, -0.5)
bg = filt(boing(0.3, 150.0, 66), "lowpass", 620)                                                    # the net (in the pause after "tower..."): short,
sfx.add(pan_st(fade(bg, 0.001, 0.08), 0), c["net"], db(-11))                                        # because "they" is 0.2 s away
low_thud(c["net"], -12, 90.0, 0.26, 0.08, sfx)

# ================================================================= 7. felt: two bars
low_thud(c["they"], -15, 180.0, 0.14, 0.04)                                                        # the real fall pops in (under "they")
nd = c["fall_end"] - c["remembered"]
bed.add(pan_st(ratchet(nd, 18, 30, 70, edges=True), -0.2), c["remembered"], db(-16))               # the tape is drawn along it ...
nm = c["longer"] - c["a_third"]
bed.add(pan_st(ratchet(nm, 26, 54, 71, edges=True), 0.2), c["a_third"], db(-14))                   # ... and past its end
low_thud(c["longer"], -9, 130.0, 0.3, 0.1)                                                         # +36 % lands (under "longer")
for j, m in enumerate((84, 91)):                                                                   # ... and rings in the pause after it
    sfx.add(bell(mtof(m), 0.3, 0.1) * 0.5, c["ding"] + 0.1 * j, db(-9), pan=0.3)

# ================================================================= 8. new: one more photo
hi_tick(c["new3"], -14, 80, -0.4)
low_thud(c["new3"], -17, 200.0, 0.1, 0.03)
click_flash(c["click3"], -3, -0.4, 5)                                                              # the shutter, in the pause after "new."

# ================================================================= 9. button: a cake slides in; the candles play a tune
ns = int(0.3 * SR)
slide = norm(filt(brown(ns, 90), "lowpass", 210)) * np.sin(np.pi * np.linspace(0, 1, ns)) ** 0.6
bed.add(pan_st(fade(slide, 0.02, 0.05), 0.2), c["or"] - 0.06, db(-10))                              # the plate slides over the cloth (low: under "Or...")
low_thud(c["or"] + 0.24, -12, 130.0, 0.2, 0.06)
TUNE = (67, 67, 69, 67, 72, 71)                                                                    # G G A G C B, on a music box: two notes as the
for i, (tn, m) in enumerate(zip(c["tune"], TUNE)):                                                 # candles catch, four after "birthday." (never on a word)
    sfx.add(music_box(mtof(m + 12), 0.5 if i < 5 else 0.42, 90 + i) * expdecay(int((0.5 if i < 5 else 0.42) * SR), 0.16), tn, db(-12), pan=-0.15 + 0.06 * i)
for i in range(2):                                                                                 # each candle catches (in the pause after "Or...")
    sfx.add(pan_st(fade(filt(white(int(0.09 * SR), 95 + i), "bandpass", [2200, 7000]) * expdecay(int(0.09 * SR), 0.025), 0.004, 0.02), -0.1 + 0.2 * i), c["tune"][i], db(-21))
sfx.add(pan_st(breath(0.36, 96, exhale=True), 0), c["sigh"], db(-17))                              # a sigh (after "birthday.")
sfx.add(pan_st(breath(0.42, 97), 0), c["loop"] + 0.02, db(-15))                                    # ... and he breathes in: back to frame 1

# ================================================================= score (it stops for the horn, the scratch, "tiny", the drop and the tune)
# hook: a party; it stops dead when cake 31 lands, and stays out for the horn and "Relax."
groove(mus, 0.3, c["slam3"] - 0.03, 126, ["F", "Bb"], gain=-11, seed=3, padv=False, cutoff=1300)
# brain: curious, light; after "Your brain"
groove(mus, c["your"] + 0.12, c["in_new"] - 0.06, 108, ["Dm", "Bb"], gain=-12, seed=10, kick_on=False, snaps=False, cutoff=1100)
# ... and stops for "in new memories": her voice drops for the reveal, so nothing plays under it but the photos landing
# kid: the sunniest thing in the Short; it doubles its arpeggio for "lasts forever" and is stopped by the scratch
groove(mus, c["kid"] - 0.1, c["lasts"] - 0.02, 132, ["C", "F", "G", "C"], gain=-15, seed=11, cutoff=1500)
groove(mus, c["lasts"], c["forever_end"] + 0.03, 132, ["F", "G"], gain=-14, seed=12, cutoff=1600, sixteen=True)
# now: no score at all (the clock, the keys, the hum): that is the joke
# payoff: a sneaky walk; it stops before "tiny"
groove(mus, c["think"] + 0.1, c["looks_end"] - 0.05, 96, ["Dm", "A"], gain=-10, seed=20, kick_on=False, snaps=False, arp=False, padv=False)
# the aside: a held breath, then a rise into the tower
drone(mus, c["it_gets"] - 0.05, SHOT["drop"] - 0.05, [38, 45, 50], cutoff=420, gain=-27, seed=30, swell=0.4)
# drop: a tiptoe on the platform; nothing but air on the way down
groove(mus, c["one_lab"] + 0.25, c["dropped"] - 0.04, 100, ["Am", "E"], gain=-13, seed=31, kick_on=False, snaps=False, padv=False, cutoff=1000)
# felt: the proof, light; it stops for the number
groove(mus, c["remembered"] + 0.2, c["longer"] - 0.06, 104, ["F", "Dm"], gain=-14, seed=40, kick_on=False, snaps=False, cutoff=1200)
# new: bright, short; it stops for the shutter
groove(mus, c["try"] + 0.1, c["new3_end"] - 0.02, 116, ["F", "Bb"], gain=-12, seed=41, padv=False, cutoff=1300)
# button: only the music box

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -13.0})
