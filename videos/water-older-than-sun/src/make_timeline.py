"""Edit timeline for the Is Your Water Older Than the SUN? Short.

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
# The worlds: sky-blue's mountain trail (trail.js: the hiker with his water bottle, the Sun up on the right) and this
# Short's own cloud.js (the freezing dark cloud before the Sun: dust lanes, ice grains, a baby Sun that switches on)
# and scale.js (a bathroom scale, a big water molecule with one heavy hydrogen, the baby Sun with a dummy).
SHOTS = [
    ("hook", None),            # tight on him SIPPING from his bottle on the trail; he glances up at the Sun on "the Sun",
                               # back down at the bottle on "the water"; "The WATER." he freezes mid-gulp, a sticky note
                               # LEFTOVERS slaps onto the bottle, and on "leftovers" the spit-take
    ("rewind", "Before the Sun"),  # REWIND: the picture runs backwards (VHS rewind), the Sun shrinks to a spark and goes
                               # out on "born", the mountain dissolves under his boots, a year counter spins back
    ("cloud", "up to half"),   # the freezing dark cloud: he floats in a spacesuit among glittering ice grains, his bottle
                               # half ice (a bracket UP TO 1/2), frost creeps over his helmet, -260 C, teeth chatter
    ("heavy", "How do we know"),   # a bathroom scale in the cloud: one big water molecule with ONE fat hydrogen steps on,
                               # the needle tips to HEAVY, it sucks its belly in; the baby Sun (a dummy) shakes its head
    ("button", "And you're mostly"),  # the trail again: he fills with starry water up to his chest, on "YOU" the stars in
                               # him twinkle, on "older" a long white beard POPS onto his chin, he shrugs and sips: the
                               # last frames are the hook's own drawing a moment before frame 0 (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "Quick, what's / older:",
    "the Sun...",
    "or the water / you drink?",
    "The WATER.",
    "You've been / sipping...",
    "leftovers.",
    "Before the Sun / was born,",
    "up to half / of it",
    "was ice...",
    "in a freezing, / dark cloud.",
    "How do / we know?",
    "It's a teeny / bit too",
    "HEAVY...",
    "for the baby / Sun to make.",
    "And you're / mostly water.",
    "So...",
    "bits of YOU",
    "are older / than the Sun.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"older": Y, "sun": O, "water": C, "leftovers": V, "born": O, "half": Y, "ice": S, "freezing": S, "dark": B,
         "know": G, "heavy": R, "baby": O, "you": Y}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_ans = find("The WATER", find("drink"))
i_bef = find("Before the Sun")
i_baby = find("baby Sun")
i_mw = find("mostly water")
i_you = find("bits of YOU")
i_old = find("are older than the Sun")
cues = {
    # the hook: the sip, the glance at the Sun, back to the bottle
    "older1": W("older"), "sun1": W("the Sun", 1), "sun1_end": E("the Sun", 1), "or": W("or the water"),
    "water1": W("or the water", 2), "drink": W("drink"), "q_end": E("drink"),
    # the answer: freeze, the sticky note, the spit-take
    "ans": T.ws[i_ans], "water2": T.ws[i_ans + 1], "water2_end": T.we[i_ans + 1],
    "youve": W("You've"), "sipping": W("sipping"), "sipping_end": E("sipping"),
    "left": W("leftovers"), "left_end": E("leftovers"),
    # the rewind
    "before": T.ws[i_bef], "sun2": T.ws[i_bef + 2], "born": W("born"), "born_end": E("born"),
    # the cloud
    "up": W("up to half"), "half": W("half"), "ice": W("ice"), "ice_end": E("ice"),
    "freezing": W("freezing"), "dark": W("dark"), "cloud": W("cloud"), "cloud_end": E("cloud"),
    # the scale
    "how": W("How"), "know": W("know"), "know_end": E("know"), "teeny": W("teeny"), "too": W("too HEAVY"),
    "heavy": W("HEAVY"), "heavy_end": E("HEAVY"), "baby": T.ws[i_baby], "sun3": T.ws[i_baby + 1],
    "make": W("make"), "make_end": E("make"),
    # the button
    "and": W("And you're"), "mostly": W("mostly"), "water3": T.ws[i_mw + 1], "water3_end": T.we[i_mw + 1],
    "so": W("So"), "so_end": E("So"), "bits": T.ws[i_you], "you": T.ws[i_you + 2], "you_end": T.we[i_you + 2],
    "older2": T.ws[i_old + 1], "sun4": T.ws[i_old + 4], "sun4_end": T.we[i_old + 4],
}
cues["freeze"] = cues["left"] - 0.30             # he freezes mid-gulp just before "leftovers" (a hold under 0.6 s, inside the moving shot)
cues["spit"] = cues["left"] + 0.27               # the spit-take: eight frames after the word lands
cues["gone"] = cues["born"] + 0.12               # the Sun goes out
cues["beard"] = cues["older2"] - 0.04            # the beard pops on "older"
cues["glugs"] = [round(0.14 + 0.46 * i, 3) for i in range(40) if 0.14 + 0.46 * i < cues["freeze"] - 0.35]
cues["clinks"] = [round(cues["up"] + 0.12 + 0.2 * i, 3) for i in range(4)]   # ice grains dropping into his bottle
cues["loop"] = T.duration - 0.30                 # the hard cut to the hook's own drawing, a moment before frame 0
order = ["older1", "sun1", "or", "water1", "drink", "ans", "water2", "youve", "sipping", "freeze", "left", "spit", "before",
         "sun2", "born", "gone", "up", "half", "ice", "freezing", "dark", "cloud", "how", "know", "teeny", "heavy", "baby",
         "sun3", "make", "and", "mostly", "water3", "so", "bits", "you", "beard", "older2", "sun4", "loop"]
assert all(cues[a] < cues[b] for a, b in zip(order, order[1:])), [(a, round(cues[a], 2)) for a in order]
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s
# before the end) and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says
# "subscribe" in either arm; the ask also lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
