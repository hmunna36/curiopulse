"""Edit timeline for the Your Text to VOYAGER 1 Would Take a Whole DAY Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop (the tight
#                                      rules of 5 Nov 2026: at most 1.0 s from the last word to the loop)

# (shot id, phrase whose first word opens the shot). Framings: never two alike in a row (size, side, height).
SHOTS = [
    ("hook", None),                     # CU, eye level, him LEFT, the phone RIGHT: his thumb on SEND ("u ok?" to Voyager 1)
                                        # on frame 0; on DAY the ETA pops: ARRIVES IN 24 HOURS; the bubble lifts off the screen
    ("answer", "It's not ignoring"),    # WHIP. MEDIUM, LOW angle, him centre: the bubble hovers over the porch (SENDING...);
                                        # he shrugs; on LIGHT it rockets up with him hanging on to it
    ("race", "It zips"),                # WHIP. WIDE, eye level, him LEFT riding his text to the right: the Earth shrinks
                                        # away, the Moon whooshes past on "Moon", Pluto glides by on "Pluto" (he waves)
    ("tomorrow", "and Voyager"),        # MEDIUM, HIGH angle: asleep on the bubble, the clock spins to 24:00:00; BONK into
                                        # Voyager's dish on TOMORROW: DELIVERED (hitstop, punch-in)
    ("reply", "And its reply"),         # WHIP. MEDIUM, him RIGHT riding the grey reply ("•••") back to the left; stubble
                                        # grows, the clock runs to 48:00:00
    ("beep", None),                     # CU, him RIGHT, the phone LEFT (the hook's mirror): two days later, stubble, a cobweb,
                                        # the tea gone green; the reply lands: "beep." (punch-in on his face)
    ("weird", "Forty-nine years"),      # WHIP. EXTREME WIDE (the scale): him waving on Voyager at the top of one light-day of
                                        # ruler, the trail since 1977; zoom out to the nearest star: x1,500
    ("button", "Better hit"),           # CU, eye level, him LEFT, the phone RIGHT (the hook's picture): he types "u ok?" again,
    ("loop", None),                     # fast... and his thumb lands on SEND: frame 0 (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Your text to / Voyager 1",
    "would take / a whole DAY",
    "to arrive.",
    "It's not / ignoring you...",
    "even LIGHT / takes that long.",
    "It zips past / the Moon",
    "in one second...",
    "Pluto in / five hours...",
    "and Voyager?",
    "TOMORROW.",
    "And its reply?",
    "Another / whole day.",
    "Beep.",
    "Forty-nine years / to get this far...",
    "and the / nearest star",
    "is fifteen hundred / times farther.",
    "Better hit / send now.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"voyager": C, "1": C, "day": Y, "light": Y, "moon": S, "second": G, "pluto": O, "hours": O,
         "tomorrow": Y, "reply": V, "beep": G, "49": Y, "far": Y, "star": O, "1500": G, "5": O, "farther": G, "send": G, "now": Y}
DISPLAY = {"forty-nine years": ["49", "YEARS"], "in one second": ["IN", "1", "SECOND"], "five hours": ["5", "HOURS"],
           "is fifteen hundred": ["IS", "1,500"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

W, E, ev, find = T.W, T.E, T.ev, T.find
special["beep"] = W("Beep") - 0.30             # the porch is back a beat before the word: the phone buzzes first
special["loop"] = T.duration - 0.43            # the last 0.43 s: the hook's picture again (the loop)
shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

_st = {s_["id"]: s_["start"] for s_ in shots}
_en = {s_["id"]: s_["end"] for s_ in shots}
_v2 = find("and Voyager")
_d2 = find("Another whole day")
cues = {
    "your": W("Your"), "text": W("text"), "voyager": W("Voyager"), "would": W("would"), "whole": W("whole"),
    "day": W("DAY"), "day_end": E("DAY"), "arrive": W("arrive"), "arrive_end": E("arrive"),
    "its": W("It's not"), "ignoring": W("ignoring"), "you2": W("ignoring you", 1), "even": W("even"), "light": W("LIGHT"),
    "light_end": E("LIGHT"), "takes": W("takes"), "long_end": E("that long", 1),
    "zips": W("zips"), "moon": W("Moon"), "second": W("second"), "second_end": E("second"), "pluto": W("Pluto"),
    "five": W("five"), "hours": W("hours"), "hours_end": E("hours"),
    "and": W("and Voyager"), "voyager2": W("Voyager", 0, _v2), "voyager2_end": E("Voyager", 0, _v2), "tomorrow": W("TOMORROW"), "tomorrow_end": E("TOMORROW"),
    "reply": W("reply"), "another": W("Another"), "day2": W("Another whole day", 2), "day2_end": E("Another whole day", 2),
    "beep": W("Beep"), "beep_end": E("Beep"),
    "forty": W("Forty-nine"), "far": W("this far", 1), "far_end": E("this far", 1), "nearest": W("nearest"),
    "star": W("star"), "fifteen": W("fifteen"), "times": W("times"), "farther": W("farther"), "farther_end": E("farther"),
    "better": W("Better"), "hit": W("hit"), "send": W("send"), "now": W("now"), "now_end": E("now"),
}
_order = ["your", "text", "voyager", "would", "whole", "day", "day_end", "arrive", "arrive_end", "its", "ignoring", "you2",
          "even", "light", "light_end", "takes", "long_end", "zips", "moon", "second", "second_end", "pluto", "five", "hours",
          "hours_end", "and", "voyager2", "voyager2_end", "tomorrow", "tomorrow_end", "reply", "another", "day2", "day2_end", "beep",
          "beep_end", "forty", "far", "far_end", "nearest", "star", "fifteen", "times", "farther", "farther_end", "better",
          "hit", "send", "now", "now_end"]
assert all(cues[a_] < cues[b_] for a_, b_ in zip(_order, _order[1:])), [(a_, cues[a_]) for a_ in _order]
cues["end"] = T.duration
cues["loop"] = _st["loop"]
cues["launch"] = cues["light"]                  # the bubble rockets up with him (the hitstop's frame is just after)
cues["bonk"] = cues["tomorrow_end"] + 0.03      # the bubble hits the dish (just after the word: the gag lands after it)
cues["ping"] = cues["beep"] - 0.12              # the reply lands on the phone (its ping is before the word)
cues["zoom"] = cues["nearest"] - 0.05           # the big zoom out starts

CAMERA = {
    "hand": {"hook": 0.25, "answer": 0.3, "race": 0.45, "tomorrow": 0.3, "reply": 0.3, "beep": 0.22, "weird": 0.2,
             "button": 0.35, "loop": 0.25},
    "whip": [[_st["answer"], -1], [_st["race"], 1], [_st["reply"], -1], [_st["weird"], 1]],
    "punch": [[cues["light"] - 0.03, 1.15, cues["light_end"] + 0.35], [cues["bonk"] + 0.15, 1.2, _en["tomorrow"] - 0.02],
              [cues["beep"] - 0.02, 1.18, _en["beep"] - 0.02]],
    "tilt": [[cues["bonk"], _en["tomorrow"] - 0.02, -3.5]],
    "hit": [[cues["bonk"] + 0.02, 4]],
    "act": {"brow": [cues["day"], cues["moon"], cues["beep"] + 0.1]},
    "mood": [[0, "dusk"], [_st["race"], "cold"], [_st["tomorrow"], "night"], [cues["bonk"], "warm"], [_st["reply"], "cold"],
             [_st["beep"], "dusk"], [_st["weird"], "spot"], [_st["button"] - 0.05, "dusk"]],
    "fg": {"answer": {"kind": "leaves-tr", "col": "#15301A", "lit": "#3E7330"}, "beep": "post-r"},
    "air": {"hook": {"kind": "sparkle", "amount": 0.25}, "answer": {"kind": "sparkle", "amount": 0.35},
            "race": {"kind": "sparkle", "amount": 0.5}, "tomorrow": {"kind": "sparkle", "amount": 0.35},
            "reply": {"kind": "sparkle", "amount": 0.35}, "beep": {"kind": "dust", "amount": 0.3},
            "weird": {"kind": "sparkle", "amount": 0.3}, "button": {"kind": "sparkle", "amount": 0.25},
            "loop": {"kind": "sparkle", "amount": 0.25}},
}
T.write(shots, caps, cues, camera=CAMERA)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the claim, about "your" text)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s_ in shots:
    print(f'  {s_["id"]:9s} {s_["start"]:6.2f} -> {s_["end"]:6.2f}  ({s_["end"] - s_["start"]:.2f} s)')
