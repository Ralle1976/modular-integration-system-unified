import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export class Logger {
  private static instance: Logger;
  private logFile: string;
  private currentLogLevel: LogLevel;

  private constructor() {
    const logDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
    this.logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    this.currentLogLevel = LogLevel.INFO;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private writeLog(level: LogLevel, message: string): void {
    if (this.shouldLog(level)) {
      const logEntry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
      
      // Console output
      console.log(logEntry.trim());
      
      // File logging
      try {
        fs.appendFileSync(this.logFile, logEntry);
      } catch (error) {
        console.error('Error writing to log file:', error);
      }
    }
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    const logLevels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return logLevels.indexOf(messageLevel) <= logLevels.indexOf(this.currentLogLevel);
  }

  public setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  public error(message: string): void {
    this.writeLog(LogLevel.ERROR, message);
  }

  public warn(message: string): void {
    this.writeLog(LogLevel.WARN, message);
  }

  public info(message: string): void {
    this.writeLog(LogLevel.INFO, message);
  }

  public debug(message: string): void {
    this.writeLog(LogLevel.DEBUG, message);
  }
}