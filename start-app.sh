#!/bin/bash

# Kill any existing processes on ports 5847 and 3847
echo "Stopping any existing servers..."
fuser -k 5847/tcp 2>/dev/null || true
fuser -k 3847/tcp 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Start the backend server in the background
echo "Starting backend server on port 5847..."
cd server
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Go back to project root
cd ..

# Start the React frontend on port 3005
echo "Starting React frontend on port 3847..."
PORT=3847 npm start &
FRONTEND_PID=$!

echo "Backend server running on http://localhost:5847 (PID: $BACKEND_PID)"
echo "Frontend server running on http://localhost:3847 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to press Ctrl+C
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait 