"""Edit timeline for the "Can You Do the ELVIS Lip Without Squinting?" Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
A FACE test, opening arm CONTROL (the usual opening of story.md §2: him doing the test, close, with the command line).
The place: a photo booth at a roadside diner at night (el_world.js). We ARE the booth's camera on the close shots; the
booth's three flashes and its strip of three photos are the running device; the diner's bulldog is the second character.
Sides: he curls his LEFT upper lip (screen-right) and it is his LEFT eye (screen-right) that squints.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)

SHOTS = [
    ("hook", None),               # CU, front, eye level: the booth camera on his face, the lip already curled, the eye fighting
    ("ecu", None),                # ECU, his left side (screen-right), a little low: the lip corner, the fang, the eye squinting
    ("open", None),               # MCU, front-left, low: "OPEN." on a squinting eye; the booth bulbs bloom behind
    ("booth", "Squinting"),       # WIDE, outside, high: the booth at the diner, curtain open, him inside; the bulldog watching
    ("leash", None),              # CU, front: a red leash clips from his lip to his eye on "LEASH", yanks; FLASH 1 (photo 1)
    ("again", "Again."),          # ECU, low, his face goes glass over the cheek: the lifting muscle from lip to the eye's corner
    ("eye", None),                # ECU, high: the muscle's top end, right by the eye, the eye's ring muscle round it
    ("spill", "Doctors"),         # CU, side: the LIFT spark runs up and spills over into the ring; cut_spill: ECU on the spill
    ("step", "In one study"),     # MS, outside, eye level: he leans out of the booth to the photo wall
    ("wall", None),               # WIDE-ish, the wall of 100 booth photos: the count runs to 90 squinting (the held shot)
    ("name", "Blame"),            # CU, front: a name tag on the muscle; cut_scroll: MS, low: the tag unrolls to the floor
    ("dog", None),                # MCU, low: the bulldog does the PERFECT one-sided snarl, eyes wide; FLASH 3 (the reverse)
    ("button", "Now try"),        # CU, the booth camera again: he tries the other side, then snaps back to frame 0 (the loop)
]

CHUNKS = [
    "Curl up / one side",
    "of your lip",
    "like / ELVIS.",
    "Keep that eye",
    "OPEN.",
    "Squinting?",
    "Your lip's got / that eye",
    "on a / LEASH.",
    "Again.",
    "That lip / muscle",
    "starts right...",
    "by / your eye.",
    "Doctors think",
    "the order / to lift",
    "spills over / into it.",
    "In one / study,",
    "ninety / in a hundred...",
    "squinted.",
    "Blame / the muscle",
    "with the / LONGEST",
    "name.",
    "Now try / the other side.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"one": Y, "elvis": V, "open": C, "squinting": R, "leash": R, "again": Y, "muscle": O, "eye": C,
         "spills": O, "90": R, "100": Y, "squinted": R, "longest": Y, "other": Y}
DISPLAY = {"ninety": ["90"], "in a hundred": ["IN", "100"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

W, E, ev, find = T.W, T.E, T.ev, T.find
i_now = find("Now try")
i_blame = find("Blame")
special = {
    "ecu": W("like") - 0.06,
    "open": W("OPEN") - 0.06,
    "booth": W("Squinting") - 0.06,
    "leash": W("on a LEASH") - 0.06,
    "eye": W("by your eye") - 0.06,
    "wall": W("ninety") - 0.06,
    "dog": E("name.", 0, i_blame) + 0.06,
}
shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

_st = {s_["id"]: s_["start"] for s_ in shots}
_en = {s_["id"]: s_["end"] for s_ in shots}
cues = {
    "curl": W("Curl"), "side": W("side"), "lip1": W("lip"), "like": W("like"), "elvis": W("Elvis"), "elvis_end": E("Elvis"),
    "keep": W("Keep"), "eye1": W("Keep that eye", 2), "open": W("OPEN"), "open_end": E("OPEN"),
    "squinting": W("Squinting"), "squinting_end": E("Squinting"),
    "your_lip": W("Your lip's"), "eye2": W("that eye on", 1), "leash": W("LEASH"), "leash_end": E("LEASH"),
    "again": W("Again."), "again_end": E("Again."), "that_lip": W("That lip"), "muscle": W("muscle"), "starts": W("starts"), "right": W("right"),
    "by": W("by your eye"), "eye3": W("by your eye", 2), "eye3_end": E("by your eye", 2),
    "doctors": W("Doctors"), "order": W("order"), "lift": W("lift"), "spills": W("spills"), "spills_end": E("spills"),
    "over": W("over"), "into": W("into it"), "it_end": E("into it", 1),
    "study": W("In one study", 2), "ninety": W("ninety"), "hundred": W("hundred"), "hundred_end": E("hundred"),
    "squinted": W("squinted"), "squinted_end": E("squinted"),
    "blame": W("Blame"), "longest": W("LONGEST"), "longest_end": E("LONGEST"),
    "name": W("name.", 0, i_blame), "name_end": E("name.", 0, i_blame),
    "now": W("Now try"), "other": W("other", 0, i_now), "side_last": W("side.", 0, i_now),
}
cues["last_end"] = T.words[-1]["end"]
cues["flash1"] = cues["leash_end"] + 0.04         # the booth flashes just after "LEASH." (the answer's sting): photo 1
cues["leash_on"] = cues["leash"] + 0.05           # the leash clips on as the word lands, and yanks the eye
cues["pin"] = cues["squinted_end"] + 0.0          # just after "squinted.": his own photo is slapped onto the wall (the escalate beat)
cues["cut_spill"] = cues["spills"] - 0.06         # inside the spill shot: snap in to the eye corner for the spill itself
cues["spill_go"] = cues["spills"] + 0.05          # the spark overflows into the ring...
cues["cinch"] = cues["spills_end"] + 0.02         # ...and the ring cinches (the eye squeezes)
cues["cut_scroll"] = cues["longest"] - 0.06       # inside the name shot: pull back low as the tag unrolls to the floor
cues["unroll"] = cues["longest"] + 0.08
cues["dog_snarl"] = _st["dog"] + 0.12             # the bulldog curls one lip, eyes wide open, a glint on the fang...
cues["flash3"] = _st["dog"] + 0.42                # ...and the booth flash catches it (the reverse beat): photo 3
cues["swap"] = cues["other"] - 0.05               # he swaps to the other side on "other"
cues["back"] = cues["last_end"] + 0.06            # and snaps back to frame 0's side for the loop
cues["ff"] = cues["squinting_end"] + 0.04         # the flash-forward, in the pause after "Squinting?"
assert cues["ff"] + 0.55 <= cues["your_lip"] + 0.3, "the flash-forward runs over the answer's next words"
assert _st["spill"] < cues["cut_spill"] < _en["spill"] - 0.5 and _st["name"] < cues["cut_scroll"] < _en["name"] - 0.5
assert cues["flash3"] < _en["dog"] - 0.15 and cues["back"] < T.duration - 0.35

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "ecu": 0.25, "open": 0.3, "booth": 0.3, "leash": 0.35, "again": 0.25, "eye": 0.25, "spill": 0.35,
             "step": 0.3, "wall": 0.22, "name": 0.3, "dog": 0.3, "button": 0.25},
    "whip": [[_st["booth"], 1], [_st["step"], -1], [_st["name"], 1]],
    "punch": [[cues["leash"] - 0.02, 1.2, _en["leash"] - 0.05], [cues["dog_snarl"] + 0.02, 1.16, _en["dog"] - 0.04]],
    "tilt": [[cues["spills"] - 0.04, _en["spill"] - 0.05, -3.0]],
    "hit": [[cues["flash1"] + 0.05, 4], [cues["flash3"] + 0.05, 4]],
    "act": {"brow": [cues["squinting"] + 0.05, cues["by"] + 0.1, cues["ninety"] + 0.1]},
    "mood": [[0, "warm"], [cues["again"] - 0.1, "spot"], [cues["study"] - 0.4, "cold"], [cues["ninety"] - 0.2, "warm"]],
    "fg": {"open": "bokeh-r", "booth": "post-l", "leash": "bokeh-l", "step": "bokeh-t", "wall": "post-r", "name": "bokeh-r",
           "dog": "bokeh-l"},
    "air": {"hook": {"kind": "sparkle", "amount": 0.35}, "ecu": {"kind": "dust", "amount": 0.4}, "booth": "dust",
            "again": {"kind": "dust", "amount": 0.35}, "spill": {"kind": "sparkle", "amount": 0.35}, "wall": "dust",
            "name": {"kind": "sparkle", "amount": 0.3}, "dog": "dust", "button": {"kind": "sparkle", "amount": 0.35}},
    "lens": [],
    # the flash-forward: in the pause after "Squinting?", the wall of booth photos counting to 90, in a window by his face
    "flash": [[cues["ff"], 0.55, cues["hundred"] + 0.3, {"win": [790, 665, 170], "zoom": 1.25, "at": [540, 760]}]],
}
T.write(shots, caps, cues, camera=CAMERA)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
