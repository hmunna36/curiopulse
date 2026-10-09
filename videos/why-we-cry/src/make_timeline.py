"""Edit timeline for the Why Do We CRY? Short (the 45-50 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.7)  # after "Some backup.": he digs out a new spoonful and lifts it (the picture of frame 1)

W, E, ev, find = T.W, T.E, T.ev, T.find
DUR = T.duration
LOOP = DUR - 0.50                      # the camera comes back in on him: the last half second runs into frame 1

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                    # ONE shot through the answer: close on him eating ice cream in tears, his eyes burst,
                                       # the camera lets go to the couch and his dog, an SOS lamp pops out of his head
    ("alarm", None),                   # into his head: the feeling, the alarm, the signal down to two taps above his eyes
    ("drain", "The tiny drain"),       # the plughole in the corner of each eye, the pipe down to his nose, the drips
    ("honk", None),                    # the couch: he blows his nose
    ("spill", "The rest pours"),       # tears pour down his face in the lamp light; eyes open in the dark all round him
    ("photo", "It works"),             # a photo of his crying face; an eraser takes the tears off; two dials fall
    ("only", None),                    # the couch, wide: the dog, and an elephant; a tear check on all three
    ("help", "And a good"),            # the dog comes over (the lamp goes out), licks his spoon clean; he digs in again (the loop)
]
special = {
    "alarm": W("Big feelings") - 0.30,
    "honk": E("cries too", 1) + 0.12,
    "only": W("As far as") - 0.30,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You're eating / ice cream", "at a / sad movie", "and your eyes", "spring / a leak",
    "Relax", "scientists / think", "your face", "just called / for backup",
    "Big / feelings", "trip an / alarm", "in your / brain", "and it opens", "a tap", "above / each eye",
    "The tiny / drain", "in each eye", "leads to / your nose", "so your nose", "cries too",
    "The rest", "pours down / your face", "where / everyone", "can see it",
    "It works", "Erase / the tears", "from a / photo", "and people see", "less / sadness", "and feel less", "like / helping",
    "As far as / we know", "you're the / only animal", "that cries", "from / feelings",
    "And a / good cry", "seems to / help most", "when backup", "shows up",
    "Some / backup",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys): cyan = tears and water, red = the alarm and
# the call for help, pink = the feeling, green = what works, violet = the science words
COLOR = {
    "cream": S, "sad": B, "eyes": C, "leak": C,
    "scientists": V, "face": Y, "backup": R,
    "feelings": PK, "alarm": R, "brain": PK, "tap": C, "eye": Y,
    "drain": C, "nose": O, "cries": C, "too": Y,
    "pours": C, "everyone": Y, "see": G,
    "works": G, "erase": R, "tears": C, "photo": V, "less": R, "sadness": B, "helping": G,
    "know": V, "only": Y, "animal": O,
    "good": G, "cry": C, "help": G, "shows": G,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

I_NOSE1 = find("to your nose") + 2
I_NOSE2 = find("so your nose") + 2
I_BACK1 = find("for backup") + 1
I_BACK2 = find("when backup") + 1
I_BACK3 = find("Some backup") + 1
I_FEEL2 = find("from feelings") + 1
I_FACE2 = find("down your face") + 2
TOO_E = E("cries too", 1)
UP_E = E("shows up", 1)
B3_E = T.we[I_BACK3]
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: the spoon goes in, a tear lands in the tub, his eyes burst
    "chomp": 0.17,                          # his mouth closes on the spoon (the first thing that happens)
    "plop": W("ice cream", 1) + 0.02,       # a fat tear lands in the tub
    "sad": W("sad movie"),
    "movie": W("sad movie", 1),
    "eyes": W("your eyes", 1),              # both eyes fill ...
    "spring": W("spring"),                  # ... and let go
    "leak": W("a leak", 1),
    "leak_end": E("a leak", 1),
    "sob": E("a leak", 1) + 0.06,           # one sob, in the pause
    # the answer, over the same shot
    "relax": W("Relax"),
    "sci": W("scientists"),
    "think": W("scientists think", 1),
    "face": W("your face", 1),              # a lamp pops out of the top of his head
    "called": W("called"),                  # ... and starts to flash: S O S
    "backup": T.ws[I_BACK1],                # the dog's ears go up
    "backup_end": T.we[I_BACK1],
    "huh": T.we[I_BACK1] + 0.05,            # the dog: "hm?" (in the pause, before the dive)
    # 2. alarm: inside his head
    "big": W("Big feelings"),
    "feelings": W("Big feelings", 1),       # the feeling swells
    "feelings_end": E("Big feelings", 1),
    "trip": W("trip an alarm"),
    "alarm": W("trip an alarm", 2),         # the bell goes
    "alarm_end": E("trip an alarm", 2),
    "brain": W("your brain", 1),
    "brain_end": E("your brain", 1),
    "and_it": W("and it opens"),            # the signal sets off down both nerves
    "opens": W("and it opens", 2),          # the taps turn
    "tap": W("a tap", 1),
    "above": W("above each"),
    "each": W("above each", 1),
    "eye": W("each eye", 1),
    "eye_end": E("each eye", 1),
    "gush": E("each eye", 1) + 0.03,        # the water's rush, in the pause
    # 3. drain
    "tiny": W("The tiny", 1),
    "drain": W("tiny drain", 1),            # the plughole in the corner of the eye
    "drain_end": E("tiny drain", 1),
    "in_each": W("in each eye"),
    "leads": W("leads to"),                 # down the pipe
    "nose1": T.ws[I_NOSE1],
    "nose1_end": T.we[I_NOSE1],
    "gurgle": T.we[I_NOSE1] + 0.06,         # the pipe gurgles, in the pause
    "so": W("so your nose"),
    "nose2": T.ws[I_NOSE2],                 # the drips
    "cries": W("cries too"),
    "too": W("cries too", 1),
    "too_end": TOO_E,
    # 4. honk
    "honk": TOO_E + 0.30,                   # he blows his nose, in the gap
    "honk_end": TOO_E + 0.78,
    # 5. spill
    "rest": W("The rest", 1),
    "pours": W("pours down"),
    "down": W("pours down", 1),
    "face2": T.ws[I_FACE2],
    "face2_end": T.we[I_FACE2],
    "spot": T.we[I_FACE2] + 0.06,           # a spotlight comes on, in the pause
    "where": W("where everyone"),
    "everyone": W("where everyone", 1),     # eyes open in the dark, one pair after another
    "can": W("can see"),
    "see": W("can see", 1),
    "it_end": E("see it", 1),
    "shutter": E("see it", 1) + 0.2,        # ... and somebody takes a picture of it (the flash is the cut to the photo)
    # 6. photo
    "it_works": W("It works"),
    "works": W("It works", 1),
    "works_end": E("It works", 1),
    "snap": E("It works", 1) + 0.08,        # the photo lands, in the pause
    "erase": W("Erase the"),                # the eraser goes over one cheek ...
    "tears": W("the tears", 1),             # ... and the other
    "from_a": W("from a photo"),
    "photo": W("from a photo", 2),
    "photo_end": E("from a photo", 2),
    "people": W("and people", 1),
    "see2": W("people see", 1),
    "less1": W("less sadness"),
    "sadness": W("less sadness", 1),        # the first needle falls
    "sadness_end": E("less sadness", 1),
    "drop1": E("less sadness", 1) + 0.05,   # its sound, in the pause
    "and_feel": W("and feel less"),
    "feel": W("and feel less", 1),
    "less2": W("less like"),                # the second needle falls
    "like": W("less like", 1),
    "helping": W("helping"),
    "helping_end": E("helping"),
    "drop2": E("helping") + 0.05,
    # 7. only
    "asfar": W("As far as"),
    "know": W("we know", 1),
    "know_end": E("we know", 1),
    "youre": W("you're the only"),          # the check: the elephant ...
    "only": W("the only", 1),               # ... the dog ...
    "animal": W("only animal", 1),
    "animal_end": E("only animal", 1),
    "that": W("that cries"),
    "cries2": W("that cries", 1),           # ... and him
    "from2": W("from feelings"),
    "feelings2": T.ws[I_FEEL2],
    "feelings2_end": T.we[I_FEEL2],
    "trunk": T.we[I_FEEL2] + 0.10,          # the elephant holds out a tissue, in the gap
    # 8. help + the button
    "and_a": W("And a good"),
    "good": W("good cry"),
    "cry": W("good cry", 1),
    "seems": W("seems to"),
    "help": W("help most"),
    "most": W("help most", 1),
    "most_end": E("help most", 1),
    "whine": E("help most", 1) + 0.06,      # the dog gets up, in the pause
    "when": W("when backup"),
    "backup2": T.ws[I_BACK2],               # he arrives
    "shows": W("shows up"),
    "up": W("shows up", 1),
    "up_end": UP_E,
    "ding": UP_E + 0.12,                    # the lamp on his head goes green, and out
    "lick": UP_E + 0.62,                    # ... and the dog licks the spoon clean
    "lick_end": UP_E + 1.02,
    "some": W("Some backup"),
    "backup3": T.ws[I_BACK3],
    "backup3_end": B3_E,
    "dig": B3_E + 0.30,                     # he digs out a new spoonful
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): SILENT, over the last seconds (since 9 Oct 2026; reference/analytics.md).
# Nobody says "subscribe". The pill pops in 3.4 s before the end, the cursor clicks 1.25 s later, and the pill has
# popped out 0.6 s before the cut back to frame 1, so the loop stays clean. Captions that share the screen with it sit
# at y 1150 (main.js).
cues["sub_in"] = T.duration - 3.40
cues["sub_tap"] = cues["sub_in"] + 1.25
cues["sub_out"] = cues["sub_tap"] + 1.30       # + 0.24 s of pop-out: gone 0.61 s before the end
cues = {k: ([round(x, 3) for x in v] if isinstance(v, list) else round(v, 3)) for k, v in cues.items()}
# "shows up" would end 0.05 s inside the pill's window and be lifted to y 1150 for its whole life (onto the dog's paw):
# it ends just before the pill instead, and stays where it is
for _c in caps:
    if _c["start"] < cues["sub_in"] < _c["end"] < cues["sub_in"] + 0.3:
        _c["end"] = round(cues["sub_in"] - 0.08, 3)
# v3 stamps a take's first word short ("You're" at 0.11-0.20 s while she is still saying it): the word's window runs
# from where the take gets loud to the next word. After the shots, captions and cues are made, so nothing else moves.
_y = find("You're eating")
T.ws[_y] = T.words[_y]["start"] = T.first_loud(T.block("hook")["start"], thr=-30.0)
T.we[_y] = T.words[_y]["end"] = round(max(T.ws[_y] + 0.06, T.ws[_y + 1] - 0.01), 3)
print(f'  "You\'re" is said {T.ws[_y]:.2f}-{T.we[_y]:.2f} s')
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first cut: {shots[1]["start"]:.2f} s (7.0 s or later: the opening is one shot through the answer)' if len(shots) > 1 else 'first cut: none')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print(f'subscribe cue: silent, the pill is up {cues["sub_in"]:.2f}-{cues["sub_out"] + 0.24:.2f} s of {T.duration:.2f} s'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for k, v in cues.items():
    print(f'  {k:14s} {v if isinstance(v, list) else format(v, "6.2f")}')
