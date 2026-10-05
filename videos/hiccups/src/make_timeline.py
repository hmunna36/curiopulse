"""Edit timeline for the Why Do We Get HICCUPS? Short (the 30-35 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.36)  # after "tadpole.": a croak, the last hiccup, and the glass goes back up to his mouth (frame 1 again)

W, E, ev, find = T.W, T.E, T.ev, T.find


def move_onset(phrase, block, k=0):
    """v3 gives a tag's time to the word after it, so the alignment starts that word late. Move word k of `phrase`
    to the first loud frame of its take (checked on the waveform)."""
    i = find(phrase) + k
    t0 = T.first_loud(T.block(block)["start"], thr=-33.0)
    if T.ws[i] - t0 > 0.05:
        print(f'  "{T.words[i]["word"]}" starts at {t0:.2f} s (alignment said {T.ws[i]:.2f})')
        T.ws[i] = T.words[i]["start"] = t0
    return i


# "[deadpan] Smooth.", "[mischievously] Subscribe...", "[deadpan] So": each starts where its take gets loud
# ("Smooth" opens on its quiet "S": the waveform is at -27 dB from the take's first frame)
move_onset("Smooth", "answer")
move_onset("Subscribe", "sub")
move_onset("So you're not", "button")

HIC1 = E("and") + 0.07                         # the hiccup that interrupts her
HIC2 = E("Air hits the door", 3) + 0.10        # the proof: he does it again
HIC3 = E("part tadpole", 1) + 0.32             # ... and once more, as a tadpole (after the croak)
LOOP = T.duration - 0.40                       # the glass is back at his mouth: the picture of frame 1

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                        # the restaurant: he chugs his soda across the table from his date ... HIC!
    ("smooth", None),                      # close on his frozen face, the candle he just blew out: "Smooth."
    ("door", "Your throat just"),          # into his throat: a pair of doors slams shut
    ("fizz", "Fizz swells"),               # the body in section: the stomach balloons and pokes the muscle under the lungs
    ("jerk", "It JERKS"),                  # the muscle snaps down, air rushes in, the vocal cords snap shut; "Air hits the door."
    ("again", None),                       # the table: HIC! again. The subscribe aside plays over this shot (a tadpole in his glass)
    ("pond", "Why One idea"),              # into the glass, into a pond: tadpoles
    ("gulp", "They gulp water"),           # a tadpole in section: water in, out over the gills, the same door shut
    ("button", None),                      # the table: he is mortified ... and part tadpole. HIC. The glass goes back up (loop)
]
special = {
    "smooth": T.ws[find("Smooth")] - 0.07,
    "again": HIC2 - 0.07,
    "button": T.ws[find("So you're not")] - 0.07,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "You chug / a soda", "on a / first date", "and",
    "Smooth", "Your throat", "just slammed / a door", "on your / own breath",
    "Fizz swells / your stomach", "poking your", "breathing / muscle", "It JERKS", "and your / vocal cords", "snap SHUT",
    "Air hits / the door",
    "Subscribe", "it gets / slimy",
    "Why", "One idea", "we got it / from tadpoles", "They gulp / water", "for their / gills", "with that / same door", "shut",
    "So you're / not nervous", "You're", "part / tadpole",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys): orange = the soda, cyan = air and water,
# yellow = the door, red = the muscle, green = tadpoles
COLOR = {
    "chug": O, "soda": O, "date": PK,
    "smooth": Y, "throat": O, "slammed": R, "door": Y, "breath": C,
    "fizz": O, "stomach": PK, "breathing": R, "muscle": R, "jerks": Y, "vocal": V, "cords": V, "shut": R,
    "air": C,
    "subscribe": R, "slimy": G,
    "why": Y, "idea": C, "tadpoles": G, "gulp": C, "water": C, "gills": PK, "same": Y,
    "nervous": R, "part": G, "tadpole": G,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

i_smooth = find("Smooth")
i_throat = find("Your throat just")
i_fizz = find("Fizz swells")
i_jerks = find("It JERKS")
i_air = find("Air hits the door")
i_sub = find("Subscribe")
i_why = find("Why One idea")
i_gulp = find("They gulp water")
i_same = find("with that same door shut")
i_so = find("So you're not")
i_part = find("part tadpole")
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # hook
    "chug": W("chug"), "soda": W("soda"), "soda_end": E("soda"), "first": W("first date"), "date": W("date"), "date_end": E("date"),
    "and": W("and"), "and_end": E("and"),
    "lower": W("and") - 0.04,                    # the glass comes down: aah ...
    "aah": E("date") + 0.02,
    "hic1": HIC1,
    # smooth
    "smooth": T.ws[i_smooth], "smooth_end": T.we[i_smooth],
    # door
    "throat": T.ws[i_throat + 1], "just": T.ws[i_throat + 2], "slammed": T.ws[i_throat + 3], "slammed_end": T.we[i_throat + 3],
    "door1": T.ws[i_throat + 5], "door1_end": T.we[i_throat + 5], "onyour": T.ws[i_throat + 6], "own": T.ws[i_throat + 8],
    "breath": T.ws[i_throat + 9], "breath_end": T.we[i_throat + 9],
    "slam1": T.ws[i_throat + 3] + 0.10,          # the doors slam on "slammed"
    "bump1": T.we[i_throat + 9] + 0.04,          # his breath runs into them (in the pause after "breath.")
    "sign": T.we[i_throat + 5] + 0.06,           # a CLOSED sign drops onto the doors (the pause after "door...")
    # fizz
    "fizz": T.ws[i_fizz], "swells": T.ws[i_fizz + 1], "stomach": T.ws[i_fizz + 3], "stomach_end": T.we[i_fizz + 3],
    "poking": T.ws[i_fizz + 4], "poking_end": T.we[i_fizz + 4], "breathing": T.ws[i_fizz + 6], "muscle": T.ws[i_fizz + 7],
    "muscle_end": T.we[i_fizz + 7],
    "poke1": T.ws[i_fizz + 4] + 0.06, "poke2": T.ws[i_fizz + 6] + 0.02, "poke3": T.we[i_fizz + 7] + 0.05,
    "grunt": T.we[i_fizz + 7] + 0.17,            # the muscle has had enough (the pause after "muscle.")
    # jerk
    "it": T.ws[i_jerks], "jerks": T.ws[i_jerks + 1], "jerks_end": T.we[i_jerks + 1], "andyour": T.ws[i_jerks + 2],
    "vocal": T.ws[i_jerks + 4], "cords": T.ws[i_jerks + 5], "cords_end": T.we[i_jerks + 5], "snap": T.ws[i_jerks + 6],
    "shut": T.ws[i_jerks + 7], "shut_end": T.we[i_jerks + 7],
    "jerk": T.ws[i_jerks + 1] + 0.05,            # the muscle snaps down
    "slam2": T.ws[i_jerks + 7] + 0.04,           # the cords snap shut on "SHUT"
    "air": T.ws[i_air], "hits": T.ws[i_air + 1], "door2": T.ws[i_air + 3], "door2_end": T.we[i_air + 3],
    "bump2": T.ws[i_air + 1] + 0.10,             # the air hits them
    "hic2": HIC2,
    # again (the subscribe aside)
    "subscribe": T.ws[i_sub], "subscribe_end": T.we[i_sub], "itgets": T.ws[i_sub + 1], "slimy": T.ws[i_sub + 3],
    "slimy_end": T.we[i_sub + 3],
    "peek": T.ws[i_sub + 1] + 0.08,              # something comes up for a look in his glass (under "it gets")
    "squelch": T.we[i_sub + 3] + 0.03,           # ... and is slimy (the pause after "slimy.")
    # pond
    "why": T.ws[i_why], "why_end": T.we[i_why], "one": T.ws[i_why + 1], "idea": T.ws[i_why + 2], "idea_end": T.we[i_why + 2],
    "wegot": T.ws[i_why + 3], "from": T.ws[i_why + 6], "tadpoles": T.ws[i_why + 7], "tadpoles_end": T.we[i_why + 7],
    "dive": T.ws[i_why] - 0.02,
    "hicpair": T.we[i_why + 7] + 0.10,           # the tadpole and the man in the frame hiccup together
    # gulp
    "they": T.ws[i_gulp], "gulp": T.ws[i_gulp + 1], "water": T.ws[i_gulp + 2], "fortheir": T.ws[i_gulp + 3],
    "gills": T.ws[i_gulp + 5], "gills_end": T.we[i_gulp + 5], "with": T.ws[i_same], "same": T.ws[i_same + 2],
    "door3": T.ws[i_same + 3], "shut2": T.ws[i_same + 4], "shut2_end": T.we[i_same + 4],
    "gulp1": T.ws[i_gulp + 1] - 0.02,            # the mouth opens, water goes in ...
    "squirt1": T.ws[i_gulp + 5] - 0.12,          # ... and out over the gills
    "knock": T.ws[i_same + 4] + 0.05,            # some of it runs into the shut door
    "tadhic": T.we[i_same + 4] + 0.12,           # the tadpole hiccups a bubble (the pause before the button)
    # button
    "so": T.ws[i_so], "nervous": T.ws[i_so + 3], "nervous_end": T.we[i_so + 3], "youre": T.ws[i_so + 4],
    "youre_end": T.we[i_so + 4], "part": T.ws[i_part], "tadpole": T.ws[i_part + 1], "tadpole_end": T.we[i_part + 1],
    "poof": T.ws[i_part] - 0.20,                 # he is a tadpole (the pause after "You're...")
    "croak": T.we[i_part + 1] + 0.06,            # ribbit (after "tadpole.")
    "phew": T.we[i_so + 3] + 0.03,               # he breathes out (the pause after "nervous.")
    "hic3": HIC3,
    "unpoof": HIC3 + 0.22,                       # the hiccup pops him back
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff
cues["sub_in"] = max(0.0, T.ws[i_sub] - 0.30)
cues["sub_tap"] = T.we[i_sub] + 0.10          # in the "..." after the word, so the click never sits on a word
cues["sub_out"] = cues["sub_tap"] + 1.30
# the "and" caption leaves when the hiccup lands
for _c in caps:
    if _c["lines"][0][0]["t"] == "AND" and len(_c["lines"]) == 1 and len(_c["lines"][0]) == 1 and _c["start"] < 5:
        _c["end"] = round(min(_c["end"], HIC1 + 0.02), 3)
# "You" (the first word): the alignment ends it at 0.21 s, but she is still saying it until the dip before "chug".
# Moved after the shots, captions and cues were computed: only the per-word windows that the QA measures use it.
if T.ws[1] - T.we[0] > 0.05:
    T.words[0]["end"] = round(T.ws[1] - 0.01, 3)
T.write(shots, caps, cues)
for k in ("hic1", "smooth", "slam1", "sign", "bump1", "poke1", "poke2", "poke3", "jerk", "slam2", "bump2", "hic2", "sub_in", "sub_tap", "sub_out",
          "peek", "squelch", "dive", "hicpair", "gulp1", "squirt1", "knock", "tadhic", "phew", "poof", "croak", "hic3", "unpoof", "loop"):
    print(f"  {k:10s} {cues[k]:6.2f}")
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[i_sub]:.2f} s = {100 * T.ws[i_sub] / T.duration:.0f} % of the runtime (must be 50-70 %)')
