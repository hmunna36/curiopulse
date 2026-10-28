"""Edit timeline for the Why Do You See a GREEN Dot That Isn't There? 👁️ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: "Now..." and his eyes go back up to the cross (the loop)

W, E, ev, find = T.W, T.E, T.ev, T.find
ws, we = T.ws, T.we

# word indexes of the repeated words (assert the order below)
i_green1 = find("GREEN dot")                    # hook: "See a GREEN dot"
i_green2 = find("green", i_green1 + 1)          # answer: "no green on your screen"
i_green3 = find("GREEN", i_green2 + 1)          # tired: "...the opposite. GREEN."
i_eyes1 = find("Your eye's faking")             # answer
i_eyes2 = find("Your eye's sick")               # tired
i_pink1 = find("pink dots")                     # stare
i_pink2 = find("pink", i_pink1 + 1)             # tired: "sick of pink."
i_blink1 = find("blink")                        # stare: "Don't blink..."
i_blink2 = find("blinks off")                   # tired
i_blink3 = find("So blink") + 1                 # button: the "blink" of "So blink."
i_keep1 = find("Keep your eyes")                # hook
i_keep2 = find("Keep staring")                  # stare
i_your3 = find("Your brain")                    # paint
# "See" (hook): the alignment gives it 2.05-2.17 s, which is mostly its "s" (above the speech band) and the silence before
# it; the vowel runs 2.20-2.30 (T.bursts). Put the word over its sound so its caption and the QA's window are right.
i_see = find("See a")
T.ws[i_see] = T.words[i_see]["start"] = 2.10
T.we[i_see] = T.words[i_see]["end"] = 2.29
T.ws[i_see + 1] = T.words[i_see + 1]["start"] = 2.29

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. Every id has an SC.<id> in web/.
SHOTS = [
    ("hook", None),       # THE TEST on the screen itself: 12 blurry pink dots round a black cross on plain grey, one dot
                          # off at a time, round and round (the lilac chaser: Hinton 2005). The hiker is close below it,
                          # head and shoulders in grey fog, his eyes locked UP on the cross, doing the test with us.
                          # The test runs untouched until 13.6 s ("Keep staring. Don't blink..."): no cut, no label
                          # near the ring; his gags stay down in his face (suspicion, watering eyes, a tear, awe)
    ("eye", None),        # "Your eye's sick of pink.": the test shrinks into a window at the top (still running) and a
                          # round window on his eye opens into the eye cut in half: the back wall's team of little
                          # sensors, the PINK ones asleep (zzz) under a pink beam, the GREEN ones fresh. "A dot blinks
                          # off..." the beam goes grey; the pink team snores on, the green team jumps up: "GREEN!"
    ("paint", "And blurry"),  # the brain under its WHAT YOU SEE screen (the ring): bored, it rolls grey paint over the
                              # blurry pink dots one by one; only the cross is left
    ("weird", "A scientist"),  # 1950s, old film: him in a chin rest, a lab hand plops a suction cup with a little
                               # picture on a stalk onto his eye; WHAT HE SEES: the picture fades to grey; a stopwatch
    ("button", None),     # back in the fog: "So blink." a huge blink; "They're back." eyes pop open, grin; "Now..." his
                          # eyes go back up to the cross: the last frames are frame 1's picture (the loop)
]
special = {"eye": ws[i_eyes2] - 0.06, "button": W("So blink") - 0.10}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
# During the test the captions sit just under the ring (post.capY), short, so the eye stays near the cross.
CHUNKS = [
    "Keep your / eyes", "on the / cross.", "See a / GREEN dot", "running / round?",
    "There's / no green", "on your / screen.", "Your eye's / faking it.",
    "Keep / staring.", "Don't / blink...", "The pink / dots...", "fade / away.",
    "Your eye's / sick of pink.", "A dot / blinks off...", "you see / the opposite.", "GREEN.",
    "And blurry / things", "that never / change?", "Your brain / just...", "paints / over them.",
    "A scientist / once", "suction-cupped / a picture", "onto people's / eyeballs.", "Gone...", "in seconds.",
    "So blink.", "They're / back.", "Now...",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white.
# NO GREEN anywhere until the payoff word: the answer says "There's no green on your screen" and it must be true.
# "green" stays white in the hook and the answer; only the last GREEN (the tired block) is coloured, below.
COLOR = {
    "cross": Y, "pink": PK, "dots": PK, "faking": O, "staring": Y, "blink": R, "fade": V, "away": V,
    "sick": R, "opposite": Y, "blurry": V, "change": V, "paints": O, "scientist": Y, "suction-cupped": O,
    "eyeballs": Y, "gone": R, "seconds": O, "back": Y,
}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
# the only coloured GREEN: the payoff word in the eye shot (the first green pixel of the Short)
_g_at = round(ws[i_green3] - 0.03, 3)
for cp in caps:
    for ln in cp["lines"]:
        for w in ln:
            if w["t"] == "GREEN" and abs(w["at"] - _g_at) < 1e-6:
                w["c"] = G

cues = {
    # the hook: the test
    "keep1": ws[i_keep1], "cross": W("cross."), "cross_end": E("cross."), "see": W("See a"),
    "green1": ws[i_green1], "running": W("running"), "round_end": E("round?"),
    # the answer
    "theres": W("There's"), "green2": ws[i_green2], "screen": W("screen."), "screen_end": E("screen."),
    "eyes1": ws[i_eyes1], "faking": W("faking"), "faking_end": E("faking it", 1),
    # stare: don't blink, the pink dots fade
    "keep2": ws[i_keep2], "staring_end": E("staring."), "dont": W("Don't"), "blink1": ws[i_blink1],
    "blink1_end": we[i_blink1], "the_pink": W("The pink"), "pink1": ws[i_pink1], "dots_end": E("dots..."),
    "fade": W("fade"), "away_end": E("away."),
    # tired: inside the eye
    "eyes2": ws[i_eyes2], "sick": W("sick"), "pink2": ws[i_pink2], "pink2_end": we[i_pink2],
    "a_dot": W("A dot"), "blinks": ws[i_blink2], "off_end": E("off..."), "you_see": W("you see"),
    "opposite": W("opposite."), "opposite_end": E("opposite."), "green3": ws[i_green3], "green3_end": we[i_green3],
    # paint
    "and_blurry": W("And blurry"), "blurry": W("blurry"), "never": W("never"), "change_end": E("change?"),
    "your_brain": ws[i_your3], "just": W("just..."), "paints": W("paints"), "over": W("over them"),
    "them_end": E("them."),
    # weird: the suction cup
    "scientist": W("scientist"), "once": W("once"), "cupped": W("suction-cupped"), "cupped_end": E("suction-cupped"),
    "picture": W("picture"), "onto": W("onto"), "eyeballs": W("eyeballs."), "eyeballs_end": E("eyeballs."),
    "gone": W("Gone..."), "gone_end": E("Gone..."), "in_seconds": W("in seconds"), "seconds_end": E("seconds."),
    # the button
    "so": W("So blink"), "blink3": ws[i_blink3], "blink3_end": we[i_blink3], "theyre": W("They're"),
    "back_end": E("back."), "now": W("Now..."), "now_end": E("Now..."),
}
# the test's clock: one dot is off at a time, the gap stepping clockwise every LC_STEP frames (the lilac chaser runs a
# lap in about 1.6 s). In the button shot the clock runs from the end so that the last frame's gap is the one just
# before frame 1's (the loop goes round without a jump).
cues["lc_step"] = 4
cues["lc_n"] = 12
cues["order_ok"] = 1
assert i_green1 < i_green2 < i_green3 and i_eyes1 < i_eyes2 and i_pink1 < i_pink2 and i_blink1 < i_blink2 < i_blink3
assert cues["cross"] < cues["green1"] < cues["theres"] < cues["faking"] < cues["keep2"] < cues["dont"] < cues["fade"]
assert cues["fade"] < cues["eyes2"] < cues["a_dot"] < cues["opposite"] < cues["green3"] < cues["and_blurry"] < cues["paints"]
assert cues["paints"] < cues["scientist"] < cues["cupped"] < cues["gone"] < cues["in_seconds"] < cues["so"] < cues["theyre"] < cues["now"]
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s
# before the end) and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says
# "subscribe" in either arm; the ask also lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
_greens = [(w["t"], cp["start"]) for cp in caps for ln in cp["lines"] for w in ln if w["c"] == G]
print(f'green caption words: {_greens} (only the payoff GREEN, after the test)')
