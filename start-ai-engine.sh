#!/bin/bash

# Change to the AI engine directory
cd "$(dirname "$0")/ai-engine"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if virtual environment exists, if not create one
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if not already installed
if ! pip freeze | grep -q "langchain"; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the AI engine
echo "Starting the ChronoCore AI engine..."
python main.py
