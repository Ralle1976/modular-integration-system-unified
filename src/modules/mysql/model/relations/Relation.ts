import { BaseModel } from '../BaseModel';
import { QueryBuilder } from '../../query/QueryBuilder';

export interface RelationOptions {
    foreignKey?: string;
    localKey?: string;
    pivotTable?: string;
    pivotForeignKey?: string;
    pivotRelatedKey?: string;
    withTimestamps?: boolean;
    as?: string;
}

export abstract class Relation {
    protected parentModel: typeof BaseModel;
    protected relatedModel: typeof BaseModel;
    protected foreignKey: string;
    protected localKey: string;
    protected query: QueryBuilder;

    constructor(
        parentModel: typeof BaseModel,
        relatedModel: typeof BaseModel,
        options: RelationOptions = {}
    ) {
        this.parentModel = parentModel;
        this.relatedModel = relatedModel;
        this.query = new QueryBuilder();
        
        this.setupKeys(options);
    }

    protected setupKeys(options: RelationOptions): void {
        const parentTable = this.parentModel.getDefinition().tableName;
        const relatedTable = this.relatedModel.getDefinition().tableName;
        
        this.localKey = options.localKey || 'id';
        this.foreignKey = options.foreignKey || `${parentTable}_id`;
    }

    protected abstract buildQuery(parentInstance: BaseModel): QueryBuilder;

    public async getResults(parentInstance: BaseModel): Promise<BaseModel | BaseModel[] | null> {
        const query = this.buildQuery(parentInstance);
        const results = await query.get();
        return this.hydrateResults(results);
    }

    protected hydrateResults(results: any[]): BaseModel | BaseModel[] | null {
        if (!results.length) return null;
        return results.map(result => new (this.relatedModel as any)(result));
    }
}