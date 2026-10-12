"""Why Does Your FUNNY BONE Hurt So Much? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

Two sounds carry it: the knock (an elbow on a door frame, then the same knock heard from inside) and the zap (an
electric buzz that stutters). What sits on a word is kept under 250 Hz or above 5.2 kHz; what carries a joke gets a
pause of the narration to itself: the bang before "You", the zap after "ZAP!", a buzzer after each word the tag
loses, a knock on the bone, the zap again after "PINKY", ba-dum tss after the pun, a cricket after "the joke".
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
WORDS = TL["words"]
YOU = WORDS[0]["start"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C
PAUSE = pause_mask(WORDS, N)                       # 1 where nobody is speaking, 0 under words


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def cut(t, seed, gain=-22.0, f0=400, f1=2000, top=2200):
    """the whoosh into a cut: kept dull, so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def zap_at(t, dur, gain, seed, f0=118.0, rise=0.0, under=-5.0, pan=0.0, env=None):
    """a zap from t: all of it in the pauses of the narration, only its edges (under 250 Hz, above 5.2 kHz) under words"""
    y, e = zap(dur, seed, f0, False, rise), zap(dur, seed, f0, True, rise)
    if env is not None:
        k = env(np.linspace(0, 1, len(y)))
        y, e = y * k, e * k
    i0 = int(t * SR)
    pm = PAUSE[i0:i0 + len(y)]
    pm = np.pad(pm, (0, len(y) - len(pm)))
    sfx.add(pan_st(y * pm, pan), t, db(gain))
    bed.add(pan_st(e, pan), t, db(gain + under))


def tok(t, gain, f=820.0, pan=0.0):
    """a knuckle on bone: a short woody knock (speech band: for a pause)"""
    sfx.add(pan_st(fade(thump(0.085, f * 1.5, f * 0.72, 0.018) + 0.25 * thump(0.085, f * 3.1, f * 2.2, 0.008), 0.0005, 0.02), pan), t, db(gain))


DOOR = ("hook", "button", "loop")
ARM = ("mech", "knock", "name")

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
amb.x += pan_st(room, 0) * 0.22 * gate(N, on(*DOOR))                                  # the hallway
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.4 * gate(N, on(*ARM))                                  # inside his arm: muffled, a slow pulse

# ================================================================= 1. hook: frame 1 is the bang; the zap runs down his arm
sfx.add(pan_st(thump(0.2, 300, 95, 0.05), -0.3), 0.0, db(-8))                         # elbow on wood (before "You") ...
sfx.add(pan_st(fade(bonk(), 0.0005, 0.02)[: int(0.2 * SR)], -0.3), 0.004, db(-13))    # ... a hollow bonk in it
hi_tick(0.0, -8, 1, -0.3)
zap_at(0.05, 0.75, -9, 2, 118.0, 0.0, -9.0, -0.2, lambda u: (1 - u) ** 0.7)          # the first jolt: heard before "You", its edges after
sfx.add(pan_st(filt(whoosh(0.3, 300, 1500, 3, 0.6), "lowpass", 1600), 0.3), 0.07, db(-21))   # the washing takes off
low_thud(0.05 + 0.78, -12, 120.0, 0.22, 0.07)                                         # the basket finds the floor (low, under the words)
for i, dt in enumerate((0.0, 0.07, 0.16)):
    hi_tick(0.05 + 0.78 + dt, -16 - 2 * i, 4 + i, 0.3)
low_thud(1.31, -18, 230.0, 0.08, 0.03)                                                # a sock lands on his head
hi_tick(1.31, -17, 8, 0.2)
b0 = c["whole"] - 0.35                                                                # it builds: three runs down his arm, each a step up
zap_at(b0, c["zap"] - b0, -15, 9, 104.0, 0.7, -2.0, -0.2, lambda u: 0.25 + 0.75 * u ** 1.6)
rs = riser(c["zap"] - b0, 10, 300, 1800)
bed.add(pan_st(filt(rs, "highpass", 5200, 4), 0), b0, db(-17))                        # a rise above the words
low_thud(c["zap"], -10, 92.0, 0.34, 0.11)                                              # ZAP! on the word: a low hit and a crack of top
hi_tick(c["zap"], -9, 11, -0.2)
bed.add(pan_st(zap(c["zap_end"] - c["zap"], 12, 132.0, True), -0.2), c["zap"], db(-11))
zap_at(c["zap_end"] + 0.02, 0.34, -3, 13, 132.0, 0.0, -12.0, -0.2)                     # ... and the zap itself, alone (after "ZAP!")
# the answer: a tag on his elbow loses both its words
hi_tick(c["its"] - 0.06, -13, 14, -0.3)                                               # the tag pops
bz = buzzer(0.19)
sfx.add(pan_st(fade(bz, 0.004, 0.03), -0.2), c["notfunny_end"] + 0.025, db(-17))       # wrong (after "funny,")
sfx.add(pan_st(fade(filt(buzzer(0.2), "lowpass", 1500), 0.004, 0.03), -0.2), c["nota_end"] + 0.025, db(-17))   # wrong again (after "bone,")
hi_tick(c["notfunny_end"] - 0.04, -14, 15, -0.3)                                      # the strikes
hi_tick(c["nota_end"] - 0.04, -14, 16, -0.3)
low_thud(c["window"] + 0.02, -15, 170.0, 0.14, 0.05)                                  # a window opens on his elbow
hi_tick(c["window"] + 0.02, -13, 17, -0.3)
low_thud(c["nerve"], -12, 98.0, 0.3, 0.1)                                             # NERVE!
hi_tick(c["nerve"], -11, 18, -0.2)
zap_at(c["nerve_end"] + 0.02, 0.15, -6, 19, 150.0, 0.0, -12.0, -0.2)                  # it answers to its name (after "NERVE!")
cut(SHOT["mech"] + 0.04, 20, -19, 300, 1500, 1900)                                    # into his arm

# ================================================================= 2. mech: tucked under muscle, bare at the elbow
run_n = c["arm2_end"] - SHOT["mech"] - 0.1
bed.add(pan_st(buzz_hi(run_n, 27.0, 21), 0.0), SHOT["mech"] + 0.1, db(-21))           # a signal going the whole way down (above the words)
for i, t0 in enumerate((c["under"], c["muscle"], c["down"], c["down"] + 0.2)):        # four muscles tuck it in (low, under the words)
    low_thud(t0, -14, 150.0 + 16 * i, 0.12, 0.04)
    hi_tick(t0 + 0.02, -15, 22 + i, 0.3 if i % 2 else -0.3)
sc = scratch(0.12, 26)
sfx.add(pan_st(fade(sc, 0.003, 0.02), 0.0), c["arm2_end"] + 0.02, db(-6))            # ... except (a record scratch, in the pause)
low_thud(c["except"], -12, 110.0, 0.26, 0.09)                                         # the bare stretch lights up
hi_tick(c["except"] + 0.02, -12, 27, -0.3)
hi_tick(c["bone3"], -12, 28, 0.2)                                                     # the bone lights up
low_thud(c["bone3"], -13, 140.0, 0.16, 0.05)
tok(c["bone3_end"] + 0.03, -7, 840.0, 0.1)                                           # knock, knock: bone (after "bone,")
tok(c["bone3_end"] + 0.14, -8, 760.0, 0.1)
hi_tick(c["skin"], -12, 29, -0.3)                                                     # one thin line of skin
sq = squeak(0.085, 1700, 1150)
sfx.add(pan_st(fade(sq, 0.004, 0.02), -0.2), c["skin_end"] + 0.03, db(-14))            # the nerve, a small "eep" (after "skin.")

# ================================================================= 3. knock: the door frame, heard from inside
cut(SHOT["knock"] + 0.02, 30, -24, 300, 1300, 1700)
wh = filt(whoosh(c["squash"] - c["knock"] + 0.14, 200, 900, 31, 0.92), "lowpass", 240)
bed.add(pan_st(wh, -0.4), c["knock"] - 0.14, db(-9))                                  # the frame arrives (low)
low_thud(c["squash"], -9, 78.0, 0.42, 0.14)                                           # squash: a heavy knock, on the word, under it
hi_tick(c["squash"], -8, 32, -0.3)
sq2 = squeak(0.07, 2400, 1500)
sfx.add(pan_st(fade(sq2, 0.003, 0.015), -0.2), c["squash_end"] + 0.012, db(-15))       # a squashed toy (after "it,")
ch_n = c["zap2"] - c["squash"] - 0.12
bed.add(pan_st(zap(ch_n, 33, 96.0, True, 0.5) * np.linspace(0.4, 1, int(ch_n * SR)), -0.2), c["squash"] + 0.1, db(-17))   # it charges (edges)
go_n = c["pinky"] - c["zap2"]
zap_at(c["zap2"] - 0.04, go_n, -15, 34, 110.0, 0.9, -2.0, 0.0, lambda u: 0.4 + 0.6 * u)   # ... and goes, up his forearm
rs2 = riser(go_n, 35, 300, 2000)
bed.add(pan_st(filt(rs2, "highpass", 5200, 4), 0), c["zap2"], db(-17))
low_thud(c["pinky"], -11, 100.0, 0.3, 0.1)                                             # it lands
hi_tick(c["pinky"], -10, 36, -0.3)
zap_at(c["pinky_end"] + 0.02, 0.2, -4, 37, 140.0, 0.0, -12.0, -0.3)                   # the tingle (after "PINKY,")
hi_tick(c["nerve2"] - 0.04, -14, 38, -0.3)                                            # the label
sfx.add(pan_st(fade(ding(98, 0.12, 39, 1.4), 0.001, 0.04), -0.3), c["ends_end"] + 0.03, db(-17))   # the very end of it (after "ends.")

# ================================================================= 4. name: the bone it is squashed against
cut(SHOT["name"] + 0.02, 40, -25, 300, 1300, 1700)
low_thud(c["bone4"], -12, 82.0, 0.26, 0.09)                                           # the bone throbs (low)
low_thud(c["squashed"], -12, 74.0, 0.26, 0.09)
hi_tick(c["against"], -13, 41, 0.2)                                                   # ?
low_thud(c["humerus"], -11, 150.0, 0.16, 0.05)                                         # its name tag is slapped on
hi_tick(c["humerus"], -9, 42, 0.0)
pr = page_rip(0.14, 43)
bed.add(pan_st(filt(pr, "highpass", 5200, 4), 0.0), c["humorous"] - 0.05, db(-12))    # the tag turns over (above the word)
low_thud(c["humorous"] + 0.1, -15, 180.0, 0.1, 0.035)
sfx.add(rimshot(44), c["rimshot"], db(-7))                                           # ba-dum tss (after "Humorous.")
low_thud(c["maybe"], -11, 105.0, 0.22, 0.07)                                           # UNPROVEN, stamped
hi_tick(c["maybe"], -11, 45, 0.3)
hi_tick(c["joke"] - 0.02, -14, 46, -0.3)                                              # the last tag
for i, dt in enumerate((0.09, 0.27)):                                                 # ... a cricket (after "the joke.")
    sfx.add(pan_st(cricket(47 + i, 3, 4500 + 150 * i), 0.4), c["joke_end"] + dt, db(-15))

# ================================================================= 5. button: nobody is laughing
for i in range(5):                                                                    # he rubs his elbow (air, above the words)
    t0 = SHOT["button"] + 0.12 + 0.31 * i
    m = int(0.16 * SR)
    bed.add(pan_st(fade(filt(white(m, 50 + i), "highpass", 5600, 4) * np.sin(np.pi * np.linspace(0, 1, m)) ** 2, 0.004, 0.03), -0.2), t0, db(-24))
bwomp(sfx, c["laughing_end"] + 0.06, 36, -13)                                         # wah (after "LAUGHING.")
low_thud(c["laughing_end"] + 0.34, -17, 200.0, 0.08, 0.03)                            # the sock gives up
for i, dt in enumerate((0.06, 0.24)):                                                 # he is off again: two steps, and frame 1 is the bang
    low_thud(c["loop"] + dt, -11, 150.0 - 10 * i, 0.12, 0.04, sfx)

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is silent (nobody says "subscribe", 9 Oct 2026) and plays under the button line, so
# these three sounds sit under spoken words. Nothing here may mask one (qa.py lists weak words).
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-25))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-27))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-21))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-32))

# ================================================================= score (drops out for every punchline)
# the hallway: a light pizzicato groove. It starts after "You", and stops for ZAP!
groove(mus, c["bang"] + 0.1, c["zap"] - 0.06, 116, ["C", "F"], gain=-12, seed=10, kick_on=False)
# the answer: a sneaky walk (bass and snaps), with holes for the two buzzers; "it's a naked NERVE!" lands on a held chord
groove(mus, c["its"] + 0.14, c["nota_end"] - 0.03, 96, ["Am", "E"], gain=-10, seed=11, arp=False, padv=False, kick_on=False)
drone(mus, c["window"], c["nerve"] - 0.04, [45, 52, 57, 60], cutoff=700, gain=-25, seed=12, swell=0.35)
# inside: a curious minor loop, cut by the scratch on "except"
groove(mus, c["hides"], c["arm2_end"] - 0.02, 112, ["Dm", "Gm", "Dm", "A"], gain=-12, seed=13, kick_on=False)
# bare, on bone: a held chord, out before the knock on the bone; "right under the skin." has the room to itself
drone(mus, c["runs"], c["bone3_end"], [50, 57, 62, 65], cutoff=460, gain=-29, seed=14, swell=0.4)
# the zap goes: quick and bright, cut off for PINKY
groove(mus, c["zap2"] - 0.06, c["pinky"] - 0.08, 132, ["F", "C"], gain=-13, seed=15, kick_on=False, sixteen=True)
groove(mus, c["where2"] + 0.1, c["ends"] - 0.05, 112, ["Dm", "A"], gain=-14, seed=16, kick_on=False, snaps=False)
# the bone: the sneaky walk again, and then nothing at all (the pun, the rimshot, the cricket, the last line)
groove(mus, c["bone4"], c["against_end"] - 0.03, 96, ["Dm", "A"], gain=-10, seed=17, arp=False, padv=False, kick_on=False)
silence(mus, [(c["zap"] - 0.05, c["its"] + 0.12), (c["notfunny_end"] - 0.02, c["its2"] + 0.06), (c["nota_end"] - 0.04, c["window"] - 0.01),
              (c["nerve"] - 0.03, c["hides"] - 0.01), (c["arm2_end"] - 0.01, c["runs"] - 0.01), (c["bone3_end"] - 0.02, c["zap2"] - 0.07),
              (c["pinky"] - 0.07, c["where2"] + 0.08), (c["ends"] - 0.04, c["bone4"] - 0.01),
              (c["against_end"] - 0.02, DUR)])

# ================================================================= voice + mix
# the music bus sits 3 dB under the house level: this narration has soft line endings ("skin.", "PINKY,", "ends.")
master(WORK, sfx, bed, mus, amb, levels={"music": -14.0}, duck={"music": 0.74})
