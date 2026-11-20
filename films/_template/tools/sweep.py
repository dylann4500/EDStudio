"""Runs INSIDE Blender on a built set (no rendering): on every frame the film shows, test

  PEN   things passing through one another (surfaces that cross, and how deep one is inside the other)
  SNK   things sunk into what they stand on           HOV   things at rest that do not touch what is under them

    python3 tools/film.py sweep <set> [--shots S01,S02] [--tol 0.25] [--ground table,floor] [--skip beam,glow] [--pile rug:7.5]
    (or directly: Blender -b build/<set>/<set>.blend -P tools/sweep.py -- <the same options>)

Every top-level object is one thing (an empty with its children = one rig or prop). Anything animated is tested
against everything else it comes near; things that never move are not tested against each other. Objects whose names
contain a --skip word (default: beam, glow, haze, steam, dust, mote, smoke, fog, volume) are not solids and are left out.
--ground names the floors (default: names with table, floor, ground, desk, rug, terrain): never "passed through", only
stood on. --pile name:mm = that ground's visible surface stands mm above its mesh (a rug's pile).
Things found here are NOT always faults (a hand on a pole, a foot planted on a moving platform): look at the frame.

Depths and gaps are millimetres. "seen" = share of the faulty frames on which the worst point is inside the picture.
"""
import json
import math
import os
import sys
import time

import bpy
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
import timeline as tl  # noqa: E402

a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SET = os.path.basename(bpy.data.filepath)[:-6]
SHOTS = a[a.index("--shots") + 1].split(",") if "--shots" in a else tl.shots_of(SET)
OUT = a[a.index("--out") + 1] if "--out" in a else None
TOL = float(a[a.index("--tol") + 1]) if "--tol" in a else 0.25          # mm
DUMP = a[a.index("--dump") + 1].split(",") if "--dump" in a else []      # objects whose gap under them is printed frame by frame
SKIP = (a[a.index("--skip") + 1] if "--skip" in a else "beam,glow,haze,steam,dust,mote,smoke,fog,volume").lower().split(",")
GROUND_WORDS = (a[a.index("--ground") + 1] if "--ground" in a else "table,floor,ground,desk,rug,terrain").lower().split(",")
PILE = {kv.split(":")[0]: float(kv.split(":")[1]) / 1000.0 for kv in (a[a.index("--pile") + 1].split(",") if "--pile" in a else [])}
sc = bpy.context.scene
cam = sc.camera
D = bpy.data.objects


def geo(root):
    return [o for o in [root] + list(root.children_recursive) if o.type in ("MESH", "CURVE")]


class Part:
    """One object's shape in its own space: vertices, extra points along its edges (so a long thin pole is not just two
    rings of points), triangles."""

    def __init__(self, o, dg, spacing=0.001):
        self.o, self.name = o, o.name
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        n = len(me.vertices)
        V = np.empty(n * 3, dtype=np.float64)
        me.vertices.foreach_get("co", V)
        self.V = V.reshape(n, 3)
        T = np.empty(len(me.loop_triangles) * 3, dtype=np.int64)
        me.loop_triangles.foreach_get("vertices", T)
        self.T = T.reshape(-1, 3)
        E = np.empty(len(me.edges) * 2, dtype=np.int64)
        me.edges.foreach_get("vertices", E)
        E = E.reshape(-1, 2)
        sx = np.array(o.matrix_world.to_scale())
        extra = []
        if len(E):
            p0, p1 = self.V[E[:, 0]], self.V[E[:, 1]]
            ln = np.linalg.norm((p1 - p0) * sx, axis=1)
            for k in np.nonzero(ln > spacing * 1.5)[0]:
                m = min(80, int(ln[k] / spacing))
                u = (np.arange(1, m) / m)[:, None]
                extra.append(p0[k] + (p1[k] - p0[k]) * u)
        self.X = np.vstack(extra) if extra else np.zeros((0, 3))
        ev.to_mesh_clear()


class Group:
    def __init__(self, name, objs, dg, kind, static=False):
        self.name, self.kind, self.static = name, kind, static
        self.parts = [Part(o, dg) for o in objs]
        self.parts = [p for p in self.parts if len(p.V) and len(p.T)]
        self.frame = None

    def update(self, f):
        if self.frame is not None and (self.static or self.frame == f):
            return
        self.frame = f
        Vs, Ps, Ts, tag, off = [], [], [], [], 0
        for k, p in enumerate(self.parts):
            M = np.array(p.o.matrix_world)
            R, t = M[:3, :3].T, M[:3, 3]
            v = p.V @ R + t
            Vs.append(v)
            Ts.append(p.T + off)
            off += len(v)
            pts = np.vstack([v, p.X @ R + t]) if len(p.X) else v
            Ps.append(pts)
            tag.append(np.full(len(pts), k, dtype=np.int32))
        self.Vw = np.vstack(Vs)
        self.Tw = np.vstack(Ts)
        self.Pw = np.vstack(Ps)
        self.tag = np.concatenate(tag)
        self.lo, self.hi = self.Vw.min(axis=0), self.Vw.max(axis=0)
        self.bvh = None
        self.parked = self.lo[2] < -100

    def tree(self):
        if self.bvh is None:
            self.bvh = BVHTree.FromPolygons(self.Vw.tolist(), self.Tw.tolist(), all_triangles=True)
        return self.bvh


def inside_depth(A, B, cap=0.02):
    """How deep (m) A's points go inside B, the point, and A's part: by the nearest face of B and which side of it."""
    m = np.all((A.Pw >= B.lo - 1e-4) & (A.Pw <= B.hi + 1e-4), axis=1)
    idx = np.nonzero(m)[0]
    if not len(idx):
        return 0.0, None, None
    bt = B.tree()
    best, bp, bk = 0.0, None, None
    for i in idx:
        p = Vector(A.Pw[i])
        loc, nrm, _, dist = bt.find_nearest(p, cap)
        if loc is None or dist <= best:
            continue
        if (p - loc).dot(nrm) < -1e-7:
            best, bp, bk = dist, p, int(A.tag[i])
    return best, bp, bk


def odd(bt, p):
    """Is p inside the closed surface? (count the crossings of three rays: two of three say so)"""
    votes = 0
    for d in (Vector((0.31, 0.22, 0.92)), Vector((-0.71, 0.55, 0.44)), Vector((0.12, -0.93, 0.34))):
        d.normalize()
        o, n = p.copy(), 0
        for _ in range(40):
            loc, nrm, _, dist = bt.ray_cast(o, d, 5.0)
            if loc is None:
                break
            n += 1
            o = loc + d * 1e-5
        votes += n % 2
    return votes >= 2


def main():
    t0 = time.time()
    sc.frame_set(tl.bframe(SHOTS[0], 0))
    dg = bpy.context.evaluated_depsgraph_get()
    G = {}

    def add(name, objs, kind, static=False):
        objs = [o for o in objs if o is not None]
        if objs:
            g = Group(name, objs, dg, kind, static)
            if g.parts:
                G[name] = g

    def animated(o):
        return any(x.animation_data is not None and x.animation_data.action is not None for x in [o] + list(o.children_recursive))

    for o in sorted([o for o in D if o.parent is None and o.type in ("EMPTY", "MESH", "CURVE")], key=lambda o: o.name):
        objs = [x for x in geo(o) if not any(w and w in x.name.lower() for w in SKIP)]
        if not objs:
            continue
        if any(w and w in o.name.lower() for w in GROUND_WORDS) and not animated(o):
            add(o.name, objs, "ground", static=True)
        elif animated(o):
            add(o.name, objs, "cast")
        else:
            add(o.name, objs, "prop", static=True)
    names = list(G)
    print("SWEEP groups:", ", ".join("%s(%d)" % (n, len(G[n].Pw) if G[n].frame else sum(len(p.V) + len(p.X) for p in G[n].parts)) for n in names), flush=True)

    # which pairs can be a fault: anything that moves, against everything else except the floors it stands on
    def wanted(x, y):
        kx, ky = G[x].kind, G[y].kind
        if "ground" in (kx, ky):
            return False
        return kx == "cast" or ky == "cast"
    pairs = [(x, y) for i, x in enumerate(names) for y in names[i + 1:] if wanted(x, y)]
    ground_names = list(names)                                       # what a thing may stand on: anything under it
    rest_names = [n for n in names if G[n].kind == "cast"]

    if "--statics" in a:                                              # the things that never move, against each other (once)
        f = tl.bframe(SHOTS[0], list(tl.cut(SHOTS[0]))[0])
        sc.frame_set(f)
        for g in G.values():
            g.update(f)
        st = [n for n in names if G[n].kind == "prop" and not G[n].parked]
        n_ = 0
        for i, x in enumerate(st):
            for y in st[i + 1:]:
                A, B = G[x], G[y]
                if G[x].kind == "set" and G[y].kind == "set":
                    continue
                if np.any(A.lo > B.hi + 1e-4) or np.any(B.lo > A.hi + 1e-4):
                    print("STA  %-26s x %-26s boxes apart by %.1f mm" % (x, y, 1000 * float(np.max(np.maximum(A.lo - B.hi, B.lo - A.hi)))), flush=True)
                    continue
                cross = bool(A.tree().overlap(B.tree()))
                d1, p1, k1 = inside_depth(A, B)
                d2, p2, k2 = inside_depth(B, A)
                d, p_, into = (d1, p1, B) if d1 >= d2 else (d2, p2, A)
                real = cross and p_ is not None and d * 1000 >= TOL and odd(into.tree(), p_)
                n_ += int(real)
                print("STA  %-26s x %-26s %s" % (x, y, ("THROUGH %.2f mm at (%.3f %.3f %.3f)" % (d * 1000, p_.x, p_.y, p_.z)) if real else "boxes overlap, surfaces do not cross" if not cross else "touching, not inside"), flush=True)
        print("STA  total: %d pairs through" % n_, flush=True)

    pen, low, near = {}, {}, {}
    nfr = 0
    for sid in SHOTS:
        for i in tl.cut(sid):
            f = tl.bframe(sid, i)
            sc.frame_set(f)
            nfr += 1
            for g in G.values():
                g.update(f)
            live = {n for n in names if not G[n].parked}
            if "--cam" in a:                                          # how near the lens comes to anything
                cp = cam.matrix_world.translation
                for n in live:
                    g = G[n]
                    if np.any(np.array(cp) < g.lo - 0.03) or np.any(np.array(cp) > g.hi + 0.03):
                        continue
                    loc, nrm, _, dist = g.tree().find_nearest(cp, 0.03)
                    if loc is not None and (sid not in near or dist < near[sid][0]):
                        near[sid] = (dist, n, i, cam.data.clip_start)
            # ── passing through ──
            for x, y in pairs:
                if x not in live or y not in live:
                    continue
                A, B = G[x], G[y]
                if np.any(A.lo > B.hi + 1e-4) or np.any(B.lo > A.hi + 1e-4):
                    continue
                if not A.tree().overlap(B.tree()):
                    continue                                          # their surfaces do not cross
                d1, p1, k1 = inside_depth(A, B)
                d2, p2, k2 = inside_depth(B, A)
                if d1 >= d2:
                    d, p, part, into = d1, p1, A.parts[k1].name if k1 is not None else "?", B
                else:
                    d, p, part, into = d2, p2, B.parts[k2].name if k2 is not None else "?", A
                if d * 1000 < TOL or p is None:
                    continue
                if not odd(into.tree(), p):
                    continue                                          # behind an open face, not inside a solid
                v = world_to_camera_view(sc, cam, p)
                seen = 0.0 <= v.x <= 1.0 and 0.0 <= v.y <= 1.0 and v.z > 0
                r = pen.setdefault((sid, x, y), dict(frames=[], worst=0.0, at=None, part=None, seen=0, dist=None))
                r["frames"].append(i)
                r["seen"] += int(seen)
                if d > r["worst"]:
                    r.update(worst=d, at=i, part="%s in %s" % (part, into.name), dist=round(v.z, 3), xy=(round(v.x, 2), round(v.y, 2)))
            # ── standing on something: the gap under the lowest points ──
            gt = None
            for n in rest_names:
                if n not in live:
                    continue
                g = G[n]
                z0 = g.lo[2]
                sel = np.nonzero(g.Vw[:, 2] < z0 + 0.002)[0]             # everything near its underside (on a slope it does not touch at its lowest point)
                if len(sel) > 72:
                    sel = sel[np.linspace(0, len(sel) - 1, 72).astype(int)]
                best = None
                for k in sel:
                    x_, y_, z_ = g.Vw[k]
                    gap = None
                    for gn in ground_names:
                        if gn == n or G[gn].parked:
                            continue
                        B = G[gn]
                        if x_ < B.lo[0] or x_ > B.hi[0] or y_ < B.lo[1] or y_ > B.hi[1]:
                            continue
                        loc, nrm, _, dist = B.tree().ray_cast(Vector((x_, y_, z_ + 0.012)), Vector((0, 0, -1)), 0.3)
                        if loc is not None:
                            gg = z_ - loc.z - PILE.get(gn, 0.0)
                            gap = gg if gap is None or gg < gap else gap          # the highest thing under it
                    if gap is not None and (best is None or gap < best[0]):
                        best = (gap, (x_, y_, z_))
                if best is not None:
                    v = world_to_camera_view(sc, cam, Vector(best[1]))
                    low.setdefault((sid, n), []).append((i, best[0], z0, 0.0 <= v.x <= 1.0 and 0.0 <= v.y <= 1.0 and v.z > 0, round(v.z, 3)))
        print("SWEEP %s done (%d frames so far, %.0f s)" % (sid, nfr, time.time() - t0), flush=True)

    for sid, (dist, n, i, clip) in sorted(near.items()):
        print("CAM  %s  the lens comes within %.1f mm of %s at %.3f (it clips nearer than %.1f mm)" % (sid, dist * 1000, n, i / tl.FPS, clip * 1000), flush=True)
    out = {"pen": [], "sink": [], "hover": []}
    for (sid, x, y), r in sorted(pen.items(), key=lambda kv: -kv[1]["worst"]):
        fr = r["frames"]
        line = dict(shot=sid, a=x, b=y, worst_mm=round(r["worst"] * 1000, 2), at=round(r["at"] / tl.FPS, 3), frames=len(fr), first=round(fr[0] / tl.FPS, 3), last=round(fr[-1] / tl.FPS, 3),
                    part=r["part"], seen=round(r["seen"] / len(fr), 2), cam_m=r["dist"], xy=r.get("xy"))
        out["pen"].append(line)
        print("PEN  %s  %-10s x %-10s  worst %5.2f mm at %.3f (%s)  frames %d (%.2f-%.2f)  seen %.0f%%  %.2f m from lens at %s" % (
            sid, x, y, line["worst_mm"], line["at"], line["part"], line["frames"], line["first"], line["last"], 100 * line["seen"], line["cam_m"] or 0, line["xy"]), flush=True)
    for (sid, n), rows in sorted(low.items()):
        if n in DUMP:
            print("GAP  %s %s  " % (sid, n) + " ".join("%.2f:%+.1f" % (r[0] / tl.FPS, r[1] * 1000) for r in rows), flush=True)
        gaps = [r[1] for r in rows]
        zs = [r[2] for r in rows]
        # sunk: on any frame
        sunk = [r for r in rows if r[1] * 1000 < -TOL]
        if sunk:
            w = min(sunk, key=lambda r: r[1])
            line = dict(shot=sid, obj=n, worst_mm=round(w[1] * 1000, 2), at=round(w[0] / tl.FPS, 3), frames=len(sunk), first=round(sunk[0][0] / tl.FPS, 3), last=round(sunk[-1][0] / tl.FPS, 3),
                        seen=round(sum(1 for r in sunk if r[3]) / len(sunk), 2), cam_m=w[4])
            out["sink"].append(line)
            print("SNK  %s  %-22s worst %6.2f mm at %.3f  frames %d (%.2f-%.2f)  seen %.0f%%  %.2f m from lens" % (sid, n, line["worst_mm"], line["at"], line["frames"], line["first"], line["last"], 100 * line["seen"], line["cam_m"]), flush=True)
        # hovering: only while it is at rest (its lowest point is not moving, or it is the bottom of a hop)
        hov = []
        still = G[n].kind != "cast"                                   # a loose thing is at rest only when it is not moving at all
        for k, r in enumerate(rows):
            if k == 0 or k + 1 >= len(rows) or rows[k + 1][0] != r[0] + 1 or rows[k - 1][0] != r[0] - 1:
                continue                                              # needs the frame either side
            zp, zn = zs[k - 1], zs[k + 1]
            rest = (abs(zs[k] - zp) < 2e-5 and abs(zs[k] - zn) < 2e-5) if still else (zs[k] <= zp + 2e-5 and zs[k] <= zn + 2e-5)
            if rest and r[1] * 1000 > TOL:
                hov.append(r)
        if hov:
            w = max(hov, key=lambda r: r[1])
            line = dict(shot=sid, obj=n, worst_mm=round(w[1] * 1000, 2), at=round(w[0] / tl.FPS, 3), frames=len(hov), first=round(hov[0][0] / tl.FPS, 3), last=round(hov[-1][0] / tl.FPS, 3),
                        seen=round(sum(1 for r in hov if r[3]) / len(hov), 2), cam_m=w[4])
            out["hover"].append(line)
            print("HOV  %s  %-22s worst %6.2f mm at %.3f  frames %d (%.2f-%.2f)  seen %.0f%%  %.2f m from lens" % (sid, n, line["worst_mm"], line["at"], line["frames"], line["first"], line["last"], 100 * line["seen"], line["cam_m"]), flush=True)
    print("SWEEP total: %d frames, %d pairs through, %d sunk, %d hovering, %.0f s" % (nfr, len(out["pen"]), len(out["sink"]), len(out["hover"]), time.time() - t0), flush=True)
    if OUT:
        json.dump(out, open(OUT, "w"), indent=1)


main()
