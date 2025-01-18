# Contributing Guidelines

## Entwicklungsumgebung einrichten

### Voraussetzungen
- Node.js (v18 oder höher)
- npm oder yarn
- TypeScript Kenntnisse
- MySQL Server für Tests

### Setup
1. Repository klonen
2. Dependencies installieren
3. TypeScript konfigurieren
4. Tests einrichten

## Entwicklungsprozess

### 1. Feature Branch erstellen
```bash
git checkout -b feature/beschreibung
```

### 2. Entwickeln
- TypeScript strict mode verwenden
- Tests schreiben
- Dokumentation aktualisieren

### 3. Testen
```bash
npm test
npm run lint
```

### 4. Pull Request erstellen
- Beschreibung der Änderungen
- Tests bestätigt
- Dokumentation aktualisiert

## Code Guidelines

### TypeScript
- strict mode aktiviert
- Interfaces für Typendefinitionen
- Keine any Types

### Testing
- Jest verwenden
- Integration Tests
- Min. 80% Coverage

### Dokumentation
- TSDoc Comments
- README Updates
- Beispiele

## Pull Request Prozess
1. Branch aktuell halten
2. Tests durchführen
3. Dokumentation prüfen
4. PR erstellen

## Hilfe & Support
- Issues erstellen
- Diskussionen im Wiki
- Code Reviews