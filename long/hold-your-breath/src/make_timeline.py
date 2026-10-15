"""Edit timeline for "What If You Hold Your Breath TOO Long? (Second by Second)" (long-form, 1920x1080, 4:00-5:00, never
over 5:15).

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
The clock (cues.clock, drawn by web/hud.js) counts the viewer's real seconds from "now" in the hook (cues.tick0) until
"Breathe." (cues.tickStop); script.txt's gaps put "Ten", "Twenty", "Thirty" and "Forty-five" on their true seconds.
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
# a word the aligner squeezed into a sliver ends at the next word's start (the voice checks measure the whole word)
for i in range(len(T.words) - 1):
    if T.we[i] - T.ws[i] < 0.1:
        T.we[i] = T.words[i]["end"] = round(max(T.we[i], min(T.ws[i + 1] - 0.01, T.ws[i] + 0.3)), 3)

now = W("now...")
blast = W("Forty-five.") - 0.62          # his breath blows out in the gap before "Forty-five"
whistle_t = E("first.") + 0.30           # Pip's whistle, in the gap before "Pip got a whistle"
splat = E("cloth.") + 0.32               # the cold cloth lands in the gap before "Cold water"
best = W("One minute") - 0.55            # his triumphant exhale, in the gap before "One minute fifty-two"
off = E("off.") + 0.12                   # lights out after "switch off."
blow = E("lose.") + 0.55                 # Pip blows out her candles (the final image)

SHOTS = [
    ("hook", None),                        # his face, close, the breath in; the clock starts on "now"
    ("glimpse", "twenty-nine minutes."),   # where this goes: the record's timer, a glimpse
    ("ten", None),                         # the two-shot; his thumbs-up on "Ten seconds. Easy."
    ("bet", "It's Pip's birthday"),        # Pip close; the cake: LOSER = NO CAKE
    ("blood", None),                       # wordless: a window opens on his chest; the dive into the lungs
    ("twenty", "Twenty."),                 # the blood: oxygen beads, then exhaust bubbles piling up
    ("tense", None),                       # wordless: his face going red; Pip watching
    ("thirty", "Thirty."),                 # the burn in his chest
    ("alarm", "That's not the missing"),   # oxygen still 96 %; the exhaust; sour
    ("sensor", "and a sensor"),            # the sensor at the base of the brain tastes it and rings
    ("shake", None),                       # wordless: the alarm in him, his face shaking
    ("out", None),                         # PAAAH: the candles blow out
    ("smoke", None),                       # wordless: smoke; Pip's stare
    ("pip", "And Pip?"),                   # Pip still holding... through her nose
    ("breathe", "And you?"),               # he looks at us: BREATHE
    ("result", "Most people let go"),      # the ruler of the first minute: the band, HIM, YOU?
    ("tank", "with their blood"),          # the gauges: the tank still full, the alarm ringing
    ("early", "You didn't run out"),       # the race: the exhaust needle up, the tank barely moving
    ("round2", "Round two."),              # goggles; he pants
    ("whistle", None),                     # TWEEEET
    ("dont", "And she's right."),          # the gauges: no oxygen added; the needle to zero; BLACKOUT
    ("belly", "The slow way"),             # the viewer's second test: a hand on the belly; the diaphragm
    ("sixty", "Sixty seconds"),            # his second try, eyes shut; Pip lifts a cold wet cloth
    ("splat", None),                       # SPLAT
    ("dive", "Cold water on"),             # the heart monitor: 78 -> 70
    ("seal", "the same switch"),           # a seal diving, its heart slowing
    ("spleen", "And his spleen"),          # the spleen squeezes out red cells
    ("ninety", "Ninety. And here"),        # the diaphragm starts kicking
    ("hurt", "Why does it hurt"),          # his face, the kicks
    ("proof", "In the nineteen-sixties"),  # London, the 1960s: the volunteer, the machine
    ("proof2", "With no muscle"),          # the clock on the wall runs four minutes; the doctor stops it; ARGUED
    ("best", None),                        # his breath out: 1:52!
    ("cake", "Pip has started"),           # Pip, eating the cake
    ("human", "So how far"),               # he looks up: how far can a human go?
    ("record", "The official record"),     # the record pool: 11:35
    ("oxygen", "With a trick"),            # the oxygen cylinder; the timer runs to 29:03
    ("six", "That's this whole video"),    # six copies of this film in a row
    ("whale", "And a whale"),              # the deep sea: the whale going down
    ("dark", None),                        # wordless: the whale vanishes into the dark
    ("toolong", "But you're not a whale"), # TOO LONG? Pip's whistle again
    ("drain", "Breathe fast first"),       # the gauges: fast breathing first; the tank drains past BLACKOUT
    ("off", None),                         # black
    ("water", "In water,"),                # the empty pool at night; the three rules
    ("land", "On land?"),                  # home at dusk; the sensor with a lifeguard's whistle breathes for him
    ("count", "Count your breaths"),       # the third test: 15 s
    ("candles", None),                     # the count: Pip relights her candles one by one
    ("counted", "About four?"),            # his face, warm
    ("turn", "So this time"),              # Pip's big breath
    ("button", "Turns out"),               # he laughs
    ("final", None),                       # the final image: she blows them out; BREATHING
    ("sub", "Next week"),                  # the same image, the pill
]
special = {
    "ten": E("minutes.") + 0.45,
    "blood": E("cake.") + 0.35,
    "tense": E("go.") + 0.30,
    "shake": E("alarm.") + 0.30,
    "out": blast - 0.25,
    "smoke": E("out.", s=find("He's out")) + 0.35,
    "whistle": whistle_t - 0.30,
    "splat": splat - 0.22,
    "best": best - 0.30,
    "dark": E("out.", s=find("working it out")) + 0.40,
    "off": off - 0.05,
    "final": blow - 0.45,
    "candles": W("now.", s=find("Starting")) + 0.5,
}

CHUNKS = [
    "Hold your breath.", "Right now...", "with him.",
    "I'll tell you", "what your body's doing,", "every second...", "all the way to a man", "who held it for", "twenty-nine minutes.",
    "Ten seconds.", "Easy.",
    "It's Pip's birthday,", "and she bet him", "she'd last longer.", "Loser gets", "no cake.",
    "Twenty.", "Your blood is still", "almost totally full", "of oxygen.", "But every second,", "your body makes exhaust...",
    "and it's got", "nowhere to go.",
    "Thirty.", "Feel that?", "That burn?",
    "That's not", "the missing oxygen.", "It's mostly the exhaust.", "It makes your blood", "a tiny bit sour...",
    "and a sensor", "at the base of your brain", "tastes it...", "and pulls the alarm.",
    "Forty-five.", "He's out.",
    "And Pip?", "Still going...", "through her nose.",
    "And you?", "Breathe.", "Seriously.",
    "Most people let go", "between thirty seconds", "and a minute...", "with their blood still", "more than ninety percent full.",
    "You didn't run out.", "Your body rings the alarm", "on the exhaust...", "long before", "the oxygen gets low.",
    "Round two.", "He's seen a trick online:", "breathe really fast first.",
    "Pip got a whistle", "for her birthday.",
    "And she's right.", "Fast breathing", "doesn't add oxygen.", "It just blows", "the exhaust away...", "so the alarm rings late.",
    "Sometimes...", "too late.",
    "The slow way, then.", "Hand on your belly.", "Breathe in.", "Feel it push out?", "That's your diaphragm,", "a dome of muscle",
    "under your lungs.", "Remember it.",
    "Sixty seconds:", "a new record.", "And Pip has", "a cold, wet cloth.",
    "Cold water on the face", "flips an ancient switch.", "His heart slows down,", "to save oxygen...", "the same switch",
    "a seal flips", "on every dive.",
    "And his spleen squeezes out", "spare red blood cells:", "oxygen carriers", "he didn't know he had.",
    "Ninety.", "And here it comes.", "That dome of muscle...", "starts kicking.", "On its own.",
    "Why does it hurt so much?", "In the nineteen-sixties,", "two London scientists", "paralysed themselves", "with a drug,",
    "while a machine", "breathed for them.",
    "With no muscle left to kick,", "they went four minutes", "without a breath,", "calm...", "until their doctor", "stopped it.",
    "Scientists still argue", "about what it proves.",
    "One minute fifty-two!", "Nearly three times", "his first try.",
    "Pip has started", "on the cake.",
    "So how far", "can a human go?", "The official record,", "on one breath of air:", "eleven minutes", "and thirty-five seconds...",
    "face down in a pool.",
    "With a trick,", "breathing pure oxygen first,", "a man in Croatia", "went twenty-nine minutes.", "That's this whole video...",
    "almost seven times.",
    "And a whale", "once stayed down", "three hours", "and forty-two minutes.", "How?", "Scientists are still", "working it out.",
    "But you're not a whale.", "So what happens", "if you hold it too long?", "Remember the whistle?", "Breathe fast first,",
    "and your oxygen can run out", "before the alarm rings.", "You just...", "switch off.",
    "In water,", "that's how strong swimmers drown.", "So: never in water,", "never alone,", "and never fast breathing first.",
    "On land?", "Your body won't let you.", "Even if you blacked out,", "it would take over...", "and breathe for you.",
    "Count your breaths", "for fifteen seconds.", "Starting...", "now.",
    "About four?", "You didn't choose", "a single one.", "That part of his brain", "he was fighting?",
    "It's been breathing for him", "his whole life.",
    "So this time,", "when Pip takes a big breath...", "he lets the birthday girl win.",
    "Turns out...", "this is one contest", "you're supposed to lose.",
    "Next week:", "what happens if you step", "into space without a suit.", "Subscribe...", "and keep breathing.",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "breath": C, "now": Y, "29": Y, "minutes": Y, "10": Y, "easy": G, "pip's": PK, "birthday": PK, "longer": Y, "no": R, "cake": PK,
    "20": Y, "blood": R, "totally": C, "oxygen": C, "exhaust": V, "nowhere": R, "30": Y, "burn": O, "missing": C, "mostly": V,
    "sour": Y, "sensor": O, "brain": PK, "alarm": R, "45": Y, "out": R, "pip": PK, "nose": Y, "seriously": G,
    "90%": C, "full": C, "run": Y, "low": C, "two": Y, "trick": Y, "fast": R, "whistle": Y, "add": C, "late": R,
    "slow": G, "belly": O, "diaphragm": O, "muscle": O, "remember": Y, "60": Y, "record": Y, "cold": C, "wet": C,
    "ancient": Y, "heart": R, "seal": C, "spleen": V, "spare": R, "carriers": R, "kicking": R, "own": R,
    "1960s": Y, "paralysed": R, "machine": C, "four": Y, "calm": G, "doctor": R, "argue": V,
    "152": Y, "three": Y, "official": Y, "air": C, "11": Y, "35": Y, "pool": C, "pure": C, "croatia": Y, "seven": Y,
    "whale": C, "3": Y, "hours": Y, "42": Y, "too": R, "off": R, "water": C, "drown": R,
    "never": R, "alone": R, "land": G, "won't": G, "blacked": R, "15": Y, "choose": Y, "fighting": R,
    "life": G, "win": PK, "lose": Y, "space": V, "suit": V, "subscribe": R,
}
DISPLAY = {
    "twenty-nine minutes": ["29", "MINUTES"], "ten seconds": ["10", "SECONDS"], "twenty": ["20"], "thirty": ["30"],
    "forty-five": ["45"], "sixty seconds": ["60", "SECONDS"], "ninety": ["90"], "one minute fifty-two": ["1:52!"],
    "in the nineteen-sixties": ["IN", "THE", "1960s"], "more than ninety percent full": ["MORE", "THAN", "90%", "FULL"],
    "between thirty seconds": ["BETWEEN", "30", "SECONDS"], "eleven minutes": ["11", "MINUTES"],
    "and thirty-five seconds": ["AND", "35", "SECONDS"], "went twenty-nine minutes": ["WENT", "29", "MINUTES"],
    "three hours": ["3", "HOURS"], "and forty-two minutes": ["AND", "42", "MINUTES"], "for fifteen seconds": ["FOR", "15", "SECONDS"],
    "they went four minutes": ["THEY", "WENT", "4", "MINUTES"],
}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
S0 = {s["id"]: s["start"] for s in shots}
S1 = {s["id"]: s["end"] for s in shots}

cues = {
    # ---- act 1: the first hold, in real time
    "now": now, "tick0": now, "pullback": W("I'll tell you"), "badgeOff": W("Ten seconds") + 1.6, "t29a": W("twenty-nine minutes."),
    "ten": W("Ten seconds"), "bet0": W("It's Pip's"), "nocake": W("Loser"),
    "twenty": W("Twenty."), "oxy": W("oxygen.", s=find("Twenty.")), "exhaust": W("exhaust...", s=find("Twenty.")),
    "nowhere": W("nowhere"), "thirty": W("Thirty."), "burn": W("burn?"),
    "notmissing": W("That's not the missing"), "itsex": W("It's mostly"), "sour": W("sour..."), "sensor": W("sensor"),
    "tastes": W("tastes"), "pulls": W("pulls the alarm"),
    "out": blast, "fortyfive": W("Forty-five."), "pipq": W("And Pip?"), "nose2": W("through her nose"),
    "you": W("And you?"), "breathe": W("Breathe.", s=find("And you?")), "tickStop": W("Breathe.", s=find("And you?")),
    "result": W("Most people"), "band30": W("thirty seconds"), "minute": W("minute..."), "ninetyPct": W("ninety percent"),
    "early": W("You didn't run"), "rings": W("rings the alarm"), "faster": W("long before"), "low": W("low."),
    # ---- round two: the trick and the whistle
    "round2": W("Round two."), "trick": W("trick online"), "pant0": W("breathe really fast"), "whistleT": whistle_t,
    "pipgot": W("Pip got"), "right": W("And she's right"), "noadd": W("doesn't add"), "blows": W("blows the exhaust"),
    "late": W("rings late"), "toolate": W("late.", s=find("Sometimes")),
    # ---- the slow way
    "belly": W("The slow way"), "bellyIn": W("Hand on your belly"), "breathein": W("Breathe in."), "pushout": W("push out?"),
    "diaph": W("diaphragm,"), "dome": W("dome of muscle", s=find("diaphragm,")), "remember": W("Remember it."),
    "sixty": W("Sixty seconds"), "record": W("new record"), "clothUp": W("And Pip has"), "splat": splat,
    "dive": W("Cold water on"), "switchw": W("ancient switch"), "slows": W("slows down"), "save": W("to save oxygen"),
    "seal": W("the same switch"), "sealw": W("seal flips"),
    "spleen": W("And his spleen"), "squeezes": W("squeezes out"), "carriers": W("oxygen carriers"),
    "ninety": W("Ninety. And here"), "herecomes": W("here it comes"), "kicking": W("starts kicking"), "ownw": W("On its own"),
    "proof": W("Why does it hurt"), "sixties": W("nineteen-sixties,"), "london": W("London"), "paralysed": W("paralysed"),
    "machine": W("machine"), "proof2": W("With no muscle"), "fourmin": W("four minutes", s=find("they went")),
    "calm": W("calm..."), "doctor": W("doctor"), "argue": W("argue"),
    "best": best, "bestw": W("One minute"), "nearly": W("Nearly three"), "cake": W("Pip has started"),
    # ---- act 3: the edge
    "human": W("So how far"), "official": W("official record"), "onebreath": W("one breath of air"),
    "eleven": W("eleven minutes"), "thirtyfive": W("thirty-five seconds"), "facedown": W("face down"),
    "trickO2": W("With a trick"), "pure": W("pure oxygen"), "croatia": W("Croatia"), "t29": W("twenty-nine minutes.", s=find("Croatia")),
    "six": W("That's this whole"), "sixw": W("seven times"),
    "whale": W("And a whale"), "hours": W("three hours"), "how": W("How? Scientists"), "working": W("working it out"),
    "notwhale": W("But you're not"), "toolong": W("too long?"), "remember2": W("Remember the whistle"),
    "fastfirst": W("Breathe fast first"), "runout": W("run out", s=find("Breathe fast first")), "beforeRing": W("before the alarm"),
    "switchoff": W("switch off."), "off": off,
    "water": W("In water,"), "drown": W("drown."), "never1": W("never in water"), "never2": W("never alone"), "never3": W("never fast"),
    "land": W("On land?"), "wont": W("won't let you"), "blacked": W("blacked out"), "takes": W("take over"), "breathesfor": W("breathe for you"),
    "count": W("Count your breaths"), "cnow": W("now.", s=find("Starting")), "counted": W("About four?"),
    "choose": W("didn't choose"), "fighting": W("That part of his brain"), "whole": W("whole life"),
    "turn": W("So this time"), "pipBreath": W("takes a big breath"), "win": W("girl win"),
    "button": W("Turns out"), "lose": W("lose."), "blow": blow, "final": S0["final"], "sub": W("Next week"),
    # the kitchen turns to dusk while we are away (act 3)
    "dusk0": S0["land"] - 0.4, "dusk1": S0["land"],
}
# the diaphragm's kicks: from "starts kicking" until his breath out, faster and faster
k, t = [], cues["kicking"] + 0.15
while t < best - 0.4:
    k.append(round(t, 3))
    t += max(0.45, 1.0 - 0.05 * len(k))
cues["kicks"] = k
# Pip relights her seven candles during the breath count (one every ~1.7 s from just after "now")
L0, L1 = cues["cnow"] + 1.2, cues["counted"] - 1.6
cues["lights"] = [round(L0 + (L1 - L0) * i / 6, 3) for i in range(7)]
# the breaths he takes while the viewer counts (one every ~4 s): each one a small flicker of the new flames
cues["breaths"] = [round(cues["cnow"] + 1.0 + 3.9 * i, 3) for i in range(4)]
# ---- the clock (web/hud.js): [t, text, kind, label]; "{s}" counts the viewer's seconds, "{c}" counts down the 15 s
cues["clock"] = [
    [now, "SECOND {s}", "", "HOLDING FOR"],
    [cues["breathe"] - 0.05, "SECOND {s}", "green", "YOU: LET GO!"],
    [cues["sixty"] - 0.05, "SECOND 60", "go", "HIS SECOND TRY"],
    [cues["ninety"] - 0.05, "SECOND 90", "go", "HIS SECOND TRY"],
    [best + 0.05, "SECOND 112", "gold", "HIS NEW BEST"],
    [cues["eleven"] - 0.05, "MINUTE 11", "blue", "THE RECORD, ON AIR"],
    [cues["t29"] - 0.05, "MINUTE 29", "blue", "ON PURE OXYGEN"],
    [cues["hours"] - 0.05, "3 HOURS 42", "dark", "A WHALE"],
    [cues["toolong"] - 0.05, "TOO LONG?", "red", "YOU"],
    [cues["cnow"] - 0.05, "{c} SECONDS", "green", "COUNT YOUR BREATHS"],
    [cues["counted"] - 0.05, "BREATHING", "green", "ON ITS OWN"],
    [blow + 0.6, "BREATHING", "gold", "TOGETHER"],
]
cues["countFrom"] = cues["cnow"]
# ---- the payoffs (the every-second rule): small ones (pay_) and big ones (big_); audio.py builds into each
for name, t in {
    "pay_now": now + 0.05, "pay_ten": cues["ten"], "pay_nocake": cues["nocake"] + 0.25, "big_dive": S0["blood"] + 1.9,
    "pay_twenty": cues["twenty"], "pay_exhaust": cues["exhaust"], "pay_lock": cues["nowhere"], "pay_thirty": cues["thirty"],
    "pay_sour": cues["sour"], "big_alarm": cues["pulls"], "big_out": blast, "pay_nose": cues["nose2"] - 0.1,
    "pay_band": cues["band30"], "big_full": cues["ninetyPct"], "pay_race": cues["faster"], "pay_round2": cues["round2"],
    "big_whistle": whistle_t, "pay_noadd": cues["noadd"], "pay_toolate": cues["toolate"], "pay_belly": cues["pushout"],
    "pay_diaph": cues["diaph"], "pay_sixty": cues["sixty"], "pay_splat": splat, "pay_slows": cues["slows"], "big_seal": cues["seal"],
    "pay_spleen": cues["squeezes"], "big_kick": cues["kicking"], "pay_1960": cues["sixties"], "big_four": cues["fourmin"],
    "pay_argue": cues["argue"], "big_best": best, "pay_cake": cues["cake"] + 0.3, "pay_eleven": cues["eleven"],
    "big_29": cues["t29"], "pay_six": cues["sixw"], "big_whale": cues["hours"], "pay_how": cues["how"],
    "big_off": off, "pay_drown": cues["drown"], "pay_never": cues["never1"], "big_land": cues["breathesfor"],
    "pay_counted": cues["counted"], "pay_win": cues["win"], "big_blow": blow,
}.items():
    cues[name] = round(t, 3)

# ---- the subscribe cue (web/subscribe.js): the pill pops just before "Subscribe", the click right after it
cues["sub_in"] = max(0.0, min(W("Subscribe...") - 0.30, T.duration - 2.6))
cues["sub_tap"] = min(E("Subscribe...") + 0.12, T.duration - 0.8)
T.write(shots, caps, cues, width=1920, height=1080)
print(f"now {now:.2f}  out {blast:.2f}  breathe {cues['breathe']:.2f}  best {best:.2f}  off {off:.2f}  blow {blow:.2f}  sub_in {cues['sub_in']:.2f}")
