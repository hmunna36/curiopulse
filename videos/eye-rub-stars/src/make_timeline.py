"""Edit timeline for the Why Do You See STARS When You Rub Your Eyes? Short (the 45-50 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.5)  # after "...an upgrade.": he yawns, and his fists go back up to his eyes (frame 1)

W, E, ev, find = T.W, T.E, T.ev, T.find
DUR = T.duration
LOOP = round((DUR - 0.40) * 30) / 30   # the last 0.4 s: the desk again, his fists on their way to his eyes (frame 1)

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),      # ONE shot through the answer: close on him grinding his fists into his eyes at his desk, the dark
                         # fills with stars; light bounces off his fists (none gets in); his head turns to glass: two
                         # eyeballs, two cords, and a brain whose phone rings; the camera dives into an eyeball
    ("sensors", None),   # the eyeball in section: the back wall is lined with light sensors that shout LIGHT!
    ("squeeze", None),   # the lid shuts, a knuckle presses: the eyeball squashes, the sensors are squished and shout anyway
    ("brain", None),     # the other end of the line: the brain on the phone in the dark; it shrugs and paints fireworks
    ("newton", None),    # a candlelit study in the 1660s: he is Isaac Newton, with a bodkin, at the corner of his eye
    ("dont", None),      # the reaction cut: DON'T
    ("astro", None),     # asleep in orbit, an eye mask on: cosmic rays go through his head, and the phone rings again
    ("button", None),    # the desk: one gentle knuckle, a few small stars, and a tag on his eye
    ("loop", None),      # the picture of frame 1 again (the hook's state at negative time)
]
special = {
    "sensors": W("The back") - 0.10,
    "squeeze": W("Rub your eye") - 0.12,
    "brain": W("Your brain can't") - 0.10,
    "newton": W("Isaac") - 0.11,
    "dont": W("Do not") - 0.13,
    "astro": W("Astronauts") - 0.12,
    "button": W("So rub") - 0.16,
    "loop": LOOP,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You rub / your eyes", "and the / darkness", "fills with", "stars.",
    "Relax,", "no light / got in,", "your / eyeball", "just / pocket-dialed", "your / brain.",
    "The back / of your eye", "is lined / with", "light / sensors", "that know", "one word:", "LIGHT!",
    "Rub / your eye,", "they get / squished...", "and they / shout it", "anyway.",
    "Your brain", "can't / check,", "so it / paints you", "fireworks.",
    "Isaac / Newton", "tested / this", "by sliding / a needle", "behind / his own", "eyeball...", "and saw", "colored / rings.",
    "Do not", "do that.",
    "Astronauts", "see flashes / like this", "with their / eyes shut...", "probably", "cosmic / rays,", "zipping / through", "their / eyeballs", "and making", "the same / call.",
    "So rub / gently...", "that / phone", "never gets", "an / upgrade.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea: yellow = light and the reveal, violet = the stars and the joke (the phone),
# red = "no" and the squish, orange = the sensors and what fires, cyan = the calm ones
COLOR = {
    "rub": O, "darkness": B, "stars": Y,
    "no": R, "eyeball": C, "pocket-dialed": V, "brain": PK,
    "back": C, "sensors": O, "one": Y, "light": Y,
    "squished": R, "shout": O, "anyway": Y,
    "can't": R, "paints": V, "fireworks": Y,
    "newton": G, "needle": R, "behind": R, "colored": V, "rings": V,
    "not": R, "that": R,
    "astronauts": C, "shut": B, "cosmic": V, "rays": V, "eyeballs": C, "same": Y, "call": V,
    "gently": G, "phone": V, "never": R, "upgrade": Y,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

I_ANS = find("Relax")
I_SQ = find("Rub your eye")
I_BR = find("Your brain can't")
I_AS = find("Astronauts")
I_BT = find("So rub")
STARS_E = E("stars")
BRAIN_E = E("your brain", 1, I_ANS)
LIGHT_E = E("word LIGHT", 1)
ANYWAY_E = E("anyway")
FIRE_E = E("fireworks")
BALL_E = E("own eyeball", 1)
RINGS_E = E("rings")
THAT_E = E("do that", 1)
SHUT_E = E("shut")
CALL_E = E("call")
GENTLY_E = E("gently")
UP_E = E("upgrade")
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: frame 0 is the rub
    "rub": W("rub"),
    "eyes": W("eyes"),
    "dark": W("darkness"),                    # the room goes out
    "fills": W("fills"),                      # the first stars spread
    "stars": W("stars"),                      # ... and burst
    "stars_end": STARS_E,
    # the answer, over the same shot
    "relax": W("Relax"),
    "relax_end": E("Relax"),
    "nolight": W("no light"),                 # rays from the lamp reach his fists and bounce off
    "light1": W("no light", 1),
    "gotin": W("got in"),
    "gotin_end": E("got in", 1),
    "eyeball": W("your eyeball") ,            # his head turns to glass: two eyeballs under his fists
    "eyeball1": W("your eyeball", 1),
    "just": W("just"),
    "dialed": W("pocket-dialed"),             # the call goes up the cord
    "dialed_end": E("pocket-dialed"),
    "brain0": W("your brain", 1, I_ANS),      # the brain at the top of his skull
    "brain0_end": BRAIN_E,
    "ring1": BRAIN_E + 0.06,                  # the phone rings, alone in the pause
    "ring2": BRAIN_E + 0.30,
    "dive": SH["sensors"]["start"] - 0.34,    # the camera goes into his eyeball
    # 2. sensors: the eyeball in section
    "back": W("The back", 1),
    "eye2": W("of your eye", 2),
    "lined": W("lined"),                      # the sensors pop up along the back wall, one by one
    "light2": W("light sensors"),             # a ray comes in through the pupil
    "sensors": W("sensors"),
    "sensors_end": E("sensors"),
    "know": W("that know"),
    "one": W("one word"),                     # they take a breath
    "word": W("word"),
    "word_end": E("word"),
    "LIGHT": W("word LIGHT", 1),              # and all shout it (anchored: the first "light" is in the answer line)
    "LIGHT_end": LIGHT_E,
    "echo": [round(LIGHT_E + 0.10, 3), round(LIGHT_E + 0.28, 3)],   # two small ones, late, in the pause
    # 3. squeeze
    "rub2": W("Rub your eye"),                # the lid shuts and the knuckle arrives
    "eye3": W("Rub your eye", 2),
    "eye3_end": E("Rub your eye", 2),
    "they": W("they get"),
    "squished": W("squished"),                # flat against the wall
    "squished_end": E("squished"),
    "and2": W("and they shout"),
    "shout": W("shout"),                      # ... and they go off anyway, in the dark
    "anyway": W("anyway"),
    "anyway_end": ANYWAY_E,
    "chorus": [round(ANYWAY_E + 0.08 + 0.13 * i, 3) for i in range(3)],
    # 4. brain
    "brain": W("Your brain can't", 1),
    "cant": W("can't"),                       # it looks about: no way to check
    "check": W("check"),
    "check_end": E("check"),
    "so": W("so it"),
    "paints": W("paints"),                    # the brush goes up
    "fireworks": W("fireworks"),              # the screen fills
    "fireworks_end": FIRE_E,
    "pops": [round(FIRE_E + 0.10 + 0.19 * i, 3) for i in range(3)],
    # 5. newton
    "isaac": W("Isaac"),
    "newton": W("Newton"),
    "newton_end": E("Newton"),
    "tested": W("tested"),
    "this_end": E("tested this", 1),
    "by": W("by sliding"),
    "sliding": W("sliding"),                  # the bodkin goes to the corner of his eye
    "needle": W("needle"),
    "needle_end": E("needle"),
    "behind": W("behind"),
    "own": W("own"),
    "eyeball4": W("own eyeball", 1),
    "eyeball4_end": BALL_E,
    "poke": BALL_E + 0.12,                    # a small squeak, alone in the pause
    "saw": W("saw"),
    "colored": W("colored"),                  # rings, one inside the other
    "rings": W("rings"),
    "rings_end": RINGS_E,
    # 6. dont
    "donot": W("Do not"),
    "not": W("Do not", 1),
    "dothat": W("do that"),
    "that": W("do that", 1),                  # the stamp lands
    "that_end": THAT_E,
    # 7. astro
    "astro": W("Astronauts"),
    "astro_end": E("Astronauts"),
    "flashes": W("flashes"),                  # a flash on his sleep mask
    "likethis": W("like this"),
    "with": W("with their"),
    "shut": W("shut"),
    "shut_end": SHUT_E,
    "zip1": SHUT_E + 0.05,                    # the first ray goes through, alone in the pause
    "probably": W("probably"),
    "cosmic": W("cosmic"),
    "rays": W("rays"),
    "rays_end": E("rays"),
    "zip2": E("rays") + 0.06,
    "zipping": W("zipping"),
    "through": W("through"),
    "eyeballs": W("their eyeballs", 1),       # his head is glass again: a ray through an eyeball
    "eyeballs_end": E("their eyeballs", 1),
    "making": W("making"),
    "same": W("same"),
    "call": W("call"),                        # the phone rings again
    "call_end": CALL_E,
    "ring3": CALL_E + 0.08,
    "ring4": CALL_E + 0.32,
    # 8. button
    "so2": W("So rub"),
    "rub3": W("So rub", 1),
    "gently": W("gently"),                    # one knuckle, softly
    "gently_end": GENTLY_E,
    "twinkle": GENTLY_E + 0.12,               # three small stars, in the pause
    "thatphone": W("that phone"),
    "phone": W("that phone", 1),
    "never": W("never"),                      # the tag on his eye
    "gets": W("gets"),
    "upgrade": W("upgrade"),
    "upgrade_end": UP_E,
    "yawn": UP_E + 0.16,                      # he yawns, and his fists go back up
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
