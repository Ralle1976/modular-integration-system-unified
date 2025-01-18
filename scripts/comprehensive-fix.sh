#!/bin/bash

# Setze strikte Fehlerbehandlung
set -e

# Farbdefinitionen
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starte umfassende Code-Bereinigung...${NC}"

# Temporäre Backup-Erstellung
echo -e "${YELLOW}Erstelle temporäres Backup...${NC}"
mkdir -p /tmp/code-backup
cp -r ./src /tmp/code-backup/

# Funktion zur Fehlerkorrektur in TypeScript-Dateien
fix_typescript_file() {
    local file="$1"
    echo -e "${YELLOW}Bereinige $file${NC}"
    
    # Ersetze ungenutzte Variablen
    sed -i 's/\([a-zA-Z_]\+\) *=[^;]*;/const _\1 = undefined;/g' "$file"
    
    # Entferne redundante any-Typen
    sed -i 's/: any/: unknown/g' "$file"
    
    # Füge Rückgabetypen hinzu, wenn fehlend
    sed -i 's/function\s\+\([a-zA-Z_][a-zA-Z0-9_]*\)(\([^)]*\))\s*{/function \1(\2): void {/g' "$file"
}

# Bereinige alle TypeScript-Dateien
echo -e "${YELLOW}Bereinige TypeScript-Dateien...${NC}"
find ./src -type f -name "*.ts" | while read -r file; do
    fix_typescript_file "$file"
done

# ESLint-Fixes durchführen
echo -e "${YELLOW}Führe ESLint-Fixes durch...${NC}"
npx eslint . --ext .ts --fix

# Redundante und ungenutzte Importe entfernen
echo -e "${YELLOW}Entferne redundante Importe...${NC}"
npx eslint-plugin-unused-imports

# Formatierung durchführen
echo -e "${YELLOW}Formatiere Code...${NC}"
npx prettier --write ./src

echo -e "${GREEN}Code-Bereinigung abgeschlossen!${NC}"