"""Edit timeline for the Can You Do Fist, EDGE, Palm? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # the tight rules (5 Nov 2026): nothing after the last word but the cut back to frame 1

# The direction sheet (reference/direction.md): an average shot of 2.2 s or less, none over 3.2 s; up to 13 s (here to
# 18.3 s, through the second FIST) every cut is another framing of the same test: his right hand tapping the picnic table.
# Sizes: X extreme close-up, C close, M medium, W wide. The longest shot is the goat doctor's, just before the sting.
SHOTS = [
    ("hook", None),                 # X  frame 0: POV, his right fist BONKS the planks; the goat across the table, chewing
    ("side", "edge palm"),          # C  table level from his right: CHOP on "edge", SLAP on "palm"
    ("fast", "now FAST"),           # M  from the goat's seat: him and his hand going FAST... fist, edge, palm, fist, FIST
    ("jam", "Mixed them up"),       # C  whip: POV, the fist jammed on the table, the goat stops chewing (flash-forward)
    ("brakes", "Your BRAKES"),      # X  high over the hand: the STOP sign slams up at his wrist, skid marks, smoke
    ("again", "Go again"),          # M  POV: slow now, fist... edge...; the forearm turns to glass on "Each shape"
    ("stop", "STOP before"),        # X  from above: PALM, the STOP sign flashes, the edge's ghost fades; cut_next: the side
    ("sneak", "Miss one stop"),     # C  table level: the STOP sign sputters out; a ghost fist in a ninja mask creeps up
                                    #    the forearm (cut_sneaks: closer, as it slips in at the wrist)
    ("fistfist", None),             # M  from the goat's seat: BONK... BONK! (hitstop), his face
    ("doctor", "Doctors use"),      # W  POV up at the goat: head mirror, clipboard BRAIN TEST; its hoof does it perfectly
    ("relax", None),                # C  his face: "Relax." (the breath goes out)
    ("smart", "In one study"),      # M  POV: the goat puts on big glasses (the smart one)
    ("smartb", "being smart"),      # C  the goat tries it fast: clonk, CLONK, its eyes cross
    ("button", "Now do it"),        # X  POV: palm, edge... and the FIST lands on the loop: frame 0's picture
]
_iF = T.find("in Fist")             # "...back in. Fist... FIST!"
special = {"fistfist": T.ws[_iF + 1] - 0.12,   # the cut lands just before the first "Fist...", on its bonk's wind-up
           "relax": T.E("brain") + 0.06}

# caption chunks: EXACT consecutive word runs, 1-5 words, "/" splits two lines
CHUNKS = [
    "Tap your / table:",
    "fist,",
    "edge,",
    "palm...",
    "now FAST!",
    "Mixed / them up?",
    "Your hand's / fine.",
    "Your / BRAKES aren't.",
    "Go again.",
    "Each shape / has to",
    "STOP",
    "before the / next one starts.",
    "Miss one / stop,",
    "and the / old one",
    "sneaks / back in.",
    "Fist...",
    "FIST!",
    "Doctors use / this exact test",
    "to check / your brain.",
    "Relax.",
    "In one / study,",
    "being smart / didn't help.",
    "Now do it...",
    "BACKWARDS.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# the three shapes keep their colours all the way through (fist orange, edge yellow, palm cyan); the brakes are red
COLOR = {"fist": O, "edge": Y, "palm": C, "fast": Y, "brakes": R, "stop": R, "old": O, "sneaks": V, "brain": G,
         "smart": V, "backwards": Y}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_iM = find("Miss one stop")
_iB = find("Now do it")
cues = {
    # the hook: a bonk on frame 0 (the loop's last tap lands there too), then one tap per word
    "tap": W("Tap"), "table": W("table"), "table_end": E("table"),
    "fist1": W("fist"), "edge1": W("edge"), "palm1": W("palm"), "palm1_end": E("palm"),
    "now1": W("now FAST"), "fast1": W("FAST"), "fast1_end": E("FAST"),
    # the answer
    "mixed": W("Mixed"), "up_end": E("them up", 1), "hands": W("hand's"), "fine": W("fine"), "fine_end": E("fine"),
    "your2": W("Your BRAKES"), "brakes": W("BRAKES"), "brakes_end": E("BRAKES"), "arent": W("aren't"),
    "arent_end": E("aren't"),
    # again, slow: fist on "Go", edge on "again", palm on "STOP", fist on "starts"
    "go": W("Go"), "again": W("again"), "again_end": E("again"), "each": W("Each"), "shape": W("shape"),
    "stop1": W("STOP"), "stop1_end": E("STOP"), "before": W("before"), "next": W("next"), "starts": W("starts"),
    "starts_end": E("starts"),
    # the sneak
    "miss": T.ws[_iM], "stop2": T.ws[_iM + 2], "stop2_end": T.we[_iM + 2], "old": W("old"), "sneaks": W("sneaks"),
    "back": W("back in"), "in_end": T.we[_iF], "fist2": T.ws[_iF + 1], "fist2_end": T.we[_iF + 1],
    "fist3": T.ws[_iF + 2], "fist3_end": T.we[_iF + 2],
    # the payoff: the goat doctor
    "doctors": W("Doctors"), "use": W("use"), "exact": W("exact"), "test": W("test"), "check": W("check"),
    "brain": W("brain"), "brain_end": E("brain"),
    # the sting: relax, the goat in glasses fails too
    "relax": W("Relax"), "relax_end": E("Relax"), "in2": W("In one"), "study": W("study"), "study_end": E("study"),
    "being": W("being"), "smart": W("smart"), "didnt": W("didn't"), "help": W("help"), "help_end": E("help"),
    # the button: palm on "Now", edge on "it", the fist lands on the loop
    "now2": T.ws[_iB], "do": T.ws[_iB + 1], "it": T.ws[_iB + 2], "it_end": T.we[_iB + 2],
    "backwards": W("BACKWARDS"), "backwards_end": E("BACKWARDS"),
    "end": T.duration,
}
_sh = {s["id"]: s for s in shots}
cues["cut_next"] = cues["next"] - 0.04           # the stop shot jumps from above to table level
cues["cut_sneaks"] = cues["sneaks"] - 0.05       # the sneak shot jumps closer as the ghost slips in at the wrist
cues["jam"] = cues["fast1_end"] + 0.12           # the fast run's last tap: a FIST where the edge should be (the mix-up)
cues["slam"] = cues["brakes"] + 0.06             # the STOP sign slams up at his wrist
cues["bonk3"] = cues["fist3"] + 0.05             # the second FIST lands (hitstop)
cues["clop"] = cues["exact"] + 0.02              # the goat's perfect fist-edge-palm (three clops)
cues["clonk"] = cues["didnt"] - 0.02             # the goat's own mix-up
# the flash-forward: the goat doctor, half a second, in a window over the test (top right, clear of the hand)
cues["ff"] = cues["up_end"] + 0.03

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.2, "side": 0.28, "fast": 0.45, "jam": 0.35, "brakes": 0.4, "again": 0.25, "stop": 0.3,
             "sneak": 0.3, "fistfist": 0.45, "doctor": 0.25, "relax": 0.3, "smart": 0.3, "smartb": 0.5, "button": 0.25},
    "whip": [[_sh["jam"]["start"], 1], [_sh["doctor"]["start"], -1], [_sh["button"]["start"], 1]],
    "punch": [[cues["brakes"] - 0.02, 1.18, _sh["again"]["start"] - 0.05],
              [cues["didnt"] - 0.03, 1.15, _sh["button"]["start"] - 0.05]],
    "tilt": [[cues["stop2"] - 0.05, cues["in_end"] + 0.1, -3]],
    "hit": [[cues["slam"], 4], [cues["bonk3"], 4]],
    "act": {"brow": [cues["mixed"] + 0.05, cues["fist3"] + 0.1, cues["relax"] + 0.1, cues["backwards"]]},
    "mood": [[0, "day"], [cues["mixed"] - 0.05, "shade"], [cues["go"] - 0.1, "day"], [cues["miss"] - 0.05, "spot"],
             [_sh["fistfist"]["start"], "day"], [cues["doctors"] - 0.05, "warm"], [_sh["button"]["start"], "day"]],
    # depth in front of the lens and particles in the air: never on the hook or the button (frame 0 and the loop's
    # last frame must match), alternating corners
    "fg": {"side": "grass-b", "fast": "bokeh-l", "jam": "bokeh-r", "brakes": "bokeh-l", "again": "grass-b",
           "sneak": "bokeh-r", "fistfist": "bokeh-l", "doctor": "bokeh-r", "relax": "bokeh-r", "smart": "bokeh-l",
           "smartb": "grass-b"},
    "air": {"side": "pollen", "fast": "pollen", "jam": "pollen", "brakes": "dust", "again": "pollen", "stop": "pollen",
            "sneak": "dust", "fistfist": "pollen", "doctor": "pollen", "relax": "pollen", "smart": "pollen",
            "smartb": "sparkle"},
    "lens": [],
    "flash": [[cues["ff"], 0.55, cues["clop"] + 0.25, {"win": [800, 640, 165], "zoom": 1.45}]],
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
for _s in shots:
    print(f'  {_s["id"]:9s} {_s["start"]:6.2f} - {_s["end"]:6.2f}  ({_s["end"] - _s["start"]:.2f} s)')
