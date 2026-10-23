"""Edit timeline for "What Happens If You Stop Eating? (Day by Day)" (long-form, 1920x1080, 4:00-5:00, never over 5:15).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
The clock (cues.clock, drawn by web/hud.js) counts the hours, then the days, since his last meal (the lemon): HOUR 0 on
"never comes", then it creeps forward ("{n}") and jumps on the beats: HOUR 4, 6, 18, DAY 1, 2, 3, 5, 6, 7.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.6)
W, E, ev, find = T.W, T.E, T.ev, T.find

# v3's alignment can crowd a phrase into the pause before it: realign.py re-times the words with whisper (.work/align.json;
# build.sh copies src/voice/align.json there). Whisper drags words across long pauses, so a block takes its whisper
# times only when some of its words sit in silence (< -38 dB) and whisper puts fewer there.
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

S_PIP2 = find("Pip, on the radio")
S_VIT = find("water and vitamins")
grab = E("bag.") + 0.05                          # the fox grabs the food bag (wordless)
h0 = E("comes.") + 0.12                          # HOUR 0: the clock starts
snap = W("She gives") - 1.45                     # Pip snaps the bar in two (wordless)
final = E("half.", s=find("She gives")) + 0.45                        # the final image
sunUp = E("seven.") + 0.12                       # the storm breaks: daylight floods the window

SHOTS = [
    ("hook", None),                              # his face, close, mid-bite into a lemon; 382 DAYS
    ("bite", "But first..."),                    # closer: the lemon at his mouth; the badge; he bites on "Now"
    ("water", "Your mouth just watered"),        # the mouth's taps in a window on his cheek
    ("ready", "That's your body"),               # the see-through body: the stomach lights up, READY
    ("never", "Now imagine"),                    # pull back: the hut, the storm, HOUR 0
    ("want", "He climbed"),                      # the summit shop in the sun; the bar held high; Pip's note
    ("storm", "On the way down"),                # night, the storm; the hut; the fox takes the food bag
    ("lemon", "All he had left"),                # the lemon in his hand; deadpan
    ("radio", "The radio says"),                 # the radio: A WEEK?!; Pip's question
    ("growl", "Hour four."),                     # his belly growls; the fox's ears
    ("clean", "It's not asking"),                # the stomach sweeping itself
    ("echo", "With nothing in there"),           # the growl echoes round the hut
    ("alarm", "Hour six."),                      # lunchtime: the alarm clock rings on his stomach
    ("clock", "It's not a fuel gauge"),          # the gauge crossed out, the alarm clock, the meal times
    ("snooze", "Ignore it"),                     # the alarm dozes... 19:00
    ("fist", "Make a fist."),                    # the viewer's fist; his
    ("pantry", "Your muscles keep"),             # the muscle's own sugar; the liver's pantry; ONE DAY
    ("hangry", "Hour eighteen."),                # the pantry nearly empty; he loses an argument with the fox
    ("easy", "Day one."),                        # outside, wide: the hut tiny in the storm
    ("borrow", "Day two."),                      # colder; the body borrows from muscle
    ("borrow2", "Remember your fist?"),          # his fist: BORROWED
    ("switch", "Day three:"),                    # fat to new fuel; the brain goes green
    ("lunch", "Turns out, your body"),           # the packed lunch; the bar is a tenth of a day
    ("breath", "Breathe on your hand."),         # the viewer's breath; the fox faints
    ("quiet", "And the weirdest part?"),         # the hunger knob turns down
    ("minnesota", "In 1944,"),                   # old film: the dining hall
    ("minnesota2", "so doctors could learn"),   # the scale's needle sinks; TO FEED EUROPE
    ("obsessed", "Their minds"),                 # cookbooks, dreams, gum
    ("day5", "Day five."),                       # the wrapper read to the fox
    ("pip2", "Pip, on the radio"),               # Pip's question again
    ("edge", "So how long"),                     # the ladder of days; DO NOT TRY THIS
    ("pulse", "Find your pulse"),                # the viewer's pulse: six seconds
    ("zero", "Add a zero."),                     # x10; 60-100
    ("heart", "The Minnesota men"),              # 35; the heart shrinks
    ("limit", "With water,"),                    # one to two months
    ("limit2", "After the fat runs out"),        # fat, then protein, then the heart
    ("barbieri", "Except one man."),             # 1965: 207 KG
    ("barbieri2", "With doctors watching"),      # the vitamins; the calendar flips to 382
    ("toilet", "He lost a hundred"),             # -125 KG; once every forty days
    ("egg", "His first meal?"),                  # one boiled egg
    ("day6", "Day six."),                        # midnight: he unwraps the bar (the wordless beat)
    ("wrap", "and wraps it back up"),            # ...and wraps it back up; pats it
    ("rescue", "Day seven."),                    # daylight; the helicopter
    ("soup", "The rescuers"),                    # the cup of soup; the mouth waters again
    ("slow", "Just a cup"),                      # start small
    ("home", "At home,"),                        # Pip's kitchen: the bar handed over
    ("reveal", "Every night,"),                  # her question was about him
    ("half", None),                              # SNAP; the bigger half
    ("final", None),                             # the final image
    ("sub", "Next week:"),                       # NEXT WEEK: the tooth; the subscribe pill
]
special = {"half": snap - 0.55, "final": final - 0.1}

CHUNKS = [
    "What happens if you", "stop eating?", "One man lasted", "three hundred and eighty-two days.", "But first...", "bite a lemon.", "In your head.", "Now.",
    "Your mouth just watered,", "right?", "That's your body", "getting ready for food...", "from a thought.", "Now imagine", "the food never comes.",
    "He climbed the mountain", "for one thing:", "Pip's favourite chocolate,", "from the shop at the top.",
    "On the way down,", "a storm hit.", "He made it", "to an empty hut...", "and a fox made it", "to his food bag.",
    "All he had left...", "was a lemon.",
    "The radio says", "the storm could last", "a week.", "And Pip has", "one question:", '"Is my chocolate okay?"',
    "Hour four.", "His stomach growls.", "It's not asking for food...", "it's cleaning.", "Every couple of hours,", "an empty stomach", "squeezes out the leftovers.", "With nothing in there...", "it echoes.",
    "Hour six.", "Lunchtime...", "and here comes the hunger,", "right on time.", "It's not a fuel gauge.", "It's an alarm clock:", "your body learned", "when you eat.",
    "Ignore it...", "and it goes quiet.", "Until dinner.",
    "Make a fist.", "Squeeze.", "Your muscles keep sugar", "for themselves.", "Your brain lives", "on the stash", "in your liver...", "about one day's worth.",
    "Hour eighteen.", "The stash is almost gone,", "and he just lost", "an argument...", "with a fox.",
    "Day one.", "And this...", "is the easy part.",
    "Day two.", "The brain still needs sugar,", "so the body makes some...", "from protein.", "Remember your fist?", "It's borrowing", "from muscle.",
    "Day three:", "the big switch.", "The liver starts", "turning fat", "into a new fuel...", "and the brain", "starts running on it.",
    "Turns out,", "your body packed a lunch:", "weeks of it,", "as fat.", "That chocolate bar?", "About a tenth", "of one day.",
    "Breathe on your hand.", "Smell it.", "Nail polish remover?", "No?", "By day three...", "his breath is.",
    "And the weirdest part?", "For a lot of people,", "the hunger...", "gets quieter.",
    "In 1944,", "thirty-six volunteers", "in Minnesota", "ate half their usual food", "for six months,", "so doctors could learn", "to feed a starving Europe.",
    "Their minds", "changed most.", "They read cookbooks", "like novels,", "dreamed about food...", "and chewed gum", "by the pack.",
    "Day five.", "He's read", "the chocolate wrapper", "eleven times.", "Now he reads it...", "to the fox.",
    "Pip,", "on the radio:", '"Is my chocolate okay?"',
    "So how long", "could he last?", "Nobody's allowed", "to find out.", "Here's why.",
    "Find your pulse,", "on your neck or wrist.", "Count the beats", "for six seconds...", "go.",
    "Add a zero.", "That's your heart rate:", "most people get", "sixty to a hundred.",
    "The Minnesota men,", "by the end?", "About thirty-five.", "A heart is a muscle...", "and a starving body", "eats muscle.",
    "With water,", "most healthy people", "would last", "one to two months.", "After the fat runs out,", "the body eats", "its own protein...", "and in the end,", "the heart.",
    "Except one man.", "In 1965,", "Angus Barbieri", "weighed over", "two hundred kilos.", "With doctors watching,", "he lived on", "water and vitamins...", "for three hundred", "and eighty-two days.",
    "He lost", "a hundred and twenty-five kilos.", "And he went", "to the toilet...", "about once", "every forty days.",
    "His first meal?", "One boiled egg.",
    "Day six.", "Midnight.", "The worst of the storm.", "He unwraps", "the chocolate...",
    "...and wraps it", "back up.",
    "Day seven.", "The storm breaks.",
    "The rescuers", "hand him", "a cup of soup.", "Your mouth", "just watered again,", "didn't it?", "So did his.",
    "Just a cup:", "after days", "without food,", "the first meals", "start small.",
    "At home,", "he hands Pip", "her chocolate.", "Not one bite", "missing.",
    "Every night,", "she'd asked", "about the chocolate.", "Because if", "the chocolate was okay...", "so was he.",
    "She gives him", "the bigger half.",
    "Next week:", "what happens if you", "stop brushing your teeth.", "Subscribe...", "and go eat something.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "stop": R, "eating": R, "382": Y, "days": Y, "lemon": Y, "now": Y,
    "watered": C, "ready": G, "thought": V, "never": R,
    "mountain": B, "pip's": PK, "chocolate": O, "storm": C, "fox": O, "bag": R,
    "week": R, "okay": PK,
    "four": Y, "growls": Y, "cleaning": G, "leftovers": O, "echoes": Y,
    "six": Y, "lunchtime": Y, "hunger": R, "time": Y, "gauge": V, "alarm": Y, "clock": Y, "learned": G,
    "quiet": C, "dinner": Y,
    "fist": O, "squeeze": O, "sugar": Y, "themselves": O, "brain": PK, "liver": R, "day's": Y,
    "eighteen": Y, "gone": R, "argument": O,
    "one": Y, "easy": G,
    "two": Y, "protein": R, "borrowing": R, "muscle": R,
    "three": Y, "switch": G, "fat": Y, "fuel": G, "running": G,
    "lunch": Y, "weeks": Y, "tenth": Y,
    "hand": C, "smell": C, "polish": PK, "remover": PK, "breath": G,
    "weirdest": V, "quieter": C,
    "1944": Y, "thirty-six": Y, "minnesota": B, "half": Y, "months": Y, "europe": O,
    "minds": V, "cookbooks": O, "novels": O, "dreamed": V, "gum": PK, "pack": PK,
    "five": Y, "wrapper": O, "eleven": Y,
    "how": R, "long": R, "nobody's": R,
    "pulse": R, "neck": R, "wrist": R, "seconds": Y, "go": Y,
    "zero": Y, "rate": R, "sixty": G, "hundred": G,
    "thirty-five": R, "heart": R, "starving": R,
    "water": C, "healthy": G, "1965": Y, "barbieri": Y, "kilos": Y, "doctors": C, "vitamins": C, "eighty-two": Y,
    "toilet": V, "forty": Y, "egg": Y,
    "midnight": B, "unwraps": O, "wraps": G,
    "seven": Y, "breaks": G, "soup": O, "again": C, "his": C,
    "small": G, "missing": G, "night": V, "he": PK, "bigger": Y,
    "teeth": Y, "subscribe": R, "something": G,
}
DISPLAY = {
    "three hundred and eighty-two days": ["382", "DAYS."], "for three hundred": ["FOR", "382"], "and eighty-two days": ["DAYS."],
    "in 1944": ["IN", "1944,"], "thirty-six volunteers": ["36", "VOLUNTEERS"], "in 1965": ["IN", "1965,"],
    "two hundred kilos": ["200", "KILOS."], "a hundred and twenty-five kilos": ["125", "KILOS."],
    "sixty to a hundred": ["60", "TO", "100."], "about thirty-five": ["ABOUT", "35."], "for six seconds": ["FOR", "6", "SECONDS..."],
    "one to two months": ["1", "TO", "2", "MONTHS."], "every forty days": ["EVERY", "40", "DAYS."], "eleven times": ["11", "TIMES."],
}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

cues = {
    # ---- the hook
    "n382": W("three hundred", s=find("One man")), "bite": W("bite a lemon"), "now": W("Now.", s=find("In your head")),
    "watered": W("Your mouth just watered"), "ready": W("That's your body"), "thought": W("from a thought"), "imagine": W("Now imagine"), "never": W("never comes"), "h0": h0,
    "climbed": W("He climbed"), "pipsFav": W("Pip's favourite"), "shop": W("from the shop"),
    "storm": W("a storm hit"), "hut": W("He made it"), "foxW": W("and a fox"), "bagW": W("his food bag"), "grab": grab,
    "left": W("All he had left"), "lemonW": W("was a lemon"),
    "radioW": W("The radio says"), "week": W("a week."), "question": W("one question"), "chocOK": W("Is my chocolate okay?"),
    # ---- act 1
    "h4": W("Hour four."), "growls": W("His stomach growls"), "notAsking": W("It's not asking"), "cleaning": W("it's cleaning"),
    "every": W("Every couple of hours"), "squeezes": W("squeezes out"), "nothing": W("With nothing in there"), "echoes": W("it echoes"),
    "h6": W("Hour six."), "lunch": W("Lunchtime..."), "hunger": W("here comes the hunger"), "onTime": W("right on time"),
    "gauge": W("It's not a fuel gauge"), "alarmW": W("It's an alarm clock"), "learned": W("your body learned"),
    "ignore": W("Ignore it"), "goesQuiet": W("it goes quiet"), "dinner": W("Until dinner"),
    "fistW": W("Make a fist."), "squeeze": W("Squeeze."), "muscles": W("Your muscles keep"), "brainLives": W("Your brain lives"),
    "liverW": W("in your liver"), "oneDay": W("about one day's worth"),
    "h18": W("Hour eighteen."), "almost": W("almost gone"), "argument": W("and he just lost"), "withFox": W("with a fox"),
    "d1": W("Day one."), "easyPart": W("is the easy part"),
    # ---- act 2
    "d2": W("Day two."), "stillNeeds": W("The brain still needs"), "makes": W("so the body makes"), "protein": W("from protein"),
    "remember": W("Remember your fist?"), "borrowing": W("It's borrowing"),
    "d3": W("Day three:"), "bigSwitch": W("the big switch"), "fatW": W("turning fat"), "newFuel": W("into a new fuel"), "running": W("starts running on it"),
    "packed": W("your body packed"), "weeks": W("weeks of it"), "chocBarW": W("That chocolate bar?"), "tenth": W("About a tenth"),
    "breatheHand": W("Breathe on your hand."), "smell": W("Smell it."), "polish": W("Nail polish remover?"), "noQ": W("No?"),
    "byDay3": W("By day three"), "hisBreath": W("his breath is"),
    "weirdest": W("And the weirdest part?"), "quieter": W("gets quieter"),
    "y1944": W("In 1944,"), "thirtysix": W("thirty-six volunteers"), "halfFood": W("ate half"), "sixMonths": W("for six months"), "europe": W("to feed a starving Europe"),
    "minds": W("Their minds"), "cookbooks": W("They read cookbooks"), "dreamed": W("dreamed about food"), "gum": W("and chewed gum"),
    "d5": W("Day five."), "wrapper": W("the chocolate wrapper"), "eleven": W("eleven times"), "readsIt": W("Now he reads it"), "toFox": W("to the fox."),
    "pip2": W("Pip, on the radio"), "chocOK2": W("Is my chocolate okay?", s=S_PIP2),
    # ---- act 3
    "howLong": W("So how long"), "nobody": W("Nobody's allowed"), "why": W("Here's why."),
    "findPulse": W("Find your pulse"), "count": W("Count the beats"), "go": W("go.", s=find("Count the beats")),
    "addZero": W("Add a zero."), "heartRate": W("That's your heart rate"), "range": W("sixty to a hundred"),
    "mnMen": W("The Minnesota men"), "t35": W("About thirty-five."), "isMuscle": W("A heart is a muscle"), "eatsMuscle": W("eats muscle."),
    "withWater": W("With water,"), "months": W("one to two months"), "fatRuns": W("After the fat runs out"), "ownProtein": W("its own protein"), "theHeart": W("and in the end"),
    "except": W("Except one man."), "y1965": W("In 1965,"), "angus": W("Angus Barbieri"), "kilos200": W("two hundred kilos"),
    "doctors": W("With doctors watching"), "vitamins": W("water and vitamins"), "d382": W("for three hundred", s=S_VIT), "d382end": E("days.", s=S_VIT),
    "lost": W("He lost"), "toiletW": W("to the toilet"), "forty": W("every forty days"),
    "firstMeal": W("His first meal?"), "eggW": W("One boiled egg"),
    "d6": W("Day six."), "midnight": W("Midnight."), "worst": W("The worst of the storm"), "unwraps": W("He unwraps"), "wrapsBack": W("and wraps it back up"),
    "d7": W("Day seven."), "sunUp": sunUp, "breaks": W("The storm breaks."),
    "rescuers": W("The rescuers"), "soupW": W("a cup of soup"), "wateredAgain": W("Your mouth just watered again"), "soDid": W("So did his."),
    "justCup": W("Just a cup"), "startSmall": W("start small"),
    "atHome": W("At home,"), "hands": W("he hands Pip"), "notOne": W("Not one bite"),
    "everyNight": W("Every night,"), "because": W("Because if"), "soWas": W("so was he"),
    "snap": snap, "bigger": W("the bigger half"), "final": final,
    "sub": W("Next week:"), "teeth": W("brushing your teeth"),
}


# ---- the clock (web/hud.js): [t, text, kind, label, n0, n1, dt]: "{n}" counts from n0 to n1 over dt seconds of film
def tick(t0, txt, n0, n1, t1, kind="", label="NO FOOD"):
    return [round(t0, 3), txt, kind, label, n0, n1, round(max(0.05, t1 - t0), 3)]


c = cues
cues["clock"] = [
    tick(h0 - 0.05, "HOUR {n}", 0, 3, c["h4"] - 0.05, "go", "SINCE HIS LAST MEAL"),
    tick(c["h4"] - 0.05, "HOUR {n}", 4, 5, c["h6"] - 0.05),
    tick(c["h6"] - 0.05, "HOUR {n}", 6, 17, c["h18"] - 0.05),
    tick(c["h18"] - 0.05, "HOUR {n}", 18, 23, c["d1"] - 0.05),
    tick(c["d1"] - 0.05, "DAY {n}", 1, 1, c["d2"] - 0.05),
    tick(c["d2"] - 0.05, "DAY {n}", 2, 2, c["d3"] - 0.05),
    tick(c["d3"] - 0.05, "DAY {n}", 3, 4, c["d5"] - 0.05),
    tick(c["d5"] - 0.05, "DAY {n}", 5, 5, c["d6"] - 0.05, "red"),
    tick(c["d6"] - 0.05, "DAY {n}", 6, 6, c["d7"] - 0.05, "red"),
    [round(c["d7"] - 0.05, 3), "DAY 7", "green", "THE STORM BREAKS"],
    [round(c["atHome"] - 0.05, 3), "DAY 7", "gold", "HOME"],
]
# ---- the payoffs (the every-second rule): small ones (pay_) and big ones (big_); audio.py builds into each
for name, t in {
    "pay_382": c["n382"] + 0.25, "big_now": c["now"], "pay_watered": c["watered"] + 0.5, "pay_ready": c["ready"] + 0.5, "big_h0": h0,
    "pay_pipsFav": c["pipsFav"], "pay_storm": c["storm"], "big_grab": grab, "pay_lemon": c["lemonW"] + 0.45, "pay_week": c["week"],
    "big_chocOK": c["chocOK"] + 0.25,
    "pay_growls": c["growls"], "pay_cleaning": c["cleaning"], "big_echo": c["echoes"] + 0.1, "pay_hunger": c["hunger"], "big_alarm": c["alarmW"],
    "pay_learned": c["learned"] + 0.2, "pay_dinner": c["dinner"], "pay_squeeze": c["squeeze"], "pay_lock": c["muscles"] + 0.4, "pay_oneDay": c["oneDay"],
    "pay_almost": c["almost"], "pay_fox": c["withFox"] + 0.25, "big_d1": c["d1"], "pay_easy": c["easyPart"],
    "pay_protein": c["protein"], "pay_borrowing": c["borrowing"] + 0.25, "pay_bigSwitch": c["bigSwitch"], "big_switch": c["running"] + 0.1,
    "pay_weeks": c["weeks"], "big_tenth": c["tenth"], "pay_polish": c["polish"], "big_faint": E("is.", s=find("his breath is")) + 0.9,
    "pay_quieter": c["quieter"], "pay_1944": c["y1944"], "pay_months": c["sixMonths"], "pay_europe": c["europe"],
    "pay_cookbooks": c["cookbooks"], "pay_dream": c["dreamed"] + 0.1, "pay_gum": c["gum"] + 0.3, "pay_eleven": c["eleven"], "big_toFox": c["toFox"],
    "pay_chocOK2": c["chocOK2"], "pay_howLong": c["howLong"] + 0.3, "big_nobody": c["nobody"] + 0.3, "pay_go": c["go"],
    "big_count": c["addZero"], "pay_range": c["range"] + 0.1, "big_35": c["t35"], "pay_eats": c["eatsMuscle"],
    "pay_monthsLimit": c["months"] + 0.2, "pay_heartEnd": c["theHeart"] + 0.3, "pay_1965": c["y1965"], "pay_207": c["kilos200"],
    "big_382": c["d382end"] + 0.3, "pay_lost": c["lost"] + 1.0, "big_forty": c["forty"] + 0.3, "pay_egg": c["eggW"],
    "big_unwrap": c["unwraps"] + 0.3, "big_wrap": c["wrapsBack"], "big_sunUp": sunUp, "pay_breaks": c["breaks"] + 0.6,
    "pay_soup": c["soupW"], "pay_watered2": c["wateredAgain"] + 0.2, "pay_soDid": c["soDid"], "pay_small": c["startSmall"] + 0.4,
    "pay_notOne": c["notOne"] + 0.2, "big_soWas": c["soWas"], "big_snap": snap, "pay_bigger": c["bigger"] + 0.3, "big_final": final,
}.items():
    cues[name] = round(t, 3)

# ---- the subscribe cue (web/subscribe.js): the pill pops just before "Subscribe", the click right after it
cues["sub_in"] = max(0.0, min(W("Subscribe...") - 0.30, T.duration - 2.6))
cues["sub_tap"] = min(E("Subscribe...") + 0.12, T.duration - 0.8)
T.write(shots, caps, cues, width=1920, height=1080)
print(f"h0 {h0:.2f}  grab {grab:.2f}  snap {snap:.2f}  sunUp {sunUp:.2f}  final {final:.2f}  sub_in {cues['sub_in']:.2f}")
