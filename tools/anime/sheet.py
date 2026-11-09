"""Model sheet: lay generated character images out on one page with labels (to send the user before production).
  ~/.cache/edstudio/sdxl/bin/python tools/anime/sheet.py out.jpg "Title" img.png:"label" img2.png:"label" ... [--cols 4] [--w 400]
Cut-outs (alpha) are shown over a soft gradient so the silhouette reads."""
import sys
from PIL import Image, ImageDraw, ImageFont

args = sys.argv[1:]
cols = int(args[args.index('--cols') + 1]) if '--cols' in args else 4
W = int(args[args.index('--w') + 1]) if '--w' in args else 400
args = [a for i, a in enumerate(args) if a not in ('--cols', '--w') and (i == 0 or args[i - 1] not in ('--cols', '--w'))]
out, title, items = args[0], args[1], [a.split(':', 1) for a in args[2:]]
font = lambda s: next((ImageFont.truetype(f, s) for f in ('/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/System/Library/Fonts/Helvetica.ttc') if __import__('os').path.exists(f)), ImageFont.load_default())
ims = [Image.open(p).convert('RGBA') for p, _ in items]
H = max(int(im.height * W / im.width) for im in ims); rows = (len(ims) + cols - 1) // cols; top, lab, pad = 90, 44, 14
S = Image.new('RGB', (cols * (W + pad) + pad, top + rows * (H + lab + pad) + pad), (22, 18, 26))
d = ImageDraw.Draw(S); d.text((pad + 4, 22), title, fill=(240, 236, 244), font=font(40))
for i, (im, (_, label)) in enumerate(zip(ims, items)):
    x, y = pad + (i % cols) * (W + pad), top + (i // cols) * (H + lab + pad)
    bg = Image.new('RGBA', (W, H), (0, 0, 0, 255)); g = ImageDraw.Draw(bg)
    for k in range(H): c = int(70 + 60 * k / H); g.line([(0, k), (W, k)], fill=(c, c - 10, c + 25, 255))
    r = im.resize((W, int(im.height * W / im.width)), Image.LANCZOS); bg.alpha_composite(r, (0, H - r.height))
    S.paste(bg.convert('RGB'), (x, y)); d.text((x + 6, y + H + 8), label, fill=(225, 210, 230), font=font(24))
S.save(out, quality=90); print('sheet', out, S.size)
