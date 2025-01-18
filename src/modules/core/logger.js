/**
 * Zentrales Logging-System
 */

class Logger {
  constructor() {
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.currentLevel = this.logLevels.INFO;
    this.outputHandlers = [this.consoleOutput.bind(this)];
  }

  setLevel(level) {
    if (this.logLevels[level] !== undefined) {
      this.currentLevel = this.logLevels[level];
    }
  }

  addOutputHandler(handler) {
    this.outputHandlers.push(handler);
  }

  consoleOutput(level, message, meta) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, meta);
  }

  log(level, message, meta = {}) {
    if (this.logLevels[level] <= this.currentLevel) {
      this.outputHandlers.forEach(handler => handler(level, message, meta));
    }
  }

  error(message, meta = {}) { 
    this.log('ERROR', message, meta);
    // Fehler auch an Error-Monitoring-System senden
    if (meta.error instanceof Error) {
      this.sendToErrorMonitoring(meta.error);
    }
  }

  warn(message, meta = {}) { 
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) { 
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) { 
    this.log('DEBUG', message, meta);
  }

  sendToErrorMonitoring(error) {
    // Hier können Sie die Integration mit einem Error-Monitoring-Service implementieren
    // z.B. Sentry, Rollbar, etc.
    console.error('Error-Monitoring:', error);
  }
}

module.exports = new Logger();