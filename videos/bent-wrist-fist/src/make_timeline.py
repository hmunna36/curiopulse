"""Edit timeline for the Why Can't You Make a FIST With Your Wrist Bent? ✊ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py. The world: mosquito-bites' campsite at night
(camp.js) and one-finger's 3D hand (fist3d.js), with a wrist that bends, a forearm, strings and the puppeteer (bwhand.js).
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.2)  # the button beat: the marshmallow stick drops into the fire (FWOOSH), then the cut
#                                      back to frame 1 for the loop
# "See" was aligned to its "s" only (a hiss above 4 kHz, silent in the speech band: qa.py read -14.6 dB): give it the vowel
# too, from the first speech-band burst after "again.", and start "your" after it
_i = T.find("See your forearm")
_b = T.bursts(T.ws[_i], T.we[_i + 2])
if _b and _b[0][0] > T.ws[_i] + 0.04:
    T.ws[_i] = T.words[_i]["start"] = round(_b[0][0] - 0.06, 3)
    T.we[_i] = T.words[_i]["end"] = round(_b[0][0] + 0.08, 3)
    T.ws[_i + 1] = T.words[_i + 1]["start"] = max(T.ws[_i + 1], T.we[_i])
    print(f"See: {T.ws[_i]:.2f}-{T.we[_i]:.2f}, your from {T.ws[_i + 1]:.2f}")

SHOTS = [
    ("hook", None),               # THE TEST: tight on his face (left) and his raised left hand (right) by the campfire at night;
                                  # frame 1: the wrist already bent all the way down, the fingers straining into a fist that will
                                  # not close; "Can't?": he gives up and glares at it; "no muscles": a MUSCLES: 0 tag; "puppets.":
                                  # strings appear, tied to the fingertips, running back into his wrist; the fingers jig
    ("glass", "Squeeze again"),   # he squeezes again; the camera slides down his forearm, which bulges and turns to glass: inside,
                                  # a little muscle with a face holds a puppet's control bar: the strings run from it over the wrist
                                  # to the fingertips; "That's the puppeteer.": he opens his eyes and waves
    ("slack", "Wrist down?"),     # the wrist bends all the way: the strings go wavy (SLACK); he hauls the bar down hand over hand
                                  # until it hits his belly: "No pull left.": he pants; the fist stays open (a dashed gap)
    ("clamp", "Now tip"),         # the wrist tips back: the strings snap tight over it and yank him up off his feet; "Clamp!": the
                                  # fist slams shut (CLAMP!), the strings glow
    ("grab", "People"),           # the puppeteer falls asleep (a nightcap); a marshmallow stick lies across his open hand; the
                                  # wrist tips back and the strings close the fingers round it by themselves (WRIST BACK = GRIP)
    ("button", "Now bend it"),    # the glass is gone: back on his face and hand; the wrist bends down, the fingers flop open, the
                                  # stick slides out and drops: FWOOSH from the fire below; the camera goes back to the hook's
    ("loop", None),               # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

CHUNKS = [
    "Bend your wrist", "all the way / down.", "Now squeeze", "a tight / fist.",
    "Can't?", "Your fingers", "have no / muscles.", "They're...", "puppets.",
    "Squeeze / again.", "See your / forearm move?", "That's the / puppeteer.",
    "Wrist down?", "His strings", "go slack.", "No pull / left.",
    "Now tip / your wrist", "back and / squeeze.", "Clamp!",
    "People with", "paralyzed / fingers", "grab things / this way.", "The strings", "close the / hand", "for them.",
    "Now bend it / down again...", "and watch", "the puppet / flop.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
COLOR = {"wrist": O, "tight": Y, "fist": Y, "can't": R, "no": R, "muscles": R, "puppets": V, "forearm": O,
         "puppeteer": V, "strings": Y, "slack": R, "pull": R, "back": G, "clamp": G, "paralyzed": B, "grab": G,
         "close": G, "flop": V, "puppet": V}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_fing = find("Your fingers have")
i_sq2 = find("Squeeze again.")
i_wd = find("Wrist down?")
i_his = find("His strings go")
i_np = find("No pull left.")
i_tip = find("Now tip your")
i_close = find("The strings close")
i_way = find("things this way.")
i_bend = find("Now bend it")
cues = {
    # the hook: the test
    "bend": W("Bend"), "wrist1": W("wrist"), "down1": W("down."), "down1_end": E("down."),
    "now1": W("Now"), "squeeze1": W("squeeze"), "tight": W("tight"), "fist": W("fist."), "fist_end": E("fist."),
    # the answer
    "cant": W("Can't?"), "cant_end": E("Can't?"), "fingers": W("fingers", s=i_fing), "muscles": W("muscles."),
    "muscles_end": E("muscles."), "theyre": W("They're..."), "puppets": W("puppets."), "puppets_end": E("puppets."),
    # the puppeteer
    "squeeze2": W("Squeeze", s=i_sq2), "again_end": E("again.", s=i_sq2), "see": W("See"), "forearm": W("forearm"),
    "move": W("move?"), "move_end": E("move?"), "thats": W("That's"), "puppeteer": W("puppeteer."),
    "puppeteer_end": E("puppeteer."),
    # slack
    "wrist2": W("Wrist", s=i_wd), "down2_end": E("down?", s=i_wd), "his": W("His", s=i_his), "strings1": W("strings", s=i_his),
    "slack": W("slack."), "slack_end": E("slack."), "nopull": W("No", s=i_np), "left": W("left."), "left_end": E("left."),
    # clamp
    "now2": W("Now", s=i_tip), "tip": W("tip"), "back": W("back", s=i_tip), "back_end": E("back", s=i_tip),
    "squeeze3": W("squeeze.", s=i_tip), "clamp": W("Clamp!"), "clamp_end": E("Clamp!"),
    # grab
    "people": W("People"), "paralyzed": W("paralyzed"), "grab": W("grab"), "way_end": E("way.", s=i_way),
    "strings2": W("strings", s=i_close), "close": W("close", s=i_close), "hand": W("hand", s=i_close), "them_end": E("them."),
    # the button
    "now3": W("Now", s=i_bend), "bend3": W("bend", s=i_bend), "down3": W("down", s=i_bend), "again3_end": E("again...", s=i_bend),
    "watch": W("watch"), "puppet": W("puppet"), "flop": W("flop."), "flop_end": E("flop."),
}
cues["giveup"] = round(cues["cant"] + 0.04, 3)                # he stops squeezing and glares at his hand
cues["tag0"] = round(cues["muscles"] + 0.02, 3)               # MUSCLES: 0 pops beside the fingers
cues["strings_in"] = round(cues["puppets"] - 0.06, 3)         # the strings appear on the fingertips
cues["jig"] = round(cues["puppets_end"] + 0.02, 3)            # the fingers jig on their strings in the gap
cues["glass_in"] = round(cues["forearm"] - 0.08, 3)           # the forearm turns to glass from the wrist down
cues["bulge"] = round(cues["move"] - 0.04, 3)                 # the forearm bulges as he squeezes
cues["wake"] = round(cues["puppeteer"] + 0.06, 3)             # the puppeteer opens his eyes and waves
cues["sag"] = round(cues["strings1"] - 0.05, 3)               # the strings go wavy as the wrist bends all the way
cues["reel"] = round(cues["slack_end"] + 0.02, 3)             # he hauls the bar down, hand over hand
cues["bottom"] = round(cues["left"] - 0.04, 3)                # the bar hits his belly: no pull left
cues["pant"] = round(cues["left_end"] + 0.04, 3)              # he pants, sweating
cues["yank"] = round(cues["back"] - 0.02, 3)                  # the strings snap tight and lift him off his feet
cues["snap"] = round(cues["clamp"] - 0.06, 3)                 # the fist slams shut
cues["sleep"] = round(cues["people"] + 0.08, 3)               # the puppeteer falls asleep: a nightcap
cues["stick"] = round(cues["paralyzed"] - 0.02, 3)            # the marshmallow stick drops into his open hand
cues["grip"] = round(cues["strings2"] - 0.10, 3)              # the wrist tips back: the fingers close round the stick
cues["label"] = round(cues["close"] + 0.02, 3)                # WRIST BACK = GRIP
cues["unglass"] = round(cues["now3"] - 0.06, 3)               # the glass is gone: back to his real hand
cues["slip"] = round(cues["flop"] + 0.04, 3)                  # the fingers flop open, the stick slides out
cues["fwoosh"] = round(cues["flop_end"] + 0.30, 3)            # it lands in the fire below: FWOOSH
cues["loop_in"] = T.duration - 0.40
_order = ["bend", "wrist1", "down1", "down1_end", "now1", "squeeze1", "tight", "fist", "fist_end", "cant", "giveup", "cant_end",
          "fingers", "muscles", "tag0", "muscles_end", "theyre", "strings_in", "puppets", "puppets_end", "jig", "squeeze2",
          "again_end", "see", "glass_in", "forearm", "bulge", "move", "move_end", "thats", "puppeteer", "wake", "puppeteer_end",
          "wrist2", "down2_end", "his", "sag", "strings1", "slack", "slack_end", "reel", "nopull", "bottom", "left", "left_end",
          "pant", "now2", "tip", "yank", "back", "back_end", "squeeze3", "snap", "clamp", "clamp_end", "people", "sleep",
          "stick", "paralyzed", "grab", "way_end", "grip", "strings2", "close", "label", "hand", "them_end", "unglass", "now3",
          "bend3", "down3", "again3_end", "watch", "puppet", "flop", "slip", "flop_end", "fwoosh", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
assert cues["fwoosh"] < cues["loop_in"] - 0.3, "the FWOOSH needs the tail before the loop"
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
