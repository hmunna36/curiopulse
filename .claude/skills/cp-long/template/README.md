# __TITLE__ — long-form (N:NN)

**Final file:** `__SLUG__.mp4` (not kept in git: it is on YouTube, and `src/build.sh` rebuilds it from this folder)
MP4 · H.264 High · 1920×1080 (16:9) · 30 fps · AAC 48 kHz stereo · N:NN · −14 LUFS integrated, ≤ −1 dBTP.
Captions for YouTube: [`__SLUG__.srt`](__SLUG__.srt). Thumbnail: [`cover.jpg`](cover.jpg) (1280×720).

<!-- One line: the worlds and the hero (the hiker rig, what he's doing), same narrator/caption/bloom look as the Shorts. -->

## Narration (N words, performed)

Directed in [`src/script.txt`](src/script.txt), one take per block. The joke timing sits in the gaps between blocks.

> *[tag]* …

## Publishing

| Platform | Link | Release |
|---|---|---|
| YouTube | https://youtu.be/… | Sunday … 17:30 IST |

**Title:** …

**Description:**
…

**Chapters:** 0:00 … · 0:NN … · N:NN …
**Hashtags:** #Science #… (never #Shorts)
**Tags:** …
**Pinned comment (suggestion, for the user to pin):** Next week: … Subscribe so you don't miss it!
**Subscribe line (spoken, ≤ 110 characters):** …
**Thumbnail:** [`cover.jpg`](cover.jpg): …
**Still to do by hand in YouTube Studio:** end screen (last 10 s: subscribe + best-for-viewer video), a card to a related Short.

## Story and shots

| Time | Act | Shot | Picture |
|---|---|---|---|
| 0:00–… | Hook | … | … |

## Sound design

- **Beds:** …
- **Hits:** …
- **Score:** … (one theme per act; it changes when the story turns)
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

`src/build.sh` rebuilds the MP4 from scratch. It needs python3 (numpy, scipy, soundfile, pyloudnorm, pillow, certifi;
pedalboard for the studio mix chain, else the classic chain runs), node with playwright-core and a Chrome or Chromium
(`CHROME_PATH`), and ffmpeg with libx264/aac. `.claude/skills/cp-long/bin/cloud-setup.sh` installs all of it on a
fresh Ubuntu machine. The JavaScript libraries the scenes use are vendored in `src/web/vendor/` (MIT, licences
inside). Recorded one-shots come from the repo's shared CC0 folder `assets/sfx/` (credits in `assets/sfx/CREDITS.md`).
The narration takes are committed in `src/voice/`, so no API call is needed unless a line of `src/script.txt`
changes. For a changed line, run `src/build.sh --synth` with `ELEVENLABS_API_KEY` set.
