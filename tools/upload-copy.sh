#!/bin/sh
# Make a TikTok upload copy of a video under 10 MB (the Claude-in-Chrome file_upload limit): 2-pass HEVC at a bitrate
# sized to the duration, hvc1-tagged for Apple/TikTok, AAC 96k. At ~1 Mbps it is visually identical to final.mp4 at
# phone size (checked on 014), and TikTok re-encodes every upload anyway.
# Usage: sh tools/upload-copy.sh videos/NNN-slug   ->  videos/NNN-slug/out/upload.mp4
set -e
V="$1"; IN="$V/final.mp4"; OUT="$V/out/upload.mp4"; mkdir -p "$V/out"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
KBPS=$(python3 -c "print(int((9.4 * 8 * 1024) / float('$DUR') - 100))")   # 9.4 MB budget minus audio
cd "$V/out"
ffmpeg -v error -y -i ../final.mp4 -c:v libx265 -preset slow -b:v ${KBPS}k -x265-params pass=1:log-level=error -an -f null /dev/null
ffmpeg -v error -y -i ../final.mp4 -c:v libx265 -preset slow -b:v ${KBPS}k -x265-params pass=2:log-level=error -tag:v hvc1 -c:a aac -b:a 96k -movflags +faststart upload.mp4
rm -f x265_2pass.log x265_2pass.log.cutree
ls -la upload.mp4
