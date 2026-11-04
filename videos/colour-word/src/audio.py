"""Why Can't You Say the COLOUR, Not the Word? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
One world: a sunny summit (wind under 300 Hz, a bird in a pause). The test runs on a quiz clock (ticks above 5 kHz) and a
tense "thinking" pulse; his blurt gets a buzzer, the READING switch clicks and springs back, the word flies in on wings,
each right answer is a ding, the second-grader faceplants. Speech-band gags sit in the pauses; under a word only their
edges play. The score drops out for every punchline.
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
c = C
words = TL["words"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
PAUSE = pause_mask(words, N)                       # 1 where nobody speaks


def edges(y, lo=250.0, hi=5200.0):
    """only what a phone plays round a word: the thump under lo and the sizzle over hi"""
    return filt(y, "lowpass", lo, 2) + filt(y, "highpass", hi, 2)


def norm(y):
    return y / (np.abs(y).max() + 1e-9)


def in_pause(t, dur):
    """is [t, t + dur] free of words (with a little air either side)?"""
    return all(not (w["start"] - 0.04 < t + dur and t < w["end"] + 0.06) for w in words)


def next_word(t):
    return min([w["start"] for w in words if w["start"] > t] + [DUR])


def tick(seed):
    """one quiz-clock tick, all of it above 5 kHz (it runs under the lines)"""
    n = int(0.02 * SR)
    return filt(white(n, seed), "highpass", 5000) * expdecay(n, 0.003)


def low_thud(seed=0, f=95.0, dur=0.3):
    """a body hitting the ground, all of it under 230 Hz (it can sit on a word)"""
    y = thump(dur, f * 1.8, f * 0.6, 0.08, seed)
    return filt(norm(y), "lowpass", 230, 2)


def step(seed=0):
    """a small sneaker step on rock: a low tap (under 300 Hz) and a grit tick above 5 kHz"""
    y = 0.8 * filt(thump(0.09, 220, 90, 0.02, seed), "lowpass", 300)
    n = int(0.03 * SR)
    g = filt(white(n, seed + 4), "highpass", 5200) * expdecay(n, 0.004)
    y[:n] += 0.35 * g
    return fade(norm(y), 0.0005, 0.02)


# ================================================================= ambience: the summit (wind under 300 Hz all through)
wind = filt(pink(N, 11), "lowpass", 280) * (0.75 + 0.25 * np.sin(2 * np.pi * tt / DUR * 3))
amb.x += pan_st(wind, -0.15) * 0.9
# the breeze picks up when the toddler breezes through (still under the band, plus a hiss over 5 kHz)
br = gate(N, [(c["breeze"] - 0.05, c["through_end"] + 0.3)], 0.15)
amb.x += pan_st(filt(pink(N, 12), "lowpass", 300) * 0.9 + 0.25 * filt(white(N, 13), "highpass", 5600), 0.3) * br
# a bird or two, only in pauses
for f, s, pan in ((c["off_end"] + 0.45, 3, 0.5), (c["huh_end"] + 0.62, 5, -0.4)):
    if in_pause(f, 0.18):
        sfx.add(pan_st(tweet(s, 3600.0), pan), f, db(-27))

# ================================================================= the hook: the quiz clock, the try, the buzzer
# a tick every half second from frame 0 to "Tripped" (the viewer's clock), and again in the last half second (the loop)
k = 0
while 0.02 + 0.5 * k < c["tripped"] - 0.05:
    bed.add(pan_st(tick(700 + k), 0.4 * (-1) ** k), 0.02 + 0.5 * k, db(-19))
    k += 1
bed.add(pan_st(tick(799), -0.4), DUR - 0.48, db(-19))
# "Go!": a start beep in the gap after it
sfx.add(pan_st(beep(1760.0, 0.07), -0.2), c["go_end"] + 0.03, db(-25))
# his blurt: the bubble pops in, whole (the viewer's own try, nobody speaking)
sfx.add(pan_st(cork_pop(3, 760.0), 0.35), c["blurt"], db(-17))
# wrong: the buzzer, whole, ending before "Tripped"
bz = buzzer(0.3)
bz = bz[: int(max(0.1, min(0.3, c["tripped"] - c["buzz"] - 0.08)) * SR)]
sfx.add(pan_st(fade(bz, 0.002, 0.04), 0.3), c["buzz"], db(-29))

# ================================================================= the READING switch
# it pops out of his temple on "switch" (a pop's edges under the word), clicks OFF on "OFF" (a click's top)...
sfx.add(pan_st(edges(cork_pop(5, 900.0)), 0.3), c["switch"] - 0.02, db(-12))
bed.add(pan_st(filt(key_click(4), "highpass", 4200), 0.3), c["off"] + 0.02, db(-15))
# ...and springs straight back ON: the boing, whole, in the gap after "OFF."
bo = boing(0.5, 170.0, 2)
room = next_word(c["off_end"]) - (c["off_end"] + 0.04) - 0.08
sfx.add(pan_st(fade(bo[: int(min(0.5, room) * SR)], 0.002, 0.05), 0.3), c["off_end"] + 0.04, db(-17))

# ================================================================= the autopilot
# the ink drains out of the word: a liquid bloop, low (it sits on "autopilot")
sfx.add(pan_st(filt(bloop(240, 70, 0.4), "lowpass", 300), -0.2), c["auto"] + 0.15, db(-15))
# wings sprout and flap (only above 5.2 kHz under the words)
bed.add(pan_st(flutter(c["mouth"] - c["auto"] - 0.4, 3, edges=True), 0.1), c["auto"] + 0.45, db(-17))
# two glints for the goggles, in the little gap after "autopilot..."
for j in range(2):
    bed.add(pan_st(glint(6400 + 600 * j, 0.07, 20 + j), 0.1), c["auto_end"] + 0.02 + 0.05 * j, db(-21))
# it dives on "barges": a whoosh's edges
sfx.add(pan_st(edges(whoosh(0.9, 300, 2600, 31, 0.8), 260, 4800), 0.2), c["barges"] - 0.05, db(-14))
# it clips the drop on the way in: a bonk's edges
sfx.add(pan_st(edges(bonk()), -0.5), c["mouth"] - 0.12, db(-15))
# into his mouth: a low swallow (glug_low lives under 300 Hz: it can sit on "mouth")
sfx.add(pan_st(glug_low(4), 0), c["mouth"] + 0.02, db(-12))
# out it comes: BLUE! (the bubble's pop) and a short buzzer, whole, in the gap after "mouth."
sfx.add(pan_st(cork_pop(6, 720.0), 0.35), c["mouth_end"] + 0.05, db(-17))
room = next_word(c["mouth_end"]) - (c["mouth_end"] + 0.18) - 0.06
sfx.add(pan_st(fade(buzzer(0.26)[: int(max(0.1, min(0.26, room)) * SR)], 0.002, 0.04), 0.3), c["mouth_end"] + 0.18, db(-24))

# ================================================================= round two: the squiggles
# the sign spins round on "Now these": a whoosh's edges and a wooden creak's low end
sfx.add(pan_st(edges(whoosh(0.4, 400, 3000, 41, 0.7), 260, 5000), 0), c["these"] - 0.05, db(-14))
sfx.add(pan_st(filt(creak(0.35, 4, 60, 140), "lowpass", 260), -0.1), c["these"] + 0.05, db(-14))
# he rattles them off: four rising dings, whole, in the gap after "these."
for j, (f, m) in enumerate(zip(c["ticks"], (84, 88, 91, 96))):
    sfx.add(pan_st(ding(m, 0.13, 50 + j, 1.3), 0.35 * (-1) ** j), f, db(-19))
# "Easy, right?": a sparkle on his grin (top only)
for j in range(4):
    bed.add(pan_st(glint(5800 + 500 * j, 0.08, 60 + j), 0.25), c["easy"] + 0.2 + 0.05 * j, db(-22))
# the cut to the kids
sfx.add(pan_st(edges(whoosh(0.3, 400, 2600, 51, 0.8), 260, 4800), 0), SHOT["kids"] - 0.18, db(-16))

# ================================================================= the kids
# the toddler's scooter rolls in: a low rumble and the wheels' top clicks
roll_in = (c["kids"] - 0.05, c["kids"] + 0.8)
sfx.add(pan_st(filt(brown(int(0.85 * SR), 21), "lowpass", 220) * np.sin(np.linspace(0, np.pi, int(0.85 * SR))), 0.5), roll_in[0], db(-12))
bed.add(pan_st(ratchet(0.8, 30.0, 12.0, 22, edges=True), 0.5), roll_in[0], db(-21))
# the four colours she names: a glint each (top only: they fall on "breeze right through")
for j, f in enumerate(c["dots"]):
    bed.add(pan_st(glint(5600 + 450 * j, 0.08, 70 + j), 0.45), f, db(-19))
# her propeller whirrs while she breezes through (above 5.2 kHz)
bed.add(pan_st(buzz_hi(c["through_end"] - c["breeze"] + 0.2, 44.0, 23), 0.5), c["breeze"] - 0.05, db(-25))
# all four right: a two-note ta-da, whole, in the gap after "through."
for j, m in enumerate((91, 96)):
    f = c["through_end"] + 0.03 + 0.1 * j
    if in_pause(f, 0.1):
        sfx.add(pan_st(ding(m, 0.1, 80 + j, 1.4), 0.45), f, db(-21))
# she scoots off on "But"
sfx.add(pan_st(filt(brown(int(0.6 * SR), 24), "lowpass", 220) * np.sin(np.linspace(0, np.pi, int(0.6 * SR))), 0.7), c["but"] - 0.02, db(-14))

# ================================================================= the second-grader
# he marches in: four small steps (low, with a grit tick on top)
for j in range(5):
    f = c["just"] - 0.25 + 0.17 * j
    sfx.add(pan_st(step(90 + j), 0.5), f, db(-15))
# each word he reads out: a wrong-buzz's top (it falls on "to read? They")
for j, f in enumerate(c["kid_reads"]):
    bed.add(pan_st(buzz_hi(0.12, 60.0, 95 + j), 0.45), f + 0.16, db(-17))
# he tips over on "trip": a low whomp of the stumble; the faceplant on "hardest" (a thud under 230 Hz, a dust hiss on top)
sfx.add(pan_st(filt(bloop(160, 60, 0.35), "lowpass", 250), 0.2), c["they_trip"] + 0.15, db(-15))
sfx.add(pan_st(low_thud(7, 90.0, 0.35), 0), c["hardest"] + 0.02, db(-7))
bed.add(pan_st(filt(white(int(0.4 * SR), 31), "highpass", 5200) * expdecay(int(0.4 * SR), 0.12), -0.2), c["hardest"] + 0.04, db(-19))
# dizzy: two birds' chirps, whole, in the gap after "of all."
for j, f in enumerate((c["ofall_end"] + 0.05, c["ofall_end"] + 0.24)):
    if in_pause(f, 0.14):
        sfx.add(pan_st(tweet(40 + j, 3900.0), -0.3), f, db(-22))
# the cut back to the tight shot
sfx.add(pan_st(edges(whoosh(0.28, 400, 2600, 61, 0.8), 260, 4800), 0), SHOT["button"] - 0.16, db(-17))

# ================================================================= the button
# each word he reads out, right: a glint (they fall on "the WORDS out loud")
for j, f in enumerate(c["reads"]):
    bed.add(pan_st(glint(6000 + 400 * j, 0.08, 110 + j), 0.35), f, db(-20))
# the shades come down on "Easy": a whoosh's top and a click
bed.add(pan_st(filt(whoosh(0.3, 2000, 7000, 71, 0.7), "highpass", 4800), 0.1), c["easy2"] + 0.02, db(-18))
# the "deal with it" sting, whole, in the long gap after "huh?": a brassy slide up and a cymbal tap's top
gap0, gap1 = c["huh_end"] + 0.06, c["showoff"] - 0.1
sl = slide(220.0, 440.0, min(0.42, gap1 - gap0 - 0.1), 0.0)
sfx.add(pan_st(fade(sl, 0.01, 0.06), 0.1), gap0, db(-19))
for j, m in enumerate((79, 84)):
    sfx.add(pan_st(ding(m, 0.12, 120 + j, 1.4), 0.2), gap0 + 0.36 + 0.12 * j, db(-20))
# "Show-off.": nothing; then the shades go back up (a little deflating bloop), whole in the tail
sfx.add(pan_st(bloop(520, 260, 0.26), 0.1), c["showoff_end"] + 0.14, db(-18))

# ================================================================= score (it drops out for every punchline)
BPM = 120
# the hook: a tense "thinking" drone and a pizzicato pulse on the clock's beat; out for the viewer's try and the buzzer
drone(mus, 0.0, c["go_end"] + 0.02, [45, 52, 57, 60], cutoff=480, gain=-24, seed=2, swell=0.5)
for j in range(int(c["go_end"] / 0.5) + 1):
    tb = 0.02 + j * 0.5
    if tb > c["go_end"] - 0.05:
        break
    mus.add(filt(pizz(mtof(45 if j % 2 == 0 else 52), 0.35, j), "lowpass", 700) * 1.2, tb, db(-16))
# the answer: a light, sheepish pizzicato groove from "You can't", out on "OFF"
groove(mus, c["switch"] - 0.55, c["off"] - 0.02, BPM, ["Am", "F"], gain=-9, seed=10, kick_on=False, snaps=True, arp=False, cutoff=800)
# the autopilot: a bouncy "flying" groove, from after "It runs", out at "mouth."
groove(mus, c["auto"] - 0.1, c["mouth_end"], BPM, ["F", "C", "Dm", "Bb"], gain=-8, seed=20, sixteen=True)
# round two: the dings are the tune; a smug, laid-back groove from "Easy, right?"
groove(mus, c["easy"] + 0.35, c["notrip_end"] + 0.02, 96, ["F", "Am"], gain=-9, seed=30, kick_on=True, arp=True, cutoff=1000)
# the toddler: a bright, playful groove
groove(mus, c["kids"] + 0.3, c["through_end"], BPM, ["C", "G", "Am", "F"], gain=-8, seed=40, sixteen=True)
# the second-grader: a little march in, out at the faceplant
groove(mus, c["but"] + 0.25, c["hardest"] - 0.02, BPM, ["Bb", "F", "C", "F"], gain=-8, seed=50, kick_on=True, snaps=True, arp=False)
# the button: a confident groove under "Now read the WORDS", out at "huh?" for the sting
groove(mus, c["nowread"] + 0.2, c["huh_end"], BPM, ["F", "C", "Bb", "C"], gain=-7, seed=60)
silence(mus, [(c["go_end"] + 0.02, c["switch"] - 0.55), (c["off"] - 0.02, c["auto"] - 0.1), (c["mouth_end"], c["easy"] + 0.35),
              (c["notrip_end"] + 0.02, c["kids"] + 0.3), (c["through_end"], c["but"] + 0.25), (c["hardest"] - 0.02, c["nowread"] + 0.2),
              (c["huh_end"], DUR - 0.47)])
# the loop's last half second: the hook's drone and pulse again, so the join is the same sound on both sides
drone(mus, DUR - 0.46, DUR, [45, 52, 57, 60], cutoff=480, gain=-24, seed=2, swell=0.5)
mus.add(filt(pizz(mtof(52), 0.35, 99), "lowpass", 700) * 1.2, DUR - 0.48, db(-16))

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"sfx": -7.0, "music": -13.0})
