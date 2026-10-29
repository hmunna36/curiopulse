"""Edit timeline for the Can a Shrimp's Snap Get as HOT as the SUN? 🦐 Short (a CURIOUS Short, story.md §6).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
"""
import random
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # after "snap-off.": he raises his hand to snap at the shrimp again (frame 1)

SHOTS = [
    ("hook", None),                 # the reef, tight: he snaps his fingers (tk); "Cute."; the shrimp beside him SNAPS: flash, bang
    ("slowmo", "That bang"),        # SLOW-MO: the claw shuts, a jet shoots out, the water tears open into a bubble
    ("pop", "then the bubble"),     # the bubble crushes itself to a point: a white-hot flash, the shock ring, the thermometer
    ("flash", "It even"),           # it glows; he puts sunglasses on over his mask; SHRIMPOLUMINESCENCE
    ("navy", "In World"),           # pull back: a whole reef crackling with flashes; a 1940s submarine's sonar scope full of noise
    ("button", "So never"),         # face to face: he raises his hand to snap at it; it cocks its claw (frame 1)
]
special = {}

CHUNKS = [
    "Snap your / fingers", "Cute",
    "This shrimp's / snap", "gets nearly / as hot", "as the Sun",
    "That bang / isn't the claw", "It's a / BUBBLE",
    "The claw / slams so fast", "it rips / the water open",
    "then the bubble / crushes itself", "Bang", "Nearly five / thousand degrees",
    "It even / flashes", "Scientists / named it", "shrimpoluminescence",
    "In World / War Two", "their crackle / scrambled", "the Navy's / sonar",
    "So", "never challenge / a shrimp", "to a / snap-off",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {
    "snap": Y, "cute": V, "shrimp's": O, "hot": R, "sun": Y, "bang": R, "claw": O, "bubble": C, "slams": O, "fast": Y,
    "rips": C, "open": C, "crushes": C, "five": R, "thousand": R, "degrees": R, "flashes": Y,
    "shrimpoluminescence": Y, "two": Y, "crackle": O, "scrambled": G, "sonar": G, "challenge": R, "snap-off": Y,
}
DISPLAY = {"five thousand degrees": ["5,000°"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_bang2 = find("Bang Nearly")
i_so = find("So never")
cues = {
    # hook: he snaps in the pause after "fingers...", "Cute.", then the shrimp's snap fills the gap before "This"
    "snap1": round(E("fingers") + 0.10, 3), "cute": W("Cute"), "cute_end": E("Cute"),
    "this": W("This shrimp's"), "shrimps": W("shrimp's"), "gets": W("gets"), "hot": W("hot"), "sun": W("Sun"), "sun_end": E("Sun"),
    # slowmo
    "bang": W("That bang"), "bangw": W("bang", 0, find("That bang")), "claw": W("claw"), "claw_end": E("claw"),
    "its": W("It's a"), "bubble": W("BUBBLE"), "bubble_end": E("BUBBLE"),
    "the_claw": W("The claw slams"), "slams": W("slams"), "fast": W("fast"), "rips": W("rips"), "water": W("water open"),
    "open": W("open"), "open_end": E("open"),
    # pop
    "then": W("then the bubble"), "crushes": W("crushes"), "itself_end": E("itself"), "bang2": W("Bang", 0, i_bang2),
    "bang2_end": E("Bang", 0, i_bang2), "nearly2": W("Nearly", 0, i_bang2), "five": W("five"), "degrees": W("degrees"),
    "degrees_end": E("degrees"),
    # flash
    "even": W("It even"), "flashes": W("flashes"), "flashes_end": E("flashes"), "sci": W("Scientists"), "named": W("named"),
    "shrimpo": W("shrimpoluminescence"), "shrimpo_end": E("shrimpoluminescence"),
    # navy
    "ww": W("In World"), "two": W("Two"), "two_end": E("Two"), "their": W("their crackle"), "crackle": W("crackle"),
    "scrambled": W("scrambled"), "navys": W("Navy's"), "sonar": W("sonar"), "sonar_end": E("sonar"),
    # button
    "so": W("So", 0, i_so), "never": W("never"), "challenge": W("challenge"), "shrimp_b": W("shrimp", 0, find("a shrimp to")),
    "snapoff": W("snap-off"), "snapoff_end": E("snap-off"),
}
D = T.duration
# the shrimp's real-speed snap in the hook: it cocks on "Cute", holds 8 frames, then SNAPS in the gap before "This"
cues["cock"] = round(cues["cute"] + 0.05, 3)
cues["bang0"] = round(cues["cute_end"] + 0.24, 3)
# the slow-mo replay: the claw shuts on "bang", the bubble is there by "BUBBLE"; the second pass ("The claw slams")
# shows the jet and the bubble growing to "open"; the collapse lands in the pause after "itself."
cues["collapse"] = round(cues["itself_end"] + 0.06, 3)
# the navy shot's crackle: a seeded run of snaps (picture flashes and audio pops use the same list)
rng = random.Random(7)
t, crk = cues["ww"] + 0.15, []
while t < cues["so"] - 0.25:
    crk.append(round(t, 3)); t += 0.018 + rng.random() * 0.06
cues["crackles"] = crk
cues["loop_in"] = round(D - 0.55, 3)
order = ["snap1", "cute", "cock", "bang0", "this", "sun", "bang", "claw", "bubble", "the_claw", "slams", "open", "then", "crushes",
         "collapse", "bang2", "five", "degrees", "even", "flashes", "sci", "shrimpo", "ww", "crackle", "sonar", "so", "never", "snapoff", "loop_in"]
assert all(cues[a] < cues[b] for a, b in zip(order, order[1:])), [(a, cues[a]) for a in order]
assert cues["bang0"] < cues["this"] - 0.12, (cues["bang0"], cues["this"])
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ', '.join(f'{s["id"]} {s["start"]:.2f}' for s in shots))
print('cues:', ', '.join(f'{k} {v:.2f}' for k, v in cues.items() if isinstance(v, (int, float))))
