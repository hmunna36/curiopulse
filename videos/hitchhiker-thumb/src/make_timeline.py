"""Edit timeline for the Can Your THUMB Bend Back Like a Hitchhiker's? 👍 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop (qa.py: at most 1.0 s)

# v3's alignment put a few words in the silence next to their own sound ("Now" after "Thumbs up!", "Hers?" after a
# tightened pause): move each onto its first run of speech-band energy after the word before it, and give it its length
for _ph in ("Now bend", "Hers?", "A belt"):
    _i = T.find(_ph)
    _b = T.bursts(T.we[_i - 1] + 0.04, T.we[_i] + 0.3)
    if _b and abs(_b[0][0] - 0.04 - T.ws[_i]) > 0.05:
        _new = round(_b[0][0] - 0.04, 3)
        if _new < T.ws[_i + 1] - 0.05:
            T.ws[_i] = T.words[_i]["start"] = _new
            T.we[_i] = T.words[_i]["end"] = round(max(min(_b[0][1], T.ws[_i + 1] - 0.01), _new + 0.12), 3)
            print(f'moved "{T.words[_i]["word"]}" to {T.ws[_i]:.2f}-{T.we[_i]:.2f} s (its first speech-band burst)')

# "Feel it catch?" sits a little early in the alignment (its first window is silence): onto its three bursts
T.retime("Feel it catch?", T.W("Feel it") - 0.1, T.E("catch?") + 0.12)
# "in" (picked in nineteen...) was given 80 ms of the gap before its sound: its window starts on the burst
_ii = T.find("in nineteen")
T.ws[_ii] = T.words[_ii]["start"] = round(T.ws[_ii] + 0.02, 3); T.we[_ii] = T.words[_ii]["end"] = round(T.ws[_ii + 1] - 0.005, 3)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),                     # THE TEST: frame 1 is his thumbs-up beside his face at the roadside, close (CU)
    ("hook_b", "just your"),            # ECU of the thumb: the tip strains back, barely moves, trembles (the strange thing)
    ("answer", "Barely"),               # WIDE (a whip): a car whooshes past him without stopping (the device, beat 1)
    ("answer_b", "Your thumb's wearing"),   # MCU on the hand and his face: a seatbelt snaps across the joint: CLICK
    ("belt", "Feel it"),                # ECU: the thumb turns to glass, he bends again, the strap inside goes taut
    ("belt_b", "palm side"),            # CU from the palm side: PALM SIDE, and the buckle LOCKS
    ("rival", "Hers?"),                 # MEDIUM (a whip): the rival down the road, her thumb bends into a hook; he stares
    ("rival_b", "Less seatbelt"),       # ECU of her glass thumb: a BUNGEE cord stretches
    ("rival_c", "BUNGEE"),              # WIDE: a car screeches to a stop for her (the device, beat 2); his jaw drops
    ("chart", "So, straight"),          # MEDIUM: the billboard's school chart, 2 KINDS OF THUMBS (held: the longest shot)
    ("myth", "Myth."),                  # CU punch: MYTH slams onto it, the chart's thumbs gasp
    ("xrays", "X-rays"),                # MEDIUM: the billboard flips to an x-ray light box
    ("xrays_b", "every angle"),         # CU: seven thumbs light up one by one, straight to hooked
    ("weird", "The line"),              # CU: a protractor slides on, its needle hunts for the line
    ("weird_b", "Fifty degrees"),       # ECU: the needle stops at 50, a red line splits the row
    ("weird_c", "picked in"),           # MEDIUM: a sepia card, PICKED IN 1953
    ("button", "Now try"),              # back to the hook's framing: his OTHER thumb comes up and bends further; a car
                                        # brakes for him at last (the device, beat 3); his right thumb is back up for frame 1
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Thumbs up!",
    "Now bend just / your thumb's",
    "tip BACK.",
    "Barely moved?",
    "Your thumb's / wearing a",
    "SEATBELT.",
    "Feel it catch?",
    "A belt on / the palm side",
    "just locked.",
    "Hers?",
    "Less seatbelt...",
    "more BUNGEE cord.",
    "So, straight / or hitchhiker's?",
    "Myth.",
    "X-rays found",
    "every angle / in between.",
    "The line / between them?",
    "Fifty degrees...",
    "picked in / nineteen fifty-three.",
    "Now try your / OTHER thumb!",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"back": Y, "seatbelt": C, "belt": C, "locked": R, "catch": C, "bungee": Y, "myth": R, "hitchhikers": O,
         "straight": G, "every": Y, "angle": Y, "fifty": R, "degrees": R, "other": G, "palm": C}
_i50, _i53 = T.find("Fifty degrees"), T.find("nineteen fifty-three")
DISPLAY = {" ".join(T.toks[_i50:_i50 + 2]): ["50°..."], " ".join(T.toks[_i53:_i53 + 2]): ["1953."]}
from timeline_lib import norm as _norm
COLOR.update({_norm("50°..."): R, _norm("1953."): O})
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
cues = {
    # the hook
    "thumbs": W("Thumbs"), "up": W("up!"), "up_end": E("up!"), "now1": W("Now bend"), "bend1": W("bend"), "just1": W("just your"),
    "tip1": W("tip BACK"), "back1": W("BACK."), "back1_end": E("BACK."),
    # the answer
    "barely": W("Barely"), "moved": W("moved?"), "moved_end": E("moved?"), "your2": W("Your thumb's wearing"),
    "wearing": W("wearing"), "seatbelt": W("SEATBELT."), "seatbelt_end": E("SEATBELT."),
    # the belt
    "feel": W("Feel it"), "catch": W("catch?"), "catch_end": E("catch?"), "abelt": W("A belt"), "palm": W("palm"),
    "side": W("side"), "just3": W("just locked"), "locked": W("locked."), "locked_end": E("locked."),
    # the rival
    "hers": W("Hers?"), "hers_end": E("Hers?"), "less": W("Less"), "seatbelt4": W("seatbelt...", 0, find("Less seatbelt")),
    "more": W("more"), "bungee": W("BUNGEE"), "cord": W("cord."), "cord_end": E("cord."),
    # the payoff
    "so": W("So,"), "straight": W("straight"), "hitch": W("hitchhiker's?"), "hitch_end": E("hitchhiker's?"),
    "myth": W("Myth."), "myth_end": E("Myth."), "xrays": W("X-rays"), "found": W("found"), "every": W("every"),
    "angle": W("angle"), "between5": W("between."), "between5_end": E("between."),
    # the weird fact
    "theline": W("The line"), "between6": W("between them"), "them": W("them?"), "them_end": E("them?"),
    "fifty": W("Fifty degrees"), "degrees": W("degrees..."), "degrees_end": E("degrees..."), "picked": W("picked"),
    "nineteen": W("nineteen"), "fiftythree": W("fifty-three."), "fiftythree_end": E("fifty-three."),
    # the button
    "now9": W("Now try"), "try": W("try"), "other": W("OTHER"), "thumb9": W("thumb!", 0, find("OTHER thumb")),
    "thumb9_end": E("thumb!", 0, find("OTHER thumb")),
}
cues["end"] = T.duration
_st = {s_["id"]: s_["start"] for s_ in shots}
cues.update({f"shot_{k}": v for k, v in _st.items()})
cues["ff"] = round(cues["back1_end"] + 0.03, 3)                 # the flash-forward, in the gap before "Barely"
cues["car1"] = cues["barely"] + 0.05                            # the first car passes him
cues["click"] = round(cues["seatbelt_end"] + 0.02, 3)           # the seatbelt clicks onto the joint (in the pause after the word)
cues["lock"] = round(cues["locked_end"] + 0.02, 3)              # the buckle locks (in the pause)
cues["boing"] = round(E("more") + 0.03, 3)                       # the bungee boings (in the pause after "more")
cues["skid"] = cues["shot_rival_c"] + 0.12                      # the car brakes for her
cues["slam"] = round(cues["myth_end"] + 0.02, 3)                # MYTH lands (in the pause after the word)
cues["line50"] = cues["degrees"] + 0.05
cues["brake9"] = cues["thumb9"] + 0.1                           # a car brakes for him
cues["cut_click"] = round(cues["seatbelt"] - 0.04, 3)            # a cut inside answer_b: in tight on the joint as it clicks
cues["cut_back"] = round(cues["back1"] - 0.04, 3)               # a cut inside hook_b: closer as the tip stops
cues["loopcut"] = round(cues["thumb9_end"] + 0.28, 3)          # the loop: frame 1's picture for the last frames
cues["cut_other"] = round(cues["other"] - 0.04, 3)              # a cut inside the button: back to frame 1's framing
assert cues["up"] < cues["back1"] < cues["ff"] < cues["barely"] < cues["seatbelt"] < cues["feel"] < cues["locked"] \
    < cues["hers"] < cues["bungee"] < cues["so"] < cues["myth"] < cues["xrays"] < cues["theline"] < cues["fifty"] \
    < cues["picked"] < cues["now9"] < cues["other"] < cues["end"]
assert cues["ff"] + 0.55 <= cues["barely"] + 0.02, (cues["ff"], cues["barely"])

# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "hook_b": 0.35, "answer": 0.3, "answer_b": 0.28, "belt": 0.22, "belt_b": 0.25, "rival": 0.3,
             "rival_b": 0.3, "rival_c": 0.4, "chart": 0.2, "myth": 0.4, "xrays": 0.25, "xrays_b": 0.22, "weird": 0.22,
             "weird_b": 0.25, "weird_c": 0.25, "button": 0.3},
    # whips at the story turns: the fail -> the wide road, into the rival, onto the billboard
    "whip": [[_st["answer"], -1], [_st["rival"], -1], [_st["chart"], 1]],
    # punch-ins: the answer's sting (SEATBELT), the payoff's sting (Myth.), the number (50°)
    "punch": [[cues["seatbelt"] - 0.03, 1.2, cues["seatbelt_end"] + 0.3], [cues["myth"] - 0.03, 1.22, cues["myth_end"] + 0.35],
              [cues["line50"] - 0.03, 1.14, cues["degrees_end"] + 0.2]],
    # a dutch tilt while the thumb refuses, and while the car leaves her standing... him standing
    "tilt": [[cues["tip1"] - 0.05, cues["back1_end"] + 0.02, -3.0], [cues["skid"], cues["cord_end"] + 0.2, 3.0]],
    # hitstops: the click of the seatbelt, the MYTH stamp
    "hit": [[cues["click"], 4], [cues["slam"], 4]],
    "act": {"brow": [cues["catch"], cues["hers"], cues["every"], cues["other"]]},
    # golden hour; a cloud over him when the car leaves him; cool in the glass; warm for her; spot for the myth; cool on
    # the x-rays; warm again before the button (the loop: frame 1's warm)
    "mood": [[0, "warm"], [cues["barely"] - 0.05, "shade"], [cues["feel"] - 0.1, "cold"], [cues["hers"] - 0.1, "warm"],
             [cues["myth"] - 0.08, "spot"], [cues["xrays"] - 0.1, "cold"], [cues["now9"] - 0.12, "warm"]],
    "fg": {"answer": "grass-bl", "rival": "grass-br", "rival_c": "grass-bl", "chart": "post-l", "weird_c": "post-r", "button": "grass-br"},
    "air": {"hook": {"kind": "dust", "amount": 0.5}, "hook_b": {"kind": "dust", "amount": 0.35}, "answer": {"kind": "dust", "amount": 0.8},
            "answer_b": {"kind": "dust", "amount": 0.4}, "rival": {"kind": "dust", "amount": 0.5}, "rival_b": {"kind": "dust", "amount": 0.35},
            "rival_c": {"kind": "dust", "amount": 0.9}, "chart": {"kind": "dust", "amount": 0.4}, "weird": {"kind": "dust", "amount": 0.3},
            "weird_c": {"kind": "dust", "amount": 0.4}, "button": {"kind": "dust", "amount": 0.5}},
    "lens": [],
    # the flash-forward: the x-ray light box of every angle, in a window beside the strained thumb
    "flash": [[cues["ff"], 0.55, _st["xrays_b"] + 0.9, {"win": [320, 668, 190], "at": [540, 760], "zoom": 1.25}]],
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
