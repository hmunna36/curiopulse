"""Why Does Your Leg KICK When You Tap Your Knee? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The exam room hums (under 250 Hz); a bouncy pizzicato while he chops; every chop is a dull tok under 250 Hz, every kick a
swish above 5.2 kHz on the word and a BOING in the pause after it; the spine says hi (a squeak) after "SPINE."; the
rewind is a record scratch in the gap before "That"; the slow-motion chop is a deep boom, the stretch a low rubber creak,
the spark a high zip up the wire and down again, and the slow kick lands with a big boing and a ding (REAL SPEED). His
brain snores under a music box; the memo lands; "huh?" after "asked.". 1902 is a projector's clatter and a stride piano;
the hand bell shimmers on "bell" (only its top), the hammers tok, and the bell rings out in full in the pauses after
"ALONE" and after "kick." (with the monocle's tink). 1904 is silence and a cricket. The dog gets flashbulbs, a fanfare and
a womp-womp for the scientist. The button: a dud tok, teeth grinding (above 5.2 kHz), a riser, the mega kick, the shoe's
whistle up and down, and the thunk as it lands back on his foot. What sits on a word is kept under 250 Hz or above
5.2 kHz; what carries a joke gets a pause.
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


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def soft_clip(y, k=3.0):
    return np.tanh(k * norm(y)) / np.tanh(k)


def tok(t, gain, f=210.0, tau=0.05, bus=None):
    """a chop on a knee: a dull knock, all of it under 250 Hz (it can sit on a word)"""
    (bus or bed).add(thump(0.22, f, f * 0.35, tau), t, db(gain))


def swish(t, dur, gain, seed=0, pan=0.0, lo=5200):
    """air moving fast: a brush of noise above `lo` (it can sit on a word)"""
    m = int(dur * SR)
    y = filt(white(m, 1300 + seed), "highpass", lo) * np.sin(np.linspace(0, np.pi, m)) ** 1.5
    bed.add(pan_st(fade(y, 0.01, 0.02), pan), t, db(gain))


def kick_sound(t, gain, seed=0, big=1.0):
    """the leg swinging up: a low whump and a high swish (both clear of the speech band)"""
    bed.add(pan_st(fade(filt(whoosh(0.32 * big, 60, 240, seed), "lowpass", 260), 0.01, 0.08), -0.2), t, db(gain))
    swish(t, 0.22 * big, gain - 2, seed + 1, -0.3)


def glints(t, n, gain, seed=0, step=0.045, f0=5800.0, df=320.0, pan=0.0):
    for i in range(n):
        bed.add(pan_st(glint(f0 + df * i, 0.08, seed + i), pan - 0.25 + 0.5 * i / max(1, n - 1)), t + step * i, db(gain))


def zip_hi(t0, t1, gain, seed=0, up=True):
    """a spark running along a wire: a rising (or falling) fizz above 5.2 kHz (it can sit on a word)"""
    m = int((t1 - t0) * SR)
    if m <= 0:
        return
    y = buzz_hi(t1 - t0, 44.0, seed)
    env = np.linspace(0.4, 1.0, m) if up else np.linspace(1.0, 0.4, m)
    bed.add(pan_st(fade(y[:m] * env, 0.02, 0.04), -0.2 if up else 0.2), t0, db(gain))


def hand_bell(t, gain, seed=0, top_only=False, dur=0.9):
    """a brass hand bell: a bright strike and its ring (top_only keeps what is above 5.2 kHz, for under a word); `dur` cuts
    the ring short so it is gone before the next word"""
    y = 0
    for k, (f, a, tau) in enumerate(((1480.0, 1.0, 0.55), (2960.0, 0.6, 0.35), (3990.0, 0.4, 0.25), (5920.0, 0.35, 0.18), (7400.0, 0.2, 0.12))):
        y = y + a * bell(f * (1 + 0.003 * seed), 0.9, tau)
    y = norm(y)[:int(dur * SR)]
    if top_only:
        y = filt(y, "highpass", 5200)
    else:
        y = soft_clip(y, 2.6)                                                     # more body for the same peak
    sfx.add(pan_st(fade(y, 0.002, min(0.12, dur * 0.4)), 0.35), t, db(gain))


def flash_pop(t, gain, seed=0):
    """a flashbulb: a low fwump and a high fizz (clear of the speech band) and a shutter's click above 5 kHz"""
    bed.add(pan_st(fade(filt(whoosh(0.2, 50, 200, seed), "lowpass", 240), 0.005, 0.06), 0.1), t, db(gain))
    swish(t, 0.12, gain - 3, seed + 1, 0.3, 6000)
    bed.add(pan_st(filt(shutter(), "highpass", 5200), 0.2), t + 0.02, db(gain - 2))


# ================================================================= ambience (one bed per world, gated to its shots)
clinic_on = gate(N, [(0, SHOT["brain"] + 0.42), (SHOT["button"], DUR)], 0.15)
room = norm(filt(brown(N, 1), "lowpass", 200))
hum = norm(np.sin(2 * np.pi * 60 * tt) + 0.5 * np.sin(2 * np.pi * 120 * tt))           # the fluorescent hum, low
amb.x += pan_st(room * clinic_on, 0) * 0.26
amb.x += pan_st(hum * clinic_on, 0.1) * 0.035
brain_on = gate(N, [(SHOT["brain"] + 0.35, END["brain"])], 0.12)
throb = norm(filt(brown(N, 2), "lowpass", 140) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.1 * tt)))
amb.x += pan_st(throb * brain_on, 0) * 0.30
past_on = gate(N, [(SHOT["lab"], END["hall"])], 0.1)
proj = norm(projector(N, 5, 18))
amb.x += pan_st(filt(proj, "lowpass", 240) * past_on, -0.1) * 0.25                     # the projector's motor (low) ...
bed.x += pan_st(filt(proj, "highpass", 5200) * past_on, 0.2) * db(-31)                  # ... and its clatter's top
hall_on = gate(N, [(SHOT["hall"], END["hall"])], 0.1)
amb.x += pan_st(norm(filt(brown(N, 3), "lowpass", 180)) * hall_on, 0) * 0.20             # a big quiet room
dog_on = gate(N, [(SHOT["dog"], END["dog"])], 0.1)
crowd = norm(filt(pink(N, 4), "lowpass", 230) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * tt)))
amb.x += pan_st(crowd * dog_on, 0) * 0.28                                                # a murmuring crowd (low)

# ================================================================= 1. the hook: the chops and the kick
swish(0.02, 0.3, -20, 10, -0.2)                                                          # frame 1: his hand hovering
tok(c["tap1"], -14)                                                                      # a first chop: a twitch
bed.add(pan_st(fade(filt(springs(11, 0.3), "lowpass", 240), 0.01, 0.06), -0.2), c["tap1"] + 0.06, db(-22))
tok(c["tap2"], -11, 190.0)                                                               # the chop that lands
kick_sound(c["kick1"], -12, 12)
sfx.add(pan_st(fade(boing(0.3, 170.0, 13), 0.003, 0.06), -0.3), c["kneecap_end"] + 0.02, db(-13))   # BOING (after "kneecap.")
swish(c["notme"], 0.2, -18, 14, 0.0)                                                     # hands up: not me
glints(c["xspine"], 6, -18, 15, 0.04, 5600.0, 300.0)                                     # the x-ray opens (above 5 kHz)
bed.add(pan_st(fade(filt(whoosh(0.4, 50, 220, 16), "lowpass", 240), 0.02, 0.1), 0.2), c["xspine"], db(-15))
sfx.add(pan_st(fade(squeak(0.12, 1700, 2500), 0.002, 0.03), 0.25), c["spine1_end"] + 0.04, db(-14))   # the spine says hi (after "SPINE.")

# ================================================================= 2. tap again, and the replay
tok(c["tap3"], -12, 200.0)
kick_sound(c["kick2"], -13, 20)
sfx.add(pan_st(fade(scratch(0.13, 21), 0.002, 0.03), 0.0), c["again1_end"] + 0.02, db(-15))   # REPLAY: a rewind scratch (in the gap)
tok(c["slowtap"], -9, 120.0, 0.22)                                                       # the slow chop: a deep boom
bed.add(pan_st(fade(filt(creak(0.55, 22, 50, 110), "lowpass", 240), 0.04, 0.12), -0.1), c["stretch"], db(-13))   # the muscle stretches (low)
swish(c["stretch"] + 0.05, 0.4, -21, 23, -0.1, 5600)                                     # ... and a rubbery squeak's top
bed.add(pan_st(glint(6400, 0.1, 24), -0.2), c["label"], db(-17))                         # THIGH MUSCLE
zip_hi(c["ping"], c["catch"], -16, 25, True)                                             # the spark runs up the wire
tok(c["catch"], -14, 160.0, 0.06)                                                        # the spine catches it
glints(c["catch"] + 0.02, 3, -17, 26, 0.05, 6600.0, 400.0)
bed.add(pan_st(fade(filt(whoosh(0.3, 50, 200, 27), "lowpass", 230), 0.01, 0.06), 0.1), c["yank"], db(-12))   # the yank (low)
bed.add(pan_st(fade(ratchet(0.2, 30, 60, 28, edges=True), 0.01, 0.04), 0.1), c["yank"] + 0.02, db(-19))
zip_hi(c["yank"] + 0.05, c["kick3"] - 0.1, -16, 29, False)                                # and back down
kick_sound(c["kick3"], -11, 30, 1.6)                                                     # the slow kick (on "back.")
sfx.add(pan_st(fade(boing(0.36, 130.0, 31), 0.003, 0.08), -0.3), c["back_end"] + 0.03, db(-11))   # BOING (after "back.")
bed.add(pan_st(glint(7600, 0.12, 32), 0.0), c["speed"] + 0.05, db(-15))                  # REAL SPEED

# ================================================================= 3. his brain, asleep
sfx.add(pan_st(fade(filt(whoosh(0.35, 80, 400, 40), "lowpass", 400), 0.02, 0.08), 0.0), SHOT["brain"] - 0.08, db(-20))   # the dive (ends before "Your")
for i, ts in enumerate((SHOT["brain"] + 0.45, SHOT["brain"] + 1.55)):
    bed.add(pan_st(fade(snore(0.7, 41 + i, 60.0), 0.05, 0.1), 0.1), ts, db(-12))           # snoring (low)
swish(c["memo"], max(0.2, c["memo_land"] - c["memo"]), -21, 42, 0.2)                     # the memo flutters in (above 5 kHz)
tok(c["memo_land"], -17, 230.0, 0.03)
bed.add(pan_st(glint(6800, 0.08, 43), 0.0), c["wake"] + 0.02, db(-16))                   # the mask snaps up
hm = slide(300.0, 430.0, 0.24, 0.0, None, 5)
sfx.add(pan_st(fade(soft_clip(hm, 2.0), 0.01, 0.05), 0.1), c["asked_end"] + 0.05, db(-15))      # "huh?" (after "asked.")

# ================================================================= 4. 1902: the bell and the hammers
sfx.add(pan_st(fade(filt(whoosh(0.3, 60, 300, 50), "lowpass", 360), 0.02, 0.08), 0.0), SHOT["lab"] - 0.3, db(-18))   # into the past
tok(c["stamp"], -12, 150.0, 0.08)                                                        # the 1902 stamp
hand_bell(c["ding1"], -16, 51, top_only=True)                                            # the bell (on "bell": only its top)
tok(c["hammer1"], -12, 230.0, 0.03); tok(c["hammer1"] + 0.035, -13, 210.0, 0.03)         # the two hammers
kick_sound(c["kick4"], -13, 52)
bed.add(pan_st(fade(page_rip(0.14, 53), 0.005, 0.03), 0.2), c["later"] + 0.02, db(-23))  # 150 TRIES LATER (a page flips)
hand_bell(c["ding2"], -8, 54, dur=c["made"] - c["ding2"] - 0.08)                                                            # the bell ALONE: in full, in the pause
kick_sound(c["kick5"], -11, 55, 1.2)
sfx.add(pan_st(fade(boing(0.18, 190.0, 56), 0.003, 0.04), -0.3), c["kick5"] + 0.05, db(-17))
hand_bell(c["ding3"], -10, 57, dur=c["he"] - c["ding3"] - 0.1)                                                            # again, to be sure (after "kick.")
kick_sound(c["kick6"], -12, 58, 1.2)
sfx.add(pan_st(fade(soft_clip(glass_tink(59, 3400.0, 0.08), 2.0), 0.001, 0.03), 0.4), c["monocle"] + 0.01, db(-14))   # the monocle drops

# ================================================================= 5. 1904: crickets
for i, dt in enumerate((0.04, 0.18)):                                                    # in the pause before "crickets."
    sfx.add(pan_st(fade(cricket(61 + i, 3, 4800), 0.003, 0.03), 0.3), c["experts_end"] + dt, db(-12))
for i, dt in enumerate((0.05, 0.2, 0.36)):                                               # and after it
    sfx.add(pan_st(fade(cricket(64 + i, 3, 4800), 0.003, 0.03), 0.3), c["crickets_end"] + dt, db(-13))
bed.add(pan_st(fade(filt(snore(0.4, 67, 70.0), "lowpass", 240), 0.03, 0.1), -0.2), c["nod"] + 0.1, db(-17))   # a top hat nods off

# ================================================================= 6. the dog's fame
flashes = [c["flash1"], c["flash1"] + 0.42, c["flash1"] + 0.95, c["medal"] + 0.1, c["medal"] + 0.55, c["sigh"] + 0.3]
for i, tf in enumerate(flashes):
    flash_pop(tf, -15, 70 + 3 * i)
glints(c["medal"], 5, -16, 90, 0.04, 6000.0, 350.0)                                      # the medal: sparkle (above 5 kHz)
cheer = filt(crackle(int(1.0 * SR), 260.0, 91, 5400, 11000), "highpass", 5200)           # applause's top under the words
bed.add(pan_st(fade(norm(cheer), 0.2, 0.3), 0.0), SHOT["dog"] + 0.2, db(-24))
for i, (f0, f1) in enumerate(((311.0, 262.0), (262.0, 208.0))):                          # womp womp (after "instead.")
    w = slide(f0, f1, 0.2, 5.0 if i else 0.0, None, 6)
    sfx.add(pan_st(fade(soft_clip(w, 1.8), 0.01, 0.04), 0.0), c["instead_end"] + 0.03 + 0.21 * i, db(-14))

# ================================================================= 7. the button: a dud, the clench, the mega kick, the shoe
tok(c["dud"], -12, 200.0)                                                                # nothing
q = slide(330.0, 440.0, 0.18, 0.0, None, 5)
sfx.add(pan_st(fade(soft_clip(q, 1.8), 0.01, 0.04), 0.1), c["kick4w_end"] + 0.04, db(-16))   # "hm?" (after "kick?")
bed.add(pan_st(fade(nail_scratch(0.9, 100, 14.0, edges=True), 0.05, 0.1), 0.0), c["clench"], db(-18))   # teeth grinding (top only)
tok(c["tap6"], -11, 180.0)
kick_sound(c["mega"], -9, 101, 1.8)
bed.add(pan_st(fade(filt(thump(0.5, 90, 30, 0.2), "lowpass", 200), 0.002, 0.1), 0.0), c["mega"], db(-8))   # WHUMP (low)
sw_up = slide_whistle(0.3, 900, 2400)
sfx.add(pan_st(fade(sw_up, 0.005, 0.04), -0.2), c["again2_end"] + 0.02, db(-17))         # the shoe flies up (after "again.")
sw_dn = slide_whistle(0.32, 2200, 700)
sfx.add(pan_st(fade(sw_dn, 0.005, 0.04), 0.1), c["shoe_land"] - 0.34, db(-18))           # ... and falls back
tok(c["shoe_land"], -9, 160.0, 0.07, bus=sfx)                                            # thunk: back on his foot
bed.add(pan_st(glint(7200, 0.1, 102), 0.0), c["shoe_land"] + 0.03, db(-17))

# ================================================================= score (drops out for every punchline)
groove(mus, c["legs"] + 0.05, c["did"] - 0.05, 112, ["F", "C", "Dm", "Bb"], gain=-15, seed=200, kick_on=False, snaps=True, arp=True)   # bouncy
groove(mus, c["slowtap"] + 0.1, c["back"] - 0.05, 120, ["Am", "F", "C", "G"], gain=-17, seed=201, kick_on=False, snaps=False, arp=True)   # the mechanism
drone(mus, SHOT["brain"] + 0.45, c["asked"] - 0.1, [48, 55, 60], cutoff=380, gain=-28, seed=210, swell=0.5)   # a lullaby hum (low)
rag(mus, c["scientist"] + 0.1, c["alone_end"] - 0.05, 128, gain=-12, seed=202)              # a stride piano for 1902
rag(mus, c["made"] + 0.2, c["kick3w_end"] - 0.02, 128, gain=-13, seed=203)
drone(mus, c["he"] + 0.25, c["experts_end"], [43, 50, 55], cutoff=400, gain=-26, seed=204, swell=0.4)   # the hall: nearly nothing
groove(mus, c["pavlov"] + 0.25, c["instead"] - 0.02, 124, ["C", "F", "G", "C"], gain=-13, seed=205, kick_on=True, snaps=True, arp=True)   # fame
drone(mus, c["clench"] + 0.1, c["and"] - 0.08, [38, 45, 50], cutoff=380, gain=-29, seed=206, swell=0.9)   # the clench: tension
silence(mus, [(c["did"] - 0.05, c["slowtap"] + 0.1), (c["back"] - 0.05, SHOT["brain"] + 0.4), (c["asked"] - 0.1, c["scientist"] + 0.1),
              (c["alone_end"] - 0.05, c["made"] + 0.2), (c["kick3w_end"] - 0.02, c["he"] + 0.25), (c["experts_end"], c["pavlov"] + 0.25),
              (c["instead"] - 0.02, c["clench"] + 0.1), (c["and"] - 0.08, DUR)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -12.5, "sfx": -12.0}, duck={"music": 0.72})
