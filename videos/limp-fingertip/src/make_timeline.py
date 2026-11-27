"""Edit timeline for the Hook Your Finger. Can You Straighten the TIP? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py (and thumb-pinky-swap's, the last hand test).
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # the tight rules (5 Nov 2026): nothing after the last word but the cut back to frame 1

W, E, ev, find = T.W, T.E, T.ev, T.find
# repeated words: their own line index
_iTip2 = find("Your tip just")            # the answer's "tip"
_iBend2 = find("Bend the middle")         # the strings' "Bend"
_iTheTips = find("the tip's two")
_iIf = find("If that tip")
_iMid2 = find("the middle string might")
_iStill = find("Still floppy")

# The direction sheet (reference/direction.md): an average shot of 2.2 s or less, none over 3.2 s; up to 13 s every cut
# is another framing of the same test (his hooked finger on the lakeside porch). Sizes: X extreme close-up, C close,
# M medium, W wide.
SHOTS = [
    ("hook", None),                   # X  frame 0: his left hand from the side, the index hooked, the ladybug on the tip;
                                      #    "now straighten just the TIP": the tip strains and stays curled (cut_now: C, lower)
    ("answer", "Can't"),              # X  his eyes, sideways at the tip: "Can't?" (cut_went: M, him and the hand)
    ("offline", "OFFLINE"),           # X  the tip with a Wi-Fi sign crossed out over it: OFFLINE (punch, hitstop)
    ("poke", "Poke it"),              # C  his other hand pokes the tip: it wobbles like jelly, the ladybug bounces
                                      #    (cut_floppy: X on the wobbling tip)
    ("strings", "Bend the middle"),   # M  whip into the glass hand: three strings on its back, the middle one goes tight
    ("slack", "the tip's two"),       # X  the tip's two strings sag: the ladybug climbs into one like a hammock
                                      #    (cut_slack: C, from below, the hammock swinging)
    ("doctors", "Doctors"),           # M  whip: the ladybug pulls on a doctor's head mirror; DOCTOR'S TEST
    ("jammed", "test"),               # C  held (the longest): a slow push as the ladybug taps the floppy tip; JAMMED FINGER?
    ("stiff", "If that tip"),         # C  full silence, the glass finger: SNAP, the middle string breaks, the tip goes STIFF
                                      #    and flings the ladybug (hitstop, the biggest hit)
    ("torn", "the middle string might"),  # M  the frayed ends, TORN; the ladybug sails off over the lake
    ("button", "Still floppy"),       # M  whip back to the real hand, limp again: he pokes it; the ladybug parachutes down
    ("fine", "you're FINE"),          # X  frame 0's framing: she lands on the tip; the loop
]
special = {
    "answer": T.ws[find("Can't")] - 0.12,
    "jammed": T.ws[find("test")] - 0.08,
    "stiff": T.ws[_iIf] - 0.55,                 # the silence before the payoff opens the shot
    "torn": T.ws[_iMid2] - 0.08,
    "button": T.ws[_iStill] - 0.1,
}

# caption chunks: EXACT consecutive word runs, 1-5 words, "/" splits two lines
CHUNKS = [
    "Bend your finger / like a hook...",
    "now straighten / just the TIP.",
    "Can't?",
    "Your tip / just went...",
    "OFFLINE.",
    "Poke it.",
    "Floppy, right?",
    "Bend the middle,",
    "and its string / goes tight...",
    "the tip's two / go SLACK.",
    "Doctors use / this exact test...",
    "on jammed / fingers.",
    "If that tip / goes STIFF...",
    "the middle string / might be torn.",
    "Still floppy?",
    "Congrats...",
    "you're FINE.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PINK = P["P"]
# the tip and its two strings are yellow all the way through (the scenes use the same), the middle and its string cyan
COLOR = {"hook": O, "tip": Y, "offline": R, "floppy": G, "middle": C, "tight": C, "slack": Y, "doctors": G,
         "jammed": O, "stiff": R, "torn": R, "fine": G}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

cues = {
    # the hook
    "bend1": W("Bend your"), "finger1": W("finger like"), "hook_w": W("hook"), "hook_end": E("hook"),
    "now": W("now straighten"), "straighten": W("straighten"), "just1": W("just the"), "tip1": W("TIP"),
    "tip1_end": E("TIP"),
    # the answer
    "cant": W("Can't"), "cant_end": E("Can't"), "your2": T.ws[_iTip2], "tip2": T.ws[_iTip2 + 1], "just2": T.ws[_iTip2 + 2],
    "went": W("went"), "went_end": E("went"), "offline": W("OFFLINE"), "offline_end": E("OFFLINE"),
    # the poke
    "poke": W("Poke"), "it_end": E("Poke it", 1), "floppy1": W("Floppy"), "right": W("right"), "right_end": E("right"),
    # the strings
    "bend2": T.ws[_iBend2], "middle1": T.ws[_iBend2 + 2], "middle1_end": T.we[_iBend2 + 2], "and1": W("and its"),
    "string1": W("string goes"), "tight": W("tight"), "tight_end": E("tight"), "tips": T.ws[_iTheTips + 1],
    "two": T.ws[_iTheTips + 2], "go": T.ws[_iTheTips + 3], "slack": W("SLACK"), "slack_end": E("SLACK"),
    # the doctors
    "doctors": W("Doctors"), "exact": W("exact"), "test": W("test"), "test_end": E("test"), "on": W("on jammed"),
    "jammed": W("jammed"), "fingers": W("fingers"), "fingers_end": E("fingers"),
    # the stiff tip
    "if": T.ws[_iIf], "tip3": T.ws[_iIf + 2], "goes2": T.ws[_iIf + 3], "stiff": W("STIFF"), "stiff_end": E("STIFF"),
    "middle2": T.ws[_iMid2 + 1], "string2": T.ws[_iMid2 + 2], "might": W("might"), "torn": W("torn"),
    "torn_end": E("torn"),
    # the button
    "still": T.ws[_iStill], "floppy2": T.ws[_iStill + 1], "floppy2_end": T.we[_iStill + 1], "congrats": W("Congrats"),
    "congrats_end": E("Congrats"), "youre": W("you're"), "fine": W("FINE"), "fine_end": E("FINE"),
    "end": T.duration,
}
_sh = {s["id"]: s for s in shots}
# ---- the beats (every time the picture and the sound share)
cues["strain1"] = cues["straighten"] + 0.05      # the first try: the tip strains, trembles, stays curled
cues["cut_now"] = cues["now"] - 0.06              # the hook jumps lower and closer on "now"
cues["cut_went"] = cues["just2"] - 0.06          # the answer jumps from his eyes to him and his hand
cues["icon"] = cues["offline"] - 0.02             # the crossed-out Wi-Fi sign pops over the tip (hitstop after it)
cues["poke1"] = cues["it_end"] - 0.05             # the first poke: the tip wobbles, the ladybug bounces
cues["cut_floppy"] = cues["floppy1"] - 0.06       # the poke jumps to the tip, close
cues["poke2"] = cues["floppy1"] + 0.12            # the second poke
cues["glass"] = _sh["strings"]["start"]           # the hand turns to glass after the whip
cues["tighten"] = cues["string1"] - 0.05          # the middle string pulls tight (TWANG)
cues["cut_tight"] = cues["string1"] - 0.06        # the strings shot jumps close onto the middle knuckle
cues["sag"] = cues["tips"] - 0.05                 # the tip's two strings sag
cues["cut_slack"] = cues["slack"] - 0.06          # the slack shot jumps under the hammock
cues["climb"] = cues["slack"] + 0.15              # the ladybug climbs into the sagging string
cues["nap"] = cues["slack_end"] + 0.25            # ...and lies back in it like a hammock
cues["mirror"] = cues["doctors"] + 0.05           # she pulls on a doctor's head mirror
cues["stamp"] = cues["exact"] - 0.02              # DOCTOR'S TEST
cues["tap1"] = cues["on"] - 0.04                  # she taps the floppy tip with her leg (twice)
cues["tap2"] = cues["fingers"] - 0.02
cues["hush"] = cues["fingers_end"] + 0.12         # full silence before the payoff
cues["snap"] = cues["stiff"] + 0.04               # the middle string breaks, the tip snaps STIFF, she is flung
cues["fling_end"] = cues["snap"] + 1.6            # she has sailed out of the frame
cues["torn_tag"] = cues["torn"] - 0.02            # TORN on the frayed ends
cues["back"] = _sh["button"]["start"]             # the real hand again: whole, limp
cues["poke3"] = cues["floppy2"] + 0.05            # he pokes it once more: still floppy
cues["chute"] = cues["congrats"] - 0.25           # she floats back down, wings out
cues["land"] = cues["fine"] + 0.05                # she lands on the tip
# the flash-forward: the snap (the tip goes stiff and flings her), half a second, in a window beside his face
cues["ff"] = cues["cant_end"] + 0.03

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.2, "answer": 0.3, "offline": 0.3, "poke": 0.35, "strings": 0.3, "slack": 0.3, "doctors": 0.3,
             "jammed": 0.25, "stiff": 0.35, "torn": 0.35, "button": 0.3, "fine": 0.2},
    "whip": [[_sh["strings"]["start"], 1], [_sh["doctors"]["start"], -1], [_sh["button"]["start"], 1]],
    "punch": [[cues["offline"] - 0.02, 1.2, _sh["poke"]["start"] - 0.05],
              [cues["snap"] - 0.03, 1.16, _sh["torn"]["start"] - 0.05]],
    "tilt": [[cues["strain1"] - 0.05, cues["tip1_end"] + 0.2, -3], [cues["snap"], cues["snap"] + 0.8, 4]],
    "hit": [[cues["icon"] + 0.16, 4], [cues["snap"] + 0.13, 4]],
    "act": {"brow": [cues["cant"] + 0.05, cues["sag"] + 0.05, cues["if"], cues["still"]]},
    "mood": [[0, "dusk"], [cues["strain1"] - 0.05, "shade"], [cues["poke"] - 0.1, "dusk"], [cues["doctors"] - 0.1, "warm"],
             [cues["hush"], "cold"], [_sh["button"]["start"], "dusk"]],
    # depth in front of the lens and particles in the air: never on the hook or the last shot (frame 0 and the loop's
    # last frame must match), alternating corners
    "fg": {"answer": "bokeh-l", "offline": "bokeh-r", "poke": "bokeh-t", "strings": "bokeh-l", "slack": "bokeh-r",
           "doctors": "bokeh-l", "jammed": "bokeh-r", "stiff": "bokeh-t", "torn": "bokeh-l", "button": "bokeh-r"},
    "air": {"answer": "dust", "offline": "sparkle", "poke": "dust", "strings": "sparkle", "slack": "dust",
            "doctors": "dust", "jammed": "dust", "stiff": "sparkle", "torn": "dust", "button": "dust"},
    "lens": [],
    "flash": [[cues["ff"], 0.6, cues["snap"] + 0.08, {"win": [790, 640, 165], "zoom": 1.25, "at": [660, 860]}]],
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
for _k in sorted([k for k in cues if k.startswith("cut_")], key=lambda k: cues[k]):
    print(f'  {_k:12s} {cues[_k]:6.2f}')
