import { ConfigManager } from './core/config-manager';
import { Logger } from './core/logger';
import { MySQLConnector } from './modules/mysql/mysql-connector';

class ModularIntegrationSystem {
  private logger: Logger;
  private config: ConfigManager;
  private mysqlConnector: MySQLConnector;

  constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
    this.mysqlConnector = MySQLConnector.getInstance();
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Modular Integration System');
      
      // Verbindung zur MySQL-Datenbank herstellen
      await this.mysqlConnector.connect();

      // Weitere Initialisierungen können hier hinzugefügt werden
      this.logger.info('Initialization complete');
    } catch (error) {
      this.logger.error(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down Modular Integration System');
      
      // MySQL-Verbindung schließen
      await this.mysqlConnector.close();

      this.logger.info('Shutdown complete');
    } catch (error) {
      this.logger.error(`Shutdown failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Hauptausführung
async function main(): Promise<void> {
  const system = new ModularIntegrationSystem();
  
  // Behandlung von Prozessende-Signalen
  process.on('SIGINT', async () => {
    await system.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await system.shutdown();
    process.exit(0);
  });

  // System initialisieren
  await system.initialize();
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});