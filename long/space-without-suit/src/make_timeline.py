"""Edit timeline for "What If You Went to Space WITHOUT a Suit? (Second by Second)" (long-form, 1920x1080, 4:00-5:00,
never over 5:15).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
The clock (cues.clock, drawn by web/hud.js) counts the seconds he has been in space with no suit: SECOND 0 on "now"
(the viewer breathes out with him), then it creeps forward a second at a time ("{n}") and jumps on the beats.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.4)
W, E, ev, find = T.W, T.E, T.ev, T.find

# v3's alignment can crowd a phrase into the pause before it ("The last thing he" sat 0.3 s early, in silence):
# realign.py re-times the words with whisper (.work/align.json). Whisper drags words across long pauses, so a block
# takes its whisper times only when some of its words sit in silence (< -38 dB) and whisper puts fewer there.
import json as _json, os as _os  # noqa: E401
import numpy as _np
_ap = _os.path.join(sys.argv[1], "align.json")
if _os.path.exists(_ap):
    _al = _json.load(open(_ap))
    if len(_al) == len(T.words):
        _lev = lambda a, b: 20 * _np.log10(_np.sqrt((T.audio[int(a * T.sr):max(int(a * T.sr) + 1, int(b * T.sr))] ** 2).mean()) + 1e-9)  # noqa: E731
        _blocks = {}
        for _i, _w in enumerate(T.words):
            _blocks.setdefault(_w.get("block"), []).append(_i)
        for _b, _idx in _blocks.items():
            _sh = T.block(_b)["start"] - _al[_idx[0]].get("b0", T.block(_b)["start"])   # the block moved (a gap changed)
            for _i in _idx:
                _al[_i] = {"start": _al[_i]["start"] + _sh, "end": _al[_i]["end"] + _sh}
            _old = sum(1 for _i in _idx if _lev(T.ws[_i], T.we[_i]) < -38)
            _new = sum(1 for _i in _idx if _lev(_al[_i]["start"], _al[_i]["end"]) < -38)
            if _old > 0 and _new < _old:
                for _i in _idx:
                    T.ws[_i] = T.words[_i]["start"] = _al[_i]["start"]
                    T.we[_i] = T.words[_i]["end"] = _al[_i]["end"]
                print(f"realigned {_b}: {_old} words in silence before, {_new} after")
# v3's alignment can hand a pause to the next word: snap every word's start to its first loud frame.
for i in range(len(T.words)):
    fl = T.first_loud(T.ws[i], span=max(0.02, T.we[i] - T.ws[i] + 0.1))
    if fl - T.ws[i] > 0.08:
        T.ws[i] = T.words[i]["start"] = round(min(fl, T.we[i] - 0.04), 3)
# a word the aligner squeezed into a sliver ends at the next word's start (the voice checks measure the whole word)
for i in range(len(T.words) - 1):
    if T.we[i] - T.ws[i] < 0.1:
        T.we[i] = T.words[i]["end"] = round(max(T.we[i], min(T.ws[i + 1] - 0.01, T.ws[i] + 0.3)), 3)

now = W("now.")                               # SECOND 0: the viewer breathes out with him
mute = E("thing.", s=find("can't hear")) + 0.08   # the silence: no sound but his heartbeat
dark = E("out.", s=find("lights out")) + 0.15      # lights out: black
pop = E("chips.") + 0.30                       # the chip bag bursts, without a sound
slam = E("REPRESS.", s=find("hits REPRESS")) + 0.10   # her hand on REPRESS: the hatch shuts, the air roars back
air = W("Air.", s=find("Second ninety."))     # he breathes
final = E("thin.") + 0.45                      # the final image

SHOTS = [
    ("hook", None),                            # his face, close, cheeks full of a held breath; air streaming to the hatch
    ("out", "Breathe OUT"),                    # he blows it all out; the cloud leaves through the hatch; SECOND 0
    ("lungs", "Holding it in"),                # x-ray: held air balloons the lungs until they tear (red)
    ("promise", "Now, second by second"),      # wide: the airlock, the clock; the camera finds the green REPRESS
    ("want", "All he wanted"),                 # his phone: Pip's message, NO GOLDFISH BOWL, her drawing
    ("depress", "So he pressed"),              # the panel: his finger on DEPRESS; Ball's flat eyes
    ("explode", "Second one."),                # the movies: an astronaut inflates, BOOM; MYTH
    ("intact", "Your skin is"),                # back on him: whole; he pats himself
    ("silence", "Second two."),                # the last fog leaves; the alarm screams without a sound
    ("nosound", None),                         # wordless: his mouth open, no sound, his heartbeat
    ("cold", "Is he freezing?"),               # his heat stays in: orange glow round him
    ("thermos", "Space is basically"),         # a giant thermos pops in
    ("spit", "But his spit?"),                 # the viewer's second test: tongue to lip; his starts boiling
    ("boil", "With no air"),                   # macro tongue: boiling at 37 C; his tears; frost
    ("oxygen", "Second ten."),                 # the dive into his lung: the oxygen pours OUT of his blood
    ("brain", "And that blood"),               # his head as an x-ray: the dark blood climbs to the brain
    ("lights", "Fourteen..."),                 # the brain's city goes dark
    ("black", None),                           # wordless: black, a heartbeat
    ("turn", "He's out."),                     # the airlock: he floats limp; a different clock
    ("ball", "Ball, the camera"),              # Ball tries to fly to him: its fans spin, nothing happens
    ("sister", "Down the hall"),               # the corridor: his sister, the commander, launches
    ("swell", "Second twenty."),               # he swells, and so does his bag of chips
    ("pop", None),                             # wordless: the bag bursts without a sound
    ("pinch", "Pinch the skin"),               # the viewer's third test: the skin snaps back
    ("kitt1", "In 1960,"),                     # the gondola, nineteen miles up (old film)
    ("kitt2", "One of his gloves"),            # his hand swells to twice its size
    ("kitt3", "and three hours"),              # the hand back to normal
    ("leb1", "Second thirty."),                # the airlock: the clock at thirty; "one man knows"
    ("leb2", "In 1966,"),                      # the vacuum chamber (old film): the hose comes loose
    ("leb3", "He stayed awake"),               # 14 SECONDS; the spit on his tongue, bubbling
    ("leb4", "They pumped"),                   # the valve; the air back; FINE
    ("gut", "Second forty-five."),             # his gut swells; "Yes. That gas."
    ("heart", "Second sixty."),                # the heart monitor slows
    ("edge", "So how long"),                   # the clock; 1960s animal tests (old film)
    ("dogs", "Every dog brought"),             # the window: 0-90 s lived; three minutes, most did not
    ("soyuz", "In 1971,"),                     # the Soyuz 11 capsule coming home; three portraits
    ("repress", "Second eighty."),             # her hand slams REPRESS
    ("rush", None),                            # wordless: the hatch shuts, the air roars back, the sound returns
    ("wake", "Second ninety."),                # his eyes open; Ball's happy eyes; his sister
    ("palm", "Hold out your hand."),           # the viewer's fourth test: the air presses on the palm
    ("apart", "Space doesn't pull"),           # the air round him: it was holding him together all along
    ("puffy", "He was puffy"),                 # his puffy face; her look
    ("selfie", "So: one more"),                # two helmets, Ball's flash; Pip's reply
    ("button", "Turns out..."),                # Pip's room: the bowl, the photo; the push into the bowl
    ("final", None),                           # the final image: the Earth's thin blue line, the station crossing
    ("sub", "Next week:"),                     # the Earth, the subscribe pill
]
special = {
    "nosound": mute - 0.05,
    "black": dark,
    "pop": pop - 0.12,
    "rush": slam + 0.35,
    "final": final - 0.1,
}

CHUNKS = [
    "You're in space.", "No suit.", "Your instinct?", "Hold your breath.", "WRONG.",
    "Breathe OUT,", "with him...", "all of it...", "now.",
    "Holding it in", "could tear your lungs.", "Now, second by second,", "here's what your body does...", "and how long", "a rescue has.",
    "All he wanted", "was a selfie", "for his niece, Pip.", "Without the helmet.", '"You look like', 'a goldfish,"', "she said.",
    "So he pressed", "the button marked", "DEPRESS...", "thinking it meant", '"take the picture."',
    "Second one.", "Good news:", "you don't explode.", "That's just the movies.", "Your skin is", "tougher than that.",
    "Second two.", "The air is gone...", "and so is the sound.", "The alarm is screaming.", "He can't hear a thing.",
    "Is he freezing?", "Not yet.", "Space is cold,", "but empty:", "there's nothing to carry", "his heat away.", "Space is basically...", "a giant thermos.",
    "But his spit?", "Touch your tongue", "to your lip.", "Feel that?", "Second five:", "his is boiling.",
    "With no air", "pressing on it,", "water boils", "at body temperature.", "His spit.", "His tears.", "And all that boiling", "steals heat...", "so his mouth gets cold.", "Almost freezing.",
    "Second ten.", "The real danger", "is in here.", "His lungs are empty,", "so the oxygen", "in his blood", "pours OUT...", "the wrong way.",
    "And that blood,", "with almost", "nothing left in it,", "is on its way", "to his brain.",
    "Fourteen...", "fifteen...", "lights out.",
    "He's out.", "Not dead...", "out.", "And now,", "a different clock starts.",
    "Ball,", "the camera drone,", "wants to help.", "But its fans", "need air", "to push against.", "Right now,", "Ball is just...", "a ball.",
    "Down the hall,", "the alarm reaches", "his big sister,", "the commander.", "She's been rescuing him", "since he was four.",
    "Second twenty.", "The water in his body", "is turning to gas.", "He's swelling...", "like his bag of chips.",
    "Pinch the skin", "on the back of your hand.", "Let go.", "It snaps back,", "right?", "That's what's", "holding him together.",
    "In 1960,", "a pilot named", "Joe Kittinger", "rode a balloon", "nineteen miles up.", "One of his gloves", "failed.", "His hand swelled", "to twice its size...",
    "and three hours", "after he landed,", "the swelling was gone.",
    "Second thirty.", "What does this", "feel like?", "One man knows.", "In 1966,", "Jim LeBlanc", "was testing a spacesuit", "in a NASA", "vacuum chamber,",
    "when its air hose", "came loose.",
    "He stayed awake", "for about", "fourteen seconds.", "The last thing", "he remembered?", "The spit on his tongue...", "starting to bubble.",
    "They pumped the air", "back in,", "fast.", "And he was fine.", "He just couldn't", "taste much...", "for four days.",
    "Second forty-five.", "Every bit of gas", "in his gut", "is swelling too.", "Yes.", "That gas.",
    "Second sixty.", "His heart", "is still beating...", "but slower,", "and slower.",
    "So how long", "does he have?", "Nobody's allowed", "to test that", "on a person.", "In the nineteen-sixties,", "they tested it", "on animals.",
    "Every dog", "brought back", "within ninety seconds", "lived.", "After about", "three minutes...", "most didn't.",
    "In 1971,", "a valve opened", "on a Soyuz capsule,", "on its way home.", "Its three cosmonauts", "are still the only people", "who ever died", "in space.",
    "Second eighty.", "Her hand", "hits REPRESS.",
    "Second ninety.", "Air.", "And like", "Jim LeBlanc...", "he wakes up.",
    "Hold out your hand.", "Right now,", "the air is pressing on it", "with the weight", "of a grown-up.", "You don't feel it,", "because your body", "pushes back", "just as hard.",
    "Space doesn't", "pull you apart.", "It just stops", "holding you together.",
    "He was puffy", "for a couple of days.", "His pride...", "a lot longer.",
    "So:", "one more selfie.", "Helmet on.", "Goldfish bowl", "and all.",
    "Turns out...", "we all live", "in a goldfish bowl.", "Ours is just", "very big...", "and very thin.",
    "Next week:", "what happens if you", "stop brushing your teeth.", "Subscribe...", "and keep", "your helmet on.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "space": C, "suit": R, "breath": C, "don't": R, "out": Y, "now": Y, "tear": R, "lungs": R, "rescue": G,
    "selfie": Y, "pip": PK, "helmet": C, "goldfish": O, "depress": R, "picture": Y,
    "1": Y, "explode": R, "movies": V, "skin": O, "2": Y, "sound": C, "screaming": R, "can't": R,
    "freezing": C, "cold": C, "empty": V, "heat": O, "thermos": Y,
    "spit": C, "tongue": PK, "lip": PK, "5": Y, "boiling": R, "boils": R, "body": O, "tears": C, "frost": C,
    "10": Y, "danger": R, "oxygen": C, "pours": R, "wrong": R, "brain": PK, "14": Y, "15": Y, "lights": R,
    "dead": R, "different": Y, "clock": Y, "sister": O, "commander": O, "four": Y,
    "20": Y, "gas": V, "swelling": R, "chips": Y, "snaps": G, "together": G,
    "1960": Y, "kittinger": Y, "19": Y, "miles": Y, "leaked": R, "twice": R, "three": Y, "hours": Y, "normal": G,
    "30": Y, "knows": Y, "1966": Y, "leblanc": Y, "nasa": B, "vacuum": V, "hose": R, "14": Y, "bubble": C,
    "fine": G, "45": Y, "gut": V, "that": V, "60": Y, "heart": R, "slower": R,
    "1960s": Y, "animals": O, "dogs": O, "90": Y, "lived": G, "didn't": R,
    "grown-up": Y, "pushes": O, "hard": O, "apart": R, "holding": G,
    "80": Y, "repress": G, "air": C, "wakes": G, "puffy": PK, "pride": PK, "bowl": C, "thin": C, "big": Y,
    "teeth": Y, "subscribe": R,
}
DISPLAY = {
    "second one": ["SECOND", "1"], "second two": ["SECOND", "2"], "second five": ["SECOND", "5"], "second ten": ["SECOND", "10"],
    "second twenty": ["SECOND", "20"], "second thirty": ["SECOND", "30"], "second forty-five": ["SECOND", "45"],
    "second sixty": ["SECOND", "60"], "second eighty": ["SECOND", "80"], "second ninety": ["SECOND", "90"],
    "fourteen": ["14..."], "fifteen": ["15..."], "in 1960": ["IN", "1960"], "in 1966": ["IN", "1966"],
    "nineteen miles up": ["19", "MILES", "UP"], "fourteen seconds": ["14", "SECONDS"], "in the nineteen-sixties": ["IN", "THE", "1960s"],
    "ninety seconds": ["90", "SECONDS"], "at body temperature": ["AT", "BODY", "TEMPERATURE"],
}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
S0 = {s["id"]: s["start"] for s in shots}
S1 = {s["id"]: s["end"] for s in shots}

cues = {
    # ---- the hook: the held breath, DON'T, the breath out
    "dont": W("WRONG."), "breatheOut": W("Breathe OUT"), "allofit": W("all of it"), "now": now, "tick0": now,
    "tear": W("tear your lungs"), "rescue": W("rescue has."),
    "want": W("All he wanted"), "noHelmet": W("Without the helmet"), "goldfish": W("goldfish,\""), "pressed": W("So he pressed"),
    "depressW": W("DEPRESS..."), "thinking": W("thinking it meant"), "picture": W("picture.\""),
    # ---- act 1: what he feels
    "s1": W("Second one."), "noExplode": W("you don't explode"), "movies": W("That's just the movies"), "skin": W("Your skin is"),
    "s2": W("Second two."), "gone": W("air is gone"), "soundGone": W("so is the sound"), "alarmW": W("alarm is screaming"), "mute": mute,
    "freezing": W("Is he freezing?"), "notyet": W("Not yet."), "empty": W("but empty"), "heatAway": W("his heat away"), "thermosW": W("a giant thermos"),
    "spit": W("But his spit?"), "touch": W("Touch your tongue"), "feel": W("Feel that?"), "s5": W("Second five:"), "boilingW": W("his is boiling"),
    "noair": W("With no air"), "bodyT": W("at body temperature"), "tearsW": W("His tears."), "steals": W("steals heat"), "frost": W("Almost freezing"),
    "s10": W("Second ten."), "inhere": W("is in here"), "lungsEmpty": W("lungs are empty"), "pours": W("pours OUT"), "wrongWay": W("the wrong way"),
    "thatBlood": W("And that blood"), "toBrain": W("to his brain"),
    "s14": W("Fourteen..."), "s15": W("fifteen..."), "lightsOut": W("lights out"), "dark": dark,
    # ---- act 2: the race, what breaks, the proof
    "heOut": W("He's out."), "notDead": W("Not dead"), "newClock": W("a different clock"),
    "ballW": W("Ball, the camera"), "fans": W("But its fans"), "pushAg": W("to push against"), "justBall": W("Ball is just"), "aBall": W("a ball."),
    "hall": W("Down the hall"), "sisW": W("his big sister"), "commander": W("the commander"), "four": W("since he was four"),
    "s20": W("Second twenty."), "gasW": W("turning to gas"), "swellW": W("He's swelling"), "chipsW": W("like his bag of chips"), "pop": pop,
    "pinch": W("Pinch the skin"), "letgo": W("Let go."), "snaps": W("It snaps back"), "together1": W("holding him together"),
    "k1960": W("In 1960,"), "kitt": W("Joe Kittinger"), "miles": W("nineteen miles up"), "leaked": W("One of his gloves"), "twice": W("to twice its size"),
    "threeH": W("and three hours"), "normal": W("the swelling was gone"),
    "s30": W("Second thirty."), "knows": W("One man knows"), "y1966": W("In 1966,"), "leblanc": W("Jim LeBlanc"), "chamber": W("vacuum chamber"),
    "hose": W("came loose"), "awake": W("He stayed awake"), "fourteen": W("fourteen seconds"), "lastThing": W("The last thing"),
    "bubble": W("starting to bubble"), "pumped": W("They pumped"), "fine": W("he was fine"), "taste": W("couldn't taste much"), "fourDays": W("for four days"),
    "s45": W("Second forty-five."), "gutW": W("in his gut"), "yes": W("Yes. That gas."), "thatGas": W("That gas."),
    "s60": W("Second sixty."), "beating": W("still beating"), "slower": W("but slower"),
    # ---- act 3: the edge, the rescue
    "howLong": W("So how long"), "nobody": W("Nobody's allowed"), "sixties": W("nineteen-sixties,"), "animals": W("on animals"),
    "dogsW": W("Every dog brought"), "ninety": W("ninety seconds"), "lived": W("lived.", s=find("Every dog")), "longer": W("After about three"), "didnt": W("most didn't"),
    "y1971": W("In 1971,"), "valve": W("a valve opened"), "home": W("on its way home"), "cosmo": W("Its three cosmonauts"), "onlyDied": W("who ever died"),
    "palm": W("Hold out your hand."), "pressing": W("air is pressing"), "grownup": W("of a grown-up"), "pushBack": W("pushes back"),
    "apart": W("Space doesn't pull"), "stops": W("It just stops"),
    "s80": W("Second eighty."), "hand": W("Her hand"), "slam": slam,
    "s90": W("Second ninety."), "air": air, "likeLB": W("And like Jim"), "wakes": W("he wakes up"),
    "puffy": W("He was puffy"), "pride": W("His pride"),
    "selfie": W("one more selfie"), "helmetOn": W("Helmet on."), "bowlW": W("Goldfish bowl and all"),
    "button": W("Turns out..."), "weAll": W("we all live"), "ours": W("Ours is just"), "thin": W("very thin"), "final": final,
    "sub": W("Next week:"), "teeth": W("brushing your teeth"),
}
# his sister's run, shown in a small window during act 2: she launches on "the commander", reaches the inner hatch on
# "Second sixty", and her face is at the window from "So how long"
cues["sisGo"] = cues["commander"]
cues["sisWin"] = cues["s60"] + 1.5
# ---- the clock (web/hud.js): [t, text, kind, label, n0, n1, dt]: "{n}" counts from n0 to n1 over dt seconds of film
def tick(t0, n0, n1, t1, kind="", label="NO SUIT"):
    return [round(t0, 3), "SECOND {n}", kind, label, n0, n1, round(max(0.05, t1 - t0), 3)]
cues["clock"] = [
    tick(now - 0.05, 0, 1, cues["s1"] - 0.05, "go", "IN SPACE, NO SUIT"),
    tick(cues["s1"] - 0.05, 1, 2, cues["s2"] - 0.05, "", "IN SPACE, NO SUIT"),
    tick(cues["s2"] - 0.05, 2, 5, cues["s5"] - 0.05, "", "IN SPACE, NO SUIT"),
    tick(cues["s5"] - 0.05, 5, 10, cues["s10"] - 0.05, "", "IN SPACE, NO SUIT"),
    tick(cues["s10"] - 0.05, 10, 14, cues["s14"] - 0.05, "", "IN SPACE, NO SUIT"),
    tick(cues["s14"] - 0.05, 14, 15, cues["s15"] - 0.05, "red", "AWAKE"),
    tick(cues["s15"] - 0.05, 15, 15, cues["s15"] + 0.1, "red", "LIGHTS OUT"),
    tick(cues["newClock"] - 0.05, 15, 20, cues["s20"] - 0.05, "red", "UNCONSCIOUS"),
    tick(cues["s20"] - 0.05, 20, 30, cues["s30"] - 0.05, "red", "UNCONSCIOUS"),
    tick(cues["s30"] - 0.05, 30, 45, cues["s45"] - 0.05, "red", "UNCONSCIOUS"),
    tick(cues["s45"] - 0.05, 45, 60, cues["s60"] - 0.05, "red", "UNCONSCIOUS"),
    tick(cues["s60"] - 0.05, 60, 80, cues["s80"] - 0.05, "red", "UNCONSCIOUS"),
    tick(cues["s80"] - 0.05, 80, 90, cues["s90"] - 0.05, "red", "UNCONSCIOUS"),
    [round(cues["s90"] - 0.05, 3), "SECOND 90", "green", "AIR!"],
    [round(cues["wakes"] - 0.05, 3), "BREATHING", "green", "AWAKE"],
]
# ---- the payoffs (the every-second rule): small ones (pay_) and big ones (big_); audio.py builds into each
for name, t in {
    "pay_dont": cues["dont"], "big_now": E("now.") + 0.06, "pay_tear": cues["tear"] + 0.3, "pay_rescue": cues["rescue"],
    "pay_goldfish": cues["goldfish"], "pay_depress": cues["depressW"], "pay_picture": cues["picture"] + 0.3,
    "big_myth": cues["noExplode"] + 0.4, "pay_skin": cues["skin"], "big_mute": mute, "pay_thermos": cues["thermosW"] + 0.4,
    "big_boil": cues["boilingW"] + 0.2, "pay_body": cues["bodyT"], "pay_frost": cues["frost"], "big_out": cues["pours"],
    "pay_brain": cues["toBrain"], "big_dark": cues["lightsOut"], "pay_clock": cues["newClock"], "pay_sis": cues["commander"],
    "pay_four": cues["four"] + 0.5, "pay_swell": cues["swellW"], "big_pop": pop, "pay_snap": cues["snaps"],
    "pay_miles": cues["miles"], "big_twice": cues["twice"], "pay_normal": cues["normal"], "pay_knows": cues["knows"],
    "pay_hose": cues["hose"], "pay_fourteen": cues["fourteen"], "big_bubble": cues["bubble"], "pay_fine": cues["fine"], "pay_taste": cues["fourDays"] + 0.3,
    "pay_gas": cues["thatGas"] + 0.3, "pay_slower": cues["slower"], "pay_animals": cues["animals"], "big_ninety": cues["ninety"],
    "pay_didnt": cues["didnt"], "pay_ball": cues["aBall"] + 0.25, "big_soyuz": cues["onlyDied"], "pay_grownup": cues["grownup"], "pay_push": cues["pushBack"], "big_apart": cues["stops"],
    "big_slam": slam, "big_air": air, "pay_wakes": cues["wakes"], "pay_pride": cues["pride"] + 0.5, "pay_selfie": cues["helmetOn"],
    "pay_bowl": cues["weAll"], "big_final": final,
}.items():
    cues[name] = round(t, 3)

# ---- the subscribe cue (web/subscribe.js): the pill pops just before "Subscribe", the click right after it
cues["sub_in"] = max(0.0, min(W("Subscribe...") - 0.30, T.duration - 2.6))
cues["sub_tap"] = min(E("Subscribe...") + 0.12, T.duration - 0.8)
T.write(shots, caps, cues, width=1920, height=1080)
print(f"now {now:.2f}  mute {mute:.2f}  dark {dark:.2f}  pop {pop:.2f}  slam {slam:.2f}  air {air:.2f}  final {final:.2f}  sub_in {cues['sub_in']:.2f}")
