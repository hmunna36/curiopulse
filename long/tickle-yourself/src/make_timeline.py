"""Edit timeline for "Why Can't You TICKLE Yourself?" (long-form, 1920x1080, 3 minutes at most).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, fr

T = Timeline(sys.argv[1], tail=1.6)
W, E, ev, find = T.W, T.E, T.ev, T.find

# (shot id, phrase whose first word opens the shot); None = timed in `special`
SHOTS = [
    ("hook", None),                       # 0: night, the couch, the feather under his chin: nothing
    ("else", "But when someone ELSE"),    # a small pink hand pokes in: he falls apart; WHY?
    ("future", "Because your brain"),     # into his head: a fortune-teller brain with a crystal ball
    ("pip", "Meet Pip"),                  # last Sunday: Pip on the couch, him flat on the rug, the medal
    ("plan", "So this week"),             # the headband, the calendar, the feather: the plan
    ("days", "Day one"),                  # DAY 1 / DAY 2 / DAY 6: nothing, nothing, nothing
    ("stare", None),                      # wordless: he lowers the feather and looks at it
    ("brain", "Here's the problem"),      # the cutaway: order down, copy to the cerebellum
    ("predict", "Its job"),               # the forecast, the touch on schedule, the volume knob, SPOILER
    ("surprise", "A tickle needs"),       # he tries to sneak up on himself
    ("rehook1", "So what if you"),        # his eyes narrow: an idea
    ("lab", "In London"),                 # the tickle robot
    ("sync", "Move it yourself"),         # in sync: flat; 0.2 s delay: the tickle comes back
    ("fool", "Fool the prediction"),      # FOOLED!
    ("machine", None),                    # wordless + congratulations: his homemade delay machine
    ("press", "But the weirdest part"),   # the finger-press experiment
    ("escalate", "Every single turn"),    # the staircase: +38% a turn
    ("fight", "Which might explain"),     # he and Pip, shoving
    ("rats", "And rats"),                 # the rat, the chirps, 50 kHz, the joy jump
    ("play", "Some scientists think that's"),  # the family photos: tickling across generations
    ("turn", "So your brain blocking"),   # alone on the couch; he puts the feather down
    ("sunday", None),                     # wordless: Sunday, the doorbell, Pip in the sunlit door; he opens his arms
    ("end", "Some things only work"),     # laughing on the rug; the final image; the subscribe cue
]
special = {
    "stare": E("six.", s=find("Day six")) + 0.45,
    "machine": E("yourself!", s=find("CAN tickle")) + 0.35,
    "sunday": E("there.") + 0.55,
}

# caption chunks: exact consecutive word runs covering the whole narration
CHUNKS = [
    "Go on.", "Try to tickle yourself...", "Right now.",
    "Nothing, right?",
    "But when someone ELSE does it...", "you completely fall apart.", "Why?",
    "Because your brain...", "is secretly predicting the future.",
    "Meet Pip.", "Six years old...", "and undefeated.",
    "So this week,", "he has a plan.", "Tickle himself", "every single day...", "until he's immune.",
    "Day one.", "Day two.", "Day six.",
    "Here's the problem.", "Every time you move,", "your brain sends an order / to your muscles...",
    "and a copy of that order", "back here,", "to the cerebellum.",
    "Its job?", "Predict exactly / what you're about to feel.", "When the touch arrives / right on schedule,",
    "your brain turns it down.", "Spoiler alert...", "it already knew.",
    "A tickle needs a surprise.", "And you...", "can't surprise yourself.",
    "So what if you could?",
    "In London,", "scientists built a tickle robot.", "You move a handle", "with one hand...",
    "and a robot strokes", "your other palm", "with soft foam.",
    "Move it yourself,", "and it's barely ticklish.", "But add a delay", "of just a fifth", "of a second...",
    "and the tickle comes back.",
    "Fool the prediction...", "and you CAN tickle yourself!",
    "Congratulations.", "He wanted to become untickleable...", "and he built a machine", "that tickles him.",
    "But the weirdest part", "isn't about tickling at all.",
    "The same prediction", "turns down your own pushes.", "In one experiment,", "two people took turns",
    "pressing on each other's finger,", "trying to press back / exactly as hard.",
    "Every single turn...", "the force went up", "by nearly forty percent.",
    "Which might explain every", "\"he pushed me first\"", "fight in history.",
    "And rats?", "Tickle a rat, and it chirps...", "a sound scientists / compare to laughing,", "too high for us to hear.",
    "They even chase the hand", "for more.",
    "Some scientists think", "that's what tickling is for.", "Play...", "a way for two brains to bond.",
    "So your brain blocking", "your own tickle", "isn't a bug.", "A tickle is how", "your body knows...", "someone else", "is there.",
    "So he quit training.",
    "Some things only work...", "when someone else does them.",
    "Next week:", "what happens when you", "hold your breath.", "Subscribe...", "and remember to breathe out.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "tickle": PK, "yourself": Y, "nothing": C, "else": Y, "apart": PK, "why": Y, "predicting": C, "future": C,
    "pip": PK, "undefeated": Y, "plan": Y, "immune": G, "six": R,
    "order": Y, "copy": C, "cerebellum": C, "predict": C, "schedule": C, "down": R, "spoiler": R, "knew": C,
    "surprise": Y, "robot": C, "foam": PK, "barely": C, "delay": Y, "fifth": Y, "back": PK, "fool": Y, "can": Y,
    "congratulations": V, "untickleable": G, "machine": O, "weirdest": Y, "pushes": O, "finger": O, "harder": R,
    "40%": R, "fight": R, "rats": PK, "chirps": PK, "laughing": PK, "hear": C, "more": PK, "play": Y, "bond": Y,
    "bug": G, "someone": Y, "there": Y, "quit": G, "them": Y, "breath": C, "subscribe": R,
}
DISPLAY = {"forty percent": ["40%"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

# v3's alignment can hand a pause to the word after it ("Day... two": "Day" starts 0.7 s before its sound). Move every
# word's start to its first loud frame when that is clearly later (captions pop on the sound; qa.py measures the word).
for i in range(len(T.words)):
    fl = T.first_loud(T.ws[i], span=max(0.02, T.we[i] - T.ws[i] + 0.1))
    if fl - T.ws[i] > 0.08:
        T.ws[i] = T.words[i]["start"] = round(min(fl, T.we[i] - 0.04), 3)

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

S0 = {s["id"]: s["start"] for s in shots}
cues = {
    # hook
    "nothing": W("Nothing,"), "else": W("ELSE"), "poke": E("it...", s=find("ELSE does")) - 0.12, "apart": W("fall"), "why": W("Why?"),
    "future": W("future."),
    # pip
    "pip": W("Pip."), "six": W("Six"), "undefeated": W("undefeated."),
    # plan
    "plan": W("plan."), "tickle_day": W("Tickle himself"), "immune": W("immune."),
    # days
    "day1": W("Day one"), "day2": W("Day two"), "day6": W("Day six"), "day6_end": E("six.", s=find("Day six")),
    # brain
    "move": W("move,"), "order": W("order"), "muscles": W("muscles..."), "copy": W("copy"), "back_here": W("back here"),
    "cerebellum": W("cerebellum."),
    "predict": W("Predict"), "feel": W("feel."), "touch": W("touch"), "schedule": W("schedule,"), "turns_down": W("turns it down"),
    "spoiler": W("Spoiler"), "knew": W("knew."),
    # surprise
    "surprise": W("surprise."), "and_you": W("And you..."), "cant": W("can't surprise"), "yourself2": W("yourself.", s=find("can't surprise")),
    "could": W("could?"),
    # lab
    "london": W("London,"), "robot": W("robot."), "handle": W("handle"), "strokes": W("strokes"), "foam": W("foam."),
    "barely": W("barely"), "delay": W("delay"), "fifth": W("fifth"), "comes_back": W("comes back"), "back_end": E("back.", s=find("comes back")),
    "fool": W("Fool"), "can": W("CAN"), "fool_end": E("yourself!", s=find("CAN tickle")),
    # machine
    "congrats": W("Congratulations."), "untickle": W("untickleable..."), "built": W("built a machine"), "tickles_him": W("tickles him."),
    # press
    "weirdest": W("weirdest"), "pushes": W("pushes."), "experiment": W("experiment,"), "two_people": W("two people"),
    "pressing": W("pressing"), "exactly": W("exactly"),
    "every_turn": W("Every single turn"), "force": W("force"), "forty": W("forty"),
    "pushed": W("pushed me"), "fight": W("fight in"), "history": W("history."),
    # rats
    "rats": W("rats?"), "tickle_rat": W("Tickle a rat"), "chirps": W("chirps..."), "sound": W("sound"), "high": W("too high"),
    "hear": W("hear."), "chase": W("chase"), "more": W("more."),
    # play
    "play": W("Play..."), "bond": W("bond."), "two_brains": W("two brains"),
    # turn
    "bug": W("bug."), "knows": W("knows..."), "someone": W("someone", s=find("someone else is")), "there": W("there."),
    # sunday
    "bell": S0["sunday"] + 0.35, "door": S0["sunday"] + 1.1, "quit": W("quit"),
    "only": W("only work"), "does_them": W("does them."), "final": E("them.") + 0.25,
}
# the training montage's hard cuts and the machine's crank turns
cues["day_cuts"] = [cues["day2"] - 0.06, cues["day6"] - 0.06]
cues["realize"] = cues["congrats"] - 1.1
# escalation turns: one push per 0.55 s from "Every single turn" to "percent"
cues["turns"] = [round(cues["every_turn"] + 0.1 + 0.55 * k, 3) for k in range(7)]
# the shoves in the fight
cues["shoves"] = [round(S0["fight"] + 0.35 + 0.62 * k, 3) for k in range(8)]
# ---- the subscribe cue
_sub_w = W("Subscribe...")
cues["sub_in"] = max(0.0, min(_sub_w - 0.30, T.duration - 2.6))
cues["sub_tap"] = min(E("Subscribe...") + 0.15, T.duration - 0.8)
T.write(shots, caps, cues, width=1920, height=1080)
