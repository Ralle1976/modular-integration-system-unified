import { Logger } from './logger';

export class ErrorHandler {
  private static instance: ErrorHandler;
  protected logger: Logger;

  protected constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: Error, context?: Record<string, unknown>): void {
    this.logger.error(`Error occurred: ${error.message}`, {
      error,
      stack: error.stack,
      ...context
    });
  }

  public setupGlobalErrorHandlers(): void {
    process.on('uncaughtException', (error: Error) => {
      this.handleError(error, { type: 'UNCAUGHT_EXCEPTION' });
    });

    process.on('unhandledRejection', (error: any) => {
      this.handleError(error instanceof Error ? error : new Error(String(error)), 
        { type: 'UNHANDLED_REJECTION' });
    });
  }
}