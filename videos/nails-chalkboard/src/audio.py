"""Why Do Nails on a CHALKBOARD Make You Cringe? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The screech is the subject, so it is also the demonstration: it is heard five times, each a little louder than the
last (frame 1, before "LOUDER", after it, after "boosts exactly that band", after "cranks it UP"), and once more with
the 1.8-4.6 kHz band taken out of the very same scrape (after "Mute that band..."): about 10 dB quieter and dull.
Each of those has a pause of the narration to itself and lasts a third of a second: it is unpleasant on purpose, and a
phone speaker is loudest right there. Under a word only its top (above 5.2 kHz) and a low judder are left.
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


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def cut(t, seed, gain=-22.0, f0=400, f1=2000, top=2200):
    """the whoosh into a cut: kept dull, so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def air(t0, t1, gain, seed, shape=None, pan=0.0):
    """air on the move: it can run under words, because it is only above 5.2 kHz"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(filt(white(n, seed), "highpass", 5200, 4) * env, 0.004, 0.03), pan), t0, db(gain))


def in_pauses(y, t):
    """y from time t, heard only where nobody is speaking"""
    i0 = int(t * SR)
    pm = PAUSE[i0:i0 + len(y)]
    return y * np.pad(pm, (0, len(y) - len(pm)))


def squeal(t, dur, gain, seed, pan=0.2, drive=0.0, f0=2650.0):
    """the screech, whole, from t (give it a pause of the narration)"""
    y = screech(dur, seed, f0)
    if drive:
        y = np.tanh((1 + drive) * y) / np.tanh(1 + drive)
    sfx.add(pan_st(y, pan), t, db(gain))


CLASS = ("hook", "proof", "loop")
# the screech, five times, each a step louder (set against each other here; the bus level is in master() below)
G0, G1, G2, G3, G4 = -11.2, -10.1, -5.9, -3.9, -9.6

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.17 * tt)))
amb.x += pan_st(room, 0) * 0.22 * gate(N, on(*CLASS))                                # an empty classroom
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.55 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.4 * gate(N, on("canal", "alarm"))                     # inside his head: muffled, pulsing
booth = norm(filt(brown(N, 6), "lowpass", 160))
amb.x += pan_st(booth, 0) * 0.16 * gate(N, on("music", "button"))                    # the sound booth: dead quiet

# ================================================================= 1. hook: four nails down the board
YOU = c["you"]
sq0 = screech(c["chalk_end"] + 0.12, 1)
keep = np.ones(len(sq0))
keep[int((YOU - 0.13) * SR):] = 0                                                     # the whole screech: only before "You" ...
keep = np.minimum(1, keep + in_pauses(np.ones(len(sq0)), 0.0) * 0.5)                 # ... and wherever she takes a breath
keep = filt(keep, "lowpass", 60)
sfx.add(pan_st(sq0 * np.clip(keep, 0, 1), 0.2), 0.0, db(G0))
bed.add(pan_st(screech(c["chalk_end"] + 0.12, 1, edges=True), 0.2), 0.0, db(-6))     # under the words: only its top
jud = filt(creak(c["chalk_end"] + 0.1, 2, 55, 140), "lowpass", 210)
bed.add(pan_st(fade(norm(jud), 0.02, 0.08), 0.2), 0.0, db(-13))                      # ... and the judder of the drag, low
low_thud(c["cringe"], -11, 120.0, 0.3, 0.1)                                          # his whole body folds
bed.add(pan_st(hair_zip(0.22, True, 3, 14), 0.0), c["cringe"] + 0.02, db(-17))       # hair on end
shv = shiver(0.4, 4)
sfx.add(pan_st(fade(shv, 0.01, 0.08), 0.0), c["cringe_end"] + 0.04, db(-3))          # brrr (after "cringe.")

# ---- the answer: the screech reaches his ear, and the ear turns it up
bed.add(pan_st(fade(screech(c["screech_end"] - c["own"], 5, edges=True), 0.1, 0.05), 0.3), c["own"], db(-9))   # on its way: thin
hi_tick(c["making"], -14, 6, 0.3)                                                    # the loudspeaker badge
squeal(c["screech_end"] + 0.03, min(0.26, c["louder"] - c["screech_end"] - 0.12), G1, 7, 0.25)   # the screech (before "LOUDER") ...
low_thud(c["louder"], -12, 110.0, 0.3, 0.1)                                          # the ear throbs
low_thud(c["louder"] + 0.26, -14, 100.0, 0.28, 0.1)
squeal(c["louder_end"] + 0.04, min(0.34, c["nasty"] - c["louder_end"] - 0.2), G2, 8, 0.25)       # ... and LOUDER (after it)

# ---- the band: a pitch ruler is chalked on the board
ch_n = c["sits"] + 0.35 - (c["nasty"] + 0.2)
chalk = scribble(ch_n, 9, 9.0)
bed.add(pan_st(filt(chalk, "highpass", 5200, 4), 0.1), c["nasty"] + 0.2, db(-13))    # chalk on slate (its top, under the words)
sfx.add(pan_st(in_pauses(chalk, c["nasty"] + 0.2), 0.1), c["nasty"] + 0.2, db(-17))  # ... and all of it where she pauses
low_thud(c["one"], -12, 130.0, 0.26, 0.09)                                           # one narrow band turns red
hi_tick(c["one"] + 0.02, -12, 10, 0.3)
hi_tick(c["narrow"], -14, 11, 0.3)                                                   # its label
hi_tick(c["window"], -13, 12, -0.2)                                                  # a window opens on his ear
cut(SHOT["canal"] + 0.05, 20, -18, 300, 1500, 1900)                                  # into his ear

# ================================================================= 2. canal: a tiny tube that boosts that band
low_thud(SHOT["canal"] + 0.66, -15, 105.0, 0.2, 0.07)                                # the wave reaches the drum
hi_tick(c["canal"], -14, 21, 0.0)                                                    # the label
bt0, bt1 = c["boosts"] - 0.05, c["band2_end"]
k = 0
t0 = bt0
while t0 < bt1 - 0.05:                                                               # the drum takes it, harder and harder (low, under the words)
    u = (t0 - bt0) / (bt1 - bt0)
    low_thud(t0, -19 + 8 * u, 96.0 + 30 * u, 0.2, 0.07)
    hi_tick(t0 + 0.01, -19 + 5 * u, 22 + k, 0.3)
    t0 += 0.21 - 0.07 * u
    k += 1
air(bt0, bt1, -16, 40, lambda u: u ** 1.4, 0.2)                                      # it swells
squeal(c["band2_end"] + 0.05, min(0.3, c["bottle"] - 0.25 - c["band2_end"] - 0.1), G3, 41, 0.3)   # boosted (after "that band.")
hi_tick(c["tiny"], -15, 45, -0.4)                                                    # OPEN ...
hi_tick(c["tube"], -15, 46, 0.4)                                                     # ... CLOSED
hi_tick(c["bottle"], -14, 42, -0.2)                                                  # a bottle
air(c["blow"] - 0.1, c["across_end"], -14, 43, lambda u: 0.4 + 0.6 * np.sin(np.pi * u) ** 0.5, -0.4)   # breath across its mouth
sfx.add(pan_st(bottle_toot(0.3, 392.0, 44), -0.3), c["toot"], db(-6.5))               # its one note (after "across.")

# ================================================================= 3. alarm: the alarm centre grabs the volume knob
cut(SHOT["alarm"] + 0.02, 50, -23, 300, 1400, 1800)
air(SHOT["alarm"], c["brains"] + 0.2, -17, 51, lambda u: u ** 0.7, -0.3)             # up the nerve
sr_n = c["cranks"] - c["alarm"]
srn = siren(sr_n, 52)
sfx.add(pan_st(in_pauses(srn, c["alarm"]), 0.3), c["alarm"], db(-15))                # the siren, in her pauses (after "centre", after "knob...")
t0, k = c["alarm"], 0
while t0 < c["up"]:                                                                  # ... and its lamp going round, above the words
    hi_tick(t0, -16, 53 + k, 0.5 if k % 2 else -0.1)
    t0 += 0.16
    k += 1
low_thud(c["grabs"] + 0.08, -11, 140.0, 0.22, 0.07)                                  # a hand lands on the knob
rt_n = c["up_end"] - c["cranks"]
bed.add(pan_st(ratchet(rt_n, 14.0, 44.0, 70, True), -0.2), c["cranks"], db(-9))      # it cranks (above the words) ...
sfx.add(pan_st(in_pauses(ratchet(rt_n, 14.0, 44.0, 70), c["cranks"]), -0.2), c["cranks"], db(-17))   # ... and in her pause
low_thud(c["up"], -10, 90.0, 0.34, 0.12)                                             # all the way round
squeal(c["up_end"] + 0.05, min(0.32, c["mute"] - c["up_end"] - 0.14), G4, 71, 0.2, drive=1.2)    # the loudest one (after "UP.")

# ================================================================= 4. proof: mute the band, scrape again
low_thud(c["mute"] + 0.04, -13, 150.0, 0.16, 0.05)                                   # struck out
hi_tick(c["mute"] + 0.05, -12, 80, 0.3)
dull = screech(min(0.36, c["people"] - 0.3 - c["scrape2"]), 71, mute=True)           # the very same scrape, the band gone
sfx.add(pan_st(dull, 0.1), c["scrape2"], db(-0.5))    # 4 dB up on the honest level, so a phone plays it                                     # (after "Mute that band...")
bed.add(pan_st(fade(norm(filt(creak(0.4, 81, 55, 140), "lowpass", 210)), 0.02, 0.06), 0.1), c["scrape2"], db(-14))
for i, (m, dt) in enumerate(((79, 0.0), (84, 0.12))):                                # no big deal (after "mind.")
    sfx.add(pan_st(fade(ding(m, 0.12, 82 + i, 1.2), 0.001, 0.04), -0.2), c["mind_end"] + 0.05 + dt, db(-9))
sfx.add(pan_st(fade(blip(700, 1250, 0.11, 84, 0.06), 0.002, 0.03), 0.3), c["why_end"] + 0.03, db(-6))   # ? (after "band?")
hi_tick(c["nobodys"], -14, 85, -0.3)                                                 # NOBODY KNOWS WHY
low_thud(c["screams"], -14, 120.0, 0.2, 0.07)                                        # something is coming up out of the band
sfx.add(pan_st(scream(0.42, 86), 0.2), c["live_end"] + 0.06, db(-8.5))                # a scream (after "live.")
low_thud(c["live_end"] + 0.1, -11, 110.0, 0.3, 0.1, sfx)                             # he jumps
bed.add(pan_st(hair_zip(0.2, True, 87, 12), -0.2), c["live_end"] + 0.1, db(-18))

# ================================================================= 5. music: the listening test
cut(SHOT["music"] + 0.02, 90, -24, 300, 1300, 1700)
lk_n = c["modern"] - c["scientists"]
bed.add(pan_st(fade(screech(lk_n, 91, edges=True), 0.08, 0.05), 0.0), c["scientists"], db(-8))    # the screech, leaking out of his headphones
low_thud(c["modern"], -13, 140.0, 0.2, 0.07)                                         # the sign turns over
hi_tick(c["modern"] + 0.02, -12, 92, -0.2)
for i, (m, dt) in enumerate(((60, 0.0), (66, 0.11), (73, 0.22))):                     # modern music: three notes that do not get on (after "music...")
    sfx.add(pan_st(fade(piano(mtof(m + 12), 0.2, 93 + i, 1.1), 0.002, 0.07), -0.2 + 0.2 * i), c["music_end"] + 0.05 + dt, db(-9.5))
hi_tick(c["hated"] + 0.15, -13, 97, 0.4)                                             # the paddle turns over
for i, (m, dt) in enumerate(((84, 0.0), (91, 0.12))):                                # not bad at all (after "less.")
    sfx.add(pan_st(fade(ding(m, 0.12, 98 + i, 1.3), 0.001, 0.04), 0.4), c["less_end"] + 0.05 + dt, db(-9))
bz_n = c["sweated"] - c["their"]
bed.add(pan_st(fade(buzz_hi(bz_n, 34.0, 100), 0.1, 0.03), -0.4), c["their"], db(-15))   # the needle, shaking (above the words)
low_thud(c["sweated"], -10, 100.0, 0.3, 0.1)                                         # ... and over it goes
hi_tick(c["sweated"] + 0.02, -12, 101, -0.4)
for i in range(3):                                                                   # the meter complains (after "sweated.")
    sfx.add(pan_st(beep(2350.0, 0.07), -0.4), c["sweated_end"] + 0.07 + 0.13 * i, db(-10))

# ================================================================= 6. button: the brain bought it, the skin did not
t0, k = c["brain"], 0
while t0 < c["bought_end"] - 0.02:                                                   # the brain claps (above the words) ...
    hi_tick(t0, -14, 110 + k, -0.3)
    t0 += 0.115
    k += 1
for i in range(2):                                                                   # ... and is heard (after "it.")
    sfx.add(pan_st(slap_hit(120 + i), -0.3), c["bought_end"] + 0.05 + 0.15 * i, db(-3))
bz2 = c["not_end"] - c["skin2"]
bed.add(pan_st(fade(buzz_hi(bz2, 46.0, 123), 0.05, 0.02) * np.linspace(0.5, 1.0, int(bz2 * SR))[:len(buzz_hi(bz2, 46.0, 123))], -0.4), c["skin2"], db(-17))   # the needle, harder
hi_tick(c["not"], -14, 124, -0.4)                                                    # the glass goes
sfx.add(pan_st(boing(0.5, 170.0, 125), -0.3), c["sproing"], db(-9))                  # ... and the spring (after "not.")
sfx.add(pan_st(fade(springs(126, 0.5), 0.002, 0.2), -0.3), c["sproing"] + 0.02, db(-15))
sfx.add(pan_st(fade(glass_tink(127, 2600.0, 0.14), 0.0005, 0.04), -0.3), c["sproing"], db(-15))
# the loop: his nails are back on the board, and the screech runs on into frame 1
sfx.add(pan_st(screech(DUR - c["loop"] + 0.02, 1), 0.2), c["loop"], db(G0))
bed.add(pan_st(screech(DUR - c["loop"] + 0.02, 1, edges=True), 0.2), c["loop"], db(-6))
bed.add(pan_st(fade(norm(filt(creak(DUR - c["loop"] + 0.02, 2, 55, 140), "lowpass", 210)), 0.02, 0.01), 0.2), c["loop"], db(-13))

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is silent (nobody says "subscribe", 9 Oct 2026) and plays under the button line, so
# these three sounds sit under spoken words. Nothing here may mask one (qa.py lists weak words).
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-25))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-27))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-21))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-32))

# ================================================================= score (drops out for every screech and punchline)
# nothing under the hook: the screech, the room and his shiver. A sneaky walk comes in under "Your own ear..."
groove(mus, c["ear"], c["screech_end"] - 0.03, 100, ["Dm", "A"], gain=-9, seed=10, arp=False, padv=False, kick_on=False)
# the board draws: a curious minor loop
groove(mus, c["nasty"] + 0.25, c["pitch_end"] - 0.06, 108, ["Dm", "Gm", "Dm", "A"], gain=-11, seed=11, kick_on=False)
# inside his ear: the same key, a little quicker; it stops for the boosted screech
groove(mus, c["canal"], c["band2_end"] - 0.06, 112, ["Dm", "Bb", "Gm", "A"], gain=-12, seed=12, kick_on=False)
# the bottle: light and major, and out for its note
groove(mus, c["bottle"], c["across_end"] - 0.04, 112, ["F", "C"], gain=-13, seed=13, kick_on=False, snaps=False)
# the alarm centre: quick and tense, out for the siren and the loudest screech
groove(mus, c["brains"], c["knob_end"] - 0.04, 126, ["Am", "E"], gain=-12, seed=14, sixteen=True)
groove(mus, c["cranks"] + 0.15, c["up"] - 0.05, 126, ["Am", "E"], gain=-12, seed=15, sixteen=True)
# the proof is heard with nothing under it; then relief
groove(mus, c["people"] + 0.2, c["mind_end"] - 0.03, 104, ["F", "C"], gain=-11, seed=16, kick_on=False)
# why that band? nobody's sure: the sneaky walk again, then a held breath before the scream
groove(mus, c["why"] + 0.2, c["sure_end"] - 0.03, 100, ["Dm", "A"], gain=-10, seed=17, arp=False, padv=False, kick_on=False)
drone(mus, c["but"], c["live_end"], [50, 57, 62, 65], cutoff=650, gain=-25, seed=18, swell=0.4)
# the listening test: polite and a little pleased with itself
groove(mus, c["told"], c["music_end"] - 0.05, 100, ["C", "Am"], gain=-12, seed=19, kick_on=False)
groove(mus, c["hated"], c["less_end"] - 0.04, 100, ["F", "G"], gain=-12, seed=20, kick_on=False)
# the skin: something low, rising
drone(mus, c["their"], c["sweated_end"] + 0.03, [45, 52, 57], cutoff=520, gain=-24, seed=21, swell=0.5)
# the brain bought it: bright; the last line is said over nothing but the needle
groove(mus, c["brain"], c["bought_end"] - 0.03, 112, ["F", "C"], gain=-10, seed=22, kick_on=False)
silence(mus, [(0.0, c["ear"] - 0.02), (c["screech_end"] - 0.02, c["nasty"] + 0.22), (c["pitch_end"] - 0.05, c["canal"] - 0.02),
              (c["band2_end"] - 0.05, c["bottle"] - 0.02), (c["across_end"] - 0.03, c["brains"] - 0.02), (c["knob_end"] - 0.03, c["cranks"] + 0.12),
              (c["up"] - 0.04, c["people"] + 0.18), (c["mind_end"] - 0.02, c["why"] + 0.18), (c["sure_end"] - 0.02, c["but"] - 0.02),
              (c["live_end"] + 0.02, c["told"] - 0.02), (c["music_end"] - 0.04, c["hated"] - 0.02), (c["less_end"] - 0.03, c["their"] - 0.02),
              (c["sweated_end"] + 0.04, c["brain"] - 0.02), (c["bought_end"] - 0.02, DUR)])


# ================================================================= voice + mix
# three words that Jessica lets fall away, lifted a little (they are the hook's word and the reveal's two words)
def lift(vo):
    g = np.ones(len(vo))
    for a, b, d in ((c["cringe"] - 0.02, c["cringe_end"], 3.0), (c["screams"] - 0.02, c["live_end"], 4.0)):
        i0, i1, r = int(a * SR), int(b * SR), int(0.04 * SR)
        seg = np.ones(i1 - i0 + 2 * r)
        seg[:r] = np.linspace(0, 1, r)
        seg[-r:] = np.linspace(1, 0, r)
        j0 = max(0, i0 - r)
        g[j0:j0 + len(seg)] *= db(d * seg[:len(g[j0:j0 + len(seg)])])
    return vo * g


# the ceiling sits 0.5 dB under the house one: the needle's buzz and the glass are all top, and AAC overshot them by 1 dB
master(WORK, sfx, bed, mus, amb, levels={"music": -13.0, "sfx": -7.8}, duck={"music": 0.72}, ceiling=-2.4, voice_fx=lift)
