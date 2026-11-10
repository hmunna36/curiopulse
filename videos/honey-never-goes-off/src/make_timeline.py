"""Edit timeline for the Your HONEY Could Outlive You 🍯 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop. The tight
#                                      rules (5 Nov 2026): 25-30 s, the last line runs straight into the first and nothing
#                                      comes after it (qa.py: at most 1.0 s), so the loop comes before the thumb does.

# v3's alignment puts two words of the payoff about 0.1 s before their sound (qc_audio: "and" 13.68, "stay" 14.11): move
# them onto the take's own bursts of speech-band energy
T.retime("and", T.W("and it can") - 0.02, T.W("and it can") + 0.2)
T.retime("stay", T.W("stay good") + 0.02, T.W("stay good") + 0.28)
# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),             # CU, eye level, him RIGHT of frame, the table in front: breakfast in his kitchen, he drizzles a
                                # golden ribbon of honey from a wooden dipper onto toast (the action on frame 0); the camera
                                # slides along the table to the toast ("bread"), the banana, back to the dripping jar ("HONEY");
                                # on "Honey." he lifts the jar like a trophy, it glints (ting)
    ("desert", "To germs"),     # WHIP into the jar. WIDE, LOW angle: inside, the honey is a golden desert of dunes under the
                                # curved glass sky (the label's letters backwards on it, the kitchen lamp as its sun); the
                                # hiker, tiny, in a pith helmet, trudges a dune beside a panting germ; punch-in on "DESERT"
    ("slurp", "All that sugar"),# MEDIUM-CU, HIGH angle, the other side: sugar grains pop up out of the dune with faces, poke
                                # straws into the germ on "SLURPS": it shrivels to a raisin; the hiker hugs his canteen and a
                                # grain turns its straw toward HIM
    ("lid", "Keep the lid"),    # MACRO insert from above: his hand screws the lid on (clunk on "on")
    ("aging", "and it can"),    # WIDE, eye level, the kitchen from the far side: a time-lapse; the window flickers day/night,
                                # calendar pages fly, the toast grows fur, the banana goes black and flat, his hair goes white,
                                # a beard grows to the floor, cobwebs; the jar does not change; punch-in on his old face at "YOU"
    ("tomb", "The oldest"),     # WHIP. MEDIUM, LOW angle: a torch-lit burial chamber; the hiker as an archaeologist brushes the
                                # dust off an ancient clay jar and lifts it to the torchlight on "found?"
    ("pyramid", "Older than"),  # WIDE, HIGH angle: he holds the jar up in front of the pyramids at dusk; two age tags pop:
                                # the jar's ~5,500 YEARS against the pyramids' ~4,500
    ("button", "Maybe don't"),  # CU, eye level, back in the tomb: his spoon comes up out of the jar with a black, crusty lump,
                                # mouth open; he freezes on "THAT", eyes slide to us, the spoon lowers...
    ("loop", None),             # ...and the spoon matches into frame 1's honey dipper over the toast (the loop)
]
special = {}

CHUNKS = [
    "Which / outlives you:",
    "bread,",
    "a banana,",
    "or HONEY?",
    "Honey.",
    "To germs,",
    "it's a / DESERT.",
    "All that / sugar...",
    "SLURPS / the water",
    "right out / of any germ",
    "that lands / in it.",
    "Keep the / lid on...",
    "and it can / stay good",
    "for / CENTURIES.",
    "Way longer",
    "than YOU.",
    "The oldest / honey",
    "ever found?",
    "Older than / the PYRAMIDS.",
    "Maybe / don't eat",
    "THAT one.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"honey": Y, "germs": G, "germ": G, "desert": O, "sugar": Y, "slurps": V, "water": C, "lid": B,
         "centuries": Y, "you": R, "oldest": O, "pyramids": O}
DISPLAY = {}  # spoken words shown as figures: {"seventy percent": ["70%"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

special["loop"] = T.duration - 0.43   # the last 0.43 s: the spoon matches into frame 1's dipper (the loop)
shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_st = {s_["id"]: s_["start"] for s_ in shots}
_a = find("Honey To germs")
_w = find("The oldest honey")
cues = {
    "which": W("Which"), "you0": W("you", 0), "bread": W("bread"), "bread_end": E("bread"), "banana": W("banana"),
    "banana_end": E("banana"), "or": W("or HONEY"), "honey1": W("HONEY"), "honey1_end": E("HONEY"),
    "honey2": W("Honey", 0, _a), "honey2_end": E("Honey", 0, _a),
    "to": W("To germs"), "germs": W("germs"), "germs_end": E("germs"), "its": W("it's a"), "desert": W("DESERT"),
    "desert_end": E("DESERT"),
    "all": W("All that"), "sugar": W("sugar"), "sugar_end": E("sugar"), "slurps": W("SLURPS"), "slurps_end": E("SLURPS"),
    "water": W("water"), "out": W("right out", 1), "germ": W("any germ", 1), "lands": W("lands"), "in_it_end": E("in it", 1),
    "keep": W("Keep"), "lid": W("lid"), "on": W("lid on", 1), "on_end": E("lid on", 1),
    "and": W("and it can"), "stay": W("stay"), "good": W("good"), "centuries": W("CENTURIES"), "centuries_end": E("CENTURIES"),
    "way": W("Way"), "longer": W("longer"), "than_you": W("than YOU"), "you": W("than YOU", 1), "you_end": E("than YOU", 1),
    "the": W("The oldest"), "oldest": W("oldest"), "honey3": W("honey", 0, _w), "ever": W("ever"), "found": W("found"),
    "found_end": E("found"),
    "older": W("Older"), "pyramids": W("PYRAMIDS"), "pyramids_end": E("PYRAMIDS"),
    "maybe": W("Maybe"), "dont": W("don't"), "eat": W("eat"), "that": W("THAT one"), "one": W("THAT one", 1),
    "one_end": E("THAT one", 1),
}
_order = ["which", "bread", "banana", "or", "honey1", "honey2", "to", "germs", "its", "desert", "desert_end", "all", "sugar",
          "slurps", "water", "out", "germ", "lands", "in_it_end", "keep", "lid", "on", "and", "stay", "good", "centuries",
          "centuries_end", "way", "longer", "you", "you_end", "the", "oldest", "honey3", "ever", "found", "found_end", "older",
          "pyramids", "pyramids_end", "maybe", "dont", "eat", "that", "one", "one_end"]
assert all(cues[a_] < cues[b_] for a_, b_ in zip(_order, _order[1:])), [(a_, cues[a_]) for a_ in _order]
cues["end"] = T.duration
cues["loop"] = _st["loop"]
cues["lift"] = cues["honey2"] - 0.12          # he lifts the jar like a trophy on "Honey."
cues["shrivel"] = cues["germ"] - 0.05         # the germ shrinks from "germ" to "in it"
cues["spy"] = cues["in_it_end"] + 0.06        # a sugar grain turns its straw toward his canteen (in the gap)
cues["clunk"] = cues["on"] + 0.05             # the lid's last turn
cues["lapse"] = _st["aging"] + 0.10           # the time-lapse starts
cues["beard"] = cues["centuries"]             # the beard grows from "CENTURIES"
cues["old"] = cues["centuries_end"] + 0.05    # fully old by the end of "CENTURIES"
cues["tag1"] = cues["older"] + 0.05           # the jar's age tag
cues["tag2"] = cues["pyramids"] + 0.05        # the pyramids' age tag
cues["scoop"] = cues["maybe"] - 0.30          # the spoon comes up with the black lump
cues["freeze"] = cues["that"] - 0.04          # he freezes
cues["lower"] = cues["one_end"] - 0.15        # the spoon lowers toward the match cut
CAMERA = {
    "hand": {"hook": 0.25, "desert": 0.3, "slurp": 0.35, "lid": 0.2, "aging": 0.25, "tomb": 0.3, "pyramid": 0.3,
             "button": 0.3, "loop": 0.25},
    "whip": [[_st["desert"], 1], [_st["tomb"], -1], [_st["pyramid"], 1]],
    "punch": [[cues["desert"] - 0.03, 1.2, cues["desert_end"] + 0.2], [cues["you"] - 0.03, 1.2, cues["you_end"] + 0.3],
              [cues["that"] - 0.03, 1.18, cues["one_end"] - 0.02]],
    "tilt": [[cues["slurps"] - 0.05, cues["in_it_end"] + 0.2, -3.0]],
    "mood": [[0, "day"], [_st["desert"], "warm"], [_st["lid"], "day"], [cues["beard"] - 0.1, "dusk"], [_st["tomb"], "warm"],
             [_st["pyramid"], "dusk"], [_st["button"], "day"]],
    "fg": {"hook": "bokeh-r", "desert": {"kind": "rock-br", "col": "#8A4F0C", "lit": "#E0A030"}, "aging": {"kind": "post-l", "col": "#7A4A28", "lit": "#B98250", "alpha": 0.95}, "pyramid": {"kind": "grass-bl", "col": "#5A3418", "lit": "#B8783A"}, "button": "bokeh-r", "loop": "bokeh-r"},
    "air": {"hook": {"kind": "dust", "amount": 0.4}, "desert": {"kind": "haze", "amount": 0.7},
            "slurp": {"kind": "sparkle", "amount": 0.5}, "aging": {"kind": "dust", "amount": 0.6},
            "tomb": {"kind": "embers", "amount": 0.5}, "pyramid": {"kind": "haze", "amount": 0.6},
            "button": {"kind": "dust", "amount": 0.6}, "loop": {"kind": "dust", "amount": 0.4}},
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
print('shots: ' + ' '.join(f'{s_["id"]}@{s_["start"]:.2f}' for s_ in shots))
