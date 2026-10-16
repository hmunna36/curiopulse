"""Edit timeline for "__TITLE__" (long-form, 1920x1080, 4:00-5:00, never over 5:15).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example (a Short, the same API): skill/cp/reference/examples/make_timeline.finger-wrinkles.py in this repo.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.5)  # seconds after the last word: the button beat (a held look, a last gag, the loop)

# Word-timing repairs (space-without-suit, 16 Oct 2026). v3's alignment can crowd a phrase into the pause before it
# ("The last thing he" sat 0.3 s early, in silence: its captions popped early and qa.py measured the words at -40 dB).
# realign.py re-times the words with whisper (<work>/align.json; build.sh keeps a copy in src/voice/). Whisper drags
# words across long pauses, so a block takes its whisper times only when some of its words sit in silence (< -38 dB)
# and whisper puts fewer there.
import json as _json, os as _os  # noqa: E401
import numpy as _np
_ap = _os.path.join(sys.argv[1], "align.json")
if _os.path.exists(_ap):
    _al = _json.load(open(_ap))
    if len(_al) == len(T.words):
        _lev = lambda a, b: 20 * _np.log10(_np.sqrt((T.audio[int(a * T.sr):max(int(a * T.sr) + 1, int(b * T.sr))] ** 2).mean()) + 1e-9)  # noqa: E731
        _blocks = {}
        for _i, _w in enumerate(T.words):
            _blocks.setdefault(_w.get("block"), []).append(_i)
        for _b, _idx in _blocks.items():
            _sh = T.block(_b)["start"] - _al[_idx[0]].get("b0", T.block(_b)["start"])   # the block moved (a gap changed)
            for _i in _idx:
                _al[_i] = {"start": _al[_i]["start"] + _sh, "end": _al[_i]["end"] + _sh}
            _old = sum(1 for _i in _idx if _lev(T.ws[_i], T.we[_i]) < -38)
            _new = sum(1 for _i in _idx if _lev(_al[_i]["start"], _al[_i]["end"]) < -38)
            if _old > 0 and _new < _old:
                for _i in _idx:
                    T.ws[_i] = T.words[_i]["start"] = _al[_i]["start"]
                    T.we[_i] = T.words[_i]["end"] = _al[_i]["end"]
                print(f"realigned {_b}: {_old} words in silence before, {_new} after")
# v3's alignment can hand a pause to the next word: snap every word's start to its first loud frame.
for _i in range(len(T.words)):
    _fl = T.first_loud(T.ws[_i], span=max(0.02, T.we[_i] - T.ws[_i] + 0.1))
    if _fl - T.ws[_i] > 0.08:
        T.ws[_i] = T.words[_i]["start"] = round(min(_fl, T.we[_i] - 0.04), 3)
# a word the aligner squeezed into a sliver ends at the next word's start (the voice checks measure the whole word)
for _i in range(len(T.words) - 1):
    if T.we[_i] - T.ws[_i] < 0.1:
        T.we[_i] = T.words[_i]["end"] = round(max(T.we[_i], min(T.ws[_i + 1] - 0.01, T.ws[_i] + 0.3)), 3)

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

# v3's alignment can hand a pause to the word after it (tickle-yourself: "Day... two" put the second "Day" 0.9 s
# before its sound). Move every word's start to its first loud frame when that is clearly later.
for i in range(len(T.words)):
    fl = T.first_loud(T.ws[i], span=max(0.02, T.we[i] - T.ws[i] + 0.1))
    if fl - T.ws[i] > 0.08:
        T.ws[i] = T.words[i]["start"] = round(min(fl, T.we[i] - 0.04), 3)

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # "gasp": ev("gasps")["t"], "jumps": W("JUMPS"), "jumps_end": E("JUMPS"), "bam": W("BAM"),
}
# ---- the payoffs (the every-second rule, 15 Oct 2026; reference/long-form.md). Name every payoff of the scene table
# here, on the word or the frame where it lands: "pay_<name>" for the small ones (a reveal, a number landing, the
# viewer's test result: one every 3-5 s) and "big_<name>" for the big ones (a clock jump with its consequence, a scale
# jump, each act's payoff: one every 15-20 s; the biggest in the last minute). audio.py builds a riser into every one
# and lands a hit on it (a held breath of silence and a crash before each big one), and the scenes time their impact
# (flash, squash, camera kick, sparks) to the same cue, so the eye and the ear are paid on the same frame.
# cues["pay_first_number"] = W("SEVENTY")
# cues["big_scale_jump"] = W("CELL")
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s of the video. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.W("subscribe")                       # if the line says "subscribes"/"subscribing", use that word
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word, and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
cues["sub_tap"] = min(T.E("subscribe") + 0.25, T.duration - 0.8)  # the cursor click, just after the word
# if the sub line goes on after "subscribe" ("Subscribe... if you're still awake"), click in that gap instead:
# cues["sub_tap"] = T.E("subscribe") + 0.10   (the click and bell then never sit on the next words)
T.write(shots, caps, cues, width=1920, height=1080)
