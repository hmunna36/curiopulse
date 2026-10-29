"""Edit timeline for the Does Your Finger Move When You Bend Your THUMB? 👍 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py; the world is wrist-tendon's.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # the button beat (his grin at the gorilla) and the cut back to frame 1 for the loop
# v3 aligned "see those strings?" early after the tightened pause ("see" sat in silence: qa.py read it at -13 dB): put the
# three words on the take's own three bursts of speech-band energy (narration.md)
T.retime("see those strings?", 10.0, 11.4)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),             # THE TEST: his left hand up beside his face at the TV, tight, palm to us; frame 1: the thumb is
                                # already bending across the palm and the pointer's tip curls with it. "Bend just your thumb...":
                                # he lets go and does it again with the viewer; "Did your pointer finger move?": a ring round it
    ("sidekick", "Moved?"),     # the answer: closer on the hand; the pointer's tip opens two little eyes and a grin and leans
                                # after the thumb like a puppy (a heart); "SIDEKICK" tag
    ("glass", "Bend it again"), # he bends again: the palm and forearm turn to glass from the wrist: two strings, the thumb's
                                # (orange) and the pointer's (cyan), from the fingertips to two muscles by the elbow; "A tiny
                                # strap": the camera goes to the wrist, a little strap ties the two strings (yellow, STRAP)
    ("pull", "Thumb pulls"),    # the thumb's muscle squeezes, its string slides, the strap drags the pointer's: it curls
    ("solo", "No strap?"),      # the strap is a dashed ghost: the thumb bends alone under a spotlight (SOLO), the pointer's face
                                # waves it off
    ("gorilla", "Gorillas?"),   # a gorilla on the couch beside him, its hand up: glass: ONE string that forks to the thumb and
                                # the pointer; it bends its thumb and both fold together
    ("ape", "So that strap?"),  # his wrist again: the strap glows; the two of them side by side; "ape.": the gorilla drums its
                                # chest, he shrugs
    ("button", "Now try"),      # he puts up his OTHER hand: the thumb bends, the pointer stays straight (less ape); his grin; the
                                # gorilla's huff; the first hand comes back up for the loop. The pill (23:30 arm) over the last
                                # 2.4 s: his face and hands stay above y 1050
    ("loop", None),             # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Bend just / your thumb", "all the way", "across / your palm.",
    "Did your / pointer finger", "move?",
    "Moved?", "Your thumb's got", "a clingy little", "SIDEKICK.",
    "Bend it again...", "see those / strings?",
    "A tiny strap", "ties them / together.",
    "Thumb pulls...", "pointer / follows.",
    "No strap?", "Your thumb / goes solo.",
    "Gorillas?", "Their thumb's / string", "is just / a branch", "of the / pointer's.",
    "So that / strap?", "Maybe a little / leftover...", "ape.",
    "Now try / your OTHER hand.", "It might be / less ape.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white.
# The thumb and its string are orange, the pointer and its string cyan, the strap yellow (the picture uses the same).
COLOR = {"thumb": O, "thumb's": O, "palm": O, "pointer": C, "pointer's": C, "move": C, "moved": C, "clingy": PK,
         "sidekick": Y, "strings": Y, "string": Y, "strap": Y, "together": Y, "pulls": O, "follows": C, "solo": G,
         "gorillas": V, "branch": Y, "leftover": V, "ape": V, "other": O, "less": G}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_thumb2 = find("Your thumb's got")
i_bend2 = find("Bend it again")
i_strap1 = find("A tiny strap")
i_thumb3 = find("Thumb pulls")
i_strap2 = find("No strap?")
i_thumb4 = find("Your thumb goes")
i_strap3 = find("So that strap?")
i_ape1 = find("leftover... ape.")
i_ape2 = find("less ape.")
cues = {
    # the hook
    "bend": W("Bend"), "thumb": W("thumb"), "across": W("across"), "palm": W("palm."), "palm_end": E("palm."),
    "did": W("Did"), "pointer": W("pointer"), "move": W("move?"), "move_end": E("move?"),
    # the answer
    "moved": W("Moved?"), "moved_end": E("Moved?"), "thumbs": W("thumb's", s=i_thumb2), "clingy": W("clingy"),
    "sidekick": W("SIDEKICK."), "sidekick_end": E("SIDEKICK."),
    # the glass, the strap
    "again": W("Bend", s=i_bend2), "again_end": E("again...", s=i_bend2), "see": W("see"), "strings": W("strings?"),
    "strings_end": E("strings?"), "tiny": W("tiny"), "strap1": W("strap", s=i_strap1), "ties": W("ties"),
    "together": W("together."), "together_end": E("together."),
    # thumb pulls, pointer follows
    "pulls": W("Thumb", s=i_thumb3), "pulls_end": E("pulls...", s=i_thumb3), "follows": W("pointer", s=i_thumb3),
    "follows_end": E("follows."),
    # solo
    "nostrap": W("No", s=i_strap2), "nostrap_end": E("strap?", s=i_strap2), "goes": W("goes", s=i_thumb4),
    "solo": W("solo."), "solo_end": E("solo."),
    # the gorilla
    "gorillas": W("Gorillas?"), "gorillas_end": E("Gorillas?"), "their": W("Their"), "branch": W("branch"),
    "ptrs": W("pointer's."), "ptrs_end": E("pointer's."),
    # leftover ape
    "so": W("So", s=i_strap3), "strap3": W("strap?", s=i_strap3), "strap3_end": E("strap?", s=i_strap3),
    "maybe": W("Maybe"), "leftover": W("leftover..."), "leftover_end": E("leftover..."),
    "ape1": W("ape.", s=i_ape1), "ape1_end": E("ape.", s=i_ape1),
    # the button
    "now": W("Now"), "other": W("OTHER"), "hand": W("hand."), "hand_end": E("hand."), "might": W("might"),
    "less": W("less"), "ape2": W("ape.", s=i_ape2), "ape2_end": E("ape.", s=i_ape2),
}
# the gags and moves, in the gaps after their words (sound.md: the sound just after the word, never on it)
cues["curl0"] = 0.30                                         # frame 1: the pointer's tip finishes curling with the bent thumb
cues["ring"] = round(cues["move"] + 0.02, 3)                 # a ring round the pointer on "move?"
cues["eyes"] = round(cues["moved_end"] + 0.04, 3)            # the pointer opens its eyes (after "Moved?")
cues["heart"] = round(cues["sidekick_end"] + 0.06, 3)        # a heart pops over the sidekick
cues["glass_in"] = round(cues["again"] - 0.05, 3)            # the glass spreads from the wrist as he bends again
cues["strap_pop"] = round(cues["strap1"] + 0.10, 3)          # the strap lights up on "strap"
cues["tug"] = round(cues["pulls"] + 0.05, 3)                 # the thumb's string slides
cues["drag"] = round(cues["follows"] - 0.12, 3)              # the strap drags the pointer's string: it curls
cues["whee"] = round(cues["follows_end"] + 0.05, 3)          # the sidekick's little whee
cues["ghost"] = round(cues["nostrap"] + 0.02, 3)             # the strap goes dashed
cues["spot"] = round(cues["solo"] - 0.04, 3)                 # the spotlight on the thumb's solo
cues["riff"] = round(cues["solo_end"] + 0.04, 3)             # the solo's little riff, in the gap
cues["fork"] = round(cues["branch"] - 0.10, 3)               # the gorilla's one string forks
cues["fold"] = round(cues["ptrs_end"] + 0.04, 3)             # the gorilla bends: thumb and pointer fold as one
cues["glow3"] = round(cues["strap3"] + 0.02, 3)              # his strap glows again
cues["drum"] = round(cues["ape1_end"] + 0.06, 3)             # the gorilla drums its chest
cues["raise"] = round(cues["now"] - 0.10, 3)                 # the other hand comes up
cues["solo2"] = round(cues["hand_end"] + 0.02, 3)            # its thumb bends alone: the pointer stays straight
cues["grin"] = round(cues["ape2_end"] + 0.05, 3)             # his grin at the gorilla
cues["loop_in"] = T.duration - 0.40
_order = ["bend", "curl0", "thumb", "across", "palm", "did", "pointer", "move", "ring", "move_end", "moved", "moved_end", "eyes",
          "thumbs", "clingy", "sidekick", "sidekick_end", "heart", "glass_in", "again", "again_end", "see", "strings", "strings_end",
          "tiny", "strap1", "strap_pop", "ties", "together", "together_end", "pulls", "tug", "pulls_end", "drag", "follows",
          "follows_end", "whee", "nostrap", "ghost", "nostrap_end", "goes", "spot", "solo", "solo_end", "riff", "gorillas",
          "gorillas_end", "their", "fork", "branch", "ptrs", "ptrs_end", "fold", "so", "strap3", "glow3", "strap3_end", "maybe",
          "leftover", "leftover_end", "ape1", "ape1_end", "drum", "raise", "now", "other", "hand", "hand_end", "solo2", "might",
          "less", "ape2", "ape2_end", "grin", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
assert cues["drum"] < cues["now"] - 0.25, "the chest drum needs the gap after 'ape.'"
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): this Short is a 23:30 one, the pill arm. T.write sets the
# pill's cues by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s before the end). Never set
# cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says "subscribe".
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
print("cues: " + ", ".join(f"{k}={v:.2f}" for k, v in cues.items()))
