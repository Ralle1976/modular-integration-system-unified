#!/bin/bash

# Farbcodes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starte Dependency-Synchronisation...${NC}"

# NPM-Cache bereinigen
npm cache clean --force

# Alte Abhängigkeiten entfernen
rm -rf node_modules
rm -f package-lock.json

# Neue Abhängigkeiten installieren
echo -e "${YELLOW}Installiere Abhängigkeiten...${NC}"
npm install

# Veraltete Pakete identifizieren und aktualisieren
echo -e "${YELLOW}Suche nach veralteten Paketen...${NC}"
npx npm-check-updates -u

# Installiere aktualisierte Abhängigkeiten
npm install

# Führe Linting durch
echo -e "${YELLOW}Führe Linting durch...${NC}"
npm run lint:fix

# Teste Projekt
echo -e "${YELLOW}Führe Tests durch...${NC}"
npm test

echo -e "${GREEN}Dependency-Synchronisation abgeschlossen!${NC}"