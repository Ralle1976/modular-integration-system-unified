import { ErrorContext } from './types/error-context';

export class AdvancedErrorHandler extends Error {
  private context: ErrorContext;

  constructor(moduleName: string) {
    super();
    this.context = {
      moduleName,
      timestamp: new Date()
    };
  }

  getContext(): ErrorContext {
    return this.context;
  }
}