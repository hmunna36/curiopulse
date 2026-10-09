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
    ("hook", None),       # ONE continuous shot: the hero doing something physical on frame 1, the strange thing by 3 s,
                          # and the `answer` line (it starts by 5.0 s) spoken over the same shot as it runs on. No cut
                          # before 7 s (qa.py warns): no frozen face, no stare, no title card here (story.md §2)
    ("explain", "REPLACE with the phrase that opens the first mechanism shot (7 s or later)"),
    ("payoff", "REPLACE"),
    ("button", "REPLACE"),  # ends on the picture of frame 1 (the loop). The silent Subscribe pill plays over its last
                            # 3.4 s (subscribe.js): keep the hero and the key action above y ≈ 1050 there
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
