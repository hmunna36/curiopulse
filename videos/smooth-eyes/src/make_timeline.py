"""Edit timeline for the Can You Move Your Eyes SMOOTHLY? 👀 Short.

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
SHOTS = [
    ("hook", None),             # THE TEST, tight (frame 0): his eyes, huge, on a mountain meadow; he tries a slow
                                # film-star pan across the valley and his eyes JUMP in hard steps (tick... tick...),
                                # a ghost pupil left at every stop; strain, brows working
    ("pov", "Slide them"),      # what he sees: the valley through a camera viewfinder (corner brackets, REC) that
                                # JUMPS across the panorama in four hard steps, like a broken slideshow
    ("answer_a", "Jumpy,"),     # whip: a low medium shot; "Jumpy, right?": he scowls, his eyes still stepping, a JUMP
                                # tally over his head
    ("answer_b", "Your eyes can't"),  # close: he squints and tries harder; "glide...": the flash-forward window (his eyes in
                                # the dark, gliding); cut_tight on "something": his strained eyes, macro
    ("chase", None),            # "CHASE.": a butterfly zips past his face and his eyes (and head) GLIDE after it, butter
                                # smooth (hitstop on its pass); he's delighted
    ("finger_a", "Hold up"),    # medium-close from his other side: he raises one finger by his cheek (the viewer does too)
    ("finger_b", "Move it"),    # macro on his eyes and the fingertip: the finger slides slowly, his eyes glide with it
                                # on a smooth unbroken trail (vs the hook's dotted steps); "chase it": the butterfly lands
                                # on the fingertip
    ("ride", "Smooth!"),        # close: "Smooth!" he beams (punch-in); "hitch a ride": two dotted tow lines from his
                                # pupils clip onto the fingertip (the butterfly riding it) and pull his eyes along
    ("dark_a", None),           # CLICK: pitch dark. Only his eyes (and the butterfly's two tiny ones) in deep navy
    ("dark_b", "they'll"),      # the longest shot: a dashed ghost of his finger slides through the dark and his eyes
                                # glide after it (a little wobbly: SORT OF); dead silence after "brain"
    ("feel", None),             # "FEELS": beads race from the ghost fingertip down his arm to a little brain that lights
                                # up (the biggest hit); then the butterfly flies into his nose in the dark: boop
    ("button", None),           # lights on: "Now lose the finger." he drops it (the butterfly flutters off); "Try again."
                                # his eyes go back to the far left and start stepping: frame 1's picture
    ("loop", None),             # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {
    "chase": T.W("CHASE.") - 0.08,
    "dark_a": T.W("Even") - 0.24,
    "feel": T.W("FEELS") - 0.04,
    "button": T.W("Now lose") - 0.12,
    "loop": T.duration - 0.40,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Can you move / your eyes", "smoothly?", "Slide them / across the room.",
    "Jumpy, right?", "Your eyes / can't glide...", "without something", "to CHASE.",
    "Hold up / a finger.", "Move it slowly...", "and chase it.",
    "Smooth!", "Your eyes hitch", "a ride on it.",
    "Even in / pitch dark,", "they'll still ride", "your finger...",
    "because your brain", "FEELS it move.",
    "Now lose / the finger.", "Try again.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"smoothly": C, "slide": O, "jumpy": R, "glide": C, "chase": Y, "finger": O, "slowly": C, "smooth": G,
         "ride": G, "dark": V, "feels": Y, "brain": PK, "again": O}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, find = T.W, T.E, T.find
iF = find("Hold up")
iR = find("Smooth!")
iD = find("Even in")
iB = find("Now lose")
cues = {
    # the hook
    "can": W("Can"), "move1": W("move your"), "eyes1": W("eyes smoothly"), "smoothly": W("smoothly?"), "smoothly_end": E("smoothly?"),
    "slide": W("Slide"), "across": W("across"), "room": W("room."), "room_end": E("room."),
    # the answer
    "jumpy": W("Jumpy,"), "right": W("right?"), "right_end": E("right?"), "your_a": W("Your eyes can't"), "cant": W("can't"),
    "glide": W("glide..."), "glide_end": E("glide..."), "without": W("without"), "something": W("something"),
    "to": W("to CHASE."), "chase": W("CHASE."), "chase_end": E("CHASE."),
    # the finger
    "hold": W("Hold", s=iF), "up": W("up", s=iF), "finger1": W("finger.", s=iF), "finger1_end": E("finger.", s=iF),
    "move2": W("Move it"), "slowly": W("slowly..."), "slowly_end": E("slowly..."), "and_c": W("and chase"),
    "chase2": W("chase it."), "it2": W("it.", s=find("chase it.")), "it2_end": E("it.", s=find("chase it.")),
    # the ride
    "smooth": W("Smooth!", s=iR), "smooth_end": E("Smooth!", s=iR), "your_r": W("Your eyes hitch"), "hitch": W("hitch"),
    "ride1": W("ride on"), "it3": W("it.", s=find("on it.")), "it3_end": E("it.", s=find("on it.")),
    # the dark
    "even": W("Even", s=iD), "pitch": W("pitch"), "dark": W("dark,"), "dark_end": E("dark,"), "theyll": W("they'll"),
    "still": W("still"), "ride2": W("ride your"), "finger2": W("finger...", s=find("your finger...")),
    "finger2_end": E("finger...", s=find("your finger...")),
    # the feel
    "because": W("because"), "brain": W("brain"), "brain_end": E("brain"), "feels": W("FEELS"), "feels_end": E("FEELS"),
    "it4": W("it move."), "move3": W("move.", s=find("it move.")), "move3_end": E("move.", s=find("it move.")),
    # the button
    "now": W("Now", s=iB), "lose": W("lose"), "finger3": W("finger.", s=iB), "finger3_end": E("finger.", s=iB),
    "try": W("Try"), "again": W("again."), "again_end": E("again."),
}
cues["loop_in"] = round(T.duration - 0.40, 3)
# the hook's eye jumps (his eyes hop RIGHT in steps while he tries to pan): five stops from far left to far right
cues["hops"] = [0.42, 0.86, 1.24, 1.62]
# what he sees: the viewfinder jumps across the valley in steps (the clicks of a broken slideshow)
cues["pov_hops"] = [round(cues["slide"] + 0.06, 3), round(cues["across"] - 0.02, 3), round(cues["room"] - 0.06, 3),
                    round(cues["room_end"] + 0.12, 3)]
# in the answer he keeps trying: more jumps (back to the left, then steps right again)
cues["hops2"] = [round(cues["right"] + 0.05, 3), round(cues["your_a"] + 0.20, 3), round(cues["cant"] + 0.12, 3),
                 round(cues["glide"] + 0.30, 3), round(cues["without"] - 0.02, 3), round(cues["something"] + 0.28, 3),
                 round(cues["to"] + 0.08, 3)]
cues["cut_tight"] = round(cues["something"] - 0.05, 3)                  # answer_b: the camera jumps to the macro of his eyes
cues["cut_rope"] = round(cues["your_r"] - 0.06, 3)                      # ride: the camera jumps to the eyes and the tow lines
# the butterfly: in from screen-left on "CHASE.", past his face, out right; back in to land on the fingertip on "chase it."
cues["fly_in"] = round(cues["chase"] - 0.05, 3)
cues["fly_pass"] = round(cues["chase_end"] + 0.04, 3)       # it passes his nose just after the word
cues["fly_land"] = round(cues["chase2"] + 0.02, 3)
# the finger: up on "Hold up a finger.", sliding from "Move it" to the end of the ride
cues["finger_up"] = round(cues["hold"] - 0.05, 3)
cues["finger_go"] = round(cues["move2"] - 0.05, 3)
# the dark: the click a beat before "Even"; the ghost finger in on "they'll"; the beads and the brain on "FEELS"
cues["click"] = round(cues["even"] - 0.22, 3)
cues["ghost_in"] = round(cues["theyll"] - 0.10, 3)
cues["bonk"] = round(cues["move3_end"] + 0.12, 3)                       # the butterfly flies into his nose in the gap
cues["lights_on"] = round(cues["now"] - 0.12, 3)
# blinks of his big eyes (acting: ship bar 7d); never in the first 0.7 s or the loop's last 0.6 s
cues["blinks"] = [round(cues["right_end"] + 0.06, 3), round(cues["finger1_end"] - 0.2, 3), round(cues["slowly_end"] + 0.03, 3),
                  round(cues["smooth_end"] + 0.12, 3), round(cues["finger2"] - 0.45, 3), round(cues["try"] - 0.35, 3)]
_order = ["can", "move1", "eyes1", "smoothly", "smoothly_end", "slide", "across", "room", "room_end", "jumpy", "right",
          "right_end", "your_a", "cant", "glide", "glide_end", "without", "cut_tight", "something", "to", "fly_in", "chase",
          "chase_end", "fly_pass", "finger_up", "hold", "up", "finger1", "finger1_end", "finger_go", "move2", "slowly",
          "slowly_end", "and_c", "chase2", "fly_land", "it2", "it2_end", "smooth", "smooth_end", "cut_rope", "your_r", "hitch",
          "ride1", "it3", "it3_end", "click", "even", "pitch", "dark", "dark_end", "ghost_in", "theyll", "still", "ride2",
          "finger2", "finger2_end", "because", "brain", "brain_end", "feels", "feels_end", "it4", "move3", "move3_end", "bonk",
          "lights_on", "now", "lose", "finger3", "finger3_end", "try", "again", "again_end", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"

# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
_st = {s_["id"]: s_["start"] for s_ in shots}
_LEAF = lambda k: {"kind": k, "col": "#2C6B30", "lit": "#66B24E"}
_GRASS = lambda k: {"kind": k, "col": "#2E7030", "lit": "#6CBB4C"}
CAMERA = {
    # handheld: calm on the test, a little tense on the fail and the chase, nearly still in the dark
    "hand": {"hook": 0.25, "pov": 0.2, "answer_a": 0.3, "answer_b": 0.3, "chase": 0.4, "finger_a": 0.25, "finger_b": 0.2,
             "ride": 0.25, "dark_a": 0.15, "dark_b": 0.15, "feel": 0.25, "button": 0.25, "loop": 0.25},
    # whips at the story turns: from the test to the verdict, onto the butterfly's chase, and the lights coming back on
    "whip": [[_st["answer_a"], -1], [_st["chase"], 1], [_st["button"], -1]],
    # punch-ins on the punchline (CHASE), the success (Smooth!) and the payoff's sting (FEELS)
    "punch": [[cues["chase"] - 0.03, 1.18], [cues["smooth"] - 0.03, 1.15], [cues["feels"] - 0.02, 1.2]],
    # a dutch tilt on the fail
    "tilt": [[cues["jumpy"] - 0.05, cues["right_end"] + 0.15, 3.0]],
    # a hitstop as the butterfly passes his nose and his eyes lock on
    "hit": [[cues["fly_pass"], 4]],
    # he finds something out: the butterfly, the smooth glide, the brain
    "act": {"brow": [cues["chase"] + 0.1, cues["smooth"] + 0.05, cues["feels"] + 0.1]},
    # the light follows the stakes: sunny test, a cloud on the fail, golden for the glide, a spotlight in the dark, day again
    "mood": [[0, "day"], [cues["jumpy"] - 0.05, "shade"], [cues["chase"] - 0.05, "warm"], [cues["click"], "spot", 0.12],
             [cues["lights_on"], "day", 0.3]],
    # the foreground in the meadow's own greens (lit, never a black blob); none in the dark
    "fg": {"hook": _LEAF("leaves-tr"), "answer_a": _GRASS("grass-b"), "chase": _LEAF("leaves-tl"), "finger_a": _GRASS("grass-br"),
           "ride": _LEAF("leaves-tr"), "button": _LEAF("leaves-tr"), "loop": _LEAF("leaves-tr")},
    "air": {"hook": {"kind": "pollen", "amount": 0.7}, "pov": {"kind": "pollen", "amount": 0.5}, "answer_a": {"kind": "dust", "amount": 0.4},
            "answer_b": "pollen", "chase": "pollen", "finger_a": "pollen", "finger_b": {"kind": "pollen", "amount": 0.5},
            "ride": "sparkle", "button": {"kind": "pollen", "amount": 0.7}, "loop": {"kind": "pollen", "amount": 0.7}},
    # the flash-forward: in the pause after "glide...", a window shows his eyes gliding in the dark (dark_b, part-way in)
    "flash": [[cues["glide_end"] - 0.06, 0.6, _st["dark_b"] + 1.15, {"win": [790, 660, 170], "at": [540, 900], "zoom": 1.25}]],
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
