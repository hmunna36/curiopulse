# Source this for manual commands in a CurioPulse video folder:  . ~/.claude/skills/cp/bin/cp-env.sh
# (build.sh picks the same toolchain up by itself.)
export CP_CACHE="$HOME/.cache/cp"
export CP_REPO="${CP_REPO:-$HOME/Desktop/curiopulse}"
export PATH="$CP_CACHE/bin:$PATH"
export NODE_PATH="$CP_CACHE/node/node_modules"
export PYTHON="$CP_CACHE/venv/bin/python3"
export ELEVENLABS_ENV_FILE="${ELEVENLABS_ENV_FILE:-$HOME/.config/va/elevenlabs.env}"
alias py="$PYTHON"
