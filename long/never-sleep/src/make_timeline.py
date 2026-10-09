"""Edit timeline for "What Happens If You NEVER Sleep? (Day by Day)" (long-form, 1920x1080, 4:00-5:00, never over 5:15).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.6)
W, E, ev, find = T.W, T.E, T.ev, T.find

# v3's alignment can hand a pause to the next word: snap every word's start to its first loud frame.
for i in range(len(T.words)):
    fl = T.first_loud(T.ws[i], span=max(0.02, T.we[i] - T.ws[i] + 0.1))
    if fl - T.ws[i] > 0.08:
        T.ws[i] = T.words[i]["start"] = round(min(fl, T.we[i] - 0.04), 3)

SHOTS = [
    ("hook", None),                        # his face, the pot at his mouth; pulls back to the room and the book
    ("cat", "His cat sleeps"),             # the cat asleep on the right seat
    ("champion", "So he'll be"),           # he raises the #1 mug
    ("book", "Eleven days? How"),          # the record book: 11 DAYS
    ("very", "Very."),                     # hard cut wide: tiny him, the huge night
    ("pile", "Hour sixteen"),              # inside his head: the violet pile grows
    ("locks", "Coffee doesn't clear"),     # beans plug the locks; tape over the TIRED lamp
    ("blind", "He's not less tired"),      # his face: wide eyes, bags arriving
    ("drunk", "Hour seventeen"),           # split: 17 HOURS AWAKE vs A FEW DRINKS
    ("toast", "He hasn't had"),            # he butters his phone
    ("dawn", "Hour twenty-four"),          # sunrise, he feels great
    ("bell", "That's a trap"),             # his head: the morning bell rings, the pile is still there
    ("alarm", "And his feelings"),         # the city: the alarm centre flares, +60%
    ("cereal", "He's sobbing"),            # the TV ad, and him sobbing
    ("city", "Hour thirty"),               # patches of the city go dark
    ("skip", None),                        # wordless: the world skips
    ("micro", "A microsleep"),             # his blank face, the lost seconds
    ("couch", "On a couch"),               # he jolts awake on the couch
    ("road", "At the wheel"),              # the night road, the lids closing
    ("easy", None),                        # the clock spins to day two
    ("day2", "Day two"),                   # the blanket, the donut tower
    ("nap", "And his brain keeps"),        # the brain with the pillow
    ("day3", "Day three"),                 # the room wobbles; the coat
    ("coat", None),                        # wordless + "turns its head"
    ("seeing", "Seeing things"),           # the wallpaper crawls, he backs away
    ("catspeak", "He's fairly sure"),      # the cat opens one eye: GO TO BED
    ("randy", "Could anyone really"),      # the record book page: RANDY GARDNER 1964, dive in
    ("sixty4", "San Diego"),               # 1964: the den, the science-fair poster
    ("watch", "A sleep scientist"),        # the scientist arrives; Randy moody, seeing things
    ("pinball", "To keep him awake"),      # pinball: Randy wins
    ("count", "Day eleven They asked"),    # the chalkboard
    ("sevens", "A hundred ninety-three"),  # the numbers, slower and slower
    ("stop", None),                        # wordless: the chalk stops
    ("record", "Eleven days and"),         # 11 DAYS 24 MIN
    ("slept", "Then he slept"),            # Randy asleep, 14 hours
    ("refused", "So our hero"),            # NO LONGER ACCEPTED
    ("rats", "In the nineteen-eighties"),  # the rat lab
    ("ratsdead", "Within weeks"),          # the lamp dims; ?
    ("flies", "In twenty-twenty"),         # the giant fly
    ("gut", "Not the brain"),              # the x-ray belly: the gut glows
    ("mop", "Mop it up"),                  # blue drops; lifespan bars
    ("rinse", "So what is sleep"),         # brain tissue, the rinse
    ("opposite", "That's in mice"),        # MICE 2013 / MICE 2024
    ("argue", "Scientists are still"),     # two scientists arguing; STILL ARGUING
    ("jelly", "But here's the weirdest"),  # the night sea floor, jellyfish
    ("older", "So sleep may be"),          # rising toward the moonlit surface
    ("bed", None),                         # wordless: home; he closes the book, lies down
    ("champ", "Turns out the champion"),   # the cat climbs on; dawn
    ("final", None),                       # the final image
    ("sub", "Next week"),                  # the same image, the pill
]
special = {
    "skip": E("awake.", s=find("while he's still")) + 0.35,
    "easy": W("that was the easy") - 0.45,
    "coat": E("door...") + 0.12,
    "stop": E("sixty-five...") + 0.35,
    "bed": E("it.", s=find("skip it")) + 0.4,
    "final": E("time.", s=find("the whole time")) + 0.35,
}

CHUNKS = [
    "You chug a whole", "pot of coffee...", "so what happens", "if you never sleep?",
    "Day by day...", "all the way to day eleven:", "the record nobody", "is allowed to try anymore.",
    "His cat sleeps", "most of the day.", "So he'll be the champion", "of NOT sleeping.",
    "Eleven days?", "How hard can it be?", "Very.",
    "Hour sixteen.", "Every hour you're awake,", "a chemical piles up", "in your brain...",
    "and the bigger the pile,", "the sleepier you feel.",
    "Coffee doesn't clear the pile.", "It plugs the sensors", "that feel it...", "like tape", "over a warning light.",
    "He's not less tired.", "He just can't see it.",
    "Hour seventeen.", "In one study,", "seventeen hours awake", "hit people like a few drinks...",
    "right at the drink-drive limit", "in a lot of countries.",
    "He hasn't had a drop.", "He just buttered", "his phone.",
    "Hour twenty-four.", "The sun comes up...", "and he feels great?", "That's a trap.",
    "His body clock", "is ringing the morning bell...", "but the pile", "hasn't gone anywhere.",
    "And his feelings", "are turned way up.", "After one sleepless night,", "the brain's alarm center",
    "fired about sixty percent harder", "at upsetting pictures.",
    "He's sobbing", "at a cereal ad.", "It's a really nice cereal.",
    "Hour thirty.", "And now it gets spooky.", "Little patches of his brain", "start falling asleep...",
    "while he's still awake.",
    "A microsleep.", "A few seconds,", "gone.", "And the scary part?", "You usually don't notice.",
    "On a couch,", "that's funny.", "At the wheel...", "it's how people crash.",
    "And that...", "was the easy part.",
    "Day two.", "He's freezing.", "He's starving...", "mostly for donuts.",
    "And his brain keeps whispering:", "just one little nap?",
    "Day three.", "The edges of things", "start to wobble.", "The floor breathes.", "And the coat", "on the door...",
    "turns its head.",
    "Seeing things", "that aren't there", "is a classic effect", "of days without sleep.",
    "He's fairly sure...", "the cat just told him", "to go to bed.",
    "Could anyone", "really reach day eleven?", "Someone did.", "San Diego,", "nineteen sixty-four:",
    "Randy Gardner,", "seventeen,", "for a school science fair.",
    "A sleep scientist", "from Stanford", "came to watch.", "Within days,", "Randy was moody,", "forgetful...",
    "and seeing things.",
    "To keep him awake,", "they played pinball all night.", "And Randy...", "kept beating the scientist.",
    "Day eleven.", "They asked him", "to count down from a hundred,", "in sevens.",
    "A hundred...", "ninety-three...", "eighty-six...", "seventy-nine...", "seventy-two...", "sixty-five...",
    "He stopped.", "He'd forgotten", "what he was doing.",
    "Eleven days", "and twenty-four minutes.", "Then he slept", "for about fourteen hours...", "and woke up fine.",
    "So our hero goes", "to sign the record book...", "and finds out", "it stopped letting anyone try.", "Here's why.",
    "In the nineteen-eighties,", "scientists kept rats awake", "for good.", "Within weeks,", "they were dead...",
    "and nobody could say", "exactly why.",
    "In twenty-twenty,", "a Harvard lab", "tried it with fruit flies...", "and found the damage piling up",
    "somewhere nobody expected.",
    "Not the brain.", "The gut.",
    "Mop it up", "with antioxidants...", "and flies that barely slept", "lived normal lives.",
    "So what is sleep for?", "One idea:", "while you sleep,", "fluid rinses your brain", "like a dishwasher.",
    "That's in mice...", "and a newer mouse study", "found the opposite.", "Scientists are still arguing.",
    "But here's the weirdest part.", "Jellyfish seem to sleep too...", "and they don't", "even have a brain.",
    "So sleep may be", "older than brains...", "and life has never found", "a way to skip it.",
    "So he does the bravest thing", "a record chaser can do.", "He goes to bed.",
    "Turns out the champion", "of this house...", "was asleep the whole time.",
    "Next week:", "what happens when you", "hold your breath.", "Subscribe...", "then breathe.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "coffee": O, "never": Y, "sleep": C, "eleven": Y, "anymore": R, "cat": O, "not": Y, "very": V,
    "sixteen": Y, "chemical": V, "pile": V, "sleepier": C, "sensors": G, "tape": O, "tired": C, "see": Y,
    "seventeen": Y, "drinks": R, "drink-drive": R, "phone": V, "twenty-four": Y, "great": G, "trap": R,
    "clock": C, "bell": Y, "feelings": PK, "alarm": R, "60%": R, "sobbing": C, "cereal": V,
    "thirty": Y, "spooky": V, "patches": V, "asleep": C, "microsleep": C, "gone": R, "notice": Y,
    "funny": G, "wheel": R, "crash": R, "easy": Y, "two": Y, "freezing": C, "donuts": PK, "nap": C,
    "three": Y, "wobble": V, "breathes": V, "coat": V, "head": R, "aren't": V, "bed": C,
    "1964": Y, "randy": Y, "gardner": Y, "stanford": C, "moody": R, "pinball": PK, "beating": G,
    "sevens": Y, "sixty-five": R, "stopped": R, "forgotten": R, "fourteen": C, "fine": G,
    "record": Y, "try": R, "why": Y, "rats": PK, "dead": R, "flies": O, "nobody": Y, "brain": PK, "gut": R,
    "antioxidants": C, "normal": G, "dishwasher": C, "mice": PK, "opposite": R, "arguing": V,
    "weirdest": Y, "jellyfish": C, "older": Y, "skip": R, "bravest": Y, "champion": Y, "whole": C,
    "breath": C, "subscribe": R, "breathe": C,
}
DISPLAY = {"nineteen sixty-four": ["1964"], "sixty percent": ["60%"], "nineteen-eighties": ["1980s"],
           "twenty-twenty": ["2020"]}

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
S0 = {s["id"]: s["start"] for s in shots}
S1 = {s["id"]: s["end"] for s in shots}

cues = {
    "chug_end": W("so what happens") - 0.1, "never": W("never sleep?"), "daybyday": W("Day by day"),
    "eleven1": W("eleven:"), "record1": W("record nobody"), "anymore": W("anymore."),
    "champion": W("champion"), "not": W("NOT"), "hard": W("How hard"), "very": W("Very."),
    "h16": W("Hour sixteen"), "chemical": W("chemical"), "bigger": W("bigger"), "sleepier": W("sleepier"),
    "coffee": W("Coffee doesn't"), "plugs": W("plugs"), "tape": W("tape"), "light": W("light."),
    "blind": W("He's not less"), "cant": W("can't see"),
    "h17": W("Hour seventeen"), "study": W("study,"), "drinks": W("drinks..."), "limit": W("limit"),
    "drop": W("drop."), "buttered": W("buttered"), "phone": W("phone."),
    "h24": W("Hour twenty-four"), "sun": W("sun comes"), "great": W("great?"), "trap": W("trap."),
    "bell": W("bell..."), "pile2": W("pile hasn't"),
    "feelings": W("feelings"), "alarm": W("alarm center"), "sixty": W("sixty percent"), "pictures": W("pictures."),
    "sobbing": W("sobbing"), "nice": W("nice cereal"),
    "h30": W("Hour thirty"), "spooky": W("spooky."), "patches": W("patches"), "falling": W("falling"),
    "micro": W("microsleep."), "gone": W("gone."), "notice": W("notice."),
    "funny": W("funny."), "wheel": W("wheel..."), "crash": W("crash."), "easy": W("easy part"),
    "d2": W("Day two"), "freezing": W("freezing."), "starving": W("starving..."), "donuts": W("donuts."),
    "whisper": W("whispering:"), "napw": W("nap?"),
    "d3": W("Day three"), "wobble": W("wobble."), "floor": W("floor breathes"), "coatw": W("coat on"),
    "turns": W("turns its"), "seeing": W("Seeing things"), "classic": W("classic"),
    "fairly": W("fairly sure"), "told": W("told him"), "gotobed": W("go to bed"),
    "reach": W("reach day"), "someone": W("Someone did"), "sandiego": W("San Diego"), "y1964": W("nineteen sixty-four:"),
    "randyname": W("Randy Gardner"), "fair": W("science fair"),
    "scientist": W("sleep scientist"), "stanford": W("Stanford"), "moody": W("moody,"), "forgetful": W("forgetful..."),
    "seeing2": W("seeing things.", s=find("forgetful")),
    "pinball": W("pinball"), "beating": W("beating"),
    "d11": W("Day eleven They"), "sevensw": W("in sevens."),
    "n100": W("hundred...", s=find("A hundred ninety-three")), "n93": W("ninety-three..."), "n86": W("eighty-six..."),
    "n79": W("seventy-nine..."), "n72": W("seventy-two..."), "n65": W("sixty-five..."), "n65_end": E("sixty-five..."),
    "stopped": W("He stopped"), "forgot": W("forgotten"),
    "elevendays": W("Eleven days and"), "minutes": W("minutes."), "slept": W("slept"), "fourteen": W("fourteen"), "fine": W("fine."),
    "sign": W("sign the"), "stamp": W("stopped letting") , "whyw": W("Here's why"),
    "rats": W("rats awake"), "weeks": W("Within weeks"), "dead": W("dead..."), "exactly": W("exactly why"),
    "flies": W("fruit flies"), "harvard": W("Harvard"), "damage": W("damage"), "nobodyx": W("nobody expected"),
    "notbrain": W("Not the brain"), "gut": W("gut."), "gasp": ev("gasps")["t"],
    "mop": W("Mop it"), "anti": W("antioxidants..."), "barely": W("barely"), "normal": W("normal lives"),
    "sleepfor": W("sleep for?"), "idea": W("One idea"), "rinses": W("rinses"), "dishwasher": W("dishwasher."),
    "mice": W("mice...", s=find("That's in mice")), "newer": W("newer"), "opposite": W("opposite."),
    "arguing": W("arguing."),
    "weirdest": W("weirdest"), "jellyw": W("Jellyfish"), "nobrain": W("brain.", s=find("even have a brain")),
    "older": W("older than"), "skip": W("skip it"),
    "bravest": W("bravest"), "gotobed2": W("goes to bed"), "champ": W("champion of this"), "whole": W("whole time"),
    "final": E("time.", s=find("the whole time")) + 0.35,
}
# the clock in the top left: [t, number, kind, label]
cues["clock"] = [
    [cues["daybyday"] - 0.1, "HOUR 0", "", "AWAKE FOR"],
    [cues["h16"] - 0.05, "HOUR 16", "", "AWAKE FOR"],
    [cues["h17"] - 0.05, "HOUR 17", "", "AWAKE FOR"],
    [cues["h24"] - 0.05, "HOUR 24", "gold", "AWAKE FOR"],
    [cues["h30"] - 0.05, "HOUR 30", "", "AWAKE FOR"],
    [cues["d2"] - 0.05, "DAY 2", "day", "AWAKE FOR"],
    [cues["d3"] - 0.05, "DAY 3", "day", "AWAKE FOR"],
    [cues["sandiego"] - 0.05, "DAY 4", "1964", "RANDY, 1964"],
    [cues["pinball"] - 0.05, "DAY 10", "1964", "RANDY, 1964"],
    [cues["d11"] - 0.05, "DAY 11", "red", "RANDY, 1964"],
    [cues["sign"] - 0.3, "DAY 11", "red", "OUR HERO"],
    [cues["rats"] - 0.3, "PAST DAY 11", "red", "NOBODY'S ALLOWED"],
    [cues["gotobed2"] - 0.05, "ASLEEP", "sleep", "FINALLY"],
    [cues["final"], "HOUR 14", "sleep", "ASLEEP FOR"],
]
cues["skip_jumps"] = [round(S0["skip"] + 0.6, 3), round(S0["skip"] + 1.3, 3), round(S0["skip"] + 1.9, 3)]

# ---- the subscribe cue
cues["sub_in"] = max(0.0, min(W("Subscribe...") - 0.30, T.duration - 2.6))
cues["sub_tap"] = min(E("Subscribe...") + 0.10, T.duration - 0.8)
T.write(shots, caps, cues, width=1920, height=1080)
