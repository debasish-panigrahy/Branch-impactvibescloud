#!/bin/bash
echo "Stopping any existing processes on port 5030..."
fuser -k 5030/tcp 2>/dev/null || echo "No process found on port 5030"
echo "Starting server on port 5030..."
PORT=5030 npm run dev

