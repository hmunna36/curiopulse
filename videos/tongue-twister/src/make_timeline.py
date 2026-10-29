"""Edit timeline for the Can You Say MIT's HARDEST Tongue Twister? 👅 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
The test: the viewer says "pad kid poured curd pulled cod" five times fast. The world: TWISTER NIGHT, a club stage; his
mouth in section (glass, side view); a speech lab in 2013. Every beat below is a cue (scenes.js and audio.py read them).
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe, fr

T = Timeline(sys.argv[1], tail=1.0)  # the button beat and the cut back to frame 1 (the loop)

# the tagged take's first word: v3 can give the tag's time to the word ([mischievously] Your turn.)
i_your = T.find("Your turn")
onset = T.first_loud(T.block("turn")["start"])
if onset - T.ws[i_your] > 0.1:
    T.ws[i_your] = T.words[i_your]["start"] = onset

# words whose alignment sits on a sibilant or a breath, moved onto their own burst of speech-band energy (T.bursts):
# "Say" (its S is above 4 kHz; the voice starts at 9.18), "Still" (the same; its vowel is at 30.12-30.25)
for ph, k, a, b in (("Say it slow", 0, 0.08, None), ("Still talking", 0, 0.1, 0.14)):
    i = T.find(ph) + k
    T.ws[i] = T.words[i]["start"] = round(T.ws[i] + a, 3)
    if b is not None:
        T.we[i] = T.words[i]["end"] = round(T.we[i] + b, 3)
        T.ws[i + 1] = T.words[i + 1]["start"] = max(T.ws[i + 1], round(T.we[i] + 0.02, 3))

SHOTS = [
    ("hook", None),            # THE TEST: frame 1 is him at the mic, close, mid-twister (lips on "P"), one finger up.
                               # The knot on "fast", "Tangled?" by 5 s; P and K jam in his lips on "TWO", a window on
                               # his cheek, the dive into the side view
    ("section", "Say it slow"),  # his head from the side as glass: P pops at the lips, K at the back; speed up: both
    ("payoff", "That's why"),  # the stage again: five tries, the fifth falls apart
    ("lab", "MIT tried"),      # a speech lab, 2013: a volunteer... stops talking
    ("button", "Still talking"),  # the stage: still talking? faster; back into frame 1 (the pill over the last 2.4 s)
    ("loop", None),            # the last 0.45 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.45}

CHUNKS = [
    "Pad kid / poured curd", "pulled cod.",
    "Your turn.", "Five times, / fast.",
    "Tangled?",
    "Your mouth / tried to say", "TWO sounds / at once.",
    "Say it slow.", "P pops / at your LIPS...", "K, at / the BACK.",
    "Speed up,", "and your mouth / slips into", "an easier / rhythm:", "it fires / BOTH.",
    "That's why / the first", "one's easy...", "and the fifth / falls apart.",
    "MIT tried / this one", "on volunteers.", "Some just...", "stopped / talking.",
    "Still / talking?", "Then go / FASTER.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "pad": Y, "kid": C, "poured": Y, "curd": C, "pulled": Y, "cod": C,     # P words yellow, K words cyan (the picture's colours)
    "five": O, "fast": O, "tangled": V, "two": Y,
    "p": Y, "lips": Y, "k": C, "back": C,
    "easier": G, "both": O,
    "first": G, "easy": G, "fifth": R, "falls": R, "apart": R,
    "mit": B, "stopped": V, "faster": O,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, find = T.W, T.E, T.find
i_talk1 = find("stopped talking") + 1
i_talk2 = find("Still talking") + 1
cues = {
    # the hook: Jessica says it once; he rattles it faster on his own clock (hk_rate syllables a second from frame 1)
    "pad": W("Pad"), "kid": W("kid"), "poured": W("poured"), "curd": W("curd"), "pulled": W("pulled"), "cod": W("cod"),
    "cod_end": E("cod"), "your_turn": W("Your turn"), "turn_end": E("Your turn", 1), "five": W("Five"),
    "fast": W("fast"), "fast_end": E("fast"),
    "hk_rate": 4.5,                                # his words a second when he rattles it (scenes.js TW_WPS; 3 mouth shapes a word)
    "knot": E("fast") - 0.06,                      # his tongue ties itself in a knot (the twang in the gap after "fast.")
    "tangled": W("Tangled"), "tangled_end": E("Tangled"),
    "untie": E("Tangled") + 0.22,                  # the knot slurps back in
    "your_mouth": W("Your mouth"), "two": W("TWO"), "two_end": E("TWO"), "once": W("once"), "once_end": E("once"),
    "jam": W("say", 0, find("tried to say")) - 0.05,   # P and K squeeze into his lips together
    "pk_out": W("once") + 0.08,                    # ...and pop out as one: PK!
    "win": E("once") - 0.15,                       # the window on his cheek opens
    # the side view: slow, one at a time
    "say": W("Say it slow"), "slow_end": E("Say it slow", 2),
    "p": W("P"), "pops": W("pops"), "lips": W("LIPS"), "lips_end": E("LIPS"),
    "k": W("K"), "back": W("BACK"), "back_end": E("BACK"),
    # speed up: the beat gets faster, the lips and the back drift together, then fire as one
    "speed": W("Speed"), "up_end": E("Speed up", 1), "slips": W("slips"), "easier": W("easier"), "rhythm": W("rhythm"),
    "rhythm_end": E("rhythm"), "fires": W("fires"), "both": W("BOTH"), "both_end": E("BOTH"),
    # the payoff: five tries
    "thats": W("That's why"), "first": W("first"), "easy": W("easy"), "easy_end": E("easy"),
    "fifth": W("fifth"), "falls": W("falls"), "apart": W("apart"), "apart_end": E("apart"),
    # the lab
    "mit": W("MIT"), "volunteers": W("volunteers"), "vol_end": E("volunteers"), "some": W("Some"), "just": W("just"),
    "stopped": W("stopped"), "talking": T.ws[i_talk1], "talking_end": T.we[i_talk1],
    # the button
    "still": W("Still"), "talking2": T.ws[i_talk2], "then": W("Then"), "go": W("go", 0, find("Then go")),
    "faster": W("FASTER"), "faster_end": E("FASTER"),
}
# the slow beats: "P..." the lips shut and hold the air, "pops" they burst open; again on "LIPS". "K," the back of the
# tongue shuts against the roof and holds, then pops; again on "BACK" (shut spans [start, pop])
# the pops land in the gaps after the words (say it on the word, do it in the pause), so their sounds are heard whole
cues["shut_p"] = [[cues["p"] - 0.08, E("pops") + 0.02], [cues["lips"] - 0.1, E("LIPS") + 0.02]]
cues["shut_k"] = [[cues["k"] - 0.1, E("K") + 0.02], [cues["back"] - 0.15, E("BACK") + 0.02]]
cues["pops_p"] = [sp_[1] for sp_ in cues["shut_p"]]
cues["pops_k"] = [sk_[1] for sk_ in cues["shut_k"]]
# speed up: from "Speed" to "fires" the P and K pops alternate and the gap between them shrinks (0.42 s -> 0.13 s);
# from "fires" on, the lips and the back fire TOGETHER (both lists get the same times); the tip's "d" ticks after each
t, gap, k, sp, sk, sd, sb = cues["speed"] + 0.05, 0.42, 0, [], [], [], []
while t < cues["fires"] - 0.05:
    (sp if k % 2 == 0 else sk).append(round(t, 3))
    sd.append(round(t + gap * 0.5, 3))
    k += 1
    t += gap
    gap = max(0.13, gap * 0.9)
t = cues["fires"] + 0.02
while t < cues["both_end"] + 0.25:
    sb.append(round(t, 3))
    t += 0.22 if t < cues["both"] else 0.3
sb.append(round(cues["both"] + 0.02, 3))
sb = sorted(set(sb))
cues["fast_p"], cues["fast_k"], cues["fast_d"], cues["fast_both"] = sp, sk, sd, sb
cues["pk_big"] = E("BOTH") + 0.02                 # the big PK! after "BOTH." (the burst is up from "BOTH"; its pop here)
# the payoff's five tries (the bubbles): the first two clean, then worse, the fifth on "fifth" falls apart on "falls"
tr0, tr1 = cues["thats"] - 0.05, cues["fifth"] - 0.05
cues["tries"] = [round(tr0 + (tr1 - tr0) * j / 4, 3) for j in range(5)]
# the lab: his waveform runs until "just", then flat
cues["flat"] = cues["just"] + 0.12

assert cues["knot"] < cues["tangled"] < cues["jam"] < cues["two"] < cues["pk_out"] < cues["win"] < cues["say"]
assert cues["p"] < cues["lips"] < cues["k"] < cues["back"] < cues["speed"] < cues["fires"] < cues["both"]
assert cues["first"] < cues["fifth"] < cues["falls"] < cues["mit"] < cues["some"] < cues["stopped"] < cues["talking"] < cues["still"] < cues["talking2"]

T.write(shots, caps, cues)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print(f'fast pops: {len(sp)} P, {len(sk)} K, then {len(sb)} together')
