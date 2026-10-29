"""Edit timeline for the Why Does Your Mouth Water When You Imagine a LEMON? 🍋 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
The test: the viewer imagines biting the lemon he bites, and their mouth waters. The world: a lemon grove over the sea at
noon; his head from the side as glass (the brain, the spit taps under the tongue and in the cheek); a lab where volunteers
with cotton rolls in their cheeks watch a man eat a lemon. Every beat below is a cue (scenes.js and audio.py read them).
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # the button beat and the cut back to frame 1 (the loop)

# the tagged take's first word: v3 can give the tag's time to the word ([mischievously] Now imagine...)
i_now = T.find("Now imagine")
onset = T.first_loud(T.block("lick")["start"])
if onset - T.ws[i_now] > 0.1:
    T.ws[i_now] = T.words[i_now]["start"] = onset

# words whose alignment sits before (or after) their own sound, moved onto their bursts of speech-band energy (T.bursts):
# "Feel" (the voice starts at 8.11), "it." (11.30-11.48), "so" (15.31), "eat" (22.05)
for ph, k, ds, de in (("Feel that", 0, 0.04, 0.06), ("licking it", 1, -0.09, -0.1), ("so your brain", 0, 0.07, 0.03), ("eat a lemon", 0, 0.07, 0.07)):
    i = T.find(ph) + k
    T.ws[i] = T.words[i]["start"] = round(T.ws[i] + ds, 3)
    T.we[i] = T.words[i]["end"] = round(T.we[i] + de, 3)
    if i + 1 < len(T.ws) and T.ws[i + 1] < T.we[i]:
        T.ws[i + 1] = T.words[i + 1]["start"] = round(T.we[i] + 0.01, 3)

SHOTS = [
    ("hook", None),             # THE TEST: frame 1 is him close, biting into a lemon wedge (juice flying); his mouth
                                # waters; "There's no lemon..." the wedge was never there (a dotted ghost that pops);
                                # a window on his temple: his brain in a bib takes a PRACTICE bite; the dive into it
    ("section", "Feel that flood"),     # his head from the side as glass: the spit taps under the tongue open, the flood
                                        # rises; "Now imagine licking it. Slowly." the tongue goes out to a ghost lemon
    ("acid", "Lemon means acid"),       # pull back: the brain sees ACID coming and hoses the teeth before it lands
    ("lab", "In one lab"),      # volunteers with cotton rolls in their cheeks watch a man eat a lemon on a TV: drool
    ("caring", "The more they"),        # their cups of drool, and a heart over each that grows with the cup
    ("button", "Drooling? Congrats"),   # the grove: "Congrats, you're nice." (a NICE rosette on the lens) / "Not
                                        # drooling? Watch him again." he bites again: into frame 1
    ("loop", None),             # the last 0.45 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.45}

CHUNKS = [
    "Imagine / biting this", "juicy / lemon.",
    "Your mouth's / watering,", "right?",
    "There's / no lemon...", "your brain / just took", "a PRACTICE / bite.",
    "Feel that / flood", "under / your tongue?",
    "Now imagine / licking it.", "Slowly.",
    "Lemon / means acid...", "so your / brain hoses", "your teeth / down early.",
    "In one lab,", "people / drooled", "just / WATCHING", "a man eat / a lemon.",
    "The more / they drooled...", "the more / they cared", "about / others.",
    "Drooling?", "Congrats, / you're nice.", "Not / drooling?", "Watch him / again.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "lemon": Y, "juicy": Y, "watering": C, "practice": V, "bite": Y,
    "flood": C, "tongue": PK, "licking": PK, "slowly": V,
    "acid": R, "hoses": C, "teeth": S, "early": G,
    "watching": Y, "drooled": C, "cared": PK, "others": PK,
    "drooling": C, "nice": G, "again": Y,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, find = T.W, T.E, T.find
i_lem2 = find("no lemon") + 1
i_lem3 = find("Lemon means")
i_lem4 = find("eat a lemon") + 2
i_dr2 = find("they drooled")
i_more2 = find("the more they cared") + 1
i_dr3 = find("Drooling? Congrats")
i_dr4 = find("Not drooling") + 1
cues = {
    # the hook: he bites on "biting", the juice flies on "juicy", the pucker holds through "lemon."
    "imagine": W("Imagine"), "biting": W("biting"), "this": W("this"), "juicy": W("juicy"), "lemon": W("lemon"),
    "lemon_end": E("lemon"),
    "chomp": W("biting") + 0.12,                # his teeth go into the wedge (the crunch)
    "squirt": W("juicy") + 0.05,                # the juice sprays
    "your_mouth": W("Your mouth's"), "watering": W("watering"), "watering_end": E("watering"), "right": W("right"),
    "right_end": E("right"),
    "drool": W("watering") + 0.15,              # a drop of drool runs out of the corner of his mouth
    "gulp": E("right") + 0.12,                  # he swallows (in the gap before the answer)
    # the answer: the wedge was never there; his brain took a practice bite
    "theres": W("There's"), "no": W("no", 0, find("There's no")), "lemon2": T.ws[i_lem2], "lemon2_end": T.we[i_lem2],
    "poof": T.ws[i_lem2] + 0.12,                # the wedge goes to a dotted ghost and pops
    "your_brain": W("your brain"), "brain": W("brain"), "brain_end": E("brain"), "took": W("took"),
    "practice": W("PRACTICE"), "practice_end": E("PRACTICE"), "bite": W("bite", 0, find("PRACTICE bite")),
    "bite_end": E("bite", 0, find("PRACTICE bite")),
    "win": W("your brain") - 0.25,              # the window on his temple opens: his brain, in a bib, with a ghost lemon
    "brain_chomp": E("bite", 0, find("PRACTICE bite")) + 0.04,  # the brain's practice bite (in the gap after "bite.")
    # the section: the flood under the tongue; the lick
    "feel": W("Feel"), "flood": W("flood"), "flood_end": E("flood"), "under": W("under"), "tongue": W("tongue"),
    "tongue_end": E("tongue"),
    "taps": W("flood") - 0.1,                   # the taps open
    "now": W("Now imagine"), "imagine2": W("imagine", 0, find("Now imagine")), "licking": W("licking"), "licking_end": E("licking"),
    "slowly": W("Slowly"), "slowly_end": E("Slowly"),
    # the acid: the brain sees ACID coming and hoses the teeth before it lands
    "lemon3": T.ws[i_lem3], "means": W("means"), "acid": W("acid"), "acid_end": E("acid"), "so": W("so your brain"),
    "hoses": W("hoses"), "teeth": W("teeth"), "teeth_end": E("teeth"), "down": W("down early"), "early": W("early"),
    "early_end": E("early"),
    # the lab: volunteers watch a man eat a lemon on a TV, cotton rolls in their cheeks
    "in_lab": W("In one lab"), "lab": W("lab"), "people": W("people"), "drooled": W("drooled"), "drooled_end": E("drooled"),
    "just": W("just WATCHING"), "watching": W("WATCHING"), "watching_end": E("WATCHING"), "man": W("man"), "eat": W("eat"),
    "lemon4": T.ws[i_lem4], "lemon4_end": T.we[i_lem4],
    # the caring: the cups, then a heart over each that grows with the cup
    "more1": W("The more"), "drooled2": T.ws[i_dr2 + 1], "drooled2_end": T.we[i_dr2 + 1],
    "more2": T.ws[i_more2], "cared": W("cared"), "cared_end": E("cared"), "others": W("others"), "others_end": E("others"),
    # the button
    "drooling": T.ws[i_dr3], "drooling_end": T.we[i_dr3], "congrats": W("Congrats"), "congrats_end": E("Congrats"),
    "nice": W("nice"), "nice_end": E("nice"), "not": W("Not drooling"), "drooling2": T.ws[i_dr4], "drooling2_end": T.we[i_dr4],
    "watch": W("Watch him"), "again": W("again"), "again_end": E("again"),
}
cues["rosette"] = cues["nice"] + 0.06            # the NICE rosette slaps onto the lens
cues["pick"] = cues["again_end"] + 0.05          # he lifts a new wedge (the loop hands over to frame 1 after it)
# the volunteers' drool drops, staggered, from "drooled" to the end of the lab shot (one list, the picture and the sound)
t0, t1 = cues["drooled"] + 0.1, cues["lemon4_end"] + 0.2
cues["drips"] = [round(t0 + (t1 - t0) * (j / 9.0) + (0.09 if j % 2 else 0), 3) for j in range(10)]
# the hearts pop over each volunteer, smallest to biggest, from "cared" to "others"
h0, h1 = cues["cared"] - 0.05, cues["others_end"]
cues["hearts"] = [round(h0 + (h1 - h0) * j / 3.0, 3) for j in range(4)]

assert cues["chomp"] < cues["squirt"] < cues["lemon_end"] < cues["drool"] < cues["gulp"] < cues["theres"] < cues["poof"]
assert cues["win"] < cues["practice"] < cues["brain_chomp"] < cues["feel"] < cues["taps"] < cues["now"] < cues["slowly"]
assert cues["slowly_end"] < cues["lemon3"] < cues["acid"] < cues["hoses"] < cues["early_end"] < cues["in_lab"]
assert cues["in_lab"] < cues["drooled"] < cues["watching"] < cues["lemon4"] < cues["more1"] < cues["drooled2"] < cues["more2"]
assert cues["more2"] < cues["cared"] < cues["others"] < cues["drooling"] < cues["congrats"] < cues["nice"] < cues["not"]
assert cues["not"] < cues["drooling2"] < cues["watch"] < cues["again"]

T.write(shots, caps, cues)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots: ' + ', '.join(f'{s["id"]} {s["start"]:.2f}' for s in shots))
