"""Edit timeline for the Why Can't You Pat Your Head and Rub Your TUMMY? 🤚 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: FASTER's blur, then the cut back to frame 1 (the loop)

W, E, ev, find = T.W, T.E, T.ev, T.find

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),          # THE TEST: him in his office chair, TIGHT: right hand pats his head, left hand rubs his tummy;
                             # "SWAP!": both hands end up patting (tangled); he glances at us on "right?"
    ("mail", None),          # his head turns to glass; push into the mail room: the brain stamps PAT!, a copy slides out,
                             # two tubes; pull back: the cards race down BOTH arms, both hands pat
    ("again", None),         # back to him, slow motion: pat and rub; down to the tummy hand: a PAT card arrives, a bump
    ("shred", None),         # the mail room: the shredder pops onto the left tube; every copy shredded, three times
    ("payoff", None),        # him straining (gritted teeth, sweat), still patting and rubbing
    ("overtime", None),      # close on the shredder in his head: sweating, steaming, chomping, the overtime clock
    ("kids", None),          # a sunny kitchen: little him in a high chair, a baby shredder with a pacifier; duck, juice, 10
    ("button", None),        # the office, framed higher for the pill: FASTER, the hands blur
    ("loop", None),          # the last 0.45 s: the hook at negative time (frame 1 a moment earlier)
]
DUR = T.duration
special = {
    "mail": W("Your brain mails") - 0.12, "again": W("Go back") - 0.07, "shred": W("So your brain") - 0.07,
    "payoff": W("That's the strain") - 0.1, "overtime": W("A tiny") - 0.08, "kids": W("Little kids'") - 0.1,
    "button": W("Now try it") - 0.2, "loop": DUR - 0.45,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Pat your head.",
    "Rub your tummy.",
    "Now... SWAP!",
    "Tangled, right?",
    "Your brain / mails every order...",
    "to BOTH hands.",
    "Go back. / Slowly.",
    "Feel your / tummy hand?",
    "It got the / PAT order too.",
    "So your brain / shreds the copy...",
    "on every / single pat.",
    "That's the strain / you feel.",
    "A tiny / shredder...",
    "working / overtime.",
    "Little kids' / shredders",
    "are still / growing:",
    "squeeze / one hand...",
    "the other often / squeezes too.",
    "Till about / age TEN.",
    "Now try it...",
    "FASTER.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea: gold = the PAT order and its copy, cyan = the rub, red = the shredder
COLOR = {"pat": Y, "head": Y, "rub": C, "tummy": C, "swap": Y, "tangled": R, "mails": Y, "both": G, "slowly": C,
         "shreds": R, "copy": Y, "strain": O, "shredder": R, "overtime": O, "kids'": P["P"], "growing": G,
         "squeeze": O, "squeezes": O, "ten": Y, "faster": R}
DISPLAY = {"ten": ["10"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
sh = {s["id"]: s for s in shots}


def every(t0, t1, step, first=None):
    """beats from t0 (or `first`) every `step` seconds while they are before t1"""
    out, t = [], (t0 if first is None else first)
    while t < t1 - 1e-6:
        out.append(round(t, 3))
        t += step
    return out


PAT_HZ, RUB_HZ = 2.4, 1.1                      # the hook's pat (contacts a second) and rub (circles a second)
iPat = find("every single pat")                # the shred block's "pat"
cues = {
    "pat_hz": PAT_HZ, "rub_hz": RUB_HZ, "pat0": W("Pat"),          # a pat lands on the first word, and every 1/2.4 s
    # the hook
    "pat_w": W("Pat"), "head": W("head"), "rub_w": W("Rub"), "tummy": W("tummy"), "now": W("Now"), "now_end": E("Now"),
    "swap": W("SWAP"), "swap_end": E("SWAP"), "tangled": W("Tangled"), "right": W("right"), "right_end": E("right"),
    # the mail room
    "your": W("Your brain mails"), "brain": W("brain"), "mails": W("mails"), "every": W("every"), "order": W("order"),
    "order_end": E("order"), "to": W("to BOTH"), "both": W("BOTH"), "hands": W("hands"), "hands_end": E("hands"),
    # again, slowly
    "go": W("Go back"), "back": W("back"), "slowly": W("Slowly"), "slowly_end": E("Slowly"), "feel": W("Feel"),
    "tummy2": W("tummy hand"), "hand2": W("tummy hand", 1), "it": W("It got"), "pat2": W("PAT order"),
    "order2": W("PAT order", 1), "too": W("order too", 1), "too_end": E("order too", 1),
    # the shredder
    "so": W("So your brain"), "brain3": W("So your brain", 2), "shreds": W("shreds"), "copy": W("copy"),
    "copy_end": E("copy"), "on": W("on every"), "every3": W("every single"), "single": W("single"),
    "pat3": T.ws[iPat + 2], "pat3_end": T.we[iPat + 2],
    # the strain, the overtime
    "thats": W("That's"), "strain": W("strain"), "feel4": W("you feel", 1), "feel4_end": E("you feel", 1),
    "a_tiny": W("A tiny"), "tiny": W("tiny"), "shredder": W("shredder"), "shredder_end": E("shredder"),
    "working": W("working"), "overtime": W("overtime"), "overtime_end": E("overtime"),
    # the kids
    "little": W("Little"), "kids": W("kids'"), "shredders": W("shredders"), "growing": W("growing"),
    "growing_end": E("growing"), "squeeze": W("squeeze one"), "one": W("one hand"), "hand5": W("one hand", 1),
    "other": W("other"), "often": W("often"), "squeezes": W("squeezes"), "too5": W("squeezes too", 1),
    "too5_end": E("squeezes too", 1), "till": W("Till"), "age": W("age"), "ten": W("TEN"), "ten_end": E("TEN"),
    # the button
    "now6": W("Now try"), "try": W("try"), "faster": W("FASTER"), "faster_end": E("FASTER"),
}
c = cues
# the pats on his head (contacts), a schedule both the picture and the sound read
hook_pats = every(0, c["swap"] - 0.05, 1 / PAT_HZ, first=c["pat0"])                 # the right hand on his head
tangle_pats = every(c["swap"] + 0.3, sh["mail"]["start"] + 0.2, 0.38)               # after SWAP: both hands, in unison
both_pats = every(c["hands"] - 0.1, sh["again"]["start"] + 0.1, 0.42)              # the orders arrive: both hands pat
slow_pats = every(c["pat2"] + 0.02 - 4 * 0.8, sh["shred"]["start"], 0.8)          # slow motion; one lands on "PAT" (the copy arrives)
shred_pats = [round(x, 3) for x in [c["so"] + 0.1, c["shreds"] - 0.05, c["copy"] - 0.02, c["on"] - 0.2,
                                    c["every3"] + 0.02, c["single"] + 0.02, c["pat3"] + 0.02, c["pat3_end"] + 0.1]]
strain_pats = every(c["thats"] + 0.05, sh["overtime"]["start"], 1 / PAT_HZ)
over_chomps = every(c["tiny"] - 0.05, sh["kids"]["start"] - 0.15, 0.36)           # the shredder, chomping
fast_pats = every(c["now6"] + 0.02, sh["loop"]["start"], 0.24)                     # FASTER
# the stamps in the mail room (each makes a card and a copy)
cues.update({
    "hook_pats": hook_pats, "tangle_pats": tangle_pats, "both_pats": both_pats, "slow_pats": slow_pats,
    "shred_pats": shred_pats, "strain_pats": strain_pats, "over_chomps": over_chomps, "fast_pats": fast_pats,
    "stamp1": c["mails"] + 0.05,                       # STAMP: the PAT! card
    "copy1": c["every"] + 0.1,                         # a copy slides out from under it
    "drop1": c["order"] + 0.25,                        # both cards drop into their tubes
    "pull1": c["order"] + 0.45,                        # the camera pulls back out of his head
    "arrive1": c["both"] + 0.15,                       # the cards reach both hands (both_pats start just after)
    "card2_in": c["hand2"] - 0.6,                      # again: a PAT copy enters the left tube...
    "card2_at": c["pat2"] + 0.02,                      # ...and reaches his wrist: the tummy hand bumps
    "shredder_in": c["shreds"] - 0.15,                 # the shredder pops onto the left tube's mouth
    "duck": E("one hand", 1) + 0.01,                  # SQUEAK in the pause after "hand..."
    "juice": c["squeezes"] + 0.05, "jet0": c["too5"] - 0.1, "splat": c["too5_end"] + 0.02,   # SPLAT in the pause after "too."
    "cake": c["till"] - 0.1, "grow": c["ten"] - 0.05,
})
assert c["swap"] < c["tangled"] < c["mails"] < c["both"] < c["slowly"] < c["pat2"] < c["shreds"] < c["pat3"] < c["strain"]
assert c["pat3"] > c["single"], "the third 'pat' must be the shred block's"
assert c["shredder"] < c["overtime"] < c["kids"] < c["squeezes"] < c["ten"] < c["faster"]
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026). publish.json "subscribe" says the arm; T.write sets the
# pill's cues for the pill arm by itself. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots: ' + ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
