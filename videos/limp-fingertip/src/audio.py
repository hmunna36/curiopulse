"""Hook Your Finger. Can You Straighten the TIP? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: thumb-pinky-swap's audio.py (the last hand test) and the skill's reference/examples/audio.finger-wrinkles.py.
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice
c = C
words = [(w["start"], w["end"]) for w in TL["words"]]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def low(y, f=250.0):
    return filt(y, "lowpass", f)


def high(y, f=5200.0):
    return filt(y, "highpass", f)


def soft(y, k=3.2):
    """soft-clip a peak-normalised transient: the same peak, more body (sound.md: the SNIP)"""
    y = norm(y)
    return np.tanh(k * y) / np.tanh(k)


def in_word(t, pre=0.03, post=0.06):
    return any(a - pre <= t <= b + post for a, b in words)


def next_word(t):
    nxt = [a for a, b in words if a > t]
    return min(nxt) if nxt else DUR


def wobble(t, big=1.0, seed=0):
    """the floppy tip after a push: a boing; the full one in a pause, only its low body on a word"""
    room = next_word(t) - t - 0.1
    if room > 0.25 and not in_word(t):
        bo = boing(min(0.5, room), 150.0 + 40 * (seed % 3), seed)
        sfx.add(pan_st(fade(bo, 0.002, 0.06), 0.12), t, db(-16 + 2 * (big - 1)))
    else:
        bo = boing(0.42, 150.0, seed)
        bed.add(pan_st(fade(low(bo, 260), 0.002, 0.06), 0.12), t, db(-12))
    bed.add(pan_st(fade(high(crack(0.02, seed + 1, 0.004, 3000), 5200), 0.0005, 0.015), 0.1), t, db(-24))


def layered_hit(t, mid=True, gain=0.0):
    """the hitstop's hit (sound.md, "Hitstops"); mid=False keeps the body out of the speech band (it sits on a word)"""
    sfx.add(pan_st(filt(snap(51), "highpass", 1800 if mid else 5200), 0.0), t, db(-20 + gain))
    if mid:
        sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), t + 0.004, db(-17 + gain))
        sfx.add(cymbal(52, 0.35), t + 0.01, db(-31 + gain))
    else:
        sfx.add(pan_st(filt(kick(0.9), "lowpass", 240), 0.0), t + 0.004, db(-13 + gain))


def tiny_steps(t0, t1, seed=0):
    """her six little feet on skin: soft high ticks"""
    k = 0
    t = t0
    while t < t1:
        bed.add(pan_st(fade(high(crack(0.012, seed + k, 0.003, 4000), 6000), 0.0005, 0.008), 0.25 - 0.1 * (k % 2)), t, db(-27))
        t += 0.07
        k += 1


def disconnect(seed=0):
    """the 'device unplugged' two-note fall (speech band: in a pause)"""
    a = ding(76, 0.14, seed)
    b = ding(69, 0.2, seed + 1)
    out = np.zeros(int(0.36 * SR))
    out[: len(a)] += a
    o = int(0.13 * SR)
    out[o:o + len(b)] += b[: len(out) - o]
    return fade(norm(out), 0.002, 0.04)


# ================================================================= ambience: the lake at sunset (lapping, birds, a wind chime)
lake_on = gate(N, [(0, DUR)])
LAPF = max(1, round(0.5 * DUR)) / DUR                                     # a lapping rate that divides the Short (loop-safe)
lap = norm(filt(brown(N, 5), "lowpass", 240) * (0.6 + 0.4 * np.abs(np.sin(np.pi * LAPF * tt))))
amb.x += pan_st(lap, 0.0) * 0.3 * lake_on
crickets(0.3, DUR - 0.4, bed, -37, seed=6, f=6200, rate=0.4)               # evening insects, far and high
sfx.add(pan_st(fade(tweet(4, 3900.0), 0.005, 0.05), 0.5), c["right_end"] + 0.05, db(-30))
sfx.add(pan_st(fade(tweet(9, 4200.0), 0.005, 0.05), -0.5), c["fingers_end"] - 2.6, db(-31))

# ================================================================= 1. the hook: Bend your finger like a hook... now straighten just the TIP.
bed.add(pan_st(fade(low(creak(0.25, 3, 70, 160), 260), 0.01, 0.05), 0.1), 0.0, db(-22))        # frame 0: the knuckle creaks into the hook
bed.add(pan_st(fade(low(thump(0.1, 200, 90, 0.03), 240), 0.001, 0.03), 0.1), c["hook_end"] + 0.04, db(-20))   # it settles
# the strain: a trembling high whine and a low rumble while the tip tries (all outside the speech band)
st_len = c["tip1_end"] + 0.25 - c["strain1"]
bed.add(pan_st(fade(buzz_hi(st_len, 23.0, 2, 5600), 0.08, 0.1), 0.15), c["strain1"], db(-27))
bed.add(pan_st(fade(low(brown(int(st_len * SR), 9), 160), 0.1, 0.12), 0.0), c["strain1"], db(-24))
# it gives up: a sad slide whistle down in the pause after "TIP."
sw_len = min(0.42, c["cant"] - c["tip1_end"] - 0.12)
sfx.add(pan_st(fade(slide_whistle(sw_len, 1500, 520), 0.005, 0.05), 0.2), c["tip1_end"] + 0.03, db(-20))
# the flash-forward window: a glint in, the catapult's twang inside it (high), a glint out
bed.add(pan_st(glint(7400, 0.1, 7), 0.35), c["ff"], db(-22))
bed.add(pan_st(fade(high(twang(880.0, 0.25, 8, 0.12), 3000), 0.003, 0.05), 0.35), c["ff"] + 0.18, db(-25))
bed.add(pan_st(glint(6900, 0.08, 9), 0.35), c["ff"] + 0.56, db(-24))

# ================================================================= 2. the answer: Can't? Your tip just went... OFFLINE.
sfx.add(pan_st(whoosh(0.18, 300, 2200, 10), 0.0), SHOT["answer"] - 0.15, db(-27))            # the cut to his eyes
sfx.add(pan_st(whoosh(0.16, 300, 2000, 11), 0.1), c["cut_went"] - 0.14, db(-28))
ticking(c["went"] + 0.05, c["offline"] - 0.04, bed, -26, r0=10, r1=14, seed=12)              # the tip "thinking" (spinner)
layered_hit(c["icon"] + 0.16, mid=False, gain=-1.0)                                          # the hitstop on the sign
dc = disconnect(13)
sfx.add(pan_st(dc, 0.15), c["offline_end"] + 0.03, db(-19))                                  # unplugged (in the pause)

# ================================================================= 3. the poke: Poke it. Floppy, right?
sfx.add(pan_st(whoosh(0.18, 300, 2200, 20), -0.1), SHOT["poke"] - 0.15, db(-27))
for i, p in enumerate((c["poke1"], c["poke2"])):
    bed.add(pan_st(fade(low(thump(0.08, 260, 120, 0.02), 260), 0.001, 0.02), 0.1), p - 0.05, db(-19))
    wobble(p + 0.09, 1.0, 21 + 3 * i)
    bed.add(pan_st(squeak(0.09, 2600, 3600), 0.3), p + 0.12, db(-26))                     # her "wheee" as she bounces (high)
sfx.add(pan_st(whoosh(0.16, 300, 2000, 25), 0.1), c["cut_floppy"] - 0.14, db(-28))

# ================================================================= 4. the strings: Bend the middle, and its string goes tight... the tip's two go SLACK.
sfx.add(pan_st(whoosh(0.22, 400, 2600, 30), 0.2), SHOT["strings"] - 0.18, db(-21))           # the whip into the glass
for i in range(4):                                                                           # the hand turns to glass (high)
    bed.add(pan_st(glint(6400 + 500 * i, 0.09, 31 + i), -0.3 + 0.2 * i), c["glass"] + 0.05 + 0.06 * i, db(-24))
tw = twang(523.0, max(0.12, min(0.3, next_word(c["tight_end"]) - c["tight_end"] - 0.12)), 33, 0.02)
sfx.add(pan_st(fade(tw, 0.002, 0.06), -0.1), c["tight_end"] + 0.02, db(-19))                  # the middle string pulls TIGHT (pause)
bed.add(pan_st(fade(low(glide(140, 70, 0.4), 220), 0.01, 0.08), 0.0), c["sag"], db(-18))      # the tip's two sag (low)
tiny_steps(c["climb"], c["nap"] - 0.1, 36)                                                   # she climbs into the hammock
sfx.add(pan_st(fade(high(snore(0.3, 37, 58.0), 1500), 0.02, 0.05), 0.2), c["slack_end"] + 0.22, db(-25))   # a tiny snore
sfx.add(pan_st(whoosh(0.16, 300, 2000, 38), -0.1), c["cut_slack"] - 0.14, db(-28))

# ================================================================= 5. the doctors: Doctors use this exact test... on jammed fingers.
sfx.add(pan_st(whoosh(0.22, 400, 2600, 40), -0.2), SHOT["doctors"] - 0.18, db(-21))
bed.add(pan_st(glint(8000, 0.12, 41), 0.25), c["mirror"] + 0.2, db(-21))                     # her head mirror catches the light
bed.add(pan_st(fade(low(thump(0.14, 180, 60, 0.04), 240), 0.001, 0.04), 0.0), c["stamp"] + 0.04, db(-14))   # DOCTOR'S TEST stamp
bed.add(pan_st(fade(high(crack(0.03, 42, 0.006, 2500), 4500), 0.0005, 0.02), 0.0), c["stamp"] + 0.04, db(-22))
for i, p in enumerate((c["tap1"], c["tap2"])):                                               # the reflex hammer: tok, and a wobble
    bed.add(pan_st(fade(high(chop(43 + i, 0.4), 2500), 0.0005, 0.02), 0.2), p, db(-21))
    bed.add(pan_st(fade(low(boing(0.3, 190.0, 45 + i), 260), 0.002, 0.05), 0.15), p + 0.01, db(-17))

# ================================================================= 6. the payoff: (silence) If that tip goes STIFF... the middle string might be torn.
# full silence from "fingers." to the snap (the music and the lake's lapping step back), then the biggest hit
snap_t = c["snap"]
sn = soft(snap(61), 3.0)
sfx.add(pan_st(fade(sn, 0.0005, 0.03), 0.0), snap_t, db(-12))                                # the string breaks: SNAP
bed.add(pan_st(fade(low(twang(98.0, 0.6, 62, -0.2), 260), 0.002, 0.1), 0.0), snap_t + 0.01, db(-9))   # the tip's strings yank taut
nd = int(0.34 * SR)
dun = sum(L.saw(L.mtof(m), nd, 0.004, 560 + m) for m in (43, 50, 55, 58))
dun = filt(dun, "lowpass", 220) * np.exp(-ar(len(dun)) / 0.12)
bed.add(pan_st(fade(np.tanh(2.6 * norm(dun)) / np.tanh(2.6), 0.002, 0.08), 0.0), snap_t, db(-10))   # the low DUN under "STIFF"
layered_hit(snap_t + 0.004, mid=False, gain=1.5)
fl_t = c["stiff_end"] + 0.02                                                                 # her "wheeee" as she flies off (high)
sfx.add(pan_st(fade(high(slide_whistle(min(0.42, c["middle2"] - fl_t - 0.12), 1800, 3400), 1500), 0.005, 0.05), 0.5), fl_t, db(-21))
bed.add(pan_st(fade(high(crackle(int(0.35 * SR), 60, 63), 3500), 0.01, 0.1), -0.1), c["torn_tag"] - 0.05, db(-28))   # the frayed ends fizz
sfx.add(pan_st(whoosh(0.16, 300, 2000, 64), 0.1), SHOT["torn"] - 0.14, db(-28))

# ================================================================= 7. the button: Still floppy? Congrats... you're FINE.
sfx.add(pan_st(whoosh(0.2, 400, 2600, 70), 0.2), SHOT["button"] - 0.2, db(-22))             # the whip back to the real hand
bed.add(pan_st(fade(low(thump(0.08, 260, 120, 0.02), 260), 0.001, 0.02), 0.1), c["poke3"] - 0.05, db(-19))
wobble(c["poke3"] + 0.09, 1.0, 71)
ch_len = c["land"] - c["chute"]
bed.add(pan_st(fade(high(slide_whistle(min(1.2, ch_len), 3600, 2200), 2000), 0.05, 0.1), 0.4), c["chute"], db(-27))   # she floats down
bed.add(pan_st(fade(high(flutter(0.3, 72), 2500), 0.01, 0.05), 0.3), c["chute"] + 0.1, db(-26))
gap_c = next_word(c["congrats_end"]) - c["congrats_end"] - 0.12
if gap_c > 0.2:
    sfx.add(pan_st(fade(party_horn(min(0.36, gap_c), 73, 660.0), 0.005, 0.05), -0.2), c["congrats_end"] + 0.03, db(-22))   # a tiny party horn
bed.add(pan_st(glint(7800, 0.1, 74), 0.25), c["land"], db(-22))                              # she lands: a sparkle
bed.add(pan_st(fade(high(crack(0.012, 75, 0.003, 4000), 6000), 0.0005, 0.008), 0.25), c["land"] + 0.02, db(-25))
# (the loop: frame 0's creak at the start of the file)

# ================================================================= score: the loop score (a whole number of bars), stopping dead
BPM, BEAT, BARS = fit_loop(DUR, 96, 124, want=108)
bS = bar_at(SHOT["strings"], BEAT, 1)     # the glass on the beat nearest its whip
bD = bar_at(SHOT["doctors"], BEAT, 1)     # the doctor's beat on the beat nearest its whip
bB = bar_at(SHOT["button"], BEAT)         # the button on a BAR line: whole bars to the loop
print(f"loop score: {BARS} bars at {BPM:.1f} BPM (beat {BEAT:.3f} s; bars x 4 x beat = {BARS * 4 * BEAT:.3f} s = DUR {DUR:.3f} s); "
      f"sections at {bS:.2f}, {bD:.2f}, {bB:.2f} s")
groove(mus, 0.0, bS, BPM, ["D", "Bm", "G", "A"], gain=-12.5, seed=20, kick_on=True)         # the porch at sunset: warm, laid back
HOOK = [(0, 81), (0.5, 79), (1, 78), (2, 74), (2.5, 76)]                                       # his motif: a little falling hook
PZ = lambda m, d, s: pizz(L.mtof(m), d, s)
MB = lambda m, d, s: music_box(L.mtof(m), min(d, 0.5), s)
riff(mus, HOOK, BEAT, 0.0, bS, every=8, inst=PZ, gain=-21, octave=None)
groove(mus, bS, bD, BPM, ["Em", "C", "G", "D"], gain=-14.0, seed=21, kick_on=False, snaps=False, padv=False, arp=True)   # the glass: lighter
BUG = [(0, 88), (0.5, 91), (1, 93), (1.5, 91)]                                                 # her motif: a music-box twinkle
riff(mus, BUG, BEAT, bS, bD, every=8, inst=MB, gain=-25, octave=None)
groove(mus, bD, bB, BPM, ["G", "C", "D", "G"], gain=-13.0, seed=22, kick_on=True, padv=True)   # the doctor's beat: bouncy
riff(mus, BUG, BEAT, bD, bB, every=4, inst=steel_pan, gain=-24, octave=None)
groove(mus, bB, DUR - 1e-4, BPM, ["D", "Bm", "G", "A"], gain=-12.5, seed=24, kick_on=True)   # the button: back to the porch
riff(mus, HOOK, BEAT, bB, DUR - 0.05, every=8, inst=PZ, gain=-21, octave=None)
shaker(mus, 0.0, bS, BEAT, gain=-33.0)
shaker(mus, bB, DUR, BEAT)
# the last beat leads into bar 1 (two pickup notes, gone before the loop)
mus.add(pan_st(fade(pizz(L.mtof(74), 0.2, 400), 0.002, 0.05), 0.2), DUR - BEAT, db(-20))
mus.add(pan_st(fade(pizz(L.mtof(76), 0.2, 401), 0.002, 0.08), -0.2), DUR - BEAT / 2, db(-20))
# the dead stops (direction.md rule 16): the tip gives up ("TIP." to "Can't?"), the punchline OFFLINE, "Floppy", full
# silence before the payoff (to the snap), "Congrats..." before FINE
silence(mus, [(0.0, c["hook_end"] + 0.06),                               # the music enters after "...like a hook..."
              (c["tip1_end"] - 0.05, c["cant_end"] + 0.15),
              (c["offline"] - 0.06, c["offline_end"] + 0.55),
              (c["poke2"] - 0.05, c["poke2"] + 0.4),
              (c["hush"] - 0.05, snap_t + 0.3),
              (c["back"] - 0.22, c["still"] + 0.35),                  # the real hand is back: a dead stop under "Still"
              (c["congrats_end"] - 0.05, c["youre"] + 0.05)])
# the lake steps back in the silence too
amb.x *= (1 - 0.7 * gate(N, [(c["hush"], snap_t)], smooth=0.15))

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13.5, "sfx": -11.5}, duck={"music": 0.72})
