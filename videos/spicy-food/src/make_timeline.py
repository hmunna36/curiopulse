"""Edit timeline for the Why Does Spicy Food BURN? Short (the 30-35 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # after "extra.": he picks a chilli off the heap and bites it (frame 1 again)

W, E, ev, find = T.W, T.E, T.ev, T.find


def move_onset(phrase, block, k=0, thr=-33.0):
    """v3 gives a tag's time to the word after it, so the alignment starts that word late. Move word k of `phrase`
    to the first loud frame of its take (checked on the waveform)."""
    i = find(phrase) + k
    t0 = T.first_loud(T.block(block)["start"], thr=thr)
    if T.ws[i] - t0 > 0.05:
        print(f'  "{T.words[i]["word"]}" starts at {t0:.2f} s (alignment said {T.ws[i]:.2f})')
        T.ws[i] = T.words[i]["start"] = t0
    return i


# "[deadpan] Nothing", "[mischievously] Subscribe..." (the alignment knew only its last syllable) and "[deadpan] And":
# each starts where its take gets loud
move_onset("Nothing is", "answer")
SUB = move_onset("Subscribe", "sub")
move_onset("And you", "button")

LOOP = T.duration - 0.46                       # the chilli is on its way back to his mouth: the picture of frame 1

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                        # the chilli stall: he bites one chilli ... and breathes fire
    ("calm", None),                        # hard cut: no flames, a thermometer in his mouth says 37: "Nothing is burning."
    ("alarm", "That chilli just"),         # inside his mouth: the chilli pulls a fire alarm that stands on his tongue
    ("sensor", "Your tongue has"),         # the tongue in section: heat alarms on the nerve endings; hot soup sets them off
    ("key", "A chilli molecule"),          # no heat now: the chilli's molecule slides into the keyhole and turns
    ("brain", "So your brain"),            # the brain's desk: FIRE on its screen; it pulls the sprinkler lever
    ("sweat", None),                       # the stall: a sprinkler pops out of his head. The subscribe aside plays over this shot
    ("garden", "Birds can't"),             # a garden at dusk: a bird eats chillies off the plant, unbothered; the plant takes aim at a mouse
    ("button", None),                      # the stall: the crosshair is on him; a heap of chillies arrives; he bites one (loop)
]
special = {
    "calm": T.ws[find("Nothing is")] - 0.07,
    "sweat": W("sprinklers") - 0.07,
    "button": T.ws[find("And you")] - 0.07,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "You bite / one chilli", "and your / whole mouth", "is on / FIRE",
    "Nothing / is burning", "That chilli", "just pulled", "your / fire alarm",
    "Your tongue / has sensors", "for / real heat", "like / scalding soup",
    "A chilli / molecule", "fits them", "like / a key",
    "So your brain", "hears / FIRE", "and turns / on the", "sprinklers",
    "Subscribe", "the chilli / meant it",
    "Birds / can't feel it", "Scientists / think", "the plant / aims it", "at / mammals",
    "And you", "ordered / extra",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys): red = the chilli, orange = heat and fire,
# yellow = the key and the reveal, cyan = water, green = the plant
COLOR = {
    "chilli": R, "fire": O, "nothing": G, "burning": O, "pulled": Y, "alarm": R,
    "sensors": Y, "real": O, "heat": O, "scalding": O, "soup": O,
    "molecule": R, "fits": Y, "key": Y,
    "brain": PK, "sprinklers": C,
    "subscribe": R, "meant": Y,
    "birds": Y, "can't": R, "plant": G, "aims": Y, "mammals": R,
    "you": Y, "extra": O,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook
    "bite": 0.0,                                  # the teeth close on frame 1 (the crunch sits in the gap before "You")
    "flush": W("one chilli", 1),                  # the red climbs his face
    "lick": W("and your whole"),                  # the first flames at his lips, smoke out of his ears
    "fire": W("FIRE"),                            # the full blast
    "fire_end": E("FIRE"),
    # 2. calm
    "nothing": T.ws[find("Nothing is")],
    "tick": E("is burning", 1) + 0.04,            # the thermometer's green tick, in the pause
    # 3. alarm
    "strut": W("That chilli just"),
    "pull": W("pulled your"),                     # the chilli yanks the handle
    "ring": E("pulled your") + 0.02,
    "alarm_end": E("fire alarm", 1),
    # 4. sensor
    "sensors": W("sensors"),                      # the label
    "heat": W("real heat"),
    "spoon": W("like scalding") - 0.12,           # the spoon comes down
    "scald": W("scalding"),                       # the alarms go off, one after another
    "soup_end": E("scalding soup", 1),
    # 5. key
    "molecule": W("molecule"),                    # its label
    "fits": W("fits them"),                       # it slides into the keyhole
    "fits_end": E("fits them", 1),
    "turn": W("fits them", 1),                    # it turns (under "them...")
    "click": E("fits them", 1) + 0.05,            # CLICK, in the pause after "them...": the handle drops and the alarm rings,
    "click_snd": E("fits them", 1) + 0.05,        # with no heat on the gauge. "Like a key" is said over the result
    "like": W("like a key"),
    # 6. brain
    "hears": W("hears"),
    "brain_fire": W("hears FIRE", 1),             # FIRE! on its screen
    "lever": W("turns on"),                       # it pulls the lever
    # 7. sweat + the subscribe aside
    "sprinkler": W("sprinklers"),                 # the sprinkler pops out of his head
    "spr_end": E("sprinklers"),
    "meant": W("meant it"),                       # the chilli in his hand winks
    "meant_end": E("meant it", 1),
    # 8. bird
    "birds": W("Birds can't"),
    "bonk": E("feel it", 1) + 0.05,               # the key bounces off the bird's sensor (in the pause)
    # 9. plant
    "sci": W("Scientists"),
    "plant_w": W("the plant aims", 1),            # the plant's eyes open
    "aims": W("aims it"),                         # the crosshair comes out
    "at": W("at mammals"),                        # the mouse bites
    "mammals": W("mammals"),                      # ... and breathes fire; the crosshair locks
    "mammals_end": E("mammals"),
    # 10. button
    "you": W("And you", 1),                       # the crosshair is on him
    "you_end": E("And you", 1),
    "ordered": W("ordered"),                      # the heap lands
    "extra": W("extra"),
    "extra_end": E("extra"),
    "loop": LOOP,
    # more word edges for the sound (what may play in which pause)
    "you_bite": W("You bite"),
    "burning_end": E("is burning", 1),
    "tongue": W("Your tongue has"),
    "heat_end": E("real heat", 1),
    "achilli": W("A chilli molecule"),
    "key_end": E("like a key", 2),
    "so": W("So your brain"),
    "fire2_end": E("hears FIRE", 1),
    "and_turns": W("and turns"),
    "sub_w": T.ws[SUB],
    "the_chilli": W("the chilli meant"),
    "feel_end": E("feel it", 1),
    "it_end": E("aims it", 1),
    "and": T.ws[find("And you")],
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff.
# "Subscribe..." is drawn out and the alignment knew only its last syllable: the click waits for the word to end.
cues["sub_in"] = max(0.0, T.ws[SUB] - 0.30)
cues["sub_tap"] = max(T.we[SUB], T.ws[SUB] + 0.80) + 0.10   # in the "..." after the word, so the click never sits on a word
cues["sub_out"] = cues["sub_tap"] + 1.30
cues = {k: round(v, 3) for k, v in cues.items()}
# v3 ended "You" at 0.23 s while she says it until 0.36 (the waveform): lengthen the word's window. After the shots,
# captions and cues are made, so the picture and the mix do not move.
_y = find("You bite")
T.we[_y] = T.words[_y]["end"] = round(min(T.ws[_y + 1] - 0.01, T.ws[_y] + 0.21), 3)
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[SUB]:.2f} s = {100 * T.ws[SUB] / T.duration:.0f} % of the runtime (must be 50-70 %); tap {cues["sub_tap"]:.2f}, next word {T.ws[SUB + 1]:.2f}')
for k, v in cues.items():
    print(f'  {k:12s} {v:6.2f}')
