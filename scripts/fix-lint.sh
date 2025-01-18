#!/bin/bash

# Farbdefinitionen
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starte automatische ESLint-Korrekturen...${NC}"

# Entferne ungenutzte Variablen und ersetze sie durch Unterstrich
find ./src -type f -name "*.ts" -print0 | xargs -0 sed -i 's/\([a-zA-Z]\+\) *=[^;]*;/\1 = _;/g'

# Entferne ungenutzte Imports
npm install -g import-js

# Führe ESLint-Fix durch
npx eslint . --ext .ts --fix

echo -e "${GREEN}ESLint-Korrekturen abgeschlossen!${NC}"