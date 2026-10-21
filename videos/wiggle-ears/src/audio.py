"""Why Can't Most People WIGGLE Their Ears? 👂 Short: sound design, score and mix, cue-locked to timeline.json.

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
from mixlib import LEVELS, master

AMB_LEVEL = LEVELS["amb"] - 3.0   # the loud party is the ambience's peak (the bus is normalised to it): 3 dB down

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


def low_thud(t, gain, f=150.0, dur=0.3, tau=0.09, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def shimmer(t, gain, n=7, up=True, seed=0):
    """skin turning see-through (or back): a run of tiny glass notes above the speech band"""
    for i in range(n):
        f = 5600 + 380 * (i if up else n - 1 - i)
        bed.add(pan_st(glint(f, 0.08, seed + i), -0.4 + 0.8 * i / max(1, n - 1)), t + 0.045 * i, db(gain))


def strain(t0, t1, gain, seed):
    """him straining to wiggle his ears: a low creak (under 220 Hz) and a trembling buzz (above 5.2 kHz); both can sit under words"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    u = np.linspace(0, 1, n)
    cr = filt(creak(t1 - t0, seed, 34, 70), "lowpass", 220)[:n]
    bz = buzz_hi(t1 - t0, 27.0, seed + 1)[:n]
    env = 0.55 + 0.45 * u
    bed.add(pan_st(fade(norm(cr) * env, 0.02, 0.05), 0.0), t0, db(gain))
    bed.add(pan_st(fade(norm(bz) * env, 0.02, 0.05), 0.15), t0, db(gain - 4))


def boppers(t0, t1, gain, seed):
    """the headband's springy stars bouncing with his brows: tiny springs above the speech band, on the brow bob"""
    rate = 2.6
    k = 0
    t = t0
    while t < t1:
        bed.add(pan_st(glint(6800 + 500 * (k % 2), 0.05, seed + k), (-1) ** k * 0.35), t, db(gain))
        t += 1.0 / rate
        k += 1


# ================================================================= ambience: the party behind him (muffled), and the brain's room
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
amb.x += pan_st(room, 0) * 0.2 * gate(N, [(0, SHOT["brain"]), (END["brain"], DUR)])
# a far-off party murmur: voices with everything over 420 Hz taken out, so it never sits in her band
crowd = sum(np.roll(gibber(DUR, 60 + i, 150.0 + 40 * i, thin=False, rate=17.0 + 2.5 * i)[:N], int(SR * 0.37 * i)) for i in range(4))
crowd = norm(filt(crowd, "lowpass", 420))
amb.x += pan_st(crowd, 0) * 0.16 * gate(N, [(0, SHOT["brain"]), (END["brain"], DUR)])
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.3 * gate(N, [(SHOT["brain"] - 0.3, END["brain"])])
# the loud party: the murmur swells under "Strain to hear at a loud party" (still under 420 Hz), plus a crowd's top end above 5 kHz
loud = gate(N, [(c["noise"], c["theyre"] - 0.1)])
amb.x += pan_st(crowd, 0) * 0.3 * loud
sizzle = norm(filt(pink(N, 7), "highpass", 5400)) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * tt) ** 2)
amb.x += pan_st(sizzle, 0.1) * 0.06 * loud

# ================================================================= 1. the hook: he strains, his brows bob, his ears don't move
strain(0.0, c["noeb_end"] + 0.2, -17, 1)                                              # from frame 0 (the loop hands him over straining)
boppers(0.05, c["clamp"], -24, 2)
hi_tick(c["five"] - 0.02, -17, 3, 0.35)                                               # 1 IN 5 pops on
low_thud(c["clamp"] + 0.02, -13, 190.0, 0.16, 0.05)                                    # "No eyebrows!": the brows slam down
bed.add(pan_st(buzz_hi(0.9, 31.0, 4), 0.0), c["clamp"] + 0.05, db(-21))                # ... and tremble (above the words)
strain(c["noeb_end"] + 0.1, c["nope"] - 0.05, -16, 5)                                  # the gap: he (and the viewer) keep trying
sd = slide(420, 150, 0.36, top=None)
sfx.add(pan_st(fade(sd, 0.005, 0.06), 0.0), c["nope_end"] + 0.04, db(-10.5))            # he deflates (after "Nope?")

# ================================================================= 2. the window on his forehead, the dive, the brain's room
shimmer(c["win"] - 0.04, -21, 6, True, 10)                                             # the window opens
sfx.add(pan_st(filt(whoosh(0.62, 300, 2600, 11, 0.8), "highpass", 1800), 0), c["dive"], db(-20))   # the dive (thin: under "brain lost")
low_thud(c["dive_end"] - 0.02, -14, 160.0, 0.22, 0.06)                                 # we land in the room
for i in range(4):                                                                      # it pats itself down: soft pats under the words
    low_thud(c["dive_end"] + 0.03 + 0.11 * i, -19, 210.0, 0.08, 0.02)
low_thud(c["poster"], -12, 200.0, 0.14, 0.04)                                           # the MISSING poster slaps onto the wall
hi_tick(c["poster"] + 0.004, -14, 6, 0.3)
low_thud(c["stamp"] + 0.03, -12, 220.0, 0.12, 0.04)                                     # the LAST SEEN sticker slaps on
hi_tick(c["stamp"] + 0.034, -14, 7, 0.4)
for i in range(5):
    bed.add(pan_st(glint(5800 + 420 * i, 0.07, 12 + i), 0.2 + 0.1 * i), c["stamp"] + 0.06 + 0.05 * i, db(-23))
sh = slide(330, 190, 0.22, top=None)
sfx.add(pan_st(fade(sh, 0.004, 0.05), 0.0), c["shrug"], db(-10.5))                       # the shrug (after "ago.")

# ================================================================= 3. it mashes the buttons it DOES have
for i, t in enumerate(c["jabs"]):                                                       # click-click-click: a knock and a tick each
    low_thud(t + 0.02, -15, 240.0 - 6 * (i % 3), 0.07, 0.018)
    hi_tick(t + 0.022, -16, 20 + i, 0.25 + 0.05 * (i % 2))
bg = boing(0.5, 150.0, 3)
sfx.add(pan_st(fade(filt(bg, "lowpass", 340), 0.002, 0.06), 0.0), c["boing"], db(-13))   # EYEBROWS!: both shoot up (a low spring under the word)
for i in range(5):
    bed.add(pan_st(glint(6200 + 520 * i, 0.06, 26 + i), -0.3 + 0.15 * i), c["boing"] + 0.02 + 0.03 * i, db(-19))
bg2 = boing(0.34, 260.0, 7)
sfx.add(pan_st(fade(bg2, 0.002, 0.05), 0.0), c["eb_end"] + 0.04, db(-11))               # they wobble (after "EYEBROWS!")

# ================================================================= 4. the ear muscles: still there, asleep, three per ear
shimmer(c["glass"], -21, 7, True, 30)                                                   # his ear goes see-through
sn = snore(0.32, 31, 64.0)
bed.add(pan_st(fade(sn, 0.02, 0.06), -0.3), c["there_end"] + 0.02, db(-13))             # a tiny snore (after "there.")
for i, k in enumerate(("m1", "m2", "m3")):                                              # the badges 1 2 3 (above the words)
    bed.add(pan_st(glint(6000 + 600 * i, 0.09, 33 + i), -0.3 + 0.3 * i), c[k], db(-17))

# ================================================================= 5. the wires still work: a balloon pops, the ear twitches
bed.add(pan_st(zap(0.5, 36, 118.0, edges=True, rise=0.3), -0.2), c["light"], db(-19))  # the wires light up (only lows and highs)
bed.add(pan_st(fade(buzz_hi(1.2, 22.0, 37), 0.05, 0.3), -0.2), c["light"] + 0.3, db(-26))   # a faint live hum
cp = cork_pop(38, 700.0)
sfx.add(pan_st(fade(cp, 0.0005, 0.02), -0.45), c["pop"], db(-11))                      # POP! (the sound the line names, in its pause)
sfx.add(pan_st(fade(filt(white(int(0.05 * SR), 39), "bandpass", [900, 7000]) * expdecay(int(0.05 * SR), 0.01), 0.0005, 0.01), -0.45), c["pop"], db(-14))
low_thud(c["pop"] + 0.01, -14, 120.0, 0.14, 0.05)
hi_tick(c["pop"] + 0.1, -18, 40, -0.3)                                                  # the reflex twitch, straight after
hi_tick(c["tw1"], -16, 41, -0.35)                                                       # "twitch": a tick on the word
tw = boing(0.26, 330.0, 42)
sfx.add(pan_st(fade(tw, 0.002, 0.04), -0.3), c["tw2"], db(-12))                         # and a tiny boing (after "twitch.")

# ================================================================= 6. a loud party: the top ones FLEX
bed.add(pan_st(fade(filt(creak(0.6, 45, 40, 90), "lowpass", 230), 0.02, 0.05), -0.2), c["top"] - 0.05, db(-15))   # they tense (under "top ones")
st = slide(150, 420, 0.24, top=None)
sfx.add(pan_st(fade(st, 0.01, 0.04), 0.0), c["flex_end"] + 0.03, db(-11.5))              # FLEX: a rubbery stretch up (after "FLEX.")
low_thud(c["flex_end"] + 0.28, -12, 150.0, 0.2, 0.06)                                   # ... and the pump
for i in range(4):
    bed.add(pan_st(glint(6400 + 400 * i, 0.07, 46 + i), -0.4 + 0.25 * i), c["flex_end"] + 0.3 + 0.04 * i, db(-20))

# ================================================================= 7. the button: still trying; "Are you?"; back to straining
for i in range(4):                                                                     # the muscles keep pumping (lows only)
    low_thud(c["theyre"] + 0.05 + 0.35 * i, -19, 170.0, 0.1, 0.03)
shimmer(c["shut"] - 0.04, -22, 6, False, 50)                                            # the see-through skin goes
strain(c["you_end"] + 0.42, DUR, -17, 51)                                               # into frame 0: straining again
boppers(c["you_end"] + 0.6, DUR - 0.05, -24, 52)

# ================================================================= score (drops out for every punchline)
BPM = 108
# the hook: a light pizzicato groove in C while he strains; it stops for "No eyebrows!" and the try
groove(mus, 0.3, c["no"] - 0.08, BPM, ["C", "F"], gain=-13, seed=10, kick_on=False, snaps=False)
# the brain's room: a curious marimba walk under the MISSING poster
groove(mus, c["lost"] + 0.05, c["ago_end"] - 0.04, 100, ["Dm", "A", "Dm", "Gm"], gain=-13, seed=11, kick_on=False, padv=False, snaps=False)
# the button mashing: quick and silly; it stops for EYEBROWS!
groove(mus, c["mashes"] + 0.1, c["have_end"] - 0.03, 132, ["F", "C"], gain=-13, seed=12, kick_on=False, arp=True, snaps=False)
# the sleepers: a soft drone under "still there, three per ear"
drone(mus, c["muscles"] + 0.1, c["ear3_end"] - 0.03, [48, 55, 60, 64], cutoff=420, gain=-31, seed=13, swell=0.4)
# the wires: a curious groove, holes for the POP and the twitch
groove(mus, c["wires"] + 0.15, c["work_end"] - 0.03, 112, ["Am", "E"], gain=-13, seed=14, kick_on=False, snaps=False)
groove(mus, c["sound"] + 0.25, c["twitch_end"] - 0.03, 112, ["Am", "E", "Am", "E"], gain=-13, seed=15, kick_on=False, snaps=False)
# the loud party: a dance groove with a kick, under "Strain to hear at a loud party... and the top ones"; it stops for FLEX
groove(mus, c["strain"] + 0.2, c["party_end"] - 0.03, 120, ["Am", "F", "C", "G"], gain=-12, seed=16, kick_on=True, snaps=True)
# "They're still trying." on a light pulse; "Are you?" in silence; then the hook's groove again into frame 0
groove(mus, c["theyre"] + 0.1, c["trying_end"] - 0.03, 108, ["C", "G"], gain=-15, seed=17, kick_on=False, arp=False, padv=False, snaps=False)
groove(mus, c["you_end"] + 0.35, DUR, BPM, ["C", "F"], gain=-13, seed=18, kick_on=False, snaps=False)
silence(mus, [(c["no"] - 0.08, c["lost"] + 0.03), (c["ago_end"] - 0.03, c["mashes"] + 0.08), (c["have_end"] - 0.02, c["muscles"] + 0.08),
              (c["ear3_end"] - 0.02, c["wires"] + 0.12), (c["work_end"] - 0.02, c["sound"] + 0.22), (c["twitch_end"] - 0.02, c["strain"] + 0.18),
              (c["party_end"] - 0.02, c["theyre"] + 0.08), (c["trying_end"] - 0.02, c["you_end"] + 0.33)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -13.5, "amb": AMB_LEVEL}, duck={"music": 0.72})
