"""Edit timeline for the Why Can't You Raise Just ONE Finger? ☝️ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: his sheepish hide behind the bird, then the cut back to
#                                      frame 1 (the loop). Every Short is 30-35 s since 16 Oct 2026.

W, E, ev, find = T.W, T.E, T.ev, T.find

# repeated words: the index of each later one (find() searches from a word index)
_now2 = find("Now try just")                        # "Now try just your RING finger." (the first "Now" is the hook's)
_now3 = find("Now try the")                         # the button's "Now"
_finger2 = find("finger", find("Ring finger"))      # "Ring finger came too?"
_finger3 = find("finger", find("your RING"))        # "your RING finger."
_middle2 = find("middle finger", find("trained"))  # "his middle finger" (the first is the hook's)
_finger4 = find("finger", _middle2)                  # "his middle finger"
_one3 = find("one takes")
_gadget2 = find("gadget's")
_ring2 = find("RING", find("just your"))

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),       # THE TEST, tight on his right fist held up in front of his face on a mountain trail in the morning (round 2:
                          # "Make a fist." first, so the finger goes up by ~2.9 s)
                          # (the fist ~760 px tall, his face behind it, palm to us, so it is the viewer's own view of their
                          # fist). "Make a fist" it squeezes; "MIDDLE" the middle finger rises... and the ring finger creeps up
                          # after it; a robin lands on the middle fingertip. "Ring finger came too?" the camera pushes to the
                          # ring finger, a ring of light round it; his eyes go to it. "They're..." the robin looks at it too;
                          # "handcuffed." a pair of handcuffs swings in and CLICKS round the middle and ring fingers
    ("inside", None),     # "Now try just your RING finger" the middle drops (the robin hops onto his knuckles), the camera
                          # orbits round to the back of his hand while the ring finger tries: middle and little come too.
                          # "Stuck?" the skin turns to glass from the knuckles: four cords from the wrist to the fingers; the
                          # handcuffs are on the cords (ring to middle); "BOTH" a second pair clicks ring to little; the ring
                          # cord pulls and both neighbours' cords (and fingers) come up with it
    ("practice", None),   # back outside: the robin is a coach (a whistle, a headband) on his knuckles; reps: the middle finger
                          # up, the ring finger held down by his thumb; 1, 2, 3; "PRACTICE." the whistle
    ("parlour", None),    # 1830s, old film: the hero as Robert Schumann at a grand piano (tailcoat, cravat); ROBERT SCHUMANN
    ("keys", None),       # his hand on the keys, a wooden gadget on the piano: a cord from a little arm tied to his middle
                          # finger yanks it up and down; "stiff." it locks straight up, CRICK
    ("lid", None),        # him at the piano, the stiff finger up in a splint; "over." the lid SLAMS
    ("museum", None),     # the gadget under a glass dome on a plinth (EXHIBIT A), "fault?" a big ?; two marble historians on
                          # plinths either side argue: YES! / NO!
    ("button", None),     # the trail again: his LEFT fist, the middle finger up, the robin lands on it; "anyone." he sees us,
                          # turns it away and hides it behind the robin, grinning
    ("loop", None),       # the hook at negative time: the last frames ARE frame 1's picture (the loop)
]
# every cut lands just before the first word of a caption chunk (a cut ends the chunk on screen)
special = {
    "inside": T.ws[_now2] - 0.06,
    "practice": W("A perfect") - 0.06,
    "parlour": W("Composer") - 0.06,
    "keys": W("trained") - 0.06,
    "lid": W("Piano") - 0.06,
    "museum": W("The gadget's") - 0.06,
    "button": T.ws[_now3] - 0.06,
    "loop": T.duration - 0.45,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Make a fist.",
    "Can you raise",
    "ONLY your / middle finger?",
    "Ring finger / came too?",
    "They're...",
    "handcuffed.",
    "Now try / just your",
    "RING / finger.",
    "Stuck?",
    "It's cuffed",
    "on BOTH / sides.",
    "A perfect / one takes",
    "PRACTICE.",
    "Composer / Robert Schumann",
    "trained his / middle finger",
    "with a / gadget...",
    "and it / went stiff.",
    "Piano / career:",
    "over.",
    "The gadget's / fault?",
    "Historians / still argue.",
    "Now try the / OTHER hand...",
    "just don't / point it",
    "at anyone.",
]
Y, O, C, R, G, B, V, S, Pk = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"only": Y, "fist": O, "middle": Y, "ring": R, "handcuffed": S, "both": Y, "cuffed": S, "practice": G,
         "schumann": V, "gadget": O, "stiff": R, "over": R, "fault": Y, "historians": V, "argue": R, "other": Y,
         "anyone": R}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # the hook: the test
    "make": W("Make"), "fist": W("fist"), "fist_end": E("fist"),
    "can": W("Can you"), "raise": W("raise"), "only": W("ONLY"), "middle": W("middle"), "middle_end": E("middle"),
    "finger1": W("finger"), "finger1_end": E("finger"),
    # the answer
    "ring": W("Ring finger"), "finger2": T.ws[_finger2], "came": W("came"), "too": W("too"), "too_end": E("too"),
    "theyre": W("They're"), "theyre_end": E("They're"), "cuffs": W("handcuffed"), "cuffs_end": E("handcuffed"),
    # the retry, inside the hand
    "now2": T.ws[_now2], "try2": W("try just"), "just2": W("just your"), "ring2": T.ws[_ring2], "finger3": T.ws[_finger3],
    "finger3_end": T.we[_finger3],
    "stuck": W("Stuck"), "stuck_end": E("Stuck"), "its": W("It's"), "cuffed": W("cuffed on"), "on": W("on BOTH"),
    "both": W("BOTH"), "both_end": E("BOTH"), "sides": W("sides"), "sides_end": E("sides"),
    # practice
    "a": W("A perfect"), "perfect": W("perfect"), "one3": T.ws[_one3], "takes": W("takes"), "practice": W("PRACTICE"),
    "practice_end": E("PRACTICE"),
    # Schumann
    "composer": W("Composer"), "robert": W("Robert"), "schumann": W("Schumann"), "schumann_end": E("Schumann"),
    "trained": W("trained"), "his": W("his middle"), "middle2": T.ws[_middle2], "finger4": T.ws[_finger4],
    "with": W("with a"), "gadget": W("gadget"), "gadget_end": E("gadget"),
    "and": W("and it"), "went": W("went"), "stiff": W("stiff"), "stiff_end": E("stiff"),
    "piano": W("Piano"), "career": W("career"), "career_end": E("career"), "over": W("over"), "over_end": E("over"),
    # the historians
    "the": W("The gadget's"), "gadget2": T.ws[_gadget2], "fault": W("fault"), "fault_end": E("fault"),
    "historians": W("Historians"), "historians_end": E("Historians"), "still": W("still"), "argue": W("argue"),
    "argue_end": E("argue"),
    # the button
    "now3": T.ws[_now3], "try3": W("try the"), "other": W("OTHER"), "hand": W("hand"), "hand_end": E("hand"),
    "just3": W("just don't"), "dont": W("don't"), "point": W("point"), "at": W("at anyone"), "anyone": W("anyone"),
    "anyone_end": E("anyone"),
}
order = ["make", "fist", "can", "raise", "only", "middle", "finger1", "ring", "finger2", "came", "too",
         "theyre", "cuffs", "now2", "try2", "just2", "ring2", "finger3", "stuck", "its", "cuffed", "on", "both", "sides",
         "a", "perfect", "one3", "takes", "practice", "composer", "robert", "schumann", "trained", "his", "middle2", "finger4",
         "with", "gadget", "and", "went", "stiff", "piano", "career", "over", "the", "gadget2", "fault", "historians", "still",
         "argue", "now3", "try3", "other", "hand", "just3", "dont", "point", "at", "anyone"]
for a, b in zip(order, order[1:]):
    assert cues[a] < cues[b], f"cue order: {a} {cues[a]} !< {b} {cues[b]}"
# beats the picture and the sound share
cues["lift_m"] = round(cues["middle"] - 0.05, 3)                  # the middle finger starts up on "MIDDLE"
cues["creep"] = round(cues["middle"] + 0.18, 3)                   # ... and the ring finger creeps up after it
cues["land"] = round(cues["finger1_end"] - 0.02, 3)               # the robin lands on the fingertip
cues["click"] = round(cues["cuffs_end"] + 0.03, 3)                # the handcuffs lock (in the pause after "handcuffed.")
cues["drop_m"] = round(cues["now2"] + 0.05, 3)                    # the middle finger drops
cues["try_r"] = round(cues["ring2"] - 0.08, 3)                    # the ring finger tries on "RING"
cues["glass"] = round(cues["stuck"] - 0.05, 3)                    # the skin turns to glass on "Stuck?"
cues["click2"] = round(cues["both"] + 0.02, 3)                    # the second cuffs lock on "BOTH" (seen) ...
cues["click2_snd"] = round(cues["sides_end"] + 0.03, 3)           # ... and heard in the pause after "sides."
cues["reps"] = [round(cues["perfect"] + 0.05, 3), round(cues["one3"] + 0.12, 3), round(cues["takes"] + 0.05, 3)]
cues["whistle"] = round(cues["practice_end"] + 0.03, 3)           # the coach's whistle, after "PRACTICE."
cues["yanks"] = [round(cues["trained"] + 0.05 + 0.36 * i, 3) for i in range(6)]   # the gadget yanks the finger
cues["crick"] = round(cues["stiff_end"] + 0.03, 3)                # it locks straight (after "stiff.")
cues["slam"] = round(cues["over_end"] + 0.03, 3)                  # the lid slams (after "over.")
cues["qmark"] = round(cues["fault_end"] + 0.02, 3)                # a big ? (after "fault?")
cues["yes"] = round(cues["historians_end"] + 0.03, 3)             # the first bust: YES!
cues["no"] = round(cues["argue"] - 0.25, 3)                       # the second: NO!
cues["yes2"] = round(cues["argue_end"] + 0.05, 3)                 # and again
cues["lift_m2"] = round(cues["other"] - 0.05, 3)                  # the left hand's middle finger rises on "OTHER"
cues["land2"] = round(cues["hand_end"] - 0.15, 3)                 # the robin lands on it
cues["see"] = round(cues["point"] - 0.02, 3)                      # he sees us
cues["hide"] = round(cues["anyone_end"] + 0.02, 3)                # he turns it away, behind the robin
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] /
# ["sub_out"] here. Nobody says "subscribe" in either arm.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print(f'subscribe: nothing said; arm: {video_subscribe(sys.argv[1]) or "none"}'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
