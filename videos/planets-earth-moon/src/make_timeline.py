"""Edit timeline for the Could Every PLANET Fit Between You and the Moon? 🌕 Short.

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
# The world (pe_world.js): the seven planets stacked from Earth (bottom) up to the Moon (top) at true scale (NASA's
# equatorial diameters, 0.004 world units a km), the Moon at its farthest; the hero in jupiter-no-ground's spacesuit,
# drawn as a cosmic-sized stand-in who handles planets like bowling balls.
SHOTS = [
    ("hook", None),                 # tight on him shoving Neptune (in a nightcap) into the last slot under the Moon; CLICK in
                                    # the gap before "Yep!"; then ONE move: the pull-back down the whole tower to Earth (YOU),
                                    # the bounce wave on "side by side", the wobble on "Barely."
    ("giants", "Jupiter"),          # Jupiter + Saturn smug, his tape measure reads 2/3; then Saturn: the rings OFF (tan line)
    ("catch", "One catch"),         # the top: the Moon has to be FAR; it drifts in and out; the swing = one whole Neptune
    ("button", "So on a"),          # the Moon comes close, Neptune POPS out, sleeps outside in its nightcap; the last frames
                                    # are the hook's own drawing a moment before frame 0 (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "Could every / planet fit",
    "between you / and the Moon?",
    "Yep!",
    "All seven / FIT...",
    "side by side.",
    "Barely.",
    "Jupiter and / Saturn",
    "hog two-thirds / of the gap...",
    "and Saturn / has to take",
    "its rings OFF.",
    "One catch...",
    "the Moon has / to be FAR.",
    "It drifts / in and out",
    "every month...",
    "by up to a / whole NEPTUNE.",
    "So on a / close night...",
    "Neptune / sleeps outside.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"planet": Y, "moon": S, "yep": G, "fit": G, "seven": Y, "barely": O, "jupiter": O, "saturn": Y, "2/3": Y,
         "rings": Y, "off": R, "catch": O, "far": C, "drifts": C, "month": C, "neptune": B, "close": R, "outside": R}
DISPLAY = {"two-thirds": ["2/3"]}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_and2 = find("and Saturn has")
i_moon2 = find("the Moon has")
i_nep2 = find("Neptune sleeps")
cues = {
    # the hook: the shove, the click in the gap, the pull-back
    "moon_w": W("Moon"), "q_end": E("Moon"),
    "yep": W("Yep"), "click": W("Yep") - 0.30,
    "all": W("All"), "fit": W("seven FIT", 1), "fit_end": E("seven FIT", 1),
    "pull0": W("All") - 0.30, "pull1": W("side") - 0.05,
    "side0": W("side"), "side1": E("side by side", 2),
    "barely": W("Barely"), "barely_end": E("Barely"),
    # the giants and the rings
    "jup": W("Jupiter"), "sat1": W("Saturn"), "hog": W("hog"), "thirds": W("two-thirds"), "gap_end": E("gap"),
    "and2": T.ws[i_and2], "sat2": T.ws[i_and2 + 1], "take": W("take"), "rings": W("rings"), "off": W("OFF"), "off_end": E("OFF"),
    # the catch: FAR, the drift, a whole Neptune
    "one": W("One"), "catch_end": E("catch"), "moon2": T.ws[i_moon2 + 1], "far": W("FAR"), "far_end": E("FAR"),
    "drifts": W("drifts"), "inout": W("in and out"), "out1": W("in and out", 2), "month": W("month"), "month_end": E("month"),
    "by": W("by up"), "whole": W("whole"), "nep": W("NEPTUNE"), "nep_end": E("NEPTUNE"),
    # the button: the close night, the POP, sleeping outside, the loop
    "so": W("So"), "close": W("close"), "night_end": E("night"), "nep2": T.ws[i_nep2], "sleeps": W("sleeps"),
    "outside": W("outside"), "out_end": E("outside"),
}
cues["pop"] = cues["night_end"] + 0.12
cues["loop"] = T.duration - 0.27          # the hard cut to the hook's own drawing, a moment before frame 0
order = ["click", "yep", "pull0", "all", "fit", "side0", "side1", "barely", "jup", "hog", "thirds", "and2", "rings", "off",
         "one", "far", "drifts", "month", "by", "whole", "nep", "so", "close", "pop", "nep2", "sleeps", "outside", "loop"]
assert all(cues[a] < cues[b] for a, b in zip(order, order[1:])), [(a, cues[a]) for a in order]
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s
# before the end) and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says
# "subscribe" in either arm; the ask also lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
