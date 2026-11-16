"""Edit timeline for the One Night on URANUS Lasts 42 Years Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop (the tight
#                                      rules of 5 Nov 2026: at most 1.0 s from the last word to the loop)

# (shot id, phrase whose first word opens the shot). Framings: never two alike in a row (size, side, height).
# The place: Uranus's south pole at sunset (2007), seen from his hot-air balloon basket over the cyan cloud sea; space
# for the planet and its orbit; the same basket through the 42-year night and the sunrise of 2049.
SHOTS = [
    ("hook", None),                     # CU, eye level, him LEFT of centre in the basket in pyjamas and a nightcap, the
                                        # twin-bell alarm clock in his hands RIGHT: he sets it, its flip card reads 8 HOURS;
                                        # the small Sun sinking into the cloud sea behind him on the left (frame 0)
    ("hook_b", "On Uranus"),            # WIDE, LOW angle: the whole balloon over the pole at sunset, the rings low over
                                        # the horizon, a moon; a sign on the basket: SOUTH POLE
    ("years", "Forty-two"),             # EXTREME CLOSE-UP: the clock's flip card slams to 42 YEARS; his eyes pop behind it
    ("answer", "The whole"),            # EXTREME WIDE in space: the whole planet, upright, asleep (a face), his tiny balloon
                                        # on its top pole... it tips over (snap) toward its pillow
    ("side", "on its SIDE"),            # MEDIUM on the planet: it lands on the pillow on its SIDE (hitstop), rings upright,
                                        # TIPPED 98 deg; his balloon now sticks out of its side ("!")
    ("orbit", "So as it"),              # WHIP. WIDE, HIGH angle: the orbit; the Sun in the middle, the planet rolls round
                                        # it on its side, the pole always pointing the same way; YOU marked at the pole
    ("pole", "your pole"),              # MEDIUM, eye level, following the planet: the shadow line sweeps over his pole, his
                                        # balloon's lantern clicks on
    ("halftrip", "for half"),           # WIDE, straight down on the orbit: the night half of the lap paints itself navy
    ("trip", "One trip"),               # WHIP. MEDIUM: a lap counter over the orbit, the planet whizzes round; cut_84: CU on
                                        # the counter as it lands on 84 YEARS
    ("half", "Half of that"),           # WIDE: the lap split in two: 42 YEARS DAY / 42 YEARS NIGHT, the night half lights up
    ("dark", "in the DARK"),            # CU, LOW angle, him RIGHT in the basket: the last sliver of Sun drops on DARK: CLICK,
                                        # lights out, his eyes in the dark, the lantern on (tilt)
    ("night", "It's been"),             # WHIP. MEDIUM, HIGH angle: asleep in his sleeping bag in the basket, snoring, the
                                        # alarm clock on the rim, the year card 2007; stars
    ("lapse", "and sunrise"),           # WIDE, eye level: the time-lapse (the longest shot): the stars wheel round the pole,
                                        # the year card races 2007 -> 2049 (big HUD year), his beard grows down the basket,
                                        # frost and cobwebs; full silence; the sky's edge glows
    ("ring", None),                     # EXTREME CLOSE-UP: the first ray hits the frosted clock: RIIING (the biggest hit)
    ("button", None),                   # MEDIUM-CLOSE, him centre: bolt upright, a white beard down past the basket; on
                                        # "Grandpa." he looks down at it, then at us
    ("loop", None),                     # the hook's picture again (frame 0, young, setting the alarm): the loop
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Your night lasts / eight hours.",
    "On Uranus?",
    "Forty-two years.",
    "The whole planet",
    "is lying",
    "on its SIDE.",
    "So as it rolls / around the Sun,",
    "your pole / turns away",
    "for half / the trip.",
    "One trip takes",
    "eighty-four years.",
    "Half of that...",
    "in the DARK.",
    "It's been / night there",
    "since two thousand seven...",
    "and sunrise?",
    "Twenty forty-nine.",
    "Morning...",
    "Grandpa.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"8": G, "hours": G, "uranus": C, "42": Y, "years": Y, "planet": C, "side": Y, "sun": O, "pole": C, "away": B,
         "half": V, "trip": V, "84": Y, "dark": B, "night": B, "2007": O, "sunrise": Y, "2049": Y, "grandpa": G}
DISPLAY = {"eight hours": ["8", "HOURS"], "forty-two years": ["42", "YEARS"], "eighty-four years": ["84", "YEARS"],
           "since two thousand seven": ["SINCE", "2007..."], "twenty forty-nine": ["2049."]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

W, E, ev, find = T.W, T.E, T.ev, T.find
special["ring"] = E("forty-nine") + 0.40        # a full silence after 2049, then the first ray and the bell
special["button"] = W("Morning") - 0.15         # he is up, bearded, a beat before "Morning"
special["loop"] = T.duration - 0.6              # the last 0.6 s: the hook's picture again (the loop)
shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

_st = {s_["id"]: s_["start"] for s_ in shots}
_en = {s_["id"]: s_["end"] for s_ in shots}
_y2 = find("eighty-four years")
_n2 = find("been night")
cues = {
    "your": W("Your"), "night": W("night"), "eight": W("eight"), "hours": W("hours"), "hours_end": E("hours"),
    "on": W("On Uranus"), "uranus": W("Uranus"), "uranus_end": E("Uranus"), "forty": W("Forty-two"), "years": W("years"),
    "years_end": E("years"),
    "the": W("The whole"), "whole": W("whole"), "planet": W("planet"), "lying": W("lying"), "lying_end": E("lying"),
    "on2": W("on its SIDE"), "side": W("SIDE"), "side_end": E("SIDE"),
    "so": W("So as"), "rolls": W("rolls"), "sun": W("Sun"), "sun_end": E("Sun"), "your2": W("your pole"),
    "pole": W("pole"), "turns": W("turns"), "away": W("away"), "away_end": E("away"), "for": W("for half"),
    "half1": W("for half", 1), "trip1": W("half the trip", 2), "trip1_end": E("half the trip", 2),
    "one": W("One trip"), "trip2": W("One trip", 1), "takes": W("takes"), "eighty": W("eighty-four"),
    "eighty_end": E("eighty-four"), "years2": W("years", 0, _y2 + 1), "years2_end": E("years", 0, _y2 + 1),
    "half2": W("Half of that"), "that": W("Half of that", 2), "that_end": E("Half of that", 2), "in": W("in the DARK"),
    "dark": W("DARK"), "dark_end": E("DARK"),
    "its": W("It's been"), "night2": W("night", 0, _n2 + 1), "since": W("since"), "two": W("two thousand"),
    "seven": W("seven"), "seven_end": E("seven"),
    "and": W("and sunrise"), "sunrise": W("sunrise"), "sunrise_end": E("sunrise"), "twenty": W("Twenty"),
    "fortynine": W("forty-nine"), "fortynine_end": E("forty-nine"),
    "morning": W("Morning"), "morning_end": E("Morning"), "grandpa": W("Grandpa"), "grandpa_end": E("Grandpa"),
}
_order = ["your", "night", "eight", "hours", "hours_end", "on", "uranus", "uranus_end", "forty", "years", "years_end",
          "the", "whole", "planet", "lying", "lying_end", "on2", "side", "side_end", "so", "rolls", "sun", "sun_end",
          "your2", "pole", "turns", "away", "away_end", "for", "half1", "trip1", "trip1_end", "one", "trip2", "takes",
          "eighty", "eighty_end", "years2", "years2_end", "half2", "that", "that_end", "in", "dark", "dark_end", "its",
          "night2", "since", "two", "seven", "seven_end", "and", "sunrise", "sunrise_end", "twenty", "fortynine",
          "fortynine_end", "morning", "morning_end", "grandpa", "grandpa_end"]
assert all(cues[a_] < cues[b_] for a_, b_ in zip(_order, _order[1:])), [(a_, cues[a_]) for a_ in _order]
cues["end"] = T.duration
cues["loop"] = _st["loop"]
cues["set"] = cues["eight"] - 0.05              # his thumb clicks the clock's knob: the card shows 8 HOURS
cues["flip42"] = cues["forty"] - 0.03           # the card slams over to 42 YEARS (the first laugh's picture)
cues["ff"] = cues["years_end"] + 0.03           # the flash-forward: him, bearded, at the sunrise of 2049
cues["tip"] = cues["lying"] - 0.10              # the planet starts to topple
cues["flop"] = cues["side"] + 0.04              # it lands on its pillow, on its SIDE
cues["cut_84"] = cues["eighty"] - 0.07          # the counter shot jumps in close as it lands on 84
cues["lap_end"] = cues["years2"] + 0.10         # the lap is done: the counter reads 84
cues["night_on"] = cues["half2"] + 0.25         # the night half of the lap lights up
cues["click"] = cues["dark"] + 0.03             # the last of the Sun goes: lights out
cues["lapse0"] = _st["lapse"] + 0.10            # the years start to race
cues["y2049"] = cues["fortynine"] + 0.10        # the year card slams on 2049
cues["peek"] = _st["ring"] + 0.02               # the first ray over the cloud edge
cues["ring"] = _st["ring"] + 0.10               # the bell (the biggest hit of the Short)
cues["slap"] = _st["button"] + 0.06             # he jerks upright, the bell stops
cues["look"] = cues["grandpa"] - 0.05           # he looks down at the beard

CAMERA = {
    "hand": {"hook": 0.25, "hook_b": 0.3, "years": 0.3, "answer": 0.22, "side": 0.3, "orbit": 0.2, "pole": 0.3,
             "halftrip": 0.2, "trip": 0.25, "half": 0.2, "dark": 0.35, "night": 0.2, "lapse": 0.15, "ring": 0.6,
             "button": 0.35, "loop": 0.25},
    "whip": [[_st["orbit"], 1], [_st["trip"], -1], [_st["night"], 1]],
    "punch": [[cues["flop"] + 0.05, 1.15, _en["side"] - 0.02], [cues["grandpa"] - 0.03, 1.2, _en["button"] - 0.02]],
    "tilt": [[cues["click"], _en["dark"] - 0.02, -3.0]],
    "hit": [[cues["flop"] + 0.02, 4], [cues["ring"] + 0.02, 4]],
    "act": {"brow": [cues["uranus"], cues["forty"], cues["dark"], cues["morning"]]},
    "mood": [[0, "dusk"], [_st["answer"], "cold"], [_st["orbit"], "spot"], [cues["click"], "night"],
             [_st["ring"], "warm"], [_st["button"] - 0.05, "dusk"]],
    "fg": {"hook": "bokeh-l", "hook_b": "bokeh-r", "years": "bokeh-t", "dark": "bokeh-r", "night": "bokeh-t",
           "ring": "bokeh-r", "button": "bokeh-l", "loop": "bokeh-l"},
    "air": {"hook": {"kind": "sparkle", "amount": 0.35}, "hook_b": {"kind": "sparkle", "amount": 0.4},
            "years": {"kind": "sparkle", "amount": 0.3}, "answer": {"kind": "sparkle", "amount": 0.3},
            "side": {"kind": "sparkle", "amount": 0.3}, "orbit": {"kind": "sparkle", "amount": 0.2},
            "pole": {"kind": "sparkle", "amount": 0.25}, "dark": {"kind": "snow", "amount": 0.3},
            "night": {"kind": "snow", "amount": 0.35}, "lapse": {"kind": "snow", "amount": 0.5},
            "ring": {"kind": "dust", "amount": 0.5}, "button": {"kind": "sparkle", "amount": 0.4},
            "loop": {"kind": "sparkle", "amount": 0.35}},
    "flash": [[cues["ff"], 0.5, _st["button"] + 0.35, {}]],
}
T.write(shots, caps, cues, camera=CAMERA)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the comparison, about "your" night)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s_ in shots:
    print(f'  {s_["id"]:9s} {s_["start"]:6.2f} -> {s_["end"]:6.2f}  ({s_["end"] - s_["start"]:.2f} s)')
