"""Why Do We Get HICCUPS? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

The hiccup is the star: every HIC sits in a pause of the narration (after "and-", after "door.", after "tadpoles.",
after "shut.", after "tadpole."), with the score dead silent round it. What happens ON a word (the doors slamming on
"slammed" and "SHUT", the muscle jerking on "JERKS") is a low thud on the bed bus, under the speech band.
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


def hic(t, seed, f0, gain, big=2.0, pan=0.0, table=True):
    """a hiccup, and what it does to the table"""
    sfx.add(pan_st(hiccup(seed, f0, big), pan), t, db(gain))
    if big > 1.2:
        sfx.add(thump(0.24, 170, 60, 0.07), t + 0.005, db(gain - 9))
    if table:
        for j, m in enumerate((96, 101)):                                                # the glasses
            sfx.add(bell(mtof(m), 0.22, 0.07) * 0.5, t + 0.05 + 0.03 * j, db(gain - 16), pan=0.3 + 0.2 * j)
        sfx.add(pan_st(fade(jingle(0.26, seed + 40, 46), 0.002, 0.1), -0.2), t + 0.04, db(gain - 21))   # the cutlery


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a door (or a muscle) heard through the body: almost all of it under 200 Hz, so it can sit on a word"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))
    (bus or bed).add(pan_st(filt(bonk(), "lowpass", 600), 0), t, db(gain - 10))


TABLE = ("hook", "smooth", "again", "button")
BODY = ("door", "fizz", "jerk")
POND = ("pond", "gulp")
GULP_P = DUR / round(3.6 * DUR)                    # the swallow's clock (scenes.js: gulpAt)

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 240))                                          # the restaurant: a hush ...
amb.x += pan_st(room, 0) * 0.3 * gate(N, on(*TABLE))
murmur = norm(filt(pink(N, 2), "bandpass", [160, 430]) * (0.65 + 0.35 * norm(filt(white(N, 3), "lowpass", 2))))
amb.x += pan_st(murmur, 0) * 0.36 * gate(N, on(*TABLE))                                 # ... and other tables, far off (under the speech band)
pulse = norm(filt(pink(N, 4), "bandpass", [45, 240]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt) ** 2))
amb.x += pan_st(pulse, 0) * 0.5 * gate(N, on(*BODY))                                    # inside him: muffled, a slow pulse
deep = norm(filt(brown(N, 5), "lowpass", 300) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.35 * tt)))
amb.x += pan_st(deep, 0) * 0.5 * gate(N, on(*POND))                                     # underwater
rb = np.random.default_rng(7)
tk = SHOT["pond"] + 0.5
while tk < END["gulp"] - 0.3:                                                           # bubbles going up, now and then
    f = rb.uniform(380, 760)
    bed.add(blip(f, f * 1.7, 0.06, int(tk * 100), 0.025), tk, db(-31), pan=rb.uniform(-0.8, 0.8))
    tk += rb.uniform(0.25, 0.7)

# ================================================================= 1. hook: glug, glug, glug ... aah ... HIC!
def glug(seed, f0=300.0, f1=105.0):
    """a swallow pitched under the speech band (the first words of the Short are spoken over the first two)"""
    n = int(0.3 * SR)
    y = np.zeros(n)
    m = int(0.018 * SR)
    y[:m] += 0.6 * filt(white(m, seed), "bandpass", [800, 2600]) * expdecay(m, 0.004)
    b = bloop(f0, f1, 0.24)
    i = int(0.03 * SR)
    y[i:i + len(b)] += b[: n - i]
    return fade(y, 0.001, 0.03)


gk = 0
while gk * GULP_P < c["lower"] - 0.12:                                                  # he chugs: one swallow per bob of his head
    if gk < 2:
        bed.add(pan_st(glug(10 + gk), 0.1), gk * GULP_P, db(-5 if gk == 0 else -9))     # frame 1: low, so it stays out of the way of "You chug"
    else:
        bed.add(pan_st(gulp(10 + gk), 0.1), gk * GULP_P, db(-15))
    gk += 1
nf = int((c["lower"] + 0.1) * SR)
bed.add(pan_st(crackle(nf, 420, 11, 5200, 11000, 0.0008) * np.linspace(1, 0.5, nf), 0.2), 0.0, db(-29))     # the fizz, above her words
bed.add(pan_st(filt(whoosh(0.3, 300, 1500, 12, 0.75), "lowpass", 1800), 0), 0.0, db(-26))                   # the camera settles
bed.add(pan_st(filt(whoosh(0.5, 900, 300, 13, 0.5), "lowpass", 1400), 0), c["first"] - 0.3, db(-25))        # ... and pulls back to the table
sfx.add(pan_st(breath(0.2, 14, True), 0.1), c["aah"], db(-23))                           # aah (the pause before "and-")
hic(c["hic1"], 1, 410.0, -1.0)                                                           # HIC! (after "and-")
sfx.add(pan_st(fade(hiss(0.16, 15, 0.05), 0.002, 0.06), -0.5), c["hic1"] + 0.11, db(-20))   # the candle goes out: pff
sfx.add(pan_st(filt(breath(0.2, 16), "highpass", 900), 0.6), c["hic1"] + 0.3, db(-24))   # across the table, a small gasp

# ================================================================= 2. smooth: the room, and one drop off his chin
sfx.add(pan_st(drip(20, 1250), 0.0), SHOT["smooth"] + 0.86, db(-10))                     # plip (the pause after "Smooth.")

# ================================================================= 3. door: into his throat. The doors slam on his own breath
sfx.add(pan_st(filt(whoosh(0.3, 300, 2400, 30, 0.85), "lowpass", 3000), 0), SHOT["door"] - 0.2, db(-17))
sfx.add(thump(0.24, 130, 48, 0.07), SHOT["door"] - 0.02, db(-16))
na = int((c["slam1"] - SHOT["door"]) * SR)
airflow = norm(filt(pink(na, 31), "bandpass", [4600, 9500])) * np.minimum(1, np.linspace(0, 6, na)) * (0.7 + 0.3 * np.sin(2 * np.pi * 3 * ar(na)))
bed.add(pan_st(airflow, 0), SHOT["door"], db(-24))                                       # his breath going down: air, above the words; it stops dead ...
low_thud(c["slam1"], -5.5)                                                               # ... when the doors slam (under "slammed": low)
sfx.add(pan_st(squeak(0.07, 1500, 1900), 0.1), c["sign"] - 0.07, db(-19))                # the sign drops on its strings ...
sfx.add(bell(mtof(88), 0.3, 0.1) * 0.5, c["sign"] + 0.02, db(-8), pan=0.1)              # ... ding (the pause after "door...")
sfx.add(pan_st(bonk(), 0.0), c["bump1"], db(-5))                                         # his breath runs into them: bonk (after "breath.")
sfx.add(thump(0.14, 180, 70, 0.04), c["bump1"], db(-12))
sfx.add(pan_st(squeak(0.09, 1700, 900), 0.1), c["bump1"] + 0.05, db(-15))

# ================================================================= 4. fizz: the stomach balloons, and pokes the muscle above it
nfz = c["stomach_end"] - SHOT["fizz"]
bed.add(pan_st(filt(gurgle(nfz, 40, 24), "lowpass", 1500), 0.3), SHOT["fizz"], db(-23))                     # soda coming down
nc = int((c["it"] - SHOT["fizz"]) * SR)
bed.add(pan_st(crackle(nc, 520, 41, 5200, 11000, 0.0008), 0.3), SHOT["fizz"], db(-28))                      # fizz
bed.add(pan_st(balloon_inflate(c["stomach_end"] - c["swells"], 42), 0.3), c["swells"], db(-28))             # it stretches
bed.add(pan_st(blip(600, 900, 0.06, 43, 0.03), -0.3), c["stomach"] - 0.06, db(-24))                         # label
bed.add(pan_st(bloop(250, 140, 0.13), 0.3), c["poke1"], db(-14))                         # poke (low: it is under "poking")
bed.add(pan_st(bloop(280, 150, 0.13), 0.3), c["poke2"], db(-14))                         # poke
bed.add(pan_st(blip(700, 1000, 0.06, 44, 0.03), -0.2), c["breathing"] - 0.04, db(-24))   # label
sfx.add(pan_st(bloop(330, 130, 0.17), 0.3), c["poke3"], db(-6))                          # POKE (the pause after "muscle.")
sfx.add(pan_st(squeak(0.07, 1300, 1800), 0.3), c["poke3"] + 0.01, db(-14))
gr = hum_voice(0.17, 122.0, 45, 0.35)
sfx.add(pan_st(fade(gr * np.linspace(1, 0.6, len(gr)), 0.01, 0.04), -0.3), c["grunt"], db(-3))             # the muscle: "hm!"

# ================================================================= 5. jerk: it snaps down, air rushes in, the cords snap shut. Air hits the door
low_thud(c["jerk"], -5.0, 135.0, 0.42, 0.14)                                             # the muscle jerks (under "JERKS": low)
bed.add(pan_st(breath(0.36, 50), 0.0), c["jerk"] + 0.02, db(-15))                        # ... and he gasps
nr = int((c["slam2"] - c["jerk"]) * SR)
rush = norm(filt(pink(nr, 51), "bandpass", [4600, 9500])) * np.minimum(1, np.linspace(0, 14, nr)) * np.linspace(1, 0.72, nr)
bed.add(pan_st(rush, 0), c["jerk"], db(-23))                                             # the air coming in (above the words) ...
bed.add(pan_st(filt(whoosh(0.5, 400, 1600, 52, 0.6), "lowpass", 1800), 0), c["vocal"] - 0.1, db(-25))      # the camera goes up to the voice box
low_thud(c["slam2"], -5.0)                                                               # ... until the cords snap SHUT (low: it is under the word)
for j, dt in enumerate((0.0, 0.14, 0.28)):                                               # the air piles up on the doors: three soft thuds (under "hits the door")
    bed.add(thump(0.11, 210 + 30 * j, 80, 0.03), c["bump2"] + dt, db(-11))
hic(c["hic2"], 2, 395.0, -1.0)                                                           # HIC! (after "door.")

# ================================================================= 6. again: the subscribe aside; something comes up in his glass
sfx.add(pan_st(filt(thump(0.06, 420, 200, 0.02), "highpass", 150), -0.2), c["hic2"] + 0.42, db(-21))       # his hand over his mouth
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-21))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-23))
    sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-2))                                    # the click, in the pause after "Subscribe..."
    sfx.add(pan_st(key_click(73), 0), c["sub_tap"] + 0.004, db(-4))
    sfx.add(pan_st(bell(1760, 0.3, 0.07) * 0.5, 0.2), c["sub_tap"] + 0.05, db(-20))
bed.add(pan_st(bloop(170, 70, 0.3), 0.3), c["peek"], db(-13))                             # it comes up (low: under "it gets")
sfx.add(pan_st(squelch(0.2, 60), 0.3), c["squelch"], db(-3))                             # ... slimy (the pause after "slimy.")
sfx.add(pan_st(filt(whoosh(0.24, 1800, 300, 61, 0.7), "lowpass", 2600), 0.2), c["squelch"] + 0.07, db(-15))  # we dive into the glass

# ================================================================= 7. pond: one idea. Tadpoles
bed.add(thump(0.5, 110, 36, 0.2), SHOT["pond"], db(-6))                                  # under water (low: it is under "Why?")
bed.add(pan_st(filt(splash(0.7, 70), "lowpass", 700), 0), SHOT["pond"], db(-15))
bed.add(thump(0.16, 220, 90, 0.05), c["one"] + 0.2, db(-10))                             # the stamp lands
bed.add(pan_st(blip(600, 1000, 0.07, 71, 0.03), -0.4), c["wegot"] - 0.22, db(-26))        # his picture
sfx.add(pan_st(hiccup(5, 400.0, 1.0), -0.35), c["hicpair"], db(-3))                      # the two of them, together: hic (the pause after "tadpoles.")
sfx.add(pan_st(hiccup(6, 650.0, 1.0), 0.35), c["hicpair"] + 0.05, db(-3))

# ================================================================= 8. gulp: water in, out over the gills; the same door, shut
for k in range(3):
    g = c["gulp1"] + 1.25 * k
    if g > c["shut2_end"] - 0.5:
        break
    bed.add(pan_st(filt(whoosh(0.5, 200, 620, 80 + k, 0.5), "lowpass", 700), -0.4), g, db(-14))            # in at the mouth
    bed.add(pan_st(filt(gurgle(0.42, 83 + k, 32), "lowpass", 1300), 0.3), g + 0.74, db(-18))               # out over the gills
bed.add(pan_st(blip(700, 1000, 0.06, 86, 0.03), 0.4), c["gills"] - 0.04, db(-24))        # label
bed.add(pan_st(filt(whoosh(0.4, 400, 1500, 87, 0.6), "lowpass", 1700), 0), c["with"] - 0.1, db(-25))       # the camera goes to the doors
bed.add(pan_st(blip(900, 1300, 0.06, 88, 0.03), -0.4), c["same"] - 0.06, db(-23))        # his own doors, in a frame
for j in range(2):                                                                       # water knocks on them (low: under "shut")
    bed.add(thump(0.09, 240, 100, 0.03), c["knock"] + 0.14 * j, db(-11))
sfx.add(pan_st(hiccup(7, 660.0, 1.0), -0.3), c["tadhic"], db(-3))                        # the tadpole: hic (the pause after "shut.")
sfx.add(pan_st(blip(500, 900, 0.08, 89, 0.04), -0.4), c["tadhic"] + 0.07, db(-17))       # ... and a bubble

# ================================================================= 9. button: not nervous ... part tadpole. Ribbit. Hic. The glass goes back up
sfx.add(pan_st(filt(whoosh(0.22, 500, 1800, 90, 0.8), "lowpass", 2600), 0), SHOT["button"] - 0.1, db(-22))
sfx.add(pan_st(breath(0.2, 91, True), 0.0), c["phew"], db(-13))                          # phew (the pause after "nervous.")
sfx.add(pan_st(filt(whoosh(0.2, 600, 2800, 92, 0.3), "lowpass", 4200), 0), c["poof"] - 0.02, db(-7))       # poof (the pause after "You're...")
for j, m in enumerate((84, 88, 91)):
    sfx.add(bell(mtof(m), 0.16, 0.05) * 0.5, c["poof"] + 0.03 + 0.035 * j, db(-15), pan=-0.2 + 0.2 * j)
sfx.add(pan_st(ribbit(93, 330.0), 0.0), c["croak"], db(-8))                              # ribbit (after "tadpole.")
hic(c["hic3"], 8, 600.0, -5.0, big=1.5)                                                  # hic (a small one: he is a tadpole)
sfx.add(pan_st(filt(whoosh(0.2, 2600, 700, 94, 0.3), "lowpass", 4200), 0), c["unpoof"] - 0.02, db(-13))     # ... and he is back
sfx.add(pan_st(filt(whoosh(0.3, 500, 1700, 95, 0.7), "lowpass", 2200), 0.1), c["unpoof"] + 0.12, db(-20))   # the glass goes up
gk = int(np.ceil(c["loop"] / GULP_P))
while gk * GULP_P < DUR - 0.05:                                                          # glug: the same clock as frame 1, so the loop is one move
    sfx.add(pan_st(gulp(10 + gk), 0.1), gk * GULP_P, db(-11))
    gk += 1

# ================================================================= score (it drops out for every hiccup and every punchline)
DATE = ["Dm", "G", "C", "Am"]
# hook: a date-night strut; the hiccup stops it dead
groove(mus, 0.28, c["hic1"], 100, DATE, gain=-11, seed=3, kick_on=False, padv=False, cutoff=1000)
# door: one low held chord while we are in his throat; the slam cuts it
drone(mus, SHOT["door"] + 0.05, c["slam1"], [45, 52, 57], cutoff=420, gain=-27, seed=20, swell=0.25)
# fizz: the bouncy mechanism groove (after "Fizz"); it stops for the last poke and the muscle's grunt
groove(mus, c["swells"], c["muscle_end"], 112, ["Dm", "Bb", "F", "C"], gain=-12, seed=10, snaps=False, cutoff=1200)
# jerk: after "and your", a rise into SHUT; the doors cut it
groove(mus, c["andyour"] + 0.26, c["slam2"], 124, ["Dm", "Gm", "A", "A"], gain=-13, seed=11, kick_on=False, snaps=False, sixteen=True, cutoff=1300)
_rz = riser(c["slam2"] - c["snap"] + 0.3, 12, 200, 1300)
mus.add(pan_st(filt(_rz, "lowpass", 1500), 0), c["snap"] - 0.3, db(-27))
# the aside: a light strut under "it gets slimy"
groove(mus, c["itgets"], c["squelch"], 104, ["C", "F"], gain=-13, seed=42, kick_on=False, padv=False, cutoff=1100)
# pond: curious, slow; it stops for the two hiccups, comes back for "They gulp water", and stops again on "shut"
groove(mus, c["one"], c["tadpoles_end"], 96, ["C", "Am", "F", "G"], gain=-13, seed=50, kick_on=False, snaps=False, cutoff=1000)
groove(mus, c["gulp"] + 0.24, c["shut2"], 96, ["F", "G", "C", "Am"], gain=-13, seed=51, kick_on=False, snaps=False, cutoff=1000)
# button: the date-night strut again, until "You're..."
groove(mus, c["so"] + 0.3, c["youre_end"], 100, DATE, gain=-14, seed=3, kick_on=False, padv=False, cutoff=1000)
silence(mus, [(c["hic1"] - 0.02, SHOT["door"] + 0.04), (c["slam1"] - 0.01, c["swells"] - 0.01), (c["muscle_end"] + 0.02, c["andyour"] + 0.25),
              (c["slam2"] - 0.01, c["itgets"] - 0.01), (c["squelch"] - 0.01, c["one"] - 0.01), (c["tadpoles_end"] + 0.04, c["gulp"] + 0.23),
              (c["shut2"] - 0.02, c["so"] + 0.29), (c["youre_end"] + 0.04, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -13.0})
