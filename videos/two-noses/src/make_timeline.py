"""Edit timeline for the Why Do You Feel TWO Noses? (Cross Your Fingers) 🤞 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.05)  # "Keep your fingers crossed." lands, he holds the crossed fingers up for luck, then
#                                       they go back onto his nose: the cut back to frame 1 (the loop)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),             # THE TEST, from the bathroom mirror: tight on him, his crossed fingers already rubbing the
                                # tip of his nose in the gap between them (frame 0); on "two" a second, dashed nose pops
                                # beside the real one and his eyes cross down at it; the camera rides the rub. The answer
                                # on the same shot: INDEX and MIDDLE badges on the fingertips swap places ("swapped seats");
                                # on "nobody told your brain" a round window opens on his forehead: the brain inside,
                                # asleep at its desk under its screen; the camera dives through it
    ("room", "It still"),       # the brain's room: its screen YOUR FINGERS shows the hand the brain believes in, two
                                # fingers side by side under their badges; the brain wakes and points. Then the OUTSIDE
                                # edges glow and two marbles touch them at once: 2 THINGS. Him rubbing in a round inset
    ("macro", "Cross them,"),   # back on his real hand, very close: the same two glowing edges, crossed, both on ONE nose;
                                # a thought bubble shows what the brain makes of it: his face with TWO noses. A label:
                                # ARISTOTLE'S ILLUSION, about 350 BC
    ("months", "Volunteers"),   # the same mirror, months go by: his two fingers taped crossed, a wall calendar tears off
                                # MONTH 1 .. 6 while the window goes day, night, day; on "caught on" the window on his
                                # forehead shows the brain's screen redrawn crossed, and a light bulb
    ("button", "Still two?"),   # back to the morning mirror: deadpan; he holds his crossed fingers up for luck, then
                                # brings them back to his nose
    ("loop", None),             # the last 0.4 s: the hook at negative time (the fingers arrive at his nose), so the cut
                                # to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "You've got / two noses.",
    "Cross / your fingers", "and rub / your nose", "in the gap.",
    "Your fingers / swapped seats...", "and nobody / told your brain.",
    "It still thinks", "they're / side by side.",
    "Both / OUTSIDE edges", "touched / at once?", "Always / two things.",
    "Cross them,", "and both edges", "touch / ONE nose...", "so your brain", "counts TWO.",
    "Volunteers once", "kept two fingers / crossed", "for up to / SIX MONTHS...", "until their brains / caught on.",
    "Still two?", "Keep your / fingers crossed.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"two": Y, "noses": Y, "cross": O, "fingers": O, "rub": C, "gap": C, "swapped": Y, "seats": Y, "nobody": V,
         "brain": PK, "brains": PK, "side": C, "outside": Y, "edges": Y, "things": R, "one": G, "nose": G, "counts": PK,
         "six": Y, "months": Y, "caught": G, "crossed": O, "volunteers": B}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

# the aligner gave "two" (in "Always two things.") only its t-burst and its vowel to "things": on the waveform (speech
# band, 10 ms steps) the vowel of "two" runs to +0.53 s after "Always" starts, and "things" begins at +0.57 s.
# Move the boundary (captions and QA read it).
_i = T.find("two things.")
_b0 = T.W("Always")
assert abs(T.ws[_i] - (_b0 + 0.32)) < 0.04 and T.we[_i] < _b0 + 0.48, "the edges take changed: re-check this boundary"
T.words[_i]["end"] = T.we[_i] = round(_b0 + 0.55, 3)
T.words[_i + 1]["start"] = T.ws[_i + 1] = round(_b0 + 0.57, 3)

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iA = find("Your fingers swapped")    # word indexes where later lines start: lookups of repeated words search from here
iM = find("It still")
iE = find("Both OUTSIDE")
iP = find("Cross them,")
iW = find("Volunteers")
iB = find("Still two?")
cues = {
    # the claim and the test
    "youve": W("You've"), "two1": W("two noses."), "two1_end": E("two noses."), "noses1": W("noses."), "noses1_end": E("noses."),
    "cross1": W("Cross your"), "fingers1": W("fingers", s=find("Cross your")), "rub": W("rub"), "nose1": W("nose in"),
    "gap": W("gap."), "gap_end": E("gap."),
    # the answer: they swapped seats, and nobody told your brain
    "your_f": W("Your fingers swapped"), "swapped": W("swapped"), "seats": W("seats..."), "seats_end": E("seats..."),
    "nobody": W("nobody"), "told": W("told"), "brain1": W("brain.", s=iA), "brain1_end": E("brain.", s=iA),
    # the brain's room
    "it_still": W("It still"), "thinks": W("thinks"), "side": W("side by", s=iM), "side2": W("side.", s=iM), "side2_end": E("side.", s=iM),
    "both1": W("Both"), "outside": W("OUTSIDE"), "edges1": W("edges", s=iE), "touched": W("touched"), "once": W("once?"),
    "once_end": E("once?"), "always": W("Always"), "two2": W("two things."), "things": W("things."), "things_end": E("things."),
    # back on his hand: both edges on one nose
    "cross2": W("Cross them,"), "them": W("them,"), "them_end": E("them,"), "both2": W("both", s=iP), "edges2": W("edges", s=iP), "touch": W("touch"),
    "one": W("ONE"), "nose2": W("nose...", s=iP), "nose2_end": E("nose...", s=iP), "so": W("so your"), "brain2": W("brain", s=iP),
    "counts": W("counts"), "two3": W("TWO.", s=iP), "two3_end": E("TWO.", s=iP),
    # six months
    "volunteers": W("Volunteers"), "kept": W("kept"), "two4": W("two fingers", s=iW), "crossed1": W("crossed", s=iW),
    "upto": W("up to"), "six": W("SIX"), "months": W("MONTHS..."), "months_end": E("MONTHS..."), "until": W("until"),
    "brains": W("brains"), "caught": W("caught"), "on_end": E("on."),
    # the button
    "still": W("Still two?"), "two5": W("two?", s=iB), "two5_end": E("two?", s=iB), "keep": W("Keep"),
    "fingers3": W("fingers", s=iB + 2), "crossed2": W("crossed.", s=iB), "crossed2_end": E("crossed.", s=iB),
}
cues["loop_in"] = T.duration - 0.40
assert cues["two3"] > cues["counts"] and cues["fingers3"] > cues["keep"] and cues["two4"] > cues["volunteers"] and cues["edges2"] > cues["cross2"], "a repeated word was found in the wrong line"
# the rubbing: his fingers go up and down his nose on a clock (shared by the picture and the rub sound in audio.py)
RUB_HZ = 2.6
cues["rub_hz"] = RUB_HZ
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
