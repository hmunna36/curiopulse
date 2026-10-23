#!/bin/sh
# Rebuild the data files of the "CurioPulse retention" report (https://claude.ai/artifact/CCUbadtc58MkuDpSe1kVEN).
# Read-only on YouTube and Instagram. Writes six JSON files into OUT:
#   yt_videos.json   one row per video with a retention curve (500+ Analytics views)
#   yt_curves.json   YouTube Analytics retention, 100 points per video
#   ig_reels.json    Instagram insights per Reel, matched to its Short by caption
#   script_lines.json every caption of every Short (from the repo's .srt files)
#   yt_all.json      every public video, for the week-by-week view
#   subs_history.json subscribers by day, from this skill's numbers.jsonl
# usage: retention-data.sh <out-dir>     (the user, 24 Oct 2026: "I am doing this analysis week on week")
set -e
OUT="${1:?usage: retention-data.sh <out-dir>}"
BIN="$(cd "$(dirname "$0")" && pwd)"
REPO="${CP_REPO:-$HOME/Desktop/curiopulse}"
CACHE="$HOME/.cache/cp/retention-srt"
mkdir -p "$OUT/curves" "$CACHE"

node "$BIN/yt.mjs" analytics 120 --json > "$OUT/table.json"
node "$BIN/yt.mjs" stats 120 --json > "$OUT/stats.json"
for id in $(python3 -c "import json,sys; print(' '.join(v['id'] for v in json.load(open(sys.argv[1]))['videos'] if (v.get('views') or 0) >= 500))" "$OUT/table.json"); do
  node "$BIN/yt.mjs" analytics 1 --json --curve "$id" | python3 -c "import json,sys; json.dump(json.load(sys.stdin)['curve'] or [], open(sys.argv[1],'w'))" "$OUT/curves/$id.json" || echo "no curve for $id" >&2
done
node "$BIN/ig.mjs" insights 80 --json > "$OUT/ig.json"

# captions and publish sheets: fetched once per Short and cached (the light checkout is blobless, so each blob is a fetch)
git -C "$REPO" fetch -q origin
for f in $(git -C "$REPO" ls-tree -r --name-only origin/main videos | grep -E '/publish\.json$'); do
  s=$(basename "$(dirname "$f")")
  [ -s "$CACHE/$s.publish.json" ] || git -C "$REPO" show "origin/main:$f" > "$CACHE/$s.publish.json" 2>/dev/null || true
  [ -s "$CACHE/$s.srt" ] || git -C "$REPO" show "origin/main:videos/$s/$s.srt" > "$CACHE/$s.srt" 2>/dev/null || true
done

python3 - "$OUT" "$CACHE" "$BIN/../numbers.jsonl" <<'EOF'
import json, os, re, sys
OUT, CACHE, NUMBERS = sys.argv[1:4]
def srt(path):
    out = []
    for b in open(path, encoding='utf-8').read().strip().split('\n\n'):
        ls = b.strip().split('\n')
        if len(ls) < 3: continue
        m = re.match(r'(\d+):(\d+):(\d+)[,.](\d+) --> (\d+):(\d+):(\d+)[,.](\d+)', ls[1])
        if not m: continue
        g = list(map(int, m.groups()))
        out.append((g[0]*3600+g[1]*60+g[2]+g[3]/1000, g[4]*3600+g[5]*60+g[6]+g[7]/1000, ' '.join(ls[2:])))
    return out
st = {v['id']: v for v in json.load(open(f'{OUT}/stats.json'))['videos']}
tab = {v['id']: v for v in json.load(open(f'{OUT}/table.json'))['videos']}
ids, caps = {}, {}
for p in os.listdir(CACHE):
    if not p.endswith('.publish.json'): continue
    try: j = json.load(open(f'{CACHE}/{p}'))
    except Exception: continue
    slug = p[:-13]
    if (j.get('youtube') or {}).get('id'): ids[j['youtube']['id']] = slug
    cap = (j.get('instagram') or {}).get('caption') or ''
    if cap: caps[re.sub(r'\W+', '', cap.split('\n')[0].lower())[:30]] = slug
vids, curves, lines = [], [], []
for f in sorted(os.listdir(f'{OUT}/curves')):
    vid = f[:-5]
    c = json.load(open(f'{OUT}/curves/{f}'))
    if not c or vid not in st or vid not in tab: continue
    L, t, slug = st[vid]['seconds'], tab[vid], ids.get(vid)
    ps = f'{CACHE}/{slug}.srt' if slug else None
    cues = srt(ps) if ps and os.path.exists(ps) and os.path.getsize(ps) else []
    sub = [round(s, 1) for s, e, x in cues if 'ubscribe' in x]
    vids.append(dict(id=vid, slug=slug, title=t['title'], published=t['publishIST'], length_s=L,
        analytics_views=t['views'], live_views=st[vid]['views'], stayed_pct=t['stayedPct'], avg_view_pct=t['avgViewPct'],
        avg_view_s=t['avgViewSec'], subs_net=t['subsNet'], subs_per_1k=t['subsPer1k'], likes=t['likes'], shares=t['shares'],
        subscribe_line_s=(sub[0] if sub and sub[0] < L - 6 else None)))
    for p in c: curves.append(dict(id=vid, t_ratio=p['at'], t_s=round(p['at']*L, 2), watch=round(p['watch'], 4), relative=round(p['relative'], 4)))
    for s, e, x in cues: lines.append(dict(slug=slug, start_s=round(s, 2), end_s=round(e, 2), text=x))
reels = []
for p in json.load(open(f'{OUT}/ig.json'))['posts']:
    if p.get('type') != 'REELS': continue
    key = re.sub(r'\W+', '', (p.get('caption') or '').lower())[:30]
    reels.append(dict(media_id=p['id'], slug=caps.get(key), posted=p['at'], caption=p.get('caption') or '', views=p.get('views'), reach=p.get('reach'),
        skip_rate_pct=p.get('reels_skip_rate'), avg_watch_s=round((p.get('ig_reels_avg_watch_time') or 0)/1000, 1) or None,
        shares=p.get('shares'), saves=p.get('saved'), likes=p.get('likes'), comments=p.get('comments')))
allv = []
for v in st.values():
    if v.get('privacy') != 'public' or not v.get('seconds'): continue
    t = tab.get(v['id'], {})
    counted = (t.get('views') or 0) >= 200
    allv.append(dict(id=v['id'], title=v['title'], published=v['publishIST'][:10], length_s=v['seconds'], kind='Short' if v['seconds'] <= 90 else 'Long video',
        live_views=v['views'], analytics_views=t.get('views'), avg_view_pct=t.get('avgViewPct') if counted else None,
        stayed_pct=t.get('stayedPct') if counted else None, subs_per_1k=t.get('subsPer1k') if counted else None, subs_net=t.get('subsNet')))
subs = {}
for l in open(NUMBERS):
    try: j = json.loads(l)
    except Exception: continue
    subs[j['at'][:10]] = j['subscribers']
history = [dict(day=d, subscribers=s) for d, s in sorted(subs.items())]
for n, o in (('yt_videos', vids), ('yt_curves', curves), ('ig_reels', reels), ('script_lines', lines), ('yt_all', allv), ('subs_history', history)):
    json.dump(o, open(f'{OUT}/{n}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    print(n, len(o))
EOF
