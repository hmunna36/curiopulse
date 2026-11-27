#!/usr/bin/env python3
"""vcheck.py: the shared checks, run on a FINISHED video file. One file, the same for every channel.

It measures four things a builder cannot see on contact sheets, and prints leads for the review. Nothing here blocks an
upload on its own: a line marked LOOK is a moment to open and judge, with its time.

  stills   stretches where the picture does not change (a Short: 0.6 s or more; a long video: 2.0 s or more)
  rhythm   the cuts it finds, the shot lengths, and whether they are all the same length (a metronome)
  sound    a hit far louder than the film's own loud level, and a sound louder than that level slammed in at a cut
           after quiet (normal speech after a planned silence does not count)
  words    with --keys: does the picture change just before each key word is spoken, or late, or not at all,
           compared with how often it changes at any random moment of the same film
  sfx      with --stems: which sound effects are buried under the rest of the mix (measured in each effect's own
           band of frequencies), and which jump out

usage:
  vcheck.py <video.mp4> [--kind short|long] [--hold S] [--exempt "a-b,c-d"]
            [--keys "3.42:BAM,ear,test#2"] [--words words.json] [--words-offset S]
            [--stems "sfx=stems/sfx.wav,rest=stems/voice.wav+stems/music.wav"]
            [--cutsheet out/qa/cuts.png] [--json out/qa/vcheck.json] [--strict]

  --keys     key moments, comma separated. "3.42" or "3.42:label" is a time in the film. A bare word is looked up in
             --words (first time it is spoken; "word#2" = the second time).
  --words    any JSON holding words with start times: a list of {w|word|text, s|start|t|t0}, the same nested anywhere,
             or an ElevenLabs alignment ({characters, character_start_times_seconds}). --words-offset shifts them when
             the narration does not start at 0 in the film.
  --exempt   time ranges to leave out of the stills check (a planned freeze, an end card), in seconds.
  --cutsheet writes sheets of six small frames around every cut (2 before, the cut, 3 after) to Read: text left over
             from the last shot, a label fading at the wrong size, two texts on top of each other.
  --strict   exit 1 when anything is marked LOOK (default: always exit 0, the report is advice).

Needs python3 with numpy, and an ffmpeg ($FFMPEG, PATH, ~/.cache/cp/bin, or a Remotion compositor folder). Pillow only
for --cutsheet. Where the numbers come from: reference/checks.md beside this script's copy in each skill.
"""
import json
import math
import os
import re
import shutil
import subprocess
import sys

import numpy as np

AFPS = 30                      # frames a second the picture is analysed at (a 60 fps film is read at 30)
LONG_SIDE = 160                # the picture is shrunk to this many pixels on its long side
LAG_S = 0.2                    # a frame is "still" when it matches the frame this long before it


def find_ffmpeg():
    cands = [os.environ.get('FFMPEG'), shutil.which('ffmpeg'), os.path.expanduser('~/.cache/cp/bin/ffmpeg')]
    for base in ('.', os.path.expanduser('~/.cache/remotion-plus'), os.path.expanduser('~/.cache/va')):
        root = os.path.join(base, 'node_modules', '@remotion')
        if os.path.isdir(root):
            for d in sorted(os.listdir(root)):
                if d.startswith('compositor-'):
                    cands.append(os.path.join(root, d, 'ffmpeg'))
    for c in cands:
        if c and os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    sys.exit('vcheck: no ffmpeg found (set $FFMPEG)')


def ff_env(ff):
    env = dict(os.environ)
    d = os.path.dirname(os.path.abspath(ff))
    if 'compositor-' in d:                       # Remotion's build keeps its libraries beside the binary
        for k in ('DYLD_LIBRARY_PATH', 'LD_LIBRARY_PATH'):
            env[k] = d + (os.pathsep + env[k] if env.get(k) else '')
    return env


def probe(ff, path):
    out = subprocess.run([ff, '-hide_banner', '-i', path], capture_output=True, text=True, env=ff_env(ff)).stderr
    m = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', out)
    v = re.search(r'Video: .*?, (\d{2,5})x(\d{2,5})[ ,\[].*?([\d.]+) fps', out)
    if not m or not v:
        sys.exit('vcheck: could not read ' + path + '\n' + out[-400:])
    dur = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))
    return {'duration': dur, 'w': int(v.group(1)), 'h': int(v.group(2)), 'fps': float(v.group(3)),
            'audio': 'Audio:' in out}


def small_size(w, h, long_side):
    s = long_side / max(w, h)
    return max(2, int(round(w * s / 2)) * 2), max(2, int(round(h * s / 2)) * 2)


def is_cut(c_prev, c, c_next):
    return c >= 0.35 and c >= 3 * max(c_prev, c_next, 0.01)


def picture_pass(ff, path, info, want_sheet):
    """ONE read of the film at 320 px on its long side. Per analysed frame: the share of pixels that changed since the
    frame before (chg1) and since LAG_S before (chgL), with the mean change (madL). Cuts are found on the way, and when
    a sheet is wanted the six frames around each cut are kept (2 before, 1 before, the cut, +1, +2, +4)."""
    w, h = small_size(info['w'], info['h'], 320)
    lag = max(1, int(round(LAG_S * AFPS)))
    p = subprocess.Popen([ff, '-v', 'error', '-i', path, '-an', '-vf', 'scale=%d:%d' % (w, h), '-r', str(AFPS),
                          '-pix_fmt', 'rgb24', '-c:v', 'rawvideo', '-f', 'image2pipe', '-'],
                         stdout=subprocess.PIPE, env=ff_env(ff))
    n = w * h * 3
    ring, raws, chg1, chgL, madL, cuts, shots, pending = [], [], [], [], [], [], {}, {}
    i = 0
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        rgb = np.frombuffer(buf, np.uint8).reshape(h, w, 3)
        f = rgb.reshape(h // 2, 2, w // 2, 2, 3).mean(axis=(1, 3, 4)).astype(np.int16).ravel()   # 160 px grey
        if ring:
            chg1.append(float((np.abs(f - ring[-1]) > 12).mean()))
            dl = np.abs(f - ring[0]) if len(ring) >= lag else None
            chgL.append(float((dl > 10).mean()) if dl is not None else 1.0)
            madL.append(float(dl.mean()) if dl is not None else 99.0)
        else:
            chg1.append(1.0); chgL.append(1.0); madL.append(99.0)
        ring.append(f)
        if len(ring) > lag:
            ring.pop(0)
        if want_sheet:
            raws.append((i, buf))
            if len(raws) > 5:
                raws.pop(0)
            for key in pending.pop(i, []):
                shots[key] = buf
        c = i - 1                                   # frame c can be judged now that frame i is known
        if c >= 2 and is_cut(chg1[c - 1], chg1[c], chg1[i]) and (not cuts or c - cuts[-1] >= AFPS * 0.2):
            cuts.append(c)
            if want_sheet:
                ci, have = len(cuts) - 1, dict(raws)
                for oi, o in enumerate((-2, -1, 0, 1, 2, 4)):
                    if c + o in have:
                        shots[(ci, oi)] = have[c + o]
                    elif c + o > i:
                        pending.setdefault(c + o, []).append((ci, oi))
        i += 1
    p.wait()
    return np.array(chg1), np.array(chgL), np.array(madL), lag, cuts, shots, (w, h)


def parse_ranges(s):
    out = []
    for part in (s or '').split(','):
        m = re.match(r'\s*([\d.]+)\s*-\s*([\d.]+)\s*$', part)
        if m:
            out.append((float(m.group(1)), float(m.group(2))))
    return out


def find_holds(chgL, madL, lag, min_s, exempt):
    still = (chgL < 0.002) & (madL < 0.4)
    holds, i, n = [], 0, len(still)
    while i < n:
        if still[i]:
            j = i
            while j + 1 < n and still[j + 1]:
                j += 1
            t0, t1 = max(0, i - lag) / AFPS, (j + 1) / AFPS
            if t1 - t0 >= min_s and not any(a <= t0 and t1 <= b for a, b in exempt):
                holds.append((round(t0, 2), round(t1, 2)))
            i = j + 1
        else:
            i += 1
    return holds


def read_audio(ff, path, sr=22050):
    raw = subprocess.run([ff, '-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', str(sr), '-c:a', 'pcm_s16le',
                          '-f', 'wav', '-'], capture_output=True, env=ff_env(ff)).stdout
    at = raw.find(b'data')
    body = raw[at + 8:] if at >= 0 else b''
    body = body[:len(body) // 2 * 2]
    return np.frombuffer(body, np.int16).astype(np.float32) / 32768.0, sr


def hop_power(x, sr, hop_s=0.05):
    hop = int(sr * hop_s)
    n = len(x) // hop
    return (x[:n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12, hop_s


def db(p):
    return 10 * np.log10(np.maximum(p, 1e-12))


def sound_checks(x, sr, cuts):
    """Spikes: a 100 ms stretch more than 6 dB over the film's own loud level (the 95th percentile of its 400 ms
    levels). Slams: at a cut, the 150 ms after is 12 dB or more over the 400 ms before AND 3 dB or more over the loud
    level (speech at its normal level after a planned silence is not a slam)."""
    pw, hs = hop_power(x, sr)
    if len(pw) < 20:
        return {'loud_level_db': None, 'spikes': [], 'slams': []}
    k8 = np.convolve(pw, np.ones(8) / 8, mode='same')
    k2 = np.convolve(pw, np.ones(2) / 2, mode='same')
    live = db(k8) > -50
    loud = float(np.percentile(db(k8)[live], 95)) if live.any() else -60.0
    over = db(k2) - loud
    spikes, i = [], 0
    while i < len(over):
        if over[i] > 6:
            j = i
            while j + 1 < len(over) and over[j + 1] > 6:
                j += 1
            spikes.append({'t': round(i * hs, 2), 'over_db': round(float(over[i:j + 1].max()), 1)})
            i = j + 1
        else:
            i += 1
    slams = []
    for c in cuts:
        h = int(round(c / AFPS / hs))
        if h - 8 < 0 or h + 3 > len(pw):
            continue
        before, after = db(pw[h - 8:h].mean()), db(pw[h:h + 3].mean())
        if after - before >= 12 and after >= loud + 3:
            slams.append({'t': round(c / AFPS, 2), 'jump_db': round(float(after - before), 1)})
    return {'loud_level_db': round(loud, 1), 'spikes': spikes, 'slams': slams}


WORD_KEYS = ('w', 'word', 'text')
TIME_KEYS = ('s', 'start', 't', 't0', 'start_s', 'startTime')


def collect_words(node, out):
    if isinstance(node, dict):
        if 'characters' in node and 'character_start_times_seconds' in node:
            word, t0 = '', None
            for ch, t in zip(node['characters'], node['character_start_times_seconds']):
                if ch.strip():
                    if not word:
                        t0 = t
                    word += ch
                elif word:
                    out.append((word, float(t0))); word = ''
            if word:
                out.append((word, float(t0)))
            return
        wk = next((k for k in WORD_KEYS if isinstance(node.get(k), str)), None)
        tk = next((k for k in TIME_KEYS if isinstance(node.get(k), (int, float))), None)
        if wk and tk and ' ' not in node[wk].strip():
            out.append((node[wk], float(node[tk])))
            return
        for v in node.values():
            collect_words(v, out)
    elif isinstance(node, list):
        for v in node:
            collect_words(v, out)


def norm(w):
    return re.sub(r"[^a-z0-9']", '', w.lower())


def parse_keys(spec, words_path, offset):
    words = []
    if words_path:
        collect_words(json.load(open(words_path)), words)
        words = [(norm(w), t + offset) for w, t in words]
    keys, missing = [], []
    for part in [p.strip() for p in (spec or '').split(',') if p.strip()]:
        m = re.match(r'^([\d.]+)(?::(.*))?$', part)
        if m:
            keys.append({'t': float(m.group(1)), 'label': m.group(2) or m.group(1)})
            continue
        m = re.match(r'^(.*?)(?:#(\d+))?$', part)
        want, nth = norm(m.group(1)), int(m.group(2) or 1)
        hits = [t for w, t in words if w == want]
        if len(hits) >= nth:
            keys.append({'t': round(hits[nth - 1], 3), 'label': part})
        else:
            missing.append(part)
    return keys, missing


def classify(chg1, t):
    """hit: something lands on the word. Either the picture changes clearly more in the 0.35 s before the word (to
    0.07 s after) than in the second before that (a pop, a cut, a thing drawn on), or a move that was running stops on
    the word (a camera arriving). late: the change only comes in the half second after. miss: neither.
    The floor is 0.15 % of the picture, so a small label landing on a calm diagram counts."""
    i = int(round(t * AFPS))
    pre = chg1[max(0, i - int(1.2 * AFPS)):max(1, i - int(0.35 * AFPS))]
    win = chg1[max(0, i - int(0.35 * AFPS)):i + int(0.07 * AFPS) + 1]
    late = chg1[i + int(0.07 * AFPS) + 1:i + int(0.5 * AFPS) + 1]
    if len(win) == 0 or len(pre) == 0:
        return 'miss'
    base = float(np.median(pre))
    bar = max(3 * base, base + 0.0015)
    if float(win.max()) >= bar:
        return 'hit'
    after = chg1[i + int(0.07 * AFPS) + 1:i + int(0.35 * AFPS) + 1]
    if base >= 0.01 and len(after) and float(after.mean()) <= 0.35 * base:
        return 'hit'                                  # a running move came to rest on the word
    if len(late) and float(late.max()) >= bar:
        return 'late'
    return 'miss'


def word_checks(chg1, keys, duration):
    for k in keys:
        k['result'] = classify(chg1, k['t'])
    taken = [k['t'] for k in keys]
    grid = [t for t in np.arange(1.3, max(1.3, duration - 0.6), 0.25) if all(abs(t - kt) > 0.4 for kt in taken)]
    chance = (sum(classify(chg1, t) == 'hit' for t in grid) / len(grid)) if grid else 0.0
    rate = (sum(k['result'] == 'hit' for k in keys) / len(keys)) if keys else 0.0
    return {'keys': keys, 'hit_rate': round(rate, 2), 'chance_rate': round(chance, 2)}


def read_wav_any(ff, path, sr=22050):
    return read_audio(ff, path, sr)[0]


def sfx_checks(ff, spec):
    """Each sound effect found in the sfx stem: how many dB it adds to the rest of the mix in its first 0.3 s, measured
    inside the effect's own band (the frequencies holding the middle 70 % of its energy).
    Under 3 dB it is buried. It jumps out when it adds more than 12 dB AND is within 6 dB of the film's own loud level
    (a quiet effect in a silence adds a lot and is fine)."""
    paths = dict(p.split('=', 1) for p in spec.split(',') if '=' in p)
    if 'sfx' not in paths or 'rest' not in paths:
        return {'error': 'needs sfx=<file> and rest=<file>'}
    sr = 22050
    s = read_wav_any(ff, paths['sfx'], sr)
    parts = [read_wav_any(ff, q, sr) for q in paths['rest'].split('+')]      # rest=voice.wav+music.wav+amb.wav
    n = min([len(s)] + [len(q) for q in parts])
    r = np.sum([q[:n] for q in parts], axis=0)
    s = s[:n]
    ps, hs = hop_power(s, sr, 0.02)
    pr, _ = hop_power(r, sr, 0.02)
    lvl = db(ps)
    hop, events, i, quiet = int(sr * 0.02), [], 0, 6
    while i < len(lvl):
        if lvl[i] > -45 and (i < quiet or (lvl[i - quiet:i] < -45).all()):
            a, b = i, min(len(lvl), i + 15)
            fs_, fr_ = (np.abs(np.fft.rfft(q[a * hop:b * hop] * np.hanning((b - a) * hop))) ** 2 for q in (s, r))
            cum = np.cumsum(fs_) / (fs_.sum() + 1e-20)
            lo, hi = int(np.searchsorted(cum, 0.15)), int(np.searchsorted(cum, 0.85)) + 1     # the band holding its middle 70 %
            es, er = fs_[lo:hi].sum(), fr_[lo:hi].sum() + 1e-20
            lift = float(10 * np.log10((es + er) / er))
            events.append({'t': round(i * hs, 2), 'lift_db': round(lift, 1), 'level_db': round(float(db(ps[a:b].mean())), 1),
                           'band_hz': [int(lo * sr / ((b - a) * hop)), int(hi * sr / ((b - a) * hop))]})
            i = b
        else:
            i += 1
    win = np.convolve(pr, np.ones(15) / 15, mode='same')
    loud = float(np.percentile(db(win)[db(win) > -50], 95)) if (db(win) > -50).any() else -60.0
    return {'events': len(events), 'buried': [e for e in events if e['lift_db'] < 3.0],
            'jumps_out': [e for e in events if e['lift_db'] > 12.0 and e['level_db'] >= loud - 6]}


def cut_sheets(cuts, shots, size, out_png):
    try:
        from PIL import Image, ImageDraw
    except Exception:
        return 'no Pillow: cut sheets skipped'
    if not cuts:
        return 'no cuts: no sheet'
    w, h = size
    per, pad, lab, cols = 10, 6, 16, 6
    base, ext = os.path.splitext(out_png)
    os.makedirs(os.path.dirname(os.path.abspath(out_png)), exist_ok=True)
    files = []
    for s0 in range(0, len(cuts), per):
        rows = cuts[s0:s0 + per]
        sheet = Image.new('RGB', (pad + cols * (w + pad), pad + len(rows) * (h + lab + pad)), (24, 24, 28))
        dr = ImageDraw.Draw(sheet)
        for ri, c in enumerate(rows):
            y = pad + ri * (h + lab + pad)
            dr.text((pad, y), 'cut at %.2f s   (frames: 2 before, 1 before, the cut, +1, +2, +4)' % (c / AFPS),
                    fill=(255, 220, 90))
            for oi in range(cols):
                buf = shots.get((s0 + ri, oi))
                if buf:
                    sheet.paste(Image.frombytes('RGB', (w, h), buf), (pad + oi * (w + pad), y + lab))
        name = '%s_%02d%s' % (base, s0 // per + 1, ext or '.png')
        sheet.save(name)
        files.append(name)
    return files


def main():
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'):
        print(__doc__); return 0
    opts = {'kind': 'short', 'hold': None, 'exempt': '', 'keys': '', 'words': None, 'words-offset': '0', 'stems': None,
            'cutsheet': None, 'json': None}
    strict, path, i = False, None, 0
    while i < len(a):
        if a[i] == '--strict':
            strict = True
        elif a[i].startswith('--') and a[i][2:] in opts:
            opts[a[i][2:]] = a[i + 1]; i += 1
        elif a[i].startswith('--') and '=' in a[i] and a[i][2:].split('=')[0] in opts:
            k, v = a[i][2:].split('=', 1); opts[k] = v
        elif path is None:
            path = a[i]
        else:
            sys.exit('vcheck: unknown argument ' + a[i])
        i += 1
    if not path or not os.path.isfile(path):
        sys.exit('vcheck: no such video: %s' % path)
    ff = find_ffmpeg()
    info = probe(ff, path)
    kind = opts['kind'] if opts['kind'] in ('short', 'long') else 'short'
    hold_s = float(opts['hold']) if opts['hold'] else (0.6 if kind == 'short' else 2.0)
    looks, rep = [], {'file': path, 'kind': kind, 'info': info}
    print('vcheck %s  (%s, %dx%d, %.2f fps, %.1f s)' % (os.path.basename(path), kind, info['w'], info['h'],
                                                        info['fps'], info['duration']))

    chg1, chgL, madL, lag, cuts, shots_px, size = picture_pass(ff, path, info, bool(opts['cutsheet']))

    holds = find_holds(chgL, madL, lag, hold_s, parse_ranges(opts['exempt']))
    rep['stills'] = {'bar_s': hold_s, 'holds': holds}
    if holds:
        worst = max(b - a_ for a_, b in holds)
        print('  stills  LOOK  %d stretch(es) of %.1f s or more with no change in the picture (longest %.1f s):'
              % (len(holds), hold_s, worst))
        for a_, b in holds[:40]:
            print('            %.2f-%.2f s  (%.1f s)' % (a_, b, b - a_))
        looks.append('stills')
    else:
        print('  stills  ok    no stretch of %.1f s or more without a change' % hold_s)

    edges = [0] + cuts + [len(chg1)]
    shots = [(edges[k + 1] - edges[k]) / AFPS for k in range(len(edges) - 1)]
    mean = sum(shots) / len(shots)
    cv = (math.sqrt(sum((s - mean) ** 2 for s in shots) / len(shots)) / mean) if mean else 0.0
    rep['rhythm'] = {'cuts': [round(c / AFPS, 2) for c in cuts], 'shots': len(shots), 'mean_s': round(mean, 2),
                     'longest_s': round(max(shots), 2), 'variety': round(cv, 2)}
    flag = len(shots) >= 6 and cv < 0.25
    print('  rhythm  %s  %d hard cuts found, average shot %.1f s, longest %.1f s, variety %.2f%s'
          % ('LOOK' if flag else 'ok  ', len(cuts), mean, max(shots), cv,
             ' (under 0.25: the cuts come at an even beat, like a metronome)' if flag else ''))
    if flag:
        looks.append('rhythm')

    if info['audio']:
        x, sr = read_audio(ff, path)
        snd = sound_checks(x, sr, cuts)
        rep['sound'] = snd
        if snd['loud_level_db'] is None:
            print('  sound   -     too little audio to measure')
        elif snd['spikes'] or snd['slams']:
            print('  sound   LOOK  loud level %.1f dB; %d hit(s) more than 6 dB over it, %d loud slam(s) at a cut:'
                  % (snd['loud_level_db'], len(snd['spikes']), len(snd['slams'])))
            for s in snd['spikes'][:20]:
                print('            %.2f s  a hit %.1f dB over the loud level' % (s['t'], s['over_db']))
            for s in snd['slams'][:20]:
                print('            %.2f s  +%.1f dB across the cut' % (s['t'], s['jump_db']))
            looks.append('sound')
        else:
            print('  sound   ok    no hit more than 6 dB over the loud level (%.1f dB), no slam at a cut'
                  % snd['loud_level_db'])
    else:
        print('  sound   -     the file has no audio')

    if opts['keys']:
        keys, missing = parse_keys(opts['keys'], opts['words'], float(opts['words-offset']))
        wc = word_checks(chg1, keys, info['duration'])
        wc['not_found'] = missing
        rep['words'] = wc
        n, hit = len(keys), sum(k['result'] == 'hit' for k in keys)
        late = [k for k in keys if k['result'] == 'late']
        miss = [k for k in keys if k['result'] == 'miss']
        flag = n > 0 and (wc['hit_rate'] < 0.7 or wc['hit_rate'] - wc['chance_rate'] < 0.2)
        print('  words   %s  the picture lands on %d of %d key words (%.0f %%); at a random moment of this film it '
              'would on %.0f %%' % ('LOOK' if flag or missing else 'ok  ', hit, n, 100 * wc['hit_rate'],
                                    100 * wc['chance_rate']))
        for k in late:
            print('            %.2f s  "%s": the change comes AFTER the word (start the move earlier)' % (k['t'], k['label']))
        for k in miss:
            print('            %.2f s  "%s": nothing changes on this word' % (k['t'], k['label']))
        if missing:
            print('            not found in --words: ' + ', '.join(missing))
        if flag or missing:
            looks.append('words')
    else:
        print('  words   -     no --keys given (name the 6-12 words the picture must land on)')

    if opts['stems']:
        sx = sfx_checks(ff, opts['stems'])
        rep['sfx'] = sx
        if 'error' in sx:
            print('  sfx     -     ' + sx['error'])
        elif sx['buried'] or sx['jumps_out']:
            print('  sfx     LOOK  %d effect(s) found: %d buried (add under 3 dB in their own band), %d jump out:'
                  % (sx['events'], len(sx['buried']), len(sx['jumps_out'])))
            for e in sx['buried'][:30]:
                print('            %.2f s  buried, adds %.1f dB (raise it, move it into a gap, or cut it)' % (e['t'], e['lift_db']))
            for e in sx['jumps_out'][:30]:
                print('            %.2f s  jumps out, adds %.1f dB' % (e['t'], e['lift_db']))
            looks.append('sfx')
        else:
            print('  sfx     ok    %d effect(s) found, each one audible and none jumping out' % sx['events'])

    if opts['cutsheet']:
        res = cut_sheets(cuts, shots_px, size, opts['cutsheet'])
        rep['cutsheets'] = res
        print('  sheets  ' + (res if isinstance(res, str) else 'Read these, row by row: ' + ', '.join(res)))

    rep['look'] = looks
    if opts['json']:
        os.makedirs(os.path.dirname(os.path.abspath(opts['json'])), exist_ok=True)
        json.dump(rep, open(opts['json'], 'w'), indent=1)
    print('vcheck: %s' % ('nothing to look at' if not looks else 'LOOK at: ' + ', '.join(looks)))
    return 1 if (strict and looks) else 0


if __name__ == '__main__':
    sys.exit(main())
