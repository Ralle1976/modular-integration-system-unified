import { QueryBuilder } from '../query/QueryBuilder';
import { ModelManager } from './ModelManager';
import { EventEmitter } from 'events';

export interface ModelAttributes {
    [key: string]: any;
}

export interface ModelDefinition {
    tableName: string;
    primaryKey?: string;
    timestamps?: boolean;
    attributes?: {
        [key: string]: {
            type: string;
            nullable?: boolean;
            default?: any;
        }
    }
}

export class BaseModel {
    protected static modelDefinition: ModelDefinition;
    protected attributes: ModelAttributes = {};
    protected isDirty: boolean = false;
    protected isNew: boolean = true;
    
    private static eventEmitter: EventEmitter = new EventEmitter();
    private static queryBuilder: QueryBuilder;

    constructor(attributes: ModelAttributes = {}) {
        this.attributes = attributes;
        this.isNew = !attributes[this.getPrimaryKey()];
    }

    public static setDefinition(definition: ModelDefinition): void {
        this.modelDefinition = {
            primaryKey: 'id',
            timestamps: true,
            ...definition
        };
        
        ModelManager.getInstance().registerModel(this);
    }

    public static getDefinition(): ModelDefinition {
        return this.modelDefinition;
    }

    public async save(): Promise<boolean> {
        if (!this.isDirty && !this.isNew) return true;

        await this.emitEvent('saving');
        
        try {
            if (this.isNew) {
                await this.emitEvent('creating');
                const result = await this.create();
                await this.emitEvent('created');
            } else {
                await this.emitEvent('updating');
                const result = await this.update();
                await this.emitEvent('updated');
            }

            this.isDirty = false;
            this.isNew = false;
            await this.emitEvent('saved');
            
            return true;
        } catch (error) {
            await this.emitEvent('error', error);
            throw error;
        }
    }

    protected async create(): Promise<any> {
        const query = BaseModel.queryBuilder
            .table(this.getTableName())
            .insert(this.getAttributes());

        const result = await query.execute();
        if (result.insertId) {
            this.setAttribute(this.getPrimaryKey(), result.insertId);
        }
        return result;
    }

    protected async update(): Promise<any> {
        return BaseModel.queryBuilder
            .table(this.getTableName())
            .where(this.getPrimaryKey(), '=', this.getPrimaryKeyValue())
            .update(this.getAttributes());
    }

    public async delete(): Promise<boolean> {
        await this.emitEvent('deleting');
        
        try {
            await BaseModel.queryBuilder
                .table(this.getTableName())
                .where(this.getPrimaryKey(), '=', this.getPrimaryKeyValue())
                .delete();

            await this.emitEvent('deleted');
            return true;
        } catch (error) {
            await this.emitEvent('error', error);
            throw error;
        }
    }

    public static async find(id: number | string): Promise<BaseModel | null> {
        const result = await this.queryBuilder
            .table(this.modelDefinition.tableName)
            .where(this.modelDefinition.primaryKey || 'id', '=', id)
            .first();

        return result ? new this(result) : null;
    }

    public static async findAll(): Promise<BaseModel[]> {
        const results = await this.queryBuilder
            .table(this.modelDefinition.tableName)
            .get();

        return results.map(result => new this(result));
    }

    protected static on(event: string, callback: (...args: any[]) => void): void {
        this.eventEmitter.on(event, callback);
    }

    protected async emitEvent(event: string, data?: any): Promise<void> {
        return new Promise((resolve) => {
            BaseModel.eventEmitter.emit(event, this, data);
            resolve();
        });
    }

    protected getTableName(): string {
        return (this.constructor as typeof BaseModel).modelDefinition.tableName;
    }

    protected getPrimaryKey(): string {
        return (this.constructor as typeof BaseModel).modelDefinition.primaryKey || 'id';
    }

    protected getPrimaryKeyValue(): any {
        return this.attributes[this.getPrimaryKey()];
    }

    public getAttributes(): ModelAttributes {
        return { ...this.attributes };
    }

    public setAttribute(key: string, value: any): void {
        if (this.attributes[key] !== value) {
            this.attributes[key] = value;
            this.isDirty = true;
        }
    }

    public getAttribute(key: string): any {
        return this.attributes[key];
    }
}