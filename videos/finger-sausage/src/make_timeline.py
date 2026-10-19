"""Edit timeline for the Why Is There a SAUSAGE Between Your Fingers? 🌭 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # "...your whole life." lands, then he raises his fingertips again: the cut to frame 1

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),            # THE TEST: a night bus, tight on him with his two index fingertips touching in front of his
                               # face on frame 0; the granny beside him side-eyes him; on "look PAST them" his eyes look past
    ("pov", "and look PAST them."),  # what he sees: the bus across the aisle sharp, his fingers big and blurred, and as he looks
                               # past them they go double and a little SAUSAGE floats between the tips; on "seeing double"
                               # the two copies light up teal and orange
    ("room", "Each eye"),      # back on him, a round window opens on his forehead and the camera dives in: the brain at its
                               # desk under two screens, LEFT EYE and RIGHT EYE, each showing his fingers from its own side;
                               # "look past them": the pictures slide out as two see-through slides in the brain's hands, held
                               # apart; "stacks them anyway": slapped together, and where two fingertips overlap... SAUSAGE
    ("wink", "Close one eye..."),  # the bus: he shuts one eye, the granny edges away down the bench
    ("gone", "Sausage gone."),   # his view with one eye shut: one copy only, the sausage goes POOF
    ("phone", "Right now,"),   # his view of his phone: the screen sharp, the bus behind it DOUBLE (two grannies); the brain
                               # in a window puts a finger to its lips: shh
    ("button", "It's been hiding"),  # the brain at its desk pulls open a drawer stuffed with sausages, shoves it shut, grins
    ("loop", None),            # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Touch your / fingertips", "together / near your eyes,", "and look / PAST them.",
    "That floating / sausage?", "Congrats...", "you are / seeing double.",
    "Each eye / sees your fingers", "from its / own side.", "Look past them,", "and the two / views split.",
    "Your brain / stacks them", "anyway...", "and two / fingertips", "overlap into / one sausage.",
    "Close / one eye...", "Sausage gone.",
    "Right now,", "everything / behind your phone", "is double...", "your brain / just doesn't", "mention it.",
    "It's been hiding / sausages", "your / whole life.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"fingertips": O, "past": Y, "sausage": Y, "sausages": Y, "double": C, "each": G, "own": G, "side": G,
         "split": C, "stacks": O, "overlap": Y, "close": R, "gone": R, "everything": C, "phone": B,
         "hiding": PK, "whole": PK, "life": PK, "congrats": V}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iS = find("Look past them,", find("Each eye"))        # word indexes where later lines start: lookups of repeated words search from here
iK = find("Your brain stacks")
iF = find("and two fingertips")
iB = find("your brain just")
iH = find("It's been hiding")
cues = {
    # the hook: fingertips together on frame 0; his eyes look past them on "look PAST"
    "touch": W("Touch"), "fingertips": W("fingertips"), "together": W("together"), "eyes": W("eyes,"), "eyes_end": E("eyes,"),
    "look": W("look PAST them."), "past": W("PAST"), "them": W("them."), "them_end": E("them."),
    # the answer: the floating sausage; congrats; seeing double
    "that": W("That floating"), "floating": W("floating"), "sausage1": W("sausage?"), "sausage1_end": E("sausage?"),
    "congrats": W("Congrats..."), "congrats_end": E("Congrats..."), "you_are": W("you are seeing"), "double1": W("double."),
    "double1_end": E("double."),
    # the room: each eye from its own side; the two views split; stacked anyway; the overlap is one sausage
    "each": W("Each eye"), "sees": W("sees"), "fingers2": W("fingers from"), "own": W("own"), "side": W("side."),
    "side_end": E("side."), "look2": W("Look past them,", s=iS), "past2": W("past", s=iS), "and_the": W("and the two", s=iS),
    "two_views": W("two views", s=iS), "views": W("views"), "split": W("split."), "split_end": E("split."),
    "stack": W("Your brain stacks", s=iK), "stacks": W("stacks"), "anyway": W("anyway..."), "anyway_end": E("anyway..."),
    "and_two": W("and two fingertips", s=iF), "tips2": W("fingertips", s=iF), "overlap": W("overlap"), "into": W("into"),
    "one_sausage": W("one sausage."), "sausage2": W("sausage.", s=iF), "sausage2_end": E("sausage.", s=iF),
    # the payoff: close one eye... sausage gone
    "close": W("Close one eye..."), "one_eye": W("one eye..."), "eye3_end": E("eye...", s=find("Close one eye")), "gone_s": W("Sausage gone."),
    "gone": W("gone."), "gone_end": E("gone."),
    # the weirdest fact: everything behind your phone is double; your brain doesn't mention it
    "right_now": W("Right now,"), "everything": W("everything"), "behind": W("behind"), "phone": W("phone"),
    "is_double": W("is double..."), "double2": W("double...", s=iB - 3), "double2_end": E("double...", s=iB - 3),
    "brain3": W("your brain just", s=iB), "doesnt": W("doesn't", s=iB), "mention": W("mention"), "mention_end": E("it.", s=iB),
    # the button: hiding sausages your whole life
    "hiding": W("hiding", s=iH), "sausages": W("sausages", s=iH), "whole": W("whole", s=iH), "life": W("life.", s=iH),
    "life_end": E("life.", s=iH),
}
cues["loop_in"] = T.duration - 0.40
assert cues["look2"] > cues["side"] and cues["sausage2"] > cues["overlap"] > cues["stacks"], "a repeated word was found in the wrong line"
assert cues["eye3_end"] > cues["one_eye"] and cues["double2"] > cues["phone"] > cues["right_now"] and cues["sausages"] > cues["hiding"] > cues["mention"], "repeated word order"
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
