import { BaseModel, ModelDefinition } from './BaseModel';
import { MySQLConnection } from '../connection/MySQLConnection';

export class ModelManager {
    private static instance: ModelManager;
    private models: Map<string, typeof BaseModel> = new Map();
    private connection: MySQLConnection;

    private constructor() {
        this.connection = MySQLConnection.getInstance();
    }

    public static getInstance(): ModelManager {
        if (!ModelManager.instance) {
            ModelManager.instance = new ModelManager();
        }
        return ModelManager.instance;
    }

    public registerModel(modelClass: typeof BaseModel): void {
        const definition = modelClass.getDefinition();
        if (!definition || !definition.tableName) {
            throw new Error('Model definition missing or invalid');
        }

        this.models.set(definition.tableName, modelClass);
        this.ensureTableExists(definition).catch(error => {
            console.error(`Failed to create table for model ${definition.tableName}:`, error);
        });
    }

    public getModel(tableName: string): typeof BaseModel | undefined {
        return this.models.get(tableName);
    }

    private async ensureTableExists(definition: ModelDefinition): Promise<void> {
        const query = this.buildCreateTableQuery(definition);
        try {
            await this.connection.query(query);
        } catch (error) {
            if ((error as Error).message.includes('already exists')) {
                return;
            }
            throw error;
        }
    }

    private buildCreateTableQuery(definition: ModelDefinition): string {
        const columns: string[] = [];

        const primaryKey = definition.primaryKey || 'id';
        columns.push(`${primaryKey} BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`);

        if (definition.attributes) {
            for (const [name, config] of Object.entries(definition.attributes)) {
                let column = `${name} ${this.mapAttributeTypeToSQL(config.type)}`;
                
                if (config.nullable === false) {
                    column += ' NOT NULL';
                }
                
                if (config.default !== undefined) {
                    column += ` DEFAULT ${this.escapeDefaultValue(config.default)}`;
                }
                
                columns.push(column);
            }
        }

        if (definition.timestamps !== false) {
            columns.push('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
            columns.push('updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
        }

        return `CREATE TABLE IF NOT EXISTS ${definition.tableName} (
            ${columns.join(',\n')}
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
    }

    private mapAttributeTypeToSQL(type: string): string {
        const typeMap: { [key: string]: string } = {
            'string': 'VARCHAR(255)',
            'text': 'TEXT',
            'number': 'INT',
            'float': 'FLOAT',
            'boolean': 'TINYINT(1)',
            'date': 'DATE',
            'datetime': 'DATETIME',
            'timestamp': 'TIMESTAMP'
        };

        return typeMap[type.toLowerCase()] || 'VARCHAR(255)';
    }

    private escapeDefaultValue(value: any): string {
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'boolean') return value ? '1' : '0';
        return value.toString();
    }
}