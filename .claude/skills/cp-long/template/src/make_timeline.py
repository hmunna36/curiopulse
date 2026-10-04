"""Edit timeline for "__TITLE__" (long-form, 1920x1080, 3 minutes at most).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example (a Short, the same API): skill/cp/reference/examples/make_timeline.finger-wrinkles.py in this repo.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.5)  # seconds after the last word: the button beat (a held look, a last gag, the loop)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),
    ("explain", "REPLACE with the phrase that opens this shot"),
    ("button", "REPLACE"),  # holds through the subscribe line; subscribe.js draws the pill on top of it
]
special = {}  # e.g. {"stare": T.E("JUMPS") + 0.06, "nope": T.ev("chuckles")["t"] - 0.05}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–6 words, "/" splits two lines.
# One idea per chunk; break before the punchline so it lands alone ("raisins", "Nope", "Science").
# A line is capped at 1480 px: ~30 characters stay at full size (74 px); longer lines shrink. One line is the norm.
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
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s of the video. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.W("subscribe")                       # if the line says "subscribes"/"subscribing", use that word
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word, and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
cues["sub_tap"] = min(T.E("subscribe") + 0.25, T.duration - 0.8)  # the cursor click, just after the word
# if the sub line goes on after "subscribe" ("Subscribe... if you're still awake"), click in that gap instead:
# cues["sub_tap"] = T.E("subscribe") + 0.10   (the click and bell then never sit on the next words)
T.write(shots, caps, cues, width=1920, height=1080)
