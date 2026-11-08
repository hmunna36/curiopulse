"""Edit timeline for the Make a Duck Hand. Can You SPREAD Your Fingers? 🦆 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop. The tight
#                                      rules (5 Nov 2026): 25-30 s, the last line runs straight into the first and nothing
#                                      comes after it (qa.py: at most 1.0 s), so the loop comes before the thumb does.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
# Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),            # THE TEST: frame 1 is his duck hand, close, beside his face; its shadow duck on the tent
                               # wall; he tries to spread the fingers on "Now spread them": they tremble and stay shut
    ("answer", "Stuck?"),      # a whip to the back of his knuckles (the same test, a new framing): a seatbelt clicks
                               # across them on "buckled"
    ("straps", "Each knuckle"),  # the hand turns to glass: two side straps on every knuckle; a window opens on one knuckle
                                 # and the camera dives in: the bone's bump pulls the straps tight as the finger bends
    ("flat", "Now flatten"),   # a whip out to a low wide: he flattens his hand palm to the lamp, the straps go slack, the
                               # fingers fan out: the shadow on the wall becomes a giant spread hand
    ("splint", "Doctors often"),  # a whip to a high angle: his hand in a white splint, in duck mode; the shadow duck in a
                                  # cast; the strap held long
    ("button", "Now duck again"),  # a hard cut back to the hook's framing: the splint pops off, the duck again, "Buckled."
                                   # the seatbelt clicks and zips away, and the last frame is frame 1 (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Make a duck / with your hand.",
    "Knuckles bent,",
    "fingers straight.",
    "Now spread them.",
    "Stuck?",
    "Your knuckles",
    "just buckled / them in.",
    "Each knuckle has / two side straps.",
    "Bend it,",
    "and a bump / in the bone",
    "pulls them tight.",
    "Now flatten / your hand.",
    "Slack straps...",
    "and they spread!",
    "Doctors often splint / broken hands",
    "in duck mode,",
    "so those straps / can't shrink.",
    "Now duck again.",
    "Buckled.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"duck": Y, "spread": O, "stuck": R, "buckled": Y, "straps": O, "tight": R, "bump": O,
         "flatten": C, "slack": C, "splint": B, "mode": Y, "shrink": R}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_flat = find("Now flatten")
i_but = find("Now duck again")
cues = {
    # the hook
    "duck": W("duck"), "hand1_end": E("hand."), "bent": W("bent"), "bent_end": E("bent"),
    "straight": W("straight"), "straight_end": E("straight."),
    "spread1": W("spread them"), "them1_end": E("spread them", 1),
    # the answer
    "stuck": W("Stuck?"), "stuck_end": E("Stuck?"), "your2": W("Your knuckles"), "buckled": W("buckled"),
    "buckled_end": E("buckled"), "in_end": E("them in", 1),
    # the straps
    "each": W("Each knuckle"), "two": W("two side"), "straps1": W("straps.", 0, find("two side")), "straps1_end": E("straps.", 0, find("two side")),
    "bend": W("Bend it"), "bump": W("bump"), "bone": W("bone"), "pulls": W("pulls"), "tight": W("tight."), "tight_end": E("tight."),
    # the flat hand
    "flatten": W("Now flatten"), "flatten_w": W("flatten"), "hand3_end": E("your hand", 1, i_flat), "slack": W("Slack"),
    "straps2_end": E("straps...", 0, i_flat), "and3": W("and they spread"), "spread2": W("spread!", 0, i_flat), "spread2_end": E("spread!", 0, i_flat),
    # the splint
    "doctors": W("Doctors"), "splint": W("splint"), "broken": W("broken"), "duckmode": W("duck mode"), "mode_end": E("duck mode", 1),
    "so": W("so those"), "straps3": W("straps", 0, find("so those")), "shrink": W("shrink."), "shrink_end": E("shrink."),
    # the button
    "now4": W("Now duck again"), "duck4": W("duck", 0, i_but), "again_end": E("again.", 0, i_but),
    "buckled2": W("Buckled.", 0, i_but), "buckled2_end": E("Buckled.", 0, i_but),
}
cues["end"] = T.duration
_st = {s_["id"]: s_["start"] for s_ in shots}
cues.update({f"shot_{k}": v for k, v in _st.items()})
assert cues["spread1"] < cues["stuck"] < cues["buckled"] < cues["each"] < cues["bend"] < cues["tight"] < cues["flatten"] \
    < cues["slack"] < cues["spread2"] < cues["doctors"] < cues["duckmode"] < cues["shrink"] < cues["now4"] < cues["buckled2"]

# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "answer": 0.32, "straps": 0.22, "flat": 0.35, "splint": 0.28, "button": 0.25},
    # whips at the story turns: the test -> the answer (two framings of the same test), into the reveal, into the fact
    "whip": [[_st["answer"], 1], [_st["flat"], -1], [_st["splint"], 1]],
    # punch-ins: the answer's sting ("them in.") and the reveal's sting ("spread!"), both on the hand
    "punch": [[cues["buckled"] - 0.04, 1.2, cues["in_end"] + 0.25], [cues["spread2"] - 0.03, 1.18, cues["spread2_end"] + 0.4]],
    # a dutch tilt while he strains and it will not go
    "tilt": [[cues["spread1"] + 0.1, cues["stuck_end"] + 0.1, -3.0]],
    # the lantern's warm light; a spotlight on the stuck duck; cool inside the glass; warm and bright for the reveal; the
    # doctor's daylight for the splint; back to frame 1's warm before the button (the loop)
    "mood": [[0, "warm"], [cues["stuck"] - 0.05, "spot"], [cues["each"] - 0.1, "cold"], [cues["flatten"] - 0.05, "warm"],
             [cues["doctors"] - 0.1, "day"], [cues["now4"] - 0.12, "warm"]],
    # depth in front of the lens: the tent's door flap and lamp bokeh, alternating corners
    "fg": {"answer": {"kind": "post-l", "col": "#0A2630", "lit": "#1D5560"}, "flat": {"kind": "post-r", "col": "#0A2630", "lit": "#1D5560"},
           "splint": "bokeh-r"},
    # the air in a lamp-lit tent: dust in the lantern light; sparkle on the reveal
    "air": {"hook": {"kind": "dust", "amount": 0.6}, "answer": {"kind": "dust", "amount": 0.45}, "flat": {"kind": "sparkle", "amount": 0.6},
            "splint": {"kind": "dust", "amount": 0.4}, "button": {"kind": "dust", "amount": 0.6}},
}
T.write(shots, caps, cues, camera=CAMERA)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print("shots:", ", ".join(f'{s_["id"]} {s_["start"]:.2f}' for s_ in shots))
