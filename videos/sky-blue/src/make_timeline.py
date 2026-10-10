"""Edit timeline for the Why Is the Sky BLUE? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.9)  # the button's beat: he swallows at last, breathes out, and the bottle goes back up (frame 1)
W, E, ev, find = T.W, T.E, T.ev, T.find
B0 = {}                              # block id -> index of its first word (repeated words are looked up from there)
for _i, _w in enumerate(T.words):
    B0.setdefault(_w["block"], _i)

# ---- v3 stamps a take's first word short or early now and then: put it where the take gets loud. BEFORE the shots.
def move_onset(bid, tol=0.1):
    i, t0 = B0[bid], T.first_loud(T.block(bid)["start"])
    if abs(T.ws[i] - t0) > tol:
        print(f'  moved the first word of {bid!r} from {T.ws[i]:.2f} to {t0:.2f}')
        T.ws[i] = T.words[i]["start"] = t0
for _b in ("answer", "colours", "blue", "sky", "moon", "sunset", "mars", "button"):
    move_onset(_b)

SHOTS = [
    ("hook", None),                       # ONE shot: he drinks under a blue sky, the sky goes black, the sunlight crashes in
    ("colours", "Sunlight is every"),     # inside the beam: every colour, and red's long lazy wave slipping past the air
    ("blue", "Blue comes in"),            # blue's short twitchy wave: it smacks into the air and bounces everywhere
    ("sky", "So blue hits"),              # back on the trail: blue arrives from every direction, the sky fills in
    ("moon", "No air"),                   # the proof: the Moon at noon
    ("long", "At sunset"),                # the long way through the air: nearly forty times more of it
    ("dusk", "and you get the"),          # what is left gets to him: red
    ("mars", "On Mars"),                  # butterscotch day, blue sunset
    ("button", None),                     # the trail again: he can swallow now; ends on frame 1 (the silent Subscribe pill plays here)
]
special = {"button": E("the dust", 1, B0["mars"]) + 0.22}

CHUNKS = [
    "You gulp / your water", "under a / blue sky", "that should be", "black",
    "It's only blue", "because sunlight", "keeps crashing", "into the air",
    "Sunlight is / every colour", "at once", "Red rolls in", "on long, / lazy waves", "and slips / right past", "the air",
    "Blue comes in", "short, twitchy / waves", "It smacks into", "air molecules", "and bounces", "everywhere",
    "So blue hits / your eyes", "from every / direction", "That's / your sky",
    "No air, / no blue", "on the Moon,", "the sky is black", "at noon",
    "At sunset,", "the light crosses", "nearly forty times", "more air", "The blue's all", "bounced away", "and you get", "the leftovers",
    "On Mars?", "Backwards", "Butterscotch / sky", "blue / sunset", "Blame / the dust",
    "You can / swallow now",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
COLOR = {"blue": B, "blue's": B, "black": Y, "sunlight": Y, "crashing": O, "red": R, "lazy": R, "twitchy": B, "smacks": O,
         "everywhere": C, "moon": S, "noon": Y, "sunset": O, "40×": Y, "leftovers": R, "mars": O, "backwards": Y,
         "butterscotch": O, "dust": O, "swallow": G, "air": C}
DISPLAY = {"nearly forty times": ["NEARLY", "40×"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

a, co, bl, sk, mo, su, ma, bu = (B0[k] for k in ("answer", "colours", "blue", "sky", "moon", "sunset", "mars", "button"))
cues = {
    # ---- the hook: he drinks; the sky goes out on "black"; the sunlight crashes into the air and the blue comes back
    "black": W("should be black", 2), "black_end": E("should be black", 2),
    "its": T.ws[a], "sunlight": W("because sunlight", 1, a), "crashing": W("keeps crashing", 1, a), "air1": W("into the air", 2, a),
    "air1_end": E("into the air", 2, a),
    # ---- inside the beam
    "every": W("every colour", 0, co), "once_end": E("at once", 1, co), "red": W("Red rolls", 0, co), "lazy": W("lazy waves", 0, co),
    "slips": W("and slips", 1, co), "past_end": E("past the air", 2, co),
    "blue": W("Blue comes", 0, bl), "twitchy": W("twitchy", 0, bl), "smacks": W("It smacks", 1, bl), "molecules": W("air molecules", 1, bl),
    "mol_end": E("air molecules", 1, bl), "bounces": W("and bounces", 1, bl), "everywhere": W("everywhere", 0, bl),
    "everywhere_end": E("everywhere", 0, bl),
    # ---- the trail: from every direction
    "hits": W("blue hits", 1, sk), "eyes": W("your eyes", 1, sk), "direction": W("direction", 0, sk), "thats": W("That's your sky", 0, sk),
    "sky_end": E("That's your sky", 2, sk),
    # ---- the Moon
    "noair": W("No air", 0, mo), "noblue": W("no blue", 0, mo + 2), "onmoon": W("the Moon", 1, mo), "black2": W("is black", 1, mo),
    "noon": W("at noon", 1, mo), "noon_end": E("at noon", 1, mo),
    # ---- the long way
    "sunset": W("At sunset", 1, su), "crosses": W("crosses", 0, su), "forty": W("forty", 0, su), "moreair_end": E("more air", 1, su),
    "blues": W("The blue's", 1, su), "away": W("bounced away", 1, su), "away_end": E("bounced away", 1, su),
    "leftovers": W("leftovers", 0, su), "leftovers_end": E("leftovers", 0, su),
    # ---- Mars
    "mars": W("On Mars", 1, ma), "mars_end": E("On Mars", 1, ma), "backwards": W("Backwards", 0, ma), "backwards_end": E("Backwards", 0, ma),
    "butter": W("Butterscotch", 0, ma), "msky_end": E("Butterscotch sky", 1, ma), "bsun": W("blue sunset", 0, ma), "bsun_end": E("blue sunset", 1, ma),
    "blame": W("Blame", 0, ma), "dust": W("the dust", 1, ma), "dust_end": E("the dust", 1, ma),
    # ---- the button
    "you2": T.ws[bu], "swallow": W("swallow", 0, bu), "now_end": E("swallow now", 1, bu),
}
cues.update({
    # pauses and word ends the sound needs
    "waves_end": E("lazy waves", 1, co), "twaves_end": E("twitchy waves", 1, bl), "it": W("It smacks", 0, bl), "bounces_end": E("and bounces", 1, bl),
    "so": T.ws[sk], "air_m_end": E("No air", 1, mo), "blue_m_end": E("no blue", 1, mo + 2), "moon_end": E("the Moon", 1, mo),
    "at_once": W("at once", 0, co), "once": W("at once", 1, co), "blue1": W("blue sky", 0), "blue1_end": E("blue sky", 0), "keeps": W("keeps crashing", 0, a),
    "keeps_end": E("keeps crashing", 0, a), "be": W("should be black", 1), "be_end": E("should be black", 1), "tw_waves": W("twitchy waves", 1, bl),
    "at": T.ws[su], "and2": W("and you get", 0, su), "on": T.ws[ma], "msky": W("Butterscotch sky", 1, ma),
})
cues["gulp"] = round(cues["now_end"] + 0.24, 3)                 # he swallows, in the pause after the line
cues["ahh"] = round(cues["gulp"] + 0.42, 3)
# swallows while he drinks (a clock from frame 1, so the last frames of the Short run into it)
cues["glugs"] = [round(0.03 + 0.52 * i, 3) for i in range(8) if 0.03 + 0.52 * i < cues["black"] - 0.2]
# the sunlight's crashes: the first on the word, then one every quarter second until the camera dives into one
cr0 = cues["crashing"]
cues["crashes"] = [round(cr0 + 0.04 + 0.25 * i, 3) for i in range(7)]
cues["dive"] = round(SH["hook"]["end"] - 0.42, 3)
# the pinball: the first smack is on the word, the rest in the gaps and under "bounces everywhere"
cues["bonks"] = [round(x, 3) for x in (cues["smacks"] + 0.12, cues["molecules"] + 0.1, cues["mol_end"] + 0.03, cues["bounces"] + 0.02, cues["bounces"] + 0.34,
                                        cues["everywhere"] + 0.08, cues["everywhere"] + 0.4, cues["everywhere_end"] + 0.05)]
# the Moon: the bottle meets the helmet in the pause after "noon."
cues["tink"] = round(cues["noon_end"] + 0.12, 3)

# ---- the subscribe cue (web/subscribe.js): SILENT, over the last seconds.
cues["sub_in"] = T.duration - 3.40
cues["sub_tap"] = cues["sub_in"] + 1.25
cues["sub_out"] = cues["sub_tap"] + 1.30       # + 0.24 s of pop-out: gone 0.61 s before the end
for _c in caps:
    if _c["start"] < cues["sub_in"] < _c["end"] < cues["sub_in"] + 0.3:
        _c["end"] = round(cues["sub_in"] - 0.08, 3)
T.write(shots, caps, cues)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first cut: {shots[1]["start"]:.2f} s (7.0 s or later: the opening is one shot through the answer)' if len(shots) > 1 else 'first cut: none')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print(f'subscribe cue: silent, the pill is up {cues["sub_in"]:.2f}-{cues["sub_out"] + 0.24:.2f} s of {T.duration:.2f} s'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
for k in sorted(cues, key=lambda k: cues[k] if not isinstance(cues[k], list) else cues[k][0]):
    v = cues[k]
    print(f'  {k:15s}', v if isinstance(v, list) else f'{v:.2f}')
