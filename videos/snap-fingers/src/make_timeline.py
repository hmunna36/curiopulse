"""Edit timeline for the Why Can't Some People SNAP Their Fingers? 🫰 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.9)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Every Short is 30-35 s since 16 Oct 2026: keep it short,
#                                      so the loop comes before the thumb does.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),               # THE TEST: tight on his face (left) and his raised left hand (right) by the campfire at night;
                                  # frame 1: thumb and middle finger already pressed, ready; "fingers.": SNAP, the fire flares;
                                  # "barely touching": he sets them barely together; "snap.": the finger slides off limply, a
                                  # sad puff of smoke, the fire does nothing
    ("glass", "A snap's"),        # the hand and forearm turn to glass: one glowing string from a control bar in the forearm to
                                  # the middle fingertip; the puppeteer (bent-wrist-fist's forearm muscle) lies asleep, the string
                                  # slack; a LOAD meter at 0 ("never LOADED it")
    ("load", "Press HARD"),       # he presses hard (the fingertips squish, the hand trembles): the puppeteer wakes and hauls, the
                                  # string goes taut and hot, the LOAD meter fills
    ("macro", "Your squishy"),    # macro on the two fingertip pads pressed together, fingerprints squished flat: grip... grip...
                                  # (they creep, sweat) ... SLIP! (the top pad shoots away)
    ("slam", "Your finger slams"),  # slow motion from the palm side: the finger whips down and hits the base of the thumb: shock
                                  # rings, SNAP!; the puppeteer tumbles when his string goes slack; a 0.007 s tag
    ("race", "The fastest"),      # SPEED-UP: two bars, YOUR SNAP rockets up; a pitcher (him in a cap) throws; his bar reaches
                                  # only a third: x2.6
    ("villain", "Metal fingertips"),  # him in a cape with a steel glove, red light: the dramatic snap goes "tink" and flops; the
                                  # fire just sits there
    ("button", "Now try a"),      # back to the hook's framing: he tries a SLOW snap, squinting; nothing; the cut to frame 1
    ("loop", None),               # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

CHUNKS = [
    "Snap your / fingers.", "Now barely / touching...", "snap.",
    "Fizzled?", "A snap's a / catapult...", "and you never", "LOADED it.",
    "Press HARD.", "Feel it / straining?", "That's the / catapult", "loading.",
    "Your squishy / fingertips", "grip...", "grip...", "SLIP!",
    "Your finger", "slams into / your palm...", "and THAT / slap", "is the snap.",
    "The fastest / speed-up", "ever clocked / in a human...", "almost / triple", "a pitcher's / arm!",
    "Metal / fingertips", "can't squish...", "so it / flops.", "Sorry,", "VILLAINS.",
    "Now try a", "SLOW snap.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
COLOR = {"snap": Y, "barely": C, "fizzled": R, "catapult": O, "loaded": O, "hard": Y, "straining": O, "loading": O,
         "squishy": PK, "fingertips": PK, "grip": C, "slip": G, "slams": Y, "palm": Y, "slap": Y, "fastest": G,
         "speed-up": G, "triple": G, "metal": B, "squish": PK, "flops": R, "villains": V, "slow": C}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_now = find("Now barely touching")
i_snap2 = i_now + 3
i_slap = find("is the snap.")
i_grip = find("grip... grip...")
i_now3 = find("Now try a")
cues = {
    # the hook: the test
    "fingers": W("fingers."), "fingers_end": E("fingers."),
    "now1": W("Now", s=i_now), "barely": W("barely"), "touching": W("touching..."), "touching_end": E("touching..."),
    "snap2": T.ws[i_snap2], "snap2_end": T.we[i_snap2],
    # the answer
    "fizzled": W("Fizzled?"), "fizzled_end": E("Fizzled?"), "snaps": W("A snap's"), "catapult1": W("catapult..."),
    "catapult1_end": E("catapult..."), "never": W("never"), "loaded": W("LOADED"), "loaded_end": E("it.", s=find("LOADED it.")),
    # loading
    "press": W("Press"), "hard": W("HARD."), "hard_end": E("HARD."), "feel": W("Feel"), "straining": W("straining?"),
    "straining_end": E("straining?"), "thats": W("That's the catapult"), "catapult2": W("catapult loading."),
    "loading": W("loading."), "loading_end": E("loading."),
    # the macro
    "squishy": W("squishy"), "fingertips": W("fingertips", s=find("squishy fingertips")),
    "grip1": T.ws[i_grip], "grip2": T.ws[i_grip + 1], "grip2_end": T.we[i_grip + 1], "slip": W("SLIP!"), "slip_end": E("SLIP!"),
    # the slam
    "finger": W("Your finger slams"), "slams": W("slams"), "palm": W("palm..."), "palm_end": E("palm..."),
    "that": W("THAT"), "slap": W("slap"), "is": W("is the snap."), "snapw": T.ws[i_slap + 2], "snapw_end": T.we[i_slap + 2],
    # the race
    "fastest": W("fastest"), "speedup": W("speed-up"), "ever": W("ever"), "human": W("human..."), "human_end": E("human..."),
    "almost": W("almost"), "triple": W("triple"), "pitcher": W("pitcher's"), "arm": W("arm!"), "arm_end": E("arm!"),
    # the villain
    "metal": W("Metal"), "squish": W("squish..."), "squish_end": E("squish..."), "so": W("so it flops."), "flops": W("flops."),
    "flops_end": E("flops."), "sorry": W("Sorry,"), "villains": W("VILLAINS."), "villains_end": E("VILLAINS."),
    # the button
    "now3": T.ws[i_now3], "slow": W("SLOW"), "snap3": W("snap.", s=i_now3), "snap3_end": E("snap.", s=i_now3),
}
cues["snap1"] = round(cues["fingers_end"] + 0.03, 3)           # SNAP: the finger whips into the palm, the fire flares
cues["set2"] = round(cues["barely"] - 0.05, 3)                 # he sets the fingertip barely on the thumb
cues["fizz"] = round(cues["snap2"] + 0.08, 3)                  # the limp slide: a sad puff
cues["glass_in"] = round(cues["snaps"] - 0.01, 3)              # the hand and forearm turn to glass
cues["string_in"] = round(cues["catapult1"] - 0.02, 3)         # the string to the fingertip, the catapult's arc
cues["meter_in"] = round(cues["never"] - 0.1, 3)               # LOAD: 0
cues["wake"] = round(cues["press"] - 0.04, 3)                  # the puppeteer jolts awake
cues["haul"] = round(cues["hard"] + 0.02, 3)                   # he hauls; the thumb presses hard, the meter climbs
cues["full"] = round(cues["loading_end"] - 0.12, 3)            # FULL
cues["macro_in"] = round(cues["squishy"] - 0.12, 3)
cues["creep1"] = round(cues["grip1"] + 0.02, 3)                # the pads creep a little
cues["creep2"] = round(cues["grip2"] + 0.02, 3)
cues["release"] = round(cues["slip"] + 0.03, 3)                # SLIP: the top pad shoots away
cues["whip"] = round(cues["finger"] + 0.05, 3)                 # slow motion: the finger starts its whip
cues["impact"] = round(cues["palm_end"] + 0.03, 3)             # it hits the base of the thumb: shock rings (in the pause)
cues["tumble"] = round(cues["impact"] + 0.1, 3)                # the puppeteer falls over
cues["burst"] = round(cues["slap"] - 0.02, 3)                  # SNAP!
cues["bar1"] = round(cues["fastest"] - 0.02, 3)                # YOUR SNAP's bar rockets up
cues["bar2"] = round(cues["pitcher"] - 0.25, 3)                # the pitcher throws; his bar rises
cues["x26"] = round(cues["arm"] + 0.02, 3)                     # x2.6
cues["cape"] = round(cues["metal"] - 0.06, 3)                  # the cape and the steel glove
cues["pose"] = round(cues["squish"] - 0.05, 3)                 # the villain's dramatic raise
cues["tink"] = round(cues["squish_end"] + 0.03, 3)             # the steel snap: tink (in the pause), then the flop
cues["slump"] = round(cues["villains"] + 0.05, 3)              # he slumps
cues["slowstart"] = round(cues["slow"] - 0.08, 3)              # the slow snap begins: the finger creeps down the thumb
cues["loop_in"] = T.duration - 0.40
_order = ["fingers", "fingers_end", "snap1", "now1", "set2", "barely", "touching", "touching_end", "snap2", "fizz", "snap2_end",
          "fizzled", "fizzled_end", "glass_in", "snaps", "string_in", "catapult1", "catapult1_end", "meter_in", "never",
          "loaded", "loaded_end", "wake", "press", "hard", "haul", "hard_end", "feel", "straining", "straining_end", "thats",
          "catapult2", "loading", "full", "loading_end", "macro_in", "squishy", "fingertips", "grip1", "creep1", "grip2",
          "creep2", "grip2_end", "slip", "release", "slip_end", "finger", "whip", "slams", "palm", "palm_end", "impact",
          "tumble", "that", "burst", "slap", "is", "snapw", "snapw_end", "bar1", "fastest", "speedup", "ever", "human",
          "human_end", "almost", "triple", "bar2", "pitcher", "arm", "x26", "arm_end", "cape", "metal", "pose", "squish",
          "squish_end", "tink", "so", "flops", "flops_end", "sorry", "villains", "slump", "villains_end", "now3",
          "slowstart", "slow", "snap3", "snap3_end", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
assert set(_order) == set(cues), set(cues) ^ set(_order)
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
