# Modular Integration System - Umfassende Nutzungsanleitung

## 1. Voraussetzungen

### Softwareanforderungen
- Node.js 18+
- npm oder yarn
- Docker (optional)
- Git

### Empfohlene Entwicklungsumgebung
- Visual Studio Code
- TypeScript-Unterstützung
- ESLint-Plugin
- Prettier-Extension

## 2. Installation

### Klonen des Repositories
```bash
git clone https://github.com/Ralle1976/modular-integration-system-unified.git
cd modular-integration-system-unified
```

### Abhängigkeiten installieren
```bash
npm install
```

### Konfiguration vorbereiten
1. Beispielkonfiguration kopieren
```bash
cp .env.example .env
cp config/config.example.json config/config.json
```

2. Konfigurationsdateien anpassen
- `.env`: Umgebungsspezifische Einstellungen
- `config/config.json`: Modulkonfigurationen

## 3. Modulkonfiguration

### Verfügbare Module
- MySQL-Integration
- GitHub-Integration
- OpenAI-Integration
- Google Drive-Integration

### Konfigurationsbeispiel
```json
{
  "modules": {
    "mysql": {
      "enabled": true,
      "host": "localhost",
      "port": 3306,
      "database": "integration_system"
    },
    "github": {
      "enabled": true,
      "token": "YOUR_GITHUB_TOKEN"
    }
  }
}
```

## 4. Entwicklungs-Workflows

### Entwicklungsserver starten
```bash
npm run dev
```

### Build erstellen
```bash
npm run build
```

### Tests ausführen
```bash
npm test
```

## 5. Modul-Nutzung

### Beispiel: MySQL-Modul
```typescript
import { MySQLModule } from './modules/mysql/mysql-module';

const mysqlModule = new MySQLModule();
await mysqlModule.initialize();

// Abfragen ausführen
const results = await mysqlModule.query('SELECT * FROM users');
```

### Beispiel: GitHub-Modul
```typescript
import { GitHubModule } from './modules/github/github-module';

const githubModule = new GitHubModule();
await githubModule.initialize();

// Repository auflisten
const repositories = await githubModule.listRepositories();
```

## 6. Erweiterte Konfiguration

### Logging
```json
{
  "logging": {
    "level": "info",
    "format": "json",
    "maxFiles": 5
  }
}
```

### Sicherheitseinstellungen
```json
{
  "security": {
    "corsEnabled": true,
    "rateLimiting": {
      "windowMs": 900000,
      "max": 100
    }
  }
}
```

## 7. Fehlerbehandlung

### Globale Fehlerbehandlung
```typescript
import { ErrorHandler } from './core/error-handler';

const errorHandler = ErrorHandler.getInstance();
errorHandler.setupGlobalErrorHandlers();
```

## 8. Monitoring

### Systemstatus prüfen
```typescript
import { MonitoringService } from './core/monitoring-service';

const monitoringService = MonitoringService.getInstance();
const healthReport = monitoringService.generateHealthReport();
```

## 9. Troubleshooting

### Häufige Probleme
- Fehlende Umgebungsvariablen
- Ungültige Konfigurationen
- Verbindungsprobleme mit externen Services

### Empfohlene Schritte
1. Konfiguration überprüfen
2. Logs analysieren
3. Abhängigkeiten aktualisieren

## 10. Deployment

### Docker-Deployment
```bash
docker-compose up --build
```

### Produktions-Build
```bash
npm run build
NODE_ENV=production npm start
```

## 11. Community & Support

- GitHub Issues für Fehlerberichte
- Diskussionen im Discussions-Bereich
- Beitragsrichtlinien in CONTRIBUTING.md beachten

## 12. Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Details in LICENSE.md.