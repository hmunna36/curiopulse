"""Can You Move Your Eyes SMOOTHLY? 👀 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Two motifs: a JUMP is a dry tick (a glass tick above 5 kHz over a soft low knock: it can sit on a word); a GLIDE is
a smooth slide-whistle "wheee" in the pauses and a smooth low hum under the words. The butterfly is a flutter and a
music-box twinkle. The score sits on a whole number of bars (the loop score), so bar 1 comes round on frame 1.
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
CAM = TL.get("camera", {})
FF = CAM.get("flash", [[None]])[0][0]
HITS = [h[0] for h in CAM.get("hit", [])]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()
c = C

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(hop=-24, hoplo=-27, click=-21, boing=-21, whoosh=-22, wing=-31, whee=-20, hum=-27, land=-26, pop=-17, zip=-25,
         clip=-24, sparkle=-26, switch=-11, cricket=-34, ghost=-28, stamp=-24, boom=-16, zing=-25, boop=-18, bonk=-21,
         flap=-29, twinkle=-27, bird=-33, ff=-24)


def pok(seed=0, cut=300):
    """a soft low knock (under 300 Hz)"""
    k = filt(kick(0.6), "lowpass", cut)[: int(0.14 * SR)]
    return k * np.clip((len(k) - np.arange(len(k))) / (0.03 * SR), 0, 1)


def hop_tick(seed=0):
    """an eye's JUMP: a tiny glass tick above 5 kHz (bed bus: it can sit on a word)"""
    return glint(6500 + 380 * (seed % 4), 0.06, seed)


def low_whoosh(dur, seed, cut=320):
    """a camera move or a whip, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def slide_click(seed=0):
    """the viewfinder jumping on like a slide projector: a shutter's clack above 5 kHz and a low thunk"""
    hi = filt(shutter(), "highpass", 5000)
    lo = pok(seed, 240)
    m = max(len(hi), len(lo))
    y = np.zeros(m)
    y[: len(hi)] += 2.2 * hi
    y[: len(lo)] += 0.9 * lo
    return y


def hum_glide(dur, f0=150.0, f1=230.0, wob=0.0, seed=0):
    """a smooth low hum that glides (the GLIDE under the words): a sine and its octave, all under 300 Hz"""
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (f1 / f0) ** (t / max(dur, 1e-3)) * (1 + wob * np.sin(2 * np.pi * 2.4 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.25 * np.sin(2 * ph)
    return filt(fade(y * attack_decay(n, 0.25, 0.4), 0.02, 0.1), "lowpass", 300)


def switch_click(seed=0):
    """a light switch: a crisp snap and a little plastic body (0.08 s; for a pause)"""
    s1 = filt(snap(seed), "highpass", 1500)[: int(0.05 * SR)]
    b = filt(filt(kick(0.5), "highpass", 300), "lowpass", 1400)[: int(0.06 * SR)]
    y = np.zeros(int(0.08 * SR))
    y[: len(s1)] += s1
    y[: len(b)] += 0.6 * b
    y = y / (np.abs(y).max() + 1e-9)
    y = np.tanh(3.2 * y) / np.tanh(3.2)                       # soft-clipped: the same peak, more body (sound.md)
    return fade(y, 0.0005, 0.02)


def boop(seed=0):
    """a cartoon BOOP: a round blip that rises, 0.16 s (for a pause)"""
    n = int(0.16 * SR)
    t = ar(n)
    f = 420 * (2.0 ** (t / 0.16))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.clip(t / 0.16, 0, 1)) ** 0.6
    return fade(y, 0.002, 0.02)


# ================================================================= ambience: a breezy day in the meadow; crickets in the dark
DAY = [(0.0, c["click"]), (c["lights_on"], DUR)]
wind = filt(pink(N, 3), "lowpass", 340) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.09 * tt + 0.4))
amb.x += pan_st(gate(N, DAY) * wind, -0.1) * 0.45
amb.x += pan_st(gate(N, DAY) * filt(white(N, 4), "highpass", 6400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.37 * tt)) ** 4, 0.35) * 0.018
crickets(c["click"] + 0.25, c["brain_end"] - 0.05, bed, G["cricket"], seed=7, f=5400, rate=1.3)        # the dark (above the voice)
crickets(c["feels"] + 0.6, c["move3_end"] - 0.05, bed, G["cricket"] - 3, seed=8, f=5600, rate=1.1)
for i, t0 in enumerate([c["room_end"] + 0.12, c["finger1_end"] + 0.06]):                               # a far bird in a pause
    bed.add(pan_st(tweet(200 + i, 3600 + 200 * (i % 2)), -0.5 + 0.4 * i), t0, db(G["bird"]))

# ================================================================= the hook (and the loop): his eyes JUMP across
_hook_hops = [DUR - 0.30] + list(c["hops"])                                                           # the loop's hop, then the hook's
for i, h in enumerate(_hook_hops):
    tp = h if h < DUR else h - DUR
    bed.add(pan_st(hop_tick(i), -0.3 + 0.2 * (i % 4)), tp + 0.015, db(G["hop"]))
    bed.add(pan_st(pok(i), 0.0), tp + 0.01, db(G["hoplo"]))
# what he sees: the viewfinder jumps across the valley (slide-projector clacks), the scanpath dots land
for i, h in enumerate(c["pov_hops"]):
    bed.add(pan_st(slide_click(10 + i), -0.4 + 0.25 * i), h, db(G["click"]))
sfx.add(pan_st(low_whoosh(0.24, 15), 0.3), SHOT["pov"] - 0.1, db(G["whoosh"]))                         # into the viewfinder

# ================================================================= the verdict: Jumpy, right? (a boing in the pause)
sfx.add(pan_st(low_whoosh(0.26, 20), -0.3), SHOT["answer_a"] - 0.12, db(G["whoosh"]))                  # the whip
sfx.add(pan_st(filt(boing(0.3, 210.0, 21), "lowpass", 300), 0.0), c["right_end"] + 0.03, db(G["boing"]))   # boing (low)
for i, h in enumerate(c["hops2"]):
    bed.add(pan_st(hop_tick(30 + i), -0.3 + 0.2 * (i % 4)), h + 0.015, db(G["hop"]))
    bed.add(pan_st(pok(30 + i), 0.0), h + 0.01, db(G["hoplo"] - 1))
bed.add(pan_st(ratchet(c["glide_end"] - c["cant"], 9.0, 15.0, 33, edges=True, f=5600.0), 0.0), c["cant"], db(G["zip"]))   # the strain
# the flash-forward: a whoosh in, the score dipped, a soft thud out
if FF is not None:
    sfx.add(pan_st(low_whoosh(0.22, 34), 0.4), FF - 0.06, db(G["ff"]))
    bed.add(pan_st(glint(7600, 0.08, 35), 0.4), FF + 0.02, db(G["ff"] - 2))
    sfx.add(pan_st(pok(36, 220), 0.4), FF + 0.6, db(G["ff"]))
# "to...": a wing tip at the edge of the frame
bed.add(pan_st(flutter(c["chase"] - c["to"] + 0.1, 37, edges=True), -0.7), c["to"] - 0.05, db(G["wing"]))

# ================================================================= CHASE: the butterfly zips past, his eyes GLIDE after it
sfx.add(pan_st(low_whoosh(0.3, 40), 0.5), SHOT["chase"] - 0.12, db(G["whoosh"]))                       # the whip
bed.add(pan_st(flutter(1.3, 41, edges=True), -0.6), c["fly_in"], db(G["wing"] + 3))                    # its wings (top only)
bed.add(pan_st(hum_glide(1.4, 140.0, 240.0, 0.0, 42), 0.0), c["fly_in"] + 0.1, db(G["hum"]))           # the glide, low
for _th in HITS:                                                                                        # the hitstop
    sfx.add(pan_st(filt(snap(51), "highpass", 1800), 0.0), _th, db(-21))
    sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-18))
    sfx.add(cymbal(52, 0.45), _th + 0.01, db(-32))
sfx.add(pan_st(slide_whistle(0.36, 800, 1900), 0.4), c["fly_pass"] + 0.1, db(G["whee"]))              # WHEEE (in the pause)

# ================================================================= the finger: hold it up, move it, the butterfly lands
sfx.add(pan_st(low_whoosh(0.22, 60), -0.3), SHOT["finger_a"] - 0.1, db(G["whoosh"] - 1))
_pp = cork_pop(61, 700.0); _pp = np.tanh(3.2 * _pp / (np.abs(_pp).max() + 1e-9)) / np.tanh(3.2)
sfx.add(pan_st(_pp, -0.3), c["finger1_end"] + 0.04, db(G["pop"] - 2))                     # the finger pops up (pause)
bed.add(pan_st(hum_glide(c["it3_end"] - c["finger_go"], 150.0, 250.0, 0.0, 62), 0.0), c["finger_go"], db(G["hum"]))   # the long glide
bed.add(pan_st(flutter(c["fly_land"] - SHOT["finger_b"] + 0.1, 63, edges=True), 0.5), SHOT["finger_b"], db(G["wing"]))
bed.add(pan_st(glint(7900, 0.06, 64), -0.2), c["fly_land"] + 0.02, db(G["land"]))                     # it lands on the fingertip
for i, m in enumerate([88, 91, 96]):                                                                    # its twinkle (music box)
    sfx.add(pan_st(filt(music_box(mtof(m), 0.5, 65 + i), "highpass", 1200), -0.2), c["it2_end"] + 0.03 + 0.07 * i, db(G["twinkle"]))

# ================================================================= Smooth! the tow lines
for i, m in enumerate([84, 88, 91]):                                                                    # a bright little chord (pause)
    sfx.add(pan_st(ding(m, 0.14, 70 + i), -0.2 + 0.2 * i), c["smooth_end"] + 0.03 + 0.04 * i, db(G["sparkle"]))
bed.add(pan_st(ratchet(c["ride1"] - c["hitch"] + 0.15, 26.0, 40.0, 73, edges=True, f=5600.0), 0.0), c["hitch"] - 0.1, db(G["zip"]))   # the lines zip out
for i, sd in enumerate([-0.3, 0.3]):                                                                    # the two clips snap on
    bed.add(pan_st(glint(7300 + 420 * i, 0.08, 74 + i), sd), c["ride1"] + 0.05 * i, db(G["clip"]))

# ================================================================= the dark: click, eyes alone, the ghost finger, SORT OF
sfx.add(pan_st(switch_click(80), 0.2), c["click"], db(G["switch"]))                                    # CLICK (in the pause)
for i, h in enumerate([c["click"] + 0.35, c["click"] + 0.72, c["pitch"] + 0.05, c["dark_end"] + 0.08]):  # eyes darting in the dark
    bed.add(pan_st(hop_tick(81 + i), -0.3 + 0.2 * (i % 4)), h + 0.015, db(G["hop"] - 2))
for i in range(6):                                                                                      # the ghost finger shimmers in
    bed.add(pan_st(glint(6800 + 260 * i, 0.07, 85 + i), 0.2), c["ghost_in"] + 0.05 * i, db(G["ghost"]))
_g0 = c["ghost_in"] + 0.25
bed.add(pan_st(hum_glide(c["feels_end"] - _g0, 150.0, 230.0, 0.03, 90), 0.0), _g0, db(G["hum"] - 1))  # the wobbly glide
k = 1
while _g0 + k * 0.42 < c["brain_end"]:                                                                 # its catch-up jumps
    bed.add(pan_st(hop_tick(91 + k), 0.1), _g0 + k * 0.42 + 0.01, db(G["hop"] - 5))
    k += 1
sfx.add(pan_st(pok(96, 260), -0.4), c["finger2_end"] + 0.3, db(G["stamp"]))                           # SORT OF stamp (low)
sfx.add(pan_st(filt(bloop(240, 160, 0.14), "lowpass", 300), 0.0), c["brain"] + 0.02, db(G["pop"] - 2))  # the brain fades in

# ================================================================= FEELS: full silence, then the biggest hit
sfx.add(pan_st(filt(kick(1.0), "lowpass", 260), 0.0), c["feels"] - 0.03, db(G["boom"]))                 # BOOM (under the word)
sfx.add(pan_st(filt(kick(1.0), "lowpass", 180), 0.0), c["feels"] + 0.05, db(G["boom"] - 4))
bed.add(pan_st(filt(riser(0.5, 97, 3000, 9000), "highpass", 5200), -0.3), c["feels"], db(G["zing"]))    # the beads race (top)
for i in range(5):                                                                                      # the brain lights up (top)
    bed.add(pan_st(glint(7200 + 300 * i, 0.08, 98 + i), 0.0), c["feels"] + 0.5 + 0.04 * i, db(G["sparkle"]))
# the bonk: the butterfly flies into his nose in the dark
bed.add(pan_st(flutter(0.32, 105, edges=True), 0.4), c["bonk"] - 0.32, db(G["flap"]))
sfx.add(pan_st(boop(106), 0.0), c["bonk"], db(G["boop"]))
sfx.add(pan_st(bonk(), 0.0), c["bonk"] + 0.02, db(G["bonk"]))

# ================================================================= the button: lights on, the butterfly flies off, try again
sfx.add(pan_st(switch_click(110), -0.2), c["lights_on"] - 0.04, db(G["switch"] - 2))
sfx.add(pan_st(low_whoosh(0.28, 111), -0.4), SHOT["button"] - 0.1, db(G["whoosh"]))
bed.add(pan_st(flutter(0.9, 112, edges=True), 0.5), c["finger3"] - 0.1, db(G["flap"]))                # it takes off
sfx.add(pan_st(low_whoosh(0.32, 113), 0.2), c["lose"] + 0.1, db(G["whoosh"] - 3))                      # the hand drops away
_try = c["try"] - 0.03
bed.add(pan_st(hop_tick(114), -0.4), _try + 0.015, db(G["hop"]))                                        # snap back to the far left
bed.add(pan_st(pok(114), 0.0), _try + 0.01, db(G["hoplo"]))

# ================================================================= score: the loop score, three sections on the bar grid
BPM, BEAT, BARS = fit_loop(DUR, 100, 128, want=110)
BAR = 4 * BEAT
print(f"score: {BARS} bars at {BPM:.1f} BPM (bar {BAR:.3f} s); bars x 4 x beat = {BARS * BAR:.3f} s, the Short {DUR:.3f} s")
b_glide = bar_at(c["chase"], BEAT)          # the jumpy groove -> the smooth one (on a bar line near CHASE)
b_dark = bar_at(c["click"], BEAT)           # the dark: no groove
b_back = bar_at(c["lights_on"], BEAT)       # the sunny groove again, into the loop
if b_back > c["lights_on"] + 0.05:
    b_back -= BAR
# 1) jumpy: pizzicato staccato, snaps on the back beat, low under the hook's first words
groove(mus, 0.0, b_glide, BPM, ["C", "G", "Am", "F"], gain=-9, seed=10, kick_on=False, snaps=True)
# 2) smooth: the same key, legato (no snaps, a fuller pad), from CHASE to the click
groove(mus, b_glide, b_dark + BAR, BPM, ["F", "C", "G", "C"], gain=-8, seed=20, kick_on=False, snaps=False, cutoff=1800)
# 3) in the dark: a low drone under the words (under 300 Hz) and one music-box twinkle in the pause after "dark,"
mus.add(pan_st(filt(pad([mtof(45), mtof(52), mtof(57)], c["brain_end"] - c["ghost_in"] + 0.2, 0.6, 600, 120), "lowpass", 300), 0.0), c["ghost_in"] - 0.05, db(-12))
for i, m in enumerate([88, 91, 95]):
    mus.add(pan_st(music_box(mtof(m), 0.22, 121 + i), -0.3 + 0.3 * i), c["dark_end"] + 0.02 + 0.09 * i, db(-22))
# FEELS: a warm swell chord under the payoff (C major), out before the BOOP
mus.add(pan_st(pad([mtof(60), mtof(64), mtof(67), mtof(72)], c["move3"] - c["feels"], 0.25, 1600, 130), 0.0), c["feels"] - 0.02, db(-10))
# 4) the button and the loop: the sunny groove; the last bar's G leads into bar 1's C
groove(mus, b_back, DUR - 1e-4, BPM, ["Am", "G"] if (DUR - b_back) > BAR * 1.5 else ["G"], gain=-9, seed=40, kick_on=False, snaps=True)
mus.add(pan_st(steel_pan(79, 0.25, 140), 0.2), DUR - BEAT, db(-27))                                    # the pickup into bar 1
mus.add(pan_st(steel_pan(83, 0.22, 141), -0.2), DUR - BEAT / 2, db(-27))
# the dead stops (rule 16): the fail, CHASE, the click into the dark, full silence before FEELS, the BOOP
STOPS = [(c["jumpy"] - 0.04, c["right_end"] + 0.32),
         (c["chase"] - 0.03, c["fly_pass"] + 0.5),
         (c["click"] - 0.03, c["ghost_in"] - 0.05),
         (c["brain_end"] - 0.02, c["feels"] - 0.02),
         (c["move3_end"] - 0.02, c["lights_on"] + 0.08)]
silence(mus, STOPS)
# no voice to duck under at the seam (the tail after "again." and the first word): hold the score at its ducked level there
_env = np.ones(N)
for a0, a1 in [(c["again_end"] + 0.03, DUR), (0.0, c["can"] + 0.02)]:
    i0, i1 = int(a0 * SR), min(N, int(a1 * SR))
    _env[i0:i1] = db(-7)
_env = np.convolve(_env, np.ones(int(0.04 * SR)) / int(0.04 * SR), mode="same")
_env[: int(0.02 * SR)] = db(-7)
mus.x *= _env[None, :] if mus.x.ndim == 2 else _env
silence(bed, [(c["brain_end"] - 0.02, c["feels"] - 0.03)])                                            # nothing at all before FEELS
silence(amb, [(c["brain_end"] - 0.02, c["feels"] - 0.03)])
print("dead stops: " + ", ".join(f"{a:.2f}-{b:.2f}" for a, b in STOPS))

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": -12.0}, duck={"music": 0.74})
