"""Edit timeline for the Why Can't Your Tongue Touch Your NOSE? 👅 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Every Short is 30-35 s since 16 Oct 2026: keep it short,
#                                      so the loop comes before the thumb does.

# v3's alignment of "It's tied down, front and back." ran up to 0.6 s EARLY (words.json: It's 9.13, back 10.57; the
# speech-band envelope and whisper: It's ~9.32, back ~11.1). Re-time those six words from the take itself: the
# bursts of speech-band energy after "underneath?", one per word (a run above -32 dB, gaps under 60 ms merged).
def _bursts(t0, t1, thr=-34.0, hop=0.01, gap=0.02, min_len=0.03):
    import numpy as np
    from scipy.signal import butter, sosfilt
    x = T.audio.mean(1) if T.audio.ndim > 1 else T.audio
    y = sosfilt(butter(4, [300, 4000], btype="band", fs=T.sr, output="sos"), x)
    runs, cur = [], None
    t = t0
    while t < t1:
        seg = y[int(t * T.sr):int((t + hop) * T.sr)]
        loud = len(seg) and 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-12) > thr
        if loud:
            cur = [t, t + hop] if cur is None else [cur[0], t + hop]
        elif cur is not None:
            runs.append(cur); cur = None
        t += hop
    if cur is not None:
        runs.append(cur)
    merged = []
    for r in runs:
        if merged and r[0] - merged[-1][1] < gap:
            merged[-1][1] = r[1]
        else:
            merged.append(list(r))
    return [r for r in merged if r[1] - r[0] >= min_len]

# "One more try.": the take's "One" starts ~0.1 s after its aligned start (in band -36 dB at 30.45, -12 dB at 30.55)
_j = T.find("One more")
_ob = _bursts(T.ws[_j] - 0.02, T.ws[_j] + 0.35, thr=-22.0)
if _ob and _ob[0][0] - 0.03 > T.ws[_j] + 0.04:
    T.ws[_j] = T.words[_j]["start"] = round(_ob[0][0] - 0.03, 3)

_i = T.find("It's tied down")
_blk = T.block("leash")
_b = _bursts(T.we[_i - 1] + 0.05, _blk["end"] + 0.05)
if len(_b) == 6:
    for k, (a, b) in enumerate(_b):
        T.ws[_i + k] = T.words[_i + k]["start"] = round(a - 0.04, 3)   # the consonant before the vowel's burst
        T.we[_i + k] = T.words[_i + k]["end"] = round(b, 3)
else:
    print(f'WARNING: "It\'s tied down, front and back": {len(_b)} bursts, not 6: {_b} (alignment left as it was)')

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`
# (reaction beats: on a gasp, after a punchline word, in a silent gap). Every id needs an SC.<id> in web/.
SHOTS = [
    ("hook", None),       # THE TEST: from the mirror, tight, his tongue out and curled UP at his nose, a little red flag on
                          # the tip of it; a hair short. "Close, right?" a gap marker; "LEASH" a leash clips on under it and
                          # yanks; "Lift your tongue" it curls up, the strap underneath goes taut and glows; a window opens on
                          # his cheek with the side view inside, and the camera dives through it
    ("side", None),       # his head from the side, as glass: the tongue tied down at the FRONT (the strap) and the BACK (the
                          # jawbone and the little throat bone); no bones inside; rings squeeze it skinny and it stretches
                          # toward the nose ... and the leashes stop it short
    ("pointy", "That's why yours"),   # back at the mirror: his tongue goes POINTY as he strains (the viewer's did too)
    ("crowd", "Only long"),           # ten faces with their tongues up: one reaches (1 IN 10); a doctor's chart, GORLIN'S SIGN;
                                      # BORN SUPER-BENDY: five of ten reach
    ("button", "Made it"),            # the mirror: a suspicious squint at us (SHOW-OFF), then the tongue goes back up
    ("loop", None),                   # the hook at negative time: the last frames ARE frame 1's picture (the loop)
]
special = {"side": T.ws[_i] - 0.06, "loop": T.duration - 0.45}   # the side view starts just before "It's": a cut inside its caption would cut the caption short

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
# One idea per chunk; break before the punchline so it lands alone ("raisins", "Nope", "Science").
# A line is capped at 640 px (x 220-860, the Shorts safe area): ~10 characters stay at full size, 16 drop to ~60 px.
CHUNKS = [
    "Can you touch / your nose",
    "with your / tongue?",
    "Try it.",
    "Close, right?",
    "Your tongue's / on a LEASH.",
    "Lift your / tongue...",
    "feel that / tug",
    "underneath?",
    "It's tied / down,",
    "front / and back.",
    "No bones / inside,",
    "so it / stretches",
    "by / squeezing",
    "itself / skinny.",
    "That's why / yours",
    "went / POINTY.",
    "Only long,",
    "stretchy / tongues",
    "make it...",
    "about / one in ten.",
    "Doctors even / named it!",
    "Half of / people",
    "born / super-bendy",
    "can.",
    "Made it?",
    "Show-off.",
    "Didn't?",
    "One more / try.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"nose": P["P"], "tongue": P["P"], "leash": R, "tug": O, "underneath": O, "tied": Y, "front": Y, "back": Y,
         "bones": S, "squeezing": O, "skinny": Y, "pointy": Y, "long": G, "stretchy": G, "1": Y, "10": Y,
         "named": C, "half": Y, "super-bendy": V, "show-off": V, "try": G}
DISPLAY = {"one in ten": ["1", "IN", "10"]}  # spoken words shown as figures: {"seventy percent": ["70%"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_one2 = find("one more")            # the second "one" (the first is "one in ten")
_try2 = find("try", find("more"))   # the second "try" (the first is the hook's)
_can2 = find("can", find("born"))   # "...super-bendy can." (the first "can" is the hook's)
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # the hook
    "nose1": W("nose"), "tongue1": W("tongue"), "try1": W("Try"), "try1_end": E("it", s=find("Try")),
    "close": W("Close"), "right": W("right"), "your2": W("Your tongue's"), "leash": W("LEASH"), "leash_end": E("LEASH"),
    "lift": W("Lift"), "lift_tongue": W("tongue", s=find("Lift")), "feel": W("feel"), "tug": W("tug"),
    "under": W("underneath"), "under_end": E("underneath"),
    # the side view
    "tied": W("It's tied", 1), "down": W("down"), "front": W("front"), "back": W("back"), "back_end": E("back"),
    "no": W("No bones"), "bones": W("bones"), "inside": W("inside"), "inside_end": E("inside"),
    "so": W("so it"), "stretches": W("stretches"), "squeezing": W("squeezing"), "itself": W("itself"),
    "skinny": W("skinny"), "skinny_end": E("skinny"),
    # pointy
    "thats": W("That's why"), "yours": W("yours"), "went": W("went"), "pointy": W("POINTY"), "pointy_end": E("POINTY"),
    # the crowd
    "only": W("Only"), "long": W("long"), "stretchy": W("stretchy"), "tongues": W("tongues"), "make": W("make"),
    "about": W("about"), "one10": W("one in ten"), "ten": W("ten"), "ten_end": E("ten"),
    "doctors": W("Doctors"), "named": W("named"), "named_end": E("it", s=find("named")),
    "half": W("Half"), "people": W("people"), "born": W("born"), "bendy": W("super-bendy"), "can2": T.ws[_can2], "can2_end": T.we[_can2],
    # the button
    "made": W("Made"), "made_end": E("it", s=find("Made")), "showoff": W("Show-off"), "showoff_end": E("Show-off"),
    "didnt": W("Didn't"), "one2": T.ws[_one2], "more": W("more"), "try2": T.ws[_try2], "try2_end": T.we[_try2],
    # the strain's tremble: a clock that goes round a whole number of times in the Short (scenes and audio share it)
    "strain_hz": 7.0,
}
for a, b in [("tied", "down"), ("down", "front"), ("front", "back"), ("no", "bones"), ("stretches", "squeezing"),
             ("made", "showoff"), ("showoff", "didnt"), ("didnt", "try2")]:
    assert cues[a] < cues[b], f"cue order: {a} {cues[a]} !< {b} {cues[b]}"
# ---- no Subscribe pill (since 16 Oct 2026; user, 15 Oct: "yes"; reference/analytics.md, the rules of 15 Oct). The
# silent pill over the last 3.4 s still made about a quarter of the viewers leave in the last 4 s and added no
# subscribers; replays carried the channel's breakout. So the Short ends on the button line and cuts back to frame 1.
# Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"]: web/subscribe.js draws the pill only when they exist, and
# qa.py fails a Short that has them. The subscribe ask lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: no pill, nothing said (the Short loops)'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('shots:', ', '.join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
print("re-timed:", " ".join(f'{T.words[_i + k]["word"]} {T.ws[_i + k]:.2f}-{T.we[_i + k]:.2f}' for k in range(6)))
