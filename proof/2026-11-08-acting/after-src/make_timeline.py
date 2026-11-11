"""Edit timeline for the Why Can't You Lick Your ELBOW? 💪 Short.

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
    ("hook", None),             # THE TEST, tight: a hot day on the trail, his RIGHT arm (screen right) up beside his face,
                                # an ice cream cone in that fist, a chocolate drip run down his bare forearm to the elbow;
                                # his tongue out of the corner of his mouth, straining for the drip, a hair short (frame 0).
                                # "Go on...": he strains harder (tremble, sweat); "gently.": the drip wobbles, still short
    ("answer", "Can't?"),       # cut: he has switched to the LEFT elbow (screen left), same strain, same miss. "Can't?" he
                                # gasps the tongue back in; "Your tongue's fine...": it pops out, a green TONGUE pill with a
                                # tick; "your ARM's too long.": a tape measure zips from his shoulder along the upper arm and
                                # runs PAST the elbow; a red TOO LONG stamp
    ("feel", "Feel your"),      # his free hand squeezes his left upper arm (the viewer does it too); "One stiff bone...":
                                # the arm goes see-through, ONE white bone from shoulder ball to elbow, tok-tok; "pinned at
                                # your shoulder.": a big red pushpin THUNKS into the shoulder
    ("swing", "Now swing"),     # a little wider: the arm swings round the pin like a compass, the elbow (with its drip)
                                # drawing a dashed gold arc; "to your mouth...": it comes up toward his face; "it sails right
                                # PAST.": the elbow sweeps across ABOVE his mouth, his tongue snaps at it (CHOMP), misses
    ("payoff", "Your mouth sits"),  # wider still: the whole gold circle round the pin, his MOUTH a red target INSIDE it;
                                # "The elbow can only go round.": the arm windmills, the elbow orbiting the circle, his
                                # head and eyes following it round, tongue out, dizzy
    ("weird", "The rare"),      # "The rare few who can?": he looks up hopeful, POOF; "Long tongues...": his tongue
                                # stretches like taffy; "short arms.": his upper arm shrinks (the circle shrinks with it)
                                # and the elbow lands on his tongue: SLURP, sparkles, bliss
    ("button", "Now try"),      # POOF back to normal; "OTHER": he tosses the cone over his head to the other hand, the
                                # left arm drops and the right arm comes up: the picture of frame 1
    ("loop", None),             # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Can you lick / your elbow?", "Go on...", "gently.",
    "Can't?", "Your tongue's / fine...", "your ARM's", "too long.",
    "Feel your / upper arm?", "One stiff bone...", "pinned at / your shoulder.",
    "Now swing / your elbow", "to your mouth...", "it sails / right PAST.",
    "Your mouth sits", "INSIDE / its circle.", "The elbow can / only go round.",
    "The rare few / who can?", "Long tongues...", "short arms.",
    "Now try the / OTHER elbow.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"lick": P["P"], "elbow": Y, "cant": R, "tongues": P["P"], "fine": G, "arms": O, "long": R, "upper": O, "arm": O,
         "stiff": C, "bone": C, "pinned": Y, "shoulder": Y, "swing": C, "mouth": R, "past": O, "inside": G, "circle": Y,
         "round": Y, "rare": V, "short": G, "other": C}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iS = find("Now swing")
iP = find("Your mouth sits")
iB = find("Now try")
iR = find("The rare")
cues = {
    # the hook
    "can": W("Can"), "lick": W("lick"), "elbow1": W("elbow?"), "elbow1_end": E("elbow?"), "go": W("Go"), "on": W("on..."),
    "on_end": E("on..."), "gently": W("gently."), "gently_end": E("gently."),
    # the answer
    "cant": W("Can't?"), "cant_end": E("Can't?"), "tongue": W("tongue's"), "fine": W("fine..."), "fine_end": E("fine..."),
    "your_a": W("your ARM's"), "arms": W("ARM's"), "too": W("too"), "long": W("long."), "long_end": E("long."),
    # the bone and the pin
    "feel": W("Feel"), "upper": W("upper"), "arm_f": W("arm?"), "arm_f_end": E("arm?"), "one": W("One"), "stiff": W("stiff"),
    "bone": W("bone..."), "bone_end": E("bone..."), "pinned": W("pinned"), "at": W("at your shoulder"), "shoulder": W("shoulder."),
    "shoulder_end": E("shoulder."),
    # the swing
    "now_s": W("Now", s=iS), "swing": W("swing"), "elbow2": W("elbow", s=iS), "to_m": W("to your mouth"), "mouth1": W("mouth...", s=iS),
    "mouth1_end": E("mouth...", s=iS), "it": W("it sails"), "sails": W("sails"), "right": W("right"), "past": W("PAST."),
    "past_end": E("PAST."),
    # the circle
    "your_m": W("Your", s=iP), "mouth2": W("mouth", s=iP), "sits": W("sits"), "inside": W("INSIDE"), "inside_end": E("INSIDE"),
    "its": W("its"), "circle": W("circle."), "circle_end": E("circle."), "the_e": W("The elbow can"), "elbow3": W("elbow can"),
    "only": W("only"), "go_r": W("go round"), "round": W("round."), "round_end": E("round."),
    # the rare few
    "rare_the": W("The rare"), "rare": W("rare"), "few": W("few"), "can2": W("can?", s=iR), "can2_end": E("can?", s=iR),
    "long_t": W("Long", s=iR), "tongues": W("tongues..."), "tongues_end": E("tongues..."), "short": W("short"), "arms2": W("arms."),
    "arms2_end": E("arms."),
    # the button
    "now_b": W("Now", s=iB), "try": W("try"), "other": W("OTHER"), "other_end": E("OTHER"), "elbow4": W("elbow.", s=iB),
    "elbow4_end": E("elbow.", s=iB),
}
cues["loop_in"] = round(T.duration - 0.40, 3)
# the windmill in the payoff: one and a half turns of the elbow round the pin, from "only" to just before "The rare"
cues["orbit_0"] = round(cues["only"] - 0.15, 3)
cues["orbit_1"] = round(cues["rare_the"] - 0.12, 3)
# the cone toss in the button: from the left fist over his head to the right fist
cues["toss_0"] = round(cues["other"] - 0.10, 3)
cues["toss_1"] = round(min(cues["elbow4_end"] - 0.05, cues["loop_in"] - 0.12), 3)
_order = ["can", "lick", "elbow1", "go", "on", "gently", "gently_end", "cant", "cant_end", "tongue", "fine", "your_a", "arms",
          "too", "long", "long_end", "feel", "upper", "arm_f", "one", "stiff", "bone", "pinned", "shoulder", "shoulder_end",
          "now_s", "swing", "elbow2", "to_m", "mouth1", "it", "sails", "right", "past", "past_end", "your_m", "mouth2", "sits",
          "inside", "its", "circle", "circle_end", "the_e", "elbow3", "orbit_0", "only", "go_r", "round", "round_end", "orbit_1",
          "rare_the", "rare", "few", "can2", "long_t", "tongues", "short", "arms2", "arms2_end", "now_b", "try", "toss_0",
          "other", "elbow4", "toss_1", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
_st = {s_["id"]: s_["start"] for s_ in shots}
CAMERA = {
    # handheld: calm on the test, tense on the swing, calm again for the loop (the loop shot matches the hook)
    "hand": {"hook": 0.25, "answer": 0.3, "feel": 0.25, "swing": 0.45, "payoff": 0.3, "weird": 0.35, "button": 0.25, "loop": 0.25},
    # whips at the story turns: to the other elbow, into the swing, into the rare few
    "whip": [[_st["answer"], -1], [_st["swing"], 1], [_st["weird"], -1]],
    # punch-ins on the punchline, the pin and the miss (not on the circle: that shot's point is the whole picture)
    "punch": [[cues["long"] - 0.02, 1.22], [cues["pinned"], 1.14], [cues["past"] - 0.03, 1.2]],
    # dutch tilts when it goes wrong
    "tilt": [[cues["cant"] - 0.05, cues["cant_end"] + 0.1, 2.5], [cues["it"] - 0.05, cues["past_end"], -3.5]],
    # the light follows the stakes: hot sun, a cloud over it at the fail, warm for the bone, back to day for the loop
    "mood": [[0, "day"], [cues["cant"] - 0.05, "shade"], [cues["one"] - 0.1, "warm"], [cues["rare_the"] - 0.15, "day"]],
    "fg": {"hook": "leaves-tr", "answer": "grass-b", "feel": "leaves-tl", "swing": "grass-br", "weird": "leaves-tr",
           "button": "leaves-tr", "loop": "leaves-tr"},
    # the punchlines' impacts freeze for 4 frames while the camera shakes (the video-quality research, 8 Nov 2026)
    "hit": [[cues["long"] + 0.06, 4], [cues["past"] + 0.08, 4]],      # on the impact frame: the stamp in, CHOMP! full size
    # automatic acting: brow lifts on the beats where he finds something out (blinks and eye darts run by themselves)
    "act": {"brow": [cues["fine"] - 0.05, cues["feel"] + 0.05, cues["now_s"] + 0.05]},
    "air": {"hook": {"kind": "pollen", "amount": 0.7}, "answer": {"kind": "dust", "amount": 0.4}, "feel": "dust", "swing": "dust",
            "payoff": "sparkle", "weird": "pollen", "button": {"kind": "pollen", "amount": 0.7}, "loop": {"kind": "pollen", "amount": 0.7}},
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
print("shots: " + ", ".join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
