interface ServiceDescriptor<T> {
  implementation: new (...args: unknown[]) => T;
  singleton: boolean;
  dependencies: string[];
}

interface ServiceRegistry {
  [key: string]: ServiceDescriptor<unknown>;
}

export class DependencyContainer {
  private services: ServiceRegistry = {};
  private instances: Map<string, unknown> = new Map();

  public register<T>(
    key: string, 
    implementation: new (...args: unknown[]) => T,
    options: {
      singleton?: boolean;
      dependencies?: string[];
    } = {}
  ): void {
    const descriptor: ServiceDescriptor<T> = {
      implementation,
      singleton: options.singleton ?? false,
      dependencies: options.dependencies ?? []
    };
    this.services[key] = descriptor;
  }

  public resolve<T>(key: string): T {
    const descriptor = this.services[key];
    if (!descriptor) {
      throw new Error(`Service '${key}' not registered`);
    }

    // Für Singletons, prüfe ob bereits eine Instanz existiert
    if (descriptor.singleton) {
      const existingInstance = this.instances.get(key);
      if (existingInstance) {
        return existingInstance as T;
      }
    }

    // Löse Abhängigkeiten rekursiv auf
    const dependencies = descriptor.dependencies.map(dep => this.resolve(dep));

    // Erstelle neue Instanz
    const instance = new descriptor.implementation(...dependencies);

    // Speichere Singleton-Instanzen
    if (descriptor.singleton) {
      this.instances.set(key, instance);
    }

    return instance as T;
  }

  public isRegistered(key: string): boolean {
    return key in this.services;
  }

  public reset(): void {
    this.services = {};
    this.instances.clear();
  }
}