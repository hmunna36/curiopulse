"""Can You Do the ELVIS Lip Without Squinting? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The place: a photo booth in a roadside diner at night. The score: a rockabilly shuffle in E fitted to whole bars (the loop
score); his motif a twangy guitar lick (twang), the bulldog's a low pizzicato "bum-bum" and a small growl. The booth's
flash: a charge whine, a shutter, a pop. Rule of the house: say it on the word, do it in the pause: every gag's sound sits
in the gap after its word; under words only sounds under 250 Hz or above 5.2 kHz.
"""
import json
import os
import sys

import numpy as np  # noqa: F401

import sfxlib as L
from sfxkit import *  # noqa: F401,F403
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()
c = C


def hi(x, f=5200):
    """only what is above f: it can sit under a word"""
    return filt(x, "highpass", f)


def lo(x, f=250):
    """only what is under f: it can sit under a word"""
    return filt(x, "lowpass", f)


def layered_hit(t, seed):
    """the hitstop's layered hit (sound.md, "Hitstops"): a crisp transient, a body a phone can play, a short bright tail"""
    sfx.add(pan_st(filt(snap(seed), "highpass", 1800), 0.0), t, db(-20))
    sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), t + 0.004, db(-17))
    sfx.add(cymbal(seed + 1, 0.3), t + 0.01, db(-33))


def booth_flash(t, seed, gain=0.0):
    """the booth takes a photo: a short charge whine just before (high), the shutter, a soft pop of light"""
    sfx.add(pan_st(hi(glide(5400, 8200, 0.22) * 0.6), 0.1), t - 0.22, db(-30 + gain))
    sfx.add(pan_st(shutter(), 0.0), t, db(-19 + gain))
    sfx.add(pan_st(lo(thump(0.16, 210, 70, 0.05, seed), 260), 0.0), t + 0.01, db(-17 + gain))


def dog_motif(t0, gain=-17, up=False):
    a, b = (35, 42) if up else (42, 35)
    sfx.add(pan_st(lo(pizz(mtof(a), 0.3, 21), 320), 0.35), t0, db(gain))
    sfx.add(pan_st(lo(pizz(mtof(b), 0.3, 22), 320), 0.35), t0 + 0.15, db(gain))


# ================================================================= ambience: the booth's muffled inside, the diner outside
inside = [(0, SHOT["booth"]), (SHOT["leash"], SHOT["step"]), (SHOT["name"], DUR)]
outside = [(SHOT["booth"], SHOT["leash"]), (SHOT["step"], SHOT["name"])]
booth_tone = pan_st(filt(brown(N, 1), "lowpass", 170), 0) * 0.30
diner = np.stack([filt(brown(N, 2), "lowpass", 260), filt(brown(N, 3), "lowpass", 260)]) * 0.32
fridge = pan_st(lo(np.sin(2 * np.pi * 60 * tt) * 0.06, 200), 0.3)
amb.x += booth_tone * gate(N, inside) + (diner + fridge) * gate(N, outside)

# ================================================================= the hook (frame 1): the lip is already up; the eye clamps
sfx.add(pan_st(lo(thump(0.2, 190, 60, 0.07, 2), 240), 0), 0.02, db(-17))             # a soft low hit on frame 1
sfx.add(pan_st(hi(glint(7000, 0.1, 1)), 0.3), 0.06, db(-25))                          # the fang glints
sfx.add(pan_st(lo(thump(0.26, 170, 55, 0.09, 4), 230), 0), 0.62, db(-15))            # the eye clamps (0.6 s): a thud...
sfx.add(pan_st(hi(squeak(0.1, 5600, 7000), 5200), 0.3), 0.6, db(-25))                 # ...and a squeak of the lid
sfx.add(pan_st(hi(glide(5300, 7400, 1.0) * 0.5), 0.25), c["keep"], db(-31))          # the fight: a strain whine
sfx.add(pan_st(lo(thump(0.24, 180, 55, 0.08, 6), 230), 0), c["open"] + 0.02, db(-14))   # "OPEN." it clamps again
sfx.add(pan_st(hi(glint(7600, 0.07, 7)), 0.3), c["open"] + 0.04, db(-24))

# ================================================================= cuts: a whoosh into each (the whips louder)
WHIPS = {SHOT["booth"], SHOT["step"], SHOT["name"]}
for i, s in enumerate(TL["shots"][1:]):
    g = -19 if s["start"] in WHIPS else -28
    sfx.add(pan_st(whoosh(0.24, 500 + 150 * (i % 4), 2600, 500 + i), 0.0), s["start"] - 0.27, db(g))

# ================================================================= the answer: the dog tilts its head; the flash-forward
dog_motif(c["squinting_end"] + 0.06, gain=-19)                                         # in the pause after "Squinting?"
sfx.add(pan_st(hi(whoosh(0.18, 2600, 7000, 30), 5200), 0.3), c["ff"], db(-24))        # the window pops open...
sfx.add(pan_st(lo(thump(0.1, 200, 80, 0.03, 31), 240), 0.3), c["ff"] + 0.53, db(-22))  # ...and shuts

# ================================================================= the leash: it clips on, yanks, and the booth flashes (photo 1)
sfx.add(pan_st(hi(glint(6600, 0.06, 40)), 0.25), c["leash_on"], db(-23))              # the clip (under "LEASH": highs only)
sfx.add(pan_st(twang(146.8, 0.22, 41, 0.12), 0.0), c["leash_end"] + 0.0, db(-16))     # the yank, in the gap after "LEASH."
booth_flash(c["flash1"], 42)
layered_hit(c["flash1"] + 0.05, 43)

# ================================================================= Again: the glass cheek, the muscle, the eye's corner
sfx.add(pan_st(hi(glint(6200, 0.1, 50)), -0.2), c["that_lip"] - 0.1, db(-25))         # the glass appears
sfx.add(pan_st(hi(squeak(0.12, 5400, 7200), 5200), 0.3), c["again_end"] + 0.03, db(-23))   # the lip curls again (gap)
_pip = c["by"] - 0.2                                                                   # "right..." the top end glows: a pip in the pause
if _pip > c["right"] + 0.35:
    sfx.add(pan_st(lamp_pip(1760, 0.1, 51), 0.2), _pip - 0.08, db(-25))
sfx.add(pan_st(hi(glint(7400, 0.08, 52)), 0.3), c["eye3"], db(-24))                   # the ring round the eye lights up

# ================================================================= the spill: the LIFT spark climbs and spills over
sfx.add(pan_st(zap(c["spills"] - c["order"], 60, 118.0, edges=True, rise=0.6), 0.1), c["order"], db(-24))
pops([c["spill_go"] + 0.035 * i for i in range(6)], sfx, db(-28), seed=61)            # the sparks over the brim
sfx.add(pan_st(lo(kick(0.8), 260), 0), c["cinch"], db(-15))                           # the ring cinches: a low thud
sfx.add(pan_st(hi(squeak(0.14, 6200, 5400), 5200), 0.3), c["cinch"] + 0.02, db(-25))

# ================================================================= the wall: the count, then FULL SILENCE, then his photo slaps on
for i in range(14):                                                                   # the count rolls: high ticks
    sfx.add(pan_st(hi(glint(5600 + 110 * i, 0.04, 110 + i)), 0.1), c["ninety"] + 0.1 * i, db(-29))
# the biggest hit of the Short, just after "squinted.": his own photo slapped onto the wall
sfx.add(pan_st(lo(kick(1.0), 400), 0), c["pin"], db(-13))
sfx.add(pan_st(filt(thump(0.18, 900, 220, 0.05, 130), "highpass", 300), 0.1), c["pin"], db(-16))
sfx.add(cymbal(131, 0.5), c["pin"] + 0.01, db(-23))
sfx.add(pan_st(bonk(), 0.2), c["pin"] + 0.05, db(-22))

# ================================================================= the name: the tag, the scroll, the roll falls
sfx.add(pan_st(hi(glint(6400, 0.08, 140)), 0.3), c["blame"] + 0.35, db(-23))         # the tag sticks on
sfx.add(pan_st(ratchet(c["name_end"] - c["unroll"], 22.0, 48.0, 141, edges=True), 0.15), c["unroll"], db(-24))   # unrolling
sfx.add(pan_st(lo(thump(0.2, 200, 60, 0.06, 142), 240), 0.2), c["name_end"] + 0.05, db(-15))   # the roll hits the floor

# ================================================================= the dog: it pops in, does the PERFECT snarl, flash 3
sfx.add(pan_st(boing(0.3, 260, 150), 0.3), SHOT["dog"] + 0.01, db(-21))              # pops into the frame
sfx.add(pan_st(growl(0.36, 150, 70.0), 0.3), c["dog_snarl"], db(-17))                # a small proud growl (under 300 Hz)
sfx.add(pan_st(hi(glint(7800, 0.14, 151)), 0.35), c["dog_snarl"] + 0.14, db(-20))    # the fang's ting
booth_flash(c["flash3"], 152, gain=1.0)
layered_hit(c["flash3"] + 0.05, 153)
dog_motif(c["flash3"] + 0.2, gain=-16, up=True)

# ================================================================= the button: he swaps sides, then snaps back for the loop
sfx.add(pan_st(hi(squeak(0.1, 5600, 7200), 5200), -0.3), c["swap"] + 0.02, db(-25))
sfx.add(pan_st(hi(glint(6600, 0.08, 160)), 0.3), c["back"] + 0.02, db(-26))

# ================================================================= the score: a rockabilly shuffle, fitted to whole bars
BPM, BEAT, BARS = loop_groove(mus, DUR, ["E", "E", "A", "E", "B", "A", "E", "B"], gain=-5, seed=14, lo=104, hi=128, want=118)
# his motif: a twangy guitar lick every two bars (it rests under the first words of each line it would cover)
lick = [(0, 64), (0.5, 67), (1.0, 68), (1.5, 71), (2.5, 69), (3.0, 67), (3.5, 64)]
riff(mus, lick, BEAT, t0=bar_at(SHOT["booth"], BEAT), every=8, inst=lambda m, d, s: twang(mtof(m), d, s, 0.02), gain=-22, octave=None)
shaker(mus, bar_at(SHOT["booth"], BEAT), c["hundred_end"], BEAT, gain=-33)
claps(mus, bar_at(SHOT["name"], BEAT), DUR - BEAT, BEAT, gain=-30)
# the last beat leads back into bar 1: two pickup notes (nothing rings past the end)
for k, m in enumerate((71, 76)):
    mus.add(pan_st(twang(mtof(m), 0.18, 170 + k, 0.0), 0.2 * (-1) ** k), DUR - BEAT + k * BEAT / 2, db(-21))
# the dead stops (direction rule 16): the hook's first word; the leash's sting and the flash; the spill's cinch; full
# silence from the count to his photo slapping on (the biggest hit); the dog's beat; the button's first words
STOPS = [(0.0, c["curl"] + 0.12),
         (c["leash"] - 0.06, c["flash1"] + 0.35),
         (c["cinch"] - 0.05, c["cinch"] + 0.3),
         (c["hundred_end"] - 0.02, c["pin"] + 0.02),
         (SHOT["dog"] - 0.02, c["flash3"] + 0.3),
         (c["now"] - 0.05, c["now"] + 0.3)]
silence(mus, STOPS)
print("stops:", ", ".join(f"{a:.2f}-{b:.2f} ({b - a:.2f} s)" for a, b in STOPS))
print(f"loop score: {BARS} bars at {BPM:.1f} BPM, beat {BEAT:.3f} s, bars x 4 x beat = {BARS * 4 * BEAT:.3f} s vs {DUR:.3f} s")

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14})
