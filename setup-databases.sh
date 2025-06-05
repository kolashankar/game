#!/bin/bash

# ChronoCore: Path of Realities Database Setup Script
# This script installs and configures PostgreSQL and MongoDB

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${GREEN}"
echo "====================================================="
echo "  ChronoCore: Path of Realities - Database Setup     "
echo "====================================================="
echo -e "${NC}"

# Check if script is run with sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Please run this script with sudo:${NC}"
  echo "sudo ./setup-databases.sh"
  exit 1
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" &> /dev/null
}

# Install PostgreSQL
install_postgres() {
  echo -e "${GREEN}Installing PostgreSQL...${NC}"
  
  # Update package lists
  apt-get update
  
  # Install PostgreSQL
  apt-get install -y postgresql postgresql-contrib
  
  # Start PostgreSQL service
  systemctl start postgresql
  systemctl enable postgresql
  
  echo -e "${GREEN}PostgreSQL installed successfully!${NC}"
}

# Configure PostgreSQL
configure_postgres() {
  echo -e "${GREEN}Configuring PostgreSQL...${NC}"
  
  # Set PostgreSQL password
  sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'root';"
  
  # Create database
  sudo -u postgres psql -c "CREATE DATABASE chronocore;"
  
  # Create tables (optional - our app will do this automatically)
  echo -e "${GREEN}PostgreSQL configured successfully!${NC}"
}

# Install MongoDB
install_mongodb() {
  echo -e "${GREEN}Installing MongoDB...${NC}"
  
  # Import MongoDB public GPG key
  apt-get install -y gnupg
  curl -fsSL https://pgp.mongodb.com/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
  
  # Create list file for MongoDB
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
  
  # Update package lists
  apt-get update
  
  # Install MongoDB
  apt-get install -y mongodb-org
  
  # Start MongoDB service
  systemctl start mongod
  systemctl enable mongod
  
  echo -e "${GREEN}MongoDB installed successfully!${NC}"
}

# Configure MongoDB
configure_mongodb() {
  echo -e "${GREEN}Configuring MongoDB...${NC}"
  
  # Create database and user (MongoDB will create the database automatically when it's first used)
  # For now, we'll just make sure the service is running
  if systemctl is-active --quiet mongod; then
    echo -e "${GREEN}MongoDB service is running.${NC}"
  else
    echo -e "${RED}MongoDB service is not running. Attempting to start...${NC}"
    systemctl start mongod
    if systemctl is-active --quiet mongod; then
      echo -e "${GREEN}MongoDB service started successfully.${NC}"
    else
      echo -e "${RED}Failed to start MongoDB service. Please check the logs.${NC}"
    fi
  fi
  
  echo -e "${GREEN}MongoDB configured successfully!${NC}"
}

# Main installation process
main() {
  # Check if PostgreSQL is already installed
  if command_exists psql; then
    echo -e "${YELLOW}PostgreSQL is already installed.${NC}"
    read -p "Do you want to reconfigure PostgreSQL? (y/n): " reconfigure_postgres
    if [[ "$reconfigure_postgres" =~ ^[Yy]$ ]]; then
      configure_postgres
    fi
  else
    install_postgres
    configure_postgres
  fi
  
  # Check if MongoDB is already installed
  if command_exists mongod; then
    echo -e "${YELLOW}MongoDB is already installed.${NC}"
    read -p "Do you want to reconfigure MongoDB? (y/n): " reconfigure_mongodb
    if [[ "$reconfigure_mongodb" =~ ^[Yy]$ ]]; then
      configure_mongodb
    fi
  else
    install_mongodb
    configure_mongodb
  fi
  
  echo -e "${GREEN}"
  echo "====================================================="
  echo "  Database Setup Complete!                           "
  echo "====================================================="
  echo -e "${NC}"
  echo "PostgreSQL:"
  echo "  - Host: localhost"
  echo "  - Port: 5432"
  echo "  - Database: chronocore"
  echo "  - Username: postgres"
  echo "  - Password: root"
  echo ""
  echo "MongoDB:"
  echo "  - Host: localhost"
  echo "  - Port: 27017"
  echo "  - Database: chronocore"
  echo ""
  echo "You can now start the application with:"
  echo "  cd /home/lenovo/game/backend && npm run dev"
}

# Run the main function
main
