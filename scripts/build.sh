#!/bin/bash

# Setze strikte Fehlerbehandlung
set -e

# Bereinige vorherige Builds
rm -rf dist

# Stelle sicher, dass Verzeichnisse existieren
mkdir -p dist

# Kompiliere TypeScript
npx tsc --pretty

# Optional: Kopiere zusätzliche Ressourcen
# cp -r src/assets dist/

echo "Build erfolgreich abgeschlossen!"