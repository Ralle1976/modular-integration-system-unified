import { BaseModel } from '../BaseModel';
import { Relation, RelationOptions } from './Relation';
import { QueryBuilder } from '../../query/QueryBuilder';

export class BelongsTo extends Relation {
    protected setupKeys(options: RelationOptions): void {
        const relatedTable = this.relatedModel.getDefinition().tableName;
        
        this.foreignKey = options.foreignKey || `${relatedTable}_id`;
        this.localKey = options.localKey || 'id';
    }

    protected buildQuery(parentInstance: BaseModel): QueryBuilder {
        return this.query
            .table(this.relatedModel.getDefinition().tableName)
            .where(this.localKey, '=', parentInstance.getAttribute(this.foreignKey))
            .limit(1);
    }

    protected hydrateResults(results: any[]): BaseModel | null {
        if (!results.length) return null;
        return new (this.relatedModel as any)(results[0]);
    }
}