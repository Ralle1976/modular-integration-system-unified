export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export class ConfigValidator {
  async validate(): Promise<ValidationResult> {
    // Basis-Implementierung
    return { isValid: true };
  }
}