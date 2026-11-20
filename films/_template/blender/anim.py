"""Timing and motion maths shared by every set. Pure Python (no bpy), so the sound mix can read it too.

All times are seconds from the start of a shot. All sizes are metres.
"""
import math


def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def lerp(a, b, u):
    if isinstance(a, (tuple, list)):
        return tuple(lerp(x, y, u) for x, y in zip(a, b))
    return a + (b - a) * u


def smooth(u):
    u = clamp(u)
    return u * u * (3 - 2 * u)


def smoother(u):
    u = clamp(u)
    return u * u * u * (u * (u * 6 - 15) + 10)


def ease_out(u, p=3.0):
    return 1 - (1 - clamp(u)) ** p


def ease_in(u, p=3.0):
    return clamp(u) ** p


def back_out(u, s=1.70158):
    """Overshoots a little, then settles: a pop."""
    u = clamp(u) - 1
    return u * u * ((s + 1) * u + s) + 1


def win(t, a, b):
    """0 before a, 1 after b, linear between."""
    return clamp((t - a) / (b - a)) if b > a else float(t >= b)


EASES = {"lin": lambda u: clamp(u), "smooth": smooth, "smoother": smoother, "out": ease_out, "in": ease_in, "back": back_out}


def K(t, keys, ease="smooth"):
    """Keyframes: keys = [(t0, v0), (t1, v1), ...] (values are numbers or tuples). Holds before the first and after
    the last. A key may carry its own ease as a third item: the ease INTO that key."""
    if t <= keys[0][0]:
        return keys[0][1]
    for a, b in zip(keys, keys[1:]):
        if t <= b[0]:
            e = EASES[b[2] if len(b) > 2 else ease]
            return lerp(a[1], b[1], e((t - a[0]) / (b[0] - a[0])))
    return keys[-1][1]


def pulse(t, t0, up=0.08, down=0.25):
    """0 → 1 → 0 around an event at t0: fast up, slower down."""
    if t < t0:
        return 0.0
    if t < t0 + up:
        return smooth((t - t0) / up)
    return 1 - smooth((t - t0 - up) / down)


def wobble(t, t0, freq=9.0, decay=7.0):
    """A damped ring after an event at t0: starts at 1, swings about 0. Multiply by an angle."""
    if t < t0:
        return 0.0
    d = t - t0
    return math.exp(-decay * d) * math.cos(2 * math.pi * freq * d)


def vnoise(x, seed=0):
    """Smooth deterministic noise in -1..1 (never use random(): renders must repeat exactly)."""
    def h(i):
        n = (i * 374761393 + seed * 668265263) & 0xFFFFFFFF
        n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
        return ((n ^ (n >> 16)) & 0xFFFF) / 32767.5 - 1.0
    i = math.floor(x)
    return lerp(h(i), h(i + 1), smooth(x - i))


def rnd(i, seed=0):
    """Deterministic 0..1 for an integer."""
    n = (i * 2654435761 + seed * 40503 + 12345) & 0xFFFFFFFF
    n = ((n ^ (n >> 15)) * 2246822519) & 0xFFFFFFFF
    return ((n ^ (n >> 13)) & 0xFFFFFF) / float(0xFFFFFF)


class Path:
    """A route through 2-D or 3-D points, sampled by distance. `round_` > 0 rounds the corners (Catmull-Rom)."""

    def __init__(self, pts, round_=0):
        pts = [tuple(p) + (0.0,) * (3 - len(p)) for p in pts]
        if round_ and len(pts) > 2:
            out = []
            P = [pts[0]] + pts + [pts[-1]]
            for i in range(1, len(P) - 2):
                for k in range(round_):
                    u = k / round_
                    out.append(tuple(0.5 * ((2 * P[i][j]) + (-P[i - 1][j] + P[i + 1][j]) * u + (2 * P[i - 1][j] - 5 * P[i][j] + 4 * P[i + 1][j] - P[i + 2][j]) * u * u + (-P[i - 1][j] + 3 * P[i][j] - 3 * P[i + 1][j] + P[i + 2][j]) * u ** 3) for j in range(3)))
            out.append(pts[-1])
            pts = out
        self.pts = pts
        self.cum = [0.0]
        for a, b in zip(pts, pts[1:]):
            self.cum.append(self.cum[-1] + math.dist(a, b))
        self.length = self.cum[-1]

    def at(self, s):
        """(x, y, z), yaw at distance s along the route (yaw 0 faces +X)."""
        s = clamp(s, 0.0, self.length)
        for i in range(1, len(self.cum)):
            if s <= self.cum[i] or i == len(self.cum) - 1:
                a, b = self.pts[i - 1], self.pts[i]
                seg = self.cum[i] - self.cum[i - 1]
                u = (s - self.cum[i - 1]) / seg if seg > 1e-9 else 0.0
                return lerp(a, b, u), math.atan2(b[1] - a[1], b[0] - a[0])
        return self.pts[-1], 0.0


class HopWalk:
    """Peg figures have no legs: they travel in little hops (crouch, spring, land with a squash).

    route: a Path. Starts at time t0 from distance s0 and makes hops of `step` metres, each `dur` seconds,
    `height` metres high, until `s1` (default: the end). `.at(t)` gives the pose; `.landings` the landing
    times (for the foley)."""

    def __init__(self, route, t0, step=0.03, dur=0.2, height=0.012, s0=0.0, s1=None, rest=0.0):
        self.r, self.t0, self.step, self.dur, self.h, self.s0, self.rest = route, t0, step, dur, height, s0, rest
        self.s1 = route.length if s1 is None else s1
        self.n = max(1, int(math.ceil((self.s1 - s0) / step - 1e-6)))
        self.per = dur + rest
        self.t1 = t0 + self.n * self.per
        self.landings = [t0 + i * self.per + dur for i in range(self.n)]

    def at(self, t):
        """dict: pos (x, y, z with the hop's height added), yaw, air 0..1 (height fraction), squash (1 = rest,
        < 1 squashed, > 1 stretched), lean (radians, forward +), moving (bool)."""
        if t <= self.t0:
            p, yaw = self.r.at(self.s0)
            return {"pos": p, "yaw": yaw, "air": 0.0, "squash": 1.0, "lean": 0.0, "moving": False}
        if t >= self.t1:
            p, yaw = self.r.at(self.s1)
            d = t - self.t1
            return {"pos": p, "yaw": yaw, "air": 0.0, "squash": 1.0 - 0.14 * math.exp(-18 * d) * math.cos(30 * d), "lean": 0.0, "moving": False}
        k = (t - self.t0) / self.per
        i = int(k)
        u = clamp((k - i) * self.per / self.dur)
        sa = min(self.s0 + i * self.step, self.s1)
        sb = min(self.s0 + (i + 1) * self.step, self.s1)
        p, yaw = self.r.at(lerp(sa, sb, u))
        air = 4 * u * (1 - u)
        squash = 1.0 + 0.16 * air - 0.16 * max(0.0, 1 - u * 8) - 0.1 * max(0.0, (u - 0.9) * 10)
        return {"pos": (p[0], p[1], p[2] + self.h * air), "yaw": yaw, "air": air, "squash": squash, "lean": 0.16 * (1 - 2 * u) * air + 0.05, "moving": True}


def jump(t, t0, dur, p0, p1, height):
    """One ballistic jump from p0 to p1 between t0 and t0 + dur: (pos, air 0..1, u 0..1)."""
    u = clamp((t - t0) / dur)
    air = 4 * u * (1 - u)
    p = lerp(tuple(p0), tuple(p1), u)
    return (p[0], p[1], p[2] + height * air), air, u


def look_yaw(a, b):
    """Yaw that faces from point a toward point b."""
    return math.atan2(b[1] - a[1], b[0] - a[0])
