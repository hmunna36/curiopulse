"""Edit timeline for the Why Do We Get GOOSEBUMPS? Short.

Usage: python3 make_timeline.py <work_dir>
Reads <work>/narration.wav + words.json (voice.py); writes <work>/voice.wav + timeline.json.
Worked example: the skill's reference/examples/make_timeline.finger-wrinkles.py.
"""
import sys

from timeline_lib import PALETTE as P, Timeline

T = Timeline(sys.argv[1], tail=1.05)  # after "on command.": the click, his ONE hair pops, the TV flashes again (the loop)

# (shot id, phrase whose first word opens the shot). None = timed in `special`.
SHOTS = [
    ("hook", None),                        # the couch, a jump scare on the TV: popcorn flies, his hair stands; the dive to his arm; the hairs RISE
    ("react", None),                       # hard cut in the gap: a plucked goose lands on his arm, same bumps
    ("name", "Hence goosebumps"),          # punch in: GOOSE / BUMPS
    ("mech", "Each arm hair"),             # the skin in section: every hair has its own little muscle; the nerve fires; all of them yank
    ("bump", "The hair stands"),           # macro on one follicle: the hair swings upright, the skin bunches into a bump
    ("fur", "For furry animals"),          # a ginger cat in the snow: fluffed fur, warm air trapped in it
    ("huge", "and makes a"),               # a dog's shadow looms: the cat puffs up HUGE, the dog thinks again
    ("joke", None),                        # the couch: his ghost fur drops off; a big red button stays
    ("music", "Even music can"),           # headphones: a note presses the button, the alarm lamp spins, the shiver
    ("command", "And some people"),        # the arm with a light switch: hairs up, down, up
    ("showoffs", None),                    # hard cut: he strains, red-faced. Nothing.
    ("sub", "Next up why"),                # the tease card; the click makes exactly one hair stand; the TV flashes again
]
special = {
    "react": T.W("Congrats") - 0.16,
    "joke": T.W("You lost the") - 0.14,
    "showoffs": T.W("Show-offs") - 0.22,
}

# caption chunks: EXACT consecutive word runs covering the whole narration, 1–5 words, "/" splits two lines.
CHUNKS = [
    "Scary movie", "creepy music", "and your arm / does", "this",
    "Congrats", "You're a / plucked goose",
    "Hence", "goosebumps",
    "Each arm hair", "has its own / tiny muscle", "Scared", "or cold", "Your nerves / yank them", "ALL at once",
    "The hair / stands up", "and the skin / bunches", "into a bump",
    "For furry / animals", "it's genius", "Fluffed fur", "traps / warm air", "and makes a / scared cat", "look", "HUGE",
    "You lost / the fur", "but kept / the button",
    "Even music / can press it", "Scientists / think", "big emotions", "trip the same / old alarm",
    "And some / people", "can do it", "on command",
    "Show-offs",
    "Next up", "why your / ears pop", "on planes", "Subscribe", "on command",
]
Y, O, C, R, G, B, V, S, PK = P["Y"], P["O"], P["C"], P["R"], P["G"], P["B"], P["V"], P["S"], P["P"]
COLOR = {
    "scary": R, "creepy": V, "arm": O, "this": Y,
    "plucked": PK, "goose": Y,
    "goosebumps": Y,
    "hair": O, "tiny": PK, "muscle": PK, "scared": V, "cold": S, "nerves": O, "yank": Y, "all": Y,
    "stands": Y, "skin": PK, "bunches": O, "bump": Y,
    "furry": O, "genius": G, "fluffed": O, "fur": O, "warm": O, "air": O, "cat": O, "huge": Y,
    "lost": R, "kept": G, "button": R,
    "music": C, "press": R, "scientists": B, "think": B, "emotions": PK, "alarm": R,
    "some": Y, "command": G,
    "show-offs": V,
    "ears": C, "pop": Y, "planes": C, "subscribe": R,
}
DISPLAY = {}
assert all(isinstance(v, str) and v.startswith("#") for v in COLOR.values()), "COLOR values must be hex strings"

shots = T.shots(SHOTS, special)
caps = T.captions(CHUNKS, COLOR, shots, DISPLAY)

W, E, ev, find = T.W, T.E, T.ev, T.find
i_sub = find("Next up why")
i_cmd2 = find("on command", i_sub)
cues = {
    # hook: the jump scare on frame 1, the whisper, the dive to the arm, the hairs rise on "this"
    "scare": 0.0,
    "scary": W("Scary"), "movie": W("movie"), "movie_end": E("movie"), "creepy": W("creepy"), "music_w": W("music"),
    "music_end": E("music"), "and_your": W("and your arm"), "arm": W("arm", 0, find("and your arm")),
    "does": W("does"), "does_end": E("does"), "this": W("this"), "this_end": E("this"),
    "armcut": W("and your arm") + 0.10,          # the whip into the macro arm
    "rise": W("this") + 0.02,                    # the hairs spring up in a wave, the skin bumps
    # react
    "congrats": W("Congrats"), "congrats_end": E("Congrats"), "youre": W("You're a"), "plucked": W("plucked"),
    "goose": W("goose"), "goose_end": E("goose"),
    # name
    "hence": W("Hence"), "hence_end": E("Hence"), "goosebumps": W("goosebumps"), "goosebumps_end": E("goosebumps"),
    # mech
    "each": W("Each"), "armhair": W("hair", 0, find("Each arm hair")), "own": W("own"), "tiny": W("tiny"),
    "muscle": W("muscle"), "muscle_end": E("muscle"), "scared": W("Scared"), "scared_end": E("Scared"),
    "cold": W("cold"), "cold_end": E("cold"), "nerves": W("nerves"), "nerves_end": E("nerves"), "yank": W("yank"),
    "all": W("ALL"), "once": W("once"), "once_end": E("once"),
    # bump
    "thehair": W("The hair stands"), "stands": W("stands"), "up": W("up", 0, find("stands up") + 1),
    "up_end": E("up", 0, find("stands up") + 1), "skin": W("skin"), "bunches": W("bunches"),
    "bunches_end": E("bunches"), "bump": W("bump"), "bump_end": E("bump"),
    # fur
    "furry": W("furry"), "animals": W("animals"), "genius": W("genius"), "genius_end": E("genius"),
    "fluffed": W("Fluffed"), "traps": W("traps"), "warm": W("warm"), "air": W("air"), "air_end": E("air"),
    # huge
    "makes": W("makes"), "scaredcat": W("scared", 0, find("a scared cat")), "cat": W("cat"), "cat_end": E("cat"),
    "look": W("look"), "huge": W("HUGE"), "huge_end": E("HUGE"),
    # joke
    "you": W("You lost"), "lost": W("lost"), "fur2": W("fur", 0, find("lost the fur")), "fur2_end": E("fur", 0, find("lost the fur")),
    "but": W("but kept"), "kept": W("kept"), "button": W("button"), "button_end": E("button"),
    # music
    "even": W("Even"), "music2": W("music", 0, find("Even music")), "press": W("press"), "pressit_end": E("it", 0, find("press it") + 1),
    "scientists": W("Scientists"), "think_end": E("think"), "big": W("big emotions"), "emotions": W("emotions"),
    "emotions_end": E("emotions"), "trip": W("trip"), "same": W("same"), "alarm": W("alarm"), "alarm_end": E("alarm"),
    # command
    "some": W("some people"), "people": W("people"), "cando": W("can do it"), "doit_end": E("it", 0, find("can do it") + 2),
    "on1": W("on command"), "command": W("command"), "command_end": E("command"),
    # showoffs
    "showoffs": W("Show-offs"), "showoffs_end": E("Show-offs"),
    # sub
    "nextup": W("Next up"), "why": W("why your"), "ears": W("ears"), "pop": W("pop"), "pop_end": E("pop"), "planes": W("planes"),
    "planes_end": E("planes"), "subscribe": W("Subscribe"), "subscribe_end": E("Subscribe"),
    "on2": T.ws[i_cmd2], "command2": T.ws[i_cmd2 + 1], "command2_end": T.we[i_cmd2 + 1],
}
# the light switch in "command": ON as she says "can do it", OFF in the pause, ON again on "command"
cues["sw_on1"] = cues["cando"] + 0.05
cues["sw_off"] = cues["doit_end"] + 0.10
cues["sw_on2"] = cues["command"] + 0.04
# ---- the subscribe cue (web/subscribe.js): the last ~2.6 s. Needs a `## sub` block in script.txt with the word "subscribe".
_sub_w = T.W("subscribe")
_sub_in = min(_sub_w - 0.30, T.duration - 2.6)  # pill pops ~0.3 s before the word, and at least 2.6 s remain
cues["sub_in"] = max(0.0, _sub_in)
# "Subscribe... on command.": the cursor clicks right after "command" (the viewer obeys), and that click raises his ONE hair
cues["sub_tap"] = min(cues["command2_end"] + 0.10, T.duration - 0.8)
cues["onehair"] = cues["sub_tap"] + 0.06
cues["loopflash"] = T.duration - 0.14            # the TV flashes again: the last frames lead into frame 1
cues["hit"] = cues["pressit_end"] + 0.03         # the note lands on the button, just after "press it."
cues["headpop"] = cues["movie_end"] + 0.08       # one piece of popcorn lands on his head, in the pause after "movie..."
# word ends the sound design needs (punchline SFX go after the word)
cues.update({
    "tiny_end": E("tiny"), "yank_end": E("yank"), "stands_end": E("stands"), "fluffed_end": E("Fluffed"),
    "fur1_end": E("fur", 0, find("Fluffed fur")), "look_end": E("look"), "lost_end": E("lost"), "kept_end": E("kept"),
    "people_end": E("people"), "ears_end": E("ears"),
})
T.write(shots, caps, cues)
