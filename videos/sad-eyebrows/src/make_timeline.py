"""Edit timeline for the Can You Make SAD Eyebrows on Purpose? 🥺 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.

The story: at a campfire Gran hands the sausage to the saddest face. The dog wins with perfect puppy eyes; he tries the
sad brows and gets SURPRISED or ANGRY. Two ropes on each brow (UP, IN), a padlock on the pair that only a real tear
opens; the dog has an extra muscle for it, and puppy eyes get adopted faster. The button: picture a wet puppy, and
this time he wins the sausage (the dog frowns). The last 0.6 s is frame 1 again.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # the tight rules (5 Nov 2026): nothing after the last line, the loop within 1.0 s
DUR = T.duration

SHOTS = [
    ("hook", None),                     # CU: him and the dog side by side, Gran's sausage between them; he strains, the dog is perfect
    ("eyes", "Lift only"),              # ECU his eyes and brows: dashed arrows up from the inner ends... his WHOLE brows shoot up
    ("answer", "Look surprised"),       # whip to a medium: SURPRISED tag; Gran swings the sausage to the dog (chomp)
    ("locked", "Your sad eyebrows"),    # CU low: a padlock slams onto his forehead between the brows on LOCKED (hitstop)
    ("ropes", "Two ropes"),             # push in: his forehead turns to glass, two ropes on each brow (UP to the top, IN to the bridge)
    ("up", "One pulls UP"),             # ECU high: the UP ropes yank, his brows go up: SURPRISED
    ("in", "one pulls IN"),             # CU other side: the IN ropes yank, his brows knit down: ANGRY
    ("both", "Sad pulls BOTH"),         # medium CU: both yank at once... the padlock holds (clunk, sweat)
    ("key", "and only real"),           # a little rain cloud drips a tear into the teardrop keyhole: click, both pull, SAD
    ("dogs", "Dogs?"),                  # whip to the dog with the sausage, smug
    ("xray", "EXTRA muscle"),           # push in: the dog's head x-ray, a glowing EXTRA MUSCLE over each eye; "just for this": puppy eyes
    ("kennel", "And the best"),         # whip to a shelter: three kennels, the middle dog does puppy eyes
    ("adopted", "get adopted"),         # its door flies open: ADOPTED! stamp, it zooms off; the neighbours' jaws drop
    ("button", "Now try again"),        # whip back to the campfire, CU: he strains again
    ("wet", "picture a wet"),           # a thought bubble: a soaked puppy; his brows go SAD; the sausage swings to him, the dog frowns
    ("loop", None),                     # frame 1 again (the hook's state at negative time): the Short loops
]
special = {"loop": DUR - 0.5}

CHUNKS = [
    "Make your eyebrows / sad.",
    "Lift only / the inner ends.",
    "Look surprised?",
    "Your sad eyebrows / are LOCKED.",
    "Two ropes / on each brow.",
    "One pulls UP...",
    "one pulls IN.",
    "Sad pulls BOTH...",
    "and only / real sadness can.",
    "Dogs?",
    "They have an",
    "EXTRA muscle...",
    "just for this.",
    "And the best / puppy eyes",
    "get adopted / FASTER.",
    "Now try again...",
    "picture a wet / PUPPY!",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"sad": B, "inner": Y, "surprised": O, "locked": Y, "ropes": Y, "up": G, "in": R, "both": Y, "sadness": B,
         "dogs": Y, "extra": Y, "puppy": P["P"], "faster": G, "wet": C}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values())

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
st = {s_["id"]: s_["start"] for s_ in shots}
en = {s_["id"]: s_["end"] for s_ in shots}

W, E, find = T.W, T.E, T.find
cues = {
    "sad": W("sad."), "sad_end": E("sad."), "lift": W("Lift"), "inner": W("inner"), "ends": W("ends."), "ends_end": E("ends."),
    "look": W("Look"), "surprised": W("surprised?"), "surprised_end": E("surprised?"),
    "your": W("Your sad eyebrows"), "locked": W("LOCKED."), "locked_end": E("LOCKED."),
    "two": W("Two ropes"), "ropes_w": W("ropes on"), "each": W("each brow"), "brow_end": E("brow."),
    "one1": W("One pulls UP"), "up": W("UP..."), "up_end": E("UP..."),
    "one2": W("one pulls IN"), "in": W("IN.", 0, find("one pulls IN") + 2), "in_end": E("IN.", 0, find("one pulls IN") + 2),
    "sadp": W("Sad pulls"), "both": W("BOTH..."), "both_end": E("BOTH..."),
    "andonly": W("and only"), "real": W("real sadness"), "sadness": W("sadness"), "can": W("can."), "can_end": E("can."),
    "dogs": W("Dogs?"), "dogs_end": E("Dogs?"), "they": W("They have"), "extra": W("EXTRA"), "muscle": W("muscle..."),
    "just": W("just for"), "this": W("this."), "this_end": E("this."),
    "andthe": W("And the best"), "best": W("best"), "puppy1": W("puppy eyes"), "eyes": W("eyes", 0, find("puppy eyes") + 1),
    "get": W("get adopted"), "adopted": W("adopted"), "faster": W("FASTER."), "faster_end": E("FASTER."),
    "now": W("Now try"), "again": W("again..."), "again_end": E("again..."),
    "picture": W("picture"), "wet": W("wet PUPPY"), "puppy2": W("PUPPY!", 0, find("wet PUPPY") + 1), "puppy2_end": E("PUPPY!", 0, find("wet PUPPY") + 1),
}
c = cues
assert c["one2"] > c["up_end"] and c["in"] > c["one2"], "the IN cue found the wrong 'in'"
assert c["puppy2"] > c["wet"] > c["picture"] > c["again_end"], "the button's cues are out of order"
assert c["eyes"] > c["puppy1"], "the 'eyes' cue is wrong"

# ---- beats (every time the picture or the sound uses is here)
cues["strain"] = 0.0                                     # frame 0: he is already straining (the hook's state runs from negative time)
cues["arrows"] = c["inner"] - 0.12                       # dashed arrows up from the inner ends of his brows
cues["fail"] = c["ends"] + 0.10                          # his WHOLE brows shoot up (the fail), on "ends"
cues["tag_surp"] = c["surprised"] + 0.05                 # SURPRISED tag pops
cues["swing_dog"] = c["surprised"] + 0.25                # Gran swings the sausage to the dog
cues["chomp"] = c["surprised_end"] + 0.18                # the dog takes it (chomp), in the gap after "surprised?"
cues["lock"] = c["locked"] + 0.12                        # the padlock lands between his brows on "LOCKED"
cues["clunk"] = c["locked_end"] + 0.03                   # its clunk (the hit just after the word)
cues["glass"] = c["two"] - 0.05                          # his forehead turns to glass
cues["rope_on"] = c["ropes_w"] - 0.05                    # the ropes draw on
cues["yank_up"] = c["up"] - 0.03                         # the UP ropes yank
cues["yank_in"] = c["in"] - 0.03                         # the IN ropes yank
cues["yank_both"] = c["both"] - 0.04                     # both yank together...
cues["jam"] = c["both_end"] + 0.03                      # ...the padlock holds: clunk, rattle (the pause after BOTH)
cues["cloud"] = c["andonly"] - 0.05                      # a little rain cloud floats in
cues["tear"] = c["real"] + 0.05                          # one tear falls from it
cues["click"] = c["can"] - 0.02                          # into the keyhole: click, the lock springs open
cues["sadface"] = c["can"] + 0.10                        # both ropes pull: his brows go SAD
cues["chew"] = st["dogs"]                                # the dog chewing the sausage, smug
cues["xon"] = c["extra"] - 0.06                          # the dog's head turns to x-ray, the muscle glows
cues["pup"] = c["this"] + 0.02                           # "just for THIS": the muscle pulls, puppy eyes
cues["pup_hit"] = c["this_end"] + 0.05                   # the sparkle lands (hitstop)
cues["kpup"] = c["puppy1"] - 0.05                        # the middle kennel dog does puppy eyes
cues["door"] = c["adopted"] + 0.05                       # its door flies open
cues["stamp"] = c["faster"] - 0.04                       # ADOPTED! stamp lands on FASTER
cues["zoom"] = c["faster"] + 0.12                        # the dog zooms out of frame
cues["drop"] = c["faster_end"] + 0.05                    # the neighbours' jaws drop
cues["retry"] = c["now"] - 0.05                          # he strains again
cues["bubble"] = c["picture"] - 0.05                     # the thought bubble pops
cues["wetpup"] = c["wet"]                                # the soaked puppy shivers in it
cues["tear2"] = c["puppy2"] - 0.10                       # a tear wells in his eye
cues["sad2"] = c["puppy2"] + 0.08                        # his brows go SAD, on PUPPY
cues["swing_him"] = c["puppy2"] + 0.22               # the sausage swings to him
cues["frown"] = c["puppy2"] + 0.42                   # the dog's brows go ANGRY (the reverse)
cues["loop"] = st["loop"]                                # frame 1 again

# the flash-forward: the payoff's own moment (the dog's x-ray, the extra muscle lit) in a window over the test shot, in the
# pause after "surprised?" (not on the answer's punch word, LOCKED)
cues["ff"] = c["surprised_end"] - 0.06
FLASH_AT = c["pup"] - 0.35                               # the later moment: the muscle glowing, just before the puppy eyes

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "eyes": 0.22, "answer": 0.3, "locked": 0.3, "ropes": 0.25, "up": 0.3, "in": 0.35, "both": 0.45,
             "key": 0.3, "dogs": 0.3, "xray": 0.25, "kennel": 0.3, "adopted": 0.45, "button": 0.3, "wet": 0.3, "loop": 0.25},
    "whip": [[st["answer"], 1], [st["dogs"], 1], [st["kennel"], -1], [st["button"], 1]],
    "punch": [[c["locked"] - 0.02, 1.18, c["locked_end"] + 0.35], [c["this"] - 0.03, 1.15, en["xray"] - 0.05],
              [c["puppy2"] - 0.03, 1.12, en["wet"] - 0.05]],
    "tilt": [[c["yank_both"], c["jam"] + 0.45, -3.5]],
    "hit": [[c["clunk"], 4], [c["pup_hit"], 4]],
    "act": {"brow": [c["look"], c["dogs"], c["now"]]},
    "mood": [[0, "dusk"], [c["lock"] - 0.05, "warm"], [st["ropes"], "dusk"], [c["yank_both"], "storm"], [c["click"], "warm"],
             [st["dogs"], "dusk"], [st["kennel"], "day"], [st["button"], "dusk"]],
    "fg": {"hook": "bokeh-r", "answer": "grass-b", "locked": "bokeh-r", "dogs": "grass-bl", "kennel": "grass-b",
           "adopted": "grass-bl", "button": "bokeh-r", "wet": "grass-b", "loop": "bokeh-r"},
    "air": {"hook": {"kind": "embers", "amount": 0.5}, "answer": "embers", "locked": "embers", "both": "embers", "key": "rain",
            "dogs": "embers", "kennel": "dust", "adopted": "sparkle", "button": "embers", "wet": "embers",
            "loop": {"kind": "embers", "amount": 0.5}},
    "flash": [[cues["ff"], 0.6, FLASH_AT, {"win": [790, 680, 170], "zoom": 1.5}]],
}
T.write(shots, caps, cues, camera=CAMERA)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s_ in shots:
    print(f'  {s_["id"]:8s} {s_["start"]:6.2f} -> {s_["end"]:6.2f}  ({s_["end"] - s_["start"]:.2f} s)')
