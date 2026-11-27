"""Edit timeline for the Can Your Hands Tap Two DIFFERENT Beats? 🥁 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.

The story: at a picnic table at dusk he drums two upturned pots, LEFT hand two beats, RIGHT hand three. On GO his left
hand copies his right: SAME BEAT. A window opens on his head: one tiny drummer with ONE drum works both hands on strings.
Left once, right twice? Easy (the drummer grins). Two and three: the drummer tangles, PANICS; speed up and he flops into
one easy beat. So drummers cheat: the drummer's CHEAT card; the two beat lanes are glued into ONE row: NICE . CUP OF TEA.
He plays it; on TEA the kettle across the table (the running device) whistles and pours his tea. "Now you": he plays it
again and the last 0.5 s is frame 1 again (the loop).
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # the tight rules (5 Nov 2026): nothing after the last line, the loop within 1.0 s
DUR = T.duration
W, E, ev, find = T.W, T.E, T.ev, T.find

i_nice2 = find("Now you") + 2            # the button's "Nice..."
assert T.words[i_nice2]["word"].lower().startswith("nice"), T.words[i_nice2]["word"]
i_tea1 = find("cup of tea") + 2          # the trick's "tea."

SHOTS = [
    ("hook", None),                 # ECU, from his eyes: two hands over two upturned pots (blue 2, orange 3), the beat lanes
    ("hookb", "three with"),        # medium, low, from the kettle's side: him concentrating, his right hand taps three
    ("go", "GO!"),                  # close, from his eyes, tilted: both hands slap together: the left copies the right; red X
    ("answer", "Your hands"),       # whip to a medium from the front: a window opens on his head: a tiny drummer
    ("drummer", "ONE drummer"),     # close on the window + strings to his hands: one drum, both mallets slam (hitstop)
    ("easy", "Left once"),          # whip, medium high from his eyes: one against two, lanes 1 / 2, it flows
    ("easyok", None),               # ECU the hands: EASY, a green tick; the drummer grins in a little window
    ("panic", "Two and three"),     # close from the front: the drummer tangles his arms, PANICS; his hands flail (tilt)
    ("faster", "Speed up"),         # whip, ECU from his eyes: the hands blur faster
    ("slump", "and he falls"),      # medium, high, from the front: the drummer flops; the kettle boils over
    ("easyb", "EASY beat"),         # close from his eyes: both hands thump the same lazy beat, lanes 1 / 1
    ("cheat", "So drummers"),       # whip, ECU the drummer: a sly wink, a CHEAT card out of his hat
    ("glue", "They glue"),          # medium from his eyes: a glue bottle squeezes between the lanes; they stick into ONE row
    ("trick", "ONE rhythm"),        # close from his eyes, a slow push (the longest shot): NICE ... CUP OF TEA lights up
    ("tea", None),                  # medium, low, from the front: cup-of-TEA, the kettle whistles and pours his tea (hitstop)
    ("button", "Now you"),          # close front: he grins and lifts his hands: your turn
    ("button2", None),              # medium from his eyes: NICE ... CUP OF TEA again
    ("loop", None),                 # frame 1 again (the hook's state at negative time): the Short loops
]
special = {
    "easyok": W("Easy.") - 0.06,
    "tea": T.words[i_tea1 - 2]["start"] - 0.06,      # at "cup" (the chunk "cup of tea." stays whole in this shot)
    "button2": T.words[i_nice2]["start"] - 0.06,
    "loop": DUR - 0.5,
}

CHUNKS = [
    "Tap two / with your left hand,",
    "three / with your right.",
    "GO!",
    "Same beat?",
    "Your hands / only have",
    "ONE drummer.",
    "Left once,",
    "right twice?",
    "Easy.",
    "Two and three?",
    "He PANICS.",
    "Speed up,",
    "and he falls back / to an",
    "EASY beat.",
    "So drummers / cheat.",
    "They glue / both into",
    "ONE rhythm.",
    "Nice...",
    "cup of tea.",
    "Now you.",
    "Nice...",
    "cup of tea.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"two": C, "left": C, "three": O, "right": O, "go": Y, "same": R, "one": Y, "drummer": Y, "once": C,
         "twice": O, "easy": G, "panics": R, "speed": O, "cheat": Y, "glue": Y, "rhythm": Y, "nice": Y, "tea": Y,
         "cup": O, "of": C, "you": Y}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values())

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
st = {s_["id"]: s_["start"] for s_ in shots}
en = {s_["id"]: s_["end"] for s_ in shots}

cues = {
    "tap": W("Tap"), "two": W("two with"), "left": W("left hand"), "three": W("three with"), "right": W("right."),
    "go": W("GO!"), "go_end": E("GO!"), "same": W("Same"), "beat": W("beat?"), "beat_end": E("beat?"),
    "your": W("Your hands"), "hands": W("hands only"), "only": W("only"), "one1": W("ONE drummer"), "drummer": W("drummer."),
    "drummer_end": E("drummer."),
    "left2": W("Left once"), "once": W("once,"), "right2": W("right twice"), "twice": W("twice?"), "easy1": W("Easy."),
    "easy1_end": E("Easy."),
    "two2": W("Two and"), "three2": W("three?"), "he": W("He PANICS"), "panics": W("PANICS."), "panics_end": E("PANICS."),
    "speed": W("Speed"), "up": W("up,"), "and": W("and he falls"), "falls": W("falls"), "back": W("back to"),
    "easy2": W("EASY beat"), "beat2": W("beat.", 0, find("EASY beat") + 1), "beat2_end": E("beat.", 0, find("EASY beat") + 1),
    "so": W("So drummers"), "drummers": W("drummers"), "cheat": W("cheat."), "cheat_end": E("cheat."),
    "they": W("They glue"), "glue": W("glue"), "both": W("both into"), "into": W("into"), "one2": W("ONE rhythm"),
    "rhythm": W("rhythm."), "rhythm_end": E("rhythm."),
    "nice1": W("Nice..."), "cup1": T.words[i_tea1 - 2]["start"], "of1": T.words[i_tea1 - 1]["start"],
    "tea1": T.words[i_tea1]["start"], "tea1_end": T.words[i_tea1]["end"],
    "now": W("Now you"), "you": W("you.", 0, find("Now you") + 1), "you_end": E("you.", 0, find("Now you") + 1),
    "nice2": T.words[i_nice2]["start"], "cup2": T.words[i_nice2 + 1]["start"], "of2": T.words[i_nice2 + 2]["start"],
    "tea2": T.words[i_nice2 + 3]["start"], "tea2_end": T.words[i_nice2 + 3]["end"],
    "end": DUR,
}
c = cues
assert c["one2"] > c["one1"] + 5 and c["nice2"] > c["tea1"] > c["of1"] > c["cup1"] > c["nice1"], "the repeated words found the wrong match"
assert c["tea2"] > c["of2"] > c["cup2"] > c["nice2"] > c["you"], "the button's cues are out of order"
assert c["beat2"] > c["easy2"] > c["falls"], "the second 'beat' is wrong"

# ---- the hands: one list of keys per hand for the whole Short: [time, height cm, kind] (h = a hit on its pot, r = resting
# on it, u = hovering). Frame 0 repeats the button's end (the loop), so the lists start with the button's last keys at
# negative time.
L, Rr = [], []
def hit(lst, t0): lst.append([round(t0, 3), 0.0, "h"])
def rest(lst, t0): lst.append([round(t0, 3), 0.0, "r"])
def up(lst, t0, y): lst.append([round(t0, 3), y, "u"])

hit(L, c["of2"] - DUR); hit(Rr, c["tea2"] - DUR)          # the loop: the button's last hits, a lap earlier
# the hook: the left hand shows two even taps, the right hand three
hit(L, c["two"]); hit(L, c["two"] + 0.56); rest(L, c["two"] + 0.9)
rest(Rr, c["three"] - 0.55); up(Rr, c["three"] - 0.28, 5.5)
for k in range(3): hit(Rr, c["three"] + 0.4 * k)
rest(Rr, c["three"] + 0.95); up(L, c["go"] - 0.2, 5.0); up(Rr, c["go"] - 0.2, 5.0)
# GO: both together, the left copying the right (the merge): the same beat
merged = [c["go"] + 0.12 + 0.4 * k for k in range(5)]
for tt in merged: hit(L, tt); hit(Rr, tt)
cues["merged"] = merged
# the answer: they stutter, then the drummer slams both on ONE
up(L, c["hands"] - 0.05, 3.0); up(Rr, c["hands"] - 0.05, 3.0)
up(L, c["one1"] - 0.18, 9.0); up(Rr, c["one1"] - 0.18, 9.0)
cues["slam"] = c["one1"] + 0.04
hit(L, cues["slam"]); hit(Rr, cues["slam"])
hit(L, cues["slam"] + 0.55); hit(Rr, cues["slam"] + 0.55); rest(L, cues["slam"] + 0.95); rest(Rr, cues["slam"] + 0.95)
# easy: left once, right twice (a bar of 0.56 s from "once")
bar = 0.56
easyL = [c["once"] + bar * k for k in range(5)]
easyR = [c["once"] + bar / 2 * k for k in range(9)]
for tt in easyL: hit(L, tt)
for tt in easyR: hit(Rr, tt)
rest(L, easyL[-1] + 0.15); rest(Rr, easyR[-1] + 0.15)
cues["easyL"], cues["easyR"] = easyL, easyR
# two and three: a wobbly try, then the flail (He PANICS)
t2 = c["two2"]
tryL = [t2, t2 + 0.62]
tryR = [t2, t2 + 0.38, t2 + 0.70]
for tt in tryL: hit(L, tt)
for tt in tryR: hit(Rr, tt)
flailL = [c["he"] - 0.12, c["he"] + 0.08, c["panics"] - 0.02, c["panics"] + 0.2, c["panics"] + 0.36, c["panics"] + 0.58, c["panics"] + 0.74]
flailR = [c["he"] - 0.04, c["he"] + 0.16, c["panics"] + 0.06, c["panics"] + 0.14, c["panics"] + 0.42, c["panics"] + 0.5, c["panics"] + 0.78]
for tt in flailL: hit(L, tt)
for tt in flailR: hit(Rr, tt)
# speed up: faster and faster (the right at 0.2 s, the left at 0.3 s), then they fall into one lazy beat
fastR = [c["speed"] + 0.2 * k for k in range(4)]
fastL = [c["speed"] + 0.3 * k for k in range(3)]
for tt in fastL: hit(L, tt)
for tt in fastR: hit(Rr, tt)
lazy = [c["falls"] - 0.05 + 0.5 * k for k in range(5)]
lazy = [tt for tt in lazy if tt < c["so"] - 0.3]
for tt in lazy: hit(L, tt); hit(Rr, tt)
cues["lazy"] = lazy
rest(L, lazy[-1] + 0.2); rest(Rr, lazy[-1] + 0.2)
# the trick: NICE (both) ... CUP (right) OF (left) TEA (right)
up(L, c["nice1"] - 0.3, 7.0); up(Rr, c["nice1"] - 0.3, 7.0)
hit(L, c["nice1"]); hit(Rr, c["nice1"])
hit(Rr, c["cup1"]); hit(L, c["of1"]); hit(Rr, c["tea1"])
rest(L, c["tea1"] + 0.3); rest(Rr, c["tea1"] + 0.3)
# now you: both hands lift (your turn), then the same again
up(L, c["now"] + 0.1, 12.0); up(Rr, c["now"] + 0.1, 12.0)
up(L, c["nice2"] - 0.3, 7.0); up(Rr, c["nice2"] - 0.3, 7.0)
hit(L, c["nice2"]); hit(Rr, c["nice2"])
hit(Rr, c["cup2"]); hit(L, c["of2"]); hit(Rr, c["tea2"])
# ...and on into frame 1: the left hand rises toward its first tap of the hook (the lap), the right rests
L.sort(key=lambda k: k[0]); Rr.sort(key=lambda k: k[0])
L.append([round(c["two"] + DUR, 3), 0.0, "h"])
cues["keysL"], cues["keysR"] = L, Rr
cues["hitsL"] = [k[0] for k in L if k[2] == "h" and 0 <= k[0] < DUR]
cues["hitsR"] = [k[0] for k in Rr if k[2] == "h" and 0 <= k[0] < DUR]

# ---- the other beats
cues["win"] = c["your"] - 0.04                     # the window opens on his head
cues["panic_on"] = c["he"] - 0.05                  # the drummer tangles
cues["flop"] = c["falls"] + 0.05                   # the drummer flops
cues["boil"] = c["he"] + 0.1                       # the kettle boils over (the device escalates)
cues["boil_end"] = c["so"] - 0.2
cues["wink"] = c["drummers"] + 0.1                 # the drummer's wink
cues["card"] = c["cheat"] - 0.05                   # the CHEAT card out of his hat
cues["squeeze"] = c["glue"] - 0.05                 # the glue bottle squeezes
cues["stick"] = c["both"] + 0.05                   # the rows stick together
cues["merge1"] = c["one2"] + 0.05                  # one row
cues["whistle"] = c["tea1_end"] + 0.01             # the kettle whistles (the sting), just after the word ...
cues["sting"] = c["tea1_end"] + 0.06               # ... its impact frame (hitstop)
cues["pour0"] = c["tea1_end"] + 0.06               # it pours his tea
cues["pour1"] = c["now"] + 0.25
cues["settle"] = c["now"] + 0.45
cues["loop"] = st["loop"]

# the flash-forward: the payoff's own moment (the kettle pouring, his grin) in a window over the test, in the gap after GO
cues["ff"] = 4.0
FLASH_AT = c["tea1"] + 0.24

# ---- the camera and the light (the cinema kit; reference/visual.md "Camera and light craft")
CAMERA = {
    "hand": {"hook": 0.25, "hookb": 0.28, "go": 0.35, "answer": 0.3, "drummer": 0.3, "easy": 0.25, "easyok": 0.25,
             "panic": 0.55, "faster": 0.5, "slump": 0.3, "easyb": 0.25, "cheat": 0.3, "glue": 0.25, "trick": 0.22,
             "tea": 0.3, "button": 0.25, "button2": 0.25, "loop": 0.25},
    "whip": [[st["answer"], 1], [st["easy"], -1], [st["faster"], 1], [st["cheat"], -1], [st["button"], 1]],
    "punch": [[c["one1"] - 0.02, 1.16, en["drummer"] - 0.05], [c["panics"] - 0.03, 1.15, en["panic"] - 0.05],
              [c["tea1"] - 0.03, 1.14, en["tea"] - 0.05]],
    "tilt": [[c["he"] - 0.05, c["panics_end"] + 0.35, -3.5]],
    "hit": [[cues["slam"], 4], [cues["sting"], 4]],
    "act": {"brow": [c["your"], c["falls"], c["now"]]},
    "mood": [[0, "dusk"], [c["he"] - 0.1, "storm"], [st["faster"], "dusk"], [st["glue"], "warm"], [st["button"], "dusk"]],
    "fg": {"hook": "bokeh-r", "hookb": "grass-bl", "go": "bokeh-l", "answer": "branch-tr", "easy": "bokeh-r",
           "panic": "branch-tl", "slump": "grass-br", "easyb": "bokeh-l", "glue": "bokeh-r", "trick": "bokeh-l",
           "tea": "grass-bl", "button": "branch-tr", "button2": "bokeh-l", "loop": "bokeh-r"},
    "air": {"hook": {"kind": "embers", "amount": 0.5}, "hookb": "embers", "go": "embers", "answer": "embers", "easy": "embers",
            "panic": "embers", "slump": "embers", "easyb": "embers", "glue": "sparkle", "trick": "sparkle", "tea": "embers",
            "button": "embers", "button2": "embers", "loop": {"kind": "embers", "amount": 0.5}},
    "flash": [[cues["ff"], 0.5, FLASH_AT, {"win": [790, 900, 165], "zoom": 1.25, "at": [520, 1060]}]],
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
