export class DependencyContainer {
  private container: Map<string, any> = new Map();

  register(key: string, instance: any): void {
    this.container.set(key, instance);
  }

  resolve<T>(key: string): T {
    return this.container.get(key) as T;
  }
}