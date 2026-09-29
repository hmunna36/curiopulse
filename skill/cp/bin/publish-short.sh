#!/bin/sh
# Commit a finished Short to github.com/hmunna36/curiopulse, push it, and prove the push is complete.
# usage: publish-short.sh <slug> <commit-message-file>   (commits videos/<slug> and the root README)
#        publish-short.sh <slug> --free                  (after the uploads: drops the folder from this Mac;
#                                                          everything stays on GitHub)
set -e
SLUG="$1"
REPO="${CP_REPO:-$HOME/Desktop/curiopulse}"
DEST="$REPO/videos/$SLUG"
[ -d "$DEST" ] || { echo "no video at $DEST"; exit 1; }
cd "$REPO"
if [ "$2" = "--free" ]; then
  git fetch -q origin
  if [ -n "$(git status --porcelain -- "videos/$SLUG")" ] || [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
    echo "not freeing: videos/$SLUG has unpushed changes"; exit 1
  fi
  if [ -f "$HOME/.config/cp/ig-queue.json" ] && node -e '
const q = require(process.argv[1]), s = process.argv[2];
const p = (q.posts || []).find((x) => x.slug === s && !["published", "cancelled"].includes(x.status));
process.exit(p && !require("fs").existsSync(p.spool) ? 0 : 1)' "$HOME/.config/cp/ig-queue.json" "$SLUG"; then
    echo "not freeing: its Instagram Reel is queued but the spool copy is missing (run ig.mjs queue again first)"; exit 1
  fi
  STAMP=$(date +%Y%m%d-%H%M%S)
  for d in .work src/fonts src/__pycache__; do
    [ -e "$DEST/$d" ] && mv "$DEST/$d" "$HOME/.Trash/curiopulse-$SLUG-$(echo $d | tr / -)-$STAMP"
  done
  git sparse-checkout set $(git sparse-checkout list | grep -vx "videos/$SLUG")
  [ -d "$DEST" ] && rmdir "$DEST" 2>/dev/null || true
  echo "videos/$SLUG removed from this Mac (on GitHub; bring it back with: git -C $REPO sparse-checkout add videos/$SLUG)"
  exit 0
fi
MSG="$2"
[ -f "$MSG" ] || { echo "usage: publish-short.sh <slug> <commit-message-file>"; exit 2; }
# never commit keys or oversized files
if git ls-files --others --exclude-standard -- "videos/$SLUG" | grep -E '(^|/)\.env' ; then echo "refusing: an .env file is not ignored"; exit 1; fi
if grep -rIlE 'sk_[a-f0-9]{30,}|IG[A-Za-z0-9_-]{100,}|EAA[A-Za-z0-9]{60,}|ya29\.[A-Za-z0-9_-]{20,}|"refresh_token"' "$DEST" --exclude-dir=.work --exclude-dir=fonts 2>/dev/null; then
  echo "refusing: something that looks like a key or token is in the files above"; exit 1
fi
BIG=$(find "$DEST" -path "$DEST/.work" -prune -o -type f -size +95M -print)
[ -z "$BIG" ] || { echo "refusing: over 95 MB (GitHub rejects files over 100 MB): $BIG"; exit 1; }
git add -- "videos/$SLUG" README.md
if git diff --cached --quiet; then echo "nothing new to commit in videos/$SLUG"; else git commit -q -F "$MSG"; fi
git push -q origin HEAD:main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git ls-remote origin refs/heads/main | cut -f1)
[ "$LOCAL" = "$REMOTE" ] || { echo "push mismatch: local $LOCAL, remote $REMOTE"; exit 1; }
echo "pushed videos/$SLUG: $(git ls-files -- "videos/$SLUG" | wc -l | tr -d ' ') files, commit $(git rev-parse --short HEAD) is on GitHub"
KB=$(curl -fsS https://api.github.com/repos/hmunna36/curiopulse 2>/dev/null | sed -n 's/.*"size": *\([0-9]*\).*/\1/p' | head -1)
[ -n "$KB" ] && echo "repo size on GitHub: $((KB / 1024)) MB$( [ "$KB" -gt 3500000 ] && echo ' — over 3.5 GB: time to move old MP4s to GitHub Releases (tell the user)')"
exit 0
