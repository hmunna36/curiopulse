#!/usr/bin/env python3
"""YouTube Shorts safe-area mask for QA stills. No dependencies (zlib only).

The zones were measured on 30 Sep 2026 from the user's iPhone screenshot of a live Short in the YouTube app's Shorts
feed, in 1080x1920 frame coordinates (they scale with the still, so SCALE=0.4 stills work too):
  covered (tinted red): the side crop (x < 52 and x >= 1028: the player fills the screen height; taller phones crop
    more), the top band y < 375 (status bar, "Shorts" header, chip row), the right button column x >= 880 for
    y 1050-1890, and the bottom y >= 1680 (Related-video chip, channel row + Subscribe, title, progress bar).
  key-content zone (outlined green): x 100-980 for y 400-1000, x 100-870 for y 1000-1640. Text, numbers, the hook,
    captions, labels, essential diagram parts and subscribe cues stay inside it; backgrounds may bleed full-frame.

usage:
  safe-area.py overlay <still.png|jpg>... [--out DIR]   each still -> <name>.safe.png beside it (or in DIR); Read those
  safe-area.py mask [out.png] [--size WxH]              the bare RGBA mask (default safe-area-mask.png, 1080x1920)
  safe-area.py check X0 Y0 X1 Y1                         is this box (frame px) inside the key-content zone? (exit 0/1)
Decoding uses an ffmpeg when one is found ($FFMPEG, ./node_modules/@remotion/compositor-darwin-arm64,
~/.cache/va/node_modules/@remotion/compositor-darwin-arm64, ~/.cache/cp/bin/ffmpeg, PATH; Remotion's build has no
overlay filter, so the blend is always done here); without one, 8-bit PNGs are decoded in pure Python (slower).
"""
import os
import shutil
import struct
import subprocess
import sys
import zlib

FW, FH = 1080, 1920
TINT = (255, 40, 90, 105)            # covered by the YouTube UI or cropped off (alpha 105/255)
LINE = (40, 255, 110)                # the key-content zone's outline
COVERED = [                          # (x0, y0, x1, y1) in frame px, end-exclusive
    (0, 0, 52, FH), (1028, 0, FW, FH),   # side crop on a 19.5:9 iPhone
    (0, 0, FW, 375),                     # status bar 0-110, "Shorts" header 160-256, chip row 276-371
    (880, 1050, FW, 1890),               # like/dislike/comment/save/share/remix + labels, avatar/sound disc
    (0, 1680, FW, FH),                   # Related chip 1680-1740, channel row 1750-1835, title 1845-1890, progress bar
]
NAMES = ['side crop (left)', 'side crop (right)', 'top band', 'button column', 'bottom rows']
KEY = [(100, 400, 980, 1000), (100, 1000, 870, 1640)]   # the key-content zone = the union of these boxes
OUTLINE = [(100, 400, 980, 400), (980, 400, 980, 1000), (870, 1000, 980, 1000), (870, 1000, 870, 1640),
           (100, 1640, 870, 1640), (100, 400, 100, 1640)]


def spans(w, h):
    """Per row: merged covered x-intervals, and outline x-intervals, at w x h."""
    sx, sy = w / FW, h / FH
    t = max(2, round(4 * min(sx, sy)))
    cov = [[] for _ in range(h)]
    for x0, y0, x1, y1 in COVERED:
        a, b = round(x0 * sx), min(w, round(x1 * sx))
        for y in range(round(y0 * sy), min(h, round(y1 * sy))):
            cov[y].append((a, b))
    for y in range(h):                               # merge, so overlapping zones are tinted once
        out = []
        for a, b in sorted(cov[y]):
            if out and a <= out[-1][1]:
                out[-1] = (out[-1][0], max(out[-1][1], b))
            else:
                out.append((a, b))
        cov[y] = out
    line = [[] for _ in range(h)]
    for x0, y0, x1, y1 in OUTLINE:
        a = max(0, round(x0 * sx) - t // 2)
        b = min(w, round(x1 * sx) + (t - t // 2))
        for y in range(max(0, round(y0 * sy) - t // 2), min(h, round(y1 * sy) + (t - t // 2))):
            line[y].append((a, b))
    return cov, line


def paint(rows, ch, w, h):
    """Tint the covered zones and draw the outline into RGB/RGBA rows, in place."""
    cov, line = spans(w, h)
    al = TINT[3] / 255
    tabs = [bytes(round(v * (1 - al) + c * al) for v in range(256)) for c in TINT[:3]]
    px = bytes(LINE) + (b'\xff' if ch == 4 else b'')
    for y in range(h):
        r = rows[y]
        for a, b in cov[y]:
            for k in range(3):
                r[ch * a + k:ch * b:ch] = r[ch * a + k:ch * b:ch].translate(tabs[k])
        for a, b in line[y]:
            r[ch * a:ch * b] = px * (b - a)


def make_mask(w=FW, h=FH):
    rows = [bytearray(4 * w) for _ in range(h)]
    cov, line = spans(w, h)
    tint, px = bytes(TINT), bytes(LINE) + b'\xff'
    for y in range(h):
        for a, b in cov[y]:
            rows[y][4 * a:4 * b] = tint * (b - a)
        for a, b in line[y]:
            rows[y][4 * a:4 * b] = px * (b - a)
    return rows


def write_png(path, rows, w, h, ch=4):
    raw = b''.join(b'\x00' + bytes(r) for r in rows)

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6 if ch == 4 else 2, 0, 0, 0))
                + chunk(b'IDAT', zlib.compress(raw, 3)) + chunk(b'IEND', b''))


def image_size(path):
    with open(path, 'rb') as f:
        head = f.read(26)
        if head[:8] == b'\x89PNG\r\n\x1a\n':
            return struct.unpack('>II', head[16:24])
        if head[:2] == b'\xff\xd8':      # JPEG: walk the markers to the SOF
            f.seek(2)
            while True:
                m = f.read(2)
                if len(m) < 2 or m[0] != 0xFF:
                    break
                ln = struct.unpack('>H', f.read(2))[0]
                if m[1] in (0xC0, 0xC1, 0xC2):
                    hh, ww = struct.unpack('>xHH', f.read(5))
                    return ww, hh
                f.seek(ln - 2, 1)
    raise SystemExit(f'safe-area: cannot read the size of {path} (PNG or JPEG only)')


def find_ffmpeg():
    """(path, env) of an ffmpeg, or None."""
    if os.environ.get('FFMPEG'):
        return os.environ['FFMPEG'], None
    for d in ('node_modules/@remotion/compositor-darwin-arm64',
              os.path.expanduser('~/.cache/va/node_modules/@remotion/compositor-darwin-arm64')):
        exe = os.path.join(d, 'ffmpeg')
        if os.path.isfile(exe):
            return exe, dict(os.environ, DYLD_LIBRARY_PATH=os.path.abspath(d))
    for exe in (os.path.expanduser('~/.cache/cp/bin/ffmpeg'), shutil.which('ffmpeg')):
        if exe and os.path.isfile(exe):
            return exe, None
    return None


def read_png(data, path='still'):
    """8-bit RGB/RGBA non-interlaced PNG bytes -> (w, h, channels, rows). Unfiltered rows (ffmpeg -pred none) are
    instant; filtered ones (straight from a renderer) are decoded in pure Python, which is slower."""
    pos, idat = 8, []
    while pos < len(data):
        ln = struct.unpack('>I', data[pos:pos + 4])[0]
        tag, body = data[pos + 4:pos + 8], data[pos + 8:pos + 8 + ln]
        if tag == b'IHDR':
            w, h, depth, ct, _, _, il = struct.unpack('>IIBBBBB', body)
            if depth != 8 or ct not in (2, 6) or il:
                raise SystemExit(f'safe-area: {path}: without an ffmpeg only 8-bit RGB/RGBA non-interlaced PNGs work')
            ch = 3 if ct == 2 else 4
        elif tag == b'IDAT':
            idat.append(body)
        pos += 12 + ln
    raw = zlib.decompress(b''.join(idat))
    stride = w * ch
    rows, prev = [], bytearray(stride)
    for y in range(h):
        ft = raw[y * (stride + 1)]
        cur = bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        if ft == 1:
            for i in range(ch, stride):
                cur[i] = (cur[i] + cur[i - ch]) & 255
        elif ft == 2:
            cur = bytearray((a + b) & 255 for a, b in zip(cur, prev))
        elif ft == 3:
            for i in range(stride):
                cur[i] = (cur[i] + (((cur[i - ch] if i >= ch else 0) + prev[i]) >> 1)) & 255
        elif ft == 4:
            for i in range(stride):
                a = cur[i - ch] if i >= ch else 0
                b = prev[i]
                c = prev[i - ch] if i >= ch else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                cur[i] = (cur[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(cur)
        prev = cur
    return w, h, ch, rows


def load(path, ff):
    """Decode a still. With an ffmpeg (Remotion's build has no overlay filter and no rawvideo muxer) it is re-encoded
    to an unfiltered RGB PNG on a pipe, which reads instantly; otherwise the file is decoded here."""
    image_size(path)
    if ff:
        r = subprocess.run([ff[0], '-hide_banner', '-loglevel', 'error', '-i', path, '-frames:v', '1', '-pix_fmt', 'rgb24',
                            '-c:v', 'png', '-pred', 'none', '-compression_level', '0', '-f', 'image2pipe', 'pipe:1'],
                           capture_output=True, env=ff[1])
        if r.returncode == 0 and r.stdout[:8] == b'\x89PNG\r\n\x1a\n':
            return read_png(r.stdout, path)
    with open(path, 'rb') as f:
        return read_png(f.read(), path)


def overlay(paths, out_dir=None):
    ff = find_ffmpeg()
    for p in paths:
        dst = os.path.join(out_dir or os.path.dirname(os.path.abspath(p)),
                           os.path.splitext(os.path.basename(p))[0] + '.safe.png')
        w, h, ch, rows = load(p, ff)
        paint(rows, ch, w, h)
        write_png(dst, rows, w, h, ch)
        print(dst)


def check(x0, y0, x1, y1):
    """Inside when every horizontal slice of the box lies in one KEY box."""
    ys = sorted({y0, y1} | {b for k in KEY for b in (k[1], k[3]) if y0 < b < y1})
    ok = all(any(k[0] <= x0 and x1 <= k[2] and k[1] <= a and b <= k[3] for k in KEY) for a, b in zip(ys, ys[1:]))
    hits = [n for n, (a, b, c, d) in zip(NAMES, COVERED) if x0 < c and a < x1 and y0 < d and b < y1]
    print(('INSIDE the key-content zone' if ok else 'OUTSIDE the key-content zone')
          + (f'; overlaps covered: {", ".join(hits)}' if hits else ''))
    return ok


def main(argv):
    if not argv or argv[0] in ('-h', '--help'):
        print(__doc__)
        return 0
    cmd, rest = argv[0], list(argv[1:])
    if cmd == 'mask':
        size = (FW, FH)
        if '--size' in rest:
            i = rest.index('--size')
            size = tuple(int(v) for v in rest[i + 1].lower().split('x'))
            del rest[i:i + 2]
        out = rest[0] if rest else 'safe-area-mask.png'
        write_png(out, make_mask(*size), *size)
        print(out)
        return 0
    if cmd == 'overlay':
        out_dir = None
        if '--out' in rest:
            i = rest.index('--out')
            out_dir = rest[i + 1]
            del rest[i:i + 2]
            os.makedirs(out_dir, exist_ok=True)
        if not rest:
            raise SystemExit('safe-area: overlay needs at least one still')
        overlay(rest, out_dir)
        return 0
    if cmd == 'check' and len(rest) == 1:          # a quoted "X0 Y0 X1 Y1" also works
        rest = rest[0].replace(',', ' ').split()
    if cmd == 'check' and len(rest) == 4:
        return 0 if check(*(float(v) for v in rest)) else 1
    print(__doc__)
    return 2


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
