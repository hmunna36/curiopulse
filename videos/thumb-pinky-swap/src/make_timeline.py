"""Edit timeline for the Can You SWAP Your Thumb and Pinky? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py (and fist-edge-palm's, the last hand test).
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # the tight rules (5 Nov 2026): nothing after the last word but the cut back to frame 1

# The direction sheet (reference/direction.md): an average shot of 2.2 s or less, none over 3.2 s; up to 13 s every cut is
# another framing of the same test: his two fists over the dock. Sizes: X extreme close-up, C close, M medium, W wide.
SHOTS = [
    ("hook", None),                 # X  frame 0: from his eyes, two fists, right thumb out, left pinky out; SWAP (it works)
    ("fast", "Faster"),             # M  from in front, high: his face and fists, FASTER... and two thumbs come out
    ("two", "Two thumbs"),          # X  from his eyes, close: the two thumbs ringed, 2 THUMBS?! (the flash-forward window)
    ("copycat", "COPYCATS"),        # C  whip to the cat across the planks: both paws up, exactly like his (hitstop)
    ("twin", "Keep swapping"),      # M  from his eyes: he keeps swapping; strings pop between the twins on "TWIN"
    ("want", "Move one"),           # C  from in front, low, by the thumbs: the right thumb goes out, a bead runs the string,
                                    #    the left thumb is yanked out too (BOING); then the little fingers do it (cut_pinks)
    ("kids", "Kids' hands"),        # X  from his eyes, close: AGE 4: the strings are ropes, the hands copy, copy, copy
    ("kidsb", "it fades"),          # M  from his left, low: AGE 30: the ropes thin to threads
    ("gene", "In some families"),   # M  from in front, high: he waves at the cat... and the other hand waves too
    ("life", "keeps it"),           # C  from his eyes: the strings turn to chain, a padlock snaps shut on LIFE; the cat
                                    #    waves both paws (the longest shot before the sting)
    ("button", "Now swap"),         # X  from his eyes: slow... the swap, and back: frame 0's picture for the loop; the
                                    #    cat swaps her paws perfectly
]
special = {}

# caption chunks: EXACT consecutive word runs, 1-5 words, "/" splits two lines
CHUNKS = [
    "Your right / thumb out,",
    "left pinky / out...",
    "can you / SWAP them?",
    "Faster!",
    "Two thumbs?",
    "Your hands / are...",
    "COPYCATS.",
    "Keep / swapping.",
    "Every finger's / got a TWIN",
    "on the / other hand.",
    "Move one...",
    "and its twin / wants to",
    "move too.",
    "Kids' hands / copy",
    "WAY more...",
    "it fades / as you grow.",
    "In some / families,",
    "one faulty / gene",
    "keeps it...",
    "for LIFE.",
    "Now swap / them...",
    "SLOWLY.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PINK = P["P"]
# the thumb is yellow and the little finger pink all the way through (the strings use the same); the copy is orange
COLOR = {"thumb": Y, "thumbs": Y, "pinky": PINK, "swap": Y, "copycats": O, "twin": Y, "kids": G, "way": G,
         "gene": G, "life": R, "slowly": C}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_iT = find("Two thumbs")
_iN = find("Now swap them")
cues = {
    # the hook
    "your": W("Your right"), "thumb1": W("thumb out"), "left": W("left pinky"), "pinky1": W("pinky"),
    "can": W("can you"), "swap1": W("SWAP"), "them1": W("them"), "faster": W("Faster"), "faster_end": E("Faster"),
    # the answer
    "two": T.ws[_iT], "thumbs": T.ws[_iT + 1], "thumbs_end": T.we[_iT + 1], "hands1": W("hands are"),
    "are_end": E("are"), "copycats": W("COPYCATS"), "copycats_end": E("COPYCATS"),
    # the twins
    "keep": W("Keep"), "swapping": W("swapping"), "every": W("Every"), "twin_w": W("TWIN"), "other": W("other hand"),
    "hand_end": E("other hand", 1),
    "move": W("Move one"), "one_end": E("Move one", 1), "and": W("and its"), "its": W("its twin"),
    "wants": W("wants"), "move2": W("move too"), "too": W("too"), "too_end": E("too"),
    # kids
    "kids": W("Kids'"), "copy": W("copy"), "way": W("WAY"), "more_end": E("more"), "fades": W("it fades"),
    "grow": W("grow"), "grow_end": E("grow"),
    # the gene
    "gene_go": W("In some"), "families": W("families"), "families_end": E("families"), "faulty": W("faulty"),
    "gene_w": W("gene"), "keeps": W("keeps"), "it2_end": E("keeps it", 1), "for": W("for LIFE"), "life": W("LIFE"),
    "life_end": E("LIFE"),
    # the button
    "now": T.ws[_iN], "swap2": T.ws[_iN + 1], "them2_end": T.we[_iN + 2], "slowly": W("SLOWLY"),
    "slowly_end": E("SLOWLY"),
    "end": T.duration,
}
_sh = {s["id"]: s for s in shots}
cues["fail"] = cues["faster_end"] + 0.08          # the fast run's last swap: TWO THUMBS (the mix-up)
cues["yank"] = cues["wants"] + 0.02               # the left thumb is yanked out by its twin (BOING)
cues["pinks1"] = cues["too"] - 0.12               # the right little finger goes out...
cues["pinks2"] = cues["too_end"] + 0.12           # ...and its twin follows
cues["cut_pinks"] = cues["move2"] - 0.05          # the want shot jumps closer, onto the little fingers
cues["cut_can"] = W("pinky out", 1) - 0.05       # the hook jumps closer onto the fists on the second "out"
cues["cut_every"] = cues["every"] - 0.05          # the twin shot jumps from his eyes to above the fists
cues["cut_way"] = cues["way"] - 0.05              # the kids shot jumps closer on "WAY more"
cues["cut_slowly"] = cues["slowly"] - 0.05        # the button jumps to a wider look from his eyes, then settles on frame 0
cues["wave0"] = cues["families"] + 0.05           # he waves at the cat... and the left hand waves too
cues["wave1"] = cues["keeps"] - 0.35
cues["everything"] = cues["life"]                 # the padlock snaps shut (hitstop)
cues["lock"] = cues["life"] + 0.04
cues["slow1"] = cues["slowly"] + 0.25             # the slow swap back: frame 0's picture
# the flash-forward: the padlock and the chain on his thumbs (FOR LIFE), half a second, in a window top right
cues["ff"] = cues["thumbs_end"] + 0.06

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.2, "fast": 0.45, "two": 0.3, "copycat": 0.3, "twin": 0.25, "want": 0.3, "kids": 0.35,
             "kidsb": 0.3, "gene": 0.3, "life": 0.3, "button": 0.2},
    "whip": [[_sh["copycat"]["start"], 1], [_sh["want"]["start"], -1], [_sh["gene"]["start"], 1]],
    "punch": [[cues["copycats"] - 0.02, 1.18, _sh["twin"]["start"] - 0.05],
              [cues["life"] - 0.03, 1.15, _sh["button"]["start"] - 0.05]],
    "tilt": [[cues["fail"] - 0.05, cues["thumbs_end"] + 0.2, -3]],
    "hit": [[cues["copycats"] + 0.1, 4], [cues["lock"], 4]],
    "act": {"brow": [cues["two"] + 0.05, cues["yank"] + 0.05, cues["gene_w"], cues["slowly"]]},
    "mood": [[0, "day"], [cues["fail"] - 0.05, "shade"], [cues["keep"] - 0.1, "day"], [cues["gene_go"] - 0.05, "warm"],
             [cues["for"] - 0.1, "cold"], [_sh["button"]["start"], "day"]],
    # depth in front of the lens and particles in the air: never on the hook or the button (frame 0 and the loop's
    # last frame must match), alternating corners
    "fg": {"fast": "bokeh-r", "two": "bokeh-l", "copycat": "grass-b", "twin": "bokeh-r", "want": "grass-b",
           "kids": "bokeh-l", "kidsb": "grass-b", "gene": "bokeh-r", "life": "bokeh-l"},
    "air": {"fast": "pollen", "two": "pollen", "copycat": "sparkle", "twin": "pollen", "want": "dust", "kids": "pollen",
            "kidsb": "pollen", "gene": "pollen", "life": "sparkle"},
    "lens": [],
    "flash": [[cues["ff"], 0.6, cues["lock"] - 0.12, {"win": [800, 640, 165], "zoom": 1.9, "at": [540, 1180]}]],
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
for _s in shots:
    print(f'  {_s["id"]:9s} {_s["start"]:6.2f} - {_s["end"]:6.2f}  ({_s["end"] - _s["start"]:.2f} s)')
