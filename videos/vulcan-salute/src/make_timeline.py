"""Edit timeline for the Why Is the Vulcan Salute So HARD? 🖖 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.10)  # the button beat (caught with his other hand) and the cut back to frame 1 for the loop

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),             # THE TEST: his hand up beside his face at the TV, tight, palm to us, already straining; the
                                # split goes wrong twice; "Can't?" he turns it round to look; the middle and ring fingers
                                # hold hands; "under your skin" the back of the hand turns to glass where it is
    ("cords", "Their cords"),   # the same hand, closer: the cords, and the strap between middle and ring (two little hands
                                # holding); he tries again and the strap drags the ring finger along
    ("brain", "And your"),      # up to a round window on his forehead and through it: the brain at its desk, the middle and
                                # ring levers taped together; one pull, both go
    ("lab", "In lab"),          # a lab at night: the study's hand on the big screen, medals for thumb, index, pinky; middle
                                # 4th, ring DEAD LAST; his own gloved hand in front, still trying
    ("studio", "Even Star"),    # a 1960s TV studio: an old studio camera's frame on him; below the frame his other hand sets
                                # the fingers; the monitor shows a perfect salute
    ("button", "Using your"),   # back at the TV: caught holding the fingers apart with his other hand; he lets go and the
                                # fingers snap back together: frame 1
    ("loop", None),             # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Try the / Vulcan salute:", "split / your fingers,", "two", "and TWO.",
    "Can't?", "Your middle / and ring fingers", "are holding / hands...", "under / your skin.",
    "Their cords / are tied together", "by a / little strap.",
    "And your brain / usually moves them", "as a team.",
    "In lab tests,", "they're the worst / at moving alone.", "The ring finger?", "Dead last.",
    "Even Star Trek / actors reportedly", "set their fingers / with the other hand...", "off camera.",
    "Using your / other hand now,", "aren't you?",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"vulcan": C, "salute": C, "split": Y, "two": Y, "cant": R, "middle": O, "ring": Y, "holding": P["P"], "hands": P["P"],
         "skin": P["P"], "cords": C, "strap": V, "brain": P["P"], "team": V, "worst": R, "alone": R, "dead": R, "last": R,
         "trek": B, "other": G, "camera": B}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iA = find("Can't?")
iL = find("The ring finger?")
iS = find("Even Star")
iB = find("Using your")
cues = {
    # the hook: his split goes wrong twice, then he gives up
    "try": W("Try"), "vulcan": W("Vulcan"), "salute": W("salute:"), "split": W("split"), "fingers1": W("fingers,"),
    "two1": W("two"), "and1": W("and TWO."), "two2": W("TWO.", s=find("and TWO.")), "two2_end": E("TWO.", s=find("and TWO.")),
    # the answer: he turns his hand round; the two fingers hold hands; the skin turns to glass
    "cant": W("Can't?"), "cant_end": E("Can't?"), "your_mid": W("Your middle"), "middle": W("middle"), "ring1": W("ring", s=iA),
    "fingers2": W("fingers", s=iA), "holding": W("holding"), "hands": W("hands..."), "hands_end": E("hands..."),
    "under": W("under"), "skin": W("skin."), "skin_end": E("skin."),
    # the cords and the strap
    "their": W("Their"), "cords": W("cords"), "tied": W("tied"), "together": W("together"), "little": W("little"),
    "strap": W("strap."), "strap_end": E("strap."),
    # the brain: one order for both
    "and_brain": W("And your"), "brain": W("brain"), "usually": W("usually"), "moves": W("moves"), "them": W("them"),
    "team": W("team."), "team_end": E("team."),
    # the lab
    "in_lab": W("In lab"), "lab": W("lab"), "tests": W("tests,"), "theyre": W("they're"), "worst": W("worst"),
    "moving": W("moving"), "alone": W("alone."), "alone_end": E("alone."),
    "the_ring": W("The ring finger?"), "ringq": W("ring", s=iL), "ringq_end": E("finger?", s=iL), "dead": W("Dead"),
    "last": W("last."), "last_end": E("last."),
    # the studio
    "even": W("Even"), "star": W("Star"), "actors": W("actors"), "reportedly": W("reportedly"), "set": W("set"),
    "fingers3": W("fingers", s=iS), "other1": W("other", s=iS), "hand1": W("hand...", s=iS), "hand1_end": E("hand...", s=iS),
    "off": W("off"), "camera": W("camera."), "camera_end": E("camera."),
    # the button
    "using": W("Using"), "other2": W("other", s=iB), "hand2": W("hand", s=iB), "now": W("now,"), "arent": W("aren't"),
    "you": W("you?"), "you_end": E("you?"),
}
cues["loop_in"] = T.duration - 0.40
_order = ["two1", "two2", "cant", "middle", "holding", "under", "their", "strap", "and_brain", "team", "in_lab", "worst",
          "the_ring", "dead", "even", "set", "other1", "off", "using", "other2", "you_end", "loop_in"]
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
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: no pill, nothing said (the Short loops)'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
