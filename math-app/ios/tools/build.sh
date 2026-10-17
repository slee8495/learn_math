#!/bin/bash
# Build the iOS shell and upload it to TestFlight, then attach it to the tester group:
#   ios/tools/build.sh [outDir]
#   node ios/tools/asc.mjs <uploadedSinceMs>     (once Apple finishes processing, ~10-25 min)
#
# Builds from a copy outside the repo: the repo is in iCloud Drive, whose extended
# attributes break code signing and which spawns "Duth 2.xcodeproj" duplicates.
# No secrets here; signing uses Xcode's account, the API key lives in ~/.appstoreconnect.
set -e
SRC="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-/tmp/duth-build}"
mkdir -p "$OUT"
rsync -a --delete --exclude '*.xcodeproj' "$SRC/" "$OUT/src/"
xattr -cr "$OUT/src"
cd "$OUT/src"
xcodegen generate >/dev/null
rm -rf "$OUT/Duth.xcarchive" "$OUT/export"
echo "▸ archive…"
xcodebuild -project Duth.xcodeproj -scheme Duth -configuration Release -destination generic/platform=iOS \
  -archivePath "$OUT/Duth.xcarchive" -derivedDataPath "$OUT/dd" -allowProvisioningUpdates archive > "$OUT/archive.log" 2>&1 \
  || { tail -30 "$OUT/archive.log"; exit 1; }
echo "▸ upload…"
xcodebuild -exportArchive -archivePath "$OUT/Duth.xcarchive" \
  -exportOptionsPlist tools/ExportOptions.plist -exportPath "$OUT/export" \
  -allowProvisioningUpdates > "$OUT/export.log" 2>&1 \
  || { tail -30 "$OUT/export.log"; exit 1; }
echo "▸ uploaded. Apple usually takes 10-25 minutes to process it. Then:"
echo "   node ios/tools/asc.mjs $(node -e 'console.log(Date.now()-3600000)')"
