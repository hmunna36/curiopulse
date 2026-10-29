"""Edit timeline for the What If the Sun VANISHED Right Now? ☀️ Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: he pushes his sunglasses back up and takes the straw
#                                      again, and the cut back to frame 1 (the loop)

W, E, ev, find = T.W, T.E, T.ev, T.find


# ---- v3's alignment, checked against the speech-band envelope (T.bursts; narration.md): in several blocks the words sat
# 0.1-0.35 s early, in the silence before their sound. Moved onto their bursts by hand (T.retime needs one burst a word).
def _move(i, a, b):
    T.ws[i] = T.words[i]["start"] = round(a, 3)
    T.we[i] = T.words[i]["end"] = round(b, 3)


def _moves(phrase, spans, s=0):
    i = find(phrase, s)
    for k, (a, b) in enumerate(spans):
        _move(i + k, a, b)


def _shift(phrase, d, s=0):
    """move every word of `phrase` by d seconds (a block whose alignment runs early all through)"""
    i = find(phrase, s)
    for k in range(len(phrase.split())):
        _move(i + k, T.ws[i + k] + d, T.we[i + k] + d)


B = {b["id"]: b for b in T.blocks}
_moves("What if the Sun vanished right now", [(0.11, 0.36), (0.40, 0.47), (0.47, 0.56), (0.62, 0.97), (1.08, 1.60),
                                              (1.86, 2.15), (2.21, 2.63)])
_moves("you'd keep sunbathing for EIGHT minutes", [(2.97, 3.19), (3.26, 3.41), (3.53, 4.19), (4.50, 4.69),
                                                   (4.83, 5.11), (5.38, 5.96)])
_moves("sent eight minutes ago", [(8.32, 8.49), (8.52, 8.72), (8.74, 8.99), (9.09, 9.37)])
_moves("Switch the Sun off", [(9.85, 9.99), (9.99, 10.08), (10.11, 10.25), (10.30, 10.72)])
_move(find("and the light already"), 11.12, 11.23)
_moves("Even its PULL is that slow", [(14.31, 14.46), (14.46, 14.67), (15.00, 15.37), (15.58, 15.74), (15.77, 15.98),
                                       (16.09, 16.46)])
_moves("So Earth keeps circling", [(16.83, 17.02), (17.03, 17.30), (17.50, 17.72), (17.82, 18.45)])
_b0 = B["button"]["start"] - 29.14                   # the button's bursts (measured with the block at 29.14 s)
_moves("Relax The Sun's still there Probably", [(29.17 + _b0, 29.78 + _b0), (30.20 + _b0, 30.34 + _b0),
                                                (30.38 + _b0, 30.60 + _b0), (30.69 + _b0, 30.86 + _b0),
                                                (30.87 + _b0, 31.12 + _b0), (31.89 + _b0, 32.45 + _b0)])

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),       # a beach at noon, TIGHT on him in a striped deck chair, mid-sip (the straw in his mouth, the glass
                          # in his hand, sunglasses); the Sun high on the right; "if the Sun": a round window on SPACE pops
                          # up on the left; "vanished": the switch beside the Sun flips OFF and the Sun POPS out of
                          # existence (a chalk outline is left); he keeps sipping; "you'd keep sunbathing": he lets go of
                          # the straw, "aah", and leans back as the camera eases out; "EIGHT": SUNSHINE LEFT 8:20 slams in
    ("delivery", None),   # close on his face in the sun: glowing envelopes of sunshine fly in from the Sun's side and land
                          # on his skin with a sparkle; "delivery": one stops in front of his sunglasses; "sent": a postmark
                          # THUD: SENT 8 MIN AGO; he pushes his sunglasses up to read it
    ("road", None),       # THE ONE PICTURE, in space: the Sun's chalk outline and its switch (OFF) at the top; "light": the
                          # camera travels down a glowing road of envelopes; the road is dark behind the LAST one, still
                          # on its way; "keeps arriving": Earth's day side, envelopes landing; his portrait in the corner
    ("pull", None),       # the orbit from above: Earth on a glowing rope (PULL) round the empty outline; the dark ring of
                          # the news spreads out from it; "nothing.": the camera on the outline; a tumbleweed rolls through
    ("dark", None),       # the beach: "Then...": the last seconds of the countdown, he sips on; "out": NIGHT (stars, a black
                          # sea); he lifts his sunglasses to check... and lowers them
    ("fly", None),        # space from above: the ring reaches Earth, the rope SNAPS, Earth flies off along a straight
                          # dashed line, a dark ball with city lights; "thirty": 30 KM/S
    ("feel", None),       # the beach in the dark: not a ripple in his lemonade; a deadpan sip on "feel it"
    ("button", None),     # the sun is back: he sips; "Probably.": he lowers his sunglasses and squints at the Sun... then the
                          # straw again (frame 1)
    ("loop", None),       # the last 0.45 s: the hook at negative time (frame 1 a moment earlier)
]
DUR = T.duration
special = {
    "delivery": W("Your sunshine") - 0.1,
    "road": W("Switch") - 0.14,
    "pull": W("Even") - 0.1,
    "dark": W("Then") - 0.16,
    "fly": W("Earth flies") - 0.1,
    "feel": W("and you wouldn't") - 0.1,
    "button": W("Relax") - 0.1,
    "loop": DUR - 0.45,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "What if / the Sun",
    "vanished / right now?",
    "you'd keep / sunbathing",
    "for EIGHT / minutes.",
    "Your sunshine / is a delivery...",
    "sent eight / minutes ago.",
    "Switch the / Sun off,",
    "and the light / already",
    "on the road...",
    "keeps arriving.",
    "Even its PULL / is that slow.",
    "So Earth / keeps circling...",
    "nothing.",
    "Then...",
    "lights out.",
    "Earth flies off",
    "in a straight / line,",
    "at thirty kilometres / a second...",
    "and you / wouldn't even",
    "feel it.",
    "Relax.",
    "The Sun's / still there.",
    "Probably.",
]
Y, O, C, R, G, B_, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# gold = the Sun and its sunshine, cyan = Earth and its pull, red = vanishing / out / nothing, orange = the delivery and
# the road, violet = the eight minutes (the clock), green = relax
COLOR = {"sun": Y, "sun's": Y, "sunshine": Y, "sunbathing": Y, "vanished": R, "eight": V, "8": V, "delivery": O,
         "sent": O, "road": O, "light": Y, "arriving": O, "pull": C, "earth": C, "circling": C, "nothing": R, "out": R,
         "straight": C, "30": Y, "km/s": Y, "feel": G, "relax": G, "probably": V}
DISPLAY = {"thirty kilometres": ["30", "KM"], "a second": ["A", "SECOND..."]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
sh = {s["id"]: s for s in shots}

iSun1 = find("the Sun vanished") + 1
iSun2 = find("Switch the Sun") + 2
iSun3 = find("The Sun's")
iEarth1 = find("So Earth")+1
iEarth2 = find("Earth flies")
iEight1 = find("EIGHT minutes")
iEight2 = find("sent eight") + 1
iThe = find("on the road") + 1
cues = {
    # the hook
    "what": W("What"), "sun1": T.ws[iSun1], "vanished": W("vanished"), "vanished_end": E("vanished"), "right": W("right"),
    "now": W("now"), "now_end": E("now"),
    # the answer
    "youd": W("you'd"), "keep": W("keep"), "sunbathing": W("sunbathing"), "for": W("for EIGHT"), "eight": T.ws[iEight1],
    "eight_end": T.we[iEight1], "minutes1": W("minutes", 0, iEight1), "minutes1_end": E("minutes", 0, iEight1),
    # the delivery
    "your": W("Your sunshine"), "sunshine": W("sunshine"), "is": W("is a delivery"), "delivery": W("delivery"),
    "delivery_end": E("delivery"), "sent": W("sent"), "eight2": T.ws[iEight2], "ago": W("ago"), "ago_end": E("ago"),
    # the road
    "switch": W("Switch"), "sun2": T.ws[iSun2], "off": W("off"), "off_end": E("off"), "and1": W("and the light"),
    "light": W("light"), "already": W("already"), "road": W("road"), "road_end": E("road"), "keeps1": W("keeps arriving"),
    "arriving": W("arriving"), "arriving_end": E("arriving"),
    # the pull
    "even": W("Even"), "pull": W("PULL"), "pull_end": E("PULL"), "slow": W("slow"), "slow_end": E("slow"),
    "so": W("So Earth"), "earth1": T.ws[iEarth1], "keeps2": W("keeps circling"), "circling": W("circling"),
    "circling_end": E("circling"), "nothing": W("nothing"), "nothing_end": E("nothing"),
    # the dark
    "then": W("Then"), "then_end": E("Then"), "lights": W("lights"), "out": W("out"), "out_end": E("out"),
    # the fly
    "earth2": T.ws[iEarth2], "flies": W("flies"), "straight": W("straight"), "line": W("line"), "line_end": E("line"),
    "thirty": W("thirty"), "km": W("kilometres"), "second": W("second"), "second_end": E("second"),
    # the feel
    "and2": W("and you wouldn't"), "wouldnt": W("wouldn't"), "even2": W("even feel"), "feel": W("feel"),
    "it": W("feel it", 1), "it_end": E("feel it", 1),
    # the button
    "relax": W("Relax"), "relax_end": E("Relax"), "the_sun": T.ws[iSun3], "still": W("still there"), "there": W("there"),
    "there_end": E("there"), "probably": W("Probably"), "probably_end": E("Probably"),
}
c = cues
cues.update({
    # the hook
    "window": c["sun1"] - 0.2,                           # the window on SPACE pops up on the left
    "flip": c["vanished"] - 0.1,                         # the switch beside the Sun flips OFF (a click)
    "pop": c["vanished"] + 0.08,                         # ...and the Sun pops out of existence (a puff, the chalk outline)
    "unstraw": c["youd"] + 0.05,                         # he lets go of the straw: "aah", leans back
    "timer_in": c["eight"] - 0.04,                       # SUNSHINE LEFT 8:20 slams in
    # the countdown: from 8:20 at "EIGHT" to 0:00 on "out" (the last three seconds slowed for the drama)
    "count0": c["eight"], "count3": c["then_end"] + 0.25, "count2": c["then_end"] + 0.55, "count1": c["then_end"] + 0.85,
    "count_zero": c["out"],
    # the delivery
    "letters": c["your"] - 0.05,                         # the envelopes stream in
    "stopper": c["delivery"] - 0.05,                     # one stops in front of his sunglasses
    "stamp": c["sent"] + 0.02,                           # THUD: SENT 8 MIN AGO
    "read": c["ago"] - 0.05,                             # he pushes his sunglasses up to read it
    # the road
    "click": c["switch"] + 0.05,                         # the switch rattles OFF again (a small click) as we arrive on it
    "travel": c["and1"] - 0.15,                          # the camera starts down the road
    "last_tag": c["road"] - 0.1,                         # LAST ONE on the last envelope (the dark end of the road)
    "land": c["keeps1"],                                 # envelopes landing on Earth's day side
    # the pull
    "rope": c["pull"] - 0.05,                            # the rope from Earth to the outline lights up: PULL
    "ring_tag": c["slow"],                               # the dark ring is labelled (THE NEWS: 8 MIN)
    "push_in": c["nothing"] - 0.25,                      # the camera pushes in on the empty outline
    "tumble": c["nothing"] - 0.06,                       # the tumbleweed rolls through on "nothing." and the gap after
    # the dark
    "snap": c["out"] + 0.02,                             # NIGHT
    "glasses_up": c["out_end"] + 0.06,                   # he lifts his sunglasses to check (a 6-frame hold)
    "glasses_down": c["out_end"] + 0.36,                 # ...and lowers them again
    # the fly
    "snap_rope": c["earth2"] + 0.06,                     # the ring reaches Earth: the rope SNAPS
    "speed_tag": c["thirty"] - 0.05,                     # 30 KM/S
    # the feel
    "sip_dark": c["feel"] - 0.15,                        # the deadpan sip (not a ripple)
    "clink": c["it_end"] + 0.05,                         # an ice cube clinks
    # the button
    "sun_back": c["relax"] - 0.08,                       # the light is back (the hard cut)
    "squint": c["probably"] + 0.02,                      # he lowers his sunglasses and squints at the Sun
    "unsquint": c["probably_end"] + 0.12,                # ...pushes them back up
    "resip": c["probably_end"] + 0.28,                   # ...and takes the straw again (frame 1; the loop shot ends it)
})
assert c["what"] < c["sun1"] < c["vanished"] < c["right"] < c["now"] < c["youd"] < c["sunbathing"] < c["eight"]
assert c["eight"] < c["your"] < c["sunshine"] < c["delivery"] < c["sent"] < c["ago"] < c["switch"] < c["off"]
assert c["off"] < c["light"] < c["road"] < c["arriving"] < c["even"] < c["pull"] < c["slow"] < c["circling"]
assert c["circling"] < c["nothing"] < c["then"] < c["lights"] < c["out"] < c["earth2"] < c["straight"] < c["thirty"]
assert c["thirty"] < c["second"] < c["and2"] < c["feel"] < c["relax"] < c["the_sun"] < c["probably"]
assert c["count0"] < c["count3"] < c["count2"] < c["count1"] < c["count_zero"]
assert sh["dark"]["start"] > c["tumble"] + 0.6 and c["glasses_down"] + 0.15 < sh["fly"]["start"]
assert c["resip"] + 0.1 < sh["loop"]["start"]
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026). publish.json "subscribe" says the arm; T.write sets the
# pill's cues for the pill arm by itself and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the hook: the title question, told to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
