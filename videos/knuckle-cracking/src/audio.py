"""What Happens When You CRACK Your Knuckles? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

The rule of this mix: every loud sound (the door, Mom, the fizz, the pop, the doctor's cracks, the dings) sits in a
pause of the narration. What happens ON a word is on the bed bus, either under 250 Hz (thuds, the stretch) or above
5 kHz (ticks, sparkles), so the word stays clear. The one exception is the big CRACK: it lands on the word "CRACK!"
itself, on the frame, as a burst of 90 ms.
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


DEN = ("hook", "crack", "button")
BODY = ("soda", "fluid", "pull")

# ================================================================= ambience (one bed per world, gated to its shots)
fan = norm(filt(brown(N, 1), "lowpass", 220) + 0.25 * np.sin(2 * np.pi * 118 * tt))                 # his room: the computer's fan
amb.x += pan_st(fan, 0) * 0.36 * gate(N, on(*DEN))
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.5 * gate(N, on(*BODY))                                             # inside the hand: muffled, a slow pulse
knock = norm(filt(buzz(N, 58, 6, 0.2), "lowpass", 330)) * (np.sin(2 * np.pi * 5.5 * tt) > 0.1)     # the scanner: its knocking, kept low
amb.x += pan_st(filt(knock, "lowpass", 360), 0) * 0.42 * gate(N, on("mri", "scan"), 0.08)
office = norm(filt(brown(N, 7), "lowpass", 260))
amb.x += pan_st(office, 0) * 0.3 * gate(N, on("doctor"))                                          # the doctor's office: a hush
neon = norm(np.sin(2 * np.pi * 100 * tt) + 0.5 * np.sin(2 * np.pi * 200 * tt) + 0.25 * filt(brown(N, 8), "lowpass", 200))
amb.x += pan_st(neon, 0) * 0.34 * gate(N, on("xray"), 0.05)                                       # the lightbox: mains hum

# ================================================================= 1. hook: his fingers lock; the knuckles tick; CRACK
bed.add(pan_st(filt(creak(0.34, 3, 70, 150), "lowpass", 230, 4), 0), 0.0, db(-15))                    # the fingers lock (low: it is under "You lock")
bed.add(pan_st(filt(rustle(0.22, 4), "highpass", 5000), 0.1), 0.0, db(-24))
for i, tk in enumerate(c["crk"]):                                                                # one small tick per knuckle
    free = i == 5                                                                                # the last one falls between "push," and "and"
    (sfx if free else bed).add(pan_st(knuckle_crack(10 + i, 1, 0.0, 1500 + 120 * i, 0.7, edges=not free), 0.25 * (-1) ** i), tk, db(-15 if free else -9 + i))
nr = c["crack"] - c["push"]
rz = filt(white(int(nr * SR), 5), "highpass", 5400) * np.linspace(0, 1, int(nr * SR)) ** 2.4          # the strain: a hiss that climbs (above the words)
bed.add(pan_st(fade(rz, 0.05, 0.004), 0), c["push"], db(-25))
swell = np.sin(2 * np.pi * np.cumsum(np.linspace(52, 88, int(nr * SR))) / SR) * np.linspace(0, 1, int(nr * SR)) ** 2
bed.add(pan_st(fade(swell, 0.05, 0.004), 0), c["push"], db(-14))                                    # ... and a low swell under it
sfx.add(pan_st(knuckle_crack(21, 6, 0.085, 1150, 1.0), 0), c["crack"], db(-3))                     # THE crack, on the frame and on the word
sfx.add(pan_st(knuckle_crack(22, 4, 0.07, 1500, 0.6), -0.3), c["crack"] + 0.03, db(-9))
low_thud(c["crack"], -4, 120.0, 0.4, 0.14)
# ================================================================= 2. crack: the door, Mom, the x-ray
low_thud(c["door"], -11, 130.0, 0.36, 0.1, sfx)                                                    # the door bangs open (the pause after "CRACK!")
sfx.add(pan_st(fade(crack(0.07, 23, 0.02, 500), 0.0005, 0.03), 0.5), c["door"] + 0.005, db(-15))
sfx.add(pan_st(springs(24, 0.22), 0.5), c["door"] + 0.03, db(-22))
gm = c["no"] - c["mom"] - 0.06                                                                     # Mom, scolding: a voice with no words, until just before "No"
sfx.add(pan_st(gibber(gm, 25, 330.0, False, 0.0, 26.0), 0.45), c["mom"], db(-11))
bed.add(pan_st(beep(5600, 0.2) * np.linspace(1, 0.3, int(0.2 * SR)), -0.4), c["no"] - 0.06, db(-27))   # the x-ray slides in (above the words)
low_thud(c["no"] - 0.05, -14, 90.0, 0.3, 0.1)
for j, m in enumerate((84, 91)):                                                                   # the verdict: a ding in the pause after "harmed."
    sfx.add(bell(mtof(m), 0.3, 0.1) * 0.5, c["tick"] + 0.1 * j, db(-8), pan=-0.3)

# ================================================================= 3. soda: the can, the tab, psst
cut(SHOT["soda"], 30, -19, 400, 2000, 2400)
bed.add(pan_st(bloop(260, 150, 0.12), 0.1), c["cracked"] - 0.14, db(-15))                          # the can pops into the joint (low: under "just")
hi_tick(c["open"], -19, 31, 0.1)                                                                   # the tab (above "open")
low_thud(c["open"], -15, 180.0, 0.12, 0.03)
npz = int(0.4 * SR)                                                                                # psst: the fizz, in the pause after "soda."
psst = filt(white(npz, 32), "bandpass", [2600, 9000]) * (np.minimum(1, ar(npz) / 0.012) * np.exp(-ar(npz) / 0.16))
sfx.add(pan_st(fade(psst + 0.5 * crackle(npz, 500, 33, 3000, 9000) * np.exp(-ar(npz) / 0.2), 0.001, 0.05), 0.2), c["psst"], db(-8))
for k in range(4):
    sfx.add(pan_st(bloop(900 + 160 * k, 1500 + 200 * k, 0.05), 0.2), c["psst"] + 0.1 + 0.055 * k, db(-22))

# ================================================================= 4. fluid: sealed, slippery, dissolved gas
cut(SHOT["fluid"], 40, -21, 300, 1500, 1900)
zp = filt(hair_zip(0.5, True, 41, 26), "highpass", 5000)                                           # the bag is sealed: a zip (above the words)
bed.add(pan_st(zp, -0.2), c["sealed"] - 0.04, db(-21))
for k in range(3):                                                                                 # the bones glide (low: under "slippery fluid")
    bed.add(pan_st(bloop(210 - 30 * (k % 2), 120, 0.16), 0.2 * (-1) ** k), c["slippery"] + 0.06 + 0.24 * k, db(-14))
for k in range(7):                                                                                 # the gas shows: tiny sparkles (above the words)
    hi_tick(c["dissolved"] + 0.02 + 0.15 * k, -24 - (k % 3), 42 + k, 0.5 * (-1) ** k)
sfx.add(pan_st(gas_hiss(0.26, 43), -0.2), c["gas_end"] + 0.03, db(-6))                            # ... and a little fizz in the pause after "gas."

# ================================================================= 5. pull: stretch, the pressure falls, POP
ns = c["stretch_end"] - c["stretch"]
bed.add(pan_st(filt(creak(ns + 0.1, 50, 60, 170), "lowpass", 400), 0), c["stretch"], db(-10))      # rubber, stretching (low: under "Stretch it")
sfx.add(pan_st(creak(0.17, 51, 170, 360, (520, 1100, 2100)), 0.1), c["stretch_end"] + 0.03, db(-15))   # ... and its squeak in the pause after "it..."
nd = c["drops_end"] - c["drops"]
fall = np.sin(2 * np.pi * np.cumsum(np.linspace(230, 80, int(nd * SR))) / SR)                      # the needle falls (low: under "drops")
bed.add(pan_st(fade(fall, 0.02, 0.05), 0.3), c["drops"], db(-15))
sfx.add(pan_st(slide_whistle(0.24, 1300, 520), 0.3), c["drops_end"] + 0.02, db(-21))               # ... and once aloud in the pause
nq = c["pop"] - c["and_pop"]
bed.add(pan_st(fade(filt(white(int(nq * SR), 52), "highpass", 5400) * np.linspace(0, 1, int(nq * SR)) ** 2, 0.03, 0.004), 0), c["and_pop"], db(-23))
low_thud(c["pop"], -3, 110.0, 0.36, 0.12)                                                          # POP: a thud under the word ...
hi_tick(c["pop"], -16, 53)
sfx.add(pan_st(cork_pop(54, 540.0), 0), c["pop_snd"], db(-3))                                      # ... and the pop itself in the pause after it
sfx.add(pan_st(bloop(520, 1250, 0.09), 0.1), c["pop_snd"] + 0.05, db(-13))
for j, m in enumerate((88, 95)):                                                                   # there it is: a bright ding after "A bubble."
    sfx.add(bell(mtof(m), 0.32, 0.12) * 0.5, c["bubble_end"] + 0.04 + 0.09 * j, db(-15), pan=0.2)

# ================================================================= 6. mri: the scan and the sound
cut(SHOT["mri"], 60, -22, 300, 1400, 1800)
for i, tk in enumerate(c["winch"][:-1]):                                                          # the winch winds in steps (on the words: thuds and ticks)
    low_thud(tk, -13, 170.0, 0.14, 0.04)
    hi_tick(tk, -20, 63 + i, 0.4)
for k in range(3):                                                                                 # ... and once aloud, in the pause after "MRI..."
    sfx.add(pan_st(key_click(66 + k), 0.4), c["ratchet"] + 0.05 * k, db(-6))
cut(SHOT["scan"] + 0.12, 67, -24, 300, 1300, 1700)
low_thud(c["on_crack"], -7, 120.0, 0.3, 0.1)                                                       # the bubble arrives (under "crack")
hi_tick(c["on_crack"], -17, 61)
sfx.add(pan_st(knuckle_crack(62, 3, 0.05, 1300, 0.8), 0.1), c["on_crack_end"] + 0.06, db(-1))      # ... and the crack itself, in the pause after it

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is mid-video, so the narration carries on right after the word "subscribe".
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-22))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-24))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-9))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-30))

# ================================================================= 7. doctor: one hand, every day, for fifty years
snd = set(round(x, 3) for x in c["dcrack_snd"])
for i, tk in enumerate(c["dcracks"]):                                                              # his left hand cracks on a beat
    if round(tk, 3) in snd:
        continue
    bed.add(pan_st(knuckle_crack(70 + i, 2, 0.04, 1300, 0.8, edges=True), 0.35), tk, db(-10))      # (on the words: thuds and ticks only)
for i, tk in enumerate(c["dcrack_snd"]):                                                           # the ones in the pauses are heard
    sfx.add(pan_st(knuckle_crack(80 + i, 3, 0.055, 1250 + 80 * i, 0.9), 0.35), tk, db(-8))
clock_ticks(c["one_doctor"] + 0.3, c["for"], bed, db(-31))                                         # a clock on the wall ...
ticking(c["for"] + 0.04, c["years_end"] - 0.1, bed, db(-29), 7, 26, 73)                            # ... that runs away with the years
bed.add(pan_st(filt(rustle(c["years_end"] - c["for"] - 0.1, 74), "highpass", 4800), 0), c["for"] + 0.05, db(-25))   # calendar pages

# ================================================================= 8. xray: the lightbox, the look, two ticks
low_thud(SHOT["xray"], -8, 100.0, 0.3, 0.08)                                                       # the lightbox comes on
dr = c["neither"] - c["arth"] - 0.04
bed.add(pan_st(filt(drumroll(dr, 75), "highpass", 300), 0), c["arth"] + 0.02, db(-17))             # a drum roll through "Arthritis?" ... it stops for the answer
low_thud(c["neither"], -9, 140.0, 0.26, 0.08)                                                      # a tick lands on each hand (under the words) ...
low_thud(c["neither2"], -9, 150.0, 0.26, 0.08)
for j, m in enumerate((84, 88, 91)):                                                               # ... and the all-clear in the pause after "hand."
    sfx.add(bell(mtof(m), 0.34, 0.12) * 0.5, c["neither_end"] + 0.04 + 0.085 * j, db(-13), pan=-0.2 + 0.2 * j)

# ================================================================= 9. button: MYTH. "Sorry, Mom." The door. Again
st = SHOT["button"] + 0.3
low_thud(st, -15, 150.0, 0.3, 0.07, sfx)                                                            # the stamp (the pause before "Sorry")
sfx.add(pan_st(fade(crack(0.05, 90, 0.012, 1200), 0.0005, 0.02), 0.4), st, db(-18))
sfx.add(pan_st(gibber(0.2, 91, 175.0, False, 0.0, 15.0), 0.45), c["hmph"], db(-12))                # Mom: hmph (after "Mom.")
low_thud(c["loop"] + 0.14, -16, 120.0, 0.34, 0.1, sfx)                                              # she shuts the door
sfx.add(pan_st(fade(crack(0.04, 92, 0.01, 1500), 0.0005, 0.02), 0.5), c["loop"] + 0.15, db(-17))
sfx.add(pan_st(filt(creak(0.3, 3, 70, 150), "lowpass", 420), 0), DUR - 0.3, db(-16))               # his fingers lock again: back to frame 1

# ================================================================= score (it stops for the crack, the fizz, the pop and the verdict)
SNEAK = ["Am", "E"]
# hook: a tiptoe while he pushes; it stops dead for the CRACK, and stays out for Mom and the deadpan answer
groove(mus, c["lock"] + 0.12, c["crack"] - 0.05, 100, SNEAK, gain=-12, seed=3, kick_on=False, snaps=False, padv=False, cutoff=1000)
# soda: bouncy, after "Your knuckle"; it stops for the fizz
groove(mus, c["knuckle"] + 0.3, c["soda_end"] - 0.02, 112, ["F", "Bb"], gain=-12, seed=10, padv=False, cutoff=1200)
# fluid: the curious mechanism groove
groove(mus, c["each"] + 0.5, c["gas_end"] - 0.02, 108, ["F", "Dm", "Bb", "C"], gain=-13, seed=11, snaps=False, cutoff=1200)
# pull: a held breath and a plucked bass; dead silent from "and" to the pop
drone(mus, SHOT["pull"] + 0.06, c["and_pop"] - 0.04, [38, 45, 50], cutoff=380, gain=-27, seed=30, swell=0.3)
groove(mus, c["stretch"] + 0.5, c["and_pop"] - 0.04, 100, ["Dm", "Gm"], gain=-14, seed=31, kick_on=False, snaps=False, arp=False, padv=False)
# mri: a sneaky walk for the proof; it stops for "the crack"
groove(mus, c["sci"] + 0.5, c["on_crack"] - 0.12, 96, ["Dm", "A"], gain=-13, seed=20, kick_on=False, snaps=False, arp=False, padv=False)
# doctor: a stride piano, as if it were an old film; it runs away with the fifty years
rag(mus, c["one_doctor"] + 0.32, c["he"] - 0.1, 126, gain=-16, seed=40, melody=False)
rag(mus, c["he"] + 0.3, c["for"] - 0.02, 126, gain=-12, seed=40)
rag(mus, c["for"], c["years_end"] - 0.02, 186, gain=-12, seed=41)
# xray and button: no score (the drum roll, the dings, the stamp)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -13.0})
