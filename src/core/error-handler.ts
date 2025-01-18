import { Logger } from './logger';
import { EventBus } from './event-bus';
import * as fs from 'fs';
import * as path from 'path';

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorRecord {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: ErrorSeverity;
  module?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private logger: Logger;
  private eventBus: EventBus;
  private errors: ErrorRecord[] = [];
  private errorLogPath: string;

  private constructor() {
    this.logger = Logger.getInstance();
    this.eventBus = EventBus.getInstance();
    
    const logDir = path.resolve(process.cwd(), 'logs', 'errors');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.errorLogPath = path.join(logDir, 'error.log');
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public captureError(
    error: Error | string, 
    options: {
      severity?: ErrorSeverity;
      module?: string;
      context?: Record<string, any>;
    } = {}
  ): ErrorRecord {
    const errorRecord: ErrorRecord = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      severity: options.severity || ErrorSeverity.MEDIUM,
      module: options.module,
      context: options.context
    };

    this.errors.push(errorRecord);
    this.logErrorToFile(errorRecord);
    this.notifyErrorListeners(errorRecord);

    // Log based on severity
    switch (errorRecord.severity) {
      case ErrorSeverity.LOW:
        this.logger.info(`Low Severity Error: ${errorRecord.message}`);
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.warn(`Medium Severity Error: ${errorRecord.message}`);
        break;
      case ErrorSeverity.HIGH:
        this.logger.error(`High Severity Error: ${errorRecord.message}`);
        break;
      case ErrorSeverity.CRITICAL:
        this.logger.error(`CRITICAL ERROR: ${errorRecord.message}`);
        break;
    }

    return errorRecord;
  }

  private generateErrorId(): string {
    return `ERR-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  }

  private logErrorToFile(errorRecord: ErrorRecord): void {
    const errorLogEntry = JSON.stringify(errorRecord, null, 2) + '\n';
    
    try {
      fs.appendFileSync(this.errorLogPath, errorLogEntry);
    } catch (fileError) {
      console.error('Could not write to error log file', fileError);
    }
  }

  private notifyErrorListeners(errorRecord: ErrorRecord): void {
    this.eventBus.publish('system:error', errorRecord);
  }

  public getErrors(
    filters: {
      severity?: ErrorSeverity;
      module?: string;
      startTime?: number;
      endTime?: number;
    } = {}
  ): ErrorRecord[] {
    return this.errors.filter(error => {
      const matchesSeverity = !filters.severity || error.severity === filters.severity;
      const matchesModule = !filters.module || error.module === filters.module;
      const matchesStartTime = !filters.startTime || error.timestamp >= filters.startTime;
      const matchesEndTime = !filters.endTime || error.timestamp <= filters.endTime;

      return matchesSeverity && matchesModule && matchesStartTime && matchesEndTime;
    });
  }

  public clearErrors(
    filters: {
      severity?: ErrorSeverity;
      module?: string;
      olderThan?: number;
    } = {}
  ): void {
    const initialLength = this.errors.length;

    this.errors = this.errors.filter(error => {
      const matchesSeverity = !filters.severity || error.severity === filters.severity;
      const matchesModule = !filters.module || error.module === filters.module;
      const matchesAge = !filters.olderThan || (Date.now() - error.timestamp) < filters.olderThan;

      return !(matchesSeverity && matchesModule && matchesAge);
    });

    const removedCount = initialLength - this.errors.length;
    this.logger.info(`Cleared ${removedCount} error records`);
  }

  public setupGlobalErrorHandlers(): void {
    process.on('uncaughtException', (error) => {
      this.captureError(error, { 
        severity: ErrorSeverity.CRITICAL, 
        module: 'SYSTEM' 
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.captureError(reason instanceof Error ? reason : new Error(String(reason)), {
        severity: ErrorSeverity.HIGH,
        module: 'PROMISE_REJECTION',
        context: { promise }
      });
    });
  }
}