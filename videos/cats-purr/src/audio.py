"""Why Do Cats PURR? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

This Short is about a sound, so the sound explains: the purr is a train of soft knocks, about 25 a second, that never
stops for breath (a little faster and brighter on the way in). Its body (under 330 Hz) hums under the words; its
rattle (260-1100 Hz, what a phone speaker plays) comes up in every pause while she purrs. It stops dead on "Maybe".
The cry inside the hungry purr is heard in the pauses of that line, and alone after "baby's."
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


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


# where nobody is speaking: 1 in the pauses (from 0.03 s after a word to 0.09 s before the next), 0 under words
def pause_mask(lead=0.03, tail=0.12, ramp=0.03):
    m = np.ones(N)
    for w in WORDS:
        m[max(0, int((w["start"] - tail) * SR)):int((w["end"] + lead) * SR)] = 0
    k = max(1, int(ramp * SR))
    return np.convolve(m, np.ones(k) / k, "same")


PAUSE = pause_mask()


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))


def cut(t, seed, gain=-20.0, f0=400, f1=2200, top=2600):
    """the whoosh into a cut: kept dull, so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def air(t0, t1, gain, seed, shape=None, pan=0.0):
    """fingers in fur, a breath through the pipe: it can run under words, because it is only above 5.2 kHz"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(filt(white(n, seed), "highpass", 5200, 4) * env, 0.004, 0.03), pan), t0, db(gain))


def purr_parts(dur, seed=0, rate=25.0, small=False, t0=0.0):
    """A purr, as two tracks: (body, rattle). A train of soft knocks, `rate` a second, that breathes: in (0.55 s, a
    little faster and brighter), out (0.7 s). body = 70-330 Hz (it can hum under words); rattle = 260-1100 Hz (what a
    phone speaker plays: for the pauses). small=True: a kitten (higher, thinner)."""
    n = int(dur * SR)
    t = ar(n) + t0
    cyc = 1.25 if not small else 0.8
    ph = (t % cyc) / cyc
    inn = ph < 0.44
    r = np.where(inn, rate * 1.06, rate * 0.94)
    saw = (np.cumsum(r) / SR) % 1.0                                   # 0..1 inside each knock
    knock = np.exp(-saw / 0.22) * np.minimum(1, saw / 0.03)
    turn = 1 - 0.55 * np.exp(-((ph - 0.44) / 0.035) ** 2) - 0.55 * np.exp(-(np.minimum(ph, 1 - ph) / 0.035) ** 2)   # a dip where the breath turns
    lvl = np.where(inn, 1.0, 0.8) * turn
    body = norm(filt(brown(n, seed), "bandpass", [70, 330] if not small else [160, 420])) * knock * lvl
    rattle = norm(filt(white(n, seed + 3), "bandpass", [260, 1100] if not small else [520, 1900])) * knock * lvl * np.where(inn, 1.0, 0.7)
    return norm(body), norm(rattle)


def purr_span(t0, t1, g_body, g_rattle, seed, rate=25.0, small=False, pan=0.0, under=0.0):
    """she purrs from t0 to t1: the body on the bed bus all the way, the rattle on the sfx bus in the pauses
    (`under` = how much of the rattle stays under the words, 0..1)"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    body, rattle = purr_parts(t1 - t0, seed, rate, small, t0)
    i0 = int(t0 * SR)
    pm = PAUSE[i0:i0 + n]
    pm = np.pad(pm, (0, n - len(pm)))
    bed.add(pan_st(fade(body, 0.05, 0.05), pan), t0, db(g_body))
    sfx.add(pan_st(fade(rattle * (under + (1 - under) * pm), 0.05, 0.04), pan), t0, db(g_rattle))


COUCH_EVE = ("hook", "loop")
COUCH_NIGHT = ("weird", "button")

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
amb.x += pan_st(room, 0) * 0.26 * gate(N, on(*COUCH_EVE))                            # the living room, evening
amb.x += pan_st(room, 0) * 0.2 * gate(N, on(*COUCH_NIGHT))                           # ... and at five in the morning
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.25 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.4 * gate(N, on("mech"))                               # inside her throat: muffled, a slow pulse
nest = norm(filt(brown(N, 6), "lowpass", 200))
amb.x += pan_st(nest, 0) * 0.2 * gate(N, on("kittens"))
vet = norm(filt(pink(N, 8), "bandpass", [90, 380]) + 0.5 * np.sin(2 * np.pi * 100 * tt) * 0.2)
amb.x += pan_st(vet, 0) * 0.24 * gate(N, on("hurt"))                                 # the vet's: a strip light's hum
crickets(SHOT["weird"] + 0.05, c["she2"] - 0.1, amb, db(-22), 7, 4700, 1.5)          # the small hours

# ================================================================= 1. hook: his fingers, her purr, "Maybe"
air(0.0, c["maybe"], -21, 2, lambda u: (0.35 + 0.65 * np.abs(np.sin(u * c["maybe"] * 10.5)) ** 2))   # fingers in fur (above the words)
chirp = meow(0.13, 520.0, 760.0, 700.0, 3)
sfx.add(pan_st(fade(chirp, 0.005, 0.04), 0.1), 0.0, db(-17))                          # "mrrp": she likes it (over before "You")
purr_span(c["purrs"] - 0.02, c["maybe"] - 0.03, -9, -9, 11)                           # the purr: under the words, up in the pauses
low_thud(c["maybe"] - 0.02, -15, 95.0, 0.2, 0.06)                                    # ... and it stops dead
purr_span(c["but"] + 0.12, c["dive"] + 0.1, -11, -13, 12, under=0.0)                  # it starts again, softer
hi_tick(c["look"], -13, 4, 0.2)                                                      # her eyes go huge: a glint
hi_tick(c["look"] + 0.09, -15, 5, -0.2)
low_thud(c["me"] + 0.02, -17, 210.0, 0.14, 0.05)                                     # a paw on his chest
cut(SHOT["mech"] + 0.04, 20, -18, 300, 1500, 1900)                                   # into her throat

# ================================================================= 2. mech: the voice box, 25 times a second, in and out
purr_span(SHOT["mech"] + 0.05, END["mech"] - 0.02, -8, -10, 21, rate=25.0)            # the same purr, from inside
hi_tick(c["box"], -14, 22, 0.3)                                                      # the label
flt = ratchet(c["flutters_end"] - c["flutters"] + 0.05, 25.0, 25.0, 23, True)        # the folds, on "flutters" (above the words)
bed.add(pan_st(fade(flt, 0.004, 0.03), 0), c["flutters"], db(-14))
low_thud(c["n25"], -11, 120.0, 0.3, 0.1)                                             # 25x
hi_tick(c["n25"], -12, 24, 0.3)
hi_tick(c["second"], -15, 25, 0.3)
air(c["in"] - 0.1, c["and"], -15, 26, lambda u: u ** 0.7)                            # the breath goes down ...
br_in = breath(0.26, 27)
sfx.add(pan_st(fade(filt(br_in, "highpass", 700), 0.01, 0.06), -0.2), c["in_end"] + 0.03, db(-19))   # (heard, in the pause after "in")
air(c["out"] - 0.05, END["mech"], -15, 28, lambda u: (1 - u) ** 0.7)                 # ... and comes back up
br_out = breath(0.24, 29, True)
sfx.add(pan_st(fade(filt(br_out, "highpass", 500), 0.01, 0.06), 0.2), c["out_end"] + 0.03, db(-19))

# ================================================================= 3. kittens: three small motors
cut(SHOT["kittens"] + 0.02, 30, -22, 400, 1800, 2200)
for i, pn in enumerate((-0.45, 0.0, 0.4)):
    purr_span(SHOT["kittens"] + 0.06 + 0.05 * i, END["kittens"] - 0.03, -15, -15, 31 + i, rate=29.0 + 2 * i, small=True, pan=pn)
purr_span(SHOT["kittens"] + 0.06, END["kittens"] - 0.03, -15, -19, 35, rate=24.0, pan=0.3)       # their mother, behind them
hi_tick(c["days"], -14, 36, -0.3)                                                    # the tag
mw = meow(0.2, 980.0, 1500.0, 1150.0, 37)
sfx.add(pan_st(fade(mw, 0.006, 0.05), -0.1), c["mew"], db(-13))                       # mew! (in the pause after "shut.")

# ================================================================= 4. hurt: the same purr, at the vet's
cut(SHOT["hurt"] + 0.02, 40, -22, 400, 1800, 2200)
purr_span(SHOT["hurt"] + 0.05, END["hurt"] - 0.02, -9, -10, 41)
sfx.add(pan_st(filt(whoosh(0.4, 900, 240, 42, 0.6), "lowpass", 1400), 0), c["or"] - 0.16, db(-20))   # the camera lets go
low_thud(c["hurt"], -12, 85.0, 0.36, 0.12)                                           # the cone, the table, the vet
hi_tick(c["hurt"] + 0.02, -14, 43, 0.3)

# ================================================================= 5. weird: five in the morning
cut(SHOT["weird"] - 0.06, 50, -26, 300, 1300, 1600)
sn2 = snore(0.2, 52, 70.0)
sfx.add(pan_st(filt(sn2, "lowpass", 900) + 0.5 * fade(filt(white(len(sn2), 53), "bandpass", [500, 1400]) * np.sin(np.pi * np.linspace(0, 1, len(sn2))) ** 2, 0.01, 0.05), -0.3), c["hungry_end"] + 0.03, db(-13))   # he snores, in the pause after "hungry?"
purr_span(c["she2"] - 0.08, c["wah"] - 0.02, -10, -11, 54)                            # right in his ear
hi_tick(c["she2"] - 0.05, -15, 55, -0.4)                                             # the strip slides in
# the cry inside it: a thin "mrreee" that rides the purr. Under the words only its top (above 5 kHz); in the pauses the cry itself
cry_len = c["wah"] - c["acry"]
nc = int(cry_len * SR)
uu = np.linspace(0, 1, nc)
fcry = 400.0 * (1 + 0.06 * np.sin(2 * np.pi * 5.5 * ar(nc))) * (1 + 0.12 * np.sin(2 * np.pi * 0.8 * ar(nc)))
phc = 2 * np.pi * np.cumsum(fcry) / SR
cry = sum(np.sin(k * phc) / k for k in range(1, 14))
cry = norm(svf_bp(cry, 1100 + 300 * np.sin(2 * np.pi * 0.9 * ar(nc)), 0.3) + 0.5 * svf_bp(cry, np.full(nc, 2600.0), 0.3))
i0 = int(c["acry"] * SR)
pmc = np.pad(PAUSE[i0:i0 + nc], (0, max(0, nc - len(PAUSE[i0:i0 + nc]))))
sfx.add(pan_st(fade(cry * pmc * np.minimum(1, uu * 6), 0.03, 0.03), 0.15), c["acry"], db(-17))
bed.add(pan_st(fade(filt(cry, "highpass", 5200, 4) * 6, 0.03, 0.03), 0.15), c["acry"], db(-22))
hi_tick(c["acry"], -13, 56, 0.2)                                                     # the thin line lights up
hi_tick(c["pitched"] - 0.05, -15, 57, 0.4)                                           # the second strip
hi_tick(c["babys"], -13, 58, 0.3)
wah = norm(0.6 * baby_cry(0.44, 59, 470.0, 0.35) + 0.6 * np.pad(meow(0.4, 430.0, 560.0, 380.0, 60), (0, int(0.04 * SR))))
sfx.add(pan_st(fade(wah, 0.008, 0.07), 0.2), c["wah"], db(-9))                        # the cry, alone (after "baby's."): his eyes fly open
low_thud(c["wah"] + 0.02, -13, 80.0, 0.3, 0.1, sfx)

# ================================================================= 6. button: breakfast is served
cut(SHOT["button"] + 0.02, 70, -23, 300, 1400, 1800)
tk = glass_tink(71, 2300.0, 0.14)
sfx.add(pan_st(fade(tk, 0.0005, 0.03), 0.3), c["serve"] + 0.06, db(-17))              # the bowl comes up (in the pause after "cat.")
low_thud(c["serve"] + 0.02, -17, 170.0, 0.16, 0.05, sfx)
hi_tick(c["staff"], -13, 72, -0.2)                                                   # the bow tie ...
hi_tick(c["staff"] + 0.08, -13, 73, 0.4)                                             # ... and the crown
for i, (m, dt) in enumerate(((77, 0.0), (84, 0.13))):                                # ta-da: two notes, after "staff."
    sfx.add(pan_st(fade(marimba(mtof(m), 0.3, 74 + i, 1.1), 0.002, 0.08), 0.2), c["fanfare"] + dt, db(-17))
purr_span(c["munch"] - 0.05, c["loop"] - 0.02, -10, -11, 75)                          # she eats, and purrs
for i, dt in enumerate((0.0, 0.2, 0.4)):
    sfx.add(pan_st(fade(chomp(76 + i), 0.001, 0.02), 0.3), c["munch"] + dt, db(-19))
cut(c["loop"] + 0.03, 77, -24, 400, 1600, 2000)                                      # back to the evening

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is silent (nobody says "subscribe", 9 Oct 2026) and plays under the button line, so
# these three sounds sit under spoken words. Nothing here may mask one (qa.py lists weak words).
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-25))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-27))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-21))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-32))

# ================================================================= score (drops out for every punchline)
BPM = 104
# the evening: a cosy pizzicato groove. It starts after "You", and stops dead with the purr on "Maybe"
groove(mus, 0.34, c["maybe"] - 0.06, BPM, ["F", "Bb"], gain=-5, seed=10, kick_on=False)
# ... comes back under "scientists think", and gets out of the way of "look after me"
groove(mus, c["sci"] + 0.05, c["look"] - 0.12, BPM, ["Dm", "Bb"], gain=-7, seed=11, kick_on=False, snaps=False)
# inside: a curious minor loop
groove(mus, c["voice"], END["mech"] - 0.1, 112, ["Dm", "Gm", "Dm", "A"], gain=-12, seed=12, kick_on=False)
# the basket: a lullaby's worth of pad and a slow arpeggio
groove(mus, c["kittens"] + 0.3, c["shut_end"] - 0.05, 80, ["F", "C"], gain=-6, seed=13, kick_on=False, snaps=False, bass=False, cutoff=1000)
# the vet's: the groove again ... until the camera lets go
groove(mus, c["grown"] + 0.3, c["or"] - 0.2, BPM, ["F", "Bb"], gain=-7, seed=14, kick_on=False)
# five in the morning: a sneaky walk (bass and snaps only)
groove(mus, c["hungry"] + 0.1, c["babys_end"] - 0.05, 96, ["Dm", "A"], gain=-6, seed=15, arp=False, padv=False, kick_on=False)
# the button: nothing under the line; a last chord after the fanfare, gone before the loop
drone(mus, c["fanfare"] + 0.3, c["loop"] - 0.05, [53, 57, 60, 65], cutoff=700, gain=-27, seed=16, swell=0.25)
silence(mus, [(c["maybe"] - 0.05, c["sci"]), (c["look"] - 0.1, c["voice"] - 0.02), (c["or"] - 0.18, c["hungry"]), (c["wah"] - 0.3, c["fanfare"] + 0.25), (c["loop"] - 0.03, DUR)])

# ================================================================= voice + mix
# "me." is the last word of the answer and the faintest in the take (its vowel sits under the speech band: -37 dB there
# against a median of -25, on every one of six takes and three wordings): it comes up 4.5 dB, with soft edges
LIFTS = [(c["me"] - 0.03, c["me_end"] + 0.05, 4.5)]


def lift(vo):
    g = np.ones(len(vo))
    for a, b, d in LIFTS:
        i0, i1 = int(a * SR), int(b * SR)
        k = int(0.04 * SR)
        w = np.ones(i1 - i0)
        w[:k] = np.linspace(0, 1, k)
        w[-k:] = np.linspace(1, 0, k)
        g[i0:i1] += (db(d) - 1) * w
    return vo * g


master(WORK, sfx, bed, mus, amb, voice_fx=lift)
