import { Logger } from './logger';

type EventCallback<T = any> = (data: T) => void;

export class EventBus {
  private static instance: EventBus;
  private events: Map<string, EventCallback[]> = new Map();
  private logger: Logger;

  protected constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T>(event: string, callback: EventCallback<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(callback);
  }

  public emit<T>(event: string, data: T): void {
    const callbacks = this.events.get(event);
    if (!callbacks) {
      this.logger.warn(`No subscribers found for event: ${event}`);
      return;
    }

    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        this.logger.error('Error in event callback', { event, error });
      }
    });
  }

  public unsubscribe<T>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback as EventCallback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  public clearAllSubscriptions(): void {
    this.events.clear();
  }
}