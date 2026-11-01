"""Edit timeline for the Earth Has More TREES Than Our Galaxy Has STARS 🌲 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Every Short is 30-35 s since 16 Oct 2026: keep it short,
#                                      so the loop comes before the thumb does.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),        # THE CURIOUS KIND (story.md §6): the claim, said to "you" while frame 0 already shows it. Frame 0: him
                           # close on a bald hilltop at night, his right hand up by his face clicking a tally counter at the Milky
                           # Way (click, click). On "trees" the camera eases back and the forest below the hill shows; on "galaxy"
                           # it tilts up into the Milky Way; on "STARS" every star flares at once; on "And it's not close." it
                           # comes back down to him and he looks from the sky to the forest (one continuous shot)
    ("score", "Trees win"),  # wide: a stadium SCOREBOARD rises out of the forest, the trees do the wave, TREES 7 : STARS 1 flips in
                             # on SEVEN and one; his clicker slips out of his hand after "one" (clunk)
    ("give", "Give every"),  # the stars pour out of the sky and land on the treetops as glowing toppers, row after row; the last one
                             # bonks onto HIS head after "tree..." (he squints up at it)
    ("left", "and over two"),  # the little sapling beside him has none (it droops); the camera cranes up and back: the lit patch is
                               # a small island in a dark sea of trees to the curved horizon: 2 TRILLION+ STILL WAITING
    ("tie", "Funny thing"),  # space: Earth's limb, a satellite squints down (its lens zooms): 400 BILLION TREES?; a balance pops up,
                             # a tree on one pan and a star on the other, level: TIE?
    ("ground", "Then someone"),  # the dive from orbit to the forest floor by day: him in a roped-off plot with a clipboard, clicking
                                 # every trunk; on "GROUND" he slaps his palm on a trunk; 430,000 PLOTS
    ("three", "Three TRILLION"),  # the pull back from his plot, past thousands of plots, to the whole Earth: 3 TRILLION slams in and
                                  # knocks the satellite's 400 BILLION away; "before farming?" the land greens over: ALMOST 2x
    ("button", "So stargazers"),  # back on the hilltop, clicking at the sky; "looking the wrong way" a pine branch taps his shoulder,
                                  # he glances back at it... and goes straight back to clicking; the camera lands on frame 0 (the loop).
                                  # No pill: this Short is in the pill test's no-pill arm (7 Nov 11:30)
]
special = {}

CHUNKS = [
    "Your planet / has more trees",
    "than your galaxy",
    "has STARS.",
    "And it's / not close.",
    "Trees win...",
    "at least / SEVEN",
    "to one.",
    "Give every star",
    "in the / Milky Way",
    "its own tree...",
    "and over / two TRILLION",
    "trees still / don't get one.",
    "Funny thing?",
    "Scientists / used to think",
    "it was / about a TIE.",
    "Then someone / counted...",
    "from the / GROUND.",
    "Three / TRILLION.",
    "And before / farming?",
    "Almost / double that.",
    "So, stargazers...",
    "you've been looking",
    "the wrong way.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"trees": G, "tree": G, "stars": Y, "star": Y, "galaxy": V, "milky": V, "way": V, "seven": G, "7": G, "one": Y, "1": Y,
         "trillion": G, "2": G, "tie": C, "ground": O, "3": G, "farming": O, "double": G, "stargazers": Y, "wrong": R}
DISPLAY = {"seven": ["7"], "one": ["1"], "two trillion": ["2", "TRILLION"], "three trillion": ["3", "TRILLION"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_one = find("to one")
i_stars = find("has STARS")
cues = {
    # the hook
    "your": W("Your planet"), "planet": W("planet"), "trees1": W("more trees", 1), "trees1_end": E("more trees", 1),
    "than": W("than your"), "galaxy": W("galaxy"), "stars1": W("STARS", 0, i_stars), "stars1_end": E("STARS", 0, i_stars),
    "and1": W("And it's not"), "close": W("close"), "close_end": E("close"),
    # the score
    "trees_win": W("Trees win"), "win": W("win"), "win_end": E("win"), "least": W("at least", 1), "seven": W("SEVEN"),
    "seven_end": E("SEVEN"), "to": W("to one", 0, i_one), "one": W("one", 0, i_one), "one_end": E("one", 0, i_one),
    # the give
    "give": W("Give every"), "every": W("every star", 0), "star": W("star in", 0), "milky": W("Milky"), "way1": W("Way its"),
    "its": W("its own"), "own": W("own tree"), "tree_end": E("own tree", 1),
    # the left
    "and2": W("and over two"), "two": W("two TRILLION"), "trillion1": W("TRILLION trees"), "trees2": W("trees still"),
    "still": W("still don't"), "dont": W("don't get"), "get_one": W("get one"), "one2_end": E("get one", 1),
    # the tie
    "funny": W("Funny thing"), "thing_end": E("thing"), "scientists": W("Scientists"), "used": W("used to think"),
    "think": W("think it"), "about": W("about a TIE"), "tie": W("TIE"), "tie_end": E("TIE"),
    # the ground
    "then": W("Then someone"), "someone": W("someone"), "counted": W("counted"), "counted_end": E("counted"),
    "from": W("from the GROUND"), "ground": W("GROUND"), "ground_end": E("GROUND"),
    # the three
    "three": W("Three TRILLION"), "trillion2": W("TRILLION And"), "trillion2_end": E("TRILLION And"), "and3": W("And before"),
    "before": W("before farming"), "farming": W("farming"), "farming_end": E("farming"), "almost": W("Almost double"),
    "double": W("double"), "that_end": E("double that", 1),
    # the button
    "so": W("So stargazers"), "stargazers": W("stargazers"), "stargazers_end": E("stargazers"), "youve": W("you've been"),
    "looking": W("looking the"), "wrong": W("wrong way"), "way2": W("wrong way", 1), "way2_end": E("wrong way", 1),
}
order = ["your", "planet", "trees1", "trees1_end", "than", "galaxy", "stars1", "stars1_end", "and1", "close", "close_end",
         "trees_win", "win", "win_end", "least", "seven", "seven_end", "to", "one", "one_end", "give", "every", "star", "milky",
         "way1", "its", "own", "tree_end", "and2", "two", "trillion1", "trees2", "still", "dont", "get_one", "one2_end", "funny",
         "thing_end", "scientists", "used", "think", "about", "tie", "tie_end", "then", "someone", "counted", "counted_end", "from",
         "ground", "ground_end", "three", "trillion2", "trillion2_end", "and3", "before", "farming", "farming_end", "almost",
         "double", "that_end", "so", "stargazers", "stargazers_end", "youve", "looking", "wrong", "way2", "way2_end"]
for x, y in zip(order, order[1:]):
    assert cues[x] <= cues[y] + 1e-6, f"cue order: {x} {cues[x]:.2f} > {y} {cues[y]:.2f}"
# beats that are not words
# his thumb on the counter: a steady click through the hook (4 a second), stopping when he looks down at the forest
_c, _t = [], 0.0
while _t < cues["and1"] - 0.1:
    _c.append(round(_t, 3)); _t += 0.26
cues["click"] = _c
cues["shimmer"] = cues["stars1"] + 0.06              # every star flares at once on "STARS"
cues["board"] = cues["trees_win"] - 0.02             # the scoreboard shoots up out of the forest
cues["wave"] = cues["win"] + 0.05                    # the trees do the wave
cues["flip7"] = cues["seven"] + 0.10                 # TREES 7 flips in
cues["flip1"] = cues["one"] + 0.08                   # STARS 1 flips in
cues["drop"] = cues["one_end"] + 0.05                # his counter slips out of his hand
cues["clunk"] = cues["drop"] + 0.24                  # ...and lands in the grass (before "Give")
cues["pour"] = cues["give"] + 0.05                   # the stars start to fall
cues["bonk"] = cues["tree_end"] + 0.05               # the last star lands on his head (after "tree...")
cues["crane"] = cues["two"] - 0.05                   # the camera cranes up and back
cues["tag2"] = cues["trillion1"] + 0.10              # 2 TRILLION+ STILL WAITING
cues["squint"] = cues["thing_end"] + 0.02            # the satellite's lens zooms in (after "thing?")
cues["readout"] = cues["scientists"] + 0.10          # 400 BILLION TREES?
cues["scale"] = cues["about"] - 0.05                 # the balance pops up
cues["level"] = cues["tie_end"] + 0.04               # it settles level: TIE?
cues["dive"] = cues["then"] - 0.04                   # the dive from orbit to the forest floor
cues["counts"] = [cues["counted"] + 0.05 + 0.22 * i for i in range(5)]   # click, click... as he walks the plot
cues["slap"] = cues["ground_end"] + 0.02             # his palm on a trunk (in the pause after "GROUND.")
cues["plots"] = cues["counted"] + 0.30               # 430,000 PLOTS, while he counts
cues["pull"] = cues["three"] - 0.06                  # the pull back to the whole Earth
cues["slam"] = cues["trillion2_end"] + 0.03          # 3 TRILLION slams in (after the word), the 400 BILLION gets knocked away
cues["green"] = cues["before"] + 0.05                # the land greens over (before farming)
cues["x2"] = cues["that_end"] + 0.03                 # ALMOST 2x (after "that.")
cues["tap"] = [cues["looking"] - 0.05, cues["looking"] + 0.18]   # a branch taps his shoulder
cues["glance"] = cues["wrong"] - 0.10                # he glances back at the tree
cues["back"] = cues["way2_end"] + 0.12               # ...and goes straight back to clicking
cues["loop0"] = T.duration - 0.45                    # the push to frame 0's picture
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s
# before the end) and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says
# "subscribe" in either arm; the ask also lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
