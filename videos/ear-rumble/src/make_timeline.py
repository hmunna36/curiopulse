"""Edit timeline for the Why Do Your Ears RUMBLE When You Yawn? 👂 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.4)  # seconds after the last word: the two rumbles that answer YES, then the cut back to
#                                      frame 1 (the yawn) for the loop

W, E, ev, find = T.W, T.E, T.ev, T.find

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),       # THE TEST: by the campfire at night, TIGHT on him mid-yawn (head ~400 px), arms stretching;
                          # "RUMBLE": rumble rings shake out of both ears, the camera shakes
    ("flex", None),       # "Congrats.": party confetti at his ear; a round window opens on it: a tiny muscle in a
                          # sweatband flexes its arm ("flexed your EAR")
    ("retry", None),      # back on his face, mouth SHUT, concentrating; a crossed-out yawn badge; small rumbles again
    ("half", None),       # pull back: him and his friend in a camp chair by the fire; him calm and rumbling: CAN
    ("face", None),       # the friend tries: cheeks puff, eyes cross, tongue out on "weird face"
    ("drum", None),       # a window on his ear, the dive: the ear in section; the muscle shortens and tugs the hammer bone:
                          # the eardrum is pulled in, tight; "like a drum": a drumstick taps it (a tight TOK)
    ("payoff", None),     # back at the fire: he crunches a crisp; a volume knob at his ear turns down; CRUNCH shrinks
    ("weird", None),      # him zipped into his sleeping bag (only his face shows), an ear camera in his ear; a keyboard
                          # on a screen picks a letter on every rumble: H... I
    ("button", None),     # standing again, tight: the screen asks YES / NO; after "yes" two rumbles light YES
    ("loop", None),       # the last 0.45 s: the hook at negative time (frame 1 a moment earlier)
]
DUR = T.duration
special = {
    "flex": W("Congrats") - 0.06, "retry": W("Now do it") - 0.08, "half": W("Up to half") - 0.06,
    "face": W("The rest") - 0.06, "drum": W("That muscle") - 0.08, "payoff": W("Sound went") - 0.08,
    "weird": W("Scientists") - 0.1, "button": W("Go on") - 0.12, "loop": DUR - 0.45,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Yawn.",
    "A big one.",
    "Your ears / RUMBLE, right?",
    "Congrats.",
    "You just flexed / your EAR.",
    "Now do it / WITHOUT the yawn.",
    "Up to half / of you can.",
    "The rest...",
    "just pulled a / weird face.",
    "That muscle pulls / your eardrum tight...",
    "like a drum.",
    "Sound went / muffled?",
    "It's a / volume knob,",
    "for your own / chewing.",
    "Scientists are / testing it",
    "so people who / can barely move...",
    "can type / with a rumble.",
    "Go on.",
    "Rumble twice / for yes.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# gold = the rumble and its muscle, orange = the eardrum and the chewing, cyan = sound, green = yes / half, violet = the joke
COLOR = {"yawn": C, "big": C, "rumble": Y, "congrats": G, "flexed": Y, "ear": Y, "without": R, "half": G,
         "weird": V, "face": V, "muscle": Y, "eardrum": O, "tight": O, "drum": O, "muffled": C, "volume": Y,
         "knob": Y, "chewing": O, "scientists": G, "barely": B, "type": C, "twice": Y, "yes": G}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
sh = {s["id"]: s for s in shots}

iRum2 = find("with a rumble")        # the second "rumble" (the weird block)
iRum3 = find("Rumble twice")         # the third (the button)
cues = {
    # the hook
    "yawn": W("Yawn"), "yawn_end": E("Yawn"), "big": W("big"), "one": W("big one", 1), "one_end": E("big one", 1),
    "your": W("Your ears"), "ears": W("ears"), "rumble": W("RUMBLE"), "rumble_end": E("RUMBLE"), "right": W("right"),
    "right_end": E("right"),
    # the answer
    "congrats": W("Congrats"), "congrats_end": E("Congrats"), "you": W("You just"), "flexed": W("flexed"),
    "ear": W("your EAR", 1), "ear_end": E("your EAR", 1),
    # the retry
    "now": W("Now do it"), "without": W("WITHOUT"), "yawn2": W("the yawn", 1), "yawn2_end": E("the yawn", 1),
    # half, the face
    "up": W("Up to half"), "half": W("half"), "can": W("of you can", 2), "can_end": E("of you can", 2),
    "rest": W("The rest"), "rest_end": E("The rest", 1), "just": W("just pulled"), "pulled": W("pulled"),
    "weird": W("weird"), "face": W("face"), "face_end": E("face"),
    # the drum
    "muscle": W("That muscle", 1), "pulls": W("pulls"), "eardrum": W("eardrum"), "tight": W("tight"),
    "tight_end": E("tight"), "like": W("like a drum"), "drum": W("drum"), "drum_end": E("drum"),
    # the payoff
    "sound": W("Sound went"), "muffled": W("muffled"), "muffled_end": E("muffled"), "its": W("It's a volume"),
    "volume": W("volume"), "knob": W("knob"), "knob_end": E("knob"), "for": W("for your own"), "own": W("own"),
    "chewing": W("chewing"), "chewing_end": E("chewing"),
    # the weird fact
    "scientists": W("Scientists"), "testing": W("testing"), "so": W("so people"), "people": W("people"),
    "barely": W("barely"), "move": W("move"), "move_end": E("move"), "can3": W("can type"), "type": W("type"),
    "with": W("with a rumble"), "rumble2": T.ws[iRum2 + 2], "rumble2_end": T.we[iRum2 + 2],
    # the button
    "go": W("Go on"), "on": W("Go on", 1), "on_end": E("Go on", 1), "rumble3": T.ws[iRum3], "twice": W("twice"),
    "yes": W("yes"), "yes_end": E("yes"),
}
c = cues
# the rumbles: one list of [start, end] spans that the picture (rings, shake) and the sound (the low rumble) both read
rumbles = [
    [c["ears"] - 0.15, c["right_end"] + 0.25],            # the hook: at the top of the yawn
    [c["flexed"] - 0.05, c["ear_end"] + 0.2],             # "You just flexed your EAR": the muscle flexes (in the window)
    [c["yawn2_end"] + 0.12, c["can_end"] + 0.1],          # without the yawn: him, then calm and smug in the two-shot
    [c["muscle"] - 0.1, c["tight_end"] + 0.1],            # inside: the muscle pulls the drum in
    [c["move_end"] + 0.1, c["move_end"] + 0.42],          # the sleeping bag: H
    [c["rumble2"] - 0.05, c["rumble2_end"] + 0.3],        # I
    [c["yes_end"] + 0.08, c["yes_end"] + 0.36],           # yes: one...
    [c["yes_end"] + 0.48, c["yes_end"] + 0.78],           # ...two
]
rumbles = [[round(a, 3), round(b, 3)] for a, b in rumbles]
cues.update({
    "rumbles": rumbles,
    "confetti": c["congrats"] + 0.05,                     # the party popper at his ear
    "window_in": c["you"] - 0.1,                          # the window on his ear opens
    "flex_pose": c["ear"] - 0.05,                         # the tiny muscle hits its bodybuilder pose
    "no_yawn": c["without"] + 0.05,                       # the crossed-out yawn badge
    "can_tag": c["can"],                                  # CAN pops over him
    "strain": c["just"] - 0.1,                            # the friend starts straining
    "weird_pop": c["face"] + 0.02,                        # the full weird face, with a squeak in the pause after it
    "dive": c["muscle"] - 0.25,                           # the camera dives through the window into the ear
    "pull": c["pulls"],                                   # the muscle shortens, the hammer and the drum go in
    "tap": c["drum_end"] + 0.03,                          # the drumstick taps the tight drum (in the pause after "drum")
    "crunch1": c["muffled_end"] + 0.04,                   # a crisp under the earmuffs: a muffled crnch (pause after "muffled?")
    "knob_in": c["volume"] - 0.05,                        # the knob pops in at his ear
    "turn": c["chewing_end"] + 0.06,                      # it turns down as he crunches again (pause after "chewing.")
    "crunch2": c["chewing_end"] + 0.03,                   # CRUNCH!, turned down by the knob as it sounds (pause after "chewing.")
    "cam_in": c["testing"],                               # the ear camera's light comes on
    "key_h": rumbles[4][0] + 0.06, "key_i": rumbles[5][0] + 0.12,   # the letters it types
    "hi_ding": c["rumble2_end"] + 0.05,                   # HI: a happy ding (pause after "rumble.")
    "ask": c["go"],                                       # YES / NO on the screen
    "yes1": rumbles[6][0], "yes2": rumbles[7][0],         # the two rumbles
    "yes_lit": rumbles[7][0] + 0.12,                      # YES lights green
})
assert c["right_end"] < c["congrats"] < c["ear"] < c["without"] < c["half"] < c["weird"] < c["eardrum"] < c["drum"]
assert c["drum"] < c["muffled"] < c["knob"] < c["chewing"] < c["barely"] < c["type"] < c["rumble2"] < c["twice"] < c["yes"]
assert rumbles[-1][1] < sh["loop"]["start"], "the second YES rumble must end before the loop shot"
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026). publish.json "subscribe" says the arm; T.write sets the
# pill's cues for the pill arm by itself and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots: ' + ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
