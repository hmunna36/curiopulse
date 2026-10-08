"""Edit timeline for the Why Do Mosquitoes Bite YOU More? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.35)  # seconds after the last word: the button beat (his stare on the cheese board) and
#                                       the cut back to frame 1 for the loop.


def move_onset(phrase, block_id, min_late=0.1):
    """v3 gives a tag's time to a take's first word, or draws the word out and stamps only its last syllable
    ("Subscriiibe"): the word starts where its take first gets loud. Only moved when the stamp is clearly late."""
    i = T.find(phrase)
    t0 = T.first_loud(T.block(block_id)["start"])
    late = T.ws[i] - t0
    print(f'  onset {phrase!r}: stamp {T.ws[i]:.2f}, first loud {t0:.2f} ({late:+.2f})' + (' -> moved' if late > min_late else ''))
    if late > min_late:
        T.ws[i] = T.words[i]["start"] = t0


move_onset("It's not", "answer")
move_onset("Subscribe", "sub")
move_onset("The same", "cheese")
move_onset("So you're", "button")

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),                     # tight on his forearm: the slap; then his friend, untouched
    ("answer", "It's not sweet"),       # SWEET BLOOD? crossed out; his skin smells like dinner (a mosquito with a bib)
    ("breath", "Mosquitoes track"),     # the trail of his breath across the dark meadow, to a mosquito 30 feet away
    ("skin", "Then they sniff"),        # it lands and sniffs; the pores bead with oily acids
    ("more", "and some people"),        # two arms: his friend's trickle, his geyser
    ("study", "In one study"),          # the two-tube box: sleeve 33 against sleeve 19
    ("years", "and stayed that"),       # the calendar flies; still a magnet
    ("subcam", None),                   # he sniffs his own arm (the pill plays here)
    ("cheese", "The same kind"),        # his arm = a wedge of smelly cheese
    ("feet", "In one experiment"),      # the scale: cheese on one pan, a foot on the other; it's a tie
    ("button", "So you're not"),        # he is the cheese board; the loop
]
_sub_i = T.find("subscribe")
_sub_in = max(0.0, T.ws[_sub_i] - 0.30)
special = {"subcam": min(T.block("sub")["start"] - 0.10, _sub_in - 0.04)}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "You slap", "mosquito / number ten", "and your / friend has", "zero bites!",
    "It's not", "sweet blood.", "Your skin", "just smells / like...", "dinner.",
    "Mosquitoes", "track / your breath", "from / thirty feet", "away.",
    "Then they / sniff", "your skin.", "The leading / suspect?", "Oily", "acids...",
    "and some / people", "make", "WAY", "more.",
    "In one / study,", "one / volunteer", "was a", "HUNDRED times", "more / attractive", "than another...",
    "and stayed / that way", "for years.",
    "Subscribe...", "it gets / smellier.",
    "The same / kind of", "acids", "make cheese", "stink.",
    "In one / experiment,", "malaria / mosquitoes", "loved", "stinky / cheese", "as much as", "human feet.",
    "So you're", "not sweet.", "You're...", "a cheese / board.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"slap": R, "mosquito": Y, "ten": R, "friend": C, "zero": G, "bites": G,
         "sweet": P["P"], "blood": R, "skin": O, "smells": Y, "dinner": Y,
         "mosquitoes": Y, "breath": C, "30": Y, "feet": Y, "sniff": C, "leading": C, "suspect": C, "oily": Y, "acids": Y,
         "way": R, "more": R, "study": C, "100": Y, "times": Y, "attractive": P["P"], "stayed": O, "years": O,
         "subscribe": R, "smellier": G, "same": C, "cheese": Y, "stink": G, "experiment": C, "malaria": R, "loved": P["P"],
         "stinky": G, "human": O, "board": Y}
DISPLAY = {"thirty feet": ["30", "FEET"], "hundred times": ["100", "TIMES"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    "slap": W("slap") + 0.05, "slap_end": E("slap"), "number": W("number"), "ten": W("ten"), "ten_end": E("ten"),
    "and1": W("and your friend"), "friend": W("friend"), "has": W("has zero"), "zero": W("zero"), "bites": W("bites"),
    "bites_end": E("bites"),
    "its": W("It's not"), "sweet": W("sweet"), "blood": W("sweet blood", 1), "blood_end": E("sweet blood", 1),
    "skin1": W("Your skin", 1), "smells": W("smells"), "like_end": E("smells like", 1), "dinner": W("dinner"),
    "dinner_end": E("dinner"),
    "mosq": W("Mosquitoes track"), "track": W("track"), "breath": W("your breath", 1), "breath_end": E("your breath", 1),
    "from": W("from thirty"), "thirty": W("thirty"), "feet1_end": E("thirty feet", 1), "away": W("away"), "away_end": E("away"),
    "then": W("Then they"), "sniff": W("sniff"), "skin2": W("sniff your skin", 2), "skin2_end": E("sniff your skin", 2),
    "leading": W("leading"), "suspect": W("suspect"), "suspect_end": E("suspect"), "oily": W("Oily"), "acids": W("Oily acids", 1),
    "acids_end": E("Oily acids", 1),
    "some": W("and some", 1), "people": W("some people", 1), "make": W("people make", 1), "way": W("WAY"), "way_end": E("WAY"),
    "more": W("WAY more", 1), "more_end": E("WAY more", 1),
    "study": W("In one study", 2), "study_end": E("In one study", 2), "volunteer": W("volunteer"), "volunteer_end": E("volunteer"),
    "hundred": W("HUNDRED"), "times_end": E("HUNDRED times", 1), "attractive": W("attractive"), "another": W("another"),
    "another_end": E("another"),
    "stayed": W("stayed"), "way2": W("that way", 1), "years": W("years"), "years_end": E("years"),
    "itgets": W("it gets"), "smellier": W("smellier"), "smellier_end": E("smellier"),
    "same": W("same kind"), "acids2": W("of acids", 1), "acids2_end": E("of acids", 1), "make2": W("make cheese"),
    "cheese1": W("make cheese", 1), "stink": W("stink"), "stink_end": E("stink"),
    "inone": W("In one experiment"), "exp": W("experiment"), "exp_end": E("experiment"), "malaria": W("malaria"),
    "mosq2_end": E("malaria mosquitoes", 1), "loved": W("loved"), "stinky": W("stinky"), "cheese2": W("stinky cheese", 1),
    "cheese2_end": E("stinky cheese", 1), "asmuch": W("as much as"), "human": W("human"), "feet": W("human feet", 1),
    "feet_end": E("human feet", 1),
    "so": W("So you're"), "notsweet": W("So you're not sweet", 2), "sweet2": W("So you're not sweet", 3), "sweet2_end": E("So you're not sweet", 3),
    "youre": W("You're a"), "youre_end": E("You're a"), "acheese": W("a cheese board"), "cheese3": W("a cheese board", 1),
    "board": W("a cheese board", 2), "board_end": E("a cheese board", 2),
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff
# (reference/narration.md). The word "subscribe" must land at 50-70 % of the runtime; qa.py checks it. The pill pops
# ~0.3 s before the word, the cursor clicks in the pause just after it, and the pill pops out 1.3 s after the click:
# about 2.6 s on screen. Captions that share the screen with it sit at y 1150 (main.js); the narration carries on.
cues["sub_in"] = _sub_in
# "Subscribe..." can be drawn out with only its last syllable stamped: the click waits for the word to be over
cues["sub_tap"] = max(T.we[_sub_i], T.ws[_sub_i] + 0.8) + 0.10
cues["sub_out"] = cues["sub_tap"] + 1.30
# v3 stamped "You" at 0.10-0.18, but she says it from the take's first loud frame until "slap": give the word its real
# window AFTER the shots, captions and cues are computed, so the picture and the mix do not move (qa.py measures here)
_y = T.find("You slap")
T.words[_y]["start"] = T.first_loud(T.block("hook")["start"]); T.words[_y]["end"] = round(T.ws[_y + 1] - 0.01, 3)
print(f'  "You": {T.ws[_y]:.2f}-{T.we[_y]:.2f} -> {T.words[_y]["start"]:.2f}-{T.words[_y]["end"]:.2f}')
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[_sub_i]:.2f} s = {100 * T.ws[_sub_i] / T.duration:.0f} % of the runtime (must be 50-70 %)')
print(f'sub cue: in {cues["sub_in"]:.2f}, tap {cues["sub_tap"]:.2f}, out {cues["sub_out"]:.2f}; "it gets" at {cues["itgets"]:.2f}')
