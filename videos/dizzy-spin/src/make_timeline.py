"""Edit timeline for the Why Do You Get DIZZY When You Spin? 💫 Short (the 30-35 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # after "...finish their lap.": the liquid crosses the line, he grins, grabs the armrests and pushes off (frame 1)

W, E, ev, find = T.W, T.E, T.ev, T.find
DUR = T.duration
LOOP = round((DUR - 0.40) * 30) / 30   # the last 0.4 s: the chair again, picking up speed (the hook at negative time)

SHOTS = [
    ("hook", None),      # ONE shot through the answer: close on him spinning in an office chair, the room streaming behind
                         # him; he stops, the room does not; a round window opens on his ear with the liquid still going
                         # round, and the camera dives through it
    ("canal", None),     # the balance organ: three loops of liquid; into the bulge, the jelly flap and its hairs; TURNING!;
                         # then the walls stop and the liquid keeps going: the flap bends the other way
    ("ears", None),      # him in the chair, stopped, his head see-through: his ear yells SPINNING, his eyes yell NOPE, the
                         # brain in the middle goes round the bend
    ("stage", None),     # a ballet stage: him in a tutu, a pirouette, a perfect stop; the brain turns the SPIN dial DOWN
    ("button", None),    # the office again: he sits tight, the liquid in his ear crosses a finish line (the pill over the
                         # last 3.4 s; his face stays above y 1050)
    ("loop", None),      # the picture of frame 1 again: he grabs the armrests and spins (the hook at negative time)
]
I_PAY = find("Stop, and")
special = {
    "canal": W("It sloshes") - 0.12,
    "ears": W("Your ears yell") - 0.14,
    "stage": W("Ballet") - 0.14,
    "button": W("So sit") - 0.16,
    "loop": LOOP,
}

CHUNKS = [
    "You spin", "in your / chair", "and stop.", "The room", "DOESN'T!",
    "Your head / stopped...", "but the / liquid", "in your / ears", "DIDN'T!",
    "It sloshes", "round three / tiny loops,", "bending / little hairs", "that tell / your brain:", "TURNING!",
    "Stop,", "and it keeps / sloshing.", "Your ears / yell", "SPINNING...", "your eyes / yell", "NOPE.",
    "Ballet / dancers'", "brains / may learn", "to turn / that signal", "DOWN.",
    "So sit / down...", "and let / your ears", "finish / their lap.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "spin": Y, "chair": O, "stop": R, "room": C, "doesn't": Y, "doesn't!": Y,
    "stopped": R, "liquid": C, "ears": C, "didn't": Y, "didn't!": Y,
    "sloshes": C, "three": Y, "loops": C, "hairs": PK, "brain": PK, "turning": O, "turning!": O,
    "sloshing": C, "spinning": O, "eyes": G, "nope": R,
    "ballet": V, "dancers'": V, "brains": PK, "signal": O, "down": G,
    "sit": Y, "finish": G, "lap": Y,
}
DISPLAY = {"doesn't": ["DOESN'T!"], "didn't": ["DIDN'T!"], "turning": ["TURNING!"], "nope": ["NOPE!"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

cues = {
    "you": W("You spin"),
    "spin": W("spin"),
    "chair": W("chair"),
    "stop": W("and stop", 1),                 # his feet slam down: the chair stops dead ...
    "stop_end": E("and stop", 1),
    "room": W("The room"),                    # ... and the room keeps sliding (the other way)
    "doesnt": W("DOESN'T"),
    "doesnt_end": E("DOESN'T"),
    "head": W("Your head"),
    "stopped": W("stopped"),
    "window": W("but the liquid") - 0.06,     # a round window opens on his ear
    "liquid": W("liquid"),
    "ears": W("in your ears", 2),
    "didnt": W("DIDN'T"),                     # the liquid in the window whizzes round, WHEEE
    "didnt_end": E("DIDN'T"),
    "dive": SH["canal"]["start"] - 0.34,      # the camera goes in through the window
    "sloshes": W("sloshes"),
    "round": W("round three"),
    "three": W("three"),                      # the three loops light up, one by one
    "tiny": W("tiny"),
    "loops": W("loops"),
    "loops_end": E("loops"),
    "bending": W("bending"),                  # the camera arrives at the bulge: the jelly flap bends
    "hairs": W("little hairs", 1),            # the hairs under it bend
    "tell": W("that tell"),
    "brain": W("your brain", 1),              # a bead runs up the nerve
    "turning": W("TURNING"),                  # the hairs shout it
    "turning_end": E("TURNING"),
    "stop2": W("Stop, and"),                  # the walls stop dead
    "keeps": W("keeps", 0, I_PAY),
    "sloshing": W("sloshing"),                # the liquid keeps going: the flap bends the OTHER way
    "sloshing_end": E("sloshing"),
    "ears2": W("Your ears yell", 1),          # a mouth on his ear, with a megaphone
    "yell1": W("Your ears yell", 2),
    "spinning": W("SPINNING"),
    "spinning_end": E("SPINNING"),
    "eyes": W("your eyes yell", 1),
    "eyes_word": W("your eyes yell"),          # "your": the megaphone shout must end before it
    "yell2": W("your eyes yell", 2),
    "nope": W("NOPE"),
    "nope_end": E("NOPE"),
    "ballet": W("Ballet"),
    "dancers": W("dancers'"),
    "brains": W("brains"),                    # the brain at the dial
    "may": W("may"),
    "learn": W("learn"),
    "turn": W("to turn", 1),
    "signal": W("signal"),
    "down": W("DOWN", 0, find("signal DOWN")),
    "down_end": E("DOWN", 0, find("signal DOWN")),
    "so": W("So sit"),
    "sit": W("So sit", 1),
    "sitdown": W("sit down", 1),
    "sitdown_end": E("sit down", 1),
    "and_let": W("and let"),
    "ears3": W("let your ears", 2),
    "finish": W("finish"),
    "lap": W("lap"),                          # it crosses the finish line
    "lap_end": E("lap"),
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): SILENT, over the last seconds (since 9 Oct 2026; reference/analytics.md).
cues["sub_in"] = T.duration - 3.40
cues["sub_tap"] = cues["sub_in"] + 1.25
cues["sub_out"] = cues["sub_tap"] + 1.30       # + 0.24 s of pop-out: gone 0.61 s before the end
cues = {k: ([round(x, 3) for x in v] if isinstance(v, list) else round(v, 3)) for k, v in cues.items()}
for _c in caps:
    if _c["start"] < cues["sub_in"] < _c["end"] < cues["sub_in"] + 0.3:
        _c["end"] = round(cues["sub_in"] - 0.08, 3)
T.write(shots, caps, cues)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first cut: {shots[1]["start"]:.2f} s (7.0 s or later: the opening is one shot through the answer)' if len(shots) > 1 else 'first cut: none')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print(f'subscribe cue: silent, the pill is up {cues["sub_in"]:.2f}-{cues["sub_out"] + 0.24:.2f} s of {T.duration:.2f} s'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for k, v in cues.items():
    print(f'  {k:14s} {v if isinstance(v, list) else format(v, "6.2f")}')
