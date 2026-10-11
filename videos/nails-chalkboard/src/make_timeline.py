"""Edit timeline for the Why Do Nails on a CHALKBOARD Make You Cringe? Short (the standard, 45-50 s arm).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.5)  # after "...did not.": the skin meter gives up, and the cut back to frame 1

W, E, ev, find = T.W, T.E, T.ev, T.find
# v3 gives a tag's time to the take's first word: "[mischievously] Scientists" starts where the take gets loud
_i = find("Scientists told")
_on = T.first_loud(T.block("music")["start"])
if T.ws[_i] - _on > 0.1:
    T.ws[_i] = T.words[_i]["start"] = _on
DUR = T.duration
LOOP = round((DUR - 0.40) * 30) / 30   # the last 0.4 s: the classroom again, his nails landing on the board (frame 1)

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),      # ONE shot through the answer and the band: close on his hand dragging four nails down the
                         # board and his face beside it; he cringes; the screech's rings travel to his ear and swell
                         # there; a pitch ruler is chalked on the board and one narrow band turns red; a window opens on
                         # his ear and the camera dives in
    ("canal", None),     # the ear canal in section: the red band grows on its way down the tube and hammers the
                         # eardrum; a bottle of the same length toots under it
    ("alarm", None),     # up the nerve into the brain: the alarm centre grabs the hearing area's volume knob
    ("proof", None),     # the classroom again: the red band is muted, he scrapes again and shrugs; a scream lives in it
    ("music", None),     # the listening test: headphones, a skin sensor, a sign that says MODERN MUSIC
    ("button", None),    # the same desk: his brain applauds, his skin meter gives up
    ("loop", None),      # the picture of frame 1 again (the hook's state at negative time)
]
special = {
    "canal": W("and your ear canal") - 0.10,
    "alarm": W("Then your") - 0.12,
    "proof": W("Mute that") - 0.14,
    "music": W("Scientists told") - 0.14,
    "button": W("Your brain bought") - 0.16,
    "loop": LOOP,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You drag", "your nails", "down a / chalkboard", "and / cringe",
    "Your / own ear", "is making", "that / screech", "LOUDER",
    "The / nasty part", "sits in", "one / narrow band", "of pitch",
    "and your / ear canal", "is a / tiny tube", "that / boosts", "exactly / that band",
    "Like / a bottle", "you blow / across",
    "Then / your brain's", "alarm / centre", "grabs the / volume knob", "and / cranks it", "UP",
    "Mute / that band", "and people", "barely / mind",
    "Why / that band", "Nobody's / sure", "But it's / where", "screams / live",
    "Scientists / told people", "the screech", "was / modern music", "and they / hated it", "less",
    "Their skin", "still / sweated",
    "Your brain", "bought it", "Your skin", "did not",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea: red = the screech's band and the alarm, yellow = the reveal, orange = the
# ear and the skin, green = it stops hurting, violet = the joke's object (modern music), pink = the brain
COLOR = {
    "nails": Y, "chalkboard": Y, "cringe": R,
    "ear": O, "screech": R, "louder": R,
    "nasty": R, "narrow": Y, "band": R, "pitch": Y,
    "canal": O, "tube": C, "boosts": Y, "exactly": Y,
    "bottle": C, "blow": C,
    "alarm": R, "volume": Y, "cranks": Y, "up": R,
    "mute": G, "barely": G,
    "nobody's": V, "screams": R,
    "modern": V, "music": V, "less": G,
    "skin": O, "sweated": C,
    "brain": PK, "bought": G, "not": R,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

I_TUBE = find("exactly that band")
I_MUTE = find("Mute that band")
I_WHY = find("Why that band")
I_SKIN2 = find("Your skin")
CRINGE_E = E("and cringe", 1)
LOUDER_E = E("LOUDER")
ACROSS_E = E("blow across", 1)
UP_E = E("it UP", 1)
MUTE_E = T.we[I_MUTE + 2]
MIND_E = E("barely mind", 1)
LIVE_E = E("screams live", 1)
LESS_E = E("it less", 1)
SWEAT_E = E("still sweated", 1)
NOT_E = E("did not", 1)
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: four nails down the board
    "you": W("You drag"),
    "drag": W("You drag", 1),
    "nails": W("your nails", 1),
    "chalk": W("chalkboard"),
    "chalk_end": E("chalkboard"),
    "cringe": W("and cringe", 1),            # his whole body folds
    "cringe_end": CRINGE_E,
    # the answer, over the same shot: the rings reach his ear and swell there
    "own": W("Your own"),
    "ear": W("own ear", 1),
    "making": W("is making", 1),
    "screech": W("that screech", 1),
    "screech_end": E("that screech", 1),     # the screech again, in the pause before "LOUDER"
    "louder": W("LOUDER"),
    "louder_end": LOUDER_E,
    # the band: a pitch ruler is chalked on the board
    "nasty": W("nasty part"),
    "sits": W("sits in"),
    "one": W("one narrow"),
    "narrow": W("one narrow", 1),            # one narrow band turns red
    "band": W("narrow band", 1),
    "pitch": W("of pitch", 1),
    "pitch_end": E("of pitch", 1),
    "window": W("of pitch", 1) - 0.14,       # a window opens on his ear
    "dive": SH["canal"]["start"] - 0.26,     # the camera goes in
    # 2. canal
    "canal": W("ear canal", 1, find("and your ear")),
    "tiny": W("tiny tube"),
    "tube": W("tiny tube", 1),
    "tube_end": E("tiny tube", 1),
    "boosts": W("that boosts", 1),
    "exactly": T.ws[I_TUBE],
    "band2": T.ws[I_TUBE + 2],
    "band2_end": T.we[I_TUBE + 2],
    "bottle": W("a bottle", 1),
    "blow": W("you blow", 1),
    "across": W("blow across", 1),
    "across_end": ACROSS_E,
    "toot": ACROSS_E + 0.04,                 # the bottle's note, in the pause
    # 3. alarm
    "then": W("Then your"),
    "brains": W("your brain's", 1),
    "alarm": W("alarm centre"),              # the siren comes on
    "centre": W("alarm centre", 1),
    "centre_end": E("alarm centre", 1),
    "grabs": W("grabs the"),                 # an arm shoots out to the knob
    "volume": W("volume knob"),
    "knob": W("volume knob", 1),
    "knob_end": E("volume knob", 1),
    "cranks": W("cranks it"),                # the knob goes round
    "up": W("it UP", 1),
    "up_end": UP_E,
    # 4. proof: mute the band, scrape again
    "mute": T.ws[I_MUTE],
    "band3": T.ws[I_MUTE + 2],
    "mute_end": MUTE_E,
    "scrape2": MUTE_E + 0.03,                # the dull scrape, alone in the pause
    "people": W("and people", 1),
    "barely": W("barely mind"),
    "mind": W("barely mind", 1),
    "mind_end": MIND_E,
    "why": T.ws[I_WHY],
    "why_end": T.we[I_WHY + 2],
    "nobodys": W("Nobody's sure"),
    "sure": W("Nobody's sure", 1),
    "sure_end": E("Nobody's sure", 1),
    "but": W("But it's"),
    "where": W("it's where", 1),
    "screams": W("screams live"),            # a scream looks out of the band
    "live": W("screams live", 1),
    "live_end": LIVE_E,
    # 5. music: the listening test
    "scientists": W("Scientists told"),
    "told": W("Scientists told", 1),
    "people2": W("told people", 1),
    "screech2": W("the screech", 1),
    "modern": W("modern music"),             # the sign flips
    "music": W("modern music", 1),
    "music_end": E("modern music", 1),
    "hated": W("hated it"),
    "less": W("it less", 1),                 # the score paddle goes up
    "less_end": LESS_E,
    "their": W("Their skin"),
    "skin": W("Their skin", 1),
    "still": W("still sweated"),
    "sweated": W("still sweated", 1),        # the needle slams over
    "sweated_end": SWEAT_E,
    # 6. button
    "brain": W("Your brain bought", 1),
    "bought": W("bought it"),
    "bought_end": E("bought it", 1),
    "skin2": T.ws[I_SKIN2 + 1],
    "skin2_end": T.we[I_SKIN2 + 1],
    "did": W("did not"),
    "not": W("did not", 1),
    "not_end": NOT_E,
    "sproing": NOT_E + 0.10,                 # the meter's spring lets go, after the last word
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): SILENT, over the last seconds (since 9 Oct 2026; reference/analytics.md).
# Nobody says "subscribe": wherever the word was spoken, as the last line or mid-video, a quarter to a half of the
# viewers still watching left within three seconds of it. The pill pops in 3.4 s before the end, the cursor clicks
# 1.25 s later, and the pill has popped out 0.6 s before the cut back to frame 1, so the loop stays clean. It plays
# over the button shot while the last line is spoken; captions that share the screen with it sit at y 1150 (main.js).
cues["sub_in"] = T.duration - 3.40
cues["sub_tap"] = cues["sub_in"] + 1.25
cues["sub_out"] = cues["sub_tap"] + 1.30       # + 0.24 s of pop-out: gone 0.61 s before the end
cues = {k: ([round(x, 3) for x in v] if isinstance(v, list) else round(v, 3)) for k, v in cues.items()}
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
for k, v in cues.items():
    print(f'  {k:14s} {v if isinstance(v, list) else format(v, "6.2f")}')
