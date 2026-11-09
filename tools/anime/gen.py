"""Local anime illustration generator for the 2D puppet characters (054 goth cheat-tutor): Animagine XL 4.0 (SDXL,
CreativeML Open RAIL++-M = commercial use OK) via diffusers on the Mac's GPU (MPS). No network at render time; the model lives in
the Hugging Face cache (~7 GB, downloaded once). Venv: ~/.cache/edstudio/sdxl (python 3.12 + torch + diffusers).

  ~/.cache/edstudio/sdxl/bin/python tools/anime/gen.py job.json

job.json = {"out": "videos/054-x/art", "jobs": [
  {"name": "hero", "prompt": "...", "seeds": [1, 2, 3], "w": 832, "h": 1216, "steps": 28, "cfg": 5, "hires": 1.5, "strength": 0.4},
  {"name": "blink", "init": "videos/054-x/art/hero-1.png", "mask": [x0, y0, x1, y1] | "mask.png", "prompt": "...", "seeds": [7],
   "strength": 0.9},                                    # inpaint (only the mask changes: eyes closed, mouth open, ...)
  {"name": "pose2", "init": "....png", "prompt": "...", "seeds": [3], "strength": 0.55}   # img2img (same design, new detail)
]}
Prompts get the character block (CHAR) prepended when they contain "{char}"; the quality tail + negative are added automatically.
Outputs: <out>/<name>-<seed>.png + <out>/_sheet-<name>.jpg. Deterministic per seed (CPU generator).
"""
import json, sys, os, time
import torch
from PIL import Image, ImageDraw, ImageFilter
from diffusers import (StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline, StableDiffusionXLInpaintPipeline,
                       EulerAncestralDiscreteScheduler)

MODEL = 'cagliostrolab/animagine-xl-4.0'
QUALITY = 'masterpiece, high score, great score, absurdres'
NEG = ('lowres, bad anatomy, bad hands, missing fingers, extra digits, fewer digits, extra arms, fused fingers, text, error, cropped, '
       'worst quality, low quality, low score, bad score, average score, signature, watermark, username, blurry, jpeg artifacts, '
       'nsfw, nude, nipples, loli, child, aged down, petite, huge breasts, gigantic breasts, gold, round eyewear, aviators')
# the goth cheat-tutor (user's benchmark, Nov 8): auburn layered messy hair, sunglasses up, goth makeup, lace/fishnet O-ring bikini + chains
CHAR = ('mature female, adult, goth, soft shading, beautiful detailed eyes, glossy skin, auburn hair, medium hair, messy hair, layered hair, '
        'swept bangs, hair between eyes, sidelocks, silver star hair ornament, chain hair ornament, black sunglasses, rectangular eyewear, eyewear on head, '
        'brown eyes, black eyeliner, winged eyeliner, purple eyeshadow, long eyelashes, dark lipstick, plum lips, blush, ear piercing, cross earrings, '
        'studded choker, cross necklace, silver chain necklace, layered necklaces, black bikini, lace trim, fishnet, halter bikini, o-ring bikini, '
        'silver bat ornament, side-tie bikini bottom, ribbon, silver chain belt, o-ring, studded wristband, beaded bracelet, black nails, '
        'large breasts, cleavage, navel, narrow waist, wide hips, thighs')

dev = 'mps' if torch.backends.mps.is_available() else 'cpu'
DT = torch.float16
_pipes = {}


def pipe(kind):
    if 'base' not in _pipes:
        p = StableDiffusionXLPipeline.from_pretrained(MODEL, torch_dtype=DT, use_safetensors=True)
        p.scheduler = EulerAncestralDiscreteScheduler.from_config(p.scheduler.config)
        p.vae.config.force_upcast = True   # fp16 SDXL VAE → NaN/black on MPS otherwise
        p.vae.enable_tiling(); p.enable_attention_slicing(); p.to(dev); _pipes['base'] = p
    b = _pipes['base']
    if kind == 'base': return b
    if kind not in _pipes:
        cls = StableDiffusionXLImg2ImgPipeline if kind == 'img2img' else StableDiffusionXLInpaintPipeline
        _pipes[kind] = cls(**b.components)
    return _pipes[kind]


@torch.no_grad()
def embeds(prompt, neg):
    """SDXL's CLIP encoders stop at 77 tokens and the character block alone is longer (the pose + background were silently cut).
    Encode each prompt in 75-token chunks (BOS + chunk + EOS + pad), penultimate hidden states of both encoders, chunks concatenated;
    pooled = the bigG encoder's first chunk. The negative gets padded with empty chunks to the same length."""
    b = pipe('base'); out = {}
    def ids(tok, text): return tok(text, add_special_tokens=False, truncation=False).input_ids
    def chunks(tok, text, n=None):
        t = ids(tok, text); cs = [t[i:i + 75] for i in range(0, max(1, len(t)), 75)] or [[]]
        while n and len(cs) < n: cs.append([])
        pad = tok.pad_token_id if tok.pad_token_id is not None else tok.eos_token_id
        return [[tok.bos_token_id] + c + [tok.eos_token_id] + [pad] * (75 - len(c)) for c in cs]
    n = max(len(chunks(b.tokenizer, prompt)), len(chunks(b.tokenizer, neg)))
    for key, text in (('p', prompt), ('n', neg)):
        hs, pooled = [], None
        for tok, enc in ((b.tokenizer, b.text_encoder), (b.tokenizer_2, b.text_encoder_2)):
            parts = []
            for i, c in enumerate(chunks(tok, text, n)[:n]):
                o = enc(torch.tensor([c], device=dev), output_hidden_states=True)
                parts.append(o.hidden_states[-2])
                if enc is b.text_encoder_2 and i == 0: pooled = o[0]
            hs.append(torch.cat(parts, dim=1))
        out[key] = (torch.cat(hs, dim=-1).to(DT), pooled.to(DT))
    return dict(prompt_embeds=out['p'][0], pooled_prompt_embeds=out['p'][1], negative_prompt_embeds=out['n'][0], negative_pooled_prompt_embeds=out['n'][1])


def full(prompt):
    return (prompt.replace('{char}', CHAR) + ', ' + QUALITY).replace(', ,', ',')


def mask_img(spec, size):
    if isinstance(spec, str): return Image.open(spec).convert('L').resize(size)
    m = Image.new('L', size, 0); d = ImageDraw.Draw(m)
    for box in (spec if isinstance(spec[0], list) else [spec]): d.ellipse(box, fill=255)
    return m.filter(ImageFilter.GaussianBlur(6))


def sheet(paths, out):
    ims = [Image.open(p) for p in paths]; w = 360; h = int(ims[0].height * w / ims[0].width); cols = min(4, len(ims)); rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * w, rows * h), 'black')
    for i, im in enumerate(ims): S.paste(im.convert('RGB').resize((w, h)), ((i % cols) * w, (i // cols) * h))
    S.save(out, quality=90)


def run(job, out):
    paths = []
    for seed in job.get('seeds', [0]):
        t0 = time.time(); g = torch.Generator('cpu').manual_seed(seed)
        args = dict(**job['_emb'],
                    num_inference_steps=job.get('steps', 28), guidance_scale=job.get('cfg', 5.0), generator=g)
        if 'init' in job:
            init = Image.open(job['init']).convert('RGB')
            if 'mask' in job:
                mk = mask_img(job['mask'], init.size)
                im = pipe('inpaint')(image=init, mask_image=mk, strength=job.get('strength', 0.9), width=init.width, height=init.height, **args).images[0]
                im = Image.composite(im, init, mk)   # only the masked area changes (the VAE round trip shifts colours elsewhere = flicker on a swap)
            else:
                im = pipe('img2img')(image=init, strength=job.get('strength', 0.5), **args).images[0]
        else:
            im = pipe('base')(width=job.get('w', 832), height=job.get('h', 1216), **args).images[0]
            if job.get('hires'):   # hires fix: upscale 1.5× and re-detail (faces, lace, chains)
                k = job['hires']; up = im.resize((int(im.width * k) // 8 * 8, int(im.height * k) // 8 * 8), Image.LANCZOS)
                args['generator'] = torch.Generator('cpu').manual_seed(seed)
                im = pipe('img2img')(image=up, strength=job.get('strength', 0.4), **args).images[0]
        p = os.path.join(out, f"{job['name']}-{seed}.png"); im.save(p); paths.append(p)
        print(f"{p}  {time.time() - t0:.0f}s", flush=True)
    sheet(paths, os.path.join(out, f"_sheet-{job['name']}.jpg"))


if __name__ == '__main__':
    spec = json.load(open(sys.argv[1])); out = spec['out']; os.makedirs(out, exist_ok=True)
    only = sys.argv[2].split(',') if len(sys.argv) > 2 else None
    jobs = [j for j in spec['jobs'] if not only or j['name'] in only]
    # memory (24 GB Mac shared with Chrome + other renders): encode every prompt first, then drop both text encoders (~1.6 GB)
    for j in jobs: j['_emb'] = embeds(full(j['prompt']), NEG + (', ' + j['neg'] if j.get('neg') else ''))
    import gc; b = pipe('base'); b.register_modules(text_encoder=None, text_encoder_2=None); gc.collect(); torch.mps.empty_cache()
    for j in jobs: run(j, out)
