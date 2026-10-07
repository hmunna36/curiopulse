"""Edit timeline for the Why Do You Get a STITCH When You Run? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.35)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Use 1.0 in the 30-35 s arm of the length test.

def move_onset(phrase, block_id):
    """v3 drew these words out ("Reee-lax", "Subscriiibe") and its alignment only knew their last syllable: the word
    starts where its take first gets loud (whisper hears the whole word in that stretch)."""
    i = T.find(phrase)
    t0 = T.first_loud(T.block(block_id)["start"])
    assert t0 < T.ws[i], (phrase, t0, T.ws[i])
    T.ws[i] = T.words[i]["start"] = t0


move_onset("Relax", "answer")
move_onset("Subscribe", "sub")

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),                        # he runs at the camera; a giant needle stitches his side
    ("answer", "Relax It's not"),          # doubled over; CRAMP is crossed out
    ("chafe", "Your insides are"),         # the dive into his belly: two layers, sparks
    ("lining", "Your belly has"),          # the x-ray belly: the layer on the wall, the layer round the organs
    ("bounce", "Run and your"),            # the organs bounce with every step
    ("full", "Add a full"),                # a burger lands, the stomach swells, the layers rub
    ("nerve", "The outer layer"),          # the outer layer's nerves fire
    ("spot", "That's why it"),             # back outside: one spot; he stops and it stops (the pill follows)
    ("subcam", None),                      # the camel leans in
    ("weird", "It's not from"),            # the breathing muscle is let off
    ("ride", "People get stitches"),       # on a horse, on a camel: sitting down
    ("bard", "Shakespeare wrote"),         # the quill, the parchment; STILL NOT SURE
    ("button", "So slow down"),            # he slows and leans; the camel takes the race; the loop
]
special = {"subcam": T.block("sub")["start"] - 0.10}

CHUNKS = [
    "You're running / a race", "and something / stabs you", "under / the RIBS!",
    "Relax.", "It's not / a cramp.", "Best guess?", "Your insides / are chafing.",
    "Your belly has", "a slippery / lining:", "one layer / on the wall,", "one around / your organs.",
    "Run, and / your organs", "bounce.", "Add a / full stomach...", "and the layers", "rub.",
    "The outer layer", "feels / sharp pain.", "That's why / it jabs", "ONE spot...", "and stops", "when you stop.",
    "Subscribe...", "a camel / is involved.",
    "It's not from / breathing hard,", "either.", "People get / stitches", "riding horses...", "and camels.", "Sitting down.",
    "Shakespeare", "wrote about / this pain...", "and science", "STILL / isn't sure.",
    "So slow down,", "lean forward...", "and never trust", "a camel.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"stabs": R, "ribs": Y, "relax": G, "cramp": R, "guess": C, "chafing": O, "slippery": C, "lining": C,
         "wall": O, "organs": P["P"], "bounce": Y, "full": Y, "stomach": Y, "rub": R, "outer": O, "sharp": R, "pain": R,
         "one": Y, "spot": Y, "stops": G, "stop": G, "subscribe": R, "camel": Y, "breathing": C, "stitches": R,
         "horses": Y, "camels": Y, "sitting": C, "down": C, "shakespeare": V, "still": R, "sure": R, "slow": G,
         "lean": G, "forward": G, "never": R}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    "stab": W("stabs"), "ribs": W("RIBS"), "ribs_end": E("RIBS"),
    "relax": W("Relax"), "not": W("not a cramp"), "cramp": E("a cramp", 1), "guess": W("Best guess"),
    "chafing": W("chafing"), "chafing_end": E("chafing"),
    "slippery": W("slippery"), "wall": W("on the wall", 2), "around": W("one around", 1), "organs": W("your organs", 1),
    "run": W("Run and"), "bounce": W("bounce"), "full": W("full stomach"), "stomach_end": E("full stomach", 1),
    "layers": W("the layers", 1), "rub": W("rub"), "rub_end": E("rub"),
    "outer": W("The outer", 1), "sharp": W("sharp pain"), "pain_end": E("sharp pain", 1),
    "jabs": W("jabs"), "one": W("ONE spot"), "spot_end": E("ONE spot", 1), "stops": W("and stops", 1),
    "stop_end": E("you stop", 1),
    "camel1": W("a camel is", 1), "involved_end": E("involved"),
    "breathing": W("breathing"), "either": W("either"), "either_end": E("either"),
    "people": W("People get"), "horses": W("horses"), "horses_end": E("horses"), "camels": W("and camels", 1),
    "camels_end": E("and camels", 1), "sitting": W("Sitting down"), "sitting_end": E("Sitting down", 1),
    "shakes": W("Shakespeare"), "wrote": W("wrote"), "pain2_end": E("this pain", 1), "science": W("science"),
    "still": W("STILL"), "sure_end": E("sure"),
    "slow": W("slow down"), "lean": W("lean forward"), "forward_end": E("lean forward", 1), "never": W("never trust"),
    "camel3": W("trust a camel", 2), "end_word": E("trust a camel", 2),
    "bounce_end": E("bounce"), "guess_end": E("Best guess", 1), "pokes": [0.12, 0.62, 1.12],
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff
# (reference/narration.md). The word "subscribe" must land at 50-70 % of the runtime; qa.py checks it. The pill pops
# ~0.3 s before the word, the cursor clicks in the pause just after it, and the pill pops out 1.3 s after the click:
# about 2.6 s on screen. Captions that share the screen with it sit at y 1150 (main.js); the narration carries on.
_sub_i = T.find("subscribe")                  # if the line says "subscribes"/"subscribing", use that word
cues["sub_in"] = max(0.0, T.ws[_sub_i] - 0.30)
cues["sub_tap"] = T.we[_sub_i] + 0.10         # in the "..." after the word, so the click never sits on a word
cues["sub_out"] = cues["sub_tap"] + 1.30
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[_sub_i]:.2f} s = {100 * T.ws[_sub_i] / T.duration:.0f} % of the runtime (must be 50-70 %)')
