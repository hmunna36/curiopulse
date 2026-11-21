"""Edit timeline for the This Whole Forest Is ONE Tree 🌳 Short (CURIOUS, short arm 30-35 s, no pill, the loop).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop

# The places (web/pd_world.js): Pando, the quaking-aspen clone in Fishlake National Forest, Utah. A forest floor of white
# trunks with dark eye-shaped scars (the running device: the trunks' eyes), seen at ground level; the same forest cut open
# (the soil as a cross-section, one glowing root network under every trunk); the mountainside from the air (the clone as
# one patch among other patches and dark firs), green, then autumn; a giant balance in a meadow (the forest against forty
# blue whales). Framings: never two alike in a row (size, side, height).
SHOTS = [
    ("hook", None),                     # CU, eye level: him hugging ONE white trunk, cheek on the bark, eyes shut, bliss;
                                        # its bark eye above him; more trunks behind, quaking leaves (frame 0)
    ("rise", "is ONE"),                 # WIDE, crane up from him through the canopy to the whole hill: on "ONE" a glowing
                                        # outline lassoes the whole forest: 1 TREE
    ("answer", "The real"),             # MEDIUM, LOW angle at ground level, him RIGHT, letting go and looking down at his feet
    ("roots", "is UNDERGROUND"),        # WIDE, the cutaway: the ground slices open, one glowing root network runs out from
                                        # under him to every trunk (hitstop); he lifts a foot
    ("sprout", "Every trunk"),          # MEDIUM on the cutaway: a root swells, a sprout pops through the soil beside him and
                                        # shoots up into a trunk; a SPROUT tag slaps onto a giant trunk
    ("count", "about forty-seven"),     # WHIP. HIGH angle from the air: the forest counted, a counter races; cut_thou: WIDER,
                                        # 47,000 TRUNKS
    ("dna", "Same roots"),              # MEDIUM, eye level, him LEFT: a scanner on two trunks, the root under both lights;
                                        # on "DNA." both read MATCH
    ("hugone", "Hug one"),              # CU, LOW angle, him RIGHT: he hugs one trunk again, a squeeze
    ("all", "you've hugged"),           # WIDE, HIGH angle: every trunk in the forest opens its eyes and looks at him; blush,
                                        # hearts over the canopy (the running device, beat 2)
    ("valley", "That's why"),           # WHIP. EXTREME WIDE: the mountainside in autumn light, aspen patches turning one by
                                        # one at different times among dark firs; the clone outlined: PANDO
    ("flip", "forest turns"),           # WIDE, a slow push on the clone (the longest shot): full silence, then on "SAME" the
                                        # whole clone flips to gold at once (hitstop, the biggest hit); its neighbours stay green
    ("gold", "time."),                  # CU, LOW angle, him LEFT under the gold canopy: leaves raining, his mouth open
    ("weigh", "It weighs"),             # WHIP. WIDE, LOW angle: a giant balance in a meadow, the whole forest on the left pan
                                        # with its roots; cut_tonnes: CLOSER, the pan slams down: ~6,000 TONNES
    ("whales", "forty blue"),           # MEDIUM, the right pan: blue whales drop in one after another, the beam levels: 40
    ("bark", "of tree"),                # CU: one whale with white aspen bark and black eye scars, a tuft of leaves; it blinks
    ("button", "So, tree"),             # MEDIUM-WIDE, eye level: he spreads his arms to hug the whole forest, they stretch
                                        # round trunk after trunk; cut_arms: CU, the arms twang back, the trunks' eyes on him
    ("loop", None),                     # the hook's picture again (frame 0): the loop
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "This whole forest / you're standing in...",
    "is ONE tree.",
    "The real tree",
    "is UNDERGROUND.",
    "Every trunk / is just",
    "a sprout...",
    "about forty-seven THOUSAND",
    "of them.",
    "Same roots,",
    "same DNA.",
    "Hug one...",
    "you've hugged / them ALL.",
    "That's why / each autumn...",
    "the whole",
    "forest / turns gold",
    "at the SAME",
    "time.",
    "It weighs about / six thousand",
    "TONNES...",
    "forty blue whales...",
    "of tree.",
    "So, tree huggers?",
    "You'll need / longer arms.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
COLOR = {"forest": G, "one": Y, "underground": O, "sprout": G, "47,000": Y, "roots": O, "dna": C, "all": PK,
         "autumn": O, "gold": Y, "same": Y, "time": Y, "6,000": R, "tonnes": R, "40": B, "whales": B, "tree": G,
         "huggers": PK, "arms": Y}
DISPLAY = {"about forty-seven thousand": ["ABOUT", "47,000"], "six thousand": ["6,000"],
           "forty blue whales": ["40", "BLUE", "WHALES..."]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

W, E, ev, find = T.W, T.E, T.ev, T.find
special["loop"] = E("arms") + 0.05             # the last ~0.65 s: the hook's picture again (the loop)
shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

_st = {s_["id"]: s_["start"] for s_ in shots}
_en = {s_["id"]: s_["end"] for s_ in shots}
_t2 = find("The real tree")
_f2 = find("the whole forest turns")
cues = {
    "this": W("This"), "whole": W("whole"), "forest": W("forest"), "standing": W("standing"), "in_end": E("in"),
    "is1": W("is ONE"), "one": W("ONE"), "one_end": E("ONE"), "tree1": W("tree"), "tree1_end": E("tree"),
    "the": W("The real"), "real": W("real"), "tree2": W("tree", 0, _t2), "tree2_end": E("tree", 0, _t2),
    "is2": W("is UNDERGROUND"), "under": W("UNDERGROUND"), "under_end": E("UNDERGROUND"),
    "every": W("Every"), "trunk": W("trunk"), "just": W("just"), "sprout": W("sprout"), "sprout_end": E("sprout"),
    "about": W("about forty-seven"), "fortyseven": W("forty-seven"), "fortyseven_end": E("forty-seven"),
    "thousand": W("THOUSAND"), "thousand_end": E("THOUSAND"), "them": W("of them", 1), "them_end": E("of them", 1),
    "same1": W("Same roots"), "roots": W("roots"), "roots_end": E("roots"), "same2": W("same DNA"), "dna": W("DNA"),
    "dna_end": E("DNA"), "hug": W("Hug one"), "one2": W("Hug one", 1), "one2_end": E("Hug one", 1),
    "youve": W("you've"), "hugged": W("hugged"), "all": W("ALL"), "all_end": E("ALL"),
    "thats": W("That's why"), "autumn": W("autumn"), "autumn_end": E("autumn"), "whole2": W("whole", 0, _f2),
    "forest2": W("forest", 0, _f2), "turns": W("turns"), "gold": W("gold"), "gold_end": E("gold"),
    "at": W("at the SAME"), "same3": W("SAME", 0, find("at the SAME") + 2), "same3_end": E("SAME", 0, find("at the SAME") + 2), "time": W("time"), "time_end": E("time"),
    "it": W("It weighs"), "weighs": W("weighs"), "six": W("six"), "thousand2": W("thousand", 0, find("six thousand")),
    "tonnes": W("TONNES"), "tonnes_end": E("TONNES"), "forty": W("forty blue"), "blue": W("blue"), "whales": W("whales"),
    "whales_end": E("whales"), "of": W("of tree"), "tree3": W("of tree", 1), "tree3_end": E("of tree", 1),
    "so": W("So, tree"), "huggers": W("huggers"), "huggers_end": E("huggers"), "youll": W("You'll"), "need": W("need"),
    "longer": W("longer"), "arms": W("arms"), "arms_end": E("arms"),
}
_order = ["this", "whole", "forest", "standing", "in_end", "is1", "one", "one_end", "tree1", "tree1_end", "the", "real",
          "tree2", "tree2_end", "is2", "under", "under_end", "every", "trunk", "just", "sprout", "sprout_end", "about",
          "fortyseven", "fortyseven_end", "thousand", "thousand_end", "them", "them_end", "same1", "roots",
          "roots_end", "same2", "dna", "dna_end", "hug", "one2", "one2_end", "youve", "hugged", "all", "all_end",
          "thats", "autumn", "autumn_end", "whole2", "forest2", "turns", "gold", "gold_end", "at", "same3",
          "same3_end", "time", "time_end", "it", "weighs", "six", "thousand2", "tonnes", "tonnes_end", "forty",
          "blue", "whales", "whales_end", "of", "tree3", "tree3_end", "so", "huggers", "huggers_end", "youll", "need",
          "longer", "arms", "arms_end"]
assert all(cues[a_] < cues[b_] for a_, b_ in zip(_order, _order[1:])), [(a_, cues[a_]) for a_ in _order]
cues["end"] = T.duration
cues["loop"] = _st["loop"]
# the running device: the trunks' eyes. Beat 1 (the hook): the bark eye above him peeks open at him and shuts again.
cues["peek"] = cues["forest"] + 0.10
cues["peek_end"] = cues["in_end"] - 0.05
cues["lasso"] = cues["one"] - 0.04             # the glowing outline runs round the whole forest
cues["tag1"] = cues["one_end"] + 0.02          # 1 TREE pops
cues["ff"] = max(4.02, cues["tree1_end"] + 0.06)   # the flash-forward: the clone flipping gold (the payoff's picture)
cues["look"] = cues["tree2"] - 0.05            # he looks down at his feet
cues["open"] = cues["under"] + 0.04            # the ground slices open
cues["glow"] = cues["under"] + 0.22            # the light runs out along the roots from under him
cues["lift"] = cues["under"] + 0.45            # he lifts one foot off the glowing root
cues["pop"] = cues["trunk"] + 0.39             # a sprout pops through the soil beside him (in the pause after "trunk")
cues["grown"] = cues["sprout"] + 0.02           # ...and has shot up into a full trunk
cues["tag2"] = cues["sprout"] + 0.06           # the SPROUT tag slaps onto the giant trunk
cues["cut_thou"] = cues["thousand"] - 0.07     # the count jumps wider as it lands
cues["count_end"] = cues["thousand_end"]       # the counter lands on 47,000
cues["scan1"] = cues["roots"] - 0.05           # the root under both trunks lights
cues["match"] = cues["dna"] + 0.05             # MATCH on both trunks
cues["squeeze"] = cues["one2"] + 0.05          # the squeeze
cues["eyes"] = cues["all"] - 0.04              # every trunk's eyes open at once (beat 2)
cues["hearts"] = cues["all_end"] + 0.02
cues["season"] = cues["thats"] + 0.10          # the light warms into autumn
cues["p1"] = cues["autumn"] + 0.05             # a neighbour patch turns yellow
cues["p2"] = cues["autumn_end"] + 0.30         # another, later, orange
cues["outline"] = cues["whole2"] - 0.02        # the clone is outlined: PANDO
cues["flipgold"] = cues["same3"] + 0.02        # the whole clone flips to gold at once, on "SAME"
cues["boom"] = cues["same3_end"] + 0.02         # ...and its sound, the biggest hit, in the pause after the word
cues["rain"] = cues["time"] - 0.05             # leaves rain on him
cues["slam"] = cues["tonnes"] + 0.06           # the forest's pan slams down
cues["cut_tonnes"] = cues["tonnes"] - 0.07
cues["drop0"] = cues["forty"] - 0.05           # the whales start dropping in
cues["level"] = cues["whales_end"] - 0.05      # the beam levels
cues["barkon"] = cues["of"] - 0.02             # the whale turns to bark
cues["blink"] = cues["tree3_end"] + 0.05       # the bark whale blinks its aspen eyes
cues["stretch"] = cues["so"] + 0.10            # his arms start to stretch round the trunks
cues["cut_arms"] = cues["youll"] - 0.06
cues["twang"] = cues["arms_end"] - 0.12        # the arms twang back as the last word ends (its sound right after it)
cues["side_eye"] = cues["need"]                # the trunks' eyes on him (beat 3)

CAMERA = {
    "hand": {"hook": 0.25, "rise": 0.2, "answer": 0.3, "roots": 0.3, "sprout": 0.35, "count": 0.2, "dna": 0.3,
             "hugone": 0.3, "all": 0.25, "valley": 0.18, "flip": 0.18, "gold": 0.35, "weigh": 0.3, "whales": 0.4,
             "bark": 0.3, "button": 0.35, "loop": 0.25},
    "whip": [[_st["valley"], -1], [_st["weigh"], 1]],
    "punch": [[cues["squeeze"] - 0.02, 1.15, _en["hugone"] - 0.02], [cues["cut_arms"] + 0.30, 1.15, _en["button"] - 0.02]],
    "tilt": [[cues["slam"], _en["weigh"] - 0.02, 3.0]],
    "hit": [[cues["under_end"] + 0.04, 4]],     # after the answer's punch word: the whole root network lit
    "act": {"brow": [cues["look"], cues["sprout"], cues["match"], cues["twang"]]},
    "mood": [[0, "day"], [cues["open"], "warm"], [_st["sprout"], "day"], [cues["season"], "warm"],
             [_st["weigh"], "day"]],
    "fg": {"hook": "leaves-tr", "answer": "grass-b", "sprout": "leaves-tl", "dna": "grass-b", "hugone": "leaves-tl",
           "gold": {"kind": "leaves-tr", "col": "#8A5A10", "lit": "#F0B030"}, "button": "grass-b", "loop": "leaves-tr",
           },
    "air": {"hook": {"kind": "pollen", "amount": 0.5}, "rise": {"kind": "pollen", "amount": 0.3},
            "answer": {"kind": "pollen", "amount": 0.45}, "roots": {"kind": "sparkle", "amount": 0.35},
            "sprout": {"kind": "dust", "amount": 0.4}, "dna": {"kind": "pollen", "amount": 0.4},
            "hugone": {"kind": "pollen", "amount": 0.5}, "all": {"kind": "sparkle", "amount": 0.3},
            "valley": {"kind": "dust", "amount": 0.25}, "gold": {"kind": "dust", "amount": 0.5},
            "weigh": {"kind": "dust", "amount": 0.35}, "whales": {"kind": "spray", "amount": 0.35},
            "button": {"kind": "pollen", "amount": 0.45}, "loop": {"kind": "pollen", "amount": 0.5}},
    "flash": [[cues["ff"], 0.5, cues["flipgold"] + 0.35, {}]],
}
T.write(shots, caps, cues, camera=CAMERA)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (this slot: the SHORT arm, 30-35 s, from publish.json "length")')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the impossible claim, put to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s_ in shots:
    print(f'  {s_["id"]:9s} {s_["start"]:6.2f} -> {s_["end"]:6.2f}  ({s_["end"] - s_["start"]:.2f} s)')
