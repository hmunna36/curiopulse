"""There's a GALAXY in Your Sky Wider Than the Moon 🌌 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The places: a hilltop camp at night (crickets, a breeze, the lantern), the sky (a shimmer), space (a deep hum), the time
ribbon. His motif: a music-box twinkle (wonder: the galaxy); the Moon's: a low brassy "bwomp" (its side-eye, its jaw,
its squish, its sulk). Dead stops: the flip ("Never seen it?"), "dim", the full silence through "three... SIX", the
landing in his goggles, and the button.
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(whoosh=-21, ratchet=-29, glint=-26, flutter=-30, ff=-22, ffpop=-24, thud=-16, clack=-22, shrink=-19, snicker=-18,
         ring=-26, creak=-30, wah=-20, sparkle=-29, tick=-31, snap=-21, clunk=-17, beep=-25, race=-33, ding=-20,
         swell=-24, zip=-29, slidew=-24, gulp=-22, pop=-19, hit=-17, pew=-22, streak=-27, cricket=-30, flag=-24,
         land=-27, fwump=-19, pick=-24, moon=-15)


def low_whoosh(dur, seed, cut=340):
    """a move of the camera, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def top_only(x, f=5200.0):
    """keep what is above f: a sound that can sit under a word"""
    return filt(x, "highpass", f)


def sprinkle(t0, t1, bus, gain_db, seed=0, rate=9.0, lo=5600.0, hi=8200.0):
    """a twinkle: tiny glass notes above 5 kHz (it can sit under the words)"""
    r = np.random.default_rng(seed)
    tk = t0
    while tk < t1:
        bus.add(pan_st(glint(float(r.uniform(lo, hi)), 0.07, int(r.integers(10000))), float(r.uniform(-0.6, 0.6))), tk, db(gain_db + r.uniform(-4, 0)))
        tk += r.uniform(0.5, 1.4) / rate


def soft_clip(x, k=3.0):
    return np.tanh(k * x / (np.abs(x).max() + 1e-9)) / np.tanh(k)


# ================================================================= ambience: the camp at night, the sky, space
camp = [(0, SHOT["blink"]), (SHOT["rec"], SHOT["line"]), (SHOT["button"], DUR)]
camp_on = gate(N, camp, smooth=0.05)
amb.x += pan_st(filt(brown(N, 1), "lowpass", 200), -0.2) * 0.45 * camp_on                       # a breeze, low
amb.x += pan_st(filt(white(N, 2), "highpass", 6800) * 0.012 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * tt)), 0.3) * camp_on
sky_on = gate(N, [(SHOT["line"], SHOT["trip"])], smooth=0.05)
amb.x += pan_st(filt(white(N, 3), "highpass", 7000) * 0.016 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * tt)), -0.3) * sky_on
amb.x += pan_st(filt(brown(N, 4), "lowpass", 140), 0.0) * 0.3 * sky_on
space_on = gate(N, [(SHOT["trip"], SHOT["button"])], smooth=0.05)
amb.x += pan_st(filt(brown(N, 5), "lowpass", 110), 0.0) * 0.75 * space_on                      # the hum of space
amb.x += pan_st(filt(white(N, 6), "highpass", 7400) * 0.018 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.19 * tt)), 0.3) * space_on
eye_on = gate(N, [(SHOT["blink"], SHOT["rec"])], smooth=0.04)
amb.x += pan_st(filt(brown(N, 7), "lowpass", 90), 0.0) * 0.5 * eye_on                          # inside the close-up: a low hush
# crickets at the camp (above the voice band), not in the close-up, the sky or space
for (a, b), sd in zip(camp, (11, 12, 13)):
    crickets(a + 0.2, b - 0.2, bed, db(G["cricket"]), seed=sd, f=4900, rate=1.3)

# ================================================================= hook: the focus ring turns; the galaxy glints in his lenses
bed.add(pan_st(ratchet(1.6, 12.0, 16.0, 20, edges=True, f=5800.0), -0.35), 0.0, db(G["ratchet"]))    # the focus ring (top)
bed.add(pan_st(top_only(glint(7200, 0.12, 21), 5600.0), 0.2), c["glint"], db(G["glint"]))           # the lens flare (top)
sprinkle(0.0, SHOT["wide"], bed, G["sparkle"], seed=22, rate=4.0)
# wide: the camera drops low under the whole sky; bats flap past; the Moon's eyes slide to the giant
sfx.add(pan_st(low_whoosh(0.5, 23), 0.0), SHOT["wide"] - 0.18, db(G["whoosh"] + 2))
bed.add(pan_st(flutter(1.2, 24, edges=True), -0.4), SHOT["wide"] + 0.3, db(G["flutter"]))
bed.add(pan_st(flutter(1.0, 25, edges=True), 0.4), SHOT["wide"] + 1.3, db(G["flutter"] - 2))
bed.add(pan_st(top_only(squeak(0.12, 5600, 6400), 5200.0), -0.4), c["side"], db(G["glint"]))     # the side-eye (top)
# the flash-forward: a whoosh in, the Moons popping (a burst of the payoff), a soft thud out
sfx.add(pan_st(whoosh(0.22, 400, 3200, 26, 0.9), 0.0), c["ff"] - 0.06, db(G["ff"]))
pops([c["ff"] + 0.08, c["ff"] + 0.16, c["ff"] + 0.24], sfx, db(G["ffpop"]), seed=27)
sfx.add(pan_st(filt(kick(0.9), "lowpass", 240), 0.0), c["ff"] + 0.48, db(G["thud"] - 6))

# ================================================================= answer: the goggles flip UP; the galaxy shrinks to a smudge
bed.add(pan_st(top_only(key_click(30), 4800.0), 0.3), c["flip"], db(G["clack"]))                    # click (top, on "Never")
sfx.add(pan_st(filt(kick(0.8), "lowpass", 260), 0.3), c["flip"] + 0.02, db(G["thud"] - 4))           # clack (low)
sfx.add(pan_st(filt(whoosh(0.5, 300, 80, 31, 0.6), "lowpass", 280), -0.2), c["shrink"], db(G["shrink"]))   # the giant shrinks (low)
bed.add(pan_st(top_only(riser(0.45, 32, 3000, 900), 5200.0), -0.3), c["shrink"], db(G["shrink"] - 8))
sfx.add(pan_st(snicker(33, 330.0, 2), -0.5), c["it1_end"] + 0.03, db(G["snicker"]))                 # the Moon: heh-heh (the gap)

# ================================================================= squint: ALL YOU SEE; the squint tightens; "dim": the hitstop
sfx.add(pan_st(low_whoosh(0.4, 40), 0.0), SHOT["squint"] - 0.16, db(G["whoosh"]))
bed.add(pan_st(top_only(glint(6800, 0.1, 41), 5600.0), 0.3), c["ring"], db(G["ring"]))             # the ring draws (top)
for _k, _ts in enumerate(np.arange(c["squint"] + 0.04, c["cut_dim"] - 0.2, 0.17)):             # rub-rub: fists on his eyes (top)
    bed.add(pan_st(top_only(squeak(0.09, 5600 + 300 * (_k % 2), 6300), 5200.0), 0.25 * (-1) ** _k), float(_ts), db(G["creak"] + 2))
bed.add(pan_st(top_only(creak(0.5, 42, 900, 1400, (2400, 4000, 6200)), 5000.0), 0.1), c["cut_dim"], db(G["creak"]))   # the squint tightens (top)
sfx.add(pan_st(low_whoosh(0.3, 43, 300), 0.0), c["cut_dim"] - 0.12, db(G["whoosh"] + 1))          # the jump closer (low)
_th = c["dimhit"]                                                                                  # the hitstop after "dim"
sfx.add(pan_st(filt(snap(44), "highpass", 1800), 0.0), _th, db(-19))
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-16))
sfx.add(cymbal(45, 0.3), _th + 0.01, db(-32))
sfx.add(pan_st(fade(slide(mtof(60), mtof(53), 0.26, vib=5.0, top=2200), 0.004, 0.05), 0.0), _th + 0.08, db(G["wah"]))   # pfff (the gap)

# ================================================================= blink: the eye up close; specks of light fall in; SNAP shut
sfx.add(pan_st(whoosh(0.28, 300, 2600, 50, 0.9), 0.4), SHOT["blink"] - 0.32, db(G["whoosh"]))
sprinkle(c["specks"], c["shut"], bed, G["sparkle"] + 3, seed=51, rate=12.0, lo=6000.0, hi=8800.0)    # light falling in (top)
_k, _tk = 0, SHOT["blink"] + 0.2
while _tk < c["shut"] - 0.05:                                                                     # the stopwatch: tick-tick (top)
    bed.add(pan_st(top_only(key_click(52 + _k), 5200.0), -0.5), _tk, db(G["tick"]))
    _tk += 0.2
    _k += 1
bed.add(pan_st(top_only(shutter(), 4800.0), 0.0), c["shut"], db(G["snap"] - 4))                     # the lid (top, on "blink")
sfx.add(pan_st(filt(kick(0.7), "lowpass", 220), 0.0), c["shut"] + 0.01, db(G["snap"]))               # SNAP (low)

# ================================================================= rec: the goggles snap down; REC; the timer races to 10:00
sfx.add(pan_st(filt(filt(kick(0.9), "lowpass", 150), "lowpass", 150), -0.3), c["down"] - 0.04, db(G["clunk"] - 3))   # clunk (very low)
bed.add(pan_st(top_only(key_click(60), 4800.0), -0.3), c["down"] + 0.02, db(G["clack"]))
bed.add(pan_st(top_only(glint(6200, 0.08, 61), 5600.0), -0.4), c["rec"], db(G["beep"]))              # REC (top)
sfx.add(pan_st(beep(1900.0, 0.07), -0.4), c["for2"] - 0.3, db(G["beep"] - 2))                     # bip (the gap after "it")
bed.add(pan_st(ratchet(c["run1"] - c["run0"], 10.0, 46.0, 62, edges=True, f=6000.0), 0.4), c["run0"], db(G["race"]))
bed.add(pan_st(top_only(riser(c["run1"] - c["run0"], 63, 500, 3400), 5200.0), -0.2), c["run0"], db(G["race"]))
sprinkle(c["rec"], c["run1"], bed, G["sparkle"] + 2, seed=64, rate=10.0)
sfx.add(pan_st(low_whoosh(0.3, 65, 300), 0.0), c["cut_min"] - 0.1, db(G["whoosh"] + 1))
sfx.add(pan_st(ding(84, 0.12, 66), 0.3), c["minutes_end"] + 0.01, db(G["ding"]))                   # ding: ten minutes (the gap)

# ================================================================= bloom: the galaxy opens across the sky (the reveal)
sfx.add(pan_st(whoosh(0.32, 260, 2800, 70, 0.9), -0.4), SHOT["bloom"] - 0.22, db(G["whoosh"]))
sprinkle(c["exp0"], c["exp1"] + 0.4, bed, G["sparkle"] + 4, seed=71, rate=16.0, lo=5600.0, hi=9000.0)   # it fills with stars (top)
bed.add(pan_st(top_only(riser(c["exp1"] - c["exp0"], 72, 600, 3600), 5200.0), 0.2), c["exp0"], db(G["swell"]))
bwomp(sfx, c["up1_end"] + 0.04, m=31, gain=G["moon"] - 12)                                          # the Moon's jaw: bwomp (the gap)

# ================================================================= line / count / six: the ruler, the Moons, SIX
sfx.add(pan_st(low_whoosh(0.4, 80), 0.0), SHOT["line"] - 0.16, db(G["whoosh"]))
bed.add(pan_st(ratchet(0.7, 30.0, 40.0, 81, edges=True, f=6000.0), 0.2), c["ruler"], db(G["zip"]))    # the ruler (top)
bed.add(pan_st(ratchet(0.45, 20.0, 30.0, 82, edges=True, f=6000.0), -0.3), c["slide"], db(G["zip"]))  # the Moon slides (top)
sfx.add(pan_st(glug_low(83), -0.3), c["it2_end"] + 0.06, db(G["gulp"]))                            # gulp (low, the gap)
sfx.add(pan_st(low_whoosh(0.3, 84, 300), 0.0), SHOT["count"] - 0.12, db(G["whoosh"] + 1))
for k, key in enumerate(("one", "two")):                                                         # a pop after each count word
    pops([c[key] + (0.47 if key == "one" else 0.5)], sfx, db(G["pop"]), seed=85 + k)
bed.add(pan_st(top_only(glint(6400, 0.08, 87), 5600.0), 0.2), c["m3"], db(G["glint"] + 2))           # three (top: the word is long)
sfx.add(pan_st(filt(kick(0.6), "lowpass", 220), 0.2), c["m3"], db(G["thud"] - 6))
# SIX: heard in full silence, then the three Moons land: the biggest hit of the Short
pops([c["six_end"] + 0.02, c["six_end"] + 0.06, c["six_end"] + 0.1], sfx, db(G["pop"] + 1), seed=88)
_th = c["sixhit"]
sfx.add(pan_st(filt(snap(89), "highpass", 1800), 0.0), _th, db(-19))
sfx.add(pan_st(soft_clip(filt(filt(kick(1.0), "highpass", 260), "lowpass", 950)), 0.0), _th + 0.004, db(G["hit"]))
sfx.add(cymbal(90, 0.32), _th + 0.01, db(-27))
sfx.add(pan_st(fade(slide(mtof(41), mtof(34), 0.3, vib=3.0, top=280), 0.004, 0.04), -0.3), _th + 0.06, db(G["moon"]))   # the Moon, squished: bwomp (low)

# ================================================================= trip: space; the light sets off; years on the way
sfx.add(pan_st(whoosh(0.3, 240, 2800, 100, 0.9), 0.4), SHOT["trip"] - 0.33, db(G["whoosh"]))
bed.add(pan_st(top_only(pew(0.3, 101, 7800.0, 5600.0), 5200.0), 0.3), c["launch"], db(G["pew"] - 4))   # it sets off (top)
sfx.add(pan_st(pew(0.16, 102, 2600.0, 900.0), 0.3), c["left"] + 0.33, db(G["pew"]))                  # pew (the gap after "left")
sfx.add(pan_st(filt(whoosh(c["ago_end"] - c["cut_two"], 80, 320, 103, 0.6), "lowpass", 300), 0.0), c["cut_two"], db(G["streak"]))
bed.add(pan_st(top_only(riser(c["ago_end"] - c["cut_two"], 104, 800, 4000), 5400.0), -0.2), c["cut_two"], db(G["streak"]))
bed.add(pan_st(ratchet(c["ago_end"] - c["count0"], 14.0, 40.0, 105, edges=True, f=6200.0), 0.3), c["count0"], db(G["race"] - 1))

# ================================================================= timeline: the ribbon; nobody yet (one cricket); PEOPLE!; ding
sfx.add(pan_st(low_whoosh(0.4, 110), 0.0), SHOT["timeline"] - 0.16, db(G["whoosh"]))
bed.add(pan_st(ratchet(0.35, 34.0, 44.0, 111, edges=True, f=6000.0), 0.0), SHOT["timeline"], db(G["zip"]))
bed.add(pan_st(cricket(112, 3, 4800), -0.2), c["before"] + 0.05, db(G["cricket"] - 1))               # nobody yet: one cricket
bed.add(pan_st(cricket(113, 2, 4700), -0.25), c["before"] + 0.55, db(G["cricket"]))
bed.add(pan_st(top_only(party_horn(0.3, 114, 520.0), 4600.0), 0.3), c["peopleflag"], db(G["flag"]))  # PEOPLE! (top)
sfx.add(pan_st(filt(kick(0.6), "lowpass", 220), 0.3), c["peopleflag"] + 0.02, db(G["thud"] - 8))
sfx.add(pan_st(low_whoosh(0.3, 115, 300), 0.0), c["cut_you"] - 0.1, db(G["whoosh"] + 1))
sfx.add(pan_st(whoosh(0.3, 3000, 900, 116, 0.8), -0.5), c["land"] - 0.3, db(G["pew"] - 2))        # the light flies in
sfx.add(pan_st(ding(88, 0.3, 117, bright=1.4), 0.0), c["land"], db(G["land"]))                      # DING: in his lens (the gap)
sprinkle(c["land"], c["land"] + 0.5, bed, G["sparkle"] + 5, seed=118, rate=20.0)

# ================================================================= button: Sorry... Moon. (the cloud blanket, the Moon's sulk)
sfx.add(pan_st(low_whoosh(0.35, 120), 0.0), SHOT["button"] - 0.14, db(G["whoosh"]))
bed.add(pan_st(filt(whoosh(0.4, 120, 380, 121, 0.6), "lowpass", 300), -0.3), c["blanket"], db(G["fwump"]))   # the cloud pulled up (low)
sfx.add(pan_st(fade(slide(mtof(41), mtof(36), 0.28, vib=4.0, top=260), 0.004, 0.04), -0.3), c["blanket"] + 0.05, db(G["moon"] - 3))   # a sulky hmph (low)

# ================================================================= score: the loop grid, sections on bar lines
BPM, BEAT, BARS = fit_loop(DUR, lo=92, hi=118, want=100)
BAR = 4 * BEAT
print(f"loop score: {BARS} bars at {BPM:.1f} BPM (beat {BEAT:.3f} s): {BARS} x 4 x {BEAT:.4f} = {BARS * BAR:.3f} s against {DUR:.3f}")
b_ans = bar_at(SHOT["answer"], BEAT)
b_mech = bar_at(SHOT["blink"], BEAT)
b_bloom = bar_at(SHOT["bloom"], BEAT)
b_trip = bar_at(SHOT["trip"], BEAT)
WONDER = ["Dm", "Bb", "F", "C"]
DEFLATE = ["Dm", "Gm", "Dm", "A"]
TICK = ["Dm", "Bb", "Gm", "A"]
REVEAL = ["F", "C", "Dm", "Bb"]
groove(mus, 0.0, b_ans, BPM, WONDER, gain=-6, seed=10, kick_on=False, snaps=False, cutoff=1500)          # wonder: pad + arp
groove(mus, b_ans, b_mech, BPM, DEFLATE, gain=-8, seed=12, half=True, cutoff=900, arp=False)             # deflated
groove(mus, b_mech, b_bloom, BPM, TICK, gain=-7, seed=14, cutoff=1300, sixteen=True, padv=False)         # the mechanism: ticking
b_line = bar_at(SHOT["line"], BEAT)
groove(mus, b_bloom, b_line, BPM, REVEAL, gain=-4, seed=16, cutoff=1900)                                  # the reveal: warm, full
groove(mus, b_line, b_trip, BPM, REVEAL, gain=-8, seed=17, cutoff=1400, kick_on=False)                    # the Moons: lighter
groove(mus, b_trip, DUR - 1e-4, BPM, WONDER, gain=-7, seed=18, cutoff=1400, sixteen=True)                 # space: driving
drone(mus, c["exp0"], b_trip, [62, 65, 69, 74], cutoff=1600, gain=-27, seed=19, swell=0.6)               # the reveal swells
# his motif: a music-box twinkle (the galaxy), on the hook and on the bloom
TW = [(0, 81), (0.5, 86), (1, 89), (1.5, 88), (2, 86)]
for t0 in (0.0, b_bloom):
    for bt, m in TW:
        tp = t0 + bt * BEAT
        mus.add(pan_st(music_box(mtof(m), 1.0, int(tp * 70)), 0.3 * (-1) ** int(bt * 2)), tp, db(-24))
# the last beat leads back into bar 1: two music-box pickup notes
for i, m in enumerate((74, 77)):
    tp = DUR - BEAT + i * BEAT / 2
    sfx.add(pan_st(fade(music_box(mtof(m), 0.6, 400 + i)[: int((DUR - tp - 0.01) * SR)], 0.002, 0.03), 0.2), tp, db(G["pick"]))
silence(mus, [(0.0, c["galaxy"] - 0.02),                       # the first words clean; the score enters on "galaxy"
              (c["ff"] - 0.03, c["ff"] + 0.5),                 # the flash-forward
              (c["flip"] - 0.03, c["it1_end"] + 0.25),         # the flip: "Never seen it?" (the giant shrinks)
              (c["dim"] - 0.02, c["grab"] + 0.05),             # DIM (the answer's punchline); back after "They grab"
              (c["shut"] - 0.02, c["camera"] + 0.02),          # the eye SNAPS shut: everything stops (back on "camera")
              (c["for2"] - 0.03, c["rest"] + 0.05),            # "for MINUTES... and the rest": a hush, then the reveal swells
              (c["three"] - 0.05, c["sixhit"] + 0.02),         # full silence through "three... SIX", then the biggest hit
              (c["sixhit"] + 0.3, c["glow"] + 0.02),           # the hit rings alone; the space groove comes in on "glow"
              (c["existed_end"] + 0.02, c["land"] + 0.35),     # the light lands in his lens: ding alone
              (c["sorry"] - 0.06, DUR)])                       # the button: Sorry... Moon. (then the pickup notes)
# the full silence before SIX: the room tone and the beds go too
for bus in (amb, bed):
    silence(bus, [(c["three_end"] + 0.02, c["sixhit"] - 0.005)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14.5}, duck={"music": 0.74})
