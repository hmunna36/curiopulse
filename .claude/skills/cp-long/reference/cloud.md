# The cloud machine: what a routine run has, and what it does not

Verified against the Claude Code docs on 4 Oct 2026 (routines are a research preview: when something here turns out
wrong, fix this file in the same run).

## The machine

- A fresh Ubuntu x86_64 VM for every run (about 4 CPUs, 16 GB RAM, 30 GB disk, no GPU), with a full clone of this
  repo from `main`. Node 22 and Python 3 are there; ffmpeg and a browser are not.
- **Nothing survives a run except what is pushed to GitHub.** No `~/.claude`, no memory, no earlier `.work/`.
- `bin/cloud-setup.sh` (run by `bin/preflight.sh`) installs the toolchain into `~/.cache/cpl` in 2–5 minutes:
  ffmpeg (apt), a Python venv (numpy scipy soundfile pyloudnorm pillow certifi pedalboard faster-whisper),
  playwright-core and its Chromium. `. bin/env.sh` then sets PATH, NODE_PATH, PYTHON, CHROME_PATH and RENDER_JOBS.
  (If the user ever puts `bash .claude/skills/cp-long/bin/cloud-setup.sh` in the environment's setup script, the
  install is cached and this step takes seconds. It is optional.)
- As root, Chrome needs `--no-sandbox`; render.js and make_cover.js add it themselves.

## Keys (environment variables of the cloud environment; set by the user, never by you)

| Variable | What |
|---|---|
| `ELEVENLABS_API_KEY` | the PAID ElevenLabs account (Jessica's narration). voice.py and quota.mjs read it |
| `YT_CLIENT_ID`, `YT_CLIENT_SECRET` | the Google OAuth client the channel's uploader uses |
| `YT_REFRESH_TOKEN` | the CurioPulse channel's refresh token |

- Never print them: no `env`, `printenv`, `set`, `echo $VAR`, no `-v`/`--trace` on curl, no key in a URL, a commit, a
  log or the report. preflight.sh only says "set" or "NOT SET". push.sh refuses a commit that contains something
  shaped like a key. The repo is PUBLIC.
- A missing key is a blocker only the user can clear: report the variable's name and stop.

## Network

The environment's network setting decides what is reachable. The run needs `api.elevenlabs.io`,
`*.googleapis.com` (YouTube upload, OAuth), GitHub, npm, PyPI, Ubuntu mirrors, Playwright's download host,
`huggingface.co` (the small speech model for the transcript check; optional) and the research sites (Wikipedia,
PubMed, university and journal pages; WebSearch and WebFetch work without it). preflight.sh lists what is BLOCKED. If
ElevenLabs or Google is blocked, that is the user's setting to change ("Full" network access, or a custom allowlist
with those hosts): report it and stop.

## Long commands

- A Bash call ends after 2 minutes by default and 10 at most. Anything longer (the full render, a voice batch, qa.py)
  runs in the background with a log and an EXIT marker:

      nohup sh -c '<command> > ../.work/<name>.log 2>&1; echo "EXIT $?" >> ../.work/<name>.log' >/dev/null 2>&1 &

  then check on it (`tail -3 ../.work/<name>.log`) between other work. To wait, loop inside one call with a long
  timeout: `until grep -q '^EXIT' ../.work/render.log; do sleep 20; done; tail -5 ../.work/render.log`.
- The machine pauses when the session sits idle. Keep working (README, publish.json, the next check) while a render
  runs; do not end the turn with a job still running.
- **Render time:** preflight's render test prints seconds for 60 frames with one browser. A 2:45 video is about
  4,950 frames; `render_par.js` runs `RENDER_JOBS` browsers side by side (CPUs − 1) and prints progress per piece.
  Expect 30–90 minutes. If a piece fails, the others are kept only until the join: re-run the same command.
  To re-render one fixed shot quickly for review: `node render.js ../.work/timeline.json /tmp/shot.mp4 "A-B"`
  (frames = seconds × 30).
- Stills (`node render.js tl.json <dir> "f1,f2,…"`) are fast: use them freely while building.

## Git

- Commit and push only through `bin/push.sh <slug> <msg-file>`: it commits the video folder and this skill's records,
  rebases on `main` (the Mac's Shorts routines push there every night) and pushes to `main`. If the cloud's GitHub
  proxy refuses `main`, it pushes `claude/cp-long-<slug>` and says so: put that branch name in the report.
- **The MP4 is never committed** (`long/*/.gitignore`). A three-minute 1080p file is 60–150 MB; GitHub refuses files
  over 100 MB and every cloud run clones the whole repo. YouTube holds the video; `src/build.sh` rebuilds it from the
  folder (the voice takes are committed). `.work/` and the fetched fonts are not committed either.
- No tags, no branch deletions, no force-push to `main`.
- Never touch `videos/`, `skill/cp/` or the root README's Shorts table: they belong to the Mac's `/cp` runs.

## What only the user can do (say it in the report when it applies)

- Put or renew the four keys in the cloud environment (claude.ai/code → the environment's settings).
- Change the environment's network access.
- Allow pushes to `main` for this repo in the routine's settings, if push.sh had to use a `claude/` branch.
- In YouTube Studio: the end screen and cards, pinning the suggested comment, and a custom thumbnail if the API
  refused it.
- Buy ElevenLabs characters when quota.mjs says there are not enough.
