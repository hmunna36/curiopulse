# Source this before any manual command in a long-form video folder:  . .claude/skills/cp-long/bin/env.sh
# (src/build.sh sources it by itself.) It finds the toolchain on either machine and never prints a key.
#   cloud machine: ~/.cache/cpl, installed by bin/cloud-setup.sh (venv, node_modules, Chromium path)
#   the /cp Mac:   ~/.cache/cp  (the Shorts toolchain)
_cpl_here="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
export CPL_SKILL="$(cd "$_cpl_here/.." && pwd)"
export CP_REPO="${CP_REPO:-$(cd "$CPL_SKILL/../../.." && pwd)}"
export CPL_HOME="${CPL_HOME:-$HOME/.cache/cpl}"
if [ -x "$CPL_HOME/venv/bin/python3" ]; then
  export PATH="$CPL_HOME/bin:$PATH"
  export NODE_PATH="$CPL_HOME/node/node_modules"
  export PYTHON="$CPL_HOME/venv/bin/python3"
  [ -z "${CHROME_PATH:-}" ] && [ -s "$CPL_HOME/chrome-path" ] && export CHROME_PATH="$(cat "$CPL_HOME/chrome-path")"
elif [ -x "$HOME/.cache/cp/venv/bin/python3" ]; then
  export PATH="$HOME/.cache/cp/bin:$PATH"
  export NODE_PATH="${NODE_PATH:-$HOME/.cache/cp/node/node_modules}"
  export PYTHON="$HOME/.cache/cp/venv/bin/python3"
  [ -z "${ELEVENLABS_API_KEY:-}" ] && export ELEVENLABS_ENV_FILE="${ELEVENLABS_ENV_FILE:-$HOME/.config/va/elevenlabs.env}"
else
  export PYTHON="${PYTHON:-python3}"
fi
export RENDER_JOBS="${RENDER_JOBS:-$( (nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 2) | awk '{n=$1-1; if(n<1)n=1; if(n>6)n=6; print n}')}"
unset _cpl_here
