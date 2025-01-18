export interface HavingCondition {
  field: string;
  operator: string;
  value: any;
  aggregateFunc?: string;
}

export class GroupBuilder {
  private groups: string[] = [];
  private havingConditions: HavingCondition[] = [];

  public groupBy(fields: string | string[]): GroupBuilder {
    if (Array.isArray(fields)) {
      this.groups.push(...fields);
    } else {
      this.groups.push(fields);
    }
    return this;
  }

  public having(field: string, operator: string, value: any, aggregateFunc?: string): GroupBuilder {
    this.havingConditions.push({
      field,
      operator,
      value,
      aggregateFunc
    });
    return this;
  }

  public build(): { sql: string; values: any[] } {
    const values: any[] = [];
    let sql = '';

    // Group By
    if (this.groups.length > 0) {
      sql += ` GROUP BY ${this.groups.join(', ')}`;
    }

    // Having
    if (this.havingConditions.length > 0) {
      const havingClauses = this.havingConditions.map(condition => {
        values.push(condition.value);
        const field = condition.aggregateFunc 
          ? `${condition.aggregateFunc}(${condition.field})` 
          : condition.field;
        return `${field} ${condition.operator} ?`;
      });

      sql += ` HAVING ${havingClauses.join(' AND ')}`;
    }

    return { sql, values };
  }
}