"""Can You Make SAD Eyebrows on Purpose? 🥺 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

A campfire at night: the fire's low rumble and its crackle (above 1.8 kHz, quiet), crickets in the trees. The score is a
warm campfire groove fitted to a whole number of bars (the loop score), cut dead for the punchlines. His motif is a slide
whistle (his brows shoot UP when he tries: the fail, the UP rope); the dog's is a music-box twinkle (puppy eyes), and at
the end, when he finally does it, the twinkle is his. Gags: the sausage's swish and the dog's chomp, the flash-forward's
whoosh, the padlock's slam with the hitstop's layered hit, the rope rig's wooden clack and creaks, the jam's clunk, the
cloud's drip and the unlock, the dog's gulp, the x-ray hum, full silence and then the Short's biggest hit on "just for
THIS", the shelter's door clang, the stamp, the zoom-off, the bubble's pop, the wet puppy's shiver, the plate's clink, the
dog's growl. Nothing rings past the loop.
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
c = C
words = TL["words"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def soft_clip(y, k=3.2):
    y = norm(y)
    return np.tanh(k * y) / np.tanh(k)


def next_word_after(t):
    ws = [w["start"] for w in words if w["start"] > t + 0.01]
    return min(ws) if ws else DUR


def fit(x, t, pad=0.08):
    """trim a sound so it ends `pad` s before the next word (a gag lives in its pause)"""
    room = max(0.06, next_word_after(t) - t - pad)
    n = int(room * SR)
    y = x[..., :n] if x.shape[-1] > n else x
    return fade(y, 0.002, min(0.04, room * 0.3)) if y.ndim == 1 else y


def low_thud(t, gain, f=150.0, dur=0.3, tau=0.09):
    bed.add(thump(dur, f, f * 0.3, tau), t, db(gain))


def whip(t, gain, seed=0, pan=0.0):
    sfx.add(pan_st(whoosh(0.22, 300, 2400, seed), pan), t - 0.22, db(gain))


def air(t, gain, seed=0, pan=0.0, dur=0.18):
    bed.add(pan_st(fade(filt(whoosh(dur, 3000, 9000, seed, 0.6), "highpass", 5200), 0.005, 0.04), pan), t, db(gain))


def hit_layers(th, g=0.0, tail=True):
    sfx.add(pan_st(fit(filt(snap(51), "highpass", 1800), th, 0.06), 0.0), th, db(-20 + g))
    sfx.add(pan_st(fit(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), th + 0.004, 0.06), 0.0), th + 0.004, db(-17 + g))
    if tail:
        sfx.add(fit(cymbal(52, 0.4), th + 0.01, 0.07), th + 0.01, db(-31 + g))


def twinkle(t, gain, seed=0, notes=(84, 88, 91, 96), step=0.06):
    """the puppy-eyes motif: a music-box arpeggio (the dog's; his at the end), every note ending before the next word"""
    for j, m in enumerate(notes):
        tj = t + step * j
        if next_word_after(t) - tj < 0.12:
            break
        sfx.add(pan_st(fit(music_box(mtof(m), 0.5, seed + j), tj, 0.07), 0.25 * (j - 1.5)), tj, db(gain))


def his_slide(t, gain, up=True, dur=0.32):
    """his motif: a slide whistle (his brows shoot up)"""
    s = slide_whistle(dur, 700, 2100) if up else slide_whistle(dur, 1500, 520)
    sfx.add(pan_st(fit(fade(norm(s), 0.004, 0.05), t, 0.08), 0.0), t, db(gain))


# ================================================================= ambience: the campfire (and the shelter)
camp = [(0.0, c["this_end"] + 0.1), (SHOT["button"], DUR)]
shelter = [(SHOT["kennel"], SHOT["button"])]
rum = norm(filt(brown(N, 3), "lowpass", 240)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.37 * tt))
amb.x += pan_st(rum * gate(N, camp), 0.1) * 0.34
crk = norm(crackle(N, 9.0, 5, 1800, 9000))
bed.x += pan_st(crk * gate(N, camp), 0.25) * db(-34)
room = norm(filt(pink(N, 7), "lowpass", 300))
amb.x += pan_st(room * gate(N, shelter), 0.0) * 0.16
crickets(0.0, SHOT["kennel"] - 0.1, bed, db(-36), seed=8, f=4700, rate=0.8)
crickets(SHOT["button"] + 0.1, DUR - 0.05, bed, db(-36), seed=9, f=4700, rate=0.8)

# ================================================================= 1. the hook: make your eyebrows sad. lift only the inner ends.
air(0.0, -40, 1, 0.3, 0.6)                                                                      # the sausage's steam (high)
bed.add(pan_st(fade(filt(squeak(0.45, 5300, 6900), "highpass", 5200), 0.03, 0.12), 0.0), 0.35, db(-33))   # the strain (high)
his_slide(c["ends_end"] + 0.02, -21, up=True)                                                   # FAIL: his whole brows shoot up
whip(SHOT["answer"], -32, 10, 0.2)

# ================================================================= 2. look surprised? (the sausage goes to the dog) your sad eyebrows are LOCKED.
pops([c["tag_surp"]], bed, db(-24), 11)
air(c["swing_dog"], -27, 12, 0.3, 0.3)                                                          # the stick swings (high)
sfx.add(pan_st(fit(chomp(13), c["surprised_end"] + 0.0, 0.05), -0.1), c["surprised_end"] + 0.0, db(-21))   # the dog chomps (the pause)
air(c["ff"], -29, 14, 0.4, 0.2)                                                                  # the flash-forward: whoosh in (high)
low_thud(c["ff"] + 0.6, -27, 170.0, 0.14, 0.05)                                                 # and a soft thud out
sfx.add(pan_st(lock_snap(15, edges=True), 0.0), c["lock"], db(-21))                             # the padlock lands (edges: on the word)
lk = soft_clip(lock_snap(16))
sfx.add(pan_st(fit(lk, c["clunk"], 0.06), 0.0), c["clunk"], db(-16))                            # CLUNK (after the word)
hit_layers(c["clunk"], -1.0, tail=False)

# ================================================================= 3. two ropes on each brow. one pulls UP... one pulls IN.
low_thud(c["rope_on"] + 0.15, -20, 220.0, 0.12, 0.04)                                          # the rig's bar drops in (wood)
sfx.add(pan_st(filt(snap(17), "highpass", 2500), 0.0), c["rope_on"] + 0.16, db(-27))
bed.add(pan_st(fade(filt(squeak(0.2, 5400, 6600), "highpass", 5200), 0.01, 0.05), -0.2), c["yank_up"], db(-25))   # the pulley squeaks (high)
his_slide(c["up_end"] + 0.02, -22, up=True, dur=0.26)                                          # UP: his slide whistle
pops([c["up"] + 0.05], bed, db(-25), 18)
low_thud(c["in_end"] + 0.02, -18, 120.0, 0.2, 0.06)                                            # IN: a low grumpy thud
sfx.add(pan_st(fit(fade(filt(slide(220.0, 150.0, 0.22, 0.0, 600, 4), "lowpass", 700), 0.01, 0.05), c["in_end"] + 0.03, 0.06), 0.0), c["in_end"] + 0.03, db(-22))

# ================================================================= 4. sad pulls BOTH... (the lock holds) and only real sadness can.
sfx.add(pan_st(ratchet(0.42, 16.0, 38.0, 19, edges=True), 0.0), c["yank_both"], db(-27))       # the ropes strain (edges: on the word)
sfx.add(pan_st(fit(soft_clip(lock_snap(20)), c["jam"], 0.05), 0.0), c["jam"], db(-19))         # the jam's clunk (the pause)
low_thud(c["jam"] + 0.005, -16, 110.0, 0.2, 0.06)
air(c["cloud"], -28, 21, -0.3, 0.3)                                                             # the little cloud floats in (high)
bed.add(pan_st(fade(filt(drip(22, 1700.0), "highpass", 4600), 0.001, 0.03), 0.0), c["tear"], db(-23))   # the tear drips (high)
sfx.add(pan_st(lock_snap(23, edges=True), 0.0), c["click"], db(-22))                           # click: unlocked (on "can")
twinkle(c["can_end"] + 0.03, -24, 24, (79, 84, 88, 91))                                         # SAD: the twinkle (the pause)
bed.add(pan_st(fade(norm(filt(white(int(1.0 * SR), 25), "highpass", 5600)), 0.08, 0.3), 0.0), c["sadface"] + 0.2, db(-34))   # the cloud rains (high)
whip(SHOT["dogs"], -32, 26, 0.3)

# ================================================================= 5. Dogs? (gulp) They have an EXTRA muscle... just for THIS.
sfx.add(pan_st(fit(gulp(27), c["dogs_end"] + 0.02, 0.06), 0.2), c["dogs_end"] + 0.02, db(-21))   # the dog swallows the sausage
bed.add(pan_st(fade(filt(buzz_hi(0.6, 31.0, 28), "highpass", 5200), 0.05, 0.15), 0.0), c["xon"], db(-31))   # the x-ray hum (high)
low_thud(c["xon"], -24, 90.0, 0.25, 0.1)
_g = c["pup_hit"]
twinkle(_g, -18, 29, (84, 88, 91, 96, 100))                                                     # puppy eyes: the dog's twinkle
hit_layers(_g, 1.0)                                                                             # the biggest hit of the Short
for j in range(5):
    bed.add(pan_st(fade(glint(5800 + 380 * j, 0.1, 30 + j), 0.002, 0.04), 0.25 * (j - 2)), _g + 0.05 + 0.04 * j, db(-24))
whip(SHOT["kennel"], -31, 35, -0.3)

# ================================================================= 6. and the best puppy eyes get adopted FASTER.
_eyes_end = [w for w in words if w["word"].lower().startswith("eyes")][0]["end"]
sfx.add(pan_st(fit(whimper(36), _eyes_end + 0.02, 0.05), 0.0), _eyes_end + 0.02, db(-23))       # its little whimper (the pause)
bed.add(pan_st(fade(filt(squeak(0.18, 5200, 6000), "highpass", 5200), 0.01, 0.05), 0.0), c["door"], db(-24))   # the door's hinge (high)
low_thud(c["door"] + 0.1, -20, 160.0, 0.16, 0.05)
air(c["zoom"], -24, 37, 0.6, 0.35)                                                               # it zooms off (high)
sfx.add(pan_st(fit(soft_clip(thump(0.2, 180.0, 60.0, 0.06)), c["faster_end"] + 0.02, 0.06), 0.0), c["faster_end"] + 0.02, db(-17))   # the stamp
whip(SHOT["button"], -32, 38, 0.3)

# ================================================================= 7. the button: now try again... picture a wet PUPPY!
bed.add(pan_st(fade(filt(squeak(0.4, 5300, 6900), "highpass", 5200), 0.03, 0.1), 0.0), c["retry"] + 0.1, db(-30))   # the strain (high)
pops([c["bubble"]], bed, db(-23), 39)                                                           # the bubble pops on (high)
bed.add(pan_st(fade(norm(filt(white(int((DUR - c["bubble"] - 0.6) * SR), 40), "highpass", 5600)), 0.1, 0.2), 0.3), c["bubble"] + 0.1, db(-38))   # its rain (high)
_a = [w for w in words if w["word"].lower() == "a" and w["start"] > c["picture"]][0]
if c["wet"] - _a["end"] > 0.25:
    sfx.add(pan_st(fit(shiver(0.4, 41), _a["end"] + 0.02, 0.06), 0.2), _a["end"] + 0.02, db(-26))   # the wet puppy shivers (the pause)
twinkle(c["puppy2_end"] + 0.02, -20, 42, (84, 88, 91, 96))                                      # HIS puppy eyes: the twinkle is his now
sfx.add(pan_st(glass_tink(43, 3100.0, 0.12), -0.2), c["puppy2_end"] + 0.05, db(-24))            # the sausage lands on his plate
_gr = growl(min(0.28, DUR - c["puppy2_end"] - 0.25), 44, 70.0)
sfx.add(pan_st(fade(_gr, 0.01, 0.06), 0.3), c["puppy2_end"] + 0.12, db(-21))                  # the dog growls (the reverse)

# ================================================================= score: the loop groove, cut dead for the punchlines
BPM, BEAT, BARS = loop_groove(mus, DUR, ["F", "Dm", "Bb", "C"], gain=-6, seed=10, cutoff=1300)
print(f"loop score: {BARS} bars at {BPM:.1f} BPM (beat {BEAT:.3f} s; {BARS} x 4 x beat = {BARS * 4 * BEAT:.2f} s, the Short {DUR:.2f} s)")
drone(mus, c["yank_both"], c["jam"], [41, 44, 48], cutoff=420, gain=-20.0, seed=11, swell=0.2)   # the jam: a tense low drone
mus.add(pan_st(steel_pan(84, 0.3, 12), 0.0), DUR - BEAT, db(-24))                               # the pickup into bar 1
mus.add(pan_st(steel_pan(88, 0.25, 13), 0.0), DUR - BEAT / 2, db(-24))
silence(mus, [
    (c["ends_end"] - 0.02, c["look"] + 0.15),                # the fail (the slide whistle alone)
    (c["ff"] - 0.02, c["ff"] + 0.62),                        # the flash-forward: the score dips under it
    (c["in"] - 0.05, c["in_end"] + 0.25),                    # IN: the grumpy beat
    (c["locked"] - 0.04, c["clunk"] + 0.35),                 # LOCKED: dead stop, the clunk alone
    (c["jam"] - 0.04, c["andonly"] + 0.25),                  # the jam
    (c["just"] - 0.12, c["best"]),                           # full silence before the payoff's sting, then the biggest hit
    (c["puppy2"] - 0.06, c["puppy2_end"] + 0.3),             # PUPPY!: the twinkle is his
])

# keep the soft "And the" of the weird fact clear: every gag tail out under it (a smooth notch on both effect buses)
def clear(bus, t0, t1, edge=0.03):
    g = np.ones(N)
    i0, i1, e = int(t0 * SR), int(t1 * SR), int(edge * SR)
    g[i0:i1] = 0.0
    g[max(0, i0 - e):i0] = np.linspace(1, 0, i0 - max(0, i0 - e))
    g[i1:i1 + e] = np.linspace(0, 1, len(g[i1:i1 + e]))
    bus.x *= g


for _b in (sfx, bed):
    clear(_b, c["andthe"] - 0.04, c["best"])

master(WORK, sfx, bed, mus, amb, levels={"sfx": -11.0})
