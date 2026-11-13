"""Edit timeline for the Dinosaurs Are Older Than FLOWERS 🌸 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop. The tight
#                                      rules (5 Nov 2026): 25-30 s, the last line runs straight into the first and nothing
#                                      comes after it (qa.py: at most 1.0 s), so the loop comes before the thumb does.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),                 # CU, eye level, him LEFT holding a bouquet up to the right; a T. rex's head looms in from the
                                    # top right, sniffing it, its tiny arms straining at it and falling short (the action on
                                    # frame 0); a flowering Cretaceous glade behind (magnolias). On "FLOWERS?" he looks at us
    ("answer", "Dinosaurs By"),     # WHIP. MEDIUM-WIDE, LOW angle: the YEARS AGO counter rewinds 66 million -> 150 million while
                                    # every flower in the glade shrinks back into the ground; the bouquet stays the only colour;
                                    # tags: DINOSAURS ~230 million years / OLDEST FLOWERS FOUND ~130 million years
    ("green", "Stegosaurus probably"),  # WIDE, HIGH angle: a Jurassic valley, all green (ferns, cycads, conifers, horsetails, a
                                    # smoking volcano); a Stegosaurus ambles in from the right; the camera pans the greens as she
                                    # lists them; he turns round looking for ANY colour; the Stego sniffs the bouquet, baffled
    ("eat", "No wonder"),           # CU, LOW angle: the Stego's beak CHOMPS the bouquet (hitstop), petals fly, it chews; his
                                    # deadpan face left, holding bare stems
    ("rex", "But T-rex"),           # WHIP. WIDE, LOW angle: fast-forward to 67 million years ago: the glade BURSTS into bloom
                                    # (magnolias, a meadow); a T. rex stomps in (hitstop on the stomp), sniffing a magnolia
    ("closer", "And it lived"),     # WHIP UP. EXTREME WIDE, HIGH: the time road: Stegosaurus tiny at the far left (150 million),
                                    # T. rex in the middle (67), him at the right (now); brackets 80 vs 66 MILLION YEARS; the
                                    # T. rex looks at him, then back at the tiny Stego
    ("button", "So flowers for"),   # CU, the hook's framing: he holds the bouquet up to the T. rex... "Tiny arms." the arms
                                    # flail and miss
    ("loop", None),                 # ...and the picture matches back into frame 1 (the loop)
]
special = {}

CHUNKS = [
    "Quick, guess / what's older:",
    "dinosaurs...",
    "or your / FLOWERS?",
    "Dinosaurs.",
    "By almost / a HUNDRED",
    "million / years.",
    "Stegosaurus / probably",
    "never / saw one.",
    "Just / ferns...",
    "and / green...",
    "and more / GREEN.",
    "No wonder / he's EATING",
    "them.",
    "But / T-rex?",
    "Flowers / everywhere.",
    "And it / lived closer",
    "in time / to YOU...",
    "than to / Stegosaurus!",
    "So...",
    "flowers / for T-rex,",
    "then?",
    "Tiny / arms.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"older": Y, "dinosaurs": O, "flowers": PK, "hundred": Y, "million": Y, "stegosaurus": O, "never": R,
         "ferns": G, "green": G, "eating": R, "t-rex": O, "everywhere": PK, "closer": Y, "you": Y, "tiny": R, "arms": R}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

special["loop"] = T.duration - 0.43   # the last 0.43 s: the hook's picture again (the loop)
shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_st = {s_["id"]: s_["start"] for s_ in shots}
_en = {s_["id"]: s_["end"] for s_ in shots}
_d2 = find("Dinosaurs By")
_s2 = find("than to Stegosaurus") + 2
_f2 = find("Flowers everywhere")
_f3 = find("flowers for T-rex")
_r2 = find("T-rex then")
_g1 = find("and green")
_g2 = find("and more GREEN")
cues = {
    "quick": W("Quick"), "guess": W("guess"), "older": W("older"), "older_end": E("older"), "dinos": W("dinosaurs"),
    "dinos_end": E("dinosaurs"), "or": W("or your"), "your": W("your FLOWERS"), "flowers": W("FLOWERS"), "flowers_end": E("FLOWERS"),
    "dinos2": W("Dinosaurs", 0, _d2), "dinos2_end": E("Dinosaurs", 0, _d2), "by": W("By almost"), "almost": W("almost"),
    "hundred": W("HUNDRED"), "hundred_end": E("HUNDRED"), "million": W("million"), "years": W("years"), "years_end": E("years"),
    "stego": W("Stegosaurus probably"), "probably": W("probably"), "never": W("never"), "saw": W("saw"), "one": W("one"),
    "one_end": E("one"), "just": W("Just"), "ferns": W("ferns"), "ferns_end": E("ferns"), "green1": W("green", 0, _g1 + 1),
    "green1_end": E("green", 0, _g1 + 1), "more": W("more", 0, _g2), "green2": W("GREEN", 0, _g2 + 2),
    "green2_end": E("GREEN", 0, _g2 + 2), "no": W("No wonder"), "wonder": W("wonder"), "hes": W("he's"), "eating": W("EATING"),
    "eating_end": E("EATING"), "them": W("them"), "them_end": E("them"), "but": W("But"), "trex": W("T-rex"), "trex_end": E("T-rex"),
    "flowers2": W("Flowers", 0, _f2), "everywhere": W("everywhere"), "everywhere_end": E("everywhere"), "and3": W("And it"),
    "lived": W("lived"), "closer": W("closer"), "time": W("time"), "you": W("YOU"), "you_end": E("YOU"),
    "than": W("than"), "stego2": W("Stegosaurus", 0, _s2), "stego2_end": E("Stegosaurus", 0, _s2), "so": W("So"),
    "flowers3": W("flowers", 0, _f3), "for": W("for T-rex"), "trex2": W("T-rex", 0, _r2), "then": W("then"), "then_end": E("then"),
    "tiny": W("Tiny"), "arms": W("arms"), "arms_end": E("arms"),
}
_order = ["quick", "guess", "older", "older_end", "dinos", "dinos_end", "or", "your", "flowers", "flowers_end", "dinos2",
          "dinos2_end", "by", "almost", "hundred", "hundred_end", "million", "years", "years_end", "stego", "probably", "never",
          "saw", "one", "one_end", "just", "ferns", "ferns_end", "green1", "green1_end", "more", "green2", "green2_end", "no",
          "wonder", "hes", "eating", "eating_end", "them", "them_end", "but", "trex", "trex_end", "flowers2", "everywhere",
          "everywhere_end", "and3", "lived", "closer", "time", "you", "you_end", "than", "stego2", "stego2_end", "so", "flowers3",
          "for", "trex2", "then", "then_end", "tiny", "arms", "arms_end"]
assert all(cues[a_] < cues[b_] for a_, b_ in zip(_order, _order[1:])), [(a_, cues[a_]) for a_ in _order]
cues["end"] = T.duration
cues["loop"] = _st["loop"]
cues["look"] = cues["your"] - 0.10            # he turns to us on "your FLOWERS?"
cues["rewind"] = cues["dinos2"] - 0.05        # the counter pops and rewinds; the flowers shrink back into the ground
cues["tag_dino"] = cues["dinos2"] + 0.10      # DINOSAURS ~230 million years
cues["tag_flower"] = cues["hundred"] - 0.05   # OLDEST FLOWERS FOUND ~130 million years
cues["land"] = cues["years_end"] + 0.05       # the counter lands on 150,000,000 (the Jurassic)
cues["amble"] = _st["green"]                  # the Stego ambles in
cues["look1"] = cues["just"] - 0.08           # he looks round: ferns
cues["look2"] = cues["green1"] - 0.08         # ...green
cues["look3"] = cues["green2"] - 0.08         # ...more GREEN (he spins)
cues["sniff"] = cues["green2_end"] - 0.25     # the Stego sniffs the bouquet, baffled
cues["chomp"] = cues["eating"] + 0.06         # CHOMP
cues["chew"] = cues["eating_end"] + 0.05      # it chews, petals sticking out
cues["ff"] = cues["but"] - 0.05               # fast-forward: the counter races to 67 million
cues["bloom"] = cues["trex"] + 0.05           # the glade bursts into bloom
cues["stomp"] = cues["flowers2"] - 0.02       # the T. rex stomps in
cues["road"] = _st["closer"]                  # the time road
cues["br_you"] = cues["you"] - 0.05           # the green bracket: 66 million years
cues["br_stego"] = cues["stego2"] - 0.05      # the red bracket: 80 million years
cues["offer"] = cues["flowers3"] - 0.10       # he holds the bouquet up to the T. rex
cues["flail"] = cues["tiny"] - 0.05           # the tiny arms flail and miss
CAMERA = {
    "hand": {"hook": 0.25, "answer": 0.3, "green": 0.25, "eat": 0.35, "rex": 0.45, "closer": 0.2, "button": 0.3, "loop": 0.25},
    "whip": [[_st["answer"], -1], [_st["rex"], 1], [_st["closer"], -1]],
    "punch": [[cues["hundred"] - 0.03, 1.18, cues["years_end"] + 0.15], [cues["eating"] - 0.03, 1.2, cues["them_end"] + 0.1],
              [cues["tiny"] - 0.03, 1.15, cues["arms_end"] - 0.05]],
    "tilt": [[cues["chomp"] - 0.05, cues["them_end"] + 0.1, 3.0]],
    "hit": [[cues["chomp"] + 0.05, 4], [cues["stomp"] + 0.05, 4]],
    "act": {"brow": [cues["dinos2"], cues["never"], cues["you"]]},
    "mood": [[0, "day"], [_st["answer"], "dusk"], [_st["green"], "day"], [cues["chomp"] - 0.05, "shade"], [_st["rex"], "warm"],
             [_st["closer"], "spot"], [_st["button"], "day"]],
    "fg": {"hook": "leaves-tl", "answer": "grass-b", "green": {"kind": "leaves-tr", "col": "#1E4A26", "lit": "#4E8A3A"},
           "rex": "grass-bl", "button": "leaves-tl", "loop": "leaves-tl"},
    "air": {"hook": {"kind": "pollen", "amount": 0.45}, "answer": {"kind": "sparkle", "amount": 0.35},
            "green": {"kind": "haze", "amount": 0.6}, "eat": {"kind": "dust", "amount": 0.35},
            "rex": {"kind": "pollen", "amount": 0.7}, "closer": {"kind": "sparkle", "amount": 0.2},
            "button": {"kind": "pollen", "amount": 0.45}, "loop": {"kind": "pollen", "amount": 0.45}},
}
T.write(shots, caps, cues, camera=CAMERA)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
