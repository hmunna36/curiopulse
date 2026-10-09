"""What Happens If You NEVER Sleep? (Day by Day) (long-form): sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The score has ONE theme, a lullaby in F (3/4): C A F | G A - | C A G | F - -. Through the whole film it never gets
its last note: in the hook the music box is cut off by the slurp; it comes back bouncy on pizzicato while he brags,
minor and detuned on days two and three, as a music box over Randy's sleep in 1964, glassy and slow for the
jellyfish, and soft on piano when he lies down, each time stopping on G. Only in the final image does it end on F.
Silence: the skip (the microsleep), the stop after "sixty-five", and "the gut".
"""
import json
import os
import sys

import numpy as np

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
WORDS = TL["words"]
sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()


def shots(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def wend(word, after=0.0):
    """end time of the first word starting with `word` at or after `after`"""
    return next(w["end"] for w in WORDS if w["word"].lower().startswith(word.lower()) and w["start"] >= after - 0.01)


# ---------------------------------------------------------------- the theme
OPEN = [(72, 1), (69, 1), (65, 1), (67, 1), (69, 2), (72, 1), (69, 1), (67, 1), (67, 3)]   # stops on G
CLOSE = [(72, 1), (69, 1), (65, 1), (67, 1), (69, 2), (72, 1), (69, 1), (67, 1), (65, 4)]  # ends on F
MINOR = {69: 68, 72: 72, 65: 65, 67: 67}


def theme(t0, bpm, inst="box", gain=-16.0, notes=OPEN, tr=0, minor=False, detune=0.0, pan=0.0, upto=None, seed=0):
    beat = 60.0 / bpm
    t = t0
    for k, (m, d) in enumerate(notes):
        if upto is not None and t >= upto:
            break
        m = MINOR.get(m, m) if minor else m
        f = mtof(m + tr) * (1 + detune * np.sin(k * 1.7))
        ln = max(0.5, d * beat + 0.4)
        sig = {"box": lambda: music_box(f, max(1.4, ln), seed + k), "pizz": lambda: pizz(f, 0.5, seed + k),
               "marimba": lambda: marimba(f, 0.8, seed + k), "piano": lambda: piano(f, max(0.9, ln), seed + k)}[inst]()
        mus.add(sig, t, db(gain), pan=pan)
        t += d * beat
    return t


def fly_buzz(dur, seed=0):
    n = int(dur * SR)
    f = 210 * (1 + 0.05 * np.sin(2 * np.pi * 3 * ar(n)))
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + 0.2 * white(n, seed)
    return fade(filt(y, "bandpass", (180, 2400)), 0.08, 0.15)


def chalk(seed=0):
    return fade(filt(white(int(0.22 * SR), seed), "bandpass", (2500, 7000)) * attack_decay(int(0.22 * SR), 0.01, 0.12), 0.002, 0.03)


# ================================================================= ambience
day_room = shots("hook", "cat", "champion", "book", "very", "dawn", "cereal", "couch", "micro", "easy", "day2", "nap")
night_room = shots("blind", "day3", "coat", "seeing", "catspeak", "randy", "refused", "bed", "champ")
amb.x += pan_st(filt(brown(N, 4), "lowpass", 180), 0) * 0.12 * gate(N, day_room + night_room, 0.25)
for k, t in enumerate(np.arange(SHOT["hook"] + 1.5, END["very"], 2.3)):
    sfx.add(tweet(k, 3200 + 300 * (k % 3)), t, db(-34), pan=-0.6)
crickets(SHOT["blind"], END["blind"], amb, db(-36), seed=2)
crickets(SHOT["day3"], END["catspeak"], amb, db(-38), seed=3)
crickets(SHOT["bed"], END["champ"], amb, db(-40), seed=4)
inside = shots("pile", "locks", "bell", "alarm", "city")
amb.x += pan_st(filt(pink(N, 9), "bandpass", (160, 480)) * 0.3, 0) * gate(N, inside, 0.3) * 0.6
sixties = shots("sixty4", "watch", "pinball", "count", "sevens", "record", "slept")
amb.x += projector(N, 3) * gate(N, sixties, 0.3) * 0.22
lab = shots("rats", "ratsdead", "flies", "gut", "mop")
amb.x += pan_st(filt(brown(N, 5), "lowpass", 260) + 0.02 * np.sin(2 * np.pi * 120 * tt), 0) * 0.32 * gate(N, lab, 0.2)
sea = shots("jelly", "older")
amb.x += pan_st(filt(brown(N, 11), "lowpass", 300) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.12 * tt)), 0) * 0.45 * gate(N, sea, 0.4)
amb.x += pan_st(filt(pink(N, 12), "lowpass", 700), 0) * 0.22 * gate(N, shots("rinse", "opposite"), 0.3)
amb.x += pan_st(filt(brown(N, 13), "lowpass", 140), 0) * 0.5 * gate(N, shots("road"), 0.1)

# ================================================================= whooshes into cuts (not the hard comedy cuts)
for s in TL["shots"][1:]:
    if s["id"] in ("very", "skip", "couch", "coat", "stop", "final", "sub", "gut", "bed"):
        continue
    sfx.add(pan_st(whoosh(0.3, 500, 2600, 600 + int(s["start"])), 0), s["start"] - 0.26, db(-30))

# ================================================================= the clock flips
for k, (t, *_r) in enumerate(c["clock"]):
    if t < 1:
        continue
    sfx.add(pan_st(blip(1400, 900, 0.05, 30 + k, 0.02), -0.6), t, db(-24))
    sfx.add(thump(0.18, 160, 70, 0.04, k), t + 0.02, db(-24))

# ================================================================= hook: slurp, gulps; the lullaby is cut off
sfx.add(slurp(0.5, 1), 0.0, db(-22))
sfx.add(filt(slurp(1.4, 2), "lowpass", 300), 0.4, db(-24))
for k, t in enumerate(np.arange(0.3, c["chug_end"] - 0.2, 0.55)):
    sfx.add(filt(gulp(k), "lowpass", 280), t, db(-28))
sfx.add(pan_st(thump(0.2, 240, 90, 0.05, 3), 0), c["chug_end"] + 0.7, db(-22))   # the pot on the table
theme(c["daybyday"] - 0.2, 96, "box", gain=-24, upto=SHOT["cat"] - 0.3, seed=1)

# brag: a bouncy pizzicato theme, cut dead for "Very."
theme(SHOT["cat"] + 0.1, 132, "pizz", gain=-18, seed=3)
groove(mus, SHOT["champion"], c["very"] - 0.15, 116, ["F", "Bb", "C", "F"], gain=-14, seed=4, padv=False)
sfx.add(bell(1568, 1.0, 0.4), c["champion"] + 0.3, db(-30))
sfx.add(cricket(1, 3), wend("Very") + 0.15, db(-26), pan=0.4)

# ================================================================= act 1
drone(mus, SHOT["pile"], END["locks"], [53, 60, 65], cutoff=420, gain=-30)
for k, t in enumerate(np.arange(c["chemical"], END["pile"] - 0.3, 0.37)):
    sfx.add(bloop(500 + 40 * (k % 5), 300, 0.12), t, db(-34), pan=-0.3 + 0.1 * (k % 6))
for k in range(5):
    sfx.add(pan_st(blip(900, 600, 0.06, 50 + k, 0.02), 0.3), c["plugs"] - 0.4 + 0.18 * k, db(-30))
sfx.add(crumple(0.25, 2), wend("tape") + 0.05, db(-26))
sfx.add(crumple(0.2, 3), wend("light.") + 0.08, db(-24))
theme(SHOT["pile"] + 0.5, 84, "marimba", gain=-24, minor=True, upto=END["locks"] - 0.5, seed=5)
# blind: an eye twitch
for k in range(3):
    sfx.add(squeak(0.06, 2600, 3000), wend("see", c["cant"]) + 0.12 + 0.09 * k, db(-30))
# drunk: a woozy waltz, the "=" hit, the meter
groove(mus, SHOT["drunk"] + 0.3, END["drunk"] - 0.3, 92, ["F", "Gm", "C", "F"], gain=-16, seed=6, kick_on=False, half=True)
sfx.add(thump(0.3, 180, 60, 0.06, 2), c["drinks"] + 0.2, db(-24))
sfx.add(pan_st(blip(1200, 1200, 0.25, 9, 0.02), 0), wend("limit") + 0.05, db(-28))
# toast: the knife scrapes, the phone buzzes
sfx.add(scribble(1.6, 2, 11), SHOT["toast"] + 0.3, db(-30))
sfx.add(fade(filt(buzz(int(0.5 * SR), 150, 4), "lowpass", 900), 0.01, 0.05), wend("phone") + 0.05, db(-24))
# dawn: a riser into the sun, birds; the bell rings in the pause after "bell"
sfx.add(riser(1.6, 3, 300, 1800), c["great"] - 1.4, db(-28))
mus.add(pad([mtof(x) for x in (65, 69, 72, 77)], END["dawn"] - c["sun"], 0.8, 1500, 7), c["sun"], db(-22))
for k, t in enumerate(np.arange(c["sun"], END["dawn"], 0.9)):
    sfx.add(tweet(20 + k, 3500), t, db(-32), pan=-0.5)
sfx.add(alarm_bell(0.7, 1), wend("bell") + 0.08, db(-28))
# alarm: heartbeat, a hit on +60%
for k, t in enumerate(np.arange(c["alarm"], END["alarm"] - 0.3, 0.62)):
    bed.add(heartbeat(k, 1.0), t, db(-22))
drone(mus, SHOT["alarm"], END["alarm"], [50, 57, 63], cutoff=380, gain=-30)
sfx.add(thump(0.35, 120, 45, 0.08, 5), c["sixty"] + 0.4, db(-22))
# cereal: the jingle of the ad, then the sob, the score stops for "nice cereal"
theme(SHOT["cereal"] + 0.1, 150, "marimba", gain=-20, tr=12, upto=c["nice"] - 0.6, seed=8)
sfx.add(baby_cry(0.7, 2, 230), wend("ad.") + 0.05, db(-26))
# city: lights switching off
drone(mus, SHOT["city"], END["city"], [45, 52, 58], cutoff=360, gain=-28)
for k in range(9):
    sfx.add(pan_st(blip(700 - 40 * k, 300, 0.07, 70 + k, 0.03), -0.5 + 0.12 * k), c["patches"] + 0.45 * k, db(-34))
# skip: nothing at all but three glitches
for t in c["skip_jumps"]:
    sfx.add(glitch_burst(0.08, int(t * 10)), t, db(-24))
# micro / couch / road
sfx.add(pan_st(thump(0.3, 200, 60, 0.05, 7), 0), SHOT["couch"] + 0.02, db(-20))
sfx.add(springs(4, 0.4), SHOT["couch"] + 0.05, db(-30))
bed.add(engine(END["road"] - SHOT["road"], 2), SHOT["road"], db(-26))
sfx.add(klaxon(0.6, 1), wend("crash") + 0.15, db(-22))
# easy: the clock races
ticking(SHOT["easy"], END["easy"], sfx, db(-30), 4, 22, seed=3)
sfx.add(riser(1.8, 5, 200, 1400), END["easy"] - 1.8, db(-30))

# ================================================================= act 2: days two to four
sfx.add(shiver(0.6, 1), wend("freezing") + 0.05, db(-26))
for k in range(4):
    sfx.add(chomp(k), wend("donuts") + 0.1 + 0.18 * k, db(-30))
theme(SHOT["day2"] + 0.2, 80, "box", gain=-26, minor=True, detune=0.012, upto=END["nap"] - 0.3, seed=12)
sfx.add(shush(0.5, 1), c["whisper"] - 0.1, db(-34))
# day three: the wobble, a creak, the coat (silence, then a stab after "head")
drone(mus, SHOT["day3"], END["seeing"], [46, 47, 53], cutoff=320, gain=-28)
sfx.add(creak(1.0, 3), c["floor"] + 0.3, db(-28))
bed.add(breath(1.6, 2), SHOT["coat"] + 0.3, db(-28))
sfx.add(horror_stab(0.55, 1), wend("head") + 0.08, db(-20))
sfx.add(meow(0.4, 600, 820, 500, 2), wend("bed", c["gotobed"]) + 0.12, db(-24))

# ================================================================= 1964
rag(mus, SHOT["sixty4"] + 0.2, END["pinball"] - 0.2, bpm=120, gain=-20, seed=2)
for k, t in enumerate(np.arange(SHOT["pinball"] + 0.4, END["pinball"] - 0.2, 0.42)):
    sfx.add(bell(1760 + 220 * (k % 3), 0.3, 0.15), t, db(-34), pan=0.4)
sfx.add(jingle(0.8, 2), wend("scientist", c["beating"]) + 0.1, db(-28))
clock_ticks(SHOT["count"], END["sevens"], sfx, db(-34))
for k, n in enumerate(("n100", "n93", "n86", "n79", "n72", "n65")):
    sfx.add(chalk(k), c[n] + 0.02, db(-30))
# the stop: silence (no score, no ticks), then a low note when he has forgotten
sfx.add(bell(220, 2.0, 1.2), wend("doing") + 0.2, db(-30))
crash(mus, SHOT["record"] + 0.05, gain=-26)
theme(SHOT["slept"] + 0.1, 72, "box", gain=-22, upto=END["slept"], seed=20)

# ================================================================= the refusal, the edge
sfx.add(thump(0.4, 140, 45, 0.1, 9), c["stamp"] + 0.02, db(-16))
bwomp(mus, wend("try.") + 0.1, m=33, gain=-18)
drone(mus, SHOT["rats"], END["ratsdead"], [41, 48, 53], cutoff=300, gain=-28)
sfx.add(riser(0.8, 2, 600, 200), c["dead"] - 0.2, db(-34))
bed.add(fly_buzz(END["flies"] - SHOT["flies"] - 0.6, 3), SHOT["flies"] + 0.3, db(-30))
sfx.add(thump(0.6, 90, 35, 0.15, 11), wend("gut.") + 0.1, db(-18))
for k in range(8):
    sfx.add(bloop(700 + 60 * k, 400, 0.1), c["anti"] + 0.2 + 0.25 * k, db(-32), pan=0.3 * ((-1) ** k))
theme(SHOT["mop"] + 0.4, 104, "marimba", gain=-22, upto=END["mop"] - 0.2, seed=30)
for k in range(5):
    sfx.add(gurgle(0.6, k), SHOT["rinse"] + 0.5 + 1.2 * k, db(-34))
sfx.add(scratch(0.3, 2), wend("opposite") + 0.08, db(-24))
groove(mus, SHOT["argue"] + 0.1, END["argue"], 140, ["F", "C"], gain=-16, seed=33, padv=False, arp=False)
sfx.add(thump(0.3, 160, 60, 0.05, 13), c["arguing"] + 0.3, db(-20))
# the sea: wonder (the theme on glassy bells, slow)
mus.add(pad([mtof(x) for x in (53, 60, 65, 69, 72)], END["older"] - SHOT["jelly"], 1.5, 1100, 40), SHOT["jelly"], db(-22))
theme(SHOT["jelly"] + 0.6, 66, "box", gain=-22, tr=12, upto=END["older"], seed=41)

# ================================================================= his turn, the final image
theme(SHOT["bed"] + 0.4, 70, "piano", gain=-20, upto=END["bed"] - 0.2, seed=50)
sfx.add(pan_st(thump(0.25, 220, 80, 0.05, 15), 0), SHOT["bed"] + 2.0, db(-26))   # the book shuts
bed.add(purr(END["sub"] - SHOT["champ"] - 0.5, 1), SHOT["champ"] + 1.2, db(-30))
for k, t in enumerate(np.arange(SHOT["champ"] + 1.5, DUR - 0.5, 1.8)):
    sfx.add(tweet(60 + k, 3300), t, db(-36), pan=-0.6)
mus.add(pad([mtof(x) for x in (53, 60, 65, 69)], DUR - c["final"] + 0.6, 1.2, 1300, 60), c["final"] - 0.6, db(-24))
theme(c["final"] - 4.6, 100, "box", gain=-20, notes=CLOSE, seed=61)   # it finally ends on F

# subscribe cue: soft pop, click, ding (under the line, quiet)
sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-26))
sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-22))
sfx.add(pan_st(bell(1760, 1.2, 0.5), 0), c["sub_tap"] + 0.08, db(-30))

# ================================================================= silences (the score stops for the punchlines)
silence(mus, [
    (c["very"] - 0.1, wend("Very") + 0.7),
    (c["blind"] - 0.1, END["blind"]),
    (c["drop"] - 0.1, END["toast"]),
    (c["nice"] - 0.3, END["cereal"]),
    (SHOT["skip"], END["micro"]),
    (c["funny"] - 0.4, END["couch"]),
    (SHOT["coat"], wend("head") + 0.1),
    (c["fairly"] - 0.2, END["catspeak"]),
    (c["n65_end"], END["stop"]),
    (c["notbrain"] - 0.2, END["gut"]),
    (c["arguing"] - 0.1, END["argue"]),
    (c["moody"] - 2.0, c["moody"] - 0.2), (c["seeing2"] - 0.3, c["seeing2"] + 0.9),
])
for a, b in [(SHOT["skip"], END["skip"]), (c["n65_end"] + 0.1, END["stop"] - 0.05)]:
    i0, i1 = span(a, b)
    amb.x[:, max(0, i0):max(0, i1)] *= 0.05

master(WORK, sfx, bed, mus, amb, levels={"music": -15.0, "amb": -22.0, "sfx": -8.0})
