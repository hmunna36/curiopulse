"""Edit timeline for the Lightning Is 5x HOTTER Than the Sun's Surface ⚡ Short.

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
    ("hook", None),            # CU, eye level, him left of centre: roasting a marshmallow IN a lightning bolt (frame 0: the
                               # stick already in the glow); it puffs, then catches fire on "hotter"
    ("reveal", "Lightning"),   # WIDE, low angle: the bolt from the cloud to the summit's rod, him tiny beside it (whip in)
    ("thermo", "Up to"),       # MEDIUM, eye level -> tilt up: two thermometers; lightning's column runs 5x past the Sun's;
                               # the Sun on its short one, offended, then a scarf on "lukewarm" (punch-in on its face)
    ("thumb", "A giant zap"),  # EXTREME WIDE from the cloud top, travelling down the bolt to an ECU: his thumb beside the
                               # white-hot core, the same width (whip in)
    ("boom", "The air cooks"), # MEDIUM-WIDE from the other side (bolt left, him right): the air round the channel glows,
                               # then bursts: a shock ring, rain flung out, him blown back
    ("thunder", "That BOOM"),  # CU, high angle: his face frizzed and sooty; punch-in on "Thunder"
    ("dune", "And if it"),     # WIDE desert dunes at storm dusk, low angle: the strike, the cutaway under the sand, the
                               # glass root cooling; he pulls it out on "GLASS" (whip in)
    ("button", "Thunder glass"),  # MEDIUM -> the hook's CU: the glass trophy, the charcoal marshmallow; a fresh one pops on
                               # and goes back into the bolt: the picture of frame 1 (the loop; whip in)
]
special = {}

CHUNKS = [
    "You're roasting / a marshmallow",
    "on something hotter",
    "than the / Sun's surface.",
    "Lightning.",
    "Up to FIVE / times hotter.",
    "The Sun's / basically...",
    "lukewarm.",
    "A giant zap",
    "crams through air",
    "as thin / as your",
    "THUMB.",
    "The air cooks",
    "so fast,",
    "it EXPLODES.",
    "That BOOM?",
    "Thunder.",
    "And if it / hits sand...",
    "it can melt / it into",
    "GLASS.",
    "Thunder, glass,",
    "and one / crispy",
    "marshmallow.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"hotter": O, "sun's": Y, "lightning": C, "five": Y, "lukewarm": S, "giant": C, "thumb": Y,
         "cooks": O, "explodes": R, "boom": R, "thunder": C, "sand": Y, "glass": G, "crispy": O, "marshmallow": V}
DISPLAY = {"five": ["5×"]}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_st = {s_["id"]: s_["start"] for s_ in shots}
_hk = find("You're roasting")
_bt = find("Thunder glass")
cues = {
    # hook: the marshmallow puffs on "marshmallow", catches on "hotter", flares on "surface"
    "mm": W("marshmallow"), "hotter": W("hotter", 0, _hk), "sun1": W("Sun's", 0, _hk), "surface": W("surface"),
    "lightning": W("Lightning"),
    # thermo: the columns, the 5x stamp, the Sun's offence, the scarf
    "upto": W("Up to"), "five": W("FIVE"), "times": W("times"), "hotter2": W("hotter", 0, find("Up to")),
    "hotter2_end": E("hotter", 0, find("Up to")),
    "sun2": W("The Sun's basically"), "basically": W("basically"), "luke": W("lukewarm"), "luke_end": E("lukewarm"),
    # thumb: the long bolt, then his thumb
    "giant": W("giant"), "zap": W("zap"), "crams": W("crams"), "air": W("air", 0, find("crams through")),
    "thin": W("thin"), "thumb": W("THUMB"), "thumb_end": E("THUMB"),
    # boom: the air glows, then bursts
    "cooks": W("cooks"), "fast": W("fast"), "explodes": W("EXPLODES"), "explodes_end": E("EXPLODES"),
    "that": W("That BOOM"), "boomw": W("BOOM"), "thunder": W("Thunder"), "thunder_end": E("Thunder"),
    # dune
    "hits": W("hits"), "sand": W("sand"), "melt": W("melt"), "glass": W("GLASS"), "glass_end": E("GLASS"),
    # button
    "b_thunder": W("Thunder", 0, _bt), "b_glass": W("glass", 0, _bt), "b_one": W("one"), "crispy": W("crispy"),
    "b_mm": W("marshmallow", 0, _bt), "b_mm_end": E("marshmallow", 0, _bt),
}
_order = ["mm", "hotter", "surface", "lightning", "upto", "five", "hotter2", "sun2", "luke", "giant", "thumb", "cooks",
          "explodes", "that", "thunder", "hits", "melt", "glass", "b_thunder", "b_glass", "crispy", "b_mm", "b_mm_end"]
assert all(cues[a_] < cues[b_] for a_, b_ in zip(_order, _order[1:])), [(a_, cues[a_]) for a_ in _order]
cues["loop_pop"] = cues["b_mm_end"] + 0.12          # a fresh marshmallow pops onto the stick
cues["end"] = T.duration
# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "reveal": 0.3, "thermo": 0.3, "thumb": 0.25, "boom": 0.6, "thunder": 0.45, "dune": 0.35,
             "button": 0.25},
    "whip": [[_st["reveal"], 1], [_st["thumb"], -1], [_st["dune"], 1], [_st["button"], -1]],
    "punch": [[cues["luke"] - 0.03, 1.2, cues["luke_end"] + 0.25], [cues["thunder"] - 0.03, 1.22, cues["thunder_end"] + 0.2],
              [cues["crispy"] - 0.03, 1.15, cues["b_mm"] + 0.3]],
    "tilt": [[cues["explodes"] - 0.05, _st["thunder"] - 0.02, -4.0]],
    "mood": [[0, "storm"], [cues["five"] - 0.1, "warm"], [cues["luke"] - 0.05, "cold"], [_st["thumb"], "storm"],
             [cues["cooks"] - 0.05, "warm"], [_st["thunder"], "storm"], [_st["dune"], "dusk"], [_st["button"], "storm"]],
    "fg": {"hook": "rock-bl", "reveal": "rock-br", "thermo": "rock-bl", "boom": "rock-br", "dune": "grass-b",
           "button": "rock-bl"},
    "air": {"hook": {"kind": "rain", "amount": 0.55}, "reveal": {"kind": "rain", "amount": 0.7},
            "thermo": {"kind": "rain", "amount": 0.45}, "thumb": {"kind": "sparkle", "amount": 0.5},
            "boom": {"kind": "embers", "amount": 0.8}, "dune": {"kind": "dust", "amount": 0.6},
            "button": {"kind": "rain", "amount": 0.55}},
}
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s
# before the end) and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says
# "subscribe" in either arm; the ask also lives in the caption, the description and the comments.
T.write(shots, caps, cues, camera=CAMERA)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
