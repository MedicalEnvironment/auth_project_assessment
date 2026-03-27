#!/bin/bash

# Database initialization script for manual setup

if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Extract database configuration from .env (match only the exact key to avoid
# partial matches like DB_USERNAME matching DB_USER)
DB_USER=$(grep -E '^DB_USER=' .env | cut -d '=' -f 2)
DB_PASSWORD=$(grep -E '^DB_PASSWORD=' .env | cut -d '=' -f 2)
DB_HOST=$(grep -E '^DB_HOST=' .env | cut -d '=' -f 2)
DB_PORT=$(grep -E '^DB_PORT=' .env | cut -d '=' -f 2)
DB_NAME=$(grep -E '^DB_NAME=' .env | cut -d '=' -f 2)

echo "Database Configuration:"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo ""

# Create database if it doesn't exist
echo "Creating database..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE \"$DB_NAME\";"

# Run migrations
echo "Running migrations..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f migrations/001_create_users_table.sql

echo "Database initialization completed!"
