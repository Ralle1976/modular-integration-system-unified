export class EventBus {
  private handlers: Map<string, Function[]> = new Map();

  subscribe(event: string, handler: Function): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)?.push(handler);
  }

  emit(event: string, data?: any): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => handler(data));
    }
  }
}