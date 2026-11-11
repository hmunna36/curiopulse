"""Edit timeline for the Your Phone's GPS Needs EINSTEIN Short.

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
    ("hook", None),               # CU, eye level, him LEFT: a mountain lake at dusk, he holds his phone up beside his face, its
                                  # screen to us: the map app, the blue dot pulsing (the action on frame 0); on "GPS" a dashed
                                  # beam climbs from the phone to a satellite glinting in the sky; on "EINSTEIN" his hair
                                  # poofs out white and wild
    ("answer", "Up in space"),    # WHIP UP. MEDIUM, LOW angle: orbit, Earth's limb along the bottom; the GPS satellite with a
                                  # big clock on its side, him floating beside it in a bubble helmet, wristwatch held up to it;
                                  # on "FASTER" its hands whirl, his watch plods: double take (punch-in, hitstop)
    ("gravity", "Gravity slows"), # WIDE, HIGH angle: Earth big at the bottom, gravity as glowing rings hugging it, thick and
                                  # heavy low down; three clocks at three heights: the low one plods, the high one spins
    ("drag", "Yours, down here"), # WHIP DOWN. ECU, his wrist on the trail: the watch's hands droop like wet noodles and drag
                                  # through the blue gravity glow; he taps it; punch-in on "Dragging."
    ("gain", "Up there"),         # WHIP UP. MEDIUM-WIDE, eye level: the satellite over a turning Earth, its clock a hair ahead
                                  # of his watch; a counter: +0.000038 s, then on "every day" day/night sweeps and it rolls
    ("payoff", "Sounds tiny"),    # WIDE, LOW angle, the jetty side-on: he shrugs "tiny?", follows his phone along the jetty;
                                  # the phone's map pops up big: the blue dot slides off over the lake, 10 KM; on "A DAY."
                                  # he walks off the end: SPLASH (hitstop), the phone held up out of the water
    ("weird", "The first test"),  # WHIP. MEDIUM, HIGH angle: 1977, a boxy old test satellite, a big toggle FIX at OFF and a
                                  # sticky note IN CASE EINSTEIN'S WRONG; him beside it, still dripping, drops floating in his
                                  # helmet, one eyebrow up
    ("button", "He wasn't"),      # CU, eye level: his finger flips the switch ON (clunk), the lamp goes green, he smirks...
    ("loop", None),               # ...and the picture matches back into frame 1 (the loop)
]
special = {}

CHUNKS = [
    "Your phone's / GPS",
    "needs / EINSTEIN.",
    "Up in / space...",
    "time runs / FASTER.",
    "Gravity / slows clocks",
    "down.",
    "Yours, / down here?",
    "Dragging.",
    "Up there,",
    "satellite / clocks gain",
    "thirty-eight / millionths",
    "of a / second...",
    "every / day.",
    "Sounds / tiny?",
    "That's over / ten kilometres",
    "of error.",
    "A DAY.",
    "The first / test satellite",
    "flew with / the fix OFF...",
    "in case / Einstein",
    "was wrong.",
    "He wasn't.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"gps": C, "einstein": Y, "space": V, "faster": Y, "gravity": B, "dragging": R, "satellite": C,
         "thirty-eight": Y, "millionths": Y, "day": O, "tiny": G, "kilometres": R, "off": R, "wrong": R, "wasn't": G}
DISPLAY = {"thirty-eight": ["38"], "ten": ["10"]}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

special["loop"] = T.duration - 0.43   # the last 0.43 s: the hook's picture again (the loop)
shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_st = {s_["id"]: s_["start"] for s_ in shots}
_en = {s_["id"]: s_["end"] for s_ in shots}
_u2 = find("Up there")
_e2 = find("in case Einstein")
cues = {
    "your": W("Your"), "phone": W("phone's"), "gps": W("GPS"), "gps_end": E("GPS"), "needs": W("needs"),
    "einstein": W("EINSTEIN"), "einstein_end": E("EINSTEIN"),
    "up": W("Up in space"), "space": W("space"), "space_end": E("space"), "time": W("time runs"), "runs": W("runs"),
    "faster": W("FASTER"), "faster_end": E("FASTER"),
    "gravity": W("Gravity"), "slows": W("slows"), "clocks": W("clocks down"), "down": W("clocks down", 1), "down_end": E("clocks down", 1),
    "yours": W("Yours"), "here": W("here"), "here_end": E("here"), "dragging": W("Dragging"), "dragging_end": E("Dragging"),
    "up2": W("Up", 0, _u2), "there": W("there"), "satellite": W("satellite"), "clocks2": W("satellite clocks", 1),
    "gain": W("gain"), "thirty": W("thirty-eight"), "millionths": W("millionths"), "second": W("second"),
    "second_end": E("second"), "every": W("every"), "day": W("every day", 1), "day_end": E("every day", 1),
    "sounds": W("Sounds"), "tiny": W("tiny"), "tiny_end": E("tiny"), "thats": W("That's"), "over": W("over"),
    "ten": W("ten"), "km": W("kilometres"), "error": W("error"), "error_end": E("error"), "a": W("A DAY"),
    "aday": W("A DAY", 1), "aday_end": E("A DAY", 1),
    "the": W("The first"), "first": W("first"), "test": W("test satellite"), "sat3": W("test satellite", 1),
    "flew": W("flew"), "fix": W("fix"), "off": W("OFF"), "off_end": E("OFF"), "in": W("in case"), "case": W("case"),
    "einstein2": W("Einstein", 0, _e2), "was": W("was wrong"), "wrong": W("wrong"), "wrong_end": E("wrong"),
    "he": W("He wasn't"), "wasnt": W("wasn't"), "wasnt_end": E("wasn't"),
}
_order = ["your", "phone", "gps", "gps_end", "needs", "einstein", "einstein_end", "up", "space", "space_end", "time", "runs",
          "faster", "faster_end", "gravity", "slows", "clocks", "down", "down_end", "yours", "here", "here_end", "dragging",
          "dragging_end", "up2", "there", "satellite", "clocks2", "gain", "thirty", "millionths", "second", "second_end",
          "every", "day", "day_end", "sounds", "tiny", "tiny_end", "thats", "over", "ten", "km", "error", "error_end", "a",
          "aday", "aday_end", "the", "first", "test", "sat3", "flew", "fix", "off", "off_end", "in", "case", "einstein2",
          "was", "wrong", "wrong_end", "he", "wasnt", "wasnt_end"]
assert all(cues[a_] < cues[b_] for a_, b_ in zip(_order, _order[1:])), [(a_, cues[a_]) for a_ in _order]
cues["end"] = T.duration
cues["loop"] = _st["loop"]
cues["beam"] = cues["gps"] + 0.05             # the dashed beam climbs from the phone to the satellite
cues["poof"] = cues["einstein"] + 0.12        # his hair poofs white and wild
cues["unpoof"] = cues["einstein_end"] + 0.20  # ...and settles (gone before the whip)
cues["whirl"] = cues["faster"] + 0.10         # the satellite clock's hands whirl
cues["double"] = cues["faster_end"] + 0.05    # his double take
cues["droop"] = cues["dragging"] + 0.02       # the hands droop
cues["tap"] = cues["here_end"] + 0.04         # he taps his watch
cues["count"] = cues["thirty"]                # the +0.000038 s counter pops
cues["days"] = cues["every"] - 0.05           # day/night sweeps, the counter rolls
cues["shrug"] = cues["tiny"] - 0.05           # his shrug + pinch
cues["map"] = cues["thats"] - 0.10            # the phone's map pops up big
cues["drift"] = cues["ten"] - 0.05            # the dot slides off over the lake
cues["step"] = cues["aday"] - 0.20            # he steps off the end of the jetty
cues["splash"] = cues["aday_end"] + 0.06      # SPLASH (in the gap after "A DAY.")
cues["tag77"] = cues["first"]                 # the 1977 tag
cues["note"] = cues["in"] - 0.05              # the sticky note: IN CASE EINSTEIN'S WRONG
cues["brow"] = cues["was"] - 0.10             # his eyebrow goes up
cues["flip"] = cues["wasnt"] + 0.08           # the switch flips ON (clunk)
CAMERA = {
    "hand": {"hook": 0.25, "answer": 0.3, "gravity": 0.25, "drag": 0.3, "gain": 0.3, "payoff": 0.35, "weird": 0.3,
             "button": 0.25, "loop": 0.25},
    "whip": [[_st["answer"], -1], [_st["drag"], 1], [_st["gain"], -1], [_st["weird"], 1]],
    "punch": [[cues["faster"] - 0.03, 1.2, cues["faster_end"] + 0.25], [cues["dragging"] - 0.03, 1.18, cues["dragging_end"] + 0.2],
              [cues["wasnt"] - 0.03, 1.15, cues["wasnt_end"] + 0.05]],
    "tilt": [[cues["step"], cues["splash"] + 0.5, -3.5]],
    "hit": [[cues["faster_end"] + 0.03, 4], [cues["splash"] + 0.04, 4]],
    "act": {"brow": [cues["needs"], cues["double"], cues["brow"]]},
    "mood": [[0, "day"], [_st["answer"], "night"], [_st["drag"], "cold"], [_st["gain"], "night"], [_st["payoff"], "dusk"],
             [cues["splash"] - 0.05, "shade"], [_st["weird"], "warm"], [_st["button"], "day"]],
    "fg": {"drag": "bokeh-r", "payoff": {"kind": "grass-bl", "col": "#1E3A22", "lit": "#4E7A3A"}},
    "air": {"hook": {"kind": "dust", "amount": 0.35}, "answer": {"kind": "sparkle", "amount": 0.3},
            "gravity": {"kind": "sparkle", "amount": 0.25}, "drag": {"kind": "dust", "amount": 0.4},
            "gain": {"kind": "sparkle", "amount": 0.3}, "payoff": {"kind": "dust", "amount": 0.4},
            "weird": {"kind": "sparkle", "amount": 0.3}, "button": {"kind": "sparkle", "amount": 0.2},
            "loop": {"kind": "dust", "amount": 0.35}},
}
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s
# before the end) and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says
# "subscribe" in either arm; the ask also lives in the caption, the description and the comments.
T.write(shots, caps, cues, camera=CAMERA)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
