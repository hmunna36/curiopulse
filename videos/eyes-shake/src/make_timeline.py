"""Edit timeline for the Can You Make Your Eyes SHAKE on Purpose? 👀 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: his glare at the photo, then the cut back to frame 1
#                                      (the loop). Every Short is 30-35 s since 16 Oct 2026.

W, E, ev, find = T.W, T.E, T.ev, T.find

# v3's alignment ran early in three places (qc_audio round 1: "and" at -41.9 dB, its window the silence before it; the
# speech-band bursts put each word 0.06-0.16 s later). Each phrase goes onto its own bursts.
T.retime("and try again", T.W("and try") - 0.1, T.E("again") + 0.15)
T.retime("in jumps", T.W("in jumps") + 0.02, T.E("jumps") + 0.1)
_ib = T.find("in between")                        # its bursts: "in" 13.46-13.59, "be-tween" 13.72-13.98 (two runs)
_b = T.bursts(T.ws[_ib] + 0.02, T.we[_ib + 1] + 0.1)
if len(_b) >= 2:
    T.ws[_ib] = T.words[_ib]["start"] = round(_b[0][0] - 0.04, 3)
    T.we[_ib] = T.words[_ib]["end"] = round(_b[0][1], 3)
    T.ws[_ib + 1] = T.words[_ib + 1]["start"] = round(_b[1][0] - 0.04, 3)
    print(f'moved "in between" onto its bursts: {T.ws[_ib]:.2f}, {T.ws[_ib + 1]:.2f}')

# repeated words: the index of each later one (find() searches from a word index)
_eyes2 = find("eyes", find("Your eyes have"))        # "Your eyes have a parking BRAKE." (the first is the hook's)
_eyes3 = find("Eyes move")
_try2 = find("try again")
_brake2 = find("brake on")
_about2 = find("about fifteen")
_shake2 = find("shake on")
_canyou2 = find("Can you", find("doctor"))           # "Can you? Ask around..." (the first is the hook's)
_cant2 = find("can't", find("Still"))

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),       # THE TEST, tight on his face by the campfire at night (head ~620 px): his eyes HOP left... right...
                          # with effort, slow, while his eyebrows wiggle instead; "side to side" two hops; "Can't?" he stops,
                          # deadpan; "parking BRAKE" a red brake caliper clamps on each iris (ratchet, CLUNK) and a red (P)
                          # lamp lights on his forehead; "Cross them a little" his pupils cross toward his nose; a small STOP
                          # IF DIZZY tag; "try again" he strains, the irises jerk and the calipers yank them back. The camera
                          # creeps in toward his right eye
    ("macro", None),      # the push goes on into that one eye (it fills the frame): "jumps" the caliper opens and the iris
                          # JUMPS across with a smear; it clamps (red flash, BRAKE ON); hop, clamp, hop, clamp
    ("friend", None),     # across the fire, his friend in the camp chair (beanie, round glasses, a mug), calipers on his eyes
                          # too: 1 IN 12; "let go..." the calipers SPRING off and fly away; his eyes BUZZ side to side
    ("copy", None),       # the hero tries to copy: "back... and forth," one slow hop each, CLANK, CLANK
    ("buzz", None),       # the friend's eyes close behind his glasses, buzzing: 15x A SECOND; a hummingbird stops to stare
    ("safe", None),       # both by the fire: HARMLESS (a tick), the friend buzzes and grins, the hero claps; "on their own"
                          # an ON THEIR OWN? tag; "doctor." a stethoscope pops round the hero's neck: SEE A DOCTOR
    ("family", None),     # the friend holds up a framed family photo: gran, mum and a kid, all buzzing: RUNS IN FAMILIES
    ("button", None),     # the hero, close, holds up HIS family photo: his mum and dad, calipers on, (P) lamps lit; "Blame your
                          # parents." he glares at it. The pill arm: the silent pill over the last 2.4 s (face above y 1050)
    ("loop", None),       # the hook at negative time: the last frames ARE frame 1's picture (the loop)
]
# every cut lands just before the first word of a caption chunk (a cut ends the chunk on screen)
special = {
    "macro": T.ws[_eyes3] - 0.06,
    "friend": W("About one") - 0.06,
    "copy": W("back and") - 0.06,
    "buzz": T.ws[_about2] - 0.06,
    "safe": W("Harmless") - 0.06,
    "family": T.ws[_canyou2] - 0.06,
    "button": W("Still") - 0.06,
    "loop": T.duration - 0.45,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Can you / SHAKE",
    "your eyes?",
    "Try it,",
    "side to / side.",
    "Can't?",
    "Your eyes / have a",
    "parking / BRAKE.",
    "Cross them / a little...",
    "and try / again.",
    "Eyes move / in jumps,",
    "with the / brake on",
    "in / between.",
    "About / one in twelve",
    "people / seem to",
    "let go...",
    "back and / forth,",
    "about / fifteen",
    "times a / second.",
    "Harmless...",
    "unless / they shake",
    "on their / own.",
    "Then,",
    "doctor.",
    "Can you?",
    "Ask / around:",
    "it often / runs in",
    "families.",
    "Still / can't?",
    "Blame your / parents.",
]
Y, O, C, R, G, B, V, S, Pk = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"shake": Y, "eyes": C, "cant": R, "can't": R, "parking": R, "brake": R, "cross": O, "again": Y, "jumps": Y,
         "1": Y, "12": Y, "let": G, "go": G, "forth": O, "15": Y, "second": Y, "harmless": G, "own": O, "doctor": R,
         "families": V, "parents": V}
DISPLAY = {"one in twelve": ["1", "IN", "12"], "fifteen": ["15"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # the hook: the test
    "can": W("Can you"), "shake": W("SHAKE"), "shake_end": E("SHAKE"), "eyes1": W("eyes"), "eyes1_end": E("eyes"),
    "try": W("Try it"), "side1": W("side to"), "side2": W("side", s=find("to side")), "side2_end": E("side", s=find("to side")),
    # the answer
    "cant": W("Can't"), "cant_end": E("Can't"), "your2": W("Your eyes have"), "eyes2": T.ws[_eyes2], "parking": W("parking"),
    "brake": W("BRAKE"), "brake_end": E("BRAKE"),
    # the retry
    "cross": W("Cross"), "little": W("little"), "little_end": E("little"), "and1": W("and try"), "try2": T.ws[_try2],
    "again": W("again"), "again_end": E("again"),
    # the eye up close
    "emove": T.ws[_eyes3], "move": W("move"), "jumps": W("jumps"), "jumps_end": E("jumps"), "with": W("with"),
    "brake2": T.ws[_brake2], "brake2_end": T.we[_brake2], "on": W("on in"), "between": W("between"), "between_end": E("between"),
    # the friend
    "about": W("About one"), "one": W("one in twelve"), "twelve": W("twelve"), "people": W("people"), "seem": W("seem"),
    "let": W("let go"), "go": W("go"), "go_end": E("go"),
    "back": W("back and"), "forth": W("forth"), "forth_end": E("forth"),
    "about2": T.ws[_about2], "fifteen": W("fifteen"), "times": W("times"), "second": W("second"), "second_end": E("second"),
    # harmless; a doctor
    "harmless": W("Harmless"), "harmless_end": E("Harmless"), "unless": W("unless"), "shake2": T.ws[_shake2],
    "own": W("own"), "own_end": E("own"), "then": W("Then"), "doctor": W("doctor"), "doctor_end": E("doctor"),
    # families
    "canyou": T.ws[_canyou2], "ask": W("Ask"), "around": W("around"), "around_end": E("around"), "often": W("often"),
    "runs": W("runs"), "families": W("families"), "families_end": E("families"),
    # the button
    "still": W("Still"), "cant2": T.ws[_cant2], "cant2_end": T.we[_cant2], "blame": W("Blame"), "parents": W("parents"),
    "parents_end": E("parents"),
}
order = ["can", "shake", "eyes1", "try", "side1", "side2", "cant", "your2", "parking", "brake", "cross", "and1", "again",
         "emove", "jumps", "with", "brake2", "between", "about", "twelve", "let", "go", "back", "forth", "about2", "fifteen",
         "second", "harmless", "unless", "own", "then", "doctor", "canyou", "ask", "often", "families", "still", "cant2",
         "blame", "parents"]
for a, b in zip(order, order[1:]):
    assert cues[a] < cues[b], f"cue order: {a} {cues[a]} !< {b} {cues[b]}"
# the hero's hops in the hook (his slow attempt: one jump about every 0.4 s, on the words where they can be seen),
# the clamps on the retry, the hops in the eye up close, the copy shot's two hops
cues["hops"] = [round(x, 3) for x in [0.0, cues["shake"] + 0.12, cues["eyes1"] + 0.1, cues["side1"] - 0.02, cues["side2"] - 0.02]]
cues["tugs"] = [round(cues["and1"] + 0.02 + 0.22 * i, 3) for i in range(4)]            # "and try again": he strains, yanked back
cues["mhops"] = [round(cues["jumps"] - 0.04, 3), round(cues["on"] - 0.02, 3), round(cues["between_end"] - 0.06, 3)]
cues["chops"] = [round(cues["back"] - 0.02, 3), round(cues["forth"] - 0.02, 3)]
cues["buzz_on"] = round(cues["go_end"] + 0.2, 3)                                      # the friend's eyes start to buzz (after the SPROING)
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] /
# ["sub_out"] here. Nobody says "subscribe" in either arm.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print(f'subscribe: nothing said; arm: {video_subscribe(sys.argv[1]) or "none"}'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
