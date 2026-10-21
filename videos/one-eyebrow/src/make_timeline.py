"""Edit timeline for the Why Can't You Raise Just ONE Eyebrow? 🤨 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.2)  # seconds after the last word: his smug one-brow look holds, the finger lets go of the brow,
#                                      and the cut back to frame 1 (him trying again) for the loop.

# (shot id, phrase whose first word opens the shot). Every id needs an SC.<id> in web/. One world all the way through:
# blocked-nostril's bathroom seen from its mirror, his forehead turning to glass where he stands, and back.
SHOTS = [
    ("hook", None),             # THE TEST: frame 0 is him at the mirror, close, straining to lift ONE brow, his finger pointing
                                # at it. In the gap after "eyebrows." BOTH brows shoot up. "Relax..." runs on in the same shot: two
                                # strings drop onto his brows from one wooden puppet handle above his head, and it yanks them.
    ("glass", "Each half"),     # his head turns to glass above the brows: the brain's two halves each hold a string that forks to
                                # BOTH brows; then the half smile: two more strings, crossed, one to each corner of his mouth
    ("stroke", "That's why"),   # one half of the brain goes dim and its mouth string goes slack (the corner droops); the other half
                                # still lifts BOTH brows: the doctor's check
    ("button", "Still can't"),  # the glass goes: his finger holds one brow down, the other rises alone, smug; back to frame 0
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Raise just one",
    "of your / eyebrows.",
    "Both went up,",
    "right?",
    "Relax,",
    "your eyebrows / are on",
    "one puppet / string.",
    "Each half / of your brain",
    "holds a / string...",
    "tied to / BOTH brows.",
    "Now try / half a smile.",
    "Easy, / right?",
    "Your mouth gets",
    "one string / per side.",
    "That's why,",
    "after a stroke,",
    "doctors check / the forehead:",
    "it usually / still lifts",
    "on both sides.",
    "Still can't?",
    "Hold one down.",
    "Nobody / has to know.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"one": Y, "eyebrows": Y, "both": R, "puppet": O, "string": O, "half": C, "brain": PK, "brows": Y, "smile": G,
         "easy": G, "mouth": PK, "side": C, "stroke": R, "doctors": B, "forehead": Y, "lifts": G, "sides": G, "hold": O,
         "down": O, "nobody": V}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_res = find("Both went up")
i_ans = find("Relax, your eyebrows")
i_str = find("holds a string")
i_both = find("tied to BOTH brows")
i_smile = find("Easy, right")
i_side = find("one string per side")
i_sides = find("on both sides")
i_hold = find("Hold one down")
assert i_res < i_ans < i_str < i_both < i_smile < i_side < i_sides < i_hold, "find() order"
cues = {
    # the hook: he strains for one brow (his finger on it), both shoot up in the gap after "eyebrows."
    "one": W("one"), "eyebrows": W("eyebrows"), "eyebrows_end": E("eyebrows"),
    "both": W("Both", s=i_res), "up": W("up", s=i_res), "right_end": E("right", s=i_res),
    # the answer: one puppet handle, two strings, the yank
    "relax": W("Relax"), "your_eb": W("eyebrows", s=i_ans), "puppet": W("puppet", s=i_ans), "string_end": E("string", s=i_ans),
    # the glass head: two halves, a string each, forked to both brows
    "each": W("Each"), "brain": W("brain"), "holds": W("holds", s=i_str), "string2": W("string", s=i_str), "tied": W("tied"),
    "both2": W("BOTH", s=i_both), "brows_end": E("brows", s=i_both),
    # the half smile
    "now": W("Now try"), "smile": W("smile", s=find("half a smile")), "smile_end": E("smile", s=find("half a smile")),
    "easy": W("Easy"), "right2_end": E("right", s=i_smile),
    "mouth": W("Your mouth"), "oneside": W("one", s=i_side), "per": W("per"), "side_end": E("side", s=i_side),
    # the stroke: one half dims, the forehead still lifts on both sides
    "thats": W("That's why"), "stroke": W("stroke"), "stroke_end": E("stroke"), "doctors": W("doctors"), "forehead": W("forehead"),
    "usually": W("usually"), "lifts": W("lifts"), "bothsides": W("both", s=i_sides), "sides_end": E("sides"),
    # the button: hold one down, the other rises alone
    "still": W("Still can't"), "cant_end": E("can't", s=find("Still can't")), "hold": W("Hold"), "down": W("down", s=i_hold),
    "down_end": E("down", s=i_hold), "nobody": W("Nobody"), "know_end": E("know"),
}
# the gags, in the gaps after their words (sound.md: the sound just after the word, never on it)
cues["pop"] = round(cues["eyebrows_end"] + 0.22, 3)     # both brows shoot up: BOING (the viewer's own result)
cues["pop2"] = round(cues["right_end"] + 0.04, 3)       # he tries again: both again
cues["drop"] = round(cues["relax"] + 0.30, 3)           # the strings drop onto his brows
cues["yank"] = round(cues["string_end"] + 0.06, 3)      # the handle yanks: both brows jump
cues["smirk"] = round(cues["smile_end"] + 0.12, 3)      # he does the half smile, easily
cues["dim"] = round(cues["stroke"] - 0.05, 3)           # one half of the brain goes dim
cues["check"] = round(cues["sides_end"] + 0.06, 3)      # BOTH: the tick
cues["press"] = round(cues["down"] - 0.06, 3)           # the finger presses one brow down
cues["sly"] = round(cues["down_end"] + 0.14, 3)         # the other brow rises alone: ding
cues["wink"] = round(cues["know_end"] + 0.15, 3)        # a smug glance to the camera
assert cues["pop"] < cues["both"] and cues["pop2"] < cues["relax"] and cues["yank"] < cues["each"]
assert cues["smirk"] < cues["mouth"] and cues["check"] < cues["still"] and cues["sly"] < cues["nobody"]
# ---- no Subscribe pill (since 16 Oct 2026; user, 15 Oct: "yes"; reference/analytics.md, the rules of 15 Oct). The
# silent pill over the last 3.4 s still made about a quarter of the viewers leave in the last 4 s and added no
# subscribers; replays carried the channel's breakout. So the Short ends on the button line and cuts back to frame 1.
# Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"]: web/subscribe.js draws the pill only when they exist, and
# qa.py fails a Short that has them. The subscribe ask lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: no pill, nothing said (the Short loops)'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print("shots: " + ", ".join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
print("cues: " + ", ".join(f"{k}={v:.2f}" for k, v in cues.items()))
