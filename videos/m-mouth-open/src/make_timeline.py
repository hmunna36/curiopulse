"""Edit timeline for the Why Can't You Say "M" With Your Mouth OPEN? 👄 Short.

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
    ("hook", None),                      # THE TEST: the dentist's chair, his mouth WIDE open with the dentist's mirror in it; he
                                         # tries "Mmm" and only "AAAH" comes out (frame 1 is him mid-test, close)
    ("answer", "Can't M is"),            # the mirror comes out, his lips shut, the hum: M letters out of his NOSE (punch, hitstop)
    ("buzz", "Shut your lips"),          # macro: his finger on his nose, lips pressed, the nose buzzing; a window opens on his cheek
    ("spill", "Now open up"),            # the dive: his head as glass from the side; the hum goes up the nose, then the lips open
                                         # and it pours out of his mouth as AAAH (the mechanism as ONE picture)
    ("dentist", "That's why you"),       # the payoff: the dentist asks "FLOSSING?", he answers "AAH-AAH" with the mirror in
    ("vent", "Ventriloquists"),          # the weirdest fact: on a stage, his dummy says "HI MAMA!" and the M's flip to N's
    ("loop", "Now say mama"),            # the button: back in the chair, a stiff ventriloquist grin, "NANA?"; the dentist's
                                         # mirror comes back and he opens wide: the last frame is frame 1 (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Open your / mouth wide.",
    'Now say / "Mmm."',
    "Can't?",
    "M is / a hum...",
    "that comes out / your NOSE.",
    "Shut your lips / and hum.",
    "Feel your / nose buzz?",
    "Now open up...",
    "and the hum / spills out",
    "your MOUTH / instead.",
    "That's why / you can't",
    "answer your / dentist.",
    "Ventriloquists",
    "can't say / M either.",
    "They fake it / with an N.",
    'Now say / "mama"...',
    "without moving / your lips.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"mmm": Y, "m": Y, "nose": Y, "buzz": O, "mouth": R, "dentist": V, "ventriloquists": V, "n": O, "mama": P["P"]}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_i_shut = find("Shut your lips")
_i_btn = find("Now say mama")
cues = {
    # the hook (the test)
    "open_w": W("Open your"), "wide": W("wide"), "wide_end": E("wide"),
    "now1": W("Now say"), "mmm": W("Mmm"), "mmm_end": E("Mmm"),
    # the answer
    "cant": W("Can't M"), "cant_end": E("Can't M"), "m1": W("M is"), "hum1": W("hum that"), "hum1_end": E("hum that"),
    "comes": W("comes out your"), "nose": W("NOSE Shut"), "nose_end": E("NOSE Shut"),
    # the buzz (his finger on his nose)
    "shut": W("Shut your lips"), "lips1": W("lips and hum"), "hum2": W("hum Feel", 0, _i_shut), "hum2_end": E("hum Feel", 0, _i_shut),
    "feel": W("Feel your"), "nose2": W("nose buzz"), "buzz": W("buzz Now"), "buzz_end": E("buzz Now"),
    # the spill (the glass side view)
    "now2": W("Now open up"), "up": W("up and"), "up_end": E("up and"), "hum3": W("hum spills"), "spills": W("spills out"),
    "mouth2": W("MOUTH instead"), "instead": W("instead That's"), "instead_end": E("instead That's"),
    # the dentist
    "thats": W("That's why"), "answer_w": W("answer your"), "dentist_w": W("dentist Ventriloquists"), "dentist_end": E("dentist Ventriloquists"),
    # the ventriloquist
    "vent": W("Ventriloquists"), "say3": W("say M either"), "m3": W("M either"), "either": W("either They"),
    "they": W("They fake"), "fake": W("fake it"), "n_w": W("N Now"), "n_end": E("N Now"),
    # the button
    "now3": W("Now say mama"), "mama": W("mama without"), "mama_end": E("mama without"), "without": W("without moving"),
    "moving": W("moving your"), "lips3": W("lips", 0, _i_btn), "lips3_end": E("lips", 0, _i_btn),
}
_order = ["open_w", "wide", "now1", "mmm", "cant", "m1", "hum1", "comes", "nose", "shut", "lips1", "hum2", "feel", "nose2",
          "buzz", "now2", "up", "hum3", "spills", "mouth2", "instead", "thats", "answer_w", "dentist_w", "vent", "say3", "m3",
          "either", "they", "fake", "n_w", "now3", "mama", "without", "moving", "lips3"]
assert all(cues[a] < cues[b] for a, b in zip(_order, _order[1:])), "cues out of order"
# the M letters fly out of his nose on NOSE; the AAH-AAH reply lands on "dentist."
cues["m_pop"] = cues["nose"] + 0.12
cues["aah_pop"] = cues["dentist_end"] + 0.1        # the reply lands in the pause after "dentist." (its sound is speech-band)
# the window on his cheek opens near the end of the buzz shot and the camera dives through it into the side view
_st = {s_["id"]: s_["start"] for s_ in shots}
cues["win"] = _st["spill"] - 0.75
# the button: the dentist's mirror comes back and he opens wide in the last 0.6 s (the loop)
cues["reopen"] = T.duration - 0.62

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "answer": 0.3, "buzz": 0.2, "spill": 0.15, "dentist": 0.35, "vent": 0.3, "loop": 0.25},
    "whip": [[_st["answer"], -1], [_st["dentist"], 1], [_st["vent"], -1]],
    "punch": [[cues["nose"] - 0.03, 1.2], [cues["dentist_w"] - 0.03, 1.15]],
    "tilt": [[cues["mmm"] - 0.05, cues["mmm_end"] + 0.25, -3.0]],
    "hit": [[cues["m_pop"], 4], [cues["aah_pop"], 4]],
    "act": {"brow": [cues["cant"], cues["nose"], cues["nose2"], cues["mama"]]},
    "mood": [[0, "day"], [cues["nose"] - 0.1, "warm"], [_st["spill"], "cold"], [_st["dentist"], "day"], [_st["vent"], "spot"],
             [_st["loop"], "day"]],
    "fg": {"hook": "bokeh-l", "answer": "post-r", "dentist": "bokeh-r", "vent": "bokeh-t", "loop": "bokeh-l"},
    "air": {"hook": "dust", "answer": "dust", "buzz": {"kind": "sparkle", "amount": 0.35}, "dentist": "dust",
            "vent": {"kind": "haze", "amount": 0.8}, "loop": "dust"},
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
