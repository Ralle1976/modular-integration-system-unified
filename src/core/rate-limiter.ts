import { Logger } from './logger';
import { ConfigManager } from './config-manager';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  firstRequestTime: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private logger: Logger;
  private config: ConfigManager;
  private requestRecords: Map<string, RequestRecord> = new Map();

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public configureLimit(identifier: string, config?: RateLimitConfig): void {
    const defaultConfig: RateLimitConfig = {
      maxRequests: this.config.get('security.rateLimiting.maxRequests', 100),
      windowMs: this.config.get('security.rateLimiting.windowMs', 15 * 60 * 1000)
    };

    const finalConfig: RateLimitConfig = { ...defaultConfig, ...config };
    this.logger.info(`Rate limit configured for ${identifier}: ${JSON.stringify(finalConfig)}`);
  }

  public isAllowed(identifier: string, config?: RateLimitConfig): boolean {
    const defaultConfig: RateLimitConfig = {
      maxRequests: this.config.get('security.rateLimiting.maxRequests', 100),
      windowMs: this.config.get('security.rateLimiting.windowMs', 15 * 60 * 1000)
    };

    const finalConfig: RateLimitConfig = { ...defaultConfig, ...config };
    const now = Date.now();

    let record = this.requestRecords.get(identifier);

    // Reset record if window has expired
    if (!record || now - record.firstRequestTime > finalConfig.windowMs) {
      record = { count: 1, firstRequestTime: now };
      this.requestRecords.set(identifier, record);
      return true;
    }

    // Check if max requests exceeded
    if (record.count >= finalConfig.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${identifier}`);
      return false;
    }

    // Increment request count
    record.count++;
    return true;
  }

  public resetLimit(identifier: string): void {
    this.requestRecords.delete(identifier);
    this.logger.info(`Rate limit reset for ${identifier}`);
  }

  public getStatus(identifier: string): { 
    requestsRemaining: number; 
    resetTime: number 
  } {
    const record = this.requestRecords.get(identifier);
    const config = {
      maxRequests: this.config.get('security.rateLimiting.maxRequests', 100),
      windowMs: this.config.get('security.rateLimiting.windowMs', 15 * 60 * 1000)
    };

    if (!record) {
      return { 
        requestsRemaining: config.maxRequests, 
        resetTime: Date.now() + config.windowMs 
      };
    }

    return {
      requestsRemaining: Math.max(0, config.maxRequests - record.count),
      resetTime: record.firstRequestTime + config.windowMs
    };
  }

  public clearExpiredRecords(): void {
    const now = Date.now();
    const config = {
      windowMs: this.config.get('security.rateLimiting.windowMs', 15 * 60 * 1000)
    };

    for (const [identifier, record] of this.requestRecords.entries()) {
      if (now - record.firstRequestTime > config.windowMs) {
        this.requestRecords.delete(identifier);
      }
    }

    this.logger.info('Expired rate limit records cleared');
  }
}