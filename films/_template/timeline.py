"""The film on one clock: every other file reads this one (the sets, the screens, the sound and the edit).

    python3 timeline.py                 print the shot table
    python3 timeline.py --json          the same as JSON (for the screens and the mix)
    python3 timeline.py --music [ids]   the music inside each shot, on the clock the animation is keyed in

THIS IS THE TEMPLATE'S EXAMPLE FILM: a wooden spinning top on a table at golden hour, three shots on one set. Replace
SHOTS, SETS, CUES (and the music, when there is one) with your own film; keep the functions below.

Two clocks:
  SHOTS (with frames/start/block) is the STORY clock: what is animated and rendered, shot by shot.
  EDIT (trim + speed per shot) is the CUT: the film may show only part of a rendered shot, so it can be tightened and
  laid on the music's beat without rendering again. Only post/compose.py and post/mix.py read the film clock
  (cut, cut_start, film_frames, film_time); the sets and screens key everything in story seconds.
"""
import json
import sys

FPS = 24
W, H = 3840, 2160         # 16:9 4K. For a vertical film: 2160 x 3840 (and frame every shot for it)
END_CARD = 0.0            # seconds of end card added by post/compose.py (out/cards/endcard.png); 0 = none
XFADE = 0.0               # cross-fade from the last shot into the end card (0.5 with a card)

# id, set, seconds, light state, what happens (the line a set builder animates to; write it as a shot description)
SHOTS = [
    ("S01", "table", 3.0, "golden", "Low wide glide along the table at golden hour: a wooden top spins in the window light, its shadow long on the grain."),
    ("S02", "table", 2.5, "golden", "Macro on the top: its painted dots blur into a ring with the spin; the lens drifts round it, focused on the band."),
    ("S03", "table", 3.0, "golden", "It slows, wobbles wider and wider, tips over (t 1.6), rolls in an arc and rocks to a stop. The lens drops to the table and pushes in."),
]

SETS = ["table"]          # one file per set: blender/set_<name>.py

# Moments inside shots that more than one department needs (seconds from the start of the shot): the animation,
# the screens and the sound all read these, so a hit, the picture and its sound stay together.
CUES = {
    "S03": {"topple": 1.60, "rest": 2.60},
}

# Frame-number blocks: every shot owns 1000 Blender frames (motion blur looks one frame either side, so shots never
# touch). Blocks are FIXED per shot so that adding or reordering shots never renumbers frames already rendered:
# append new shots at the END of this list, never reorder or delete from it.
BLOCK_ORDER = ["S01", "S02", "S03"]


def shot(sid):
    for s in SHOTS:
        if s[0] == sid:
            return s
    raise KeyError(sid)


def frames(sid):
    """Frames in the rendered shot."""
    return int(round(shot(sid)[2] * FPS))


def start(sid):
    """The shot's first frame on the story clock (frame 0 = the first frame of the film, before the edit)."""
    n = 0
    for s in SHOTS:
        if s[0] == sid:
            return n
        n += frames(s[0])
    raise KeyError(sid)


def block(sid):
    """The shot's own block of frame numbers inside Blender: 1000, 2000, ... (BLOCK_ORDER: fixed, not the film order)."""
    return 1000 * (BLOCK_ORDER.index(sid) + 1)


def bframe(sid, i):
    """Blender frame number of the shot's i-th frame (i runs -1 .. frames, one spare each end for motion blur)."""
    return block(sid) + i


# ── the edit ──────────────────────────────────────────────────────────────────────────────────────────────────────
# EDIT[shot] = (first second shown, last second shown, speed). A shot not listed is shown whole at speed 1.
# Filled from the music below when CUT_AT names every shot; you may also write entries by hand.
EDIT = {}


def edit(sid):
    a, b, sp = EDIT.get(sid, (0.0, shot(sid)[2], 1.0))
    return max(0.0, a), min(shot(sid)[2], b), sp


def cut(sid):
    """The rendered frames of the shot that the film shows, in order (indices 0 .. frames-1). Speed drops frames."""
    a, b, sp = edit(sid)
    i0, i1 = int(round(a * FPS)), min(frames(sid), int(round(b * FPS)))
    n = max(1, int(round((i1 - i0) / sp)))
    return [min(i1 - 1, i0 + int(k * sp + 1e-6)) for k in range(n)]


def cut_start(sid):
    """The shot's first frame on the FILM clock (after the edit)."""
    n = 0
    for s in SHOTS:
        if s[0] == sid:
            return n
        n += len(cut(s[0]))
    raise KeyError(sid)


def film_frames():
    return sum(len(cut(s[0])) for s in SHOTS)


def film_time(sid, t):
    """Seconds on the FILM clock at which moment t (seconds into the rendered shot) is seen; None if it is cut out."""
    a, b, sp = edit(sid)
    if t < a - 1e-6 or t >= b - 1e-6:
        return None
    return cut_start(sid) / FPS + (t - a) / sp


# ── the music, and the cut laid on it ────────────────────────────────────────────────────────────────────────────
# Optional. With a track: put it at MUSIC_FILE, run  python3 tools/beats.py sound/music/track.flac  for its beats,
# copy them into BEATS, name the big moments in ACCENTS, and set CUT_AT (where each shot starts on the film clock,
# each on a beat) and FILM_END. EDIT is then derived, and  python3 timeline.py --music  shows every set builder the
# beats inside their shots, so hits and landings can be keyed onto them (docs/FILMS.md: music first, then picture).
MUSIC_FILE = "sound/music/track.flac"
BEATS = []                # seconds of the track, as it plays from the film's first frame
ACCENTS = {}              # name: time (or (from, to)) in the track: the moments the picture is laid on
CUT_AT = {}               # shot id: film second where it starts (all shots, or leave empty for whole shots)
FILM_END = None           # film second of the last shot's end (with CUT_AT)
HEAD = {}                 # shot id: seconds dropped from the head of the rendered shot


def _edit_from_music():
    ids = [s[0] for s in SHOTS]
    if not CUT_AT or any(i not in CUT_AT for i in ids) or FILM_END is None:
        return {}
    out = {}
    for k, sid in enumerate(ids):
        f0 = int(round(CUT_AT[sid] * FPS))
        f1 = int(round((CUT_AT[ids[k + 1]] if k + 1 < len(ids) else FILM_END) * FPS))
        a = HEAD.get(sid, 0.0)
        need = int(round(a * FPS)) + (f1 - f0)
        if need > frames(sid):
            raise ValueError("%s is %d frames but the cut needs %d: make the shot longer in SHOTS" % (sid, frames(sid), need))
        out[sid] = (a, a + (f1 - f0) / FPS, 1.0)
    return out


def music_map(sid):
    """The music inside a shot, in seconds from the start of the RENDERED shot (what the animation is keyed in):
    (first second shown, last second shown, [beat times], {accent: time or (from, to)}). Land things on these."""
    a, b, sp = edit(sid)
    t0 = cut_start(sid) / FPS
    loc = lambda t: round(a + (t - t0) * sp, 3)
    beats = [loc(t) for t in BEATS if t0 - 1e-6 <= t < t0 + (b - a) / sp]
    acc = {}
    for name, t in ACCENTS.items():
        lo, hi = (t if isinstance(t, tuple) else (t, t))
        if lo < t0 + (b - a) / sp and hi >= t0:
            acc[name] = (loc(lo), loc(hi)) if isinstance(t, tuple) else loc(t)
    return a, b, beats, acc


def shots_of(set_name):
    return [s[0] for s in SHOTS if s[1] == set_name]


def light(sid):
    return shot(sid)[3]


def total_frames():
    return sum(frames(s[0]) for s in SHOTS)


def table():
    rows = []
    for s in SHOTS:
        rows.append({"id": s[0], "set": s[1], "seconds": s[2], "light": s[3], "frames": frames(s[0]),
                     "start_frame": start(s[0]), "start_s": round(start(s[0]) / FPS, 3), "block": block(s[0]), "what": s[4],
                     "edit": list(edit(s[0])), "cut_frames": len(cut(s[0])), "cut_start_frame": cut_start(s[0])})
    return rows


assert len(set(BLOCK_ORDER)) == len(BLOCK_ORDER) and all(s[0] in BLOCK_ORDER for s in SHOTS), "every shot needs its place in BLOCK_ORDER"
EDIT.update(_edit_from_music())


if __name__ == "__main__":
    if "--music" in sys.argv:
        only = [x for x in sys.argv[1:] if not x.startswith("--")]
        for s_ in SHOTS:
            if only and s_[0] not in only and s_[1] not in only:
                continue
            a_, b_, beats_, acc_ = music_map(s_[0])
            print("%s  rendered %.1f s, shown %.2f-%.2f s  (film %.2f-%.2f)" % (s_[0], s_[2], a_, b_, cut_start(s_[0]) / FPS, (cut_start(s_[0]) + len(cut(s_[0]))) / FPS))
            print("     beats at   " + ("  ".join("%.2f" % v for v in beats_) or "(no music yet)"))
            if acc_:
                print("     accents    " + ",  ".join("%s %s" % (k_, ("%.2f-%.2f" % v_) if isinstance(v_, tuple) else "%.2f" % v_) for k_, v_ in acc_.items()))
            if s_[0] in CUES:
                print("     cues       " + ",  ".join("%s %.2f" % kv for kv in CUES[s_[0]].items()))
        sys.exit(0)
    if "--json" in sys.argv:
        print(json.dumps({"fps": FPS, "width": W, "height": H, "end_card": END_CARD, "xfade": XFADE,
                          "total_frames": total_frames(), "film_frames": film_frames(), "cues": CUES, "shots": table()}, indent=1))
    else:
        for r in table():
            print("%s  %-6s %4.1fs %3d fr  cut %4.2fs @%6.2fs  block %5d  %-7s %s" % (r["id"], r["set"], r["seconds"], r["frames"], r["cut_frames"] / FPS,
                                                                                    r["cut_start_frame"] / FPS, r["block"], r["light"], r["what"][:60]))
        n = film_frames()
        print("rendered: %d frames, %.1f s.  film after the edit: %d frames, %.1f s%s" % (total_frames(), total_frames() / FPS, n, n / FPS,
                                                                                         "  (+ %.1f s end card)" % END_CARD if END_CARD else ""))
