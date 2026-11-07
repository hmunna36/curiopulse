"""Edit timeline for the Why Can't You Move Just ONE Eye? 👀 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop. The tight
#                                      rules (5 Nov 2026): 25-30 s, the last line runs straight into the first and nothing
#                                      comes after it (qa.py: at most 1.0 s), so the loop comes before the thumb does.

# v3's alignment put "a" (in "a fly.") inside the pause before it: put it on its own burst
i_a = T.find("a fly.")
T.retime("a fly.", T.we[i_a - 1] + 0.02, T.we[i_a + 1] + 0.02)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),             # THE TEST, tight (frame 0): a hot day on a mountain meadow, his face close; two butterflies
                                # flutter apart, one each side of his head; he tries to follow the LEFT one with only his
                                # left eye: both eyes go, every time (they jump together, left, right, left), effort
                                # squint, brows working. "Go!": a last hard try, both eyes slam to one side
    ("answer", "Can't?"),       # whip: a low angle, a little wider; "Can't?" he shakes his head; a small pink brain pops
                                # up on top of his head, a red leash handle in its fists; "on ONE leash.": the lead zips
                                # down, splits in two at his forehead and clips onto BOTH irises (a little silver ring)
    ("tug", "Look left."),      # the eyes, close (eye level): "Look left.": the brain tugs, BOTH eyes go left; "Look
                                # right.": tug, both go right; "One tug...": a big yank; "BOTH go.": both eyes whoosh
                                # together, the leash taut (the viewer is looking left and right with him)
    ("close", "Now close"),     # a high angle from his other side: he shuts his right eye (screen left) and brings a
                                # fingertip up onto the closed lid (the viewer does it too)
    ("feel", "Look around."),   # macro on the closed eye under his fingertip; the open eye looks around and under the
                                # closed lid a ghost iris rolls with it, still on its lead (the lid bulge moves under the
                                # finger: what the viewer feels); "blindfolded.": a tiny sleep mask pops onto the ghost
    ("weird", "A chameleon"),   # whip: a medium two-shot, low: a chameleon on a branch by his shoulder; its own tiny brain
                                # holds TWO leads, one in each fist; "One eye forward...": one turret swings to the front;
                                # "one eye back.": the other swings to the back; he tries to copy: both his eyes go one way
    ("fly", "Until"),           # a fly buzzes in and lands on his NOSE; both chameleon eyes snap onto it; his eyes cross
                                # onto it (both move: inward); in the gap after "fly.": the tongue SNAPS, the fly is gone,
                                # a gulp; he blinks
    ("button", "Now try"),      # back on his face, tight: the butterflies flutter in again; "RIGHT": he tries the right eye
    ("loop", None),             # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Move just / one eye.", "Only your left.", "Go!",
    "Can't?", "Your eyes are", "on ONE leash.",
    "Look left.", "Look right.", "One tug...", "BOTH go.",
    "Now close / one eye.", "Fingertip / on the lid.",
    "Look around.", "Feel that?", "Still walking...", "blindfolded.",
    "A chameleon gets", "TWO leashes.", "One eye / forward...", "one eye back.",
    "Until it spots / a fly.",
    "Now try the / RIGHT one.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"left": O, "cant": R, "leash": R, "tug": Y, "both": G, "close": V, "fingertip": PK, "lid": O, "feel": Y,
         "walking": G, "blindfolded": V, "chameleon": G, "two": Y, "leashes": R, "forward": C, "back": C, "fly": R,
         "right": O}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, find = T.W, T.E, T.find
iT = find("Look left.")
iC = find("Now close")
iF = find("Look around.")
iW = find("A chameleon")
iU = find("Until")
iB = find("Now try")
cues = {
    # the hook
    "move": W("Move"), "just": W("just"), "one1": W("one eye."), "eye1": W("eye."), "eye1_end": E("eye."), "only": W("Only"),
    "left1": W("left."), "left1_end": E("left."), "go1": W("Go!"), "go1_end": E("Go!"),
    # the answer
    "cant": W("Can't?"), "cant_end": E("Can't?"), "your_e": W("Your eyes"), "eyes": W("eyes are"), "on": W("on ONE"),
    "one2": W("ONE leash."), "leash": W("leash."), "leash_end": E("leash."),
    # the tug
    "look_l": W("Look", s=iT), "left2": W("left.", s=iT), "left2_end": E("left.", s=iT), "look_r": W("Look right."),
    "right1": W("right."), "right1_end": E("right."), "one_t": W("One tug"), "tug": W("tug..."), "tug_end": E("tug..."),
    "both": W("BOTH"), "go2": W("go.", s=iT), "go2_end": E("go.", s=iT),
    # close one eye
    "now_c": W("Now", s=iC), "close": W("close"), "eye_c": W("eye.", s=iC), "eye_c_end": E("eye.", s=iC),
    "fingertip": W("Fingertip"), "lid": W("lid."), "lid_end": E("lid."),
    # feel it
    "look_a": W("Look", s=iF), "around": W("around."), "around_end": E("around."), "feel": W("Feel"), "that": W("that?"),
    "that_end": E("that?"), "still": W("Still"), "walking": W("walking..."), "walking_end": E("walking..."),
    "blind": W("blindfolded."), "blind_end": E("blindfolded."),
    # the chameleon
    "a_ch": W("A", s=iW), "chameleon": W("chameleon"), "gets": W("gets"), "two": W("TWO"), "leashes": W("leashes."),
    "leashes_end": E("leashes."), "one_f": W("One eye forward"), "forward": W("forward..."), "forward_end": E("forward..."),
    "one_b": W("one eye back."), "back": W("back."), "back_end": E("back."),
    # the fly
    "until": W("Until", s=iU), "spots": W("spots"), "a_f": W("a fly."), "fly": W("fly."), "fly_end": E("fly."),
    # the button
    "now_b": W("Now", s=iB), "try": W("try"), "right2": W("RIGHT", s=iB), "one_r": W("one.", s=iB), "one_r_end": E("one.", s=iB),
}
cues["loop_in"] = round(T.duration - 0.40, 3)
# the hook's eye jumps: both eyes hop together (left, right, left...) while he tries; the last one on "Go!"
_h0, _h1 = 0.30, cues["go1"] + 0.05
cues["hops"] = [round(_h0 + i * (_h1 - _h0) / 5, 3) for i in range(6)]
# the brain's tugs in the tug shot: on "left.", on "right.", the big yank on "tug...", the whoosh on "BOTH"
cues["tugs"] = [round(cues["left2"] - 0.06, 3), round(cues["right1"] - 0.06, 3), round(cues["tug"] - 0.04, 3), round(cues["both"] - 0.05, 3)]
# the fly: in on "Until", lands on his nose just after "spots", the snap in the pause after "fly."
cues["fly_in"] = round(cues["until"] - 0.10, 3)
cues["fly_land"] = round(cues["a_f"] - 0.06, 3)
cues["snap"] = round(cues["fly_end"] + 0.10, 3)
cues["gulp"] = round(min(cues["snap"] + 0.30, cues["now_b"] - 0.08), 3)
_order = ["move", "just", "one1", "eye1", "only", "left1", "go1", "go1_end", "cant", "cant_end", "your_e", "eyes", "on",
          "one2", "leash", "leash_end", "look_l", "left2", "look_r", "right1", "one_t", "tug", "both", "go2", "go2_end",
          "now_c", "close", "eye_c", "fingertip", "lid", "lid_end", "look_a", "around", "feel", "that", "still", "walking",
          "blind", "blind_end", "a_ch", "chameleon", "gets", "two", "leashes", "leashes_end", "one_f", "forward", "one_b",
          "back", "back_end", "fly_in", "until", "spots", "fly_land", "a_f", "fly", "fly_end", "snap", "gulp", "now_b", "try",
          "right2", "one_r", "one_r_end", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
_st = {s_["id"]: s_["start"] for s_ in shots}
_LEAF = lambda k: {"kind": k, "col": "#2C6B30", "lit": "#66B24E"}
_GRASS = lambda k: {"kind": k, "col": "#2E7030", "lit": "#6CBB4C"}
CAMERA = {
    # handheld: calm on the test, tense on the tugs and the fly, the hook's amount on the loop
    "hand": {"hook": 0.25, "answer": 0.3, "tug": 0.35, "close": 0.25, "feel": 0.25, "weird": 0.3, "fly": 0.4, "button": 0.25,
             "loop": 0.25},
    # whips at the story turns: from the test to the answer, into the closed-eye retest, into the chameleon
    "whip": [[_st["answer"], -1], [_st["close"], 1], [_st["weird"], -1]],
    # punch-ins on the punchline ("leash"), the proof ("blindfolded") and the cross-eyed fly (all on his face)
    "punch": [[cues["leash"] - 0.03, 1.2], [cues["blind"] - 0.03, 1.16], [cues["fly"] - 0.05, 1.22]],
    # a dutch tilt on the fail
    "tilt": [[cues["cant"] - 0.05, cues["cant_end"] + 0.12, 2.5]],
    # the light follows the stakes: hot sun on the test, a cloud on the fail, warm for the proof, back to day for the loop
    "mood": [[0, "day"], [cues["cant"] - 0.05, "shade"], [cues["look_a"] - 0.1, "warm"], [cues["a_ch"] - 0.12, "day"]],
    # the foreground in the meadow's own greens (a medium green, lit, never a black blob)
    "fg": {"hook": _LEAF("leaves-tr"), "answer": _GRASS("grass-b"), "tug": _LEAF("leaves-tl"), "close": _GRASS("grass-br"),
           "weird": _LEAF("leaves-tr"), "button": _LEAF("leaves-tr"), "loop": _LEAF("leaves-tr")},
    "air": {"hook": {"kind": "pollen", "amount": 0.7}, "answer": {"kind": "dust", "amount": 0.4}, "tug": "pollen",
            "close": "dust", "feel": "sparkle", "weird": "pollen", "fly": "dust", "button": {"kind": "pollen", "amount": 0.7},
            "loop": {"kind": "pollen", "amount": 0.7}},
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
print("shots: " + ", ".join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
