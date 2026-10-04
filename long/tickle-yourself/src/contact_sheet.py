"""Tile rendered frames into a labelled contact sheet for review.
Usage: python3 contact_sheet.py <frames_dir> <out.png> [cols] [thumb_w]"""
import glob, os, sys
from PIL import Image, ImageDraw

d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 270
files = sorted(glob.glob(os.path.join(d, "f_*.png")))
_w, _h = Image.open(files[0]).size if files else (16, 9)
th = tw * _h // _w   # the frames' own aspect (1920x1080 here; 1080x1920 for a Short)
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + 22)), (30, 30, 30))
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    sheet.paste(im, (x, y + 22))
    n = int(os.path.basename(f)[2:6])
    dr.text((x + 4, y + 4), f"f{n}  {n/30:.2f}s", fill=(255, 255, 0))
sheet.save(out)
print(out, sheet.size)
