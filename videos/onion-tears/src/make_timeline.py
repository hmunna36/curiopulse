"""Edit timeline for the Why Do Onions Make You CRY? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.5)  # seconds after the last word: the button beat (a held look, a last gag, the loop)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),                 # TV-chef chopping at the kitchen counter; the eyes start to water
    ("sob", None),                  # hard cut on SOBBING: tear fountains, title
    ("react", "It's an onion"),     # deadpan: the smug onion on the board
    ("trap", "Here's the thing"),   # dive into the onion: brick wall of cells, one is a booby trap
    ("rooms", "Two chemicals"),     # one cell cut open: two rooms, the knife smashes the wall
    ("mix", "They mix"),            # enzyme #1 -> sulfur compound, enzyme #2 -> tear gas
    ("name", "Its real name"),      # the long name on a label card, molecule
    ("bless", None),                # hard cut: a tissue for the hero
    ("eyes", "It floats up"),       # gas rises to the eye, lands, pings the corneal nerves
    ("brain", "Your brain yells"),  # DANGER alarm, the tear gland floods the eye
    ("rinse", "So you're not"),     # deadpan hero, tears pouring: RINSE CYCLE
    ("spray", "And it gets"),       # high-speed camera: droplet outburst, 60 cm ruler
    ("blunt", "A blunt knife"),     # blunt blade squish, then TV chef = droplet fountain, MORE
    ("button", "So sharp knife"),   # sharp knife, slow cuts... the onion wins (crown); holds under the subscribe cue
]
special = {"sob": T.W("SOBBING") - 0.05, "bless": T.W("Bless") - 0.22}

CHUNKS = [
    "You're chopping / an onion", "like a TV chef", "chop chop chop",
    "and suddenly / you're", "SOBBING",
    "It's an onion", "Nobody died",
    "Here's the thing", "Every onion cell", "is a tiny / booby trap",
    "Two chemicals", "kept in / separate rooms", "until your knife", "smashes the wall",
    "They mix", "an enzyme makes", "a sulfur compound", "then a SECOND / enzyme", "turns it into", "tear gas",
    "Its real name", "Propanethial / S-oxide",
    "Bless you",
    "It floats up", "lands on your eyes", "and pings / the nerves there", "Your brain yells", "DANGER",
    "and floods / your eyes", "to wash it out",
    "So you're / not crying", "You're", "rinsing",
    "And it gets / weirder", "High-speed cameras", "caught onions / spraying", "tiny droplets", "up to sixty / centimeters", "high",
    "A blunt knife", "or chopping fast", "like a TV chef", "sprays way", "MORE",
    "So sharp knife", "slow cuts", "or just let / the onion win",
    "Tomorrow", "why yawning / is contagious", "Subscribe", "you're yawning / already",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {
    "onion": Y, "chef": O, "chop": O, "sobbing": C, "died": R, "booby": R, "trap": R, "cell": Y,
    "chemicals": V, "separate": V, "rooms": V, "knife": B, "smashes": R, "wall": R, "mix": O,
    "enzyme": O, "sulfur": Y, "compound": Y, "second": G, "tear": G, "gas": G,
    "propanethial": G, "s-oxide": G, "bless": C, "floats": G, "eyes": C, "nerves": O, "brain": P["P"],
    "danger": R, "floods": C, "wash": C, "crying": C, "rinsing": C, "weirder": Y, "high-speed": B,
    "spraying": C, "droplets": C, "sixty": Y, "centimeters": Y, "high": Y, "blunt": R, "fast": O,
    "more": R, "sharp": G, "slow": G, "cuts": G, "win": Y, "yawning": V, "contagious": V, "subscribe": R,
}
DISPLAY = {"sixty": ["60"], "centimeters": ["CM"]}

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
cues = {
    "chopping": W("chopping"), "onion0": W("onion"), "tv": W("TV"), "chef": W("chef"),
    "chops": [T.ws[find("chop chop chop") + k] for k in range(3)], "suddenly": W("suddenly"), "sobbing": W("SOBBING"), "sobbing_end": E("SOBBING"),
    "its_onion": W("It's"), "nobody": W("Nobody"), "died": W("died"), "died_end": E("died"),
    "heres": W("Here's"), "every": W("Every"), "cell": W("cell"), "tiny": W("tiny"), "booby": W("booby"), "trap_w": W("trap"),
    "two": W("Two"), "chemicals": W("chemicals"), "separate": W("separate"), "rooms_w": W("rooms"), "until": W("until"),
    "knife1": W("knife"), "smashes": W("smashes"), "wall": W("wall"),
    "mix_w": W("mix"), "enzyme1": W("enzyme"), "sulfur": W("sulfur"), "compound": W("compound"),
    "second": W("SECOND"), "enzyme2": W("enzyme", 0, find("SECOND")), "turns": W("turns"), "into": W("into"), "tear": W("tear"), "gas": W("gas"),
    "name_w": W("name"), "prop": W("Propanethial"), "soxide": W("S-oxide"), "soxide_end": E("S-oxide"),
    "bless": W("Bless"), "bless_end": E("you", 0, find("Bless")),
    "floats": W("floats"), "lands": W("lands"), "eyes1": W("eyes"), "pings": W("pings"), "nerves": W("nerves"),
    "brain": W("brain"), "yells": W("yells"), "danger": W("DANGER"), "floods": W("floods"), "wash": W("wash"),
    "so_rinse": W("So you're"), "crying": W("crying"), "youre2": W("You're rinsing"), "rinsing": W("rinsing"), "rinsing_end": E("rinsing"),
    "weirder": W("weirder"), "highspeed": W("High-speed"), "caught": W("caught"), "spraying": W("spraying"),
    "droplets": W("droplets"), "sixty": W("sixty"), "high": W("high"),
    "blunt": W("blunt"), "or_chop": W("or chopping"), "fast": W("fast"), "tv2": W("TV", 0, find("or chopping")), "sprays": W("sprays"), "more": W("MORE"),
    "sharp": W("sharp"), "slow": W("slow"), "cuts": W("cuts"), "or_just": W("or just"), "chuckle": ev("chuckles")["t"],
    "onion_win": W("onion", 0, find("or just")), "win": W("win"), "win_end": E("win"),
    "tomorrow": W("Tomorrow"), "yawning": W("yawning"),
}
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.W("subscribe")                       # if the line says "subscribes"/"subscribing", use that word
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word, and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
cues["sub_tap"] = min(T.E("subscribe") + 0.25, T.duration - 0.8)  # the cursor click, just after the word
T.write(shots, caps, cues)
