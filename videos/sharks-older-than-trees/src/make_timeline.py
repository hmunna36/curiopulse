"""Edit timeline for the Sharks Are Older Than TREES 🦈 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.2)  # seconds after the last word: the shark pops up beside him again, then the loop


# v3's alignment puts a block's first word(s) a little early (the breath before a word is given to the word). Move such a
# word onto the first speech-band burst after its aligned start (mirror-eyes, 24 Oct 2026: `_onto_burst`).
def _onto_burst(i, span=0.3, thr=-34.0, after=None):
    t0 = T.ws[i] - 0.02 if after is None else after
    b = T.bursts(t0, T.ws[i] + span, thr=thr)
    if b and b[0][0] - 0.03 > T.ws[i] + 0.04:
        T.ws[i] = T.words[i]["start"] = round(b[0][0] - 0.03, 3)


for _ph in ["Which do", "Sharks. Trees", "Rewind", "No trees", "The tallest", "But the", "Trees showed", "and the sharks",
            "Dinosaurs", "Sharks? Five", "Still swimming", "So when", "you're hugging"]:
    _onto_burst(T.find(_ph))
# "Still" came out with a 19 ms window ahead of its sound (qa.py read it at -13.6 dB): put both words on their own bursts
T.retime("Still swimming", T.W("Still swimming") - 0.15, T.E("swimming") + 0.1)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
# THE CURIOUS KIND (story.md §6): the hero goes there. He hugs a tree on a sea shore while a shark watches him from the
# water; then the whole shore rewinds to 450 million years ago, when there were no trees at all, and back again.
SHOTS = [
    ("hook", None),               # frame 1: TIGHT on him hugging a big tree at the water's edge, cheek on the bark, eyes shut,
                                  # blissful; a shark's head is already out of the water beside him, staring. "sharks,": the
                                  # shark tilts its head; "or TREES?": he squeezes the tree (a little heart)
    ("answer", "Sharks. Trees"),  # the same shot, easing back: "Sharks.": the shark rises, smug grin, eyebrow; "Trees are the new
                                  # kids.": a HELLO / NEW KID sticker slaps onto the trunk by his face; his eyes open onto it
    ("rewind", "Rewind"),         # THE ONE PICTURE: the shore REWINDS: a YEARS AGO counter spins up to 450,000,000, the sun and
                                  # the clouds race backwards, the forest behind him sinks into the ground, the sea stays (the
                                  # shark stays in it); "billion": his own tree slides down out of his arms; "years.": he hugs
                                  # nothing, wobbles... FLOMP (in the gap), flat on bare rock
    ("ankle", "No trees"),        # 450 million years ago: a bare, rocky shore under a strange sky, nothing standing but him;
                                  # he gets up and looks round; "The tallest plant": the camera drops to his boot: a tuft of
                                  # moss with a few tiny stalks, a tag TALLEST PLANT at his ankle; he crouches and hugs it
    ("sea", "But the sea"),       # the whip to the water: fins circling; "sharks.": the shark surfaces and waves a fin (a tag:
                                  # EARLY SHARKS, ~450 MILLION YEARS AGO)
    ("payoff", "Trees showed"),   # fast-forward: the counter runs down to 390,000,000; the first trees BURST out of the bare
                                  # ground round him, trunks shooting up, their fronds unrolling at the top as the camera cranes
                                  # up with them (FIRST TREES)
    ("watched", "and the sharks"),# a row of shark heads in the shallows, all looking up at the new trees; "watched.": they turn,
                                  # slowly, to us
    ("dinos", "Dinosaurs"),       # a long-necked dinosaur strolls in on the shore and bends down to the shark, nose to nose;
                                  # "and went.": a fireball streaks across the sky, a flash: the dinosaur is gone (a smoking
                                  # footprint); the shark blinks
    ("five", "Sharks? Five"),     # the shark alone; "Five mass extinctions.": five tally marks scratch onto a rock beside it,
                                  # one by one (EXTINCTIONS SURVIVED); "Still swimming.": shades on, a lazy loop past us
    ("button", "So when"),        # back in today: he hugs his tree again (the NEW KID sticker still on it); "the new kid.": the
                                  # shark pops up beside him again: the picture of frame 1
    ("loop", None),               # the hook at negative time: the last frames ARE frame 1's picture
]
special = {"loop": T.duration - 0.45}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Which do you / think is older...",
    "sharks,",
    "or TREES?",
    "Sharks.",
    "Trees are / the new kids.",
    "Rewind almost / half a billion years.",
    "No trees / anywhere.",
    "The tallest plant / came up",
    "to your ankle.",
    "But the sea / already had sharks.",
    "Trees showed up / about sixty million",
    "years later...",
    "and the sharks / watched.",
    "Dinosaurs / came...",
    "and went.",
    "Sharks?",
    "Five mass / extinctions.",
    "Still swimming.",
    "So when you / hug a tree...",
    "you're hugging / the new kid.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {"older": Y, "sharks": B, "trees": G, "new": Y, "kids": Y, "kid": Y, "rewind": V, "billion": Y, "ankle": G,
         "sea": C, "60": Y, "million": Y, "watched": V, "dinosaurs": O, "went": R, "5": R, "extinctions": R,
         "swimming": C, "hug": PK, "tree": G}
DISPLAY = {"about sixty million": ["ABOUT", "60", "MILLION"], "five mass": ["5", "MASS"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_sh2 = find("Sharks. Trees")          # "Sharks." (the answer)
_tr2 = _sh2 + 1                       # "Trees are"
_sh3 = find("sharks", find("already"))       # "had sharks."
_tr4 = find("Trees showed")
_yr2 = find("years later")
_sh4 = find("sharks watched")
_sh5 = find("Sharks? Five")
_and_w = find("and went")
_the_new = find("the new kid")
cues = {
    # the hook + the answer: one shot of the present-day shore
    "which": W("Which"), "older": W("older"), "older_end": E("older"), "sharks1": W("sharks,"), "sharks1_end": E("sharks,"),
    "or": W("or TREES"), "trees1": W("TREES?"), "trees1_end": E("TREES?"),
    "sharks2": T.ws[_sh2], "sharks2_end": T.we[_sh2], "trees2": T.ws[_tr2], "new1": W("new kids"), "kids": W("kids"),
    "kids_end": E("kids"),
    # the rewind
    "rewind": W("Rewind"), "rewind_end": E("Rewind"), "almost": W("almost"), "half": W("half"), "billion": W("billion"),
    "billion_end": E("billion"), "years1": W("years."), "years1_end": E("years."),
    # 450 million years ago: the bare shore
    "no": W("No trees"), "trees3": W("trees anywhere"), "anywhere": W("anywhere"), "anywhere_end": E("anywhere"),
    "the_tallest": W("The tallest"), "tallest": W("tallest"), "plant": W("plant"), "came1": W("came up"), "your": W("your ankle"),
    "ankle": W("ankle"), "ankle_end": E("ankle"),
    # the sea already had sharks
    "but": W("But the"), "sea": W("sea"), "already": W("already"), "had": W("had sharks"), "sharks3": T.ws[_sh3],
    "sharks3_end": T.we[_sh3],
    # the first trees
    "trees4": T.ws[_tr4], "showed": W("showed"), "about": W("about"), "sixty": W("sixty"), "million": W("million"),
    "years2": T.ws[_yr2], "later": W("later"), "later_end": E("later"),
    # the sharks watched
    "and1": W("and the sharks"), "sharks4": T.ws[_sh4], "sharks4_end": T.we[_sh4], "watched": W("watched"),
    "watched_end": E("watched"),
    # dinosaurs came and went
    "dinosaurs": W("Dinosaurs"), "dinosaurs_end": E("Dinosaurs"), "came2": W("came...", s=find("Dinosaurs")),
    "came2_end": E("came...", s=find("Dinosaurs")), "and2": T.ws[_and_w], "went": W("went"), "went_end": E("went"),
    # five mass extinctions, still swimming
    "sharks5": T.ws[_sh5], "sharks5_end": T.we[_sh5], "five": W("Five"), "mass": W("mass"), "extinctions": W("extinctions"),
    "extinctions_end": E("extinctions"), "still": W("Still swimming"), "swimming": W("swimming"), "swimming_end": E("swimming"),
    # the button
    "so": W("So when"), "hug": W("hug a"), "tree5": W("tree..."), "tree5_end": E("tree..."), "youre": W("you're"),
    "hugging": W("hugging"), "new2": T.ws[_the_new + 1], "kid": W("kid."), "kid_end": E("kid."),
}
cues["loop"] = special["loop"]
_order = ["which", "older", "sharks1", "or", "trees1", "trees1_end", "sharks2", "sharks2_end", "trees2", "kids", "kids_end",
          "rewind", "almost", "half", "billion", "billion_end", "years1", "years1_end", "no", "anywhere", "anywhere_end",
          "the_tallest", "plant", "ankle", "ankle_end", "but", "sea", "sharks3", "sharks3_end", "trees4", "sixty", "million",
          "later", "later_end", "and1", "sharks4", "watched", "watched_end", "dinosaurs", "came2", "came2_end", "and2", "went",
          "went_end", "sharks5", "sharks5_end", "five", "mass", "extinctions", "extinctions_end", "still", "swimming",
          "swimming_end", "so", "hug", "tree5", "tree5_end", "youre", "hugging", "new2", "kid", "kid_end", "loop"]
for a, b in zip(_order, _order[1:]):
    assert cues[a] < cues[b], f"cue order: {a} {cues[a]} !< {b} {cues[b]}"
# the beats in the gaps (say it on the word, do it in the pause)
cues["heart"] = cues["trees1_end"] + 0.04             # he squeezes the tree after "TREES?": a little heart
cues["slap"] = cues["kids_end"] + 0.05                # the NEW KID sticker slaps onto the trunk
cues["flomp"] = cues["years1_end"] + 0.06             # he hugs nothing... and falls flat
cues["tag1"] = cues["ankle"] - 0.10                   # the dashed line at his ankle
cues["tagT"] = cues["plant"] - 0.05                   # the TALLEST PLANT / ON LAND tag, as she names it
cues["wave"] = cues["sharks3_end"] + 0.06             # the shark waves a fin
cues["turn"] = cues["watched_end"] + 0.05             # the row of sharks turns to us
cues["boom"] = cues["went_end"] + 0.03                # the fireball lands: the flash
cues["shades"] = cues["still"] - 0.05                 # shades on
cues["pop"] = cues["kid_end"] + 0.06                  # the shark pops up beside him again
cues["tally"] = [round(cues["five"] + k * (cues["extinctions_end"] + 0.05 - cues["five"]) / 4.0, 3) for k in range(5)]
assert cues["heart"] < cues["sharks2"] - 0.15 and cues["slap"] < cues["rewind"] - 0.25
assert cues["flomp"] < cues["no"] - 0.15 and cues["wave"] < cues["trees4"] - 0.2 and cues["turn"] < cues["dinosaurs"] - 0.2
assert cues["boom"] < cues["sharks5"] - 0.2 and cues["pop"] < cues["loop"] - 0.2
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] /
# ["sub_out"] here. Nobody says "subscribe" in either arm; the ask lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the curious kind: the guess, put to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ' '.join(f'{s["id"]} {s["start"]:.2f}' for s in shots))
print('beats:', ' '.join(f'{k} {cues[k]:.2f}' for k in ["heart", "slap", "flomp", "tag1", "wave", "turn", "boom", "shades", "pop", "loop"]),
      'tally', cues["tally"])
