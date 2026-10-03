"""Why Do We Get GOOSEBUMPS? Short: sound design, score and mix, cue-locked to timeline.json.

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


def sweep(x, a=-0.6, b=0.6):
    """a mono sound panned across the stereo field while it plays"""
    return pan_st(x, np.linspace(a, b, len(x)))


# ================================================================= ambience (one bed per world, gated to its shots)
ARMCUT = c["armcut"]
# the living room: a quiet room, the TV's low hum
room_on = gate(N, [(0, ARMCUT)] + on("joke", "music", "showoffs", "sub"))
room = np.stack([filt(brown(N, s), "lowpass", 240) for s in (1, 2)])
amb.x += room / (np.abs(room).max() + 1e-9) * 0.7 * room_on
# the macro arm: closer, drier air
arm_on = gate(N, [(ARMCUT, END["hook"])] + on("react", "name", "command"))
amb.x += pan_st(filt(brown(N, 3), "lowpass", 160), 0) * 0.2 * arm_on
# inside the skin: a slow warm pulse
skin_on = gate(N, on("mech", "bump"))
pulse = filt(pink(N, 4), "bandpass", [45, 300]) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.1 * tt) ** 2)
amb.x += pan_st(pulse / (np.abs(pulse).max() + 1e-9), 0) * 0.8 * skin_on
# the snowy yard: wind under 400 Hz, gusting
yard_on = gate(N, on("fur", "huge"))
wind = np.stack([filt(pink(N, s), "bandpass", [90, 400]) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.31 * tt + s) ** 2) for s in (5, 6)])
amb.x += wind / (np.abs(wind).max() + 1e-9) * 0.9 * yard_on

# ================================================================= 1. hook: the jump scare, the creepy film, the dive, the hairs
sfx.add(pan_st(horror_stab(0.5, 1), 0), 0.0, db(-8))                                  # frame 1: the TV screams
pops([0.03, 0.06, 0.09, 0.13, 0.17, 0.22, 0.28], sfx, db(-24), 3)                    # popcorn leaves the bucket
sfx.add(pan_st(rustle(0.3, 4), 0.1), 0.02, db(-24))
for k, tk in enumerate((0.72, 0.84, 0.95, 1.08, 1.2)):                               # ... and rains down
    sfx.add(pan_st(pen_tick(10 + k), -0.5 + 0.25 * k), tk, db(-36))
sfx.add(pan_st(filt(bonk(), "lowpass", 2400), 0.1), c["headpop"], db(-26))           # one piece lands on his head
# the film's music: a low cluster that swells, a music box in the pauses, a heart speeding up
drone(mus, 0.4, c["rise"] + 0.1, [38, 44, 45, 51], cutoff=380, gain=-27, seed=2, swell=0.8)
for tk, m in ((c["movie_end"] + 0.02, 76), (c["music_end"] + 0.02, 75)):                # a music box, only in the pauses
    mus.add(pan_st(fade(filt(music_box(mtof(m), 0.2, m), "highpass", 500), 0.001, 0.08), 0.3), tk, db(-27))
for k, tk in enumerate((1.0, 1.75, 2.45, 3.1, 3.65, 4.1)):
    bed.add(pan_st(heartbeat(k), 0), tk, db(-15 + k))
sfx.add(pan_st(filt(whoosh(0.4, 250, 1400, 20, 0.75), "lowpass", 1500), 0), c["and_your"] + 0.02, db(-27))  # the dive into his arm (low, under the words)
sfx.add(thump(0.3, 130, 50, 0.09), ARMCUT, db(-18))
sfx.add(pan_st(riser(c["rise"] - c["does"] + 0.1, 21, 300, 1500), 0), c["does"] - 0.1, db(-32))
# the hairs rise: quietly under "this", then the shudder in the gap after it
sfx.add(sweep(hair_zip(0.42, True, 5)), c["rise"], db(-27))
sfx.add(pan_st(shiver(0.5, 6), 0), c["this_end"] + 0.03, db(-13))
sfx.add(sweep(hair_zip(0.3, True, 7, 14), 0.6, -0.6), c["this_end"] + 0.05, db(-20))
for j, m in enumerate((91, 95, 98)):
    sfx.add(bell(mtof(m), 0.5, 0.14) * 0.5, c["this_end"] + 0.1 + j * 0.06, db(-26), pan=(j - 1) * 0.4)

# ================================================================= 2. react: the goose lands. "Congrats. You're a plucked goose."
sfx.add(pan_st(whoosh(0.3, 1600, 400, 30, 0.6), 0.3), SHOT["react"] - 0.02, db(-24))  # it drops in
sfx.add(thump(0.22, 170, 70, 0.05), SHOT["react"] + 0.2, db(-18))                    # and lands (low, under "Congrats")
sfx.add(pan_st(honk(0.14, 560, 470, 31), 0.25), c["congrats_end"] + 0.07, db(-16))   # "honk?"
sfx.add(pan_st(honk(0.22, 480, 340, 32), 0.25), c["goose_end"] + 0.03, db(-9))       # HONK. (after the punchline)

# ================================================================= 3. name: GOOSE / BUMPS
sfx.add(thump(0.3, 120, 48, 0.1), c["goosebumps"] - 0.03, db(-14))                   # GOOSE lands
sfx.add(thump(0.3, 105, 42, 0.1), c["goosebumps"] + 0.22, db(-14))                   # BUMPS lands
for j, m in enumerate((79, 84)):
    sfx.add(fade(marimba(mtof(m), 0.2, j), 0.001, 0.06), c["goosebumps_end"] + 0.02 + j * 0.08, db(-25), pan=0.2)

# ================================================================= 4. mech: tiny muscle, scared or cold, the nerve yanks them all
sfx.add(pan_st(whoosh(0.28, 300, 2400, 40, 0.8), 0), SHOT["mech"] - 0.3, db(-25))
sfx.add(filt(bloop(160, 60, 0.3), "lowpass", 260), SHOT["mech"] - 0.04, db(-22))
gh = glide(520, 800, 0.14, 1.0)
gh = np.concatenate([gh, glide(800, 560, 0.16, 1.0)]) * np.sin(np.pi * np.linspace(0, 1, len(gh) + int(round(0.16 * SR)))) ** 0.7
sfx.add(pan_st(fade(gh, 0.01, 0.03), -0.4), c["scared"] - 0.3, db(-24))                  # wooOOoo: the ghost (in the pause before "Scared")
for j, m in enumerate((98, 103)):
    sfx.add(bell(mtof(m), 0.4, 0.12) * 0.5, c["cold_end"] + 0.03 + j * 0.07, db(-26), pan=0.4)   # ice
FIRE = c["yank"] + 0.03
n_z = int(0.56 * SR)                                                                   # the signal runs along the nerve
sfx.add(sweep(crackle(n_z, 160, 41, 2500, 7000) * np.linspace(0.3, 1, n_z)), FIRE - 0.6, db(-33))
sfx.add(pan_st(fade(pizz(mtof(40), 0.4, 42) * 1.4, 0.002, 0.08), 0), FIRE, db(-13))  # the yank: a low twang
sfx.add(thump(0.3, 140, 50, 0.08), FIRE, db(-13))
sfx.add(sweep(hair_zip(0.22, True, 43, 12)), c["once_end"] + 0.02, db(-21))          # every hair twitches (after "once")

# ================================================================= 5. bump: the hair stands up, the skin bunches
sfx.add(pan_st(whoosh(0.26, 600, 2200, 50, 0.6), 0), SHOT["bump"] - 0.24, db(-26))
sfx.add(pan_st(slide_whistle(0.15, 620, 1500), 0.1), c["up_end"] + 0.02, db(-29))    # up it goes (in the pause)
sfx.add(pan_st(filt(squelch(0.4, 51), "lowpass", 480), -0.1), c["bunches"], db(-20))
sfx.add(pan_st(blip(240, 500, 0.16, 52, 0.06), 0), c["bump_end"] + 0.03, db(-15))    # boing: BUMP! (after the word)
sfx.add(thump(0.25, 150, 60, 0.07), c["bump_end"] + 0.03, db(-14))

# ================================================================= 6. fur: the cat in the snow fluffs up; warm air
sfx.add(pan_st(whoosh(0.35, 2200, 500, 60, 0.6), 0), SHOT["fur"] - 0.3, db(-24))
sfx.add(bell(mtof(96), 0.5, 0.18), c["genius_end"] + 0.03, db(-22), pan=0.4)          # the light bulb: ding
sfx.add(thump(0.35, 130, 46, 0.11), c["fluffed"] - 0.04, db(-13))                    # POOF (low, under "Fluffed")
sfx.add(pan_st(filt(whoosh(0.32, 180, 800, 61, 0.5), "lowpass", 900), 0), c["fluffed"] - 0.04, db(-18))
bed.add(pan_st(purr(END["fur"] - c["warm"] + 0.2, 62), -0.15), c["warm"], db(-9))    # content: a purr under it all
sfx.add(pan_st(meow(0.16, 700, 930, 680, 63), -0.2), c["air_end"] + 0.02, db(-20))   # "mrrp" (in the pause)

# ================================================================= 7. huge: the dog, the cat puffs up HUGE, the dog thinks again
bed.add(pan_st(growl(c["huge"] - SHOT["huge"] + 0.1, 70), 0.5), SHOT["huge"] + 0.02, db(-13))  # the dog (low, under the line)
sfx.add(pan_st(riser(c["huge"] - c["look"] + 0.05, 71, 250, 1200), 0), c["look"] - 0.05, db(-33))
sfx.add(thump(0.6, 110, 34, 0.22), c["huge"] - 0.03, db(-7))                          # POOF
sfx.add(pan_st(filt(whoosh(0.4, 200, 1100, 72, 0.5), "lowpass", 1400), -0.2), c["huge"] - 0.03, db(-19))
sfx.add(pan_st(cat_hiss(0.34, 73), -0.3), c["huge_end"] + 0.03, db(-15))             # HHSSS (after "HUGE")
sfx.add(pan_st(whimper(74), 0.6), c["huge_end"] + 0.08, db(-17))                     # the dog reconsiders

# ================================================================= 8. joke: "You lost the fur... but kept the button." (no score)
sfx.add(pan_st(slide_whistle(0.2, 1300, 520), 0), c["fur2_end"] + 0.02, db(-22))     # the fur drops (in the pause)
sfx.add(pan_st(rustle(0.25, 81), 0.1), c["fur2_end"] + 0.04, db(-28))
sfx.add(pan_st(blip(600, 1200, 0.08, 82, 0.03), 0.4), c["kept"] - 0.08, db(-28))     # the callout pops
sfx.add(bell(mtof(81), 0.3, 0.1), c["button_end"] + 0.03, db(-19), pan=0.4)           # the button: bing
sfx.add(thump(0.2, 200, 90, 0.05), c["button_end"] + 0.03, db(-18))

# ================================================================= 9. music: a note presses it; the same old alarm
sfx.add(pan_st(key_click(90), 0), SHOT["music"] + 0.06, db(-22))                      # headphones on
HIT = c["hit"]
for j, m in enumerate((84, 88, 91, 96)):                                               # the note lands: a bright chord
    sfx.add(bell(mtof(m), 0.3, 0.09) * 0.5, HIT + j * 0.025, db(-20), pan=(j - 1.5) * 0.3)
sfx.add(thump(0.25, 180, 70, 0.06), HIT, db(-16))
sfx.add(sweep(hair_zip(0.2, True, 91, 10)), HIT + 0.04, db(-24))                      # the chills
bed.add(pan_st(heartbeat(92), -0.2), c["big"] - 0.02, db(-12))                         # big emotions
bed.add(pan_st(heartbeat(93), -0.2), c["emotions_end"] + 0.02, db(-12))
sfx.add(pan_st(alarm_bell(0.25, 94), 0.35), c["alarm_end"] + 0.02, db(-13))           # RRRING (after "alarm.")

# ================================================================= 10. command: on command (a light switch)
for tk, g, up, sd in ((c["sw_on1"], -19, True, 101), (c["sw_off"], -13, False, 102), (c["sw_on2"], -19, True, 103)):
    sfx.add(pan_st(key_click(sd), -0.4), tk, db(g))
    sfx.add(pan_st(filt(snap(sd), "lowpass", 2500), -0.4), tk, db(g - 6))
    sfx.add(sweep(hair_zip(0.16, up, sd + 3, 9)), tk + 0.02, db(g - 9))
for j, m in enumerate((88, 93)):
    sfx.add(bell(mtof(m), 0.4, 0.13) * 0.5, c["command_end"] + 0.03 + j * 0.08, db(-20), pan=0.3)   # ta-da

# ================================================================= 11. showoffs: he strains. Nothing. (no score)
sfx.add(pan_st(creak(0.2, 110, 55, 105), 0), SHOT["showoffs"] + 0.01, db(-20))
sfx.add(pan_st(breath(0.3, 111, exhale=True), 0), c["showoffs_end"] + 0.04, db(-24))  # he gives up
sfx.add(pan_st(cricket(112, 2), 0.5), c["showoffs_end"] + 0.2, db(-32))

# ================================================================= 12. sub: the tease, the click, ONE hair, the loop
sfx.add(pan_st(blip(700, 1400, 0.08, 120, 0.03), 0), c["nextup"] - 0.05, db(-28))     # the card
for k, sd in enumerate((-1, 1)):                                                        # his ears pop (after "pop")
    sfx.add(blip(380, 760, 0.07, 121 + k, 0.02), c["pop_end"] + 0.02 + k * 0.07, db(-19), pan=0.7 * sd)
# subscribe cue: the pop and the bell stay quiet (they sit by the spoken line); the click obeys "on command"
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"] + 0.02, db(-27))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.14, db(-29))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-13))
        sfx.add(pan_st(key_click(73), 0), c["sub_tap"] + 0.004, db(-18))
# exactly one hair: pwip ... ding!
sfx.add(pan_st(hair_zip(0.05, True, 124, 3), 0.3), c["onehair"], db(-17))
sfx.add(bell(mtof(100), 0.6, 0.2), c["onehair"] + 0.05, db(-15), pan=0.3)
for j, m in enumerate((72, 79)):
    sfx.add(pizz(mtof(m), 0.3, 125 + j), c["onehair"] + 0.24 + j * 0.1, db(-22), pan=-0.2)
# the loop: the film rears up again, straight into frame 1's scream
sfx.add(pan_st(riser(0.34, 126, 500, 2200), 0), DUR - 0.36, db(-22))

# ================================================================= score (drops out for every punchline)
# hook: the film's own music (above); react + name: nothing but the goose
# mech + bump: the mechanism drive (in after the first words, out for BUMP!)
groove(mus, c["each"] + 0.4, c["bump"] - 0.05, 112, ["Am", "F", "C", "G"], gain=-14, seed=20, sixteen=True, snaps=False, cutoff=1100)
# fur: a warm, cosy bounce; it stops dead when the dog arrives
groove(mus, c["furry"] + 0.35, END["fur"] - 0.05, 104, ["F", "Bb", "C", "F"], gain=-13, seed=30, kick_on=False)
drone(mus, SHOT["huge"] + 0.05, c["huge"] - 0.05, [38, 45, 50], cutoff=380, gain=-24, seed=31, swell=0.4)
# joke: silence. music: the song in his headphones
groove(mus, SHOT["music"] + 0.12, c["alarm"] - 0.08, 116, ["C", "G", "Am", "F"], gain=-16.5, seed=40, sixteen=True)
drone(mus, HIT, c["trip"], [72, 76, 79, 84], cutoff=2400, gain=-32, seed=41, swell=0.25)        # the shimmer of the chills
# command: a sneaky tiptoe; showoffs: silence
groove(mus, c["some"] + 0.25, c["command_end"], 100, ["Dm", "Bb", "Gm", "A"], gain=-13, seed=50, kick_on=False, padv=False)
# sub: tiptoe plucks under the tease, nothing at the click
for k, m in enumerate((65, 69, 72, 69, 65, 67, 69, 72, 74, 72, 69, 72)):
    tk = c["nextup"] + 0.25 + k * 0.26
    if tk < c["sub_in"] - 0.1:
        mus.add(pan_st(fade(filt(pizz(mtof(m - 12), 0.3, 60 + k), "lowpass", 900), 0.002, 0.05), 0.3 * (-1) ** k), tk, db(-24))
silence(mus, [(c["fluffed"] - 0.1, c["fluffed_end"] + 0.1), (c["on1"] - 0.25, c["on1"] - 0.02)])
# the song starts small in his headphones ("Even music can press it") and opens up when the note lands
i0, i1 = span(SHOT["music"], c["hit"])
mus.x[:, i0:i1] *= np.linspace(db(-9), db(-5), i1 - i0)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -20.0, "music": -12.5})
