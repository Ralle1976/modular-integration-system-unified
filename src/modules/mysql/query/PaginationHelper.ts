export interface PaginationOptions {
  page?: number;
  perPage?: number;
  offset?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
}

export class PaginationHelper {
  private options: Required<PaginationOptions>;

  constructor(options: PaginationOptions = {}) {
    this.options = {
      page: options.page || 1,
      perPage: options.perPage || 10,
      offset: options.offset || 0,
      limit: options.limit || 10
    };

    // If page/perPage is set, override offset/limit
    if (options.page || options.perPage) {
      this.options.offset = (this.options.page - 1) * this.options.perPage;
      this.options.limit = this.options.perPage;
    }
  }

  public build(): { sql: string; values: any[] } {
    return {
      sql: ` LIMIT ? OFFSET ?`,
      values: [this.options.limit, this.options.offset]
    };
  }

  public async paginate<T>(
    dataQuery: () => Promise<T[]>,
    countQuery: () => Promise<number>
  ): Promise<PaginationResult<T>> {
    const [data, total] = await Promise.all([
      dataQuery(),
      countQuery()
    ]);

    const lastPage = Math.ceil(total / this.options.perPage);

    return {
      data,
      total,
      page: this.options.page,
      perPage: this.options.perPage,
      lastPage,
      hasMore: this.options.page < lastPage
    };
  }
}