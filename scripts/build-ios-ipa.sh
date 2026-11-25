#!/usr/bin/env bash
# Build an unsigned device IPA from the committed Capacitor iOS project.
# Unsigned IPAs are for sideloading (AltStore, Sideloadly, Xcode), not for
# direct install or App Store distribution.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE="$ROOT/apps/mobile"
OUT_DIR="${1:-$MOBILE/artifacts}"
BUILD_DIR="$MOBILE/ios/DerivedData"
APP_PATH="$BUILD_DIR/Build/Products/Release-iphoneos/App.app"
IPA_PATH="$OUT_DIR/TasteChef-unsigned.ipa"

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild not found. Build the IPA on macOS with Xcode installed." >&2
  exit 1
fi

if [ ! -d "$MOBILE/ios/App/App.xcworkspace" ]; then
  echo "Missing iOS workspace. Run 'pnpm --filter @tastechef/mobile exec cap sync ios' first." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

xcodebuild \
  -workspace "$MOBILE/ios/App/App.xcworkspace" \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -derivedDataPath "$BUILD_DIR" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  build

if [ ! -d "$APP_PATH" ]; then
  echo "Build product not found at $APP_PATH" >&2
  exit 1
fi

rm -rf "$OUT_DIR/Payload" "$IPA_PATH"
mkdir -p "$OUT_DIR/Payload"
cp -R "$APP_PATH" "$OUT_DIR/Payload/"
(cd "$OUT_DIR" && zip -qry "$(basename "$IPA_PATH")" Payload)
rm -rf "$OUT_DIR/Payload"

ls -lh "$IPA_PATH"
