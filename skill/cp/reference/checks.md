# The shared checks (all channels, since 27 Nov 2026)

One script, `vcheck.py`, and four short rule sets. The same file is copied into every channel's skill from
`~/Desktop/nightly routines/fable-demo/direction/checks/` (`sync.sh` there copies it; edit the source, never a copy).
The owner asked for these on 27 Nov 2026 after the read of github.com/zhuyansen/awesome-claude-video-skills.

**Standing until the owner says otherwise: these are advice, not a gate.** A line marked LOOK is a moment to open and
judge. Fix it when it is a real fault and the fix is cheap (timing, a gap, a camera drift, a level); never hold an
upload for a LOOK alone, and never re-buy voice for one. The owner's rules and the channel's direction sheet win
wherever they disagree with this page. Record the numbers (below) so the bars can be set from real runs.

## 1. Run it on the finished file (about a minute for a Short, three for a ten-minute film)

    python3 <skill>/bin/vcheck.py "<final.mp4>" --kind short|long \
        --words <the JSON with the film's word times> --keys "<8-16 key words>" \
        --cutsheet <qa folder>/cuts.png --json <qa folder>/vcheck.json

- `--keys`: the 8 to 16 words the picture must land on: each punchline word, each number, each thing named for the
  first time, the twist. A bare word is found in `--words`; `word#2` is its second time; `12.4:label` is a plain time.
- `--exempt "a-b,c-d"`: planned freezes and the end card, so the stills check leaves them out.
- `--stems "sfx=<effects only>,rest=<voice>+<music>"`: only where the pipeline writes the effects as their own file
  (several files joined with + are added together for the rest).
- Read every cut sheet row by row: a caption word or label left over from the last shot, text fading at the wrong
  size, two texts on top of each other, a face under a caption on the first frames of a shot.
- Paste the summary lines into the run's notes (`NOTES.md`, or the QA report) under "Shared checks", with what was
  fixed and what was left and why. The report's first lines say when the script could not run.

| Line | What it measured | When it says LOOK |
|---|---|---|
| stills | stretches where the picture does not change | a Short: 0.6 s or more; a long video: 2.0 s or more. Cheapest fixes first: a camera drift, a reaction, a counter, a cut. A planned dead stop stays: exempt it |
| rhythm | the hard cuts, the shot lengths | six or more shots and all about the same length (variety under 0.25). Shorten one shot before a turn, hold one after it |
| sound | a hit over 6 dB above the film's own loud level; a sound louder than that level slammed in at a cut after quiet | lower that hit, or give it 30-60 ms of rise |
| words | does something land on each key word: the picture changes in the 0.35 s before it (to 0.07 s after) clearly more than in the second before, or a running move (a camera arriving) comes to rest on it | under 70 % of the key words, or less than 20 points better than a random moment of the same film. "After the word": start the move earlier. "Nothing changes": give the word a picture, or it is not a key word |
| sfx | how many dB each effect adds to the rest of the mix in its first 0.3 s, inside the effect's own band of frequencies | under 3 dB it is buried: raise it, move it into a gap between words, or cut it. It jumps out when it adds over 12 dB and is itself within 6 dB of the film's loud level |

## 2. The picture lands on the word

- The move that shows a key word FINISHES just before the word starts: aim 0.05 s early; from 0.1 s early to on the
  word is fine; after the word is late. A new thing appears at least 0.2 s before it is named.
- The key word's beat must move more than the second before it. If everything is always moving, nothing lands.
- Times come from the measured word stamps, never from counting words (the drift reaches seconds).
- At most four new things on screen for one sentence.

## 3. Movement that reads as hand-made

- **Length from distance.** How long a move takes grows with how far it goes, not one fixed length for everything:
  seconds = (0.15 + 0.019 x sqrt(px travelled in a 1920 px wide frame)) x weight; weight 0.7 for something light, 1
  normal, 1.35 heavy. 100 px takes about 0.34 s, 400 px 0.53 s, 900 px 0.72 s.
- **Reactions follow at uneven gaps.** After the lead moves, the others follow at 0, 0.07, 0.15, 0.25, 0.37, 0.5 s,
  never at an even step.
- **Exits are quicker than entrances** (about two thirds as long) and speed up as they leave.
- **Each kind of move has its own curve** (cubic-bezier): landing 0.1, 0.75, 0.15, 1 · heavy 0.75, 0, 0.18, 1 ·
  whip 0.85, 0, 0.15, 1 · leaving 0.55, 0, 0.9, 0.35 · drifting 0.4, 0, 0.6, 1. Give x and y different curves and
  the path bends.
- Before the render, check: no two things start on the same frame; nothing uses the engine's default ease; one
  signature transition a film, not five.

## 4. Sound that survives a phone speaker

- A story effect must add 4 dB or more to the mix in its 0.3 s. Short percussive ones need 3 to 5 dB more than long
  ones. An effect under continuous speech never measures: move it into a gap between words or cut it.
- Two effects within 0.04 s of each other: keep one.
- A whoosh rises over 0.08 to 0.4 s and keeps less than half its energy under 150 Hz.
- Labels and cards (not one-word captions) stay up for max(1.5 s, words x 0.33 + 0.5 s).

## 5. The second look (after a fix round, before shipping)

A FRESH viewer, one that has not seen the script, the earlier sheets' notes, or the fixes. Hand it only: the new
contact sheets, the cut sheets, and the list of problems the last round found (the problems, not what was done).

    For each problem in this list, look at the sheets and answer in one line: FIXED, PARTLY, or STILL THERE, with the
    time you looked at. Then list at most three NEW problems a viewer would notice, worst first, each with its time.
    End with one line: SHIP, or ONE MORE PASS and the single thing that pass must fix.

- PARTLY and STILL THERE go back into the loop. Three rounds at most; after that the report says what is left.
- The viewer never scores out of ten and never praises: only the list and the last line.

## Where the numbers come from

Ideas and thresholds read (never code copied, nothing installed) from: syydaniel/kazi (the word window and the random
baseline), echris6/motion-video-kit (still stretches, effect loudness, the second look), hughminhphan/motion-kit
(movement), iart-ai/javascript-animation-skills (the startle idea), hassancs91/claude-faceless-shorts-creator (the
4 dB rule), kmilo93sd/agent-video-editor (reading time), feitangyuan/onetake (shot variety; its code is
non-commercial, so only the idea). `vcheck.py` is our own code. First calibration, 27 Nov 2026: Mishapland 23 (new
coke) landed 14 of 16 key words against 50 % at random; Mishapland 24 found 28 cuts, no still stretch; the History
Frontline Nvidia film (10 min) had four still stretches of 2.0 to 2.9 s.
