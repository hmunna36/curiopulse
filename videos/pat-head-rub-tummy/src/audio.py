"""Why Can't You Pat Your Head and Rub Your TUMMY? 🤚 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
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
G = dict(pat=-21, rub=-33, whistle=-21, tangle=-22, huh=-19, glass=-27, dive=-30, stamp=-19, slide=-31, fwoop=-17,
         race=-30, land=-25, slow=-22, card=-31, bump=-20, boing=-18, pop=-24, shred=-23, shredbig=-20, motor=-24,
         paper=-32, drip=-22, toot=-22, power=-21, tweet=-30, babble=-25, squeak=-20, squish=-32, jet=-30, splat=-17,
         giggle=-23, horn=-18, candle=-27, spin=-29, riser=-27)


# ---------------------------------------------------------------- small sounds of this Short
def thud_low(seed=0, f=70.0, dur=0.3):
    """a soft landing heard through the body: all of it under ~250 Hz (it can sit on a word; mono)"""
    n = int(dur * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def pat_on(t, seed, gain=0.0, pan=0.25, belly=False):
    """a hand patting hair (or a tummy): a low thud and a soft slap's top (both can sit on a word)"""
    bed.add(pan_st(thud_low(seed, 150.0 if not belly else 95.0, 0.16), pan), t, db(G["pat"] + gain))
    bed.add(pan_st(slap_hit(seed, edges=True), pan), t, db(G["pat"] + gain - 4))


def pats(times, seed, gain=0.0, pan=0.25, belly=False, t0=-1.0, t1=1e9):
    for i, tp in enumerate(times):
        if t0 <= tp < t1:
            pat_on(tp, seed + i, gain, pan, belly)


def rub_swishes(t0, t1, hz, seed=0, gain=0.0):
    """the rubbing hand: a soft swish of cloth on every half circle (top only: it runs under the words)"""
    k, tk = 0, t0
    while tk < t1:
        bed.add(pan_st(top_swish(0.28 / max(1.0, hz), seed + k), -0.3), tk, db(G["rub"] + gain))
        tk += 0.5 / hz
        k += 1


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0, f0=5600):
    for i in range(n):
        bus.add(pan_st(glint(f0 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


def shred_sound(seed=0, edges=True, dur=0.22):
    """the shredder eating a card: its motor (under 280 Hz) and the paper ripping (above 5.6 kHz); edges=False adds a
    crunchy chomp in the speech band (for a pause)"""
    y = copier(dur, seed)
    if not edges:
        n = len(y)
        c = chomp(seed)
        c = np.pad(c, (0, max(0, n - len(c))))[:n]
        y = y / (np.abs(y).max() + 1e-9) + 0.9 * c / (np.abs(c).max() + 1e-9)
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.03)


# ================================================================= ambience (one bed per world, gated to its shots)
office = [(0, SHOT["kids"] + 0.05), (SHOT["button"] - 0.05, DUR)]
inside = [(C["your"] + 0.1, C["pull1"] + 0.3), (SHOT["shred"] + 0.2, END["shred"]), (SHOT["overtime"], END["overtime"])]
hum = filt(brown(N, 1), "lowpass", 220) + 0.035 * np.sin(2 * np.pi * 100 * tt) + 0.02 * np.sin(2 * np.pi * 200 * tt)
amb.x += pan_st(hum, 0) * 0.30 * gate(N, office)                                   # the office at night: room tone, a light's hum
throb = 0.6 + 0.4 * np.sin(2 * np.pi * 0.9 * tt) ** 2
amb.x += pan_st(filt(brown(N, 3), "lowpass", 170) * throb, 0) * 0.38 * gate(N, inside)   # inside his head: a warm throb
kitchen = filt(pink(N, 5), "lowpass", 380) * 0.5 + 0.02 * np.sin(2 * np.pi * 120 * tt)
amb.x += pan_st(kitchen, 0) * 0.22 * gate(N, [(SHOT["kids"], END["kids"])])        # a sunny kitchen: a soft room tone

# ================================================================= the test: pat, rub, SWAP
sfx.add(pan_st(top_swish(0.2, 2), 0.3), 0.0, db(G["rub"] + 8))                     # frame 1: the hands are already going
pats(C["hook_pats"], 10)
rub_swishes(0.0, C["swap"], C["rub_hz"], seed=20)
sfx.add(pan_st(pea_whistle(0.26, 3, 2900.0), 0), C["swap_end"] + 0.03, db(G["whistle"]))   # SWAP! the whistle (pause after "SWAP!")
pats(C["tangle_pats"], 30, gain=-2)                                                   # the tangle: both hands pat, in unison
pats(C["tangle_pats"], 40, gain=-3, pan=-0.3, belly=True)
sfx.add(pan_st(slide(260.0, 520.0, 0.18, vib=0.0), -0.2), C["right_end"] + 0.03, db(G["huh"]))   # ?! : a quick "huh?" (pause after "right?")

# ================================================================= the mail room
sparkle(C["your"] - 0.05, bed, G["glass"], seed=50, n=4, step=0.05, f0=6000)          # his head turns to glass
bed.add(pan_st(top_swish(0.4, 51), 0), C["your"] + 0.05, db(G["dive"]))              # into his head (top only)
bed.add(pan_st(thud_low(52, 64.0), 0.25), C["stamp1"], db(G["stamp"]))              # STAMP (low, on "mails")
bed.add(pan_st(top_swish(0.07, 53), 0.25), C["stamp1"], db(G["stamp"] - 6))
bed.add(pan_st(fade(buzz_hi(0.28, 40.0, 54, lo=5600), 0.03, 0.08), -0.15), C["copy1"], db(G["slide"]))   # the copy slides out
sfx.add(pan_st(fade(whoosh(0.17, 320, 2400, 55, 0.8), 0.005, 0.05), 0), C["order_end"] + 0.01, db(G["fwoop"]))   # fwoop: both cards into the tubes (pause after "order...")
bed.add(pan_st(top_swish(0.5, 56), -0.4), C["pull1"] + 0.15, db(G["race"]))          # down both arms (top only, under "to BOTH")
bed.add(pan_st(top_swish(0.5, 57), 0.4), C["pull1"] + 0.15, db(G["race"]))
for i, sd in enumerate((-0.45, 0.45)):                                               # they land in both hands: two glints
    bed.add(pan_st(glint(6600 + 600 * i, 0.08, 58 + i), sd), C["arrive1"] + 0.02 * i, db(G["land"]))
pats(C["both_pats"], 60, gain=-1)
pats(C["both_pats"], 70, gain=-2, pan=-0.3, belly=True)

# ================================================================= again, slowly: the copy reaches his tummy hand
sfx.add(pan_st(slide(560.0, 190.0, 0.24, vib=0.0, harm=4), 0), C["back"] + 0.42, db(G["slow"]))   # slow-mo: a tape winding down (pause after "back.")
pats(C["slow_pats"], 80, gain=-3, t0=SHOT["again"])
rub_swishes(SHOT["again"] + 0.3, END["again"], 0.5, seed=90, gain=-2)
bed.add(pan_st(top_swish(0.6, 91), -0.35), C["card2_at"] - 0.62, db(G["card"]))      # the copy slides down his left arm (top)
bed.add(pan_st(thud_low(92, 100.0, 0.22), -0.3), C["card2_at"] + 0.03, db(G["bump"]))   # the tummy hand bumps (low, on "PAT")
bed.add(pan_st(slap_hit(93, edges=True), -0.3), C["card2_at"] + 0.03, db(G["bump"] - 3))
sfx.add(pan_st(boing(0.22, 170.0, 94), -0.2), C["too_end"] + 0.02, db(G["boing"]))    # boing (pause after "too.")

# ================================================================= the shredder
bed.add(pan_st(thud_low(100, 90.0, 0.2), -0.3), C["shredder_in"], db(G["pop"]))       # it pops onto the counter (low...
sparkle(C["shredder_in"] + 0.02, bed, G["pop"] - 2, seed=101, n=3, step=0.05, pan=-0.3, f0=6400)   # ...and a sparkle)
pats(C["shred_pats"], 110, gain=-4, t0=SHOT["shred"])
for i, p in enumerate(C["shred_pats"]):
    if p - 0.02 > C["shredder_in"]:
        bed.add(pan_st(shred_sound(120 + i, edges=True), -0.3), p - 0.02, db(G["shred"] + (2 if p > C["every3"] - 0.1 else 0)))
    bed.add(pan_st(thud_low(130 + i, 60.0, 0.16), 0.2), p - 0.36, db(G["stamp"] - 5))  # each stamp (low)
sfx.add(pan_st(shred_sound(140, edges=False, dur=0.3), -0.3), C["pat3_end"] + 0.03, db(G["shredbig"]))   # the last one, whole (pause after "pat.")

# ================================================================= the strain, the overtime
pats(C["strain_pats"], 150, gain=-2)
rub_swishes(SHOT["payoff"], END["payoff"], C["rub_hz"], seed=160)
drone(mus, SHOT["payoff"] + 0.05, C["feel4_end"] + 0.02, [40, 47, 52, 53], cutoff=360, gain=-27)   # a tense held cluster
sfx.add(pan_st(drip(161, 1500), 0.3), C["feel4_end"] + 0.03, db(G["drip"]))          # a drop of sweat (pause after "feel.")
ot0, ot1 = SHOT["overtime"], END["overtime"]
bed.add(pan_st(fade(copier(ot1 - ot0, 170), 0.08, 0.15), -0.1), ot0, db(G["motor"]))   # the shredder running (motor + paper)
for i, p in enumerate(C["over_chomps"]):
    bed.add(pan_st(shred_sound(180 + i, edges=True, dur=0.16), -0.1), p, db(G["shred"] - 1))
ticking(C["tiny"], ot1 - 0.05, bed, db(G["paper"]), r0=6, r1=26, seed=190)           # the overtime clock, faster and faster (top)
sfx.add(pan_st(bottle_toot(0.2, 523.0, 191), -0.1), C["shredder_end"] + 0.03, db(G["toot"]))   # a steam toot (pause after "shredder...")
sfx.add(pan_st(slide(340.0, 90.0, 0.26, vib=0.0, harm=5), -0.1), C["overtime_end"] + 0.02, db(G["power"]))   # power-down (pause after "overtime.")

# ================================================================= the kitchen: little him
for i, tb in enumerate((SHOT["kids"] + 0.25, C["growing_end"] + 0.02)):              # birds outside the window (pauses)
    sfx.add(pan_st(tweet(200 + i, 3600.0 - 200 * i), 0.6), tb, db(G["tweet"]))
sparkle(C["kids"] - 0.1, bed, G["glass"], seed=210, n=3, step=0.06, pan=0.4, f0=6200)   # the window opens on his head
sfx.add(pan_st(fade(gibber(0.14, 211, 420.0, thin=True, rate=26.0), 0.01, 0.03), -0.1), C["growing_end"] + 0.06, db(G["babble"]))   # a little "ba!" (pause)
sfx.add(pan_st(squeak(0.12, 1900, 2900), 0.3), C["duck"], db(G["squeak"]))           # SQUEAK (pause after "hand...")
bed.add(pan_st(fade(buzz_hi(0.4, 22.0, 220, lo=5600), 0.03, 0.08), 0.2), C["other"] - 0.05, db(G["card"]))   # the card zips past the baby shredder (top)
bed.add(pan_st(top_swish(0.35, 222), -0.3), C["juice"], db(G["squish"]))            # the box crumples (top)
bed.add(pan_st(top_swish(0.42, 223), -0.1), C["jet0"], db(G["jet"]))                 # the jet (top)
sp = splash(0.32, 224, 0.7)
sp = np.tanh(3.0 * sp / (np.abs(sp).max() + 1e-9)) / np.tanh(3.0)                  # soft-clipped: the same peak, more body
sfx.add(pan_st(fade(sp, 0.002, 0.06), 0.0), C["splat"], db(G["splat"]))            # SPLAT (pause after "too.")
sfx.add(pan_st(fade(gibber(0.14, 225, 520.0, thin=True, rate=30.0), 0.01, 0.04), 0.0), C["splat"] + 0.2, db(G["giggle"]))   # a giggle, before "Till"
for i in range(2):                                                                     # the candles light (top)
    bed.add(pan_st(glint(7000 + 500 * i, 0.1, 230 + i), 0.1), C["cake"] + 0.3 + 0.1 * i, db(G["candle"]))
sparkle(C["grow"], bed, G["candle"], seed=232, n=4, step=0.05, pan=0.4, f0=6000)    # the baby shredder grows up (top, on "TEN")
sfx.add(pan_st(party_horn(0.34, 233, 440.0), 0.2), C["ten_end"] + 0.02, db(G["horn"]))   # the party horn (pause after "TEN.")

# ================================================================= FASTER, and round again
pats(C["fast_pats"], 300, gain=-3, t0=SHOT["button"])
rub_swishes(SHOT["button"] + 0.1, END["button"], 2.4, seed=310, gain=-1)
bed.add(pan_st(fade(buzz_hi(C["faster"] - C["try"], 18.0, 312, lo=5400), 0.1, 0.05), 0), C["try"], db(G["riser"]))   # a fizz into FASTER (top)
bed.add(pan_st(top_swish(0.6, 313), 0.4), C["faster_end"] + 0.02, db(G["spin"] + 4))   # the room starts to spin (air)
sfx.add(pan_st(whoosh(0.3, 260, 1800, 314, 0.8), -0.4), C["faster_end"] + 0.04, db(G["spin"]))
# the loop: the hook's first pat lands again just before frame 1 (it is the hook's own schedule, valid at negative time)
pats([DUR + C["pat0"] - 1.0 / C["pat_hz"]], 320, t0=END["button"])

# ================================================================= score (drops out for every punchline)
BPM = 116
groove(mus, 0.15, C["now"], BPM, ["C", "F"], gain=-12, seed=10, kick_on=False, snaps=True)                 # the test
groove(mus, C["brain"] + 0.1, C["order_end"], BPM, ["Am", "F"], gain=-11, seed=20, kick_on=False, snaps=True)   # the mail room: curious
groove(mus, C["to"] + 0.05, C["hands_end"], BPM, ["F", "G"], gain=-10, seed=21, kick_on=True, snaps=True)     # both hands
mus.add(pad([mtof(m) for m in (53, 57, 60, 64)], C["hand2"] - C["slowly"], att=0.6, cutoff=900, seed=30), C["slowly"], db(-22))   # slow motion: a dreamy chord
groove(mus, C["brain3"] + 0.1, C["copy_end"], BPM, ["Dm", "Bb"], gain=-10, seed=40, kick_on=True, snaps=True)  # the shredder arrives
groove(mus, C["on"] + 0.05, C["pat3_end"], BPM, ["Dm", "C"], gain=-9, seed=41, kick_on=True, snaps=True, sixteen=True)   # every single pat
groove(mus, C["tiny"] + 0.1, C["shredder_end"], 148, ["Am", "E"], gain=-10, seed=50, kick_on=True, snaps=True, sixteen=True)   # overtime
groove(mus, C["working"] + 0.1, C["overtime_end"], 160, ["Am", "E"], gain=-9, seed=51, kick_on=True, snaps=True, sixteen=True)
groove(mus, C["kids"] + 0.15, C["too5_end"], 120, ["G", "C"], gain=-12, seed=60, kick_on=False, snaps=True)   # the kitchen: playful
groove(mus, C["till"] + 0.15, C["ten_end"], 120, ["G", "D"], gain=-11, seed=61, kick_on=False, snaps=True)
groove(mus, C["try"] + 0.05, C["faster"], BPM, ["C", "F"], gain=-12, seed=10, kick_on=False, snaps=True)     # the test again...
groove(mus, C["faster_end"] + 0.1, DUR, 164, ["C", "F"], gain=-10, seed=11, kick_on=True, snaps=True, sixteen=True)   # ...FASTER, into the loop
silence(mus, [(C["now"], C["brain"] + 0.1),          # Now... SWAP! the whistle; "Tangled, right?" huh?
              (C["order_end"], C["to"] + 0.05),      # fwoop
              (C["too_end"], C["brain3"] + 0.1),     # boing
              (C["copy_end"], C["on"] + 0.05),
              (C["pat3_end"], SHOT["payoff"] + 0.05),  # the last shred, whole
              (C["feel4_end"], C["tiny"] + 0.1),     # the drip
              (C["shredder_end"], C["working"] + 0.1),  # the toot
              (C["overtime_end"], C["kids"] + 0.15),  # power-down
              (C["too5_end"], C["till"] + 0.15),     # SPLAT, the giggle
              (C["ten_end"], C["try"] + 0.05),       # the party horn
              (C["faster"], C["faster_end"] + 0.1)])  # FASTER.

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
