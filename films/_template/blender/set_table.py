"""THE TEMPLATE'S EXAMPLE SET: a wooden spinning top on a table at golden hour (shots S01-S03 in timeline.py).

    python3 tools/film.py build table                 build the set, bake every shot, save build/table/table.blend
    python3 tools/film.py sheet table --tag v1        quarter-size stills of every shot on one sheet: LOOK at it

It is here to be replaced: copy its shape for your own sets (one file per set). What it shows:
  - the world in real sizes (metres, Z up): the table top is z = 0, the viewer is at -Y, the light comes from -X
  - photo-scanned surfaces (C.scan: Poly Haven, box-projected, no UVs), painted wood (C.paint), steel (C.metal)
  - one motivated light: a low sun through window bars (their shadows fall across the table), a sky, a soft fill
  - a turned toy built from lathe profiles, with a two-level rig: the root tilts and precesses about the tip, a child
    spins about the toy's own axis (so the Baker keys clean angles; never decompose a fast spin into one Euler)
  - resting poses worked out from the geometry (the top lies on its side where its cone line meets the table)
  - a camera per shot with its lens, f-stop and focus on the subject (C.cam_set), the move keyed in story seconds
  - sound events for the mix: [(shot, t, kind, gain, dur)] -> build/table/events.json (kinds: post/mix.py KINDS)
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Matrix, Vector  # noqa: E402

import anim as A  # noqa: E402
import core as C  # noqa: E402
import timeline as tl  # noqa: E402
from anim import K, clamp, smooth  # noqa: E402

SET = "table"
_a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
TAU = math.tau


class S:                                          # the set's handles
    pass


# ── the top: a lathe profile (radius, z) in metres, its origin at the steel tip ──
CONE_R, CONE_Z = 0.0222, 0.0255                    # the shoulder: where the conical underside meets the painted band
TOP0 = Vector((0.05, 0.05, 0.0))                   # where it spins on the table
# Its outline (every part's outermost points, from build_top): what can touch the table when it leans.
OUTLINE = [(0.0010, 0.0005), (0.0026, 0.0033), (0.0034, 0.0042), (CONE_R, CONE_Z), (CONE_R + 0.0002, 0.0275), (CONE_R + 0.0001, 0.0295),
           (0.0215, 0.0315), (0.0195, 0.0337), (0.0205, 0.0335), (0.0199, 0.0320), (0.0043, 0.0585)]
COM = 0.020                                        # its centre of mass, up the axis from the tip


def lift(tilt):
    """How far the tip must sit above the table at this lean so that no part of the top goes into it (a blunt tip
    and a painted band stand proud of the pure cone): the lowest point of the outline touches, nothing goes under."""
    return max(0.0, max(r * math.sin(tilt) - z * math.cos(tilt) for r, z in OUTLINE))


# Lying on its side it settles where its centre of mass is lowest (about 50 degrees: the tip and the shoulder both down).
REST_TILT = min((k * 0.0005 for k in range(800, 2800)), key=lambda a: lift(a) + COM * math.cos(a))
HDRI = "qwantani_dusk_2_puresky"


def build_top():
    root = C.empty("top")                          # tilts and precesses about the tip
    spin = C.empty("top_spin", parent=root)        # spins about the top's own axis
    wood = C.scan("top_wood", "ash_veneer", size=0.12, coat=0.35, rough_add=-0.05)
    red, blue = C.paint("top_red", "#B5372C", coat=0.45), C.paint("top_blue", "#2A5A97", coat=0.45)
    steel = C.metal("top_tip", "#C3C6CA", rough=0.22)
    C.lathe("tip", [(0, 0), (0.0010, 0.0005), (0.0026, 0.0033), (0.0034, 0.0042), (0.0030, 0.0046), (0, 0.0046)], material=steel, parent=spin)
    C.lathe("cone", [(0, 0.0042), (0.0034, 0.0042), (CONE_R, CONE_Z), (0, CONE_Z)], material=wood, parent=spin)
    r_at = lambda z: 0.0034 + (z - 0.0042) * (CONE_R - 0.0034) / (CONE_Z - 0.0042)          # the cone's radius at a height
    C.lathe("cone_stripe", [(r_at(0.0098) + 0.00015, 0.0098), (r_at(0.0128) + 0.00015, 0.0128)], material=red, parent=spin)
    C.lathe("band", [(CONE_R + 0.0001, CONE_Z), (CONE_R + 0.0002, 0.0275), (CONE_R + 0.0001, 0.0295)], material=red, parent=spin)
    C.lathe("dome", [(CONE_R, 0.0295), (0.0215, 0.0315), (0.0195, 0.0337), (0.0160, 0.0360), (0.0110, 0.0377), (0.0050, 0.0386), (0, 0.0388)],
            material=wood, parent=spin)
    C.lathe("stem", [(0.0040, 0.0380), (0.0038, 0.0390), (0.0036, 0.0560), (0.0041, 0.0572), (0.0043, 0.0585), (0.0032, 0.0598), (0, 0.0601)],
            material=red, parent=spin)
    for k in range(7):                             # seven painted dots on the dome (an odd number strobes less on film)
        a = TAU * k / 7
        C.sphere("dot%d" % k, 0.0021, (0.0184 * math.cos(a), 0.0184 * math.sin(a), 0.0335), material=blue, parent=spin, u=16, v=10)
    return root, spin


def build_dressing():
    """A few real things on the table: they give the glide its parallax and the frame its scale."""
    cover, cover2 = C.scan("book_cover", "leather_red_02", size=0.25), C.scan("book_cover2", "fabric_leather_01", size=0.25, tint="#3E5B4A", tint_mix=0.7)
    pages = C.paint("pages", "#EFE7D6", rough=0.85, coat=0.0, bump=0.02)
    for name, mat, (x, y, z), yaw in (("book1", cover, (-0.27, 0.20, 0.0), 0.32), ("book2", cover2, (-0.26, 0.21, 0.023), 0.05)):
        b = C.empty(name, (x, y, z))
        b.rotation_euler = (0, 0, yaw)
        C.box(name + "_cover", (0.17, 0.12, 0.023), (0, 0, 0.0115), mat, bevel=0.0015, parent=b)
        C.box(name + "_pages", (0.162, 0.116, 0.019), (0.004, 0, 0.0115), pages, bevel=0.0005, parent=b)
    glaze = C.mat("mug_glaze", "#2D4757", rough=0.18, coat=0.6)
    C.lathe("mug", [(0, 0), (0.033, 0), (0.036, 0.003), (0.0375, 0.082), (0.0372, 0.0865), (0.0345, 0.0865), (0.0342, 0.009), (0, 0.009)],
            loc=(0.27, 0.24, 0.0), material=glaze)
    yellow, graphite = C.paint("pencil_paint", "#E4B33A", coat=0.3), C.mat("pencil_lead", "#2B2B2E", rough=0.5)
    p = C.empty("pencil", (-0.13, -0.10, 0.0036))
    p.rotation_euler = (0, 0, 0.42)
    C.cyl("pencil_body", 0.0036, 0.15, (0, 0, 0), yellow, rot=(0, math.pi / 2, 0), parent=p, verts=6)                 # along +X, centred
    C.cyl("pencil_wood", 0.0036, 0.016, (0.075, 0, 0), C.scan("pencil_wood", "ash_veneer", size=0.05), rot=(0, math.pi / 2, 0), parent=p,
          r2=0.0008, verts=24, origin=-1)                                                                                    # the sharpened end
    C.cyl("pencil_lead_tip", 0.0008, 0.004, (0.091, 0, 0), graphite, rot=(0, math.pi / 2, 0), parent=p, r2=0.0001, verts=12, origin=-1)


def build():
    sc = C.reset(SET)
    C.setup_render(sc, samples=128)
    C.world_hdri(sc, HDRI, strength=0.65, rot=math.radians(200), res="2k")
    C.box("table", (2.0, 1.0, 0.04), (0.1, 0.1, -0.02), C.scan("table_top", "wood_table_001", size=0.9, coat=0.12, res="2k"), bevel=0.003)
    plaster = C.scan("wall", "white_plaster_02", size=1.2, tint="#EADFCF", tint_mix=0.6, normal=0.5)
    C.box("wall", (6.0, 0.06, 1.8), (0, 0.66, 0.5), plaster)
    C.box("wall_right", (0.06, 3.0, 1.8), (1.03, -0.85, 0.5), plaster)      # the room's corner: no lens sees out of the room
    bars = C.mat("window_bars", "#3A2E26", rough=0.7)            # out of shot: only their shadows fall across the table
    for y in (-0.42, -0.02, 0.38):
        C.box("bar_v", (0.04, 0.035, 1.2), (-0.95, y, 0.35), bars)
    C.box("bar_h", (0.04, 1.2, 0.035), (-0.95, -0.02, 0.38), bars)
    S.sun = C.sun("sun", 6.5, toward=(0.80, 0.30, -0.33), angle_deg=1.4, color=C.kelvin(3300))
    S.fill = C.area("fill", 3.0, 0.9, (0.45, -1.2, 0.55), (0.05, 0.0, 0.03), color=C.kelvin(6200))
    S.top, S.spin = build_top()
    build_dressing()
    S.cam = C.new_cam(sc)
    return sc


# ── the top's motion, on the STORY clock (T = seconds from the start of S01: the three shots are one action) ──
T3 = tl.start("S03") / tl.FPS                      # S03 begins
TOPPLE, REST = (T3 + tl.CUES["S03"][k] for k in ("topple", "rest"))
IMPACT = TOPPLE + 0.20                             # it hits the table
W0, W1 = 8.0, 1.6                                  # turns a second: fast at first (a blur), slow at the topple


def spin_rate(T):
    return W0 if T < T3 else W0 + (W1 - W0) * smooth((T - T3) / (TOPPLE - T3)) ** 0.7


def spin_angle(T, dt=1 / 240.0):
    """The spin's angle (integrated, so a change of rate never jumps)."""
    n = max(0, int(T / dt))
    return TAU * sum(spin_rate(k * dt) * dt for k in range(n))


def pose_top(T):
    """-> tip position, tilt, precession angle, spin angle at story time T."""
    skate = 0.0025 + 0.0035 * smooth((T - T3) / (TOPPLE - T3))                         # the tip skates in small circles
    tip = TOP0 + Vector((skate * math.cos(TAU * 0.6 * T), skate * math.sin(TAU * 0.6 * T), 0.0))
    if T < TOPPLE:
        tilt = 0.035 + 0.385 * clamp((T - T3) / (TOPPLE - T3)) ** 2.2                   # the wobble widens as it slows
        prec = TAU * (0.25 * T + 0.9 * max(0.0, T - T3) ** 2)                             # and precesses faster
        return tip, tilt, prec, spin_angle(T)
    tip = TOP0 + Vector((skate * math.cos(TAU * 0.6 * TOPPLE), skate * math.sin(TAU * 0.6 * TOPPLE), 0.0))
    prec0 = TAU * (0.25 * TOPPLE + 0.9 * (TOPPLE - T3) ** 2)
    p_rate = 0.25 + 1.8 * (TOPPLE - T3)                                                    # turns a second it precesses at, as it goes
    if T < IMPACT:                                                                         # the fall: gravity, so it speeds up
        u = (T - TOPPLE) / (IMPACT - TOPPLE)
        return tip, 0.42 + (REST_TILT - 0.42) * u * u, prec0 + TAU * p_rate * (T - TOPPLE), spin_angle(TOPPLE) + TAU * W1 * (T - TOPPLE)
    # on its side: one bounce, then it rolls round its tip (the hit takes 40 % of its speed), rocking, and stops
    d, D, r0 = T - IMPACT, REST - IMPACT, 0.6 * p_rate
    bounce = 0.10 * math.sin(math.pi * clamp(d / 0.13)) if d < 0.13 else 0.0
    rock = 0.03 * math.exp(-5.0 * d) * abs(math.sin(TAU * 3.0 * (d - 0.13))) if d >= 0.13 else 0.0
    roll = TAU * r0 * (d - 0.5 * d * d / D) if d < D else TAU * r0 * 0.5 * D
    prec = prec0 + TAU * p_rate * (IMPACT - TOPPLE) + roll
    spin = spin_angle(TOPPLE) + TAU * W1 * (IMPACT - TOPPLE) - roll * math.hypot(CONE_R, CONE_Z) / CONE_R      # rolling, not sliding
    return tip, REST_TILT - bounce - rock, prec, spin


def place_top(T):
    tip, tilt, prec, spin = pose_top(T)
    tip = tip + Vector((0.0, 0.0, lift(tilt)))
    S.top.location = tip
    S.top.rotation_euler = (0.0, tilt, prec)        # tilt toward +X, then turn that lean round by the precession
    S.spin.rotation_euler = (0.0, 0.0, spin - prec)
    axis = Matrix.Rotation(prec, 3, "Z") @ Matrix.Rotation(tilt, 3, "Y") @ Vector((0, 0, 1))
    return tip, axis


def animate(sid, t, i):
    T = tl.start(sid) / tl.FPS + t
    tip, axis = place_top(T)
    body = tip + axis * 0.026                       # the middle of the top: what the lens keeps sharp
    stem = tip + axis * 0.045
    if sid == "S01":                                # a low glide from the left, the pencil passing through the foreground
        pos = Vector(K(t, [(0.0, (-0.52, -0.16, 0.046)), (1.5, (-0.30, -0.36, 0.052)), (3.0, (0.04, -0.44, 0.060))], "lin"))
        C.cam_set(S.cam, pos, body + Vector((0, 0, 0.004)), lens=32, fstop=4.5, focus=body)
    elif sid == "S02":                              # a macro that drifts round it, the focus on the painted band nearest the lens
        a = math.radians(K(t, [(0.0, -150.0), (2.5, -40.0)], "lin"))
        pos = TOP0 + Vector((0.15 * math.cos(a), 0.15 * math.sin(a), K(t, [(0.0, 0.024), (2.5, 0.040)], "lin")))
        near = TOP0 + Vector((CONE_R * math.cos(a), CONE_R * math.sin(a), 0.028))
        C.cam_set(S.cam, pos, TOP0 + Vector((0, 0, 0.030)), lens=85, fstop=11.0, focus=near)
    else:                                           # it slows, falls and rolls: the lens drops to the table and pushes in
        pos = Vector(K(t, [(0.0, (-0.22, -0.30, 0.140)), (1.8, (-0.07, -0.22, 0.040)), (3.0, (0.00, -0.15, 0.018))]))
        C.cam_set(S.cam, pos, body, lens=40, fstop=5.6, focus=body)


def events():
    """What the sound mix plays: (shot, t, kind, gain, dur). The kinds are in post/mix.py's KINDS table."""
    ev = [("S01", 0.0, "spin", 0.7, 3.0), ("S02", 0.0, "spin", 1.0, 2.5), ("S03", 0.0, "spin", 0.8, round(IMPACT - T3, 3))]
    t_i = IMPACT - T3
    ev += [("S03", round(t_i, 3), "knock_heavy", 1.0, None), ("S03", round(t_i + 0.13, 3), "knock", 0.6, None),
           ("S03", round(t_i + 0.14, 3), "spin", 0.45, round(REST - IMPACT - 0.14, 3))]
    for k in range(1, 4):                           # the rocking lands every sixth of a second, softer each time
        ev.append(("S03", round(t_i + 0.13 + k / 6.0, 3), "knock", round(0.4 * math.exp(-5.0 * (0.13 + k / 6.0)) / math.exp(-5.0 * 0.3), 3), None))
    return [dict(shot=s, t=t, kind=k, gain=g, **({"dur": d} if d else {})) for s, t, k, g, d in ev]


def main():
    shots = _a[_a.index("--shots") + 1].split(",") if "--shots" in _a else tl.shots_of(SET)
    sc = build()
    B = C.Baker(sc, S.cam)
    B.add(S.top)
    B.add(S.spin)
    C.bake(B, shots, animate)
    C.save(sc, SET, events())


main()
