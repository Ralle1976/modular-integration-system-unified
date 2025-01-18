# Beitragen zum Modular Integration System

## Willkommen bei unserem Projekt!

Wir freuen uns, dass Sie daran interessiert sind, zum Modular Integration System beizutragen. Diese Richtlinien helfen Ihnen, effektiv zum Projekt beizutragen.

## Entwicklungsumgebung

### Voraussetzungen
- Node.js 18+
- npm oder yarn
- Git
- Docker (optional)

### Setup
1. Repository forken
2. Klonen Sie Ihr Fork:
```bash
git clone https://github.com/[IHR_BENUTZERNAME]/modular-integration-system-unified.git
cd modular-integration-system-unified
```

3. Abhängigkeiten installieren:
```bash
npm install
```

4. Konfiguration vorbereiten:
```bash
cp .env.example .env
cp config/config.example.json config/config.json
```

## Entwicklungs-Workflow

### Branches
- `main`: Stabiler Produktionscode
- `develop`: Entwicklungsbranch
- Feature-Branches: `feature/kurze-beschreibung`
- Bugfix-Branches: `bugfix/kurze-beschreibung`

### Commit-Nachrichten
Verwenden Sie folgendes Format:
- `feat:` Neue Funktionen
- `fix:` Fehlerbehebungen
- `docs:` Dokumentationsänderungen
- `style:` Formatierung ohne Codeänderungen
- `refactor:` Code-Überarbeitung
- `test:` Hinzufügen oder Korrigieren von Tests
- `chore:` Wartungsaufgaben

Beispiel: `feat: Implementierung des GitHub-Moduls`

### Pull Request Prozess
1. Erstellen Sie einen Fork des Repositories
2. Erstellen Sie einen Feature-Branch
3. Implementieren Sie Ihre Änderungen
4. Schreiben Sie Tests
5. Stellen Sie sicher, dass alle Tests bestehen:
```bash
npm test
```
6. Erstellen Sie einen Pull Request mit klarer Beschreibung

## Coding-Richtlinien
- Befolgen Sie den existierenden Codingstil
- Schreiben Sie TypeScript mit strengen Typen
- Dokumentieren Sie neue Funktionen
- 100% Testabdeckung für neue Features

## Code-Überprüfung
- Mindestens eine Review durch Maintainer
- Automatische CI-Checks müssen bestehen
- Klare und präzise Beschreibung der Änderungen

## Fehlerberichte
- Verwenden Sie GitHub Issues
- Beschreiben Sie das erwartete und tatsächliche Verhalten
- Geben Sie Reproduktionsschritte an
- Fügen Sie Umgebungsinformationen hinzu

## Support
Bei Fragen oder Problemen:
- Erstellen Sie ein Issue
- Kontaktieren Sie die Maintainer

Vielen Dank für Ihren Beitrag!