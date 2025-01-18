export class BelongsTo<T> implements Relation<T> {
    private foreignKey: string;
    private targetModel: typeof Model;

    constructor(targetModel: typeof Model, foreignKey: string) {
        this.targetModel = targetModel;
        this.foreignKey = foreignKey;
    }

    public async load(sourceInstance: Model): Promise<T | null> {
        const foreignKeyValue = sourceInstance[this.foreignKey];
        if (!foreignKeyValue) return null;

        return await this.targetModel.findById(foreignKeyValue) as T;
    }
}