"""Edit timeline for the Why Do Your Ears RING After a Concert? Short (the 45-50 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.4)  # after "...a chicken.": the chicken beside him bangs its head in time, and the cut
#                                      back to frame 1 (him headbanging by the speaker) for the loop

W, E, ev, find = T.W, T.E, T.ev, T.find
DUR = T.duration
LOOP = round((DUR - 0.40) * 30) / 30   # the last 0.4 s: the concert again, his head on its way down (frame 1)

I_ANS = find("That ring")
I_ST = find("So it cranks")
I_BT = find("So next")

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),      # ONE shot through the answer: close on him headbanging at the front of a gig, his ear by a speaker
                         # cone; the last chord, the lights drop, the ring comes out of his ears; he freezes, pokes an ear;
                         # his head turns to glass and his brain is at an amplifier, cranking the knob to 11
    ("cells", None),     # inside his ear: a row of tiny hair cells with faces; the music's waves slam down and flatten their
                         # hairs; the signal up the nerve thins to a trickle
    ("amp", None),       # the brain at its amplifier: the scope is nearly flat, "who turned it DOWN?"; it cranks the knob
                         # round, the speaker hisses static, the static sharpens into one thin line: the ring
    ("proof", None),     # a dead-silent room (foam wedges on every wall): him and two others on stools; rings pop over
                         # their heads one by one; 94% (1953) and 83% (2008)
    ("fades", None),     # the hair cells again: a day passes, the hairs stand back up... one cell doesn't
    ("chicken", None),   # a chicken, deadpan, beside its own row of hair cells: the gap grows a new one
    ("button", None),    # the gig again: he squeezes in earplugs; the chicken beside him headbangs too
    ("loop", None),      # the picture of frame 1 again (the hook's state at negative time)
]
special = {
    "cells": W("Loud music") - 0.12,
    "amp": W("And your brain") - 0.12,
    "proof": W("Don't believe") - 0.14,
    "fades": W("It usually") - 0.12,
    "chicken": W("Chickens") - 0.16,
    "button": W("So next") - 0.16,
    "loop": LOOP,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You headbang / at a concert,", "and now / your ears", "are / RINGING.",
    "That ring", "probably isn't / your ears...", "it's your / brain,", "cranking / its volume", "to / ELEVEN.",
    "Loud music / flattens", "the tiny / hair cells", "in your ear,", "so less sound / gets through.",
    "And your brain / goes...", "who turned / it DOWN?",
    "So it cranks / the knob...", "and hears / its own", "static.", "That's / the ring.",
    "Don't / believe me?", "Put people", "with normal / hearing", "in a / dead-silent", "room,", "and most / start hearing", "ringing / and buzzing.",
    "It usually / fades", "in a day / or two.", "But hair cells / that die", "never / grow back.",
    "Chickens", "can regrow / theirs.",
    "So next / concert,", "wear / earplugs...", "or become / a chicken.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# yellow = the ring and the reveal, pink = the brain, orange = loud and what it cranks, red = damage and "no",
# green = what recovers or protects, cyan = silence, violet = the static
COLOR = {
    "headbang": O, "concert": O, "ringing": Y,
    "ring": Y, "isn't": R, "brain": PK, "cranking": O, "volume": O, "eleven": R,
    "loud": O, "flattens": R, "hair": PK, "cells": PK, "less": R,
    "down": R,
    "cranks": O, "knob": O, "static": V,
    "normal": G, "dead-silent": C, "most": Y, "buzzing": Y,
    "fades": G, "die": R, "never": R,
    "chickens": Y, "regrow": G, "theirs": G,
    "earplugs": G, "chicken": Y,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

CONCERT_E = E("at a concert", 2)
RING_E = E("are RINGING", 1)
ELEVEN_E = E("to ELEVEN", 1)
THROUGH_E = E("gets through", 1)
DOWN_E = E("it DOWN", 1)
KNOB_E = E("the knob", 1, I_ST)
STATIC_E = E("own static", 1)
RING2_E = E("That's the ring", 2)
BUZZ_E = E("buzzing")
TWO_E = E("or two", 1)
BACK_E = E("grow back", 1)
THEIRS_E = E("theirs")
PLUGS_E = E("earplugs")
CHICK_E = E("a chicken", 1, I_BT)
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
STOP = W("and now") - 0.10                 # the last chord: the lights drop and the music stops dead
BEAT = round(STOP / 4, 4)                  # the band's beat: frame 0 is a downbeat (his head at the bottom of a bang),
#                                            and the fourth beat after it is the last chord
cues = {
    # 1. hook: frame 0 is mid-headbang; the band plays until the last chord
    "beat_p": BEAT,
    "beats": [round(BEAT * k, 3) for k in range(4)],
    "beats_end": [round(DUR - BEAT * k, 3) for k in (3, 2, 1)],   # the band again at the end, on the grid that lands on frame 1
    "you": W("You headbang"),
    "headbang": W("headbang"),
    "concert": W("at a concert", 2),
    "concert_end": CONCERT_E,
    "stop": STOP,
    "now": W("and now", 1),
    "ears": W("your ears", 1),
    "ringing": W("are RINGING", 1),           # the ring comes out of his ears; he freezes mid-bang
    "ringing_end": RING_E,
    "poke": RING_E + 0.12,                    # a finger in his ear, a wiggle
    "thatring": W("That ring"),
    "probably": W("probably"),
    "isnt": W("isn't"),
    "ears2": W("your ears", 1, I_ANS),        # a tag on his ear, crossed out
    "ears2_end": E("your ears", 1, I_ANS),
    "brain1": W("it's your brain", 2),        # his head turns to glass: his brain at an amplifier
    "brain1_end": E("it's your brain", 2),
    "cranking": W("cranking"),                # the brain grabs the knob
    "volume": W("volume"),
    "to": W("to ELEVEN"),
    "eleven": W("ELEVEN"),                    # the knob goes past 10 to 11: a spark, the ring jumps
    "eleven_end": ELEVEN_E,
    "dive": SH["cells"]["start"] - 0.30,      # the camera dives into his ear
    # 2. cells
    "loud": W("Loud music"),
    "music": W("music"),
    "flattens": W("flattens"),                # a wave slams down: the hairs go flat
    "slams": [round(W("flattens") + 0.02, 3), round(W("tiny") + 0.02, 3), round(W("hair cells") + 0.04, 3)],
    "tiny": W("tiny"),
    "haircells": W("hair cells"),             # HAIR CELLS label
    "ear3": W("in your ear", 2),
    "ear3_end": E("in your ear", 2),
    "less": W("less"),                        # the signal up the nerve thins out
    "sound": W("less sound", 1),
    "through": W("gets through", 1),
    "through_end": THROUGH_E,
    # 3. amp
    "brain2": W("And your brain", 2),
    "goes": W("goes"),
    "goes_end": E("goes"),
    "who": W("who turned"),                   # it taps the scope
    "turned": W("turned"),
    "down": W("it DOWN", 1),
    "down_end": DOWN_E,
    "tap": [round(DOWN_E + 0.08, 3), round(DOWN_E + 0.24, 3)],   # two taps on the glass, in the pause
    "so": W("So it cranks"),
    "cranks": W("cranks"),                    # the knob goes round
    "knob": W("the knob", 1, I_ST),
    "knob_end": KNOB_E,
    "hears": W("hears"),
    "own": W("its own"),
    "static": W("own static", 1),             # the speaker hisses: snow on the scope
    "static_end": STATIC_E,
    "thats": W("That's the ring"),
    "ring2": W("That's the ring", 2),         # the snow pulls into one thin line: EEEE
    "ring2_end": RING2_E,
    # 4. proof
    "dont": W("Don't believe"),
    "believe_end": E("believe me", 1),
    "put": W("Put people"),
    "people": W("people"),
    "normal": W("normal"),
    "hearing": W("normal hearing", 1),
    "silent": W("dead-silent"),               # the door shuts: silence
    "room": W("room"),
    "most": W("and most", 1),
    "start": W("start hearing"),
    "rings": [round(W("start hearing") + 0.05, 3), round(W("ringing and") + 0.0, 3), round(W("buzzing") + 0.02, 3)],
    "ringing2": W("ringing and"),
    "buzzing": W("buzzing"),
    "buzzing_end": BUZZ_E,
    # 5. fades
    "usually": W("It usually"),
    "fades": W("fades"),                      # the clock spins: a day goes by
    "day": W("a day", 1),
    "two": W("or two", 1),
    "two_end": TWO_E,
    "but": W("But hair"),
    "hair2": W("But hair", 1),
    "die": W("die"),                          # one cell stays flat: a halo
    "die_end": E("die"),
    "never": W("never"),
    "grow": W("grow back"),
    "back_end": BACK_E,
    # 6. chicken
    "chickens": W("Chickens"),
    "can": W("can regrow"),
    "regrow": W("regrow"),                    # a new cell pops up in the gap
    "theirs": W("theirs"),
    "theirs_end": THEIRS_E,
    # 7. button
    "so2": W("So next"),
    "concert2": W("next concert", 1),
    "wear": W("wear"),
    "earplugs": W("earplugs"),                # the plugs go in: squish, squish
    "earplugs_end": PLUGS_E,
    "or": W("or become"),
    "become": W("become"),
    "chicken2": W("a chicken", 1, I_BT),
    "chicken2_end": CHICK_E,
    "bang": round(DUR - 3 * BEAT, 3),         # the band kicks in again (on the beat grid of frame 1) and they both headbang
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
# v3 stamped a few small words shorter than she says them ("Your" at the head of a take: 0.08 s). The mix check then
# measures a window with no voice in it. Such a word runs on to the next one (after the shots, captions and cues are
# made, so nothing in the picture or the sound moves).
for _i, _w in enumerate(T.words[:-1]):
    _n = T.words[_i + 1]
    if _w["end"] - _w["start"] < 0.11 and 0 < _n["start"] - _w["end"] < 0.09:
        _w["end"] = round(_n["start"] - 0.01, 3)
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first cut: {shots[1]["start"]:.2f} s (7.0 s or later: the opening is one shot through the answer)' if len(shots) > 1 else 'first cut: none')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print(f'subscribe cue: silent, the pill is up {cues["sub_in"]:.2f}-{cues["sub_out"] + 0.24:.2f} s of {T.duration:.2f} s'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print("shots: " + "  ".join(f'{s["id"]} {s["start"]:.2f}' for s in shots))
for k, v in cues.items():
    print(f'  {k:14s} {v if isinstance(v, list) else format(v, "6.2f")}')
