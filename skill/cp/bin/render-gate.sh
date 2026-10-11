#!/bin/sh
# The render gate for /cp (12 Oct 2026). Same rule as ~/.claude/skills/va/bin/wait-renders.sh (never render in parallel
# with another pipeline on this 8 GB M1), with one difference: a Blender that is only OPEN (the user's app, idle, a few
# percent of one core) is not a render. The va script matches "Blender" by name, so an idle Blender window held this
# gate shut for as long as the app stayed open. Here a Blender counts only while it uses more than 40 % of a core.
# usage: render-gate.sh [max_minutes=180]      exit 0 = nothing rendering (go), 3 = still busy at the deadline
PAT='render-chunks|remotion|chrome-headless|puppeteer|playwright|mlx_audio'
MAX="${1:-180}"
i=0
while :; do
  BUSY=$(pgrep -f "$PAT" | tr '\n' ' ')
  for p in $(pgrep -x Blender 2>/dev/null); do
    cpu=$(ps -o %cpu= -p "$p" 2>/dev/null | tr -d ' ' | cut -d. -f1)
    [ "${cpu:-0}" -ge 40 ] && BUSY="$BUSY blender:$p"
  done
  BUSY=$(echo "$BUSY" | tr -s ' ' | sed 's/^ //;s/ $//')
  if [ -z "$BUSY" ]; then echo "renders: nothing running; go ($(date '+%H:%M %Z'))"; exit 0; fi
  if [ "$i" -ge "$MAX" ]; then echo "renders: still busy after $MAX min, so nothing was started. PIDs: $BUSY"; exit 3; fi
  [ $((i % 10)) -eq 0 ] && echo "renders: waiting ($i min so far), PIDs: $BUSY"
  sleep 60
  i=$((i + 1))
done
