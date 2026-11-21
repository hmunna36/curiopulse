"""Edit timeline for the Why Does the WRONG Finger Move? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop (qa.py: at most 1.0 s)

# v3's alignment gave "You" (You moved its twin) the breath before it: move it onto its first speech-band burst
for _ph in ("You moved",):
    _i = T.find(_ph)
    _b = T.bursts(T.we[_i - 1] + 0.04, T.we[_i] + 0.3)
    if _b and abs(_b[0][0] - 0.04 - T.ws[_i]) > 0.05:
        _new = round(_b[0][0] - 0.04, 3)
        if _new < T.ws[_i + 1] - 0.05:
            T.ws[_i] = T.words[_i]["start"] = _new
            T.we[_i] = T.words[_i]["end"] = round(max(min(_b[0][1], T.ws[_i + 1] - 0.01), _new + 0.12), 3)
            print(f'moved "{T.words[_i]["word"]}" to {T.ws[_i]:.2f}-{T.we[_i]:.2f} s (its first speech-band burst)')

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. Every id needs an SC.<id> in web/.
# POV = his own view down at his hands across the picnic table (the viewer copies it); FRONT = him seen from the front.
SHOTS = [
    ("hook", None),                 # POV MEDIUM: his forearms crossed in an X, hands open; the raccoon watches across the
                                    # table; "clasp" interlaces them (cut_roll: CLOSE as the knot rolls in toward us)
    ("dare", "Now wiggle"),         # POV MEDIUM: the raccoon reaches across and points at ONE finger (a ring); on "finger!"
                                    # its TWIN on the other hand pops up instead; the raccoon smirks (the device, beat 1)
    ("answer", "Wrong one?"),       # FRONT MCU (a whip): him staring down at the twin that waves at him; the raccoon giggles
                                    # (cut_twin: FRONT ECU of the knot, the twin's little face: "me?")
    ("other", "on the OTHER"),      # POV CLOSE: the twin's whole hand lights up blue, OTHER HAND (punch + hitstop)
    ("again", "Try this one."),     # POV MEDIUM (a whip): the raccoon points at another finger, its twin pops
                                    # (cut_this: POV CLOSE, rapid-fire, the raccoon falls back laughing: beat 2)
    ("mech", "It's on your"),       # POV MEDIUM x-ray: his RIGHT hand glows orange on the LEFT side (cut_calls: POV CLOSE on
                                    # the arms, a call runs up his LEFT arm from the bottom left... across to the right)
    ("crossed", "You crossed"),     # POV ECU on the crossed wrists: a red X; the blue twin pops at the end of the call
    ("touch", None),                # POV CLOSE, held (the longest shot): silence, the raccoon's paw creeps in and TOUCHES it
    ("miss", None),                 # POV MEDIUM: the RIGHT finger pops, a green tick; the raccoon's jaw drops (beat 3)
                                    # (cut_never: CLOSE on the raccoon's face)
    ("sting", "Your skin knows"),   # POV ECU on the touched finger, its skin lit, proud face
                                    # (cut_eyes: FRONT ECU of his eyes, darting, two question marks)
    ("button", "Now try"),          # FRONT MEDIUM: he points at the raccoon, whose own paws are knotted; ITS twin pops; it stares
                                    # at us. loopcut: frame 1's picture (the crossed wrists) for the last frames
]
special = {"touch": T.E("them.", 0, T.find("You crossed them")) + 0.25, "miss": T.E("it...", 0, T.find("TOUCHES it")) + 0.16}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Cross your wrists,",
    "clasp,",
    "roll them in.",
    "Now wiggle",
    "THIS finger!",
    "Wrong one?",
    "You moved / its twin...",
    "on the / OTHER hand.",
    "Try this one.",
    "And THIS one!",
    "It's on / your LEFT...",
    "so your brain / calls your",
    "LEFT hand.",
    "You crossed them.",
    "But if someone",
    "TOUCHES it...",
    "you almost / never miss.",
    "Your skin knows.",
    "Your eyes / just guess.",
    "Now try it",
    "on a friend.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"wrists": Y, "clasp": Y, "roll": Y, "this": Y, "finger": Y, "wrong": R, "twin": C, "other": C, "left": C,
         "crossed": R, "touches": G, "never": G, "miss": G, "skin": G, "eyes": O, "guess": O, "friend": Y}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_ia = find("Try this one"); _im = find("so your brain"); _ib = find("Now try it"); _ib3 = find("And THIS one"); _ic6 = find("You crossed them")
cues = {
    # the hook: cross, clasp, roll
    "cross": W("Cross"), "wrists": W("wrists,"), "wrists_end": E("wrists,"), "clasp": W("clasp,"), "clasp_end": E("clasp,"),
    "roll": W("roll"), "in1": W("in."), "in1_end": E("in."),
    # the dare
    "now1": W("Now wiggle"), "wiggle": W("wiggle"), "this1": W("THIS finger"), "finger1": W("finger!"), "finger1_end": E("finger!"),
    # the answer
    "wrong": W("Wrong"), "one1": W("one?"), "one1_end": E("one?"), "you2": W("You moved"), "moved": W("moved"),
    "twin": W("twin..."), "twin_end": E("twin..."), "on2": W("on the OTHER"), "other": W("OTHER"), "hand2": W("hand.", 0, find("OTHER hand")),
    "hand2_end": E("hand.", 0, find("OTHER hand")),
    # again
    "try3": W("Try this one"), "this3": W("this one.", 0, _ia), "one3_end": E("one.", 0, _ia), "and3": W("And THIS"),
    "this3b": W("THIS one!", 0, _ib3), "one3b": W("one!", 0, _ib3), "one3b_end": E("one!", 0, _ib3),
    # the mechanism
    "its": W("It's on"), "left4": W("LEFT..."), "left4_end": E("LEFT..."), "so": W("so your brain"), "brain": W("brain"),
    "calls": W("calls"), "left5": W("LEFT hand"), "hand5": W("hand.", 0, find("LEFT hand")), "hand5_end": E("hand.", 0, find("LEFT hand")),
    "you6": W("You crossed"), "crossed": W("crossed"), "them": W("them.", 0, _ic6), "them_end": E("them.", 0, _ic6),
    # the payoff
    "but": W("But if"), "someone": W("someone"), "touches": W("TOUCHES"), "it7": W("it...", 0, find("TOUCHES it")),
    "it7_end": E("it...", 0, find("TOUCHES it")), "you7": W("you almost"), "almost": W("almost"), "never": W("never"),
    "miss": W("miss."), "miss_end": E("miss."),
    # the sting
    "skin": W("skin"), "knows": W("knows."), "knows_end": E("knows."), "eyes": W("Your eyes"), "eyes_w": W("eyes"),
    "just": W("just guess"), "guess": W("guess."), "guess_end": E("guess."),
    # the button
    "now9": W("Now try it"), "try9": W("try it"), "friend": W("friend."), "friend_end": E("friend."),
}
cues["end"] = T.duration
_st = {s_["id"]: s_["start"] for s_ in shots}
cues.update({f"shot_{k}": v for k, v in _st.items()})
cues["clack"] = round(cues["clasp"] + 0.12, 3)                  # the fingers lock together
cues["rollmid"] = round(cues["roll"] + 0.42, 3)                 # the knot is edge-on in the middle of its roll
cues["rolled"] = round(cues["in1_end"] + 0.05, 3)                # the roll is done
cues["point1"] = round(cues["this1"] - 0.05, 3)                  # the paw arrives at the finger
cues["pop1"] = round(cues["finger1_end"] - 0.06, 3)              # the TWIN pops instead (as the word ends)
cues["ff"] = round(cues["twin"] + 0.1, 3)                        # the flash-forward, under the long "twiiin..."
cues["glowB"] = round(cues["other"] - 0.02, 3)                   # the twin's whole hand lights up blue
cues["slam2"] = round(cues["hand2_end"] + 0.02, 3)               # OTHER HAND lands (hitstop), in the pause after "hand."
cues["point3"] = round(cues["this3"] - 0.02, 3)
cues["pop3"] = round(cues["one3_end"] - 0.12, 3)
cues["point3b"] = round(cues["this3b"] - 0.05, 3)
cues["pop3b"] = round(cues["one3b_end"] - 0.08, 3)
cues["laugh"] = round(cues["one3b_end"] + 0.05, 3)               # the raccoon falls back laughing
cues["glowA"] = round(cues["its"] - 0.02, 3)                     # his right hand lights orange on the left
cues["call"] = round(cues["calls"] - 0.05, 3)                    # the call starts at the bottom left
cues["callin"] = round(cues["hand5_end"] + 0.1, 3)               # it reaches the blue hand on the right
cues["xslam"] = round(cues["crossed"] + 0.12, 3)                 # the red X on the crossed wrists (hitstop)
cues["pop6"] = round(cues["them_end"] + 0.02, 3)                 # the blue twin pops at the end of the call (after "them.")
cues["creep"] = round(_st["touch"] + 0.15, 3)                    # the paw starts creeping in (silence)
cues["contact"] = round(cues["touches"] + 0.16, 3)               # the paw touches the finger
cues["popright"] = round(_st["miss"] + 0.02, 3)                  # the RIGHT finger pops (the biggest hit, after the silence)
cues["jaw"] = round(cues["never"] - 0.05, 3)                     # the raccoon's jaw drops
cues["glow8"] = round(cues["skin"] - 0.05, 3)
cues["q1"] = round(cues["eyes_w"] + 0.05, 3)                     # question marks in his eyes
cues["point9"] = round(cues["try9"] - 0.05, 3)                   # he points at the raccoon
cues["pop9"] = round(cues["friend"] + 0.06, 3)                   # the raccoon's own twin pops
cues["cut_roll"] = round(cues["roll"] - 0.04, 3)                 # a cut inside the hook: closer as the knot rolls in
cues["cut_twin"] = round(cues["you2"] - 0.04, 3)                 # a cut inside the answer: the ECU of the twin
cues["cut_this"] = round(cues["and3"] - 0.04, 3)                 # a cut inside again: closer, rapid-fire
cues["cut_calls"] = round(cues["so"] - 0.04, 3)                  # a cut inside the mechanism: onto the arms
cues["cut_never"] = round(cues["never"] - 0.08, 3)               # a cut inside miss: the raccoon's face
cues["cut_eyes"] = round(cues["eyes"] - 0.04, 3)                 # a cut inside the sting: his eyes
cues["loopcut"] = round(cues["friend_end"] + 0.3, 3)            # the loop: frame 1's picture for the last frames
assert cues["roll"] < cues["now1"] < cues["pop1"] < cues["wrong"] <= 5.0 < cues["ff"] < cues["other"] < cues["try3"] \
    < cues["and3"] < cues["its"] < cues["so"] < cues["you6"] < cues["but"] < cues["popright"] < cues["never"] \
    < cues["skin"] < cues["eyes"] < cues["now9"] < cues["loopcut"] < cues["end"], cues
assert 4.0 <= cues["ff"] <= 7.0, cues["ff"]
assert cues["this3"] < cues["this3b"] < cues["one3b"] < cues["its"] and cues["crossed"] < cues["them"] < cues["but"], cues

# ---- the camera and the light (the cinema kit, 7 Nov 2026; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "dare": 0.3, "answer": 0.3, "other": 0.32, "again": 0.35, "mech": 0.22, "crossed": 0.3,
             "touch": 0.18, "miss": 0.4, "sting": 0.25, "button": 0.25},
    # whips at the story turns: the fail -> him (the answer), back to the test (again), into the payoff (miss)
    "whip": [[_st["answer"], -1], [_st["again"], 1], [_st["miss"], -1]],
    # punch-ins: the answer's sting (OTHER hand), the payoff (never miss), the sting (guess)
    "punch": [[cues["other"] - 0.03, 1.18, cues["hand2_end"] + 0.25], [cues["never"] - 0.02, 1.16, cues["miss_end"] + 0.2],
              [cues["guess"] - 0.03, 1.15, cues["guess_end"] + 0.25]],
    # a dutch tilt while the twin pops (it goes wrong) and while the raccoon laughs
    "tilt": [[cues["pop1"] - 0.02, cues["one1_end"], -3.0], [cues["laugh"] - 0.05, _st["mech"] - 0.02, 3.0]],
    # hitstops: OTHER HAND lands; the RIGHT finger pops
    "hit": [[cues["slam2"], 4], [cues["popright"] + 0.08, 4]],
    "act": {"brow": [cues["pop1"] + 0.3, cues["other"], cues["calls"], cues["never"]]},
    # a warm lantern night; cool on the x-ray; a spotlight for the touch; warm again for the payoff and the loop
    "mood": [[0, "day"], [cues["glowA"] - 0.1, "cold"], [_st["touch"], "spot"], [cues["popright"] - 0.05, "warm"], [cues["now9"] - 0.12, "day"]],
    "fg": {"hook": "leaves-tr", "dare": "leaves-tl", "again": "leaves-tr", "miss": "leaves-tl",
           "button": "grass-bl", "answer": "leaves-tl"},
    "air": {"hook": {"kind": "embers", "amount": 0.35}, "dare": {"kind": "embers", "amount": 0.3}, "answer": {"kind": "embers", "amount": 0.4},
            "again": {"kind": "embers", "amount": 0.35}, "mech": {"kind": "embers", "amount": 0.3}, "touch": {"kind": "dust", "amount": 0.3}, "miss": {"kind": "sparkle", "amount": 0.5},
            "button": {"kind": "embers", "amount": 0.35}},
    "lens": [],
    # the flash-forward: the raccoon's paw on the finger and the RIGHT finger up, in a window over the test
    "flash": [[cues["ff"], 0.6, _st["miss"] + 0.3, {"win": [300, 668, 180], "at": [640, 1140], "zoom": 1.35}]],
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
