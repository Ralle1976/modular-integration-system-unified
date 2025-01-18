import { Logger } from './logger';

type EventCallback = (data: any) => void;

export class EventBus {
  private static instance: EventBus;
  private logger: Logger;
  private subscribers: Map<string, Set<EventCallback>> = new Map();

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe(event: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }

    const eventSubscribers = this.subscribers.get(event)!;
    eventSubscribers.add(callback);

    this.logger.info(`Subscriber added for event: ${event}`);

    // Return unsubscribe function
    return () => {
      eventSubscribers.delete(callback);
      this.logger.info(`Subscriber removed from event: ${event}`);
    };
  }

  public publish(event: string, data: any): void {
    const eventSubscribers = this.subscribers.get(event);

    if (!eventSubscribers || eventSubscribers.size === 0) {
      this.logger.warn(`No subscribers for event: ${event}`);
      return;
    }

    this.logger.info(`Publishing event: ${event} to ${eventSubscribers.size} subscribers`);

    eventSubscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        this.logger.error(`Error in event handler for ${event}: ${error}`);
      }
    });
  }

  public clearAllSubscriptions(): void {
    this.subscribers.clear();
    this.logger.info('All event subscriptions cleared');
  }

  public listEvents(): string[] {
    return Array.from(this.subscribers.keys());
  }
}