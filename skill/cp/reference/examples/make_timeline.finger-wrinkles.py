"""Edit timeline for the finger-wrinkles Short (the worked example for timeline_lib).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.45)  # after "snow tires.": the hand dives back in (loops to the opening splash)

# (shot id, phrase whose first word opens the shot); None = timed in `special` below
SHOTS = [
    ("hook", None),                        # splash, time-lapse, the hand rises: "...turn into..."
    ("raisins", None),                     # on the deadpan beat: a raisin lands next to his hand
    ("myth", "Most people"),
    ("nope", None),                        # on the chuckle
    ("purpose", "Your body does"),
    ("pores", "Water seeps"),              # inside the fingertip
    ("buckle", "Less blood"),
    ("grape", "Grape"),
    ("proof", "How do we know"),
    ("grip", "So why bother"),
    ("meh", "Some studies"),
    ("pattern", "And the weirdest"),
    ("final", "So next time"),
]
special = {"raisins": T.E("into") + 0.12, "nope": T.ev("chuckles")["t"] - 0.05}

# caption chunks: exact consecutive word runs; "/" splits lines
CHUNKS = [
    "Stay in the bath / long enough", "and your fingers / turn into", "raisins",
    "Most people think / your skin", "just soaks up water", "Like a sponge",
    "Nope",
    "Your body / does it", "on purpose",
    "Water seeps into / your sweat pores", "your nerves / notice", "and they tell / the blood vessels", "in your fingertips / to squeeze",
    "Less blood flow", "less volume", "so the skin / on top buckles", "Grape", "raisin",
    "How do we know", "People with damaged / finger nerves", "don't wrinkle", "Doctors even use it / as a nerve test",
    "So why bother", "One idea / grip", "Wrinkles might work / like tire treads", "pushing water / out of the way",
    "Some studies / say it helps", "another says / meh", "Science",
    "And the / weirdest part", "Scientists found / your wrinkles", "come back in / the exact", "same pattern", "every time",
    "So next time you / turn into a raisin", "that's just / your body", "putting on / snow tires",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {
    "bath": C, "fingers": Y, "raisins": V, "raisin": V, "soaks": C, "water": C, "sponge": Y, "nope": R,
    "purpose": Y, "seeps": C, "sweat": C, "pores": C, "nerves": O, "notice": O, "blood": R, "vessels": R, "squeeze": R,
    "flow": R, "volume": B, "buckles": Y, "grape": G, "damaged": R, "don't": R, "wrinkle": Y, "nerve": G, "test": G,
    "bother": C, "idea": C, "grip": Y, "tire": O, "treads": O, "way": C, "helps": G, "meh": O, "science": C,
    "weirdest": Y, "exact": Y, "same": Y, "pattern": Y, "every": Y, "time": Y, "snow": S, "tires": S, "body": Y,
}

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_final = find("So next time")
cues = {
    "stay": W("Stay"), "enough": W("enough"), "fingers": W("fingers"), "into": W("into"), "into_end": E("into"),
    "raisins": W("raisins"), "deadpan": ev("deadpan")["t"],
    "most": W("Most"), "soaks": W("soaks"), "water1": W("water"), "sponge": W("sponge"),
    "chuckle": ev("chuckles")["t"], "nope": W("Nope"), "nope_end": E("Nope"),
    "body": W("body does"), "purpose": W("purpose"),
    "water2": W("Water seeps"), "seeps": W("seeps"), "sweat": W("sweat"), "pores": W("pores"),
    "nerves": W("nerves notice"), "notice": W("notice"), "tell": W("tell"), "vessels": W("vessels"),
    "fingertips": W("fingertips"), "squeeze": W("squeeze"),
    "less": W("Less blood"), "flow": W("flow"), "volume": W("volume"), "skin2": W("skin on top"),
    "buckles": W("buckles"), "grape": W("Grape"), "raisin2": W("raisin", 0, find("Grape")),
    "know": W("know"), "damaged": W("damaged"), "nerves2": W("nerves", 0, find("damaged")),
    "dont": W("don't"), "doctors": W("Doctors"), "test": W("test"), "excited": ev("excited")["t"],
    "bother": W("bother"), "idea": W("idea"), "grip": W("grip"), "wrinkles": W("Wrinkles might"),
    "tire": W("tire"), "treads": W("treads"), "pushing": W("pushing"), "way": W("way"),
    "studies": W("studies"), "helps": W("helps"), "another": W("another"), "meh": W("meh"),
    "sigh": ev("sighs")["t"], "science": W("Science"),
    "weirdest": W("weirdest"), "scientists": W("Scientists found"), "found": W("found"),
    "back": W("back"), "exact": W("exact"), "same": W("same"), "pattern": W("pattern"),
    "every": W("every"), "time": W("time", 0, find("every")),
    "next": W("next", 0, i_final), "raisin3": W("raisin", 0, i_final), "thats": W("that's"),
    "body3": W("body", 0, find("that's")), "snow": W("snow"), "tires": W("tires"), "tires_end": E("tires"),
    "chuckle2": ev("chuckles", -1)["t"],
}
cues["dive_back"] = round(cues["tires_end"] + 0.35, 3)
T.write(shots, caps, cues)
