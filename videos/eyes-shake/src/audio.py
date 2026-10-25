"""Can You Make Your Eyes SHAKE on Purpose? 👀 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The world: a campfire at night (its rumble and crackle, crickets). The gags: a handbrake's ratchet and CLUNK when the
brake goes on his eyes, a clank at every clamp, the friend's SPROING and BZZZ, a hummingbird, a heart monitor's beep
after "doctor", a sad slide after "Still can't?", and the parents' brakes going CLUNK at the end.
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
WORDS = TL["words"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice

SFX_LEVEL = -13.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(hop=-26, wah=-20, ratchet_top=-24, ratchet=-16, clunk=-9, boing=-19, tug=-25, swish=-25, release=-26, mtick=-24,
         mclank=-24, pop=-27, sproing=-12, bzz=-15, bzz_top=-30, clank=-13, hum_top=-31, chirp=-19, clap=-17, beep=-18,
         frame=-22, sparkle=-20, sad=-17, end_clunk=-11, loop=-27)


def end_of(cue):
    """the end of the word that starts at cue time C[cue]"""
    t0 = C[cue]
    w = min(WORDS, key=lambda w: abs(w["start"] - t0))
    return w["end"]


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def clank(seed=0, edges=False, size=1.0):
    """a brake caliper biting: a hard metal hit (inharmonic partials 1.1-6 kHz) over a short low knock (mono, 0.2 s).
    Soft-clipped so it reads at a sane peak. edges=True keeps only what is above 5.2 kHz (under a word)."""
    n = int(0.2 * SR)
    t = ar(n)
    r = np.random.default_rng(seed)
    y = np.zeros(n)
    for f, a, tau in ((1130, 1.0, 0.05), (2470, 0.7, 0.035), (3910, 0.5, 0.025), (5600, 0.35, 0.015)):
        y += a * np.sin(2 * np.pi * f * (1 + 0.01 * r.standard_normal()) * t) * np.exp(-t / tau)
    y += 0.8 * filt(white(n, seed + 1), "bandpass", (1500, 9000)) * expdecay(n, 0.006)
    y += 0.9 * size * np.sin(2 * np.pi * np.cumsum(95 + 60 * np.exp(-t / 0.02)) / SR) * expdecay(n, 0.04)
    if edges:
        y = filt(y, "highpass", 5200) * 2.0
    y = y / (np.abs(y).max() + 1e-9)
    y = np.tanh(3.0 * y) / np.tanh(3.0)
    return fade(y, 0.0008, 0.04)


def pssht(dur=0.16, seed=0, edges=True):
    """a brake letting go: a short hiss of air (mono). edges=True: only above 5.2 kHz"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200 if edges else 2500) * np.minimum(1, ar(n) / 0.01) * np.exp(-ar(n) / (dur * 0.45))
    return fade(y / (np.abs(y).max() + 1e-9), 0.002, 0.03)


def sproing(dur=0.32, seed=0):
    """a spring flying off: a twangy note that whips up and wobbles (speech band: for a pause; mono)"""
    n = int(dur * SR)
    t = ar(n)
    f = 260 * (1 + 2.4 * (1 - np.exp(-t / 0.08))) * (1 + 0.12 * np.sin(2 * np.pi * 14 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * np.exp(-t / (dur * 0.5))
    y = y / (np.abs(y).max() + 1e-9)
    return fade(np.tanh(1.6 * y), 0.002, 0.05)


def eye_bzz(dur, seed=0, rate=15.0):
    """the friend's eyes buzzing: a tight mechanical buzz pulsing `rate` times a second (speech band: for a pause)"""
    n = int(dur * SR)
    y = buzz(n, 172.0, seed, flutter=0.3)
    am = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * rate * ar(n)))
    return fade(y * am, 0.01, 0.04)


def eye_bzz_top(dur, seed=0, rate=15.0):
    """the same buzz heard under a line: only above 5.2 kHz"""
    return buzz_hi(dur, rate, seed)


def heart_beep(f=2550.0):
    """a heart monitor's beep (0.09 s; speech band: for a pause)"""
    n = int(0.09 * SR)
    y = np.sin(2 * np.pi * f * ar(n)) * np.minimum(1, ar(n) / 0.004) * np.minimum(1, (0.09 - ar(n)) / 0.01)
    return y * 0.8


def clap2(seed=0):
    """one hand clap (mono): a short band of noise with a little room"""
    n = int(0.09 * SR)
    y = filt(white(n, seed), "bandpass", (900, 6000)) * expdecay(n, 0.012)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0005, 0.02)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0):
    for i in range(n):
        bus.add(pan_st(glint(5600 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


# ================================================================= the hook: his slow hops; Can't?; the parking brake
for k, th in enumerate(C["hops"]):                                       # every hop: a tiny dry tick (top only: on words)
    bed.add(pan_st(glint(7000 - 350 * (k % 3), 0.05, 10 + k), 0.4 * (-1) ** k), th + 0.02, db(G["hop"]))
sfx.add(pan_st(slide(330, 230, 0.24, vib=0.0), 0), C["cant_end"] + 0.05, db(G["wah"]))            # Can't? ... nuh-uh
bed.add(pan_st(ratchet(0.42, 12.0, 30.0, 20, edges=True), 0), C["parking"] + 0.02, db(G["ratchet_top"]))   # the handbrake: krrrk (top)
sfx.add(pan_st(ratchet(0.12, 30.0, 40.0, 21), 0.1), C["brake_end"] + 0.01, db(G["ratchet"]))      # BRAKE. ... krk
sfx.add(pan_st(clank(22, size=1.3), 0), C["brake_end"] + 0.1, db(G["clunk"]))                    # ...CLUNK (on both eyes)
sfx.add(pan_st(boing(0.26, 210.0, 23), 0), C["little_end"] + 0.03, db(G["boing"]))              # a little... boi-oing (crossed)
for k, g in enumerate(C["tugs"]):                                        # and try again: yank, clank (top only)
    bed.add(pan_st(clank(30 + k, edges=True), 0.3 * (-1) ** k), g + 0.06, db(G["tug"]))
bed.add(pan_st(top_swish(0.34, 35), 0), SHOT["macro"] - 0.3, db(G["swish"]))                      # into his eye

# ================================================================= his eye up close: release, jump, clamp
for k, h in enumerate(C["mhops"]):
    bed.add(pan_st(pssht(0.14, 40 + k), 0), h - 0.15, db(G["release"]))
    bed.add(pan_st(glint(6600, 0.06, 43 + k), 0.4 * (-1) ** k), h + 0.01, db(G["mtick"]))
    bed.add(pan_st(clank(46 + k, edges=True), 0), h + 0.1, db(G["mclank"]))
sfx.add(pan_st(clank(49, size=0.9), 0), C["jumps_end"] + 0.02, db(G["clank"] - 4))                # jumps, ... clank (the pause)

# ================================================================= the friend: one in twelve; let go; SPROING; BZZZ
for i in range(12):                                                       # the twelve faces pop in (top only)
    bed.add(pan_st(glint(5400 + 160 * i, 0.05, 60 + i), -0.6 + 0.11 * i), C["about"] + (C["twelve"] + 0.3 - C["about"]) * i / 12, db(G["pop"]))
sparkle(C["twelve"] + 0.12, bed, G["pop"] + 3, seed=75, n=3)             # ...and the one who can glows
sfx.add(pan_st(sproing(0.3, 80), 0.25), C["go_end"] - 0.02, db(G["sproing"]))                     # go... SPROING (the brake flies off)
sfx.add(pan_st(eye_bzz(0.27, 81), 0), C["buzz_on"], db(G["bzz"]))                                  # ...BZZZ (his eyes shake)
bed.add(pan_st(eye_bzz_top(SHOT["buzz"] - C["buzz_on"] + 0.05, 82), 0.3), C["buzz_on"] + 0.25, db(G["bzz_top"]))   # still buzzing, under the words

# ================================================================= he copies: back... and forth, CLANK
for k, g in enumerate(C["chops"]):
    bed.add(pan_st(pssht(0.12, 90 + k), 0), g - 0.12, db(G["release"]))
    bed.add(pan_st(clank(92 + k, edges=True), 0), g + 0.12, db(G["mclank"]))
sfx.add(pan_st(clank(95, size=1.1), -0.1), C["forth_end"] + 0.02, db(G["clank"]))                 # forth, ... CLANK

# ================================================================= his friend's eyes, close; a hummingbird
bed.add(pan_st(eye_bzz_top(END["buzz"] - SHOT["buzz"], 100), 0), SHOT["buzz"], db(G["bzz_top"]))
bed.add(pan_st(buzz_hi(END["buzz"] - C["fifteen"] + 0.2, 52.0, 101), -0.5), C["fifteen"] - 0.25, db(G["hum_top"]))   # the bird's wings
sfx.add(pan_st(tweet(102, 3600.0), -0.4), C["second_end"] + 0.06, db(G["chirp"]))                 # second. ... chirp! (impressed)

# ================================================================= harmless: a party trick; on their own: a doctor
sfx.add(pan_st(eye_bzz(0.22, 110), 0.3), C["harmless_end"] + 0.04, db(G["bzz"] - 3))                # Harmless... bzz (the trick)
for k in range(2):                                                         # ...and he claps
    sfx.add(pan_st(clap2(111 + k), -0.3), C["harmless_end"] + 0.12 + 0.09 * k, db(G["clap"]))
for k in range(2):                                                         # doctor. ... beep, beep
    sfx.add(pan_st(heart_beep(), 0), C["doctor_end"] + 0.05 + 0.17 * k, db(G["beep"]))

# ================================================================= families: the photo goes up
bed.add(pan_st(top_swish(0.2, 120), 0), C["canyou"] + 0.05, db(G["swish"]))
bed.add(pan_st(glass_tink(121, 3100.0), 0.0), C["you_end"] + 0.03 if "you_end" in C else C["ask"] - 0.25, db(G["frame"]))
bed.add(pan_st(eye_bzz_top(C["families_end"] - C["ask"] + 0.2, 122, 15.0), -0.2), C["ask"], db(G["bzz_top"]))
sparkle(C["families_end"] + 0.04, sfx, G["sparkle"], seed=123, n=4)

# ================================================================= the button: Still can't? ... Blame your parents. CLUNK
sfx.add(pan_st(slide(300, 210, 0.32, vib=5.0), 0), C["cant2_end"] + 0.04, db(G["sad"]))            # can't? ... wah-waah
bed.add(pan_st(top_swish(0.3, 130), 0), C["parents"] - 0.1, db(G["swish"]))                        # the push into the photo
sfx.add(pan_st(clank(131, size=1.2), -0.15), C["parents_end"] + 0.06, db(G["end_clunk"]))          # parents. ... CLUNK
sfx.add(pan_st(clank(132, size=1.0), 0.15), C["parents_end"] + 0.2, db(G["end_clunk"] - 4))        # ...clunk (both of them)
bed.add(pan_st(top_swish(0.18, 133), 0), DUR - 0.42, db(G["loop"]))                                # into the loop

# ================================================================= ambience: the campfire at night (all shots but the eye up close)
camp_on = gate(N, [(0, SHOT["macro"] + 0.1), (SHOT["friend"] - 0.05, DUR)])
eye_on = gate(N, [(SHOT["macro"], END["macro"])])
amb.x += pan_st(fire_rumble(DUR, 140, top=240.0), 0.35) * 0.55 * camp_on                         # the fire, low (and its crackle up top)
amb.x += pan_st(fire_rumble(DUR, 141, top=160.0), 0.0) * 0.35 * eye_on                           # inside the close-up: only the low
amb.x += pan_st(filt(brown(N, 142), "lowpass", 200), 0) * 0.25                                    # night air
crickets(0.3, DUR - 0.2, bed, -33, seed=143, f=4700, rate=0.9)

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.24, C["cant"] - 0.05, BPM, ["F", "Dm"], gain=-9, seed=10, kick_on=False, snaps=True)            # the effort
groove(mus, C["your2"] + 0.05, C["parking"] - 0.02, BPM, ["Bb", "C"], gain=-10, seed=11, kick_on=False, snaps=True)
groove(mus, C["cross"] + 0.1, C["about"] - 0.05, BPM, ["Dm", "Bb", "C", "A"], gain=-9, seed=20, snaps=True)      # the mechanism
groove(mus, C["one"] + 0.05, C["let"], BPM, ["F", "C"], gain=-10, seed=30, kick_on=False, snaps=True)
groove(mus, C["back"] + 0.05, C["harmless"] - 0.05, BPM, ["F", "Bb", "C", "F"], gain=-9, seed=40, snaps=True, sixteen=True)   # the buzz
drone(mus, C["unless"] + 0.05, C["then"], [41, 48, 51, 56], cutoff=520, gain=-19)                                  # on their own: a worry
groove(mus, C["ask"] + 0.05, C["still"] - 0.05, BPM, ["F", "Dm", "Bb", "C"], gain=-9, seed=50, kick_on=False, snaps=True)
groove(mus, C["blame"] + 0.05, DUR, BPM, ["F", "Dm"], gain=-9, seed=10, kick_on=False, snaps=True)                  # into the loop: the hook's groove
silence(mus, [(C["cant"] - 0.05, C["your2"] + 0.05),        # Can't? ... nuh-uh
              (C["parking"] - 0.02, C["cross"] + 0.1),      # parking BRAKE. krk CLUNK
              (C["let"], C["back"] + 0.05),                 # let go... SPROING BZZZ
              (C["harmless"] - 0.05, C["unless"] + 0.05),   # Harmless... bzz, clap clap
              (C["then"], C["ask"] + 0.05),                 # Then, doctor. beep beep
              (C["still"] - 0.05, C["blame"] + 0.05),       # Still can't? wah-waah
              (C["parents_end"] + 0.02, C["parents_end"] + 0.42)])   # parents. CLUNK clunk

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
