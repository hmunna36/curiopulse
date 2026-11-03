"""Edit timeline for the Which THUMB Is On Top When You Clasp Your Hands? 🙏 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline, video_subscribe

T = Timeline(sys.argv[1], tail=1.0)  # seconds after the last word: the clouds close again, the rain returns, his hands open
#                                      and the cut back to frame 1 (him clasping in the rain) is one move

# (shot id, phrase whose first word opens the shot). The first shot starts at 0.
SHOTS = [
    ("hook", None),               # THE TEST: tight on his face and his clasped hands under his chin, praying in the rain at the
                                  # campsite; frame 1: the fingers sliding together; "Now put the OTHER thumb on top": he unclasps
                                  # and re-clasps the other way, his face crumples; lightning in the gap (the sky disapproves)
    ("seats", None),              # the camera pushes into the clasp (no cut to a diagram): faces pop open on every finger; "Every
                                  # finger just moved... one seat over": the move replayed, everyone lands one row over and side-eyes
                                  # the new neighbours; "Swap back": home, bliss; "Swap again": next to... strangers
    ("coin", "So which way's normal?"),   # medium shot in the rain: hands down, a shrug on "Neither"; he flicks a coin with his thumb:
                                  # LEFT / RIGHT faces, 55 % / 44 %; it lands ON ITS EDGE in the mud: 1 % NO FAVOURITE
    ("twins", "Even identical"),  # his identical twin praying beside him; SAME DNA; the two clasps side by side: different thumbs on
                                  # top; they glare at each other's hands; 4 IN 10 PAIRS
    ("button", "So if you're"),   # back to the hook's framing, praying the wrong way; "use your own thumb": he swaps back and the
                                  # clouds part, a shaft of sun; "Just in case."; the clouds close, the rain returns, frame 1
]
special = {"seats": T.W("Feels") - 0.42}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Clasp your / hands.", "Don't think.", "Now put the / OTHER thumb", "on top.",
    "Feels wrong, / right?", "Every finger / just moved...", "one seat / over.",
    "Swap back.", "Feel them all / slide home?", "Swap again.", "Everyone's / next to...", "strangers.",
    "So which way's / normal?", "Neither.", "It's basically / a coin toss.",
    "Even identical / twins,", "same DNA,", "pick different / thumbs", "four times / in ten.",
    "So if you're / praying", "for sunshine...", "use your / own thumb.", "Just in case.",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
COLOR = {"clasp": Y, "hands": Y, "other": R, "thumb": Y, "wrong": R, "seat": Y, "over": Y, "home": G, "strangers": V,
         "normal": C, "neither": R, "coin": Y, "toss": Y, "identical": C, "twins": C, "dna": G, "different": R,
         "four": Y, "ten": Y, "sunshine": O, "own": G, "case": Y}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_back = find("Swap back.")
i_again = find("Swap again.")
i_btn = find("So if you're")
cues = {
    # the hook: the test
    "hands": W("hands."), "think": W("think."), "think_end": E("think."),
    "now": W("Now"), "other": W("OTHER"), "thumb1": W("thumb", s=find("OTHER thumb")), "top": W("top."), "top_end": E("top."),
    # the answer
    "feels": W("Feels"), "right": W("right?"), "right_end": E("right?"), "every": W("Every"), "moved": W("moved..."),
    "moved_end": E("moved..."), "one": W("one"), "seat": W("seat"), "over": W("over."), "over_end": E("over."),
    # back and again
    "swap2": T.ws[i_back], "back_end": E("back."), "feel": W("Feel"), "slide": W("slide"), "home": W("home?"), "home_end": E("home?"),
    "swap3": T.ws[i_again], "again_end": E("again."), "everyone": W("Everyone's"), "nextto": W("next"), "to": W("to..."),
    "strangers": W("strangers."), "strangers_end": E("strangers."),
    # the coin
    "so1": W("So which"), "normal": W("normal?"), "neither": W("Neither."), "neither_end": E("Neither."), "basically": W("basically"),
    "coinw": W("coin"), "toss": W("toss."), "toss_end": E("toss."),
    # the twins
    "even": W("Even"), "identical": W("identical"), "twinsw": W("twins,"), "same": W("same"), "dna": W("DNA,"), "dna_end": E("DNA,"),
    "pick": W("pick"), "different": W("different"), "thumbs": W("thumbs"), "four": W("four"), "ten": W("ten."), "ten_end": E("ten."),
    # the button
    "so2": T.ws[i_btn], "praying": W("praying"), "sunshine": W("sunshine..."), "sunshine_end": E("sunshine..."), "use": W("use"),
    "own": W("own"), "thumb2": W("thumb.", s=find("own thumb.")), "thumb2_end": E("thumb.", s=find("own thumb.")),
    "just": W("Just", s=find("Just in case.")), "case": W("case."), "case_end": E("case."),
}
cues["clasped"] = 0.42                                          # frame 1: the fingers sliding together; clasped by here
cues["peek"] = round(cues["now"] - 0.05, 3)                     # he opens his eyes and looks down at his hands
cues["swap1"] = round(cues["other"] - 0.02, 3)                  # the swap: out, one row over, back in
cues["swap1_end"] = round(cues["swap1"] + 0.62, 3)
cues["cringe"] = round(cues["swap1_end"] + 0.02, 3)             # his face crumples, the fingers wriggle
cues["bolt"] = round(cues["top_end"] + 0.12, 3)                 # lightning: the sky disapproves (in the gap before "Feels")
cues["push"] = round(cues["bolt"] + 0.05, 3)                    # the camera pushes into the clasp
cues["faces"] = round(cues["feels"] - 0.06, 3)                  # the faces pop open
cues["replay0"] = round(cues["every"] - 0.04, 3)                # the move replayed: back to the old rows
cues["replay1"] = round(cues["moved"] - 0.02, 3)                # and over again, with ghosts where they sat
cues["sideeye"] = round(cues["seat"] - 0.05, 3)                 # everyone looks at the new neighbours
cues["swapb"] = round(cues["swap2"] - 0.02, 3)                  # swap back
cues["bliss"] = round(cues["slide"] - 0.04, 3)                  # home: bliss, little hearts
cues["swapc"] = round(cues["swap3"] - 0.02, 3)                  # swap again
cues["turn"] = round(cues["to"] + 0.1, 3)                       # slowly everyone turns to look at the neighbours...
cues["snapeye"] = round(cues["strangers"] - 0.02, 3)            # ...strangers: the side-eye snaps, the pinky scoots off
cues["letgo"] = round(cues["so1"] - 0.05, 3)                    # hands down
cues["shrug"] = round(cues["neither"] - 0.04, 3)
cues["flick"] = round(cues["coinw"] - 0.22, 3)                  # the thumb flicks the coin up
cues["pct"] = round(cues["coinw"] + 0.1, 3)                    # 55 % / 44 % tags, at the top of the flip
cues["land"] = round(cues["toss_end"] + 0.1, 3)                 # the coin lands ON ITS EDGE (in the gap)
cues["onepct"] = round(cues["land"] + 0.12, 3)                  # 1 %: NO FAVOURITE
cues["twin_in"] = round(cues["even"] - 0.08, 3)
cues["dnatag"] = round(cues["same"] - 0.04, 3)
cues["down2"] = round(cues["pick"] - 0.12, 3)                   # the camera tips down to the two clasps
cues["rings"] = round(cues["different"] - 0.04, 3)              # rings round the two top thumbs
cues["glare"] = round(cues["thumbs"] + 0.05, 3)                 # they glare at each other's hands
cues["grid"] = round(cues["four"] - 0.06, 3)                    # 4 IN 10 PAIRS
cues["swapd"] = round(cues["use"] - 0.05, 3)                    # his own thumb again
cues["sun"] = round(cues["thumb2"] + 0.05, 3)                   # the clouds part
cues["wink"] = round(cues["just"] - 0.05, 3)
cues["close"] = round(cues["case_end"] + 0.18, 3)               # the clouds close, the rain comes back
cues["unclasp"] = round(T.duration - 0.42, 3)                   # his hands open: frame 1 picks up from here
_order = ["clasped", "hands", "think", "think_end", "peek", "now", "swap1", "other", "thumb1", "swap1_end", "cringe", "top",
          "top_end", "bolt", "push", "faces", "feels", "right", "right_end", "replay0", "every", "replay1", "moved", "moved_end",
          "one", "sideeye", "seat", "over", "over_end", "swapb", "swap2", "back_end", "feel", "bliss", "slide", "home", "home_end",
          "swapc", "swap3", "again_end", "everyone", "nextto", "to", "turn", "snapeye", "strangers", "strangers_end", "letgo",
          "so1", "normal", "shrug", "neither", "neither_end", "basically", "flick", "coinw", "pct", "toss", "toss_end", "land",
          "onepct", "twin_in", "even", "identical", "twinsw", "dnatag", "same", "dna", "dna_end", "down2", "pick", "rings",
          "different", "thumbs", "glare", "grid", "four", "ten", "ten_end", "so2", "praying", "sunshine", "sunshine_end",
          "swapd", "use", "own", "thumb2", "sun", "thumb2_end", "wink", "just", "case", "case_end", "close", "unclasp"]
_bad = [(a, cues[a], b, cues[b]) for a, b in zip(_order, _order[1:]) if not cues[a] < cues[b]]
assert not _bad, f"cues out of order: {_bad}"
assert set(_order) == set(cues), set(cues) ^ set(_order)
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: nothing said' + (' (the pill arm: the silent pill over the last 2.4 s)' if video_subscribe(sys.argv[1]) == "pill" else ' (no pill; the Short loops)')
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
