"""Why Do Some People Have NO Wrist Tendon? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The living room at night (a soft room tone, the TV's hiss), the cord that POPS up out of his wrist (a soft cork pop with a
glint on top), the glass shimmer, a computer that asks and a cursor that clicks LATER, a crumpled file for the seventh, a
jungle by moonlight (crickets, a creaking branch, a little ooh-ooh), two grip meters that ding the same note, a latex glove
that snaps, a noodle that comes out BOING, a ball park (the crowd, a whoosh, the THWACK at the lens), a sad slide, a bonk,
a wink. What sits on a word is kept under 250 Hz or above 5.2 kHz; what carries a joke gets a pause to itself.
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
c = C
PAUSE = pause_mask(WORDS, N)                       # 1 where nobody is speaking, 0 under words


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def cord_pop(t, gain, seed=0, pan=0.25):
    """the cord standing up out of the wrist: a soft round pop, a glint above it"""
    cp = cork_pop(seed, 760.0)
    sfx.add(pan_st(fade(cp, 0.001, 0.03), pan), t, db(gain))
    bed.add(pan_st(glint(6400, 0.08, seed + 3), pan), t + 0.02, db(gain - 6))
    low_thud(t, gain - 2, 170.0, 0.12, 0.04)


def ui_click(t, gain, seed=0, pan=0.0):
    """a mouse click: two tiny hard ticks"""
    for i, dt in enumerate((0.0, 0.035)):
        m = int(0.012 * SR)
        sfx.add(pan_st(filt(white(m, 70 + seed + i), "bandpass", [2500, 7000]) * expdecay(m, 0.002), pan), t + dt, db(gain - 3 * i))


def rubber_stretch(t0, t1, gain, seed=0):
    """a rubber noodle stretching: a low creak that climbs (under 250 Hz, so it can sit under words)"""
    y = creak(t1 - t0, seed, 60, 130)
    bed.add(pan_st(fade(filt(y, "lowpass", 240), 0.04, 0.05), 0.2), t0, db(gain))


def latex_snap(t, gain, seed=0):
    """a latex glove snapping on its cuff: a dry slap with a short rubbery tail"""
    y = slap_hit(seed)
    sfx.add(pan_st(fade(y, 0.001, 0.03), 0.4), t, db(gain))


def crowd(n, seed=0):
    """a ball park crowd far off: murmur under 420 Hz, a hiss of chatter on top"""
    body = filt(pink(n, seed), "bandpass", [90, 420]) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.21 * np.arange(n) / SR))
    top = filt(pink(n, seed + 1), "highpass", 5200) * 0.25
    return norm(body + top)


# ================================================================= ambience
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
tvhiss = norm(filt(white(N, 2), "highpass", 6000)) * 0.18
living = [(0.0, SHOT["seven"]), (SHOT["onearm"], SHOT["jungle"]), (SHOT["grip"], SHOT["pitch"]), (SHOT["button"], DUR)]
amb.x += pan_st(room + tvhiss, 0) * 0.24 * gate(N, living)
night = norm(filt(pink(N, 5), "lowpass", 300)) * 0.5
amb.x += pan_st(night, 0) * 0.3 * gate(N, [(SHOT["jungle"], SHOT["grip"])])
crickets(SHOT["jungle"] + 0.1, SHOT["grip"] - 0.05, bed, -26, 7, 5200)
park = crowd(N, 9)
amb.x += pan_st(park, 0) * 0.32 * gate(N, [(SHOT["pitch"], SHOT["button"])])

# ================================================================= 1. the hook: the cord pops, the ring, the test again
bed.add(pan_st(glint(6400, 0.09, 1), 0.25), c["pop0"], db(-16))                    # frame 1: the cord pops up (it sits on "tendon": only a glint above
low_thud(c["pop0"], -13, 170.0, 0.12, 0.04)                                           # 5 kHz and a knock under 200 Hz)
for i, m in enumerate((79, 84)):                                                      # a curious little pluck (after "tendon?")
    sfx.add(pan_st(fade(pizz(L.mtof(m), 0.16, 10 + i), 0.002, 0.04), 0.1), c["tendon_end"] + 0.06 + 0.1 * i, db(-19))
hi_tick(c["touch"] + 0.15, -18, 11, 0.3)                                              # the thumb lets go (above the words)
hi_tick(c["pinky_end"] - 0.05, -16, 12, 0.3)                                          # ... and meets the pinky again
cord_pop(c["pop2"], -11, 13)                                                          # it pops again (after "wrist.")

# ================================================================= 2. glass; the computer asks; LATER
for i in range(8):                                                                    # the forearm turns to glass: a shimmer above the words
    bed.add(pan_st(glint(5600 + 380 * i, 0.08, 20 + i), -0.2 + 0.1 * i), c["cord"] + 0.05 * i, db(-24))
low_thud(c["muscle"] + 0.05, -17, 120.0, 0.2, 0.07)                                  # the label lands (low, under the word)
for i, f in enumerate((1568.0, 2093.0)):                                              # the computer's chime: quiet and high, on "forgot"
    bed.add(pan_st(fade(tone(f, 0.12), 0.003, 0.06) * 0.4, 0.2), c["forgot"] - 0.1 + 0.07 * i, db(-26))
ui_click(c["click_later"], -12, 21, 0.1)                                              # click: LATER (after "delete.")
sfx.add(pan_st(fade(bloop(420, 260, 0.14), 0.002, 0.03), 0.1), c["click_later"] + 0.06, db(-18))

# ================================================================= 3. one in seven: deleted
for i in range(7):                                                                    # seven wrists pop in (above the words)
    hi_tick(c["one1"] - 0.05 + 0.06 * i, -19, 30 + i, -0.6 + 0.2 * i)
low_thud(c["seven"] + 0.02, -15, 110.0, 0.24, 0.08)                                  # 1 IN 7 lands (low)
ui_click(c["deleted"] + 0.12, -17, 37, 0.3)                                          # click: YES (high and quick, on the word)
cr = crumple(0.22, 38)
bed.add(pan_st(fade(filt(cr, "highpass", 5200), 0.004, 0.04), 0.4), c["x_seven"], db(-17))   # into the bin (above 5.2 kHz: it sits on "deleted")
low_thud(c["x_seven"] + 0.04, -14, 160.0, 0.14, 0.05)                                 # the DELETED stamp

# ================================================================= 4. just one arm
sfx.add(pan_st(whoosh(0.28, 300, 2400, 39), -0.4), SHOT["onearm"] - 0.12, db(-20))    # the other arm comes up
sfx.add(pan_st(fade(bonk(), 0.001, 0.04), -0.3), c["huh"], db(-15))                   # nothing on it: bonk (after "arm.")

# ================================================================= 5. the ancestors
sfx.add(pan_st(whoosh(0.26, 200, 1800, 40), 0.0), SHOT["jungle"] - 0.34, db(-18))     # into the jungle (it ends before "It")
bed.add(pan_st(fade(filt(creak(0.7, 41, 50, 110), "lowpass", 220), 0.05, 0.1), -0.2), SHOT["jungle"] + 0.3, db(-14))   # the branch creaks
low_thud(c["helped"] + 0.05, -19, 90.0, 0.4, 0.15)                                    # the little muscle lights up: a low hum
ooh = gibber(0.42, 42, 520.0, False, 0.0, 9.0)
sfx.add(pan_st(fade(ooh, 0.02, 0.08), 0.3), c["ancestors_end"] + 0.06, db(-21))       # ooh-ooh (after "ancestors.")

# ================================================================= 6. the grip: the same number
bed.add(pan_st(fade(filt(creak(c["hard"] + 0.2 - c["grip"], 43, 40, 90), "lowpass", 200), 0.05, 0.08), 0.0), c["grip"], db(-15))   # the squeeze
bed.add(pan_st(ratchet(c["hard"] - c["grip"], 18.0, 40.0, 44, True), -0.3), c["grip"], db(-22))   # the needles climb (above 5.2 kHz)
bed.add(pan_st(ratchet(c["hard"] - c["grip"], 19.0, 41.0, 45, True), 0.3), c["grip"] + 0.02, db(-22))
for i, pn in enumerate((-0.4, 0.4)):                                                  # ding, ding: the same note (after "it.")
    sfx.add(pan_st(fade(ding(88, 0.14, 46 + i, 1.2), 0.001, 0.05), pn), c["it2_end"] + 0.04 + 0.12 * i, db(-18))

# ================================================================= 7. the surgeon takes it
latex_snap(c["surgeons"] - 0.1, -17, 50)                                              # the glove comes in (snap of the cuff)
rubber_stretch(c["take"] + 0.05, c["snap"], -13, 51)                                  # the noodle stretches (low)
bg = boing(0.26, 180.0, 52)
sfx.add(pan_st(fade(bg, 0.002, 0.05), 0.4), c["snap"], db(-15))                       # BOING (after "take it...")

# ================================================================= 8. the pitch
for i in range(6):                                                                    # the window opens on his elbow: a shimmer above the word
    bed.add(pan_st(glint(5800 + 400 * i, 0.07, 61 + i), 0.3), c["rebuild"] + 0.04 * i, db(-24))
low_thud(c["baseball"] + 0.1, -17, 130.0, 0.2, 0.06)                                  # the ligament is stitched in
sfx.add(pan_st(whoosh(0.3, 500, 5200, 62), 0.0), c["throw"] + 0.02, db(-18))          # the throw (the whoosh is mostly above the voice)
thw = thump(0.42, 110, 40, 0.12)
sfx.add(pan_st(fade(thw, 0.001, 0.06), 0.0), c["thwack"], db(-13))                    # THWACK at the lens (after "elbows.")
sfx.add(pan_st(fade(crack(0.08, 63), 0.001, 0.02), 0.0), c["thwack"], db(-17))
cheer = norm(filt(pink(int(0.6 * SR), 64), "bandpass", [400, 3200]) * np.minimum(1, np.linspace(0, 6, int(0.6 * SR))) * np.linspace(1, 0, int(0.6 * SR)) ** 1.5)
sfx.add(pan_st(cheer, 0.0), c["thwack"] + 0.08, db(-24))                              # the crowd: ooh

# ================================================================= 9. the button
sl = slide(392.0, 262.0, 0.3, 0.0, None, 6)
sfx.add(pan_st(fade(sl, 0.01, 0.05), 0.2), c["nocord_end"] + 0.03, db(-19))           # a sad slide (after "cord?")
sfx.add(pan_st(whoosh(0.26, 300, 2400, 70), -0.4), c["check"] - 0.05, db(-21))        # the other arm comes up
sfx.add(pan_st(fade(bonk(), 0.001, 0.04), -0.3), c["arm2_end"] + 0.04, db(-15))       # nothing there either: bonk (after "arm.")
pp = cork_pop(71, 900.0)
bed.add(pan_st(fade(filt(pp, "highpass", 3000), 0.001, 0.03), 0.4), c["ask"] - 0.03, db(-18))   # the window pops (high, on the word)
sfx.add(pan_st(fade(ding(91, 0.12, 72, 1.4), 0.001, 0.05), 0.4), c["pitcher2_end"] + 0.08, db(-17))   # the wink (after "pitcher.")

# ================================================================= score (drops out for every punchline)
BPM = 108
groove(mus, 0.36, c["wrist_end"] - 0.06, BPM, ["C", "F"], gain=-11.5, seed=10, kick_on=False)
groove(mus, c["cord"] + 0.15, c["delete_end"] - 0.04, 100, ["Am", "F"], gain=-13, seed=11, kick_on=False, arp=False)
groove(mus, c["one1"] + 0.2, c["deleted_end"] - 0.04, 112, ["C", "G"], gain=-12, seed=12, kick_on=False)
drone(mus, c["sometimes"] + 0.1, c["arm1_end"] - 0.03, [45, 52, 57], cutoff=500, gain=-27, seed=13, swell=0.4)
groove(mus, c["probably"] + 0.15, c["ancestors_end"] - 0.04, 96, ["Dm", "Am"], gain=-12, seed=14, kick_on=False, padv=False)
drone(mus, c["grip"] + 0.05, c["without"] - 0.03, [40, 47, 52], cutoff=600, gain=-24, seed=15, swell=0.8)
groove(mus, c["surgeons"] + 0.12, c["take_end"] - 0.05, 104, ["Em", "B"], gain=-13, seed=16, kick_on=False, arp=False, snaps=False)
groove(mus, c["rebuild"] + 0.1, c["elbows_end"] - 0.06, 120, ["G", "C", "D", "G"], gain=-11, seed=17, kick_on=True)
groove(mus, c["pitcher2_end"] + 0.16, c["loop_in"] - 0.02, BPM, ["C", "F"], gain=-12, seed=18, kick_on=False)   # after the punchline
silence(mus, [(c["wrist_end"] - 0.05, c["cord"] + 0.1), (c["delete_end"] - 0.03, c["one1"] + 0.15), (c["deleted_end"] - 0.03, c["sometimes"] + 0.05),
              (c["arm1_end"] - 0.02, c["probably"] + 0.1), (c["ancestors_end"] - 0.03, c["grip"]), (c["it2_end"] - 0.02, c["surgeons"] + 0.1),
              (c["take_end"] - 0.04, c["rebuild"] + 0.08), (c["elbows_end"] - 0.05, c["pitcher2_end"] + 0.14)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -7.0}, duck={"music": 0.72})
