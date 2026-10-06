"""Edit timeline for the Why Do We Get DÉJÀ VU? Short (the 45-50 s arm of the length test).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.5)  # after "before?": the camera dives into the crystal ball, where the door of frame 1 is waiting

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


# "[deadpan] Relax.", "[mischievously] Subscribe...", "[deadpan] So no...", "[confused] Wait...": each starts where its
# take gets loud (the alignment hands the tag's time to the word and starts it up to 0.8 s late)
i_relax = move_onset("Relax", "answer")
i_sub = move_onset("Subscribe", "sub")
i_so = move_onset("So no", "psychic", thr=-24.0)   # after a sigh: the word starts where the take gets properly loud
i_wait = move_onset("Wait", "button")

LOOP = T.duration - 0.40                       # his hand is back on the door: the picture of frame 1

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                        # a brand-new cafe: he pushes the door open, walks in ... and he has BEEN here
    ("relax", None),                       # close on his frozen face: "Relax."
    ("caught", "Your brain just"),         # inside his head: the checker's torch catches the eager one red-handed
    ("bell", "Scientists think"),          # the eager part of his brain and its bell: SEEN IT!
    ("layout", "Maybe because"),           # the cafe's outlines light up ... and they are grandma's kitchen
    ("files", "Then your memory"),         # the archive: drawer after drawer ... nope
    ("clash", "So the front"),             # the front office: two slips that can't both be true. IMPOSSIBLE
    ("dejavu", "That creepy clash"),       # back in the cafe: the shiver has a name. The subscribe aside plays over this shot
    ("next", "It even feels"),             # he "knows" what the barista does next
    ("lab", "In the lab"),                 # the lab: a headset, a fork in the corridor, a coin
    ("psychic", None),                     # the fortune teller's table: not psychic
    ("button", None),                      # the ball clears: a door ... and in we go (frame 1 again)
]
special = {
    "relax": T.ws[i_relax] - 0.07,
    "psychic": T.ws[i_so] - 0.07,
    "button": T.ws[i_wait] - 0.07,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "You open", "a strange / door", "and you've", "BEEN here / before",
    "Relax", "Your brain", "just caught / itself", "lying",
    "Scientists / think", "one eager / part", "of your / brain", "yells", "SEEN IT",
    "Maybe / because", "this room", "is laid out", "just like / one", "you forgot",
    "Then your / memory", "checks / the files", "nope", "Never / been here",
    "So the front", "of your / brain", "steps in", "familiar", "but", "IMPOSSIBLE",
    "That creepy / clash", "THAT'S", "déjà vu",
    "Subscribe", "it gets / weirder",
    "It even / feels like", "you know", "what / happens", "NEXT",
    "In the lab", "people / felt SURE", "and guessed", "like a / coin flip",
    "So no", "you're not / psychic",
    "Wait", "have I / said this", "before",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys; "déjà" normalizes to "dj"): yellow = the
# feeling ("been here", "seen it", "before"), pink = the brain, green = familiar, red = the "no", violet = the weird
COLOR = {
    "strange": V, "door": Y, "been": Y, "before": Y,
    "relax": G, "brain": PK, "caught": Y, "lying": R,
    "scientists": C, "eager": O, "yells": O, "seen": Y,
    "room": C, "laid": Y, "out": Y, "forgot": V,
    "memory": C, "files": C, "nope": R, "never": R,
    "front": V, "familiar": G, "impossible": R,
    "creepy": V, "clash": R, "dj": Y, "vu": Y,
    "subscribe": R, "weirder": V,
    "know": Y, "next": Y, "lab": C, "sure": G, "guessed": O, "coin": Y, "flip": Y,
    "no": R, "psychic": V,
    "wait": Y,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
for _c in caps:                                # "SEEN IT": both words are the shout
    if [w["t"] for w in _c["lines"][0]] == ["SEEN", "IT"]:
        _c["lines"][0][1]["c"] = Y

i_hook = find("You open a strange")
i_your = find("Your brain just")
i_sci = find("Scientists think")
i_maybe = find("Maybe because")
i_then = find("Then your memory")
i_front = find("So the front")
i_that = find("That creepy clash")
i_even = find("It even feels")
i_lab = find("In the lab")
ws, we = T.ws, T.we
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # hook: 0 You 1 open 2 a 3 strange 4 door 5 and 6 you've 7 BEEN 8 here 9 before
    "open": ws[i_hook + 1], "strange": ws[i_hook + 3], "door": ws[i_hook + 4], "door_end": we[i_hook + 4],
    "and": ws[i_hook + 5], "been": ws[i_hook + 7], "here": ws[i_hook + 8], "before": ws[i_hook + 9], "before_end": we[i_hook + 9],
    "chime": 0.04,                                # the door's bell, on frame 1
    "step_in": we[i_hook + 4] - 0.10,             # he is through the door
    "jolt": ws[i_hook + 7] - 0.03,                # the feeling hits on "BEEN"
    "title": ws[i_hook + 9] + 0.02,               # DEJA VU, on "before"
    "ahead": 0.8,                                 # a see-through copy of him does it all this much ahead of him
    "ghostjolt": ws[i_hook + 7] - 0.03 - 0.8,     # ... so it jumps first
    # relax
    "relax": ws[i_relax], "relax_end": we[i_relax],
    "gulp": we[i_relax] + 0.06,                   # he swallows (the pause after "Relax.")
    # caught: 0 Your 1 brain 2 just 3 caught 4 itself 5 lying
    "your": ws[i_your], "brain1": ws[i_your + 1], "just": ws[i_your + 2], "caught": ws[i_your + 3], "itself": ws[i_your + 4],
    "lying": ws[i_your + 5], "lying_end": we[i_your + 5],
    "beam": ws[i_your + 3] - 0.04,                # the torch snaps on at "caught"
    "busted": we[i_your + 5] + 0.05,              # the stamp, in the pause after "lying."
    # bell: 0 Scientists 1 think 2 one 3 eager 4 part 5 of 6 your 7 brain 8 yells 9 SEEN 10 IT
    "scientists": ws[i_sci], "think": ws[i_sci + 1], "one": ws[i_sci + 2], "eager": ws[i_sci + 3], "part": ws[i_sci + 4],
    "brain2": ws[i_sci + 7], "yells": ws[i_sci + 8], "yells_end": we[i_sci + 8], "seen": ws[i_sci + 9], "it": ws[i_sci + 10],
    "it_end": we[i_sci + 10],
    "hops": [ws[i_sci + 3] + 0.02, ws[i_sci + 4] + 0.06, ws[i_sci + 7]],     # he can't keep still
    "windup": we[i_sci + 8] + 0.04,               # the big breath before the shout
    "ding": we[i_sci + 10] + 0.05,                # the bell (heard just after "IT!")
    # layout: 0 Maybe 1 because 2 this 3 room 4 is 5 laid 6 out 7 just 8 like 9 one 10 you 11 forgot
    "maybe": ws[i_maybe], "this": ws[i_maybe + 2], "room": ws[i_maybe + 3], "laid": ws[i_maybe + 5], "out": ws[i_maybe + 6],
    "out_end": we[i_maybe + 6], "justlike": ws[i_maybe + 7], "one2": ws[i_maybe + 9], "forgot": ws[i_maybe + 11],
    "forgot_end": we[i_maybe + 11],
    "wire": ws[i_maybe + 2] - 0.05,               # the room's outlines light up, one after another
    "morph": ws[i_maybe + 7] - 0.05,              # ... and they are the outlines of another room
    "fog": ws[i_maybe + 11] - 0.02,               # which he has forgotten
    # files: 0 Then 1 your 2 memory 3 checks 4 the 5 files 6 nope 7 Never 8 been 9 here
    "then": ws[i_then], "memory": ws[i_then + 2], "checks": ws[i_then + 3], "files": ws[i_then + 5], "files_end": we[i_then + 5],
    "nope": ws[i_then + 6], "nope_end": we[i_then + 6], "never": ws[i_then + 7], "here2": ws[i_then + 9], "here2_end": we[i_then + 9],
    "flips": [ws[i_then + 3] + 0.02, ws[i_then + 3] + 0.26, ws[i_then + 5] + 0.02, ws[i_then + 5] + 0.26, ws[i_then + 5] + 0.50],
    "empty": we[i_then + 5] + 0.12,               # the last folder is empty (the pause before "nope")
    "womp": we[i_then + 6] + 0.05,                # ... (the pause after "nope.")
    "norecord": ws[i_then + 7] + 0.02,            # the NO RECORD stamp lands on "Never"
    "thud1": we[i_then + 9] + 0.04,
    # clash: 0 So 1 the 2 front 3 of 4 your 5 brain 6 steps 7 in 8 familiar 9 but 10 IMPOSSIBLE
    "so": ws[i_front], "front": ws[i_front + 2], "brain3": ws[i_front + 5], "steps": ws[i_front + 6], "in": ws[i_front + 7],
    "in_end": we[i_front + 7], "familiar": ws[i_front + 8], "familiar_end": we[i_front + 8], "but": ws[i_front + 9],
    "impossible": ws[i_front + 10], "impossible_end": we[i_front + 10],
    "slip_a": we[i_front + 7] + 0.10,             # the green slip arrives (before "familiar")
    "slip_b": we[i_front + 9] - 0.02,             # the red slip arrives (the pause after "but")
    "stamp": ws[i_front + 10] + 0.52,             # the stamp comes down inside "IMPOSSIBLE"
    "alarm": we[i_front + 10] + 0.06,             # ... and the alarm goes, in the pause after it
    # dejavu: 0 That 1 creepy 2 clash 3 THAT'S 4 deja 5 vu
    "that": ws[i_that], "creepy": ws[i_that + 1], "clash": ws[i_that + 2], "clash_end": we[i_that + 2], "thats": ws[i_that + 3],
    "deja": ws[i_that + 4], "vu": ws[i_that + 5], "vu_end": we[i_that + 5],
    "shiver": ws[i_that + 1],                     # the shiver runs through him
    "title2": ws[i_that + 4] - 0.02,              # DEJA VU lands
    "phew": we[i_that + 5] + 0.08,                # he breathes out
    # the aside: Subscribe 1 it 2 gets 3 weirder
    "subscribe": ws[i_sub], "itgets": ws[i_sub + 1], "weirder": ws[i_sub + 3], "weirder_end": we[i_sub + 3],
    # next: 0 It 1 even 2 feels 3 like 4 you 5 know 6 what 7 happens 8 NEXT
    "even": ws[i_even + 1], "feels": ws[i_even + 2], "know": ws[i_even + 5], "happens": ws[i_even + 7], "next": ws[i_even + 8],
    "next_end": we[i_even + 8],
    "bubble": ws[i_even + 5] - 0.05,              # his prediction, in a thought bubble
    "point": ws[i_even + 8] - 0.02,               # he calls it
    # lab: 0 In 1 the 2 lab 3 people 4 felt 5 SURE 6 and 7 guessed 8 like 9 a 10 coin 11 flip
    "inthe": ws[i_lab], "lab": ws[i_lab + 2], "people": ws[i_lab + 3], "felt": ws[i_lab + 4], "sure": ws[i_lab + 5],
    "sure_end": we[i_lab + 5], "and2": ws[i_lab + 6], "guessed": ws[i_lab + 7], "like2": ws[i_lab + 8], "coin": ws[i_lab + 10],
    "flip": ws[i_lab + 11], "flip_end": we[i_lab + 11],
    "arrow": ws[i_lab + 4] - 0.04,                # he points left: THAT way
    "badge": ws[i_lab + 5] + 0.10,                # 100 % SURE
    "wrong": we[i_lab + 5] + 0.06,                # the corridor turns right (the pause after "SURE...")
    "toss": ws[i_lab + 8] - 0.02,                 # the coin goes up
    "land": we[i_lab + 11] + 0.08,                # ... and lands
    # psychic: 0 So 1 no 2 you're 3 not 4 psychic
    "so2": ws[i_so], "no": ws[i_so + 1], "no_end": we[i_so + 1], "youre": ws[i_so + 2], "not": ws[i_so + 3], "psychic": ws[i_so + 4],
    "psychic_end": we[i_so + 4],
    "ballx": ws[i_so + 3] - 0.03,                 # the ball says no
    "droop": we[i_so + 4] + 0.06,                 # the turban slides over his eyes
    # button: 0 Wait 1 have 2 I 3 said 4 this 5 before
    "wait": ws[i_wait], "wait_end": we[i_wait], "have": ws[i_wait + 1], "said": ws[i_wait + 3], "before2": ws[i_wait + 5],
    "before2_end": we[i_wait + 5],
    "flicker": ws[i_wait] - 0.02,                 # the ball flickers: there is a door in it
    "dive": we[i_wait + 5] + 0.16,                # in we go
    "loop": LOOP,
}
# ---- the subscribe cue (web/subscribe.js): MID-VIDEO, on the spoken `## sub` aside that follows the payoff
# "Subscribe..." is drawn out: the alignment only knows its last syllable, so the click waits for the take's own pause
_sub_end = max(T.we[i_sub], T.ws[i_sub] + 0.80)
cues["sub_in"] = max(0.0, T.ws[i_sub] - 0.30)
cues["sub_tap"] = min(_sub_end + 0.10, T.ws[i_sub + 1] - 0.22)   # in the "..." after the word, never on "it gets"
cues["sub_out"] = cues["sub_tap"] + 1.30
cues["subscribe_end"] = _sub_end
# the cat: it walks past, and meows in the pause after the click ... then the SAME walk and the SAME meow on "weirder"
CAT_MEOW = 0.65                                # seconds into its walk: the cat is in the middle of the frame
cues["meow1"] = cues["sub_tap"] + 0.05
cues["cat1"] = cues["meow1"] - CAT_MEOW
cues["meow2"] = cues["weirder_end"] + 0.03
cues["cat2"] = cues["meow2"] - CAT_MEOW
T.words[i_sub]["end"] = round(_sub_end, 3)
# "You" (the first word): the alignment ends it early, but she is still saying it until the dip before "open".
# Moved after the shots, captions and cues were computed: only the per-word windows that the QA measures use it.
if T.ws[1] - T.we[0] > 0.05:
    T.words[0]["end"] = round(T.ws[1] - 0.01, 3)
m2 = T.find("Wait")
T.words[m2]["end"] = round(max(T.we[m2], T.ws[m2] + 0.26), 3)       # "Wait..." runs on past its alignment too
T.write(shots, caps, cues)
for k in ("jolt", "title", "relax", "gulp", "beam", "busted", "windup", "ding", "wire", "morph", "fog", "empty", "womp", "norecord",
          "slip_a", "slip_b", "stamp", "alarm", "shiver", "title2", "phew", "sub_in", "sub_tap", "sub_out", "cat1", "meow1", "cat2", "meow2", "bubble",
          "point", "arrow", "badge", "wrong", "toss", "land", "ballx", "droop", "flicker", "dive", "loop"):
    print(f"  {k:10s} {cues[k]:6.2f}")
# the three numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (the arm in publish.json: standard passes at 43-50 s, short at 30-35 s)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'subscribe aside: the word at {T.ws[i_sub]:.2f} s = {100 * T.ws[i_sub] / T.duration:.0f} % of the runtime (must be 50-70 %)')
