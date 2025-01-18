import { BaseModel } from '../BaseModel';
import { Relation } from './Relation';
import { QueryBuilder } from '../../query/QueryBuilder';

export class HasOne extends Relation {
    protected buildQuery(parentInstance: BaseModel): QueryBuilder {
        return this.query
            .table(this.relatedModel.getDefinition().tableName)
            .where(this.foreignKey, '=', parentInstance.getAttribute(this.localKey))
            .limit(1);
    }

    protected hydrateResults(results: any[]): BaseModel | null {
        if (!results.length) return null;
        return new (this.relatedModel as any)(results[0]);
    }
}