import { Logger } from './logger';
import { ConfigManager } from './config-manager';
import { ConfigValidator } from './config-validator';
import { ModuleManager } from './module-manager';
import { EventBus } from './event-bus';
import { AuthService } from './auth-service';
import { ErrorHandler } from './error-handler';
import { MonitoringService } from './monitoring-service';
import { RateLimiter } from './rate-limiter';
import { DependencyContainer } from './dependency-injection';

import { MySQLModule } from '../modules/mysql/mysql-module';
import { GitHubModule } from '../modules/github/github-module';
import { OpenAIModule } from '../modules/openai/openai-module';
import { GoogleDriveModule } from '../modules/google-drive/google-drive-module';

export class ApplicationService {
  private static instance: ApplicationService;
  
  private logger: Logger;
  private config: ConfigManager;
  private configValidator: ConfigValidator;
  private moduleManager: ModuleManager;
  private eventBus: EventBus;
  private authService: AuthService;
  private errorHandler: ErrorHandler;
  private monitoringService: MonitoringService;
  private rateLimiter: RateLimiter;
  private dependencyContainer: DependencyContainer;

  private constructor() {
    // Initialize core services
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
    this.configValidator = ConfigValidator.getInstance();
    this.moduleManager = ModuleManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.authService = AuthService.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    this.monitoringService = MonitoringService.getInstance();
    this.rateLimiter = RateLimiter.getInstance();
    this.dependencyContainer = DependencyContainer.getInstance();
  }

  public static getInstance(): ApplicationService {
    if (!ApplicationService.instance) {
      ApplicationService.instance = new ApplicationService();
    }
    return ApplicationService.instance;
  }

  public async initialize(): Promise<boolean> {
    try {
      this.logger.info('Initializing Modular Integration System');

      // Validate configuration
      const configValidation = this.configValidator.validateConfiguration();
      if (!configValidation.isValid) {
        throw new Error('Invalid configuration');
      }

      // Setup global error handlers
      this.errorHandler.setupGlobalErrorHandlers();

      // Start monitoring
      this.monitoringService.startPeriodicMonitoring();

      // Register modules
      this.registerModules();

      // Initialize modules
      await this.moduleManager.initializeModules();

      // Setup event listeners
      this.setupSystemEvents();

      this.logger.info('Application initialized successfully');
      return true;
    } catch (error) {
      this.errorHandler.captureError(error, { 
        severity: 'CRITICAL', 
        module: 'APPLICATION_INITIALIZATION' 
      });
      return false;
    }
  }

  private registerModules(): void {
    // Register core modules
    const modules = [
      new MySQLModule(),
      new GitHubModule(),
      new OpenAIModule(),
      new GoogleDriveModule()
    ];

    modules.forEach(module => {
      this.moduleManager.registerModule(module);
      
      // Register in dependency container
      this.dependencyContainer.registerSingleton(
        module.name, 
        () => module
      );
    });
  }

  private setupSystemEvents(): void {
    // Global error event
    this.eventBus.subscribe('system:error', (error) => {
      this.logger.error('System error event', error);
      // Potential additional error handling logic
    });

    // Performance monitoring event
    this.eventBus.subscribe('system:performance', (metrics) => {
      this.monitoringService.recordMetric('system', {
        name: 'performance_metrics',
        value: metrics.value
      });
    });
  }

  public async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down Modular Integration System');

      // Stop monitoring
      this.monitoringService.stopPeriodicMonitoring();

      // Shutdown modules
      await this.moduleManager.shutdownModules();

      // Clear event subscriptions
      this.eventBus.clearAllSubscriptions();

      this.logger.info('Application shutdown complete');
    } catch (error) {
      this.errorHandler.captureError(error, { 
        severity: 'HIGH', 
        module: 'APPLICATION_SHUTDOWN' 
      });
    }
  }

  public getHealthStatus(): { 
    isHealthy: boolean; 
    services: Record<string, boolean>; 
  } {
    const healthReport = this.monitoringService.generateHealthReport();

    return {
      isHealthy: healthReport.isHealthy,
      services: {
        config: true,
        logger: true,
        moduleManager: true,
        eventBus: true,
        authService: true,
        errorHandler: true,
        monitoringService: true,
        rateLimiter: true
      }
    };
  }
}