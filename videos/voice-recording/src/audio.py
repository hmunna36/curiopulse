"""Why Does Your Voice Sound WEIRD on Recordings? Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Worked example: the skill's reference/examples/audio.finger-wrinkles.py.

This Short is about a sound, so the sound does the explaining:
- the voice out of his phone is `gibber(thin=True)`: squeaky, no body (what a microphone keeps);
- on "deeper... like a movie trailer" the narrator's own voice goes "inside the head" (`deep_voice`, via mixlib's
  voice_fx hook: more low-mid body, less top) and snaps back on "But a microphone";
- his hum starts thin (heard across the room) and turns into the boom (heard with the ears plugged) on "That boom?".
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
SYL = 19.8                                        # the phone voice's syllable clock (scenes.js uses the same)


def on(*ids):
    return [(SHOT[i], END[i]) for i in ids]


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


def ding(t, gain=-18.0, notes=(88, 93), pan=0.2, dur=0.32, bus=None):
    """a small two-note "right!" (in a pause)"""
    for j, m in enumerate(notes):
        (bus or sfx).add(bell(mtof(m), dur, dur * 0.3) * 0.5, t + j * 0.07, db(gain), pan=pan)


def phone_voice(t0, t1, seed, gain, bus, pan=0.3, f0=300.0):
    """the stranger in the phone: thin gibberish between two times"""
    bus.add(pan_st(gibber(t1 - t0, seed, f0, True, t0, SYL), pan), t0, db(gain))


COUCH = ("hook", "who", "you", "plug", "button", "sub")
HEAD = ("twice", "deep", "mic")

# ================================================================= ambience (one bed per world, gated to its shots)
room = norm(filt(brown(N, 1), "lowpass", 220))                                          # the living room at night: a hush
amb.x += pan_st(room, 0) * 0.3 * gate(N, on(*COUCH))
pulse = norm(filt(pink(N, 4), "bandpass", [45, 240]) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.2 * tt) ** 2))
amb.x += pan_st(pulse, 0) * 0.5 * gate(N, on(*HEAD))                                    # inside the head: muffled, a slow pulse
wind = norm(filt(pink(N, 5), "bandpass", [240, 800]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * tt)))
amb.x += pan_st(wind, 0) * 0.5 * gate(N, on("trailer"), 0.04)                           # the trailer: wind on a ridge
crowd = norm(filt(pink(N, 6), "bandpass", [180, 520]) * (0.7 + 0.3 * filt(white(N, 7), "lowpass", 2)))
amb.x += pan_st(crowd, 0) * 0.42 * gate(N, [(SHOT["always"], c["realise"])], 0.04)                          # karaoke: the bar's murmur (under the speech band)
booth = norm(filt(brown(N, 8), "lowpass", 140))
amb.x += pan_st(booth, 0) * 0.2 * gate(N, on("study"))                                  # the booth: almost nothing

# ================================================================= 1. hook: the thumb on PLAY ... and a squeaky stranger comes out
sfx.add(pan_st(key_click(1), 0), 0.0, db(-13))                                           # frame 1: tap
sfx.add(pan_st(blip(700, 1300, 0.05, 2, 0.02), 0), 0.012, db(-20))                      # ... the UI answers
sfx.add(pan_st(filt(whoosh(0.34, 300, 1500, 3, 0.75), "lowpass", 1800), 0), 0.0, db(-25))    # the camera falls back
sfx.add(pan_st(filt(whoosh(0.26, 400, 2200, 4, 0.8), "lowpass", 3000), 0.1), c["front"] - 0.2, db(-18))   # the cut to the front
sfx.add(thump(0.22, 130, 52, 0.07), c["front"], db(-17))
phone_voice(c["gib0"], c["gib1"], 11, -26.5, bed)                                       # it starts talking, far under her
phone_voice(c["gib1"], c["gib1_end"], 12, -7.5, sfx, 0.3, 330.0)                        # ... then it gets the room to itself (the pause after "and-")
sfx.add(pan_st(filt(breath(0.16, 13), "highpass", 800), -0.4), c["gib1"] + 0.34, db(-24))   # he sucks in a breath

# ================================================================= 2. who: "WHO is THAT?!"
bed.add(pan_st(horror_stab(0.5, 21), 0), SHOT["who"], db(-17))                          # a sting on the cut (under "WHO")
phone_voice(c["gib1_end"] + 0.06, c["that_end"], 22, -28.0, bed)                        # the phone carries on, far under
phone_voice(c["that_end"] + 0.1, c["that_end"] + 0.42, 23, -12.0, sfx, 0.4, 350.0)      # ... and gets the last word in (the pause before "Bad news")

# ================================================================= 3. you: "Bad news. That's you."
sfx.add(pan_st(filt(whoosh(0.24, 500, 1600, 30, 0.8), "lowpass", 2400), 0), SHOT["you"] - 0.16, db(-21))
bed.add(pan_st(blip(900, 1500, 0.07, 31, 0.03), -0.2), c["ident"], db(-21))             # the name lights up (in the pause after "news.")
sfx.add(pan_st(bell(mtof(86), 0.3, 0.12) * 0.5, -0.2), c["news_end"] + 0.1, db(-17))    # ... ping
bw = Bus(int(0.7 * SR))
bwomp(bw, 0.0, 41, 0.0)
sfx.add(bw.x[:, : int(0.26 * SR)] * np.linspace(1, 0, int(0.26 * SR)) ** 0.7, c["you_end"] + 0.02, db(-10))   # a sad little blat (after "you.")

# ================================================================= 4. twice: route 1 through the air, route 2 through the skull
sfx.add(pan_st(filt(whoosh(0.26, 300, 2400, 40, 0.8), "lowpass", 3000), 0.1), SHOT["twice"] - 0.2, db(-19))
sfx.add(thump(0.2, 130, 50, 0.05), SHOT["twice"] - 0.03, db(-20))
ding(c["twice_end"] + 0.02, -7.0, (86, 86), 0.1, 0.16)                                  # TWICE: tick, tick (after the word)
na = int((c["air_end"] - c["once1"]) * SR)
air = norm(filt(pink(na, 41), "bandpass", [4600, 9500])) * np.sin(np.pi * np.linspace(0, 1, na)) ** 0.7       # above the speech band
assert len(air) == na
bed.add(pan_st(air, np.linspace(-0.1, -0.7, na)), c["once1"], db(-24))                  # the air route draws on: breath (above the words)
sfx.add(pan_st(blip(1500, 2400, 0.06, 42, 0.02), -0.5), c["air_end"] + 0.02, db(-15))   # ... arrives at the ear
nb = int((c["skull"] - c["once2"]) * SR)
rum = norm(filt(buzz(nb, 62, 43, 0.3), "lowpass", 240)) * np.linspace(0.3, 1, nb)
bed.add(pan_st(rum, 0.3), c["once2"], db(-15))                                          # the skull route: a low buzz in the bone
sfx.add(pan_st(bonk()[: int(0.16 * SR)] * np.linspace(1, 0, int(0.16 * SR)) ** 0.5, 0.3), c["skull_end"] + 0.02, db(-6))     # SKULL: knock (after the word)
sfx.add(thump(0.14, 180, 70, 0.04), c["skull_end"] + 0.02, db(-11))

# ================================================================= 5. deep + 6. trailer: her voice goes inside the head; the title slams
bed.add(pan_st(blip(500, 800, 0.08, 50, 0.04), 0), SHOT["deep"] + 0.3, db(-24))         # the scope pops up (under "The skull")
nd = int((c["like"] - c["deeper_end"] - 0.02) * SR)
sw = glide(118, 74, nd / SR, 0.8) * np.sin(np.pi * np.linspace(0, 1, nd)) ** 0.6
sfx.add(pan_st(np.tanh(2.0 * sw) + 0.6 * glide(236, 148, nd / SR, 0.8) * np.sin(np.pi * np.linspace(0, 1, nd)), 0), c["deeper_end"] + 0.01, db(-14))   # the fat wave swells (after "deeper.")
nr = int((c["braam"] - SHOT["trailer"]) * SR)
bed.add(pan_st(filt(riser(nr / SR, 51, 120, 500), "lowpass", 900), 0), SHOT["trailer"], db(-22))      # the wind-up (under "Like a")
br = Bus(int(1.4 * SR))
for m, g in ((26, 0.0), (33, -3.0), (38, -5.0)):
    bwomp(br, 0.0, m, g)                                                                # the braam: three stacked blats
nbr = int((c["trailer_end"] - c["braam"]) * SR)
bed.add(br.x[:, :nbr] * np.linspace(1, 0.4, nbr), c["braam"], db(-11))                  # ... under "movie trailer" (low: it leaves her words alone)
bed.add(thump(0.5, 110, 36, 0.2), c["braam"], db(-10))
DUN = c["trailer_end"] + 0.02
sfx.add(thump(0.26, 150, 40, 0.09), DUN, db(-6))                                        # DUN (after "trailer.")
sfx.add(br.x[:, : int(0.22 * SR)] * np.linspace(1, 0, int(0.22 * SR)) ** 0.8, DUN, db(-9))
_cy = cymbal(52, 0.3)
sfx.add(_cy * np.linspace(1, 0, _cy.shape[-1]) ** 2, DUN, db(-22))

# ================================================================= 7. mic: only the air route gets in
sfx.add(pan_st(filt(whoosh(0.22, 500, 1800, 60, 0.8), "lowpass", 2600), 0.3), SHOT["mic"] - 0.14, db(-20))
for k in range(2):                                                                      # tap, tap: is this on? (under "But a")
    bed.add(pan_st(filt(thump(0.07, 500, 220, 0.02), "highpass", 160), 0.3), c["but"] + 0.06 + 0.14 * k, db(-19))
bed.add(pan_st(blip(700, 1100, 0.06, 61, 0.03), -0.4), c["microphone"] + 0.2, db(-23))  # the recorder wakes up
bed.add(pan_st(filt(thump(0.12, 260, 110, 0.04), "lowpass", 500), 0.2), c["blocked"], db(-16))    # the skull route bumps into the inside of his head
bed.add(bell(mtof(91), 0.2, 0.07) * 0.5, c["air2"], db(-22), pan=-0.4)                  # AIR: tick
sfx.add(pan_st(fade(buzzer(0.12), 0.002, 0.03), -0.3), c["part_end"] + 0.02, db(-13))                      # SKULL: nope (after "part.")

# ================================================================= 8. always: karaoke night. He sings; the room has always heard the thin one
sfx.add(pan_st(filt(whoosh(0.24, 500, 2000, 70, 0.8), "lowpass", 2800), 0), SHOT["always"] - 0.16, db(-19))
SING = (67, 69, 72, 71, 69, 67, 64, 65, 67, 72, 74, 72)                                 # an original little tune, in C
song = gibber(c["realise"] - c["sing"], 71, 300.0, True, c["sing"], SYL / 2, SING)
ns = len(song)
loud = gate(ns, [(c["recording_end"] - c["sing"] + 0.02, c["iswhat"] - c["sing"] - 0.07), (c["else_end"] - c["sing"] + 0.02, c["has"] - c["sing"] - 0.07),
                 (c["has"] - c["sing"] + 0.2, c["always"] - c["sing"] - 0.06)], 0.03)
bed.add(pan_st(song * (0.07 + 0.93 * loud), -0.2), c["sing"], db(-7))                   # loud only in her pauses, 19 dB down under her words
SCR = c["realise"]
sfx.add(pan_st(scratch(0.2, 72), 0), SCR - 0.02, db(-7))                                       # the record scratches (the pause after "ALWAYS")
sfx.add(pan_st(cricket(73, 3, 4700), 0.5), c["heard_end"] + 0.03, db(-8))              # ... and a cricket (after "heard.")
for k, tk in enumerate((c["always"], c["always"] + 0.17, c["always"] + 0.34)):          # AGE 7, AGE 17, LAST WEEK: three small pops under "ALWAYS"
    bed.add(pan_st(blip(600 + 120 * k, 900 + 180 * k, 0.05, 74 + k, 0.02), 0.4), tk, db(-24))

# ================================================================= 9. plug: fingers in, a hum ... the BOOM
sfx.add(pan_st(filt(whoosh(0.22, 400, 1500, 80, 0.8), "lowpass", 2200), 0), SHOT["plug"] - 0.14, db(-21))
for k, p in enumerate((-0.5, 0.5)):                                                     # the fingers go in: plup, plup (under "Plug your")
    bed.add(pan_st(filt(cork_pop(81 + k, 300.0), "lowpass", 1200), p), c["fingers"] + 0.05 * k, db(-18))
H0, H1 = c["humstart"], END["plug"] - 0.04
nh = int((H1 - H0) * SR)
th = H0 + ar(nh)
inside = np.clip((th - (c["boom"] - 0.08)) / 0.12, 0, 1)                                # outside the head -> inside it, on "boom"
hum = hum_voice(nh / SR, 147.0, 82, inside, H0, 3.3)
assert len(hum) == nh, (len(hum), nh)
# across the room it is a small thing (and it gets the pause after "hum."); inside, it is big (and it gets the pause after "boom?")
lvl = np.full(nh, db(-13.0))
lvl[th > c["hum_end"]] = db(1.0)
lvl[th > c["thatboom"] - 0.02] = db(-13.0)
lvl[th > c["boom"] - 0.08] = db(-7.0)
lvl[th > c["boom_end"] + 0.01] = db(0.0)
lvl[th > c["yourskull"] - 0.03] = db(-6.5)
lvl[th > c["skull2_end"]] = db(-3.0)
k = max(1, int(0.03 * SR))
lvl = np.convolve(np.pad(lvl, k, mode="edge"), np.ones(k) / k, "same")[k:-k]
bed.add(pan_st(hum * lvl, 0), H0, db(-5))
sfx.add(thump(0.3, 150, 46, 0.1), c["boom"] - 0.06, db(-8))                             # WHUMP: we go inside his head
sfx.add(pan_st(bonk(), 0.2), c["skull2_end"] + 0.02, db(-12))                           # YOUR SKULL: knock, again

# ================================================================= 10. study: three voices, one of them his
sfx.add(pan_st(filt(whoosh(0.24, 500, 2000, 90, 0.8), "lowpass", 2800), 0), SHOT["study"] - 0.16, db(-19))
for k in range(3):                                                                      # the cards drop in
    bed.add(pan_st(blip(500 + 90 * k, 800 + 140 * k, 0.05, 91 + k, 0.02), -0.4 + 0.4 * k), SHOT["study"] + 0.02 + 0.1 * k, db(-23))
bed.add(pan_st(key_click(94), 0), SHOT["study"] + 0.2, db(-22))                         # headphones on
bed.add(pan_st(gibber(c["recorded"] - c["people"], 95, 150.0, True, c["people"], SYL), -0.5), c["people"] + 0.2, db(-33))     # voice 1: a deep one
bed.add(pan_st(gibber(c["without"] - c["recorded"], 96, 230.0, True, c["recorded"], SYL), 0.0), c["recorded"], db(-30))  # voice 2
bed.add(pan_st(gibber(c["flip"] - c["without"], 97, 300.0, True, c["without"], SYL), 0.4), c["without"], db(-29))        # voice 3: we know this one
for k in range(3):                                                                      # three stars (under "rated")
    bed.add(pan_st(pen_tick(98 + k), -0.4), c["rated"] + 0.05 + 0.09 * k, db(-21))
for k in range(2):                                                                      # two stars (under "voices")
    bed.add(pan_st(pen_tick(101 + k), 0), c["voices"] + 0.05 + 0.1 * k, db(-21))
bed.add(pan_st(filt(whoosh(0.3, 400, 1600, 103, 0.7), "lowpass", 2400), 0.3), c["flip"] - 0.02, db(-21))   # the card turns round
ding(c["ownv_end"] + 0.03, -6.0, (84, 91), 0.3, 0.26)                                   # it's him: ta-da (after "OWN.")
for j, m in enumerate((72, 76, 79, 84, 88, 91)):                                        # hearts: a music box, rising (under "They liked theirs")
    bed.add(fade(music_box(mtof(m), 0.4, 104 + j), 0.002, 0.14) * 0.6, c["hearts"] + j * 0.15, db(-19), pan=-0.2 + 0.1 * j)
for k in range(5):                                                                      # five stars, up the scale (the pause before "MORE")
    sfx.add(bell(mtof(84 + 2 * k), 0.14, 0.05) * 0.5, c["theirs_end"] + 0.03 + 0.055 * k, db(-11), pan=0.3)
for j, m in enumerate((79, 86)):                                                        # "!": he has seen whose voice it is (after "MORE.")
    sfx.add(pizz(mtof(m), 0.2, 110 + j), c["more_end"] + 0.02 + j * 0.06, db(-13), pan=-0.3)

# ================================================================= 11. button: he plays it again ... and rather likes it
bed.add(pan_st(key_click(120), 0.3), c["replay"] - 0.02, db(-16))
phone_voice(c["replay"], c["replay_end"], 121, -9.0, sfx, 0.3, 330.0)                   # the stranger again (the pause after her chuckle)
phone_voice(c["replay_end"], c["voice2_end"], 122, -29.0, bed)                          # ... carrying on, far under "Maybe you don't hate your voice."
nm = int(round(0.26 * SR))
mm = hum_voice(0.26, 196.0, 123, 0.0) * np.where(ar(nm) < 0.11, 1.0, 0.0) + np.roll(hum_voice(0.26, 247.0, 124, 0.0) * np.where(ar(nm) < 0.13, 1.0, 0.0), int(0.13 * SR))
sfx.add(pan_st(fade(mm, 0.01, 0.03), -0.2), c["voice2_end"] + 0.05, db(-6))             # "mm-hm": not bad, actually (the pause after "voice.")
warm = pad([mtof(m) for m in (53, 57, 60, 64)], c["you2_end"] - c["youjust"] + 0.2, 0.4, 1500, 125)
mus.add(pan_st(fade(warm, 0.05, 0.3), 0), c["youjust"], db(-29))                        # a warm chord under "You just hate knowing it's you."
HEART = c["you2_end"] + 0.03
sfx.add(pan_st(bloop(300, 620, 0.16), 0.3), HEART, db(-10))                             # the heart pops (after "you.")
sfx.add(bell(mtof(88), 0.4, 0.15) * 0.5, HEART + 0.05, db(-15), pan=0.3)

# ================================================================= 12. sub: the tease, a small hic, the click, the BIG one, the phone lands on PLAY
bed.add(pan_st(blip(700, 1200, 0.07, 130, 0.03), 0), c["nextup"] - 0.03, db(-22))       # the card pops up
sfx.add(pan_st(hiccup(131, 520.0), -0.2), c["hic1"], db(-8))                            # hic (the pause after "why we hiccup.")
if "sub_in" in c:
    sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-21))
    sfx.add(pan_st(blip(900, 2000, 0.08, 72, 0.03), 0), c["sub_in"] + 0.12, db(-23))
    sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(1))                                   # the click, in the pause after "Subscribe..."
    sfx.add(pan_st(key_click(73), 0), c["sub_tap"] + 0.004, db(-1))
    sfx.add(pan_st(bell(1760, 0.5, 0.12) * 0.5, 0.2), c["sub_tap"] + 0.06, db(-17))
sfx.add(pan_st(hiccup(132, 400.0, 2.0), -0.1), c["hic"], db(0))                         # HIC! (after "hits.")
sfx.add(thump(0.26, 170, 60, 0.07), c["hic"] + 0.01, db(-8))
TOSS = c["catch"] - c["hic"] - 0.1
_sw = slide_whistle(TOSS, 520, 1700)
sfx.add(pan_st(_sw, np.linspace(0.3, -0.1, len(_sw))), c["hic"] + 0.08, db(-16))        # the phone goes up ...
sfx.add(pan_st(filt(whoosh(0.3, 2200, 500, 133, 0.6), "lowpass", 3000), 0), c["catch"] - 0.06, db(-13))             # ... and comes down
sfx.add(thump(0.14, 240, 110, 0.03), c["play2"], db(-13))                               # into his hand: frame 1's tap is next

# ================================================================= score (drops out for every punchline)
# hook: a sneaky walk while he listens; it stops for the stranger's solo
groove(mus, 0.42, c["and_end"], 100, ["Dm", "Gm"], gain=-11, seed=3, kick_on=False, padv=False, cutoff=1000)
# twice: the bouncy mechanism groove; it stops dead for the knock on "SKULL", comes back for "The skull version sounds..."
groove(mus, c["talk"], c["fx_in"], 112, ["Dm", "Bb", "F", "C"], gain=-12, seed=10, snaps=False, cutoff=1200)
# deeper: only a low held note under her "inside the head" voice, so the change is hers
drone(mus, c["fx_in"], c["braam"], [38, 45, 50], cutoff=380, gain=-29, seed=11, swell=0.2)
choir = pad([mtof(m) for m in (50, 57, 62, 65, 69)], c["trailer_end"] - c["braam"] + 0.05, 0.06, 2000, 12)
mus.add(pan_st(fade(choir, 0.01, 0.1), 0), c["braam"], db(-27))                         # the trailer's choir
# mic: a light walk; it stops for the buzzer
groove(mus, c["microphone"], c["part_end"], 104, ["Am", "F"], gain=-13, seed=20, kick_on=False, padv=False, cutoff=1100)
# karaoke: the backing track he is singing to; the scratch kills it
groove(mus, c["sing"], c["realise"], 124, ["C", "Am", "F", "G"], gain=-15, seed=30, sixteen=True, cutoff=1500)
# study: a curious walk; it stops when the card turns round, and the music box takes over
groove(mus, c["study"] + 0.1, c["flip"], 100, ["Am", "F", "C", "G"], gain=-13, seed=40, kick_on=False, padv=False, cutoff=1000)
dream = pad([mtof(m) for m in (60, 64, 67, 71)], c["more_end"] - c["they"] + 0.1, 0.3, 1800, 41)
mus.add(pan_st(fade(dream, 0.05, 0.15), 0), c["they"], db(-29))
# sub: a light strut under the tease; the big hiccup cuts it off
groove(mus, c["nextup"] + 0.25, c["hic"], 104, ["C", "F", "G", "C"], gain=-12, seed=42, kick_on=False, padv=False, cutoff=1100)
silence(mus, [(c["and_end"] - 0.02, c["talk"] - 0.01), (c["skull_end"] - 0.02, c["version"] - 0.01), (c["trailer_end"] + 0.03, c["microphone"] - 0.01),
              (c["part"] - 0.04, c["sing"] - 0.01), (c["realise"] - 0.01, c["study"] + 0.09), (c["flip"] - 0.01, c["they"] - 0.01),
              (c["more_end"] + 0.08, c["youjust"] - 0.01), (c["you2_end"] + 0.25, c["nextup"] + 0.2), (c["hic"] - 0.01, DUR)])


# ================================================================= the narrator, inside the head
def deep_voice(vo):
    """her voice from "deeper" to "trailer.": what the skull would add (low-mid body) and what it would lose (the top).
    Crossfaded in and out over 50 ms; its peak stays at the level of the rest of the voice."""
    a, b, x = int(c["fx_in"] * SR), int(c["fx_out"] * SR), int(0.05 * SR)
    a0, b0 = max(0, a - SR // 2), min(len(vo), b + SR // 2)
    seg = vo[a0:b0]
    y = seg + 1.7 * filt(seg, "bandpass", [140, 460], 2)             # the body
    y = 0.38 * y + 0.62 * filt(y, "lowpass", 2300, 2)                # ... and less top
    y = y + 0.22 * np.roll(filt(y, "bandpass", [200, 900]), int(0.011 * SR))   # a close little room: the inside of a head
    y *= np.abs(vo).max() * 0.97 / (np.abs(y[a - a0:b - a0]).max() + 1e-9) if np.abs(y[a - a0:b - a0]).max() > np.abs(vo).max() * 0.97 else 1.0
    w = np.zeros(len(seg))
    w[a - a0:b - a0] = 1.0
    w[a - a0 - x:a - a0] = np.linspace(0, 1, x)
    w[b - a0:b - a0 + x] = np.linspace(1, 0, x)
    out = vo.copy()
    out[a0:b0] = (1 - w) * seg + w * y
    return out


# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -21.0, "music": -13.0}, voice_fx=deep_voice)
