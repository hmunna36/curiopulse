"""Can You ROLL Your Tongue? Short: sound design, score and mix, cue-locked to timeline.json.

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
WORDS = TL["words"]

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice

SFX_LEVEL = -13.0   # the whole sfx bus (house: -5); the gags against each other are in G
G = dict(blep=-27, flop=-21, eyes=-23, dive=-23, xray=-31, bonk=-22, glint=-25, bloop=-23, octo=-23, panel=-24,
         curl=-30, tube=-20, wah=-21, slam=-18, dust=-29, stamp=-22, slidein=-27, boing=-21, bracket=-26, roll=-22,
         sparkle=-25, sad=-21, shutter=-24, steam=-29, flump=-22, keys=-33, send=-22, sent=-26, aww=-24, again=-26)


def thud_low(seed=0, f=70.0):
    """a soft landing heard through the body: all of it under ~250 Hz (it can sit on a word; mono, 0.3 s)"""
    n = int(0.3 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * np.cumsum(f + 50 * np.exp(-t / 0.03)) / SR) * expdecay(n, 0.09)
    y += 0.5 * filt(brown(n, seed), "lowpass", 220) * expdecay(n, 0.05)
    return fade(y / (np.abs(y).max() + 1e-9), 0.0008, 0.04)


def top_swish(dur=0.12, seed=0):
    """a dry swish with everything above 5 kHz (it can sit under a word; mono)"""
    n = int(dur * SR)
    y = filt(white(n, seed), "highpass", 5200) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.02)


def blep(seed=0, edges=False):
    """a tiny wet tongue noise (a 'blep'): a short squelch. edges=True keeps what is under 300 Hz and above 5.2 kHz,
    so it can sit under a word (mono, 0.09 s)"""
    y = squelch(0.09, seed)
    if edges:
        y = filt(y, "lowpass", 300) * 1.4 + filt(y, "highpass", 5200) * 2.2
    return fade(y / (np.abs(y).max() + 1e-9), 0.002, 0.02)


def sparkle(t0, bus, gain, seed=0, n=4, step=0.045, pan=0.0):
    for i in range(n):
        bus.add(pan_st(glint(5600 + 700 * i, 0.09, seed + i), pan), t0 + step * i, db(gain - (2 if i else 0)))


def speaking(t):
    """is a word being spoken at time t (with a little margin either side)?"""
    return any(w["start"] - 0.03 <= t <= w["end"] + 0.06 for w in WORDS)


# ================================================================= his tongue's tries: a blep on every edge that comes up
# The picture lifts the edges by sin(w t) and sin(w t + lag) with w = loopW(2 pi 2.2) (scenes.js); a blep at each peak.
W_WOB = 2 * np.pi * max(1, round(C.get("wob_hz", 2.2) * DUR)) / DUR
def tries(t0, t1, gain, lag=2.6, seed=0):
    k = 0
    for ph in (0.0, lag):
        # peaks of sin(W t + ph): W t + ph = pi/2 + 2 pi m
        m0 = int(np.floor((W_WOB * t0 + ph - np.pi / 2) / (2 * np.pi)))
        for m in range(m0, m0 + 400):
            tp = (np.pi / 2 + 2 * np.pi * m - ph) / W_WOB
            if tp < t0:
                continue
            if tp > t1:
                break
            on_word = speaking(tp)
            bed.add(pan_st(blep(seed + k, edges=on_word), -0.25 if ph == 0 else 0.25), tp, db(gain - (3 if on_word else 0)))
            k += 1


tries(0.0, C["cant"] - 0.05, G["blep"], seed=100)                       # the hook: try, try, try
tries(C["curling"] - 0.05, C["once"] + 0.1, G["blep"] - 2, lag=np.pi, seed=200)   # the seesaw under "both edges up at once"
tries(C["couldnt"] - 0.1, C["couldnt_end"], G["blep"] - 1, lag=np.pi, seed=300)   # the twin who can't
tries(C["try2"] + 0.1, DUR + 0.5, G["blep"], seed=400)                  # try again: into the loop

# ================================================================= ambience (one bed per world, gated to its shots)
bath_on = gate(N, [(0, SHOT["book"] + 0.05), (SHOT["twins"] - 0.05, SHOT["prof"] + 0.05), (SHOT["button"] - 0.05, DUR)])
amb.x += pan_st(filt(brown(N, 1), "lowpass", 230), 0) * 0.32 * bath_on                       # the bathroom: room tone
desk_on = gate(N, [(SHOT["book"], SHOT["twins"])])
amb.x += pan_st(filt(brown(N, 3), "lowpass", 300), 0) * 0.30 * desk_on                       # a quiet room with a book
proj_on = gate(N, [(SHOT["prof"], SHOT["email"])])
amb.x += pan_st(filt(projector(N, 4), "lowpass", 1200), 0) * 0.20 * proj_on                  # an old film projector
pc_on = gate(N, [(SHOT["email"], SHOT["fam"])])
amb.x += pan_st(filt(brown(N, 5), "lowpass", 180) + 0.04 * np.sin(2 * np.pi * 120 * tt), 0) * 0.30 * pc_on   # a laptop's hum

# ================================================================= the test, the answer
sfx.add(pan_st(blep(11), 0), C["tongue1_end"] + 0.05, db(G["blep"] + 3))                     # a blep in the pause after "tongue?"
sfx.add(pan_st(slide(392, 175, 0.34, vib=3.0), 0), C["cant_end"] + 0.04, db(G["flop"]))       # Can't?... the tongue flops: wah
bed.add(pan_st(thud_low(12, 60.0), 0), C["cant_end"] + 0.1, db(G["flop"]))                   # ...and lands on his chin
bed.add(pan_st(glint(6400, 0.1, 13), -0.6), C["dont"] - 0.1, db(G["glint"]))                  # the photo pops up
sfx.add(pan_st(slide(700, 1100, 0.12, top=None), -0.6), C["parents1_end"] + 0.05, db(G["eyes"]))   # Mum and Dad look away: fwip
sfx.add(pan_st(slide(1100, 760, 0.12, top=None), -0.6), C["parents1_end"] + 0.2, db(G["eyes"] - 2))
sfx.add(pan_st(whoosh(0.3, 300, 2600, 14, 0.85), 0), SHOT["bones"] - 0.22, db(G["dive"]))      # into his tongue (ends before "Your")

# ================================================================= no bones, all muscle, like an octopus arm
bed.add(pan_st(buzz_hi(C["its_all"] - C["bones"] + 0.1, 24.0, 20), 0), C["bones"] - 0.25, db(G["xray"]))   # the x-ray hums on
sfx.add(pan_st(bonk(), 0), C["bones_end"] + 0.03, db(G["bonk"]))                               # ...no bone: bonk (in the pause)
for i, d in enumerate((0.0, 0.2, C["muscle_end"] - C["muscle"] - 0.15)):                      # the three ways of muscle light up
    bed.add(pan_st(glint(5800 + 800 * i, 0.1, 21 + i), -0.3 + 0.3 * i), C["muscle"] + d, db(G["glint"]))
bed.add(pan_st(thud_low(22, 90.0), 0.4), C["octopus"] - 0.08, db(G["octo"]))                   # the octopus lands (low, under "octopus")
sfx.add(pan_st(bloop(240, 120, 0.16), 0.4), C["arm_end"] + 0.02, db(G["bloop"]))              # ...and curls its arm (after "arm.")

# ================================================================= rolling: both edges up at once
bed.add(pan_st(top_swish(0.16, 30), 0), C["rolling"] - 0.12, db(G["panel"]))                   # the panel pops up
bed.add(pan_st(ratchet(C["once"] - C["curling"], 10.0, 28.0, 31, edges=True), 0), C["curling"], db(G["curl"]))   # the slice curls up
for i in range(2):                                                                              # both edges: two glints, one each side
    bed.add(pan_st(glint(6600 + 600 * i, 0.08, 32 + i), -0.5 + i), C["both"] + 0.05 + 0.05 * i, db(G["glint"]))
bed.add(pan_st(thud_low(33, 80.0), 0), C["once"] + 0.04, db(G["tube"]))                       # ONCE: the tube snaps shut (low, on the word)
sfx.add(pan_st(ding(84, 0.15, 34), 0.2), C["once_end"] + 0.03, db(G["tube"]))                  # TUBE! (after "ONCE.")
sfx.add(pan_st(slide(330, 196, 0.26, vib=4.0), -0.2), C["once_end"] + 0.2, db(G["wah"]))       # ...his flops: wah (still in the pause)

# ================================================================= the school book
sfx.add(pan_st(whoosh(0.22, 400, 2400, 40, 0.8), 0), SHOT["book"] - 0.2, db(G["dive"] - 2))
bed.add(pan_st(thud_low(41, 58.0), 0), C["school"] + 0.12, db(G["slam"]))                     # the book slams down (low: under "School")
bed.add(pan_st(top_swish(0.3, 42), 0), C["school"] + 0.14, db(G["dust"]))                     # dust
bed.add(pan_st(thud_low(44, 74.0), 0.3), C["parents2"] + 0.02, db(G["stamp"]))                 # ONE GENE: the stamp lands
sfx.add(pan_st(ding(79, 0.12, 45), 0.3), C["parents2_end"] + 0.03, db(G["stamp"]))             # ...ding

# ================================================================= identical twins
sfx.add(pan_st(whoosh(0.22, 400, 2400, 50, 0.8), 0), SHOT["twins"] - 0.2, db(G["dive"] - 2))
bed.add(pan_st(top_swish(0.3, 51), -0.6), C["but"] - 0.25, db(G["slidein"]))                    # his twin slides in
sfx.add(pan_st(boing(0.16, 170.0, 52), -0.4), C["twins_end"] + 0.03, db(G["boing"]))           # twins: boing...
sfx.add(pan_st(boing(0.14, 170.0, 53), 0.4), C["twins_end"] + 0.16, db(G["boing"] - 1))        # ...boing (the same note: identical)
bed.add(pan_st(glint(6200, 0.1, 54), 0), C["same"] + 0.05, db(G["bracket"]))                    # the SAME GENES bracket
could_end = max(w["end"] for w in WORDS if w["start"] < C["one2"] - 0.05)
sfx.add(pan_st(blep(55), -0.4), could_end + 0.03, db(G["roll"]))                                # one could: fwip, a perfect tube
sparkle(could_end + 0.08, bed, G["sparkle"], seed=56, n=3, pan=-0.4)
sfx.add(pan_st(slide(330, 165, 0.32, vib=4.5), 0.4), C["couldnt_end"] + 0.03, db(G["sad"]))     # one couldn't: wah-wah

# ================================================================= the scientist, embarrassed
sfx.add(pan_st(shutter(), 0), SHOT["prof"] + 0.02, db(G["shutter"]))                           # an old photo
bed.add(pan_st(buzz_hi(0.5, 40.0, 60, lo=6200), 0.3), C["embarrassed"] + 0.1, db(G["steam"]))   # steam from his ears (top only)
bed.add(pan_st(thud_low(61, 66.0), 0), C["embarrassed"] + 0.3, db(G["flump"]))                  # the book comes up to his face

# ================================================================= the emails
sfx.add(pan_st(whoosh(0.22, 400, 2400, 70, 0.8), 0), SHOT["email"] - 0.2, db(G["dive"] - 2))
k = 0
for a, b in [(C["kids"], C["sci2"] + 0.2), (C["asking"] - 0.1, C["adopted"] - 0.05)]:          # typing (top only: under words)
    tk = a
    while tk < b:
        clk = filt(key_click(80 + k), "highpass", 5000)
        bed.add(pan_st(clk / (np.abs(clk).max() + 1e-9), 0.1 * ((k % 3) - 1)), tk, db(G["keys"]))
        tk += 0.075 + 0.03 * ((k * 7) % 3)
        k += 1
sfx.add(pan_st(blip(900, 1500, 0.07, 71), 0), C["adopted_end"] - 0.02, db(G["send"]))          # SEND (after "ADOPTED.")
sfx.add(pan_st(whoosh(0.32, 500, 3000, 72, 0.7), 0.3), C["adopted_end"] + 0.12, db(G["send"] - 1))   # ...and off it goes
sfx.add(pan_st(ding(88, 0.12, 73), 0.2), C["adopted_end"] + 0.42, db(G["sent"]))

# ================================================================= they're not; try again
sfx.add(pan_st(ding(79, 0.18, 80, bright=0.8), 0), C["not_end"] + 0.03, db(G["aww"]))            # NOT ADOPTED: a warm ding (after "not.")
bed.add(pan_st(glint(6800, 0.1, 81), 0), C["not"] + 0.05, db(G["glint"]))
sfx.add(pan_st(whoosh(0.22, 400, 2400, 82, 0.8), 0), SHOT["button"] - 0.2, db(G["dive"] - 2))
bed.add(pan_st(top_swish(0.2, 83), 0), C["try2"] + 0.05, db(G["again"]))                        # out comes the tongue again

# ================================================================= score (drops out for every punchline)
BPM = 112
groove(mus, 0.22, C["cant"] - 0.03, BPM, ["F", "Bb"], gain=-9, seed=10, kick_on=False, snaps=True)   # after "Can"
groove(mus, C["blame"], C["parents1_end"] + 0.05, BPM, ["Bb", "C"], gain=-9, seed=11, kick_on=False, snaps=True)   # back after "Don't"
drone(mus, SHOT["bones"] + 0.1, C["octopus"], [38, 45, 50, 57], cutoff=520, gain=-17)            # inside: a held, curious chord
groove(mus, C["octopus"], C["arm_end"] + 0.05, BPM, ["Dm", "Bb"], gain=-10, seed=20, kick_on=False, snaps=True)
groove(mus, C["rolling"] + 0.25, C["once"] - 0.05, BPM, ["F", "Bb", "C", "C"], gain=-7, seed=21, snaps=True)
mus.add(pan_st(riser(0.9, 22, 300, 2200), 0), C["once"] - 0.9, db(-26))
groove(mus, C["school"] + 0.2, C["parents2"] - 0.05, BPM, ["Bb", "F", "C"], gain=-8, seed=30, snaps=False)
groove(mus, C["identical"], C["twins_end"], BPM, ["F", "Dm"], gain=-8, seed=40, kick_on=False, snaps=True)
groove(mus, C["same"] + 0.2, C["couldnt"] - 0.05, BPM, ["Bb", "C", "F"], gain=-7, seed=41, snaps=True)
rag(mus, SHOT["prof"] + 0.15, C["embarrassed"] - 0.05, bpm=126, gain=-6, seed=50)                # 1940: a stride piano
groove(mus, C["kids"], C["adopted"] - 0.05, BPM, ["Dm", "Bb", "C"], gain=-8, seed=60, kick_on=False, snaps=True)
mus.add(pad([mtof(m) for m in (53, 57, 60, 65)], END["fam"] - C["not_end"] + 0.1, att=0.05, cutoff=1400, seed=70), C["not_end"], db(-12))   # aww
groove(mus, C["again"] + 0.1, DUR, BPM, ["F", "Bb"], gain=-9, seed=10, kick_on=False, snaps=True)   # the hook's groove again: into the loop
silence(mus, [(C["cant"] - 0.03, C["blame"]),                     # Can't?... wah, thud
              (C["its_all"] - 0.06, C["its_all"] + 0.32),        # "It's all" is soft: no chord under it
              (C["parents1_end"] + 0.05, SHOT["bones"] + 0.1),    # the parents look away
              (C["arm_end"] + 0.05, C["rolling"] + 0.25),         # bloop
              (C["once"] - 0.05, C["school"] + 0.2),              # ONCE: ding, wah
              (C["parents2"] - 0.05, C["identical"]),             # ONE GENE: ding
              (C["twins_end"], C["same"] + 0.2),                  # boing boing
              (C["couldnt"] - 0.05, SHOT["prof"] + 0.15),         # couldn't: wah-wah
              (C["embarrassed"] - 0.05, C["kids"]),               # embarrassed: steam
              (C["adopted"] - 0.05, C["not_end"]),                # ADOPTED: send
              (END["fam"], C["again"] + 0.1)])                     # "They're not. Try..."

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -14, "sfx": SFX_LEVEL}, duck={"music": 0.74})
