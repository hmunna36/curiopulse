"""Edit timeline for the Can You Wag Your Fingers Like WIPERS? 🌧️ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Besides the cues it writes `wag` into timeline.json: the fingers', wipers' and legs' motion, one value per frame, so the
picture (scenes.js) and the sound (audio.py) move on the same clock.
"""
import math
import sys

import numpy as np

from timeline_lib import FPS, PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # the tight rules (5 Nov 2026): nothing after the last line, the loop within 1.0 s

# ---- the aligner put a few words early after tightened pauses: move them onto the take's own speech bursts
def put(i, s, e):
    T.ws[i] = T.words[i]["start"] = round(s, 3)
    T.we[i] = T.words[i]["end"] = round(e, 3)


def onto_bursts(phrase, t0, t1, s=0):
    """the words of `phrase` onto the speech bursts between t0 and t1: one burst each, or the first word takes the first
    burst and the last word the rest (a word with a stop inside it splits into two bursts)"""
    i, n = T.find(phrase, s), len(phrase.split())
    b = T.bursts(t0, t1)
    if not b:
        print(f"onto_bursts {phrase!r}: no burst, left as it was")
        return
    if len(b) < n:   # fewer bursts than words: share the span by the words' letters
        ws_ = phrase.split(); L = [max(1, len(w)) for w in ws_]; a, e = b[0][0], b[-1][1]; acc = a
        for k in range(n):
            d = (e - a) * L[k] / sum(L)
            put(i + k, acc - (0.04 if k == 0 else 0), acc + d); acc += d
        return
    for k in range(n - 1):
        put(i + k, b[k][0] - 0.04, b[k][1])
    put(i + n - 1, b[n - 1][0] - 0.04, b[-1][1])


_i = T.find("IN, the other")
onto_bursts("the other", T.we[_i] + 0.08, T.ws[_i + 3] - 0.02)
_i = T.find("The ref gives up")
onto_bursts("The ref", T.we[_i - 1] + 0.05, T.ws[_i + 2] - 0.02)
_i = T.find("and the twins")
onto_bursts("and the", T.we[_i - 1] + 0.05, T.ws[_i + 2] - 0.03)
onto_bursts("They flip too", T.we[T.find("by side") + 1] + 0.12, T.we[T.find("too!")] + 0.15)

SHOTS = [
    ("hook", None),                 # POV over his shoulder: two pointing fists wag like the wipers behind them, faster, FLIP
    ("answer", "Flipped into"),     # whip to the front (camera on the dashboard): mirror-wagging, faces pop: clingy twins
    ("slow", "Slow down"),          # high, closer on the hands: slow wipers again, IN / OUT tags (the 8-13 s rule)
    ("ref", "your brain's"),        # a window opens on his head: the brain is a referee with a whistle
    ("refup", "Faster? The ref"),   # into the window: the referee's arms flail faster, it gives up (white flag)
    ("copy", "and the twins"),      # extreme close on the hands: they snap into the mirror and high-five on COPY
    ("pair", "Two PEOPLE"),         # whip outside to the van's back step: he and a stranger swing their legs, alternating
    ("sync", "They flip too"),      # their boots fall into step (a splash), they look at each other
    ("button", "Now try to"),       # whip back to the POV: mirror-wagging, he tries to flip it back... and it loops
]
special = {}

CHUNKS = [
    "Wag your fingers / like wipers.",
    "Same way...",
    "now FASTER!",
    "Flipped into / a mirror?",
    "Your hands are",
    "clingy TWINS.",
    "Slow down.",
    "One swings IN,",
    "the other OUT...",
    "your brain's / refereeing.",
    "Faster?",
    "The ref / gives up...",
    "and the twins",
    "COPY.",
    "Two PEOPLE / swinging their legs",
    "side by side?",
    "They flip too!",
    "Now try to / flip it BACK.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"wipers": C, "faster": O, "mirror": Y, "twins": P["P"], "in": G, "out": R, "refereeing": Y, "ref": Y,
         "copy": Y, "people": Y, "flip": O, "back": Y}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values())

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
st = {s_["id"]: s_["start"] for s_ in shots}
en = {s_["id"]: s_["end"] for s_ in shots}

W, E, find = T.W, T.E, T.find
i_f2 = find("Faster? The ref")
cues = {
    "now": W("now FASTER"), "faster": W("FASTER", 0, find("now FASTER")), "faster_end": E("now FASTER", 1),
    "flipped": W("Flipped"), "mirror": W("mirror?"), "hands": W("Your hands are"), "clingy": W("clingy"),
    "twins": W("TWINS."), "twins_end": E("TWINS."),
    "slow": W("Slow down"), "in": W("IN,"), "out": W("OUT..."), "brain": W("brain's"), "referee": W("refereeing."),
    "faster2": T.ws[i_f2], "theref": W("The ref"), "gives": W("gives up"), "up_end": E("gives up", 1),
    "andthe": W("and the twins"), "twins2": W("twins", 0, find("and the twins")), "copy": W("COPY."), "copy_end": E("COPY."),
    "two": W("Two PEOPLE"), "people": W("PEOPLE"), "legs": W("legs"), "side": W("side by side"),
    "they": W("They flip"), "flip2": W("flip too"), "too": W("too!"), "too_end": E("too!"),
    "nowtry": W("Now try to"), "back": W("BACK."), "back_end": E("BACK."),
}
DUR = T.duration
cues["flip"] = cues["faster_end"] - 0.12              # the fingers flip into a mirror at the top of "FASTER!"
cues["faces"] = cues["clingy"] - 0.05                  # the twins' faces pop on "clingy"
cues["heart"] = cues["twins_end"] + 0.03              # the heart between them lands just after "TWINS" (the hit after the word)
cues["window"] = cues["brain"] - 0.10                  # the window on his head opens on "brain's"
cues["flag"] = cues["gives"] + 0.05                    # the white flag goes up on "gives"
cues["flip3"] = cues["twins2"] - 0.05                  # the fingers snap into a mirror on "twins"
cues["five"] = cues["copy_end"] + 0.02                # the high-five touch just after "COPY."
cues["sync"] = cues["flip2"] - 0.02                    # the two pairs of legs fall into step on "flip"
cues["splash"] = cues["too_end"] + 0.03                # their boots kick up the water together (the pause after "too!")
cues["strain"] = cues["back"] - 0.25                   # he strains to flip it back
cues["settle"] = DUR - 0.62                            # it settles into frame 1's slow wipers (the loop)

# ---------------------------------------------------------------- the motion, one value per frame
N = int(round(DUR * FPS)) + 1
tt = np.arange(N) / FPS


def keys(ks, t):
    """piecewise-linear [[t, v], ...] (smoothstep between keys)"""
    ks = sorted(ks)
    if t <= ks[0][0]:
        return ks[0][1]
    for (a, va), (b, vb) in zip(ks, ks[1:]):
        if t <= b:
            u = (t - a) / max(1e-6, b - a)
            u = u * u * (3 - 2 * u)
            return va + (vb - va) * u
    return ks[-1][1]


c = cues
F0 = 0.85            # Hz: frame 1's slow wipers
# the fingers' wagging speed (Hz)
FK = [[0, F0], [c["now"] - 0.15, F0], [c["flip"], 2.6], [st["answer"], 2.6], [st["answer"] + 1.4, 1.9], [c["slow"] - 0.05, 1.8],
      [c["slow"] + 0.75, 0.55], [st["ref"], 0.6], [c["faster2"], 0.65], [c["gives"], 2.5], [st["copy"], 2.5], [en["copy"], 2.4],
      [st["button"], 2.5], [c["strain"], 2.3], [c["settle"], F0], [DUR, F0]]
fr = np.array([keys(FK, x) for x in tt])
ph = 0.6 + 2 * np.pi * np.concatenate([[0], np.cumsum((fr[1:] + fr[:-1]) / 2 / FPS)])
# the copy shot: the tips meet in the middle (mirror: the screen-right finger at its inward extreme) on the high-five
k5 = int(round(c["five"] * FPS))
a0 = int(round(st["copy"] * FPS)); a1 = int(round(en["copy"] * FPS))
want = -np.pi / 2           # sin = -1: the screen-right finger tips left (inward), its mirror twin tips right
off = (want - ph[k5]) % (2 * np.pi)
if off > np.pi:
    off -= 2 * np.pi
ph[a0:a1] += off
# the loop: the last frame lands on frame 1's phase (spread the error over the settle)
ks = int(round(c["settle"] * FPS))
err = ((ph[0] - ph[-1]) + np.pi) % (2 * np.pi) - np.pi
ramp = np.clip((np.arange(N) - ks) / max(1, N - 1 - ks), 0, 1)
ph = ph + err * (ramp * ramp * (3 - 2 * ramp))
# the relative phase: 0 = wipers (both tips the same way), pi = a mirror
PK = [[0, 0], [c["flip"] - 0.16, 0], [c["flip"] + 0.08, np.pi * 1.14], [c["flip"] + 0.2, np.pi], [c["slow"] + 0.15, np.pi], [c["slow"] + 0.85, 0],
      [c["flip3"] - 0.1, 0], [c["flip3"] + 0.1, np.pi * 1.14], [c["flip3"] + 0.22, np.pi], [st["pair"], np.pi], [c["strain"], np.pi], [c["back"] + 0.1, np.pi * 0.62],
      [c["back_end"] - 0.02, np.pi * 0.9], [c["settle"] + 0.1, np.pi * 0.85], [DUR - 0.08, 0], [DUR, 0]]
psi = np.array([keys(PK, x) for x in tt])
# critical wobble before each flip (the parallel pattern gets shaky just before it goes)
for t_f in (c["flip"], c["flip3"]):
    w = np.clip(1 - np.abs(tt - (t_f - 0.25)) / 0.3, 0, 1)
    psi += 0.45 * w * np.sin(tt * 23)
# amplitude (rad): smaller when fast
amp = np.clip(0.44 - 0.04 * (fr - F0), 0.33, 0.46)
# the wipers: their own sweep, in step with the fingers until the flip, then their own pace
FW = [[0, F0], [c["now"] - 0.15, F0], [c["flip"], 2.6], [st["button"] - 0.01, 2.6], [st["button"], 1.8], [c["settle"], F0], [DUR, F0]]
fw = np.array([keys(FW, x) for x in tt])
pw = 0.6 + 2 * np.pi * np.concatenate([[0], np.cumsum((fw[1:] + fw[:-1]) / 2 / FPS)])
errw = ((pw[0] - pw[-1]) + np.pi) % (2 * np.pi) - np.pi
pw = pw + errw * (ramp * ramp * (3 - 2 * ramp))
# the legs on the step: speed (Hz) and their relative phase (pi = alternating, 0 = in step)
LK = [[st["pair"], 1.0], [c["side"], 1.5], [c["sync"], 1.7], [DUR, 1.7]]
fl = np.array([keys(LK, x) for x in tt])
pl = 2 * np.pi * np.concatenate([[0], np.cumsum((fl[1:] + fl[:-1]) / 2 / FPS)])
CK = [[0, np.pi], [c["sync"] - 0.14, np.pi], [c["sync"] + 0.12, 0], [DUR, 0]]
chi = np.array([keys(CK, x) for x in tt])

r3 = lambda a: [round(float(x), 3) for x in a]
WAG = {"ph": r3(ph), "psi": r3(psi), "amp": r3(amp), "pw": r3(pw), "pl": r3(pl), "chi": r3(chi), "f": r3(fr)}


# sound events from the same motion (audio.py): the wipers' turnarounds, the fingers' swishes, the whistle, the legs
def crossings(p, t0, t1, at=0.0):
    """times in [t0, t1) where the phase p passes at + k*pi"""
    out = []
    for i in range(1, N):
        if tt[i] < t0 or tt[i - 1] >= t1:
            continue
        a, b = (p[i - 1] - at) / np.pi, (p[i] - at) / np.pi
        if math.floor(b) > math.floor(a):
            u = (math.floor(b) - a) / (b - a)
            out.append(round(float(tt[i - 1] + u / FPS), 3))
    return out


cues["wiper_turn"] = crossings(pw, 0, st["answer"]) + crossings(pw, st["button"], DUR)          # the blades turn around
cues["swish"] = crossings(ph, 0, st["pair"], at=0.0) + crossings(ph, st["button"], DUR, at=0.0)   # a fingertip passes the middle
cues["tweet"] = crossings(ph, c["referee"] - 0.35, c["gives"], at=np.pi / 2)                      # the ref's whistle, each turn
cues["kick"] = crossings(pl, st["pair"], st["button"], at=np.pi / 2)                              # a boot at the top of its swing

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "answer": 0.35, "slow": 0.25, "ref": 0.3, "refup": 0.5, "copy": 0.4, "pair": 0.3, "sync": 0.35,
             "button": 0.25},
    "whip": [[st["answer"], -1], [st["pair"], 1], [st["button"], -1]],
    "punch": [[c["twins"] - 0.02, 1.15, c["twins_end"] + 0.25], [c["copy"] - 0.03, 1.15]],
    "tilt": [[c["faster2"] + 0.05, c["up_end"], -3.5]],
    "hit": [[c["heart"], 4], [c["five"], 4]],
    "act": {"brow": [c["flipped"], c["in"], c["they"]]},
    "mood": [[0, "dusk"], [st["ref"], "storm"], [st["copy"], "warm"], [st["pair"], "dusk"], [c["sync"], "warm"], [st["button"], "dusk"]],
    "fg": {"answer": "bokeh-r", "refup": "bokeh-r", "pair": "grass-b", "sync": "grass-bl"},
    "air": {"hook": {"kind": "dust", "amount": 0.4}, "answer": "dust", "slow": "dust", "copy": "sparkle", "pair": "rain",
            "sync": "rain", "button": {"kind": "dust", "amount": 0.4}},
}
T.write(shots, caps, cues, camera=CAMERA, wag=WAG)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print(f'events: {len(cues["wiper_turn"])} wiper turns, {len(cues["swish"])} swishes, {len(cues["tweet"])} tweets, {len(cues["kick"])} kicks')
