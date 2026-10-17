"""Edit timeline for the Why Does Your Foot FLIP When You Draw a 6? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # "It's a copycat.": the shoe with cat ears copies the hand, then the cut back to
#                                      frame 1 (the loop)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),                  # THE TEST, the night office seen as a mirror (his right side is screen-right, like the
                                     # viewer's own reflection): tight on him, his right foot circling clockwise (an orange
                                     # trail), his right finger up; "draw a six" his finger draws a glowing cyan 6; as the
                                     # 6's loop goes round, the foot stutters and FLIPS to the 6's way; "HIJACKED" a dotted
                                     # tow rope from the fingertip to the toe, both looping together
    ("boss", "Your right hand and"), # the same office, a little wider: his hand and foot still looping together; his head
                                     # turns to glass: two halves of a brain; "the LEFT side" lights up with a face and a tie
                                     # (BOSS), glowing cords from it cross his neck to his right hand and his right foot
    ("same", "It wants them"),       # inside the left half: the boss at a desk with two wheels, HAND and FOOT, on one belt;
                                     # SAME WAY; "the six" spins the HAND wheel the 6's way and the belt drags the FOOT wheel
                                     # along while the boss's other hand tries to hold it; a monitor shows his foot flipping
    ("payoff", "Now try"),           # back in the office: his LEFT hand draws the 6, the foot keeps going clockwise (tick);
                                     # in his glass head the RIGHT half lights for the left hand: TWO BOSSES
    ("weird", "Weirder?"),           # he sits still, eyes shut, imagining it: a thought bubble where the 6 and the foot loop,
                                     # and the foot still stumbles; 2023 STUDY, SLOWER, JUST IMAGINING
    ("button", "Your foot's"),       # close on his foot, looping with the hand again: NOT BROKEN; "copycat" cat ears and
                                     # whiskers pop onto the shoe, it copies the hand, meow
    ("loop", None),                  # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Circle your / right foot", "clockwise,", "and draw / a six", "with your / right hand.",
    "Yep,", "your hand just / HIJACKED", "your foot.",
    "Your right hand / and foot", "share a boss...", "the LEFT side / of your brain.",
    "It wants them", "going the / SAME way,", "so the six", "drags your / foot along.",
    "Now try / the six", "with your / LEFT hand.", "Easier, / right?",
    "Weirder?", "In one study,", "people / fumbled it", "just / IMAGINING it.",
    "Your foot's / not broken.", "It's a / copycat.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white.
# orange = the foot and its clockwise circle, cyan = the hand and its 6 (the same colours as the trails on screen)
COLOR = {"clockwise": O, "foot": O, "foot's": O, "six": C, "hand": C, "hijacked": R, "boss": Y, "left": Y,
         "brain": PK, "same": G, "way": G, "drags": R, "along": R, "easier": G, "weirder": V, "study": B,
         "fumbled": R, "imagining": V, "broken": R, "copycat": Y}
DISPLAY = {"six": ["6"]}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iA = find("Yep,")                 # word indexes where later lines start: lookups of repeated words search from here
iB = find("Your right hand and")
iS = find("It wants them")
iP = find("Now try")
iW = find("Weirder?")
iU = find("Your foot's")
cues = {
    # the test
    "circle": W("Circle"), "right1": W("right foot"), "foot1": W("foot clockwise"), "clockwise": W("clockwise,"),
    "clockwise_end": E("clockwise,"), "draw": W("draw"), "six1": W("six"), "six1_end": E("six"),
    "right2": W("right hand.", s=find("with your right")), "hand1": W("hand."), "hand1_end": E("hand."),
    # the answer
    "yep": W("Yep,"), "yep_end": E("Yep,"), "hand2": W("hand", s=iA), "just": W("just HIJACKED"),
    "hijacked": W("HIJACKED"), "hijacked_end": E("HIJACKED"), "foot2": W("foot.", s=iA), "foot2_end": E("foot.", s=iA),
    # one boss: the left side of the brain
    "your3": W("Your right hand and"), "hand3": W("hand", s=iB), "foot3": W("foot", s=iB), "foot3_end": E("foot", s=iB),
    "share": W("share"), "boss": W("boss..."), "boss_end": E("boss..."), "the_left": W("the LEFT"),
    "left1": W("LEFT", s=iB), "side": W("side"), "brain": W("brain."), "brain_end": E("brain."),
    # it wants them going the same way: the six drags the foot along
    "wants": W("wants"), "going": W("going"), "same": W("SAME"), "same_end": E("SAME"), "way": W("way,"),
    "way_end": E("way,"), "so": W("so the six"), "six2": W("six", s=iS), "six2_end": E("six", s=iS),
    "drags": W("drags"), "drags_end": E("drags"), "foot4": W("foot", s=iS), "along": W("along."), "along_end": E("along."),
    # the proof: the other hand
    "now": W("Now try"), "try": W("try"), "six3": W("six", s=iP), "six3_end": E("six", s=iP), "left2": W("LEFT", s=iP),
    "hand4": W("hand.", s=iP), "hand4_end": E("hand.", s=iP), "easier": W("Easier,"), "easier_end": E("Easier,"),
    "right3": W("right?"), "right3_end": E("right?"),
    # the weirdest fact: even imagining it
    "weirder": W("Weirder?"), "weirder_end": E("Weirder?"), "in_one": W("In one"), "study": W("study,"),
    "study_end": E("study,"), "people": W("people"), "fumbled": W("fumbled"), "fumbled_end": E("fumbled"),
    "just2": W("just IMAGINING"), "imagining": W("IMAGINING"), "imagining_end": E("IMAGINING"),
    "it_end": E("it.", s=find("IMAGINING it.") + 1),
    # the button
    "your5": W("Your foot's"), "foots": W("foot's"), "not": W("not broken"), "broken": W("broken."),
    "broken_end": E("broken."), "its": W("It's a"), "copycat": W("copycat."), "copycat_end": E("copycat."),
}
cues["loop_in"] = T.duration - 0.40
assert cues["hand2"] > cues["hand1"] and cues["hand3"] > cues["foot2"] and cues["six2"] > cues["six1"] \
    and cues["six3"] > cues["six2"] and cues["left2"] > cues["left1"] and cues["foots"] > cues["it_end"], \
    "a repeated word was found in the wrong line"
assert cues["copycat"] > cues["broken"] > cues["your5"], "the button's words are out of order"
assert cues["it_end"] > cues["imagining_end"], "the weird line's last 'it.' was found in the wrong place"

# the two loops, shared by the picture and the sound (audio.py): the foot circles, the finger draws the 6
FOOT_HZ = 0.86                       # circles a second (the foot, clockwise until the flip)
cues["foot_hz"] = FOOT_HZ
cues["six_t0"] = cues["draw"] + 0.02            # the finger starts the 6's top stroke
cues["six_loop"] = cues["six_t0"] + 0.46        # the stroke reaches the loop: the loop goes round (the 6's way)
cues["flip0"] = cues["six_loop"] + 0.12         # the foot stutters (before 3 s: the strange thing lands while they try it)...
cues["flip1"] = cues["flip0"] + 0.40            # ...and is going the 6's way
cues["tow"] = cues["hijacked"] - 0.05           # the tow rope from the fingertip to the toe
# the inside: the boss turns the HAND wheel the 6's way and the belt drags the FOOT wheel along
cues["drag0"] = cues["six2"] + 0.05
cues["drag1"] = cues["drags_end"] + 0.15
# the proof: his left hand draws the 6 while the foot keeps going clockwise
cues["six3_t0"] = cues["six3"] - 0.10
# the weird fact: the imagined foot stumbles (slows, stutters) as the imagined 6 goes round
cues["fumble0"] = cues["fumbled"] - 0.05
# the button: the cat ears pop on
cues["cat"] = cues["copycat"] + 0.02
cues["meow"] = cues["copycat_end"] + 0.06
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
