---
name: cp
description: Produce a complete CurioPulse YouTube Short / Instagram Reel for a "why does…" science question: a 55–70 s 1080×1920 cinematic animated explainer built entirely in code (procedural canvas scenes with the recurring hiker character, Jessica's performed ElevenLabs v3 narration with comedic timing, a synthesized score and sound design, word-pop captions), made just like the channel's lightning, hypnic-jerk and finger-wrinkles Shorts. It is QA'd and rebuilt in a loop until it clears the ship bar, pushed to github.com/hmunna36/curiopulse, then scheduled for the next free day: YouTube at 11:30 IST (Data API) and Instagram at 18:30 IST (Meta Business Suite in the user's Chrome; the API takes over if a token ever exists). Use when the user runs /cp <topic> or asks for a new CurioPulse Short; `/cp next` takes the next topic from topics.md.
argument-hint: <topic question> | next
effort: max
---

# /cp <topic> — a CurioPulse Short, from question to scheduled release

The user gives a topic (`/cp why do onions make you cry`). Every run follows the user's loop (2026-09-29):

    create the Short → QA → not satisfied? fix the weak parts → QA again → … until satisfied
    → push to GitHub → upload + schedule: YouTube 11:30 IST, Instagram 18:30 IST (next free day, same day on both)

It must come out "just like the other 3 videos": same world, same hero, same narrator, same caption and bloom look,
same synthesized sound, same humour. Work autonomously from start to finish: no questions, no drafts, no
alternatives; if something is weak, fix it yourself. The upload and schedule are part of the job. The only question
allowed: no topic was given in a live session. `/cp next` takes one from `topics.md`.

## Deliverables

In `~/Desktop/curiopulse/videos/<slug>/` (slug = the topic's key words, lowercase with dashes, e.g. `brain-freeze`):

| File | Spec |
|---|---|
| `<slug>-short.mp4` | 1080×1920, 30 fps, H.264 High CRF 17 yuv420p bt709, AAC 256 k 48 kHz, 55–70 s (45–75 allowed), −14 LUFS, ≤ −1 dBTP, < 95 MB |
| `cover.jpg` | 1080×1920 JPEG < 2 MB: the YouTube thumbnail and the Instagram cover |
| `<slug>.srt` | English captions from the word timings |
| `README.md` | script, publishing table + metadata, shot table, sound design, science notes with sources, ship review, rebuild |
| `publish.json` | title, description, tags, IG caption, schedule; the tools write back ids and links |
| `src/` | everything that rebuilds it (`build.sh`), including the cached voice takes |

Plus: committed and pushed to the repo, a row in the root README, **YouTube scheduled for 11:30 IST** (thumbnail +
captions) and the **Instagram Reel scheduled for 18:30 IST** on the same free day (Business Suite).

## Non-negotiables (details in `reference/brief.md`; the brief itself is `reference/master-context-prompt.md`)

- **Code-built only.** Procedural canvas animation plus synthesized sound. Never Higgsfield or other AI video, stock
  footage or generated images; the user was explicit. The narration is the only recorded element.
- **Human, performed narration:** Jessica (`cgSgspJ2msm6clMCkdW9`), `eleven_v3`, stability 0, v3 tags, comedy in the
  gaps. It must never sound like "someone READING A BOOK".
- **Hook on frame 1:** action, a strange experience in the second person; no intro, logo or "Did you know".
- **Show, don't tell:** every statement has its visual; the camera travels to what's named; never static for more
  than 1–3 s; never slides.
- **Funny and curious:** at least 3 laugh beats; the story escalates to the weirdest true fact; the button line
  reframes or undercuts. No "like and subscribe".
- **The hiker** is the hero: the same rig, only the outfit changes.
- **Scientifically responsible:** claims are sourced; uncertain ones are hedged ("Scientists think…", "One idea…").
- **Ship only above the bar** (`reference/qa.md`): `qa.py` clean and every ship-bar item scoring 8 or more.

## Workflow

Read each reference file when you reach its phase. They are short; don't skip them.

### A. Create

1. **Preflight** (`reference/pipeline.md`):
   - Take the lock: `~/.claude/skills/cp/bin/run-lock.sh acquire <slug>`. Exit 3 = a /va or /cp run is working;
     say which and stop, since this 8 GB M1 can't build two at once. Run `run-lock.sh release` whenever the run
     ends, stops or fails.
   - Disk: `df -h /System/Volumes/Data` needs ≥ 5 GB free. Free earlier Shorts with
     `publish-short.sh <slug> --free` if needed.
   - Voice: `node ~/.claude/skills/cp/bin/quota.mjs` (exit 2 = less than ≈1,600 characters left).
   - Calendar: `node ~/.claude/skills/cp/bin/yt.mjs upcoming` and `node ~/.claude/skills/cp/bin/ig.mjs upcoming`.
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
9. **Render** in the background with a log and an EXIT marker (≈8 min), then `make_srt.py`.

### B. The quality loop (repeat until satisfied)

10. **QA the MP4:**
    - `$PYTHON qa.py ../.work ../<slug>-short.mp4` must have no FAIL;
    - read every contact sheet and crop the risky moments;
    - score the ship bar (10 items), with evidence;
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
    next day free on both platforms and sets 11:30 IST, the thumbnail and the captions. Confirm with
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
    - commit and push again with publish-short.sh;
    - free the disk: `publish-short.sh <slug> --free` (the IG spool copy stays until it's published).
18. **Deliver** (keep it short):
    - `SendUserFile` the MP4 and `cover.jpg` (`display: "render"`);
    - a message with the title, length, loudness, the YouTube link and release time, the Instagram release time,
      the story in one line, the QA rounds and what changed, the ElevenLabs characters left, and anything pending.
19. **Remember:** add the Short to `reference/videos.md` (and a lesson if there was one), a memory note, and a line
    in `MEMORY.md`. Then `run-lock.sh release`.

## `/cp next` (queue mode, also for a scheduled routine)

1. Take the first `[~]` line of `~/.claude/skills/cp/topics.md` and resume it, or else the first `[ ]` line. Mark it
   in progress: `- [~] Why do onions make you cry? — onion-tears — started 2026-10-01`. If the queue is empty, report
   that and stop.
2. Gates before building anything; if one fails, report the fix and stop, and a new topic goes back to `[ ]`:
   - `run-lock.sh acquire`;
   - disk ≥ 8 GB free after freeing old Shorts;
   - `quota.mjs` exits 0;
   - `yt.mjs whoami` says CurioPulse;
   - Instagram: `ig.mjs route` says `business-suite` and Claude in Chrome is connected (or it says `api` and `ig.mjs whoami` works). If neither holds, build and schedule YouTube anyway, and report Instagram as pending.
3. Run A → B → C exactly as for `/cp <topic>`.
4. Close out: mark the line `[x]` with its links and release day, move it under Done, then release the lock.
5. Nobody is watching a scheduled run: never ask. When blocked, leave the line `[~]`, release the lock, and report
   exactly what's done and what's blocking. The next run resumes it.

## Also on request

- **Move a release:**
  - YouTube: `yt.mjs reschedule <id> 2026-10-05T11:30:00+05:30`.
  - Instagram: in Business Suite, Content → Scheduled → ⋯ → Reschedule (route B: `ig.mjs cancel <slug>` + `ig.mjs queue … --at …`).
- **Publish a Reel right now:** Business Suite → Share now (route B: `ig.mjs publish-now <slug>`).
- **Revisit an old Short:** `git -C ~/Desktop/curiopulse sparse-checkout add videos/<slug>`, then `src/build.sh`
  (the toolchain in `~/.cache/cp` is picked up automatically).
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

## Files

- `reference/master-context-prompt.md`: the user's channel brief, verbatim (also at the repo root)
- `reference/brief.md`: the brief distilled, plus the user's later decisions (they win)
- `reference/story.md`: research, angle, hook, the beat shape of the shipped Shorts, topic picking, the one-page plan
- `reference/narration.md`: Jessica, script.txt, voice.py, quota, the listening pass
- `reference/visual.md`: the look, the hero rig, camera grammar, graphics, captions, safe area, the cover
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
- `bin/yt.mjs`: YouTube Data API (auth · whoami · upcoming · next-free · upload · reschedule · status)
- `bin/ig.mjs`: Instagram. Route A: prepare · busy · route. Route B, the API: token · whoami · refresh · queue · upcoming · run-due · publish-now · cancel ·
  test-container · install-job)
- `bin/quota.mjs`: ElevenLabs characters left per account (exit 2 = not enough for a Short)
