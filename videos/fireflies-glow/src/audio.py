"""How Do Fireflies GLOW? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

The rule of this mix: every sound that carries a joke or a flash (the firefly's pips, the snap, the buzzer, the ding,
the tap, the chew, the burp, the spit, the fork on the glass) sits in a pause of the narration. What happens ON a
word is on the bed bus, either under 250 Hz (the lid, thuds, the heat) or above 5 kHz (air, fizz, ticks), so the word
stays clear. A firefly's flash is one small pip (lamp_pip): it is heard in the first pause and comes back as the code.
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
    """air, fizz or wings that can run under words: only above 5.2 kHz"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(filt(white(n, seed), "highpass", 5200, 4) * env, 0.004, 0.03), pan), t0, db(gain))


def pip(t, gain=-13.0, f=1760.0, dur=0.1, pan=0.0, seed=0):
    """a firefly's flash, aloud: only ever in a pause"""
    sfx.add(pan_st(lamp_pip(f, dur, seed), pan), t, db(gain))


JAR = ("hook", "button")
MEADOW = ("stick", "cold", "bulb", "blink", "code", "reply", "fake", "date", "eat", "why", "spider", "armour")
INSIDE = ("tail", "valve")

# ================================================================= ambience (one bed per world, gated to its shots)
night = norm(filt(brown(N, 1), "lowpass", 240) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.21 * tt)))
amb.x += pan_st(night, 0) * 0.34 * gate(N, on(*JAR, *MEADOW))                       # a summer night: still, warm air
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.44 * gate(N, on(*INSIDE))                            # inside the lamp: muffled, a slow pulse
board = norm(filt(brown(N, 6), "lowpass", 200))
amb.x += pan_st(board, 0) * 0.24 * gate(N, on("snap"))
# crickets, far off and thin (above the words): they stop dead when the lights go out
for a, b in ((0.3, SHOT["snap"] - 0.1), (SHOT["cold"], SHOT["valve"] - 0.1), (SHOT["code"], c["dark"] - 0.05), (c["because"] + 0.4, SHOT["eat"] - 0.05), (SHOT["why"], DUR - 0.2)):
    crickets(a, b, bed, db(-31), seed=int(a * 10), f=5300, rate=0.9)

# ================================================================= 1. hook: the lid, the lamp, the hands
sfx.add(pan_st(fade(thump(0.05, 190.0, 80.0, 0.016), 0.001, 0.015), 0.1), c["clap"], db(-14))   # the lid lands, on frame 2: over before "You"
sfx.add(pan_st(fade(glass_tink(1, 2600.0, 0.05), 0.0005, 0.015), 0.2), c["clap"], db(-17))
air(c["clap"] + 0.06, c["clap"] + 0.55, -20, 2, lambda u: (1 - u) ** 2, 0.2)        # ... and gets its twist: a thin scrape of tin
air(0.3, c["jar"], -24, 3, lambda u: 0.5 + 0.5 * np.sin(u * 60) ** 2, -0.2)         # wings against the glass
low_thud(c["lit"], -13, 120.0, 0.5, 0.2)                                            # the lamp swells (under "jar")
air(c["lit"], c["lit"] + 0.5, -21, 4, lambda u: (1 - u) ** 1.5)
air(c["hand"] - 0.1, c["glows_end"], -19, 5, lambda u: np.sin(np.pi * u) ** 0.5)    # the light climbs his hands (above the words)
swell = norm(filt(brown(int((c["glows_end"] - c["hand"] + 0.1) * SR), 7), "lowpass", 190))
bed.add(pan_st(fade(swell * np.linspace(0.2, 1, len(swell)), 0.05, 0.12), 0), c["hand"] - 0.1, db(-14))
for i, b in enumerate(c["blinks"]):                                                  # it blinks at him, twice: the first pips
    pip(b, -12, 1760.0, 0.1, -0.1 + 0.2 * i, i)

# ================================================================= 2. stick: the answer (no score: the line is deadpan)
cut(SHOT["stick"], 20, -19, 400, 2000, 2400)
low_thud(c["stick"], -13, 140.0, 0.25, 0.08)                                        # the glow stick comes up (under "stick")
sfx.add(pan_st(blip(500, 1100, 0.1, 21, 0.035), 0.3), c["stick_end"] + 0.06, db(-13))   # ... and its pop, in the pause
sfx.add(pan_st(blip(700, 1500, 0.08, 22, 0.03), 0.1), c["stick_end"] + 0.2, db(-17))    # the equals sign
hi_tick(c["wings"], -13, 23, 0.3)                                                   # the wings pop (on "wings")
bz = mosquito_whine(0.2, 24, 380.0, 0.5, False, False)                               # ... and it buzzes, in the pause
sfx.add(pan_st(fade(bz, 0.01, 0.05), 0.3), c["buzz"], db(-8))

# ================================================================= 3. snap: bend it, and two liquids meet
nb = int((c["crack"] - c["same"]) * SR)
bendy = norm(filt(buzz(nb, 64, 30, 0.6), "lowpass", 230)) * np.linspace(0.2, 1, nb) ** 2
bed.add(pan_st(fade(bendy, 0.03, 0.01), 0), c["same"], db(-14))                     # plastic under strain (low: under "Same trick")
sfx.add(pan_st(fade(knuckle_crack(31, 1, 0.01, 1500.0, 1.0), 0.0005, 0.02)[: int(0.12 * SR)], 0), c["crack"], db(-7))   # SNAP, between "trick." and "Two"
air(c["crack"] + 0.05, SHOT["tail"] + 0.1, -17, 32, lambda u: (1 - u) ** 0.8)       # the fizz of the mix (above "Two chemicals")
low_thud(c["crack"] + 0.02, -14, 130.0, 0.4, 0.16)

# ================================================================= 4. tail: fuel, enzyme, oxygen, light
cut(SHOT["tail"], 40, -21, 300, 1500, 1900)
for i, dt in enumerate((0.2, 0.42)):                                                 # the two labels (ticks: on the words)
    hi_tick(SHOT["tail"] + dt, -15, 41 + i, -0.3 + 0.6 * i)
air(c["meet"], c["glow_end"], -18, 43, lambda u: 0.25 + 0.75 * np.minimum(1, u * 2.2), -0.4)   # air down the pipe (above the words)
hi_tick(c["oxygen"], -14, 44, -0.4)
ng = int((c["glow_end"] - c["and_glow"] + 0.15) * SR)
rise = norm(filt(brown(ng, 45), "lowpass", 200)) * np.linspace(0.15, 1, ng) ** 1.5
bed.add(pan_st(fade(rise, 0.05, 0.1), 0), c["and_glow"], db(-12))                    # the lamp fills (low: under "and glow")
for i, m in enumerate((84, 91)):                                                     # ... and it is on: two notes, in the pause after "glow."
    sfx.add(fade(music_box(mtof(m), 0.17, 46 + i) * expdecay(int(0.17 * SR), 0.05), 0.001, 0.03), c["glow_end"] + 0.03 + 0.08 * i, db(-13), pan=-0.2 + 0.4 * i)

# ================================================================= 5. cold: no flame, almost no heat
hi_tick(c["flame"], -14, 50, 0.4)                                                   # the flame's badge pops (on "flame")
sfx.add(pan_st(fade(buzzer(0.2), 0.002, 0.03), 0.3), c["cross"], db(-17))            # ... and is crossed out, in the pause
hi_tick(c["almost"], -14, 51, 0.4)                                                  # the thermometer
sfx.add(bell(mtof(91), 0.14, 0.05) * 0.6, c["cool"], db(-14), pan=0.35)              # it reads cool: ping (a short pause)

# ================================================================= 6. bulb: what a filament would do
low_thud(c["a_light"] + 0.02, -13, 150.0, 0.2, 0.06)                                # a bulb screws in (under "A light")
nh = c["cook_end"] - c["bulbw"]
fr = fire_rumble(nh, 60, 240.0)
bed.add(pan_st(fade(fr * np.linspace(0.25, 1, len(fr)), 0.03, 0.06), 0), c["bulbw"], db(-12))   # the heat builds (under the words)
air(c["would"], c["cook_end"] + 0.05, -15, 61, lambda u: 0.3 + 0.7 * u)             # he starts to sizzle (above the words)
sfx.add(fade(bell(mtof(96), 0.27, 0.08) * 0.7, 0.001, 0.05), c["ding"], db(-8), pan=0.25)   # DING. He is done (the pause after "him.")

# ================================================================= 7. blink: three small flashes under the words, two aloud
for i, tb in enumerate((c["the_blink"] + 0.02, c["blinking"] + 0.1, c["blinking"] + 0.32)):
    hi_tick(tb, -15, 70 + i)
for i, tb in enumerate(c["pips"]):
    pip(tb, -12, 1760.0, 0.09, 0.0, 3 + i)

# ================================================================= 8. valve: the tap on the air pipe
cut(SHOT["valve"], 80, -21, 300, 1500, 1900)
air(SHOT["valve"] + 0.05, c["cuts"] + 0.04, -19, 81, lambda u: np.minimum(1, u * 8) * np.minimum(1, (1 - u) * 30), -0.4)   # air in the pipe ...
low_thud(c["cuts"] + 0.02, -8, 120.0, 0.3, 0.1)                                     # the tap turns: clunk (under "cuts")
hi_tick(c["cuts"], -11, 82, -0.4)
sfx.add(pan_st(squeak(0.09, 1500, 2300), -0.4), c["reopen"], db(-15))                # ... and back on, in the pause after "oxygen."
pip(c["reopen"] + 0.1, -13, 1760.0, 0.1, 0.0, 6)

# ================================================================= 9. code: three species
cut(SHOT["code"], 90, -20, 400, 2000, 2400)
for i, tb in enumerate((c["code_end"] + 0.05, c["code_end"] + 0.19)):                # his two pips, after "code."
    pip(tb, -14, 1760.0, 0.08, -0.4, 8 + i)
pip(c["own_end"] + 0.03, -18, 1320.0, 0.12, 0.4, 10)                                 # the amber one's long flash, after "own..."

# ================================================================= 10. reply: he flashes, she flashes back
for i, tb in enumerate(c["hisflash"]):
    pip(tb, -11, 1760.0, 0.08, -0.5, 11 + i)                                         # his two (the pause after "flashes,")
pip(c["herflash"], -13, 2217.0, 0.2, 0.5, 13)                                        # her one, higher and longer (after "back.")
sfx.add(pan_st(blip(900, 1900, 0.09, 91, 0.03), 0), c["heart"], db(-20))             # a heart

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is mid-video, so the narration carries on right after the word "subscribe".
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-24))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-26))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-9))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-30))
low_thud(c["dark"] + 0.02, -8, 100.0, 0.4, 0.14)                                    # every lamp goes out (under "dark")
sfx.add(pan_st(key_click(92), 0), c["dark_end"] + 0.03, db(-5))                     # ... the switch, in the pause
sfx.add(pan_st(cricket(93, 3, 4700), 0.5), c["dark_end"] + 0.17, db(-13))            # one cricket, alone in the dark

# ================================================================= 11. fake: the mask, and a borrowed flash
low_thud(c["because"] + 0.05, -15, 90.0, 0.6, 0.25)                                 # her lamp comes up, slowly
low_thud(c["fake"], -11, 140.0, 0.22, 0.07)                                         # the mask slips, the stamp lands (under "fake")
hi_tick(c["fake"], -13, 100, -0.4)
pip(c["fakeflash"], -13, 2093.0, 0.11, 0.2, 14)                                      # the same one flash, a shade flat (after "answer.")

# ================================================================= 12. date: he comes down with flowers
air(c["he_flies"], c["date"], -22, 110, lambda u: 0.5 + 0.5 * np.sin(u * 70) ** 2, -0.5)   # his wings (above the words)
for i, m in enumerate((84, 88, 91)):                                                 # hearts: three notes up, in the pause after "date..."
    sfx.add(fade(music_box(mtof(m), 0.2, 111 + i) * expdecay(int(0.2 * SR), 0.06), 0.001, 0.03), c["date_end"] + 0.04 + 0.07 * i, db(-17), pan=-0.4 + 0.2 * i)

# ================================================================= 13. eat: no music at all
low_thud(c["and_she"], -13, 130.0, 0.2, 0.06)                                       # the mask goes; the napkin goes on
low_thud(c["eats"], -5, 90.0, 0.4, 0.14)                                            # CHOMP (the picture): a thud under "eats"
hi_tick(c["eats"], -10, 120)
sfx.add(pan_st(chomp(121), 0.1), c["crunch"], db(-9))                                # she chews, in the pause after "him."
sfx.add(pan_st(chomp(122), 0.1), c["crunch"] + 0.11, db(-13))
bp = burp(0.16, 123, 150.0)
sfx.add(pan_st(fade(bp, 0.004, 0.04), 0.1), c["burp"], db(-11))                       # ... and a small glowing burp
pip(c["burp"] + 0.05, -19, 1760.0, 0.1, 0.1, 15)

# ================================================================= 14. why: a spider tries one
sfx.add(fade(pizz(mtof(62), 0.16, 130), 0.001, 0.04), c["why_end"] + 0.03, db(-18), pan=0.2)             # she picks her teeth: hm
cut(SHOT["spider"], 131, -21, 300, 1500, 1900)
sl = slurp(0.2, 132, 16.0)
sfx.add(pan_st(fade(sl, 0.005, 0.04), 0.2), c["slurp"], db(-12))                     # the lick, in the pause after "tastes"
low_thud(c["awful"], -12, 110.0, 0.3, 0.1)                                          # it goes green (under "awful")
sq = squelch(0.24, 133)
sfx.add(pan_st(fade(sq, 0.004, 0.05), 0.2), c["yuck"], db(-10))                      # ptooey, in the pause after "spiders."
sfx.add(pan_st(blip(1300, 500, 0.12, 134, 0.05), 0.3), c["yuck"] + 0.03, db(-15))

# ================================================================= 15. armour: the same spider, and her
for i, dt in enumerate((0.05, 0.18, 0.31)):                                          # it tiptoes up, in the pause after "Now..."
    sfx.add(pizz(mtof(57 + 2 * i), 0.2, 140 + i), c["now_end"] + dt, db(-19), pan=0.5 - 0.1 * i)
sw = slide_whistle(0.3, 1500, 600)
sfx.add(pan_st(fade(sw, 0.01, 0.06), 0.5), c["nope"], db(-19))                       # ... and leaves, quickly (after "she.")
air(c["nope"], c["nope"] + 0.4, -20, 143, lambda u: (1 - u), 0.6)

# ================================================================= 16. button: a fork on the glass; the lid
cut(SHOT["button"], 150, -20, 400, 2000, 2400)
for i, tb in enumerate(c["taps"]):                                                   # tink, tink, tink (the pause after "jar?")
    sfx.add(pan_st(glass_tink(151 + i, 2900.0 + 120 * i, 0.14), 0.35), tb, db(-10 - (1 if i else 0)))
hf = breath(0.24, 154, exhale=True)
sfx.add(pan_st(fade(hf, 0.01, 0.06), 0.4), c["huff"], db(-15))                       # she gives up (after "night.")
air(c["huff"] + 0.15, c["huff"] + 0.75, -19, 155, lambda u: (1 - u) ** 0.7 * (0.5 + 0.5 * np.sin(u * 60) ** 2), 0.6)   # ... and goes
air(c["loop"], DUR, -22, 156, lambda u: u ** 1.5, 0.2)                               # the lid comes up again: tin on glass, into frame 1

# ================================================================= score (it stops for every punchline, and when the lights go out)
# hook: wonder, small; it rises with the light and stops on "glows!"
groove(mus, 0.42, c["glows_end"] - 0.05, 100, ["F", "C", "Dm", "Bb"], gain=-13, seed=3, kick_on=False, snaps=False, cutoff=1300)
# stick: nothing (the answer is deadpan); snap: nothing but the plastic
# tail: curious; after "in its tail", out before "and glow" (the reveal is the three notes)
groove(mus, c["in_its"] + 0.2, c["oxygen_end"] + 0.02, 112, ["Dm", "Bb"], gain=-13, seed=10, kick_on=False, snaps=False, cutoff=1100)
# cold: light on its feet; it stops when the bulb goes in (the heat is the tension)
groove(mus, c["almost"] + 0.1, c["a_light"] - 0.04, 116, ["C", "Am"], gain=-13, seed=20, kick_on=False, cutoff=1200)
# valve: a sneaky walk; it stops with the air
groove(mus, c["think"] + 0.05, c["cuts"] - 0.03, 96, ["Dm", "A"], gain=-8, seed=30, kick_on=False, snaps=False, arp=False, padv=False)
# code: busy, bright; then softer for the two of them, and gone before the aside's last word
groove(mus, c["every"] - 0.05, c["own_end"] - 0.02, 120, ["F", "Bb"], gain=-14, seed=40, kick_on=False, cutoff=1400, sixteen=True)
groove(mus, c["flashes2"] + 0.12, c["back_end"] - 0.02, 92, ["F", "Dm"], gain=-14, seed=41, kick_on=False, snaps=False, cutoff=1200)
# fake and date: something is wrong (a low drone), over a tiptoe; cut dead before "and she eats him"
drone(mus, c["because"] + 0.3, c["date_end"] + 0.02, [38, 45], cutoff=320, gain=-30, seed=50, swell=0.5)
groove(mus, c["females"], c["date_end"] - 0.05, 104, ["Dm", "A"], gain=-13, seed=51, kick_on=False, snaps=False, arp=False, padv=False)
# eat: nothing. why/spider: a bounce; armour: only the tiptoe
groove(mus, c["he_tastes"] + 0.25, c["spiders_end"] - 0.06, 126, ["C", "F"], gain=-14, seed=60, kick_on=False, cutoff=1300)
# button: the opening again, for "So that jar?"; nothing under the last line; two notes after it
groove(mus, c["so_that"] + 0.1, c["jar2_end"] - 0.02, 100, ["F", "C"], gain=-13, seed=3, kick_on=False, snaps=False, cutoff=1300)
for i, m in enumerate((84, 89)):
    sfx.add(music_box(mtof(m), 0.6, 160 + i) * expdecay(int(0.6 * SR), 0.2), c["huff"] + 0.34 + 0.2 * i, db(-17), pan=-0.1 + 0.2 * i)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -13.0})
