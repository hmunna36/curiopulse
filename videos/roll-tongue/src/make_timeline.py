"""Edit timeline for the Can You ROLL Your Tongue? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # "Try again." lands, he is already back at the mirror with his tongue out, trying:
#                                      the cut back to frame 1 (the loop)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),               # THE TEST, from the bathroom mirror: tight on him, tongue out, both edges wobbling up and
                                  # flopping (frame 0); "Try it right now." he looks up at us; "Can't?" his tongue flops
                                  # flat; "Don't blame your parents." a framed photo of his parents pops up beside him, both
                                  # rolling perfect tubes, and he side-eyes it
    ("bones", "Your tongue has"), # the camera dives into his tongue (still out): it turns see-through, NO BONES, then its
                                  # muscle fibres light up in three directions; an octopus pops in and curls an arm the
                                  # same way
    ("roll", "Rolling"),          # the same close-up: arrows on both edges, a slice of tongue in a round window going flat ->
                                  # U -> tube; "at ONCE" both edges snap up into a tube: TUBE!
    ("book", "School"),           # a school book slams open: TONGUE ROLLING, a family tree MOM + DAD -> YOU, ONE GENE
    ("twins", "But identical"),   # back to the mirror: his identical twin steps in beside him: SAME GENES; one rolls a
                                  # tube (tick), one can't (cross), 1952 TWIN STUDY
    ("prof", "The scientist"),    # an old photo comes to life: the 1940 scientist at a blackboard ONE GENE = ROLLER; on
                                  # "embarrassed" he goes red and hides behind his book
    ("email", "And kids"),        # a laptop: a kid types an email to a scientist, subject AM I ADOPTED?? and sends it; the
                                  # kid peeks over the screen with a flat tongue
    ("fam", "They're not."),      # the family photo: the kid squeezed between Mum and Dad, NOT ADOPTED, a tick
    ("button", "Try again."),     # back at the mirror, tongue out, trying again
    ("loop", None),               # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Can you roll / your tongue?", "Try it / right now.",
    "Can't?", "Don't blame / your parents.",
    "Your tongue / has no bones.", "It's all muscle...", "like an / octopus arm.",
    "Rolling means / curling", "both edges up", "at ONCE.",
    "School books say", "you get that / from your parents.",
    "But identical / twins?", "Same genes...", "one could,", "one couldn't.",
    "The scientist / behind it", "said he was / embarrassed.",
    "And kids / have emailed", "a scientist / asking", "if they're / ADOPTED.",
    "They're not.", "Try again.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"roll": Y, "tongue": PK, "can't": R, "parents": O, "bones": S, "muscle": PK, "octopus": V, "arm": V,
         "rolling": Y, "curling": Y, "both": C, "edges": C, "once": G, "school": B, "books": B, "identical": C,
         "twins": C, "genes": O, "could": G, "couldn't": R, "embarrassed": PK, "kids": Y, "emailed": C,
         "adopted": R, "not": G, "try": Y, "again": Y}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iH = find("Can you roll")        # word indexes where later lines start: lookups of repeated words search from here
iA = find("Can't?")
iT = find("Your tongue has")
iS = find("School books")
iI = find("But identical")
iP = find("The scientist")
iK = find("And kids")
iB = find("They're not.")
cues = {
    # the test
    "can1": W("Can you roll"), "roll1": W("roll", s=iH), "tongue1": W("tongue?", s=iH), "tongue1_end": E("tongue?", s=iH),
    "try1": W("Try it right"), "now1": W("now.", s=iH), "now1_end": E("now.", s=iH),
    # the answer
    "cant": W("Can't?"), "cant_end": E("Can't?"), "dont": W("Don't"), "blame": W("blame"),
    "parents1": W("parents.", s=iA), "parents1_end": E("parents.", s=iA),
    # no bones, all muscle, an octopus arm
    "tongue2": W("tongue", s=iT), "bones": W("bones."), "bones_end": E("bones."), "its_all": W("It's all"),
    "muscle": W("muscle..."), "muscle_end": E("muscle..."), "like": W("like an"), "octopus": W("octopus"),
    "arm": W("arm."), "arm_end": E("arm."),
    # rolling: both edges up at once
    "rolling": W("Rolling"), "curling": W("curling"), "both": W("both edges"), "edges": W("edges"), "up": W("up at"),
    "once": W("ONCE."), "once_end": E("ONCE."),
    # the school book
    "school": W("School"), "books": W("books"), "get": W("get that"), "parents2": W("parents.", s=iS),
    "parents2_end": E("parents.", s=iS),
    # the twins
    "but": W("But identical"), "identical": W("identical"), "twins": W("twins?"), "twins_end": E("twins?"),
    "same": W("Same genes"), "genes": W("genes..."), "genes_end": E("genes..."),
    "one1": W("one could,"), "could": W("could,"), "one2": W("one couldn't."), "couldnt": W("couldn't."),
    "couldnt_end": E("couldn't."),
    # the scientist
    "sci1": W("The scientist"), "behind": W("behind"), "said": W("said he"), "embarrassed": W("embarrassed."),
    "embarrassed_end": E("embarrassed."),
    # the kids' emails
    "and_kids": W("And kids"), "kids": W("kids"), "emailed": W("emailed"), "sci2": W("scientist", s=iK),
    "asking": W("asking"), "adopted": W("ADOPTED."), "adopted_end": E("ADOPTED."),
    # the button
    "theyre": W("They're not."), "not": W("not.", s=iB), "not_end": E("not.", s=iB), "try2": W("Try again."),
    "again": W("again."), "again_end": E("again."),
}
cues["loop_in"] = T.duration - 0.40
assert cues["parents2"] > cues["school"] > cues["parents1"] and cues["sci2"] > cues["sci1"] and cues["tongue2"] > cues["tongue1"], \
    "a repeated word was found in the wrong line"
assert cues["try2"] > cues["not"] > cues["adopted"], "the button's words are out of order"
# his tongue's wobble: the edges try to come up on a clock that goes round a whole number of times in the Short
# (shared by the picture and the squelch sound in audio.py)
WOB_HZ = 2.2
cues["wob_hz"] = WOB_HZ
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
