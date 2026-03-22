#!/bin/bash
# Build script for Chrome Web Store submission
# Creates a ZIP file of the extension directory

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
EXT_DIR="$PROJECT_DIR/extension"
OUT_DIR="$PROJECT_DIR/dist"

# Read version from manifest
VERSION=$(grep -o '"version": "[^"]*"' "$EXT_DIR/manifest.json" | cut -d'"' -f4)
OUTPUT_FILE="$OUT_DIR/tab-manager-v${VERSION}.zip"

echo "Building Tab Manager v${VERSION}..."

# Create dist directory
mkdir -p "$OUT_DIR"

# Remove old build if exists
rm -f "$OUTPUT_FILE"

# Create ZIP from extension directory
cd "$EXT_DIR"
zip -r "$OUTPUT_FILE" . \
    -x ".*" \
    -x "__MACOSX/*" \
    -x "*.DS_Store"

echo ""
echo "Build complete: $OUTPUT_FILE"
echo "Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
echo ""
echo "Next steps:"
echo "  1. Go to https://chrome.google.com/webstore/devconsole"
echo "  2. Click 'New Item' and upload $OUTPUT_FILE"
echo "  3. Fill in the store listing (see store/listing-en.md)"
echo "  4. Set visibility to 'Unlisted'"
echo "  5. Submit for review"
