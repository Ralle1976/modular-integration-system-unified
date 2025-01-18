import { Logger } from './logger';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public setupGlobalErrorHandlers(): void {
    process.on('uncaughtException', (error) => {
      this.captureError(error, { type: 'UNCAUGHT_EXCEPTION' });
    });

    process.on('unhandledRejection', (error) => {
      this.captureError(error as Error, { type: 'UNHANDLED_REJECTION' });
    });
  }

  public captureError(error: Error, context?: Record<string, unknown>): void {
    this.logger.error(error.message, {
      stack: error.stack,
      ...context
    });
  }
}