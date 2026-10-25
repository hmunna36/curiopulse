"""Why Can't You Raise Just ONE Finger? ☝️ Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The worlds: a mountain trail in the morning (wind, a far bird), the 1830s (an old projector, a stride piano), a museum
at night (a hushed hall). The gags: the fist's crunch, the robin's flutter and chirp, the handcuffs' CLICK (twice), the
coach's whistle, the gadget's ratchet, CRICK, the piano lid's BANG, the historians' bickering, his startled "dun!".
Rule: what sounds in the speech band goes in a pause; under a word only its top (above 5.2 kHz) or its bottom.
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

SFX_LEVEL = -13.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(open=-27, crunch_top=-25, crunch=-19, rise=-27, flutter=-25, chirp=-18, hmm=-21, click=-11, click2=-14, chain=-27,
         orbit=-26, glass=-25, clink=-28, click_b=-7, ratchet_top=-30, rep=-28, whistle=-15, film=-24, yank=-29, crick=-11,
         sour=-17, sad=-16, bang=-12, bang_lo=-12, qpop=-16, stone=-26, bicker=-21, flap=-26, dun=-17, loop=-29)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def low_whoosh(dur=0.5, seed=0, hi=380.0):
    """the air of a big move, all of it under `hi` Hz (it can run under a line; mono)"""
    n = int(dur * SR)
    y = filt(brown(n, seed), "lowpass", hi) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.2
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def flutter(dur=0.32, seed=0, edges=False):
    """little wings beating: a fast train of soft feathery puffs (mono). edges=True: only above 5.2 kHz"""
    n = int(dur * SR)
    t = ar(n)
    y = filt(white(n, seed), "bandpass", (1800, 9000)) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * t)) ** 3
    if edges:
        y = filt(y, "highpass", 5200)
    y = y * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6
    return fade(y / (np.abs(y).max() + 1e-9), 0.005, 0.03)


def chain_jingle(dur=0.22, seed=0, edges=True):
    """a short chain settling: a few bright metal ticks (mono; edges: only above 5.2 kHz)"""
    n = int(dur * SR)
    r = np.random.default_rng(seed)
    y = np.zeros(n)
    for i in range(6):
        j = int(r.uniform(0, dur * 0.8) * SR)
        m = min(n - j, int(0.03 * SR))
        f = r.uniform(4200, 7800)
        y[j:j + m] += np.sin(2 * np.pi * f * ar(m)) * expdecay(m, 0.006) * r.uniform(0.5, 1)
    if edges:
        y = filt(y, "highpass", 5200)
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.02)


def piano_cluster(freqs, dur=0.34, seed=0, bright=1.0):
    """several piano strings at once (mono), cut short so its tail ends before the next word"""
    y = sum(piano(f, dur, seed + i, bright) for i, f in enumerate(freqs))
    return fade(y / (np.abs(y).max() + 1e-9), 0.001, 0.08)


def slam(seed=0):
    """a heavy wooden lid slamming: a low body thump, a sharp crack, the strings inside going BONG (mono, 0.38 s)"""
    n = int(0.38 * SR)
    y = np.zeros(n)
    th = thump(0.38, 140, 48, 0.09, seed)
    y[:len(th)] += 1.2 * th[:n]
    cr = crack(0.08, seed + 1, tau=0.02, hp=700)
    y[:len(cr)] += 0.9 * cr[:n]
    st = piano_cluster([65.4, 98.0, 130.8, 155.6, 196.0], 0.36, seed + 2, 0.6)
    y[:len(st)] += 0.55 * st[:n]
    y = y / (np.abs(y).max() + 1e-9)
    return fade(np.tanh(2.4 * y) / np.tanh(2.4), 0.0008, 0.06)


def gibber_shout(dur=0.26, seed=0, f0=165.0):
    """an old man's indignant 'DID!' with no words (mono; speech band: for a pause)"""
    y = gibber(dur, seed, f0, thin=False, rate=9.0)
    return fade(y / (np.abs(y).max() + 1e-9), 0.005, 0.04)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0):
    for i in range(n):
        bus.add(pan_st(glint(5600 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


# ================================================================= the hook: a fist, the middle finger, the robin
bed.add(pan_st(top_swish(0.22, 1), 0), 0.0, db(G["open"]))                                        # frame 1 moves
bed.add(pan_st(knuckle_crack(2, n=4, spread=0.1, edges=True), -0.1), C["fist"] + 0.02, db(G["crunch_top"]))   # Make a FIST (top)
sfx.add(pan_st(knuckle_crack(3, n=3, spread=0.07, f=1100), -0.1), C["fist_end"] + 0.02, db(G["crunch"]))       # fist. ... crunch
bed.add(pan_st(top_swish(0.3, 4), 0.1), C["lift_m"] + 0.02, db(G["rise"]))                       # the MIDDLE goes up (top)
bed.add(pan_st(flutter(0.45, 5, edges=True), 0.5), C["land"] - 0.5, db(G["flutter"]))            # the robin flies in (top)
sfx.add(pan_st(tweet(6, 3600.0), 0.35), C["finger1_end"] + 0.06, db(G["chirp"]))                # finger? ... cheep (it lands)
sfx.add(pan_st(slide(300, 420, 0.22, vib=0.0), -0.1), C["too_end"] + 0.05, db(G["hmm"]))          # too? ... hm?
sfx.add(pan_st(lock_snap(7), -0.12), C["click"], db(G["click"]))                                  # handcuffed. ... CLICK
sfx.add(pan_st(lock_snap(8), 0.12), C["click"] + 0.09, db(G["click2"]))                           # ... click (the second cuff)
bed.add(pan_st(chain_jingle(0.24, 9), 0), C["click"] + 0.12, db(G["chain"]))

# ================================================================= inside: the camera goes round; glass; the cuffs on the cords
bed.add(pan_st(low_whoosh(0.9, 20), 0), C["drop_m"] + 0.1, db(G["orbit"]))                       # round his hand (low)
bed.add(pan_st(top_swish(0.5, 21), -0.3), C["drop_m"] + 0.3, db(G["orbit"] - 2))                  # ... and its air (top)
bed.add(pan_st(flutter(0.5, 22, edges=True), 0.6), C["drop_m"], db(G["flutter"]))                 # the robin leaves
sparkle(C["glass"] + 0.02, bed, G["glass"], seed=23, n=5, step=0.05)                              # Stuck? the skin turns to glass
bed.add(pan_st(lock_snap(24, edges=True), -0.1), C["cuffed"] + 0.05, db(G["clink"]))              # It's CUFFED (top)
bed.add(pan_st(ratchet(0.5, 14.0, 26.0, 25, edges=True), 0), C["both"] - 0.05, db(G["ratchet_top"]))   # the cord pulls (top)
sfx.add(pan_st(lock_snap(26), 0.15), C["click2_snd"], db(G["click_b"]))                           # sides. ... CLICK (the second pair)
bed.add(pan_st(chain_jingle(0.2, 27), 0.1), C["click2_snd"] + 0.05, db(G["chain"]))

# ================================================================= practice: reps, and the coach's whistle
for k, r in enumerate(C["reps"]):
    bed.add(pan_st(top_swish(0.16, 30 + k), 0.2), r, db(G["rep"]))
    bed.add(pan_st(glint(6400 + 300 * k, 0.07, 33 + k), 0.3), r + 0.12, db(G["rep"]))
sfx.add(pan_st(pea_whistle(0.3, 36, 2950.0), 0.25), C["whistle"], db(G["whistle"]))              # PRACTICE. ... FWEEEP

# ================================================================= the 1830s: the gadget, CRICK, the lid
bed.add(pan_st(top_swish(0.3, 40), 0), SHOT["parlour"] - 0.25, db(G["film"]))                    # into the old film
for k, y in enumerate(C["yanks"]):                                                                # the gadget yanks (top)
    bed.add(pan_st(ratchet(0.14, 30.0, 40.0, 41 + k, edges=True), 0.3), y, db(G["yank"]))
_ck = crack(0.12, 50, tau=0.03, hp=900); _ck = np.tanh(3.2 * _ck / (np.abs(_ck).max() + 1e-9)) / np.tanh(3.2)
sfx.add(pan_st(_ck, 0.1), C["crick"], db(G["crick"]))               # stiff. ... CRICK
sfx.add(pan_st(piano_cluster([311.1, 329.6, 466.2], 0.3, 51, 1.0), -0.1), C["crick"] + 0.12, db(G["sour"]))   # a sour chord
sfx.add(pan_st(piano(392.0, 0.18, 52), -0.2), C["career_end"] + 0.03, db(G["sad"]))               # career: ... plink
sfx.add(pan_st(piano(329.6, 0.2, 53), -0.2), C["career_end"] + 0.2, db(G["sad"] - 1))            # ... plonk
sfx.add(pan_st(slam(54), 0), C["slam"], db(G["bang"]))                                            # over. ... BANG
bed.add(pan_st(low_whoosh(0.35, 55, 160), 0), C["slam"] - 0.02, db(G["bang_lo"]))

# ================================================================= the museum: ?, the historians
sfx.add(pan_st(blip(700, 1500, 0.14, 60, 0.05), 0), C["qmark"] + 0.02, db(G["qpop"]))             # fault? ... boop?
bed.add(pan_st(low_whoosh(0.5, 61, 240), -0.4), C["historians"] - 0.05, db(G["stone"]))          # two plinths rise (low)
bed.add(pan_st(low_whoosh(0.5, 62, 240), 0.4), C["historians"] + 0.12, db(G["stone"]))
sfx.add(pan_st(gibber_shout(0.26, 63, 150.0), -0.45), C["yes2"] + 0.02, db(G["bicker"]))          # argue. ... "DID!"

# ================================================================= the button: the other hand; he sees us
bed.add(pan_st(top_swish(0.25, 70), -0.2), C["now3"] - 0.05, db(G["rise"]))
bed.add(pan_st(flutter(0.5, 71, edges=True), -0.5), C["land2"] - 0.45, db(G["flutter"]))
sfx.add(pan_st(tweet(72, 3400.0), -0.3), C["hand_end"] + 0.05, db(G["chirp"]))                    # hand... cheep
sfx.add(pan_st(pizz(196.0, 0.25, 73), 0), C["hide"], db(G["dun"]))                                # anyone. ... dun!
sfx.add(pan_st(flutter(0.35, 74), 0.4), C["hide"] + 0.12, db(G["flap"]))                          # the robin flaps off
bed.add(pan_st(top_swish(0.18, 75), 0), DUR - 0.42, db(G["loop"]))                               # into the loop

# ================================================================= ambience: one bed per world, gated to its shots
trail_on = gate(N, [(0, SHOT["parlour"] + 0.05), (SHOT["button"] - 0.05, DUR)])
film_on = gate(N, [(SHOT["parlour"], END["lid"])])
hall_on = gate(N, [(SHOT["museum"], END["museum"])])
amb.x += pan_st(filt(pink(N, 80), "lowpass", 420), 0.0) * 0.32 * trail_on                       # mountain wind (low)
amb.x += pan_st(filt(brown(N, 81), "lowpass", 180), 0.2) * 0.4 * trail_on
amb.x += pan_st(projector(N, 82), 0.0) * 0.07 * film_on                                          # the old projector
amb.x += pan_st(filt(brown(N, 83), "lowpass", 220), 0) * 0.3 * film_on
amb.x += pan_st(filt(brown(N, 84), "lowpass", 160), 0) * 0.35 * hall_on                          # the hushed hall
for k, t0 in enumerate((C["stuck_end"] + 0.06,)):                                                # a far bird, in a pause
    bed.add(pan_st(tweet(85 + k, 4200.0), 0.8), t0, db(-34))

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, C["raise"] - 0.03, C["middle_end"] + 0.02, BPM, ["F", "Bb", "C", "F"], gain=-9, seed=10, kick_on=False, snaps=True)   # the test (it stops as the finger goes up)
drone(mus, C["ring"] + 0.3, C["click"] - 0.05, [41, 48, 53], cutoff=420, gain=-21)                                   # came too? ... uh-oh
groove(mus, C["try2"] + 0.05, C["stuck"] - 0.05, BPM, ["Dm", "Bb", "C", "A"], gain=-9, seed=20, snaps=True)           # the retry
groove(mus, C["its"] + 0.08, C["sides_end"] + 0.02, BPM, ["Dm", "Bb", "C", "A"], gain=-10, seed=21, kick_on=False, snaps=True)   # inside
groove(mus, C["perfect"] + 0.05, C["practice"] - 0.05, 128, ["F", "C", "Dm", "Bb"], gain=-8, seed=30, snaps=True, sixteen=True)  # training
rag(mus, C["composer"] + 0.08, C["and"] - 0.06, bpm=132, gain=-10, seed=40, chords=("C", "A7", "D7", "G7"))         # 1830s, on old film
drone(mus, C["the"] + 0.12, C["fault_end"], [38, 45, 50], cutoff=380, gain=-22)                                      # the museum, hushed
groove(mus, C["historians"] + 0.1, C["argue_end"] + 0.02, 116, ["Am", "Dm", "E", "Am"], gain=-11, seed=50, kick_on=False, snaps=True, arp=True)   # the quarrel
groove(mus, C["try3"] + 0.05, C["just3"] - 0.05, BPM, ["F", "Bb", "C", "F"], gain=-9, seed=10, kick_on=False, snaps=True)   # the other hand
silence(mus, [(C["click"] - 0.05, C["try2"] + 0.05),         # handcuffed. CLICK click
              (C["stuck"] - 0.05, C["its"] + 0.08),           # Stuck?
              (C["sides_end"] + 0.02, C["perfect"] + 0.05),   # sides. CLICK
              (C["practice"] - 0.05, C["composer"] + 0.08),   # PRACTICE. FWEEEP
              (C["and"] - 0.06, C["the"] + 0.12),             # and it went stiff. CRICK ... career: ... over. BANG
              (C["hand"] - 0.04, C["hand_end"] + 0.04),       # OTHER hand... (her soft word)
              (C["fault_end"], C["historians"] + 0.1),        # fault? boop?
              (C["argue_end"] + 0.02, C["try3"] + 0.05),      # argue. "DID!"
              (C["just3"] - 0.05, DUR)])                      # just don't point it at anyone. dun! (and the loop: no music either side)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
