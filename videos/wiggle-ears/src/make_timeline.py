"""Edit timeline for the Why Can't Most People WIGGLE Their Ears? 👂 Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.6)  # seconds after the last word: he looks at us, then goes back to straining (frame 0) for the loop

# v3 gave "No" the silence before it (it sits 2.42-2.51 s, the voice says it at about 2.68 s): move it, and "eyebrows" after it
_i = T.find("No eyebrows")
_on = T.first_loud(T.ws[_i])
if _on > T.ws[_i] + 0.08:
    T.ws[_i] = T.words[_i]["start"] = _on
    T.we[_i] = T.words[_i]["end"] = round(max(T.we[_i], _on + 0.13), 3)
    T.ws[_i + 1] = T.words[_i + 1]["start"] = round(max(T.ws[_i + 1], T.we[_i]), 3)

# (shot id, phrase whose first word opens the shot). Every id needs an SC.<id> in web/. One world: a party at night, him close,
# his forehead and his ear turning to glass where he stands; the brain's room behind the window on his forehead.
SHOTS = [
    ("hook", None),                 # THE TEST: frame 0 is him at a party, close, straining to wiggle his ears: his brows bob up and
                                    # down, his ears do not move. "No eyebrows!" clamps the brows; "Nope?" he deflates. "Your brain"
                                    # opens a round window on his forehead and the camera dives into it.
    ("brain", None),                # the brain's room (the dive lands here): a MISSING poster for the EAR REMOTE, last seen 25
                                    # million years ago; then it grabs the FACE remote and mashes the BROWS button
    ("brows", None),                # hard cut to his face: both brows shoot up (the viewer's own result)
    ("muscles", "Your ear muscles"),  # the camera goes to his ear, which turns to glass: three tiny muscles, asleep, numbered
    ("wires", "And the wires"),     # the wires from inside his head light up; a balloon pops beside that ear; it twitches
    ("party", "Strain to hear"),    # the party gets loud; he strains to hear; the top muscles flex
    ("button", "They're still"),    # the muscles, still trying; he looks at us; back to frame 0
]
_dive_end = round(T.W("brain") + 0.62, 3)
special = {"brain": _dive_end, "brows": round(T.W("EYEBROWS", s=T.find("So it mashes")) - 0.06, 3)}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1-5 words, "/" splits two lines.
CHUNKS = [
    "One in five / of you",
    "can wiggle / your ears.",
    "No eyebrows!",
    "Nope?",
    "Your brain / lost the remote",
    "for your ears...",
    "about twenty-five / million years ago.",
    "So it mashes / the buttons",
    "it DOES have...",
    "EYEBROWS!",
    "Your ear / muscles?",
    "Still there.",
    "Three / per ear.",
    "And the wires / still work:",
    "a sound / beside you",
    "makes that / ear twitch.",
    "Strain to hear",
    "at a loud / party...",
    "and the / top ones",
    "FLEX.",
    "They're / still trying.",
    "Are you?",
]
Y, O, C, R, G, B, V, S = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"]
PK = P["P"]
# colour only the words that carry the idea (normalized lowercase keys); everything else is white
COLOR = {"five": Y, "wiggle": Y, "ears": Y, "eyebrows": R, "nope": R, "brain": PK, "lost": R, "remote": O, "twentyfive": V,
         "million": V, "mashes": O, "buttons": O, "does": O, "muscles": PK, "still": G, "three": Y, "wires": O, "work": G,
         "sound": C, "twitch": Y, "strain": C, "loud": C, "party": C, "top": PK, "flex": G, "trying": G, "you": Y}
DISPLAY = {"twentyfive": "25"}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_no = find("No eyebrows")
i_ans = find("Your brain lost")
i_for = find("for your ears")
i_mash = find("So it mashes")
i_brows = find("EYEBROWS", i_mash)
i_mus = find("Your ear muscles")
i_three = find("Three per ear")
i_wires = find("And the wires")
i_party = find("Strain to hear")
i_btn = find("They're still trying")
i_are = find("Are you")
assert i_no < i_ans < i_for < i_mash < i_brows < i_mus < i_three < i_wires < i_party < i_btn < i_are, "find() order"
cues = {
    # the hook: he strains, his brows bob; "No eyebrows!" clamps them; "Nope?" he gives up
    "one": W("One"), "five": W("five"), "wiggle": W("wiggle"), "ears_end": E("ears"), "no": W("No", s=i_no),
    "noeb_end": E("eyebrows", s=i_no), "nope": W("Nope"), "nope_end": E("Nope"),
    # the answer: the window on his forehead, the dive, the brain's MISSING poster
    "your_b": W("Your", s=i_ans), "brain": W("brain", s=i_ans), "lost": W("lost", s=i_ans), "remote": W("remote", s=i_ans),
    "forears": W("for", s=i_for), "ears2_end": E("ears", s=i_for), "about": W("about", s=i_for),
    "twentyfive": W("twenty-five", s=i_for), "million": W("million", s=i_for), "ago_end": E("ago", s=i_for),
    # the FACE remote
    "so": W("So", s=i_mash), "mashes": W("mashes", s=i_mash), "buttons": W("buttons", s=i_mash), "does": W("DOES", s=i_mash),
    "have_end": E("have", s=i_mash),
    # EYEBROWS!
    "eb": W("EYEBROWS", s=i_brows), "eb_end": E("EYEBROWS", s=i_brows),
    # the ear as glass, three muscles asleep
    "your_ear": W("Your", s=i_mus), "muscles": W("muscles", s=i_mus), "muscles_end": E("muscles", s=i_mus),
    "still": W("Still", s=i_mus), "there_end": E("there", s=i_mus), "three": W("Three", s=i_three), "per": W("per", s=i_three),
    "ear3": W("ear", s=i_three), "ear3_end": E("ear", s=i_three),
    # the wires work: a balloon pops, the ear twitches
    "and_w": W("And", s=i_wires), "wires": W("wires", s=i_wires), "work_end": E("work", s=i_wires),
    "sound": W("sound", s=i_wires), "beside": W("beside", s=i_wires), "makes": W("makes", s=i_wires),
    "twitch": W("twitch", s=i_wires), "twitch_end": E("twitch", s=i_wires),
    # the loud party: the top muscles flex
    "strain": W("Strain", s=i_party), "hear": W("hear", s=i_party), "loud": W("loud", s=i_party), "party_end": E("party", s=i_party),
    "top": W("top", s=i_party), "ones_end": E("ones", s=i_party), "flex": W("FLEX", s=i_party), "flex_end": E("FLEX", s=i_party),
    # the button
    "theyre": W("They're", s=i_btn), "trying": W("trying", s=i_btn), "trying_end": E("trying", s=i_btn),
    "are": W("Are", s=i_are), "you_end": E("you", s=i_are),
}
# the gags, in the gaps after their words (sound.md: the sound just after the word, never on it)
cues["clamp"] = round(cues["no"] - 0.04, 3)              # "No eyebrows!": the brows slam down and tremble
cues["deflate"] = round(cues["nope_end"] + 0.06, 3)      # he gives up: a sigh of a pose
cues["win"] = round(cues["your_b"] - 0.12, 3)            # the window on his forehead opens
cues["dive"] = round(cues["brain"] + 0.02, 3)            # ... and the camera dives through it
cues["dive_end"] = _dive_end
cues["poster"] = round(cues["remote"] + 0.05, 3)         # the MISSING poster slaps onto the wall
cues["stamp"] = round(cues["twentyfive"] - 0.04, 3)      # LAST SEEN: 25 MILLION YEARS AGO
cues["shrug"] = round(cues["ago_end"] + 0.05, 3)         # the brain shrugs
cues["grab"] = round(cues["so"] - 0.05, 3)               # it grabs the FACE remote
# the mashing: a jab every 0.14 s from "mashes" to the end of "have"
_m, _jabs = cues["mashes"], []
while _m < cues["have_end"] - 0.05:
    _jabs.append(round(_m, 3)); _m += 0.14
cues["jabs"] = _jabs
cues["boing"] = round(cues["eb"] + 0.04, 3)              # his brows shoot up
cues["glass"] = round(cues["your_ear"] - 0.05, 3)        # his ear turns to glass
cues["m1"], cues["m2"], cues["m3"] = round(cues["three"] - 0.02, 3), round(cues["per"] - 0.02, 3), round(cues["ear3"] - 0.02, 3)
cues["zzz"] = round(cues["still"] - 0.05, 3)             # the muscles are asleep: z z z
cues["light"] = round(cues["wires"] - 0.05, 3)           # the wires light up
cues["pop"] = round(cues["work_end"] + 0.03, 3)          # the balloon pops beside his ear (the sound the line names)
cues["tw1"] = round(cues["twitch"] - 0.02, 3)            # the ear twitches...
cues["tw2"] = round(cues["twitch_end"] + 0.12, 3)        # ... and again
cues["noise"] = round(cues["strain"] - 0.15, 3)          # the party gets loud
cues["flexk"] = round(cues["flex"] - 0.06, 3)            # the top muscles flex
cues["look"] = round(cues["are"] - 0.06, 3)              # he looks at us
cues["shut"] = round(cues["you_end"] + 0.10, 3)          # the glass goes
assert cues["clamp"] < cues["nope"] < cues["win"] < cues["dive"] < cues["poster"] < cues["stamp"] < cues["grab"]
assert cues["boing"] < cues["glass"] < cues["m1"] < cues["light"] < cues["pop"] < cues["sound"] < cues["tw1"] < cues["noise"]
assert cues["flexk"] < cues["theyre"] < cues["look"] < cues["shut"]
# ---- no Subscribe pill (since 16 Oct 2026; user, 15 Oct: "yes"; reference/analytics.md, the rules of 15 Oct). The
# silent pill over the last 3.4 s still made about a quarter of the viewers leave in the last 4 s and added no
# subscribers; replays carried the channel's breakout. So the Short ends on the button line and cuts back to frame 1.
# Never set cues["sub_in"] / ["sub_tap"] / ["sub_out"]: web/subscribe.js draws the pill only when they exist, and
# qa.py fails a Short that has them. The subscribe ask lives in the caption, the description and the comments.
T.write(shots, caps, cues)
# the numbers to read before any picture is built (qa.py checks them on the MP4; fixing them now is free)
_ans = [w for w in T.words if w.get("block") == "answer"]
print(f'length: {T.duration:.2f} s (every Short since 16 Oct 2026: 30-35 s passes; publish.json says the arm)')
print(f'answer line: starts at {_ans[0]["start"]:.2f} s (must be 5.0 s or earlier)' if _ans else 'NO `## answer` BLOCK in script.txt (qa.py fails without it)')
print(f'first words: "{" ".join(w["word"] for w in T.words[:8])}" (the test: tell the viewer what to try, about "your" body)')
_spoken = [w["word"] for w in T.words if "subscrib" in w["word"].lower()]
print('subscribe: no pill, nothing said (the Short loops)'
      + (f'  BUT "{_spoken[0]}" IS SPOKEN: take it out of script.txt (qa.py fails it)' if _spoken else ''))
print("shots: " + ", ".join(f'{s["id"]} {s["start"]:.2f}-{s["end"]:.2f}' for s in shots))
print("cues: " + ", ".join(f"{k}={v:.2f}" if isinstance(v, (int, float)) else f"{k}=[{len(v)}]" for k, v in cues.items()))
