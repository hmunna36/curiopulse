"""English captions (SRT) for YouTube from the timeline: one cue per caption chunk, in the spoken words'
own casing and punctuation (the burned-in captions are uppercase display text).

Usage: python3 make_srt.py <timeline.json> <out.srt>
"""
import json
import sys

tl = json.load(open(sys.argv[1]))
words = tl["words"]


def stamp(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


cues, wi = [], 0
for i, c in enumerate(tl["captions"]):
    nxt = tl["captions"][i + 1]["start"] if i + 1 < len(tl["captions"]) else tl["duration"]
    group = []
    while wi < len(words) and words[wi]["start"] - 0.03 < nxt - 1e-6:
        group.append(words[wi]["word"])
        wi += 1
    if group:
        cues.append((c["start"], max(c["end"], c["start"] + 0.4), " ".join(group)))
with open(sys.argv[2], "w") as f:
    for k, (a, b, txt) in enumerate(cues, 1):
        f.write(f"{k}\n{stamp(max(0, a))} --> {stamp(b)}\n{txt}\n\n")
print(f"{sys.argv[2]}: {len(cues)} cues, {wi} of {len(words)} words")
