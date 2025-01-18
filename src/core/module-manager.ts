import { Logger } from './logger';
import { ConfigManager } from './config-manager';

export interface ModuleInterface {
  name: string;
  initialize(): Promise<boolean>;
  shutdown(): Promise<void>;
  isEnabled(): boolean;
}

export class ModuleManager {
  private static instance: ModuleManager;
  private modules: Map<string, ModuleInterface> = new Map();
  private logger: Logger;
  private config: ConfigManager;

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
  }

  public static getInstance(): ModuleManager {
    if (!ModuleManager.instance) {
      ModuleManager.instance = new ModuleManager();
    }
    return ModuleManager.instance;
  }

  public registerModule(module: ModuleInterface): void {
    if (this.modules.has(module.name)) {
      this.logger.warn(`Module ${module.name} already registered. Overwriting.`);
    }
    this.modules.set(module.name, module);
    this.logger.info(`Module ${module.name} registered successfully.`);
  }

  public async initializeModules(): Promise<void> {
    for (const [name, module] of this.modules.entries()) {
      if (module.isEnabled()) {
        try {
          const initialized = await module.initialize();
          if (initialized) {
            this.logger.info(`Module ${name} initialized successfully.`);
          } else {
            this.logger.error(`Module ${name} initialization failed.`);
          }
        } catch (error) {
          this.logger.error(`Error initializing module ${name}: ${error}`);
        }
      } else {
        this.logger.info(`Module ${name} is disabled, skipping initialization.`);
      }
    }
  }

  public async shutdownModules(): Promise<void> {
    for (const [name, module] of this.modules.entries()) {
      try {
        await module.shutdown();
        this.logger.info(`Module ${name} shutdown completed.`);
      } catch (error) {
        this.logger.error(`Error shutting down module ${name}: ${error}`);
      }
    }
  }

  public getModule(name: string): ModuleInterface | undefined {
    return this.modules.get(name);
  }

  public listModules(): string[] {
    return Array.from(this.modules.keys());
  }
}