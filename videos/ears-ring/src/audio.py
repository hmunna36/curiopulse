"""Why Do Your Ears RING After a Concert? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The band carries the hook: drums and distorted power chords on the beat his head bangs to, a crowd under it, and the
last chord cut dead before "and now". Then the ring: a thin sine high above the speech band (6.3 kHz), quiet under the
words and clear in the pauses; it climbs with the brain's volume knob and comes back out of the amp ("That's the ring")
and over each head in the silent room. The silent room really is silent (no score). Every joke sound has a pause of
the narration to itself: the finger squelch after "RINGING.", the feedback squeal after "ELEVEN.", the two taps on the
glass after "DOWN?", the static after "static.", the sad slide after "die.", the cluck after "theirs.", the earplug
squish after "earplugs...". The band kicks in again after "a chicken." on the grid that lands on frame 1 (the loop).
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
P = c["beat_p"]


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.3, tau=0.1, bus=None):
    """a knock that can sit under a word: almost all of it under 200 Hz (8 dB under the gain given: a low thump's peak
    is far louder than it sounds, and the sfx bus is scaled to its loudest peak)"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain - 8))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def cut(t, seed, gain=-22.0, f0=300, f1=1500, top=1800):
    """the whoosh into a cut, kept dull so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


def sparkle(t0, t1, gain, seed, rate=9.0):
    """tiny glass notes above 5 kHz: they can sit on words"""
    r = np.random.default_rng(seed)
    t = t0
    while t < t1:
        bed.add(pan_st(glint(r.uniform(5400, 8200), 0.08, int(r.integers(0, 999))), r.uniform(-0.5, 0.5)), t, db(gain + r.uniform(-3, 0)))
        t += r.exponential(1 / rate)


def ring_tone(t0, t1, f, gain, rise=0.06, fall=0.08, curve=None, pan=0.0):
    """the ring: a thin sine with a slow beat on it, high above the speech band (it can run under words)"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    u = ar(n)
    y = np.sin(2 * np.pi * f * u) + 0.35 * np.sin(2 * np.pi * f * 1.0021 * u + 1.3)
    env = np.minimum(1, u / rise) * np.minimum(1, (u[-1] - u) / fall)
    if curve is not None:
        env = env * curve(t0 + u)
    sfx.add(pan_st(y * env * 0.5, pan), t0, db(gain))


# ================================================================= the band
def power_chord(root, dur, mute=True, seed=0):
    """a distorted power chord (root, fifth, octave); mute = a short palm-muted chug"""
    n = int(dur * SR)
    y = saw(mtof(root), n, 0.0, seed) + saw(mtof(root + 7), n, 0.003, seed + 1) + 0.7 * saw(mtof(root + 12), n, -0.002, seed + 2)
    y = np.tanh(3.2 * y / (np.abs(y).max() + 1e-9))
    y = y * attack_decay(n, 0.003, 0.085 if mute else 0.5)
    y = filt(filt(y, "lowpass", 1900, 2), "highpass", 90)
    return fade(y, 0.002, 0.02)


def bass_note(root, dur, seed=0):
    n = int(dur * SR)
    y = saw(mtof(root - 12), n, 0.0, seed)
    return fade(filt(np.tanh(1.6 * y) * attack_decay(n, 0.004, 0.16), "lowpass", 320, 2), 0.002, 0.02)


RIFF = [40, 40, 43, 45]   # E, E, G, A: one root a beat


def band(times, gain, crash_at=(), seed=0, gtr=-6.0):
    """drums and guitars on the beats given (a beat each); the head bangs on every one"""
    for i, tb in enumerate(times):
        r = RIFF[i % len(RIFF)]
        mus.add(kick(), tb, db(gain - 2))
        if i % 2 == 1:
            mus.add(snare(seed + i, 0.2), tb, db(gain - 3), pan=0.1)
        for h in (0.0, 0.5):
            mus.add(hat(seed * 7 + i * 2 + int(h * 2)), tb + h * P, db(gain - 17), pan=-0.3)
            mus.add(pan_st(power_chord(r, 0.2, True, seed + 10 * i + int(h * 2)), -0.25), tb + h * P, db(gain + gtr))
            mus.add(pan_st(power_chord(r, 0.2, True, seed + 10 * i + int(h * 2) + 5), 0.25), tb + h * P + 0.008, db(gain + gtr - 1))
        mus.add(pan_st(bass_note(r, 0.36, seed + i), 0), tb, db(gain - 4))
    for t in crash_at:
        mus.add(cymbal(seed + 3, 1.2), t, db(gain - 8), pan=0.3)


# the hook: four beats from frame 1, then the last chord on the fifth, cut dead
band(c["beats"], -12.0, crash_at=(0.0,), seed=1, gtr=-11.0)
ts = c["stop"]
mus.add(kick(), ts, db(-12))
mus.add(cymbal(9, 0.5), ts, db(-20), pan=-0.2)
for sd, pn in ((0, -0.3), (5, 0.3)):
    mus.add(pan_st(fade(power_chord(40, 0.1, False, 50 + sd), 0.002, 0.03), pn), ts, db(-16))
mus.add(pan_st(fade(bass_note(40, 0.1, 55), 0.002, 0.03), 0), ts, db(-14))
# the end: the band kicks in after "a chicken." on the grid that lands on frame 1 (the loop)
band(c["beats_end"], -13.0, crash_at=(c["beats_end"][0],), seed=2)

# the crowd under the band (low, so the first words stay clear), gone with the last chord
crowd = norm(filt(pink(N, 5), "bandpass", [220, 900]) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * tt) ** 2))
amb.x += pan_st(crowd, 0) * 0.32 * gate(N, [(0, ts + 0.04), (c["bang"], DUR)], 0.03)

# ================================================================= ambience (one bed per world, gated to its shots)
hall = norm(filt(brown(N, 7), "lowpass", 260))
amb.x += pan_st(hall, 0) * 0.16 * gate(N, [(ts + 0.05, END["hook"]), (SHOT["button"], DUR)])          # the hall after the show
inside = norm(filt(pink(N, 4), "bandpass", [40, 220]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.6 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.42 * gate(N, on("cells", "fades"))                                     # inside the ear: muffled liquid
hum = sum(np.sin(2 * np.pi * 60 * k * tt) / k for k in (1, 2, 3)) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * tt))
amb.x += pan_st(norm(filt(hum, "lowpass", 260)), 0) * 0.2 * gate(N, on("amp"))                     # the amp's hum
amb.x += pan_st(norm(filt(brown(N, 8), "lowpass", 160)), 0) * 0.05 * gate(N, on("proof"))         # a dead room: almost nothing
crickets(SHOT["chicken"], END["chicken"], bed, db(-30), 3, 4900, 1.2)                                     # the farmyard at night

# ================================================================= 1. hook: the last chord, silence, the ring
ring_curve = lambda t: (0.55 + 0.45 * np.clip((t - c["cranking"]) / (c["eleven"] - c["cranking"]), 0, 1)) * (1 + 0.6 * (t > c["eleven"]))
ring_tone(c["ringing"] - 0.04, END["hook"], 6300.0, -21.0, 0.08, 0.04, ring_curve)
sfx.add(pan_st(fade(squelch(0.24, 3), 0.004, 0.04), -0.4), c["poke"] + 0.02, db(-17))       # a finger in his ear (after "RINGING.")
hi_tick(c["ears2"] + 0.14, -15, 4, -0.3)                                                       # EARS gets struck out
low_thud(c["brain1"] - 0.08, -15, 190.0, 0.14, 0.05)                                           # the window on his head pops open
bed.add(pan_st(glint(6900, 0.14, 5), 0.0), c["brain1"] - 0.06, db(-14))
bed.add(pan_st(ratchet(c["to"] - c["cranking"] - 0.1, 14.0, 34.0, 6, True), 0.2), c["cranking"] + 0.12, db(-15))   # the knob turns (above the words)
low_thud(c["eleven"], -11, 110.0, 0.3, 0.1)                                                     # past 10, to 11 (low, under the word)
hi_tick(c["eleven"], -12, 7, 0.2)
fb = slide(1900, 3300, 0.3, vib=0.04, harm=3)
sfx.add(pan_st(fade(fb, 0.01, 0.06), 0.15), c["eleven_end"] + 0.03, db(-23))                   # guitar feedback (after "ELEVEN.")

# ================================================================= 2. cells: the music slams the hairs flat
cut(SHOT["cells"] + 0.02, 10, -24)
for i, s in enumerate(c["slams"]):
    bed.add(pan_st(filt(whoosh(0.42, 120, 520, 11 + i, 0.9), "lowpass", 320), 0), s - 0.42, db(-13))   # the wave coming (low)
    low_thud(s, -8 - 2 * i, 80.0 + 12 * i, 0.4, 0.12)                                               # the slam (low, under the words)
    hi_tick(s, -13, 12 + i, (-0.3, 0.3, 0.0)[i])
bed.add(pan_st(buzz_hi(c["through_end"] - c["less"], 22.0, 13), 0.2) * 1.0, c["less"], db(-25))     # the signal thins (above the words)

# ================================================================= 3. amp: who turned it down? the crank, the static, the ring
cut(SHOT["amp"] + 0.02, 14, -25)
for i, tp in enumerate(c["tap"]):
    sfx.add(pan_st(glass_tink(15 + i, 2700.0 + 200 * i, 0.12), 0.25), tp, db(-17))                   # tap tap (after "DOWN?")
bed.add(pan_st(ratchet(c["knob_end"] - c["cranks"], 12.0, 40.0, 16, True), 0.3), c["cranks"], db(-14))   # the crank (above the words)
low_thud(c["knob_end"], -11, 100.0, 0.34, 0.12)                                                 # the knob hits 11
bed.add(pan_st(filt(white(int((c["static_end"] - c["hears"]) * SR), 17), "highpass", 5600) * np.linspace(0.2, 1, int((c["static_end"] - c["hears"]) * SR)), 0), c["hears"], db(-22))   # the hiss (above the words)
sfx.add(pan_st(fade(tv_static(c["thats"] - c["static_end"] - 0.12, 18), 0.01, 0.05), 0), c["static_end"] + 0.02, db(-21))   # STATIC (after "static.")
ring_tone(c["ring2"] - 0.06, END["amp"], 6300.0, -19.5, 0.05, 0.06)

# ================================================================= 4. proof: a dead-silent room, then a ring over each head
cut(SHOT["proof"] + 0.02, 19, -27)
hi_tick(c["silent"], -16, 20, 0.0)                                                             # the sign lights up
low_thud(c["most"] - 0.04, -15, 170.0, 0.14, 0.05)                                              # 94% (low)
bed.add(pan_st(glint(7200, 0.12, 21), 0.0), c["most"] - 0.03, db(-15))
for i, (t, f, pn) in enumerate(zip(c["rings"], (6300.0, 5900.0, 6800.0), (0.0, -0.45, 0.45))):
    ring_tone(t - 0.03, END["proof"], f, -24.0 - 1.5 * i, 0.12, 0.05, pan=pn)
bed.add(pan_st(buzz_hi(c["buzzing_end"] - c["buzzing"] + 0.2, 34.0, 22), 0.4), c["buzzing"], db(-21))   # ... and buzzing (above the word)

# ================================================================= 5. fades: a day passes, the hairs spring up; one doesn't
cut(SHOT["fades"] + 0.02, 23, -26)
for i in range(4):
    bed.add(pan_st(glint(6000 + 500 * i, 0.12, 24 + i), (-0.4, 0.4, -0.2, 0.2)[i]), c["fades"] + 0.3 + i * 0.16, db(-14))   # sproing (above the words)
sw = slide_whistle(0.32, 980, 420)
sfx.add(pan_st(fade(sw, 0.01, 0.05), 0.0), c["die_end"] + 0.03, db(-21))                       # the sad slide (after "die.")
low_thud(c["grow"], -14, 160.0, 0.16, 0.05)                                                     # it pops away (low)

# ================================================================= 6. chicken: hers grow back
cut(SHOT["chicken"] + 0.02, 28, -27)
sparkle(c["regrow"], c["regrow"] + 0.7, -18, 29, 14.0)                                          # the new cell comes up (above the words)
gap = c["so2"] - c["theirs_end"]
for k, (dt, d, f0, f1) in enumerate(((0.02, 0.08, 560.0, 640.0), (0.13, 0.08, 590.0, 660.0), (0.25, 0.2, 620.0, 900.0))):
    if c["theirs_end"] + dt + d < c["so2"] - 0.06:
        sfx.add(pan_st(honk(d, f0, f1, 30 + k), 0.2), c["theirs_end"] + dt, db(-19))           # bok, bok, BAGAWK (after "theirs.")

# ================================================================= 7. button: earplugs, a chicken, the band again
cut(SHOT["button"] + 0.02, 31, -27)
low_thud(c["so2"] + 0.3, -13, 70.0, 0.4, 0.14)                                                  # the stage lights come back on
hi_tick(c["so2"] + 0.3, -17, 32, 0.0)
for k in range(2):
    sfx.add(pan_st(fade(squelch(0.11, 33 + k), 0.004, 0.03), (-0.45, 0.45)[k]), c["earplugs_end"] + 0.03 + 0.15 * k, db(-12))   # squish, squish (after "earplugs...")
bed.add(pan_st(filt(whoosh(0.4, 140, 600, 35, 0.8), "lowpass", 320), 0.4), c["become"] - 0.12, db(-14))   # she hops in (low)
bed.add(pan_st(glint(7600, 0.12, 36), 0.45), c["chicken2"] + 0.02, db(-14))                     # the sunglasses (above the word)

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is silent (nobody says "subscribe", 9 Oct 2026) and plays under the button line, so
# these three sounds sit under spoken words. Nothing here may mask one (qa.py lists weak words).
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-25))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-27))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-21))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-32))

# ================================================================= score (drops out for every punchline; none in the silent room)
# the answer: a curious pizzicato walk under "probably isn't your ears... it's your brain, cranking"
groove(mus, c["probably"] + 0.05, c["eleven"] - 0.08, 112, ["Em", "C"], gain=-8, seed=40, kick_on=False, padv=False)
# the hair cells: a minor drive
groove(mus, c["music"] + 0.05, c["through_end"] + 0.2, 116, ["Am", "F", "C", "E"], gain=-7, seed=41, kick_on=False, sixteen=True)
# the amp: a sneaky walk, out for "DOWN?"; then a riser under the crank
groove(mus, SHOT["amp"] + 0.15, c["down"] - 0.06, 108, ["Dm", "A"], gain=-8, seed=42, kick_on=False, padv=False)
mus.add(pan_st(filt(riser(c["knob_end"] - c["cranks"], 43, 160, 900), "lowpass", 1200), 0), c["cranks"], db(-12))
drone(mus, c["hears"], c["ring2"] - 0.1, [45, 52, 57], cutoff=500, gain=-18, seed=44, swell=0.5)
# a day later: a small resolving tune, out for "die"
groove(mus, c["day"] + 0.05, c["die"] - 0.1, 104, ["C", "G", "F", "C"], gain=-8, seed=45, kick_on=False, snaps=False)
silence(mus, [(c["stop"] + 0.28, c["probably"] + 0.04), (c["eleven"] - 0.07, c["music"] + 0.04), (c["through_end"] + 0.21, SHOT["amp"] + 0.14),
              (c["down"] - 0.05, c["cranks"] - 0.01), (c["ring2"] - 0.09, c["day"] + 0.04), (c["die"] - 0.09, c["bang"] - 0.01)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -12.0, "sfx": -8.5, "amb": -19.0}, duck={"music": 0.74})
