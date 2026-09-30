#!/bin/sh
# Return the local checkout to its light state at the end of a run. Everything lives on GitHub, so this Mac keeps
# only a blobless, sparse clone with the code checked out: finished media, soundtracks, libraries and scratch go.
# It changes nothing while anything is unsaved: uncommitted or untracked files, commits that aren't on GitHub,
# stashes or other branches. It also refuses to delete a key file (.env).
# usage: cleanup.sh            (the skill runs it last, after the push; safe to run any time)
#        cleanup.sh --check    (only say whether the checkout is clean and pushed)
REPO="${CP_REPO:-$HOME/Desktop/curiopulse}"
LIGHT="skill"                            # checked out between runs, plus the top-level files
GROWTH_KB=5120                           # .git this far past its fresh-clone size holds pushed media: re-clone

say() { echo "cleanup: $*"; }
mb() { awk -v k="$1" 'BEGIN { printf (k < 10240 ? "%.1f MB" : "%.0f MB"), k / 1024 }'; }
[ -d "$REPO/.git" ] || { say "no checkout at $REPO; nothing to clean"; exit 0; }
cd "$REPO" || exit 1
BEFORE=$(du -sk . | cut -f1)

# 1. Is everything on GitHub?
git fetch -q origin || { say "can't reach GitHub, so nothing was cleaned"; exit 1; }
BRANCH=$(git rev-parse --abbrev-ref HEAD)
[ "$BRANCH" = main ] || { say "on branch $BRANCH, not main; nothing was cleaned"; exit 1; }
DIRTY=$(git -c core.quotePath=false status --porcelain --untracked-files=all)
if [ -n "$DIRTY" ]; then say "unsaved work, so nothing was cleaned (commit and push it first):"; echo "$DIRTY" | head -20; exit 1; fi
if ! git merge-base --is-ancestor HEAD origin/main; then
  say "$(git rev-list --count origin/main..HEAD) commit(s) aren't on GitHub yet; push first. Nothing was cleaned"; exit 1
fi
[ -z "$(git stash list)" ] || { say "there are stashes; nothing was cleaned"; exit 1; }
for b in $(git for-each-ref --format='%(refname:short)' refs/heads); do
  git merge-base --is-ancestor "$b" origin/main || { say "branch $b has commits that aren't on GitHub; nothing was cleaned"; exit 1; }
done
KEYS=$(git ls-files --others --ignored --exclude-standard | grep -E '(^|/)\.env' || true)
[ -z "$KEYS" ] || { say "a key file is inside the checkout, so nothing was cleaned: $KEYS"; exit 1; }
if [ "$1" = "--check" ]; then say "clean and pushed ($(git rev-parse --short HEAD)); $(mb "$BEFORE") on disk"; exit 0; fi

# 2. Delete the build products (libraries, renders, stills, caches: everything .gitignore lists).
git ls-files -z --others --ignored --exclude-standard --directory | xargs -0 rm -rf --

# 3. Check out only the light set. Git removes the rest of the files; all of them are on GitHub.
git sparse-checkout set $LIGHT
git sparse-checkout reapply

# 4. Drop the local copies of pushed media from .git: clone light again next to it, then swap.
#    .git/light-kb holds the size of the last fresh clone (commits and trees only; under 1 MB).
BASE_KB=$(cat .git/light-kb 2>/dev/null || echo 0)
if [ "$(du -sk .git | cut -f1)" -gt $((BASE_KB + GROWTH_KB)) ]; then
  URL=$(git remote get-url origin)
  WANT=$(git rev-parse origin/main)
  NAME=$(git config --local user.name || true)
  EMAIL=$(git config --local user.email || true)
  NEW="$REPO.light-$$"
  OLD="$REPO.old-$$"
  cd "$(dirname "$REPO")" || exit 1
  rm -rf "$NEW"
  if git clone -q --filter=blob:none --sparse "$URL" "$NEW" && git -C "$NEW" sparse-checkout set $LIGHT &&
     [ "$(git -C "$NEW" rev-parse HEAD)" = "$WANT" ]; then
    [ -n "$NAME" ] && git -C "$NEW" config user.name "$NAME"
    [ -n "$EMAIL" ] && git -C "$NEW" config user.email "$EMAIL"
    du -sk "$NEW/.git" | cut -f1 > "$NEW/.git/light-kb"
    mv "$REPO" "$OLD" && mv "$NEW" "$REPO" && rm -rf "$OLD"
  else
    rm -rf "$NEW"
    say "couldn't make a fresh light clone; kept the current one (its .git stays large)"
  fi
fi

AFTER=$(du -sk "$REPO" | cut -f1)
say "$REPO: $(mb "$BEFORE") → $(mb "$AFTER"). Checked out: $LIGHT and the top-level files; everything else is on GitHub ($(git -C "$REPO" rev-parse --short HEAD))"
