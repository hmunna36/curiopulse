"""Build the shared edit timeline (shots, captions, SFX cues) from words.json.

Usage: python3 make_timeline.py <work_dir>
Reads <work_dir>/words.json, writes <work_dir>/timeline.json and timeline.js
(the latter is loaded by scene.html). Every cut lands on a frame boundary a
couple of frames before the phrase it illustrates, so picture leads sound.
"""
import json
import sys

FPS = 30
DURATION = 10.0
LEAD = 0.07  # picture cuts this much before the next phrase starts

# (scene id, index of the first word it illustrates); None = starts at 0
SHOTS = [
    ("hook", None),
    ("amps", 4),      # Thirty thousand amps
    ("heat", 7),      # hotter than the Sun's surface
    ("flash", 12),    # But most of it skims over his skin
    ("heart", 20),    # not through him
    ("fern", 23),     # leaving fern-shaped marks
    ("survive", 26),  # Nine in ten survive
    ("final", None),  # visual button after the last word
]

# caption chunks: list of lines, each line a list of (word index, display text, colour)
Y, O, C, R, P, G, W = "#FFD447", "#FF9A3C", "#7FE9FF", "#FF5A6E", "#FF86A6", "#4DFFB4", "#FFFFFF"
CHUNKS = [
    [[(0, "LIGHTNING", Y)], [(1, "JUST", W), (2, "HIT", W), (3, "HIM!", W)]],
    [[(7, "HOTTER", O), (8, "THAN", W)], [(9, "THE", W), (10, "SUN'S", O), (11, "SURFACE", O)]],
    [[(12, "BUT", W), (13, "MOST", Y), (14, "OF", W), (15, "IT", W)]],
    [[(16, "SKIMS", W), (17, "OVER", C)], [(18, "HIS", W), (19, "SKIN", C)]],
    [[(20, "NOT", R), (21, "THROUGH", W), (22, "HIM", W)]],
    [[(23, "LEAVING", W)], [(24, "FERN-SHAPED", P), (25, "MARKS", W)]],
    [[(26, "9", Y), (27, "IN", W), (28, "10", Y)], [(29, "SURVIVE", G)]],
]


def fr(t):
    return round(t * FPS) / FPS


def main():
    work = sys.argv[1]
    words = json.load(open(f"{work}/words.json"))["words"]
    ws = [w["start"] for w in words]
    we = [w["end"] for w in words]

    starts = []
    for sid, wi in SHOTS:
        if sid == "hook":
            starts.append(0.0)
        elif sid == "final":
            starts.append(fr(we[-1] + 0.13))
        else:
            starts.append(fr(ws[wi] - LEAD))
    shots = []
    for i, (sid, _) in enumerate(SHOTS):
        end = starts[i + 1] if i + 1 < len(SHOTS) else DURATION
        shots.append({"id": sid, "start": starts[i], "end": end})

    shot_bounds = [s["start"] for s in shots[1:]] + [DURATION]
    captions = []
    for ci, lines in enumerate(CHUNKS):
        first = lines[0][0][0]
        start = ws[first] - 0.03
        if ci + 1 < len(CHUNKS):
            nxt = ws[CHUNKS[ci + 1][0][0][0]] - 0.03
        else:
            nxt = DURATION
        # a chunk never survives past the cut that ends its shot
        end = min(nxt, min(b for b in shot_bounds if b > start + 0.05))
        captions.append({
            "start": round(start, 3), "end": round(end, 3),
            "lines": [[{"t": txt, "c": col, "at": round(ws[wi] - 0.03, 3)} for wi, txt, col in line]
                      for line in lines],
        })

    S = {s["id"]: s["start"] for s in shots}
    w = lambda i: ws[i]
    cues = {
        "strike": fr(we[0]), "restrike": [fr(we[0]) + 0.2, fr(we[0]) + 0.37],
        "whip1": S["amps"], "count_start": S["amps"] + 0.03, "slam": w(6),
        "punch": S["heat"], "sun_rise": w(7) + 0.03, "bolt_rise": w(8), "stamp": w(11) + 0.08,
        "whip2": S["flash"], "scan": S["flash"] + 0.03, "label_flash": w(16) + 0.08,
        "zoom_heart": S["heart"], "beats": [w(20) + 0.06, w(22) + 0.02],
        "whip3": S["fern"], "fern_grow": w(23), "label_fern": w(25) - 0.1,
        "pullback": S["survive"], "icons": w(26), "survive": w(29),
        "look_up": S["final"] + 0.05, "final_strike": 9.83,
    }
    tl = {"fps": FPS, "duration": DURATION, "shots": shots, "captions": captions,
          "cues": cues, "words": words}
    json.dump(tl, open(f"{work}/timeline.json", "w"), indent=1)
    open(f"{work}/timeline.js", "w").write("window.TL = " + json.dumps(tl) + ";\n")
    for s in shots:
        print(f'{s["id"]:8s} {s["start"]:6.3f} -> {s["end"]:6.3f}  ({round((s["end"]-s["start"])*FPS)} frames)')
    for c in captions:
        print(f'  cap {c["start"]:5.2f}-{c["end"]:5.2f}  ' + " / ".join(" ".join(x["t"] for x in l) for l in c["lines"]))
    print(json.dumps(cues))


if __name__ == "__main__":
    main()
