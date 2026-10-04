#!/usr/bin/env bash
# Install the long-form toolchain on a fresh Ubuntu cloud machine (a Claude cloud routine starts from nothing every
# run). Safe to run again: every step is skipped when it is already done. Nothing here needs a key.
#   bin/cloud-setup.sh            install what is missing, then print one line per tool
# What it installs, all under ~/.cache/cpl except the system packages:
#   ffmpeg + ffprobe (apt)                         encode, probe, QA decoding
#   Python venv: numpy scipy soundfile pyloudnorm pillow certifi pedalboard faster-whisper
#   node_modules: playwright-core, and its Chromium (with the system libraries it needs) -> chrome-path
# On a Mac it does nothing (the /cp toolchain in ~/.cache/cp is used).
set -uo pipefail
CPL_HOME="${CPL_HOME:-$HOME/.cache/cpl}"
LOG="$CPL_HOME/setup.log"
mkdir -p "$CPL_HOME/bin" "$CPL_HOME/node"
if [ "$(uname -s)" != "Linux" ]; then echo "cloud-setup: not Linux, nothing to do"; exit 0; fi
SUDO=""
if [ "$(id -u)" != "0" ]; then if sudo -n true 2>/dev/null; then SUDO="sudo -n"; else SUDO="none"; fi; fi
apt_get() { if [ "$SUDO" = "none" ]; then return 1; fi; DEBIAN_FRONTEND=noninteractive $SUDO apt-get "$@" >>"$LOG" 2>&1; }
say() { echo "cloud-setup: $*"; }
: >"$LOG"

# 1. ffmpeg
if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  say "installing ffmpeg"
  apt_get update -y || apt_get update
  apt_get install -y --no-install-recommends ffmpeg || say "apt could not install ffmpeg (see $LOG)"
fi

# 2. Python
if [ ! -x "$CPL_HOME/venv/bin/python3" ]; then
  say "creating the Python venv"
  python3 -m venv "$CPL_HOME/venv" >>"$LOG" 2>&1 || { apt_get install -y python3-venv && python3 -m venv "$CPL_HOME/venv" >>"$LOG" 2>&1; }
fi
PY="$CPL_HOME/venv/bin/python3"
if ! "$PY" -c "import numpy, scipy, soundfile, pyloudnorm, PIL, certifi" 2>/dev/null; then
  say "installing the Python packages"
  "$PY" -m pip install -q --upgrade pip >>"$LOG" 2>&1
  "$PY" -m pip install -q numpy scipy soundfile pyloudnorm pillow certifi >>"$LOG" 2>&1 || say "pip failed on the core packages (see $LOG)"
fi
"$PY" -c "import pedalboard" 2>/dev/null || "$PY" -m pip install -q pedalboard >>"$LOG" 2>&1 || say "pedalboard not installed (the classic mix chain runs instead)"
if ! "$PY" -c "import faster_whisper" 2>/dev/null; then
  "$PY" -m pip install -q faster-whisper >>"$LOG" 2>&1 || say "faster-whisper not installed (qa.py skips the transcript check)"
fi

# 3. node + Chromium
if [ ! -d "$CPL_HOME/node/node_modules/playwright-core" ]; then
  say "installing playwright-core"
  (cd "$CPL_HOME/node" && npm init -y >/dev/null 2>&1 && npm install --silent --no-audit --no-fund playwright-core >>"$LOG" 2>&1) || say "npm could not install playwright-core (see $LOG)"
fi
chrome_ok() { [ -n "${1:-}" ] && [ -x "$1" ] && "$1" --version >/dev/null 2>&1; }
CH="$(cat "$CPL_HOME/chrome-path" 2>/dev/null || true)"
if ! chrome_ok "$CH"; then
  CH=""
  for c in "${CHROME_PATH:-}" "$(command -v google-chrome || true)" "$(command -v google-chrome-stable || true)" "$(command -v chromium || true)" "$(command -v chromium-browser || true)"; do
    if chrome_ok "$c"; then CH="$c"; break; fi
  done
fi
if ! chrome_ok "$CH"; then
  say "installing Chromium (playwright)"
  PW="$CPL_HOME/node/node_modules/playwright-core/cli.js"
  if [ "$SUDO" != "none" ]; then $SUDO env "PATH=$PATH" node "$PW" install-deps chromium >>"$LOG" 2>&1 || say "could not install Chromium's system libraries (see $LOG)"; fi
  node "$PW" install chromium >>"$LOG" 2>&1 || say "playwright could not download Chromium (see $LOG)"
  CH="$(NODE_PATH="$CPL_HOME/node/node_modules" node -e 'try{console.log(require("playwright-core").chromium.executablePath())}catch(e){}' 2>/dev/null)"
fi
if ! chrome_ok "$CH" && [ "$SUDO" != "none" ]; then
  say "falling back to Google Chrome's .deb"
  (cd /tmp && curl -fsSLO https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && apt_get install -y ./google-chrome-stable_current_amd64.deb) || true
  CH="$(command -v google-chrome-stable || command -v google-chrome || true)"
fi
if chrome_ok "$CH"; then echo "$CH" >"$CPL_HOME/chrome-path"; else rm -f "$CPL_HOME/chrome-path"; fi

# 4. the speech model for the transcript check (optional)
"$PY" - >>"$LOG" 2>&1 <<'PYEOF' || say "the faster-whisper model could not be loaded (qa.py will skip the transcript check)"
from faster_whisper import WhisperModel
WhisperModel("base.en", device="cpu", compute_type="int8")
PYEOF

# 5. report
ok=1
line() { printf '  %-14s %s\n' "$1" "$2"; }
command -v ffmpeg >/dev/null && line ffmpeg "$(ffmpeg -hide_banner -version | head -1 | cut -c1-60)" || { line ffmpeg MISSING; ok=0; }
ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libx264 || { line libx264 MISSING; ok=0; }
command -v ffprobe >/dev/null || { line ffprobe MISSING; ok=0; }
"$PY" -c "import numpy, scipy, soundfile, pyloudnorm, PIL, certifi" 2>/dev/null && line python "$("$PY" -V 2>&1) + packages" || { line python "MISSING packages"; ok=0; }
"$PY" -c "import pedalboard" 2>/dev/null && line pedalboard ok || line pedalboard "missing (optional)"
"$PY" -c "import faster_whisper" 2>/dev/null && line whisper "faster-whisper ok" || line whisper "missing (optional)"
[ -d "$CPL_HOME/node/node_modules/playwright-core" ] && line playwright "ok (node $(node -v))" || { line playwright MISSING; ok=0; }
[ -s "$CPL_HOME/chrome-path" ] && line chrome "$("$CH" --version 2>/dev/null | cut -c1-50) at $CH" || { line chrome MISSING; ok=0; }
[ $ok = 1 ] && say "toolchain ready" || { say "toolchain INCOMPLETE; the last lines of $LOG:"; tail -25 "$LOG"; exit 1; }
