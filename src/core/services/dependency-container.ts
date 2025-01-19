export class DependencyContainer {
  private container: Map<string, any> = new Map();

  register(name: string, instance: any): void {
    this.container.set(name, instance);
  }

  resolve<T>(name: string): T {
    if (!this.container.has(name)) {
      throw new Error(`No dependency found for: ${name}`);
    }
    return this.container.get(name) as T;
  }
}