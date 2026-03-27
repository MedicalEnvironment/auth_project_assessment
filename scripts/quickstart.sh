#!/bin/bash

# Quick Start Guide for User Management Service

echo "========================================"
echo "User Management Service - Quick Start"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "IMPORTANT: Edit .env and set a secure DB_PASSWORD before continuing!"
else
    echo ".env file already exists"
fi

echo ""
echo "Starting services with Docker Compose..."
docker-compose up -d --build

# Wait for services to be ready
echo ""
echo "Waiting for services to start..."
sleep 10

echo ""
echo "Creating an API key..."
docker-compose exec -T app npm run setup-apikeys "default-client"

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Service running at: http://localhost:3000"
echo "Health check: curl http://localhost:3000/health"
echo ""
echo "Next steps:"
echo "1. Copy your API key from above"
echo "2. Use it in the X-API-Key header for all API requests"
echo "3. Check README.md for API documentation"
echo ""
