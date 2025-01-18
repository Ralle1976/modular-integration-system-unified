export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'CROSS';

export interface JoinClause {
  type: JoinType;
  table: string;
  conditions: string;
  values: any[];
}

export class JoinBuilder {
  private joins: JoinClause[] = [];

  public join(table: string, conditions: string, values: any[] = [], type: JoinType = 'INNER'): JoinBuilder {
    this.joins.push({
      type,
      table,
      conditions,
      values
    });
    return this;
  }

  public innerJoin(table: string, conditions: string, values: any[] = []): JoinBuilder {
    return this.join(table, conditions, values, 'INNER');
  }

  public leftJoin(table: string, conditions: string, values: any[] = []): JoinBuilder {
    return this.join(table, conditions, values, 'LEFT');
  }

  public rightJoin(table: string, conditions: string, values: any[] = []): JoinBuilder {
    return this.join(table, conditions, values, 'RIGHT');
  }

  public crossJoin(table: string): JoinBuilder {
    return this.join(table, '', [], 'CROSS');
  }

  public getJoins(): JoinClause[] {
    return this.joins;
  }

  public build(): { sql: string; values: any[] } {
    const values: any[] = [];
    const joinClauses = this.joins.map(join => {
      values.push(...join.values);
      return `${join.type} JOIN ${join.table}${join.conditions ? ` ON ${join.conditions}` : ''}`;
    });

    return {
      sql: joinClauses.join(' '),
      values
    };
  }
}
