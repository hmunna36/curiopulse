---
name: cp-long
description: Produce one complete CurioPulse LONG-FORM YouTube video, made to the standard of an award-winning animated short film, for a "what happens if you…" science question that already draws millions of viewers, 4:00–5:00 long and never over 5:15, engaging in every scene, 1920×1080, built entirely in code like the channel's Shorts (procedural canvas scenes with the recurring hiker, Jessica's performed ElevenLabs v3 narration, a synthesized score, word-pop captions). It is QA'd and rebuilt in a loop until it clears the ship bar, uploaded through the YouTube Data API and scheduled for the next free weekly slot (Sunday 17:30 IST), and its source is pushed to github.com/hmunna36/curiopulse. Made to run unattended in a Claude cloud routine (a fresh Linux machine every run). Use for `/cp-long next` (the weekly routine; takes the next topic from topics.md) or `/cp-long <topic>`.
argument-hint: <topic question> | next
effort: max
---

# /cp-long: a CurioPulse long-form video, from question to scheduled release

The user (4 Oct 2026): "let's start 1 routine in cloud to create a long form video for curio pulse channel, 1 video
per week" and "every video should be like oscar winning short film". On 7 Oct 2026, after the first film was shown
588 times and watched by six people: "yes, let's lift the limit. the longer film should be highly engaging in every
scene. the user should be addicted." So: **one video a week, 16:9, 4:00–5:00 (never over 5:15), on a question that
already draws millions, every scene earning the next, held to the standard of an award-winning animated short**,
made by a cloud routine with nobody watching.

    preflight → the question (demand check) → research + story (the scene table) → narration → timeline → picture → sound → render
    → QA → not satisfied? fix the weak parts → QA again → … until satisfied
    → upload + schedule on YouTube (next free Sunday 17:30 IST) → push the source to GitHub → report

It is a short film that happens to answer a science question: the Shorts' world, hero, narrator, caption and bloom
look, sound and humour, in the service of a real story about the hiker (what he wants, what stands in the way, how
he ends up changed) with a final image that leaves a feeling. `reference/long-form.md` is the standard: "Which
questions get made", "The every-scene rule" and "The film bar". Read all three before the plan and again before
every QA round. An accurate explainer with a character standing next to it does not ship, and neither does a film
with a scene the viewer could skip. Work autonomously from start to finish: no questions, no drafts, no alternatives; if
something is weak, fix it yourself. Never ask: nobody is there to answer.

## Where you are (read `reference/cloud.md` before the first command)

- A fresh Ubuntu machine with a full clone of this repo. Nothing from earlier runs exists except what was pushed.
  There is no `~/.claude`, no memory, no Chrome profile, no Mac. The repo is the only memory: `topics.md`,
  `reference/videos.md` and the video folders.
- Everything is relative to the repo root (`git rev-parse --show-toplevel`). This skill is `.claude/skills/cp-long/`
  (below: `$K`). Long-form videos live in `long/<slug>/`.
- The craft rules are the Shorts skill's, kept current in this repo at `skill/cp/reference/` (a backup of the Mac's
  `/cp` skill, refreshed every night). Read them when you reach their phase: `brief.md`, `story.md`, `narration.md`,
  `visual.md`, `engine.md`, `sound.md`, `qa.md`, and the worked examples in `skill/cp/reference/examples/`.
  **`reference/long-form.md` in this skill overrides them wherever a long-form video differs** (length, structure,
  landscape staging, captions, thumbnail, packaging, ship bar). Translate as you read:

  | The Shorts docs say | Here |
  |---|---|
  | `~/.claude/skills/cp/bin/…`, `~/.cache/cp`, `cp-env.sh` | `$K/bin/…`, `. $K/bin/env.sh` (sets PATH, NODE_PATH, PYTHON, CHROME_PATH, RENDER_JOBS) |
  | `~/Desktop/curiopulse/videos/<slug>`, `<slug>-short.mp4` | `long/<slug>`, `<slug>.mp4` |
  | `new-short.sh`, `publish-short.sh` | `$K/bin/new-long.sh`, `$K/bin/push.sh` |
  | `node render.js … out.mp4 --audio` (full render) | `node render_par.js … out.mp4 --audio …` (several browsers side by side) |
  | run-lock, cleanup.sh, disk checks, the render gate (`wait-renders.sh`), `SendUserFile`, memory notes | none of that exists here: skip |
  | Instagram, Business Suite, Reels, the Shorts safe area, `#Shorts` | not for long-form: skip |
  | 1080×1920, 45–50 s or 30–35 s, 95–110 or 66–76 words, the length test, `next-slot`, `numbers` | 1920×1080, 4:00–5:00 (≤ 5:15), 480–600 words; no length test here |
  | the `answer` block by 5 s, the mid-video `sub` aside, the watermark, "the first picture" | here: the promise by 0:08 and the first payoff by 0:30; the `sub` block is the LAST block (this skill's engine keeps the pill up once it appears); no watermark in this engine; the first picture is the one the thumbnail promised, close and in action |

## Hooks (binding since 9 Oct 2026)

The film's first 15 seconds follow `reference/hooks.md`: the five hook rules and one of its 21 formulas, named in the
README's plan and scored in the ship bar's Hook item. Read it in the story step, before the script. Three candidate
hooks in three formulas, keep the strongest; the first sentence confirms the title.

## Deliverables

In `long/<slug>/` (slug = the topic's key words, lowercase with dashes):

| File | Spec |
|---|---|
| `<slug>.mp4` | 1920×1080, 30 fps, H.264 High CRF 17 yuv420p bt709, AAC 256 k 48 kHz, **4:00–5:00, never over 5:15**, −14 LUFS, ≤ −1 dBTP. Uploaded to YouTube; NOT committed (see `reference/cloud.md`) |
| `cover.jpg` | 1280×720 JPEG < 2 MB: the thumbnail (`make_cover.js`) |
| `<slug>.srt` | English captions from the word timings |
| `README.md` | the demand check, the scene table, script, publishing table + metadata, shot table, sound design, science notes with sources, ship review (with the 15-second audit), rebuild |
| `publish.json` | title, description with chapters, tags, `pinnedComment` suggestion, schedule; yt.mjs writes back the id and link |
| `src/` | everything that rebuilds it (`build.sh`), including the cached voice takes |

Plus: the video scheduled on YouTube with its thumbnail and captions, a row in `long/README.md`, the topic marked in
`topics.md`, a note in `reference/videos.md`, all pushed.

## Non-negotiables (the Shorts' `brief.md` holds, plus these)

- **The film bar** (`reference/long-form.md`): a protagonist with a want, an emotional arc, at least three wordless
  beats, composed and lit shots, one motif, a theme that resolves on a planned final image. Ship-bar item 0.
- **A question with proven demand** (`reference/long-form.md`, "Which questions get made"): `yt.mjs demand` shows a
  median of a million views or more on the videos that answer it, it has a body at stake and a clock in it, and the
  title uses the words people type. No demand, no film.
- **Every scene holds** (`reference/long-form.md`, "The every-scene rule"; the user, 7 Oct 2026): the scene table
  before the script, the clock on screen, a promise at least every 30 s, a new picture event every 3–5 s, the last
  minute the strongest. Ship-bar item 13.
- **4:00–5:00, never over 5:15.** qa.py fails anything over 315 s. If the cut runs long, cut the scene with the
  lowest stakes; never speed the narrator up to fit.
- **Code-built only.** Procedural canvas animation plus synthesized sound. Never AI video, stock footage or generated
  images. The narration is the only recorded element.
- **Human, performed narration:** Jessica (`cgSgspJ2msm6clMCkdW9`), `eleven_v3`, stability 0, v3 tags, comedy in the
  gaps. Paid ElevenLabs account only (voice.py and quota.mjs skip free plans).
- **Hook on frame 1**, second person, an experience the viewer has had; by 0:08 the viewer knows the question and
  what they will get for staying.
- **Show, don't tell.** Every statement has its picture; the camera travels to what is named; never static for more
  than 3 s; never slides.
- **A story in three acts on a clock** with a hook at every jump, 8–12 laugh beats that come from character, the
  weirdest true fact and the highest stakes in the last minute, a button that calls back to the hook, then the final
  image.
- **Scientifically responsible:** every claim sourced in the README; uncertain ones hedged in the words.
- **Subscribe hook, audible and visual:** the last block `sub` teases NEXT WEEK's question and says "subscribe"; the
  pill + bell + click play over it.
- **Ship only above the bar:** `qa.py` without a FAIL and every ship-bar item at 8 or more. A hard blocker means no
  weaker upload: report it.
- **Keys:** they arrive as environment variables. Never print, echo, log or commit them; never `env`/`printenv`/`set`
  without a filter; never write them into a file inside the repo.

## Workflow

### 0. Preflight (always first)

```sh
cd "$(git rev-parse --show-toplevel)" && K=.claude/skills/cp-long
$K/bin/preflight.sh          # installs the toolchain (2–5 min on a fresh machine), then checks everything
. $K/bin/env.sh
```

- `PREFLIGHT: GO` → continue.
- `PREFLIGHT: BLOCKED` (exit 2: a key is not set, a host is blocked, the voice quota is short, the token is not
  CurioPulse's) → nothing to build. Report exactly which lines failed and what the user must do (`reference/cloud.md`,
  "What only the user can do"), and stop. Do not mark a topic.
- `PREFLIGHT: TOOLCHAIN BROKEN` (exit 1) → read `~/.cache/cpl/setup.log`, try to fix it (another package source, a
  missing library), fix `bin/cloud-setup.sh` so the next run does not hit it, and push that fix. If it cannot be fixed,
  report and stop.
- Note the render test's speed (ms per frame): it tells you how long the full render will take.

### 1. The topic

- `/cp-long <topic>`: that topic.
- `/cp-long next`: in `$K/topics.md`, resume the first `[~]` line (its folder `long/<slug>/` is in the repo if an
  earlier run pushed a checkpoint), else take the first `[ ]` line and mark it
  `- [~] <Question> — <slug> — started <date>`.
- **The demand check** (`reference/long-form.md`, "Which questions get made"): if the line carries no demand figure,
  run `node $K/bin/yt.mjs demand "<question>"` first. Under the bar: rephrase once, else move the line under "Not
  made" with the numbers and take the next one. Keep the output: the titles shape yours, and the thumbnail addresses
  are the shelf for the thumbnail test. At most four demand calls in a run.
- Fewer than 3 qualified `[ ]` lines left: find new questions the same way (`reference/long-form.md`, "Topics") and
  append the ones that qualify.
- Skim `reference/videos.md` (what has been made, what was learned) and the root README (the Shorts already on the
  channel; a long-form video may deepen a Short's topic but must not repeat its script).

### 2. Create (A)

1. **Research + story** (`skill/cp/reference/story.md`, then `reference/long-form.md`): the film first (the want, the
   obstacle, the turn, the feeling at the end, the final image, the motif); sources and the claims table; the clock
   (its unit, its jumps, the last number) and the three acts on it; **the scene table** (one row per scene: waiting
   for, turn, leaves open, stakes; every row complete before a word of script); the jokes; the worlds; next week's
   teaser (the next qualified `[ ]` line of `topics.md`); the title and three thumbnail ideas, decided NOW, before
   the script (the first 5 seconds must show what the thumbnail promised).
2. **Scaffold:** `$K/bin/new-long.sh <slug> "<Title>"`. Put the demand check, the one-page plan, the scene table and
   the claims table in its README.
3. **Narration** (`skill/cp/reference/narration.md`): write `src/script.txt` (480–600 words, 26–36 blocks, written
   scene by scene from the table);
   `cd long/<slug>/src && $PYTHON voice.py ../.work --synth`; listen through the transcript check and the word
   timings; retake or rewrite blocks until the performance is right. Timing edits (gap, tempo, tighten) are free.
   Check the length now: `make_timeline.py` prints the duration. Over 5:00 → cut the scene with the lowest stakes.
   **Checkpoint:** once the takes are final, `$K/bin/push.sh <slug> <msg-file>` ("WIP: <topic> narration"). The takes
   cost characters; a crashed run must not lose them.
4. **Timeline:** `src/make_timeline.py`: SHOTS (anchored to phrases), CHUNKS, COLOR, DISPLAY, a cue for every beat.
5. **Picture** (`skill/cp/reference/visual.md`, `engine.md`, and the landscape rules in `reference/long-form.md`),
   shot by shot: world files and `SC.<shot>` in `src/web/`, listed in `scene.html`; stills → contact sheet → Read it →
   fix. The hook first, then in order. Borrow world files from the Shorts (`videos/<slug>/src/web/*.js`) and re-stage
   them for the wide frame.
6. **Sound** (`skill/cp/reference/sound.md`): beds, a hit on every beat, ONE theme that is stated, developed through
   the acts and resolved on the final image, silence on the biggest moment, the comedy stops, then `master()`. `qc_audio.py`; fix masked words now.
7. **Thumbnail:** three candidates (`SC.cover` with a variant switch), each rendered with
   `node make_cover.js ../.work/timeline.json ../cover.jpg`; the shelf test against six real thumbnails at 320×180
   picks one (`reference/long-form.md`, "Thumbnail"). Read the winner at full size too.
8. **Pre-render sweep:** stills every 2 s across the whole timeline, on sheets; fix everything visible. Do the skim
   test here for the first time: eight alike frames in a row are a dead stretch.
9. **Render** in the background (`reference/cloud.md`, "Long commands"):
   `nohup sh -c 'node render_par.js ../.work/timeline.json ../<slug>.mp4 --audio ../.work/mix.wav > ../.work/render.log 2>&1; echo "EXIT $?" >> ../.work/render.log' &`
   then `make_srt.py`. Write the README and publish.json while it runs.

### 3. The quality loop (B): repeat until satisfied

10. `$PYTHON qa.py ../.work ../<slug>.mp4` must have no FAIL (it also lists every shot over 8 s). Read every contact
    sheet; crop the risky moments at full size; do the skim test, the 15-second audit and the leave test
    (`reference/long-form.md`, "The every-scene rule"); score the ship bar with evidence; log the round in
    `.work/qa/ship-review.md`.
11. Anything under 8: name the cause, make a targeted fix (re-voice only changed blocks, re-time with gaps, restage a
    shot, remix), re-render, QA again. A failed render piece can be re-rendered alone (`reference/cloud.md`). If the
    same item fails twice, rethink the beat.
12. Satisfied: qa.py clean, every item 8+. Copy the final scores and the changes into the README's "Ship review".

### 4. Ship (C)

13. **Package:** `publish.json` (title ≤ 60 characters, description with chapters starting `0:00`, about 15 tags, no
    `#Shorts`), the README's metadata, a row in `long/README.md`.
    `node $K/bin/yt.mjs upload long/<slug>/publish.json --dry-run`.
14. **YouTube:** `node $K/bin/yt.mjs upload long/<slug>/publish.json --schedule=auto` (private, scheduled for the next
    free Sunday 17:30 IST; thumbnail and captions set). Confirm with `node $K/bin/yt.mjs status <id>`. If the
    thumbnail is refused, say so in the report (the user sets it in Studio).
15. **Record:** the link and release time in the video README and `long/README.md`; in `$K/topics.md` move the line
    under Done as `[x]` with the link and date; add the video and any lesson to `$K/reference/videos.md`; fold any
    better way of working into this skill's files.
16. **Push:** write the commit message to a file ("Add the <topic> long-form video (N:NN)" + one line + your
    attribution trailer) and run `$K/bin/push.sh <slug> <msg-file>`. It pushes to `main`; if `main` is refused it
    pushes `claude/cp-long-<slug>` and says so.
17. **Report** (the last message of the run; keep it short): title, length, loudness, the YouTube link and release
    time, the story in one line, QA rounds and what changed, ElevenLabs characters left (`node $K/bin/quota.mjs`),
    the demand figures of the question, where the source was pushed, and what is left for the user: the end screen
    and a card in YouTube Studio, the pinned comment (text in publish.json), linking the film from the Short on the
    same subject ("Related video" in Studio) and a post announcing it, and anything that failed.

## When blocked

Nobody is watching: never ask. Push what exists (`push.sh`, a "WIP" message), leave the topic `[~]`, and report
exactly what is done and what blocks. The next run resumes it from the pushed folder: cached takes in `src/voice/`,
the script, timeline, scenes, `publish.json` (`youtube.id` once uploaded, so nothing is uploaded twice).

## Files

- `reference/long-form.md`: the format: which questions get made, the every-scene rule, the film bar, length, three
  acts on a clock, landscape staging, captions, thumbnail, packaging, topics, the ship bar
- `reference/cloud.md`: the cloud machine: toolchain, keys, network, long commands, git, what only the user can do
- `reference/videos.md`: every long-form video so far, its link, and what it taught
- `topics.md`: the queue
- `template/`: the folder every video starts from (the landscape engine + skeletons + README + publish.json)
- `fonts/`: Montserrat 700/800/900 and Anton (SIL OFL 1.1)
- `bin/preflight.sh`, `bin/cloud-setup.sh`, `bin/env.sh`, `bin/new-long.sh`, `bin/push.sh`
- `bin/yt.mjs`: YouTube Data API (whoami · upcoming · next-free · upload · reschedule · status · demand "<question>")
- `bin/quota.mjs`: ElevenLabs characters left (exit 2 = not enough)
