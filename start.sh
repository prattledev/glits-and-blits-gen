#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting backend..."
cd "$SCRIPT_DIR/backend"
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo ""
echo "  Backend API: http://localhost:8000"
echo "  Full app:    docker compose up --build"
echo ""
echo "Press Ctrl+C to stop."

cleanup() {
  echo "Stopping..."
  kill $BACKEND_PID 2>/dev/null
  exit 0
}
trap cleanup INT TERM

wait
