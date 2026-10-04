# Pipeline: commands, order of work, the machine's limits

## Where things live

| What | Where |
|---|---|
| Repo (public) | https://github.com/hmunna36/curiopulse: `videos/<slug>/`, `master-context-prompt.md`, `README.md`, `skill/cp/` (backup of this skill) |
| Local checkout | `~/Desktop/curiopulse`: **blobless + sparse** (top-level files + the video in progress; `git sparse-checkout add videos/<slug>` brings one back) |
| Toolchain | `~/.cache/cp/`: `venv/` (Python 3.14: numpy scipy soundfile pyloudnorm pillow certifi), `node/node_modules/playwright-core`, `bin/ffmpeg` + `bin/ffprobe` (wrappers around `~/.cache/va`'s Remotion compositor ffmpeg 7.1; don't delete `~/.cache/va/node_modules`), `fonts/`, `models/ggml-base.en.bin` (whisper) |
| Keys | `~/.config/va/elevenlabs.env` (ElevenLabs, shared with va) · `~/.config/va/youtube-client.json` (OAuth client) · `~/.config/cp/youtube-token.json` · `~/.config/cp/instagram.json` (route B only; none exists) (all chmod 600; never print or commit them) |
| Instagram | Route A (in use): `ig.mjs prepare` → parts in the session scratchpad → Business Suite in Chrome; slots taken (06:30 and 18:30 IST) in `~/.config/cp/ig-queue.json` ("busy"). Route B (API, only with a token): queue + spool `~/.cache/cp/ig-spool/` + launchd job `com.curiopulse.ig-publish` + log `~/Library/Logs/curiopulse-ig.log` |
| Build intermediates | `videos/<slug>/.work/` (gitignored): narration, words, timeline, stems, mix, stills, qa |

`. ~/.claude/skills/cp/bin/cp-env.sh` sets PATH, NODE_PATH, PYTHON and ELEVENLABS_ENV_FILE for manual commands;
`src/build.sh` sets them by itself.

## Order of work (one video)

```sh
~/.claude/skills/cp/bin/run-lock.sh acquire <slug>
~/.claude/skills/cp/bin/new-short.sh <slug> "<Title>"
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

## The subscribe hooks in the order of work

- Before `voice.py --synth`: find tomorrow's topic (the `[ ]` entry after this Short's in `topics.md`), write the
  `## sub` block (≤ 90 characters), and check the whole script's characters against `quota.mjs` (narration.md).
- `make_timeline.py` sets `cues["sub_in"]` / `cues["sub_tap"]` from the word "subscribe" (already in the template).
- Stills of the last 3 s before the full render (qa.md); nothing else to run: `subscribe.js` is part of the engine.
- Skill-only change: new Shorts copy the template from `~/.claude/skills/cp/template/`, so no push to the repo is
  needed for the nightly routine. `bin/backup-skill.sh` mirrors it to `skill/cp/` on GitHub.

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
