"""Why Do You See STARS When You Rub Your Eyes? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

Three sounds carry it: the stars (a sprinkle of glass, kept above 5 kHz under words and let out whole in the pauses),
the telephone (an old bell that rings twice in the pause after "your brain." and twice more after "the same call."),
and the sensors' one word (a tiny squeaky voice in the pauses after LIGHT! and after "anyway."). What sits on a word
is kept under 260 Hz or above 5.2 kHz; what carries a joke gets a pause of the narration to itself.
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
RUB_HZ = 2.7                                       # the rub's clock (scenes.js)

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C
PAUSE = pause_mask(WORDS, N)                       # 1 where nobody is speaking, 0 under words


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None, pan=0.0):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(pan_st(thump(dur, f, f * 0.3, tau), pan), t, db(gain))


def cut(t, seed, gain=-22.0, f0=400, f1=2000, top=2200):
    """the whoosh into a cut: kept dull, so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0, dur=0.03):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(dur * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def glint(f=6200.0, dur=0.09, seed=0):
    """one tiny glass note above the speech band (a star coming out): it can sit on a word"""
    n = int(dur * SR)
    t = ar(n)
    r = np.random.default_rng(300 + seed)
    y = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t + r.uniform(0, 6)) + 0.25 * np.sin(2 * np.pi * f * 2.02 * t)
    return fade(y * attack_decay(n, 0.002, dur * 0.32), 0.0005, 0.02) / 1.75


def twinkle(t0, t1, gain, seed, rate=9.0, lo=5400.0, hi=8200.0):
    """a sprinkle of glints between t0 and t1 (bed bus, above 5 kHz: under words)"""
    r = np.random.default_rng(seed)
    t = t0
    while t < t1:
        bed.add(pan_st(glint(r.uniform(lo, hi), r.uniform(0.06, 0.11), int(t * 1000)), r.uniform(-0.7, 0.7)), t, db(gain + r.uniform(-4, 0)))
        t += r.exponential(1.0 / rate)


def glass_run(t, notes, step, gain, dur=0.13, pan=0.0):
    """a quick run of glassy notes, full band (for a pause): MIDI notes, `step` s apart"""
    for i, m in enumerate(notes):
        y = fade((bell(mtof(m), dur, dur * 0.4) + 0.3 * bell(mtof(m + 12), dur, dur * 0.25)), 0.001, 0.03)
        sfx.add(pan_st(y, pan + 0.25 * (i % 2 * 2 - 1)), t + i * step, db(gain))


def phone(t, dur, gain, seed, pan=0.2):
    """an old telephone bell (speech band: for a pause)"""
    sfx.add(pan_st(fade(alarm_ring(dur, seed, 27.0, 1480.0), 0.002, 0.03), pan), t, db(gain))


def tiny(t, dur, gain, seed, f0=640.0, pan=0.3):
    """a sensor's voice: one squeaky syllable or two (speech band: for a pause)"""
    y = gibber(dur, seed, f0, True, 0.0, 44.0)
    sfx.add(pan_st(fade(filt(y, "highpass", 700), 0.004, 0.03), pan), t, db(gain))


def pew(t, gain, seed, f0=3200.0, f1=700.0, dur=0.13, pan=0.0):
    """a cosmic ray going through: a quick falling whistle with air on it (speech band: for a pause)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    f = f0 * (f1 / f0) ** u
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - u) ** 0.6 + 0.25 * filt(white(n, 60 + seed), "highpass", 3000) * (1 - u)
    sfx.add(pan_st(fade(y, 0.002, 0.02), pan), t, db(gain))


def ray_air(t, gain, seed, pan=0.0):
    """the same ray under a line: only its air, above 5.2 kHz"""
    n = int(0.16 * SR)
    u = np.linspace(0, 1, n)
    bed.add(pan_st(fade(filt(white(n, 80 + seed), "highpass", 5400, 4) * np.sin(np.pi * u) ** 1.5, 0.003, 0.03), pan), t - 0.04, db(gain))


def harpsi(freq, dur=0.3, seed=0):
    """a harpsichord string: a bright pluck that dies fast"""
    n = int(dur * SR)
    t = ar(n)
    y = sum(np.sin(2 * np.pi * freq * k * t * (1 + 0.0003 * k * k)) / k ** 0.8 for k in range(1, 12) if freq * k < 9000)
    return fade(y * np.exp(-t / (dur * 0.34)) * np.minimum(1, t / 0.002), 0.0005, 0.03) / 3.2


DESK = ("hook", "button", "loop")
EYE = ("sensors", "squeeze")

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 220) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
amb.x += pan_st(room, 0) * 0.22 * gate(N, on(*DESK))                                  # his room at night
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.38 * gate(N, on(*EYE, "brain"))                        # inside: muffled, a slow pulse
study = norm(filt(brown(N, 7), "lowpass", 180))
amb.x += pan_st(study, 0) * 0.2 * gate(N, on("newton", "dont"))                       # the study: nearly nothing
amb.x += cabin_bed(N, 9) * 0.3 * gate(N, on("astro"))                                 # the station's air and fans (under 420 Hz)

# ================================================================= 1. hook: frame 1 is the rub; the dark fills with stars
sfx.add(pan_st(glug_low(1), 0.0), 0.0, db(-15))                                        # skin on skin, low (before and under "You")
hi_tick(0.0, -12, 1)
nrub = int((c["relax"] - 0.0) * RUB_HZ * 2)
for i in range(nrub):                                                                 # the rub: a soft push twice a turn (low), air on top
    t0 = i / (RUB_HZ * 2)
    k = 1.0 if t0 < c["stars_end"] else 0.5
    low_thud(t0, -19 if i else -14, 96.0 + 14 * (i % 2), 0.16, 0.05)
    m = int(0.13 * SR)
    bed.add(pan_st(fade(filt(white(m, 20 + i), "highpass", 5600, 4) * np.sin(np.pi * np.linspace(0, 1, m)) ** 2, 0.004, 0.03), 0.3 * (i % 2 * 2 - 1)), t0, db(-25) * k)
twinkle(0.06, c["dark"], -20, 2, 5.0)                                                 # the first stars, far up
bed.add(pan_st(slide(150, 62, 0.7, 0.0, 250), 0), c["dark"] - 0.08, db(-13))          # the room goes out (low)
twinkle(c["dark"], c["stars"], -20, 3, 11.0)
low_thud(c["stars"], -9, 70.0, 0.5, 0.2)                                              # ... and they burst (low, on the word)
cy = cymbal(4, 0.9)
bed.add(np.stack([filt(ch, "highpass", 6000, 4) for ch in cy]), c["stars"], db(-21))
twinkle(c["stars"], c["relax"] - 0.12, -15, 5, 16.0)
glass_run(c["stars_end"] + 0.04, [86, 90, 93, 98], 0.075, -12, 0.12)                  # a glass run, alone in the pause after "stars."
twinkle(c["relax"], c["eyeball"], -22, 6, 5.0)
# the answer: light knocks on his fists and goes away again
for i in range(4):
    t0 = c["nolight"] + 0.04 + 0.2 * i + 0.2
    low_thud(t0, -15, 210.0, 0.08, 0.03, pan=0.3 * (1 - 2 * (i % 2)))
    hi_tick(t0, -11, 10 + i, 0.4 * (1 - 2 * (i % 2)))
# his head turns to glass
bed.add(pan_st(filt(whoosh(0.4, 120, 300, 12, 0.7), "lowpass", 240), 0), c["eyeball"] - 0.2, db(-14))
twinkle(c["eyeball"] - 0.05, c["eyeball"] + 0.3, -17, 13, 14.0, 6000, 9000)
# the telephone: its top under "pocket-dialed your brain", the whole bell twice in the pause after it, then it is answered
r0 = c["dialed"] + 0.16
er = fade(alarm_ring(c["ring1"] - r0 - 0.03, 14, 27.0, 1480.0, True), 0.02, 0.04)
bed.add(pan_st(er * (0.5 + 0.5 * (np.sin(2 * np.pi * 2.2 * ar(len(er))) > -0.3)), 0.25), r0, db(-13))
phone(c["ring1"], 0.19, -9, 15)
phone(c["ring2"], 0.19, -9, 16)
sfx.add(pan_st(lock_snap(17), 0.2), c["ring2"] + 0.2, db(-6))                        # ... picked up
cut(SHOT["sensors"], 18, -17, 300, 1500, 1800)                                        # into his eyeball

# ================================================================= 2. sensors: the back wall, and the one word they know
low_thud(SHOT["sensors"] + 0.02, -11, 86.0, 0.3, 0.1)
hi_tick(c["back"], -14, 20)                                                           # the wall lights up
bed.add(pan_st(slide(70, 104, 0.5, 0.0, 240), 0), c["back"] - 0.04, db(-15))
for i in range(6):                                                                    # they pop up, one by one (low pops, a tick each)
    t0 = c["lined"] - 0.04 + 0.085 * i
    low_thud(t0, -15, 150.0 + 16 * i, 0.07, 0.025, pan=0.3)
    hi_tick(t0, -13 - (i % 2), 21 + i, 0.3)
bed.add(pan_st(filt(whoosh(0.5, 150, 260, 28, 0.9), "lowpass", 250), -0.3), c["light2"] - 0.12, db(-13))   # light comes in (low)
twinkle(c["light2"] - 0.1, c["sensors_end"], -19, 29, 9.0, 6400, 9000)
for i, m in enumerate((88, 93)):                                                      # two of them light up (after "sensors,")
    sfx.add(pan_st(lamp_pip(mtof(m), 0.1, 30 + i), 0.3), c["sensors_end"] + 0.06 + 0.13 * i, db(-9))
br = breath(0.22, 31)                                                                 # they breathe in (before LIGHT!)
sfx.add(pan_st(filt(br, "highpass", 900), 0.3), c["word_end"] + 0.03, db(-7))
low_thud(c["LIGHT"], -8, 92.0, 0.3, 0.1)                                              # LIGHT! (the thud and the air are theirs, the word is hers)
bed.add(np.stack([filt(ch, "highpass", 6000, 4) for ch in cymbal(32, 0.6)]), c["LIGHT"], db(-20))
for i, f in enumerate(c["echo"]):                                                     # two small ones, late (in the pause)
    tiny(f, 0.13, -13, 33 + i, 700.0 + 120 * i, 0.35 - 0.5 * i)
cut(SHOT["squeeze"], 35, -24, 300, 1300, 1600)

# ================================================================= 3. squeeze: the lid, the knuckle, squished, and they shout anyway
low_thud(SHOT["squeeze"] + 0.05, -10, 110.0, 0.22, 0.07)                              # the lid shuts
bed.add(pan_st(slide(150, 70, 0.5, 0.0, 250), 0), SHOT["squeeze"] + 0.04, db(-15))    # it goes dark in here
n2 = int((c["and2"] - c["rub2"]) * RUB_HZ * 2)
for i in range(n2):                                                                   # the knuckle works on it
    t0 = c["rub2"] + 0.06 + i / (RUB_HZ * 2)
    low_thud(t0, -19, 84.0 + 12 * (i % 2), 0.17, 0.055, pan=-0.3)
    m = int(0.13 * SR)
    bed.add(pan_st(fade(filt(white(m, 40 + i), "highpass", 5600, 4) * np.sin(np.pi * np.linspace(0, 1, m)) ** 2, 0.004, 0.03), -0.3), t0, db(-22))
low_thud(c["squished"], -8, 120.0, 0.24, 0.08)                                        # squished (low, on the word)
hi_tick(c["squished"], -9, 50)
sfx.add(pan_st(squeak(0.1, 1500, 760), 0.3), c["squished_end"] + 0.02, db(-14))       # ... a small squashed squeak (after it)
FIRE = [c["shout"], c["shout"] + 0.16, c["anyway"], c["anyway"] + 0.2]
for i, f in enumerate(FIRE):                                                          # they go off, under the words: a tick and a glint each
    hi_tick(f, -10, 51 + i, 0.3)
    bed.add(pan_st(glint(6400 + 500 * i, 0.1, 55 + i), 0.3), f, db(-15))
    low_thud(f, -16, 170.0 + 20 * i, 0.07, 0.025, pan=0.3)
for i, f in enumerate(c["chorus"]):                                                   # ... and whole, in the pause: light! light! light!
    tiny(f, 0.105, -10, 60 + i, 660.0 + 110 * i, 0.5 - 0.4 * i)
cut(SHOT["brain"], 64, -24, 300, 1300, 1600)

# ================================================================= 4. brain: on the phone, in the dark; it paints
for i, dt in enumerate((0.06, 0.3)):                                                  # the earpiece (thin, above the words)
    y = gibber(0.12, 65 + i, 760.0, True, 0.0, 44.0)
    bed.add(pan_st(fade(filt(y, "highpass", 5200, 4), 0.004, 0.03), -0.4), SHOT["brain"] + dt, db(-6))
hi_tick(c["cant"], -14, 67)
sfx.add(pan_st(slide(300, 440, 0.13, 0.0, None, 4), 0.2), c["check_end"] + 0.04, db(-11))   # hm? (after "check,")
m = int(0.22 * SR)                                                                    # the brush goes up (air)
bed.add(pan_st(fade(filt(white(m, 68), "highpass", 5200, 4) * np.sin(np.pi * np.linspace(0, 1, m)) ** 1.5, 0.004, 0.04), 0.3), c["paints"] - 0.1, db(-18))
twinkle(c["paints"] + 0.05, c["fireworks_end"], -17, 69, 13.0)
low_thud(c["fireworks"], -11, 80.0, 0.4, 0.15)
for i, f in enumerate(c["pops"]):                                                     # fireworks, in the pause: a pop and its crackle
    pan = (-0.5, 0.5, 0.0)[i]
    sfx.add(pan_st(thump(0.12, 420, 120, 0.035), pan), f, db(-10))
    cr = crackle(int(0.2 * SR), 240, 70 + i, 2600, 9000) * expdecay(int(0.2 * SR), 0.08)
    sfx.add(pan_st(fade(cr, 0.001, 0.03), pan), f + 0.02, db(-12))
cut(SHOT["newton"], 74, -22, 300, 1500, 1800)

# ================================================================= 5. Newton, and a bodkin
low_thud(c["isaac"], -14, 130.0, 0.14, 0.05)                                          # his name
hi_tick(c["isaac"], -13, 75)
hi_tick(c["needle"], -12, 76, -0.3)                                                   # its name
m = int(0.3 * SR)                                                                     # the bodkin goes in (a thin rising air, above the words)
bed.add(pan_st(fade(filt(white(m, 77), "highpass", 6000, 4) * np.linspace(0.2, 1, m) ** 2, 0.01, 0.02), -0.3), c["own"] - 0.05, db(-20))
sfx.add(pan_st(squeak(0.12, 1300, 2300), -0.3), c["poke"], db(-14))                   # eep (alone, after "eyeball...")
low_thud(c["saw"], -13, 110.0, 0.2, 0.07)                                             # the round window
for i in range(6):                                                                    # a ring, a ring, a ring (above the words)
    t0 = c["colored"] - 0.05 + (c["rings_end"] - c["colored"]) * i / 6
    bed.add(pan_st(glint(5600 + 420 * i, 0.12, 78 + i), 0.4), t0, db(-14))
glass_run(c["rings_end"] + 0.06, [79, 83, 86, 91, 95], 0.085, -13, 0.12, 0.3)         # ... and whole, in the pause after "rings."
# ---- "Do not do that."
sfx.add(pan_st(scratch(0.11, 84), 0), SHOT["dont"] - 0.01, db(-11))                   # the tune stops dead
low_thud(c["that"], -9, 100.0, 0.26, 0.09)                                            # the cross lands (low, on the word)
hi_tick(c["that"], -10, 85)
bwomp(sfx, c["that_end"] + 0.04, 38, -15)                                             # (after "that.")
sfx.add(pan_st(glass_tink(86, 3400.0, 0.1), -0.3), c["that_end"] + 0.36, db(-14))     # the bodkin finds the floor
sfx.add(pan_st(glass_tink(87, 4100.0, 0.07), -0.2), c["that_end"] + 0.45, db(-18))
cut(SHOT["astro"], 88, -22, 300, 1500, 1800)

# ================================================================= 6. asleep in orbit
sfx.add(pan_st(snore(0.34, 89, 62.0), 0.2), SHOT["astro"] - 0.02, db(-15))            # he is asleep (low)
for i, f in enumerate((c["flashes"], c["likethis"] + 0.12, c["with"] + 0.3)):         # flashes on his mask (above the words)
    bed.add(pan_st(glint(6000 + 700 * i, 0.12, 90 + i), 0.3 * (1 - 2 * (i % 2))), f, db(-12))
    hi_tick(f, -13, 93 + i)
pew(c["zip1"], -11, 96, 3400, 800, 0.13, 0.4)                                         # a ray, whole (in the pause after "shut...")
ray_air(c["cosmic"] + 0.12, -12, 97, -0.4)
pew(c["zip2"], -11, 98, 3000, 700, 0.13, 0.4)                                         # another (after "rays,")
bed.add(pan_st(filt(whoosh(0.4, 120, 300, 99, 0.7), "lowpass", 260), 0), c["zipping"] - 0.1, db(-11))   # his head, glass again
for i, f in enumerate((c["through"] - 0.02, c["eyeballs"] + 0.16, c["making"] - 0.04)):
    ray_air(f, -15, 100 + i, 0.4 * (1 - 2 * (i % 2)))
    low_thud(f + 0.03, -17, 170.0, 0.07, 0.025)
r1 = c["same"] + 0.02
er = fade(alarm_ring(c["ring3"] - r1 - 0.03, 104, 27.0, 1480.0, True), 0.02, 0.04)
bed.add(pan_st(er * (0.5 + 0.5 * (np.sin(2 * np.pi * 2.2 * ar(len(er))) > -0.3)), 0.25), r1, db(-13))
phone(c["ring3"], 0.19, -9, 105)                                                      # the same call (twice, in the pause after "call.")
phone(c["ring4"], 0.19, -9, 106)
sfx.add(pan_st(lock_snap(107), 0.2), c["ring4"] + 0.2, db(-6))
cut(SHOT["button"], 108, -24, 300, 1300, 1600)

# ================================================================= 7. button: gently
n3 = int((c["gently_end"] - c["so2"]) * 3)
for i in range(n3):                                                                   # one knuckle, softly (air)
    t0 = c["so2"] + 0.05 + i / 3.0
    m = int(0.16 * SR)
    bed.add(pan_st(fade(filt(white(m, 110 + i), "highpass", 5800, 4) * np.sin(np.pi * np.linspace(0, 1, m)) ** 2, 0.004, 0.03), 0.3), t0, db(-26))
for i, m in enumerate((98, 103, 100)):                                                # three small stars (alone, in the pause after "gently...")
    sfx.add(pan_st(fade(bell(mtof(m), 0.11, 0.045), 0.001, 0.03), 0.4), c["twinkle"] + 0.08 * i, db(-15))
low_thud(c["never"], -12, 140.0, 0.14, 0.05)                                          # the tag
hi_tick(c["never"], -13, 116, -0.3)
bwomp(sfx, c["upgrade_end"] + 0.05, 36, -14)                                          # (after "upgrade.")
yw = yawn_voice(0.62, 205.0, 112.0, 117, 0.6)                                         # he yawns, and up come the fists
sfx.add(pan_st(fade(yw, 0.03, 0.1), 0.0), c["yawn"] + 0.16, db(-13))
bed.add(pan_st(filt(whoosh(0.34, 200, 900, 118, 0.9), "lowpass", 1200), 0), c["loop"] + 0.04, db(-17))

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
# his room: no score under the hook, only the rub and the first stars; a held chord as the dark comes, out for "stars."
drone(mus, c["dark"], c["stars"] - 0.04, [45, 52, 57, 64], cutoff=560, gain=-29, seed=11, swell=0.4)
# the answer: a sneaky walk (bass and snaps) under "no light got in", out before "your eyeball": the phone has the room
groove(mus, c["relax_end"] + 0.05, c["gotin_end"] - 0.02, 96, ["Am", "E"], gain=-10, seed=12, arp=False, padv=False, kick_on=False)
# inside the eye: a curious minor loop; a held chord under "that know one word:", and nothing under LIGHT!
groove(mus, c["back"] + 0.1, c["sensors_end"] - 0.03, 112, ["Dm", "Gm", "Dm", "A"], gain=-12, seed=13, kick_on=False)
drone(mus, c["know"], c["word_end"] - 0.02, [50, 57, 62, 65], cutoff=520, gain=-27, seed=14, swell=0.3)
# the squeeze: a low held chord that tightens, cut off for "squished"; the shouts have no score at all
drone(mus, c["rub2"] + 0.1, c["squished"] - 0.05, [38, 45, 50, 53], cutoff=380, gain=-28, seed=15, swell=0.4)
# the brain: the walk again under "can't check", then quick and bright while it paints, out for the fireworks
groove(mus, c["brain"] + 0.1, c["check_end"] - 0.03, 96, ["Dm", "A"], gain=-10, seed=16, arp=False, padv=False, kick_on=False)
groove(mus, c["so"] + 0.14, c["fireworks_end"] - 0.06, 126, ["F", "C"], gain=-12, seed=17, kick_on=False, sixteen=True)
# the study: a harpsichord figure in D minor (two chords), cut dead before "Do not do that."
BPM = 104.0
step = 60.0 / BPM / 2
FIG = {"Dm": [50, 57, 62, 65, 69, 65, 62, 57], "A": [45, 52, 57, 61, 64, 61, 57, 52]}
t0, i = c["newton"] + 0.12, 0
while t0 < c["eyeball4_end"] - 0.08:
    ch = "Dm" if (i // 8) % 2 == 0 else "A"
    mus.add(pan_st(harpsi(mtof(FIG[ch][i % 8]), 0.3, i), 0.3 * (i % 2 * 2 - 1)), t0, db(-17))
    if i % 8 == 0:
        mus.add(pan_st(harpsi(mtof(FIG[ch][0] - 12), 0.5, 200 + i), 0), t0, db(-16))
    t0 += step
    i += 1
drone(mus, c["saw"], c["rings_end"] - 0.03, [50, 57, 62, 66, 69], cutoff=760, gain=-26, seed=18, swell=0.35)
# orbit: a wide held chord while he sleeps; a soft half-time pulse once the rays have a name; out for "the same call."
drone(mus, c["astro"] + 0.1, c["shut_end"], [45, 52, 59, 64], cutoff=520, gain=-29, seed=19, swell=0.6)
groove(mus, c["cosmic"] + 0.12, c["making"] + 0.1, 104, ["Am", "F"], gain=-12, seed=20, kick_on=False, snaps=False)
# the button: warm and slow under "So rub gently...", then only the room
groove(mus, c["so2"] + 0.16, c["gently_end"] - 0.02, 92, ["F", "C"], gain=-12, seed=21, kick_on=False, snaps=False, arp=False)
silence(mus, [(c["stars"] - 0.03, c["relax_end"] + 0.04), (c["gotin_end"] - 0.01, c["back"] + 0.08), (c["sensors_end"] - 0.02, c["know"] - 0.01),
              (c["word_end"] - 0.01, c["rub2"] + 0.08), (c["squished"] - 0.04, c["brain"] + 0.08), (c["check_end"] - 0.02, c["so"] + 0.12),
              (c["fireworks_end"] - 0.05, c["newton"] + 0.1), (c["eyeball4_end"] - 0.02, c["saw"] - 0.01), (c["rings_end"] - 0.02, c["astro"] + 0.08),
              (c["shut_end"] + 0.02, c["cosmic"] + 0.1), (c["making"] + 0.12, c["so2"] + 0.14), (c["gently_end"] - 0.01, DUR)])

# ================================================================= voice + mix
# the music bus sits 2 dB under the house level: this narration has soft function words and a faint "sensors"
# the effects bus sits 3.5 dB under the house level too: its gags measured as loud as the narrator at -5
# ... and the room tones 4.5 dB under theirs (that bus is scaled to its loudest bed, the inside of the eye)
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -8.5, "amb": -21.5}, duck={"music": 0.72})
