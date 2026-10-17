#!/bin/sh
# The render gate for /cp (12 Oct 2026). Same rule as ~/.claude/skills/va/bin/wait-renders.sh (never render in parallel
# with another pipeline on this 8 GB M1), with one difference: a Blender that is only OPEN (the user's app, idle, a few
# percent of one core) is not a render. The va script matches "Blender" by name, so an idle Blender window held this
# gate shut for as long as the app stayed open. Here a Blender counts only while it uses more than 40 % of a core.
# Since 18 Oct 2026, a match that is HUNG does not count either: when none of the matching processes uses any CPU time
# over a 20 s sample, nothing is rendering (a wojak-story `remotion still` sat at 0 % CPU for five hours that night and
# held this gate shut). Those processes are only ignored and named, never stopped.
# usage: render-gate.sh [max_minutes=180]      exit 0 = nothing rendering (go), 3 = still busy at the deadline
PAT='render-chunks|remotion|chrome-headless|puppeteer|playwright|mlx_audio'
MAX="${1:-180}"
# total CPU seconds used so far by the PIDs given (ps prints [[hh:]mm:]ss.cc)
cpu_total() {
  t=0
  for p in "$@"; do
    s=$(ps -o time= -p "$p" 2>/dev/null | awk '{ n = split($1, a, ":"); v = a[n]; if (n > 1) v += 60 * a[n - 1]; if (n > 2) v += 3600 * a[n - 2]; printf "%.2f", v }')
    t=$(echo "$t + ${s:-0}" | bc)
  done
  echo "$t"
}
i=0
while :; do
  BUSY=$(pgrep -f "$PAT" | tr '\n' ' ')
  for p in $(pgrep -x Blender 2>/dev/null); do
    cpu=$(ps -o %cpu= -p "$p" 2>/dev/null | tr -d ' ' | cut -d. -f1)
    [ "${cpu:-0}" -ge 40 ] && BUSY="$BUSY blender:$p"
  done
  BUSY=$(echo "$BUSY" | tr -s ' ' | sed 's/^ //;s/ $//')
  if [ -n "$BUSY" ]; then   # hung? no CPU time at all in 20 s across every match
    PIDS=$(echo "$BUSY" | tr ' ' '\n' | sed 's/^blender://' | tr '\n' ' ')
    c0=$(cpu_total $PIDS); sleep 20; c1=$(cpu_total $PIDS)
    if [ "$(echo "$c1 - $c0 < 0.05" | bc)" = "1" ]; then
      echo "renders: the matches are idle (no CPU in 20 s; hung?), so nothing is rendering; go. Ignored PIDs: $BUSY"; exit 0
    fi
  fi
  if [ -z "$BUSY" ]; then echo "renders: nothing running; go ($(date '+%H:%M %Z'))"; exit 0; fi
  if [ "$i" -ge "$MAX" ]; then echo "renders: still busy after $MAX min, so nothing was started. PIDs: $BUSY"; exit 3; fi
  [ $((i % 10)) -eq 0 ] && echo "renders: waiting ($i min so far), PIDs: $BUSY"
  sleep 60
  i=$((i + 1))
done
