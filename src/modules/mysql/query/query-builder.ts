import { MySQLModule } from '../mysql-module';
import { ModelDefinition } from '../model/base-model';

export type Operator = '=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';

export class QueryBuilder {
  private conditions: string[] = [];
  private params: any[] = [];
  private mysql: MySQLModule;

  constructor(private modelDefinition: ModelDefinition) {
    this.mysql = MySQLModule.getInstance();
  }

  public where(column: string, operator: Operator, value: any): this {
    this.conditions.push(`${column} ${operator} ?`);
    this.params.push(value);
    return this;
  }

  public async get(): Promise<any[]> {
    const conn = await this.mysql.getConnection();
    try {
      const whereClause = this.conditions.length ? 
        `WHERE ${this.conditions.join(' AND ')}` : '';
      const [rows] = await conn.query(
        `SELECT * FROM ${this.modelDefinition.table} ${whereClause}`, 
        this.params
      );
      return rows as any[];
    } finally {
      conn.release();
    }
  }
}