#!/bin/bash

# Farbcodes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Starte umfassende Dependency-Diagnose...${NC}"

# Node und npm Versionen prüfen
echo -e "${YELLOW}Node Version:${NC}"
node --version

echo -e "${YELLOW}NPM Version:${NC}"
npm --version

# Installierte Pakete auflisten
echo -e "${YELLOW}Installierte Pakete:${NC}"
npm list --depth=0

# Veraltete Pakete identifizieren
echo -e "${YELLOW}Veraltete Pakete:${NC}"
npm outdated

# Paket-Integrität prüfen
echo -e "${YELLOW}Paket-Integrität:${NC}"
npm doctor

# Mögliche Probleme finden
echo -e "${YELLOW}Mögliche Probleme:${NC}"
npm audit

echo -e "${GREEN}✅ Diagnose abgeschlossen!${NC}"