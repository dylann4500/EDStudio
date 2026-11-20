"""The film engine: render settings, materials, meshes, lights, camera and the animation Baker (Blender 5.2, Cycles).
Everything in a film is built from code with these. See docs/FILMS.md for the method and the look rules.

Rules that hold everywhere (see BRIEF.md):
  - real sizes, in metres, Z up; cast models face +X at yaw 0
  - meshes are made with bmesh (never bpy.ops), bevelled, smooth shaded with weighted normals
  - nothing is switched on/off with hide_render: things not in a shot are parked 500 m under the floor
  - every shot owns a block of frame numbers (timeline.block) and is baked one frame past both ends
"""
import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Euler, Matrix, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
for _p in (HERE, ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import timeline as tl  # noqa: E402

ASSETS = os.environ.get("FILM_ASSETS") or os.path.join(os.path.dirname(ROOT), "_assets")    # one scan cache for every film (films/_assets)
BUILD = os.path.join(ROOT, "build")
FPS = tl.FPS
PARK = (0.0, 0.0, -500.0)


# ───────────────────────────── scene + render ─────────────────────────────

def reset(name="scene"):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = name
    sc.unit_settings.system = "METRIC"
    _MATS.clear()
    return sc


def setup_render(sc, samples=160, threshold=0.02):
    """The film's render settings: Cycles path tracing at 4K, adaptive sampling + denoising, a 180-degree shutter, AgX."""
    sc.render.engine = "CYCLES"
    sc.render.resolution_x, sc.render.resolution_y = tl.W, tl.H
    sc.render.resolution_percentage = 100
    sc.render.fps = FPS
    cy = sc.cycles
    cy.samples = samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = threshold
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    try:
        cy.denoising_input_passes = "RGB_ALBEDO_NORMAL"
        cy.denoising_prefilter = "ACCURATE"
    except Exception:
        pass
    cy.max_bounces = 7
    cy.diffuse_bounces = 4
    cy.glossy_bounces = 4
    cy.transmission_bounces = 6
    cy.transparent_max_bounces = 12
    cy.sample_clamp_indirect = 6.0
    cy.sample_clamp_direct = 0.0
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.blur_glossy = 0.6
    cy.filter_width = 1.5
    sc.render.use_persistent_data = True
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.5      # a 180 degree shutter
    try:
        sc.render.motion_blur_position = "CENTER"
    except Exception:
        pass
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.view_settings.exposure = 0.0
    sc.render.image_settings.file_format = "JPEG"
    sc.render.image_settings.quality = 96
    sc.render.film_transparent = False


def pick_device(sc, want=None):
    """Call AFTER the scene is loaded (factory settings reset the preferences). Returns the backend used."""
    prefs = bpy.context.preferences.addons["cycles"].preferences
    want = want or os.environ.get("FILM_DEVICE")
    for b in ([want] if want else ["OPTIX", "METAL", "CUDA"]):
        if b == "CPU":
            break
        try:
            prefs.compute_device_type = b
            prefs.refresh_devices()
        except Exception:
            continue
        if any(d.type == b for d in prefs.devices):
            for d in prefs.devices:
                d.use = d.type == b
            sc.cycles.device = "GPU"
            return b
    sc.cycles.device = "CPU"
    return "CPU"


# ───────────────────────────── colours ─────────────────────────────

def rgb(c):
    """'#C2512B' (sRGB, as on screen) or a linear (r, g, b) tuple → linear (r, g, b)."""
    if isinstance(c, str):
        c = c.lstrip("#")
        v = [int(c[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
        return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in v)
    return tuple(c)[:3]


def kelvin(T):
    """Approximate linear RGB of a black body at T kelvin (2700 = tungsten, 6500 = daylight)."""
    t = T / 100.0
    r = 255 if t <= 66 else 329.698727446 * (t - 60) ** -0.1332047592
    g = 99.4708025861 * math.log(t) - 161.1195681661 if t <= 66 else 288.1221695283 * (t - 60) ** -0.0755148492
    b = 255 if t >= 66 else (0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307)
    return rgb("#%02x%02x%02x" % tuple(int(max(0, min(255, v))) for v in (r, g, b)))


# ───────────────────────────── materials ─────────────────────────────

_MATS = {}


def _new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree, m.node_tree.nodes["Principled BSDF"]


def _set(b, **kw):
    for k, v in kw.items():
        if k in b.inputs and v is not None:
            b.inputs[k].default_value = v


def mat(name, color="#808080", rough=0.5, metallic=0.0, coat=0.0, coat_rough=0.3, bump=0.0, bump_scale=900.0,
        bump_dist=0.0002, emit=0.0, emit_color=None, trans=0.0, ior=1.45, sheen=0.0, sss=0.0, alpha=1.0, spec=0.5):
    """A plain Principled material, cached by name. bump adds a fine noise bump (paint, plastic)."""
    if name in _MATS:
        return _MATS[name]
    m, nt, b = _new_mat(name)
    c = rgb(color)
    _set(b, **{"Base Color": (*c, 1), "Roughness": rough, "Metallic": metallic, "Coat Weight": coat, "Coat Roughness": coat_rough,
               "Transmission Weight": trans, "IOR": ior, "Sheen Weight": sheen, "Subsurface Weight": sss, "Alpha": alpha,
               "Specular IOR Level": spec})
    if emit:
        _set(b, **{"Emission Color": (*rgb(emit_color or color), 1), "Emission Strength": emit})
    if bump:
        n = nt.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = bump_scale
        n.inputs["Detail"].default_value = 3.0
        tc = nt.nodes.new("ShaderNodeTexCoord")
        nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = bump
        bp.inputs["Distance"].default_value = bump_dist
        nt.links.new(n.outputs["Fac"], bp.inputs["Height"])
        nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    _MATS[name] = m
    return m


def paint(name, color, rough=0.48, coat=0.25, bump=0.03):
    """Toy paint: the reference film's recipe (roughness 0.48, a thin clear coat, a fine noise bump)."""
    return mat(name, color, rough=rough, coat=coat, coat_rough=0.3, bump=bump, bump_scale=900.0, bump_dist=0.0002)


def gloss_black(name="gloss_black"):
    return mat(name, "#050506", rough=0.08, coat=1.0, coat_rough=0.03)


def metal(name, color="#C9CCD1", rough=0.25, bump=0.0):
    return mat(name, color, rough=rough, metallic=1.0, bump=bump, bump_scale=600.0)


def glass(name="glass", color="#FFFFFF", rough=0.0, ior=1.5):
    return mat(name, color, rough=rough, trans=1.0, ior=ior)


def tex_path(asset, kind, res="2k"):
    """assets/tex/<asset>/<asset>_<kind>_<res>.jpg where kind is diff | rough | nor_gl | disp | arm."""
    d = os.path.join(ASSETS, "tex", asset)
    for ext in ("jpg", "png", "exr"):
        p = os.path.join(d, "%s_%s_%s.%s" % (asset, kind, res, ext))
        if os.path.exists(p):
            return p
    return None


def tex_size(asset, default=1.0):
    """Real-world size of one tile of a Poly Haven scan, in metres (from its info.json)."""
    try:
        d = json.load(open(os.path.join(ASSETS, "tex", asset, "info.json")))
        dims = d.get("dimensions") or []
        if dims:
            return max(dims[0], 1.0) / 1000.0
    except Exception:
        pass
    return default


def _img(path, data=False):
    im = bpy.data.images.load(path, check_existing=True)
    if data:
        im.colorspace_settings.name = "Non-Color"
    return im


def scan(name, asset, size=None, res="2k", tint=None, tint_mix=1.0, rough_mul=1.0, rough_add=0.0, normal=1.0, coat=0.0, rot=(0, 0, 0),
         hue_sat=None, fallback="#8A7A66", metallic=0.0):
    """A photo-scanned surface from Poly Haven, box-projected in object space (blend 0.25), so no UVs are needed.

    size = metres covered by one tile (default: the scan's real size). tint multiplies the colour (tint_mix 0..1).
    hue_sat = (hue 0.5 = unchanged, saturation, value). If the scan is not downloaded, a plain colour is used."""
    if name in _MATS:
        return _MATS[name]
    diff = tex_path(asset, "diff", res)
    if not diff:
        print("WARNING scan '%s' missing (assets/tex/%s): plain colour used" % (name, asset))
        m = mat(name, fallback, rough=0.6, bump=0.05, bump_scale=120)
        return m
    m, nt, b = _new_mat(name)
    N, L = nt.nodes, nt.links
    tc = N.new("ShaderNodeTexCoord")
    mp = N.new("ShaderNodeMapping")
    s = 1.0 / (size or tex_size(asset))
    mp.inputs["Scale"].default_value = (s, s, s)
    mp.inputs["Rotation"].default_value = rot
    L.new(tc.outputs["Object"], mp.inputs["Vector"])

    def tex(path, data):
        t = N.new("ShaderNodeTexImage")
        t.image = _img(path, data)
        t.projection = "BOX"
        t.projection_blend = 0.25
        L.new(mp.outputs["Vector"], t.inputs["Vector"])
        return t

    col = tex(diff, False).outputs["Color"]
    if hue_sat:
        hs = N.new("ShaderNodeHueSaturation")
        hs.inputs["Hue"].default_value, hs.inputs["Saturation"].default_value, hs.inputs["Value"].default_value = hue_sat
        L.new(col, hs.inputs["Color"])
        col = hs.outputs["Color"]
    if tint is not None:
        mx = N.new("ShaderNodeMix")
        mx.data_type = "RGBA"
        mx.blend_type = "MULTIPLY"
        mx.inputs["Factor"].default_value = tint_mix
        mx.inputs["B"].default_value = (*rgb(tint), 1)
        L.new(col, mx.inputs["A"])
        col = mx.outputs["Result"]
    L.new(col, b.inputs["Base Color"])
    rp = tex_path(asset, "rough", res)
    if rp:
        r = tex(rp, True).outputs["Color"]
        if rough_mul != 1.0 or rough_add:
            ma = N.new("ShaderNodeMath")
            ma.operation = "MULTIPLY_ADD"
            ma.use_clamp = True
            ma.inputs[1].default_value, ma.inputs[2].default_value = rough_mul, rough_add
            L.new(r, ma.inputs[0])
            r = ma.outputs[0]
        L.new(r, b.inputs["Roughness"])
    npth = tex_path(asset, "nor_gl", res)
    if npth and normal:
        nm = N.new("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = normal
        L.new(tex(npth, True).outputs["Color"], nm.inputs["Color"])
        L.new(nm.outputs["Normal"], b.inputs["Normal"])
    _set(b, **{"Coat Weight": coat, "Coat Roughness": 0.25, "Metallic": metallic})
    _MATS[name] = m
    return m


def image_mat(name, path, emit=0.0, rough=0.5, coat=0.0, alpha=False):
    """A picture on a UV-mapped card (plane(), label). emit > 0 makes it a lit screen."""
    if name in _MATS:
        return _MATS[name]
    m, nt, b = _new_mat(name)
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = _img(path)
    t.extension = "EXTEND"
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    if emit:
        nt.links.new(t.outputs["Color"], b.inputs["Emission Color"])
        b.inputs["Emission Strength"].default_value = emit
        b.inputs["Base Color"].default_value = (0, 0, 0, 1)
        for l in list(b.inputs["Base Color"].links):
            nt.links.remove(l)
    if alpha:
        nt.links.new(t.outputs["Alpha"], b.inputs["Alpha"])
    _set(b, **{"Roughness": rough, "Coat Weight": coat})
    _MATS[name] = m
    return m


def screen_mat(name, seq_dir, strength=4.0, fallback="#FBF6EA"):
    """A lit screen that plays an image sequence: the file <seq_dir>/<blender frame, 6 digits>.jpg is shown on that
    frame (ui/capture writes them). The node 'screen_emit' holds the strength (key it to dim the screen).
    Until the pictures exist the screen is a plain lit colour."""
    if name in _MATS:
        return _MATS[name]
    m, nt, b = _new_mat(name)
    _set(b, **{"Base Color": (0.01, 0.01, 0.012, 1), "Roughness": 0.25})
    files = sorted(f for f in os.listdir(seq_dir) if f[:6].isdigit()) if os.path.isdir(seq_dir) else []
    val = nt.nodes.new("ShaderNodeValue")
    val.name = val.label = "screen_emit"
    val.outputs[0].default_value = strength
    nt.links.new(val.outputs[0], b.inputs["Emission Strength"])
    if files:
        t = nt.nodes.new("ShaderNodeTexImage")
        im = bpy.data.images.load(os.path.join(seq_dir, files[0]))
        im.source = "SEQUENCE"
        t.image = im
        t.extension = "EXTEND"
        u = t.image_user
        u.frame_start, u.frame_offset, u.frame_duration = 1, 0, 1000000
        u.use_auto_refresh = True
        u.use_cyclic = False
        nt.links.new(t.outputs["Color"], b.inputs["Emission Color"])
    else:
        print("WARNING screen '%s': no pictures in %s yet (plain colour used)" % (name, seq_dir))
        b.inputs["Emission Color"].default_value = (*rgb(fallback), 1)
    _MATS[name] = m
    return m


# ───────────────────────────── meshes (bmesh only) ─────────────────────────────

def _link(o, parent=None, col=None):
    (col or bpy.context.scene.collection).objects.link(o)
    if parent is not None:
        o.parent = parent
    return o


def empty(name, loc=(0, 0, 0), parent=None):
    o = bpy.data.objects.new(name, None)
    o.empty_display_size = 0.01
    o.location = loc
    return _link(o, parent)


def _finish(name, bm, material, loc, rot, parent, smooth=True, weighted=True, sharp_deg=40.0):
    """Smooth shading with hard creases where faces meet at more than sharp_deg, and weighted normals so the big
    flat faces of a bevelled shape stay flat."""
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    if smooth:
        lim = math.radians(sharp_deg)
        for e in bm.edges:
            if len(e.link_faces) == 2 and e.calc_face_angle(0.0) > lim:
                e.smooth = False
    bm.to_mesh(me)
    bm.free()
    if smooth:
        me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    o = bpy.data.objects.new(name, me)
    o.location, o.rotation_euler = loc, rot
    _link(o, parent)
    if material is not None:
        me.materials.append(material)
    if smooth and weighted:
        w = o.modifiers.new("wn", "WEIGHTED_NORMAL")
        w.keep_sharp = True
        w.weight = 80
    return o


def box(name, size, loc=(0, 0, 0), material=None, bevel=0.0, rot=(0, 0, 0), parent=None, seg=3, origin=(0, 0, 0)):
    """A bevelled box of size (x, y, z). origin shifts the mesh inside the object: (0, 0, -1) puts the object's
    origin on the bottom face, (0, 0, 1) on the top, (-1, 0, 0) on the -X face (a hinge)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    bmesh.ops.translate(bm, vec=(-origin[0] * size[0] / 2, -origin[1] * size[1] / 2, -origin[2] * size[2] / 2), verts=bm.verts)
    if bevel:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=min(bevel, min(size) * 0.45), segments=seg, profile=0.5, affect="EDGES", clamp_overlap=True)
    return _finish(name, bm, material, loc, rot, parent)


def cyl(name, r, h, loc=(0, 0, 0), material=None, bevel=0.0, rot=(0, 0, 0), parent=None, verts=48, r2=None, seg=3, origin=0):
    """A cylinder (or cone, r2) along Z, rims bevelled. origin -1 = bottom, 0 = centre, 1 = top."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=h)
    bmesh.ops.translate(bm, vec=(0, 0, -origin * h / 2), verts=bm.verts)
    if bevel:
        rim = [e for f in bm.faces if len(f.verts) > 4 for e in f.edges]
        bmesh.ops.bevel(bm, geom=rim, offset=min(bevel, h * 0.45, r * 0.45), segments=seg, profile=0.5, affect="EDGES", clamp_overlap=True)
    return _finish(name, bm, material, loc, rot, parent)


def sphere(name, r, loc=(0, 0, 0), material=None, parent=None, scale=(1, 1, 1), u=48, v=24, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r)
    bmesh.ops.scale(bm, vec=scale, verts=bm.verts)
    return _finish(name, bm, material, loc, rot, parent, weighted=False)


def lathe(name, profile, loc=(0, 0, 0), material=None, parent=None, seg=64, rot=(0, 0, 0)):
    """Spin a profile [(radius, z), ...] (bottom to top) around Z, like clay on a wheel. Radius 0 closes an end.
    Corners sharper than 40 degrees stay crisp; give a curve several points to keep it round."""
    bm = bmesh.new()
    rings = []
    for r, z in profile:
        if r <= 1e-7:
            rings.append([bm.verts.new((0, 0, z))])
        else:
            rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), z)) for i in range(seg)])
    for a, b in zip(rings, rings[1:]):
        if len(a) == 1 and len(b) == 1:
            continue
        for i in range(seg):
            j = (i + 1) % seg
            if len(a) == 1:
                bm.faces.new((a[0], b[j], b[i]))
            elif len(b) == 1:
                bm.faces.new((a[i], a[j], b[0]))
            else:
                bm.faces.new((a[i], a[j], b[j], b[i]))
    if len(rings[0]) > 1:
        bm.faces.new(list(reversed(rings[0])))
    if len(rings[-1]) > 1:
        bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return _finish(name, bm, material, loc, rot, parent, weighted=False)


def prism(name, outline, depth, loc=(0, 0, 0), material=None, bevel=0.0, rot=(0, 0, 0), parent=None, seg=3, flat=False):
    """A flat shape cut from a board: outline = [(x, z), ...] (counter-clockwise, may be concave), thickness `depth`
    along Y (centred). Only the front and back rims are bevelled. flat=True lays it down instead: outline = [(x, y)],
    thickness along Z (a slab with rounded corners: see rrect). Good for a plywood horse, battlements, a flag."""
    bm = bmesh.new()
    if flat:
        front = [bm.verts.new((x, y, depth / 2)) for x, y in outline]
        off = (0, 0, -depth)
    else:
        front = [bm.verts.new((x, -depth / 2, z)) for x, z in outline]
        off = (0, depth, 0)
    f = bm.faces.new(front)
    ret = bmesh.ops.extrude_face_region(bm, geom=[f])
    new = [g for g in ret["geom"] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=off, verts=new)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if bevel:
        n = len(outline)
        rim = list({e for fc in bm.faces if len(fc.verts) == n and n > 4 for e in fc.edges}) or bm.edges[:]
        bmesh.ops.bevel(bm, geom=rim, offset=min(bevel, depth * 0.45), segments=seg, profile=0.5, affect="EDGES", clamp_overlap=True)
    return _finish(name, bm, material, loc, rot, parent)


def rrect(w, h, r, n=8):
    """Outline of a rectangle w x h (centred) with corners of radius r: feed it to prism(flat=True) for a slab."""
    r = min(r, w / 2 - 1e-6, h / 2 - 1e-6)
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for k in range(n + 1):
            a = math.radians(a0 + 90 * k / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def chaikin(pts, iters=2, hard=()):
    """Round a closed outline by corner cutting. Indices in `hard` keep their corner (hoof bottoms, a blade tip)."""
    hard = set(hard)
    for _ in range(iters):
        out, nh = [], set()
        n = len(pts)
        for i in range(n):
            a, b = pts[i], pts[(i + 1) % n]
            if i in hard:
                nh.add(len(out))
                out.append(a)
            else:
                out.append((a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25))
            if (i + 1) % n not in hard:
                out.append((a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75))
        # a hard point was emitted once at its own index; soft points twice (after the previous and before the next)
        pts, hard = out, nh
    return pts


def plane(name, w, h, loc=(0, 0, 0), material=None, rot=(0, 0, 0), parent=None, thick=0.0, bevel=0.0):
    """A card in the XY plane, facing +Z, with UVs 0..1 (for image_mat / screen_mat). thick > 0 makes it a slab
    whose TOP face carries the UVs."""
    bm = bmesh.new()
    vs = [bm.verts.new(p) for p in ((-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0))]
    f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new("UVMap")
    for lp, c in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        lp[uv].uv = c
    if thick:
        ret = bmesh.ops.extrude_face_region(bm, geom=[f])
        new = [g for g in ret["geom"] if isinstance(g, bmesh.types.BMVert)]
        bmesh.ops.translate(bm, vec=(0, 0, -thick), verts=new)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        if bevel:
            bmesh.ops.bevel(bm, geom=bm.edges[:], offset=min(bevel, thick * 0.45), segments=3, profile=0.5, affect="EDGES", clamp_overlap=True)
    return _finish(name, bm, material, loc, rot, parent, smooth=bool(thick and bevel))


def tube(name, points, radius, material=None, parent=None, res=6, cyclic=False, smooth_pts=True):
    """A round cord through 3-D points (a cable, a chain line, a pole)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = res
    cu.use_fill_caps = True
    sp = cu.splines.new("NURBS" if smooth_pts and len(points) > 2 else "POLY")
    sp.points.add(len(points) - 1)
    for p, c in zip(sp.points, points):
        p.co = (*c, 1.0)
    if sp.type == "NURBS":
        sp.use_endpoint_u = True
        sp.order_u = min(4, len(points))
        sp.resolution_u = 12
    sp.use_cyclic_u = cyclic
    o = bpy.data.objects.new(name, cu)
    _link(o, parent)
    if material is not None:
        cu.materials.append(material)
    return o


def text(name, body, size, loc=(0, 0, 0), material=None, rot=(0, 0, 0), parent=None, extrude=0.0, font=None, align="CENTER"):
    """Raised or flat lettering in the XY plane, facing +Z (rotate it onto a wall). font = path to a .ttf/.otf."""
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.size = size
    cu.extrude = extrude
    cu.align_x = align
    cu.align_y = "CENTER"
    if font and os.path.exists(font):
        cu.font = bpy.data.fonts.load(font, check_existing=True)
    tmp = bpy.data.objects.new(name + "_txt", cu)
    bpy.context.scene.collection.objects.link(tmp)
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(dg))
    bpy.data.objects.remove(tmp)
    bpy.data.curves.remove(cu)
    me.name = name
    o = bpy.data.objects.new(name, me)        # a plain mesh: the farm needs no font file
    o.location, o.rotation_euler = loc, rot
    _link(o, parent)
    me.materials.clear()
    if material is not None:
        me.materials.append(material)
    return o


def join(objs, name=None):
    """Join static dressing into one object (fewer objects = faster scene sync). Returns the joined object."""
    objs = [o for o in objs if o is not None]
    if len(objs) < 2:
        return objs[0] if objs else None
    with bpy.context.temp_override(active_object=objs[0], selected_editable_objects=objs, selected_objects=objs, object=objs[0]):
        bpy.ops.object.join()
    if name:
        objs[0].name = name
    return objs[0]


def instance(name, src, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), parent=None):
    """Another object sharing src's mesh (cheap: a field of pegs, books, leaves)."""
    o = bpy.data.objects.new(name, src.data)
    o.location, o.rotation_euler, o.scale = loc, rot, scale
    for md in src.modifiers:
        if md.type == "WEIGHTED_NORMAL":
            w = o.modifiers.new("wn", "WEIGHTED_NORMAL")
            w.keep_sharp, w.weight = False, 80
    return _link(o, parent)


def import_model(asset, loc=(0, 0, 0), rot=(0, 0, 0), scale=1.0, parent=None):
    """A scanned Poly Haven model (assets/models/<asset>/<asset>_*.gltf). Returns an empty that holds it."""
    d = os.path.join(ASSETS, "models", asset)
    g = [f for f in os.listdir(d)] if os.path.isdir(d) else []
    g = [f for f in g if f.endswith(".gltf")]
    root = empty("M_" + asset, loc, parent)
    root.rotation_euler = rot
    root.scale = (scale,) * 3
    if not g:
        print("WARNING model '%s' missing (assets/models/%s)" % (asset, asset))
        return root
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(d, g[0]))
    for o in set(bpy.data.objects) - before:
        if o.parent is None:
            o.parent = root
    return root


# ───────────────────────────── light ─────────────────────────────

def world_hdri(sc, asset, strength=1.0, rot=0.0, res="4k", tint=None):
    """A photographed sky (assets/hdri/<asset>_<res>.hdr|exr). rot turns it about Z (radians)."""
    w = bpy.data.worlds.new("world")
    w.use_nodes = True
    sc.world = w
    N, L = w.node_tree.nodes, w.node_tree.links
    bg = N["Background"]
    bg.inputs["Strength"].default_value = strength
    path = None
    for ext in ("hdr", "exr"):
        p = os.path.join(ASSETS, "hdri", "%s_%s.%s" % (asset, res, ext))
        if os.path.exists(p):
            path = p
    if not path:
        print("WARNING hdri '%s' missing: plain sky colour used" % asset)
        bg.inputs["Color"].default_value = (0.35, 0.5, 0.8, 1)
        return w
    tc, mp, env = N.new("ShaderNodeTexCoord"), N.new("ShaderNodeMapping"), N.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(path, check_existing=True)
    mp.inputs["Rotation"].default_value = (0, 0, rot)
    mp.name = "sky_rot"
    L.new(tc.outputs["Generated"], mp.inputs["Vector"])
    L.new(mp.outputs["Vector"], env.inputs["Vector"])
    if tint is not None:
        mx = N.new("ShaderNodeMix")
        mx.data_type, mx.blend_type = "RGBA", "MULTIPLY"
        mx.inputs["Factor"].default_value = 1.0
        mx.inputs["B"].default_value = (*rgb(tint), 1)
        L.new(env.outputs["Color"], mx.inputs["A"])
        L.new(mx.outputs["Result"], bg.inputs["Color"])
    else:
        L.new(env.outputs["Color"], bg.inputs["Color"])
    return w


def world_color(sc, color, strength=1.0):
    w = bpy.data.worlds.new("world")
    w.use_nodes = True
    sc.world = w
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*rgb(color), 1)
    bg.inputs["Strength"].default_value = strength
    return w


def _light(name, kind, energy, color, parent=None):
    d = bpy.data.lights.new(name, kind)
    d.energy = energy
    d.color = rgb(color) if color is not None else (1, 1, 1)
    o = bpy.data.objects.new(name, d)
    return _link(o, parent)


def aim(o, pos, target, roll=0.0):
    """Put o at pos with its -Z axis (a camera's or light's forward) pointing at target."""
    o.location = pos
    q = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y")
    if roll:
        q = q @ Quaternion((0, 0, 1), roll)
    o.rotation_euler = q.to_euler("XYZ")


def sun(name, energy, toward, angle_deg=1.2, color=None):
    """A sun shining TOWARD the vector `toward` (e.g. (1, 0.3, -0.5) = down and to +X)."""
    o = _light(name, "SUN", energy, color)
    o.data.angle = math.radians(angle_deg)
    aim(o, (0, 0, 0), toward)
    o.location = (0, 0, 5)
    return o


def area(name, power, size, pos, target, color=None, shape="RECTANGLE", size_y=None, spread=None, parent=None):
    o = _light(name, "AREA", power, color, parent)
    o.data.shape = shape if size_y is None else "RECTANGLE"
    o.data.size = size
    if size_y is not None:
        o.data.size_y = size_y
    if spread is not None:
        o.data.spread = spread
    aim(o, pos, target)
    return o


def point(name, power, pos, color=None, radius=0.01, parent=None):
    o = _light(name, "POINT", power, color, parent)
    o.data.shadow_soft_size = radius
    o.location = pos
    return o


def spot(name, power, pos, target, angle_deg=40, blend=0.3, color=None, radius=0.01, parent=None):
    o = _light(name, "SPOT", power, color, parent)
    o.data.spot_size = math.radians(angle_deg)
    o.data.spot_blend = blend
    o.data.shadow_soft_size = radius
    aim(o, pos, target)
    return o


# ───────────────────────────── camera ─────────────────────────────

def new_cam(sc, name="CAM"):
    cd = bpy.data.cameras.new(name)
    cam = bpy.data.objects.new(name, cd)
    sc.collection.objects.link(cam)
    cd.sensor_width = 36
    cd.dof.use_dof = True
    cd.dof.aperture_blades = 0
    cd.clip_start, cd.clip_end = 0.005, 400
    sc.camera = cam
    return cam


def cam_set(cam, pos, target, lens=35.0, fstop=4.0, focus=None, roll=0.0):
    """Place the camera for this frame. focus = the point to focus on (default: the target), or a distance."""
    aim(cam, pos, target, roll)
    cam.data.lens = lens
    cam.data.dof.aperture_fstop = fstop
    if isinstance(focus, (int, float)):
        cam.data.dof.focus_distance = focus
    else:
        cam.data.dof.focus_distance = max(0.01, (Vector(focus if focus is not None else target) - Vector(pos)).length)


# ───────────────────────────── baking the animation ─────────────────────────────

class Baker:
    """Records where everything is on every frame, then writes compact keyframes.

        B = Baker(sc, cam)
        B.add(obj, park=True)      # a cast member's or prop's root: parked unless a shot places it
        B.add(part)                # a moving part: returns to its rest pose at the start of every frame
        B.prop(light.data, "energy")   # any other animated value (set it in animate())
        bake(B, shots, animate)    # animate(shot_id, t, i) places things for that frame
    """

    def __init__(self, sc, cam=None):
        self.sc, self.cam = sc, cam
        self.items, self.props = [], []
        self.rec, self.prev = {}, {}
        self.blocks = []
        if cam is not None:
            cam.rotation_mode = "XYZ"
            self.add(cam)
            self.prop(cam.data, "lens")
            self.prop(cam.data.dof, "focus_distance")
            self.prop(cam.data.dof, "aperture_fstop")

    def add(self, o, park=False):
        o.rotation_mode = "XYZ"
        self.items.append((o, park, tuple(o.location), tuple(o.rotation_euler), tuple(o.scale)))
        self.rec[o] = []
        return o

    def add_rig(self, rig):
        self.add(rig.root, park=True)
        for p in rig.movers:
            self.add(p)
        return rig

    def prop(self, idblock, path):
        self.props.append((idblock, path))

    def begin(self):
        for o, park, loc, rot, scl in self.items:
            if o is self.cam:
                continue
            o.location = PARK if park else loc
            o.rotation_euler = rot
            o.scale = scl

    def snap(self, f):
        for o, park, loc, rot, scl in self.items:
            e = o.rotation_euler.copy()
            if o in self.prev:
                e.make_compatible(self.prev[o])
            self.prev[o] = e
            self.rec[o].append((f, *o.location, *e, *o.scale))
        for idb, path in self.props:
            idb.keyframe_insert(path, frame=f)

    def write(self):
        """Compact keyframes: channels that never move get none; channels still for a whole shot get two keys."""
        import numpy as np
        from bpy_extras import anim_utils
        paths = [("location", 0), ("location", 1), ("location", 2), ("rotation_euler", 0), ("rotation_euler", 1), ("rotation_euler", 2),
                 ("scale", 0), ("scale", 1), ("scale", 2)]
        nkeys = 0
        for o, park, loc, rot, scl in self.items:
            a = np.array(self.rec[o], dtype=np.float64)
            if not len(a):
                continue
            act = slot = cb = None
            for c, (path, idx) in enumerate(paths):
                col = a[:, 1 + c]
                if np.ptp(col) < 1e-9:
                    getattr(o, path)[idx] = float(col[0])
                    continue
                keep = np.zeros(len(a), dtype=bool)
                for lo, hi in self.blocks:
                    m = (a[:, 0] >= lo) & (a[:, 0] <= hi)
                    ix = np.nonzero(m)[0]
                    if not len(ix):
                        continue
                    if np.ptp(col[ix]) < 1e-9:
                        keep[ix[0]] = keep[ix[-1]] = True
                    else:
                        keep[ix] = True
                fr, va = a[keep, 0], col[keep]
                if act is None:
                    act = bpy.data.actions.new("A_" + o.name)
                    ad = o.animation_data_create()
                    ad.action = act
                    slot = act.slots.new(id_type="OBJECT", name=o.name)
                    ad.action_slot = slot
                    cb = anim_utils.action_ensure_channelbag_for_slot(act, slot)
                fc = cb.fcurves.new(path, index=idx)
                fc.keyframe_points.add(len(fr))
                co = np.empty(len(fr) * 2, dtype=np.float32)
                co[0::2], co[1::2] = fr, va
                fc.keyframe_points.foreach_set("co", co)
                fc.keyframe_points.foreach_set("interpolation", np.full(len(fr), 1, dtype=np.int32))   # LINEAR
                fc.update()
                nkeys += len(fr)
        for idb, path in self.props:
            ad = getattr(idb.id_data, "animation_data", None)
            if ad and ad.action:
                try:
                    cb = anim_utils.action_ensure_channelbag_for_slot(ad.action, ad.action_slot)
                    for fc in cb.fcurves:
                        for kp in fc.keyframe_points:
                            kp.interpolation = "LINEAR"
                except Exception:
                    pass
        return nkeys


def bake(B, shots, animate, quiet=False):
    """Run animate(shot_id, t, i) for every frame of every shot (one spare frame each end), then write the keys.
    t = seconds from the start of the shot (t = i / 24; the spare frames are i = -1 and i = n)."""
    sc = B.sc
    lo_all, hi_all = 10 ** 9, 0
    for sid in shots:
        n, b = tl.frames(sid), tl.block(sid)
        B.blocks.append((b - 1, b + n))
        for i in range(-1, n + 1):
            B.begin()
            animate(sid, i / FPS, i)
            B.snap(b + i)
        m = sc.timeline_markers.new(sid, frame=b)
        lo_all, hi_all = min(lo_all, b), max(hi_all, b + n - 1)
    k = B.write()
    sc.frame_start, sc.frame_end = lo_all, hi_all
    sc.frame_set(lo_all)
    if not quiet:
        print("BAKED %d shots, %d object keys" % (len(shots), k))


# ───────────────────────────── saving ─────────────────────────────

def save(sc, set_name, events=None):
    """Write build/<set>/<set>.blend (pictures packed inside; screen sequences stay beside it in screens/)
    and build/<set>/events.json (the sound cues this set's animation produces)."""
    d = os.path.join(BUILD, set_name)
    os.makedirs(d, exist_ok=True)
    try:
        bpy.ops.file.pack_all()
    except Exception as e:
        print("pack_all:", e)
    path = os.path.join(d, set_name + ".blend")
    bpy.ops.wm.save_as_mainfile(filepath=path, compress=True)
    # screen sequences: keep their paths relative to the .blend (build/<set>/screens/<name>/), so the farm finds them
    for im in bpy.data.images:
        if im.source == "SEQUENCE":
            im.filepath = bpy.path.relpath(bpy.path.abspath(im.filepath))
    bpy.ops.wm.save_mainfile()
    json.dump(events or [], open(os.path.join(d, "events.json"), "w"), indent=0)
    print("SAVED", path, "%.1f MB" % (os.path.getsize(path) / 1e6))
    return path


def screens_dir(set_name, screen):
    """Where a screen's pictures live for a set: build/<set>/screens/<screen>/ (ui/capture writes them there)."""
    return os.path.join(BUILD, set_name, "screens", screen)
