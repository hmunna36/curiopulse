"""Edit timeline for the Why Does Your FUNNY BONE Hurt So Much? Short (the 30-35 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # after "Nobody's LAUGHING.": he turns to go, and his elbow finds the door frame again (frame 1)

W, E, ev, find = T.W, T.E, T.ev, T.find
DUR = T.duration
LOOP = round((DUR - 0.40) * 30) / 30   # the last 0.4 s: the doorway again, his elbow on its way to the frame (frame 1)

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),      # ONE shot through the answer: close on him in a doorway with a laundry basket, his elbow already
                         # on the door frame; the zap runs down his arm to his little finger; a tag FUNNY BONE loses both
                         # words; a window opens on his elbow, a bare nerve in it; the camera dives in
    ("mech", None),      # his arm, see-through: the nerve tucked under muscle all the way, bare at the elbow, on bone
    ("knock", None),     # the door frame again, seen inside: the nerve is squashed on the bone, the zap runs to the pinky
    ("name", None),      # the bone gets its name tag: HUMERUS ... HUMOROUS?
    ("button", None),    # the doorway: he rubs his elbow, a sock on his head
    ("loop", None),      # the picture of frame 1 again (the hook's state at negative time)
]
I_MECH = find("It hides")
special = {
    "mech": W("It hides") - 0.10,
    "knock": W("One knock") - 0.10,
    "name": W("And the bone") - 0.12,
    "button": W("Nobody's") - 0.16,
    "loop": LOOP,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You bang", "your / funny bone", "and your / whole arm", "goes", "ZAP!",
    "It's not / funny", "it's not / a bone", "it's a / naked", "NERVE!",
    "It hides", "under / muscle", "down your / whole arm", "except", "at your / elbow", "where it / runs", "over bone", "right under / the skin",
    "One knock", "squashes it", "and / the zap", "lands in / your", "PINKY", "where the / nerve ends",
    "And / the bone", "it gets / squashed", "against?", "The / humerus",
    "Humorous.", "...Maybe / that's", "the joke", "Nobody's", "LAUGHING",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea: orange = the nerve and its zap, red = "no" and the squash, pink = muscle,
# ice = bone, yellow = the reveal, violet = the joke
COLOR = {
    "bang": R, "zap!": O, "zap": O,
    "not": R, "naked": Y, "nerve": O, "nerve!": O,
    "muscle": PK, "except": Y, "elbow": Y, "bone": S, "skin": Y,
    "knock": R, "squashes": R, "pinky": Y, "ends": O,
    "squashed": R, "humerus": S, "humorous?": V, "joke": V, "laughing": Y,
}
DISPLAY = {"zap": ["ZAP!"], "nerve": ["NERVE!"], "humorous": ["HUMOROUS?"]}  # the second "humerus" is the pun, spelled out
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

HUMOROUS_E = E("Humorous")
JOKE_E = E("the joke", 1)
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: frame 0 is the bang
    "bang": W("bang"),
    "funny": W("funny bone"),
    "whole": W("whole arm"),                  # the zap runs down his forearm ...
    "goes": W("goes"),
    "zap": W("ZAP!"),                         # ... and his arm flashes its bones
    "zap_end": E("ZAP!"),
    # the answer, over the same shot: a tag on his elbow loses both its words
    "its": W("It's not funny"),               # the tag FUNNY BONE pops
    "notfunny": W("not funny", 1),            # FUNNY is struck out
    "notfunny_end": E("not funny", 1),
    "its2": W("it's not a bone"),
    "nota": W("a bone", 1),                   # BONE is struck out
    "nota_end": E("a bone", 1),
    "window": W("it's a naked") - 0.06,       # a window opens on his elbow
    "naked": W("naked"),
    "nerve": W("NERVE!"),                     # the tag turns over: NERVE
    "nerve_end": E("NERVE!"),
    "dive": SH["mech"]["start"] - 0.30,       # the camera goes in
    # 2. mech: the see-through arm
    "hides": W("It hides", 1),
    "under": W("under muscle"),
    "muscle": W("under muscle", 1),           # the muscles tuck the nerve in, shoulder to wrist
    "down": W("down your"),
    "arm2": W("whole arm", 1, I_MECH),
    "arm2_end": E("whole arm", 1, I_MECH),
    "except": W("except"),                    # ... and stop short of the elbow
    "elbow": W("elbow"),
    "elbow_end": E("elbow"),
    "where": W("where it"),
    "runs": W("runs"),
    "over": W("over bone"),
    "bone3": W("over bone", 1),               # the bony bump lights up under it
    "bone3_end": E("over bone", 1),
    "right": W("right under"),
    "under2": W("right under", 1),
    "skin": W("the skin", 1),                 # one thin line of skin on top
    "skin_end": E("the skin", 1),
    # 3. knock: the door frame, seen from inside
    "one": W("One knock"),
    "knock": W("One knock", 1),               # the frame arrives
    "squash": W("squashes"),                  # the nerve is flat between frame and bone
    "squash_end": E("squashes it", 1),
    "zap2": W("the zap", 1),                  # the pulse leaves
    "lands": W("lands"),
    "pinky": W("PINKY"),                      # it arrives: the little finger and half the ring finger light up
    "pinky_end": E("PINKY"),
    "where2": W("where the"),
    "nerve2": W("nerve ends"),
    "ends": W("nerve ends", 1),
    "ends_end": E("nerve ends", 1),
    # 4. name
    "and": W("And the bone"),
    "bone4": W("the bone it", 1),             # the upper-arm bone throbs
    "squashed": W("squashed against"),
    "against": W("against"),
    "against_end": E("against"),
    "humerus": W("humerus"),                  # its name tag lands: HUMERUS
    "humerus_end": E("humerus"),
    "humorous": W("Humorous"),                # ... and turns over: HUMOROUS?
    "humorous_end": HUMOROUS_E,
    "rimshot": HUMOROUS_E + 0.03,             # ba-dum tss, alone in the pause
    "maybe": W("Maybe"),                      # a stamp: NOBODY KNOWS
    "joke": W("the joke", 1),
    "joke_end": JOKE_E,
    # 5. button
    "nobodys": W("Nobody's"),
    "laughing": W("LAUGHING"),
    "laughing_end": E("LAUGHING"),
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): SILENT, over the last seconds (since 9 Oct 2026; reference/analytics.md).
# Nobody says "subscribe": wherever the word was spoken, as the last line or mid-video, a quarter to a half of the
# viewers still watching left within three seconds of it. The pill pops in 3.4 s before the end, the cursor clicks
# 1.25 s later, and the pill has popped out 0.6 s before the cut back to frame 1, so the loop stays clean. It plays
# over the button shot while the last line is spoken; captions that share the screen with it sit at y 1150 (main.js).
cues["sub_in"] = T.duration - 3.40
cues["sub_tap"] = cues["sub_in"] + 1.25
cues["sub_out"] = cues["sub_tap"] + 1.30       # + 0.24 s of pop-out: gone 0.61 s before the end
cues = {k: ([round(x, 3) for x in v] if isinstance(v, list) else round(v, 3)) for k, v in cues.items()}
# a chunk that would end a moment inside the pill's window is lifted to y 1150 for its whole life (main.js): it ends
# just before the pill instead, and stays where it is (why-we-cry, 10 Oct 2026)
for _c in caps:
    if _c["start"] < cues["sub_in"] < _c["end"] < cues["sub_in"] + 0.3:
        _c["end"] = round(cues["sub_in"] - 0.08, 3)
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first cut: {shots[1]["start"]:.2f} s (7.0 s or later: the opening is one shot through the answer)' if len(shots) > 1 else 'first cut: none')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print(f'subscribe cue: silent, the pill is up {cues["sub_in"]:.2f}-{cues["sub_out"] + 0.24:.2f} s of {T.duration:.2f} s'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for k, v in cues.items():
    print(f'  {k:14s} {v if isinstance(v, list) else format(v, "6.2f")}')
