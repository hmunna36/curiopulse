"""Edit timeline for the "Can You WINK Without the Other Eye Moving?" Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
The DEMO opening (the opening test of 17 Nov 2026, story.md §2): frame 0 is his face alone, close, already in the start
pose, the eye that must stay still ringed, the dare "KEEP THIS EYE STILL" on screen; the dare spoken from 0.2 s; the
attempt to about 1.5 s; then the café opens up with him in it mid-attempt.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)

SHOTS = [
    ("dare", None),                 # 0-1.5 s: the DEMO macro: his face alone, the ringed eye, the dare card; the wink attempt
    ("cafe", None),                 # 1.5 s: the café opens up, him mid-attempt at his table, the cat spy at the next table
    ("ots", "It moved"),            # over the cat's shoulder: his double squint across the room; the cat tilts its head
    ("answer", "Relax"),            # close, front: he relaxes, eyes open; the flash-forward window beside his face
    ("string", "share"),            # extreme close-up of his eyes, low: a string drops in and ties both upper lids
    ("blink", "Blink."),            # extreme close-up: the string jerks and BOTH lids drop (the viewer blinks with him)
    ("puppet", "and BOTH"),         # medium, high: the string runs up to a puppet handle in his own raised hand
    ("wink", "A wink"),             # medium-close, low: he pulls the handle and props his left lid open with a fingertip
    ("prop", "while holding"),      # extreme close-up: the fingertip holding the lid UP
    ("slip", "But then"),           # close on his face; cut_grip snaps in to the fingertip: it slides off, the lid drops halfway
    ("board", "In one study"),      # wide, low: he turns to the café's chalkboard menu; cut_board: the chalkboard, 100 chalk
                                    # faces, the count runs to 96 squinting (the held shot, the longest, before the sting)
    ("catwink", "squinted"),        # the cat winks back at him... and ITS other eye squints too; he grins
    ("button", "Now try"),          # back to the macro: the last frame is frame 0 (the loop)
]
special = {"cafe": 1.50}

CHUNKS = [
    "Wink.",
    "Keep your / other eye",
    "STILL.",
    "It moved, / right?",
    "Relax.",
    "Your two / eyelids",
    "share ONE / string.",
    "Blink.",
    "That pulls it...",
    "and BOTH / lids drop.",
    "A wink?",
    "That's / pulling it...",
    "while holding / one lid UP.",
    "But then / your grip",
    "slips.",
    "In one / study,",
    "ninety-six people",
    "out of / a hundred...",
    "squinted / too.",
    "Now try / the OTHER eye.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"wink": Y, "still": C, "moved": R, "one": Y, "string": Y, "both": O, "blink": C, "up": G, "slips": R,
         "ninety-six": Y, "squinted": R, "other": Y}
DISPLAY = {"ninety-six people": ["96", "PEOPLE"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_st = {s_["id"]: s_["start"] for s_ in shots}
_en = {s_["id"]: s_["end"] for s_ in shots}
cues = {
    # the dare (DEMO): the wink attempt right after "Wink.", the ringed eye squints with it
    "wink0": E("Wink.") + 0.02, "still": W("STILL"), "still_end": E("STILL"),
    "moved": W("moved"), "right": W("right"),
    "relax": W("Relax"), "relax_end": E("Relax"), "your_two": W("Your two"), "eyelids": W("eyelids"),
    "share": W("share"), "one": W("ONE"), "one_end": E("ONE"), "string": W("string"), "string_end": E("string"),
    "blink": W("Blink."), "blink_end": E("Blink."), "pulls": W("pulls"), "both": W("BOTH"), "lids": W("lids"), "drop": W("drop"),
    "drop_end": E("drop"),
    "a_wink": W("A wink"), "wink_q": W("A wink?", 1), "wink_q_end": E("A wink?", 1), "thats": W("That's"), "pulling": W("pulling"), "while": W("while"),
    "holding": W("holding"), "lid_up": W("UP."), "up_end": E("UP."),
    "but": W("But then"), "grip": W("grip"), "slips": W("slips"), "slips_end": E("slips"),
    "in_one": W("In one study"), "study": W("study"), "ninety": W("ninety-six"), "ninety_end": E("ninety-six"),
    "people": W("people"), "hundred": W("hundred"), "hundred_end": E("hundred"),
    "squinted": W("squinted"), "squinted_end": E("squinted"), "too": W("too."), "too_end": E("too."),
    "now": W("Now try"), "other": W("the OTHER eye", 1), "other_end": E("the OTHER eye", 1), "eye_last": W("the OTHER eye", 2),
}
cues["eye_last_end"] = T.words[-1]["end"]
cues["cut_grip"] = cues["grip"] - 0.06            # inside the slip shot: snap in to the fingertip and the lid for the slip
cues["cut_board"] = cues["study"] + 0.22          # inside the board shot: from him turning to the chalkboard itself
cues["cut_stringup"] = cues["string"] - 0.06      # inside the string shot: pull back to the string running up out of frame
cues["cat_wink"] = cues["squinted"] + 0.20          # the cat winks back at him (the reverse beat)...
cues["cat_squint"] = cues["too_end"] + 0.02         # ...and its other eye squints too, just after "too." (the biggest hit)
cues["taut"] = cues["string_end"] + 0.02           # the string snaps taut just after "string." (the answer's sting)
cues["slip_go"] = cues["slips_end"] - 0.20         # the finger slides off at the end of "slips"...
cues["slip_land"] = cues["slips_end"] - 0.08       # ...and the lid lands half shut (clear to the cut at 19.0 s: no whip there)
assert cues["wink0"] < 1.2 and cues["cut_grip"] < cues["slips"] - 0.25 and _st["string"] < cues["cut_stringup"] < _en["string"] - 0.4

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"dare": 0.22, "cafe": 0.3, "ots": 0.3, "answer": 0.25, "string": 0.25, "blink": 0.3, "puppet": 0.35,
             "wink": 0.35, "prop": 0.3, "slip": 0.45, "board": 0.22, "catwink": 0.3, "button": 0.22},
    "whip": [[_st["answer"], -1], [_st["blink"], 1, 3]],
    "punch": [[cues["taut"] - 0.02, 1.2, _en["string"] - 0.05], [cues["slip_go"] - 0.02, 1.18, _en["slip"] - 0.05]],
    "tilt": [[cues["slip_go"] - 0.04, _en["slip"] - 0.05, -3.5]],
    "hit": [[cues["taut"] + 0.04, 4], [cues["slip_land"] + 0.02, 4]],
    "act": {"brow": [cues["relax"] + 0.1, cues["ninety"] + 0.15]},
    "mood": [[0, "warm"], [cues["share"] - 0.1, "spot"], [cues["but"] - 0.1, "cold"], [cues["ninety"] - 0.2, "warm"]],
    "fg": {"cafe": "leaves-tl", "ots": "bokeh-l", "answer": "bokeh-r", "puppet": "bokeh-l", "wink": "leaves-tr",
           "slip": "bokeh-l", "catwink": "leaves-tl"},
    "air": {"dare": {"kind": "dust", "amount": 0.35}, "cafe": "dust", "ots": "dust", "answer": {"kind": "dust", "amount": 0.5},
            "puppet": {"kind": "sparkle", "amount": 0.4}, "board": {"kind": "dust", "amount": 0.4},
            "catwink": "dust", "button": {"kind": "dust", "amount": 0.35}},
    "lens": [],
    # the flash-forward: in the pause after "Relax.", the cat's reverse wink (its other eye squinting too), in a window
    "flash": [[cues["relax_end"] + 0.02, 0.6, cues["cat_squint"] - 0.15, {"win": [800, 700, 175], "zoom": 2.1, "at": [550, 790]}]],
}
T.write(shots, caps, cues, camera=CAMERA)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s_ in shots:
    print(f'  {s_["id"]:8s} {s_["start"]:6.2f} - {s_["end"]:6.2f}  ({s_["end"] - s_["start"]:.2f} s)')
