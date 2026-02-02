#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
echo "Extension folder (use this in 'Load unpacked'):"
echo "$ROOT_DIR"
echo ""
if command -v google-chrome &>/dev/null; then
  google-chrome "chrome://extensions" 2>/dev/null &
elif command -v google-chrome-stable &>/dev/null; then
  google-chrome-stable "chrome://extensions" 2>/dev/null &
elif command -v chromium-browser &>/dev/null; then
  chromium-browser "chrome://extensions" 2>/dev/null &
else
  echo "Open Chrome and go to: chrome://extensions"
fi
