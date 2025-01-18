import { Logger } from './logger';

type EventCallback<T = unknown> = (data: T) => void | Promise<void>;

interface EventSubscription {
  unsubscribe(): void;
}

export class EventBus {
  private static instance: EventBus;
  private eventMap: Map<string, Set<EventCallback>> = new Map();
  private logger: Logger;

  private constructor() {
    this.logger = new Logger('EventBus');
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T = unknown>(
    eventName: string, 
    callback: EventCallback<T>
  ): EventSubscription {
    if (!this.eventMap.has(eventName)) {
      this.eventMap.set(eventName, new Set());
    }

    const callbackSet = this.eventMap.get(eventName)!;
    callbackSet.add(callback);

    this.logger.info(`Neuer Subscriber für Event: ${eventName}`);

    return {
      unsubscribe: () => {
        callbackSet.delete(callback);
        this.logger.info(`Subscriber für Event entfernt: ${eventName}`);
      }
    };
  }

  public async emit<T = unknown>(
    eventName: string, 
    data: T
  ): Promise<void> {
    const callbacks = this.eventMap.get(eventName);
    
    if (!callbacks || callbacks.size === 0) {
      this.logger.warn(`Keine Subscriber für Event: ${eventName}`);
      return;
    }

    this.logger.info(`Emitting Event: ${eventName}`, { 
      subscriberCount: callbacks.size 
    });

    const promises = Array.from(callbacks).map(async (callback) => {
      try {
        await callback(data);
      } catch (error) {
        this.logger.error(`Fehler in Event-Handler für ${eventName}`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  public clearAllSubscriptions(): void {
    this.eventMap.clear();
    this.logger.info('Alle Event-Subscriptions gelöscht');
  }

  public getSubscriberCount(eventName: string): number {
    return this.eventMap.get(eventName)?.size || 0;
  }
}