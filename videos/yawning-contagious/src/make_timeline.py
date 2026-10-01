"""Edit timeline for the Why Is Yawning CONTAGIOUS? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=0.9)  # after "still awake.": everyone on the bus nods off (the subscribe cue plays)

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                     # the night bus: the yawn hops seat to seat ... and lands on him: "yoooou"
    ("react", None),                    # hard cut after his yawn: the deadpan stare at the stranger
    ("name", "That's contagious"),      # outside: the bus drives past, title card, then the 50 % face grid
    ("why", None),                      # on the sigh: the shrug, "?", UNSOLVED
    ("cool", "One idea yawns"),         # idea 1: the head cutaway, jaw drops, cool air in, blood rushes, brain cools
    ("pack", "People with a cold"),     # the cold-pack study: he watches a yawner, cold pack on, no yawn; 41 % vs 9 %
    ("social", "Another idea it's"),    # idea 2: he mirrors the stranger's faces
    ("dogs", "some dogs even"),         # he yawns at a dog; the dog yawns back
    ("weird", "And the weirdest"),      # whispered: the book, the word YAWN, he yawns
    ("button", "So if you"),            # he turns to the viewer: BORED? no. SCIENCE
    ("sub", "Tomorrow why your"),       # back on the bus: his stomach growls, everyone nods off; the subscribe cue
]
special = {"react": T.E("yoooou") + 0.12, "why": T.ev("sighs")["t"] - 0.08}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "One person / on the bus", "yawns", "then the next", "then the next",
    "and then", "yoooou",
    "Thanks / stranger",
    "That's contagious / yawning", "About half / of adults", "catch it",
    "Why", "Honestly", "nobody's sure",
    "One idea", "yawns cool / your brain", "A big gulp / of air", "a rush of / fresh blood",
    "People with / a cold pack", "on their / forehead", "caught WAY / fewer yawns",
    "Another idea", "it's social", "We copy / the faces", "around us",
    "some dogs / even catch", "OURS",
    "And the / weirdest part", "Just READING / about yawns", "can start one",
    "So if you / yawned", "during this", "it's not / boredom", "It's science",
    "Tomorrow", "why your / stomach growls", "Subscribe", "if you're / still awake",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "yawns": Y, "yoooou": Y, "stranger": O, "contagious": Y, "yawning": Y, "half": G,
    "why": C, "nobody's": R, "sure": R,
    "idea": C, "cool": C, "brain": PK, "air": C, "fresh": R, "blood": R,
    "cold": C, "pack": C, "forehead": C, "way": G, "fewer": G,
    "social": V, "copy": V, "faces": V, "dogs": O, "ours": O,
    "weirdest": Y, "reading": Y, "start": Y,
    "boredom": R, "science": C, "stomach": O, "growls": O, "subscribe": R, "awake": Y,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_cool = find("One idea yawns")
i_weird = find("And the weirdest")
i_btn = find("So if you")
cues = {
    # hook: the yawn travels seat to seat
    "yawn1": W("yawns"), "yawn1_end": E("yawns"), "next1": W("then the next"), "next2": W("then the next", 0, find("then the next") + 1),
    "andthen": W("and then"), "then_end": E("and then", 1), "person_end": E("One person", 1), "yawning": ev("yawning")["t"], "you": W("yoooou"), "you_end": E("yoooou"),
    # react
    "deadpan": ev("deadpan")["t"], "thanks": W("Thanks"), "stranger": W("stranger"),
    # name
    "thats": W("That's contagious"), "contagious": W("contagious"), "yawning_w": W("yawning"),
    "about": W("About half"), "half": W("half"), "adults": W("adults"), "catch": W("catch it"), "catch_end": E("catch it", 1),
    # why
    "sigh": ev("sighs")["t"], "why_w": W("Why"), "honestly": W("Honestly"), "nobody": W("nobody's"), "sure": W("sure"), "sure_end": E("sure"),
    # cool
    "idea1": W("idea", 0, i_cool), "yawns_cool": W("yawns cool"), "cool": W("cool"), "brain": W("brain"),
    "gulp": W("big gulp"), "air": W("air"), "rush": W("rush"), "fresh": W("fresh"), "blood": W("blood"), "blood_end": E("blood"),
    # pack
    "excited": ev("excited")["t"], "people": W("People with"), "coldpack": W("cold pack"), "forehead": W("forehead"),
    "caught": W("caught"), "way": W("WAY"), "fewer": W("fewer"), "yawns_pack": W("fewer yawns", 1),
    # social
    "another": W("Another idea"), "idea2": W("idea", 0, find("Another idea")), "social": W("social"),
    "copy": W("copy"), "faces": W("faces"), "around": W("around"),
    # dogs
    "chuckle1": ev("chuckles")["t"], "dogs": W("dogs"), "even": W("even catch"), "ours": W("OURS"), "ours_end": E("OURS"),
    # weird
    "whisper": ev("whispers")["t"], "weirdest": W("weirdest"), "part": W("part"), "just": W("Just READING"),
    "reading": W("READING"), "about_y": W("about yawns"), "yawns_r": W("yawns", 0, i_weird + 5), "canstart": W("can start"), "yawns_r_end": E("yawns", 0, i_weird + 5), "one_end": E("start one", 1),
    "one_w": W("start one", 1),
    # button
    "so": W("So if you"), "this_end": E("this", 0, i_btn), "you_b": W("you", 0, i_btn), "yawned": W("yawned"), "during": W("during"),
    "itsnot": W("it's not"), "this_end2": E("this", 0, i_btn), "boredom": W("boredom"), "boredom_end": E("boredom"), "chuckle2": ev("chuckles", -1)["t"],
    "science": W("science"), "science_end": E("science"),
    # sub
    "tomorrow": W("Tomorrow"), "stomach": W("stomach"), "stomach_end": E("stomach"), "growls": W("growls"), "growls_end": E("growls"),
    "awake": W("awake"), "still": W("still"),
}
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.W("subscribe")                       # if the line says "subscribes"/"subscribing", use that word
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word, and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
cues["sub_tap"] = min(T.E("subscribe") + 0.10, T.duration - 0.8)  # the click lands in the gap before "if you're still awake"
T.write(shots, caps, cues)
