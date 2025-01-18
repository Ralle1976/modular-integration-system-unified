import { BaseModel } from '../BaseModel';
import { Relation, RelationOptions } from './Relation';
import { QueryBuilder } from '../../query/QueryBuilder';

export class ManyToMany extends Relation {
    private pivotTable: string;
    private pivotForeignKey: string;
    private pivotRelatedKey: string;
    private withTimestamps: boolean;

    protected setupKeys(options: RelationOptions): void {
        super.setupKeys(options);

        const parentTable = this.parentModel.getDefinition().tableName;
        const relatedTable = this.relatedModel.getDefinition().tableName;

        this.pivotTable = options.pivotTable || this.createPivotTableName(parentTable, relatedTable);
        this.pivotForeignKey = options.pivotForeignKey || `${parentTable}_id`;
        this.pivotRelatedKey = options.pivotRelatedKey || `${relatedTable}_id`;
        this.withTimestamps = options.withTimestamps || false;
    }

    private createPivotTableName(table1: string, table2: string): string {
        return [table1, table2].sort().join('_');
    }

    protected buildQuery(parentInstance: BaseModel): QueryBuilder {
        return this.query
            .table(this.relatedModel.getDefinition().tableName)
            .join(this.pivotTable, 
                  `${this.relatedModel.getDefinition().tableName}.id`, 
                  '=',
                  `${this.pivotTable}.${this.pivotRelatedKey}`)
            .where(`${this.pivotTable}.${this.pivotForeignKey}`, '=', 
                   parentInstance.getAttribute(this.localKey));
    }

    public async attach(
        parentInstance: BaseModel,
        relatedIds: number | number[],
        attributes: Record<string, any> = {}
    ): Promise<void> {
        const ids = Array.isArray(relatedIds) ? relatedIds : [relatedIds];
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        const records = ids.map(id => ({
            [this.pivotForeignKey]: parentInstance.getAttribute(this.localKey),
            [this.pivotRelatedKey]: id,
            ...(this.withTimestamps ? {
                created_at: timestamp,
                updated_at: timestamp
            } : {}),
            ...attributes
        }));

        await this.query
            .table(this.pivotTable)
            .insert(records);
    }

    public async detach(
        parentInstance: BaseModel,
        relatedIds?: number | number[]
    ): Promise<void> {
        const query = this.query.table(this.pivotTable)
            .where(this.pivotForeignKey, '=', parentInstance.getAttribute(this.localKey));

        if (relatedIds) {
            const ids = Array.isArray(relatedIds) ? relatedIds : [relatedIds];
            query.whereIn(this.pivotRelatedKey, ids);
        }

        await query.delete();
    }

    public async sync(
        parentInstance: BaseModel,
        relatedIds: number[],
        attributes: Record<string, any> = {}
    ): Promise<void> {
        await this.detach(parentInstance);
        await this.attach(parentInstance, relatedIds, attributes);
    }
}