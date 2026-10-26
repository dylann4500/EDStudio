#!/bin/sh
# Score one render with TRIBE v2, ONE RUN AT A TIME across every worktree and session: two runs at once swap the 24 GB Mac
# (a run degraded to 100 s/clip). Waits for the lock, runs run_tribe.py in the main checkout (where .venv + caches live),
# then score.py with the video's shots.js, and writes the report next to the video.
# Usage (from the repo root or any worktree; run it in the background, it can wait an hour+ for the lock):
#   sh tools/tribe-score.sh videos/NNN-slug v1      ->  videos/NNN-slug/tribe-v1.txt  (last line: TARGET MET / NOT MET)
# A stale lock (its PID is gone) is taken over. `--status` prints who holds the lock.
set -e
MAIN=$(cd "$(git rev-parse --git-common-dir)/.." && pwd)
TE="$MAIN/tribe-experiment"; LOCK="$TE/.tribe.lock"
if [ "$1" = "--status" ]; then cat "$LOCK/owner" 2>/dev/null || echo "free"; exit 0; fi
V=$(cd "$1" && pwd); TAG="${2:?usage: tribe-score.sh videos/NNN-slug vK}"
NAME="$(basename "$V" | cut -d- -f1)-$TAG"
[ -f "$V/final.mp4" ] || { echo "no $V/final.mp4 — render first"; exit 1; }
mkdir -p "$TE/videos" "$TE/logs"; cp "$V/final.mp4" "$TE/videos/$NAME.mp4"

while ! mkdir "$LOCK" 2>/dev/null; do
  PID=$(sed -n 1p "$LOCK/owner" 2>/dev/null || true)
  if [ -n "$PID" ] && ! kill -0 "$PID" 2>/dev/null; then echo "stale lock ($PID gone), taking it"; rm -rf "$LOCK"; continue; fi
  echo "$(date +%H:%M) waiting for TRIBE lock: $(tr '\n' ' ' < "$LOCK/owner" 2>/dev/null)"; sleep 60
done
trap 'rm -rf "$LOCK"' EXIT INT TERM
printf '%s\n%s\n%s\n' "$$" "$NAME" "$(date '+%F %H:%M')" > "$LOCK/owner"

cd "$TE"
rm -f "results/$NAME.npy"   # run_tribe.py skips finished stems; a re-render under the same tag must re-score (the per-clip cache keeps it fast)
echo "$(date +%H:%M) TRIBE $NAME started (log: $TE/logs/$NAME.log)"
caffeinate -i .venv/bin/python -u run_tribe.py "videos/$NAME.mp4" > "logs/$NAME.log" 2>&1 || { tail -20 "logs/$NAME.log"; exit 1; }
.venv/bin/python score.py "results/$NAME.npy" "$V/shots.js" | tee "$V/tribe-$TAG.txt"
echo "$(date +%H:%M) TRIBE $NAME done"
