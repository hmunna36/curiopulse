"""Can You WINK Without the Other Eye Moving? 😉 Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
The place: a night café, a spy rendezvous. The score: a sneaky minor groove fitted to whole bars (the loop score), his
motif a marimba hook, the cat's a low pizzicato "bum-bum". Rule of the house: say it on the word, do it in the pause:
every gag's sound sits in the gap after its word; under words only sounds under 250 Hz or above 5.2 kHz.
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

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()
c = C


def hi(x, f=5200):
    """only what is above f: it can sit under a word"""
    return filt(x, "highpass", f)


def lo(x, f=250):
    """only what is under f: it can sit under a word"""
    return filt(x, "lowpass", f)


# ================================================================= ambience: the café room tone and rain on the window
room = pan_st(filt(brown(N, 1), "lowpass", 200), 0) * 0.32
rain = np.stack([hi(white(N, 7), 5600), hi(white(N, 8), 5600)]) * 0.045
rain_on = gate(N, [(SHOT["cafe"], c["cut_board"]), (SHOT["catwink"], DUR)])
amb.x += room + rain * rain_on

# ================================================================= the dare (frame 1): the ring hums, the wink, the squint
sfx.add(pan_st(hi(glint(6400, 0.12, 1)), 0.25), 0.03, db(-24))                    # the ring is there on frame 1
sfx.add(pan_st(lo(thump(0.22, 180, 60, 0.08, 2), 240), 0), 0.02, db(-16))          # and a soft low hit with it
sfx.add(pan_st(hi(glint(7200, 0.08, 3)), -0.3), c["wink0"], db(-22))                # his right eye snaps shut (tink)
sfx.add(pan_st(lo(thump(0.3, 160, 50, 0.1, 4), 230), 0), c["wink0"] + 0.12, db(-14))   # the ringed eye squints: thud
for i in range(3):                                                                 # the red ring shudders: high ticks
    sfx.add(pan_st(hi(glint(6800 + 300 * i, 0.05, 10 + i)), 0.35), c["wink0"] + 0.2 + 0.07 * i, db(-27))

# ================================================================= cuts: a whoosh into each (the whips louder)
WHIPS = {SHOT["answer"], SHOT["blink"]}
for i, s in enumerate(TL["shots"][1:]):
    g = -19 if s["start"] in WHIPS else -27
    sfx.add(pan_st(whoosh(0.24, 500 + 150 * (i % 4), 2600, 500 + i), 0.0), s["start"] - 0.22, db(g))

# ================================================================= the cat (a low pizzicato "bum-bum" is its motif)
def cat_motif(t0, gain=-17, up=False):
    a, b = (38, 45) if up else (45, 38)
    sfx.add(pan_st(lo(pizz(mtof(a), 0.3, 21), 320), 0.4), t0, db(gain))
    sfx.add(pan_st(lo(pizz(mtof(b), 0.3, 22), 320), 0.4), t0 + 0.16, db(gain))


cat_motif(SHOT["cafe"] + 0.05)                                                     # the contact, at its table
sfx.add(pan_st(meow(0.15, 760, 980, 700, 5), 0.45), c["right"] + 0.27, db(-24))     # "mrrp?" in the gap after "right?"
for k in range(5):                                                                 # it taps the table, looking at its watch
    sfx.add(pan_st(lo(thump(0.06, 220, 90, 0.02, 30 + k), 260), 0.5), c["both"] + 0.35 + 0.22 * k, db(-22))
clock_ticks(c["drop_end"] + 0.02, c["a_wink"] - 0.05, sfx, db(-30))

# ================================================================= the answer and the string
sfx.add(pan_st(hi(chime(5600, 0.4)), 0), c["relax_end"] + 0.02, db(-26))          # relax: a little high chime in the gap
for i in range(5):                                                                 # the string glints as it drops in
    sfx.add(pan_st(hi(glint(6000 + 380 * i, 0.07, 40 + i)), -0.2 + 0.1 * i), c["share"] + 0.05 * i, db(-26))
# the string snaps taut (the answer's sting): a twang in the gap after "string.", plus the hitstop's layered hit
sfx.add(pan_st(twang(233.0, 0.3, 50, 0.08), 0), c["taut"] + 0.01, db(-15))
_th = c["taut"] + 0.04
sfx.add(pan_st(filt(snap(51), "highpass", 1800), 0.0), _th, db(-20))
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-17))
sfx.add(cymbal(52, 0.3), _th + 0.01, db(-33))

# ================================================================= blink: the string jerks, both lids drop
sfx.add(pan_st(lo(thump(0.12, 200, 70, 0.04, 60), 240), 0), c["blink_end"] + 0.01, db(-18))
for d in (0.0, 0.07):                                                              # "Blink." ... tink-tink, in the gap
    sfx.add(pan_st(glass_tink(61, 2900, 0.1), 0), c["blink_end"] + 0.03 + d, db(-24))
# the puppet bar: a wooden clack as he yanks it, the lids land in the gap after "drop."
sfx.add(pan_st(lo(thump(0.1, 230, 80, 0.03, 70), 260), -0.3), c["both"] - 0.02, db(-15))
sfx.add(pan_st(hi(crackle(int(0.06 * SR), 900, 71, 5200, 9000)), -0.3), c["both"] - 0.02, db(-24))
sfx.add(pan_st(bonk(), 0), c["drop_end"] + 0.03, db(-20))

# ================================================================= the wink: pull the bar and prop one lid up
sfx.add(pan_st(ding(84, 0.12, 80, 1.3), 0.2), c["wink_q_end"] + 0.03, db(-23))          # "A wink?" ding, in the gap
sfx.add(pan_st(hi(squeak(0.12, 5600, 7400), 5200), 0.3), c["pulling"], db(-26))     # the fingertip on the lid
sfx.add(pan_st(twang(196.0, 0.32, 81, -0.05), 0), c["up_end"] + 0.03, db(-20))     # "UP." the slack string boings
# the strain: a rising high whine under "But then your grip"
sfx.add(pan_st(hi(glide(5400, 7600, 1.3) * 0.5), 0), c["but"], db(-30))

# ================================================================= the slip: the finger slides off, the lid drops half
sfx.add(pan_st(slide_whistle(0.26, 1500, 520), 0), c["slips_end"] + 0.01, db(-20))
_sh = c["slip_land"] + 0.02
sfx.add(pan_st(filt(snap(91), "highpass", 1800), 0.0), _sh + 0.2, db(-21))
sfx.add(pan_st(lo(kick(0.9), 300), 0.0), _sh, db(-14))
sfx.add(cymbal(92, 0.3), _sh + 0.22, db(-34))

# ================================================================= the study: chalk, the count, the faces flip
sfx.add(pan_st(hi(scribble(0.5, 100), 4800), 0.2), c["cut_board"] + 0.02, db(-24))
for i in range(12):                                                                # the count rolls up: high ticks
    sfx.add(pan_st(hi(glint(5600 + 120 * i, 0.04, 110 + i)), 0.1), c["ninety"] + 0.045 * i, db(-29))
pops([c["ninety"] + 0.006 * i * 10 for i in range(10)], sfx, db(-30), seed=120)    # the faces flip, row by row

# ================================================================= the payoff: full silence, then the cat squints too
# the biggest hit of the Short, just after "too.": a boing, a crash cymbal, a low kick, and the cat's motif, up
sfx.add(pan_st(boing(0.45, 210, 130), 0.2), c["cat_squint"], db(-15))
sfx.add(pan_st(lo(kick(1.0), 400), 0), c["cat_squint"], db(-14))
sfx.add(cymbal(131, 0.5), c["cat_squint"] + 0.01, db(-24))
sfx.add(pan_st(hi(glint(7000, 0.06, 132)), 0.4), c["cat_wink"], db(-22))           # the cat's wink: tink
cat_motif(c["cat_squint"] + 0.3, gain=-16, up=True)

# ================================================================= the button: the ring pops on the other eye
sfx.add(pan_st(hi(glint(6400, 0.12, 140)), 0.25), c["other"] + 0.02, db(-23))
sfx.add(pan_st(ding(88, 0.14, 141, 1.2), 0.25), c["eye_last_end"] + 0.04, db(-24))

# ================================================================= the score: the loop score on a sneaky minor groove
BPM, BEAT, BARS = loop_groove(mus, DUR, ["Dm", "Bb", "Gm", "A"], gain=-5, seed=12, lo=104, hi=124, want=114)
# his motif: a marimba hook every two bars from the café on (it rests under the macro shots' first words)
riff(mus, [(0, 74), (0.75, 77), (1.5, 81), (2.5, 79), (3, 77), (3.5, 74)], BEAT, t0=bar_at(SHOT["cafe"], BEAT), every=8,
     inst=lambda m, d, s: marimba(mtof(m), d, s), gain=-21, octave=None)
shaker(mus, bar_at(SHOT["cafe"], BEAT), c["hundred_end"], BEAT, gain=-33)
# the last beat leads back into bar 1: two pickup notes (nothing rings past the end)
for k, m in enumerate((69, 74)):
    mus.add(pan_st(marimba(mtof(m), 0.2, 150 + k), 0.2 * (-1) ** k), DUR - BEAT + k * BEAT / 2, db(-19))
# the dead stops (direction rule 16): after the hook's first word; the string's sting; the slip; full silence from the
# count to the cat's squint (the biggest hit); and the button's first words
STOPS = [(0.0, c["wink0"] + 0.02),
         (c["taut"] - 0.05, c["blink_end"] + 0.08),
         (c["slip_go"] - 0.05, c["slips_end"] + 0.4),
         (c["hundred_end"] - 0.02, c["cat_squint"] + 0.02),
         (c["now"] - 0.05, c["now"] + 0.35)]
silence(mus, STOPS)
print("stops:", ", ".join(f"{a:.2f}-{b:.2f} ({b - a:.2f} s)" for a, b in STOPS))
print(f"loop score: {BARS} bars at {BPM:.1f} BPM, beat {BEAT:.3f} s, bars x 4 x beat = {BARS * 4 * BEAT:.3f} s vs {DUR:.3f} s")

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13})
