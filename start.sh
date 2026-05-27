#!/usr/bin/env bash
set -euo pipefail

# MileVox — Start script
# Runs the production build preview server on port 5173.

cd "$(dirname "$0")"

echo "🔧 MileVox — Voice-Activated Mileage & Maintenance Tracker"
echo ""

# Check if dist exists, build if not
if [ ! -d "dist" ]; then
  echo "📦 Building for production..."
  npm run build
  echo ""
fi

echo "🚀 Starting preview server on http://0.0.0.0:5173"
echo ""

npx vite preview --port 5173 --host