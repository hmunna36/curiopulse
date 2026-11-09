"""The EIFFEL TOWER Gets Taller in Summer 🗼 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The score is an original musette waltz (3/4, a synthesized accordion: three detuned reeds with a tremolo, a pizzicato
bass, oom-pah-pah chords); it drops out for every punchline and speeds up for the time-lapse.
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
WD = {w["word"].lower().strip(".,?!"): w for w in TL["words"]}

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(whoosh=-22, sizzle=-29, creak=-17, ding=-19, meow=-16, purr=-24, tick=-29, pluck=-24, tink=-18, riser=-25,
         clunk=-15, notif=-19, slide=-26, boing=-20, cricket=-26, glint=-28, flare=-21, bird=-30, wind=-26)


def low_whoosh(dur, seed, cut=340):
    """a move of the camera, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def top_only(x, f=5200.0):
    """keep what is above f: a sound that can sit under a word"""
    return filt(x, "highpass", f)


def sizzle(dur, seed=0):
    """hot iron frying in the sun: crackle above 5 kHz with a soft hiss"""
    n = int(dur * SR)
    y = L.crackle(n, 40.0, seed, 5200, 10000) + 0.22 * filt(white(n, seed + 1), "highpass", 6000)
    return fade(y, 0.05, 0.08)


def metal_creak(dur, seed, low=True):
    """the tower's iron groaning as it stretches: a slow stick-slip creak; low=True keeps it under ~320 Hz (under a word)"""
    y = creak(dur, seed, f0=42, f1=95, res=(260, 520, 1100))
    return filt(y, "lowpass", 320) if low else y


def accordion(freq, dur, seed=0, cutoff=2600.0):
    """one accordion note: three detuned reeds (musette) with a 6 Hz tremolo"""
    n = int(dur * SR)
    y = note(freq, dur, 0.02, max(0.2, dur * 1.4), cutoff, voices=3, seed=seed)
    trem = 1.0 + 0.22 * np.sin(2 * np.pi * 6.1 * np.arange(n) / SR)
    return fade(y[:n] * trem[: len(y[:n])], 0.004, 0.04)


# the waltz: one chord per bar of three beats; the melody is chord tones, a pattern per bar (semitones over the root)
MEL = [[(0, 7, 1.0), (1, 4, 0.5), (1.5, 5, 0.5), (2, 7, 1.0)],
       [(0, 9, 1.5), (1.5, 7, 0.5), (2, 4, 1.0)],
       [(0, 12, 1.0), (1, 11, 0.5), (1.5, 9, 0.5), (2, 7, 1.0)],
       [(0, 4, 2.0), (2, 2, 1.0)]]


def musette(t0, t1, bpm, chords, gain=0.0, seed=0, melody=True, mel_oct=12):
    beat = 60.0 / bpm
    bars = int(np.ceil((t1 - t0) / (3 * beat)))
    for bar in range(bars):
        b0 = t0 + bar * 3 * beat
        if b0 >= t1:
            break
        name = chords[bar % len(chords)]
        minor = name.endswith("m")
        r = ROOTS[name.rstrip("m")]
        third = 3 if minor else 4
        # oom: the bass on 1 (root, then the fifth every other bar)
        mus.add(pizz(mtof(r - 12 + (7 if bar % 2 else 0)), 0.5, seed + bar) * 1.3, b0, db(-13 + gain))
        # pah-pah: the chord on 2 and 3, short
        for bt in (1, 2):
            tb = b0 + bt * beat
            if tb >= t1:
                break
            ch = sum(accordion(mtof(m), beat * 0.55, seed + 10 * bar + bt, 1800) for m in (r + 12, r + 12 + third, r + 19))
            mus.add(pan_st(ch, -0.25), tb, db(-24 + gain))
        if melody:
            for (bo, semi, dl) in MEL[bar % len(MEL)]:
                tm = b0 + bo * beat
                if tm >= t1:
                    break
                s2 = semi - 1 if (minor and semi in (4, 9, 11)) else semi
                mus.add(pan_st(accordion(mtof(r + mel_oct + s2), dl * beat * 0.95, seed + 100 * bar + int(bo * 10)), 0.2), tm, db(-18 + gain))


# ================================================================= ambience: the city in summer (terrace, cafe); wind on the tower
ground_on = gate(N, [(0, SHOT["pieces"]), (SHOT["lean"], SHOT["away"]), (SHOT["button"], DUR)], smooth=0.05)
city = filt(brown(N, 1), "lowpass", 260) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.11 * tt))
amb.x += pan_st(city, -0.1) * 0.5 * ground_on
amb.x += pan_st(filt(pink(N, 2), "highpass", 6200) * 0.05, 0.2) * ground_on                     # far traffic hiss, leaves
high_on = gate(N, [(SHOT["pieces"], SHOT["lean"]), (SHOT["away"], SHOT["button"])], smooth=0.05)
wind = filt(pink(N, 3), "lowpass", 300) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.17 * tt + 0.5))
amb.x += pan_st(wind, 0.3) * 0.7 * high_on
amb.x += pan_st(filt(white(N, 4), "highpass", 6800) * 0.07 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.31 * tt)), -0.3) * high_on
# a few birds in the pauses of the terrace and the cafe (sparrows; top of the band)
for t_b, sd in ((0.02, 1), (4.3, 3), (25.4, 4)):
    if t_b < DUR - 0.2:
        sfx.add(pan_st(tweet(sd, 3600.0 + 200 * sd), -0.5 + 0.3 * sd), t_b, db(G["bird"]))

# ================================================================= the hook: the phone comes up; the cut to the tower
sfx.add(pan_st(low_whoosh(0.3, 10), 0.3), 0.0, db(G["whoosh"]))
for i in range(3):
    bed.add(pan_st(glint(6200 + 500 * i, 0.07, 11 + i), 0.35), 0.05 + 0.06 * i, db(G["glint"]))   # the screen catches the sun
sfx.add(pan_st(low_whoosh(0.26, 12), -0.2), SHOT["grow"] - 0.14, db(G["whoosh"]))

# ================================================================= grow: the tip rises the phone's length; the Sun flares
bed.add(pan_st(ratchet(c["much_end"] - c["that"], 14.0, 34.0, 20, edges=True, f=6200.0), 0.2), c["that"], db(G["tick"]))   # a tape paying out (top)
sfx.add(pan_st(metal_creak(c["much_end"] - c["that"] + 0.1, 21), 0.0), c["that"] - 0.05, db(G["creak"] - 2))               # the iron groans (low)
sfx.add(pan_st(filt(L.whoosh(0.5, 120, 520, 22, 0.7), "lowpass", 300), -0.4), c["summer"] - 0.05, db(G["flare"]))           # the Sun flares (low)
bed.add(pan_st(sizzle(c["hot"] - c["summer"] + 0.2, 23), -0.3), c["summer"], db(G["sizzle"]))                                 # heat (top)
sfx.add(pan_st(ding(88, 0.13, 24, 1.3), 0.0), c["summer_end"] + 0.03, db(G["ding"]))                                          # the UP TO tag (in the pause)

# ================================================================= answer: hot iron stretches (the tower groans and yawns)
sfx.add(pan_st(low_whoosh(0.3, 30), 0.4), SHOT["answer"] - 0.12, db(G["whoosh"]))
bed.add(pan_st(sizzle(c["stretches"] - c["hot"] + 0.3, 31), 0.2), c["hot"], db(G["sizzle"] + 2))
sfx.add(pan_st(metal_creak(c["stretches_end"] - c["stretches"] + 0.05, 32), 0.0), c["stretches"], db(G["creak"]))           # under the word (low)
sfx.add(pan_st(metal_creak(0.24, 33, low=False), 0.0), c["stretches_end"] + 0.02, db(G["creak"] - 3))                       # eeerk (in the pause)

# ================================================================= cat: like a cat in a sunbeam (purr under, meow in the gap)
sfx.add(pan_st(low_whoosh(0.22, 40), -0.3), SHOT["cat"] - 0.1, db(G["whoosh"] + 2))
body, rattle = purr_parts(SHOT["pieces"] - c["cat"], 41, rate=24.0)
bed.add(pan_st(body, 0.3), c["cat"], db(G["purr"]))
_pm = pause_mask(TL["words"], N)
_r = np.zeros(N)
_i0 = int(c["cat"] * SR)
_r[_i0:_i0 + len(rattle)] = rattle[: max(0, N - _i0)]
sfx.x += pan_st(_r * _pm, 0.3) * db(G["purr"] + 3)
sfx.add(pan_st(meow(0.42, 560.0, 760.0, 470.0, 42), 0.3), c["sunbeam_end"] + 0.06, db(G["meow"]))                            # mrrrow (in the gap)
sfx.add(pan_st(metal_creak(0.6, 43), -0.2), c["sunbeam"] - 0.2, db(G["creak"] - 4))                                            # the tower stretches too (low)

# ================================================================= pieces: 18,000 pieces, each a hair longer
sfx.add(pan_st(low_whoosh(0.3, 50), -0.4), SHOT["pieces"] - 0.12, db(G["whoosh"]))
bed.add(pan_st(ratchet(c["pieces"] + 0.2 - c["eighteen"], 30.0, 70.0, 51, edges=True, f=6000.0), 0.0), c["eighteen"], db(G["tick"]))   # the counter (top)
for i in range(6):
    bed.add(pan_st(glint(5600 + 400 * i, 0.06, 52 + i), -0.5 + 0.2 * i), c["eighteen"] + 0.06 * i, db(G["glint"]))              # the pieces light up
bed.add(pan_st(sizzle(c["one1"] + 0.6 - c["iron"], 53), 0.3), c["iron"], db(G["sizzle"] + 2))
sfx.add(pan_st(metal_creak(0.22, 54, low=False), -0.2), c["pieces_end"] + 0.06, db(G["creak"] - 3))                          # the bar slides (in the pause)
bed.add(pan_st(top_only(pizz(mtof(96), 0.12, 55), 5000.0), 0.3), c["hair"] - 0.28, db(G["pluck"]))                          # plink: the hair (top)
sfx.add(pan_st(glass_tink(56, 3100.0, 0.14), 0.0), c["longer_end"] + 0.04, db(G["tink"]))                                     # + ONE HAIR (in the pause)

# ================================================================= stack: the slivers rise and pile up; one PHONE (clunk)
sfx.add(pan_st(low_whoosh(0.26, 60), 0.0), SHOT["stack"] - 0.1, db(G["whoosh"] + 2))
sfx.add(pan_st(filt(riser(c["phone2"] - c["stack"], 61, 90, 300), "lowpass", 320), 0.0), c["stack"], db(G["riser"]))
for i in range(14):
    bed.add(pan_st(glint(5400 + 260 * (i % 6), 0.05, 62 + i), -0.3 + 0.05 * i), c["stack"] + 0.1 + i * (c["phone2"] - c["stack"] - 0.2) / 14, db(G["glint"]))
sfx.add(pan_st(filt(kick(1.0), "lowpass", 230), 0.0), c["phone2"] + 0.05, db(G["clunk"]))                                    # clunk (low, on the word)
for i, m in enumerate((88, 93)):
    sfx.add(pan_st(marimba(mtof(m), 0.18, 70 + i), 0.2), c["phone2_end"] + 0.05 + 0.11 * i, db(G["notif"]))                 # ding-ding: +15 cm (pause)

# ================================================================= lean: the sunny side stretches more
sfx.add(pan_st(low_whoosh(0.3, 80), 0.4), SHOT["lean"] - 0.12, db(G["whoosh"]))
sfx.add(pan_st(filt(L.whoosh(0.6, 110, 480, 81, 0.7), "lowpass", 300), 0.3), c["sunny"] - 0.05, db(G["flare"]))
bed.add(pan_st(sizzle(c["more_end"] - c["side"], 82), 0.5), c["side"], db(G["sizzle"] + 2))
sfx.add(pan_st(metal_creak(c["more_end"] - c["stretches2"], 83), 0.3), c["stretches2"], db(G["creak"] - 2))

# ================================================================= away: the time-lapse; the top leans away; he slides
sfx.add(pan_st(low_whoosh(0.3, 90), -0.2), SHOT["away"] - 0.12, db(G["whoosh"]))
clock_ticks(SHOT["away"] + 0.05, c["sun_end"], bed, db(G["tick"] + 2))
sfx.add(pan_st(metal_creak(c["away_end"] - c["leans"] + 0.2, 91), -0.3), c["leans"] - 0.05, db(G["creak"] - 1))
sfx.add(pan_st(slide_whistle(0.5, 1500, 520), 0.0), c["sun_end"] + 0.04, db(G["slide"]))                                       # wheee (in the gap)
sfx.add(pan_st(boing(0.22, 140.0, 92), 0.0), c["sun_end"] + 0.5, db(G["boing"]))

# ================================================================= button: honestly? (a cricket) same. -> the phone up (the loop)
sfx.add(pan_st(low_whoosh(0.26, 100), 0.3), SHOT["button"] - 0.1, db(G["whoosh"]))
bed.add(pan_st(sizzle(c["same"] - c["honestly"], 101), -0.2), c["honestly"], db(G["sizzle"]))                                  # a sizzle: the sunburn (top)
sfx.add(pan_st(cricket(102, 2, 4700), -0.4), c["honestly_end"] + 0.06, db(G["cricket"]))                                       # the deadpan beat
sfx.add(pan_st(low_whoosh(0.3, 103), 0.3), c["shade"] - 0.05, db(G["whoosh"]))                                                 # the phone comes up
for i in range(2):
    bed.add(pan_st(glint(6400 + 500 * i, 0.07, 104 + i), 0.35), c["shade"] + 0.3 + 0.06 * i, db(G["glint"]))

# ================================================================= score: the musette waltz (drops out for every punchline)
musette(0.15, SHOT["cat"] + 0.02, 150, ["C", "G", "C", "F"], gain=-1, seed=10)
musette(SHOT["pieces"] + 0.1, c["hair"] - 0.25, 150, ["Am", "E", "Am", "E"], gain=-3, seed=20)
musette(c["stack"] + 0.15, c["phone2"] - 0.05, 170, ["F", "C", "G", "C"], gain=-2, seed=30)
musette(c["sunny"] + 0.02, SHOT["away"] + 0.02, 150, ["C", "F", "G", "C"], gain=-2, seed=40)
musette(SHOT["away"] + 0.02, c["sun_end"] + 0.02, 200, ["C", "G", "C", "G"], gain=-2, seed=50)
musette(c["shade"], DUR, 150, ["C", "G", "C", "F"], gain=-1, seed=10)
silence(mus, [(c["cat"] - 0.25, SHOT["pieces"] + 0.1),         # "like a cat in a sunbeam": the purr and the meow alone
              (c["hair"] - 0.25, c["stack"] + 0.15),           # the hair, + ONE HAIR
              (c["phone2"] - 0.05, c["sunny"] + 0.02),         # PHONE, clunk, ding-ding, "And on"
              (c["sun_end"] + 0.02, c["shade"]),               # the slide, "Honestly? ... Same."
              (DUR - 0.12, DUR)])                              # into the loop

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -15, "sfx": -12.0}, duck={"music": 0.74})
