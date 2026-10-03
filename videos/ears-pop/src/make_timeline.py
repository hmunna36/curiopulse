"""Edit timeline for the Why Do Your Ears POP on a Plane? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

import numpy as np

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.1)  # after "bless you.": he sniffs, the seatbelt sign dings, the cabin tips up again (the loop)


def first_loud(t0, thr=-37.0, hop=0.01, span=1.5):
    """first moment at or after t0 where the narration is louder than thr dBFS (a take's real onset)"""
    t = t0
    while t < t0 + span:
        seg = T.audio[int(t * T.sr):int((t + hop) * T.sr)]
        if len(seg) and 10 * np.log10((seg ** 2).mean() + 1e-12) > thr:
            return round(t, 3)
        t += hop
    return t0


# v3 gave the [deadpan] tag's time to "Landing": the alignment starts the word 0.27 s after she starts saying it.
# Move it to the take's real onset (checked on the waveform), so the caption and the cut land on the word.
_i = T.find("Landing is worse")
T.ws[_i] = T.words[_i]["start"] = first_loud(T.block("landing")["start"])

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                        # the cabin tips up at take-off: he's pinned to his seat, the pressure builds in his ears ... POP
    ("burp", None),                        # close on him: stunned, then his ear says "burp" and he's mortified; the dive into the ear
    ("pocket", "Behind your eardrum"),     # the ear in section: down the canal to the eardrum, and the little pocket of air behind it
    ("climb", "As you climb"),             # cabin pressure drops: the air outside thins, the pocket swells, the eardrum bulges out
    ("tube", "until a tiny tube"),         # down the tube to the back of the nose: it burps the extra out, the eardrum snaps back
    ("landing", None),                     # hard cut: the cabin tips down, hands on his ears, his water bottle crumples
    ("squeeze", "Now the pocket"),         # the section again: the pocket shrinks, the eardrum is sucked in, the suction clamps the tube
    ("swallow", "So you swallow"),         # close on him: a gulp, then a huge yawn
    ("yank", "and a little muscle"),       # the muscle yanks the tube open, air rushes in, the eardrum pops back
    ("baby", "Babies can't"),              # row 12: he shows the baby how to yawn; the baby stares; then it cries, and its ears pop
    ("button", None),                      # the whole row suffers the scream; the baby, ears clear, is the only happy one
    ("sub", None),                         # he cries too (pop!), the sun hits him, ACHOO, subscribe, "bless you"; the cabin tips up again
]
special = {
    "burp": T.W("Relax") - 0.17,
    "landing": T.ws[_i] - 0.08,
    "button": first_loud(T.block("button")["start"]) - 0.08,
    "sub": first_loud(T.block("sub")["start"]) - 0.08,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Your plane / takes off", "and your ears", "go", "POP!",
    "Relax", "Your ear / just burped",
    "Behind your / eardrum", "is a tiny", "pocket / of air",
    "As you climb", "cabin pressure / drops", "so that air", "swells",
    "until a / tiny tube", "to the back / of your nose", "burps the / extra out",
    "Landing", "is worse",
    "Now the / pocket", "shrinks", "and the / suction", "clamps / that tube", "shut",
    "So you / swallow", "or yawn", "and a little / muscle", "yanks it open",
    "Babies can't / do that", "on purpose", "But crying", "can open / it too",
    "So that / screaming baby", "in row twelve", "Technically", "doing it / right",
    "Next up", "why sunlight", "makes some / of us", "sneeze", "Subscribe", "bless you",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "plane": C, "ears": O, "pop": Y,
    "relax": G, "ear": O, "burped": V,
    "eardrum": PK, "tiny": C, "pocket": C, "air": C,
    "climb": B, "pressure": R, "drops": R, "swells": Y,
    "tube": O, "nose": PK, "burps": V, "extra": V,
    "landing": R, "worse": R,
    "shrinks": B, "suction": R, "clamps": R, "shut": R,
    "swallow": G, "yawn": G, "muscle": PK, "yanks": Y, "open": G,
    "babies": PK, "can't": R, "purpose": Y, "crying": S,
    "screaming": R, "baby": PK, "12": Y, "technically": V, "right": G,
    "sunlight": Y, "sneeze": C, "subscribe": R, "bless": G,
}
DISPLAY = {"in row twelve": ["IN", "ROW", "12"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_sq = find("Now the pocket")
i_baby = find("Babies can't")
i_sub = find("Next up why")
cues = {
    # hook: take-off on frame 1, the pressure builds, and in the pause after "go..." the POP (her "POP!" lands on it)
    "your": W("Your plane"), "plane": W("plane"), "takes": W("takes"), "off": W("off"), "off_end": E("off"),
    "and": W("and your ears"), "ears": W("ears"), "ears_end": E("ears"), "go": W("go"), "go_end": E("go"),
    "pop_w": W("POP"), "pop_end": E("POP"),
    "pop": W("POP") - 0.10,                           # the picture and the cork pop: 0.1 s before her word, in the silence
    # burp
    "relax": W("Relax"), "relax_end": E("Relax"), "yourear": W("Your ear just"), "ear": W("ear", 0, find("Your ear just")),
    "just": W("just"), "burped": W("burped"), "burped_end": E("burped"),
    "burp": E("Relax") + 0.05,                        # his ear burps again, small, in the pause after "Relax." (then she explains)
    # pocket
    "behind": W("Behind"), "eardrum": W("eardrum"), "eardrum_end": E("eardrum"), "isa": W("is a tiny"), "tiny": W("tiny"),
    "pocket": W("pocket"), "air": W("air"), "air_end": E("air"),
    # climb
    "as": W("As you climb"), "climb": W("climb"), "climb_end": E("climb"), "cabin": W("cabin"), "pressure": W("pressure"),
    "drops": W("drops"), "drops_end": E("drops"), "so": W("so that air"), "thatair": W("air", 0, find("so that air")),
    "swells": W("swells"), "swells_end": E("swells"),
    # tube
    "until": W("until"), "tiny2": W("tiny", 0, find("until a tiny")), "tube": W("tube"), "tube_end": E("tube"),
    "tothe": W("to the back"), "back": W("back"), "nose": W("nose"), "nose_end": E("nose"), "burps": W("burps"),
    "burps_end": E("burps"), "extra": W("extra"), "out": W("out"), "out_end": E("out"),
    "vent": W("burps") + 0.04,                        # the tube pops open and the extra air leaves
    "snap": E("out") + 0.07,                          # the eardrum snaps back flat
    # landing
    "landing": T.ws[_i], "is": W("is worse"), "worse": W("worse"), "worse_end": E("worse"),
    "crunch": E("worse") + 0.03,                      # the bottle's last crumple, after the word
    # squeeze
    "now": T.ws[i_sq], "pocket2": T.ws[i_sq + 2], "shrinks": W("shrinks"), "shrinks_end": E("shrinks"),
    "andthe": W("and the suction"), "suction": W("suction"), "suction_end": E("suction"), "clamps": W("clamps"),
    "clamps_end": E("clamps"), "thattube": W("that tube shut"), "tube2": W("tube", 0, find("that tube shut")),
    "shut": W("shut"), "shut_end": E("shut"),
    "lock": E("shut") + 0.03,                         # the padlock clicks on, after "shut."
    # swallow
    "soyou": W("So you swallow"), "swallow": W("swallow"), "swallow_end": E("swallow"), "or": W("or yawn"),
    "yawn": W("yawn"), "yawn_end": E("yawn"),
    "gulp": E("swallow") + 0.02,
    # yank
    "anda": W("and a little"), "little": W("little"), "muscle": W("muscle"), "muscle_end": E("muscle"), "yanks": W("yanks"),
    "yanks_end": E("yanks"), "itopen": W("it open"), "open": W("open", 0, find("yanks it open")), "open_end": E("open", 0, find("yanks it open")),
    "pop2": E("open", 0, find("yanks it open")) + 0.06,   # the air is in, the eardrum pops back
    # baby
    "babies": T.ws[i_baby], "cant": W("can't"), "dothat": W("do that"), "purpose": W("purpose"), "purpose_end": E("purpose"),
    "but": W("But crying"), "crying": W("crying"), "crying_end": E("crying"), "can": W("can open"),
    "open2": W("open", 0, find("can open it")), "too": W("too"), "too_end": E("too"),
    "pop3": E("too") + 0.05,                          # the baby's ears pop
    # button
    "sothat": W("So that screaming"), "screaming": W("screaming"), "baby": W("baby"), "baby_end": E("baby"), "inrow": W("in row"),
    "twelve": W("twelve"), "twelve_end": E("twelve"), "technically": W("Technically"), "technically_end": E("Technically"),
    "doing": W("doing"), "right": W("right"), "right_end": E("right"),
    "hush": W("Technically") - 0.22,                  # the baby stops, mid-scream: its ears are clear
    "medal": E("right") + 0.04,
    # sub
    "chuckle": first_loud(T.block("sub")["start"]), "nextup": T.ws[i_sub], "up_end": T.we[i_sub + 1], "why": W("why sunlight"),
    "sunlight": W("sunlight"), "sunlight_end": E("sunlight"), "makes": W("makes"), "sneeze": W("sneeze"), "sneeze_end": E("sneeze"),
    "subscribe": W("Subscribe"), "subscribe_end": E("Subscribe"), "bless": W("bless"), "you_end": E("you", 0, find("bless you")),
    "pop4": T.ws[i_sub] - 0.10,                       # he cried too: his ears pop just before "Next up"
    "achoo": E("sneeze") + 0.07,                      # ACHOO, in the pause before "Subscribe"
}
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.W("subscribe")
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word (his sneeze blows it in), and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
# "Subscribe... bless you.": the cursor clicks in the pause after "Subscribe", so the click and bell never sit on "bless you"
cues["sub_tap"] = min(T.E("subscribe") + 0.10, T.duration - 0.8)
cues["loop"] = T.duration - 0.30                 # the seatbelt sign dings and the cabin starts to tip up: the last frames lead into frame 1
# the "sneeze" caption leaves as he sneezes: ACHOO! owns that moment (and the subscribe pill is on its way in)
for _c in caps:
    if _c["lines"][0][0]["t"] == "SNEEZE":
        _c["end"] = round(min(_c["end"], cues["achoo"]), 3)
T.write(shots, caps, cues)
