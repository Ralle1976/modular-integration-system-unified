import { Logger } from './logger';
import { EventBus } from './event-bus';

export abstract class BaseService {
  protected logger: Logger;
  protected eventBus: EventBus;
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logger = new Logger(serviceName);
    this.eventBus = EventBus.getInstance();
  }

  protected logInfo(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  protected logError(message: string, error?: Error): void {
    this.logger.error(message, error);
  }

  protected async emitEvent<T>(eventName: string, data: T): Promise<void> {
    try {
      await this.eventBus.emit(eventName, data);
    } catch (error) {
      this.logError(`Fehler beim Emmiten des Events ${eventName}`, error as Error);
    }
  }

  public abstract initialize(): Promise<void>;
  public abstract shutdown(): Promise<void>;
}

export abstract class ConfigurableService<T> extends BaseService {
  protected config: T;

  constructor(serviceName: string, config: T) {
    super(serviceName);
    this.config = config;
  }

  protected updateConfig(newConfig: Partial<T>): void {
    this.config = { ...this.config, ...newConfig };
    this.logInfo('Service-Konfiguration aktualisiert', { 
      serviceName: this.constructor.name 
    });
  }
}