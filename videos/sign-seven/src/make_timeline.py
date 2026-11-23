"""Edit timeline for the Can You Make a 7 in SIGN Language? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # the tight rules (5 Nov 2026): nothing after the last word but the cut back to frame 1

# v3's alignment runs early on a few words (measured on the take's own speech-band onsets, T.bursts): the hook's first
# words ("Can you" share one burst, "seven" has two), "He could" (0.2 s early) and "like chariot REINS"
def set_word(i, a, e):
    T.ws[i] = T.words[i]["start"] = round(a, 3)
    T.we[i] = T.words[i]["end"] = round(e, 3)
_iC = T.find("Can you sign")
for _k, (_a, _e) in enumerate([(0.20, 0.31), (0.31, 0.43), (0.49, 0.70), (0.70, 0.79), (0.86, 1.24)]):
    set_word(_iC + _k, _a, _e)
T.retime("He could", T.W("He could") - 0.3, T.E("He could", 1) + 0.12)
T.retime("like chariot REINS", T.W("like chariot") - 0.12, T.E("like chariot REINS", 2) + 0.06)

# The direction sheet (reference/direction.md): an average shot of 2.2 s or less, none over 3.2 s; up to 13 s every cut
# is another framing of the same test (his left hand making the seven). The sizes alternate (C close, M medium, W wide,
# X extreme close-up); the longest shot is the violinist's snip, just before the sting.
SHOTS = [
    ("hook", None),                   # C  frame 0: his hand, palm to us, the thumb on its way to the ring finger
    ("hookb", "Thumb on your"),       # M  low angle at the trail cafe table: the thumb lands on the ring fingertip
    ("hookc", "three fingers UP"),    # C  hand and face: three fingers up... and the pinky starts to sink
    ("pinky", "Pinky sinking"),       # X  the pinky sinking, ringed red
    ("marmot", "Congrats"),           # M  whip: the marmot cook on the table reads his hand (flash-forward in a window)
    ("two", "TWO"),                   # C  SLAP: two pancakes on his plate; his hand reads as a 2
    ("slow", "Now bend the"),         # M  from the pinky side: the ring finger bends slowly, the pinky follows
    ("feel", "Feel the pinky"),       # X  his eyes and mouth, the hand low in frame; a pancake lands on his hat
    ("inside", "Inside their cords"), # C  the hand turns to glass: the cords, and the knot at the wrist
    ("reins", "like chariot"),        # M  down the forearm: the charioteer yanks the ring's rein, the pinky's comes too
    ("violin", "One violinist"),      # M  whip: a violinist's glass hand under a spotlight; the surgeon's scissors SNIP
    ("both", "in BOTH hands"),        # W  both his hands, every rein loose; 1979-1988
    ("free", "Free fingers"),         # C  the freed fingers wave one at a time
    ("type", "He could type"),        # M  a typewriter at blur speed, DING; his violin sulks in its case
    ("button", "Now sign your"),      # C  whip back to the cafe: sevens, fast; the marmot flips pancakes like a machine;
                                      #    the last frames are frame 0's picture (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs, 1-5 words, "/" splits two lines
CHUNKS = [
    "Can you sign / a seven?",
    "Thumb on your / ring finger...",
    "three fingers / UP.",
    "Pinky / sinking?",
    "Congrats.",
    "You just / signed...",
    "TWO.",
    "Now bend the / ring finger",
    "slowly.",
    "Feel the / pinky follow?",
    "Inside, their / cords",
    "are tied / together...",
    "like chariot / REINS!",
    "One violinist",
    "had a surgeon",
    "snip every / tie...",
    "in BOTH / hands.",
    "Free / fingers!",
    "He could / type...",
    "SUPER / fast.",
    "Now sign / your seven...",
    "FAST.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"7": Y, "2": Y, "ring": O, "pinky": R, "sinking": R, "tied": O, "reins": Y, "snip": R, "both": C,
         "free": G, "super": Y, "fast": Y, "slowly": C}
DISPLAY = {"a seven": ["A", "7"], "two": ["2"], "your seven": ["YOUR", "7"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iF2 = find("Free fingers")
iB = find("Now sign your")
cues = {
    # the hook
    "you0_end": T.we[_iC + 1], "seven": W("seven"), "thumb": W("Thumb"), "ring1": W("ring finger"), "finger1": W("finger"),
    "three": W("three"), "fingers1": W("fingers"), "up": W("UP"), "up_end": E("UP"),
    # the answer
    "pinky1": W("Pinky"), "sinking": W("sinking"), "sinking_end": E("sinking"),
    "congrats": W("Congrats"), "congrats_end": E("Congrats"), "you": W("You just"), "signed": W("signed"),
    "signed_end": E("signed"), "two": W("TWO"), "two_end": E("TWO"),
    # the slow try
    "now": W("Now bend"), "bend": W("bend"), "ring2": W("ring finger slowly"), "slowly": W("slowly"),
    "slowly_end": E("slowly"), "feel": W("Feel"), "pinky2": W("pinky follow"), "follow": W("follow"),
    "follow_end": E("follow"),
    # the reins
    "inside": W("Inside"), "cords": W("cords"), "tied": W("tied"), "together": W("together"),
    "together_end": E("together"), "like": W("like chariot"), "chariot": W("chariot"), "reins": W("REINS"),
    "reins_end": E("REINS"),
    # the violinist
    "one": W("One violinist"), "violinist": W("violinist"), "surgeon": W("surgeon"), "snip": W("snip"),
    "snip_end": E("snip"), "every": W("every"), "tie": W("tie"), "tie_end": E("tie"), "both": W("BOTH"),
    "hands": W("hands"), "hands_end": E("hands"),
    # the sting
    "free": T.ws[iF2], "fingers2": T.ws[iF2 + 1], "fingers2_end": T.we[iF2 + 1], "he": W("He could"),
    "type": W("type"), "type_end": E("type"), "super": W("SUPER"), "fast": W("SUPER fast", 1),
    "fast_end": E("SUPER fast", 1),
    # the button
    "now2": T.ws[iB], "sign2": T.ws[iB + 1], "seven2": T.ws[iB + 3], "seven2_end": T.we[iB + 3],
    "fast2": T.ws[iB + 4], "fast2_end": T.we[iB + 4],
    "end": T.duration,
}
cues["slap1"] = cues["two_end"] + 0.03         # the two pancakes land just after the punch word (its sound after the word)
cues["slap2"] = cues["follow_end"] + 0.02      # the device's second beat: a pancake lands on his hat
cues["snipcut"] = cues["snip"] + 0.12          # the scissors close

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
sh = {s["id"]: s for s in shots}
CAMERA = {
    "hand": {"hook": 0.2, "hookb": 0.25, "hookc": 0.3, "pinky": 0.35, "marmot": 0.3, "two": 0.45, "slow": 0.25,
             "feel": 0.3, "inside": 0.22, "reins": 0.35, "violin": 0.3, "both": 0.28, "free": 0.4, "type": 0.55,
             "button": 0.45},
    "whip": [[sh["marmot"]["start"], 1], [sh["violin"]["start"], -1], [sh["button"]["start"], 1]],
    "punch": [[cues["two"], 1.15, sh["slow"]["start"] - 0.05], [cues["fast"], 1.18, sh["button"]["start"] - 0.05]],
    "tilt": [[cues["pinky1"], cues["sinking_end"] + 0.1, 3]],
    "hit": [[cues["slap1"], 4], [cues["snipcut"], 4]],
    "act": {"brow": [cues["up"] + 0.15, cues["two"] + 0.1, cues["follow"], cues["both"]]},
    "mood": [[0, "day"], [cues["sinking"], "shade"], [cues["congrats"], "day"], [cues["inside"], "spot"],
             [cues["free"], "warm"], [sh["button"]["start"], "day"]],
    # depth in front of the lens and particles in the air: never on the hook or the button (frame 0 and the loop's
    # last frame must match), alternating corners
    "fg": {"hookb": "bokeh-l", "marmot": "bokeh-r", "two": "bokeh-l", "slow": "bokeh-r", "feel": "bokeh-t",
           "reins": "bokeh-r", "both": "frame", "free": "bokeh-r", "type": "bokeh-l"},
    "air": {"hookb": "dust", "marmot": "dust", "two": "dust", "slow": "dust", "feel": "dust", "inside": "dust",
            "violin": "dust", "both": "dust", "free": "sparkle", "type": "dust"},
    "lens": [],
    # the flash-forward (direction.md rule 4): in the gap after "Congrats.", half a second of the SNIP, in a window
    # top left, clear of his face, his hand and the marmot
    "flash": [[cues["congrats_end"], 0.55, cues["snip"] - 0.08, {"win": [292, 640, 165], "zoom": 1.5}]],
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
