"""Edit timeline for the Why Does a Doorknob SHOCK You? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Use 1.0 in the 30-35 s arm of the length test.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),            # tight: his finger reaches the brass knob, ZAP on frame ~11; the shot runs on through the
                               # answer, then the camera travels down him to his shoes (first cut on "Every", 8.2 s)
    ("steps", "Every step"),   # macro: his sneaker sliding on the carpet, electrons scraped off the fibres onto the sole
    ("pile", "and they pile"), # him walking to the door, electrons climbing and piling onto him
    ("dry", "In dry"),         # electrons try to leave him and bonk off the dry air
    ("jump", "till your"),     # slow motion: his finger nears the knob, electrons crowd into the fingertip, ALL jump
    ("payoff", "A tiny"),      # the spark up close becomes a bolt of lightning over a storm
    ("weird", "We noticed"),   # 600 BC: he rubs a lump of amber and feathers fly up to it
    ("debate", "and STILL"),   # a chalkboard of arguments today, STILL DEBATED
    ("button", "So technically"),  # the doorknob, frazzled and smoking, the victim; the silent Subscribe pill
    ("loop", None),            # the last 0.4 s: the hook at negative time, so the cut to frame 1 is one move
]
special = {"loop": T.duration - 0.40}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
# One idea per chunk; break before the punchline so it lands alone ("raisins", "Nope", "Science").
# A line is capped at 640 px (x 220-860, the Shorts safe area): ~10 characters stay at full size, 16 drop to ~60 px.
CHUNKS = [
    "You touch / a doorknob", "and get zapped", "by THOUSANDS / of volts!",
    "Relax,", "that spark / came out", "of YOU.",
    "Every step,", "your shoes / scrape", "electrons / off the carpet,", "and they pile / onto you.",
    "In dry air,", "they can't / escape...",
    "till your finger / nears metal,", "and they ALL", "jump.",
    "A tiny bolt / of lightning.",
    "We noticed this", "twenty-six hundred / years ago...", "and STILL / can't fully", "explain it.",
    "So technically...", "the doorknob / is the VICTIM.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"zapped": Y, "thousands": Y, "volts": Y, "you": C, "spark": Y, "electrons": C, "carpet": O,
         "pile": C, "dry": O, "escape": R, "metal": B, "all": Y, "jump": Y, "lightning": Y, "2,600": V,
         "still": R, "victim": R, "doorknob": O}
DISPLAY = {"twenty-six hundred": ["2,600"]}  # spoken words shown as figures: {"seventy percent": ["70%"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    "zap": 0.37,                                   # the spark on frame 11 (the hook's picture and the sound share it)
    "zapped": W("zapped"), "thousands": W("THOUSANDS"), "volts_end": E("volts!"),
    "relax": W("Relax,"), "spark": W("spark"), "you": W("of YOU.", k=1), "you_end": E("of YOU.", k=1),
    "every": W("Every"), "shoes": W("shoes"), "scrape": W("scrape"), "electrons": W("electrons"), "carpet": W("carpet,"),
    "pile": W("pile"), "onto": W("onto"),
    "dry": W("dry"), "escape": W("escape..."), "escape_end": E("escape..."),
    "finger": W("finger"), "nears": W("nears"), "metal": W("metal,"), "all": W("ALL"), "jump": W("jump."), "jump_end": E("jump."),
    "tiny": W("tiny"), "bolt": W("bolt"), "lightning": W("lightning."), "lightning_end": E("lightning."),
    "noticed": W("noticed"), "years": W("years"), "ago_end": E("ago..."),
    "still": W("STILL"), "explain": W("explain"), "it_end": E("it."),
    "so": W("So"), "technically_end": E("technically..."), "victim": W("VICTIM."), "victim_end": E("VICTIM."),
}
# ---- the subscribe cue (web/subscribe.js): SILENT, over the last seconds (since 9 Oct 2026; reference/analytics.md).
# Nobody says "subscribe": wherever the word was spoken, as the last line or mid-video, a quarter to a half of the
# viewers still watching left within three seconds of it. The pill pops in 3.4 s before the end, the cursor clicks
# 1.25 s later, and the pill has popped out 0.6 s before the cut back to frame 1, so the loop stays clean. It plays
# over the button shot while the last line is spoken; captions that share the screen with it sit at y 1150 (main.js).
cues["sub_in"] = T.duration - 3.40
cues["sub_tap"] = cues["sub_in"] + 1.25
cues["sub_out"] = cues["sub_tap"] + 1.30       # + 0.24 s of pop-out: gone 0.61 s before the end
# a chunk that would end a moment inside the pill's window is lifted to y 1150 for its whole life (main.js): it ends
# just before the pill instead, and stays where it is (why-we-cry, 10 Oct 2026)
for _c in caps:
    if _c["start"] < cues["sub_in"] < _c["end"] < cues["sub_in"] + 0.3:
        _c["end"] = round(cues["sub_in"] - 0.08, 3)
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first cut: {shots[1]["start"]:.2f} s (7.0 s or later: the opening is one shot through the answer)' if len(shots) > 1 else 'first cut: none')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print(f'subscribe cue: silent, the pill is up {cues["sub_in"]:.2f}-{cues["sub_out"] + 0.24:.2f} s of {T.duration:.2f} s'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
