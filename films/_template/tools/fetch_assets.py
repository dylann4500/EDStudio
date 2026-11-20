"""Download the free (CC0) Poly Haven scans listed in assets.json into films/_assets/, the scan cache every film shares
(skips what is already there; a file another film on this computer already has in its own assets/ is linked, not
downloaded again). Set FILM_ASSETS to keep the cache somewhere else.

    python3 tools/fetch_assets.py            everything in assets.json
    python3 tools/fetch_assets.py --spec assets_floor.json     a builder's own list (same format)
    python3 tools/fetch_assets.py --find wood table      search Poly Haven by words (prints ids + categories)
"""
import json
import os
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.environ.get("FILM_ASSETS") or os.path.join(os.path.dirname(ROOT), "_assets")
FILMS = os.path.dirname(ROOT)
UA = {"User-Agent": "film-assets/1.0"}
API = "https://api.polyhaven.com"


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()


def borrow(path):
    """The same file from another film's own assets/ folder (older films kept their scans there): link it."""
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return True
    rel = os.path.relpath(path, A)
    for f in sorted(os.listdir(FILMS)) if os.path.isdir(FILMS) else []:
        src = os.path.join(FILMS, f, "assets", rel)
        if os.path.isfile(src) and os.path.getsize(src) > 0:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            try:
                os.link(src, path)
            except OSError:
                import shutil
                shutil.copyfile(src, path)
            return True
    return False


def borrow_dir(d):
    """A whole scan or model folder another film already has: link every file of it. -> True if it was there."""
    rel = os.path.relpath(d, A)
    for f in sorted(os.listdir(FILMS)) if os.path.isdir(FILMS) else []:
        src = os.path.join(FILMS, f, "assets", rel)
        if os.path.isdir(src) and os.listdir(src):
            for dp, _, fs in os.walk(src):
                for fn in fs:
                    borrow(os.path.join(d, os.path.relpath(os.path.join(dp, fn), src)))
            return True
    return False


def save(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return 0
    if borrow(path):
        return 0
    os.makedirs(os.path.dirname(path), exist_ok=True)
    data = get(url)
    open(path + ".part", "wb").write(data)
    os.replace(path + ".part", path)
    return len(data)


def texture(aid, res):
    d = os.path.join(A, "tex", aid)
    have = lambda: os.path.exists(os.path.join(d, "%s_diff_%s.jpg" % (aid, res))) and os.path.exists(os.path.join(d, "info.json"))
    if have() or (borrow_dir(d) and have()):
        return 0
    files = json.loads(get("%s/files/%s" % (API, aid)))
    n = 0
    if "Diffuse" not in files:                       # some scans come only in colour variants (coll1, coll2, ...): take the first
        files["Diffuse"] = files.get(next((k for k in sorted(files) if k.startswith("coll")), ""), {})
    for key, kind in (("Diffuse", "diff"), ("Rough", "rough"), ("nor_gl", "nor_gl"), ("Displacement", "disp")):
        if key in files and res in files[key] and "jpg" in files[key][res]:
            n += save(files[key][res]["jpg"]["url"], os.path.join(d, "%s_%s_%s.jpg" % (aid, kind, res)))
    info = json.loads(get("%s/info/%s" % (API, aid)))
    tmp = os.path.join(d, "info.json.part")             # written beside and moved in: never through a link into another film's copy
    json.dump({"dimensions": info.get("dimensions"), "name": info.get("name"), "categories": info.get("categories")}, open(tmp, "w"))
    os.replace(tmp, os.path.join(d, "info.json"))
    return n


def hdri(aid, res):
    p = os.path.join(A, "hdri", "%s_%s.hdr" % (aid, res))
    if os.path.exists(p):
        return 0
    files = json.loads(get("%s/files/%s" % (API, aid)))
    return save(files["hdri"][res]["hdr"]["url"], p)


def model(aid, res):
    d = os.path.join(A, "models", aid)
    have = lambda: os.path.isdir(d) and any(f.endswith(".gltf") for f in os.listdir(d))
    if have() or (borrow_dir(d) and have()):
        return 0
    files = json.loads(get("%s/files/%s" % (API, aid)))
    g = files["gltf"][res]["gltf"]
    n = save(g["url"], os.path.join(d, os.path.basename(g["url"])))
    for rel, f in (g.get("include") or {}).items():
        n += save(f["url"], os.path.join(d, rel))
    return n


def find(words):
    for t in ("textures", "models", "hdris"):
        allv = json.loads(get("%s/assets?t=%s" % (API, t)))
        for aid, v in sorted(allv.items()):
            hay = (aid + " " + v.get("name", "") + " " + " ".join(v.get("categories", [])) + " " + " ".join(v.get("tags", []))).lower()
            if all(w.lower() in hay for w in words):
                print("%-9s %-38s %s" % (t, aid, ",".join(v.get("categories", []))[:60]))


if __name__ == "__main__":
    if "--find" in sys.argv:
        find(sys.argv[sys.argv.index("--find") + 1:])
        sys.exit()
    spec = json.load(open(sys.argv[sys.argv.index("--spec") + 1] if "--spec" in sys.argv else os.path.join(ROOT, "assets.json")))
    total = 0
    for kind, fn in (("textures", texture), ("hdris", hdri), ("models", model)):
        for aid, res in spec.get(kind, {}).items():
            try:
                n = fn(aid, res)
                total += n
                if n:
                    print("got %-9s %-36s %5.1f MB" % (kind, aid, n / 1e6), flush=True)
            except Exception as e:
                print("FAILED %s %s: %r" % (kind, aid, e), flush=True)
    print("done, %.0f MB new" % (total / 1e6))
