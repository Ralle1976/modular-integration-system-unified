import { ErrorHandler } from './error-handler';

interface ValidationRule<T> {
  check: (value: T) => boolean;
  message: string;
}

interface ConfigSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    validate?: ValidationRule<unknown>[];
    properties?: ConfigSchema; // Für verschachtelte Objekte
  };
}

export class ConfigValidator {
  private errorHandler: ErrorHandler;

  constructor() {
    this.errorHandler = new ErrorHandler('ConfigValidator');
  }

  public validate(config: Record<string, unknown>, schema: ConfigSchema): boolean {
    try {
      Object.entries(schema).forEach(([key, rules]) => {
        // Prüfe ob required Felder vorhanden sind
        if (rules.required && !(key in config)) {
          throw new Error(`Required field '${key}' is missing`);
        }

        // Wenn Feld vorhanden ist, validiere es
        if (key in config) {
          this.validateField(key, config[key], rules);
        }
      });

      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.errorHandler.handleError(error);
      }
      return false;
    }
  }

  private validateField(
    key: string, 
    value: unknown, 
    rules: ConfigSchema[string]
  ): void {
    // Type-Check
    if (!this.checkType(value, rules.type)) {
      throw new Error(
        `Field '${key}' should be of type '${rules.type}' but got '${typeof value}'`
      );
    }

    // Validierungsregeln prüfen
    if (rules.validate) {
      rules.validate.forEach(rule => {
        if (!rule.check(value)) {
          throw new Error(`Validation failed for field '${key}': ${rule.message}`);
        }
      });
    }

    // Verschachtelte Objekte validieren
    if (rules.type === 'object' && rules.properties && typeof value === 'object' && value !== null) {
      Object.entries(rules.properties).forEach(([propKey, propRules]) => {
        const propValue = (value as Record<string, unknown>)[propKey];
        if (propValue !== undefined) {
          this.validateField(propKey, propValue, propRules);
        }
      });
    }
  }

  private checkType(value: unknown, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  }

  public static createRule<T>(
    check: (value: T) => boolean,
    message: string
  ): ValidationRule<T> {
    return { check, message };
  }

  // Vordefinierte Validierungsregeln
  public static readonly Rules = {
    nonEmptyString: ConfigValidator.createRule<string>(
      value => typeof value === 'string' && value.trim().length > 0,
      'String should not be empty'
    ),

    positiveNumber: ConfigValidator.createRule<number>(
      value => typeof value === 'number' && value > 0,
      'Number should be positive'
    ),

    validUrl: ConfigValidator.createRule<string>(
      value => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      'Value should be a valid URL'
    ),

    validEmail: ConfigValidator.createRule<string>(
      value => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      'Value should be a valid email address'
    )
  };
}