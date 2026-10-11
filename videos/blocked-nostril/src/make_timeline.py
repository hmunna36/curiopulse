"""Edit timeline for the Why Is One Nostril ALWAYS Blocked? Short (the 30-35 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.25)  # after "...on shift now.": his finger goes back to the nostril, and the cut to frame 1

W, E, ev, find = T.W, T.E, T.ev, T.find
DUR = T.duration
LOOP = round((DUR - 0.40) * 30) / 30   # the last 0.4 s: the mirror again, his finger on its way to the nostril (frame 1)

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),      # ONE shot through the answer: close on his face in the bathroom mirror, a finger on one nostril,
                         # a sniff, nothing; two signs drop out of his nostrils (ON BREAK / ON SHIFT); a window opens on
                         # his nose and the camera dives in
    ("mech", None),      # inside his nose, from the front: one side's spongy tissue fills with blood, the other shrinks
    ("swap", None),      # the same view, wider: a clock spins and the two sides swap
    ("cold", None),      # the mirror again, with a cold: red nose, blanket, tissue; the second sign flips too
    ("weird", None),     # a jar under his nose: a fast lane and a slow lane, a thought per nostril
    ("button", None),    # he checks: one side, then the other
    ("loop", None),      # the picture of frame 1 again (the hook's state at negative time)
]
special = {
    "mech": W("Spongy tissue") - 0.10,
    "swap": W("Every few") - 0.12,
    "cold": W("You mostly") - 0.14,
    "weird": W("Weirder") - 0.12,
    "button": W("Go on") - 0.18,
    "loop": LOOP,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You pinch", "one nostril / shut", "and the / other one's", "blocked",
    "Relax", "your nostrils", "work in / shifts", "and that one's", "on its / break",
    "Spongy tissue", "inside", "fills with / blood", "and swells / one side", "nearly / shut", "while / the other", "opens / wide",
    "Every / few hours", "they / swap",
    "You mostly / notice", "when a cold", "swells / both",
    "Weirder", "one / fast", "one / slow", "so each / nostril", "smells / the world", "a little", "differently",
    "Go on", "check who's", "on shift / now",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea: red = blocked and blood, green = open and working, yellow = the reveal,
# cyan = air and fast, orange = slow, pink = the tissue, violet = the odd one
COLOR = {
    "pinch": Y, "blocked": R,
    "relax": G, "shifts": Y, "break": R,
    "spongy": PK, "tissue": PK, "blood": R, "swells": R, "shut": R, "opens": G, "wide": G,
    "hours": Y, "swap": Y,
    "cold": B, "both": R,
    "weirder": V, "fast": C, "slow": O, "smells": Y, "differently": Y,
    "check": Y, "shift": G, "now": G,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

BLOCKED_E = E("blocked")
BREAK_E = E("its break", 1)
SWAP_E = E("they swap", 1)
BOTH_E = E("swells both", 1)
DIFF_E = E("differently")
NOW_E = E("shift now", 1)
I_ONE_FAST = find("one fast")
I_ONE_SLOW = find("one slow")
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: a finger on one nostril, a sniff through the other
    "pinch": W("pinch"),
    "nostril": W("one nostril", 1),
    "shut": W("nostril shut", 1),
    "shut_end": E("nostril shut", 1),
    "other": W("other one's"),
    "blocked": W("blocked"),                 # the sniff stops dead
    "blocked_end": BLOCKED_E,
    "honk": BLOCKED_E + 0.05,                # the blocked squeak, alone in the pause
    # the answer, over the same shot
    "relax": W("Relax"),                     # he lets go, and breathes through the other one
    "relax_end": E("Relax"),
    "your": W("your nostrils"),
    "nostrils": W("your nostrils", 1),
    "work": W("work in"),
    "shifts": W("in shifts", 1),             # two signs drop out of his nose
    "shifts_end": E("in shifts", 1),
    "that": W("that one's"),
    "ones": W("that one's", 1),
    "its": W("on its", 1),
    "break": W("its break", 1),              # the blocked one snores
    "break_end": BREAK_E,
    "snore": BREAK_E + 0.04,
    "window": W("that one's") - 0.05,        # a window opens on his nose
    "dive": SH["mech"]["start"] - 0.24,      # the camera goes in
    # 2. mech: inside his nose
    "spongy": W("Spongy"),
    "tissue": W("Spongy tissue", 1),
    "inside": W("inside"),
    "fills": W("fills with"),                # blood comes in on one side
    "blood": W("with blood", 1),
    "blood_end": E("with blood", 1),
    "swells": W("and swells", 1),
    "side": W("one side", 1),
    "nearly": W("nearly shut"),
    "shut2": W("nearly shut", 1),
    "shut2_end": E("nearly shut", 1),
    "squeak": E("nearly shut", 1) + 0.05,    # a balloon squeak, in the pause
    "while": W("while the"),
    "opens": W("opens wide"),                # the other side shrinks
    "wide": W("opens wide", 1),
    "wide_end": E("opens wide", 1),
    # 3. swap
    "every": W("Every few"),
    "few": W("Every few", 1),
    "hours": W("few hours", 1),
    "hours_end": E("few hours", 1),
    "they": W("they swap"),
    "swap": W("they swap", 1),               # one side lets go, the other fills
    "swap_end": SWAP_E,
    "ding": SWAP_E + 0.06,                   # the shift bell, after the word
    # 4. cold
    "mostly": W("mostly"),
    "notice": W("notice"),
    "cold": W("a cold", 1),                  # the germ waves
    "cold_end": E("a cold", 1),
    "swells2": W("swells both"),
    "both": W("swells both", 1),             # the second sign flips too
    "both_end": BOTH_E,
    "gasp": BOTH_E + 0.06,                   # he breathes through his mouth, in the pause
    # 5. weird: a jar under his nose
    "weirder": W("Weirder"),
    "weirder_end": E("Weirder"),
    "one1": T.ws[I_ONE_FAST],
    "fast": W("one fast", 1),
    "fast_end": E("one fast", 1),
    "one2": T.ws[I_ONE_SLOW],
    "slow": W("one slow", 1),
    "slow_end": E("one slow", 1),
    "so": W("so each"),
    "each": W("so each", 1),
    "smells": W("smells the"),
    "world": W("the world", 1),
    "little": W("a little", 1),
    "differently": W("differently"),         # two thoughts: mint on one side, petrol on the other
    "differently_end": DIFF_E,
    "yuck": DIFF_E + 0.05,
    # 6. button
    "go": W("Go on"),
    "on": W("Go on", 1),
    "on_end": E("Go on", 1),
    "check": W("check who's"),               # the finger goes to the other nostril ...
    "whos": W("check who's", 1),
    "shift": W("on shift", 1),               # ... and comes back
    "now": W("shift now", 1),
    "now_end": NOW_E,
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): SILENT, over the last seconds (since 9 Oct 2026; reference/analytics.md).
# Nobody says "subscribe": wherever the word was spoken, as the last line or mid-video, a quarter to a half of the
# viewers still watching left within three seconds of it. The pill pops in 3.4 s before the end, the cursor clicks
# 1.25 s later, and the pill has popped out 0.6 s before the cut back to frame 1, so the loop stays clean. It plays
# over the button shot while the last line is spoken; captions that share the screen with it sit at y 1150 (main.js).
cues["sub_in"] = T.duration - 3.40
cues["sub_tap"] = cues["sub_in"] + 1.25
cues["sub_out"] = cues["sub_tap"] + 1.30       # + 0.24 s of pop-out: gone 0.61 s before the end
cues = {k: ([round(x, 3) for x in v] if isinstance(v, list) else round(v, 3)) for k, v in cues.items()}
# a chunk that would end a moment inside the pill's window is lifted to y 1150 for its whole life (main.js): it ends
# just before the pill instead, and stays where it is (why-we-cry, 10 Oct 2026)
for _c in caps:
    if _c["start"] < cues["sub_in"] < _c["end"] < cues["sub_in"] + 0.3:
        _c["end"] = round(cues["sub_in"] - 0.08, 3)
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first cut: {shots[1]["start"]:.2f} s (7.0 s or later: the opening is one shot through the answer)' if len(shots) > 1 else 'first cut: none')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print(f'subscribe cue: silent, the pill is up {cues["sub_in"]:.2f}-{cues["sub_out"] + 0.24:.2f} s of {T.duration:.2f} s'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for k, v in cues.items():
    print(f'  {k:14s} {v if isinstance(v, list) else format(v, "6.2f")}')
