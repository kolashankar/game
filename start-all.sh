#!/bin/bash

# Display welcome message
echo "==================================================="
echo "  ChronoCore: Path of Realities - Development Mode"
echo "==================================================="
echo ""

# Check for Docker
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "Docker and Docker Compose detected. Would you like to:"
    echo "1) Start all services with Docker Compose"
    echo "2) Start services individually"
    read -p "Enter your choice (1/2): " choice
    
    if [ "$choice" = "1" ]; then
        echo "Starting all services with Docker Compose..."
        docker-compose up -d
        echo ""
        echo "Services started! Access the application at:"
        echo "- Frontend: http://localhost:3000"
        echo "- Backend API: http://localhost:5000"
        echo "- AI Engine: http://localhost:8000"
        exit 0
    fi
else
    echo "Docker or Docker Compose not detected. Starting services individually..."
fi

# Function to start a service in a new terminal
start_service() {
    local service=$1
    local script=$2
    
    echo "Starting $service..."
    
    # Check if we're in a GUI environment
    if [ -n "$DISPLAY" ]; then
        # Try different terminal emulators
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd $(pwd) && ./$script; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd $(pwd) && ./$script; exec bash" &
        elif command -v konsole &> /dev/null; then
            konsole --new-tab -e "cd $(pwd) && ./$script; exec bash" &
        else
            echo "No supported terminal emulator found. Starting $service in background..."
            bash ./$script &
        fi
    else
        # No GUI, start in background
        bash ./$script &
    fi
}

# Start each service
start_service "Backend" "start-backend.sh"
sleep 2
start_service "AI Engine" "start-ai-engine.sh"
sleep 2
start_service "Frontend" "start-frontend.sh"

echo ""
echo "All services started! Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo "- AI Engine: http://localhost:8000"
echo ""
echo "Note: Check the terminal windows for each service for logs and errors."
echo "Press Ctrl+C in each terminal to stop the services."
