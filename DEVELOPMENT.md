# Entwicklungsanleitung

## 🛠 Lokale Entwicklungsumgebung

### Voraussetzungen
- Node.js 18+
- npm oder yarn
- Docker (optional)
- Git

### Setup

1. Repository klonen
```bash
git clone https://github.com/Ralle1976/modular-integration-system-unified.git
cd modular-integration-system-unified
```

2. Abhängigkeiten installieren
```bash
npm install
```

3. Konfiguration vorbereiten
```bash
cp .env.example .env
cp config/config.example.json config/config.json
```

## 🚀 Entwicklungs-Workflows

### Entwicklungsserver starten
```bash
npm run dev
```

### Builds erstellen
```bash
npm run build
```

### Tests ausführen
```bash
npm test
```

## 🔍 Code-Qualität

### Linting
```bash
npm run lint
```

### Formatierung
```bash
npm run format
```

## 🐳 Docker-Entwicklung

### Docker-Entwicklungsumgebung starten
```bash
docker-compose up --build
```

### Docker-Tests
```bash
docker-compose run test
```

## 📦 Modulentwicklung

### Neues Modul erstellen
1. Verzeichnis in `src/modules/` anlegen
2. Connector-Klasse implementieren
3. Modul-Klasse erstellen
4. Tests hinzufügen

### Beispiel-Modul-Struktur
```
src/modules/beispiel/
├── beispiel-connector.ts
├── beispiel-module.ts
└── tests/
    └── beispiel-module.spec.ts
```

## 🤝 Beitragrichtlinien

1. Fork des Repositories
2. Feature-Branch erstellen
3. Änderungen committen
4. Pull Request erstellen

### Commit-Nachrichten-Konventionen
- `feat:` Neue Funktionen
- `fix:` Fehlerbehebungen
- `docs:` Dokumentationsänderungen
- `refactor:` Code-Überarbeitung
- `test:` Testbezogene Änderungen

## 🔐 Sicherheitshinweise

- Keine Zugangsdaten committen
- Secrets über Umgebungsvariablen
- Regelmäßige Sicherheitsupdates

## 📊 Monitoring & Debugging

- Logging-Level in `.env` konfigurierbar
- Fehler in Konsole und Logdatei
- Performance-Metriken verfügbar

## 🚨 Troubleshooting

- Bei Abhängigkeitsproblemen: `npm ci`
- Cache leeren: `npm cache clean --force`
- Docker-Volumes zurücksetzen: `docker-compose down -v`

## 🌐 Continuous Integration

GitHub Actions konfiguriert für:
- Automatische Tests
- Code-Qualitäts-Checks
- Build-Verifikation