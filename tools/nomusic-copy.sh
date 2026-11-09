#!/bin/sh
# No-music cut for posting with a TRENDING sound (user, Nov 8 2026: "most of the background music's kind of ass" → we add a
# trending TikTok / Instagram sound in the app at upload, under the voice). Mixes every stem in out/stems EXCEPT music.wav
# (voice, sfx, amb, …) onto final.mp4's picture (stream copy, no re-encode), then makes the < 10 MB HEVC upload copy of it.
# Usage: sh tools/nomusic-copy.sh videos/NNN-slug  ->  out/nomusic.mp4 (full quality) + out/upload-nomusic.mp4 (< 10 MB)
# Needs: final.mp4 + out/stems/*.wav (audio/synth.py writes the stems post-master, so their sum is the mix minus the music).
set -e
V="$1"; S="$V/out/stems"; FIN="$V/final.mp4"
[ -f "$FIN" ] || { echo "no $FIN — render first"; exit 1; }
set --; LBL=""; N=0
for f in "$S"/*.wav; do
  [ -f "$f" ] || continue
  case "$(basename "$f")" in music.wav) continue;; esac
  N=$((N + 1)); set -- "$@" -i "$f"; LBL="$LBL[$N:a]"
done
[ "$N" -ge 1 ] || { echo "no non-music stems in $S — run python3 -I audio/synth.py <slug> first"; exit 1; }
ffmpeg -v error -y -i "$FIN" "$@" -filter_complex "${LBL}amix=inputs=$N:normalize=0:duration=longest,alimiter=limit=0.94[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$V/out/nomusic.mp4"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V/out/nomusic.mp4")
KBPS=$(python3 -c "print(int((9.4 * 8 * 1024) / float('$DUR') - 100))")   # same 9.4 MB budget as tools/upload-copy.sh
cd "$V/out"
ffmpeg -v error -y -i nomusic.mp4 -c:v libx265 -preset slow -b:v ${KBPS}k -x265-params pass=1:log-level=error -an -f null /dev/null
ffmpeg -v error -y -i nomusic.mp4 -c:v libx265 -preset slow -b:v ${KBPS}k -x265-params pass=2:log-level=error -tag:v hvc1 -c:a aac -b:a 96k -movflags +faststart upload-nomusic.mp4
rm -f x265_2pass.log x265_2pass.log.cutree
ls -la nomusic.mp4 upload-nomusic.mp4
