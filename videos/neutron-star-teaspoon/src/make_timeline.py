"""Edit timeline for the How Much Does a Teaspoon of NEUTRON Star Weigh? 🥄 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Every Short is 30-35 s since 16 Oct 2026: keep it short,
#                                      so the loop comes before the thumb does.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),          # frame 1: tight on his hand lifting a heaped, glowing teaspoon from the NEUTRON STAR jar over his
                             # steaming mug at a mountain campsite at dusk; on "a MOUNTAIN" the camera whips up to the peak
    ("crash", None),         # in the pause after MOUNTAIN: the spoon's weight switches on and it smashes through the table
    ("star", "NEUTRON star"),         # space: he scoops the spoonful off a spinning neutron star (beams sweeping)
    ("sun", "Picture more than"),    # the Sun, huge, starts to cave in
    ("city", "crushed to the size"), # ...down to a blinding ball hanging over a night city, as wide as the city
    ("atoms", "Atoms are mostly"),   # an atom as an empty stadium at night: a pea on the centre spot, a tumbleweed
    ("gone", "and that crush"),      # the stands fold in onto the pea: peas packed solid, the stuff in the spoon
    ("payoff", "So one spoonful"),   # back at camp: he heaves at the spoon stuck in the ground; spoon = mountain
    ("weird", "Oh, and here"),       # the blob swells and crackles in the spoon; he leans in, then backs off
    ("blast", None),                 # after EXPLODE: white flash, the blast across the valley; then him, sooty, deadpan
    ("button", "Anyway"),            # he shakes the soot off and dips a new spoon in the jar: back to frame 1 (the loop).
                                     # The pill arm: the silent pill over the last 2.4 s; hand, spoon and face above y 1050
]
special = {"crash": T.E("MOUNTAIN") + 0.03, "blast": T.E("EXPLODE") - 0.02}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "How much / do you think",
    "this teaspoon / weighs?",
    "About as / much as...",
    "a MOUNTAIN.",
    "It's a scoop of",
    "NEUTRON star.",
    "Picture more / than our",
    "whole Sun...",
    "crushed to / the size",
    "of a city.",
    "Atoms are mostly / empty space...",
    "and that crush / squeezes",
    "the empty space / right out.",
    "So one spoonful...",
    "weighs a / mountain.",
    "Oh, and here / on Earth?",
    "It wouldn't stay / in the spoon.",
    "It would / EXPLODE.",
    "Anyway...",
    "one spoon, / or two?",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"teaspoon": Y, "weighs": Y, "mountain": Y, "neutron": C, "star": C, "sun": O, "city": B, "empty": V,
         "space": V, "crush": O, "spoonful": Y, "earth": G, "explode": R, "spoon": Y, "two": Y}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
# the answer's "a" is aligned into the pause before MOUNTAIN: put it on its own burst of speech
cues = {
    "think": W("think"), "teaspoon": W("teaspoon"), "weighs": W("weighs"), "weighs_end": E("weighs"),
    "about": W("About"), "much2": W("much as"), "as2": W("as...", s=find("About") or 0), "a_mtn": W("a MOUNTAIN"),
    "mountain": W("MOUNTAIN"), "mountain_end": E("MOUNTAIN"),
    "scoop": W("scoop"), "neutron": W("NEUTRON"), "neutron_end": E("star."),
    "picture": W("Picture"), "sun": W("Sun"), "sun_end": E("Sun"), "crushed": W("crushed"), "size": W("size"),
    "city": W("city"), "city_end": E("city"),
    "atoms": W("Atoms"), "mostly": W("mostly"), "empty1": W("empty space"), "space1_end": E("empty space", 1),
    "crush2": W("and that crush"), "squeezes": W("squeezes"), "empty2": W("the empty space right"), "right": W("right out"),
    "out_end": E("right out", 1),
    "spoonful": W("spoonful"), "weighs2": W("weighs a mountain"), "mountain2": W("mountain", s=find("weighs a mountain")), "mountain2_end": E("weighs a mountain", 2),
    "oh": W("Oh, and"), "earth": W("Earth"), "stay": W("wouldn't stay"), "spoon_w": W("in the spoon"), "spoon_w_end": E("in the spoon", 2),
    "would": W("It would EXPLODE"), "explode": W("EXPLODE"), "explode_end": E("EXPLODE"),
    "anyway": W("Anyway"), "anyway_end": E("Anyway"), "one_spoon": W("one spoon"), "two": W("two"), "two_end": E("two"),
}
cues["blast"] = shots_start = None
cues.pop("blast")
order = ["think", "teaspoon", "weighs", "about", "a_mtn", "mountain", "mountain_end", "scoop", "neutron", "picture", "sun",
         "crushed", "city", "atoms", "empty1", "crush2", "squeezes", "empty2", "spoonful", "weighs2", "mountain2", "oh", "earth", "stay",
         "spoon_w", "would", "explode", "explode_end", "anyway", "one_spoon", "two"]
for x, y in zip(order, order[1:]):
    assert cues[x] < cues[y], (x, cues[x], y, cues[y])
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
