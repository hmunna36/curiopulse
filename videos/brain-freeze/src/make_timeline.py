"""Edit timeline for the "Why does ice cream give you brain freeze?" Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.6)  # after "slow down.": he eyes the shake, grins, SLURPS, and freezes again

SHOTS = [
    ("hook", None),                      # diner, mid-slurp, the push up to his forehead
    ("freeze", None),                    # on "FREEZES": ice explodes over his forehead
    ("stare", None),                     # deadpan: the arrow mouth vs forehead
    ("name", "That's brain"),            # BRAIN FREEZE title, then the endless medical name
    ("fine", "Let's just stick"),        # the long name crumples; BRAIN FREEZE stamped back
    ("how", "So what's going"),          # head cutaway: palate, vessels squeeze, fling open
    ("rush", "In one study"),            # the artery at the front of the brain + flow/pain traces
    ("why", "Scientists think your"),    # warm blood as a heater, overdoes it (pressure gauge)
    ("twist", "The twist"),              # the nerve carries the call, the brain pins the forehead
    ("kid", "Does gulping"),             # science-fair poster: 13-year-old; the race 5 s vs 30 s
    ("result", "The gulpers"),           # bars 27 % vs 13 %, the journal
    ("fix", "The fix"),                  # tongue to the palate, warm glow melts the frost
    ("final", "Or you know"),            # diner: "slow down"... then the slurp again
]
special = {"freeze": T.W("FREEZES") - 0.05, "stare": T.ev("deadpan")["t"] - 0.12}

CHUNKS = [
    "You take / ONE giant slurp", "of milkshake", "and then / your forehead",
    "FREEZES",
    "Your forehead", "The milkshake / went in your MOUTH",
    "That's brain freeze", "Doctors call it", "sphenopalatine", "ganglioneuralgia",
    "Let's just stick / with brain freeze",
    "So what's going on", "The cold hits the / roof of your mouth", "and the blood vessels / up there panic",
    "They squeeze tight", "then fling / wide open",
    "In one study", "blood came rushing / into an artery", "at the front / of the brain", "and the pain lasted",
    "just as long / as the rush",
    "Scientists think / your body", "is flooding in / warm blood", "to protect / your brain", "It just", "overdoes it",
    "The twist", "The pain travels up / a big nerve", "in your face", "and your brain / blames the wrong spot",
    "Your forehead",
    "Does gulping / make it worse", "A thirteen-year-old / tested it", "Ice cream in / five seconds", "or in thirty",
    "The gulpers got / twice the headaches", "And it got / published", "in a real / medical journal",
    "The fix", "Press your tongue / to the roof", "of your mouth", "and warm it / back up",
    "Or you know", "just slow down",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "one": Y, "slurp": PK, "milkshake": PK, "forehead": S, "freezes": S, "mouth": R,
    "brain": S, "freeze": S, "sphenopalatine": V, "ganglioneuralgia": V,
    "cold": S, "roof": Y, "blood": R, "vessels": R, "panic": R, "squeeze": R, "tight": R, "fling": O, "wide": O, "open": O,
    "study": G, "rushing": R, "artery": R, "front": Y, "pain": O, "long": Y, "rush": R,
    "scientists": C, "warm": O, "protect": G, "overdoes": R,
    "twist": Y, "nerve": O, "face": O, "blames": Y, "wrong": R, "spot": R,
    "gulping": PK, "worse": R, "13-year-old": Y, "tested": G, "5": Y, "seconds": Y, "30": C,
    "gulpers": PK, "twice": R, "headaches": R, "published": G, "medical": G, "journal": G,
    "fix": G, "tongue": PK, "back": O, "up": O, "slow": C, "down": C,
}
DISPLAY = {"a thirteen-year-old": ["A", "13-YEAR-OLD"], "ice cream in": ["ICE", "CREAM", "IN"],
           "five seconds": ["5", "SECONDS"], "or in thirty": ["OR", "IN", "30"]}

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_fh2 = find("Your forehead", find("twist"))
cues = {
    "take": W("take"), "one": W("ONE"), "slurp": W("slurp"), "milkshake": W("milkshake"), "and_then": W("and then"),
    "forehead": W("forehead"), "gasp": ev("gasps")["t"], "freezes": W("FREEZES"), "freezes_end": E("FREEZES"),
    "deadpan": ev("deadpan")["t"], "fh1": W("Your forehead"), "milkshake2": W("milkshake", 0, find("The milkshake")),
    "went": W("went"), "mouth1": W("MOUTH"),
    "thats": W("That's"), "brain1": W("brain freeze"), "doctors": W("Doctors"), "sphen": W("sphenopalatine"),
    "gang": W("ganglioneuralgia"), "gang_end": E("ganglioneuralgia"), "sigh": ev("sighs")["t"],
    "lets": W("Let's"), "stick": W("stick"), "brain2": W("brain", 0, find("stick")), "fine_end": E("freeze", 0, find("stick")),
    "sowhat": W("So what's"), "cold": W("cold"), "roof": W("roof"), "mouth2": W("mouth", 0, find("roof")),
    "blood1": W("blood vessels"), "vessels": W("vessels"), "panic": W("panic"), "squeeze": W("squeeze"),
    "tight": W("tight"), "fling": W("fling"), "wide": W("wide"), "open": W("open"),
    "study": W("study"), "blood2": W("blood came"), "rushing": W("rushing"), "artery": W("artery"),
    "front": W("front"), "brain3": W("brain", 0, find("front")), "pain1": W("pain lasted"), "lasted": W("lasted"),
    "long": W("long"), "rush": W("rush"), "rush_end": E("rush"),
    "scientists": W("Scientists"), "flooding": W("flooding"), "warm": W("warm blood"), "protect": W("protect"),
    "itjust": W("It just"), "overdoes": W("overdoes"), "overdoes_end": E("overdoes it", 1),
    "twist": W("twist"), "whisper": ev("whispers")["t"], "pain2": W("pain travels"), "travels": W("travels"),
    "nerve": W("nerve"), "face": W("face"), "brain4": W("brain blames"), "blames": W("blames"), "wrong": W("wrong"),
    "spot": W("spot"), "fh2": W("Your forehead", 0, i_fh2 - 1),
    "gulping": W("gulping"), "worse": W("worse"), "kid": W("thirteen-year-old"), "tested": W("tested"),
    "icecream": W("Ice cream"), "five": W("five"), "seconds": W("seconds"), "or30": W("or in thirty"),
    "thirty": W("thirty"), "gulpers": W("gulpers"), "twice": W("twice"), "headaches": W("headaches"),
    "andit": W("And it got"), "published": W("published"), "real": W("real"), "journal": W("journal"),
    "fix": W("fix"), "press": W("Press"), "tongue": W("tongue"), "roof2": W("roof", 0, find("Press")),
    "warmup": W("warm it"), "backup": W("back up"), "up_end": E("back up", 1),
    "or": W("Or you"), "know": W("know"), "chuckle": ev("chuckles")["t"], "slow": W("slow"), "down": W("down"),
    "down_end": E("slow down", 1),
}
cues["eye_shake"] = round(cues["down_end"] + 0.15, 3)    # he glances at the shake
cues["slurp2"] = round(cues["down_end"] + 0.45, 3)       # SLURP
cues["freeze2"] = round(cues["down_end"] + 0.92, 3)      # and it freezes again
T.write(shots, caps, cues)
