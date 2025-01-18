export class BaseError extends Error {
  public readonly name: string;
  public readonly isOperational: boolean;
  public readonly statusCode: number;

  constructor(
    message: string, 
    name = 'BaseError', 
    statusCode = 500, 
    isOperational = true
  ) {
    super(message);
    
    Object.setPrototypeOf(this, new.target.prototype);
    
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      stack: this.stack
    };
  }
}