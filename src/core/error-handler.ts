import { Logger } from './logger';

interface ErrorMetadata {
  timestamp: Date;
  module: string;
  context?: Record<string, unknown>;
}

export class ErrorHandler {
  protected logger: Logger;
  private moduleName: string;
  private errorMap: Map<string, number>;

  constructor(moduleName: string) {
    this.logger = new Logger();
    this.moduleName = moduleName;
    this.errorMap = new Map();
  }

  public handleError(error: Error, context?: Record<string, unknown>): void {
    const metadata: ErrorMetadata = {
      timestamp: new Date(),
      module: this.moduleName,
      context
    };

    // Erhöhe Fehlerzähler
    this.incrementErrorCount(error.name);

    // Log-Nachricht mit strukturierten Daten
    this.logger.error('Error occurred:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      metadata
    });

    // Optionale Fehlerbehandlungslogik basierend auf Fehlertyp
    this.handleSpecificError(error);
  }

  private incrementErrorCount(errorType: string): void {
    const currentCount = this.errorMap.get(errorType) || 0;
    this.errorMap.set(errorType, currentCount + 1);
  }

  private handleSpecificError(error: Error): void {
    switch (error.name) {
      case 'ValidationError':
        this.handleValidationError(error);
        break;
      case 'NetworkError':
        this.handleNetworkError(error);
        break;
      case 'AuthenticationError':
        this.handleAuthError(error);
        break;
      default:
        // Standardbehandlung für unbekannte Fehlertypen
        break;
    }
  }

  private handleValidationError(error: Error): void {
    // Spezifische Behandlung für Validierungsfehler
    this.logger.warn('Validation error occurred:', error.message);
  }

  private handleNetworkError(error: Error): void {
    // Spezifische Behandlung für Netzwerkfehler
    this.logger.error('Network error occurred:', error.message);
  }

  private handleAuthError(error: Error): void {
    // Spezifische Behandlung für Authentifizierungsfehler
    this.logger.error('Authentication error occurred:', error.message);
  }

  public getErrorCount(errorType: string): number {
    return this.errorMap.get(errorType) || 0;
  }

  public clearErrorCounts(): void {
    this.errorMap.clear();
  }
}