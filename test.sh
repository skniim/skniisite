#!/bin/bash

case "$1" in
  start)
    echo "Starting Vite server on port 5181..."
    nohup npx vite --port 5181 --host > test.log 2>&1 & disown
    echo "Server started in background. Logs are in test.log."
    ;;
  stop)
    # Find the PID of the process running vite on port 5181 and kill it
    PID=$(lsof -t -i:5181)

    if [ -z "$PID" ]; then
        echo "No process found running on port 5181."
    else
        echo "Stopping Vite server (PID: $PID)..."
        kill $PID
        echo "Server stopped."
    fi
    ;;
  *)
    echo "Usage: $0 {start|stop}"
    exit 1
    ;;
esac
