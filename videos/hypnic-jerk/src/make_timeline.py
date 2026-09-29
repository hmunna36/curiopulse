"""Build the shared edit timeline for the hypnic-jerk Short.

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
TAIL = 1.85          # after "Probably.": hold, the last jolt, black

# (shot id, phrase whose first word opens the shot); None = special
SHOTS = [
    ("hook", None),                      # drifting off → the jolt (on the gasp) → JUMPS lands
    ("stare", None),                     # the silent beat after JUMPS, bolt upright: "Wow. Thanks, body."
    ("title", "That's a hypnic"),
    ("common", "And up to"),
    ("dive", "So what's going"),
    ("handover", "Well falling asleep"),
    ("relax", "Brain waves"),
    ("glitch", "But the handover"),
    ("burst", "Scientists think"),
    ("bam", "and BAM"),
    ("dream", "And the falling feeling"),
    ("panic", "One idea"),
    ("reality", "for a fall"),
    ("trees", "Some scientists"),
    ("triggers", "Stress caffeine"),
    ("hiccups", "Oh fun fact"),
    ("night", None),                     # starts on the yawn
]

# caption chunks: exact word runs; "/" splits lines; DISPLAY swaps spoken words for figures
Y, O, C, R, P, G, W, B, V = "#FFD447", "#FF9A3C", "#7FE9FF", "#FF5A6E", "#FF86A6", "#4DFFB4", "#FFFFFF", "#8FB8FF", "#C8A8FF"
CHUNKS = [
    "You're drifting / off to sleep", "and your / whole body", "JUMPS",
    "Wow", "Thanks body",
    "That's a / hypnic jerk", "And up to / seventy percent", "of people / get them",
    "So what's / going on", "Well falling asleep / is actually", "a handover",
    "Your stay awake / system", "passes control", "to your sleep / system",
    "Brain waves / slow down", "muscles / go loose",
    "But the handover / can glitch",
    "Scientists think / a burst of signals", "fires from / your brainstem", "down / your spine",
    "and BAM", "Your muscles fire / all at once",
    "And the falling / feeling", "One idea", "your brain feels / you go limp", "and panics",
    "Wait are we / FALLING", "So it slams / the panic button", "for a fall that / isn't even happening",
    "Some scientists / even think", "it's an old reflex", "from our / tree-sleeping ancestors",
    "Unproven", "but cool",
    "Stress", "caffeine", "and short sleep", "make them / more likely", "But they're / harmless",
    "Oh fun fact", "It's the same / kind of twitch", "as", "hiccups",
    "Anyway", "goodnight", "Probably",
]
DISPLAY = {"seventy percent": ["70%"]}
COLOR = {
    "sleep": B, "jumps": R, "body": Y, "wow": W, "hypnic": Y, "jerk": Y, "70%": Y, "going": C, "on": C,
    "handover": C, "awake": O, "control": Y, "waves": B, "slow": B, "muscles": B, "loose": B,
    "glitch": R, "burst": Y, "signals": Y, "brainstem": O, "spine": O, "bam": R, "once": R,
    "falling": V, "feeling": V, "idea": C, "limp": B, "panics": R, "panic": R, "button": R,
    "fall": V, "isn't": G, "reflex": G, "tree-sleeping": G, "ancestors": G, "unproven": R, "cool": C,
    "stress": R, "caffeine": O, "short": B, "likely": Y, "harmless": G,
    "fun": Y, "fact": Y, "twitch": C, "hiccups": P, "goodnight": B, "probably": V,
}
# the second "sleep" (the sleep system) and the first "sleep" (drifting off) share a colour


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
        elif sid == "stare":
            starts.append(fr(we[find("JUMPS")] + 0.06))
        elif sid == "night":
            starts.append(fr(ev("yawns")["t"] - 0.25))
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
            key = " ".join(toks[first:first + n])
            disp = DISPLAY.get(key)
            line = []
            if disp:
                idx = [first + round(k * (n - 1) / max(1, len(disp) - 1)) for k in range(len(disp))]
                for d, j in zip(disp, idx):
                    line.append({"t": d, "c": COLOR.get(norm(d), W), "at": round(ws[j] - 0.03, 3)})
            else:
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
    S = {s["id"]: s["start"] for s in shots}
    i_fall = find("And the falling feeling")
    i_trees = find("Some scientists")
    cues = {
        "gasp": ev("gasps")["t"], "whole": W_("whole"), "jumps": W_("JUMPS"), "jumps_end": E_("JUMPS"),
        "wow": W_("Wow"), "thanks": W_("Thanks"), "hypnic": W_("hypnic"), "seventy": W_("seventy"),
        "people": W_("people"), "goingon": W_("going on"), "handover": W_("handover"), "stay": W_("stay"),
        "passes": W_("passes"), "control": W_("control"), "sleepsys": W_("sleep system"),
        "waves": W_("Brain waves"), "slow": W_("slow"), "muscles": W_("muscles go"), "loose": W_("loose"),
        "glitch": W_("glitch"), "excited": ev("excited")["t"], "scientists": W_("Scientists think"),
        "burst": W_("burst"), "brainstem": W_("brainstem"), "spine": W_("spine"), "bam": W_("BAM"),
        "fire": W_("fire all"), "once": W_("once"),
        "feeling": W_("feeling"), "idea": W_("idea"), "limp": W_("limp"), "panics": W_("panics"),
        "wait": W_("Wait"), "fallingq": W_("FALLING", 0, i_fall + 2), "slams": W_("slams"), "button": W_("button"),
        "fall2": W_("fall that"), "happening": W_("happening"),
        "reflex": W_("reflex"), "tree": W_("tree-sleeping"), "ancestors": W_("ancestors"),
        "chuckle": ev("chuckles")["t"], "unproven": W_("Unproven"), "cool": W_("cool"),
        "stress": W_("Stress"), "caffeine": W_("caffeine"), "short": W_("short sleep"), "likely": W_("likely"),
        "harmless": W_("harmless"), "oh": W_("Oh"), "fact": W_("fact"), "twitch": W_("twitch"),
        "as": W_("as", 0, find("twitch")), "hiccups": W_("hiccups"),
        "yawn": ev("yawns")["t"], "anyway": W_("Anyway"), "goodnight": W_("goodnight"),
        "probably": W_("Probably"), "probably_end": E_("Probably"),
        "final_jolt": round(E_("Probably") + 0.95, 3), "black": round(E_("Probably") + 1.2, 3),
    }
    # shared schedules (picture + sound read the same times)
    st0 = S["stare"]
    hb, tb, per = [], st0, 0.42
    while tb < cues["thanks"] + 0.9:
        hb.append(round(tb, 3))
        tb += per
        per += 0.03
    cues["heartbeats"] = hb
    n_j = round(23 * 0.7)
    cend = [s["end"] for s in shots if s["id"] == "common"][0]
    cues["window_jolts"] = [round(cues["seventy"] - 0.1 + (k / n_j) * (cend - cues["seventy"] - 0.3), 3) for k in range(n_j)]
    assert i_trees > i_fall
    tl = {"fps": FPS, "duration": duration, "shots": shots, "captions": caps, "cues": cues, "words": words,
          "events": events}
    json.dump(tl, open(f"{work}/timeline.json", "w"), indent=1)
    for s in shots:
        print(f'{s["id"]:10s} {s["start"]:6.2f} -> {s["end"]:6.2f}  ({s["end"] - s["start"]:.2f}s)')
    print(f"duration {duration:.2f}s, {len(caps)} caption chunks")


if __name__ == "__main__":
    main()
