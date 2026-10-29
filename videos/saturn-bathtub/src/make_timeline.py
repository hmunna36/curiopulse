"""Edit timeline for the Would SATURN Float in Your Bathtub? 🪐 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # after "RING.": the rimshot, his deadpan with the scrub brush, then the loop shot

W, E, ev, find = T.W, T.E, T.ev, T.find


# ---- v3's alignment, checked against the speech-band envelope (T.bursts; narration.md)
def _move(i, a, b):
    T.ws[i] = T.words[i]["start"] = round(a, 3)
    T.we[i] = T.words[i]["end"] = round(b, 3)


_iJ = find("Jupiter?")
_move(_iJ, T.ws[_iJ], min(T.we[_iJ], T.bursts(T.ws[_iJ] - 0.05, T.ws[_iJ] + 1.0)[-1][1] + 0.02))   # "Jupiter?" ends at its
#                                                                     last burst, not 0.4 s later in the pause before "Sinks."
_iIt = find("it leaves")
_b = [r for r in T.bursts(T.ws[_iIt] - 0.05, T.ws[_iIt + 1] + 0.1) if r[1] - r[0] < 0.2]
if _b:   # "it" sat 0.27 s early (in the pause after "yes..."): onto its own short burst
    _move(_iIt, _b[0][0] - 0.03, _b[0][1] + 0.01)

# (shot id, phrase whose first word opens the shot). The first shot starts at 0. None = timed in `special`.
SHOTS = [
    ("hook", None),       # SPACE, a clawfoot tub floating among the stars, the Sun low on the left: TIGHT on him in the bath,
                          # bare shoulders, Saturn (with a smug little face) in both hands above the foam; "Sink...": he lets
                          # go, SPLASH, it goes under (bubbles; he leans in to look); "It FLOATS!": it POPS back up, rings and
                          # all, and bobs; "Like a giant... rubber duck": the duck beside it does a double take, the two bob
                          # in step, and the camera pulls all the way back: the whole tub, floating in space
    ("cup", "Scoop"),     # THE ONE PICTURE: he scoops a cup of Saturn (a swirl of butterscotch cloud heaped in a measuring
                          # cup); a brass balance on a bath tray across the tub, a cup of bathwater already on one pan; he sets
                          # the Saturn cup on the other; "LIGHTER": the Saturn side swings UP; 30% LIGHTER
    ("why", "Because"),   # close on Saturn floating: "not rock": his knuckles knock... and sink into it like fluff (POOF);
                          # "mostly GAS": a scan wipe turns it see-through: fizzing gas all the way down, a tiny core
    ("planets", "Earth?"),  # THE SPLIT-LEVEL SHOT: the tub cut away at the waterline, space above, the water below; "Earth?":
                            # a marble-sized Earth drops in, "Sinks.": CLUNK on the floor; "Jupiter?": bigger than Saturn,
                            # it sinks... slowly; "Of all our planets...": five more plink in and line the floor; "only
                            # SATURN floats.": Saturn at the top, two thirds under, FLOATS
    ("catch", "Catch?"),  # the same set, closer: a record scratch; Saturn's smug face drops; it shudders and comes apart;
                          # "The core sinks...": a small dark core drops out of it to the floor, CLUNK
    ("fizz", "the gas"),  # the front again: "fizzes UP": the gas erupts into a mountain of butterscotch bubble bath; he is
                          # buried to the eyes (a deadpan blink)
    ("rings", "And its"), # the foam pops away: Saturn's rings, left behind, float on the water... with the duck sitting in
                          # the middle like a pool ring
    ("button", "So yes"), # he looks at the ring, then at us; "RING.": he lifts a scrub brush (the rimshot after the word);
                          # the pill test: the face and the brush above y 1050 while the silent pill is up
    ("loop", None),       # the last 0.45 s: the hook at negative time (a fresh Saturn lifted into his hands: frame 1)
]
DUR = T.duration
special = {"planets": W("Earth?") - 0.24, "loop": DUR - 0.45}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "Drop Saturn / in your bath.",
    "Sink...",
    "or float?",
    "It FLOATS!",
    "Like a giant...",
    "rubber duck.",
    "Scoop out / a cup of Saturn...",
    "it's LIGHTER",
    "than a cup / of water.",
    "Because Saturn's / not rock.",
    "It's mostly / GAS.",
    "Earth?",
    "Sinks.",
    "Jupiter?",
    "Sinks.",
    "Of all / our planets...",
    "only SATURN / floats.",
    "Catch?",
    "It'd probably / fall apart.",
    "The core / sinks...",
    "the gas / fizzes UP.",
    "And its / icy rings?",
    "They float.",
    "So yes...",
    "it leaves / a RING.",
]
Y, O, C, R, G, B_, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# gold = Saturn, cyan = water and floating, red = sinking and falling apart, green = lighter, orange = gas,
# blue = Earth and Jupiter, violet = the pun
COLOR = {"saturn": Y, "saturn's": Y, "floats": C, "float": C, "sink": R, "sinks": R, "water": C, "lighter": G,
         "gas": O, "rock": R, "earth": B_, "jupiter": B_, "apart": R, "core": R, "up": O, "icy": S, "ring": V,
         "duck": Y, "catch": R}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)
sh = {s["id"]: s for s in shots}

iSat1 = find("Drop Saturn") + 1
iSink1 = find("Sink...")
iFloat1 = find("or float?") + 1
iSat2 = find("cup of Saturn") + 2
iSat3 = find("Saturn's not rock")
iSinksE = find("Earth? Sinks.") + 1
iSinksJ = find("Jupiter? Sinks.") + 1
iSat4 = find("only SATURN") + 1
iFloats2 = find("only SATURN floats.") + 2
iCup1 = find("a cup of Saturn") + 1
iCup2 = find("a cup of water") + 1
iSinks3 = find("core sinks...") + 1
iFloat3 = find("They float.") + 1
cues = {
    # the hook
    "drop": W("Drop"), "saturn1": T.ws[iSat1], "bath": W("bath."), "bath_end": E("bath."),
    "sink": T.ws[iSink1], "sink_end": T.we[iSink1], "or": W("or float?"), "float1": T.ws[iFloat1], "float1_end": T.we[iFloat1],
    # the answer
    "it": W("It FLOATS!"), "floats": W("FLOATS!"), "floats_end": E("FLOATS!"), "like": W("Like a giant"),
    "giant": W("giant..."), "giant_end": E("giant..."), "rubber": W("rubber"), "duck": W("duck."), "duck_end": E("duck."),
    # the cup
    "scoop": W("Scoop"), "cup1": T.ws[iCup1], "saturn2": T.ws[iSat2], "saturn2_end": T.we[iSat2], "its1": W("it's LIGHTER"),
    "lighter": W("LIGHTER"), "lighter_end": E("LIGHTER"), "than": W("than"), "cup2": T.ws[iCup2], "water": W("water."),
    "water_end": E("water."),
    # why
    "because": W("Because"), "saturn3": T.ws[iSat3], "not": W("not rock."), "rock": W("rock."), "rock_end": E("rock."),
    "its2": W("It's mostly"), "mostly": W("mostly"), "gas": W("GAS."), "gas_end": E("GAS."),
    # the planets
    "earth": W("Earth?"), "earth_end": E("Earth?"), "sinks1": T.ws[iSinksE], "sinks1_end": T.we[iSinksE],
    "jupiter": W("Jupiter?"), "jupiter_end": E("Jupiter?"), "sinks2": T.ws[iSinksJ], "sinks2_end": T.we[iSinksJ],
    "of": W("Of all"), "all": W("all our"), "planets": W("planets..."), "planets_end": E("planets..."),
    "only": W("only SATURN"), "saturn4": T.ws[iSat4], "floats2": T.ws[iFloats2], "floats2_end": T.we[iFloats2],
    # the catch
    "catch": W("Catch?"), "catch_end": E("Catch?"), "itd": W("It'd"), "probably": W("probably"), "fall": W("fall apart."),
    "apart": W("apart."), "apart_end": E("apart."), "the_core": W("The core"), "core": W("core"), "sinks3": T.ws[iSinks3],
    "sinks3_end": T.we[iSinks3],
    # the fizz
    "the_gas": W("the gas"), "gas2": W("gas fizzes"), "fizzes": W("fizzes"), "up": W("UP."), "up_end": E("UP."),
    # the rings
    "and": W("And its"), "icy": W("icy"), "rings": W("rings?"), "rings_end": E("rings?"), "they": W("They float."),
    "float3": T.ws[iFloat3], "float3_end": T.we[iFloat3],
    # the button
    "so": W("So yes"), "yes": W("yes..."), "yes_end": E("yes..."), "it_leaves": W("it leaves"), "leaves": W("leaves"),
    "a_ring": W("a RING."), "ring": W("RING."), "ring_end": E("RING."),
}
c = cues
cues.update({
    # the hook: the drop on "Sink", the plunge in the pause, the pop on "FLOATS"
    "let_go": c["sink_end"] - 0.26,                      # his hands open on "Sink..."
    "splash": c["sink_end"] + 0.04,                      # Saturn hits the water in the pause after the word (punchline sounds
    #                                                      go after their word, never on it)
    "peek": c["or"] - 0.12,                              # he leans in to look for it
    "pop": c["floats"] + 0.04,                           # it POPS up out of the water
    "settle": c["floats_end"] + 0.1,                     # the rings slap flat on the water, the bob begins
    "double_take": c["like"] + 0.1,                      # the duck looks at Saturn... and back (6-frame hold)
    "pull_back": c["giant"] - 0.15,                      # the camera pulls back to the whole tub in space
    "duck_squeak": c["duck_end"] + 0.05,                 # a squeak in the gap after "duck."
    # the cup
    "dip": c["scoop"] + 0.05,                            # the cup goes into Saturn's top
    "lift_cup": c["saturn2"] - 0.05,                     # ...and comes out heaped with cloud
    "place": c["its1"] - 0.08,                           # he sets it on the empty pan (a clink)
    "tip": c["lighter"] + 0.02,                          # the beam swings: Saturn's side UP
    "tag30": c["lighter_end"] - 0.05,                    # 30% LIGHTER
    # why
    "knock": c["not"] - 0.04,                            # the first knock (a knuckle: it should go tok)
    "sink_fist": c["rock"] + 0.03,                       # ...and the fist sinks in on "rock"
    "poof": c["rock_end"] + 0.02,                        # POOF (the sound, in the pause after the word)
    "scan": c["its2"] - 0.05,                            # the scan wipe: see-through
    "gas_tag": c["gas"] - 0.02,                          # the GAS label pops
    # the planets
    "earth_drop": c["earth"] - 0.12,                     # Earth is let go from above
    "earth_hit": c["sinks1_end"] + 0.05,                 # CLUNK on the floor in the pause after "Sinks."
    "jup_splash": c["jupiter_end"] + 0.03,               # Jupiter hits the water in the pause after "Jupiter?"
    "jup_drop": c["jupiter_end"] - 0.29,                 # ...let go during the word
    "jup_land": c["sinks2_end"] + 0.12,                  # it settles on the floor (a slow, sad bloop)
    "five": c["of"] - 0.05,                              # five more plink in, one by one
    "float_tag": c["floats2"] - 0.02,                    # FLOATS ✓ on Saturn
    # the catch
    "scratch": c["catch"] - 0.06,                        # a record scratch: the music stops
    "worried": c["catch_end"],                           # Saturn's face drops
    "shudder": c["fall"] - 0.05,                         # it shudders and cracks
    "core_drop": c["core"] + 0.02,                       # the core drops out of it
    "core_hit": c["sinks3_end"] + 0.05,                  # CLUNK on the floor
    # the fizz
    "erupt": c["fizzes"] - 0.06,                         # the foam erupts
    "buried": c["up_end"] - 0.1,                         # he is buried to the eyes
    "blink": c["up_end"] + 0.12,                         # a deadpan blink
    # the rings
    "foam_pop": c["and"] - 0.05,                         # the foam pops away
    "duck_in": c["rings_end"] + 0.02,                    # the duck bobs into the middle of the ring (a squeak in the pause)
    # the button
    "look_ring": c["so"],                                # he looks at the ring...
    "look_us": c["yes_end"] + 0.05,                      # ...then at us
    "brush": c["ring"] - 0.1,                            # the scrub brush comes up
    "rimshot": c["ring_end"] + 0.06,                     # ba-dum tss
    "relift": DUR - 0.75,                                # he reaches for a fresh Saturn (the loop shot finishes the lift)
})
# the five other planets plink in on a quick rhythm between "Of" and "only"
five = [round(c["five"] + k * (c["only"] - 0.25 - c["five"]) / 5.0, 3) for k in range(5)]
cues["five_drops"] = five
assert c["drop"] < c["saturn1"] < c["bath"] < c["sink"] < c["splash"] < c["or"] < c["float1"] < c["it"] < c["floats"]
assert c["floats"] < c["like"] < c["giant"] < c["rubber"] < c["duck"] < c["scoop"] < c["saturn2"] < c["lighter"]
assert c["lighter"] < c["water"] < c["because"] < c["not"] < c["rock"] < c["its2"] < c["gas"] < c["earth"] < c["sinks1"]
assert c["sinks1"] < c["earth_hit"] < c["jupiter"] < c["sinks2"] < c["jup_land"] < c["of"] < c["planets"] < c["only"]
assert c["only"] < c["saturn4"] < c["floats2"] < c["catch"] < c["fall"] < c["core"] < c["sinks3"] < c["fizzes"] < c["up"]
assert c["up"] < c["and"] < c["rings"] < c["they"] < c["so"] < c["yes"] < c["leaves"] < c["ring"] < c["rimshot"]
assert sh["planets"]["start"] < c["earth_drop"] and c["core_hit"] < sh["fizz"]["start"] + 0.2
assert c["rimshot"] + 0.25 < sh["loop"]["start"], (c["rimshot"], sh["loop"]["start"])
# ---- the Subscribe pill: the pill test (user, 24 Oct 2026). publish.json "subscribe" says the arm; T.write sets the
# pill's cues for the pill arm by itself and drops them otherwise. Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"] here.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the hook: the title question, put to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
