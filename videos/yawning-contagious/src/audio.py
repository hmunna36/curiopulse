"""Why Is Yawning CONTAGIOUS? Short: sound design, score and mix, cue-locked to timeline.json.

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


# ================================================================= ambience (one bed per world, gated to its shots)
bus_on = gate(N, on("hook", "react", "social", "dogs", "button", "sub") + [(SHOT["weird"], c["just"] - 0.18), (c["canstart"] - 0.12, END["weird"])])
amb.x += bus_hum(N, 3) * bus_on * 1.0
street_on = gate(N, on("name"))
traffic = np.stack([filt(pink(N, s), "bandpass", [70, 320]) for s in (11, 12)])
amb.x += traffic / (np.abs(traffic).max() + 1e-9) * 0.6 * street_on
stage_on = gate(N, on("why"))
amb.x += pan_st(filt(brown(N, 21), "lowpass", 180), 0) * 0.25 * stage_on
inside_on = gate(N, on("cool"))
flow = filt(pink(N, 22), "bandpass", [70, 380]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.2 * tt))
amb.x += pan_st(flow / (np.abs(flow).max() + 1e-9), 0) * 0.7 * inside_on
lab_on = gate(N, on("pack"))
amb.x += pan_st(buzz(N, 60, 23, 0.2) * 0.08 + filt(pink(N, 24), "bandpass", [200, 1200]) * 0.2, 0.2) * lab_on
book_on = gate(N, [(c["just"] - 0.18, c["canstart"] - 0.12)])
amb.x += pan_st(filt(brown(N, 25), "lowpass", 140), 0) * 0.3 * book_on

# ================================================================= 1. hook: the yawn hops along the bench
sfx.add(thump(0.4, 90, 38, 0.12), 0.0, db(-14))                                          # frame 1: a low hit, under the voice
# the passengers' yawns (low, mostly in the narration's gaps), each hop of the wisp gets a rising note
# the passengers' yawns sit in the narration's gaps (after "yawns...", after "then the next...")
gap1 = c["next1"] - 0.25
sfx.add(pan_st(yawn_voice(0.45, 300, 170, 31, 0.6, ((900, 420), (1400, 850))), -0.5), gap1, db(-28))
sfx.add(pan_st(yawn_voice(0.42, 170, 85, 32, 0.5), -0.1), c["next2"] - 0.42, db(-24))
for k, (t0, m) in enumerate(((gap1 + 0.05, 72), (c["next2"] - 0.38, 76), (c["then_end"] + 0.03, 79))):
    sfx.add(pan_st(fade(note(mtof(m), 0.4, 0.01, 0.2, 3000) + 0.4 * note(mtof(m + 12), 0.4, 0.01, 0.12, 5000), 0.005, 0.1), -0.5 + 0.35 * k), t0, db(-30))
# the wisp lands on him: a dread pulse while he fights it, then the big stretch
ticking(c["andthen"] + 0.6, c["yawning"] - 0.05, sfx, db(-32), 5, 18, 50)            # the dread, in the pause
n = int((c["yawning"] - c["andthen"] - 0.55) * SR)
dread = glide(220, 330, n / SR, 1.0) * np.linspace(0.2, 1, n) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 8 * ar(n)))
sfx.add(pan_st(fade(dread, 0.05, 0.05), 0.2), c["andthen"] + 0.6, db(-31))
sfx.add(pan_st(springs(51, 0.9), 0.2), c["you_end"] + 0.02, db(-26))                    # the stretch lets go
# after the yawn: a little sniff, the tear
sfx.add(pan_st(blip(1400, 900, 0.12, 53, 0.04), 0.2), c["you_end"] + 0.05, db(-27))

# ================================================================= 2. react: the stare (silence is the joke)
sfx.add(thump(0.3, 140, 70, 0.06), SHOT["react"], db(-18))
crickets(SHOT["react"] + 0.1, c["thanks"] - 0.05, bed, db(-34), 61, 4800, 1.5)
sfx.add(pan_st(blip(600, 380, 0.14, 62, 0.04), -0.4), END["react"] - 0.18, db(-26))   # the stranger's awkward gulp

# ================================================================= 3. name: the bus passes, title, the 50 % faces
sfx.add(pan_st(filt(fade(engine(2.4, 70), 0.2, 0.4), "lowpass", 300), np.linspace(-0.7, 0.6, int(2.4 * SR))), SHOT["name"] - 0.1, db(-22))
sfx.add(thump(0.6, 110, 40, 0.18), c["contagious"] - 0.04, db(-12))
sfx.add(thump(0.5, 120, 45, 0.14), c["yawning_w"] - 0.04, db(-14))
crash(mus, c["about"] - 0.32, -26, 72)
for k in range(5):   # the windows yawn in a ripple: soft descending pops
    sfx.add(pan_st(blip(900 - 60 * k, 600 - 40 * k, 0.07, 73 + k, 0.03), -0.6 + 0.3 * k), c["thats"] + 0.15 + 0.32 * k, db(-36))
sfx.add(pan_st(whoosh(0.28, 600, 2800, 78, 0.8), 0), c["about"] - 0.36, db(-24))
pops([c["about"] - 0.22 + i * 0.03 for i in range(8)], sfx, db(-34), 79)
for j, m in enumerate((79, 83, 86)):
    sfx.add(bell(mtof(m), 0.7, 0.2) * 0.5, c["catch_end"] + 0.04 + j * 0.05, db(-26), pan=(j - 1) * 0.3)

# ================================================================= 4. why: the sigh, "?", the shrug, UNSOLVED
sfx.add(pan_st(whoosh(0.3, 2000, 400, 80, 0.6), 0), SHOT["why"] - 0.25, db(-22))
sfx.add(pan_st(blip(500, 900, 0.16, 81, 0.06), 0), c["why_w"] + 0.3, db(-22))     # "?" boop (after the word)
sfx.add(pan_st(slide_whistle(0.3, 900, 500), 0.2), c["nobody"] - 0.28, db(-29))         # the shrug, in the pause
st_ = c["sure_end"] + 0.01                                                               # UNSOLVED slams (after the word)
sfx.add(thump(0.45, 140, 55, 0.1), st_, db(-9))
sfx.add(pan_st(crack(0.1, 83, 0.03, 900), 0), st_, db(-24))

# ================================================================= 5. cool: idea 1, the head cutaway
sfx.add(pan_st(whoosh(0.4, 2600, 300, 90, 0.7, 0.8), 0), SHOT["cool"] - 0.42, db(-22))
sfx.add(filt(bloop(150, 55, 0.5), "lowpass", 280), SHOT["cool"] - 0.05, db(-18))
for j, m in enumerate((84, 88)):
    sfx.add(bell(mtof(m), 0.8, 0.25) * 0.5, c["yawns_cool"] - 0.3 + j * 0.05, db(-28), pan=0.3)
n = int(1.4 * SR)   # the warm brain: a low simmer
sim = filt(pink(n, 91), "bandpass", [300, 1400]) * (0.5 + 0.5 * np.sin(2 * np.pi * 6 * ar(n))) * np.linspace(0.3, 1, n)
sfx.add(pan_st(fade(filt(sim, "lowpass", 600), 0.1, 0.2), 0), c["yawns_cool"] - 0.1, db(-34))
sfx.add(pan_st(creak(0.45, 92, 70, 160, (380, 900, 1700)), 0.2), c["gulp"] - 0.45, db(-30))   # the jaw drops
n = int(1.3 * SR)
wind = np.stack([filt(pink(n, 93 + s), "bandpass", [3500, 9000]) for s in (0, 1)])
wind = wind / (np.abs(wind).max() + 1e-9) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.8
sfx.add(fade(wind, 0.1, 0.2), c["gulp"] + 0.05, db(-30))                                  # cool air in (above the voice)
for k in range(4):                                                                        # the blood rush: heartbeats
    sfx.add(heartbeat(96 + k, 1.0), c["rush"] - 0.15 + k * 0.42, db(-21))
for j, m in enumerate((96, 100, 103, 108)):                                               # the brain cools: ice chimes
    sfx.add(bell(mtof(m), 1.2, 0.35) * 0.45, c["blood_end"] + 0.12 + j * 0.06, db(-24), pan=-0.4 + 0.27 * j)
sfx.add(pan_st(ice_crack(0.7, 98), 0), c["blood_end"] + 0.1, db(-32))

# ================================================================= 6. pack: the cold-pack study
sfx.add(pan_st(whoosh(0.3, 400, 2600, 100, 0.8), 0), SHOT["pack"] - 0.36, db(-24))
sfx.add(pan_st(blip(1200, 1200, 0.05, 101, 0.01), -0.5), SHOT["pack"] + 0.15, db(-30))   # the monitor's REC beep
for k in range(2):   # the yawn on the monitor (small speaker: band-limited), looping
    tY = SHOT["pack"] + 0.75 + 2.2 * k
    if tY < c["caught"] - 0.4:
        yv = filt(yawn_voice(1.1, 300, 150, 102 + k, 0.6, ((900, 420), (1400, 850))), "bandpass", [500, 2600])
        sfx.add(pan_st(yv, -0.55), tY, db(-36))
sfx.add(pan_st(filt(squelch(0.3, 104), "lowpass", 900), 0.3), c["coldpack"] - 0.12, db(-24))  # the pack goes on
sfx.add(pan_st(ice_crack(0.5, 105), 0.3), c["coldpack"] + 0.3, db(-30))
n = int(0.9 * SR)
strain = glide(420, 520, 0.9, 1.0) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * ar(n))) * np.linspace(0.3, 1, n)
sfx.add(pan_st(fade(strain, 0.05, 0.05), 0.3), c["coldpack"] + 0.35, db(-38))
for j, m in enumerate((84, 91)):
    sfx.add(bell(mtof(m), 0.6, 0.2) * 0.5, c["forehead"] + 0.42 + j * 0.06, db(-28), pan=0.3)  # smug ding
sfx.add(pan_st(whoosh(0.22, 800, 3200, 106, 0.8), 0), c["caught"] - 0.32, db(-26))
sfx.add(pan_st(fade(glide(120, 280, 0.6, 1.2) * np.linspace(0.4, 1, int(0.6 * SR)), 0.01, 0.1), -0.4), c["caught"], db(-26))  # warm bar rises
sfx.add(pan_st(blip(700, 900, 0.07, 107, 0.03), 0.4), c["yawns_pack"] + 0.62, db(-24))     # the cold bar: a tiny pip (after "yawns")

# ================================================================= 7. social: the copycat
sfx.add(pan_st(whoosh(0.28, 500, 2600, 110, 0.8), 0), SHOT["social"] - 0.36, db(-24))
for j, m in enumerate((86, 89)):
    sfx.add(bell(mtof(m), 0.7, 0.2) * 0.5, c["idea2"] + 0.45 + j * 0.05, db(-30), pan=-0.3)
beats = [c["social"] + 0.05, c["copy"] - 0.05, c["faces"] + 0.05, c["around"] + 0.15]
for k, (b, m) in enumerate(zip(beats, (76, 81, 72, 69))):   # the teen's note ... echoed by him 0.32 s later
    sfx.add(pan_st(fade(marimba(mtof(m - 12), 0.35, 111 + k), 0.002, 0.05), -0.45), b + 0.02, db(-32))
    sfx.add(pan_st(fade(marimba(mtof(m - 12), 0.35, 115 + k), 0.002, 0.05), 0.45), b + 0.34, db(-32))
sfx.add(pan_st(yawn_voice(0.32, 230, 140, 119, 0.6), 0.4), c["around"] + 0.78, db(-30))

# ================================================================= 8. dogs: the dog catches his
sfx.add(pan_st(whoosh(0.25, 2400, 500, 120, 0.7), 0), SHOT["dogs"] - 0.32, db(-26))
sfx.add(pan_st(jingle(0.3, 121, 30), 0.5), c["even"] + 0.38, db(-34))                     # the dog's tag (head tilt)
gapd = SHOT["weird"] + 0.05 - c["ours_end"]                                             # the gap before the whisper
dog_yawn = yawn_voice(max(0.3, gapd - 0.08), 760, 420, 122, 0.4, ((1400, 900), (2600, 1500)))
dog_yawn = dog_yawn + 0.6 * np.concatenate([squeak(0.12, 1700, 2600), np.zeros(len(dog_yawn) - int(0.12 * SR))])
sfx.add(pan_st(fade(dog_yawn, 0.01, 0.06), 0.5), c["ours_end"] + 0.02, db(-16))            # after "OURS", never on it

# ================================================================= 9. weird: whispered, the book, the yawn
sfx.add(pan_st(whoosh(0.4, 1800, 300, 130, 0.5), 0), SHOT["weird"] - 0.42, db(-30))
sfx.add(pan_st(rustle(0.3, 131), 0), c["part"] + 0.35, db(-34))                         # a page turns (in the pause)
sfx.add(pan_st(music_box(mtof(96), 0.4, 133), 0.2), c["yawns_r_end"] + 0.02, db(-36))  # the page glows (in the gap after "yawns...")
sfx.add(pan_st(yawn_voice(0.32, 260, 150, 141, 0.55), 0), c["one_end"] + 0.03, db(-29))   # his yawn (after "one")

# ================================================================= 10. button: BORED? no. SCIENCE.
sfx.add(pan_st(whoosh(0.28, 500, 2600, 150, 0.8), 0), SHOT["button"] - 0.33, db(-26))
sfx.add(pan_st(filt(blip(300, 600, 0.12, 152, 0.04), "lowpass", 700), 0.3), c["this_end"] + 0.05, db(-26))   # the point lands
sfx.add(thump(0.3, 120, 60, 0.06), c["this_end2"] + 0.02, db(-18))                      # BORED? pops (in the pause)
sfx.add(pan_st(buzzer(0.4), 0), c["boredom_end"] + 0.02, db(-17))                        # the X (after the word)
sfx.add(pan_st(riser(0.45, 153, 3000, 6000), 0), c["science"] - 0.5, db(-34))
for j, m in enumerate((84, 88, 91, 96)):
    sfx.add(bell(mtof(m), 0.5, 0.12) * 0.5, c["science_end"] + 0.03 + j * 0.04, db(-23), pan=(j - 1.5) * 0.3)

# ================================================================= 11. sub: the growl, the nod-off, the loop
sfx.add(pan_st(whoosh(0.28, 2000, 400, 160, 0.7), 0), SHOT["sub"] - 0.36, db(-26))
sfx.add(pan_st(filt(stomach_growl(0.24, 161), "lowpass", 240), 0), c["stomach_end"] - 0.02, db(-12))   # in the gap before "growls" 
sfx.add(pan_st(whoosh(0.5, 300, 3000, 162, 0.9), np.linspace(0.8, -0.8, int(0.5 * SR))), END["sub"] - 0.55, db(-20))  # the whip pan
sfx.add(pan_st(yawn_voice(0.5, 300, 170, 163, 0.6, ((900, 420), (1400, 850))), -0.4), END["sub"] - 0.45, db(-32))

# ================================================================= subscribe cue (pill pop, cursor click, bell ding)
# quiet on purpose: it sits under the spoken subscribe line and must not mask the word.
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"] + 0.05, db(-26))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.17, db(-28))
    if "sub_tap" in c:
        sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-20))
        sfx.add(pan_st(bell(1760, 0.6, 0.18), 0), c["sub_tap"] + 0.02, db(-28))

# ================================================================= score (drops out for every punchline)
# hook: a sneaky pizzicato walk that builds as the yawn spreads; it stops dead for his yawn
groove(mus, c["person_end"], c["yawning"] - 0.05, 112, ["F", "Dm", "Bb", "C"], gain=-11, seed=10, kick_on=False, padv=False, cutoff=1000)
groove(mus, 1.7, c["yawning"] - 0.05, 112, ["F", "Dm", "Bb", "C"], gain=-14, seed=11, bass=False, arp=False)
# name: bright, bouncy (the title)
groove(mus, c["contagious"] - 0.02, END["name"], 116, ["F", "C", "Dm", "Bb"], gain=-6, seed=20)
# why: nothing but the room (the sigh, the shrug)
# cool: a curious minor drive under the science, a wonder pad as the brain cools
groove(mus, c["idea1"] + 0.4, c["blood_end"] + 0.1, 104, ["Am", "F", "C", "G"], gain=-8, seed=30, snaps=False, sixteen=True)
drone(mus, c["blood_end"], END["cool"] + 0.3, [64, 69, 72, 76], 1600, -26, 31, 0.15)
# pack: a sneaky lab walk, then the chart
groove(mus, SHOT["pack"] + 0.3, END["pack"], 108, ["Dm", "Bb", "Gm", "A"], gain=-9, seed=40, padv=False, half=False)
# social + dogs: playful
groove(mus, c["social"] + 0.2, c["ours"] - 0.1, 116, ["C", "G", "Am", "F"], gain=-9, seed=50, kick_on=False)
# weird: hush (a music-box pad only)
drone(mus, SHOT["weird"] + 0.1, END["weird"], [48, 55, 60, 64], 600, -30, 60, 0.4)
# button: back to the bounce, then the science chord
groove(mus, c["so"] + 0.3, c["boredom_end"], 116, ["F", "Dm", "Bb", "C"], gain=-9, seed=70, kick_on=False)
groove(mus, c["science_end"] + 0.05, END["button"] - 0.12, 116, ["F", "C"], gain=-11, seed=71)
# sub: a lullaby as everyone nods off
for k, m in enumerate((72, 76, 79, 76, 72, 74, 76, 72)):
    mus.add(pan_st(music_box(mtof(m), 1.2, 80 + k), 0.2 * (-1) ** k), SHOT["sub"] + 0.15 + k * 0.5, db(-30))
drone(mus, SHOT["sub"], DUR, [41, 48, 53, 57], 500, -32, 81, 0.6)
silence(mus, [(c["yawning"] - 0.05, SHOT["name"] - 0.02), (c["ours"] - 0.1, END["dogs"]),
              (c["boredom_end"], c["science_end"] + 0.02)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -12.0})
