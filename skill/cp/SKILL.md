---
name: cp
description: Produce a complete CurioPulse YouTube Short / Instagram Reel for a "why does…" science question: a 45–50 s 1080×1920 cinematic animated explainer (30–35 s when it takes a 23:30 slot, the short arm of the length test) built entirely in code (procedural canvas scenes with the recurring hiker character, Jessica's performed ElevenLabs v3 narration with comedic timing, a synthesized score and sound design, word-pop captions), made just like the channel's lightning, hypnic-jerk and finger-wrinkles Shorts. It is QA'd and rebuilt in a loop until it clears the ship bar, pushed to github.com/hmunna36/curiopulse, then scheduled in the next free slots: YouTube at 11:30 AM or 11:30 PM IST (Data API) and Instagram at 06:30 or 18:30 IST, never before the YouTube release (Meta Business Suite in the user's Chrome; the API takes over if a token ever exists). Use when the user runs /cp <topic> or asks for a new CurioPulse Short; `/cp next` takes the next topic from topics.md.
argument-hint: <topic question> | next | next youtube-only
effort: max
---

# /cp <topic> — a CurioPulse Short, from question to scheduled release

The user gives a topic (`/cp why do onions make you cry`). Every run follows the user's loop (2026-09-29):

    create the Short → QA → not satisfied? fix the weak parts → QA again → … until satisfied
    → push to GitHub → upload + schedule: YouTube in the next free slot (11:30 or 23:30 IST, two a day), Instagram in its own next free slot (06:30 or 18:30 IST, two a day)

It must come out "just like the other 3 videos": same world, same hero, same narrator, same caption and bloom look,
same synthesized sound, same humour. Work autonomously from start to finish: no questions, no drafts, no
alternatives; if something is weak, fix it yourself. The upload and schedule are part of the job. The only question
allowed: no topic was given in a live session. `/cp next` takes one from `topics.md`.

## Deliverables

In `~/Desktop/curiopulse/videos/<slug>/` (slug = the topic's key words, lowercase with dashes, e.g. `brain-freeze`):

| File | Spec |
|---|---|
| `<slug>-short.mp4` | 1080×1920, 30 fps, H.264 High CRF 17 yuv420p bt709, AAC 256 k 48 kHz, 45–50 s (standard arm) or 30–35 s (short arm; `yt.mjs next-slot` says which), −14 LUFS, ≤ −1 dBTP, < 95 MB |
| `cover.jpg` | 1080×1920 JPEG < 2 MB: the YouTube thumbnail and the Instagram cover |
| `<slug>.srt` | English captions from the word timings |
| `README.md` | script, publishing table + metadata, shot table, sound design, science notes with sources, ship review, rebuild |
| `publish.json` | title, description, tags, IG caption (with the follow line), `pinnedComment` suggestion, the `length` arm, schedule; the tools write back ids and links |
| `src/` | everything that rebuilds it (`build.sh`), including the cached voice takes |

Plus: committed and pushed to the repo, a row in the root README, **YouTube scheduled for the next free slot: 11:30 AM or 11:30 PM IST (two slots a day; user, 2 Oct 2026)** (thumbnail +
captions) and the **Instagram Reel scheduled for its next free slot: 06:30 or 18:30 IST (two slots a day, 12 hours
apart; user, 4 Oct 2026)**, never before the Short's YouTube release (Business Suite).

## Non-negotiables (details in `reference/brief.md`; the brief itself is `reference/master-context-prompt.md`)

- **Code-built only.** Procedural canvas animation plus synthesized sound. Never Higgsfield or other AI video, stock
  footage or generated images; the user was explicit. The narration is the only recorded element.
- **Human, performed narration:** Jessica (`cgSgspJ2msm6clMCkdW9`), `eleven_v3`, stability 0, v3 tags, comedy in the
  gaps. It must never sound like "someone READING A BOOK".
- **Hook on frame 1:** action, a strange experience in the second person; no intro, logo or "Did you know". The first
  words are "You…" plus something physical you are doing, and the strange thing lands by 3 s. **The first picture is
  a tight shot of him already eating, drinking, cutting or touching the thing** (7 Oct 2026: those openings kept
  64 % of viewers, wide or still ones 46–50 %; `reference/story.md` §2, `reference/openings.jpg`).
- **The answer by second 5** (5 Oct 2026, from the channel's retention curves; `reference/story.md`,
  `reference/analytics.md`): the line after the hook, the `answer` block, gives the answer as a plain, surprising
  claim or a metaphor ("Relax. Your ear just burped.") and STARTS by 5.0 s. The rest of the Short proves it. Never
  spend a spoken beat on the scientific name ("Doctors call it…", "It's called…") or on a bridge ("Here's the thing.",
  "So what's going on?") before it; a name worth having is an on-screen label.
- **Show, don't tell:** every statement has its visual; the camera travels to what's named; never static for more
  than 1–3 s; never slides.
- **Short and tight: 45–50 s, never over 55 s** (user, 1 Oct 2026; reference/brief.md), about 95–110 spoken words.
  **In the length test (user, 5 Oct 2026) the Short that takes a 23:30 YouTube slot is 30–35 s, about 66–76 words**;
  `yt.mjs next-slot` says which arm a run is building (`reference/analytics.md`). Cut, don't rush: one mechanism, one
  payoff, the weirdest fact, the button.
- **Funny and curious:** 2–3 laugh beats (2 in a 30–35 s Short); the story escalates to the weirdest true fact; the
  button line reframes or undercuts.
- **Subscribe cue: the picture only, over the last seconds, on every Short** (subscriber conversion is the channel's
  bottleneck: user's decision, 30 Sep 2026). **Since 9 Oct 2026 nobody says "subscribe"** (user: "just keep the visual
  cue and say nothing"): in all ten Shorts that spoke the word, as the last line or as a mid-video aside, a quarter to
  a half of the viewers still watching left within three seconds of it (`reference/analytics.md`):
  - the animated Subscribe pill + bell + cursor click (`web/subscribe.js`) plays silently over the last 3.4 s, on top
    of the button line, and has gone 0.6 s before the loop; make_timeline.py sets its cues from the duration;
  - the script has no `sub` block and nothing that asks, teases or winds up: no "subscribe", no "Next up", no outro.
    qa.py fails a spoken "subscribe";
  - the Short ends on the button line and loops back to frame 1. The next topic is teased in text only (the "Next up"
    comment, description, Reel caption).
  Details: `reference/brief.md`, `narration.md`, `visual.md`, `qa.md`.
- **Watermarked:** the engine puts the channel name on every frame of every Short (user, 6 Oct 2026; `reference/visual.md`). Never remove it; check it is there on the QA sheets.
- **The hiker** is the hero: the same rig, only the outfit changes.
- **Scientifically responsible:** claims are sourced; uncertain ones are hedged ("Scientists think…", "One idea…").
- **Ship only above the bar** (`reference/qa.md`): `qa.py` clean and every ship-bar item scoring 8 or more.

## Workflow

Read each reference file when you reach its phase. They are short; don't skip them.

### A. Create

1. **Preflight** (`reference/pipeline.md`):
   - Take the lock: `~/.claude/skills/cp/bin/run-lock.sh acquire <slug>`.
     - Exit 3 means another /cp run is working on this repo: say which and stop.
     - A /va run at the same time is normal; the pipelines run in parallel.
     - Run `run-lock.sh release` whenever the run ends, stops or fails.
   - Disk: `df -h /System/Volumes/Data` needs ≥ 5 GB free. `bin/cleanup.sh` frees whatever an earlier run left on
     this Mac.
   - Voice: `node ~/.claude/skills/cp/bin/quota.mjs` (exit 2 = less than ≈1,000 characters left).
   - Calendar: `node ~/.claude/skills/cp/bin/yt.mjs upcoming` and `node ~/.claude/skills/cp/bin/ig.mjs upcoming`.
   - **Numbers** (`reference/analytics.md`): `node ~/.claude/skills/cp/bin/yt.mjs numbers` logs the channel's numbers
     and rewrites `numbers.md` in this skill. Read the length-test table and the newest rows. If Analytics fails, the
     report says so: carry on, and put the reason in the final report (it needs the user).
   - **Length arm:** `node ~/.claude/skills/cp/bin/yt.mjs next-slot` prints the YouTube slot this Short will take and
     the length it must be built to: SHORT (30–35 s, 66–76 words) for a 23:30 slot, STANDARD (45–50 s, 95–110 words)
     for an 11:30 slot. The word budget, `publish.json`'s `length` and qa.py's length band all follow it.
   - **Catch up Instagram:** an earlier Short whose Reel is still pending (its publish.json has no
     `instagram.scheduledVia`, no `"skip": true`, and its slot is still ahead) gets scheduled first, if Chrome is
     connected. A missed night never leaves a Reel behind. (If the slot slips past while you work, `ig.mjs prepare`
     moves the Reel to the next free slot and says so in the sheet's `note`: write that time into publish.json.) Its
     folder lives on GitHub only: bring it back with
     `git -C ~/Desktop/curiopulse sparse-checkout add videos/<slug>` before `ig.mjs prepare`. The cleanup at the end
     of the run removes it again.
   - Instagram route: `node ~/.claude/skills/cp/bin/ig.mjs route`.
     - `business-suite` is the normal case: the user's Facebook account is blocked, so no API token can exist.
       This route needs Claude in Chrome connected at ship time.
     - `api` means a token exists.
   - Skim `reference/videos.md` for what's been done and learned.
2. **Research + story** (`reference/story.md`):
   - sources and a claims table;
   - the curiosity angle, the hook sentence ("You…" + a physical action), the answer line (started by 5 s, spoken
     over the opening shot as it runs on: no cut before 7 s), the beats (hook, answer, mechanism, payoff, the
     weirdest fact, button and loop), the jokes;
   - the world(s), and what to borrow from past videos;
   - for the text teasers (the "Next up" comment, description, Reel caption) the next `[ ]` entry of `topics.md` (the
     one after this Short's);
   - the cover moment.
3. **Scaffold:** `~/.claude/skills/cp/bin/new-short.sh <slug> "<Title>"` creates
   `~/Desktop/curiopulse/videos/<slug>` from `template/`. Put the plan and the claims table into its README
   first. The script writes the length arm into its `publish.json` (`"length"`, from `yt.mjs next-slot`) and prints
   it: check it is the arm the preflight gave. If it says it could not, put the object there by hand.
4. **Narration** (`reference/narration.md`):
   - write `src/script.txt` (the block id `answer` is required; there is no `sub` block; count the words against the arm's budget);
   - run `$PYTHON voice.py ../.work --synth`;
   - do the listening pass plus whisper;
   - retake or rewrite blocks until the performance is right. Timing edits (gap, tempo, tighten) are free.
5. **Timeline:** in `src/make_timeline.py`, write SHOTS (anchored to phrases), CHUNKS, COLOR, DISPLAY and a cue for
   every beat. Worked example: `reference/examples/make_timeline.finger-wrinkles.py`.
6. **Picture** (`reference/visual.md`, `reference/engine.md`), shot by shot:
   - write the world files and `SC.<shot>` in `src/web/`, and list them in `scene.html`;
   - the light (visual.md, "The light"; the cinematic look since 8 Oct 2026): `setLights({...})` with the place of
     every shot, `actor(...)` round every character that is not the hiker, `paint(...)` round faces and labels, every
     lamp in the glow layer;
   - render stills, tile a contact sheet, Read it, fix;
   - the hook first, then in order;
   - then the cover frame (`cover.jpg`).
7. **Sound** (`reference/sound.md`): `src/audio.py` gets beds, hits on every beat, the score by section, the comedy
   stops, then `master()`. Run `qc_audio.py` and fix the masked words now.
8. **Pre-render sweep** (`reference/qa.md`): stills every 1 s across the whole timeline. Fix everything visible now.
   Put the safe-area mask on the hook, title/label, caption and subscribe stills (`bin/safe-area.py overlay`, qa.md):
   nothing important under a covered zone.
9. **Render** in the background with a log and an EXIT marker (≈8 min), then `make_srt.py`. Wait for the marker
   inside the turn; never end the turn to wait for it (see "If interrupted": max effort ends with the turn).

### B. The quality loop (repeat until satisfied)

10. **QA the MP4:**
    - `$PYTHON qa.py ../.work ../<slug>-short.mp4` must have no FAIL;
    - read every contact sheet and crop the risky moments;
    - score the ship bar (12 items, incl. the safe area (7b) and the subscribe cue), with evidence;
    - log the round in `.work/qa/ship-review.md`.
11. **Not satisfied? Fix the weak parts:**
    - name the cause of each item under 8;
    - make a targeted fix: re-voice only the changed blocks, re-time with gaps (free), restage or relight a shot,
      re-cut the hook, remix;
    - re-render and go back to 10.
    - If the same item fails twice, rethink the beat instead of polishing it.
    - A hard blocker (quota, disk) means no weaker upload: report it.
12. **Satisfied:**
    - `qa.py` clean and every item 8+;
    - copy the final scores and the list of changes into the README's "Ship review";
    - prove the folder rebuilds: `src/build.sh` from the cached takes must reproduce the MP4 (compare with
      ffprobe duration and qa.py numbers). Skip this only if time is short; say so.

### C. Ship (`reference/publish.md`)

13. **Package:**
    - fill in `publish.json`: title, description, tags, IG caption, `coverTime`;
    - write the README's metadata;
    - add the row to the root `README.md` table (YouTube date filled in after step 15);
    - run `node ~/.claude/skills/cp/bin/yt.mjs upload videos/<slug>/publish.json --dry-run`.
14. **GitHub:** write a commit message file ("Add the <topic> Short (NN s)" + a one-line summary + your attribution
    trailer), then run `~/.claude/skills/cp/bin/publish-short.sh <slug> <msg-file>`.
15. **YouTube:** `node ~/.claude/skills/cp/bin/yt.mjs upload videos/<slug>/publish.json --schedule=auto`. It takes the
    next free YouTube slot (11:30 or 23:30 IST), sets the thumbnail and the captions, and writes the Reel's slot (the
    next free one at 06:30 or 18:30 IST that is not before the YouTube release) into `instagram.publishAt`. Confirm with
    `yt.mjs status <id>`, then check the Short's own thumbnail in Studio and upload cover.jpg there if the slot shows
    anything else (`reference/publish.md`, step 2).
16. **Instagram**, in the slot from `instagram.publishAt`: 06:30 or 18:30 IST (`reference/publish.md`). Every Short
    gets a Reel, from both daily routines (user, 4 Oct 2026), unless publish.json says `"skip": true`:
    - **Route A (Business Suite, the normal case):**
      1. `node ~/.claude/skills/cp/bin/ig.mjs prepare videos/<slug>/publish.json --out <scratchpad>/ig-<slug>`
         builds the Reel-spec copy and splits it into parts of ≤ 9 MB.
      2. In Claude in Chrome: open Business Suite, upload the parts into a collector input, reassemble, and check
         the SHA-256.
      3. Create Reel → Add video (with the click hook) → caption → Schedule, on the sheet's `date` at the sheet's
         `time` (06:30 or 18:30; never assume 18:30).
      4. Verify it in Content → Scheduled, then record the slot with the sheet's `afterScheduling` command
         (`ig.mjs busy <date>T<HH:MM>`).
      - If Chrome isn't connected, or Business Suite wants a password, don't guess. Report "Instagram still to
        schedule" and leave the prepared sheet, so the user or the next run can finish it.
    - **Route B (API):** `node ~/.claude/skills/cp/bin/ig.mjs queue videos/<slug>/publish.json`; the launchd job
      publishes it. Check `ig.mjs job-status` and `ig.mjs whoami`.
17. **Record:**
    - put the YouTube link, both release times and the queue status into the README and the root table;
    - commit and push again with publish-short.sh. Nothing may stay uncommitted, or the cleanup refuses.
18. **Deliver** (keep it short):
    - `SendUserFile` the MP4 and `cover.jpg` (`display: "render"`);
    - a message with the title, length and length arm, loudness, the YouTube link and release time, the Instagram
      release time, the story in one line, when the answer starts and when the first cut comes (seconds), the QA rounds
      and what changed, the ElevenLabs characters left, and anything pending.
19. **Remember:** add the Short to `reference/videos.md` (and a lesson if there was one), a memory note, and a line
    in `MEMORY.md`. In `/cp next`, mark the topic `[x]` too. Then back up the skill, which carries videos.md,
    topics.md and the numbers log (`numbers.md`, `numbers.jsonl`): `bin/backup-skill.sh <msg-file>`.
20. **Clean up** (the user's standing rule since 30 Sep 2026: everything lives in git, and only light things stay on
    the Mac). After the files are sent, run `~/.claude/skills/cp/bin/cleanup.sh`.
    - It changes nothing unless everything is committed and on GitHub: no uncommitted or untracked files, no unpushed
      commits, no stashes, no key files.
    - Then it deletes `.work/`, the fetched fonts and the other ignored scratch, checks out only `skill/` and the
      top-level files (the Short's folder goes; it's on GitHub), and re-clones `.git` light when it holds pushed
      media. The Instagram copies live outside the repo, in the scratchpad and `~/.cache/cp/ig-spool`, so it
      doesn't touch them.
    - Report its before → after line. If it refuses, fix the cause (usually an unpushed change: run
      publish-short.sh again) and rerun it. Never delete files by hand.
    - Then `run-lock.sh release`.

## `/cp next` (queue mode; the daily routine)

The scheduled task `curiopulse-daily-short` runs `/cp next` every night at 00:00 IST (created 2026-09-29 at the
user's request).
- It runs **in parallel with the va skill's midnight routine**, on purpose. The user runs both pipelines side by
  side, and they share no files: different repos, work folders and locks.
- Each build is somewhat slower while both run. That's fine; don't start a third heavy job.
- To change what gets made, edit `topics.md`, not the routine.

1. Take the first `[~]` line of `~/.claude/skills/cp/topics.md` and resume it, or else the first `[ ]` line. Mark it
   in progress: `- [~] Why do onions make you cry? — onion-tears — started 2026-10-01`. If the queue is empty, report
   that and stop.
2. Gates before building anything; if one fails, report the fix and stop, and a new topic goes back to `[ ]`:
   - `run-lock.sh acquire`;
   - for a new topic, `bin/cleanup.sh` first. It frees what an earlier run left, and does nothing when the checkout
     is already light. If it refuses because of unsaved work that isn't the `[~]` topic's, report the files and stop;
     never delete them;
   - disk ≥ 8 GB free;
   - `quota.mjs` exits 0;
   - `yt.mjs whoami` says CurioPulse;
   - `yt.mjs numbers`, then `yt.mjs next-slot` (the length arm; never build without knowing it);
   - Instagram: `ig.mjs route` says `business-suite` and Claude in Chrome is connected (or it says `api` and `ig.mjs whoami` works). If neither holds, build and schedule YouTube anyway, and report Instagram as pending.
3. Run A → B → C exactly as for `/cp <topic>`, including the cleanup (step 20).
4. Close out: in step 19, mark the line `[x]` with its links and release day and move it under Done (the skill backup
   carries it). The lock is released after the cleanup.
5. Nobody is watching a scheduled run: never ask. When blocked, leave the line `[~]`, release the lock, and report
   exactly what's done and what's blocking. The next run resumes it.

## Also on request

- **Move a release:**
  - YouTube: `yt.mjs reschedule <id> 2026-10-05T23:30:00+05:30`.
  - Instagram: in Business Suite, Content → Scheduled → ⋯ → Reschedule (route B: `ig.mjs cancel <slug>` + `ig.mjs queue … --at …`).
- **Publish a Reel right now:** Business Suite → Share now (route B: `ig.mjs publish-now <slug>`).
- **Revisit an old Short:** `git -C ~/Desktop/curiopulse sparse-checkout add videos/<slug>`, then `src/build.sh`
  (the toolchain in `~/.cache/cp` is picked up automatically). When you're done, push any change, then run
  `bin/cleanup.sh`.
- **Repo size:** publish-short.sh prints it. Past ~3.5 GB, propose moving old MP4s to GitHub Releases.

## Keep the skill improving

When the user corrects something, or you find a better way, fold it in during the same session:
- rules go in `reference/*.md`;
- engine code goes in `template/src/`;
- the lesson goes in `reference/videos.md`.

Then back up with `~/.claude/skills/cp/bin/backup-skill.sh <msg-file>`, which copies the skill to the repo's
`skill/cp/` and pushes.

## If interrupted

State exactly what's done and what the user must do (free disk, add a key, re-authorize with `yt.mjs auth` or
`ig.mjs token`). On "continue", resume from the saved state without redoing work:
- cached voice takes in `src/voice/`;
- `.work/` (timeline, mix, stills, qa rounds);
- `publish.json` (youtube.id, instagram.queued);
- the Instagram sheet from `ig.mjs prepare` (route A) or the queue (route B).

cleanup.sh never touches unsaved work, so an interrupted Short's folder stays on the Mac until it's pushed.

**Max effort ends with the turn** (found 8 Oct 2026: 4 of the last 12 routine runs did part of their work at
medium). The `effort: max` in this skill's frontmatter holds until the turn ends. A turn that starts later in the
same chat ("continue", a question from the user, a job that reports after the run had paused) runs at the chat's
own level, which in a routine run is medium. So:
- never end the turn while a render, an upload or another job of this run is still working; wait for it inside
  the turn;
- when a run is continued by a later message, call the Skill tool with skill `max-effort` before any other step. It
  puts the rest of that turn back at max and starts nothing; then resume as above. In a routine run a typed message
  brings an automatic reminder (`~/.claude/bin/routine-max-effort.py`, a UserPromptSubmit hook in
  `~/Desktop/.claude/settings.local.json`); do it without the reminder too.

## Files

- `reference/master-context-prompt.md`: the user's channel brief, verbatim (also at the repo root)
- `reference/brief.md`: the brief distilled, plus the user's later decisions (they win)
- `reference/story.md`: research, angle, hook, the first picture, the answer by 5 s, the beat shape for both lengths, topic picking, the one-page plan
- `reference/openings.jpg`: the openings that kept the most viewers (top row) and the fewest (bottom row); compare every new frame 0 with it
- `reference/analytics.md`: the numbers log, what the numbers said on 5 Oct 2026, the length test and how to read it
- `numbers.md`, `numbers.jsonl`: written by `yt.mjs numbers` on every run (the report and its history); never edit by hand
- `reference/narration.md`: Jessica, script.txt, voice.py, quota, the listening pass
- `reference/visual.md`: the look, the light (cinematic lighting: `setLights`, `actor`, `paint`), the subscribe cue, the hero rig, camera grammar, graphics, captions, safe area, the cover
- `reference/engine.md`: files, data flow, writing shots, borrowing world files from past videos, rendering
- `reference/sound.md`: buses, the sfxkit vocabulary, mix rules, commands
- `reference/qa.md`: checks while building, the qa.py gate, the ship bar, the loop
- `reference/publish.md`: packaging, GitHub → YouTube → Instagram, the calendar, one-time setup, troubleshooting
- `reference/pipeline.md`: where everything lives, the order of commands, this Mac's limits and gotchas
- `reference/videos.md`: every Short so far, its links, and what it taught
- `reference/instagram-api-notes.md`: the Instagram API research (endpoints, limits, unverified points, sources)
- `reference/examples/`: finger-wrinkles' script, timeline, audio, scenes and README, as working references
- `template/`: the video folder every Short starts from (engine + skeletons + README + publish.json)
- `topics.md`: the topic queue for `/cp next`
- `bin/new-short.sh`, `bin/publish-short.sh`, `bin/backup-skill.sh`, `bin/run-lock.sh`, `bin/cp-env.sh`
- `bin/cleanup.sh`: back to the light checkout (`skill/` + top-level files) once everything is on GitHub
- `bin/yt.mjs`: YouTube Data API (auth · whoami · upcoming · next-free · next-slot · upload · reschedule · status · stats)
  and YouTube Analytics (`numbers`: the log every run starts with; `analytics [n] [--curve <videoId>]`: stayed to
  watch, average % viewed, subscribers per 1,000 views, one video's retention curve). The length test's arms and
  slots are the constants `LENGTH_ARMS` and `LENGTH_TEST` at its top.
- `bin/ig.mjs`: Instagram. Route A: prepare · busy · route. Route B, the API: token · whoami · refresh · queue · upcoming · run-due · publish-now · cancel ·
  test-container · install-job)
- `bin/quota.mjs`: ElevenLabs characters left per account (exit 2 = not enough for a Short)

## Two Shorts a day (the user's decision via Claude, 2 Oct 2026: a 14-day test, review 17 Oct)

- Two routines: `curiopulse-daily-short` (00:00 IST) and `curiopulse-second-short` (06:00 IST). **Both run `/cp next`
  and both schedule a Reel** (user, 4 Oct 2026: "update curioPulse - second daily short to schedule a reel to
  instagram too. 12 hours apart from 1st reel"). From 2 to 4 Oct the second run was YouTube-only, so goosebumps and
  sun-sneeze have no Reel.
- YouTube takes the next free slot (11:30 AM or 11:30 PM IST), so the two runs fill both slots of a day.
- **Instagram takes the next free slot too: 06:30 or 18:30 IST, 12 hours apart**, and never before the Short's own
  YouTube release (`yt.mjs` picks it; the times taken are in `~/.config/cp/ig-queue.json`). In the steady state a
  Short that goes out on YouTube at 23:30 has its Reel the next evening, and an 11:30 Short the next morning.
- **youtube-only** mode still exists for a one-off (`/cp <topic> youtube-only`, or when the user asks): the same
  pipeline and ship bar, but set `"instagram": {"skip": true}` in publish.json and skip every Instagram step (no
  ig-queue entry, no Business Suite). No routine uses it now.
- **A teaser says "Next up: …", never "tomorrow"**: the next Short is about 12 hours away. Since 5 Oct 2026 the
  teaser lives in text only (the "Next up" comment, description, Reel caption); nothing spoken teases or asks.
- **Queue refill:** if fewer than 7 `[ ]` topics remain in topics.md, research and append 10 new "why does…" questions
  first (strange, second-person, body/nature/physics, a sourced mechanism and a weird true fact; no repeats of done
  topics), then take the next one.
- **Review on 17 Oct:** compare views per Short and subscribers (AM vs PM, run 1 vs run 2). If the average views per
  Short over the last 7 days drop below ~800, or quality slips, go back to one Short a day and say so. From 6 Oct the
  two slots also differ in length (the length test below), so read AM vs PM with `numbers.md`'s "before" rows.

## The 5 Oct 2026 changes and the length test (user: "yes" to all of it, from the channel's first-week numbers)

What the numbers showed, the rules that came out of them and how to read the test: `reference/analytics.md`. In short:
- **Opening:** "You…" + a physical action; the answer starts by 5 s; no spoken jargon beat. Since 9 Oct 2026 the
  opening is one continuous shot through the answer: no cut before 7 s, no shot of his frozen face, no title card
  (`reference/story.md`).
- **Subscribe cue:** silent since 9 Oct 2026: the pill over the last 3.4 s, nobody says the word; the Short ends on
  the button and the loop (`reference/narration.md`, `reference/visual.md`).
- **Length test `length-2026-10`:** a Short for a 23:30 slot is 30–35 s, a Short for an 11:30 slot stays 45–50 s.
  Both arms follow every other rule, so length is the only thing that differs. `yt.mjs next-slot` assigns the arm,
  qa.py enforces its band, `yt.mjs numbers` compares the arms. First reading on or after 14 Oct 2026; the run that
  makes it writes it into `reference/analytics.md` ("Readings") and leads its final report with it. The user decides
  what happens to the arms; a run never ends or swaps the test by itself.
- qa.py checks all of it on the delivered MP4: the length band of the arm, the answer by 5 s, the first cut (a
  warning before 7 s), no spoken "subscribe", the pill in the last seconds.
