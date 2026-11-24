"""Edit timeline for the There's a GALAXY in Your Sky Wider Than the Moon 🌌 Short (CURIOUS, short arm 30-35 s, no pill,
the loop).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.7)  # seconds after the last word: only the cut back to frame 1 for the loop

# The places (web/gx_world.js): a grassy hilltop camp at night above a mountain lake (his orange tent lit from inside
# with a string of bulbs, a lantern on a stake, a thermos on a rock, pines, fireflies), the sky over it with the Moon (a
# character: proud, then jealous, then measured, then sulking) and the Andromeda galaxy painted at its true size beside
# it: nearly six full Moons long (APOD 2022-10-21, 2025-02-21; Wikipedia 3.17 degrees against the Moon's 0.52). His
# CAMERA GOGGLES (two lens barrels, a REC light, a timer) show it whole; flipped up, his own eyes see only a smudge.
# Then space (the light leaving Andromeda) and a time ribbon (2.5 million years against people's 300,000).
# Framings: never two alike in a row (size, side, height).
SHOTS = [
    ("hook", None),                 # CU, eye level, him LEFT of centre in the goggles, mouth open in awe, the galaxy's glow
                                    # in both lenses; behind him the giant galaxy (upper right) and the proud Moon (upper
                                    # left); his tent's bulbs as bokeh (frame 0)
    ("wide", "six times"),          # WIDE, LOW angle: him small on the crest against the whole sky: the galaxy diagonal,
                                    # six Moons long, the Moon beside it; on "Moon." the Moon's eyes slide to the galaxy
                                    # (beat 1 of the running device: the Moon is jealous). The flash-forward at its end
    ("answer", "Never seen"),       # MEDIUM, eye level, him RIGHT: he flips the goggles UP and the galaxy behind him shrinks
                                    # to a faint smudge; the Moon smirks
    ("squint", "Your eyes"),        # CU, LOW angle, him centre squinting up at the smudge (dashed ring: ALL YOU SEE);
                                    # cut_dim: closer, the squint to slits; punch-in + hitstop on "dim"
    ("blink", "They grab"),         # WHIP. EXTREME CLOSE-UP of his right eye: specks of light fall into the pupil, a ring
                                    # timer sweeps 0.1 s, and on "blink" the lid snaps shut and the specks are gone
    ("rec", "A camera"),            # MEDIUM-CLOSE, HIGH angle, him LEFT: the goggles snap down, REC, the timer races to
                                    # 10:00; cut_min: CLOSER on the lenses filling with light: 10 MIN
    ("bloom", "and the rest"),      # WHIP. WIDE, eye level: the galaxy blooms out from the smudge across the whole sky and
                                    # the lake mirrors it; he leans back; the Moon's jaw drops
    ("line", "Line up"),            # the SKY, MEDIUM: a dashed ruler along the galaxy; the Moon, nervous, slides to its tip
    ("count", None),                # the SKY, WIDER (the longest shot): "one, two, three..." Moon clones pop along it, the
                                    # first Moon more embarrassed with each; full silence before...
    ("six", None),                  # ...SIX: three more at once (hitstop, the biggest hit): six Moons end to end
    ("trip", "And that glow"),      # WHIP. SPACE: Andromeda from outside, a ball of its light leaves; cut_two: closer, the
                                    # light racing, 2.5 MILLION YEARS
    ("timeline", "before people"),  # the TIME RIBBON: the light crawls along it; PEOPLE pops up near the far end (300,000
                                    # years ago); cut_you: the YOU end, the light lands in his goggles: ding
    ("button", "Sorry"),            # MEDIUM, him LEFT waving sheepishly, the Moon RIGHT pulls a cloud over itself (beat 3)
    ("loop", None),                 # the hook's picture again (frame 0): the loop
]
special = {}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "There's a galaxy / in your sky...",
    "six times wider / than the Moon.",
    "Never seen it?",
    "Your eyes / are just...",
    "really bad / at dim.",
    "They grab light / for a blink.",
    "A camera / grabs it",
    "for MINUTES...",
    "and the rest / shows up.",
    "Line up full Moons / across it...",
    "one, two, three...",
    "SIX.",
    "And that glow left...",
    "two and a half / million years ago...",
    "before people / like us existed.",
    "Sorry, Moon.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
COLOR = {"galaxy": V, "six": Y, "wider": Y, "moon": S, "never": R, "dim": R, "blink": C, "camera": G, "minutes": G,
         "rest": V, "moons": S, "three": S, "glow": V, "2.5": Y, "million": Y, "people": O, "existed": O}
DISPLAY = {"two and a half": ["2.5"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

W, E, ev, find = T.W, T.E, T.ev, T.find
_six = find("three SIX") + 1
special["count"] = W("one,") - 0.07          # the count starts on its own shot (the longest, before the sting)
special["six"] = W("SIX", 0, _six) - 0.07
special["loop"] = E("Moon.", 0, find("Sorry, Moon")) + 0.05   # the last ~0.65 s: the hook's picture again (the loop)
shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

_st = {s_["id"]: s_["start"] for s_ in shots}
_en = {s_["id"]: s_["end"] for s_ in shots}
_m2 = find("than the Moon")
_sm = find("Sorry, Moon")
cues = {
    "theres": W("There's"), "galaxy": W("galaxy"), "sky": W("sky"), "sky_end": E("sky"),
    "six1": W("six times"), "times": W("times"), "wider": W("wider"), "moon1": W("Moon", 0, _m2), "moon1_end": E("Moon", 0, _m2),
    "never": W("Never"), "seen": W("seen"), "it1": W("it?"), "it1_end": E("it?"),
    "your": W("Your eyes"), "eyes": W("eyes"), "just": W("just"), "just_end": E("just"), "really": W("really"),
    "bad": W("bad"), "dim": W("dim"), "dim_end": E("dim"),
    "they": W("They"), "grab": W("grab"), "light": W("light"), "for1": W("for a blink"), "blink": W("blink"),
    "blink_end": E("blink"),
    "a": W("A camera"), "camera": W("camera"), "grabs": W("grabs"), "for2": W("for MINUTES"), "minutes": W("MINUTES"),
    "minutes_end": E("MINUTES"),
    "and1": W("and the rest"), "rest": W("rest"), "shows": W("shows"), "up1_end": E("shows up", 1),
    "line": W("Line"), "full": W("full"), "moons": W("Moons"), "across": W("across"), "it2": W("it...", 0, find("across it")),
    "it2_end": E("it...", 0, find("across it")),
    "one": W("one,"), "two": W("two,"), "three": W("three"), "three_end": E("three"),
    "six": W("SIX", 0, _six), "six_end": E("SIX", 0, _six),
    "and2": W("And that"), "glow": W("glow"), "left": W("left"), "twoh": W("two and a half"), "million": W("million"),
    "years": W("years"), "ago": W("ago"), "ago_end": E("ago"),
    "before": W("before"), "people": W("people"), "like": W("like"), "us": W("us"), "existed": W("existed"),
    "existed_end": E("existed"),
    "sorry": W("Sorry"), "sorry_end": E("Sorry"), "moon2": W("Moon", 0, _sm + 1), "moon2_end": E("Moon", 0, _sm + 1),
}
_order = ["theres", "galaxy", "sky", "sky_end", "six1", "times", "wider", "moon1", "moon1_end", "never", "seen", "it1",
          "it1_end", "your", "eyes", "just", "just_end", "really", "bad", "dim", "dim_end", "they", "grab", "light",
          "for1", "blink", "blink_end", "a", "camera", "grabs", "for2", "minutes", "minutes_end", "and1", "rest",
          "shows", "up1_end", "line", "full", "moons", "across", "it2", "it2_end", "one", "two", "three", "three_end",
          "six", "six_end", "and2", "glow", "left", "twoh", "million", "years", "ago", "ago_end", "before", "people",
          "like", "us", "existed", "existed_end", "sorry", "sorry_end", "moon2", "moon2_end"]
assert all(cues[a_] < cues[b_] for a_, b_ in zip(_order, _order[1:])), [(a_, cues[a_]) for a_ in _order]
cues["end"] = T.duration
cues["loop"] = _st["loop"]
# the hook: the lenses flare as the galaxy's light catches them
cues["glint"] = cues["galaxy"] + 0.05
# the running device: the Moon. Beat 1: on "Moon." its eyes slide to the giant beside it (jealous)
cues["side"] = cues["moon1"] + 0.02
cues["ff"] = max(4.02, cues["moon1_end"] + 0.03)        # the flash-forward: six Moons end to end (the payoff's picture)
# the answer: the goggles flip up and the galaxy shrinks to what his eyes see
cues["flip"] = cues["never"] - 0.04
cues["shrink"] = cues["never"] + 0.06
cues["smirk"] = cues["it1"]                            # the Moon smirks
cues["ring"] = cues["eyes"] + 0.05                     # the dashed ring round the smudge: ALL YOU SEE
cues["squint"] = cues["just"]                          # he squints harder
cues["cut_dim"] = cues["really"] - 0.07                # closer, the squint to slits
cues["dimhit"] = cues["dim_end"] + 0.03                # the hitstop on the slits (after the punch word)
# the eye: specks of light fall in from "light", the ring sweeps, the lid snaps on "blink"
cues["specks"] = cues["light"] - 0.05
cues["shut"] = cues["blink"] + 0.02
cues["open"] = cues["blink_end"] + 0.10
# the camera goggles
cues["down"] = cues["a"] - 0.02                        # the goggles snap down
cues["rec"] = cues["camera"] + 0.05                    # REC lights
cues["run0"] = cues["grabs"]                           # the timer races from 0:00...
cues["run1"] = cues["minutes_end"]                     # ...to 10:00
cues["cut_min"] = cues["for2"] - 0.07                  # closer on the lenses
cues["tag10"] = cues["minutes"] + 0.06                 # 10 MIN pops
# the bloom: the galaxy grows from the smudge to its full size
cues["exp0"] = cues["rest"] - 0.05
cues["exp1"] = cues["up1_end"] + 0.05
cues["jaw"] = cues["shows"] + 0.02                     # the Moon's jaw drops
# the Moons: the ruler, the Moon slides to the tip, the count, SIX
cues["ruler"] = cues["line"] + 0.05
cues["slide"] = cues["moons"] - 0.05
cues["m1"] = cues["one"] + 0.02
cues["m2"] = cues["two"] + 0.02
cues["m3"] = cues["three"] + 0.02
cues["m456"] = cues["six_end"] - 0.12          # SIX is heard in the silence; the three pop as it ends
cues["sixhit"] = cues["six_end"] + 0.05               # the hitstop and the biggest hit, just after the word
cues["tag6"] = cues["six_end"] + 0.25                  # ~6 MOONS WIDE
# the light's trip
cues["launch"] = cues["left"] - 0.05
cues["cut_two"] = cues["twoh"] - 0.07
cues["count0"] = cues["twoh"]                          # the years counter
cues["peopleflag"] = cues["people"] - 0.02             # PEOPLE pops near the far end of the ribbon
cues["cut_you"] = cues["existed_end"] + 0.04           # the YOU end
cues["land"] = cues["existed_end"] + 0.42              # the light lands in his goggles: ding
# the button: the Moon pulls a cloud over itself (beat 3), he gives a sheepish wave
cues["wave"] = cues["sorry"] + 0.05
cues["blanket"] = cues["moon2"] - 0.10

CAMERA = {
    "hand": {"hook": 0.25, "wide": 0.2, "answer": 0.3, "squint": 0.35, "blink": 0.2, "rec": 0.3, "bloom": 0.2,
             "line": 0.2, "count": 0.18, "six": 0.35, "trip": 0.25, "timeline": 0.2, "button": 0.3, "loop": 0.25},
    "whip": [[_st["blink"], 1], [_st["bloom"], -1], [_st["trip"], 1]],
    "punch": [[cues["dim"] - 0.02, 1.2, _en["squint"] - 0.02], [cues["moon2"] - 0.05, 1.15, _en["button"] - 0.02]],
    "tilt": [[cues["just"], _en["squint"] - 0.02, -3.0]],
    "hit": [[cues["dimhit"], 4], [cues["sixhit"], 4]],
    "act": {"brow": [cues["never"] + 0.05, cues["minutes"], cues["rest"], cues["existed"]]},
    "mood": [[0, "day"], [cues["shrink"], "cold"], [_st["blink"], "spot"], [_st["rec"], "day"], [cues["exp0"], "warm"],
             [_st["trip"], "night"], [_st["button"], "day"]],
    "fg": {"wide": "grass-b", "answer": "branch-tr", "squint": "branch-tl", "rec": "grass-bl", "bloom": "grass-b", "count": "branch-tl",
           "button": "grass-br"},
    "air": {"hook": {"kind": "pollen", "amount": 0.45, "color": "#D8FF6A"},
            "wide": {"kind": "pollen", "amount": 0.35, "color": "#D8FF6A"},
            "answer": {"kind": "pollen", "amount": 0.4, "color": "#D8FF6A"},
            "squint": {"kind": "sparkle", "amount": 0.25},
            "rec": {"kind": "pollen", "amount": 0.4, "color": "#D8FF6A"},
            "bloom": {"kind": "sparkle", "amount": 0.45},
            "line": {"kind": "sparkle", "amount": 0.3}, "count": {"kind": "sparkle", "amount": 0.3},
            "six": {"kind": "sparkle", "amount": 0.5}, "trip": {"kind": "sparkle", "amount": 0.4},
            "timeline": {"kind": "sparkle", "amount": 0.3},
            "button": {"kind": "pollen", "amount": 0.4, "color": "#D8FF6A"},
            "loop": {"kind": "pollen", "amount": 0.45, "color": "#D8FF6A"}},
    "flash": [[cues["ff"], 0.5, cues["six_end"] - 0.08, {}]],
}
T.write(shots, caps, cues, camera=CAMERA)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (this slot: the SHORT arm, 30-35 s, from publish.json "length")')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the impossible claim, put to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for s_ in shots:
    print(f'  {s_["id"]:9s} {s_["start"]:6.2f} -> {s_["end"]:6.2f}  ({s_["end"] - s_["start"]:.2f} s)')
