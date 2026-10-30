"""Edit timeline for the Why Can't You NOT Think of a White Bear? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
The hook, guard and poster shots are one continuous picture (him at the campfire, eyes shut, fingers on his temples,
his thought bubble beside him, the guard's lookout growing out of his hair); the cuts between them are only names.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # the button's gag (the bear at the wheel), then the cut back to frame 1 for the loop

SHOTS = [
    ("hook", None),               # THE TEST: frame 1 is him, close, eyes squeezed shut, fingers on his temples, an empty
                                  # thought bubble beside him; the bear pops into it on "white bear" (2.9 s); "Too late." 4.8 s
    ("guard", "Your brain"),      # the lookout springs out of his hair: a ranger with binoculars; he keeps trying, the bear goes
    ("poster", "But to spot"),    # the guard unfolds a WANTED poster and holds it up: the bear is back in the bubble, again, again
    ("lab", "In one study"),      # the 1987 study: three volunteers, a desk bell each, DING whenever the bear comes back
    ("night", "It's probably"),   # 2 a.m. at the tent, in his sleeping bag, eyes wide: the bubble replays his awkward wave
    ("button", "The trick"),      # back at the fire: a red car drives into the bubble... and the bear is driving it
    ("loop", None),               # the last 0.45 s: the picture of frame 1 again (the Short loops)
]
special = {"loop": T.duration - 0.45}

CHUNKS = [
    "Five seconds.",
    "Don't you DARE",
    "think of a / white bear.",
    "Go!",
    "Too late.",
    "Your brain / hired a guard...",
    "to watch / for bears.",
    "Keep trying.",
    "Every few seconds, / he checks...",
    "any bears?",
    "But to spot one...",
    "he has to / PICTURE one.",
    "In one study,",
    "people rang / a bell",
    "whenever it / came back...",
    "over once / a minute!",
    "It's probably why",
    "your cringiest / moment",
    "replays at / two a.m.",
    "The trick?",
    "Picture a / red car",
    "instead.",
    "Ready?",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"dare": R, "white": Y, "bear": Y, "bears": Y, "go": G, "too": R, "late": R, "guard": O, "checks": O,
         "picture": Y, "bell": O, "once": G, "minute": G, "cringiest": P["P"], "2": B, "am": B, "red": R, "car": R, "ready": G}
DISPLAY = {"two am": ["2", "A.M."]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

# "two" was aligned into the silence between "at" and "a.m." (its window read -56 dB): move the three words onto their bursts
assert T.retime("at two a.m.", 26.76, 27.72), "retime failed: check the bursts round 2 a.m."
shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_bears2 = find("any bears")
cues = {
    # the hook: the instruction, the bear, the countdown, the verdict
    "five": W("Five"), "seconds_end": E("seconds"), "dare": W("DARE"), "white": W("white"), "bear": W("white bear", 1),
    "go": W("Go"), "too": W("Too"), "late_end": E("Too late", 1),
    # the guard
    "brain": W("brain"), "hired": W("hired"), "guard": W("guard"), "guard_end": E("guard"), "watch": W("watch"),
    "bears1": W("for bears", 1), "keep": W("Keep"), "trying": W("trying"), "every": W("Every"), "checks": W("checks"),
    "any": W("any"), "bears2": W("bears", 0, i_bears2), "bears2_end": E("bears", 0, i_bears2),
    # the poster
    "but": W("But"), "spot": W("spot"), "spot_one": W("spot one", 1), "has": W("has"), "picture": W("PICTURE one"),
    "picture_one": W("PICTURE one", 1), "picture_one_end": E("PICTURE one", 1),
    # the study
    "study": W("study"), "people": W("people"), "rang": W("rang"), "bell": W("bell"), "whenever": W("whenever"),
    "came": W("came"), "back": W("came back", 1), "over": W("over"), "once": W("once"), "minute": W("minute"),
    "minute_end": E("minute"),
    # 2 a.m.
    "probably": W("probably"), "cringiest": W("cringiest"), "moment": W("moment"), "replays": W("replays"),
    "two": W("two"), "am": W("two", 1),
    # the button
    "trick": W("trick"), "picture2": W("Picture a red"), "red": W("red"), "car": W("red car", 1),
    "instead": W("instead"), "ready": W("Ready"), "ready_end": E("Ready"),
}
# the guard's poster: up on "PICTURE", down, up on "one", down, up once more (each time the bear is back in the bubble)
cues["pops"] = [cues["picture"] + 0.02, cues["picture_one"] + 0.02, cues["picture_one"] + 0.5]
# the study: who rings when (volunteer 0 left, 1 the hiker in the middle, 2 right); the bear pops 0.22 s before each ring
dings = [(1, cues["bell"]), (0, cues["whenever"] + 0.12), (2, cues["came"] + 0.02), (1, cues["back"] + 0.18),
         (0, cues["over"] - 0.06), (2, cues["once"] + 0.06), (1, cues["minute"] + 0.02), (0, cues["minute"] + 0.42),
         (2, cues["minute"] + 0.7), (1, cues["minute"] + 0.96)]
cues["dings"] = [round(t, 3) for _, t in dings]
cues["ding_who"] = [w for w, _ in dings]
# the button's last gag: the bear at the wheel, the honk, his eyes snap open
cues["bear_car"] = cues["ready_end"] + 0.16
cues["honk"] = cues["bear_car"] + 0.14
cues["loop"] = T.duration - 0.45
for a, b in [("white", "go"), ("go", "too"), ("too", "brain"), ("guard", "watch"), ("keep", "every"), ("checks", "any"),
             ("spot", "picture"), ("bell", "minute"), ("cringiest", "replays"), ("red", "instead"), ("ready_end", "bear_car"),
             ("honk", "loop")]:
    assert cues[a] < cues[b], f"cue order: {a} {cues[a]:.2f} !< {b} {cues[b]:.2f}"
assert cues["dings"][-1] < W("It's probably") - 0.1, "the last ding runs into the night shot"

T.write(shots, caps, cues)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
