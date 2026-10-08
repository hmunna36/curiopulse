"""Why Do Mosquitoes Bite YOU More? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

The rule this mix is built on (reference/sound.md): a mosquito's whine lives in the speech band, so the full whine is
only ever heard in a pause of the narration; under a word only its top (above 5.2 kHz) plays, on the bed bus. The same
for every hit that falls on a word: a low thud under 200 Hz on the word, the audible joke in the next pause.
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

CAMP = [(0, SHOT["skin"]), (SHOT["subcam"], SHOT["cheese"]), (SHOT["button"], DUR)]
MACRO = [(SHOT["skin"], SHOT["study"]), (SHOT["cheese"], SHOT["feet"])]
LAB = [(SHOT["study"], SHOT["subcam"]), (SHOT["feet"], SHOT["button"])]
TW1, TW2 = c["and1"] - 0.1, c["bites_end"] - 0.14      # the two whip pans of the hook (scenes.js: hookCam)


def low_thud(seed=0, f=70.0, dur=0.22):
    """a hit heard through the body or the table: under 200 Hz, so it can sit on a word"""
    n = int(dur * SR)
    x = np.sin(2 * np.pi * np.cumsum(np.linspace(f * 1.8, f, n)) / SR) * np.exp(-np.linspace(0, 7, n))
    return filt(x, "lowpass", 190)


def hi_tick(seed=0, f=6000.0, dur=0.05):
    """a tick above the speech band (cutlery, paper, a foot touching down)"""
    n = int(dur * SR)
    return filt(white(n, seed), "highpass", f) * np.exp(-np.linspace(0, 9, n)) * 0.8


def hi_sniff(seed=0, dur=0.13):
    """a sniff, only its airy top: it can sit under a word"""
    n = int(dur * SR)
    return filt(white(n, seed), "highpass", 5500) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.4 * 0.8


def low_whoosh(dur, seed):
    """a camera move or an arm swing under a line: nothing above 320 Hz"""
    return filt(whoosh(dur, 110, 480, seed, 0.8), "lowpass", 320)


def swarm(dur, seed, edges=False, n=3):
    """several whines at once, a little apart in pitch"""
    y = sum(mosquito_whine(dur, seed + k, 560 + 55 * k, bend=0.08 * (k - 1), edges=edges) for k in range(n))
    return y / n ** 0.5


# ================================================================= ambience (one bed per world, gated to its shots)
camp_on, macro_on, lab_on = gate(N, CAMP), gate(N, MACRO), gate(N, LAB)
amb.x += pan_st(filt(brown(N, 1), "lowpass", 230), 0) * 0.3 * camp_on                # the night air, low
amb.x += pan_st(fire_rumble(DUR, 3, 230)[:N], 0.25) * 0.2 * camp_on                  # the fire: a low roll, crackle up top
for a, b in CAMP:
    crickets(a + 0.2, b - 0.1, amb, db(-27), seed=int(a * 7) + 2, rate=0.7)
amb.x += pan_st(filt(brown(N, 2), "lowpass", 150), 0) * 0.27 * macro_on               # up close on the skin: a hush
amb.x += pan_st(filt(brown(N, 4), "lowpass", 130), 0) * 0.25 * lab_on                 # the lab: a hum, a little air
amb.x += pan_st(filt(pink(N, 5), "highpass", 6500), 0) * 0.011 * lab_on

# ================================================================= the hook: the whine at his cheek, the slap
sfx.add(pan_st(mosquito_whine(0.1, 1, 640, swell=False), 0.35), 0.0, db(-18))         # frame 1, before "You" (she starts at 0.14)
bed.add(pan_st(mosquito_whine(c["slap"] - 0.06, 2, 640, edges=True, swell=False), 0.35), 0.09, db(-13))
bed.add(pan_st(low_whoosh(0.26, 20), 0.2), c["slap"] - 0.24, db(-9))                  # his arm coming round
sfx.add(pan_st(slap_hit(1), 0.2), c["slap"], db(-10))                                 # the slap: short, on the frame
bed.add(pan_st(slap_hit(2, edges=True), 0.2), c["slap"], db(-2))
sfx.add(pan_st(bell(5274, 0.3, 0.18), 0.1), c["slap"] + 0.05, db(-28))                # the counter turns over
for i, t0 in enumerate([c["slap"] + 0.56, c["slap"] + 0.74, c["number"] + 0.02, c["number"] + 0.2, c["ten"]]):
    bed.add(pan_st(mosquito_whine(0.3, 30 + i, 590 + 40 * i, bend=-0.2, edges=True), 0.6 * (-1) ** i), t0 - 0.34, db(-15))
    bed.add(pan_st(hi_tick(40 + i, 6500), 0.5 * (-1) ** i), t0, db(-22))
bed.add(pan_st(low_whoosh(0.34, 31), 0), TW1 - 0.04, db(-7))                          # the whip to his friend
bed.add(pan_st(mosquito_whine(0.7, 6, 600, edges=True), -0.5), TW1 + 0.28, db(-15))   # one comes to look him over
sfx.add(pan_st(bell(5274, 0.45, 0.3), 0.2), c["zero"], db(-27))                       # the halo, up top
sfx.add(pan_st(whoosh(0.3, 300, 2200, 32, 0.8), 0), TW2 - 0.02, db(-21))              # the whip back, in the pause
sfx.add(pan_st(swarm(0.36, 50), 0), c["bites_end"] + 0.1, db(-20))                    # ...to the cloud round his head

# ================================================================= the answer
sfx.add(pan_st(buzzer(0.2), 0.3), c["blood_end"] + 0.06, db(-25))                     # SWEET BLOOD? crossed out
bed.add(pan_st(low_thud(3, 90, 0.2), 0.3), c["blood"] + 0.06, db(-10))
sfx.add(pan_st(bell(5600, 0.5, 0.35), -0.3), c["smells"], db(-30))                    # the smell rises
sfx.add(pan_st(mosquito_whine(0.42, 5, 540, bend=0.3), -0.4), c["like_end"] + 0.08, db(-20))   # the guest arrives
sfx.add(pan_st(bell(2093, 0.3, 0.18), -0.3), c["dinner_end"] + 0.04, db(-23))         # service!
for k in range(2):
    sfx.add(pan_st(hi_tick(60 + k, 6800), -0.3), c["dinner_end"] + 0.14 + 0.08 * k, db(-20))

# ================================================================= the trail of his breath
for k, key in enumerate(("track", "breath", "from")):                                # the trail, ticking along up top
    bed.add(pan_st(bell(5274, 0.2, 0.1), 0.5 - 0.4 * k), c[key], db(-25))
sfx.add(pan_st(bell(1319, 0.3, 0.2), -0.2), c["breath_end"] + 0.06, db(-27))          # a sonar ping, in the pause
bed.add(pan_st(low_whoosh(0.5, 33), 0), SHOT["breath"] + 0.3, db(-9))                 # the pan across the meadow
for k in range(2):
    sfx.add(pan_st(beep(2400, 0.055), -0.5), c["away_end"] + 0.03 + 0.08 * k, db(-23))   # locked on
sfx.add(pan_st(mosquito_whine(0.2, 7, 600, bend=0.6), -0.3), c["away_end"] + 0.08, db(-20))   # and off it goes

# ================================================================= on the skin
bed.add(pan_st(slap_hit(3, edges=True), -0.3), c["then"] + 0.24, db(-14))             # it touches down
for k in range(2):
    bed.add(pan_st(hi_sniff(70 + k), -0.2), c["sniff"] + 0.02 + 0.24 * k, db(-17))
sfx.add(pan_st(marimba(196, 0.24, 1), 0), c["suspect_end"] + 0.02, db(-25))           # dun-dun
sfx.add(pan_st(marimba(175, 0.3, 2), 0), c["suspect_end"] + 0.13, db(-25))
for k in range(4):
    bed.add(pan_st(bloop(230, 120, 0.12), 0.4 - 0.25 * k), c["oily"] + 0.02 + 0.13 * k, db(-14))   # beads of oil
sfx.add(pan_st(bell(3136, 0.16, 0.07), 0.2), c["acids_end"] + 0.02, db(-24))          # the acids come off
sfx.add(pan_st(bell(4186, 0.14, 0.06), 0.3), c["acids_end"] + 0.07, db(-25))

# ================================================================= two arms
bed.add(pan_st(filt(riser(1.3, 3, 70, 240), "lowpass", 300), 0), c["some"], db(-10))  # it builds, low
sfx.add(pan_st(riser(0.25, 5, 500, 2200), 0), c["way"] - 0.27, db(-25))               # ...and tips over, in the pause
bed.add(pan_st(low_thud(8, 84, 0.3), 0), c["way"], db(-7))
sfx.add(pan_st(hiss(0.2, 6), 0), c["way_end"] + 0.02, db(-25))
sfx.add(pan_st(swarm(0.3, 55), 0.3), c["more_end"] + 0.04, db(-20))                   # they pour in

# ================================================================= the study
sfx.add(pan_st(key_click(1), 0), c["study_end"] + 0.1, db(-21))                       # the gate
bed.add(pan_st(low_thud(9, 100, 0.16), 0), c["study_end"] + 0.1, db(-12))
bed.add(pan_st(swarm(c["hundred"] - c["volunteer"], 60, edges=True), 0.3), c["volunteer"], db(-13))
sfx.add(pan_st(drumroll(0.36, 2), 0), c["volunteer_end"] + 0.33, db(-25))             # ...was... a...
bed.add(pan_st(low_thud(10, 90, 0.3), 0.3), c["hundred"], db(-7))
bed.add(pan_st(bell(5274, 0.3, 0.2), 0.3), c["hundred"], db(-22))
for t0 in (c["stayed"] + 0.08, c["way2"] + 0.1):                                      # the calendar's pages
    bed.add(pan_st(hi_tick(80, 5600, 0.07), -0.4), t0, db(-15))
bed.add(pan_st(low_thud(11, 86, 0.3), 0), c["years"], db(-7))                         # STILL A MAGNET, under the word
sfx.add(pan_st(wahwah(2)[: int(0.34 * SR)] * np.linspace(1, 0, int(0.34 * SR)), 0), c["years_end"] + 0.04, db(-24))

# ================================================================= the aside: he sniffs his own arm
for k, dt in enumerate((0.62, 0.98)):
    bed.add(pan_st(hi_sniff(90 + k, 0.14), 0), SHOT["subcam"] + dt, db(-16))
sfx.add(pan_st(slide_whistle(0.28, 1250, 520), 0), c["smellier_end"] + 0.04, db(-26))  # pee-yew

# ================================================================= cheese
sfx.add(pan_st(marimba(523, 0.2, 3), 0.3), c["acids2_end"] + 0.03, db(-24))
bed.add(pan_st(bloop(200, 90, 0.2), 0.4), c["cheese1"], db(-12))
sfx.add(pan_st(squeak(0.09, 900, 520), 0.4), c["stink_end"] + 0.02, db(-26))

# ================================================================= the experiment: a scale, a cheese, a foot
for k, dt in enumerate((0.3, 0.58)):
    bed.add(pan_st(low_thud(20 + k, 96 - 12 * k, 0.2), -0.4 + 0.8 * k), SHOT["feet"] + dt, db(-10))
sfx.add(pan_st(marimba(784, 0.14, 4), 0), c["exp_end"] + 0.04, db(-27))               # a prize
sfx.add(pan_st(marimba(1047, 0.22, 5), 0), c["exp_end"] + 0.15, db(-27))
sfx.add(pan_st(swarm(0.17, 65), 0), c["mosq2_end"] + 0.01, db(-21))                   # the cage opens
bed.add(pan_st(swarm(c["cheese2_end"] - c["loved"], 66, edges=True), -0.4), c["loved"], db(-13))
for k in range(2):
    sfx.add(pan_st(squeak(0.07, 1700, 2600), -0.4), c["cheese2_end"] + 0.06 + 0.14 * k, db(-25))   # mwah, mwah
bed.add(pan_st(swarm(c["feet_end"] - c["asmuch"], 67, edges=True), 0.4), c["asmuch"], db(-13))
bed.add(pan_st(low_thud(22, 90, 0.3), 0), c["feet"] + 0.14, db(-8))                   # A TIE, under the word
for k in range(2):
    sfx.add(pan_st(bell(1319, 0.3, 0.2), 0), c["feet_end"] + 0.06 + 0.17 * k, db(-25))   # ding-ding

# ================================================================= the button: not sweet; a cheese board
sfx.add(pan_st(buzzer(0.2), 0.3), c["sweet2_end"] + 0.07, db(-27))
bed.add(pan_st(low_whoosh(0.9, 34), 0), c["youre"] - 0.05, db(-10))                   # the pull back
for k in range(5):
    bed.add(pan_st(bloop(220 - 14 * k, 110, 0.12), -0.5 + 0.25 * k), c["youre"] + 0.16 + 0.15 * k, db(-13))   # things land on the board
sfx.add(pan_st(drumroll(0.4, 3), 0), c["youre_end"] + 0.06, db(-26))
bed.add(pan_st(hi_tick(85, 6200), 0), c["cheese3"], db(-18))                          # the flag
sfx.add(pan_st(springs(4, 0.32), 0), c["board_end"] + 0.03, db(-27))
for k in range(6):
    sfx.add(pan_st(hi_tick(100 + k, 6600), -0.6 + 0.24 * k), c["board_end"] + 0.1 + 0.035 * k, db(-21))   # knives and forks, up
bwomp(mus, c["board_end"] + 0.05, 34, -18)
amb.add(cricket(5, 3), c["board_end"] + 0.62, db(-20), pan=0.4)                       # the stare
sfx.add(pan_st(whoosh(0.3, 400, 2600, 77, 0.9), 0), DUR - 0.62, db(-20))              # the whip back to frame 1
loop_n = int(0.3 * SR)
sfx.add(pan_st(mosquito_whine(0.3, 1, 640, swell=False) * np.linspace(0, 1, loop_n) ** 2, 0.35), DUR - 0.3, db(-18))

# ================================================================= per shot: a soft whoosh into the cuts that have a pause
for i, s in enumerate(TL["shots"][1:]):
    if s["id"] in ("answer", "more", "years", "subcam", "skin", "button"):
        continue
    sfx.add(pan_st(whoosh(0.24, 400 + 150 * (i % 4), 2200, 500 + i), 0), s["start"] - 0.2, db(-25))

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is mid-video, so the narration carries on right after the word "subscribe".
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-24))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-19))
        sfx.add(pan_st(bell(1760, 0.22, 0.2), 0), c["sub_tap"] + 0.04, db(-32))

# ================================================================= score (drops out for every punchline)
groove(mus, 0.36, TW1, 132, ["Dm"], gain=-6, seed=10)                                             # nine bites and counting
drone(mus, TW1 + 0.25, TW2, [60, 64, 67], cutoff=900, gain=-27)                                    # his friend's peace
groove(mus, c["skin1"] + 0.24, c["like_end"], 104, ["Am"], gain=-9, seed=11, kick_on=False)        # sneaky
groove(mus, c["mosq"] + 0.45, c["from"], 112, ["Dm", "Bb"], gain=-7, seed=12)                      # the hunt (out for "thirty feet away")
groove(mus, SHOT["skin"] + 0.5, c["suspect_end"], 112, ["Gm", "Eb"], gain=-8, seed=13, kick_on=False)
groove(mus, c["oily"] + 0.3, c["way"] - 0.32, 112, ["Gm", "Cm"], gain=-7, seed=14)
groove(mus, SHOT["study"] + 0.45, c["volunteer_end"] + 0.3, 116, ["Dm", "C"], gain=-7, seed=15)    # the lab
groove(mus, c["hundred"] + 0.55, c["years"] - 0.08, 116, ["Bb", "C"], gain=-7, seed=16)
drone(mus, SHOT["subcam"] + 0.3, c["smellier_end"], [57, 60, 64], cutoff=700, gain=-29)
groove(mus, SHOT["cheese"] + 0.4, c["stink"] - 0.06, 100, ["F", "Bb"], gain=-7, seed=17)
groove(mus, SHOT["feet"] + 0.45, c["feet"] - 0.06, 120, ["Dm", "Bb", "F", "C"], gain=-6, seed=18)  # the weigh-in
drone(mus, c["youre"] - 0.1, c["youre_end"] + 0.45, [50, 57], cutoff=500, gain=-27)
silence(mus, [(TW2 - 0.05, c["skin1"] + 0.22), (c["like_end"], c["mosq"] + 0.4), (c["from"], SHOT["skin"] + 0.45), (c["acids_end"], c["people"] - 0.02), (c["another_end"], c["stayed"] + 0.12), (c["away_end"], SHOT["skin"] + 0.45),
              (c["suspect_end"], c["oily"] + 0.28), (c["way"] - 0.32, SHOT["study"] + 0.4), (c["volunteer_end"] + 0.3, c["hundred"] + 0.5),
              (c["years"] - 0.08, SHOT["subcam"] + 0.25), (c["smellier_end"], SHOT["cheese"] + 0.35), (c["stink"] - 0.06, SHOT["feet"] + 0.4),
              (c["feet"] - 0.06, c["youre"] - 0.12), (c["youre_end"] + 0.45, c["board_end"] + 0.03), (c["board_end"] + 0.7, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb)
