#!/bin/sh
# Make the phone preview for the review email (the user's phone agent texts it on): H.264 720x1280 + AAC so every phone
# plays it, 2-pass at a bitrate sized to stay under ~4.5 MB (MMS-friendly; upload.mp4 is HEVC and ~9.5 MB).
# Usage: sh tools/preview-copy.sh videos/NNN-slug   ->  videos/NNN-slug/out/preview.mp4
set -e
V="$1"; mkdir -p "$V/out"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V/final.mp4")
KBPS=$(python3 -c "print(int((4.4 * 8 * 1024) / float('$DUR') - 64))")   # 4.4 MB budget minus 64k audio
cd "$V/out"
ffmpeg -v error -y -i ../final.mp4 -vf scale=720:1280 -c:v libx264 -preset slow -b:v ${KBPS}k -pass 1 -passlogfile pv -an -f null /dev/null
ffmpeg -v error -y -i ../final.mp4 -vf scale=720:1280 -c:v libx264 -preset slow -b:v ${KBPS}k -pass 2 -passlogfile pv -pix_fmt yuv420p -c:a aac -b:a 64k -movflags +faststart preview.mp4
rm -f pv-0.log pv-0.log.mbtree
ls -la preview.mp4
