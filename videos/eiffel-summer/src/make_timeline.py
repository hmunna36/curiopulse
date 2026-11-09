"""Edit timeline for the The EIFFEL TOWER Gets Taller in Summer 🗼 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop. The tight
#                                      rules (5 Nov 2026): 25-30 s, the last line runs straight into the first and nothing
#                                      comes after it (qa.py: at most 1.0 s), so the loop comes before the thumb does.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),            # CU, eye level, him LEFT: on the Trocadero terrace he holds his phone up beside his head like a
                               # ruler (screen to us: a ruler app, "15 cm"); the tower behind on the right (frame 0: phone up)
    ("grow", "The Eiffel"),    # OTS from behind his right shoulder, LOW angle: his phone lined up on the tower's tip; on "that
                               # much" the tip grows up the phone's length (a bracket: UP TO ~15 cm); the sun flares on "summer"
    ("answer", "Hot iron"),    # WIDE from a Paris rooftop, HIGH angle (zinc roofs, chimney pots, a pigeon): the tower in blazing
                               # sun STRETCHES like a waking cat (happy closed eyes, a creak) (whip in: the turn to the answer)
    ("cat", "like a"),         # MEDIUM, eye level: the cafe terrace; a ginger cat on the table stretches in its sunbeam, him
                               # seated beside it, fanning himself with the menu; the tiny tower behind stretches in sync
    ("pieces", "Eighteen"),    # MEDIUM-CU, HIGH angle: him clinging to the lattice high up (the city far below); the counter
                               # 18,038 PIECES; the bar by his hand heats and slides out; he plucks a hair (ow) and holds it to
                               # the gap: a hair longer (whip in: into the mechanism)
    ("stack", "Stack it"),     # MEDIUM, LOW angle on the top third: glowing slivers stream up the lattice and stack on the tip
                               # into a phone-shaped block; his phone thunks down on top on "PHONE" (+15 cm)
    ("lean", "And on"),        # MEDIUM-WIDE, eye level: the Sun on the right; the sunny side glows orange and stretches, the
                               # shady side stays blue (whip in: into the weirdest fact)
    ("away", "so the"),        # WIDE, HIGH angle, a time-lapse: the Sun sweeps across the sky, the top leans AWAY from it and
                               # draws a circle (x100); him on the very top, sliding with it
    ("button", "Honestly"),    # MEDIUM -> the hook's CU: back on the terrace, sunburnt; he leans away from the Sun too, then
                               # holds his phone up as a sunshade: the pose and framing of frame 1 (the loop; whip in)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Hold up / your phone.",
    "The Eiffel / Tower",
    "can grow / that much",
    "in summer.",
    "Hot iron",
    "stretches...",
    "like a cat",
    "in a / sunbeam.",
    "Eighteen / thousand",
    "iron pieces,",
    "each one",
    "a hair / longer.",
    "Stack it / all up...",
    "one PHONE.",
    "And on / sunny days,",
    "the sunny side",
    "stretches / more,",
    "so the top",
    "leans AWAY",
    "from the Sun.",
    "Honestly?",
    "Same.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"phone": Y, "eiffel": O, "grow": G, "summer": O, "hot": R, "stretches": O, "cat": V, "sunbeam": Y,
         "eighteen": Y, "thousand": Y, "hair": V, "sunny": Y, "away": C, "sun": Y, "same": R}
DISPLAY = {"eighteen thousand": ["18,000"]}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_st = {s_["id"]: s_["start"] for s_ in shots}
_ln = find("And on sunny")
cues = {
    # hook + grow: the phone comes up, the tip grows on "that much", the Sun flares on "summer"
    "phone": W("phone"), "phone_end": E("phone"),
    "eiffel": W("Eiffel"), "grow": W("grow"), "that": W("that much"), "much": W("much"), "much_end": E("much"),
    "summer": W("summer"), "summer_end": E("summer"),
    # answer + cat: the tower stretches, then the cat
    "hot": W("Hot"), "iron": W("iron"), "stretches": W("stretches", 0, find("Hot iron")), "stretches_end": E("stretches", 0, find("Hot iron")),
    "like": W("like a"), "cat": W("cat"), "sunbeam": W("sunbeam"), "sunbeam_end": E("sunbeam"),
    # pieces: the counter, the hot bar, the hair
    "eighteen": W("Eighteen"), "thousand": W("thousand"), "pieces": W("pieces"), "pieces_end": E("pieces"),
    "each": W("each"), "one1": W("one", 0, find("each one")), "hair": W("hair"), "longer": W("longer"), "longer_end": E("longer"),
    # stack: the slivers rise, the phone lands
    "stack": W("Stack"), "allup": W("all up"), "up_end": E("all up", 1), "one2": W("one PHONE"), "phone2": W("PHONE", 0, find("one PHONE")),
    "phone2_end": E("PHONE", 0, find("one PHONE")),
    # lean: the sunny side, then the top leans away
    "and": W("And on"), "sunny": W("sunny", 0, _ln), "days": W("days"), "side": W("side"), "stretches2": W("stretches", 0, _ln),
    "more": W("more"), "more_end": E("more"),
    "so": W("so the"), "top": W("top"), "leans": W("leans"), "away": W("AWAY"), "away_end": E("AWAY"), "sun": W("Sun", 0, find("from the Sun")),
    "sun_end": E("Sun", 0, find("from the Sun")),
    # button
    "honestly": W("Honestly"), "honestly_end": E("Honestly"), "same": W("Same"), "same_end": E("Same"),
}
_order = ["phone", "eiffel", "grow", "that", "much", "summer", "hot", "stretches", "like", "cat", "sunbeam", "eighteen",
          "thousand", "pieces", "each", "hair", "longer", "stack", "allup", "one2", "phone2", "and", "sunny", "side",
          "stretches2", "more", "so", "top", "leans", "away", "sun", "honestly", "same", "same_end"]
assert all(cues[a_] < cues[b_] for a_, b_ in zip(_order, _order[1:])), [(a_, cues[a_]) for a_ in _order]
cues["end"] = T.duration
cues["shade"] = cues["same_end"] + 0.05            # the phone comes up as a sunshade: the hook's pose (the loop)
# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "grow": 0.3, "answer": 0.3, "cat": 0.25, "pieces": 0.45, "stack": 0.3, "lean": 0.3,
             "away": 0.35, "button": 0.25},
    "whip": [[_st["answer"], 1], [_st["pieces"], -1], [_st["lean"], 1], [_st["button"], -1]],
    "punch": [[cues["hair"] - 0.03, 1.2, cues["longer_end"] + 0.15], [cues["same"] - 0.03, 1.18, cues["same_end"] + 0.12]],
    "tilt": [[cues["leans"] - 0.05, cues["sun_end"] + 0.2, 4.0]],
    "mood": [[0, "day"], [cues["summer"] - 0.05, "warm"], [_st["pieces"], "day"], [cues["stretches2"] - 0.05, "warm"],
             [cues["away"] - 0.1, "dusk"], [_st["button"], "day"]],
    "fg": {},           # no leaves: the kit's fronds read as palm trees in Paris (round 0); depth comes from particles
    "air": {"hook": {"kind": "pollen", "amount": 0.5}, "grow": {"kind": "haze", "amount": 0.6},
            "answer": {"kind": "haze", "amount": 0.8}, "cat": {"kind": "dust", "amount": 0.7},
            "pieces": {"kind": "dust", "amount": 0.5}, "stack": {"kind": "sparkle", "amount": 0.5},
            "away": {"kind": "haze", "amount": 0.5}, "button": {"kind": "pollen", "amount": 0.5}},
}
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "none" for this 14 Nov 23:30 slot (outside the test).
# Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says "subscribe".
T.write(shots, caps, cues, camera=CAMERA)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots: ' + ' '.join(f'{s_["id"]}@{s_["start"]:.2f}' for s_ in shots))
