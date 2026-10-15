"""Edit timeline for the Why Can't You Lift Your RING FINGER? 💍 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.25)  # the button beat (he is still straining) and the cut back to frame 1 for the loop

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),            # THE TEST: his hand slaps flat on a café table on frame 1, tight, his straining face above
                               # it; the middle finger folds under, the ring finger will not lift; the leash gag; the
                               # answer runs on in the same shot
    ("inside", "See the"),     # the same hand: the camera rises over it and the skin of its back turns to glass: the
                               # cords, the forearm's lifters (two spares, none for the ring finger), the strap
    ("past", "In the"),        # 1880s, in sepia: a surgeon's scissors snip the strap; a pianist plays with a free finger
    ("button", "Still trying"),  # back at the café table: still straining; he gives up and slaps the hand flat again
    ("loop", None),            # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Hand flat,", "fold your / middle finger", "under,", "now lift your / RING finger.",
    "Stuck?", "Relax,", "it's on / a leash...", "held by your / middle finger.",
    "See the cords / on your hand?", "They lift / your fingers.",
    "Pointer / and pinky", "get a spare / lifter each.", "Ring finger?", "Nope.",
    "And a strap / ties it", "to the / middle one.", "Middle down...", "ring down.",
    "In the / eighteen-eighties,", "a surgeon / snipped", "those straps / for pianists...", "on purpose.",
    "Still trying,", "aren't you?",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"flat": C, "middle": O, "ring": Y, "lift": G, "stuck": R, "leash": R, "cords": C, "pointer": G, "pinky": G,
         "spare": G, "nope": R, "strap": V, "down": R, "1880s": V, "snipped": R, "pianists": B, "purpose": Y, "trying": Y}
DISPLAY = {"eighteen-eighties": ["1880s"]}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

# the aligner gave "See" only its hiss (9.83-9.91 s) and its vowel to "the": on the waveform (speech band, 10 ms steps)
# "See" runs from the block start to +0.19 s and "the" from +0.21 s. Move the boundary (captions and QA read it).
_i = T.find("See the cords")
_b0 = T.block("cords")["start"]
assert abs(T.ws[_i] - _b0) < 0.02 and T.we[_i] < _b0 + 0.12, "the cords take changed: re-check this boundary"
T.words[_i]["end"] = T.we[_i] = round(_b0 + 0.19, 3)
T.words[_i + 1]["start"] = T.ws[_i + 1] = round(_b0 + 0.21, 3)

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
iA = find("Stuck?")                      # word index where the answer starts: later lookups search from here
iS = find("Pointer")
cues = {
    # the hook: the slap lands on frame 0 (the loop's last frames are the hand coming down)
    "flat": W("flat,"), "fold": W("fold"), "under": W("under,"), "under_end": E("under,"),
    "now": W("now"), "lift": W("lift"), "ring": W("RING"), "ring_end": E("RING finger."), "hook_end": E("RING finger.", k=1),
    # the answer: stuck, the leash, the middle finger holding it
    "stuck": W("Stuck?"), "stuck_end": E("Stuck?"), "relax": W("Relax,"), "leash": W("leash..."),
    "leash_end": E("leash..."), "held": W("held"), "by_middle": W("middle", s=iA), "answer_end": E("finger.", s=iA),
    # inside: the cords, the lifters, the strap
    "see": W("See"), "cords": W("cords"), "hand": W("hand?"), "they": W("They"), "they_lift": W("lift", s=find("They")),
    "fingers": W("fingers."), "fingers_end": E("fingers."),
    "pointer": W("Pointer"), "pinky": W("pinky"), "spare": W("spare"), "each": W("each."), "each_end": E("each."),
    "ringq": W("Ring", s=iS), "ringq_end": E("finger?", s=iS), "nope": W("Nope."), "nope_end": E("Nope."),
    "strap": W("strap"), "ties": W("ties"), "middle_one": W("middle one."), "one_end": E("one."),
    "mdown": W("Middle down..."), "mdown_end": E("down..."), "rdown": W("ring down."), "rdown_end": E("ring down.", k=1),
    # the 1880s
    "in1880": W("In the"), "eighties": W("eighteen-eighties,"), "surgeon": W("surgeon"), "snipped": W("snipped"),
    "straps": W("straps"), "pianists": W("pianists..."), "pianists_end": E("pianists..."),
    "purpose": W("on purpose."), "purpose_end": E("purpose."),
    # the button
    "still": W("Still"), "trying": W("trying,"), "arent": W("aren't"), "you_end": E("you?"),
}
cues["loop_in"] = T.duration - 0.40
# ---- no Subscribe pill (since 16 Oct 2026; user, 15 Oct: "yes"; reference/analytics.md, the rules of 15 Oct).
# Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"]: qa.py fails a Short that has them.
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
