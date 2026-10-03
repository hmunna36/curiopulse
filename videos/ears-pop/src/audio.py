"""Why Do Your Ears POP on a Plane? Short: sound design, score and mix, cue-locked to timeline.json.

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


def env_pts(pts):
    """a gain envelope over the whole Short from (time, gain) points (linear between them)"""
    ts, gs = zip(*pts)
    return np.interp(tt, ts, gs)


CABIN = ("hook", "burp", "landing", "swallow", "baby", "button", "sub")
INSIDE = ("pocket", "climb", "tube", "squeeze", "yank")

# ================================================================= ambience (one bed per world, gated to its shots)
# the cabin: the engines' low roar (all under ~420 Hz). It roars at take-off and again as the loop comes round.
cab = cabin_bed(N, 1)
swell = env_pts([(0, 1.0), (0.9, 0.8), (2.6, 0.42), (c["loop"] - 0.3, 0.42), (c["loop"] + 0.1, 0.8), (DUR, 1.0)])
amb.x += cab * gate(N, on(*CABIN)) * swell
# inside the ear: everything muffled, a slow warm pulse
pulse = filt(pink(N, 4), "bandpass", [45, 260]) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.9 * tt) ** 2)
amb.x += pan_st(pulse / (np.abs(pulse).max() + 1e-9), 0) * 0.55 * gate(N, on(*INSIDE))

# ================================================================= 1. hook: take-off; the pressure builds ... POP
sfx.add(pan_st(chime(698.5, 0.9), 0.25), 0.0, db(-17))                                # frame 1: the second half of the cabin's bing-bong
sfx.add(pan_st(filt(whoosh(1.5, 180, 520, 11, 0.25), "lowpass", 600), 0), 0.0, db(-13))   # the engines spool up (low, under her first words)
sfx.add(np.stack([jingle(0.9, 12, 26), jingle(0.9, 13, 26)]) * 0.5, 0.05, db(-36))    # the galley rattles
sfx.add(pan_st(rustle(0.3, 14), -0.2), 0.08, db(-30))                                 # the bag and the bottle slide down the tray
# the pressure builds in his ears: a rising tone under "and your ears go...", a rubbery stretch in the pause
sfx.add(pan_st(riser(c["go_end"] - c["and"] + 0.35, 15, 160, 620), 0), c["and"] - 0.3, db(-28))
for k, tk in enumerate((c["and"] - 0.2, c["ears"] - 0.1, c["go"] - 0.05, c["go_end"] - 0.12)):
    bed.add(pan_st(heartbeat(k), 0), tk, db(-12 + k))
sfx.add(pan_st(filt(creak(0.3, 16, 80, 200), "lowpass", 700), -0.2), c["ears_end"] + 0.0, db(-26))   # the chip bag, tight as a drum
sfx.add(pan_st(balloon_inflate(c["pop"] - c["go_end"] - 0.02, 17), 0), c["go_end"] + 0.01, db(-13))
# POP: both ears, a hair apart; the tray jumps
POP = c["pop"]
sfx.add(cork_pop(18, 560), POP, db(-5), pan=-0.55)
sfx.add(cork_pop(19, 700), POP + 0.022, db(-6), pan=0.55)
sfx.add(thump(0.3, 150, 52, 0.09), POP, db(-11))
sfx.add(np.stack([jingle(0.28, 20, 34), jingle(0.28, 21, 34)]) * 0.5, c["pop_end"] + 0.04, db(-30))

# ================================================================= 2. burp: "Relax." ... his ear burps (in the pause) ... the dive
sfx.add(pan_st(breath(0.4, 22, exhale=True), 0), c["relax_end"] - 0.34, db(-30))      # he lets his breath go
sfx.add(pan_st(burp(0.24, 23), -0.45), c["burp"], db(-1))                             # brrp. (his left ear)
sfx.add(pan_st(filt(whoosh(0.3, 300, 2400, 24, 0.85), "lowpass", 3200), -0.3), END["burp"] - 0.27, db(-13))  # into his ear
sfx.add(thump(0.3, 130, 50, 0.09), SHOT["pocket"], db(-15))

# ================================================================= 3. pocket: the eardrum, the little pocket of air
sfx.add(thump(0.2, 190, 90, 0.05), c["eardrum"] + 0.02, db(-22))                      # a tap on the drum (low, under the word)
sfx.add(pan_st(blip(620, 900, 0.07, 30, 0.03), -0.3), c["eardrum_end"] + 0.02, db(-27))
for j, m in enumerate((81, 88)):
    sfx.add(bell(mtof(m), 0.2, 0.06) * 0.5, c["air_end"] + 0.03 + j * 0.06, db(-28), pan=0.3)   # the pocket lights up (short: "As you climb" follows)

# ================================================================= 4. climb: the pressure drops, the air swells
sfx.add(pan_st(blip(700, 1100, 0.07, 40, 0.03), 0), c["as"] + 0.02, db(-30))           # the cabin-pressure readout pops in
sfx.add(pan_st(slide_whistle(0.22, 760, 380), 0), c["drops_end"] + 0.02, db(-26))     # down it goes (in the pause)
sfx.add(pan_st(filt(creak(0.6, 41, 70, 170), "lowpass", 520), 0), c["swells"] - 0.04, db(-20))   # the drum stretches (low, under "swells")
sfx.add(pan_st(balloon_inflate(0.3, 42), -0.1), c["swells_end"] + 0.03, db(-16))      # ... and creaks, tight (in the pause)

# ================================================================= 5. tube: down the tube; it burps the extra out; the eardrum snaps back
sfx.add(pan_st(filt(whoosh(0.5, 500, 1400, 50, 0.6), "lowpass", 1500), 0), c["tiny2"] - 0.1, db(-27))   # the camera rides down the tube
sfx.add(pan_st(blip(520, 780, 0.07, 51, 0.03), -0.3), c["tube_end"] + 0.0, db(-29))
sfx.add(filt(bloop(210, 80, 0.3), "lowpass", 300), c["vent"], db(-17))                # the tube gapes open (low, under "burps")
sfx.add(pan_st(filt(gas_hiss(1.15, 52), "lowpass", 1300), 0.2), c["vent"] + 0.05, db(-31))   # the extra air leaves
sfx.add(cork_pop(53, 600), c["snap"], db(-5), pan=-0.3)                               # pop: the drum snaps flat (after "out.")
sfx.add(thump(0.22, 170, 70, 0.06), c["snap"], db(-15))

# ================================================================= 6. landing: the cabin tips down; the bottle crumples
sfx.add(pan_st(chime(880, 0.6), 0.25), SHOT["landing"] - 0.02, db(-18))               # bing
sfx.add(pan_st(filt(whoosh(0.5, 900, 250, 60, 0.3), "lowpass", 1200), 0), SHOT["landing"] - 0.1, db(-20))   # the nose drops
sfx.add(pan_st(filt(crumple(0.6, 61), "highpass", 1500), 0.3), c["landing"] + 0.12, db(-27))   # the bottle starts to cave in
sfx.add(pan_st(crumple(0.2, 62), 0.3), c["crunch"], db(-7))                          # CRUNCH (after "worse.")
sfx.add(thump(0.2, 220, 90, 0.05), c["crunch"], db(-11))
for k, tk in enumerate((SHOT["landing"] + 0.08, c["is"] + 0.05)):
    bed.add(pan_st(heartbeat(63 + k), 0), tk, db(-13))

# ================================================================= 7. squeeze: the eardrum sucked in; the suction clamps the tube; the lock
sfx.add(thump(0.3, 130, 50, 0.09), SHOT["squeeze"], db(-16))
for k, tk in enumerate(np.arange(SHOT["squeeze"] + 0.3, c["shut"] - 0.2, 0.74)):
    bed.add(pan_st(heartbeat(70 + k), 0), tk, db(-14))
sfx.add(pan_st(filt(creak(0.5, 71, 60, 150), "lowpass", 480), 0), c["shrinks"] - 0.06, db(-19))   # the drum bows in (low)
sfx.add(pan_st(filt(whoosh(0.5, 1400, 260, 72, 0.7), "lowpass", 1500), 0.2), c["suction"] - 0.05, db(-25))   # the suction: air pulled away
sfx.add(pan_st(filt(squelch(0.3, 73), "lowpass", 520), 0.2), c["clamps"], db(-20))    # the soft walls slap together (low)
sfx.add(pan_st(key_click(74), 0.3), c["lock"] - 0.02, db(-4))                         # the padlock (after "shut."; dry and short: "So" follows)
sfx.add(thump(0.12, 200, 90, 0.03), c["lock"] - 0.02, db(-13))

# ================================================================= 8. swallow: a gulp, a yawn
sfx.add(pan_st(gulp(80), 0.1), c["gulp"] - 0.02, db(-12))

# ================================================================= 9. yank: the little muscle yanks it open; air rushes in; pop
sfx.add(pan_st(riser(c["yanks"] - c["muscle"], 90, 220, 900), 0), c["muscle"], db(-34))
YANK = c["yanks"]
sfx.add(pan_st(fade(pizz(mtof(40), 0.4, 91) * 1.4, 0.002, 0.08), 0), YANK, db(-12))    # the yank: a low twang
sfx.add(thump(0.3, 140, 50, 0.08), YANK, db(-13))
sfx.add(pan_st(key_click(92), 0.3), c["yanks_end"] + 0.0, db(-22))                    # the padlock springs
sfx.add(pan_st(filt(whoosh(0.6, 260, 1500, 93, 0.75), "lowpass", 1700), 0), YANK + 0.14, db(-25))   # air rushes up into the pocket
POP2 = c["pop2"]
sfx.add(cork_pop(94, 620), POP2, db(-6), pan=-0.3)                                    # POP (after "open.")
sfx.add(thump(0.25, 150, 56, 0.08), POP2, db(-13))
for j, m in enumerate((84, 88, 91, 96)):                                               # relief: a bright chord
    sfx.add(bell(mtof(m), 0.35, 0.11) * 0.5, POP2 + 0.05 + j * 0.03, db(-21), pan=(j - 1.5) * 0.3)
sfx.add(pan_st(breath(0.32, 95, exhale=True), 0), POP2 + 0.16, db(-25))               # ahh

# ================================================================= 10/11. the baby: the wobble, the wail, the hush
sfx.add(pan_st(blip(480, 700, 0.09, 100, 0.04), 0.3), c["purpose_end"] + 0.03, db(-24))   # "?"
for k, tk in enumerate((c["purpose_end"] + 0.1, c["but"] - 0.14)):                        # eh ... eh ...
    sfx.add(pan_st(baby_cry(0.13, 101 + k, 520, 0.2), 0.35), tk, db(-14))
# the wail runs from "crying" to the hush: loud in the gaps, right down under her words
CRY0, HUSH = c["crying"] - 0.02, c["hush"]
ncry = int((HUSH - CRY0) * SR)
cry = np.zeros(ncry)
tk, k = 0.0, 0
while tk < HUSH - CRY0 - 0.2:
    d = min(0.62 + 0.2 * ((k * 37) % 5) / 4, HUSH - CRY0 - tk)
    w = baby_cry(d, 110 + k, 455 + 40 * ((k * 7) % 3), 0.5)
    i = int(tk * SR)
    cry[i:i + len(w)] += w[: ncry - i]
    tk += d + 0.07
    k += 1
quiet, loud = db(-32), 1.0
cry_env = np.interp(CRY0 + np.arange(ncry) / SR, [
    CRY0, c["crying"] + 0.1, c["crying_end"] - 0.02, c["crying_end"] + 0.03, c["can"] - 0.13, c["can"] - 0.07,
    c["too_end"] + 0.02, c["too_end"] + 0.07, c["sothat"] - 0.07, c["sothat"] - 0.02,
    c["twelve_end"] + 0.02, c["twelve_end"] + 0.07, HUSH - 0.012, HUSH,
], [quiet, quiet, quiet, loud, loud, quiet, quiet, loud, loud, quiet, quiet, loud, loud, 0.0])
bed.add(pan_st(cry * cry_env, 0.3), CRY0, db(-1))
sfx.add(pan_st(bell(mtof(88), 0.3, 0.1) * 0.5, 0), c["open2"] - 0.02, db(-30))        # TUBE: OPEN
for k, sd in enumerate((-1, 1)):                                                        # its ears pop (after "too.")
    sfx.add(cork_pop(120 + k, 820 + 90 * k), c["pop3"] + k * 0.03, db(-12), pan=0.25 + 0.3 * sd)
sfx.add(pan_st(filt(buzz(int(0.16 * SR), 110, 121, 0.6), "lowpass", 900), 0), c["inrow"] - 0.06, db(-33))   # the ROW 12 sign flickers on
# the hush: nothing. Then, in the pause before "doing it right", one sparkle
for j, m in enumerate((96, 103)):
    sfx.add(bell(mtof(m), 0.35, 0.12) * 0.5, c["technically_end"] + 0.06 + j * 0.07, db(-25), pan=0.3)
# the rosette: ta-da (after "right.")
sfx.add(pan_st(blip(700, 1400, 0.08, 122, 0.03), 0.2), c["medal"], db(-22))
for j, m in enumerate((84, 91)):
    sfx.add(bell(mtof(m), 0.45, 0.14) * 0.5, c["medal"] + 0.02 + j * 0.09, db(-18), pan=0.25)
for j, m in enumerate((60, 67)):
    sfx.add(pizz(mtof(m), 0.3, 123 + j), c["medal"] + 0.04 + j * 0.09, db(-21), pan=-0.2)

# ================================================================= 12. sub: he cries too (pop), the sun, ACHOO, subscribe, "bless you", round again
sob = baby_cry(c["pop4"] - SHOT["sub"] - 0.06, 130, 235, 0.55)                          # a grown man's waah (she chuckles over it)
bed.add(pan_st(sob, -0.1), SHOT["sub"] + 0.03, db(-4))
for k, sd in enumerate((-1, 1)):                                                        # ... and his ears pop too
    sfx.add(cork_pop(131 + k, 560 + 120 * k), c["pop4"] + k * 0.025, db(-9), pan=0.5 * sd)
sfx.add(pan_st(breath(0.26, 133, exhale=True), 0), c["pop4"] + 0.1, db(-28))
sfx.add(pan_st(blip(700, 1400, 0.08, 134, 0.03), 0), c["nextup"] - 0.05, db(-29))      # the card
for k, tk in enumerate((c["makes"] + 0.06, c["sneeze"] - 0.2)):                         # ah ... ah ...
    sfx.add(pan_st(filt(breath(0.2, 135 + k), "highpass", 900), 0), tk, db(-36))
ACH = c["achoo"]
sfx.add(pan_st(sneeze(137, 290), 0), ACH - 0.12, db(-2))                               # ah-CHOO (in the pause before "Subscribe")
sfx.add(thump(0.25, 160, 60, 0.07), ACH + 0.02, db(-10))
sfx.add(np.stack([jingle(0.3, 138, 36), jingle(0.3, 139, 36)]) * 0.5, ACH + 0.06, db(-30))   # the tray jumps
# subscribe cue: the pop sits under the sneeze; the click lands in the pause after "Subscribe"
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"] + 0.02, db(-27))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.14, db(-29))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-3))
        sfx.add(pan_st(key_click(73), 0), c["sub_tap"] + 0.004, db(-8))
        sfx.add(pan_st(bell(1760, 0.7, 0.3), 0.3), c["sub_tap"] + 0.06, db(-30))
sfx.add(pan_st(filt(rustle(0.2, 140), "highpass", 1200), 0.5), c["bless"] - 0.18, db(-31))   # the tissue
sfx.add(pan_st(filt(breath(0.16, 141), "highpass", 900), 0), c["you_end"] + 0.08, db(-24))  # sniff
# the loop: bing ... and the engines come up again, straight into frame 1's bong and roar
sfx.add(pan_st(chime(880, 0.5), 0.25), c["loop"] - 0.02, db(-17))
sfx.add(pan_st(filt(whoosh(DUR - c["loop"] + 0.2, 160, 500, 142, 0.98), "lowpass", 600), 0), c["loop"] - 0.2, db(-14))

# ================================================================= score (drops out for every punchline)
# hook: no score (engines, the rising pressure, the POP). burp: nothing (the deadpan).
# pocket: wonder. A soft held chord while the camera rides in
drone(mus, SHOT["pocket"] + 0.15, c["as"] + 0.2, [57, 64, 69, 72], cutoff=800, gain=-31, seed=10, swell=0.5)
# climb + tube: the mechanism drive (in after the first words; out when the tube burps)
groove(mus, c["climb"] + 0.2, c["burps"] - 0.1, 108, ["Am", "F", "C", "G"], gain=-12, seed=20, snaps=False, cutoff=1100)
# landing: nothing. squeeze: a low cluster that tightens until the lock
drone(mus, SHOT["squeeze"] + 0.1, c["shut"] - 0.05, [38, 44, 45, 51], cutoff=360, gain=-31, seed=30, swell=0.7)
# swallow: tiptoe plucks in the gaps. yank: a short rise into the twang
for k, (tk, m) in enumerate(((c["yawn_end"] + 0.02, 60),)):
    mus.add(pan_st(fade(filt(pizz(mtof(m), 0.3, 40 + k), "lowpass", 900), 0.002, 0.05), 0.3 * (-1) ** k), tk, db(-29))
# baby: a lullaby bounce while he shows it how; it stops dead when the lip wobbles
for k, m in enumerate((76, 79, 84, 79, 76, 79)):                                       # a music box, far off
    mus.add(pan_st(fade(music_box(mtof(m), 0.5, 50 + k), 0.002, 0.2), 0.3 * (-1) ** k), SHOT["baby"] + 0.04 + k * 0.29, db(-35))
# button: nothing but the wail, then nothing at all. sub: tiptoe plucks under the tease, a shimmer when the sun comes in
for k, m in enumerate((65, 69, 72, 69, 65, 67, 69, 72, 74, 72, 69, 72)):
    tk = c["nextup"] + 0.3 + k * 0.26
    if tk < c["sneeze_end"] - 0.15:
        mus.add(pan_st(fade(filt(pizz(mtof(m - 12), 0.3, 60 + k), "lowpass", 800), 0.002, 0.05), 0.3 * (-1) ** k), tk, db(-31))
drone(mus, c["sunlight"] - 0.1, c["makes"], [88, 91, 95], cutoff=3000, gain=-46, seed=61, swell=0.3)       # the sun: a thin shimmer, gone before "some of us sneeze"

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -15.0})
