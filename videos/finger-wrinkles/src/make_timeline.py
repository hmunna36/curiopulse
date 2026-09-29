"""Build the shared edit timeline for the finger-wrinkles Short.

Usage: python3 make_timeline.py <work_dir>
Reads  <work_dir>/narration.wav + words.json (from voice.py)
Writes <work_dir>/voice.wav      narration padded to the video length
       <work_dir>/timeline.json  shots, caption chunks, sfx/animation cues
"""
import json
import re
import sys

import numpy as np
import soundfile as sf

FPS = 30
LEAD = 0.07          # cuts land this much before the phrase they illustrate
TAIL = 1.45          # after "snow tires.": the hand dives back in (loops to the opening splash)

# (shot id, phrase whose first word opens the shot); None = special
SHOTS = [
    ("hook", None),                        # splash, time-lapse, the hand rises: "...turn into..."
    ("raisins", None),                     # on the deadpan beat: a raisin lands next to his hand
    ("myth", "Most people"),
    ("nope", None),                        # on the chuckle
    ("purpose", "Your body does"),
    ("pores", "Water seeps"),              # inside the fingertip
    ("buckle", "Less blood"),
    ("grape", "Grape"),
    ("proof", "How do we know"),
    ("grip", "So why bother"),
    ("meh", "Some studies"),
    ("pattern", "And the weirdest"),
    ("final", "So next time"),
]

# caption chunks: exact word runs; "/" splits lines
Y, O, C, R, P, G, W, B, V, S = "#FFD447", "#FF9A3C", "#7FE9FF", "#FF5A6E", "#FF86A6", "#4DFFB4", "#FFFFFF", "#8FB8FF", "#C8A8FF", "#BFF0FF"
CHUNKS = [
    "Stay in the bath / long enough", "and your fingers / turn into", "raisins",
    "Most people think / your skin", "just soaks up water", "Like a sponge",
    "Nope",
    "Your body / does it", "on purpose",
    "Water seeps into / your sweat pores", "your nerves / notice", "and they tell / the blood vessels", "in your fingertips / to squeeze",
    "Less blood flow", "less volume", "so the skin / on top buckles", "Grape", "raisin",
    "How do we know", "People with damaged / finger nerves", "don't wrinkle", "Doctors even use it / as a nerve test",
    "So why bother", "One idea / grip", "Wrinkles might work / like tire treads", "pushing water / out of the way",
    "Some studies / say it helps", "another says / meh", "Science",
    "And the / weirdest part", "Scientists found / your wrinkles", "come back in / the exact", "same pattern", "every time",
    "So next time you / turn into a raisin", "that's just / your body", "putting on / snow tires",
]
COLOR = {
    "bath": C, "fingers": Y, "raisins": V, "raisin": V, "soaks": C, "water": C, "sponge": Y, "nope": R,
    "purpose": Y, "seeps": C, "sweat": C, "pores": C, "nerves": O, "notice": O, "blood": R, "vessels": R, "squeeze": R,
    "flow": R, "volume": B, "buckles": Y, "grape": G, "damaged": R, "don't": R, "wrinkle": Y, "nerve": G, "test": G,
    "bother": C, "idea": C, "grip": Y, "tire": O, "treads": O, "way": C, "helps": G, "meh": O, "science": C,
    "weirdest": Y, "exact": Y, "same": Y, "pattern": Y, "every": Y, "time": Y, "snow": S, "tires": S, "body": Y,
}


def norm(w):
    return re.sub(r"[^a-z0-9'%-]", "", w.lower())


def fr(t):
    return round(t * FPS) / FPS


def main():
    work = sys.argv[1]
    meta = json.load(open(f"{work}/words.json"))
    words = meta["words"]
    events = meta["events"]
    audio, sr = sf.read(f"{work}/narration.wav")
    toks = [norm(w["word"]) for w in words]

    def find(phrase, start=0):
        p = [norm(x) for x in phrase.split()]
        for i in range(start, len(toks) - len(p) + 1):
            if toks[i:i + len(p)] == p:
                return i
        raise ValueError(phrase)

    def ev(kind):
        return next(e for e in events if e["type"] == kind)

    duration = fr(words[-1]["end"] + TAIL)
    voice = np.pad(audio, (0, max(0, int(duration * sr) - len(audio))))[: int(duration * sr)]
    sf.write(f"{work}/voice.wav", voice, sr, subtype="FLOAT")

    ws = [w["start"] for w in words]
    we = [w["end"] for w in words]
    starts = []
    for sid, ph in SHOTS:
        if sid == "hook":
            starts.append(0.0)
        elif sid == "raisins":
            starts.append(fr(we[find("into")] + 0.12))
        elif sid == "nope":
            starts.append(fr(ev("chuckles")["t"] - 0.05))
        else:
            starts.append(fr(ws[find(ph)] - LEAD))
    shots = [{"id": sid, "start": starts[i], "end": starts[i + 1] if i + 1 < len(SHOTS) else duration}
             for i, (sid, _) in enumerate(SHOTS)]

    # ---- captions
    caps, wi = [], 0
    for spec in CHUNKS:
        lines = []
        for part in spec.split("/"):
            n = len(part.split())
            first = find(part, wi)
            assert first == wi, (spec, first, wi, toks[wi])
            line = []
            for j in range(first, first + n):
                txt = re.sub(r"[.,;:…?!—\"]+", "", words[j]["word"]).upper()
                line.append({"t": txt, "c": COLOR.get(toks[j], W), "at": round(ws[j] - 0.03, 3)})
            lines.append(line)
            wi = first + n
        caps.append({"start": lines[0][0]["at"], "lines": lines, "last": wi - 1})
    assert wi == len(words), (wi, len(words))
    bounds = [s["start"] for s in shots[1:]] + [duration]
    for i, c in enumerate(caps):
        nxt = caps[i + 1]["start"] if i + 1 < len(caps) else duration
        end = min(nxt, we[c.pop("last")] + 0.55)
        crossing = [b for b in bounds if c["start"] + 0.05 < b < end]
        c["end"] = round(min([end] + crossing), 3)

    W_ = lambda ph, k=0, s=0: ws[find(ph, s) + k]  # noqa: E731
    E_ = lambda ph, k=0, s=0: we[find(ph, s) + k]  # noqa: E731
    i_how = find("Water seeps")
    i_final = find("So next time")
    cues = {
        "stay": W_("Stay"), "enough": W_("enough"), "fingers": W_("fingers"), "into": W_("into"), "into_end": E_("into"),
        "raisins": W_("raisins"), "deadpan": ev("deadpan")["t"],
        "most": W_("Most"), "soaks": W_("soaks"), "water1": W_("water"), "sponge": W_("sponge"),
        "chuckle": ev("chuckles")["t"], "nope": W_("Nope"), "nope_end": E_("Nope"),
        "body": W_("body does"), "purpose": W_("purpose"),
        "water2": W_("Water seeps"), "seeps": W_("seeps"), "sweat": W_("sweat"), "pores": W_("pores"),
        "nerves": W_("nerves notice"), "notice": W_("notice"), "tell": W_("tell"), "vessels": W_("vessels"),
        "fingertips": W_("fingertips"), "squeeze": W_("squeeze"),
        "less": W_("Less blood"), "flow": W_("flow"), "volume": W_("volume"), "skin2": W_("skin on top"),
        "buckles": W_("buckles"), "grape": W_("Grape"), "raisin2": W_("raisin", 0, find("Grape")),
        "know": W_("know"), "damaged": W_("damaged"), "nerves2": W_("nerves", 0, find("damaged")),
        "dont": W_("don't"), "doctors": W_("Doctors"), "test": W_("test"), "excited": ev("excited")["t"],
        "bother": W_("bother"), "idea": W_("idea"), "grip": W_("grip"), "wrinkles": W_("Wrinkles might"),
        "tire": W_("tire"), "treads": W_("treads"), "pushing": W_("pushing"), "way": W_("way"),
        "studies": W_("studies"), "helps": W_("helps"), "another": W_("another"), "meh": W_("meh"),
        "sigh": ev("sighs")["t"], "science": W_("Science"),
        "weirdest": W_("weirdest"), "scientists": W_("Scientists found"), "found": W_("found"),
        "back": W_("back"), "exact": W_("exact"), "same": W_("same"), "pattern": W_("pattern"),
        "every": W_("every"), "time": W_("time", 0, find("every")),
        "next": W_("next", 0, i_final), "raisin3": W_("raisin", 0, i_final), "thats": W_("that's"),
        "body3": W_("body", 0, find("that's")), "snow": W_("snow"), "tires": W_("tires"), "tires_end": E_("tires"),
        "chuckle2": [e for e in events if e["type"] == "chuckles"][-1]["t"],
    }
    cues["dive_back"] = round(cues["tires_end"] + 0.35, 3)
    assert i_how < i_final
    tl = {"fps": FPS, "duration": duration, "shots": shots, "captions": caps, "cues": cues, "words": words,
          "events": events}
    json.dump(tl, open(f"{work}/timeline.json", "w"), indent=1)
    for s in shots:
        print(f'{s["id"]:10s} {s["start"]:6.2f} -> {s["end"]:6.2f}  ({s["end"] - s["start"]:.2f}s)')
    print(f"duration {duration:.2f}s, {len(caps)} caption chunks")


if __name__ == "__main__":
    main()
