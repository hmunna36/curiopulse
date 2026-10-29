"""Edit timeline for the Why Won't Your TOES Move One at a Time? 🦶 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py; the world is new (web/toes.js: the hero
on a lake dock at sunset, his bare foot as a 3D rig in centimetres), the brain's desk is pins-needles' brainy.js.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.1)  # the button beat (his big toe up, the grin) and the cut back to frame 1 for the loop

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),                   # THE TEST: low on the dock at sunset, his bare right foot big in front, his chin on his knee,
                                      # arms round his shin; frame 1: the big toe is already lifting. "Easy.": a smug ding. "Now lift
                                      # JUST the next one": he strains, the big toe goes down, and on "next" the four small toes pop up
                                      # TOGETHER (the strange thing). "The whole gang came": the four open little eyes; "They share ONE
                                      # string": a string drops from the sky and ties the four; on "ONE" it yanks them up again
    ("glass", "Your big toe has"),    # closer: the shin and foot turn to glass from the knee down; the big toe's own muscle (orange)
                                      # in the front of the shin and its string to the big toe: it squeezes, the big toe lifts alone.
                                      # "The other four?": they look up; "ONE muscle": the cyan muscle lights; "four strings": its
                                      # string splits into four at the ankle; it squeezes, all four rise as one
    ("curl", "Now curl"),             # the camera swings round to the side: the toes curl down; "Same deal underneath": the violet
                                      # muscle in the calf, one string that splits into four under the sole; "Cramp? Stop." tag
    ("brain", "Your brain's"),        # the brain at its desk: a panel YOUR FINGERS with five keys, YOUR TOES with a big toe key and
                                      # ONE wide key for the other four; it slaps the wide key (the four on the wall screen jump);
                                      # "scans": a scan card with five tidy finger patches and one smudge for the toes; it shrugs
    ("paint", "But two"),             # a foot in a studio paints with a brush held by the toes (a sunset on a canvas)
    ("every", "had one for"),         # back to the panel: the wide key cracks into four keys that light one by one (EVERY); the
                                      # brain's jaw drops; FOOT ARTISTS tag
    ("button", "So..."),              # the dock again, the hook's framing: "practise": he scrunches his face, the toes tremble; "Big
                                      # toe first": the big toe lifts (frame 1's move). The pill (23:30 arm) over the last 2.4 s: his
                                      # face and foot stay above y 1050
    ("loop", None),                   # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Lift your / big toe.", "Easy.",
    "Now lift / JUST", "the next one.",
    "The whole / gang came,", "right?", "They share / ONE string.",
    "Your big toe", "has its / own muscle.",
    "The other four?", "ONE muscle...", "four strings.",
    "Now curl them.", "Same deal / underneath.",
    "Your brain's / no help:", "scans found", "no neat spot", "for each toe.",
    "But two", "foot-painting / artists,", "born without / arms,", "had one for / EVERY toe.",
    "So...", "practise.", "Big toe / first.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white.
# The big toe and its muscle are orange, the four small toes and their shared muscle cyan, the curling strings violet
# (the picture uses the same colours).
COLOR = {"big": O, "easy": G, "just": Y, "next": C, "gang": C, "string": Y, "own": O, "four": C, "strings": C,
         "curl": V, "underneath": V, "brain's": PK, "scans": PK, "neat": R, "foot-painting": Y, "artists": Y,
         "every": G, "practise": G, "first": O}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_each = find("for each toe")
i_every = find("EVERY toe")
cues = {
    # the hook
    "lift": W("Lift"), "big": W("big"), "toe_end": E("big toe", 1), "easy": W("Easy."), "easy_end": E("Easy."),
    "now": W("Now"), "lift2": W("lift JUST"), "just": W("JUST"), "next": W("next"), "one_end": E("next one", 1),
    # the answer
    "whole": W("whole"), "gang": W("gang"), "came": W("came,"), "right": W("right?"), "right_end": E("right?"),
    "they": W("They"), "share": W("share"), "one": W("ONE string"), "string": W("ONE string", 1),
    "string_end": E("ONE string", 1),
    # the glass: the big toe's own muscle
    "yourbig": W("Your big toe has"), "own": W("own"), "muscle1": W("own muscle", 1), "muscle1_end": E("own muscle", 1),
    # the other four: one muscle, four strings
    "other": W("other"), "four": W("other four", 1), "four_end": E("other four", 1), "one2": W("ONE muscle"),
    "muscle2": W("ONE muscle", 1), "muscle2_end": E("ONE muscle", 1), "four2": W("four strings"),
    "strings": W("four strings", 1), "strings_end": E("four strings", 1),
    # curl
    "curl": W("curl"), "curl_end": E("curl them", 1), "same": W("Same"), "deal": W("deal"), "under": W("underneath."),
    "under_end": E("underneath."),
    # the brain
    "brains": W("brain's"), "help": W("help:"), "help_end": E("help:"), "scans": W("scans"), "neat": W("neat"),
    "spot": W("spot"), "each": W("each", s=i_each), "each_end": E("each toe", 1),
    # the artists
    "but": W("But"), "foot": W("foot-painting"), "artists": W("artists,"), "born": W("born"), "arms": W("arms,"),
    "arms_end": E("arms,"), "had": W("had"), "every": W("EVERY", s=i_every), "every_end": E("EVERY toe", 1),
    # the button
    "so": W("So..."), "so_end": E("So..."), "practise": W("practise."), "practise_end": E("practise."),
    "big3": W("Big toe first"), "first": W("first."), "first_end": E("first."),
}
# the gags and moves, in the gaps after their words (sound.md: the sound just after the word, never on it)
cues["ding"] = round(cues["easy_end"] + 0.04, 3)              # a smug ding and a sparkle on the raised big toe
cues["bigdown"] = round(cues["now"] - 0.06, 3)                # the big toe goes back down
cues["strain"] = round(cues["just"] - 0.02, 3)                # he strains: the second toe trembles, a sweat drop
cues["gangup"] = round(cues["next"] + 0.06, 3)                # THE STRANGE THING: all four small toes pop up together
cues["eyes"] = round(cues["whole"] - 0.02, 3)                 # the four open little eyes
cues["drop"] = round(cues["they"] - 0.04, 3)                  # a string drops from the sky to the four
cues["yank"] = round(cues["one"] + 0.02, 3)                   # it yanks them up together
cues["twang"] = round(cues["string_end"] + 0.04, 3)           # the string twangs in the gap
cues["glass_in"] = round(cues["yourbig"] - 0.04, 3)           # the leg turns to glass from the knee down
cues["bigpull"] = round(cues["own"] + 0.02, 3)                # the orange muscle squeezes: the big toe lifts alone
cues["jiggle"] = round(cues["other"] + 0.02, 3)               # the four look up at the camera
cues["cyan_on"] = round(cues["one2"] - 0.04, 3)               # the cyan muscle lights
cues["split"] = round(cues["four2"] - 0.04, 3)                # its string splits into four at the ankle
cues["fourpull"] = round(cues["strings_end"] + 0.04, 3)       # it squeezes: all four rise as one (thunk)
cues["curl_go"] = round(cues["curl"] + 0.04, 3)               # the toes curl down
cues["violet_on"] = round(cues["same"] - 0.04, 3)             # the violet muscle and its strings under the sole
cues["curl2"] = round(cues["under_end"] + 0.04, 3)            # it squeezes: the four curl as one again
cues["slap"] = round(cues["help"] + 0.02, 3)                  # the brain slaps the ONE wide key: the four jump on the wall screen
cues["card"] = round(cues["scans"] - 0.04, 3)                 # the scan card pops up
cues["smudge"] = round(cues["neat"] + 0.02, 3)                # the toes' patch smears into one smudge
cues["shrug"] = round(cues["each_end"] + 0.04, 3)             # the brain shrugs
cues["stroke1"] = round(cues["foot"] + 0.05, 3)               # brush strokes
cues["stroke2"] = round(cues["artists"] + 0.20, 3)
cues["stroke3"] = round(cues["arms"] + 0.10, 3)
cues["crack"] = round(cues["had"] + 0.02, 3)                  # the wide key cracks into four
cues["keys"] = [round(cues["every"] - 0.05 + 0.13 * i, 3) for i in range(4)]   # the four keys light one by one
cues["jaw"] = round(cues["every_end"] + 0.05, 3)              # the brain's jaw drops
cues["scrunch"] = round(cues["so"] - 0.04, 3)                 # he scrunches his face
cues["tremble"] = round(cues["practise"] + 0.04, 3)                 # the toes tremble
cues["big3up"] = round(cues["big3"] + 0.02, 3)                # the big toe lifts: frame 1's move
cues["grin"] = round(cues["first_end"] + 0.06, 3)             # his grin at the end
cues["loop_in"] = T.duration - 0.40
_order = ["lift", "big", "toe_end", "easy", "easy_end", "ding", "bigdown", "now", "lift2", "strain", "just", "next", "gangup",
          "one_end", "eyes", "whole", "gang", "came", "right", "right_end", "drop", "they", "share", "one", "yank", "string",
          "string_end", "twang", "glass_in", "yourbig", "own", "bigpull", "muscle1", "muscle1_end", "other", "jiggle", "four",
          "four_end", "cyan_on", "one2", "muscle2", "muscle2_end", "split", "four2", "strings", "strings_end", "fourpull",
          "curl", "curl_go", "curl_end", "violet_on", "same", "deal", "under", "under_end", "curl2", "brains", "help", "slap",
          "help_end", "card", "scans", "neat", "smudge", "spot", "each", "each_end", "shrug", "but", "foot", "stroke1",
          "artists", "stroke2", "born", "arms", "stroke3", "arms_end", "had", "crack", "every", "every_end", "jaw", "scrunch",
          "so", "so_end", "practise", "tremble", "practise_end", "big3", "big3up", "first", "first_end", "grin", "loop_in"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
assert cues["grin"] < cues["loop_in"] - 0.2, "the grin needs the tail before the loop"
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): this Short is a 23:30 one, the pill arm. T.write sets the
# pill's cues by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s before the end). Never set
# cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says "subscribe".
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
print("cues: " + ", ".join(f"{k}={v:.2f}" if isinstance(v, float) else f"{k}={v}" for k, v in cues.items()))
