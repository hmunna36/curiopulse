"""Edit timeline for the Why Is a Day on Venus LONGER Than Its Year? 🎂 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.2)  # seconds after the last word: the button beat (a held look, a last gag) and the cut
#                                      back to frame 1 for the loop. Every Short is 30-35 s since 16 Oct 2026: keep it short,
#                                      so the loop comes before the thumb does.


# v3's alignment puts a block's first word(s) a little early (the breath before a word is given to the word). Move such a
# word onto the first speech-band burst after its aligned start (mirror-eyes, 24 Oct 2026: `_onto_burst`).
def _onto_burst(i, span=0.3, thr=-34.0, after=None):
    t0 = T.ws[i] - 0.02 if after is None else after
    b = T.bursts(t0, T.ws[i] + span, thr=thr)
    if b and b[0][0] - 0.03 > T.ws[i] + 0.04:
        T.ws[i] = T.words[i]["start"] = round(b[0][0] - 0.03, 3)


for _ph in ["On Venus", "So you'd", "so the Sun", "two hundred and twenty-five", "two hundred and forty-three"]:
    _onto_burst(T.find(_ph))

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
# THE CURIOUS KIND (story.md §6): the hero goes there. He stands on Venus in a silver heat suit and a glass helmet, with
# a party hat on the helmet and a birthday cake in his hands: his first birthday on Venus, and the calendar beside him
# still says MONDAY.
SHOTS = [
    ("hook", None),            # frame 1: tight on him BLOWING at his candle (inside the helmet: the glass fogs, the candle is
                               # a bulb and does not care); "one day lasts": the camera eases back, the flip calendar on a rock
                               # says MONDAY; "your whole YEAR": its month flap flips JAN..DEC, MONDAY does not move
    ("rise", "Venus is"),      # the camera shoots up through the cloud lid into space: the planet below, him standing on top
                               # of it with the cake (zzz: it is asleep); "it barely spins": he walks it like a log, it creeps
    ("orbit", "It laps"),      # THE ONE PICTURE: pull back to the Sun and the orbit; one lap in a time-lapse, EARTH DAYS
                               # 0 -> 225, the trail closes: 1 YEAR. He has gone round the planet only 93 % of the way
    ("spin", "but takes"),     # push in on the planet: the dashed START line, a dial at 93 %; days 225 -> 243 while he creeps
                               # to the line (taps his foot, checks his watch); "ONCE": 1 DAY
    ("payoff", "So you'd"),    # back on the surface: "a year older": he pulls a party popper, confetti; "a day older": he
                               # rips the MONDAY page off the calendar... MONDAY again underneath
    ("weird", "Oh, and"),      # he lounges in a deck chair facing us (EAST) in sunglasses, a mug CLINKS on his helmet;
                               # "BACKWARDS": a little Venus in the sky spins the wrong way next to a little Earth;
                               # "WEST": the dawn comes up BEHIND him, his shadow shoots toward us, he turns round
    ("button", "Happy birthday"),  # the birthday again, holding the cake: "Happy birthday." "It's still..." a look at the
                               # calendar: "Monday." Then he breathes in to blow: the loop
    ("loop", None),            # the hook at negative time: the last frames ARE frame 1's picture
]
special = {"loop": T.duration - 0.45}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "On Venus,",
    "one day lasts / longer",
    "than your / whole YEAR.",
    "Venus is the / laziest planet...",
    "it barely / spins.",
    "It laps / the whole Sun",
    "in two hundred and twenty-five days...",
    "but takes / two hundred and forty-three",
    "to turn / around ONCE.",
    "So you'd be / a year older...",
    "before you're / a day older.",
    "Oh, and it / spins BACKWARDS...",
    "so the Sun / comes up",
    "in the WEST.",
    "Happy / birthday.",
    "It's still...",
    "Monday.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
# YEAR is yellow and DAY is cyan all through, so the race reads in the captions too
COLOR = {"venus": O, "day": C, "year": Y, "laziest": V, "spins": C, "sun": Y, "225": Y, "243": C, "once": C,
         "backwards": R, "west": O, "birthday": P["P"], "monday": R}
DISPLAY = {"in two hundred and twenty-five days": ["IN", "225", "DAYS"], "two hundred and forty-three": ["243"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
_v2 = find("Venus", find("YEAR"))           # the second "Venus" ("Venus is the laziest")
_day2 = find("day", find("you're"))          # "a day older"
_year2 = find("year", find("So you'd"))      # "a year older"
_so2 = find("so", find("BACKWARDS"))         # "so the Sun"
cues = {
    # the hook: blowing, the calendar, the year flipping by
    "on": W("On Venus"), "venus": W("Venus", s=0), "venus_end": E("Venus", s=0), "one": W("one day"), "day": W("day lasts"),
    "lasts": W("lasts"), "longer": W("longer"), "than": W("than"), "your": W("your whole"), "whole": W("whole"),
    "year": W("YEAR"), "year_end": E("YEAR"),
    # the rise and the lazy planet
    "venus2": T.ws[_v2], "laziest": W("laziest"), "planet": W("planet"), "planet_end": E("planet"), "it1": W("it barely"),
    "barely": W("barely"), "spins": W("spins.", s=find("barely")), "spins_end": E("spins.", s=find("barely")),
    # the lap
    "laps": W("laps"), "whole2": W("whole Sun"), "sun": W("Sun", s=find("laps")), "in": W("in two"),
    "two": W("two hundred and twenty-five"), "twentyfive": W("twenty-five"), "days": W("days"), "days_end": E("days"),
    # the spin
    "but": W("but takes"), "takes": W("takes"), "two2": W("two hundred and forty-three"), "fortythree": W("forty-three"),
    "to": W("to turn"), "turn": W("turn around"), "around": W("around"), "once": W("ONCE"), "once_end": E("ONCE"),
    # the payoff
    "so": W("So you'd"), "year2": T.ws[_year2], "older": W("older", s=_year2), "older_end": E("older", s=_year2),
    "before": W("before"), "youre": W("you're"), "day2": T.ws[_day2], "older2": W("older", s=_day2),
    "older2_end": E("older", s=_day2),
    # the weird fact
    "oh": W("Oh"), "oh_end": E("Oh"), "and": W("and it"), "spins2": W("spins BACKWARDS"), "backwards": W("BACKWARDS"),
    "backwards_end": E("BACKWARDS"), "so2": T.ws[_so2], "sun2": W("Sun comes"), "comes": W("comes"), "up": W("up in"),
    "west": W("WEST"), "west_end": E("WEST"),
    # the button
    "happy": W("Happy"), "birthday": W("birthday"), "birthday_end": E("birthday"), "its": W("It's still"),
    "still": W("still"), "still_end": E("still"), "monday": W("Monday"), "monday_end": E("Monday"),
}
cues["loop"] = special["loop"]
for a, b in [("venus", "one"), ("one", "year"), ("year", "venus2"), ("laziest", "barely"), ("laps", "days"),
             ("days", "but"), ("two2", "once"), ("so", "older"), ("older", "before"), ("before", "older2"),
             ("oh", "backwards"), ("backwards", "so2"), ("so2", "west"), ("happy", "still"), ("still", "monday"),
             ("monday_end", "loop")]:
    assert cues[a] < cues[b], f"cue order: {a} {cues[a]} !< {b} {cues[b]}"
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026: "yes let's test it for 2 weeks"; reference/analytics.md).
# publish.json "subscribe" says the arm (`yt.mjs next-slot`): "pill" (a 23:30 slot, 25 Oct-8 Nov) or "none". T.write
# sets the pill's cues for the pill arm by itself and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] /
# ["sub_out"] here. Nobody says "subscribe" in either arm; the ask lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the curious kind: the claim, said to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print('re-timed:', ' '.join(f'{T.words[i]["word"]} {T.ws[i]:.2f}' for i in [0, find("So you'd"), _so2, find("two hundred and twenty-five"), find("two hundred and forty-three")]))
