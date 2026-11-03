"""Edit timeline for the Why Does Your Leg KICK When You Tap Your Knee? 🦵 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the mega kick launches his shoe, it drops back onto his
#                                      foot, his hand comes back up to tap: frame 1 picks up from there (the loop)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),               # THE TEST: tight on him sitting on the edge of the exam table, legs crossed, the side of his
                                  # hand chopping just under his kneecap (a dashed TAP target there); the foot kicks on its own
                                  # on "kneecap"; "That wasn't you": hands up, not me; "That was your SPINE": his coat goes see-through
                                  # from the lower back and the spine lights up, its lowest bone opens its eyes and waves
    ("xray", None),               # the same room, no cut to a diagram: "Tap again" (the viewer taps again, he kicks again at full
                                  # speed), then REPLAY x300: the thigh goes see-through, the tap dents the cord under the kneecap and
                                  # the thigh muscle STRETCHES; a spark runs up the wire to the spine ("pings"), the spine YANKS the
                                  # cord back ("yanks"), the muscle bunches and the shin swings up on "back"; REAL SPEED: 1/50 s
    ("brain", "Your brain?"),     # whip up to his head: a round window on his forehead, his brain asleep in a sleep mask; the memo
                                  # FYI: LEG KICKED flutters in late, the brain lifts the mask: "?"
    ("lab", "In nineteen-oh-two,"),   # 1902 in sepia: a volunteer (him, in a waistcoat) on a high stool, two little hammers aimed at
                                  # his knees, the scientist rings a hand bell, then the hammers tap and the legs kick; "150 TRIES
                                  # LATER": the bell ALONE, the hammers stay put, the legs kick anyway; the scientist's monocle drops
    ("hall", "He told"),          # 1904: the scientist at a lectern, the experts in rows seen from behind, nobody moves; "crickets":
                                  # a cricket on a chair back chirps, one top hat tips forward asleep
    ("dog", "Pavlov's"),          # hard cut: a dog in a spotlight, flashbulbs, a gold medal and a marquee: PAVLOV'S DOG; the
                                  # scientist in the dark foreground, deadpan
    ("button", "No kick?"),       # back to the hook's framing: he taps, nothing; "Clench your teeth": a grimace; "and tap again":
                                  # a MEGA kick, the shoe flies up out of frame and drops back onto his foot: frame 1
]
special = {"xray": T.W("Tap again") - 0.10}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Cross your / legs.", "Tap just under / your kneecap.", "Did it / KICK?",
    "That wasn't / you.", "That was / your SPINE.",
    "Tap again.", "That stretches / your thigh", "muscle...", "it pings / your spine,", "and your spine / yanks it back.",
    "Your brain?", "Wasn't even / asked.",
    "In nineteen-oh-two,", "a scientist / rang a bell", "before / each tap.", "Then the bell / ALONE", "made legs / kick.",
    "He told / the experts...", "crickets.", "Pavlov's dog", "got famous / instead.",
    "No kick?", "Clench your / teeth...", "and tap / again.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
COLOR = {"cross": Y, "legs": Y, "kneecap": Y, "kick": R, "you": C, "spine": O, "tap": Y, "stretches": PK, "thigh": PK,
         "muscle": PK, "pings": C, "yanks": O, "back": O, "brain": V, "asked": V, "1902": Y, "bell": Y, "alone": R,
         "experts": B, "crickets": G, "pavlov's": Y, "dog": Y, "famous": Y, "clench": R, "teeth": R, "again": Y}
DISPLAY = {"in nineteen-oh-two": ["IN", "1902"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_tap1 = find("Tap just")
i_tap2 = find("Tap again")
i_btn = find("and tap again")
i_bell2 = find("bell ALONE")
i_kick3 = find("legs kick")
cues = {
    # the hook: the test
    "cross": W("Cross"), "legs": W("legs."), "legs_end": E("legs."), "tapw": T.ws[i_tap1], "just": W("just"),
    "under": W("under"), "kneecap": W("kneecap."), "kneecap_end": E("kneecap."), "did": W("Did"), "kickw": W("KICK?"),
    "kickw_end": E("KICK?"),
    # the answer
    "that1": W("That wasn't"), "wasnt": W("wasn't"), "you": W("you."), "you_end": E("you."), "that2": W("That was"),
    "spine1": W("SPINE."), "spine1_end": E("SPINE."),
    # tap again, and the replay
    "tap3w": T.ws[i_tap2], "again1_end": E("again.", s=i_tap2), "stretches": W("stretches"), "stretches_end": E("stretches"),
    "thigh": W("thigh"), "muscle": W("muscle..."), "muscle_end": E("muscle..."), "pings": W("pings"),
    "spine2": W("spine", s=find("pings your spine")), "spine2_end": E("spine", s=find("pings your spine")), "spine3": W("spine", s=find("your spine yanks")), "yanks": W("yanks"),
    "back": W("back."), "back_end": E("back."),
    # the brain
    "brainw": W("brain?"), "wasnt2": W("Wasn't even"), "even": W("even"), "asked": W("asked."), "asked_end": E("asked."),
    # 1902
    "in1902": W("In nineteen-oh-two"), "y1902": W("nineteen-oh-two,"), "scientist": W("scientist"), "rang": W("rang"),
    "bell1": W("bell"), "before": W("before"), "each": W("each"), "tap4w": T.ws[find("each tap") + 1], "tap4w_end": T.we[find("each tap") + 1],
    "then": W("Then"), "bell2": T.ws[i_bell2], "alone": W("ALONE"), "alone_end": E("ALONE"), "made": W("made"),
    "kick3w": T.ws[i_kick3 + 1], "kick3w_end": T.we[i_kick3 + 1],
    # 1904
    "he": W("He told"), "experts": W("experts..."), "experts_end": E("experts..."), "crickets": W("crickets."),
    "crickets_end": E("crickets."),
    # the dog
    "pavlov": W("Pavlov's"), "dogw": W("dog"), "famous": W("famous"), "instead": W("instead."), "instead_end": E("instead."),
    # the button
    "no": W("No kick?"), "kick4w": W("kick?", s=find("No kick?")), "kick4w_end": E("kick?", s=find("No kick?")),
    "clenchw": W("Clench"), "teeth": W("teeth..."), "teeth_end": E("teeth..."), "and": T.ws[i_btn], "tap5w": T.ws[i_btn + 1],
    "again2": T.ws[i_btn + 2], "again2_end": T.we[i_btn + 2],
}
D = T.duration
# the hook: he taps once (a twitch), finds the spot, taps again and the foot kicks by itself
cues["tap1"] = round(cues["tapw"] + 0.06, 3)                    # a first chop: only a twitch
cues["tap2"] = round(cues["kneecap"] + 0.14, 3)                 # the spot: the chop lands
cues["kick1"] = round(cues["tap2"] + 0.07, 3)                   # and the foot swings up on its own
cues["look1"] = round(cues["kickw"] - 0.10, 3)                  # a glance at us: did yours?
cues["notme"] = round(cues["that1"] - 0.06, 3)                  # hands up, palms out: not me
cues["pullback"] = round(cues["that2"] - 0.10, 3)               # the camera eases back to his back
cues["xspine"] = round(cues["spine1"] - 0.06, 3)                # the coat goes see-through from the lower back: the spine lights up
cues["wave"] = round(cues["spine1"] + 0.30, 3)                  # its lowest bone opens its eyes and waves
# tap again: full speed, then the replay
cues["tap3"] = round(cues["tap3w"] + 0.06, 3)
cues["kick2"] = round(cues["tap3"] + 0.07, 3)
cues["replay"] = round(cues["again1_end"] + 0.02, 3)            # REPLAY x300: the leg rewinds, the thigh goes see-through
cues["slowtap"] = round(cues["stretches"] - 0.10, 3)            # the slow chop lands under the kneecap
cues["stretch"] = round(cues["stretches"] + 0.02, 3)            # the thigh muscle stretches
cues["label"] = round(cues["thigh"] - 0.04, 3)                  # THIGH MUSCLE
cues["ping"] = round(cues["pings"] - 0.02, 3)                   # a spark leaves the muscle up the wire
cues["catch"] = round(cues["spine2"] + 0.02, 3)                 # the spine catches it
cues["yank"] = round(cues["yanks"] - 0.04, 3)                   # the spine yanks the cord: the spark runs back down
cues["kick3"] = round(cues["back"] - 0.02, 3)                   # the muscle bunches, the shin swings up
cues["speed"] = round(cues["back_end"] - 0.15, 3)               # REAL SPEED: 1/50 s
# the brain
cues["window"] = round(cues["brainw"] - 0.12, 3)                # the window on his forehead is open by the time "brain" lands
cues["memo"] = round(cues["wasnt2"] + 0.02, 3)                  # FYI: LEG KICKED flutters in late
cues["memo_land"] = round(cues["even"] + 0.12, 3)
cues["wake"] = round(cues["asked"] + 0.02, 3)                   # the brain lifts its mask: "?"
# 1902
cues["stamp"] = round(cues["y1902"] - 0.04, 3)                  # the 1902 stamp on the photo
cues["ding1"] = round(cues["bell1"] - 0.02, 3)                  # the hand bell
cues["hammer1"] = round(cues["tap4w"] - 0.06, 3)                # the two little hammers tap
cues["kick4"] = round(cues["hammer1"] + 0.08, 3)                # both legs kick
cues["later"] = round(cues["then"] - 0.10, 3)                   # 150 TRIES LATER
cues["ding2"] = round(cues["alone_end"] + 0.02, 3)              # the bell, alone (in the pause after "ALONE"): the hammers stay up
cues["kick5"] = round(cues["ding2"] + 0.08, 3)                  # and the legs kick anyway
cues["ding3"] = round(cues["kick3w_end"] + 0.04, 3)             # he rings again to be sure (after "kick.")
cues["kick6"] = round(cues["ding3"] + 0.08, 3)
cues["monocle"] = round(cues["kick6"] + 0.12, 3)                # the scientist's monocle drops
# 1904
cues["y1904"] = round(cues["he"] - 0.02, 3)
cues["point"] = round(cues["experts"] - 0.05, 3)                # he points at his chalkboard: nobody moves
cues["chirp"] = round(cues["crickets"] - 0.04, 3)               # a cricket chirps on a chair back
cues["nod"] = round(cues["crickets_end"] + 0.05, 3)             # a top hat tips forward, asleep
# the dog
cues["flash1"] = round(cues["pavlov"] + 0.05, 3)                # flashbulbs
cues["medal"] = round(cues["famous"] - 0.04, 3)                 # the gold medal swings in
cues["sigh"] = round(cues["instead"] + 0.05, 3)                 # the scientist's shoulders drop
# the button
cues["dud"] = round(cues["kick4w"] + 0.02, 3)                   # he taps: nothing
cues["clench"] = round(cues["clenchw"] + 0.06, 3)               # teeth clenched, face going red
cues["tap6"] = round(cues["tap5w"] + 0.05, 3)
cues["mega"] = round(cues["tap6"] + 0.07, 3)                    # the MEGA kick: the shoe launches
cues["shoe_land"] = round(D - 0.55, 3)                          # the shoe drops back onto his foot
cues["reset"] = round(D - 0.40, 3)                              # his hand back up, face calm: frame 1
_order = ["cross", "legs", "legs_end", "tapw", "tap1", "just", "under", "kneecap", "tap2", "kick1", "kneecap_end", "did",
          "look1", "kickw", "kickw_end", "notme", "that1", "wasnt", "you", "you_end", "pullback", "that2", "xspine", "spine1",
          "wave", "spine1_end", "tap3w", "tap3", "kick2", "again1_end", "replay", "slowtap", "stretches", "stretch",
          "stretches_end", "label", "thigh", "muscle", "muscle_end", "ping", "pings", "spine2", "catch", "spine2_end",
          "spine3", "yank", "yanks", "kick3", "back", "speed", "back_end", "window", "brainw", "wasnt2", "memo", "even",
          "memo_land", "asked", "wake", "asked_end", "in1902", "stamp", "y1902", "scientist", "rang", "ding1", "bell1", "before",
          "each", "hammer1", "tap4w", "kick4", "tap4w_end", "later", "then", "bell2", "alone", "alone_end", "ding2", "kick5",
          "made", "kick3w", "kick3w_end", "ding3", "kick6", "monocle", "y1904", "he", "point", "experts", "experts_end", "chirp",
          "crickets", "crickets_end", "nod", "pavlov", "flash1", "dogw", "medal", "famous", "instead", "sigh", "instead_end",
          "no", "kick4w", "dud", "kick4w_end", "clenchw", "clench", "teeth", "teeth_end", "and", "tap5w", "tap6", "mega",
          "again2", "again2_end", "shoe_land", "reset"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
assert set(_order) == set(cues), set(cues) ^ set(_order)
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s in shots:
    print(f'  shot {s["id"]:7s} {s["start"]:6.2f} -> {s["end"]:6.2f}')
