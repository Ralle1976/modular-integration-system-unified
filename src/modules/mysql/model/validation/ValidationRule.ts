import { ValidationContext } from './ValidationContext';

export interface ValidationRule {
    /**
     * Validates a value against this rule
     * @param value The value to validate
     * @param context The validation context
     * @returns Promise<boolean> true if validation passes, false otherwise
     */
    validate(value: any, context: ValidationContext): Promise<boolean>;

    /**
     * Gets the error message for this rule
     * @param field The field being validated
     * @param context The validation context
     * @returns The error message
     */
    getMessage(field: string, context: ValidationContext): string;

    /**
     * Gets the options for this rule
     * @returns The rule options
     */
    getOptions(): Record<string, any>;
}