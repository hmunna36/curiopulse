"""Edit timeline for the Was Cleopatra Closer to the Pyramids or the MOON Landing? 🚀 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=0.95)  # after "modern.": her bubble-gum bubble pops, and the Short loops into the selfie

W, E, ev, find = T.W, T.E, T.ev, T.find


def _move(i, a, b):
    T.ws[i] = T.words[i]["start"] = round(a, 3)
    T.we[i] = T.words[i]["end"] = round(b, 3)


# v3's alignment put "two" and "thousand" of "Just two thousand." about 0.1 s early (the speech-band bursts: "two"
# 17.27-17.42, "thou-sand" 17.48-18.0); qa.py read "two" at 0.3 dB because its window was silence
_i = find("Just two thousand")
_move(_i + 1, 17.25, 17.42)
_move(_i + 2, 17.46, 18.02)

SHOTS = [
    ("hook", None),       # TIGHT: on the Moon, Cleopatra (sunglasses, peace sign) and the hiker in his spacesuit take a
                          # selfie with his stick, the lunar module and the flag behind them, Earth in the black sky.
                          # "Nope.": the phone's FLASH and the shutter (frame 0 = the loop's last picture)
    ("giza", None),       # THE ANSWER: Giza at dusk, 50 BC: she stands under the Great Pyramid, unimpressed; "already":
                          # the tag ALREADY 2,500 YEARS OLD; "ancient history.": a huge yawn, a tumbleweed rolls past
    ("climb", None),      # THE ONE PICTURE: the time ladder from the pyramid's tip up to the Moon. "Climb with me.": he
                          # waves us on and climbs; the counter runs to 2,500 as he reaches Cleopatra on her swing at
                          # 69 BC; "Cleopatra to the Moon?": on up through night into space, 2,000, onto the Moon
    ("payoff", None),     # the pull-back: the whole ladder; NEIL ARMSTRONG at the top; the two spans as brackets; "five
                          # hundred": the 2,000 span slides down onto the 2,500 one and the extra 500 glows
    ("past", None),       # "Weirder:": he slides down the rails like a fireman, back to 2560 BC: the pyramid half built,
                          # workers hauling a block; "woolly mammoths": a split screen wipes in, a mammoth in the Arctic,
                          # his double take; "On one island.": that half pulls back to one tiny island in the sea
    ("button", None),     # back on the Moon: "So Cleopatra?": she peers over her sunglasses; "Practically...": pushes them
                          # up; "modern.": a bubble-gum bubble... POP
    ("loop", None),       # the last 0.45 s: the hook at negative time (back into the selfie pose of frame 0)
]
DUR = T.duration
special = {
    "giza": W("To her") - 0.12,
    "climb": W("Climb") - 0.1,
    "payoff": W("She's") - 0.1,
    "past": W("Weirder") - 0.1,
    "button": W("So Cleopatra") - 0.1,
    "loop": DUR - 0.45,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "You'd think / Cleopatra's",
    "closer to / the pyramids",
    "than the / Moon landing.",
    "Nope.",
    "To her, / the pyramids",
    "were / already...",
    "ancient / history.",
    "Climb / with me.",
    "Pyramid to / Cleopatra?",
    "Two and / a half",
    "THOUSAND / years.",
    "Cleopatra / to the Moon?",
    "Just two thousand.",
    "She's closer to / Neil Armstrong...",
    "by about / five hundred years.",
    "Weirder:",
    "while they built / that pyramid...",
    "woolly / mammoths",
    "were still / alive.",
    "On one / island.",
    "So / Cleopatra?",
    "Practically...",
    "modern.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
COLOR = {"cleopatra's": Y, "cleopatra": Y, "pyramids": O, "pyramid": O, "moon": S, "nope": R, "ancient": V, "history": V,
         "climb": G, "thousand": O, "2500": O, "2000": C, "neil": B, "armstrong": B, "500": Y, "weirder": Y,
         "woolly": V, "mammoths": V, "alive": G, "island": C, "modern": PK}
DISPLAY = {"just two thousand": ["JUST", "2,000"], "five hundred years": ["500", "YEARS"]}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

iC2 = find("Cleopatra to the Moon")
iC1 = find("Pyramid to Cleopatra") + 2
iC3 = find("So Cleopatra") + 1
iP2 = find("To her the pyramids") + 3
iP3 = find("that pyramid") + 1
iY1 = find("THOUSAND years") + 1
iY2 = find("hundred years") + 1
iT2 = find("Just two thousand") + 2
cues = {
    # the hook: the selfie on the Moon
    "you": W("You'd"), "cleo1": W("Cleopatra's"), "closer1": W("closer"), "pyr1": W("pyramids"), "pyr1_end": E("pyramids"),
    "moon1": W("Moon landing"), "landing_end": E("Moon landing", 1), "nope": W("Nope"), "nope_end": E("Nope"),
    # the answer: Giza
    "to_her": W("To her"), "pyr2": T.ws[iP2], "already": W("already"), "already_end": E("already"),
    "ancient": W("ancient"), "history": W("history"), "history_end": E("history"),
    # the climb
    "climb": W("Climb"), "me_end": E("with me", 1), "pyramid3": W("Pyramid to"), "cleo3": T.ws[iC1],
    "cleo3_end": T.we[iC1], "two": W("Two and"), "thousand1": W("THOUSAND"), "thousand1_end": E("THOUSAND"),
    "years1_end": T.we[iY1],
    "cleo4": T.ws[iC2], "moon2": W("Moon", 0, iC2), "moon2_end": E("Moon", 0, iC2), "just": W("Just"),
    "thousand2": T.ws[iT2], "thousand2_end": T.we[iT2],
    # the payoff: the whole ladder
    "shes": W("She's"), "neil": W("Neil"), "armstrong_end": E("Armstrong"), "by": W("by about"), "five": W("five"),
    "hundred": W("hundred"), "years2_end": T.we[iY2],
    # the past: the slide, the building site, the mammoth, the island
    "weirder": W("Weirder"), "weirder_end": E("Weirder"), "while": W("while"), "built": W("built"),
    "pyr4": T.ws[iP3], "pyr4_end": T.we[iP3], "woolly": W("woolly"), "mammoths": W("mammoths"), "still": W("still"),
    "alive": W("alive"), "alive_end": E("alive"), "on": W("On one"), "island": W("island"), "island_end": E("island"),
    # the button
    "so": W("So Cleopatra"), "cleo5": T.ws[iC3], "cleo5_end": T.we[iC3], "practically": W("Practically"),
    "practically_end": E("Practically"), "modern": W("modern"), "modern_end": E("modern"),
    "end": DUR,
}
c = cues
assert c["cleo1"] < c["pyr1"] < c["moon1"] < c["nope"] < c["to_her"] < c["pyr2"] < c["climb"] < c["cleo3"] < c["thousand1"] \
    < c["cleo4"] < c["moon2"] < c["thousand2"] < c["shes"] < c["neil"] < c["five"] < c["weirder"] < c["pyr4"] < c["woolly"] \
    < c["island"] < c["so"] < c["cleo5"] < c["practically"] < c["modern"]
cues.update({
    "flash": c["nope"] + 0.03,                          # "Nope.": the selfie's flash and the shutter
    "old_tag": c["already"] + 0.05,                      # ALREADY 2,500 YEARS OLD pops on the pyramid
    "yawn": c["ancient"] - 0.12,                         # her yawn opens on "ancient"...
    "yawn_end": c["history_end"] + 0.15,                 # ...and closes after "history."
    "weed": c["history"] - 0.3,                          # a tumbleweed rolls across in front of her
    "beckon": c["climb"] + 0.02,                         # "Climb with me.": he waves us up and grabs a rung
    "up1": c["me_end"] - 0.05,                           # the first climb starts (the counter from 0)
    "reach1": c["years1_end"] - 0.04,                    # ...and reaches her swing at 69 BC on "years." (2,500)
    "ding1": c["years1_end"] + 0.03,                     # the count lands: ding (in the pause after "years.")
    "up2": c["cleo4"] + 0.02,                            # the second climb (a fresh counter from 0)
    "space": c["moon2"] - 0.2,                           # the sky turns to space; the Moon fills the top
    "reach2": c["thousand2_end"] - 0.03,                 # he steps onto the Moon on "thousand" (2,000)
    "ding2": c["thousand2_end"] + 0.03,                  # ding (in the pause after "thousand.")
    "pull": c["shes"] - 0.05,                            # the pull-back to the whole ladder
    "brackets": c["by"] - 0.05,                          # the two spans draw on
    "slide500": c["five"] - 0.05,                        # the 2,000 span slides down onto the 2,500 one
    "glow500": c["hundred"] + 0.05,                      # the leftover 500 glows
    "jump": c["weirder"] + 0.02,                         # he hops onto the rails and slides down
    "land": c["pyr4"] - 0.1,                             # he lands on the half-built pyramid (2560 BC)
    "split": c["woolly"] - 0.12,                         # the split screen wipes in: the Arctic
    "trumpet": c["alive_end"] + 0.04,                    # the mammoth trumpets, in the pause after "alive."
    "zoomout": c["on"] - 0.05,                           # "On one island.": that half pulls back to the island
    "shrug": c["island_end"] + 0.02,
    "peer": c["cleo5"] + 0.05,                           # she peers over her sunglasses
    "shades_up": c["practically"] + 0.1,                 # and pushes them back up
    "bubble": c["modern"] + 0.05,                        # the gum bubble grows...
    "pop": c["modern_end"] + 0.12,                       # ...and POPS in the pause after "modern."
})
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the claim, put to "you")')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
