"""Edit timeline for the Can You Make a W With Your FINGERS? 🖐️ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop. The tight
#                                      rules (5 Nov 2026): 25-30 s, the last line runs straight into the first and nothing
#                                      comes after it (qa.py: at most 1.0 s), so the loop comes before the thumb does.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),             # THE TEST: a summit selfie at golden hour, tight: his hand up beside his face, fingers
                                # together and trembling, tongue out (frame 0). "One": the pointer pops out; "TWO": middle
                                # and ring pressed together; "one": the pinky goes out and drags the ring finger with it
                                # (1-1-2, BZZT), the selfie flash catches it. "Stuck?" he frowns at it; "group chat": a chat
                                # card pops up over the sky beside his hand, FINGERS (4), with four finger avatars
    ("chat", "Your brain"),     # closer on the hand and the card: BRAIN joins and types; "texts the pinky": a bubble
                                # "@Pinky go OUT"; "go OUT" the pinky swings out; "ring finger reads it too": SEEN BY Ring,
                                # its avatar's eyes pop, and the ring finger swings out with the pinky
    ("own", "Weird part?"),     # into the hand: the back of the hand goes see-through as a cool scan; each finger's own
                                # little spreading muscle pops on its side (four colours, four separate springs), "OWN":
                                # tiny MINE flags; they all stretch on "spreading"
    ("brain", "It's your"),     # back out to him: a round window on his forehead, the brain inside thumbing a phone;
                                # "oversharing": it slams SEND TO ALL, four bubbles shoot down to all four fingers
    ("nerve", "And they"),      # down his arm (see-through): the four springs' wires gather into ONE glowing nerve that
                                # runs down the pinky side to the elbow; "funny bone": a FUNNY BONE marquee at the elbow,
                                # the nerve there in a tiny jester hat
    ("sting", "Hilarious."),    # his flat stare at us (12 s+ is allowed), the marquee's bulbs fizzle; ba-dum-tss
    ("button", "Now try"),      # the selfie again: he tries it slowly, one finger at a time, slow-motion streaks; the
                                # fingers spring back together, tongue out: the picture of frame 1
    ("loop", None),             # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Make a W / with your fingers.", "One...", "TWO...", "one.",
    "Stuck?", "Relax...", "your fingers / are in a", "group chat.",
    "Your brain / texts the pinky,", "\"go OUT\"...", "and the / ring finger", "reads it too.",
    "Weird part?", "Each finger / has its OWN", "spreading / muscles.",
    "It's your brain...", "oversharing.",
    "And they ALL / run on one nerve...", "your / funny bone.",
    "Hilarious.",
    "Now try it / SLOWER.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"w": Y, "one": C, "two": O, "stuck": R, "group": P["P"], "chat": P["P"], "brain": P["P"], "texts": P["P"],
         "pinky": G, "out": G, "ring": Y, "reads": Y, "own": O, "spreading": O, "muscles": O, "oversharing": V,
         "all": O, "nerve": Y, "funny": Y, "bone": Y, "hilarious": R, "slower": C}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iO = find("One...")
iT = find("TWO...")
i1 = find("one.", iT)
iY = find("your fingers are")
iB = find("Your brain")
iE = find("Each finger")
iI = find("It's your brain")
iA = find("And they")
cues = {
    # the hook: the W goes wrong
    "make": W("Make"), "w": W("W"), "fingers1": W("fingers."), "fingers1_end": E("fingers."),
    "one1": W("One...", s=iO), "one1_end": E("One...", s=iO), "two": W("TWO...", s=iT), "two_end": E("TWO...", s=iT),
    "one2": W("one.", s=i1), "one2_end": E("one.", s=i1),
    # the answer
    "stuck": W("Stuck?"), "stuck_end": E("Stuck?"), "relax": W("Relax..."), "relax_end": E("Relax..."),
    "your_f": W("your", s=iY), "fingers2": W("fingers", s=iY), "group": W("group"), "chat": W("chat."), "chat_end": E("chat."),
    # the chat
    "your_b": W("Your", s=iB), "brain1": W("brain", s=iB), "texts": W("texts"), "pinky": W("pinky,"), "pinky_end": E("pinky,"),
    "go": W("go"), "out": W("OUT"), "out_end": E("OUT"), "and_r": W("and the ring"), "ring": W("ring"),
    "reads": W("reads"), "too": W("too."), "too_end": E("too."),
    # the own muscles
    "weird": W("Weird"), "part": W("part?"), "part_end": E("part?"), "each": W("Each", s=iE), "finger3": W("finger", s=iE),
    "has": W("has"), "own": W("OWN"), "own_end": E("OWN"), "spreading": W("spreading"), "muscles": W("muscles."),
    "muscles_end": E("muscles."),
    # the brain
    "its": W("It's", s=iI), "brain2": W("brain...", s=iI), "brain2_end": E("brain...", s=iI), "over": W("oversharing."),
    "over_end": E("oversharing."),
    # the nerve
    "and_they": W("And they"), "all": W("ALL"), "run": W("run"), "one_n": W("one", s=iA), "nerve": W("nerve..."),
    "nerve_end": E("nerve..."), "your_fb": W("your funny"), "funny": W("funny"), "bone": W("bone."), "bone_end": E("bone."),
    # the sting and the button
    "hil": W("Hilarious."), "hil_end": E("Hilarious."),
    "now": W("Now"), "try": W("try"), "slower": W("SLOWER."), "slower_end": E("SLOWER."),
}
cues["loop_in"] = T.duration - 0.40
# the slow retry in the button: one finger at a time, ending with the fingers together again (frame 0)
_b0, _b1 = cues["try"], cues["loop_in"]
cues["slow_i"] = round(_b0 + 0.10, 3)
cues["slow_l"] = round(cues["slower"] + 0.05, 3)
_order = ["make", "one1", "two", "one2", "stuck", "relax", "group", "chat_end", "your_b", "texts", "go", "out", "ring", "reads",
          "too_end", "weird", "each", "own", "spreading", "muscles_end", "its", "over", "over_end", "and_they", "all",
          "nerve", "funny", "bone_end", "hil", "now", "slow_i", "slower", "slow_l", "slower_end", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the slots from 10 Nov 2026: 25-30 s passes, the tight arm; publish.json "length" says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
