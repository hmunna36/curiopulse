"""Edit timeline for the Why Do Wombats Poop CUBES? 🟫 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: he lifts the cube to his lips, the pill goes, and the
#                                      cut back to frame 1 (the loop)

W, E, ev, find = T.W, T.E, T.ev, T.find


# ---- v3's alignment, checked against the speech-band envelope (narration.md): the button's "So..." is spoken from
# 30.46 s (aligned 0.4 s late); "or" and "for" sat in the silence before their sounds.
def _move(i, a, b):
    T.ws[i] = T.words[i]["start"] = round(a, 3)
    T.we[i] = T.words[i]["end"] = round(b, 3)


iSo = find("So found a cute")
_on = T.first_loud(T.block("button")["start"])
if T.ws[iSo] - _on > 0.1:
    _move(iSo, _on - 0.02, max(T.we[iSo], _on + 0.4) if T.we[iSo] - _on < 0.3 else T.we[iSo])
# bursts (T.bursts) 23.64-23.96 "molds", 24.36-24.78 "or knives" (one burst), 25.13-25.18 "for", 25.25- "cubes";
# 8.35-8.61 "See those", 8.81 "two", 9.31 "stiff", 9.63 "stripes": T.retime needs one burst a word, so by hand
_i = find("molds or knives for cubes")
_move(_i + 1, 24.32, 24.45)
_move(_i + 2, 24.46, 24.86)
_move(_i + 3, 25.09, 25.19)
_i = find("they pull in")   # "they": 11.52-11.58 in the speech band (aligned from 11.42, in the silence after "squeeze,")
_move(_i, 11.47, 11.58)
_i = find("See those two stiff stripes")
for _k, (_a, _b) in enumerate([(8.30, 8.46), (8.47, 8.63), (8.77, 9.10), (9.16, 9.45), (9.52, 10.10)]):
    _move(_i + _k, _a, _b)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),       # golden hour on a mossy log in the Tasmanian bush, TIGHT on him: a little brown cube at his open
                          # lips, eyes shut in bliss (fudge!); "Don't": he freezes a cube's width from his teeth; "cube":
                          # he looks at it, cross-eyed; "wombat": a wombat rises behind the log beside him, chewing;
                          # "POOP.": a held beat, then his face drops and the cube falls on the log (flat: it does not roll)
    ("answer", None),     # the two-shot: the wombat's round rump toward him, his magnifier on it; the dotted circle and
                          # ROUND; the wombat glares over its shoulder; "Its GUT": the lens slides to its belly and goes
                          # x-ray (the gut coiled inside, the brown going square near the end); the camera pushes in
    ("gut", None),        # THE ONE PICTURE: through the lens into the gut, end-on: the wall's two stiff stripes; each
                          # squeeze they pull in first, the soft brown round in the middle gets four corners
    ("notes", None),      # a sandstone rock by a creek: the wombat on top leaves a cube; a note pops out of it: MINE.
    ("roll", None),       # he sets a round dough ball on the rock; it rolls off, bonks down and plops into the creek in
                          # the gap; "would roll off.": the cube sits, the wombat smug
    ("factory", None),    # a factory: a press stamps a cube on "molds", a blade chops a bar on "knives"; he has a hard hat
    ("belt", None),       # a wombat in a hard hat on the belt, munching: a cube a beat, a counter to 100; "salad": crunch
    ("button", None),     # back on the log: he spots a cube, looks left, right, picks it up, lifts it to his lips...
    ("loop", None),       # the last 0.45 s: the hook at negative time (frame 1 a moment earlier)
]
DUR = T.duration
iCorn1 = find("makes the corners") + 2
special = {
    "answer": W("And no") - 0.08,
    "gut": T.we[iCorn1] + 0.02,
    "notes": W("Why cubes") - 0.08,
    "roll": W("Scientists") - 0.08,
    "factory": W("Factories") - 0.08,
    "belt": W("Wombats Up") - 0.08,
    "button": T.ws[iSo] - 0.1,
    "loop": DUR - 0.45,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Don't eat / that cube",
    "you found!",
    "It's wombat / POOP.",
    "And no,",
    "its butt / isn't square.",
    "Its GUT / makes the corners.",
    "See those two / stiff stripes?",
    "Every / squeeze,",
    "they pull in / faster...",
    "and pinch / corners.",
    "Why cubes?",
    "Wombats leave / poop on rocks,",
    "like notes.",
    "Scientists / think",
    "round notes...",
    "would / roll off.",
    "Factories / need molds",
    "or knives / for cubes.",
    "Wombats?",
    "Up to / a hundred",
    "a day...",
    "from salad.",
    "So...",
    "found a cute / little cube",
    "on a log?",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# gold = the cube and its corners, violet = the poop (the joke), red = the square-butt myth, orange = the gut and its
# squeeze, pink = the stiff stripes (muscle), green = notes and salad, cyan = the round one that rolls, blue = factories
COLOR = {"cube": Y, "cubes": Y, "corners": Y, "pinch": Y, "poop": V, "square": R, "butt": R, "gut": O, "squeeze": O,
         "faster": O, "stiff": PK, "stripes": PK, "notes": G, "rocks": O, "round": C, "roll": C, "molds": B,
         "knives": B, "100": Y, "salad": G, "log": O}
DISPLAY = {"a hundred": ["100"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
sh = {s["id"]: s for s in shots}

iCube2 = find("little cube") + 1
iCubes1 = find("Why cubes") + 1
iCubes3 = find("for cubes") + 1
iWomb1 = find("Wombats leave")
iWomb2 = find("Wombats Up")
iNotes1 = find("like notes") + 1
iNotes2 = find("round notes") + 1
iCorn2 = find("pinch corners") + 1
iPoop1 = find("leave poop") + 1
iFound2 = find("found a cute")
cues = {
    # the hook
    "dont": W("Don't"), "eat": W("eat"), "cube": W("cube"), "found": W("found"), "found_end": E("found"),
    "its": W("It's wombat"), "wombat": W("wombat"), "wombat_end": E("wombat"), "poop": W("POOP"), "poop_end": E("POOP"),
    # the answer
    "and": W("And no"), "no": W("no"), "butt": W("butt"), "square": W("square"), "square_end": E("square"),
    "its2": W("Its GUT"), "gut": W("GUT"), "gut_end": E("GUT"), "makes": W("makes"), "corners1": T.ws[iCorn1],
    "corners1_end": T.we[iCorn1],
    # the gut
    "see": W("See"), "two": W("two"), "stiff": W("stiff"), "stripes": W("stripes"), "stripes_end": E("stripes"),
    "every": W("Every"), "squeeze": W("squeeze"), "squeeze_end": E("squeeze"), "they": W("they"), "pull": W("pull"),
    "faster": W("faster"), "faster_end": E("faster"), "pinch": W("pinch"), "corners2": T.ws[iCorn2],
    "corners2_end": T.we[iCorn2],
    # the notes
    "why": W("Why"), "cubes1": T.ws[iCubes1], "cubes1_end": T.we[iCubes1], "wombats1": T.ws[iWomb1], "leave": W("leave"),
    "poop1": T.ws[iPoop1], "rocks": W("rocks"), "rocks_end": E("rocks"), "like": W("like notes"),
    "notes1": T.ws[iNotes1], "notes1_end": T.we[iNotes1],
    # the roll
    "scientists": W("Scientists"), "think": W("think"), "round": W("round"), "notes2": T.ws[iNotes2],
    "notes2_end": T.we[iNotes2], "would": W("would"), "roll": W("roll"), "off": W("off"), "off_end": E("off"),
    # the factory
    "factories": W("Factories"), "need": W("need"), "molds": W("molds"), "molds_end": E("molds"), "or": W("or knives"),
    "knives": W("knives"), "knives_end": E("knives"), "cubes3": T.ws[iCubes3], "cubes3_end": T.we[iCubes3],
    # the belt
    "wombats2": T.ws[iWomb2], "wombats2_end": T.we[iWomb2], "up": W("Up to"), "hundred": W("hundred"),
    "day": W("day"), "day_end": E("day"), "from": W("from salad"), "salad": W("salad"), "salad_end": E("salad"),
    # the button
    "so": T.ws[iSo], "so_end": T.we[iSo], "found2": T.ws[iFound2], "cute": W("cute"), "little": W("little"),
    "cube2": T.ws[iCube2], "cube2_end": T.we[iCube2], "log": W("log"), "log_end": E("log"),
}
c = cues
# the squeezes in the gut: each one a contraction the picture draws and the sound thumps
squeezes = [c["squeeze"] + 0.05, c["pull"] - 0.02, c["faster"] + 0.2, c["pinch"] - 0.04]
# the cubes that plop out behind the wombat on the belt, from "Up to" to the end of "day...": a steady beat
plops, tp = [], c["up"] - 0.05
while tp < c["day_end"] + 0.1:
    plops.append(round(tp, 3))
    tp += 0.24
cues.update({
    "squeezes": [round(x, 3) for x in squeezes],
    "plops": plops,
    "freeze": c["dont"] + 0.02,                          # his jaw stops a cube's width from his teeth
    "rise": c["its"] - 0.12,                             # the wombat's head comes up behind the log
    "react": c["poop"] + 0.3,                            # the hold (9 frames), then his face drops
    "drop": c["poop_end"] + 0.02,                        # he lets go of the cube...
    "thunk": c["poop_end"] + 0.27,                       # ...it lands flat on his lap and stays (no roll)
    "glare": c["butt"] - 0.05,                           # the wombat looks back over its shoulder at the magnifier
    "ring": c["square_end"] + 0.02,                      # the dotted circle round its rump, ROUND (in the pause)
    "lens_move": c["its2"] - 0.1,                        # the magnifier slides from the rump to the belly
    "xray": c["gut"] - 0.08,                             # the lens goes x-ray
    "dive": c["corners1"] + 0.1,                         # the camera starts into the lens
    "label_stiff": c["stiff"] - 0.05,                    # STIFF on both stripes
    "cube_done": c["corners2"] + 0.25,                   # the four corners are sharp: a little ding
    "plop1": c["poop1"] + 0.12,                          # the wombat leaves a cube on the rock
    "note": c["notes1"] - 0.02,                          # the note pops out of the cube: MINE.
    "place": c["scientists"] + 0.05,                     # he sets the round dough ball on the rock
    "go": c["round"] - 0.05,                             # it starts to roll
    "edge": c["notes2"] + 0.12,                          # over the edge
    "bonk1": c["notes2_end"] + 0.04,                     # bonk on the rock face
    "splash": c["notes2_end"] + 0.27,                    # plop into the creek (in the gap; done before "would")
    "smug": c["off"],                                    # the wombat's smug squint
    "press": c["molds_end"] + 0.02,                      # CLANK: the press stamps a cube (in the pause after "molds")
    "chop": c["knives_end"] + 0.01,                      # CHOP: the blade (in the pause after "knives")
    "hat": c["wombats2"] - 0.05,                         # the wombat in its hard hat on the belt
    "count100": c["day_end"],                            # the counter reaches 100
    "crunch": c["salad_end"] + 0.02,                     # the lettuce crunch, in the pause after "salad."
    "look_l": c["found2"] - 0.05, "look_r": c["cute"],    # his shifty look left, then right
    "pick": c["cube2"] - 0.1,                            # he picks the cube up off the log
    "lift": c["log"],                                    # ...and lifts it toward his lips (frame 1)
})
assert c["dont"] < c["cube"] < c["wombat"] < c["poop"] < c["and"] < c["butt"] < c["square"] < c["gut"] < c["corners1"]
assert c["corners1"] < c["see"] < c["stiff"] < c["squeeze"] < c["pull"] < c["faster"] < c["pinch"] < c["corners2"]
assert c["corners2"] < c["why"] < c["cubes1"] < c["wombats1"] < c["poop1"] < c["rocks"] < c["notes1"]
assert c["notes1"] < c["scientists"] < c["round"] < c["notes2"] < c["would"] < c["roll"] < c["off"]
assert c["off"] < c["factories"] < c["molds"] < c["knives"] < c["cubes3"] < c["wombats2"] < c["up"] < c["hundred"]
assert c["hundred"] < c["day"] < c["salad"] < c["so"] < c["found2"] < c["cute"] < c["cube2"] < c["log"]
assert sh["gut"]["start"] < c["see"] and c["splash"] > c["notes2_end"] and c["splash"] < c["would"]
assert c["lift"] < sh["loop"]["start"]
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026). publish.json "subscribe" says the arm; T.write sets the
# pill's cues for the pill arm by itself and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the hook: the claim, told to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print(f'So... at {T.ws[iSo]:.2f}-{T.we[iSo]:.2f}; or {T.ws[find("or knives")]:.2f}; for {T.ws[find("for cubes")]:.2f}; See {T.ws[find("See those")]:.2f}')
