#!/bin/bash
# Server management script for CV app

PORT=${1:-8081}

# Kill any existing servers on the specified port
pkill -f "python3 -m http.server $PORT" 2>/dev/null
pkill -f "python3 -m http.server" 2>/dev/null

# Wait a moment for processes to terminate
sleep 1

# Start the server
cd /Users/ryad/projects/ryad.app/cv
python3 -m http.server $PORT

# The server will run in foreground; press Ctrl+C to stop
