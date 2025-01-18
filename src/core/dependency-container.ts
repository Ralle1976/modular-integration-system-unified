export class DependencyContainer {
  private static instance: DependencyContainer;
  private container: Map<string, any> = new Map();

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  public registerSingleton<T>(key: string, instance: T): void {
    this.container.set(key, instance);
  }

  public resolve<T>(key: string): T {
    const instance = this.container.get(key);
    if (!instance) {
      throw new Error(`No instance registered for key: ${key}`);
    }
    return instance;
  }
}