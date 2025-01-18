import { Pool, PoolConnection, createPool } from 'mysql2/promise';
import { Logger } from '../../core/logger';

export class MySQLModule {
  private static instance: MySQLModule;
  private pool: Pool;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
    this.initializePool();
  }

  private initializePool(): void {
    this.pool = createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  public static getInstance(): MySQLModule {
    if (!MySQLModule.instance) {
      MySQLModule.instance = new MySQLModule();
    }
    return MySQLModule.instance;
  }

  public async getConnection(): Promise<PoolConnection> {
    try {
      return await this.pool.getConnection();
    } catch (error) {
      this.logger.error('Failed to get database connection', { error });
      throw error;
    }
  }
}