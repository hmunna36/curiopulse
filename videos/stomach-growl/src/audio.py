"""Why Does Your Stomach GROWL? Short: sound design, score and mix, cue-locked to timeline.json.

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


# ================================================================= ambience (one bed per world, gated to its shots)
# the exam hall: a big quiet room (low air), a far-off bird now and then
hall_on = gate(N, on("hook", "react", "button", "sub"))
room = np.stack([filt(brown(N, s), "lowpass", 260) for s in (1, 2)])
amb.x += room / (np.abs(room).max() + 1e-9) * 0.8 * hall_on
# inside the gut: a slow wet churn under 400 Hz
gut_on = gate(N, on("clean", "sweep", "loud", "full"))
churn = filt(pink(N, 3), "bandpass", [50, 380]) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.7 * tt) ** 2)
amb.x += pan_st(churn / (np.abs(churn).max() + 1e-9), 0) * 0.9 * gut_on
# the title card: a low warm rumble
name_on = gate(N, on("name"))
amb.x += pan_st(filt(brown(N, 4), "lowpass", 150), 0) * 0.5 * name_on
# 1912: the projector clatter + a little dust crackle
film_on = gate(N, on("proof", "match"))
amb.x += pan_st(projector(N, 5) * 0.5 + 0.25 * crackle(N, 14, 6, 2500, 8000), 0.1) * film_on
# bagpipe spotlight: nothing but a hush
# ================================================================= 1. hook: the silent exam ... GROWL
sfx.add(pan_st(whoosh(0.5, 2400, 500, 10, 0.4), 0), 0.0, db(-24))                  # the camera pulls back off the paper
for k, (a, b) in enumerate([(0.0, c["silent"] - 0.02), (c["silent_end"] + 0.03, c["exam"] - 0.03),
                            (c["exam1_end"] + 0.03, c["then"] - 0.03), (c["stomach"] - 0.0, c["growl"] - 0.25)]):
    if b - a > 0.08:                                                                   # pencils scratching, mostly in the pauses
        g = -30 if k < 3 else -40
        sfx.add(pan_st(scribble(b - a, 11 + k, 6.5 + k), -0.2 + 0.15 * k), a, db(g))
clock_ticks(0.0, SHOT["name"] - 0.05, bed, db(-24))                               # the wall clock (through the stare)
sfx.add(pan_st(filt(gurgle(0.5, 12, 14), "lowpass", 420), 0), c["stomach"] + 0.25, db(-30))   # the warning gurgle
sfx.add(pan_st(filt(stomach_growl(0.45, 19), "lowpass", 280), 0), c["pregurgle"], db(-16))      # frame 4: the first little gurgle (below the whisper)
# THE GROWL (in the gap after "goes...")
gr = stomach_growl(1.15, 13)
sfx.add(pan_st(gr, 0), c["growl"], db(-3))
sfx.add(pan_st(filt(gurgle(0.6, 14, 22), "lowpass", 900), 0.15), c["growl"] + 0.55, db(-16))
sfx.add(thump(0.5, 70, 32, 0.2), c["growl"], db(-10))
sfx.add(pan_st(whoosh(0.35, 500, 2200, 15, 0.6), np.linspace(-0.6, 0.6, int(0.35 * SR))), c["growl"] + 0.12, db(-26))  # every head turns
sfx.add(pan_st(creak(0.3, 16, 80, 150), -0.5), c["growl"] + 0.25, db(-30))           # a chair creaks
sfx.add(pan_st(pen_tick(17), 0.4), c["growl"] + 0.2, db(-28))                        # a pencil drops
sfx.add(pan_st(pen_tick(18), 0.45), c["growl"] + 0.32, db(-32))

# ================================================================= 2. react: "Cool. Very cool." (silence is the joke)
sfx.add(pan_st(cricket(21, 3), 0.5), c["cool1_end"] + 0.12, db(-30))                 # one cricket between the two "cool"s
sfx.add(pan_st(blip(620, 380, 0.12, 22, 0.04), 0.1), c["verycool_end"] + 0.03, db(-28))   # the gulp after the thumbs-up

# ================================================================= 3. name: BORBORYGMI
sfx.add(pan_st(whoosh(0.35, 2600, 400, 30, 0.7), 0), SHOT["name"] - 0.3, db(-24))
sfx.add(thump(0.5, 110, 40, 0.14), c["borbo"] - 0.05, db(-16))                       # the title lands (low, under the word)
n_r = int((c["growls_end"] - c["growls_w"] + 0.15) * SR)                              # her growled "growls": a sub rumble under it
rum = filt(stomach_growl(n_r / SR, 31), "lowpass", 160)
sfx.add(pan_st(rum, 0), c["growls_w"], db(-12))
sfx.add(pan_st(filt(gurgle(0.25, 32, 20), "lowpass", 800), 0.2), c["growls_end"] + 0.02, db(-18))

# ================================================================= 4. clean: the x-ray dive, the clock, the wave
sfx.add(pan_st(whoosh(0.45, 300, 2600, 40, 0.8), 0), SHOT["clean"] - 0.4, db(-20))
sfx.add(filt(bloop(160, 50, 0.5), "lowpass", 300), SHOT["clean"] - 0.02, db(-16))
ticking(c["hours"] + 0.1, c["gut"] - 0.2, bed, db(-32), 10, 28, 41)                  # the clock spins: "hours after"
for j, m in enumerate((84, 88, 91)):                                                   # CLEANING MODE: a sparkle after the word
    sfx.add(bell(mtof(m), 0.6, 0.2) * 0.5, c["cleaning_end"] + 0.02 + j * 0.05, db(-24), pan=(j - 1) * 0.3)
n_s = int((END["sweep"] - c["wave"] + 0.2) * SR)                                       # the squeeze wave: a slow wet swell
sq = filt(pink(n_s, 42), "bandpass", [60, 300]) * np.sin(np.pi * np.linspace(0, 1, n_s)) ** 0.7
sfx.add(pan_st(sq / (np.abs(sq).max() + 1e-9), np.linspace(-0.4, 0.5, n_s)), c["wave"] - 0.1, db(-14))
sfx.add(pan_st(filt(squelch(0.45, 43), "lowpass", 700), 0.2), c["through_end"] + 0.02, db(-20))

# ================================================================= 5. sweep: leftovers + bacteria swept along
sfx.add(pan_st(whoosh(0.3, 2000, 500, 50, 0.7), 0), SHOT["sweep"] - 0.3, db(-26))
for k in range(5):                                                                     # debris tumbling (low clatter)
    sfx.add(pan_st(filt(crumple(0.25, 51 + k), "lowpass", 2500), -0.3 + 0.15 * k), SHOT["sweep"] + 0.3 + k * 0.38, db(-36))
for k, f0 in enumerate((1900, 2300, 2100)):                                           # the bacteria: "eep!" (after "bacteria")
    sfx.add(pan_st(squeak(0.09, f0, f0 * 1.4), 0.3 + 0.1 * k), c["bacteria_end"] + 0.02 + k * 0.07, db(-24))

# ================================================================= 6. loud: empty, gas + juice, squeezed through
sfx.add(pan_st(whoosh(0.3, 600, 2400, 60, 0.8), 0), SHOT["loud"] - 0.3, db(-26))
sfx.add(thump(0.3, 120, 60, 0.06), c["empty_end"] + 0.02, db(-18))                  # EMPTY stamps (after the word)
for k in range(4):                                                                     # bubbles wobble in the pauses
    sfx.add(pan_st(bloop(300 + 60 * k, 180 + 30 * k, 0.18), -0.4 + 0.25 * k), c["empty_end"] + 0.12 + k * 0.08, db(-30))
for k, f in enumerate((520, 700)):
    sfx.add(pan_st(drip(61 + k, f * 2), 0.3), c["juice_end"] + 0.05 + 0.1 * k, db(-30))
# the squeeze through the pinch: growls with gurgles, mostly after "tube."
sfx.add(pan_st(stomach_growl(0.5, 63), 0), c["tube_end"] + 0.02, db(-8))
sfx.add(pan_st(filt(gurgle(0.35, 64, 26), "lowpass", 900), 0), c["tube_end"] + 0.15, db(-18))

# ================================================================= 7. pipes: "Bagpipes."
sfx.add(thump(0.25, 140, 60, 0.05), SHOT["pipes"], db(-20))                          # the hard cut
drn = bagpipe_sound(c["bagpipes_end"] - SHOT["pipes"] + 0.05, 70, (440.0,), 110.0)
sfx.add(pan_st(filt(drn, "lowpass", 300), 0), SHOT["pipes"] + 0.02, db(-22))          # the drones only, under the word
sk = bagpipe_sound(END["pipes"] - c["bagpipes_end"] - 0.03, 71, (784.0, 880.0, 988.0), 110.0)
sfx.add(pan_st(fade(sk, 0.01, 0.1), 0), c["bagpipes_end"] + 0.02, db(-9))           # the skirl, after the word

# ================================================================= 8. full: same squeeze, muffled
sfx.add(pan_st(whoosh(0.25, 2400, 600, 80, 0.7), 0), SHOT["full"] - 0.25, db(-26))
sfx.add(pan_st(filt(squelch(0.5, 81), "lowpass", 600), -0.2), c["squeeze2_end"] + 0.02, db(-22))
sfx.add(pan_st(stomach_growl(0.4, 82), -0.3), c["squeeze2_end"] + 0.08, db(-14))     # the empty tube: GRRR (in the pause)
sfx.add(pan_st(filt(stomach_growl(0.35, 83), "lowpass", 120), 0.2), c["full_end"] + 0.03, db(-20))   # the full one: mmf

# ================================================================= 9. proof: 1912, the balloon
sfx.add(pan_st(riser(0.4, 90, 300, 1800), 0), SHOT["proof"] - 0.4, db(-28))          # the film starts
sfx.add(pan_st(crackle(int(0.3 * SR), 300, 91, 1500, 7000), 0), SHOT["proof"], db(-24))
sfx.add(thump(0.45, 120, 45, 0.12), c["year_end"] + 0.02, db(-14))                   # 1912 stamps (after the year)
sfx.add(pan_st(gulp(92), -0.3), c["swallowed_end"] + 0.02, db(-12))                   # GULP (after "SWALLOWED")
sfx.add(pan_st(balloon_inflate(0.17, 93), 0.2), c["balloon_end"] + 0.01, db(-20))    # the balloon fills (after "balloon")
for k, m in enumerate((40, 43)):                                                       # the spy sting: dun... dun (after "stomach")
    sfx.add(pan_st(fade(pizz(mtof(m), 0.17, 94 + k) * 1.4, 0.002, 0.05), 0.3), c["proof_end"] + 0.02 + k * 0.11, db(-16))

# ================================================================= 10. match: hunger pangs on the squeezes
KY_PER = 1.15
tp = SHOT["match"] - 0.6
while tp < END["match"]:                                                               # the key clicks on every peak (scenes.js's KY_PER)
    pk = (np.floor((tp + 0.3) / KY_PER - 0.5) + 0.5) * KY_PER - 0.3
    tp += KY_PER
    if pk >= c["hunger"] - 0.25 and SHOT["match"] < pk < END["match"]:
        sfx.add(pan_st(key_click(100 + int(pk * 10)), 0.35), pk, db(-28))
for j, m in enumerate((84, 88, 91, 96)):                                               # MATCH: bright after "squeezes"
    sfx.add(bell(mtof(m), 0.5, 0.15) * 0.5, c["match_end"] + 0.03 + j * 0.05, db(-20), pan=(j - 1.5) * 0.3)

# ================================================================= 11. button: not rude, just vacuuming
sfx.add(pan_st(whoosh(0.35, 400, 2600, 110, 0.8), 0), SHOT["button"] - 0.3, db(-24))
sfx.add(pan_st(stomach_growl(0.22, 111), 0), c["growl_end"] + 0.02, db(-14))          # a tiny reprise (after "growl?")
sfx.add(pan_st(buzzer(0.25), 0), c["rude_end"] + 0.02, db(-20))                       # RUDE crossed out
sfx.add(pan_st(blip(500, 900, 0.1, 112, 0.04), 0.3), c["gut_end"] + 0.02, db(-26))   # the x-ray window pops
sfx.add(pan_st(vacuum_whine(END["button"] - c["vac_end"] + 0.05, 113), 0.3), c["vac_end"] + 0.02, db(-12))

# ================================================================= 12. sub: whispered tease, the LOUD click, the shush
sfx.add(pan_st(whoosh(0.3, 1800, 500, 120, 0.6), 0), SHOT["sub"] - 0.3, db(-28))
for k in range(3):                                                                     # goosebumps: a shiver (after the word)
    sfx.add(pan_st(blip(2600 - 300 * k, 3400 - 300 * k, 0.05, 121 + k, 0.02), 0.2), c["goose_end"] + 0.02 + 0.06 * k, db(-30))

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# the pop and the bell stay quiet (they sit by the spoken subscribe line); the CLICK is the joke: too loud for an exam
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"] + 0.05, db(-28))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.17, db(-30))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-8))
        sfx.add(pan_st(key_click(73), 0), c["sub_tap"] + 0.005, db(-14))
        sfx.add(pan_st(whoosh(0.3, 500, 2000, 74, 0.6), np.linspace(-0.5, 0.5, int(0.3 * SR))), c["sub_tap"] + 0.1, db(-30))  # heads turn
        sfx.add(pan_st(bell(1760, 0.35, 0.1), 0), c["quietly_end"] + 0.03, db(-28))
sfx.add(pan_st(shush(0.75, 75), -0.4), c["shush"], db(-14))                           # SHHHH (after "exam.")

# ================================================================= score (drops out for every punchline)
# hook + react: no music at all (it's an exam): the room, the clock, the pencils, the growl
# name: a curious pizzicato tiptoe; it stops for her growled "growls"
groove(mus, c["called"] + 0.15, c["growls_w"] - 0.05, 100, ["Dm", "Bb", "Gm", "A"], gain=-10, seed=10, kick_on=False, padv=False)
# clean -> loud: the mechanism drive
groove(mus, c["hours"] + 0.35, c["tube_end"], 112, ["Am", "F", "C", "G"], gain=-12, seed=20, sixteen=True, snaps=False, cutoff=1100)
# full: back to the drive (after its first words)
groove(mus, c["full"] + 0.5, END["full"] - 0.05, 112, ["Am", "F", "C", "G"], gain=-10, seed=21, snaps=False)
# proof + match: a silent-film stride piano
rag(mus, c["weirdest"] + 0.3, END["match"] - 0.05, 126, gain=-9, seed=30)
# button: a playful bounce, cut for "rude", back for the vacuum
groove(mus, c["so"] + 0.35, c["rude_end"], 108, ["F", "Dm", "Bb", "C"], gain=-11, seed=40, kick_on=False)
groove(mus, c["justgut"] + 0.25, END["button"], 108, ["F", "C", "Bb", "C"], gain=-12, seed=41, kick_on=False, snaps=False)
# sub: tiptoe plucks under the whisper, dead silent at the click
for k, m in enumerate((65, 69, 72, 69, 65, 67, 69, 72, 74, 72)):
    tk = SHOT["sub"] + 0.2 + k * 0.28
    if tk < c["sub_in"] - 0.1:
        mus.add(pan_st(fade(filt(pizz(mtof(m - 12), 0.3, 50 + k), "lowpass", 900), 0.002, 0.05), 0.3 * (-1) ** k), tk, db(-25))
silence(mus, [(c["empty"] - 0.15, c["empty_end"] + 0.3), (c["squeezed"] - 0.1, c["tube_end"] + 0.05), (c["swallowed"] - 0.05, c["balloon_end"] + 0.35),
              (c["proof_end"], c["pangs"])])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -20.0, "music": -12.0})
