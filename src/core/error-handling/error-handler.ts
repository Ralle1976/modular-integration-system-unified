import { Logger } from '../logger';
import { BaseError } from './base-error';

export class ErrorHandler {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ErrorHandler');
  }

  public async handleError(error: Error | BaseError): Promise<void> {
    // Unterscheidung zwischen standard und benutzerdefinierten Fehlern
    if (error instanceof BaseError) {
      this.handleBaseError(error);
    } else {
      this.handleUnexpectedError(error);
    }
  }

  private handleBaseError(error: BaseError): void {
    this.logger.error(`Operativer Fehler: ${error.name}`, {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    });

    // Zusätzliche Fehlerbehandlungslogik, z.B. 
    // - Senden von Benachrichtigungen
    // - Aufzeichnen in Fehlerdatenbank
    this.notifyErrorMonitoring(error);
  }

  private handleUnexpectedError(error: Error): void {
    this.logger.error(`Unerwarteter Fehler: ${error.name}`, {
      message: error.message,
      stack: error.stack
    });

    // Kritische Fehlerbehandlung
    this.sendCriticalErrorAlert(error);
  }

  private notifyErrorMonitoring(error: BaseError): void {
    // Implementierung der Fehlerüberwachung
    // Könnte einen Monitoring-Dienst oder eine Benachrichtigungslogik aufrufen
  }

  private sendCriticalErrorAlert(error: Error): void {
    // Kritische Fehler-Benachrichtigungslogik
    // z.B. Senden einer E-Mail an Administratoren
  }

  public processUnhandledRejections(): void {
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unbehandelter Promise-Fehler', { 
        reason, 
        promise 
      });
      // Optional: Prozess beenden oder Fehler behandeln
      // process.exit(1);
    });

    process.on('uncaughtException', (error) => {
      this.logger.error('Unbehandelter Systemfehler', { 
        error: error.message, 
        stack: error.stack 
      });
      // Sauberes Herunterfahren des Prozesses
      process.exit(1);
    });
  }
}