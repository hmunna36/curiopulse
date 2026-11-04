"""Edit timeline for the Why Does a Word Go WEIRD When You Repeat It? 🥄 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the name tag wobbles, then the cut back to frame 1

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),               # THE TEST: tight on him at the campfire at night, a spoon held up like a microphone, chanting
                                  # "spoon" (a bubble pops from his mouth on every rep); the word SPOON hangs over him and his
                                  # thought bubble holds the meaning: a little spoon with a face. "break": a crack runs through
                                  # the word. "Say SPOON": the word thumps; the REPS counter starts. "MEANING walks out": the
                                  # little spoon packs a suitcase and walks out of his bubble; the word's letters drift apart
    ("bell", "Each spoon"),       # a round window on his forehead (his mouth still chanting below it): inside, the meaning's
                                  # little house; every "spoon" flies in and hits the doorbell (DING) and the spoon opens the door
    ("nobody", "Thirty rings"),   # closer on the door: 28, 29, 30, frantic rings, the door barely opens (nightcap), then stays
                                  # shut: NOBODY HOME swings down, the porch light goes out, a cricket
    ("wire", "Lab results"),      # inside his head, the whole circuit: the SOUND doorbell on the left, the MEANING house on the
                                  # right, one long wire between them; a LAB RESULTS card ticks SOUND ✓, MEANING ✓, then the
                                  # camera runs down the wire to the middle: frayed, sparking, WORN OUT ✗
    ("page", "Scientists had"),   # close on his exam page: COPY: DOOR, his pencil writing "door door door"
    ("door", "students copy"),    # the exam hall: the board says COPY THIS WORD: DOOR; everyone writing; 94 STUDENTS · MEMORY
                                  # 2021 · IG NOBEL 2023; "Seven in ten quit": seven classmates drop their pencils (a "?" over
                                  # each); "WRONG": he holds up his page (the last lines bend), then the hall's real door wobbles
                                  # like jelly
    ("button", "Now try it"),     # back at the campfire, as on frame 1: the word over him turns into YOUR NAME and starts to
                                  # wobble; the meaning walks back in with its suitcase
    ("loop", None),               # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

CHUNKS = [
    "You can / break a word.", "Say SPOON.", "Fast.", "Keep going.", "The sound / stays...", "but the / MEANING",
    "walks out.", "Each spoon / rings", "your brain's / doorbell...", "and the / meaning", "answers.",
    "Thirty / rings in?", "Nobody's / home.", "Lab results:", "sound,", "fine.", "Meaning,", "fine.",
    "The WIRE / between them...", "worn out.", "Scientists had", "students / copy DOOR", "over and / over.",
    "Seven / in ten", "quit...", "it looked / WRONG.", "Now try it", "with your / NAME.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
COLOR = {"break": R, "spoon": Y, "fast": O, "keep": G, "going": G, "sound": C, "meaning": V, "walks": V, "out": V,
         "doorbell": Y, "rings": Y, "answers": V, "30": Y, "nobody's": R, "home": R, "fine": G, "wire": O,
         "worn": R, "door": Y, "7": R, "10": R, "quit": R, "wrong": R, "name": Y}
DISPLAY = {"thirty": ["30"], "seven in ten": ["7", "IN", "10"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_spoon = find("Say SPOON")
i_each = find("Each spoon")
i_mean2 = find("and the meaning answers")
i_fine = find("sound, fine.")
i_mfine = find("Meaning, fine.")
i_now = find("Now try it")
cues = {
    # the hook
    "break": W("break"), "word": W("word."), "word_end": E("word."), "say": W("Say"), "spoonw": T.ws[i_spoon + 1],
    "spoonw_end": T.we[i_spoon + 1], "fast": W("Fast."), "fast_end": E("Fast."),
    # the answer
    "keep": W("Keep"), "keep_end": E("going."), "sound": W("sound stays"), "stays": W("stays..."), "stays_end": E("stays..."),
    "meaning": W("MEANING"), "walks": W("walks"), "out": E("walks out", 1), "walks_end": E("walks out", 1),
    # the bell
    "each": T.ws[i_each], "rings": W("rings your"), "brains": W("brain's"), "doorbell": W("doorbell..."),
    "doorbell_end": E("doorbell..."), "meaning2": T.ws[i_mean2 + 2], "answers": W("answers."), "answers_end": E("answers."),
    # nobody home
    "thirty": W("Thirty"), "in": W("in?"), "in_end": E("in?"), "nobody": W("Nobody's"), "home": W("home."), "home_end": E("home."),
    # the wire
    "lab": W("Lab"), "results_end": E("results:"), "soundw": T.ws[i_fine], "fine1": T.ws[i_fine + 1], "fine1_end": T.we[i_fine + 1],
    "meaning3": T.ws[i_mfine], "fine2": T.ws[i_mfine + 1], "fine2_end": T.we[i_mfine + 1], "wire": W("WIRE"),
    "between": W("between"), "them_end": E("them..."), "worn": W("worn"), "worn_end": E("worn out", 1),
    # the study
    "scientists": W("Scientists"), "students": W("students"), "copy": W("copy"), "doorw": W("DOOR"), "over": W("over and over"),
    "over_end": E("over and over", 2), "seven": W("Seven"), "ten": W("ten"), "quit": W("quit..."), "quit_end": E("quit..."),
    "looked": W("looked"), "wrong": W("WRONG."), "wrong_end": E("WRONG."),
    # the button
    "now": T.ws[i_now], "with": W("with your"), "name": W("NAME."), "name_end": E("NAME."),
}
# the chant: one "spoon" every DT s, the counted ones from "Say SPOON" (rep 1) to "Thirty" (rep 30); before that he is
# already chanting on frame 1 (uncounted reps), after it the frantic last rings, and nothing from "Nobody's" on
DT = (cues["thirty"] - cues["spoonw"]) / 29
reps = [round(cues["spoonw"] - k * DT, 3) for k in range(6, 0, -1) if cues["spoonw"] - k * DT > -0.2]
pre = len(reps)
reps += [round(cues["spoonw"] + k * DT, 3) for k in range(30)]
fr = [round(cues["thirty"] + DT * (0.62 ** k + sum(0.62 ** j for j in range(k))) * 0.55, 3) for k in range(1, 5)]
reps += [r for r in fr if r < cues["nobody"] - 0.25]
cues["reps"] = reps
cues["rep_first"] = round(cues["spoonw"] - 0.001, 3)                # rep 1: the counter appears
cues["counted0"] = pre                                              # index of rep 1 in the list
cues["crack"] = round(cues["break"] + 0.05, 3)                      # a crack runs through the word SPOON
cues["thump"] = round(cues["spoonw"] - 0.02, 3)                     # the word thumps on "SPOON."
cues["drift"] = round(cues["keep"] - 0.05, 3)                       # the letters start to drift
cues["pack"] = round(cues["meaning"] - 0.06, 3)                     # the little spoon stands up with its suitcase
cues["leave"] = round(cues["walks"] - 0.02, 3)                      # and walks out of the bubble
cues["gone"] = round(cues["walks_end"] + 0.12, 3)                   # the bubble pops (in the gap)
cues["window"] = round(cues["each"] - 0.06, 3)                      # the window opens on his forehead
cues["yes"] = round(cues["answers_end"] + 0.03, 3)                  # the door: "WHAT?" (in the gap)
cues["frantic"] = round(cues["in_end"] + 0.02, 3)                   # DING DING DING (in the gap)
cues["shut"] = round(cues["nobody"] - 0.05, 3)                      # nobody comes: the sign swings down
cues["cricket"] = round(cues["home_end"] + 0.06, 3)                 # a cricket (in the gap)
cues["card"] = round(cues["lab"] - 0.04, 3)                         # the LAB RESULTS card
cues["tick1"] = round(cues["fine1"] + 0.02, 3)                      # SOUND ✓
cues["tick2"] = round(cues["fine2"] + 0.02, 3)                      # MEANING ✓
cues["fray"] = round(cues["wire"] - 0.08, 3)                        # down the wire to the frayed middle
cues["cross"] = round(cues["worn"] + 0.02, 3)                       # WORN OUT ✗, the spark
cues["fizzle"] = round(cues["worn_end"] + 0.05, 3)                  # a fizzle and a puff (in the gap)
cues["pull"] = round(cues["students"] - 0.08, 3)                    # the camera pulls back from his page to the hall
cues["tag"] = round(cues["over"] - 0.1, 3)                          # 94 STUDENTS · MEMORY 2021 · IG NOBEL 2023
cues["drop"] = round(cues["quit"] - 0.05, 3)                        # the pencils drop
cues["seven_tag"] = round(cues["seven"] - 0.04, 3)                  # 7 IN 10
cues["holdup"] = round(cues["looked"] - 0.15, 3)                    # he holds his page up: the word is bent
cues["jelly"] = round(cues["wrong_end"] + 0.06, 3)                  # the hall's door wobbles like jelly (in the gap)
cues["tagname"] = round(cues["with"] - 0.05, 3)                     # SPOON turns into YOUR NAME
cues["wobble"] = round(cues["name"] + 0.05, 3)                      # YOUR NAME starts to wobble
cues["back"] = round(cues["name_end"] + 0.1, 3)                     # the meaning walks back in (the tail)
cues["loop_in"] = round(T.duration - 0.40, 3)
_order = ["break", "crack", "word", "word_end", "say", "thump", "rep_first", "spoonw", "spoonw_end", "fast", "fast_end",
          "drift", "keep", "keep_end", "sound", "stays", "stays_end", "pack", "meaning", "leave", "walks", "out", "gone",
          "window", "each", "rings", "brains", "doorbell", "doorbell_end", "meaning2", "answers", "answers_end", "yes",
          "thirty", "in", "in_end", "frantic", "shut", "nobody", "home", "home_end", "cricket", "card", "lab", "results_end",
          "soundw", "fine1", "tick1", "fine1_end", "meaning3", "fine2", "tick2", "fine2_end", "fray", "wire", "between",
          "them_end", "worn", "cross", "worn_end", "fizzle", "scientists", "pull", "students", "copy", "doorw", "tag",
          "over", "over_end", "seven_tag", "seven", "ten", "drop", "quit", "quit_end", "holdup", "looked", "wrong",
          "wrong_end", "jelly", "now", "tagname", "with", "name", "wobble", "name_end", "back", "loop_in"]
_skip = {"walks_end"}
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
assert set(_order) | _skip | {"reps", "counted0"} == set(cues), set(cues) ^ (set(_order) | _skip | {"reps", "counted0"})
assert reps == sorted(reps), "reps out of order"
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
print(f'reps: {len(reps)} (rep 1 = index {pre} at {reps[pre]:.2f}, rep 30 at {reps[pre + 29]:.2f}, last at {reps[-1]:.2f}), DT {DT:.3f}')
print("cues: " + ", ".join(f"{k}={v:.2f}" for k, v in cues.items() if k not in ("reps", "counted0")))
