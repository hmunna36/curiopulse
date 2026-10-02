"""Edit timeline for the Why Does Your Stomach GROWL? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=0.9)  # after "It's an exam.": the proctor's glare, the subscribe click, the loop

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                      # the silent exam hall: pencils, the clock ... then his stomach GROWLS, every head turns
    ("react", None),                     # hard cut in the gap: the deadpan stare, the whole room staring back
    ("name", "It's called"),             # title card BORBORYGMI; on "the WORD growls" the letters rumble
    ("clean", "Hours after a"),          # x-ray dive: the clock spins, the gut lights up, a squeeze wave runs down it
    ("sweep", "sweeping out leftovers"), # inside the tube: the squeeze ring sweeps crumbs and bacteria along
    ("loud", "Empty it's just"),         # empty tube: gas bubbles + juice squeezed through the pinch -> sound rings
    ("pipes", None),                     # hard cut on "Bagpipes": the stomach turns into a tartan bagpipe
    ("full", "Full stomach"),            # the full stomach: same squeeze, the food muffles the rings
    ("proof", "The weirdest part"),      # sepia 1912 lab: he swallows the balloon, the tube runs to the drum
    ("match", "His hunger pangs"),       # the drum's trace: his key marks land on the squeeze peaks
    ("button", "So that growl"),         # back in the exam: RUDE crossed out, the x-ray vacuum in his belly
    ("sub", "Next up goosebumps"),       # whispered tease; the subscribe click is LOUD; the proctor shushes
]
special = {"react": T.W("Cool") - 0.30, "pipes": T.W("Bagpipes") - 0.12}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Silent exam", "then your / stomach goes",
    "Cool", "Very cool",
    "It's called", "borborygmi", "Even the / WORD growls",
    "Hours after / a meal", "your gut / starts cleaning", "A wave / of muscle", "squeezes / through",
    "sweeping out / leftovers", "and bacteria",
    "Empty", "it's just / gas and juice", "squeezed / through a tube",
    "Bagpipes",
    "Full stomach", "Same squeeze", "The food just / muffles it",
    "The weirdest / part", "In nineteen-twelve", "a student / SWALLOWED", "a balloon", "to spy on / his own stomach",
    "His hunger / pangs", "matched / the squeezes",
    "So that / growl", "Not rude", "Just your gut", "vacuuming",
    "Next up", "goosebumps", "Subscribe", "quietly", "It's an exam",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "silent": C, "stomach": O, "goes": O,
    "borborygmi": Y, "word": Y, "growls": O,
    "gut": O, "cleaning": G, "wave": Y, "muscle": PK, "squeezes": Y,
    "leftovers": O, "bacteria": G,
    "empty": C, "gas": C, "juice": G, "tube": PK,
    "bagpipes": V,
    "full": O, "same": Y, "squeeze": Y, "muffles": B,
    "weirdest": Y, "1912": Y, "swallowed": R, "balloon": R, "spy": V,
    "hunger": O, "pangs": O, "matched": G, "squeezes.": Y,
    "rude": R, "vacuuming": G,
    "goosebumps": Y, "subscribe": R, "quietly": C, "exam": C,
}
DISPLAY = {"nineteen-twelve": ["1912"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_btn = find("So that growl")
i_sq2 = find("matched the squeezes")
cues = {
    # hook: the silent hall, then the growl in the gap after "goes..."
    "silent": W("Silent"), "exam": W("exam"), "then": W("then your"), "stomach": W("stomach"), "goes": W("goes"),
    "goes_end": E("goes"),
    "growl": E("goes") + 0.10,                   # the GROWL (sound + shock rings + every head turns)
    "pregurgle": 0.12,                          # frame 4: a first little gurgle (he freezes mid-word), so frame 1 already has the strange thing
    # react
    "cool1": W("Cool"), "cool1_end": E("Cool"), "verycool": W("Very cool"), "cool2_end": E("cool", 0, find("Very cool") + 1),
    # name
    "called": W("It's called"), "borbo": W("borborygmi"), "borbo_end": E("borborygmi"), "chuckle": ev("chuckles")["t"],
    "even": W("Even the"), "word": W("WORD"), "growls_w": W("growls"), "growls_end": E("growls"),
    "word_growl": E("growls") + 0.06,            # the title letters rumble (after the word, never on it)
    # clean
    "hours": W("Hours"), "meal": W("meal"), "gut": W("gut", 0, find("your gut")), "cleaning": W("cleaning"),
    "wave": W("wave"), "muscle": W("muscle"), "squeezes": W("squeezes"), "through": W("through"),
    # sweep
    "sweeping": W("sweeping"), "leftovers": W("leftovers"), "bacteria": W("bacteria"), "bacteria_end": E("bacteria"),
    # loud
    "empty": W("Empty"), "gasjuice": W("gas"), "juice": W("juice"), "squeezed": W("squeezed"), "tube": W("tube"),
    "tube_end": E("tube"),
    # pipes
    "deadpan2": ev("deadpan", 1)["t"], "bagpipes": W("Bagpipes"), "bagpipes_end": E("Bagpipes"),
    # full
    "full": W("Full stomach"), "same": W("Same"), "squeeze_w": W("squeeze", 0, find("Same squeeze")), "food": W("food"),
    "muffles": W("muffles"), "muffles_end": E("muffles"), "full_end": E("it", 0, find("muffles it") + 1),
    # proof
    "excited": ev("excited")["t"], "weirdest": W("weirdest"), "year": W("nineteen-twelve"), "student": W("student"),
    "swallowed": W("SWALLOWED"), "balloon": W("balloon"), "balloon_end": E("balloon"), "spy": W("spy"),
    "own_stomach": W("stomach", 0, find("his own stomach")), "proof_end": E("stomach", 0, find("his own stomach")),
    # match
    "hunger": W("hunger"), "pangs": W("pangs"), "matched": W("matched"), "squeezes2": W("squeezes", 0, i_sq2),
    "match_end": E("squeezes", 0, i_sq2),
    # button
    "deadpan3": ev("deadpan", 2)["t"], "so": W("So that"), "growl_w": W("growl", 0, i_btn), "notrude": W("Not rude"),
    "rude": W("rude"), "justgut": W("Just your"), "vacuuming": W("vacuuming"), "vac_end": E("vacuuming"),
    # sub
    "nextup": W("Next up"), "goose": W("goosebumps"), "goose_end": E("goosebumps"), "quietly": W("quietly"),
    "quietly_end": E("quietly"), "itsanexam": W("It's an exam"), "exam_end": E("exam", 0, find("It's an exam") + 2),
}
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.W("subscribe")
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word, and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
cues["sub_tap"] = min(T.E("subscribe") + 0.10, T.duration - 0.8)  # the click lands in the gap before "quietly"
# the click is too loud for an exam: every head turns again, and after "exam." the proctor shushes (in the tail)
cues["shush"] = T.E("exam", 0, find("It's an exam") + 2) + 0.02
# word ends the sound design needs (punchline SFX go after the word)
cues.update({
    "silent_end": E("Silent"), "exam1_end": E("exam"), "cleaning_end": E("cleaning"), "through_end": E("through"),
    "empty_end": E("Empty"), "juice_end": E("juice"), "squeeze2_end": E("squeeze", 0, find("Same squeeze")),
    "year_end": E("nineteen-twelve"), "student_end": E("student"), "swallowed_end": E("SWALLOWED"), "spy_end": E("spy"),
    "pangs_end": E("pangs"), "matched_end": E("matched"), "growl_end": E("growl", 0, i_btn), "rude_end": E("rude"),
    "gut_end": E("gut", 0, find("Just your gut")), "verycool_end": E("cool", 0, find("Very cool") + 1),
})
T.write(shots, caps, cues)
