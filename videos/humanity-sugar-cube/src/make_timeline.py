"""Edit timeline for the All of HUMANITY Fits in a Sugar Cube ☕ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop. The tight
#                                      rules (5 Nov 2026): 25-30 s, the last line runs straight into the first and nothing
#                                      comes after it (qa.py: at most 1.0 s).

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),             # frame 0, tight: the trail cafe at dusk; his face close, his hand holding silver sugar tongs
                                # with ONE sugar cube over a steaming mug; he lowers it... and stops: squints at the cube
    ("answer", "All of them,"), # whip: a low angle from his other side, a little wider; "All of them,": he yanks the cube
                                # away at arm's length; "mostly...": he looks down at himself; "nothing.": he pats his chest
                                # and a puff of pink cotton-candy fluff POOFS out of his coat (punch-in on his face)
    ("atom", "Every atom"),     # a high macro over his open palm: the skin fizzes into fluff; ONE pink cotton-candy ball
                                # swells out of it, his face above it; "All fluff...": his fingertip pokes it, it squishes;
                                # "one tiny speck.": the camera pushes to its middle: a tiny gold speck, labelled
    ("squash", "Squash"),       # his two hands, close, eye level: CLAP, the ball squashes flat... to a bead
    ("world", "and all eight"), # whip: the money shot, wide and high: the whole world's crowd to a curved horizon under the
                                # stars; "8 BILLION" counts up; giant silver tongs come down, pinch, and the crowd zips
                                # into ONE glowing cube between their tips on "fit..."
    ("cube", "in one cube."),   # back in the cafe, low at the table: the cube drops onto his saucer: CLINK, in the gap
    ("weird", "Just you?"),     # whip: a high angle, his face left and the cafe's bean scale right; "Just you?": he points
                                # at himself; "A speck too small to see...": the magnifier shows ONE speck on the scale,
                                # labelled YOU; "as much as you.": the display rolls to 62 kg and the plate CRUNCHES down
    ("button", "Still want"),   # back to frame 1's framing: he picks the cube up with the tongs and holds it over the mug
    ("loop", None),             # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Guess how many / people fit", "in your / sugar cube.",
    "All of them,", "because you're / mostly...", "nothing.",
    "Every atom / in you", "is cotton candy.", "All fluff...", "one tiny speck.",
    "Squash out / the fluff,",
    "and all eight / billion of us", "would fit...",
    "in one cube.",
    "Just you?", "A speck too / small to see...", "that still / weighs as much", "as you.",
    "Still want sugar?",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"people": Y, "sugar": S, "cube": S, "all": Y, "them": Y, "nothing": V, "atom": B, "cotton": PK, "candy": PK,
         "fluff": PK, "tiny": C, "speck": Y, "squash": O, "8": Y, "billion": Y, "one": G, "you": O, "small": C,
         "weighs": R}
DISPLAY = {"and all eight": ["AND", "ALL", "8"]}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, find = T.W, T.E, T.find
iA = find("All of them,")
iF = find("All fluff")
iS = find("Squash")
iW = find("Just you?")
iWo = find("would fit")
iB = find("Still want")
cues = {
    # the hook
    "guess": W("Guess"), "how": W("how"), "people": W("people"), "fit1": W("fit in"), "your": W("your"),
    "sugar1": W("sugar cube."), "cube1": W("cube."), "cube1_end": E("cube."),
    # the answer
    "all1": W("All", s=iA), "them": W("them,"), "them_end": E("them,"), "because": W("because"), "mostly": W("mostly..."),
    "mostly_end": E("mostly..."), "nothing": W("nothing."), "nothing_end": E("nothing."),
    # the atom
    "every": W("Every"), "atom": W("atom"), "in_you": W("in you"), "cotton": W("cotton"), "candy": W("candy."),
    "candy_end": E("candy."), "all2": W("All", s=iF), "fluff1": W("fluff...", s=iF), "fluff1_end": E("fluff...", s=iF),
    "one1": W("one tiny"), "tiny": W("tiny"), "speck1": W("speck."), "speck1_end": E("speck."),
    # the squash
    "squash": W("Squash"), "out": W("out the"), "fluff2": W("fluff,", s=iS), "fluff2_end": E("fluff,", s=iS),
    # the world
    "and": W("and all eight"), "eight": W("eight"), "billion": W("billion"), "us": W("us would"), "would": W("would"),
    "fit2": W("fit...", s=iWo), "fit2_end": E("fit...", s=iWo),
    # the cube
    "in_one": W("in one cube."), "one2": W("one cube."), "cube2": W("cube.", s=iS), "cube2_end": E("cube.", s=iS),
    # the weird fact
    "just": W("Just", s=iW), "you1": W("you?", s=iW), "you1_end": E("you?", s=iW), "a_sp": W("A speck"), "speck2": W("speck too"),
    "too": W("too"), "small": W("small"), "see": W("see..."), "see_end": E("see..."), "that": W("that still"),
    "still1": W("still weighs"), "weighs": W("weighs"), "as1": W("as much"), "much": W("much"), "you2": W("as you.", 1, s=iW),
    "you2_end": E("as you.", 1, s=iW),
    # the button
    "still2": W("Still", s=iB), "want": W("want"), "sugar2": W("sugar?", s=iB), "sugar2_end": E("sugar?", s=iB),
}
cues["loop_in"] = round(T.duration - 0.40, 3)
# the gags, each on its beat (frames are seconds x 30)
cues["poof"] = round(cues["nothing"] + 0.10, 3)                       # the pat on his chest: fluff poofs out
cues["swell"] = round(cues["cotton"] - 0.05, 3)                       # the ball swells out of his palm
cues["poke"] = round(cues["fluff1"] + 0.06, 3)                        # his fingertip pokes the fluff: it squishes
cues["clap"] = round(cues["squash"] + 0.10, 3)                        # his hands clap the ball flat
cues["bead"] = round(cues["fluff2_end"] + 0.05, 3)                    # ...to a bead
cues["tongs_in"] = round(cues["us"] - 0.10, 3)                        # the giant tongs come down over the crowd
cues["pinch"] = round(cues["fit2"] - 0.06, 3)                         # they pinch: the crowd zips in
cues["formed"] = round(cues["fit2_end"] + 0.06, 3)                    # one glowing cube between the tips
cues["clink"] = round(cues["cube2_end"] + 0.08, 3)                    # the cube lands on his saucer: CLINK (in the gap)
cues["point"] = round(cues["just"] - 0.06, 3)                         # he points at himself
cues["glass"] = round(cues["a_sp"] - 0.10, 3)                         # the magnifier slides over the scale
cues["count"] = round(cues["weighs"] - 0.02, 3)                       # the display starts rolling up
cues["crunch"] = round(cues["you2"] + 0.04, 3)                        # 62 kg: the plate crunches down, the table creaks
cues["pickup"] = round(cues["still2"] - 0.08, 3)                      # he picks the cube up with the tongs again
_order = ["guess", "how", "people", "fit1", "your", "sugar1", "cube1", "cube1_end", "all1", "them", "them_end", "because",
          "mostly", "mostly_end", "nothing", "poof", "nothing_end", "every", "atom", "in_you", "swell", "cotton", "candy",
          "candy_end", "all2", "fluff1", "poke", "fluff1_end", "one1", "tiny", "speck1", "speck1_end", "squash", "clap",
          "out", "fluff2", "fluff2_end", "bead", "and", "eight", "billion", "tongs_in", "us", "would", "pinch", "fit2",
          "fit2_end", "formed", "in_one", "one2", "cube2", "cube2_end", "clink", "point", "just", "you1", "you1_end",
          "glass", "a_sp", "speck2", "too", "small", "see", "see_end", "that", "still1", "count", "weighs", "as1", "much",
          "you2", "crunch", "you2_end", "pickup", "still2", "want", "sugar2", "sugar2_end", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
_st = {s_["id"]: s_["start"] for s_ in shots}
CAMERA = {
    # handheld: calm on the hook, tense on the squeeze and the crunch, the hook's amount on the loop
    "hand": {"hook": 0.25, "answer": 0.3, "atom": 0.25, "squash": 0.35, "world": 0.4, "cube": 0.3, "weird": 0.35,
             "button": 0.25, "loop": 0.25},
    # whips at the story turns: into the answer, out to the whole world, into the weird fact
    "whip": [[_st["answer"], -1], [_st["world"], 1], [_st["weird"], -1]],
    # punch-ins on the punchline ("nothing", on his face) and on the sting ("as much as you", his wince)
    "punch": [[cues["nothing"] - 0.03, 1.2, cues["nothing_end"] + 0.3], [cues["you2"] - 0.04, 1.18]],
    # a dutch tilt on the crunch
    "tilt": [[cues["crunch"] - 0.02, cues["you2_end"] + 0.5, -3.0]],
    # the light follows the stakes: the warm cafe, a chill on "nothing", the spot on the speck, night for the whole
    # world, warm again for the clink, a shade on the crunch, back to frame 1's warm for the button
    "mood": [[0, "warm"], [cues["nothing"] - 0.05, "cold"], [cues["one1"] - 0.1, "spot"], [_st["world"], "night"],
             [_st["cube"], "warm"], [cues["you2"] - 0.05, "shade"], [cues["still2"] - 0.15, "warm"]],
    # depth: lamp bokeh and the window post indoors (alternating sides), never over his face or the captions
    "fg": {"answer": "post-r", "atom": {"kind": "bokeh-l", "col": "#FFC979"}, "cube": {"kind": "bokeh-r", "col": "#FFC979"},
           "weird": "post-l"},
    "air": {"hook": {"kind": "dust", "amount": 0.5}, "answer": "dust", "atom": "sparkle", "squash": "dust",
            "world": {"kind": "sparkle", "amount": 0.8}, "cube": "dust", "weird": "dust",
            "button": {"kind": "dust", "amount": 0.5}, "loop": {"kind": "dust", "amount": 0.5}},
}
T.write(shots, caps, cues, camera=CAMERA)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the hook: "you"/"your" in the first eight words)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print("shots: " + ", ".join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
