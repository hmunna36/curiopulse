"""Edit timeline for the Why Can't You HUM With Your Nose Pinched? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the encore (he hums, the dust bunny flies out) and the
#                                      cut back to frame 1 for the loop.

# the aligner hands the quiet after "Gone?" to "You": move it to where her voice really starts (traced 19 Oct 2026:
# 5.36 s in the first layout, a 0.15 s late start)
_i = T.find("You just locked")
_on = T.first_loud(T.words[_i]["start"])
if _on > T.words[_i]["start"] + 0.06:
    T.ws[_i] = T.words[_i]["start"] = _on
    assert T.words[_i]["start"] < T.words[_i + 1]["start"], "You / just out of order"

# (shot id, phrase whose first word opens the shot). Every id needs an SC.<id> in web/. One world all the way through: the
# bathroom mirror, his head turning to glass where he stands, and back.
SHOTS = [
    ("hook", None),            # THE TEST: frame 0 is him humming, close, notes out of his nose, his hand coming up to pinch it.
                               # The pinch on "pinch", the hum chokes in the gap, cheeks puff. "Gone?" runs on in the same
                               # shot: a padlock on his nose, his head turns to glass, the notes trapped inside it.
    ("inside", "A hum is"),    # he lets go: air from the voice box up the throat and out of the nose; lips zipped. Then he
                               # pinches again: the air piles up, cheeks balloon, the push back equals the lungs, no buzz.
    ("caves", "Weirder"),      # the hidden caves behind his face: a hum flushes them; a plain breath barely stirs the dust bunny
    ("button", "Your face wants"),  # the encore: he hums, the bunny flies out of his nose, the glass goes, back to frame 0
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Hum along / with me...",
    "mmmmmmm...",
    "and pinch / your nose.",
    "Gone?",
    "You just locked / your voice",
    "in a room / with no door.",
    "A hum is air",
    "buzzing out / your nose...",
    "lips shut.",
    "Pinch it,",
    "and that air / piles up...",
    "cheeks puff...",
    "till it pushes back",
    "as hard as / your lungs.",
    "No flow...",
    "no buzz.",
    "Weirder?",
    "A hum airs out",
    "the hidden caves / behind your face.",
    "Breathing?",
    "Barely touches them.",
    "Your face wants / an encore.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"hum": Y, "mmmmmmm": Y, "pinch": O, "nose": O, "gone": R, "locked": R, "door": R, "air": C, "buzzing": Y,
         "lips": PK, "shut": PK, "piles": C, "cheeks": PK, "puff": PK, "pushes": O, "lungs": C, "flow": R, "buzz": R,
         "weirder": V, "caves": G, "breathing": C, "barely": R, "encore": Y}
DISPLAY = {"mmmmmmm": ["MMMMMM"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_nose1 = find("pinch your nose")
i_nose2 = find("out your nose")
i_face1 = find("behind your face")
i_face2 = find("Your face wants")
i_buzz = find("no buzz")
assert i_nose1 < i_nose2 < i_buzz < i_face1 < i_face2
cues = {
    # the hook: he hums with her from frame 0, the hand comes up, the pinch, the choke
    "mmm": W("mmmmmmm"), "mmm_end": E("mmmmmmm"),
    "pinch1": W("pinch", s=i_nose1), "nose1": W("nose", s=i_nose1), "nose1_end": E("nose", s=i_nose1),
    "gone": W("Gone"), "gone_end": E("Gone"),
    "locked": W("locked"), "locked_end": E("locked"), "voice": W("voice"), "room": W("room"), "door": W("door"),
    "door_end": E("door"),
    # inside: the route of a hum, then the pinch again
    "hum2": W("A hum is"), "buzzing": W("buzzing"), "outnose": W("nose", s=i_nose2), "lips": W("lips"),
    "shut_end": E("shut"),
    "pinch2": W("Pinch it"), "it_end": E("it", s=find("Pinch it")), "piles": W("piles"), "up_end": E("up", s=find("piles up")),
    "cheeks": W("cheeks"), "puff": W("puff"), "puff_end": E("puff"),
    "till": W("till"), "pushes": W("pushes"), "lungs": W("lungs"), "lungs_end": E("lungs"),
    "noflow": W("No flow"), "flow_end": E("flow"), "nobuzz": W("no", s=i_buzz), "buzz_end": E("buzz", s=i_buzz),
    # the caves
    "weirder": W("Weirder"), "airs": W("airs"), "hidden": W("hidden"), "caves": W("caves"), "face1_end": E("face", s=i_face1),
    "breathing": W("Breathing"), "breathing_end": E("Breathing"), "barely": W("Barely"), "them_end": E("them"),
    # the encore
    "encore_in": W("Your face wants"), "encore": W("encore"), "encore_end": E("encore"),
}
# the gags, in the gaps after their words (sound.md: the sound just after the word, never on it)
cues["choke"] = round(cues["nose1_end"] + 0.10, 3)       # the hum chokes: mmMP
cues["puff1"] = round(cues["nose1_end"] + 0.24, 3)       # cheeks balloon, eyes pop
cues["lock_click"] = round(cues["locked_end"] - 0.04, 3)  # the padlock snaps shut on his nose
cues["letgo"] = round(cues["door_end"] + 0.10, 3)        # he lets go: the padlock springs off, the cheeks go pfff
cues["zip"] = round(cues["shut_end"] + 0.02, 3)          # the zipper runs across his lips
cues["squeak"] = round(cues["it_end"] + 0.02, 3)         # the pinch squeaks the rubber nose
cues["balloon"] = round(cues["puff_end"] + 0.02, 3)      # the cheeks balloon out
cues["freeze"] = round(cues["flow_end"] + 0.02, 3)       # the air stops dead
cues["stop"] = round(cues["buzz_end"] + 0.03, 3)         # the buzz dies: silence
cues["rewind"] = round(cues["breathing_end"] + 0.02, 3)  # the tape runs back: the fog and the bunny again
cues["snore"] = round(cues["them_end"] + 0.06, 3)        # the bunny snores on
cues["blast"] = round(cues["encore_end"] + 0.12, 3)      # the encore hum blows the bunny out of his nose
assert cues["choke"] < cues["gone"] and cues["letgo"] < cues["hum2"] and cues["zip"] < cues["pinch2"]
assert cues["balloon"] < cues["till"] and cues["stop"] < cues["weirder"] and cues["snore"] < cues["encore_in"]
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: no pill, nothing said (the Short loops)'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print("shots: " + ", ".join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
print("cues: " + ", ".join(f"{k}={v:.2f}" for k, v in cues.items()))
