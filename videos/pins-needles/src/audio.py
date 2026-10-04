"""Why Does Your Foot Fall ASLEEP? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.
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


def zap(t, seed, gain=-9.0, pan=0.0, dur=0.2):
    """an electric bzzt (in a pause): a crackle burst over a small thud"""
    sfx.add(pan_st(fade(crackle(int(dur * SR), 150, seed, 1400, 8000), 0.002, 0.08), pan), t, db(gain))
    sfx.add(thump(0.2, 220, 70, 0.05), t, db(gain - 7))


def ding(t, gain=-18.0, notes=(88, 93), pan=0.2, dur=0.32):
    """a small two-note "right!" (in a pause)"""
    for j, m in enumerate(notes):
        sfx.add(bell(mtof(m), dur, dur * 0.3) * 0.5, t + j * 0.07, db(gain), pan=pan)


STUDIO = ("hook", "floor", "fizz", "nothing", "harmless", "zen")
XRAY = ("squash", "quiet", "reboot", "rec")
HEAD = ("brain", "tv")

# ================================================================= ambience (one bed per world, gated to its shots)
# the studio: a hushed room, all under ~220 Hz (and it goes away for the whispered "quietly.")
room = norm(filt(brown(N, 1), "lowpass", 220))
amb.x += pan_st(room, 0) * 0.34 * gate(N, on(*STUDIO)) * (1 - gate(N, [(c["subscribe_end"], c["zap2"])], 0.2))
# inside the leg: muffled, a slow pulse; it stops when the nerve goes quiet
pulse = norm(filt(pink(N, 4), "bandpass", [45, 260]) * (0.55 + 0.45 * np.sin(2 * np.pi * 1.1 * tt) ** 2))
amb.x += pan_st(pulse, 0) * 0.55 * gate(N, [(SHOT["squash"], c["itgoes"]), (SHOT["reboot"], END["rec"])])
# the control room: mains hum from the old TV
hum = norm(filt(buzz(N, 60, 6, 0.2), "lowpass", 260))
amb.x += pan_st(hum, -0.2) * 0.4 * gate(N, on(*HEAD))

# ================================================================= 1. hook: the hush, he gets up, the rubber leg ... GONNNG
sfx.add(pan_st(singing_bowl(392.0, 2.8), -0.3), 0.0, db(-22))                          # frame 1: a singing bowl is still ringing
sfx.add(pan_st(rustle(0.45, 11), -0.1), 0.02, db(-22))                                 # he gets up: cloth
sfx.add(pan_st(filt(whoosh(0.3, 300, 1500, 12, 0.7), "lowpass", 2000), 0), 0.0, db(-22))
for k in range(3):                                                                     # the leg wobbles like rubber (far under "stand up")
    bed.add(pan_st(squeak(0.15, 380 + 60 * (k % 2), 640 + 90 * (k % 2)), 0.2), c["stand"] + 0.1 + 0.27 * k, db(-25))
sfx.add(pan_st(slide_whistle(0.36, 1250, 380), 0.2), c["buckle"], db(-17))             # ... it folds: he goes over
G1 = gong(2.9, 21, 98.0)
g_env = np.ones(len(G1))                                                               # the gong rings in the gap, then drops under "Your leg..."
i0, i1 = int((c["yourleg"] - 0.28 - c["crash"]) * SR), int((c["yourleg"] - 0.04 - c["crash"]) * SR)
g_env[i0:i1] = np.linspace(1, 0.2, i1 - i0)
g_env[i1:] = 0.2
sfx.add(pan_st(G1 * g_env, 0.3), c["crash"], db(-2))
sfx.add(thump(0.4, 150, 44, 0.11), c["crash"], db(-5))                                 # ... and the body
sfx.add(pan_st(crack(0.08, 22, 0.02, 900), 0.3), c["crash"], db(-18))
sfx.add(pan_st(filt(breath(0.2, 23), "highpass", 700), -0.5), c["crash"] + 0.3, db(-22))    # the class gasps

# ================================================================= 2. floor: he picks the leg up; a halo; "still meditating"; he lets go
sfx.add(pan_st(rustle(0.3, 30), 0.1), c["lift"], db(-23))
for j, m in enumerate((96, 103)):                                                      # the halo: ting (in the pause after "leg...")
    sfx.add(bell(mtof(m), 0.45, 0.15) * 0.5, c["om"] + j * 0.05, db(-10), pan=0.3)
halo = pad([mtof(m) for m in (84, 88, 91)], 1.3, 0.1, 2600, 31)
sfx.add(pan_st(fade(halo, 0.02, 0.5), 0.2), c["om"], db(-25))                          # ... and a tiny choir under the line
THUD = c["drop"] + 0.12
sfx.add(thump(0.3, 140, 48, 0.09), THUD, db(-6))                                       # he lets go: a sandbag (after "meditating.")
sfx.add(pan_st(filt(creak(0.18, 32, 60, 120), "lowpass", 900), 0.2), THUD + 0.02, db(-20))

# ================================================================= 3. fizz: static creeps up the leg; then the pins and the needles
nf = int((c["pins"] - c["then"]) * SR)
fz = crackle(nf, 70, 40, 2600, 9000) * np.linspace(0.25, 1, nf) ** 1.5
bed.add(pan_st(fz, 0.3), c["then"], db(-21))                                           # under "Then comes the fizz."
sfx.add(pan_st(gas_hiss(c["pins"] - c["fizz_end"] - 0.06, 41), 0.3), c["fizz_end"] + 0.03, db(-3))   # ... and loud in the pause after it
for k, tj in enumerate(c["jabs"]):                                                     # each pin: a tiny tick, under "Pins and NEEDLES!"
    bed.add(pan_st(blip(2300 + 140 * k, 3300 + 180 * k, 0.035, 42 + k, 0.012), 0.5 - 0.08 * k), tj, db(-20))
zap(c["title"], 55, 1.5, 0.3)                                                         # bzzt (after "NEEDLES!")

# ================================================================= 4. squash: into the leg; blood still flows; the fold bites; the tiny vessels
sfx.add(pan_st(filt(whoosh(0.3, 300, 2400, 60, 0.8), "lowpass", 3000), 0.1), SHOT["squash"] - 0.1, db(-17))
sfx.add(thump(0.3, 130, 50, 0.09), SHOT["squash"], db(-15))
for k, tk in enumerate((c["didnt"] - 0.05, c["circ"] - 0.1, c["circ_end"] - 0.25)):    # a heart, steady: the blood never stopped
    bed.add(pan_st(heartbeat(61 + k, 1.0), -0.2), tk, db(-17))
bed.add(pan_st(blip(800, 1300, 0.07, 63, 0.03), 0.2), c["circ"] + 0.1, db(-22))            # STILL FLOWING pops up (a small tick under "circulation")
bed.add(pan_st(squelch(0.36, 64), 0.2), c["clamp"], db(-19))                           # the fold bites down (under "squashed")
bed.add(pan_st(filt(creak(0.3, 65, 70, 150), "lowpass", 1200), 0.2), c["clamp"] + 0.05, db(-22))
sfx.add(pizz(mtof(62), 0.3, 66), c["nerve_end"] + 0.02, db(-17), pan=-0.2)             # NERVE (after the word)
bed.add(pan_st(blip(900, 1400, 0.05, 67, 0.02), 0.3), c["tiny"], db(-26))
dr = glide(620, 250, c["feed_end"] - c["vessels"], 1.2) * np.hanning(int(round((c["feed_end"] - c["vessels"]) * SR)))
bed.add(pan_st(dr * 0.5, 0.2), c["vessels"], db(-25))                                  # the vessels drain

# ================================================================= 5. quiet: power down ... and nothing
pd = glide(300, 62, 1.25, 0.7) * np.linspace(1, 0, int(round(1.25 * SR))) ** 0.6
bed.add(pan_st(pd, 0), c["starved"] + 0.08, db(-18))                                   # the nerve winds down under "Starved, it goes..."
for k, tk in enumerate((c["starved_end"] + 0.05, c["itgoes"] + 0.12)):                 # the last two signals fizzle
    bed.add(pan_st(blip(900 - 250 * k, 420 - 120 * k, 0.07, 70 + k, 0.03), 0.3), tk, db(-25))

# ================================================================= 6. brain: the feed drops; knock knock; where is it?
bed.add(pan_st(fade(crackle(int(0.3 * SR), 90, 80, 1500, 7000), 0.01, 0.05), -0.3), SHOT["brain"] + 0.1, db(-24))   # the picture breaks up
bed.add(pan_st(blip(520, 150, 0.14, 81, 0.06), -0.3), c["nosignal"], db(-17))          # NO SIGNAL (bwoop, under the words)
for k in range(3):                                                                     # the brain knocks on the set
    bed.add(pan_st(filt(thump(0.07, 420, 190, 0.02), "highpass", 150), -0.1), c["nosignal"] + 0.2 + 0.33 * k, db(-18))
bed.add(pan_st(bell(1175, 0.5, 0.2) * 0.5, -0.3), c["lost"], db(-22))                  # the radar pings
for j, m in enumerate((67, 74)):                                                       # "?" (after "find it.")
    sfx.add(pizz(mtof(m), 0.25, 83 + j), c["find_end"] + 0.03 + j * 0.1, db(-14), pan=0.3)

# ================================================================= 7. reboot: the leg opens, blood rushes back, the nerve boots ... badly
bed.add(pan_st(filt(whoosh(0.55, 250, 900, 90, 0.6), "lowpass", 1400), 0.1), c["unfold"], db(-19))
nr = int((c["back_end"] - c["blood"] + 0.25) * SR)
rush = norm(filt(pink(nr, 91), "lowpass", 900)) * np.sin(np.pi * np.linspace(0, 1, nr)) ** 0.8
bed.add(pan_st(rush, 0.1), c["blood"] + 0.12, db(-19))                                        # the rush (low, under "Blood rushes back")
for k, tk in enumerate((c["blood"] + 0.1, c["rushes"] + 0.2, c["back"] + 0.15)):
    bed.add(pan_st(heartbeat(92 + k, 1.0), -0.2), tk, db(-19))
for j, m in enumerate((72, 76, 79)):                                                   # booting up: three notes (under "reboots...")
    bed.add(bell(mtof(m), 0.22, 0.07) * 0.5, c["reboots"] + 0.05 + j * 0.16, db(-21), pan=0.3)
for k in range(3):                                                                     # the bar ticks along in the pause ...
    sfx.add(pan_st(pen_tick(96 + k), 0.3), c["reboots_end"] + 0.06 + 0.1 * k, db(-22))
nb = int((c["badly_end"] - c["badly"]) * SR)
bed.add(pan_st(crackle(nb, 110, 99, 1400, 8000), 0.2), c["badly"], db(-19))            # sparks under "badly."
ERR = c["badly_end"] + 0.02
sfx.add(pan_st(buzzer(0.15), 0.2), ERR, db(-11))                                       # ... ERROR (after the word)
sfx.add(pan_st(glitch_burst(0.14, 100), -0.2), ERR, db(-13))

# ================================================================= 8. rec: the fibres crackle by themselves; the needle; the trace; 300 a second
sfx.add(thump(0.26, 140, 52, 0.08), SHOT["rec"], db(-17))
nx = int((c["second_end"] - c["scientists"]) * SR)
bed.add(pan_st(crackle(nx, 26, 110, 3000, 9000), -0.2), c["scientists"], db(-25))      # misfires, far under the line
bed.add(pan_st(bell(2637, 0.3, 0.1) * 0.5, 0.4), c["needle_in"], db(-23))              # the needle goes in
ticking(c["recorded_end"], c["second_end"] - 0.1, bed, db(-24), 6, 34, 111)            # the trace: faster and faster
ding(c["second_end"] + 0.03, -5.0, (91, 98), dur=0.22)                                          # 300 (after "second.")

# ================================================================= 9. nothing: the pins were never there
pops(c["nothing"] + 0.5 + 0.085 * np.arange(9), bed, db(-19), 120)                     # they pop, one by one (under the line)
ding(c["skin_end"] + 0.05, -5.0)                                                      # 0 PINS, 0 NEEDLES (after "skin.")

# ================================================================= 10. tv: static; the brain thinks ... needles?
ns = int((END["tv"] - SHOT["tv"]) * SR)
bed.add(pan_st(tv_static(ns / SR, 130), -0.3), SHOT["tv"], db(-21))                    # the set hisses under her (above the speech band)
gp = c["andyour"] - c["static_end"] - 0.08
sfx.add(pan_st(tv_static(gp, 131), -0.3), c["static_end"] + 0.04, db(-8))             # ... and loud in the pause after "static..."
bed.add(pan_st(blip(420, 700, 0.08, 132, 0.04), 0.1), c["think"], db(-22))             # the thought bubble
for j, m in enumerate((62, 65, 69)):                                                   # hmm ... hmm ... (in the pause before "needles?")
    sfx.add(pizz(mtof(m), 0.2, 133 + j), c["guesses_end"] + 0.06 + j * 0.14, db(-15), pan=0.3)
STAMP = c["needles2_end"] + 0.02
sfx.add(thump(0.2, 200, 80, 0.05), STAMP, db(-9))                                      # BEST GUESS (after "needles?")
sfx.add(pan_st(snap(136), -0.3), STAMP, db(-14))
bw = Bus(int(0.7 * SR))
bwomp(bw, 0.0, 38, 0.0)
sfx.add(bw.x[:, : int(0.34 * SR)] * np.linspace(1, 0, int(0.34 * SR)) ** 0.5, STAMP + 0.03, db(-14))   # a short blat, gone before "It's harmless"

# ================================================================= 11. harmless: the tick; the toes
bed.add(pan_st(blip(700, 1200, 0.07, 140, 0.03), 0), c["shield"], db(-24))
ding(c["harmless_end"] + 0.03, -9.0, (84, 91), dur=0.26)                                        # HARMLESS (after the word)
for k in range(4):                                                                     # toes: little squeaks under "Wiggle your toes..."
    bed.add(pan_st(squeak(0.08, 1500 + 200 * (k % 2), 2300 + 250 * (k % 2)), 0.3), c["wiggle"] + 0.1 + 0.27 * k, db(-22))

# ================================================================= 12. zen: he drops into the pose, floats ... subscribe ... quietly ... GONNNG
sfx.add(pan_st(squeak(0.09, 1700, 2500), 0.3), c["toes_end"] + 0.02, db(-11))          # one last wiggle (in the pause)
LAND = c["sit"] + 0.3
bed.add(thump(0.26, 150, 55, 0.08), LAND, db(-10))                                     # he lands in the lotus (on "and")
choir = pad([mtof(m) for m in (72, 76, 79, 84)], c["nextup"] - c["halo"] - 0.1, 0.3, 2400, 150)
mus.add(pan_st(fade(choir, 0.05, 0.4), 0), c["halo"], db(-29))                        # enlightenment: a choir (it swells in the pause)
for j, m in enumerate((84, 88, 91, 96, 100)):                                          # ... and a harp (after "enlightened.")
    sfx.add(fade(music_box(mtof(m), 0.34, 151 + j), 0.002, 0.12) * 0.6, c["enlightened_end"] + 0.03 + j * 0.05, db(-17), pan=-0.3 + 0.15 * j)
bed.add(pan_st(blip(700, 1200, 0.07, 157, 0.03), 0.4), c["recorded2"] - 0.25, db(-23))  # the phone pops up
nw = int(0.2 * SR)
tw = ar(nw)
wob = np.sin(2 * np.pi * np.cumsum(310 * (1 + 0.3 * np.sin(2 * np.pi * 9 * tw))) / SR) * np.sin(np.pi * np.linspace(0, 1, nw)) ** 0.6
sfx.add(pan_st(filt(wob, "lowpass", 1800), 0.4), c["weird_end"] + 0.02, db(-12))       # a warbly "that's ME?" from the phone (after "weird.")
if "sub_in" in c:                                                                      # the pill pops in the pause before "Subscribe"
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-20))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-22))
    sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-1))                                  # the click, in the pause after it
    sfx.add(pan_st(key_click(73), 0), c["sub_tap"] + 0.004, db(-3))
SH = c["quietly"] - 0.26
sfx.add(pan_st(shush(0.22, 160), -0.5), SH, db(-12))                                   # the class: SHH (just before her whisper)
sfx.add(pan_st(shush(0.2, 161), 0.4), SH + 0.02, db(-14))
zap(c["zap2"], 162, -3.0, 0.2, 0.24)                                                   # one last jab in the foot (after "quietly.")
sfx.add(pan_st(slide_whistle(c["gong2"] - c["zap2"] - 0.32, 1250, 380), 0.2), c["zap2"] + 0.3, db(-16))   # ... and over he goes
G2 = gong(DUR - c["gong2"], 21, 98.0)
sfx.add(pan_st(G2, 0.3), c["gong2"], db(-2))                                           # GONNNG: straight into frame 1's hush
sfx.add(thump(0.36, 150, 44, 0.11), c["gong2"], db(-5))

# ================================================================= score (drops out for every punchline)
# hook: the class's calm, a low held fifth, cut dead by the gong
drone(mus, 0.0, c["buckle"] + 0.1, [38, 45, 50, 57], cutoff=420, gain=-30, seed=5, swell=0.04)
# floor, fizz: no score (the gong's tail, the stare, the fizz).
# squash: the bouncy mystery groove, in after her first words; it stops dead for "You squashed a NERVE..." and comes back for
# the vessels; out when the nerve starves
groove(mus, c["cut"], c["feed_end"], 112, ["Dm", "Bb", "F", "C"], gain=-14, seed=10, snaps=False, cutoff=1200)
# brain: a held, uneasy cluster while the screen says NO SIGNAL
drone(mus, c["brain"] - 0.1, c["find_end"], [45, 51, 52, 58], cutoff=420, gain=-31, seed=11, swell=0.5)
# reboot: the mechanism drive; it stops for "badly"
groove(mus, c["move_end"], c["reboots_end"], 116, ["Am", "F", "C", "G"], gain=-12, seed=20, snaps=False, cutoff=1100)
# rec: a sneaky walk for the proof (bass, snaps and the marimba; no pad, no kick)
groove(mus, c["recorded"], c["second_end"], 100, ["Dm", "Gm", "A", "Dm"], gain=-13, seed=30, kick_on=False, padv=False, cutoff=1000)
# tv: a low question while the brain thinks
drone(mus, c["andyour"], c["guesses_end"] + 0.1, [50, 57, 60, 65], cutoff=500, gain=-32, seed=31, swell=0.4)
# harmless: relief, a short strut; then the choir (above); then a light walk under the tease
groove(mus, c["harmless_end"] + 0.05, c["sit"] - 0.05, 104, ["C", "F"], gain=-12, seed=40, cutoff=1300)
groove(mus, c["nextup"] + 0.25, c["weird_end"], 104, ["C", "F", "G", "C"], gain=-15, seed=41, kick_on=False, padv=False, cutoff=1100)
silence(mus, [(c["crash"] - 0.02, c["cut"] - 0.01), (c["yousq"] - 0.06, c["andthe"] + 0.1), (c["starved"], c["brain"] - 0.12), (c["find_end"] + 0.05, c["move_end"] - 0.01),
              (c["reboots_end"] - 0.02, c["recorded"] - 0.01), (c["second_end"] + 0.03, c["andyour"] - 0.01),
              (c["guesses_end"] + 0.15, c["harmless_end"]), (c["weird_end"] + 0.02, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -13.0})
