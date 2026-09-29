# Pipeline: commands, order of work, the machine's limits

## Where things live

| What | Where |
|---|---|
| Repo (public) | https://github.com/hmunna36/curiopulse: `videos/<slug>/`, `master-context-prompt.md`, `README.md`, `skill/cp/` (backup of this skill) |
| Local checkout | `~/Desktop/curiopulse`: **blobless + sparse** (top-level files + the video in progress; `git sparse-checkout add videos/<slug>` brings one back) |
| Toolchain | `~/.cache/cp/`: `venv/` (Python 3.14: numpy scipy soundfile pyloudnorm pillow certifi), `node/node_modules/playwright-core`, `bin/ffmpeg` + `bin/ffprobe` (wrappers around `~/.cache/va`'s Remotion compositor ffmpeg 7.1; don't delete `~/.cache/va/node_modules`), `fonts/`, `models/ggml-base.en.bin` (whisper) |
| Keys | `~/.config/va/elevenlabs.env` (ElevenLabs, shared with va) · `~/.config/va/youtube-client.json` (OAuth client) · `~/.config/cp/youtube-token.json` · `~/.config/cp/instagram.json` (route B only; none exists) (all chmod 600; never print or commit them) |
| Instagram | Route A (in use): `ig.mjs prepare` → parts in the session scratchpad → Business Suite in Chrome; days taken in `~/.config/cp/ig-queue.json` ("busy"). Route B (API, only with a token): queue + spool `~/.cache/cp/ig-spool/` + launchd job `com.curiopulse.ig-publish` + log `~/Library/Logs/curiopulse-ig.log` |
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

## This Mac

- **8 GB M1:** one heavy job at a time. `run-lock.sh` refuses to start while a /va run holds its lock or a Remotion
  render runs, and the va skill's lock checks this one.
  - Don't render while another session renders (`pgrep -fl "render.js|remotion"`).
  - Touch the lock during long runs (`run-lock.sh touch`) so it stays live.
- **Disk:** keep ≥ 5 GB free on `/System/Volumes/Data` (`df -h /System/Volumes/Data`). A Short needs ≈ 400 MB
  while it builds (.work stems and mixes plus the MP4). `publish-short.sh <slug> --free` gives it back after the
  uploads.
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
