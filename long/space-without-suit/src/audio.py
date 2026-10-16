"""What If You Went to Space WITHOUT a Suit? (Second by Second) (long-form): sound design, score and mix, cue-locked to
timeline.json.

Usage: python3 audio.py <work_dir>
Reads timeline.json + voice.wav; writes mix.wav (48 kHz stereo, -14 LUFS, <= -1 dBTP) and stems/.
Everything is synthesized (sfxkit atoms); the only recorded sound is the narration.

The score has ONE theme, a little phrase that climbs and hangs (G C D G | F...): it wants to come down to E and C and
does not, the way he hangs in the airlock with no air. A music box states it in the hook over the roaring air; then
SPACE TAKES THE SOUND AWAY: on "and so is the sound" everything stops (the score, the room, the alarm) and only his
heartbeat is left, and the airlock's room tone does not come back until his sister hits REPRESS. Between, the score
carries the story: a curious marimba for the thermos, bubbling pizzicato for the spit, glassy and thin while the oxygen
leaves, nothing at lights out, an urgent pulse with drums for his sister's run, an old upright piano for 1960 and 1966,
a slow heartbeat drone for the edge, near silence and three soft bells for Soyuz 11. After REPRESS the air roars back,
the room returns, and the theme comes back warm on the piano; on the final image it finally resolves (F E D C).
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


def word_end(word, after=0.0):
    return next(w["end"] for w in WORDS if w["word"] == word and w["start"] >= after - 0.01)


BPM = 112
BEAT = 60.0 / BPM
T0 = c["now"]
on_beat = lambda t: T0 + round((t - T0) / BEAT) * BEAT  # noqa: E731

# ---------------------------------------------------------------- the theme
RISE = [(67, 1), (72, 1), (74, 1), (79, 1)]           # G C D G: climbing
HELD = RISE + [(77, 5)]                                # ...and the F it hangs on
RESOLVE = RISE + [(77, 2), (76, 2), (74, 1), (72, 6)]  # F falls to E, D, C: home


def inst(name, f, ln, seed):
    if name == "box":
        return music_box(f, max(1.4, ln), seed)
    if name == "marimba":
        return marimba(f, 0.9, seed)
    if name == "pizz":
        return pizz(f, 0.5, seed)
    if name == "piano":
        return piano(f, max(0.9, ln), seed)
    if name == "glass":
        n = int(max(0.6, ln) * SR)
        e = np.minimum(1, ar(n) / 0.12) * np.exp(-ar(n) / max(0.6, ln * 0.7))
        return fade(np.sin(2 * np.pi * f * ar(n)) * e + 0.3 * np.sin(4 * np.pi * f * ar(n)) * e ** 2, 0.002, 0.15)
    raise ValueError(name)


def theme(t0, notes, bpm=96, name="box", gain=-16.0, tr=0, pan=0.0, upto=None, seed=0, bus=None):
    bus = bus or mus
    beat = 60.0 / bpm
    t = t0
    for k, (m, d) in enumerate(notes):
        if upto is not None and t >= upto:
            break
        ln = d * beat + 0.4
        if upto is not None:
            ln = min(ln, upto - t + 0.05)
        bus.add(inst(name, mtof(m + tr), ln, seed + k), t, db(gain), pan=pan)
        t += d * beat
    return t


# ---------------------------------------------------------------- sounds made for this film
def air_roar(dur, seed=0, out=True):
    """air rushing through a hatch: a broadband roar that swells and thins (out) or swells in (back)"""
    n = int(dur * SR)
    t = ar(n)
    x = filt(white(n, seed), "bandpass", [120, 3200]) + 0.6 * filt(brown(n, seed + 1), "lowpass", 400)
    env = (np.minimum(1, t / 0.15) * np.exp(-t / (dur * 0.45))) if out else (np.minimum(1, t / (dur * 0.35)) * np.minimum(1, (dur - t) / (dur * 0.4)))
    flutter = 1 + 0.25 * np.sin(2 * np.pi * 7 * t + 3 * np.sin(2 * np.pi * 0.9 * t))
    return fade(x * env * flutter / (np.abs(x).max() + 1e-9), 0.01, 0.2)


def station_hum(n, seed=0):
    """the station's fans and pumps: a low steady hum with a little flutter (lives under 500 Hz)"""
    t = ar(n)
    y = 0.6 * np.sin(2 * np.pi * 60 * t) + 0.3 * np.sin(2 * np.pi * 120 * t + 0.4) + 0.2 * np.sin(2 * np.pi * 181 * t)
    y += 1.4 * filt(brown(n, seed), "lowpass", 380)
    y *= 1 + 0.08 * np.sin(2 * np.pi * 0.31 * t)
    return pan_st(y / (np.abs(y).max() + 1e-9), 0)


def body_hum(n, seed=0):
    t = ar(n)
    y = filt(brown(n, seed), "lowpass", 160) + 0.3 * np.sin(2 * np.pi * 48 * t)
    return pan_st(y / (np.abs(y).max() + 1e-9), 0)


def big_exhale(dur=0.9, seed=0):
    n = int(dur * SR)
    t = ar(n)
    rush = filt(white(n, seed), "bandpass", [260, 2400]) * np.exp(-t / (dur * 0.45)) * np.minimum(1, t / 0.03)
    lips = thump(0.1, 200, 80, 0.03, seed) * 0.5
    y = rush
    y[: len(lips)] += lips
    return fade(y / (np.abs(y).max() + 1e-9), 0.002, 0.08)


def inhale(dur=0.9, seed=0, edges=False):
    n = int(dur * SR)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.4 * np.linspace(0.6, 1, n)
    y = filt(white(n, seed), "bandpass", [600, 3600] if not edges else [5200, 9000]) * env
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def bubbles(dur, seed=0, rate=14, f0=500, f1=1500):
    """a run of small bubble pops (spit boiling): little rising blips at random times"""
    n = int(dur * SR)
    y = np.zeros(n)
    rng = np.random.default_rng(seed)
    t = 0.0
    while t < dur - 0.08:
        b = blip(f0 + (f1 - f0) * rng.random(), f1 * (1.3 + 0.4 * rng.random()), 0.05, int(rng.integers(1e6)), 0.012)
        i = int(t * SR)
        y[i:i + len(b)] += b[: n - i] * (0.4 + 0.6 * rng.random())
        t += rng.exponential(1.0 / rate)
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def tape_rewind(dur=0.6, seed=0):
    n = int(dur * SR)
    t = ar(n)
    f = 900 + 2600 * t / dur
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + filt(white(n, seed), "bandpass", [1500, 6000]) * 0.6
    y *= np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.08)
    return fade(y / (np.abs(y).max() + 1e-9), 0.005, 0.03)


def valve_squeak(dur=0.6, seed=0):
    n = int(dur * SR)
    t = ar(n)
    f = 700 + 300 * np.sin(2 * np.pi * 3 * t)
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + filt(white(n, seed), "bandpass", [800, 2400]) * 0.4
    y = filt(y, "lowpass", 3000) * np.sin(np.pi * t / dur)
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def monitor_beep(f=1500.0):
    n = int(0.09 * SR)
    t = ar(n)
    y = np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.004) * np.minimum(1, (0.09 - t) / 0.02)
    return y * 0.7


def soft_tick(seed=0, g=1.0):
    n = int(0.03 * SR)
    y = filt(white(n, seed), "bandpass", [2500, 7000]) * np.exp(-ar(n) / 0.004)
    return y / (np.abs(y).max() + 1e-9) * g


def fan_whine(dur, seed=0, f0=380, f1=1400):
    n = int(dur * SR)
    t = ar(n)
    f = f0 + (f1 - f0) * np.minimum(1, t / (dur * 0.5))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + 0.4 * filt(white(n, seed), "bandpass", [2000, 5000])
    y *= np.minimum(1, t / 0.2) * np.minimum(1, (dur - t) / 0.15)
    return fade(y / (np.abs(y).max() + 1e-9), 0.01, 0.05)


def thwip(seed=0):
    """an elastic snap back (the skin)"""
    n = int(0.18 * SR)
    t = ar(n)
    f = 1400 * np.exp(-t / 0.04) + 300
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)
    return fade(y, 0.001, 0.02)


# ================================================================= ambience (one bed per world; the vacuum is silent)
gone = c["gone"] + 0.6
slam = c["slam"]
AIRLOCK = ["hook", "out", "promise", "want", "intact", "silence", "nosound", "cold", "thermos", "spit", "boil", "turn", "ball", "swell",
           "pop", "leb1", "edge", "rush", "wake", "apart", "puffy", "selfie"]
air_spans = [(a, b) for a, b in shots(*[s for s in AIRLOCK if s in SHOT])]
# the station's hum: only while there is air (before the air is gone, and after REPRESS); the corridor always has air
hum_on = gate(N, [(a, min(b, c["mute"])) for a, b in air_spans if a < c["mute"]] + [(max(a, slam + 0.4), b) for a, b in air_spans if b > slam + 0.4]
              + shots("sister", "depress", "repress"))
amb.x += station_hum(N, 3) * hum_on * 0.9
amb.x += body_hum(N, 5) * gate(N, shots("lungs", "oxygen", "brain", "lights", "gut", "heart")) * 0.8
# old film: a projector whirr under 1960 and 1966 and the 1960s lab
amb.x += pan_st(projector(N, 7), 0) * gate(N, shots("kitt1", "kitt2", "kitt3", "leb2", "leb3", "leb4") + [(c["sixties"] - 0.1, END["edge"])]) * 0.5
# Pip's bedroom at night: crickets far off
crickets(SHOT["button"], c["ours"] + 0.6, bed, db(-38), seed=4)
# the alarm: a siren through the corridor (there is air there), and in the airlock until the sound goes
for t0_, t1_ in [(0, c["mute"])] + shots("sister") + [(SHOT["repress"], slam + 0.2)]:
    k = 0
    t = t0_
    while t < t1_ - 0.3:
        sfx.add(pan_st(siren(min(1.2, t1_ - t), seed=k), 0.3), t, db(-42 if t0_ == 0 else -37))
        t += 1.25
        k += 1

# ================================================================= the hook: the air roaring out, the held breath, WRONG, the breath out
sfx.add(pan_st(air_roar(3.0, 1, out=True), 0.4), 0.0, db(-16))                         # the burst as the hatch opens
_rum = filt(air_roar(max(2.0, gone - 2.4), 2, out=True), "lowpass", 450)                 # then a low rumble while it empties
sfx.add(pan_st(_rum / (np.abs(_rum).max() + 1e-9), 0.4), 2.4, db(-27))
sfx.add(pan_st(whoosh(0.4, 300, 2400, 20, 0.9), 0), 0.0, db(-16))
sfx.add(pan_st(thump(0.5, 160, 50, 0.15, 21), 0), word_end("WRONG.") + 0.03, db(-14))
sfx.add(pan_st(big_exhale(1.6, 22), 0.2), c["breatheOut"] + 0.05, db(-17))
sfx.add(pan_st(whoosh(0.8, 2400, 400, 23, 0.7), 0.6), c["allofit"], db(-24))
sfx.add(pan_st(bell(1318, 1.0, 0.5), 0), word_end("now.", c["now"]) + 0.04, db(-24))
# the lungs: a stretching creak, then a tear
sfx.add(pan_st(creak(1.0, 24, 60, 140), 0), SHOT["lungs"] + 0.1, db(-31))
sfx.add(pan_st(crack(0.25, 25), 0), word_end("lungs.") + 0.03, db(-20))
# the promise: the REPRESS button glows
sfx.add(pan_st(chime(784.0, 1.0), -0.3), c["rescue"] + 0.2, db(-27))
# Pip's messages: phone pings
for k, t in enumerate((SHOT["want"] + 0.35, word_end("helmet.", c["want"]) + 0.05, word_end("goldfish,\"", c["want"]) + 0.03)):
    sfx.add(pan_st(blip(1500 + 300 * k, 2200, 0.08, 30 + k, 0.03), 0.3), t, db(-26))
# the rewind: a tape squeal, a click on DEPRESS, the camera "?"
sfx.add(pan_st(tape_rewind(0.55, 31), 0), SHOT["depress"] - 0.05, db(-22))
sfx.add(pan_st(thump(0.15, 600, 200, 0.03, 32), -0.2), word_end("DEPRESS...") + 0.03, db(-16))
sfx.add(pan_st(shutter(), 0.3), word_end("picture.\"") + 0.05, db(-20))
sfx.add(pan_st(tape_rewind(0.35, 33)[::-1].copy(), 0), END["depress"] - 0.3, db(-24))

# ================================================================= ACT 1
# the movies: a cartoon balloon inflating, BOOM, the MYTH stamp
sfx.add(balloon_inflate(0.8, 34), c["s1"] - 0.1, db(-29))
sfx.add(pan_st(thunder(1.0, 35), 0), c["noExplode"] - 0.15, db(-16))
sfx.add(pan_st(thump(0.3, 220, 80, 0.06, 36), 0), c["movies"], db(-17))
sfx.add(pan_st(scratch(0.3, 37), 0), c["noExplode"] + 0.3, db(-26))
# his hands patting his chest: little thuds
for k in range(4):
    sfx.add(pan_st(thump(0.08, 300, 140, 0.02, 40 + k), -0.2), c["skin"] + 0.1 + 0.18 * k, db(-25))
# the silence: the air's last gasp, then NOTHING. Only his heartbeat, until REPRESS brings the room back.
mute = c["mute"]
for t in np.arange(mute - 0.2, c["freezing"] + 0.1, 60 / 64):
    bed.add(pan_st(heartbeat(int(t * 10) + 1, 1.0), 0), t, db(-14))
# the cold: a little shiver; the heat arrows bouncing back: soft pings
sfx.add(shiver(0.5, 41), c["freezing"] + 0.4, db(-26))
for k in range(5):
    sfx.add(pan_st(blip(900, 1300, 0.05, 50 + k, 0.02), -0.5 + 0.25 * k), c["heatAway"] + 0.1 + 0.18 * k, db(-30))
# the thermos: a pop, a lid clink
sfx.add(pan_st(cork_pop(51, 520.0), 0.4), c["thermosW"] + 0.35, db(-19))
sfx.add(pan_st(bell(2637, 0.4, 0.15), 0.4), c["thermosW"] + 0.55, db(-30))
# the spit: his tongue out (a wet little blip), then it boils: bubbles, louder in the gaps
sfx.add(pan_st(blip(400, 260, 0.1, 52, 0.03), 0), c["touch"] + 0.25, db(-25))
sfx.add(pan_st(bubbles(1.8, 53, 18), 0.1), c["boilingW"] + 0.15, db(-21))
sfx.add(pan_st(bubbles(7.0, 54, 10, 400, 1200), 0.1), SHOT["boil"], db(-31))
sfx.add(pan_st(blip(2400, 1800, 0.1, 55, 0.03), 0.3), c["bodyT"] + 0.75, db(-26))           # 37 C lands
sfx.add(pan_st(bubbles(1.0, 56, 16, 900, 2200), -0.3), c["tearsW"] + 0.1, db(-26))          # his tears
sfx.add(pan_st(filt(white(int(0.9 * SR), 57), "highpass", 5200) * np.exp(-ar(int(0.9 * SR)) / 0.3), 0.2), c["frost"] + 0.1, db(-27))   # frost
# the oxygen pours out: the window opens (a whoosh), the dive, beads leaving: bloops
sfx.add(pan_st(whoosh(0.7, 300, 2000, 58), 0), c["inhere"] - 0.2, db(-20))
sfx.add(pan_st(bloop(300, 90, 0.4), 0), c["lungsEmpty"] - 0.1, db(-22))
for k in range(10):
    bed.add(pan_st(bloop(500 + 40 * (k % 4), 900, 0.12), -0.6 + 0.12 * k), c["pours"] + 0.1 + 0.35 * k, db(-31))
# the blood climbs to the brain; lights out: a power-down and a heavy thud, then black with a heartbeat
sfx.add(pan_st(slide_whistle(1.4, 700, 160), 0), c["toBrain"] - 0.2, db(-30))
for k, w in enumerate(("Fourteen...", "fifteen...")):
    sfx.add(pan_st(soft_tick(60 + k, 1.0), 0), word_end(w) + 0.05, db(-20))
sfx.add(pan_st(slide_whistle(0.9, 900, 60), 0), c["lightsOut"] + 0.25, db(-22))
sfx.add(pan_st(thump(1.2, 90, 30, 0.5, 61), 0), c["dark"], db(-12))
for t in np.arange(c["dark"] + 0.3, SHOT["turn"] + 3.5, 60 / 52):
    bed.add(pan_st(heartbeat(int(t * 10) + 5, 1.0), 0), t, db(-16))

# ================================================================= ACT 2
sfx.add(pan_st(bell(1046, 0.8, 0.4), -0.4), c["newClock"] + 0.1, db(-27))
# Ball: its fans whine flat out; nothing; a sad little wah
sfx.add(pan_st(fan_whine(2.4, 62), 0.3), c["ballW"] + 0.6, db(-27))
sfx.add(pan_st(blip(600, 300, 0.25, 63, 0.08), 0.3), c["justBall"] - 0.1, db(-26))
sfx.add(pan_st(wahwah(64), 0.2), word_end("ball.", c["aBall"]) + 0.1, db(-24))
# the sister: the alarm in the corridor (above), her launch: a whoosh; the polaroid snaps in
sfx.add(pan_st(whoosh(0.9, 200, 2400, 65, 0.8), 0), c["commander"] + 0.5, db(-18))
sfx.add(pan_st(shutter(), -0.3), c["four"] - 0.2, db(-24))
# the swelling: creaks of stretching; the chip bag crinkles as it puffs; the POP is silent (no air): nothing at all
sfx.add(pan_st(creak(2.0, 66, 50, 120), 0), word_end("swelling...", c["gasW"]) + 0.05, db(-32))
sfx.add(pan_st(crumple(0.6, 67), 0.3), c["chipsW"] - 0.6, db(-27))
# the pinch: the skin snaps back
sfx.add(pan_st(thwip(68), 0), word_end("go.", c["letgo"]) + 0.03, db(-17))
sfx.add(pan_st(chime(1318.5, 0.9), 0), word_end("together.", c["together1"]) + 0.05, db(-28))
# 1960: the balloon creaks; the altimeter ticks; the glove fails (a hiss), the hand swells (a stretch); +3 hours: a
# clock running
sfx.add(pan_st(creak(1.6, 69, 40, 90), -0.3), SHOT["kitt1"] + 0.3, db(-27))
for k, t in enumerate(np.arange(c["k1960"] + 0.2, c["miles"] + 0.7, 0.12)):
    sfx.add(soft_tick(100 + k, 0.8), t, db(-33), pan=0.4)
sfx.add(pan_st(gas_hiss(0.9, 70), 0.3), c["leaked"] + 0.2, db(-24))
sfx.add(balloon_inflate(1.2, 71), c["leaked"] + 1.0, db(-24))
sfx.add(pan_st(thump(0.25, 260, 90, 0.05, 72), 0), c["twice"] + 0.25, db(-19))
for k, t in enumerate(np.arange(c["threeH"], c["normal"], 0.08)):
    sfx.add(soft_tick(200 + k, 0.7), t, db(-34), pan=-0.4)
sfx.add(pan_st(chime(1046.5, 1.0), 0.3), c["normal"] + 0.4, db(-27))
# 1966: the hose pops (a hiss), the timer counts to 14, the bubbles, the valve, FINE; taste: a dull bwomp
sfx.add(pan_st(gas_hiss(1.4, 73), -0.2), c["hose"] + 0.05, db(-20))
for k in range(15):
    sfx.add(pan_st(soft_tick(300 + k, 1.0), 0.4), c["awake"] + k * (c["fourteen"] + 0.3 - c["awake"]) / 14, db(-28))
sfx.add(pan_st(bubbles(1.6, 74, 12), 0), c["bubble"] + 0.1, db(-22))
sfx.add(pan_st(valve_squeak(0.9, 75), 0.4), c["pumped"] + 0.1, db(-27))
sfx.add(pan_st(air_roar(1.6, 76, out=False), 0), c["pumped"] + 0.4, db(-27))
bwomp(mus, word_end("days.", c["fourDays"]) + 0.08, m=36, gain=-15)
# the gut: a low rumble; "Yes. That gas.": a tiny squeak
sfx.add(stomach_growl(1.3, 77), c["gutW"], db(-22))
sfx.add(pan_st(squeak(0.12, 900, 600), 0.2), word_end("gas.", c["thatGas"]) + 0.12, db(-24))
# the heart: the monitor's beeps, slowing with the trace (118 -> 38 beats a minute)
bt = c["beating"] - 0.2
while bt < END["heart"] - 0.1:
    rate = 118 - 80 * min(1, max(0, (bt - c["beating"] + 0.3) / (END["heart"] + 0.6 - c["beating"])))
    bed.add(pan_st(monitor_beep(1500), 0.4), bt, db(-29))
    bed.add(pan_st(heartbeat(int(bt * 10) + 7, 1.0), 0), bt, db(-17))
    bt += 60 / rate

# ================================================================= ACT 3
# the edge: her palm slaps the window (a dull thump through glass)
sfx.add(pan_st(thump(0.2, 300, 120, 0.04, 80), -0.5), c["sisWin"] + 1.0, db(-23))
# the dogs: a warm chord on ALL LIVED, a low thud on MOST DIDN'T; HIM's marker ticks along
mus.add(pad([mtof(60), mtof(64), mtof(67), mtof(72)], 2.4, 0.15, 1600, 81), c["lived"] + 0.05, db(-17))
sfx.add(pan_st(thump(0.5, 110, 40, 0.15, 82), 0), c["didnt"] + 0.35, db(-17))
for k, t in enumerate(np.arange(SHOT["dogs"] + 0.4, END["dogs"], 0.5)):
    sfx.add(soft_tick(400 + k, 0.8), t, db(-31), pan=0.2)
# Soyuz 11: a thin hiss from the valve; three soft bells for the three stars
sfx.add(pan_st(gas_hiss(1.6, 83), 0.4), c["valve"] + 0.2, db(-30))
for i in range(3):
    sfx.add(pan_st(bell([1046.5, 1318.5, 1568.0][i], 2.2, 1.0), -0.4 + 0.4 * i), c["cosmo"] + 0.4 + 0.5 * i, db(-26))
# REPRESS: the slam; then the air ROARS back, the room returns; his gasp
sfx.add(pan_st(thump(0.6, 140, 45, 0.18, 84), 0), slam, db(-8))
sfx.add(pan_st(crack(0.12, 85, 0.03, 1200), 0), slam, db(-18))
sfx.add(pan_st(thump(0.3, 400, 120, 0.06, 86), 0.4), slam + 0.6, db(-14))                # the hatch shuts
sfx.add(pan_st(air_roar(max(1.2, c["s90"] - 0.25 - (slam + 0.2)), 87, out=False), 0), slam + 0.2, db(-12))
sfx.add(pan_st(inhale(1.0, 88), 0), c["s90"] - 1.15, db(-15))                              # his first breath, in the gap
sfx.add(pan_st(inhale(0.45, 89, edges=True), 0), word_end("Air.", c["s90"]) + 0.03, db(-22))
sfx.add(pan_st(blip(900, 1800, 0.12, 89, 0.04), 0.5), c["wakes"] + 0.3, db(-24))          # Ball, happy
sfx.add(pan_st(chime(1568.0, 1.0), 0.5), c["wakes"] + 0.45, db(-28))
# the palm: air arrows (a soft whoosh down), the grown-up lands (a thud), the push back (a rising whoosh)
sfx.add(pan_st(whoosh(0.6, 2400, 500, 90), 0), c["pressing"] - 0.1, db(-24))
sfx.add(pan_st(thump(0.3, 200, 70, 0.08, 91), 0), c["grownup"] + 0.15, db(-17))
sfx.add(pan_st(whoosh(0.6, 500, 2400, 92), 0), c["pushBack"] - 0.1, db(-24))
# apart: the arrows vanish (a reverse whoosh) and come back with a shimmer
sfx.add(pan_st(whoosh(0.5, 2600, 300, 93), 0), c["apart"] + 0.25, db(-25))
for k in range(6):
    sfx.add(pan_st(bell(2093 + 196 * k, 0.5, 0.25), -0.5 + 0.2 * k), c["stops"] + 0.6 + 0.08 * k, db(-31))
# puffy: a little slide down on "pride"
sfx.add(pan_st(slide_whistle(0.6, 900, 500), 0.2), word_end("longer.", c["pride"]) + 0.08, db(-25))
# the selfie: helmets click on, the shutter and the flash, Pip's reply pings
sfx.add(pan_st(thump(0.1, 500, 250, 0.02, 94), -0.2), c["helmetOn"] + 0.2, db(-23))
sfx.add(pan_st(shutter(), 0.4), c["helmetOn"] + 0.7, db(-17))
sfx.add(pan_st(blip(1500, 2400, 0.09, 95, 0.03), 0.4), c["bowlW"] - 0.1, db(-22))
sfx.add(pan_st(blip(1800, 2700, 0.09, 96, 0.03), 0.4), c["bowlW"] + 0.25, db(-23))
# the bowl: the goldfish's bubbles, the push into the water
for k in range(5):
    bed.add(pan_st(bloop(700 + 50 * k, 1200, 0.1), 0.3), SHOT["button"] + 0.6 + 0.9 * k, db(-33))
sfx.add(pan_st(whoosh(1.4, 200, 1600, 97, 0.6), 0), c["weAll"] + 0.1, db(-24))
# the final image: a shimmer as the sun comes over the edge
for k, t in enumerate(np.arange(c["final"] + 0.3, DUR - 0.5, 0.4)):
    sfx.add(pan_st(bell(4186 + 330 * (k % 4), 0.4, 0.2), -0.5 + 0.25 * (k % 5)), t, db(-38))
# the subscribe cue: pop, click, bell (quiet: it sits under the words)
sfx.add(pan_st(blip(700, 1500, 0.09, 71, 0.03), 0), c["sub_in"], db(-26))
sfx.add(pan_st(snap(3), 0), c["sub_tap"], db(-22))
sfx.add(pan_st(bell(1760, 1.2, 0.5), 0), c["sub_tap"] + 0.08, db(-28))

# ================================================================= round 2: events in the gaps, a whoosh on every cut, the new pictures
# the hook: an alarm bweep after "No suit.", a punch on 15 SECONDS, a puff as the cheeks fill on "Hold your breath"
sfx.add(pan_st(blip(1200, 900, 0.18, 300, 0.05), 0.3), word_end("suit.") + 0.04, db(-19))
sfx.add(pan_st(thump(0.35, 220, 70, 0.08, 301), 0), word_end("seconds.", c["fifteenW"]) + 0.03, db(-14))
sfx.add(pan_st(bell(1568, 0.5, 0.2), 0.2), word_end("seconds.", c["fifteenW"]) + 0.05, db(-22))
sfx.add(pan_st(balloon_inflate(0.35, 302), 0), c["holdW"] - 0.05, db(-24))
# the breath out: the badge pops; the cloud leaves (a soft whoosh into the hatch)
sfx.add(pan_st(blip(800, 1400, 0.09, 303, 0.03), 0.6), c["breatheOut"] + 0.35, db(-20))
sfx.add(pan_st(whoosh(0.6, 1800, 300, 304, 0.7), 0.7), word_end("him...", c["breatheOut"]) + 0.05, db(-20))
# the lungs: the cut in (an x-ray hum swell), the tear louder
sfx.add(pan_st(blip(300, 700, 0.15, 305, 0.05), 0), SHOT["lungs"] + 0.05, db(-20))
# the want: the card pops; the rewind's end; the promise: a sweep across the airlock, the cut to the panel
sfx.add(pan_st(blip(600, 1200, 0.1, 306, 0.03), 0.4), SHOT["want"] + 0.08, db(-19))
sfx.add(pan_st(whoosh(0.5, 400, 2200, 307), 0), SHOT["promise"] + 0.05, db(-20))
sfx.add(pan_st(thump(0.2, 400, 160, 0.04, 308), -0.3), c["rescue"] - 0.82, db(-19))
# intact and the silence: his pats louder; the last of the air leaving; the sound draining away
for k in range(4):
    sfx.add(pan_st(thump(0.08, 300, 140, 0.02, 310 + k), -0.2), c["skin"] + 0.1 + 0.18 * k, db(-19))
sfx.add(pan_st(whoosh(0.9, 900, 120, 314, 0.6), 0.7), c["gone"] + 0.4, db(-19))
sfx.add(pan_st(slide_whistle(0.5, 1200, 300), 0.4), word_end("sound.", c["soundGone"]) + 0.02, db(-24))
# the cold: the thermometer pops in; the cut out to him whole
sfx.add(pan_st(blip(700, 1100, 0.09, 315, 0.03), 0.5), c["freezing"] + 0.25, db(-20))
sfx.add(pan_st(whoosh(0.4, 500, 1800, 316), 0), c["empty"] - 0.5, db(-21))
# the bell jar: the pump's chuffs while the air goes, the water bursting into a boil
for k, tk in enumerate(np.arange(c["noair"] + 0.1, c["bodyT"] - 0.2, 0.22)):
    bed.add(pan_st(filt(white(int(0.08 * SR), 320 + k), "bandpass", [300, 1400]) * np.exp(-ar(int(0.08 * SR)) / 0.03), 0.6), tk, db(-27))
sfx.add(pan_st(bubbles(1.4, 330, 22, 300, 900), 0), c["bodyT"] - 0.3, db(-22))
sfx.add(pan_st(bloop(260, 120, 0.3), 0), word_end("temperature.", c["bodyT"]) + 0.03, db(-17))
# the tongue cut, the eyes cut, the cold cut
sfx.add(pan_st(whoosh(0.3, 600, 2000, 331), 0), word_end("temperature.", c["bodyT"]) + 0.5, db(-24))
sfx.add(pan_st(blip(1800, 1200, 0.08, 332, 0.02), 0), c["tearsW"] - 0.1, db(-22))
# the brain: the camera rides up (a rising tone), the numbers stamp
sfx.add(pan_st(riser(1.6, 333, 200, 900), 0), SHOT["brain"] + 0.3, db(-28))
for k, w in enumerate(("Fourteen...", "fifteen...")):
    sfx.add(pan_st(thump(0.25, 260, 90, 0.05, 334 + k), 0), c["s14"] + 0.02 if k == 0 else c["s15"] + 0.02, db(-18))
# the different clock: a big tick-tock
for k in range(5):
    sfx.add(pan_st(filt(white(int(0.03 * SR), 340 + k), "bandpass", [1800, 5000]) * np.exp(-ar(int(0.03 * SR)) / 0.006), 0.2 * (-1) ** k), c["newClock"] + 0.3 + 0.5 * k, db(-17))
# Ball's fans: the cut to the fans, PUSH! and NOTHING
sfx.add(pan_st(whoosh(0.35, 500, 2000, 345), 0), c["fans"] - 0.1, db(-21))
sfx.add(pan_st(whoosh(0.4, 600, 1600, 346), -0.4), c["pushAg"] + 0.05, db(-21))
sfx.add(pan_st(thump(0.2, 200, 90, 0.05, 347), 0.4), c["pushAg"] + 0.3, db(-20))
# the hangar in 1966: a door clank, the cut to the window, the hose close
sfx.add(pan_st(thump(0.3, 300, 100, 0.08, 350), -0.5), SHOT["leb2"] + 0.2, db(-20))
sfx.add(pan_st(whoosh(0.35, 500, 1800, 351), 0), c["leblanc"] + 0.85, db(-23))
# Soyuz: the cut to the valve (a clunk), the cut to the stars (a low swell)
sfx.add(pan_st(thump(0.25, 220, 80, 0.06, 352), 0.3), c["home"] - 0.2, db(-19))
sfx.add(pan_st(bloop(180, 60, 0.6), 0), c["cosmo"] - 0.1, db(-22))
# wake: the cut to the two of them; his sister's hand on his shoulder
sfx.add(pan_st(thump(0.12, 380, 180, 0.03, 353), -0.4), c["wakes"] + 0.9, db(-20))
# the palm: the arrows land (pops), the cut close on the grown-up
for k in range(7):
    sfx.add(pan_st(blip(900 + 60 * k, 700, 0.05, 354 + k, 0.015), -0.6 + 0.2 * k), c["pressing"] + 0.35 + 0.06 * k, db(-25))
sfx.add(pan_st(whoosh(0.3, 700, 2000, 362), 0), c["grownup"] - 0.2, db(-23))
# puffy: a squeaky inflate on his face; her eyebrow: a ding
sfx.add(pan_st(balloon_inflate(0.3, 363), 0), SHOT["puffy"] + 0.1, db(-23))
sfx.add(pan_st(bell(2637, 0.3, 0.1), 0.4), c["pride"] + 0.05, db(-21))

# a whoosh into every cut (ending on the cut), quiet, in the pause before the phrase
for i_, s_ in enumerate(TL["shots"][1:]):
    if s_["id"] in ("black", "nosound", "pop", "rush", "final", "sub"):
        continue
    sfx.add(pan_st(whoosh(0.22, 500 + 120 * (i_ % 5), 2600, 400 + i_, 0.8), 0.2 * (-1) ** i_), s_["start"] - 0.2, db(-27))

# ================================================================= the clock: a tick on every new second it shows
for e in C["clock"]:
    if len(e) >= 7 and e[5] > e[4]:
        t0_, n0, n1, dt = e[0], e[4], e[5], e[6]
        for j in range(1, int(n1 - n0) + 1):
            t = t0_ + dt * j / (n1 - n0)
            if t < DUR - 0.2:
                sfx.add(soft_tick(1000 + int(t * 10), 0.9), t, db(-30), pan=-0.6)
    else:
        sfx.add(pan_st(blip(700, 1200, 0.07, int(e[0] * 13), 0.02), -0.6), e[0] + 0.05, db(-27))

# ================================================================= the score, section by section
# 0: the hook: the theme on a music box over the roar, hanging on its F; cut by "WRONG."
theme(0.25, HELD, bpm=120, name="box", gain=-18, upto=c["dont"] - 0.05, seed=1)
# 1: the breath out and the promise: a held pad, then a ticking pulse
mus.add(pad([mtof(60), mtof(67), mtof(74)], 4.0, 0.6, 1100, 2), c["breatheOut"], db(-21))
groove(mus, on_beat(c["tear"] + 0.6), c["want"] - 0.1, BPM, ["C", "Am", "F", "G"], gain=-9, seed=3, kick_on=True, snaps=False, arp=False, half=True, cutoff=900)
# 2: the want and the rewind: playful pizzicato (the theme, bouncing)
theme(c["want"] + 0.3, RISE + [(77, 2), (79, 1), (77, 1)], bpm=150, name="pizz", gain=-16, upto=c["pressed"] - 0.1, seed=4)
groove(mus, on_beat(c["pressed"]), SHOT["explode"] - 0.1, 132, ["F", "C", "G", "C"], gain=-12, seed=5, kick_on=False, snaps=True, arp=True, padv=False)
# 3: the movies and "you don't explode": a bright marimba; then the silence (everything stops)
groove(mus, on_beat(SHOT["intact"]), c["soundGone"] + 0.25, BPM, ["C", "G", "Am", "F"], gain=-8, seed=6, kick_on=True, snaps=True, arp=True)
# 4: the cold and the thermos: a curious marimba, half time
groove(mus, c["notyet"] + 0.2, SHOT["spit"], BPM, ["Am", "F", "C", "G"], gain=-10, seed=7, kick_on=False, snaps=False, arp=True, half=True, cutoff=1100)
# 5: the spit: bubbling pizzicato
groove(mus, c["touch"] + 0.4, SHOT["oxygen"] - 0.1, 140, ["Dm", "Am", "Dm", "E"], gain=-12, seed=8, kick_on=False, snaps=False, arp=True, padv=False, sixteen=True)
# 6: the oxygen leaving: the theme glassy and thin over a cold drone; then nothing at lights out
theme(c["s10"] + 0.3, HELD, bpm=72, name="glass", gain=-22, upto=c["lightsOut"], seed=9)
drone(mus, c["s10"], c["lightsOut"] + 0.3, [45, 52, 57], cutoff=420, gain=-21, seed=10)
# 7: out cold, the different clock: a low urgent drone; Ball's comedy (pizz, stopped for the punch)
drone(mus, c["newClock"] - 0.2, SHOT["ball"] + 0.4, [41, 48, 53], cutoff=380, gain=-21, seed=11)
theme(c["ballW"] + 0.2, RISE, bpm=170, name="pizz", gain=-17, upto=c["justBall"] - 0.15, seed=12)
# 8: his sister's run: urgent drums and a driving pulse (the race), through the swelling
groove(mus, on_beat(c["commander"] + 0.4), SHOT["pinch"] - 0.1, 128, ["Am", "F", "G", "Em"], gain=-10, seed=13, kick_on=True, snaps=True, arp=True, sixteen=True, cutoff=1500)
# 9: the pinch: a light pulse
groove(mus, on_beat(SHOT["pinch"] + 0.3), SHOT["kitt1"] - 0.1, BPM, ["C", "F", "C", "G"], gain=-12, seed=14, kick_on=False, snaps=True, arp=False)
# 10: 1960 and 1966: the theme on an old upright piano, then the same with darker chords
theme(SHOT["kitt1"] + 0.3, HELD, bpm=84, name="piano", gain=-15, upto=SHOT["kitt3"] + 0.2, seed=15)
theme(SHOT["kitt3"] + 0.3, RISE + [(76, 2), (74, 2)], bpm=110, name="piano", gain=-17, upto=SHOT["leb1"], seed=16)
theme(SHOT["leb2"] + 0.2, [(64, 1), (67, 1), (72, 1), (77, 4)], bpm=80, name="piano", gain=-16, upto=c["bubble"], seed=17)
mus.add(pad([mtof(60), mtof(64), mtof(67), mtof(72)], 2.6, 0.2, 1500, 18), c["fine"] + 0.1, db(-17))
# 11: the gut: a sneaky low pizzicato walk
groove(mus, on_beat(SHOT["gut"] + 0.2), c["yes"] - 0.15, 104, ["Dm", "Dm", "A", "Dm"], gain=-12, seed=19, kick_on=False, snaps=False, arp=False, padv=False)
# 12: the heart and the edge: a slow, dark drone; the theme low and slow
drone(mus, SHOT["heart"], SHOT["dogs"], [38, 45, 50, 53], cutoff=420, gain=-20, seed=20)
theme(SHOT["heart"] + 0.4, HELD, bpm=54, name="glass", gain=-23, tr=-12, upto=SHOT["dogs"], seed=21)
# 13: the dogs: a rising clock pulse (the marker creeping toward ninety)
groove(mus, on_beat(SHOT["dogs"] + 0.2), SHOT["soyuz"] - 0.1, 140, ["Am", "Am", "Dm", "E"], gain=-11, seed=22, kick_on=True, snaps=False, arp=False, padv=True, cutoff=900)
# 14: Soyuz 11: a quiet, high pad (the bells above)
mus.add(pad([mtof(57), mtof(64), mtof(69), mtof(76)], END["soyuz"] - SHOT["soyuz"], 1.5, 1300, 23), SHOT["soyuz"] + 0.2, db(-19))
# 15: REPRESS: a drum roll into the slam; silence for the air rushing back (above)
mus.add(pan_st(drumroll(max(0.6, slam - SHOT["repress"] - 0.1), 24), 0), SHOT["repress"] + 0.05, db(-15))
# 16: he wakes: the theme warm on piano, still hanging
theme(c["wakes"] + 0.3, HELD, bpm=88, name="piano", gain=-15, upto=SHOT["palm"] + 0.3, seed=25)
# 17: the palm and "apart": a gentle pulse, then a wide warm pad on "holding you together"
groove(mus, on_beat(SHOT["palm"] + 0.2), c["apart"] - 0.1, 96, ["F", "C", "Am", "G"], gain=-12, seed=26, kick_on=False, snaps=False, arp=True, half=True, cutoff=1200)
mus.add(pad([mtof(53), mtof(60), mtof(65), mtof(69), mtof(72)], 4.6, 0.8, 1500, 27), c["stops"] + 0.4, db(-15))
# 18: puffy and the selfie: playful pizzicato, the theme bouncing
theme(SHOT["puffy"] + 0.2, RISE + [(77, 2)], bpm=150, name="pizz", gain=-16, upto=c["pride"] - 0.1, seed=28)
groove(mus, on_beat(SHOT["selfie"]), SHOT["button"] - 0.05, 120, ["C", "F", "C", "G"], gain=-10, seed=29, kick_on=True, snaps=True, arp=True)
# 19: Pip's room: the theme on a music box, hanging; on the final image it resolves at last (F E D C)
theme(SHOT["button"] + 0.3, HELD, bpm=96, name="box", gain=-15, upto=c["final"] - 0.1, seed=30)
theme(c["final"], [(77, 1), (76, 1), (74, 1), (72, 5)], bpm=90, name="box", gain=-14, seed=31)
theme(c["final"], [(77, 1), (76, 1), (74, 1), (72, 5)], bpm=90, name="piano", gain=-19, tr=-12, seed=32)
mus.add(pad([mtof(48), mtof(55), mtof(60), mtof(64)], DUR - c["final"], 1.2, 1300, 33), c["final"], db(-17))

# ================================================================= payoffs: a build into each, a hit on it (the every-second rule)
PAY = sorted((t_, k_) for k_, t_ in C.items() if isinstance(t_, (int, float)) and k_.startswith(("pay_", "big_")))
held = []
for t_, k_ in PAY:
    big_ = k_.startswith("big_")
    r_ = 2.2 if big_ else 0.8
    sfx.add(pan_st(riser(r_, seed=int(t_ * 7), f0=180 if big_ else 500, f1=1800 if big_ else 2600), 0), t_ - r_, db(-31 if big_ else -36))
    if big_:
        held.append((t_ - 0.5, t_ - 0.02))
    else:   # the bright little reward lands just after the word it sits on, never on it
        on_w = [w for w in WORDS if w["start"] - 0.05 <= t_ <= w["end"]]
        tb = on_w[0]["end"] + 0.03 if on_w else t_
        sfx.add(pan_st(bell(1568 + 196 * (int(t_) % 3), 0.45, 0.22), 0.2), tb, db(-34))
# the music drops out: before each big payoff (held breath), for the punchlines, and the vacuum's silence; the score
# never plays while the air is gone? It does (the score is ours, not his) except for the silence beat itself
punch = [(c["dont"] - 0.05, c["dont"] + 0.35), (c["soundGone"] + 0.25, c["freezing"] - 0.05), (c["thermosW"] - 0.1, c["thermosW"] + 0.5),
         (c["lightsOut"] + 0.2, c["newClock"] - 0.2), (c["justBall"] - 0.15, c["hall"] - 0.1), (c["pop"] - 0.05, c["pinch"] - 0.1),
         (c["yes"] - 0.15, SHOT["heart"]), (c["didnt"] + 0.2, SHOT["soyuz"] + 0.2), (slam - 0.02, c["wakes"] + 0.25),
         (c["pride"] - 0.1, SHOT["selfie"])]
silence(mus, held + punch)
for t_, k_ in PAY:   # the hits go in AFTER the silences, so they are never muted
    if k_.startswith("big_") and k_ not in ("big_mute", "big_pop", "big_dark", "big_soyuz", "big_final"):
        mus.add(pan_st(thump(0.8, 90, 38, 0.3, seed=int(t_)), 0), t_, db(-17))
# the vacuum: after the sound goes, the effects bus is silent in the beat itself (only the heartbeat, on the bed bus),
# and the chip bag's pop is a true silence
silence(sfx, [(c["soundGone"] + 0.2, c["freezing"] - 0.1), (c["pop"] - 0.02, c["pop"] + 0.8)])
silence(amb, [(c["pop"] - 0.02, c["pop"] + 0.8)])

# ================================================================= voice + mix
master(WORK, sfx, bed, mus, amb, levels={"amb": -20, "music": -9})
