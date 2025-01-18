import winston from 'winston';

export class Logger {
  private logger: winston.Logger;

  constructor(context?: string) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, context: ctx, ...meta }) => {
          const contextInfo = ctx ? `[${ctx}] ` : '';
          return `${timestamp} ${level}: ${contextInfo}${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      defaultMeta: { context },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  public error(message: string, error?: Error | unknown): void {
    const errorMeta = error instanceof Error 
      ? { 
          errorName: error.name, 
          errorMessage: error.message, 
          stack: error.stack 
        } 
      : { error };
    
    this.logger.error(message, errorMeta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta);
  }
}