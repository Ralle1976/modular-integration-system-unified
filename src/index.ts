import { ConfigManager } from './core/config-manager';
import { Logger } from './core/logger';

class Application {
  private logger: Logger;
  private configManager: ConfigManager;

  constructor() {
    this.logger = new Logger('Application');
    this.configManager = ConfigManager.getInstance();
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Starte Anwendung', {
        appName: this.configManager.get('appName'),
        version: this.configManager.get('version'),
        environment: this.configManager.get('environment')
      });

      // Hier können weitere Initialisierungsschritte hinzugefügt werden
      await this.setupModules();
      
      this.startServer();
    } catch (error) {
      this.logger.error('Fehler bei der Initialisierung', error);
      process.exit(1);
    }
  }

  private async setupModules(): Promise<void> {
    // Platzhalter für Modulinitialisierung
    this.logger.info('Initialisiere Systemmodule');
  }

  private startServer(): void {
    const port = this.configManager.get('server.port', 3000);
    const host = this.configManager.get('server.host', 'localhost');

    // Hier könnte ein Express oder anderer Server-Setup erfolgen
    this.logger.info('Server gestartet', { host, port });
  }
}

// Hauptanwendungsstart
const app = new Application();
app.initialize().catch(console.error);