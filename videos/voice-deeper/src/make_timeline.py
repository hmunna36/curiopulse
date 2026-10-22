"""Edit timeline for the Why Does Your Voice Sound DEEPER With Fingers in Your Ears? 👂 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # the button's held beat, then the cut back to frame 1 for the loop

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                      # his desk at night, seen from his monitor: both index fingers in his ears, talking;
                                         # the narrator's "Hellooo?" comes out deep, rings throb INSIDE his head; "Deep, right?"
    ("skull", "That's your skull"),      # his head turns to glass where he sits: the skull, its jaw singing, fat bass notes
    ("hum", "Every word you say"),       # the voice box sets the skull humming (bone)
    ("leak", "Normally that low hum"),   # fingers out: the low hum leaks out of both ear holes
    ("plug", None),                      # fingers back in (plup), the rings bounce back; a window opens on his ear
    ("canal", "It's trapped"),           # the ear canal in section: a fingertip plugs it, the hum piles up and booms on the drum
    ("buds", "Same reason"),             # a video call with earbuds in: his own voice booms
    ("rumble", "Now press harder"),      # fingers in again, pressing: a faint rumble; his arms' muscles buzz, 25 a second
    ("button", "You're basically"),      # the walking subwoofer
    ("loop", None),                      # the last 0.4 s: frame 1 coming round again (the hook at negative time)
]
special = {"loop": None, "plug": T.W("Fingers in", s=T.find("leaks")) - 0.07}
_dur = T.duration
special["loop"] = round(_dur - 0.40, 3)

CHUNKS = [
    "Stick your fingers / in your ears...",
    "and talk.",
    "Hellooo?",
    "Deep, right?",
    "That's your skull...",
    "singing bass.",
    "Every word you say",
    "makes your bones hum.",
    "Normally, / that low hum",
    "leaks out / your ears.",
    "Fingers in?",
    "It's trapped...",
    "so it booms",
    "right into",
    "your eardrum.",
    "Same reason / your voice",
    "sounds boomy",
    "with earbuds in.",
    "Now press harder.",
    "That faint rumble?",
    "Your own muscles...",
    "buzzing",
    "twenty-five times / a second.",
    "You're basically",
    "a walking / subwoofer.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {
    "fingers": Y, "ears": Y, "hellooo": V, "deep": V, "skull": O, "bass": V, "bones": O, "hum": O, "leaks": C,
    "trapped": R, "booms": V, "eardrum": Y, "boomy": V, "earbuds": C, "harder": Y, "rumble": V, "muscles": R,
    "25": Y, "subwoofer": V,
}
DISPLAY = {"twenty-five times": ["25", "TIMES"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
SH = {s["id"]: s["start"] for s in shots}
cues = {
    # the hook
    "talk": W("talk"), "talk_end": E("talk"),
    "hello": W("Hellooo"), "hello_end": E("Hellooo"),
    "deep": W("Deep"), "right": W("right"), "right_end": E("right"),
    # the glass head
    "skull": W("skull"), "skull_end": E("skull"), "singing": W("singing"), "bass": W("bass"), "bass_end": E("bass"),
    "every": W("Every"), "bones": W("bones"), "hum1": W("hum"), "hum1_end": E("hum"),
    "normally": W("Normally"), "low": W("low"), "leaks": W("leaks"), "out": W("out"), "ears2": W("ears", s=find("leaks")), "ears2_end": E("ears", s=find("leaks")),
    # the plug and the canal
    "fingers2": W("Fingers in", s=find("leaks")), "in2": W("in", s=find("Fingers in", find("leaks"))), "in2_end": E("in", s=find("Fingers in", find("leaks"))),
    "its": W("It's trapped"), "trapped": W("trapped"), "trapped_end": E("trapped"),
    "so": W("so it booms"), "booms": W("booms"), "booms_end": E("booms"), "right2": W("right into"), "into": W("into"),
    "eardrum": W("eardrum"), "eardrum_end": E("eardrum"),
    # earbuds
    "same": W("Same reason"), "voice": W("voice sounds"), "boomy": W("boomy"), "boomy_end": E("boomy"), "earbuds": W("earbuds"), "earbuds_end": E("earbuds in"),
    # the rumble
    "press": W("press"), "harder": W("harder"), "harder_end": E("harder"),
    "faint": W("faint"), "rumble": W("rumble"), "rumble_end": E("rumble"),
    "own": W("own"), "muscles": W("muscles"), "muscles_end": E("muscles"),
    "buzzing": W("buzzing"), "twentyfive": W("twenty-five"), "times": W("times"), "second": W("second"), "second_end": E("second"),
    # the button
    "youre": W("You're basically"), "basically": W("basically"), "walking": W("walking"), "subwoofer": W("subwoofer"), "subwoofer_end": E("subwoofer"),
    "loop": SH["loop"], "end": T.duration,
}
_order = ["talk", "hello", "deep", "skull", "bass", "every", "bones", "normally", "leaks", "ears2", "fingers2", "in2", "its", "trapped",
          "booms", "eardrum", "same", "boomy", "earbuds", "press", "harder", "rumble", "muscles", "twentyfive", "second", "youre", "subwoofer", "loop"]
assert all(cues[a] < cues[b] for a, b in zip(_order, _order[1:])), "cues out of order"
# the beats every shot and the mix share (scenes.js and audio.py read only these)
cues["plugout"] = cues["normally"] - 0.05          # the fingers come out on "Normally"
cues["plugin"] = cues["in2"] - 0.02                # ... and go back in on "in?" (a low plup)
cues["window"] = cues["in2_end"] - 0.02            # a round window opens on his ear
cues["dive"] = SH["canal"]                          # through it into the canal
cues["boom"] = cues["booms"] + 0.06                 # the drum takes it
cues["thump"] = [round(cues["subwoofer_end"] + 0.05 + 0.24 * i, 3) for i in range(3) if cues["subwoofer_end"] + 0.05 + 0.24 * i < cues["loop"] - 0.03]
T.write(shots, caps, cues)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: no pill, nothing said (the Short loops)'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots: ' + '  '.join(f'{s["id"]} {s["start"]:.2f}' for s in shots))
