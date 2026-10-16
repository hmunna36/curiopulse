"""Edit timeline for the Why Does This Dot VANISH? (Find Your Blind Spot) 👁️ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.45)  # "Show-off." lands, the octopus takes its bow, then the cut back to frame 1 (the loop)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),            # THE TEST, on the screen itself: we are his phone. Tight on him in bed at night, his palm
                               # already over his left eye, his right eye on the X; a white X and a red dot sit on the
                               # glass (screen space) for the viewer's own test until the dive; he brings his phone
                               # closer (the camera pushes in) as the viewer does; "The dot vanished?" jolts him; a round
                               # window opens on his open eye on "Your eye", the hole lights up in it on "HOLE"
    ("inside", "That's where"),  # the dive lands in that eye, cut in half: a back wall lined with light sensors, the
                               # cable to the brain plugging in where nobody stands; then the X's light lands on a
                               # sensor who yells X!, and the dot's light lands in the hole: on nobody (a cricket)
    ("paint", "And you didn't"),  # the brain's room: the WHAT YOU SEE screen shows the viewer's test with a black hole
                               # where the dot was; the brain dabs its brush on the wall beside it and paints it over
    ("octopus", "An octopus?"),  # under the sea: an octopus doing the same test with a phone; its eye cut in half beside
                               # ours: the wires come from behind, the wall is whole, no hole
    ("button", None),          # (from just after "no hole at all.") the octopus shows off: the dot is still on its phone, a smug flourish
    ("loop", None),            # the last 0.4 s: the hook at negative time (his palm comes up to his eye), so the cut to
                               # frame 1 is one move
]
special = {"loop": T.duration - 0.40, "button": T.E("all.") + 0.35}   # the octopus comes back (shades on) in the gap before "Show-off."

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Close your / left eye,", "stare / at the X,", "and bring / your phone", "closer.",
    "The dot / vanished?", "Your eye / has a HOLE", "in it.",
    "That's where / the cable", "to your brain / plugs in...", "no room for / light sensors.",
    "So the dot / landed...", "on nobody.",
    "And you didn't / see a hole", "there...", "because / your brain", "paints / over it", "with whatever's / around it.",
    "An octopus?", "Its eye / is wired", "from behind...", "no hole / at all.",
    "Show-off.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"left": C, "x": Y, "closer": G, "dot": R, "vanished": Y, "hole": Y, "cable": O, "brain": PK, "plugs": O,
         "sensors": O, "nobody": V, "paints": C, "whatevers": C, "around": C, "octopus": V, "behind": G, "all": G,
         "showoff": PK}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iA = find("The dot vanished?")          # word indexes where later lines start: lookups of repeated words search from here
iC = find("That's where")
iN = find("So the dot")
iP = find("And you didn't")
iO = find("An octopus?")
cues = {
    # the hook: the test, on the screen itself
    "close": W("Close"), "left": W("left"), "eye1": W("eye,"), "eye1_end": E("eye,"), "stare": W("stare"), "x": W("X,"),
    "x_end": E("X,"), "bring": W("bring"), "phone": W("phone"), "closer": W("closer."), "closer_end": E("closer."),
    # the answer: the dot vanished; a hole in your eye
    "the_dot": W("The dot", s=iA), "dot1": W("dot", s=iA), "vanished": W("vanished?"), "vanished_end": E("vanished?"),
    "your_eye": W("Your eye has"), "eye2": W("eye", s=iA + 3), "hole1": W("HOLE"), "hole1_end": E("HOLE"),
    "it1_end": E("it.", s=iA),
    # inside the eye: the cable plugs in where nobody stands
    "thats": W("That's where"), "cable": W("cable"), "cable_end": E("cable"), "brain1": W("brain", s=iC), "plugs": W("plugs"),
    "plugs_end": E("in...", s=iC), "noroom": W("no room"), "room": W("room"), "light": W("light sensors."),
    "sensors": W("sensors."), "sensors_end": E("sensors."),
    "so": W("So the dot"), "dot2": W("dot", s=iN), "landed": W("landed..."), "landed_end": E("landed..."),
    "on": W("on nobody."), "nobody": W("nobody."), "nobody_end": E("nobody."),
    # the brain paints it over
    "and_you": W("And you didn't"), "didnt": W("didn't"), "hole2": W("hole", s=iP), "there": W("there..."),
    "there_end": E("there..."), "because": W("because"), "brain2": W("brain", s=iP), "paints": W("paints"),
    "over": W("over"), "with": W("with"), "whatevers": W("whatever's"), "around": W("around"), "it2_end": E("around it.", k=1),
    # the octopus
    "octo": W("An octopus?"), "octopus": W("octopus?"), "octopus_end": E("octopus?"), "its": W("Its eye"),
    "wired": W("wired"), "behind": W("behind..."), "behind_end": E("behind..."), "no_hole": W("no hole at"),
    "hole3": W("hole", s=iO), "all": W("all."), "all_end": E("all."),
    # the button
    "show": W("Show-off."), "show_end": E("Show-off."),
}
cues["loop_in"] = T.duration - 0.40
assert cues["hole2"] > cues["didnt"] and cues["hole3"] > cues["wired"] and cues["dot2"] > cues["so"], "a repeated word was found in the wrong line"
# ---- no Subscribe pill (since 16 Oct 2026; user, 15 Oct: "yes"; reference/analytics.md, the rules of 15 Oct). The
# silent pill over the last 3.4 s still made about a quarter of the viewers leave in the last 4 s and added no
# subscribers; replays carried the channel's breakout. So the Short ends on the button line and cuts back to frame 1.
# Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"]: web/subscribe.js draws the pill only when they exist, and
# qa.py fails a Short that has them. The subscribe ask lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: no pill, nothing said (the Short loops)'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
