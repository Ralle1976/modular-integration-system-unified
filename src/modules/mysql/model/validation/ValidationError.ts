/**
 * Repräsentiert einen Validierungsfehler mit detaillierten Fehlermeldungen pro Attribut.
 */
export class ValidationError extends Error {
    public readonly errors: Record<string, string[]>;

    constructor(errors: Record<string, string[]>) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;

        // Für besseres TypeScript Error Handling
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    /**
     * Gibt alle Fehlermeldungen als flaches Array zurück.
     */
    public getAllErrors(): string[] {
        return Object.values(this.errors).flat();
    }

    /**
     * Prüft ob ein bestimmtes Attribut Fehler enthält.
     */
    public hasError(attribute: string): boolean {
        return attribute in this.errors;
    }

    /**
     * Gibt die Fehlermeldungen für ein bestimmtes Attribut zurück.
     */
    public getError(attribute: string): string[] {
        return this.errors[attribute] || [];
    }

    /**
     * Formatiert die Fehlermeldungen als lesbaren String.
     */
    public toString(): string {
        return Object.entries(this.errors)
            .map(([attr, msgs]) => `${attr}: ${msgs.join(', ')}`)
            .join('\n');
    }
}