"""Edit timeline for the "Why Can't You Say the COLOUR, Not the Word?" Short (colour-word, 5 Nov 2026).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
One world (sky-blue's summit trail) and one sign, the STROOP TRAIL board; the test on it is drawn after the lens.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)

# v3 put two words of the hook and of the answer into the pauses before their sound (qc_inband read them at -38/-44 dB):
# move them onto their bursts of speech-band energy
T.retime("Say the ink", 1.1, 1.7)
T.retime("You can't", 5.55, 6.12)

# (shot id, phrase whose first word opens the shot). All shots are one place, one sign; the cuts are camera cuts.
SHOTS = [
    ("hook", None),                        # frame 0: him at the sign, pole on the top word, mouth open; the test by 3 s
    ("autopilot", "It runs on autopilot"), # the top word splits: its red ink drips out, the letters fly into his mouth
    ("these", "Now these"),                # the sign spins round: squiggles, no words; he rattles them off
    ("kids", "Little kids who"),           # wider: a toddler scoots in and names the inks (coloured dots), ticks
    ("weird", "But kids who"),             # a second-grader with a book reads them out... and trips flat
    ("button", "Now read the"),            # back to the tight shot: he reads the words, shades on; the loop
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration
CHUNKS = [
    "You'll trip.",
    "Say the ink / colour,",
    "not the word.",
    "Go!",
    "Tripped, / right?",
    "You can't / switch",
    "reading OFF.",
    "It runs on / autopilot...",
    "the word just / barges",
    "straight into / your mouth.",
    "Now these.",
    "Easy, right?",
    "No words... / no trip.",
    "Little kids / who can't",
    "read yet?",
    "They breeze / right through.",
    "But kids who",
    "JUST learned / to read?",
    "They trip / the hardest",
    "of all.",
    "Now read / the WORDS",
    "out loud.",
    "Easy, huh?",
    "Show-off.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# no caption word is a colour name, so the captions never answer the test for the viewer
COLOR = {"trip": Y, "ink": Y, "off": R, "autopilot": C, "barges": O, "mouth": O, "easy": G, "words": Y,
         "breeze": C, "just": Y, "hardest": R, "show-off": V, "tripped": Y}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_easy2 = find("Easy, huh")
cues = {
    # the hook: his try in the gap after "Go!", the buzzer
    "go": W("Go"),
    "go_end": E("Go"),
    "blurt": E("Go") + 0.12,               # he says the WORD: "BLUE!"
    "buzz": E("Go") + 0.42,                # BZZT, a red cross
    "tripped": W("Tripped"),
    "switch": W("switch"),
    "off": W("OFF"),
    "off_end": E("OFF"),
    # the autopilot gag
    "auto": W("autopilot"),
    "auto_end": E("autopilot"),
    "word": W("the word just"),
    "barges": W("barges"),
    "straight": W("straight"),
    "mouth": W("mouth"),
    "mouth_end": E("mouth"),
    # round two: squiggles
    "these": W("Now these"),
    "these_end": E("these"),
    "easy": W("Easy, right"),
    "nowords": W("No words"),
    "notrip": W("no trip"),
    "notrip_end": E("no trip", 1),
    # the kids
    "kids": W("Little kids"),
    "cant": W("can't read yet"),
    "breeze": W("breeze"),
    "through": W("through"),
    "through_end": E("through"),
    "but": W("But kids"),
    "just": W("JUST learned"),
    "learned": W("learned"),
    "toread": W("to read", 1),
    "they_trip": W("They trip"),
    "hardest": W("hardest"),
    "ofall": W("of all"),
    "ofall_end": E("of all", 1),
    # the button
    "nowread": W("Now read"),
    "words": W("the WORDS", 1, find("Now read")),
    "outloud": W("out loud"),
    "loud_end": E("out loud", 1),
    "easy2": T.ws[i_easy2],
    "huh_end": T.we[i_easy2 + 1],
    "showoff": W("Show-off"),
    "showoff_end": E("Show-off"),
    "end": T.duration,
}
# his rattle of the squiggles in the gap after "these" (four ticks), the toddler's four dots, the button's four reads
_g0 = cues["these_end"] + 0.18
cues["ticks"] = [round(_g0 + 0.24 * i, 3) for i in range(4)]
cues["dots"] = [round(cues["breeze"] + 0.05 + 0.27 * i, 3) for i in range(4)]
cues["kid_reads"] = [round(cues["learned"] + 0.3 + 0.32 * i, 3) for i in range(3)]
cues["reads"] = [round(cues["words"] + 0.05 + 0.3 * i, 3) for i in range(4)]
assert cues["ticks"][-1] < cues["easy"] - 0.15, cues["ticks"]
assert cues["dots"][-1] < cues["but"] - 0.3, cues["dots"]
assert cues["kid_reads"][-1] < cues["hardest"] - 0.1, cues["kid_reads"]
assert cues["go"] < cues["tripped"] < cues["auto"] < cues["these"] < cues["kids"] < cues["but"] < cues["nowread"] < cues["showoff"]

T.write(shots, caps, cues)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s in shots:
    print(f'  shot {s["id"]:10s} {s["start"]:6.2f} -> {s["end"]:6.2f}')
