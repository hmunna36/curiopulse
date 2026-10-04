"""Edit timeline for the Why Does Your Foot Fall ASLEEP? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.35)  # after "quietly.": his foot zaps once more and he tips into the gong again (the loop)

W, E, ev, find = T.W, T.E, T.ev, T.find


def move_onset(phrase, after, k=0):
    """v3 gives a tag's time to the word after it, so the alignment starts that word late. Move word k of `phrase`
    to the first loud frame after `after` (checked on the waveform)."""
    i = find(phrase) + k
    t0 = T.first_loud(after)
    if T.ws[i] - t0 > 0.08:
        T.ws[i] = T.words[i]["start"] = t0
    return i


# "[panicked] Pins", "[deadpan] badly", "[curious] needles?", "[whispers] quietly": each starts where the take gets loud again
move_onset("Pins and NEEDLES", E("fizz") + 0.12)
move_onset("badly", E("reboots") + 0.12)
i_need = move_onset("guesses needles", E("guesses") + 0.12, 1)
i_quiet = move_onset("Subscribe quietly", E("Subscribe") + 0.12, 1)
# the whispered "quietly." runs to the end of its take (the alignment gave it 0.09 s)
T.we[i_quiet] = T.words[i_quiet]["end"] = round(T.block("sub")["end"], 3)
T.we[i_need] = T.words[i_need]["end"] = round(max(T.we[i_need], T.block("static")["end"] - 0.02), 3)

CRASH = E("and") + 0.10               # he tips into the gong, in the silence after "and—"
GONG2 = T.duration - 0.40             # ... and again at the very end: frame 1 is the gong still ringing

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                          # the studio: he gets up from the mat, one leg is rubber, he tips into the gong
    ("floor", None),                         # close: he sits on the floor, the dead leg held up in his hands, serene; "still meditating"
    ("fizz", "Then comes the fizz"),         # the leg fills with static, then the pins and needles jab; PINS & NEEDLES
    ("squash", "You didn't cut off"),        # x-ray of the folded leg: blood still flows; the nerve squashed in the fold; its tiny vessels
    ("quiet", "Starved it goes"),            # the nerve goes dark below the squeeze: the signals stop
    ("brain", "Your brain can't"),           # the brain at its screen: FOOT: NO SIGNAL ... then it can't even find the foot
    ("reboot", "Then you move"),             # the leg unfolds, blood rushes back, the nerve reboots ... badly
    ("rec", "Scientists have recorded"),     # the nerve's fibres firing by themselves; the needle, the trace, 300 a second
    ("nothing", "Nothing is touching"),      # his foot: the pins were never there
    ("tv", "It's static"),                   # the brain's screen is pure static; it guesses: needles?
    ("harmless", "It's harmless"),           # the foot again: HARMLESS, the toes wiggle
    ("zen", None),                           # the studio: he sinks back into the pose and tries to look enlightened; subscribe; the gong again
]
special = {
    "floor": CRASH + 0.62,
    "zen": W("try to look") - 0.42,          # the cut lands in the pause before "and try to look..."
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Twenty minutes", "cross-legged", "You stand up", "and",
    "Your leg", "is still / meditating",
    "Then comes / the fizz", "Pins and / NEEDLES",
    "You didn't / cut off", "your / circulation", "You squashed", "a NERVE", "and the / tiny vessels", "that feed it",
    "Starved", "it goes quiet", "Your brain / can't feel", "the foot", "or find it",
    "Then you move", "Blood / rushes back", "and the nerve / reboots", "badly",
    "Scientists / have recorded", "its fibres / firing", "by themselves", "hundreds of / times a second",
    "Nothing is / touching", "your skin", "It's static", "and your brain / guesses", "needles",
    "It's harmless", "Wiggle / your toes", "and try / to look", "enlightened",
    "Next up", "why your / recorded voice", "sounds weird", "Subscribe", "quietly",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "20": Y, "cross-legged": V, "stand": C,
    "leg": O, "meditating": V,
    "fizz": C, "pins": Y, "needles": Y,
    "circulation": R, "squashed": R, "nerve": O, "tiny": R, "vessels": R,
    "starved": R, "quiet": B, "brain": PK, "foot": O, "find": Y,
    "move": G, "blood": R, "reboots": O, "badly": R,
    "scientists": C, "recorded": C, "themselves": Y, "hundreds": Y, "second": Y,
    "nothing": Y, "skin": PK, "static": C, "guesses": V,
    "harmless": G, "wiggle": Y, "toes": O, "enlightened": V,
    "voice": O, "weird": V, "subscribe": R, "quietly": S,
}
DISPLAY = {"twenty minutes": ["20", "MINUTES"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

i_still = find("Your leg is still")
i_sq = find("You squashed a NERVE")
i_brain = find("Your brain can't")
i_blood = find("Blood rushes back")
i_stat = find("It's static")
i_harm = find("It's harmless")
i_sub = find("Next up why")
JAB0 = T.ws[find("Pins and NEEDLES")]
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # hook
    "twenty": W("Twenty"), "cross": W("cross-legged"), "cross_end": E("cross-legged"), "you": W("You stand"), "stand": W("stand up"),
    "up": W("up"), "up_end": E("up"), "and": W("and"), "and_end": E("and"),
    "wobble": W("You stand") - 0.10,                  # he puts weight on the leg: it wobbles like rubber
    "buckle": W("and") + 0.12,                        # ... and folds under him
    "crash": CRASH,                                   # GONNNG
    # floor
    "yourleg": T.ws[i_still], "leg": T.ws[i_still + 1], "leg_end": T.we[i_still + 1], "is": T.ws[i_still + 2],
    "still": T.ws[i_still + 3], "meditating": W("meditating"), "meditating_end": E("meditating"),
    "lift": T.ws[i_still] - 0.25,                     # he picks the dead leg up with both hands
    "om": T.we[i_still + 1] + 0.08,                   # ... and it hangs there, serene: a tiny halo (in the pause after "leg...")
    "drop": E("meditating") + 0.05,                   # he lets go: it drops like a sandbag (after the line)
    # fizz
    "then": W("Then comes"), "fizz": W("fizz"), "fizz_end": E("fizz"), "pins": JAB0, "needles": W("NEEDLES"), "needles_end": E("NEEDLES"),
    "jabs": [round(JAB0 + 0.02 + 0.115 * k, 3) for k in range(12)],   # the pins go in, one after another, through "Pins and NEEDLES!"
    "title": E("NEEDLES") + 0.02,
    # squash
    "didnt": W("didn't"), "cut": W("cut off"), "circ": W("circulation"), "circ_end": E("circulation"),
    "yousq": T.ws[i_sq], "squashed": W("squashed"), "squashed_end": E("squashed"), "nerve": W("NERVE"), "nerve_end": E("NERVE"),
    "andthe": W("and the tiny"), "tiny": W("tiny"), "vessels": W("vessels"), "feed": W("feed"), "feed_end": E("it", 0, find("feed it")),
    "flowing": E("circulation") + 0.04,               # the STILL FLOWING tick (after the word)
    "clamp": W("squashed") + 0.05,                    # the fold bites down on the nerve
    # quiet
    "starved": W("Starved"), "starved_end": E("Starved"), "itgoes": W("it goes quiet"), "quiet": W("quiet"), "quiet_end": E("quiet"),
    # brain
    "brain": T.ws[i_brain + 1], "cant": W("can't"), "feel": W("feel"), "foot": W("foot"), "foot_end": E("foot"),
    "or": W("or find"), "find": W("find"), "find_end": E("it", 0, find("find it")),
    "nosignal": W("can't") - 0.04,                    # the screen cuts to NO SIGNAL
    "lost": W("or find") - 0.06,                      # ... and then to the map: the foot is a question mark
    # reboot
    "thenyou": W("Then you move"), "move": W("move"), "move_end": E("move"), "blood": T.ws[i_blood], "rushes": W("rushes"),
    "back": W("back"), "back_end": E("back"), "andnerve": W("and the nerve"), "nerve2": W("nerve", 0, find("the nerve reboots")),
    "reboots": W("reboots"), "reboots_end": E("reboots"), "badly": W("badly"), "badly_end": E("badly"),
    "unfold": W("move") - 0.10,                       # the leg swings open
    # rec
    "scientists": W("Scientists"), "recorded": W("recorded"), "recorded_end": E("recorded"), "fibres": W("fibres"),
    "firing": W("firing"), "bythem": W("by themselves"), "themselves": W("themselves"), "themselves_end": E("themselves"),
    "hundreds": W("hundreds"), "times": W("times"), "second": W("second"), "second_end": E("second"),
    "needle_in": W("recorded") - 0.10,                # the electrode slides in
    # nothing
    "nothing": W("Nothing"), "touching": W("touching"), "skin": W("skin"), "skin_end": E("skin"),
    # tv
    "its": T.ws[i_stat], "static": W("static"), "static_end": E("static"), "andyour": W("and your brain guesses"),
    "guesses": W("guesses"), "guesses_end": E("guesses"), "needles2": T.ws[i_need], "needles2_end": T.we[i_need],
    "think": W("guesses") - 0.05,                     # the thought bubble starts to form
    # harmless
    "harmless": W("harmless"), "harmless_end": E("harmless"), "wiggle": W("Wiggle"), "toes": W("toes"), "toes_end": E("toes"),
    "shield": T.ws[i_harm] + 0.10,
    # zen + sub
    "try": W("try to look"), "look": W("look"), "enlightened": W("enlightened"), "enlightened_end": E("enlightened"),
    "sit": W("try to look") - 0.50,                   # he drops back into the pose (he lands on "and", before "try")
    "halo": W("enlightened") + 0.10,                  # ... and floats, with a halo
    "nextup": T.ws[i_sub], "why": T.ws[i_sub + 2], "recorded2": W("recorded voice"), "voice": W("voice"), "sounds": W("sounds"),
    "weird": W("weird"), "weird_end": E("weird"), "subscribe": W("Subscribe"), "subscribe_end": E("Subscribe"),
    "quietly": T.ws[i_quiet], "quietly_end": T.we[i_quiet],
    "shh": T.ws[i_quiet] - 0.12,                      # the class shushes him as she whispers it
    "zap2": T.we[i_quiet] + 0.22,                     # one last jab in the foot ...
    "gong2": GONG2,                                   # ... he tips into the gong again: frame 1
}
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.W("subscribe")
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word, and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
# "Subscribe... quietly.": the cursor clicks in the pause right after "Subscribe", before the whisper
cues["sub_tap"] = min(T.E("subscribe") + 0.10, T.duration - 0.8)
# the "and" caption leaves as he hits the gong: the crash owns that moment
for _c in caps:
    if _c["lines"][0][0]["t"] == "AND" and len(_c["lines"][0]) == 1:
        _c["end"] = round(min(_c["end"], CRASH + 0.02), 3)
T.write(shots, caps, cues)
for k in ("wobble", "buckle", "crash", "lift", "om", "drop", "pins", "title", "flowing", "clamp", "nosignal", "lost", "unfold", "badly",
          "needle_in", "needles2", "shield", "sit", "halo", "sub_in", "sub_tap", "quietly", "zap2", "gong2"):
    print(f"  {k:9s} {cues[k]:6.2f}")
