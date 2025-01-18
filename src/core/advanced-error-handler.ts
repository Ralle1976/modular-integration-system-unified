import { EventBus } from './event-bus';
import { Logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

export enum ErrorCategory {
  SYSTEM = 'SYSTEM',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorContext {
  timestamp?: number;
  module?: string;
  userId?: string;
  requestId?: string;
  additionalData?: Record<string, any>;
}

export interface DetailedError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  originalError?: Error;
  context?: ErrorContext;
  stackTrace?: string;
}

export class AdvancedErrorHandler {
  private static instance: AdvancedErrorHandler;
  private logger: Logger;
  private eventBus: EventBus;
  private errorLogPath: string;

  private constructor() {
    this.logger = Logger.getInstance();
    this.eventBus = EventBus.getInstance();

    const logDir = path.resolve(process.cwd(), 'logs', 'errors');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.errorLogPath = path.join(logDir, 'detailed-errors.json');
  }

  public static getInstance(): AdvancedErrorHandler {
    if (!AdvancedErrorHandler.instance) {
      AdvancedErrorHandler.instance = new AdvancedErrorHandler();
    }
    return AdvancedErrorHandler.instance;
  }

  public captureError(
    error: Error | string, 
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      context?: ErrorContext;
    } = {}
  ): DetailedError {
    const detailedError: DetailedError = {
      id: this.generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      category: options.category || this.inferErrorCategory(error),
      severity: this.determineSeverity(options.category, error),
      originalError: error instanceof Error ? error : undefined,
      context: {
        timestamp: Date.now(),
        ...options.context
      },
      stackTrace: error instanceof Error ? error.stack : undefined
    };

    this.logError(detailedError);
    this.notifyErrorListeners(detailedError);
    this.handleErrorBySeverity(detailedError);

    return detailedError;
  }

  private generateErrorId(): string {
    return `ERR-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  }

  private inferErrorCategory(error: Error | string): ErrorCategory {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    if (/network|timeout|connect/i.test(errorMessage)) return ErrorCategory.NETWORK;
    if (/database|query|sql/i.test(errorMessage)) return ErrorCategory.DATABASE;
    if (/authentication|unauthorized|forbidden/i.test(errorMessage)) return ErrorCategory.AUTHENTICATION;
    if (/validation|invalid|format/i.test(errorMessage)) return ErrorCategory.VALIDATION;
    if (/service|api|external/i.test(errorMessage)) return ErrorCategory.EXTERNAL_SERVICE;
    
    return ErrorCategory.UNKNOWN;
  }

  private determineSeverity(
    specifiedCategory?: ErrorCategory, 
    error?: Error | string
  ): ErrorSeverity {
    if (specifiedCategory) {
      switch (specifiedCategory) {
        case ErrorCategory.SYSTEM: return ErrorSeverity.CRITICAL;
        case ErrorCategory.AUTHENTICATION: return ErrorSeverity.HIGH;
        case ErrorCategory.DATABASE: return ErrorSeverity.HIGH;
        case ErrorCategory.NETWORK: return ErrorSeverity.MEDIUM;
        case ErrorCategory.EXTERNAL_SERVICE: return ErrorSeverity.MEDIUM;
        default: return ErrorSeverity.LOW;
      }
    }

    return ErrorSeverity.LOW;
  }

  private logError(error: DetailedError): void {
    try {
      const logEntry = JSON.stringify(error, null, 2) + '\n';
      fs.appendFileSync(this.errorLogPath, logEntry);
    } catch (logError) {
      console.error('Error logging failed', logError);
    }
  }

  private notifyErrorListeners(error: DetailedError): void {
    this.eventBus.publish('system:detailed-error', error);
  }

  private handleErrorBySeverity(error: DetailedError): void {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        this.logger.error(`CRITICAL ERROR: ${error.message}`, error);
        // Potential: Trigger emergency shutdown or alert mechanism
        break;
      case ErrorSeverity.HIGH:
        this.logger.error(`HIGH SEVERITY: ${error.message}`, error);
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.warn(`MEDIUM SEVERITY: ${error.message}`, error);
        break;
      default:
        this.logger.info(`LOW SEVERITY: ${error.message}`, error);
    }
  }

  public setupGlobalErrorHandlers(): void {
    process.on('uncaughtException', (error) => {
      this.captureError(error, { 
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.CRITICAL 
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.captureError(reason instanceof Error ? reason : new Error(String(reason)), {
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        context: { promise: String(promise) }
      });
    });
  }

  public getErrorsByCategory(category: ErrorCategory): DetailedError[] {
    try {
      const logContent = fs.readFileSync(this.errorLogPath, 'utf8');
      const errors: DetailedError[] = logContent
        .trim()
        .split('\n')
        .map(line => JSON.parse(line))
        .filter(error => error.category === category);

      return errors;
    } catch (error) {
      this.logger.error('Error reading error log', error);
      return [];
    }
  }
}