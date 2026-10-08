"""Edit timeline for the How Do Fireflies GLOW? Short (the 45-50 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.5)  # after "all night.": she gives up on the jar, he lifts the lid (the picture of frame 1)

W, E, ev, find = T.W, T.E, T.ev, T.find


def move_onset(phrase, block, k=0, thr=-33.0):
    """v3 gives a tag's time to the word after it (or keeps only the last syllable of a drawn-out word), so the
    alignment starts that word late. Move word k of `phrase` to the first loud frame of its take (the waveform)."""
    i = find(phrase) + k
    t0 = T.first_loud(T.block(block)["start"], thr=thr)
    if T.ws[i] - t0 > 0.05:
        print(f'  "{T.words[i]["word"]}" starts at {t0:.2f} s (alignment said {T.ws[i]:.2f})')
        T.ws[i] = T.words[i]["start"] = t0
    return i


# "[deadpan] That's" and the drawn-out "[mischievously] Subscribe..." start where their takes get loud
move_onset("That's a glow", "answer")
SUB = move_onset("Subscribe", "sub")

DUR = T.duration
LOOP = DUR - 0.45                          # he lifts the lid again: the last half second runs into frame 1

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                        # close: the lid goes on the jar, the firefly lights, his hands glow
    ("stick", None),                       # the answer: the firefly next to a glow stick; the stick grows wings
    ("snap", "Same trick"),                # the stick bends and snaps: two liquids mix and light up ("Two chemicals")
    ("tail", "in its tail"),               # inside its tail: fuel, enzyme, oxygen arriving, light
    ("cold", "No flame"),                  # no flame, a thermometer that stays put: COLD LIGHT
    ("bulb", "A light bulb"),              # the same bug with a light bulb for a tail: cooked
    ("blink", "The blinking"),             # it blinks at us
    ("valve", "Scientists think"),         # inside again: a tap on the air pipe
    ("code", "And it's a code"),           # the meadow: three species, three patterns
    ("reply", "he flashes"),               # he flashes, she flashes back; the aside; the lights go out
    ("fake", "Because some females"),      # a bigger female behind a mask copies the reply
    ("date", "He flies down"),             # he arrives with flowers; she has cutlery behind her back
    ("eat", None),                         # the mask drops. CHOMP
    ("why", "Why"),                        # she picks her teeth
    ("spider", "He tastes awful"),         # a spider tries one of the males: yuck
    ("armour", None),                      # the same spider tries her: yuck again
    ("button", "So that jar"),             # the jar again: she taps on the glass; he lifts the lid (the loop)
]
special = {
    "stick": T.ws[find("That's a glow")] - 0.07,
    "eat": W("and she eats") - 0.07,
    "armour": W("Now") - 0.30,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-4 words a line, "/" splits two lines.
CHUNKS = [
    "You catch / a firefly", "in a jar", "and your / whole hand", "glows",
    "That's a / glow stick", "with wings",
    "Same trick", "Two / chemicals", "in its tail", "meet oxygen", "and glow",
    "No flame", "Almost / no heat", "A light bulb", "would / cook him",
    "The / blinking", "Scientists / think", "he cuts / the oxygen",
    "And it's / a code", "Every species", "has its own", "he flashes", "she flashes / back",
    "Subscribe", "it gets / dark",
    "Because / some females", "fake", "another / species' answer", "He flies down", "for a date",
    "and she", "eats him",
    "Why", "He tastes / awful", "to spiders", "Now", "so does she",
    "So that jar", "It's the / safest date", "he's had / all night",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys): green-yellow = the light, cyan = air and cold,
# orange = heat, pink = the romance, red = what goes wrong, violet = the science words
COLOR = {
    "firefly": Y, "jar": C, "hand": O, "glows": G,
    "glow": G, "stick": G, "wings": Y,
    "trick": Y, "chemicals": V, "tail": Y, "oxygen": C,
    "flame": R, "heat": O, "bulb": Y, "cook": R,
    "blinking": Y, "scientists": V, "cuts": R,
    "code": Y, "species": V, "own": Y, "flashes": G, "back": PK,
    "subscribe": R, "dark": V,
    "females": PK, "fake": R, "species'": V, "answer": G, "date": PK,
    "eats": R,
    "why": Y, "awful": R, "spiders": V, "she": PK,
    "safest": G, "night": B,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
SH = {s["id"]: s for s in shots}

THATS = T.ws[find("That's a glow")]
WITH = W("with wings")
WINGS_E = E("with wings", 1)
COOK_E = E("cook him", 1)
EATS = W("eats him")
HIM_E = E("eats him", 1)
SPID_E = E("to spiders", 1)
SHE_E = E("so does she", 2)
NIGHT_E = E("all night", 1)
I_HE = find("he flashes")
I_SHE = find("she flashes back")
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: the lid goes on, the bug lights, the hands glow
    "clap": 0.05,                           # the lid lands (frame 2: the first thing that happens, before "You")
    "firefly": W("firefly"),
    "jar": W("in a jar", 2),
    "lit": W("in a jar", 2) + 0.12,         # the firefly's lamp comes on inside the glass
    "hand": W("whole hand", 1),
    "glows": W("glows"),                    # ... and his hands and face light up with it
    "glows_end": E("glows"),
    "blinks": [E("glows") + 0.10, E("glows") + 0.30],   # two little blinks at him, in the pause
    # 2. stick: the answer
    "thats": THATS,
    "stick": W("glow stick", 1),            # a glow stick comes up next to the jar
    "stick_end": E("glow stick", 1),
    "with": WITH,
    "wings": W("with wings", 1),            # ... and grows wings
    "wings_end": WINGS_E,
    "buzz": WINGS_E + 0.04,                 # its little buzz, in the pause
    # 3. snap: how a glow stick works
    "same": W("Same trick"),
    "trick": W("Same trick", 1),
    "crack": E("Same trick", 1) + 0.04,     # the snap, after "trick."
    # 4. tail: fuel + enzyme + oxygen = light
    "two": W("Two chemicals"),
    "chem": W("Two chemicals", 1),
    "in_its": W("in its tail"),
    "tailw": W("in its tail", 2),
    "meet": W("meet oxygen"),
    "oxygen": W("meet oxygen", 1),          # the oxygen arrives down the air pipe
    "oxygen_end": E("meet oxygen", 1),
    "and_glow": W("and glow"),
    "glow": W("and glow", 1),               # every meeting is a spark
    "glow_end": E("and glow", 1),
    # 5. cold
    "no_flame": W("No flame"),
    "flame": W("No flame", 1),
    "flame_end": E("No flame", 1),
    "cross": E("No flame", 1) + 0.05,       # the flame is crossed out (its buzzer in the pause)
    "almost": W("Almost no heat"),
    "heat": W("Almost no heat", 2),
    "heat_end": E("Almost no heat", 2),
    "cool": E("Almost no heat", 2) + 0.04,  # the thermometer's little ping, in the pause
    # 6. bulb
    "a_light": W("A light bulb"),
    "bulbw": W("A light bulb", 2),
    "would": W("would cook"),
    "cook": W("would cook", 1),
    "cook_end": COOK_E,
    "ding": COOK_E + 0.08,                  # done: the ding, in the pause
    # 7. blink
    "the_blink": W("The blinking"),
    "blinking": W("The blinking", 1),
    "blinking_end": E("The blinking", 1),
    "pips": [E("The blinking", 1) + 0.05, E("The blinking", 1) + 0.21],   # two audible blinks, in the pause
    "sci": W("Scientists"),
    "think": W("Scientists think", 1),
    "he_cuts": W("he cuts"),
    "cuts": W("he cuts", 1),                # the tap on the air pipe turns: the lamp goes out
    "the_oxy": W("cuts the oxygen", 2),
    "oxy2_end": E("cuts the oxygen", 2),
    "reopen": E("cuts the oxygen", 2) + 0.06,   # ... and on again, in the pause
    # 8. code
    "and_its": W("And it's a code"),
    "code": W("And it's a code", 3),
    "code_end": E("And it's a code", 3),
    "every": W("Every species"),
    "species": W("Every species", 1),
    "has": W("has its own"),
    "own": W("has its own", 2),
    "own_end": E("has its own", 2),
    # 9. reply + the aside
    "he": T.ws[I_HE],
    "flashes1": T.ws[I_HE + 1],
    "flashes1_end": T.we[I_HE + 1],
    "hisflash": [T.we[I_HE + 1] + 0.02, T.we[I_HE + 1] + 0.16],   # his two flashes, in the pause after "flashes,"
    "she": T.ws[I_SHE],
    "flashes2": T.ws[I_SHE + 1],
    "back": T.ws[I_SHE + 2],
    "back_end": T.we[I_SHE + 2],
    "herflash": T.we[I_SHE + 2] + 0.04,     # her one flash back, in the pause after "back."
    "heart": T.we[I_SHE + 2] + 0.24,        # ... and a heart
    "sub_w": T.ws[SUB],
    "it_gets": W("it gets"),
    "dark": W("it gets dark", 2),           # every light in the meadow goes out
    "dark_end": E("it gets dark", 2),
    # 10. fake
    "because": W("Because some"),
    "females": W("some females", 1),
    "fake": W("fake"),                      # the mask slips: there is someone bigger behind it
    "fake_end": E("fake"),
    "another": W("another species'"),
    "answer": W("answer"),
    "answer_end": E("answer"),
    "fakeflash": E("answer") + 0.02,        # ... and she gives the same one flash, in the pause
    # 11. date
    "he_flies": W("He flies down"),
    "flies": W("He flies down", 1),
    "down": W("He flies down", 2),
    "date": W("for a date", 2),
    "date_end": E("for a date", 2),
    # 12. eat
    "and_she": W("and she eats"),
    "eats": EATS,                           # CHOMP (the picture); its crunch is in the pause after "him."
    "him_end": HIM_E,
    "crunch": HIM_E + 0.05,
    "burp": HIM_E + 0.24,                   # a small glowing burp
    # 13. why: a spider tries one
    "why": W("Why"),
    "why_end": E("Why"),
    "he_tastes": W("He tastes awful"),
    "tastes": W("He tastes awful", 1),      # the spider licks him
    "tastes_end": E("He tastes awful", 1),
    "slurp": E("He tastes awful", 1) + 0.03,
    "awful": W("He tastes awful", 2),       # ... and goes green
    "awful_end": E("He tastes awful", 2),
    "spiders": W("to spiders", 1),
    "spiders_end": SPID_E,
    "yuck": SPID_E + 0.05,                  # ptooey, in the pause
    # 14. armour
    "now": W("Now"),
    "now_end": E("Now"),
    "so_does": W("so does she"),
    "she2": W("so does she", 2),            # the spider backs away from her
    "she2_end": SHE_E,
    "nope": SHE_E + 0.06,
    # 15. button
    "so_that": W("So that jar"),
    "jar2": W("So that jar", 2),
    "jar2_end": E("So that jar", 2),
    "taps": [E("So that jar", 2) + 0.10, E("So that jar", 2) + 0.30, E("So that jar", 2) + 0.50],   # her fork on the glass, in the pause
    "its_the": W("It's the safest"),
    "safest": W("It's the safest", 2),
    "date2": W("safest date", 1),
    "night": W("all night", 1),
    "night_end": NIGHT_E,
    "huff": NIGHT_E + 0.12,                 # she gives up and leaves
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff.
# "Subscribe..." is drawn out and the alignment knew only its last syllable: the click waits for the word to end.
cues["sub_in"] = max(0.0, T.ws[SUB] - 0.30)
cues["sub_tap"] = max(T.we[SUB], T.ws[SUB] + 0.80) + 0.10   # in the "..." after the word, so the click never sits on a word
cues["sub_out"] = cues["sub_tap"] + 1.30
cues = {k: ([round(x, 3) for x in v] if isinstance(v, list) else round(v, 3)) for k, v in cues.items()}
# v3 stamped "You" at 0.10-0.18 s; she says it from 0.15 s (the waveform) until "catch": move the word's window. After
# the shots, captions and cues are made, so the picture and the mix do not move.
_y = find("You catch")
T.ws[_y] = T.words[_y]["start"] = T.first_loud(T.block("hook")["start"], thr=-30.0)
T.we[_y] = T.words[_y]["end"] = round(max(T.ws[_y] + 0.06, T.ws[_y + 1] - 0.01), 3)
print(f'  "You" is said {T.ws[_y]:.2f}-{T.we[_y]:.2f} s')
# ... and it stamped "Two" in the silence before it (the snap is there): the word starts where the take gets loud again
_t = find("Two chemicals")
T.ws[_t] = T.words[_t]["start"] = min(T.we[_t] - 0.05, T.first_loud(T.ws[_t] + 0.02, thr=-33.0))
print(f'  "Two" is said from {T.ws[_t]:.2f} s')
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[SUB]:.2f} s = {100 * T.ws[SUB] / T.duration:.0f} % of the runtime (must be 50-70 %); tap {cues["sub_tap"]:.2f}, next word {T.ws[SUB + 1]:.2f}')
for k, v in cues.items():
    print(f'  {k:12s} {v if isinstance(v, list) else format(v, "6.2f")}')
