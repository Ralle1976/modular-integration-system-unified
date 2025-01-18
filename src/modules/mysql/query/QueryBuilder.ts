import { JoinBuilder } from './JoinBuilder';
import { WhereBuilder } from './WhereBuilder';
import { GroupBuilder } from './GroupBuilder';
import { OrderBuilder } from './OrderBuilder';
import { PaginationHelper, PaginationOptions, PaginationResult } from './PaginationHelper';
import { MySQLConnection } from '../MySQLConnection';

export class QueryBuilder {
  private connection: MySQLConnection;
  private table: string = '';
  private fields: string[] = ['*'];
  private joinBuilder: JoinBuilder;
  private whereBuilder: WhereBuilder;
  private groupBuilder: GroupBuilder;
  private orderBuilder: OrderBuilder;
  private paginationHelper?: PaginationHelper;

  constructor() {
    this.connection = MySQLConnection.getInstance();
    this.joinBuilder = new JoinBuilder();
    this.whereBuilder = new WhereBuilder();
    this.groupBuilder = new GroupBuilder();
    this.orderBuilder = new OrderBuilder();
  }

  public from(table: string): QueryBuilder {
    this.table = table;
    return this;
  }

  public select(fields: string | string[]): QueryBuilder {
    this.fields = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  // Join Methods
  public join(table: string, conditions: string, values: any[] = []): QueryBuilder {
    this.joinBuilder.join(table, conditions, values);
    return this;
  }

  public leftJoin(table: string, conditions: string, values: any[] = []): QueryBuilder {
    this.joinBuilder.leftJoin(table, conditions, values);
    return this;
  }

  // Where Methods
  public where(field: string, operator: string, value: any): QueryBuilder {
    this.whereBuilder.where(field, operator, value);
    return this;
  }

  public whereIn(field: string, values: any[]): QueryBuilder {
    this.whereBuilder.whereIn(field, values);
    return this;
  }

  // Group Methods
  public groupBy(fields: string | string[]): QueryBuilder {
    this.groupBuilder.groupBy(fields);
    return this;
  }

  public having(field: string, operator: string, value: any, aggregateFunc?: string): QueryBuilder {
    this.groupBuilder.having(field, operator, value, aggregateFunc);
    return this;
  }

  // Order Methods
  public orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.orderBuilder.orderBy(field, direction);
    return this;
  }

  // Pagination Methods
  public paginate(options: PaginationOptions): QueryBuilder {
    this.paginationHelper = new PaginationHelper(options);
    return this;
  }

  public async get<T>(): Promise<T[]> {
    const { sql, values } = this.buildQuery();
    return await this.connection.query<T[]>(sql, values);
  }

  public async getPaginated<T>(): Promise<PaginationResult<T>> {
    if (!this.paginationHelper) {
      throw new Error('Pagination not configured. Call paginate() before getPaginated()');
    }

    const { sql, values } = this.buildQuery();
    const countSql = `SELECT COUNT(*) as count FROM ${this.table}`;

    return await this.paginationHelper.paginate(
      () => this.connection.query<T[]>(sql, values),
      async () => {
        const result = await this.connection.query<[{count: number}]>(countSql);
        return result[0].count;
      }
    );
  }

  private buildQuery(): { sql: string; values: any[] } {
    const parts: string[] = ['SELECT', this.fields.join(', '), 'FROM', this.table];
    const values: any[] = [];

    // Join
    const joinBuild = this.joinBuilder.build();
    if (joinBuild.sql) {
      parts.push(joinBuild.sql);
      values.push(...joinBuild.values);
    }

    // Where
    const whereBuild = this.whereBuilder.build();
    if (whereBuild.sql) {
      parts.push('WHERE', whereBuild.sql);
      values.push(...whereBuild.values);
    }

    // Group By & Having
    const groupBuild = this.groupBuilder.build();
    if (groupBuild.sql) {
      parts.push(groupBuild.sql);
      values.push(...groupBuild.values);
    }

    // Order By
    const orderBuild = this.orderBuilder.build();
    if (orderBuild.sql) {
      parts.push(orderBuild.sql);
    }

    // Pagination
    if (this.paginationHelper) {
      const paginationBuild = this.paginationHelper.build();
      parts.push(paginationBuild.sql);
      values.push(...paginationBuild.values);
    }

    return {
      sql: parts.join(' '),
      values
    };
  }
}