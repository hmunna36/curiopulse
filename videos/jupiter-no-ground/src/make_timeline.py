"""Edit timeline for the If You Fell Into JUPITER, You'd Never Hit the Ground 🪐 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.2)  # seconds after the last word: his nod, the dive and the whip back up to frame 1 (the loop)


# v3's alignment puts a block's first word(s) a little early (the breath before a word is given to the word). Move such a
# word onto the first speech-band burst after its aligned start (mirror-eyes, 24 Oct 2026: `_onto_burst`).
def _onto_burst(i, span=0.3, thr=-34.0, after=None):
    t0 = T.ws[i] - 0.02 if after is None else after
    b = T.bursts(t0, T.ws[i] + span, thr=thr)
    if b and b[0][0] - 0.03 > T.ws[i] + 0.04:
        T.ws[i] = T.words[i]["start"] = round(b[0][0] - 0.03, 3)


for _ph in ["If you", "Jupiter has", "The deeper", "the thicker", "Like soup", "NASA actually", "It lasted", "Oh, and",
            "Still want"]:
    _onto_burst(T.find(_ph))

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
# THE CURIOUS KIND (story.md §6): the hero goes there. He skydives into Jupiter in a blue spacesuit and a glass helmet,
# filming a selfie on a stick, and never lands.
SHOTS = [
    ("hook", None),            # frame 1: TIGHT on him skydiving above Jupiter's cloud tops, grinning into the selfie phone on
                               # its stick (top left), thumbs-up; "Jupiter": the whip out to the whole planet, him a speck
                               # (YOU); "you'd never hit the GROUND": the dive back in, onto the cloud tops; landing stance
    ("answer", "Jupiter has"), # the cloud tops from above rise to his boots... "no floor.": POOF, through (a him-shaped hole);
                               # "Just sky...": between decks, the next one rising: POOF; "and more sky.": POOF again
    ("thick", "The deeper"),   # THE ONE PICTURE: under the last deck (lightning in its underside), the gas gets thicker: the
                               # haze closes in, his fall slows, the gauge AIR -> SOUP -> SYRUP -> OCEAN appears, its marker sinking
    ("ladder", "Like soup"),   # "soup": noodles, carrot coins and peas drift up past him (a noodle lands on his helmet);
                               # "syrup": amber, everything in slow motion, a stack of pancakes floats by; "a hot, dark ocean":
                               # dark red, a glow from below, sweat in his helmet; "Still no splash.": he braces, pinches the
                               # helmet where his nose is... nothing. One eye opens.
    ("probe", "NASA actually"),# the real thing: the haze between the decks, NASA's probe on its parachute sinks past him
                               # (NASA PROBE · 1995); "fifty-eight minutes": the clock runs to 58:00; "crushed." CRUNCH (in the pause)
    ("weird", "Oh, and"),      # deeper, dark: lightning flickers in the decks far above; "might rain...": the first glints;
                               # "DIAMONDS.": a shower of them, TINK on his helmet; DIAMOND RAIN? with a MAYBE stamp
    ("button", "Still want"),  # he holds a diamond up to his selfie phone, grins, nods: yes. Then the whip up to the start
    ("loop", None),            # the hook at negative time: the last frames ARE frame 1's picture
]
special = {"loop": T.duration - 0.45}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "If you fell / into Jupiter,",
    "you'd never / hit the GROUND.",
    "Jupiter has / no floor.",
    "Just sky...",
    "and more sky.",
    "The deeper / you fall,",
    "the thicker / that sky gets.",
    "Like soup...",
    "then syrup...",
    "then a hot, / dark ocean.",
    "Still no splash.",
    "NASA actually / dropped a probe in.",
    "It lasted / fifty-eight minutes...",
    "then got crushed.",
    "Oh, and / deeper down?",
    "Some scientists / think it might rain...",
    "DIAMONDS.",
    "Still want / to jump?",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"jupiter": O, "ground": Y, "floor": Y, "sky": C, "deeper": O, "thicker": O, "soup": O, "syrup": Y, "ocean": R,
         "splash": C, "nasa": B, "probe": B, "58": Y, "minutes": Y, "crushed": R, "diamonds": S, "jump": Y}
DISPLAY = {"fifty-eight": ["58"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_j2 = find("Jupiter", find("GROUND"))       # the second "Jupiter" ("Jupiter has no floor")
_sky1 = find("sky", find("Just"))           # "Just sky..."
_sky2 = find("sky", find("more"))           # "and more sky."
_sky3 = find("sky", find("thicker"))        # "the thicker that sky gets."
_then1 = find("then", find("soup"))         # "then syrup"
_then2 = find("then", find("syrup"))        # "then a hot"
_still1 = find("Still", find("ocean"))      # "Still no splash."
_still2 = find("Still", find("DIAMONDS"))   # "Still want to jump?"
_deeper2 = find("deeper", find("Oh"))       # "deeper down?"
cues = {
    # the hook: the selfie, the whip out to the planet, the dive back in
    "if": W("If you"), "fell": W("fell"), "into": W("into"), "jupiter": W("Jupiter", s=0), "jupiter_end": E("Jupiter", s=0),
    "youd": W("you'd"), "never": W("never"), "hit": W("hit"), "ground": W("GROUND"), "ground_end": E("GROUND"),
    # the answer: POOF, POOF, POOF
    "jupiter2": T.ws[_j2], "has": W("has"), "no": W("no floor"), "floor": W("floor"), "floor_end": E("floor"),
    "just": W("Just"), "sky1": T.ws[_sky1], "sky1_end": T.words[_sky1]["end"], "and": W("and more"), "more": W("more"),
    "sky2": T.ws[_sky2], "sky2_end": T.words[_sky2]["end"],
    # thicker
    "the": W("The deeper"), "deeper": W("deeper"), "fall": W("fall,"), "fall_end": E("fall,"), "thicker": W("thicker"),
    "sky3": T.ws[_sky3], "gets": W("gets"), "gets_end": E("gets"),
    # the ladder
    "like": W("Like"), "soup": W("soup"), "soup_end": E("soup"), "then1": T.ws[_then1], "syrup": W("syrup"), "syrup_end": E("syrup"),
    "then2": T.ws[_then2], "hot": W("hot"), "dark": W("dark"), "ocean": W("ocean"), "ocean_end": E("ocean"),
    "still1": T.ws[_still1], "nosplash": W("no splash"), "splash": W("splash"), "splash_end": E("splash"),
    # the probe
    "nasa": W("NASA"), "actually": W("actually"), "dropped": W("dropped"), "probe": W("probe"), "probe_end": E("probe"),
    "in": W("in.", s=find("probe")), "in_end": E("in.", s=find("probe")),
    "it": W("It lasted"), "lasted": W("lasted"), "fiftyeight": W("fifty-eight"), "minutes": W("minutes"), "minutes_end": E("minutes"),
    "then3": W("then got"), "got": W("got"), "crushed": W("crushed"), "crushed_end": E("crushed"),
    # the weird fact
    "oh": W("Oh"), "oh_end": E("Oh"), "deeper2": T.ws[_deeper2], "down": W("down"), "down_end": E("down"),
    "some": W("Some"), "scientists": W("scientists"), "think": W("think"), "might": W("might"), "rain": W("rain"),
    "rain_end": E("rain"), "diamonds": W("DIAMONDS"), "diamonds_end": E("DIAMONDS"),
    # the button
    "still2": T.ws[_still2], "want": W("want"), "jump": W("jump"), "jump_end": E("jump"),
}
cues["loop"] = special["loop"]
for a, b in [("if", "jupiter"), ("jupiter", "youd"), ("youd", "ground"), ("ground_end", "jupiter2"), ("floor_end", "just"),
             ("sky1_end", "and"), ("sky2_end", "the"), ("fall", "thicker"), ("gets_end", "like"), ("soup_end", "then1"),
             ("syrup_end", "then2"), ("ocean_end", "still1"), ("splash_end", "nasa"), ("in_end", "it"), ("minutes_end", "then3"),
             ("crushed_end", "oh"), ("down_end", "some"), ("rain_end", "diamonds"), ("diamonds_end", "still2"),
             ("jump_end", "loop")]:
    assert cues[a] < cues[b], f"cue order: {a} {cues[a]} !< {b} {cues[b]}"
# the beats in the gaps (say it on the word, do it in the pause): the three POOFs, the CRUNCH, the TINK
cues["poof1"] = cues["floor_end"] + 0.05
cues["poof2"] = cues["sky1_end"] + 0.06
cues["poof3"] = cues["sky2_end"] + 0.05
cues["crunch"] = cues["crushed_end"] + 0.04
cues["tink"] = cues["diamonds_end"] + 0.06
cues["nod"] = cues["jump_end"] + 0.07
cues["whip"] = cues["loop"] - 0.42
assert cues["poof1"] < cues["just"] - 0.15 and cues["poof2"] < cues["and"] - 0.12 and cues["poof3"] < cues["the"] - 0.1
assert cues["crunch"] < cues["oh"] - 0.25 and cues["tink"] < cues["still2"] - 0.2
assert cues["nod"] < cues["whip"] < cues["loop"]
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] /
# ["sub_out"] here. Nobody says "subscribe" in either arm; the ask lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the curious kind: the claim, said to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ' '.join(f'{s["id"]} {s["start"]:.2f}' for s in shots))
print('beats:', ' '.join(f'{k} {cues[k]:.2f}' for k in ["poof1", "poof2", "poof3", "crunch", "tink", "nod", "whip", "loop"]))
