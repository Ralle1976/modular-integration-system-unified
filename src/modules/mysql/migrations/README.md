# MySQL Migration System

Dieses Modul implementiert ein robustes Migrations-System für die MySQL-Datenbank Integration.

## Features

- Automatische Migration beim Startup
- Versionierte Migrationen mit Timestamps
- Rollback-Unterstützung
- CLI Tool für Migration-Erstellung
- Transaction-Sicherheit

## Verwendung

### Migration erstellen

```bash
npm run create-migration <name>
```

### Migrationen ausführen

```typescript
import { MigrationManager } from './migrations/MigrationManager';

const migrationManager = MigrationManager.getInstance('./migrations');
await migrationManager.initialize();
await migrationManager.migrate();
```

### Rollback durchführen

```typescript
// Letzte Migration rückgängig machen
await migrationManager.rollback();

// Mehrere Migrationen rückgängig machen
await migrationManager.rollback(3); // Rollt die letzten 3 Migrationen zurück
```

## Migration-Datei Beispiel

```typescript
import { Migration } from '../Migration';

export default class implements Migration {
  constructor() {
    super('create_users_table');
  }

  public async up(): Promise<void> {
    await this.connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(): Promise<void> {
    await this.connection.query('DROP TABLE users');
  }
}
```

## Fehlerbehebung

Wenn Fehler während einer Migration auftreten:

1. Die Migration wird automatisch zurückgerollt
2. Der Fehler wird geloggt
3. Der Migrationsprozess wird gestoppt

Überprüfen Sie die Logs für Details zum Fehler.
