import { ValidationRule } from './ValidationRule';
import { ValidationError } from './ValidationError';

/**
 * Hauptklasse für die Validierung von Modelattributen.
 */
export class Validator {
    private rules: Map<string, ValidationRule[]> = new Map();
    private errors: Record<string, string[]> = {};
    private customMessages: Record<string, string> = {};

    /**
     * Fügt eine neue Validierungsregel hinzu.
     * @param attribute - Das zu validierende Attribut
     * @param rule - Die anzuwendende Regel
     */
    public addRule(attribute: string, rule: ValidationRule): void {
        if (!this.rules.has(attribute)) {
            this.rules.set(attribute, []);
        }
        this.rules.get(attribute)!.push(rule);
    }

    /**
     * Setzt eine benutzerdefinierte Fehlermeldung für ein Attribut.
     */
    public setCustomMessage(attribute: string, message: string): void {
        this.customMessages[attribute] = message;
    }

    /**
     * Führt die Validierung für alle Attribute durch.
     * @param data - Die zu validierenden Daten
     * @returns true wenn alle Validierungen erfolgreich sind
     * @throws ValidationError wenn Validierungen fehlschlagen
     */
    public async validate(data: Record<string, any>): Promise<boolean> {
        this.errors = {};
        const validationPromises: Promise<void>[] = [];

        for (const [attribute, rules] of this.rules) {
            for (const rule of rules) {
                const promise = this.validateRule(rule, attribute, data);
                validationPromises.push(promise);
            }
        }

        await Promise.all(validationPromises);

        if (Object.keys(this.errors).length > 0) {
            throw new ValidationError(this.errors);
        }

        return true;
    }

    /**
     * Validiert eine einzelne Regel.
     */
    private async validateRule(
        rule: ValidationRule,
        attribute: string,
        data: Record<string, any>
    ): Promise<void> {
        try {
            const value = data[attribute];
            const isValid = await Promise.resolve(rule.validate(value, attribute, data));

            if (!isValid) {
                this.addError(attribute, rule.message(attribute));
            }
        } catch (error) {
            this.addError(
                attribute,
                error instanceof Error ? error.message : 'Validation failed'
            );
        }
    }

    /**
     * Fügt einen Fehler zur Fehlerliste hinzu.
     */
    private addError(attribute: string, message: string): void {
        if (!this.errors[attribute]) {
            this.errors[attribute] = [];
        }
        
        // Verwende benutzerdefinierte Nachricht falls vorhanden
        const finalMessage = this.customMessages[attribute] || message;
        this.errors[attribute].push(finalMessage);
    }

    /**
     * Prüft ob Fehler vorhanden sind.
     */
    public hasErrors(): boolean {
        return Object.keys(this.errors).length > 0;
    }

    /**
     * Gibt alle Validierungsfehler zurück.
     */
    public getErrors(): Record<string, string[]> {
        return { ...this.errors };
    }

    /**
     * Löscht alle Fehler.
     */
    public clearErrors(): void {
        this.errors = {};
    }
}