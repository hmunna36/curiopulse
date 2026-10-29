"""Edit timeline for the The Planet Where It Rains GLASS Sideways ☔ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.9)  # after "umbrella.": he pops a fresh umbrella open and the Short loops into frame 1

W, E, ev, find = T.W, T.E, T.ev, T.find


def _move(i, a, b):
    T.ws[i] = T.words[i]["start"] = round(a, 3)
    T.we[i] = T.words[i]["end"] = round(b, 3)


def _shift(phrase, d, s=0):
    """move every word of `phrase` by d seconds (v3's alignment runs a little early in a few blocks)"""
    i = find(phrase, s)
    for k in range(len(phrase.split())):
        _move(i + k, T.ws[i + k] + d, T.we[i + k] + d)


# the alignment against the speech-band bursts (29 Oct 2026): these words sat 0.08-0.2 s before the voice
_shift("and comes down", 0.08)
_shift("So the", 0.1)
_shift("falls SIDEWAYS", 0.09)
T.retime("It also stinks", 27.2, 28.5)
_shift("The furnace", 0.06)

SHOTS = [
    ("hook", None),       # TIGHT on him in a balloon basket under his yellow umbrella, the glass already flying in from the
                          # upper left (frame 0 = the loop's last picture); "Shredded.": the canopy tears to rags, bare spokes
    ("sky", None),        # THE ANSWER: pull back and up past the spokes: the sky over the balloon is glass: the cloud decks
                          # glitter, beads condense and fall; "GLASS factory": a FACTORY tag pops on the clouds
    ("furnace", None),    # THE ONE PICTURE: "The furnace?": he looks up; the camera swings to the STAR: huge, RIGHT there;
                          # "Rock steams up": glowing vapour rises out of the deep below the balloon; "comes down as glass":
                          # it turns to beads that rain back past him
    ("wind", None),       # close: "the wind hits": the gust slams in (scarf, tilt, the rain goes flat); "bullet": a cartoon
                          # bullet zips across and a glass bead overtakes it (8,700 KM/H)
    ("side", None),       # "So the glass falls...": he holds the bare spokes up sideways like a shield; "SIDEWAYS": the beads
                          # go straight through it
    ("space", None),      # THE PULL-BACK: up through the decks into space: the planet, deep azure, beside its huge star;
                          # "BLUE" lands on the whole planet; "Pretty, right?" holds on it
    ("eggs", None),       # back to him: "stinks": green haze; "EGGS": he goes to pinch his nose and his fingers CLONK on the glass
    ("button", None),     # "Lovely planet.": deadpan thumbs-up; "Pack an umbrella.": he pulls a fresh one out of the basket
    ("loop", None),       # the last 0.45 s: the hook at negative time (the new umbrella pops open into frame 1)
]
DUR = T.duration
special = {
    "sky": W("This") - 0.1,
    "furnace": W("The furnace") - 0.1,
    "wind": W("Then") - 0.08,
    "side": W("So the") - 0.08,
    "space": W("From space") - 0.08,
    "eggs": W("It also") - 0.1,
    "button": W("Lovely") - 0.1,
    "loop": DUR - 0.45,
}

CHUNKS = [
    "It rains / GLASS here.",
    "Your umbrella?",
    "Shredded.",
    "This whole / sky is",
    "one big...",
    "GLASS / factory.",
    "The furnace?",
    "Its star.",
    "It's RIGHT / there.",
    "Rock / steams up...",
    "and comes / down",
    "as glass.",
    "Then the / wind hits.",
    "Faster than / a bullet.",
    "So the glass / falls...",
    "SIDEWAYS.",
    "From space,",
    "scientists / think",
    "all that glass / makes it...",
    "BLUE.",
    "Pretty, / right?",
    "It also / stinks...",
    "of rotten",
    "EGGS.",
    "Lovely / planet.",
    "Pack an / umbrella.",
]
Y, O, C, R, G, B_, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
COLOR = {"glass": C, "shredded": R, "factory": O, "furnace": O, "star": Y, "right": Y, "rock": O, "steams": O,
         "wind": S, "bullet": R, "sideways": Y, "space": V, "blue": B_, "pretty": PK, "stinks": G, "eggs": G,
         "lovely": PK, "umbrella": Y}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
sh = {s["id"]: s for s in shots}

iG2 = find("GLASS factory")
iG3 = find("as glass") + 1
iG4 = find("So the glass") + 2
iG5 = find("that glass") + 1
iU2 = find("an umbrella") + 1
iRight2 = find("Pretty right") + 1
cues = {
    "it": W("It rains"), "rains": W("rains"), "glass1": W("GLASS"), "glass1_end": E("GLASS"), "here": W("here"),
    "here_end": E("here"), "your": W("Your"), "umbrella1": W("umbrella"), "umbrella1_end": E("umbrella"),
    "shredded": W("Shredded"), "shredded_end": E("Shredded"),
    "this": W("This"), "sky": W("sky"), "big": W("big"), "big_end": E("big"), "glass2": T.ws[iG2], "factory": W("factory"),
    "factory_end": E("factory"),
    "the_furnace": W("The furnace"), "furnace": W("furnace"), "furnace_end": E("furnace"), "its": W("Its star"),
    "star": W("star"), "star_end": E("star"), "its2": W("It's RIGHT"), "right": W("RIGHT"), "there": W("there"),
    "there_end": E("there"),
    "rock": W("Rock"), "steams": W("steams"), "up": W("up"), "up_end": E("up"), "and": W("and comes"), "comes": W("comes"),
    "down": W("down"), "glass3": T.ws[iG3], "glass3_end": T.we[iG3],
    "then": W("Then"), "wind": W("wind"), "hits": W("hits"), "hits_end": E("hits"), "faster": W("Faster"),
    "bullet": W("bullet"), "bullet_end": E("bullet"),
    "so": W("So the"), "glass4": T.ws[iG4], "falls": W("falls"), "falls_end": E("falls"), "sideways": W("SIDEWAYS"),
    "sideways_end": E("SIDEWAYS"),
    "from": W("From"), "space": W("space"), "scientists": W("scientists"), "glass5": T.ws[iG5], "makes": W("makes"),
    "makes_end": E("makes it", 1), "blue": W("BLUE"), "blue_end": E("BLUE"),
    "pretty": W("Pretty"), "right2": T.ws[iRight2], "right2_end": T.we[iRight2], "it2": W("It also"), "stinks": W("stinks"),
    "stinks_end": E("stinks"), "of": W("of rotten"), "rotten": W("rotten"), "eggs": W("EGGS"), "eggs_end": E("EGGS"),
    "lovely": W("Lovely"), "planet": W("planet"), "planet_end": E("planet"), "pack": W("Pack"),
    "umbrella2": T.ws[iU2], "umbrella2_end": T.we[iU2],
    "end": DUR,
}
c = cues
assert c["glass1"] < c["shredded"] < c["glass2"] < c["glass3"] < c["glass4"] < c["glass5"] < c["umbrella2"]
cues.update({
    "first_hits": 0.25,                                  # beads already pinging off the canopy on frame 1
    "holes": c["glass1"] + 0.1,                          # punctures start on "GLASS"
    "tear": c["shredded"] - 0.12,                        # the canopy tears to rags on "Shredded"
    "tear_done": c["shredded_end"] - 0.05,
    "factory_tag": c["factory"] - 0.04,                  # the FACTORY sign pops on the cloud deck
    "look_up": c["the_furnace"] + 0.05,                  # he looks up for the furnace
    "swing": c["furnace_end"] - 0.15,                    # the camera swings up to the star
    "star_hit": c["star"] + 0.05,                        # the star fills the frame: WHOOM
    "right_k": c["right"],                               # RIGHT there: a push in (and his visor auto-darkens)
    "steam_in": c["rock"] - 0.1,                         # the deep glows, the vapour rises
    "condense": c["comes"] - 0.05,                       # beads pop out of the vapour and fall
    "gust": c["hits"] - 0.03,                            # the wind slams in
    "bullet_in": c["faster"] - 0.05,                     # the bullet zips in from the left
    "overtake": c["bullet"] + 0.08,                      # a glass bead passes it; it sweats
    "shield": c["so"] + 0.05,                            # he turns the bare spokes to face the wind
    "through": c["sideways"] - 0.02,                     # SIDEWAYS: the beads go right through the spokes
    "pull": c["from"] - 0.05,                            # the pull-back starts
    "planet_full": c["blue"] - 0.05,                     # the whole planet in frame, deep blue
    "sniff": c["stinks"] + 0.1,                          # he sniffs; green haze drifts in
    "pinch": c["eggs_end"] - 0.3,                        # he goes to pinch his nose (while she says EGGS)...
    "clonk": c["eggs_end"] + 0.04,                       # ...and his fingers CLONK on the glass, in the pause after the word
    "thumbs": c["lovely"] + 0.05,                        # deadpan thumbs-up
    "pull_out": c["pack"] - 0.05,                        # a fresh umbrella comes out of the basket
    "pop": DUR - 0.42,                                   # it pops open (in the loop shot) into frame 1
})
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself and drops them otherwise. This Short: 3 Nov 11:30, "none".
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the claim, with "your" in it)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s in shots:
    print(f'  shot {s["id"]:8s} {s["start"]:6.2f} -> {s["end"]:6.2f}  ({s["end"] - s["start"]:.2f} s)')
