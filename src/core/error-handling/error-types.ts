import { BaseError } from './base-error';

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'ValidationError', 400);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message = 'Authentifizierung fehlgeschlagen') {
    super(message, 'AuthenticationError', 401);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message = 'Nicht autorisiert') {
    super(message, 'AuthorizationError', 403);
  }
}

export class ResourceNotFoundError extends BaseError {
  constructor(resourceName: string) {
    super(`Ressource nicht gefunden: ${resourceName}`, 'ResourceNotFoundError', 404);
  }
}

export class DatabaseError extends BaseError {
  constructor(message: string) {
    super(message, 'DatabaseError', 500);
  }
}

export class ExternalServiceError extends BaseError {
  constructor(serviceName: string, message = 'Externer Dienst nicht verfügbar') {
    super(`${serviceName}: ${message}`, 'ExternalServiceError', 503);
  }
}