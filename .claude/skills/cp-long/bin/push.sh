#!/usr/bin/env bash
# Commit and push a long-form video's folder plus the skill's own records (topics.md, reference/videos.md).
# usage: push.sh <slug> <commit-message-file>
# The MP4 is never committed (long/*/.gitignore): it lives on YouTube and src/build.sh rebuilds it.
# It pushes to main. Other runs (the Shorts routines on the Mac) push to main too, so it rebases first. If main is
# refused (the cloud's GitHub proxy can restrict a session to claude/ branches), it pushes claude/cp-long-<slug>
# instead and says so: report that branch, the user merges it.
set -euo pipefail
SLUG="${1:-}"; MSG="${2:-}"
if [ -z "$SLUG" ] || [ ! -f "$MSG" ]; then echo "usage: push.sh <slug> <commit-message-file>"; exit 2; fi
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$SKILL/../../.." && pwd)"
cd "$REPO"
git config user.name >/dev/null 2>&1 || git config user.name "CurioPulse routine"
git config user.email >/dev/null 2>&1 || git config user.email "curiopulse-routine@users.noreply.github.com"
big="$(find "long/$SLUG" -type f -size +40M ! -name '*.mp4' ! -path '*/.work/*' | head -3)"
if [ -n "$big" ]; then echo "refusing: files over 40 MB would be committed:"; echo "$big"; exit 1; fi
if grep -rIl -E 'sk_[a-f0-9]{32,}|GOCSPX-|1//0[A-Za-z0-9_-]{30,}' "long/$SLUG" .claude/skills/cp-long --exclude-dir=.work --exclude-dir=vendor 2>/dev/null | grep -v 'bin/push.sh$' | head -3 | grep -q .; then
  echo "refusing: something that looks like a key is in the files to commit"; exit 1
fi
git add "long/$SLUG" .claude/skills/cp-long long/README.md 2>/dev/null || git add "long/$SLUG" .claude/skills/cp-long
if git diff --cached --quiet; then echo "nothing to commit"; else git commit -q -F "$MSG"; fi
push_main() { git pull -q --rebase --autostash origin main && git push -q origin HEAD:refs/heads/main; }
if push_main || { sleep 5; push_main; }; then
  echo "pushed to main: $(git log --oneline -1 | cut -c1-80)"
else
  git rebase --abort 2>/dev/null || true
  BR="claude/cp-long-$SLUG"
  git push -q -f origin "HEAD:refs/heads/$BR" && echo "main was refused: pushed to branch $BR (the user merges it)" || { echo "push failed"; exit 1; }
fi
