/**
 * Zentrales Error-Handling-System
 */

class ErrorHandler {
  constructor() {
    this.errorMap = new Map();
    this.initializeDefaultHandlers();
  }

  initializeDefaultHandlers() {
    this.registerError('NetworkError', (error) => {
      console.error('Netzwerkfehler:', error);
      return { retry: true, waitTime: 5000 };
    });

    this.registerError('AuthenticationError', (error) => {
      console.error('Authentifizierungsfehler:', error);
      return { retry: false, logout: true };
    });

    this.registerError('ValidationError', (error) => {
      console.error('Validierungsfehler:', error);
      return { retry: false, invalidFields: error.fields };
    });
  }

  registerError(errorType, handler) {
    this.errorMap.set(errorType, handler);
  }

  handleError(error) {
    const handler = this.errorMap.get(error.constructor.name) || this.defaultHandler;
    return handler(error);
  }

  defaultHandler(error) {
    console.error('Unbehandelter Fehler:', error);
    return { retry: false, error: error.message };
  }

  async withErrorHandling(operation) {
    try {
      return await operation();
    } catch (error) {
      return this.handleError(error);
    }
  }
}

module.exports = new ErrorHandler();