"""Edit timeline for the Why Do Some People Have NO Wrist Tendon? 🖐️ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.30)  # the button beat (the pitcher winks) and the cut back to frame 1 for the loop

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),             # THE TEST: his forearm up beside his face at the TV, tight, palm to us, thumb on the pinky,
                                # the wrist bending: the cord pops up on frame 12; "Got this tendon?" a ring round it; "Touch
                                # your thumb..." he does it again with the viewer, and the cord pops again after "wrist."
    ("glass", "That cord's"),   # the answer: his forearm turns to glass where it is: the little muscle by the elbow and its
                                # long cord (PALMARIS LONGUS, a label); "forgot to delete": a computer asks, he clicks LATER
    ("seven", "One in seven"),  # seven wrists in a row, 1 IN 7; the computer again: YES on the seventh: DELETED
    ("onearm", "sometimes in"), # back to him, both forearms up: the cord on one, nothing on the other
    ("jungle", "It probably"),  # hypnic-jerk's moonlit jungle: an ancestor swinging by one arm, the little muscle glowing
    ("grip", "Today?"),         # him squeezing two grip meters, CORD and NO CORD: both needles stop at the same number
    ("steal", "So surgeons"),   # a surgeon's blue glove pinches the cord out of his wrist like a noodle: BOING
    ("pitch", "and use it"),    # a ball park at night: him as the pitcher, a window on his elbow: the new ligament FROM THE
                                # WRIST; he throws, the ball flies at us
    ("button", "No cord?"),     # back at the TV: his cord is gone; the other arm: nothing either; a round window: the
                                # pitcher, in his cap, winks (he has it). The camera goes back to the hook's
    ("loop", None),             # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Got this / tendon?", "Touch your thumb", "to your pinky...", "and bend / your wrist.",
    "That cord's / a muscle", "your body forgot / to delete.",
    "One in seven / of us?", "Already deleted...", "sometimes in / just one arm.",
    "It probably helped", "our tree-climbing / ancestors", "hang on.",
    "Today?", "You grip / just as hard", "without it.",
    "So surgeons / take it out...", "and use it / to rebuild", "baseball / pitchers' elbows.",
    "No cord?", "Check your / other arm.", "Or ask / a baseball", "pitcher.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"tendon": Y, "thumb": C, "pinky": C, "bend": O, "wrist": O, "cord's": Y, "muscle": PK, "forgot": R, "delete": R,
         "seven": Y, "deleted": R, "one": Y, "arm": O, "tree-climbing": G, "hang": G, "ancestors": G, "same": G, "hard": G,
         "without": PK, "surgeons": C, "take": R, "rebuild": Y, "baseball": B, "pitchers'": B, "elbows": Y,
         "cord": Y, "other": O, "pitcher": B}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_arm1 = find("just one arm")
i_just2 = find("just as hard")
i_it2 = find("without it.")
i_take = find("take it out")
i_nc = find("No cord?")
i_arm2 = find("other arm.")
i_ap = find("a baseball pitcher.")
cues = {
    # the hook
    "got": W("Got"), "tendon": W("tendon?"), "tendon_end": E("tendon?"), "touch": W("Touch"), "thumb": W("thumb"),
    "pinky": W("pinky..."), "pinky_end": E("pinky..."), "bend": W("bend"), "wrist": W("wrist."), "wrist_end": E("wrist."),
    # the answer
    "cord": W("cord's"), "muscle": W("muscle"), "body": W("body"), "forgot": W("forgot"), "delete": W("delete."),
    "delete_end": E("delete."),
    # one in seven
    "one1": W("One in seven"), "seven": W("seven"), "us_end": E("us?"), "already": W("Already"), "deleted": W("deleted..."),
    "deleted_end": E("deleted..."),
    "sometimes": W("sometimes"), "just": W("just", s=i_arm1), "onearm": W("one", s=i_arm1), "arm1": W("arm.", s=i_arm1),
    "arm1_end": E("arm.", s=i_arm1),
    # the ancestors
    "probably": W("probably"), "helped": W("helped"), "tree": W("tree-climbing"), "ancestors": W("ancestors"),
    "ancestors_end": E("on."),
    # the grip
    "today": W("Today?"), "today_end": E("Today?"), "grip": W("grip"), "just2": W("just", s=i_just2), "hard": W("hard"),
    "without": W("without"), "it2_end": E("it.", s=i_it2),
    # the surgeon, the pitcher
    "surgeons": W("surgeons"), "take": W("take"), "take_end": E("out...", s=i_take), "use": W("and use it"),
    "rebuild": W("rebuild"), "baseball": W("baseball"), "pitchers": W("pitchers'"), "elbows": W("elbows."),
    "elbows_end": E("elbows."),
    # the button
    "nocord": W("No cord?"), "nocord_end": E("cord?", s=i_nc), "check": W("Check"), "other": W("other"),
    "arm2": W("arm.", s=i_arm2), "arm2_end": E("arm.", s=i_arm2), "ask": W("ask"), "pitcher2": W("pitcher.", s=i_ap),
    "pitcher2_end": E("pitcher.", s=i_ap),
}
# the gags, in the gaps after their words (sound.md: the sound just after the word, never on it)
cues["pop0"] = 0.42                                           # frame 1: the cord pops up (before the first word lands)
cues["pop2"] = round(cues["wrist_end"] + 0.05, 3)             # ... and again after "wrist."
cues["click_later"] = round(cues["delete_end"] + 0.10, 3)     # the cursor clicks LATER
cues["x_seven"] = round(cues["deleted"] + 0.16, 3)            # the seventh: DELETED (on the word: it must be seen before the cut)
cues["huh"] = round(cues["arm1_end"] + 0.06, 3)               # the empty wrist: ?
cues["snap"] = round(cues["take_end"] + 0.16, 3)              # the noodle comes out: BOING
cues["throw"] = round(cues["pitchers"] - 0.06, 3)             # he throws on "pitchers'"
cues["thwack"] = round(cues["elbows_end"] + 0.14, 3)          # the ball hits the lens
cues["loop_in"] = T.duration - 0.40
_order = ["got", "pop0", "tendon", "touch", "pinky", "bend", "wrist_end", "pop2", "cord", "muscle", "forgot", "delete_end", "click_later",
          "one1", "seven", "already", "deleted", "x_seven", "deleted_end", "sometimes", "onearm", "arm1_end", "huh", "probably", "helped",
          "ancestors_end", "today", "grip", "hard", "without", "it2_end", "surgeons", "take", "take_end", "snap", "rebuild",
          "baseball", "throw", "pitchers", "elbows", "elbows_end", "thwack", "nocord", "check", "other", "arm2_end", "ask",
          "pitcher2", "pitcher2_end", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
assert cues["snap"] < cues["rebuild"] - 0.1, "the BOING needs the pause after 'take it...'"
assert cues["thwack"] < cues["nocord"], "the ball must land before the button"
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
print("cues: " + ", ".join(f"{k}={v:.2f}" for k, v in cues.items()))
