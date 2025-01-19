export interface ErrorContext {
  module: string;
  operation: string;
  timestamp: Date;
  details?: any;
}