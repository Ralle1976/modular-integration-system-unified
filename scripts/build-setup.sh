#!/bin/bash

# Farben für Output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Starting build setup..."

# Clean up
echo "🧹 Cleaning up old files..."
rm -rf node_modules package-lock.json dist || { echo -e "${RED}Failed to clean up${NC}" ; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install || { echo -e "${RED}Failed to install dependencies${NC}" ; exit 1; }

# Build project
echo "🔨 Building project..."
npm run build || { echo -e "${RED}Build failed${NC}" ; exit 1; }

# Run tests
echo "🧪 Running tests..."
npm test || { echo -e "${RED}Tests failed${NC}" ; exit 1; }

echo -e "${GREEN}✅ Setup completed successfully!${NC}"