"""Edit timeline for the __TITLE__ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Every Short is 30-35 s since 16 Oct 2026: keep it short,
#                                      so the loop comes before the thumb does.

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),       # THE TEST (15 Oct 2026, story.md §2): frame 1 is him doing, close up, the very thing the first
                          # line tells the viewer to try; the strange result by 3 s; the `answer` line starts by 5.0 s.
                          # No frozen face or stare before 12 s, no title card in the first 15 s
    ("explain", "REPLACE with the phrase that opens the first mechanism shot"),  # keep his test (or the viewer's) in view
    ("payoff", "REPLACE"),
    ("button", "REPLACE"),  # ends on the picture of frame 1 (the loop). The pill test (25 Oct-8 Nov 2026): a 23:30
                            # Short gets the silent pill over its last 2.4 s, set by timeline_lib.py; keep the button
                            # line's picture readable under it (pill at y 1354-1486, captions lifted to y 1150)
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
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself (sub_in 2.4 s before the end, the click 0.7 s later, gone 0.6 s
# before the end) and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here. Nobody says
# "subscribe" in either arm; the ask also lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
