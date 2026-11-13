"""Edit timeline for the Fold Your Arms the OTHER Way. Feels WRONG? 🙅 Short.

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
SHOTS = [
    ("hook", None),                    # THE TEST: the summit, close; his arms swing into his usual fold for the self-timer;
                                       # "the OTHER way": they unfold, fumble and tie themselves into a pretzel (by 3 s)
    ("answer", "Feels wrong"),         # still knotted, a window opens on the top of his head; the camera dives through it
                                       # into the cockpit that flies his arms: AUTOPILOT OFF, alarms (hitstop on OFF)
    ("back", "Switch back"),           # a low camera on the summit: the knot pops open, the usual fold snaps back, "Ahh"
                                       # (bliss, punch-in); a window above his head: AUTOPILOT ON, the pilot sips coffee
    ("usual", "You've folded"),        # the cockpit: the pilot dozes, hands behind his head; FOLDS rolls to 9,999+; the
                                       # levers and the ARMS monitor fold his arms by themselves
    ("hand", "The other way Your"),    # closer: the pilot grabs both levers and yanks; the monitor's arms fumble into the
                                       # knot (dutch tilt, the alarm)
    ("twins", "Weirdest part"),        # the summit, a two-shot: he and his identical twin fold at once, mirror images;
                                       # IDENTICAL TWINS, 46%, FOLD OPPOSITE; they look at each other's arms
    ("pilot", "Same DNA"),             # a push-in: a window pops out of each head: two different pilots (a cap and a
                                       # moustache) salute
    ("loop", "Now try"),               # the button, close again: the arms whirl and tie the super-pretzel on FASTER
                                       # (hitstop); it springs open and they rise into frame 1's fold (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Fold your / arms.",
    "Now fold them / the OTHER way.",
    "Feels wrong?",
    "You just / switched OFF",
    "your autopilot.",
    "Switch back...",
    "Ahh.",
    "Autopilot.",
    "You've folded / that way",
    "thousands / of times...",
    "it flies itself.",
    "The other way?",
    "Your brain / flies it...",
    "by hand.",
    "Weirdest part?",
    "Identical twins...",
    "almost half",
    "fold opposite / ways.",
    "Same DNA...",
    "different pilot.",
    "Now try / the wrong way...",
    "FASTER.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"other": R, "wrong": R, "off": R, "autopilot": G, "ahh": Y, "thousands": Y, "itself": G, "hand": O,
         "identical": V, "twins": V, "half": Y, "opposite": C, "dna": G, "pilot": Y, "faster": R}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
cues = {
    # the hook (the test)
    "fold1": W("Fold your"), "arms1": W("arms Now"), "arms1_end": E("arms Now"),
    "now1": W("Now fold"), "fold2": W("fold them"), "other": W("OTHER way Feels"), "way1": W("way Feels"), "way1_end": E("way Feels"),
    # the answer
    "feels": W("Feels wrong"), "wrong": W("wrong You"), "wrong_end": E("wrong You"), "you1": W("You just"),
    "switched": W("switched OFF"), "off": W("OFF your"), "off_end": E("OFF your"), "auto1": W("autopilot Switch"),
    "auto1_end": E("autopilot Switch"),
    # back
    "switch": W("Switch back"), "back": W("back Ahh"), "back_end": E("back Ahh"), "ahh": W("Ahh Autopilot"),
    "ahh_end": E("Ahh Autopilot"), "auto2": W("Autopilot You've"), "auto2_end": E("Autopilot You've"),
    # usual
    "youve": W("You've folded"), "folded": W("folded that"), "thousands": W("thousands of"), "times": W("times it"),
    "times_end": E("times it"), "flies1": W("flies itself"), "itself": W("itself The"), "itself_end": E("itself The"),
    # hand
    "the_other": W("The other way Your"), "your2": W("Your brain"), "brain": W("brain flies"), "flies2": W("flies it by"),
    "by": W("by hand"), "hand": W("hand Weirdest"), "hand_end": E("hand Weirdest"),
    # twins
    "weirdest": W("Weirdest part"), "identical": W("Identical twins"), "twins_w": W("twins almost"),
    "twins_end": E("twins almost"), "almost": W("almost half"), "half": W("half fold"), "fold3": W("fold opposite"),
    "opposite": W("opposite ways"), "ways": W("ways Same"), "ways_end": E("ways Same"),
    # pilot
    "same": W("Same DNA"), "dna": W("DNA different"), "dna_end": E("DNA different"), "different": W("different pilot"),
    "pilot": W("pilot Now"), "pilot_end": E("pilot Now"),
    # the button
    "now3": W("Now try"), "try": W("try the wrong"), "wrong2": W("wrong way FASTER"), "way3": W("way FASTER"),
    "faster": W("FASTER"), "faster_end": E("FASTER"),
}
_order = ["fold1", "arms1", "now1", "fold2", "other", "way1", "feels", "wrong", "you1", "switched", "off", "auto1",
          "switch", "back", "ahh", "auto2", "youve", "folded", "thousands", "times", "flies1", "itself", "the_other",
          "your2", "brain", "flies2", "by", "hand", "weirdest", "identical", "twins_w", "almost", "half", "fold3",
          "opposite", "ways", "same", "dna", "different", "pilot", "now3", "try", "wrong2", "way3", "faster"]
assert all(cues[a] < cues[b] for a, b in zip(_order, _order[1:])), "cues out of order"
_st = {s_["id"]: s_["start"] for s_ in shots}
# the pretzel ties itself as "way." ends; the self-timer flashes in the pause after it
cues["knot"] = cues["way1_end"] + 0.02
cues["flash"] = cues["knot"] + 0.3
# the window opens on "Feels"; the dive through it ends just before "OFF"
cues["win"] = cues["feels"] + 0.06
cues["dive1"] = cues["off"] - 0.1
cues["dive0"] = cues["dive1"] - 0.5
assert cues["dive0"] > cues["win"] + 0.3, "the window needs time before the dive"

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "answer": 0.3, "back": 0.3, "usual": 0.2, "hand": 0.45, "twins": 0.3, "pilot": 0.3, "loop": 0.25},
    "whip": [[_st["back"], 1], [_st["twins"], -1], [_st["loop"], 1]],
    "punch": [[cues["ahh"] - 0.03, 1.15], [cues["faster"] - 0.03, 1.12, min(cues["faster_end"] + 0.12, T.duration - 0.62)]],
    "tilt": [[cues["brain"] - 0.05, cues["hand_end"] + 0.1, -4.0]],
    "hit": [[cues["off"] + 0.03, 4], [cues["faster"] + 0.07, 4]],
    "act": {"brow": [cues["now1"], cues["switch"], cues["identical"], cues["try"]]},
    "mood": [[0, "day"], [cues["dive1"], "spot"], [_st["back"], "day"], [_st["usual"], "warm"], [_st["hand"], "storm"],
             [_st["twins"], "day"], [_st["pilot"], "warm"], [_st["loop"], "day"]],
    "fg": {"back": "grass-b", "usual": "bokeh-l", "hand": "bokeh-r", "twins": "grass-b"},
    "air": {"hook": {"kind": "sparkle", "amount": 0.3}, "answer": {"kind": "sparkle", "amount": 0.3}, "back": "dust",
            "usual": {"kind": "dust", "amount": 0.6}, "hand": {"kind": "sparkle", "amount": 0.5}, "twins": "dust",
            "pilot": {"kind": "sparkle", "amount": 0.4}, "loop": {"kind": "sparkle", "amount": 0.3}},
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
