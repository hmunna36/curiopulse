"""Why Do We CRY? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

The rule of this mix: every sound that carries a joke or a reveal (the sob, the dog's "hm?", the bell's last ring, the
gush, the gurgle, HONK, the spotlight's clunk, the shutter, the two dials falling, the elephant, the dog's whine, the
ding, the lick) sits in a pause of the narration. What happens ON a word is on the bed bus, either under 250 Hz (thuds,
the lamp popping up, the water's weight) or above 5 kHz (spray, the tap's ratchet, the eraser, ticks), so the word
stays clear. The score is a small sad-film theme that stops dead whenever the picture makes its joke.
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


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low_thud(t, gain, f=150.0, dur=0.34, tau=0.11, bus=None):
    """a knock heard under a word: almost all of it under 200 Hz"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))
    (bus or bed).add(pan_st(filt(bonk(), "lowpass", 600), 0), t, db(gain - 10))


def cut(t, seed, gain=-20.0, f0=400, f1=2200, top=2600):
    """the whoosh into a cut: kept dull, so the first word of the new shot is clear"""
    sfx.add(pan_st(filt(whoosh(0.26, f0, f1, seed, 0.85), "lowpass", top), 0), t - 0.2, db(gain))


def hi_tick(t, gain, seed=0, pan=0.0):
    """a tick that can sit on a word: nothing under 5 kHz"""
    m = int(0.03 * SR)
    bed.add(pan_st(filt(white(m, 900 + seed), "highpass", 5200) * expdecay(m, 0.004), pan), t, db(gain))


def air(t0, t1, gain, seed, shape=None, pan=0.0):
    """spray, running water, an eraser: it can run under words, because it is only above 5.2 kHz"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(filt(white(n, seed), "highpass", 5200, 4) * env, 0.004, 0.03), pan), t0, db(gain))


def weight(t0, t1, gain, seed, shape=None):
    """the weight of water, a swell, a rumble: only under 200 Hz, so it can run under words"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.linspace(0.3, 1, n) if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(norm(filt(brown(n, seed), "lowpass", 190)) * env, 0.04, 0.1), 0), t0, db(gain))


def sad_theme(t0, t1, gain, seed, chords=("Am", "F"), bpm=76.0):
    """the film he is watching: slow piano over a pad. One chord a bar, three notes of it, falling"""
    beat = 60.0 / bpm
    bar, t = 0, t0
    while t < t1 - 0.2:
        name = chords[bar % len(chords)]
        r = ROOTS[name.rstrip("m")]
        tones = [r, r + (3 if name.endswith("m") else 4), r + 7]
        bl = min(4 * beat, t1 - t)
        mus.add(pad([mtof(x) for x in tones], bl + 0.05, 0.35, 900, seed + bar), t, db(-24 + gain))
        for k, (bt, ix) in enumerate(((0, 2), (1, 1), (2, 0), (3, 1))):
            tn = t + bt * beat
            if tn < t1 - 0.1:
                mus.add(piano(mtof(tones[ix] + 12), 0.5, seed + 7 * bar + k, 0.7), tn, db(-19 + gain), pan=0.15 * (-1) ** k)
        t += 4 * beat
        bar += 1


COUCH = ("hook", "honk", "spill", "only", "help")
INSIDE = ("alarm", "drain")

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.19 * tt)))
amb.x += pan_st(room, 0) * 0.3 * gate(N, on(*COUCH))                                 # the living room at night
inside = norm(filt(pink(N, 4), "bandpass", [45, 230]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.25 * tt) ** 2))
amb.x += pan_st(inside, 0) * 0.42 * gate(N, on(*INSIDE))                             # inside his head: muffled, a slow pulse
board = norm(filt(brown(N, 6), "lowpass", 200))
amb.x += pan_st(board, 0) * 0.22 * gate(N, on("photo"))

# ================================================================= 1. hook: the spoon, the tear, the burst
sn = breath(0.1, 3)
sfx.add(pan_st(fade(sn, 0.004, 0.02), 0), 0.0, db(-17))                              # a sniff on frame 1: over before "You're"
low_thud(c["chomp"], -15, 170.0, 0.16, 0.05)                                        # the spoon goes in (under "eating")
hi_tick(c["plop"], -15, 1, -0.2)                                                    # the fat tear lands in the tub
low_thud(c["plop"], -19, 220.0, 0.12, 0.04)
weight(c["eyes"] - 0.15, c["spring"], -15, 5, lambda u: u ** 1.6)                   # his eyes fill (a swell under "your eyes")
low_thud(c["spring"], -9, 110.0, 0.36, 0.12)                                        # ... and let go
air(c["spring"], c["relax"] + 0.35, -15, 6, lambda u: np.minimum(1, u * 14) * (1 - 0.55 * u))   # the spray
sob = baby_cry(0.3, 2, 230.0, 0.55)
sfx.add(pan_st(fade(sob, 0.01, 0.06), -0.2), c["sob"], db(-14))                      # one sob, in the pause after "leak!"
# the answer: the lamp pops out of his head, S O S, and the dog's ears go up
low_thud(c["face"] - 0.03, -12, 190.0, 0.2, 0.06)                                   # boing (low), under "face"
hi_tick(c["face"], -13, 7, -0.3)
for i in range(3):
    hi_tick(c["called"] + 0.16 * i, -13, 8 + i, -0.3 + 0.2 * i)                     # S, O, S
wh = whimper(4)[: int(0.3 * SR)]
sfx.add(pan_st(fade(wh, 0.01, 0.07), 0.45), c["huh"], db(-16))                       # the dog: "hm?", in the pause after "backup."

# ================================================================= 2. alarm: into his head
cut(SHOT["alarm"] + 0.12, 20, -21, 300, 1500, 1900)
for i in range(2):                                                                   # the feeling: a heart, heard through the chest
    low_thud(c["feelings"] + 0.02 + 0.3 * i, -11 - 2 * i, 90.0, 0.3, 0.1)
ar_ = alarm_ring(c["brain_end"] - c["alarm"] + 0.05, 21, 24.0, 2350.0, True)          # the bell, under "alarm in your brain": only its top
bed.add(pan_st(fade(ar_, 0.005, 0.05), 0), c["alarm"], db(-13))
ring = alarm_ring(0.11, 22, 26.0, 2350.0)
sfx.add(pan_st(fade(ring, 0.002, 0.03), 0), c["brain_end"] + 0.03, db(-10))          # ... and one clear ring, in the pause after "brain,"
air(c["and_it"], c["opens"] + 0.1, -19, 23, lambda u: u ** 0.5)                      # the signal runs out along the nerves
rt = ratchet(c["tap"] + 0.24 - c["opens"], 14.0, 34.0, 24, True)                     # the two hand-wheels turn (above the words)
bed.add(pan_st(fade(rt, 0.004, 0.03), 0), c["opens"], db(-12))
air(c["tap"] + 0.05, c["eye_end"] + 0.05, -17, 25, lambda u: np.minimum(1, u * 5) * (0.6 + 0.4 * u))   # water
weight(c["tap"] + 0.1, c["eye_end"] + 0.1, -14, 26)
sp = splash(0.26, 27, 0.5)
sfx.add(pan_st(fade(sp, 0.004, 0.08), 0), c["gush"], db(-14))                         # it floods over, in the pause after "eye."

# ================================================================= 3. drain: the plughole, the pipe, the nose
air(c["tiny"] - 0.1, c["leads"], -20, 30, lambda u: 0.5 + 0.5 * np.sin(u * 40) ** 2)  # water going round a plughole
hi_tick(c["drain"], -13, 31, 0.3)
for i in range(2):                                                                   # glug, glug: both drains, in the pause after "eye"
    sfx.add(pan_st(fade(bloop(240.0, 110.0, 0.13), 0.003, 0.03), -0.3 + 0.6 * i), c["in_each"] + 0.82 + 0.14 * i, db(-13))
air(c["leads"], c["nose1_end"], -19, 32, lambda u: 0.4 + 0.6 * u, 0.0)                # down the pipe
gg = gurgle(0.3, 33, 20)
sfx.add(pan_st(fade(norm(gg), 0.005, 0.06), 0), c["gurgle"], db(-14))                 # the pipe gurgles, in the pause after "nose..."
dr = drip(34, 1700)
sfx.add(pan_st(fade(norm(dr), 0.001, 0.02), -0.15), c["gurgle"] + 0.33, db(-16))      # ... and the first drip
for i, dt in enumerate((0.0, 0.34, 0.62, 0.9)):                                      # drips (ticks: on the words)
    hi_tick(c["nose2"] + dt, -14, 35 + i, -0.2 + 0.4 * (i % 2))

# ================================================================= 4. honk
cut(SHOT["honk"], 40, -20, 400, 2000, 2400)
hk = np.concatenate([honk(0.2, 330.0, 300.0, 41), honk(0.24, 310.0, 250.0, 42)])
sfx.add(pan_st(fade(hk, 0.006, 0.06), -0.2), c["honk"], db(-10))                        # HONK (the gap after "too.")
low_thud(c["honk"], -15, 120.0, 0.3, 0.1, sfx)

# ================================================================= 5. spill: down his face, and everyone can see
cut(SHOT["spill"], 50, -21, 300, 1600, 2000)
air(SHOT["spill"] + 0.05, c["face2_end"] + 0.05, -17, 51, lambda u: 0.6 + 0.4 * np.sin(u * 30) ** 2)   # pouring (above the words)
weight(SHOT["spill"] + 0.1, c["face2_end"], -15, 52)
for i, dt in enumerate((0.5, 0.95, 1.4)):                                             # the tub fills (low, under the words)
    low_thud(SHOT["spill"] + dt, -20, 200.0 - 20 * i, 0.14, 0.05)
sfx.add(pan_st(fade(key_click(53), 0.001, 0.02), 0), c["spot"], db(-12))               # the spotlight: clunk, in the pause after "face,"
low_thud(c["spot"], -15, 80.0, 0.3, 0.1, sfx)
for i, k in enumerate(("where", "everyone", "can", "see")):                           # eyes open in the dark (ticks: on the words)
    hi_tick(c[k], -14, 54 + i, -0.5 + 0.33 * i)
hi_tick(c["everyone"] + 0.2, -15, 58, 0.4)
hi_tick(c["everyone"] + 0.4, -15, 59, -0.4)
sh = shutter()
sfx.add(pan_st(fade(sh, 0.001, 0.02), 0.1), c["shutter"], db(-3))                     # ... and somebody takes a picture

# ================================================================= 6. photo: erase the tears, and two dials fall
sfx.add(pan_st(fade(cork_pop(60, 900.0)[: int(0.1 * SR)], 0.001, 0.03), 0.3), c["snap"], db(-11))   # the eraser pops up, in the pause after "works."
for k, s0 in (("erase", 61), ("tears", 62)):                                          # two rubs (above the words)
    air(c[k], c[k] + 0.34, -13, s0, lambda u: np.abs(np.sin(u * np.pi * 6)) ** 0.7, 0.2)
hi_tick(c["photo"], -13, 63, 0.0)                                                    # clean
for i, dt in enumerate((0.3, 0.42)):                                                 # the dials come up
    hi_tick(c["photo_end"] + dt, -14, 64 + i, -0.4 + 0.8 * i)
r1 = ratchet(c["sadness_end"] - c["less1"], 30.0, 12.0, 66, True)                     # the first needle falls (above the words)
bed.add(pan_st(fade(r1, 0.004, 0.04), -0.4), c["less1"], db(-14))
sw = slide_whistle(0.28, 1300, 600)
sfx.add(pan_st(fade(sw, 0.01, 0.07), -0.4), c["drop1"], db(-18))                      # ... its sigh, in the pause after "sadness..."
r2 = ratchet(c["helping_end"] - c["less2"], 30.0, 12.0, 67, True)
bed.add(pan_st(fade(r2, 0.004, 0.04), 0.4), c["less2"], db(-14))
sw2 = slide_whistle(0.26, 1100, 520)
sfx.add(pan_st(fade(sw2, 0.01, 0.07), 0.4), c["drop2"], db(-18))                      # and the second, after "helping."

# ================================================================= 7. only: the elephant in the room, and a tear check
low_thud(SHOT["only"] + 0.03, -17, 70.0, 0.5, 0.18, sfx)                              # it comes up behind the couch
toot = honk(0.2, 520.0, 760.0, 70)
sfx.add(pan_st(fade(toot, 0.012, 0.06), 0.25), SHOT["only"] + 0.05, db(-21))          # a small trumpet, before "As"
for k, s0, p in (("youre", 71, 0.3), ("only", 72, 0.4), ("cries2", 73, -0.3)):        # the scope locks: tick-tick (on the words)
    hi_tick(c[k], -12, s0, p)
    hi_tick(c[k] + 0.16, -15, s0 + 10, p)
low_thud(c["cries2"] + 0.14, -10, 120.0, 0.26, 0.09)                                 # SOAKED
air(c["cries2"], c["feelings2_end"], -17, 74, lambda u: 0.7 + 0.3 * np.sin(u * 40) ** 2, -0.3)   # he sprays the scope
sfx.add(pan_st(fade(crumple(0.2, 75), 0.005, 0.05), 0.0), c["trunk"] + 0.1, db(-13))  # the trunk holds out a tissue (the gap)
sfx.add(pan_st(fade(honk(0.16, 420.0, 520.0, 76), 0.012, 0.05), 0.25), c["trunk"] + 0.34, db(-16))

# ================================================================= 8. help: backup shows up; the button; the loop
cut(SHOT["help"], 80, -21, 300, 1600, 2000)
low_thud(c["cry"] - 0.02, -16, 170.0, 0.16, 0.05)                                    # a spoonful goes in, mid-sniffle (under "cry")
hi_tick(c["most"] + 0.12, -15, 88, -0.2)                                             # ... and he digs out the next one
sfx.add(pan_st(fade(breath(0.16, 81), 0.01, 0.05), -0.2), c["most_end"] + 0.02, db(-19))   # he sniffs
wn = whimper(82)
sfx.add(pan_st(fade(wn[: int(0.34 * SR)], 0.01, 0.08), 0.45), c["whine"] + 0.1, db(-16))   # the dog gets up: a small whine (the pause)
for i, dt in enumerate((0.0, 0.2)):                                                  # paws on the couch (low, under "when backup")
    low_thud(c["when"] + dt, -13, 150.0, 0.14, 0.05)
air(c["shows"], c["up_end"], -19, 83, lambda u: np.abs(np.sin(u * np.pi * 4)) ** 0.6, 0.2)   # licks (above the words)
dg = bell(mtof(88), 0.3, 0.1)
sfx.add(fade(dg, 0.001, 0.06) * 0.8, c["ding"], db(-12), pan=-0.2)                     # the lamp goes green: ding
sl = slurp(0.34, 84, 15.0)
sfx.add(pan_st(fade(sl, 0.006, 0.06), 0.2), c["lick"], db(-11))                        # ... and the spoon is clean
sm = chomp(85)
sfx.add(pan_st(fade(sm, 0.004, 0.05), 0.4), c["backup3_end"] + 0.1, db(-17))           # the dog, pleased with it
low_thud(c["dig"] + 0.3, -14, 180.0, 0.14, 0.05, sfx)                                # he digs out another spoonful
hi_tick(c["dig"] + 0.32, -13, 86, -0.2)
sfx.add(pan_st(fade(breath(0.12, 87), 0.006, 0.03), 0), DUR - 0.14, db(-18))           # ... sniff: into frame 1

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# very quiet on purpose: the cue is silent (nobody says "subscribe", 9 Oct 2026) and plays under the button line, so
# these three sounds sit under spoken words. Nothing here may mask one (qa.py lists weak words).
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-25))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-27))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-21))
        sfx.add(pan_st(bell(1760, 0.8, 0.5), 0), c["sub_tap"] + 0.08, db(-32))

# ================================================================= score (it stops for every joke)
# hook: the film he is watching. It stops dead when his eyes let go
sad_theme(0.3, c["spring"] - 0.03, -4, 3)
# the answer: nothing under "Relax", then a tiptoe that leaves before "backup"
groove(mus, c["sci"] + 0.15, c["called"] + 0.25, 100, ["Am", "E"], gain=-14, seed=10, kick_on=False, snaps=False, arp=False, padv=False)
# inside his head: curious; it leaves for the bell's ring, comes back for the taps, and is gone before the gush
groove(mus, c["feelings"] + 0.25, c["brain_end"] - 0.02, 112, ["Dm", "Bb"], gain=-14, seed=20, kick_on=False, snaps=False, cutoff=1100)
groove(mus, c["and_it"] + 0.25, c["eye_end"] - 0.05, 112, ["Bb", "C"], gain=-14, seed=21, kick_on=False, snaps=False, cutoff=1200)
# the drain: a sneaky walk down the pipe; nothing under "so your nose cries too" and the honk
groove(mus, c["tiny"] + 0.2, c["nose1_end"] - 0.05, 96, ["Dm", "A"], gain=-13, seed=30, kick_on=False, snaps=False, arp=False, padv=False)
# spill: the film again, swelling; cut by the spotlight. A low drone under "where everyone can see it"
sad_theme(c["rest"] + 0.2, c["face2_end"] - 0.02, -4, 40)
drone(mus, c["where"] - 0.05, c["it_end"] + 0.1, [38, 45], cutoff=300, gain=-31, seed=41, swell=0.4)
# the proof: light on its feet; it stops for each needle's sigh
groove(mus, c["erase"] + 0.25, c["sadness_end"] - 0.1, 116, ["C", "Am"], gain=-14, seed=50, kick_on=False, cutoff=1200)
groove(mus, c["feel"] + 0.1, c["helping"] - 0.04, 116, ["F", "G"], gain=-14, seed=51, kick_on=False, cutoff=1200)
# the only animal: wonder, as a low drone (a groove poked up in the pause before "you're"); gone before "that cries from feelings"
drone(mus, c["asfar"] - 0.1, c["animal_end"] + 0.05, [41, 48, 53], cutoff=340, gain=-29, seed=60, swell=0.5)
# help: the film's theme, in the major; it holds its breath at "most..."; warm under "when backup shows up"
sad_theme(c["good"], c["most"] - 0.06, -5, 70, ("F", "C"), 84.0)
groove(mus, c["backup2"] - 0.05, c["up_end"] - 0.04, 96, ["C", "F"], gain=-14, seed=71, kick_on=False, snaps=False, cutoff=1300)
# the button: nothing under "Some backup."; then two notes, and the film starts up again into frame 1
for i, m in enumerate((81, 76)):
    sfx.add(music_box(mtof(m), 0.5, 160 + i) * expdecay(int(0.5 * SR), 0.16), c["backup3_end"] + 0.42 + 0.2 * i, db(-18), pan=-0.1 + 0.2 * i)

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -13.0})
