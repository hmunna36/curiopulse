"""Edit timeline for the Why Can't You See Your Own EYES Move in a Mirror? 👀 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.1)  # seconds after the last word: the squint at us, then the cut back to frame 1 (the loop).
#                                      Every Short is 30-35 s since 16 Oct 2026.

W, E, ev, find = T.W, T.E, T.ev, T.find

# v3's alignment put two words early (qa.py round 1: "See" at -16.7 dB and "like" at -3.6 dB, their windows the silence
# before them; whisper and the speech-band bursts agree: "See" ~3.58-3.69, "like" ~7.84-7.96). Each goes onto the take's
# first burst of speech-band energy after its aligned start (0.04 s before it, for the consonant).
def _onto_burst(phrase, search=0.45, thr=-34.0):
    i = find(phrase)
    b = [r for r in T.bursts(T.ws[i] - 0.02, T.ws[i] + search, thr=thr) if r[1] - r[0] >= 0.05]
    if not b:
        print(f'WARNING: no burst for {phrase!r} (alignment left as it was)')
        return
    a, e = b[0]
    if a - 0.04 <= T.ws[i] + 0.05:
        return                                           # already on its burst
    T.ws[i] = T.words[i]["start"] = round(a - 0.04, 3)
    T.we[i] = T.words[i]["end"] = round(max(e, T.ws[i] + 0.08), 3)
    if T.ws[i + 1] < T.we[i]:                            # the next word starts after it
        T.ws[i + 1] = T.words[i + 1]["start"] = T.we[i]
    print(f're-timed "{T.words[i]["word"]}": {T.ws[i]:.2f}-{T.we[i]:.2f}')


_onto_burst("See them move")
_onto_burst("like a sneaky")
_so1 = find("so SNIP")                # "...smear... so, SNIP." (the second "so" is "so it shows")
_so2 = find("so it shows")
_jump2 = find("jump", find("shows"))    # "...shows the jump..." (the first "jump" is the answer's)
_snip2 = find("snip", find("after"))    # "...after the snip." (the first is "SNIP." in the smear line)
_brain2 = find("brain", find("Then"))   # "Then your brain probably patches..."
_eyes2 = find("eyes", find("Snap"))     # "Snap your eyes to this clock" (the first "eyes" is the hook's)
_right2 = find("right", find("long"))   # "...too long, right?" (the first is the hook's "right.")

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),       # THE TEST: the camera is his bathroom mirror; tight on his eyes, leaning in; "Left," "right." the
                          # pupils JUMP (from one frame to the next, nothing between); "See them move?" a squint; "Nope." a
                          # head shake; "Your brain" a round window opens on his forehead: his brain at an editing desk in
                          # a green visor, scissors up, a film strip of his own eyes; "sneaky" the camera dives through it
    ("edit", None),       # the editing room: the film strip runs across, frame after frame of his eyes in the mirror;
                          # "blurry smear" the camera to the frames in between, smeared sideways; "SNIP." the scissors cut
                          # them out, they drop, the strip snaps shut: LEFT ... RIGHT, nothing between
    ("selfie", None),     # his phone up in his hand, selfie camera: on its screen his eyes SLIDE across, visibly; a LATE
                          # timer; a small SNIP tag with a tick lands before the slide starts: THERE they go
    ("patch", None),      # the editing room again: the gap in the strip; the brain pulls the next frame (a wall clock)
                          # back over the hole: PATCH
    ("clock", None),      # the bathroom, a step back: a round clock pops up on the tiles, off to one side; he snaps his eyes
                          # to it (the viewer's too); it ticks once a second, the first tick hangs on him
    ("button", None),     # the mirror: his eyes darting, SNIP SNIP SNIP, 3 A SECOND; "Not convinced?" a squint at us, then
                          # he leans back into the mirror
    ("loop", None),       # the hook at negative time: the last frames ARE frame 1's picture (the loop)
]
# every cut lands just before the first word of a caption chunk (a cut ends the chunk on screen)
special = {
    "edit": T.ws[find("film editor")] - 0.06,
    "selfie": W("Your selfie") - 0.06,
    "patch": W("Then your") - 0.06,
    "clock": W("Snap") - 0.06,
    "button": W("It does") - 0.06,
    "loop": T.duration - 0.45,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
# One idea per chunk; break before the punchline so it lands alone ("raisins", "Nope", "Science").
# A line is capped at 640 px (x 220-860, the Shorts safe area): ~10 characters stay at full size, 16 drop to ~60 px.
CHUNKS = [
    "Look at / your eyes",
    "in a / mirror.",
    "Left,",
    "right.",
    "See them / move?",
    "Nope.",
    "Your brain / cuts out",
    "every / jump,",
    "like a / sneaky",
    "film / editor.",
    "Mid-jump,",
    "it's just a",
    "blurry / smear...",
    "so,",
    "SNIP.",
    "Your selfie / camera",
    "runs a / hair late,",
    "so it / shows",
    "the jump",
    "after / the snip.",
    "Then your / brain",
    "probably / patches",
    "the hole.",
    "Snap your / eyes",
    "to this / clock...",
    "first / tick's",
    "too long,",
    "right?",
    "It does / this",
    "three / times",
    "a second.",
    "Not / convinced?",
]
Y, O, C, R, G, B, V, S, Pk = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"eyes": C, "mirror": C, "move": Y, "nope": R, "brain": Pk, "cuts": O, "jump": Y, "film": V, "editor": V,
         "blurry": B, "smear": B, "snip": R, "selfie": C, "late": O, "patches": G, "hole": Y, "snap": O, "clock": Y,
         "first": Y, "long": O, "three": Y, "convinced": V}
DISPLAY = {}  # spoken words shown as figures: {"seventy percent": ["70%"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

_clock_on = W("Snap") + 0.12            # the clock pops up as "Snap" lands; its hand ticks once a second from then
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # the hook
    "look": W("Look"), "eyes1": W("eyes"), "mirror": W("mirror"), "mirror_end": E("mirror"),
    "left": W("Left"), "right": W("right"), "see": W("See"), "move": W("move"), "move_end": E("move"),
    "nope": W("Nope"), "nope_end": E("Nope"), "your2": W("Your brain"), "brain": W("brain"), "cuts": W("cuts"),
    "every": W("every"), "jump": W("jump"), "like": W("like"), "sneaky": W("sneaky"), "film": W("film"),
    "editor": W("editor"), "editor_end": E("editor"),
    # the editing room
    "mid": W("Mid-jump"), "mid_end": E("Mid-jump"), "blurry": W("blurry"), "smear": W("smear"), "smear_end": E("smear"),
    "so1": T.ws[_so1], "so1_end": T.we[_so1], "snip": W("SNIP"), "snip_end": E("SNIP"),
    # the selfie camera
    "selfie": W("selfie"), "camera": W("camera"), "runs": W("runs"), "late": W("late"), "late_end": E("late"),
    "so2": T.ws[_so2], "shows": W("shows"), "jump2": T.ws[_jump2], "after": W("after"), "snip2": T.ws[_snip2],
    "snip2_end": T.we[_snip2],
    # the patch
    "then": W("Then"), "brain2": T.ws[_brain2], "probably": W("probably"), "patches": W("patches"),
    "hole": W("hole"), "hole_end": E("hole"),
    # the clock
    "snap": W("Snap"), "eyes2": T.ws[_eyes2], "this": W("this clock"), "clock": W("clock"), "clock_end": E("clock"),
    "first": W("first"), "ticks": W("tick's"), "too": W("too"), "long": W("long"), "right2": T.ws[_right2],
    "right2_end": T.we[_right2],
    "clock_on": _clock_on, "tick1": _clock_on + 1.0, "tick2": _clock_on + 2.0, "tick3": _clock_on + 3.0,
    "tick4": _clock_on + 4.0,
    # the button
    "it": W("It does"), "three": W("three"), "times": W("times"), "second": W("second"), "second_end": E("second"),
    "not": W("Not"), "convinced": W("convinced"), "convinced_end": E("convinced"),
}
for a, b in [("left", "right"), ("right", "see"), ("move", "nope"), ("nope", "your2"), ("mid", "blurry"), ("smear", "snip"),
             ("late", "snip2"), ("then", "hole"), ("snap", "first"), ("tick1", "it"), ("three", "not")]:
    assert cues[a] < cues[b], f"cue order: {a} {cues[a]} !< {b} {cues[b]}"
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
print(f'clock: on {_clock_on:.2f}, ticks {cues["tick1"]:.2f} {cues["tick2"]:.2f} {cues["tick3"]:.2f}; button at {cues["it"]:.2f}')
