"""Edit timeline for the Why Can't You TICKLE Yourself? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # the button beat (he shrugs and goes straight back to tickling) and the cut back to
#                                      frame 1 for the loop

# v3 gave two words their start in the pause before them (qc_inband: "It" and "Good" read -49/-41 dB full band): move them
# to the take's real onset
# ("It" really starts 0.5 s after its stamp, right where the stamp says it ends: it is a short word just before "turns")
for ph, after in (("It turns", "surprise?"), ("...Good luck.", "robot?")):
    i = T.find(ph, T.find(after) + 1)
    on = T.first_loud(T.we[i - 1] + 0.04)
    if on > T.ws[i] + 0.06:
        T.ws[i] = T.words[i]["start"] = on - 0.01
        if T.we[i] < on + 0.08:
            T.we[i] = T.words[i]["end"] = min(on + 0.08, T.ws[i + 1])
assert abs(T.ws[T.find("It turns")] - 14.0) < 0.1, T.ws[T.find("It turns")]

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),                  # THE TEST: his right hand up beside his face, palm to us, tight; the index finger of his
                                     # other hand tickling it, eager; nothing; "Nothing, right?" a flat look at us; "Your
                                     # brain" a round window opens on his forehead: the brain inside, reading a book called
                                     # THE TICKLE, bored; "spoiler" a SPOILERS sticker slaps onto the cover
    ("brain", "Your brain keeps"),   # through the window: the brain's room. A wall screen shows YOUR PALM live (his finger
                                     # tickling it); the copier prints a COPY of every move; a dashed ring lands exactly
                                     # where the finger lands, and it does: a tick
    ("knob", "No surprise?"),        # closer, on the desk: the touch comes in on the meter, and the brain, yawning, turns
                                     # the big FEELING knob down to MIN
    ("payoff", "But someone"),       # back in the room, a little wider: Pip (his niece) leans in from the right, one finger
                                     # out; it lands on his palm; "No warning..." the window pops open: the brain's screen
                                     # shows a pink finger and ???, its knob spins to MAX; "fall apart" he cracks up
    ("lab", "Scientists had"),       # a lab: his right palm up, his left hand on a HANDLE; a robot arm with a pink foam tip
                                     # copies the handle on his palm; DELAY 0.0 s, bored; "a fifth of a second late"
                                     # 0.2 s: the foam lags; "it TICKLED!" he giggles helplessly, the TICKLE meter hits the top
    ("button", "No robot?"),         # back home, the hook's framing: a thought bubble with the robot, crossed out; "Good
                                     # luck" a shrug, and straight back to tickling his palm: frame 1
    ("loop", None),                  # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Try to tickle / your own palm.", "Right now.",
    "Nothing, / right?", "Your brain read / the spoiler.",
    "Your brain / keeps a copy", "of every / move...", "so it knows / exactly", "where your / finger lands.",
    "No surprise?", "It turns the / feeling down.",
    "But someone / ELSE's finger?", "No warning...", "and you / fall apart.",
    "Scientists / had a robot", "copy your / own tickle...", "a fifth of / a second late.", "And suddenly...", "it TICKLED!",
    "No robot?", "...Good luck.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"tickle": Y, "palm": C, "nothing": R, "brain": P["P"], "spoiler": V, "copy": Y, "exactly": G, "lands": G,
         "surprise": O, "down": R, "elses": Y, "warning": R, "apart": O, "robot": C, "fifth": Y, "second": Y, "late": Y,
         "suddenly": O, "tickled": G, "luck": V}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iA = find("Nothing, right?")
iC = find("Your brain keeps")
iP = find("But someone")
iW = find("Scientists had")
iB = find("No robot?")
cues = {
    # the hook: he tickles, eager; harder on "Right now"
    "try": W("Try"), "tickle1": W("tickle"), "palm": W("palm."), "palm_end": E("palm."), "right1": W("Right now."), "now_end": E("now."),
    # the answer: nothing; the window on his forehead; the book; SPOILERS
    "nothing": W("Nothing,"), "nothing_end": E("Nothing,"), "right2": W("right?", s=iA), "right2_end": E("right?", s=iA),
    "your1": W("Your brain read"), "brain1": W("brain", s=iA), "read": W("read"), "spoiler": W("spoiler."), "spoiler_end": E("spoiler."),
    # the brain's room: the copy, every move, the forecast, the landing
    "your2": W("Your", s=iC), "keeps": W("keeps"), "copy1": W("copy", s=iC), "copy1_end": E("copy", s=iC), "every": W("every"),
    "move": W("move..."), "move_end": E("move..."), "so": W("so it"), "knows": W("knows"), "exactly": W("exactly"),
    "where": W("where"), "finger1": W("finger", s=iC), "lands": W("lands."), "lands_end": E("lands."),
    # the knob
    "no1": W("No surprise?"), "surprise": W("surprise?"), "surprise_end": E("surprise?"), "turns": W("turns"),
    "feeling": W("feeling"), "down": W("down."), "down_end": E("down."),
    # Pip's finger, the alarm, he falls apart
    "but": W("But", s=iP), "someone": W("someone"), "else": W("ELSE's"), "finger2": W("finger?", s=iP), "finger2_end": E("finger?", s=iP),
    "no2": W("No warning..."), "warning": W("warning..."), "warning_end": E("warning..."), "and_you": W("and you fall"),
    "fall": W("fall"), "apart": W("apart."), "apart_end": E("apart."),
    # the lab
    "scientists": W("Scientists"), "robot1": W("robot", s=iW), "copy2": W("copy", s=iW), "own2": W("own", s=iW),
    "tickle2": W("tickle...", s=iW), "tickle2_end": E("tickle...", s=iW), "fifth": W("fifth"), "second": W("second"),
    "late": W("late."), "late_end": E("late."), "and_sud": W("And suddenly..."), "suddenly": W("suddenly..."),
    "suddenly_end": E("suddenly..."), "it3": W("it TICKLED!"), "tickled": W("TICKLED!"), "tickled_end": E("TICKLED!"),
    # the button
    "no3": W("No", s=iB), "robot2": W("robot?", s=iB), "robot2_end": E("robot?", s=iB), "good": W("...Good"),
    "luck": W("luck."), "luck_end": E("luck."),
}
cues["loop_in"] = T.duration - 0.40
_order = ["try", "palm", "right1", "now_end", "nothing", "right2", "your1", "spoiler", "your2", "copy1", "move", "so",
          "exactly", "lands", "no1", "turns", "down", "but", "else", "finger2", "no2", "and_you", "apart", "scientists",
          "copy2", "tickle2", "fifth", "late", "and_sud", "tickled", "no3", "robot2", "good", "luck_end", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
# ---- no Subscribe pill (since 16 Oct 2026; user, 15 Oct: "yes"; reference/analytics.md, the rules of 15 Oct). The
# silent pill over the last 3.4 s still made about a quarter of the viewers leave in the last 4 s and added no
# subscribers; replays carried the channel's breakout. So the Short ends on the button line and cuts back to frame 1.
# Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"]: web/subscribe.js draws the pill only when they exist, and
# qa.py fails a Short that has them. The subscribe ask lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print('shots:', ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: no pill, nothing said (the Short loops)'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
