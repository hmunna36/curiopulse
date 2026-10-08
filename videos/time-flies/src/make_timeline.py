"""Edit timeline for the Why Does Time FLY as You Get Older? Short (the 30-35 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # after "happy birthday.": he breathes in over the cake (the picture of frame 1)

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


# "[deadpan] Relax." (drawn out: "Reee-lax"), "[deadpan] Now?" and "[mischievously] Subscribe..." start where their
# takes get loud
move_onset("Relax", "answer")
move_onset("Now", "now")
SUB = move_onset("Subscribe", "sub")

DUR = T.duration
LOOP = DUR - 0.50                          # he breathes in: the last half second runs into frame 1

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                        # the party, close: he blows out his candles; cake 30 lands, cake 31 lands. "Relax."
    ("brain", "Your brain measures"),      # inside: the brain pulls a tape measure out of a case marked TIME; its marks are photos
    ("kid", "As a kid"),                   # a summer day, age seven: everything is a first, and the tape pours out
    ("now", "Now"),                        # the office: the same desk, the same sandwich, days flying past the window; the tape is stuck
    ("payoff", "Scientists think"),        # the two tapes side by side: one summer, and all of last year. The aside plays here
    ("drop", "One lab"),                   # a night fair: a tower, a harness, a lever. He drops
    ("felt", "they remembered"),           # in the net: the real fall and the remembered one, as two bars
    ("new", "So try"),                     # still in the net: a new photo for the tape
    ("button", None),                      # the party again: a cake rises into frame. "happy birthday." He breathes in (the loop)
]
special = {
    "button": W("Or") - 0.07,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You blow out / your candles", "and it's / already", "your birthday", "again",
    "Relax", "Your brain", "measures / time", "in new / memories",
    "As a kid", "everything / is new", "one summer", "lasts / forever",
    "Now", "Same desk", "same lunch", "your brain", "doesn't / bother",
    "Scientists / think", "that's why", "a year / looks", "tiny",
    "Subscribe", "it gets / weirder",
    "One lab", "dropped / people", "off a / tower", "they / remembered", "the fall", "a third / longer",
    "So try", "something / new", "Or", "happy / birthday",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys): yellow = the reveals and "new", pink = the
# birthday and the brain, cyan = time, blue = the sameness, green = proof, red = what goes wrong
COLOR = {
    "candles": O, "already": Y, "birthday": PK, "again": Y,
    "relax": G, "brain": PK, "time": C, "new": Y, "memories": Y,
    "kid": G, "everything": Y, "summer": O, "forever": C,
    "now": R, "same": B, "desk": S, "lunch": S, "doesn't": R, "bother": R,
    "scientists": V, "year": C, "tiny": Y,
    "subscribe": R, "weirder": Y,
    "lab": V, "dropped": R, "tower": O, "remembered": Y, "fall": C, "third": G, "longer": G,
    "try": G, "something": Y, "or": R, "happy": PK,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

AGAIN = W("again")
MEM = W("memories")
KID = W("kid")
NEWK = W("everything is new", 2)
FOREVER = W("forever")
DROPPED = W("dropped")
TOWER_END = E("tower")
NET = TOWER_END + 0.03                      # he lands in the net, in the pause after "tower..."
REL = DROPPED + 0.10                        # the harness lets go
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: three birthdays in three seconds
    "blow": W("blow"),
    "out1": W("out") + 0.05,                # the candles of cake 29 go out
    "candles": W("candles"),
    "and": W("and it's"),
    "slam2": W("and it's", 1) - 0.03,       # cake 30 lands (a hat with it)
    "already": W("already"),
    "out2": W("your birthday", 1) + 0.04,   # he blows that one out too, faster
    "bday": W("your birthday", 1),
    "slam3": AGAIN,                         # cake 31 lands
    "again_end": E("again"),
    "horn": E("again") + 0.06,              # a party horn, in the pause
    "relax": T.ws[find("Relax")],
    "relax_end": E("Relax"),
    # 2. brain: the tape measure of photos
    "your": W("Your brain measures"),
    "measures": W("measures"),              # the tape comes out of the case
    "time": W("measures time", 1),
    "time_end": E("measures time", 1),
    "in_new": W("in new"),
    "new1": W("in new", 1),                 # the first photo lands on the tape
    "memories": MEM,
    "mem_end": E("memories"),
    "snaps": [W("in new", 1), MEM + 0.02, MEM + 0.24, MEM + 0.46, E("memories") + 0.08],   # a photo per snap
    "snap_snd": E("memories") + 0.08,       # the audible shutter, in the pause
    # 3. kid: everything is a first
    "as": W("As a kid"),
    "kid": KID,
    "kid_end": E("kid"),
    "everything": W("everything"),
    "is_new": NEWK,
    "is_new_end": E("everything is new", 2),
    "firsts": [KID + 0.10, E("kid") + 0.10, W("everything") + 0.32, NEWK + 0.05, E("everything is new", 2) + 0.12,
               E("everything is new", 2) + 0.36, W("one summer") + 0.12, W("one summer", 1) + 0.20, W("lasts") + 0.10],
    "first_snd": [E("kid") + 0.10, E("everything is new", 2) + 0.12, E("everything is new", 2) + 0.36],   # audible shutters, in the pauses
    "one": W("one summer"),
    "summer": W("one summer", 1),
    "lasts": W("lasts"),
    "forever": FOREVER,                     # the tape ties itself into a figure of eight
    "forever_end": E("forever"),
    # 4. now: the same day, again and again
    "now": T.ws[find("Now")],
    "now_end": E("Now"),
    "same1": W("Same desk"),
    "desk": W("Same desk", 1),
    "desk_end": E("Same desk", 1),
    "same2": W("same lunch"),
    "lunch": W("same lunch", 1),            # the bite
    "lunch_end": E("same lunch", 1),
    "your_b": W("your brain doesn't"),
    "doesnt": W("doesn't"),
    "bother": W("bother"),
    "bother_end": E("bother"),
    "snore": E("bother") + 0.05,            # the brain is asleep: one snore, in the pause
    # a page comes off the calendar: MON, TUE, WED, THU, FRI (two in pauses, with the sound of it; two under words)
    "flips": [E("Now") + 0.05, E("Same desk", 1) + 0.03, W("your brain doesn't"), W("bother") + 0.08],
    # 5. payoff: the two tapes
    "sci": W("Scientists"),
    "think": W("Scientists think", 1),
    "thats": W("that's why"),
    "why": W("that's why", 1),
    "a_year": W("a year"),
    "year": W("a year", 1),
    "looks": W("looks"),
    "looks_end": E("looks"),
    "tiny": W("tiny"),                      # last year's tape: one photo long
    "tiny_end": E("tiny"),
    "plink": E("tiny") + 0.05,              # its sound, in the pause
    "sub_w": T.ws[SUB],
    "it_gets": W("it gets"),
    "gets": W("it gets", 1),                # the brain reaches for a crash helmet
    "weirder": W("weirder"),
    "weirder_end": E("weirder"),
    "strap": E("weirder") + 0.06,           # the chin strap clicks, in the pause
    # 6. drop
    "one_lab": W("One lab"),
    "lab": W("One lab", 1),
    "dropped": DROPPED,
    "release": REL,                         # the lever comes down and the harness opens
    "people": W("people"),
    "off": W("off a"),
    "tower": W("tower"),
    "tower_end": TOWER_END,
    "net": NET,
    "burst": [round(REL + 0.12 + 0.11 * i, 3) for i in range(int((NET - REL - 0.2) / 0.11))],   # the brain's camera, on burst
    # 7. felt
    "they": W("they remembered"),
    "remembered": W("remembered"),          # the real fall: a bar and a stopwatch
    "the_fall": W("the fall"),
    "fall": W("the fall", 1),               # the remembered fall: the tape, drawn along it
    "fall_end": E("the fall", 1),
    "a_third": W("a third"),
    "third": W("a third", 1),               # ... and past the end of it
    "longer": W("longer"),                  # +36 %
    "longer_end": E("longer"),
    "ding": E("longer") + 0.05,
    # 8. new
    "so": W("So try"),
    "try": W("So try", 1),
    "something": W("something"),
    "new3": W("something new", 1),          # a new photo for the tape
    "new3_end": E("something new", 1),
    "click3": E("something new", 1) + 0.06,
    # 9. button
    "or": W("Or"),
    "or_end": E("Or"),
    "light": [E("Or") + 0.08, E("Or") + 0.24],   # the cake has slid in: its two candles light, in the pause after "Or..."
    # the candles and then a music box pick out six notes everyone knows (G G A G C B)
    # (two as the candles catch, in the pause after "Or..."; the other four after "birthday.", over his sigh)
    "tune": [E("Or") + 0.08, E("Or") + 0.24] + [E("happy birthday", 1) + 0.07 + 0.19 * i for i in range(4)],
    "happy": W("happy"),
    "bday2": W("happy birthday", 1),
    "bday2_end": E("happy birthday", 1),
    "sigh": E("happy birthday", 1) + 0.08,
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff.
# "Subscribe..." is drawn out and the alignment knew only its last syllable: the click waits for the word to end.
cues["sub_in"] = max(0.0, T.ws[SUB] - 0.30)
cues["sub_tap"] = max(T.we[SUB], T.ws[SUB] + 0.80) + 0.10   # in the "..." after the word, so the click never sits on a word
cues["sub_out"] = cues["sub_tap"] + 1.30
cues = {k: ([round(x, 3) for x in v] if isinstance(v, list) else round(v, 3)) for k, v in cues.items()}
# v3 ended "You" at 0.18 s while she says it until "blow" (the waveform): lengthen the word's window. After the shots,
# captions and cues are made, so the picture and the mix do not move.
_y = find("You blow")
T.we[_y] = T.words[_y]["end"] = round(min(T.ws[_y + 1] - 0.01, T.ws[_y] + 0.21), 3)
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[SUB]:.2f} s = {100 * T.ws[SUB] / T.duration:.0f} % of the runtime (must be 50-70 %); tap {cues["sub_tap"]:.2f}, next word {T.ws[SUB + 1]:.2f}')
for k, v in cues.items():
    print(f'  {k:12s} {v if isinstance(v, list) else format(v, "6.2f")}')
