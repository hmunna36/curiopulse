# __TITLE__ — Short (NN s)

**Final file:** [`__SLUG__-short.mp4`](__SLUG__-short.mp4)
MP4 · H.264 High · 1080×1920 (9:16) · 30 fps · AAC 48 kHz stereo · NN s · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`__SLUG__.srt`](__SLUG__.srt). Cover: [`cover.jpg`](cover.jpg).

<!-- One line: the world and the hero (the hiker rig, what he's doing), same narrator/caption/bloom look. -->

## Narration (N words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> *[tag]* …

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube Shorts | https://youtube.com/shorts/… | … 11:30 IST |
| Instagram Reels | https://www.instagram.com/reel/… | … 06:30 or 18:30 IST |

**Title:** …

**Description:**
…

**Hashtags:** #Shorts #Science #…
**Tags:** …
**Reels caption:** … (ends with the Follow line)
**Pinned comment (suggestion, for the user to pin):** Tomorrow: … Subscribe so you don't miss it!
**Subscribe line (spoken, ≤ 90 characters):** …
**Cover:** [`cover.jpg`](cover.jpg), the … frame at N s.

## Story and shots

| Time (s) | Shot | Picture |
|---|---|---|
| 0.0–… | Hook | … |

## Sound design

- **Beds:** …
- **Hits:** …
- **Score:** …
- **Mix:** voice first (leveler, gentle compression), effects duck under speech, −14 LUFS, true peak ≤ −1 dBTP
  after AAC. `src/qa.py`: …

## Science notes

Every claim in the script, how sure science is, and where it comes from. Hedged lines are said as hedges.

| Claim | Status | Source |
|---|---|---|
| … | established / leading idea / debated | … |

## Ship review

QA rounds, the scores against the ship bar, and what changed each round (from `.work/qa/ship-review.md`).

## Rebuild

`src/build.sh` rebuilds the MP4 from scratch in about 10 minutes. It needs python3 (numpy, scipy, soundfile,
pyloudnorm, pillow, certifi; pedalboard for the studio mix chain, else the classic chain runs), node with
playwright-core and an installed Chrome, and ffmpeg with libx264/aac. The JavaScript libraries the scenes use are
vendored in `src/web/vendor/` (MIT, licences inside). Recorded one-shots come from the repo's shared CC0 folder
`assets/sfx/` (`git sparse-checkout add assets/sfx`; credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
