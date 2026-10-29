# Pipeline: commands, order of work, the machine's limits

## Where things live

| What | Where |
|---|---|
| Repo (public) | https://github.com/hmunna36/curiopulse: `videos/<slug>/`, `master-context-prompt.md`, `README.md`, `skill/cp/` (backup of this skill) |
| Local checkout | `~/Desktop/curiopulse`: **blobless + sparse** (top-level files + the video in progress; `git sparse-checkout add videos/<slug>` brings one back) |
| Toolchain | `~/.cache/cp/`: `venv/` (Python 3.14: numpy scipy soundfile pyloudnorm pillow certifi), `node/node_modules/playwright-core`, `bin/ffmpeg` + `bin/ffprobe` (wrappers around `~/.cache/va`'s Remotion compositor ffmpeg 7.1; don't delete `~/.cache/va/node_modules`), `fonts/`, `models/ggml-base.en.bin` (whisper) |
| Keys | `~/.config/va/elevenlabs.env` (ElevenLabs, shared with va) · `~/.config/va/youtube-client.json` (OAuth client) · `~/.config/cp/youtube-token.json` · `~/.config/cp/instagram.json` (route B only; none exists) (all chmod 600; never print or commit them) |
| Instagram | Route A (in use): `ig.mjs prepare` → parts in the session scratchpad → Business Suite in Chrome; slots taken (18:30 and 21:00 IST since 16 Oct 2026; 06:30 and 18:30 before) in `~/.config/cp/ig-queue.json` ("busy"). Route B (API, only with a token): queue + spool `~/.cache/cp/ig-spool/` + launchd job `com.curiopulse.ig-publish` + log `~/Library/Logs/curiopulse-ig.log` |
| Build intermediates | `videos/<slug>/.work/` (gitignored): narration, words, timeline, stems, mix, stills, qa |

`. ~/.claude/skills/cp/bin/cp-env.sh` sets PATH, NODE_PATH, PYTHON and ELEVENLABS_ENV_FILE for manual commands;
`src/build.sh` sets them by itself.

## Order of work (one video)

```sh
~/.claude/skills/cp/bin/run-lock.sh acquire <slug>
node ~/.claude/skills/cp/bin/yt.mjs numbers && node ~/.claude/skills/cp/bin/yt.mjs next-slot   # the log, then the length arm
~/.claude/skills/cp/bin/new-short.sh <slug> "<Title>"      # also writes the length arm into publish.json
cd ~/Desktop/curiopulse/videos/<slug>/src && . ~/.claude/skills/cp/bin/cp-env.sh
# write script.txt → voice
$PYTHON voice.py ../.work --synth
# write make_timeline.py → timeline
$PYTHON make_timeline.py ../.work
# write scenes (web/*.js) → stills → fix, shot by shot
node render.js ../.work/timeline.json ../.work/stills "0,30,60"
# write audio.py → mix
$PYTHON audio.py ../.work && $PYTHON qc_audio.py ../.work
# full render (background, log, EXIT marker)
(node render.js ../.work/timeline.json ../<slug>-short.mp4 --audio ../.work/mix.wav > ../.work/render.log 2>&1; echo "EXIT $?" >> ../.work/render.log) &
$PYTHON make_srt.py ../.work/timeline.json ../<slug>.srt
$PYTHON qa.py ../.work ../<slug>-short.mp4
```

`src/build.sh` runs the whole chain from cached takes (voice → timeline → audio → render → srt). Use it for the final
rebuild and to prove the folder rebuilds.

## The numbers, the length, the test, the answer and the loop in the order of work (rules of 15 Oct 2026)

- Preflight: `yt.mjs numbers` (the log; read the "since 16 Oct" row against the length test's short arm), then
  `yt.mjs next-slot` (the slot, and the arm: "short", 30–35 s, for every slot since 16 Oct 2026). `analytics.md`
  explains both. Then the Instagram check of `SKILL.md` step 1 (did the last Reels really go out?).
- The topic is the first `[ ]` line of `topics.md`'s Queue: a test the viewer can do on themselves while watching
  (`story.md` §4). If a recent Short broke out (five times the middle views per Short), take its closest kin first.
- `new-short.sh` writes the arm into `publish.json` (`"length"`) and prints it; qa.py reads it from there. If the
  script says it could not reach YouTube, put the object `next-slot` prints there by hand.
- Before `voice.py --synth`: the hook is the test ("you"/"your" in the first eight words), the script has an
  `## answer` block (it must start by 5.0 s) and NO `sub` block: nobody says "subscribe". Count the whole script's
  words (66–76) and its characters against `quota.mjs` (narration.md).
- `make_timeline.py` prints the length, where the answer starts, the first words and the subscribe line ("nothing
  said", and the arm). It sets no subscribe cue itself: timeline_lib.py sets the pill for publish.json's pill arm (the
  pill test, 25 Oct–8 Nov 2026) and drops it otherwise; qa.py checks it. Fix a miss now, not after the render.
- Stills of the last 3 s and of the loop (last frame next to frame 0) before the full render (qa.md).
- Skill-only change: new Shorts copy the template from `~/.claude/skills/cp/template/`, so no push to the repo is
  needed for the nightly routine. `bin/backup-skill.sh` mirrors it to `skill/cp/` on GitHub.
- A Short started before 5 Oct 2026 and resumed later keeps its own (older) engine and qa.py copies in its `src/`:
  finish it by the rules it was started under.

## This Mac

- **8 GB M1:** a /cp run and a /va run may build in parallel. The user does this, and both nightly routines start
  at 00:00.
  - `run-lock.sh` only stops a second /cp run on the same repo.
  - Expect slower renders while both run, and never start a third heavy job.
  - Touch the lock during long runs (`run-lock.sh touch`) so it stays live.
- **The render gate** (3 Oct 2026; the routines' rule, shared with /va, /aw and /hf): never render in parallel with
  another pipeline. Before ANY job that opens the headless browser (stills, a sweep, the cover, the full render) run
  `~/.claude/skills/va/bin/wait-renders.sh [minutes]`; it returns when no other render or headless browser is running
  (exit 3 = still busy at the deadline: wait again, don't start). Chain it: `wait-renders.sh 60 && node render.js …`.
  A full Visual Algo render can hold the gate for 20–40 minutes: write the README, publish.json and the skill notes
  meanwhile. Don't re-run `audio.py` while your own full render is muxing `mix.wav`.
  - **Use `~/.claude/skills/cp/bin/render-gate.sh [minutes]` for /cp** (12 Oct 2026). It is the same gate, but a
    Blender that is only open (the user's app, idle) does not count: the va script matches "Blender" by name, and
    an idle Blender window left open overnight held the gate shut for ten minutes before anyone looked. A Blender
    counts only while it uses more than 40 % of a core. Never close the user's apps to get through a gate.
  - **It also passes when every match is hung** (18 Oct 2026): a wojak-story `remotion still` sat at 0 % CPU for five
    hours and held the gate shut. If none of the matching processes uses any CPU time over a 20 s sample, the gate says
    "idle (hung?)", names the PIDs and lets the render go. It never stops them: they belong to another session.
  - Print PIDs, not command lines, when you look at what is running (`pgrep -f`, not `pgrep -fl`): a shell that
    was started with a long here-document prints all of it.
  - **While another pipeline holds the gate, smoke-test the shots in Node** (29 Oct 2026, wombat-cubes: History
    Frontline's weekly film held it for an hour): `node ~/.claude/skills/cp/bin/scene-smoke.js src/web .work/timeline.json
    "0,9,18,…"` loads scene.html's scripts with a mock canvas and runs `renderFrame` on those frames. No picture, no
    browser, so no gate: it finds the ReferenceErrors, TypeErrors and bad cues before the first stills.
  - **A wait loop on `render.log` can read the LAST render's `EXIT`** (29 Oct 2026): a background `render-gate.sh && node
    render.js … > render.log` leaves the old log in place for the gate's 20 s check, and an `until grep -q EXIT` loop
    returned at once. Delete the old log before starting (`rm -f ../.work/render.log`), or wait for the background task.
- **Disk:** keep ≥ 5 GB free on `/System/Volumes/Data` (`df -h /System/Volumes/Data`). A Short needs ≈ 400 MB
  while it builds (.work stems and mixes plus the MP4). `bin/cleanup.sh` gives it back at the end of every run,
  once everything is on GitHub.
- **ffmpeg** (Remotion's build) can't do everything:
  - it has libx264, aac, pcm_s16le/s24le, png, image2, atempo, scale, split, and output `-r`;
  - it has no rawvideo muxer, no f32 PCM, and no fps/tile/noise/ebur128/freezedetect filters;
  - so QA runs in Python (qa.py, qc_*.py).
- **zsh gotchas:**
  - a word starting with `=` (`echo ======`) aborts the whole command line: quote it;
  - `cd` in a compound command changes the session cwd: prefer absolute paths.
- **Blobless clones:** anything that needs file contents of other videos downloads them lazily:
  - `git ls-tree -l` (sizes);
  - `git log -p`;
  - `git diff` against old commits;
  - `git archive`.
  Use `git show HEAD:<path>` for single files. Never run `-l` or `-p` across the repo; it pulled 50 MB of old
  blobs from visualalgo once.
- **Long commands:** run renders, voice batches and qa in the background with a log and an EXIT marker, and check
  on them; the tool's 10-minute limit kills foreground jobs.

Toolchain note (2 Oct 2026): `~/.cache/cp/venv` has pedalboard 0.9.25 (GPL-3.0, used as a tool only, never
vendored into the repo) for mixlib's studio chain. The shared CC0 sounds live in the repo's `assets/sfx/` (pushed
5f3e314); cleanup.sh narrows them out again after a run.
