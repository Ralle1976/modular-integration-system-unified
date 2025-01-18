import { BaseModel } from '../BaseModel';
import { Relation } from './Relation';
import { QueryBuilder } from '../../query/QueryBuilder';

export class HasMany extends Relation {
    protected buildQuery(parentInstance: BaseModel): QueryBuilder {
        return this.query
            .table(this.relatedModel.getDefinition().tableName)
            .where(this.foreignKey, '=', parentInstance.getAttribute(this.localKey));
    }
}