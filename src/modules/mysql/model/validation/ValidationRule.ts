/**
 * Interface für Validierungsregeln.
 * Jede Regel muss eine validate() und eine message() Methode implementieren.
 */
export interface ValidationRule {
    /**
     * Führt die Validierung durch.
     * @param value - Der zu validierende Wert
     * @param attribute - Name des Attributs das validiert wird
     * @param data - Alle Modelattribute für kontextabhängige Validierung
     * @returns true wenn valid, false wenn invalid
     */
    validate(value: any, attribute: string, data: Record<string, any>): boolean | Promise<boolean>;

    /**
     * Generiert die Fehlermeldung für diese Regel.
     * @param attribute - Name des invaliden Attributs
     * @returns Fehlermeldung als String
     */
    message(attribute: string): string;

    /**
     * Optional: Bestimmt ob die Regel asynchron ist
     */
    isAsync?(): boolean;
}

/**
 * Basisklasse für Validierungsregeln mit gemeinsamer Funktionalität.
 */
export abstract class BaseValidationRule implements ValidationRule {
    protected customMessage?: string;

    constructor(customMessage?: string) {
        this.customMessage = customMessage;
    }

    abstract validate(value: any, attribute: string, data: Record<string, any>): boolean | Promise<boolean>;

    public message(attribute: string): string {
        return this.customMessage || this.defaultMessage(attribute);
    }

    protected abstract defaultMessage(attribute: string): string;

    public isAsync(): boolean {
        return false;
    }
}