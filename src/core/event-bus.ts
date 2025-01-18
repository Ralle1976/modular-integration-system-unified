type EventCallback<T> = (data: T) => void | Promise<void>;

interface EventSubscription {
  event: string;
  callback: EventCallback<unknown>;
}

export class EventBus {
  private eventMap: Map<string, Set<EventCallback<unknown>>> = new Map();

  public subscribe<T>(event: string, callback: EventCallback<T>): void {
    if (!this.eventMap.has(event)) {
      this.eventMap.set(event, new Set());
    }
    
    this.eventMap.get(event)?.add(callback as EventCallback<unknown>);
  }

  public unsubscribe<T>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.eventMap.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback<unknown>);
      if (callbacks.size === 0) {
        this.eventMap.delete(event);
      }
    }
  }

  public async emit<T>(event: string, data: T): Promise<void> {
    const callbacks = this.eventMap.get(event);
    if (!callbacks) return;

    const promises = Array.from(callbacks).map(callback => {
      try {
        const result = callback(data);
        return result instanceof Promise ? result : Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    });

    await Promise.allSettled(promises);
  }

  public hasSubscribers(event: string): boolean {
    return this.eventMap.has(event) && (this.eventMap.get(event)?.size ?? 0) > 0;
  }

  public clearEvent(event: string): void {
    this.eventMap.delete(event);
  }

  public clearAllEvents(): void {
    this.eventMap.clear();
  }

  public getEventCount(): number {
    return this.eventMap.size;
  }

  public getSubscriberCount(event: string): number {
    return this.eventMap.get(event)?.size ?? 0;
  }
}