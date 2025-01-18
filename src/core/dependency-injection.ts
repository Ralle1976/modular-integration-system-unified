import { Logger } from './logger';
import { ConfigManager } from './config-manager';

type ClassType<T = any> = new (...args: any[]) => T;
type Factory<T = any> = () => T;

interface RegistrationOptions {
  singleton?: boolean;
}

export class DependencyContainer {
  private static instance: DependencyContainer;
  private logger: Logger;
  private config: ConfigManager;
  
  private services: Map<string | symbol, any> = new Map();
  private factories: Map<string | symbol, Factory> = new Map();
  private singletonInstances: Map<string | symbol, any> = new Map();

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();

    // Register core services by default
    this.registerSingleton('logger', () => Logger.getInstance());
    this.registerSingleton('config', () => ConfigManager.getInstance());
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  public register<T>(
    token: string | symbol, 
    service: ClassType<T> | Factory<T>, 
    options: RegistrationOptions = {}
  ): this {
    if (typeof service === 'function') {
      if (options.singleton) {
        this.registerSingleton(token, service as Factory<T>);
      } else {
        this.factories.set(token, service as Factory<T>);
      }
    } else {
      throw new Error('Invalid service registration');
    }

    this.logger.info(`Service registered: ${String(token)}`);
    return this;
  }

  public registerSingleton<T>(
    token: string | symbol, 
    service: ClassType<T> | Factory<T>
  ): this {
    const factory = typeof service === 'function' 
      ? service as Factory<T>
      : () => new service();

    this.factories.set(token, factory);
    
    Object.defineProperty(this, 'get', {
      value: (resolvedToken: string | symbol) => {
        if (!this.singletonInstances.has(resolvedToken)) {
          const instance = this.factories.get(resolvedToken)!();
          this.singletonInstances.set(resolvedToken, instance);
        }
        return this.singletonInstances.get(resolvedToken);
      }
    });

    this.logger.info(`Singleton registered: ${String(token)}`);
    return this;
  }

  public get<T>(token: string | symbol): T {
    // Check singleton instances first
    if (this.singletonInstances.has(token)) {
      return this.singletonInstances.get(token);
    }

    // Check factories
    if (this.factories.has(token)) {
      const factory = this.factories.get(token)!;
      const instance = factory();
      
      // If it was intended to be a singleton, cache the instance
      this.singletonInstances.set(token, instance);
      
      return instance;
    }

    throw new Error(`No service found for token: ${String(token)}`);
  }

  public resolve<T>(token: string | symbol): T {
    try {
      return this.get<T>(token);
    } catch (error) {
      this.logger.error(`Dependency resolution failed: ${String(token)}`);
      throw error;
    }
  }

  public reset(): void {
    this.singletonInstances.clear();
    this.factories.clear();
    this.services.clear();

    // Re-register core services
    this.registerSingleton('logger', () => Logger.getInstance());
    this.registerSingleton('config', () => ConfigManager.getInstance());

    this.logger.info('Dependency container reset');
  }

  public listRegisteredServices(): string[] {
    return [
      ...Array.from(this.factories.keys()).map(String),
      ...Array.from(this.singletonInstances.keys()).map(String)
    ];
  }
}