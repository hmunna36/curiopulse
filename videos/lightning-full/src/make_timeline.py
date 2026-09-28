"""Pace the narration and build the shared edit timeline for the full Short.

Usage: python3 make_timeline.py <work_dir>
Reads  <work_dir>/narration.wav + words.json (from tts.py)
Writes <work_dir>/voice.wav      narration with dramatic beats inserted (silence only,
                                 no time-stretching) at chosen word boundaries
       <work_dir>/timeline.json  shots, caption chunks, sfx/animation cues
"""
import json
import re
import sys

import numpy as np
import soundfile as sf

FPS = 30
LEAD = 0.07          # cuts land this much before the phrase they illustrate
TAIL = 2.35          # visual button after the last word

# silence inserted AFTER the word that ends this phrase (seconds)
BEATS = {"what happens": 0.25, "they connect": 0.5, "it stops": 0.65, "ten survive": 0.2}

# (shot id, phrase whose first word opens the shot)
SHOTS = [
    ("tease", None), ("rewind", "but that's not"),
    ("approach", "As the storm"), ("leader", "charge zigzags"), ("streamer", "His body throws"),
    ("connect", "and they connect"), ("stat", "Thirty thousand"),
    ("flashover", "But most of"), ("wetskin", "It flashes over"), ("shoes", "turning rain"),
    ("fern", "and leaving"),
    ("nerves", "The current that does"), ("neuron", "They run on"), ("limp", "His legs can"),
    ("brain", "and the brain's"),
    ("heart", "His heart runs"), ("restart", "Here's the twist"),
    ("cpr", "so fast CPR"), ("touch", "And victims carry"),
    ("survive", "That's why about"), ("ranger", "One park ranger"), ("final", None),
]

# caption chunks: exact word runs; "/" splits lines; {a|b} replaces the spoken words a..b
Y, O, C, R, P, G, W, B, GO = "#FFD447", "#FF9A3C", "#7FE9FF", "#FF5A6E", "#FF86A6", "#4DFFB4", "#FFFFFF", "#8FB8FF", "#FFC857"
CHUNKS = [
    "Getting struck", "by lightning", "sounds instantly / fatal",
    "but that's not / always what happens",
    "As the storm / rolls in", "charge zigzags / down from the cloud",
    "His body throws / a spark up", "to meet it", "and they / connect",
    "Thirty thousand amps", "hotter than / the Sun's surface",
    "But most of / that current", "never gets / inside",
    "It flashes over / his wet skin", "turning rain / to steam", "so fast it can / blow off his shoes",
    "and leaving / fern-shaped marks", "behind",
    "The current that / does get in", "races along / his nerves",
    "They run on tiny / electrical signals", "and this surge / drowns them out",
    "His legs can / go limp", "for hours", "and the brain's / breathing center", "can shut down",
    "His heart runs / on electricity too", "Lightning hits it / like a giant", "defibrillator",
    "and for a moment", "it stops",
    "Here's the twist", "the heart often / restarts on its own",
    "Breathing / may not", "so fast CPR / saves lives",
    "And victims carry / no charge", "They're safe / to touch",
    "That's why about", "nine in ten / survive",
    "One park ranger / was struck", "seven times", "and survived / every single one",
]
DISPLAY = {"thirty thousand amps": ["30,000", "AMPS"], "nine in ten": ["9", "IN", "10"], "seven times": ["7", "TIMES"]}
COLOR = {
    "lightning": Y, "fatal": R, "not": R, "storm": B, "charge": C, "spark": C, "connect": Y,
    "30,000": Y, "amps": Y, "hotter": O, "sun's": O, "surface": O, "most": Y, "inside": C,
    "skin": C, "steam": W, "shoes": R, "fern-shaped": P, "nerves": GO, "electrical": C, "signals": C,
    "surge": R, "limp": B, "hours": B, "breathing": C, "center": C, "shut": R, "heart": R,
    "electricity": C, "defibrillator": Y, "stops": R, "twist": Y, "restarts": G, "own": G,
    "cpr": G, "lives": G, "no": G, "safe": G, "touch": G, "9": Y, "10": Y, "survive": G,
    "7": Y, "times": Y, "survived": G, "every": G, "single": G, "one": G,
}


def norm(w):
    return re.sub(r"[^a-z0-9'-]", "", w.lower())


def fr(t):
    return round(t * FPS) / FPS


def main():
    work = sys.argv[1]
    meta = json.load(open(f"{work}/words.json"))
    words = meta["words"]
    for w in words:  # phoneme edges run ~40 ms late against the waveform (measured)
        w["start"], w["end"] = max(0.0, w["start"] - 0.04), max(0.0, w["end"] - 0.04)
    audio, sr = sf.read(f"{work}/narration.wav")
    toks = [norm(w["word"]) for w in words]

    def find(phrase, start=0):
        p = [norm(x) for x in phrase.split()]
        for i in range(start, len(toks) - len(p) + 1):
            if toks[i:i + len(p)] == p:
                return i
        raise ValueError(phrase)

    # ---- insert beats (cut in the silence between two words)
    inserts = sorted((find(ph) + len(ph.split()) - 1, s) for ph, s in BEATS.items())
    pieces, cursor, shift, shifts = [], 0, 0.0, []
    for wi, sec in inserts:
        cut = (words[wi]["end"] + words[wi + 1]["start"]) / 2 if wi + 1 < len(words) else words[wi]["end"]
        c = int(cut * sr)
        pieces += [audio[cursor:c], np.zeros(int(sec * sr))]
        cursor = c
        shifts.append((cut, sec))
    pieces.append(audio[cursor:])
    voice = np.concatenate(pieces)

    def moved(t):
        return t + sum(s for c, s in shifts if t >= c)

    for w in words:
        w["start"], w["end"] = round(moved(w["start"]), 3), round(moved(w["end"]), 3)
    duration = fr(words[-1]["end"] + TAIL)
    voice = np.pad(voice, (0, max(0, int(duration * sr) - len(voice))))[: int(duration * sr)]
    sf.write(f"{work}/voice.wav", voice, sr)

    ws = [w["start"] for w in words]
    we = [w["end"] for w in words]
    starts = []
    for sid, ph in SHOTS:
        if sid == "tease":
            starts.append(0.0)
        elif sid == "final":
            starts.append(fr(we[-1] + 0.15))
        else:
            starts.append(fr(ws[find(ph)] - LEAD))
    shots = [{"id": sid, "start": starts[i], "end": starts[i + 1] if i + 1 < len(SHOTS) else duration}
             for i, (sid, _) in enumerate(SHOTS)]

    # ---- captions
    caps, wi = [], 0
    for ci, spec in enumerate(CHUNKS):
        lines = []
        for part in spec.split("/"):
            n = len(part.split())
            first = find(part, wi)
            assert first == wi, (spec, first, wi)
            key = " ".join(toks[first:first + n])
            disp = DISPLAY.get(key)
            line = []
            if disp:
                idx = [first + round(k * (n - 1) / max(1, len(disp) - 1)) for k in range(len(disp))]
                for d, j in zip(disp, idx):
                    line.append({"t": d, "c": COLOR.get(norm(d), W), "at": round(ws[j] - 0.03, 3)})
            else:
                for j in range(first, first + n):
                    txt = re.sub(r"[.,;:…]+", "", words[j]["word"]).upper()
                    line.append({"t": txt, "c": COLOR.get(toks[j], W), "at": round(ws[j] - 0.03, 3)})
            lines.append(line)
            wi = first + n
        caps.append({"start": lines[0][0]["at"], "lines": lines, "last": wi - 1})
    assert wi == len(words), (wi, len(words))
    bounds = [s["start"] for s in shots[1:]] + [duration]
    for i, c in enumerate(caps):
        nxt = caps[i + 1]["start"] if i + 1 < len(caps) else duration
        end = min(nxt, we[c.pop("last")] + 0.6)
        crossing = [b for b in bounds if c["start"] + 0.05 < b < end]
        c["end"] = round(min([end] + crossing), 3)
    # the final shot is picture only
    caps = [c for c in caps if c["start"] < starts[-1]]

    W_ = lambda ph, k=0: ws[find(ph) + k]  # noqa: E731
    E_ = lambda ph, k=0: we[find(ph) + k]  # noqa: E731
    S = {s["id"]: s["start"] for s in shots}
    cues = {
        "tease_strike": fr(W_("struck")), "freeze": fr(W_("sounds")), "flatline1": W_("fatal") + 0.2,
        "rewind": S["rewind"], "rewind_end": fr(E_("what happens", 1) - 0.1),
        "leader": W_("charge"), "streamer": W_("spark"), "connect": fr(E_("they connect", 1) + 0.03),
        "count": W_("Thirty"), "count_end": W_("amps"), "hotter": W_("hotter"),
        "scan": S["flashover"] + 0.03, "inside": W_("inside"),
        "steam": W_("steam"), "shoe": W_("blow") + 0.05, "fern": W_("leaving") + 0.1,
        "races": W_("races"), "tiny": W_("tiny"), "surge": W_("surge"), "limp": W_("limp"), "hours": W_("hours"),
        "brainstem": W_("breathing"), "shutdown": W_("shut"),
        "beat_ok": S["heart"], "defib": W_("hits", 0), "stop": W_("stops"),
        "restart": W_("restarts"), "breath_fail": W_("Breathing may"), "cpr": W_("CPR"),
        "no_charge": W_("no charge"), "touch": W_("touch"),
        "icons": W_("nine"), "survive": W_("survive"),
        "ranger_strikes": [round(W_("was struck", 1) - 0.2 + k * (W_("survived") - W_("was struck", 1)) / 7.0, 3) for k in range(7)],
        "stamp": W_("survived"), "final_strike": round(duration - 0.55, 3),
    }
    tl = {"fps": FPS, "duration": duration, "shots": shots, "captions": caps, "cues": cues, "words": words}
    json.dump(tl, open(f"{work}/timeline.json", "w"), indent=1)
    for s in shots:
        print(f'{s["id"]:10s} {s["start"]:6.2f} -> {s["end"]:6.2f}  ({s["end"] - s["start"]:.2f}s)')
    print(f"duration {duration:.2f}s, {len(caps)} caption chunks")


if __name__ == "__main__":
    main()
