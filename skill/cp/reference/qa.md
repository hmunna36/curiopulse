# QA: build → check → fix → check again, until it clears the ship bar

## While building (cheap and early)

- **After voice.py and make_timeline.py:** do the listening pass (narration.md), and read what make_timeline.py
  prints: the duration (30–35 s), where the `answer` line starts (5.0 s or earlier), the first words (the test, with
  "you"/"your" in them) and the subscribe line ("nothing said", with the arm publish.json gives: the pill arm or no
  pill), and timeline_lib.py's "subscribe arm" line (the pill's three times in the pill arm). Fix the words, the delivery and
  those before any picture exists; it is free now and a re-render later.
- **The first picture, before any other shot is built:** render frames 0, 15 and 30 of the hook and Read them next to
  `reference/openings.jpg`. Frame 0 must belong in its top row: a tight shot of him already doing the test the first
  line tells the viewer to do (pinching, folding, pointing, touching). If it looks like the bottom row (wide, still, a
  screen), restage the hook now.
- **After each shot:**
  - render 4–8 stills across it (`render.js … stills "f1,f2,…"`), tile them with `contact_sheet.py`, and Read the
    sheet;
  - check the composition, the safe area (put the mask on the stills: "The safe-area mask" below), caption overlap
    and readability;
  - check for `[pageerror]`, and that render.js printed `look: cine (light stage on: …)`;
  - check the light (visual.md, "Check on the stills"): shadows fall away from the lamp named in `setLights`, eyes
    and lettering are clean, nothing is outlined in light, he is the brightest thing;
  - then render the shot's frame range to a short MP4 without audio (`render.js tl.json /tmp/shot.mp4 "A-B"`)
    when the motion matters.
- **After audio.py:** `qc_audio.py`. Masked words get fixed now, not after the render.
- **The subscribe arm (the pill test, 25 Oct–8 Nov 2026; publish.json "subscribe"):** no-pill arm: a still 2 s before
  the end shows no pill and no bell, and the captions sit at y 1330 to the end. Pill arm: the stills of `visual.md`
  (the pill popping in, the click, SUBSCRIBED, gone 0.6 s before the end), with the hero's face, the key action and
  the captions clear of it.
- **The loop:** a still of the last frame next to frame 0: the same picture, or close enough that the restart reads
  as one move.
- **Before the full render**, sweep the whole timeline: stills every 1 s on one or two sheets. Look for:
  - dead stretches;
  - text collisions;
  - a hook that doesn't move on frame 1;
  - a caption crossing a cut.

## The safe-area mask (every Short, before the full render and on the final frames)

`~/.claude/skills/cp/bin/safe-area.py` (plain Python 3, no packages; it decodes through `~/.cache/cp/bin/ffmpeg`)
tints red what the YouTube app covers or the phone crops and outlines the key-content zone in green (x 100–980 for
y 400–1000, x 100–870 for y 1000–1640; visual.md, "The Shorts safe area"). It works on stills of any size.

```sh
cd videos/<slug>/src
node render.js ../.work/timeline.json ../.work/qa/safe-src "<hook frames>,<title/label frames>,<caption frames>,<sub frames>"
python3 ~/.claude/skills/cp/bin/safe-area.py overlay ../.work/qa/safe-src/f_*.png --out ../.work/qa/safe
$PYTHON contact_sheet.py ../.work/qa/safe ../.work/qa/safe-sheet.png 4 360        # then Read it (and single stills)
python3 ~/.claude/skills/cp/bin/safe-area.py check 221 1354 859 1486               # a box in frame px → INSIDE/OUTSIDE
```

- Frames to check (frame = seconds × 30): the hook (0.1, 1, 2 s), every title card, sting and on-screen label, one 2-line caption per shot,
  any `capY` override (split screens), the last 3 s, and the cover frame.
- Pass: no word, number, face or key action touches red or crosses the green line. Backgrounds may.
- Fix in the shot (move or shrink the element, shift the camera target), never by moving the captions.

## The gate (qa.py, on the delivered MP4)

```sh
cd videos/<slug>/src && $PYTHON qa.py ../.work ../<slug>-short.mp4     # ≈2 min; writes .work/qa/report.md + sheets
```

| Check | Bar |
|---|---|
| Streams | H.264 High 1080×1920 30 fps yuv420p, AAC 48 kHz stereo, moov first |
| Length / size | the band of the Short's length arm (`"length"` in publish.json, from `yt.mjs next-slot`; "short" for every Short since 16 Oct 2026): SHORT passes at 30–35 s and fails above 37 s; anything else warns (the old STANDARD arm: 43–50 s) · under 95 MB |
| Opening | "you"/"your" in the first eight words: the test (warning only; 15 Oct 2026) · the `answer` block starts by 5.0 s (warns to 6.0 s; fails later, or when there is no `answer` block). The 9 Oct "first cut at 7 s" check is gone (15 Oct 2026) |
| Subscribe | nobody says "subscribe" (fails when the word is spoken anywhere) · the pill as publish.json "subscribe" says (the pill test, 25 Oct–8 Nov 2026): "pill" needs `sub_in` / `sub_tap` / `sub_out` at 2.4 / 1.7 / 0.85 s before the end (± 0.1 s; fails otherwise); "none" or no arm fails when the timeline has any of them |
| Loudness | −14 ± 0.5 LUFS integrated, true peak ≤ −1.0 dBTP (decoded from the AAC) |
| Picture | the first frame isn't black · it moves in the first 0.5 s · no frozen stretch over 1.5 s |
| Look | the MP4 was rendered in the look the timeline asks for (render.js writes `.work/look.txt`); a warning when cine was asked for and it fell back to classic: ship it and say so |
| Voice | content words: mean speech-band SNR ≥ 12 dB, ≤ 10 % under 6 dB, none under 3 dB (it lists the weak words) |
| Intelligibility | whisper (base.en) transcript of the final mix vs the script: WER ≤ 8 % (it lists the differing words) |
| Captions | every word captioned, ≤ 2 lines of ≤ 4 words, none under 0.25 s on screen (warning) |

A FAIL blocks the upload.
- The transcript check maps one word's two spellings to one (`SPELL` in qa.py: chili/chilli, color/colour …): whisper
  writes the American one whatever the script says. Add a pair there when a correctly spoken word costs WER; never
  re-voice for a spelling.
- The weak-word list and the whisper differences are leads for the review, even when the check passes. A punchline
  word under 6 dB is a real problem.
- Calibration: the shipped finger-wrinkles Short scored 13/13 on the checks of its day, with content SNR 14.1 dB, WER
  2.8 %, and 64 s. Run on ears-pop (4 Oct 2026, the old shape), today's gate fails exactly the three new checks: no
  `answer` block, "subscribe" at 94 % of the runtime, a 70-character line. Its "Your ear just burped." starts at 4.37 s.
  (That was the gate of 5 Oct. From 9 to 15 Oct the subscribe checks were: not spoken, and the pill in the last seconds;
  from 16 Oct: not spoken, and no pill; in the pill test from 25 Oct: not spoken, and the pill as the arm says.)
- A length WARN is not a pass: bring the Short into its band with `gap`, `tighten` and `tempo` (free), or cut a
  sentence, before shipping. Ship on a length warning only when the fix would hurt the comedy, and say so.

## The ship bar (the review; qa.py can't judge these)

Read every contact sheet (`.work/qa/sheet_*.png`) and crop the risky moments at full size. Then score each item
0–10 against the last Shorts, with evidence: frame numbers, times, measurements.

| # | Item | Passes when (8+) |
|---|---|---|
| 1 | **The test, the hook and the answer** | the topic is a test the viewer can do on themselves on the spot, phone in hand, safely; the first line tells them to do it (or says they are doing it), with "you"/"your"; frame 0 is a tight shot (his head about 350 px tall or more, or his hand that big) of him already doing that test, and it would sit in the top row of `reference/openings.jpg`; the strange thing lands in ≤ 3 s, while they try it; picture and sound hit together; the answer line starts by 5 s and is a plain, surprising claim or metaphor that leaves a "wait, how?"; you would try it yourself |
| 2 | **Retention** | nothing between the hook and the answer; no shot of his frozen face, stare or held reaction before second 12; no title or name card in the first 15 s; the first look inside the body grows out of the scene (no cut to a separate diagram); every mechanism line points back to the viewer's test, in everyday words, no science word spoken in the first 15 s; no spoken naming beat, no bridge-only line; a new visual question or reveal every 3–5 s; no stretch where only the captions move; escalation to the weirdest fact |
| 3 | **Story** | test → answer → mechanism → payoff → the weirdest fact → button; every beat earns its seconds; the button reframes or undercuts and runs into the hook when the Short loops, and the last shot returns to the picture of frame 1; no ask, tease, outro or pill at the end |
| 4 | **Show, don't tell** | every major statement has its visual; the camera travels to what's named; nothing is a slide |
| 5 | **Narration** | sounds told, not read (brief: "NOT reading a book"); energy changes per beat; jokes land in the gaps; no mis-said words |
| 6 | **Comedy** | 2 laugh beats (the answer line and the button); timing comes from the gaps and cuts, not wacky voices |
| 7 | **Look** | cinematic light and depth: every shot has its place's light (`setLights`), shadows fall away from that lamp, the hero is the brightest thing, other characters are `actor`s, faces are `paint` (no shadow ring round an eye, nothing outlined in light); the hero on model and acting; bloom/grain clean; nothing cropped by the safe area |
| 7b | **Safe area** | stills checked with the safe-area mask: nothing important under a covered zone (hook words, titles, labels, captions, the face, the key action); list the `.safe.png` frames in ship-review.md |
| 8 | **Sound** | every beat has its sound; the music drops for punchlines; the voice is always clear (qa.py numbers) |
| 9 | **Science** | every claim sourced in the README; uncertain ones hedged in the words (and on screen when useful) |
| 10 | **Packaging** | title ≤ 60 characters with a curiosity gap; the cover reads at thumbnail size; description, hashtags and IG caption written, and the caption and the description end their story part with a one-word question about the test ("Left or right?") |
| 11 | **The loop** | nobody says "subscribe", and nothing spoken asks, teases or winds up; the pill only in the pill arm, short, gone 0.6 s before the end, never over the face or the key action (qa.py checks the cues); the last frame matches frame 0 closely enough that the restart reads as one move; the button line and then the hook, read aloud, run on as one thought |

- **Satisfied** means: qa.py has no FAIL, every ship-bar item scores 8 or more, and nothing in the review would make
  the user wince.
- Anything below 8 gets a named cause and a targeted fix. Then re-render (only the affected work: re-voice changed
  blocks only; audio.py if timing or sound changed) and run qa.py and the review again.
- If the same item fails twice after targeted fixes, rethink that beat or shot instead of polishing it.
- Log every round in `.work/qa/ship-review.md`: round N, the scores, the weakest point, what changed. At the end,
  copy the final scores and the list of changes into the README's "Ship review".
- **Hard blockers** (voice quota, disk, a platform outage) mean no upload of a weaker version. Report exactly what
  is done and what is blocking.

`qa.py` (since 2 Oct 2026) also writes `qa/safe_sheet.png` (hook, every shot, the end, with the safe-area mask) and
names the time and channel of the true peak. Read safe_sheet.png every run.
