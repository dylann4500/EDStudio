"""Headless Blender: a smooth, sculpted anime body (adult, ~1.72 m) with a skeleton + smooth skin weights, and a bikini cut from
the body surface, exported as GLB for three.js (engine/vrm.js loads it; head, face and hair are built in three.js on the head bone).

    /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --python tools/anime/body.py -- out.glb

Method: a Skin-modifier armature sketch (radii per joint) + spheres for bust and hips → one voxel-remeshed, smoothed surface
(no seams for the toon shader), our own bone weights (distance to each bone segment, top-2, smooth falloff), then the bikini =
body vertices inside two triangle cups + a low brief, pushed out along their normals. Blender is Z-up, the body faces −Y;
the glTF exporter turns that into three.js's Y-up, facing +Z.
"""
import bpy, bmesh, sys, math
from mathutils import Vector

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/body.glb'
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------------------------------------------------------------- the sketch: joints (x, y, z) + skin radii (side, depth)
J = {}
def j(name, p, r): J[name] = (Vector(p), r)
j('hip', (0, 0.006, 0.93), (0.17, 0.112))
j('belly', (0, 0.0, 1.03), (0.112, 0.082))
j('waist', (0, 0.006, 1.10), (0.087, 0.07))
j('ribs', (0, 0.008, 1.20), (0.108, 0.08))
j('chest', (0, 0.01, 1.30), (0.116, 0.082))
j('upchest', (0, 0.014, 1.375), (0.122, 0.075))
j('neck0', (0, 0.018, 1.44), (0.05, 0.045))
j('neck1', (0, 0.014, 1.545), (0.039, 0.038))
for s, k in ((1, 'L'), (-1, 'R')):
    j('sh' + k, (s * 0.138, 0.016, 1.395), (0.046, 0.046))
    j('el' + k, (s * 0.244, 0.024, 1.16), (0.033, 0.033))
    j('wr' + k, (s * 0.296, 0.004, 0.955), (0.025, 0.021))
    j('pa' + k, (s * 0.309, -0.004, 0.889), (0.0125, 0.029))
    j('hj' + k, (s * 0.09, 0.004, 0.87), (0.099, 0.099))
    j('th' + k, (s * 0.096, 0.0, 0.70), (0.085, 0.086))
    j('kn' + k, (s * 0.096, -0.004, 0.505), (0.05, 0.052))
    j('ca' + k, (s * 0.097, 0.012, 0.37), (0.052, 0.055))
    j('an' + k, (s * 0.1, 0.016, 0.1), (0.029, 0.032))
    j('to' + k, (s * 0.1, -0.105, 0.035), (0.034, 0.021))
E = [('hip', 'belly'), ('belly', 'waist'), ('waist', 'ribs'), ('ribs', 'chest'), ('chest', 'upchest'), ('upchest', 'neck0'), ('neck0', 'neck1')]
for k in 'LR':
    E += [('upchest', 'sh' + k), ('sh' + k, 'el' + k), ('el' + k, 'wr' + k), ('wr' + k, 'pa' + k),
          ('hip', 'hj' + k), ('hj' + k, 'th' + k), ('th' + k, 'kn' + k), ('kn' + k, 'ca' + k), ('ca' + k, 'an' + k), ('an' + k, 'to' + k)]
names = list(J)
me = bpy.data.meshes.new('sketch'); me.from_pydata([J[n][0] for n in names], [(names.index(a), names.index(b)) for a, b in E], [])
sk = bpy.data.objects.new('sketch', me); scene.collection.objects.link(sk)
skin = sk.modifiers.new('skin', 'SKIN'); skin.use_smooth_shade = True; skin.branch_smoothing = 0.6
for i, n in enumerate(names):
    sv = me.skin_vertices[0].data[i]; sv.radius = J[n][1]; sv.use_root = (n == 'hip')
sub = sk.modifiers.new('sub', 'SUBSURF'); sub.levels = 2; sub.render_levels = 2

dg = bpy.context.evaluated_depsgraph_get()
body_me = bpy.data.meshes.new_from_object(sk.evaluated_get(dg))
bm = bmesh.new(); bm.from_mesh(body_me)
# curves: bust + hips (spheres merged by the voxel remesh below)
def sphere(c, r, sc):
    t = bmesh.new(); bmesh.ops.create_uvsphere(t, u_segments=32, v_segments=20, radius=r)
    for v in t.verts: v.co = Vector((v.co.x * sc[0], v.co.y * sc[1], v.co.z * sc[2])) + Vector(c)
    tm = bpy.data.meshes.new('s'); t.to_mesh(tm); t.free(); bm.from_mesh(tm); bpy.data.meshes.remove(tm)
for s in (1, -1):
    sphere((s * 0.074, -0.046, 1.276), 0.09, (1.04, 0.82, 0.92))     # bust (blended into the chest by the remesh + smooth)
    sphere((s * 0.066, 0.05, 0.89), 0.08, (1.0, 0.8, 0.86))       # glutes
bm.to_mesh(body_me); bm.free()
body = bpy.data.objects.new('body', body_me); scene.collection.objects.link(body)
bpy.data.objects.remove(sk)
rm = body.modifiers.new('remesh', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = 0.0055; rm.use_smooth_shade = True
sm = body.modifiers.new('smooth', 'SMOOTH'); sm.factor = 0.7; sm.iterations = 14
dc = body.modifiers.new('decimate', 'DECIMATE'); dc.ratio = 0.85
dg = bpy.context.evaluated_depsgraph_get()
final = bpy.data.meshes.new_from_object(body.evaluated_get(dg)); body.modifiers.clear(); old = body.data; body.data = final; bpy.data.meshes.remove(old)
for p in body.data.polygons: p.use_smooth = True

# ---------------------------------------------------------------- the skeleton
B = [  # name, head, tail, parent
    ('hips', (0, 0.006, 0.9), (0, 0.006, 1.02), None), ('spine', (0, 0.006, 1.02), (0, 0.008, 1.2), 'hips'),
    ('chest', (0, 0.008, 1.2), (0, 0.016, 1.42), 'spine'), ('neck', (0, 0.016, 1.42), (0, 0.014, 1.53), 'chest'), ('head', (0, 0.014, 1.53), (0, 0.014, 1.74), 'neck')]
for s, k in ((1, 'L'), (-1, 'R')):
    B += [('shoulder.' + k, (s * 0.03, 0.016, 1.39), (s * 0.132, 0.016, 1.395), 'chest'), ('upperArm.' + k, (s * 0.132, 0.016, 1.395), (s * 0.238, 0.024, 1.16), 'shoulder.' + k),
          ('lowerArm.' + k, (s * 0.238, 0.024, 1.16), (s * 0.296, 0.004, 0.955), 'upperArm.' + k), ('hand.' + k, (s * 0.296, 0.004, 0.955), (s * 0.315, -0.005, 0.86), 'lowerArm.' + k),
          ('upperLeg.' + k, (s * 0.086, 0.004, 0.9), (s * 0.094, -0.004, 0.505), 'hips'), ('lowerLeg.' + k, (s * 0.094, -0.004, 0.505), (s * 0.1, 0.016, 0.1), 'upperLeg.' + k),
          ('foot.' + k, (s * 0.1, 0.016, 0.1), (s * 0.1, -0.11, 0.035), 'lowerLeg.' + k)]
arm_d = bpy.data.armatures.new('rig'); arm = bpy.data.objects.new('rig', arm_d); scene.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='EDIT')
eb = {}
for n, h, t, par in B:
    b = arm_d.edit_bones.new(n); b.head = h; b.tail = t; eb[n] = b
    if par: b.parent = eb[par]; b.use_connect = False
bpy.ops.object.mode_set(mode='OBJECT')

# ---------------------------------------------------------------- weights: distance to each bone segment, smooth falloff, top 2
def seg_d(p, a, b):
    ab = b - a; u = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared)); return (p - (a + ab * u)).length
segs = [(n, Vector(h), Vector(t)) for n, h, t, _ in B if not n.startswith('shoulder')]
groups = {n: body.vertex_groups.new(name=n) for n, *_ in B}
for v in body.data.vertices:
    p = v.co
    ds = sorted(((seg_d(p, a, b), n) for n, a, b in segs))
    # the bust and the glutes ride the chest / hips, not the arms or the thighs
    if p.z > 1.17 and p.z < 1.37 and p.y < -0.02 and abs(p.x) < 0.17: ds = [(0.0, 'chest')]
    if p.z > 0.82 and p.z < 0.98 and p.y > 0.02 and abs(p.x) < 0.17: ds = [(0.0, 'hips')] + [d for d in ds if d[1].startswith('upperLeg')][:1]
    top = ds[:2]; w = [math.exp(-(d / 0.035) ** 2) for d, _ in top]
    if top[0][0] < 1e-6: w = [1.0] + [0.0] * (len(top) - 1)
    tot = sum(w) or 1.0
    for (d, n), wi in zip(top, w):
        if wi / tot > 0.02: groups[n].add([v.index], wi / tot, 'REPLACE')
body.parent = arm; md = body.modifiers.new('arm', 'ARMATURE'); md.object = arm

# ---------------------------------------------------------------- materials + the bikini cut from the body surface
def mat(name, rgb):
    m = bpy.data.materials.new(name); m.use_nodes = True; bsdf = m.node_tree.nodes.get('Principled BSDF'); bsdf.inputs['Base Color'].default_value = (*rgb, 1); bsdf.inputs['Roughness'].default_value = 0.6; return m
body.data.materials.append(mat('skin', (0.93, 0.78, 0.72)))

def tri_sd(px, pz, a, b, c):   # signed distance to a 2-D triangle (negative inside)
    import math as m
    P = Vector((px, pz)); A, Bv, Cv = Vector(a), Vector(b), Vector(c)
    def seg(p, u, w): d = w - u; t = max(0.0, min(1.0, (p - u).dot(d) / d.length_squared)); return (p - (u + d * t)).length
    dist = min(seg(P, A, Bv), seg(P, Bv, Cv), seg(P, Cv, A))
    def s(p1, p2, p3): return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
    d1, d2, d3 = s(P, A, Bv), s(P, Bv, Cv), s(P, Cv, A); inside = not ((d1 < 0 or d2 < 0 or d3 < 0) and (d1 > 0 or d2 > 0 or d3 > 0))
    return -dist if inside else dist
SKIN, BLACK, RED = (1.0, 0.776, 0.701, 1), (0.025, 0.022, 0.03, 1), (0.6, 0.06, 0.09, 1)
def bikini(co):
    """'skin' | 'black' | 'red' for a body vertex (Blender coords: z up, front = −y)."""
    best = 1.0
    if co.y < -0.02 and 1.18 < co.z < 1.37:
        for s in (1, -1): best = min(best, tri_sd(co.x, co.z, (s * 0.066, 1.352), (s * 0.012, 1.192), (s * 0.158, 1.205)))
    if 0.79 < co.z < 0.962 and abs(co.x) < 0.2:
        w = (0.032 + (co.z - 0.79) * 1.0) if co.y < 0.01 else (0.05 + (co.z - 0.79) * 1.35)
        d = max(abs(co.x) - w, co.z - 0.955) if co.z < 0.955 else co.z - 0.955
        best = min(best, d)
        if abs(co.z - 0.95) < 0.006 and abs(co.x) < 0.2: best = min(best, -0.001)   # the side strings round the hips
    if best < -0.007: return BLACK
    if best < 0.0: return RED
    return SKIN
ca = body.data.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
for v in body.data.vertices: ca.data[v.index].color = bikini(v.co)
body.data.color_attributes.active_color = ca
m = body.data.materials[0]; nt = m.node_tree; vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'
nt.links.new(vc.outputs['Color'], nt.nodes.get('Principled BSDF').inputs['Base Color'])

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_skins=True, export_animations=False, export_yup=True, export_apply=False, export_materials='EXPORT', export_vertex_color='ACTIVE')
print('exported', out, len(body.data.vertices), 'verts')
