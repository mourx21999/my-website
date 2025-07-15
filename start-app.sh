#!/bin/bash

# Kill any existing processes on ports 5001 and 3005
echo "Stopping any existing servers..."
fuser -k 5001/tcp 2>/dev/null || true
fuser -k 3005/tcp 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Start the backend server in the background
echo "Starting backend server on port 5001..."
cd server
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Go back to project root
cd ..

# Start the React frontend on port 3005
echo "Starting React frontend on port 3005..."
PORT=3005 npm start &
FRONTEND_PID=$!

echo "Backend server running on http://localhost:5001 (PID: $BACKEND_PID)"
echo "Frontend server running on http://localhost:3005 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to press Ctrl+C
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait 