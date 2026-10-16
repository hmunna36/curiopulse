"""Edit timeline for the Why Does Your Finger JUMP When You Close One Eye? 👁️ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.25)  # the wink lands, then he raises his finger at the moon again: the cut back to frame 1

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),            # THE TEST: a hill at night, tight on him already pointing at the moon on frame 1; he shuts
                               # one eye on "Shut one eye"
    ("pov", "now the other."),   # what he sees: his finger on the moon; the eyes swap with a blink and the finger JUMPS off
                               # it ("It JUMPED!"), then flicks back and forth as he swaps again
    ("boss", "Relax."),        # back on his face: a little gold crown lands over one eye (BOSS), an INTERN lanyard on the
                               # other
    ("inside", "Each eye"),    # a round window opens on his forehead and the camera dives in: the brain at a desk between
                               # two monitors, one picture per eye, the finger in a different spot on each; it aims with
                               # the boss's
    ("payoff", "Shut the boss,"),  # a shutter slams over the boss's monitor; the brain swivels to the intern's; the camera
                               # pushes into that monitor until it is his view again, and the finger JUMPS
    ("stats", "Two in"),       # a line-up of three faces: crowns land on the boss eyes (right, right, left); pencils show
                               # the writing hand, and one of them does not match
    ("button", "The intern still"),  # back on the hill: the INTERN badge flips to DEPTH; he winks with that eye; then
                               # raises his finger at the moon again
    ("loop", None),            # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Point your / finger", "at something.", "Shut / one eye...", "now / the other.", "It JUMPED!",
    "Relax.", "One eye / is the boss...", "the other's / the intern.",
    "Each eye sees / your finger", "in a / different spot,", "so your brain / aims", "with just one:", "the boss.",
    "Shut the boss,", "and you get", "the intern's / picture...", "jump.",
    "Two in three / of us", "have a / right-eye boss...", "and it / doesn't always", "match your / writing hand.",
    "The intern / still does", "depth...", "and winking.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"finger": O, "jumped": Y, "boss": Y, "intern": V, "interns": V, "different": O, "spot": O, "aims": G,
         "one": G, "shut": R, "picture": C, "jump": Y, "three": G, "righteye": Y, "writing": B, "hand": B,
         "depth": C, "winking": PK}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iA = find("so your brain")               # word indexes where later lines start: lookups of repeated words search from here
iP = find("Shut the boss,")
iX = find("Two in three")
iB = find("The intern still")
cues = {
    # the hook: he is already pointing at the moon on frame 0; one eye shuts on "Shut"
    "point": W("Point"), "something": W("something."), "something_end": E("something."),
    "shut1": W("Shut one"), "eye1": W("eye..."), "eye1_end": E("eye..."),
    "now": W("now the other."), "other": W("other."), "other_end": E("other."),
    "it": W("It JUMPED!"), "jumped": W("JUMPED!"), "jumped_end": E("JUMPED!"),
    # the answer: boss and intern
    "relax": W("Relax."), "relax_end": E("Relax."), "one_eye": W("One eye is"), "boss1": W("boss..."), "boss1_end": E("boss..."),
    "others": W("other's"), "intern1": W("intern."), "intern1_end": E("intern."),
    # inside: two pictures, the brain aims with one
    "each": W("Each eye"), "sees": W("sees"), "finger2": W("finger in"), "different": W("different"), "spot": W("spot,"),
    "spot_end": E("spot,"), "so": W("so your brain"), "brain": W("brain"), "aims": W("aims"), "just": W("just one:"),
    "one2": W("one:", s=iA), "one2_end": E("one:", s=iA), "boss2": W("the boss.", s=iA + 1, k=1), "boss2_end": E("the boss.", s=iA + 1, k=1),
    # the payoff: shut the boss, the intern's picture, jump
    "shut2": W("Shut the boss,"), "boss3": W("boss,", s=iP), "boss3_end": E("boss,", s=iP), "and_get": W("and you get"),
    "interns": W("intern's"), "picture": W("picture..."), "picture_end": E("picture..."), "jump": W("jump."), "jump_end": E("jump."),
    # the weirdest fact: two in three, the writing hand
    "two": W("Two in three"), "three": W("three", s=iX), "right": W("right-eye"), "boss4": W("boss...", s=iX),
    "boss4_end": E("boss...", s=iX), "and_it": W("and it doesn't"), "doesnt": W("doesn't"), "match": W("match"),
    "writing": W("writing"), "hand": W("hand."), "hand_end": E("hand."),
    # the button: depth, and winking
    "intern3": W("The intern still"), "still": W("still", s=iB), "depth": W("depth..."), "depth_end": E("depth..."),
    "and_wink": W("and winking."), "winking": W("winking."), "winking_end": E("winking."),
}
cues["loop_in"] = T.duration - 0.40
assert cues["boss2"] > cues["one2"] > cues["aims"] and cues["boss4"] > cues["right"], "a repeated word was found in the wrong line"
# ---- no Subscribe pill (since 16 Oct 2026; user, 15 Oct: "yes"; reference/analytics.md, the rules of 15 Oct).
# Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"]: qa.py fails a Short that has them.
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
