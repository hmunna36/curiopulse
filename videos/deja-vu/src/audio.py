"""Why Do We Get DÉJÀ VU? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

Three worlds: the cafe (a hush, the door's bell), inside his head (a slow muffled pulse) and the two rooms at the end
(a lab's hum, a fortune teller's chimes). The gags that are heard sit in the narration's pauses: the bell's DING after
"SEEN IT!", the stamp after "lying." and "here.", the alarm after "IMPOSSIBLE.", the cat's meow after the click and,
the same meow again, after "weirder.", the buzzer after "SURE...", the coin after "flip.". What happens ON a word is a
low thud on the bed bus, under the speech band. The score stops dead for the feeling itself, and the Short ends on the
same eerie two notes it hit at second 2.5.
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
    """a stamp, a door or a hand coming down, heard low: almost all of it under 200 Hz, so it can sit on a word"""
    (bus or bed).add(thump(dur, f, f * 0.3, tau), t, db(gain))
    (bus or bed).add(pan_st(filt(bonk(), "lowpass", 600), 0), t, db(gain - 10))


def stamp_hit(t, gain, pan=0.0):
    """a rubber stamp coming down, in a pause: a thud, the slap of the rubber, a rattle of the desk"""
    sfx.add(thump(0.26, 170, 56, 0.07), t, db(gain))
    m = int(0.035 * SR)
    sfx.add(pan_st(filt(white(m, int(t * 100)), "bandpass", [900, 3800]) * expdecay(m, 0.006), pan), t, db(gain - 4))
    sfx.add(pan_st(fade(jingle(0.2, int(t * 10), 42), 0.002, 0.08), pan), t + 0.03, db(gain - 19))


def fwip(t, gain, pan=0.0, up=False, bus=None):
    """paper sliding in"""
    w = whoosh(0.16, 700 if up else 1800, 1800 if up else 700, int(t * 100), 0.6)
    (bus or sfx).add(pan_st(filt(w, "lowpass", 3200), pan), t, db(gain))


def eerie(t, dur, gain, bus=None, f=(880.0, 932.3, 1318.5), vib=5.2):
    """the feeling: thin glassy tones a semitone apart that beat against each other. They are in the speech band, so
    they only ever play in a pause of the narration (after "before.", after "clash?", after "before?")"""
    n = int(dur * SR)
    tn = ar(n)
    y = sum(np.sin(2 * np.pi * fi * tn * (1 + 0.0015 * np.sin(2 * np.pi * vib * tn + i))) / (i + 1) for i, fi in enumerate(f))
    y = y / (np.abs(y).max() + 1e-9) * np.minimum(1, tn / 0.06) * np.minimum(1, (dur - tn) / 0.18).clip(0)
    (bus or sfx).add(pan_st(y, 0), t, db(gain))


CAFE = ("hook", "relax", "layout", "dejavu", "next")
MIND = ("caught", "bell", "files", "clash")
FORT = ("psychic", "button")

# ================================================================= ambience (one bed per world, gated to its shots)
cafe_on = gate(N, on(*CAFE) + [(c["loop"], DUR)]) * (1 - gate(N, [(c["dive"], c["loop"] - 0.05)]))
fort_on = gate(N, [(SHOT["psychic"], c["loop"] - 0.1)])
room = norm(filt(brown(N, 1), "lowpass", 230))                                           # the empty cafe: a hush ...
amb.x += pan_st(room, 0) * 0.34 * cafe_on
fridge = norm(np.sin(2 * np.pi * 98 * tt) + 0.4 * np.sin(2 * np.pi * 196 * tt)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.4 * tt))
amb.x += pan_st(fridge, -0.5) * 0.10 * cafe_on                                           # ... and the machine's hum, low on the left
pulse = norm(filt(pink(N, 4), "bandpass", [45, 240]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.1 * tt) ** 2))
amb.x += pan_st(pulse, 0) * 0.5 * gate(N, on(*MIND))                                     # inside his head: muffled, a slow pulse
labhum = norm(filt(brown(N, 6), "lowpass", 300) + 0.5 * np.sin(2 * np.pi * 120 * tt))
amb.x += pan_st(labhum, 0) * 0.4 * gate(N, on("lab"))                                    # the lab: mains hum and air
tent = norm(filt(brown(N, 7), "lowpass", 260) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * tt)))
amb.x += pan_st(tent, 0) * 0.4 * fort_on                                                 # the tent: heavy cloth, nothing else
rb = np.random.default_rng(11)
for a, b in on(*MIND):                                                                   # thoughts going by: tiny high blips, now and then
    tk = a + 0.4
    while tk < b - 0.3:
        f = rb.uniform(2600, 5200)
        bed.add(blip(f, f * 1.3, 0.05, int(tk * 100), 0.02), tk, db(-36), pan=rb.uniform(-0.8, 0.8))
        tk += rb.uniform(0.3, 0.8)
tk = SHOT["psychic"] + 0.05
while tk < c["dive"]:                                                                    # chimes in the tent (above her words)
    bed.add(pan_st(fade(jingle(0.5, int(tk * 37), 9), 0.01, 0.2), rb.uniform(-0.7, 0.7)), tk, db(-31))
    tk += rb.uniform(0.7, 1.3)

# ================================================================= 1. hook: the door, three steps in ... and he has BEEN here
bed.add(pan_st(filt(fade(jingle(0.55, 3, 26), 0.002, 0.25), "highpass", 5200, 4), 0.25), c["chime"], db(-11))   # the bell over the door, on frame 1 (above "You open": over 5 kHz)
bed.add(thump(0.3, 110, 44, 0.09), 0.0, db(-10))                                          # his palm on the glass: a low push
bed.add(pan_st(filt(whoosh(0.5, 120, 280, 12, 0.6), "lowpass", 300, 4), -0.2), 0.02, db(-12))   # the door swings in (under 300 Hz)
for j, ts in enumerate((0.5, 0.86, 1.22, 1.56)):                                          # his steps (low: they are under the words)
    bed.add(thump(0.12, 150 - 10 * j, 60, 0.035), ts, db(-17), pan=0.1 * (-1) ** j)
bed.add(pan_st(filt(whoosh(0.5, 900, 300, 13, 0.5), "lowpass", 1200), 0), c["step_in"] - 0.4, db(-24))    # the camera pulls back to the room
bed.add(thump(0.2, 120, 50, 0.06), c["step_in"] + 0.55, db(-14))                          # the door falls shut behind him ...
bed.add(pan_st(filt(fade(jingle(0.3, 5, 22), 0.002, 0.14), "highpass", 5200, 4), 0.25), c["step_in"] + 0.5, db(-19))  # ... and its bell again, smaller
bed.add(thump(0.5, 110, 40, 0.16), c["ghostjolt"], db(-12))                              # the see-through one jumps first (low, under "door...")
bed.add(pan_st(filt(glitch_burst(0.12, 17), "highpass", 5200, 4), 0), c["ghostjolt"], db(-27))
# the feeling: everything drops away under "BEEN here before" (a sub fall and thin glass, nothing in the speech band)
J = c["jolt"]
rz = riser(0.3, 14, 2400, 5200)
bed.add(pan_st(filt(rz, "highpass", 5600, 4), 0), J - 0.3, db(-22))                        # (it starts after "and", over 5 kHz)
bed.add(thump(1.1, 96, 30, 0.34), J, db(-3))
bed.add(pan_st(filt(glitch_burst(0.22, 15), "highpass", 4800), 0), J, db(-23))
eerie(c["before_end"] + 0.02, SHOT["relax"] - c["before_end"] - 0.05, -9)                   # ... and the two notes of the feeling, in the pause after "before."

# ================================================================= 2. relax: the room, and one swallow
sfx.add(pan_st(gulp(20), 0.0), c["gulp"], db(-9))                                         # gulp (the pause after "Relax.")
sfx.add(pan_st(filt(whoosh(0.3, 300, 2400, 21, 0.85), "lowpass", 3000), 0), SHOT["caught"] - 0.26, db(-15))   # ... and in we go

# ================================================================= 3. caught: a small voice shouting, a torch, silence
bed.add(thump(0.3, 120, 44, 0.09), SHOT["caught"] - 0.02, db(-9))
g0 = c["gulp"] + 0.2
gb = gibber(c["beam"] - g0 - 0.02, 22, 420.0, True, 0.0, 26.0)                             # the eager one, at it: heard on the way in ...
gt = g0 + ar(len(gb))
gb *= np.minimum(1, (gt - g0) / 0.15) * np.where(gt < c["your"] - 0.02, 1.0, 0.4)           # ... then far back under her words (it stops dead ...)
bed.add(pan_st(gb, 0.1), g0, db(-15))
sfx.add(pan_st(key_click(23), -0.3), c["beam"] - 0.02, db(-9))                            # ... when the torch clicks on
bed.add(thump(0.22, 140, 56, 0.07), c["beam"], db(-11))
stamp_hit(c["busted"], -4.0, 0.1)                                                         # BUSTED (the pause after "lying.")

# ================================================================= 4. bell: he can't keep still ... a deep breath ... SEEN IT! (ding)
sfx.add(pan_st(filt(whoosh(0.28, 400, 2400, 30, 0.8), "lowpass", 3000), 0), SHOT["bell"] - 0.2, db(-18))
for j, th in enumerate(c["hops"]):
    bed.add(pan_st(bloop(240 + 30 * j, 130, 0.14), 0.0), th + 0.26, db(-17))               # each hop lands (low)
nw = c["seen"] - c["windup"] - 0.06
sfx.add(pan_st(breath(nw * 0.9, 31), 0.0), c["windup"], db(-10))                           # the breath in (the pause after "yells:")
sfx.add(pan_st(slide_whistle(nw, 420, 1250), 0.0), c["windup"] + 0.02, db(-21))            # ... winding up
low_thud(c["seen"], -4.0, 150.0, 0.3, 0.09)                                               # both hands on the bell (under "SEEN": low)
for m, g, tau in ((88, -1.5, 0.11), (95, -7.0, 0.07), (100, -12.0, 0.05)):                 # DING (just after "IT!"); short, so it is gone before "Maybe"
    sfx.add(bell(mtof(m), 0.3, tau) * 0.5, c["ding"], db(g), pan=0.0)

# ================================================================= 5. layout: the outlines light up; another room under them; it goes
sfx.add(pan_st(filt(whoosh(0.26, 500, 1900, 40, 0.7), "lowpass", 2600), 0), SHOT["layout"] - 0.18, db(-21))
for i in range(8):                                                                        # one small tick per outline (high, quiet: they are under "this room is laid out")
    bed.add(blip(2500 + 180 * i, 3300 + 180 * i, 0.05, 41 + i, 0.018), c["wire"] + 0.1 * i + 0.05, db(-27), pan=-0.5 + i / 7)
for j, m in enumerate((72, 76, 79, 84, 88)):                                              # the other room comes up: a music box, going up
    bed.add(music_box(mtof(m + 12), 0.5, 45 + j) * 0.6, c["morph"] + 0.06 * j, db(-27), pan=-0.3 + 0.15 * j)
bed.add(pan_st(bloop(260, 84, 0.55), 0.0), c["fog"], db(-13))                              # ... and goes (low, under "forgot")
nfog = int((END["layout"] - c["fog"]) * SR)
bed.add(pan_st(norm(filt(pink(nfog, 46), "bandpass", [140, 420])) * np.linspace(0, 1, nfog) ** 0.6, 0), c["fog"], db(-21))    # mist
sfx.add(pan_st(slide_whistle(0.2, 620, 1150), -0.2), c["forgot_end"] + 0.04, db(-17))      # "?" (the pause after "forgot.")

# ================================================================= 6. files: flick, flick, flick ... an empty folder ... nope
sfx.add(pan_st(filt(whoosh(0.26, 450, 2000, 50, 0.7), "lowpass", 2800), 0), SHOT["files"] - 0.18, db(-20))
for i, tf in enumerate(c["flips"]):
    bed.add(pan_st(pen_tick(51 + i), 0.2), tf, db(-21))                                    # a folder up (quiet: under "checks the files")
    bed.add(thump(0.07, 190, 90, 0.02), tf + 0.02, db(-19))
sfx.add(pan_st(cork_pop(56, 300.0), 0.1), c["empty"], db(-8))                             # the empty one (the pause after "files...")
nm = int(0.26 * SR)
moth = filt(white(nm, 57), "bandpass", [2400, 6000]) * (np.sin(2 * np.pi * 34 * ar(nm)) > 0.2) * np.sin(np.pi * np.linspace(0, 1, nm))
sfx.add(pan_st(moth, 0.4), c["empty"] + 0.1, db(-25))                                      # a moth gets out
bwomp(sfx, c["womp"], 38, -9.0)                                                           # ... (the pause after "nope.")
low_thud(c["norecord"], -8.0, 130.0, 0.3, 0.09)                                           # the stamp lands (under "Never": low)
stamp_hit(c["thud1"], -7.0, 0.1)                                                          # ... and is heard after "here."

# ================================================================= 7. clash: the one at the front; two slips; IMPOSSIBLE; the alarm
sfx.add(pan_st(filt(whoosh(0.26, 400, 1900, 60, 0.7), "lowpass", 2800), 0), SHOT["clash"] - 0.18, db(-20))
for j in range(4):                                                                        # he walks in (low)
    bed.add(pan_st(bloop(210, 110, 0.12), 0.5 - 0.15 * j), c["so"] + 0.05 + 0.3 * j, db(-17))
fwip(c["slip_a"], -13.0, -0.4)                                                            # the green slip (the pause after "in:")
sfx.add(bell(mtof(84), 0.26, 0.08) * 0.5, c["slip_a"] + 0.12, db(-7), pan=-0.4)           # ... ding: a match
fwip(c["slip_b"], -13.0, 0.4)                                                             # the red slip (the pause after "but")
sfx.add(pan_st(fade(buzzer(0.15), 0.002, 0.03), 0.4), c["slip_b"] + 0.12, db(-15))         # ... bzzt: no record
ticking(c["impossible"] - 0.05, c["stamp"], bed, db(-25), 9, 26, 61)                       # his eyes: left, right, left, right (high, quiet)
low_thud(c["stamp"], -3.0, 140.0, 0.4, 0.12)                                              # the stamp, inside "IMPOSSIBLE" (low)
al = alarm_bell(END["clash"] - c["alarm"] - 0.08, 62, 26.0, 1900.0)
sfx.add(pan_st(al * np.linspace(1, 0.6, len(al)), 0.3), c["alarm"], db(-8))                # the alarm (the pause after "IMPOSSIBLE.")
sfx.add(thump(0.2, 150, 60, 0.06), c["alarm"], db(-10))

# ================================================================= 8. dejavu: the shiver; a heartbeat; its name. Then the aside, and a cat. Twice
bed.add(pan_st(shiver(0.7, 70), 0.0), c["shiver"] + 0.02, db(-22))                         # brrr (quiet: under "creepy clash")
eerie(c["clash_end"] + 0.03, c["thats"] - c["clash_end"] - 0.08, -13)                     # the two notes again, with the heartbeat (the pause after "clash?")
sfx.add(heartbeat(71), c["clash_end"] + 0.05, db(-6))                                     # ba-dum (the pause after "clash?")
bed.add(thump(0.7, 100, 36, 0.24), c["title2"], db(-6))                                   # DÉJÀ VU lands (low, under the words)
bed.add(pan_st(filt(glitch_burst(0.16, 72), "highpass", 4800), 0), c["title2"], db(-25))
sfx.add(pan_st(breath(0.3, 73, True), 0.0), c["phew"], db(-13))                           # phew (the pause after "vu.")
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 74, 0.03), 0), c["sub_in"], db(-21))
    sfx.add(pan_st(blip(900, 2000, 0.08, 75, 0.03), 0), c["sub_in"] + 0.12, db(-23))
    sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-3))                                     # the click, in the pause after "Subscribe..."
    sfx.add(pan_st(key_click(76), 0), c["sub_tap"] + 0.004, db(-5))
    sfx.add(pan_st(bell(1760, 0.3, 0.07) * 0.5, 0.2), c["sub_tap"] + 0.05, db(-21))
MEOW = meow(0.26, 600.0, 870.0, 500.0, 77)                                                # one meow, used twice: the same cat, the same way
sfx.add(pan_st(MEOW, 0.15), c["meow1"], db(-7))                                           # mrrow (after the click)
sfx.add(pan_st(MEOW, 0.15), c["meow2"], db(-6))                                           # ... mrrow (after "weirder.")
for t0 in (c["cat1"], c["cat2"]):                                                         # its paws (very soft, low)
    for j in range(7):
        bed.add(thump(0.05, 260, 150, 0.014), t0 + 0.12 + 0.2 * j, db(-27), pan=0.6 - 0.2 * j)

# ================================================================= 9. next: he knows what happens next
bed.add(pan_st(blip(520, 980, 0.1, 80, 0.04), 0.4), c["bubble"], db(-21))                  # the thought comes up
bed.add(pan_st(filt(whoosh(0.2, 300, 900, 81, 0.6), "lowpass", 1000), 0.3), c["point"] - 0.05, db(-18))   # his arm goes out (low)
bed.add(pan_st(fade(jingle(0.34, 82, 30), 0.002, 0.16), 0.5), c["point"] + 0.22, db(-25))  # the cup rattles ... and stays
sfx.add(bell(mtof(96), 0.13, 0.04) * 0.5, c["next_end"] + 0.02, db(-6), pan=0.4)          # ting: ... nothing (after "NEXT.")

# ================================================================= 10. lab: THAT way. 100 % sure. Wrong. A coin
sfx.add(pan_st(filt(whoosh(0.24, 500, 2000, 90, 0.7), "lowpass", 2800), 0), SHOT["lab"] - 0.16, db(-20))
bed.add(pan_st(blip(330, 520, 0.09, 91, 0.04), -0.4), c["arrow"], db(-17))                 # his arrow lights (low, under "felt")
bed.add(pan_st(bloop(300, 170, 0.12), 0.3), c["badge"], db(-17))                           # the badge (under "SURE")
bz = buzzer(min(0.17, c["and2"] - c["wrong"] - 0.03))
sfx.add(pan_st(bz, 0.0), c["wrong"], db(-12))                                             # WRONG (the pause after "SURE...")
bed.add(bell(mtof(105), 0.12, 0.03) * 0.5, c["toss"], db(-19), pan=0.2)                    # the coin goes up: a thin ting (above the words)
nfl = int((c["land"] - c["toss"]) * SR)
whirr = filt(white(nfl, 92), "highpass", 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 19 * ar(nfl))) * np.sin(np.pi * np.linspace(0, 1, nfl))
bed.add(pan_st(whirr, 0.2), c["toss"], db(-28))                                            # ... spinning
for m, g in ((100, -4.0), (105, -7.0), (93, -10.0)):                                       # ching: it lands (the pause after "flip.")
    sfx.add(bell(mtof(m), 0.34, 0.09) * 0.5, c["land"], db(g), pan=0.2)
sfx.add(thump(0.14, 200, 80, 0.04), c["land"], db(-10))
sfx.add(pan_st(fade(jingle(0.3, 93, 34), 0.002, 0.16), 0.2), c["land"] + 0.05, db(-18))

# ================================================================= 11. psychic: ommm ... no. And the turban
sfx.add(pan_st(filt(whoosh(0.3, 900, 300, 100, 0.6), "lowpass", 1800), 0), SHOT["psychic"] - 0.2, db(-19))
hm = hum_voice(c["youre"] - c["no_end"] - 0.13, 147.0, 101, 0.35)
sfx.add(pan_st(hm, 0.0), c["no_end"] + 0.03, db(-9))                                       # his "ommm" (the pause after "So no...")
low_thud(c["ballx"], -6.0, 150.0, 0.3, 0.09)                                              # the ball says no (under "not": low)
bz2 = buzzer(0.13)
sfx.add(pan_st(bz2, 0.0), c["psychic_end"] + 0.03, db(-13))                               # bzzt (the pause after "psychic.")
sfx.add(pan_st(slide_whistle(0.26, 880, 300), 0.0), c["droop"] + 0.08, db(-16))            # the turban slides over his eyes

# ================================================================= 12. button: static in the ball ... a door ... and in we go
ns = int(0.3 * SR)
bed.add(pan_st(tv_static(0.3, 110) * np.linspace(1, 0.3, ns), 0.0), c["flicker"], db(-19))   # static (above "Wait")
for j, m in enumerate((84, 88, 91, 96)):                                                  # the picture comes through (the pause after "Wait...")
    sfx.add(bell(mtof(m), 0.16, 0.05) * 0.5, c["wait_end"] + 0.07 + 0.06 * j, db(-9), pan=-0.3 + 0.2 * j)
eerie(c["before2_end"] + 0.02, c["dive"] - c["before2_end"] + 0.45, -9)                    # the same two notes as second 3.5: she HAS said this before
nd = c["loop"] - c["dive"]
sfx.add(pan_st(filt(whoosh(nd + 0.1, 240, 3200, 111, 0.92), "lowpass", 4200), 0), c["dive"], db(-8))       # in we go
sfx.add(pan_st(filt(riser(nd, 112, 200, 1500), "lowpass", 3000), 0), c["dive"], db(-17))
sfx.add(thump(0.3, 130, 44, 0.09), c["loop"] - 0.02, db(-9))                               # ... and we are at the door
bed.add(thump(0.12, 150, 60, 0.035), c["loop"] + 0.12, db(-17))                            # his last step up to it

# ================================================================= score (it drops out for the feeling and for every punchline)
STRUT = ["F", "Dm", "Bb", "C"]
# hook: a new-cafe strut while he walks in; it stops when he does ("door..."), so the feeling arrives in a hush
groove(mus, 0.3, c["door_end"] + 0.02, 104, STRUT, gain=-13, seed=3, kick_on=False, padv=False, cutoff=1000)
# bell: the bouncy mechanism groove (after "Scientists think"); it stops for the breath in, the shout and the DING
groove(mus, c["think"] + 0.12, c["yells_end"], 112, ["Dm", "Bb", "F", "C"], gain=-14, seed=10, snaps=False, cutoff=1200)
# layout: slow and curious under the outlines; a warm held chord for grandma's kitchen; nothing once it is forgotten
groove(mus, c["maybe"] + 0.32, c["morph"], 92, ["Am", "F"], gain=-15, seed=20, kick_on=False, snaps=False, cutoff=900)
drone(mus, c["morph"], c["fog"] + 0.12, [60, 64, 67, 72], cutoff=600, gain=-32, seed=21, swell=0.22)
# files: a sneaky walk (bass and snaps only) while she looks; it stops for the empty folder
groove(mus, c["memory"] + 0.2, c["files_end"], 100, ["Am", "E"], gain=-12, seed=30, kick_on=False, padv=False, arp=False, cutoff=1000)
# clash: the boss's strut as he steps in; then a rise through "IMPOSSIBLE" that the stamp cuts
groove(mus, c["front"] + 0.05, c["in_end"], 104, ["Gm", "D"], gain=-15, seed=40, snaps=True, cutoff=1100)
_rz = riser(c["stamp"] - c["but"], 41, 200, 1300)
mus.add(pan_st(filt(_rz, "lowpass", 1500), 0), c["but"], db(-25))
# dejavu: silence for the shiver and the heartbeat; a low warm chord under the name; a light strut under "it gets weirder"
drone(mus, c["title2"], c["vu_end"] + 0.1, [36, 43, 48, 52], cutoff=420, gain=-27, seed=50, swell=0.08)
groove(mus, c["itgets"] + 0.24, c["weirder_end"], 104, ["C", "F"], gain=-13, seed=42, kick_on=False, padv=False, cutoff=1100)
# next: sly, sure of himself, until he calls it
groove(mus, c["feels"] + 0.2, c["point"], 100, ["F", "Bb"], gain=-13, seed=51, kick_on=False, snaps=False, cutoff=1000)
# lab: a quiz-show tick (after "In the lab,"); the buzzer cuts it
groove(mus, c["people"] + 0.3, c["sure_end"], 120, ["Am", "Am", "F", "E"], gain=-14, seed=60, kick_on=False, snaps=False, sixteen=True, cutoff=1200)
# psychic: a held "mystic" chord until the ball says no
drone(mus, SHOT["psychic"] + 0.05, c["ballx"], [33, 40, 44, 47], cutoff=380, gain=-29, seed=70, swell=0.3)
silence(mus, [(c["door_end"] + 0.03, c["think"] + 0.1), (c["yells_end"], c["maybe"] + 0.3), (c["fog"] + 0.14, c["memory"] + 0.18), (c["files_end"] + 0.02, c["front"] + 0.04),
              (c["in_end"] + 0.02, c["but"] - 0.01), (c["stamp"] - 0.01, c["title2"] - 0.01), (c["weirder_end"] + 0.03, c["feels"] + 0.18),
              (c["point"] - 0.01, c["people"] + 0.29), (c["sure_end"] + 0.01, SHOT["psychic"] + 0.04), (c["ballx"] - 0.01, c["have"] - 0.11)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -9.5})
