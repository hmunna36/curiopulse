"""Edit timeline for the Can You Bend Just the TIP of Your Finger? 👆 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop. The tight
#                                      rules (5 Nov 2026): 25-30 s, the last line runs straight into the first and nothing
#                                      comes after it (qa.py: at most 1.0 s).

# v3's alignment: "The" (after "Sorry.") sat in the pause before its own sound, and "See" on its hiss only (the vowel comes
# later): move each onto its first run of speech-band energy (bent-wrist-fist, 29 Oct 2026; narration.md)
for _ph in ("The tip only", "See that string?"):
    _i = T.find(_ph)
    _b = T.bursts(T.we[_i - 1] + 0.04, T.we[_i] + 0.3)
    if _b and _b[0][0] - 0.04 > T.ws[_i] + 0.05:
        T.ws[_i] = T.words[_i]["start"] = round(_b[0][0] - 0.04, 3)
        # and give it its real length: it lasts until the next word starts (the aligner had left it 10 ms)
        T.we[_i] = T.words[_i]["end"] = round(max(T.we[_i], min(T.ws[_i + 1] - 0.01, T.ws[_i] + 0.2)), 3)
        print(f'moved "{T.words[_i]["word"]}" to {T.ws[_i]:.2f}-{T.we[_i]:.2f} s (its first speech-band burst)')

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),                    # THE TEST: frame 1 is his raised index finger, close, beside his face at the trail
                                       # cafe's counter; "Now bend only the TIP": the tip bends and the middle joint folds
                                       # with it (the strange thing, about 3 s)
    ("answer", "Middle joint bent"),   # a whip to a new framing of the same hooked finger (low angle, the cafe behind him):
                                       # a ring round the bent middle joint; a menu card pops: TIP ... COMBO ONLY
    ("string", "See that string?"),    # a whip into the hand: it turns to glass where it is, ONE glowing string runs from
                                       # the forearm muscle (the little puller) to the tip, over the middle joint: he pulls,
                                       # both joints fold
    ("pin", "Now hold"),               # a cut to the other side: his other hand comes in and holds the middle joint still;
                                       # the puller pulls and only the tip bends: "There it goes!" (punch-in on the tip)
    ("doctors", "Congrats."),          # a whip out to a medium shot: a spotlight, a doctor's head mirror pops on his hat, a
                                       # HAND DOCTORS' TEST stamp with a tick
    ("button", "Let go"),              # back to the hook's framing: he lets go, bends the tip, the whole finger hooks (the
                                       # combo is back), and it springs straight for frame 1 (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Point your / finger.",
    "Now bend only / the TIP.",
    "Middle joint / bent too?",
    "Sorry.",
    "The tip / only comes",
    "as a COMBO.",
    "See that string?",
    "It pulls / the tip",
    "AND the / middle joint.",
    "Now hold the / middle joint still,",
    "and bend / the tip.",
    "There it goes!",
    "Congrats.",
    "That's / exactly how",
    "hand doctors",
    "check / that string.",
    "Let go,",
    "and the / combo's back.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"tip": Y, "combo": V, "combos": V, "string": O, "middle": C, "joint": C, "hold": G, "goes": G, "doctors": B,
         "congrats": G}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_ans, i_str, i_pin, i_doc, i_but = find("Middle joint bent"), find("See that string?"), find("Now hold"), find("Congrats."), find("Let go")
cues = {
    # the hook: point, then bend only the tip
    "point": W("Point"), "finger_end": E("finger."), "now1": W("Now bend"), "bend1": W("bend"), "only1": W("only"),
    "tip1": W("TIP."), "tip1_end": E("TIP."),
    # the answer
    "middle2": W("Middle", 0, i_ans), "joint2": W("joint", 0, i_ans), "bent2": W("bent", 0, i_ans), "too_end": E("too?"),
    "sorry": W("Sorry."), "sorry_end": E("Sorry."), "the2": W("The tip only"), "tip2": W("tip", 0, find("The tip only")),
    "comes": W("comes"), "combo": W("COMBO."), "combo_end": E("COMBO."),
    # the string
    "see": W("See"), "string3": W("string?"), "string3_end": E("string?"), "pulls": W("pulls"), "tip3": W("tip", 0, find("pulls the tip")),
    "and3": W("AND", 0, i_str), "middle3": W("middle", 0, i_str), "joint3": W("joint.", 0, i_str), "joint3_end": E("joint.", 0, i_str),
    # the pin
    "now2": W("Now hold"), "hold": W("hold"), "middle4": W("middle", 0, i_pin), "still": W("still,"), "still_end": E("still,"),
    "and4": W("and bend"), "bend4": W("bend", 0, find("and bend")), "tip4": W("tip.", 0, find("and bend")), "tip4_end": E("tip.", 0, find("and bend")),
    # the payoff
    "there": W("There"), "goes": W("goes!"), "goes_end": E("goes!"),
    # the doctors
    "congrats": W("Congrats."), "congrats_end": E("Congrats."), "thats": W("That's"), "exactly": W("exactly"),
    "hand5": W("hand doctors"), "doctors": W("doctors"), "check": W("check"), "string5": W("string.", 0, i_doc),
    "string5_end": E("string.", 0, i_doc),
    # the button
    "letgo": W("Let go"), "go_end": E("go,"), "and6": W("and", 0, i_but), "combo6": W("combo's"), "back": W("back."),
    "back_end": E("back."),
}
cues["end"] = T.duration
_st = {s_["id"]: s_["start"] for s_ in shots}
cues.update({f"shot_{k}": v for k, v in _st.items()})
assert cues["tip1"] < cues["middle2"] < cues["combo"] < cues["see"] < cues["pulls"] < cues["and3"] < cues["now2"] \
    < cues["still"] < cues["tip4"] < cues["there"] < cues["congrats"] < cues["doctors"] < cues["letgo"] < cues["combo6"] < cues["end"]

# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "answer": 0.32, "string": 0.22, "pin": 0.3, "doctors": 0.32, "button": 0.25},
    # whips at the story turns: the test -> the answer (two framings of the same test), into the glass hand, into the fact
    "whip": [[_st["answer"], 1], [_st["string"], -1], [_st["doctors"], 1]],
    # punch-ins: the answer's sting ("COMBO.") on his hand and face, the reveal ("There it goes!") on the bending tip
    "punch": [[cues["combo"] - 0.03, 1.2, cues["combo_end"] + 0.3], [cues["goes"] - 0.04, 1.18, cues["goes_end"] + 0.45]],
    # a dutch tilt while the finger folds the wrong way
    "tilt": [[cues["middle2"] - 0.05, cues["too_end"] + 0.25, -3.0]],
    # the cafe's warm dusk; a cloud over it when the middle joint tags along; cool inside the glass; warm for the reveal;
    # a spotlight for the award; back to frame 1's warm before the button (the loop)
    "mood": [[0, "warm"], [cues["middle2"] - 0.05, "shade"], [cues["see"] - 0.1, "cold"], [cues["there"] - 0.1, "warm"],
             [cues["congrats"] - 0.1, "spot"], [cues["letgo"] - 0.12, "warm"]],
    # depth in front of the lens: lamp bokeh and a post, alternating corners
    "fg": {"answer": "bokeh-r", "string": {"kind": "post-l", "col": "#2A1408", "lit": "#5A3218"}, "pin": "bokeh-r", "doctors": "bokeh-l"},
    # the air of a lamp-lit cafe: dust in the lamplight, sparkle on the reveal and the award
    "air": {"hook": {"kind": "dust", "amount": 0.55}, "answer": {"kind": "dust", "amount": 0.45},
            "pin": {"kind": "sparkle", "amount": 0.5}, "doctors": {"kind": "sparkle", "amount": 0.7},
            "button": {"kind": "dust", "amount": 0.55}},
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
