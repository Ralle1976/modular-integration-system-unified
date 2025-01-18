import { QueryBuilder } from '../query/QueryBuilder';
import { ModelManager } from './ModelManager';
import { EventEmitter } from 'events';
import { Relation, RelationOptions } from './relations/Relation';
import { HasOne } from './relations/HasOne';
import { HasMany } from './relations/HasMany';
import { BelongsTo } from './relations/BelongsTo';
import { ManyToMany } from './relations/ManyToMany';

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
    protected relations: Map<string, BaseModel | BaseModel[] | null> = new Map();
    protected relationDefinitions: Map<string, Relation> = new Map();
    
    private static eventEmitter: EventEmitter = new EventEmitter();
    private static queryBuilder: QueryBuilder;

    constructor(attributes: ModelAttributes = {}) {
        this.attributes = attributes;
        this.isNew = !attributes[this.getPrimaryKey()];
    }

    // ... [vorherige Methoden bleiben gleich] ...

    // Relationship Methods
    protected hasOne(related: typeof BaseModel, options: RelationOptions = {}): HasOne {
        const relation = new HasOne(this.constructor as typeof BaseModel, related, options);
        this.relationDefinitions.set(options.as || related.getDefinition().tableName, relation);
        return relation;
    }

    protected hasMany(related: typeof BaseModel, options: RelationOptions = {}): HasMany {
        const relation = new HasMany(this.constructor as typeof BaseModel, related, options);
        this.relationDefinitions.set(options.as || related.getDefinition().tableName, relation);
        return relation;
    }

    protected belongsTo(related: typeof BaseModel, options: RelationOptions = {}): BelongsTo {
        const relation = new BelongsTo(this.constructor as typeof BaseModel, related, options);
        this.relationDefinitions.set(options.as || related.getDefinition().tableName, relation);
        return relation;
    }

    protected belongsToMany(related: typeof BaseModel, options: RelationOptions = {}): ManyToMany {
        const relation = new ManyToMany(this.constructor as typeof BaseModel, related, options);
        this.relationDefinitions.set(options.as || related.getDefinition().tableName, relation);
        return relation;
    }

    public async load(relations: string | string[]): Promise<this> {
        const relationNames = Array.isArray(relations) ? relations : [relations];
        
        for (const relationName of relationNames) {
            const relation = this.relationDefinitions.get(relationName);
            if (!relation) {
                throw new Error(`Relation ${relationName} not found`);
            }

            const result = await relation.getResults(this);
            this.relations.set(relationName, result);
        }

        return this;
    }

    public getRelation(name: string): BaseModel | BaseModel[] | null {
        return this.relations.get(name) || null;
    }

    public async loadMissing(relations: string[]): Promise<this> {
        const missingRelations = relations.filter(relation => !this.relations.has(relation));
        if (missingRelations.length > 0) {
            await this.load(missingRelations);
        }
        return this;
    }
}