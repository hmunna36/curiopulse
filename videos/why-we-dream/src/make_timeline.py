"""Edit timeline for the Why Do We DREAM? 💭 Short (the 30-35 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.5)  # after "Usually.": a padlock springs open, his arm gets away, and the alarm rings again

W, E, ev, find = T.W, T.E, T.ev, T.find


def move_onset(phrase, block, k=0, thr=-33.0):
    """v3 gives a tag's time to the word after it (or keeps only the last syllable of a drawn-out word), so the
    alignment starts that word late. Move word k of `phrase` to the first loud frame of its take (the waveform)."""
    i = find(phrase) + k
    t0 = T.first_loud(T.block(block)["start"], thr=thr)
    if T.ws[i] - t0 > 0.05:
        print(f'  "{T.words[i]["word"]}" starts at {t0:.2f} s (alignment said {T.ws[i]:.2f})')
        T.ws[i] = T.words[i]["start"] = t0
    return i


# "Relax," and "[mischievously] Subscribe..." are drawn out: they start where their takes get loud
move_onset("Relax", "answer")
SUB = move_onset("Subscribe", "sub")

DUR = T.duration
LOOP = DUR - 0.40                          # the last 0.4 s are the dream again: the alarm rings, his hand comes down (frame 1)

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                        # an exam hall: he slaps a ringing alarm clock on his desk. In pajamas
    ("answer", "Relax"),                   # his bedroom from above: he is asleep, and the exam hall is a bubble by his head
    ("warden", "and your brain"),          # inside his head: the brain as a fire warden, a FIRE DRILL sign, a beacon
    ("fears", "It rehearses"),             # the same room: fears on the big screen, one after another; the LOGIC switch goes OFF
    ("pajamas", "Which explains"),         # the exam hall again: nobody minds the pajamas, the teddy or the penguin
    ("payoff", "In one study"),            # the study: two bars. The ones who dreamed of the exam, and the ones who did not
    ("bed", None),                         # the aside: his bedroom from above, the dream goes on in its bubble
    ("weird", "Every night"),              # the brain pulls a lever; padlocks snap onto his arms and legs
    ("stays", "The drill stays"),          # closer: he sprints in the bubble, and lies perfectly still in bed
    ("button", None),                      # "Usually.": one padlock springs open; his arm gets away. Then frame 1
]
special = {
    "bed": T.ws[SUB] - 0.30,               # just before the pill pops in (sub_in), so "scored higher" keeps its place
    "button": W("Usually") - 0.07,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You slap / your alarm", "in an / exam hall", "in your / pajamas",
    "Relax", "you're / dreaming", "and your / brain", "may be / running", "a fire / drill",
    "It rehearses", "your fears", "with the / logic center", "switched / off",
    "Which / explains", "the / pajamas",
    "In one / study", "students / who dreamed", "of their / exam", "scored / higher",
    "Subscribe", "it gets / weirder",
    "Every / night", "your brain", "paralyzes", "your arms / and legs", "so you / can't", "act dreams / out",
    "The drill", "stays in / your head",
    "Usually",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys): violet = the pajamas (the object of the joke),
# red = the alarm, the drill and what is switched off, pink = the brain, cyan = dreams and sleep, yellow = the reveals,
# green = proof, orange = the body
COLOR = {
    "alarm": R, "exam": Y, "pajamas": V,
    "relax": G, "dreaming": C, "brain": PK, "fire": R, "drill": R,
    "rehearses": Y, "fears": R, "logic": C, "off": R,
    "study": V, "dreamed": C, "higher": G,
    "subscribe": R, "weirder": Y,
    "night": B, "paralyzes": Y, "arms": O, "legs": O, "can't": R, "dreams": C,
    "stays": G, "head": PK,
    "usually": Y,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

SLAP = W("slap") + 0.02
REH = W("rehearses")
FEARS_END = E("your fears", 1)
LEGS_END = E("and legs", 1)
USU_END = E("Usually")
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: the alarm, the hall, the pajamas
    "slap": SLAP,                           # his hand lands on the clock: the ringing stops
    "alarm": W("alarm"),
    "alarm_end": E("alarm"),
    "hall": W("in an exam") - 0.06,         # the camera lets go of him: rows of desks, and everyone is looking
    "exam": W("exam"),
    "hall_w": W("exam hall", 1),
    "hall_end": E("exam hall", 1),
    "in_your": W("in your pajamas"),
    "pj": W("pajamas"),                     # he looks down at himself
    "pj_end": E("pajamas"),
    "snick": E("pajamas") + 0.06,           # somebody snickers, in the pause
    # 2. answer: it is a dream
    "relax": T.ws[find("Relax")],
    "relax_end": E("Relax"),
    "youre": W("you're dreaming"),
    "dreaming": W("dreaming"),
    "dreaming_end": E("dreaming"),
    # 3. warden: the brain runs a fire drill
    "and": W("and your brain"),
    "brain1": W("and your brain", 2),
    "may": W("may be"),
    "running": W("running"),
    "fire": W("a fire", 1),                 # the FIRE DRILL sign comes on
    "drill": W("fire drill", 1),
    "drill_end": E("fire drill", 1),
    "whistle": E("fire drill", 1) + 0.05,   # one blast on its whistle, in the pause
    # 4. fears: rehearsed, with the logic off
    "it": W("It rehearses"),
    "rehearses": REH,
    "fears": W("your fears", 1),
    "fears_end": FEARS_END,
    # a new fear on the big screen: the exam is up already; then the fall, the chase, the teeth (the last one in the pause)
    "cards": [REH + 0.10, W("your fears") + 0.02, W("your fears", 1) + 0.12],
    "with": W("with the logic"),
    "logic": W("logic"),
    "center": W("center"),
    "switched": W("switched"),              # the brain's hand comes down on the big switch
    "off": W("switched off", 1),            # OFF: its lamp dies
    "off_end": E("switched off", 1),
    "clunk": E("switched off", 1) + 0.04,   # the audible clunk and the lights' sigh, in the pause
    # 5. pajamas
    "which": W("Which explains"),
    "explains": W("explains"),
    "the_pj": W("the pajamas"),
    "pj2": W("the pajamas", 1),             # the thumbs-up
    "pj2_end": E("the pajamas", 1),
    "squeak": E("the pajamas", 1) + 0.06,   # the teddy squeaks, in the pause
    # 6. payoff: the study
    "in_one": W("In one study"),
    "study": W("study"),
    "study_end": E("study"),
    "students": W("students"),
    "who": W("who dreamed"),
    "dreamed": W("dreamed"),                # the first bar: the ones who dreamed of the exam
    "of_their": W("of their exam"),
    "exam2": W("of their exam", 2),
    "exam2_end": E("of their exam", 2),
    "scored": W("scored"),                  # the second bar comes up beside it... and stops short
    "higher": W("higher"),                  # the first one's number lights up
    "higher_end": E("higher"),
    "tada": E("higher") + 0.05,
    # 7. bed: the aside
    "sub_w": T.ws[SUB],
    "it_gets": W("it gets"),
    "gets": W("it gets", 1),
    "weirder": W("weirder"),
    "weirder_end": E("weirder"),
    # 8. weird: the lever and the padlocks
    "every": W("Every night"),
    "night": W("night"),
    "brain2": W("your brain paralyzes", 1),
    "paralyzes": W("paralyzes"),            # the brain's lever comes down
    "paralyzes_end": E("paralyzes"),
    "arms": W("your arms", 1),              # two padlocks snap onto his wrists
    "legs": W("and legs", 1),               # and two onto his ankles
    "legs_end": LEGS_END,
    "locks": LEGS_END + 0.06,               # the audible ka-chunk, in the pause after "legs,"
    "so": W("so you"),
    "cant": W("can't"),
    "act": W("act dreams"),
    "dreams": W("act dreams", 1),
    "out": W("act dreams out", 2),
    "out_end": E("act dreams out", 2),
    # 9. stays
    "the_drill": W("The drill stays"),
    "drill2": W("The drill stays", 1),
    "stays": W("stays"),
    "head": W("your head", 1),
    "head_end": E("your head", 1),
    # 10. button
    "usually": W("Usually"),
    "usually_end": USU_END,
    "pop": USU_END + 0.14,                  # one padlock springs open
    "rise": USU_END + 0.22,                 # his arm gets away, toward the clock on the nightstand
    "loop": LOOP,                           # the dream again: the alarm rings, the hand comes down... onto frame 1
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff.
# "Subscribe..." is drawn out and the alignment knew only its last syllable: the click waits for the word to end.
cues["sub_in"] = max(0.0, T.ws[SUB] - 0.22)   # 0.22 s before the word (not 0.30): the cut to the bedroom comes first
cues["sub_tap"] = max(T.we[SUB], T.ws[SUB] + 0.80) + 0.10   # in the "..." after the word, so the click never sits on a word
cues["sub_out"] = cues["sub_tap"] + 1.30
cues = {k: ([round(x, 3) for x in v] if isinstance(v, list) else round(v, 3)) for k, v in cues.items()}
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[SUB]:.2f} s = {100 * T.ws[SUB] / T.duration:.0f} % of the runtime (must be 50-70 %); tap {cues["sub_tap"]:.2f}, next word {T.ws[SUB + 1]:.2f}')
for k, v in cues.items():
    print(f'  {k:12s} {v if isinstance(v, list) else format(v, "6.2f")}')
