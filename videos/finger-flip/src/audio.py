"""Can You Wag Your Fingers Like WIPERS? 🌧️ Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The van on a rainy evening: rain on the roof (a low drum under 380 Hz and its patter above 5.2 kHz), the wipers'
thwump at every turn (low) with the rubber's squeak on top (high), the fingers' little air swishes (high). The hook
rides a bouncy marimba groove that gives way to a riser on "now FASTER!"; the flip is a fwip and a small boing in the
pause after it. The answer: the whip, two pops as the twins' faces appear, a love ding and sparkle after "TWINS." with
the hitstop's layered hit. "Slow down": the score slows to a sneaky half-time; pops for the IN and OUT tags. The
referee: the window's clunk, its whistle (whole in the pauses, only its air under the words), a march that speeds up
on "Faster?", a sad bwomp and a flag flap when it gives up. The twins COPY: a snap into the mirror, the high-five clap
with the layered hit after "COPY.", a bright groove. Outside: heavier rain, drips off the awning, a soft swish per
kick, the gran's sip; their boots splash together after "too!", then one cricket (awkward). The button: the whip back
into the van, a strain squeak under "flip it BACK", and the hook's groove again, its bar grid running into frame 1.
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


def plus(*xs):
    n = max(x.shape[-1] for x in xs)
    out = np.zeros(xs[0].shape[:-1] + (n,))
    for x in xs:
        out[..., :x.shape[-1]] += x
    return out


def soft_clip(y, k=3.2):
    y = norm(y)
    return np.tanh(k * y) / np.tanh(k)


def speaking(t, pad=0.03):
    """is a word being said at t (with a little margin)?"""
    return any(w["start"] - pad <= t <= w["end"] + pad for w in words)


def low_thud(t, gain, f=150.0, dur=0.3, tau=0.09):
    bed.add(thump(dur, f, f * 0.3, tau), t, db(gain))


def air(t, gain, seed=0, pan=0.0, dur=0.12):
    """a fingertip cutting the air: all above 5 kHz (it can sit on a word)"""
    bed.add(pan_st(fade(filt(whoosh(dur, 3000, 9000, seed, 0.6), "highpass", 5200), 0.005, 0.04), pan), t, db(gain))


def whip(t, gain, seed=0, pan=0.0):
    sfx.add(pan_st(whoosh(0.22, 300, 2400, seed), pan), t - 0.22, db(gain))


def hit_layers(th, g=0.0):
    sfx.add(pan_st(filt(snap(51), "highpass", 1800), 0.0), th, db(-20 + g))
    sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), th + 0.004, db(-17 + g))
    sfx.add(cymbal(52, 0.45), th + 0.01, db(-31 + g))


def ref_whistle(dur, seed=0, edges=False):
    """a referee's pea whistle: a 3.1 kHz tone trilled by the pea (about 28 Hz), breathy; edges=True keeps only the air
    above 5.2 kHz so it can sit under a word"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(seed)
    f = 3100 + 60 * np.sin(2 * np.pi * 5 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    trill = 0.55 + 0.45 * np.sin(2 * np.pi * (27 + 3 * rng.random()) * t)
    x = (np.sin(ph) + 0.25 * np.sin(2 * ph)) * trill + 0.25 * filt(rng.standard_normal(n), "bandpass", [2600, 3900]) * trill
    env = np.minimum(1, t / 0.015) * np.minimum(1, (dur - t) / 0.04)
    x = norm(x * env)
    if edges:
        x = norm(filt(x, "highpass", 5200)) * 0.5
    return x


def wiper_thwump(t, gain, seed=0, pan=0.0):
    """a wiper blade turning round: a soft rubbery thump (low) and the rubber's chirp (high)"""
    bed.add(thump(0.16, 140.0, 60.0, 0.05), t, db(gain))
    bed.add(pan_st(fade(filt(squeak(0.07, 5400, 6400), "highpass", 5200), 0.003, 0.02), pan), t + 0.01, db(gain - 9))


# ================================================================= ambience: rain, in the van and outside
inside = [(0.0, END["copy"]), (SHOT["button"], DUR)]
outside = [(SHOT["pair"], END["sync"])]
drum = norm(filt(pink(N, 3), "lowpass", 380) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.23 * tt)))
amb.x += pan_st(drum * gate(N, inside), 0.0) * 0.30
amb.x += pan_st(drum * gate(N, outside), 0.0) * 0.40
patter = norm(filt(white(N, 4), "highpass", 5200)) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 7.3 * tt)) ** 4)
bed.x += pan_st(patter * gate(N, inside), -0.1) * db(-38)
bed.x += pan_st(patter * gate(N, outside), 0.1) * db(-33)
# drips off the awning (high clicks), outside only
rng = np.random.default_rng(9)
for tk in np.sort(rng.uniform(SHOT["pair"], END["sync"], 22)):
    bed.add(pan_st(fade(filt(drip(int(tk * 100), 1500.0), "highpass", 4800), 0.001, 0.03), rng.uniform(-0.6, 0.6)), float(tk), db(-30))

# the wipers (the driver's view only) and the fingers' swishes
for i, tk in enumerate(c["wiper_turn"]):
    wiper_thwump(tk, -30 if (tk > c["now"] and tk < SHOT["answer"]) else -26, 10 + i, 0.3 * (-1) ** i)
bed.add(pan_st(filt(brown(int((END["hook"]) * SR), 5), "lowpass", 160), 0.0), 0.0, db(-30))   # the wiper motor (low)
bed.add(pan_st(filt(brown(int((DUR - SHOT["button"]) * SR), 6), "lowpass", 160), 0.0), SHOT["button"], db(-30))
for i, tk in enumerate(c["swish"]):
    air(tk, -31, 100 + i, 0.25 * (-1) ** i)

# ================================================================= 1. the hook: wag your fingers like wipers. same way... now FASTER!
sfx.add(pan_st(riser(c["faster_end"] - c["faster"], 21, 300, 1700), 0.0), c["faster"], db(-32))       # the speed-up (under the words, quiet)
bed.add(pan_st(fade(filt(whoosh(0.18, 2500, 9000, 22, 0.5), "highpass", 4800), 0.003, 0.04), 0.0), c["flip"], db(-16))   # fwip: the flip (high, on the word)
low_thud(c["flip"] + 0.01, -15, 170.0, 0.18, 0.05)
gap1 = c["flipped"] - c["faster_end"]
bo = boing(min(0.42, gap1 - 0.08), 210.0, 23)
sfx.add(pan_st(fade(bo, 0.003, 0.06), 0.0), c["faster_end"] + 0.02, db(-25))                 # boing: they flipped (the pause)
whip(SHOT["answer"], -31, 24, -0.2)

# ================================================================= 2. the answer: flipped into a mirror? your hands are clingy TWINS.
pops([c["faces"], c["faces"] + 0.07], bed, db(-19), 25)                                        # the twins' faces pop (high)
sfx.add(pan_st(ding(84, 0.16, 26, 1.1), 0.0), c["heart"], db(-21))                            # the heart lands (after "TWINS.")
for j in range(4):
    bed.add(pan_st(fade(glint(5600 + 420 * j, 0.1, 27 + j), 0.002, 0.04), 0.2 * j - 0.3), c["heart"] + 0.04 + 0.045 * j, db(-24))
sfx.add(pan_st(filt(snap(51), "highpass", 1800), 0.0), c["heart"], db(-21))       # the hitstop's hit, no cymbal tail (it rang into "Slow")
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), c["heart"] + 0.004, db(-18))

# ================================================================= 3. slow down. one swings IN, the other OUT...
sl = slide(520.0, 180.0, 0.3, 0.0, None, 5)
gap2 = c["in"] - 0.0
_down = [w for w in words if w["word"].lower().startswith("down")][0]
_one = [w for w in words if w["word"] == "One"][0]
gs = _one["start"] - _down["end"]
sfx.add(pan_st(fade(sl[: int(max(0.12, gs - 0.12) * SR)], 0.01, 0.05), 0.0), _down["end"] + 0.03, db(-22))   # the slow-down slide (the pause)
for j, tk in enumerate((c["in"], c["out"])):
    bed.add(pan_st(fade(glint(6000.0 + 500 * j, 0.09, 28 + j), 0.002, 0.04), 0.3 * (1 - 2 * j)), tk + 0.02, db(-21))   # the tags pop (high)

# ================================================================= 4. your brain's refereeing / 5. faster? the ref gives up...
low_thud(c["window"], -19, 110.0, 0.26, 0.08)                                                  # the window opens (low)
bed.add(pan_st(glint(6300.0, 0.1, 30), 0.0), c["window"] + 0.06, db(-24))
for i, tk in enumerate(c["tweet"]):
    full = not speaking(tk, 0.06) and not speaking(tk + 0.2, 0.08)
    wh = ref_whistle(0.18, 31 + i, edges=not full)
    sfx.add(pan_st(fade(wh, 0.005, 0.04), 0.15 * (-1) ** i), tk, db(-21 if full else -26))       # the referee's whistle
gap3 = c["andthe"] - c["up_end"]
sfx.add(pan_st(fade(filt(slide(180.0, 95.0, max(0.18, gap3 - 0.05), 0.0, 260, 4), "lowpass", 300), 0.01, 0.04), 0.0), c["up_end"] + 0.0, db(-19))   # bwomp: it gives up (low)
bed.add(pan_st(fade(filt(white(int(0.3 * SR), 32), "highpass", 5200), 0.01, 0.1), 0.2), c["flag"], db(-27))   # the flag flaps (high)

# ================================================================= 6. ...and the twins COPY.
bed.add(pan_st(fade(filt(whoosh(0.16, 2500, 9000, 33, 0.5), "highpass", 4800), 0.003, 0.04), 0.0), c["flip3"], db(-17))   # snap into the mirror (high)
low_thud(c["flip3"] + 0.01, -16, 170.0, 0.16, 0.05)
clap = soft_clip(plus(filt(snap(34), "highpass", 900), 0.5 * filt(snap(35), "bandpass", [1200, 2600])))
sfx.add(pan_st(clap, 0.0), c["five"], db(-16))                                                 # the high-five (after "COPY.")
hit_layers(c["five"], -1.0)
for j in range(5):
    bed.add(pan_st(fade(glint(5800 + 380 * j, 0.1, 36 + j), 0.002, 0.04), 0.25 * (j - 2)), c["five"] + 0.05 + 0.04 * j, db(-24))
whip(SHOT["pair"], -31, 37, 0.2)

# ================================================================= 7. two PEOPLE swinging their legs side by side?
for i, tk in enumerate(c["kick"]):
    if tk > c["splash"] - 0.1:
        break
    air(tk, -30, 200 + i, -0.3 if i % 2 else 0.3, 0.16)                                         # a boot's swing (high)
_side = [w for w in words if w["word"].lower().startswith("side?")][0]
_they = [w for w in words if w["word"] == "They"][0]
if _they["start"] - _side["end"] > 0.22:
    bed.add(pan_st(gulp(38), 0.3), _side["end"] + 0.02, db(-22))                                # the gran sips (low)

# ================================================================= 8. They flip too! (their boots splash together)
low_thud(c["sync"], -16, 160.0, 0.2, 0.06)
gap4 = c["nowtry"] - c["splash"]
sp = splash(0.6, 39, 0.6)
sfx.add(pan_st(fade(sp[: int(max(0.15, gap4 - 0.2) * SR)], 0.004, 0.06), 0.0), c["splash"], db(-17))   # splash (the pause)
bed.add(pan_st(cricket(40, 2, 4700), 0.4), c["splash"] + max(0.18, gap4 - 0.3), db(-31))      # one cricket: awkward
whip(SHOT["button"], -31, 41, -0.2)

# ================================================================= 9. the button: now try to flip it BACK.
bed.add(pan_st(fade(filt(squeak(0.5, 5300, 6800), "highpass", 5200), 0.02, 0.1), 0.0), c["strain"], db(-26))   # the strain (high)
low_thud(c["back_end"] + 0.03, -22, 140.0, 0.16, 0.05)

# ================================================================= score (out for every punchline)
BPM = 112
BEAT = 60.0 / BPM
groove(mus, 0.0, c["now"] - 0.02, BPM, ["F", "Bb", "C", "F"], gain=-5, seed=10)              # the test: a bouncy wiper groove
groove(mus, c["faster"] + 0.12, c["faster_end"], 150, ["C", "C", "C", "C"], gain=-8, seed=11, sixteen=True)   # ...speeding up
groove(mus, c["mirror"] + 0.35, c["heart"] - 0.05, 96, ["F", "Dm", "Bb", "C"], gain=-8, seed=12, kick_on=False, snaps=False)   # the twins: sweet
groove(mus, c["in"] + 0.3, c["brain"] - 0.3, 80, ["Dm", "Dm", "Bb", "A"], gain=-10, seed=13, kick_on=False, half=True)   # slow, sneaky
groove(mus, c["brain"] + 0.5, c["faster2"], 120, ["Dm", "A", "Dm", "A"], gain=-7, seed=14)  # the referee's march
groove(mus, c["faster2"] + 0.1, c["theref"] - 0.02, 156, ["Dm", "A", "Dm", "A"], gain=-7, seed=15, sixteen=True)   # faster!
groove(mus, c["five"] + 0.4, END["copy"] + 0.05, 120, ["F", "C"], gain=-6, seed=16)            # COPY: bright
groove(mus, c["legs"] - 0.05, c["too"], 104, ["Bb", "F", "C", "F"], gain=-11, seed=17, kick_on=False)   # a stroll on the step
# the button and the loop: the hook's groove again, on a bar grid that runs straight into frame 1
_t0 = DUR - BEAT * 4 * 1                                                                        # one bar before the end
while _t0 > SHOT["button"] + 0.4 + BEAT * 4:
    _t0 -= BEAT * 4
groove(mus, _t0, DUR + 0.6, BPM, ["F", "Bb", "C", "F"], gain=-5, seed=10)
silence(mus, [(c["flip"] - 0.05, c["mirror"] + 0.3), (c["heart"] - 0.08, c["heart"] + 0.35), (c["theref"] - 0.1, c["andthe"] + 0.1),
              (c["five"] - 0.08, c["five"] + 0.4), (c["too"] - 0.05, c["nowtry"] + 0.1)])

master(WORK, sfx, bed, mus, amb, levels={"sfx": -10.0})   # the sfx bus 5 dB under the house level: its peaks are low thumps, so the gags sat above the voice
