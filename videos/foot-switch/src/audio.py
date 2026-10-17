"""Why Does Your Foot FLIP When You Draw a 6? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.
Rule of the house (sound.md): a sound that lives in the speech band goes in a pause ("say it on the word, do it in the
pause"); under a word only what is under ~250 Hz or above ~5.2 kHz.
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice

SFX_LEVEL = -13.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(swish=-31, glint=-25, shimmer=-36, flipthud=-20, scratch=-19, tow=-29, hijack=-19, wah=-21, cord=-33, ding=-22,
         left=-21, dive=-23, click=-33, same=-21, squeak=-24, yank=-19, yoink=-20, pop=-24, page=-24, fumble=-21,
         meow=-19, ears=-25, tick=-23)


def thud_low(seed=0, f=70.0):
    """a soft landing heard through the body: all of it under ~250 Hz (it can sit on a word; mono, 0.3 s)"""
    n = int(0.3 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0, f0=5600):
    for i in range(n):
        bus.add(pan_st(glint(f0 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


def speaking(t):
    """is a word being spoken at time t (with a little margin either side)?"""
    return any(w["start"] - 0.03 <= t <= w["end"] + 0.06 for w in WORDS)


P_FOOT = 1.0 / C.get("foot_hz", 0.86)   # one circle of the foot (and one loop of the 6)


def foot_swishes(t0, t1, seed=0, pan=0.25, gain=0.0):
    """a soft air swish on every circle of the foot (top only: it runs under the words)"""
    k, tk = 0, t0
    while tk < t1:
        bed.add(pan_st(top_swish(0.16, seed + k), pan), tk, db(G["swish"] + gain))
        tk += P_FOOT
        k += 1


def shimmer(t0, t1, seed=0, gain=0.0, pan=0.3):
    """the 6's glowing loop: a faint fizz above 5.2 kHz while the finger goes round"""
    if t1 <= t0:
        return
    y = buzz_hi(t1 - t0, 46.0, seed, lo=6000)
    bed.add(pan_st(fade(y, 0.08, 0.15), pan), t0, db(G["shimmer"] + gain))


# ================================================================= ambience (one bed per world, gated to its shots)
office_on = gate(N, [(0, SHOT["same"] + 0.05), (SHOT["payoff"] - 0.05, DUR)])
hum = filt(brown(N, 1), "lowpass", 220) + 0.035 * np.sin(2 * np.pi * 100 * tt) + 0.02 * np.sin(2 * np.pi * 200 * tt)
amb.x += pan_st(hum, 0) * 0.30 * office_on                                      # the office at night: room tone + a light's hum
brain_on = gate(N, [(SHOT["same"], END["same"])])
throb = 0.6 + 0.4 * np.sin(2 * np.pi * 0.9 * tt) ** 2
amb.x += pan_st(filt(brown(N, 3), "lowpass", 170) * throb, 0) * 0.42 * brain_on  # inside the brain: a warm, slow throb

# ================================================================= the test: the foot circles, the finger draws a 6
sfx.add(pan_st(top_swish(0.22, 2), 0.25), 0.0, db(G["swish"] + 6))              # frame 1: the foot is already going
foot_swishes(0.12, END["boss"] - 0.3, seed=10)
for i, d in enumerate((0.0, 0.14, 0.28, 0.42)):                                 # the 6's top stroke: a sparkle as it draws
    bed.add(pan_st(glint(5800 + 500 * i, 0.08, 20 + i), 0.35), C["six_t0"] + d, db(G["glint"] - 2))
shimmer(C["six_loop"], END["boss"] - 0.2, seed=24)
# the flip: a low thud under the words (the foot stops)... and the record scratch in the pause after "hand."
bed.add(pan_st(thud_low(25, 64.0), 0.2), C["flip0"] + 0.05, db(G["flipthud"]))
bed.add(pan_st(top_swish(0.2, 26), 0.2), C["flip0"] + 0.18, db(G["swish"] + 4))
sfx.add(pan_st(scratch(0.3, 27), 0), C["hand1_end"] + 0.04, db(G["scratch"]))   # ends 0.15 s before "Yep"
# the answer: the tow rope zips out to the toe (top only), HIJACKED lands low, then a sad brass wah after "foot."
bed.add(pan_st(ratchet(0.3, 30.0, 60.0, 28, edges=True), 0.2), C["tow"], db(G["tow"]))
bed.add(pan_st(thud_low(29, 52.0), -0.3), C["hijacked"] + 0.05, db(G["hijack"]))
sfx.add(pan_st(slide(392, 196, 0.28, vib=4.0), 0), C["foot2_end"] + 0.03, db(G["wah"]))   # wah... (ends before "Your")

# ================================================================= one boss: the left side of the brain
bed.add(pan_st(glint(6400, 0.1, 40), 0.3), C["hand3"] + 0.05, db(G["glint"]))    # the hand lights up
bed.add(pan_st(glint(5600, 0.1, 41), 0.2), C["foot3"] + 0.05, db(G["glint"]))    # ...the foot
sparkle(C["share"] - 0.1, bed, G["glint"] - 3, seed=42, n=4, step=0.06, f0=6200)   # his head turns to glass
bed.add(pan_st(fade(buzz_hi(C["boss_end"] - C["share"], 30.0, 43, lo=5400), 0.1, 0.1), 0), C["share"], db(G["cord"]))   # the cords grow
sfx.add(pan_st(ding(84, 0.15, 44), 0), C["boss_end"] + 0.04, db(G["ding"]))      # ONE BOSS: ding (in the pause after "boss...")
bed.add(pan_st(thud_low(45, 70.0), -0.2), C["left1"] + 0.03, db(G["left"]))      # the LEFT half lights up (low, on the word)
sparkle(C["left1"] + 0.05, bed, G["glint"], seed=46, n=3, pan=-0.3)
sfx.add(pan_st(whoosh(0.26, 300, 2600, 47, 0.85), 0), C["brain_end"] + 0.02, db(G["dive"]))   # into the left half (ends before "It")

# ================================================================= inside: SAME WAY, then the six drags the foot along
def wheel_clicks(t0, t1, rate, seed=0, gain=0.0):
    """the wheels' ratchet as they turn (top only: it runs under the words)"""
    if t1 > t0:
        bed.add(pan_st(ratchet(t1 - t0, rate, rate, seed, edges=True), 0), t0, db(G["click"] + gain))


wheel_clicks(C["wants"], C["drag0"], 9.0, 50)
wheel_clicks(C["drag0"], END["same"] - 0.1, 22.0, 51, gain=2)
bed.add(pan_st(thud_low(52, 76.0), 0), C["same"] + 0.03, db(G["same"]))          # SAME WAY: the stamp lands (low, on "SAME")
sfx.add(pan_st(ding(79, 0.12, 53), -0.3), C["way_end"] + 0.03, db(G["ding"]))    # ...ding (in the pause after "way,")
sfx.add(pan_st(squeak(0.14, 2100, 2600), 0.3), C["six2_end"] + 0.03, db(G["squeak"]))   # the belt squeals (pause after "six")
bed.add(pan_st(thud_low(54, 58.0), 0.3), C["drags"] + 0.04, db(G["yank"]))       # the FOOT wheel is yanked (low, on "drags")
bed.add(pan_st(top_swish(0.24, 55), 0.3), C["drags"] + 0.08, db(G["swish"] + 6))
sfx.add(pan_st(slide(520, 1500, 0.22, vib=0.0), 0.2), C["along_end"] + 0.03, db(G["yoink"]))   # YOINK! (pause after "along.")
bed.add(pan_st(top_swish(0.2, 56), 0), SHOT["payoff"] - 0.08, db(G["swish"] + 6))  # back to the office

# ================================================================= the proof: the six with the LEFT hand
foot_swishes(SHOT["payoff"] + 0.1, END["payoff"] - 0.1, seed=60)
for i, d in enumerate((0.0, 0.14, 0.28, 0.42)):
    bed.add(pan_st(glint(5800 + 500 * i, 0.08, 61 + i), -0.35), C["six3_t0"] + d, db(G["glint"] - 2))
shimmer(C["six3_t0"] + 0.46, END["payoff"] - 0.1, seed=65, pan=-0.3)
sfx.add(pan_st(ding(88, 0.14, 66), 0.2), C["hand4_end"] + 0.03, db(G["tick"]))   # STILL CLOCKWISE, tick (pause after "hand.")
sfx.add(pan_st(ding(79, 0.11, 67), -0.2), C["easier_end"] + 0.03, db(G["ding"]))  # TWO BOSSES: ding...
sfx.add(pan_st(ding(84, 0.12, 68), 0.2), C["easier_end"] + 0.15, db(G["ding"] - 1))   # ...dong
sfx.add(pan_st(whoosh(0.24, 300, 2400, 69, 0.85), 0), C["right3_end"] + 0.12, db(G["dive"] - 2))   # into the dream (ends before "Weirder")

# ================================================================= the weirdest fact: even imagining it
bed.add(pan_st(bloop(260, 150, 0.2), 0.2), C["weirder"] + 0.02, db(G["pop"]))     # the bubble pops up (low)
sparkle(C["weirder"] + 0.1, bed, G["glint"] - 2, seed=70, n=5, step=0.07, pan=0.3)
sfx.add(pan_st(page_rip(0.14, 71), -0.4), C["study_end"] + 0.04, db(G["page"]))   # 2023 STUDY (pause after "study,")
bed.add(pan_st(thud_low(72, 90.0), 0.3), C["fumbled"] + 0.05, db(G["fumble"] - 2))   # the little foot stumbles (low)
bed.add(pan_st(buzz_hi(0.5, 20.0, 73, lo=5600), 0.3), C["fumbled"] + 0.05, db(G["shimmer"] + 6))
sfx.add(pan_st(slide(700, 300, 0.32, vib=9.0), 0.2), C["it_end"] + 0.04, db(G["fumble"]))   # a wobbly fumble (pause after "it.")
bed.add(pan_st(top_swish(0.18, 74), 0), SHOT["button"] - 0.05, db(G["swish"] + 6))

# ================================================================= the button: not broken, a copycat
foot_swishes(SHOT["button"] + 0.25, DUR + 0.5, seed=80)
shimmer(SHOT["button"], DUR, seed=81)
sfx.add(pan_st(ding(91, 0.14, 82), -0.2), C["broken_end"] + 0.03, db(G["tick"]))  # NOT BROKEN, tick (pause after "broken.")
bed.add(pan_st(glint(6800, 0.1, 83), 0.1), C["cat"] + 0.02, db(G["ears"]))        # the cat ears pop on (top, on the word)
bed.add(pan_st(glint(7400, 0.08, 84), 0.1), C["cat"] + 0.1, db(G["ears"] - 2))
sfx.add(pan_st(meow(0.4, 640.0, 900.0, 540.0, 85), 0.1), C["meow"], db(G["meow"]))   # meow (after "copycat.")

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.5, C["flip0"] - 0.02, BPM, ["F", "Bb"], gain=-12, seed=10, kick_on=False, snaps=True)   # after "Circle" (soft: "and" is quiet)
groove(mus, C["your3"], C["share"] - 0.05, BPM, ["Dm", "Bb"], gain=-10, seed=20, kick_on=False, snaps=True)
drone(mus, C["share"], C["boss_end"] + 0.02, [38, 45, 50, 57], cutoff=520, gain=-17)                 # a curious held chord
groove(mus, C["the_left"] + 0.1, C["brain_end"], BPM, ["Dm", "C"], gain=-9, seed=21, kick_on=False, snaps=True)
groove(mus, C["wants"] + 0.1, C["way_end"], BPM, ["C", "F", "C", "G"], gain=-8, seed=30, snaps=True)   # the boss at work
drone(mus, C["drags"], C["along_end"], [33, 40, 45], cutoff=260, gain=-19)                  # the drag: a low held note only
groove(mus, C["try"], C["left2"], BPM, ["F", "Bb", "C"], gain=-8, seed=40, snaps=True)                 # the proof (out under "hand.")
groove(mus, C["easier"] + 0.1, C["easier_end"], BPM, ["F"], gain=-9, seed=41, kick_on=False, snaps=True)
mus.add(pad([mtof(m) for m in (53, 57, 60, 65)], C["right3_end"] - C["right3"] + 0.2, att=0.05, cutoff=1500, seed=42), C["right3"], db(-14))
# the dream: a soft pad and a music box
mus.add(pad([mtof(m) for m in (50, 57, 62)], C["it_end"] - C["weirder_end"], att=0.6, cutoff=600, seed=50), C["weirder_end"], db(-22))
sparkle(C["study_end"] + 0.02, bed, G["glint"] - 4, seed=57, n=4, step=0.06, pan=0.3, f0=6000)   # the dream twinkles, in the pause after "study," (on the word, whisper heard "steady")
groove(mus, C["foots"], C["copycat"] - 0.05, BPM, ["F", "Bb"], gain=-9, seed=10, kick_on=False, snaps=True)   # the hook's groove again
groove(mus, C["meow"] + 0.45, DUR, BPM, ["F", "Bb"], gain=-9, seed=10, kick_on=False, snaps=True)            # ...into the loop
silence(mus, [(C["flip0"] - 0.02, C["yep_end"] + 0.1),          # the flip, the scratch, "Yep,"
              (C["hijacked"] - 0.05, C["your3"]),              # HIJACKED... wah
              (C["boss_end"] + 0.02, C["the_left"] + 0.1),     # ONE BOSS: ding
              (C["way_end"], C["drags_end"]),                  # SAME WAY: ding; "so the six" (soft words); the belt squeals
              (C["along_end"], C["try"]),                      # YOINK
              (C["left2"], C["easier"] + 0.1),                 # "hand." is soft; STILL CLOCKWISE: tick
              (C["easier_end"], C["right3"]),                  # TWO BOSSES: ding dong
              (C["fumbled"] - 0.05, C["foots"]),               # the fumble
              (C["copycat"] - 0.05, C["meow"] + 0.45)])         # copycat... meow

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
