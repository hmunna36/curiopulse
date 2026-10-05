"""Edit timeline for the __TITLE__ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.5)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Use 1.0 in the 30-35 s arm of the length test.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),       # the hero doing something physical on frame 1; the strange thing lands by 3 s
    ("answer", "REPLACE with the first words of the `answer` block"),   # starts by 5.0 s (qa.py checks it)
    ("explain", "REPLACE with the phrase that opens this shot"),
    ("payoff", "REPLACE"),  # the subscribe aside follows it: subscribe.js draws the pill over whatever shot is on then,
                            # so keep that shot's hero and key action above y ≈ 1050 for those 3 s
    ("button", "REPLACE"),  # ends on the picture of frame 1 (the loop); no ask and no tease here
]
special = {}  # e.g. {"stare": T.E("JUMPS") + 0.06, "nope": T.ev("chuckles")["t"] - 0.05}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
# One idea per chunk; break before the punchline so it lands alone ("raisins", "Nope", "Science").
# A line is capped at 640 px (x 220-860, the Shorts safe area): ~10 characters stay at full size, 16 drop to ~60 px.
CHUNKS = [
    "REPLACE with the narration / in chunks",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {}
DISPLAY = {}  # spoken words shown as figures: {"seventy percent": ["70%"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # "gasp": ev("gasps")["t"], "jumps": W("JUMPS"), "jumps_end": E("JUMPS"), "bam": W("BAM"),
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff
# (reference/narration.md). The word "subscribe" must land at 50-70 % of the runtime; qa.py checks it. The pill pops
# ~0.3 s before the word, the cursor clicks in the pause just after it, and the pill pops out 1.3 s after the click:
# about 2.6 s on screen. Captions that share the screen with it sit at y 1150 (main.js); the narration carries on.
_sub_i = T.find("subscribe")                  # if the line says "subscribes"/"subscribing", use that word
cues["sub_in"] = max(0.0, T.ws[_sub_i] - 0.30)
cues["sub_tap"] = T.we[_sub_i] + 0.10         # in the "..." after the word, so the click never sits on a word
cues["sub_out"] = cues["sub_tap"] + 1.30
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[_sub_i]:.2f} s = {100 * T.ws[_sub_i] / T.duration:.0f} % of the runtime (must be 50-70 %)')
