"""Edit timeline for the Why Does This Lake Turn Animals to STONE? 🦩 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Every Short is 30-35 s since 16 Oct 2026: keep it short,
#                                      so the loop comes before the thumb does.


# v3's alignment puts a block's first word(s) a little early (the breath before a word is given to the word): "You" was
# aligned at 0.10 s and its speech-band burst starts at 0.24 s (qc_inband read it at -52 dB). Move such a word onto the
# first burst after its aligned start (mirror-eyes, 24 Oct 2026: `_onto_burst`).
def _onto_burst(i, span=0.3, thr=-34.0, after=None):
    t0 = T.ws[i] - 0.02 if after is None else after
    b = T.bursts(t0, T.ws[i] + span, thr=thr)
    if b and b[0][0] - 0.03 > T.ws[i] + 0.04:
        T.ws[i] = T.words[i]["start"] = round(b[0][0] - 0.03, 3)


for _ph in ["You see", "So if"]:
    _onto_burst(T.find(_ph))
_onto_burst(T.find("see that"), after=T.ws[0] + 0.14)   # "see": the burst after "You"'s own

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),       # THE CURIOUS KIND (story.md §6): frame 1 is him in his canoe on the blood-red lake, close, nose to beak
                          # with a chalk-white flamingo statue on a dead branch, his finger on its beak. "STONE": he knocks on
                          # its head (tok tok). "MUMMY": he yanks the finger back and wipes it on his shirt
    ("soda", "This water's"),     # the camera pulls back: the canoe, the volcano, steam; HOT WASHING SODA; he dips the paddle,
                                  # it hisses and comes up crusted white and smoking: BURNS
    ("crust", "Whatever falls"),  # THE MECHANISM, one picture: a swallow flies into the mirror-flat water; drops of water are
                                  # pulled out of it, white crystals grow over it like frost, it bobs up a statue
    ("payoff", "Egyptians made"), # a mummy in sunglasses sits in the back of his canoe, scooping the crust into a NATRON jar
    ("weird", "And flamingos"),   # a live flamingo wades up, unbothered, and dunks its head in upside down (they feed that way)
    ("wide", "Most of"),          # the camera pulls back and up: the whole red lake, flamingos by the thousand, nests on the
                                  # white islands, the volcano: UP TO 3 IN 4 of the world's lesser flamingos hatch here
    ("why", "because nothing"),   # a fluffy chick on its nest; a hyena dips a paw in across the channel, it hisses, it backs off
    ("button", "So if"),          # a flamingo lounging in the water waves him in; he smiles... and pokes the statue again.
                                  # The pill arm: the silent pill over the last 2.4 s; faces stay above y 1050
    ("loop", None),               # the hook at negative time: the last frames ARE frame 1's picture (the loop)
]
special = {"loop": T.duration - 0.45}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
# One idea per chunk; break before the punchline so it lands alone ("raisins", "Nope", "Science").
# A line is capped at 640 px (x 220-860, the Shorts safe area): ~10 characters stay at full size, 16 drop to ~60 px.
CHUNKS = [
    "You see / that bird?",
    "This lake / turned it",
    "to STONE.",
    "Not stone,",
    "actually...",
    "it's a / MUMMY.",
    "This water's / like hot",
    "washing / soda.",
    "It BURNS.",
    "Whatever / falls in",
    "gets dried / out...",
    "and crusted / over.",
    "Egyptians / made mummies",
    "with the / same salt.",
    "And / flamingos?",
    "They / LOVE it.",
    "Most of the / world's",
    "lesser / flamingos",
    "hatch / right here...",
    "because / nothing dares",
    "wade in / after them.",
    "So if a / flamingo",
    "says the / water's",
    "lovely...",
    "don't.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"bird": S, "stone": Y, "mummy": V, "soda": C, "burns": R, "dried": O, "crusted": Y, "egyptians": Y,
         "mummies": V, "salt": S, "flamingos": P["P"], "love": P["P"], "lesser": P["P"], "hatch": G, "nothing": R,
         "flamingo": P["P"], "lovely": P["P"], "don't": R}
DISPLAY = {}  # spoken words shown as figures: {"seventy percent": ["70%"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_st2 = find("stone", find("Not"))           # the second "stone" (the first is the hook's STONE)
_fl2 = find("flamingos", find("lesser"))    # "lesser flamingos" (the first "flamingos" is "And flamingos?")
_in2 = find("in", find("wade"))
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # the hook and the answer
    "you": W("You"), "see": W("see"), "bird": W("bird"), "bird_end": E("bird"), "this1": W("This lake"), "lake": W("lake"),
    "turned": W("turned"), "stone": W("STONE"), "stone_end": E("STONE"),
    "not": W("Not"), "stone2": T.ws[_st2], "stone2_end": T.we[_st2], "actually": W("actually"), "actually_end": E("actually"),
    "its": W("it's a"), "mummy": W("MUMMY"), "mummy_end": E("MUMMY"),
    # the soda
    "water": W("This water's"), "like": W("like hot"), "hot": W("hot"), "washing": W("washing"), "soda": W("soda"),
    "soda_end": E("soda"), "it2": W("It BURNS"), "burns": W("BURNS"), "burns_end": E("BURNS"),
    # the crust
    "whatever": W("Whatever"), "falls": W("falls"), "in1": W("in gets"), "gets": W("gets"), "dried": W("dried"),
    "out": W("out"), "out_end": E("out"), "and1": W("and crusted"), "crusted": W("crusted"), "over": W("over"),
    "over_end": E("over"),
    # the payoff
    "egyptians": W("Egyptians"), "made": W("made"), "mummies": W("mummies"), "with": W("with the"), "same": W("same"),
    "salt": W("salt"), "salt_end": E("salt"),
    # flamingos
    "and2": W("And flamingos"), "flamingos": W("flamingos"), "flamingos_end": E("flamingos"), "they": W("They"),
    "love": W("LOVE"), "love_end": E("it", s=find("LOVE")), "most": W("Most"), "worlds": W("world's"),
    "lesser": W("lesser"), "flamingos2": T.ws[_fl2], "hatch": W("hatch"), "right": W("right"), "here": W("here"),
    "here_end": E("here"),
    # why
    "because": W("because"), "nothing": W("nothing"), "dares": W("dares"), "wade": W("wade"), "in2": T.ws[_in2],
    "after": W("after"), "them": W("them"), "them_end": E("them"),
    # the button
    "so": W("So if"), "flamingo3": W("flamingo says"), "says": W("says"), "waters": W("water's lovely"),
    "lovely": W("lovely"), "lovely_end": E("lovely"), "dont": W("don't"), "dont_end": E("don't"),
}
for a, b in [("bird", "this1"), ("stone", "not"), ("not", "mummy"), ("water", "soda"), ("soda", "burns"),
             ("whatever", "dried"), ("dried", "crusted"), ("egyptians", "salt"), ("and2", "love"), ("love", "most"),
             ("most", "hatch"), ("because", "wade"), ("so", "lovely"), ("lovely", "dont")]:
    assert cues[a] < cues[b], f"cue order: {a} {cues[a]} !< {b} {cues[b]}"
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s
# before the end) and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says
# "subscribe" in either arm; the ask also lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the curious kind: the claim, said to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('re-timed:', ' '.join(f'{T.words[i]["word"]} {T.ws[i]:.2f}' for i in [0, 1, T.find("So if")]))
