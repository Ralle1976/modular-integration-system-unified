interface QueryResult {
  id: number;
  name: string;
  value: number;
  timestamp: Date;
}

interface FilterCriteria {
  minValue?: number;
  maxValue?: number;
  fromDate?: Date;
  toDate?: Date;
}

class AdvancedQueryExample {
  private data: QueryResult[];

  constructor() {
    this.data = [];
  }

  public async executeQuery(
    criteria: FilterCriteria
  ): Promise<QueryResult[]> {
    // Simuliere asynchrone Datenbankabfrage
    await new Promise(resolve => setTimeout(resolve, 100));

    return this.data.filter(item => {
      let matches = true;

      if (criteria.minValue !== undefined) {
        matches = matches && item.value >= criteria.minValue;
      }
      if (criteria.maxValue !== undefined) {
        matches = matches && item.value <= criteria.maxValue;
      }
      if (criteria.fromDate !== undefined) {
        matches = matches && item.timestamp >= criteria.fromDate;
      }
      if (criteria.toDate !== undefined) {
        matches = matches && item.timestamp <= criteria.toDate;
      }

      return matches;
    });
  }

  public async addData(newData: QueryResult[]): Promise<void> {
    // Simuliere asynchrone Datenbankoperation
    await new Promise(resolve => setTimeout(resolve, 50));
    this.data.push(...newData);
    this.logger.info(`Added ${newData.length} new records`);
  }

  public async aggregateResults(
    results: QueryResult[]
  ): Promise<{ total: number; average: number }> {
    if (results.length === 0) {
      return { total: 0, average: 0 };
    }

    const total = results.reduce((sum, item) => sum + item.value, 0);
    const average = total / results.length;

    this.logger.info(`Aggregated ${results.length} results`);
    return { total, average };
  }

  private readonly logger = {
    info: (message: string) => {
      // Verwende structured logging statt console
      const logEntry = {
        level: 'info',
        timestamp: new Date().toISOString(),
        message,
        component: 'AdvancedQueryExample'
      };
      // Log an einen zentralen Logger-Service senden
      process.emit('log', logEntry);
    }
  };
}