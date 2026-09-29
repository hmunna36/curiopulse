#!/bin/sh
# Copy this skill (~/.claude/skills/cp) into the repo's skill/cp/ and push it, so every improvement to the
# skill is versioned next to the videos. usage: backup-skill.sh <commit-message-file>
set -e
MSG="$1"
[ -f "$MSG" ] || { echo "usage: backup-skill.sh <commit-message-file>"; exit 2; }
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
REPO="${CP_REPO:-$HOME/Desktop/curiopulse}"
[ -d "$REPO/.git" ] || git clone --filter=blob:none --sparse git@github.com:hmunna36/curiopulse.git "$REPO"
cd "$REPO"
git pull --ff-only -q || true
if [ "$(git config core.sparseCheckout)" = "true" ]; then git sparse-checkout add skill; fi
mkdir -p skill/cp
rsync -a --delete --exclude '.DS_Store' --exclude '__pycache__' "$SKILL/" skill/cp/
if grep -rIlE 'sk_[a-f0-9]{30,}|IG[A-Za-z0-9_-]{100,}|EAA[A-Za-z0-9]{60,}|ya29\.[A-Za-z0-9_-]{20,}|"refresh_token": *"1' skill/cp 2>/dev/null; then echo "refusing: something that looks like a key is in the files above"; exit 1; fi
git add -A skill
if git diff --cached --quiet; then echo "skill/cp is already up to date"; exit 0; fi
git commit -q -F "$MSG"
git push -q origin HEAD:main
[ "$(git rev-parse HEAD)" = "$(git ls-remote origin refs/heads/main | cut -f1)" ] && echo "skill backed up: commit $(git rev-parse --short HEAD) is on GitHub"
