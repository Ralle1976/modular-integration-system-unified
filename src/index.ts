import { ApplicationService } from './core/application-service';
import { Logger } from './core/logger';
import { ErrorHandler } from './core/error-handler';

class ModularIntegrationSystem {
  private applicationService: ApplicationService;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor() {
    this.applicationService = ApplicationService.getInstance();
    this.logger = Logger.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
  }

  public async start(): Promise<void> {
    try {
      this.logger.info('Starting Modular Integration System');

      // Setup graceful shutdown handlers
      process.on('SIGINT', this.shutdown.bind(this));
      process.on('SIGTERM', this.shutdown.bind(this));

      // Initialize application
      const initialized = await this.applicationService.initialize();

      if (!initialized) {
        throw new Error('Application initialization failed');
      }

      this.logger.info('Modular Integration System is running');

      // Optional: Keep the process running
      await this.keepAlive();
    } catch (error) {
      this.errorHandler.captureError(error, {
        severity: 'CRITICAL',
        module: 'SYSTEM_STARTUP'
      });
      process.exit(1);
    }
  }

  private async keepAlive(): Promise<void> {
    return new Promise(() => {
      // Prevents the process from exiting immediately
      // Allows background tasks and module operations to continue
    });
  }

  private async shutdown(): Promise<void> {
    try {
      this.logger.info('Initiating system shutdown');

      // Perform graceful shutdown
      await this.applicationService.shutdown();

      this.logger.info('System shutdown complete');
      process.exit(0);
    } catch (error) {
      this.errorHandler.captureError(error, {
        severity: 'HIGH',
        module: 'SYSTEM_SHUTDOWN'
      });
      process.exit(1);
    }
  }

  public async checkHealth(): Promise<void> {
    const healthStatus = this.applicationService.getHealthStatus();

    if (healthStatus.isHealthy) {
      this.logger.info('System health check passed');
    } else {
      this.logger.warn('System health check failed', healthStatus);
    }
  }
}

// Main entry point
async function main(): Promise<void> {
  const system = new ModularIntegrationSystem();
  
  try {
    await system.start();
    
    // Optional periodic health checks
    setInterval(() => {
      system.checkHealth();
    }, 5 * 60 * 1000); // Every 5 minutes
  } catch (error) {
    console.error('Failed to start Modular Integration System', error);
    process.exit(1);
  }
}

// Run the application
main().catch(error => {
  console.error('Unhandled error in main:', error);
  process.exit(1);
});