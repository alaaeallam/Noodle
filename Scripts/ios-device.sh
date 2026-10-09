#!/bin/bash
# Build a Release copy of one of the mobile apps and install it on a
# physical iPhone. Bypasses `npx expo run:ios`, which fails on Xcode 27
# because Simulator.app is missing.
#
# Usage: scripts/ios-device.sh <store|app|rider> [--pods]
#   --pods   run `pod install` first (needed after native deps or the
#            Podfile change, or after a fresh clone)
#
# Device defaults to Alaa's iPhone; override with IOS_DEVICE_ID=<udid>.
set -euo pipefail

DEVICE_ID="${IOS_DEVICE_ID:-00008110-00021061222A401E}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

case "${1:-}" in
  store) WORKSPACE=EnategaStore ;;
  app)   WORKSPACE=EnategaMulti ;;
  rider) WORKSPACE=EnategaMultivendorRider ;;
  *) echo "usage: $0 <store|app|rider> [--pods]" >&2; exit 1 ;;
esac

cd "$ROOT/apps/$1/ios"

if [[ "${2:-}" == "--pods" ]]; then
  pod install
fi

# No local Sentry auth token; skip the source map / dSYM upload step.
SENTRY_DISABLE_AUTO_UPLOAD=true xcodebuild \
  -workspace "$WORKSPACE.xcworkspace" \
  -scheme "$WORKSPACE" \
  -configuration Release \
  -destination "id=$DEVICE_ID" \
  -derivedDataPath build/dd \
  -allowProvisioningUpdates \
  -quiet

xcrun devicectl device install app --device "$DEVICE_ID" \
  build/dd/Build/Products/Release-iphoneos/*.app
