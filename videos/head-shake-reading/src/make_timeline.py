"""Edit timeline for the Why Can You Read While Shaking Your HEAD? 👀 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: "Nod yes." gets its nod, then the cut back to frame 1

W, E, ev, find = T.W, T.E, T.ev, T.find

# word indexes of the repeated words (assert the order below)
i_right1 = find("right?")                      # hook: "Blurry, right?"
i_right2 = find("right", i_right1 + 1)         # again: "Head goes right..."
i_eyes1 = find("eyes")                         # answer: "steering your eyes."
i_eyes2 = find("eyes", i_eyes1 + 1)            # again: "rolls your eyes LEFT."
i_eyes3 = find("eyes", i_eyes2 + 1)            # payoff: "so your eyes chase it."
i_shake2 = find("Shake the phone")             # payoff
i_ears2 = find("ears", i_shake2)               # payoff: "Your ears feel nothing"

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. Every id has an SC.<id> in web/.
# The bedroom shots (hook, ears, again, payoff, button) are one continuous picture seen from his phone: the cuts
# between them are only where the code changes hands, never a jump on screen.
SHOTS = [
    ("hook", None),            # we ARE his phone: he shakes it (the frame shakes and smears, his eyes chase it), then
                               # holds it still and gently shakes his head "no": sharp, his eyes locked on us
    ("ears", "Sharp again"),   # the answer: a round window opens on his ear: a little driver at a steering wheel, two
                               # cords to his eyes; as his head turns, the wheel turns the other way and so do his eyes
    ("again", "Keep going"),   # the push in: HEAD -> and <- EYES arrows on the turn, the cords pull, "LEFT"
    ("speed", "In a HUNDREDTH"),  # inside the window, close: the driver yanks the wheel at a blur, 0.01 s
    ("payoff", "Shake the phone"),  # back out: the phone shakes again, the driver feels nothing (feet up, "?"), his eyes
                                    # chase the phone a beat late, smeared, then cross: TOO SLOW
    ("weird", "A doctor who"),  # 1948, sepia: him as the doctor in an iron hospital bed, his head jammed between two
                                # bars, a book; every heartbeat thumps and the words jump
    ("button", "Still reading"),  # back in his bed: "Still reading?" he looks at us, "Nod yes." he nods, his eyes on us;
                                  # the last 0.4 s is the hook at negative time (the phone starts to shake). The pill
                                  # arm (a 23:30 slot): his face stays above y 1050 for the last 2.5 s
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
# The captions ARE what the viewer reads during the test: they blur when the viewer shakes the phone, and stay sharp
# when they shake their head.
CHUNKS = [
    "Shake your / phone.", "Blurry, / right?", "Now gently / shake your HEAD.",
    "Sharp / again?", "Your EARS", "are steering / your eyes.",
    "Keep going.", "Head goes / right...", "your ear rolls", "your eyes / LEFT.",
    "In a / HUNDREDTH", "of a second!",
    "Shake the / phone?", "Your ears / feel nothing,", "so your eyes / chase it.", "Too slow.",
    "A doctor / who lost this", "read with / his head", "jammed between / bed bars.",
    "Even his / heartbeat", "made the / words jump.",
    "Still / reading?", "Nod yes.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {
    "blurry": R, "head": Y, "sharp": G, "ears": Y, "steering": O, "left": Y,
    "hundredth": Y, "nothing": R, "slow": R, "doctor": V, "jammed": O, "bars": V,
    "heartbeat": P["P"], "jump": O, "yes": G,
}
DISPLAY = {}  # spoken words shown as figures
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

ws, we = T.ws, T.we
cues = {
    # the hook: the phone shake, then the head shake
    "shake1": W("Shake your phone"), "phone1_end": E("phone."), "blurry": W("Blurry"),
    "right1": ws[i_right1], "now": W("Now gently"), "gently": W("gently"), "shake_head": W("shake your HEAD"),
    "head1": W("HEAD"), "head1_end": E("HEAD"),
    # the answer: the window on his ear, the driver, the cords
    "sharp": W("Sharp"), "again1": W("again?"), "ears": W("EARS"), "steering": W("steering"),
    "eyes1": ws[i_eyes1], "eyes1_end": we[i_eyes1],
    # again: the arrows, the cords pull, LEFT
    "keep": W("Keep going"), "going_end": E("going."), "head2": W("Head goes"), "right2": ws[i_right2],
    "right2_end": we[i_right2], "ear_rolls": W("your ear rolls"), "rolls": W("rolls"), "eyes2": ws[i_eyes2],
    "left": W("LEFT"), "left_end": E("LEFT"),
    # speed: inside the window
    "hundredth": W("HUNDREDTH"), "second": W("second"), "second_end": E("second"),
    # payoff: the phone shakes again, the driver feels nothing, the eyes chase, too slow
    "shake2": ws[i_shake2], "phone2_end": E("phone?"), "ears2": ws[i_ears2], "nothing": W("nothing"),
    "nothing_end": E("nothing"), "eyes3": ws[i_eyes3], "chase": W("chase"), "too": W("Too slow"),
    "slow": W("slow"), "slow_end": E("slow"),
    # weird: 1948
    "doctor": W("doctor"), "lost": W("lost"), "read": W("read with"), "his_head": W("his head jammed"),
    "jammed": W("jammed"), "between": W("between"), "bars": W("bars"), "bars_end": E("bars"),
    "even": W("Even"), "heartbeat": W("heartbeat"), "made": W("made"), "words": W("words jump"), "jump": W("jump"),
    "jump_end": E("jump"),
    # the button
    "still": W("Still"), "reading_end": E("reading?"), "nod": W("Nod"), "yes": W("yes"), "yes_end": E("yes"),
}
# the heartbeat in 1948: a thump on "heartbeat", then every 0.78 s to the end of the shot (the words jump on each)
_wend = next(s["end"] for s in shots if s["id"] == "weird")
beats, b = [], cues["heartbeat"] + 0.08
while b < _wend - 0.15:
    beats.append(round(b, 3))
    b += 0.78
cues["beats"] = beats
# the swings, shared by the picture (scenes.js) and the sound (audio.py): the phone swinging in his hand (f, phase:
# frame 1 lands near the end of a swing), his head shaking "no", the nod. A whoosh goes on each fastest moment.
import math
_dur = T.duration
cues["ph_f"], cues["ph_ph0"], cues["yaw_f"], cues["nod_f"] = 3.1, 1.25, 1.55, 1.9
_w = 2 * math.pi * cues["ph_f"]
def _phone_swishes(t0, t1):
    out, k = [], math.ceil((_w * t0 + cues["ph_ph0"]) / math.pi)
    while True:
        tk = (k * math.pi - cues["ph_ph0"]) / _w
        if tk > t1:
            return out
        if tk >= t0:
            out.append(round(tk, 3))
        k += 1
cues["swings1"] = _phone_swishes(0.0, cues["now"] - 0.05)
cues["swings2"] = _phone_swishes(cues["shake2"] + 0.05, cues["too"] - 0.03)
cues["swings_loop"] = [round(_dur + x, 3) for x in _phone_swishes(-0.35, -0.02)]   # the hook's swings at negative time
_y0 = cues["gently"] - 0.05
cues["yaw_t0"] = round(_y0, 3)
cues["heads"] = [round(_y0 + k / (2 * cues["yaw_f"]), 3) for k in range(1, 60)
                 if _y0 + k / (2 * cues["yaw_f"]) < shots[3]["start"] - 0.05
                 and not (cues["head2"] - 0.1 < _y0 + k / (2 * cues["yaw_f"]) < cues["left_end"] + 0.3)]
cues["turn_right"] = round(cues["head2"] + 0.25, 3)
cues["nods"] = [round(cues["nod"] + (0.25 + k) / cues["nod_f"], 3) for k in range(3) if cues["nod"] + (0.25 + k) / cues["nod_f"] < cues["yes_end"] + 0.3]
cues["order_ok"] = 1
assert ws[i_right1] < cues["now"] < cues["sharp"] < cues["ears"] < cues["keep"] < cues["right2"] < cues["left"] < cues["hundredth"]
assert cues["hundredth"] < cues["shake2"] < cues["ears2"] < cues["chase"] < cues["too"] < cues["doctor"] < cues["heartbeat"] < cues["still"]
assert i_eyes1 < i_eyes2 < i_eyes3 and i_right1 < i_right2
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
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s in shots:
    print(f'  shot {s["id"]:8s} {s["start"]:6.2f} -> {s["end"]:6.2f}')
