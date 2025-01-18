export type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'BETWEEN' | 'IS NULL' | 'IS NOT NULL';

export interface WhereCondition {
  field: string;
  operator: Operator;
  value?: any | any[];
  connector?: 'AND' | 'OR';
}

export class WhereBuilder {
  private conditions: WhereCondition[] = [];
  private groups: WhereBuilder[] = [];
  private groupConnector: 'AND' | 'OR' = 'AND';

  public where(field: string, operator: Operator, value?: any): WhereBuilder {
    this.conditions.push({
      field,
      operator,
      value,
      connector: 'AND'
    });
    return this;
  }

  public orWhere(field: string, operator: Operator, value?: any): WhereBuilder {
    this.conditions.push({
      field,
      operator,
      value,
      connector: 'OR'
    });
    return this;
  }

  public whereIn(field: string, values: any[]): WhereBuilder {
    return this.where(field, 'IN', values);
  }

  public whereBetween(field: string, range: [any, any]): WhereBuilder {
    return this.where(field, 'BETWEEN', range);
  }

  public whereNull(field: string): WhereBuilder {
    return this.where(field, 'IS NULL');
  }

  public whereNotNull(field: string): WhereBuilder {
    return this.where(field, 'IS NOT NULL');
  }

  public group(callback: (builder: WhereBuilder) => void, connector: 'AND' | 'OR' = 'AND'): WhereBuilder {
    const builder = new WhereBuilder();
    callback(builder);
    this.groups.push(builder);
    this.groupConnector = connector;
    return this;
  }

  public build(): { sql: string; values: any[] } {
    const values: any[] = [];
    const conditions: string[] = [];

    // Build regular conditions
    this.conditions.forEach((condition, index) => {
      const connector = index === 0 ? '' : ` ${condition.connector} `;
      
      if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
        const placeholders = new Array(condition.value.length).fill('?').join(', ');
        conditions.push(`${connector}${condition.field} ${condition.operator} (${placeholders})`);
        values.push(...condition.value);
      } else if (condition.operator === 'BETWEEN') {
        conditions.push(`${connector}${condition.field} BETWEEN ? AND ?`);
        values.push(condition.value[0], condition.value[1]);
      } else if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
        conditions.push(`${connector}${condition.field} ${condition.operator}`);
      } else {
        conditions.push(`${connector}${condition.field} ${condition.operator} ?`);
        values.push(condition.value);
      }
    });

    // Build grouped conditions
    if (this.groups.length > 0) {
      const groupedConditions = this.groups.map(group => {
        const built = group.build();
        values.push(...built.values);
        return `(${built.sql})`;
      });

      if (conditions.length > 0) {
        conditions.push(` ${this.groupConnector} `);
      }
      conditions.push(groupedConditions.join(` ${this.groupConnector} `));
    }

    return {
      sql: conditions.join(''),
      values
    };
  }
}
