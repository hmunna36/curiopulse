"""Edit timeline for the Can You Make a Tongue CLOVER? ☘️ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop. The tight
#                                      rules (5 Nov 2026): 25-30 s, the last line runs straight into the first and nothing
#                                      comes after it (qa.py: at most 1.0 s).

# v3's alignment: a short word after a pause can sit in the pause before its own sound (finger-tip-bend, 10 Nov 2026):
# move it onto its first run of speech-band energy and give it its real length
for _ph in ("The WIRING's different", "Taco?"):
    _i = T.find(_ph)
    _b = T.bursts(T.we[_i - 1] + 0.04, T.we[_i] + 0.3)
    if _b and _b[0][0] - 0.04 > T.ws[_i] + 0.05:
        T.ws[_i] = T.words[_i]["start"] = round(_b[0][0] - 0.04, 3)
        T.we[_i] = T.words[_i]["end"] = round(max(T.we[_i], min(T.ws[_i + 1] - 0.01, T.ws[_i] + 0.2)), 3)
        print(f'moved "{T.words[_i]["word"]}" to {T.ws[_i]:.2f}-{T.we[_i]:.2f} s (its first speech-band burst)')

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),               # THE TEST: frame 1 is his face in the bathroom mirror, extreme close-up, tongue out and
                                  # rolled, the tip straining to flip up; "Roll it, then flip the tip UP": the tip flicks
                                  # and the roll wobbles (the strange thing: it won't do both)
    ("answer", "Taco?"),          # a whip to a new framing of the same test (medium, low angle): taco toppings rain onto
                                  # his rolled tongue; a TACO CLUB membership card pops ("Join the club.")
    ("crowd", "Only one"),        # a line-up of seven faces with their tongues out: six tacos, ONE clover (a sparkle)
    ("again", "Try again"),       # back to the mirror, high angle from the other side: he tries again, the tip goes up
                                  # and the sides flop flat (the viewer is doing it too: the 8-13 s rule)
    ("wiring", "Every tongue"),   # his tongue goes see-through where it is (three ways of muscle), then a split with the
                                  # clover champ: the same muscles; then the WIRING lights: a tangle in his, neat in hers
    ("gym", "Scientists"),        # a whip to an arena: a tongue in a leotard on a beam flips and lands a clover; 10 10 10
    ("tricks", "Clover people"),  # a whip to the champ: roll, fold, twist, twist, each with a tick
    ("sting", "SHOW-offs."),      # a cut back to him in the mirror, deadpan, taco flopping; punch-in
    ("loop", "Now flip"),         # he flips the tip first, then the camera pushes back into frame 1's framing (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Can you make / a tongue CLOVER?",
    "Roll it,",
    "then flip / the tip UP.",
    "Taco?",
    "Join the club.",
    "Only one / in seven can.",
    "Try again.",
    "Tip up...",
    "sides flop?",
    "Every tongue",
    "has the same / muscles.",
    "The WIRING's / different.",
    "Scientists / suspect",
    "that's what / makes a tongue",
    "a gymnast.",
    "Clover people",
    "can do most / other tongue",
    "tricks too.",
    "SHOW-offs.",
    "Now flip / the tip FIRST.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"clover": G, "roll": C, "tip": Y, "up": Y, "taco": O, "club": O, "one": G, "seven": Y, "flop": R,
         "same": C, "muscles": C, "wiring's": O, "different": O, "gymnast": V, "tricks": V, "show-offs": PK,
         "first": Y}
DISPLAY = {"one in seven": ["1", "in", "7"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_try, i_every, i_gym, i_cl2, i_now = find("Try again"), find("Every tongue"), find("a tongue a gymnast"), find("Clover people"), find("Now flip")
cues = {
    # the hook: the question, then the two moves
    "can0": W("Can"), "tongue1": W("tongue clover"), "clover1": W("clover?"), "clover1_end": E("clover?"),
    "roll1": W("Roll"), "it1_end": E("it,"), "then1": W("then"), "flip1": W("flip"), "tip1": W("tip"), "up1": W("UP."),
    "up1_end": E("UP."),
    # the answer
    "taco": W("Taco?"), "taco_end": E("Taco?"), "join": W("Join"), "club": W("club."), "club_end": E("club."),
    "only": W("Only"), "one": W("one"), "seven": W("seven"), "can1": W("seven can", 1), "can1_end": E("seven can", 1),
    # again
    "try": W("Try"), "again_end": E("again."), "tip2": W("Tip up", 0, i_try), "up2": W("Tip up", 1, i_try), "up2_end": E("Tip up", 1, i_try),
    "sides": W("sides"), "flop": W("flop?"), "flop_end": E("flop?"),
    # the wiring
    "every": W("Every"), "tongue3": W("tongue", 0, i_every), "same": W("same"), "muscles": W("muscles."),
    "muscles_end": E("muscles."), "the4": W("The WIRING's"), "wiring": W("WIRING's"), "different": W("different."),
    "different_end": E("different."),
    # the gymnast
    "sci": W("Scientists"), "suspect": W("suspect"), "thats": W("that's"), "makes": W("makes"),
    "tongue4": W("tongue", 0, i_gym), "gymnast": W("gymnast."), "gymnast_end": E("gymnast."),
    # the tricks
    "clover2": W("Clover people"), "people": W("people"), "can2": W("can", 0, i_cl2), "do": W("do"), "most": W("most"),
    "other": W("other"), "tongue5": W("tongue tricks"), "tricks": W("tricks"), "too": W("too."), "too_end": E("too."),
    # the sting and the button
    "show": W("SHOW-offs."), "show_end": E("SHOW-offs."),
    "now": W("Now flip"), "flip3": W("flip", 0, i_now), "tip3": W("tip", 0, i_now), "first": W("FIRST."),
    "first_end": E("FIRST."),
}
cues["end"] = T.duration
# the tongue's wobble clock: a whole number of turns in the Short (scenes.js and audio.py share it), about 2.2 a second
cues["wob_hz"] = round(round(2.2 * T.duration) / T.duration, 5)
_st = {s_["id"]: s_["start"] for s_ in shots}
cues.update({f"shot_{k}": v for k, v in _st.items()})
assert cues["clover1"] < cues["roll1"] < cues["flip1"] < cues["up1"] < cues["taco"] < cues["club"] < cues["seven"] \
    < cues["try"] < cues["up2"] < cues["flop"] < cues["same"] < cues["wiring"] < cues["sci"] < cues["gymnast"] \
    < cues["clover2"] < cues["tricks"] < cues["show"] < cues["now"] < cues["tip3"] < cues["first"] < cues["end"]
assert cues["tongue1"] < 1 and cues["tongue3"] > 11 and cues["tongue4"] > 16 and cues["tip1"] < 4 and cues["tip3"] > 22

# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "answer": 0.32, "crowd": 0.28, "again": 0.35, "wiring": 0.22, "gym": 0.32, "tricks": 0.3,
             "sting": 0.25, "loop": 0.25},
    # whips at the story turns: the test -> the answer (two framings of the same test), into the gymnast (the
    # suspicion), into the weirdest fact (the show-offs)
    "whip": [[_st["answer"], 1], [_st["gym"], -1], [_st["tricks"], 1]],
    # punch-ins: the answer's sting ("club.") on his face, the fail ("flop?"), the deadpan "SHOW-offs."
    "punch": [[cues["club"] - 0.03, 1.2, cues["club_end"] + 0.3], [cues["flop"] - 0.04, 1.16, cues["flop_end"] + 0.25],
              [cues["show"] - 0.04, 1.22, cues["show_end"] + 0.25]],
    # a dutch tilt while the sides flop
    "tilt": [[cues["sides"] - 0.05, cues["flop_end"] + 0.2, -3.0]],
    # the bathroom's morning; warm for the one in seven; a cloud over it when the sides flop; cool inside the tongue; a
    # spotlight for the gymnast; warm for the champ's tricks; back to frame 1's day for the sting and the button (the loop)
    "mood": [[0, "day"], [cues["only"] - 0.1, "warm"], [cues["sides"] - 0.08, "shade"], [cues["every"] - 0.1, "cold"],
             [cues["sci"] - 0.1, "spot"], [cues["clover2"] - 0.1, "warm"], [cues["show"] - 0.12, "day"]],
    # depth in front of the lens: lamp and window bokeh, alternating sides
    "fg": {"hook": "bokeh-l", "answer": "bokeh-r", "crowd": "bokeh-l", "again": "bokeh-r", "gym": "bokeh-t",
           "tricks": "bokeh-l", "loop": "bokeh-l"},
    # the air: dust in the bathroom's morning light, sparkle for the one in seven, the gymnast and the champ
    "air": {"hook": {"kind": "dust", "amount": 0.5}, "answer": {"kind": "dust", "amount": 0.45},
            "crowd": {"kind": "sparkle", "amount": 0.5}, "again": {"kind": "haze", "amount": 0.4},
            "gym": {"kind": "sparkle", "amount": 0.7}, "tricks": {"kind": "sparkle", "amount": 0.55},
            "sting": {"kind": "dust", "amount": 0.4}, "loop": {"kind": "dust", "amount": 0.5}},
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
print("shots:", ", ".join(f'{s_["id"]} {s_["start"]:.2f}' for s_ in shots))
