#!/bin/sh
# One /cp run at a time: the daily routine and a manual /cp must never build the same repo together. A /va run
# may work alongside (the user runs both pipelines in parallel on this Mac; they share no files, and each is only
# a little slower). A lock counts as live while its run shows signs of life: taken < 3 h ago, a voice/render job
# running, or its video folder changed in the last 90 min.
# Otherwise it's stale and the next run takes it over (and resumes that video).
# usage: run-lock.sh acquire <slug> | release | status        exit 3 = busy
LOCK="$HOME/.cache/cp/run.lock"
REPO="${CP_REPO:-$HOME/Desktop/curiopulse}"
live() {
  [ -f "$LOCK" ] || return 1
  [ -n "$(find "$LOCK" -mmin -180 2>/dev/null)" ] && return 0
  pgrep -f "curiopulse/videos/.*(render\.js|voice\.py|audio\.py|qa\.py)" >/dev/null && return 0
  S=$(sed -n 's/^slug=//p' "$LOCK")
  [ -n "$S" ] && [ -d "$REPO/videos/$S" ] &&
    [ -n "$(find "$REPO/videos/$S" -type f -mmin -90 -print 2>/dev/null | head -1)" ]
}
case "$1" in
  acquire)
    [ -n "$2" ] || { echo "usage: run-lock.sh acquire <slug>"; exit 2; }
    HELD=$(sed -n 's/^slug=//p' "$LOCK" 2>/dev/null)
    if [ "$HELD" != "$2" ] && live; then
      echo "busy: another /cp run is working on $HELD (since $(sed -n 's/^started=//p' "$LOCK"))"
      exit 3
    fi
    [ -f "$LOCK" ] && [ "$HELD" != "$2" ] && echo "taking over a stale lock: $(tr '\n' ' ' < "$LOCK")"
    mkdir -p "$(dirname "$LOCK")"
    printf 'slug=%s\nstarted=%s\n' "$2" "$(date '+%Y-%m-%d %H:%M %Z')" > "$LOCK"
    echo "locked: $2";;
  touch) [ -f "$LOCK" ] && touch "$LOCK";;
  release) rm -f "$LOCK"; echo "released";;
  status)
    if live; then echo "busy: $(tr '\n' ' ' < "$LOCK")"
    elif [ -f "$LOCK" ]; then echo "stale: $(tr '\n' ' ' < "$LOCK")"
    else echo "free"; fi;;
  *) echo "usage: run-lock.sh acquire <slug> | touch | release | status"; exit 2;;
esac
