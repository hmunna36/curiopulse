"""Edit timeline for the What Happens When You CRACK Your Knuckles? Short (the 30-35 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.0)  # after "Sorry, Mom.": he locks his fingers again (the picture of frame 1)

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


# "[deadpan] No", "[curious] Stretch", "[mischievously] Subscribe..." (the alignment knows only its last syllable)
# and "[deadpan] Sorry": each starts where its take gets loud
move_onset("No bones", "answer")
move_onset("Stretch it", "pull")
SUB = move_onset("Subscribe", "sub")
move_onset("Sorry", "button")

LOOP = T.duration - 0.50                       # his hands come back up and lock: the picture of frame 1

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                        # his room at night, close: he locks his fingers and pushes; the knuckles tick
    ("crack", None),                       # CRACK! The camera jumps back; Mom is in the doorway; "No bones were harmed."
    ("soda", "Your knuckle just"),         # inside the x-ray: one knuckle, and a can of soda in the joint. Psst
    ("fluid", "Each knuckle is"),          # the joint in section: a sealed bag of slippery fluid, with gas dissolved in it
    ("pull", None),                        # the bones are pulled apart, the pressure gauge falls, POP: a bubble
    ("mri", "Scientists caught"),          # the experiment: his hand in a scanner, a cable pulling one finger
    ("scan", None),                        # the scan and the sound, side by side: the bubble arrives on the crack. The aside starts here
    ("doctor", "one doctor"),              # the doctor who cracked one hand only; fifty years go by. The aside ends over this shot
    ("xray", "Arthritis"),                 # two x-rays on a lightbox: LEFT and RIGHT, both fine
    ("button", None),                      # his room: Mom, arms crossed. "Sorry, Mom." He locks his fingers again (the loop)
]
special = {
    "crack": W("CRACK") - 0.07,
    "pull": T.ws[find("Stretch it")] - 0.07,
    "scan": W("right on") - 0.25,
    "button": E("Neither hand", 1) + 0.12,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "You lock / your fingers", "push and", "CRACK",
    "No bones / were harmed", "Your knuckle", "just cracked / open", "a soda",
    "Each knuckle", "is sealed in", "slippery / fluid", "full of", "dissolved / gas",
    "Stretch it", "the pressure / drops", "and POP", "A bubble",
    "Scientists / caught it", "in an / MRI", "right on / the crack",
    "Subscribe", "one doctor", "went / too far",
    "He cracked", "only his / LEFT hand", "for / fifty years", "Arthritis", "Neither / hand",
    "Sorry / Mom",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys): yellow = the crack and the reveals, ice = bone
# and gas, cyan = the fluid and the bubble, orange = the soda and the pressure, green = proof, red = the scare
COLOR = {
    "fingers": Y, "crack": Y,
    "bones": S, "harmed": G, "knuckle": Y, "cracked": Y, "soda": O,
    "sealed": B, "slippery": C, "fluid": C, "dissolved": S, "gas": S,
    "stretch": Y, "pressure": O, "drops": R, "pop": Y, "bubble": C,
    "scientists": V, "mri": G, "right": G,
    "subscribe": R, "doctor": PK, "too": Y, "far": Y,
    "left": G, "50": Y, "years": Y, "arthritis?": R, "neither": G,
    "sorry": Y, "mom": PK,
}
DISPLAY = {"fifty years": ["50", "YEARS"], "arthritis": ["ARTHRITIS?"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

CRACK = W("CRACK")
PUSH = W("push")
HE = W("He cracked")
FOR = W("for fifty")
YEARS_END = E("fifty years", 1)
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # 1. hook: the knuckles tick while he pushes (the strange thing starts small, at once)
    "lock": W("You lock", 1),
    "fingers": W("fingers"),
    "push": PUSH,
    "push_end": E("push"),
    "and": W("and CRACK"),
    "crk": [0.16, 0.96, PUSH + 0.07, PUSH + 0.25, PUSH + 0.43, PUSH + 0.60],   # one small tick per knuckle
    "crack": CRACK,                              # the big one: picture and sound on the same frame
    "crack_end": E("CRACK"),
    # 2. crack: Mom, then the x-ray
    "door": E("CRACK") + 0.05,                   # the door bangs open, in the pause
    "mom": E("CRACK") + 0.20,                    # her shout (a bubble; gibberish in the sound)
    "no": T.ws[find("No bones")],
    "bones": W("bones"),
    "harmed": W("harmed"),
    "harmed_end": E("harmed"),
    "tick": E("harmed") + 0.05,                  # the green tick on the x-ray, in the pause
    # 3. soda
    "your": W("Your knuckle"),
    "knuckle": W("Your knuckle", 1),
    "cracked": W("cracked open"),                # the can's tab goes up
    "open": W("cracked open", 1),
    "soda": W("soda"),
    "soda_end": E("soda"),
    "psst": E("soda") + 0.03,                    # the fizz, in the pause after "soda."
    # 4. fluid
    "each": W("Each knuckle"),
    "sealed": W("sealed"),                       # the bag round the joint draws on
    "slippery": W("slippery"),                   # the fluid lights up; the bones glide
    "fluid_w": W("fluid"),
    "fluid_end": E("fluid"),
    "full": W("full of"),
    "dissolved": W("dissolved"),                 # the gas shows: dots in the fluid
    "gas": W("gas"),
    "gas_end": E("gas"),
    # 5. pull
    "stretch": T.ws[find("Stretch it")],         # the bones are pulled apart
    "stretch_end": E("Stretch it", 1),
    "pressure": W("pressure"),                   # the gauge
    "drops": W("drops"),                         # its needle falls
    "drops_end": E("drops"),
    "and_pop": W("and POP"),
    "pop": W("POP"),                             # the bubble is there
    "pop_end": E("POP"),
    "pop_snd": E("POP") + 0.04,                  # the audible pop, in the pause after the word
    "a_bubble": W("A bubble"),
    "bubble": W("A bubble", 1),
    "bubble_end": E("A bubble", 1),
    # 6. mri
    "sci": W("Scientists"),
    "caught": W("caught"),
    "mri": W("MRI"),
    "mri_end": E("MRI"),
    "ratchet": E("MRI") + 0.03,                  # the winch takes up the last of the slack, in the pause after "MRI..."
    "winch": [W("Scientists") + 0.2, W("caught") + 0.05, W("caught") + 0.5, W("MRI"), W("MRI") + 0.4, E("MRI") + 0.03],   # it winds in steps
    "right": W("right on"),
    "on_crack": W("the crack", 1),               # the scan's bubble and the sound's spike, together
    "on_crack_end": E("the crack", 1),
    # 7. doctor (the aside starts over the scan and ends over him)
    "sub_w": T.ws[SUB],
    "one_doctor": W("one doctor"),
    "went": W("went too"),
    "far": W("too far", 1),
    "far_end": E("too far", 1),
    "he": HE,
    "only": W("only his"),
    "left": W("LEFT"),
    "left_end": E("LEFT hand", 1),
    "for": FOR,
    "fifty": W("fifty"),
    "years": W("fifty years", 1),
    "years_end": YEARS_END,
    # his left hand cracks on a beat (sparks; the audible ones sit in the pauses)
    "dcracks": [E("too far", 1) + 0.04] + [round(HE + 0.30 + 0.34 * i, 3) for i in range(int((YEARS_END - HE - 0.3) / 0.34) + 1)],
    "dcrack_snd": [E("too far", 1) + 0.04, E("LEFT hand", 1) + 0.03, YEARS_END + 0.03],
    # 8. xray
    "arth": W("Arthritis"),
    "arth_end": E("Arthritis"),
    "neither": W("Neither"),                     # the first tick lands
    "neither2": W("Neither hand", 1),            # the second
    "neither_end": E("Neither hand", 1),
    # 9. button
    "sorry": T.ws[find("Sorry")],
    "mom_w": W("Mom"),
    "mom_end": E("Mom"),
    "hmph": E("Mom") + 0.10,                     # Mom's answer
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff.
# "Subscribe..." is drawn out and the alignment knew only its last syllable: the click waits for the word to end.
cues["sub_in"] = max(0.0, T.ws[SUB] - 0.30)
cues["sub_tap"] = max(T.we[SUB], T.ws[SUB] + 0.80) + 0.10   # in the "..." after the word, so the click never sits on a word
cues["sub_out"] = cues["sub_tap"] + 1.30
cues = {k: ([round(x, 3) for x in v] if isinstance(v, list) else round(v, 3)) for k, v in cues.items()}
# v3 ended "You" at 0.18 s while she says it until "lock" (the waveform): lengthen the word's window. After the shots,
# captions and cues are made, so the picture and the mix do not move.
_y = find("You lock")
T.we[_y] = T.words[_y]["end"] = round(min(T.ws[_y + 1] - 0.01, T.ws[_y] + 0.21), 3)
T.write(shots, caps, cues)
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[SUB]:.2f} s = {100 * T.ws[SUB] / T.duration:.0f} % of the runtime (must be 50-70 %); tap {cues["sub_tap"]:.2f}, next word {T.ws[SUB + 1]:.2f}')
for k, v in cues.items():
    print(f'  {k:12s} {v if isinstance(v, list) else format(v, "6.2f")}')
