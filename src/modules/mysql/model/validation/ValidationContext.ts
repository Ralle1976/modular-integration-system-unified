import { BaseModel } from '../BaseModel';

export class ValidationContext {
    private _data: Record<string, any>;
    private _model: BaseModel | null;
    private _customData: Map<string, any>;

    constructor(data: Record<string, any>, model: BaseModel | null = null) {
        this._data = { ...data };
        this._model = model;
        this._customData = new Map();
    }

    /**
     * Get all validation data
     */
    public getData(): Record<string, any> {
        return { ...this._data };
    }

    /**
     * Get a specific field's value
     */
    public getValue(field: string): any {
        return this._data[field];
    }

    /**
     * Get the model being validated
     */
    public getModel(): BaseModel | null {
        return this._model;
    }

    /**
     * Check if a field exists in the validation data
     */
    public hasField(field: string): boolean {
        return field in this._data;
    }

    /**
     * Store custom data in the context
     */
    public setCustomData(key: string, value: any): void {
        this._customData.set(key, value);
    }

    /**
     * Get custom data from the context
     */
    public getCustomData(key: string): any {
        return this._customData.get(key);
    }

    /**
     * Check if custom data exists
     */
    public hasCustomData(key: string): boolean {
        return this._customData.has(key);
    }

    /**
     * Create a new context for a subset of data
     */
    public createSubContext(data: Record<string, any>): ValidationContext {
        const subContext = new ValidationContext(data, this._model);
        this._customData.forEach((value, key) => {
            subContext.setCustomData(key, value);
        });
        return subContext;
    }
}