import winston from 'winston';

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(level: string, message: string, context?: any): void {
    this.logger.log(level, message, { context });
  }

  public info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  public error(message: string, context?: any): void {
    this.log('error', message, context);
  }
}