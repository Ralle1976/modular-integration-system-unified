import { BaseService } from '../core/base-service';
import { Logger } from '../core/logger';
import { EventBus } from '../core/event-bus';

export interface ModuleConfig {
  name: string;
  enabled: boolean;
  version: string;
}

export abstract class BaseModule extends BaseService {
  protected config: ModuleConfig;
  protected eventBus: EventBus;

  constructor(config: ModuleConfig) {
    super(config.name);
    this.config = config;
    this.eventBus = EventBus.getInstance();
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public getVersion(): string {
    return this.config.version;
  }

  public abstract registerEvents(): void;
  public abstract unregisterEvents(): void;
}

export class ModuleManager {
  private modules: Map<string, BaseModule> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ModuleManager');
  }

  public registerModule(module: BaseModule): void {
    if (this.modules.has(module.constructor.name)) {
      this.logger.warn(`Modul ${module.constructor.name} bereits registriert`);
      return;
    }

    if (!module.isEnabled()) {
      this.logger.info(`Modul ${module.constructor.name} ist deaktiviert`);
      return;
    }

    try {
      module.initialize();
      module.registerEvents();
      this.modules.set(module.constructor.name, module);
      
      this.logger.info(`Modul ${module.constructor.name} registriert`, {
        version: module.getVersion()
      });
    } catch (error) {
      this.logger.error(`Fehler bei Modulregistrierung: ${module.constructor.name}`, error);
    }
  }

  public unregisterModule(moduleName: string): void {
    const module = this.modules.get(moduleName);
    
    if (!module) {
      this.logger.warn(`Modul ${moduleName} nicht gefunden`);
      return;
    }

    try {
      module.unregisterEvents();
      module.shutdown();
      this.modules.delete(moduleName);
      
      this.logger.info(`Modul ${moduleName} entregistriert`);
    } catch (error) {
      this.logger.error(`Fehler beim Entregistrieren von ${moduleName}`, error);
    }
  }

  public getModule<T extends BaseModule>(moduleName: string): T | undefined {
    return this.modules.get(moduleName) as T;
  }

  public listModules(): string[] {
    return Array.from(this.modules.keys());
  }

  public async shutdownAllModules(): Promise<void> {
    for (const module of this.modules.values()) {
      await module.shutdown();
    }
    this.modules.clear();
  }
}