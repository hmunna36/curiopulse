# QA: build → check → fix → check again, until it clears the ship bar

## While building (cheap and early)

- **After voice.py:** do the listening pass (narration.md). Fix the words and delivery before any picture exists.
- **After each shot:**
  - render 4–8 stills across it (`render.js … stills "f1,f2,…"`), tile them with `contact_sheet.py`, and Read the
    sheet;
  - check the composition, the safe area (put the mask on the stills: "The safe-area mask" below), caption overlap
    and readability;
  - check for `[pageerror]`;
  - then render the shot's frame range to a short MP4 without audio (`render.js tl.json /tmp/shot.mp4 "A-B"`)
    when the motion matters.
- **After audio.py:** `qc_audio.py`. Masked words get fixed now, not after the render.
- **Subscribe cue:** stills at the last 3 s (0.3 s steps) must show the pill popping, the click, SUBSCRIBED, and the
  captions lifted clear of it. Fix collisions with the hero before the full render.
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
  any `capY` override (split screens), the subscribe cue (`sub_in + 0.3`, `sub_tap + 0.3`) and the cover frame.
- Pass: no word, number, face, key action or the pill touches red or crosses the green line. Backgrounds may.
- Fix in the shot (move or shrink the element, shift the camera target), never by moving the captions or the cue.

## The gate (qa.py, on the delivered MP4)

```sh
cd videos/<slug>/src && $PYTHON qa.py ../.work ../<slug>-short.mp4     # ≈2 min; writes .work/qa/report.md + sheets
```

| Check | Bar |
|---|---|
| Streams | H.264 High 1080×1920 30 fps yuv420p, AAC 48 kHz stereo, moov first |
| Length / size | 35–50 s (warns to 55, fails above 55) · under 95 MB |
| Loudness | −14 ± 0.5 LUFS integrated, true peak ≤ −1.0 dBTP (decoded from the AAC) |
| Picture | the first frame isn't black · it moves in the first 0.5 s · no frozen stretch over 1.5 s |
| Voice | content words: mean speech-band SNR ≥ 12 dB, ≤ 10 % under 6 dB, none under 3 dB (it lists the weak words) |
| Intelligibility | whisper (base.en) transcript of the final mix vs the script: WER ≤ 8 % (it lists the differing words) |
| Captions | every word captioned, ≤ 2 lines of ≤ 4 words, none under 0.25 s on screen (warning) |

A FAIL blocks the upload.
- The weak-word list and the whisper differences are leads for the review, even when the check passes. A punchline
  word under 6 dB is a real problem.
- Calibration: the shipped finger-wrinkles Short scores 13/13, with content SNR 14.1 dB, WER 2.8 %, and 64 s.

## The ship bar (the review; qa.py can't judge these)

Read every contact sheet (`.work/qa/sheet_*.png`) and crop the risky moments at full size. Then score each item
0–10 against the last Shorts, with evidence: frame numbers, times, measurements.

| # | Item | Passes when (8+) |
|---|---|---|
| 1 | **Hook** | frame 1 is action; the question lands in ≤ 3 s; picture and sound hit together; you'd stop scrolling |
| 2 | **Retention** | a new visual question or reveal every 3–5 s; no stretch where only the captions move; escalation to the weirdest fact |
| 3 | **Story** | experience → mechanism → twist/proof → bonus → button; every beat earns its seconds; the button reframes or undercuts |
| 4 | **Show, don't tell** | every major statement has its visual; the camera travels to what's named; nothing is a slide |
| 5 | **Narration** | sounds told, not read (brief: "NOT reading a book"); energy changes per beat; jokes land in the gaps; no mis-said words |
| 6 | **Comedy** | 2–3 laugh beats (reaction, callback, anticlimax); timing comes from the gaps and cuts, not wacky voices |
| 7 | **Look** | cinematic light and depth; the hero on model and acting; bloom/grain clean; nothing cropped by the safe area |
| 7b | **Safe area** | stills checked with the safe-area mask: nothing important under a covered zone (hook words, titles, labels, captions, the face, the key action, the pill); list the `.safe.png` frames in ship-review.md |
| 8 | **Sound** | every beat has its sound; the music drops for punchlines; the voice is always clear (qa.py numbers) |
| 9 | **Science** | every claim sourced in the README; uncertain ones hedged in the words (and on screen when useful) |
| 10 | **Packaging** | title ≤ 60 characters with a curiosity gap; the cover reads at thumbnail size; description, hashtags and IG caption written |
| 11 | **Subscribe hook** | the `sub` line exists (≤ 70 characters), is in voice and funny, names tomorrow's topic and says "subscribe"; qa.py's speech SNR/whisper shows the word "subscribe" clear over the score (no weak-word entry, whisper hears it); the pill + bell + cursor click are on screen for ≥ 2.5 s, timed to the word, inside the key-content zone (mask on `sub_tap + 0.3`), not covering the hero or captions (crop the last 3 s of frames) |

- **Satisfied** means: qa.py has no FAIL, every ship-bar item scores 8 or more, and nothing in the review would make
  the user wince.
- Anything below 8 gets a named cause and a targeted fix. Then re-render (only the affected work: re-voice changed
  blocks only; audio.py if timing or sound changed) and run qa.py and the review again.
- If the same item fails twice after targeted fixes, rethink that beat or shot instead of polishing it.
- Log every round in `.work/qa/ship-review.md`: round N, the scores, the weakest point, what changed. At the end,
  copy the final scores and the list of changes into the README's "Ship review".
- **Hard blockers** (voice quota, disk, a platform outage) mean no upload of a weaker version. Report exactly what
  is done and what is blocking.
