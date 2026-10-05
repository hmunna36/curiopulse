"""Edit timeline for the Why Does Your Voice Sound WEIRD on Recordings? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.40)  # after "hits.": the hiccup throws the phone up, and it lands on PLAY again (the loop)

W, E, ev, find = T.W, T.E, T.ev, T.find


def move_onset(phrase, block, k=0):
    """v3 gives a tag's time to the word after it, so the alignment starts that word late. Move word k of `phrase`
    to the first loud frame of its take (checked on the waveform)."""
    i = find(phrase) + k
    t0 = T.first_loud(T.block(block)["start"], thr=-33.0)
    if T.ws[i] - t0 > 0.05:
        T.ws[i] = T.words[i]["start"] = t0
    return i


# "[panicked] WHO", "[deadpan] Bad", "[mischievously] Next": each starts where its take gets loud
# (the panicked take opens with a breath: -42 dB, under the threshold, so the word still starts on "WHO")
move_onset("WHO is THAT", "who")
move_onset("Bad news", "you")
move_onset("Next up", "sub")

CHK = ev("chuckles")["t"]              # her chuckle, before "Maybe you don't hate your voice."
HIC = E("hits") + 0.16                 # the hiccup that proves her point
PLAY2 = T.duration - 0.10              # the phone lands in his hand, thumb on PLAY: frame 1

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                         # the couch: his thumb hits PLAY, a squeaky stranger comes out of the phone
    ("who", None),                          # close on his face: WHO is THAT?!
    ("you", None),                          # the phone's screen: the sender is ... him. "Bad news. That's you."
    ("twice", "When you talk"),             # his head from the front, see-through: route 1 through the air, route 2 through the skull
    ("deep", "The skull version"),          # the two signals side by side: the skull's is the fat, slow one
    ("trailer", "Like a movie"),            # how he sounds to himself: a movie trailer
    ("mic", "But a microphone"),            # a microphone at his mouth: the air route goes in, the skull route never leaves his head
    ("always", "So that recording"),        # karaoke night: what he hears vs what the room has always heard
    ("plug", "Plug your ears"),             # fingers in his ears, a hum ... BOOM: his skull lights up
    ("study", "The weird part"),            # the listening test: three mystery voices, one is his own, and it gets the hearts
    ("button", None),                       # the couch again: he plays it once more ... and rather likes it
    ("sub", None),                          # the tease, the subscribe cue, the hiccup, the phone lands on PLAY (loop)
]
special = {
    "who": T.ws[find("WHO is THAT")] - 0.07,
    "you": T.ws[find("Bad news")] - 0.07,
    "button": CHK - 0.06,
    "sub": T.ws[find("Next up")] - 0.07,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "You hit play", "on your own / voice message", "and",
    "WHO is / THAT",
    "Bad news", "That's you",
    "When you talk", "you hear / yourself", "TWICE", "once through / the air", "and once / through your", "SKULL",
    "The skull / version", "sounds / deeper", "Like a / movie trailer",
    "But a / microphone", "only gets", "the air part", "So that / recording", "is what / everyone else", "has ALWAYS / heard",
    "Plug / your ears", "and hum", "That boom", "Your skull",
    "The weird / part", "In one study", "people rated", "recorded / voices", "without / knowing", "one was / their OWN",
    "They liked / theirs", "MORE",
    "Maybe you / don't hate", "your voice", "You just hate", "knowing / it's you",
    "Next up", "why we / hiccup", "Subscribe", "before the / next one", "hits",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
# colour only the words that carry the idea (normalized lowercase keys); cyan = the air route, orange = the skull route
COLOR = {
    "play": G, "voice": O, "message": C,
    "who": Y, "bad": R, "that's": Y,
    "twice": Y, "air": C, "skull": O,
    "deeper": O, "movie": V, "trailer": V,
    "microphone": C, "recording": V, "everyone": Y, "always": Y,
    "plug": C, "ears": C, "hum": Y, "boom": O,
    "weird": V, "study": C, "recorded": V, "own": Y, "liked": PK, "more": G,
    "hate": R, "knowing": Y,
    "hiccup": V, "subscribe": R, "hits": Y,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings (P[\"P\"], not P)"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

i_who = find("WHO is THAT")
i_bad = find("Bad news")
i_thats = find("That's you")
i_once1 = find("once through the air")
i_once2 = find("once through your SKULL")
i_deep = find("The skull version")
i_mic = find("But a microphone")
i_so = find("So that recording")
i_plug = find("Plug your ears")
i_boom = find("That boom")
i_ysk = find("That boom Your skull") + 2      # not the "your SKULL" of the two routes
i_weird = find("The weird part")
i_they = find("They liked theirs")
i_maybe = find("Maybe you don't")
i_just = find("You just hate")
i_next = find("Next up")
i_sub = find("Subscribe")
# every beat the picture or the sound needs, by name (never hard-code a time in scenes or audio.py)
cues = {
    # hook
    "hit": W("hit play"), "play": W("play"), "own": W("own voice"), "voice": W("voice message"), "message": W("message"),
    "message_end": E("message"), "and": W("and"), "and_end": E("and"),
    "tap": 0.0,                                       # his thumb is already on PLAY on frame 1
    "front": W("on your own") - 0.05,                 # cut from his eyes to the front: he listens
    "gib0": 0.12,                                     # the phone starts talking, quietly, under the narration ...
    "gib1": E("and") + 0.06,                          # ... and then the stranger's voice gets the room to itself
    "gib1_end": T.ws[i_who] - 0.16,
    # who
    "who": T.ws[i_who], "who_end": T.we[i_who], "that": T.ws[i_who + 2], "that_end": T.we[i_who + 2],
    # you
    "bad": T.ws[i_bad], "news": T.ws[i_bad + 1], "news_end": T.we[i_bad + 1], "thats": T.ws[i_thats], "you": T.ws[i_thats + 1],
    "you_end": T.we[i_thats + 1],
    "ident": T.ws[i_thats] - 0.04,                    # the sender's name lights up: YOU
    # twice
    "when": W("When you talk"), "talk": W("talk"), "talk_end": E("talk"), "hear": W("hear yourself"), "yourself": W("yourself"),
    "twice": W("TWICE"), "twice_end": E("TWICE"), "once1": T.ws[i_once1], "air": T.ws[i_once1 + 3], "air_end": T.we[i_once1 + 3],
    "andonce": W("and once through"), "once2": T.ws[i_once2], "your2": T.ws[i_once2 + 2], "skull": T.ws[i_once2 + 3],
    "skull_end": T.we[i_once2 + 3],
    # deep
    "theskull": T.ws[i_deep], "version": W("version"), "sounds": W("sounds"), "deeper": W("deeper"), "deeper_end": E("deeper"),
    "fx_in": W("deeper") - 0.03,                      # the narrator's own voice drops into her "inside the head" sound ...
    # trailer
    "like": W("Like a movie"), "movie": W("movie"), "trailer": W("trailer"), "trailer_end": E("trailer"),
    "braam": W("movie") - 0.04,
    "fx_out": E("trailer") + 0.10,                    # ... and snaps back for "But a microphone"
    # mic
    "but": T.ws[i_mic], "microphone": W("microphone"), "only": W("only gets"), "gets": W("gets"), "air2": T.ws[i_mic + 6],
    "part": W("part"), "part_end": E("part"),
    "blocked": W("only gets") + 0.05,                 # the skull route bounces off the inside of his head
    # always
    "so": T.ws[i_so], "recording": W("recording"), "recording_end": E("recording"), "iswhat": W("is what everyone"),
    "everyone": W("everyone"), "else": W("else"), "else_end": E("else"), "has": W("has ALWAYS"), "always": W("ALWAYS"),
    "always_end": E("ALWAYS"), "heard": W("heard"), "heard_end": E("heard"),
    "sing": T.ws[i_so] - 0.02,                        # he is mid-song when we cut in
    "realise": E("ALWAYS") + 0.06,                    # ... the record scratches in the pause after "ALWAYS": it dawns on him
    # plug
    "plug": T.ws[i_plug], "ears": W("ears and hum"), "andhum": W("and hum"), "hum": W("hum"), "hum_end": E("hum"),
    "thatboom": T.ws[i_boom], "boom": T.ws[i_boom + 1], "boom_end": T.we[i_boom + 1], "yourskull": T.ws[i_ysk],
    "skull2": T.ws[i_ysk + 1], "skull2_end": T.we[i_ysk + 1],
    "fingers": T.ws[i_plug] + 0.10,                   # the fingers go in
    "humstart": E("ears") + 0.02,                     # he hums through "and hum" (quietly), and on into the pause
    "boomhit": T.we[i_boom + 1] + 0.03,               # the skull lights up right after the word
    # study
    "weird": W("weird"), "part2": T.ws[i_weird + 2], "part2_end": T.we[i_weird + 2], "inone": W("In one study"), "study": W("study"),
    "study_end": E("study"), "people": W("people rated"), "rated": W("rated"), "recorded": W("recorded voices"),
    "voices": W("voices"), "voices_end": E("voices"), "without": W("without"), "knowing": W("knowing one"), "one": W("one was"),
    "their": W("their OWN"), "ownv": W("their OWN", 1), "ownv_end": E("their OWN", 1), "they": T.ws[i_they], "liked": W("liked"),
    "theirs": W("theirs"), "theirs_end": E("theirs"), "more": W("MORE"), "more_end": E("MORE"),
    "flip": W("their OWN", 1) - 0.10,                          # the mystery card turns round: it's him
    "hearts": W("liked") + 0.05,
    # button
    "chuckle": CHK, "maybe": T.ws[i_maybe], "dont": W("don't hate"), "hate1": T.ws[i_maybe + 3], "yourvoice": W("your voice"),
    "voice2": T.ws[i_maybe + 5], "voice2_end": T.we[i_maybe + 5], "youjust": T.ws[i_just], "just": W("just"),
    "hate2": T.ws[i_just + 2], "knowing2": T.ws[i_just + 3], "its": T.ws[i_just + 4], "you2": T.ws[i_just + 5],
    "you2_end": T.we[i_just + 5],
    "replay": CHK + 0.34,                             # he plays it again, in the pause after her chuckle
    "replay_end": T.ws[i_maybe] - 0.08,
    # sub
    "nextup": T.ws[i_next], "why": W("why we"), "hiccup": W("hiccup"), "hiccup_end": E("hiccup"), "subscribe": T.ws[i_sub],
    "subscribe_end": T.we[i_sub], "before": W("before the"), "nextone": W("next one"), "hits": W("hits"), "hits_end": E("hits"),
    "hic": HIC, "play2": PLAY2,
    "hic1": E("hiccup") + 0.10,                       # a small one first, in the pause after "why we hiccup." (he saw that coming)
    "catch": T.duration - 0.34,                       # back to his own eyes: the phone drops into his hand, thumb on PLAY (frame 1 again)
}
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.ws[i_sub]
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word, and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
# "Subscribe... before the next one hits.": the cursor clicks in the pause right after "Subscribe"
cues["sub_tap"] = min(T.we[i_sub] + 0.06, T.duration - 0.8)
# the "and" caption leaves when the stranger's voice takes over
for _c in caps:
    if _c["lines"][0][0]["t"] == "AND" and len(_c["lines"]) == 1 and len(_c["lines"][0]) == 1 and _c["start"] < 5:
        _c["end"] = round(min(_c["end"], cues["gib1"] + 0.30), 3)
# "through" (in "once through the air"): the alignment ends the word after its breathy "thr" (11.34 s) and gives the voiced
# half ("-ough") to "the", so qa.py measured a fricative against the score. The word runs on to the next dip in the waveform.
# Moved AFTER the shots, captions and cues were computed, so the picture and the mix stay exactly as they are: only the
# per-word windows that qa.py measures use these times.
import numpy as np  # noqa: E402


def _level(t, hop=0.01):
    seg = T.audio[int(t * T.sr):int((t + hop) * T.sr)]
    return 10 * np.log10((seg ** 2).mean() + 1e-12) if len(seg) else -120.0


_i = find("once through the air") + 1
_tv = T.first_loud(T.we[_i] - 0.02, thr=-25.0)          # where the voiced half starts
_te = _tv
while _te < T.ws[_i + 2] and _level(_te) > -35.0:        # ... and where it ends (the dip before "the")
    _te += 0.01
if _te - T.we[_i] > 0.05:
    T.words[_i]["end"] = round(_te, 3)
    T.words[_i + 1]["start"], T.words[_i + 1]["end"] = round(_te + 0.02, 3), round(T.ws[_i + 2] - 0.005, 3)
    print(f'  "through" now ends at {_te:.2f} s (alignment: {T.we[_i]:.2f}); "the" {_te + 0.02:.2f}-{T.ws[_i + 2] - 0.005:.2f}')
T.write(shots, caps, cues)
for k in ("gib1", "gib1_end", "who", "bad", "ident", "fx_in", "braam", "fx_out", "blocked", "realise", "fingers", "humstart", "boomhit", "flip",
          "hearts", "chuckle", "replay", "replay_end", "sub_in", "sub_tap", "hic", "play2"):
    print(f"  {k:10s} {cues[k]:6.2f}")
