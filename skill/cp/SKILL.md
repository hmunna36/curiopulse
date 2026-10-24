---
name: cp
description: Produce a complete CurioPulse YouTube Short / Instagram Reel for a "why does…" science question: a 30–35 s 1080×1920 cinematic animated explainer, built around a test the viewer can do on themselves while watching (the rules of 15 Oct 2026), built entirely in code (procedural canvas scenes with the recurring hiker character, Jessica's performed ElevenLabs v3 narration with comedic timing, a synthesized score and sound design, word-pop captions), made just like the channel's lightning, hypnic-jerk and finger-wrinkles Shorts. It is QA'd and rebuilt in a loop until it clears the ship bar, pushed to github.com/hmunna36/curiopulse, then scheduled in the next free slots: YouTube at 11:30 AM or 11:30 PM IST (Data API) and Instagram at 18:30 or 21:00 IST, never before the YouTube release (Meta Business Suite in the user's Chrome; the API takes over if a token ever exists). Use when the user runs /cp <topic> or asks for a new CurioPulse Short; `/cp next` takes the next topic from topics.md.
argument-hint: <topic question> | next | next youtube-only
effort: max
---

# /cp <topic> — a CurioPulse Short, from question to scheduled release

The user gives a topic (`/cp why do onions make you cry`). Every run follows the user's loop (2026-09-29):

    create the Short → QA → not satisfied? fix the weak parts → QA again → … until satisfied
    → push to GitHub → upload + schedule: YouTube in the next free slot (11:30 or 23:30 IST, two a day), Instagram in its own next free slot (18:30 or 21:00 IST, two a day)

It must come out "just like the other 3 videos": same world, same hero, same narrator, same caption and bloom look,
same synthesized sound, same humour. Work autonomously from start to finish: no questions, no drafts, no
alternatives; if something is weak, fix it yourself. The upload and schedule are part of the job. The only question
allowed: no topic was given in a live session. `/cp next` takes one from `topics.md`.

## Hooks (binding since 9 Oct 2026)

Every video's opening follows `reference/hooks.md`: the five hook rules and one of its 21 formulas, named in the
README's plan and scored in the ship bar's hook item. Read it in the story step, before the script.

## The rules of 15 Oct 2026 (binding; user: "yes. let's do this.")

From the retention reading of 15 Oct (`reference/analytics.md`): the two breakouts (blocked nostril, knuckle cracking)
were the only Shorts that had the viewer do something to their own body while watching, the only Reels watched more
than 70 %, and the nostril was the only Short that never fell below YouTube's typical retention. Every Short is now
built like them (details in `reference/story.md`; it opens with the list):
1. **The topic is a test the viewer can do on themselves, on the spot, phone in hand, safely** (`topics.md`'s Queue
   holds only such topics; the others wait under Held).
2. **The hook is that test**, told to the viewer ("Pinch one nostril shut..."); frame 1 is him doing it, close.
3. **30–35 s, 66–76 words, every Short** (the length test is over; `yt.mjs next-slot` says "short").
4. **The lesson keeps pointing back to the viewer's test, in everyday words**; no science word spoken in the first
   15 s. The 9 Oct "one continuous shot, no cut before 7 s" rule is gone (it failed its own test).
5. **The button runs into the hook and the Short loops. The pill test (25 Oct–8 Nov 2026): a Short for a 23:30 slot
   ends with a short silent Subscribe pill, one for an 11:30 slot with none** (`yt.mjs next-slot` says the arm;
   timeline_lib.py sets the pill; qa.py checks it).
6. **The caption and the description end with a one-word question about the test** ("Left or right?").
7. **No missed day** (step 1 checks the last Reels really went out) **and a hit is followed by its kin**
   (`story.md` §4).
8. **The 8–13 s rule (24 Oct 2026; user: "you do whatever you want i need more subscribers and views").** The test
   stays on screen and in the viewer's hands through 13 s: the switch to the explanation is where non-hits leak
   (about 5 % of viewers a second; hits about 4), and the steepest drops all land on a technical sentence. So up to
   13 s the viewer is still doing (or re-doing) the test, the mechanism is ONE picture they can see on their own body
   (a cord tying two fingers together, not "a shared tendon"), and no line before 13 s explains in words what a
   picture can show. The button sends them back to the test ("now try it with the other hand", "now slower"), so the
   Short is watched again; the target is a curve starting at 150 %+ (`story.md` §2–§3).
   A test Short that passes 5,000 YouTube views goes into the playlist "Try These Tests On Yourself" (the top
   row of the Home tab): `yt.mjs playlist-add "Try These Tests On Yourself" <videoId>` (`analytics.md`, 24 Oct).
9. **The topic test (25 Oct 23:30 to 8 Nov 23:30 IST; user, 24 Oct 2026: "this que for 1 slot and in another slot
   some other extremely curious topic not only about human body", then "yes", and "the animation should be of top
   most quality with extremely timed comedy").** Each day has one TEST Short (rules 1–2 as above) and one CURIOUS
   Short: an impossible-sounding true thing about space, animals, Earth, physics or history, told to "you", from
   `topics.md`'s Curious queue, made by `story.md` §6. The kind alternates by day across the two slots so it never
   lines up with the pill test (`KIND_TEST` in `bin/yt.mjs`; `next-slot` prints it; `new-short.sh` writes publish.json
   "kind"). Rules 3–8 hold for both kinds. Read on about 11 Nov with the pill test (`analytics.md`, the topic test).

## Deliverables

In `~/Desktop/curiopulse/videos/<slug>/` (slug = the topic's key words, lowercase with dashes, e.g. `brain-freeze`):

| File | Spec |
|---|---|
| `<slug>-short.mp4` | 1080×1920, 30 fps, H.264 High CRF 17 yuv420p bt709, AAC 256 k 48 kHz, 30–35 s (every Short since 16 Oct 2026; `yt.mjs next-slot` says "short"), −14 LUFS, ≤ −1 dBTP, < 95 MB |
| `cover.jpg` | 1080×1920 JPEG < 2 MB: the YouTube thumbnail and the Instagram cover |
| `<slug>.srt` | English captions from the word timings |
| `README.md` | script, publishing table + metadata, shot table, sound design, science notes with sources, ship review, rebuild |
| `publish.json` | title, description, tags, IG caption (with the follow line), `pinnedComment` (the draft of the "Next up" comment), the `playlist`, the `length` arm, schedule; the tools write back ids and links |
| `src/` | everything that rebuilds it (`build.sh`), including the cached voice takes |

Plus: committed and pushed to the repo, a row in the root README, **YouTube scheduled for the next free slot: 11:30 AM or 11:30 PM IST (two slots a day; user, 2 Oct 2026)** (thumbnail +
captions) and the **Instagram Reel scheduled for its next free slot: 18:30 or 21:00 IST (two slots a day; user,
15 Oct 2026, from when the viral nostril Reel's views ran fastest; 06:30 and 18:30 from 4 Oct)**, never before the
Short's YouTube release (Business Suite).

## Non-negotiables (details in `reference/brief.md`; the brief itself is `reference/master-context-prompt.md`)

- **Code-built only.** Procedural canvas animation plus synthesized sound. Never Higgsfield or other AI video, stock
  footage or generated images; the user was explicit. The narration is the only recorded element.
- **Human, performed narration:** Jessica (`cgSgspJ2msm6clMCkdW9`), `eleven_v3`, stability 0, v3 tags, comedy in the
  gaps. It must never sound like "someone READING A BOOK".
- **Hook on frame 1: the viewer's test** (15 Oct 2026): the first line tells the viewer to do something to their own
  body, or says they are doing it ("you"/"your" in the first eight words), and the strange thing happens to them by
  3 s; no intro, logo or "Did you know". **The first picture is a tight shot of him already doing that test** (7 Oct
  2026: openings of him doing something with his hands or mouth kept 64 % of viewers, wide or still ones 46–50 %;
  `reference/story.md` §2, `reference/openings.jpg`).
- **The answer by second 5** (5 Oct 2026, from the channel's retention curves; `reference/story.md`,
  `reference/analytics.md`): the line after the hook, the `answer` block, gives the answer as a plain, surprising
  claim or a metaphor ("Relax. Your ear just burped.") and STARTS by 5.0 s. The rest of the Short proves it. Never
  spend a spoken beat on the scientific name ("Doctors call it…", "It's called…") or on a bridge ("Here's the thing.",
  "So what's going on?") before it; a name worth having is an on-screen label.
- **Show, don't tell:** every statement has its visual; the camera travels to what's named; never static for more
  than 1–3 s; never slides.
- **Short and tight: 30–35 s, 66–76 spoken words, every Short since 16 Oct 2026** (user, 15 Oct 2026, from the
  length test's readings in `reference/analytics.md`; 45–50 s from 1 Oct, and the test's 11:30 arm until 16 Oct).
  `yt.mjs next-slot` says "short". Cut, don't rush: one mechanism, one payoff, the weirdest fact, the button.
- **Funny and curious:** 2 laugh beats (the answer line and the button); the story escalates to the weirdest true
  fact; the button line reframes or undercuts, and runs into the hook when the Short loops.
- **No spoken subscribe cue; the Short loops** (user, 15 Oct 2026: "yes"; `reference/analytics.md`). **The pill test
  (user, 24 Oct 2026: "yes let's test it for 2 weeks"): from 25 Oct 23:30 to 8 Nov 2026 a Short released at 23:30
  ends with a short silent pill, one at 11:30 with none.** Subscriber conversion is still the goal (user, 30 Sep
  2026), and the ask lives in text:
  - nobody says "subscribe" (since 9 Oct 2026: in all ten Shorts that spoke the word, a quarter to a half of the
    viewers still watching left within three seconds of it); the script has no `sub` block and nothing that asks,
    teases or winds up. qa.py fails a spoken "subscribe";
  - the pill: none from 16 Oct 2026 (the silent pill of 9–15 Oct still lost a middle 24 % in the last 4 s, against
    13 % with nothing there, and subscribers per 1,000 views did not move); the pill test brings back a shorter one
    (about 1.8 s on screen instead of 2.8, gone 0.6 s before the loop, no sound at all) on the pill arm only. publish.json
    `"subscribe"` (from `yt.mjs next-slot`, written by new-short.sh) says the arm; timeline_lib.py sets the cues for
    the pill arm and drops them otherwise, so make_timeline.py never sets one; qa.py fails a pill in the no-pill arm
    and a missing or mistimed one in the pill arm. Keep the button line's picture readable around it (the pill sits
    at y 1354–1486; captions lift to y 1150 while it is up);
  - the Short ends on the button line and loops back to frame 1. The ask and the next topic live in text: the Reel
    caption and the description end on a one-word question about the test, then the follow / subscribe line; the
    "Next up" comment asks the same question.
  Details: `reference/brief.md`, `narration.md`, `visual.md`, `qa.md`, `publish.md`.
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
     and rewrites `numbers.md` in this skill. Read the "since 16 Oct" row against the length test's short arm, and
     the newest rows. **A hit:** if a Short released in the last 3 days has five times the middle views per Short or
     more, take its closest kin from the Queue first (`reference/story.md` §4) and say so in the report. If Analytics
     fails, the report says so: carry on, and put the reason in the final report (it needs the user).
   - **Length arm and subscribe arm:** `node ~/.claude/skills/cp/bin/yt.mjs next-slot` prints the YouTube slot this
     Short will take, the length it must be built to (SHORT, 30–35 s, 66–76 words, for every slot since 16 Oct 2026)
     and, during the pill test (25 Oct–8 Nov 2026), whether it gets the pill (23:30 slots) or none (11:30 slots). The
     word budget, `publish.json`'s `length` and `subscribe`, the pill and qa.py's checks all follow it. Upload takes
     the next free slot of the Short's own arm, so a pill Short never lands in an 11:30 slot.
   - **The "Next up" comment** (`reference/publish.md`): `node ~/.claude/skills/cp/bin/yt.mjs comments-due` posts the
     queued comment on every Short that has gone public since it was uploaded: one comment per Short, and nothing
     else is ever done with comments. Put what it prints into the final report. If it fails, carry on.
   - **Did the last Reels really go out?** **(15 Oct 2026: three scheduled Reels, chalkboard, funny bone and eye-rubbing
     stars, vanished from Business Suite's schedule when Facebook locked the user's account, and nobody noticed for
     two days.)** If Chrome is connected, open Business Suite → Content → Published (open it the way `reference/publish.md` says: never from a saved `asset_id=` link)
     and check that every Reel scheduled for the last 48 hours is there (the profile's post count is a quick
     cross-check). A missing one is a pending Reel: schedule it first, in the next free slot, and put it at the top of
     the report.
   - **Catch up Instagram:** an earlier Short whose Reel is still pending (its publish.json has no
     `instagram.scheduledVia`, no `"skip": true`, and its slot is still ahead, or it was found missing above) gets
     scheduled first, if Chrome is connected. A missed night never leaves a Reel behind. (If the slot slips past while you work, `ig.mjs prepare`
     moves the Reel to the next free slot and says so in the sheet's `note`: write that time into publish.json.) Its
     folder lives on GitHub only: bring it back with
     `git -C ~/Desktop/curiopulse sparse-checkout add videos/<slug>` before `ig.mjs prepare`. The cleanup at the end
     of the run removes it again.
   - Instagram route: Business Suite in Claude in Chrome, always (user, 22 Oct 2026; `ig.mjs route` may still print
     `api`: ignore it, the token is only used for checks like `ig.mjs whoami`). It needs Chrome connected at ship time.
   - Skim `reference/videos.md` for what's been done and learned.
2. **Research + story** (`reference/story.md`):
   - sources and a claims table;
   - the test the viewer does, and the hook sentence that tells them (`reference/story.md` §2: "you"/"your", the
     strange thing by 3 s), the answer line (started by 5 s), the beats (hook, answer, mechanism pointing back to the
     test in everyday words, payoff, the weirdest fact, a button that runs into the hook), the jokes, and the one-word
     question for the caption;
   - the world(s), and what to borrow from past videos;
   - for the text teasers (the "Next up" comment, description, Reel caption) the next `[ ]` entry of `topics.md` (the
     one after this Short's);
   - the cover moment.
3. **Scaffold:** `~/.claude/skills/cp/bin/new-short.sh <slug> "<Title>"` creates
   `~/Desktop/curiopulse/videos/<slug>` from `template/`. Put the plan and the claims table into its README
   first. The script writes the length arm and the subscribe arm into its `publish.json` (`"length"` and
   `"subscribe"`, from `yt.mjs next-slot`) and prints them: check they are the arms the preflight gave. If it says it
   could not, put the objects there by hand.
4. **Narration** (`reference/narration.md`):
   - write `src/script.txt` (the block id `answer` is required; there is no `sub` block; 66–76 words);
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
   Put the safe-area mask on the hook, title/label and caption stills and the last 3 s (`bin/safe-area.py overlay`,
   qa.md): nothing important under a covered zone. Check the loop: the last frame next to frame 0.
9. **Render** in the background with a log and an EXIT marker (≈8 min), then `make_srt.py`. Wait for the marker
   inside the turn; never end the turn to wait for it (see "If interrupted": max effort ends with the turn).

### B. The quality loop (repeat until satisfied)

10. **QA the MP4:**
    - `$PYTHON qa.py ../.work ../<slug>-short.mp4` must have no FAIL;
    - read every contact sheet and crop the risky moments;
    - score the ship bar (12 items, incl. the test (1), the safe area (7b) and the loop (11)), with evidence;
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
    - fill in `publish.json`: title, description, tags, IG caption, `coverTime`, `pinnedComment` (the "Next up"
      line and the one-word question about the test) and `youtube.playlist` (one of the channel's three playlists,
      `reference/publish.md`). The IG caption and the description end their story part with that question;
    - write the README's metadata;
    - add the row to the root `README.md` table (YouTube date filled in after step 15);
    - run `node ~/.claude/skills/cp/bin/yt.mjs upload videos/<slug>/publish.json --dry-run`.
14. **GitHub:** write a commit message file ("Add the <topic> Short (NN s)" + a one-line summary + your attribution
    trailer), then run `~/.claude/skills/cp/bin/publish-short.sh <slug> <msg-file>`.
15. **YouTube:** `node ~/.claude/skills/cp/bin/yt.mjs upload videos/<slug>/publish.json --schedule=auto`. It takes the
    next free YouTube slot (11:30 or 23:30 IST), sets the thumbnail and the captions, and writes the Reel's slot (the
    next free one at 18:30 or 21:00 IST that is not before the YouTube release) into `instagram.publishAt`. Confirm with
    `yt.mjs status <id>`, then check the Short's own thumbnail in Studio and upload cover.jpg there if the slot shows
    anything else (`reference/publish.md`, step 2).
16. **Meta: Instagram by Business Suite, the Facebook Page by API (the user, 22 Oct 2026: "github is not working properly",
    after the GitHub publisher posted the 18:30 Reels 2+ hours late and missed whole days; route C is OFF). Every Short gets a
    Reel on both, in the slot from `instagram.publishAt` (18:30 or 21:00 IST), unless publish.json says `"skip": true`.** The
    Short's folder must already be pushed (step 14): the Page API fetches the MP4 from its public GitHub address.
    1. **Instagram: schedule it in Meta Business Suite (Claude in Chrome), Instagram ONLY.** Never `ig.mjs queue` (nothing
       publishes that queue any more).
       1. `node ~/.claude/skills/cp/bin/ig.mjs prepare videos/<slug>/publish.json --out <scratchpad>/ig-<slug>` builds the
          Reel-spec copy and splits it into parts of <= 9 MB. Its suggested slot can be wrong; use `instagram.publishAt`.
       2. In Claude in Chrome open `https://business.facebook.com/latest/home`, `find` "Create Reel" and click it BY REF.
       3. **Post to:** click the drop-down by ref, untick "CurioPulse" (the Page; fb.mjs posts it), click empty space, and
          zoom to read back `curio_pulse_tv` alone.
       4. Build the collector input, `file_upload` ONE part per call, reassemble, check size and SHA-256 inside the page, arm
          the click hook, click Add video (`reference/publish.md`, Route A, step 3).
       5. TYPE the caption a line at a time (Return between lines), click the "Reel details" heading, read it back from JS.
          Wait for the upload bar to say 100 %.
       6. **THE SHARE TRAP (22 Oct 2026: dominant-eye went out at once instead of the next day).** In this composer ONE
          "Next" goes straight to the Share step, and its "Share" button (publishes NOW) sits exactly where "Next" was.
          So: `find` "Next" and click it ONCE by ref; then `find` the "Schedule" option inside "Scheduling options" and
          click it by ref; check the bottom button now reads "Schedule". Never click Next/Share/Schedule by coordinates
          (the viewport flips between 685 and 746 px high).
       7. Date: coordinate-click the date field, screenshot the calendar, click the day. Time: `find` the hours and minutes
          spinbuttons, type them by ref, Tab, screenshot to read date and time back. Then `find` the bottom "Schedule"
          button and click it by ref. The dialog must say "scheduled to publish on <day>".
       8. `node ~/.claude/skills/cp/bin/ig.mjs busy <YYYY-MM-DD>T<HH:MM>` records the slot (yt.mjs counts it), and put
          `instagram.scheduledVia: "business-suite"` in publish.json.
       9. Content → Scheduled must list the row with the Instagram badge and the caption as its title.
       - If Chrome isn't connected, the window is hidden (`requestAnimationFrame` never fires) or Business Suite wants a
         password: don't guess. Report "Instagram still to schedule" with the prepared sheet; YouTube goes ahead.
    2. **Facebook Page:** `node ~/.claude/skills/cp/bin/fb.mjs reel videos/<slug>/publish.json`. It uploads and SCHEDULES the
       Reel natively on Facebook for the same time (the caption's Follow line becomes "Follow CurioPulse…"), and writes
       `facebook.videoId` into publish.json. Then `fb.mjs status <videoId>`: `publish_status` must read `scheduled` (processing
       may take a few minutes; wait for `ready`). If it fails twice (a minute apart), tick the Page in step 1.3 instead and say
       so; a token or permission error (code 190, 10, 200) needs the user: report it, do not try to fix it.
    5. **Be gentle with both accounts** (they were suspended once, 16 Oct 2026): one upload per run, never bulk edits,
       never edit the Instagram profile (link, bio, name), never create or change Meta apps, users or tokens.
17. **Record:**
    - put the YouTube link, both release times and the queue status into the README and the root table;
    - commit and push again with publish-short.sh. Nothing may stay uncommitted, or the cleanup refuses.
18. **Deliver** (keep it short):
    - `SendUserFile` the MP4 and `cover.jpg` (`display: "render"`);
    - a message with the title, length and length arm, loudness, the YouTube link and release time, the Instagram
      release time, the story in one line, the test the viewer does, when the answer starts (seconds), the QA rounds
      and what changed, the playlist it went into, any "Next up" comment this run posted, the ElevenLabs characters
      left, and anything pending.
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

1. Take the first `[~]` line of `~/.claude/skills/cp/topics.md` and resume it, or else run `yt.mjs next-slot` and take
   the first `[ ]` line under `## Queue` when it prints "topic kind: TEST", or under `## Curious queue` when it prints
   "CURIOUS" (rule 9; never one under `## Held`: those have no test the viewer can do yet). Mark it
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
   - `yt.mjs numbers`, then `yt.mjs next-slot` (the length arm and the subscribe arm; never build without knowing
     them), then
     `yt.mjs comments-due` (the "Next up" comment on Shorts that have gone public);
   - Instagram: Claude in Chrome is connected (Business Suite schedules every Reel since 22 Oct 2026). If not, build and schedule YouTube anyway, and report Instagram as pending.
3. Run A → B → C exactly as for `/cp <topic>`, including the cleanup (step 20).
4. Close out: in step 19, mark the line `[x]` with its links and release day and move it under Done (the skill backup
   carries it). The lock is released after the cleanup.
5. Nobody is watching a scheduled run: never ask. When blocked, leave the line `[~]`, release the lock, and report
   exactly what's done and what's blocking. The next run resumes it.

## Also on request

- **Move a release:**
  - YouTube: `yt.mjs reschedule <id> 2026-10-05T23:30:00+05:30`.
  - Instagram: in Business Suite, Content → Scheduled → ⋯ → Reschedule.
- **Publish a Reel right now (only when the user asks for that Reel):** `ig.mjs publish-now <slug>` if it is in the queue,
  else Business Suite → Share now.
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
- `reference/story.md`: the rules of 15 Oct, research, angle, the test and the hook, the first picture, the answer by 5 s, the lesson, the beat shape (30–35 s), topic picking, the one-page plan
- `reference/openings.jpg`: the openings that kept the most viewers (top row) and the fewest (bottom row); compare every new frame 0 with it
- `reference/analytics.md`: the numbers log, what the numbers said on 5 Oct 2026, the length test and how to read it
- `numbers.md`, `numbers.jsonl`: written by `yt.mjs numbers` on every run (the report and its history); never edit by hand
- `reference/narration.md`: Jessica, script.txt, voice.py, quota, the listening pass
- `reference/visual.md`: the look, the light (cinematic lighting: `setLights`, `actor`, `paint`), the ending (no subscribe cue since 16 Oct), the hero rig, camera grammar, graphics, captions, safe area, the cover
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
- `bin/render-gate.sh`: the render gate for /cp (wait until no other pipeline is rendering; an idle open Blender does not count)
- `bin/cleanup.sh`: back to the light checkout (`skill/` + top-level files) once everything is on GitHub
- `bin/yt.mjs`: YouTube Data API (auth · whoami · upcoming · next-free · next-slot · upload · reschedule · status · stats ·
  comments-due · queue-comment · channel-info · playlists · playlist-create · playlist-add · channel-set · section-add)
  and YouTube Analytics (`numbers`: the log every run starts with; `analytics [n] [--curve <videoId>]`: stayed to
  watch, average % viewed, subscribers per 1,000 views, one video's retention curve). The length arms, the test's
  dates and the arm since are the constants `LENGTH_ARMS`, `LENGTH_TEST` and `HOUSE_ARM` at its top.
- `bin/fb.mjs`: the Facebook Page by API: token --system · whoami · reel <publish.json> · status <video_id> (native scheduling; ~/.config/cp/facebook.json)
- `bin/ig.mjs`: Instagram. Route A (fallback): prepare · busy · route. Route B, the API (the normal route): token · whoami · refresh · queue · upcoming · run-due · publish-now · cancel ·
  test-container · install-job). Route C, the cloud (GitHub Actions `ig-publish.yml`): cloud-setup · cloud-enable · pull-results · refresh-weekly
- `bin/quota.mjs`: ElevenLabs characters left per account (exit 2 = not enough for a Short)

## Two Shorts a day (the user's decision via Claude, 2 Oct 2026: a 14-day test, review 17 Oct)

- Two routines: `curiopulse-daily-short` (00:00 IST) and `curiopulse-second-short` (06:00 IST). **Both run `/cp next`
  and both schedule a Reel** (user, 4 Oct 2026: "update curioPulse - second daily short to schedule a reel to
  instagram too. 12 hours apart from 1st reel"). From 2 to 4 Oct the second run was YouTube-only, so goosebumps and
  sun-sneeze have no Reel.
- YouTube takes the next free slot (11:30 AM or 11:30 PM IST), so the two runs fill both slots of a day.
- **Instagram takes the next free slot too: 18:30 or 21:00 IST** (user, 15 Oct 2026; the nostril Reel's views ran
  fastest 21:30-03:30 IST and slowest 12:30-16:30; 06:30 and 18:30 from 4 Oct), and never before the Short's own
  YouTube release (`yt.mjs` picks it; the times taken are in `~/.config/cp/ig-queue.json`; a slot counts as taken
  when another Reel is within 2 hours of it). Both Reels of a day go out in the evening, 2.5 hours apart.
- **youtube-only** mode still exists for a one-off (`/cp <topic> youtube-only`, or when the user asks): the same
  pipeline and ship bar, but set `"instagram": {"skip": true}` in publish.json and skip every Instagram step (no
  ig-queue entry, no Business Suite). No routine uses it now.
- **A teaser says "Next up: …", never "tomorrow"**: the next Short is about 12 hours away. Since 5 Oct 2026 the
  teaser lives in text only (the "Next up" comment, description, Reel caption); nothing spoken teases or asks.
- **Queue refill:** if fewer than 7 `[ ]` topics remain in the Queue, research and append 10 new ones first: each a
  test the viewer can do on themselves while watching, safely, in a few seconds (`reference/story.md` §4), with a
  sourced mechanism, a weird true fact and a one-word answer the caption can ask for; no repeats of done topics. Then
  take the next one. The Curious queue the same way when fewer than 4 are left: 8 new impossible-sounding true
  things (`story.md` §6).
- **Review on 17 Oct:** compare views per Short and subscribers (AM vs PM, run 1 vs run 2). If the average views per
  Short over the last 7 days drop below ~800, or quality slips, go back to one Short a day and say so. From 6 to
  16 Oct the two slots also differed in length (the length test below), so read AM vs PM with `numbers.md`'s
  "before" rows; since 16 Oct both are 30–35 s.

## The 5 Oct 2026 changes, the length test and the rules of 15 Oct (user: "yes" each time)

What the numbers showed, the rules that came out of them and how they are read: `reference/analytics.md`. In short:
- **Opening:** the viewer's test (15 Oct), "you"/"your" in the first line; the answer starts by 5 s; no spoken jargon
  beat. The 9 Oct "one continuous shot, no cut before 7 s" rule was dropped on 15 Oct (it failed its own test); no
  shot of his frozen face before 12 s and no title card in the first 15 s stay (`reference/story.md`).
- **Subscribe:** nobody says the word (9 Oct); the silent pill of 9–15 Oct was gone from 16 Oct; the Short ends on
  the button and loops (`reference/narration.md`, `reference/visual.md`). **Pill test `pill-2026-10`, 25 Oct 23:30 to
  8 Nov 23:30:** 23:30 slots get a shorter silent pill, 11:30 slots none, 14 Shorts an arm; `yt.mjs` carries it as
  `PILL_TEST`, `numbers` keeps a row for each arm, the verdict is read about 11 Nov (`reference/analytics.md`).
- **Length test `length-2026-10`, 6 Oct 23:30 to 16 Oct 11:30:** a Short for a 23:30 slot was 30–35 s, one for an
  11:30 slot 45–50 s. Its readings (14 and 15 Oct) favoured 30–35 s; the user chose it for every slot. `yt.mjs`
  carries it as `LENGTH_TEST.end` and `HOUSE_ARM`; `numbers` keeps the test's rows and adds "since 16 Oct".
- qa.py checks it on the delivered MP4: the length band (30–35 s), the answer by 5 s, "you" in the first line (a
  warning), no spoken "subscribe", the pill as the subscribe arm says.
