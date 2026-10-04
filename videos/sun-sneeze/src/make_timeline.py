"""Edit timeline for the Why Does the SUN Make You SNEEZE? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.35)  # after "again.": he gives up and bolts back into the dark cinema; the door slams (the loop)

W, E, ev, find = T.W, T.E, T.ev, T.find


def onset(phrase, bid):
    """v3 gives a tag's time to the take's first word, so the alignment starts that word late (and 0.08 s long).
    Move it to the first loud frame after the tag starts (checked on the waveform)."""
    i = find(phrase)
    t0 = T.first_loud(T.block(bid)["start"]) if bid else None
    return i, t0


# [deadpan] Bless you. / [deadpan] Doctors did that... / [deadpan] Bless you... again.: the word starts where the take gets loud
for phrase, bid in (("Bless you", "bless"), ("Doctors did", "purpose")):
    i, t0 = onset(phrase, bid)
    if T.ws[i] - t0 > 0.1:
        T.ws[i] = T.words[i]["start"] = t0
i_again = find("Bless you again")
_t0 = T.first_loud(T.block("again")["start"])
if T.ws[i_again] - _t0 > 0.1:
    T.ws[i_again] = T.words[i_again]["start"] = _t0
# "[panicked] something's": the tag sits inside the take, after "hears:". The word starts at the first loud frame after the pause.
i_some = find("something's up")
_t0 = T.first_loud(E("hears") + 0.12)
if T.ws[i_some] - _t0 > 0.1:
    T.ws[i_some] = T.words[i_some]["start"] = _t0

ACHOO1 = E("and") + 0.10            # the first sneeze: in the silence after "and—"
ACHOO2 = ACHOO1 + 0.80              # ... and the second, bigger
BLAST = E("FIRE") + 0.03            # three generations sneeze in a row (the cut to the family lands here)

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                          # the cinema door bursts open: he steps out of the dark into the sun ... ah ... ah ... ACHOO, ACHOO
    ("bless", None),                         # close on him, dazed, popcorn in his hair; "Bless you."; a cold germ pops up and gets crossed out
    ("onein4", "About one in four"),         # four people leave the cinema; the one who crosses into the sun (him) sneezes; 1 IN 4
    ("why", None),                           # dive into his head: the profile in section; two wires, drawn on; BEST GUESS
    ("mech", "The nerve from your"),         # eye nerve -> where they run close -> the nose's nerve; light floods in, fires one, spills into the other
    ("fire", "So your brain"),               # the brain panics: NOSE ALERT, the big red SNEEZE button, FIRE!
    ("family", None),                        # hard cut: gran, him and the kid sneeze one after another; "It runs in families."
    ("card", "And its real medical"),        # the doctor's chart: A C H O O, spelled out; he stares at us: on purpose
    ("button", "What helps"),                # the street again: sunglasses drop on, smug; the foot tease; subscribe; he peeks ... ACHOO ... again; back inside
]
special = {
    "bless": ACHOO2 + 0.52,
    "why": T.first_loud(T.block("why")["start"]) - 0.08,
    "family": BLAST - 0.02,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "You step out", "of a / dark cinema", "into / the sun", "and",
    "Bless you",
    "It's not / a cold",
    "About / one in four", "people / sneeze", "at sudden / bright light",
    "Why",
    "Scientists / think it's", "crossed / wires",
    "The nerve from / your eyes", "runs close", "to the nerve", "that guards / your nose",
    "A sudden / flood of light", "fires one", "and spills", "into / the other",
    "So your / brain hears", "something's / up the nose", "FIRE",
    "It runs / in families",
    "And its real / medical name",
    "Ah-choo / syndrome",
    "Doctors / did that", "on purpose",
    "What helps", "Sunglasses",
    "Next up", "why your foot", "falls asleep", "Subscribe", "Bless you", "again",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "dark": V, "cinema": V, "sun": Y,
    "bless": G, "not": R, "cold": R,
    "1": Y, "4": Y, "sneeze": C, "sudden": O, "bright": Y, "light": Y,
    "why": Y, "scientists": C, "crossed": R, "wires": O,
    "eyes": Y, "close": R, "guards": G, "nose": PK,
    "flood": Y, "fires": O, "spills": R, "other": PK,
    "brain": PK, "something's": O, "fire": R,
    "families": G,
    "medical": C, "name": C, "achoo": Y, "syndrome": Y,
    "doctors": C, "purpose": Y,
    "helps": G, "sunglasses": C,
    "foot": O, "asleep": V, "subscribe": R, "again": Y,
}
DISPLAY = {"one in four": ["1", "IN", "4"], "ah-choo": ["ACHOO"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

i_mech = find("The nerve from your")
i_flood = find("A sudden flood")
i_fam = find("It runs in families")
i_sub = find("Next up why")
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # hook
    "dark": W("dark"), "cinema": W("cinema"), "cinema_end": E("cinema"), "into": W("into the sun"), "sun": W("sun"), "sun_end": E("sun"),
    "and": W("and"), "and_end": E("and"),
    "tingle": W("into the sun") + 0.10,               # ... and by "into the sun" it is unbearable
    "prickle": W("cinema"),                           # the light is on his face: his nose starts to prickle (the phenomenon starts small, at once)
    "windup": W("and") - 0.12,                        # ah ... ah ...
    "achoo1": ACHOO1, "achoo2": ACHOO2,
    # bless
    "bless": T.ws[find("Bless you")], "bless_end": E("you", 0, find("Bless you")), "its": W("It's not"), "not": W("not"), "cold": W("cold"), "cold_end": E("cold"),
    "germ": W("It's not") - 0.10,                     # the cold germ pops up beside him
    "xcold": W("cold") + 0.02,                        # ... and gets crossed out (the thud lands after "cold.")
    # one in four
    "about": W("About"), "one": W("one in four"), "four": W("four"), "four_end": E("four"), "people": W("people"),
    "sneeze": W("sneeze"), "sneeze_end": E("sneeze"), "at": W("at sudden"), "sudden": W("sudden"), "bright": W("bright"),
    "light": W("light"), "light_end": E("light"),
    "achoo3": E("light") + 0.05,                      # he crosses into the sun: ACHOO (in the pause after "light.")
    # why
    "why": W("Why"), "why_end": E("Why"), "scientists": W("Scientists"), "think": W("think"), "crossed": W("crossed"),
    "wires": W("wires"), "wires_end": E("wires"),
    "guess": E("wires") + 0.02,                       # the BEST GUESS stamp
    # mech
    "nerve1": T.ws[i_mech + 1], "eyes": W("eyes"), "eyes_end": E("eyes"), "runs": W("runs close"), "close": W("close"), "close_end": E("close"),
    "nerve2": W("nerve", 0, find("to the nerve")), "guards": W("guards"), "nose": W("nose"), "nose_end": E("nose"),
    "sudden2": T.ws[i_flood + 1], "flood": W("flood"), "light2": T.ws[i_flood + 4], "fires": W("fires"), "fires_end": E("fires"),
    "one_end": E("one", 0, find("fires one")), "spills": W("spills"), "spills_end": E("spills"), "other": W("other"), "other_end": E("other"),
    # fire
    "so": W("So your brain"), "brain": W("brain"), "hears": W("hears"), "hears_end": E("hears"),
    "alert": T.ws[i_some], "upthe": W("up the nose"), "nose2": W("nose", 0, find("up the nose")), "nose2_end": E("nose", 0, find("up the nose")),
    "fire": W("FIRE"), "fire_end": E("FIRE"),
    "slam": W("FIRE") + 0.06,                         # the brain slams the big red button
    # family: gran, him, the kid, a beat apart, in the pause after "FIRE!"
    "blast": BLAST, "fam1": BLAST + 0.06, "fam2": BLAST + 0.27, "fam3": BLAST + 0.48,
    "itruns": T.ws[i_fam], "families": W("families"), "families_end": E("families"),
    # card
    "andits": W("And its real"), "real": W("real"), "medical": W("medical"), "name": W("name"), "name_end": E("name"),
    "achoo": W("Ah-choo"), "achoo_end": E("Ah-choo"), "syndrome": W("syndrome"), "syndrome_end": E("syndrome"),
    "doctors": T.ws[find("Doctors did")], "did": W("did that"), "on": W("on purpose"), "purpose": W("purpose"), "purpose_end": E("purpose"),
    "stare": T.ws[find("Doctors did")] - 0.18,        # the camera drops to him: the stare
    "real": E("purpose") + 0.04,                      # the REAL. SINCE 1978. stamp (after the line)
    "bwomp": E("syndrome") + 0.03,                    # the blat after the reveal
    "buzz": E("cold") + 0.03,                         # the buzzer on the crossed-out germ (after "cold.")
    # button
    "what": W("What helps"), "helps": W("helps"), "helps_end": E("helps"), "sunglasses": W("Sunglasses"), "sunglasses_end": E("Sunglasses"),
    "shades": W("Sunglasses") - 0.16,                 # they drop out of the sky and land as she says it
    "ting": E("Sunglasses") + 0.04,                   # the glint
    "chuckle": T.first_loud(T.block("sub")["start"]), "nextup": T.ws[i_sub], "up_end": T.we[i_sub + 1], "why2": T.ws[i_sub + 2],
    "foot": W("foot"), "falls": W("falls"), "asleep": W("asleep"), "asleep_end": E("asleep"),
    "subscribe": W("Subscribe"), "subscribe_end": E("Subscribe"),
    "peek": E("Subscribe") - 0.05,                    # he lifts the shades to look at the button ...
    "achoo4": E("Subscribe") + 0.30,                  # ... ACHOO (in the pause before "Bless you")
    "bless2": T.ws[i_again], "you2_end": T.we[i_again + 1], "again": W("again"), "again_end": E("again"),
    "achoo5": T.we[i_again + 1] + 0.10,               # ... and again, in the pause before "again."
    "dash": E("again") + 0.22,                        # he bolts for the door
    "slamdoor": E("again") + 0.86,                    # the door slams behind him: frame 1 is that door bursting open
}
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.W("subscribe")
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word, and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
# "Subscribe! ... Bless you... again.": the cursor clicks in the pause right after "Subscribe!", before the sneeze
cues["sub_tap"] = min(T.E("subscribe") + 0.10, T.duration - 0.8)
# the "and" caption leaves as he sneezes: ACHOO! owns that moment
for _c in caps:
    if _c["lines"][0][0]["t"] == "AND" and len(_c["lines"][0]) == 1:
        _c["end"] = round(min(_c["end"], ACHOO1 + 0.02), 3)
# "What helps?": v3's alignment gives "What" an 0.08 s slot just BEFORE she says it (the take is silent there), so
# qa.py measured the room tone instead of the word. Move the word's window onto the word (the first loud frame), after
# the shots, captions and cues are set: nothing in the picture or the mix moves.
_i = find("What helps")
_t0 = T.first_loud(T.ws[_i])
if _t0 - T.ws[_i] > 0.04:
    T.words[_i]["start"] = round(_t0, 3)
    T.words[_i]["end"] = round(max(T.we[_i], min(T.ws[_i + 1] - 0.01, _t0 + 0.2)), 3)
T.write(shots, caps, cues)
for k in ("achoo1", "achoo2", "bless", "germ", "xcold", "achoo3", "guess", "alert", "slam", "blast", "stare", "shades", "sub_in", "sub_tap", "achoo4", "bless2", "achoo5", "again", "dash", "slamdoor"):
    print(f"  {k:9s} {cues[k]:6.2f}")
