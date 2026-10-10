"""Why Is the Sky BLUE? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The sound follows the air. With air there is wind, a bird and a groove; when the sky goes out on "black" all of it
stops dead, and the places with no air (the black sky, the Moon) are nearly silent. Red is a lazy low slide, blue a
twitchy buzz that turns the air into a pinball table. Whatever lives in the speech band plays in the pauses; under the
words there are only low thuds (under 200 Hz) and ticks (over 5 kHz).
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


def air(t0, t1, gain, seed, shape=None, pan=0.0, lo=5200):
    """a hiss that can run under words, because it is only above 5.2 kHz"""
    n = int((t1 - t0) * SR)
    if n <= 0:
        return
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.6 if shape is None else shape(np.linspace(0, 1, n))
    bed.add(pan_st(fade(filt(white(n, seed), "highpass", lo, 4) * env, 0.004, 0.03), pan), t0, db(gain))


def glug_low(seed=0):
    """a swallow that can sit under the first words: a round knock that drops, all of it under 300 Hz, and a wet tick on top"""
    n = int(0.2 * SR)
    f = 230.0 * (0.42) ** (np.linspace(0, 1, n) ** 0.7)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * attack_decay(n, 0.008, 0.07)
    m = int(0.012 * SR)
    y[:m] += 0.25 * filt(white(m, seed), "highpass", 5500) * expdecay(m, 0.003)
    return fade(y, 0.002, 0.03)


def slide(f0, f1, dur, vib=0.0, top=None, harm=6):
    """a brassy slide from f0 to f1 (a lazy "wah", a power-down): harmonics up to `top` Hz"""
    n = int(dur * SR)
    t = ar(n)
    f = f0 * (f1 / f0) ** (t / dur) * (1 + vib * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(k * ph) / k for k in range(1, harm + 1))
    if top:
        y = filt(y, "lowpass", top, 4)
    return fade(norm(y) * attack_decay(n, 0.03, dur * 0.6), 0.01, 0.06)


def ding(m, dur=0.16, seed=0, bright=1.2):
    """a pinball bumper: a short bright bar"""
    return fade(marimba(mtof(m), dur, seed, bright) + 0.3 * bell(mtof(m + 12), dur, 0.05), 0.001, 0.03)


def buzz_hi(dur, rate, seed, lo=5200):
    """blue's twitch: a buzz that lives above the speech band (it can run under a line)"""
    n = int(dur * SR)
    t = ar(n)
    am = (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * rate * t))) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * t))
    return fade(filt(white(n, seed), "highpass", lo, 4) * am, 0.01, 0.03)


PAUSE = pause_mask(WORDS, N)

# ================================================================= ambience (one bed per world, gated to its shots)
# the trail by day: a soft wind. It stops dead on "black", comes back as the blue does, and again for the button
wind = norm(filt(brown(N, 1), "lowpass", 260) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.21 * tt + 1)))
wind_hi = norm(filt(pink(N, 2), "highpass", 5600, 2)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * tt) ** 2)
day = gate(N, [(0, c["black"]), (c["thats"], END["sky"]), (SHOT["button"], DUR)], 0.03)
back = gate(N, [(c["crashes"][1], END["hook"]), (c["direction"], c["thats"])], 0.5) * 0.5
amb.x += pan_st(wind, 0) * 0.34 * np.maximum(day, back) + pan_st(wind_hi, 0.2) * 0.02 * np.maximum(day, back)
# no air: almost nothing, a breath of sub
void = norm(filt(brown(N, 3), "lowpass", 90))
amb.x += pan_st(void, 0) * 0.16 * gate(N, [(c["black"] + 0.2, c["crashes"][1]), (SHOT["sky"], c["direction"]), (SHOT["moon"], END["moon"]), (SHOT["long"], END["long"])], 0.1)
# inside the beam: the air as a slow, deep hum
deep = norm(filt(pink(N, 4), "bandpass", [50, 240]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.8 * tt) ** 2))
amb.x += pan_st(deep, 0) * 0.34 * gate(N, on("colours", "blue"))
# the evening
crickets(SHOT["dusk"] + 0.05, END["dusk"] - 0.1, amb, db(-25), 7, 4700, 1.6)
amb.x += pan_st(wind, 0) * 0.2 * gate(N, on("dusk"))
# Mars: a thin wind
mwind = norm(filt(pink(N, 9), "bandpass", [140, 420]) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.33 * tt) ** 2))
amb.x += pan_st(mwind, -0.1) * 0.24 * gate(N, on("mars"))

# ================================================================= 1. hook: he drinks; the sky goes out; the sunlight crashes in
sfx.add(pan_st(filt(whoosh(0.1, 500, 1500, 1, 0.8), "lowpass", 1800), 0.1), 0.0, db(-16))   # the bottle is up (over before "You")
for i, g in enumerate(c["glugs"]):
    bed.add(pan_st(glug_low(10 + i), 0.15), g, db(-7.0 if i else -6.0))                # glug, glug: under the words
low_thud(c["black"] + 0.01, -8, 70.0, 0.5, 0.2)                                       # the sky goes out
hi_tick(c["black"] + 0.01, -11, 20, 0.0)
hi_tick(c["black"] + 0.07, -14, 21, -0.3)
hi_tick(c["black"] + 0.13, -13, 22, 0.3)
pd = slide(330.0, 62.0, 0.36, 0.0, 1500)                                             # ... and winds down, in the pause after "black."
sfx.add(pan_st(pd, 0), c["black_end"] + 0.03, db(-12.5))
spit = fade(filt(white(int(0.09 * SR), 23), "bandpass", [2200, 7000]) * expdecay(int(0.09 * SR), 0.02), 0.002, 0.02)
sfx.add(pan_st(spit, 0.2), c["black_end"] + 0.06, db(-24))                           # the mouthful he nearly loses
# the camera lets go and the sun comes into view: a low swell
sw = norm(filt(brown(int(1.5 * SR), 24), "lowpass", 200)) * np.linspace(0, 1, int(1.5 * SR)) ** 2
bed.add(pan_st(fade(sw, 0.02, 0.2), 0), c["sunlight"] - 1.35, db(-10))
air(c["sunlight"] - 0.4, c["crashing"], -22, 25, lambda u: u ** 1.5)                 # its glare
for i, T in enumerate(c["crashes"]):                                                 # packets of sunlight hit the air
    pn = [0.1, -0.4, 0.4, -0.5, 0.2, -0.1, 0.5][i % 7]
    low_thud(T, -12.5, 170.0 - 8 * i, 0.22, 0.07)
    hi_tick(T, -11, 30 + i, pn)
    if T > c["air1_end"]:                                                            # heard in full once the line is over
        z = fade(blip(2100 - 260 * (i % 3), 700, 0.1, 40 + i, 0.03) + 0.5 * filt(white(int(0.1 * SR), 41 + i), "bandpass", [1500, 5000]) * expdecay(int(0.1 * SR), 0.02), 0.001, 0.02)
        sfx.add(pan_st(z, pn), T, db(-20))
sfx.add(pan_st(filt(whoosh(0.3, 300, 2400, 45, 0.9), "lowpass", 3000), 0), END["hook"] - 0.26, db(-18))   # into the beam

# ================================================================= 2. colours: every colour at once; red's long lazy wave
hi_tick(SHOT["colours"] + 0.02, -12, 50)
sh = norm(filt(white(int(0.5 * SR), 51), "highpass", 6000, 4)) * np.linspace(1, 0, int(0.5 * SR)) ** 2   # the beam, bright
bed.add(pan_st(sh, 0), SHOT["colours"], db(-20))
t_split = c["every"] - 0.2
for i in range(6):                                                                   # six colours fan out: six ticks, left to right
    hi_tick(t_split + 0.03 * i, -13, 52 + i, -0.6 + 0.24 * i)
low_thud(t_split, -14, 190.0, 0.18, 0.06)
run0 = c["once_end"] + 0.035                                                         # ... and are heard, one note each, after "once."
for i, m in enumerate((72, 74, 76, 79, 81, 84)):
    sfx.add(pan_st(fade(marimba(mtof(m), 0.12, 60 + i, 1.1), 0.001, 0.04), -0.5 + 0.2 * i), run0 + 0.036 * i, db(-21))
sfx.add(pan_st(filt(whoosh(0.3, 1800, 500, 66, 0.3), "lowpass", 2400), 0), c["red"] - 0.16, db(-25))   # the others run on
# red: a low, lazy hum that sways with its wave (under 200 Hz), and a slow "wah" in the pause after "waves..."
n_r = int((c["past_end"] + 0.1 - c["red"]) * SR)
tr = ar(n_r)
hum = np.sin(2 * np.pi * np.cumsum(104.0 * (1 + 0.035 * np.sin(2 * np.pi * 1.0 * tr))) / SR) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.0 * tr))
bed.add(pan_st(fade(hum, 0.25, 0.3), 0), c["red"], db(-13))
wah = slide(196.0, 147.0, 0.25, 0.01, 900, 5)
sfx.add(pan_st(wah, -0.1), c["waves_end"] + 0.05, db(-20))
for i, dt in enumerate((0.25, 0.8, 1.35)):                                           # the molecules it slips past: nothing happens
    hi_tick(c["slips"] + dt, -17, 70 + i, 0.3 * (-1) ** i)
hm = fade(pizz(mtof(57), 0.14, 73) + 0.6 * np.pad(pizz(mtof(52), 0.12, 74), (int(0.07 * SR), 0))[: int(0.14 * SR)], 0.001, 0.03)
sfx.add(pan_st(hm, 0.2), c["past_end"] + 0.04, db(-20))                              # "hm?" (a shrug), after "the air."

# ================================================================= 3. blue: short, twitchy; it smacks into the air and bounces everywhere
b = c["bonks"]
cut(SHOT["blue"] + 0.03, 80, -21, 700, 2600, 3000)
bz = buzz_hi(b[0] - SHOT["blue"], 31.0, 81)
bed.add(pan_st(bz, 0.1), SHOT["blue"], db(-17))                                      # the twitch, above the words
bzt = fade(filt(buzz(int(0.13 * SR), 190.0, 82, 0.6), "bandpass", [500, 3200]) * np.hanning(int(0.13 * SR)), 0.005, 0.02)
sfx.add(pan_st(bzt, 0.1), c["twaves_end"] + 0.02, db(-12.5))                           # ... and in full, in the pause after "waves."
# the first smack is on its word: a low thud, a tick, and one short bright bar
low_thud(b[0], -8, 130.0, 0.3, 0.1)
hi_tick(b[0], -10, 83)
sfx.add(pan_st(fade(ding(67, 0.09, 84), 0.0005, 0.03), 0), b[0], db(-19))
NOTES = [67, 71, 74, 76, 79, 83, 86, 91]
for i, T in enumerate(b[1:], 1):
    pn = 0.5 * (-1) ** i
    low_thud(T, -11, 150.0 + 6 * i, 0.2, 0.06)
    hi_tick(T, -11, 85 + i, pn)
    quiet = PAUSE[min(N - 1, int((T + 0.03) * SR))] > 0.5                              # is nobody speaking? then the bumper rings out
    sfx.add(pan_st(fade(ding(NOTES[i], 0.1 if quiet else 0.06, 90 + i), 0.0005, 0.03), pn), T, db((-19.5 if i == len(b) - 1 else -14.0) if quiet else -28))
air(c["bounces"], END["blue"], -19, 100, lambda u: u ** 2)                           # blue, everywhere: the air fills up
cut(SHOT["sky"] + 0.02, 101, -22, 500, 2000, 2400)

# ================================================================= 4. sky: blue from every direction
for i in range(16):                                                                  # each ray lands with a tick
    T = c["hits"] - 0.2 + (c["direction"] + 0.3 - (c["hits"] - 0.2)) * i / 15 + 0.5
    hi_tick(T, -15, 110 + i, 0.7 * np.sin(i * 2.4))
air(c["direction"], c["thats"] + 0.2, -20, 127, lambda u: np.sin(np.pi * u) ** 1.2)   # the sky filling in
sfx.add(pan_st(fade(tweet(128, 3300.0), 0.002, 0.03), -0.3), c["sky_end"] + 0.03, db(-18))   # a sky to fly in (after "sky.")

# ================================================================= 5. the Moon: no air, no sound
low_thud(SHOT["moon"] + 0.02, -10, 60.0, 0.6, 0.25)                                   # everything stops
low_thud(SHOT["moon"] + 0.95, -13, 90.0, 0.3, 0.1)                                    # he comes down from a slow hop
sfx.add(pan_st(fade(beep(2520.0, 0.06), 0.002, 0.01), -0.3), c["air_m_end"] + 0.035, db(-13.5))   # a radio beep, in the pause after "air,"
hi_tick(c["noon"] - 0.12, -13, 130, 0.3)                                             # the NOON tag
sfx.add(pan_st(fade(glass_tink(131, 2500.0, 0.17), 0.0005, 0.03), 0.25), c["tink"], db(-5))   # the bottle meets the helmet (after "noon.")
gr = slide(150.0, 118.0, 0.17, 0.0, 700, 4)
sfx.add(pan_st(gr, 0.1), c["tink"] + 0.2, db(-14.5))                                   # "hmph"

# ================================================================= 6. the long way through the air
cut(SHOT["long"] + 0.02, 140, -22, 400, 1700, 2100)
n_s = int((c["forty"] - c["crosses"] + 0.3) * SR)                                     # the sun goes down: a low slide, a ratchet counting up
dn = np.sin(2 * np.pi * np.cumsum(190.0 * (0.55) ** np.linspace(0, 1, n_s)) / SR) * np.sin(np.pi * np.linspace(0, 1, n_s)) ** 0.5
bed.add(pan_st(fade(dn, 0.05, 0.1), 0.2), c["crosses"] - 0.3, db(-15))
rt = ratchet(c["forty"] - c["crosses"] + 0.2, 10.0, 34.0, 141, True)
bed.add(pan_st(fade(rt, 0.004, 0.03), 0.2), c["crosses"] - 0.25, db(-15))
low_thud(c["forty"], -9, 110.0, 0.3, 0.1)                                             # 38x
hi_tick(c["forty"], -10, 142, 0.2)
for i in range(9):                                                                   # the blue leaves the beam, bit by bit
    hi_tick(c["blues"] + 0.1 + i * (c["away_end"] - c["blues"] - 0.1) / 9, -15, 150 + i, 0.6 - 0.14 * i)

# ================================================================= 7. dusk: the leftovers
cut(SHOT["dusk"] + 0.02, 160, -22, 400, 1500, 1900)
hey = slide(175.0, 131.0, 0.3, 0.012, 900, 5)                                         # red, lazy as ever, in the pause after "leftovers."
sfx.add(pan_st(hey, 0.3), c["leftovers_end"] + 0.06, db(-12.5))

# ================================================================= 8. Mars
cut(SHOT["mars"] + 0.02, 170, -22, 300, 1500, 1900)
bw = fade(np.concatenate([tone(620.0, 0.045), tone(930.0, 0.055)]) * 0.9, 0.002, 0.015)   # "boo-wip", after "Mars?"
sfx.add(pan_st(bw, -0.2), c["mars_end"] + 0.035, db(-17))
for i, (dt, f) in enumerate(((0.04, 2100.0), (0.14, 2640.0))):                        # the rover looks at him, after "Backwards."
    sfx.add(pan_st(fade(beep(f, 0.06), 0.002, 0.01), -0.5), c["backwards_end"] + dt, db(-15))
n_m = int((c["bsun_end"] - c["msky_end"] + 0.2) * SR)                                 # the sun goes down: a falling shimmer above the words
fall = norm(filt(white(n_m, 171), "bandpass", [5600, 9000], 2)) * np.linspace(1, 0.2, n_m) * np.sin(np.pi * np.linspace(0, 1, n_m)) ** 0.5
bed.add(pan_st(fade(fall, 0.02, 0.1), 0.3), c["msky_end"] - 0.1, db(-18))
low_thud(c["bsun"] + 0.3, -13, 90.0, 0.5, 0.2)
sfx.add(pan_st(fade(lamp_pip(1319.0, 0.1, 172), 0.002, 0.02), 0.3), c["bsun_end"] + 0.03, db(-16))   # the blue glow (after "sunset.")
air(c["blame"] - 0.1, c["dust_end"] + 0.3, -17, 173, lambda u: 0.4 + 0.6 * np.sin(np.pi * u))   # dust on the wind
rat = fade(ratchet(0.16, 30.0, 44.0, 174, False, 1900.0), 0.002, 0.02)
sfx.add(pan_st(rat, -0.5), c["dust_end"] + 0.035, db(-22))                           # the rover shakes it off

# ================================================================= 9. the button: he can swallow now
cut(SHOT["button"] + 0.02, 180, -23, 400, 1700, 2100)
sfx.add(pan_st(fade(tweet(181, 3500.0), 0.002, 0.03), 0.3), SHOT["button"] + 0.07, db(-17))   # the day again
gp = gulp(182)
sfx.add(pan_st(gp, 0.05), c["gulp"], db(-14.5))                                       # GULP (in the pause after "now.")
low_thud(c["gulp"] + 0.05, -15, 120.0, 0.22, 0.08, sfx)
br = breath(0.42, 183, True)
ah = filt(br, "bandpass", [500, 3800]) + 0.35 * np.sin(2 * np.pi * np.cumsum(np.linspace(300, 215, len(br))) / SR) * np.hanning(len(br))
sfx.add(pan_st(fade(ah, 0.03, 0.12), 0.05), c["ahh"], db(-22))                        # ahh
sfx.add(pan_st(filt(whoosh(0.3, 400, 1300, 184, 0.75), "lowpass", 1600), 0.1), DUR - 0.42, db(-22))   # the bottle goes back up

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
# the trail: a bright walking groove. It starts after "You" and dies with the sky on "black"
groove(mus, 0.36, c["black"] - 0.04, 112, ["G", "C"], gain=-9.5, seed=10, kick_on=False)
# the sunlight comes: one wide chord that opens as the blue comes back
drone(mus, c["sunlight"] - 0.1, END["hook"] - 0.05, [43, 50, 55, 59], cutoff=600, gain=-27, seed=11, swell=0.6)
# inside the beam: a curious loop ...
groove(mus, c["every"] - 0.5, c["at_once"] - 0.05, 108, ["Em", "C"], gain=-10.5, seed=12, kick_on=False, snaps=False)
# ... red's half-speed amble (bass and pad only)
groove(mus, c["red"] + 0.3, c["past_end"] - 0.1, 76, ["C", "F"], gain=-7, seed=13, kick_on=False, snaps=False, arp=False)
# ... and blue's twitchy sixteenths, which stop for the smack and come back for the pinball
groove(mus, c["blue"] + 0.28, c["tw_waves"] - 0.08, 138, ["Am", "F"], gain=-9, seed=14, kick_on=False, sixteen=True)
groove(mus, c["bounces"] + 0.2, c["everywhere"] - 0.06, 138, ["Am", "F"], gain=-7, seed=15, sixteen=True)
# the sky fills in: a chord that rises to "That's your sky."
drone(mus, c["hits"], c["thats"] - 0.12, [45, 52, 57, 60], cutoff=520, gain=-28, seed=16, swell=1.4)
drone(mus, c["thats"] + 0.3, END["sky"] - 0.08, [43, 50, 55, 59, 62], cutoff=760, gain=-27, seed=17, swell=0.25)
# the Moon: nothing at all. The long way: a sneaky walk (bass and snaps)
groove(mus, c["at"] + 0.35, c["moreair_end"] - 0.05, 98, ["Dm", "A"], gain=-6, seed=18, arp=False, padv=False, kick_on=False)
drone(mus, c["blues"] + 0.2, END["long"] - 0.1, [38, 45, 50, 53], cutoff=520, gain=-28, seed=19, swell=0.5)
# the sunset: one warm chord
drone(mus, c["and2"] + 0.2, c["leftovers_end"] + 0.02, [38, 45, 50, 54, 57], cutoff=700, gain=-27, seed=20, swell=0.35)
# Mars: the walking groove from the trail, in a strange key, out of the way of every pause
groove(mus, c["backwards"] + 0.15, c["backwards_end"], 100, ["Ebm", "B"], gain=-7, seed=21, kick_on=False, snaps=False)
groove(mus, c["butter"] + 0.25, c["msky_end"] - 0.02, 100, ["Ebm", "B"], gain=-7, seed=22, kick_on=False)
drone(mus, c["bsun"] + 0.2, c["dust_end"] + 0.1, [39, 46, 51, 54], cutoff=560, gain=-28, seed=23, swell=0.5)
# the button: nothing under the line or the gulp; one chord for the "ahh", gone before the loop
drone(mus, c["ahh"] + 0.1, DUR - 0.5, [43, 50, 55, 59], cutoff=700, gain=-31, seed=24, swell=0.2)
silence(mus, [(c["black"] - 0.03, c["sunlight"] - 0.12), (c["at_once"] - 0.05, c["red"] + 0.28), (c["waves_end"], c["slips"] - 0.1), (c["past_end"] - 0.05, c["blue"] + 0.26),
              (c["tw_waves"] - 0.08, c["bounces"] + 0.18), (c["everywhere"] - 0.06, c["hits"] - 0.02), (c["thats"] - 0.1, c["thats"] + 0.28), (END["sky"] - 0.05, c["at"] + 0.33),
              (c["moreair_end"] - 0.03, c["blues"] + 0.18), (c["leftovers_end"] + 0.04, c["backwards"] + 0.13), (c["backwards_end"] + 0.01, c["butter"] + 0.23),
              (c["msky_end"], c["bsun"] + 0.18), (c["dust_end"] + 0.12, c["ahh"] + 0.08), (DUR - 0.46, DUR)])

# ================================================================= voice + mix
# four words sit low in these takes between 300 Hz and 4 kHz (qc_inband.py; the takes are otherwise right): they come
# up a little, with soft edges, instead of being re-rolled
LIFTS = [(c["blue1"] - 0.02, c["blue1_end"] + 0.02, 3.5), (c["be"] - 0.02, c["be_end"] + 0.02, 3.0), (c["keeps"] - 0.02, c["keeps_end"] + 0.02, 3.0),
         (c["once"] - 0.03, c["once_end"] + 0.04, 4.5)]


def lift(vo):
    g = np.ones(len(vo))
    for a0, b0, d in LIFTS:
        i0, i1 = int(a0 * SR), int(b0 * SR)
        k = int(0.035 * SR)
        w = np.ones(i1 - i0)
        w[:k] = np.linspace(0, 1, k)
        w[-k:] = np.linspace(1, 0, k)
        g[i0:i1] += (db(d) - 1) * w
    return vo * g


master(WORK, sfx, bed, mus, amb, levels={"music": -12.5, "sfx": -8.5}, duck={"music": 0.78}, voice_fx=lift)
