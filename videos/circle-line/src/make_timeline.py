"""Edit timeline for the Why Can't You Draw a Circle and a Line at the SAME Time? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the button beat and the cut back to frame 1 (the loop)

W, E, ev, find = T.W, T.E, T.ev, T.find

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),            # THE TEST: him in his chair, close, both fingers up: one draws a cyan circle, the other an
                               # orange up-and-down line that bends into an oval by "Bent"; the circle copies itself across
    ("halves", "Each hand"),   # the same shot, wider: his head turns to glass, two halves, a cord from each to the OTHER hand
    ("leak", "But the halves"),  # into the glass: the halves have faces, a bridge between them, the circle rolls across it
    ("payoff", "Proof"),       # the bridge cut with scissors; the window on the hands: both shapes clean
    ("you", None),             # "better than YOU.": back to him and his bent line
    ("weird", "Weirder"),      # his arm down in his lap, a ghost arm circling, the real line still bends
    ("button", None),          # tight again: not clumsy, cheating (PSST); ends on the picture of frame 1
    ("loop", None),            # the last 0.4 s: the hook at negative time
]
DUR = T.duration
special = {"you": W("better") - 0.12, "button": W("Your hands aren't") - 0.22, "loop": DUR - 0.4}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Draw a circle / with your left hand",
    "and a straight line / with your right.",
    "Bent, right?",
    "Your hands / are copying",
    "each other's / homework.",
    "Each hand gets / its own half",
    "of your brain.",
    "But the halves / chat",
    "over a bridge...",
    "and your circle / leaks across.",
    "Proof?",
    "Two patients / with that bridge cut",
    "drew both shapes...",
    "better than YOU.",
    "Weirder?",
    "People missing / an arm",
    "still bend / the line...",
    "circling a / GHOST hand.",
    "Your hands / aren't clumsy.",
    "They're cheating.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea: cyan = the circle, orange = the line
COLOR = {"left": C, "circle": C, "straight": O, "line": O, "bent": O, "copying": Y, "homework": Y, "half": P["P"],
         "bridge": V, "leaks": Y, "cut": R, "both": G, "shapes": G, "you": R, "ghost": S, "cheating": Y}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

iL = find("bend the line")                 # the second "line" (the weird block)
cues = {
    "draw_hz": 1.05,                       # the fingers' cycle (Hz): one circle per 0.95 s
    # the hook: the line is straight while it is named, then bends into an oval; he sees it on "Bent"
    "circle_w": W("circle"), "straight": W("straight"), "line_end": E("straight line", 1),
    "bend0": E("straight line", 1) - 0.3, "bend1": W("Bent") - 0.4,     # it starts to go round while "line" is said
    "bent": W("Bent"), "right": W("Bent right", 1), "your1": W("Your hands are"),
    "copy": W("copying"), "copy_end": E("copying"), "homework": W("homework"), "homework_end": E("homework"),
    # the halves
    "each": W("Each hand"), "hand1": W("Each hand", 1), "own": W("own"), "half": W("half"), "brain": W("brain"), "brain_end": E("brain"),
    # the leak
    "but": W("But the halves"), "chat": W("chat"), "chat_end": E("chat"), "bridge": W("bridge"), "bridge_end": E("bridge"),
    "circle2": W("your circle leaks", 1), "leaks": W("leaks"), "across": W("across"), "across_end": E("across"),
    # the proof
    "proof": W("Proof"), "proof_end": E("Proof"), "two": W("Two patients"), "cut": W("cut"), "cut_end": E("cut"),
    "drew": W("drew"), "both": W("both"), "shapes": W("shapes"), "shapes_end": E("shapes"),
    "better": W("better"), "you": W("than YOU", 1), "you_end": E("than YOU", 1),
    # the weirdest fact
    "weirder": W("Weirder"), "weirder_end": E("Weirder"), "missing": W("missing"), "arm": W("an arm", 1), "arm_end": E("an arm", 1),
    "bend2": W("bend the line"), "line2": T.ws[iL + 2], "line2_end": T.we[iL + 2],
    "circling": W("circling"), "ghost": W("GHOST"), "ghost_end": E("GHOST"), "hand_end": E("GHOST hand", 1),
    # the button
    "your2": W("Your hands aren't"), "clumsy": W("clumsy"), "clumsy_end": E("clumsy"),
    "cheating": W("cheating"), "cheating_end": E("cheating"),
}
assert cues["bend0"] < cues["bend1"] < cues["copy"] < cues["each"] < cues["circle2"] < cues["cut"] < cues["you"] < cues["ghost"] < cues["cheating"]
assert cues["line2"] > cues["missing"], "the second 'line' must be the weird block's"
# ---- no Subscribe pill (since 16 Oct 2026). Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"].
T.write(shots, caps, cues)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: no pill, nothing said (the Short loops)'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots: ' + ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
