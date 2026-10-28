"""Edit timeline for the Why Does an Octopus Have THREE Hearts? 🐙 Short (a CURIOUS Short, story.md §6).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # after "cardio.": the hiker swims back in and lifts the stethoscope (frame 1)

SHOTS = [
    ("hook", None),             # the reef, tight: he holds a stethoscope to the octopus; on THREE it counts three arms
    ("xray", "Two of them"),    # the octopus turns to glass where it sits: two little gill hearts, then the squeeze
    ("third", "So heart number"),   # the big heart's punch: blue blood blasts out to all eight arms
    ("you", "You do this"),     # his own chest: two pumps, taped together, the octopus pokes it
    ("swim", "But when an"),    # the octopus jets off; its big heart goes flat on his dive slate, then thumps back
    ("walk", "So it would"),    # it tiptoes away on two arms, the rest wrapped up like a coconut
    ("button", "Three hearts"), # lounging by a barnacled treadmill; he swims back in and the stethoscope goes on (frame 1)
]
special = {}

CHUNKS = [
    "You have / one heart", "An octopus / has", "THREE",
    "Two of them", "are just / for its gills",
    "Its blue blood", "squeezes / through the gills", "and comes out", "all floppy",
    "So heart / number three", "pumps it all / over again",
    "You do / this too", "Your heart's / just two pumps", "glued / together",
    "But when / an octopus", "swims", "its big heart", "STOPS", "For a moment",
    "So it would / rather walk",
    "Three hearts", "and it still", "skips cardio",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {
    "one": Y, "heart": R, "octopus": O, "three": Y, "two": Y, "gills": C, "blue": B, "blood": B, "squeezes": C,
    "floppy": V, "number": Y, "pumps": R, "again": Y, "too": Y, "heart's": R, "glued": G, "together": G,
    "swims": C, "big": R, "stops": R, "moment": G, "walk": G, "hearts": R, "skips": Y, "cardio": Y,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_gl2 = find("through the gills")
i_num = find("heart number three")
i_two = find("two pumps")
i_big = find("big heart")
i_and = find("and it still")
cues = {
    # hook
    "you0": W("You have"), "one": W("one heart"), "heart1": W("heart", 0, find("one heart")), "heart1_end": E("one heart", 1),
    "octo": W("octopus"), "has": W("has"), "three": W("THREE"), "three_end": E("THREE"),
    # xray
    "two": W("Two of"), "them": W("them"), "just": W("just for"), "gills1": W("gills"), "gills1_end": E("gills"),
    "its": W("Its blue"), "blue": W("blue"), "blood": W("blood"), "squeezes": W("squeezes"),
    "gills2": W("gills", 0, i_gl2), "gills2_end": E("gills", 0, i_gl2), "comes": W("comes"), "out": W("out all"),
    "floppy": W("floppy"), "floppy_end": E("floppy"),
    # third
    "so3": W("So heart"), "number": W("number", 0, i_num), "three2": W("three", 0, i_num), "pumps": W("pumps it"),
    "over": W("over again"), "again": W("again"), "again_end": E("again"),
    # you
    "you2": W("You do"), "too": W("too"), "too_end": E("too"), "yours": W("Your heart's"), "two2": W("two", 0, i_two),
    "pumps2": W("pumps", 0, i_two), "pumps2_end": E("pumps", 0, i_two), "glued": W("glued"), "together": W("together"),
    "together_end": E("together"),
    # swim
    "but": W("But when"), "octo2": W("octopus swims", 0), "swims": W("swims"), "swims_end": E("swims"),
    "big": W("big", 0, i_big), "heart_s": W("heart", 0, i_big), "stops": W("STOPS"), "stops_end": E("STOPS"),
    "for": W("For a"), "moment": W("moment"), "moment_end": E("moment"),
    # walk
    "so_w": W("So it would"), "rather": W("rather"), "walk": W("walk"), "walk_end": E("walk"),
    # button
    "three3": W("Three hearts"), "hearts3": W("hearts", 0, find("Three hearts")), "hearts3_end": E("Three hearts", 1),
    "and_b": W("and", 0, i_and), "still": W("still"), "skips": W("skips"), "cardio": W("cardio"), "cardio_end": E("cardio"),
}
D = T.duration
assert cues["gills2"] > cues["squeezes"] and cues["heart_s"] < cues["stops"] and cues["pumps2"] < cues["glued"] and cues["hearts3"] < cues["and_b"]
assert cues["octo2"] > cues["but"] and cues["three2"] > cues["so3"] and cues["pumps2"] > cues["two2"], cues
# the octopus's heartbeat: one "ba-dum" every 0.86 s on a clock that divides the runtime (the loop holds), paused while
# its big heart stops (from just after STOPS to "moment"); the gill hearts beat 0.12 s before the big one
period = D / round(D / 0.86)
beats = [round(i * period, 3) for i in range(int(D / period) + 1) if i * period < D - 0.05]
pause0, pause1 = cues["stops"] - 0.05, cues["moment"] + 0.10
cues["beats"] = [b for b in beats if not (pause0 <= b < pause1)]
cues["beat_period"] = round(period, 4)
cues["restart"] = round(cues["moment"] + 0.12, 3)      # the big heart thumps back in
cues["pause0"] = round(pause0, 3)
cues["loop_in"] = round(D - 0.55, 3)
cues["tape"] = round(cues["pumps2_end"] + 0.04, 3)                # the tape slaps on in the pause before "glued"                    # the button shot settles back into frame 1
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ', '.join(f'{s["id"]} {s["start"]:.2f}' for s in shots))
