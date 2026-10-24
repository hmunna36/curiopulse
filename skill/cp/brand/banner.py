"""The CurioPulse banner (2560x1440; phone-safe middle 1546x423): the picture's orange sunburst, the hiker, the name."""
import math, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 2560, 1440; F = '/Users/harshad/.cache/cp/fonts/'; OUT = sys.argv[1]; HIKER = sys.argv[2]
cx, cy = 1800, 720
bg = Image.new('RGB', (W, H)); px = bg.load()
c0, c1, c2 = (255, 193, 99), (255, 122, 60), (184, 54, 30)
for y in range(H):
    for x in range(W):
        d = min(1, math.hypot(x - cx, (y - cy) * 1.15) / 1500)
        a, b, t = (c0, c1, d / 0.55) if d < 0.55 else (c1, c2, (d - 0.55) / 0.45)
        px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
rays = Image.new('L', (W, H), 0); dr = ImageDraw.Draw(rays)
for i in range(24):
    a0 = i * 2 * math.pi / 24; a1 = a0 + math.pi / 24
    dr.polygon([(cx, cy), (cx + 3000 * math.cos(a0), cy + 3000 * math.sin(a0)), (cx + 3000 * math.cos(a1), cy + 3000 * math.sin(a1))], fill=26)
bg = Image.composite(Image.new('RGB', (W, H), (255, 236, 190)), bg, rays)
hk = Image.open(HIKER).crop((0, 560, 1080, 1640)).resize((560, 560), Image.LANCZOS)
m = Image.new('L', (560, 560), 0); ImageDraw.Draw(m).ellipse((40, 30, 520, 600), fill=255); m = m.filter(ImageFilter.GaussianBlur(28))
bg.paste(hk, (cx - 280, cy - 300), m)
d = ImageDraw.Draw(bg)
def outlined(xy, txt, font, fill, stroke):
    x, y = xy
    d.text((x + 6, y + 8), txt, font=font, fill=(90, 25, 10), anchor='lm', stroke_width=stroke, stroke_fill=(90, 25, 10))
    d.text((x, y), txt, font=font, fill=fill, anchor='lm', stroke_width=stroke, stroke_fill=(11, 11, 26))
outlined((560, 650), 'CurioPulse', ImageFont.truetype(F + 'Anton-400.ttf', 190), (255, 255, 255), 12)
outlined((566, 800), 'STRANGE THINGS ABOUT YOUR BODY', ImageFont.truetype(F + 'Montserrat-900.ttf', 46), (255, 212, 71), 7)
outlined((566, 864), '& THE WORLD, IN 30 SECONDS', ImageFont.truetype(F + 'Montserrat-900.ttf', 46), (255, 255, 255), 7)
for (x, y, s, r, col) in [(1985, 590, 120, 14, (255, 255, 255)), (2330, 820, 80, -14, (255, 212, 71)), (390, 640, 80, -10, (255, 212, 71)),
                          (250, 830, 100, 14, (255, 255, 255)), (2480, 600, 64, 8, (255, 255, 255)), (130, 600, 64, 0, (255, 255, 255))]:
    t = Image.new('RGBA', (240, 240), (0, 0, 0, 0)); ImageDraw.Draw(t).text((120, 120), '?', font=ImageFont.truetype(F + 'Anton-400.ttf', s), anchor='mm', fill=col, stroke_width=8, stroke_fill=(11, 11, 26))
    t = t.rotate(r, resample=Image.BICUBIC); bg.paste(t, (x - 120, y - 120), t)
bg.save(OUT)
strip = bg.crop((0, 508, 2560, 931)); ph = bg.crop((507, 508, 2053, 931))
pv = Image.new('RGB', (1600, 560), (240, 240, 240)); pv.paste(strip.resize((1560, 258)), (20, 20)); pv.paste(ph.resize((942, 258)), (20, 295)); pv.save(OUT.replace('.png', '_preview.png'))
