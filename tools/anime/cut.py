"""Cut a generated character out of its plain background (rembg + the isnet-anime model, downloaded once to ~/.u2net).
  ~/.cache/edstudio/sdxl/bin/python tools/anime/cut.py base.png out.png [variant.png:out_variant.png ...]
Variants (blink / talk frames made by gen.py inpainting) reuse the BASE alpha, so a swap never changes the silhouette.
The alpha edge is tightened a little (no white halo from the background) and premultiplied-safe."""
import sys
from PIL import Image, ImageFilter
from rembg import remove, new_session

sess = new_session('isnet-anime')
base = Image.open(sys.argv[1]).convert('RGB')
cut = remove(base, session=sess, post_process_mask=True)
a = cut.getchannel('A').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))   # pull the edge in 1 px, soften
out = base.copy(); out.putalpha(a); out.save(sys.argv[2])
print('cut', sys.argv[2])
for pair in sys.argv[3:]:
    src, dst = pair.split(':'); v = Image.open(src).convert('RGB'); v.putalpha(a); v.save(dst); print('cut', dst)
