#!/bin/bash
echo "Stopping any existing backend server..."
pkill -f "node index.js" 2>/dev/null || true

echo "Starting backend server..."
cd server
nohup npm start > server.log 2>&1 &

sleep 3
echo "Checking if backend is running..."
curl -s http://localhost:5847 > /dev/null && echo "✅ Backend is running on http://localhost:5847" || echo "❌ Backend failed to start" 