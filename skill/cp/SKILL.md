---
name: cp
description: Produce a complete CurioPulse YouTube Short / Instagram Reel for a "why does…" science question: a 40–50 s 1080×1920 cinematic animated explainer built entirely in code (procedural canvas scenes with the recurring hiker character, Jessica's performed ElevenLabs v3 narration with comedic timing, a synthesized score and sound design, word-pop captions), made just like the channel's lightning, hypnic-jerk and finger-wrinkles Shorts. It is QA'd and rebuilt in a loop until it clears the ship bar, pushed to github.com/hmunna36/curiopulse, then scheduled for the next free day: YouTube in the next free slot, 11:30 AM or 11:30 PM IST (Data API) and Instagram at 18:30 IST (Meta Business Suite in the user's Chrome; the API takes over if a token ever exists). Use when the user runs /cp <topic> or asks for a new CurioPulse Short; `/cp next` takes the next topic from topics.md.
argument-hint: <topic question> | next | next youtube-only
effort: max
---

# /cp <topic> — a CurioPulse Short, from question to scheduled release

The user gives a topic (`/cp why do onions make you cry`). Every run follows the user's loop (2026-09-29):

    create the Short → QA → not satisfied? fix the weak parts → QA again → … until satisfied
    → push to GitHub → upload + schedule: YouTube in the next free slot (11:30 or 23:30 IST, two a day), Instagram 18:30 IST on its own next free day

It must come out "just like the other 3 videos": same world, same hero, same narrator, same caption and bloom look,
same synthesized sound, same humour. Work autonomously from start to finish: no questions, no drafts, no
alternatives; if something is weak, fix it yourself. The upload and schedule are part of the job. The only question
allowed: no topic was given in a live session. `/cp next` takes one from `topics.md`.

## Deliverables

In `~/Desktop/curiopulse/videos/<slug>/` (slug = the topic's key words, lowercase with dashes, e.g. `brain-freeze`):

| File | Spec |
|---|---|
| `<slug>-short.mp4` | 1080×1920, 30 fps, H.264 High CRF 17 yuv420p bt709, AAC 256 k 48 kHz, 40–50 s (35–55 allowed), −14 LUFS, ≤ −1 dBTP, < 95 MB |
| `cover.jpg` | 1080×1920 JPEG < 2 MB: the YouTube thumbnail and the Instagram cover |
| `<slug>.srt` | English captions from the word timings |
| `README.md` | script, publishing table + metadata, shot table, sound design, science notes with sources, ship review, rebuild |
| `publish.json` | title, description, tags, IG caption (with the follow line), `pinnedComment` suggestion, schedule; the tools write back ids and links |
| `src/` | everything that rebuilds it (`build.sh`), including the cached voice takes |

Plus: committed and pushed to the repo, a row in the root README, **YouTube scheduled for the next free slot: 11:30 AM or 11:30 PM IST (two slots a day; user, 2 Oct 2026)** (thumbnail +
captions) and the **Instagram Reel scheduled for 18:30 IST** on the same free day (Business Suite).

## Non-negotiables (details in `reference/brief.md`; the brief itself is `reference/master-context-prompt.md`)

- **Code-built only.** Procedural canvas animation plus synthesized sound. Never Higgsfield or other AI video, stock
  footage or generated images; the user was explicit. The narration is the only recorded element.
- **Human, performed narration:** Jessica (`cgSgspJ2msm6clMCkdW9`), `eleven_v3`, stability 0, v3 tags, comedy in the
  gaps. It must never sound like "someone READING A BOOK".
- **Hook on frame 1:** action, a strange experience in the second person; no intro, logo or "Did you know".
- **Show, don't tell:** every statement has its visual; the camera travels to what's named; never static for more
  than 1–3 s; never slides.
- **Short and tight: 40–50 s, never over 55 s** (user, 1 Oct 2026; reference/brief.md). About 95–115 spoken words. Cut,
  don't rush: one mechanism, one twist, the weirdest fact, the button.
- **Funny and curious:** 2–3 laugh beats; the story escalates to the weirdest true fact; the button line
  reframes or undercuts.
- **Subscribe hooks, audible AND visual, on every Short** (user's decision, 30 Sep 2026; it replaces the old "no like and
  subscribe" rule, because subscriber conversion is the channel's bottleneck): the last spoken block `sub` is a short
  in-voice line (≤ 70 characters) that teases tomorrow's topic and asks for the subscribe, never a generic "like and
  subscribe"; and the animated Subscribe pill + bell + cursor click (`web/subscribe.js`) plays over the last ~2.6 s,
  timed to that line. Details: `reference/brief.md`, `narration.md`, `visual.md`, `qa.md`.
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
   - **Catch up Instagram:** an earlier Short whose Reel is still pending (its publish.json has no
     `instagram.scheduledVia` and its day is still ahead) gets scheduled first, if Chrome is connected. A missed
     night never leaves a Reel behind. Its folder lives on GitHub only: bring it back with
     `git -C ~/Desktop/curiopulse sparse-checkout add videos/<slug>` before `ig.mjs prepare`. The cleanup at the end
     of the run removes it again.
   - Instagram route: `node ~/.claude/skills/cp/bin/ig.mjs route`.
     - `business-suite` is the normal case: the user's Facebook account is blocked, so no API token can exist.
       This route needs Claude in Chrome connected at ship time.
     - `api` means a token exists.
   - Skim `reference/videos.md` for what's been done and learned.
2. **Research + story** (`reference/story.md`):
   - sources and a claims table;
   - the curiosity angle, the hook sentence, the beats (hook, reaction, name, mechanism, twist/proof, debate,
     bonus, button), the jokes;
   - the world(s), and what to borrow from past videos;
   - the subscribe line: tomorrow's teaser from the next `[ ]` entry of `topics.md` (the one after this Short's);
   - the cover moment.
3. **Scaffold:** `~/.claude/skills/cp/bin/new-short.sh <slug> "<Title>"` creates
   `~/Desktop/curiopulse/videos/<slug>` from `template/`. Put the plan and the claims table into its README
   first.
4. **Narration** (`reference/narration.md`):
   - write `src/script.txt`;
   - run `$PYTHON voice.py ../.work --synth`;
   - do the listening pass plus whisper;
   - retake or rewrite blocks until the performance is right. Timing edits (gap, tempo, tighten) are free.
5. **Timeline:** in `src/make_timeline.py`, write SHOTS (anchored to phrases), CHUNKS, COLOR, DISPLAY and a cue for
   every beat. Worked example: `reference/examples/make_timeline.finger-wrinkles.py`.
6. **Picture** (`reference/visual.md`, `reference/engine.md`), shot by shot:
   - write the world files and `SC.<shot>` in `src/web/`, and list them in `scene.html`;
   - render stills, tile a contact sheet, Read it, fix;
   - the hook first, then in order;
   - then the cover frame (`cover.jpg`).
7. **Sound** (`reference/sound.md`): `src/audio.py` gets beds, hits on every beat, the score by section, the comedy
   stops, then `master()`. Run `qc_audio.py` and fix the masked words now.
8. **Pre-render sweep** (`reference/qa.md`): stills every 1 s across the whole timeline. Fix everything visible now.
   Put the safe-area mask on the hook, title/label, caption and subscribe stills (`bin/safe-area.py overlay`, qa.md):
   nothing important under a covered zone.
9. **Render** in the background with a log and an EXIT marker (≈8 min), then `make_srt.py`.

### B. The quality loop (repeat until satisfied)

10. **QA the MP4:**
    - `$PYTHON qa.py ../.work ../<slug>-short.mp4` must have no FAIL;
    - read every contact sheet and crop the risky moments;
    - score the ship bar (12 items, incl. the safe area (7b) and the subscribe hook), with evidence;
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
15. **YouTube:** `node ~/.claude/skills/cp/bin/yt.mjs upload videos/<slug>/publish.json --schedule=auto`. It picks the
    next day free on both platforms and sets the next free slot (11:30 or 23:30 IST), the thumbnail and the captions. Confirm with
    `yt.mjs status <id>`.
16. **Instagram**, the same day at 18:30 IST (`reference/publish.md`):
    - **Route A (Business Suite, the normal case):**
      1. `node ~/.claude/skills/cp/bin/ig.mjs prepare videos/<slug>/publish.json --out <scratchpad>/ig-<slug>`
         builds the Reel-spec copy and splits it into parts of ≤ 9 MB.
      2. In Claude in Chrome: open Business Suite, upload the parts into a collector input, reassemble, and check
         the SHA-256.
      3. Create Reel → Add video (with the click hook) → caption → Schedule, on the day at 18:30.
      4. Verify it in Content → Scheduled, then `ig.mjs busy <date>`.
      - If Chrome isn't connected, or Business Suite wants a password, don't guess. Report "Instagram still to
        schedule" and leave the prepared sheet, so the user or the next run can finish it.
    - **Route B (API):** `node ~/.claude/skills/cp/bin/ig.mjs queue videos/<slug>/publish.json`; the launchd job
      publishes it. Check `ig.mjs job-status` and `ig.mjs whoami`.
17. **Record:**
    - put the YouTube link, both release times and the queue status into the README and the root table;
    - commit and push again with publish-short.sh. Nothing may stay uncommitted, or the cleanup refuses.
18. **Deliver** (keep it short):
    - `SendUserFile` the MP4 and `cover.jpg` (`display: "render"`);
    - a message with the title, length, loudness, the YouTube link and release time, the Instagram release time,
      the story in one line, the QA rounds and what changed, the ElevenLabs characters left, and anything pending.
19. **Remember:** add the Short to `reference/videos.md` (and a lesson if there was one), a memory note, and a line
    in `MEMORY.md`. In `/cp next`, mark the topic `[x]` too. Then back up the skill, which carries videos.md and
    topics.md: `bin/backup-skill.sh <msg-file>`.
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

## Files

- `reference/master-context-prompt.md`: the user's channel brief, verbatim (also at the repo root)
- `reference/brief.md`: the brief distilled, plus the user's later decisions (they win)
- `reference/story.md`: research, angle, hook, the beat shape of the shipped Shorts, topic picking, the one-page plan
- `reference/narration.md`: Jessica, script.txt, voice.py, quota, the listening pass
- `reference/visual.md`: the look, the subscribe cue, the hero rig, camera grammar, graphics, captions, safe area, the cover
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
- `bin/yt.mjs`: YouTube Data API (auth · whoami · upcoming · next-free · upload · reschedule · status)
- `bin/ig.mjs`: Instagram. Route A: prepare · busy · route. Route B, the API: token · whoami · refresh · queue · upcoming · run-due · publish-now · cancel ·
  test-container · install-job)
- `bin/quota.mjs`: ElevenLabs characters left per account (exit 2 = not enough for a Short)

## Two Shorts a day (the user's decision via Claude, 2 Oct 2026: a 14-day test, review 17 Oct)

- Two routines: `curiopulse-daily-short` (00:00 IST, `/cp next`: YouTube + Instagram) and `curiopulse-second-short`
  (06:00 IST, `/cp next youtube-only`). In **youtube-only** mode, run the same pipeline and the same ship bar, but set
  `"instagram": {"skip": true}` in publish.json and skip every Instagram step (no ig-queue entry, no Business Suite):
  Instagram stays at one Reel a day.
- YouTube takes the next free slot (11:30 AM or 11:30 PM IST), so the two runs fill both slots of a day.
- **The tease says "Next up: …", never "tomorrow"**: the next Short is about 12 hours away.
- **Queue refill:** if fewer than 7 `[ ]` topics remain in topics.md, research and append 10 new "why does…" questions
  first (strange, second-person, body/nature/physics, a sourced mechanism and a weird true fact; no repeats of done
  topics), then take the next one.
- **Review on 17 Oct:** compare views per Short and subscribers (AM vs PM, run 1 vs run 2). If the average views per
  Short over the last 7 days drop below ~800, or quality slips, go back to one Short a day and say so.
