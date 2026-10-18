"""Edit timeline for the Why Can't You Breathe and SWALLOW at the Same Time? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: his manual gulp, the push back in, the cut to frame 1

# the aligner runs about 0.1 s early through "Feel your throat" (traced 19 Oct 2026 on narration.wav: the "f" starts at
# 8.46 s, the vowel 8.50-8.66, "your" 8.66-8.80, "throat" 8.86-9.07; the alignment said 8.42 / 8.55 / 8.72): put the three
# words where her voice is, so the captions, the cues and qa.py's per-word check all use the real times
_i = T.find("Feel your throat")
for _k, (_a, _b) in enumerate(((8.46, 8.65), (8.66, 8.80), (8.86, 9.07))):
    _w = T.words[_i + _k]
    assert abs(_w["start"] - _a) < 0.2, f"{_w['word']} moved: re-trace it"
    T.ws[_i + _k] = _w["start"] = _a
    T.we[_i + _k] = _w["end"] = _b
assert T.words[_i + 2]["end"] < T.words[_i + 3]["start"], "throat / jump out of order"

# (shot id, phrase whose first word opens the shot). One place outside (sky-blue's summit trail) and one inside (his
# throat from the side, drawn as glass), and back.
SHOTS = [
    ("hook", None),            # THE TEST: frame 0 is him close on the summit, fingers on his throat, mid-swallow; on
                               # "breathe in" the air streaks at his nose bounce off; "Try it." he swallows again. On
                               # "Can't" a round window opens on his throat with the queue inside, and the camera dives in.
    ("inside", "Your spit"),   # his throat from the side: the spit cuts in front of the air puffs; ONE TUNNEL; the voice box
                               # hops up under the lid (his own test in a corner window); the brain hits PAUSE; SLAM.
    ("drink", "Ever had"),     # the summit: he sips from his bottle and coughs (KOFF!) on "pipe"
    ("late", "The lid was"),   # inside again: the lid swings down too late, a drop is already in the windpipe; the cough
                               # blasts it back up
    ("day", "You stop"),       # one whole day on the summit in a few seconds, a swallow counter racing up
    ("button", "Now you're"),  # he freezes, hand to his throat, swallows by hand; "Sorry."; back to frame 0 (the loop)
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Can you / swallow",
    "and / breathe in",
    "at the / same time?",
    "Try it.",
    "Can't, right?",
    "Your spit / just cut",
    "in line.",
    "One tunnel.",
    "Feel your / throat jump?",
    "That's your / voice box,",
    "hopping up / under a lid.",
    "Your brain / hits PAUSE",
    "on breathing,",
    "and the lid",
    "slams SHUT.",
    "Ever had water",
    "go down the / wrong pipe?",
    "The lid",
    "was LATE.",
    "You stop / breathing",
    "like this",
    "HUNDREDS",
    "of times / a day...",
    "without / thinking.",
    "Now you're / thinking",
    "about it.",
    "Sorry.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"swallow": V, "breathe": C, "same": Y, "try": G, "can't": R, "spit": V, "cut": Y, "line": Y, "tunnel": Y,
         "throat": O, "jump": O, "voice": O, "box": O, "lid": PK, "brain": PK, "pause": R, "breathing": C, "slams": R,
         "shut": R, "water": C, "wrong": R, "pipe": R, "late": R, "hundreds": Y, "thinking": Y, "sorry": V}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_lid1 = find("under a lid")
i_lid2 = find("the lid slams")
i_lid3 = find("The lid was")
i_br1 = find("on breathing")
i_br2 = find("stop breathing")
i_th1 = find("without thinking")
i_th2 = find("you're thinking")
i_it1 = find("Try it")
i_it2 = find("about it")
assert i_lid1 < i_br1 < i_lid2 < i_lid3 < i_br2 < i_th1 < i_th2 and i_it1 < i_it2
cues = {
    # the hook: the test, from frame 0
    "swallow": W("swallow"), "breathe": W("breathe"), "in_end": E("in", s=find("breathe in")), "same": W("same"),
    "time_end": E("time"), "try": W("Try"), "try_end": E("it", s=i_it1),
    "cant": W("Can't"), "right": W("right"), "right_end": E("right"),
    # inside: the queue, the tunnel, the voice box, the pause, the lid
    "spit": W("spit"), "cut": W("cut"), "line_end": E("line"),
    "one": W("One tunnel"), "tunnel": W("tunnel"), "tunnel_end": E("tunnel"),
    "feel": W("Feel"), "jump": W("jump"), "jump_end": E("jump"),
    "voice": W("voice"), "box_end": E("box"), "hopping": W("hopping"), "lid1": W("lid", s=i_lid1), "lid1_end": E("lid", s=i_lid1),
    "brain": W("brain"), "pause": W("PAUSE"), "pause_end": E("PAUSE"), "breathing1": W("breathing", s=i_br1),
    "lid2": W("lid", s=i_lid2), "slams": W("slams"), "slams_end": E("slams"), "shut": W("SHUT"), "shut_end": E("SHUT"),
    # the drink and the late lid
    "ever": W("Ever had"), "water": W("water"), "wrong": W("wrong"), "pipe_end": E("pipe"),
    "lid3": W("lid", s=i_lid3), "late": W("LATE"), "late_end": E("LATE"),
    # one day
    "stop": W("You stop"), "breathing2": W("breathing", s=i_br2), "hundreds": W("HUNDREDS"), "hundreds_end": E("HUNDREDS"),
    "day_end": E("day"), "without": W("without"), "thinking1_end": E("thinking", s=i_th1),
    # the button
    "now": W("Now you're"), "thinking2": W("thinking", s=i_th2), "it2_end": E("it", s=i_it2),
    "sorry": W("Sorry"), "sorry_end": E("Sorry"),
}
# the gags, in the gaps after their words (sound.md: the sound just after the word, never on it)
cues["gulp1"] = 0.0                                       # frame 0: he is mid-swallow already
cues["bounce1"] = round(cues["in_end"] + 0.04, 3)         # the air streaks hit his shut throat and bounce off his nose
cues["gulp2"] = round(cues["try_end"] + 0.02, 3)          # "Try it.": he swallows again, with the viewer
cues["win_open"] = round(cues["cant"] - 0.05, 3)          # the round window opens on his throat
cues["hey"] = round(cues["line_end"] + 0.06, 3)           # the first air puff: HEY!
cues["slam"] = round(cues["slams_end"] + 0.03, 3)         # the lid lands in the pause before "SHUT."
cues["reopen"] = round(cues["shut_end"] + 0.12, 3)        # the lid lifts again, the air rushes in
cues["cough"] = round(cues["pipe_end"] + 0.04, 3)         # KOFF!
cues["blast"] = round(cues["late_end"] + 0.05, 3)         # the cough blasts the drop back out of the windpipe
cues["gulp_b"] = round(cues["it2_end"] + 0.10, 3)         # his gulp by hand, in the pause before "Sorry."
cues["home"] = round(T.duration - 0.45, 3)                # the last moves back to frame 0
# the swallow counter of the day shot: ticks that start slow and race (a whole day in a few seconds)
t0, t1 = cues["stop"] + 0.25, cues["now"] - 0.15
ticks, k = [], 0
while True:
    u = k / 46
    t = t0 + (t1 - t0) * (u ** 0.62)
    if t >= t1 or k > 46:
        break
    ticks.append(round(t, 3))
    k += 1
cues["ticks"] = ticks
assert cues["bounce1"] < cues["same"] and cues["gulp2"] < cues["cant"] < cues["spit"]
assert cues["hey"] < cues["one"] and cues["slam"] < cues["shut"] < cues["reopen"] < cues["ever"]
assert cues["cough"] < cues["lid3"] and cues["blast"] < cues["stop"] and cues["gulp_b"] < cues["sorry"]
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
print("cues: " + ", ".join(f"{k}={v:.2f}" for k, v in cues.items() if not isinstance(v, list)))
