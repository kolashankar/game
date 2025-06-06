#!/bin/bash

# ChronoCore: Path of Realities Deployment Script
# This script helps deploy the application stack

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${GREEN}"
echo "====================================================="
echo "  ChronoCore: Path of Realities - Deployment Script  "
echo "====================================================="
echo -e "${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker and try again.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose and try again.${NC}"
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating a sample .env file...${NC}"
    cat > .env << EOL
# ChronoCore Environment Variables
# Replace these values with your actual credentials

# OpenAI API Key (Required for AI Engine)
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Vector Database (Required for AI Engine)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here

# JWT Secret (Required for Backend)
JWT_SECRET=generate_a_strong_secret_key_here

# Database Credentials (Optional - defaults are set in docker-compose.yml)
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

# Deployment Settings
NODE_ENV=production
EOL
    echo -e "${YELLOW}Please edit the .env file with your actual credentials before deploying.${NC}"
    read -p "Press Enter to continue or Ctrl+C to cancel..."
fi

# Function to display help
show_help() {
    echo "Usage: ./deploy.sh [OPTION]"
    echo "Deploy ChronoCore: Path of Realities application stack"
    echo ""
    echo "Options:"
    echo "  -h, --help      Display this help message"
    echo "  -b, --build     Build and start the containers"
    echo "  -u, --up        Start the containers without building"
    echo "  -d, --down      Stop and remove the containers"
    echo "  -r, --restart   Restart the containers"
    echo "  -l, --logs      View logs from all containers"
    echo "  -c, --clean     Clean up unused Docker resources"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh -b  # Build and start the application"
    echo "  ./deploy.sh -l  # View logs from all containers"
}

# Parse command line arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    -b|--build)
        echo -e "${GREEN}Building and starting containers...${NC}"
        docker-compose up --build -d
        ;;
    -u|--up)
        echo -e "${GREEN}Starting containers...${NC}"
        docker-compose up -d
        ;;
    -d|--down)
        echo -e "${YELLOW}Stopping and removing containers...${NC}"
        docker-compose down
        ;;
    -r|--restart)
        echo -e "${YELLOW}Restarting containers...${NC}"
        docker-compose restart
        ;;
    -l|--logs)
        echo -e "${GREEN}Showing logs from all containers...${NC}"
        docker-compose logs -f
        ;;
    -c|--clean)
        echo -e "${YELLOW}Cleaning up unused Docker resources...${NC}"
        docker system prune -f
        echo -e "${GREEN}Cleanup complete.${NC}"
        ;;
    *)
        echo -e "${YELLOW}No option specified. Starting with default options...${NC}"
        docker-compose up -d
        ;;
esac

# Check if containers are running
if [[ "$1" == "-b" || "$1" == "--build" || "$1" == "-u" || "$1" == "--up" || -z "$1" ]]; then
    echo -e "${GREEN}Checking container status...${NC}"
    sleep 5
    
    # Get container status
    FRONTEND_STATUS=$(docker-compose ps frontend | grep -q "Up" && echo "Running" || echo "Stopped")
    BACKEND_STATUS=$(docker-compose ps backend | grep -q "Up" && echo "Running" || echo "Stopped")
    AI_ENGINE_STATUS=$(docker-compose ps ai-engine | grep -q "Up" && echo "Running" || echo "Stopped")
    POSTGRES_STATUS=$(docker-compose ps postgres | grep -q "Up" && echo "Running" || echo "Stopped")
    MONGODB_STATUS=$(docker-compose ps mongodb | grep -q "Up" && echo "Running" || echo "Stopped")
    
    # Print status table
    echo -e "${GREEN}Container Status:${NC}"
    echo "====================================================="
    echo -e "Frontend:   ${FRONTEND_STATUS}"
    echo -e "Backend:    ${BACKEND_STATUS}"
    echo -e "AI Engine:  ${AI_ENGINE_STATUS}"
    echo -e "PostgreSQL: ${POSTGRES_STATUS}"
    echo -e "MongoDB:    ${MONGODB_STATUS}"
    echo "====================================================="
    
    # Print access URLs
    echo -e "${GREEN}Access URLs:${NC}"
    echo "Frontend:   https://game-frontend-7455.onrender.com"
    echo "Backend API: https://game-ujiz.onrender.com"
    echo "AI Engine API: https://game-ai-engine.onrender.com"
    echo "====================================================="
    
    echo -e "${GREEN}Deployment complete!${NC}"
    echo "Use './deploy.sh -l' to view logs"
fi

exit 0
