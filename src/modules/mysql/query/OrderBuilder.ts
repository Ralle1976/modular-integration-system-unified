export type OrderDirection = 'ASC' | 'DESC';

export interface OrderClause {
  field: string;
  direction: OrderDirection;
}

export class OrderBuilder {
  private orders: OrderClause[] = [];

  public orderBy(field: string, direction: OrderDirection = 'ASC'): OrderBuilder {
    this.orders.push({
      field,
      direction
    });
    return this;
  }

  public orderByDesc(field: string): OrderBuilder {
    return this.orderBy(field, 'DESC');
  }

  public clearOrderBy(): OrderBuilder {
    this.orders = [];
    return this;
  }

  public build(): { sql: string; values: any[] } {
    if (this.orders.length === 0) {
      return { sql: '', values: [] };
    }

    const orderClauses = this.orders.map(order => 
      `${order.field} ${order.direction}`
    );

    return {
      sql: ` ORDER BY ${orderClauses.join(', ')}`,
      values: []
    };
  }
}