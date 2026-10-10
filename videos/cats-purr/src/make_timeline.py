"""Edit timeline for the Why Do Cats PURR? Short (the 30-35 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.45)  # after "You're staff.": the fanfare, she eats, and the cut back to frame 1

W, E, ev, find = T.W, T.E, T.ev, T.find
DUR = T.duration
LOOP = round((DUR - 0.40) * 30) / 30   # the last 0.4 s: the couch again, his hand on its way up to her chin (frame 1)

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                    # ONE shot through the answer: close on his hand under her chin, she purrs, he grins;
                                       # one eye opens on "Maybe"; her eyes go huge on "look after me"; the camera dives
                                       # into her throat
    ("mech", None),                    # inside her throat: the voice box flutters, air in, air out
    ("kittens", "Kittens start"),      # a basket: the mother and three kittens, days old, eyes shut, all purring
    ("hurt", "Grown cats"),            # close on her blissful face ... the camera pulls back: the vet's table, a cone, a bandage
    ("weird", None),                   # 5 a.m.: he is asleep on the couch, she purrs into his ear; the cry inside the purr
    ("button", None),                  # he serves her breakfast; a bow tie for him, a crown for her
    ("loop", None),                    # the picture of frame 1 again (the hook's state at negative time)
]
special = {
    "mech": W("Her voice box") - 0.30,
    "weird": W("And hungry") - 0.16,
    "button": W("You don't own") - 0.14,
    "loop": LOOP,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You scratch / your cat", "and she / purrs", "Happy cat", "right",
    "Maybe", "but scientists / think", "a purr / really means", "look / after me",
    "Her / voice box", "flutters", "twenty-five times / a second", "breathing in", "and out",
    "Kittens start", "days / after birth", "eyes / still shut",
    "Grown cats / purr", "when they're / happy", "or hurt",
    "And hungry", "She hides / a cry", "inside it", "pitched like", "a human / baby's",
    "You don't / own a cat", "You're / staff",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea: yellow = the purr and what it means, green = happy, red = hurt and the
# cry, cyan = air, pink = the small and helpless (kittens, a baby), violet = the science word
COLOR = {
    "purrs": Y, "happy": G, "right": Y,
    "maybe": O, "scientists": V, "purr": Y, "look": Y, "after": Y, "me": Y,
    "voice": C, "box": C, "flutters": O, "25": Y, "in": C, "out": O,
    "kittens": PK, "days": Y, "shut": B,
    "hurt": R,
    "hungry": O, "cry": R, "inside": Y, "human": PK, "baby's": PK,
    "don't": R, "staff": Y,
}
DISPLAY = {"twenty-five times": ["25", "TIMES"]}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

I_HAPPY2 = find("they're happy") + 1
I_PURR2 = find("cats purr") + 1
ME_E = E("after me", 1)
SHUT_E = E("still shut", 1)
BABY_E = E("baby's")
STAFF_E = E("You're staff", 1)
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: his fingers under her chin; she starts up; he grins at us
    "she": W("she purrs"),
    "purrs": W("she purrs", 1),              # the purr starts on the word ...
    "purrs_end": E("she purrs", 1),          # ... and is heard alone in the pause
    "happy": W("Happy cat"),
    "right": W("RIGHT"),
    "right_end": E("RIGHT"),
    # the answer, over the same shot
    "maybe": W("Maybe"),                     # one eye opens. The purr stops dead
    "maybe_end": E("Maybe"),
    "but": W("but scientists"),              # ... and starts again
    "sci": W("scientists"),
    "apurr": W("a purr", 1),
    "really": W("really means"),
    "means": W("really means", 1),
    "means_end": E("really means", 1),
    "look": W("look after"),                 # her eyes go huge
    "after": W("look after", 1),
    "me": W("after me", 1),
    "me_end": ME_E,
    "paw": ME_E + 0.04,                      # a paw on his chin, in the pause
    "dive": SH["mech"]["start"] - 0.22,      # the camera goes for her throat
    # 2. mech: inside her throat
    "her": W("Her voice"),
    "voice": W("Her voice", 1),
    "box": W("voice box", 1),
    "box_end": E("voice box", 1),
    "flutters": W("flutters"),
    "flutters_end": E("flutters"),
    "n25": W("twenty-five"),                 # the counter
    "times": W("times"),
    "second": W("a second", 1),
    "second_end": E("a second", 1),
    "breathing": W("breathing"),
    "in": W("breathing in", 1),              # air goes down
    "in_end": E("breathing in", 1),
    "and": W("AND out"),
    "out": W("AND out", 1),                  # ... and comes back up; the flutter never stops
    "out_end": E("AND out", 1),
    # 3. kittens
    "kittens": W("Kittens start"),
    "days": W("days after"),                 # the DAY 2 tag
    "birth": W("after birth", 1),
    "birth_end": E("after birth", 1),
    "eyes": W("eyes still"),
    "still": W("eyes still", 1),
    "shut": W("still shut", 1),
    "shut_end": SHUT_E,
    "mew": SHUT_E + 0.06,                    # the smallest one squeaks, in the pause
    # 4. hurt
    "grown": W("Grown cats"),
    "purr2": T.ws[I_PURR2],
    "happy2": T.ws[I_HAPPY2],
    "happy2_end": T.we[I_HAPPY2],
    "or": W("or HURT"),                      # the camera lets go
    "hurt": W("or HURT", 1),                 # ... and there is the cone
    "hurt_end": E("or HURT", 1),
    # 5. weird: 5 a.m.
    "and_hungry": W("And hungry"),
    "hungry": W("And hungry", 1),
    "hungry_end": E("And hungry", 1),
    "she2": W("She hides"),
    "hides": W("She hides", 1),
    "acry": W("a cry", 1),                   # the thin line inside the fat one lights up
    "inside": W("inside it"),
    "it_end": E("inside it", 1),
    "pitched": W("pitched like"),
    "human": W("human baby's"),
    "babys": W("human baby's", 1),           # the baby's own line lands next to it: the same height
    "babys_end": BABY_E,
    "wah": BABY_E + 0.10,                    # the cry, heard alone; his eyes fly open
    # 6. button
    "you": W("You don't"),
    "dont": W("You don't", 1),
    "own": W("own a"),
    "cat3": W("own a cat", 2),
    "cat3_end": E("own a cat", 2),
    "serve": E("own a cat", 2) + 0.05,       # the bowl comes up, in the pause
    "youre": W("You're staff"),
    "staff": W("You're staff", 1),           # the bow tie and the crown
    "staff_end": STAFF_E,
    "fanfare": STAFF_E + 0.06,               # two notes, after the word
    "munch": STAFF_E + 0.40,                 # she eats
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
# a chunk that would end a moment inside the pill's window is lifted to y 1150 for its whole life (main.js): it ends
# just before the pill instead, and stays where it is (why-we-cry, 10 Oct 2026)
for _c in caps:
    if _c["start"] < cues["sub_in"] < _c["end"] < cues["sub_in"] + 0.3:
        _c["end"] = round(cues["sub_in"] - 0.08, 3)
# v3 stamps a take's first word short ("You" at 0.10-0.18 s while she is still saying it): the word's window runs from
# where the take gets loud to the next word. After the shots, captions and cues are made, so nothing else moves.
_y = find("You scratch")
T.ws[_y] = T.words[_y]["start"] = T.first_loud(T.block("hook")["start"], thr=-30.0)
T.we[_y] = T.words[_y]["end"] = round(max(T.ws[_y] + 0.06, T.ws[_y + 1] - 0.01), 3)
print(f'  "You" is said {T.ws[_y]:.2f}-{T.we[_y]:.2f} s')
# the same for "Her" (the first word of `mech`): it is stamped 0.05 s before she starts it
_h = find("Her voice box")
T.ws[_h] = T.words[_h]["start"] = round(min(max(T.ws[_h], T.first_loud(T.block("mech")["start"], thr=-36.0)), T.ws[_h + 1] - 0.07), 3)
T.we[_h] = T.words[_h]["end"] = round(max(T.ws[_h] + 0.06, T.ws[_h + 1] - 0.01), 3)
print(f'  "Her" is said {T.ws[_h]:.2f}-{T.we[_h]:.2f} s')
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
