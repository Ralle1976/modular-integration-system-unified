export class ValidationError extends Error {
    private _errors: Map<string, string[]>;
    private _errorCount: number;

    constructor(message: string = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
        this._errors = new Map();
        this._errorCount = 0;
    }

    public addError(field: string, message: string): void {
        if (!this._errors.has(field)) {
            this._errors.set(field, []);
        }
        this._errors.get(field)!.push(message);
        this._errorCount++;
    }

    public merge(error: ValidationError): void {
        error.getErrors().forEach((messages, field) => {
            messages.forEach(message => this.addError(field, message));
        });
    }

    public getErrors(): Map<string, string[]> {
        return new Map(this._errors);
    }

    public getErrorsForField(field: string): string[] {
        return this._errors.get(field) || [];
    }

    public hasErrors(): boolean {
        return this._errorCount > 0;
    }

    public toJSON(): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        this._errors.forEach((messages, field) => {
            result[field] = [...messages];
        });
        return result;
    }

    public toString(): string {
        const errors = this.toJSON();
        return Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
    }
}