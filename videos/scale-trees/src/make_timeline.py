"""Edit timeline for the The Tree That Wore SNAKESKIN (Then Became Coal) 🐍 Short.

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
    ("hook", None),            # THE CURIOUS KIND (story.md §6): the guess. Frame 0: his hand flat on diamond-scaled bark, close;
                               # a leaf flicks out like a tongue in the pause after "snake"; on "TREE?" the camera cranes up the
                               # whole trunk to the crown; on "A tree." it pulls back until the 40 m tree stands whole, him tiny at
                               # its foot; on "wearing snakeskin" it comes back down to him (one continuous shot, no cut)
    ("leaf", "Every diamond"), # the young pole tree beside him: he plucks a leaf, POP, a fresh diamond
    ("swamp", "Three hundred million"),  # the swamp, 300 MILLION YEARS AGO: the trees topple into the water; one lands by him
    ("coal", "got buried"),    # the cutaway: layers pile on, he stomps, the peat squashes into a glossy black seam: COAL
    ("trains", "Steam trains"),  # a steam engine's cab: he shovels a lump with diamonds on it; "TON": a chute buries him
    ("mine", "And miners"),    # a coal mine, his headlamp on the ceiling: stump bottoms (KETTLEBOTTOMS); one wiggles... BONK
    ("button", "Snake tree coal"),  # dazed by the fallen stump, he counts its career on his fingers; "What a career." a pat; the
                                    # camera pushes into its diamonds and lands on frame 0 (the loop). The pill arm: the silent
                                    # pill over the last 2.4 s (timeline_lib.py); his face and hands stay above y 1050
]
special = {}

CHUNKS = [
    "Is this / a snake",
    "or a TREE?",
    "You've got / two seconds.",
    "A tree.",
    "Forty metres / tall...",
    "wearing / snakeskin.",
    "Every diamond",
    "is where / a leaf fell off.",
    "Three hundred million / years ago,",
    "whole swamps / of them fell over...",
    "got buried...",
    "and squashed / into COAL.",
    "Steam trains / burned them...",
    "by the TON.",
    "And miners / still find",
    "their stumps / in the ceiling...",
    "and sometimes,",
    "they FALL.",
    "Snake, tree,",
    "coal...",
    "ceiling / hazard.",
    "What a career.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"snake": V, "tree": G, "snakeskin": V, "diamond": Y, "leaf": G, "300": Y, "million": Y, "40": Y, "metres": Y,
         "coal": O, "ton": O, "stumps": Y, "ceiling": C, "fall": R, "hazard": R, "career": Y}
DISPLAY = {"forty metres": ["40", "METRES"], "three hundred million": ["300", "MILLION"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
sh = {s["id"]: s for s in shots}
i_tree2 = find("A tree", find("two seconds"))
i_snake2 = find("Snake tree coal")
cues = {
    # the hook: the guess
    "is": W("Is this"), "snake": W("a snake", 1), "snake_end": E("a snake", 1), "or": W("or a TREE"), "tree": W("TREE"),
    "tree_end": E("TREE"), "youve": W("You've got"), "two": W("two seconds"), "seconds_end": E("two seconds", 1),
    # the answer: pull back to the whole tree, then back down to him
    "a_tree": W("A tree", 0, i_tree2), "a_tree_end": E("A tree", 1, i_tree2), "forty": W("Forty"), "metres": W("metres"),
    "tall_end": E("tall"), "wearing": W("wearing"), "snakeskin": W("snakeskin"), "snakeskin_end": E("snakeskin"),
    # the leaf
    "every": W("Every diamond"), "diamond": W("diamond"), "where": W("where a leaf"), "leaf": W("a leaf fell", 1),
    "fell1": W("fell off"), "off_end": E("fell off", 1),
    # the swamp
    "three": W("Three hundred"), "million": W("million years"), "ago_end": E("years ago", 1), "whole": W("whole swamps"),
    "swamps": W("swamps"), "fell2": W("fell over"), "over": W("over"), "over_end": E("over"),
    # the coal
    "got": W("got buried"), "buried": W("buried"), "buried_end": E("buried"), "squashed": W("squashed"), "into": W("into COAL"),
    "coal": W("COAL"), "coal_end": E("COAL"),
    # the trains
    "steam": W("Steam trains"), "trains_w": W("trains burned", 0), "burned": W("burned"), "them_end": E("burned them", 1),
    "by": W("by the TON"), "ton": W("TON"), "ton_end": E("TON"),
    # the mine
    "miners": W("miners"), "still": W("still find"), "stumps": W("stumps"), "ceiling1": W("ceiling"), "ceiling1_end": E("ceiling"),
    "sometimes": W("sometimes"), "sometimes_end": E("sometimes"), "they": W("they FALL"), "fall": W("FALL"), "fall_end": E("FALL"),
    # the button
    "b_snake": W("Snake", 0, i_snake2), "b_tree": W("tree coal", 0, i_snake2), "b_coal": W("coal ceiling", 0, i_snake2),
    "b_ceiling": W("ceiling hazard", 0, i_snake2), "hazard": W("hazard"), "hazard_end": E("hazard"), "what": W("What a career"),
    "career": W("career"), "career_end": E("career"),
}
order = ["is", "snake", "snake_end", "or", "tree", "youve", "seconds_end", "a_tree", "forty", "tall_end", "wearing", "snakeskin",
         "snakeskin_end", "every", "diamond", "leaf", "fell1", "off_end", "three", "million", "whole", "fell2", "over_end", "got",
         "buried", "squashed", "coal", "coal_end", "steam", "burned", "them_end", "by", "ton", "ton_end", "miners", "stumps",
         "ceiling1", "ceiling1_end", "sometimes", "they", "fall", "fall_end", "b_snake", "b_tree", "b_coal", "b_ceiling", "hazard",
         "what", "career", "career_end"]
for x, y in zip(order, order[1:]):
    assert cues[x] <= cues[y] + 1e-6, f"cue order: {x} {cues[x]:.2f} > {y} {cues[y]:.2f}"
# beats that are not words
cues["flick"] = cues["snake_end"] + 0.04            # the leaf-tongue flicks out in the pause after "snake"
cues["thumb"] = cues["snakeskin_end"] + 0.05        # his approving nod and thumbs-up after "snakeskin."
cues["pop"] = cues["off_end"] + 0.03                # the plucked leaf comes off: POP, a fresh diamond
cues["topple"] = [cues["whole"] - 0.1, cues["swamps"] + 0.05, cues["fell2"] - 0.05, cues["over"] - 0.02, cues["over"] + 0.18]
cues["crash"] = cues["over_end"] + 0.02             # the near tree hits the water beside him
cues["stomp"] = [cues["squashed"] - 0.02, cues["squashed"] + 0.28, cues["into"] - 0.02]
cues["glint"] = cues["coal_end"] + 0.03             # the seam turns glossy black: a glint
cues["shovel"] = cues["burned"] - 0.05              # a lump with diamonds on it into the fire
cues["whoosh_fire"] = cues["them_end"] + 0.02
cues["dump"] = cues["ton_end"] + 0.02               # the chute buries him in coal
cues["wiggle"] = cues["sometimes"] + 0.05           # a stump in the ceiling starts to wiggle (dust trickles)
cues["drop"] = cues["fall_end"] - 0.10              # it lets go...
cues["bonk"] = cues["fall_end"] + 0.10              # ...BONK on his hard hat (after the word)
cues["pat"] = cues["career_end"] + 0.05             # a respectful pat on the stump
cues["loop0"] = T.duration - 0.48                   # the push into its diamonds; the last frame is frame 0
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
