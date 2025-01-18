#!/bin/bash

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Nodemon für automatisches Neuladen installieren, falls nicht vorhanden
if ! command -v nodemon &> /dev/null; then
    echo "📦 Installing nodemon..."
    npm install -g nodemon
fi

# TypeScript Watch Mode starten
echo -e "${YELLOW}Starting TypeScript compiler in watch mode...${NC}"
tsc --watch &
TS_PID=$!

# Entwicklungsserver mit Nodemon starten
echo -e "${YELLOW}Starting development server...${NC}"
nodemon --watch dist/ dist/index.js &
NODEMON_PID=$!

# Trap für sauberes Beenden
trap cleanup EXIT
cleanup() {
    echo -e "${YELLOW}Shutting down...${NC}"
    kill $TS_PID
    kill $NODEMON_PID
    exit 0
}

# Warten auf Benutzerunterbrechung
echo -e "${GREEN}Development server is running. Press Ctrl+C to stop.${NC}"
wait