"""One Night on URANUS Lasts 42 Years Short: sound design, score and mix, cue-locked to timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.
Motifs: him = a music box (his lullaby); the planet = a low brass blat (it flops, it snores); time = ratchet ticks.
The loop score (sound.md): one tempo whose bars fill the Short exactly (12 bars), sections on bar lines, pickup notes in
the last beat leading back into bar 1.
"""
import json
import os
import sys

import numpy as np

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
c = C

sfx, bed, amb, mus = Bus(), Bus(), Bus(), Bus()   # bed = SFX that duck harder under the voice

# the gags against each other (dB); the whole sfx bus is moved in master()
G = dict(whoosh=-21, wind=-28, tick=-30, glint=-27, flap=-26, ff=-22, ffring=-25, thud=-15, slide=-22, bwomp=-14,
         snore=-24, roll=-20, dusk=-22, click=-24, ding=-20, pop=-24, sink=-21, lapse=-27, slam=-16, ring=-12,
         clunk=-17, creak=-23, sting=-15, pick=-23)


def low_whoosh(dur, seed, cut=340):
    """a move of the camera, all of it under the voice band (it can sit on a word)"""
    return filt(whoosh(dur, 160, 900, seed, 0.8), "lowpass", cut)


def top_only(x, f=5200.0):
    """keep what is above f: a sound that can sit under a word"""
    return filt(x, "highpass", f)


def flap_clack(n_flaps=5, seed=0, edges=False):
    """a split-flap display turning over: a quick run of dry clacks that slows into the last one"""
    total = sum(0.03 + 0.012 * k for k in range(n_flaps))
    out = np.zeros(int((total + 0.15) * SR))
    tk = 0.0
    for k in range(n_flaps):
        x = key_click(seed + k)
        if edges:
            x = top_only(x, 4800.0)
        i = int(tk * SR)
        out[i:i + len(x)] += x[: len(out) - i] * (0.7 + 0.3 * (k == n_flaps - 1))
        tk += 0.03 + 0.012 * k
    return out / (np.abs(out).max() + 1e-9)


def pillow_thump(seed=0):
    """a planet landing on a pillow: a soft deep fwump, all under 260 Hz (it can sit on the word)"""
    n = int(0.42 * SR)
    y = filt(brown(n, seed), "lowpass", 260) * attack_decay(n, 0.01, 0.16)
    k = filt(kick(1.0), "lowpass", 200)[:n]
    y[:len(k)] += 0.8 * k
    return fade(y / (np.abs(y).max() + 1e-9), 0.003, 0.08)


def rolling(dur, seed=0):
    """a huge ball rolling: a low rumble with a slow wobble, all under 300 Hz (it can run under a line)"""
    n = int(dur * SR)
    u = np.linspace(0, 1, n)
    y = filt(brown(n, seed), "lowpass", 240) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.6 * ar(n))) * np.sin(np.pi * u) ** 0.5
    return fade(y / (np.abs(y).max() + 1e-9), 0.05, 0.12)


# ================================================================= ambience: the wind at the pole, the hum of space
pole = [(0, SHOT["answer"]), (SHOT["dark"], DUR)]
pole_on = gate(N, pole, smooth=0.05)
amb.x += pan_st(filt(brown(N, 1), "lowpass", 220), -0.2) * 0.55 * pole_on                       # the wind, low
amb.x += pan_st(filt(white(N, 2), "highpass", 6500) * 0.02 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.17 * tt)), 0.3) * pole_on
space_on = gate(N, [(SHOT["answer"], SHOT["dark"])], smooth=0.05)
amb.x += pan_st(filt(brown(N, 3), "lowpass", 110), 0.0) * 0.7 * space_on                       # the hum of space
amb.x += pan_st(filt(white(N, 4), "highpass", 7200) * 0.02 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.21 * tt)), -0.3) * space_on

# ================================================================= hook: he winds the clock (frame 1), proud on "hours"
bed.add(pan_st(ratchet(c["hours"] - 0.1, 14.0, 20.0, 5, edges=True, f=5600.0), 0.35), 0.0, db(G["tick"]))   # the knob (top)
bed.add(pan_st(glint(6400, 0.09, 6), 0.35), c["hours_end"] + 0.02, db(G["glint"] + 2))                    # ting! (top)
# hook_b: the camera pulls back over the pole (low), the wind rises
sfx.add(pan_st(low_whoosh(0.5, 7), 0.0), SHOT["hook_b"] - 0.15, db(G["whoosh"] + 2))
bed.add(pan_st(top_only(L.whoosh(1.0, 3000, 8000, 8, 0.5), 5600.0), -0.3), SHOT["hook_b"], db(G["wind"]))
# years: the display turns over to 42 YEARS (its clacks above the voice band under "Forty-two"), the full clack after "years."
bed.add(pan_st(flap_clack(5, 10, edges=True), 0.3), c["flip42"], db(G["flap"]))
# the flash-forward: a whoosh in, a burst of the alarm (the payoff, unexplained), a soft thud out
sfx.add(pan_st(whoosh(0.22, 400, 3200, 12, 0.9), 0.0), c["ff"] - 0.06, db(G["ff"]))
sfx.add(pan_st(alarm_ring(0.42, 13), 0.2), c["ff"] + 0.03, db(G["ffring"]))
sfx.add(pan_st(filt(kick(0.9), "lowpass", 240), 0.0), c["ff"] + 0.5, db(G["thud"] - 6))

# ================================================================= answer: space; the planet topples onto its pillow
bed.add(pan_st(top_only(L.whoosh(0.6, 3000, 9000, 20, 0.5), 5600.0), 0.0), SHOT["answer"], db(G["wind"] - 2))
bed.add(pan_st(snore(0.6, 21, 52.0), -0.2), SHOT["answer"] + 0.15, db(G["snore"]))                        # it snores (low)
sfx.add(pan_st(creak(0.55, 22, 60, 120, (380, 760, 1400)), 0.2), c["tip"] - 0.05, db(G["slide"] - 6))      # it starts to go
sfx.add(pan_st(fade(slide_whistle(0.28, 1500, 520), 0.005, 0.04), 0.3), c["lying_end"] + 0.03, db(G["slide"]))   # whoooa (the gap)
sfx.add(pan_st(pillow_thump(23), 0.0), c["flop"], db(G["thud"]))                                          # FWUMP (low, on the word)
for _th in (c["flop"] + 0.02,):                                                                          # the hitstop (CAMERA["hit"]):
    sfx.add(pan_st(filt(kick(0.9), "lowpass", 260), 0.0), _th, db(-17))                                  # kept under the voice band
    bed.add(pan_st(top_only(snap(24), 5000.0), 0.0), _th, db(-24))
bwomp(sfx, c["side_end"] + 0.02, m=31, gain=G["bwomp"])                                                   # the planet's blat (after SIDE)

# ================================================================= orbit / pole / halftrip: it rolls round the Sun
sfx.add(pan_st(whoosh(0.3, 300, 2600, 30, 0.9), 0.4), SHOT["orbit"] - 0.24, db(G["whoosh"]))
sfx.add(pan_st(rolling(END["halftrip"] - SHOT["orbit"], 31), 0.0), SHOT["orbit"] + 0.1, db(G["roll"]))  # the big ball rolls (low)
bed.add(pan_st(top_only(riser(c["away_end"] - c["pole"] + 0.1, 32, 500, 3000), 5200.0), 0.2), c["pole"] - 0.1, db(G["dusk"]))
sfx.add(pan_st(filt(whoosh(0.9, 90, 300, 33, 0.6), "lowpass", 280), -0.2), c["turns"] - 0.1, db(G["dusk"]))   # the dark sweeps (low)
bed.add(pan_st(top_only(key_click(34), 4800.0), 0.3), c["away_end"] + 0.0, db(G["click"]))               # the lantern clicks on (top)
bed.add(pan_st(top_only(riser(c["trip1_end"] - c["half1"] + 0.2, 35, 600, 2600), 5200.0), -0.2), c["half1"] - 0.1, db(G["dusk"] - 2))
sfx.add(pan_st(ding(81, 0.14, 36), 0.2), c["trip1_end"] + 0.05, db(G["ding"]))                           # ding: half a lap (the gap)

# ================================================================= trip: the lap counter races to 84
sfx.add(pan_st(whoosh(0.3, 260, 2800, 40, 0.9), -0.4), SHOT["trip"] - 0.24, db(G["whoosh"]))
bed.add(pan_st(ratchet(c["lap_end"] - c["one"], 10.0, 34.0, 41, edges=True, f=6000.0), 0.3), c["one"], db(G["tick"]))
sfx.add(pan_st(filt(whoosh(0.5, 120, 600, 42, 0.8), "lowpass", 320), 0.4), c["cut_84"] - 0.08, db(G["whoosh"] + 1))   # the jump in (low)
bed.add(pan_st(top_only(glint(7000, 0.1, 43), 5600.0), 0.0), c["lap_end"], db(G["glint"] + 3))          # 84 lands (top)
sfx.add(pan_st(ding(84, 0.16, 44), 0.0), c["years2_end"] + 0.04, db(G["ding"] + 1))                      # ding (the gap)
# half: the two halves; the night half lights up
pops([SHOT["half"] + 0.06], bed, db(G["pop"]), seed=50)
bed.add(pan_st(top_only(glint(5600, 0.12, 51), 5200.0), 0.3), c["night_on"], db(G["glint"]))
sfx.add(pan_st(filt(whoosh(0.6, 80, 260, 52, 0.6), "lowpass", 240), 0.3), c["night_on"] - 0.05, db(G["dusk"] + 1))

# ================================================================= dark: the last of the Sun sinks; CLICK: lights out
sfx.add(pan_st(fade(slide_whistle(0.32, 900, 260), 0.005, 0.04), -0.3), c["that_end"] + 0.04, db(G["sink"]))   # it sinks (the gap)
bed.add(pan_st(top_only(key_click(60), 4800.0), 0.0), c["click"], db(G["click"] + 4))                    # CLICK (top, on the word)
sfx.add(pan_st(filt(kick(0.9), "lowpass", 200), 0.0), c["click"], db(G["thud"] - 4))                     # the dark lands (low)
bed.add(pan_st(top_only(key_click(61), 4800.0), 0.3), c["click"] + 0.16, db(G["click"] + 1))             # the lantern (top)

# ================================================================= night: asleep, snoring; the year card
sfx.add(pan_st(whoosh(0.3, 300, 2600, 70, 0.9), 0.5), SHOT["night"] - 0.24, db(G["whoosh"]))
for k, ts in enumerate(np.arange(SHOT["night"] + 0.15, END["night"] - 0.3, 1.15)):
    bed.add(pan_st(snore(0.62, 71 + k, 56.0), 0.15), float(ts), db(G["snore"]))                          # in and out (low)

# ================================================================= lapse: the years race; the year slams on 2049; then silence
bed.add(pan_st(ratchet(c["y2049"] - c["lapse0"], 16.0, 70.0, 80, edges=True, f=6200.0), 0.2), c["lapse0"], db(G["lapse"]))
bed.add(pan_st(top_only(riser(c["y2049"] - c["lapse0"], 81, 400, 3200), 5200.0), -0.2), c["lapse0"], db(G["lapse"] + 1))
sfx.add(pan_st(filt(whoosh(c["y2049"] - c["lapse0"], 70, 300, 82, 0.6), "lowpass", 280), 0.0), c["lapse0"], db(G["roll"]))
for k, ts in enumerate(np.arange(SHOT["lapse"] + 0.1, c["fortynine_end"] - 0.2, 0.42)):
    bed.add(pan_st(snore(0.3, 83 + k, 60.0 + 4 * k), 0.15), float(ts), db(G["snore"] - 2))               # fast-forward snores (low)
sfx.add(pan_st(filt(kick(1.0), "lowpass", 230), 0.0), c["y2049"], db(G["slam"]))                         # 2049 slams in (low)
bed.add(pan_st(top_only(glint(6600, 0.1, 84), 5600.0), 0.0), c["y2049"] + 0.02, db(G["glint"] + 3))
# full silence from the end of "forty-nine" to the bell: the room tone goes too
_quiet = (c["fortynine_end"] + 0.02, c["ring"] - 0.005)

# ================================================================= ring: the first ray; the bell (the biggest hit of the Short)
bed.add(pan_st(top_only(glint(7400, 0.12, 90), 5600.0), -0.3), c["peek"], db(G["glint"] + 2))             # the first ray (top)
sfx.add(pan_st(alarm_ring(END["ring"] - c["ring"] + 0.04, 91), 0.15), c["ring"], db(G["ring"]))
_th = c["ring"] + 0.02                                                                                    # the hitstop
sfx.add(pan_st(filt(snap(92), "highpass", 1800), 0.0), _th, db(-19))
sfx.add(pan_st(filt(filt(kick(0.9), "highpass", 300), "lowpass", 950), 0.0), _th + 0.004, db(-16))
sfx.add(cymbal(93, 0.45), _th + 0.01, db(-30))

# ================================================================= button: he jerks upright; Morning... (creak) Grandpa. (sting)
sfx.add(pan_st(filt(kick(0.8), "lowpass", 300), 0.0), c["slap"], db(G["clunk"]))                        # the bell stops: clunk
sfx.add(pan_st(boing(0.32, 140.0, 100), 0.0), c["slap"] + 0.03, db(G["clunk"] - 2))
sfx.add(pan_st(knuckle_crack(101, n=3, spread=0.09, f=1100.0), 0.2), c["morning_end"] + 0.12, db(G["creak"]))   # old bones (the gap)
sfx.add(pan_st(fade(slide(mtof(62), mtof(55), 0.42, vib=0.0, top=2400), 0.004, 0.05), 0.0), c["grandpa_end"] + 0.02, db(G["sting"]))   # the sting (after the word)

# ================================================================= score: the loop grid, sections on bar lines
BPM, BEAT, BARS = fit_loop(DUR, lo=96, hi=120, want=104)
BAR = 4 * BEAT
print(f"loop score: {BARS} bars at {BPM:.1f} BPM (beat {BEAT:.3f} s): {BARS} x 4 x {BEAT:.4f} = {BARS * BAR:.3f} s against {DUR:.3f}")
b_mech = bar_at(c["so"], BEAT)                 # the mechanism section starts on the bar line nearest "So"
b_night = bar_at(SHOT["night"], BEAT)          # the lullaby
HOOK = ["F", "Dm", "Bb", "C"]
SPACE = ["Dm", "Bb", "F", "C"]
groove(mus, 0.0, b_mech, BPM, HOOK, gain=-5, seed=10, kick_on=False, cutoff=1300)                        # sleepy and bouncy
groove(mus, b_mech, b_night, BPM, SPACE, gain=-7, seed=12, cutoff=1300, sixteen=True)                    # the planet rolls
drone(mus, b_night, c["fortynine_end"], [53, 60, 65, 69], cutoff=700, gain=-28, seed=14, swell=0.5)      # the long night
# his motif: a music-box lullaby over the night and the years racing (the music bus, kept low)
LULL = [(0, 77), (1, 81), (2, 84), (3, 81), (4, 79), (5, 77), (6, 76), (7, 72)]
tp, i = b_night, 0
while tp < c["fortynine_end"] - 0.15:
    m = LULL[i % len(LULL)][1]
    mus.add(pan_st(music_box(mtof(m), 0.9, 300 + i), 0.25 * (-1) ** i), tp, db(-27))
    tp += BEAT if tp < SHOT["lapse"] else BEAT / 2           # the years race: the lullaby runs at double speed
    i += 1
# the last beat leads back into bar 1: two music-box pickup notes (the hook's groove comes in again on frame 1)
for i, m in enumerate((72, 76)):
    tp = DUR - BEAT + i * BEAT / 2
    sfx.add(pan_st(fade(music_box(mtof(m), 0.6, 400 + i)[: int((DUR - tp - 0.01) * SR)], 0.002, 0.03), 0.2), tp, db(G["pick"]))
silence(mus, [(0.0, c["night"] + 0.05),                         # the groove enters after "Your" (the first word clean)
              (c["flip42"] - 0.03, SHOT["answer"] + 0.1),      # Forty-two YEARS (the first laugh)
              (c["side"] - 0.05, SHOT["orbit"] + 0.05),        # on its SIDE: the flop, the blat
              (c["dark"] - 0.04, c["its"] + 0.1),              # DARK: lights out
              (c["fortynine_end"] + 0.02, DUR)])               # full silence before the bell; the bell; Morning... Grandpa.
# the full silence: the room tone and every bed out too
for bus in (amb, bed):
    silence(bus, [_quiet])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"music": -13, "sfx": -12.0}, duck={"music": 0.78})
